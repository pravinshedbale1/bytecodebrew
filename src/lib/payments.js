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
/** Cashfree's checkout script (https://sdk.cashfree.com/js/v3/cashfree.js), loaded only when someone pays. */
function loadCashfree() {
  sdk ??= new Promise((resolve, reject) => {
    if (window.Cashfree) { resolve(window.Cashfree); return; }
    const s = document.createElement('script');
    s.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    s.async = true;
    s.onload = () => resolve(window.Cashfree);
    s.onerror = () => { sdk = null; reject(new Error('Could not load the Cashfree checkout. Check your connection or ad blocker.')); };
    document.head.appendChild(s);
  });
  return sdk;
}

/**
 * Create an order on the server (which sets the price) and go to Cashfree's checkout. Cashfree sends
 * the buyer back to /premium?order_id=… when they finish.
 */
export async function startCheckout(planId, phone) {
  const { orderId, paymentSessionId, mode, mockCheckoutUrl } = await call('order', { planId, phone });
  if (mockCheckoutUrl) {           // local development: the dev server's pretend checkout
    window.location.assign(mockCheckoutUrl);
    return orderId;
  }
  const Cashfree = await loadCashfree();
  const cashfree = Cashfree({ mode });
  await cashfree.checkout({ paymentSessionId, redirectTarget: '_self' });
  return orderId;
}

/** After returning from checkout: confirm the payment and apply premium (idempotent). */
export const verifyOrder = (orderId) => call('verify', { orderId });
