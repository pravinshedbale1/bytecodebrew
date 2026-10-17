/**
 * Cashfree Payment Gateway (PG) API, version 2023-08-01.
 * Docs: https://www.cashfree.com/docs/api-reference/payments/latest/orders/create
 */
export const API_VERSION = '2023-08-01';

export function cashfreeBase(env) {
  if (env.CASHFREE_BASE) return env.CASHFREE_BASE;          // a mock server in local tests
  return env.CASHFREE_ENV === 'production' ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg';
}

function headers(env) {
  return {
    'Content-Type': 'application/json',
    'x-api-version': API_VERSION,
    'x-client-id': env.CASHFREE_APP_ID,
    'x-client-secret': env.CASHFREE_SECRET_KEY,
  };
}

export class CashfreeError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function call(env, path, init) {
  const res = await fetch(`${cashfreeBase(env)}${path}`, { ...init, headers: headers(env) });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new CashfreeError(res.status, body.message ?? `Cashfree request failed (${res.status})`);
  return body;
}

/** Create an order; returns { order_id, cf_order_id, payment_session_id, order_status, … }. */
export const createOrder = (env, order) => call(env, '/orders', { method: 'POST', body: JSON.stringify(order) });

/** Current state of an order; order_status is ACTIVE, PAID, EXPIRED or TERMINATED. */
export const getOrder = (env, orderId) => call(env, `/orders/${encodeURIComponent(orderId)}`, { method: 'GET' });

/**
 * Webhook signature: Base64(HMAC-SHA256(timestamp + rawBody, secretKey)), sent in the
 * x-webhook-signature header with the timestamp in x-webhook-timestamp.
 */
export async function verifyWebhook(rawBody, timestamp, signature, secret) {
  if (!timestamp || !signature || !secret) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(timestamp + rawBody));
  const expected = btoa(String.fromCharCode(...new Uint8Array(mac)));
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0;
}

export async function signWebhook(rawBody, timestamp, secret) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(timestamp + rawBody));
  return btoa(String.fromCharCode(...new Uint8Array(mac)));
}
