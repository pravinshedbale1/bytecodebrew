/** a connected graph on n nodes: a random tree plus `extra` more distinct edges */
function connected(g, n, extra) {
  const seen = new Set(), e = [];
  const add = ([a, b]) => { const k = a < b ? `${a},${b}` : `${b},${a}`; if (a === b || seen.has(k)) return; seen.add(k); e.push([a, b]); };
  g.treeEdges(n).forEach(add);
  g.edges(n, extra).forEach(add);
  return g.shuffle(e);
}

export default {
  'find-if-path-exists-in-graph': (g) => { const n = g.len(1, 2e5, 15); const e = g.edges(n, g.int(0, n + 2)); return [n, e, g.int(0, n - 1), g.int(0, n - 1)]; },
  'redundant-connection': (g) => {
    const n = g.len(3, 1000, 15);
    const tree = g.treeEdges(n, 1);
    const seen = new Set(tree.map(([a, b]) => (a < b ? `${a},${b}` : `${b},${a}`)));
    for (let k = 0; k < 100; k++) {
      const a = g.int(1, n), b = g.int(1, n);
      if (a === b || seen.has(a < b ? `${a},${b}` : `${b},${a}`)) continue;
      const edges = [...tree];
      edges.splice(g.int(0, edges.length), 0, [a, b]);
      return [edges];
    }
    return null;
  },
  'satisfiability-of-equality-equations': (g) => {
    const letters = g.pick(['ab', 'abc', 'abcde', 'abcdefghijklmnopqrstuvwxyz']);
    return [Array.from({ length: g.len(1, 500, 12) }, () => g.pick([...letters]) + (g.bool(0.65) ? '==' : '!=') + g.pick([...letters]))];
  },
  'smallest-string-with-swaps': (g) => { const s = g.str(g.len(1, 1e5, 20), g.pick(['ab', 'dcba', 'abcdefghij'])); const n = s.length; return [s, Array.from({ length: g.len(0, 1e5, 12) }, () => [g.int(0, n - 1), g.int(0, n - 1)])]; },
  'accounts-merge': (g) => {
    const people = Array.from({ length: g.int(1, 6) }, (_, i) => ({ name: g.pick(['John', 'Mary', 'Alex', 'Bob']), emails: Array.from({ length: g.int(1, 5) }, (_, k) => `${'p' + i}_${k}${g.pick(['', 'x'])}@mail.com`) }));
    return [Array.from({ length: g.len(1, 1000, 10) }, () => {
      const p = g.pick(people);
      const k = g.int(1, Math.min(9, p.emails.length));
      return [p.name, ...g.shuffle([...p.emails]).slice(0, k)];
    })];
  },
  'min-cost-to-connect-all-points': (g) => {
    const c = g.palette(-1e6, 1e6);
    const seen = new Set(), pts = [];
    for (let k = g.len(1, 1000, 20), tries = 0; pts.length < k && tries < 500; tries++) { const p = [c(), c()]; if (!seen.has(p.join())) { seen.add(p.join()); pts.push(p); } }
    return [pts];
  },
  'regions-cut-by-slashes': (g) => { const n = g.len(1, 30, 8); return [Array.from({ length: n }, () => g.str(n, g.pick(['/\\ ', '/ ', '\\', '/\\'])))]; },
  'largest-component-size-by-common-factor': (g) => [g.ints(g.len(1, 2e4, 20), 1, g.pick([1e5, 60]), { distinct: true })],
  'graph-valid-tree': (g) => {
    const n = g.len(1, 2000, 15);
    const k = g.int(0, 3);
    if (k === 0) return [n, g.treeEdges(n)];
    if (k === 1 && n > 1) { const e = g.treeEdges(n); e.splice(g.int(0, e.length - 1), 1); return [n, e]; }
    return [n, g.edges(n, g.pick([n - 1, n, g.int(0, 2 * n)]))];
  },
  'number-of-connected-components-in-an-undirected-graph': (g) => { const n = g.len(1, 2000, 15); return [n, g.edges(n, g.int(0, Math.min(5000, n + 3)))]; },
  'find-critical-and-pseudo-critical-edges-in-minimum-spanning-tree': (g) => {
    const n = g.len(2, 100, 8);
    const e = connected(g, n, g.int(0, Math.min(200 - (n - 1), (n * (n - 1)) / 2)));
    const w = g.palette(1, g.pick([1000, 3, 1]));
    return [n, e.map(([a, b]) => [a, b, w()])];
  },
  'greatest-common-divisor-traversal': (g) => [g.ints(g.len(1, 1e5, 15), 1, g.pick([1e5, 30, 12]))],
};
