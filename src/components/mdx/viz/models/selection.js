/**
 * Sorting-as-a-tool step-throughs (models for <QuickselectViz> and <BucketViz>). Pure, so
 * scripts/viz-check.mjs can test them against brute force.
 */
import { list, parseInt1, parseInts, plural, rng } from './util.js';

// ---------------------------------------------------------------- quickselect with Lomuto partition

export const QUICKSELECT = {
  basic: { label: 'k-th largest', input: { nums: [7, 2, 9, 4, 3, 8, 5, 1], k: 3 } },
  dups: { label: 'With repeats', input: { nums: [3, 2, 3, 1, 2, 4, 5, 5, 6], k: 4 } },
};

export const quickselectCode = [
  ['target', 'int target = a.length - k, lo = 0, hi = a.length - 1;'],
  ['loop', 'while (true) {'],
  ['call', '    int p = partition(a, lo, hi, lo + rnd.nextInt(hi - lo + 1));'],
  ['hit', '    if (p == target) return a[p];'],
  ['side', '    if (p < target) lo = p + 1; else hi = p - 1;   // keep ONE side'],
  ['close', '}'],
  ['blank', ''],
  ['pfn', 'static int partition(int[] a, int lo, int hi, int pivotIndex) {'],
  ['park', '    int pivot = a[pivotIndex]; swap(a, pivotIndex, hi);   // park it at the end'],
  ['store', '    int store = lo;'],
  ['scan', '    for (int i = lo; i < hi; i++)'],
  ['small', '        if (a[i] < pivot) swap(a, i, store++);       // into the < zone'],
  ['place', '    swap(a, store, hi);                              // pivot to its final place'],
  ['pret', '    return store;'],
  ['pend', '}'],
];

/** A fixed "random" pivot so a run repeats: deterministic from the values and the range. */
function pivotFor(a, lo, hi, salt) {
  let h = 2166136261 ^ salt;
  for (let k = lo; k <= hi; k++) h = Math.imul(h ^ (a[k] + 1000), 16777619);
  return lo + ((h >>> 0) % (hi - lo + 1));
}

export function quickselect({ nums, k }) {
  const n = nums.length;
  const cells = nums.map((v, id) => ({ v, id }));
  const target = n - k;
  const steps = [];
  const final = new Set();                       // indexes whose value is in its sorted place
  let lo = 0, hi = n - 1, partitions = 0, comparisons = 0;
  const snap = (s) => steps.push({ cells: cells.map((c) => ({ ...c })), lo, hi, target, final: [...final], partitions, comparisons, ...s });
  const sorted = [...nums].sort((x, y) => x - y);
  snap({
    kind: 'start', lines: ['target'],
    title: `The ${k}${['st', 'nd', 'rd'][k - 1] ?? 'th'} largest sits at index n − k = ${target} once sorted`,
    text: `No full sort needed: only the value that would land at index ${target}. Partition around a pivot; the pivot ends at its final sorted position p. If p is ${target}, done. Otherwise keep only the side that contains ${target} and throw the other side away, unsorted.`,
    calc: [`n = ${n}, k = ${k}`, `target = n − k = ${target}`],
  });
  while (true) {
    partitions++;
    const pi = pivotFor(cells.map((c) => c.v), lo, hi, partitions);
    const pivot = cells[pi].v;
    if (pi !== hi) {
      const up = cells[pi].id, down = cells[hi].id;
      [cells[pi], cells[hi]] = [cells[hi], cells[pi]];
      snap({
        kind: 'park', i: null, store: lo, pivotAt: hi, from: pi, swap: { up, down }, lines: ['call', 'park'],
        title: `Pivot ${pivot} (picked at random): park it at the end`,
        text: `Partition a[${lo}..${hi}]. The pivot ${pivot} was picked at random from this range (fixed here so the run repeats); a random pivot makes the O(n²) worst case vanishingly unlikely. It moves to the end, a[${hi}], out of the way of the scan.`,
        calc: [`pivot = a[${pi}] = ${pivot}`, `swap(a, ${pi}, ${hi})`, `store = ${lo}`],
      });
    } else {
      snap({
        kind: 'park', i: null, store: lo, pivotAt: hi, from: hi, lines: ['call', 'park'],
        title: `Pivot ${pivot} (picked at random) is already at the end`,
        text: `Partition a[${lo}..${hi}] around ${pivot}, picked at random from this range (fixed here so the run repeats). It already sits at a[${hi}], where it waits during the scan.`,
        calc: [`pivot = a[${hi}] = ${pivot}`, `store = ${lo}`],
      });
    }
    let store = lo;
    for (let i = lo; i < hi; i++) {
      comparisons++;
      const v = cells[i].v;
      if (v < pivot) {
        if (i === store) {
          store++;
          snap({
            kind: 'grow', i, store, pivotAt: hi, lines: ['scan', 'small'],
            title: `${v} < ${pivot}: already at the edge of the < zone`,
            text: `a[${i}] = ${v} is smaller than the pivot and it sits exactly at store, so swapping it with itself changes nothing. The < zone grows to a[${lo}..${store - 1}].`,
            calc: [`${v} < ${pivot} → swap(a, ${i}, ${i})`, `store = ${store}`],
          });
        } else {
          const up = cells[i].id, down = cells[store].id;
          const other = cells[store].v;
          [cells[i], cells[store]] = [cells[store], cells[i]];
          store++;
          snap({
            kind: 'swap', i, store, pivotAt: hi, from: i, to: store - 1, swap: { up, down }, lines: ['scan', 'small'],
            title: `${v} < ${pivot}: swap it into the < zone at ${store - 1}`,
            text: `a[${i}] = ${v} is smaller than the pivot. Swap it with a[store] = ${other} (a value ≥ ${pivot} that was waiting there): ${v} joins the < zone and ${other} moves right, still on the ≥ side. store moves to ${store}.`,
            calc: [`${v} < ${pivot}`, `swap(a, ${i}, ${store - 1})`, `store = ${store}`],
          });
        }
      } else {
        snap({
          kind: 'skip', i, store, pivotAt: hi, lines: ['scan'],
          title: `${v} ≥ ${pivot}: leave it`,
          text: `a[${i}] = ${v} is not smaller than the pivot, so it stays on the ≥ side. Only i moves.`,
          calc: [`${v} ≥ ${pivot} → no swap`],
        });
      }
    }
    const p = store;
    if (p !== hi) {
      const up = cells[hi].id, down = cells[p].id;
      [cells[p], cells[hi]] = [cells[hi], cells[p]];
      final.add(p);
      snap({
        kind: 'place', i: null, store: p, p, pivotAt: p, from: hi, to: p, swap: { up, down }, lines: ['place', 'pret'],
        title: `Pivot ${pivot} goes to index ${p}: its final sorted position`,
        text: `Swap the pivot from the end into a[${p}]. Everything left of it is smaller and everything right of it is at least ${pivot}, so a[${p}] = ${pivot} is exactly where it would be in a sorted array, without sorting anything.`,
        calc: [`swap(a, ${p}, ${hi})`, `p = ${p}`],
      });
    } else {
      final.add(p);
      snap({
        kind: 'place', i: null, store: p, p, pivotAt: p, lines: ['place', 'pret'],
        title: `Nothing was ≥ ${pivot}: it stays at ${p}, its final position`,
        text: `Every value in the range was smaller than ${pivot}, so the pivot is the largest here and already in its final sorted place, a[${p}].`,
        calc: [`p = ${p}`],
      });
    }
    if (p === target) {
      snap({
        kind: 'done', i: null, store: p, p, lines: ['hit'], answer: `${k}${['st', 'nd', 'rd'][k - 1] ?? 'th'} largest = ${cells[p].v}`,
        title: `p == ${target}: the answer is ${cells[p].v}`,
        text: `The pivot landed on the target index. Answer ${cells[p].v} (sorted, the array would be ${list(sorted)}). ${plural(partitions, 'partition')} and ${comparisons} comparisons; on average n + n/2 + n/4 + … ≈ 2n, so O(n). The other cells were never sorted.`,
        calc: [`p = ${p} == target`, `return a[${p}] = ${cells[p].v}`],
      });
      return steps;
    }
    const keepRight = p < target;
    snap({
      kind: 'side', i: null, store: p, p, keep: keepRight ? [p + 1, hi] : [lo, p - 1], drop: keepRight ? [lo, p] : [p, hi], lines: ['hit', 'side'],
      title: `p = ${p} ${keepRight ? '<' : '>'} ${target}: keep only the ${keepRight ? 'right' : 'left'} side`,
      text: `The target index ${target} is ${keepRight ? 'right' : 'left'} of the pivot, so the answer is in a[${keepRight ? p + 1 : lo}..${keepRight ? hi : p - 1}]. The other side is thrown away without ever being sorted: that is what makes quickselect O(n) on average instead of O(n log n).`,
      calc: [`p = ${p}, target = ${target}`, keepRight ? `lo = p + 1 = ${p + 1}` : `hi = p − 1 = ${p - 1}`],
    });
    if (keepRight) lo = p + 1; else hi = p - 1;
    if (lo === hi) {
      final.add(lo);
      snap({
        kind: 'done', i: null, store: lo, p: lo, lines: ['hit'], answer: `${k}${['st', 'nd', 'rd'][k - 1] ?? 'th'} largest = ${cells[lo].v}`,
        title: `One value left at index ${target}: the answer is ${cells[lo].v}`,
        text: `Only a[${lo}] remains, so it is in its final place: answer ${cells[lo].v} (sorted, the array would be ${list(sorted)}). ${plural(partitions, 'partition')}, ${comparisons} comparisons.`,
        calc: [`lo == hi == ${lo}`, `return a[${lo}] = ${cells[lo].v}`],
      });
      return steps;
    }
  }
}

export function parseQuickselect(values) {
  const a = parseInts(values.nums, { min: -99, max: 99, minLen: 1, maxLen: 10, name: 'nums' });
  if (a.error) return a;
  const k = parseInt1(values.k, { min: 1, max: a.arr.length, name: 'k' });
  return k.error ? { error: `k must be between 1 and ${a.arr.length}.` } : { input: { nums: a.arr, k: k.v } };
}

export function randomQuickselect(rand = Math.random) {
  const g = rng(rand);
  const nums = Array.from({ length: g.int(6, 10) }, () => g.int(0, 20));
  return { nums, k: g.int(1, nums.length) };
}

// ---------------------------------------------------------------- counting sort and frequency buckets

export const BUCKETS = {
  counting: { label: 'Counting sort', input: { mode: 'counting', nums: [4, 1, 3, 4, 0, 2, 1, 4] } },
  topk: { label: 'Top k frequent', input: { mode: 'topk', nums: [1, 1, 1, 2, 2, 3, 4, 4, 5], k: 2 } },
};

export const bucketCode = {
  counting: [
    ['init', 'int[] count = new int[maxValue + 1];'],
    ['count', 'for (int x : a) count[x]++;                 // 1. count'],
    ['out', 'int i = 0;'],
    ['loop', 'for (int v = 0; v <= maxValue; v++)'],
    ['write', '    while (count[v]-- > 0) out[i++] = v;     // 2. write v, count[v] times'],
  ],
  topk: [
    ['freq', 'for (int x : nums) freq.merge(x, 1, Integer::sum);       // 1. count'],
    ['bucket', 'freq.forEach((value, f) -> bucket.get(f).add(value));  // 2. bucket by count'],
    ['loop', 'for (int f = nums.length; f >= 1 && i < k; f--)          // 3. most frequent first'],
    ['take', '    for (int value : bucket.get(f)) if (i < k) out[i++] = value;'],
  ],
};

export function buckets(input) {
  const a = input.nums;
  const steps = [];
  if (input.mode === 'counting') {
    const max = Math.max(...a);
    const count = new Array(max + 1).fill(0);
    const out = [];
    const snap = (s) => steps.push({ count: [...count], out: [...out], ...s });
    snap({
      kind: 'start', i: null, v: null, lines: ['init'],
      title: `Values are 0 … ${max}: count them instead of comparing`,
      text: `Comparison sorts can't beat O(n log n), but these values are small whole numbers, so each one can be used as an index. Make a count array with a slot for every value 0 … ${max}.`,
      calc: [`maxValue = ${max}`, `count = ${list(count)}`],
    });
    a.forEach((x, i) => {
      count[x]++;
      snap({
        kind: 'count', i, v: x, lines: ['count'],
        title: `a[${i}] = ${x}: count[${x}] becomes ${count[x]}`,
        text: `The value itself is the index: one step, no comparison. After this pass count[v] says how many times v appears.`,
        calc: [`count[${x}]++ → ${count[x]}`],
      });
    });
    for (let v = 0; v <= max; v++) {
      if (!count[v]) {
        snap({ kind: 'empty', i: null, v, lines: ['loop', 'write'], title: `count[${v}] = 0: no ${v}s`, text: `Nothing to write for ${v}; move to the next value.`, calc: [`count[${v}] = 0`] });
        continue;
      }
      const c = count[v];
      for (let t = 0; t < c; t++) out.push(v);
      snap({
        kind: 'write', i: null, v, written: c, lines: ['loop', 'write'],
        title: `Write ${plural(c, `copy of ${v}`, `copies of ${v}`)}`,
        text: `count[${v}] = ${c}, so the next ${c === 1 ? 'slot gets' : `${c} slots get`} ${v}. Values come out in increasing order because v walks 0, 1, 2, … .`,
        calc: [`out += ${list(new Array(c).fill(v))}`],
      });
    }
    snap({
      kind: 'done', i: null, v: null, lines: ['write'], answer: list(out),
      title: 'Sorted without a single comparison',
      text: `${a.length} values counted and ${max + 1} slots read: O(n + k) for values 0 … k. Worth it only when k is small; values up to 10⁹ would need a billion slots.`,
      calc: [`out = ${list(out)}`],
    });
    return steps;
  }
  const k = input.k;
  const freq = new Map();
  const snap = (s) => steps.push({ freq: [...freq.entries()].map(([value, f]) => ({ value, f })), ...s });
  snap({
    kind: 'start', i: null, lines: ['freq'],
    title: `Top ${k} most frequent: count, then bucket by count`,
    text: `A value can appear at most n = ${a.length} times, so frequencies are small numbers too. Count each value, then drop it into bucket[f], where f is its count. Reading the buckets from the highest f down gives the most frequent values first, with no sorting.`,
    calc: [`n = ${a.length}, k = ${k}`],
  });
  a.forEach((x, i) => {
    freq.set(x, (freq.get(x) ?? 0) + 1);
    snap({ kind: 'count', i, v: x, lines: ['freq'], title: `${x}: seen ${plural(freq.get(x), 'time')}`, text: `Count with a hash map (the values could be anything).`, calc: [`freq[${x}] = ${freq.get(x)}`] });
  });
  const bucket = Array.from({ length: a.length + 1 }, () => []);
  for (const [value, f] of freq) {
    bucket[f].push(value);
    snap({ kind: 'bucket', i: null, v: value, f, bucket: bucket.map((b) => [...b]), lines: ['bucket'], title: `${value} appears ${plural(f, 'time')}: into bucket[${f}]`, text: `bucket[f] collects the values that appear exactly f times. The bucket's index is the count itself, like counting sort one level up.`, calc: [`bucket[${f}] = ${list(bucket[f])}`] });
  }
  const out = [];
  for (let f = a.length; f >= 1 && out.length < k; f--) {
    if (!bucket[f].length) continue;
    const take = bucket[f].slice(0, k - out.length);
    out.push(...take);
    snap({
      kind: 'take', i: null, f, took: take, out: [...out], bucket: bucket.map((b) => [...b]), lines: ['loop', 'take'],
      title: `bucket[${f}] = ${list(bucket[f])}: take ${list(take)}`,
      text: `This is the highest non-empty bucket left, so these are the most frequent values remaining (${plural(f, 'time')} each). ${out.length < k ? `${k - out.length} more to go.` : `That makes ${k}: stop.`}`,
      calc: [`out = ${list(out)}`],
    });
  }
  const last = steps.at(-1);
  snap({
    kind: 'done', i: null, out: [...out], bucket: last.bucket, lines: ['take'], answer: `top ${k} = ${list(out)}`,
    title: `Done: ${list(out)}`,
    text: `Counting is O(n), filling ${a.length + 1} buckets is O(n), and reading them is O(n): O(n) in total. A heap of size k gives O(n log k), and sorting by frequency O(n log n). Mentioning both bucket and heap is a strong answer.`,
    calc: [`return ${list(out)}`],
  });
  return steps;
}

export function parseBuckets(values, input) {
  if (input.mode === 'counting') {
    const a = parseInts(values.nums, { min: 0, max: 9, minLen: 1, maxLen: 12, name: 'nums' });
    return a.error ? a : { input: { mode: 'counting', nums: a.arr } };
  }
  const a = parseInts(values.nums, { min: -99, max: 99, minLen: 1, maxLen: 12, name: 'nums' });
  if (a.error) return a;
  const distinct = new Set(a.arr).size;
  const k = parseInt1(values.k, { min: 1, max: distinct, name: 'k' });
  return k.error ? { error: `k must be between 1 and ${distinct} (the number of distinct values).` } : { input: { mode: 'topk', nums: a.arr, k: k.v } };
}

export function randomBuckets(input, rand = Math.random) {
  const g = rng(rand);
  if (input.mode === 'counting') return { mode: 'counting', nums: Array.from({ length: g.int(6, 12) }, () => g.int(0, 6)) };
  const nums = Array.from({ length: g.int(6, 12) }, () => g.int(1, 6));
  return { mode: 'topk', nums, k: g.int(1, Math.min(3, new Set(nums).size)) };
}
