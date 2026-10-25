import { I32 } from './lib.mjs';

/** k sorted, pairwise disjoint closed intervals inside [lo, hi] (zero-length intervals allowed when `point`) */
function disjoint(g, k, lo, hi, point = true) {
  const out = [];
  let cur = lo + g.int(0, 3);
  const step = g.pick([1, 3, 10, Math.max(1, Math.floor((hi - lo) / (4 * k + 4)))]);
  for (let i = 0; i < k; i++) {
    const s = cur + (i ? g.int(1, step) : 0);
    const e = s + g.int(point ? 0 : 1, step);
    if (e > hi) break;
    out.push([s, e]);
    cur = e + 1;
  }
  return out;
}

export default {
  'merge-intervals': (g) => [g.intervals(g.len(1, 1e4, 15), 0, g.pick([2e6, 20, 8]), true)],
  'insert-interval': (g) => {
    const hi = g.pick([1e5, 30]);
    const list = disjoint(g, g.len(0, 1e4, 10), 0, hi);
    let a = g.val(0, hi), b = g.val(0, hi);
    if (a > b) [a, b] = [b, a];
    return [list, [a, b]];
  },
  'non-overlapping-intervals': (g) => [g.intervals(g.len(1, 1e5, 15), -1e5, g.pick([1e5, -1e5 + 20]))],
  'minimum-number-of-arrows-to-burst-balloons': (g) => [g.bool(0.3) ? g.intervals(g.len(1, 1e5, 15), ...I32, true) : g.intervals(g.len(1, 1e5, 15), g.pick([I32[0], 0]), g.pick([20, I32[1]]), true)],
  'interval-list-intersections': (g) => {
    const hi = g.pick([1e9, 40]);
    return [disjoint(g, g.len(0, 1000, 8), 0, hi), disjoint(g, g.len(0, 1000, 8), 0, hi)];
  },
  'remove-covered-intervals': (g) => {
    const list = g.intervals(g.len(1, 1000, 15), 0, g.pick([1e5, 12]));
    const seen = new Set();
    return [list.filter((iv) => { const k = iv.join(); if (seen.has(k)) return false; seen.add(k); return true; })];
  },
  'minimum-interval-to-include-each-query': (g) => {
    const hi = g.pick([1e7, 25]);
    return [g.intervals(g.len(1, 1e5, 12), 1, hi, true).map(([a, b]) => [a, g.bool(0.1) ? Math.min(2e7, b + 1e7) : b]), g.ints(g.len(1, 1e5, 10), 1, hi)];
  },
  'meeting-rooms': (g) => [g.intervals(g.len(0, 1e4, 10), 0, g.pick([1e6, 20]))],
  'meeting-rooms-ii': (g) => [g.intervals(g.len(1, 1e4, 15), 0, g.pick([1e6, 20, 6]))],
  'meeting-rooms-iii': (g) => {
    const n = g.pick([1, 2, 3, g.int(1, 6), g.int(1, 100)]);
    const hi = g.pick([5e5, 30]);
    const m = g.len(1, 1e5, 15);
    const starts = g.ints(Math.min(m, hi), 0, hi - 1, { distinct: true });
    return [n, starts.map((s) => [s, g.int(s + 1, Math.min(hi, s + g.pick([1, 3, 10, hi])))])];
  },
};
