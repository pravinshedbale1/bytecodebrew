/**
 * Razorpay Orders API (v1) and signature checks.
 * Docs: https://razorpay.com/docs/api/orders/ and https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/
 *
 * Test or live mode follows the key: rzp_test_… keys move no real money, rzp_live_… keys do.
 */
export function razorpayBase(env) {
  return env.RAZORPAY_BASE ?? 'https://api.razorpay.com/v1';   // RAZORPAY_BASE: a mock server in local tests
}

export const keyMode = (keyId) => (String(keyId).startsWith('rzp_live_') ? 'live' : 'test');

export class RazorpayError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function call(env, path, init = {}) {
  const res = await fetch(`${razorpayBase(env)}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`)}`,
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new RazorpayError(res.status, body.error?.description ?? `Razorpay request failed (${res.status})`);
  return body;
}

/**
 * Create an order. `amount` is in paise. Returns { id: 'order_…', amount, amount_paid, currency, receipt, status, … }.
 * Payments on it are captured automatically (Razorpay's default for orders), so a successful payment
 * turns the order's status to 'paid'.
 */
export const createOrder = (env, { amount, currency = 'INR', receipt, notes }) =>
  call(env, '/orders', { method: 'POST', body: JSON.stringify({ amount, currency, receipt, notes, payment_capture: 1 }) });

/** Current state of an order: status is 'created', 'attempted' or 'paid'. */
export const getOrder = (env, razorpayOrderId) => call(env, `/orders/${encodeURIComponent(razorpayOrderId)}`);

async function hmacHex(secret, message) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function equal(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Checkout's success callback: razorpay_signature = hex HMAC-SHA256(order_id + '|' + payment_id, key secret). */
export async function verifyPaymentSignature({ orderId, paymentId, signature }, keySecret) {
  if (!orderId || !paymentId || !signature || !keySecret) return false;
  return equal(await hmacHex(keySecret, `${orderId}|${paymentId}`), signature);
}

/** Webhooks: X-Razorpay-Signature = hex HMAC-SHA256(raw body, webhook secret). */
export async function verifyWebhook(rawBody, signature, webhookSecret) {
  if (!signature || !webhookSecret) return false;
  return equal(await hmacHex(webhookSecret, rawBody), signature);
}

export const signWebhook = (rawBody, webhookSecret) => hmacHex(webhookSecret, rawBody);
export const signPayment = (orderId, paymentId, keySecret) => hmacHex(keySecret, `${orderId}|${paymentId}`);
