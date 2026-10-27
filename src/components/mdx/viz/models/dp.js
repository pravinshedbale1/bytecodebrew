/**
 * Dynamic-programming step-throughs (models for <FibTreeViz>, <Dp1dViz>, <DpGridViz> and
 * <RobberTreeViz>). Every filled cell records which cells it was computed from, so the stage can
 * draw the arrows. Pure, so scripts/viz-check.mjs can test them.
 */
import { list, parseInt1, parseInts, plural, rng } from './util.js';
import { buildTree, showTree } from './trees.js';

// ---------------------------------------------------------------- the recursion tree: why plain recursion is slow

export const FIB = {
  plain: { label: 'Plain recursion', input: { mode: 'plain', n: 5 } },
  memo: { label: 'With memoisation', input: { mode: 'memo', n: 5 } },
};

export const fibCode = (mode) => (mode === 'plain'
  ? [['base', 'if (n < 2) return n;'], ['call', 'return fib(n - 1) + fib(n - 2);          // both halves, every time']]
  : [['base', 'if (n < 2) return n;'], ['hit', 'if (memo[n] != 0) return memo[n];        // already solved: reuse it'], ['call', 'return memo[n] = fib(n - 1) + fib(n - 2);  // solve once, remember']]);

const fibVal = (n) => { let a = 0, b = 1; for (let k = 0; k < n; k++) [a, b] = [b, a + b]; return a; };

export function fib({ mode, n }) {
  const nodes = [];
  const events = [];
  const memo = new Map();
  const call = (k, parent, depth) => {
    const id = nodes.length;
    nodes.push({ id, n: k, parent, depth });
    if (k < 2) { events.push({ t: 'base', id, v: k }); return k; }
    if (mode === 'memo' && memo.has(k)) { events.push({ t: 'hit', id, v: memo.get(k) }); return memo.get(k); }
    events.push({ t: 'call', id });
    const a = call(k - 1, id, depth + 1), b = call(k - 2, id, depth + 1);
    if (mode === 'memo') memo.set(k, a + b);
    events.push({ t: 'ret', id, v: a + b, a, b });
    return a + b;
  };
  call(n, null, 0);
  const steps = [];
  const shown = new Set(), done = {}, active = [];
  const times = {};
  const stored = {};
  const snap = (x) => steps.push({ mode, n, nodes, shown: [...shown], done: { ...done }, active: [...active], memo: { ...stored }, calls: shown.size, ...x });
  snap({
    kind: 'start', cur: null, lines: [],
    title: mode === 'plain' ? `fib(${n}) with plain recursion` : `fib(${n}) with a memo`,
    text: mode === 'plain'
      ? 'fib(n) = fib(n − 1) + fib(n − 2). Each call makes two more calls, and nothing is remembered. Watch how often the same value gets computed from scratch.'
      : 'The same recursion, plus a memo: the first time fib(k) is solved, store it. The next call for k returns the stored answer immediately, without calling anything.',
    calc: ['calls: 0'],
  });
  for (const e of events) {
    const node = nodes[e.id];
    shown.add(e.id);
    times[node.n] = (times[node.n] ?? 0) + (e.t === 'ret' || e.t === 'base' ? 1 : 0);
    if (e.t === 'call') {
      active.push(e.id);
      const again = mode === 'plain' && nodes.slice(0, e.id).some((x) => x.n === node.n);
      snap({ kind: again ? 'again' : 'call', cur: e.id, again, lines: ['call'], title: `fib(${node.n}) calls fib(${node.n - 1}) and fib(${node.n - 2})${again ? ': again!' : ''}`, text: `${again ? `fib(${node.n}) was already worked out elsewhere in the tree, but plain recursion has no memory, so the whole subtree is computed again. ` : ''}${node.n} isn't a base case, so it needs fib(${node.n - 1}) and fib(${node.n - 2}). It waits while they are computed, left first.`, calc: [`calls so far: ${shown.size}`] });
      continue;
    }
    if (e.t === 'base') {
      done[e.id] = e.v;
      snap({ kind: 'base', cur: e.id, lines: ['base'], title: `fib(${node.n}) = ${e.v}: a base case`, text: `fib(0) = 0 and fib(1) = 1 are known, so this call returns at once.`, calc: [`calls so far: ${shown.size}`] });
      continue;
    }
    if (e.t === 'hit') {
      done[e.id] = e.v;
      snap({ kind: 'hit', cur: e.id, lines: ['hit'], title: `fib(${node.n}) is in the memo: ${e.v}`, text: `fib(${node.n}) was solved earlier, so the stored ${e.v} comes straight back. Its whole subtree is skipped: that's the saving.`, calc: [`memo[${node.n}] = ${e.v}`, `calls so far: ${shown.size}`] });
      continue;
    }
    active.pop();
    done[e.id] = e.v;
    if (mode === 'memo') stored[node.n] = e.v;
    snap({ kind: 'return', cur: e.id, lines: ['call'], title: `fib(${node.n}) = ${e.a} + ${e.b} = ${e.v}`, text: `Both halves are back: ${e.a} + ${e.b} = ${e.v}.${mode === 'memo' ? ` Store it: memo[${node.n}] = ${e.v}.` : times[node.n] > 1 ? ` That's the ${times[node.n]}${['th', 'st', 'nd', 'rd'][times[node.n]] ?? 'th'} time fib(${node.n}) has been worked out.` : ''}`, calc: [`fib(${node.n}) = ${e.v}`, `calls so far: ${shown.size}`] });
  }
  const dup = Object.entries(times).filter(([k, c]) => c > 1 && k > 1).map(([k, c]) => `fib(${k}) ×${c}`);
  snap({
    kind: 'done', cur: null, lines: [], answer: `fib(${n}) = ${fibVal(n)} in ${nodes.length} calls`,
    title: `fib(${n}) = ${fibVal(n)}, ${nodes.length} calls`,
    text: mode === 'plain'
      ? `${dup.length ? `Repeated work: ${dup.join(', ')}. ` : ''}The tree roughly doubles with each extra n, so fib(50) would make billions of calls. The repeated subproblems are the signal that DP will help.`
      : `Each fib(k) was computed once; every repeat was a memo hit. ${nodes.length} calls instead of ${2 * fibVal(n + 1) - 1}: O(n) instead of exponential.`,
    calc: [`calls: ${nodes.length}`],
  });
  return steps;
}

export const fibCalls = (mode, n) => (mode === 'plain' ? 2 * fibVal(n + 1) - 1 : n < 2 ? 1 : 2 * n - 1);

// ---------------------------------------------------------------- 1D tables

export const DP1D = {
  stairs: { label: 'Min cost stairs', input: { mode: 'stairs', a: [10, 15, 20, 5, 10] } },
  robber: { label: 'House robber', input: { mode: 'robber', a: [2, 7, 9, 3, 1, 4] } },
  kadane: { label: 'Max subarray (Kadane)', input: { mode: 'kadane', a: [-2, 1, -3, 4, -1, 2, 1, -5, 4] } },
  lis: { label: 'Longest increasing (LIS)', input: { mode: 'lis', a: [10, 9, 2, 5, 3, 7, 101, 18] } },
  coins: { label: 'Coin change', input: { mode: 'coins', a: [1, 3, 4], amount: 6 } },
};

export const dp1dCode = (mode) => ({
  stairs: [['base', 'dp[0] = dp[1] = 0;                                  // start on step 0 or 1 for free'], ['fill', 'dp[i] = min(dp[i-1] + cost[i-1], dp[i-2] + cost[i-2]);   // came from one or two steps below']],
  robber: [['base', 'best[0] = a[0];  best[1] = max(a[0], a[1]);'], ['fill', 'best[i] = max(best[i-1],  best[i-2] + a[i]);      // skip house i, or take it']],
  kadane: [['base', 'endingHere = best = a[0];'], ['fill', 'endingHere = max(a[i], endingHere + a[i]);         // start over, or extend'], ['best', 'best = max(best, endingHere);']],
  lis: [['base', 'dp[i] = 1;                                           // a[i] on its own'], ['fill', 'for j < i: if (a[j] < a[i]) dp[i] = max(dp[i], dp[j] + 1);   // extend an earlier one']],
  coins: [['base', 'dp[0] = 0;  dp[a] = ∞;'], ['fill', 'for each coin c ≤ a: dp[a] = min(dp[a], dp[a - c] + 1);      // c as the last coin']],
})[mode];

export function dp1dAnswer({ mode, a, amount }) {
  if (mode === 'stairs') { const dp = [0, 0]; for (let i = 2; i <= a.length; i++) dp[i] = Math.min(dp[i - 1] + a[i - 1], dp[i - 2] + a[i - 2]); return dp[a.length]; }
  if (mode === 'robber') { let p2 = 0, p1 = 0; for (const x of a) { const c = Math.max(p1, p2 + x); p2 = p1; p1 = c; } return p1; }
  if (mode === 'kadane') { let best = -Infinity; for (let i = 0; i < a.length; i++) { let s = 0; for (let j = i; j < a.length; j++) { s += a[j]; best = Math.max(best, s); } } return best; }
  if (mode === 'lis') { const dp = a.map(() => 1); for (let i = 0; i < a.length; i++) for (let j = 0; j < i; j++) if (a[j] < a[i]) dp[i] = Math.max(dp[i], dp[j] + 1); return Math.max(...dp); }
  const dp = Array(amount + 1).fill(Infinity); dp[0] = 0;
  for (let x = 1; x <= amount; x++) for (const c of a) if (c <= x) dp[x] = Math.min(dp[x], dp[x - c] + 1);
  return dp[amount] === Infinity ? -1 : dp[amount];
}

const show = (v) => (v === Infinity ? '∞' : v === null || v === undefined ? '' : v);

export function dp1d(input) {
  const { mode, a } = input;
  const steps = [];
  let rows, cols, cells;
  const snap = (x) => steps.push({ mode, rows, cols, cells: cells.map((r) => [...r]), deps: [], ...x });
  if (mode === 'stairs') {
    const n = a.length;
    rows = ['cost', 'dp'];
    cols = [...a.map((_, k) => String(k)), 'top'];
    cells = [[...a, ''], Array(n + 1).fill(null)];
    snap({ kind: 'start', cur: null, lines: [], title: 'Cheapest way to the top of the stairs', text: 'cost[i] is what you pay to step off stair i; you climb 1 or 2 stairs at a time and may start on stair 0 or 1. dp[i] = the cheapest total to stand on stair i. "top" is one past the last stair.', calc: [`cost = ${list(a)}`] });
    cells[1][0] = 0; cells[1][1] = 0;
    snap({ kind: 'base', cur: [1, 1], deps: [], lines: ['base'], title: 'dp[0] = dp[1] = 0', text: 'You may start on stair 0 or stair 1 without paying anything, so standing on either costs 0.', calc: ['dp[0] = 0', 'dp[1] = 0'] });
    for (let i = 2; i <= n; i++) {
      const one = cells[1][i - 1] + a[i - 1], two = cells[1][i - 2] + a[i - 2];
      cells[1][i] = Math.min(one, two);
      const win = one <= two ? 1 : 2;
      snap({
        kind: 'fill', cur: [1, i], lines: ['fill'],
        deps: [{ r: 1, c: i - 1, tone: win === 1 ? 'success' : 'muted', label: `+${a[i - 1]}` }, { r: 1, c: i - 2, tone: win === 2 ? 'success' : 'muted', label: `+${a[i - 2]}` }],
        title: `dp[${cols[i]}] = min(${cells[1][i - 1]} + ${a[i - 1]}, ${cells[1][i - 2]} + ${a[i - 2]}) = ${cells[1][i]}`,
        text: `To stand on ${i === n ? 'the top' : `stair ${i}`} you came from stair ${i - 1} (paying ${a[i - 1]} to leave it) or stair ${i - 2} (paying ${a[i - 2]}). Both of those are already solved, so just compare: ${one} vs ${two}. Coming from stair ${i - win} is cheaper.`,
        calc: [`one step: ${cells[1][i - 1]} + ${a[i - 1]} = ${one}`, `two steps: ${cells[1][i - 2]} + ${a[i - 2]} = ${two}`],
      });
    }
    snap({ kind: 'done', cur: [1, n], lines: [], answer: `cheapest = ${cells[1][n]}`, title: `The top costs ${cells[1][n]}`, text: 'Each dp value used only the two before it, so the table could shrink to two variables (step 4). The recursion, the memo and this table all compute the same thing; the table just does it in an order where every answer it needs is already there.', calc: [`dp[top] = ${cells[1][n]}`] });
    return steps;
  }
  if (mode === 'robber') {
    const n = a.length;
    rows = ['money', 'best'];
    cols = a.map((_, k) => String(k));
    cells = [[...a], Array(n).fill(null)];
    snap({ kind: 'start', cur: null, lines: [], title: 'Rob houses, never two in a row', text: 'best[i] = the most money from houses 0 to i. At each house there are only two choices: skip it (keep best[i − 1]) or take it (a[i] plus best[i − 2], since its neighbour must be skipped).', calc: [`money = ${list(a)}`] });
    cells[1][0] = a[0];
    if (n > 1) cells[1][1] = Math.max(a[0], a[1]);
    snap({ kind: 'base', cur: [1, Math.min(1, n - 1)], lines: ['base'], deps: n > 1 ? [{ r: 0, c: 0, tone: a[0] >= a[1] ? 'success' : 'muted' }, { r: 0, c: 1, tone: a[1] > a[0] ? 'success' : 'muted' }] : [], title: `best[0] = ${a[0]}${n > 1 ? `, best[1] = ${cells[1][1]}` : ''}`, text: n > 1 ? `With one house, take it. With two, you can only take one of them: the bigger, ${cells[1][1]}.` : 'One house: take it.', calc: [`best[0] = ${a[0]}`, ...(n > 1 ? [`best[1] = max(${a[0]}, ${a[1]}) = ${cells[1][1]}`] : [])] });
    for (let i = 2; i < n; i++) {
      const skip = cells[1][i - 1], take = cells[1][i - 2] + a[i];
      cells[1][i] = Math.max(skip, take);
      snap({
        kind: 'fill', cur: [1, i], lines: ['fill'],
        deps: [{ r: 1, c: i - 1, tone: skip >= take ? 'success' : 'muted', label: 'skip' }, { r: 1, c: i - 2, tone: take > skip ? 'success' : 'muted', label: `+${a[i]}` }, { r: 0, c: i, tone: take > skip ? 'success' : 'muted' }],
        title: `best[${i}] = max(${skip}, ${cells[1][i - 2]} + ${a[i]}) = ${cells[1][i]}`,
        text: `Skip house ${i}: keep ${skip}. Take it: ${a[i]} plus the best that ends two houses back, ${cells[1][i - 2]}, = ${take}. ${take > skip ? 'Taking is better.' : skip === take ? 'A tie.' : 'Skipping is better.'}`,
        calc: [`skip: ${skip}`, `take: ${cells[1][i - 2]} + ${a[i]} = ${take}`],
      });
    }
    snap({ kind: 'done', cur: [1, n - 1], lines: [], answer: `max loot = ${cells[1][n - 1]}`, title: `Most money: ${cells[1][n - 1]}`, text: 'Take or skip, using only the previous two answers: O(n) time, and two variables are enough instead of the whole row.', calc: [`best[${n - 1}] = ${cells[1][n - 1]}`] });
    return steps;
  }
  if (mode === 'kadane') {
    const n = a.length;
    rows = ['a', 'ending here', 'best'];
    cols = a.map((_, k) => String(k));
    cells = [[...a], Array(n).fill(null), Array(n).fill(null)];
    snap({ kind: 'start', cur: null, lines: [], title: 'The biggest sum of a contiguous subarray', text: '"ending here" = the best sum of a subarray that ends exactly at i. It either extends the one ending at i − 1, or starts fresh at i, whichever is bigger. "best" keeps the biggest "ending here" seen so far.', calc: [`a = ${list(a)}`] });
    cells[1][0] = a[0]; cells[2][0] = a[0];
    snap({ kind: 'base', cur: [1, 0], lines: ['base'], title: `Start with ${a[0]}`, text: 'The only subarray ending at index 0 is a[0] itself. best starts there too, not at 0: an all-negative array must return its largest element.', calc: [`ending here = ${a[0]}`, `best = ${a[0]}`] });
    for (let i = 1; i < n; i++) {
      const ext = cells[1][i - 1] + a[i];
      cells[1][i] = Math.max(a[i], ext);
      cells[2][i] = Math.max(cells[2][i - 1], cells[1][i]);
      const fresh = a[i] > ext;
      snap({
        kind: fresh ? 'restart' : 'fill', cur: [1, i], lines: ['fill', 'best'],
        deps: [{ r: 1, c: i - 1, tone: fresh ? 'muted' : 'success', label: `+${a[i]}` }, { r: 0, c: i, tone: fresh ? 'success' : 'muted' }, { r: 2, c: i - 1, tone: 'note' }],
        title: fresh ? `Start over at ${a[i]}` : `Extend: ${cells[1][i - 1]} + ${a[i]} = ${ext}`,
        text: `Extending the subarray ending at ${i - 1} gives ${cells[1][i - 1]} + ${a[i]} = ${ext}; starting fresh gives ${a[i]}. ${fresh ? 'The run so far is only dragging the sum down, so drop it and start again here.' : 'Extending is better.'} best = max(${cells[2][i - 1]}, ${cells[1][i]}) = ${cells[2][i]}.`,
        calc: [`ending here = max(${a[i]}, ${ext}) = ${cells[1][i]}`, `best = ${cells[2][i]}`],
      });
    }
    snap({ kind: 'done', cur: [2, n - 1], lines: [], answer: `max sum = ${cells[2][n - 1]}`, title: `Biggest sum: ${cells[2][n - 1]}`, text: '"Best ending here" turned a choice among O(n²) subarrays into one decision per position: O(n) time, O(1) memory.', calc: [`best = ${cells[2][n - 1]}`] });
    return steps;
  }
  if (mode === 'lis') {
    const n = a.length;
    rows = ['a', 'dp'];
    cols = a.map((_, k) => String(k));
    cells = [[...a], Array(n).fill(null)];
    snap({ kind: 'start', cur: null, lines: [], title: 'Longest strictly increasing subsequence', text: 'dp[i] = the length of the longest increasing subsequence that ends with a[i]. It can extend any earlier one whose last value is smaller: look back at every j < i.', calc: [`a = ${list(a)}`] });
    for (let i = 0; i < n; i++) {
      const cands = [];
      for (let j = 0; j < i; j++) if (a[j] < a[i]) cands.push(j);
      let best = 1, from = null;
      for (const j of cands) if (cells[1][j] + 1 > best) { best = cells[1][j] + 1; from = j; }
      cells[1][i] = best;
      snap({
        kind: 'fill', cur: [1, i], lines: ['base', 'fill'],
        deps: cands.map((j) => ({ r: 1, c: j, tone: j === from ? 'success' : 'muted', label: j === from ? '+1' : undefined })),
        title: `dp[${i}] = ${best}${from !== null ? ` (after ${a[from]})` : ''}`,
        text: cands.length ? `Earlier values smaller than ${a[i]}: ${cands.map((j) => `${a[j]} (dp ${cells[1][j]})`).join(', ')}. The longest of those is extended by ${a[i]}: ${best}.` : `Nothing before ${a[i]} is smaller, so the best it can do is start a new subsequence on its own: 1.`,
        calc: [`dp[${i}] = ${from !== null ? `dp[${from}] + 1 = ` : ''}${best}`],
      });
    }
    const best = Math.max(...cells[1]);
    snap({ kind: 'done', cur: [1, cells[1].indexOf(best)], lines: [], answer: `LIS length = ${best}`, title: `Longest increasing subsequence: ${best}`, text: 'The answer is the biggest dp anywhere, not dp[n − 1]: the best subsequence can end at any index. Looking back at every j is O(n²); patience sorting does it in O(n log n).', calc: [`max(dp) = ${best}`] });
    return steps;
  }
  // coin change: fewest coins
  const { amount } = input;
  rows = ['fewest'];
  cols = Array.from({ length: amount + 1 }, (_, k) => String(k));
  cells = [Array(amount + 1).fill(Infinity)];
  snap({ kind: 'start', cur: null, lines: [], title: `Fewest coins for ${amount}, coins ${list(a)}`, text: 'dp[x] = the fewest coins that add up to x. Coins can be reused, so for each amount try every coin as the last one: dp[x − coin] + 1.', calc: [`coins ${list(a)}`] });
  cells[0][0] = 0;
  snap({ kind: 'base', cur: [0, 0], lines: ['base'], title: 'dp[0] = 0, everything else ∞', text: 'Zero needs no coins. Every other amount starts as "impossible" (∞) until a coin reaches it.', calc: ['dp[0] = 0'] });
  for (let x = 1; x <= amount; x++) {
    const tries = a.filter((c) => c <= x).map((c) => ({ c, v: cells[0][x - c] + 1 }));
    const best = tries.reduce((m, t) => (t.v < m.v ? t : m), { v: Infinity, c: null });
    cells[0][x] = best.v;
    snap({
      kind: 'fill', cur: [0, x], lines: ['fill'],
      deps: tries.filter((t) => t.v !== Infinity).map((t) => ({ r: 0, c: x - t.c, tone: t.c === best.c ? 'success' : 'muted', label: `+${t.c}` })),
      title: `dp[${x}] = ${show(best.v)}${best.c !== null && best.v !== Infinity ? ` (last coin ${best.c})` : ''}`,
      text: tries.length ? `Try each coin as the last one: ${tries.map((t) => `${t.c} → dp[${x - t.c}] + 1 = ${show(t.v)}`).join('; ')}. The smallest wins.` : `No coin is small enough for ${x}.`,
      calc: tries.length ? tries.map((t) => `coin ${t.c}: ${show(t.v)}`) : ['no coin fits → ∞'],
    });
  }
  const ans = cells[0][amount];
  snap({ kind: 'done', cur: [0, amount], lines: [], answer: `fewest = ${ans === Infinity ? -1 : ans}`, title: ans === Infinity ? `${amount} can't be made: −1` : `${amount} needs ${ans} coins`, text: `${ans !== Infinity && amount === 6 && a.join() === '1,3,4' ? 'Greedy (biggest coin first) would take 4 + 1 + 1 = 3 coins; the table found 3 + 3 = 2. ' : ''}O(amount × coins) time, one row of memory.`, calc: [`dp[${amount}] = ${show(ans)}`] });
  return steps;
}

export function parseDp1d(values, input) {
  if (input.mode === 'coins') {
    const r = parseInts(values.a, { min: 1, max: 12, minLen: 1, maxLen: 4, name: 'coins' });
    if (r.error) return r;
    const t = parseInt1(values.amount, { min: 1, max: 12, name: 'amount' });
    return t.error ? t : { input: { mode: 'coins', a: [...new Set(r.arr)], amount: t.v } };
  }
  const lims = { stairs: [0, 99], robber: [0, 99], kadane: [-20, 20], lis: [0, 120] }[input.mode];
  const r = parseInts(values.a, { min: lims[0], max: lims[1], minLen: input.mode === 'stairs' ? 2 : 1, maxLen: 9, name: input.mode === 'stairs' ? 'cost' : 'a' });
  return r.error ? r : { input: { mode: input.mode, a: r.arr } };
}

export function randomDp1d(input, rand = Math.random) {
  const g = rng(rand);
  const n = g.int(5, 8);
  if (input.mode === 'coins') return { mode: 'coins', a: g.shuffle([1, 2, 3, 4, 5, 6]).slice(0, g.int(2, 3)), amount: g.int(5, 11) };
  if (input.mode === 'kadane') return { mode: 'kadane', a: Array.from({ length: n }, () => g.int(-8, 8)) };
  return { mode: input.mode, a: Array.from({ length: n }, () => g.int(1, input.mode === 'lis' ? 50 : 20)) };
}

// ---------------------------------------------------------------- 2D tables

export const DP2D = {
  paths: { label: 'Unique paths', input: { mode: 'paths', R: 4, C: 5 } },
  obstacles: { label: 'With obstacles', input: { mode: 'obstacles', grid: [[0, 0, 0, 0], [0, 1, 0, 0], [0, 0, 0, 1], [1, 0, 0, 0]] } },
  minsum: { label: 'Minimum path sum', input: { mode: 'minsum', grid: [[1, 3, 1], [1, 5, 1], [4, 2, 1]] } },
  square: { label: 'Maximal square', input: { mode: 'square', grid: [[1, 0, 1, 0, 0], [1, 0, 1, 1, 1], [1, 1, 1, 1, 1], [1, 0, 0, 1, 0]] } },
  knapsack: { label: '0/1 knapsack', input: { mode: 'knapsack', wt: [1, 3, 4], val: [15, 20, 30], cap: 4 } },
  ways: { label: 'Coin change II', input: { mode: 'ways', coins: [1, 2, 5], amount: 5 } },
  lcs: { label: 'Longest common subsequence', input: { mode: 'lcs', a: 'abcde', b: 'ace' } },
  edit: { label: 'Edit distance', input: { mode: 'edit', a: 'horse', b: 'ros' } },
  balloons: { label: 'Burst balloons', input: { mode: 'balloons', nums: [3, 1, 5, 8] } },
  stock: { label: 'Stock with cooldown', input: { mode: 'stock', prices: [1, 2, 3, 0, 2] } },
};

export const dp2dCode = (mode) => ({
  paths: [['base', 'first row and first column: 1 way each'], ['fill', 'dp[r][c] = dp[r-1][c] + dp[r][c-1];          // from above + from the left']],
  obstacles: [['base', 'dp[0][0] = 1 unless blocked'], ['block', 'if (blocked) dp[r][c] = 0;                       // no way to stand here'], ['fill', 'else dp[r][c] = above + left;']],
  minsum: [['base', 'dp[0][0] = g[0][0];  edges: only one way in'], ['fill', 'dp[r][c] = min(dp[r-1][c], dp[r][c-1]) + g[r][c];   // min instead of +']],
  square: [['zero', 'if (m[r][c] == 0) dp[r][c] = 0;'], ['fill', 'else dp[r][c] = 1 + min(top, left, top-left);    // limited by the smallest']],
  knapsack: [['base', 'dp[0][c] = 0;                                    // no items, no value'], ['skip', 'dp[i][c] = dp[i-1][c];                           // skip item i'], ['take', 'if (c ≥ wt) dp[i][c] = max(dp[i][c], dp[i-1][c - wt] + val);   // take it']],
  ways: [['base', 'ways[0][0] = 1;                                  // one way to make 0: no coins'], ['fill', 'ways[i][a] = ways[i-1][a] + ways[i][a - coin];   // without this coin + with one more of it']],
  lcs: [['base', 'row 0 and column 0 = 0                           // an empty prefix'], ['match', 'if (a[i-1] == b[j-1]) dp[i][j] = dp[i-1][j-1] + 1;   // both letters join'], ['fill', 'else dp[i][j] = max(dp[i-1][j], dp[i][j-1]);    // drop one letter']],
  edit: [['base', 'dp[i][0] = i;  dp[0][j] = j;                     // delete all / insert all'], ['match', 'if (a[i-1] == b[j-1]) dp[i][j] = dp[i-1][j-1];  // free'], ['fill', 'else 1 + min(replace ↖, delete ↑, insert ←)']],
  balloons: [['len', 'for len = 2…: for each (l, r) with r = l + len'], ['fill', 'dp[l][r] = max over l<k<r of dp[l][k] + a[l]·a[k]·a[r] + dp[k][r]   // k bursts LAST']],
  stock: [['sold', 'sold = hold + price;                              // sell today'], ['hold', 'hold = max(hold, rest − price);                   // keep, or buy (only after resting)'], ['rest', 'rest = max(rest, yesterday\'s sold);               // cooldown ends']],
})[mode];

export function dp2dAnswer(input) {
  const { mode } = input;
  if (mode === 'paths') { const { R, C } = input; let f = 1; for (let k = 1; k < R; k++) f = (f * (C - 1 + k)) / k; return Math.round(f); }
  if (mode === 'obstacles' || mode === 'minsum') {
    const g = input.grid, R = g.length, C = g[0].length;
    if (mode === 'obstacles') {
      const go = (r, c) => (r >= R || c >= C || g[r][c] ? 0 : r === R - 1 && c === C - 1 ? 1 : go(r + 1, c) + go(r, c + 1));
      return go(0, 0);
    }
    const go = (r, c) => (r === R - 1 && c === C - 1 ? g[r][c] : g[r][c] + Math.min(r + 1 < R ? go(r + 1, c) : Infinity, c + 1 < C ? go(r, c + 1) : Infinity));
    return go(0, 0);
  }
  if (mode === 'square') {
    const g = input.grid; let best = 0;
    for (let r = 0; r < g.length; r++) for (let c = 0; c < g[0].length; c++) for (let s = 1; r + s <= g.length && c + s <= g[0].length; s++) {
      let ok = true;
      for (let x = r; x < r + s && ok; x++) for (let y = c; y < c + s; y++) if (!g[x][y]) { ok = false; break; }
      if (ok) best = Math.max(best, s * s);
    }
    return best;
  }
  if (mode === 'knapsack') {
    const { wt, val, cap } = input; let best = 0;
    for (let m = 0; m < 1 << wt.length; m++) { let w = 0, v = 0; for (let k = 0; k < wt.length; k++) if (m >> k & 1) { w += wt[k]; v += val[k]; } if (w <= cap) best = Math.max(best, v); }
    return best;
  }
  if (mode === 'ways') {
    const { coins, amount } = input;
    const go = (i, a) => (a === 0 ? 1 : i === coins.length || a < 0 ? 0 : go(i, a - coins[i]) + go(i + 1, a));
    return go(0, amount);
  }
  if (mode === 'lcs') {
    const { a, b } = input;
    const go = (i, j) => (i === a.length || j === b.length ? 0 : a[i] === b[j] ? 1 + go(i + 1, j + 1) : Math.max(go(i + 1, j), go(i, j + 1)));
    return go(0, 0);
  }
  if (mode === 'edit') {
    const { a, b } = input;
    const go = (i, j) => (i === a.length ? b.length - j : j === b.length ? a.length - i : a[i] === b[j] ? go(i + 1, j + 1) : 1 + Math.min(go(i + 1, j + 1), go(i + 1, j), go(i, j + 1)));
    return go(0, 0);
  }
  if (mode === 'balloons') {
    const go = (arr) => (arr.length === 0 ? 0 : Math.max(...arr.map((v, k) => (arr[k - 1] ?? 1) * v * (arr[k + 1] ?? 1) + go([...arr.slice(0, k), ...arr.slice(k + 1)]))));
    return go(input.nums);
  }
  const p = input.prices;
  const go = (i, holding, cool) => {
    if (i === p.length) return 0;
    let best = go(i + 1, holding, false);
    if (holding) best = Math.max(best, p[i] + go(i + 1, false, true));
    else if (!cool) best = Math.max(best, -p[i] + go(i + 1, true, false));
    return best;
  };
  return go(0, false, false);
}

export function dp2d(input) {
  const { mode } = input;
  const steps = [];
  let rows, cols, cells, given = null, blocked = null;
  const snap = (x) => steps.push({ mode, rows, cols, cells: cells.map((r) => [...r]), given, blocked, deps: [], path: null, ...x });
  const fillAll = (R, C) => Array.from({ length: R }, () => Array(C).fill(null));

  if (mode === 'paths' || mode === 'obstacles' || mode === 'minsum') {
    const g = mode === 'paths' ? Array.from({ length: input.R }, () => Array(input.C).fill(0)) : input.grid;
    const R = g.length, C = g[0].length;
    rows = g.map((_, k) => String(k)); cols = g[0].map((_, k) => String(k));
    cells = fillAll(R, C);
    given = mode === 'minsum' ? g : null;
    blocked = mode === 'obstacles' ? g.map((r) => r.map((v) => v === 1)) : null;
    snap({
      kind: 'start', cur: null, lines: [],
      title: { paths: `Ways from the top-left to the bottom-right of a ${R} × ${C} grid`, obstacles: 'Ways through a grid with obstacles', minsum: 'The cheapest path through the grid' }[mode],
      text: { paths: 'You can only move right or down. dp[r][c] = the number of ways to reach (r, c). Every path into a cell arrives from above or from the left, so dp[r][c] = above + left.', obstacles: 'Same recurrence, but a blocked cell has zero ways to stand on it, and that zero flows into everything after it.', minsum: 'Small numbers in each cell are costs. dp[r][c] = the cheapest total to reach (r, c): the cheaper of above and left, plus this cell\'s cost. Counting adds; optimising takes the min.' }[mode],
      calc: [`${R} × ${C}`],
    });
    if (mode === 'paths') {
      for (let c = 0; c < C; c++) cells[0][c] = 1;
      for (let r = 0; r < R; r++) cells[r][0] = 1;
      snap({ kind: 'base', cur: null, lines: ['base'], title: 'Edges: exactly one way each', text: 'A cell in the top row can only be reached by going right all the way; a cell in the left column only by going down. So the whole first row and first column are 1.', calc: ['dp[0][*] = 1', 'dp[*][0] = 1'] });
    }
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      if (mode === 'paths' && (r === 0 || c === 0)) continue;
      const up = r > 0 ? cells[r - 1][c] : null, left = c > 0 ? cells[r][c - 1] : null;
      const deps = [...(r > 0 ? [{ r: r - 1, c, tone: 'accent', label: '↓' }] : []), ...(c > 0 ? [{ r, c: c - 1, tone: 'accent', label: '→' }] : [])];
      if (mode === 'obstacles') {
        if (g[r][c]) {
          cells[r][c] = 0;
          snap({ kind: 'block', cur: [r, c], lines: ['block'], title: `(${r}, ${c}) is blocked: 0 ways`, text: 'Nothing can stand on an obstacle, so it contributes 0 to the cells after it.', calc: [`dp[${r}][${c}] = 0`] });
          continue;
        }
        cells[r][c] = r === 0 && c === 0 ? 1 : (up ?? 0) + (left ?? 0);
        snap({ kind: r === 0 && c === 0 ? 'base' : 'fill', cur: [r, c], deps, lines: r === 0 && c === 0 ? ['base'] : ['fill'], title: r === 0 && c === 0 ? 'Start: 1 way' : `dp[${r}][${c}] = ${up ?? 0} + ${left ?? 0} = ${cells[r][c]}`, text: r === 0 && c === 0 ? 'Standing on the start: exactly one way (do nothing).' : `${up === null ? 'Nothing above (edge)' : `${up} way${up === 1 ? '' : 's'} from above`}, ${left === null ? 'nothing on the left (edge)' : `${left} from the left`}${(up === 0 || left === 0) && (up !== null || left !== null) ? ' (a 0 means that side is blocked off)' : ''}.`, calc: [`${up ?? 0} + ${left ?? 0} = ${cells[r][c]}`] });
        continue;
      }
      if (mode === 'minsum') {
        const best = r === 0 && c === 0 ? 0 : Math.min(up ?? Infinity, left ?? Infinity);
        cells[r][c] = best + g[r][c];
        const fromUp = up !== null && (left === null || up <= left);
        snap({ kind: r === 0 && c === 0 ? 'base' : 'fill', cur: [r, c], deps: deps.map((d) => ({ ...d, tone: (d.r < r) === fromUp ? 'success' : 'muted' })), lines: r === 0 && c === 0 ? ['base'] : ['fill'], title: r === 0 && c === 0 ? `Start: ${g[0][0]}` : `dp[${r}][${c}] = ${best} + ${g[r][c]} = ${cells[r][c]}`, text: r === 0 && c === 0 ? 'The path starts here and pays this cell\'s cost.' : `${up === null ? 'Top row: only from the left' : left === null ? 'Left column: only from above' : `From above costs ${up}, from the left ${left}; take the cheaper, ${best}`}, then pay this cell's ${g[r][c]}.`, calc: [`min(${up ?? '–'}, ${left ?? '–'}) + ${g[r][c]} = ${cells[r][c]}`] });
        continue;
      }
      cells[r][c] = up + left;
      snap({ kind: 'fill', cur: [r, c], deps, lines: ['fill'], title: `dp[${r}][${c}] = ${up} + ${left} = ${cells[r][c]}`, text: `Every path into (${r}, ${c}) arrives from above (${up} ways) or from the left (${left} ways), never both, so the counts add.`, calc: [`${up} + ${left} = ${cells[r][c]}`] });
    }
    let path = null;
    if (mode === 'minsum') {
      path = [[R - 1, C - 1]];
      for (let r = R - 1, c = C - 1; r || c;) { if (r && (!c || cells[r - 1][c] <= cells[r][c - 1])) r--; else c--; path.unshift([r, c]); }
    }
    const ans = cells[R - 1][C - 1];
    snap({ kind: 'done', cur: [R - 1, C - 1], path, lines: [], answer: `${ans}`, title: mode === 'minsum' ? `Cheapest path costs ${ans}` : `${ans} ways`, text: mode === 'minsum' ? 'The highlighted cells are that path, traced back by always stepping to the cheaper neighbour. O(rows × cols); one row of memory is enough.' : 'O(rows × cols). Each cell only reads the row above and its left neighbour, so one row of memory is enough: dp[c] += dp[c − 1].', calc: [`dp[${R - 1}][${C - 1}] = ${ans}`] });
    return steps;
  }

  if (mode === 'square') {
    const g = input.grid, R = g.length, C = g[0].length;
    rows = g.map((_, k) => String(k)); cols = g[0].map((_, k) => String(k));
    cells = fillAll(R, C);
    given = g;
    let best = 0, bestAt = null;
    snap({ kind: 'start', cur: null, lines: [], title: 'The largest square of 1s', text: 'dp[r][c] = the side of the biggest all-1 square whose bottom-right corner is (r, c). It can only be one bigger than the smallest square ending at its three neighbours (top, left, top-left); cells outside the grid count as 0.', calc: [`${R} × ${C}`] });
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      if (!g[r][c]) { cells[r][c] = 0; continue; }
      const t = r ? cells[r - 1][c] : 0, l = c ? cells[r][c - 1] : 0, tl = r && c ? cells[r - 1][c - 1] : 0;
      cells[r][c] = 1 + Math.min(t, l, tl);
      if (cells[r][c] > best) { best = cells[r][c]; bestAt = [r, c]; }
      const m = Math.min(t, l, tl);
      snap({ kind: 'fill', cur: [r, c], lines: ['zero', 'fill'], deps: [...(r ? [{ r: r - 1, c, tone: t === m ? 'success' : 'muted' }] : []), ...(c ? [{ r, c: c - 1, tone: l === m ? 'success' : 'muted' }] : []), ...(r && c ? [{ r: r - 1, c: c - 1, tone: tl === m ? 'success' : 'muted' }] : [])], title: `dp[${r}][${c}] = 1 + min(${t}, ${l}, ${tl}) = ${cells[r][c]}`, text: `Top ${t}, left ${l}, top-left ${tl}. The square here can only grow as far as the smallest of them allows, plus this cell: side ${cells[r][c]}.${cells[r][c] === best && bestAt[0] === r && bestAt[1] === c && best > 1 ? ' The biggest so far.' : ''} (0 cells are skipped: they stay 0.)`, calc: [`1 + ${m} = ${cells[r][c]}`, `best side = ${best}`] });
    }
    const path = [];
    if (bestAt) for (let r = bestAt[0] - best + 1; r <= bestAt[0]; r++) for (let c = bestAt[1] - best + 1; c <= bestAt[1]; c++) path.push([r, c]);
    snap({ kind: 'done', cur: bestAt, path, lines: [], answer: `area = ${best * best}`, title: `Biggest square: side ${best}, area ${best * best}`, text: 'Padding the table with a row and column of zeros removes the edge checks; here the edges just count as 0. O(rows × cols).', calc: [`best side ${best}`, `area ${best * best}`] });
    return steps;
  }

  if (mode === 'knapsack' || mode === 'ways') {
    const isK = mode === 'knapsack';
    const items = isK ? input.wt.map((w, k) => ({ w, v: input.val[k] })) : input.coins.map((w) => ({ w }));
    const W = isK ? input.cap : input.amount;
    rows = ['none', ...items.map((it) => (isK ? `w${it.w} $${it.v}` : `coin ${it.w}`))];
    cols = Array.from({ length: W + 1 }, (_, k) => String(k));
    cells = fillAll(items.length + 1, W + 1);
    for (let c = 0; c <= W; c++) cells[0][c] = isK ? 0 : c === 0 ? 1 : 0;
    snap({ kind: 'start', cur: null, lines: [], title: isK ? `Best value in a bag of capacity ${W}` : `Ways to make ${W} with coins ${list(input.coins)}`, text: isK ? 'Row i uses only the first i items; column c is the capacity. For each item: skip it (the value from the row above) or take it if it fits (the row above at c − weight, plus its value). Each item at most once, which is why "take" looks at the row above.' : 'Row i uses only the first i coins; column a is the amount. ways = the ways without this coin (row above) + the ways that use at least one more of it (same row, a − coin). Coins in the outer loop count each combination once, whatever the order.', calc: isK ? items.map((it, k) => `item ${k + 1}: weight ${it.w}, value ${it.v}`) : [`coins ${list(input.coins)}`] });
    snap({ kind: 'base', cur: null, lines: ['base'], title: isK ? 'No items: value 0 everywhere' : 'No coins: one way to make 0, none for anything else', text: isK ? 'With no items to choose from, every capacity is worth 0.' : 'Making 0 needs no coins: exactly one way (take nothing). Any other amount is impossible with no coins.', calc: [isK ? 'dp[0][*] = 0' : 'ways[0][0] = 1'] });
    for (let i = 1; i <= items.length; i++) for (let c = 0; c <= W; c++) {
      const it = items[i - 1];
      const up = cells[i - 1][c];
      if (c < it.w) {
        // every cell this item can't reach is a plain copy of the row above: one step for the lot
        cells[i][c] = up;
        if (c === Math.min(it.w, W + 1) - 1) {
          snap({
            kind: 'skip', cur: [i, c], lines: isK ? ['skip'] : ['fill'], deps: [{ r: i - 1, c, tone: 'success', label: 'copy' }],
            title: `${c === 0 ? `Column 0` : `Columns 0–${c}`}: ${isK ? `item ${i} (weight ${it.w}) doesn't fit` : `coin ${it.w} is too big`}, copy the row above`,
            text: isK ? `Every capacity below ${it.w} is too small for item ${i}, so it can only be skipped there: those cells are the row above, unchanged.` : `Amounts below ${it.w} can't use a ${it.w} coin at all, so their counts are the row above, unchanged.`,
            calc: [`${isK ? 'dp' : 'ways'}[${i}][0…${c}] = row ${i - 1}`],
          });
        }
        continue;
      }
      if (isK) {
        const fits = c >= it.w;
        const take = fits ? cells[i - 1][c - it.w] + it.v : null;
        cells[i][c] = fits ? Math.max(up, take) : up;
        const took = fits && take > up;
        snap({ kind: took ? 'take' : 'skip', cur: [i, c], lines: fits ? ['skip', 'take'] : ['skip'], deps: [{ r: i - 1, c, tone: took ? 'muted' : 'success', label: 'skip' }, ...(fits ? [{ r: i - 1, c: c - it.w, tone: took ? 'success' : 'muted', label: `+$${it.v}` }] : [])], title: `capacity ${c}, item ${i}: ${fits ? (took ? 'take it' : 'skip it') : "doesn't fit"} → ${cells[i][c]}`, text: fits ? `Skip: ${up}. Take: weight ${it.w} leaves ${c - it.w}, best there without this item is ${cells[i - 1][c - it.w]}, plus ${it.v} = ${take}. ${took ? 'Taking wins.' : 'Skipping is at least as good.'}` : `Item ${i} weighs ${it.w}, more than ${c}: it can only be skipped, so copy ${up} from above.`, calc: [`skip ${up}`, ...(fits ? [`take ${cells[i - 1][c - it.w]} + ${it.v} = ${take}`] : [])] });
      } else {
        const more = c >= it.w ? cells[i][c - it.w] : 0;
        cells[i][c] = up + more;
        snap({ kind: 'fill', cur: [i, c], lines: ['fill'], deps: [{ r: i - 1, c, tone: 'accent', label: 'without' }, ...(c >= it.w ? [{ r: i, c: c - it.w, tone: 'success', label: `+${it.w}` }] : [])], title: `ways to make ${c} using coins up to ${it.w}: ${up} + ${more} = ${cells[i][c]}`, text: `Without coin ${it.w}: ${up}. ${c >= it.w ? `With at least one ${it.w}: the ways to make ${c - it.w} with the same coins, ${more}.` : `${it.w} is bigger than ${c}, so it can't be used.`}`, calc: [`${up} + ${more} = ${cells[i][c]}`] });
      }
    }
    let path = null;
    if (isK) {
      path = [];
      for (let i = items.length, c = W; i > 0; i--) if (cells[i][c] !== cells[i - 1][c]) { path.push([i, c]); c -= items[i - 1].w; }
    }
    const ans = cells[items.length][W];
    snap({ kind: 'done', cur: [items.length, W], path, lines: [], answer: `${ans}`, title: isK ? `Best value: ${ans}` : `${ans} ways`, text: isK ? `Highlighted: the rows where the value changed, i.e. the items taken. With one row of memory, the capacity loop must run downwards so that dp[c − w] still holds the value without this item; upwards would let an item be taken twice.` : 'One row is enough here too, looping the amount upwards (reuse is allowed). Swapping the loops (amounts outside) would count orderings instead of combinations.', calc: [`answer ${ans}`] });
    return steps;
  }

  if (mode === 'lcs' || mode === 'edit') {
    const { a, b } = input;
    const isL = mode === 'lcs';
    rows = ['∅', ...a]; cols = ['∅', ...b];
    cells = fillAll(a.length + 1, b.length + 1);
    for (let i = 0; i <= a.length; i++) cells[i][0] = isL ? 0 : i;
    for (let j = 0; j <= b.length; j++) cells[0][j] = isL ? 0 : j;
    snap({ kind: 'start', cur: null, lines: [], title: isL ? `Longest common subsequence of "${a}" and "${b}"` : `Fewest edits to turn "${a}" into "${b}"`, text: isL ? 'dp[i][j] = the LCS of the first i letters of a and the first j of b. If the two last letters match, they both join the LCS (diagonal + 1). Otherwise, drop one letter from one string: the better of up and left.' : 'dp[i][j] = the fewest edits to turn the first i letters of a into the first j of b. Matching letters are free (diagonal). Otherwise pay 1 for the cheapest of: replace (diagonal), delete from a (up), insert from b (left).', calc: [`a = "${a}"`, `b = "${b}"`] });
    snap({ kind: 'base', cur: null, lines: ['base'], title: isL ? 'Empty prefixes: 0' : 'Edges: delete everything or insert everything', text: isL ? 'Nothing is common with an empty string.' : 'Turning i letters into nothing takes i deletions; turning nothing into j letters takes j insertions. These are not zeros, which is the part people forget.', calc: [isL ? 'row 0 and column 0 = 0' : 'dp[i][0] = i, dp[0][j] = j'] });
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
      const same = a[i - 1] === b[j - 1];
      const d = cells[i - 1][j - 1], u = cells[i - 1][j], l = cells[i][j - 1];
      if (isL) {
        cells[i][j] = same ? d + 1 : Math.max(u, l);
        snap({ kind: same ? 'match' : 'fill', cur: [i, j], lines: [same ? 'match' : 'fill'], deps: same ? [{ r: i - 1, c: j - 1, tone: 'success', label: '+1' }] : [{ r: i - 1, c: j, tone: u >= l ? 'success' : 'muted' }, { r: i, c: j - 1, tone: l > u ? 'success' : 'muted' }], title: same ? `'${a[i - 1]}' = '${b[j - 1]}': ${d} + 1 = ${cells[i][j]}` : `'${a[i - 1]}' ≠ '${b[j - 1]}': max(${u}, ${l}) = ${cells[i][j]}`, text: same ? `The letters match, so they can both end the common subsequence: take the LCS without them (diagonal, ${d}) and add 1.` : `They differ, so at least one of them is not in the LCS. Drop the letter from a (up: ${u}) or from b (left: ${l}), whichever keeps more.`, calc: [same ? `${d} + 1 = ${cells[i][j]}` : `max(${u}, ${l}) = ${cells[i][j]}`] });
      } else {
        const m = Math.min(d, u, l);
        cells[i][j] = same ? d : 1 + m;
        const op = d === m ? 'replace' : u === m ? 'delete' : 'insert';
        snap({ kind: same ? 'match' : 'fill', cur: [i, j], lines: [same ? 'match' : 'fill'], deps: same ? [{ r: i - 1, c: j - 1, tone: 'success', label: 'free' }] : [{ r: i - 1, c: j - 1, tone: op === 'replace' ? 'success' : 'muted', label: 'rep' }, { r: i - 1, c: j, tone: op === 'delete' ? 'success' : 'muted', label: 'del' }, { r: i, c: j - 1, tone: op === 'insert' ? 'success' : 'muted', label: 'ins' }], title: same ? `'${a[i - 1]}' = '${b[j - 1]}': free, ${cells[i][j]}` : `'${a[i - 1]}' ≠ '${b[j - 1]}': ${op}, 1 + ${m} = ${cells[i][j]}`, text: same ? `Matching letters cost nothing: copy the diagonal, ${d}.` : `Replace '${a[i - 1]}' with '${b[j - 1]}' (↖ ${d}), delete '${a[i - 1]}' (↑ ${u}) or insert '${b[j - 1]}' (← ${l}). The cheapest is ${op}: 1 + ${m}.`, calc: [same ? `= ${d}` : `1 + min(${d}, ${u}, ${l}) = ${cells[i][j]}`] });
      }
    }
    const path = [];
    for (let i = a.length, j = b.length; i > 0 && j > 0;) {
      if (a[i - 1] === b[j - 1]) { path.push([i, j]); i--; j--; continue; }
      if (isL) { if (cells[i - 1][j] >= cells[i][j - 1]) i--; else j--; continue; }
      path.push([i, j]);
      const d = cells[i - 1][j - 1], u = cells[i - 1][j], l = cells[i][j - 1];
      const m = Math.min(d, u, l);
      if (d === m) { i--; j--; } else if (u === m) i--; else j--;
    }
    const ans = cells[a.length][b.length];
    const common = isL ? path.reverse().map(([i]) => a[i - 1]).join('') : null;
    snap({ kind: 'done', cur: [a.length, b.length], path: isL ? path : path.reverse(), lines: [], answer: `${ans}`, title: isL ? `LCS = ${ans} ("${common}")` : `${ans} edits`, text: isL ? 'Highlighted: the matches on one longest common subsequence, found by walking back from the corner (diagonal on a match, otherwise towards the bigger neighbour). O(n·m).' : 'Highlighted: the cells where an edit was paid on one cheapest route back from the corner. O(n·m) time; two rows of memory are enough.', calc: [`dp[${a.length}][${b.length}] = ${ans}`] });
    return steps;
  }

  if (mode === 'balloons') {
    const a = [1, ...input.nums, 1];
    const N = a.length;
    rows = a.map((v, k) => `${k}:${v}`); cols = rows;
    cells = Array.from({ length: N }, (_, l) => Array.from({ length: N }, (_, r) => (r === l + 1 ? 0 : r > l ? null : '')));
    snap({ kind: 'start', cur: null, lines: [], title: `Burst balloons ${list(input.nums)}`, text: 'Pad with a virtual 1 at each end. dp[l][r] = the most coins from bursting every balloon strictly between l and r. Choose which balloon k bursts LAST in that range: at that moment its neighbours are exactly l and r, and the two sides were independent.', calc: [`a = ${list(a)} (padded)`] });
    snap({ kind: 'base', cur: null, lines: ['len'], title: 'Neighbours with nothing between: 0', text: 'When r = l + 1 there is no balloon strictly between them, so there is nothing to burst.', calc: ['dp[l][l+1] = 0'] });
    for (let len = 2; len < N; len++) for (let l = 0; l + len < N; l++) {
      const r = l + len;
      const opts = [];
      for (let k = l + 1; k < r; k++) opts.push({ k, v: cells[l][k] + a[l] * a[k] * a[r] + cells[k][r] });
      const best = opts.reduce((m, o) => (o.v > m.v ? o : m));
      cells[l][r] = best.v;
      snap({ kind: 'fill', cur: [l, r], lines: ['len', 'fill'], deps: [{ r: l, c: best.k, tone: 'success' }, { r: best.k, c: r, tone: 'success' }], title: `dp[${l}][${r}] = ${best.v}: balloon ${best.k} (${a[best.k]}) last`, text: `Balloons ${l + 1}…${r - 1} lie between ${l} and ${r} (length ${len}). Try each as the last to burst: ${opts.map((o) => `k=${o.k}: ${cells[l][o.k]} + ${a[l]}·${a[o.k]}·${a[r]} + ${cells[o.k][r]} = ${o.v}`).join('; ')}.`, calc: opts.map((o) => `k=${o.k} → ${o.v}`) });
    }
    snap({ kind: 'done', cur: [0, N - 1], lines: [], answer: `${cells[0][N - 1]}`, title: `Most coins: ${cells[0][N - 1]}`, text: 'The table fills by interval length, short to long, because every range needs the shorter ranges inside it. O(n³): n² ranges, n choices of k each.', calc: [`dp[0][${N - 1}] = ${cells[0][N - 1]}`] });
    return steps;
  }

  // stock with cooldown
  const p = input.prices;
  rows = ['hold', 'sold', 'rest'];
  cols = p.map((v, k) => `d${k}: ${v}`);
  cells = fillAll(3, p.length);
  let hold = -Infinity, sold = 0, rest = 0;
  snap({ kind: 'start', cur: null, lines: [], title: `Stock with cooldown: prices ${list(p)}`, text: 'Three states at the end of each day: hold (own a share), sold (sold today, so tomorrow you must rest), rest (no share, free to buy). Each value is the best profit so far in that state, computed only from yesterday\'s three values.', calc: ['hold = −∞, sold = 0, rest = 0'] });
  const fmtv = (v) => (v === -Infinity ? '−∞' : v);
  p.forEach((price, d) => {
    const ph = hold, ps = sold, pr = rest;
    sold = ph + price;
    hold = Math.max(ph, pr - price);
    rest = Math.max(pr, ps);
    cells[0][d] = fmtv(hold); cells[1][d] = fmtv(sold); cells[2][d] = rest;
    const prev = d - 1;
    snap({
      kind: 'fill', cur: [0, d], col: d, lines: ['sold', 'hold', 'rest'],
      deps: prev >= 0 ? [{ r: 0, c: prev, tone: 'accent', label: '+p' }, { r: 2, c: prev, tone: hold !== ph ? 'success' : 'muted', label: '−p' }, { r: 1, c: prev, tone: 'note' }] : [],
      title: `Day ${d}, price ${price}: hold ${fmtv(hold)}, sold ${fmtv(sold)}, rest ${rest}`,
      text: `sold = yesterday's hold + ${price} = ${fmtv(sold)}. hold = max(keep ${fmtv(ph)}, buy from rest ${pr} − ${price} = ${pr - price}) = ${fmtv(hold)}. rest = max(rest ${pr}, yesterday's sold ${fmtv(ps)}) = ${rest}. All three use yesterday's values, which is why sold is computed before hold changes and yesterday's sold is kept for rest.`,
      calc: [`sold = ${fmtv(ph)} + ${price} = ${fmtv(sold)}`, `hold = max(${fmtv(ph)}, ${pr - price}) = ${fmtv(hold)}`, `rest = max(${pr}, ${fmtv(ps)}) = ${rest}`],
    });
  });
  const ans = Math.max(sold, rest);
  snap({ kind: 'done', cur: null, lines: [], answer: `${ans}`, title: `Best profit: ${ans}`, text: 'At the end you should not be holding, so the answer is the better of sold and rest. The whole stock family is this machine with small changes: a fee on selling, at most k transactions (more states), and so on.', calc: [`max(${fmtv(sold)}, ${rest}) = ${ans}`] });
  return steps;
}

export function parseDp2d(values, input) {
  const { mode } = input;
  if (mode === 'paths') {
    const R = parseInt1(values.R, { min: 2, max: 6, name: 'rows' }); if (R.error) return R;
    const C = parseInt1(values.C, { min: 2, max: 7, name: 'columns' }); if (C.error) return C;
    return { input: { mode, R: R.v, C: C.v } };
  }
  if (mode === 'obstacles' || mode === 'square') {
    const rowsT = String(values.grid ?? '').split(/[;\n|]/).map((r) => r.replace(/[\s,]/g, '')).filter(Boolean);
    if (!rowsT.length || rowsT.length > 6 || rowsT.some((r) => r.length !== rowsT[0].length || r.length > 7 || /[^01]/.test(r))) return { error: 'Rows of 0s and 1s separated by ; (up to 6 rows of 7), all the same length.' };
    const grid = rowsT.map((r) => [...r].map(Number));
    if (mode === 'obstacles' && grid[0][0]) return { error: 'The start (top-left) must be open.' };
    return { input: { mode, grid } };
  }
  if (mode === 'minsum') {
    const rowsT = String(values.grid ?? '').split(/[;\n|]/).map((r) => r.trim()).filter(Boolean);
    const grid = [];
    for (const r of rowsT) { const p = parseInts(r, { min: 0, max: 9, minLen: 1, maxLen: 5, name: 'each row' }); if (p.error) return p; grid.push(p.arr); }
    if (!grid.length || grid.length > 5 || grid.some((r) => r.length !== grid[0].length)) return { error: 'Up to 5 rows, all the same length, separated by ;' };
    return { input: { mode, grid } };
  }
  if (mode === 'knapsack') {
    const w = parseInts(values.wt, { min: 1, max: 6, minLen: 1, maxLen: 4, name: 'weights' }); if (w.error) return w;
    const v = parseInts(values.val, { min: 1, max: 99, minLen: w.arr.length, maxLen: w.arr.length, name: 'values' }); if (v.error) return { error: 'Give one value per weight.' };
    const c = parseInt1(values.cap, { min: 1, max: 7, name: 'capacity' }); if (c.error) return c;
    return { input: { mode, wt: w.arr, val: v.arr, cap: c.v } };
  }
  if (mode === 'ways') {
    const c = parseInts(values.coins, { min: 1, max: 9, minLen: 1, maxLen: 3, name: 'coins' }); if (c.error) return c;
    const a = parseInt1(values.amount, { min: 1, max: 8, name: 'amount' }); if (a.error) return a;
    return { input: { mode, coins: [...new Set(c.arr)].sort((x, y) => x - y), amount: a.v } };
  }
  if (mode === 'lcs' || mode === 'edit') {
    const a = String(values.a ?? '').trim(), b = String(values.b ?? '').trim();
    if (!/^[a-z]{1,6}$/.test(a) || !/^[a-z]{1,6}$/.test(b)) return { error: 'Two words of lower-case letters, up to 6 letters each.' };
    return { input: { mode, a, b } };
  }
  if (mode === 'balloons') {
    const r = parseInts(values.nums, { min: 1, max: 9, minLen: 1, maxLen: 5, name: 'balloons' });
    return r.error ? r : { input: { mode, nums: r.arr } };
  }
  const r = parseInts(values.prices, { min: 0, max: 20, minLen: 1, maxLen: 8, name: 'prices' });
  return r.error ? r : { input: { mode, prices: r.arr } };
}

export function dp2dValues(input) {
  const { mode } = input;
  if (mode === 'paths') return { R: String(input.R), C: String(input.C) };
  if (mode === 'obstacles' || mode === 'square') return { grid: input.grid.map((r) => r.join('')).join('; ') };
  if (mode === 'minsum') return { grid: input.grid.map((r) => r.join(' ')).join('; ') };
  if (mode === 'knapsack') return { wt: input.wt.join(', '), val: input.val.join(', '), cap: String(input.cap) };
  if (mode === 'ways') return { coins: input.coins.join(', '), amount: String(input.amount) };
  if (mode === 'lcs' || mode === 'edit') return { a: input.a, b: input.b };
  if (mode === 'balloons') return { nums: input.nums.join(', ') };
  return { prices: input.prices.join(', ') };
}

export function randomDp2d(input, rand = Math.random) {
  const g = rng(rand);
  const { mode } = input;
  const word = (n) => Array.from({ length: n }, () => g.pick('abcde'.split(''))).join('');
  if (mode === 'paths') return { mode, R: g.int(3, 5), C: g.int(3, 6) };
  if (mode === 'obstacles') { const R = g.int(3, 5), C = g.int(3, 5); const grid = Array.from({ length: R }, () => Array.from({ length: C }, () => (g.bool(0.2) ? 1 : 0))); grid[0][0] = 0; return { mode, grid }; }
  if (mode === 'square') return { mode, grid: Array.from({ length: g.int(3, 5) }, (_, __, C = 5) => Array.from({ length: 5 }, () => (g.bool(0.7) ? 1 : 0))) };
  if (mode === 'minsum') { const R = g.int(2, 4), C = g.int(2, 4); return { mode, grid: Array.from({ length: R }, () => Array.from({ length: C }, () => g.int(0, 9))) }; }
  if (mode === 'knapsack') { const n = g.int(2, 4); return { mode, wt: Array.from({ length: n }, () => g.int(1, 4)), val: Array.from({ length: n }, () => g.int(5, 40)), cap: g.int(3, 6) }; }
  if (mode === 'ways') return { mode, coins: [...new Set([1, g.int(2, 3), g.int(4, 5)])], amount: g.int(4, 7) };
  if (mode === 'lcs' || mode === 'edit') return { mode, a: word(g.int(3, 5)), b: word(g.int(2, 4)) };
  if (mode === 'balloons') return { mode, nums: Array.from({ length: g.int(2, 4) }, () => g.int(1, 9)) };
  return { mode, prices: Array.from({ length: g.int(4, 7) }, () => g.int(0, 9)) };
}

// ---------------------------------------------------------------- tree DP: house robber III

export const ROBBER_TREE = {
  lesson: { label: '3, 4, 5, 1, 3, null, 1', input: { tree: [3, 4, 5, 1, 3, null, 1] } },
  deep: { label: 'Skip a level', input: { tree: [4, 1, null, 2, null, 3] } },
};

export const robberTreeCode = [
  ['base', 'if (n == null) return {0, 0};'],
  ['kids', 'int[] l = rob(n.left), r = rob(n.right);'],
  ['take', 'take = n.val + l.skip + r.skip;                    // rob n: its children must be skipped'],
  ['skip', 'skip = max(l.take, l.skip) + max(r.take, r.skip);  // skip n: each child does its best'],
];

export function robberTreeAnswer({ tree }) {
  const t = buildTree(tree);
  const ids = Object.keys(t.nodes);
  let best = 0;
  for (let m = 0; m < 1 << ids.length; m++) {
    const chosen = new Set(ids.filter((_, k) => m >> k & 1));
    let ok = true, sum = 0;
    for (const id of chosen) { const n = t.nodes[id]; if (chosen.has(n.left) || chosen.has(n.right)) ok = false; sum += n.v; }
    if (ok) best = Math.max(best, sum);
  }
  return best;
}

export function robberTree({ tree }) {
  const t = buildTree(tree);
  const N = t.nodes;
  const pairs = {};
  const steps = [];
  const snap = (x) => steps.push({ tree, pairs: { ...pairs }, ...x });
  snap({ kind: 'start', cur: null, lines: [], title: 'House Robber III: houses on a tree', text: 'Robbing two houses joined by an edge sets off the alarm. A single "best" per subtree isn\'t enough, because the parent needs to know whether that best robbed the child. So every node returns a pair: [take, skip] = the best for its subtree if it is robbed, and if it isn\'t.', calc: [`tree: ${showTree(tree)}`] });
  const go = (id) => {
    if (id === null) return [0, 0];
    const n = N[id];
    const l = go(n.left), r = go(n.right);
    const take = n.v + l[1] + r[1];
    const skip = Math.max(...l) + Math.max(...r);
    pairs[id] = [take, skip];
    const leaf = n.left === null && n.right === null;
    snap({ kind: 'node', cur: id, lines: leaf ? ['base', 'take', 'skip'] : ['kids', 'take', 'skip'], title: `${n.v}: [take ${take}, skip ${skip}]`, text: leaf ? `A leaf: rob it for ${n.v}, or skip it for 0.` : `take: rob ${n.v}, so both children must be skipped: ${n.v} + ${l[1]} + ${r[1]} = ${take}. skip: the children are free, each gives its better option: ${Math.max(...l)} + ${Math.max(...r)} = ${skip}.`, calc: [`take = ${n.v} + ${l[1]} + ${r[1]} = ${take}`, `skip = ${Math.max(...l)} + ${Math.max(...r)} = ${skip}`] });
    return [take, skip];
  };
  const [take, skip] = go(t.root);
  snap({ kind: 'done', cur: t.root, lines: [], answer: `max loot = ${Math.max(take, skip)}`, title: `Most loot: max(${take}, ${skip}) = ${Math.max(take, skip)}`, text: 'Each node was visited once and returned two numbers: O(n). Trying every set of houses would be O(2ⁿ); returning the pair is what keeps the parent informed.', calc: [`max(${take}, ${skip})`] });
  return steps;
}
