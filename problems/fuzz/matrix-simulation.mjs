import { I32 } from './lib.mjs';

export default {
  'transpose-matrix': (g) => [g.grid(g.len(1, 1000, 8), g.len(1, 100, 8), g.palette(-1e9, 1e9))],
  'spiral-matrix': (g) => [g.grid(g.len(1, 10, 10), g.len(1, 10, 10), g.palette(-100, 100))],
  'spiral-matrix-ii': { all: Array.from({ length: 20 }, (_, i) => [i + 1]) },
  'rotate-image': (g) => { const n = g.len(1, 20, 20); return [g.grid(n, n, g.palette(-1000, 1000))]; },
  'set-matrix-zeroes': (g) => { const p = g.palette(...I32); const z = g.pick([0.05, 0.2, 0.5, 0]); return [g.grid(g.len(1, 200, 8), g.len(1, 200, 8), () => (g.rand() < z ? 0 : p()))]; },
  'game-of-life': (g) => { const p = g.pick([0.2, 0.4, 0.6, 0.9]); return [g.grid(g.len(1, 25, 10), g.len(1, 25, 10), () => (g.rand() < p ? 1 : 0))]; },
  'search-a-2d-matrix-ii': (g) => {
    const m = g.len(1, 300, 8), n = g.len(1, 300, 8);
    const step = g.pick([0, 1, 3, 1e6]);
    const a = Array.from({ length: m }, () => Array(n).fill(0));
    for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) a[i][j] = Math.min(1e9, Math.max(i ? a[i - 1][j] : -1e9 + g.int(0, 3), j ? a[i][j - 1] : -1e9) + g.int(0, step));
    const flat = a.flat();
    return [a, g.bool(0.5) ? g.pick(flat) : Math.max(-1e9, Math.min(1e9, g.pick(flat) + g.pick([-1, 1, 1e9, -1e9])))];
  },
  'diagonal-traverse': (g) => { const m = g.len(1, 100, 8); return [g.grid(m, g.len(1, Math.floor(1e4 / m), 8), g.palette(-1e5, 1e5))]; },
};
