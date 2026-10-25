const MAX = 2 ** 31 - 1;

const distinct = (s, t) => { const d = Array(t.length + 1).fill(0); d[0] = 1; for (const c of s) for (let j = t.length; j >= 1; j--) if (t[j - 1] === c) d[j] += d[j - 1]; return d[t.length]; };
/** a string that keeps a subsequence relationship with `s` about half of the time */
const related = (g, s, alpha, maxLen) => (g.bool(0.5) && s.length ? [...s].filter(() => g.bool(0.6)).join('') || s[0] : g.str(g.len(1, maxLen, 12), alpha));

export default {
  'longest-common-subsequence': (g) => { const alpha = g.pick(['ab', 'abc', 'abcdefghijklmnopqrstuvwxyz']); const a = g.str(g.len(1, 1000, 20), alpha); return [a, related(g, a, alpha, 1000)]; },
  'delete-operation-for-two-strings': (g) => { const alpha = g.pick(['ab', 'abc', 'sea']); const a = g.str(g.len(1, 500, 20), alpha); return [a, related(g, a, alpha, 500)]; },
  'longest-palindromic-substring': (g) => {
    const alpha = g.pick(['a', 'ab', 'abc', 'aA1', 'abcdefghijklmnopqrstuvwxyz']);
    if (g.bool(0.4)) { const half = g.str(g.len(0, 20, 10), alpha); return [g.str(g.int(0, 6), alpha) + half + (g.bool() ? g.str(1, alpha) : '') + [...half].reverse().join('') + g.str(g.int(0, 6), alpha) || 'a']; }
    return [g.str(g.len(1, 1000, 30), alpha)];
  },
  'longest-palindromic-subsequence': (g) => [g.str(g.len(1, 1000, 30), g.pick(['a', 'ab', 'abc', 'bbbab', 'abcdefghijklmnopqrstuvwxyz']))],
  'palindromic-substrings': (g) => [g.str(g.len(1, 1000, 30), g.pick(['a', 'ab', 'abc', 'abcdefghijklmnopqrstuvwxyz']))],
  'interleaving-string': (g) => {
    const alpha = g.pick(['a', 'ab', 'abc']);
    const a = g.str(g.len(0, 100, 10), alpha), b = g.str(g.len(0, 100, 10), alpha);
    let i = 0, j = 0, c = '';
    while (i < a.length || j < b.length) c += (j >= b.length || (i < a.length && g.bool())) ? a[i++] : b[j++];
    const k = g.int(0, 3);
    if (k === 1 && c.length) { const p = g.int(0, c.length - 1); c = c.slice(0, p) + g.str(1, alpha + 'z') + c.slice(p + 1); }
    if (k === 2) c = c.slice(0, Math.max(0, c.length - 1));
    if (k === 3) c = g.str(g.len(0, 200, 20), alpha);
    return [a, b, c];
  },
  'edit-distance': (g) => { const alpha = g.pick(['ab', 'abc', 'horse']); const a = g.str(g.len(0, 500, 15), alpha); return [a, g.bool(0.5) ? related(g, a, alpha, 500) + g.str(g.int(0, 3), alpha) : g.str(g.len(0, 500, 15), alpha)]; },
  'distinct-subsequences': (g) => { const alpha = g.pick(['ab', 'abc', 'aA', 'rabit']); const s = g.str(g.len(1, 1000, 25), alpha); const t = related(g, s, alpha, 8); return distinct(s, t) <= MAX ? [s, t] : null; },
  'regular-expression-matching': (g) => {
    const alpha = g.pick(['a', 'ab', 'abc']);
    let p = '';
    while (p.length < g.int(1, 21)) { const tok = g.bool(0.2) ? '.' : g.str(1, alpha); p += tok + (g.bool(0.4) && p.length + 2 <= 21 ? '*' : ''); }
    p = p.slice(0, 21);
    if (p.endsWith('*') && p.length === 1) p = 'a';
    // s: sometimes produced by the pattern, sometimes random
    let s = '';
    if (g.bool(0.5)) { for (let k = 0; k < p.length; k++) { const c = p[k] === '.' ? g.str(1, alpha) : p[k]; if (p[k + 1] === '*') { s += c.repeat(g.int(0, 3)); k++; } else s += c; } }
    else s = g.str(g.len(0, 21, 10), alpha);
    return [s.slice(0, 21), p];
  },
};
