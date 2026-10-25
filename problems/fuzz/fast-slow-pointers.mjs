import { I32 } from './lib.mjs';

export default {
  'middle-of-the-linked-list': (g) => [g.ints(g.len(1, 100, 20), 1, 100)],
  'linked-list-cycle': (g) => { const n = g.len(0, 1e4, 20); return [g.ints(n, -1e5, 1e5), n ? g.pick([-1, 0, n - 1, g.int(-1, n - 1)]) : -1]; },
  'happy-number': (g) => [g.pick([1, 2, 7, 10, 19, 100, 1111111, I32[1], I32[1] - 1, g.int(1, 1000), g.int(1, 1e6), g.int(1, I32[1]), g.int(1, I32[1])])],
  'palindrome-linked-list': (g) => {
    const half = g.ints(g.len(0, 20, 12), 0, g.pick([9, 1]));
    const mid = g.bool() ? [g.int(0, 9)] : [];
    const a = [...half, ...mid, ...[...half].reverse()];
    if (!a.length) return [[g.int(0, 9)]];
    if (g.bool(0.4)) a[g.int(0, a.length - 1)] = g.int(0, 9);
    return [a];
  },
  'remove-nth-node-from-end-of-list': (g) => { const a = g.ints(g.len(1, 30, 30), 0, 100); return [a, g.pick([1, a.length, g.int(1, a.length)])]; },
  'linked-list-cycle-ii': (g) => { const n = g.len(0, 1e4, 20); return [g.ints(n, -1e5, 1e5), n ? g.pick([-1, 0, n - 1, g.int(-1, n - 1)]) : -1]; },
  'reorder-list': (g) => [g.ints(g.len(1, 5e4, 20), 1, 1000)],
  'find-the-duplicate-number': (g) => {
    const n = g.len(1, 1e5, 20);
    const d = g.int(1, n);
    const k = g.pick([2, 2, 3, n + 1, g.int(2, n + 1)]);
    const others = g.shuffle(Array.from({ length: n }, (_, i) => i + 1).filter((v) => v !== d)).slice(0, n + 1 - k);
    return others.length + k === n + 1 ? [g.shuffle([...Array(k).fill(d), ...others])] : null;
  },
};
