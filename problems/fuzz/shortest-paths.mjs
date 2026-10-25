/** up to m distinct directed edges u → v (u ≠ v) on base..base + n − 1 with weights from w() */
function directed(g, n, m, w, base = 0) {
  const seen = new Set(), out = [];
  for (let tries = 0; out.length < m && tries < 20 * m + 50; tries++) {
    const a = g.int(0, n - 1), b = g.int(0, n - 1);
    if (a === b || seen.has(`${a},${b}`)) continue;
    seen.add(`${a},${b}`);
    out.push([a + base, b + base, w()]);
  }
  return out;
}

export default {
  'network-delay-time': (g) => {
    const n = g.len(1, 100, 10);
    const e = directed(g, n, g.int(1, Math.min(6000, n * (n - 1) || 1)), g.palette(0, g.pick([100, 3])), 1);
    return e.length ? [e, n, g.int(1, n)] : null;
  },
  'path-with-minimum-effort': (g) => [g.grid(g.len(1, 100, 8), g.len(1, 100, 8), g.palette(1, g.pick([1e6, 5])))],
  'cheapest-flights-within-k-stops': (g) => {
    const n = g.len(2, 100, 8);
    const f = directed(g, n, g.int(0, Math.min(4950, n * (n - 1))), g.palette(1, g.pick([1e4, 5])));
    const src = g.int(0, n - 1);
    let dst = g.int(0, n - 1);
    if (dst === src) dst = (src + 1) % n;
    return [n, f, src, dst, g.pick([0, 1, n - 1, g.int(0, Math.min(100, n)), 100])];
  },
  'path-with-maximum-probability': (g) => {
    const n = g.len(2, 1e4, 10);
    const e = g.edges(n, g.int(0, 2 * n));
    const p = () => g.pick([0, 1, 0.5, Math.round(g.rand() * 100) / 100, Math.round(g.rand() * 1e4) / 1e4]);
    const s = g.int(0, n - 1);
    let t = g.int(0, n - 1);
    if (t === s) t = (s + 1) % n;
    return [n, e, e.map(p), s, t];
  },
  'minimum-obstacle-removal-to-reach-corner': (g) => {
    const m = g.len(1, 300, 8), n = g.len(1, Math.floor(1e5 / m), 8);
    const p = g.pick([0.2, 0.5, 0.8, 1]);
    const grid = g.grid(m, n, () => (g.rand() < p ? 1 : 0));
    grid[0][0] = 0; grid[m - 1][n - 1] = 0;
    return [grid];
  },
  'minimum-cost-to-make-at-least-one-valid-path-in-a-grid': (g) => [g.grid(g.len(1, 100, 8), g.len(1, 100, 8), g.palette(1, 4))],
  'swim-in-rising-water': (g) => { const n = g.len(1, 50, 7); const v = g.perm(n * n); return [Array.from({ length: n }, (_, r) => v.slice(r * n, r * n + n))]; },
  'find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance': (g) => {
    const n = g.len(2, 100, 8);
    const e = g.edges(n, g.int(1, Math.min(4950, (n * (n - 1)) / 2))).map(([a, b]) => [Math.min(a, b), Math.max(a, b)]);
    const w = g.palette(1, g.pick([1e4, 5]));
    return [n, e.map(([a, b]) => [a, b, w()]), g.pick([1, 4, 1e4, g.int(1, 20), g.int(1, 1e4)])];
  },
};
