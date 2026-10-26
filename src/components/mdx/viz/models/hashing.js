/**
 * Hash map and hash set step-throughs (models for <TwoSumMapViz> and <ConsecutiveSetViz>). Pure, so
 * scripts/viz-check.mjs can test them against brute force.
 */
import { list, parseInt1, parseInts, plural, rng } from './util.js';

// ---------------------------------------------------------------- Two Sum: check, then store

export const TWO_SUM = {
  basic: { label: 'Two Sum', input: { nums: [3, 8, 11, 2, 6], target: 9 } },
  self: { label: 'Why check before storing', input: { nums: [3, 2, 4], target: 6 } },
};

export const twoSumCode = [
  ['init', 'Map<Integer, Integer> seen = new HashMap<>();'],
  ['loop', 'for (int i = 0; i < nums.length; i++) {'],
  ['need', '    int need = target - nums[i];'],
  ['look', '    Integer j = seen.get(need);   // 1. check'],
  ['found', '    if (j != null) return new int[] { j, i };'],
  ['store', '    seen.put(nums[i], i);         // 2. then store'],
  ['end', '}'],
  ['none', 'return new int[0];                // no pair'],
];

export function twoSum({ nums, target }) {
  const n = nums.length;
  const map = [];                                   // [{ key, idx }] in insertion order
  const steps = [];
  let lookups = 0;
  const snap = (s) => steps.push({ map: map.map((e) => ({ ...e })), lookups, ...s });

  snap({
    kind: 'start', i: null, lines: ['init'],
    title: 'Start with an empty map',
    text: `Find two numbers that add up to ${target}. Walk through nums once. At each number x, ask one question: is its partner, ${target} − x, among the numbers already passed? The map remembers every number passed (value → index), so the question costs one lookup instead of a scan.`,
    calc: [`target = ${target}`, 'seen = { }'],
  });

  for (let i = 0; i < n; i++) {
    const x = nums[i], need = target - x;
    lookups++;
    const hit = map.find((e) => e.key === need);
    if (hit) {
      snap({
        kind: 'found', i, need, probe: { key: need, hit: hit.idx }, pair: [hit.idx, i], lines: ['need', 'look', 'found'],
        answer: `[${hit.idx}, ${i}]`,
        title: `Need ${need}: it's in the map at index ${hit.idx}`,
        text: `x = ${x}, so its partner is ${target} − ${x} = ${need}. The map says ${need} was seen at index ${hit.idx}: nums[${hit.idx}] + nums[${i}] = ${need} + ${x} = ${target}. Answer [${hit.idx}, ${i}], after ${plural(lookups, 'lookup')}. Checking every pair could have taken ${n * (n - 1) / 2}.`,
        calc: [`x = nums[${i}] = ${x}`, `need = ${target} − ${x} = ${need}`, `seen.get(${need}) → ${hit.idx}`, `return [${hit.idx}, ${i}]`],
      });
      return steps;
    }
    const selfNote = need === x
      ? ` Notice need = x here. If ${x} had been stored before this check, it would have found itself and returned [${i}, ${i}], using one element twice.`
      : ` Nothing to the right has been looked at yet: if ${x}'s partner is there, that number will find ${x} in the map when we reach it.`;
    snap({
      kind: 'miss', i, need, probe: { key: need, hit: null }, lines: ['need', 'look'],
      title: `Need ${need}: not in the map yet`,
      text: `x = ${x}, so its partner would be ${target} − ${x} = ${need}. ${map.length ? `The map holds ${list(map.map((e) => e.key))}, and ${need} isn't one of them` : 'The map is empty'}, so no number before index ${i} pairs with ${x}.${selfNote}`,
      calc: [`x = nums[${i}] = ${x}`, `need = ${target} − ${x} = ${need}`, `seen.get(${need}) → null`],
    });
    const old = map.find((e) => e.key === x);
    if (old) old.idx = i; else map.push({ key: x, idx: i });
    snap({
      kind: 'store', i, added: x, replaced: Boolean(old), lines: ['store'],
      title: `Store ${x} → ${i} and move on`,
      text: old
        ? `${x} is already in the map, so put replaces its index with ${i}. Either copy works for a later lookup, because only the value matters to the partner.`
        : `Now any later number that needs ${x} finds it in one lookup. Storing after the check (not before) is what stops ${x} from pairing with itself.`,
      calc: [`seen.put(${x}, ${i})`, `seen = {${map.map((e) => ` ${e.key}→${e.idx}`).join(',')} }`],
    });
  }
  snap({
    kind: 'none', i: null, lines: ['none'], answer: 'no pair',
    title: 'No pair adds up to the target',
    text: `Every number was checked against all the numbers before it, one lookup each (${lookups} in total), and none had its partner. So no two numbers add up to ${target}.`,
    calc: [`lookups = ${lookups}`, 'return []'],
  });
  return steps;
}

export function parseTwoSum(values) {
  const a = parseInts(values.nums, { min: -99, max: 99, minLen: 2, maxLen: 10, name: 'nums' });
  if (a.error) return a;
  const t = parseInt1(values.target, { min: -198, max: 198, name: 'target' });
  if (t.error) return t;
  return { input: { nums: a.arr, target: t.v } };
}

export function randomTwoSum(rand = Math.random) {
  const r = rng(rand);
  const n = r.int(4, 8);
  const nums = Array.from({ length: n }, () => r.int(-5, 20));
  if (r.bool(0.85)) {
    const i = r.int(0, n - 2), j = r.int(i + 1, n - 1);
    return { nums, target: nums[i] + nums[j] };
  }
  return { nums, target: r.int(-10, 40) };
}

// ---------------------------------------------------------------- Longest Consecutive Sequence

export const CONSECUTIVE = {
  basic: { label: 'Longest run', input: { nums: [100, 4, 200, 1, 3, 2] } },
  repeats: { label: 'With repeats', input: { nums: [0, 3, 7, 2, 5, 8, 4, 6, 0, 1] } },
};

export const consecutiveCode = [
  ['build', 'Set<Integer> set = new HashSet<>(); for (int x : nums) set.add(x);'],
  ['loop', 'for (int x : set) {'],
  ['skip', '    if (set.contains(x - 1)) continue;   // not a start'],
  ['start', '    int len = 1;'],
  ['walk', '    while (set.contains(x + len)) len++;'],
  ['best', '    best = Math.max(best, len);'],
  ['end', '}'],
];

export function consecutive({ nums }) {
  const order = [...new Set(nums)];                 // iteration order of the set: first occurrence
  const has = new Set(order);
  const steps = [];
  let best = 0, bestRun = null, lookups = 0;
  const visited = [];
  const snap = (s) => steps.push({ order, best, bestRun, lookups, visited: [...visited], ...s });

  snap({
    kind: 'build', x: null, lines: ['build'],
    title: `Put the values in a set: ${plural(order.length, 'distinct value')}`,
    text: `The set answers "is v present?" in O(1).${order.length < nums.length ? ` Repeated values collapse into one, so ${nums.length} numbers become ${order.length}.` : ''} The values are drawn in sorted order below only so you can see the runs; the algorithm never sorts. It goes through the set in whatever order the set gives (shown under the line).`,
    calc: [`set = {${order.join(', ')}}`, `${nums.length} values → ${order.length} distinct`],
  });

  for (const x of order) {
    lookups++;
    if (has.has(x - 1)) {
      visited.push(x);
      snap({
        kind: 'skip', x, check: x - 1, lines: ['loop', 'skip'],
        title: `${x}: ${x - 1} is in the set, so ${x} is not a start`,
        text: `${x} sits inside a run that begins lower down (${x - 1} is present). Walking from ${x} would repeat work, so skip it. That run is counted exactly once, from its first value.`,
        calc: [`set.contains(${x} − 1 = ${x - 1}) → true`, '→ continue'],
      });
      continue;
    }
    snap({
      kind: 'start', x, check: x - 1, run: [x, x], lines: ['loop', 'skip', 'start'],
      title: `${x}: ${x - 1} is not in the set, so ${x} starts a run`,
      text: `Nothing comes just before ${x}, so a run begins here. Walk upwards: ${x + 1}, ${x + 2}, … for as long as they are in the set.`,
      calc: [`set.contains(${x} − 1 = ${x - 1}) → false`, 'len = 1'],
    });
    let len = 1;
    for (;;) {
      lookups++;
      if (!has.has(x + len)) break;
      len++;
      snap({
        kind: 'walk', x, run: [x, x + len - 1], lines: ['walk'],
        title: `${x + len - 1} is in the set: the run is ${len} long`,
        text: `The run ${x} … ${x + len - 1} keeps going. Each of these values is visited here once, and it will be skipped when the loop reaches it (its predecessor is present).`,
        calc: [`set.contains(${x + len - 1}) → true`, `len = ${len}`],
      });
    }
    const before = best;
    const better = len > best;
    if (better) { best = len; bestRun = [x, x + len - 1]; }
    visited.push(x);
    snap({
      kind: 'end', x, run: [x, x + len - 1], better, lines: ['walk', 'best'],
      title: `${x + len} is missing: run ${len === 1 ? x : `${x} … ${x + len - 1}`} has length ${len}`,
      text: better
        ? `The run stops before ${x + len}. Length ${len} is the best so far.`
        : `The run stops before ${x + len}. Length ${len} doesn't beat the best so far (${best}).`,
      calc: [`set.contains(${x + len}) → false`, `best = max(${before}, ${len}) = ${best}`],
    });
  }
  snap({
    kind: 'done', x: null, lines: ['end'], answer: `longest = ${best}`,
    title: `Done: the longest run has length ${best}`,
    text: `Each value was tested once as a possible start, and walked over at most once inside a run: ${lookups} set lookups for ${order.length} distinct values, so O(n) overall, with no sorting.`,
    calc: [`lookups = ${lookups}`, `best = ${best}`],
  });
  return steps;
}

export function parseConsecutive(values) {
  const a = parseInts(values.nums, { min: -50, max: 250, minLen: 1, maxLen: 12, name: 'nums' });
  return a.error ? a : { input: { nums: a.arr } };
}

export function randomConsecutive(rand = Math.random) {
  const r = rng(rand);
  const n = r.int(6, 11);
  const base = r.int(0, 20);
  return { nums: Array.from({ length: n }, () => base + r.int(0, 14)) };
}
