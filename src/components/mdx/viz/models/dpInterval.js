/**
 * Interval and game tables for <DpGridViz> (the DP Trees & Intervals lesson): predict the winner,
 * stone game, polygon triangulation, stone game II (position × M) and cutting a stick.
 * Same step shape as dp2d. Pure, so scripts/viz-check.mjs can compare each mode with a brute force.
 */
import { list, rng } from './util.js';

export const INTV = {
  winner: { label: 'Predict the winner', input: { mode: 'winner', nums: [1, 5, 233, 7] } },
  winnerNo: { label: 'Player 1 loses', input: { mode: 'winner', nums: [1, 5, 2] } },
  stonegame: { label: 'Stone game', input: { mode: 'stonegame', nums: [5, 3, 4, 5] } },
  triangulate: { label: 'Triangulate a polygon', input: { mode: 'triangulate', nums: [3, 7, 4, 5] } },
  stone2: { label: 'Stone game II', input: { mode: 'stone2', nums: [2, 7, 9, 4, 4] } },
  cuts: { label: 'Cut a stick', input: { mode: 'cuts', n: 7, cuts: [1, 3, 4, 5] } },
};

export const intvCode = (mode) => ({
  winner: [['base', 'lead[i][i] = nums[i];                      // one number left: take it'], ['fill', 'lead[i][j] = max(nums[i] − lead[i+1][j], nums[j] − lead[i][j−1])   // my take minus their lead'], ['pick', 'return lead[0][n−1] >= 0']],
  stonegame: [['base', 'lead[i][i] = piles[i];'], ['fill', 'lead[i][j] = max(piles[i] − lead[i+1][j], piles[j] − lead[i][j−1])'], ['pick', 'return lead[0][n−1] > 0     // (or just: return true, by parity)']],
  triangulate: [['base', 'dp[i][i+1] = 0;                            // an edge, no triangle'], ['fill', 'dp[i][j] = min over i < k < j of dp[i][k] + dp[k][j] + v[i]·v[k]·v[j]']],
  stone2: [['base', 'i + 2M ≥ n → take everything left: suffix[i]'], ['fill', 'dp[i][M] = max over X = 1..2M of suffix[i] − dp[i+X][max(M, X)]   // all that is left minus what they get']],
  cuts: [['base', 'c = [0, sorted cuts…, n];  dp[i][i+1] = 0           // no cut inside'], ['fill', 'dp[i][j] = (c[j] − c[i]) + min over i < k < j of dp[i][k] + dp[k][j]   // first cut at c[k]']],
})[mode];

// ---------------------------------------------------------------- brute forces

export function intvAnswer(input) {
  const { mode } = input;
  const a = input.nums;
  if (mode === 'winner' || mode === 'stonegame') { const go = (i, j) => (i > j ? 0 : Math.max(a[i] - go(i + 1, j), a[j] - go(i, j - 1))); const d = go(0, a.length - 1); return String(mode === 'winner' ? d >= 0 : d > 0); }
  if (mode === 'triangulate') { const go = (i, j) => { if (j - i < 2) return 0; let b = Infinity; for (let k = i + 1; k < j; k++) b = Math.min(b, go(i, k) + go(k, j) + a[i] * a[k] * a[j]); return b; }; return go(0, a.length - 1); }
  if (mode === 'stone2') {
    const n = a.length;
    const go = (i, M) => { if (i >= n) return 0; let b = -Infinity; const left = a.slice(i).reduce((x, y) => x + y, 0); for (let X = 1; X <= 2 * M && i + X <= n; X++) b = Math.max(b, left - go(i + X, Math.max(M, X))); return b; };
    return go(0, 1);
  }
  const perms = (xs) => (xs.length <= 1 ? [xs] : xs.flatMap((x, i) => perms([...xs.slice(0, i), ...xs.slice(i + 1)]).map((p) => [x, ...p])));
  let best = Infinity;
  for (const order of perms(input.cuts)) {
    const done = [0, input.n]; let cost = 0;
    for (const c of order) { const lo = Math.max(...done.filter((x) => x < c)), hi = Math.min(...done.filter((x) => x > c)); cost += hi - lo; done.push(c); }
    best = Math.min(best, cost);
  }
  return best;
}

// ---------------------------------------------------------------- tables

export function intvSteps(input) {
  const { mode } = input;
  const steps = [];
  let rows, cols, cells, given = null, blocked = null;
  const snap = (x) => steps.push({ mode, rows, cols, cells: cells.map((r) => [...r]), given, blocked, deps: [], path: null, ...x });

  if (mode === 'winner' || mode === 'stonegame') {
    const a = input.nums, n = a.length;
    rows = a.map((v, i) => `${i}: ${v}`); cols = a.map((v, j) => `${j}: ${v}`);
    cells = rows.map((_, i) => cols.map((__, j) => (j < i ? '' : null)));
    snap({ kind: 'start', cur: null, lines: [], title: mode === 'winner' ? `Can player 1 win on ${list(a)}?` : `Stone game on ${list(a)}`, text: 'Score a range as "how far ahead the player to move can finish". Taking the left end gains it, and then the opponent plays the rest with their own lead; same for the right end. So lead[i][j] = max(left − lead[i+1][j], right − lead[i][j−1]). Short ranges first.', calc: [`n = ${n}`] });
    for (let len = 1; len <= n; len++) for (let i = 0; i + len <= n; i++) {
      const j = i + len - 1;
      if (len === 1) { cells[i][j] = a[i]; snap({ kind: 'base', cur: [i, j], lines: ['base'], title: `Only ${a[i]} left: lead ${a[i]}`, text: 'One number left: the player to move takes it.', calc: [`lead[${i}][${i}] = ${a[i]}`] }); continue; }
      const L = a[i] - cells[i + 1][j], Rr = a[j] - cells[i][j - 1];
      cells[i][j] = Math.max(L, Rr);
      snap({ kind: 'fill', cur: [i, j], lines: ['fill'], deps: [{ r: i + 1, c: j, tone: L >= Rr ? 'success' : 'muted', label: `${a[i]}−` }, { r: i, c: j - 1, tone: Rr > L ? 'success' : 'muted', label: `${a[j]}−` }], title: `[${i}..${j}]: lead ${cells[i][j]}`, text: `Take ${a[i]} (left): ${a[i]} − ${cells[i + 1][j]} = ${L}. Take ${a[j]} (right): ${a[j]} − ${cells[i][j - 1]} = ${Rr}. ${L >= Rr ? 'Left' : 'Right'} is better.`, calc: [`lead = ${cells[i][j]}`] });
    }
    const d = cells[0][n - 1];
    const win = mode === 'winner' ? d >= 0 : d > 0;
    snap({ kind: 'done', cur: [0, n - 1], lines: ['pick'], answer: `wins = ${win}`, title: `Player 1's lead: ${d} → ${win}`, text: mode === 'winner' ? `${d >= 0 ? 'Not behind at the end (a tie counts as a win)' : 'Behind at the end'}. O(n²).` : 'With an even number of piles, Alice can take all the even-indexed piles or all the odd ones, whichever sum is bigger, so she always wins; the table confirms it.', calc: [`= ${win}`] });
    return steps;
  }

  if (mode === 'triangulate' || mode === 'cuts') {
    const tri = mode === 'triangulate';
    const c = tri ? input.nums : [0, ...[...input.cuts].sort((x, y) => x - y), input.n];
    const n = c.length;
    rows = c.map((v, i) => `${i}: ${v}`); cols = c.map((v, j) => `${j}: ${v}`);
    cells = rows.map((_, i) => cols.map((__, j) => (j <= i ? '' : null)));
    snap({ kind: 'start', cur: null, lines: [], title: tri ? `Triangulate the polygon ${list(c)}` : `Cut a stick of length ${input.n} at ${list(input.cuts)}`, text: tri ? 'Look at the side from vertex i to vertex j. In any triangulation it belongs to exactly one triangle (i, k, j) for some k between them. That triangle splits the rest into the polygons i..k and k..j, solved the same way. dp[i][j] = the cheapest triangulation of vertices i..j.' : 'Sort the cuts and add both ends: positions c[0] = 0 … c[m] = n. dp[i][j] = the cheapest way to make every cut strictly between c[i] and c[j], on a piece that runs from c[i] to c[j]. The first cut there, at some c[k], costs the whole piece, c[j] − c[i], and splits it into (i, k) and (k, j).', calc: [tri ? `${n} vertices` : `positions ${list(c)}`] });
    for (let i = 0; i + 1 < n; i++) cells[i][i + 1] = 0;
    snap({ kind: 'base', cur: null, lines: ['base'], title: tri ? 'Neighbouring vertices: 0' : 'Neighbouring positions: 0', text: tri ? 'Two neighbouring vertices form a side, not a polygon: nothing to triangulate.' : 'No cut lies strictly between neighbouring positions: nothing to pay.', calc: ['dp[i][i+1] = 0'] });
    for (let len = 2; len < n; len++) for (let i = 0; i + len < n; i++) {
      const j = i + len;
      let best = Infinity, bk = -1;
      const opts = [];
      for (let k = i + 1; k < j; k++) { const v = cells[i][k] + cells[k][j] + (tri ? c[i] * c[k] * c[j] : c[j] - c[i]); opts.push([k, v]); if (v < best) { best = v; bk = k; } }
      cells[i][j] = best;
      snap({ kind: 'fill', cur: [i, j], lines: ['fill'], deps: [{ r: i, c: bk, tone: 'success' }, { r: bk, c: j, tone: 'success' }], title: tri ? `Vertices ${i}..${j}: ${best} (triangle ${i}, ${bk}, ${j})` : `Piece ${c[i]}..${c[j]}: ${best} (first cut at ${c[bk]})`, text: tri ? `Try every apex k for the triangle on side ${i}–${j}: ${opts.map(([k, v]) => `k = ${k} → ${v}`).join(', ')}. The cheapest uses k = ${bk}: ${c[i]}·${c[bk]}·${c[j]} = ${c[i] * c[bk] * c[j]} plus the two smaller polygons.` : `This piece is ${c[j] - c[i]} long, so its first cut costs ${c[j] - c[i]}. Try each cut as the first: ${opts.map(([k, v]) => `at ${c[k]} → ${v}`).join(', ')}. Best: cut at ${c[bk]}.`, calc: [`dp[${i}][${j}] = ${best}`] });
    }
    const ans = cells[0][n - 1];
    snap({ kind: 'done', cur: [0, n - 1], lines: [], answer: `${tri ? 'score' : 'cost'} = ${ans}`, title: tri ? `Smallest score: ${ans}` : `Cheapest: ${ans}`, text: tri ? 'O(n³): n² ranges, each trying up to n apexes. Same shape as Burst Balloons and matrix-chain multiplication.' : 'O(m³) for m cuts. Cutting greedily (middle first, or shortest first) can lose; trying every first cut per piece can\'t.', calc: [`= ${ans}`] });
    return steps;
  }

  // stone2: rows = position i, cols = M
  const a = input.nums, n = a.length;
  const suf = Array(n + 1).fill(0);
  for (let i = n - 1; i >= 0; i--) suf[i] = suf[i + 1] + a[i];
  rows = a.map((v, i) => `i ${i}: ${v}`); cols = Array.from({ length: n }, (_, M) => `M ${M + 1}`);
  cells = rows.map(() => cols.map(() => null));
  const val = (i, M) => (i >= n ? 0 : cells[i][Math.min(M, n) - 1]);
  snap({ kind: 'start', cur: null, lines: [], title: `Stone game II on ${list(a)}`, text: `dp[i][M] = the most stones the player to move can get from pile i onward when the limit is M. Whatever they take, the rest goes to the other player, who plays the same game from i + X with limit max(M, X). So dp[i][M] = max over X of (all stones left) − dp[i + X][max(M, X)]. Fill from the last pile backwards. Suffix sums: ${list(suf.slice(0, n))}.`, calc: [`suffix = ${list(suf.slice(0, n))}`] });
  for (let i = n - 1; i >= 0; i--) for (let M = 1; M <= n; M++) {
    if (i + 2 * M >= n) {
      if (M > 1 && i + 2 * (M - 1) >= n) continue;   // already filled with the rest of this row
      const Ms = [];
      for (let m2 = M; m2 <= n; m2++) { cells[i][m2 - 1] = suf[i]; Ms.push(m2); }
      snap({ kind: 'base', cur: [i, M - 1], lines: ['base'], title: `From pile ${i}, M ≥ ${M}: take all ${suf[i]}`, text: `With M ≥ ${M} up to ${2 * M} piles may be taken, and only ${n - i} are left: take them all, ${suf[i]} stones. That fills M = ${Ms[0]}${Ms.length > 1 ? `..${Ms.at(-1)}` : ''} in this row.`, calc: [`dp = ${suf[i]}`] });
      continue;
    }
    let best = -Infinity, bx = 1;
    const opts = [];
    for (let X = 1; X <= 2 * M; X++) { const v = suf[i] - val(i + X, Math.max(M, X)); opts.push([X, v]); if (v > best) { best = v; bx = X; } }
    cells[i][M - 1] = best;
    snap({ kind: 'fill', cur: [i, M - 1], lines: ['fill'], deps: opts.filter(([X]) => i + X < n).map(([X]) => ({ r: i + X, c: Math.min(Math.max(M, X), n) - 1, tone: X === bx ? 'success' : 'muted', label: `X${X}` })), title: `dp[${i}][${M}] = ${best} (take ${bx})`, text: `${suf[i]} stones are left. ${opts.map(([X, v]) => `Take ${X}: ${suf[i]} − ${suf[i] - v} = ${v}`).join('; ')}. Best: take ${bx}.`, calc: [`dp = ${best}`] });
  }
  const ans = cells[0][0];
  snap({ kind: 'done', cur: [0, 0], lines: [], answer: `alice = ${ans}`, title: `Alice gets ${ans}`, text: 'dp[0][1] is the first move with M = 1. "Everything left minus the opponent\'s best" turns two players into one table. O(n³).', calc: [`= ${ans}`] });
  return steps;
}

// ---------------------------------------------------------------- inputs

const ints = (t) => String(t ?? '').split(/[\s,]+/).filter(Boolean).map(Number);
export function intvParse(values, input) {
  const { mode } = input;
  if (mode === 'cuts') {
    const n = Number(values.n), cuts = ints(values.cuts);
    if (!Number.isInteger(n) || n < 2 || n > 30 || !cuts.length || cuts.length > 5 || cuts.some((c) => !Number.isInteger(c) || c <= 0 || c >= n) || new Set(cuts).size !== cuts.length) return { error: 'n from 2 to 30; up to 5 distinct cuts strictly inside.' };
    return { input: { mode, n, cuts } };
  }
  const nums = ints(values.nums);
  const lim = { winner: [0, 999, 1, 7], stonegame: [1, 99, 2, 6], triangulate: [1, 20, 3, 7], stone2: [1, 20, 1, 6] }[mode];
  if (nums.length < lim[2] || nums.length > lim[3] || nums.some((v) => !Number.isInteger(v) || v < lim[0] || v > lim[1])) return { error: `${lim[2]} to ${lim[3]} numbers from ${lim[0]} to ${lim[1]}.` };
  if (mode === 'stonegame' && (nums.length % 2 || nums.reduce((x, y) => x + y, 0) % 2 === 0)) return { error: 'An even number of piles with an odd total.' };
  return { input: { mode, nums } };
}

export const intvValues = (input) => (input.mode === 'cuts' ? { n: String(input.n), cuts: input.cuts.join(', ') } : { nums: input.nums.join(', ') });

export function intvRandom(input, rand = Math.random) {
  const g = rng(rand);
  const { mode } = input;
  if (mode === 'cuts') { const n = g.int(4, 12); const cuts = g.shuffle(Array.from({ length: n - 1 }, (_, i) => i + 1)).slice(0, g.int(1, Math.min(5, n - 1))); return { mode, n, cuts }; }
  if (mode === 'stonegame') { for (;;) { const k = g.pick([2, 4, 6]); const nums = Array.from({ length: k }, () => g.int(1, 9)); if (nums.reduce((x, y) => x + y, 0) % 2) return { mode, nums }; } }
  if (mode === 'triangulate') return { mode, nums: Array.from({ length: g.int(3, 6) }, () => g.int(1, 6)) };
  if (mode === 'stone2') return { mode, nums: Array.from({ length: g.int(1, 6) }, () => g.int(1, 9)) };
  return { mode, nums: Array.from({ length: g.int(1, 6) }, () => g.int(0, 9)) };
}

export const intvFields = (input) => (input.mode === 'cuts'
  ? [{ name: 'n', label: 'n (stick length)', placeholder: '7', short: true }, { name: 'cuts', label: 'cuts', placeholder: 'e.g. 1, 3, 4, 5' }]
  : [{ name: 'nums', label: { winner: 'nums', stonegame: 'piles (even count, odd total)', triangulate: 'vertex values', stone2: 'piles' }[input.mode], placeholder: { winner: '1, 5, 233, 7', stonegame: '5, 3, 4, 5', triangulate: '3, 7, 4, 5', stone2: '2, 7, 9, 4, 4' }[input.mode] }]);

export const intvDescribe = (input) => (input.mode === 'cuts' ? `n = ${input.n}, cuts ${list(input.cuts)}` : list(input.nums));

export const intvRule = {
  winner: 'lead = max(left − lead of the rest, right − lead of the rest)',
  stonegame: 'lead = max(left − rest, right − rest); Alice wins by parity anyway',
  triangulate: 'side (i, j) is in one triangle (i, k, j): try every k',
  stone2: 'dp[i][M] = max over X ≤ 2M of (stones left) − dp[i+X][max(M, X)]',
  cuts: 'first cut at c[k] costs the piece; then solve both halves',
};
