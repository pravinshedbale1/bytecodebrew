/**
 * Two-string and interval tables for <DpGridViz> (the DP Strings lesson). Same step shape as dp2d.
 * Pure, so scripts/viz-check.mjs can compare each mode with a brute force.
 */
import { rng } from './util.js';

export const STR = {
  deletes: { label: 'Delete to make equal', input: { mode: 'deletes', a: 'sea', b: 'eat' } },
  lps: { label: 'Palindromic subsequence', input: { mode: 'lps', s: 'bbbab' } },
  palsub: { label: 'Palindromic substring', input: { mode: 'palsub', s: 'babad' } },
  palcount: { label: 'Count palindromes', input: { mode: 'palcount', s: 'aaba' } },
  interleave: { label: 'Interleaving string', input: { mode: 'interleave', a: 'aab', b: 'dbc', c: 'adabbc' } },
  distinct: { label: 'Distinct subsequences', input: { mode: 'distinct', a: 'rabbbit', b: 'rabbit' } },
  regex: { label: 'Regex matching', input: { mode: 'regex', a: 'aab', b: 'c*a*b' } },
};

export const strCode = (mode) => ({
  deletes: [['base', 'dp[i][0] = i; dp[0][j] = j;            // delete everything'], ['match', 'a[i−1] == b[j−1]: dp[i][j] = dp[i−1][j−1]      // keep both'], ['fill', 'else dp[i][j] = 1 + min(dp[i−1][j], dp[i][j−1])  // delete one']],
  lps: [['base', 'dp[i][i] = 1;'], ['match', 's[i] == s[j]: dp[i][j] = dp[i+1][j−1] + 2        // both ends join'], ['fill', 'else dp[i][j] = max(dp[i+1][j], dp[i][j−1])      // drop one end']],
  palsub: [['base', 'pal[i][i] = true; pal[i][i+1] = (s[i] == s[i+1])'], ['fill', 'pal[i][j] = s[i] == s[j] && pal[i+1][j−1]          // by length'], ['match', 'longer palindrome → remember it']],
  palcount: [['base', 'pal[i][i] = true; pal[i][i+1] = (s[i] == s[i+1])'], ['fill', 'pal[i][j] = s[i] == s[j] && pal[i+1][j−1]'], ['match', 'count every true cell']],
  interleave: [['base', 'lengths must add up; ok[0][0] = true'], ['fill', 'ok[i][j] = (ok[i−1][j] && a[i−1] == c[i+j−1]) || (ok[i][j−1] && b[j−1] == c[i+j−1])']],
  distinct: [['base', 'dp[i][0] = 1;                          // the empty t: one way'], ['fill', 'dp[i][j] = dp[i−1][j]  +  (s[i−1] == t[j−1] ? dp[i−1][j−1] : 0)   // skip s[i−1], or use it']],
  regex: [['base', 'dp[0][0] = true; dp[0][j] = (p[j−1] == "*" && dp[0][j−2])   // x* can match nothing'], ['match', 'p[j−1] is a letter or ".": dp[i][j] = matches(s[i−1], p[j−1]) && dp[i−1][j−1]'], ['fill', 'p[j−1] == "*": dp[i][j] = dp[i][j−2] || (matches(s[i−1], p[j−2]) && dp[i−1][j])']],
})[mode];

// ---------------------------------------------------------------- brute forces

const isPal = (x) => x === [...x].reverse().join('');
export function strAnswer(input) {
  const { mode } = input;
  if (mode === 'deletes') { const { a, b } = input; const lcs = (i, j) => (i === a.length || j === b.length ? 0 : a[i] === b[j] ? 1 + lcs(i + 1, j + 1) : Math.max(lcs(i + 1, j), lcs(i, j + 1))); return a.length + b.length - 2 * lcs(0, 0); }
  const s = input.s;
  if (mode === 'lps') { let best = 0; for (let m = 1; m < 1 << s.length; m++) { const sub = [...s].filter((_, i) => (m >> i) & 1).join(''); if (isPal(sub)) best = Math.max(best, sub.length); } return best; }
  if (mode === 'palsub') { for (let len = s.length; len >= 1; len--) for (let i = 0; i + len <= s.length; i++) if (isPal(s.slice(i, i + len))) return `"${s.slice(i, i + len)}"`; return '""'; }
  if (mode === 'palcount') { let k = 0; for (let i = 0; i < s.length; i++) for (let j = i + 1; j <= s.length; j++) if (isPal(s.slice(i, j))) k++; return k; }
  if (mode === 'interleave') { const { a, b, c } = input; const go = (i, j) => (i + j === c.length ? i === a.length && j === b.length : (i < a.length && a[i] === c[i + j] && go(i + 1, j)) || (j < b.length && b[j] === c[i + j] && go(i, j + 1))); return String(a.length + b.length === c.length && go(0, 0)); }
  if (mode === 'distinct') { const { a, b } = input; let k = 0; for (let m = 0; m < 1 << a.length; m++) if ([...a].filter((_, i) => (m >> i) & 1).join('') === b) k++; return k; }
  const { a, b } = input;
  const go = (i, j) => { if (j === b.length) return i === a.length; const first = i < a.length && (b[j] === '.' || b[j] === a[i]); if (j + 1 < b.length && b[j + 1] === '*') return go(i, j + 2) || (first && go(i + 1, j)); return first && go(i + 1, j + 1); };
  return String(go(0, 0));
}

// ---------------------------------------------------------------- tables

export function strSteps(input) {
  const { mode } = input;
  const steps = [];
  let rows, cols, cells, given = null, blocked = null;
  const snap = (x) => steps.push({ mode, rows, cols, cells: cells.map((r) => [...r]), given, blocked, deps: [], path: null, ...x });
  const TF = (v) => (v ? 'T' : '·');

  if (mode === 'lps' || mode === 'palsub' || mode === 'palcount') {
    const s = input.s, n = s.length;
    rows = [...s].map((ch, i) => `${i} ${ch}`); cols = [...s].map((ch, j) => `${j} ${ch}`);
    cells = rows.map((_, i) => cols.map((__, j) => (j < i ? '' : null)));
    const lps = mode === 'lps';
    let best = [0, 0], count = 0;
    snap({ kind: 'start', cur: null, lines: [], title: lps ? `Longest palindromic subsequence of "${s}"` : mode === 'palsub' ? `Longest palindrome inside "${s}"` : `Palindromic substrings of "${s}"`, text: lps ? 'dp[i][j] = the longest palindromic subsequence of s[i..j]. If the two ends match they can wrap a palindrome from the inside, dp[i+1][j−1] + 2; otherwise one end is left out. Short ranges first, so the inside is always ready.' : 's[i..j] is a palindrome exactly when its two ends match and the inside s[i+1..j−1] is one. Fill the table by length (singles, pairs, then longer), so the inside is always known. (Expanding around each of the 2n − 1 centres gives the same answers in O(1) memory.)', calc: [`n = ${n}`] });
    for (let len = 1; len <= n; len++) for (let i = 0; i + len <= n; i++) {
      const j = i + len - 1;
      if (lps) {
        let v, deps, match = s[i] === s[j];
        if (len === 1) { v = 1; deps = []; } else if (match) { v = (len === 2 ? 0 : cells[i + 1][j - 1]) + 2; deps = len === 2 ? [] : [{ r: i + 1, c: j - 1, tone: 'success', label: '+2' }]; } else { v = Math.max(cells[i + 1][j], cells[i][j - 1]); deps = [{ r: i + 1, c: j, tone: cells[i + 1][j] >= cells[i][j - 1] ? 'success' : 'muted' }, { r: i, c: j - 1, tone: cells[i][j - 1] > cells[i + 1][j] ? 'success' : 'muted' }]; }
        cells[i][j] = v;
        snap({ kind: len === 1 ? 'base' : match ? 'match' : 'fill', cur: [i, j], deps, lines: [len === 1 ? 'base' : match ? 'match' : 'fill'], title: `"${s.slice(i, j + 1)}": ${v}`, text: len === 1 ? 'One letter is a palindrome of length 1.' : match ? `Both ends are '${s[i]}': they can sit around the best palindrome inside${len > 2 ? ` ("${s.slice(i + 1, j)}", ${cells[i + 1][j - 1]})` : ''}, adding 2.` : `'${s[i]}' ≠ '${s[j]}': they can't both be used. Drop the left end (${cells[i + 1][j]}) or the right end (${cells[i][j - 1]}).`, calc: [`dp[${i}][${j}] = ${v}`] });
      } else {
        const ok = s[i] === s[j] && (len <= 2 || cells[i + 1][j - 1] === 'T');
        cells[i][j] = TF(ok);
        if (ok) count++;
        if (ok && len > best[1] - best[0] + 1) best = [i, j];   // strictly longer: the first one of each length wins
        snap({ kind: len <= 2 ? 'base' : ok ? 'match' : 'fill', cur: [i, j], deps: len > 2 ? [{ r: i + 1, c: j - 1, tone: ok ? 'success' : 'muted', label: 'inside' }] : [], lines: [len <= 2 ? 'base' : 'fill', ...(ok ? ['match'] : [])], title: `"${s.slice(i, j + 1)}": ${ok ? 'palindrome' : 'no'}`, text: len === 1 ? 'A single letter reads the same both ways.' : len === 2 ? (ok ? 'Two equal letters side by side: a palindrome.' : 'Two different letters: not a palindrome.') : s[i] !== s[j] ? `The ends '${s[i]}' and '${s[j]}' differ.` : `The ends match and the inside "${s.slice(i + 1, j)}" is ${ok ? '' : 'not '}a palindrome.`, calc: mode === 'palcount' ? [`count = ${count}`] : [`longest: "${s.slice(best[0], best[1] + 1)}"`] });
      }
    }
    const ans = lps ? cells[0][n - 1] : mode === 'palcount' ? count : `"${s.slice(best[0], best[1] + 1)}"`;
    snap({ kind: 'done', cur: lps ? [0, n - 1] : mode === 'palsub' ? [best[0], best[1]] : null, lines: [], answer: `${lps ? 'length' : mode === 'palcount' ? 'count' : 'longest'} = ${ans}`, title: lps ? `Length ${ans}` : mode === 'palcount' ? `${ans} palindromic substrings` : `Longest: ${ans}`, text: lps ? 'The whole string is the range [0, n − 1]. O(n²) time and space.' : mode === 'palcount' ? 'Every true cell is one palindromic substring at one position. O(n²); expanding around centres counts the same in O(1) memory.' : 'The first longest palindrome found wins ties. O(n²); expanding around centres needs no table.', calc: [`= ${ans}`] });
    return steps;
  }

  // prefix tables: rows = prefixes of a, cols = prefixes of b
  const a = input.a, b = input.b, m = a.length, n = b.length;
  rows = ['∅', ...[...a].map((ch, i) => `${i + 1} ${ch}`)]; cols = ['∅', ...[...b].map((ch, j) => `${j + 1} ${ch}`)];
  cells = rows.map(() => cols.map(() => null));
  const intro = {
    deletes: `dp[i][j] = the fewest deletions to make the first i letters of "${a}" equal to the first j of "${b}". Equal last letters can both stay; otherwise delete one of them. (Equivalently m + n − 2 × LCS: keep the longest common subsequence.)`,
    interleave: `ok[i][j] = can the first i letters of "${a}" and the first j of "${b}" form the first i + j letters of "${input.c}"? The last letter of that prefix came from a or from b.`,
    distinct: `dp[i][j] = the number of ways to pick the first j letters of "${b}" out of the first i letters of "${a}", in order. Each letter of s is either skipped, or, if it equals the next letter of t, used.`,
    regex: `dp[i][j] = does the first i of "${a}" match the first j of the pattern "${b}"? A letter or "." matches one character. "x*" is the tricky part: it matches zero copies (ignore x* entirely) or one more character and stays available.`,
  }[mode];
  if (mode === 'interleave' && m + n !== input.c.length) {
    snap({ kind: 'start', cur: null, lines: [], title: 'Lengths don\'t add up', text: intro, calc: [`${m} + ${n} ≠ ${input.c.length}`] });
    snap({ kind: 'done', cur: null, lines: ['base'], answer: 'ok = false', title: 'false', text: `An interleaving uses every letter of both strings exactly once, so its length must be ${m} + ${n} = ${m + n}, not ${input.c.length}.`, calc: ['= false'] });
    return steps;
  }
  snap({ kind: 'start', cur: null, lines: [], title: { deletes: `Make "${a}" and "${b}" equal by deleting`, interleave: `Is "${input.c}" an interleaving?`, distinct: `How many times does "${b}" appear in "${a}" as a subsequence?`, regex: `Does "${b}" match "${a}"?` }[mode], text: intro, calc: [`${m} × ${n} prefixes`] });
  // base row / column
  for (let i = 0; i <= m; i++) for (let j = 0; j <= n; j++) {
    if (i > 0 && j > 0) continue;
    if (mode === 'deletes') cells[i][j] = i + j;
    if (mode === 'distinct') cells[i][j] = j === 0 ? 1 : 0;
    if (mode === 'interleave') cells[i][j] = TF(i === 0 && j === 0 ? true : i === 0 ? cells[0][j - 1] === 'T' && b[j - 1] === input.c[j - 1] : cells[i - 1][0] === 'T' && a[i - 1] === input.c[i - 1]);
    if (mode === 'regex') cells[i][j] = TF(i === 0 && j === 0 ? true : i > 0 ? false : b[j - 1] === '*' && j >= 2 && cells[0][j - 2] === 'T');
  }
  snap({ kind: 'base', cur: null, lines: ['base'], title: 'Edges first', text: { deletes: 'Against an empty string, every letter has to go: dp[i][0] = i, dp[0][j] = j.', distinct: 'The empty t can be picked in exactly one way (pick nothing); a non-empty t can\'t come from an empty s.', interleave: 'With nothing from b, the first i letters of c must be exactly a\'s first i letters; likewise for b.', regex: 'The empty pattern matches only the empty string. Against an empty string, a pattern matches only if every letter is followed by a * that can take zero copies.' }[mode], calc: [`row 0: ${cells[0].join(' ')}`] });
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
    if (mode === 'deletes') {
      const eq = a[i - 1] === b[j - 1];
      cells[i][j] = eq ? cells[i - 1][j - 1] : 1 + Math.min(cells[i - 1][j], cells[i][j - 1]);
      snap({ kind: eq ? 'match' : 'fill', cur: [i, j], lines: [eq ? 'match' : 'fill'], deps: eq ? [{ r: i - 1, c: j - 1, tone: 'success', label: 'keep' }] : [{ r: i - 1, c: j, tone: cells[i - 1][j] <= cells[i][j - 1] ? 'success' : 'muted', label: 'del' }, { r: i, c: j - 1, tone: cells[i][j - 1] < cells[i - 1][j] ? 'success' : 'muted', label: 'del' }], title: eq ? `'${a[i - 1]}' = '${b[j - 1]}': keep both, ${cells[i][j]}` : `'${a[i - 1]}' ≠ '${b[j - 1]}': delete one, ${cells[i][j]}`, text: eq ? 'Matching last letters can both stay; the cost is whatever the shorter prefixes needed.' : `Delete '${a[i - 1]}' (↑ ${cells[i - 1][j]}) or '${b[j - 1]}' (← ${cells[i][j - 1]}), plus 1.`, calc: [`dp[${i}][${j}] = ${cells[i][j]}`] });
    } else if (mode === 'distinct') {
      const eq = a[i - 1] === b[j - 1];
      cells[i][j] = cells[i - 1][j] + (eq ? cells[i - 1][j - 1] : 0);
      snap({ kind: eq ? 'match' : 'fill', cur: [i, j], lines: ['fill'], deps: [{ r: i - 1, c: j, tone: 'success', label: 'skip' }, ...(eq ? [{ r: i - 1, c: j - 1, tone: 'success', label: 'use' }] : [])], title: `dp[${i}][${j}] = ${cells[i - 1][j]}${eq ? ` + ${cells[i - 1][j - 1]}` : ''} = ${cells[i][j]}`, text: eq ? `s's letter '${a[i - 1]}' equals t's '${b[j - 1]}': skip it (${cells[i - 1][j]} ways) or use it for that letter (${cells[i - 1][j - 1]} ways).` : `'${a[i - 1]}' can't stand in for '${b[j - 1]}', so it can only be skipped.`, calc: [`= ${cells[i][j]}`] });
    } else if (mode === 'interleave') {
      const ch = input.c[i + j - 1];
      const fromA = cells[i - 1][j] === 'T' && a[i - 1] === ch, fromB = cells[i][j - 1] === 'T' && b[j - 1] === ch;
      cells[i][j] = TF(fromA || fromB);
      snap({ kind: fromA || fromB ? 'match' : 'fill', cur: [i, j], lines: ['fill'], deps: [{ r: i - 1, c: j, tone: fromA ? 'success' : 'muted', label: a[i - 1] }, { r: i, c: j - 1, tone: fromB ? 'success' : 'muted', label: b[j - 1] }], title: `ok[${i}][${j}] = ${fromA || fromB ? 'true' : 'false'} (c needs '${ch}')`, text: `The ${i + j}th letter of c is '${ch}'. ${fromA ? `It can be a's '${a[i - 1]}' after a good ok[${i - 1}][${j}].` : fromB ? `It can be b's '${b[j - 1]}' after a good ok[${i}][${j - 1}].` : `Neither a's '${a[i - 1]}' nor b's '${b[j - 1]}' works here (wrong letter, or the smaller prefix failed).`}`, calc: [`ok = ${fromA || fromB}`] });
    } else {
      const pc = b[j - 1];
      const m1 = (x, y) => y === '.' || x === y;
      let ok, deps, kind;
      if (pc === '*') {
        const zero = cells[i][j - 2] === 'T', more = m1(a[i - 1], b[j - 2]) && cells[i - 1][j] === 'T';
        ok = zero || more; kind = 'fill';
        deps = [{ r: i, c: j - 2, tone: zero ? 'success' : 'muted', label: '0×' }, { r: i - 1, c: j, tone: more ? 'success' : 'muted', label: '+1' }];
      } else {
        ok = m1(a[i - 1], pc) && cells[i - 1][j - 1] === 'T'; kind = 'match';
        deps = [{ r: i - 1, c: j - 1, tone: ok ? 'success' : 'muted' }];
      }
      cells[i][j] = TF(ok);
      snap({ kind, cur: [i, j], lines: [pc === '*' ? 'fill' : 'match'], deps, title: `"${a.slice(0, i)}" vs "${b.slice(0, j)}": ${ok ? 'match' : 'no'}`, text: pc === '*' ? `The pattern ends in "${b[j - 2]}*". Zero copies: does "${a.slice(0, i)}" match "${b.slice(0, j - 2)}"? One more copy: '${a[i - 1]}' ${m1(a[i - 1], b[j - 2]) ? 'fits' : 'doesn\'t fit'} "${b[j - 2]}", and then "${a.slice(0, i - 1)}" must match the same "${b.slice(0, j)}".` : `'${pc}' ${m1(a[i - 1], pc) ? `matches '${a[i - 1]}'` : `doesn't match '${a[i - 1]}'`}${m1(a[i - 1], pc) ? `, so it depends on the shorter prefixes` : ''}.`, calc: [`dp[${i}][${j}] = ${ok}`] });
    }
  }
  const v = cells[m][n];
  const ans = mode === 'deletes' || mode === 'distinct' ? v : v === 'T' ? 'true' : 'false';
  snap({ kind: 'done', cur: [m, n], lines: [], answer: `${{ deletes: 'steps', distinct: 'ways', interleave: 'ok', regex: 'match' }[mode]} = ${ans}`, title: { deletes: `${ans} deletions`, distinct: `${ans} ways`, interleave: `Interleaving: ${ans}`, regex: `Match: ${ans}` }[mode], text: { deletes: `Equivalently ${m} + ${n} − 2 × LCS. O(m · n).`, distinct: 'Each cell adds at most two numbers: O(m · n). One row of memory suffices if you fill it right to left.', interleave: 'O(m · n); one row of memory is enough.', regex: 'Every prefix pair is decided once: O(m · n). The same table handles Wildcard Matching with a simpler star.' }[mode], calc: [`= ${ans}`] });
  return steps;
}

// ---------------------------------------------------------------- inputs

export function strParse(values, input) {
  const { mode } = input;
  if (['lps', 'palsub', 'palcount'].includes(mode)) { const s = String(values.s ?? '').trim(); return /^[a-z]{1,7}$/.test(s) ? { input: { mode, s } } : { error: '1 to 7 lowercase letters.' }; }
  const a = String(values.a ?? '').trim(), b = String(values.b ?? '').trim();
  if (mode === 'regex') return /^[a-z]{0,6}$/.test(a) && /^([a-z.]\*?){0,6}$/.test(b) && b.length <= 8 ? { input: { mode, a, b } } : { error: 's: up to 6 letters; p: letters, ".", and "*" after a letter or ".".' };
  if (mode === 'distinct') return /^[a-z]{1,8}$/.test(a) && /^[a-z]{1,6}$/.test(b) ? { input: { mode, a, b } } : { error: 's: up to 8 letters; t: up to 6.' };
  if (!/^[a-z]{1,6}$/.test(a) || !/^[a-z]{1,6}$/.test(b)) return { error: 'Words of 1 to 6 lowercase letters.' };
  if (mode === 'interleave') { const c = String(values.c ?? '').trim(); return /^[a-z]{1,12}$/.test(c) ? { input: { mode, a, b, c } } : { error: 's3: up to 12 lowercase letters.' }; }
  return { input: { mode, a, b } };
}

export function strValues(input) {
  if (['lps', 'palsub', 'palcount'].includes(input.mode)) return { s: input.s };
  if (input.mode === 'interleave') return { a: input.a, b: input.b, c: input.c };
  return { a: input.a, b: input.b };
}

export function strRandom(input, rand = Math.random) {
  const g = rng(rand);
  const { mode } = input;
  const word = (lo, hi, al = 'ab') => Array.from({ length: g.int(lo, hi) }, () => g.pick([...al])).join('');
  if (['lps', 'palsub', 'palcount'].includes(mode)) return { mode, s: word(1, 7, 'abc') };
  if (mode === 'interleave') { const a = word(1, 4), b = word(1, 4); let c; if (g.bool(0.6)) { let i = 0, j = 0; c = ''; while (i < a.length || j < b.length) { if (j >= b.length || (i < a.length && g.bool(0.5))) c += a[i++]; else c += b[j++]; } } else c = word(2, 8); return { mode, a, b, c }; }
  if (mode === 'distinct') return { mode, a: word(1, 7), b: word(1, 3) };
  if (mode === 'regex') { const a = word(0, 5); const b = Array.from({ length: g.int(1, 4) }, () => g.pick(['a', 'b', '.']) + (g.bool(0.4) ? '*' : '')).join(''); return { mode, a, b }; }
  return { mode, a: word(1, 5, 'abc'), b: word(1, 5, 'abc') };
}

export const strFields = (input) => (['lps', 'palsub', 'palcount'].includes(input.mode)
  ? [{ name: 's', label: 's (up to 7 letters)', placeholder: 'babad', short: true }]
  : [{ name: 'a', label: { deletes: 'word1', interleave: 's1', distinct: 's', regex: 's' }[input.mode], placeholder: { deletes: 'sea', interleave: 'aab', distinct: 'rabbbit', regex: 'aab' }[input.mode], short: true }, { name: 'b', label: { deletes: 'word2', interleave: 's2', distinct: 't', regex: 'p (pattern)' }[input.mode], placeholder: { deletes: 'eat', interleave: 'dbc', distinct: 'rabbit', regex: 'c*a*b' }[input.mode], short: true }, ...(input.mode === 'interleave' ? [{ name: 'c', label: 's3', placeholder: 'adabbc', short: true }] : [])]);

export const strDescribe = (input) => (input.s !== undefined ? `"${input.s}"` : input.mode === 'interleave' ? `"${input.a}" + "${input.b}" → "${input.c}"` : `"${input.a}", "${input.b}"`);

export const strRule = {
  deletes: 'equal: diagonal; else 1 + min(up, left)',
  lps: 'ends equal: inside + 2; else max(drop left, drop right)',
  palsub: 'ends equal and inside is a palindrome',
  palcount: 'ends equal and inside is a palindrome; count them',
  interleave: 'c\'s next letter comes from a (↑) or from b (←)',
  distinct: 'skip this letter of s (↑) + use it if it matches (↖)',
  regex: 'letter/.: diagonal; x*: zero copies (← 2) or one more (↑)',
};
