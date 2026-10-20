import { useSyncExternalStore } from 'react';
import { readJSON, writeJSON } from './storage';
import { onAuth } from '../hooks/useAuth';
import { loadFirebase } from './firebase';
import { PREMIUM_STORES } from '../config/access';

/**
 * A small store that always saves to localStorage and, when the user is signed in,
 * mirrors itself to Firestore at users/{uid}/state/{name} as { json, updatedAt }.
 *
 * Sync rules:
 *  - First snapshot after sign-in: merge(local, remote), so nothing on this device or in the
 *    account is lost; the merged value is written back if it differs.
 *  - Later snapshots from other devices: adopt the remote value (so deletions propagate).
 *  - Local changes: saved immediately in the browser, written to Firestore after a short debounce.
 *
 * The value is stored as a JSON string so arbitrary keys (like "__lastVisited" or "a/b/c")
 * never clash with Firestore field-name rules.
 */
export const SYNCED_NAMES = [];

/*
 * "Delete my data" (src/lib/accountData.js) leaves a marker, users/{uid}/state/reset = { at }. A
 * browser whose data predates the marker must never upload it again: before any store syncs, the
 * marker is checked; if it is newer than what this browser has seen, the browser's learning data is
 * wiped and the page reloads. Open pages watch the marker and do the same the moment it changes,
 * and other tabs of this browser reload when it is recorded here.
 */
export const RESET_SEEN_KEY = 'bcb:reset-seen';
/** Browser keys that survive a reset: settings, not learning data (src/lib/accountData.js uses the same list). */
export const KEEP_KEYS = ['bcb:theme', 'bcb:lang', 'bcb:anthropic-key', RESET_SEEN_KEY];
export const KEEP_PREFIXES = ['bcb:split:'];

const seenReset = () => Number(readJSON(RESET_SEEN_KEY, 0)) || 0;
export const markResetSeen = (at) => writeJSON(RESET_SEEN_KEY, at);

/** Every learning-data key in this browser (localStorage and sessionStorage), prefixed "bcb:". */
export function learningKeys(storage, keep = KEEP_KEYS) {
  try {
    return Object.keys(storage).filter((k) => k.startsWith('bcb:') && !keep.includes(k) && !KEEP_PREFIXES.some((p) => k.startsWith(p)));
  } catch {
    return [];
  }
}

export function wipeBrowser(keep = KEEP_KEYS) {
  for (const storage of [localStorage, sessionStorage]) {
    for (const k of learningKeys(storage, keep)) {
      try { storage.removeItem(k); } catch { /* ignore */ }
    }
  }
}

let guard = null;    // { uid, ready }
/**
 * Resolves once it is safe for this browser to sync with this account. If the account was reset
 * after this browser last saw it, wipes the browser's learning data and reloads (never resolves).
 */
export function resetGuard(uid) {
  if (guard?.uid === uid) return guard.ready;
  guard = {
    uid,
    ready: (async () => {
      const fb = await loadFirebase();
      const ref = fb.fsMod.doc(fb.db, 'users', uid, 'state', 'reset');
      const atOf = (snap) => {
        try { return snap.exists() ? Number(JSON.parse(snap.data().json).at) || 0 : 0; } catch { return 0; }
      };
      return new Promise((resolve) => {
        let first = true;
        fb.fsMod.onSnapshot(ref, (snap) => {
          if (snap.metadata.hasPendingWrites) return;          // our own reset echoing back
          const at = atOf(snap);
          if (at > seenReset() && !paused) {                   // paused = this browser is the one deleting
            const hadData = learningKeys(localStorage).length > 0 || SYNCED_STORES.some((st) => JSON.stringify(st.get()) !== JSON.stringify(st.initial));
            markResetSeen(at);
            if (hadData) {
              wipeBrowser();
              window.location.reload();
              return;                                            // never resolves: the page is going away
            }
          }
          if (first) { first = false; resolve(true); }
        }, () => { if (first) { first = false; resolve(true); } });
      });
    })(),
  };
  return guard.ready;
}

// Another tab of this browser reset the data: start again from what is left.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => { if (e.key === RESET_SEEN_KEY && e.newValue !== e.oldValue) window.location.reload(); });
}

// While "Delete my data" runs, nothing is uploaded (a debounced write could recreate a deleted document).
let paused = false;
export const pauseSync = () => { paused = true; };
export const resumeSync = () => { paused = false; };
export const isSyncPaused = () => paused;
// Every store, for "download my data" and "delete my data" (src/lib/accountData.js).
export const SYNCED_STORES = [];

// Premium stores sync only while the signed-in account has premium access (src/hooks/useAccess.js).
let premiumAllowed = false;
const premiumListeners = new Set();
export function setPremiumSync(allowed) {
  if (premiumAllowed === allowed) return;
  premiumAllowed = allowed;
  premiumListeners.forEach((l) => l());
}

// Stores whose last sync attempt failed (e.g. Firestore rules not yet allowing them), shown in the account menu.
let issues = [];
const issueListeners = new Set();
function setIssue(name, failed) {
  const has = issues.includes(name);
  if (failed === has) return;
  issues = failed ? [...issues, name] : issues.filter((n) => n !== name);
  issueListeners.forEach((l) => l());
}
export function useSyncIssues() {
  return useSyncExternalStore((l) => { issueListeners.add(l); return () => issueListeners.delete(l); }, () => issues);
}

export function createSyncedStore({ name, storageKey, initial, merge }) {
  const premium = PREMIUM_STORES.includes(name);
  SYNCED_NAMES.push(name);
  let state = readJSON(storageKey, initial);
  const listeners = new Set();
  let uid = null;
  let docRef = null;
  let unsubscribeRemote = null;
  let firstSnapshot = true;
  let pending = null;            // debounce timer for remote writes
  let lastRemoteJson = null;

  const emit = () => listeners.forEach((l) => l());

  function applyLocal(next) {
    state = next;
    writeJSON(storageKey, state);
    emit();
  }

  async function pushRemote() {
    if (!uid || !docRef || paused) return;
    if (premium && !premiumAllowed) return;     // the rules would refuse it; keep it on this device
    const fb = await loadFirebase();
    const json = JSON.stringify(state);
    if (json === lastRemoteJson) return;
    lastRemoteJson = json;
    try {
      await fb.fsMod.setDoc(docRef, { json, updatedAt: fb.fsMod.serverTimestamp() });
      setIssue(name, false);
    } catch (e) {
      setIssue(name, true);
      throw e;
    }
  }

  function schedulePush() {
    if (!uid) return;
    clearTimeout(pending);
    pending = setTimeout(() => { pushRemote().catch(() => { lastRemoteJson = null; }); }, 600);
  }

  async function connect(user) {
    const fb = await loadFirebase();
    uid = user.uid;
    firstSnapshot = true;
    lastRemoteJson = null;
    await resetGuard(user.uid);
    if (uid !== user.uid) return;                        // signed out or switched while checking
    docRef = fb.fsMod.doc(fb.db, 'users', uid, 'state', name);
    unsubscribeRemote = fb.fsMod.onSnapshot(docRef, (snap) => {
      if (snap.metadata.hasPendingWrites) return;          // our own write echoing back
      setIssue(name, false);
      let remote = null;
      if (snap.exists()) {
        try { remote = JSON.parse(snap.data().json); } catch { remote = null; }
      }
      if (firstSnapshot) {
        firstSnapshot = false;
        const merged = remote == null ? state : merge(state, remote);
        lastRemoteJson = remote == null ? null : snap.data().json;
        applyLocal(merged);
        // Nothing saved yet and nothing to save: don't create an empty document (e.g. right after "Delete my data")
        if (remote == null && JSON.stringify(merged) === JSON.stringify(initial)) return;
        if (JSON.stringify(merged) !== lastRemoteJson) pushRemote().catch(() => { lastRemoteJson = null; });
        return;
      }
      if (remote != null && snap.data().json !== JSON.stringify(state)) {
        lastRemoteJson = snap.data().json;
        applyLocal(remote);
      }
    }, (e) => {
      // offline or permission problem: keep working locally, but say so when it's not just being offline
      if (e?.code !== 'unavailable') setIssue(name, true);
    });
  }

  function disconnect() {
    clearTimeout(pending);
    setIssue(name, false);
    unsubscribeRemote?.();
    unsubscribeRemote = null;
    uid = null;
    docRef = null;
  }

  onAuth((auth) => {
    if (auth.status === 'signed-in' && auth.user.uid !== uid) {
      disconnect();
      connect(auth.user);
    } else if (auth.status !== 'signed-in' && uid) {
      disconnect();
    }
  });

  const api = {
    name,
    storageKey,
    initial,
    get: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    /** Replace the value (or pass a function of the old value). */
    set(next) {
      applyLocal(typeof next === 'function' ? next(state) : next);
      schedulePush();
    },
    /** Back to the initial value in this browser only, uploading nothing (Delete my data). */
    clearLocal() {
      clearTimeout(pending);
      lastRemoteJson = null;
      applyLocal(initial);
    },
    /** Back to the initial value, here and (when signed in) in the account. */
    async reset() {
      clearTimeout(pending);
      applyLocal(initial);
      if (uid && docRef) {
        const fb = await loadFirebase();
        lastRemoteJson = null;
        await fb.fsMod.deleteDoc(docRef);
      }
    },
  };
  premiumListeners.add(() => { if (premium && premiumAllowed) schedulePush(); });
  SYNCED_STORES.push(api);
  return api;
}

// ---- merge helpers for the common shapes

/** Objects keyed by id: keep every key; on conflicts prefer `pick(local, remote)` (default: local). */
export function mergeObjects(pick = (l) => l) {
  return (local, remote) => {
    const out = { ...remote };
    for (const [k, v] of Object.entries(local)) out[k] = k in remote ? pick(v, remote[k], k) : v;
    return out;
  };
}

/** Arrays of records with a unique field: union, local wins on conflict, optional sort and cap. */
export function mergeArrays(idField, { sort, limit } = {}) {
  return (local, remote) => {
    const byId = new Map(remote.map((r) => [r[idField], r]));
    for (const r of local) byId.set(r[idField], r);
    let out = [...byId.values()];
    if (sort) out.sort(sort);
    if (limit) out = out.slice(0, limit);
    return out;
  };
}
