import { useSyncExternalStore } from 'react';
import { firebaseEnabled, useEmulator } from '../config/firebase';
import { loadFirebase } from '../lib/firebase';

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

function start() {
  if (started || !firebaseEnabled) return;
  started = true;
  loadFirebase().then((fb) => {
    fb.authMod.onAuthStateChanged(fb.auth, (u) => {
      set(u
        ? { status: 'signed-in', user: { uid: u.uid, name: u.displayName, email: u.email, emailVerified: u.emailVerified, photo: u.photoURL }, error: null }
        : { status: 'signed-out', user: null });
    });
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
  const fb = await loadFirebase();
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

export async function signOutUser() {
  const fb = await loadFirebase();
  if (fb) await fb.authMod.signOut(fb.auth);
}

if (useEmulator && typeof window !== 'undefined') {
  // Test hook for the local emulator only: sign in as a fake Google user without a popup.
  window.__bcbEmulatorSignIn = async (email = 'learner@example.com') => {
    const fb = await loadFirebase();
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
