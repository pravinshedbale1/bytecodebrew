/**
 * Heap step-throughs (models for <TopKViz>, <KWayMergeViz> and <MedianViz>). Pure, so
 * scripts/viz-check.mjs can test them.
 */
import { list, parseInt1, parseInts, plural, rng } from './util.js';

const parent = (i) => (i - 1) >> 1;
export const ordinal = (k) => `${k}${k % 100 >= 11 && k % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][k % 10] ?? 'th'}`;
const copy = (h) => h.map((x) => ({ ...x }));

/** A min-heap invariant check, for tests: every parent ≤ its children (by value, then by tie key). */
export function isMinHeap(h, key = (x) => [x.v]) {
  const less = (a, b) => { const x = key(a), y = key(b); for (let k = 0; k < x.length; k++) if (x[k] !== y[k]) return x[k] < y[k]; return false; };
  return h.every((x, i) => i === 0 || !less(x, h[parent(i)]));
}

// ---------------------------------------------------------------- top-k with a size-k min-heap

export const TOPK = {
  two: { label: 'k = 2', input: { a: [3, 2, 1, 5, 6, 4], k: 2 } },
  three: { label: 'k = 3', input: { a: [7, 10, 4, 3, 20, 15], k: 3 } },
};

export const topKCode = [
  ['offer', 'heap.offer(x);                 // add at the bottom, then bubble up'],
  ['up', '  while (x < parent) swap up;   // smaller values rise to the top'],
  ['evict', 'if (heap.size() > k) heap.poll();   // remove the smallest: it is not in the top k'],
  ['down', '  move the last leaf to the top; while (bigger than a child) swap with the smaller child'],
  ['answer', 'return heap.peek();            // smallest of the k largest = k-th largest'],
];

export function topK({ a, k }) {
  const heap = [];
  const status = a.map(() => 'todo');        // todo | cur | kept | evicted
  const steps = [];
  const snap = (x) => steps.push({ a, k, heap: copy(heap), status: [...status], ...x });
  const vals = () => list(heap.map((x) => x.v));
  snap({
    kind: 'start', cur: null, lines: [],
    title: `The ${k} largest, with a min-heap of size ${k}`,
    text: `Keep the ${k} biggest values seen so far in a min-heap: a tree where every parent is smaller than its children, so the smallest is always at the top. That top is the weakest of your top ${k}, the "doorkeeper": whenever the heap grows past ${k}, it's the one to throw out.`,
    calc: [`a = ${list(a)}`, `k = ${k}`],
  });
  a.forEach((v, id) => {
    status[id] = 'cur';
    heap.push({ id, v });
    let i = heap.length - 1;
    const p0 = i > 0 ? heap[parent(i)] : null;
    snap({
      kind: 'offer', cur: id, focus: [id], lines: ['offer'],
      title: `offer(${v}): it joins at the bottom`,
      text: `${v} takes the next free spot at the bottom of the tree (the end of the array, index ${i}).${p0 ? ` Its parent is ${p0.v}. ${v < p0.v ? `${v} is smaller, so it has to bubble up.` : `${p0.v} ≤ ${v}, so the heap is already in order.`}` : ' It is the only value, so it is the top.'}`,
      calc: [`heap: ${vals()}`, p0 ? `${v} ${v < p0.v ? '<' : '≥'} parent ${p0.v}` : 'root'],
    });
    while (i > 0 && heap[i].v < heap[parent(i)].v) {
      const p = parent(i);
      const up = heap[i], down = heap[p];
      [heap[i], heap[p]] = [heap[p], heap[i]];
      i = p;
      const next = i > 0 ? heap[parent(i)] : null;
      snap({
        kind: 'up', cur: id, swap: [up.id, down.id], lines: ['up'],
        title: `${up.v} < ${down.v}: swap up`,
        text: `${up.v} is smaller than its parent ${down.v}, so they swap. ${next ? (up.v < next.v ? `Its new parent, ${next.v}, is bigger too: keep going.` : `Its new parent, ${next.v}, is smaller: stop.`) : `${up.v} reached the top: it is now the smallest in the heap.`}`,
        calc: [`swap ${up.v} ↔ ${down.v}`, `heap: ${vals()}`],
      });
    }
    status[id] = 'kept';
    if (heap.length > k) {
      const out = heap[0];
      const last = heap.pop();
      status[out.id] = 'evicted';
      if (heap.length) heap[0] = last;
      snap({
        kind: 'evict', cur: id, evicted: out.id, moved: heap.length ? last.id : null, lines: ['evict'],
        title: `${k + 1} values: evict the smallest, ${out.v}`,
        text: `The heap holds ${k + 1} values, one too many. The top, ${out.v}, is the smallest of them, so it can't be one of the ${k} largest: poll it. To fill the hole, the last leaf (${last.v}) jumps to the top.`,
        calc: [`poll ${out.v}`, `heap: ${vals()}`],
      });
      i = 0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1;
        let c = l;
        if (r < heap.length && heap[r].v < heap[l].v) c = r;
        if (l >= heap.length || heap[c].v >= heap[i].v) break;
        const down = heap[i], up = heap[c];
        [heap[i], heap[c]] = [heap[c], heap[i]];
        i = c;
        snap({
          kind: 'down', cur: id, swap: [up.id, down.id], lines: ['down'],
          title: `${down.v} > ${up.v}: swap down`,
          text: `${down.v} is bigger than its smaller child, ${up.v}, so they swap: ${up.v} rises to keep the smallest on top. ${2 * i + 1 < heap.length ? 'Check the next children down.' : `${down.v} reached the bottom.`}`,
          calc: [`swap ${down.v} ↔ ${up.v}`, `heap: ${vals()}`],
        });
      }
    }
  });
  const kth = heap[0].v;
  snap({
    kind: 'done', cur: null, lines: ['answer'], answer: `${ordinal(k)} largest = ${kth}`,
    title: `The top is the ${ordinal(k)} largest: ${kth}`,
    text: `The heap holds the ${k} largest values, ${list([...heap].map((x) => x.v).sort((x, y) => y - x))}, and its top is the smallest of them: the ${ordinal(k)} largest overall. Each offer or poll costs O(log k), so the whole run is O(n log k) with only k values in memory.`,
    calc: [`peek() = ${kth}`],
  });
  return steps;
}

export function parseTopK(values) {
  const r = parseInts(values.a, { min: -99, max: 99, minLen: 2, maxLen: 9, name: 'a' });
  if (r.error) return r;
  const k = parseInt1(values.k, { min: 1, max: Math.min(4, r.arr.length), name: 'k' });
  return k.error ? k : { input: { a: r.arr, k: k.v } };
}

export function randomTopK(rand = Math.random) {
  const g = rng(rand);
  const a = g.shuffle(Array.from({ length: 30 }, (_, k) => k + 1)).slice(0, g.int(5, 8));
  return { a, k: g.int(2, 3) };
}

// ---------------------------------------------------------------- k-way merge

export const KWAY = {
  three: { label: '3 lists', input: { lists: [[1, 4, 5], [1, 3, 4], [2, 6]] } },
  uneven: { label: 'Uneven lists', input: { lists: [[2, 8], [3, 5, 9, 12], [1, 10]] } },
};

export const kwayCode = [
  ['init', 'for each list: heap.offer(its first value);          // one candidate per list'],
  ['poll', 'top = heap.poll();  out.add(top.value);              // the smallest head overall'],
  ['refill', 'if (top\'s list has a next value) heap.offer(it);     // that list sends its next'],
];

export const LIST_NAMES = 'abcdef';

const before = (x, y) => x.v < y.v || (x.v === y.v && x.list < y.list);

function offer(heap, item) {
  heap.push(item);
  let i = heap.length - 1;
  while (i > 0 && before(heap[i], heap[parent(i)])) { [heap[i], heap[parent(i)]] = [heap[parent(i)], heap[i]]; i = parent(i); }
}

function poll(heap) {
  const top = heap[0];
  const last = heap.pop();
  if (heap.length) {
    heap[0] = last;
    let i = 0;
    for (;;) {
      const l = 2 * i + 1, r = l + 1;
      let c = l;
      if (r < heap.length && before(heap[r], heap[l])) c = r;
      if (l >= heap.length || !before(heap[c], heap[i])) break;
      [heap[i], heap[c]] = [heap[c], heap[i]];
      i = c;
    }
  }
  return top;
}

export function kway({ lists }) {
  const heap = [];
  const next = lists.map(() => 0);          // index of the next value to offer from each list
  const out = [];
  const steps = [];
  const name = (l) => LIST_NAMES[l];
  const snap = (x) => steps.push({ lists, heap: copy(heap), next: [...next], out: out.map((o) => ({ ...o })), ...x });
  snap({
    kind: 'start', lines: [],
    title: `Merge ${lists.length} sorted lists`,
    text: 'The next value of the merged output is always one of the lists\' current heads: the smallest of them. So keep exactly one candidate per list in a min-heap. Take the top, then let the list it came from send its next value.',
    calc: lists.map((l, k) => `${name(k)}: ${list(l)}`),
  });
  lists.forEach((l, k) => { if (l.length) { offer(heap, { id: `${k}-0`, v: l[0], list: k, idx: 0 }); next[k] = 1; } });
  snap({
    kind: 'init', lines: ['init'], fresh: heap.map((x) => x.id),
    title: 'Each list sends its first value',
    text: `The heads ${heap.map((x) => `${x.v} (${name(x.list)})`).join(', ')} go into the heap. Its top, ${heap[0].v}, is the smallest value anywhere in the lists, so it will be first in the output.`,
    calc: [`heap: ${list(heap.map((x) => x.v))}`],
  });
  while (heap.length) {
    const top = poll(heap);
    out.push({ id: top.id, v: top.v, list: top.list });
    const l = top.list;
    let refill = null;
    if (next[l] < lists[l].length) {
      refill = { id: `${l}-${next[l]}`, v: lists[l][next[l]], list: l, idx: next[l] };
      offer(heap, refill);
      next[l]++;
    }
    snap({
      kind: 'take', lines: ['poll', 'refill'], taken: top.id, fresh: refill ? [refill.id] : [],
      title: `Take ${top.v} (list ${name(l)})${refill ? `, ${name(l)} sends ${refill.v}` : `; list ${name(l)} is used up`}`,
      text: `${top.v} is the smallest candidate, so it is next in the output.${refill ? ` It came from list ${name(l)}, so ${name(l)}'s next value, ${refill.v}, becomes its candidate in the heap.` : ` List ${name(l)} has nothing left, so the heap shrinks to ${plural(heap.length, 'candidate')}.`} The heap reorders itself so the smallest is on top again: ${heap.length ? heap[0].v : 'empty'}.`,
      calc: [`out += ${top.v}`, `heap: ${list(heap.map((x) => x.v))}`],
    });
  }
  snap({
    kind: 'done', lines: [], answer: list(out.map((o) => o.v)),
    title: `Merged: ${list(out.map((o) => o.v))}`,
    text: `The heap never held more than ${lists.length} values (one per list), so each step costs O(log k): O(N log k) for N values in total. Merging the lists two at a time would redo work; sorting everything would cost O(N log N).`,
    calc: [`${out.length} values, k = ${lists.length}`],
  });
  return steps;
}

export function parseKway(values) {
  const rows = String(values.lists ?? '').split(/[;|]/).map((r) => r.trim()).filter(Boolean);
  if (rows.length < 2 || rows.length > 4) return { error: 'Type 2 to 4 lists separated by ; for example 1, 4, 5; 1, 3, 4; 2, 6' };
  const lists = [];
  for (const r of rows) {
    const p = parseInts(r, { min: -99, max: 99, minLen: 1, maxLen: 5, name: 'each list' });
    if (p.error) return p;
    lists.push([...p.arr].sort((x, y) => x - y));
  }
  if (lists.flat().length > 12) return { error: 'Keep it to 12 values in total so the steps stay short.' };
  return { input: { lists } };
}

export function randomKway(rand = Math.random) {
  const g = rng(rand);
  const n = g.int(2, 3);
  return { lists: Array.from({ length: n }, () => Array.from({ length: g.int(2, 4) }, () => g.int(1, 20)).sort((x, y) => x - y)) };
}

// ---------------------------------------------------------------- running median with two heaps

export const MEDIAN = {
  stream: { label: '5, 15, 1, 3, 8, 7, 9, 10', input: { a: [5, 15, 1, 3, 8, 7, 9, 10] } },
  sorted: { label: 'Already sorted', input: { a: [1, 2, 3, 4, 5, 6] } },
};

export const medianCode = [
  ['low', 'low.offer(x);                                // 1. into the smaller half (a max-heap)'],
  ['up', 'high.offer(low.poll());                      // 2. its largest moves up: every low ≤ every high'],
  ['back', 'if (high.size() > low.size()) low.offer(high.poll());   // 3. low keeps the extra one'],
  ['median', 'median = odd ? low.peek() : (low.peek() + high.peek()) / 2'],
];

const medianOf = (low, high) => (low.length > high.length ? low.at(-1).v : (low.at(-1).v + high[0].v) / 2);

export function median({ a }) {
  const low = [];    // ascending; its top (the max) is the last element
  const high = [];   // ascending; its top (the min) is the first element
  const meds = [];
  const steps = [];
  const sortIn = (arr, x) => { arr.push(x); arr.sort((p, q) => p.v - q.v || p.id - q.id); };
  const snap = (x) => steps.push({ a, low: copy(low), high: copy(high), meds: [...meds], ...x });
  const show = (arr) => list(arr.map((x) => x.v));
  snap({
    kind: 'start', cur: null, lines: [],
    title: 'The median of a stream, at every step',
    text: 'Split the numbers into two halves. The smaller half is a max-heap, so its largest value sits on top, next to the middle. The larger half is a min-heap, so its smallest sits on top. With the sizes balanced, the median is right there at the tops: no sorting needed.',
    calc: [`stream: ${list(a)}`],
  });
  a.forEach((v, id) => {
    const x = { id, v };
    sortIn(low, x);
    snap({
      kind: 'low', cur: id, moved: id, lines: ['low'],
      title: `${v} arrives: into the smaller half`,
      text: `Every new number starts in the smaller half. It might not belong there, but the next step fixes that.`,
      calc: [`low: ${show(low)}`, `high: ${show(high)}`],
    });
    const up = low.pop();
    sortIn(high, up);
    const needBack = high.length > low.length;
    snap({
      kind: 'up', cur: id, moved: up.id, lines: ['up'],
      title: `The largest of the smaller half, ${up.v}, moves up`,
      text: `The top of the smaller half (its largest, ${up.v}) moves to the larger half. Now every value on the left is ≤ every value on the right.${needBack ? '' : ` Sizes ${low.length} and ${high.length}: balanced.`}`,
      calc: [`low: ${show(low)}`, `high: ${show(high)}`, ...(needBack ? [] : [`median = ${medianOf(low, high)}`])],
      ...(needBack ? {} : { median: medianOf(low, high) }),
    });
    if (needBack) {
      const back = high.shift();
      sortIn(low, back);
      snap({
        kind: 'back', cur: id, moved: back.id, lines: ['back'],
        title: `Rebalance: ${back.v} comes back down`,
        text: `The larger half had more values (${high.length + 1} against ${low.length - 1}). Its smallest, ${back.v}, moves back, so the smaller half holds the extra one when the count is odd.`,
        calc: [`low: ${show(low)}`, `high: ${show(high)}`, `median = ${medianOf(low, high)}`],
        median: medianOf(low, high),
      });
    }
    meds.push(medianOf(low, high));
    steps.at(-1).meds = [...meds];
    steps.at(-1).lines = [...steps.at(-1).lines, 'median'];
    steps.at(-1).text += ` Median of ${list(a.slice(0, id + 1).sort((p, q) => p - q))}: ${meds.at(-1)}${low.length > high.length ? ' (the top of the smaller half)' : ' (the average of the two tops)'}.`;
  });
  snap({
    kind: 'done', cur: null, lines: ['median'], answer: `medians ${list(meds)}`,
    title: `Medians after each number: ${list(meds)}`,
    text: 'Each number caused at most three heap operations, each O(log n), and reading the median is O(1). Sorting after every arrival would cost O(n log n) each time.',
    calc: [`medians ${list(meds)}`],
  });
  return steps;
}

export function parseMedian(values) {
  const r = parseInts(values.a, { min: -99, max: 99, minLen: 1, maxLen: 9, name: 'stream' });
  return r.error ? r : { input: { a: r.arr } };
}

export function randomMedian(rand = Math.random) {
  const g = rng(rand);
  return { a: Array.from({ length: g.int(5, 8) }, () => g.int(1, 30)) };
}
