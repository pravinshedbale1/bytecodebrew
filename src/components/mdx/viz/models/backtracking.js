/**
 * Backtracking step-throughs (models for <BacktrackViz> and <QueensViz>). Pure, so
 * scripts/viz-check.mjs can test them.
 */
import { list, parseInt1, parseInts, plural, rng } from './util.js';

export const BACKTRACK = {
  subsets: { label: 'Subsets', input: { mode: 'subsets', nums: [1, 2, 3] } },
  perms: { label: 'Permutations', input: { mode: 'perms', nums: [1, 2, 3] } },
  combsum: { label: 'Combination sum', input: { mode: 'combsum', nums: [2, 3, 6, 7], target: 7 } },
};

export const backtrackCode = (mode) => [
  ['record', {
    subsets: 'out.add(copy of path);                       // every node is a subset',
    perms: 'if (path.size() == n) { out.add(copy of path); return; }',
    combsum: 'if (remaining == 0) { out.add(copy of path); return; }',
  }[mode]],
  ['loop', {
    subsets: 'for (int i = start; i < n; i++) {           // only look forward',
    perms: 'for (int i = 0; i < n; i++) { if (used[i]) continue;',
    combsum: 'for (int i = start; i < n; i++) { if (c[i] > remaining) break;   // sorted: prune',
  }[mode]],
  ['choose', '  path.add(choice);                         // 1. choose'],
  ['explore', mode === 'subsets' ? '  backtrack(i + 1, path);                   // 2. explore' : mode === 'perms' ? '  backtrack(path);                          // 2. explore' : '  backtrack(i, remaining - c[i], path);     // 2. explore (i: reuse allowed)'],
  ['unchoose', '  path.remove(last); }                      // 3. un-choose'],
];

/** The full decision tree first (so every node has a fixed place), then the steps that reveal it. */
export function backtrack(input) {
  const { mode } = input;
  const nums = mode === 'combsum' ? [...input.nums].sort((a, b) => a - b) : input.nums;
  const nodes = [];         // { id, parent, label, path, depth, kind: node | pruned, record }
  const events = [];
  const add = (parent, label, path, kind = 'node') => { const id = nodes.length; nodes.push({ id, parent, label, path: [...path], depth: parent === null ? 0 : nodes[parent].depth + 1, kind }); return id; };
  const out = [];
  const root = add(null, '[]', []);
  const path = [];
  const used = nums.map(() => false);
  const go = (id, start, remaining) => {
    if (mode === 'subsets') { out.push([...path]); nodes[id].record = true; events.push({ t: 'record', id }); }
    if (mode === 'perms' && path.length === nums.length) { out.push([...path]); nodes[id].record = true; events.push({ t: 'record', id }); return; }
    if (mode === 'combsum' && remaining === 0) { out.push([...path]); nodes[id].record = true; events.push({ t: 'record', id }); return; }
    for (let i = mode === 'perms' ? 0 : start; i < nums.length; i++) {
      if (mode === 'perms' && used[i]) continue;
      if (mode === 'combsum' && nums[i] > remaining) {
        const pid = add(id, String(nums[i]), [...path, nums[i]], 'pruned');
        events.push({ t: 'prune', id: pid, from: id, value: nums[i], remaining });
        break;
      }
      path.push(nums[i]);
      if (mode === 'perms') used[i] = true;
      const child = add(id, String(nums[i]), path);
      events.push({ t: 'choose', id: child, from: id, value: nums[i], i });
      go(child, mode === 'subsets' ? i + 1 : i, mode === 'combsum' ? remaining - nums[i] : 0);
      path.pop();
      if (mode === 'perms') used[i] = false;
      events.push({ t: 'back', id: child, to: id, value: nums[i] });
    }
  };
  go(root, 0, input.target ?? 0);

  // turn events into steps: consecutive un-chooses become one step
  const steps = [];
  const shown = new Set([root]);
  const recorded = new Set();
  const found = [];
  let cur = root;
  const pathOf = (id) => nodes[id].path;
  const snap = (x) => steps.push({ mode, nums, target: input.target, nodes, shown: [...shown], recorded: [...recorded], found: found.map((p) => [...p]), cur, ...x });
  snap({
    kind: 'start', lines: [],
    title: {
      subsets: `Every subset of ${list(nums)}`,
      perms: `Every ordering of ${list(nums)}`,
      combsum: `Combinations of ${list(nums)} that add up to ${input.target}`,
    }[mode],
    text: {
      subsets: 'Backtracking walks a decision tree depth-first, building one shared path. At each node, try adding each later element (never an earlier one, so [2, 1] is never made after [1, 2]). Every node of this tree is a subset.',
      perms: 'Order matters, so at every level any unused element can come next. A path is complete when it uses every element.',
      combsum: `Numbers may be reused. Each level picks the next number (the same one or a later one), and the amount still needed shrinks. Because the numbers are sorted, as soon as one is too big, every later one is too: stop the loop (prune).`,
    }[mode],
    calc: [`path: []`],
  });
  let pendingBack = [];
  const flushBack = () => {
    if (!pendingBack.length) return;
    const removed = pendingBack.map((e) => e.value);
    cur = pendingBack.at(-1).to;
    snap({
      kind: 'back', lines: ['unchoose'], backFrom: pendingBack.map((e) => e.id),
      title: `Un-choose ${removed.join(', then ')}: back to ${list(pathOf(cur))}`,
      text: `${removed.length > 1 ? `The calls below have tried everything, so they return one after another, each removing its own choice` : `That branch is finished, so remove its choice`}: the path is back to ${list(pathOf(cur))}. The same list is reused for the next branch, which is why un-choosing matters: forget it and the next path starts with leftovers.`,
      calc: [`path: ${list(pathOf(cur))}`],
    });
    pendingBack = [];
  };
  for (let k = 0; k < events.length; k++) {
    const e = events[k];
    if (e.t === 'back') { pendingBack.push(e); continue; }
    if (e.t === 'record' && e.id === root) {
      recorded.add(root); found.push([]);
      snap({ kind: 'record', lines: ['record'], title: 'Record [] (the empty set)', text: 'The root is the empty subset, and every node of this tree is a subset, so it is recorded straight away.', calc: ['out: [[]]'] });
      continue;
    }
    flushBack();
    if (e.t === 'prune') {
      shown.add(e.id);
      snap({
        kind: 'prune', lines: ['loop'], pruned: e.id,
        title: `${e.value} is too big for ${e.remaining}: stop`,
        text: `Only ${e.remaining} is still needed, and ${e.value} is more than that. The numbers are sorted, so every number after ${e.value} is too big as well: break out of the loop instead of trying them.`,
        calc: [`${e.value} > ${e.remaining} → break`],
      });
      continue;
    }
    // choose, possibly immediately recorded
    shown.add(e.id);
    cur = e.id;
    const rec = events[k + 1]?.t === 'record' && events[k + 1].id === e.id;
    if (rec) { recorded.add(e.id); found.push(pathOf(e.id)); k++; }
    const p = pathOf(e.id);
    const remaining = mode === 'combsum' ? input.target - p.reduce((a, b) => a + b, 0) : null;
    snap({
      kind: rec ? 'record' : 'choose', lines: rec ? ['choose', 'explore', 'record'] : ['loop', 'choose', 'explore'],
      title: `Choose ${e.value} → ${list(p)}${rec ? (mode === 'subsets' ? ': record it' : ': complete, record it') : ''}`,
      text: `${mode === 'perms' ? `${e.value} isn't used yet, so it can come next.` : mode === 'subsets' ? `Add ${e.value} and explore everything that starts with ${list(p)}.` : `Add ${e.value}: ${remaining} still needed.`} ${rec ? (mode === 'subsets' ? `${list(p)} is a subset: record a copy (the path will keep changing).` : mode === 'perms' ? `All ${nums.length} elements are used: ${list(p)} is a complete ordering. Record a copy and return.` : `Exactly ${input.target}: record ${list(p)} and return.`) : 'Go one level deeper.'}`,
      calc: [`path: ${list(p)}`, ...(mode === 'combsum' ? [`remaining: ${remaining}`] : []), `found: ${found.length}`],
    });
  }
  flushBack();
  cur = root;
  snap({
    kind: 'done', lines: [], answer: `${found.length} found`,
    title: `${plural(found.length, mode === 'subsets' ? 'subset' : mode === 'perms' ? 'permutation' : 'combination')}`,
    text: {
      subsets: `${nums.length} elements give 2^${nums.length} = ${found.length} subsets, one per node of the tree. The tree has exactly that many nodes, so this is O(2^n · n) including the copying.`,
      perms: `${nums.length}! = ${found.length} orderings, one per leaf. Every level has one fewer choice, so the tree has n! leaves.`,
      combsum: `The sorted order made pruning possible: every branch stopped as soon as the next number was too big, so most of the tree was never built.`,
    }[mode],
    calc: found.length ? found.map((p) => list(p)).slice(0, 8) : ['none found'],
  });
  return steps;
}

export function backtrackAnswer({ mode, nums, target }) {
  const out = [];
  if (mode === 'subsets') {
    for (let m = 0; m < 1 << nums.length; m++) out.push(nums.filter((_, k) => m >> k & 1));
    return out.length;
  }
  if (mode === 'perms') { let f = 1; for (let k = 2; k <= nums.length; k++) f *= k; return f; }
  const c = [...nums].sort((a, b) => a - b);
  const go = (start, rem) => { if (rem === 0) return 1; let s = 0; for (let i = start; i < c.length && c[i] <= rem; i++) s += go(i, rem - c[i]); return s; };
  return go(0, target);
}

export function parseBacktrack(values, input) {
  const max = input.mode === 'combsum' ? 4 : 3;
  const r = parseInts(values.nums, { min: 1, max: 20, minLen: 1, maxLen: max, name: 'nums' });
  if (r.error) return r;
  if (new Set(r.arr).size !== r.arr.length) return { error: 'Use distinct numbers.' };
  if (input.mode !== 'combsum') return { input: { mode: input.mode, nums: r.arr } };
  const t = parseInt1(values.target, { min: 1, max: 12, name: 'target' });
  if (t.error) return t;
  if (backtrackAnswer({ mode: 'combsum', nums: r.arr, target: t.v }) > 6) return { error: 'That target has too many combinations to draw; try a smaller one.' };
  if (backtrack({ mode: 'combsum', nums: r.arr, target: t.v })[0].nodes.length > 22) return { error: 'That tree is too big to draw; use bigger numbers or a smaller target.' };
  return { input: { mode: 'combsum', nums: r.arr, target: t.v } };
}

export function randomBacktrack(input, rand = Math.random) {
  const g = rng(rand);
  if (input.mode !== 'combsum') return { mode: input.mode, nums: g.shuffle(Array.from({ length: 9 }, (_, k) => k + 1)).slice(0, 3) };
  for (;;) {
    const nums = g.shuffle([2, 3, 4, 5, 6, 7]).slice(0, 3);
    const target = g.int(5, 9);
    if (backtrack({ mode: 'combsum', nums, target })[0].nodes.length <= 22) return { mode: 'combsum', nums, target };
  }
}

// ---------------------------------------------------------------- N-Queens

export const QUEENS = {
  four: { label: '4 queens', input: { n: 4 } },
  five: { label: '5 queens (first answer)', input: { n: 5, first: true } },
};

export const queensCode = [
  ['row', 'if (row == n) { record the board; return; }'],
  ['try', 'for (int c = 0; c < n; c++) { if (cols[c] || diag[row - c] || anti[row + c]) continue;   // attacked'],
  ['place', '  place a queen at (row, c);  mark its column and diagonals;'],
  ['down', '  placeQueens(row + 1);'],
  ['lift', '  lift the queen, unmark;  }                                   // un-choose'],
];

export const queenCount = (n) => [1, 1, 0, 0, 2, 10, 4, 40, 92][n];

export function queens({ n, first }) {
  const colOf = [];
  const steps = [];
  const sols = [];
  let stop = false;
  const attacked = (r, c) => colOf.some((cc, rr) => cc === c || rr - cc === r - c || rr + cc === r + c);
  let lifts = [];            // consecutive un-chooses, shown as one step
  const push = (x) => steps.push({ n, colOf: [...colOf], sols: sols.map((s) => [...s]), ...x });
  const flush = () => {
    if (!lifts.length) return;
    const last = lifts.at(-1);
    push({
      kind: 'lift', row: last.r, lifted: lifts.map((l) => [l.r, l.c]), lines: ['lift'],
      title: `Lift ${lifts.length === 1 ? `the queen from (${last.r}, ${last.c})` : `the queens from ${lifts.map((l) => `(${l.r}, ${l.c})`).join(', ')}`}`,
      text: `${lifts.length > 1 ? 'Each of those rows has run out of options, so the calls return one after another, each lifting its own queen and unmarking its column and diagonals.' : 'Everything after placing it has been tried, so un-choose: lift it and unmark its column and diagonals.'} ${last.next !== undefined ? `Next try for row ${last.r}: column ${last.next}.` : last.r === 0 ? 'Row 0 has no columns left: the search is over.' : `Row ${last.r} has no other safe column either.`}`,
      calc: [`columns: ${list(colOf)}`],
    });
    lifts = [];
  };
  const snap = (x) => { flush(); push(x); };
  snap({
    kind: 'start', row: 0, lines: [],
    title: `Place ${n} queens so that none attacks another`,
    text: 'One queen per row, so the only choice in each row is the column. A queen attacks along its column and both diagonals; shaded squares are attacked by the queens already placed. When a row has no safe square, the last choice was wrong: lift that queen and try its next column.',
    calc: [`board ${n} × ${n}`],
  });
  const place = (r) => {
    if (stop) return;
    if (r === n) {
      sols.push([...colOf]);
      snap({ kind: 'solution', row: r, lines: ['row'], title: `Solution ${sols.length}: ${list(colOf)}`, text: `Every row has a queen and none attacks another. Record the board${first ? ' and stop' : ', then keep backtracking to look for more'}.`, calc: [`columns by row: ${list(colOf)}`] });
      if (first) stop = true;
      return;
    }
    const safe = Array.from({ length: n }, (_, c) => c).filter((c) => !attacked(r, c));
    if (!safe.length) {
      snap({ kind: 'dead', row: r, lines: ['try'], title: `Row ${r}: every square is attacked`, text: `All ${n} columns of row ${r} are attacked by the queens above. This branch can't be finished, so return: the queen in row ${r - 1} will move.`, calc: ['no safe column → return'] });
      return;
    }
    for (const c of safe) {
      if (stop) return;
      const blocked = Array.from({ length: n }, (_, k) => k).filter((k) => k < c && attacked(r, k));
      colOf.push(c);
      snap({
        kind: 'place', row: r, at: [r, c], lines: ['try', 'place', 'down'],
        title: `Row ${r}: queen at column ${c}`,
        text: `${blocked.length ? `Column${blocked.length > 1 ? 's' : ''} ${blocked.join(', ')} ${blocked.length > 1 ? 'are' : 'is'} attacked, so skip ${blocked.length > 1 ? 'them' : 'it'}. ` : ''}Column ${c} is safe: ${r + 1 === n ? 'place the last queen.' : `place a queen and move on to row ${r + 1}.`}`,
        calc: [`rows done: ${r + 1} of ${n}`, `columns: ${list(colOf)}`],
      });
      place(r + 1);
      colOf.pop();
      if (stop) return;
      const more = safe.filter((x) => x > c);
      lifts.push({ r, c, next: more[0] });
    }
  };
  place(0);
  snap({
    kind: 'done', row: null, lines: [], answer: `${sols.length} solution${sols.length === 1 ? '' : 's'}`,
    title: first ? `First solution: ${list(sols[0])}` : `${plural(sols.length, 'solution')} for n = ${n}`,
    text: 'Checking a square is O(1) because the columns and both diagonals are remembered in boolean arrays (row − col and row + col are constant along each diagonal). Without them, every placement would scan the board.',
    calc: sols.map((s) => list(s)),
  });
  return steps;
}

export function parseQueens(values) {
  const r = parseInt1(values.n, { min: 4, max: 6, name: 'n' });
  return r.error ? r : { input: { n: r.v, first: r.v > 4 } };
}
