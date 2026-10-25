import { I32 } from './lib.mjs';

const PRINTABLE = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';

/** pairs (i < j) of a summing to t */
const pairsSumming = (a, t) => {
  let c = 0;
  for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) if (a[i] + a[j] === t) c++;
  return c;
};

/** a palindrome over alpha, optionally with one character inserted or changed */
function nearPalindrome(g, n, alpha) {
  const half = g.str(Math.floor(n / 2), alpha);
  let s = half + (n % 2 ? g.str(1, alpha) : '') + [...half].reverse().join('');
  const k = g.int(0, 3);
  if (s.length && k === 1) { const i = g.int(0, s.length); s = s.slice(0, i) + g.str(1, alpha) + s.slice(i); }
  if (s.length && k === 2) { const i = g.int(0, s.length - 1); s = s.slice(0, i) + g.str(1, alpha) + s.slice(i + 1); }
  return s.length ? s : g.str(1, alpha);
}

export default {
  'valid-palindrome': (g) => {
    const alpha = g.pick(['aAbB', 'ab1 ,.', PRINTABLE, 'aA:', '0P', ' .,;']);
    if (g.bool(0.4)) return [g.str(g.len(1, 2e5, 30), alpha)];
    // mirrored letters with random punctuation and case changes in between
    const core = nearPalindrome(g, g.len(0, 40), g.pick(['ab', 'abc', 'a1b2']));
    let s = '';
    for (const c of core) s += (g.bool(0.3) ? g.pick([' ', ',', '.', ':', '!']) : '') + (g.bool() ? c.toUpperCase() : c);
    return [s || g.pick([' ', '.,', 'a'])];
  },
  'remove-duplicates-from-sorted-array': (g) => [g.ints(g.len(1, 3e4, 30), -100, 100, { sorted: 'asc' })],
  'move-zeroes': (g) => { const n = g.len(1, 1e4, 25); return [g.ints(n, ...I32).map((v) => (g.bool(0.4) ? 0 : v))]; },
  'squares-of-a-sorted-array': (g) => [g.ints(g.len(1, 1e4, 25), -1e4, 1e4, { sorted: 'asc' })],
  'two-sum-ii-input-array-is-sorted': (g) => {
    const n = g.len(2, 3e4, 25);
    const a = g.ints(n, -1e5, 1e5, { sorted: 'asc' });
    const i = g.int(0, n - 2), j = g.int(i + 1, n - 1);
    const t = a[i] + a[j];
    return pairsSumming(a, t) === 1 ? [a, t] : null;
  },
  'container-with-most-water': (g) => [g.ints(g.len(2, 1e5, 30), 0, 1e4)],
  '3sum': (g) => [g.ints(g.len(3, 3000, 25), g.pick([-1e5, -5, -2]), g.pick([1e5, 5, 2]))],
  'sort-colors': (g) => [g.ints(g.len(1, 300, 30), 0, 2)],
  'trapping-rain-water': (g) => [g.ints(g.len(1, 2e4, 30), 0, g.pick([1e5, 5, 3]))],
  'remove-element': (g) => { const a = g.ints(g.len(0, 100, 20), 0, g.pick([50, 3])); return [a, g.bool(0.7) && a.length ? g.pick(a) : g.val(0, 100)]; },
  'reverse-string': (g) => [[...g.str(g.len(1, 1e5, 20), g.pick([PRINTABLE, 'ab', 'xyz']))]],
  'valid-palindrome-ii': (g) => [nearPalindrome(g, g.len(1, 60, 40), g.pick(['ab', 'abc', 'aab', 'xyz']))],
  'merge-strings-alternately': (g) => [g.str(g.len(1, 100, 15)), g.str(g.len(1, 100, 15))],
  'merge-sorted-array': (g) => {
    const m = g.int(0, g.pick([0, 1, 5, 12])), n = g.int(m === 0 ? 1 : 0, g.pick([0, 1, 5, 12]));
    if (m + n < 1) return null;
    const p = g.bool() ? [-1e9, 1e9] : [-5, 5];
    const a = g.ints(m, ...p, { sorted: 'asc' }), b = g.ints(n, ...p, { sorted: 'asc' });
    return [[...a, ...Array(n).fill(0)], m, b, n];
  },
  '4sum': (g) => {
    const big = g.bool(0.3);
    const a = g.ints(g.len(1, 200, 18), big ? -1e9 : -6, big ? 1e9 : 6);
    const t = big && a.length >= 4 && g.bool() ? Math.max(-1e9, Math.min(1e9, a[0] + a[1] + a[2] + a[3])) : g.val(big ? -1e9 : -10, big ? 1e9 : 10);
    return [a, t];
  },
  'rotate-array': (g) => { const n = g.len(1, 1e5, 20); return [g.ints(n, ...I32), g.pick([0, 1, n, n + 1, 2 * n, g.int(0, 1e5), g.int(0, 3 * n)])]; },
};
