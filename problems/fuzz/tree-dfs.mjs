import { fromLevel, levelOrder, mirror, nodesOf, preorder, inorder, leafSums } from './lib.mjs';

/** a random tree with n nodes and values from [lo, hi] (distinct when asked) */
function tree(g, n, lo, hi, distinct = false) {
  const vals = distinct ? g.ints(n, lo, hi, { distinct: true, sorted: null }) : null;
  const p = g.palette(lo, hi);
  return g.tree(n, (i) => (vals ? vals[i] : p()));
}

/** a power-of-two grid made of uniform blocks of random sizes */
function quadGrid(g) {
  const n = g.bool(0.06) ? 64 : g.pick([1, 2, 4, 8, 16, 32]);
  const grid = Array.from({ length: n }, () => Array(n).fill(0));
  const fill = (r, c, size) => {
    if (size === 1 || g.bool(0.35)) { const v = g.int(0, 1); for (let i = r; i < r + size; i++) for (let j = c; j < c + size; j++) grid[i][j] = v; return; }
    const h = size / 2;
    fill(r, c, h); fill(r, c + h, h); fill(r + h, c, h); fill(r + h, c + h, h);
  };
  fill(0, 0, n);
  return grid;
}

export default {
  'maximum-depth-of-binary-tree': (g) => [tree(g, g.len(0, 1e4, 30), -100, 100)],
  'same-tree': (g) => {
    const p = tree(g, g.len(0, 100, 15), -1e4, 1e4);
    if (g.bool(0.3)) return [p, tree(g, g.len(0, 100, 15), -1e4, 1e4)];
    const q = levelOrder(fromLevel(p));
    if (q.length && g.bool(0.5)) {
      const k = g.int(0, q.length - 1);
      if (q[k] !== null) q[k] = g.bool() ? q[k] + 1 : null;
      while (q.length && q[q.length - 1] === null) q.pop();
      return [p, levelOrder(fromLevel(q))];
    }
    return [p, q];
  },
  'invert-binary-tree': (g) => [tree(g, g.len(0, 100, 20), -100, 100)],
  'symmetric-tree': (g) => {
    if (g.bool(0.3)) return [tree(g, g.len(1, 1000, 12), -100, 100)];
    const half = fromLevel(tree(g, g.len(0, 40, 10), g.pick([-100, 1]), g.pick([100, 2])));
    const t = { v: g.int(-100, 100), l: half, r: mirror(half) };
    if (g.bool(0.35)) { const ns = nodesOf(t); g.pick(ns).v += 1; }
    return [levelOrder(t)];
  },
  'path-sum': (g) => {
    const t = tree(g, g.len(0, 5000, 20), -1000, g.pick([1000, 3]));
    const sums = leafSums(fromLevel(t)).filter((s) => Math.abs(s) <= 1000);
    return [t, sums.length && g.bool(0.6) ? g.pick(sums) : g.val(-1000, 1000)];
  },
  'balanced-binary-tree': (g) => [tree(g, g.len(0, 5000, 25), -1e4, 1e4)],
  'count-good-nodes-in-binary-tree': (g) => [tree(g, g.len(1, 1e5, 30), -1e4, g.pick([1e4, -9998]))],
  'lowest-common-ancestor-of-a-binary-tree': (g) => {
    const t = tree(g, g.len(2, 1e5, 25), -1e9, 1e9, true);
    const vals = t.filter((v) => v !== null);
    const [p, q] = g.shuffle([...vals]).slice(0, 2);
    return [t, p, g.bool(0.2) ? t[0] === p ? q : t[0] : q];
  },
  'construct-binary-tree-from-preorder-and-inorder-traversal': (g) => {
    const root = fromLevel(tree(g, g.len(1, 3000, 25), -3000, 3000, true));
    return [preorder(root), inorder(root)];
  },
  'serialize-and-deserialize-binary-tree': (g) => [tree(g, g.len(0, 1e5, 30), -1000, 1000)],
  'binary-tree-inorder-traversal': (g) => [tree(g, g.len(0, 100, 20), -100, 100)],
  'binary-tree-preorder-traversal': (g) => [tree(g, g.len(0, 100, 20), -100, 100)],
  'binary-tree-postorder-traversal': (g) => [tree(g, g.len(0, 100, 20), -100, 100)],
  'subtree-of-another-tree': (g) => {
    const t = tree(g, g.len(1, 2000, 20), -1e4, g.pick([1e4, -9998]));
    const root = fromLevel(t);
    if (g.bool(0.4)) return [t, tree(g, g.len(1, 1000, 5), -1e4, g.pick([1e4, -9998]))];
    const sub = levelOrder(g.pick(nodesOf(root)));
    if (g.bool(0.3)) { const s = fromLevel(sub); const ns = nodesOf(s); const leaf = g.pick(ns); if (g.bool()) leaf.l = { v: leaf.v, l: null, r: null }; else leaf.v += 1; return [t, levelOrder(s)]; }
    return [t, sub];
  },
  'construct-quad-tree': (g) => [quadGrid(g)],
  'delete-leaves-with-a-given-value': (g) => { const t = tree(g, g.len(1, 3000, 20), 1, g.pick([1000, 2, 3])); const vals = t.filter((v) => v !== null); return [t, g.bool(0.75) ? g.pick(vals) : g.val(1, 1000)]; },
};
