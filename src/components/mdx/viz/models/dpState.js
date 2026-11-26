/**
 * State-machine and bitmask tables for <DpGridViz> (the DP State Machine lesson).
 *   stock2, fee, stock3, stockk   rows = states (hold / cash, buy j / sell j), columns = days
 *   attendance                    rows = (absences, Ls at the end), columns = record length
 *   beautiful, partition, sessions one row per set (mask): its bits, then the value for that set
 *   visitall                      BFS over (set visited, current node), one level per step
 *   superstring                   dp[set][last word], TSP style
 * Same step shape as dp2d. Pure, so scripts/viz-check.mjs can compare each mode with a brute force.
 */
import { list, rng } from './util.js';

export const STATE = {
  stock2: { label: 'Stock II: hold / cash', input: { mode: 'stock2', prices: [7, 1, 5, 3, 6, 4] } },
  fee: { label: 'Stock with a fee', input: { mode: 'fee', prices: [1, 3, 2, 8, 4, 9], fee: 2 } },
  stock3: { label: 'Stock III: two trades', input: { mode: 'stock3', prices: [3, 3, 5, 0, 0, 3, 1, 4] } },
  stockk: { label: 'Stock IV: k trades', input: { mode: 'stockk', k: 2, prices: [3, 2, 6, 5, 0, 3] } },
  attendance: { label: 'Attendance records', input: { mode: 'attendance', n: 4 } },
  beautiful: { label: 'Beautiful arrangement', input: { mode: 'beautiful', n: 3 } },
  partition: { label: 'Partition into k', input: { mode: 'partition', nums: [4, 1, 3, 2], k: 2 } },
  partitionNo: { label: 'Partition: impossible', input: { mode: 'partition', nums: [3, 3, 2], k: 2 } },
  sessions: { label: 'Work sessions', input: { mode: 'sessions', tasks: [2, 3, 3, 4], T: 6 } },
  visitall: { label: 'Visit every node', input: { mode: 'visitall', n: 4, edges: [[0, 1], [0, 2], [0, 3]] } },
  superstring: { label: 'Shortest superstring', input: { mode: 'superstring', words: ['gcta', 'ctaagt', 'ttca'] } },
};

export const stateCode = (mode) => ({
  stock2: [['init', 'hold = −∞;  cash = 0;'], ['cash', 'cash = max(cash, hold + p);          // stay out, or sell today'], ['hold', 'hold = max(hold, prevCash − p);      // keep, or buy today'], ['ans', 'return cash;']],
  fee: [['init', 'hold = −∞;  cash = 0;'], ['cash', 'cash = max(cash, hold + p − fee);    // sell pays the fee'], ['hold', 'hold = max(hold, prevCash − p);'], ['ans', 'return cash;']],
  stock3: [['init', 'buy1 = buy2 = −∞;  sell1 = sell2 = 0;'], ['buy', 'buy1 = max(buy1, −p);   buy2 = max(buy2, sell1 − p);   // yesterday\'s values'], ['sell', 'sell1 = max(sell1, buy1 + p);   sell2 = max(sell2, buy2 + p);'], ['ans', 'return sell2;']],
  stockk: [['init', 'buy[j] = −∞;  sell[j] = 0;            // j = 1..k, sell[0] = 0'], ['buy', 'buy[j] = max(buy[j], sell[j−1] − p);   // the j-th buy follows the (j−1)-th sell'], ['sell', 'sell[j] = max(sell[j], buy[j] + p);'], ['ans', 'return sell[k];']],
  attendance: [['init', 'count[A0 L0] = 1;                       // the empty record'], ['P', 'add P: (a, any L) → (a, L0)'], ['A', 'add A: (A0, any L) → (A1, L0)'], ['L', 'add L: (a, L0) → (a, L1),  (a, L1) → (a, L2)'], ['ans', 'return sum of all six counts;']],
  beautiful: [['base', 'ways[0] = 1;                                // nothing placed'], ['fill', 'pos = bitCount(mask);  for x in mask: if (x % pos == 0 || pos % x == 0)'], ['add', '    ways[mask] += ways[mask without x];      // x sits at position pos'], ['ans', 'return ways[full];']],
  partition: [['base', 'fill[0] = 0;  target = total / k;'], ['fill', 'for x in mask: if (fill[mask − x] ≥ 0 && fill[mask − x] + x ≤ target)'], ['add', '    fill[mask] = (fill[mask − x] + x) % target;   // a full bucket wraps to 0'], ['ans', 'return fill[full] == 0;']],
  sessions: [['base', 'best[0] = (1 session, 0 h used);'], ['fill', 'for last task t in mask: from (s, load) = best[mask − t]'], ['add', '    load + t ≤ T ? (s, load + t) : (s + 1, t);   keep the smallest pair'], ['ans', 'return best[full].sessions;']],
  visitall: [['base', 'queue every (v, {v}) at distance 0;'], ['fill', 'for (v, mask) in this level: for u next to v:'], ['add', '    state (u, mask | 1<<u), if unseen: distance + 1'], ['ans', 'stop at the first state whose mask is full']],
  superstring: [['base', 'len[{j}][j] = word[j].length;'], ['fill', 'len[mask][j] = min over i of len[mask − j][i] + word[j].length − overlap(i, j)'], ['ans', 'answer = min over j of len[full][j]; walk back to build the string']],
})[mode];

const fmt = (v) => (v === -Infinity ? '−∞' : v);
const bitCount = (m) => { let c = 0; for (; m; m &= m - 1) c++; return c; };
const byCount = (a, b) => bitCount(a) - bitCount(b) || a - b;
const setOf = (mask, names) => { const s = names.filter((_, i) => mask >> i & 1); return s.length ? `{${s.join(',')}}` : '∅'; };
const overlap = (a, b) => { for (let k = Math.min(a.length, b.length) - 1; k > 0; k--) if (a.endsWith(b.slice(0, k))) return k; return 0; };

// ---------------------------------------------------------------- brute forces

const perms = (xs) => (xs.length <= 1 ? [xs] : xs.flatMap((x, i) => perms([...xs.slice(0, i), ...xs.slice(i + 1)]).map((p) => [x, ...p])));

export function stateAnswer(input) {
  const { mode } = input;
  if (['stock2', 'fee', 'stock3', 'stockk'].includes(mode)) {
    const p = input.prices, k = mode === 'stock3' ? 2 : mode === 'stockk' ? input.k : Infinity, fee = input.fee ?? 0;
    // try every action sequence: on each day wait, buy (if free and trades left) or sell (if holding)
    const go = (d, holding, left) => {
      if (d === p.length) return 0;
      let best = go(d + 1, holding, left);
      if (holding) best = Math.max(best, p[d] - fee + go(d + 1, false, left));
      else if (left > 0) best = Math.max(best, -p[d] + go(d + 1, true, left - 1));
      return best;
    };
    return go(0, false, k);
  }
  if (mode === 'attendance') {
    let count = 0;
    for (let c = 0; c < 3 ** input.n; c++) {
      let s = '', x = c;
      for (let i = 0; i < input.n; i++) { s += 'APL'[x % 3]; x = Math.floor(x / 3); }
      if ((s.match(/A/g) ?? []).length < 2 && !s.includes('LLL')) count++;
    }
    return count;
  }
  if (mode === 'beautiful') return perms(Array.from({ length: input.n }, (_, i) => i + 1)).filter((p) => p.every((v, i) => v % (i + 1) === 0 || (i + 1) % v === 0)).length;
  if (mode === 'partition') {
    const { nums, k } = input, total = nums.reduce((a, b) => a + b, 0);
    if (total % k) return 'false';
    const t = total / k, sums = Array(k).fill(0);
    const go = (i) => { if (i === nums.length) return sums.every((s) => s === t); for (let b = 0; b < k; b++) { if (sums[b] + nums[i] > t) continue; sums[b] += nums[i]; if (go(i + 1)) return true; sums[b] -= nums[i]; } return false; };
    return String(go(0));
  }
  if (mode === 'sessions') {
    const { tasks, T } = input, n = tasks.length;
    let best = n;
    const loads = [];
    const go = (i) => { if (loads.length >= best) return; if (i === n) { best = loads.length; return; } for (let b = 0; b < loads.length; b++) if (loads[b] + tasks[i] <= T) { loads[b] += tasks[i]; go(i + 1); loads[b] -= tasks[i]; } loads.push(tasks[i]); go(i + 1); loads.pop(); };
    go(0);
    return best;
  }
  if (mode === 'visitall') {
    // shortest distances, then the best order of visits
    const { n, edges } = input;
    const d = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (__, j) => (i === j ? 0 : Infinity)));
    for (const [a, b] of edges) { d[a][b] = 1; d[b][a] = 1; }
    for (let m = 0; m < n; m++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) d[i][j] = Math.min(d[i][j], d[i][m] + d[m][j]);
    return Math.min(...perms([...Array(n).keys()]).map((p) => p.slice(1).reduce((s, v, i) => s + d[p[i]][v], 0)));
  }
  // superstring: every order, merging neighbours as much as they overlap
  const w = input.words;
  return Math.min(...perms([...w.keys()]).map((p) => p.slice(1).reduce((s, j, i) => s + w[j].length - overlap(w[p[i]], w[j]), w[p[0]].length)));
}

// ---------------------------------------------------------------- tables

export function stateSteps(input) {
  const { mode } = input;
  const steps = [];
  let rows, cols, cells, inputCols = null;
  const snap = (x) => steps.push({ mode, rows, cols, cells: cells.map((r) => [...r]), given: null, blocked: null, inputCols, deps: [], path: null, ...x });

  // ------------------------------------------------ stocks: one column per day
  if (['stock2', 'fee', 'stock3', 'stockk'].includes(mode)) {
    const p = input.prices;
    cols = p.map((v, d) => `d${d}: ${v}`);
    if (mode === 'stock2' || mode === 'fee') {
      const fee = mode === 'fee' ? input.fee : 0;
      rows = ['hold', 'cash'];
      cells = rows.map(() => cols.map(() => null));
      let hold = -Infinity, cash = 0;
      snap({ kind: 'start', cur: null, lines: ['init'], title: `Prices ${list(p)}${fee ? `, fee ${fee}` : ''}: two states`, text: `At the end of any day you either hold a share or you don't. Keep the best profit for each: hold (own one share) and cash (own none). Every day, each state comes from yesterday's two: cash = stay out, or sell${fee ? ` and pay ${fee}` : ''}; hold = keep the share, or buy with yesterday's cash. Before day 0, holding is impossible: −∞.`, calc: ['hold = −∞', 'cash = 0'] });
      p.forEach((price, d) => {
        const h = hold, c = cash;
        const sellV = h + price - fee, buyV = c - price;
        cash = Math.max(c, sellV); hold = Math.max(h, buyV);
        cells[0][d] = hold; cells[1][d] = cash;
        const sold = sellV > c, bought = buyV > h;
        snap({
          kind: sold ? 'take' : 'fill', cur: [1, d], col: d, lines: ['cash', 'hold'],
          deps: d ? [{ r: 0, c: d - 1, tone: sold ? 'success' : 'muted' }, { r: 1, c: d - 1, tone: bought ? 'success' : 'muted' }] : [],
          title: `Day ${d}, price ${price}: hold ${hold}, cash ${cash}${sold ? ' (selling pays)' : ''}`,
          text: `cash: stay out (${c}) or sell the share held (${fmt(h)} + ${price}${fee ? ` − ${fee}` : ''} = ${fmt(sellV)}) → ${cash}. hold: keep it (${fmt(h)}) or buy with yesterday's cash (${c} − ${price} = ${buyV}) → ${hold}. Both use yesterday's values${d ? ' (the highlighted column)' : ''}.`,
          calc: [`cash = max(${c}, ${fmt(sellV)}) = ${cash}`, `hold = max(${fmt(h)}, ${buyV}) = ${hold}`],
        });
      });
      const rises = p.slice(1).map((v, i) => v - p[i]).filter((x) => x > 0);
      snap({ kind: 'done', cur: [1, p.length - 1], lines: ['ans'], answer: `profit = ${cash}`, title: `Best profit: ${cash}`, text: fee ? `End without a share: cash. The fee makes small ups and downs not worth trading; the machine weighs that for you each day. O(n) time, two variables.` : `End without a share: cash. It equals the sum of every rise from one day to the next (${rises.length ? rises.join(' + ') : '0'} = ${cash}), because a long climb can be cut into daily steps. O(n) time, two variables.`, calc: [`cash = ${cash}`] });
      return steps;
    }
    const k = mode === 'stock3' ? 2 : input.k;
    rows = []; for (let j = 1; j <= k; j++) rows.push(`buy ${j}`, `sell ${j}`);
    cells = rows.map(() => cols.map(() => null));
    let buy = Array(k + 1).fill(-Infinity), sell = Array(k + 1).fill(0);
    snap({ kind: 'start', cur: null, lines: ['init'], title: `At most ${k} trades on ${list(p)}`, text: `One state per stage of the plan: "buy j" = best profit while holding the j-th share, "sell j" = best profit after the j-th sale. The j-th buy can only follow the (j−1)-th sale (sell 0 = 0, nothing done yet). Each day every state comes from yesterday's column.`, calc: [`buy 1..${k} = −∞`, `sell 1..${k} = 0`] });
    p.forEach((price, d) => {
      const pb = [...buy], ps = [...sell];
      const calc = [], parts = [], deps = [];
      for (let j = 1; j <= k; j++) {
        const nb = ps[j - 1] - price, ns = pb[j] + price;
        buy[j] = Math.max(pb[j], nb); sell[j] = Math.max(ps[j], ns);
        cells[2 * j - 2][d] = buy[j]; cells[2 * j - 1][d] = sell[j];
        calc.push(`buy ${j} = max(${fmt(pb[j])}, ${j === 1 ? '0' : ps[j - 1]} − ${price}) = ${buy[j]}`, `sell ${j} = max(${ps[j]}, ${fmt(pb[j])} + ${price}) = ${sell[j]}`);
        parts.push(`buy ${j}: keep ${fmt(pb[j])} or buy after ${j === 1 ? 'nothing' : `sale ${j - 1}`} (${ps[j - 1]} − ${price} = ${nb}) → ${buy[j]}; sell ${j}: keep ${ps[j]} or sell (${fmt(pb[j])} + ${price} = ${fmt(ns)}) → ${sell[j]}`);
        if (d) { deps.push({ r: 2 * j - 2, c: d - 1, tone: ns > ps[j] ? 'success' : 'muted' }); if (j > 1) deps.push({ r: 2 * j - 3, c: d - 1, tone: nb > pb[j] ? 'success' : 'muted' }); }
      }
      snap({ kind: 'fill', cur: [2 * k - 1, d], col: d, lines: ['buy', 'sell'], deps, title: `Day ${d}, price ${price}: ${Array.from({ length: k }, (_, j) => `sell ${j + 1} = ${sell[j + 1]}`).join(', ')}`, text: `${parts.join('. ')}.`, calc });
    });
    const ans = Math.max(...sell);
    snap({ kind: 'done', cur: [2 * k - 1, p.length - 1], lines: ['ans'], answer: `profit = ${ans}`, title: `Best profit with at most ${k} trades: ${ans}`, text: `sell ${k} is the answer: it is never below the earlier sells, because an unused trade can be a buy and sell on the same price for 0. O(n · k) time; if k ≥ n / 2 the limit never bites, and Stock II's two states are enough.`, calc: [`sell ${k} = ${ans}`] });
    return steps;
  }

  // ------------------------------------------------ attendance: one column per length
  if (mode === 'attendance') {
    const N = input.n;
    rows = ['A0 L0', 'A0 L1', 'A0 L2', 'A1 L0', 'A1 L1', 'A1 L2'];
    cols = Array.from({ length: N + 1 }, (_, L) => `len ${L}`);
    cells = rows.map(() => cols.map(() => null));
    let c = [1, 0, 0, 0, 0, 0];
    c.forEach((v, r) => { cells[r][0] = v; });
    snap({ kind: 'base', cur: [0, 0], col: 0, lines: ['init'], title: 'Six states: absences so far × Ls at the end', text: 'To extend a record you only need two facts: how many As it has (0 or 1, since 2 is out) and how many Ls it currently ends with (0, 1 or 2, since 3 is out). That gives six states. Count the records in each state, one length at a time. The empty record is A0 L0.', calc: ['A0 L0 = 1'] });
    for (let L = 1; L <= N; L++) {
      const [a, b, cc, d, e, f] = c;
      const s0 = a + b + cc, s1 = d + e + f;
      c = [s0, a, b, s1 + s0, d, e];
      c.forEach((v, r) => { cells[r][L] = v; });
      snap({ kind: 'fill', cur: [0, L], col: L, lines: ['P', 'A', 'L'], deps: rows.map((_, r) => ({ r, c: L - 1, tone: 'success' })), title: `Length ${L}: ${c.reduce((x, y) => x + y, 0)} records`, text: `P resets the run of Ls: A0 L0 = all A0 (${s0}). L extends the run by one: A0 L1 = A0 L0 (${a}), A0 L2 = A0 L1 (${b}), and the same for A1. A1 L0 gets every A1 record plus P (${s1}) and every A0 record plus its one A (${s0}). Nothing ever reaches 3 Ls or 2 As, so those are never counted.`, calc: [`A0 L0 = ${s0}`, `A1 L0 = ${s1} + ${s0} = ${s1 + s0}`, `L moves: ${a}, ${b}, ${d}, ${e}`] });
    }
    const ans = c.reduce((x, y) => x + y, 0);
    snap({ kind: 'done', cur: [0, N], col: N, lines: ['ans'], answer: `records = ${ans}`, title: `${ans} eligible records of length ${N}`, text: `Add the six counts in the last column. O(n) time with six numbers, taking every sum modulo 10⁹ + 7 for big n. Listing all 3ⁿ strings would need ${3 ** N} checks here and is hopeless for n = 10⁵.`, calc: [`${c.join(' + ')} = ${ans}`] });
    return steps;
  }

  // ------------------------------------------------ bitmask tables: one row per set
  if (mode === 'beautiful' || mode === 'partition' || mode === 'sessions') {
    const items = mode === 'beautiful' ? Array.from({ length: input.n }, (_, i) => i + 1) : mode === 'partition' ? input.nums : input.tasks;
    const n = items.length, FULL = (1 << n) - 1;
    const seen = {};
    const names = items.map((v) => { const b = mode === 'sessions' ? `${v}h` : `${v}`; seen[b] = (seen[b] ?? 0) + 1; return b + '′'.repeat(seen[b] - 1); });   // repeats get a prime: 2, 2′
    inputCols = items.map((_, i) => i);
    const extra = mode === 'beautiful' ? ['ways'] : mode === 'partition' ? ['fill'] : ['sess', 'load'];
    const bits = (m) => items.map((_, i) => (m >> i & 1 ? '1' : '·'));
    const masks = [...Array(FULL + 1).keys()].sort(byCount);
    const V = n;   // first value column
    let order = masks;
    if (mode === 'partition') {
      // only the sets that can actually be reached get a row
      const total = items.reduce((a, b) => a + b, 0);
      const t = total / input.k;
      const quick = total % input.k ? `${total} doesn't divide into ${input.k} equal parts` : Math.max(...items) > t ? `${Math.max(...items)} is bigger than the target ${t}` : null;
      if (quick) {
        rows = ['∅']; cols = [...names, ...extra]; cells = [[...bits(0), 0]];
        snap({ kind: 'start', cur: null, lines: ['base'], title: `Split ${list(items)} into ${input.k} equal groups?`, text: `Check the cheap things first: ${quick}.`, calc: [`total = ${total}`] });
        snap({ kind: 'done', cur: null, lines: ['ans'], answer: 'possible = false', title: 'Impossible before any search: false', text: `No set needs a row: ${quick}, so no split can work.`, calc: ['false'] });
        return steps;
      }
      const fill = Array(FULL + 1).fill(-1); fill[0] = 0;
      for (const m of masks) if (m) for (let i = 0; i < n; i++) if (m >> i & 1 && fill[m ^ 1 << i] >= 0 && fill[m ^ 1 << i] + items[i] <= t) fill[m] = (fill[m ^ 1 << i] + items[i]) % t;
      order = masks.filter((m) => fill[m] >= 0);
    }
    const rowOf = new Map(order.map((m, r) => [m, r]));
    rows = order.map((m) => setOf(m, names));
    cols = [...names, ...extra];
    cells = order.map((m) => [...bits(m), ...extra.map(() => null)]);
    const total = items.reduce((a, b) => a + b, 0);
    const t = mode === 'partition' ? total / input.k : 0;
    const val = new Map();

    if (mode === 'beautiful') {
      snap({ kind: 'start', cur: null, lines: [], title: `Beautiful arrangements of 1..${n}`, text: `Fill positions 1, 2, … in order. After placing some numbers, only the SET of numbers used matters for the rest, not their order. So ways[mask] = the number of ways to fill positions 1..|mask| with exactly the numbers in mask. Each row is one set; its bits are shown on the left.`, calc: [`${1 << n} sets`] });
      val.set(0, 1); cells[0][V] = 1;
      snap({ kind: 'base', cur: [0, V], lines: ['base'], noArrows: true, title: 'Empty set: 1 way (place nothing)', text: 'Every arrangement starts from the empty set, so it counts once.', calc: ['ways[∅] = 1'] });
      for (const m of order.slice(1)) {
        const pos = bitCount(m), r = rowOf.get(m);
        let w = 0; const deps = [], parts = [];
        items.forEach((x, i) => {
          if (!(m >> i & 1)) return;
          const ok = x % pos === 0 || pos % x === 0, from = val.get(m ^ 1 << i);
          if (ok) w += from;
          deps.push({ r: rowOf.get(m ^ 1 << i), c: V, tone: ok && from ? 'success' : 'muted' });
          parts.push(ok ? `${x} fits position ${pos} → ways${setOf(m ^ 1 << i, names)} = ${from}` : `${x} doesn't fit position ${pos}`);
        });
        val.set(m, w); cells[r][V] = w;
        snap({ kind: w ? 'fill' : 'skip', cur: [r, V], lines: ['fill', 'add'], deps, noArrows: true, title: `${setOf(m, names)}: ${w} way${w === 1 ? '' : 's'}`, text: `These ${pos} numbers fill positions 1..${pos}, so the one placed last sits at position ${pos}. ${parts.join('; ')}.`, calc: [`ways = ${w}`] });
      }
      const ans = val.get(FULL);
      snap({ kind: 'done', cur: [rowOf.get(FULL), V], lines: ['ans'], noArrows: true, answer: `ways = ${ans}`, title: `${ans} beautiful arrangements`, text: `The full set row is the answer. O(2ⁿ · n) instead of n! orders: arrangements that used the same numbers for the first positions share one row.`, calc: [`ways[full] = ${ans}`] });
      return steps;
    }

    if (mode === 'partition') {
      snap({ kind: 'start', cur: null, lines: [], title: `Split ${list(items)} into ${input.k} groups of ${t}`, text: `Fill the groups one at a time. For a set of used numbers, the current group holds (their sum) mod ${t}: the earlier groups are full. So one number per set is enough: fill[mask], or no row at all if the set can't be reached without overflowing a group. Only the ${order.length} reachable sets get a row.`, calc: [`target = ${total} / ${input.k} = ${t}`] });
      val.set(0, 0); cells[0][V] = 0;
      snap({ kind: 'base', cur: [0, V], lines: ['base'], noArrows: true, title: 'Nothing used: the first group is empty', text: 'Start with an empty group.', calc: ['fill[∅] = 0'] });
      for (const m of order.slice(1)) {
        const r = rowOf.get(m); const deps = [], parts = [];
        items.forEach((x, i) => {
          if (!(m >> i & 1)) return;
          const pm = m ^ 1 << i;
          if (!val.has(pm)) return;
          const ok = val.get(pm) + x <= t;
          deps.push({ r: rowOf.get(pm), c: V, tone: ok ? 'success' : 'muted' });
          parts.push(ok ? `${setOf(pm, names)} holds ${val.get(pm)}, + ${names[i]} = ${val.get(pm) + x}${val.get(pm) + x === t ? ' (full: the next group starts at 0)' : ''}` : `${setOf(pm, names)} holds ${val.get(pm)}, + ${names[i]} would overflow ${t}`);
        });
        const f = items.reduce((a, x, i) => a + (m >> i & 1 ? x : 0), 0) % t;
        val.set(m, f); cells[r][V] = f;
        snap({ kind: f === 0 ? 'take' : 'fill', cur: [r, V], lines: ['fill', 'add'], deps, noArrows: true, title: `${setOf(m, names)}: current group holds ${f}${f === 0 ? ' (groups closed exactly)' : ''}`, text: `Try each number in the set as the one added last: ${parts.join('; ')}.`, calc: [`fill = ${f}`] });
      }
      const ok = val.has(FULL);
      snap({ kind: 'done', cur: ok ? [rowOf.get(FULL), V] : null, lines: ['ans'], noArrows: true, answer: `possible = ${ok}`, title: ok ? `All numbers used with every group exactly ${t}: true` : 'The full set is never reached: false', text: ok ? `The full set reached fill 0, so all ${input.k} groups closed exactly at ${t}. O(2ⁿ · n).` : `Every way of using all the numbers overflows some group, so the full set has no row. O(2ⁿ · n).`, calc: [`${ok}`] });
      return steps;
    }

    // sessions
    const T = input.T;
    snap({ kind: 'start', cur: null, lines: [], title: `Tasks ${list(items)} in sessions of ${T}h`, text: `For a set of finished tasks, keep the best (sessions used, hours in the current session). Fewer sessions is always better; with the same number, a lighter current session leaves more room. Add the tasks one at a time: the last one either fits in the current session or opens a new one.`, calc: [`T = ${T}`] });
    val.set(0, [1, 0]); cells[0][V] = 1; cells[0][V + 1] = 0;
    snap({ kind: 'base', cur: [0, V], lines: ['base'], noArrows: true, title: 'Nothing done: one empty session', text: 'Open the first session with 0 hours used.', calc: ['best[∅] = (1, 0h)'] });
    for (const m of order.slice(1)) {
      const r = rowOf.get(m); const opts = [];
      items.forEach((x, i) => {
        if (!(m >> i & 1)) return;
        const pm = m ^ 1 << i, [s, l] = val.get(pm);
        opts.push({ x, name: names[i], pm, res: l + x <= T ? [s, l + x] : [s + 1, x], fits: l + x <= T, s, l });
      });
      const best = opts.reduce((a, o) => (o.res[0] < a.res[0] || (o.res[0] === a.res[0] && o.res[1] < a.res[1]) ? o : a));
      val.set(m, best.res); cells[r][V] = best.res[0]; cells[r][V + 1] = best.res[1];
      snap({ kind: 'fill', cur: [r, V], lines: ['fill', 'add'], noArrows: true, deps: opts.map((o) => ({ r: rowOf.get(o.pm), c: V, tone: o === best ? 'success' : 'muted' })), title: `${setOf(m, names)}: ${best.res[0]} session${best.res[0] > 1 ? 's' : ''}, ${best.res[1]}h in the last`, text: `${opts.map((o) => `${o.name} last, from (${o.s}, ${o.l}h): ${o.fits ? `fits → (${o.res[0]}, ${o.res[1]}h)` : `doesn't fit → new session (${o.res[0]}, ${o.res[1]}h)`}`).join('; ')}. Keep the smallest.`, calc: [`(${best.res[0]}, ${best.res[1]}h)`] });
    }
    const [ans] = val.get(FULL);
    snap({ kind: 'done', cur: [rowOf.get(FULL), V], lines: ['ans'], noArrows: true, answer: `sessions = ${ans}`, title: `${ans} session${ans > 1 ? 's' : ''}`, text: `Read the full set's row. Taking the tasks in the given order and opening a session when one doesn't fit can use more; the table tries every last task for every set. O(2ⁿ · n).`, calc: [`sessions = ${ans}`] });
    return steps;
  }

  // ------------------------------------------------ BFS over (node, visited set)
  if (mode === 'visitall') {
    const { n, edges } = input, FULL = (1 << n) - 1;
    const adj = Array.from({ length: n }, () => []);
    for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a); }
    adj.forEach((l) => l.sort((x, y) => x - y));
    const names = [...Array(n).keys()].map(String);
    // run the BFS first to know which sets appear
    const dist = new Map(); const levels = [];
    let frontier = [];
    for (let v = 0; v < n; v++) { dist.set(`${v},${1 << v}`, 0); frontier.push([v, 1 << v]); }
    levels.push(frontier);
    let goal = n === 1 ? frontier[0] : null;
    while (!goal) {
      const next = [];
      for (const [v, m] of frontier) for (const u of adj[v]) {
        const nm = m | 1 << u, key = `${u},${nm}`;
        if (dist.has(key)) continue;
        dist.set(key, levels.length); next.push([u, nm]);
        if (nm === FULL && !goal) goal = [u, nm];
      }
      levels.push(next); frontier = next;
    }
    const order = [...new Set([...dist.keys()].map((k) => Number(k.split(',')[1])))].sort(byCount);
    const rowOf = new Map(order.map((m, r) => [m, r]));
    rows = order.map((m) => setOf(m, names)); cols = names.map((v) => `at ${v}`);
    cells = order.map((m) => names.map((_, v) => (m >> v & 1 ? null : '')));
    snap({ kind: 'start', cur: null, lines: [], title: `Visit all ${n} nodes: edges ${edges.map(([a, b]) => `${a}–${b}`).join(', ')}`, text: 'Where you are and which nodes you have seen is all that matters for the rest of the walk. So the BFS runs over states (node, visited set), not nodes. Every edge costs 1, so the first time a state with every node seen appears, its distance is the answer. Rows are the visited sets, columns the current node; grey cells are impossible (you are always in your own set).', calc: [`${n} nodes, up to ${n * (1 << n)} states`] });
    levels[0].forEach(([v, m]) => { cells[rowOf.get(m)][v] = 0; });
    snap({ kind: 'base', cur: null, lines: ['base'], path: levels[0].map(([v, m]) => [rowOf.get(m), v]), title: 'Start everywhere at once: distance 0', text: 'The walk may start at any node, so every (v, {v}) starts in the queue with distance 0.', calc: [`${n} states`] });
    for (let d = 1; d < levels.length; d++) {
      const lv = levels[d];
      lv.forEach(([v, m]) => { cells[rowOf.get(m)][v] = d; });
      const hit = lv.find(([v, m]) => m === FULL);
      snap({ kind: hit ? 'take' : 'fill', cur: null, lines: ['fill', 'add'], path: lv.map(([v, m]) => [rowOf.get(m), v]), deps: levels[d - 1].map(([v, m]) => ({ r: rowOf.get(m), c: v, tone: 'note' })), title: `Distance ${d}: ${lv.length} new state${lv.length === 1 ? '' : 's'}${hit ? ' (all nodes seen)' : ''}`, text: `From every state at distance ${d - 1} (outlined), step to each neighbour and add it to the set. ${lv.slice(0, 4).map(([v, m]) => `(${v}, ${setOf(m, names)})`).join(', ')}${lv.length > 4 ? ', …' : ''} are new. A state already seen at a smaller distance is not queued again${hit ? `. (${hit[0]}, ${setOf(FULL, names)}) has every node` : ''}.`, calc: [`${lv.length} new`] });
    }
    const ans = levels.length - 1;
    snap({ kind: 'done', cur: [rowOf.get(goal[1]), goal[0]], lines: ['ans'], answer: `length = ${ans}`, title: `Shortest walk: ${ans} edge${ans === 1 ? '' : 's'}`, text: `The full-set row was reached at distance ${ans}. Nodes and edges may repeat, which a plain BFS over nodes can't express; adding the set to the state makes it a normal BFS on n · 2ⁿ states.`, calc: [`= ${ans}`] });
    return steps;
  }

  // ------------------------------------------------ superstring: dp[set][last word]
  const w = input.words, n = w.length, FULL = (1 << n) - 1;
  const names = w.map((_, i) => `${i}`);
  const ov = w.map((a) => w.map((b) => (a === b ? 0 : overlap(a, b))));
  const order = [...Array(FULL + 1).keys()].filter(Boolean).sort(byCount);
  const rowOf = new Map(order.map((m, r) => [m, r]));
  rows = order.map((m) => setOf(m, names)); cols = [...w];
  cells = order.map((m) => w.map((_, j) => (m >> j & 1 ? null : '')));
  const len = new Map(), from = new Map();
  const pairs = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (i !== j && ov[i][j]) pairs.push(`${w[i]} → ${w[j]}: ${ov[i][j]}`);
  snap({ kind: 'start', cur: null, lines: [], title: `Shortest string containing ${w.map((x) => `"${x}"`).join(', ')}`, text: `Writing word j right after word i shares their overlap: the end of i that starts j. For a set of words already written, only the last one matters for what comes next. So len[mask][j] = the shortest string containing the words in mask and ending with word j: the travelling salesman table, with "length added" as the distance. Rows are sets of word numbers (0 = the first column). Overlaps: ${pairs.length ? pairs.join(', ') : 'none'}.`, calc: pairs.length ? pairs : ['no overlaps'] });
  w.forEach((x, j) => { len.set(`${1 << j},${j}`, x.length); cells[rowOf.get(1 << j)][j] = x.length; });
  snap({ kind: 'base', cur: null, lines: ['base'], path: w.map((_, j) => [rowOf.get(1 << j), j]), title: 'One word: its own length', text: 'A set with a single word is just that word.', calc: w.map((x) => `${x}: ${x.length}`) });
  for (const m of order) {
    if (bitCount(m) < 2) continue;
    for (let j = 0; j < n; j++) {
      if (!(m >> j & 1)) continue;
      const pm = m ^ 1 << j; const opts = [];
      for (let i = 0; i < n; i++) if (pm >> i & 1) opts.push({ i, v: len.get(`${pm},${i}`) + w[j].length - ov[i][j] });
      const best = opts.reduce((a, o) => (o.v < a.v ? o : a));
      len.set(`${m},${j}`, best.v); from.set(`${m},${j}`, best.i); cells[rowOf.get(m)][j] = best.v;
      snap({ kind: 'fill', cur: [rowOf.get(m), j], lines: ['fill'], deps: opts.map((o) => ({ r: rowOf.get(pm), c: o.i, tone: o === best ? 'success' : 'muted', label: `−${ov[o.i][j]}` })), title: `${setOf(m, names)} ending with "${w[j]}": ${best.v}`, text: `Write "${w[j]}" last; before it came the words ${setOf(pm, names)}, ending with one of them. ${opts.map((o) => `After "${w[o.i]}" (${len.get(`${pm},${o.i}`)}): + ${w[j].length} − overlap ${ov[o.i][j]} = ${o.v}`).join('; ')}.`, calc: [`len = ${best.v}`] });
    }
  }
  let bj = 0;
  for (let j = 1; j < n; j++) if (len.get(`${FULL},${j}`) < len.get(`${FULL},${bj}`)) bj = j;
  const ans = len.get(`${FULL},${bj}`);
  const seq = []; const path = [];
  for (let m = FULL, j = bj; ; ) { seq.push(j); path.push([rowOf.get(m), j]); if (!from.has(`${m},${j}`)) break; const i = from.get(`${m},${j}`); m ^= 1 << j; j = i; }
  seq.reverse();
  let s = w[seq[0]];
  for (let k = 1; k < seq.length; k++) s += w[seq[k]].slice(ov[seq[k - 1]][seq[k]]);
  snap({ kind: 'done', cur: null, path, lines: ['ans'], answer: `"${s}", length ${ans}`, title: `"${s}" (${ans} letters)`, text: `The best cell in the full row ends with "${w[bj]}". Walking back through the choices that won gives the order ${seq.map((j) => `"${w[j]}"`).join(' → ')}, and the string is built by appending each word minus its overlap. O(2ⁿ · n²).`, calc: [`length ${ans}`] });
  return steps;
}

// ---------------------------------------------------------------- inputs

const ints = (t) => String(t ?? '').replace(/[[\]]/g, ' ').split(/[\s,]+/).filter(Boolean).map(Number);
const isInt = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi;

function connected(n, edges) {
  const seen = new Set([0]), st = [0];
  while (st.length) { const v = st.pop(); for (const [a, b] of edges) for (const [x, y] of [[a, b], [b, a]]) if (x === v && !seen.has(y)) { seen.add(y); st.push(y); } }
  return seen.size === n;
}

export function stateParse(values, input) {
  const { mode } = input;
  if (['stock2', 'fee', 'stock3', 'stockk'].includes(mode)) {
    const prices = ints(values.prices);
    if (prices.length < 1 || prices.length > 8 || prices.some((v) => !isInt(v, 0, 20))) return { error: '1 to 8 prices from 0 to 20.' };
    if (mode === 'fee') { const fee = Number(values.fee); if (!isInt(fee, 0, 9)) return { error: 'The fee is a whole number from 0 to 9.' }; return { input: { mode, prices, fee } }; }
    if (mode === 'stockk') { const k = Number(values.k); if (!isInt(k, 1, 3)) return { error: 'k from 1 to 3 keeps the table readable.' }; return { input: { mode, k, prices } }; }
    return { input: { mode, prices } };
  }
  if (mode === 'attendance' || mode === 'beautiful') {
    const v = Number(values.n), hi = mode === 'attendance' ? 7 : 4;
    return isInt(v, 1, hi) ? { input: { mode, n: v } } : { error: `n from 1 to ${hi}.` };
  }
  if (mode === 'partition') {
    const nums = ints(values.nums), k = Number(values.k);
    if (nums.length < 2 || nums.length > 5 || nums.some((v) => !isInt(v, 1, 9))) return { error: '2 to 5 numbers from 1 to 9.' };
    if (!isInt(k, 1, nums.length)) return { error: `k from 1 to ${nums.length}.` };
    return { input: { mode, nums, k } };
  }
  if (mode === 'sessions') {
    const tasks = ints(values.tasks), T = Number(values.T);
    if (tasks.length < 1 || tasks.length > 4 || tasks.some((v) => !isInt(v, 1, 9))) return { error: '1 to 4 tasks from 1 to 9 hours.' };
    if (!isInt(T, Math.max(...tasks), 15)) return { error: `The session length must be at least the longest task (${Math.max(...tasks)}) and at most 15.` };
    return { input: { mode, tasks, T } };
  }
  if (mode === 'visitall') {
    const pairs = String(values.edges ?? '').split(/[,;]/).map((s) => s.trim()).filter(Boolean);
    const edges = [];
    for (const p of pairs) { const m = p.match(/^(\d)\s*[-–]\s*(\d)$/); if (!m || m[1] === m[2]) return { error: 'Edges like 0-1, 0-2, 1-3 (nodes 0 to 4).' }; edges.push([Number(m[1]), Number(m[2])]); }
    if (!edges.length) return { error: 'Give at least one edge, like 0-1.' };
    const n = Math.max(...edges.flat()) + 1;
    if (n > 5) return { error: 'Use at most 5 nodes (0 to 4).' };
    if (!connected(n, edges)) return { error: `The graph must be connected: every node 0 to ${n - 1} reachable.` };
    return { input: { mode, n, edges } };
  }
  const words = String(values.words ?? '').split(/[\s,]+/).filter(Boolean);
  if (words.length < 2 || words.length > 4 || words.some((x) => !/^[a-z]{1,6}$/.test(x))) return { error: '2 to 4 lower-case words, up to 6 letters each.' };
  if (words.some((a, i) => words.some((b, j) => i !== j && b.includes(a)))) return { error: 'No word may appear inside another (or twice).' };
  return { input: { mode, words } };
}

export function stateValues(input) {
  const { mode } = input;
  if (mode === 'fee') return { prices: input.prices.join(', '), fee: String(input.fee) };
  if (mode === 'stockk') return { k: String(input.k), prices: input.prices.join(', ') };
  if (mode === 'stock2' || mode === 'stock3') return { prices: input.prices.join(', ') };
  if (mode === 'attendance' || mode === 'beautiful') return { n: String(input.n) };
  if (mode === 'partition') return { nums: input.nums.join(', '), k: String(input.k) };
  if (mode === 'sessions') return { tasks: input.tasks.join(', '), T: String(input.T) };
  if (mode === 'visitall') return { edges: input.edges.map(([a, b]) => `${a}-${b}`).join(', ') };
  return { words: input.words.join(', ') };
}

export function stateRandom(input, rand = Math.random) {
  const g = rng(rand);
  const { mode } = input;
  const prices = () => Array.from({ length: g.int(4, 8) }, () => g.int(0, 9));
  if (mode === 'stock2' || mode === 'stock3') return { mode, prices: prices() };
  if (mode === 'fee') return { mode, prices: prices(), fee: g.int(0, 3) };
  if (mode === 'stockk') return { mode, k: g.int(1, 3), prices: prices() };
  if (mode === 'attendance') return { mode, n: g.int(1, 6) };
  if (mode === 'beautiful') return { mode, n: g.int(2, 4) };
  if (mode === 'partition') { const nums = Array.from({ length: g.int(3, 5) }, () => g.int(1, 6)); return { mode, nums, k: g.int(2, 3) }; }
  if (mode === 'sessions') { const tasks = Array.from({ length: g.int(2, 4) }, () => g.int(1, 6)); return { mode, tasks, T: g.int(Math.max(...tasks), 10) }; }
  if (mode === 'visitall') {
    const n = g.int(2, 5), edges = [];
    for (let v = 1; v < n; v++) edges.push([g.int(0, v - 1), v]);
    for (let e = 0; e < g.int(0, 2); e++) { const a = g.int(0, n - 1), b = g.int(0, n - 1); if (a !== b && !edges.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) edges.push([a, b]); }
    return { mode, n, edges };
  }
  for (;;) {
    const words = Array.from({ length: g.int(2, 3) }, () => Array.from({ length: g.int(2, 4) }, () => g.pick(['a', 'c', 'g', 't'])).join(''));
    if (!words.some((a, i) => words.some((b, j) => i !== j && b.includes(a)))) return { mode, words };
  }
}

export const stateFields = (input) => ({
  stock2: [{ name: 'prices', label: 'prices', placeholder: '7, 1, 5, 3, 6, 4' }],
  stock3: [{ name: 'prices', label: 'prices', placeholder: '3, 3, 5, 0, 0, 3, 1, 4' }],
  fee: [{ name: 'prices', label: 'prices', placeholder: '1, 3, 2, 8, 4, 9' }, { name: 'fee', label: 'fee', placeholder: '2', short: true }],
  stockk: [{ name: 'k', label: 'k (1 to 3)', placeholder: '2', short: true }, { name: 'prices', label: 'prices', placeholder: '3, 2, 6, 5, 0, 3' }],
  attendance: [{ name: 'n', label: 'n (1 to 7)', placeholder: '4', short: true }],
  beautiful: [{ name: 'n', label: 'n (1 to 4)', placeholder: '3', short: true }],
  partition: [{ name: 'nums', label: 'nums (up to 5)', placeholder: '3, 1, 2, 2' }, { name: 'k', label: 'k', placeholder: '2', short: true }],
  sessions: [{ name: 'tasks', label: 'tasks (up to 4)', placeholder: '2, 3, 3, 4' }, { name: 'T', label: 'session', placeholder: '6', short: true }],
  visitall: [{ name: 'edges', label: 'edges (nodes 0 to 4)', placeholder: '0-1, 0-2, 0-3' }],
  superstring: [{ name: 'words', label: 'words (2 to 4)', placeholder: 'gcta, ctaagt, ttca' }],
})[input.mode];

export function stateDescribe(input) {
  const { mode } = input;
  if (mode === 'fee') return `prices ${list(input.prices)}, fee ${input.fee}`;
  if (mode === 'stockk') return `k = ${input.k}, prices ${list(input.prices)}`;
  if (mode === 'stock2' || mode === 'stock3') return `prices ${list(input.prices)}`;
  if (mode === 'attendance' || mode === 'beautiful') return `n = ${input.n}`;
  if (mode === 'partition') return `${list(input.nums)}, k = ${input.k}`;
  if (mode === 'sessions') return `tasks ${list(input.tasks)}, session ${input.T}h`;
  if (mode === 'visitall') return `edges ${input.edges.map(([a, b]) => `${a}–${b}`).join(', ')}`;
  return input.words.join(', ');
}

export const stateRule = {
  stock2: 'cash = max(cash, hold + p); hold = max(hold, cash − p), from yesterday',
  fee: 'cash = max(cash, hold + p − fee); hold = max(hold, cash − p)',
  stock3: 'buy j from sell j−1; sell j from buy j; all from yesterday',
  stockk: 'buy j from sell j−1; sell j from buy j; all from yesterday',
  attendance: 'P resets the Ls, L adds one, A moves A0 to A1',
  beautiful: 'ways[set] = sum over x that fits position |set| of ways[set − x]',
  partition: 'fill[set] = (fill[set − x] + x) mod target, if it doesn\'t overflow',
  sessions: 'smallest (sessions, load) over the task done last',
  visitall: 'BFS over (current node, visited set)',
  superstring: 'len[set][j] = min over i of len[set − j][i] + |w_j| − overlap(i, j)',
};

/** Legend rows per mode: [tone, sample, text]. */
export function stateLegend(mode) {
  if (['stock2', 'fee', 'stock3', 'stockk'].includes(mode)) return [['warn', '3', 'today\'s column'], ['success', '2', 'yesterday\'s value that won'], ['muted', '0', 'yesterday\'s value, not used']];
  if (mode === 'attendance') return [['warn', '4', 'this length'], ['success', '2', 'the previous length (every count feeds in)']];
  if (mode === 'visitall') return [['success', '2', 'reached at this distance'], ['note', '1', 'the level it came from'], ['neutral', '·', 'blank: impossible (you are in your own set)']];
  if (mode === 'superstring') return [['warn', '7', 'being filled'], ['success', '→', 'the previous last word that won'], ['muted', '→', 'tried, longer']];
  return [['warn', '3', 'being filled'], ['neutral', '1', 'bits: which items are in the set'], ['success', '2', 'the smaller set it was built from'], ['muted', '0', 'tried, not used']];
}
