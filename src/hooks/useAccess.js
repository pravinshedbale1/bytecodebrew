import { useSyncExternalStore } from 'react';
import { onAuth } from './useAuth';
import { loadFirebase } from '../lib/firebase';
import { setPremiumSync } from '../lib/syncedStore';
import { firebaseEnabled } from '../config/firebase';
import { isAdminEmail } from '../config/access';

/**
 * Access level of the current visitor, shared by the whole app:
 *   'loading'    working it out
 *   'signed-out' not signed in
 *   'free'       signed in, not approved
 *   'premium'    approved by the admin (or the admin)
 * Approval is a document entitlements/{email} that only the admin can write; the user may read their own.
 * Firestore rules enforce the same thing for synced data, so this is the UI's view, not the only guard.
 */
let state = { status: firebaseEnabled ? 'loading' : 'premium', isAdmin: false, email: null };
const listeners = new Set();
let started = false;
let stopWatch = null;
let watching = null;

function set(next) {
  state = { ...state, ...next };
  setPremiumSync(state.status === 'premium');
  listeners.forEach((l) => l());
}

async function watch(user) {
  const email = (user.email ?? '').toLowerCase();
  if (watching === email) return;
  stopWatch?.();
  watching = email;
  if (isAdminEmail(email) && user.emailVerified) {
    set({ status: 'premium', isAdmin: true, email });
    return;
  }
  set({ status: 'loading', isAdmin: false, email });
  const fb = await loadFirebase();
  stopWatch = fb.fsMod.onSnapshot(
    fb.fsMod.doc(fb.db, 'entitlements', email),
    (snap) => set({ status: snap.exists() && snap.data().premium === true ? 'premium' : 'free' }),
    () => set({ status: 'free' }),
  );
}

function start() {
  if (started || !firebaseEnabled) return;
  started = true;
  onAuth((auth) => {
    if (auth.status === 'signed-in') watch(auth.user);
    else if (auth.status === 'signed-out') {
      stopWatch?.();
      stopWatch = null;
      watching = null;
      set({ status: 'signed-out', isAdmin: false, email: null });
    }
  });
}

export function useAccess() {
  start();
  return useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, () => state);
}

/** True once the visitor has premium access. */
export const usePremium = () => useAccess().status === 'premium';
