/**
 * More <MatrixViz> modes (Matrix Simulation lesson): transpose, spiral fill, game of life, staircase
 * search in a sorted matrix, diagonal traverse. Steps carry `grids`: [{ label, cells }] with cells
 * { l, c: [classes], b? } for <GridCells>, plus `out` (the result so far). Pure, for scripts/viz-check.mjs.
 */
import { list, rng } from './util.js';

const seq = (R, C) => Array.from({ length: R }, (_, r) => Array.from({ length: C }, (_, c) => r * C + c + 1));

export const MATRIX_MORE = {
  transpose: { label: 'Transpose: 2 × 3 → 3 × 2', input: { mode: 'transpose', m: [[1, 2, 3], [4, 5, 6]] } },
  spiral2: { label: 'Spiral fill, n = 4', input: { mode: 'spiral2', n: 4 } },
  life: { label: 'Game of life', input: { mode: 'life', m: [[0, 1, 0], [0, 0, 1], [1, 1, 1], [0, 0, 0]] } },
  search2d: { label: 'Staircase search: found', input: { mode: 'search2d', m: [[1, 4, 7, 11], [2, 5, 8, 12], [3, 6, 9, 16], [10, 13, 14, 17]], target: 5 } },
  search2dNo: { label: 'Staircase search: missing', input: { mode: 'search2d', m: [[1, 4, 7, 11], [2, 5, 8, 12], [3, 6, 9, 16], [10, 13, 14, 17]], target: 15 } },
  diagonal: { label: 'Diagonal traverse', input: { mode: 'diagonal', m: seq(3, 3) } },
  diagonalWide: { label: 'Diagonal traverse: 2 × 4', input: { mode: 'diagonal', m: seq(2, 4) } },
};

export const matrixMoreCode = (mode) => ({
  transpose: [['new', 'int[][] t = new int[cols][rows];          // the shape flips'], ['copy', 't[c][r] = m[r][c];                         // row r becomes column r']],
  spiral2: [['bounds', 'top = 0, bottom = n − 1, left = 0, right = n − 1, k = 1'], ['side', 'fill one side with k++, then move that boundary inwards'], ['turn', 'top row →, right column ↓, bottom row ←, left column ↑, repeat']],
  life: [['count', 'count live neighbours (|state| == 1 or state == 2 counts as alive now)'], ['encode', 'alive → dies: write 2;  dead → born: write 3      // old and new in one cell'], ['decode', 'second pass: 2 → 0, 3 → 1']],
  search2d: [['start', 'r = 0, c = cols − 1                      // top-right corner'], ['left', 'if (m[r][c] > target) c--;              // this whole column below is bigger too'], ['down', 'if (m[r][c] < target) r++;              // this whole row to the left is smaller too'], ['found', 'if (m[r][c] == target) return true;']],
  diagonal: [['diag', 'for d = 0 .. rows + cols − 2:   cells with r + c == d'], ['dir', 'even d: read upwards (bottom-left → top-right); odd d: downwards']],
})[mode];

// ---------------------------------------------------------------- independent answers

export function matrixMoreAnswer(input) {
  const { mode } = input;
  if (mode === 'transpose') { const m = input.m; return m[0].map((_, c) => m.map((row) => row[c])); }
  if (mode === 'spiral2') {
    const n = input.n, g = Array.from({ length: n }, () => Array(n).fill(0));
    const D = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    let r = 0, c = 0, d = 0;
    for (let k = 1; k <= n * n; k++) { g[r][c] = k; let nr = r + D[d][0], nc = c + D[d][1]; if (nr < 0 || nc < 0 || nr >= n || nc >= n || g[nr][nc]) { d = (d + 1) % 4; nr = r + D[d][0]; nc = c + D[d][1]; } r = nr; c = nc; }
    return g;
  }
  if (mode === 'life') {
    const m = input.m, R = m.length, C = m[0].length;
    return m.map((row, r) => row.map((v, c) => { let n = 0; for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) if ((dr || dc) && m[r + dr]?.[c + dc] === 1) n++; void R; void C; return v ? (n === 2 || n === 3 ? 1 : 0) : n === 3 ? 1 : 0; }));
  }
  if (mode === 'search2d') return input.m.some((row) => row.includes(input.target));
  const m = input.m, R = m.length, C = m[0].length, by = new Map();
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) { if (!by.has(r + c)) by.set(r + c, []); by.get(r + c).push([r, m[r][c]]); }
  return [...by.keys()].sort((a, b) => a - b).flatMap((d) => { const xs = by.get(d).sort((a, b) => a[0] - b[0]).map((x) => x[1]); return d % 2 === 0 ? xs.reverse() : xs; });
}

// ---------------------------------------------------------------- step-throughs

export function matrixMore(input) {
  const { mode } = input;
  const steps = [];
  const snap = (x) => steps.push({ mode, grids: [], chips: null, ...x });
  const cellsOf = (m, f) => m.map((row, r) => row.map((v, c) => f(v, r, c)));

  if (mode === 'transpose') {
    const m = input.m, R = m.length, C = m[0].length;
    const t = Array.from({ length: C }, () => Array(R).fill(null));
    const view = (r = null) => [
      { label: `matrix (${R} × ${C})`, cells: cellsOf(m, (v, rr) => ({ l: String(v), c: [rr === r ? 'ring_a' : 'open', rr === r && 'cellCur'] })) },
      { label: `transpose (${C} × ${R})`, cells: cellsOf(t, (v, rr, cc) => ({ l: v === null ? '' : String(v), c: [v === null ? 'open' : cc === r ? 'ring_a' : 'ring_b'] })) },
    ];
    snap({ kind: 'start', lines: ['new'], grids: view(), title: `Transpose a ${R} × ${C} matrix`, text: `Row i of the input becomes column i of the output, so the shape flips to ${C} × ${R}. ${R === C ? 'A square matrix could be transposed in place by swapping across the diagonal,' : 'Swapping in place is impossible for a non-square matrix,'} so build a new one: t[c][r] = m[r][c].`, calc: [`${R} × ${C} → ${C} × ${R}`] });
    for (let r = 0; r < R; r++) {
      for (let c = 0; c < C; c++) t[c][r] = m[r][c];
      snap({ kind: 'fill', lines: ['copy'], grids: view(r), title: `Row ${r} → column ${r}`, text: `Copy row ${r} (${list(m[r])}) down column ${r} of the result: t[c][${r}] = m[${r}][c] for every c.`, calc: [`column ${r}: ${list(m[r])}`] });
    }
    snap({ kind: 'done', lines: [], grids: view(), out: t, answer: t.map((row) => list(row)).join(' '), title: 'Transposed', text: 'Every cell was copied once: O(rows × cols) time and a new rows × cols array.', calc: t.map((row) => list(row)) });
    return steps;
  }

  if (mode === 'spiral2') {
    const n = input.n, g = Array.from({ length: n }, () => Array(n).fill(null));
    let top = 0, bottom = n - 1, left = 0, right = n - 1, k = 1;
    const view = (side = []) => { const s = new Set(side.map(([r, c]) => `${r},${c}`)); return [{ label: `${n} × ${n}`, cells: cellsOf(g, (v, r, c) => ({ l: v === null ? '' : String(v), c: [s.has(`${r},${c}`) ? 'ring_a' : v === null ? 'open' : 'ring_b', r >= top && r <= bottom && c >= left && c <= right && v === null && 'cellEnd'] })) }]; };
    snap({ kind: 'start', lines: ['bounds'], grids: view(), title: `Fill a ${n} × ${n} matrix with 1..${n * n} in spiral order`, text: 'The same four boundaries as Spiral Matrix, but writing instead of reading. Fill the top row, the right column, the bottom row, the left column, each time moving that boundary inwards (the dashed cells are the part still to fill).', calc: [`top 0, bottom ${n - 1}, left 0, right ${n - 1}`] });
    const side = (cells, name) => { cells.forEach(([r, c]) => { g[r][c] = k++; }); if (cells.length) snap({ kind: 'fill', lines: ['side', 'turn'], grids: view(cells), title: `${name}: ${cells.length === 1 ? g[cells[0][0]][cells[0][1]] : `${g[cells[0][0]][cells[0][1]]}..${k - 1}`}`, text: `Write ${cells.length === 1 ? 'the number' : `${cells.length} numbers`} along the ${name.toLowerCase()}, then move that boundary in. Now top ${top}, bottom ${bottom}, left ${left}, right ${right}.`, calc: [`next number ${k}`] }); };
    while (top <= bottom && left <= right) {
      const t = []; for (let c = left; c <= right; c++) t.push([top, c]); top++; side(t, 'Top row');
      const rt = []; for (let r = top; r <= bottom; r++) rt.push([r, right]); right--; side(rt, 'Right column');
      if (top <= bottom) { const b = []; for (let c = right; c >= left; c--) b.push([bottom, c]); bottom--; side(b, 'Bottom row'); }
      if (left <= right) { const l = []; for (let r = bottom; r >= top; r--) l.push([r, left]); left++; side(l, 'Left column'); }
    }
    snap({ kind: 'done', lines: [], grids: view(), out: g, answer: g.map((row) => list(row)).join(' '), title: `Filled 1..${n * n}`, text: 'Every cell written once: O(n²). For a square matrix the boundary checks before the bottom and left sides only matter in the very centre.', calc: g.map((row) => list(row)) });
    return steps;
  }

  if (mode === 'life') {
    const m = input.m.map((row) => [...row]), R = m.length, C = m[0].length;
    const alive = (v) => v === 1 || v === 2;
    const count = (r, c) => { let n = 0; for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) if ((dr || dc) && r + dr >= 0 && r + dr < R && c + dc >= 0 && c + dc < C && alive(m[r + dr][c + dc])) n++; return n; };
    const label = { 0: '0', 1: '1', 2: '1→0', 3: '0→1' };
    const cls = { 0: 'open', 1: 'land', 2: 'wall', 3: 'ring_a' };
    const view = (row = null, counts = null) => [{ label: 'board (small number = live neighbours)', cells: cellsOf(m, (v, r, c) => ({ l: label[v], c: [cls[v], r === row && 'cellCur'], b: counts && r === row ? String(counts[c]) : undefined })) }];
    snap({ kind: 'start', lines: [], grids: view(), title: `Next generation of a ${R} × ${C} board`, text: 'All cells change at the same moment, so a cell must not see a neighbour\'s new state. Copying the board works; to do it in place, store both states in one cell: 2 means "alive now, dies", 3 means "dead now, is born". When counting, 1 and 2 are alive (now). A second pass turns 2 into 0 and 3 into 1.', calc: [`${R} × ${C}`] });
    for (let r = 0; r < R; r++) {
      const counts = m[r].map((_, c) => count(r, c));
      const notes = [];
      m[r].forEach((v, c) => { const n = counts[c]; if (v === 1 && (n < 2 || n > 3)) { m[r][c] = 2; notes.push(`(${r},${c}) dies with ${n}`); } else if (v === 0 && n === 3) { m[r][c] = 3; notes.push(`(${r},${c}) is born with 3`); } });
      snap({ kind: notes.length ? 'mark' : 'fill', lines: ['count', 'encode'], grids: view(r, counts), title: `Row ${r}: ${notes.length ? `${notes.length} change${notes.length === 1 ? '' : 's'}` : 'no changes'}`, text: `Live neighbour counts for row ${r} are ${list(counts)} (counting 1 and 2 as alive, since rows above may already hold 2s). ${notes.length ? `${notes.join('; ')}.` : 'Every cell in this row keeps its state.'}`, calc: [`counts ${list(counts)}`] });
    }
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) m[r][c] = m[r][c] === 2 ? 0 : m[r][c] === 3 ? 1 : m[r][c];
    snap({ kind: 'done', lines: ['decode'], grids: view(), out: m.map((row) => [...row]), answer: m.map((row) => list(row)).join(' '), title: 'Decode: the next generation', text: 'The second pass keeps only the new state: 2 → 0, 3 → 1. O(rows × cols) time, O(1) extra space.', calc: m.map((row) => list(row)) });
    return steps;
  }

  if (mode === 'search2d') {
    const m = input.m, R = m.length, C = m[0].length, T = input.target;
    const gone = m.map((row) => row.map(() => false));
    let r = 0, c = C - 1;
    const path = [];
    const view = (hit = false) => [{ label: `target ${T}`, cells: cellsOf(m, (v, rr, cc) => ({ l: String(v), c: [hit && rr === r && cc === c ? 'isle_success' : path.some(([a, b]) => a === rr && b === cc) ? 'ring_b' : gone[rr][cc] ? 'gone' : 'open', rr === r && cc === c && !hit && 'cellCur'] })) }];
    snap({ kind: 'start', lines: ['start'], grids: view(), title: `Is ${T} in this sorted matrix?`, text: 'Start at the top-right corner. Its value is the largest in its row and the smallest in its column, so one comparison rules out a whole row or a whole column: bigger than the target → nothing below it in this column can be it, move left; smaller → nothing left of it in this row can be it, move down.', calc: [`start at (0, ${C - 1})`] });
    while (r < R && c >= 0) {
      const v = m[r][c];
      path.push([r, c]);
      if (v === T) { snap({ kind: 'found', lines: ['found'], grids: view(true), out: true, answer: 'true', title: `Found ${T} at (${r}, ${c})`, text: `After ${path.length} comparison${path.length === 1 ? '' : 's'}: at most rows + cols, never the whole matrix.`, calc: ['true'] }); return steps; }
      if (v > T) { for (let rr = r; rr < R; rr++) gone[rr][c] = true; snap({ kind: 'left', lines: ['left'], grids: view(), title: `${v} > ${T}: drop column ${c}`, text: `${v} is the smallest value left in column ${c} (everything below it is bigger), so ${T} can't be in this column. Move left.`, calc: [`c = ${c - 1}`] }); c--; }
      else { for (let cc = 0; cc <= c; cc++) gone[r][cc] = true; snap({ kind: 'down', lines: ['down'], grids: view(), title: `${v} < ${T}: drop row ${r}`, text: `${v} is the largest value left in row ${r} (everything to its left is smaller), so ${T} can't be in this row. Move down.`, calc: [`r = ${r + 1}`] }); r++; }
    }
    snap({ kind: 'done', lines: [], grids: view(), out: false, answer: 'false', title: `${T} is not in the matrix`, text: `Walked off the matrix after ${path.length} comparisons: every row or column was ruled out. O(rows + cols).`, calc: ['false'] });
    return steps;
  }

  // diagonal traverse
  const m = input.m, R = m.length, C = m[0].length;
  const order = new Map(), out = [];
  const view = (cur = []) => { const s = new Set(cur.map(([r, c]) => `${r},${c}`)); return [{ label: `${R} × ${C}`, cells: cellsOf(m, (v, r, c) => ({ l: String(v), c: [s.has(`${r},${c}`) ? 'ring_a' : order.has(`${r},${c}`) ? 'ring_b' : 'open'], b: order.has(`${r},${c}`) ? String(order.get(`${r},${c}`)) : undefined })) }]; };
  snap({ kind: 'start', lines: ['diag'], grids: view(), title: `Diagonal zig-zag of a ${R} × ${C} matrix`, text: 'Every cell on one anti-diagonal has the same r + c. So loop d from 0 to rows + cols − 2, and read the cells with r + c = d. Even diagonals go up (r decreasing), odd ones go down. Only the start of each diagonal needs care: clamp it to the matrix.', calc: [`${R + C - 1} diagonals`] });
  for (let d = 0; d <= R + C - 2; d++) {
    const cells = [];
    for (let r = Math.max(0, d - C + 1); r <= Math.min(R - 1, d); r++) cells.push([r, d - r]);
    if (d % 2 === 0) cells.reverse();
    cells.forEach(([r, c]) => { out.push(m[r][c]); order.set(`${r},${c}`, out.length); });
    snap({ kind: d % 2 ? 'down' : 'up', lines: ['diag', 'dir'], grids: view(cells), chips: [{ label: 'output', chips: out.map((v, k) => ({ key: k, text: String(v), tone: k >= out.length - cells.length ? 'accent' : undefined })) }], title: `d = ${d}: ${d % 2 ? 'downwards' : 'upwards'}`, text: `The cells with r + c = ${d} are ${cells.map(([r, c]) => `(${r},${c})`).join(', ')}. ${d % 2 ? 'Odd: read top to bottom.' : 'Even: read bottom to top.'}`, calc: [`read ${list(cells.map(([r, c]) => m[r][c]))}`] });
  }
  snap({ kind: 'done', lines: [], grids: view(), chips: [{ label: 'output', chips: out.map((v, k) => ({ key: k, text: String(v) })) }], out, answer: list(out), title: `Zig-zag: ${list(out)}`, text: 'Each cell read once: O(rows × cols). Grouping by r + c is the whole trick; the direction just alternates.', calc: [list(out)] });
  return steps;
}

// ---------------------------------------------------------------- inputs

const ints = (t) => String(t ?? '').replace(/[[\]]/g, ' ').split(/[\s,]+/).filter(Boolean).map(Number);
const isInt = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi;

export function matrixMoreParse(values, input) {
  const { mode } = input;
  if (mode === 'spiral2') { const n = Number(values.n); return isInt(n, 1, 6) ? { input: { mode, n } } : { error: 'n from 1 to 6.' }; }
  const rows = String(values.m ?? '').split(/[;\n|]/).map((r) => r.trim()).filter(Boolean).map(ints);
  const lo = mode === 'life' ? 0 : -9, hi = mode === 'life' ? 1 : 99;
  if (!rows.length || rows.length > 6 || rows.some((r) => !r.length || r.length > 6 || r.length !== rows[0].length || !r.every((v) => isInt(v, lo, hi)))) return { error: `Up to 6 rows of up to 6 numbers (${lo} to ${hi}), all the same length, separated by ;` };
  if (mode === 'search2d') {
    const T = Number(values.target);
    if (!isInt(T, -99, 199)) return { error: 'The target is a whole number.' };
    const sorted = rows.every((r) => r.every((v, c) => c === 0 || r[c - 1] <= v)) && rows.every((r, i) => i === 0 || r.every((v, c) => rows[i - 1][c] <= v));
    if (!sorted) return { error: 'Every row and every column must be sorted ascending.' };
    return { input: { mode, m: rows, target: T } };
  }
  return { input: { mode, m: rows } };
}

export function matrixMoreValues(input) {
  if (input.mode === 'spiral2') return { n: String(input.n) };
  const v = { m: input.m.map((r) => r.join(' ')).join('; ') };
  if (input.mode === 'search2d') v.target = String(input.target);
  return v;
}

export function matrixMoreRandom(input, rand = Math.random) {
  const g = rng(rand);
  const { mode } = input;
  if (mode === 'spiral2') return { mode, n: g.int(1, 5) };
  const R = g.int(1, 5), C = g.int(1, 5);
  if (mode === 'life') return { mode, m: Array.from({ length: R }, () => Array.from({ length: C }, () => (g.bool(0.4) ? 1 : 0))) };
  if (mode === 'search2d') { const m = Array.from({ length: R }, (_, r) => Array.from({ length: C }, (__, c) => 2 * (r + c) + g.int(0, 1))); for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) m[r][c] = Math.max(m[r][c], r ? m[r - 1][c] : 0, c ? m[r][c - 1] : 0); return { mode, m, target: g.int(0, 2 * (R + C)) }; }
  return { mode, m: Array.from({ length: R }, () => Array.from({ length: C }, () => g.int(1, 9))) };
}

export const matrixMoreRule = {
  transpose: 't[c][r] = m[r][c]: the shape flips',
  spiral2: 'fill a side, move that boundary in',
  life: 'encode old and new together: 2 = dies, 3 = born',
  search2d: 'top-right: bigger → left, smaller → down',
  diagonal: 'group by r + c; alternate the direction',
};
