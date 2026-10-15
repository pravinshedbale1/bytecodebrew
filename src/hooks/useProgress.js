import { useSyncExternalStore, useCallback } from 'react';
import { createSyncedStore, mergeObjects } from '../lib/syncedStore';

// Shape: { [lessonKey]: { completedAt: ISOString } , __lastVisited: lessonKey }
// Synced to the user's account when signed in; on a first merge, this device's values win conflicts.
const store = createSyncedStore({
  name: 'progress',
  storageKey: 'bcb:progress',
  initial: {},
  merge: mergeObjects(),
});

export function useProgress() {
  const progress = useSyncExternalStore(store.subscribe, store.get);

  const isComplete = useCallback((key) => Boolean(progress[key]?.completedAt), [progress]);

  const setComplete = useCallback((key, done) => {
    store.set((prev) => {
      const next = { ...prev };
      if (done) next[key] = { completedAt: new Date().toISOString() };
      else delete next[key];
      return next;
    });
  }, []);

  const markVisited = useCallback((key) => {
    if (store.get().__lastVisited === key) return;
    store.set((prev) => ({ ...prev, __lastVisited: key }));
  }, []);

  return { isComplete, setComplete, markVisited, lastVisited: progress.__lastVisited ?? null };
}
