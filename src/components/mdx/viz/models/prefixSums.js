/**
 * Prefix-sum step-throughs (models for <PrefixQueryViz>, <SubarraySumViz>, <DifferenceArrayViz>).
 * Pure, so scripts/viz-check.mjs can test them against brute force.
 */
import { list, parseInt1, parseInts, plural, rng } from './util.js';

const sumOf = (a, l, r) => a.slice(l, r + 1).reduce((x, y) => x + y, 0);

// ---------------------------------------------------------------- build p, then answer a range query

export const PREFIX_QUERY = {
  basic: { label: 'Range sum', input: { nums: [3, -1, 4, 2, -2, 5], l: 1, r: 4 } },
  fromZero: { label: 'Range starting at 0', input: { nums: [5, 2, -3, 6, 1], l: 0, r: 2 } },
};

export const prefixQueryCode = [
  ['init', 'long[] p = new long[n + 1];          // p[0] = 0: the empty prefix'],
  ['loop', 'for (int i = 0; i < n; i++)'],
  ['build', '    p[i + 1] = p[i] + a[i];'],
  ['query', 'long sum = p[r + 1] - p[l];          // a[l] + … + a[r]'],
];

export function prefixQuery({ nums: a, l, r }) {
  const n = a.length;
  const p = [0];
  const steps = [];
  const snap = (s) => steps.push({ p: [...p], ...s });
  snap({
    kind: 'start', lines: ['init'],
    title: 'p[0] = 0: the sum of nothing',
    text: `p[i] will be the sum of the first i numbers: everything to the left of the boundary i. The prefixes are drawn on the boundaries between cells. p has n + 1 = ${n + 1} entries, and p[0] = 0 is the empty prefix, which removes every special case for ranges that start at index 0.`,
    calc: ['p[0] = 0'],
  });
  for (let i = 0; i < n; i++) {
    p.push(p[i] + a[i]);
    snap({
      kind: 'build', i, lines: ['loop', 'build'],
      title: `p[${i + 1}] = p[${i}] + a[${i}] = ${p[i]} + ${a[i]} = ${p[i + 1]}`,
      text: `Each prefix is the previous one plus one more number, so building all of them is a single O(n) pass. p[${i + 1}] = ${p[i + 1]} is the sum of a[0..${i}] = ${list(a.slice(0, i + 1))}.`,
      calc: [`p[${i + 1}] = p[${i}] + a[${i}]`, `= ${p[i]} + ${a[i]} = ${p[i + 1]}`],
    });
  }
  const big = p[r + 1], small = p[l], ans = big - small;
  snap({
    kind: 'whole', lines: ['query'], range: [0, r], prefixes: [r + 1],
    title: `p[${r + 1}] = ${big} covers a[0..${r}]`,
    text: `Now the question: what is a[${l}] + … + a[${r}]? Start with p[r + 1] = p[${r + 1}] = ${big}, the sum of everything up to and including a[${r}]. It covers the range we want, plus ${l === 0 ? 'nothing extra (the range starts at 0)' : `the extra part a[0..${l - 1}] in front of it`}.`,
    calc: [`p[r + 1] = p[${r + 1}] = ${big}`, `= sum of a[0..${r}]`],
  });
  snap({
    kind: 'extra', lines: ['query'], range: [0, r], extra: l > 0 ? [0, l - 1] : null, prefixes: [r + 1, l],
    title: l === 0 ? `p[0] = 0: nothing to take away` : `p[${l}] = ${small} is the extra part a[0..${l - 1}]`,
    text: l === 0
      ? `The range starts at index 0, so the part in front of it is empty, and p[0] = 0 subtracts nothing. This is exactly why p has the extra 0 at the front.`
      : `p[l] = p[${l}] = ${small} is the sum of a[0..${l - 1}] = ${list(a.slice(0, l))}, exactly the part in front of the range. Subtract it.`,
    calc: [`p[l] = p[${l}] = ${small}`, l === 0 ? '= sum of nothing' : `= sum of a[0..${l - 1}]`],
  });
  snap({
    kind: 'done', lines: ['query'], range: [l, r], prefixes: [r + 1, l], answer: `sum(a[${l}..${r}]) = ${ans}`,
    title: `p[${r + 1}] − p[${l}] = ${big} − ${small} = ${ans}`,
    text: `What is left is a[${l}..${r}] = ${list(a.slice(l, r + 1))}, which adds up to ${ans}. One subtraction, O(1), however long the range is, after an O(n) build that every later query reuses.`,
    calc: [`sum = p[${r + 1}] − p[${l}]`, `= ${big} − ${small} = ${ans}`, `check: ${a.slice(l, r + 1).join(' + ')} = ${sumOf(a, l, r)}`],
  });
  return steps;
}

export function parsePrefixQuery(values) {
  const a = parseInts(values.nums, { min: -50, max: 50, minLen: 1, maxLen: 10, name: 'nums' });
  if (a.error) return a;
  const n = a.arr.length;
  const l = parseInt1(values.l, { min: 0, max: n - 1, name: 'l' });
  if (l.error) return { error: `l must be an index from 0 to ${n - 1}.` };
  const r = parseInt1(values.r, { min: l.v, max: n - 1, name: 'r' });
  if (r.error) return { error: `r must be an index from l (${l.v}) to ${n - 1}.` };
  return { input: { nums: a.arr, l: l.v, r: r.v } };
}

export function randomPrefixQuery(rand = Math.random) {
  const g = rng(rand);
  const n = g.int(5, 9);
  const nums = Array.from({ length: n }, () => g.int(-9, 12));
  const l = g.int(0, n - 1);
  return { nums, l, r: g.int(l, n - 1) };
}

// ---------------------------------------------------------------- count subarrays with sum k

export const SUBARRAY_K = {
  basic: { label: 'Count subarrays', input: { nums: [2, 1, -1, 3, -2, 2], k: 3 } },
  zero: { label: 'k = 0', input: { nums: [1, -1, 2, -2, 0], k: 0 } },
};

export const subarrayKCode = [
  ['init', 'Map<Long, Integer> seen = new HashMap<>();'],
  ['seed', 'seen.put(0L, 1);                     // the empty prefix'],
  ['vars', 'long prefix = 0; int count = 0;'],
  ['loop', 'for (int x : nums) {'],
  ['add', '    prefix += x;'],
  ['look', '    count += seen.getOrDefault(prefix - k, 0);   // 1. check'],
  ['store', '    seen.merge(prefix, 1, Integer::sum);         // 2. then store'],
  ['end', '}'],
];

export function subarrayK({ nums: a, k }) {
  const n = a.length;
  const counts = new Map([[0, 1]]);
  const p = [0];
  const steps = [];
  let count = 0;
  const found = [];                                   // every subarray counted so far: [from, to]
  const snap = (s) => steps.push({ p: [...p], map: [...counts.entries()].map(([key, c]) => ({ key, c })), count, found: found.map((x) => [...x]), ...s });
  snap({
    kind: 'start', i: null, lines: ['init', 'seed', 'vars'],
    title: 'Seed the map with prefix 0, seen once',
    text: `A subarray a[j..i] sums to k exactly when p[i + 1] − p[j] = k, that is, when an earlier prefix equals (current prefix − k). So walk once, keep a count of every prefix seen, and at each step ask how many earlier prefixes equal prefix − k. The empty prefix 0 is seen before the array starts; without it, subarrays starting at index 0 would be missed.`,
    calc: [`k = ${k}`, 'seen = {0: 1}', 'count = 0'],
  });
  for (let i = 0; i < n; i++) {
    const prefix = p[i] + a[i];
    p.push(prefix);
    const need = prefix - k;
    const c = counts.get(need) ?? 0;
    const starts = [];
    for (let j = 0; j <= i; j++) if (p[j] === need) starts.push(j);
    const ends = starts.map((j) => [j, i]);
    count += c;
    found.push(...ends);
    snap({
      kind: c ? 'hit' : 'miss', i, need, c, ends, lines: ['loop', 'add', 'look'],
      title: c ? `prefix ${prefix}: ${plural(c, 'earlier prefix', 'earlier prefixes')} equal ${need} → ${plural(c, 'subarray')}` : `prefix ${prefix}: no earlier prefix equals ${need}`,
      text: c
        ? `After a[${i}] = ${a[i]} the prefix is ${prefix}. Any earlier prefix equal to ${prefix} − ${k} = ${need} marks where a subarray summing to ${k} begins; ${need} was seen ${c} time${c === 1 ? '' : 's'} (at boundary ${starts.join(' and ')}). So ${plural(c, 'subarray')} ending at index ${i} sum${c === 1 ? 's' : ''} to ${k}: ${ends.map(([j, e]) => list(a.slice(j, e + 1))).join(', ')}. count goes up by ${c}.`
        : `After a[${i}] = ${a[i]} the prefix is ${prefix}. A subarray ending here sums to ${k} only if some earlier prefix equals ${prefix} − ${k} = ${need}, and none does, so nothing is counted for index ${i}.`,
      calc: [`prefix = ${p[i]} + ${a[i]} = ${prefix}`, `need = ${prefix} − ${k} = ${need}`, `seen[${need}] = ${c} → count = ${count}`],
    });
    counts.set(prefix, (counts.get(prefix) ?? 0) + 1);
    snap({
      kind: 'store', i, stored: prefix, lines: ['store'],
      title: `Store prefix ${prefix} (seen ${counts.get(prefix)}×)`,
      text: `Record that prefix ${prefix} has now been seen ${plural(counts.get(prefix), 'time')}, so later positions can pair with it. Storing after the check matters when k = 0: the current prefix must not pair with itself, which would count an empty subarray.`,
      calc: [`seen[${prefix}]++ → ${counts.get(prefix)}`],
    });
  }
  snap({
    kind: 'done', i: null, lines: ['end'], answer: `count = ${count}`,
    title: `Done: ${plural(count, 'subarray')} sum to ${k}`,
    text: `One pass and one hash lookup per number: O(n), and negative numbers are fine because nothing relies on the sum growing. Checking every subarray would take O(n²).`,
    calc: [`count = ${count}`],
  });
  return steps;
}

export function parseSubarrayK(values) {
  const a = parseInts(values.nums, { min: -9, max: 9, minLen: 1, maxLen: 10, name: 'nums' });
  if (a.error) return a;
  const k = parseInt1(values.k, { min: -50, max: 50, name: 'k' });
  return k.error ? k : { input: { nums: a.arr, k: k.v } };
}

export function randomSubarrayK(rand = Math.random) {
  const g = rng(rand);
  const nums = Array.from({ length: g.int(5, 9) }, () => g.int(-3, 4));
  return { nums, k: g.int(-1, 5) };
}

// ---------------------------------------------------------------- difference array for range updates

export const DIFFERENCE = {
  basic: { label: 'Range updates', input: { n: 6, updates: [[1, 3, 2], [2, 5, 3], [0, 1, -1]] } },
};

export const differenceCode = [
  ['init', 'int[] diff = new int[n + 1];'],
  ['loop', 'for (int[] u : updates) {           // {l, r, v}'],
  ['start', '    diff[u[0]] += u[2];             // start adding v at l'],
  ['stop', '    diff[u[1] + 1] -= u[2];         // stop after r'],
  ['close', '}'],
  ['sweep', 'for (int i = 0, running = 0; i < n; i++) {'],
  ['run', '    running += diff[i];'],
  ['out', '    out[i] = running;'],
  ['end', '}'],
];

export function difference({ n, updates }) {
  const diff = new Array(n + 1).fill(0);
  const out = new Array(n).fill(null);
  const steps = [];
  let running = 0;
  const snap = (s) => steps.push({ diff: [...diff], out: [...out], running, ...s });
  snap({
    kind: 'start', u: null, i: null, lines: ['init'],
    title: `${plural(updates.length, 'update')} on ${n} cells`,
    text: `Each update adds v to every cell from l to r. Doing that directly costs up to n per update. Instead, mark only the two edges of each range in diff (n + 1 cells): +v where adding starts, −v just after it stops. One running sum at the end turns the marks into the final values.`,
    calc: [`n = ${n}`, `diff = ${list(diff)}`],
  });
  updates.forEach(([l, r, v], u) => {
    diff[l] += v;
    diff[r + 1] -= v;
    snap({
      kind: 'mark', u, i: null, range: [l, r], lines: ['loop', 'start', 'stop'],
      title: `Add ${v} to cells ${l} … ${r}: two marks`,
      text: `Instead of touching ${plural(r - l + 1, 'cell')}, write +${v} at diff[${l}] (from here on, add ${v}) and −${v} at diff[${r + 1}] (from here on, stop). ${r + 1 === n ? `diff[${n}] is the spare cell after the end, so an update reaching the last cell still has somewhere to stop.` : ''}`.trim().replace(/\+-/g, '−').replace(/−-/g, '+'),
      calc: [`diff[${l}] += ${v} → ${diff[l]}`, `diff[${r + 1}] −= ${v} → ${diff[r + 1]}`],
    });
  });
  for (let i = 0; i < n; i++) {
    running += diff[i];
    out[i] = running;
    const active = updates.map(([l, r, v], u) => ({ l, r, v, u })).filter((x) => x.l <= i && i <= x.r);
    snap({
      kind: 'sweep', u: null, i, active: active.map((x) => x.u), lines: ['sweep', 'run', 'out'],
      title: `out[${i}] = running sum = ${running}`,
      text: `Add diff[${i}] = ${diff[i]} to the running total: ${running - diff[i]} + ${diff[i]} = ${running}. ${active.length ? `That is exactly the total of the updates covering cell ${i}: ${active.map((x) => x.v).join(' + ')} = ${active.reduce((s, x) => s + x.v, 0)}.` : `No update covers cell ${i}, and the marks have cancelled to 0.`}`,
      calc: [`running += diff[${i}] = ${diff[i]}`, `out[${i}] = ${running}`],
    });
  }
  const m = updates.length;
  snap({
    kind: 'done', u: null, i: null, lines: ['end'], answer: `out = ${list(out)}`,
    title: 'Done: every update applied with two marks',
    text: `${m} updates cost ${2 * m} writes plus one pass of ${n}: O(m + n). Applying each update cell by cell would cost O(m · n). Car pooling, flight bookings and "how many meetings at each minute" all use this.`,
    calc: [`out = ${list(out)}`],
  });
  return steps;
}

/** "1 3 2; 2 5 3" → [[1, 3, 2], [2, 5, 3]] */
export function parseDifference(values) {
  const n = parseInt1(values.n, { min: 2, max: 10, name: 'n' });
  if (n.error) return n;
  const groups = String(values.updates ?? '').replace(/[−–]/g, '-').split(/[;\n]/).map((g) => g.trim()).filter(Boolean);
  if (!groups.length) return { error: 'Add at least one update as "l r v", separated by semicolons.' };
  if (groups.length > 4) return { error: 'Use at most 4 updates.' };
  const updates = [];
  for (const g of groups) {
    const parts = g.split(/[\s,]+/).map(Number);
    if (parts.length !== 3 || parts.some((x) => !Number.isInteger(x))) return { error: `"${g}" should be three whole numbers: l r v.` };
    const [l, r, v] = parts;
    if (l < 0 || r >= n.v || l > r) return { error: `"${g}": need 0 ≤ l ≤ r ≤ ${n.v - 1}.` };
    if (v < -9 || v > 9 || v === 0) return { error: `"${g}": keep v between −9 and 9 (not 0).` };
    updates.push([l, r, v]);
  }
  return { input: { n: n.v, updates } };
}

export function randomDifference(rand = Math.random) {
  const g = rng(rand);
  const n = g.int(5, 9);
  const updates = Array.from({ length: g.int(2, 4) }, () => {
    const l = g.int(0, n - 1);
    let v = g.int(-5, 6);
    if (v === 0) v = 1;
    return [l, g.int(l, n - 1), v];
  });
  return { n, updates };
}
