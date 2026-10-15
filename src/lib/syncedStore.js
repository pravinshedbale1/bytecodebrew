import { readJSON, writeJSON } from './storage';
import { onAuth } from '../hooks/useAuth';
import { loadFirebase } from './firebase';

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

export function createSyncedStore({ name, storageKey, initial, merge }) {
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
    if (!uid || !docRef) return;
    const fb = await loadFirebase();
    const json = JSON.stringify(state);
    if (json === lastRemoteJson) return;
    lastRemoteJson = json;
    await fb.fsMod.setDoc(docRef, { json, updatedAt: fb.fsMod.serverTimestamp() });
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
    docRef = fb.fsMod.doc(fb.db, 'users', uid, 'state', name);
    unsubscribeRemote = fb.fsMod.onSnapshot(docRef, (snap) => {
      if (snap.metadata.hasPendingWrites) return;          // our own write echoing back
      let remote = null;
      if (snap.exists()) {
        try { remote = JSON.parse(snap.data().json); } catch { remote = null; }
      }
      if (firstSnapshot) {
        firstSnapshot = false;
        const merged = remote == null ? state : merge(state, remote);
        lastRemoteJson = remote == null ? null : snap.data().json;
        applyLocal(merged);
        if (JSON.stringify(merged) !== lastRemoteJson) pushRemote().catch(() => { lastRemoteJson = null; });
        return;
      }
      if (remote != null && snap.data().json !== JSON.stringify(state)) {
        lastRemoteJson = snap.data().json;
        applyLocal(remote);
      }
    }, () => { /* offline or permission problem: keep working locally */ });
  }

  function disconnect() {
    clearTimeout(pending);
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

  return {
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
  };
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
