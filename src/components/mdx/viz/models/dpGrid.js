/**
 * More grid tables for <DpGridViz> (the DP Grid lesson): triangle, falling path, counting squares,
 * the dungeon (filled backwards), cherry pickup (two walkers) and the longest increasing path.
 * Same step shape as dp2d. Pure, so scripts/viz-check.mjs can compare each mode with a brute force.
 */
import { list, parseInts, rng } from './util.js';

export const GRID = {
  triangle: { label: 'Triangle', input: { mode: 'triangle', tri: [[2], [3, 4], [6, 5, 7], [4, 1, 8, 3]] } },
  falling: { label: 'Minimum falling path', input: { mode: 'falling', m: [[2, 1, 3], [6, 5, 4], [7, 8, 9]] } },
  countsq: { label: 'Count squares', input: { mode: 'countsq', grid: [[0, 1, 1, 1], [1, 1, 1, 1], [0, 1, 1, 1]] } },
  dungeon: { label: 'Dungeon game', input: { mode: 'dungeon', d: [[-2, -3, 3], [-5, -10, 1], [10, 30, -5]] } },
  cherry: { label: 'Cherry pickup', input: { mode: 'cherry', g: [[0, 1, -1], [1, 0, -1], [1, 1, 1]] } },
  lip: { label: 'Longest increasing path', input: { mode: 'lip', m: [[9, 9, 4], [6, 6, 8], [2, 1, 1]] } },
};

export const gridCode = (mode) => ({
  triangle: [['base', 'best[last row] = the values themselves'], ['fill', 'best[r][i] = tri[r][i] + min(best[r+1][i], best[r+1][i+1])   // bottom up'], ['pick', 'return best[0][0]']],
  falling: [['base', 'dp[0] = the first row'], ['fill', 'dp[r][c] = m[r][c] + min(dp[r−1][c−1], dp[r−1][c], dp[r−1][c+1])'], ['pick', 'return min(dp[last row])']],
  countsq: [['fill', 'side[r][c] = m[r][c] ? 1 + min(top, left, top-left) : 0'], ['pick', 'count += side[r][c]          // squares ending here: sizes 1..side']],
  dungeon: [['base', 'need[last][last] = max(1, 1 − d[last][last])'], ['fill', 'need[r][c] = max(1, min(need right, need below) − d[r][c])   // backwards'], ['pick', 'return need[0][0]']],
  cherry: [['base', 'both walkers start at (0, 0); after k steps walker i is at (r_i, k − r_i)'], ['fill', 'dp[k][r1][r2] = cherries at both cells (once if same) + best of the 4 ways both arrived'], ['pick', 'return max(0, dp[2n−2][n−1][n−1])']],
  lip: [['base', 'take cells in increasing order of value'], ['fill', 'len[cell] = 1 + max len of a smaller neighbour'], ['pick', 'return max(len)']],
})[mode];

// ---------------------------------------------------------------- brute forces

export function gridAnswer(input) {
  const { mode } = input;
  if (mode === 'triangle') { const t = input.tri; const go = (r, i) => (r === t.length ? 0 : t[r][i] + Math.min(go(r + 1, i), go(r + 1, i + 1))); return go(0, 0); }
  if (mode === 'falling') { const m = input.m, n = m.length; const go = (r, c) => (c < 0 || c >= n ? Infinity : r === n - 1 ? m[r][c] : m[r][c] + Math.min(go(r + 1, c - 1), go(r + 1, c), go(r + 1, c + 1))); return Math.min(...m[0].map((_, c) => go(0, c))); }
  if (mode === 'countsq') { const g = input.grid; let k = 0; for (let r = 0; r < g.length; r++) for (let c = 0; c < g[0].length; c++) for (let s = 1; r + s <= g.length && c + s <= g[0].length; s++) { let all = true; for (let i = 0; i < s; i++) for (let j = 0; j < s; j++) if (!g[r + i][c + j]) all = false; if (all) k++; } return k; }
  if (mode === 'dungeon') {
    const d = input.d, R = d.length, C = d[0].length;
    let best = Infinity;
    const go = (r, c, sum, need) => { sum += d[r][c]; need = Math.max(need, 1 - sum); if (r === R - 1 && c === C - 1) { best = Math.min(best, need); return; } if (r + 1 < R) go(r + 1, c, sum, need); if (c + 1 < C) go(r, c + 1, sum, need); };
    go(0, 0, 0, 1);
    return best;
  }
  if (mode === 'cherry') {
    const g = input.g, n = g.length;
    const paths = [];
    const walk = (r, c, p) => { if (g[r][c] === -1) return; p = [...p, [r, c]]; if (r === n - 1 && c === n - 1) { paths.push(p); return; } if (r + 1 < n) walk(r + 1, c, p); if (c + 1 < n) walk(r, c + 1, p); };
    walk(0, 0, []);
    let best = 0;
    for (const a of paths) for (const b of paths) { const s = new Set([...a, ...b].map(([r, c]) => `${r},${c}`)); let k = 0; s.forEach((key) => { const [r, c] = key.split(',').map(Number); k += g[r][c]; }); best = Math.max(best, k); }
    return best;
  }
  const m = input.m, R = m.length, C = m[0].length;
  const go = (r, c) => 1 + Math.max(0, ...[[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dr, dc]) => [r + dr, c + dc]).filter(([x, y]) => x >= 0 && y >= 0 && x < R && y < C && m[x][y] > m[r][c]).map(([x, y]) => go(x, y)));
  let best = 0;
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) best = Math.max(best, go(r, c));
  return best;
}

// ---------------------------------------------------------------- the tables

export function gridSteps(input) {
  const { mode } = input;
  const steps = [];
  let rows, cols, cells, given = null, blocked = null;
  const snap = (x) => steps.push({ mode, rows, cols, cells: cells.map((r) => [...r]), given, blocked, deps: [], path: null, ...x });

  if (mode === 'triangle') {
    const t = input.tri, R = t.length;
    rows = t.map((_, r) => String(r)); cols = t.map((_, c) => String(c));
    cells = t.map((row) => cols.map((_, c) => (c < row.length ? null : '')));
    given = t.map((row) => cols.map((_, c) => (c < row.length ? row[c] : '')));
    snap({ kind: 'start', cur: null, lines: [], title: 'Cheapest path from the top to the bottom', text: 'Top-down, the best path out of a cell depends on choices below it. Turn it around: start at the bottom row, where the best path from a cell is just its value. Then each cell above adds the cheaper of the two cells under it. The top cell ends up holding the answer. (Small numbers are the triangle\'s values.)', calc: [`${R} rows`] });
    t[R - 1].forEach((v, c) => { cells[R - 1][c] = v; });
    snap({ kind: 'base', cur: [R - 1, 0], lines: ['base'], title: 'Bottom row: just the values', text: 'From the bottom row there is nowhere left to go: the best path from each cell is the cell itself.', calc: [list(t[R - 1])] });
    for (let r = R - 2; r >= 0; r--) for (let c = 0; c <= r; c++) {
      const a = cells[r + 1][c], b = cells[r + 1][c + 1];
      cells[r][c] = t[r][c] + Math.min(a, b);
      snap({ kind: 'fill', cur: [r, c], lines: ['fill'], deps: [{ r: r + 1, c, tone: a <= b ? 'success' : 'muted', label: '↓' }, { r: r + 1, c: c + 1, tone: b < a ? 'success' : 'muted', label: '↘' }], title: `(${r}, ${c}): ${t[r][c]} + min(${a}, ${b}) = ${cells[r][c]}`, text: `From ${t[r][c]} you can step to index ${c} (best ${a}) or ${c + 1} (best ${b}) in the row below; take the cheaper.`, calc: [`${t[r][c]} + ${Math.min(a, b)} = ${cells[r][c]}`] });
    }
    snap({ kind: 'done', cur: [0, 0], lines: ['pick'], answer: `min = ${cells[0][0]}`, title: `Minimum path sum: ${cells[0][0]}`, text: 'Bottom-up there is only one answer cell, the top. O(n²) time; one row of memory is enough (the row below).', calc: [`= ${cells[0][0]}`] });
    return steps;
  }

  if (mode === 'falling') {
    const m = input.m, n = m.length;
    rows = m.map((_, r) => String(r)); cols = m.map((_, c) => String(c));
    cells = m.map((row) => row.map(() => null));
    given = m;
    snap({ kind: 'start', cur: null, lines: [], title: 'Cheapest falling path', text: 'A path starts anywhere in the first row and drops one row at a time: straight down, down-left or down-right. dp[r][c] = the cheapest path ending at (r, c) = its value + the cheapest of the up to three cells above it.', calc: [`${n} × ${n}`] });
    m[0].forEach((v, c) => { cells[0][c] = v; });
    snap({ kind: 'base', cur: [0, 0], lines: ['base'], title: 'First row: just the values', text: 'A path can start at any cell of the first row.', calc: [list(m[0])] });
    for (let r = 1; r < n; r++) for (let c = 0; c < n; c++) {
      const ps = [c - 1, c, c + 1].filter((x) => x >= 0 && x < n);
      const best = Math.min(...ps.map((x) => cells[r - 1][x]));
      cells[r][c] = m[r][c] + best;
      snap({ kind: 'fill', cur: [r, c], lines: ['fill'], deps: ps.map((x) => ({ r: r - 1, c: x, tone: cells[r - 1][x] === best ? 'success' : 'muted' })), title: `(${r}, ${c}): ${m[r][c]} + ${best} = ${cells[r][c]}`, text: `The cells above that can fall here hold ${ps.map((x) => cells[r - 1][x]).join(', ')}; the cheapest is ${best}.`, calc: [`= ${cells[r][c]}`] });
    }
    const ans = Math.min(...cells[n - 1]);
    snap({ kind: 'done', cur: [n - 1, cells[n - 1].indexOf(ans)], lines: ['pick'], answer: `min = ${ans}`, title: `Minimum falling path: ${ans}`, text: 'The path can end anywhere in the last row, so take the minimum there. O(n²).', calc: [`= ${ans}`] });
    return steps;
  }

  if (mode === 'countsq') {
    const g = input.grid, R = g.length, C = g[0].length;
    rows = g.map((_, r) => String(r)); cols = g[0].map((_, c) => String(c));
    cells = g.map((row) => row.map(() => null));
    given = g;
    let count = 0;
    snap({ kind: 'start', cur: null, lines: [], title: 'Count all squares of ones', text: 'side[r][c] = the side of the largest all-ones square whose bottom-right corner is (r, c): 1 + the smallest of top, left and top-left. The neat part: that many squares end here (sizes 1 up to side), so add side[r][c] to the count.', calc: [`${R} × ${C}`] });
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      if (!g[r][c]) { cells[r][c] = 0; snap({ kind: 'block', cur: [r, c], lines: ['fill'], title: `(${r}, ${c}) is 0`, text: 'No square of ones can end on a 0.', calc: [`count = ${count}`] }); continue; }
      const edge = r === 0 || c === 0;
      cells[r][c] = edge ? 1 : 1 + Math.min(cells[r - 1][c], cells[r][c - 1], cells[r - 1][c - 1]);
      count += cells[r][c];
      snap({ kind: 'fill', cur: [r, c], lines: ['fill', 'pick'], deps: edge ? [] : [{ r: r - 1, c, tone: 'accent' }, { r, c: c - 1, tone: 'accent' }, { r: r - 1, c: c - 1, tone: 'accent' }], title: `(${r}, ${c}): side ${cells[r][c]}, count + ${cells[r][c]} = ${count}`, text: edge ? 'On the top row or left column a square of ones can only be 1 × 1.' : `The smallest of the three neighbours is ${cells[r][c] - 1}, so the largest square here has side ${cells[r][c]}, and ${cells[r][c]} square${cells[r][c] === 1 ? '' : 's'} (sizes 1 to ${cells[r][c]}) end at this corner.`, calc: [`count = ${count}`] });
    }
    snap({ kind: 'done', cur: null, lines: ['pick'], answer: `count = ${count}`, title: `${count} squares`, text: 'Summing the sides counts every square exactly once, by its bottom-right corner. O(rows × cols).', calc: [`= ${count}`] });
    return steps;
  }

  if (mode === 'dungeon') {
    const d = input.d, R = d.length, C = d[0].length;
    rows = d.map((_, r) => String(r)); cols = d[0].map((_, c) => String(c));
    cells = d.map((row) => row.map(() => null));
    given = d;
    snap({ kind: 'start', cur: null, lines: [], title: 'Least starting health', text: 'Going forwards, the best route depends on health you don\'t know yet. Go backwards instead: need[r][c] = the least health needed when entering (r, c) to survive to the end. Entering with need, you must still have at least the need of the next room after this room changes your health, and never less than 1. (Small numbers are the rooms\' effects.)', calc: [`${R} × ${C}`] });
    for (let r = R - 1; r >= 0; r--) for (let c = C - 1; c >= 0; c--) {
      const last = r === R - 1 && c === C - 1;
      const nexts = [...(c + 1 < C ? [[r, c + 1]] : []), ...(r + 1 < R ? [[r + 1, c]] : [])];
      const after = last ? 1 : Math.min(...nexts.map(([x, y]) => cells[x][y]));
      cells[r][c] = Math.max(1, after - d[r][c]);
      snap({ kind: last ? 'base' : 'fill', cur: [r, c], lines: [last ? 'base' : 'fill'], deps: nexts.map(([x, y]) => ({ r: x, c: y, tone: cells[x][y] === after ? 'success' : 'muted' })), title: `need[${r}][${c}] = max(1, ${after} − (${d[r][c]})) = ${cells[r][c]}`, text: last ? `The princess's room changes health by ${d[r][c]}; afterwards he must have at least 1.` : `After this room he needs ${after} (the easier of right and down). The room ${d[r][c] < 0 ? `costs ${-d[r][c]}` : `heals ${d[r][c]}`}, so he must enter with ${after - d[r][c]}${after - d[r][c] < 1 ? ', but health can\'t be below 1' : ''}.`, calc: [`need = ${cells[r][c]}`] });
    }
    snap({ kind: 'done', cur: [0, 0], lines: ['pick'], answer: `health = ${cells[0][0]}`, title: `Start with ${cells[0][0]}`, text: 'Forwards DP fails because the best route so far might leave too little health for a deadly room later. Backwards, every cell knows exactly what it requires. O(rows × cols).', calc: [`= ${cells[0][0]}`] });
    return steps;
  }

  if (mode === 'cherry') {
    const g = input.g, n = g.length;
    rows = g.map((_, r) => `w1 row ${r}`); cols = g.map((_, r) => `w2 ${r}`);
    const NEG = -Infinity;
    let dp = g.map(() => g.map(() => NEG));
    dp[0][0] = g[0][0];
    const show = (layer) => layer.map((row) => row.map((v) => (v === NEG ? '—' : v)));
    cells = show(dp);
    snap({ kind: 'start', cur: [0, 0], lines: ['base'], title: 'Two trips = two walkers at once', text: 'Walking there and back is the same as two walkers both going from the top-left to the bottom-right at the same time. After k steps each walker is on the diagonal r + c = k, so a state is (k, row of walker 1, row of walker 2). A cell both stand on gives its cherry once. Each table below is one step k: rows = walker 1\'s row, columns = walker 2\'s row, "—" = impossible.', calc: [`start: ${g[0][0]} cherr${g[0][0] === 1 ? 'y' : 'ies'}`] });
    for (let k = 1; k <= 2 * n - 2; k++) {
      const nx = g.map(() => g.map(() => NEG));
      for (let r1 = 0; r1 < n; r1++) for (let r2 = 0; r2 < n; r2++) {
        const c1 = k - r1, c2 = k - r2;
        if (c1 < 0 || c2 < 0 || c1 >= n || c2 >= n || g[r1][c1] === -1 || g[r2][c2] === -1) continue;
        let best = NEG;
        for (const [a, b] of [[r1, r2], [r1 - 1, r2], [r1, r2 - 1], [r1 - 1, r2 - 1]]) if (a >= 0 && b >= 0 && dp[a][b] > best) best = dp[a][b];
        if (best === NEG) continue;
        nx[r1][r2] = best + g[r1][c1] + (r1 === r2 ? 0 : g[r2][c2]);
      }
      dp = nx;
      cells = show(dp);
      const vals = dp.flat().filter((v) => v !== NEG);
      const pairs = [];
      dp.forEach((row, r1) => row.forEach((v, r2) => { if (v !== NEG && r1 <= r2) pairs.push(`w1 (${r1},${k - r1}) + w2 (${r2},${k - r2}): ${v}`); }));
      snap({ kind: 'fill', cur: null, lines: ['fill'], title: `Step ${k}: ${vals.length ? `best so far ${Math.max(...vals)}` : 'no way forward'}`, text: `Both walkers are now on the diagonal r + c = ${k}. Each cell (r1, r2) takes the best of the four ways the two could have arrived (each from above or from the left) and adds the cherries under both, once if they share a cell. Thorns and off-grid positions stay "—".`, calc: pairs.length ? pairs.slice(0, 4) : ['no reachable pair'] });
    }
    const ans = Math.max(0, dp[n - 1][n - 1]);
    snap({ kind: 'done', cur: [n - 1, n - 1], lines: ['pick'], answer: `cherries = ${ans}`, title: dp[n - 1][n - 1] === NEG ? 'No valid trip: 0' : `${ans} cherries`, text: 'Moving the walkers together is what makes "a cherry is picked only once" easy: at the same step, sharing a cell means sharing a row. O(n³) states.', calc: [`= ${ans}`] });
    return steps;
  }

  // lip: cells in increasing order of value
  const m = input.m, R = m.length, C = m[0].length;
  rows = m.map((_, r) => String(r)); cols = m[0].map((_, c) => String(c));
  cells = m.map((row) => row.map(() => null));
  given = m;
  const order = [];
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) order.push([r, c]);
  order.sort((x, y) => m[x[0]][x[1]] - m[y[0]][y[1]]);
  snap({ kind: 'start', cur: null, lines: ['base'], title: 'Longest strictly increasing path', text: 'len[cell] = the longest increasing path that ends at this cell = 1 + the best len of a smaller neighbour. If cells are handled in increasing order of value, every smaller neighbour is already finished. (DFS with memoisation does the same thing implicitly. Paths can\'t loop, because values strictly increase.)', calc: [`${R} × ${C}`] });
  for (const [r, c] of order) {
    const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dr, dc]) => [r + dr, c + dc]).filter(([x, y]) => x >= 0 && y >= 0 && x < R && y < C && m[x][y] < m[r][c]);
    const best = Math.max(0, ...nb.map(([x, y]) => cells[x][y]));
    cells[r][c] = 1 + best;
    snap({ kind: 'fill', cur: [r, c], lines: ['fill'], deps: nb.map(([x, y]) => ({ r: x, c: y, tone: cells[x][y] === best ? 'success' : 'muted' })), title: `${m[r][c]} at (${r}, ${c}): len ${cells[r][c]}`, text: nb.length ? `Smaller neighbours: ${nb.map(([x, y]) => `${m[x][y]} (len ${cells[x][y]})`).join(', ')}. Extend the longest.` : 'No smaller neighbour: a path can only start here.', calc: [`len = ${cells[r][c]}`] });
  }
  const ans = Math.max(...cells.flat());
  snap({ kind: 'done', cur: null, lines: ['pick'], answer: `longest = ${ans}`, title: `Longest increasing path: ${ans}`, text: 'Each cell is computed once from at most four neighbours: O(rows × cols) after sorting (or with memoised DFS).', calc: [`= ${ans}`] });
  return steps;
}

// ---------------------------------------------------------------- inputs

const intRows = (text, { min, max, maxR = 5, maxC = 5 }) => {
  const rows = String(text ?? '').split(/[;\n|]/).map((r) => r.trim()).filter(Boolean);
  const out = [];
  for (const r of rows) { const p = parseInts(r, { min, max, minLen: 1, maxLen: maxC, name: 'each row' }); if (p.error) return p; out.push(p.arr); }
  if (!out.length || out.length > maxR) return { error: `Up to ${maxR} rows separated by ;` };
  return { rows: out };
};

export function gridParse(values, input) {
  const { mode } = input;
  if (mode === 'triangle') {
    const t = intRows(values.grid, { min: -9, max: 9 }); if (t.error) return t;
    if (t.rows.some((r, i) => r.length !== i + 1)) return { error: 'Row i must have i + 1 numbers: 2; 3 4; 6 5 7' };
    return { input: { mode, tri: t.rows } };
  }
  if (mode === 'countsq') {
    const rowsT = String(values.grid ?? '').split(/[;\n|]/).map((r) => r.replace(/[\s,]/g, '')).filter(Boolean);
    if (!rowsT.length || rowsT.length > 5 || rowsT.some((r) => r.length !== rowsT[0].length || r.length > 6 || /[^01]/.test(r))) return { error: 'Rows of 0s and 1s separated by ;, all the same length.' };
    return { input: { mode, grid: rowsT.map((r) => [...r].map(Number)) } };
  }
  const lim = { falling: [-9, 9], dungeon: [-99, 99], cherry: [-1, 1], lip: [0, 20] }[mode];
  const t = intRows(values.grid, { min: lim[0], max: lim[1], maxR: mode === 'cherry' ? 4 : 5, maxC: mode === 'cherry' ? 4 : 5 }); if (t.error) return t;
  const g = t.rows;
  if (g.some((r) => r.length !== g[0].length)) return { error: 'Every row needs the same length.' };
  if ((mode === 'falling' || mode === 'cherry') && g.length !== g[0].length) return { error: 'The grid must be square.' };
  if (mode === 'cherry' && (g[0][0] === -1 || g.at(-1).at(-1) === -1)) return { error: 'The corners can\'t be thorns.' };
  return { input: { mode, [mode === 'dungeon' ? 'd' : mode === 'cherry' ? 'g' : 'm']: g } };
}

export function gridValues(input) {
  const rowsOf = (g, sep = ' ') => g.map((r) => r.join(sep)).join('; ');
  return ({ triangle: { grid: rowsOf(input.tri ?? []) }, countsq: { grid: rowsOf(input.grid ?? [], '') }, falling: { grid: rowsOf(input.m ?? []) }, lip: { grid: rowsOf(input.m ?? []) }, dungeon: { grid: rowsOf(input.d ?? []) }, cherry: { grid: rowsOf(input.g ?? []) } })[input.mode];
}

export function gridRandom(input, rand = Math.random) {
  const g = rng(rand);
  const { mode } = input;
  const mat = (R, C, lo, hi) => Array.from({ length: R }, () => Array.from({ length: C }, () => g.int(lo, hi)));
  if (mode === 'triangle') { const R = g.int(2, 5); return { mode, tri: Array.from({ length: R }, (_, r) => Array.from({ length: r + 1 }, () => g.int(-3, 9))) }; }
  if (mode === 'falling') { const n = g.int(2, 4); return { mode, m: mat(n, n, -5, 9) }; }
  if (mode === 'countsq') return { mode, grid: Array.from({ length: g.int(2, 4) }, (_, __, C = 4) => Array.from({ length: 4 }, () => (g.bool(0.7) ? 1 : 0))) };
  if (mode === 'dungeon') return { mode, d: mat(g.int(1, 4), g.int(1, 4), -9, 9) };
  if (mode === 'cherry') { const n = g.int(2, 4); const gg = mat(n, n, 0, 1).map((r) => r.map((v) => (g.bool(0.15) ? -1 : v))); gg[0][0] = 0; gg[n - 1][n - 1] = g.int(0, 1); return { mode, g: gg }; }
  return { mode, m: mat(g.int(1, 4), g.int(1, 4), 0, 9) };
}

export const gridFields = (input) => [{ name: 'grid', label: { triangle: 'triangle rows (row i has i + 1 numbers)', countsq: 'rows of 0/1', falling: 'square matrix rows', lip: 'matrix rows', dungeon: 'rooms (negative hurts)', cherry: 'square grid: 1 cherry, 0 empty, −1 thorn' }[input.mode], placeholder: { triangle: 'e.g. 2; 3 4; 6 5 7', countsq: 'e.g. 0111; 1111; 0111', falling: 'e.g. 2 1 3; 6 5 4; 7 8 9', lip: 'e.g. 9 9 4; 6 6 8; 2 1 1', dungeon: 'e.g. -2 -3 3; -5 -10 1; 10 30 -5', cherry: 'e.g. 0 1 -1; 1 0 -1; 1 1 1' }[input.mode] }];

export const gridDescribe = (input) => {
  const g = input.tri ?? input.grid ?? input.m ?? input.d ?? input.g;
  return input.mode === 'triangle' ? `${g.length} rows` : `${g.length} × ${g[0].length}`;
};

export const gridRule = {
  triangle: 'best = value + min(the two below), from the bottom up',
  falling: 'dp = value + min of the (up to) three above',
  countsq: 'side = 1 + min(top, left, top-left); count += side',
  dungeon: 'need = max(1, min(right, down) − room), from the end back',
  cherry: 'two walkers, same step: best of 4 arrivals + cherries (once if shared)',
  lip: 'in increasing value order: len = 1 + max len of a smaller neighbour',
};
