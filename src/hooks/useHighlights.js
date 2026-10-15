import { useSyncExternalStore } from 'react';
import { createSyncedStore, mergeObjects } from '../lib/syncedStore';

/**
 * The reader's highlights across every lesson, keyed by id:
 *   { id, lessonKey, exact, prefix, suffix, pos, color, note, createdAt, updatedAt }
 * Saved in the browser; synced to the account when signed in (newer edit wins on a first merge).
 */
export const HIGHLIGHT_COLORS = ['yellow', 'green', 'blue', 'pink'];

const store = createSyncedStore({
  name: 'highlights',
  storageKey: 'bcb:highlights',
  initial: {},
  merge: mergeObjects((local, remote) => ((local.updatedAt ?? '') >= (remote.updatedAt ?? '') ? local : remote)),
});

export function useHighlights() {
  return useSyncExternalStore(store.subscribe, store.get);
}

const newId = () => (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);

export function addHighlight(lessonKey, anchor, color) {
  const now = new Date().toISOString();
  const h = { id: newId(), lessonKey, ...anchor, color, note: '', createdAt: now, updatedAt: now };
  store.set((prev) => ({ ...prev, [h.id]: h }));
  return h.id;
}

export function updateHighlight(id, changes) {
  store.set((prev) => (prev[id] ? { ...prev, [id]: { ...prev[id], ...changes, updatedAt: new Date().toISOString() } } : prev));
}

export function removeHighlight(id) {
  store.set((prev) => {
    const next = { ...prev };
    delete next[id];
    return next;
  });
}
