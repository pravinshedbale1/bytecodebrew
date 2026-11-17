import { LOWER, UPPER } from './lib.mjs';

/** Mostly zeros, sometimes none, with other values from the full range. */
function zeroish(g, n) {
  const p = g.pick([0, 0.3, 0.6, 0.9, 1]);
  return Array.from({ length: n }, () => (g.bool(p) ? 0 : g.val(-1e9, 1e9) || 1));
}

/** A tree on 0..n−1 as an edge list (shape varies: random, path, star, caterpillar). */
function treeOf(g, n) {
  const shape = g.int(0, 3);
  if (shape === 0 || n < 3) return g.treeEdges(n);
  const label = g.perm(n);
  const e = [];
  for (let i = 1; i < n; i++) {
    const p = shape === 1 ? i - 1 : shape === 2 ? 0 : (i % 2 ? i - 1 : Math.max(0, i - 2));
    e.push(g.bool() ? [label[p], label[i]] : [label[i], label[p]]);
  }
  return g.shuffle(e);
}

export default {
  'sum-of-all-odd-length-subarrays': (g) => [g.ints(g.len(1, 100, 30), 1, g.pick([1000, 3]))],
  'number-of-zero-filled-subarrays': (g) => [zeroish(g, g.len(1, 1e5, 30))],
  'vowels-of-all-substrings': (g) => [g.str(g.len(1, 1e5, 30), g.pick([LOWER, 'aeiou', 'abe', 'xyz']))],
  'total-hamming-distance': (g) => [g.ints(g.len(1, 1e4, 25), 0, g.pick([1e9, 15, 1]))],
  'bitwise-xor-of-all-pairings': (g) => [g.ints(g.len(1, 1e5, 12), 0, g.pick([1e9, 7])), g.ints(g.len(1, 1e5, 12), 0, g.pick([1e9, 7]))],
  'sum-of-absolute-differences-in-a-sorted-array': (g) => [g.ints(g.len(2, 1e5, 25), 1, g.pick([1e4, 5]), { sorted: 'asc' })],
  'sum-of-distances': (g) => [g.ints(g.len(1, 1e5, 25), 0, g.pick([1e9, 3, 1]))],
  'subarray-product-less-than-k': (g) => {
    const a = g.ints(g.len(1, 3e4, 20), 1, g.pick([1000, 10, 2]));
    return [a, g.pick([0, 1, 2, g.int(0, 1e6), g.int(1, 100), 1e6])];
  },
  'count-subarrays-where-max-element-appears-at-least-k-times': (g) => {
    const a = g.ints(g.len(1, 1e5, 25), 1, g.pick([1e6, 4, 2]));
    const copies = a.filter((v) => v === Math.max(...a)).length;
    return [a, g.pick([1, copies, Math.max(1, copies - 1), copies + 1, g.int(1, 5)])];
  },
  'sum-of-subarray-ranges': (g) => [g.ints(g.len(1, 1000, 25), -1e9, g.pick([1e9, -1e9 + 3, 2]))],
  'minimum-fuel-cost-to-report-to-the-capital': (g) => {
    const n = g.len(1, 1e5, 20);
    return [treeOf(g, n), g.pick([1, 2, 3, g.int(1, 1e5), 1e5])];
  },
  'sum-of-subsequence-widths': (g) => [g.ints(g.len(1, 1e5, 25), 1, g.pick([1e5, 3]))],
  'total-appeal-of-a-string': (g) => [g.str(g.len(1, 1e5, 30), g.pick([LOWER, 'ab', 'abc', 'z']))],
  'count-unique-characters-of-all-substrings-of-a-given-string': (g) => [g.str(g.len(1, 1e5, 30), g.pick([UPPER, 'AB', 'ABC', 'LEETCODE']))],
  'count-subarrays-with-score-less-than-k': (g) => {
    const a = g.ints(g.len(1, 1e5, 20), 1, g.pick([1e5, 10, 1]));
    return [a, g.pick([1, 2, g.int(1, 200), g.int(1, 1e7), 1e15])];
  },
  'sum-of-total-strength-of-wizards': (g) => [g.ints(g.len(1, 1e5, 25), 1, g.pick([1e9, 4, 1]))],
  'sum-of-distances-in-tree': (g) => {
    const n = g.len(1, 3e4, 20);
    return [n, treeOf(g, n)];
  },
};
