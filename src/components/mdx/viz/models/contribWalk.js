/**
 * <ContribWalkViz>: Contribution Technique problems that the lesson's other step-throughs don't cover.
 * Same strip shape as <GreedyWalkViz> (labelled rows of cells with tags, bands and notes), plus chips.
 *   zeros     2348  each zero ends (current run length) all-zero subarrays
 *   vowels    2063  a vowel at i sits in (i + 1)(n − i) substrings
 *   pairings  2425  each number appears (length of the other array) times in nums3
 *   groups    2615  per value, distances to equal values by prefix sums of positions
 *   maxk      2962  for each right end, the valid starts reach back to the k-th last maximum
 *   wizards   2281  each wizard is the weakest in a span; weight each strength by the groups it is in
 * Pure, so scripts/viz-check.mjs can compare each mode with a brute force over all subarrays / pairs.
 */
import { list, rng } from './util.js';

export const CONTRIB_WALK = {
  zeros: { label: 'Zero-filled subarrays', input: { mode: 'zeros', nums: [1, 3, 0, 0, 2, 0, 0, 4] } },
  vowels: { label: 'Vowels of all substrings', input: { mode: 'vowels', s: 'aba' } },
  vowels2: { label: 'Vowels: a longer word', input: { mode: 'vowels', s: 'abcde' } },
  pairings: { label: 'XOR of all pairings', input: { mode: 'pairings', a: [2, 1, 3], b: [10, 2, 5, 0] } },
  pairingsEven: { label: 'Pairings: both even', input: { mode: 'pairings', a: [1, 2], b: [3, 4] } },
  groups: { label: 'Sum of distances to equal values', input: { mode: 'groups', nums: [1, 3, 1, 1, 2] } },
  maxk: { label: 'Max appears at least k times', input: { mode: 'maxk', nums: [1, 3, 2, 3, 3], k: 2 } },
  wizards: { label: 'Total strength of wizards', input: { mode: 'wizards', nums: [1, 3, 1, 2] } },
};

export const contribWalkCode = (mode) => ({
  zeros: [['run', 'run = (x == 0) ? run + 1 : 0;      // zeros ending here'], ['add', 'total += run;                      // all-zero subarrays that END here'], ['ans', 'return total;']],
  vowels: [['each', 'for each vowel at i:'], ['add', '    total += (long) (i + 1) * (n − i);   // starts ≤ i  ×  ends ≥ i'], ['ans', 'return total;']],
  pairings: [['a', 'if (nums2.length is odd) x ^= every nums1[i];   // each appears nums2.length times'], ['b', 'if (nums1.length is odd) x ^= every nums2[j];'], ['ans', 'return x;']],
  groups: [['group', 'group indexes by value (in order)'], ['each', 'for the k-th index p of a group of m:'], ['add', '    arr[p] = (k · p − sumLeft) + (sumRight − (m − k − 1) · p)'], ['ans', 'return arr;']],
  maxk: [['pos', 'pos = indexes of the maximum m, in order'], ['each', 'for each right end r: c = how many m\'s at or before r'], ['add', '    if (c ≥ k) total += pos[c − k] + 1;   // any start up to the k-th last m'], ['ans', 'return total;']],
  wizards: [['span', 'span of i: after the previous wizard < s[i], before the next one ≤ s[i]   (ties go to the rightmost)'], ['weight', 'each j in the span sits in (left choices) × (right choices) of those groups'], ['add', 'total += s[i] × Σ s[j] × count[j]        // prefix of prefix sums make it O(1)'], ['ans', 'return total % (10⁹ + 7);']],
})[mode];

// ---------------------------------------------------------------- brute forces

const subarrays = (a) => { const out = []; for (let i = 0; i < a.length; i++) for (let j = i; j < a.length; j++) out.push(a.slice(i, j + 1)); return out; };

export function contribWalkAnswer(input) {
  const { mode } = input;
  if (mode === 'zeros') return subarrays(input.nums).filter((x) => x.every((v) => v === 0)).length;
  if (mode === 'vowels') return subarrays([...input.s]).reduce((t, x) => t + x.filter((c) => 'aeiou'.includes(c)).length, 0);
  if (mode === 'pairings') { let x = 0; for (const p of input.a) for (const q of input.b) x ^= p ^ q; return x; }
  if (mode === 'groups') return input.nums.map((v, i) => input.nums.reduce((t, w, j) => t + (w === v ? Math.abs(i - j) : 0), 0));
  if (mode === 'maxk') { const m = Math.max(...input.nums); return subarrays(input.nums).filter((x) => x.filter((v) => v === m).length >= input.k).length; }
  return subarrays(input.nums).reduce((t, x) => t + Math.min(...x) * x.reduce((p, q) => p + q, 0), 0);
}

// ---------------------------------------------------------------- step-throughs

export function contribWalk(input) {
  const { mode } = input;
  const steps = [];
  const snap = (x) => steps.push({ mode, strips: [], chips: null, ...x });
  const S = (label, items, o = {}) => ({ label, items: [...items], cls: {}, tags: {}, sub: {}, bands: [], index: true, ...o });
  const totalChip = (t) => [{ label: 'total', chips: [{ key: 't', text: String(t), tone: 'success' }] }];

  if (mode === 'zeros') {
    const a = input.nums;
    let run = 0, total = 0;
    const adds = {};
    const view = (i) => { const st = S('nums', a); a.forEach((v, k) => { if (adds[k] !== undefined) st.sub[k] = { text: `+${adds[k]}`, tone: adds[k] ? 'success' : undefined }; if (i !== null && k > i) st.cls[k] = 'muted'; }); if (i !== null) { st.cls[i] = 'cur'; if (run) st.bands = [{ from: i - run + 1, to: i, tone: 'accent' }]; } return st; };
    snap({ kind: 'start', lines: [], strips: [view(null)], chips: totalChip(0), title: `All-zero subarrays of ${list(a)}`, text: 'Count each subarray at its right end. A subarray of zeros ending at i can start anywhere inside the run of zeros that ends at i, so it adds (that run\'s length) new subarrays. One pass with a counter.', calc: ['run = 0, total = 0'] });
    a.forEach((v, i) => {
      run = v === 0 ? run + 1 : 0;
      total += run; adds[i] = run;
      snap({ kind: run ? 'add' : 'skip', lines: ['run', 'add'], strips: [view(i)], chips: totalChip(total), title: run ? `Zero run of ${run} ends here: +${run}` : `${v} breaks the run: +0`, text: run ? `The zeros ending at ${i} form a run of ${run}. Each start in it gives one new all-zero subarray ending here: ${run} of them.` : 'A non-zero can\'t be in any all-zero subarray, and it resets the run.', calc: [`run = ${run}`, `total = ${total}`] });
    });
    snap({ kind: 'done', lines: ['ans'], strips: [view(null)], chips: totalChip(total), out: total, answer: `${total}`, title: `${total} all-zero subarrays`, text: 'A run of length L gives 1 + 2 + … + L = L(L + 1)/2 subarrays; adding the run length at each step builds the same sum. O(n), and use a long for big inputs.', calc: [`= ${total}`] });
    return steps;
  }

  if (mode === 'vowels') {
    const s = [...input.s], n = s.length;
    let total = 0;
    const adds = {};
    const view = (i) => { const st = S('word', s); s.forEach((c, k) => { if (!'aeiou'.includes(c)) st.cls[k] = 'dim'; if (adds[k] !== undefined) st.sub[k] = { text: `+${adds[k]}`, tone: 'success' }; }); if (i !== null) { st.cls[i] = 'cur'; st.bands = [{ from: 0, to: i, tone: 'accent', label: `${i + 1} starts` }, { from: i, to: n - 1, tone: 'note', label: `${n - i} ends` }].slice(0, 1); st.tags[i] = [{ label: `${n - i} ends`, tone: 'note' }]; } return st; };
    snap({ kind: 'start', lines: ['each'], strips: [view(null)], chips: totalChip(0), title: `Vowels in every substring of "${input.s}"`, text: `There are ${n * (n + 1) / 2} substrings; counting vowels in each is O(n²) or worse. Flip it: how many substrings contain the vowel at position i? Any start from 0 to i (i + 1 choices) with any end from i to n − 1 (n − i choices).`, calc: [`${n * (n + 1) / 2} substrings`] });
    s.forEach((c, i) => {
      if (!'aeiou'.includes(c)) return;
      const add = (i + 1) * (n - i);
      total += add; adds[i] = add;
      snap({ kind: 'add', lines: ['each', 'add'], strips: [view(i)], chips: totalChip(total), title: `'${c}' at ${i}: ${i + 1} × ${n - i} = ${add} substrings`, text: `A substring contains position ${i} when it starts at or before ${i} (${i + 1} ways, shaded) and ends at or after ${i} (${n - i} way${n - i === 1 ? '' : 's'}). Each of those ${add} substrings counts this vowel once.`, calc: [`(${i} + 1) × (${n} − ${i}) = ${add}`, `total = ${total}`] });
    });
    snap({ kind: 'done', lines: ['ans'], strips: [view(null)], chips: totalChip(total), out: total, answer: `${total}`, title: `${total} vowels in total`, text: 'One pass, O(n). For n = 10⁵ the total reaches about 1.7 × 10¹⁴: use a long.', calc: [`= ${total}`] });
    return steps;
  }

  if (mode === 'pairings') {
    const { a, b } = input;
    const xa = a.reduce((p, q) => p ^ q, 0), xb = b.reduce((p, q) => p ^ q, 0);
    const useA = b.length % 2 === 1, useB = a.length % 2 === 1;
    const table = a.flatMap((p) => b.map((q) => p ^ q));
    snap({ kind: 'start', lines: [], strips: [S('nums1', a), S('nums2', b)], title: `XOR of all ${a.length * b.length} pairings`, text: `Building nums3 takes ${a.length} × ${b.length} XORs. But XOR doesn't care about order, and x ^ x = 0. Each nums1[i] is paired with every nums2[j], so it appears ${b.length} times in nums3; each nums2[j] appears ${a.length} times. A value XOR-ed an even number of times cancels; an odd number of times, it stays once.`, calc: [`nums3 has ${a.length * b.length} values`] });
    if (table.length <= 12) snap({ kind: 'add', lines: [], strips: [S('nums3', table, { index: false })], chips: [{ label: 'XOR of nums3', chips: [{ key: 'x', text: String(table.reduce((p, q) => p ^ q, 0)), tone: 'muted' }] }], title: 'The long way, for comparison', text: `Every pairing written out: ${table.length} values. Their XOR is what we want, without ever building this list.`, calc: [`${table.length} XORs`] });
    snap({ kind: useA ? 'take' : 'skip', lines: ['a'], strips: [S('nums1', a, { cls: Object.fromEntries(a.map((_, k) => [k, useA ? 'hit' : 'dim'])) }), S('nums2', b)], chips: [{ label: 'x', chips: [{ key: 'x', text: String(useA ? xa : 0), tone: 'success' }] }], title: useA ? `nums2 has ${b.length} values (odd): keep nums1, XOR ${xa}` : `nums2 has ${b.length} values (even): nums1 cancels`, text: useA ? `Each nums1 value appears ${b.length} times, an odd number, so one copy of each survives: the XOR of nums1, ${xa}.` : `Each nums1 value appears ${b.length} times, an even number, so every one of them cancels out.`, calc: [`x = ${useA ? xa : 0}`] });
    const x = (useA ? xa : 0) ^ (useB ? xb : 0);
    snap({ kind: useB ? 'take' : 'skip', lines: ['b'], strips: [S('nums1', a, { cls: Object.fromEntries(a.map((_, k) => [k, useA ? 'hit' : 'dim'])) }), S('nums2', b, { cls: Object.fromEntries(b.map((_, k) => [k, useB ? 'hit' : 'dim'])) })], chips: [{ label: 'x', chips: [{ key: 'x', text: String(x), tone: 'success' }] }], title: useB ? `nums1 has ${a.length} values (odd): keep nums2, XOR ${xb}` : `nums1 has ${a.length} values (even): nums2 cancels`, text: useB ? `Each nums2 value appears ${a.length} times, so one copy survives: XOR in ${xb}.` : `Each nums2 value appears ${a.length} times, an even number: all cancel.`, calc: [`x = ${x}`] });
    snap({ kind: 'done', lines: ['ans'], strips: [S('nums1', a), S('nums2', b)], chips: [{ label: 'x', chips: [{ key: 'x', text: String(x), tone: 'success' }] }], out: x, answer: `${x}`, title: `XOR of all pairings = ${x}`, text: 'O(n + m) instead of O(n · m): only the parity of how often each value appears matters.', calc: [`= ${x}`] });
    return steps;
  }

  if (mode === 'groups') {
    const a = input.nums, n = a.length;
    const byVal = new Map();
    a.forEach((v, i) => { if (!byVal.has(v)) byVal.set(v, []); byVal.get(v).push(i); });
    const arr = Array(n).fill(null);
    const view = (i, grp) => { const st = S('nums', a); arr.forEach((v, k) => { if (v !== null) st.sub[k] = { text: String(v), tone: 'success' }; }); if (grp) grp.forEach((p) => { st.cls[p] = 'kept'; }); if (i !== null) st.cls[i] = 'cur'; return st; };
    snap({ kind: 'start', lines: ['group'], strips: [view(null)], chips: [{ label: 'groups', chips: [...byVal.entries()].map(([v, ps]) => ({ key: v, text: `${v}: ${list(ps)}` })) }], title: `Distances to equal values in ${list(a)}`, text: 'Only equal values talk to each other, so group the indexes by value. Inside a group of sorted positions, the distance from p to the k earlier positions is k · p − (their sum), and to the later ones it is (their sum) − (count) · p. Running sums make each answer O(1).', calc: [`${byVal.size} groups`] });
    for (const [v, ps] of byVal) {
      const m = ps.length, total = ps.reduce((x, y) => x + y, 0);
      let left = 0;
      ps.forEach((p, k) => {
        const right = total - left - p;
        const val = (k * p - left) + (right - (m - k - 1) * p);
        arr[p] = val;
        snap({ kind: m > 1 ? 'add' : 'skip', lines: ['each', 'add'], strips: [view(p, ps)], chips: [{ label: `value ${v}`, chips: ps.map((q) => ({ key: q, text: `@${q}`, tone: q === p ? 'accent' : undefined })) }], title: m === 1 ? `${v} at ${p} is alone: 0` : `arr[${p}] = ${val}`, text: m === 1 ? 'No other index holds this value.' : `Earlier ${v}s: ${k} of them, positions summing to ${left}: ${k} × ${p} − ${left} = ${k * p - left}. Later ${v}s: ${m - k - 1}, summing to ${right}: ${right} − ${m - k - 1} × ${p} = ${right - (m - k - 1) * p}.`, calc: [`arr[${p}] = ${val}`] });
        left += p;
      });
    }
    snap({ kind: 'done', lines: ['ans'], strips: [view(null)], out: [...arr], answer: list(arr), title: `arr = ${list(arr)}`, text: 'Each group is walked once with a running sum: O(n) after grouping. Comparing every pair of equal values would be O(n²) for an array of all-equal values.', calc: [list(arr)] });
    return steps;
  }

  if (mode === 'maxk') {
    const a = input.nums, k = input.k, m = Math.max(...a);
    const pos = [];
    let total = 0;
    const adds = {};
    const view = (r) => { const st = S('nums', a); a.forEach((v, i) => { if (v === m) st.cls[i] = 'kept'; if (adds[i] !== undefined) st.sub[i] = { text: `+${adds[i]}`, tone: adds[i] ? 'success' : undefined }; if (r !== null && i > r) st.cls[i] = 'muted'; }); if (r !== null) { st.cls[r] = `${st.cls[r] ?? ''} cur`; if (pos.length >= k) st.bands = [{ from: 0, to: pos[pos.length - k], tone: 'success', label: 'valid starts' }]; } return st; };
    snap({ kind: 'start', lines: ['pos'], strips: [view(null)], chips: totalChip(0), title: `Subarrays with the max (${m}) at least ${k} times`, text: `Count by right end r. A subarray ending at r has enough ${m}s exactly when it starts at or before the ${k}-th last ${m} up to r. So if there are c ≥ ${k} of them so far, every start from 0 to pos[c − ${k}] works: pos[c − ${k}] + 1 subarrays.`, calc: [`m = ${m}`] });
    a.forEach((v, r) => {
      if (v === m) pos.push(r);
      const add = pos.length >= k ? pos[pos.length - k] + 1 : 0;
      total += add; adds[r] = add;
      snap({ kind: add ? 'add' : 'skip', lines: ['each', 'add'], strips: [view(r)], chips: totalChip(total), title: add ? `End at ${r}: starts 0..${pos[pos.length - k]} work, +${add}` : `End at ${r}: only ${pos.length} ${m}${pos.length === 1 ? '' : 's'} so far, +0`, text: add ? `The ${k}-th last ${m} up to here is at ${pos[pos.length - k]}. Any start at or before it includes at least ${k} ${m}s (shaded band): ${add} subarrays end here.` : `Fewer than ${k} ${m}s have appeared, so no subarray ending here qualifies.`, calc: [`total = ${total}`] });
    });
    snap({ kind: 'done', lines: ['ans'], strips: [view(null)], chips: totalChip(total), out: total, answer: `${total}`, title: `${total} subarrays`, text: 'One pass over the array with the list of maximum positions: O(n). A sliding window that counts the maximums works the same way.', calc: [`= ${total}`] });
    return steps;
  }

  // wizards
  const a = input.nums, n = a.length;
  let total = 0;
  const contrib = {};
  snap({ kind: 'start', lines: [], strips: [S('strength', a)], chips: totalChip(0), title: `Total strength of all groups of ${list(a)}`, text: 'Each group pays (its weakest) × (its sum). Charge every group to its weakest wizard (the rightmost one on ties). Wizard i is the weakest of exactly the groups inside its span: from just after the previous strictly weaker wizard to just before the next weaker-or-equal one. Within the span, wizard j sits in (choices of left end) × (choices of right end) of those groups, so i contributes s[i] × Σ s[j] × count[j].', calc: [`${n * (n + 1) / 2} groups`] });
  for (let i = 0; i < n; i++) {
    let L = i, R = i;
    while (L > 0 && a[L - 1] >= a[i]) L--;   // ties go to the rightmost weakest
    while (R < n - 1 && a[R + 1] > a[i]) R++;
    const cnt = {};
    let inner = 0;
    for (let j = L; j <= R; j++) { cnt[j] = j <= i ? (j - L + 1) * (R - i + 1) : (i - L + 1) * (R - j + 1); inner += a[j] * cnt[j]; }
    const add = a[i] * inner;
    total += add; contrib[i] = add;
    const st = S('strength', a);
    st.bands = [{ from: L, to: R, tone: 'accent', label: `${a[i]} is weakest` }];
    st.cls[i] = 'cur';
    for (let j = L; j <= R; j++) st.sub[j] = { text: `×${cnt[j]}` };
    a.forEach((_, j) => { if (j < L || j > R) st.cls[j] = 'dim'; });
    snap({ kind: 'add', lines: ['span', 'weight', 'add'], strips: [st], chips: totalChip(total), title: `Wizard ${i} (${a[i]}): span ${L}..${R}, adds ${add}`, text: `Groups where ${a[i]} at ${i} is the weakest start in ${L}..${i} (${i - L + 1} ways) and end in ${i}..${R} (${R - i + 1} ways). The small "×c" under each wizard says how many of them include it. Sum of their sums: ${Array.from({ length: R - L + 1 }, (_, t) => `${a[L + t]}·${cnt[L + t]}`).join(' + ')} = ${inner}. Times ${a[i]}: ${add}.`, calc: [`${a[i]} × ${inner} = ${add}`, `total = ${total}`] });
  }
  const st = S('strength', a);
  a.forEach((_, j) => { st.sub[j] = { text: `+${contrib[j]}`, tone: 'success' }; });
  snap({ kind: 'done', lines: ['ans'], strips: [st], chips: totalChip(total), out: total, answer: `${total}`, title: `Total strength: ${total}`, text: 'Shown here in O(n²). The real solution finds each span with a monotonic stack and replaces Σ s[j] × count[j] with a difference of prefix-of-prefix sums, for O(n) overall, all modulo 10⁹ + 7.', calc: [`${Object.values(contrib).join(' + ')} = ${total}`] });
  return steps;
}

// ---------------------------------------------------------------- inputs

const ints = (t) => String(t ?? '').replace(/[[\]]/g, ' ').split(/[\s,]+/).filter(Boolean).map(Number);
const isInt = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi;
const intsIn = (t, lo, hi, a, b) => { const r = ints(t); return r.length >= a && r.length <= b && r.every((v) => isInt(v, lo, hi)) ? r : null; };

export function parseContribWalk(values, input) {
  const { mode } = input;
  if (mode === 'zeros') { const a = intsIn(values.nums, -9, 9, 1, 10); return a ? { input: { mode, nums: a } } : { error: '1 to 10 numbers from −9 to 9 (put in some zeros).' }; }
  if (mode === 'vowels') { const s = String(values.s ?? '').trim(); return /^[a-z]{1,10}$/.test(s) ? { input: { mode, s } } : { error: '1 to 10 lower-case letters.' }; }
  if (mode === 'pairings') { const a = intsIn(values.a, 0, 31, 1, 4), b = intsIn(values.b, 0, 31, 1, 4); return a && b ? { input: { mode, a, b } } : { error: '1 to 4 numbers in each array, from 0 to 31.' }; }
  if (mode === 'groups') { const a = intsIn(values.nums, 0, 9, 1, 9); return a ? { input: { mode, nums: a } } : { error: '1 to 9 numbers from 0 to 9.' }; }
  if (mode === 'maxk') { const a = intsIn(values.nums, 1, 9, 1, 10), k = Number(values.k); return a && isInt(k, 1, 10) ? { input: { mode, nums: a, k } } : { error: '1 to 10 numbers from 1 to 9, and k from 1 to 10.' }; }
  const a = intsIn(values.nums, 1, 9, 1, 6);
  return a ? { input: { mode, nums: a } } : { error: '1 to 6 strengths from 1 to 9.' };
}

export function contribWalkValues(input) {
  const { mode } = input;
  if (mode === 'vowels') return { s: input.s };
  if (mode === 'pairings') return { a: input.a.join(', '), b: input.b.join(', ') };
  if (mode === 'maxk') return { nums: input.nums.join(', '), k: String(input.k) };
  return { nums: input.nums.join(', ') };
}

export function randomContribWalk(input, rand = Math.random) {
  const g = rng(rand);
  const { mode } = input;
  const arr = (n, lo, hi) => Array.from({ length: n }, () => g.int(lo, hi));
  if (mode === 'zeros') return { mode, nums: Array.from({ length: g.int(1, 10) }, () => (g.bool(0.5) ? 0 : g.int(-3, 3))) };
  if (mode === 'vowels') return { mode, s: Array.from({ length: g.int(1, 10) }, () => g.pick('abeiou'.split(''))).join('') };
  if (mode === 'pairings') return { mode, a: arr(g.int(1, 4), 0, 31), b: arr(g.int(1, 4), 0, 31) };
  if (mode === 'groups') return { mode, nums: arr(g.int(1, 9), 0, 3) };
  if (mode === 'maxk') return { mode, nums: arr(g.int(1, 10), 1, 4), k: g.int(1, 3) };
  return { mode, nums: arr(g.int(1, 6), 1, 5) };
}

export const contribWalkFields = (input) => ({
  zeros: [{ name: 'nums', label: 'nums', placeholder: '1, 3, 0, 0, 2, 0, 0, 4' }],
  vowels: [{ name: 's', label: 'word', placeholder: 'aba', short: true }],
  pairings: [{ name: 'a', label: 'nums1', placeholder: '2, 1, 3' }, { name: 'b', label: 'nums2', placeholder: '10, 2, 5, 0' }],
  groups: [{ name: 'nums', label: 'nums', placeholder: '1, 3, 1, 1, 2' }],
  maxk: [{ name: 'nums', label: 'nums', placeholder: '1, 3, 2, 3, 3' }, { name: 'k', label: 'k', placeholder: '2', short: true }],
  wizards: [{ name: 'nums', label: 'strengths', placeholder: '1, 3, 1, 2' }],
})[input.mode];

export function contribWalkDescribe(input) {
  const { mode } = input;
  if (mode === 'vowels') return `"${input.s}"`;
  if (mode === 'pairings') return `${list(input.a)} and ${list(input.b)}`;
  if (mode === 'maxk') return `${list(input.nums)}, k = ${input.k}`;
  return list(input.nums);
}

export const contribWalkRule = {
  zeros: 'each zero ends (run length) all-zero subarrays',
  vowels: 'a vowel at i is in (i + 1)(n − i) substrings',
  pairings: 'a value survives if it appears an odd number of times',
  groups: 'k · p − sumLeft + sumRight − (m − k − 1) · p',
  maxk: 'ending at r: starts up to the k-th last maximum',
  wizards: 'charge each group to its weakest; weight strengths by group counts',
};
