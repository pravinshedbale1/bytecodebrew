#!/usr/bin/env node
/**
 * Checks the models behind the DSA step-throughs (src/components/mdx/viz/models): on each lesson
 * example and on random inputs, every step is complete and names real code lines, the step sequence
 * follows the code (a check before a store, a plan before its swap…), nothing is lost, and the final
 * answer matches brute force. The Pair Sum check also proves every pair it rules out really is not
 * an answer. Part of `npm run check`.
 */
import * as cyc from '../src/components/mdx/viz/models/cyclicSort.js';
import * as hash from '../src/components/mdx/viz/models/hashing.js';
import * as tp from '../src/components/mdx/viz/models/twoPointers.js';
import * as sw from '../src/components/mdx/viz/models/slidingWindow.js';
import * as ps from '../src/components/mdx/viz/models/prefixSums.js';
import * as iv from '../src/components/mdx/viz/models/intervals.js';

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

console.log(`✓ DSA step-throughs: ${checks} checks: every model agrees with brute force on its examples and on random inputs`);
