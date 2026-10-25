const MAX = 2e9;

const paths = (grid) => {
  const m = grid.length, n = grid[0].length, d = Array(n).fill(0);
  d[0] = grid[0][0] ? 0 : 1;
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) { if (grid[i][j]) d[j] = 0; else if (j) d[j] += d[j - 1]; }
  return d[n - 1];
};

export default {
  'unique-paths': (g) => { const m = g.pick([1, 2, 3, 10, 100, g.int(1, 20), g.int(1, 100)]), n = g.pick([1, 2, 3, 10, 100, g.int(1, 20), g.int(1, 100)]); return paths(Array.from({ length: m }, () => Array(n).fill(0))) <= MAX ? [m, n] : null; },
  'unique-paths-ii': (g) => { const p = g.pick([0, 0.05, 0.2, 0.4]); const grid = g.grid(g.len(1, 100, 10), g.len(1, 100, 10), () => (g.rand() < p ? 1 : 0)); if (g.bool(0.15)) grid[0][0] = 1; return paths(grid) <= MAX ? [grid] : null; },
  'minimum-path-sum': (g) => [g.grid(g.len(1, 200, 10), g.len(1, 200, 10), g.palette(0, g.pick([200, 3])))],
  triangle: (g) => { const p = g.palette(-1e4, g.pick([1e4, 5])); return [Array.from({ length: g.len(1, 200, 12) }, (_, i) => Array.from({ length: i + 1 }, () => p()))]; },
  'minimum-falling-path-sum': (g) => { const n = g.len(1, 100, 10); return [g.grid(n, n, g.palette(-100, 100))]; },
  'maximal-square': (g) => { const p = g.pick([0.5, 0.8, 0.95, 0]); return [g.grid(g.len(1, 300, 10), g.len(1, 300, 10), () => (g.rand() < p ? '1' : '0'))]; },
  'count-square-submatrices-with-all-ones': (g) => { const p = g.pick([0.5, 0.8, 0.95, 0, 1]); return [g.grid(g.len(1, 300, 10), g.len(1, 300, 10), () => (g.rand() < p ? 1 : 0))]; },
  'dungeon-game': (g) => [g.grid(g.len(1, 200, 8), g.len(1, 200, 8), g.palette(-1000, g.pick([1000, 0, 5])))],
  'cherry-pickup': (g) => {
    const n = g.len(1, 50, 8);
    const w = g.pick([[0.1, 0.5], [0.3, 0.6], [0, 0.9], [0.2, 0.2]]);
    const grid = g.grid(n, n, () => { const r = g.rand(); return r < w[0] ? -1 : r < w[1] ? 1 : 0; });
    if (grid[0][0] === -1) grid[0][0] = 0;
    if (grid[n - 1][n - 1] === -1) grid[n - 1][n - 1] = 1;
    return [grid];
  },
  'longest-increasing-path-in-a-matrix': (g) => [g.grid(g.len(1, 200, 8), g.len(1, 200, 8), g.palette(0, g.pick([2 ** 31 - 1, 5, 20])))],
};
