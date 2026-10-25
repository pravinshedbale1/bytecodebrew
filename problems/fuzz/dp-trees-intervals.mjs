const tree = (g, n, lo, hi) => { const p = g.palette(lo, hi); return g.tree(n, () => p()); };

export default {
  'diameter-of-binary-tree': (g) => [tree(g, g.len(1, 1e5, 30), -1e5, 1e5)],
  'house-robber-iii': (g) => [tree(g, g.len(1, 1e4, 30), 0, g.pick([1e4, 3, 0]))],
  'longest-zigzag-path-in-a-binary-tree': (g) => [tree(g, g.len(1, 5e4, 30), 1, 100)],
  'predict-the-winner': (g) => [g.ints(g.len(1, 20, 20), 0, g.pick([1e7, 5, 0]))],
  'minimum-score-triangulation-of-polygon': (g) => [g.ints(g.len(3, 50, 20), 1, g.pick([100, 3]))],
  'binary-tree-maximum-path-sum': (g) => [tree(g, g.len(1, 3e4, 30), g.pick([-1000, -5]), g.pick([1000, -1, 5]))],
  'binary-tree-cameras': (g) => [g.tree(g.len(1, 1000, 30), () => 0)],
  'burst-balloons': (g) => [g.ints(g.len(1, 300, 12), 0, g.pick([100, 3, 0]))],
  'minimum-cost-to-cut-a-stick': (g) => { const n = g.pick([2, 3, 7, 10, 1e6, g.int(2, 30), g.int(2, 1e6)]); return [n, g.ints(g.len(1, Math.min(100, n - 1), 10), 1, n - 1, { distinct: true })]; },
  'stone-game': (g) => { const a = g.ints(2 * g.int(1, 12), 1, g.pick([500, 5])); if (a.reduce((x, y) => x + y, 0) % 2 === 0) a[0] = a[0] === 500 ? 499 : a[0] + 1; return [a]; },
  'stone-game-ii': (g) => [g.ints(g.len(1, 100, 25), 1, g.pick([1e4, 5]))],
};
