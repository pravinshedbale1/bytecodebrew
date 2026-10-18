import { useSyncExternalStore } from 'react';
import { createSyncedStore } from '../lib/syncedStore';

/**
 * Learner settings and the LeetCode snapshot.
 * Shape: {
 *   interviewDate: 'YYYY-MM-DD' | null (old dashboard countdown; Runway now owns the date),
 *   goals: { lessons, problems, reviews },
 *   leetcode: { username, syncedAt: ms, data: {...} } | null
 * }
 * On merge the newer LeetCode snapshot wins, so the once-an-hour refresh limit holds across devices.
 */
export const DEFAULT_GOALS = { lessons: 1, problems: 2, reviews: 15 };

const store = createSyncedStore({
  name: 'profile',
  storageKey: 'bcb:profile',
  initial: {},
  merge: (local, remote) => {
    const out = { ...remote, ...local };
    const l = local.leetcode;
    const r = remote.leetcode;
    out.leetcode = !l ? r ?? null : !r ? l : (l.syncedAt ?? 0) >= (r.syncedAt ?? 0) ? l : r;
    return out;
  },
});

export function useProfile() {
  return useSyncExternalStore(store.subscribe, store.get);
}

export const getProfile = () => store.get();

export function updateProfile(patch) {
  store.set((prev) => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }));
}

/** Daily goals, with defaults for anything not set. */
export function goalsOf(profile) {
  return { ...DEFAULT_GOALS, ...(profile.goals ?? {}) };
}
