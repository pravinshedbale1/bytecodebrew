import { useSyncExternalStore } from 'react';
import { createSyncedStore } from '../lib/syncedStore';
import { dayKey, addDays, today } from '../lib/dates';

/**
 * Daily study activity, used for the streak, the heatmap and the daily plan.
 * Shape: { 'YYYY-MM-DD': { lesson: n, quiz: n, review: n, practice: n, problem: n, mock: n } }
 * Merge: per day and kind keep the larger count, so two devices never lose a day.
 */
export const KINDS = ['lesson', 'quiz', 'review', 'practice', 'problem', 'mock', 'drill', 'coach'];

const store = createSyncedStore({
  name: 'activity',
  storageKey: 'bcb:activity',
  initial: {},
  merge: (local, remote) => {
    const out = { ...remote };
    for (const [day, counts] of Object.entries(local)) {
      const r = out[day] ?? {};
      const m = { ...r };
      for (const [k, v] of Object.entries(counts)) m[k] = Math.max(v, r[k] ?? 0);
      out[day] = m;
    }
    return out;
  },
});

/** Record one unit of study (called from progress, quizzes, reviews, practice, problems, mocks). */
export function logActivity(kind, n = 1) {
  const day = dayKey();
  store.set((prev) => {
    const counts = prev[day] ?? {};
    return { ...prev, [day]: { ...counts, [kind]: Math.max(0, (counts[kind] ?? 0) + n) } };
  });
}

export const dayTotal = (counts) => Object.values(counts ?? {}).reduce((s, n) => s + n, 0);

/** Consecutive active days ending today (or yesterday, so the streak survives until tonight). */
export function streakOf(activity) {
  let day = today();
  if (!dayTotal(activity[day])) day = addDays(day, -1);
  let n = 0;
  while (dayTotal(activity[day]) > 0) {
    n += 1;
    day = addDays(day, -1);
  }
  return n;
}

export function longestStreak(activity) {
  const days = Object.keys(activity).filter((d) => dayTotal(activity[d]) > 0).sort();
  let best = 0;
  let run = 0;
  let prev = null;
  for (const d of days) {
    run = prev && addDays(prev, 1) === d ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return best;
}

export function useActivity() {
  return useSyncExternalStore(store.subscribe, store.get);
}
