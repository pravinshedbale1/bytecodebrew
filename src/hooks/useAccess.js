import { useSyncExternalStore } from 'react';
import { onAuth } from './useAuth';
import { loadFirebase } from '../lib/firebase';
import { setPremiumSync } from '../lib/syncedStore';
import { firebaseEnabled } from '../config/firebase';
import { isAdminEmail, PREMIUM_CONTENT } from '../config/access';

/**
 * Access level of the current visitor, shared by the whole app:
 *   'loading'    working it out
 *   'signed-out' not signed in
 *   'free'       signed in, not approved
 *   'premium'    approved by the admin (or the admin)
 * Access is a document entitlements/{email}, written by the admin or by the payments Worker after a
 * payment; it may carry an expiresAt. The user may read their own.
 * Firestore rules enforce the same thing for synced data, so this is the UI's view, not the only guard.
 */
let state = { status: firebaseEnabled ? 'loading' : 'premium', isAdmin: false, email: null, expiresAt: null, source: null };
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
  let expiryTimer = null;
  const unsub = fb.fsMod.onSnapshot(
    fb.fsMod.doc(fb.db, 'entitlements', email),
    (snap) => {
      clearTimeout(expiryTimer);
      const d = snap.exists() ? snap.data() : null;
      const expiresAt = d?.expiresAt?.toMillis?.() ?? null;
      const active = d?.premium === true && (expiresAt === null || expiresAt > Date.now());
      set({ status: active ? 'premium' : 'free', expiresAt: active ? expiresAt : null, source: d?.source ?? (d ? 'admin' : null) });
      // Switch back to free the moment a time-limited plan runs out (timers cap at ~24 days)
      if (active && expiresAt) expiryTimer = setTimeout(() => set({ status: 'free', expiresAt: null }), Math.min(expiresAt - Date.now(), 2 ** 31 - 1));
    },
    () => set({ status: 'free' }),
  );
  stopWatch = () => { clearTimeout(expiryTimer); unsub(); };
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

/** (lesson) => true when the lesson is locked for this visitor (advanced lessons, unless premium). */
export function useLessonLocked() {
  const { status } = useAccess();
  return (lesson) => PREMIUM_CONTENT.advancedLessons && lesson?.level === 'Advanced' && status !== 'premium' && status !== 'loading';
}
