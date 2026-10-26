/**
 * Two-pointer step-throughs (models for <PairSumViz>, <ContainerViz>, <ReadWriteViz>, <DutchFlagViz>).
 * Pure, so scripts/viz-check.mjs can test them against brute force.
 */
import { parseInt1, parseInts, plural, rng } from './util.js';

// ---------------------------------------------------------------- opposite ends: pair sum on sorted input

export const PAIR_SUM = {
  basic: { label: 'Pair found', input: { nums: [1, 3, 4, 6, 8, 11, 15], target: 14 } },
  none: { label: 'No pair', input: { nums: [2, 5, 9, 12, 20], target: 16 } },
};

export const pairSumCode = [
  ['init', 'int left = 0, right = a.length - 1;'],
  ['loop', 'while (left < right) {'],
  ['sum', '    int sum = a[left] + a[right];'],
  ['found', '    if (sum == target) return new int[] { left, right };'],
  ['small', '    if (sum < target) left++;   // a[left] is too small for all'],
  ['big', '    else right--;               // a[right] is too big for all'],
  ['end', '}'],
  ['none', 'return new int[0];'],
];

export function pairSum({ nums: a, target }) {
  const n = a.length;
  const total = (n * (n - 1)) / 2;
  const out = new Set();                               // "i,j" pairs ruled out
  const steps = [];
  let L = 0, R = n - 1, checked = 0;
  const snap = (s) => steps.push({ L, R, out: new Set(out), checked, ruled: out.size, total, ...s });

  snap({
    kind: 'start', lines: ['init'],
    title: 'Start at both ends',
    text: `The array is sorted, so a[L] is the smallest value and a[R] the largest. The grid lists all ${total} pairs (row = the left index, column = the right index) with their sums. Brute force would check every cell; the two pointers check one cell per step and rule out a whole row or column each time.`,
    calc: [`L = 0, R = ${n - 1}`, `target = ${target}`, `pairs = ${total}`],
  });

  while (L < R) {
    const sum = a[L] + a[R];
    checked++;
    if (sum === target) {
      snap({
        kind: 'found', sum, verdict: 'found', lines: ['sum', 'found'], answer: `[${L}, ${R}]`,
        title: `${a[L]} + ${a[R]} = ${target}: found`,
        text: `a[L] + a[R] = ${a[L]} + ${a[R]} = ${sum}, exactly the target. Answer [${L}, ${R}] after checking ${plural(checked, 'sum')} out of ${total} possible pairs.`,
        calc: [`a[${L}] + a[${R}] = ${a[L]} + ${a[R]} = ${sum}`, `${sum} == ${target} → return [${L}, ${R}]`],
      });
      return steps;
    }
    if (sum < target) {
      const gone = [];
      for (let j = L + 1; j <= R; j++) gone.push(`${L},${j}`);
      snap({
        kind: 'small', sum, verdict: 'small', leaving: gone, lines: ['sum', 'small'],
        title: `${sum} < ${target}: ${a[L]} is too small for every partner`,
        text: `a[L] + a[R] = ${a[L]} + ${a[R]} = ${sum}, below ${target}. a[R] = ${a[R]} is the largest value still in play, and even it is not enough for ${a[L]}. So ${a[L]} can't be in any answer: its whole row (${plural(gone.length, 'pair')}) is ruled out at once, and L moves right.`,
        calc: [`a[${L}] + a[${R}] = ${a[L]} + ${a[R]} = ${sum}`, `${sum} < ${target} → too small`, `L++ (rules out ${plural(gone.length, 'pair')})`],
      });
      gone.forEach((p) => out.add(p));
      L++;
    } else {
      const gone = [];
      for (let i = L; i < R; i++) gone.push(`${i},${R}`);
      snap({
        kind: 'big', sum, verdict: 'big', leaving: gone, lines: ['sum', 'big'],
        title: `${sum} > ${target}: ${a[R]} is too big for every partner`,
        text: `a[L] + a[R] = ${a[L]} + ${a[R]} = ${sum}, above ${target}. a[L] = ${a[L]} is the smallest value still in play, and even with it the sum is too big. So ${a[R]} can't be in any answer: its whole column (${plural(gone.length, 'pair')}) is ruled out at once, and R moves left.`,
        calc: [`a[${L}] + a[${R}] = ${a[L]} + ${a[R]} = ${sum}`, `${sum} > ${target} → too big`, `R-- (rules out ${plural(gone.length, 'pair')})`],
      });
      gone.forEach((p) => out.add(p));
      R--;
    }
  }
  snap({
    kind: 'none', lines: ['none'], answer: 'no pair',
    title: 'L and R met: no pair adds up to the target',
    text: `Every one of the ${total} pairs has been ruled out, and only ${plural(checked, 'sum')} had to be computed. No two values add up to ${target}. O(n) time, O(1) space.`,
    calc: [`checked ${checked} of ${total} pairs`, 'return []'],
  });
  return steps;
}

export function parsePairSum(values) {
  const a = parseInts(values.nums, { min: -99, max: 99, minLen: 2, maxLen: 10, name: 'nums' });
  if (a.error) return a;
  const t = parseInt1(values.target, { min: -198, max: 198, name: 'target' });
  if (t.error) return t;
  return { input: { nums: [...a.arr].sort((x, y) => x - y), target: t.v } };
}

export function randomPairSum(rand = Math.random) {
  const r = rng(rand);
  const n = r.int(5, 9);
  const nums = Array.from({ length: n }, () => r.int(-10, 30)).sort((x, y) => x - y);
  if (r.bool(0.8)) {
    const i = r.int(0, n - 2), j = r.int(i + 1, n - 1);
    return { nums, target: nums[i] + nums[j] };
  }
  return { nums, target: r.int(-15, 60) };
}

// ---------------------------------------------------------------- opposite ends: container with most water

export const CONTAINER = {
  basic: { label: 'Most water', input: { heights: [1, 8, 6, 2, 5, 4, 8, 3, 7] } },
};

export const containerCode = [
  ['init', 'int left = 0, right = h.length - 1, best = 0;'],
  ['loop', 'while (left < right) {'],
  ['area', '    int area = Math.min(h[left], h[right]) * (right - left);'],
  ['best', '    best = Math.max(best, area);'],
  ['moveL', '    if (h[left] < h[right]) left++;   // the shorter wall limits'],
  ['moveR', '    else right--;'],
  ['end', '}'],
];

export function container({ heights: h }) {
  const n = h.length;
  const steps = [];
  let L = 0, R = n - 1, best = 0, bestPair = null;
  steps.push({
    kind: 'start', L, R, best, bestPair, lines: ['init'],
    title: 'Start with the widest container',
    text: 'Any two lines and the floor form a container; the water level is the shorter of the two lines. Start with L on the first line and R on the last: the widest container there is. Every step measures the current container, then gives up the shorter wall.',
    calc: [`L = 0, R = ${n - 1}`, 'best = 0'],
  });
  while (L < R) {
    const w = R - L, level = Math.min(h[L], h[R]), area = level * w;
    const before = best;
    const better = area > best;
    if (better) { best = area; bestPair = [L, R]; }
    const move = h[L] < h[R] ? 'L' : 'R';
    const tie = h[L] === h[R];
    const short = move === 'L' ? h[L] : h[R];
    const why = tie
      ? `Both walls are ${short} tall. Any other container that keeps either of them would be narrower and still at most ${short} tall, so neither can do better than ${area}. Dropping either is safe; the code drops the right one.`
      : `The ${move === 'L' ? 'left' : 'right'} wall (${short}) is the shorter one. Any other container that keeps it would be narrower and still at most ${short} tall, so it can never beat ${area}: drop it. Moving the taller wall instead could only lose width.`;
    steps.push({
      kind: 'measure', L, R, w, level, area, best, bestPair, better, move, lines: ['area', 'best', move === 'L' ? 'moveL' : 'moveR'],
      title: `Width ${w} × height ${level} = ${area}${better ? ': a new best' : ''}`,
      text: `The container between L = ${L} (height ${h[L]}) and R = ${R} (height ${h[R]}) holds water up to the shorter wall: ${level} high and ${w} wide, area ${area}. ${better ? 'That is the best so far.' : `Best stays ${best}.`} ${why}`,
      calc: [`area = min(${h[L]}, ${h[R]}) × (${R} − ${L}) = ${level} × ${w} = ${area}`, `best = max(${before}, ${area}) = ${best}`, `h[L] ${h[L] < h[R] ? '<' : h[L] === h[R] ? '=' : '>'} h[R] → ${move === 'L' ? 'left++' : 'right--'}`],
    });
    if (move === 'L') L++; else R--;
  }
  steps.push({
    kind: 'done', L, R, best, bestPair, lines: ['end'], answer: `most water = ${best}`,
    title: `L and R met: the most water is ${best}`,
    text: `${plural(n - 1, 'container')} measured instead of all ${(n * (n - 1)) / 2} pairs. Each step dropped a wall that could not be part of anything better, so the best container (between ${bestPair ? `${bestPair[0]} and ${bestPair[1]}` : '—'}) was never skipped.`,
    calc: [`best = ${best}`, `containers measured = ${n - 1}`],
  });
  return steps;
}

export function parseContainer(values) {
  const a = parseInts(values.heights, { min: 0, max: 12, minLen: 2, maxLen: 12, name: 'heights' });
  return a.error ? a : { input: { heights: a.arr } };
}

export function randomContainer(rand = Math.random) {
  const r = rng(rand);
  return { heights: Array.from({ length: r.int(6, 11) }, () => r.int(0, 12)) };
}

// ---------------------------------------------------------------- same direction: read and write

export const READ_WRITE = {
  dedupe: { label: 'Remove duplicates (sorted)', input: { mode: 'dedupe', nums: [1, 1, 2, 2, 2, 3, 5, 5] } },
  zeroes: { label: 'Move zeroes', input: { mode: 'zeroes', nums: [0, 1, 0, 3, 12] } },
};

export const readWriteCode = {
  dedupe: [
    ['init', 'int write = 1;                     // a[0] is always kept'],
    ['loop', 'for (int read = 1; read < a.length; read++)'],
    ['test', '    if (a[read] != a[write - 1])     // a new value?'],
    ['copy', '        a[write++] = a[read];'],
    ['ret', 'return write;                      // a[0..write) is the answer'],
  ],
  zeroes: [
    ['init', 'int write = 0;'],
    ['loop', 'for (int read = 0; read < a.length; read++)'],
    ['test', '    if (a[read] != 0) {'],
    ['swap', '        swap(a, write, read);'],
    ['inc', '        write++;'],
    ['close', '    }'],
  ],
};

export function readWrite({ mode, nums }) {
  const n = nums.length;
  const cells = nums.map((v, id) => ({ v, id }));
  const steps = [];
  let write = mode === 'dedupe' ? 1 : 0;
  const snap = (s) => steps.push({ cells: cells.map((c) => ({ ...c })), write, ...s });

  if (mode === 'dedupe') {
    snap({
      kind: 'start', read: null, lines: ['init'],
      title: 'a[0] is kept; write = 1',
      text: 'read visits every element once. write marks where the next kept value goes, so a[0..write) (shaded) is always the finished, duplicate-free part. The first value is always kept, so both start at 1.',
      calc: ['write = 1', `kept = [${cells[0].v}]`],
    });
    for (let read = 1; read < n; read++) {
      const v = cells[read].v, last = cells[write - 1].v;
      if (v === last) {
        snap({
          kind: 'skip', read, lines: ['loop', 'test'],
          title: `${v} equals the last kept value: skip it`,
          text: `a[read] = ${v} and a[write − 1] = ${last}: a duplicate (the array is sorted, so copies sit together). Nothing is written; only read moves on.`,
          calc: [`a[${read}] = ${v}`, `a[write − 1] = a[${write - 1}] = ${last}`, `${v} == ${last} → skip`],
        });
        continue;
      }
      if (read === write) {
        cells[write].v = v;
        write++;
        snap({
          kind: 'self', read, lines: ['test', 'copy'],
          title: `${v} is new, and it is already where it belongs`,
          text: `a[read] = ${v} differs from the last kept value ${last}, so it is kept. read and write point at the same cell (no duplicates so far), so the copy writes ${v} onto itself and write moves to ${write}.`,
          calc: [`${v} != ${last} → keep`, `a[${read}] = a[${read}]`, `write = ${write}`],
        });
        continue;
      }
      snap({
        kind: 'plan', read, from: read, to: write, lines: ['test', 'copy'],
        title: `${v} is new: copy it to a[${write}]`,
        text: `a[read] = ${v} differs from the last kept value ${last}, so it belongs in the result. write = ${write} is the next free slot of the result, so copy ${v} there (the arrow). The old value at a[${write}] is a leftover duplicate and can be overwritten.`,
        calc: [`a[${read}] = ${v}`, `a[write − 1] = ${last}`, `${v} != ${last} → a[${write}] = ${v}`],
      });
      cells[write].v = v;
      write++;
      snap({
        kind: 'copied', read, from: read, to: write - 1, lines: ['copy'],
        title: `Copied: the result is [${cells.slice(0, write).map((c) => c.v).join(', ')}]`,
        text: `a[${write - 1}] is now ${v} and write moved to ${write}. Everything in a[0..${write}) is distinct and in order; read carries on.`,
        calc: [`a[${write - 1}] = ${v}`, `write = ${write}`],
      });
    }
    snap({
      kind: 'done', read: null, lines: ['ret'], answer: `k = ${write}, [${cells.slice(0, write).map((c) => c.v).join(', ')}]`,
      title: `Done: ${plural(write, 'distinct value')} in a[0..${write})`,
      text: `Return ${write}. The first ${write} cells hold the distinct values in order; whatever is after them doesn't matter. One pass, O(1) extra space.`,
      calc: [`return ${write}`],
    });
    return steps;
  }

  snap({
    kind: 'start', read: null, lines: ['init'],
    title: 'write = 0: the non-zeros will be packed to the left',
    text: 'read visits every element. Each non-zero is swapped into a[write], so a[0..write) (shaded) holds the non-zeros in their original order, and the zeros drift to the right one swap at a time.',
    calc: ['write = 0'],
  });
  for (let read = 0; read < n; read++) {
    const v = cells[read].v;
    if (v === 0) {
      snap({
        kind: 'skip', read, lines: ['loop', 'test'],
        title: 'A zero: leave it, write stays',
        text: `a[read] = 0. Don't move it now: write stays on the leftmost zero, so the next non-zero will swap with it and push it right.`,
        calc: [`a[${read}] = 0 → skip`, `write stays ${write}`],
      });
      continue;
    }
    if (read === write) {
      write++;
      snap({
        kind: 'self', read, lines: ['test', 'swap', 'inc'],
        title: `${v} is already in place`,
        text: `a[read] = ${v} is non-zero and read = write (no zeros before it yet), so the swap does nothing. write moves to ${write}.`,
        calc: [`${v} != 0`, `swap(a, ${read}, ${read}) does nothing`, `write = ${write}`],
      });
      continue;
    }
    const z = cells[write].v;
    snap({
      kind: 'plan', read, from: read, to: write, lines: ['test', 'swap'],
      title: `${v} is non-zero: swap it with the zero at a[${write}]`,
      text: `a[read] = ${v} must join the packed part, whose next slot is a[write] = a[${write}], holding ${z}. Swap them: ${v} moves left to index ${write} (top arrow), and the 0 moves right to index ${read} (bottom arrow). The order of the non-zeros is kept, because they are packed in the order read meets them.`,
      calc: [`a[${read}] = ${v} != 0`, `swap(a, ${write}, ${read})`],
    });
    const up = cells[read].id, down = cells[write].id;
    [cells[read], cells[write]] = [cells[write], cells[read]];
    write++;
    snap({
      kind: 'swapped', read, from: read, to: write - 1, swap: { up, down }, lines: ['swap', 'inc'],
      title: `Packed: [${cells.slice(0, write).map((c) => c.v).join(', ')}]`,
      text: `${v} is now at index ${write - 1} and write moved to ${write}. The zero it displaced sits at index ${read}, behind read, and will be pushed further right by the next non-zero.`,
      calc: [`a[${write - 1}] = ${v}, a[${read}] = 0`, `write = ${write}`],
    });
  }
  snap({
    kind: 'done', read: null, lines: ['loop'], answer: `[${cells.map((c) => c.v).join(', ')}]`,
    title: 'Done: non-zeros packed in order, zeros at the end',
    text: `read reached the end. a[0..${write}) holds the non-zeros in their original order and every zero sits after them. One pass, in place.`,
    calc: [`a = [${cells.map((c) => c.v).join(', ')}]`],
  });
  return steps;
}

export function parseReadWrite(values, input) {
  const a = parseInts(values.nums, { min: input.mode === 'dedupe' ? -99 : -9, max: 99, minLen: 1, maxLen: 10, name: 'nums' });
  if (a.error) return a;
  return { input: { mode: input.mode, nums: input.mode === 'dedupe' ? [...a.arr].sort((x, y) => x - y) : a.arr } };
}

export function randomReadWrite(input, rand = Math.random) {
  const r = rng(rand);
  const n = r.int(5, 9);
  if (input.mode === 'dedupe') return { mode: 'dedupe', nums: Array.from({ length: n }, () => r.int(1, 6)).sort((x, y) => x - y) };
  return { mode: 'zeroes', nums: Array.from({ length: n }, () => (r.bool(0.45) ? 0 : r.int(1, 15))) };
}

// ---------------------------------------------------------------- three pointers: Sort Colors

export const DUTCH = {
  basic: { label: 'Sort colors', input: { nums: [2, 0, 2, 1, 1, 0] } },
};

export const dutchCode = [
  ['init', 'int low = 0, mid = 0, high = a.length - 1;'],
  ['loop', 'while (mid <= high) {'],
  ['zero', '    if (a[mid] == 0) swap(a, low++, mid++);'],
  ['one', '    else if (a[mid] == 1) mid++;'],
  ['two', '    else swap(a, mid, high--);   // mid stays'],
  ['end', '}'],
];

export function dutchFlag({ nums }) {
  const n = nums.length;
  const cells = nums.map((v, id) => ({ v, id }));
  const steps = [];
  let low = 0, mid = 0, high = n - 1, swaps = 0;
  const snap = (s) => steps.push({ cells: cells.map((c) => ({ ...c })), low, mid, high, swaps, ...s });
  snap({
    kind: 'start', lines: ['init'],
    title: 'Three pointers, four regions',
    text: 'a[0..low) holds 0s, a[low..mid) holds 1s, a[mid..high] is still unknown, and a(high..end] holds 2s. At the start everything is unknown. mid looks at one unknown value per step and sends it to the right region.',
    calc: [`low = 0, mid = 0, high = ${n - 1}`],
  });
  while (mid <= high) {
    const v = cells[mid].v;
    if (v === 1) {
      snap({
        kind: 'one', at: mid, lines: ['one'],
        title: 'A 1 is already in the middle: mid++',
        text: `a[mid] = 1 belongs in the 1s region, which ends right where it is. Nothing to swap: just grow the 1s region by moving mid to ${mid + 1}.`,
        calc: [`a[${mid}] == 1`, `mid++ → ${mid + 1}`],
      });
      mid++;
      continue;
    }
    if (v === 0) {
      if (low === mid) {
        snap({
          kind: 'zeroSelf', at: mid, lines: ['zero'],
          title: 'A 0 right at the end of the 0s',
          text: `a[mid] = 0 and low = mid, so it is already at the end of the 0s region. The swap is with itself; low and mid both move on, to ${mid + 1}.`,
          calc: [`a[${mid}] == 0, low == mid`, `low++, mid++ → ${mid + 1}`],
        });
        low++; mid++;
        continue;
      }
      snap({
        kind: 'planZero', from: mid, to: low, lines: ['zero'],
        title: `A 0 at mid: swap it with a[low] = ${cells[low].v}`,
        text: `0s go to the left. a[low] is the first 1 (everything in a[low..mid) is a 1), so swapping puts the 0 at the end of the 0s (top arrow) and that 1 at the end of the 1s (bottom arrow). Both regions grow by one, so low and mid both move.`,
        calc: [`a[${mid}] == 0`, `swap(a, low = ${low}, mid = ${mid})`, 'low++, mid++'],
      });
      const up = cells[mid].id, down = cells[low].id;
      [cells[low], cells[mid]] = [cells[mid], cells[low]];
      low++; mid++; swaps++;
      snap({
        kind: 'swapped', from: mid - 1, to: low - 1, swap: { up, down }, lines: ['zero'],
        title: '0 joined the 0s; low and mid moved on',
        text: `The 0 is at index ${low - 1}, the 1 at index ${mid - 1}. low = ${low}, mid = ${mid}. Both values that moved are now known to be in the right region.`,
        calc: [`low = ${low}, mid = ${mid}`],
      });
      continue;
    }
    if (mid === high) {
      snap({
        kind: 'twoSelf', at: mid, lines: ['two'],
        title: 'A 2 right at the start of the 2s',
        text: `a[mid] = 2 and mid = high, so it is already next to the 2s region. high moves to ${high - 1}; then mid > high and nothing unknown is left.`,
        calc: [`a[${mid}] == 2, mid == high`, `high-- → ${high - 1}`],
      });
      high--;
      continue;
    }
    const other = cells[high].v;
    snap({
      kind: 'planTwo', from: mid, to: high, lines: ['two'],
      title: `A 2 at mid: swap it with a[high] = ${other}`,
      text: `2s go to the right end. Swap it with a[high], the last unknown value: the 2 moves right into the 2s region (top arrow) and ${other} comes back to mid (bottom arrow). high moves left, but mid stays: the value that just arrived hasn't been checked yet.`,
      calc: [`a[${mid}] == 2`, `swap(a, mid = ${mid}, high = ${high})`, 'high--, mid stays'],
    });
    const up = cells[mid].id, down = cells[high].id;
    [cells[mid], cells[high]] = [cells[high], cells[mid]];
    high--; swaps++;
    snap({
      kind: 'swapped', from: mid, to: high + 1, swap: { up, down }, lines: ['two'],
      title: `2 joined the 2s; ${other} waits at mid to be checked`,
      text: `The 2 is at index ${high + 1}, which is now part of the 2s region (high = ${high}). mid is still ${mid}, looking at ${other}, which came from the unknown part. Advancing mid here is the classic bug: a 0 arriving from the right would be left in the middle.`,
      calc: [`high = ${high}`, `mid stays ${mid} (a[mid] = ${other} unchecked)`],
    });
  }
  snap({
    kind: 'done', lines: ['end'], answer: `[${cells.map((c) => c.v).join(', ')}]`,
    title: 'mid passed high: nothing unknown is left',
    text: `Every value was looked at once by mid, and ${plural(swaps, 'swap')} sorted the array in one pass, in place: 0s, then 1s, then 2s.`,
    calc: [`a = [${cells.map((c) => c.v).join(', ')}]`, `swaps = ${swaps}`],
  });
  return steps;
}

export function parseDutch(values) {
  const a = parseInts(values.nums, { min: 0, max: 2, minLen: 1, maxLen: 10, name: 'nums' });
  return a.error ? { error: a.error.replace('between 0 and 2', '0, 1 or 2') } : { input: { nums: a.arr } };
}

export function randomDutch(rand = Math.random) {
  const r = rng(rand);
  return { nums: Array.from({ length: r.int(6, 10) }, () => r.int(0, 2)) };
}

