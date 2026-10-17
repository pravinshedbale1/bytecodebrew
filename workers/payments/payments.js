import { verifyIdToken, AuthError } from '../shared/auth.js';
import { firestore } from '../shared/firestore.js';
import { createOrder, getOrder, verifyWebhook, CashfreeError } from './cashfree.js';

/**
 * Premium purchases through Cashfree.
 *
 *   POST /pay/order    { planId, phone }   signed in → { orderId, paymentSessionId, mode }
 *   POST /pay/verify   { orderId }         signed in → { status, expiresAt? }   (called when the buyer returns)
 *   POST /pay/webhook                      from Cashfree, signature-checked
 *
 * The price always comes from plans/{planId} in Firestore (set by the admin), never from the client.
 * A paid order is applied exactly once: it is claimed with an optimistic-concurrency update, and the
 * entitlement records the orders it has applied, so a webhook and a "verify" racing each other, or a
 * retry after a crash, never extend premium twice.
 *
 * env: FIREBASE_PROJECT_ID, FIREBASE_SERVICE_ACCOUNT (JSON), CASHFREE_APP_ID, CASHFREE_SECRET_KEY,
 *      CASHFREE_ENV ('sandbox' | 'production'), SITE_URL, PUBLIC_URL
 *      (tests and local development: CASHFREE_BASE, FIRESTORE_EMULATOR, AUTH_EMULATOR)
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

const cleanPhone = (raw) => {
  const digits = String(raw ?? '').replace(/[\s-]/g, '').replace(/^(\+?91)(?=\d{10}$)/, '');
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
};

/** Create a Cashfree order for an active plan. */
export async function startOrder(request, env) {
  const user = await signedIn(request, env);
  const { planId, phone } = await request.json().catch(() => ({}));
  const mobile = cleanPhone(phone);
  if (!mobile) throw new HttpError(400, 'Enter a valid 10-digit Indian mobile number (Cashfree needs it for the payment).');
  if (typeof planId !== 'string' || !/^[a-z0-9-]{1,40}$/.test(planId)) throw new HttpError(400, 'Unknown plan.');

  const store = db(env);
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
    createdAt: new Date(),
  });

  let cf;
  try {
    cf = await createOrder(env, {
      order_id: orderId,
      order_amount: amount,
      order_currency: 'INR',
      customer_details: {
        customer_id: user.sub.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 50),
        customer_email: user.email,
        customer_phone: mobile,
        ...(user.name ? { customer_name: String(user.name).slice(0, 100) } : {}),
      },
      order_meta: {
        return_url: `${env.SITE_URL}/premium?order_id={order_id}`,
        notify_url: `${env.PUBLIC_URL}/pay/webhook`,
      },
      order_note: `ByteCodeBrew ${plan.name}`.slice(0, 200),
    });
  } catch (e) {
    await store.update(`orders/${orderId}`, { status: 'failed', error: String(e.message).slice(0, 200) });
    if (e instanceof CashfreeError) throw new HttpError(502, 'The payment service could not start the payment. Please try again.');
    throw e;
  }
  await store.update(`orders/${orderId}`, { cfOrderId: String(cf.cf_order_id ?? '') });
  return { orderId, paymentSessionId: cf.payment_session_id, mode: env.CASHFREE_ENV === 'production' ? 'production' : 'sandbox' };
}

/**
 * Apply a paid order: confirm with Cashfree, claim the order, extend (or create) the entitlement.
 * Safe to call any number of times, concurrently, for the same order.
 */
export async function fulfil(env, orderId) {
  const store = db(env);
  const read = await store.getWithMeta(`orders/${orderId}`);
  if (!read) throw new HttpError(404, 'Unknown order.');
  const order = read.data;
  if (order.status === 'paid') return { status: 'paid', expiresAt: order.expiresAt ?? null };

  const cf = await getOrder(env, orderId);
  if (cf.order_status !== 'PAID') {
    if (['EXPIRED', 'TERMINATED'].includes(cf.order_status) && order.status === 'created') {
      await store.update(`orders/${orderId}`, { status: cf.order_status.toLowerCase() });
    }
    return { status: cf.order_status.toLowerCase() };
  }
  if (Number(cf.order_amount) !== Number(order.amount) || (cf.order_currency ?? 'INR') !== order.currency) {
    await store.update(`orders/${orderId}`, { status: 'review', error: `Paid amount ${cf.order_amount} ${cf.order_currency} does not match the order` });
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
      addedBy: 'cashfree',
      source: 'cashfree',
      plan: order.planId,
      orderIds: [...applied, orderId].slice(-50),
      ...(expiresAt ? { expiresAt } : {}),
    });
  }
  await store.update(`orders/${orderId}`, { status: 'paid', paidAt: new Date(), cfPaymentStatus: 'PAID', ...(expiresAt ? { expiresAt } : {}) });
  return { status: 'paid', expiresAt };
}

/** The buyer is back from the payment page: check and apply their order. */
export async function verify(request, env) {
  const user = await signedIn(request, env);
  const { orderId } = await request.json().catch(() => ({}));
  if (typeof orderId !== 'string' || !/^bcb_[a-z0-9_]{5,60}$/.test(orderId)) throw new HttpError(400, 'Unknown order.');
  const order = await db(env).get(`orders/${orderId}`);
  if (!order || order.uid !== user.sub) throw new HttpError(404, 'Unknown order.');
  return fulfil(env, orderId);
}

/** Cashfree's server-to-server notification. Only the order ID is trusted; the status is re-read from Cashfree. */
export async function webhook(request, env) {
  const raw = await request.text();
  const ok = await verifyWebhook(raw, request.headers.get('x-webhook-timestamp'), request.headers.get('x-webhook-signature'), env.CASHFREE_SECRET_KEY);
  if (!ok) throw new HttpError(401, 'Bad signature');
  const body = JSON.parse(raw);
  const orderId = body?.data?.order?.order_id;
  if (typeof orderId !== 'string' || !orderId.startsWith('bcb_')) return { ignored: true };
  if (!/PAYMENT_SUCCESS/.test(body.type ?? '')) return { ignored: true, type: body.type };
  return fulfil(env, orderId);
}

/** Route a request under /pay/*. Returns [status, body]. */
export async function route(request, env) {
  const { pathname } = new URL(request.url);
  try {
    if (request.method !== 'POST') throw new HttpError(405, 'Use POST');
    if (pathname.endsWith('/pay/order')) return [200, await startOrder(request, env)];
    if (pathname.endsWith('/pay/verify')) return [200, await verify(request, env)];
    if (pathname.endsWith('/pay/webhook')) return [200, await webhook(request, env)];
    throw new HttpError(404, 'Not found');
  } catch (e) {
    if (e instanceof HttpError) return [e.status, { error: e.message }];
    console.error(e);
    return [500, { error: 'Something went wrong. If you were charged, your premium will be applied automatically; otherwise please try again.' }];
  }
}
