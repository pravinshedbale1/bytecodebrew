/**
 * <StrWalkViz>: String Matching problems beyond the plain KMP table and search (<KmpViz>):
 *   shortpal   shortest palindrome: KMP failure table of s + "#" + reverse(s)
 *   repmatch   repeated string match: repeat a until it is as long as b, then try once more
 *   dna        repeated k-letter windows with a set (the real problem uses k = 10)
 *   lds        longest duplicate substring: binary search on the length, a rolling hash per length
 * Steps use the DesignWalkViz "parts" shape. Pure, with independent brute forces for viz-check.
 */
import { list, rng } from './util.js';

const P = {
  chips: (label, chips, empty = 'none') => ({ type: 'chips', label, chips, empty }),
  strip: (label, items, o = {}) => ({ type: 'strip', label, items: [...items], cls: {}, tags: {}, sub: {}, bands: [], index: true, ...o }),
};

export const STR_WALK = {
  shortpal: { label: 'Shortest palindrome: "abcd"', input: { mode: 'shortpal', s: 'abcd' } },
  shortpal2: { label: 'Shortest palindrome: "abac"', input: { mode: 'shortpal', s: 'abac' } },
  repmatch: { label: 'Repeated string match', input: { mode: 'repmatch', a: 'abcd', b: 'cdabcdab' } },
  repmatchNo: { label: 'Repeated string match: impossible', input: { mode: 'repmatch', a: 'abc', b: 'acb' } },
  dna: { label: 'Repeated windows (k = 4)', input: { mode: 'dna', s: 'ACGTTACGTACGT', k: 4 } },
  lds: { label: 'Longest duplicate: "banana"', input: { mode: 'lds', s: 'banana' } },
  ldsNone: { label: 'No duplicate: "abcd"', input: { mode: 'lds', s: 'abcd' } },
};

export const strWalkCode = (mode) => ({
  shortpal: [['join', 't = s + "#" + reverse(s);              // "#" stops a border from crossing the middle'], ['lps', 'build the KMP failure table of t'], ['ans', 'L = lps[last] (the longest palindromic prefix of s);  return reverse(s.substring(L)) + s;']],
  repmatch: [['count', 'k = ceil(|b| / |a|);  build a repeated k times'], ['try', 'if b is inside: return k;   else try k + 1 (b may start partway into a copy)'], ['none', 'still not inside: return −1']],
  dna: [['slide', 'for each window s[i .. i + k − 1]:'], ['seen', '    if it is already in seen: add it to repeated'], ['add', '    else add it to seen'], ['ans', 'return repeated (each once)']],
  lds: [['bs', 'binary search the length L between 1 and n − 1'], ['hash', 'check(L): slide a rolling hash over every window of length L; a hash seen before (and equal text) = a repeat'], ['move', 'repeat found → try longer (lo = L + 1); none → try shorter (hi = L − 1)'], ['ans', 'return the repeat found at the largest L']],
})[mode];

// ---------------------------------------------------------------- brute forces

export function strWalkAnswer(input) {
  const { mode } = input;
  if (mode === 'shortpal') { const s = input.s; for (let L = s.length; L >= 0; L--) { const p = s.slice(0, L); if (p === [...p].reverse().join('')) return [...s.slice(L)].reverse().join('') + s; } return s; }
  if (mode === 'repmatch') { for (let k = 1; k <= Math.ceil(input.b.length / input.a.length) + 2; k++) if (input.a.repeat(k).includes(input.b)) return k; return -1; }
  if (mode === 'dna') { const c = new Map(); for (let i = 0; i + input.k <= input.s.length; i++) { const w = input.s.slice(i, i + input.k); c.set(w, (c.get(w) ?? 0) + 1); } return [...c.keys()].filter((w) => c.get(w) > 1).sort(); }
  // lds: the length of the longest repeated substring (any one of them is accepted)
  const s = input.s; let best = 0;
  for (let i = 0; i < s.length; i++) for (let j = i + 1; j < s.length; j++) { let L = 0; while (j + L < s.length && s[i + L] === s[j + L]) L++; best = Math.max(best, L); }
  return best;
}

export function strWalkCheck(input, out) {
  if (input.mode === 'lds') { const L = strWalkAnswer(input); if (out.length !== L) return false; if (!L) return out === ''; const s = input.s, i = s.indexOf(out); return i >= 0 && s.indexOf(out, i + 1) >= 0; }
  const w = strWalkAnswer(input);
  return JSON.stringify(input.mode === 'dna' ? [...out].sort() : out) === JSON.stringify(w);
}

// ---------------------------------------------------------------- step-throughs

export function strWalk(input) {
  const { mode } = input;
  const steps = [];
  const snap = (x) => steps.push({ mode, parts: [], call: null, ...x });

  if (mode === 'shortpal') {
    const s = input.s, r = [...s].reverse().join(''), t = `${s}#${r}`, n = t.length;
    const lps = Array(n).fill(null);
    lps[0] = 0;
    const view = (i = null, len = 0) => { const st = P.strip('s + "#" + reverse(s)', [...t]); lps.forEach((v, k) => { if (v !== null) st.sub[k] = { text: String(v), tone: k === i ? 'success' : undefined }; }); if (i !== null) { st.cls[i] = 'cur'; if (len) st.bands = [{ from: 0, to: len - 1, tone: 'success', label: 'border' }]; } st.cls[s.length] = `${st.cls[s.length] ?? ''} dim`; return [st]; };
    snap({ kind: 'start', lines: ['join'], parts: view(), title: `Shortest palindrome from "${s}"`, text: 'Adding characters only in front, the part of s you keep as the centre must be a palindrome that starts s. So find the longest palindromic prefix P; the answer is reverse(rest) + s. A prefix of s is a palindrome exactly when it equals a suffix of reverse(s), so it is the longest border of s + "#" + reverse(s): the last value of the KMP failure table. The "#" stops a border from running across the middle.', calc: [`t = "${t}"`] });
    let len = 0;
    for (let i = 1; i < n; i++) {
      const falls = [];
      while (len > 0 && t[i] !== t[len]) { falls.push(len); len = lps[len - 1]; }
      if (t[i] === t[len]) len++;
      lps[i] = len;
      snap({ kind: falls.length ? 'fall' : len ? 'grow' : 'skip', lines: ['lps'], parts: view(i, len), title: `lps[${i}] = ${len}`, text: `${falls.length ? `'${t[i]}' doesn't extend the border of length ${falls[0]}; fall back${falls.length > 1 ? ` through ${falls.join(', ')}` : ''}. ` : ''}${len ? `The first ${len} letter${len === 1 ? '' : 's'} of t match the ${len} letter${len === 1 ? '' : 's'} ending here.` : 'No prefix of t ends here as a border: lps is 0.'}`, calc: [`lps[${i}] = ${len}`] });
    }
    const L = lps[n - 1], ans = [...s.slice(L)].reverse().join('') + s;
    snap({ kind: 'done', lines: ['ans'], parts: [P.strip('answer', [...ans], { index: false, cls: Object.fromEntries([...ans].map((_, k) => [k, k < s.length - L ? 'note' : k < s.length - L + L ? 'hit' : ''])) })], out: ans, answer: `"${ans}"`, title: `Answer: "${ans}"`, text: `The last lps value is ${L}: "${s.slice(0, L)}" is the longest palindromic prefix of s. Put the reverse of the rest ("${[...s.slice(L)].reverse().join('')}") in front. O(n) for the table.`, calc: [`"${ans}"`] });
    return steps;
  }

  if (mode === 'repmatch') {
    const { a, b } = input;
    const k = Math.ceil(b.length / a.length);
    const show = (times, found) => { const t = a.repeat(times); const st = P.strip(`a × ${times}`, [...t], { index: false }); for (let c = 0; c < times; c++) st.bands.push({ from: c * a.length, to: (c + 1) * a.length - 1, tone: c % 2 ? 'note' : 'accent', label: c ? '' : 'a' }); if (found >= 0) for (let q = found; q < found + b.length; q++) st.cls[q] = 'hit'; return st; };
    snap({ kind: 'start', lines: ['count'], parts: [P.strip('b', [...b], { index: false })], title: `How many copies of "${a}" contain "${b}"?`, text: `The repeated string must be at least as long as b, so try k = ⌈${b.length} / ${a.length}⌉ = ${k} copies. b may start in the middle of a copy and spill into one more, so k + 1 copies is the last count worth trying: any match in more copies would also appear in k + 1.`, calc: [`k = ${k}`] });
    for (const times of [k, k + 1]) {
      const at = a.repeat(times).indexOf(b);
      if (at >= 0) { snap({ kind: 'found', lines: ['try'], parts: [show(times, at), P.strip('b', [...b], { index: false })], out: times, answer: String(times), title: `${times} copies: "${b}" found at ${at}`, text: `"${b}" appears inside "${a.repeat(times)}" starting at ${at}.`, calc: [String(times)] }); return steps; }
      snap({ kind: 'skip', lines: ['try'], parts: [show(times, -1), P.strip('b', [...b], { index: false })], title: `${times} copies: not inside`, text: times === k ? `"${b}" isn't in ${times} copies; it might start partway into the first copy, so try one more.` : `Not in ${times} copies either. More copies only repeat the same pattern again.`, calc: ['no match'] });
    }
    snap({ kind: 'fail', lines: ['none'], parts: [], out: -1, answer: '-1', title: 'Impossible: −1', text: `No number of copies of "${a}" contains "${b}". The search inside each repeated string can use KMP: O(|a| + |b|) overall.`, calc: ['-1'] });
    return steps;
  }

  if (mode === 'dna') {
    const { s, k } = input;
    const seen = new Set(), rep = new Set();
    const view = (i = null, dup = false) => { const st = P.strip('s', [...s]); if (i !== null) st.bands = [{ from: i, to: i + k - 1, tone: dup ? 'success' : 'accent', label: s.slice(i, i + k) }]; return [st, P.chips('seen', [...seen].map((w) => ({ key: w, text: w })), 'none yet'), P.chips('repeated', [...rep].map((w) => ({ key: w, text: w, tone: 'success' })), 'none yet')]; };
    snap({ kind: 'start', lines: ['slide'], parts: view(), title: `Repeated ${k}-letter windows of "${s}"`, text: `Slide a window of ${k} letters along s and keep a set of windows already seen. A window seen a second time is a repeat; a second set keeps each repeat once. (The real problem uses windows of 10; encoding A, C, G, T as 2 bits each turns a window into a 20-bit number, a cheaper set key.)`, calc: [`${Math.max(0, s.length - k + 1)} windows`] });
    for (let i = 0; i + k <= s.length; i++) {
      const w = s.slice(i, i + k), dup = seen.has(w);
      if (dup) rep.add(w); else seen.add(w);
      snap({ kind: dup ? 'found' : 'add', lines: dup ? ['slide', 'seen'] : ['slide', 'add'], parts: view(i, dup), title: dup ? `"${w}" again: a repeat` : `"${w}": new`, text: dup ? `"${w}" is already in seen, so it occurs more than once.${rep.size && [...rep].indexOf(w) < rep.size - 1 ? '' : ''}` : `First time for "${w}": add it to seen.`, calc: [`repeated: ${rep.size}`] });
    }
    const out = [...rep];
    snap({ kind: 'done', lines: ['ans'], parts: view(), out, answer: list(out.map((w) => `"${w}"`)), title: out.length ? `Repeated: ${out.join(', ')}` : 'No window repeats', text: 'One pass with two sets: O(n · k), or O(n) with a rolling 2-bit encoding.', calc: [list(out)] });
    return steps;
  }

  // lds
  const s = input.s, n = s.length;
  let lo = 1, hi = n - 1, best = '';
  const B = 31, M = 1000000007;
  const check = (L) => { const seen = new Map(); let h = 0, pw = 1; for (let i = 0; i < L; i++) { h = (h * B + s.charCodeAt(i)) % M; if (i) pw = (pw * B) % M; } for (let i = 0; ; i++) { const prev = seen.get(h); if (prev !== undefined && s.slice(prev, prev + L) === s.slice(i, i + L)) return [prev, i]; if (prev === undefined) seen.set(h, i); if (i + L >= n) return null; h = ((h - s.charCodeAt(i) * pw % M + M) * B + s.charCodeAt(i + L)) % M; } };
  const view = (pair = null, L = 0) => { const st = P.strip('s', [...s]); if (pair) st.bands = [{ from: pair[0], to: pair[0] + L - 1, tone: 'success', label: s.slice(pair[0], pair[0] + L) }, ...(pair[1] > pair[0] + L - 1 ? [{ from: pair[1], to: pair[1] + L - 1, tone: 'note', label: 'again' }] : [])]; if (pair && pair[1] <= pair[0] + L - 1) for (let q = pair[1]; q < pair[1] + L; q++) st.cls[q] = 'kept'; return [st, P.chips('search', [{ key: 'lo', text: `lo ${lo}`, tone: 'accent' }, { key: 'hi', text: `hi ${hi}`, tone: 'accent' }, { key: 'b', text: `best "${best}"`, tone: 'success' }])]; };
  snap({ kind: 'start', lines: ['bs'], parts: view(), title: `Longest repeated substring of "${s}"`, text: 'If some substring of length L repeats, then so does one of every shorter length (take its prefix). So "is there a repeat of length L?" is yes up to some point and no after: binary search the length. Each check slides a rolling hash over the windows of that length and looks for a hash seen before (comparing the text to rule out a collision).', calc: [`lo 1, hi ${n - 1}`] });
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const pair = check(mid);
    if (pair) { best = s.slice(pair[0], pair[0] + mid); lo = mid + 1; } else hi = mid - 1;
    snap({ kind: pair ? 'found' : 'skip', lines: ['hash', 'move'], parts: view(pair, mid), title: pair ? `L = ${mid}: "${best}" repeats` : `L = ${mid}: no repeat`, text: pair ? `Windows at ${pair[0]} and ${pair[1]} hash the same and hold the same text "${best}". A repeat of length ${mid} exists, so try longer: lo = ${lo}.` : `All ${n - mid + 1} windows of length ${mid} have different hashes. No repeat that long, so none longer either: hi = ${hi}.`, calc: [`lo ${lo}, hi ${hi}`] });
  }
  snap({ kind: 'done', lines: ['ans'], parts: view(), out: best, answer: `"${best}"`, title: best ? `Longest repeat: "${best}"` : 'No substring repeats: ""', text: 'O(n log n) on average: log n lengths, O(n) windows each. A suffix array (longest common prefix of neighbouring suffixes) is the O(n log n) worst-case alternative.', calc: [`"${best}"`] });
  return steps;
}

// ---------------------------------------------------------------- inputs

export function parseStrWalk(values, input) {
  const { mode } = input;
  if (mode === 'shortpal') { const s = String(values.s ?? '').trim(); return /^[a-z]{0,6}$/.test(s) ? { input: { mode, s } } : { error: 'Up to 6 lower-case letters.' }; }
  if (mode === 'repmatch') { const a = String(values.a ?? '').trim(), b = String(values.b ?? '').trim(); return /^[a-z]{1,4}$/.test(a) && /^[a-z]{1,8}$/.test(b) ? { input: { mode, a, b } } : { error: 'a: 1 to 4 letters; b: 1 to 8 letters.' }; }
  if (mode === 'dna') { const s = String(values.s ?? '').trim().toUpperCase(), k = Number(values.k); return /^[ACGT]{1,14}$/.test(s) && Number.isInteger(k) && k >= 1 && k <= 10 ? { input: { mode, s, k } } : { error: 'Up to 14 letters from A, C, G, T, and a window of 1 to 10.' }; }
  const s = String(values.s ?? '').trim();
  return /^[a-z]{2,10}$/.test(s) ? { input: { mode, s } } : { error: '2 to 10 lower-case letters.' };
}

export function strWalkValues(input) {
  if (input.mode === 'repmatch') return { a: input.a, b: input.b };
  if (input.mode === 'dna') return { s: input.s, k: String(input.k) };
  return { s: input.s };
}

export function randomStrWalk(input, rand = Math.random) {
  const g = rng(rand);
  const { mode } = input;
  const word = (n, ab = 'ab') => Array.from({ length: n }, () => g.pick(ab.split(''))).join('');
  if (mode === 'shortpal') return { mode, s: word(g.int(0, 6), 'abc') };
  if (mode === 'repmatch') { const a = word(g.int(1, 4), 'abc'); return { mode, a, b: g.bool(0.6) ? a.repeat(4).slice(g.int(0, a.length - 1)).slice(0, g.int(1, 8)) : word(g.int(1, 8), 'abc') }; }
  if (mode === 'dna') return { mode, s: word(g.int(1, 14), 'ACGT'), k: g.int(1, 5) };
  return { mode, s: word(g.int(2, 10), 'abc') };
}

export const strWalkFields = (input) => ({
  shortpal: [{ name: 's', label: 's', placeholder: 'abcd', short: true }],
  repmatch: [{ name: 'a', label: 'a', placeholder: 'abcd', short: true }, { name: 'b', label: 'b', placeholder: 'cdabcdab', short: true }],
  dna: [{ name: 's', label: 's (A, C, G, T)', placeholder: 'ACGTTACGTACGT' }, { name: 'k', label: 'window', placeholder: '4', short: true }],
  lds: [{ name: 's', label: 's', placeholder: 'banana', short: true }],
})[input.mode];

export const strWalkDescribe = (input) => (input.mode === 'repmatch' ? `a = "${input.a}", b = "${input.b}"` : input.mode === 'dna' ? `"${input.s}", windows of ${input.k}` : `"${input.s}"`);

export const strWalkRule = {
  shortpal: 'longest border of s + "#" + reverse(s) = longest palindromic prefix',
  repmatch: 'try ⌈|b| / |a|⌉ copies, then one more',
  dna: 'a window seen twice is a repeat',
  lds: 'binary search the length; rolling hash per length',
};
