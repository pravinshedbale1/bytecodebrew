import { I32, LOWER } from './lib.mjs';

const PRINTABLE = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';

/** a solved Sudoku: a shifted base pattern with digits relabelled and rows/columns shuffled inside bands */
function solvedSudoku(g) {
  const digits = g.perm(9, 1);
  const band = () => g.shuffle([0, 1, 2]).flatMap((b) => g.shuffle([0, 1, 2]).map((r) => b * 3 + r));
  const rows = band(), cols = band();
  return rows.map((r) => cols.map((c) => digits[(r * 3 + Math.floor(r / 3) + c) % 9]));
}

export default {
  'two-sum': (g) => {
    const n = g.len(2, 1e4, 25);
    const a = g.ints(n, -1e9, 1e9);
    const i = g.int(0, n - 2), j = g.int(i + 1, n - 1);
    const t = a[i] + a[j];
    if (Math.abs(t) > 1e9) return null;
    let pairs = 0;
    for (let x = 0; x < n; x++) for (let y = x + 1; y < n; y++) if (a[x] + a[y] === t) pairs++;
    return pairs === 1 ? [a, t] : null;
  },
  'contains-duplicate': (g) => [g.ints(g.len(1, 1e5, 30), -1e9, 1e9)],
  'valid-anagram': (g) => {
    const s = g.str(g.len(1, 5e4, 25), g.pick(['ab', 'abc', LOWER]));
    const k = g.int(0, 3);
    if (k === 0) return [s, g.str(g.len(1, 5e4, 25), 'abc')];
    let t = g.shuffle([...s]);
    if (k === 2) t[g.int(0, t.length - 1)] = g.pick([...'abcz']);
    if (k === 3) t = t.slice(1).concat(t.length > 1 ? [] : ['a', 'b']);
    return [s, t.join('') || 'a'];
  },
  'first-unique-character-in-a-string': (g) => [g.str(g.len(1, 1e5, 30), g.pick(['ab', 'abc', 'abcd', LOWER]))],
  'group-anagrams': (g) => [g.words(g.len(1, 1e4, 15), 0, 100, g.pick(['ab', 'abc', 'eat']))],
  'longest-consecutive-sequence': (g) => {
    const n = g.len(0, 1e5, 30);
    if (g.bool(0.3)) return [g.ints(n, -1e9, 1e9)];
    const start = g.pick([-1e9, 1e9 - 40, g.int(-50, 50)]);
    return [g.shuffle(Array.from({ length: n }, () => start + g.int(0, Math.max(1, n + 3))))];
  },
  'valid-sudoku': (g) => {
    const s = solvedSudoku(g);
    const keep = g.pick([0.05, 0.3, 0.6, 1]);
    const b = s.map((row) => row.map((d) => (g.rand() < keep ? String(d) : '.')));
    if (g.bool(0.55)) {
      // break one rule: copy a digit into the same row, column or box
      const r = g.int(0, 8), c = g.int(0, 8), d = String(s[r][c]);
      const kind = g.int(0, 2);
      let rr = r, cc = c;
      if (kind === 0) cc = (c + g.int(1, 8)) % 9;
      else if (kind === 1) rr = (r + g.int(1, 8)) % 9;
      else { rr = Math.floor(r / 3) * 3 + g.int(0, 2); cc = Math.floor(c / 3) * 3 + g.int(0, 2); if (rr === r && cc === c) cc = Math.floor(c / 3) * 3 + ((c % 3) + 1) % 3; }
      b[r][c] = d;
      b[rr][cc] = d;
    }
    return [b];
  },
  'first-missing-positive': (g) => {
    const n = g.len(1, 1e5, 25);
    if (g.bool(0.25)) return [g.ints(n, ...I32)];
    return [g.shuffle(Array.from({ length: n }, () => (g.bool(0.1) ? g.pick(I32) : g.int(-2, n + 2))))];
  },
  'concatenation-of-array': (g) => [g.ints(g.len(1, 1000, 20), 1, 1000)],
  'majority-element': (g) => {
    const n = g.len(1, 5e4, 25);
    const maj = g.val(-1e9, 1e9), cnt = g.int(Math.floor(n / 2) + 1, n);
    const rest = g.ints(n - cnt, -1e9, 1e9).map((v) => (v === maj ? (v === 1e9 ? v - 1 : v + 1) : v));
    return [g.shuffle([...Array(cnt).fill(maj), ...rest])];
  },
  'encode-and-decode-strings': (g) => [Array.from({ length: g.len(0, 99, 8) }, () => g.str(g.len(0, 199, 10), g.pick([PRINTABLE, '#4', '12#', ' ,;'])))],
  'majority-element-ii': (g) => {
    const n = g.len(1, 5e4, 25);
    const heavy = [g.val(-1e9, 1e9), g.val(-1e9, 1e9)];
    return [g.shuffle(Array.from({ length: n }, () => (g.bool(0.6) ? g.pick(heavy) : g.val(-1e9, 1e9))))];
  },
  'verifying-an-alien-dictionary': (g) => {
    const order = g.shuffle([...LOWER]).join('');
    const alpha = order.slice(0, g.int(2, 4));
    let words = Array.from({ length: g.len(1, 100, 8) }, () => g.str(g.len(1, 20, 5), alpha));
    if (g.bool(0.6)) {
      const rank = (w) => [...w].map((c) => order.indexOf(c));
      words.sort((a, b) => { const x = rank(a), y = rank(b); for (let k = 0; k < Math.min(x.length, y.length); k++) if (x[k] !== y[k]) return x[k] - y[k]; return x.length - y.length; });
      if (g.bool(0.3) && words.length > 1) { const i = g.int(0, words.length - 2); [words[i], words[i + 1]] = [words[i + 1], words[i]]; }
    }
    return [words, order];
  },
};
