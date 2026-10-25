import { LOWER } from './lib.mjs';

/** up to m distinct directed pairs [a, b] on 0..n − 1 (a ≠ b); acyclic when `dag` (edges follow a random order) */
function pairs(g, n, m, dag, base = 0) {
  const order = g.perm(n);
  const pos = new Map(order.map((v, i) => [v, i]));
  const seen = new Set(), out = [];
  for (let tries = 0; out.length < m && tries < 20 * m + 50; tries++) {
    let a = g.int(0, n - 1), b = g.int(0, n - 1);
    if (a === b) continue;
    if (dag && pos.get(a) > pos.get(b)) [a, b] = [b, a];
    if (seen.has(`${a},${b}`)) continue;
    seen.add(`${a},${b}`);
    out.push([a + base, b + base]);
  }
  return out;
}

export default {
  'course-schedule': (g) => { const n = g.len(1, 2000, 10); return [n, pairs(g, n, g.int(0, Math.min(5000, 2 * n)), g.bool(0.5))]; },
  'course-schedule-ii': (g) => { const n = g.len(1, 2000, 10); return [n, pairs(g, n, g.int(0, Math.min(5000, 2 * n)), g.bool(0.6))]; },
  'course-schedule-iv': (g) => {
    const n = g.len(2, 100, 8);
    return [n, pairs(g, n, g.int(0, Math.min((n * (n - 1)) / 2, 3 * n)), true), Array.from({ length: g.len(1, 1e4, 12) }, () => { const a = g.int(0, n - 1); let b = g.int(0, n - 1); if (a === b) b = (b + 1) % n; return [a, b]; })];
  },
  'minimum-height-trees': (g) => { const n = g.len(1, 2e4, 15); return [n, g.treeEdges(n)]; },
  'find-eventual-safe-states': (g) => {
    const n = g.len(1, 1e4, 12);
    const p = g.pick([0.1, 0.25, 0.5]);
    return [Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => j).filter((j) => (j === i ? g.rand() < 0.05 : g.rand() < p / Math.max(1, n / 6))))];
  },
  'find-all-possible-recipes-from-given-supplies': (g) => {
    const names = g.shuffle(['bread', 'sandwich', 'burger', 'toast', 'jam', 'pie', 'cake', 'tea', 'soup', 'rice', 'yeast', 'flour', 'meat', 'corn', 'salt', 'egg']);
    const nr = g.int(1, 6), ns = g.int(1, 6);
    const recipes = names.slice(0, nr), supplies = names.slice(nr, nr + ns), other = names.slice(nr + ns);
    const pool = [...recipes, ...supplies, ...supplies, ...other.slice(0, 2)];
    const ingredients = recipes.map((r) => [...new Set(Array.from({ length: g.int(1, 4) }, () => g.pick(pool)).filter((x) => x !== r || g.bool(0.1)))].concat([]));
    return [recipes, ingredients.map((l, i) => (l.length ? l : [supplies[0] ?? recipes[(i + 1) % nr]])), supplies];
  },
  'sort-items-by-groups-respecting-dependencies': (g) => {
    const n = g.len(1, 3e4, 10), m = g.int(1, n);
    const group = Array.from({ length: n }, () => (g.bool(0.3) ? -1 : g.int(0, m - 1)));
    const deps = pairs(g, n, g.int(0, 2 * n), g.bool(0.7));
    const before = Array.from({ length: n }, () => []);
    for (const [a, b] of deps) before[b].push(a);
    return [n, m, group, before];
  },
  'alien-dictionary': (g) => {
    const order = g.shuffle([...LOWER]).join('').slice(0, g.int(2, 6));
    let words = Array.from({ length: g.len(1, 100, 8) }, () => g.str(g.len(1, 100, 4), order));
    if (g.bool(0.6)) {
      const rank = (w) => [...w].map((c) => order.indexOf(c));
      words.sort((a, b) => { const x = rank(a), y = rank(b); for (let k = 0; k < Math.min(x.length, y.length); k++) if (x[k] !== y[k]) return x[k] - y[k]; return x.length - y.length; });
      if (g.bool(0.15) && words.length > 1) words.splice(1, 0, words[0] + g.str(1, order));
    }
    return [words];
  },
  'build-a-matrix-with-conditions': (g) => {
    const k = g.len(2, 400, 8);
    const conds = () => { const c = pairs(g, k, g.int(1, Math.min(1e4, 2 * k)), g.bool(0.7), 1); return c.length ? c : [[1, 2]]; };
    return [k, conds(), conds()];
  },
};
