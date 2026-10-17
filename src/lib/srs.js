import { today, addDays } from './dates';

/**
 * A simple Leitner-style scheduler. Each card sits in a box; a good recall moves it up a box and
 * pushes the next review further out, a miss sends it back to box 1.
 */
export const INTERVALS = [0, 1, 3, 7, 16, 35, 90];      // days, by box
const MAX_BOX = INTERVALS.length - 1;

export const RATINGS = [
  { id: 'again', label: 'Again', hint: 'Forgot it' },
  { id: 'hard', label: 'Hard', hint: 'Got there slowly' },
  { id: 'good', label: 'Good', hint: 'Recalled it' },
  { id: 'easy', label: 'Easy', hint: 'Instant' },
];

export function schedule(state, rating, day = today()) {
  const box = state?.box ?? 0;
  const base = {
    reps: (state?.reps ?? 0) + 1,
    lapses: state?.lapses ?? 0,
    introduced: state?.introduced ?? day,
    last: new Date().toISOString(),
  };
  if (rating === 'again') return { ...base, box: 1, lapses: base.lapses + 1, due: addDays(day, 1) };
  if (rating === 'hard') {
    const b = Math.max(1, box);
    return { ...base, box: b, due: addDays(day, Math.max(1, Math.round(INTERVALS[b] * 0.5))) };
  }
  const b = Math.min(MAX_BOX, Math.max(1, box) + (rating === 'easy' ? 2 : 1));
  return { ...base, box: b, due: addDays(day, INTERVALS[b]) };
}

/** Preview the interval each rating would give, e.g. { again: '1d', good: '3d' }. */
export function previewIntervals(state) {
  const out = {};
  for (const r of RATINGS) {
    const next = schedule(state, r.id);
    const days = Math.round((new Date(next.due) - new Date(today())) / 86400000);
    out[r.id] = days < 30 ? `${days}d` : `${Math.round(days / 30)}mo`;
  }
  return out;
}

export const isMastered = (state) => (state?.box ?? 0) >= 4;
