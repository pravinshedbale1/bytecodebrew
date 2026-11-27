/**
 * <MathWalkViz>: the Math for Interviews problems that <MathViz> (gcd, sieve, fast power) doesn't cover.
 * Steps use the DesignWalkViz "parts" shape (strips, chips, grids) and an optional `call` card.
 * Every mode has an independent brute force for scripts/viz-check.mjs.
 */
import { list, rng } from './util.js';

const P = {
  chips: (label, chips, empty = 'none') => ({ type: 'chips', label, chips, empty }),
  strip: (label, items, o = {}) => ({ type: 'strip', label, items: [...items], cls: {}, tags: {}, sub: {}, bands: [], index: true, ...o }),
  grid: (label, cells) => ({ type: 'grid', label, cells }),
};
const INT_MAX = 2147483647, INT_MIN = -2147483648;
const ROMAN = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
const lcg = (seed) => { let s = seed; return () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; }; };   // a repeatable stand-in for Random

export const MATH_WALK = {
  palindrome: { label: 'Palindrome number: 1221', input: { mode: 'palindrome', x: 1221 } },
  palindromeOdd: { label: 'Palindrome number: 12321', input: { mode: 'palindrome', x: 12321 } },
  palindromeNo: { label: 'Not a palindrome: 10', input: { mode: 'palindrome', x: 10 } },
  reverse: { label: 'Reverse integer: −123', input: { mode: 'reverse', x: -123 } },
  reverseOverflow: { label: 'Reverse: overflow', input: { mode: 'reverse', x: 1563847412 } },
  trailing: { label: 'Zeros at the end of 30!', input: { mode: 'trailing', n: 30 } },
  good: { label: 'Good numbers, n = 4', input: { mode: 'good', n: 4 } },
  shuffle: { label: 'Fisher–Yates shuffle', input: { mode: 'shuffle', nums: [1, 2, 3, 4, 5], seed: 7 } },
  reservoir: { label: 'Reservoir sampling', input: { mode: 'reservoir', nums: [4, 8, 1, 6, 3], seed: 3 } },
  rand10: { label: 'rand10 from rand7', input: { mode: 'rand10', rolls: [[7, 4], [6, 7], [3, 5], [1, 2]] } },
  plusone: { label: 'Plus one: [1, 2, 9, 9]', input: { mode: 'plusone', digits: [1, 2, 9, 9] } },
  plusoneAll: { label: 'Plus one: [9, 9, 9]', input: { mode: 'plusone', digits: [9, 9, 9] } },
  roman: { label: 'Roman: MCMXCIV', input: { mode: 'roman', s: 'MCMXCIV' } },
  excel: { label: 'Column title: 701', input: { mode: 'excel', n: 701 } },
  excelZ: { label: 'Column title: 52', input: { mode: 'excel', n: 52 } },
  gcdstr: { label: 'GCD of strings', input: { mode: 'gcdstr', a: 'ABABAB', b: 'ABAB' } },
  gcdstrNo: { label: 'GCD of strings: none', input: { mode: 'gcdstr', a: 'LEET', b: 'CODE' } },
  multiply: { label: '123 × 456', input: { mode: 'multiply', a: '123', b: '456' } },
};

export const mathWalkCode = (mode) => ({
  palindrome: [['neg', 'if (x < 0 || (x % 10 == 0 && x != 0)) return false;'], ['move', 'while (x > rev) { rev = rev * 10 + x % 10; x /= 10; }   // move the last digit over'], ['ans', 'return x == rev || x == rev / 10;          // odd length: drop the middle digit']],
  reverse: [['pop', 'd = x % 10;  x /= 10;                        // last digit (keeps its sign)'], ['check', 'if (rev > MAX / 10 || (rev == MAX / 10 && d > 7)) return 0;   // and the same for MIN'], ['push', 'rev = rev * 10 + d;'], ['ans', 'return rev;']],
  trailing: [['loop', 'for (p = 5; p <= n; p *= 5) zeros += n / p;    // multiples of 5, then of 25, …'], ['ans', 'return zeros;']],
  good: [['split', 'even positions: ⌈n / 2⌉, 5 choices each (0, 2, 4, 6, 8);  odd: ⌊n / 2⌋, 4 choices (2, 3, 5, 7)'], ['pow', 'answer = 5^even · 4^odd mod 10⁹ + 7       // fast power: O(log n)']],
  shuffle: [['pick', 'for i = 0 .. n − 2: j = random in [i, n − 1]'], ['swap', '    swap(a[i], a[j]);          // a[0..i] is now final'], ['ans', 'return a;']],
  reservoir: [['walk', 'for each node, count i = 1, 2, 3, …'], ['keep', '    with probability 1/i: chosen = node.val'], ['ans', 'return chosen;          // every node ends up with probability 1/n']],
  rand10: [['idx', 'idx = (rand7() − 1) · 7 + rand7();      // uniform over 1..49'], ['reject', 'if (idx > 40) try again                // 41..49 would make some values likelier'], ['map', 'return 1 + (idx − 1) % 10;             // 1..40 → 1..10, four cells each']],
  plusone: [['loop', 'for i from the last digit: if (d[i] < 9) { d[i]++; return d; }'], ['carry', '    d[i] = 0;                // 9 + 1 = 10: write 0, carry on'], ['grow', 'all were 9: return [1, 0, 0, …, 0]']],
  roman: [['each', 'for each symbol: v = value(s[i])'], ['sub', '    if (v < value(s[i + 1])) total −= v;   // IV, IX, XL, XC, CD, CM'], ['add', '    else total += v;'], ['ans', 'return total;']],
  excel: [['shift', 'n−−;                      // A..Z are 1..26: shift to 0..25'], ['digit', 'letter = (char) (\'A\' + n % 26);  n /= 26;'], ['ans', 'reverse the letters']],
  gcdstr: [['check', 'if (!(a + b).equals(b + a)) return "";     // they must be built from the same piece'], ['len', 'return a.substring(0, gcd(a.length(), b.length()));']],
  multiply: [['grid', 'res = new int[m + n]'], ['mul', 'for i, j from the right: p = a[i] · b[j];  sum = p + res[i + j + 1]'], ['carry', '    res[i + j + 1] = sum % 10;  res[i + j] += sum / 10'], ['ans', 'skip leading zeros']],
})[mode];

// ---------------------------------------------------------------- brute forces

const gcd = (a, b) => (b ? gcd(b, a % b) : a);
export function mathWalkAnswer(input) {
  const { mode } = input;
  if (mode === 'palindrome') { const s = String(input.x); return s === [...s].reverse().join(''); }
  if (mode === 'reverse') { const r = Number(`${input.x < 0 ? '-' : ''}${String(Math.abs(input.x)).split('').reverse().join('')}`); return r > INT_MAX || r < INT_MIN ? 0 : r; }
  if (mode === 'trailing') { let f = 1n; for (let k = 2n; k <= BigInt(input.n); k++) f *= k; let z = 0; while (f % 10n === 0n && f) { f /= 10n; z++; } return z; }
  if (mode === 'good') { let c = 0; for (let x = 0; x < 10 ** input.n; x++) { const s = String(x).padStart(input.n, '0'); if ([...s].every((d, i) => (i % 2 ? '2357' : '02468').includes(d))) c++; } return c; }
  if (mode === 'shuffle' || mode === 'reservoir') return { any: input.nums };
  if (mode === 'rand10') { const table = []; for (let a = 1; a <= 7; a++) for (let b = 1; b <= 7; b++) table.push((a - 1) * 7 + b <= 40 ? (((a - 1) * 7 + b - 1) % 10) + 1 : null); for (const [a, b] of input.rolls) { const v = table[(a - 1) * 7 + (b - 1)]; if (v !== null) return v; } return null; }
  if (mode === 'plusone') return String(BigInt(input.digits.join('')) + 1n).split('').map(Number);
  if (mode === 'roman') { const pairs = { CM: 900, CD: 400, XC: 90, XL: 40, IX: 9, IV: 4 }; let s = input.s, t = 0; while (s) { if (pairs[s.slice(0, 2)]) { t += pairs[s.slice(0, 2)]; s = s.slice(2); } else { t += ROMAN[s[0]]; s = s.slice(1); } } return t; }
  if (mode === 'excel') { const t = ['A']; for (let k = 1; k < input.n; k++) { let i = t.length - 1; while (i >= 0 && t[i] === 'Z') { t[i] = 'A'; i--; } if (i < 0) t.unshift('A'); else t[i] = String.fromCharCode(t[i].charCodeAt(0) + 1); } return t.join(''); }
  if (mode === 'gcdstr') { for (let L = Math.min(input.a.length, input.b.length); L > 0; L--) { const x = input.a.slice(0, L); const div = (s) => s.length % L === 0 && x.repeat(s.length / L) === s; if (div(input.a) && div(input.b)) return x; } return ''; }
  return String(BigInt(input.a) * BigInt(input.b));
}

export function mathWalkCheck(input, out) { const w = mathWalkAnswer(input); if (w && w.any) return mode2perm(input, out, w.any); return JSON.stringify(w) === JSON.stringify(out); }
const mode2perm = (input, out, vals) => (input.mode === 'shuffle' ? Array.isArray(out) && [...out].sort((a, b) => a - b).join() === [...vals].sort((a, b) => a - b).join() : vals.includes(out));

// ---------------------------------------------------------------- step-throughs

export function mathWalk(input) {
  const { mode } = input;
  const steps = [];
  const snap = (x) => steps.push({ mode, parts: [], call: null, ...x });
  const digits = (v) => String(Math.abs(v)).split('').map(Number);

  if (mode === 'palindrome') {
    let x = input.x, rev = 0;
    const view = () => [P.chips('numbers', [{ key: 'x', text: `x = ${x}`, tone: 'accent' }, { key: 'r', text: `rev = ${rev}`, tone: 'success' }])];
    snap({ kind: 'start', lines: [], parts: [P.strip('digits', digits(input.x))], title: `Is ${input.x} a palindrome?`, text: 'Turning the number into a string works, but the follow-up asks for arithmetic. Reversing the whole number can overflow. Reverse only the second half: move digits from the end of x onto rev until rev is at least as big as x. Then the halves are side by side.', calc: [`x = ${input.x}`] });
    if (x < 0 || (x % 10 === 0 && x !== 0)) { snap({ kind: 'fail', lines: ['neg'], parts: view(), out: false, answer: 'false', title: x < 0 ? 'Negative: false' : 'Ends in 0 (and isn\'t 0): false', text: x < 0 ? 'The minus sign would end up at the back.' : 'Read backwards it would start with 0, which no number does.', calc: ['false'] }); return steps; }
    while (x > rev) {
      const d = x % 10; rev = rev * 10 + d; x = Math.floor(x / 10);
      snap({ kind: 'move', lines: ['move'], parts: view(), title: `Move ${d}: x = ${x}, rev = ${rev}`, text: `The last digit of x (${d}) moves to the end of rev. ${x > rev ? 'x is still bigger: keep going.' : 'Now rev ≥ x: half of the digits have moved.'}`, calc: [`rev = ${rev}`, `x = ${x}`] });
    }
    const ok = x === rev || x === Math.floor(rev / 10);
    snap({ kind: ok ? 'found' : 'fail', lines: ['ans'], parts: view(), out: ok, answer: String(ok), title: ok ? `${input.x} is a palindrome` : `${input.x} is not a palindrome`, text: x === rev ? `Even length: the halves match (${x} = ${rev}).` : x === Math.floor(rev / 10) ? `Odd length: rev also took the middle digit; drop it (${Math.floor(rev / 10)} = ${x}).` : `The front half ${x} doesn't match the reversed back half ${rev}.`, calc: [String(ok)] });
    return steps;
  }

  if (mode === 'reverse') {
    let x = input.x, rev = 0;
    const MAXD = Math.trunc(INT_MAX / 10);
    const view = () => [P.chips('numbers', [{ key: 'x', text: `x = ${x}`, tone: 'accent' }, { key: 'r', text: `rev = ${rev}`, tone: 'success' }, { key: 'l', text: `limit 2147483647`, tone: 'muted' }])];
    snap({ kind: 'start', lines: [], parts: view(), title: `Reverse ${input.x}`, text: 'Pop the last digit of x and push it onto rev. With no 64-bit integers allowed, check BEFORE each push whether rev · 10 + d would leave the 32-bit range: rev > 214748364, or rev equal to it with a big last digit, means overflow.', calc: [`x = ${input.x}`] });
    while (x !== 0) {
      const d = x % 10; x = Math.trunc(x / 10);
      if (rev > MAXD || (rev === MAXD && d > 7) || rev < -MAXD || (rev === -MAXD && d < -8)) { snap({ kind: 'fail', lines: ['pop', 'check'], parts: view(), out: 0, answer: '0', title: `rev · 10 + ${d} would overflow: return 0`, text: `rev = ${rev} is already ${Math.abs(rev) > MAXD ? 'past' : 'at'} 214748364, so one more digit leaves the 32-bit range.`, calc: ['0'] }); return steps; }
      rev = rev * 10 + d;
      snap({ kind: 'move', lines: ['pop', 'check', 'push'], parts: view(), title: `Pop ${d}: rev = ${rev}`, text: `The last digit ${d} moves onto rev (in Java, % keeps the sign of x, so negatives work unchanged). It fits in 32 bits.`, calc: [`rev = ${rev}`] });
    }
    snap({ kind: 'done', lines: ['ans'], parts: view(), out: rev, answer: String(rev), title: `Reversed: ${rev}`, text: 'One step per digit, at most 10 of them. Trailing zeros of x simply become leading zeros of rev, which vanish.', calc: [String(rev)] });
    return steps;
  }

  if (mode === 'trailing') {
    const n = input.n;
    const mult = []; for (let v = 5; v <= n; v += 5) mult.push(v);
    let z = 0;
    const fives = (v) => { let c = 0; while (v % 5 === 0) { v /= 5; c++; } return c; };
    snap({ kind: 'start', lines: [], parts: [P.strip(`multiples of 5 up to ${n}`, mult.length ? mult : ['—'])], title: `Trailing zeros of ${n}!`, text: 'A trailing zero is a factor 10 = 2 × 5. There are far more 2s than 5s among 1..n, so count the 5s. Every multiple of 5 gives one, every multiple of 25 one more, every multiple of 125 another, and so on.', calc: [`${n}! has ${mult.length} multiples of 5`] });
    for (let p = 5; p <= n; p *= 5) {
      const k = Math.floor(n / p); z += k;
      const s = P.strip(`multiples of 5 up to ${n}`, mult);
      mult.forEach((v, i) => { const f = fives(v); s.sub[i] = { text: `×${f}`, tone: f > 1 ? 'success' : undefined }; if (v % p === 0) s.cls[i] = 'hit'; });
      snap({ kind: 'add', lines: ['loop'], parts: [s], title: `Multiples of ${p}: ${n} / ${p} = ${k}`, text: `Each multiple of ${p} (highlighted) contributes one more factor of 5. ${k} of them: zeros = ${z}.`, calc: [`zeros = ${z}`] });
    }
    snap({ kind: 'done', lines: ['ans'], parts: [P.chips('answer', [{ key: 'z', text: String(z), tone: 'success' }])], out: z, answer: String(z), title: `${n}! ends in ${z} zero${z === 1 ? '' : 's'}`, text: 'O(log₅ n) divisions; n! itself is never computed (it overflows a long at 21!).', calc: [String(z)] });
    return steps;
  }

  if (mode === 'good') {
    const n = input.n, ev = Math.ceil(n / 2), od = Math.floor(n / 2), MOD = 1000000007n;
    const s = P.strip('positions', Array.from({ length: n }, (_, i) => (i % 2 ? '2357' : '02468')), { index: true });
    Array.from({ length: n }).forEach((_, i) => { s.sub[i] = { text: i % 2 ? '4 ways' : '5 ways', tone: i % 2 ? undefined : 'success' }; });
    snap({ kind: 'start', lines: ['split'], parts: [s], title: `Good digit strings of length ${n}`, text: `Positions are independent, so multiply the choices: each even index has 5 even digits, each odd index has 4 prime digits. ${n} positions: ${ev} even, ${od} odd.`, calc: [`5^${ev} · 4^${od}`] });
    const pw = (b, e) => { let r = 1n, bb = BigInt(b), ee = BigInt(e); while (ee) { if (ee & 1n) r = (r * bb) % MOD; bb = (bb * bb) % MOD; ee >>= 1n; } return r; };
    const a = pw(5, ev), b = pw(4, od), ans = Number((a * b) % MOD);
    snap({ kind: 'add', lines: ['pow'], parts: [s, P.chips('powers', [{ key: 'a', text: `5^${ev} = ${a}`, tone: 'accent' }, { key: 'b', text: `4^${od} = ${b}`, tone: 'accent' }])], title: `5^${ev} · 4^${od}`, text: 'With n up to 10¹⁵, both powers need fast exponentiation (square-and-multiply) modulo 10⁹ + 7: about 50 multiplications each.', calc: [`${a} · ${b}`] });
    snap({ kind: 'done', lines: ['pow'], parts: [P.chips('answer', [{ key: 'z', text: String(ans), tone: 'success' }])], out: ans, answer: String(ans), title: `${ans} good strings`, text: 'O(log n) time. Counting by trying strings would be 10ⁿ.', calc: [String(ans)] });
    return steps;
  }

  if (mode === 'shuffle') {
    const a = [...input.nums], rnd = lcg(input.seed), n = a.length;
    const ids = a.map((v) => ({ v, id: v }));
    const view = (i, j) => { const s = P.strip('array', ids.map((x) => ({ ...x }))); for (let k = 0; k < i; k++) s.cls[k] = 'hit'; if (i !== null && i < n) { s.cls[i] = `${s.cls[i] ?? ''} cur`; s.bands = [{ from: i, to: n - 1, tone: 'accent', label: 'pick from here' }]; } if (j !== null && j !== undefined) s.tags[j] = [{ label: 'j', tone: 'warn' }]; return [s]; };
    snap({ kind: 'start', lines: [], parts: view(null), title: `Shuffle ${list(input.nums)}`, text: 'Fisher–Yates: for each position i from the left, pick a random position j from i to the end and swap. Position i then holds a uniformly random choice among the elements not placed yet, so all n! orders are equally likely. (Picking j from the whole array instead gives n^n outcomes, which can\'t be spread evenly over n! orders.)', calc: [`${n} elements`] });
    for (let i = 0; i < n - 1; i++) {
      const j = i + Math.floor(rnd() * (n - i));
      [ids[i], ids[j]] = [ids[j], ids[i]];
      snap({ kind: 'move', lines: ['pick', 'swap'], parts: view(i, j), title: `i = ${i}: random j = ${j}`, text: `Choose j uniformly from ${i}..${n - 1} (${n - i} choices; here ${j}) and swap. Position ${i} is now final (shaded).`, calc: [`swap a[${i}], a[${j}]`] });
    }
    const out = ids.map((x) => x.v);
    snap({ kind: 'done', lines: ['ans'], parts: view(n), out, answer: list(out), title: `Shuffled: ${list(out)}`, text: `${n} × ${n - 1} × … × 1 = ${[...Array(n).keys()].reduce((p, k) => p * (k + 1), 1)} equally likely outcomes, one per order. reset() just returns a saved copy of the original. O(n).`, calc: [list(out)] });
    return steps;
  }

  if (mode === 'reservoir') {
    const a = input.nums, rnd = lcg(input.seed);
    let chosen = null;
    const view = (i) => { const s = P.strip('list (one pass, length unknown)', a); a.forEach((_, k) => { if (i !== null && k > i) s.cls[k] = 'muted'; if (a[k] === chosen && k <= i) s.cls[k] = 'hit'; }); if (i !== null) s.cls[i] = `${s.cls[i] ?? ''} cur`; return [s, P.chips('chosen', chosen === null ? [] : [{ key: 'c', text: String(chosen), tone: 'success' }], 'none yet')]; };
    snap({ kind: 'start', lines: ['walk'], parts: view(null), title: 'Pick a random node in one pass', text: 'Without knowing the length, walk the list once. At the i-th node, replace the current choice with probability 1/i. The first node is kept for sure, and by the end every node has been kept with probability exactly 1/n.', calc: [`${a.length} nodes (unknown to the algorithm)`] });
    a.forEach((v, k) => {
      const i = k + 1, r = rnd(), take = r < 1 / i;
      if (take) chosen = v;
      snap({ kind: take ? 'take' : 'skip', lines: ['walk', 'keep'], parts: view(k), title: `Node ${i} (${v}): ${take ? 'keep it' : 'keep the old choice'}`, text: `Replace with probability 1/${i} (the roll ${r.toFixed(2)} ${take ? '<' : '≥'} ${(1 / i).toFixed(2)}). ${take ? `${v} is the new choice.` : `The choice stays ${chosen}.`} Node ${i} stays chosen to the end with probability 1/${i} · ${i}/${i + 1} · … = 1/n.`, calc: [`chosen = ${chosen}`] });
    });
    snap({ kind: 'done', lines: ['ans'], parts: view(a.length - 1), out: chosen, answer: String(chosen), title: `getRandom() → ${chosen}`, text: 'O(n) per call and O(1) extra memory. If the length is known, storing the values in an array and picking an index is O(1) per call.', calc: [String(chosen)] });
    return steps;
  }

  if (mode === 'rand10') {
    let pick = null, out = null;
    const view = () => [P.grid('first roll = row, second roll = column', Array.from({ length: 7 }, (_, r) => Array.from({ length: 7 }, (__, c) => { const idx = r * 7 + c + 1; const isPick = pick && pick[0] === r + 1 && pick[1] === c + 1; return { l: idx <= 40 ? String(((idx - 1) % 10) + 1) : '×', c: [idx > 40 ? 'gone' : 'open', isPick && (idx > 40 ? 'wall' : 'isle_success'), isPick && 'cellCur'] }; })))];
    snap({ kind: 'start', lines: ['idx'], parts: view(), title: 'rand10() from rand7()', text: 'Two rolls of rand7 pick one of 49 equally likely cells. 49 isn\'t a multiple of 10, so use only the first 40 cells (each value 1..10 appears in exactly 4 of them) and roll again on the other 9. Every accepted cell is equally likely, so every value is.', calc: ['49 cells, 40 used'] });
    for (const [a, b] of input.rolls) {
      pick = [a, b];
      const idx = (a - 1) * 7 + b;
      if (idx > 40) { snap({ kind: 'skip', lines: ['idx', 'reject'], parts: view(), call: { q: `rand7() = ${a}, rand7() = ${b}`, a: `cell ${idx}: reject`, tone: 'warn' }, title: `Cell ${idx} > 40: roll again`, text: `(${a} − 1) · 7 + ${b} = ${idx}. Cells 41..49 would give 1..9 a 5th chance and 10 only 4, so throw them away and roll again.`, calc: [`idx = ${idx}`] }); continue; }
      out = ((idx - 1) % 10) + 1;
      snap({ kind: 'take', lines: ['idx', 'map'], parts: view(), call: { q: `rand7() = ${a}, rand7() = ${b}`, a: `→ ${out}`, tone: 'success' }, title: `Cell ${idx} → ${out}`, text: `(${a} − 1) · 7 + ${b} = ${idx} ≤ 40: return 1 + (${idx} − 1) % 10 = ${out}.`, calc: [`rand10() = ${out}`] });
      break;
    }
    snap({ kind: 'done', lines: ['map'], parts: view(), out, answer: String(out), title: out === null ? 'Every roll was rejected' : `rand10() = ${out}`, text: 'An attempt succeeds with probability 40/49, so on average 49/40 attempts, about 2.45 calls to rand7. Reusing the leftover randomness of rejected cells lowers that further.', calc: [String(out)] });
    return steps;
  }

  if (mode === 'plusone') {
    const d = [...input.digits];
    const view = (i, ok) => { const s = P.strip('digits', d); if (i !== null) s.cls[i] = ok ? 'hit' : 'cur'; return [s]; };
    snap({ kind: 'start', lines: [], parts: view(null), title: `${input.digits.join('')} + 1`, text: 'Add one at the last digit. A digit below 9 just goes up by one and you are done. A 9 becomes 0 and the carry moves one digit left. If every digit was 9, the number grows by one digit.', calc: [list(input.digits)] });
    for (let i = d.length - 1; i >= 0; i--) {
      if (d[i] < 9) { d[i]++; snap({ kind: 'found', lines: ['loop'], parts: view(i, true), out: [...d], answer: list(d), title: `${d[i] - 1} + 1 = ${d[i]}: done`, text: 'No carry: every digit to the left stays as it is.', calc: [list(d)] }); return steps; }
      d[i] = 0;
      snap({ kind: 'move', lines: ['loop', 'carry'], parts: view(i, false), title: `9 + 1 = 10: write 0, carry`, text: `Digit ${i} was 9: it becomes 0 and the 1 is carried to digit ${i - 1 >= 0 ? i - 1 : 'before the front'}.`, calc: [list(d)] });
    }
    d.unshift(1);
    snap({ kind: 'done', lines: ['grow'], parts: view(0, true), out: [...d], answer: list(d), title: `All 9s: ${list(d)}`, text: 'The carry ran off the front, so put a 1 in front of the zeros. O(n) at worst, O(1) usually.', calc: [list(d)] });
    return steps;
  }

  if (mode === 'roman') {
    const s = [...input.s];
    let total = 0;
    const view = (i, sub) => { const st = P.strip('symbols', s); s.forEach((ch, k) => { st.sub[k] = { text: String(ROMAN[ch]) }; }); if (i !== null) { st.cls[i] = sub ? 'bad' : 'hit'; if (sub) st.tags[i] = [{ label: '−', tone: 'danger' }]; } return [st, P.chips('total', [{ key: 't', text: String(total), tone: 'success' }])]; };
    snap({ kind: 'start', lines: [], parts: view(null), title: `Value of ${input.s}`, text: 'Read left to right and add each symbol\'s value, except when a symbol is smaller than the one after it: then it is the first half of a subtractive pair (IV, IX, XL, XC, CD, CM) and is subtracted instead.', calc: [input.s] });
    s.forEach((ch, i) => {
      const v = ROMAN[ch], nx = i + 1 < s.length ? ROMAN[s[i + 1]] : 0, sub = v < nx;
      total += sub ? -v : v;
      snap({ kind: sub ? 'skip' : 'add', lines: ['each', sub ? 'sub' : 'add'], parts: view(i, sub), title: sub ? `${ch} (${v}) before ${s[i + 1]} (${nx}): −${v}` : `${ch}: +${v}`, text: sub ? `A smaller symbol before a larger one is subtracted: ${ch}${s[i + 1]} = ${nx - v}.` : `${ch} is not smaller than what follows, so add ${v}.`, calc: [`total = ${total}`] });
    });
    snap({ kind: 'done', lines: ['ans'], parts: view(null), out: total, answer: String(total), title: `${input.s} = ${total}`, text: 'One pass, O(n), comparing each symbol only with its right neighbour.', calc: [String(total)] });
    return steps;
  }

  if (mode === 'excel') {
    let n = input.n;
    const letters = [];
    snap({ kind: 'start', lines: [], parts: [P.chips('n', [{ key: 'n', text: String(n), tone: 'accent' }])], title: `Column title of ${input.n}`, text: 'Like base 26, except there is no zero: the digits are A..Z = 1..26. Subtracting 1 before each step turns them into 0..25, so % 26 and / 26 work as in ordinary base conversion. Letters come out right to left.', calc: [`n = ${input.n}`] });
    while (n > 0) {
      n--; const r = n % 26; const ch = String.fromCharCode(65 + r); letters.unshift(ch); const before = n; n = Math.floor(n / 26);
      snap({ kind: 'add', lines: ['shift', 'digit'], parts: [P.strip('title so far', letters, { index: false }), P.chips('n', [{ key: 'n', text: String(n), tone: 'accent' }])], title: `${before} % 26 = ${r} → '${ch}'`, text: `After subtracting 1, n = ${before}. The last letter is 'A' + ${r} = '${ch}'. Divide by 26: n = ${n}.`, calc: [`title: ${letters.join('')}`] });
    }
    const t = letters.join('');
    snap({ kind: 'done', lines: ['ans'], parts: [P.strip('title', letters, { index: false })], out: t, answer: `"${t}"`, title: `${input.n} → "${t}"`, text: 'O(log₂₆ n). Forgetting the − 1 gives the classic bug: 26 would come out as "A@" instead of "Z".', calc: [t] });
    return steps;
  }

  if (mode === 'gcdstr') {
    const { a, b } = input;
    const ok = a + b === b + a, L = gcd(a.length, b.length), x = a.slice(0, L);
    const blocks = (s) => { const st = P.strip(`"${s}"`, [...s], { index: false }); if (ok) for (let k = 0; k < s.length; k += L) st.bands.push({ from: k, to: k + L - 1, tone: (k / L) % 2 ? 'note' : 'accent', label: x }); return st; };
    snap({ kind: 'start', lines: ['check'], parts: [P.strip(`"${a}" + "${b}"`, [...(a + b)], { index: false }), P.strip(`"${b}" + "${a}"`, [...(b + a)], { index: false })], title: `Common divisor of "${a}" and "${b}"?`, text: 'If both strings are made of copies of one piece x, then a + b and b + a are both copies of x: equal. If they differ, no common divisor exists. That single comparison is the test.', calc: [ok ? 'a + b == b + a' : 'a + b ≠ b + a'] });
    if (!ok) { snap({ kind: 'fail', lines: ['check'], parts: [], out: '', answer: '""', title: 'a + b ≠ b + a: no divisor', text: 'The two orders differ, so the strings aren\'t built from a common piece.', calc: ['""'] }); return steps; }
    snap({ kind: 'found', lines: ['len'], parts: [blocks(a), blocks(b)], out: x, answer: `"${x}"`, title: `gcd(${a.length}, ${b.length}) = ${L}: "${x}"`, text: `The largest piece has length gcd(${a.length}, ${b.length}) = ${L}: the prefix "${x}". Both strings are copies of it (bands).`, calc: [`"${x}"`] });
    return steps;
  }

  // multiply
  const { a, b } = input, m = a.length, n = b.length;
  const res = Array(m + n).fill(0);
  const view = (hi = [], lo = []) => { const s = P.strip('result digits', res); hi.forEach((k) => { s.cls[k] = 'cur'; }); lo.forEach((k) => { s.cls[k] = 'hit'; }); return [s]; };
  snap({ kind: 'start', lines: ['grid'], parts: view(), title: `"${a}" × "${b}"`, text: `Long multiplication without big numbers. The digit a[i] times b[j] lands at positions i + j and i + j + 1 of an array of length ${m + n} (the product can have at most that many digits). Add each product into its place and push the tens one place left.`, calc: [`${m + n} result digits`] });
  for (let i = m - 1; i >= 0; i--) {
    const parts = [];
    for (let j = n - 1; j >= 0; j--) {
      const p = Number(a[i]) * Number(b[j]), sum = p + res[i + j + 1];
      res[i + j + 1] = sum % 10; res[i + j] += Math.floor(sum / 10);
      parts.push(`${a[i]}·${b[j]}`);
    }
    snap({ kind: 'add', lines: ['mul', 'carry'], parts: view([], Array.from({ length: n + 1 }, (_, k) => i + k)), title: `Digit ${a[i]} of "${a}" times "${b}"`, text: `Multiply ${a[i]} by every digit of "${b}" (${parts.join(', ')}) and add each into positions ${i}..${i + n}, carrying tens to the left.`, calc: [`res = ${res.join('')}`] });
  }
  let s = res.join('').replace(/^0+/, '');
  if (!s) s = '0';
  snap({ kind: 'done', lines: ['ans'], parts: view(), out: s, answer: `"${s}"`, title: `"${a}" × "${b}" = "${s}"`, text: 'O(m · n) digit products. Drop the leading zeros (at most one, unless a factor is 0).', calc: [s] });
  return steps;
}

// ---------------------------------------------------------------- inputs

const isInt = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi;
const ints = (t) => String(t ?? '').replace(/[[\]]/g, ' ').split(/[\s,]+/).filter(Boolean).map(Number);

export function parseMathWalk(values, input) {
  const { mode } = input;
  if (mode === 'palindrome' || mode === 'reverse') { const x = Number(values.x); return isInt(x, INT_MIN, INT_MAX) ? { input: { mode, x } } : { error: 'A 32-bit integer.' }; }
  if (mode === 'trailing') { const n = Number(values.n); return isInt(n, 0, 60) ? { input: { mode, n } } : { error: 'n from 0 to 60.' }; }
  if (mode === 'good') { const n = Number(values.n); return isInt(n, 1, 6) ? { input: { mode, n } } : { error: 'n from 1 to 6 here (the real one goes to 10¹⁵).' }; }
  if (mode === 'shuffle' || mode === 'reservoir') { const a = ints(values.nums), seed = Number(values.seed); return a.length >= 1 && a.length <= 8 && a.every((v) => isInt(v, -99, 99)) && (mode === 'reservoir' || new Set(a).size === a.length) && isInt(seed, 0, 999) ? { input: { mode, nums: a, seed } } : { error: `1 to 8 numbers${mode === 'shuffle' ? ' (all different)' : ''}, and a seed from 0 to 999.` }; }
  if (mode === 'rand10') { const r = ints(values.rolls); return r.length >= 2 && r.length <= 10 && r.length % 2 === 0 && r.every((v) => isInt(v, 1, 7)) ? { input: { mode, rolls: Array.from({ length: r.length / 2 }, (_, k) => [r[2 * k], r[2 * k + 1]]) } } : { error: 'Pairs of rand7 results (1 to 7), e.g. 3 5, 7 4.' }; }
  if (mode === 'plusone') { const d = ints(values.digits); return d.length >= 1 && d.length <= 10 && d.every((v) => isInt(v, 0, 9)) && (d.length === 1 || d[0] !== 0) ? { input: { mode, digits: d } } : { error: 'Up to 10 digits with no leading zero.' }; }
  if (mode === 'roman') { const s = String(values.s ?? '').trim().toUpperCase(); return /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/.test(s) && s ? { input: { mode, s } } : { error: 'A valid Roman numeral from 1 to 3999.' }; }
  if (mode === 'excel') { const n = Number(values.n); return isInt(n, 1, 20000) ? { input: { mode, n } } : { error: 'n from 1 to 20000.' }; }
  if (mode === 'gcdstr') { const a = String(values.a ?? '').trim().toUpperCase(), b = String(values.b ?? '').trim().toUpperCase(); return /^[A-Z]{1,12}$/.test(a) && /^[A-Z]{1,12}$/.test(b) ? { input: { mode, a, b } } : { error: 'Two strings of up to 12 capital letters.' }; }
  const a = String(values.a ?? '').trim(), b = String(values.b ?? '').trim();
  return /^(0|[1-9]\d{0,4})$/.test(a) && /^(0|[1-9]\d{0,4})$/.test(b) ? { input: { mode, a, b } } : { error: 'Two numbers of up to 5 digits, no leading zeros.' };
}

export function mathWalkValues(input) {
  const { mode } = input;
  if (mode === 'palindrome' || mode === 'reverse') return { x: String(input.x) };
  if (mode === 'trailing' || mode === 'good' || mode === 'excel') return { n: String(input.n) };
  if (mode === 'shuffle' || mode === 'reservoir') return { nums: input.nums.join(', '), seed: String(input.seed) };
  if (mode === 'rand10') return { rolls: input.rolls.map((p) => p.join(' ')).join(', ') };
  if (mode === 'plusone') return { digits: input.digits.join(', ') };
  if (mode === 'roman') return { s: input.s };
  return { a: input.a, b: input.b };
}

export function randomMathWalk(input, rand = Math.random) {
  const g = rng(rand);
  const { mode } = input;
  if (mode === 'palindrome') { const half = String(g.int(1, 999)); return { mode, x: g.bool(0.5) ? Number(half + [...half].reverse().join('').slice(g.int(0, 1))) : g.int(-50, 100000) }; }
  if (mode === 'reverse') return { mode, x: g.bool(0.2) ? g.pick([1563847412, -2147483648, 2147483647, 1534236469]) : g.int(-99999, 99999) };
  if (mode === 'trailing') return { mode, n: g.int(0, 60) };
  if (mode === 'good') return { mode, n: g.int(1, 5) };
  if (mode === 'shuffle') return { mode, nums: g.shuffle(Array.from({ length: 9 }, (_, k) => k + 1)).slice(0, g.int(1, 7)), seed: g.int(0, 999) };
  if (mode === 'reservoir') return { mode, nums: Array.from({ length: g.int(1, 7) }, () => g.int(1, 9)), seed: g.int(0, 999) };
  if (mode === 'rand10') return { mode, rolls: Array.from({ length: g.int(1, 5) }, () => [g.int(1, 7), g.int(1, 7)]) };
  if (mode === 'plusone') { const d = Array.from({ length: g.int(1, 6) }, () => (g.bool(0.5) ? 9 : g.int(0, 9))); if (d.length > 1 && d[0] === 0) d[0] = 1; return { mode, digits: d }; }
  if (mode === 'roman') { const v = g.int(1, 3999); const T = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]; let x = v, s = ''; for (const [k, t] of T) while (x >= k) { s += t; x -= k; } return { mode, s }; }
  if (mode === 'excel') return { mode, n: g.int(1, 2000) };
  if (mode === 'gcdstr') { const base = g.pick(['A', 'AB', 'ABC', 'XY']); return g.bool(0.6) ? { mode, a: base.repeat(g.int(1, 4)), b: base.repeat(g.int(1, 4)) } : { mode, a: base.repeat(g.int(1, 3)), b: `${base}Z` }; }
  return { mode, a: String(g.int(0, 9999)), b: String(g.int(0, 999)) };
}

export const mathWalkFields = (input) => ({
  palindrome: [{ name: 'x', label: 'x', placeholder: '1221', short: true }],
  reverse: [{ name: 'x', label: 'x', placeholder: '-123', short: true }],
  trailing: [{ name: 'n', label: 'n (0 to 60)', placeholder: '30', short: true }],
  good: [{ name: 'n', label: 'n (1 to 6)', placeholder: '4', short: true }],
  shuffle: [{ name: 'nums', label: 'nums', placeholder: '1, 2, 3, 4, 5' }, { name: 'seed', label: 'seed', placeholder: '7', short: true }],
  reservoir: [{ name: 'nums', label: 'list', placeholder: '4, 8, 1, 6, 3' }, { name: 'seed', label: 'seed', placeholder: '3', short: true }],
  rand10: [{ name: 'rolls', label: 'rand7 rolls (pairs)', placeholder: '3 5, 7 4, 1 2' }],
  plusone: [{ name: 'digits', label: 'digits', placeholder: '1, 2, 9, 9' }],
  roman: [{ name: 's', label: 'numeral', placeholder: 'MCMXCIV', short: true }],
  excel: [{ name: 'n', label: 'column number', placeholder: '701', short: true }],
  gcdstr: [{ name: 'a', label: 'str1', placeholder: 'ABABAB', short: true }, { name: 'b', label: 'str2', placeholder: 'ABAB', short: true }],
  multiply: [{ name: 'a', label: 'num1', placeholder: '123', short: true }, { name: 'b', label: 'num2', placeholder: '456', short: true }],
})[input.mode];

export function mathWalkDescribe(input) {
  const { mode } = input;
  if (mode === 'palindrome' || mode === 'reverse') return `x = ${input.x}`;
  if (mode === 'trailing' || mode === 'good' || mode === 'excel') return `n = ${input.n}`;
  if (mode === 'shuffle' || mode === 'reservoir') return list(input.nums);
  if (mode === 'rand10') return `${input.rolls.length} pair${input.rolls.length === 1 ? '' : 's'} of rolls`;
  if (mode === 'plusone') return list(input.digits);
  if (mode === 'roman') return input.s;
  return `"${input.a}", "${input.b}"`;
}

export const mathWalkRule = {
  palindrome: 'reverse the back half until it reaches the front half',
  reverse: 'pop, check the limit, push',
  trailing: 'count factors of 5: n/5 + n/25 + …',
  good: '5^(even positions) · 4^(odd positions)',
  shuffle: 'swap i with a random j in [i, n − 1]',
  reservoir: 'keep the i-th node with probability 1/i',
  rand10: 'two rolls → one of 49 cells; keep 1..40',
  plusone: 'carry while the digit is 9',
  roman: 'subtract a symbol smaller than its right neighbour',
  excel: 'n−−, then % 26 and / 26',
  gcdstr: 'a + b == b + a, then the gcd-length prefix',
  multiply: 'a[i] · b[j] lands at i + j + 1',
};
