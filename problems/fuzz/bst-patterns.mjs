import { I32, fromLevel, levelOrder, nodesOf } from './lib.mjs';

const bst = (g, n, lo, hi) => g.bst(g.ints(n, lo, hi, { distinct: true }));

export default {
  'search-in-a-binary-search-tree': (g) => { const t = bst(g, g.len(1, 5000, 25), 1, g.pick([1e7, 40])); const vals = t.filter((v) => v !== null); return [t, g.bool(0.6) ? g.pick(vals) : g.val(1, 1e7)]; },
  'convert-sorted-array-to-binary-search-tree': (g) => [g.ints(g.len(1, 1e4, 30), -1e4, 1e4, { distinct: true, sorted: 'asc' })],
  'lowest-common-ancestor-of-a-binary-search-tree': (g) => {
    const t = bst(g, g.len(2, 1e5, 25), -1e9, 1e9);
    const [p, q] = g.shuffle(t.filter((v) => v !== null)).slice(0, 2);
    return [t, p, q];
  },
  'validate-binary-search-tree': (g) => {
    const n = g.len(1, 1e4, 20);
    const lo = g.bool(0.4) ? I32[0] : -10, hi = g.bool(0.4) ? I32[1] : 10;
    if (n > hi - lo + 1) return null;
    const root = fromLevel(bst(g, n, lo, hi));
    const ns = nodesOf(root);
    const k = g.int(0, 4);
    if (k === 1 && ns.length > 1) { const [a, b] = g.shuffle([...ns]).slice(0, 2); [a.v, b.v] = [b.v, a.v]; }
    if (k === 2) { const a = g.pick(ns); a.v = g.pick([I32[0], I32[1], a.v + 1, a.v - 1].filter((v) => v >= I32[0] && v <= I32[1])); }
    if (k === 3 && ns.length > 1) { const a = g.pick(ns), b = g.pick(ns); a.v = b.v; }
    return [levelOrder(root)];
  },
  'kth-smallest-element-in-a-bst': (g) => { const t = bst(g, g.len(1, 1e4, 25), 0, 1e4); const n = t.filter((v) => v !== null).length; return [t, g.pick([1, n, g.int(1, n)])]; },
  'insert-into-a-binary-search-tree': (g) => {
    const vals = g.ints(g.len(0, 1e4, 20) + 1, -1e8, g.pick([1e8, -1e8 + 50]), { distinct: true });
    const val = vals.pop();
    return [g.bst(vals), val];
  },
  'delete-node-in-a-bst': (g) => { const t = bst(g, g.len(0, 1e4, 20), -1e5, g.pick([1e5, -1e5 + 40])); const vals = t.filter((v) => v !== null); return [t, vals.length && g.bool(0.75) ? g.pick(vals) : g.val(-1e5, 1e5)]; },
  'binary-search-tree-iterator': (g) => {
    const t = bst(g, g.len(1, 1e5, 20), 0, g.pick([1e6, 40]));
    let left = t.filter((v) => v !== null).length;
    const ops = ['BSTIterator'], args = [[t]];
    for (let i = 0, k = g.len(1, 60, 30); i < k; i++) {
      if (left > 0 && g.bool(0.6)) { ops.push('next'); args.push([]); left--; } else { ops.push('hasNext'); args.push([]); }
    }
    return [ops, args];
  },
  'recover-binary-search-tree': (g) => {
    const n = g.len(2, 1000, 20);
    const root = fromLevel(bst(g, n, ...(g.bool(0.4) ? I32 : [-50, 50])));
    const ns = nodesOf(root);
    const [a, b] = g.bool(0.3) ? (() => { const s = [...ns].sort((x, y) => x.v - y.v); const i = g.int(0, s.length - 2); return [s[i], s[i + 1]]; })() : g.shuffle([...ns]).slice(0, 2);
    [a.v, b.v] = [b.v, a.v];
    return [levelOrder(root)];
  },
};
