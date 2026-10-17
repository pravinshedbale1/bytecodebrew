import { useSyncExternalStore, useCallback } from 'react';
import { createSyncedStore, mergeObjects } from '../lib/syncedStore';
import { logActivity } from './useActivity';

/**
 * Solved practice problems, synced when signed in.
 * Shape: { [leetcodeSlug]: { at: ISO, by: 'tests' | 'leetcode' | 'self' } }.
 * Older entries are a bare ISO string, which means "ticked by the reader" ('self').
 * Sources rank tests > leetcode > self: a verified source is never downgraded by a manual tick.
 */
const RANK = { self: 0, leetcode: 1, tests: 2 };
export const SOURCE_LABEL = {
  tests: 'Passed all tests here',
  leetcode: 'Accepted on LeetCode',
  self: 'Ticked by you',
};

const entry = (v) => (v == null ? null : typeof v === 'string' ? { at: v, by: 'self' } : v);
const stronger = (a, b) => (RANK[entry(a).by] >= RANK[entry(b).by] ? a : b);

const store = createSyncedStore({ name: 'solved', storageKey: 'bcb:solved', initial: {}, merge: mergeObjects(stronger) });

/** Practice problems the reader has solved, shared by every page that lists problems. */
export function useSolved() {
  const solved = useSyncExternalStore(store.subscribe, store.get);

  const isSolved = useCallback((slug) => Boolean(solved[slug]), [solved]);
  const solvedBy = useCallback((slug) => entry(solved[slug])?.by ?? null, [solved]);

  const toggleSolved = useCallback((slug) => {
    store.set((prev) => {
      const next = { ...prev };
      if (next[slug]) delete next[slug];
      else {
        next[slug] = { at: new Date().toISOString(), by: 'self' };
        logActivity('problem');
      }
      return next;
    });
  }, []);

  return { solved, isSolved, solvedBy, toggleSolved };
}

/** Record solves from a verified source; upgrades weaker sources and never unmarks. Returns how many changed. */
function record(entries, by) {
  let changed = 0;
  store.set((prev) => {
    const next = { ...prev };
    for (const { slug, at } of entries) {
      const cur = entry(next[slug]);
      if (!cur || RANK[cur.by] < RANK[by]) {
        next[slug] = { at: cur?.at ?? at, by };
        changed += 1;
      }
    }
    return changed ? next : prev;
  });
  return changed;
}

/** Problems accepted on LeetCode (sync or full import). */
export const markSolvedFrom = (entries) => record(entries, 'leetcode');

export const getSolved = () => store.get();

/** One problem passed all of its tests here. */
export function markSolved(slug) {
  const was = entry(store.get()[slug]);
  const changed = record([{ slug, at: new Date().toISOString() }], 'tests');
  if (changed && !was) logActivity('problem');
  return changed > 0;
}

/** "https://leetcode.com/problems/two-sum/" → "two-sum"; null for any other link. */
export function problemSlug(href) {
  const m = /^https:\/\/leetcode\.com\/problems\/([a-z0-9-]+)\/?$/.exec(href ?? '');
  return m ? m[1] : null;
}
