import { PAYMENTS_API } from '../config/services';
import { loadFirebase } from './firebase';

/** Active plans, cheapest first (public Firestore collection, edited on /admin). */
export async function listPlans({ includeInactive = false } = {}) {
  const fb = await loadFirebase();
  if (!fb) return [];
  const snap = await fb.fsMod.getDocs(fb.fsMod.collection(fb.db, 'plans'));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((p) => includeInactive || p.active)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.price - b.price);
}

async function call(path, body) {
  const fb = await loadFirebase();
  const user = fb?.auth.currentUser;
  if (!user) throw new Error('Sign in with Google first.');
  const token = await user.getIdToken();
  let res;
  try {
    res = await fetch(`${PAYMENTS_API}/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('Could not reach the payment service. Check your connection and try again.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `Payment request failed (${res.status}).`);
  return data;
}

let sdk = null;
/** Razorpay's checkout script (https://checkout.razorpay.com/v1/checkout.js), loaded only when someone pays. */
function loadRazorpay() {
  sdk ??= new Promise((resolve, reject) => {
    if (window.Razorpay) { resolve(window.Razorpay); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.async = true;
    s.onload = () => resolve(window.Razorpay);
    s.onerror = () => { sdk = null; reject(new Error('Could not load the Razorpay checkout. Check your connection or ad blocker.')); };
    document.head.appendChild(s);
  });
  return sdk;
}

export class CheckoutCancelled extends Error {}

const returnUrl = (orderId, paymentId, signature) =>
  `/premium?order_id=${encodeURIComponent(orderId)}${paymentId ? `&payment_id=${encodeURIComponent(paymentId)}&signature=${encodeURIComponent(signature ?? '')}` : ''}`;

/**
 * Create an order on the server (which sets the price) and open Razorpay Checkout as a pop-up.
 * `beforeOpen` runs just before the pop-up opens (close any dialog of ours so it can't sit on top).
 * On success the buyer is taken to /premium?order_id=…, which confirms the payment; closing the pop-up
 * without paying rejects with CheckoutCancelled.
 */
export async function startCheckout(planId, { beforeOpen } = {}) {
  const o = await call('order', { planId });
  if (o.mockCheckoutUrl) {           // local development: the dev server's pretend checkout
    window.location.assign(o.mockCheckoutUrl);
    return o.orderId;
  }
  const Razorpay = await loadRazorpay();
  return new Promise((resolve, reject) => {
    const checkout = new Razorpay({
      key: o.keyId,
      order_id: o.razorpayOrderId,
      amount: o.amount,
      currency: o.currency,
      name: 'ByteCodeBrew',
      description: o.description,
      prefill: o.prefill,
      notes: { orderId: o.orderId },
      theme: { color: '#1f6f6b' },
      handler: (r) => {
        resolve(o.orderId);
        window.location.assign(returnUrl(o.orderId, r.razorpay_payment_id, r.razorpay_signature));
      },
      modal: { ondismiss: () => reject(new CheckoutCancelled('Payment cancelled. You have not been charged.')) },
    });
    beforeOpen?.();
    checkout.open();
  });
}

/** After checkout: confirm the payment and apply premium (idempotent). */
export const verifyOrder = (orderId, { paymentId, signature } = {}) =>
  call('verify', { orderId, ...(paymentId && signature ? { paymentId, signature } : {}) });

/** Admin only: every account that has signed in (from Firebase Authentication, via the payments Worker). */
export const listRegisteredUsers = () => call('admin/users', {});
