/**
 * Models for SideViz.jsx: step-throughs that draw the helper structure beside the input and make one
 * decision per step. Pure, so scripts/viz-check.mjs can test them against brute force.
 *   dequeSide    sliding-window max / min with a monotonic deque (one comparison per step)
 *   windowCounts sliding window driven by a count table: longest without repeats, find all anagrams
 *   bfsQueue     BFS on a grid, one neighbour at a time, with the queue drawn as a lane
 *   callStack    recursion: the call tree beside the call stack (fib, factorial)
 *   stackQueue   a stack on an array and a queue on a circular array, one operation per step
 */
import { list, parseInt1, parseInts, plural, rng } from './util.js';

// ---------------------------------------------------------------- sliding-window max / min, one comparison at a time

export const DEQUE_SIDE = {
  max: { label: 'Window maximum, k = 3', input: { a: [1, 3, -1, -3, 5, 3, 6, 7], k: 3, mode: 'max' } },
  min: { label: 'Window minimum, k = 2', input: { a: [4, 2, 12, 3, 8, 1], k: 2, mode: 'min' } },
};

export const dequeSideCode = (mode) => [
  ['loop', 'for (int i = 0; i < n; i++) {'],
  ['back', `    while (!dq.isEmpty() && a[dq.peekLast()] ${mode === 'max' ? '<=' : '>='} a[i]) dq.pollLast();   // can never be the ${mode} again`],
  ['push', '    dq.offerLast(i);                                  // push the index'],
  ['front', '    if (dq.peekFirst() <= i - k) dq.pollFirst();      // fell out of the window'],
  ['record', '    if (i >= k - 1) ans[i - k + 1] = a[dq.peekFirst()];   // the front is the answer'],
  ['end', '}'],
];

export function dequeSideAnswer({ a, k, mode }) {
  const out = [];
  for (let i = 0; i + k <= a.length; i++) out.push(mode === 'max' ? Math.max(...a.slice(i, i + k)) : Math.min(...a.slice(i, i + k)));
  return out;
}

export function dequeSide(input) {
  const { a, k, mode } = input;
  const beats = mode === 'max' ? (t, x) => t <= x : (t, x) => t >= x;
  const op = mode === 'max' ? '<=' : '>=';
  const dq = [];
  const ans = [];
  const steps = [];
  const snap = (x) => steps.push({ dq: [...dq], ans: [...ans], i: null, cmp: null, left: null, pushed: null, ...x });
  snap({
    kind: 'start', lines: [],
    title: `${mode === 'max' ? 'Maximum' : 'Minimum'} of every window of ${k} in ${list(a)}`,
    text: `The deque holds indexes of values that could still be the window's ${mode}, ${mode === 'max' ? 'decreasing' : 'increasing'} from front to back. A new value removes, from the back, every value it beats: those can never be the ${mode} while the newer value is in the window. The front is always the answer.`,
    calc: ['deque = []', 'front = answer, back = where new indexes go'],
  });
  for (let i = 0; i < a.length; i++) {
    const x = a[i];
    snap({
      kind: 'arrive', i, lines: ['loop'],
      title: `a[${i}] = ${x} arrives`,
      text: dq.length ? `Compare it with the back of the deque, index ${dq.at(-1)} (a[${dq.at(-1)}] = ${a[dq.at(-1)]}). Pop from the back while back ${op} ${x}.` : 'The deque is empty: nothing to compare with.',
      calc: [`x = ${x}`, `deque (front → back) = ${list(dq)}`],
    });
    while (dq.length && beats(a[dq.at(-1)], x)) {
      const j = dq.pop();
      snap({
        kind: 'popback', i, cmp: { j, ok: true }, left: { j, why: 'back' }, lines: ['back'],
        title: `${a[j]} ${op} ${x}: pop index ${j} from the back`,
        text: `${a[j]} is older than ${x} and ${mode === 'max' ? 'no bigger' : 'no smaller'}, so it leaves the window first and never wins while ${x} is around. It can never be the ${mode} again.`,
        calc: [`back ${a[j]} ${op} ${x}? yes → pop back`],
      });
    }
    if (dq.length) {
      const j = dq.at(-1);
      snap({
        kind: 'keep', i, cmp: { j, ok: false }, lines: ['back'],
        title: `${a[j]} ${op} ${x}? No: stop`,
        text: `${a[j]} is ${mode === 'max' ? 'bigger' : 'smaller'} than ${x}, so it may still be the ${mode} of a window. Everything in front of it is even ${mode === 'max' ? 'bigger' : 'smaller'}, so stop.`,
        calc: [`back ${a[j]} ${op} ${x}? no → stop`],
      });
    }
    dq.push(i);
    snap({
      kind: 'push', i, pushed: i, lines: ['push'],
      title: `Push index ${i} at the back`,
      text: `Index ${i} (value ${x}) joins the back. We push the index, not the value, so we can tell later when it has slid out of the window.`,
      calc: [`deque = ${list(dq)}`],
    });
    if (dq[0] <= i - k) {
      const j = dq.shift();
      snap({
        kind: 'dropfront', i, left: { j, why: 'front' }, lines: ['front'],
        title: `Index ${j} left the window: drop it from the front`,
        text: `The window is now [${i - k + 1}, ${i}]. Index ${j} is outside it, so even though it was the ${mode}, it no longer counts.`,
        calc: [`${j} <= ${i} − ${k} = ${i - k}? yes → pop front`],
      });
    }
    if (i >= k - 1) {
      ans.push(a[dq[0]]);
      snap({
        kind: 'record', i, lines: ['record'],
        title: `Window [${i - k + 1}, ${i}]: ${mode} = ${a[dq[0]]}`,
        text: `The front of the deque, index ${dq[0]}, holds the ${mode} of the window: ${a[dq[0]]}.`,
        calc: [`ans[${i - k + 1}] = a[${dq[0]}] = ${a[dq[0]]}`],
      });
    }
  }
  snap({
    kind: 'done', lines: ['end'], answer: list(ans),
    title: `Answers: ${list(ans)}`,
    text: `Each index enters the deque once and leaves it at most once, from the back or the front: O(n) in total, instead of O(nk) for scanning every window. The check: scanning every window gives ${list(dequeSideAnswer(input))}.`,
    calc: [`ans = ${list(ans)}`],
  });
  return steps;
}

export function parseDequeSide(values, input) {
  const r = parseInts(values.a, { min: -20, max: 20, minLen: 2, maxLen: 9, name: 'a' });
  if (r.error) return r;
  const k = parseInt1(values.k, { min: 1, max: r.arr.length, name: 'k' });
  if (k.error) return k;
  return { input: { ...input, a: r.arr, k: k.v } };
}

export function randomDequeSide(input, rand = Math.random) {
  const g = rng(rand);
  const a = Array.from({ length: g.int(6, 9) }, () => g.int(-5, 12));
  return { ...input, a, k: g.int(2, 4) };
}

// ---------------------------------------------------------------- sliding window driven by a count table

export const WINDOW_COUNTS = {
  unique: { label: 'Longest without repeats', input: { mode: 'unique', s: 'abcabcbb' } },
  anagram: { label: 'Find all anagrams of "abc"', input: { mode: 'anagram', s: 'cbaebabacd', p: 'abc' } },
};

export const windowCountsCode = (mode) => (mode === 'unique'
  ? [
    ['loop', 'for (int r = 0; r < s.length(); r++) {'],
    ['add', '    count[s.charAt(r)]++;                         // expand'],
    ['shrink', '    while (count[s.charAt(r)] > 1)               // a repeat: shrink'],
    ['shrink', '        count[s.charAt(l++)]--;'],
    ['record', '    best = Math.max(best, r - l + 1);'],
    ['end', '}'],
  ]
  : [
    ['need', 'int[] need = counts of p;  int m = p.length();'],
    ['loop', 'for (int r = 0; r < s.length(); r++) {'],
    ['add', '    have[s.charAt(r)]++;                          // the new letter enters'],
    ['remove', '    if (r >= m) have[s.charAt(r - m)]--;          // the oldest letter leaves'],
    ['test', '    if (Arrays.equals(have, need)) out.add(r - m + 1);'],
    ['end', '}'],
  ]);

export function windowCountsAnswer({ mode, s, p }) {
  if (mode === 'unique') {
    let best = 0;
    for (let i = 0; i < s.length; i++) for (let j = i; j < s.length; j++) if (new Set(s.slice(i, j + 1)).size === j - i + 1) best = Math.max(best, j - i + 1);
    return best;
  }
  const key = (t) => t.split('').sort().join('');
  const out = [];
  for (let i = 0; i + p.length <= s.length; i++) if (key(s.slice(i, i + p.length)) === key(p)) out.push(i);
  return out;
}

const countsOf = (t) => { const c = {}; for (const ch of t) c[ch] = (c[ch] ?? 0) + 1; return c; };

export function windowCounts(input) {
  const { mode, s } = input;
  const steps = [];
  const letters = [...new Set((mode === 'anagram' ? input.p + s : s).split(''))].sort();
  const count = Object.fromEntries(letters.map((c) => [c, 0]));
  const need = mode === 'anagram' ? { ...Object.fromEntries(letters.map((c) => [c, 0])), ...countsOf(input.p) } : null;
  let l = 0, best = 0, bestAt = null;
  const found = [];
  const snap = (x) => steps.push({ l, count: { ...count }, need, best, bestAt, found: [...found], r: null, focus: null, tone: null, ...x });
  if (mode === 'unique') {
    snap({
      kind: 'start', lines: [],
      title: `Longest substring of "${s}" with no repeated letter`,
      text: 'The count table beside the string says how many times each letter is in the window [l, r]. A window is valid while every count is at most 1. Add letters on the right; when a count reaches 2, remove letters on the left until it is 1 again.',
      calc: ['l = 0, best = 0', 'every count = 0'],
    });
    for (let r = 0; r < s.length; r++) {
      const c = s[r];
      count[c]++;
      snap({
        kind: 'add', r, focus: c, tone: count[c] > 1 ? 'danger' : 'accent', lines: ['loop', 'add'],
        title: `Add '${c}': count['${c}'] = ${count[c]}`,
        text: count[c] > 1 ? `'${c}' is now in the window twice, so the window "${s.slice(l, r + 1)}" is not valid. Shrink from the left.` : `'${c}' appears once in "${s.slice(l, r + 1)}": still valid.`,
        calc: [`count['${c}'] = ${count[c]} ${count[c] > 1 ? '> 1 → shrink' : '≤ 1 → fine'}`],
      });
      while (count[c] > 1) {
        const out = s[l];
        count[out]--;
        l++;
        snap({
          kind: 'shrink', r, focus: out, tone: 'warn', lines: ['shrink'],
          title: `Remove '${out}' from the left`,
          text: count[c] > 1 ? `count['${c}'] is still ${count[c]}: keep shrinking.` : `count['${c}'] is back to 1: the window "${s.slice(l, r + 1)}" is valid again.`,
          calc: [`count['${out}'] = ${count[out]}`, `l = ${l}`],
        });
      }
      if (r - l + 1 > best) {
        best = r - l + 1;
        bestAt = [l, r];
        snap({
          kind: 'record', r, lines: ['record'],
          title: `New best: "${s.slice(l, r + 1)}", length ${best}`,
          text: `Every count in the window is at most 1, and it is the longest valid window so far.`,
          calc: [`best = ${r} − ${l} + 1 = ${best}`],
        });
      }
    }
    snap({
      kind: 'done', lines: ['end'], answer: `${best}`,
      title: `Longest: ${best}`,
      text: `Each letter is added once and removed at most once: O(n). The check: testing every substring also gives ${windowCountsAnswer(input)}.`,
      calc: [`best = ${best}`],
    });
    return steps;
  }
  const m = input.p.length;
  snap({
    kind: 'start', lines: ['need'],
    title: `Anagrams of "${input.p}" in "${s}"`,
    text: `Slide a window of exactly ${m} letters. The table compares what the window has with what "${input.p}" needs. Each step one letter enters on the right and (once the window is full) one leaves on the left; when every row matches, the window is an anagram.`,
    calc: [`need = ${Object.entries(countsOf(input.p)).map(([c, v]) => `${c}:${v}`).join(' ')}`],
  });
  for (let r = 0; r < s.length; r++) {
    count[s[r]]++;
    const gone = r >= m ? s[r - m] : null;
    if (gone !== null) { count[gone]--; l = r - m + 1; }
    const full = r >= m - 1;
    const match = full && letters.every((c) => count[c] === need[c]);
    if (match) found.push(r - m + 1);
    const diff = letters.filter((c) => count[c] !== need[c]);
    snap({
      kind: match ? 'match' : 'slide', r, focus: s[r], tone: match ? 'success' : 'accent', lines: ['loop', 'add', ...(gone !== null ? ['remove'] : []), 'test'],
      title: match ? `Window "${s.slice(r - m + 1, r + 1)}" matches: anagram at ${r - m + 1}` : full ? `Window "${s.slice(r - m + 1, r + 1)}": no match` : `Add '${s[r]}' (window not full yet)`,
      text: `'${s[r]}' enters${gone !== null ? ` and '${gone}' leaves` : ''}. ${full ? (match ? 'Every row of the table matches.' : `Rows that differ: ${diff.map((c) => `'${c}' (${count[c]} vs ${need[c]})`).join(', ')}.`) : `The window holds ${r + 1} of ${m} letters.`}`,
      calc: [`have['${s[r]}'] = ${count[s[r]]}${gone !== null ? `, have['${gone}'] = ${count[gone]}` : ''}`, full ? (match ? `match → add ${r - m + 1}` : 'no match') : 'not full yet'],
      l: Math.max(0, r - m + 1),
    });
  }
  snap({
    kind: 'done', lines: ['end'], answer: list(found),
    title: `Anagrams start at ${list(found)}`,
    text: `Each step changes two counts, and comparing 26 counts is O(1): O(n) overall. (A "matches" counter avoids even the comparison.) The check: sorting every window gives ${list(windowCountsAnswer(input))}.`,
    calc: [`out = ${list(found)}`],
  });
  return steps;
}

export function parseWindowCounts(values, input) {
  const s = String(values.s ?? '').trim().toLowerCase();
  if (!/^[a-e]{1,12}$/.test(s)) return { error: 'Use 1 to 12 letters from a to e, so the table stays small.' };
  if (input.mode === 'unique') return { input: { mode: 'unique', s } };
  const p = String(values.p ?? '').trim().toLowerCase();
  if (!/^[a-e]{1,4}$/.test(p) || p.length > s.length) return { error: 'p: 1 to 4 letters from a to e, no longer than s.' };
  return { input: { mode: 'anagram', s, p } };
}

export function randomWindowCounts(input, rand = Math.random) {
  const g = rng(rand);
  const word = (n, alpha) => Array.from({ length: n }, () => g.pick(alpha)).join('');
  if (input.mode === 'unique') return { mode: 'unique', s: word(g.int(6, 11), ['a', 'b', 'c', 'd', 'e']) };
  const p = word(g.int(2, 3), ['a', 'b', 'c']);
  return { mode: 'anagram', p, s: word(g.int(6, 11), ['a', 'b', 'c', 'd']) };
}

// ---------------------------------------------------------------- BFS on a grid, one neighbour at a time

export const BFS_QUEUE = {
  path: { label: 'Shortest path, 3 × 4', input: { grid: [[0, 0, 1, 0], [1, 0, 0, 0], [0, 0, 1, 0]] } },
  walled: { label: 'No way through', input: { grid: [[0, 1, 0], [1, 0, 0], [0, 0, 0]] } },
};

export const bfsQueueCode = [
  ['init', 'queue.add(start); dist[start] = 0;'],
  ['pop', 'while (!queue.isEmpty()) {  cell u = queue.poll();'],
  ['look', '    for (cell v : neighbours(u)) {'],
  ['skip', '        if (wall(v) || dist[v] != -1) continue;    // blocked or seen'],
  ['push', '        dist[v] = dist[u] + 1;  queue.add(v);'],
  ['found', '        if (v == target) return dist[v];'],
  ['end', '}  return -1;'],
];

const DIRS = [[-1, 0, 'up'], [0, 1, 'right'], [1, 0, 'down'], [0, -1, 'left']];

export function bfsQueueAnswer({ grid }) {
  const R = grid.length, C = grid[0].length;
  if (grid[0][0] === 1 || grid[R - 1][C - 1] === 1) return -1;
  const d = grid.map((row) => row.map(() => -1));
  d[0][0] = 0;
  const q = [[0, 0]];
  for (let h = 0; h < q.length; h++) {
    const [r, c] = q[h];
    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= R || nc >= C || grid[nr][nc] === 1 || d[nr][nc] !== -1) continue;
      d[nr][nc] = d[r][c] + 1;
      q.push([nr, nc]);
    }
  }
  return d[R - 1][C - 1];
}

export function bfsQueue(input) {
  const { grid } = input;
  const R = grid.length, C = grid[0].length;
  const dist = grid.map((row) => row.map(() => -1));
  const q = [];
  const steps = [];
  const cell = (r, c) => `(${r},${c})`;
  const isT = (r, c) => r === R - 1 && c === C - 1;
  const snap = (x) => steps.push({ dist: dist.map((row) => [...row]), q: q.map(([r, c]) => [r, c]), u: null, v: null, left: null, pushed: null, ...x });
  if (grid[0][0] === 1 || grid[R - 1][C - 1] === 1) {
    snap({ kind: 'start', lines: [], title: 'Start or target is blocked', text: 'The corner cell is a wall, so there is no path at all.', calc: ['answer = -1'] });
    snap({ kind: 'done', lines: ['end'], answer: '-1', title: 'No path: −1', text: 'Nothing to search: the start or the target is a wall.', calc: ['-1'] });
    return steps;
  }
  dist[0][0] = 0;
  q.push([0, 0]);
  snap({
    kind: 'start', lines: ['init'], pushed: [0, 0],
    title: `Shortest path from (0,0) to ${cell(R - 1, C - 1)}`,
    text: 'BFS visits cells in order of distance. The queue holds cells whose distance is known but whose neighbours are not explored yet: first in, first out, so nearer cells always come out before farther ones.',
    calc: ['dist(0,0) = 0', 'queue = [(0,0)]'],
  });
  while (q.length) {
    const [r, c] = q.shift();
    snap({
      kind: 'pop', u: [r, c], left: [r, c], lines: ['pop'],
      title: `Take ${cell(r, c)} from the front (distance ${dist[r][c]})`,
      text: `It is the oldest cell in the queue, so no unexplored cell is nearer. Look at its neighbours: up, right, down, left.`,
      calc: [`u = ${cell(r, c)}, dist = ${dist[r][c]}`],
    });
    for (const [dr, dc, name] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= R || nc >= C) continue;
      if (grid[nr][nc] === 1) {
        snap({ kind: 'skip', u: [r, c], v: [nr, nc], lines: ['look', 'skip'], title: `${name} ${cell(nr, nc)}: wall, skip`, text: `${cell(nr, nc)} is a wall: no path goes through it, so it never enters the queue.`, calc: [`${cell(nr, nc)} is a wall → skip`] });
        continue;
      }
      if (dist[nr][nc] !== -1) {
        snap({ kind: 'skip', u: [r, c], v: [nr, nc], lines: ['look', 'skip'], title: `${name} ${cell(nr, nc)}: already seen, skip`, text: `${cell(nr, nc)} already has distance ${dist[nr][nc]}, which can't be beaten: BFS reached it no later than now.`, calc: [`dist${cell(nr, nc)} = ${dist[nr][nc]} → skip`] });
        continue;
      }
      dist[nr][nc] = dist[r][c] + 1;
      q.push([nr, nc]);
      const hit = isT(nr, nc);
      snap({
        kind: hit ? 'found' : 'push', u: [r, c], v: [nr, nc], pushed: [nr, nc], lines: hit ? ['look', 'push', 'found'] : ['look', 'push'],
        title: hit ? `${name} ${cell(nr, nc)}: the target, at distance ${dist[nr][nc]}` : `${name} ${cell(nr, nc)}: new, distance ${dist[nr][nc]}, add to the back`,
        text: hit ? `The first time BFS reaches the target is along a shortest path: distance ${dist[nr][nc]}.` : `It is reached for the first time, one step further than ${cell(r, c)}. Mark it now (not when it leaves the queue), so no one adds it twice.`,
        calc: [`dist${cell(nr, nc)} = ${dist[r][c]} + 1 = ${dist[nr][nc]}`, `queue = ${list(q.map(([a, b]) => cell(a, b)))}`],
      });
      if (hit) {
        snap({ kind: 'done', u: null, v: [nr, nc], lines: ['found'], answer: `${dist[nr][nc]}`, title: `Answer: ${dist[nr][nc]}`, text: `Every cell enters the queue at most once: O(rows × cols). The check: a full BFS gives ${bfsQueueAnswer(input)}.`, calc: [`dist = ${dist[nr][nc]}`] });
        return steps;
      }
    }
  }
  snap({ kind: 'done', lines: ['end'], answer: '-1', title: 'The queue ran out: no path, −1', text: `Every reachable cell was explored and the target was not one of them. The check: a full BFS gives ${bfsQueueAnswer(input)}.`, calc: ['answer = -1'] });
  return steps;
}

export const gridText = (grid) => grid.map((row) => row.join('')).join('; ');

export function parseBfsQueue(values) {
  const rows = String(values.grid ?? '').split(/[;\n]/).map((t) => t.trim()).filter(Boolean);
  if (!rows.length || rows.length > 4 || rows.some((t) => !/^[01]{2,5}$/.test(t)) || new Set(rows.map((t) => t.length)).size !== 1) return { error: 'Up to 4 rows of 2 to 5 digits (0 open, 1 wall), all the same length, separated by ;' };
  return { input: { grid: rows.map((t) => t.split('').map(Number)) } };
}

export function randomBfsQueue(input, rand = Math.random) {
  const g = rng(rand);
  const R = g.int(2, 4), C = g.int(3, 5);
  const grid = Array.from({ length: R }, () => Array.from({ length: C }, () => (g.bool(0.25) ? 1 : 0)));
  grid[0][0] = 0;
  grid[R - 1][C - 1] = 0;
  return { grid };
}

// ---------------------------------------------------------------- recursion: the call tree and the call stack

export const CALL_STACK = {
  fact: { label: 'factorial(4): a chain', input: { fn: 'fact', n: 4 } },
  fib: { label: 'fib(4): a tree', input: { fn: 'fib', n: 4 } },
};

export const callStackCode = (fn) => (fn === 'fact'
  ? [
    ['sig', 'int fact(int n) {'],
    ['base', '    if (n <= 1) return 1;                 // base case'],
    ['call', '    int rest = fact(n - 1);               // wait here for the answer'],
    ['ret', '    return n * rest;'],
    ['end', '}'],
  ]
  : [
    ['sig', 'int fib(int n) {'],
    ['base', '    if (n <= 1) return n;                 // base case'],
    ['call', '    int a = fib(n - 1);                   // left call: wait for it'],
    ['call2', '    int b = fib(n - 2);                   // then the right call'],
    ['ret', '    return a + b;'],
    ['end', '}'],
  ]);

export const callStackAnswer = ({ fn, n }) => {
  if (fn === 'fact') { let r = 1; for (let k = 2; k <= n; k++) r *= k; return r; }
  let [a, b] = [0, 1];
  for (let k = 0; k < n; k++) [a, b] = [b, a + b];
  return a;
};

/** The whole call tree, as a binary tree for drawing: left = first call, right = second. */
function callTree(fn, n) {
  const nodes = {};
  const build = (id, m) => {
    nodes[id] = { v: m, left: null, right: null };
    if (m > 1) {
      nodes[id].left = build(`${id}L`, m - 1);
      if (fn === 'fib') nodes[id].right = build(`${id}R`, m - 2);
    }
    return id;
  };
  return { root: build('r', n), nodes };
}

export function callStack(input) {
  const { fn, n } = input;
  const t = callTree(fn, n);
  const name = fn === 'fact' ? 'fact' : 'fib';
  const stack = [];   // frames { id, m, a, b }
  const ret = {};     // id → returned value
  const steps = [];
  const frameText = (fr) => (fn === 'fact'
    ? (fr.m <= 1 ? 'base case' : `rest = ${fr.a ?? '?'}`)
    : (fr.m <= 1 ? 'base case' : `a = ${fr.a ?? '?'}, b = ${fr.b ?? '?'}`));
  const snap = (x) => steps.push({ stack: stack.map((fr) => ({ ...fr, note: frameText(fr) })), ret: { ...ret }, active: stack.at(-1)?.id ?? null, ...x });
  snap({
    kind: 'start', lines: [], cur: null,
    title: `${name}(${n}): the call tree and the call stack`,
    text: 'Each call gets a frame on the call stack holding its own n and its local variables. A call that makes another call waits: its frame stays on the stack until the inner call returns. Only the top frame is ever running.',
    calc: ['call stack = []'],
  });
  const run = (id) => {
    const m = t.nodes[id].v;
    const fr = { id, m, a: null, b: null };
    stack.push(fr);
    snap({ kind: 'call', cur: id, pushed: id, lines: ['sig'], title: `Call ${name}(${m}): push a frame`, text: `${name}(${m}) starts running on top of the stack${stack.length > 1 ? `; ${name}(${stack.at(-2).m}) below it is paused, waiting for this answer` : ''}.`, calc: [`stack depth = ${stack.length}`] });
    let val;
    if (m <= 1) {
      val = fn === 'fact' ? 1 : m;
      ret[id] = val;
      stack.pop();
      snap({ kind: 'base', cur: id, popped: { id, m, val }, lines: ['base'], title: `${name}(${m}) is a base case: return ${val}`, text: `No more calls: the answer is known directly. The frame is popped, and ${stack.length ? `${name}(${stack.at(-1).m}) resumes with the value` : 'the result goes back to the caller'}.`, calc: [`${name}(${m}) = ${val}`, `stack depth = ${stack.length}`] });
      return val;
    }
    const left = t.nodes[id].left;
    snap({ kind: 'wait', cur: id, lines: ['call'], title: `${name}(${m}) calls ${name}(${m - 1}) and waits`, text: `The ${name}(${m}) frame stays where it is, remembering that it was in the middle of line "${fn === 'fact' ? 'rest = fact(n - 1)' : 'a = fib(n - 1)'}".`, calc: [`${name}(${m}) waits for ${name}(${m - 1})`] });
    fr.a = run(left);
    if (fn === 'fib') {
      const right = t.nodes[id].right;
      snap({ kind: 'wait', cur: id, lines: ['call2'], title: `${name}(${m}) got a = ${fr.a}; now it calls fib(${m - 2})`, text: `Back on top, ${name}(${m}) continues from where it paused, with a = ${fr.a}. It makes its second call and waits again.`, calc: [`a = ${fr.a}`, `${name}(${m}) waits for fib(${m - 2})`] });
      fr.b = run(right);
      val = fr.a + fr.b;
    } else {
      val = m * fr.a;
    }
    ret[id] = val;
    stack.pop();
    snap({ kind: 'return', cur: id, popped: { id, m, val }, lines: ['ret'], title: `${name}(${m}) returns ${val}`, text: `${fn === 'fact' ? `${m} × ${fr.a} = ${val}` : `${fr.a} + ${fr.b} = ${val}`}. The frame is popped${stack.length ? ` and ${name}(${stack.at(-1).m}) resumes` : ''}.`, calc: [fn === 'fact' ? `return ${m} * ${fr.a} = ${val}` : `return ${fr.a} + ${fr.b} = ${val}`, `stack depth = ${stack.length}`] });
    return val;
  };
  const out = run(t.root);
  const calls = Object.keys(t.nodes).length;
  snap({
    kind: 'done', cur: null, lines: ['end'], answer: `${out}`,
    title: `${name}(${n}) = ${out}`,
    text: `${plural(calls, 'call')} in total, but the stack was never deeper than ${n} frames: space is the depth of the recursion, not the number of calls.${fn === 'fib' ? ' Notice fib(2) was computed more than once: memoization would remember it.' : ''} The check: a loop gives ${callStackAnswer(input)}.`,
    calc: [`${name}(${n}) = ${out}`, `calls = ${calls}`],
  });
  return steps;
}

export const callTreeOf = ({ fn, n }) => callTree(fn, n);

export function parseCallStack(values, input) {
  const k = parseInt1(values.n, { min: 1, max: input.fn === 'fib' ? 5 : 6, name: 'n' });
  if (k.error) return k;
  return { input: { ...input, n: k.v } };
}

export function randomCallStack(input, rand = Math.random) {
  const g = rng(rand);
  return { ...input, n: g.int(2, input.fn === 'fib' ? 5 : 6) };
}

// ---------------------------------------------------------------- a stack and a queue on arrays

export const STACK_QUEUE = {
  stack: { label: 'Stack: push and pop at the top', input: { mode: 'stack', cap: 5, ops: [['push', 3], ['push', 8], ['push', 5], ['peek'], ['pop'], ['push', 1], ['pop'], ['pop']] } },
  queue: { label: 'Queue: a circular array', input: { mode: 'queue', cap: 4, ops: [['offer', 3], ['offer', 8], ['offer', 5], ['poll'], ['offer', 1], ['offer', 7], ['poll'], ['offer', 9], ['peek']] } },
};

export const stackQueueCode = (mode) => (mode === 'stack'
  ? [
    ['fields', 'int[] a = new int[cap];  int size = 0;          // top is a[size - 1]'],
    ['push', 'void push(int x) { a[size++] = x; }'],
    ['pop', 'int pop()  { return a[--size]; }'],
    ['peek', 'int peek() { return a[size - 1]; }'],
  ]
  : [
    ['fields', 'int[] a = new int[cap];  int head = 0, size = 0;  // front is a[head]'],
    ['offer', 'void offer(int x) { a[(head + size) % cap] = x; size++; }   // the back wraps around'],
    ['poll', 'int poll() { int x = a[head]; head = (head + 1) % cap; size--; return x; }'],
    ['peek', 'int peek() { return a[head]; }'],
  ]);

export function stackQueueAnswer({ mode, ops }) {
  const d = [];
  const out = [];
  for (const [op, x] of ops) {
    if (op === 'push' || op === 'offer') d.push(x);
    else if (op === 'pop') out.push(d.pop());
    else if (op === 'poll') out.push(d.shift());
    else out.push(mode === 'stack' ? d.at(-1) : d[0]);
  }
  return out;
}

export const stackQueueText = (ops) => ops.map(([op, x]) => (x === undefined ? op : `${op} ${x}`)).join(', ');

export function stackQueue(input) {
  const { mode, cap, ops } = input;
  const arr = new Array(cap).fill(null);
  const items = [];   // { id, v, slot } in order bottom→top (stack) or front→back (queue)
  let head = 0, size = 0, nextId = 0;
  const out = [];
  const steps = [];
  const snap = (x) => steps.push({ arr: [...arr], items: items.map((it) => ({ ...it })), head, size, out: [...out], pushed: null, popped: null, slot: null, ...x });
  snap({
    kind: 'start', lines: ['fields'],
    title: mode === 'stack' ? 'A stack on an array' : 'A queue on a circular array',
    text: mode === 'stack'
      ? 'The stack lives in an array; size says where the top is. Push writes at a[size], pop reads a[size − 1]. Nothing ever moves.'
      : 'The queue lives in a fixed array used as a ring. head points at the front; the back is at (head + size) % cap. When an index runs off the end, it wraps to 0, so freed slots at the start are reused.',
    calc: [mode === 'stack' ? 'size = 0' : `head = 0, size = 0, cap = ${cap}`],
  });
  for (const [op, x] of ops) {
    if (op === 'push' || op === 'offer') {
      const slot = mode === 'stack' ? size : (head + size) % cap;
      arr[slot] = x;
      size++;
      const it = { id: nextId++, v: x, slot };
      items.push(it);
      snap({
        kind: 'add', slot, pushed: it.id, lines: [op],
        title: `${op}(${x}) → slot ${slot}`,
        text: mode === 'stack' ? `${x} goes on top, at a[${slot}]. size becomes ${size}.` : `${x} joins the back, at a[(${head} + ${size - 1}) % ${cap}] = a[${slot}].${slot < head ? ' The index wrapped around to the start of the array.' : ''}`,
        calc: [mode === 'stack' ? `a[${slot}] = ${x}, size = ${size}` : `a[${slot}] = ${x}, size = ${size}`],
      });
    } else if (op === 'pop' || op === 'poll') {
      const it = mode === 'stack' ? items.pop() : items.shift();
      const slot = it.slot;
      arr[slot] = null;
      size--;
      if (mode === 'queue') head = (head + 1) % cap;
      out.push(it.v);
      snap({
        kind: 'remove', slot, popped: it, lines: [op],
        title: `${op}() → ${it.v}`,
        text: mode === 'stack' ? `The top, a[${slot}] = ${it.v}, comes off: the last one in is the first one out. size becomes ${size}.` : `The front, a[${slot}] = ${it.v}, leaves: the first one in is the first one out. head moves to ${head}${slot === cap - 1 ? ', wrapping to the start' : ''}.`,
        calc: [`returns ${it.v}`, mode === 'stack' ? `size = ${size}` : `head = ${head}, size = ${size}`],
      });
    } else {
      const it = mode === 'stack' ? items.at(-1) : items[0];
      out.push(it.v);
      snap({
        kind: 'peek', slot: it.slot, lines: ['peek'],
        title: `peek() → ${it.v}`,
        text: `Look at the ${mode === 'stack' ? 'top' : 'front'} without removing it.`,
        calc: [`returns ${it.v}`],
      });
    }
  }
  snap({
    kind: 'done', lines: [], answer: list(out),
    title: `Returned: ${list(out)}`,
    text: `Every operation is O(1): a stack only touches its top, and the ring buffer only moves head and size. The check: a plain list gives ${list(stackQueueAnswer(input))}.`,
    calc: [`returned = ${list(out)}`],
  });
  return steps;
}

export function parseStackQueue(values, input) {
  const add = input.mode === 'stack' ? 'push' : 'offer';
  const rem = input.mode === 'stack' ? 'pop' : 'poll';
  const parts = String(values.ops ?? '').split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
  if (!parts.length || parts.length > 12) return { error: 'Type 1 to 12 operations separated by commas.' };
  const ops = [];
  let size = 0;
  for (const t of parts) {
    const m = new RegExp(`^(${add})\\s+(-?\\d{1,2})$|^(${rem}|peek)$`).exec(t);
    if (!m) return { error: `Use "${add} x", "${rem}" or "peek".` };
    if (m[1]) { if (size === input.cap) return { error: `The array holds ${input.cap} values: ${add} on a full ${input.mode} isn't allowed here.` }; ops.push([add, Number(m[2])]); size++; }
    else { if (!size) return { error: `"${m[3]}" on an empty ${input.mode}.` }; ops.push([m[3]]); if (m[3] !== 'peek') size--; }
  }
  return { input: { ...input, ops } };
}

export function randomStackQueue(input, rand = Math.random) {
  const g = rng(rand);
  const add = input.mode === 'stack' ? 'push' : 'offer';
  const rem = input.mode === 'stack' ? 'pop' : 'poll';
  const ops = [];
  let size = 0;
  const count = g.int(6, 10);
  for (let k = 0; k < count; k++) {
    if (size < input.cap && (!size || g.bool(0.55))) { ops.push([add, g.int(1, 20)]); size++; }
    else if (g.bool(0.8)) { ops.push([rem]); size--; }
    else ops.push(['peek']);
  }
  return { ...input, ops };
}
