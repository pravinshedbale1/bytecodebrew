import { useSyncExternalStore } from 'react';
import { firebaseEnabled, useEmulator } from '../config/firebase';
import { loadAuth } from '../lib/firebase';

/**
 * Google sign-in state, shared by the whole app.
 * status: 'disabled' (no Firebase config) | 'loading' | 'signed-out' | 'signed-in'
 */
let state = { status: firebaseEnabled ? 'loading' : 'disabled', user: null, error: null };
const listeners = new Set();
let started = false;

function set(next) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

/**
 * A sign-in lasts 7 days. Firebase would otherwise keep a user signed in forever (it refreshes
 * its tokens silently), so the app signs them out itself once 7 days have passed since they last
 * signed in with Google, counted from Firebase's own record of that sign-in (the same on every device).
 */
export const SESSION_DAYS = 7;
const SESSION_MS = SESSION_DAYS * 24 * 60 * 60 * 1000;
export const EXPIRED_MESSAGE = `For your security, sign-ins last ${SESSION_DAYS} days. Sign in again to keep your progress syncing.`;
let expiryTimer = null;

/** When this user's sign-in expires (ms since 1970), or null if Firebase doesn't say when they signed in. */
export function expiresAt(u) {
  const t = Date.parse(u?.metadata?.lastSignInTime ?? '');
  return Number.isFinite(t) ? t + SESSION_MS : null;
}

function watchExpiry(u) {
  clearTimeout(expiryTimer);
  expiryTimer = null;
  const at = expiresAt(u);
  if (at === null) return false;
  if (Date.now() >= at) {
    signOutUser({ expired: true });
    return true;
  }
  // setTimeout can't wait more than ~24.8 days; 7 days fits. Sleeping devices are covered by the
  // visibility check below, since timers don't run while a laptop is closed.
  expiryTimer = setTimeout(() => signOutUser({ expired: true }), at - Date.now());
  return false;
}

function start() {
  if (started || !firebaseEnabled) return;
  started = true;
  loadAuth().then((fb) => {
    fb.authMod.onAuthStateChanged(fb.auth, (u) => {
      if (u && watchExpiry(u)) return;    // expired: signOut() will report signed-out
      if (!u) { clearTimeout(expiryTimer); expiryTimer = null; }
      set(u
        ? { status: 'signed-in', user: { uid: u.uid, name: u.displayName, email: u.email, emailVerified: u.emailVerified, photo: u.photoURL }, error: null }
        : { status: 'signed-out', user: null });
    });
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && fb.auth.currentUser) watchExpiry(fb.auth.currentUser);
      });
    }
  }).catch(() => set({ status: 'signed-out', error: 'Could not reach the sign-in service.' }));
}

/** Listen to auth changes outside React (used by the sync layer). */
export function onAuth(listener) {
  start();
  const wrapped = () => listener(state);     // store listeners are called without arguments
  listeners.add(wrapped);
  listener(state);
  return () => listeners.delete(wrapped);
}

export async function signIn() {
  const fb = await loadAuth();
  if (!fb) return;
  set({ error: null });
  try {
    await fb.authMod.signInWithPopup(fb.auth, new fb.authMod.GoogleAuthProvider());
  } catch (e) {
    // closing the popup is not an error worth showing
    if (e?.code !== 'auth/popup-closed-by-user' && e?.code !== 'auth/cancelled-popup-request') {
      set({ error: e?.code === 'auth/popup-blocked' ? 'Your browser blocked the sign-in popup. Allow popups for this site and try again.' : 'Sign-in failed. Please try again.' });
    }
  }
}

export async function signOutUser({ expired = false } = {}) {
  const fb = await loadAuth();
  if (fb) await fb.authMod.signOut(fb.auth);
  if (expired) set({ status: 'signed-out', user: null, error: EXPIRED_MESSAGE });
  // the Claude API key belongs to the account (src/lib/claude.js): don't leave a copy in this browser
  try { localStorage.removeItem('bcb:anthropic-key'); } catch { /* ignore */ }
}

if (useEmulator && typeof window !== 'undefined') {
  // Test hook for the local emulator only: sign in as a fake Google user without a popup.
  window.__bcbEmulatorSignIn = async (email = 'learner@example.com') => {
    const fb = await loadAuth();
    const cred = fb.authMod.GoogleAuthProvider.credential(JSON.stringify({ sub: email, email, name: 'Test Learner', email_verified: true }));
    return fb.authMod.signInWithCredential(fb.auth, cred);
  };
}

export function useAuth() {
  start();
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => state,
  );
}
