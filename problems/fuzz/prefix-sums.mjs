/** design-style test: constructor args, then `count` calls of `op` with args from f() */
const calls = (cls, ctorArgs, op, count, f) => [[cls, ...Array(count).fill(op)], [ctorArgs, ...Array.from({ length: count }, f)]];

export default {
  'running-sum-of-1d-array': (g) => [g.ints(g.len(1, 1000, 25), -1e6, 1e6)],
  'range-sum-query-immutable': (g) => {
    const nums = g.ints(g.len(1, 1e4, 20), -1e5, 1e5);
    const n = nums.length;
    return calls('NumArray', [nums], 'sumRange', g.int(1, 12), () => { const a = g.int(0, n - 1), b = g.int(0, n - 1); return g.bool(0.15) ? [a, a] : [Math.min(a, b), Math.max(a, b)]; });
  },
  'find-pivot-index': (g) => {
    const a = g.ints(g.len(1, 1e4, 20), -1000, 1000);
    if (g.bool(0.4) && a.length > 2) {
      // force a pivot somewhere by fixing the last element
      const p = g.int(0, a.length - 2);
      const left = a.slice(0, p).reduce((x, y) => x + y, 0), rightButLast = a.slice(p + 1, -1).reduce((x, y) => x + y, 0);
      const last = left - rightButLast;
      if (Math.abs(last) <= 1000) a[a.length - 1] = last;
    }
    return [a];
  },
  'subarray-sum-equals-k': (g) => { const a = g.ints(g.len(1, 2e4, 25), -1000, g.pick([1000, 2, 0])); return [a, g.pick([0, a[0], a.reduce((x, y) => x + y, 0), g.int(-5, 5), 1e7, -1e7])]; },
  'subarray-sums-divisible-by-k': (g) => [g.ints(g.len(1, 3e4, 25), -1e4, 1e4), g.pick([2, 3, 5, 7, 1e4, g.int(2, 1e4)])],
  'contiguous-array': (g) => [g.ints(g.len(1, 1e5, 30), 0, 1)],
  'product-of-array-except-self': (g) => {
    const a = g.ints(g.len(2, 1e5, 20), g.pick([-30, -3]), g.pick([30, 3]));
    let p = 1;
    for (const x of a) { p *= x; if (Math.abs(p) > 2 ** 31 - 1) return null; }
    p = 1;
    for (let i = a.length - 1; i >= 0; i--) { p *= a[i]; if (Math.abs(p) > 2 ** 31 - 1) return null; }
    return [a];
  },
  'range-sum-query-2d-immutable': (g) => {
    const m = g.len(1, 200, 6), n = g.len(1, 200, 6);
    const p = g.palette(-1e4, 1e4);
    const matrix = g.grid(m, n, p);
    const q = () => { const r1 = g.int(0, m - 1), r2 = g.int(r1, m - 1), c1 = g.int(0, n - 1), c2 = g.int(c1, n - 1); return [r1, c1, r2, c2]; };
    return calls('NumMatrix', [matrix], 'sumRegion', g.int(1, 10), q);
  },
  'corporate-flight-bookings': (g) => {
    const n = g.len(1, 2e4, 15);
    return [Array.from({ length: g.len(1, 2e4, 10) }, () => { const a = g.int(1, n), b = g.int(a, n); return [a, b, g.val(1, 1e4)]; }), n];
  },
  'number-of-submatrices-that-sum-to-target': (g) => {
    const m = g.len(1, 100, 6), n = g.len(1, 100, 6);
    const big = g.bool(0.2);
    return [g.grid(m, n, g.palette(big ? -1000 : -2, big ? 1000 : 2)), big ? g.int(-3000, 3000) : g.int(-3, 3)];
  },
};
