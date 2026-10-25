import { I32 } from './lib.mjs';

const SQRT_EDGES = [0, 1, 2, 3, 5, 8, 9, 10, 15, 16, 17, 24, 25, 26, 99, 100, 2147395599, 2147395600, 2147395601, 2147483647, 2147483646, 1e9, 999999999, 46340 * 46340 - 1, 123456789, 65535, 65536, 1 << 30];
const rotate = (a, k) => [...a.slice(k), ...a.slice(0, k)];
/** a target that is in `a` about half of the time, otherwise near or outside its values (within [lo, hi]) */
const target = (g, a, lo, hi) => (a.length && g.bool(0.5) ? g.pick(a) : Math.max(lo, Math.min(hi, g.pick([lo, hi, (a[0] ?? 0) - 1, (a[a.length - 1] ?? 0) + 1, g.int(lo, hi)]))));
const bigN = (g) => g.pick([1, 2, 3, g.int(1, 100), g.int(1, 1e6), I32[1], I32[1] - 1, g.int(1, I32[1])]);

export default {
  'binary-search': (g) => { const a = g.ints(g.len(1, 1e4, 25), -9999, 9999, { distinct: true, sorted: 'asc' }); return [a, target(g, a, -9999, 9999)]; },
  'search-insert-position': (g) => { const a = g.ints(g.len(1, 1e4, 25), -1e4, 1e4, { distinct: true, sorted: 'asc' }); return [a, target(g, a, -1e4, 1e4)]; },
  'first-bad-version': (g) => { const n = bigN(g); return [n, g.pick([1, n, g.int(1, n)])]; },
  sqrtx: (g, i) => [SQRT_EDGES[i] ?? g.pick([g.int(0, 1e4), g.int(0, I32[1]), g.int(0, 46340) ** 2, g.int(1, 46340) ** 2 - 1])],
  'find-first-and-last-position-of-element-in-sorted-array': (g) => { const a = g.ints(g.len(0, 1e5, 25), -1e9, 1e9, { sorted: 'asc' }); return [a, target(g, a, -1e9, 1e9)]; },
  'search-a-2d-matrix': (g) => {
    const m = g.len(1, 100, 5), n = g.len(1, 100, 5);
    const flat = g.ints(m * n, -1e4, 1e4, { distinct: true, sorted: 'asc' });
    const matrix = Array.from({ length: m }, (_, r) => flat.slice(r * n, r * n + n));
    return [matrix, target(g, flat, -1e4, 1e4)];
  },
  'find-minimum-in-rotated-sorted-array': (g) => { const a = g.ints(g.len(1, 5000, 25), -5000, 5000, { distinct: true, sorted: 'asc' }); return [rotate(a, g.pick([0, 1, a.length - 1, g.int(0, a.length - 1)]))]; },
  'search-in-rotated-sorted-array': (g) => { const a = g.ints(g.len(1, 5000, 25), -1e4, 1e4, { distinct: true, sorted: 'asc' }); const r = rotate(a, g.int(0, a.length - 1)); return [r, target(g, r, -1e4, 1e4)]; },
  'find-peak-element': (g) => {
    const a = g.ints(g.len(1, 1000, 25), ...I32);
    for (let i = 1; i < a.length; i++) if (a[i] === a[i - 1]) a[i] = a[i] === I32[1] ? a[i] - 1 : a[i] + 1;
    for (let i = 1; i < a.length; i++) if (a[i] === a[i - 1]) return null;
    return [a];
  },
  'median-of-two-sorted-arrays': (g) => {
    const p = g.bool() ? [-1e6, 1e6] : [-3, 3];
    const a = g.ints(g.len(0, 1000, 12), ...p, { sorted: 'asc' }), b = g.ints(g.len(0, 1000, 12), ...p, { sorted: 'asc' });
    return a.length + b.length ? [a, b] : null;
  },
  'guess-number-higher-or-lower': (g) => { const n = bigN(g); return [n, g.pick([1, n, g.int(1, n)])]; },
  'search-in-rotated-sorted-array-ii': (g) => { const a = g.ints(g.len(1, 5000, 25), -1e4, 1e4, { sorted: 'asc' }); const r = rotate(a, g.int(0, a.length - 1)); return [r, target(g, r, -1e4, 1e4)]; },
  'find-in-mountain-array': (g) => {
    const up = g.ints(g.len(2, 40, 30), 0, g.pick([1e9, 60]), { distinct: true, sorted: 'asc' });
    const peak = up.pop();
    const down = g.ints(g.len(1, 40, 30), 0, peak - 1 >= 0 ? peak - 1 : 0, { distinct: true, sorted: 'desc' }).filter((v) => v < peak);
    if (!down.length || !up.length) return null;
    const arr = [...up, peak, ...down];
    const both = up.filter((v) => down.includes(v));
    return [arr, g.pick([g.pick(arr), peak, both.length ? g.pick(both) : g.pick(down), g.int(0, 1e9), up[0], down[down.length - 1]])];
  },
};
