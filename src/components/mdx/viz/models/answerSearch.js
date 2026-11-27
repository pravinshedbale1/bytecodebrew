/**
 * Binary search on the answer (model for <AnswerSearchViz>): search the range of possible answers,
 * running the problem's feasibility check at every probe. Pure, so scripts/viz-check.mjs can test it.
 */
import { list, parseInt1, parseInts, plural, rng } from './util.js';

export const ANSWER = {
  koko: { label: 'Koko: minimum speed', input: { mode: 'koko', piles: [3, 6, 7, 11], h: 8 } },
  ship: { label: 'Ship: minimum capacity', input: { mode: 'ship', weights: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], days: 5 } },
  cows: { label: 'Maximise the minimum gap', input: { mode: 'cows', positions: [1, 2, 4, 8, 9], m: 3 } },
  divisor: { label: 'Smallest divisor under a threshold', input: { mode: 'divisor', nums: [1, 2, 5, 9], threshold: 6 } },
  bloom: { label: 'Bouquets: earliest day', input: { mode: 'bloom', bloom: [1, 10, 3, 10, 2], m: 3, k: 1 } },
  trips: { label: 'Trips: minimum time', input: { mode: 'trips', time: [1, 2, 3], total: 5 } },
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
  divisor: [
    ['range', 'int lo = 1, hi = max(nums);                 // possible divisors'],
    ['loop', 'while (lo < hi) {'],
    ['mid', '    int d = lo + (hi - lo) / 2;'],
    ['check', '    long sum = 0; for (int v : nums) sum += (v + d - 1) / d;'],
    ['yes', '    if (sum <= threshold) hi = d;   // fits: maybe a smaller d fits too'],
    ['no', '    else lo = d + 1;              // sum too big, and bigger for smaller d'],
    ['close', '}'],
    ['ret', 'return lo;'],
  ],
  bloom: [
    ['range', 'int lo = min(bloom), hi = max(bloom);       // possible days (m · k ≤ n checked first)'],
    ['loop', 'while (lo < hi) {'],
    ['mid', '    int day = lo + (hi - lo) / 2;'],
    ['check', '    int made = bouquets(bloom, k, day);       // runs of k bloomed flowers'],
    ['yes', '    if (made >= m) hi = day;      // enough: maybe earlier works too'],
    ['no', '    else lo = day + 1;            // too early, and so is every earlier day'],
    ['close', '}'],
    ['ret', 'return lo;'],
  ],
  trips: [
    ['range', 'long lo = 1, hi = (long) min(time) * totalTrips;   // the fastest bus alone'],
    ['loop', 'while (lo < hi) {'],
    ['mid', '    long t = lo + (hi - lo) / 2;'],
    ['check', '    long done = 0; for (int x : time) done += t / x;'],
    ['yes', '    if (done >= totalTrips) hi = t;   // enough: maybe sooner works'],
    ['no', '    else lo = t + 1;              // not enough by t, nor by anything earlier'],
    ['close', '}'],
    ['ret', 'return lo;'],
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
  if (input.mode === 'divisor') {
    const per = input.nums.map((v) => Math.ceil(v / x));
    const sum = per.reduce((s, v) => s + v, 0);
    return { works: sum <= input.threshold, per, sum, summary: `sum ${sum} ${sum <= input.threshold ? '≤' : '>'} ${input.threshold}` };
  }
  if (input.mode === 'bloom') {
    const open = input.bloom.map((b) => b <= x);
    const groups = [];
    let run = 0;
    open.forEach((o, i) => {
      run = o ? run + 1 : 0;
      if (run === input.k) { groups.push([i - input.k + 1, i]); run = 0; }
    });
    return { works: groups.length >= input.m, open, groups, made: groups.length, summary: `${plural(groups.length, 'bouquet')} ${groups.length >= input.m ? '≥' : '<'} ${input.m}` };
  }
  if (input.mode === 'trips') {
    const per = input.time.map((t) => Math.floor(x / t));
    const done = per.reduce((s, v) => s + v, 0);
    return { works: done >= input.total, per, done, summary: `${plural(done, 'trip')} ${done >= input.total ? '≥' : '<'} ${input.total}` };
  }
  const pos = [...input.positions].sort((a, b) => a - b);
  const placed = [pos[0]];
  for (let k = 1; k < pos.length && placed.length < input.m; k++) if (pos[k] - placed.at(-1) >= x) placed.push(pos[k]);
  return { works: placed.length >= input.m, placed, summary: `${plural(placed.length, 'ball')} placed ${placed.length >= input.m ? '≥' : '<'} ${input.m}` };
}

function rangeOf(input) {
  if (input.mode === 'koko') return [1, Math.max(...input.piles)];
  if (input.mode === 'ship') return [Math.max(...input.weights), input.weights.reduce((s, v) => s + v, 0)];
  if (input.mode === 'divisor') return [1, Math.max(...input.nums)];
  if (input.mode === 'bloom') return [Math.min(...input.bloom), Math.max(...input.bloom)];
  if (input.mode === 'trips') return [1, Math.min(...input.time) * input.total];
  const pos = [...input.positions].sort((a, b) => a - b);
  return [1, pos.at(-1) - pos[0] + 1];
}

function describeCheck(input, x, c) {
  if (input.mode === 'koko') return `At speed ${x}: ${input.piles.map((p, k) => `⌈${p}/${x}⌉ = ${c.per[k]}`).join(', ')}. Total ${c.hours} hours, ${c.works ? 'within' : 'more than'} ${input.h}.`;
  if (input.mode === 'ship') {
    const groups = c.loads.map((ld, d) => `day ${d + 1}: ${list(input.weights.filter((_, k) => c.day[k] === d))} = ${ld}`);
    return `With capacity ${x}, load each day until the next package doesn't fit: ${groups.join('; ')}. That's ${plural(c.used, 'day')}, ${c.works ? 'within' : 'more than'} ${input.days}.`;
  }
  if (input.mode === 'divisor') return `Dividing by ${x} and rounding up: ${input.nums.map((v, k) => `⌈${v}/${x}⌉ = ${c.per[k]}`).join(', ')}. Sum ${c.sum}, ${c.works ? 'within' : 'over'} the threshold ${input.threshold}.`;
  if (input.mode === 'bloom') {
    const opened = input.bloom.map((b, i) => (c.open[i] ? i : -1)).filter((i) => i >= 0);
    return `By day ${x}, ${opened.length ? `flowers ${list(opened)} have bloomed` : 'no flower has bloomed'}. Walking left to right, every ${input.k} bloomed in a row make a bouquet: ${plural(c.made, 'bouquet')}, ${c.works ? `enough for ${input.m}` : `fewer than ${input.m}`}.`;
  }
  if (input.mode === 'trips') return `By time ${x}: ${input.time.map((t, k) => `⌊${x}/${t}⌋ = ${c.per[k]}`).join(', ')}. ${plural(c.done, 'trip')} in total, ${c.works ? 'enough for' : 'fewer than'} ${input.total}.`;
  return `With a minimum gap of ${x}, put a ball at the first position, then each next one at the first position at least ${x} further on: ${c.placed.join(', ')}. ${plural(c.placed.length, 'ball')}${c.works ? `, enough for ${input.m}` : `, fewer than ${input.m}`}.`;
}

const NOUN = { koko: 'speed', ship: 'capacity', cows: 'gap', divisor: 'divisor', bloom: 'day', trips: 'time' };

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
    divisor: `Possible divisors go from 1 to the largest number, ${hi0} (beyond that every term is already 1). A bigger divisor never makes the rounded-up sum bigger: ✗ … ✗, ✓ … ✓. Find the first ✓.`,
    bloom: `The answer is a day between the first bloom, ${lo0}, and the last, ${hi0} (by then every flower is open). Waiting longer never gives fewer bouquets: ✗ … ✗, ✓ … ✓. Find the first ✓.`,
    trips: `Possible times go from 1 to ${hi0}: the fastest bus alone finishes all ${input.total} trips by then. More time never means fewer trips: ✗ … ✗, ✓ … ✓. Find the first ✓.`,
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
    answer: input.mode === 'cows' ? `largest minimum gap = ${ans}` : `${noun} = ${ans}`,
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
  if (input.mode === 'divisor') {
    const a = parseInts(values.nums, { min: 1, max: 40, minLen: 1, maxLen: 8, name: 'nums' });
    if (a.error) return a;
    const t = parseInt1(values.threshold, { min: a.arr.length, max: 200, name: 'threshold' });
    return t.error ? { error: `threshold must be between ${a.arr.length} (one per number at least) and 200.` } : { input: { mode: 'divisor', nums: a.arr, threshold: t.v } };
  }
  if (input.mode === 'bloom') {
    const a = parseInts(values.bloom, { min: 1, max: 30, minLen: 1, maxLen: 10, name: 'bloom days' });
    if (a.error) return a;
    const k = parseInt1(values.k, { min: 1, max: a.arr.length, name: 'k' });
    if (k.error) return k;
    const m = parseInt1(values.m, { min: 1, max: Math.floor(a.arr.length / k.v), name: 'm' });
    return m.error ? { error: `m must be between 1 and ${Math.floor(a.arr.length / k.v)} (m · k flowers are needed).` } : { input: { mode: 'bloom', bloom: a.arr, m: m.v, k: k.v } };
  }
  if (input.mode === 'trips') {
    const a = parseInts(values.time, { min: 1, max: 9, minLen: 1, maxLen: 6, name: 'time' });
    if (a.error) return a;
    const t = parseInt1(values.total, { min: 1, max: 30, name: 'totalTrips' });
    return t.error ? t : { input: { mode: 'trips', time: a.arr, total: t.v } };
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
  if (input.mode === 'divisor') {
    const nums = Array.from({ length: g.int(3, 7) }, () => g.int(1, 40));
    return { mode: 'divisor', nums, threshold: g.int(nums.length, nums.length * 4) };
  }
  if (input.mode === 'bloom') {
    const bloom = Array.from({ length: g.int(4, 10) }, () => g.int(1, 30));
    const k = g.int(1, 3);
    return { mode: 'bloom', bloom, k, m: g.int(1, Math.max(1, Math.floor(bloom.length / k))) };
  }
  if (input.mode === 'trips') {
    const time = Array.from({ length: g.int(1, 5) }, () => g.int(1, 9));
    return { mode: 'trips', time, total: g.int(1, 30) };
  }
  let positions = [];
  while (positions.length < 2) positions = [...new Set(Array.from({ length: g.int(4, 8) }, () => g.int(0, 40)))];
  return { mode: 'cows', positions, m: g.int(2, Math.max(2, positions.length)) };
}
