/**
 * Interval step-throughs (models for <IntervalsViz> and <MeetingRoomsViz>). Intervals are closed
 * [start, end] for merging and erasing, half-open [start, end) for meetings, as in the lesson.
 * Pure, so scripts/viz-check.mjs can test them against brute force.
 */
import { plural, rng } from './util.js';

const fmt = ([s, e]) => `[${s}, ${e}]`;
const fmtAll = (xs) => xs.map(fmt).join(', ');

export const INTERVALS = {
  merge: { label: 'Merge overlapping', input: { mode: 'merge', list: [[8, 10], [1, 3], [2, 6], [15, 18], [9, 12], [17, 20]] } },
  erase: { label: 'Remove the fewest', input: { mode: 'erase', list: [[1, 4], [2, 3], [3, 6], [5, 8], [1, 10], [7, 9]] } },
};

export const intervalsCode = {
  merge: [
    ['sort', 'Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));  // by start'],
    ['loop', 'for (int[] cur : intervals) {'],
    ['test', '    if (!out.isEmpty() && cur[0] <= last[1])     // overlaps the last one?'],
    ['extend', '        last[1] = Math.max(last[1], cur[1]);     // extend it'],
    ['add', '    else out.add(cur);                            // a gap: start a new one'],
    ['end', '}'],
  ],
  erase: [
    ['sort', 'Arrays.sort(intervals, (a, b) -> Integer.compare(a[1], b[1]));  // by END'],
    ['init', 'int kept = 1, end = intervals[0][1];'],
    ['loop', 'for (int i = 1; i < intervals.length; i++)'],
    ['test', '    if (intervals[i][0] >= end) {                // starts after the last kept one ends'],
    ['keep', '        kept++; end = intervals[i][1]; }'],
    ['ret', 'return intervals.length - kept;                 // the rest are removed'],
  ],
};

function merge(list) {
  const items = list.map(([s, e], id) => ({ id, s, e }));
  const steps = [];
  let order = items.map((x) => x.id);
  const out = [];
  const snap = (x) => steps.push({ order: [...order], merged: out.map((m) => [...m]), ...x });
  snap({
    kind: 'start', cur: null, lines: [],
    title: `${plural(items.length, 'interval')} in no particular order`,
    text: 'Unsorted, an interval could overlap any other, anywhere in the list: checking every pair would be O(n²). Sorting by start fixes that: afterwards an interval can only overlap the one being built just before it.',
    calc: [`intervals = ${fmtAll(list)}`],
  });
  order = [...items].sort((a, b) => a.s - b.s || a.id - b.id).map((x) => x.id);
  snap({
    kind: 'sort', cur: null, lines: ['sort'],
    title: 'Sort by start',
    text: `Now the starts increase down the list. If an interval doesn't overlap the merged interval just above it, it can't overlap anything earlier either, because those all ended even sooner. One pass is enough. Sorting costs O(n log n).`,
    calc: [`sorted = ${fmtAll(order.map((id) => [items[id].s, items[id].e]))}`],
  });
  order.forEach((id, k) => {
    const c = items[id];
    if (!out.length) {
      out.push([c.s, c.e]);
      snap({
        kind: 'add', cur: id, pos: k, lines: ['loop', 'add'],
        title: `${fmt([c.s, c.e])} starts the merged list`,
        text: 'There is nothing to compare the first interval with, so it becomes the first merged interval.',
        calc: [`out = ${fmtAll(out)}`],
      });
      return;
    }
    const last = out[out.length - 1];
    if (c.s <= last[1]) {
      const before = last[1];
      last[1] = Math.max(last[1], c.e);
      const grew = last[1] > before;
      snap({
        kind: grew ? 'extend' : 'inside', cur: id, pos: k, lastEnd: before, lines: ['loop', 'test', 'extend'],
        title: grew ? `${fmt([c.s, c.e])} overlaps: extend to ${last[1]}` : `${fmt([c.s, c.e])} sits inside: nothing changes`,
        text: grew
          ? `It starts at ${c.s}, before the last merged interval ends (${before}), so they overlap. Extend the last one to end at max(${before}, ${c.e}) = ${last[1]}.`
          : `It starts at ${c.s} ≤ ${before}, so it overlaps, but it also ends by ${before}. max(${before}, ${c.e}) = ${before} keeps the end where it is. (Writing last[1] = cur[1] here would wrongly shrink it.)`,
        calc: [`cur[0] = ${c.s} <= last[1] = ${before} → overlap`, `last[1] = max(${before}, ${c.e}) = ${last[1]}`],
      });
    } else {
      out.push([c.s, c.e]);
      snap({
        kind: 'gap', cur: id, pos: k, lastEnd: last[1], lines: ['loop', 'test', 'add'],
        title: `${fmt([c.s, c.e])} starts after ${last[1]}: a new merged interval`,
        text: `It starts at ${c.s}, after the last merged interval ends (${last[1]}): there is a gap. Because the list is sorted, nothing later can bridge that gap either, so ${fmt(last)} is final and a new merged interval begins.`,
        calc: [`cur[0] = ${c.s} > last[1] = ${last[1]} → gap`, `out = ${fmtAll(out)}`],
      });
    }
  });
  snap({
    kind: 'done', cur: null, lines: ['end'], answer: `merged = ${fmtAll(out)}`,
    title: `Done: ${plural(out.length, 'merged interval')}`,
    text: `${fmtAll(out)}. O(n log n) for the sort and O(n) for the pass. Here touching intervals such as [1, 3] and [3, 5] count as overlapping (cur[0] <= last[1]); check what your problem says.`,
    calc: [`out = ${fmtAll(out)}`],
  });
  return steps;
}

function erase(list) {
  const items = list.map(([s, e], id) => ({ id, s, e }));
  const steps = [];
  let order = items.map((x) => x.id);
  const status = {};
  let end = null, kept = 0;
  const snap = (x) => steps.push({ order: [...order], status: { ...status }, end, kept, ...x });
  snap({
    kind: 'start', cur: null, lines: [],
    title: 'Remove as few intervals as possible',
    text: 'Goal: drop the fewest intervals so that the rest don\'t overlap. Equivalently, keep as many as possible. Greedy works if you always keep the interval that finishes first: it leaves the most room for the rest.',
    calc: [`intervals = ${fmtAll(list)}`],
  });
  order = [...items].sort((a, b) => a.e - b.e || a.id - b.id).map((x) => x.id);
  snap({
    kind: 'sort', cur: null, lines: ['sort'],
    title: 'Sort by END, not by start',
    text: `${(() => {
      const first = [...items].sort((a, b) => a.s - b.s || b.e - a.e)[0];
      const longest = Math.max(...items.map((x) => x.e - x.s));
      return first.e - first.s === longest && items.length > 2
        ? `Sorting by start would keep ${fmt([first.s, first.e])} first, the longest interval, and then lose everything inside it.`
        : 'Sorting by start would keep whatever starts first, even a long interval that blocks everything inside it.';
    })()} Sorted by end, the first interval is the one that frees up the timeline soonest.`,
    calc: [`sorted by end = ${fmtAll(order.map((id) => [items[id].s, items[id].e]))}`],
  });
  order.forEach((id, k) => {
    const c = items[id];
    if (end === null) {
      status[id] = 'kept'; kept = 1; end = c.e;
      snap({
        kind: 'keep', cur: id, pos: k, lines: ['init'],
        title: `Keep ${fmt([c.s, c.e])}: it ends first`,
        text: `Nothing ends earlier, so keeping it can't block a better choice. Everything kept after it must start at ${end} or later.`,
        calc: ['kept = 1', `end = ${end}`],
      });
      return;
    }
    if (c.s >= end) {
      const before = end;
      status[id] = 'kept'; kept++; end = c.e;
      snap({
        kind: 'keep', cur: id, pos: k, prevEnd: before, lines: ['loop', 'test', 'keep'],
        title: `Keep ${fmt([c.s, c.e])}: it starts at ${c.s} ≥ ${before}`,
        text: `It starts after the last kept interval ends${c.s === before ? ' (touching at the end point is fine here)' : ''}, so it fits. Of everything that fits, it is the one that ends first. Keep it; the boundary moves to ${end}.`,
        calc: [`start ${c.s} >= end ${before} → keep`, `kept = ${kept}, end = ${end}`],
      });
    } else {
      status[id] = 'removed';
      snap({
        kind: 'remove', cur: id, pos: k, prevEnd: end, lines: ['loop', 'test'],
        title: `Remove ${fmt([c.s, c.e])}: it starts at ${c.s} < ${end}`,
        text: `It starts before the last kept interval ends, so the two overlap and one must go. The kept one ends no later than this one (the list is sorted by end), so keeping it leaves at least as much room: remove ${fmt([c.s, c.e])}.`,
        calc: [`start ${c.s} < end ${end} → overlap, remove`],
      });
    }
  });
  const removed = items.length - kept;
  snap({
    kind: 'done', cur: null, lines: ['ret'], answer: `remove ${removed}`,
    title: `Done: keep ${kept}, remove ${removed}`,
    text: `The kept intervals don't overlap, and no other choice keeps more (the classic activity-selection argument). Return ${items.length} − ${kept} = ${removed}. O(n log n).`,
    calc: [`return ${items.length} − ${kept} = ${removed}`],
  });
  return steps;
}

export function intervals(input) {
  return input.mode === 'merge' ? merge(input.list) : erase(input.list);
}

/** "1-3, 2-6" or "[1,3],[2,6]" → [[1, 3], [2, 6]] (values are never negative here). */
export function parseIntervals(text, { maxLen = 8, lo = 0, hi = 30, strict = false } = {}) {
  const t = String(text ?? '').replace(/[−–]/g, '-');
  if (/(^|[[(,;\s])-\s*\d/.test(t)) return { error: `Keep every start and end between ${lo} and ${hi}.` };
  const pairs = [];
  if (/\d\s*-\s*\d/.test(t)) {
    for (const m of t.matchAll(/(\d+)\s*-\s*(\d+)/g)) pairs.push([Number(m[1]), Number(m[2])]);
  } else {
    const nums = t.match(/\d+/g)?.map(Number) ?? [];
    if (nums.length % 2) return { error: 'Each interval needs a start and an end, for example 1-3, 2-6.' };
    for (let k = 0; k < nums.length; k += 2) pairs.push([nums[k], nums[k + 1]]);
  }
  if ((t.match(/\d+/g) ?? []).length !== pairs.length * 2) return { error: 'Each interval needs a start and an end, for example 1-3, 2-6.' };
  if (!pairs.length) return { error: 'Type intervals as start-end, separated by commas: 1-3, 2-6, 8-10.' };
  if (pairs.length > maxLen) return { error: `Use at most ${maxLen} intervals so the timeline stays readable.` };
  for (const [a, b] of pairs) {
    if (a < lo || b > hi) return { error: `Keep every start and end between ${lo} and ${hi}.` };
    if (strict ? a >= b : a > b) return { error: `${a}-${b}: the start must come ${strict ? 'before' : 'no later than'} the end.` };
  }
  return { list: pairs };
}

export function randomIntervals(input, rand = Math.random) {
  const g = rng(rand);
  const n = g.int(4, 7);
  return { mode: input.mode, list: Array.from({ length: n }, () => { const s = g.int(0, 24); return [s, s + g.int(1, 7)]; }) };
}

// ---------------------------------------------------------------- meeting rooms: a sweep line

export const ROOMS = {
  basic: { label: 'Meeting rooms', input: { list: [[1, 5], [2, 6], [4, 8], [6, 9], [8, 10]] } },
};

export const roomsCode = [
  ['sort', 'Arrays.sort(starts); Arrays.sort(ends);'],
  ['init', 'int rooms = 0, best = 0, e = 0;'],
  ['loop', 'for (int s = 0; s < n; s++) {'],
  ['free', '    while (e < n && ends[e] <= starts[s]) { rooms--; e++; }  // ended: free a room'],
  ['take', '    rooms++;                                                 // this one starts'],
  ['best', '    best = Math.max(best, rooms);'],
  ['end', '}'],
];

export function meetingRooms({ list }) {
  const n = list.length;
  const items = list.map(([s, e], id) => ({ id, s, e }));
  const byStart = [...items].sort((a, b) => a.s - b.s || a.id - b.id);
  const byEnd = [...items].sort((a, b) => a.e - b.e || a.id - b.id);
  const starts = byStart.map((x) => x.s);
  const ends = byEnd.map((x) => x.e);
  const status = {};                                  // id → 'on' | 'done'
  const steps = [];
  let rooms = 0, best = 0, e = 0;
  const snap = (x) => steps.push({ starts, ends, status: { ...status }, rooms, best, e, order: byStart.map((m) => m.id), ...x });
  snap({
    kind: 'start', t: null, s: null, lines: ['sort', 'init'],
    title: 'Sort the starts and the ends separately',
    text: 'The rooms needed is the largest number of meetings running at the same moment. Sweep through time: every start takes a room and every end frees one. Sorting starts and ends separately gives the events in time order; we never need to know which meeting an end belongs to.',
    calc: [`starts = [${starts.join(', ')}]`, `ends   = [${ends.join(', ')}]`],
  });
  for (let s = 0; s < n; s++) {
    const t = starts[s];
    while (e < n && ends[e] <= t) {
      const m = byEnd[e];
      status[m.id] = 'done';
      rooms--; e++;
      snap({
        kind: 'free', t, s, freed: m.id, lines: ['loop', 'free'],
        title: `A meeting ended at ${ends[e - 1]} ≤ ${t}: free its room`,
        text: `Before the meeting at ${t} starts, release every meeting that has already ended. ends[${e - 1}] = ${ends[e - 1]} ≤ ${t}, so one room is free again${ends[e - 1] === t ? ' (ending at the same moment another starts frees the room in time: these are half-open intervals)' : ''}. Rooms in use: ${rooms}.`,
        calc: [`ends[${e - 1}] = ${ends[e - 1]} <= starts[${s}] = ${t}`, `rooms-- → ${rooms}, e = ${e}`],
      });
    }
    status[byStart[s].id] = 'on';
    rooms++;
    const before = best;
    best = Math.max(best, rooms);
    snap({
      kind: 'take', t, s, took: byStart[s].id, lines: ['take', 'best'],
      title: `A meeting starts at ${t}: ${plural(rooms, 'room')} in use${rooms > before ? ', a new peak' : ''}`,
      text: `starts[${s}] = ${t}. ${e < n && ends[e] > t ? `The next end is ${ends[e]}, later than ${t}, so nothing else frees up first. ` : ''}This meeting takes a room: ${rooms} in use at time ${t}. ${rooms > before ? `That is the most so far, so at least ${rooms} rooms are needed.` : `The peak stays ${best}.`}`,
      calc: [`rooms++ → ${rooms}`, `best = max(${before}, ${rooms}) = ${best}`],
    });
  }
  snap({
    kind: 'done', t: null, s: null, lines: ['end'], answer: `rooms = ${best}`,
    title: `Done: ${plural(best, 'room')} needed`,
    text: `The busiest moment had ${plural(best, 'meeting')} at once, so that many rooms are needed and enough. Two sorts and one sweep: O(n log n). A min-heap of end times gives the same answer.`,
    calc: [`best = ${best}`],
  });
  return steps;
}

export function randomRooms(rand = Math.random) {
  const g = rng(rand);
  return { list: Array.from({ length: g.int(4, 7) }, () => { const s = g.int(0, 18); return [s, s + g.int(1, 6)]; }) };
}
