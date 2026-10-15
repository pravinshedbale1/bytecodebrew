import { useSyncExternalStore, useCallback } from 'react';
import { createSyncedStore, mergeObjects } from '../lib/syncedStore';

// Shape: { [leetcodeSlug]: ISOString of when it was marked solved }; synced when signed in.
const store = createSyncedStore({ name: 'solved', storageKey: 'bcb:solved', initial: {}, merge: mergeObjects() });

/** Practice problems the reader has marked as solved, shared by every page that lists problems. */
export function useSolved() {
  const solved = useSyncExternalStore(store.subscribe, store.get);

  const isSolved = useCallback((slug) => Boolean(solved[slug]), [solved]);

  const toggleSolved = useCallback((slug) => {
    store.set((prev) => {
      const next = { ...prev };
      if (next[slug]) delete next[slug];
      else next[slug] = new Date().toISOString();
      return next;
    });
  }, []);

  return { solved, isSolved, toggleSolved };
}

/** "https://leetcode.com/problems/two-sum/" → "two-sum"; null for any other link. */
export function problemSlug(href) {
  const m = /^https:\/\/leetcode\.com\/problems\/([a-z0-9-]+)\/?$/.exec(href ?? '');
  return m ? m[1] : null;
}
