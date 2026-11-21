/**
 * Read the input left to right with a stack of what is still pending (the model behind <TokenStackViz>).
 * One step per token: what it does to the stack, and why. Pure, so scripts/viz-check.mjs can test it.
 *
 * Modes:
 *   dups       cancel a letter against the top when they are equal       (Remove All Adjacent Duplicates)
 *   backspace  type both strings, '#' pops; compare                       (Backspace String Compare)
 *   baseball   scores on a stack; C pops, D doubles, + adds the top two   (Baseball Game)
 *   rpn        numbers push, an operator pops two and pushes the result   (Evaluate Reverse Polish Notation)
 *   path       directory names; '..' pops, '.' and empty parts are skipped (Simplify Path)
 *   calc       signed terms; * and / change the top term, sum at the end  (Basic Calculator II)
 *   decode     on '[' save (text, k), on ']' repeat and join              (Decode String)
 *   lvp        indexes with a base below every run                        (Longest Valid Parentheses)
 *   fleet      arrival times, closest car first; slower times start fleets (Car Fleet)
 * A step: { kind, title, text, calc, lines, tokens, i, stack: [{ id, main, sub?, tone?, isNew? }], leaving?,
 *           card?, stats, marks?, band?, depth, answer? }
 */
import { parseInt1, parseInts, rng } from './util.js';

export const TOKEN_STACK = {
  dups: { label: '"abbaca"', input: { mode: 'dups', s: 'abbaca' } },
  backspace: { label: '"ab#c" vs "ad#c"', input: { mode: 'backspace', s: 'ab#c', t: 'ad#c' } },
  baseball: { label: '5 2 C D +', input: { mode: 'baseball', ops: ['5', '2', 'C', 'D', '+'] } },
  rpn: { label: '2 1 + 3 *', input: { mode: 'rpn', tokens: ['2', '1', '+', '3', '*'] } },
  path: { label: '/a/./b/../../c/', input: { mode: 'path', path: '/a/./b/../../c/' } },
  calc: { label: '3+2*2', input: { mode: 'calc', s: '3+2*2' } },
  decode: { label: '3[a2[c]]', input: { mode: 'decode', s: '3[a2[c]]' } },
  lvp: { label: '")()())"', input: { mode: 'lvp', s: ')()())' } },
  fleet: { label: 'target 12', input: { mode: 'fleet', target: 12, position: [10, 8, 0, 5, 3], speed: [2, 4, 1, 1, 3] } },
};

export const tokenStackCode = {
  dups: [
    ['init', 'StringBuilder st = new StringBuilder();   // used as a stack: the end is the top'],
    ['loop', 'for (char c : s.toCharArray()) {'],
    ['cancel', '    if (st.length() > 0 && st.charAt(st.length() - 1) == c) st.deleteCharAt(st.length() - 1);'],
    ['push', '    else st.append(c);'],
    ['end', '}'],
    ['ret', 'return st.toString();'],
  ],
  backspace: [
    ['sig', 'String type(String s) {'],
    ['loop', '    for (char c : s.toCharArray())'],
    ['back', '        if (c == \'#\') { if (!st.isEmpty()) st.pop(); }   // backspace'],
    ['push', '        else st.push(c);'],
    ['ret', '    return the stack, bottom to top;'],
    ['end', '}'],
    ['cmp', 'return type(s).equals(type(t));'],
  ],
  baseball: [
    ['loop', 'for (String op : operations) {'],
    ['c', '    if (op.equals("C")) total -= st.pop();'],
    ['d', '    else if (op.equals("D")) { st.push(2 * st.peek()); total += st.peek(); }'],
    ['plus', '    else if (op.equals("+")) { int top = st.pop(), s = top + st.peek(); st.push(top); st.push(s); total += s; }'],
    ['num', '    else { st.push(Integer.parseInt(op)); total += st.peek(); }'],
    ['end', '}'],
    ['ret', 'return total;'],
  ],
  rpn: [
    ['loop', 'for (String t : tokens) {'],
    ['op', '    if (t is an operator) { int b = st.pop(), a = st.pop();   // b was on top: the right operand'],
    ['apply', '        st.push(apply(t, a, b)); }'],
    ['num', '    else st.push(Integer.parseInt(t));'],
    ['end', '}'],
    ['ret', 'return st.pop();'],
  ],
  path: [
    ['loop', 'for (String part : path.split("/")) {'],
    ['skip', '    if (part.isEmpty() || part.equals(".")) continue;'],
    ['up', '    if (part.equals("..")) { if (!st.isEmpty()) st.pop(); }'],
    ['push', '    else st.push(part);'],
    ['end', '}'],
    ['ret', 'return "/" + String.join("/", st);   // bottom to top'],
  ],
  calc: [
    ['init', 'char op = \'+\';   // the operator before the number being read'],
    ['loop', 'for (each number x in s, with the operator op before it) {'],
    ['add', '    if (op == \'+\') st.push(x);'],
    ['sub', '    else if (op == \'-\') st.push(-x);'],
    ['mul', '    else if (op == \'*\') st.push(st.pop() * x);'],
    ['div', '    else st.push(st.pop() / x);           // truncates toward zero'],
    ['end', '}'],
    ['ret', 'return the sum of st;'],
  ],
  decode: [
    ['init', 'String cur = ""; int k = 0;'],
    ['loop', 'for (char c : s.toCharArray()) {'],
    ['digit', '    if (Character.isDigit(c)) k = k * 10 + (c - \'0\');'],
    ['open', '    else if (c == \'[\') { st.push(new Frame(cur, k)); cur = ""; k = 0; }'],
    ['close', '    else if (c == \']\') { Frame f = st.pop(); cur = f.text + cur.repeat(f.k); }'],
    ['letter', '    else cur += c;'],
    ['end', '}'],
    ['ret', 'return cur;'],
  ],
  lvp: [
    ['init', 'st.push(-1); int best = 0;   // the bottom: the last index no valid run can cross'],
    ['loop', 'for (int i = 0; i < s.length(); i++) {'],
    ['open', '    if (s.charAt(i) == \'(\') st.push(i);'],
    ['pop', '    else { st.pop();'],
    ['base', '        if (st.isEmpty()) st.push(i);            // an unmatched ")": the new base'],
    ['len', '        else best = Math.max(best, i - st.peek()); }'],
    ['end', '}'],
    ['ret', 'return best;'],
  ],
  fleet: [
    ['sort', 'sort the cars by position, closest to target first;'],
    ['loop', 'for (each car) {'],
    ['time', '    double t = (double) (target - pos) / speed;   // its arrival time if alone'],
    ['merge', '    if (!st.isEmpty() && t <= st.peek()) continue;   // catches the fleet ahead: joins it'],
    ['push', '    st.push(t);                                       // can\'t catch up: a new fleet'],
    ['end', '}'],
    ['ret', 'return st.size();'],
  ],
};

const q = (s) => `"${s}"`;
const fmt = (x) => (Number.isInteger(x) ? String(x) : x.toFixed(2).replace(/0+$/, ''));
const trunc = (x) => (x < 0 ? Math.ceil(x) : Math.floor(x));
const OPS = { '+': (a, b) => a + b, '-': (a, b) => a - b, '*': (a, b) => a * b, '/': (a, b) => trunc(a / b) };
const SYM = { '+': '+', '-': '−', '*': '×', '/': '÷' };

function recorder(tokens) {
  const steps = [];
  let stack = [];
  let id = 0;
  const api = {
    steps,
    get stack() { return stack; },
    set stack(v) { stack = v; },
    item: (main, sub, tone) => ({ id: id++, main: String(main), ...(sub !== undefined ? { sub: String(sub) } : {}), ...(tone ? { tone } : {}) }),
    snap: (x) => steps.push({ tokens, i: null, stack: stack.map((s) => ({ ...s })), stats: [], ...x }),
  };
  return api;
}

function finish(steps) {
  const depth = Math.max(2, ...steps.map((s) => s.stack.length + (s.leaving ? 1 : 0)));
  steps.forEach((s) => { s.depth = depth; });
  return steps;
}

// ---------------------------------------------------------------- dups

function dupsRun({ s }) {
  const R = recorder(s.split(''));
  R.snap({ kind: 'start', lines: ['init'], title: `Remove adjacent pairs from ${q(s)}`, text: 'Build the answer left to right on a stack. A new letter equal to the top cancels it (the pair vanishes); otherwise it is kept. A cancel can expose an older letter, which the next letter may cancel in turn.', calc: ['stack = empty'], stats: [['kept', '""']] });
  s.split('').forEach((c, i) => {
    const top = R.stack.at(-1);
    if (top && top.main === c) {
      R.stack = R.stack.slice(0, -1);
      R.snap({ kind: 'cancel', i, leaving: { ...top, tone: 'danger' }, card: { q: `${c} = top ${top.main}`, a: 'equal → both vanish', tone: 'bad' }, lines: ['loop', 'cancel'], title: `${c} meets ${top.main} on top: the pair vanishes`, text: `Popping ${top.main} removes the pair. ${R.stack.length ? `The letter below, ${R.stack.at(-1).main}, is the top again and can still be cancelled by what comes next.` : 'The stack is empty again.'}`, calc: [`top was ${top.main}, c = ${c}`, `kept: ${q(R.stack.map((x) => x.main).join(''))}`], stats: [['kept', q(R.stack.map((x) => x.main).join(''))]] });
    } else {
      const it = R.item(c);
      R.stack = [...R.stack, it];
      R.snap({ kind: 'push', i, pushed: it.id, card: { q: `${c} vs top ${top ? top.main : '(empty)'}`, a: top ? 'different → keep it' : 'nothing to cancel → keep it', tone: 'info' }, lines: ['loop', 'push'], title: `Keep ${c}`, text: top ? `${c} differs from the top, ${top.main}, so it can't cancel: push it. It may be cancelled later by an equal letter.` : `The stack is empty: push ${c}.`, calc: [`push ${c}`, `kept: ${q(R.stack.map((x) => x.main).join(''))}`], stats: [['kept', q(R.stack.map((x) => x.main).join(''))]] });
    }
  });
  const out = R.stack.map((x) => x.main).join('');
  R.snap({ kind: 'done', lines: ['ret'], answer: q(out), title: `What is left: ${q(out)}`, text: 'Read the stack from bottom to top. Every letter was pushed and popped at most once: O(n).', calc: [`return ${q(out)}`], stats: [['kept', q(out)]] });
  return finish(R.steps);
}

// ---------------------------------------------------------------- backspace

function backspaceRun({ s, t }) {
  const R = recorder(s.split(''));
  const typed = [];
  const typeOne = (str, name) => {
    R.stack = [];
    const tokens = str.split('');
    R.snap({ kind: 'start', tokens, lines: ['sig'], title: `Type ${name} = ${q(str)}`, text: `A letter is typed (push); # deletes the last typed letter (pop), and does nothing in an empty editor.`, calc: [`${name} = ${q(str)}`], stats: [['screen', '""'], ...(typed.length ? [['s showed', q(typed[0])]] : [])] });
    tokens.forEach((c, i) => {
      const screen = () => q(R.stack.map((x) => x.main).join(''));
      if (c === '#') {
        const top = R.stack.at(-1);
        if (top) {
          R.stack = R.stack.slice(0, -1);
          R.snap({ kind: 'back', tokens, i, leaving: { ...top, tone: 'danger' }, card: { q: '#', a: `delete ${top.main}`, tone: 'bad' }, lines: ['loop', 'back'], title: `# deletes ${top.main}`, text: 'Backspace removes the most recently typed letter that is still on screen: the top of the stack.', calc: [`pop ${top.main}`, `screen: ${screen()}`], stats: [['screen', screen()], ...(typed.length ? [['s showed', q(typed[0])]] : [])] });
        } else {
          R.snap({ kind: 'noop', tokens, i, card: { q: '#', a: 'editor empty: nothing happens', tone: 'no' }, lines: ['loop', 'back'], title: '# on an empty editor does nothing', text: 'There is nothing to delete; popping an empty stack would be a bug, so check first.', calc: ['stack empty → skip'], stats: [['screen', screen()], ...(typed.length ? [['s showed', q(typed[0])]] : [])] });
        }
      } else {
        const it = R.item(c);
        R.stack = [...R.stack, it];
        R.snap({ kind: 'push', tokens, i, pushed: it.id, card: { q: c, a: 'type it', tone: 'info' }, lines: ['loop', 'push'], title: `Type ${c}`, text: `${c} goes on screen after everything typed so far: push it.`, calc: [`push ${c}`, `screen: ${screen()}`], stats: [['screen', screen()], ...(typed.length ? [['s showed', q(typed[0])]] : [])] });
      }
    });
    typed.push(R.stack.map((x) => x.main).join(''));
  };
  typeOne(s, 's');
  typeOne(t, 't');
  const same = typed[0] === typed[1];
  R.snap({ kind: 'done', tokens: t.split(''), lines: ['ret', 'cmp'], card: { q: `${q(typed[0])} vs ${q(typed[1])}`, a: same ? 'same text' : 'different', tone: same ? 'yes' : 'bad' }, answer: String(same), title: same ? `Both editors show ${q(typed[0])}` : `${q(typed[0])} ≠ ${q(typed[1])}`, text: `Compare the two screens. O(n + m) time. (The follow-up reads both strings from the end instead, counting pending #s, to use O(1) space.)`, calc: [`s → ${q(typed[0])}`, `t → ${q(typed[1])}`, `return ${same}`], stats: [['s showed', q(typed[0])], ['t showed', q(typed[1])]] });
  return finish(R.steps);
}

// ---------------------------------------------------------------- baseball

function baseballRun({ ops }) {
  const R = recorder(ops);
  let total = 0;
  R.snap({ kind: 'start', lines: [], title: 'Keep the record on a stack', text: 'Every rule looks at the most recent scores, and C removes the most recent one: last in, first out. Keep a running total so no final pass is needed.', calc: ['record = empty, total = 0'], stats: [['total', 0]] });
  ops.forEach((op, i) => {
    const top = R.stack.at(-1), second = R.stack.at(-2);
    if (op === 'C') {
      R.stack = R.stack.slice(0, -1);
      total -= Number(top.main);
      R.snap({ kind: 'cancel', i, leaving: { ...top, tone: 'danger' }, card: { q: 'C', a: `remove ${top.main}`, tone: 'bad' }, lines: ['loop', 'c'], title: `C: remove the last score, ${top.main}`, text: 'C undoes the most recent score: pop it and take it off the total.', calc: [`pop ${top.main}`, `total = ${total}`], stats: [['total', total]] });
      return;
    }
    let v, card, kind, line, title, text;
    if (op === 'D') { v = 2 * Number(top.main); card = { q: `2 × ${top.main}`, a: `= ${v}`, tone: 'info' }; kind = 'double'; line = 'd'; title = `D: double the last score → ${v}`; text = `Double the top score, ${top.main}, and record the result.`; }
    else if (op === '+') { v = Number(top.main) + Number(second.main); card = { q: `${second.main} + ${top.main}`, a: `= ${v}`, tone: 'info' }; kind = 'plus'; line = 'plus'; title = `+: add the last two → ${v}`; text = `The two most recent scores are the top two of the stack: ${second.main} and ${top.main}.`; }
    else { v = Number(op); card = { q: op, a: 'a new score', tone: 'info' }; kind = 'push'; line = 'num'; title = `Record ${op}`; text = 'A plain number is a new score: push it.'; }
    const it = R.item(v);
    R.stack = [...R.stack, it];
    total += v;
    R.snap({ kind, i, pushed: it.id, card, lines: ['loop', line], title, text, calc: [`push ${v}`, `total = ${total}`], stats: [['total', total]] });
  });
  R.snap({ kind: 'done', lines: ['ret'], answer: String(total), title: `Total: ${total}`, text: `The scores left are ${R.stack.map((x) => x.main).join(', ') || 'none'}. One pass, O(n).`, calc: [`return ${total}`], stats: [['total', total]] });
  return finish(R.steps);
}

// ---------------------------------------------------------------- rpn

function rpnRun({ tokens }) {
  const R = recorder(tokens);
  R.snap({ kind: 'start', lines: [], title: 'Every operator applies to the two values just before it', text: 'Read left to right. Numbers wait on a stack; an operator takes the two most recent values, combines them, and puts the result back, where the next operator can use it.', calc: ['stack = empty'], stats: [] });
  tokens.forEach((t, i) => {
    if (OPS[t]) {
      const b = R.stack.at(-1), a = R.stack.at(-2);
      const r = OPS[t](Number(a.main), Number(b.main));
      R.stack = R.stack.slice(0, -2);
      const it = R.item(r);
      R.stack = [...R.stack, it];
      R.snap({ kind: 'op', i, pushed: it.id, leaving: { ...b, tone: 'muted' }, card: { q: `${a.main} ${SYM[t]} ${b.main}`, a: `= ${r}`, tone: 'yes' }, lines: ['loop', 'op', 'apply'], title: `${t}: ${a.main} ${SYM[t]} ${b.main} = ${r}`, text: `Pop ${b.main} (the right operand, it was on top), then ${a.main} (the left one), and push the result.${t === '/' && a.main % b.main !== 0 ? ' Division truncates toward zero.' : ''} Order matters for − and ÷.`, calc: [`b = ${b.main}, a = ${a.main}`, `push ${r}`] });
    } else {
      const it = R.item(t);
      R.stack = [...R.stack, it];
      R.snap({ kind: 'push', i, pushed: it.id, card: { q: t, a: 'a number: wait on the stack', tone: 'info' }, lines: ['loop', 'num'], title: `Push ${t}`, text: 'A number waits until an operator needs it.', calc: [`push ${t}`] });
    }
  });
  const v = R.stack.at(-1).main;
  R.snap({ kind: 'done', lines: ['ret'], answer: v, title: `Value: ${v}`, text: 'One value is left on the stack: the whole expression. One pass, O(n).', calc: [`return ${v}`] });
  return finish(R.steps);
}

// ---------------------------------------------------------------- path

function pathRun({ path }) {
  const parts = path.split('/');
  const R = recorder(parts.map((p) => (p === '' ? '·' : p)));
  const now = () => `/${R.stack.map((x) => x.main).join('/')}`;
  R.snap({ kind: 'start', lines: ['loop'], title: `Split ${q(path)} on "/"`, text: 'Each part is a step: a name goes one folder deeper (push), ".." goes up one (pop), and "." or an empty part (from "//" or the ends) changes nothing. The stack is the current folder.', calc: [`parts: ${parts.map((p) => q(p)).join(', ')}`], stats: [['at', '/']] });
  parts.forEach((p, i) => {
    if (p === '' || p === '.') {
      R.snap({ kind: 'skip', i, card: { q: p === '' ? '(empty)' : '.', a: 'stay in this folder', tone: 'no' }, lines: ['loop', 'skip'], title: p === '' ? 'An empty part: skip it' : '".": the current folder, skip it', text: p === '' ? 'Empty parts come from the leading "/", a trailing "/" or "//". They mean nothing.' : '"." means "this folder": nothing changes.', calc: [`skip ${q(p)}`], stats: [['at', now()]] });
    } else if (p === '..') {
      const top = R.stack.at(-1);
      if (top) {
        R.stack = R.stack.slice(0, -1);
        R.snap({ kind: 'up', i, leaving: { ...top, tone: 'danger' }, card: { q: '..', a: `leave ${top.main}`, tone: 'bad' }, lines: ['loop', 'up'], title: `"..": up out of ${top.main}`, text: 'Go to the parent folder: pop the deepest name.', calc: [`pop ${top.main}`, `at ${now()}`], stats: [['at', now()]] });
      } else {
        R.snap({ kind: 'root', i, card: { q: '..', a: 'already at the root', tone: 'no' }, lines: ['loop', 'up'], title: '"..": already at the root, stay', text: 'The root has no parent, so ".." there changes nothing. Check before popping.', calc: ['stack empty → stay'], stats: [['at', now()]] });
      }
    } else {
      const it = R.item(p);
      R.stack = [...R.stack, it];
      R.snap({ kind: 'push', i, pushed: it.id, card: { q: p, a: 'go into it', tone: 'info' }, lines: ['loop', 'push'], title: `${q(p)}: one folder deeper`, text: `${p === '...' ? '"..." is not special: it is an ordinary name. ' : ''}A folder name means going one level deeper: push it.`, calc: [`push ${q(p)}`, `at ${now()}`], stats: [['at', now()]] });
    }
  });
  R.snap({ kind: 'done', lines: ['ret'], answer: q(now()), title: `Simplified: ${q(now())}`, text: 'Join the names from bottom to top with single slashes after a leading "/". The root alone is "/". O(n).', calc: [`return ${q(now())}`], stats: [['at', now()]] });
  return finish(R.steps);
}

// ---------------------------------------------------------------- calc

export const calcTokens = (s) => s.replace(/\s+/g, '').match(/\d+|[+\-*/]/g) ?? [];

function calcRun({ s }) {
  const toks = calcTokens(s);
  const R = recorder(toks.map((t) => SYM[t] ?? t));
  R.snap({ kind: 'start', lines: ['init'], title: `Evaluate ${q(s)} with precedence`, text: '× and ÷ bind tighter, so a sum is a list of terms. Read each number with the operator before it: + and − start a new term, × and ÷ change the last term. Add the terms at the end.', calc: ['op = +'], stats: [] });
  let op = '+';
  toks.forEach((t, i) => {
    if (OPS[t]) { op = t; return; }
    const x = Number(t);
    if (op === '+' || op === '-') {
      const v = op === '+' ? x : -x;
      const it = R.item(v);
      R.stack = [...R.stack, it];
      R.snap({ kind: op === '+' ? 'add' : 'sub', i, pushed: it.id, card: { q: `${SYM[op]} ${x}`, a: `new term ${v}`, tone: 'info' }, lines: ['loop', op === '+' ? 'add' : 'sub'], title: `${SYM[op]}${x}: a new term, ${v}`, text: `${op === '+' ? '+' : '−'} has the lowest precedence, so ${x} starts a new term${op === '-' ? ', stored negative so that the end is just a sum' : ''}. It may still be multiplied or divided by what follows.`, calc: [`push ${v}`] });
    } else {
      const top = R.stack.at(-1);
      const v = OPS[op](Number(top.main), x);
      R.stack = R.stack.slice(0, -1);
      const it = R.item(v);
      R.stack = [...R.stack, it];
      R.snap({ kind: op === '*' ? 'mul' : 'div', i, pushed: it.id, leaving: { ...top, tone: 'muted' }, card: { q: `${top.main} ${SYM[op]} ${x}`, a: `= ${v}`, tone: 'yes' }, lines: ['loop', op === '*' ? 'mul' : 'div'], title: `${SYM[op]}${x}: change the last term, ${top.main} → ${v}`, text: `${SYM[op]} binds tighter than + and −, so it applies to the last term right away.${op === '/' ? ' Division truncates toward zero.' : ''} Terms further down are already final.`, calc: [`pop ${top.main}`, `push ${top.main} ${SYM[op]} ${x} = ${v}`] });
    }
  });
  const sum = R.stack.reduce((acc, it) => acc + Number(it.main), 0);
  R.snap({ kind: 'sum', lines: ['ret'], answer: String(sum), card: { q: R.stack.map((x) => x.main).join(' + ').replace(/\+ -/g, '− '), a: `= ${sum}`, tone: 'yes' }, title: `Add the terms: ${sum}`, text: 'Every term is final now. Only the last term could ever change, so a running total plus one "last term" variable does the same in O(1) space.', calc: [`sum = ${sum}`] });
  return finish(R.steps);
}

// ---------------------------------------------------------------- decode

function decodeRun({ s }) {
  const R = recorder(s.split(''));
  let cur = '', k = 0;
  const st = () => [['text', q(cur)], ['k', k]];
  R.snap({ kind: 'start', lines: ['init'], title: `Decode ${q(s)}`, text: 'Build the text of the innermost open bracket in cur. "[" saves the outer text and its repeat count on the stack and starts fresh; "]" repeats the inner text and glues it onto the saved outer text.', calc: ['cur = "", k = 0'], stats: st() });
  s.split('').forEach((c, i) => {
    if (/\d/.test(c)) {
      k = k * 10 + Number(c);
      R.snap({ kind: 'digit', i, card: { q: c, a: `k = ${k}`, tone: 'info' }, lines: ['loop', 'digit'], title: `Digit ${c}: k = ${k}`, text: 'A repeat count, possibly several digits long: k = k × 10 + digit.', calc: [`k = ${k}`], stats: st() });
    } else if (c === '[') {
      const it = R.item(q(cur), `× ${k}`);
      R.stack = [...R.stack, it];
      R.snap({ kind: 'open', i, pushed: it.id, card: { q: '[', a: `save (${q(cur)}, ${k})`, tone: 'info' }, lines: ['loop', 'open'], title: `"[": save ${q(cur)} and × ${k}, start fresh`, text: 'The bracket\'s inside must be decoded before it can be repeated. Save what was built so far and how many times the inside repeats, then build the inside from empty.', calc: [`push (${q(cur)}, ${k})`, 'cur = "", k = 0'], stats: [['text', '""'], ['k', 0]] });
      cur = ''; k = 0;
    } else if (c === ']') {
      const top = R.stack.at(-1);
      const prev = top.main.slice(1, -1), n = Number(top.sub.slice(2));
      R.stack = R.stack.slice(0, -1);
      const inner = cur;
      cur = prev + inner.repeat(n);
      R.snap({ kind: 'close', i, leaving: { ...top, tone: 'success' }, card: { q: `${q(prev)} + ${q(inner)} × ${n}`, a: `= ${q(cur)}`, tone: 'yes' }, lines: ['loop', 'close'], title: `"]": ${q(inner)} × ${n}, after ${q(prev)}`, text: 'The inside is complete: repeat it, and append it to the text saved when this bracket opened.', calc: [`pop (${q(prev)}, ${n})`, `cur = ${q(cur)}`], stats: [['text', q(cur)], ['k', 0]] });
    } else {
      cur += c;
      R.snap({ kind: 'letter', i, card: { q: c, a: 'append', tone: 'info' }, lines: ['loop', 'letter'], title: `Letter ${c}: cur = ${q(cur)}`, text: 'Letters go onto the text of the innermost open bracket.', calc: [`cur = ${q(cur)}`], stats: st() });
    }
  });
  R.snap({ kind: 'done', lines: ['ret'], answer: q(cur), title: `Decoded: ${q(cur)}`, text: 'Every bracket is closed and the stack is empty. Time is O(n + length of the output).', calc: [`return ${q(cur)}`], stats: [['text', q(cur)]] });
  return finish(R.steps);
}

// ---------------------------------------------------------------- longest valid parentheses

function lvpRun({ s }) {
  const R = recorder(s.split(''));
  let best = 0;
  R.stack = [R.item(-1, 'base')];
  R.snap({ kind: 'start', lines: ['init'], title: 'A stack of indexes, with a base at the bottom', text: 'Open brackets wait on the stack by index. Below them sits a base: the last index that no valid run can cross (−1 at the start). When ")" matches, the valid run ends here and starts right after whatever is now on top.', calc: ['stack = [−1], best = 0'], stats: [['best', 0]] });
  s.split('').forEach((c, i) => {
    if (c === '(') {
      const it = R.item(i, '(');
      R.stack = [...R.stack, it];
      R.snap({ kind: 'open', i, pushed: it.id, card: { q: `( at ${i}`, a: 'wait for its match', tone: 'info' }, lines: ['loop', 'open'], title: `( at index ${i}: push it`, text: 'An open bracket waits for a ")".', calc: [`push ${i}`], stats: [['best', best]] });
      return;
    }
    const top = R.stack.at(-1);
    R.stack = R.stack.slice(0, -1);
    if (!R.stack.length) {
      const it = R.item(i, 'base');
      R.stack = [it];
      R.snap({ kind: 'base', i, pushed: it.id, leaving: { ...top, tone: 'muted' }, card: { q: `) at ${i}`, a: 'nothing to match → new base', tone: 'bad' }, marks: { [i]: 'bad' }, lines: ['loop', 'pop', 'base'], title: `) at ${i} has no partner: it becomes the base`, text: `Popping took the old base, so this ")" matched nothing. No valid run can contain it: index ${i} is the new base.`, calc: [`pop ${top.main}`, `stack empty → push ${i}`], stats: [['best', best]] });
      return;
    }
    const from = Number(R.stack.at(-1).main);
    const len = i - from;
    best = Math.max(best, len);
    R.snap({ kind: 'match', i, leaving: { ...top, tone: 'success' }, band: [from + 1, i], card: { q: `${i} − ${from}`, a: `run of ${len}${len === best ? ' (best)' : ''}`, tone: 'yes' }, lines: ['loop', 'pop', 'len'], title: `) at ${i} matches ( at ${top.main}: a run of ${len}`, text: `After the pop, the top is ${from}${from === -1 ? ' (the base)' : ''}: everything after it, up to ${i}, is well formed. That is ${i} − ${from} = ${len} characters.`, calc: [`pop ${top.main}`, `length = ${i} − ${from} = ${len}`, `best = ${best}`], stats: [['best', best]] });
  });
  R.snap({ kind: 'done', lines: ['ret'], answer: String(best), title: `Longest valid run: ${best}`, text: 'Each index is pushed and popped at most once: O(n) time.', calc: [`return ${best}`], stats: [['best', best]] });
  return finish(R.steps);
}

// ---------------------------------------------------------------- car fleet

function fleetRun({ target, position, speed }) {
  const cars = position.map((p, k) => ({ p, v: speed[k] })).sort((a, b) => b.p - a.p);
  const times = cars.map((c) => (target - c.p) / c.v);
  const R = recorder(cars.map((c) => c.p));
  R.subs = times;
  R.snap({ kind: 'start', lines: ['sort'], title: `Cars sorted from the closest to target ${target}`, text: 'A car can only be held up by cars ahead of it. Go from the closest car backwards; the stack holds the arrival time of each fleet found so far, the most recent one (directly ahead) on top.', calc: cars.map((c, k) => `pos ${c.p}, speed ${c.v} → ${fmt(times[k])}h alone`).slice(0, 5), stats: [['fleets', 0]] });
  cars.forEach((c, i) => {
    const t = times[i];
    const top = R.stack.at(-1);
    if (top && t <= Number(top.sub)) {
      R.snap({ kind: 'merge', i, card: { q: `${fmt(t)} ≤ ${fmt(Number(top.sub))}`, a: 'catches up → joins that fleet', tone: 'yes' }, lines: ['loop', 'time', 'merge'], title: `Car at ${c.p} catches the fleet ahead`, text: `Alone it would arrive at ${fmt(t)}, no later than the fleet in front (${fmt(Number(top.sub))}). It can't pass, so it catches up and arrives with that fleet: no new fleet.`, calc: [`t = (${target} − ${c.p}) / ${c.v} = ${fmt(t)}`, `${fmt(t)} ≤ ${fmt(Number(top.sub))} → merge`], stats: [['fleets', R.stack.length]] });
    } else {
      const it = R.item(`car ${c.p}`, fmt(t));
      it.sub = String(t);
      it.label = fmt(t);
      R.stack = [...R.stack, it];
      R.snap({ kind: 'fleet', i, pushed: it.id, card: { q: top ? `${fmt(t)} > ${fmt(Number(top.sub))}` : `${fmt(t)}`, a: top ? 'slower → leads a new fleet' : 'first car → a fleet', tone: 'info' }, lines: ['loop', 'time', 'push'], title: `Car at ${c.p} leads a new fleet`, text: top ? `Alone it would arrive at ${fmt(t)}, later than the fleet ahead (${fmt(Number(top.sub))}): it never catches up. Its time is the new top, the one cars behind must beat.` : `The closest car can't be held up: it is a fleet arriving at ${fmt(t)}.`, calc: [`t = (${target} − ${c.p}) / ${c.v} = ${fmt(t)}`, `push ${fmt(t)}`], stats: [['fleets', R.stack.length]] });
    }
  });
  R.snap({ kind: 'done', lines: ['ret'], answer: String(R.stack.length), title: `${R.stack.length} fleet${R.stack.length === 1 ? '' : 's'}`, text: 'One stack entry per fleet. Sorting is O(n log n); the pass is O(n).', calc: [`return ${R.stack.length}`], stats: [['fleets', R.stack.length]] });
  // plates show the time, not the raw float
  R.steps.forEach((st) => { st.stack = st.stack.map((x) => ({ ...x, sub: `${fmt(Number(x.sub))}h` })); if (st.leaving) st.leaving = { ...st.leaving, sub: `${fmt(Number(st.leaving.sub))}h` }; st.subs = times.map(fmt); });
  return finish(R.steps);
}

export function tokenStack(input) {
  return { dups: dupsRun, backspace: backspaceRun, baseball: baseballRun, rpn: rpnRun, path: pathRun, calc: calcRun, decode: decodeRun, lvp: lvpRun, fleet: fleetRun }[input.mode](input);
}

/** Reference answers, for the checks. */
export function tokenStackAnswer(input) {
  switch (input.mode) {
    case 'dups': { let s = input.s, prev; do { prev = s; s = s.replace(/(.)\1/, ''); } while (s !== prev); return q(s); }
    case 'backspace': { const ty = (x) => { let o = ''; for (const c of x) o = c === '#' ? o.slice(0, -1) : o + c; return o; }; return String(ty(input.s) === ty(input.t)); }
    case 'baseball': { const r = []; for (const o of input.ops) { if (o === 'C') r.pop(); else if (o === 'D') r.push(2 * r.at(-1)); else if (o === '+') r.push(r.at(-1) + r.at(-2)); else r.push(Number(o)); } return String(r.reduce((a, b) => a + b, 0)); }
    case 'rpn': { const r = []; for (const t of input.tokens) { if (OPS[t]) { const b = r.pop(), a = r.pop(); r.push(OPS[t](a, b)); } else r.push(Number(t)); } return String(r[0]); }
    case 'path': { const r = []; for (const p of input.path.split('/')) { if (p === '..') r.pop(); else if (p && p !== '.') r.push(p); } return q(`/${r.join('/')}`); }
    case 'calc': {
      const t = calcTokens(input.s);
      const terms = [Number(t[0])];
      for (let i = 1; i < t.length; i += 2) { const x = Number(t[i + 1]); if (t[i] === '+') terms.push(x); else if (t[i] === '-') terms.push(-x); else terms.push(OPS[t[i]](terms.pop(), x)); }
      return String(terms.reduce((a, b) => a + b, 0));
    }
    case 'decode': { let s = input.s; while (/\d+\[[a-z]*\]/.test(s)) s = s.replace(/(\d+)\[([a-z]*)\]/, (_, n, x) => x.repeat(Number(n))); return q(s); }
    case 'lvp': {
      let best = 0;
      for (let i = 0; i < input.s.length; i++) { let bal = 0; for (let j = i; j < input.s.length; j++) { bal += input.s[j] === '(' ? 1 : -1; if (bal < 0) break; if (bal === 0) best = Math.max(best, j - i + 1); } }
      return String(best);
    }
    default: {
      const cars = input.position.map((p, k) => [p, (input.target - p) / input.speed[k]]).sort((a, b) => b[0] - a[0]);
      let fleets = 0, slowest = -1;
      for (const [, t] of cars) if (t > slowest) { fleets++; slowest = t; }
      return String(fleets);
    }
  }
}

export function parseTokenStack(values, input) {
  const { mode } = input;
  const str = (v) => (v ?? '').trim().replace(/^"|"$/g, '');
  const list = (v) => (v ?? '').replace(/[[\]"]/g, '').split(/[\s,]+/).filter(Boolean);
  if (mode === 'dups') { const s = str(values.s); return /^[a-z]{1,16}$/.test(s) ? { input: { mode, s } } : { error: 'Up to 16 lowercase letters.' }; }
  if (mode === 'backspace') {
    const s = str(values.s), t = str(values.t);
    return /^[a-z#]{1,10}$/.test(s) && /^[a-z#]{1,10}$/.test(t) ? { input: { mode, s, t } } : { error: 'Each string: up to 10 lowercase letters and #.' };
  }
  if (mode === 'baseball') {
    const ops = list(values.ops).map((o) => o.toUpperCase());
    if (!ops.length || ops.length > 12 || ops.some((o) => !/^(C|D|\+|-?\d{1,3})$/.test(o))) return { error: 'Up to 12 operations: whole numbers, C, D or +.' };
    let size = 0;
    for (const o of ops) { if ((o === 'C' || o === 'D') && size < 1) return { error: `${o} needs a score before it.` }; if (o === '+' && size < 2) return { error: '+ needs two scores before it.' }; size += o === 'C' ? -1 : 1; }
    return { input: { mode, ops } };
  }
  if (mode === 'rpn') {
    const tokens = list(values.tokens);
    if (!tokens.length || tokens.length > 13 || tokens.some((t) => !/^(-?\d{1,3}|[+\-*/])$/.test(t))) return { error: 'Up to 13 tokens: numbers and + − * /.' };
    let size = 0;
    for (const t of tokens) { if (OPS[t]) { if (size < 2) return { error: `"${t}" needs two values before it.` }; size--; } else size++; }
    if (size !== 1) return { error: 'That leaves more than one value: not a complete expression.' };
    const r = []; for (const t of tokens) { if (OPS[t]) { const b = r.pop(), a = r.pop(); if (t === '/' && b === 0) return { error: 'Division by zero.' }; r.push(OPS[t](a, b)); } else r.push(Number(t)); }
    return { input: { mode, tokens } };
  }
  if (mode === 'path') {
    const path = str(values.path);
    return /^\/[A-Za-z0-9._/]{0,40}$/.test(path) && path.split('/').length <= 12 ? { input: { mode, path } } : { error: 'An absolute path starting with "/", up to 40 characters and 11 parts.' };
  }
  if (mode === 'calc') {
    const s = str(values.s).replace(/\s+/g, '');
    if (!/^\d{1,3}([+\-*/]\d{1,3}){0,5}$/.test(s)) return { error: 'Numbers up to 999 joined by + − * /, up to 6 numbers, no brackets.' };
    if (/\/0+(?!\d)/.test(s)) return { error: 'Division by zero.' };
    return { input: { mode, s } };
  }
  if (mode === 'decode') {
    const s = str(values.s);
    if (!/^[a-z0-9[\]]{1,20}$/.test(s)) return { error: 'Up to 20 characters: letters, digits and brackets.' };
    let d = 0; for (const c of s) { d += c === '[' ? 1 : c === ']' ? -1 : 0; if (d < 0) return { error: 'Brackets don\'t match.' }; }
    if (d !== 0 || /\d(?!\d|\[)/.test(s) || /[^\d]\[|^\[/.test(s)) return { error: 'Use k[text]: every number is followed by "[", every "[" comes after a number.' };
    const out = tokenStackAnswer({ mode, s });
    return out.length > 60 ? { error: 'That decodes to more than 60 letters; try smaller counts.' } : { input: { mode, s } };
  }
  if (mode === 'lvp') { const s = str(values.s); return /^[()]{1,14}$/.test(s) ? { input: { mode, s } } : { error: 'Up to 14 brackets, ( and ) only.' }; }
  const tg = parseInt1(values.target, { min: 1, max: 100, name: 'target' });
  if (tg.error) return { error: 'target: a whole number from 1 to 100.' };
  const p = parseInts(values.position, { min: 0, max: tg.v - 1, minLen: 1, maxLen: 7, name: 'position' });
  if (p.error) return { error: `positions: up to 7 different numbers from 0 to ${tg.v - 1}.` };
  if (new Set(p.arr).size !== p.arr.length) return { error: 'Positions must be different.' };
  const sp = parseInts(values.speed, { min: 1, max: 20, minLen: p.arr.length, maxLen: p.arr.length, name: 'speed' });
  if (sp.error) return { error: `speeds: ${p.arr.length} numbers from 1 to 20, one per car.` };
  return { input: { mode: 'fleet', target: tg.v, position: p.arr, speed: sp.arr } };
}

export function randomTokenStack(input, rand = Math.random) {
  const g = rng(rand);
  const pick = (s) => s[g.int(0, s.length - 1)];
  const { mode } = input;
  if (mode === 'dups') return { mode, s: Array.from({ length: g.int(1, 12) }, () => pick('abc')).join('') };
  if (mode === 'backspace') { const one = () => Array.from({ length: g.int(1, 8) }, () => pick('ab##c')).join(''); return { mode, s: one(), t: one() }; }
  if (mode === 'baseball') {
    const ops = []; let size = 0;
    for (let k = g.int(1, 10); k > 0; k--) { const opts = ['n', 'n', ...(size >= 1 ? ['C', 'D'] : []), ...(size >= 2 ? ['+'] : [])]; const o = pick(opts); if (o === 'n') { ops.push(String(g.int(-9, 20))); size++; } else { ops.push(o); size += o === 'C' ? -1 : 1; } }
    return { mode, ops: ops.length ? ops : ['1'] };
  }
  if (mode === 'rpn') {
    const build = (d) => (d === 0 || g.bool(0.3) ? [String(g.int(1, 20))] : [...build(d - 1), ...build(d - 1), pick(['+', '-', '*', '/'])]);
    let tokens; do tokens = build(2); while (!parseTokenStack({ tokens: tokens.join(' ') }, { mode }).input);
    return { mode, tokens };
  }
  if (mode === 'path') return { mode, path: `/${Array.from({ length: g.int(1, 7) }, () => pick(['a', 'b', 'c', '..', '.', '', '...'])).join('/')}${g.bool(0.5) ? '/' : ''}` };
  if (mode === 'calc') { let s = String(g.int(0, 20)); for (let k = g.int(0, 4); k > 0; k--) s += pick(['+', '-', '*', '/']) + g.int(1, 20); return { mode, s }; }
  if (mode === 'decode') {
    const piece = (d) => (d === 0 || g.bool(0.4) ? pick(['a', 'bc', 'd']) : `${g.int(1, 3)}[${piece(d - 1)}${g.bool(0.4) ? piece(d - 1) : ''}]`);
    return { mode, s: `${piece(2)}${g.bool(0.5) ? piece(1) : ''}` };
  }
  if (mode === 'lvp') return { mode, s: Array.from({ length: g.int(1, 12) }, () => pick('()')).join('') };
  const target = g.int(5, 30);
  const n = g.int(1, Math.min(6, target));
  const position = [];
  while (position.length < n) { const p = g.int(0, target - 1); if (!position.includes(p)) position.push(p); }
  return { mode: 'fleet', target, position, speed: position.map(() => g.int(1, 5)) };
}
