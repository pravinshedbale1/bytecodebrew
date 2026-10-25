import { I32 } from './lib.mjs';

export default {
  'car-pooling': (g) => {
    const hi = g.pick([1000, 10]);
    const trips = Array.from({ length: g.len(1, 1000, 12) }, () => { const a = g.int(0, hi - 1); return [g.val(1, 100), a, g.int(a + 1, Math.min(hi, a + g.pick([1, 3, hi])))]; });
    const load = trips.reduce((s, t) => s + t[0], 0);
    return [trips, g.pick([1, 100, 1e5, g.int(1, load + 1), Math.max(1, Math.floor(load / 2))])];
  },
  'range-sum-query-mutable': (g) => {
    const nums = g.ints(g.len(1, 1e5, 15), -100, 100);
    const n = nums.length;
    const k = g.len(1, 60, 30);
    const ops = ['NumArray'], args = [[nums]];
    for (let i = 0; i < k; i++) {
      if (g.bool(0.45)) { ops.push('update'); args.push([g.int(0, n - 1), g.val(-100, 100)]); } else { const a = g.int(0, n - 1), b = g.int(0, n - 1); ops.push('sumRange'); args.push([Math.min(a, b), Math.max(a, b)]); }
    }
    return [ops, args];
  },
  'count-of-smaller-numbers-after-self': (g) => [g.ints(g.len(1, 1e5, 30), -1e4, 1e4)],
  'reverse-pairs': (g) => [g.ints(g.len(1, 5e4, 30), ...(g.bool(0.5) ? I32 : [-10, 10]))],
  'count-of-range-sum': (g) => {
    const nums = g.ints(g.len(1, 1e5, 25), ...(g.bool(0.4) ? I32 : [-5, 5]));
    const lo = g.val(-1e5, 1e5), hi = g.val(-1e5, 1e5);
    return [nums, Math.min(lo, hi), Math.max(lo, hi)];
  },
  'create-sorted-array-through-instructions': (g) => [g.ints(g.len(1, 1e5, 30), 1, g.pick([1e5, 5, 20]))],
  'falling-squares': (g) => { const L = g.palette(1, g.pick([1e8, 20])); const S = g.palette(1, g.pick([1e6, 5])); return [Array.from({ length: g.len(1, 1000, 15) }, () => [L(), S()])]; },
};
