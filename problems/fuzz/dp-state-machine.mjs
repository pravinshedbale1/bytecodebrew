export default {
  'best-time-to-buy-and-sell-stock-ii': (g) => [g.ints(g.len(1, 3e4, 30), 0, g.pick([1e4, 5, 0]))],
  'best-time-to-buy-and-sell-stock-with-transaction-fee': (g) => [g.ints(g.len(1, 5e4, 30), 1, g.pick([5e4, 10])), g.pick([0, 1, 2, 5e4, g.int(0, 10)])],
  'best-time-to-buy-and-sell-stock-iii': (g) => [g.ints(g.len(1, 1e5, 30), 0, g.pick([1e5, 5, 0]))],
  'best-time-to-buy-and-sell-stock-iv': (g) => [g.pick([1, 2, 3, 100, g.int(1, 10)]), g.ints(g.len(1, 1000, 30), 0, g.pick([1000, 5]))],
  'student-attendance-record-ii': (g) => [g.bool(0.5) ? g.int(1, 1e5) : g.pick([1, 2, 3, 4, 5, 10, 100, 1e5, 99999, g.int(1, 50), g.int(1, 1e5)])],
  'beautiful-arrangement': { all: Array.from({ length: 15 }, (_, i) => [i + 1]) },
  'partition-to-k-equal-sum-subsets': (g) => {
    const n = g.len(1, 16, 16);
    if (g.bool(0.5)) {
      const k = g.int(1, n), side = g.pick([g.int(1, 20), g.int(1, 1e4)]);
      const out = [];
      for (let s = 0; s < k; s++) { let left = side; const parts = Math.max(1, Math.floor(n / k)); for (let p = 1; p < parts && left > 1; p++) { const v = g.int(1, left - 1); out.push(v); left -= v; } out.push(left); }
      if (out.length > 16) return null;
      if (g.bool(0.2)) out[0] += 1;
      return [g.shuffle(out), k];
    }
    return [g.ints(n, 1, g.pick([1e4, 6, 3])), g.int(1, n)];
  },
  'minimum-number-of-work-sessions-to-finish-the-tasks': (g) => { const t = g.ints(g.len(1, 14, 14), 1, g.pick([10, 3])); const mx = Math.max(...t); return [t, g.int(mx, 15)]; },
  'shortest-path-visiting-all-nodes': (g) => {
    const n = g.len(1, 12, 12);
    const adj = Array.from({ length: n }, () => new Set());
    for (const [a, b] of g.treeEdges(n)) { adj[a].add(b); adj[b].add(a); }
    for (const [a, b] of g.edges(n, g.int(0, n))) { adj[a].add(b); adj[b].add(a); }
    return [adj.map((s) => [...s].sort((x, y) => x - y))];
  },
  'find-the-shortest-superstring': (g) => {
    const base = g.str(g.int(10, 60), g.pick(['ab', 'abc', 'abcd']));
    let words = [...new Set(Array.from({ length: g.len(1, 8, 8) }, () => { const i = g.int(0, base.length - 2); return base.slice(i, i + g.int(2, 20)); }))];
    words = words.filter((w) => !words.some((o) => o !== w && o.includes(w)));
    return words.length ? [g.shuffle(words)] : null;
  },
};
