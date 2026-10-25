import { LOWER, UPPER, DIGITS } from './lib.mjs';

export default {
  'sort-array-by-increasing-frequency': (g) => [g.ints(g.len(1, 100, 25), -100, 100)],
  'sort-an-array': (g) => [g.ints(g.len(1, 5e4, 30), -5e4, 5e4)],
  'largest-number': (g) => {
    const n = g.len(1, 100, 10);
    const kind = g.int(0, 3);
    if (kind === 0) return [Array(n).fill(0)];
    if (kind === 1) return [Array.from({ length: n }, () => g.pick([3, 30, 34, 5, 9, 0, 10, 1, 12, 121, 824, 8247, 999999999, 1000000000]))];
    if (kind === 2) return [Array.from({ length: n }, () => Number(g.pick(['1', '12', '121', '1212', '2', '21', '212'])))];
    return [g.ints(n, 0, 1e9)];
  },
  'h-index': (g) => [g.ints(g.len(1, 5000, 25), 0, g.pick([1000, 10, 3, 0]))],
  'sort-characters-by-frequency': (g) => [g.str(g.len(1, 5e5, 30), g.pick(['aA', 'ab1', 'aabbc', LOWER + UPPER + DIGITS]))],
  'maximum-gap': (g) => [g.ints(g.len(1, 1e5, 25), 0, g.pick([1e9, 10, 0]))],
};
