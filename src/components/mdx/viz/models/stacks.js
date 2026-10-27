/**
 * Stack and monotonic-stack step-throughs (models for <BracketsViz>, <AsteroidViz>, <NextGreaterViz>,
 * <HistogramViz> and <SlidingMaxViz>). Pure, so scripts/viz-check.mjs can test them.
 */
import { list, parseInt1, parseInts, plural, q, rng } from './util.js';

// ---------------------------------------------------------------- valid brackets

export const BRACKETS = {
  valid: { label: 'Valid', input: { s: '{[()]()}' } },
  crossed: { label: 'Crossed', input: { s: '([)]' } },
  unclosed: { label: 'Never closed', input: { s: '(()' } },
  stray: { label: 'Stray closer', input: { s: '())(' } },
};

export const CLOSER = { '(': ')', '[': ']', '{': '}' };

export const bracketsCode = [
  ['open', 'if (c is an opener) stack.push(its closer);      // remember what must come next'],
  ['empty', 'else if (stack.isEmpty()) return false;          // a closer with nothing open'],
  ['pop', 'else if (stack.pop() != c) return false;         // it must close the newest one'],
  ['end', 'return stack.isEmpty();                          // anything left was never closed'],
];

export function isValidBrackets(s) {
  const st = [];
  for (const c of s) {
    if (CLOSER[c]) st.push(CLOSER[c]);
    else if (!st.length || st.pop() !== c) return false;
  }
  return st.length === 0;
}

export function brackets({ s }) {
  const chars = [...s];
  const stack = [];                         // { id, open, close }
  const state = chars.map(() => 'todo');    // todo | open | matched | bad
  const pairs = [];                         // [opener index, closer index] matched so far
  const steps = [];
  const snap = (x) => steps.push({ chars, stack: stack.map((p) => ({ ...p })), state: [...state], pairs: pairs.map((p) => [...p]), ...x });
  snap({
    kind: 'start', i: null, lines: [],
    title: `Is ${q(s)} balanced?`,
    text: 'Read left to right. Every opener pushes the closer it now expects onto a stack, like a plate on a pile. A closer must match the plate on top: the most recently opened bracket has to close first.',
    calc: [`${chars.length} characters`, 'stack: empty'],
  });
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if (CLOSER[c]) {
      stack.push({ id: i, open: c, close: CLOSER[c] });
      state[i] = 'open';
      snap({
        kind: 'push', i, pushed: i, lines: ['open'],
        title: `${q(c)} opens: push ${q(CLOSER[c])}`,
        text: `${q(c)} at index ${i} opens a bracket, so the next closer that ends it must be ${q(CLOSER[c])}. Push that expectation on top of the stack. ${stack.length > 1 ? `It sits on top of ${plural(stack.length - 1, 'older expectation')}: this bracket has to close before them.` : 'The stack was empty, so this is the only thing waiting.'}`,
        calc: [`push ${q(CLOSER[c])}`, `stack (top last): ${list(stack.map((p) => p.close))}`],
      });
      continue;
    }
    if (!stack.length) {
      state[i] = 'bad';
      snap({
        kind: 'fail', i, lines: ['empty'], answer: `not valid: ${q(c)} at ${i} closes nothing`,
        title: `${q(c)} has nothing to close`,
        text: `${q(c)} at index ${i} is a closer, but the stack is empty: no bracket is open. The string can't be balanced, so stop here.`,
        calc: ['stack is empty', 'return false'],
      });
      return steps;
    }
    const top = stack.pop();
    if (top.close === c) {
      state[i] = 'matched';
      state[top.id] = 'matched';
      pairs.push([top.id, i]);
      snap({
        kind: 'match', i, popped: top.id, pair: [top.id, i], lines: ['pop'],
        title: `${q(c)} matches the top: pop`,
        text: `The top of the stack expects ${q(top.close)} (it closes the ${q(top.open)} at index ${top.id}), and ${q(c)} is exactly that. Pop it: that pair is done${stack.length ? `, and the next expectation, ${q(stack.at(-1).close)}, is back on top` : ''}.`,
        calc: [`top ${q(top.close)} == ${q(c)} ✓`, `stack: ${list(stack.map((p) => p.close))}`],
      });
      continue;
    }
    state[i] = 'bad';
    state[top.id] = 'bad';
    snap({
      kind: 'fail', i, popped: top.id, pair: [top.id, i], lines: ['pop'], answer: `not valid: expected ${q(top.close)} at ${i}`,
      title: `${q(c)} doesn't match the top ${q(top.close)}`,
      text: `The newest open bracket is the ${q(top.open)} at index ${top.id}, so the next closer must be ${q(top.close)}. ${q(c)} tries to close an older bracket while ${q(top.open)} is still open: the brackets cross. Stop: not valid.`,
      calc: [`top ${q(top.close)} != ${q(c)} ✗`, 'return false'],
    });
    return steps;
  }
  const ok = stack.length === 0;
  for (const p of stack) state[p.id] = 'bad';
  snap({
    kind: ok ? 'valid' : 'fail', i: null, lines: ['end'], answer: ok ? 'valid' : `not valid: ${plural(stack.length, 'bracket')} never closed`,
    title: ok ? 'The stack is empty: valid' : `End of string, ${plural(stack.length, 'bracket')} still open`,
    text: ok
      ? 'Every opener was closed by the right closer, newest first, and nothing is left waiting. The string is balanced.'
      : `The string ended while the stack still expects ${list(stack.map((p) => q(p.close)))}. ${stack.map((p) => `${q(p.open)} at index ${p.id}`).join(' and ')} never got closed, so it's not valid.`,
    calc: [`stack: ${list(stack.map((p) => p.close))}`, `return ${ok}`],
  });
  return steps;
}

export function parseBrackets(values) {
  const s = String(values.s ?? '').replace(/\s+/g, '');
  if (!s.length) return { error: 'Type some brackets, such as ({[]}).' };
  if (s.length > 14) return { error: 'Use at most 14 brackets so every cell stays readable.' };
  if (/[^()[\]{}]/.test(s)) return { error: 'Only the characters ( ) [ ] { } please.' };
  return { input: { s } };
}

export function randomBrackets(rand = Math.random) {
  const g = rng(rand);
  const build = (depth) => {
    let out = '';
    while (out.length < 10 && g.bool(0.6)) {
      const o = g.pick(['(', '[', '{']);
      out += o + (depth < 2 && g.bool(0.5) ? build(depth + 1) : '') + CLOSER[o];
    }
    return out;
  };
  let s = build(0) || '([]{})';
  if (g.bool(0.5)) {
    const k = g.int(0, s.length - 1);
    const swap = g.pick([')', ']', '}', '(']);
    s = s.slice(0, k) + swap + s.slice(k + 1);
  }
  return { s: s.slice(0, 14) };
}

// ---------------------------------------------------------------- asteroid collision

export const ASTEROIDS = {
  basic: { label: '5, 10, −5', input: { a: [5, 10, -5] } },
  equal: { label: '8, −8', input: { a: [8, -8] } },
  chain: { label: '10, 2, −5', input: { a: [10, 2, -5] } },
  apart: { label: 'Never meet', input: { a: [-2, -1, 1, 2] } },
  big: { label: 'A big one', input: { a: [3, 4, 5, -9, 2] } },
};

export const asteroidCode = [
  ['loop', 'while (a < 0 && top > 0) {                // a heads left into a right-mover'],
  ['smaller', '  if (top < -a) stack.pop();               // top is smaller: it explodes, keep going'],
  ['equal', '  else { if (top == -a) stack.pop();       // equal: both explode'],
  ['bigger', '         alive = false; }                 // otherwise a explodes'],
  ['push', 'if (alive) stack.push(a);'],
];

export function asteroidAnswer(a) {
  const st = [];
  for (const x of a) {
    let alive = true;
    while (alive && x < 0 && st.length && st.at(-1) > 0) {
      if (st.at(-1) < -x) st.pop();
      else { if (st.at(-1) === -x) st.pop(); alive = false; }
    }
    if (alive) st.push(x);
  }
  return st;
}

const dir = (v) => (v > 0 ? '→' : '←');

export function asteroids({ a }) {
  const rocks = a.map((v, id) => ({ id, v }));
  const stack = [];
  const gone = new Set();
  const steps = [];
  const snap = (x) => steps.push({ rocks, stack: [...stack], gone: [...gone], ...x });
  snap({
    kind: 'start', cur: null, lines: [],
    title: 'Asteroids in a row',
    text: 'Each number is an asteroid: its size, and its sign is the direction (positive flies right →, negative flies left ←), all at the same speed. When two meet, the smaller explodes; equal sizes both explode. The stack holds the survivors so far, newest on the right.',
    calc: [`asteroids: ${list(a)}`, 'survivors: none yet'],
  });
  for (const r of rocks) {
    let alive = true;
    const why = (() => {
      if (r.v > 0) return `${r.v} flies right →, away from everything behind it, so it can't hit anything yet.`;
      if (!stack.length) return `${r.v} flies left ←, but there is nothing to its left: it gets away.`;
      const top = rocks[stack.at(-1)].v;
      if (top < 0) return `${r.v} flies left ←, and the nearest survivor (${top}) is flying left too: they never meet.`;
      return null;
    })();
    while (alive && r.v < 0 && stack.length && rocks[stack.at(-1)].v > 0) {
      const top = rocks[stack.at(-1)];
      const size = -r.v;
      if (top.v < size) {
        stack.pop();
        gone.add(top.id);
        snap({
          kind: 'boom', cur: r.id, hit: { left: top.id, right: r.id, lost: [top.id] }, lines: ['loop', 'smaller'],
          title: `${top.v} → ← ${r.v}: ${top.v} explodes`,
          text: `${r.v} flies left into the newest right-mover, ${top.v}. Size ${top.v} is smaller than ${size}, so ${top.v} explodes. ${r.v} keeps flying left and may hit the next one.`,
          calc: [`${top.v} < ${size}`, `pop ${top.v}`],
        });
        continue;
      }
      if (top.v === size) {
        stack.pop();
        gone.add(top.id);
        gone.add(r.id);
        alive = false;
        snap({
          kind: 'boom', cur: r.id, hit: { left: top.id, right: r.id, lost: [top.id, r.id] }, lines: ['loop', 'equal'],
          title: `${top.v} → ← ${r.v}: both explode`,
          text: `${top.v} and ${r.v} are the same size, so both explode. Nothing is pushed.`,
          calc: [`${top.v} == ${size}`, 'pop, and drop the newcomer'],
        });
        break;
      }
      gone.add(r.id);
      alive = false;
      snap({
        kind: 'boom', cur: r.id, hit: { left: top.id, right: r.id, lost: [r.id] }, lines: ['loop', 'bigger'],
        title: `${top.v} → ← ${r.v}: ${r.v} explodes`,
        text: `${r.v} meets ${top.v}, which is bigger. ${r.v} explodes and ${top.v} survives on top of the stack.`,
        calc: [`${top.v} > ${size}`, 'drop the newcomer'],
      });
    }
    if (alive) {
      stack.push(r.id);
      snap({
        kind: 'push', cur: r.id, lines: ['push'],
        title: `${r.v} survives: push`,
        text: why ?? `${r.v} destroyed everything flying towards it and has nothing left to hit. Push it as a survivor.`,
        calc: [`${r.v} ${dir(r.v)}`, `survivors: ${list(stack.map((id) => rocks[id].v))}`],
      });
    }
  }
  const out = stack.map((id) => rocks[id].v);
  snap({
    kind: 'done', cur: null, lines: [], answer: list(out),
    title: `Survivors: ${list(out)}`,
    text: `${out.length ? 'Left to right, these are the asteroids that never met a bigger one head-on.' : 'Every asteroid was destroyed.'} Each asteroid was pushed at most once and popped at most once, so the whole thing is O(n).`,
    calc: [`answer: ${list(out)}`],
  });
  return steps;
}

export function parseAsteroids(values) {
  const r = parseInts(values.a, { min: -20, max: 20, minLen: 1, maxLen: 8, name: 'asteroids' });
  if (r.error) return r;
  if (r.arr.includes(0)) return { error: 'Asteroids are never 0: use a positive (→) or negative (←) size.' };
  return { input: { a: r.arr } };
}

export function randomAsteroids(rand = Math.random) {
  const g = rng(rand);
  return { a: Array.from({ length: g.int(4, 7) }, () => (g.bool(0.55) ? 1 : -1) * g.int(1, 12)) };
}

// ---------------------------------------------------------------- next greater (monotonic stack)

export const MONO = {
  nge: { label: 'Next greater', input: { mode: 'nge', a: [2, 1, 2, 4, 3] } },
  temps: { label: 'Daily temperatures', input: { mode: 'temps', a: [73, 74, 75, 71, 69, 72, 76, 73] } },
  nse: { label: 'Next smaller', input: { mode: 'nse', a: [4, 8, 5, 2, 25] } },
};

export const monoCode = (mode) => [
  ['loop', 'for (int i = 0; i < n; i++) {'],
  ['pop', mode === 'nse'
    ? '  while (!stack.isEmpty() && a[stack.peek()] > a[i])   // a[i] is smaller'
    : '  while (!stack.isEmpty() && a[stack.peek()] < a[i])   // a[i] is greater'],
  ['answer', mode === 'temps' ? '    { int j = stack.pop(); ans[j] = i - j; }         // days waited' : '    ans[stack.pop()] = a[i];                          // its answer'],
  ['push', '  stack.push(i);                                        // i waits for its answer'],
  ['rest', '}   // still on the stack: no answer (' + (mode === 'temps' ? '0' : '-1') + ')'],
];

export function monoAnswer({ mode, a }) {
  return a.map((v, i) => {
    for (let j = i + 1; j < a.length; j++) if (mode === 'nse' ? a[j] < v : a[j] > v) return mode === 'temps' ? j - i : a[j];
    return mode === 'temps' ? 0 : -1;
  });
}

export function mono({ mode, a }) {
  const n = a.length;
  const stack = [];
  const ans = a.map(() => null);
  const arrows = [];
  const steps = [];
  const word = mode === 'nse' ? 'smaller' : mode === 'temps' ? 'warmer' : 'greater';
  const beats = (x, y) => (mode === 'nse' ? x < y : x > y);
  const snap = (x) => steps.push({ a, stack: [...stack], ans: [...ans], arrows: arrows.map((r) => ({ ...r })), ...x });
  snap({
    kind: 'start', i: null, lines: [],
    title: mode === 'temps' ? 'How many days until a warmer day?' : `The next ${word} element, for every element`,
    text: `Walk left to right. The stack holds the elements still waiting for their next ${word} value. When a new element arrives, it answers every waiting element it beats, newest first. Then it joins the waiting line itself. Because the beaten ones always leave, the waiting values stay ${mode === 'nse' ? 'increasing' : 'decreasing'} from bottom to top.`,
    calc: [`a = ${list(a)}`, 'waiting: none'],
  });
  for (let i = 0; i < n; i++) {
    while (stack.length && beats(a[i], a[stack.at(-1)])) {
      const j = stack.pop();
      ans[j] = mode === 'temps' ? i - j : a[i];
      arrows.forEach((r) => { r.old = true; });
      arrows.push({ from: j, to: i, label: mode === 'temps' ? `${i - j}d` : String(a[i]) });
      snap({
        kind: 'pop', i, popped: j, lines: ['loop', 'pop', 'answer'],
        title: mode === 'temps' ? `Day ${i} (${a[i]}°) is warmer than day ${j} (${a[j]}°): ${i - j} day${i - j === 1 ? '' : 's'}` : `${a[i]} is the next ${word} for ${a[j]}`,
        text: `${a[j]} (index ${j}) is on top of the waiting stack, and ${a[i]} ${mode === 'nse' ? 'is smaller' : mode === 'temps' ? 'is warmer' : 'is greater'}. Nothing between them could be the answer (those were already answered or are still waiting below), so ${a[i]} is ${a[j]}'s answer${mode === 'temps' ? `: ${i} − ${j} = ${i - j}` : ''}. Pop it, and check the next one down.`,
        calc: [`${a[i]} ${mode === 'nse' ? '<' : '>'} ${a[j]} ✓`, `ans[${j}] = ${ans[j]}`],
      });
    }
    const top = stack.length ? stack.at(-1) : null;
    stack.push(i);
    arrows.forEach((r) => { r.old = true; });
    snap({
      kind: 'push', i, pushed: i, lines: ['loop', 'push'],
      title: `${a[i]} waits`,
      text: `${top === null ? 'The stack is empty, so there is nothing to answer.' : `The top, ${a[top]}, is not ${mode === 'nse' ? 'bigger than' : 'smaller than'} ${a[i]}${a[top] === a[i] ? ' (equal does not count)' : ''}, so it keeps waiting, and so does everything below it.`} ${a[i]} has no answer yet either: push index ${i} onto the stack.`,
      calc: [top === null ? 'stack empty' : `${a[i]} ${mode === 'nse' ? '<' : '>'} ${a[top]}? no`, `waiting: ${list(stack.map((k) => a[k]))}`],
    });
  }
  const left = [...stack];
  for (const j of left) ans[j] = mode === 'temps' ? 0 : -1;
  arrows.forEach((r) => { r.old = true; });
  snap({
    kind: 'done', i: null, lines: ['rest'], leftover: left, answer: list(ans),
    title: `Answers: ${list(ans)}`,
    text: `${left.length ? `${left.map((k) => a[k]).join(', ')} never found a ${word} value to the right, so ${left.length === 1 ? 'it gets' : 'they get'} ${mode === 'temps' ? '0' : '−1'}.` : 'Every element found its answer.'} Every index was pushed once and popped at most once: O(n), even though there is a loop inside the loop.`,
    calc: [`ans = ${list(ans)}`],
  });
  return steps;
}

export function parseMono(values, input) {
  const r = parseInts(values.a, { min: input.mode === 'temps' ? 30 : 0, max: 99, minLen: 2, maxLen: 10, name: input.mode === 'temps' ? 'temperatures' : 'a' });
  return r.error ? r : { input: { mode: input.mode, a: r.arr } };
}

export function randomMono(input, rand = Math.random) {
  const g = rng(rand);
  const n = g.int(5, 9);
  return { mode: input.mode, a: Array.from({ length: n }, () => (input.mode === 'temps' ? g.int(60, 80) : g.int(1, 20))) };
}

// ---------------------------------------------------------------- largest rectangle in a histogram

export const HISTOGRAM = {
  classic: { label: '2, 1, 5, 6, 2, 3', input: { h: [2, 1, 5, 6, 2, 3] } },
  rising: { label: 'Rising', input: { h: [2, 4] } },
  mixed: { label: '6, 2, 5, 4, 5, 1, 6', input: { h: [6, 2, 5, 4, 5, 1, 6] } },
};

export const histogramCode = [
  ['loop', 'for (int i = 0; i <= n; i++) {  int cur = i == n ? 0 : h[i];   // a 0 at the end flushes all'],
  ['pop', '  while (!stack.isEmpty() && h[stack.peek()] >= cur) {'],
  ['area', '    int height = h[stack.pop()];  int left = stack.isEmpty() ? -1 : stack.peek();'],
  ['best', '    best = max(best, height * (i - left - 1)); }   // between the two smaller bars'],
  ['push', '  stack.push(i); }'],
];

export function histogramAnswer(h) {
  let best = 0;
  for (let i = 0; i < h.length; i++) {
    let m = Infinity;
    for (let j = i; j < h.length; j++) { m = Math.min(m, h[j]); best = Math.max(best, m * (j - i + 1)); }
  }
  return best;
}

export function histogram({ h }) {
  const n = h.length;
  const stack = [];
  let best = 0;
  let bestRect = null;
  const steps = [];
  const snap = (x) => steps.push({ h, stack: [...stack], best, bestRect: bestRect && { ...bestRect }, ...x });
  snap({
    kind: 'start', i: null, rect: null, lines: [],
    title: 'The largest rectangle under the bars',
    text: 'For each bar, the widest rectangle that uses it as the shortest bar stretches left and right until it meets a shorter bar. Keep a stack of bars whose heights increase. When a shorter bar arrives, every taller bar on the stack has found its right edge, and the bar below it on the stack is its left edge.',
    calc: [`heights ${list(h)}`, 'best = 0'],
  });
  for (let i = 0; i <= n; i++) {
    const cur = i === n ? 0 : h[i];
    while (stack.length && h[stack.at(-1)] >= cur) {
      const j = stack.pop();
      const height = h[j];
      const left = stack.length ? stack.at(-1) : -1;
      const width = i - left - 1;
      const area = height * width;
      const better = area > best;
      if (better) { best = area; bestRect = { from: left + 1, to: i - 1, height, area }; }
      snap({
        kind: 'pop', i, popped: j, rect: { from: left + 1, to: i - 1, height, area }, better, lines: ['loop', 'pop', 'area', 'best'],
        title: `Bar ${height} (index ${j}) is finished: ${height} × ${width} = ${area}`,
        text: `${i === n ? 'The imaginary 0 bar after the end' : `Bar ${cur} at index ${i}`} is not taller than ${height}, so bar ${j} can't stretch further right. To the left, ${left === -1 ? 'nothing on the stack is shorter, so it stretches to the very start' : `the bar under it on the stack (index ${left}, height ${h[left]}) is shorter, so it stops there`}. Width ${i} − ${left} − 1 = ${width}. ${better ? `${area} is the best so far.` : `${area} doesn't beat ${best}.`}`,
        calc: [`height ${height}, width ${width}`, `area ${area}${better ? ' → new best' : ` ≤ best ${best}`}`],
      });
    }
    if (i < n) {
      stack.push(i);
      snap({
        kind: 'push', i, pushed: i, rect: null, lines: ['loop', 'push'],
        title: `Bar ${h[i]} joins the stack`,
        text: `${stack.length > 1 ? `Bar ${h[i]} is taller than the top, ${h[stack.at(-2)]}, so it` : 'The stack is empty, so bar ' + h[i]} can't be finished yet: its right edge is still unknown. Push it. The heights on the stack keep increasing.`,
        calc: [`stack heights: ${list(stack.map((k) => h[k]))}`],
      });
    }
  }
  snap({
    kind: 'done', i: null, rect: null, lines: [], answer: `largest area = ${best}`,
    title: `Largest rectangle: ${best}`,
    text: `${bestRect ? `It is ${bestRect.height} tall and spans bars ${bestRect.from} to ${bestRect.to}.` : ''} The 0 at the end (dashed) forced every remaining bar off the stack, so no cleanup loop was needed. Every bar is pushed and popped once: O(n).`,
    calc: [`best = ${best}`],
  });
  return steps;
}

export function parseHistogram(values) {
  const r = parseInts(values.h, { min: 0, max: 12, minLen: 1, maxLen: 9, name: 'heights' });
  return r.error ? r : { input: { h: r.arr } };
}

export function randomHistogram(rand = Math.random) {
  const g = rng(rand);
  return { h: Array.from({ length: g.int(4, 8) }, () => g.int(1, 9)) };
}

// ---------------------------------------------------------------- sliding window maximum (monotonic deque)

export const SLIDE = {
  mixed: { label: 'Mixed', input: { a: [1, 3, -1, -3, 5, 3, 6, 7], k: 3 } },
  falling: { label: 'Falling', input: { a: [9, 8, 7, 6, 5], k: 2 } },
  rising: { label: 'Rising', input: { a: [1, 2, 3, 4, 5], k: 3 } },
};

export const slideCode = [
  ['front', 'if (dq.peekFirst() <= i - k) dq.pollFirst();       // the front left the window'],
  ['back', 'while (a[dq.peekLast()] <= a[i]) dq.pollLast();    // can never be the max again'],
  ['push', 'dq.offerLast(i);'],
  ['out', 'if (i >= k - 1) out.add(a[dq.peekFirst()]);        // the front is the max'],
];

export function slideAnswer({ a, k }) {
  const out = [];
  for (let i = 0; i + k <= a.length; i++) out.push(Math.max(...a.slice(i, i + k)));
  return out;
}

export function slide({ a, k }) {
  const dq = [];
  const out = [];
  const steps = [];
  const snap = (x) => steps.push({ a, k, dq: [...dq], out: [...out], ...x });
  snap({
    kind: 'start', i: null, lines: [],
    title: `The maximum of every window of ${k}`,
    text: `A deque (a queue you can use from both ends) holds indexes whose values decrease from front to back, so the front is always the window's maximum. A new value throws out every smaller value at the back: they are older and smaller, so they can never be the maximum again. The front leaves when it slides out of the window.`,
    calc: [`a = ${list(a)}, k = ${k}`],
  });
  for (let i = 0; i < a.length; i++) {
    const lo = Math.max(0, i - k + 1);
    if (dq.length && dq[0] <= i - k) {
      const j = dq.shift();
      snap({
        kind: 'front', i, dropped: [j], window: [lo, i], lines: ['front'],
        title: `${a[j]} slid out of the window`,
        text: `The window is now indexes ${lo}–${i}. The front of the deque, index ${j} (${a[j]}), is outside it, so it leaves from the front.`,
        calc: [`${j} ≤ ${i} − ${k}`, `deque: ${list(dq.map((x) => a[x]))}`],
      });
    }
    const gone = [];
    while (dq.length && a[dq.at(-1)] <= a[i]) gone.push(dq.pop());
    if (gone.length) {
      snap({
        kind: 'back', i, dropped: gone, window: [lo, i], lines: ['back'],
        title: `${a[i]} pushes out ${gone.map((j) => a[j]).join(', ')}`,
        text: `${gone.map((j) => a[j]).join(', ')} ${gone.length === 1 ? 'is' : 'are'} not bigger than ${a[i]} and will leave the window before it does. While ${a[i]} is around, they can never be a maximum, so they leave from the back.`,
        calc: [`${gone.map((j) => a[j]).join(', ')} ≤ ${a[i]}`, `deque: ${list(dq.map((x) => a[x]))}`],
      });
    }
    dq.push(i);
    const full = i >= k - 1;
    if (full) out.push(a[dq[0]]);
    snap({
      kind: full ? 'out' : 'push', i, pushed: i, window: [lo, i], lines: full ? ['push', 'out'] : ['push'],
      title: full ? `Window ${lo}–${i}: max ${a[dq[0]]}` : `${a[i]} joins the deque`,
      text: `${a[i]} joins at the back. The deque reads ${list(dq.map((x) => a[x]))} from front to back, still decreasing.${full ? ` The window ${list(a.slice(lo, i + 1))} is full, and its maximum is simply the front: ${a[dq[0]]}.` : ` The window isn't full yet (${i + 1} of ${k}).`}`,
      calc: [`deque: ${list(dq.map((x) => a[x]))}`, ...(full ? [`out += ${a[dq[0]]}`] : [])],
    });
  }
  snap({
    kind: 'done', i: null, window: null, lines: [], answer: list(out),
    title: `Window maxima: ${list(out)}`,
    text: 'Each index entered the deque once and left at most once, so this is O(n), against O(n·k) for checking every window, or O(n log k) with a heap.',
    calc: [`out = ${list(out)}`],
  });
  return steps;
}

export function parseSlide(values) {
  const r = parseInts(values.a, { min: -20, max: 20, minLen: 2, maxLen: 10, name: 'a' });
  if (r.error) return r;
  const k = parseInt1(values.k, { min: 1, max: r.arr.length, name: 'k' });
  return k.error ? k : { input: { a: r.arr, k: k.v } };
}

export function randomSlide(rand = Math.random) {
  const g = rng(rand);
  const a = Array.from({ length: g.int(6, 10) }, () => g.int(-5, 12));
  return { a, k: g.int(2, 4) };
}
