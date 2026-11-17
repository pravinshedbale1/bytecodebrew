/**
 * Contribution-technique step-throughs (models for the visuals in ContributionViz.jsx).
 *
 * The idea every visual shows: instead of listing every subarray / pair / subset / substring and
 * adding up what each one is worth, turn the sum around and ask how much ONE element (or bit, or
 * edge) adds to the total across all of them, then add those contributions.
 *
 *   span      sum of all subarray sums, sum of odd-length subarrays: (i + 1) · (n − i) choices
 *   bits      total Hamming distance, XOR of all pairs, XOR of all subsets: count 1s per bit column
 *   sorted    sum of |a[i] − a[j]| over pairs, per element (1685), subsequence widths: sort + prefix sums
 *   lastSeen  total appeal, unique characters of all substrings: previous / next occurrence
 *   minSpan   sum of subarray minimums / maximums: monotonic-stack boundaries
 *   window    count subarrays: each right end adds r − l + 1 (product < k, score < k)
 *   edges     tree edges: size · (n − size) pairs cross an edge; fuel = ⌈size / seats⌉ cars
 *
 * Pure and Node-safe: scripts/viz-check.mjs checks every answer against brute force.
 */
import { list, parseInt1, parseInts, plural, rng } from './util.js';

const sum = (a) => a.reduce((s, v) => s + v, 0);

// ---------------------------------------------------------------- span: (i + 1) · (n − i)

export const SPAN = {
  sum: { label: 'Sum of all subarray sums', input: { mode: 'sum', nums: [3, 1, 2, 4] } },
  odd: { label: 'Only odd-length subarrays', input: { mode: 'odd', nums: [1, 4, 2, 5, 3] } },
};

export const spanCode = (mode) => (mode === 'odd'
  ? [
    ['loop', 'for (int i = 0; i < n; i++) {'],
    ['count', '    int all = (i + 1) * (n - i);          // subarrays that contain i'],
    ['odd', '    int odd = (all + 1) / 2;               // about half have odd length'],
    ['add', '    total += nums[i] * odd;'],
    ['end', '}'],
  ]
  : [
    ['loop', 'for (int i = 0; i < n; i++) {'],
    ['count', '    long left = i + 1, right = n - i;      // choices of start, choices of end'],
    ['add', '    total += nums[i] * left * right;'],
    ['end', '}'],
  ]);

/** Every (start, end) pair that contains i, and how many of them count in this mode. */
const spanCount = (mode, n, i) => {
  let c = 0;
  for (let l = 0; l <= i; l++) for (let r = i; r < n; r++) if (mode !== 'odd' || (r - l) % 2 === 0) c++;
  return c;
};

export function spanAnswer({ mode, nums }) {
  let t = 0;
  for (let l = 0; l < nums.length; l++) for (let r = l; r < nums.length; r++) if (mode !== 'odd' || (r - l) % 2 === 0) t += sum(nums.slice(l, r + 1));
  return t;
}

export function span(input) {
  const { mode, nums: a } = input;
  const n = a.length;
  const steps = [];
  const contribs = [];
  let total = 0;
  const all = n * (n + 1) / 2;
  const kept = mode === 'odd' ? Array.from({ length: n }, (_, l) => Math.ceil((n - l) / 2)).reduce((s, v) => s + v, 0) : all;
  steps.push({
    kind: 'start', mode, i: null, total, contribs: [], lines: [],
    title: mode === 'odd' ? `Add up every odd-length subarray of ${list(a)}` : `Add up every subarray of ${list(a)}`,
    text: mode === 'odd'
      ? `There are ${all} subarrays, ${kept} of them with odd length. Listing them all and adding is O(n³) (or O(n²) with prefix sums). Turn it around: how many of those odd-length subarrays contain a[i]? Each of them adds a[i] once, so a[i] adds a[i] × that count.`
      : `The grid below has one cell per subarray: row = where it starts, column = where it ends (${all} cells). Adding them one by one is O(n²) at best. Turn it around: every subarray that contains a[i] adds a[i] once. So a[i] adds a[i] × (number of subarrays containing i), and that number is easy to count.`,
    calc: [`${all} subarrays${mode === 'odd' ? `, ${kept} of odd length` : ''}`],
  });
  for (let i = 0; i < n; i++) {
    const L = i + 1, R = n - i;
    const cnt = spanCount(mode, n, i);
    const c = a[i] * cnt;
    total += c;
    contribs.push(c);
    steps.push({
      kind: 'count', mode, i, L, R, cnt, total, contribs: [...contribs], lines: mode === 'odd' ? ['loop', 'count', 'odd', 'add'] : ['loop', 'count', 'add'],
      title: `a[${i}] = ${a[i]} is in ${cnt} ${mode === 'odd' ? 'odd-length ' : ''}subarrays → adds ${a[i]} × ${cnt} = ${c}`,
      text: mode === 'odd'
        ? `A subarray containing index ${i} starts at one of ${L} places (0…${i}) and ends at one of ${R} places (${i}…${n - 1}): ${L} × ${R} = ${L * R} subarrays, the shaded rectangle. Its length is odd exactly when start and end have the same parity, which is ${cnt} of them (the (${L * R} + 1) / 2 rule). The red dashed cells are even-length, so they don't count.`
        : `A subarray containing index ${i} can start at any of ${L} places (0…${i}) and end at any of ${R} places (${i}…${n - 1}). Every start pairs with every end, so that's ${L} × ${R} = ${cnt} subarrays: exactly the shaded ${L} × ${R} rectangle in the grid. Each one includes ${a[i]} once.`,
      calc: [`(${i} + 1) × (${n} − ${i}) = ${L} × ${R} = ${L * R}${mode === 'odd' ? ` → odd: (${L * R} + 1) / 2 = ${cnt}` : ''}`, `${a[i]} × ${cnt} = ${c}`, `total = ${total}`],
    });
  }
  const brute = spanAnswer(input);
  steps.push({
    kind: 'done', mode, i: null, total, contribs: [...contribs], lines: ['end'], answer: `${total}`,
    title: `Total = ${total}, in one pass`,
    text: `${n} multiplications instead of ${mode === 'odd' ? kept : all} subarray sums: O(n) time, O(1) space. The check: adding every ${mode === 'odd' ? 'odd-length ' : ''}subarray one by one also gives ${brute}.`,
    calc: [`${contribs.join(' + ')} = ${total}`],
  });
  return steps;
}

export function parseSpan(values, input) {
  const r = parseInts(values.nums, { min: -20, max: 50, minLen: 1, maxLen: 8, name: 'nums' });
  return r.error ? r : { input: { mode: input.mode, nums: r.arr } };
}

export function randomSpan(input, rand = Math.random) {
  const g = rng(rand);
  return { mode: input.mode, nums: Array.from({ length: g.int(2, 7) }, () => g.int(1, 9)) };
}

// ---------------------------------------------------------------- bits: count 1s per column

export const BIT_CONTRIB = {
  hamming: { label: 'Total Hamming distance', input: { mode: 'hamming', nums: [4, 14, 2] } },
  pairxor: { label: 'Sum of XOR of all pairs', input: { mode: 'pairxor', nums: [5, 9, 6, 3] } },
  subsetxor: { label: 'Sum of XOR of all subsets', input: { mode: 'subsetxor', nums: [5, 1, 6] } },
};

export const bitContribCode = (mode) => [
  ['loop', 'for (int b = 0; b < 32; b++) {'],
  ['count', '    int ones = 0;  for (int x : nums) ones += (x >> b) & 1;'],
  ...(mode === 'hamming' ? [['add', '    total += ones * (n - ones);              // each (1, 0) pair differs here']]
    : mode === 'pairxor' ? [['add', '    total += ((long) ones * (n - ones)) << b; // each (1, 0) pair is worth 2^b']]
      : [['add', '    if (ones > 0) total += (1L << b) << (n - 1); // half of all 2^n subsets']]),
  ['end', '}'],
];

export const bitWidthOf = (nums) => Math.max(3, Math.max(1, ...nums).toString(2).length);

export function bitContribAnswer({ mode, nums: a }) {
  const n = a.length;
  let t = 0;
  if (mode === 'subsetxor') {
    for (let m = 0; m < 1 << n; m++) { let x = 0; for (let k = 0; k < n; k++) if (m >> k & 1) x ^= a[k]; t += x; }
    return t;
  }
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    const x = a[i] ^ a[j];
    t += mode === 'hamming' ? x.toString(2).split('').filter((c) => c === '1').length : x;
  }
  return t;
}

export function bitContrib(input) {
  const { mode, nums: a } = input;
  const n = a.length;
  const w = bitWidthOf(a);
  const pairs = n * (n - 1) / 2;
  const steps = [];
  const parts = [];
  let total = 0;
  const what = { hamming: 'the number of bit positions where two numbers differ, added over every pair', pairxor: 'a ^ b added over every pair', subsetxor: 'the XOR of every subset, added up' }[mode];
  steps.push({
    kind: 'start', mode, w, b: null, total, parts: [], lines: [],
    title: mode === 'subsetxor' ? `${2 ** n} subsets of ${list(a)}` : `${pairs} pairs from ${list(a)}`,
    text: `We want ${what}. Bits don't interact: bit b of a ^ b depends only on bit b of a and b. So work one column at a time. In a column, only the count of 1s matters, not which numbers have them.`,
    calc: [mode === 'subsetxor' ? `2^${n} = ${2 ** n} subsets` : `${n}·${n - 1}/2 = ${pairs} pairs`],
  });
  for (let b = 0; b < w; b++) {
    const ones = a.filter((v) => (v >> b) & 1).length;
    const zeros = n - ones;
    let c, text, calc;
    if (mode === 'hamming') {
      c = ones * zeros;
      text = `Column ${b} (worth ${2 ** b}) has ${plural(ones, 'one')} and ${plural(zeros, 'zero')}. A pair differs in this column exactly when one number has a 1 and the other a 0: ${ones} × ${zeros} = ${c} pairs, each adding 1 to the distance.${c === 0 ? ' Every number agrees here, so nothing is added.' : ''}`;
      calc = [`ones × zeros = ${ones} × ${zeros} = ${c}`];
    } else if (mode === 'pairxor') {
      c = ones * zeros * 2 ** b;
      text = `Column ${b} has ${plural(ones, 'one')} and ${plural(zeros, 'zero')}. a ^ b has this bit set exactly for the ${ones} × ${zeros} = ${ones * zeros} pairs that mix a 1 and a 0, and the bit is worth ${2 ** b}. So this column adds ${ones * zeros} × ${2 ** b} = ${c}.`;
      calc = [`${ones} × ${zeros} × 2^${b} = ${c}`];
    } else {
      c = ones > 0 ? 2 ** (n - 1) * 2 ** b : 0;
      text = ones > 0
        ? `Column ${b} has ${ones} number${ones === 1 ? '' : 's'} with a 1. A subset's XOR has this bit when it picks an odd number of them. Fix one of those numbers: every choice of the others can be completed with it in or out to make the count odd, so exactly half the subsets, 2^${n - 1} = ${2 ** (n - 1)}, have the bit. Worth ${2 ** b} each: ${c}.`
        : `No number has bit ${b}, so no subset's XOR has it. Nothing added.`;
      calc = [ones > 0 ? `2^${n - 1} × 2^${b} = ${2 ** (n - 1)} × ${2 ** b} = ${c}` : 'ones = 0 → 0'];
    }
    total += c;
    parts.push(c);
    steps.push({ kind: c ? 'column' : 'skip', mode, w, b, ones, zeros, c, total, parts: [...parts], lines: ['loop', 'count', 'add'], title: `Bit ${b}: ${plural(ones, 'one')}, ${plural(zeros, 'zero')} → +${c}`, text, calc: [...calc, `total = ${total}`] });
  }
  const brute = bitContribAnswer(input);
  steps.push({
    kind: 'done', mode, w, b: null, total, parts: [...parts], lines: ['end'], answer: `${total}`,
    title: `Total = ${total}`,
    text: `O(32 · n) instead of looking at ${mode === 'subsetxor' ? `${2 ** n} subsets (O(2ⁿ · n))` : `${pairs} pairs (O(n²))`}. The check: doing it the slow way also gives ${brute}.`,
    calc: [`${parts.join(' + ')} = ${total}`],
  });
  return steps;
}

export function parseBitContrib(values, input) {
  const r = parseInts(values.nums, { min: 0, max: 63, minLen: 2, maxLen: input.mode === 'subsetxor' ? 6 : 7, name: 'nums' });
  return r.error ? r : { input: { mode: input.mode, nums: r.arr } };
}

export function randomBitContrib(input, rand = Math.random) {
  const g = rng(rand);
  return { mode: input.mode, nums: Array.from({ length: g.int(2, input.mode === 'subsetxor' ? 5 : 6) }, () => g.int(0, 31)) };
}

// ---------------------------------------------------------------- sorted: prefix sums of the left part

export const SORTED = {
  pairs: { label: 'Sum of |a[i] − a[j]| over all pairs', input: { mode: 'pairs', nums: [4, 1, 7, 3] } },
  each: { label: 'Each element: sum of differences (1685)', input: { mode: 'each', nums: [1, 4, 6, 8, 10] } },
  widths: { label: 'Subsequence widths (891)', input: { mode: 'widths', nums: [2, 1, 3] } },
};

export const sortedCode = (mode) => ({
  pairs: [
    ['sort', 'Arrays.sort(a);   long prefix = 0;           // order doesn\'t change |x − y|'],
    ['loop', 'for (int i = 0; i < n; i++) {'],
    ['add', '    total += (long) a[i] * i - prefix;     // a[i] minus each of the i smaller values'],
    ['grow', '    prefix += a[i];'],
    ['end', '}'],
  ],
  each: [
    ['pre', 'int[] p = prefix sums of a;   // a is sorted; p[i] = a[0] + … + a[i − 1]'],
    ['loop', 'for (int i = 0; i < n; i++) {'],
    ['left', '    int left  = a[i] * i - p[i];                        // to everything before i'],
    ['right', '    int right = (p[n] - p[i + 1]) - a[i] * (n - 1 - i);  // to everything after i'],
    ['add', '    res[i] = left + right;'],
    ['end', '}'],
  ],
  widths: [
    ['sort', 'Arrays.sort(a);'],
    ['loop', 'for (int i = 0; i < n; i++)'],
    ['add', '    total += a[i] * (pow2[i] - pow2[n - 1 - i]);   // max of 2^i, min of 2^(n−1−i)'],
    ['end', 'return total;'],
  ],
})[mode];

export function sortedAnswer({ mode, nums }) {
  const a = [...nums];
  const n = a.length;
  if (mode === 'each') return a.map((x) => sum(a.map((y) => Math.abs(x - y))));
  if (mode === 'pairs') { let t = 0; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) t += Math.abs(a[i] - a[j]); return t; }
  let t = 0;
  for (let m = 1; m < 1 << n; m++) { const pick = a.filter((_, k) => m >> k & 1); t += Math.max(...pick) - Math.min(...pick); }
  return t;
}

export function sorted(input) {
  const { mode } = input;
  const a = [...input.nums].sort((x, y) => x - y);
  const n = a.length;
  const steps = [];
  const p = [0];
  for (const v of a) p.push(p.at(-1) + v);
  const wasSorted = input.nums.every((v, k) => v === a[k]);
  const base = { mode, a, p };
  if (mode === 'each') {
    steps.push({
      ...base, kind: 'start', i: null, res: [], lines: ['pre'],
      title: `For each a[i], add up |a[i] − a[j]| over all j`,
      text: `Done directly, that's n sums of n terms: O(n²). But a is sorted, so everything before i is ≤ a[i] and everything after is ≥ a[i]. Then the ${'|·|'} disappears: the left part is a[i] × (how many) − (their sum), and the right part is (their sum) − a[i] × (how many). Prefix sums give each "their sum" in O(1).`,
      calc: [`p = ${list(p)}`],
    });
    const res = [];
    for (let i = 0; i < n; i++) {
      const left = a[i] * i - p[i];
      const right = (p[n] - p[i + 1]) - a[i] * (n - 1 - i);
      res.push(left + right);
      steps.push({
        ...base, kind: 'element', i, left, right, res: [...res], lines: ['loop', 'left', 'right', 'add'],
        title: `res[${i}] = ${left} + ${right} = ${left + right}`,
        text: `Left of ${a[i]}: ${i} value${i === 1 ? '' : 's'} adding up to p[${i}] = ${p[i]}, each at most ${a[i]}, so their distances total ${a[i]} × ${i} − ${p[i]} = ${left}. Right: ${n - 1 - i} value${n - 1 - i === 1 ? '' : 's'} adding up to ${p[n] - p[i + 1]}, each at least ${a[i]}, so ${p[n] - p[i + 1]} − ${a[i]} × ${n - 1 - i} = ${right}.`,
        calc: [`left  = ${a[i]}·${i} − ${p[i]} = ${left}`, `right = ${p[n] - p[i + 1]} − ${a[i]}·${n - 1 - i} = ${right}`],
      });
    }
    steps.push({ ...base, kind: 'done', i: null, res, lines: ['end'], answer: list(res), title: `res = ${list(res)}`, text: `O(n) after the prefix sums, instead of O(n²). The check: adding |a[i] − a[j]| directly gives ${list(sortedAnswer(input))}.`, calc: [`res = ${list(res)}`] });
    return steps;
  }
  let total = 0;
  const parts = [];
  steps.push({
    ...base, kind: 'start', i: null, total, parts: [],
    title: mode === 'pairs' ? `Add |a[i] − a[j]| over all ${n * (n - 1) / 2} pairs of ${list(input.nums)}` : `Add (max − min) over all ${2 ** n - 1} non-empty subsequences of ${list(input.nums)}`,
    text: mode === 'pairs'
      ? 'The order of the array doesn\'t change any |x − y|, so sort it first. Then in every pair the right element is the bigger one: a[i] is "plus" in its pairs with everything to its left and "minus" in its pairs with everything to its right.'
      : 'A subsequence\'s width depends only on which values it picks, not on their order, so sort first. Then a[i] is the maximum of exactly the subsequences that pick it plus any subset of the i smaller values (2^i of them), and the minimum of 2^(n−1−i) of them.',
    calc: [wasSorted ? 'already sorted' : `sorted: ${list(a)}`],
    lines: ['sort'],
  });
  for (let i = 0; i < n; i++) {
    let c, text, calc;
    if (mode === 'pairs') {
      c = a[i] * i - p[i];
      text = i === 0 ? `a[0] = ${a[0]} has nothing to its left: no pair where it is the bigger one yet.` : `${a[i]} is the larger value in its ${i} pair${i === 1 ? '' : 's'} with ${list(a.slice(0, i))}. Together they add ${a[i]} × ${i} − (${a.slice(0, i).join(' + ')}) = ${a[i] * i} − ${p[i]} = ${c}. The running prefix gives that sum without a loop.`;
      calc = [`${a[i]} × ${i} − prefix ${p[i]} = ${c}`];
    } else {
      const up = 2 ** i, down = 2 ** (n - 1 - i);
      c = a[i] * (up - down);
      text = `${a[i]} is the maximum of ${up} subsequence${up === 1 ? '' : 's'} (it plus any subset of the ${i} smaller value${i === 1 ? '' : 's'}) and the minimum of ${down} (any subset of the ${n - 1 - i} larger). Width = max − min, so it adds ${a[i]} × ${up} and takes away ${a[i]} × ${down}.`;
      calc = [`${a[i]} × (2^${i} − 2^${n - 1 - i}) = ${a[i]} × (${up} − ${down}) = ${c}`];
    }
    total += c;
    parts.push(c);
    steps.push({ ...base, kind: 'element', i, c, total, parts: [...parts], lines: mode === 'pairs' ? ['loop', 'add', 'grow'] : ['loop', 'add'], title: `a[${i}] = ${a[i]} → ${c >= 0 ? '+' : ''}${c}`, text, calc: [...calc, `total = ${total}`] });
  }
  steps.push({
    ...base, kind: 'done', i: null, total, parts, lines: ['end'], answer: `${total}`,
    title: `Total = ${total}`,
    text: `O(n log n) for the sort, then O(n). The check: ${mode === 'pairs' ? 'every pair one by one' : 'every subsequence one by one'} also gives ${sortedAnswer(input)}.`,
    calc: [`${parts.join(' + ')} = ${total}`],
  });
  return steps;
}

export function parseSorted(values, input) {
  const r = parseInts(values.nums, { min: input.mode === 'each' ? 1 : 0, max: 40, minLen: 2, maxLen: input.mode === 'widths' ? 6 : 8, name: 'nums' });
  if (r.error) return r;
  if (input.mode === 'each' && r.arr.some((v, k) => k && v < r.arr[k - 1])) return { error: 'For this one nums must be sorted (non-decreasing), like the problem says.' };
  return { input: { mode: input.mode, nums: r.arr } };
}

export function randomSorted(input, rand = Math.random) {
  const g = rng(rand);
  const nums = Array.from({ length: g.int(2, input.mode === 'widths' ? 5 : 7) }, () => g.int(1, 20));
  return { mode: input.mode, nums: input.mode === 'each' ? nums.sort((x, y) => x - y) : nums };
}

// ---------------------------------------------------------------- lastSeen: previous / next occurrence

export const LAST_SEEN = {
  appeal: { label: 'Total appeal (distinct letters)', input: { mode: 'appeal', s: 'abbca' } },
  unique: { label: 'Letters that appear once', input: { mode: 'unique', s: 'abca' } },
};

export const lastSeenCode = (mode) => (mode === 'appeal'
  ? [
    ['init', 'int[] last = new int[26];  Arrays.fill(last, -1);'],
    ['loop', 'for (int i = 0; i < n; i++) {'],
    ['add', '    total += (long) (i - last[c]) * (n - i);   // starts after the previous c, any end'],
    ['save', '    last[c] = i;'],
    ['end', '}'],
  ]
  : [
    ['init', 'prev[i] / next[i] = previous / next index with the same letter (−1 / n if none)'],
    ['loop', 'for (int i = 0; i < n; i++)'],
    ['add', '    total += (i - prev[i]) * (next[i] - i);     // substrings where s[i] is its letter\'s only copy'],
    ['end', 'return total;'],
  ]);

export function lastSeenAnswer({ mode, s }) {
  let t = 0;
  for (let l = 0; l < s.length; l++) for (let r = l; r < s.length; r++) {
    const cnt = {};
    for (const ch of s.slice(l, r + 1)) cnt[ch] = (cnt[ch] ?? 0) + 1;
    t += Object.values(cnt).filter((v) => mode === 'appeal' || v === 1).length;
  }
  return t;
}

export function lastSeen(input) {
  const { mode, s } = input;
  const n = s.length;
  const steps = [];
  const parts = [];
  const last = {};
  let total = 0;
  const prev = [], next = [];
  for (let i = 0; i < n; i++) { prev.push(last[s[i]] ?? -1); last[s[i]] = i; }
  const after = {};
  for (let i = n - 1; i >= 0; i--) { next[i] = after[s[i]] ?? n; after[s[i]] = i; }
  for (const k of Object.keys(last)) delete last[k];
  steps.push({
    kind: 'start', mode, s, i: null, total, parts: [], last: {}, lines: ['init'],
    title: mode === 'appeal' ? `Add up the number of distinct letters in every substring of "${s}"` : `Add up, over every substring of "${s}", the letters that appear exactly once`,
    text: mode === 'appeal'
      ? `There are ${n * (n + 1) / 2} substrings. Turn it around: a letter that appears several times in a substring should only be counted once, so give the credit to its FIRST copy in that substring. s[i] is the first copy of its letter exactly when the substring starts after the previous copy of that letter.`
      : `There are ${n * (n + 1) / 2} substrings. Turn it around: s[i] counts in a substring exactly when no other copy of its letter is inside it, so the substring must start after the previous copy and end before the next copy.`,
    calc: [`${n * (n + 1) / 2} substrings`],
  });
  for (let i = 0; i < n; i++) {
    const p = mode === 'appeal' ? (last[s[i]] ?? -1) : prev[i];
    const q = mode === 'appeal' ? n : next[i];
    const L = i - p, R = q - i;
    const c = L * R;
    total += c;
    parts.push(c);
    steps.push({
      kind: 'char', mode, s, i, p, q, L, R, c, total, parts: [...parts], last: { ...last }, lines: mode === 'appeal' ? ['loop', 'add', 'save'] : ['loop', 'add'],
      title: `s[${i}] = '${s[i]}' counts in ${L} × ${R} = ${c} substrings`,
      text: mode === 'appeal'
        ? `${p < 0 ? `This is the first '${s[i]}' so far, so a substring can start anywhere from 0 to ${i}` : `The previous '${s[i]}' is at ${p}. A substring that starts at ${p} or earlier already has an earlier '${s[i]}' (which gets the credit), so it must start between ${p + 1} and ${i}`}: ${L} choice${L === 1 ? '' : 's'}. It can end anywhere from ${i} to ${n - 1}: ${R} choices.`
        : `${p < 0 ? `No '${s[i]}' before it, so a start from 0 to ${i}` : `Previous '${s[i]}' at ${p}, so the start must be ${p + 1}…${i}`}: ${L} choice${L === 1 ? '' : 's'}. ${q === n ? `No '${s[i]}' after it, so any end from ${i} to ${n - 1}` : `Next '${s[i]}' at ${q}, so the end must be ${i}…${q - 1}`}: ${R} choice${R === 1 ? '' : 's'}.`,
      calc: [`(${i} − ${p}) × (${q} − ${i}) = ${L} × ${R} = ${c}`, `total = ${total}`],
    });
    last[s[i]] = i;
  }
  steps.push({
    kind: 'done', mode, s, i: null, total, parts: [...parts], last: { ...last }, lines: ['end'], answer: `${total}`,
    title: `Total = ${total}`,
    text: `One pass with a 26-entry table: O(n) time, O(1) space. The check: counting letters in all ${n * (n + 1) / 2} substrings gives ${lastSeenAnswer(input)}.`,
    calc: [`${parts.join(' + ')} = ${total}`],
  });
  return steps;
}

export function parseLastSeen(values, input) {
  const s = String(values.s ?? '').trim().toLowerCase();
  if (!/^[a-z]{1,10}$/.test(s)) return { error: 'Type 1 to 10 lowercase letters, for example abbca.' };
  return { input: { mode: input.mode, s } };
}

export function randomLastSeen(input, rand = Math.random) {
  const g = rng(rand);
  return { mode: input.mode, s: Array.from({ length: g.int(3, 8) }, () => g.pick(['a', 'b', 'c', 'd'].slice(0, g.int(2, 4)))).join('') };
}

// ---------------------------------------------------------------- minSpan: monotonic-stack boundaries

export const MIN_SPAN = {
  min: { label: 'Sum of subarray minimums', input: { mode: 'min', nums: [3, 1, 2, 4] } },
  ties: { label: 'With equal values', input: { mode: 'min', nums: [2, 4, 2, 3] } },
  max: { label: 'Sum of subarray maximums', input: { mode: 'max', nums: [1, 3, 2] } },
};

export const minSpanCode = (mode) => {
  const w = mode === 'max' ? 'greater' : 'smaller';
  return [
    ['prev', `prev[i] = previous index with a strictly ${w} value (−1 if none)   // monotonic stack`],
    ['next', `next[i] = next index with a ${w}-or-equal value (n if none)       // monotonic stack`],
    ['loop', 'for (int i = 0; i < n; i++)'],
    ['add', '    total += (long) a[i] * (i - prev[i]) * (next[i] - i);'],
    ['end', 'return total;'],
  ];
};

export function minSpanAnswer({ mode, nums: a }) {
  let t = 0;
  for (let l = 0; l < a.length; l++) for (let r = l; r < a.length; r++) t += (mode === 'max' ? Math.max : Math.min)(...a.slice(l, r + 1));
  return t;
}

export function minSpan(input) {
  const { mode, nums: a } = input;
  const n = a.length;
  const beats = mode === 'max' ? (x, y) => x > y : (x, y) => x < y;     // x "wins" over y
  const prev = [], next = Array(n).fill(n);
  const st = [];
  for (let i = 0; i < n; i++) {
    while (st.length && !beats(a[st.at(-1)], a[i])) next[st.pop()] = i;  // a[i] is ≤ (or ≥) the top: top's span ends here
    prev.push(st.length ? st.at(-1) : -1);
    st.push(i);
  }
  const word = mode === 'max' ? 'maximum' : 'minimum';
  const steps = [];
  const parts = [];
  let total = 0;
  steps.push({
    kind: 'start', mode, i: null, prev, next, total, parts: [], lines: ['prev', 'next'],
    title: `Add the ${word} of every subarray of ${list(a)}`,
    text: `${n * (n + 1) / 2} subarrays. Turn it around: for each a[i], count the subarrays where a[i] is the ${word}. They are the subarrays that stay between the nearest ${mode === 'max' ? 'bigger' : 'smaller'} value on each side, and a monotonic stack finds those boundaries for every i in one pass. With equal values, two copies must not both claim the same subarray: the left boundary stops at a strictly ${mode === 'max' ? 'bigger' : 'smaller'} value, the right one also at an equal value, so the rightmost copy wins.`,
    calc: [`prev = ${list(prev)}`, `next = ${list(next)}`],
  });
  for (let i = 0; i < n; i++) {
    const L = i - prev[i], R = next[i] - i;
    const c = a[i] * L * R;
    total += c;
    parts.push(c);
    const tie = next[i] < n && a[next[i]] === a[i];
    steps.push({
      kind: 'span', mode, i, L, R, c, prev, next, total, parts: [...parts], lines: ['loop', 'add'],
      title: `${a[i]} is the ${word} of ${L} × ${R} = ${L * R} subarray${L * R === 1 ? '' : 's'} → +${c}`,
      text: `${prev[i] < 0 ? `Nothing to the left is ${mode === 'max' ? 'bigger' : 'smaller'}, so the start can be 0…${i}` : `a[${prev[i]}] = ${a[prev[i]]} is ${mode === 'max' ? 'bigger' : 'smaller'}, so the start must be after it: ${prev[i] + 1}…${i}`} (${L}). ${next[i] === n ? `Nothing to the right stops it, so the end can be ${i}…${n - 1}` : `a[${next[i]}] = ${a[next[i]]} ${tie ? `equals it, and the tie goes to that later copy, so the end must be before it` : `is ${mode === 'max' ? 'bigger' : 'smaller'}, so the end must be before it`}: ${i}…${next[i] - 1}`} (${R}).`,
      calc: [`(${i} − ${prev[i]}) × (${next[i]} − ${i}) = ${L} × ${R}`, `${a[i]} × ${L * R} = ${c}`, `total = ${total}`],
    });
  }
  steps.push({
    kind: 'done', mode, i: null, prev, next, total, parts: [...parts], lines: ['end'], answer: `${total}`,
    title: `Total = ${total}`,
    text: `O(n): each index is pushed and popped once. Every subarray was credited to exactly one ${word}, the check: taking the ${word} of each subarray gives ${minSpanAnswer(input)}. Sum of Subarray Ranges is just (sum of maximums) − (sum of minimums).`,
    calc: [`${parts.join(' + ')} = ${total}`],
  });
  return steps;
}

export function parseMinSpan(values, input) {
  const r = parseInts(values.nums, { min: 1, max: 30, minLen: 1, maxLen: 8, name: 'nums' });
  return r.error ? r : { input: { mode: input.mode, nums: r.arr } };
}

export function randomMinSpan(input, rand = Math.random) {
  const g = rng(rand);
  return { mode: input.mode, nums: Array.from({ length: g.int(3, 7) }, () => g.int(1, 6)) };
}

// ---------------------------------------------------------------- window: each right end adds r − l + 1

export const WINDOW = {
  product: { label: 'Subarrays with product < k', input: { mode: 'product', nums: [10, 5, 2, 6], k: 100 } },
  score: { label: 'Subarrays with sum × length < k', input: { mode: 'score', nums: [2, 1, 4, 3, 5], k: 10 } },
};

export const windowCode = (mode) => (mode === 'product'
  ? [
    ['grow', 'for (int r = 0; r < n; r++) {  prod *= a[r];'],
    ['shrink', '    while (prod >= k && l <= r) prod /= a[l++];'],
    ['add', '    count += r - l + 1;          // every subarray ending at r that starts in [l, r]'],
    ['end', '}'],
  ]
  : [
    ['grow', 'for (int r = 0; r < n; r++) {  sum += a[r];'],
    ['shrink', '    while (sum * (r - l + 1) >= k) sum -= a[l++];'],
    ['add', '    count += r - l + 1;          // every subarray ending at r that starts in [l, r]'],
    ['end', '}'],
  ]);

const windowOk = (mode, a, l, r, k) => {
  const part = a.slice(l, r + 1);
  return mode === 'product' ? part.reduce((x, y) => x * y, 1) < k : sum(part) * part.length < k;
};

export function windowAnswer({ mode, nums: a, k }) {
  let t = 0;
  for (let l = 0; l < a.length; l++) for (let r = l; r < a.length; r++) if (windowOk(mode, a, l, r, k)) t++;
  return t;
}

export function windowCount(input) {
  const { mode, nums: a, k } = input;
  const n = a.length;
  const steps = [];
  const parts = [];
  let l = 0, count = 0;
  const what = mode === 'product' ? 'product' : 'sum × length';
  const val = (lo, hi) => (lo > hi ? (mode === 'product' ? 1 : 0) : mode === 'product' ? a.slice(lo, hi + 1).reduce((x, y) => x * y, 1) : sum(a.slice(lo, hi + 1)) * (hi - lo + 1));
  steps.push({
    kind: 'start', mode, l: 0, r: null, count, parts: [], lines: [],
    title: `Count subarrays of ${list(a)} with ${what} < ${k}`,
    text: `All values are positive, so shrinking a subarray only lowers its ${what}: if [l, r] is fine, so is every [l′, r] with l′ ≥ l. That makes the count easy to credit: give each subarray to its RIGHT end. For each r, find the smallest valid l with a sliding window; then the ${'r − l + 1'} subarrays ending at r and starting in [l, r] all count.`,
    calc: [`${n * (n + 1) / 2} subarrays in all`],
  });
  for (let r = 0; r < n; r++) {
    const before = l;
    while (l <= r && !windowOk(mode, a, l, r, k)) l++;
    if (l > before) {
      steps.push({
        kind: 'shrink', mode, l, r, dropped: [before, l - 1], count, parts: [...parts], lines: ['grow', 'shrink'],
        title: `Add a[${r}] = ${a[r]}: too big, move l from ${before} to ${l}`,
        text: `With a[${r}] the window [${before}, ${r}] has ${what} ${val(before, r)} ≥ ${k}. Drop from the left until it fits${l > r ? ': even a[' + r + '] alone is too big, so the window is empty' : ''}. Anything starting before ${l} and ending at ${r} would be at least as big, so none of those count.`,
        calc: [`${what}[${before}..${r}] = ${val(before, r)} ≥ ${k}`, `${what}[${l}..${r}] = ${val(l, r)}${l <= r ? ` < ${k}` : ' (empty)'}`],
      });
    }
    const add = r - l + 1;
    count += add;
    parts.push(add);
    steps.push({
      kind: 'count', mode, l, r, add, count, parts: [...parts], lines: l > before ? ['add'] : ['grow', 'add'],
      title: add ? `r = ${r}: ${plural(add, 'subarray')} end here → count = ${count}` : `r = ${r}: nothing ends here`,
      text: add
        ? `Window [${l}, ${r}] has ${what} ${val(l, r)} < ${k}. The subarrays ending at ${r} that fit are exactly those starting at ${l}…${r} (the brackets under the array): ${r} − ${l} + 1 = ${add}. Each subarray is counted once, at its right end.`
        : `Even a[${r}] alone is too big, so no subarray ending at ${r} counts.`,
      calc: [`r − l + 1 = ${r} − ${l} + 1 = ${add}`, `count = ${count}`],
    });
  }
  steps.push({
    kind: 'done', mode, l, r: null, count, parts: [...parts], lines: ['end'], answer: `${count}`,
    title: `${count} subarrays`,
    text: `Each index enters and leaves the window once: O(n). The check: testing all ${n * (n + 1) / 2} subarrays one by one also finds ${windowAnswer(input)}.`,
    calc: [`${parts.join(' + ')} = ${count}`],
  });
  return steps;
}

export function parseWindow(values, input) {
  const r = parseInts(values.nums, { min: 1, max: 30, minLen: 1, maxLen: 9, name: 'nums' });
  if (r.error) return r;
  const kk = parseInt1(values.k, { min: 1, max: 5000, name: 'k' });
  if (kk.error) return kk;
  return { input: { mode: input.mode, nums: r.arr, k: kk.v } };
}

export function randomWindow(input, rand = Math.random) {
  const g = rng(rand);
  const nums = Array.from({ length: g.int(4, 8) }, () => g.int(1, 9));
  return { mode: input.mode, nums, k: input.mode === 'product' ? g.int(10, 200) : g.int(10, 80) };
}

// ---------------------------------------------------------------- edges: what crosses each tree edge

export const EDGES = {
  pairs: { label: 'Sum of distances over all pairs', input: { mode: 'pairs', n: 6, edges: [[0, 1], [0, 2], [2, 3], [2, 4], [2, 5]] } },
  fuel: { label: 'Fuel to reach the capital (2477)', input: { mode: 'fuel', n: 7, edges: [[0, 1], [0, 4], [0, 5], [1, 3], [3, 2], [5, 6]], seats: 2 } },
};

export const edgesCode = (mode) => [
  ['dfs', 'int size(int v, int parent) {           // nodes in v\'s subtree'],
  ['kids', '    int s = 1;  for (int c : adj[v]) if (c != parent) s += size(c, v);'],
  mode === 'fuel'
    ? ['add', '    if (v != 0) fuel += (s + seats - 1) / seats;   // cars that cross the edge v → parent']
    : ['add', '    if (v != 0) total += (long) s * (n - s);       // pairs whose path uses edge v — parent'],
  ['ret', '    return s;'],
  ['end', '}'],
];

/** Parent array, children and a post-order of a tree rooted at 0. */
export function rootTree(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }
  const parent = Array(n).fill(-1);
  const depth = Array(n).fill(0);
  const order = [];
  const seen = Array(n).fill(false);
  const visit = (v) => {
    seen[v] = true;
    for (const c of adj[v].sort((x, y) => x - y)) if (!seen[c]) { parent[c] = v; depth[c] = depth[v] + 1; visit(c); }
    order.push(v);
  };
  visit(0);
  const kids = Array.from({ length: n }, (_, v) => adj[v].filter((c) => parent[c] === v));
  return { parent, depth, order, kids, connected: seen.every(Boolean) };
}

export function edgesAnswer({ mode, n, edges, seats }) {
  const { parent } = rootTree(n, edges);
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }
  const dist = (s) => { const d = Array(n).fill(-1); d[s] = 0; const qq = [s]; while (qq.length) { const v = qq.shift(); for (const c of adj[v]) if (d[c] < 0) { d[c] = d[v] + 1; qq.push(c); } } return d; };
  if (mode === 'pairs') { let t = 0; for (let i = 0; i < n; i++) { const d = dist(i); for (let j = i + 1; j < n; j++) t += d[j]; } return t; }
  // fuel, simulated: representatives move up level by level, merging into cars at each city
  let t = 0;
  const people = Array(n).fill(1);
  const { order } = rootTree(n, edges);
  for (const v of order) if (v !== 0) { t += Math.ceil(people[v] / seats); people[parent[v]] += people[v]; }
  return t;
}

export function edgesModel(input) {
  const { mode, n, edges, seats } = input;
  const { parent, order, kids, depth } = rootTree(n, edges);
  const size = Array(n).fill(0);
  const steps = [];
  const parts = [];
  let total = 0;
  steps.push({
    kind: 'start', mode, v: null, size: [...size], total, parts: [], lines: ['dfs'],
    title: mode === 'fuel' ? `Everyone drives to city 0, ${seats} seats per car` : `Add the distance between every pair of the ${n} nodes`,
    text: mode === 'fuel'
      ? 'Simulating every trip is messy. Turn it around and look at one road at a time: everyone in the subtree below a road has to cross it, and the cheapest way is to share cars, so that road costs ⌈people / seats⌉ litres. One DFS gives every subtree size.'
      : `There are ${n * (n - 1) / 2} pairs, and a BFS from every node is O(n²). Turn it around: a pair's distance is the number of edges on its path, so add, for each edge, how many paths use it. Cut the edge: the tree splits into the subtree below (size s) and the rest (n − s). Exactly the s × (n − s) pairs with one end on each side cross it.`,
    calc: [mode === 'fuel' ? `${n - 1} roads` : `${n - 1} edges, ${n * (n - 1) / 2} pairs`],
  });
  for (const v of order) {
    size[v] = 1 + kids[v].reduce((s2, c) => s2 + size[c], 0);
    if (v === 0) continue;
    const s = size[v];
    const c = mode === 'fuel' ? Math.ceil(s / seats) : s * (n - s);
    total += c;
    parts.push(c);
    steps.push({
      kind: 'edge', mode, v, p: parent[v], s, c, size: [...size], total, parts: [...parts], lines: ['kids', 'add', 'ret'],
      title: mode === 'fuel' ? `Road ${v} → ${parent[v]}: ${plural(s, 'person', 'people')} → ${c} car${c === 1 ? '' : 's'}` : `Edge ${parent[v]} — ${v}: ${s} × ${n - s} = ${c} paths cross it`,
      text: mode === 'fuel'
        ? `The subtree of ${v} holds ${s} ${s === 1 ? 'person' : 'people'} (shaded), and all of them must use this road to get closer to 0. They can all meet at ${v} first, so ${s} people need ⌈${s} / ${seats}⌉ = ${c} car${c === 1 ? '' : 's'}: ${c} litre${c === 1 ? '' : 's'} for this road.`
        : `Removing this edge leaves ${s} node${s === 1 ? '' : 's'} below (shaded) and ${n - s} above. Every pair with one node on each side has this edge on its path, and no other pair does: ${s} × ${n - s} = ${c}.`,
      calc: [mode === 'fuel' ? `⌈${s} / ${seats}⌉ = ${c}` : `${s} × (${n} − ${s}) = ${c}`, `total = ${total}`],
    });
  }
  steps.push({
    kind: 'done', mode, v: null, size: [...size], total, parts: [...parts], lines: ['end'], answer: `${total}`,
    title: mode === 'fuel' ? `${total} litres` : `Sum of all distances = ${total}`,
    text: mode === 'fuel'
      ? 'One DFS, each road counted once: O(n). No route planning was needed, because every road\'s cost depends only on how many people live below it.'
      : `One DFS: O(n). The check: a BFS from every node also gives ${edgesAnswer(input)}. Sum of Distances in Tree (834) asks for this per node; rerooting moves the answer from a parent to a child in O(1).`,
    calc: [`${parts.join(' + ')} = ${total}`],
  });
  steps.forEach((st) => { st.parent = parent; st.depth = depth; st.kids = kids; });
  return steps;
}

export function parseEdges(values, input) {
  const pairs = String(values.edges ?? '').match(/\d+\s*[-–]\s*\d+/g) ?? [];
  const edges = pairs.map((t) => t.split(/[-–]/).map((x) => Number(x.trim())));
  const n = edges.length + 1;
  if (n < 2 || n > 10) return { error: 'Give 1 to 9 edges like 0-1, 0-2, 2-3 (nodes numbered from 0).' };
  if (edges.some(([u, v]) => u >= n || v >= n || u === v)) return { error: `With ${edges.length} edges the nodes are 0 to ${n - 1}, and an edge joins two different nodes.` };
  if (!rootTree(n, edges).connected) return { error: 'Those edges don\'t form one tree: every node must be reachable from 0.' };
  if (input.mode === 'fuel') {
    const s = parseInt1(values.seats, { min: 1, max: 9, name: 'seats' });
    if (s.error) return s;
    return { input: { mode: 'fuel', n, edges, seats: s.v } };
  }
  return { input: { mode: 'pairs', n, edges } };
}

export function randomEdges(input, rand = Math.random) {
  const g = rng(rand);
  const n = g.int(3, 9);
  const edges = Array.from({ length: n - 1 }, (_, k) => [g.int(0, k), k + 1]);
  return input.mode === 'fuel' ? { mode: 'fuel', n, edges, seats: g.int(1, 4) } : { mode: 'pairs', n, edges };
}

export const edgesText = (edges) => edges.map(([u, v]) => `${u}-${v}`).join(', ');
