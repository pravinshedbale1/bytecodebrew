/**
 * A deque of candidate indexes over the last stretch of an array (the model behind <DpDequeViz>).
 * Pure, so scripts/viz-check.mjs can test it against brute force.
 *
 * Modes:
 *   jump      dp[i] = nums[i] + max(dp over the last k)                  (Jump Game VI)
 *   csum      dp[i] = nums[i] + max(0, max(dp over the last k)); best dp   (Constrained Subsequence Sum)
 *   shortest  prefix sums; the front leaves once it pairs with p[j] ≥ k   (Shortest Subarray with Sum at Least K)
 * For jump and csum the deque holds indexes with decreasing dp (front = best of the window); for shortest
 * it holds indexes with increasing prefix sums (front = smallest, the best start).
 * A step: { kind, title, text, calc, lines, i, dq, vals (dp or prefix sums so far), left?, pushed?, card?,
 *           band?, best?, answer? }
 */
import { parseInt1, parseInts, rng } from './util.js';

export const DP_DEQUE = {
  jump: { label: 'Jump Game VI, k = 2', input: { mode: 'jump', nums: [1, -1, -2, 4, -7, 3], k: 2 } },
  csum: { label: 'Constrained sum, k = 2', input: { mode: 'csum', nums: [10, 2, -10, 5, 20], k: 2 } },
  shortest: { label: 'Shortest sum ≥ 3', input: { mode: 'shortest', nums: [2, -1, 2], k: 3 } },
};

export const dpDequeCode = {
  jump: [
    ['init', 'dp[0] = nums[0]; dq.offerLast(0);'],
    ['loop', 'for (int i = 1; i < n; i++) {'],
    ['expire', '    if (dq.peekFirst() < i - k) dq.pollFirst();        // too far back to jump from'],
    ['dp', '    dp[i] = nums[i] + dp[dq.peekFirst()];               // the best place to jump from'],
    ['back', '    while (!dq.isEmpty() && dp[dq.peekLast()] <= dp[i]) dq.pollLast();'],
    ['push', '    dq.offerLast(i);'],
    ['end', '}'],
    ['ret', 'return dp[n - 1];'],
  ],
  csum: [
    ['loop', 'for (int i = 0; i < n; i++) {'],
    ['expire', '    if (!dq.isEmpty() && dq.peekFirst() < i - k) dq.pollFirst();'],
    ['dp', '    dp[i] = nums[i] + Math.max(0, dq.isEmpty() ? 0 : dp[dq.peekFirst()]);   // extend, or start here'],
    ['back', '    while (!dq.isEmpty() && dp[dq.peekLast()] <= dp[i]) dq.pollLast();'],
    ['push', '    dq.offerLast(i); best = Math.max(best, dp[i]);'],
    ['end', '}'],
    ['ret', 'return best;'],
  ],
  shortest: [
    ['prefix', 'long[] p = new long[n + 1];   // p[j] = nums[0] + … + nums[j − 1]'],
    ['loop', 'for (int j = 0; j <= n; j++) {'],
    ['front', '    while (!dq.isEmpty() && p[j] - p[dq.peekFirst()] >= k) best = Math.min(best, j - dq.pollFirst());'],
    ['back', '    while (!dq.isEmpty() && p[dq.peekLast()] >= p[j]) dq.pollLast();   // a later, lower start is better'],
    ['push', '    dq.offerLast(j);'],
    ['end', '}'],
    ['ret', 'return best == Integer.MAX_VALUE ? -1 : best;'],
  ],
};

const list = (a) => `[${a.join(', ')}]`;

function dpRun({ mode, nums, k }) {
  const n = nums.length;
  const jump = mode === 'jump';
  const dp = Array(n).fill(null);
  const dq = [];
  const steps = [];
  let best = -Infinity;
  const snap = (x) => steps.push({ dq: [...dq], vals: [...dp], i: null, ...x });
  snap({
    kind: 'start', lines: jump ? ['init'] : [],
    title: jump ? `Best score reaching each index, jumps of at most ${k}` : `Best subsequence ending at each index, gaps of at most ${k}`,
    text: jump
      ? `dp[i] is the best score of any path that ends at i. You land on i from one of the previous ${k} indexes, so dp[i] = nums[i] + the best dp among them. The deque keeps the indexes that could still be that best, with dp falling from front to back: the front is the answer.`
      : `dp[i] is the best sum of a valid subsequence that ends at i: nums[i] plus the best dp among the previous ${k} indexes, or nothing at all if they are all negative. The deque keeps the candidates with dp falling from front to back.`,
    calc: [`k = ${k}`],
  });
  for (let i = jump ? 0 : 0; i < n; i++) {
    if (jump && i === 0) {
      dp[0] = nums[0];
      dq.push(0);
      snap({ kind: 'compute', i: 0, pushed: 0, card: { q: `dp[0] = nums[0]`, a: `= ${nums[0]}`, tone: 'info' }, lines: ['init'], title: `Start at index 0: dp[0] = ${nums[0]}`, text: 'The path starts here, so its score is just nums[0]. Index 0 is the first candidate to jump from.', calc: [`dp[0] = ${nums[0]}`] });
      continue;
    }
    if (dq.length && dq[0] < i - k) {
      const j = dq.shift();
      snap({ kind: 'expire', i, left: { j, why: 'front' }, card: { q: `${j} < ${i} − ${k}`, a: 'too far back → drop', tone: 'bad' }, band: [Math.max(0, i - k), i - 1], lines: ['loop', 'expire'], title: `Index ${j} is out of reach: drop it from the front`, text: `From index ${j} you can't reach ${i} in one jump (more than ${k} back), so it can't be used any more, however good dp[${j}] was.`, calc: [`${j} < ${i - k} → pop front`] });
    }
    const from = dq.length ? dq[0] : null;
    const add = from === null ? 0 : jump ? dp[from] : Math.max(0, dp[from]);
    dp[i] = nums[i] + add;
    snap({
      kind: 'compute', i, card: { q: `${nums[i]} + ${jump ? `dp[${from}]` : from === null ? '0' : `max(0, dp[${from}])`}`, a: `= ${dp[i]}`, tone: 'yes' }, band: [Math.max(0, i - k), i - 1], lines: ['loop', 'dp'],
      title: `dp[${i}] = ${nums[i]} + ${add} = ${dp[i]}`,
      text: from === null
        ? `Nothing to extend: the subsequence starts at ${i}.`
        : jump
          ? `The front of the deque, index ${from} (dp = ${dp[from]}), is the best of the last ${k} indexes: jump from there.`
          : dp[from] > 0 ? `The front, index ${from}, has the best dp in range, ${dp[from]}: extending it helps.` : `Even the best dp in range, ${dp[from]}, is not positive: better to start a new subsequence at ${i}.`,
      calc: [`dp[${i}] = ${dp[i]}`],
    });
    const popped = [];
    while (dq.length && dp[dq.at(-1)] <= dp[i]) popped.push(dq.pop());
    dq.push(i);
    best = Math.max(best, dp[i]);
    snap({
      kind: 'push', i, pushed: i, left: popped.length ? { j: popped.at(-1), why: 'back' } : null,
      card: popped.length ? { q: `dp ${popped.map((j) => dp[j]).join(', ')} ≤ ${dp[i]}`, a: `pop ${popped.length === 1 ? 'it' : 'them'} from the back`, tone: 'yes' } : { q: `push ${i}`, a: 'nothing behind is ≤ it', tone: 'info' },
      lines: ['back', 'push'],
      title: popped.length ? `Index ${i} pushes out ${popped.reverse().join(', ')}` : `Push index ${i}`,
      text: popped.length ? `${popped.length === 1 ? 'That index is' : 'Those indexes are'} older and no better than dp[${i}] = ${dp[i]}, so ${popped.length === 1 ? 'it' : 'they'} can never be the best in range again: ${i} stays in range longer.` : `dp[${i}] = ${dp[i]} is smaller than the back of the deque, but it may become the best once the bigger ones fall out of range.`,
      calc: [`deque = ${list(dq)}`, ...(jump ? [] : [`best = ${best}`])],
    });
  }
  const ans = jump ? dp[n - 1] : best;
  snap({ kind: 'done', lines: ['ret'], answer: String(ans), title: jump ? `Best score at the last index: ${ans}` : `Best subsequence sum: ${ans}`, text: `Each index enters and leaves the deque at most once, so the whole DP is O(n) instead of O(n · k).`, calc: [`return ${ans}`] });
  return steps;
}

function shortestRun({ nums, k }) {
  const n = nums.length;
  const p = [0];
  nums.forEach((x) => p.push(p.at(-1) + x));
  const dq = [];
  const steps = [];
  let best = Infinity, bestAt = null;
  const snap = (x) => steps.push({ dq: [...dq], vals: [...p], i: null, best: best === Infinity ? null : best, bestAt, ...x });
  snap({ kind: 'start', lines: ['prefix'], title: `Shortest subarray with sum ≥ ${k}`, text: `With negative numbers a sliding window can't decide when to shrink. Use prefix sums instead: the subarray from i to j − 1 sums to p[j] − p[i]. For each end j, the best start is a recent i with a small p[i]. The deque keeps candidate starts with p increasing from front to back.`, calc: [`p = ${list(p)}`] });
  for (let j = 0; j <= n; j++) {
    while (dq.length && p[j] - p[dq[0]] >= k) {
      const i = dq.shift();
      const len = j - i;
      if (len < best) { best = len; bestAt = [i, j - 1]; }
      snap({ kind: 'found', i: j, left: { j: i, why: 'front' }, band: [i, j - 1], card: { q: `p[${j}] − p[${i}] = ${p[j] - p[i]} ≥ ${k}`, a: `length ${len}`, tone: 'yes' }, lines: ['loop', 'front'], title: `Start ${i} works for end ${j}: length ${len}`, text: `nums[${i}..${j - 1}] sums to ${p[j] - p[i]} ≥ ${k}. Any later end would only be longer for this start, so record it and drop start ${i} from the front.`, calc: [`length = ${j} − ${i} = ${len}`, `best = ${best}`] });
    }
    const popped = [];
    while (dq.length && p[dq.at(-1)] >= p[j]) popped.push(dq.pop());
    dq.push(j);
    snap({
      kind: popped.length ? 'replace' : 'push', i: j, pushed: j, left: popped.length ? { j: popped.at(-1), why: 'back' } : null,
      card: popped.length ? { q: `p ${popped.map((i) => p[i]).join(', ')} ≥ p[${j}] = ${p[j]}`, a: 'later and lower is better → pop', tone: 'yes' } : { q: `push ${j}`, a: `p[${j}] = ${p[j]}`, tone: 'info' },
      lines: ['back', 'push'],
      title: popped.length ? `p[${j}] = ${p[j]} replaces start${popped.length === 1 ? '' : 's'} ${popped.reverse().join(', ')}` : `Push start ${j} (p = ${p[j]})`,
      text: popped.length ? `A start with a prefix sum at least as big as p[${j}], and further left, is never better: ${j} gives a bigger sum and a shorter subarray for every later end.` : `p[${j}] is bigger than every start before it, so it may still be the best start for some later end.`,
      calc: [`deque = ${list(dq)}`],
    });
  }
  const ans = best === Infinity ? -1 : best;
  snap({ kind: 'done', lines: ['ret'], answer: String(ans), title: ans === -1 ? 'No subarray reaches the sum: −1' : `Shortest: ${ans}`, text: 'Each prefix index enters and leaves the deque once: O(n).', calc: [`return ${ans}`] });
  return steps;
}

export function dpDeque(input) {
  return input.mode === 'shortest' ? shortestRun(input) : dpRun(input);
}

/** Reference answers by brute force. */
export function dpDequeAnswer({ mode, nums, k }) {
  const n = nums.length;
  if (mode === 'shortest') {
    let best = Infinity;
    for (let i = 0; i < n; i++) { let s = 0; for (let j = i; j < n; j++) { s += nums[j]; if (s >= k) { best = Math.min(best, j - i + 1); break; } } }
    return String(best === Infinity ? -1 : best);
  }
  const dp = Array(n).fill(0);
  let best = -Infinity;
  for (let i = 0; i < n; i++) {
    let m = mode === 'jump' ? (i === 0 ? 0 : -Infinity) : 0;
    for (let j = Math.max(0, i - k); j < i; j++) m = Math.max(m, dp[j]);
    dp[i] = nums[i] + m;
    best = Math.max(best, dp[i]);
  }
  return String(mode === 'jump' ? dp[n - 1] : best);
}

export function parseDpDeque(values, input) {
  const r = parseInts(values.nums, { min: -20, max: 20, minLen: 1, maxLen: 9, name: 'nums' });
  if (r.error) return r;
  const k = input.mode === 'shortest'
    ? parseInt1(values.k, { min: 1, max: 99, name: 'k' })
    : parseInt1(values.k, { min: 1, max: r.arr.length, name: 'k' });
  if (k.error) return { error: input.mode === 'shortest' ? 'k: a whole number from 1 to 99.' : `k: from 1 to ${r.arr.length}.` };
  return { input: { mode: input.mode, nums: r.arr, k: k.v } };
}

export function randomDpDeque(input, rand = Math.random) {
  const g = rng(rand);
  const nums = Array.from({ length: g.int(1, 8) }, () => g.int(-9, 12));
  return { mode: input.mode, nums, k: input.mode === 'shortest' ? g.int(1, 20) : g.int(1, nums.length) };
}
