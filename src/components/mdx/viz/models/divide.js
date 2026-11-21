/**
 * Divide and conquer, one call at a time (the model behind <DivideViz>). Every call is a row in an
 * outline: it appears when its parent splits, runs, and finally shows what it returned. Pure (no React),
 * so scripts/viz-check.mjs can test it.
 *
 * Modes:
 *   merge  merge sort on a linked list: split at the middle (slow/fast), sort both halves, merge  (Sort List)
 *   bad    split a string at letters that appear fewer than k times in the range                 (LC 395)
 *   ops    every way to parenthesise: split at the operator applied last, memo by sub-expression   (LC 241)
 *
 * A step: { kind, title, text, calc, lines, nodes: [{ id, depth, label, via?, state, res }], cur, card?,
 *           range?: [lo, hi) of the input strip, marks?: { i: cls }, answer? }
 * Node states: wait (made by a split, not run yet), run (on the call stack), done, memo (answer reused).
 */

export const DIVIDE = {
  list: { label: 'Sort List: [4, 2, 1, 3]', input: { mode: 'merge', vals: [4, 2, 1, 3] } },
  list5: { label: '[−1, 5, 3, 4, 0]', input: { mode: 'merge', vals: [-1, 5, 3, 4, 0] } },
  bad: { label: '"aaabb", k = 3', input: { mode: 'bad', s: 'aaabb', k: 3 } },
  bad2: { label: '"bbaaacbd", k = 3', input: { mode: 'bad', s: 'bbaaacbd', k: 3 } },
  ops: { label: '"2-1-1"', input: { mode: 'ops', expr: '2-1-1' } },
  ops2: { label: '"2*3-4*5"', input: { mode: 'ops', expr: '2*3-4*5' } },
};

export const LIMITS = { merge: 8, bad: 14, ops: 4 };   // nodes; letters; operators

export const divideCode = (mode) => (mode === 'merge'
  ? [
    ['sig', 'ListNode sortList(ListNode head) {'],
    ['base', '    if (head == null || head.next == null) return head;'],
    ['mid', '    ListNode slow = head, fast = head.next;'],
    ['mid', '    while (fast != null && fast.next != null) { slow = slow.next; fast = fast.next.next; }'],
    ['cut', '    ListNode right = slow.next; slow.next = null;   // cut after the middle'],
    ['rec', '    ListNode a = sortList(head), b = sortList(right);'],
    ['merge', '    return merge(a, b);   // relink the smaller front node, again and again'],
    ['end', '}'],
  ]
  : mode === 'bad'
    ? [
      ['sig', 'int longest(int lo, int hi) {   // the answer inside s[lo, hi)'],
      ['short', '    if (hi - lo < k) return 0;'],
      ['count', '    int[] count = letter counts of s[lo, hi);'],
      ['valid', '    if (every letter in the range has count >= k) return hi - lo;'],
      ['split', '    for (each piece between letters with count < k)'],
      ['rec', '        best = Math.max(best, longest(pieceLo, pieceHi));'],
      ['ret', '    return best;'],
      ['end', '}'],
    ]
    : [
      ['sig', 'List<Integer> ways(String e) {'],
      ['memo', '    if (memo.containsKey(e)) return memo.get(e);'],
      ['num', '    if (e has no operator) return [the number];'],
      ['split', '    for (each operator op at i)   // op is applied last'],
      ['rec', '        for (x : ways(e[0, i)))  for (y : ways(e(i, end)))'],
      ['combine', '            res.add(x op y);'],
      ['store', '    memo.put(e, res); return res;'],
      ['end', '}'],
    ]);

const listText = (a) => (a.length ? a.join(' → ') : 'empty');
const arr = (a) => `[${a.join(', ')}]`;
const SYM = { '+': '+', '-': '−', '*': '×' };
const ORD = ['first', 'second', 'third', 'fourth'];
const apply = (op, x, y) => (op === '+' ? x + y : op === '-' ? x - y : x * y);

function recorder() {
  const nodes = [];
  const steps = [];
  const snap = (x) => steps.push({ nodes: nodes.map((n) => ({ ...n })), ...x });
  let made = 0;
  const add = (depth, label, extra = {}) => ({ id: made++, depth, label, state: 'wait', res: null, ...extra });
  return { nodes, steps, snap, add };
}

/** Insert children right after the parent's last descendant, so the outline stays in call order. */
function insertChildren(nodes, parent, kids) {
  let at = nodes.indexOf(parent) + 1;
  while (at < nodes.length && nodes[at].depth > parent.depth) at++;
  nodes.splice(at, 0, ...kids);
}

// ---------------------------------------------------------------- merge sort on a list

function mergeSteps(vals) {
  const { nodes, steps, snap, add } = recorder();
  const root = add(0, listText(vals), { vals });
  nodes.push(root);
  snap({
    kind: 'start', cur: null, lines: [],
    title: `Sort ${listText(vals)}`,
    text: 'No index jumps on a linked list, so quicksort and heapsort are awkward. Merge sort only walks forwards: cut the list in half, sort each half, then merge the two sorted halves.',
    calc: [`n = ${vals.length}`],
  });
  const sort = (node) => {
    const v = node.vals;
    node.state = 'run';
    if (v.length <= 1) {
      node.state = 'done'; node.res = listText(v);
      snap({ kind: 'base', cur: node.id, lines: ['sig', 'base'], card: { q: listText(v), a: 'one node: already sorted', tone: 'yes' }, title: `${listText(v)}: already sorted`, text: 'A list of one node (or none) is sorted as it is. This is where the halving stops.', calc: [`length ${v.length} ≤ 1 → return it`] });
      return v;
    }
    const half = Math.ceil(v.length / 2);
    const a = add(node.depth + 1, listText(v.slice(0, half)), { vals: v.slice(0, half), via: 'left half' });
    const b = add(node.depth + 1, listText(v.slice(half)), { vals: v.slice(half), via: 'right half' });
    insertChildren(nodes, node, [a, b]);
    snap({
      kind: 'split', cur: node.id, lines: ['sig', 'mid', 'cut'],
      card: { q: `cut after ${v[half - 1]}`, a: `${listText(a.vals)}  |  ${listText(b.vals)}`, tone: 'info' },
      title: `Split ${listText(v)} in the middle`,
      text: `slow moves one node while fast moves two, so when fast runs out, slow is at the end of the first half (node ${v[half - 1]}). Cut the link after it: two lists of ${half} and ${v.length - half}.`,
      calc: [`length ${v.length} → ${half} + ${v.length - half}`, `left = ${listText(a.vals)}`, `right = ${listText(b.vals)}`],
    });
    const x = sort(a);
    const y = sort(b);
    node.state = 'run';
    const out = [];
    const picks = [];
    let i = 0, j = 0;
    while (i < x.length && j < y.length) {
      if (x[i] <= y[j]) { picks.push(`${x[i]} vs ${y[j]} → take ${x[i]}`); out.push(x[i++]); } else { picks.push(`${x[i]} vs ${y[j]} → take ${y[j]}`); out.push(y[j++]); }
    }
    const rest = i < x.length ? x.slice(i) : y.slice(j);
    if (rest.length) picks.push(`one side is empty → link the rest: ${listText(rest)}`);
    out.push(...rest);
    node.state = 'done'; node.res = listText(out);
    snap({
      kind: 'merge', cur: node.id, lines: ['rec', 'merge'],
      card: { q: `${listText(x)}  +  ${listText(y)}`, a: `→ ${listText(out)}`, tone: 'yes' },
      title: `Merge ${listText(x)} and ${listText(y)}`,
      text: 'Both halves are sorted now. Compare their front nodes, link the smaller one behind the tail, and move on in that half. No new nodes are made: only next pointers change.',
      calc: picks,
    });
    return out;
  };
  const sorted = sort(root);
  snap({ kind: 'done', cur: null, lines: [], title: `Sorted: ${listText(sorted)}`, text: `Each level of splitting halves the lists, so there are about log₂ ${vals.length} levels, and the merges on one level touch every node once: O(n log n) time.`, calc: [`levels of splitting: ${Math.ceil(Math.log2(Math.max(2, vals.length)))}`], answer: arr(sorted) });
  return steps;
}

// ---------------------------------------------------------------- split at letters that can't belong

function badSteps(s, k) {
  const { nodes, steps, snap, add } = recorder();
  const root = add(0, `"${s}"`, { lo: 0, hi: s.length });
  nodes.push(root);
  snap({
    kind: 'start', cur: null, lines: [], range: [0, s.length], marks: {},
    title: `Longest piece of "${s}" where every letter appears at least ${k} times`,
    text: `Count the letters of the range. A letter seen fewer than ${k} times can't be in any valid substring of it, so it cuts the range into pieces that can be solved on their own.`,
    calc: [`k = ${k}`],
  });
  const solve = (node) => {
    const { lo, hi } = node;
    const piece = s.slice(lo, hi);
    node.state = 'run';
    if (hi - lo < k) {
      node.state = 'done'; node.res = '0';
      snap({ kind: 'short', cur: node.id, lines: ['sig', 'short'], range: [lo, hi], marks: {}, card: { q: `length ${hi - lo} < ${k}`, a: 'too short → 0', tone: 'no' }, title: `"${piece}" is shorter than ${k}`, text: `No letter can appear ${k} times in fewer than ${k} letters, so this piece gives 0.`, calc: [`${hi - lo} < ${k} → 0`] });
      return 0;
    }
    const count = {};
    for (const c of piece) count[c] = (count[c] ?? 0) + 1;
    const letters = Object.keys(count).sort();
    const bad = letters.filter((c) => count[c] < k);
    const countLine = letters.map((c) => `${c}:${count[c]}`).join(' ');
    if (!bad.length) {
      node.state = 'done'; node.res = String(hi - lo);
      const marks = {}; for (let i = lo; i < hi; i++) marks[i] = 'hit';
      snap({ kind: 'valid', cur: node.id, lines: ['count', 'valid'], range: [lo, hi], marks, card: { q: countLine, a: `all ≥ ${k} → ${hi - lo}`, tone: 'yes' }, title: `"${piece}" is valid as a whole: ${hi - lo}`, text: `Every letter in it appears at least ${k} times, so the whole range is the longest valid substring inside it.`, calc: [countLine, `every count ≥ ${k} → return ${hi - lo}`] });
      return hi - lo;
    }
    const marks = {};
    const kids = [];
    let start = lo;
    for (let j = lo; j <= hi; j++) {
      if (j < hi && count[s[j]] < k) marks[j] = 'bad';
      if (j === hi || count[s[j]] < k) {
        if (j > start) kids.push(add(node.depth + 1, `"${s.slice(start, j)}"`, { lo: start, hi: j }));
        start = j + 1;
      }
    }
    insertChildren(nodes, node, kids);
    const badText = bad.map((c) => `${c} (${count[c]})`).join(', ');
    if (!kids.length) {
      node.state = 'done'; node.res = '0';
      snap({ kind: 'split', cur: node.id, lines: ['count', 'split', 'ret'], range: [lo, hi], marks, card: { q: countLine, a: 'every letter is too rare → 0', tone: 'bad' }, title: `Every letter of "${piece}" is too rare: 0`, text: `${badText}: all fewer than ${k}, so nothing is left between the cuts.`, calc: [countLine, 'no pieces → 0'] });
      return 0;
    }
    snap({
      kind: 'split', cur: node.id, lines: ['count', 'split'], range: [lo, hi], marks,
      card: { q: countLine, a: `${bad.join(', ')} < ${k} → cut there`, tone: 'bad' },
      title: `Cut "${piece}" at ${bad.map((c) => `'${c}'`).join(', ')}`,
      text: `${badText} ${bad.length === 1 ? 'appears' : 'appear'} fewer than ${k} times in this range, so no valid substring can contain ${bad.length === 1 ? 'it' : 'them'}. The pieces between the cuts are solved separately: ${kids.map((c) => c.label).join(', ')}.`,
      calc: [countLine, `pieces: ${kids.map((c) => c.label).join(', ')}`],
    });
    const got = kids.map((c) => solve(c));
    const best = Math.max(...got);
    node.state = 'done'; node.res = String(best);
    snap({ kind: 'best', cur: node.id, lines: ['rec', 'ret'], range: [lo, hi], marks, card: { q: `max(${got.join(', ')})`, a: `= ${best}`, tone: 'yes' }, title: `"${piece}" → ${best}`, text: 'A valid substring lies entirely inside one piece, so the best of the pieces is the answer for the range.', calc: [`max(${got.join(', ')}) = ${best}`] });
    return best;
  };
  const ans = solve(root);
  snap({ kind: 'done', cur: null, lines: [], range: [0, s.length], marks: {}, title: `Answer: ${ans}`, text: 'Inside a piece, a letter that was rare in the range is gone completely, so every level of cutting removes at least one of the 26 letters: at most 26 levels, O(n) work each.', calc: [`longest = ${ans}`], answer: String(ans) });
  return steps;
}

// ---------------------------------------------------------------- choose the last operation

export function tokenize(expr) {
  return expr.match(/\d+|[+\-*]/g) ?? [];
}

function opsSteps(expr) {
  const toks = tokenize(expr);
  const { nodes, steps, snap, add } = recorder();
  const text = (lo, hi) => toks.slice(lo, hi).join('');
  const show = (lo, hi) => toks.slice(lo, hi).map((t) => SYM[t] ?? t).join(' ');
  const memo = new Map();
  const root = add(0, show(0, toks.length), { lo: 0, hi: toks.length });
  nodes.push(root);
  snap({
    kind: 'start', cur: null, lines: [], range: [0, toks.length], marks: {},
    title: `Every grouping of ${show(0, toks.length)}`,
    text: 'Any grouping applies one operator last. Choose it, and the expression falls into a left part and a right part whose results can be found on their own: then combine every left result with every right result.',
    calc: [`${toks.filter((t) => SYM[t]).length} operators to try as "last"`],
  });
  const ways = (node) => {
    const { lo, hi } = node;
    const key = text(lo, hi);
    node.state = 'run';
    if (hi - lo === 1) {
      const v = [Number(toks[lo])];
      node.state = 'done'; node.res = arr(v);
      snap({ kind: 'number', cur: node.id, lines: ['sig', 'num'], range: [lo, hi], marks: { [lo]: 'hit' }, card: { q: toks[lo], a: 'a plain number', tone: 'yes' }, title: `${toks[lo]} is just a number`, text: 'No operator, so there is exactly one way to read it.', calc: [`ways("${key}") = ${arr(v)}`] });
      return v;
    }
    if (memo.has(key)) {
      const v = memo.get(key);
      node.state = 'memo'; node.res = arr(v);
      snap({ kind: 'memo', cur: node.id, lines: ['sig', 'memo'], range: [lo, hi], marks: {}, card: { q: show(lo, hi), a: `seen before → ${arr(v)}`, tone: 'no' }, title: `${show(lo, hi)} was already solved`, text: 'The same sub-expression turned up under a different split. Its list of results is in the memo, so it is reused instead of worked out again.', calc: [`memo["${key}"] = ${arr(v)}`] });
      return v;
    }
    const res = [];
    const many = hi - lo > 3;
    for (let i = lo + 1; i < hi; i += 2) {
      const op = toks[i];
      const which = many ? `the ${ORD[(i - lo - 1) / 2]} operator (${SYM[op]})` : `the ${SYM[op]}`;
      const l = add(node.depth + 1, show(lo, i), { lo, hi: i, via: `left of ${SYM[op]}` });
      const r = add(node.depth + 1, show(i + 1, hi), { lo: i + 1, hi, via: `right of ${SYM[op]}` });
      insertChildren(nodes, node, [l, r]);
      node.state = 'run';
      snap({
        kind: 'split', cur: node.id, lines: ['split'], range: [lo, hi], marks: { [i]: 'target' },
        card: { q: `${SYM[op]} last`, a: `(${show(lo, i)})  ${SYM[op]}  (${show(i + 1, hi)})`, tone: 'info' },
        title: `${show(lo, hi)}: apply ${which} last`,
        text: `If this ${SYM[op]} is the last operation, everything to its left is grouped somehow, and so is everything to its right. Find all results of each side first.`,
        calc: [`left = ${show(lo, i)}`, `right = ${show(i + 1, hi)}`],
      });
      const xs = ways(l);
      const ys = ways(r);
      const made = [];
      for (const x of xs) for (const y of ys) made.push([x, y, apply(op, x, y)]);
      res.push(...made.map((m) => m[2]));
      node.state = 'run';
      snap({
        kind: 'combine', cur: node.id, lines: ['rec', 'combine'], range: [lo, hi], marks: { [i]: 'target' },
        card: { q: `${arr(xs)} ${SYM[op]} ${arr(ys)}`, a: `→ ${arr(made.map((m) => m[2]))}`, tone: 'yes' },
        title: `${show(lo, hi)}: combine the two sides of ${which}`,
        text: `Every left result meets every right result: ${xs.length} left result${xs.length === 1 ? '' : 's'} times ${ys.length} right result${ys.length === 1 ? '' : 's'} gives ${made.length} value${made.length === 1 ? '' : 's'} for this split.`,
        calc: [...made.map(([x, y, z]) => `${x} ${SYM[op]} ${y < 0 ? `(${y})` : y} = ${z}`), `results so far: ${arr(res)}`],
      });
    }
    memo.set(key, res);
    node.state = 'done'; node.res = arr(res);
    snap({ kind: 'store', cur: node.id, lines: ['store'], range: [lo, hi], marks: {}, card: { q: show(lo, hi), a: `→ ${arr(res)}`, tone: 'yes' }, title: `${show(lo, hi)} → ${arr(res)}`, text: 'Every operator has had its turn as the last one. Save the list in the memo, in case the same sub-expression appears again.', calc: [`memo["${key}"] = ${arr(res)}`] });
    return res;
  };
  const ans = ways(root);
  snap({ kind: 'done', cur: null, lines: [], range: [0, toks.length], marks: {}, title: `All ${ans.length} results: ${arr(ans)}`, text: 'One value per grouping, duplicates kept: two groupings that give the same number both count.', calc: [`results = ${arr(ans)}`], answer: arr(ans) });
  return steps;
}

export function divide(input) {
  if (input.mode === 'merge') return mergeSteps(input.vals);
  if (input.mode === 'bad') return badSteps(input.s, input.k);
  return opsSteps(input.expr);
}

/** Reference answers, for the checks. */
export function divideAnswer(input) {
  if (input.mode === 'merge') return arr([...input.vals].sort((a, b) => a - b));
  if (input.mode === 'bad') {
    const { s, k } = input;
    let best = 0;
    for (let i = 0; i < s.length; i++) {
      const c = {};
      for (let j = i; j < s.length; j++) { c[s[j]] = (c[s[j]] ?? 0) + 1; if (Object.values(c).every((x) => x >= k)) best = Math.max(best, j - i + 1); }
    }
    return String(best);
  }
  const toks = tokenize(input.expr);
  const go = (lo, hi) => {
    if (hi - lo === 1) return [Number(toks[lo])];
    const out = [];
    for (let i = lo + 1; i < hi; i += 2) for (const x of go(lo, i)) for (const y of go(i + 1, hi)) out.push(apply(toks[i], x, y));
    return out;
  };
  return arr(go(0, toks.length));
}

export function parseDivide(values, input) {
  if (input.mode === 'merge') {
    const vals = (values.vals ?? '').split(/[\s,→>-]+/).filter(Boolean).map(Number);
    if (!vals.length || vals.some((v) => !Number.isInteger(v) || Math.abs(v) > 999)) return { error: 'Enter whole numbers between −999 and 999, separated by commas.' };
    if (vals.length > LIMITS.merge) return { error: `Up to ${LIMITS.merge} nodes, so the outline stays readable.` };
    return { input: { mode: 'merge', vals } };
  }
  if (input.mode === 'bad') {
    const s = (values.s ?? '').trim().replace(/^"|"$/g, '');
    const k = Number(values.k);
    if (!/^[a-z]+$/.test(s)) return { error: 'Use lowercase letters only.' };
    if (s.length > LIMITS.bad) return { error: `Up to ${LIMITS.bad} letters.` };
    if (!Number.isInteger(k) || k < 1 || k > 9) return { error: 'k must be a whole number from 1 to 9.' };
    return { input: { mode: 'bad', s, k } };
  }
  const expr = (values.expr ?? '').replace(/\s+/g, '').replace(/^"|"$/g, '').replace(/[−]/g, '-').replace(/[×x]/g, '*');
  if (!/^\d{1,2}([+\-*]\d{1,2})*$/.test(expr)) return { error: 'Numbers 0–99 joined by +, − or ×, like 2*3-4*5.' };
  if (tokenize(expr).length > 2 * LIMITS.ops + 1) return { error: `Up to ${LIMITS.ops} operators: the number of groupings grows fast.` };
  return { input: { mode: 'ops', expr } };
}

export function randomDivide(input, rand = Math.random) {
  const int = (a, b) => a + Math.floor(rand() * (b - a + 1));
  if (input.mode === 'merge') return { mode: 'merge', vals: Array.from({ length: int(2, 7) }, () => int(-9, 20)) };
  if (input.mode === 'bad') {
    const k = int(2, 3);
    const letters = 'abcd'.slice(0, int(2, 4));
    return { mode: 'bad', s: Array.from({ length: int(5, 12) }, () => letters[int(0, letters.length - 1)]).join(''), k };
  }
  const n = int(2, 4);
  let e = String(int(1, 9));
  for (let i = 1; i < n; i++) e += '+-*'[int(0, 2)] + int(1, 9);
  return { mode: 'ops', expr: e };
}
