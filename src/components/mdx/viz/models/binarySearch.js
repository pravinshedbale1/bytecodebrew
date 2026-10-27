/**
 * Binary search step-throughs (models for <FirstTrueViz> and <RotatedSearchViz>). Pure, so
 * scripts/viz-check.mjs can test them against brute force.
 */
import { parseInt1, parseInts, plural, rng } from './util.js';

// ---------------------------------------------------------------- the one template: first true

export const FIRST_TRUE = {
  lower: { label: 'First a[i] ≥ x', input: { mode: 'lower', nums: [1, 3, 3, 5, 8, 8, 8, 10, 13, 17], x: 8 } },
  insert: { label: 'x is missing', input: { mode: 'lower', nums: [1, 3, 3, 5, 8, 8, 8, 10, 13, 17], x: 6 } },
  upper: { label: 'Last x', input: { mode: 'upper', nums: [1, 3, 3, 5, 8, 8, 8, 10, 13, 17], x: 8 } },
  sqrt: { label: 'Square root', input: { mode: 'sqrt', x: 40 } },
  rotmin: { label: 'Rotated minimum', input: { mode: 'rotmin', nums: [4, 5, 6, 7, 0, 1, 2] } },
  peak: { label: 'Peak element', input: { mode: 'peak', nums: [1, 2, 1, 3, 5, 6, 4] } },
};

export const SQRT_RANGE = 12;                     // r in [0, 12): 12² = 144 > any x we allow (≤ 120)

/** The cells searched, what each shows, the condition and how it reads. */
export function searchSpace(input) {
  const { mode } = input;
  if (mode === 'sqrt') {
    const vals = Array.from({ length: SQRT_RANGE }, (_, r) => r);
    return { vals, hi: SQRT_RANGE, ok: (r) => r * r > input.x, cond: 'r * r > x', show: (r) => `${r}² = ${r * r} ${r * r > input.x ? '>' : '≤'} ${input.x}` };
  }
  const a = input.nums;
  if (mode === 'lower') return { vals: a, hi: a.length, ok: (i) => a[i] >= input.x, cond: 'a[i] >= x', show: (i) => `a[${i}] = ${a[i]} ${a[i] >= input.x ? '≥' : '<'} ${input.x}` };
  if (mode === 'upper') return { vals: a, hi: a.length, ok: (i) => a[i] > input.x, cond: 'a[i] > x', show: (i) => `a[${i}] = ${a[i]} ${a[i] > input.x ? '>' : '≤'} ${input.x}` };
  if (mode === 'rotmin') {
    const last = a[a.length - 1];
    return { vals: a, hi: a.length, ok: (i) => a[i] <= last, cond: 'a[i] <= a[last]', show: (i) => `a[${i}] = ${a[i]} ${a[i] <= last ? '≤' : '>'} a[last] = ${last}` };
  }
  return { vals: a, hi: a.length - 1, ok: (i) => a[i] > a[i + 1], cond: 'a[i] > a[i + 1]', show: (i) => `a[${i}] = ${a[i]} ${a[i] > a[i + 1] ? '>' : '<'} a[${i + 1}] = ${a[i + 1]}` };
}

export function firstTrueCode(input) {
  const use = {
    lower: 'int i = firstTrue(0, n, i -> a[i] >= x);      // lower bound',
    upper: 'int last = firstTrue(0, n, i -> a[i] > x) - 1; // last x',
    sqrt: 'int root = firstTrue(0, 12, r -> r * r > x) - 1;',
    rotmin: 'int min = a[firstTrue(0, n, i -> a[i] <= a[n - 1])];',
    peak: 'int peak = firstTrue(0, n - 1, i -> a[i] > a[i + 1]);',
  }[input.mode];
  return [
    ['fn', 'static int firstTrue(int lo, int hi, IntPredicate ok) {'],
    ['loop', '    while (lo < hi) {'],
    ['mid', '        int mid = lo + (hi - lo) / 2;   // rounds down: mid < hi'],
    ['true', '        if (ok.test(mid)) hi = mid;      // could be the first true: keep it'],
    ['false', '        else lo = mid + 1;               // false: drop mid and everything left'],
    ['close', '    }'],
    ['ret', '    return lo;                           // lo == hi'],
    ['end', '}'],
    ['use', use],
  ];
}

const INTRO = {
  lower: (inp) => `Find the first index where a[i] ≥ ${inp.x}. Because a is sorted, that condition is false, false, …, then true for the rest of the array. Its values are hidden under the cells: binary search only learns them where it looks.`,
  upper: (inp) => `Find the last ${inp.x}. "Last true" is "first true of the opposite condition, minus one": find the first a[i] > ${inp.x}; the last ${inp.x} sits just before it. Same template, no second version.`,
  sqrt: (inp) => `Find ⌊√${inp.x}⌋: the largest r with r² ≤ ${inp.x}, which is (the first r with r² > ${inp.x}) − 1. The cells are not an array: they are the integers 0 … ${SQRT_RANGE - 1}, a range that surely contains the answer (${SQRT_RANGE - 1}² = ${(SQRT_RANGE - 1) ** 2}).`,
  rotmin: (inp) => `[${inp.nums.join(', ')}] is a sorted array rotated. Everything before the rotation point is bigger than the last element, everything from it on is at most the last element: false … false, true … true. The first true is the minimum.`,
  peak: () => 'Find any peak: a value bigger than its neighbours. Test "is the array going down at i" (a[i] > a[i + 1]). It is not monotonic over the whole array, but wherever the template ends, the array goes up before it and down after it: a peak.',
};

export function firstTrue(input) {
  const sp = searchSpace(input);
  const n = sp.vals.length;
  const steps = [];
  let lo = 0, hi = sp.hi, probes = 0;
  const known = {};                               // index → ok(index), only where probed
  const snap = (s) => steps.push({ lo, hi, probes, known: { ...known }, n, searchHi: sp.hi, ...s });
  snap({
    kind: 'start', mid: null, lines: ['fn'],
    title: `Search [${lo}, ${hi}) for the first ${sp.cond}`,
    text: `${INTRO[input.mode](input)} The answer is always inside [lo, hi]; hi = ${sp.hi} (one past the last candidate) stands for "none".`,
    calc: [`condition: ${sp.cond}`, `lo = 0, hi = ${sp.hi}`, `candidates = ${sp.hi}`],
  });
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    const ok = sp.ok(mid);
    known[mid] = ok;
    probes++;
    if (ok) {
      const dropped = hi - mid - 1;
      snap({
        kind: 'true', mid, ok, leaving: [mid + 1, hi - 1], lines: ['loop', 'mid', 'true'],
        title: `${sp.show(mid)}: true, so hi = mid = ${mid}`,
        text: `mid = ${lo} + (${hi} − ${lo}) / 2 = ${mid}. The condition holds at ${mid}, so the first true is ${mid} or somewhere to its left. ${dropped > 0 ? `Everything right of mid (${plural(dropped, 'candidate')}) can go; ` : ''}mid itself must stay, because it might be the answer: hi = ${mid}, not mid − 1.`,
        calc: [`mid = ${lo} + (${hi} − ${lo}) / 2 = ${mid}`, `${sp.show(mid)} → true`, `hi = ${mid} (candidates ${hi - lo} → ${mid - lo})`],
      });
      hi = mid;
    } else {
      snap({
        kind: 'false', mid, ok, leaving: [lo, mid], lines: ['loop', 'mid', 'false'],
        title: `${sp.show(mid)}: false, so lo = mid + 1 = ${mid + 1}`,
        text: `mid = ${lo} + (${hi} − ${lo}) / 2 = ${mid}. The condition fails at ${mid}, and it is false…then true, so it fails everywhere left of mid as well. mid and everything to its left (${plural(mid - lo + 1, 'candidate')}) are out: lo = ${mid + 1}.`,
        calc: [`mid = ${lo} + (${hi} − ${lo}) / 2 = ${mid}`, `${sp.show(mid)} → false`, `lo = ${mid + 1} (candidates ${hi - lo} → ${hi - mid - 1})`],
      });
      lo = mid + 1;
    }
  }
  const at = lo;
  const end = (() => {
    const a = input.nums;
    if (input.mode === 'lower') {
      const found = at < n && a[at] === input.x;
      return {
        answer: found ? `index ${at}` : `not found (insert at ${at})`,
        result: at === sp.hi
          ? `No element is ≥ ${input.x}: firstTrue returns hi = ${sp.hi}, so ${input.x} would go at the end. Check i < n before reading a[i].`
          : found ? `a[${at}] = ${input.x}: the first ${input.x} is at index ${at}.` : `a[${at}] = ${a[at]} is not ${input.x}, so ${input.x} is missing; ${at} is where it would be inserted to keep a sorted.`,
      };
    }
    if (input.mode === 'upper') {
      const last = at - 1;
      const found = last >= 0 && a[last] === input.x;
      return { answer: found ? `last ${input.x} at ${last}` : `${input.x} not present`, result: found ? `The first a[i] > ${input.x} is at ${at}, so the last ${input.x} is at ${at} − 1 = ${last}.` : `The first a[i] > ${input.x} is at ${at}, and a[${last}] ${last >= 0 ? `= ${a[last]}` : 'does not exist'}, so ${input.x} is not in the array.` };
    }
    if (input.mode === 'sqrt') return { answer: `⌊√${input.x}⌋ = ${at - 1}`, result: `The first r with r² > ${input.x} is ${at} (${at}² = ${at * at}), so ⌊√${input.x}⌋ = ${at} − 1 = ${at - 1} (${at - 1}² = ${(at - 1) ** 2} ≤ ${input.x}). In real code the range is [0, 46341) and r * r is computed in long.` };
    if (input.mode === 'rotmin') return { answer: `min = ${a[at]}`, result: `The first index with a[i] ≤ ${a[n - 1]} is ${at}: the rotation point, so the minimum is a[${at}] = ${a[at]}.` };
    const left = at > 0 ? `a[${at}] = ${a[at]} > a[${at - 1}] = ${a[at - 1]} (the probe at ${at - 1} saw the array going up)` : `a[0] = ${a[0]} is the first element`;
    const right = at < sp.hi ? `a[${at}] > a[${at + 1}] = ${a[at + 1]} (the probe at ${at} saw it going down)` : `it is the last element`;
    return { answer: `peak at ${at}`, result: `${left}, and ${right}. So index ${at} is a peak, though not necessarily the highest one.` };
  })();
  snap({
    kind: 'done', mid: null, at, reveal: true, lines: ['ret', 'use'], answer: end.answer,
    title: `lo == hi == ${at}: ${end.answer}`,
    text: `${end.result} It took ${plural(probes, 'probe')}; each probe halves the candidates, so ${sp.hi} candidates never need more than ${Math.ceil(Math.log2(sp.hi + 1))}, where a scan could need all ${sp.hi}. That gap is O(log n) vs O(n): about 17 probes vs 100,000 checks for n = 10⁵. The whole condition row is revealed now${input.mode === 'peak' ? '; it is not a clean false…true here, yet the search still ended on a flip.' : ': false…false, then true…true, as promised.'}`,
    calc: [`return lo = ${at}`, `probes = ${probes}, ⌈log₂(${sp.hi} + 1)⌉ = ${Math.ceil(Math.log2(sp.hi + 1))}`],
  });
  return steps;
}

export function parseFirstTrue(values, input) {
  if (input.mode === 'sqrt') {
    const x = parseInt1(values.x, { min: 0, max: 120, name: 'x' });
    return x.error ? x : { input: { mode: 'sqrt', x: x.v } };
  }
  const a = parseInts(values.nums, { min: -99, max: 99, minLen: input.mode === 'peak' ? 2 : 1, maxLen: 12, name: 'nums' });
  if (a.error) return a;
  let nums = a.arr;
  if (input.mode === 'lower' || input.mode === 'upper') {
    nums = [...nums].sort((x, y) => x - y);
    const x = parseInt1(values.x, { min: -99, max: 99, name: 'x' });
    return x.error ? x : { input: { mode: input.mode, nums, x: x.v } };
  }
  if (input.mode === 'rotmin') {
    if (new Set(nums).size !== nums.length || !isRotation(nums)) return { error: 'Type a sorted array of distinct values, rotated: for example 5, 7, 9, 1, 3.' };
    return { input: { mode: 'rotmin', nums } };
  }
  if (nums.some((v, k) => k > 0 && v === nums[k - 1])) return { error: 'Neighbours must differ (the problem promises it).' };
  return { input: { mode: 'peak', nums } };
}

/** A sorted array of distinct values rotated by any amount: at most one drop, and the end below the start. */
export function isRotation(a) {
  let drops = 0;
  for (let k = 0; k + 1 < a.length; k++) if (a[k] > a[k + 1]) drops++;
  return drops === 0 || (drops === 1 && a[a.length - 1] < a[0]);
}

export function randomFirstTrue(input, rand = Math.random) {
  const g = rng(rand);
  if (input.mode === 'sqrt') return { mode: 'sqrt', x: g.int(0, 120) };
  if (input.mode === 'rotmin' || input.mode === 'peak') {
    const n = g.int(5, 10);
    if (input.mode === 'peak') {
      const nums = [g.int(0, 9)];
      while (nums.length < n) { let v = g.int(0, 9); if (v === nums.at(-1)) v = (v + 1) % 10; nums.push(v); }
      return { mode: 'peak', nums };
    }
    const sorted = [...new Set(Array.from({ length: n + 4 }, () => g.int(0, 40)))].sort((x, y) => x - y).slice(0, n);
    const r = g.int(0, sorted.length - 1);
    return { mode: 'rotmin', nums: [...sorted.slice(r), ...sorted.slice(0, r)] };
  }
  const nums = Array.from({ length: g.int(6, 12) }, () => g.int(0, 20)).sort((x, y) => x - y);
  return { mode: input.mode, nums, x: g.bool(0.7) ? g.pick(nums) : g.int(-2, 22) };
}

// ---------------------------------------------------------------- search in a rotated sorted array

export const ROTATED = {
  found: { label: 'Target present', input: { nums: [4, 5, 6, 7, 0, 1, 2], target: 0 } },
  missing: { label: 'Target missing', input: { nums: [4, 5, 6, 7, 0, 1, 2], target: 3 } },
};

export const rotatedCode = [
  ['init', 'int lo = 0, hi = a.length - 1;'],
  ['loop', 'while (lo <= hi) {'],
  ['mid', '    int mid = lo + (hi - lo) / 2;'],
  ['hit', '    if (a[mid] == target) return mid;'],
  ['leftSorted', '    if (a[lo] <= a[mid]) {                        // left half sorted'],
  ['inLeft', '        if (a[lo] <= target && target < a[mid]) hi = mid - 1;'],
  ['elseLeft', '        else lo = mid + 1;'],
  ['rightSorted', '    } else {                                      // right half sorted'],
  ['inRight', '        if (a[mid] < target && target <= a[hi]) lo = mid + 1;'],
  ['elseRight', '        else hi = mid - 1;'],
  ['close', '    }'],
  ['end', '}'],
  ['none', 'return -1;'],
];

export function rotatedSearch({ nums: a, target }) {
  const steps = [];
  let lo = 0, hi = a.length - 1, probes = 0;
  const snap = (s) => steps.push({ lo, hi, probes, ...s });
  snap({
    kind: 'start', mid: null, lines: ['init'],
    title: `Find ${target} in a rotated sorted array`,
    text: 'The array was sorted and then rotated, so it is two ascending runs. Cut it at any mid and at least one half is fully sorted. For a sorted half you can tell at a glance whether the target can be inside (compare with its two ends), so you always know which half to keep.',
    calc: [`target = ${target}`, `lo = 0, hi = ${a.length - 1}`],
  });
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    probes++;
    if (a[mid] === target) {
      snap({
        kind: 'found', mid, lines: ['loop', 'mid', 'hit'], answer: `index ${mid}`,
        title: `a[${mid}] = ${target}: found`,
        text: `mid = ${mid} and a[mid] is the target. Answer ${mid}, after ${plural(probes, 'probe')}.`,
        calc: [`mid = ${mid}`, `a[${mid}] == ${target} → return ${mid}`],
      });
      return steps;
    }
    const leftSorted = a[lo] <= a[mid];
    const [s0, s1] = leftSorted ? [lo, mid] : [mid, hi];
    const inside = leftSorted ? a[lo] <= target && target < a[mid] : a[mid] < target && target <= a[hi];
    const goLeft = leftSorted ? inside : !inside;
    const range = leftSorted ? `${a[lo]} ≤ ${target} < ${a[mid]}` : `${a[mid]} < ${target} ≤ ${a[hi]}`;
    snap({
      kind: goLeft ? 'left' : 'right', mid, sorted: [s0, s1], inside, leaving: goLeft ? [mid, hi] : [lo, mid],
      lines: ['loop', 'mid', 'hit', ...(leftSorted ? ['leftSorted', inside ? 'inLeft' : 'elseLeft'] : ['rightSorted', inside ? 'inRight' : 'elseRight'])],
      title: `${leftSorted ? 'Left' : 'Right'} half is sorted; ${target} is ${inside ? '' : 'not '}inside it → go ${goLeft ? 'left' : 'right'}`,
      text: `mid = ${mid}, a[mid] = ${a[mid]} ≠ ${target}. ${leftSorted ? `a[lo] = ${a[lo]} ≤ a[mid] = ${a[mid]}, so a[${lo}..${mid}] is sorted` : `a[lo] = ${a[lo]} > a[mid] = ${a[mid]}, so the rotation point is in the left half and a[${mid}..${hi}] is sorted`}: it holds exactly the values from ${a[s0]} to ${a[s1]}. ${inside ? `${target} is in that range, so it can only be in this half.` : `${target} is outside that range, so if it is anywhere, it is in the other half.`} Keep a[${goLeft ? lo : mid + 1}..${goLeft ? mid - 1 : hi}].`,
      calc: [`mid = ${mid}, a[mid] = ${a[mid]}`, leftSorted ? `a[lo] ${a[lo]} ≤ a[mid] ${a[mid]} → left sorted` : `a[lo] ${a[lo]} > a[mid] ${a[mid]} → right sorted`, `${range}? ${inside ? 'yes' : 'no'}`, goLeft ? `hi = mid − 1 = ${mid - 1}` : `lo = mid + 1 = ${mid + 1}`],
    });
    if (goLeft) hi = mid - 1; else lo = mid + 1;
  }
  snap({
    kind: 'none', mid: null, lines: ['none'], answer: 'not found (−1)',
    title: `lo > hi: ${target} is not in the array`,
    text: `The range is empty after ${plural(probes, 'probe')}. Every half that was dropped provably could not contain ${target}, so it isn't there: return −1. O(log n), as long as the values are distinct.`,
    calc: [`lo = ${lo} > hi = ${hi}`, 'return -1'],
  });
  return steps;
}

export function parseRotated(values) {
  const a = parseInts(values.nums, { min: -99, max: 99, minLen: 1, maxLen: 12, name: 'nums' });
  if (a.error) return a;
  if (new Set(a.arr).size !== a.arr.length || !isRotation(a.arr)) return { error: 'Type a sorted array of distinct values, rotated: for example 6, 8, 9, 1, 3, 4.' };
  const t = parseInt1(values.target, { min: -99, max: 99, name: 'target' });
  return t.error ? t : { input: { nums: a.arr, target: t.v } };
}

export function randomRotated(rand = Math.random) {
  const g = rng(rand);
  const sorted = [...new Set(Array.from({ length: 14 }, () => g.int(0, 30)))].sort((x, y) => x - y).slice(0, g.int(5, 10));
  const r = g.int(0, sorted.length - 1);
  const nums = [...sorted.slice(r), ...sorted.slice(0, r)];
  return { nums, target: g.bool(0.7) ? g.pick(nums) : g.int(0, 30) };
}

