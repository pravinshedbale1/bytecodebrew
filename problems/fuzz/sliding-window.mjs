import { LOWER, UPPER } from './lib.mjs';

/** s2 that sometimes contains a permutation of s1 */
function withPermutation(g, s1, alpha) {
  const pre = g.str(g.len(0, 10, 6), alpha), post = g.str(g.len(0, 10, 6), alpha);
  return g.bool(0.5) ? pre + g.shuffle([...s1]).join('') + post : g.str(g.len(1, 30, 20), alpha);
}

export default {
  'maximum-average-subarray-i': (g) => { const n = g.len(1, 1e5, 25); return [g.ints(n, -1e4, 1e4), g.pick([1, n, g.int(1, n)])]; },
  'longest-substring-without-repeating-characters': (g) => [g.str(g.len(0, 5e4, 30), g.pick(['ab', 'abc', 'abcdef', ' a!1', 'aA', LOWER + UPPER + '0123456789 !?']))],
  'minimum-size-subarray-sum': (g) => {
    const nums = g.ints(g.len(1, 1e5, 25), 1, g.pick([1e4, 5, 1]));
    const sum = nums.reduce((a, b) => a + b, 0);
    return [g.pick([1, sum, sum + 1, g.int(1, sum), 1e9, Math.max(...nums)]), nums];
  },
  'max-consecutive-ones-iii': (g) => { const n = g.len(1, 1e5, 30); return [g.ints(n, 0, 1), g.pick([0, 1, n, g.int(0, n), n + 3])]; },
  'longest-repeating-character-replacement': (g) => { const s = g.str(g.len(1, 1e5, 30), g.pick(['AB', 'ABC', UPPER])); return [s, g.pick([0, s.length, g.int(0, s.length)])]; },
  'permutation-in-string': (g) => { const alpha = g.pick(['ab', 'abc', 'abcd']); const s1 = g.str(g.len(1, 1e4, 6), alpha); return [s1, withPermutation(g, s1, alpha)]; },
  'find-all-anagrams-in-a-string': (g) => { const alpha = g.pick(['ab', 'abc', 'abcd']); const p = g.str(g.len(1, 3e4, 5), alpha); return [withPermutation(g, p, alpha), p]; },
  'minimum-window-substring': (g) => { const alpha = g.pick(['aAb', 'ABC', 'abcd', 'aA']); return [g.str(g.len(1, 1e5, 30), alpha), g.str(g.len(1, 1e5, 5), alpha)]; },
  'subarrays-with-k-different-integers': (g) => { const n = g.len(1, 2e4, 25); return [g.ints(n, 1, g.int(1, n)), g.pick([1, n, g.int(1, n), g.int(1, Math.min(n, 4))])]; },
  'contains-duplicate-ii': (g) => { const n = g.len(1, 1e5, 25); return [g.ints(n, -1e9, 1e9), g.pick([0, 1, n, g.int(0, n), 1e5])]; },
  'find-k-closest-elements': (g) => {
    const n = g.len(1, 1e4, 25);
    const arr = g.ints(n, -1e4, 1e4, { sorted: 'asc' });
    return [arr, g.pick([1, n, g.int(1, n)]), g.pick([-1e4, 1e4, g.pick(arr), Math.min(1e4, g.pick(arr) + 1), g.int(-1e4, 1e4)])];
  },
};
