/** Undirected edges on 0..n−1: either a guaranteed two-colourable set or an arbitrary one (often with odd cycles). */
function colourEdges(g, n, m) {
  if (n < 2) return [];
  if (g.bool(0.5)) return g.edges(n, m);
  const side = Array.from({ length: n }, () => g.bool());
  const seen = new Set(), e = [];
  for (let guard = 0; e.length < m && guard < 50 * m + 100; guard++) {
    const a = g.int(0, n - 1), b = g.int(0, n - 1);
    if (a === b || side[a] === side[b]) continue;
    const k = a < b ? `${a},${b}` : `${b},${a}`;
    if (seen.has(k)) continue;
    seen.add(k);
    e.push([a, b]);
  }
  return e;
}

/** A connected graph: a random tree plus extra edges inside a few clusters, so it mixes cycles and bridges. */
function connected(g, n) {
  const tree = g.treeEdges(n);
  const seen = new Set(tree.map(([a, b]) => (a < b ? `${a},${b}` : `${b},${a}`)));
  const extra = g.pick([0, 0, 1, Math.floor(n / 4), Math.floor(n / 2), n]);
  const span = g.pick([3, 5, n]);                                   // small span → cycles stay local, bridges survive
  const e = [...tree];
  for (let guard = 0, added = 0; added < extra && guard < 50 * extra + 100; guard++) {
    const a = g.int(0, n - 1), b = Math.min(n - 1, Math.max(0, a + g.int(-span, span)));
    if (a === b) continue;
    const k = a < b ? `${a},${b}` : `${b},${a}`;
    if (seen.has(k)) continue;
    seen.add(k);
    e.push(g.bool() ? [a, b] : [b, a]);
    added++;
  }
  return g.shuffle(e);
}

/** Distinct directed pairs forming one walk (so an Euler path exists), shuffled. */
function eulerPairs(g, m) {
  const k = g.int(2, Math.max(2, Math.min(12, m + 1)));
  const big = g.bool(0.3);
  const label = Array.from({ length: k }, () => (big ? g.int(0, 1e9) : g.int(0, 30)));
  const used = new Set(), out = [];
  let cur = g.int(0, k - 1);
  for (let step = 0; step < m; step++) {
    const options = [];
    for (let v = 0; v < k; v++) if (label[v] !== label[cur] && !used.has(`${label[cur]},${label[v]}`)) options.push(v);
    if (!options.length) break;
    const next = g.pick(options);
    used.add(`${label[cur]},${label[next]}`);
    out.push([label[cur], label[next]]);
    cur = next;
  }
  return out.length ? g.shuffle(out) : null;
}

export default {
  'is-graph-bipartite': (g) => {
    const n = g.len(1, 100, 30);
    const edges = colourEdges(g, n, g.int(0, Math.min(n * 2, (n * (n - 1)) / 2)));
    const adj = Array.from({ length: n }, () => []);
    for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a); }
    return [adj.map((l) => g.shuffle(l))];
  },
  'possible-bipartition': (g) => {
    const n = g.len(1, 2000, 30);
    const edges = colourEdges(g, n, g.int(0, Math.min(1e4, n * 2, (n * (n - 1)) / 2)));
    return [n, edges.map(([a, b]) => (a < b ? [a + 1, b + 1] : [b + 1, a + 1]))];
  },
  'critical-connections-in-a-network': (g) => {
    const n = g.len(2, 1e5, 40);
    return [n, connected(g, n)];
  },
  'valid-arrangement-of-pairs': (g) => {
    const pairs = eulerPairs(g, g.len(1, 1e5, 30));
    return pairs ? [pairs] : null;
  },
};
