const I32MAX = 2 ** 31 - 1;
const fits = (v) => v >= -(2 ** 31) && v <= I32MAX;

/** a balanced bracket string of n pairs */
function balanced(g, n, kinds) {
  if (n === 0) return '';
  const [o, c] = g.pick(kinds);
  const inner = g.int(0, n - 1);
  return o + balanced(g, inner, kinds) + c + balanced(g, n - 1 - inner, kinds);
}

/** a random valid RPN expression with every intermediate value in 32-bit range */
function rpn(g, size) {
  if (size <= 1) { const v = g.val(-200, 200); return { t: [String(v)], v }; }
  const left = g.int(1, size - 1);
  const a = rpn(g, left), b = rpn(g, size - left);
  if (!a || !b) return null;
  const op = g.pick(['+', '-', '*', '/']);
  if (op === '/' && b.v === 0) return null;
  const v = op === '+' ? a.v + b.v : op === '-' ? a.v - b.v : op === '*' ? a.v * b.v : Math.trunc(a.v / b.v);
  return fits(v) ? { t: [...a.t, ...b.t, op], v } : null;
}

/** an infix expression for Basic Calculator II, or null if some intermediate leaves 32-bit range */
function calc(g) {
  const terms = g.len(1, 30, 8);
  const num = () => (g.bool(0.15) ? g.pick([0, I32MAX, 2147483646]) : g.int(0, g.pick([9, 100, 100000])));
  const sp = () => (g.bool(0.3) ? ' '.repeat(g.int(1, 2)) : '');
  let s = sp(), total = 0, sign = 1, prod = null;
  for (let t = 0; t < terms; t++) {
    let v = num();
    s += String(v);
    const factors = g.bool(0.5) ? g.int(1, 3) : 0;
    for (let f = 0; f < factors; f++) {
      const op = g.pick(['*', '/']);
      let w = num();
      if (op === '/' && w === 0) w = g.int(1, 9);
      v = op === '*' ? v * w : Math.trunc(v / w);
      if (!fits(v)) return null;
      s += sp() + op + sp() + String(w);
    }
    total += sign * v;
    if (!fits(total)) return null;
    if (t < terms - 1) { const op = g.pick(['+', '-']); sign = op === '+' ? 1 : -1; s += sp() + op + sp(); }
  }
  void prod;
  return s + sp();
}

/** an encoded string for Decode String (length ≤ 30, decoded length ≤ 1e5) */
function encoded(g, depth) {
  let s = '';
  const parts = g.int(1, 3);
  for (let p = 0; p < parts; p++) {
    if (depth < 3 && g.bool(0.5)) s += String(g.pick([1, 2, 3, 10, 99, 300, g.int(1, 9)])) + '[' + encoded(g, depth + 1) + ']';
    else s += g.str(g.int(1, 3), g.pick(['ab', 'abc', 'xyz']));
  }
  return s;
}
const decodedLength = (s) => {
  const st = [[0, 1]];
  let num = 0, len = 0;
  for (const c of s) {
    if (c >= '0' && c <= '9') num = num * 10 + Number(c);
    else if (c === '[') { st.push([len, num]); len = 0; num = 0; }
    else if (c === ']') { const [prev, k] = st.pop(); len = prev + k * len; }
    else len++;
  }
  return len;
};

export default {
  'valid-parentheses': (g) => {
    const kinds = g.pick([[['(', ')']], [['(', ')'], ['[', ']'], ['{', '}']]]);
    if (g.bool(0.4)) return [g.str(g.len(1, 1e4, 12), kinds.flat().join(''))];
    let s = balanced(g, g.len(1, 20, 10), kinds);
    if (g.bool(0.4)) { const i = g.int(0, s.length - 1); s = s.slice(0, i) + g.pick(['(', ')', ']', '{', '}']) + s.slice(i + 1); }
    return [s];
  },
  'remove-all-adjacent-duplicates-in-string': (g) => [g.str(g.len(1, 1e5, 30), g.pick(['ab', 'abc', 'a']))],
  'backspace-string-compare': (g) => { const alpha = g.pick(['a#', 'ab#', 'ab##', 'abc#']); const s = g.str(g.len(1, 200, 15), alpha); return [s, g.bool(0.4) ? s.replace(/[a-z]#/, '') || s : g.str(g.len(1, 200, 15), alpha)]; },
  'evaluate-reverse-polish-notation': (g) => { const e = rpn(g, g.len(1, 30, 12)); return e ? [e.t] : null; },
  'asteroid-collision': (g) => [g.ints(g.len(2, 1e4, 20), -1000, 1000).map((v) => v || g.pick([-1, 1]))],
  'simplify-path': (g) => {
    const seg = () => g.pick(['.', '..', '...', 'a', 'b', 'home', 'b_c', '..a', 'x1', '.hidden', 'A']);
    const slashes = () => '/'.repeat(g.pick([1, 1, 1, 2, 3]));
    let p = '';
    for (let i = 0, n = g.len(0, 12, 8); i < n; i++) p += slashes() + seg();
    p = (p || '/') + (g.bool(0.3) ? slashes() : '');
    return [p.slice(0, 3000)];
  },
  'basic-calculator-ii': (g) => { const s = calc(g); return s && s.trim() ? [s] : null; },
  'decode-string': (g) => { const s = encoded(g, 0); return s.length <= 30 && decodedLength(s) <= 1e5 ? [s] : null; },
  'longest-valid-parentheses': (g) => [g.str(g.len(0, 3e4, 30), '()')],
  'baseball-game': (g) => {
    const ops = [], st = [];
    for (let i = 0, n = g.len(1, 1000, 20); i < n; i++) {
      const choices = ['x', 'x'];
      if (st.length >= 1) choices.push('C', 'D');
      if (st.length >= 2) choices.push('+');
      const c = g.pick(choices);
      if (c === 'x') { const v = g.val(-3e4, 3e4); st.push(v); ops.push(String(v)); }
      else if (c === 'C') { st.pop(); ops.push('C'); }
      else if (c === 'D') { st.push(2 * st[st.length - 1]); ops.push('D'); }
      else { st.push(st[st.length - 1] + st[st.length - 2]); ops.push('+'); }
      if (!fits(st[st.length - 1] ?? 0) || !fits(st.reduce((a, b) => a + b, 0))) return null;
    }
    return [ops];
  },
  'car-fleet': (g) => {
    const target = g.pick([1, 2, 10, 12, 100, 1e6, g.int(1, 1e6)]);
    const n = Math.min(target, g.len(1, 1e5, 15));
    const pos = g.ints(n, 0, target - 1, { distinct: true });
    return [target, pos, Array.from({ length: n }, () => g.pick([1, 2, 3, 1e6, g.int(1, 10), g.int(1, 1e6)]))];
  },
};
