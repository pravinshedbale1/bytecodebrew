/**
 * Binary search on the answer (model for <AnswerSearchViz>): search the range of possible answers,
 * running the problem's feasibility check at every probe. Pure, so scripts/viz-check.mjs can test it.
 */
import { list, parseInt1, parseInts, plural, rng } from './util.js';

export const ANSWER = {
  koko: { label: 'Koko: minimum speed', input: { mode: 'koko', piles: [3, 6, 7, 11], h: 8 } },
  ship: { label: 'Ship: minimum capacity', input: { mode: 'ship', weights: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], days: 5 } },
  cows: { label: 'Maximise the minimum gap', input: { mode: 'cows', positions: [1, 2, 4, 8, 9], m: 3 } },
};

export const answerCode = {
  koko: [
    ['range', 'int lo = 1, hi = max(piles);                // possible speeds'],
    ['loop', 'while (lo < hi) {'],
    ['mid', '    int k = lo + (hi - lo) / 2;'],
    ['check', '    long hours = 0; for (int p : piles) hours += (p + k - 1) / k;'],
    ['yes', '    if (hours <= h) hi = k;      // works: maybe slower works too'],
    ['no', '    else lo = k + 1;             // too slow, and so is everything slower'],
    ['close', '}'],
    ['ret', 'return lo;'],
  ],
  ship: [
    ['range', 'int lo = max(weights), hi = sum(weights);   // possible capacities'],
    ['loop', 'while (lo < hi) {'],
    ['mid', '    int cap = lo + (hi - lo) / 2;'],
    ['check', '    int used = daysNeeded(weights, cap);      // greedy: fill each day'],
    ['yes', '    if (used <= days) hi = cap;  // fits: try a smaller ship'],
    ['no', '    else lo = cap + 1;           // too small, and so is everything smaller'],
    ['close', '}'],
    ['ret', 'return lo;'],
  ],
  cows: [
    ['range', 'int lo = 1, hi = pos[n - 1] - pos[0] + 1;   // gaps; hi can never fit'],
    ['loop', 'while (lo < hi) {'],
    ['mid', '    int gap = lo + (hi - lo) / 2;'],
    ['check', '    boolean fits = canPlace(pos, m, gap);     // greedy: earliest spots'],
    ['yes', '    if (!fits) hi = gap;         // the first gap that FAILS'],
    ['no', '    else lo = gap + 1;'],
    ['close', '}'],
    ['ret', 'return lo - 1;                 // the largest gap that fits'],
  ],
};

/** The feasibility check for one candidate, with everything the view needs to draw it. */
export function check(input, x) {
  if (input.mode === 'koko') {
    const per = input.piles.map((p) => Math.ceil(p / x));
    const hours = per.reduce((s, v) => s + v, 0);
    return { works: hours <= input.h, per, hours, summary: `${hours} hours ${hours <= input.h ? '≤' : '>'} ${input.h}` };
  }
  if (input.mode === 'ship') {
    const day = [];
    const loads = [];
    let load = 0;
    for (const w of input.weights) {
      if (load + w > x) { loads.push(load); load = 0; }
      load += w;
      day.push(loads.length);
    }
    loads.push(load);
    return { works: loads.length <= input.days, day, loads, used: loads.length, summary: `${plural(loads.length, 'day')} ${loads.length <= input.days ? '≤' : '>'} ${input.days}` };
  }
  const pos = [...input.positions].sort((a, b) => a - b);
  const placed = [pos[0]];
  for (let k = 1; k < pos.length && placed.length < input.m; k++) if (pos[k] - placed.at(-1) >= x) placed.push(pos[k]);
  return { works: placed.length >= input.m, placed, summary: `${plural(placed.length, 'ball')} placed ${placed.length >= input.m ? '≥' : '<'} ${input.m}` };
}

function rangeOf(input) {
  if (input.mode === 'koko') return [1, Math.max(...input.piles)];
  if (input.mode === 'ship') return [Math.max(...input.weights), input.weights.reduce((s, v) => s + v, 0)];
  const pos = [...input.positions].sort((a, b) => a - b);
  return [1, pos.at(-1) - pos[0] + 1];
}

function describeCheck(input, x, c) {
  if (input.mode === 'koko') return `At speed ${x}: ${input.piles.map((p, k) => `⌈${p}/${x}⌉ = ${c.per[k]}`).join(', ')}. Total ${c.hours} hours, ${c.works ? 'within' : 'more than'} ${input.h}.`;
  if (input.mode === 'ship') {
    const groups = c.loads.map((ld, d) => `day ${d + 1}: ${list(input.weights.filter((_, k) => c.day[k] === d))} = ${ld}`);
    return `With capacity ${x}, load each day until the next package doesn't fit: ${groups.join('; ')}. That's ${plural(c.used, 'day')}, ${c.works ? 'within' : 'more than'} ${input.days}.`;
  }
  return `With a minimum gap of ${x}, put a ball at the first position, then each next one at the first position at least ${x} further on: ${c.placed.join(', ')}. ${plural(c.placed.length, 'ball')}${c.works ? `, enough for ${input.m}` : `, fewer than ${input.m}`}.`;
}

const NOUN = { koko: 'speed', ship: 'capacity', cows: 'gap' };

export function answerSearch(input) {
  const [lo0, hi0] = rangeOf(input);
  const steps = [];
  let lo = lo0, hi = hi0, probes = 0;
  const probed = [];
  const noun = NOUN[input.mode];
  const snap = (s) => steps.push({ lo, hi, lo0, hi0, probes, probed: probed.map((p) => ({ ...p })), ...s });
  const intro = {
    koko: `Possible speeds go from 1 to the largest pile, ${hi0} (eating faster than the biggest pile never helps). If speed k finishes in time, any faster speed does too: the answers go ✗ … ✗, ✓ … ✓. Find the first ✓ without testing every speed.`,
    ship: `Possible capacities go from the heaviest package, ${lo0} (a smaller ship can't carry it), to the total weight, ${hi0} (everything in one day). If capacity c works, a bigger ship works too: ✗ … ✗, ✓ … ✓. Find the first ✓.`,
    cows: `Possible minimum gaps go from 1 up to the whole span, ${hi0 - 1}. Small gaps are easy and big ones eventually fail: ✓ … ✓, ✗ … ✗. Search for the first gap that FAILS (hi = ${hi0} can never fit), then step back one.`,
  }[input.mode];
  snap({ kind: 'start', mid: null, lines: ['range'], title: `Search the ${noun}s ${lo0} … ${hi0}, not the input`, text: `${intro} Each probe runs one O(n) check; there will be about log₂(${hi0 - lo0 + 1}) ≈ ${Math.ceil(Math.log2(hi0 - lo0 + 1))} of them.`, calc: [`lo = ${lo0}, hi = ${hi0}`, `candidates = ${hi0 - lo0 + 1}`] });
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    const c = check(input, mid);
    probes++;
    probed.push({ x: mid, works: c.works });
    const goLow = input.mode === 'cows' ? !c.works : c.works;     // hi = mid
    const decision = goLow ? `hi = ${mid}` : `lo = ${mid + 1}`;
    const why = input.mode === 'cows'
      ? (c.works ? `Gap ${mid} fits, so every smaller gap fits too: the answer is at least ${mid}. Look higher: lo = ${mid + 1}.` : `Gap ${mid} fails, and so would anything bigger. It might be the first failing gap, so keep it: hi = ${mid}.`)
      : (c.works ? `${mid} works, so every bigger ${noun} works too. It might be the smallest that works, so keep it: hi = ${mid}.` : `${mid} is not enough, and neither is anything smaller: lo = ${mid + 1}.`);
    snap({
      kind: c.works ? 'works' : 'fails', mid, check: c, lines: ['loop', 'mid', 'check', goLow ? 'yes' : 'no'],
      title: `${noun[0].toUpperCase()}${noun.slice(1)} ${mid}: ${c.summary} → ${c.works ? 'works' : 'fails'}`,
      text: `${describeCheck(input, mid, c)} ${why}`,
      calc: [`${noun} = ${lo} + (${hi} − ${lo}) / 2 = ${mid}`, `check: ${c.summary}`, `${decision} (candidates ${hi - lo + 1} → ${goLow ? mid - lo + 1 : hi - mid})`],
    });
    if (goLow) hi = mid; else lo = mid + 1;
  }
  const ans = input.mode === 'cows' ? lo - 1 : lo;
  const final = check(input, ans);
  snap({
    kind: 'done', mid: ans, check: final, lines: ['ret'],
    answer: input.mode === 'koko' ? `speed = ${ans}` : input.mode === 'ship' ? `capacity = ${ans}` : `largest minimum gap = ${ans}`,
    title: input.mode === 'cows' ? `First failing gap ${lo}, so the answer is ${ans}` : `lo == hi == ${ans}: the smallest ${noun} that works`,
    text: `${input.mode === 'cows' ? `Gap ${lo} is the first that fails, so ${ans} is the largest that fits.` : `${ans} is the first ${noun} where the check passes.`} ${describeCheck(input, ans, final)} ${plural(probes, 'check')} of O(n) each, instead of trying all ${hi0 - lo0 + 1} candidates: O(n log range).`,
    calc: [`answer = ${ans}`, `checks = ${probes}`],
  });
  return steps;
}

export function parseAnswer(values, input) {
  if (input.mode === 'koko') {
    const a = parseInts(values.piles, { min: 1, max: 30, minLen: 1, maxLen: 8, name: 'piles' });
    if (a.error) return a;
    const h = parseInt1(values.h, { min: a.arr.length, max: 60, name: 'h' });
    return h.error ? { error: `h must be between ${a.arr.length} (one hour per pile at least) and 60.` } : { input: { mode: 'koko', piles: a.arr, h: h.v } };
  }
  if (input.mode === 'ship') {
    const a = parseInts(values.weights, { min: 1, max: 20, minLen: 1, maxLen: 10, name: 'weights' });
    if (a.error) return a;
    const d = parseInt1(values.days, { min: 1, max: a.arr.length, name: 'days' });
    return d.error ? { error: `days must be between 1 and ${a.arr.length}.` } : { input: { mode: 'ship', weights: a.arr, days: d.v } };
  }
  const a = parseInts(values.positions, { min: 0, max: 60, minLen: 2, maxLen: 8, name: 'positions' });
  if (a.error) return a;
  if (new Set(a.arr).size !== a.arr.length) return { error: 'positions must be distinct.' };
  const m = parseInt1(values.m, { min: 2, max: a.arr.length, name: 'm' });
  return m.error ? { error: `m must be between 2 and ${a.arr.length}.` } : { input: { mode: 'cows', positions: a.arr, m: m.v } };
}

export function randomAnswer(input, rand = Math.random) {
  const g = rng(rand);
  if (input.mode === 'koko') {
    const piles = Array.from({ length: g.int(3, 6) }, () => g.int(1, 30));
    return { mode: 'koko', piles, h: g.int(piles.length, piles.length * 3) };
  }
  if (input.mode === 'ship') {
    const weights = Array.from({ length: g.int(5, 10) }, () => g.int(1, 15));
    return { mode: 'ship', weights, days: g.int(1, Math.min(5, weights.length)) };
  }
  let positions = [];
  while (positions.length < 2) positions = [...new Set(Array.from({ length: g.int(4, 8) }, () => g.int(0, 40)))];
  return { mode: 'cows', positions, m: g.int(2, Math.max(2, positions.length)) };
}
