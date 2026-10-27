#!/usr/bin/env node
/**
 * Checks the models behind the step-throughs (src/components/mdx/viz/models): on each lesson
 * example and on random inputs, every step is complete and names real code lines, the step sequence
 * follows the code (a check before a store, a plan before its swap…), nothing is lost, and the final
 * answer matches brute force. The Pair Sum check also proves every pair it rules out really is not
 * an answer. The HLD models are checked against the same arithmetic done independently (estimates,
 * round trips, load-balancer picks, B+tree invariants, Bloom filters, ring ownership…).
 * Part of `npm run check`.
 */
import * as cyc from '../src/components/mdx/viz/models/cyclicSort.js';
import * as hash from '../src/components/mdx/viz/models/hashing.js';
import * as tp from '../src/components/mdx/viz/models/twoPointers.js';
import * as sw from '../src/components/mdx/viz/models/slidingWindow.js';
import * as ps from '../src/components/mdx/viz/models/prefixSums.js';
import * as iv from '../src/components/mdx/viz/models/intervals.js';
import * as bs from '../src/components/mdx/viz/models/binarySearch.js';
import * as as from '../src/components/mdx/viz/models/answerSearch.js';
import * as sel from '../src/components/mdx/viz/models/selection.js';
import * as ll from '../src/components/mdx/viz/models/linkedList.js';
import * as stk from '../src/components/mdx/viz/models/stacks.js';
import * as hp from '../src/components/mdx/viz/models/heaps.js';
import * as tr from '../src/components/mdx/viz/models/trees.js';
import * as gr from '../src/components/mdx/viz/models/graphs.js';
import * as bt from '../src/components/mdx/viz/models/backtracking.js';
import * as dp from '../src/components/mdx/viz/models/dp.js';
import * as sp from '../src/components/mdx/viz/models/special.js';
import * as adv from '../src/components/mdx/viz/models/advanced.js';
import * as hf from '../src/components/mdx/viz/models/hldFoundations.js';
import * as hs from '../src/components/mdx/viz/models/hldScaling.js';
import * as st from '../src/components/mdx/viz/models/hldStorage.js';
import * as hd from '../src/components/mdx/viz/models/hldDistributed.js';

let checks = 0;
const ok = (c, msg) => { if (!c) throw new Error(`✗ ${msg}`); checks++; };
let seed = 20261027;
const rand = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const sorted = (a) => [...a].sort((x, y) => x - y);

/** Shared checks on any run. */
function common(name, steps, code, kinds) {
  const keys = new Set(code.map(([k]) => k));
  ok(steps.length >= 2, `${name}: too few steps`);
  steps.forEach((s, k) => {
    ok(typeof s.title === 'string' && s.title.length > 3, `${name} step ${k}: no title`);
    ok(typeof s.text === 'string' && s.text.length > 20, `${name} step ${k}: no explanation`);
    ok(Array.isArray(s.calc) && s.calc.length > 0, `${name} step ${k}: no check lines`);
    ok(Array.isArray(s.lines), `${name} step ${k}: no code lines`);
    for (const l of s.lines) ok(keys.has(l), `${name} step ${k}: unknown code line ${l}`);
    ok(kinds.includes(s.kind), `${name} step ${k}: unknown kind ${s.kind}`);
    ok(!/undefined|NaN|\[object/.test(s.title + s.text + s.calc.join(' ')), `${name} step ${k}: broken text: ${s.title} | ${s.text}`);
  });
  ok(steps.at(-1).answer, `${name}: the last step has no answer`);
}

// ---------------------------------------------------------------- cyclic sort
{
  const kinds = ['start', 'plan', 'swapped', 'athome', 'spare', 'nohome', 'placed', 'scan', 'done'];
  const run = (arr, range) => {
    const steps = cyc.simulate(arr, range);
    const n = arr.length;
    const distinct = new Set(arr).size === n;
    common(`cyclic ${range} ${arr}`, steps, cyc.codeFor(range, range !== 'one' || !distinct), kinds);
    steps.forEach((s, k) => {
      ok(same(sorted(s.cells.map((c) => c.v)), sorted(arr)), 'cyclic: values preserved');
      if (s.kind === 'plan') {
        const nx = steps[k + 1];
        ok(nx.kind === 'swapped' && nx.swaps === s.swaps + 1, 'cyclic: a plan is followed by its swap');
        ok(nx.swap.up === s.cells[s.arrows[0].from].id && nx.swap.down === s.cells[s.arrows[0].to].id, 'cyclic: swap ids');
      }
    });
    const last = steps.at(-1);
    const set = new Set(arr);
    if (range === 'one' && distinct) ok(last.cells.every((c, k) => c.v === k + 1), 'cyclic: sorted');
    if (range === 'one' && !distinct) {
      const missing = []; for (let v = 1; v <= n; v++) if (!set.has(v)) missing.push(v);
      ok(last.answer.startsWith(`missing [${missing.join(', ')}]`), `cyclic missing for ${arr}`);
    }
    if (range === 'zero') { let w = 0; while (set.has(w)) w++; ok(last.answer === `missing number = ${w}`, `cyclic zero ${arr}`); }
    if (range === 'positive') { let w = 1; while (set.has(w)) w++; ok(last.answer === `first missing positive = ${w}`, `cyclic positive ${arr}`); }
    ok(last.swaps <= n, 'cyclic: swap bound');
  };
  for (const ex of Object.values(cyc.EXAMPLES)) run(ex.input.arr, ex.input.range);
  for (let t = 0; t < 600; t++) for (const range of ['one', 'zero', 'positive']) {
    const arr = cyc.randomInput(range, rand);
    ok(!cyc.parseInput(arr.join(', '), range).error, 'cyclic random parses');
    run(arr, range);
  }
  ok(cyc.parseInput('5, 1', 'one').error && cyc.parseInput('1, 1, 2', 'zero').error, 'cyclic parse errors');
}

// ---------------------------------------------------------------- hashing
{
  const run = (input) => {
    const steps = hash.twoSum(input);
    common(`twoSum ${JSON.stringify(input)}`, steps, hash.twoSumCode, ['start', 'miss', 'store', 'found', 'none']);
    steps.forEach((s, k) => { if (s.kind === 'miss') ok(steps[k + 1].kind === 'store' && steps[k + 1].i === s.i, 'twoSum: check, then store'); });
    const { nums, target } = input;
    let first = null;
    for (let i = 0; i < nums.length && !first; i++) for (let j = 0; j < i; j++) if (nums[j] + nums[i] === target) { first = i; break; }
    const last = steps.at(-1);
    if (first === null) ok(last.kind === 'none', `twoSum: no pair for ${JSON.stringify(input)}`);
    else {
      ok(last.kind === 'found' && last.pair[1] === first && nums[last.pair[0]] + nums[last.pair[1]] === target && last.pair[0] < last.pair[1], `twoSum pair for ${JSON.stringify(input)}`);
    }
  };
  for (const ex of Object.values(hash.TWO_SUM)) run(ex.input);
  for (let t = 0; t < 1500; t++) {
    const input = hash.randomTwoSum(rand);
    ok(same(hash.parseTwoSum({ nums: input.nums.join(', '), target: String(input.target) }).input, input), 'twoSum parse round trip');
    run(input);
  }
  const runC = (input) => {
    const steps = hash.consecutive(input);
    common(`consecutive ${input.nums}`, steps, hash.consecutiveCode, ['build', 'skip', 'start', 'walk', 'end', 'done']);
    const set = new Set(input.nums);
    let best = 0;
    for (const x of set) { let len = 0; while (set.has(x + len)) len++; if (!set.has(x - 1)) best = Math.max(best, len); }
    ok(steps.at(-1).answer === `longest = ${best}`, `consecutive answer for ${input.nums}`);
    ok(steps.at(-1).lookups <= 2 * set.size, 'consecutive: O(n) lookups');
  };
  for (const ex of Object.values(hash.CONSECUTIVE)) runC(ex.input);
  for (let t = 0; t < 1500; t++) runC(hash.randomConsecutive(rand));
}

// ---------------------------------------------------------------- two pointers
{
  const runP = (input) => {
    const steps = tp.pairSum(input);
    common(`pairSum ${JSON.stringify(input)}`, steps, tp.pairSumCode, ['start', 'small', 'big', 'found', 'none']);
    const { nums: a, target } = input;
    for (const s of steps) for (const key of s.out) { const [i, j] = key.split(',').map(Number); ok(i < j && a[i] + a[j] !== target, `pairSum ruled out a real answer (${i}, ${j}) in ${JSON.stringify(input)}`); }
    let exists = false;
    for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) if (a[i] + a[j] === target) exists = true;
    const last = steps.at(-1);
    ok(exists ? last.kind === 'found' && a[last.L] + a[last.R] === target : last.kind === 'none', `pairSum result for ${JSON.stringify(input)}`);
  };
  for (const ex of Object.values(tp.PAIR_SUM)) runP(ex.input);
  for (let t = 0; t < 1500; t++) runP(tp.randomPairSum(rand));

  const runW = (input) => {
    const steps = tp.container(input);
    common(`container ${input.heights}`, steps, tp.containerCode, ['start', 'measure', 'done']);
    const h = input.heights;
    let best = 0;
    for (let i = 0; i < h.length; i++) for (let j = i + 1; j < h.length; j++) best = Math.max(best, Math.min(h[i], h[j]) * (j - i));
    ok(steps.at(-1).answer === `most water = ${best}`, `container answer for ${h}`);
    ok(steps.filter((s) => s.kind === 'measure').length === h.length - 1, 'container: n − 1 measurements');
  };
  for (const ex of Object.values(tp.CONTAINER)) runW(ex.input);
  for (let t = 0; t < 1500; t++) runW(tp.randomContainer(rand));

  const runR = (input) => {
    const steps = tp.readWrite(input);
    common(`readWrite ${JSON.stringify(input)}`, steps, tp.readWriteCode[input.mode], ['start', 'skip', 'plan', 'self', 'copied', 'swapped', 'done']);
    const last = steps.at(-1);
    if (input.mode === 'dedupe') {
      const d = [...new Set(input.nums)];
      ok(last.write === d.length && same(last.cells.slice(0, d.length).map((c) => c.v), d), `dedupe for ${input.nums}`);
    } else {
      const want = [...input.nums.filter((x) => x !== 0), ...input.nums.filter((x) => x === 0)];
      ok(same(last.cells.map((c) => c.v), want), `zeroes for ${input.nums}`);
      steps.forEach((s, k) => { if (s.kind === 'plan') ok(steps[k + 1].kind === 'swapped', 'zeroes: plan then swap'); });
    }
  };
  for (const ex of Object.values(tp.READ_WRITE)) runR(ex.input);
  for (let t = 0; t < 1500; t++) for (const mode of ['dedupe', 'zeroes']) runR(tp.randomReadWrite({ mode }, rand));

  const runD = (input) => {
    const steps = tp.dutchFlag(input);
    common(`dutch ${input.nums}`, steps, tp.dutchCode, ['start', 'one', 'zeroSelf', 'planZero', 'twoSelf', 'planTwo', 'swapped', 'done']);
    ok(same(steps.at(-1).cells.map((c) => c.v), sorted(input.nums)), `dutch sorted ${input.nums}`);
    for (const s of steps) {
      const v = s.cells.map((c) => c.v);
      ok(v.slice(0, s.low).every((x) => x === 0) && v.slice(s.low, s.mid).every((x) => x === 1) && v.slice(s.high + 1).every((x) => x === 2), `dutch regions hold in ${input.nums}`);
    }
  };
  for (const ex of Object.values(tp.DUTCH)) runD(ex.input);
  for (let t = 0; t < 1500; t++) runD(tp.randomDutch(rand));
}

// ---------------------------------------------------------------- sliding window
{
  const kinds = ['start', 'expand', 'invalid', 'shrink', 'fixed', 'valid', 'record', 'build', 'slide', 'done'];
  const run = (input) => {
    const steps = sw.slidingWindow(input);
    common(`window ${JSON.stringify(input)}`, steps, sw.windowCode[input.mode], kinds);
    const ans = steps.at(-1).answer;
    if (input.mode === 'longest') {
      const s = input.s;
      let best = 0;
      for (let i = 0; i < s.length; i++) for (let j = i; j < s.length; j++) if (new Set(s.slice(i, j + 1)).size === j - i + 1) best = Math.max(best, j - i + 1);
      ok(ans.startsWith(`longest = ${best}`), `longest for ${s}: ${ans}`);
      for (const st of steps) if (st.R >= st.L && (st.kind === 'expand' || st.kind === 'fixed')) ok(new Set(s.slice(st.L, st.R + 1)).size === st.R - st.L + 1, 'longest: recorded windows are valid');
    } else if (input.mode === 'shortest') {
      const a = input.nums;
      let best = 0;
      for (let i = 0; i < a.length; i++) { let sum = 0; for (let j = i; j < a.length; j++) { sum += a[j]; if (sum >= input.target) { if (!best || j - i + 1 < best) best = j - i + 1; break; } } }
      ok(ans === `shortest = ${best}`, `shortest for ${JSON.stringify(input)}: ${ans}`);
      for (const st of steps) if (st.R >= st.L && st.kind !== 'done' && st.kind !== 'start') ok(st.sum === a.slice(st.L, st.R + 1).reduce((x, y) => x + y, 0), 'shortest: running sum matches the window');
    } else {
      const a = input.nums, k = input.k;
      let best = -Infinity;
      for (let i = 0; i + k <= a.length; i++) best = Math.max(best, a.slice(i, i + k).reduce((x, y) => x + y, 0));
      ok(ans === `max sum = ${best}`, `fixed for ${JSON.stringify(input)}: ${ans}`);
    }
  };
  for (const ex of Object.values(sw.WINDOW)) run(ex.input);
  for (let t = 0; t < 1500; t++) for (const mode of ['longest', 'shortest', 'fixed']) run(sw.randomWindow({ mode }, rand));
  ok(sw.parseWindow({ s: 'ABC' }, { mode: 'longest' }).input?.s === 'abc', 'window parse lowercases');
  ok(sw.parseWindow({ nums: '1, 2', k: '3' }, { mode: 'fixed' }).error, 'window parse: k too big');
}

// ---------------------------------------------------------------- prefix sums
{
  const runQ = (input) => {
    const steps = ps.prefixQuery(input);
    common(`prefixQuery ${JSON.stringify(input)}`, steps, ps.prefixQueryCode, ['start', 'build', 'whole', 'extra', 'done']);
    const want = input.nums.slice(input.l, input.r + 1).reduce((x, y) => x + y, 0);
    ok(steps.at(-1).answer === `sum(a[${input.l}..${input.r}]) = ${want}`, `prefixQuery ${JSON.stringify(input)}`);
    steps.at(-1).p.forEach((v, k) => ok(v === input.nums.slice(0, k).reduce((x, y) => x + y, 0), 'prefixQuery: p is right'));
  };
  for (const ex of Object.values(ps.PREFIX_QUERY)) runQ(ex.input);
  for (let t = 0; t < 1500; t++) runQ(ps.randomPrefixQuery(rand));

  const runK = (input) => {
    const steps = ps.subarrayK(input);
    common(`subarrayK ${JSON.stringify(input)}`, steps, ps.subarrayKCode, ['start', 'miss', 'hit', 'store', 'done']);
    const a = input.nums, want = [];
    for (let j = 0; j < a.length; j++) for (let i = j; i < a.length; i++) if (a.slice(j, i + 1).reduce((x, y) => x + y, 0) === input.k) want.push(`${j}-${i}`);
    const last = steps.at(-1);
    ok(last.answer === `count = ${want.length}`, `subarrayK count for ${JSON.stringify(input)}`);
    ok(same(last.found.map(([j, i]) => `${j}-${i}`).sort(), [...want].sort()), `subarrayK: every bracketed subarray is real, none missed (${JSON.stringify(input)})`);
    steps.forEach((s, k) => { if (s.kind === 'miss' || s.kind === 'hit') ok(steps[k + 1].kind === 'store', 'subarrayK: check, then store'); });
  };
  for (const ex of Object.values(ps.SUBARRAY_K)) runK(ex.input);
  for (let t = 0; t < 1500; t++) runK(ps.randomSubarrayK(rand));

  const runD = (input) => {
    const steps = ps.difference(input);
    common(`difference ${JSON.stringify(input)}`, steps, ps.differenceCode, ['start', 'mark', 'sweep', 'done']);
    const out = new Array(input.n).fill(0);
    for (const [l, r, v] of input.updates) for (let i = l; i <= r; i++) out[i] += v;
    ok(steps.at(-1).answer === `out = [${out.join(', ')}]`, `difference ${JSON.stringify(input)}`);
  };
  for (const ex of Object.values(ps.DIFFERENCE)) runD(ex.input);
  for (let t = 0; t < 1500; t++) {
    const input = ps.randomDifference(rand);
    ok(same(ps.parseDifference({ n: String(input.n), updates: input.updates.map((x) => x.join(' ')).join('; ') }).input, input), 'difference parse round trip');
    runD(input);
  }
}

// ---------------------------------------------------------------- intervals
{
  const kinds = ['start', 'sort', 'add', 'extend', 'inside', 'gap', 'keep', 'remove', 'done'];
  const run = (input) => {
    const steps = iv.intervals(input);
    common(`intervals ${JSON.stringify(input)}`, steps, iv.intervalsCode[input.mode], kinds);
    const list = input.list;
    if (input.mode === 'merge') {
      const s = [...list].sort((a, b) => a[0] - b[0]);
      const out = [];
      for (const [a, b] of s) { if (out.length && a <= out.at(-1)[1]) out.at(-1)[1] = Math.max(out.at(-1)[1], b); else out.push([a, b]); }
      ok(steps.at(-1).answer === `merged = ${out.map(([a, b]) => `[${a}, ${b}]`).join(', ')}`, `merge ${JSON.stringify(list)}`);
    } else {
      let keepMax = 0;
      for (let mask = 0; mask < 1 << list.length; mask++) {
        const pick = list.filter((_, k) => mask & (1 << k)).sort((a, b) => a[0] - b[0]);
        if (pick.every((x, k) => k === 0 || pick[k - 1][1] <= x[0])) keepMax = Math.max(keepMax, pick.length);
      }
      ok(steps.at(-1).answer === `remove ${list.length - keepMax}`, `erase ${JSON.stringify(list)}: ${steps.at(-1).answer} vs ${list.length - keepMax}`);
    }
  };
  for (const ex of Object.values(iv.INTERVALS)) run(ex.input);
  for (let t = 0; t < 1500; t++) for (const mode of ['merge', 'erase']) run(iv.randomIntervals({ mode }, rand));

  const runR = (input) => {
    const steps = iv.meetingRooms(input);
    common(`rooms ${JSON.stringify(input)}`, steps, iv.roomsCode, ['start', 'free', 'take', 'done']);
    let best = 0;
    for (const [t] of input.list) best = Math.max(best, input.list.filter(([s, e]) => s <= t && t < e).length);
    ok(steps.at(-1).answer === `rooms = ${best}`, `rooms ${JSON.stringify(input.list)}`);
    for (const s of steps) if (s.kind === 'take') ok(Object.values(s.status).filter((v) => v === 'on').length === s.rooms, 'rooms: highlighted meetings match the count');
  };
  for (const ex of Object.values(iv.ROOMS)) runR(ex.input);
  for (let t = 0; t < 1500; t++) runR(iv.randomRooms(rand));
  ok(iv.parseIntervals('1-3,2').error && iv.parseIntervals('3-3', { strict: true }).error, 'interval parse errors');
}

// ---------------------------------------------------------------- binary search
{
  const run = (input) => {
    const steps = bs.firstTrue(input);
    common(`firstTrue ${JSON.stringify(input)}`, steps, bs.firstTrueCode(input), ['start', 'true', 'false', 'done']);
    const sp = bs.searchSpace(input);
    const last = steps.at(-1);
    // the probes and the answer
    for (const st of steps) for (const [k, v] of Object.entries(st.known)) ok(v === sp.ok(Number(k)), 'firstTrue: recorded conditions are right');
    ok(last.probes <= Math.ceil(Math.log2(sp.hi + 1)), `firstTrue: at most ⌈log₂(n + 1)⌉ probes (${JSON.stringify(input)})`);
    const at = last.at;
    if (input.mode === 'peak') {
      const a = input.nums;
      ok((at === 0 || a[at] > a[at - 1]) && (at === a.length - 1 || a[at] > a[at + 1]), `peak is a peak (${JSON.stringify(input)})`);
    } else {
      let want = 0; while (want < sp.hi && !sp.ok(want)) want++;
      ok(at === want, `firstTrue answer for ${JSON.stringify(input)}: ${at} vs ${want}`);
    }
    if (input.mode === 'sqrt') ok(last.answer === `⌊√${input.x}⌋ = ${Math.floor(Math.sqrt(input.x))}`, `sqrt ${input.x}`);
    if (input.mode === 'rotmin') ok(last.answer === `min = ${Math.min(...input.nums)}`, `rotmin ${input.nums}`);
  };
  for (const ex of Object.values(bs.FIRST_TRUE)) run(ex.input);
  for (let t = 0; t < 1200; t++) for (const mode of ['lower', 'upper', 'sqrt', 'rotmin', 'peak']) run(bs.randomFirstTrue({ mode }, rand));
  const runR = (input) => {
    const steps = bs.rotatedSearch(input);
    common(`rotated ${JSON.stringify(input)}`, steps, bs.rotatedCode, ['start', 'left', 'right', 'found', 'none']);
    const want = input.nums.indexOf(input.target);
    ok(steps.at(-1).answer === (want < 0 ? 'not found (−1)' : `index ${want}`), `rotated ${JSON.stringify(input)}`);
  };
  for (const ex of Object.values(bs.ROTATED)) runR(ex.input);
  for (let t = 0; t < 2000; t++) runR(bs.randomRotated(rand));
  ok(bs.parseRotated({ nums: '4, 5, 1, 7', target: '1' }).error && !bs.parseRotated({ nums: '4, 5, 1, 2', target: '1' }).error, 'rotated parse');
}

// ---------------------------------------------------------------- binary search on the answer
{
  const run = (input) => {
    const steps = as.answerSearch(input);
    common(`answer ${JSON.stringify(input)}`, steps, as.answerCode[input.mode], ['start', 'works', 'fails', 'done']);
    let want;
    if (input.mode === 'koko') { want = 1; while (input.piles.reduce((s, p) => s + Math.ceil(p / want), 0) > input.h) want++; }
    else if (input.mode === 'ship') {
      want = Math.max(...input.weights);
      const days = (cap) => { let d = 1, ld = 0; for (const w of input.weights) { if (ld + w > cap) { d++; ld = 0; } ld += w; } return d; };
      while (days(want) > input.days) want++;
    } else {
      const pos = [...input.positions].sort((a, b) => a - b);
      // brute force over every subset of m positions: the best minimum gap
      want = 0;
      const pick = (start, chosen) => {
        if (chosen.length === input.m) { let g = Infinity; for (let k = 1; k < chosen.length; k++) g = Math.min(g, chosen[k] - chosen[k - 1]); want = Math.max(want, g); return; }
        for (let k = start; k < pos.length; k++) pick(k + 1, [...chosen, pos[k]]);
      };
      pick(0, []);
    }
    const last = steps.at(-1);
    ok(last.answer.endsWith(`= ${want}`), `answer search ${JSON.stringify(input)}: ${last.answer} vs ${want}`);
    for (const st of steps) if (st.kind === 'works' || st.kind === 'fails') ok(as.check(input, st.mid).works === (st.kind === 'works'), 'answer: check result recorded');
  };
  for (const ex of Object.values(as.ANSWER)) run(ex.input);
  for (let t = 0; t < 1200; t++) for (const mode of ['koko', 'ship', 'cows']) run(as.randomAnswer({ mode }, rand));
}

// ---------------------------------------------------------------- sorting as a tool
{
  const run = (input) => {
    const steps = sel.quickselect(input);
    common(`quickselect ${JSON.stringify(input)}`, steps, sel.quickselectCode, ['start', 'park', 'grow', 'swap', 'skip', 'place', 'side', 'done']);
    const sorted = [...input.nums].sort((a, b) => a - b);
    ok(steps.at(-1).answer.endsWith(`= ${sorted[input.nums.length - input.k]}`), `quickselect ${JSON.stringify(input)}`);
    for (const st of steps) {
      ok(same([...st.cells.map((c) => c.v)].sort((a, b) => a - b), sorted), 'quickselect: values preserved');
      for (const k of st.final) ok(st.cells[k].v === sorted[k], 'quickselect: ✓ cells are in their sorted place');
    }
  };
  for (const ex of Object.values(sel.QUICKSELECT)) run(ex.input);
  for (let t = 0; t < 2000; t++) run(sel.randomQuickselect(rand));
  const runB = (input) => {
    const steps = sel.buckets(input);
    common(`buckets ${JSON.stringify(input)}`, steps, sel.bucketCode[input.mode], ['start', 'count', 'empty', 'write', 'bucket', 'take', 'done']);
    const last = steps.at(-1);
    if (input.mode === 'counting') ok(last.answer === `[${[...input.nums].sort((a, b) => a - b).join(', ')}]`, `counting ${input.nums}`);
    else {
      const freq = new Map(); for (const x of input.nums) freq.set(x, (freq.get(x) ?? 0) + 1);
      const counts = [...freq.values()].sort((a, b) => b - a).slice(0, input.k);
      const got = last.out.map((v) => freq.get(v)).sort((a, b) => b - a);
      ok(last.out.length === input.k && same(got, counts), `topk ${JSON.stringify(input)}`);
    }
  };
  for (const ex of Object.values(sel.BUCKETS)) runB(ex.input);
  for (let t = 0; t < 2000; t++) for (const mode of ['counting', 'topk']) runB(sel.randomBuckets({ mode }, rand));
}

// ---------------------------------------------------------------- linked lists
{
  /** Every step's pointer map is a real list: the named pointers exist, and following next never loses a node it shouldn't. */
  const sane = (name, st) => {
    const ids = new Set(st.nodes.map((n) => n.id));
    for (const [from, to] of Object.entries(st.next)) ok(ids.has(from) && (to === null || ids.has(to)), `${name}: next points at a real node`);
    for (const id of Object.values(st.ptrs ?? {})) ok(id === null || ids.has(id), `${name}: pointers point at real nodes`);
  };
  const runF = (input) => {
    const steps = ll.fastSlow(input);
    common(`fastSlow ${JSON.stringify(input)}`, steps, ll.fastSlowCode[input.mode], ['start', 'move', 'meet', 'phase2', 'walk', 'found', 'none', 'done', 'gap', 'both', 'unlink']);
    steps.forEach((st) => sane('fastSlow', st));
    const last = steps.at(-1);
    if (input.mode === 'cycle') ok(last.answer === (input.pos < 0 ? 'no cycle' : `cycle starts at node ${input.vals[input.pos]} (index ${input.pos})`), `cycle ${JSON.stringify(input)}: ${last.answer}`);
    if (input.mode === 'middle') ok(last.answer === `middle = ${input.vals[Math.floor(input.vals.length / 2)]}`, `middle ${input.vals}`);
    if (input.mode === 'nth') { const want = [...input.vals]; want.splice(input.vals.length - input.n, 1); ok(last.answer === `[${want.join(', ')}]`, `nth ${JSON.stringify(input)}`); }
  };
  for (const ex of Object.values(ll.FAST_SLOW)) runF(ex.input);
  for (let t = 0; t < 1500; t++) for (const mode of ['cycle', 'middle', 'nth']) runF(ll.randomFastSlow({ mode }, rand));
  for (let n = 1; n <= 9; n++) for (let pos = -1; pos < n; pos++) runF({ mode: 'cycle', vals: Array.from({ length: n }, (_, k) => k + 1), pos });

  const runR = (input) => {
    const steps = ll.reverse(input);
    common(`reverse ${JSON.stringify(input)}`, steps, ll.reverseCode[input.mode], ['start', 'save', 'flip', 'adv', 'walk', 'cur', 'take', 'relink', 'done']);
    steps.forEach((st) => sane('reverse', st));
    let want = [...input.vals];
    if (input.mode === 'whole') want.reverse();
    else want = [...want.slice(0, input.left - 1), ...want.slice(input.left - 1, input.right).reverse(), ...want.slice(input.right)];
    ok(steps.at(-1).answer === `[${want.join(', ')}]`, `reverse ${JSON.stringify(input)}: ${steps.at(-1).answer}`);
  };
  for (const ex of Object.values(ll.REVERSE)) runR(ex.input);
  for (let t = 0; t < 1500; t++) for (const mode of ['whole', 'between']) runR(ll.randomReverse({ mode }, rand));

  const runD = (input) => {
    const steps = ll.dummy(input);
    common(`dummy ${JSON.stringify(input)}`, steps, ll.dummyCode[input.mode], ['start', 'unlink', 'adv', 'takeA', 'takeB', 'rest', 'done']);
    steps.forEach((st) => sane('dummy', st));
    const want = input.mode === 'remove' ? input.vals.filter((v) => v !== input.val) : [...input.a, ...input.b].sort((x, y) => x - y);
    ok(steps.at(-1).answer === `[${want.join(', ')}]`, `dummy ${JSON.stringify(input)}: ${steps.at(-1).answer}`);
  };
  for (const ex of Object.values(ll.DUMMY)) runD(ex.input);
  for (let t = 0; t < 1500; t++) for (const mode of ['remove', 'merge']) runD(ll.randomDummy({ mode }, rand));
}

// ---------------------------------------------------------------- stacks and monotonic stacks
{
  const runBr = (s) => {
    const steps = stk.brackets({ s });
    common(`brackets ${s}`, steps, stk.bracketsCode, ['start', 'push', 'match', 'fail', 'valid']);
    ok(steps.at(-1).answer.startsWith('valid') === stk.isValidBrackets(s), `brackets ${s}: verdict`);
    for (const x of steps) for (const [o, c] of x.pairs) ok(o < c && stk.CLOSER[s[o]] === s[c], `brackets ${s}: pairs match`);
  };
  for (const e of Object.values(stk.BRACKETS)) runBr(e.input.s);
  const alpha = '()[]{}';
  for (let t = 0; t < 4000; t++) { const n = 1 + Math.floor(rand() * 10); runBr(Array.from({ length: n }, () => alpha[Math.floor(rand() * 6)]).join('')); }
  for (let t = 0; t < 300; t++) { const r = stk.randomBrackets(rand); ok(stk.parseBrackets({ s: r.s }).input, 'brackets: random input parses'); runBr(r.s); }
  ok(stk.parseBrackets({ s: '(a)' }).error, 'brackets: letters refused');

  const runAs = (a) => {
    const steps = stk.asteroids({ a });
    common(`asteroids ${a}`, steps, stk.asteroidCode, ['start', 'push', 'boom', 'done']);
    ok(same(steps.at(-1).stack.map((id) => a[id]), stk.asteroidAnswer(a)), `asteroids ${a}: survivors`);
  };
  for (const e of Object.values(stk.ASTEROIDS)) runAs(e.input.a);
  for (let t = 0; t < 3000; t++) runAs(stk.randomAsteroids(rand).a);

  for (const mode of ['nge', 'temps', 'nse']) {
    const runMo = (a) => {
      const steps = stk.mono({ mode, a });
      common(`mono ${mode} ${a}`, steps, stk.monoCode(mode), ['start', 'pop', 'push', 'done']);
      ok(same(steps.at(-1).ans, stk.monoAnswer({ mode, a })), `mono ${mode} ${a}: answers`);
      for (const x of steps) ok(x.stack.every((k, j) => j === 0 || (mode === 'nse' ? a[k] >= a[x.stack[j - 1]] : a[k] <= a[x.stack[j - 1]])), `mono ${mode}: the stack stays monotonic`);
    };
    for (const e of Object.values(stk.MONO)) if (e.input.mode === mode) runMo(e.input.a);
    for (let t = 0; t < 1500; t++) runMo(stk.randomMono({ mode }, rand).a);
  }

  const runHi = (h) => {
    const steps = stk.histogram({ h });
    common(`histogram ${h}`, steps, stk.histogramCode, ['start', 'push', 'pop', 'done']);
    ok(steps.at(-1).best === stk.histogramAnswer(h), `histogram ${h}: best area`);
    for (const x of steps) ok(x.stack.every((k, j) => j === 0 || h[k] > h[x.stack[j - 1]]), 'histogram: heights strictly increase on the stack');
  };
  for (const e of Object.values(stk.HISTOGRAM)) runHi(e.input.h);
  for (let t = 0; t < 3000; t++) runHi(Array.from({ length: 1 + Math.floor(rand() * 9) }, () => Math.floor(rand() * 13)));

  const runSl = (a, k) => {
    const steps = stk.slide({ a, k });
    common(`slide ${a} k=${k}`, steps, stk.slideCode, ['start', 'front', 'back', 'push', 'out', 'done']);
    ok(same(steps.at(-1).out, stk.slideAnswer({ a, k })), `slide ${a} k=${k}: maxima`);
    for (const x of steps) ok(x.dq.every((i, j) => j === 0 || a[i] < a[x.dq[j - 1]]), 'slide: deque values strictly decrease');
  };
  for (const e of Object.values(stk.SLIDE)) runSl(e.input.a, e.input.k);
  for (let t = 0; t < 3000; t++) { const r = stk.randomSlide(rand); runSl(r.a, r.k); }
}

// ---------------------------------------------------------------- heaps
{
  const runTk = (a, k) => {
    const steps = hp.topK({ a, k });
    common(`topk ${a} k=${k}`, steps, hp.topKCode, ['start', 'offer', 'up', 'evict', 'down', 'done']);
    const last = steps.at(-1);
    ok(last.heap.length === Math.min(k, a.length) && hp.isMinHeap(last.heap), `topk ${a}: a valid heap of size k`);
    ok(last.heap[0].v === [...a].sort((x, y) => y - x)[k - 1], `topk ${a} k=${k}: k-th largest`);
    steps.forEach((x, j) => { if (steps[j + 1] && !['up', 'down'].includes(steps[j + 1].kind) && x.kind !== 'start') ok(hp.isMinHeap(x.heap), `topk ${a}: heap valid once a sift ends`); });
  };
  for (const e of Object.values(hp.TOPK)) runTk(e.input.a, e.input.k);
  for (let t = 0; t < 2000; t++) { const r = hp.randomTopK(rand); runTk(r.a, r.k); }

  const runKw = (lists) => {
    const steps = hp.kway({ lists });
    common(`kway ${JSON.stringify(lists)}`, steps, hp.kwayCode, ['start', 'init', 'take', 'done']);
    ok(same(steps.at(-1).out.map((o) => o.v), lists.flat().sort((x, y) => x - y)), 'kway: output is everything, sorted');
    for (const x of steps) ok(x.heap.length <= lists.length && hp.isMinHeap(x.heap, (e) => [e.v, e.list]), 'kway: at most one candidate per list, heap valid');
  };
  for (const e of Object.values(hp.KWAY)) runKw(e.input.lists);
  for (let t = 0; t < 2000; t++) runKw(hp.randomKway(rand).lists);

  const runMd = (a) => {
    const steps = hp.median({ a });
    common(`median ${a}`, steps, hp.medianCode, ['start', 'low', 'up', 'back', 'done']);
    const want = a.map((_, k) => { const s2 = a.slice(0, k + 1).sort((x, y) => x - y); const m = s2.length; return m % 2 ? s2[(m - 1) / 2] : (s2[m / 2 - 1] + s2[m / 2]) / 2; });
    ok(same(steps.at(-1).meds, want), `median ${a}: every median`);
    for (const x of steps) if (x.median !== undefined) ok(x.low.length - x.high.length <= 1 && x.low.length >= x.high.length && (!x.high.length || x.low.at(-1).v <= x.high[0].v), 'median: halves ordered and balanced');
  };
  for (const e of Object.values(hp.MEDIAN)) runMd(e.input.a);
  for (let t = 0; t < 2000; t++) runMd(hp.randomMedian(rand).a);
}

// ---------------------------------------------------------------- trees
{
  const fmtDfs = (mode, v) => ({ depth: `depth = ${v}`, pathsum: `${v}`, good: `${v} good nodes`, diameter: `diameter = ${v} edges`, lca: `LCA = ${v}` })[mode];
  const runDfs = (input) => {
    const steps = tr.treeDfs(input);
    common(`tree dfs ${JSON.stringify(input)}`, steps, tr.treeDfsCode(input.mode), ['start', 'call', 'return', 'found', 'done']);
    ok(steps.at(-1).answer === fmtDfs(input.mode, tr.treeDfsAnswer(input)), `tree dfs ${JSON.stringify(input)}: answer`);
    for (const x of steps) ok(x.stack.every((id) => x.status[id] === 'active'), 'tree dfs: the call stack holds active calls');
  };
  for (const e of Object.values(tr.TREE_DFS)) runDfs(e.input);
  for (const mode of Object.keys(tr.TREE_DFS)) for (let t = 0; t < 600; t++) runDfs(tr.randomTreeDfs({ mode }, rand));

  const runBfs = (input) => {
    const steps = tr.treeBfs(input);
    common(`tree bfs ${JSON.stringify(input)}`, steps, tr.treeBfsCode(input.mode), ['start', 'level', 'visit', 'found', 'done']);
    const want = tr.treeBfsAnswer(input);
    const got = input.mode === 'min' ? Number(steps.at(-1).answer.split('= ')[1]) : input.mode === 'right' ? steps.at(-1).out : steps.at(-1).out;
    ok(same(got, want), `tree bfs ${JSON.stringify(input)}: answer`);
  };
  for (const e of Object.values(tr.TREE_BFS)) runBfs(e.input);
  for (const mode of Object.keys(tr.TREE_BFS)) for (let t = 0; t < 600; t++) runBfs(tr.randomTreeBfs({ mode }, rand));

  const runBst = (input) => {
    const steps = tr.bst(input);
    common(`bst ${JSON.stringify(input)}`, steps, tr.bstCode(input.mode), ['start', 'go', 'found', 'missing', 'insert', 'check', 'fail', 'left', 'visit', 'done']);
    const want = tr.bstAnswer(input);
    const last = steps.at(-1);
    if (input.mode === 'search') ok((last.kind === 'found') === want, `bst search ${JSON.stringify(input)}`);
    if (input.mode === 'insert') ok(last.kind === 'missing' || same(tr.inorder(last.t).map((id) => last.t.nodes[id].v), want), `bst insert ${JSON.stringify(input)}: still sorted`);
    if (input.mode === 'validate') ok((last.kind !== 'fail') === want, `bst validate ${JSON.stringify(input)}`);
    if (input.mode === 'kth') ok(last.answer.endsWith(`= ${want}`), `bst kth ${JSON.stringify(input)}`);
    if (input.mode === 'lca') ok(last.answer === `LCA = ${want}`, `bst lca ${JSON.stringify(input)}`);
  };
  for (const e of Object.values(tr.BST)) runBst(e.input);
  for (const mode of Object.keys(tr.BST)) for (let t = 0; t < 600; t++) runBst(tr.randomBst({ mode }, rand));
  ok(tr.parseBst({ tree: '5, 3, 8, null, null, 4, 9', x: '4' }, { mode: 'search' }).error, 'bst: a non-BST is refused for search');
  ok(tr.parseTreeText('1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16').error, 'trees: too many nodes refused');
}

// ---------------------------------------------------------------- graphs
{
  const runIs = (input) => {
    const steps = gr.islands(input);
    common(`islands ${JSON.stringify(input)}`, steps, gr.islandsCode(input.mode), ['start', 'found', 'visit', 'island', 'done']);
    const want = gr.islandsAnswer(input);
    ok(steps.at(-1).answer === (input.mode === 'count' ? `${want} islands` : `biggest area = ${want}`), `islands ${JSON.stringify(input)}: answer`);
    const last = steps.at(-1);
    input.grid.forEach((row, r) => row.forEach((v, c) => ok((v === 1) === (last.owner[r][c] > 0), 'islands: every land cell, and only land, is marked')));
  };
  for (const e of Object.values(gr.ISLANDS)) runIs(e.input);
  for (const mode of ['count', 'area']) for (let t = 0; t < 800; t++) runIs(gr.randomIslands({ mode }, rand));

  const runBfs = (input) => {
    const steps = gr.gridBfs(input);
    common(`grid bfs ${JSON.stringify(input)}`, steps, gr.gridBfsCode(input.mode), ['start', 'ring', 'found', 'done']);
    ok(steps.at(-1).answer === String(gr.gridBfsAnswer(input)), `grid bfs ${JSON.stringify(input)}: answer`);
  };
  for (const e of Object.values(gr.GRID_BFS)) runBfs(e.input);
  for (const mode of ['path', 'oranges']) for (let t = 0; t < 1500; t++) runBfs(gr.randomGridBfs({ mode }, rand));

  const runTopo = (input) => {
    const steps = gr.topo(input);
    common(`topo ${JSON.stringify(input)}`, steps, gr.topoCode, ['start', 'ready', 'take', 'done', 'cycle']);
    const want = gr.topoAnswer(input);
    const last = steps.at(-1);
    ok((last.kind === 'done') === Boolean(want), `topo ${JSON.stringify(input)}: cycle detection`);
    if (want) { const at = Object.fromEntries(last.order.map((u, k) => [u, k])); ok(input.edges.every(([a, b]) => at[a] < at[b]), 'topo: every edge goes forward in the order'); }
  };
  for (const e of Object.values(gr.TOPO)) runTopo(e.input);
  for (let t = 0; t < 1500; t++) runTopo(gr.randomTopo(rand));

  const runUf = (input) => {
    const steps = gr.unionFind(input);
    common(`union-find ${JSON.stringify(input)}`, steps, gr.unionFindCode, ['start', 'union', 'same', 'find', 'done']);
    const root = (par, x) => { while (par[x] !== x) x = par[x]; return x; };
    const comp = Array.from({ length: input.n }, (_, k) => k);
    const merge = (a, b) => { const ca = comp[a], cb = comp[b]; for (let k = 0; k < comp.length; k++) if (comp[k] === cb) comp[k] = ca; };
    let firstCycle = null;
    for (const op of input.ops) if (op[0] === 'u') { if (comp[op[1]] === comp[op[2]] && !firstCycle) firstCycle = op; merge(op[1], op[2]); }
    const last = steps.at(-1);
    if (input.redundant) ok(firstCycle ? last.answer === `redundant edge [${firstCycle[1]}, ${firstCycle[2]}]` : last.kind === 'done', 'union-find: the redundant edge');
    else {
      for (let a = 0; a < input.n; a++) for (let b = 0; b < input.n; b++) ok((root(last.parent, a) === root(last.parent, b)) === (comp[a] === comp[b]), 'union-find: same root iff connected');
      ok(last.groups === new Set(comp).size, 'union-find: group count');
    }
  };
  for (const e of Object.values(gr.UNION_FIND)) runUf(e.input);
  for (const redundant of [false, true]) for (let t = 0; t < 1000; t++) runUf(gr.randomUnionFind({ redundant }, rand));

  const runDj = (input) => {
    const steps = gr.dijkstra(input);
    common(`dijkstra ${JSON.stringify(input)}`, steps, gr.dijkstraCode, ['start', 'settle', 'stale', 'done']);
    ok(same(steps.at(-1).dist, gr.dijkstraAnswer(input)), `dijkstra ${JSON.stringify(input)}: distances (Bellman-Ford)`);
  };
  for (const e of Object.values(gr.DIJKSTRA)) runDj(e.input);
  for (let t = 0; t < 1500; t++) runDj(gr.randomDijkstra(rand));
  ok(gr.parseGrid('12; 3').error && gr.parseEdges('0>').error, 'graphs: bad input refused');
}

// ---------------------------------------------------------------- backtracking
{
  const runBt = (input) => {
    const steps = bt.backtrack(input);
    common(`backtrack ${JSON.stringify(input)}`, steps, bt.backtrackCode(input.mode), ['start', 'choose', 'record', 'back', 'prune', 'done']);
    const found = steps.at(-1).found;
    ok(found.length === bt.backtrackAnswer(input), `backtrack ${JSON.stringify(input)}: count`);
    ok(new Set(found.map((p) => JSON.stringify(input.mode === 'perms' ? p : [...p].sort((a, b) => a - b)))).size === found.length, 'backtrack: no duplicates');
    if (input.mode === 'combsum') ok(found.every((p) => p.reduce((a, b) => a + b, 0) === input.target), 'backtrack combsum: every answer adds up');
    for (const x of steps) if (x.cur !== null) ok(x.shown.includes(x.cur), 'backtrack: the current node is drawn');
  };
  for (const e of Object.values(bt.BACKTRACK)) runBt(e.input);
  for (const mode of ['subsets', 'perms', 'combsum']) for (let t = 0; t < 300; t++) runBt(bt.randomBacktrack({ mode }, rand));
  for (let n = 4; n <= 6; n++) for (const first of [true, false]) {
    if (n > 4 && !first) continue;
    const steps = bt.queens({ n, first });
    common(`queens ${n}`, steps, bt.queensCode, ['start', 'place', 'dead', 'lift', 'solution', 'done']);
    const sols = steps.at(-1).sols;
    ok(first ? sols.length === 1 : sols.length === bt.queenCount(n), `queens ${n}: solutions`);
    for (const s2 of sols) ok(s2.every((c, r) => s2.every((c2, r2) => r === r2 || (c !== c2 && Math.abs(c - c2) !== Math.abs(r - r2)))), 'queens: no two attack');
  }
}

// ---------------------------------------------------------------- dynamic programming
{
  for (const mode of ['plain', 'memo']) for (let n = 2; n <= 6; n++) {
    const steps = dp.fib({ mode, n });
    common(`fib ${mode} ${n}`, steps, dp.fibCode(mode), ['start', 'call', 'again', 'base', 'hit', 'return', 'done']);
    ok(steps.at(-1).nodes.length === dp.fibCalls(mode, n), `fib ${mode} ${n}: number of calls`);
  }
  const run1 = (input) => {
    const steps = dp.dp1d(input);
    common(`dp1d ${JSON.stringify(input)}`, steps, dp.dp1dCode(input.mode), ['start', 'base', 'fill', 'restart', 'done']);
    const want = dp.dp1dAnswer(input);
    ok(steps.at(-1).answer.endsWith(`= ${want}`), `dp1d ${JSON.stringify(input)}: answer ${want}`);
  };
  for (const e of Object.values(dp.DP1D)) run1(e.input);
  for (const mode of Object.keys(dp.DP1D)) for (let t = 0; t < 800; t++) run1(dp.randomDp1d({ mode }, rand));
  const run2 = (input) => {
    const steps = dp.dp2d(input);
    common(`dp2d ${JSON.stringify(input)}`, steps, dp.dp2dCode(input.mode), ['start', 'base', 'fill', 'match', 'block', 'take', 'skip', 'done']);
    const want = dp.dp2dAnswer(input);
    ok(steps.at(-1).answer.endsWith(String(want)), `dp2d ${JSON.stringify(input)}: answer ${want}`);
    for (const x of steps) for (const d of x.deps) ok(x.cells[d.r] && x.cells[d.r][d.c] !== null, 'dp2d: arrows only come from filled cells');
    ok(same(dp.parseDp2d(dp.dp2dValues(input), input).input, input) || input.mode === 'ways', `dp2d ${input.mode}: values parse back`);
  };
  for (const e of Object.values(dp.DP2D)) run2(e.input);
  for (const mode of Object.keys(dp.DP2D)) for (let t = 0; t < 300; t++) run2(dp.randomDp2d({ mode }, rand));
  for (const e of Object.values(dp.ROBBER_TREE)) {
    const steps = dp.robberTree(e.input);
    common('robber tree', steps, dp.robberTreeCode, ['start', 'node', 'done']);
    ok(steps.at(-1).answer === `max loot = ${dp.robberTreeAnswer(e.input)}`, 'robber tree: answer');
  }
  for (let t = 0; t < 800; t++) {
    const tree = tr.randomTreeArr(rand, { n: 1 + Math.floor(rand() * 10), lo: 0, hi: 20 });
    ok(dp.robberTree({ tree }).at(-1).answer === `max loot = ${dp.robberTreeAnswer({ tree })}`, 'robber tree: random answer');
  }
}

// ---------------------------------------------------------------- greedy, tries, bits
{
  const runG = (input) => {
    const steps = sp.greedy(input);
    common(`greedy ${JSON.stringify(input)}`, steps, sp.greedyCode(input.mode), ['start', 'reach', 'stuck', 'jump', 'add', 'reset', 'extend', 'cut', 'done']);
    const want = sp.greedyAnswer(input);
    const got = steps.at(-1).answer;
    ok(input.mode === 'labels' ? got === `[${want.join(', ')}]` : got === String(want), `greedy ${JSON.stringify(input)}: ${got} vs ${JSON.stringify(want)}`);
  };
  for (const e of Object.values(sp.GREEDY)) runG(e.input);
  for (const mode of ['jump', 'jump2', 'gas', 'labels']) for (let t = 0; t < 1500; t++) runG(sp.randomGreedy({ mode }, rand));

  const runT = (input) => {
    const steps = sp.trie(input);
    common(`trie ${JSON.stringify(input)}`, steps, sp.trieCode, ['start', 'insert', 'found', 'missing', 'done']);
    ok(steps.at(-1).answer === `[${sp.trieAnswer(input).join(', ')}]`, `trie ${JSON.stringify(input)}: answers`);
    const last = steps.at(-2) ?? steps.at(-1);
    for (const w of input.words) ok(last.nodes[w]?.end, `trie: ${w} is marked as a word`);
  };
  for (const e of Object.values(sp.TRIE)) {
    runT(e.input);
    const back = sp.parseTrie({ words: e.input.words.join(', '), queries: sp.trieQueriesText(e.input.queries) }, e.input);
    ok(back.input && back.input.queries.length === e.input.queries.length, 'trie: the example\'s own text parses back');
  }
  for (const e of Object.values(sp.TRIE)) for (let t = 0; t < 800; t++) runT(sp.randomTrie(e.input, rand));

  const runB = (input) => {
    const steps = sp.bits(input);
    common(`bits ${JSON.stringify(input)}`, steps, sp.bitsCode(input.mode), ['start', 'clear', 'xor', 'cancel', 'done']);
    const want = input.mode === 'popcount' ? input.n.toString(2).split('').filter((c) => c === '1').length
      : input.mode === 'single' ? input.a.find((v) => input.a.indexOf(v) === input.a.lastIndexOf(v))
        : Array.from({ length: input.a.length + 1 }, (_, k) => k).find((k) => !input.a.includes(k));
    ok(steps.at(-1).answer === (input.mode === 'popcount' ? `${want} set bits` : `${want}`), `bits ${JSON.stringify(input)}: answer`);
  };
  for (const e of Object.values(sp.BITS)) runB(e.input);
  for (const mode of ['popcount', 'single', 'missing']) for (let t = 0; t < 1500; t++) runB(sp.randomBits({ mode }, rand));
}

// ---------------------------------------------------------------- design, matrices and advanced topics
{
  const runL = (input) => {
    const steps = adv.lru(input);
    common(`lru ${JSON.stringify(input)}`, steps, adv.lruCode, ['start', 'add', 'update', 'hit', 'miss', 'evict', 'done']);
    const want = adv.lruAnswer(input);
    ok(same(steps.at(-1).out, want.out) && same(steps.at(-1).list.map((n) => n.key), want.order), `lru ${JSON.stringify(input)}: results and order`);
    for (const x of steps) ok(x.list.length <= input.cap, 'lru: never over capacity');
  };
  for (const e of Object.values(adv.LRU)) runL(e.input);
  for (let t = 0; t < 2000; t++) runL(adv.randomLru(rand));

  const runM = (input) => {
    const steps = adv.matrix(input);
    common(`matrix ${JSON.stringify(input)}`, steps, adv.matrixCode(input.mode), ['start', 'top', 'right', 'bottom', 'left', 'skip', 'transpose', 'reverse', 'flags', 'mark', 'apply', 'last', 'done']);
    const want = adv.matrixAnswer(input);
    const got = input.mode === 'spiral' ? steps.at(-1).out : steps.at(-1).cells.map((row) => row.map((c) => c.v));
    ok(same(got, want), `matrix ${JSON.stringify(input)}: result`);
  };
  for (const e of Object.values(adv.MATRIX)) runM(e.input);
  for (const mode of ['spiral', 'rotate', 'zeroes']) for (let t = 0; t < 1000; t++) runM(adv.randomMatrix({ mode }, rand));

  const runMa = (input) => {
    const steps = adv.math(input);
    common(`math ${JSON.stringify(input)}`, steps, adv.mathCode(input.mode), ['start', 'cross', 'step', 'use', 'skip', 'done']);
    const want = adv.mathAnswer(input);
    ok(steps.at(-1).answer === (Array.isArray(want) ? `[${want.join(', ')}]` : String(want)), `math ${JSON.stringify(input)}: answer`);
  };
  for (const e of Object.values(adv.MATH)) runMa(e.input);
  for (const mode of ['sieve', 'gcd', 'pow']) for (let t = 0; t < 600; t++) runMa(adv.randomMath({ mode }, rand));

  const runK = (input) => {
    const steps = adv.kmp(input);
    common(`kmp ${JSON.stringify(input)}`, steps, adv.kmpCode(input.mode), ['start', 'grow', 'fall', 'zero', 'match', 'miss', 'found', 'done']);
    const want = adv.kmpAnswer(input);
    ok(input.mode === 'table' ? steps.at(-1).answer === `[${want.join(', ')}]` : steps.at(-1).answer === (want.length ? `found at [${want.join(', ')}]` : 'not found'), `kmp ${JSON.stringify(input)}: answer`);
  };
  for (const e of Object.values(adv.KMP)) runK(e.input);
  for (const mode of ['table', 'search']) for (let t = 0; t < 1500; t++) runK(adv.randomKmp({ mode }, rand));

  const runF = (input) => {
    const steps = adv.fenwick(input);
    common(`fenwick ${JSON.stringify(input)}`, steps, adv.fenwickCode(input.mode), ['start', 'add', 'done']);
    const last = steps.at(-1);
    if (input.mode === 'query') ok(last.sum === input.a.slice(0, input.i).reduce((x, y) => x + y, 0), 'fenwick: prefix sum');
    else ok(same(last.tree, adv.fenwickBuild(last.a)), 'fenwick: updated tree equals a fresh build');
  };
  for (const e of Object.values(adv.FENWICK)) runF(e.input);
  for (const mode of ['query', 'update']) for (let t = 0; t < 1500; t++) runF(adv.randomFenwick({ mode }, rand));

  const runS = (input) => {
    const steps = adv.segTree(input);
    common(`seg ${JSON.stringify(input)}`, steps, adv.segCode, ['start', 'none', 'full', 'partial', 'done']);
    ok(steps.at(-1).answer === `sum = ${input.a.slice(input.l, input.r + 1).reduce((x, y) => x + y, 0)}`, 'seg: range sum');
    ok(Object.keys(steps.at(-1).status).length <= 4 * Math.ceil(Math.log2(input.a.length) + 1), 'seg: at most four nodes per level');
  };
  for (const e of Object.values(adv.SEGTREE)) runS(e.input);
  for (let t = 0; t < 1500; t++) runS(adv.randomSeg(rand));
}

// ---------------------------------------------------------------- HLD: foundations
const kindsOf = (steps) => [...new Set(steps.map((x) => x.kind))];
{
  const steps = hf.interview();
  common('interview', steps, hf.interviewCode, kindsOf(steps));
  steps.forEach((x, k) => k && ok(x.minute >= steps[k - 1].minute, 'interview: the clock never runs backwards'));
  ok(steps.at(-1).minute === 45, 'interview: ends at 45 minutes');
  const runEstimate = (input, name) => {
    const s2 = hf.estimate(input);
    common(`estimate ${name}`, s2, hf.estimateCode, kindsOf(s2));
    const x = hf.estimateNumbers(input);
    const c = s2.at(-1).cards;
    const near = (a, b) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b));
    ok(near(c.wq, input.dau * input.writes / 86400) && near(c.rq, input.dau * input.reads / 86400), `estimate ${name}: QPS`);
    ok(near(c.peak, (c.wq + c.rq) * 3), `estimate ${name}: peak = 3 × average`);
    ok(near(c.storage, input.dau * input.writes * input.writeKB * 1e3 * 365 * 5 * 3), `estimate ${name}: storage`);
    ok(near(c.bw, c.rq * input.readKB * 1e3) && near(c.cache, 0.2 * input.dau * input.reads * input.readKB * 1e3), `estimate ${name}: egress and cache`);
    ok(c.servers === x.servers && c.servers === Math.ceil((c.peak / 2000) * 1.5), `estimate ${name}: servers`);
  };
  for (const [k, e] of Object.entries(hf.ESTIMATE)) runEstimate(e.input, k);
  for (let t = 0; t < 300; t++) {
    const pick = (a) => a[Math.floor(rand() * a.length)];
    const values = { dau: String(pick([2e3, 1e5, 7e6, 3e8, 2e9])), writes: String(pick([0.01, 0.5, 3, 40])), reads: String(pick([0.2, 10, 300])), writeKB: String(pick([0.05, 2, 600, 5e4])), readKB: String(pick([0.1, 30, 2000])) };
    const r = hf.parseEstimate(values, {});
    ok(r.input, 'estimate: valid values parse');
    runEstimate(r.input, `random ${t}`);
  }
  ok(hf.parseEstimate({ dau: 'x', writes: '1', reads: '1', writeKB: '1', readKB: '1' }, {}).error, 'estimate: bad input is refused');
  const ttfb = {};
  for (const rtt of [1, 20, 80, 150, 200, 300, 400]) {
    for (const mode of Object.keys(hf.JOURNEY)) {
      const s3 = hf.journey({ rtt, mode });
      common(`journey ${mode} ${rtt}`, s3, hf.journeyCode, kindsOf(s3));
      const last = s3.at(-1);
      ok(Math.round(Object.values(last.parts).reduce((a, b) => a + b, 0)) === last.clock, `journey ${mode}: the parts add up to the clock`);
      s3.forEach((x, k) => k && ok(x.clock >= s3[k - 1].clock, `journey ${mode}: the clock never runs backwards`));
      ttfb[mode] = last.clock;
    }
    const dns = 80, server = 20;
    ok(ttfb.cold === dns + 4 * rtt + server && ttfb.tls13 === dns + 3 * rtt + server && ttfb.warm === rtt + server && ttfb.h3 === dns + 2 * rtt + server, `journey ${rtt}: round-trip counts`);
    ok(ttfb.warm <= ttfb.h3 && ttfb.h3 <= ttfb.tls13 && ttfb.tls13 <= ttfb.cold, `journey ${rtt}: each fix is faster`);
  }
}

// ---------------------------------------------------------------- HLD: scaling compute
{
  for (const mode of ['memory', 'shared']) {
    const steps = hs.sessions({ mode });
    common(`sessions ${mode}`, steps, hs.sessionsCode[mode], kindsOf(steps));
    const last = steps.at(-1);
    ok(!last.servers.B.up, `sessions ${mode}: B crashed`);
    if (mode === 'shared') ok(last.store.some((c) => c.text.startsWith('Bob')) && Object.values(last.servers).every((x) => x.chips.length === 0), 'sessions shared: servers hold nothing, the store holds Bob');
    else ok(steps.some((x) => x.kind === 'fail') && last.servers.B.chips.every((c) => c.tone === 'danger'), 'sessions memory: Bob is lost with B');
  }
  for (const algo of Object.keys(hs.BALANCER)) {
    const steps = hs.balancer({ algo });
    common(`balancer ${algo}`, steps, hs.balancerCode[algo], kindsOf(steps));
    const placed = steps.at(-1).bars.filter((b) => !b.failed);
    ok(placed.length === hs.REQUESTS.length && new Set(placed.map((b) => b.id)).size === placed.length, `balancer ${algo}: every request placed once`);
    const picks = steps.filter((x) => x.pick);
    let turn = 0;
    picks.forEach((x, k) => {
      const others = hs.SERVERS.filter((s) => s !== x.pick);
      if (algo === 'rr') ok(x.pick === hs.SERVERS[k % 3], 'balancer rr: takes turns');
      if (algo === 'least') ok(others.every((s) => x.inFlight[x.pick] - 1 <= x.inFlight[s]), 'balancer least: picks the fewest in flight');
      if (algo === 'iphash') ok(placed.filter((b) => b.who === x.req.who).every((b) => b.server === x.pick), 'balancer iphash: same person, same server');
      if (algo === 'health') ok(!x.out.includes(x.pick) && !x.crashed.includes(x.pick), 'balancer health: never placed on a dead or removed server');
      turn++;
    });
    ok(turn === hs.REQUESTS.length, `balancer ${algo}: one pick per request`);
    if (algo === 'weighted') {
      const first5 = picks.slice(0, 5).map((x) => x.pick);
      ok(first5.filter((s) => s === 'A').length === 3 && first5.includes('B') && first5.includes('C'), 'balancer weighted: A gets 3 of every 5');
    }
    const work = Object.fromEntries(hs.SERVERS.map((s) => [s, placed.filter((b) => b.server === s).reduce((a, b) => a + b.ends - b.start, 0)]));
    ok(same(work, steps.at(-1).work), `balancer ${algo}: work adds up`);
    if (algo === 'health') ok(steps.at(-1).bars.filter((b) => b.failed).length === 1, 'balancer health: exactly one refused request');
  }
}

// ---------------------------------------------------------------- HLD: storage engines and blobs
{
  for (const q of Object.keys(st.DATA_MODELS)) {
    const steps = st.dataModels({ q });
    common(`data models ${q}`, steps, st.dataModelsCode(q), kindsOf(steps));
    const ids = new Set([...st.SHAPES.sql.flatMap((t) => t.ids), ...st.SHAPES.doc.map((d) => d.id), ...st.SHAPES.kv.map((r) => r.id), ...st.SHAPES.wide.flatMap((p) => p.rows.map((r) => r.id))]);
    steps.forEach((x) => x.touch.forEach((t) => ok(ids.has(t), `data models ${q}: touches a real record (${t})`)));
    ok(Object.keys(steps.at(-1).scores).length === 4, `data models ${q}: all four models scored`);
  }
  // B+tree: every page within size, all leaves at one depth, separators bound their children, leaves in order
  const checkTree = (t, keys, name) => {
    const depth = new Set();
    const walk = (id, lo, hi, d) => {
      const n = t.nodes[id];
      ok(n.keys.length >= 1 && n.keys.length <= st.MAX_KEYS, `${name}: page size`);
      ok(n.keys.every((k, i) => (i === 0 || k > n.keys[i - 1]) && k >= lo && k < hi), `${name}: keys sorted and inside the parent's bounds`);
      if (!n.children) { depth.add(d); return; }
      ok(n.children.length === n.keys.length + 1, `${name}: one more child than separators`);
      n.children.forEach((c, i) => walk(c, i === 0 ? lo : n.keys[i - 1], i === n.keys.length ? hi : n.keys[i], d + 1));
    };
    walk(t.root, -Infinity, Infinity, 0);
    ok(depth.size === 1, `${name}: every leaf at the same depth`);
    ok(same(st.treeKeys(t), sorted(keys)), `${name}: the leaf chain lists every key in order`);
  };
  const base = st.treeKeys(st.startTree());
  checkTree(st.startTree(), base, 'btree start');
  const runTree = (input) => {
    const steps = st.btree(input);
    const name = `btree ${JSON.stringify(input)}`;
    common(name, steps, st.btreeCode(input.mode), kindsOf(steps));
    const last = steps.at(-1);
    if (input.mode === 'lookup') ok(last.answer.startsWith(base.includes(input.key) ? 'found' : 'not found'), `${name}: lookup answer`);
    if (input.mode === 'range') ok(same(last.result, base.filter((k) => k >= input.lo && k <= input.hi)), `${name}: range answer`);
    if (input.mode === 'insert') {
      checkTree(last.tree, [...base, ...input.keys], name);
      steps.forEach((x) => checkTreeLoose(x.tree, name));
    }
  };
  const checkTreeLoose = (t, name) => Object.values(t.nodes).forEach((n) => ok(!n.children || n.children.every((c) => t.nodes[c]), `${name}: no dangling child`));
  for (const e of Object.values(st.BTREE)) runTree(e.input);
  for (let k = 1; k <= 99; k++) runTree({ mode: 'lookup', key: k });
  for (let t = 0; t < 400; t++) {
    const lo = 1 + Math.floor(rand() * 99), hi = lo + Math.floor(rand() * (100 - lo));
    runTree({ mode: 'range', lo, hi });
    const free = Array.from({ length: 99 }, (_, k) => k + 1).filter((k) => !base.includes(k));
    const keys = [];
    const n = 1 + Math.floor(rand() * 3);
    while (keys.length < n) { const k = free[Math.floor(rand() * free.length)]; if (!keys.includes(k)) keys.push(k); }
    const parsed = st.parseBTree({ keys: keys.join(', ') }, { mode: 'insert' });
    ok(same(parsed.input?.keys, keys), 'btree: insert keys parse');
    runTree({ mode: 'insert', keys });
  }
  ok(st.parseBTree({ keys: '40' }, { mode: 'insert' }).error && st.parseBTree({ lo: '9', hi: '3' }, { mode: 'range' }).error, 'btree: bad input is refused');
  // LSM: Bloom filters match their tables, a "no" is never wrong, reads return the newest value
  const expect = { life: { cat: 7, bob: 'deleted' }, reads: { gus: 60, ann: 35, cat: 7, tom: 'not found', kim: 'not found' } };
  for (const script of Object.keys(st.LSM)) {
    const steps = st.lsm({ script });
    common(`lsm ${script}`, steps, st.lsmCode, kindsOf(steps));
    for (const x of steps) {
      ok(x.mem.length <= st.MEMTABLE_MAX, `lsm ${script}: memtable within size`);
      for (const t of x.tables) {
        ok(same(t.bits, sorted([...new Set(t.rows.flatMap(([k]) => st.bloomBits(k)))])), `lsm ${script}: ${t.id}'s filter has exactly its keys' bits`);
        ok(same(t.rows.map(([k]) => k), [...t.rows.map(([k]) => k)].sort()), `lsm ${script}: ${t.id} is sorted`);
      }
      if (x.kind === 'bloom') {
        const key = x.op.split(' ')[1];
        ok(!x.tables.find((t) => t.id === x.check.id).rows.some(([k]) => k === key), `lsm ${script}: a skipped table really lacks ${key}`);
      }
      if (x.result !== undefined && x.op?.startsWith('GET ')) {
        const key = x.op.split(' ')[1];
        ok(String(expect[script][key]) === String(x.result), `lsm ${script}: GET ${key} = ${expect[script][key]}`);
      }
    }
    if (script === 'life') ok(steps.at(-1).tables.length === 1 && !steps.at(-1).tables[0].rows.some(([k]) => k === 'bob'), 'lsm life: compaction drops the deleted key');
  }
  for (const flow of Object.keys(st.UPLOADS)) {
    const steps = st.uploads({ flow });
    common(`uploads ${flow}`, steps, st.uploadsCode[flow], kindsOf(steps));
    const secs = (c) => (c.endsWith('ms') ? parseFloat(c) / 1000 : parseFloat(c));
    steps.forEach((x, k) => k && ok(secs(x.clock) >= secs(steps[k - 1].clock), `uploads ${flow}: the clock never runs backwards`));
    ok(steps.at(-1).apiMB === (flow === 'proxy' ? 2 * st.FILE_MB : 0), `uploads ${flow}: bytes through the API`);
    steps.forEach((x) => [].concat(x.live ?? []).forEach((i) => ok(x.rows[i], `uploads ${flow}: live row exists`)));
  }
}

// ---------------------------------------------------------------- HLD: distributing data
{
  const expectOk = { readskew: false, snapshot: true, lost: false, atomic: true, writeskew: false, serializable: true };
  for (const ex of Object.keys(hd.ISOLATION)) {
    const steps = hd.isolation({ ex });
    common(`isolation ${ex}`, steps, hd.isolationCode(ex), kindsOf(steps));
    ok(steps.at(-1).ok === expectOk[ex], `isolation ${ex}: the anomaly ${expectOk[ex] ? 'is prevented' : 'happens'}`);
    for (const x of steps) {
      for (const [key, vs] of Object.entries(x.rows)) ok(vs.filter((v) => v.at === null && !v.aborted).length <= 1, `isolation ${ex}: at most one uncommitted version of ${key}`);
      for (const [key, holder] of Object.entries(x.locks)) ok(x.rows[key].some((v) => v.by === holder && v.at === null && !v.aborted), `isolation ${ex}: a lock belongs to a pending write`);
    }
  }
  for (const ex of Object.keys(hd.REPLICATION)) {
    const steps = hd.replication({ ex });
    common(`replication ${ex}`, steps, hd.replicationCode[ex], kindsOf(steps));
    const names = ex === 'quorum' ? ['writer', 'reader', 'N1', 'N2', 'N3'] : ['client', 'L', 'F1', 'F2'];
    steps.forEach((x) => x.packets.forEach((p) => ok(names.includes(p.from) && names.includes(p.to), `replication ${ex}: packets travel between real nodes`)));
    if (ex === 'quorum') ok(steps.find((x) => x.kind === 'repair').result === 'v2', 'replication quorum: the newest version wins');
    if (ex === 'failover') ok(steps.at(-1).nodes.F1.role === 'leader' && steps.at(-1).nodes.L.at === steps.at(-1).nodes.F1.at, 'replication failover: the old leader follows the new one');
  }
  for (const ex of Object.keys(hd.SHARDING)) {
    const steps = hd.sharding({ ex });
    common(`sharding ${ex}`, steps, hd.shardingCode[ex], kindsOf(steps));
    const last = steps.at(-1);
    if (ex === 'range') ok(last.shards[3].fresh.length === 8, 'sharding range: every new id lands on the last shard');
    if (ex === 'hash') ok(last.shards.filter((x) => x.fresh.length).length >= 3, 'sharding hash: new ids spread out');
    if (ex === 'modn') ok(last.moved.length === last.keys.filter((k) => k.shard !== k.from).length && last.keys.every((k) => k.shard < 5), 'sharding modn: moved keys counted');
    if (ex === 'fixed') {
      const users = last.parts.flatMap((p) => p.users);
      ok(sorted(users).length === 20 && new Set(users).size === 20, 'sharding fixed: every user in exactly one partition');
      ok(Object.values(last.owner).filter((o) => o === 4).length === 2, 'sharding fixed: the new node took two partitions');
    }
  }
  const brute = (pos, points) => {
    let best = null;
    for (const p of points) {
      const d = (p.at - pos + 360) % 360;
      if (!best || d < best.d) best = { d, server: p.server };
    }
    return best.server;
  };
  for (const ex of Object.keys(hd.RING)) {
    const steps = hd.ring({ ex });
    common(`ring ${ex}`, steps, hd.ringCode[ex], kindsOf(steps));
    for (const x of steps) {
      for (const { k, at } of x.keys) ok(x.owners[k] === brute(at, x.points), `ring ${ex}: ${k} belongs to the first server clockwise`);
      const total = Object.values(x.shares).reduce((a, b) => a + b, 0);
      ok(total >= 98 && total <= 102, `ring ${ex}: shares cover the ring`);
    }
    const last = steps.at(-1);
    if (ex === 'add') ok(last.moved.every((k) => last.owners[k] === 'D'), 'ring add: moved keys all go to the new server');
    if (ex === 'remove') ok(last.moved.every((k) => steps[0].owners[k] === 'B'), 'ring remove: only the leaving server\'s keys move');
    if (ex === 'vnodes') ok(Math.max(...Object.values(last.shares)) - Math.min(...Object.values(last.shares)) <= 5, 'ring vnodes: shares even out');
  }
  for (let t = 0; t < 2000; t++) {
    const points = Array.from({ length: 1 + Math.floor(rand() * 8) }, (_, k) => ({ server: `S${k}`, at: Math.floor(rand() * 360) }));
    const pos = Math.floor(rand() * 360);
    ok(hd.ownerOf(pos, points).server === brute(pos, points) || points.filter((p) => p.at === hd.ownerOf(pos, points).at).length > 1, 'ring: ownerOf agrees with brute force');
  }
}

console.log(`✓ Step-throughs (DSA + HLD): ${checks} checks: every model agrees with brute force on its examples and on random inputs`);
