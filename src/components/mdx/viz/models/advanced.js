/**
 * Step-throughs for the Design, Matrices & Advanced Topics module (models for <LruViz>, <MatrixViz>,
 * <MathViz>, <KmpViz>, <FenwickViz> and <SegTreeViz>). Pure, so scripts/viz-check.mjs can test them.
 */
import { list, parseInt1, parseInts, plural, rng } from './util.js';

// ---------------------------------------------------------------- LRU cache

export const LRU = {
  lesson: { label: 'Capacity 3', input: { cap: 3, ops: [['put', 1, 'A'], ['put', 2, 'B'], ['put', 3, 'C'], ['get', 1], ['put', 4, 'D'], ['get', 2], ['put', 3, 'Z']] } },
  refresh: { label: 'A get saves a key', input: { cap: 2, ops: [['put', 1, 'A'], ['put', 2, 'B'], ['get', 1], ['put', 3, 'C'], ['get', 1], ['get', 2]] } },
};

export const lruCode = [
  ['get', 'get(k): n = map.get(k);  if (n == null) return -1;'],
  ['move', '  remove(n);  addFront(n);                  // just used: now the most recent'],
  ['update', 'put(k, v): if (k in map) { update value; move to front; return; }'],
  ['evict', '  if (full) { lru = tail.prev;  remove(lru);  map.remove(lru.key); }   // evict from the back'],
  ['add', '  n = new Node(k, v);  map.put(k, n);  addFront(n);'],
];

export function lruAnswer({ cap, ops }) {
  const m = new Map(), out = [];
  for (const op of ops) {
    if (op[0] === 'get') { if (m.has(op[1])) { const v = m.get(op[1]); m.delete(op[1]); m.set(op[1], v); out.push(v); } else out.push(-1); continue; }
    if (m.has(op[1])) m.delete(op[1]);
    else if (m.size === cap) m.delete(m.keys().next().value);
    m.set(op[1], op[2]);
  }
  return { out, order: [...m.keys()].reverse() };
}

export function lru({ cap, ops }) {
  let list2 = [];             // most recent first: [{ key, val }]
  const out = [];
  const steps = [];
  const snap = (x) => steps.push({ cap, list: list2.map((n) => ({ ...n })), out: [...out], ...x });
  snap({ kind: 'start', lines: [], title: `An LRU cache with room for ${cap}`, text: 'Two structures work together. The hash map finds any key\'s node in O(1). The doubly linked list keeps the nodes in order of use: most recent at the front (left), least recent at the back. Moving a node or dropping the last one is a few pointer changes.', calc: [`capacity ${cap}`] });
  for (const op of ops) {
    const [kind, key] = op;
    const at = list2.findIndex((n) => n.key === key);
    if (kind === 'get') {
      if (at < 0) {
        out.push(-1);
        snap({ kind: 'miss', key, lines: ['get'], title: `get(${key}) → −1`, text: `${key} isn't in the map${steps.some((s2) => s2.evicted === key) ? ' (it was evicted earlier)' : ''}, so return −1. Nothing moves.`, calc: [`map has ${key}? no`] });
        continue;
      }
      const n = list2[at];
      list2 = [n, ...list2.filter((x) => x.key !== key)];
      out.push(n.val);
      snap({ kind: 'hit', key, from: at, lines: ['get', 'move'], title: `get(${key}) → ${n.val}, move it to the front`, text: `The map points straight at ${key}'s node, so there's no searching. Using it makes it the most recent: unlink it${at === 0 ? ' (it was already at the front)' : ` from position ${at + 1}`} and put it at the front.`, calc: [`return ${n.val}`, `order: ${list2.map((x) => x.key).join(' → ')}`] });
      continue;
    }
    const val = op[2];
    if (at >= 0) {
      list2 = [{ key, val }, ...list2.filter((x) => x.key !== key)];
      snap({ kind: 'update', key, from: at, lines: ['update'], title: `put(${key}, ${val}): ${key} exists, update it`, text: `${key} is already cached: change its value to ${val} and move it to the front, since it was just used.`, calc: [`order: ${list2.map((x) => x.key).join(' → ')}`] });
      continue;
    }
    let evicted = null;
    if (list2.length === cap) { evicted = list2.at(-1).key; list2 = list2.slice(0, -1); }
    list2 = [{ key, val }, ...list2];
    snap({ kind: evicted !== null ? 'evict' : 'add', key, evicted, lines: evicted !== null ? ['evict', 'add'] : ['add'], title: evicted !== null ? `put(${key}, ${val}): full, evict ${evicted}` : `put(${key}, ${val}): new key at the front`, text: evicted !== null ? `The cache already holds ${cap}. The least recently used key is the node at the back, ${evicted}: unlink it, and remove ${evicted} from the map too (that's why each node stores its key). Then ${key} goes in at the front.` : `${key} is new: create a node, put it at the front, and point the map at it.`, calc: [`order: ${list2.map((x) => x.key).join(' → ')}`, ...(evicted !== null ? [`evicted ${evicted}`] : [])] });
  }
  snap({ kind: 'done', lines: [], answer: `gets returned ${list(out)}`, title: `Final order: ${list2.map((x) => x.key).join(' → ')}`, text: 'Every operation was one map lookup plus a constant number of pointer changes: O(1). Sentinel head and tail nodes (not drawn) remove the "first or last node?" special cases.', calc: [`get results: ${list(out)}`] });
  return steps;
}

export function parseLru(values) {
  const cap = parseInt1(values.cap, { min: 1, max: 4, name: 'capacity' });
  if (cap.error) return cap;
  const parts = String(values.ops ?? '').split(/[;,\n]+/).map((p) => p.trim()).filter(Boolean);
  const ops = [];
  for (const p of parts) {
    let m = p.match(/^p(?:ut)?\s*\(?\s*(\d)\s*[ ,=:]\s*([A-Za-z])\s*\)?$/i);
    if (m) { ops.push(['put', Number(m[1]), m[2].toUpperCase()]); continue; }
    m = p.match(/^g(?:et)?\s*\(?\s*(\d)\s*\)?$/i);
    if (m) { ops.push(['get', Number(m[1])]); continue; }
    return { error: `"${p}" should look like p1=A (put) or g1 (get).` };
  }
  if (!ops.length || ops.length > 10) return { error: 'Use 1 to 10 operations.' };
  return { input: { cap: cap.v, ops } };
}

export const lruOpsText = (ops) => ops.map((o) => (o[0] === 'get' ? `g${o[1]}` : `p${o[1]}=${o[2]}`)).join(', ');

export function randomLru(rand = Math.random) {
  const g = rng(rand);
  const ops = Array.from({ length: g.int(6, 9) }, () => (g.bool(0.55) ? ['put', g.int(1, 5), 'ABCDEFG'[g.int(0, 6)]] : ['get', g.int(1, 5)]));
  return { cap: g.int(2, 3), ops };
}

// ---------------------------------------------------------------- matrices

const seq = (R, C) => Array.from({ length: R }, (_, r) => Array.from({ length: C }, (_, c) => r * C + c + 1));

export const MATRIX = {
  spiral: { label: 'Spiral order', input: { mode: 'spiral', m: seq(4, 4) } },
  thin: { label: 'Spiral: 3 × 1', input: { mode: 'spiral', m: [[1], [2], [3]] } },
  rotate: { label: 'Rotate 90°', input: { mode: 'rotate', m: seq(4, 4) } },
  zeroes: { label: 'Set matrix zeroes', input: { mode: 'zeroes', m: [[0, 1, 2, 0], [3, 4, 5, 2], [1, 3, 1, 5]] } },
};

export const matrixCode = (mode) => ({
  spiral: [['top', 'walk the top row, left → right;  top++'], ['right', 'walk the right column, down;  right--'], ['bottom', 'if (top <= bottom) walk the bottom row, right → left;  bottom--'], ['left', 'if (left <= right) walk the left column, up;  left++']],
  rotate: [['transpose', 'for (r) for (c = r + 1) swap(m[r][c], m[c][r]);   // transpose: rows become columns'], ['reverse', 'for (row) reverse(row);                        // mirror left ↔ right']],
  zeroes: [['flags', 'remember: does row 0 / column 0 contain a 0?'], ['mark', 'inner zero at (r, c) → m[r][0] = 0, m[0][c] = 0      // markers'], ['apply', 'inner cell: zero if its row or column marker is 0'], ['last', 'finally clear row 0 / column 0 if their flags say so']],
})[mode];

export function matrixAnswer({ mode, m }) {
  const R = m.length, C = m[0].length;
  if (mode === 'spiral') {
    const seen = m.map((r) => r.map(() => false)), out = [];
    const D = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    let r = 0, c = 0, d = 0;
    for (let k = 0; k < R * C; k++) {
      out.push(m[r][c]); seen[r][c] = true;
      let nr = r + D[d][0], nc = c + D[d][1];
      if (nr < 0 || nc < 0 || nr >= R || nc >= C || seen[nr][nc]) { d = (d + 1) % 4; nr = r + D[d][0]; nc = c + D[d][1]; }
      r = nr; c = nc;
    }
    return out;
  }
  if (mode === 'rotate') return Array.from({ length: C }, (_, r) => Array.from({ length: R }, (_, c) => m[R - 1 - c][r]));
  const rows = new Set(), cols = new Set();
  m.forEach((row, r) => row.forEach((v, c) => { if (v === 0) { rows.add(r); cols.add(c); } }));
  return m.map((row, r) => row.map((v, c) => (rows.has(r) || cols.has(c) ? 0 : v)));
}

export function matrix({ mode, m: m0 }) {
  const R = m0.length, C = m0[0].length;
  const steps = [];
  if (mode === 'spiral') {
    const m = m0;
    let top = 0, bottom = R - 1, left = 0, right = C - 1;
    const out = [];
    const order = [];                           // [r, c] in visiting order
    const snap = (x) => steps.push({ mode, cells: m.map((row) => row.map((v) => ({ v, id: v }))), bounds: { top, bottom, left, right }, order: order.map((p) => [...p]), out: [...out], ...x });
    snap({ kind: 'start', walk: [], lines: [], title: `Read a ${R} × ${C} matrix in spiral order`, text: 'Keep the unread part as four boundaries: top, bottom, left, right. Walk along one side, then move that boundary inwards. The two checks before walking back are the whole difficulty: when only one row or one column is left, it must not be read twice.', calc: [`top 0, bottom ${R - 1}, left 0, right ${C - 1}`] });
    const walk = (cells, kind, line, title, text) => {
      cells.forEach(([r, c]) => { out.push(m[r][c]); order.push([r, c]); });
      snap({ kind, walk: cells, lines: [line], title, text, calc: [`read ${list(cells.map(([r, c]) => m[r][c]))}`, `top ${top}, bottom ${bottom}, left ${left}, right ${right}`] });
    };
    while (top <= bottom && left <= right) {
      const t = []; for (let c = left; c <= right; c++) t.push([top, c]);
      top++;
      walk(t, 'top', 'top', `Top row, left to right`, `Read row ${top - 1} from column ${left} to ${right}, then move top down to ${top}: that row is done.`);
      const rt = []; for (let r = top; r <= bottom; r++) rt.push([r, right]);
      right--;
      if (rt.length) walk(rt, 'right', 'right', `Right column, downwards`, `Read column ${right + 1} from row ${top} to ${bottom}, then move right in to ${right}.`);
      if (top <= bottom) {
        const b = []; for (let c = right; c >= left; c--) b.push([bottom, c]);
        bottom--;
        if (b.length) walk(b, 'bottom', 'bottom', `Bottom row, right to left`, `top ≤ bottom, so a bottom row is still unread: read row ${bottom + 1} backwards, then move bottom up to ${bottom}.`);
      } else snap({ kind: 'skip', walk: [], lines: ['bottom'], title: 'No bottom row left', text: `top (${top}) is past bottom (${bottom}): the row that would be walked back along was already read. Without this check it would be read twice.`, calc: [`${top} > ${bottom}: skip`] });
      if (left <= right) {
        const l = []; for (let r = bottom; r >= top; r--) l.push([r, left]);
        left++;
        if (l.length) walk(l, 'left', 'left', `Left column, upwards`, `left ≤ right, so read column ${left - 1} from row ${bottom} up to ${top}, then move left in to ${left}.`);
      } else snap({ kind: 'skip', walk: [], lines: ['left'], title: 'No left column left', text: `left (${left}) is past right (${right}): that column was already read. The check stops it being read twice.`, calc: [`${left} > ${right}: skip`] });
    }
    snap({ kind: 'done', walk: [], lines: [], answer: list(out), title: `Spiral: ${list(out)}`, text: 'Each cell was read exactly once: O(rows × cols). The same boundary idea fills a matrix in spiral order; the "walk until blocked, then turn right" shape is the alternative.', calc: [list(out)] });
    return steps;
  }
  if (mode === 'rotate') {
    const n = R;
    let g = m0.map((row) => row.map((v) => ({ v, id: v })));
    const snap = (x) => steps.push({ mode, cells: g.map((row) => row.map((c) => ({ ...c }))), ...x });
    snap({ kind: 'start', moved: [], lines: [], title: `Rotate a ${n} × ${n} matrix 90° clockwise, in place`, text: 'Tracing four-way swaps is error-prone. Two simple passes do the same: transpose (swap across the diagonal, so rows become columns), then reverse each row (mirror left and right). Together they send (r, c) to (c, n − 1 − r).', calc: [`${n} × ${n}`] });
    for (let r = 0; r < n; r++) {
      const moved = [];
      for (let c = r + 1; c < n; c++) { [g[r][c], g[c][r]] = [g[c][r], g[r][c]]; moved.push(g[r][c].id, g[c][r].id); }
      if (!moved.length) continue;
      snap({ kind: 'transpose', moved, diag: r, lines: ['transpose'], title: `Transpose: swap row ${r} with column ${r}`, text: `Every cell right of the diagonal in row ${r} trades places with its mirror below the diagonal. Starting each row at c = r + 1 matters: starting at 0 would swap every pair twice and undo it.`, calc: [`${plural(moved.length / 2, 'swap')}`] });
    }
    for (let r = 0; r < n; r++) {
      g[r] = [...g[r]].reverse();
      snap({ kind: 'reverse', moved: g[r].map((c) => c.id), row: r, lines: ['reverse'], title: `Reverse row ${r}`, text: `Mirror row ${r} left to right.${r === n - 1 ? ' That was the last row: the matrix is rotated.' : ''}`, calc: [`row ${r}: ${list(g[r].map((c) => c.v))}`] });
    }
    snap({ kind: 'done', moved: [], lines: [], answer: g.map((row) => list(row.map((c) => c.v))).join(' '), title: 'Rotated 90° clockwise', text: 'O(n²) time, O(1) extra space. Anticlockwise: transpose, then reverse each column instead. 180°: reverse every row, then the order of the rows.', calc: g.map((row) => list(row.map((c) => c.v))) });
    return steps;
  }
  const m = m0.map((row) => [...row]);
  let firstRow = false, firstCol = false;
  const snap = (x) => steps.push({ mode, cells: m.map((row) => row.map((v, c) => ({ v, id: `${c}` }))), firstRow, firstCol, ...x });
  snap({ kind: 'start', hit: [], lines: [], title: 'Zero the row and column of every 0, in O(1) extra space', text: 'Instead of two boolean arrays for "this row must be cleared" and "this column must be cleared", use row 0 and column 0 of the matrix itself as those arrays. Their own zeros are remembered first in two flags.', calc: [`${R} × ${C}`] });
  firstRow = m[0].some((v) => v === 0);
  firstCol = m.some((row) => row[0] === 0);
  snap({ kind: 'flags', hit: [...m[0].map((v, c) => [0, c]), ...m.map((_, r) => [r, 0])], lines: ['flags'], title: `Flags: row 0 ${firstRow ? 'has' : 'has no'} zero, column 0 ${firstCol ? 'has' : 'has no'} zero`, text: 'Row 0 and column 0 are about to be overwritten with markers, so first record whether they need clearing themselves.', calc: [`firstRow = ${firstRow}`, `firstCol = ${firstCol}`] });
  const marks = [];
  for (let r = 1; r < R; r++) for (let c = 1; c < C; c++) if (m[r][c] === 0) { m[r][0] = 0; m[0][c] = 0; marks.push([r, c]); }
  snap({ kind: 'mark', hit: marks.flatMap(([r, c]) => [[r, 0], [0, c]]), src: marks, lines: ['mark'], title: marks.length ? `Mark ${plural(marks.length, 'inner zero')} in row 0 and column 0` : 'No inner zeros to mark', text: marks.length ? `For each inner 0 at (r, c), write 0 at the start of its row (m[r][0]) and the top of its column (m[0][c]). Those cells now mean "clear this row / column".` : 'Only row 0 or column 0 contained zeros; the flags cover those.', calc: marks.map(([r, c]) => `(${r},${c}) → m[${r}][0], m[0][${c}]`).concat(marks.length ? [] : ['nothing to mark']) });
  const cleared = [];
  for (let r = 1; r < R; r++) for (let c = 1; c < C; c++) if ((m[r][0] === 0 || m[0][c] === 0) && m[r][c] !== 0) { m[r][c] = 0; cleared.push([r, c]); }
  snap({ kind: 'apply', hit: cleared, lines: ['apply'], title: `Clear ${plural(cleared.length, 'inner cell')} using the markers`, text: 'Every inner cell whose row marker or column marker is 0 becomes 0. The markers are only read here, which is why row 0 and column 0 must not be cleared yet.', calc: [`cleared ${cleared.length}`] });
  const last = [];
  if (firstRow) for (let c = 0; c < C; c++) if (m[0][c] !== 0) { m[0][c] = 0; last.push([0, c]); }
  if (firstCol) for (let r = 0; r < R; r++) if (m[r][0] !== 0) { m[r][0] = 0; last.push([r, 0]); }
  snap({ kind: 'last', hit: last, lines: ['last'], title: 'Finally, row 0 and column 0 from the flags', text: `${firstRow ? 'Row 0 had a zero, so clear all of it. ' : ''}${firstCol ? 'Column 0 had a zero, so clear all of it. ' : ''}${!firstRow && !firstCol ? 'Neither flag is set, so row 0 and column 0 keep their values (apart from markers they hold). ' : ''}Doing this last keeps the markers intact while they're needed.`, calc: [`firstRow ${firstRow}, firstCol ${firstCol}`] });
  snap({ kind: 'done', hit: [], lines: [], answer: m.map((row) => list(row)).join(' '), title: 'Done', text: 'O(rows × cols) time, O(1) extra space: the matrix held its own notes.', calc: m.map((row) => list(row)) });
  return steps;
}

export function parseMatrix(values, input) {
  const rows = String(values.m ?? '').split(/[;\n|]/).map((r) => r.trim()).filter(Boolean);
  const m = [];
  for (const r of rows) { const p = parseInts(r, { min: -9, max: 99, minLen: 1, maxLen: 6, name: 'each row' }); if (p.error) return p; m.push(p.arr); }
  if (!m.length || m.length > 6 || m.some((r) => r.length !== m[0].length)) return { error: 'Up to 6 rows, all the same length, separated by ;' };
  if (input.mode === 'rotate' && m.length !== m[0].length) return { error: 'Rotation in place needs a square matrix.' };
  return { input: { mode: input.mode, m } };
}

export function randomMatrix(input, rand = Math.random) {
  const g = rng(rand);
  if (input.mode === 'rotate') { const n = g.int(3, 4); return { mode: 'rotate', m: seq(n, n) }; }
  if (input.mode === 'spiral') return { mode: 'spiral', m: seq(g.int(1, 5), g.int(1, 5)) };
  const C = g.int(3, 5);
  return { mode: 'zeroes', m: Array.from({ length: g.int(3, 4) }, () => Array.from({ length: C }, () => (g.bool(0.18) ? 0 : g.int(1, 9)))) };
}

// ---------------------------------------------------------------- math

export const MATH = {
  sieve: { label: 'Sieve up to 30', input: { mode: 'sieve', n: 30 } },
  gcd: { label: 'gcd(48, 18)', input: { mode: 'gcd', a: 48, b: 18 } },
  pow: { label: '3^13 by squaring', input: { mode: 'pow', x: 3, n: 13 } },
};

export const mathCode = (mode) => ({
  sieve: [['outer', 'for (p = 2; p * p <= n; p++) if (!composite[p])'], ['cross', '  for (m = p * p; m <= n; m += p) composite[m] = true;   // smaller multiples are done already'], ['rest', 'everything never crossed out is prime']],
  gcd: [['loop', 'while (b != 0) { t = a % b;  a = b;  b = t; }'], ['end', 'return a;']],
  pow: [['bit', 'if (exp & 1) result *= base;        // this bit is 1: use the current power'], ['square', 'base *= base;  exp >>= 1;           // next bit, next power of two']],
})[mode];

export function mathAnswer({ mode, n, a, b, x }) {
  if (mode === 'sieve') { const out = []; for (let k = 2; k <= n; k++) { let p = true; for (let d = 2; d * d <= k; d++) if (k % d === 0) p = false; if (p) out.push(k); } return out; }
  if (mode === 'gcd') { let g = 1; for (let d = 1; d <= Math.min(a, b); d++) if (a % d === 0 && b % d === 0) g = d; return g; }
  return x ** n;
}

export function math(input) {
  const { mode } = input;
  const steps = [];
  if (mode === 'sieve') {
    const { n } = input;
    const crossed = {};                          // number → the prime that crossed it out
    const snap = (x) => steps.push({ mode, n, crossed: { ...crossed }, ...x });
    snap({ kind: 'start', p: null, fresh: [], lines: [], title: `All primes up to ${n}`, text: 'Start with every number from 2 as "maybe prime". Walk up: each number still unmarked is prime, and it crosses out its own multiples. A prime only has to start at its square, because smaller multiples have a smaller factor that already crossed them out.', calc: [`2…${n}`] });
    for (let p = 2; p * p <= n; p++) {
      if (crossed[p]) continue;
      const fresh = [];
      for (let m = p * p; m <= n; m += p) if (!crossed[m]) { crossed[m] = p; fresh.push(m); }
      snap({ kind: 'cross', p, fresh, lines: ['outer', 'cross'], title: `${p} is prime: cross out ${p * p}, ${p * p + p}, …`, text: `${p} was never crossed out, so it's prime. Cross out its multiples from ${p}² = ${p * p} (${fresh.length ? `${plural(fresh.length, 'new number')}` : 'all already crossed'}). ${p * p > p * 2 ? `Multiples below ${p * p}, like ${p * 2}, already had a smaller factor.` : ''}`, calc: [`p = ${p}`, `crossed: ${list(fresh)}`] });
    }
    const primes = [];
    for (let k = 2; k <= n; k++) if (!crossed[k]) primes.push(k);
    snap({ kind: 'done', p: null, fresh: [], primes, lines: ['rest'], answer: list(primes), title: `${plural(primes.length, 'prime')} up to ${n}`, text: `The outer loop could stop at √${n} ≈ ${Math.floor(Math.sqrt(n))}: any composite up to ${n} has a factor no bigger than that, so it is already crossed out. O(n log log n), effectively linear.`, calc: [list(primes)] });
    return steps;
  }
  if (mode === 'gcd') {
    let { a, b } = input;
    const rows = [];
    const snap = (x) => steps.push({ mode, rows: rows.map((r) => ({ ...r })), ...x });
    snap({ kind: 'start', lines: [], title: `gcd(${a}, ${b})`, text: 'Any number that divides both a and b also divides a mod b (what\'s left after taking out as many b\'s as fit). So gcd(a, b) = gcd(b, a mod b), and the numbers shrink fast. Stop when the remainder is 0.', calc: [`a = ${a}, b = ${b}`] });
    while (b) {
      const q = Math.floor(a / b), t = a % b;
      rows.push({ a, b, q, r: t });
      snap({ kind: 'step', lines: ['loop'], title: `${a} = ${q} × ${b} + ${t}`, text: `${b} fits into ${a} ${q} time${q === 1 ? '' : 's'}, leaving ${t}. ${t ? `Whatever divides ${a} and ${b} also divides ${t}, so continue with gcd(${b}, ${t}).` : `The remainder is 0, so ${b} divides ${a}: ${b} is the gcd.`}`, calc: [`${a} mod ${b} = ${t}`] });
      a = b; b = t;
    }
    snap({ kind: 'done', lines: ['end'], answer: `${a}`, title: `gcd = ${a}`, text: `O(log min(a, b)) steps. lcm(a, b) = a / gcd · b (dividing first avoids overflow) = ${input.a / a * input.b}.`, calc: [`gcd = ${a}`, `lcm = ${input.a / a * input.b}`] });
    return steps;
  }
  const { x, n } = input;
  let base = x, e = n, result = 1, k = 0;
  const bitsOf = n.toString(2).split('').reverse().map(Number);
  const rows = [];
  const snap = (y) => steps.push({ mode, x, n, bitsOf, rows: rows.map((r) => ({ ...r })), result, ...y });
  snap({ kind: 'start', bit: null, lines: [], title: `${x}^${n} with ${bitsOf.length} squarings, not ${n - 1} multiplications`, text: `${n} in binary is ${n.toString(2)}, so ${x}^${n} is a product of ${x} to powers of two: ${bitsOf.map((b2, i) => (b2 ? `${x}^${2 ** i}` : null)).filter(Boolean).join(' · ')}. Square the base at each step to get the next power of two, and multiply it in when that bit is 1.`, calc: [`${n} = ${n.toString(2)}₂`] });
  while (e > 0) {
    const bit = e & 1;
    const before = result;
    if (bit) result *= base;
    rows.push({ k, power: 2 ** k, base, bit, result });
    snap({ kind: bit ? 'use' : 'skip', bit: k, lines: ['bit', 'square'], title: bit ? `Bit ${k} is 1: result × ${x}^${2 ** k} = ${result}` : `Bit ${k} is 0: skip ${x}^${2 ** k}`, text: `The current base is ${x}^${2 ** k} = ${base}. ${bit ? `This bit of ${n} is 1, so multiply it in: ${before} × ${base} = ${result}.` : `This bit is 0, so ${x}^${2 ** k} isn't part of the product.`} Then square the base (${base}² = ${base * base}) for the next bit.`, calc: [`base = ${base}`, `result = ${result}`] });
    base *= base; e >>= 1; k++;
  }
  snap({ kind: 'done', bit: null, lines: [], answer: `${result}`, title: `${x}^${n} = ${result}`, text: `${bitsOf.length} rounds instead of ${n - 1} multiplications: O(log n). In interviews the same loop runs mod 10⁹ + 7 (result * base % m) for exponents up to 10¹⁸.`, calc: [`${result}`] });
  return steps;
}

export function parseMath(values, input) {
  if (input.mode === 'sieve') { const r = parseInt1(values.n, { min: 10, max: 60, name: 'n' }); return r.error ? r : { input: { mode: 'sieve', n: r.v } }; }
  if (input.mode === 'gcd') {
    const a = parseInt1(values.a, { min: 1, max: 999, name: 'a' }); if (a.error) return a;
    const b = parseInt1(values.b, { min: 1, max: 999, name: 'b' }); if (b.error) return b;
    return { input: { mode: 'gcd', a: a.v, b: b.v } };
  }
  const x = parseInt1(values.x, { min: 2, max: 5, name: 'x' }); if (x.error) return x;
  const n = parseInt1(values.n, { min: 1, max: 20, name: 'n' }); if (n.error) return n;
  return { input: { mode: 'pow', x: x.v, n: n.v } };
}

export function randomMath(input, rand = Math.random) {
  const g = rng(rand);
  if (input.mode === 'sieve') return { mode: 'sieve', n: g.int(20, 60) };
  if (input.mode === 'gcd') { const d = g.int(2, 12); return { mode: 'gcd', a: d * g.int(2, 30), b: d * g.int(2, 30) }; }
  return { mode: 'pow', x: g.int(2, 3), n: g.int(5, 20) };
}

// ---------------------------------------------------------------- KMP

export const KMP = {
  table: { label: 'Failure table', input: { mode: 'table', p: 'aabaaab' } },
  search: { label: 'KMP search', input: { mode: 'search', p: 'aabaaab', t: 'aabaaaabaaab' } },
};

export const kmpCode = (mode) => (mode === 'table'
  ? [['fall', 'while (len > 0 && p[i] != p[len]) len = lps[len - 1];   // fall back to a shorter border'], ['grow', 'if (p[i] == p[len]) len++;'], ['set', 'lps[i] = len;']]
  : [['fall', 'while (j > 0 && t[i] != p[j]) j = lps[j - 1];   // keep the part that still matches'], ['grow', 'if (t[i] == p[j]) j++;'], ['found', 'if (j == m) { record i − m + 1;  j = lps[j - 1]; }   // matches may overlap']]);

export function lpsOf(p) {
  const lps = Array(p.length).fill(0);
  for (let i = 1, len = 0; i < p.length; i++) {
    while (len > 0 && p[i] !== p[len]) len = lps[len - 1];
    if (p[i] === p[len]) len++;
    lps[i] = len;
  }
  return lps;
}

export function kmpAnswer({ mode, p, t }) {
  if (mode === 'table') return p.split('').map((_, i) => { for (let L = i; L > 0; L--) if (p.slice(0, L) === p.slice(i + 1 - L, i + 1)) return L; return 0; });
  const out = [];
  for (let i = 0; i + p.length <= t.length; i++) if (t.slice(i, i + p.length) === p) out.push(i);
  return out;
}

export function kmp({ mode, p, t }) {
  const steps = [];
  if (mode === 'table') {
    const lps = Array(p.length).fill(null);
    lps[0] = 0;
    const snap = (x) => steps.push({ mode, p, lps: [...lps], ...x });
    snap({ kind: 'start', i: 0, len: 0, lines: [], title: `The failure table of "${p}"`, text: 'lps[i] = the length of the longest proper prefix of p[0..i] that is also a suffix of it: the part of a match you can keep after a mismatch. lps[0] is always 0. len is the border we\'re trying to extend.', calc: ['lps[0] = 0'] });
    let len = 0;
    for (let i = 1; i < p.length; i++) {
      const falls = [];
      while (len > 0 && p[i] !== p[len]) { falls.push(len); len = lps[len - 1]; }
      const match = p[i] === p[len];
      if (match) len++;
      lps[i] = len;
      snap({ kind: match ? 'grow' : falls.length ? 'fall' : 'zero', i, len, falls, lines: falls.length ? ['fall', 'grow', 'set'] : ['grow', 'set'], title: `lps[${i}] = ${len}${len ? ` ("${p.slice(0, len)}")` : ''}`, text: `${falls.length ? `p[${i}] = '${p[i]}' can't extend the border of length ${falls[0]}, so fall back to the border of that border: ${falls.map((f) => `lps[${f - 1}] = ${lps[f - 1]}`).join(', then ')}. ` : ''}${match ? `p[${i}] = '${p[i]}' equals p[${len - 1}], so the border grows to ${len}: "${p.slice(0, len)}" is both a prefix and a suffix of "${p.slice(0, i + 1)}".` : `'${p[i]}' doesn't match p[0], so no border: 0.`}`, calc: [`lps[${i}] = ${len}`] });
    }
    snap({ kind: 'done', i: null, len: null, lines: [], answer: list(lps), title: `lps = ${list(lps)}`, text: 'len rises by at most one per character and every fallback lowers it, so building the table is O(m).', calc: [list(lps)] });
    return steps;
  }
  const lps = lpsOf(p);
  const found = [];
  const snap = (x) => steps.push({ mode, p, t, lps, found: [...found], ...x });
  snap({ kind: 'start', i: null, j: 0, lines: [], title: `Find "${p}" in "${t}"`, text: `j counts how many pattern characters match so far. On a mismatch, instead of starting over one place later, j falls back to lps[j − 1]: that much of the pattern is still known to match. The text index never moves backwards. lps = ${list(lps)}.`, calc: [`lps = ${list(lps)}`] });
  let j = 0;
  for (let i = 0; i < t.length; i++) {
    const falls = [];
    while (j > 0 && t[i] !== p[j]) { falls.push(j); j = lps[j - 1]; }
    const landed = j;
    const match = t[i] === p[j];
    if (match) j++;
    const hit = j === p.length;
    if (hit) found.push(i - j + 1);
    snap({ kind: hit ? 'found' : falls.length ? 'fall' : match ? 'match' : 'miss', i, j, falls, lines: hit ? ['grow', 'found'] : falls.length ? ['fall', 'grow'] : ['grow'], title: hit ? `Match at ${i - j + 1}!` : falls.length ? `Mismatch: j falls ${[...falls, landed].join(' → ')}${match ? `, then '${t[i]}' matches (j = ${j})` : ''}` : match ? `t[${i}] = '${t[i]}' matches: j = ${j}` : `t[${i}] = '${t[i]}' ≠ p[0]`, text: hit ? `All ${p.length} characters match, so "${p}" starts at ${i - j + 1}. Keep going from j = lps[${j - 1}] = ${lps[j - 1]} in case matches overlap.` : falls.length ? `t[${i}] = '${t[i]}' doesn't match p[${falls[0]}]. The last ${falls[0]} text characters equal the pattern's first ${falls[0]}, so instead of starting over, keep the longest part that is also a prefix: ${falls.map((f2, k) => `j = lps[${f2 - 1}] = ${lps[f2 - 1]}${k < falls.length - 1 ? ` ('${t[i]}' still ≠ p[${lps[f2 - 1]}])` : ''}`).join(', then ')}. The pattern slides right to line that part up. ${match ? `Now '${t[i]}' = p[${j - 1}]: j = ${j}.` : `Nothing matches: j = 0.`}` : match ? `t[${i}] equals p[${j - 1}], so the match grows to ${plural(j, 'character')}.` : `t[${i}] = '${t[i]}' doesn't match p[0], and there is nothing to keep: j stays 0.`, calc: [`i = ${i}, j = ${j}`] });
    if (hit) j = lps[j - 1];
  }
  snap({ kind: 'done', i: null, j, lines: [], answer: found.length ? `found at ${list(found)}` : 'not found', title: found.length ? `Found at ${list(found)}` : 'Not found', text: 'O(n + m): the text pointer only moves forward, and fallbacks can\'t outnumber the increases of j.', calc: [`matches ${list(found)}`] });
  return steps;
}

export const kmpAlign = (step) => (step.i === null || step.i === undefined ? null : step.i - step.j + 1);

export function parseKmp(values, input) {
  const p = String(values.p ?? '').trim();
  if (!/^[a-z]{1,8}$/.test(p)) return { error: 'The pattern: 1 to 8 lower-case letters.' };
  if (input.mode === 'table') return { input: { mode: 'table', p } };
  const t = String(values.t ?? '').trim();
  if (!/^[a-z]{1,16}$/.test(t)) return { error: 'The text: 1 to 16 lower-case letters.' };
  return { input: { mode: 'search', p, t } };
}

export function randomKmp(input, rand = Math.random) {
  const g = rng(rand);
  const word = (n) => Array.from({ length: n }, () => g.pick(['a', 'a', 'b'])).join('');
  if (input.mode === 'table') return { mode: 'table', p: word(g.int(5, 8)) };
  const p = word(g.int(3, 4));
  return { mode: 'search', p, t: (word(g.int(2, 5)) + p + word(g.int(2, 5))).slice(0, 16) };
}

// ---------------------------------------------------------------- Fenwick tree and segment tree

export const FENWICK = {
  query: { label: 'prefix(7)', input: { mode: 'query', a: [5, 2, 9, -1, 6, 3, 4, 7], i: 7 } },
  update: { label: 'add 10 at 3', input: { mode: 'update', a: [5, 2, 9, -1, 6, 3, 4, 7], i: 3, delta: 10 } },
};

export const fenwickCode = (mode) => (mode === 'query'
  ? [['loop', 'for (; i > 0; i -= i & -i)        // strip the lowest set bit'], ['add', '  s += tree[i];']]
  : [['loop', 'for (; i <= n; i += i & -i)       // climb to every box that covers i'], ['add', '  tree[i] += delta;']]);

export const lowbit = (i) => i & -i;

export function fenwickBuild(a) {
  const tree = Array(a.length + 1).fill(0);
  a.forEach((v, k) => { for (let i = k + 1; i <= a.length; i += lowbit(i)) tree[i] += v; });
  return tree;
}

export function fenwick({ mode, a, i: i0, delta }) {
  const n = a.length;
  const tree = fenwickBuild(a);
  const steps = [];
  const visited = [];
  let s = 0;
  const snap = (x) => steps.push({ mode, a: [...a], tree: [...tree], visited: [...visited], sum: s, ...x });
  snap({ kind: 'start', cur: null, lines: [], title: mode === 'query' ? `prefix(${i0}): the sum of positions 1…${i0}` : `add ${delta} at position ${i0}`, text: `Box i stores the sum of a range that ends at i and is as long as i's lowest set bit (i & −i): box 6 = 110₂ covers 2 positions (5–6), box 8 = 1000₂ covers 8 (1–8). ${mode === 'query' ? 'A prefix sum walks down, stripping the lowest bit each time, and adds up the boxes it lands on.' : 'An update climbs up, adding the lowest bit each time, and fixes every box whose range covers the position.'}`, calc: [`a = ${list(a)}`] });
  if (mode === 'query') {
    for (let i = i0; i > 0; i -= lowbit(i)) {
      s += tree[i];
      visited.push(i);
      const lo = i - lowbit(i) + 1;
      snap({ kind: 'add', cur: i, lines: ['loop', 'add'], title: `Box ${i} covers ${lo === i ? i : `${lo}–${i}`}: sum ${s}`, text: `Box ${i} (${i.toString(2)}₂) holds a[${lo}…${i}] = ${tree[i]}. Add it. Then strip the lowest bit: ${i} − ${lowbit(i)} = ${i - lowbit(i)}${i - lowbit(i) ? ', the box just before this range' : ': done'}.`, calc: [`${i} = ${i.toString(2)}₂, lowbit ${lowbit(i)}`, `sum = ${s}`] });
    }
    const brute = a.slice(0, i0).reduce((x, y) => x + y, 0);
    snap({ kind: 'done', cur: null, lines: [], answer: `prefix(${i0}) = ${s}`, title: `prefix(${i0}) = ${s} from ${plural(visited.length, 'box')}`, text: `The boxes visited (${visited.join(', ')}) cover 1…${i0} exactly once, with no overlap: their sizes are the 1-bits of ${i0} (${i0.toString(2)}₂). At most log₂ n boxes. Check: ${list(a.slice(0, i0))} adds up to ${brute}.`, calc: [`sum = ${s}`] });
    return steps;
  }
  a[i0 - 1] += delta;
  for (let i = i0; i <= n; i += lowbit(i)) {
    tree[i] += delta;
    visited.push(i);
    const lo = i - lowbit(i) + 1;
    snap({ kind: 'add', cur: i, lines: ['loop', 'add'], title: `Box ${i} covers ${lo === i ? i : `${lo}–${i}`}: +${delta} → ${tree[i]}`, text: `Position ${i0} lies inside box ${i}'s range (${lo}–${i}), so the box gets +${delta}. Then add the lowest bit: ${i} + ${lowbit(i)} = ${i + lowbit(i)}${i + lowbit(i) <= n ? ', the next box whose range contains this one' : `, past ${n}: done`}.`, calc: [`${i} = ${i.toString(2)}₂, lowbit ${lowbit(i)}`, `tree[${i}] = ${tree[i]}`] });
  }
  snap({ kind: 'done', cur: null, lines: [], answer: `updated boxes ${list(visited)}`, title: `Updated ${plural(visited.length, 'box')}: ${visited.join(', ')}`, text: `Only boxes whose range contains position ${i0} change, and the climb finds exactly those in O(log n). To set a value instead of adding, add the difference from the old value.`, calc: [`boxes ${list(visited)}`] });
  return steps;
}

export function parseFenwick(values, input) {
  const r = parseInts(values.a, { min: -20, max: 20, minLen: 2, maxLen: 8, name: 'a' });
  if (r.error) return r;
  const i = parseInt1(values.i, { min: 1, max: r.arr.length, name: 'position' });
  if (i.error) return i;
  if (input.mode === 'query') return { input: { mode: 'query', a: r.arr, i: i.v } };
  const d = parseInt1(values.delta, { min: -20, max: 20, name: 'delta' });
  return d.error ? d : { input: { mode: 'update', a: r.arr, i: i.v, delta: d.v } };
}

export function randomFenwick(input, rand = Math.random) {
  const g = rng(rand);
  const a = Array.from({ length: 8 }, () => g.int(-5, 9));
  return input.mode === 'query' ? { mode: 'query', a, i: g.int(1, 8) } : { mode: 'update', a, i: g.int(1, 8), delta: g.int(1, 9) };
}

export const SEGTREE = {
  query: { label: 'sum(2, 5)', input: { a: [5, 2, 9, -1, 6, 3, 4, 7], l: 2, r: 5 } },
  wide: { label: 'sum(0, 6)', input: { a: [5, 2, 9, -1, 6, 3, 4, 7], l: 0, r: 6 } },
};

export const segCode = [
  ['none', 'if (r < lo || hi < l) return 0;            // no overlap'],
  ['full', 'if (l <= lo && hi <= r) return sum[node];  // fully inside: use the stored answer'],
  ['split', 'return sum(left half) + sum(right half);   // partial: ask both children'],
];

export function segNodes(a) {
  const nodes = {};
  const build = (k, lo, hi, depth) => {
    if (lo === hi) { nodes[k] = { k, lo, hi, sum: a[lo], depth }; return a[lo]; }
    const mid = (lo + hi) >> 1;
    const s = build(2 * k, lo, mid, depth + 1) + build(2 * k + 1, mid + 1, hi, depth + 1);
    nodes[k] = { k, lo, hi, sum: s, depth };
    return s;
  };
  build(1, 0, a.length - 1, 0);
  return nodes;
}

export function segTree({ a, l, r }) {
  const nodes = segNodes(a);
  const status = {};               // k → none | full | partial
  const steps = [];
  let total = 0;
  const snap = (x) => steps.push({ a, l, r, nodes, status: { ...status }, total, ...x });
  snap({ kind: 'start', cur: null, lines: [], title: `sum(${l}, ${r}) with a segment tree`, text: 'Every node stores the sum of its range; the root covers everything and each node\'s children cover its two halves. A query asks the root and handles three cases: no overlap (contributes 0), full overlap (use the stored sum, don\'t go deeper), or partial overlap (ask both children).', calc: [`a = ${list(a)}`] });
  const go = (k) => {
    const n = nodes[k];
    if (r < n.lo || n.hi < l) { status[k] = 'none'; snap({ kind: 'none', cur: k, lines: ['none'], title: `[${n.lo}, ${n.hi}]: no overlap → 0`, text: `This node's range is completely outside [${l}, ${r}], so it contributes nothing, and its children aren't visited.`, calc: ['return 0'] }); return 0; }
    if (l <= n.lo && n.hi <= r) { status[k] = 'full'; total += n.sum; snap({ kind: 'full', cur: k, lines: ['full'], title: `[${n.lo}, ${n.hi}]: fully inside → ${n.sum}`, text: `The whole range [${n.lo}, ${n.hi}] is inside the query, so its stored sum ${n.sum} is used as it is, without looking at the ${n.hi - n.lo + 1} values below it.`, calc: [`+${n.sum}`, `running total ${total}`] }); return n.sum; }
    status[k] = 'partial';
    snap({ kind: 'partial', cur: k, lines: ['split'], title: `[${n.lo}, ${n.hi}]: partly inside → ask both halves`, text: `Part of [${n.lo}, ${n.hi}] is in the query and part isn't, so the stored sum can't be used. Split: [${nodes[2 * k].lo}, ${nodes[2 * k].hi}] and [${nodes[2 * k + 1].lo}, ${nodes[2 * k + 1].hi}].`, calc: ['partial overlap'] });
    return go(2 * k) + go(2 * k + 1);
  };
  const s = go(1);
  snap({ kind: 'done', cur: null, lines: [], answer: `sum = ${s}`, title: `sum(${l}, ${r}) = ${s}`, text: `Only ${Object.keys(status).length} of ${Object.keys(nodes).length} nodes were visited: at most four per level, so O(log n). An update changes one leaf and recomputes its ancestors, also O(log n).`, calc: [`sum = ${s}`] });
  return steps;
}

export function parseSeg(values) {
  const r = parseInts(values.a, { min: -20, max: 20, minLen: 2, maxLen: 8, name: 'a' });
  if (r.error) return r;
  const l = parseInt1(values.l, { min: 0, max: r.arr.length - 1, name: 'l' }); if (l.error) return l;
  const rr = parseInt1(values.r, { min: l.v, max: r.arr.length - 1, name: 'r' }); if (rr.error) return rr;
  return { input: { a: r.arr, l: l.v, r: rr.v } };
}

export function randomSeg(rand = Math.random) {
  const g = rng(rand);
  const a = Array.from({ length: 8 }, () => g.int(-5, 9));
  const l = g.int(0, 6);
  return { a, l, r: g.int(l, 7) };
}
