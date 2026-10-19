import { verifyIdToken, AuthError, ADMIN_EMAILS } from '../shared/auth.js';
import { firestore } from '../shared/firestore.js';
import { createOrder, getOrder, verifyWebhook, verifyPaymentSignature, keyMode, RazorpayError } from './razorpay.js';
import { listUsers } from './admin.js';

/**
 * Premium purchases through Razorpay (Standard Checkout: a pop-up on our page).
 *
 *   POST /pay/order    { planId }                         signed in → what Razorpay Checkout needs
 *   POST /pay/verify   { orderId, paymentId?, signature? } signed in → { status, expiresAt? }
 *                                                         (called from Checkout's success handler)
 *   POST /pay/webhook                                     from Razorpay (order.paid, payment.captured), signature-checked
 *   POST /pay/admin/users                                 the admin → every registered account (admin.js)
 *
 * The admin can pause new purchases (settings/sales { open: false, message } in Firestore, set on /admin):
 * /pay/order then refuses with that message. Orders already started can still be completed and verified.
 *
 * The price always comes from plans/{planId} in Firestore (set by the admin), never from the client, and
 * a payment only counts when Razorpay itself reports the order as paid for the full amount.
 * A paid order is applied exactly once: it is claimed with an optimistic-concurrency update, and the
 * entitlement records the orders it has applied, so a webhook and a "verify" racing each other, or a
 * retry after a crash, never extend premium twice.
 *
 * env: FIREBASE_PROJECT_ID, FIREBASE_SERVICE_ACCOUNT (JSON), RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET,
 *      RAZORPAY_WEBHOOK_SECRET, SITE_URL
 *      (tests and local development: RAZORPAY_BASE, FIRESTORE_EMULATOR, AUTH_EMULATOR)
 */

const DAY = 86_400_000;
const STALE_CLAIM_MS = 2 * 60_000;

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function db(env) {
  return firestore({
    projectId: env.FIREBASE_PROJECT_ID,
    emulator: env.FIRESTORE_EMULATOR,
    serviceAccount: env.FIRESTORE_EMULATOR ? null : JSON.parse(env.FIREBASE_SERVICE_ACCOUNT ?? '{}'),
  });
}

async function signedIn(request, env) {
  const token = /^Bearer (.+)$/.exec(request.headers.get('Authorization') ?? '')?.[1];
  try {
    return await verifyIdToken(token, { projectId: env.FIREBASE_PROJECT_ID, emulator: Boolean(env.AUTH_EMULATOR) });
  } catch (e) {
    if (e instanceof AuthError) throw new HttpError(e.status, e.message === 'Sign in to use LeetCode sync.' ? 'Sign in to buy premium.' : e.message);
    throw e;
  }
}

async function admin(request, env) {
  const user = await signedIn(request, env);
  if (!ADMIN_EMAILS.includes(user.email.toLowerCase())) throw new HttpError(403, 'Only the admin can do this.');
  return user;
}

const ORDER_ID = /^bcb_[a-z0-9_]{5,60}$/;
export const SALES_PAUSED = 'New subscriptions are temporarily paused. If you already have Premium, nothing changes for you. Please check back soon.';

/** Create a Razorpay order for an active plan; returns what Razorpay Checkout needs to open. */
export async function startOrder(request, env) {
  const user = await signedIn(request, env);
  const { planId } = await request.json().catch(() => ({}));
  if (typeof planId !== 'string' || !/^[a-z0-9-]{1,40}$/.test(planId)) throw new HttpError(400, 'Unknown plan.');

  const store = db(env);
  const sales = await store.get('settings/sales');
  if (sales?.open === false) throw new HttpError(403, sales.message?.trim() || SALES_PAUSED);
  const plan = await store.get(`plans/${planId}`);
  if (!plan || plan.active !== true || !(plan.price >= 1)) throw new HttpError(400, 'This plan is not available.');

  const orderId = `bcb_${Date.now().toString(36)}_${crypto.randomUUID().replace(/-/g, '').slice(0, 10)}`;
  const amount = Math.round(plan.price * 100) / 100;
  await store.create(`orders/${orderId}`, {
    uid: user.sub,
    email: user.email.toLowerCase(),
    planId,
    planName: plan.name,
    durationDays: plan.durationDays ?? 0,
    amount,
    currency: 'INR',
    status: 'created',
    gateway: 'razorpay',
    createdAt: new Date(),
  });

  let rp;
  try {
    rp = await createOrder(env, {
      amount: Math.round(amount * 100),          // paise
      currency: 'INR',
      receipt: orderId,
      notes: { orderId, planId, email: user.email.toLowerCase() },
    });
  } catch (e) {
    await store.update(`orders/${orderId}`, { status: 'failed', error: String(e.message).slice(0, 200) });
    if (e instanceof RazorpayError) throw new HttpError(502, 'The payment service could not start the payment. Please try again.');
    throw e;
  }
  await store.update(`orders/${orderId}`, { razorpayOrderId: rp.id });
  return {
    orderId,
    keyId: env.RAZORPAY_KEY_ID,
    razorpayOrderId: rp.id,
    amount: rp.amount,
    currency: rp.currency,
    description: `${plan.name}`.slice(0, 250),
    prefill: { email: user.email, ...(user.name ? { name: String(user.name).slice(0, 100) } : {}) },
    mode: keyMode(env.RAZORPAY_KEY_ID),
  };
}

/**
 * Apply a paid order: confirm with Razorpay, claim the order, extend (or create) the entitlement.
 * Safe to call any number of times, concurrently, for the same order.
 */
export async function fulfil(env, orderId) {
  const store = db(env);
  const read = await store.getWithMeta(`orders/${orderId}`);
  if (!read) throw new HttpError(404, 'Unknown order.');
  const order = read.data;
  if (order.status === 'paid') return { status: 'paid', expiresAt: order.expiresAt ?? null };

  if (!order.razorpayOrderId) return { status: order.status };
  const rp = await getOrder(env, order.razorpayOrderId);
  // 'created' = not paid yet, 'attempted' = a payment was tried but hasn't succeeded (yet), 'paid' = captured
  if (rp.status !== 'paid') return { status: rp.status === 'attempted' ? 'pending' : 'created' };
  if (Number(rp.amount_paid) !== Math.round(Number(order.amount) * 100) || (rp.currency ?? 'INR') !== order.currency || rp.receipt !== orderId) {
    await store.update(`orders/${orderId}`, { status: 'review', error: `Paid ${rp.amount_paid} paise ${rp.currency} for receipt ${rp.receipt} does not match the order` });
    throw new HttpError(409, 'The payment does not match the order. We will review it and contact you.');
  }

  // Claim the order so only one caller applies it (a stale claim from a crashed caller can be re-taken)
  const claimable = order.status !== 'granting' || Date.now() - (order.claimedAt?.getTime?.() ?? 0) > STALE_CLAIM_MS;
  if (!claimable) return { status: 'processing' };
  const won = await store.update(`orders/${orderId}`, { status: 'granting', claimedAt: new Date() }, { ifUpdateTime: read.updateTime });
  if (!won) return { status: 'processing' };

  const entPath = `entitlements/${order.email}`;
  const ent = await store.get(entPath);
  const applied = ent?.orderIds ?? [];
  let expiresAt = ent?.expiresAt ?? null;
  if (!applied.includes(orderId)) {
    const lifetime = ent?.premium === true && !ent.expiresAt;          // already unlimited (admin grant or lifetime plan)
    if (lifetime || !(order.durationDays > 0)) expiresAt = null;
    else {
      const from = Math.max(Date.now(), ent?.premium === true && ent.expiresAt ? ent.expiresAt.getTime() : 0);
      expiresAt = new Date(from + order.durationDays * DAY);
    }
    await store.set(entPath, {
      premium: true,
      note: `${order.planName} (paid)`,
      addedAt: ent?.addedAt ?? new Date(),
      addedBy: 'razorpay',
      source: 'razorpay',
      plan: order.planId,
      orderIds: [...applied, orderId].slice(-50),
      ...(expiresAt ? { expiresAt } : {}),
    });
  }
  await store.update(`orders/${orderId}`, { status: 'paid', paidAt: new Date(), ...(expiresAt ? { expiresAt } : {}) });
  return { status: 'paid', expiresAt };
}

/**
 * Checkout's success handler: check and apply the buyer's order. The signature (when sent) must be
 * valid, but premium is only granted after Razorpay itself confirms the order is paid.
 */
export async function verify(request, env) {
  const user = await signedIn(request, env);
  const { orderId, paymentId, signature } = await request.json().catch(() => ({}));
  if (typeof orderId !== 'string' || !ORDER_ID.test(orderId)) throw new HttpError(400, 'Unknown order.');
  const order = await db(env).get(`orders/${orderId}`);
  if (!order || order.uid !== user.sub) throw new HttpError(404, 'Unknown order.');
  if (signature && !(await verifyPaymentSignature({ orderId: order.razorpayOrderId, paymentId, signature }, env.RAZORPAY_KEY_SECRET))) {
    throw new HttpError(400, 'The payment confirmation could not be verified.');
  }
  return fulfil(env, orderId);
}

/**
 * Razorpay's server-to-server notification (subscribe to order.paid and payment.captured).
 * Only the order is taken from it; the status is always re-read from Razorpay.
 */
export async function webhook(request, env) {
  const raw = await request.text();
  if (!(await verifyWebhook(raw, request.headers.get('x-razorpay-signature'), env.RAZORPAY_WEBHOOK_SECRET))) throw new HttpError(401, 'Bad signature');
  const body = JSON.parse(raw);
  if (!['order.paid', 'payment.captured'].includes(body.event)) return { ignored: true, event: body.event };
  let orderId = body.payload?.order?.entity?.receipt;
  if (!orderId) {
    // payment.captured carries Razorpay's order id; our order id is that order's receipt
    const rpOrderId = body.payload?.payment?.entity?.order_id;
    if (!rpOrderId) return { ignored: true };
    orderId = (await getOrder(env, rpOrderId)).receipt;
  }
  if (typeof orderId !== 'string' || !ORDER_ID.test(orderId)) return { ignored: true };
  try {
    return await fulfil(env, orderId);
  } catch (e) {
    // An order we don't have (e.g. made in a local test against the live keys): acknowledge it, or Razorpay
    // keeps retrying and eventually disables the webhook.
    if (e instanceof HttpError && e.status === 404) return { ignored: true, reason: 'unknown order' };
    throw e;
  }
}

/** Route a request under /pay/*. Returns [status, body]. */
export async function route(request, env) {
  const { pathname } = new URL(request.url);
  try {
    if (request.method !== 'POST') throw new HttpError(405, 'Use POST');
    if (pathname.endsWith('/pay/order')) return [200, await startOrder(request, env)];
    if (pathname.endsWith('/pay/verify')) return [200, await verify(request, env)];
    if (pathname.endsWith('/pay/webhook')) return [200, await webhook(request, env)];
    if (pathname.endsWith('/pay/admin/users')) { await admin(request, env); return [200, await listUsers(env)]; }
    throw new HttpError(404, 'Not found');
  } catch (e) {
    if (e instanceof HttpError) return [e.status, { error: e.message }];
    console.error(e);
    return [500, { error: 'Something went wrong. If you were charged, your premium will be applied automatically; otherwise please try again.' }];
  }
}
