import { I32 } from './lib.mjs';

const tree = (g, n, lo, hi) => { const p = g.palette(lo, hi); return g.tree(n, () => p()); };

export default {
  'binary-tree-level-order-traversal': (g) => [tree(g, g.len(0, 2000, 25), -1000, 1000)],
  'average-of-levels-in-binary-tree': (g) => [tree(g, g.len(1, 1e4, 25), ...(g.bool(0.6) ? I32 : [-5, 5]))],
  'minimum-depth-of-binary-tree': (g) => [tree(g, g.len(0, 1e5, 25), -1000, 1000)],
  'binary-tree-right-side-view': (g) => [tree(g, g.len(0, 100, 20), -100, 100)],
  'binary-tree-zigzag-level-order-traversal': (g) => [tree(g, g.len(0, 2000, 25), -100, 100)],
  'find-largest-value-in-each-tree-row': (g) => [tree(g, g.len(0, 1e4, 25), ...(g.bool(0.6) ? I32 : [-5, 5]))],
  'populating-next-right-pointers-in-each-node': (g) => { const n = g.pick([0, 1, 3, 7, 15, 31, 63]); const p = g.palette(-1000, 1000); return [Array.from({ length: n }, () => p())]; },
  'maximum-width-of-binary-tree': (g) => [tree(g, g.len(1, 30, 30), -100, 100)],
};
