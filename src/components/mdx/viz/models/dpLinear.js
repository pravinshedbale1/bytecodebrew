/**
 * More 1-D DP rows for <Dp1dViz> (the DP Linear lesson): each mode fills a small table (rows × cols)
 * and points at the cells each value reads (deps). Pure, so scripts/viz-check.mjs can compare every
 * mode with a brute force.
 */
import { list, plural, rng } from './util.js';

export const LIN = {
  robber2: { label: 'House robber II (a circle)', input: { mode: 'robber2', a: [2, 3, 2, 5, 1] } },
  product: { label: 'Maximum product', input: { mode: 'product', a: [2, 3, -2, 4, -1] } },
  circular: { label: 'Circular subarray', input: { mode: 'circular', a: [5, -3, -2, 6, -1, 4] } },
  turbulent: { label: 'Turbulent subarray', input: { mode: 'turbulent', a: [9, 4, 2, 10, 7, 8, 8, 1, 9] } },
  decode: { label: 'Decode ways', input: { mode: 'decode', s: '22603' } },
  wordbreak: { label: 'Word break', input: { mode: 'wordbreak', s: 'applepenapple', words: ['apple', 'pen'] } },
  nlis: { label: 'Number of LIS', input: { mode: 'nlis', a: [1, 3, 5, 4, 7] } },
  intbreak: { label: 'Integer break', input: { mode: 'intbreak', n: 10 } },
  envelopes: { label: 'Russian dolls', input: { mode: 'envelopes', env: [[5, 4], [6, 4], [6, 7], [2, 3], [7, 8], [3, 5]] } },
  stones: { label: 'Stone game III', input: { mode: 'stones', a: [1, 2, 3, -9, 4] } },
  subset: { label: 'Partition equal subset sum', input: { mode: 'subset', a: [1, 5, 11, 5] } },
  targetsum: { label: 'Target sum', input: { mode: 'targetsum', a: [1, 1, 1, 1, 1], target: 3 } },
  stone2: { label: 'Last stone weight II', input: { mode: 'stone2', a: [2, 7, 4, 1, 8, 1] } },
  combsum4: { label: 'Combination sum IV', input: { mode: 'combsum4', a: [1, 2, 3], target: 4 } },
  squares: { label: 'Perfect squares', input: { mode: 'squares', n: 12 } },
  ones: { label: 'Ones and zeroes', input: { mode: 'ones', strs: ['10', '0001', '111001', '1', '0'], m: 5, n: 3 } },
};
const KNAP = new Set(['subset', 'targetsum', 'stone2', 'combsum4', 'squares', 'ones']);

export const linCode = (mode) => ({
  robber2: [['base', 'houses 0 and n − 1 touch: solve the line without the last house, and without the first'], ['fill', 'best[i] = max(best[i−1], best[i−2] + a[i]);       // the House Robber row'], ['pick', 'answer = max(the two runs)']],
  product: [['base', 'hi = lo = best = a[0];'], ['fill', 'hi, lo = max/min(a[i], hi·a[i], lo·a[i]);            // a negative swaps them'], ['pick', 'best = max(best, hi);']],
  circular: [['base', 'run Kadane for the best sum AND the worst sum; total = sum(a)'], ['fill', 'maxEnd = max(a[i], maxEnd + a[i]);  minEnd = min(a[i], minEnd + a[i]);'], ['pick', 'answer = maxSum < 0 ? maxSum : max(maxSum, total − minSum)']],
  turbulent: [['base', 'up = down = 1;'], ['fill', 'a[i] > a[i−1]: up = down + 1, down = 1;  a[i] < a[i−1]: down = up + 1, up = 1;  equal: both 1'], ['pick', 'best = max(best, up, down);']],
  decode: [['base', 'dp[0] = 1;                                          // the empty prefix'], ['fill', 'dp[i] = (s[i−1] ≠ "0" ? dp[i−1] : 0) + (10 ≤ s[i−2..i−1] ≤ 26 ? dp[i−2] : 0)']],
  wordbreak: [['base', 'ok[0] = true;'], ['fill', 'ok[i] = some j < i with ok[j] and s[j..i) in the dictionary']],
  nlis: [['base', 'len[i] = 1; count[i] = 1;'], ['fill', 'for j < i, a[j] < a[i]: longer → take len[j]+1 and count[j]; equal → add count[j]'], ['pick', 'answer = sum of count[i] where len[i] is the maximum']],
  intbreak: [['base', 'dp[1] = 1;'], ['fill', 'dp[i] = max over j of max(j, dp[j]) · max(i − j, dp[i − j])     // break or keep each part']],
  envelopes: [['base', 'sort by width ascending, and by height DESCENDING when widths tie'], ['fill', 'dp[i] = 1 + max dp[j] for j < i with h[j] < h[i]           // LIS on heights'], ['pick', 'answer = max(dp)  (patience sorting makes it O(n log n))']],
  stones: [['base', 'dp[n] = 0;                                          // no stones left'], ['fill', 'dp[i] = max over k = 1..3 of (a[i] + … + a[i+k−1]) − dp[i+k]   // my take minus their best']],
  subset: [['base', 'odd total → false;  can[0] = true;  half = total / 2'], ['fill', 'for each x: for s = half down to x: can[s] |= can[s − x]     // right to left: x used once'], ['pick', 'return can[half]']],
  targetsum: [['base', 'P − N = target, P + N = total → P = (total + target) / 2;  ways[0] = 1'], ['fill', 'for each x: for s = P down to x: ways[s] += ways[s − x]'], ['pick', 'return ways[P]']],
  stone2: [['base', 'smashing = splitting into two piles; answer = total − 2 · (best pile ≤ total / 2)'], ['fill', 'for each stone x: for s = half down to x: can[s] |= can[s − x]'], ['pick', 'best = largest reachable s ≤ half;  return total − 2·best']],
  combsum4: [['base', 'dp[0] = 1;'], ['fill', 'for t = 1..target: for x in nums: dp[t] += dp[t − x]     // target outer: order matters']],
  squares: [['base', 'dp[0] = 0;'], ['fill', 'dp[i] = 1 + min over squares k² ≤ i of dp[i − k²]']],
  ones: [['base', 'dp[z][o] = most strings using ≤ z zeros and ≤ o ones;  all 0'], ['fill', 'for each string (z0 zeros, o1 ones): for z, o from high to low: dp[z][o] = max(dp[z][o], dp[z − z0][o − o1] + 1)'], ['pick', 'return dp[m][n]']],
})[mode];

// ---------------------------------------------------------------- brute forces

const subarrays = (a) => a.flatMap((_, i) => a.slice(i).map((__, j) => a.slice(i, i + j + 1)));
export function linAnswer(input) {
  const { mode } = input;
  const a = input.a;
  if (mode === 'robber2') {
    const n = a.length; let best = 0;
    for (let m = 0; m < 1 << n; m++) { let okk = true, s = 0; for (let i = 0; i < n; i++) if ((m >> i) & 1) { if (n > 1 && (m >> ((i + 1) % n)) & 1 && (i + 1) % n !== i) okk = false; s += a[i]; } if (okk) best = Math.max(best, s); }
    return best;
  }
  if (mode === 'product') return Math.max(...subarrays(a).map((s) => s.reduce((x, y) => x * y, 1)));
  if (mode === 'circular') { const n = a.length; let best = -Infinity; for (let i = 0; i < n; i++) { let s = 0; for (let l = 0; l < n; l++) { s += a[(i + l) % n]; best = Math.max(best, s); } } return best; }
  if (mode === 'turbulent') {
    const zig = (t) => t.every((v, k) => k === 0 || (v !== t[k - 1] && (k === 1 || Math.sign(v - t[k - 1]) === -Math.sign(t[k - 1] - t[k - 2]))));
    return Math.max(...subarrays(a).filter(zig).map((t) => t.length));
  }
  if (mode === 'decode') { const go = (i) => (i === input.s.length ? 1 : input.s[i] === '0' ? 0 : go(i + 1) + (i + 1 < input.s.length && Number(input.s.slice(i, i + 2)) <= 26 ? go(i + 2) : 0)); return go(0); }
  if (mode === 'wordbreak') { const d = new Set(input.words); const go = (i) => i === input.s.length || [...d].some((w) => input.s.startsWith(w, i) && go(i + w.length)); return String(go(0)); }
  if (mode === 'nlis') {
    let best = 0, cnt = 0;
    for (let m = 1; m < 1 << a.length; m++) { const s = a.filter((_, i) => (m >> i) & 1); if (!s.every((v, k) => k === 0 || v > s[k - 1])) continue; if (s.length > best) { best = s.length; cnt = 1; } else if (s.length === best) cnt++; }
    return cnt;
  }
  if (mode === 'intbreak') { const go = (n, parts) => { if (n === 0) return parts >= 2 ? 1 : -Infinity; let b = -Infinity; for (let k = 1; k <= n; k++) b = Math.max(b, k * go(n - k, parts + 1)); return b; }; return go(input.n, 0); }
  if (mode === 'envelopes') { const e = [...input.env].sort((x, y) => x[0] - y[0]); const dp = e.map(() => 1); e.forEach((x, i) => e.slice(0, i).forEach((y, j) => { if (y[0] < x[0] && y[1] < x[1]) dp[i] = Math.max(dp[i], dp[j] + 1); })); return Math.max(...dp); }
  if (mode === 'subset') { const t = a.reduce((x, y) => x + y, 0); for (let m = 0; m < 1 << a.length; m++) if (2 * a.filter((_, i) => (m >> i) & 1).reduce((x, y) => x + y, 0) === t) return 'true'; return 'false'; }
  if (mode === 'targetsum') { let c = 0; for (let m = 0; m < 1 << a.length; m++) if (a.reduce((acc, v, i) => acc + ((m >> i) & 1 ? v : -v), 0) === input.target) c++; return c; }
  if (mode === 'stone2') { const t = a.reduce((x, y) => x + y, 0); let best = Infinity; for (let m = 0; m < 1 << a.length; m++) best = Math.min(best, Math.abs(t - 2 * a.filter((_, i) => (m >> i) & 1).reduce((x, y) => x + y, 0))); return best; }
  if (mode === 'combsum4') { const go2 = (t) => (t === 0 ? 1 : a.reduce((acc, x) => acc + (x <= t ? go2(t - x) : 0), 0)); return go2(input.target); }
  if (mode === 'squares') { const go2 = (n) => { if (n === 0) return 0; let b = Infinity; for (let k = 1; k * k <= n; k++) b = Math.min(b, 1 + go2(n - k * k)); return b; }; return go2(input.n); }
  if (mode === 'ones') { let best = 0; const cnt = input.strs.map((s2) => [[...s2].filter((c) => c === '0').length, [...s2].filter((c) => c === '1').length]); for (let m = 0; m < 1 << cnt.length; m++) { let z = 0, o = 0, k = 0; cnt.forEach(([a0, a1], i) => { if ((m >> i) & 1) { z += a0; o += a1; k++; } }); if (z <= input.m && o <= input.n) best = Math.max(best, k); } return best; }
  const go = (i) => { if (i >= a.length) return 0; let b = -Infinity, s = 0; for (let k = 0; k < 3 && i + k < a.length; k++) { s += a[i + k]; b = Math.max(b, s - go(i + k + 1)); } return b; };
  const d = go(0);
  return d > 0 ? 'Alice' : d < 0 ? 'Bob' : 'Tie';
}

// ---------------------------------------------------------------- the tables

export function linSteps(input) {
  const { mode } = input;
  const steps = [];
  let rows, cols, cells, inputRows = [0];
  const snap = (x) => steps.push({ mode, rows, cols, cells: cells.map((r) => [...r]), deps: [], inputRows, ...x });
  const a = input.a;
  if (KNAP.has(mode)) return knapSteps(input);

  if (mode === 'robber2') {
    const n = a.length;
    rows = ['money', 'no last', 'no first'];
    cols = a.map((_, i) => String(i));
    cells = [[...a], a.map((_, i) => (i === n - 1 && n > 1 ? '' : null)), a.map((_, i) => (i === 0 && n > 1 ? '' : null))];
    snap({ kind: 'start', cur: null, lines: [], title: 'Houses in a circle', text: 'The first and last houses are neighbours now, so they can\'t both be robbed. Every plan leaves out house 0 or house n − 1 (or both). So run the ordinary House Robber twice: once on houses 0..n−2, once on 1..n−1, and take the better.', calc: [`money = ${list(a)}`] });
    if (n === 1) { cells[1][0] = a[0]; snap({ kind: 'done', cur: [1, 0], lines: ['pick'], answer: `best = ${a[0]}`, title: `One house: ${a[0]}`, text: 'A single house has no neighbour to clash with.', calc: [`= ${a[0]}`] }); return steps; }
    const run = (r, lo, hi) => {
      for (let i = lo; i <= hi; i++) {
        const prev1 = i - 1 >= lo ? cells[r][i - 1] : 0, prev2 = i - 2 >= lo ? cells[r][i - 2] : 0;
        cells[r][i] = Math.max(prev1, prev2 + a[i]);
        const take = prev2 + a[i] > prev1;
        snap({ kind: i === lo ? 'base' : 'fill', cur: [r, i], lines: [i === lo ? 'base' : 'fill'], deps: [...(i - 1 >= lo ? [{ r, c: i - 1, tone: take ? 'muted' : 'success', label: 'skip' }] : []), ...(i - 2 >= lo ? [{ r, c: i - 2, tone: take ? 'success' : 'muted', label: `+${a[i]}` }] : []), { r: 0, c: i, tone: take ? 'success' : 'muted' }], title: `${rows[r]}: best[${i}] = max(${prev1}, ${prev2} + ${a[i]}) = ${cells[r][i]}`, text: `${take ? `Rob house ${i}: ${a[i]} plus the best two houses back.` : `Skip house ${i}: the best up to the previous house is better.`}`, calc: [`skip ${prev1}`, `rob ${prev2 + a[i]}`] });
      }
    };
    run(1, 0, n - 2);
    run(2, 1, n - 1);
    const x = cells[1][n - 2], y = cells[2][n - 1], ans = Math.max(x, y);
    snap({ kind: 'done', cur: x >= y ? [1, n - 2] : [2, n - 1], lines: ['pick'], answer: `best = ${ans}`, title: `max(${x}, ${y}) = ${ans}`, text: `Without the last house: ${x}. Without the first: ${y}. One of those two lines contains the best plan for the circle. Two O(n) passes, O(1) memory each.`, calc: [`max(${x}, ${y}) = ${ans}`] });
    return steps;
  }

  if (mode === 'product') {
    rows = ['a', 'max ending', 'min ending'];
    cols = a.map((_, i) => String(i));
    cells = [[...a], a.map(() => null), a.map(() => null)];
    let best = a[0];
    snap({ kind: 'start', cur: null, lines: [], title: 'The largest product of a subarray', text: 'For sums, Kadane keeps the best sum ending here. Products have a twist: a negative number turns the most negative product into the most positive one. So keep both the largest and the smallest product ending at each position.', calc: [`a = ${list(a)}`] });
    cells[1][0] = a[0]; cells[2][0] = a[0];
    snap({ kind: 'base', cur: [1, 0], lines: ['base'], title: `Start: max = min = ${a[0]}`, text: 'The only subarray ending at index 0 is the first element itself.', calc: [`best = ${a[0]}`] });
    for (let i = 1; i < a.length; i++) {
      const c = [a[i], cells[1][i - 1] * a[i], cells[2][i - 1] * a[i]];
      cells[1][i] = Math.max(...c); cells[2][i] = Math.min(...c);
      best = Math.max(best, cells[1][i]);
      const from = cells[1][i] === c[0] ? 'fresh' : cells[1][i] === c[1] ? 'max' : 'min';
      snap({ kind: 'fill', cur: [1, i], lines: ['fill', 'pick'], deps: [{ r: 1, c: i - 1, tone: from === 'max' ? 'success' : 'muted', label: `×${a[i]}` }, { r: 2, c: i - 1, tone: from === 'min' ? 'success' : 'muted', label: `×${a[i]}` }, { r: 0, c: i, tone: from === 'fresh' ? 'success' : 'muted' }], title: `index ${i}: max ${cells[1][i]}, min ${cells[2][i]}`, text: `Candidates: start fresh (${c[0]}), extend the max (${c[1]}), extend the min (${c[2]}). ${a[i] < 0 && from === 'min' ? `${a[i]} is negative, so the smallest product so far becomes the largest.` : from === 'fresh' ? 'Starting over beats extending.' : 'Extending the largest product wins.'}`, calc: [`best = ${best}`] });
    }
    snap({ kind: 'done', cur: null, lines: ['pick'], answer: `best = ${best}`, title: `Largest product: ${best}`, text: 'One pass with two running values: O(n) time, O(1) memory. Without the min row, a later negative number would lose the chance to flip a big negative product.', calc: [`= ${best}`] });
    return steps;
  }

  if (mode === 'circular') {
    rows = ['a', 'max ending', 'min ending'];
    cols = a.map((_, i) => String(i));
    cells = [[...a], a.map(() => null), a.map(() => null)];
    const total = a.reduce((x, y) => x + y, 0);
    let maxS = a[0], minS = a[0];
    snap({ kind: 'start', cur: null, lines: ['base'], title: 'Best subarray when the ends wrap around', text: 'A best subarray either sits inside the array (ordinary Kadane) or wraps around the end. A wrapping one is everything except some middle part, so it is total − (the smallest middle sum). Run Kadane for the largest and the smallest sum together.', calc: [`total = ${total}`] });
    cells[1][0] = a[0]; cells[2][0] = a[0];
    for (let i = 1; i < a.length; i++) {
      cells[1][i] = Math.max(a[i], cells[1][i - 1] + a[i]);
      cells[2][i] = Math.min(a[i], cells[2][i - 1] + a[i]);
      maxS = Math.max(maxS, cells[1][i]); minS = Math.min(minS, cells[2][i]);
      snap({ kind: 'fill', cur: [1, i], lines: ['fill'], deps: [{ r: 1, c: i - 1, tone: 'success', label: `+${a[i]}` }, { r: 2, c: i - 1, tone: 'note', label: `+${a[i]}` }], title: `index ${i}: max ending ${cells[1][i]}, min ending ${cells[2][i]}`, text: `Largest sum ending here: start fresh or extend (${cells[1][i]}). Smallest likewise (${cells[2][i]}).`, calc: [`maxSum = ${maxS}`, `minSum = ${minS}`] });
    }
    const ans = maxS < 0 ? maxS : Math.max(maxS, total - minS);
    snap({ kind: 'done', cur: null, lines: ['pick'], answer: `best = ${ans}`, title: `max(${maxS}, ${total} − ${minS}) = ${ans}`, text: maxS < 0 ? `Every number is negative: total − minSum would be the empty array (0), which isn't allowed. Return the best single subarray, ${maxS}.` : `Inside: ${maxS}. Wrapping: total ${total} minus the worst middle ${minS} = ${total - minS}. ${total - minS > maxS ? 'The wrapping one wins.' : 'The inside one wins.'}`, calc: [`= ${ans}`] });
    return steps;
  }

  if (mode === 'turbulent') {
    rows = ['a', 'up', 'down'];
    cols = a.map((_, i) => String(i));
    cells = [[...a], a.map(() => null), a.map(() => null)];
    let best = 1;
    snap({ kind: 'start', cur: null, lines: [], title: 'Longest zig-zag subarray', text: 'A turbulent subarray goes up, down, up, down (or the reverse). Track two lengths ending here: "up" (the last step went up) and "down". Going up extends a run whose last step went down, and the other way round.', calc: [`a = ${list(a)}`] });
    cells[1][0] = 1; cells[2][0] = 1;
    snap({ kind: 'base', cur: [1, 0], lines: ['base'], title: 'up = down = 1', text: 'One element on its own is a turbulent subarray of length 1.', calc: ['best = 1'] });
    for (let i = 1; i < a.length; i++) {
      const upS = a[i] > a[i - 1], dn = a[i] < a[i - 1];
      cells[1][i] = upS ? cells[2][i - 1] + 1 : 1;
      cells[2][i] = dn ? cells[1][i - 1] + 1 : 1;
      best = Math.max(best, cells[1][i], cells[2][i]);
      snap({ kind: upS || dn ? 'fill' : 'restart', cur: [upS ? 1 : 2, i], lines: ['fill', 'pick'], deps: upS ? [{ r: 2, c: i - 1, tone: 'success', label: '+1' }] : dn ? [{ r: 1, c: i - 1, tone: 'success', label: '+1' }] : [], title: upS ? `${a[i - 1]} < ${a[i]}: up = down + 1 = ${cells[1][i]}` : dn ? `${a[i - 1]} > ${a[i]}: down = up + 1 = ${cells[2][i]}` : `${a[i - 1]} = ${a[i]}: start over`, text: upS ? 'This step goes up, so it continues a run whose last step went down.' : dn ? 'This step goes down, so it continues a run whose last step went up.' : 'Equal neighbours break every zig-zag: both lengths reset to 1.', calc: [`best = ${best}`] });
    }
    snap({ kind: 'done', cur: null, lines: ['pick'], answer: `longest = ${best}`, title: `Longest turbulent subarray: ${best}`, text: 'One pass, two numbers: O(n) time, O(1) memory.', calc: [`= ${best}`] });
    return steps;
  }

  if (mode === 'decode' || mode === 'wordbreak') {
    const s = input.s, n = s.length;
    rows = ['s', mode === 'decode' ? 'ways' : 'ok'];
    cols = Array.from({ length: n + 1 }, (_, i) => String(i));
    cells = [['', ...s], Array(n + 1).fill(null)];
    const dict = new Set(input.words ?? []);
    snap({ kind: 'start', cur: null, lines: [], title: mode === 'decode' ? `Ways to decode "${s}"` : `Can "${s}" be split into words?`, text: mode === 'decode' ? 'dp[i] = the number of ways to decode the first i characters. The last piece of a decoding is either one digit (1–9) or two digits (10–26), so dp[i] adds dp[i − 1] and dp[i − 2] when those pieces are valid. A "0" can only appear as the second digit of 10 or 20.' : `ok[i] = whether the first i letters split into dictionary words. The last word ends at i and starts at some j; if ok[j] and s[j..i) is a word, ok[i] is true. Dictionary: ${input.words.join(', ')}.`, calc: [`n = ${n}`] });
    cells[1][0] = mode === 'decode' ? 1 : 'T';
    snap({ kind: 'base', cur: [1, 0], lines: ['base'], title: mode === 'decode' ? 'dp[0] = 1' : 'ok[0] = true', text: 'The empty prefix: there is exactly one way to decode nothing, and nothing splits trivially. Everything is built on this.', calc: [mode === 'decode' ? 'dp[0] = 1' : 'ok[0] = T'] });
    for (let i = 1; i <= n; i++) {
      if (mode === 'decode') {
        const one = s[i - 1] !== '0', two = i >= 2 && s[i - 2] !== '0' && Number(s.slice(i - 2, i)) <= 26;
        cells[1][i] = (one ? cells[1][i - 1] : 0) + (two ? cells[1][i - 2] : 0);
        snap({ kind: 'fill', cur: [1, i], lines: ['fill'], deps: [...(one ? [{ r: 1, c: i - 1, tone: 'success', label: s[i - 1] }] : []), ...(two ? [{ r: 1, c: i - 2, tone: 'success', label: s.slice(i - 2, i) }] : [])], title: `dp[${i}] = ${cells[1][i]}`, text: `${one ? `"${s[i - 1]}" alone is a letter: +dp[${i - 1}] = ${cells[1][i - 1]}.` : '"0" alone is not a letter.'} ${i >= 2 ? (two ? `"${s.slice(i - 2, i)}" is 10–26, a letter: +dp[${i - 2}] = ${cells[1][i - 2]}.` : `"${s.slice(i - 2, i)}" is not 10–26.`) : ''}${cells[1][i] === 0 ? ' Zero ways: nothing can decode this prefix, and every longer prefix inherits that.' : ''}`, calc: [`dp[${i}] = ${cells[1][i]}`] });
      } else {
        const js = [];
        for (let j = 0; j < i; j++) if (cells[1][j] === 'T' && dict.has(s.slice(j, i))) js.push(j);
        cells[1][i] = js.length ? 'T' : 'F';
        snap({ kind: 'fill', cur: [1, i], lines: ['fill'], deps: js.map((j) => ({ r: 1, c: j, tone: 'success', label: s.slice(j, i) })), title: `ok[${i}] = ${js.length ? 'true' : 'false'}`, text: js.length ? `"${s.slice(js[0], i)}" is a word and ok[${js[0]}] is true, so the first ${i} letters split.` : `No dictionary word ends at position ${i} after a prefix that splits.`, calc: [`"${s.slice(0, i)}": ${js.length ? 'T' : 'F'}`] });
      }
    }
    const ans = mode === 'decode' ? cells[1][n] : String(cells[1][n] === 'T');
    snap({ kind: 'done', cur: [1, n], lines: [], answer: mode === 'decode' ? `ways = ${ans}` : `split = ${ans}`, title: mode === 'decode' ? `${ans} way${ans === 1 ? '' : 's'}` : `ok[${n}] = ${ans}`, text: mode === 'decode' ? 'Each prefix was solved once from the two before it: O(n) time, and only two values need keeping.' : 'Each end position tries every start: O(n² · L) with substring lookups. Word Break II lists the sentences; here only yes/no is needed, so DP suffices.', calc: [`= ${ans}`] });
    return steps;
  }

  if (mode === 'nlis') {
    rows = ['a', 'len', 'count'];
    cols = a.map((_, i) => String(i));
    cells = [[...a], a.map(() => null), a.map(() => null)];
    snap({ kind: 'start', cur: null, lines: [], title: 'How many longest increasing subsequences?', text: 'Like LIS, len[i] = the length of the longest increasing subsequence ending at a[i]. Add count[i] = how many of them there are. When an earlier j gives a longer length, take its count; when it ties the best length, add its count.', calc: [`a = ${list(a)}`] });
    for (let i = 0; i < a.length; i++) {
      let len = 1, cnt = 1;
      const deps = [];
      for (let j = 0; j < i; j++) if (a[j] < a[i]) { if (cells[1][j] + 1 > len) { len = cells[1][j] + 1; cnt = cells[2][j]; } else if (cells[1][j] + 1 === len) cnt += cells[2][j]; }
      for (let j = 0; j < i; j++) if (a[j] < a[i]) deps.push({ r: 1, c: j, tone: cells[1][j] + 1 === len ? 'success' : 'muted', label: cells[1][j] + 1 === len ? `+${cells[2][j]}` : undefined });
      cells[1][i] = len; cells[2][i] = cnt;
      snap({ kind: i ? 'fill' : 'base', cur: [1, i], lines: [i ? 'fill' : 'base'], deps, title: `a[${i}] = ${a[i]}: len ${len}, count ${cnt}`, text: deps.length ? `Smaller earlier values can come before ${a[i]}. The longest such run gives length ${len}; ${deps.filter((d) => d.tone === 'success').length > 1 ? `${deps.filter((d) => d.tone === 'success').length} of them tie, so their counts add up to ${cnt}.` : `${cnt} way${cnt === 1 ? '' : 's'} to get it.`}` : `Nothing smaller comes earlier: ${a[i]} starts its own subsequence (length 1, 1 way).`, calc: [`len[${i}] = ${len}`, `count[${i}] = ${cnt}`] });
    }
    const best = Math.max(...cells[1]);
    const ans = cells[1].reduce((s, l, i) => s + (l === best ? cells[2][i] : 0), 0);
    snap({ kind: 'done', cur: null, lines: ['pick'], answer: `count = ${ans}`, title: `${ans} longest increasing subsequence${ans === 1 ? '' : 's'} of length ${best}`, text: `Add the counts of every position whose len is ${best}. O(n²) time.`, calc: [`= ${ans}`] });
    return steps;
  }

  if (mode === 'intbreak') {
    const n = input.n;
    rows = ['dp'];
    inputRows = [];
    cols = Array.from({ length: n }, (_, i) => String(i + 1));
    cells = [Array(n).fill(null)];
    snap({ kind: 'start', cur: null, lines: [], title: `Break ${n} into at least two parts`, text: 'dp[i] = the largest product from splitting i into at least two parts. Cut off a first part j; the rest i − j can stay whole or be split further, whichever is bigger. The same goes for j, so use max(j, dp[j]) · max(i − j, dp[i − j]).', calc: [`n = ${n}`] });
    cells[0][0] = 1;
    snap({ kind: 'base', cur: [0, 0], lines: ['base'], title: 'dp[1] = 1', text: '1 can\'t really be split; treat it as 1 so it multiplies harmlessly.', calc: ['dp[1] = 1'] });
    for (let i = 2; i <= n; i++) {
      let best = 0, bj = 1;
      for (let j = 1; j < i; j++) { const v = Math.max(j, cells[0][j - 1]) * Math.max(i - j, cells[0][i - j - 1]); if (v > best) { best = v; bj = j; } }
      cells[0][i - 1] = best;
      const l = Math.max(bj, cells[0][bj - 1]), r = Math.max(i - bj, cells[0][i - bj - 1]);
      snap({ kind: 'fill', cur: [0, i - 1], lines: ['fill'], deps: [{ r: 0, c: bj - 1, tone: 'success', label: String(l) }, { r: 0, c: i - bj - 1, tone: 'success', label: String(r) }], title: `dp[${i}] = ${l} · ${r} = ${best}`, text: `The best cut is ${bj} + ${i - bj}: ${l === bj ? `keep ${bj} whole` : `split ${bj} (best ${l})`} and ${r === i - bj ? `keep ${i - bj} whole` : `split ${i - bj} (best ${r})`}.`, calc: [`dp[${i}] = ${best}`] });
    }
    snap({ kind: 'done', cur: [0, n - 1], lines: [], answer: `product = ${cells[0][n - 1]}`, title: `Integer break of ${n}: ${cells[0][n - 1]}`, text: 'O(n²). The math shortcut: use as many 3s as possible (a 4 is better as 2 + 2), which gives O(1).', calc: [`= ${cells[0][n - 1]}`] });
    return steps;
  }

  if (mode === 'envelopes') {
    const e = [...input.env].sort((x, y) => x[0] - y[0] || y[1] - x[1]);
    rows = ['w × h', 'dp'];
    cols = e.map((_, i) => String(i));
    cells = [e.map(([w, h]) => `${w}×${h}`), e.map(() => null)];
    snap({ kind: 'start', cur: null, lines: ['base'], title: 'Nest as many envelopes as possible', text: 'An envelope fits in another when both width and height are strictly smaller. Sort by width; then a chain is an increasing run of heights: LIS. The trick: when widths tie, sort heights descending, so two envelopes of the same width can never both be in an increasing run.', calc: [`sorted: ${e.map(([w, h]) => `${w}×${h}`).join(' ')}`] });
    for (let i = 0; i < e.length; i++) {
      let best = 1, from = -1;
      for (let j = 0; j < i; j++) if (e[j][1] < e[i][1] && cells[1][j] + 1 > best) { best = cells[1][j] + 1; from = j; }
      cells[1][i] = best;
      snap({ kind: 'fill', cur: [1, i], lines: ['fill'], deps: from >= 0 ? [{ r: 1, c: from, tone: 'success', label: '+1' }] : [], title: `${e[i][0]}×${e[i][1]}: chain of ${best}`, text: from >= 0 ? `${e[from][0]}×${e[from][1]} has a smaller height (and, because of the sort, a smaller width): put it inside, chain ${cells[1][from]} + 1.` : `No earlier envelope has a smaller height: it starts its own chain.${i > 0 && e[i - 1][0] === e[i][0] ? ` (The same-width ${e[i - 1][0]}×${e[i - 1][1]} comes first with a taller height, so it can't wrongly count.)` : ''}`, calc: [`dp[${i}] = ${best}`] });
    }
    const ans = Math.max(...cells[1]);
    snap({ kind: 'done', cur: null, lines: ['pick'], answer: `dolls = ${ans}`, title: `${ans} envelopes nest`, text: 'This table is O(n²); with 10⁵ envelopes use the O(n log n) LIS (patience sorting with binary search) on the same sorted heights.', calc: [`= ${ans}`] });
    return steps;
  }

  // stones: fill from the end
  const n = a.length;
  rows = ['stone', 'dp'];
  cols = Array.from({ length: n + 1 }, (_, i) => String(i));
  cells = [[...a, ''], Array(n + 1).fill(null)];
  snap({ kind: 'start', cur: null, lines: [], title: 'Alice and Bob take 1, 2 or 3 stones', text: 'dp[i] = how far ahead the player to move can finish, when the stones from i onward are left. Taking k stones gains their sum, and then the opponent is the one to move with dp[i + k] in their favour. So dp[i] = max over k of (sum taken − dp[i + k]). Fill from the end.', calc: [`stones = ${list(a)}`] });
  cells[1][n] = 0;
  snap({ kind: 'base', cur: [1, n], lines: ['base'], title: 'dp[n] = 0', text: 'No stones left: nobody gains anything more.', calc: ['dp[n] = 0'] });
  for (let i = n - 1; i >= 0; i--) {
    let best = -Infinity, bk = 1, s = 0;
    const opts = [];
    for (let k = 1; k <= 3 && i + k <= n; k++) { s += a[i + k - 1]; const v = s - cells[1][i + k]; opts.push([k, s, v]); if (v > best) { best = v; bk = k; } }
    cells[1][i] = best;
    snap({ kind: 'fill', cur: [1, i], lines: ['fill'], deps: opts.map(([k, sum]) => ({ r: 1, c: i + k, tone: k === bk ? 'success' : 'muted', label: `${sum}−` })), title: `dp[${i}] = ${best} (take ${bk})`, text: `From stone ${i}: ${opts.map(([k, sum, v]) => `take ${k} → ${sum} − ${cells[1][i + k]} = ${v}`).join('; ')}. Best: take ${bk}.`, calc: [`dp[${i}] = ${best}`] });
  }
  const d = cells[1][0];
  const ans = d > 0 ? 'Alice' : d < 0 ? 'Bob' : 'Tie';
  snap({ kind: 'done', cur: [1, 0], lines: [], answer: `winner = ${ans}`, title: `dp[0] = ${d}: ${ans}`, text: `Alice moves first, so dp[0] is her lead: ${d > 0 ? 'positive, Alice wins' : d < 0 ? 'negative, Bob wins' : 'zero, a tie'}. "My gain minus your best" turns a two-player game into one DP row. O(n).`, calc: [`= ${ans}`] });
  return steps;
}

// ---------------------------------------------------------------- inputs

export function linParse(values, input) {
  const { mode } = input;
  const ints = (t) => String(t ?? '').split(/[\s,]+/).filter(Boolean).map(Number);
  if (mode === 'squares') { const n = Number(values.n); return Number.isInteger(n) && n >= 1 && n <= 20 ? { input: { mode, n } } : { error: 'n from 1 to 20.' }; }
  if (mode === 'ones') {
    const strs = String(values.strs ?? '').split(/[\s,]+/).filter(Boolean); const m = Number(values.m), n = Number(values.n);
    if (!strs.length || strs.length > 6 || strs.some((x) => !/^[01]{1,6}$/.test(x)) || !Number.isInteger(m) || !Number.isInteger(n) || m < 0 || n < 0 || m > 6 || n > 6) return { error: 'Up to 6 binary strings; m and n from 0 to 6.' };
    return { input: { mode, strs, m, n } };
  }
  if (KNAP.has(mode)) {
    const a = ints(values.a);
    if (!a.length || a.length > 6 || a.some((v) => !Number.isInteger(v) || v < 1 || v > 12)) return { error: '1 to 6 numbers from 1 to 12.' };
    if (mode === 'subset' || mode === 'stone2') { if (a.reduce((x, y) => x + y, 0) > 40) return { error: 'Keep the total at most 40 so the table fits.' }; return { input: { mode, a } }; }
    const target = Number(values.target);
    if (!Number.isInteger(target) || Math.abs(target) > 20 || (mode === 'combsum4' && (target < 1 || target > 12))) return { error: mode === 'combsum4' ? 'target from 1 to 12.' : 'target from −20 to 20.' };
    if (mode === 'targetsum' && a.length > 6) return { error: 'Up to 6 numbers.' };
    return { input: { mode, a: mode === 'combsum4' ? [...new Set(a)] : a, target } };
  }
  if (mode === 'decode') { const s = String(values.s ?? '').trim(); return /^\d{1,9}$/.test(s) ? { input: { mode, s } } : { error: 'A string of up to 9 digits.' }; }
  if (mode === 'wordbreak') { const s = String(values.s ?? '').trim(); const words = [...new Set(String(values.words ?? '').split(/[\s,]+/).filter(Boolean))]; return /^[a-z]{1,13}$/.test(s) && words.length && words.length <= 6 && words.every((w) => /^[a-z]{1,8}$/.test(w)) ? { input: { mode, s, words } } : { error: 's: up to 13 letters; up to 6 words.' }; }
  if (mode === 'intbreak') { const n = Number(values.n); return Number.isInteger(n) && n >= 2 && n <= 12 ? { input: { mode, n } } : { error: 'n from 2 to 12.' }; }
  if (mode === 'envelopes') {
    const env = String(values.env ?? '').split(/;/).map((p) => ints(p)).filter((p) => p.length);
    return env.length && env.length <= 8 && env.every((p) => p.length === 2 && p.every((v) => Number.isInteger(v) && v >= 1 && v <= 99)) ? { input: { mode, env } } : { error: 'Up to 8 envelopes like 5,4; 6,4; 6,7.' };
  }
  const a = ints(values.a);
  const lim = { robber2: [0, 99], product: [-9, 9], circular: [-20, 20], turbulent: [0, 99], nlis: [0, 99], stones: [-20, 20] }[mode];
  if (!a.length || a.length > 9 || a.some((v) => !Number.isInteger(v) || v < lim[0] || v > lim[1])) return { error: `1 to 9 numbers from ${lim[0]} to ${lim[1]}.` };
  return { input: { mode, a } };
}

export function linRandom(input, rand = Math.random) {
  const g = rng(rand);
  const { mode } = input;
  if (mode === 'squares') return { mode, n: g.int(1, 20) };
  if (mode === 'ones') return { mode, strs: Array.from({ length: g.int(1, 5) }, () => Array.from({ length: g.int(1, 4) }, () => g.pick(['0', '1'])).join('')), m: g.int(0, 4), n: g.int(0, 4) };
  if (mode === 'subset' || mode === 'stone2') return { mode, a: Array.from({ length: g.int(1, 6) }, () => g.int(1, 6)) };
  if (mode === 'targetsum') return { mode, a: Array.from({ length: g.int(1, 6) }, () => g.int(1, 4)), target: g.int(-6, 6) };
  if (mode === 'combsum4') return { mode, a: [...new Set(Array.from({ length: g.int(1, 3) }, () => g.int(1, 4)))], target: g.int(1, 9) };
  const arr = (lo, hi) => Array.from({ length: g.int(1, 8) }, () => g.int(lo, hi));
  if (mode === 'decode') return { mode, s: Array.from({ length: g.int(1, 7) }, () => g.pick(['1', '2', '2', '6', '0', '3', '7'])).join('') };
  if (mode === 'wordbreak') { const words = g.shuffle(['a', 'ab', 'b', 'ba', 'aab', 'bb']).slice(0, g.int(1, 4)); return { mode, s: Array.from({ length: g.int(1, 9) }, () => g.pick(['a', 'b'])).join(''), words }; }
  if (mode === 'intbreak') return { mode, n: g.int(2, 12) };
  if (mode === 'envelopes') return { mode, env: Array.from({ length: g.int(1, 7) }, () => [g.int(1, 6), g.int(1, 6)]) };
  const lim = { robber2: [0, 20], product: [-4, 4], circular: [-9, 9], turbulent: [0, 6], nlis: [0, 6], stones: [-9, 9] }[mode];
  return { mode, a: arr(...lim) };
}

export const linFields = (input) => ({
  squares: [{ name: 'n', label: 'n (1 to 20)', placeholder: '12', short: true }],
  ones: [{ name: 'strs', label: 'strs', placeholder: 'e.g. 10, 0001, 111001, 1, 0' }, { name: 'm', label: 'm (zeros)', placeholder: '5', short: true }, { name: 'n', label: 'n (ones)', placeholder: '3', short: true }],
  subset: [{ name: 'a', label: 'nums', placeholder: 'e.g. 1, 5, 11, 5' }],
  stone2: [{ name: 'a', label: 'stones', placeholder: 'e.g. 2, 7, 4, 1, 8, 1' }],
  targetsum: [{ name: 'a', label: 'nums', placeholder: 'e.g. 1, 1, 1, 1, 1' }, { name: 'target', label: 'target', placeholder: '3', short: true }],
  combsum4: [{ name: 'a', label: 'nums (distinct)', placeholder: 'e.g. 1, 2, 3' }, { name: 'target', label: 'target', placeholder: '4', short: true }],
  decode: [{ name: 's', label: 's (digits)', placeholder: '22603', short: true }],
  wordbreak: [{ name: 's', label: 's', placeholder: 'applepenapple' }, { name: 'words', label: 'wordDict', placeholder: 'e.g. apple, pen' }],
  intbreak: [{ name: 'n', label: 'n (2 to 12)', placeholder: '10', short: true }],
  envelopes: [{ name: 'env', label: 'envelopes (w,h; w,h …)', placeholder: 'e.g. 5,4; 6,4; 6,7; 2,3' }],
})[input.mode] ?? [{ name: 'a', label: input.mode === 'stones' ? 'stone values' : input.mode === 'robber2' ? 'money (houses in a circle)' : 'a', placeholder: 'e.g. 2, 3, -2, 4' }];

export const linValues = (input) => ({
  squares: { n: String(input.n) }, ones: { strs: (input.strs ?? []).join(', '), m: String(input.m), n: String(input.n) },
  targetsum: { a: (input.a ?? []).join(', '), target: String(input.target) }, combsum4: { a: (input.a ?? []).join(', '), target: String(input.target) },
  decode: { s: input.s }, wordbreak: { s: input.s, words: (input.words ?? []).join(', ') }, intbreak: { n: String(input.n) }, envelopes: { env: (input.env ?? []).map((e) => e.join(',')).join('; ') },
})[input.mode] ?? { a: input.a.join(', ') };

export const linDescribe = (input) => ({
  squares: `n = ${input.n}`, ones: `${(input.strs ?? []).length} strings, m = ${input.m}, n = ${input.n}`,
  targetsum: `${list(input.a ?? [])}, target ${input.target}`, combsum4: `${list(input.a ?? [])}, target ${input.target}`,
  decode: `"${input.s}"`, wordbreak: `"${input.s}"`, intbreak: `n = ${input.n}`, envelopes: `${(input.env ?? []).length} envelopes`,
})[input.mode] ?? list(input.a);

export const linRule = {
  robber2: 'Run House Robber without the last house, then without the first; take the better.',
  product: 'Keep the largest and smallest product ending here; a negative swaps them.',
  circular: 'Best inside (Kadane) or total − worst middle (Kadane for the minimum).',
  turbulent: 'up = down + 1 after a rise; down = up + 1 after a fall; equal resets.',
  decode: 'dp[i] = (one valid digit ? dp[i−1]) + (valid pair 10–26 ? dp[i−2])',
  wordbreak: 'ok[i] = some ok[j] with s[j..i) a word',
  nlis: 'Longer → take the count; tie → add the count.',
  intbreak: 'dp[i] = max over j of max(j, dp[j]) · max(i−j, dp[i−j])',
  envelopes: 'Sort by width, heights descending on ties; LIS on heights.',
  stones: 'dp[i] = max over k of (sum of k stones) − dp[i+k]',
  subset: 'Each number: every reachable s also reaches s + x (fill right to left).',
  targetsum: 'Count subsets summing to (total + target) / 2.',
  stone2: 'Best pile ≤ total / 2; answer total − 2 · pile.',
  combsum4: 'dp[t] = Σ dp[t − x]: target outside, numbers inside.',
  squares: 'dp[i] = 1 + min dp[i − k²]',
  ones: 'Each string: dp[z][o] = max(dp[z][o], 1 + dp[z − zeros][o − ones]).',
};

// ---------------------------------------------------------------- knapsack rows (one step per item, or per target)

function knapSteps(input) {
  const { mode } = input;
  const a = input.a;
  const steps = [];
  let rows, cols, cells, inputRows = [];
  const snap = (x) => steps.push({ mode, rows, cols, cells: cells.map((r) => [...r]), deps: [], inputRows, ...x });

  if (mode === 'subset' || mode === 'targetsum' || mode === 'stone2') {
    const total = a.reduce((x, y) => x + y, 0);
    const count = mode === 'targetsum';
    let cap;
    if (mode === 'subset') cap = total / 2;
    else if (mode === 'stone2') cap = Math.floor(total / 2);
    else cap = (total + input.target) / 2;
    const intro = {
      subset: `Two groups with equal sums each hold half the total, ${total} / 2. So the question is: can some subset reach exactly ${Number.isInteger(cap) ? cap : `${total} / 2`}? Track which sums are reachable, adding one number at a time. Each row is "reachable using the numbers so far".`,
      targetsum: `Call the numbers with + the set P and the rest N. Then P − N = ${input.target} and P + N = ${total}, so P = (${total} + ${input.target}) / 2 = ${Number.isInteger(cap) ? cap : 'not a whole number'}. Counting sign choices = counting subsets that sum to ${Number.isInteger(cap) ? cap : 'that'}. Each row counts the ways using the numbers so far.`,
      stone2: `Smashing stones is the same as splitting them into two piles and subtracting: the last weight is |pile A − pile B|. To make that small, make one pile as close to half the total (${total} / 2) as possible without going over. Track reachable sums up to ${cap}.`,
    }[mode];
    if (mode !== 'stone2' && (!Number.isInteger(cap) || cap < 0)) {
      rows = ['']; cols = ['—']; cells = [[null]];
      snap({ kind: 'start', cur: null, lines: [], title: mode === 'subset' ? `Total ${total} is odd` : `No whole-number P`, text: intro, calc: [`total = ${total}`] });
      snap({ kind: 'done', cur: null, lines: ['base'], answer: mode === 'subset' ? 'can = false' : 'ways = 0', title: mode === 'subset' ? 'Odd total: false' : 'No assignment: 0', text: mode === 'subset' ? 'Two equal whole-number halves need an even total.' : `(${total} + ${input.target}) must be even and non-negative for P to exist; it isn't, so no sign choice works.`, calc: [mode === 'subset' ? 'false' : '0'] });
      return steps;
    }
    rows = ['start', ...a.map((x) => `+${x}`)];
    cols = Array.from({ length: cap + 1 }, (_, s) => String(s));
    cells = rows.map(() => Array(cap + 1).fill(null));
    const val = (v) => (count ? v : v ? 'T' : '');
    let cur = Array(cap + 1).fill(0); cur[0] = 1;
    cells[0] = cur.map(val);
    snap({ kind: 'start', cur: null, lines: [], title: { subset: `Can a subset of ${list(a)} reach ${cap}?`, targetsum: `Ways to make ${input.target} with ± signs`, stone2: `Stones ${list(a)}: piles as even as possible` }[mode], text: intro, calc: [`total = ${total}`, `${mode === 'targetsum' ? 'P' : 'target'} = ${cap}`] });
    snap({ kind: 'base', cur: [0, 0], lines: ['base'], title: count ? 'ways[0] = 1' : 'Sum 0 is reachable', text: count ? 'There is one way to make 0: choose nothing.' : 'Choosing nothing gives sum 0; every other sum starts unreachable.', calc: [count ? 'ways[0] = 1' : 'can[0] = T'] });
    a.forEach((x, k) => {
      const nx = [...cur];
      for (let s = cap; s >= x; s--) nx[s] = count ? nx[s] + cur[s - x] : (nx[s] || cur[s - x] ? 1 : 0);
      const fresh = [];
      for (let s = 0; s <= cap; s++) if (nx[s] !== cur[s]) fresh.push(s);
      cur = nx;
      cells[k + 1] = cur.map(val);
      snap({
        kind: 'fill', cur: [k + 1, cap], lines: ['fill'],
        deps: fresh.map((s) => ({ r: k, c: s - x, tone: 'success', label: `+${x}` })),
        title: `Add ${x}: ${fresh.length ? (count ? `${plural(fresh.length, 'count')} change` : `newly reachable ${fresh.join(', ')}`) : 'nothing new'}`,
        text: count ? `Every subset so far either skips ${x} (the count above stays) or includes it (the count at s − ${x} moves up). Going from high sums to low means ${x} is counted at most once per subset.` : `Every sum reachable before stays reachable (skip ${x}); every reachable s gives s + ${x} (take ${x}). ${fresh.length ? `New: ${fresh.join(', ')}.` : 'Nothing new within the limit.'} Filling right to left in one array keeps ${x} from being used twice.`,
        calc: [`${mode === 'targetsum' ? 'ways' : 'can'}[${cap}] = ${count ? cur[cap] : cur[cap] ? 'T' : 'F'}`],
      });
    });
    if (mode === 'stone2') {
      let best = cap; while (!cur[best]) best--;
      const ans = total - 2 * best;
      snap({ kind: 'done', cur: [a.length, best], lines: ['pick'], answer: `weight = ${ans}`, title: `Best pile ${best}: ${total} − 2·${best} = ${ans}`, text: `The largest reachable sum not above half is ${best}; the other pile is ${total - best}. Smashing them down leaves ${ans}. O(n · total) time.`, calc: [`= ${ans}`] });
    } else {
      const ans = count ? cur[cap] : cur[cap] ? 'true' : 'false';
      snap({ kind: 'done', cur: [a.length, cap], lines: ['pick'], answer: count ? `ways = ${ans}` : `can = ${ans}`, title: count ? `${ans} way${ans === 1 ? '' : 's'}` : `Reach ${cap}: ${ans}`, text: count ? `Each of the ${ans} subsets summing to ${cap} gets +; the rest get −. O(n · P) time, one array.` : `${ans === 'true' ? `Some subset reaches ${cap}, and the rest make the other half.` : `No subset reaches ${cap}, so no equal split exists.`} O(n · total) time, O(total) memory.`, calc: [`= ${ans}`] });
    }
    return steps;
  }

  if (mode === 'combsum4' || mode === 'squares') {
    const T = mode === 'combsum4' ? input.target : input.n;
    const parts = mode === 'combsum4' ? [...a].sort((x, y) => x - y) : Array.from({ length: Math.floor(Math.sqrt(T)) }, (_, k) => (k + 1) ** 2);
    rows = [mode === 'combsum4' ? 'ways' : 'fewest'];
    cols = Array.from({ length: T + 1 }, (_, t) => String(t));
    cells = [Array(T + 1).fill(null)];
    snap({ kind: 'start', cur: null, lines: [], title: mode === 'combsum4' ? `Ordered ways to make ${T} from ${list(parts)}` : `Fewest squares summing to ${T}`, text: mode === 'combsum4' ? 'Order matters here, so think about the LAST number of a sequence: any x in nums, preceded by any sequence making t − x. dp[t] = sum of dp[t − x]. Because every t looks at every x, sequences in every order are counted (target in the outer loop; Coin Change II puts coins outside to avoid exactly that).' : `The squares up to ${T} are ${parts.join(', ')}. The last square used is one of them; before it, the best for i − square. dp[i] = 1 + min over those.`, calc: [`parts: ${parts.join(', ')}`] });
    cells[0][0] = mode === 'combsum4' ? 1 : 0;
    snap({ kind: 'base', cur: [0, 0], lines: ['base'], title: mode === 'combsum4' ? 'dp[0] = 1' : 'dp[0] = 0', text: mode === 'combsum4' ? 'The empty sequence is the one way to make 0.' : 'Zero needs no squares.', calc: [`dp[0] = ${cells[0][0]}`] });
    for (let t = 1; t <= T; t++) {
      const use = parts.filter((x) => x <= t);
      if (mode === 'combsum4') cells[0][t] = use.reduce((acc, x) => acc + cells[0][t - x], 0);
      else cells[0][t] = 1 + Math.min(...use.map((x) => cells[0][t - x]));
      const bestX = mode === 'squares' ? use.find((x) => cells[0][t - x] + 1 === cells[0][t]) : null;
      snap({
        kind: 'fill', cur: [0, t], lines: ['fill'],
        deps: use.map((x) => ({ r: 0, c: t - x, tone: mode === 'combsum4' || x === bestX ? 'success' : 'muted', label: `+${x}` })),
        title: mode === 'combsum4' ? `dp[${t}] = ${use.map((x) => `dp[${t - x}]`).join(' + ') || '0'} = ${cells[0][t]}` : `dp[${t}] = 1 + dp[${t - bestX}] = ${cells[0][t]}`,
        text: mode === 'combsum4' ? (use.length ? `A sequence making ${t} ends with ${use.join(' or ')}; before that it makes ${use.map((x) => t - x).join(' or ')}. Add those counts.` : 'No number is small enough.') : `Ending with ${bestX} (${Math.sqrt(bestX)}²) leaves ${t - bestX}, which needs ${cells[0][t - bestX]}. ${use.length > 1 ? `The other squares give ${use.filter((x) => x !== bestX).map((x) => 1 + cells[0][t - x]).join(', ')}.` : ''}`,
        calc: [`dp[${t}] = ${cells[0][t]}`],
      });
    }
    const ans = cells[0][T];
    snap({ kind: 'done', cur: [0, T], lines: [], answer: `${mode === 'combsum4' ? 'ways' : 'squares'} = ${ans}`, title: mode === 'combsum4' ? `${ans} ordered sequences` : `${T} needs ${ans} square${ans === 1 ? '' : 's'}`, text: mode === 'combsum4' ? `O(target · n). Swap the loops (numbers outside) and you would count each combination once instead: Coin Change II.` : `O(n · √n). Lagrange: every number is a sum of at most 4 squares, so the answer is always 1 to 4.`, calc: [`= ${ans}`] });
    return steps;
  }

  // ones and zeroes: a 2-D capacity table, one string at a time
  const { strs, m, n } = input;
  rows = Array.from({ length: m + 1 }, (_, z) => `${z} zeros`);
  cols = Array.from({ length: n + 1 }, (_, o) => `${o}`);
  let dp = rows.map(() => Array(n + 1).fill(0));
  cells = dp.map((r) => [...r]);
  snap({ kind: 'start', cur: null, lines: ['base'], title: `Most strings within ${m} zeros and ${n} ones`, text: 'A knapsack with two capacities. dp[z][o] = the most strings you can pick using at most z zeros and o ones (rows = zeros, columns = ones). For each string, either skip it or take it: take = 1 + the best with its zeros and ones removed from the budget.', calc: strs.map((s2) => `"${s2}": ${[...s2].filter((c) => c === '0').length} zeros, ${[...s2].filter((c) => c === '1').length} ones`) });
  strs.forEach((s2) => {
    const z0 = [...s2].filter((c) => c === '0').length, o1 = s2.length - z0;
    const nx = dp.map((r) => [...r]);
    const fresh = [];
    for (let z = m; z >= z0; z--) for (let o = n; o >= o1; o--) if (dp[z - z0][o - o1] + 1 > nx[z][o]) { nx[z][o] = dp[z - z0][o - o1] + 1; fresh.push([z, o]); }
    dp = nx;
    cells = dp.map((r) => [...r]);
    snap({ kind: 'fill', cur: [m, n], lines: ['fill'], deps: fresh.map(([z, o]) => ({ r: z, c: o, tone: 'success' })), title: `"${s2}" (${z0} zeros, ${o1} ones): ${plural(fresh.length, 'cell')} improve`, text: z0 > m || o1 > n ? `"${s2}" needs ${z0} zeros and ${o1} ones, more than the whole budget (${m} zeros, ${n} ones): it can never be chosen, and the table stays as it is.` : `For every budget with room for ${z0} zeros and ${o1} ones, taking "${s2}" gives 1 + the best for the budget left over. ${fresh.length ? 'Highlighted cells got better.' : 'It never beats what is already there.'} Going from big budgets to small keeps the string from being taken twice.`, calc: [`dp[${m}][${n}] = ${dp[m][n]}`] });
  });
  snap({ kind: 'done', cur: [m, n], lines: ['pick'], answer: `size = ${dp[m][n]}`, title: `Answer: ${dp[m][n]} strings`, text: `The full budget, ${m} zeros and ${n} ones, fits ${dp[m][n]} strings. O(strings · m · n).`, calc: [`= ${dp[m][n]}`] });
  return steps;
}
