export default {
  'koko-eating-bananas': (g) => { const piles = g.ints(g.len(1, 1e4, 20), 1, g.pick([1e9, 10])); const n = piles.length; return [piles, g.pick([n, n + 1, 1e9, g.int(n, 2 * n + 5), g.int(n, 1e9)])]; },
  'find-the-smallest-divisor-given-a-threshold': (g) => { const nums = g.ints(g.len(1, 5e4, 20), 1, g.pick([1e6, 10])); const n = nums.length; return [nums, g.pick([n, n + 1, 1e6, g.int(n, 3 * n + 5), g.int(n, 1e6)])]; },
  'capacity-to-ship-packages-within-d-days': (g) => { const w = g.ints(g.len(1, 5e4, 25), 1, g.pick([500, 5])); return [w, g.pick([1, w.length, g.int(1, w.length)])]; },
  'minimum-number-of-days-to-make-m-bouquets': (g) => { const b = g.ints(g.len(1, 1e5, 20), 1, g.pick([1e9, 10])); const n = b.length; return [b, g.pick([1, n, g.int(1, n), n + 1, 1e6]), g.pick([1, n, g.int(1, n)])]; },
  'minimum-time-to-complete-trips': (g) => [g.ints(g.len(1, 1e5, 20), 1, g.pick([1e7, 5])), g.pick([1, 1e7, g.int(1, 30), g.int(1, 1e7)])],
  'magnetic-force-between-two-balls': (g) => { const p = g.ints(g.len(2, 1e5, 20), 1, g.pick([1e9, 40]), { distinct: true }); return [p, g.pick([2, p.length, g.int(2, p.length)])]; },
  'split-array-largest-sum': (g) => { const a = g.ints(g.len(1, 1000, 20), 0, g.pick([1e6, 10, 0])); return [a, g.pick([1, Math.min(50, a.length), g.int(1, Math.min(50, a.length))])]; },
};
