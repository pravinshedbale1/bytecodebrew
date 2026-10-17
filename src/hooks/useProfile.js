import { useSyncExternalStore } from 'react';
import { createSyncedStore } from '../lib/syncedStore';

/**
 * Learner settings and the LeetCode snapshot.
 * Shape: {
 *   interviewDate: 'YYYY-MM-DD' | null,
 *   focusTracks: [trackId] (empty = all),
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

/**
 * Daily goals. With an interview date set, the lesson goal follows the plan's pace (lessonsFromPlan: true)
 * so the dashboard never shows two different numbers.
 */
export function goalsOf(profile, plan = null) {
  const goals = { ...DEFAULT_GOALS, ...(profile.goals ?? {}), lessonsFromPlan: false };
  if (plan && plan.daysLeft > 0 && plan.remaining > 0) {
    goals.lessons = Math.max(1, Math.ceil(plan.perDay));
    goals.lessonsFromPlan = true;
  }
  return goals;
}
