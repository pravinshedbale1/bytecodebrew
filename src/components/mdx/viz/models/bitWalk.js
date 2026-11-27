/**
 * <BitWalkViz>: the Bit Manipulation lesson's problems, one engine. A step is a few rows of cells lined
 * up by place value (column k is worth 2^(w − 1 − k)), each { label, cells, op?, result?, dec?, tags? },
 * where cells are '0' / '1' (bits), other short text (counts, '·') or '' (blank), and tags map a column
 * index to low | flip | gone | cancel | cur | hit | dim. Plus optional chips.
 * Pure, so scripts/viz-check.mjs can compare each mode with an independent brute force.
 */
import { list, rng } from './util.js';

export const BIT_WALK = {
  pow2: { label: 'Power of two: 16', input: { mode: 'pow2', n: 16 } },
  pow2No: { label: 'Power of two: 6', input: { mode: 'pow2', n: 6 } },
  countbits: { label: 'Counting bits', input: { mode: 'countbits', n: 5 } },
  reverse: { label: 'Reverse bits (8-bit)', input: { mode: 'reverse', n: 13 } },
  single2: { label: 'Single number II', input: { mode: 'single2', a: [2, 2, 3, 2] } },
  single2b: { label: 'Single number II: more bits', input: { mode: 'single2', a: [5, 6, 5, 6, 9, 5, 6] } },
  sum: { label: 'Sum without +', input: { mode: 'sum', a: 5, b: 7 } },
  single3: { label: 'Single number III', input: { mode: 'single3', a: [1, 2, 1, 3, 2, 5] } },
  addbinary: { label: 'Add binary', input: { mode: 'addbinary', a: '1011', b: '111' } },
  rangeand: { label: 'AND of a range', input: { mode: 'rangeand', left: 5, right: 7 } },
  rangeand2: { label: 'AND of a range: bigger', input: { mode: 'rangeand', left: 26, right: 30 } },
  arrayend: { label: 'Minimum array end', input: { mode: 'arrayend', n: 3, x: 4 } },
  arrayend2: { label: 'Array end: free slots', input: { mode: 'arrayend', n: 6, x: 9 } },
};

export const bitWalkCode = (mode) => ({
  pow2: [['neg', 'if (n <= 0) return false;'], ['test', 'return (n & (n − 1)) == 0;     // one 1-bit: n − 1 flips it and everything below']],
  countbits: [['base', 'ans[0] = 0;'], ['fill', 'ans[i] = ans[i >> 1] + (i & 1);    // drop the last bit, then add it back']],
  reverse: [['loop', 'for (k = 0; k < 32; k++) {'], ['take', '    res = (res << 1) | ((n >> k) & 1);   // lowest remaining bit goes in next'], ['end', '}']],
  single2: [['count', 'for each bit b: count how many numbers have bit b set'], ['mod', 'bit b of the answer = count % 3        // triples add 0, 3, 6 …'], ['ans', 'return the bits put together;']],
  sum: [['loop', 'while (b != 0) {'], ['xor', '    sum = a ^ b;            // add each column, ignoring carries'], ['carry', '    carry = (a & b) << 1;   // a carry where both bits are 1, moved left'], ['next', '    a = sum; b = carry;'], ['end', '} return a;']],
  single3: [['xor', 'x = XOR of everything            // pairs cancel: x = p ^ q'], ['low', 'diff = x & −x                     // a bit where p and q differ'], ['split', 'XOR the numbers with that bit set → one single; the rest → the other']],
  addbinary: [['col', 'from the right: s = a[i] + b[j] + carry'], ['digit', 'write s % 2, carry = s / 2'], ['end', 'a carry left at the end becomes a leading 1']],
  rangeand: [['loop', 'while (left != right) { left >>= 1; right >>= 1; shift++; }'], ['ans', 'return left << shift;              // the common prefix, zeros after']],
  arrayend: [['slots', 'the 0-bits of x are free: every number must keep all of x\'s 1-bits'], ['place', 'write the bits of n − 1 into x\'s free slots, lowest first'], ['ans', 'return that number']],
})[mode];

const bitlen = (v) => Math.max(1, v.toString(2).length);
const B = (v, w) => v.toString(2).padStart(w, '0').split('');
const placeHeads = (w) => Array.from({ length: w }, (_, k) => String(2 ** (w - 1 - k)));
const popcount = (v) => v.toString(2).split('').filter((c) => c === '1').length;

// ---------------------------------------------------------------- brute forces

export function bitWalkAnswer(input) {
  const { mode } = input;
  if (mode === 'pow2') { let p = 1; while (p < input.n) p *= 2; return String(input.n >= 1 && p === input.n); }
  if (mode === 'countbits') return Array.from({ length: input.n + 1 }, (_, i) => popcount(i));
  if (mode === 'reverse') return parseInt(input.n.toString(2).padStart(8, '0').split('').reverse().join(''), 2);
  if (mode === 'single2') { const c = {}; input.a.forEach((v) => { c[v] = (c[v] ?? 0) + 1; }); return Number(Object.keys(c).find((k) => c[k] === 1)); }
  if (mode === 'sum') return input.a + input.b;
  if (mode === 'single3') { const c = {}; input.a.forEach((v) => { c[v] = (c[v] ?? 0) + 1; }); return Object.keys(c).filter((k) => c[k] === 1).map(Number).sort((x, y) => x - y); }
  if (mode === 'addbinary') return (parseInt(input.a, 2) + parseInt(input.b, 2)).toString(2);
  if (mode === 'rangeand') { let r = input.left; for (let v = input.left; v <= input.right; v++) r &= v; return r; }
  // arrayend: simulate, each next number the smallest above the last that keeps every bit of x
  let v = input.x;
  for (let k = 1; k < input.n; k++) { v++; while ((v & input.x) !== input.x) v++; }
  return v;
}

// ---------------------------------------------------------------- step-throughs

export function bitWalk(input) {
  const { mode } = input;
  const steps = [];
  const snap = (x) => steps.push({ mode, heads: null, rows: [], chips: null, ...x });
  const R = (label, v, w, o = {}) => ({ label, cells: B(v, w), dec: String(v), tags: {}, ...o });

  if (mode === 'pow2') {
    const { n } = input;
    if (n <= 0) {
      snap({ kind: 'start', lines: ['neg'], rows: [], title: `Is ${n} a power of two?`, text: 'A power of two is 1, 2, 4, 8, …: always at least 1. Zero and negative numbers can never be one, so check that first. (In 32-bit two\'s complement a negative number starts with a 1 in the sign bit, so the bit trick alone would be fooled by the most negative int.)', calc: [`${n} ≤ 0`] });
      snap({ kind: 'done', lines: ['neg'], rows: [], out: 'false', answer: 'false', title: `${n} is not a power of two`, text: 'Rejected before any bit work.', calc: ['false'] });
      return steps;
    }
    const w = Math.max(4, bitlen(n)), m = n - 1, low = n & -n;
    const flip = {};
    for (let k = 0; k < w; k++) if (2 ** (w - 1 - k) <= low) flip[k] = 2 ** (w - 1 - k) === low ? 'low' : 'flip';
    snap({ kind: 'start', lines: ['neg'], heads: placeHeads(w), rows: [R('n', n, w)], title: `Is ${n} a power of two?`, text: `A power of two is a single 1 followed by zeros: 1, 10, 100, 1000 in binary. ${n} = ${n.toString(2)} has ${popcount(n)} one${popcount(n) === 1 ? '' : 's'}. One step can test that without counting.`, calc: [`${n} = ${n.toString(2)}₂`] });
    snap({ kind: 'sub', lines: ['test'], heads: placeHeads(w), rows: [R('n', n, w, { tags: flip }), R('n − 1', m, w, { tags: flip })], title: 'n − 1 flips the lowest 1 and every bit below it', text: `Subtracting 1 borrows from the lowest 1 (worth ${low}): it turns off and the zeros below it turn on. Every column to its left is unchanged.`, calc: [`${n} − 1 = ${m}`] });
    const r = n & m;
    snap({ kind: r ? 'fail' : 'match', lines: ['test'], heads: placeHeads(w), rows: [R('n', n, w, { tags: flip }), R('n − 1', m, w, { op: '&', tags: flip }), R('n & (n − 1)', r, w, { result: true })], title: r ? `${r} ≠ 0: more than one 1-bit` : '0: the only 1-bit was removed', text: r ? `The changed columns cancel, but the 1s to the left of the lowest one survive the AND. Something is left, so ${n} has more than one 1: not a power of two.` : `The lowest 1 was the only 1, so nothing survives the AND. ${n} is a power of two.`, calc: [`${n} & ${m} = ${r}`] });
    snap({ kind: 'done', lines: ['test'], heads: placeHeads(w), rows: [R('n', n, w)], out: String(!r), answer: String(!r), title: r ? `${n} is not a power of two` : `${n} = 2^${Math.log2(n)}: true`, text: 'O(1): one subtraction and one AND, no loop.', calc: [String(!r)] });
    return steps;
  }

  if (mode === 'countbits') {
    const { n } = input, w = Math.max(3, bitlen(Math.max(1, n)));
    const ans = [0];
    const chips = () => [{ label: 'ans', chips: ans.map((v, i) => ({ key: i, text: `${i}: ${v}`, tone: i === ans.length - 1 && i ? 'success' : undefined })) }];
    snap({ kind: 'start', lines: ['base'], heads: placeHeads(w), rows: [R('0', 0, w)], chips: chips(), title: `1-bits of every number from 0 to ${n}`, text: 'Counting each number\'s bits separately is O(n log n). But i >> 1 is i with its last bit chopped off: a smaller number whose count is already known. So ans[i] = ans[i >> 1] plus the bit that was chopped, i & 1.', calc: ['ans[0] = 0'] });
    for (let i = 1; i <= n; i++) {
      const h = i >> 1, b = i & 1;
      ans.push(ans[h] + b);
      snap({ kind: 'fill', lines: ['fill'], heads: placeHeads(w), rows: [R('i', i, w, { tags: { [w - 1]: 'cur' } }), R('i >> 1', h, w, { op: '>>' })], chips: chips(), title: `ans[${i}] = ans[${h}] + ${b} = ${ans[i]}`, text: `${i} = ${i.toString(2)}. Shift right: ${h} = ${h.toString(2) || '0'}, whose count ${ans[h]} is already in the table. The bit shifted out (circled) is ${b}.`, calc: [`ans[${i}] = ${ans[h]} + ${b} = ${ans[i]}`] });
    }
    snap({ kind: 'done', lines: ['fill'], heads: placeHeads(w), rows: [R('n', n, w)], chips: chips(), out: ans, answer: list(ans), title: `ans = ${list(ans)}`, text: 'One addition per number: O(n). ans[i & (i − 1)] + 1 works too: i & (i − 1) drops the lowest 1 instead of the last bit.', calc: [list(ans)] });
    return steps;
  }

  if (mode === 'reverse') {
    const { n } = input, w = 8;
    const nb = B(n, w);
    let res = 0;
    const resCells = () => Array.from({ length: w }, (_, j) => '·');
    const filled = resCells();
    snap({ kind: 'start', lines: [], heads: placeHeads(w), rows: [R('n', n, w)], title: `Reverse the bits of ${n} (shown with 8 bits)`, text: 'The real problem uses all 32 bits; the idea is the same with 8. Read n from its lowest bit up, and push each bit onto the result from the right: the first bit read ends up highest. Leading zeros count, so a small number becomes a big one.', calc: [`${n} = ${nb.join('')}₂`] });
    for (let k = 0; k < w; k++) {
      const bit = (n >> k) & 1;
      res = (res << 1) | bit;
      filled[k] = String(bit);
      snap({ kind: 'move', lines: ['loop', 'take'], heads: placeHeads(w), rows: [R('n', n, w, { tags: { [w - 1 - k]: 'cur' } }), { label: 'result', cells: [...filled], dec: k === w - 1 ? String(res) : '', tags: { [k]: 'hit' }, result: true }], title: `Bit ${k} of n (${bit}) becomes bit ${w - 1 - k}`, text: `Take bit ${k} of n, (n >> ${k}) & 1 = ${bit}, and shift it into the result. After all ${w} bits it will have travelled to place ${w - 1 - k}, the mirror position.`, calc: [`res = ${res.toString(2)}`] });
    }
    snap({ kind: 'done', lines: ['end'], heads: placeHeads(w), rows: [R('n', n, w), { label: 'reversed', cells: B(res, w), dec: String(res), tags: {}, result: true }], out: res, answer: `${res}`, title: `${n} → ${res}`, text: 'The row reads the same backwards. In Java with 32 bits the result can be negative when the new top bit is 1; the bits are still right. O(32).', calc: [`${nb.join('')} → ${B(res, w).join('')}`] });
    return steps;
  }

  if (mode === 'single2') {
    const { a } = input, w = Math.max(2, bitlen(Math.max(...a)));
    const count = Array(w).fill(0);
    const rowsUpTo = (k) => a.slice(0, k).map((v, i) => R(`a[${i}]`, v, w));
    snap({ kind: 'start', lines: [], heads: placeHeads(w), rows: [{ label: 'count', cells: count.map(String), dec: '', tags: {} }], title: `Every value three times except one: ${list(a)}`, text: 'XOR fails here: three copies leave one copy behind. Look at one column at a time instead. Each value seen three times adds 0 or 3 to the column\'s count of 1s; the single value adds 0 or 1. So the count modulo 3 is exactly the single value\'s bit in that column.', calc: [`${a.length} numbers`] });
    a.forEach((v, i) => {
      const bits = B(v, w);
      bits.forEach((c, k) => { if (c === '1') count[k]++; });
      snap({ kind: 'add', lines: ['count'], heads: placeHeads(w), rows: [...rowsUpTo(i + 1), { label: 'count', cells: count.map(String), dec: '', tags: Object.fromEntries(bits.map((c, k) => [k, c === '1' ? 'flip' : null]).filter(([, t]) => t)), result: false }], title: `Add ${v} = ${bits.join('')}: counts ${count.join(' ')}`, text: `Each column where ${v} has a 1 gets one more in its count (highlighted).`, calc: [`count = ${count.join(', ')}`] });
    });
    const res = count.map((c) => c % 3);
    const val = parseInt(res.join(''), 2);
    snap({ kind: 'match', lines: ['mod', 'ans'], heads: placeHeads(w), rows: [{ label: 'count', cells: count.map(String), dec: '', tags: {} }, { label: '% 3', cells: res.map(String), dec: String(val), tags: {}, result: true, op: '%' }], out: val, answer: `${val}`, title: `count % 3 → ${res.join('')} = ${val}`, text: `Columns with a count of 3 or 6 belong to the triples only, so they give 0. A count of ${count.filter((c) => c % 3 === 1).length ? count.filter((c) => c % 3 === 1)[0] : 1} leaves 1 over: that 1 came from the single value. Put the leftover bits together: ${val}.`, calc: [`${count.join(' ')} → ${res.join(' ')}`] });
    snap({ kind: 'done', lines: ['ans'], heads: placeHeads(w), rows: [R('single', val, w, { result: true })], out: val, answer: `${val}`, title: `The single number is ${val}`, text: 'O(32 · n) time, 32 counters (or two bitmasks, "ones" and "twos", for O(1) memory). Negative numbers work too: the sign bit is just one more column.', calc: [`= ${val}`] });
    return steps;
  }

  if (mode === 'sum') {
    let a = input.a, b = input.b;
    const w = Math.max(4, bitlen(input.a + input.b));
    snap({ kind: 'start', lines: [], heads: placeHeads(w), rows: [R('a', a, w), R('b', b, w, { op: '+' })], title: `${a} + ${b} without + or −`, text: 'Add in binary the way you add on paper, but split each round into two parts. XOR adds every column and ignores carries (1 + 1 gives 0). AND finds the columns where both bits are 1: those produce a carry, which belongs one column to the left. Then add the carries the same way, until there are none.', calc: [`${a} = ${a.toString(2)}`, `${b} = ${b.toString(2)}`] });
    let round = 0;
    while (b) {
      round++;
      const s = a ^ b, c = (a & b) << 1;
      const both = Object.fromEntries(B(a & b, w).map((x, k) => [k, x === '1' ? 'cancel' : null]).filter(([, t]) => t));
      snap({ kind: 'xor', lines: ['loop', 'xor', 'carry', 'next'], heads: placeHeads(w), rows: [R('a', a, w, { tags: both }), R('b', b, w, { op: '^', tags: both }), R('a ^ b', s, w, { result: true }), R('(a&b)<<1', c, w, { tags: Object.fromEntries(B(c, w).map((x, k) => [k, x === '1' ? 'flip' : null]).filter(([, t]) => t)) })], title: `Round ${round}: sum ${s}, carry ${c}`, text: `${a & b ? `Columns where both are 1 (crossed) give 0 in the XOR and send a carry one place left: carry = ${c}.` : 'No column has two 1s, so there is no carry.'} The XOR is the sum without carries: ${s}. Next round adds ${s} and ${c}.`, calc: [`${a} ^ ${b} = ${s}`, `(${a} & ${b}) << 1 = ${c}`] });
      a = s; b = c;
    }
    snap({ kind: 'done', lines: ['end'], heads: placeHeads(w), rows: [R('sum', a, w, { result: true })], out: a, answer: `${a}`, title: `${input.a} + ${input.b} = ${a}`, text: `The carry ran out after ${round || 0} round${round === 1 ? '' : 's'}. Each round moves carries at least one column left, so there are at most 32 rounds. In Java this works for negative numbers too, because two's complement makes subtraction the same addition.`, calc: [`= ${a}`] });
    return steps;
  }

  if (mode === 'single3') {
    const { a } = input, w = Math.max(3, bitlen(Math.max(...a)));
    const x = a.reduce((p, q) => p ^ q, 0), low = x & -x;
    const lowCol = w - 1 - Math.log2(low);
    snap({ kind: 'xor', lines: ['xor'], heads: placeHeads(w), rows: [...a.map((v, i) => R(`a[${i}]`, v, w, { op: i ? '^' : undefined })), R('x', x, w, { result: true })], title: `XOR everything: x = ${x}`, text: `The pairs cancel, so x = p ^ q for the two single values p and q. They can't be equal, so x ≠ 0: every 1 in x is a column where p and q differ.`, calc: [`x = ${x} = ${x.toString(2)}`] });
    snap({ kind: 'sub', lines: ['low'], heads: placeHeads(w), rows: [R('x', x, w, { tags: { [lowCol]: 'low' } }), R('x & −x', low, w, { result: true, tags: { [lowCol]: 'low' } })], title: `Pick the lowest 1 of x: the ${low}s column`, text: `x & −x keeps only the lowest 1 of x. In that column one single value has a 1 and the other has a 0, so testing that bit separates them.`, calc: [`diff = ${low}`] });
    const g1 = a.filter((v) => v & low), g0 = a.filter((v) => !(v & low));
    const p = g1.reduce((s, v) => s ^ v, 0), q = g0.reduce((s, v) => s ^ v, 0);
    snap({ kind: 'match', lines: ['split'], heads: placeHeads(w), rows: [...g1.map((v) => R(String(v), v, w, { tags: { [lowCol]: 'hit' } })), R('XOR', p, w, { result: true })], chips: [{ label: `bit ${low} set`, chips: g1.map((v, k) => ({ key: k, text: String(v), tone: 'accent' })) }], title: `Group with the ${low}s bit set → ${p}`, text: `Both copies of any pair land in the same group (they are equal), so pairs still cancel inside a group. This group holds exactly one single value: ${p}.`, calc: [`${g1.join(' ^ ')} = ${p}`] });
    snap({ kind: 'match', lines: ['split'], heads: placeHeads(w), rows: [...g0.map((v) => R(String(v), v, w, { tags: { [lowCol]: 'dim' } })), R('XOR', q, w, { result: true })], chips: [{ label: `bit ${low} clear`, chips: g0.map((v, k) => ({ key: k, text: String(v) })) }], title: `The other group → ${q}`, text: `The numbers without that bit cancel down to the other single value, ${q}. (Or: q = x ^ p.)`, calc: [`${g0.join(' ^ ')} = ${q}`] });
    const out = [p, q].sort((m, k) => m - k);
    snap({ kind: 'done', lines: ['split'], heads: placeHeads(w), rows: [R('p', p, w, { result: true }), R('q', q, w, { result: true })], out, answer: list(out), title: `The singles are ${p} and ${q}`, text: 'Two passes, O(n) time and O(1) memory. In Java, x & −x on Integer.MIN_VALUE is still fine: it is its own lowest bit.', calc: [list(out)] });
    return steps;
  }

  if (mode === 'addbinary') {
    const { a, b } = input, w = Math.max(a.length, b.length) + 1;
    const pad = (s) => [...Array(w - s.length).fill(''), ...s];
    const A = pad(a), Bb = pad(b);
    const carry = Array(w).fill(''), out = Array(w).fill('');
    let c = 0;
    const view = (k, extra = {}) => ({ heads: null, rows: [{ label: 'carry', cells: [...carry], dec: '', tags: k !== null ? { [k]: 'cur' } : {} }, { label: 'a', cells: A, dec: '', tags: k !== null ? { [k]: 'cur' } : {} }, { label: 'b', cells: Bb, dec: '', op: '+', tags: k !== null ? { [k]: 'cur' } : {} }, { label: 'sum', cells: [...out], dec: '', result: true, tags: k !== null ? { [k]: 'hit' } : {} }], ...extra });
    snap({ kind: 'start', lines: [], ...view(null), title: `"${a}" + "${b}"`, text: 'Line the strings up on the right and add column by column, exactly like decimal addition but with digits 0 and 1: 1 + 1 = 10, so write 0 and carry 1. The numbers can be 10⁴ digits long, far too big to convert to an int.', calc: [`a = ${a}`, `b = ${b}`] });
    for (let k = w - 1; k >= 1; k--) {
      const s = Number(A[k] || 0) + Number(Bb[k] || 0) + c;
      const cin = c;
      out[k] = String(s % 2); c = s >> 1;
      if (c) carry[k - 1] = '1';
      snap({ kind: s >= 2 ? 'carry' : 'fill', lines: ['col', 'digit'], ...view(k), title: `${A[k] || 0} + ${Bb[k] || 0}${cin ? ' + carry 1' : ''} = ${s}: write ${s % 2}${c ? ', carry 1' : ''}`, text: s >= 2 ? `The column adds up to ${s} = ${s.toString(2)} in binary: write ${s % 2} and carry 1 into the next column.` : `The column adds up to ${s}: write it, nothing to carry.`, calc: [`s = ${s}`, `carry = ${c}`] });
    }
    if (c) { out[0] = '1'; snap({ kind: 'carry', lines: ['end'], ...view(0), title: 'A carry is left: write a leading 1', text: 'The last column produced a carry, so the sum is one digit longer than both inputs.', calc: ['leading 1'] }); }
    const ans = out.join('').replace(/^0+(?=.)/, '') || '0';
    snap({ kind: 'done', lines: ['end'], ...view(null), out: ans, answer: `"${ans}"`, title: `"${a}" + "${b}" = "${ans}"`, text: 'One pass from the right with a single carry: O(max(len a, len b)). Build the digits in a StringBuilder and reverse once at the end.', calc: [`"${ans}"`] });
    return steps;
  }

  if (mode === 'rangeand') {
    const { left, right } = input, w = Math.max(3, bitlen(right));
    let l = left, r = right, shift = 0;
    const dims = () => Object.fromEntries(Array.from({ length: shift }, (_, k) => [w - 1 - k, 'dim']));
    snap({ kind: 'start', lines: [], heads: placeHeads(w), rows: [R('left', left, w), R('right', right, w)], title: `AND of every number from ${left} to ${right}`, text: 'Counting from left to right, any bit below the first column where left and right differ must flip at some point, so some number in the range has a 0 there and the AND is 0 in that column. Only the columns where left and right agree from the top (their common prefix) survive. Find it by shifting both right until they are equal.', calc: [`${left} = ${left.toString(2)}`, `${right} = ${right.toString(2)}`] });
    while (l !== r) {
      l >>= 1; r >>= 1; shift++;
      snap({ kind: 'move', lines: ['loop'], heads: placeHeads(w), rows: [R('left', left, w, { tags: dims() }), R('right', right, w, { tags: dims() })], title: `Shift ${shift}: ${l === r ? 'the rest agree' : 'they still differ'}`, text: `Drop the lowest column${shift > 1 ? 's' : ''} (faded). What is left: ${l.toString(2)} and ${r.toString(2)}${l === r ? ', equal: that is the common prefix.' : ', not equal yet.'}`, calc: [`left >> ${shift} = ${l}`, `right >> ${shift} = ${r}`] });
    }
    const ans = l << shift;
    snap({ kind: 'done', lines: ['ans'], heads: placeHeads(w), rows: [R('left', left, w, { tags: dims() }), R('right', right, w, { tags: dims() }), R('AND', ans, w, { result: true })], out: ans, answer: `${ans}`, title: `AND = ${ans}`, text: `Put the common prefix back in place with ${shift} zero${shift === 1 ? '' : 's'} after it. O(32), however big the range. ANDing every number would take up to 2³¹ steps.`, calc: [`${l} << ${shift} = ${ans}`] });
    return steps;
  }

  // arrayend
  const { n, x } = input;
  const k = n - 1;
  let res = x, slot = 0;
  let ans = x;
  { let kk = k, s = 0; while (kk) { while (x >> s & 1) s++; if (kk & 1) ans |= 1 << s; kk >>= 1; s++; } }
  const w = Math.max(3, bitlen(Math.max(ans, k, 1)));
  const free = Object.fromEntries(B(x, w).map((c, j) => [j, c === '0' ? 'cur' : null]).filter(([, t]) => t));
  snap({ kind: 'start', lines: ['slots'], heads: placeHeads(w), rows: [R('x', x, w, { tags: free }), R('n − 1', k, w)], title: `${n} increasing numbers whose AND is ${x}`, text: `The AND keeps a bit only if every number has it, so every number must contain all of x's 1-bits. The numbers that do are x with its 0-bits (circled: the free slots) filled in somehow. Listed from small to large, the i-th such number fills the free slots with the bits of i. So the smallest possible last number fills them with n − 1 = ${k} = ${k.toString(2)}.`, calc: [`x = ${x.toString(2)}`, `n − 1 = ${k.toString(2)}`] });
  let kk = k, bitNo = 0;
  while (kk) {
    while (x >> slot & 1) slot++;
    const bit = kk & 1;
    if (bit) res |= 1 << slot;
    const col = w - 1 - slot;
    snap({ kind: 'place', lines: ['place'], heads: placeHeads(w), rows: [R('x', x, w, { tags: free }), R('n − 1', k, w, { tags: { [w - 1 - bitNo]: 'cur' } }), R('result', res, w, { result: true, tags: { [col]: 'hit' } })], title: `Bit ${bitNo} of n − 1 (${bit}) → the ${2 ** slot}s slot`, text: `The next free slot of x is the ${2 ** slot}s column. Copy bit ${bitNo} of ${k} into it${bit ? `: the result gains ${2 ** slot}` : ' (a 0: nothing changes)'}.`, calc: [`result = ${res}`] });
    kk >>= 1; slot++; bitNo++;
  }
  snap({ kind: 'done', lines: ['ans'], heads: placeHeads(w), rows: [R('x', x, w), R('last', res, w, { result: true })], out: res, answer: `${res}`, title: `Smallest last number: ${res}`, text: `The numbers are x with the free slots counting 0, 1, …, ${k}: strictly increasing, every one contains x, so their AND is ${x}. O(log n) work, versus stepping through numbers one at a time.`, calc: [`= ${res}`] });
  return steps;
}

// ---------------------------------------------------------------- inputs

const ints = (t) => String(t ?? '').replace(/[[\]]/g, ' ').split(/[\s,]+/).filter(Boolean).map(Number);
const isInt = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi;

export function parseBitWalk(values, input) {
  const { mode } = input;
  if (mode === 'pow2') { const n = Number(values.n); return isInt(n, -16, 255) ? { input: { mode, n } } : { error: 'n from −16 to 255.' }; }
  if (mode === 'countbits') { const n = Number(values.n); return isInt(n, 0, 15) ? { input: { mode, n } } : { error: 'n from 0 to 15.' }; }
  if (mode === 'reverse') { const n = Number(values.n); return isInt(n, 0, 255) ? { input: { mode, n } } : { error: 'n from 0 to 255 (8 bits).' }; }
  if (mode === 'single2' || mode === 'single3') {
    const a = ints(values.a);
    if (!a.length || a.length > 8 || !a.every((v) => isInt(v, 0, 31))) return { error: 'Up to 8 numbers from 0 to 31.' };
    const c = {}; a.forEach((v) => { c[v] = (c[v] ?? 0) + 1; });
    const counts = Object.values(c);
    if (mode === 'single2' && !(counts.filter((x) => x === 1).length === 1 && counts.every((x) => x === 1 || x === 3))) return { error: 'Every value three times, except one value once.' };
    if (mode === 'single3' && !(counts.filter((x) => x === 1).length === 2 && counts.every((x) => x === 1 || x === 2))) return { error: 'Every value twice, except two values once each.' };
    return { input: { mode, a } };
  }
  if (mode === 'sum') { const a = Number(values.a), b = Number(values.b); return isInt(a, 0, 63) && isInt(b, 0, 63) ? { input: { mode, a, b } } : { error: 'a and b from 0 to 63.' }; }
  if (mode === 'addbinary') {
    const a = String(values.a ?? '').trim(), b = String(values.b ?? '').trim();
    const ok = (s) => /^(0|1[01]{0,7})$/.test(s);
    return ok(a) && ok(b) ? { input: { mode, a, b } } : { error: 'Two binary strings of up to 8 digits, no leading zeros.' };
  }
  if (mode === 'rangeand') { const l = Number(values.left), r = Number(values.right); return isInt(l, 0, 255) && isInt(r, l, 255) ? { input: { mode, left: l, right: r } } : { error: '0 ≤ left ≤ right ≤ 255.' }; }
  const n = Number(values.n), x = Number(values.x);
  return isInt(n, 1, 16) && isInt(x, 1, 63) ? { input: { mode, n, x } } : { error: 'n from 1 to 16, x from 1 to 63.' };
}

export function bitWalkValues(input) {
  const { mode } = input;
  if (['pow2', 'countbits', 'reverse'].includes(mode)) return { n: String(input.n) };
  if (mode === 'single2' || mode === 'single3') return { a: input.a.join(', ') };
  if (mode === 'sum') return { a: String(input.a), b: String(input.b) };
  if (mode === 'addbinary') return { a: input.a, b: input.b };
  if (mode === 'rangeand') return { left: String(input.left), right: String(input.right) };
  return { n: String(input.n), x: String(input.x) };
}

export function randomBitWalk(input, rand = Math.random) {
  const g = rng(rand);
  const { mode } = input;
  if (mode === 'pow2') return { mode, n: g.bool(0.4) ? 2 ** g.int(0, 7) : g.int(-4, 200) };
  if (mode === 'countbits') return { mode, n: g.int(0, 12) };
  if (mode === 'reverse') return { mode, n: g.int(0, 255) };
  if (mode === 'single2') { const vals = g.shuffle(Array.from({ length: 31 }, (_, k) => k + 1)).slice(0, g.int(1, 3)); return { mode, a: g.shuffle([vals[0], ...vals.slice(1).flatMap((v) => [v, v, v])]) }; }
  if (mode === 'single3') { const vals = g.shuffle(Array.from({ length: 31 }, (_, k) => k)).slice(0, g.int(2, 4)); return { mode, a: g.shuffle([vals[0], vals[1], ...vals.slice(2).flatMap((v) => [v, v])]) }; }
  if (mode === 'sum') return { mode, a: g.int(0, 63), b: g.int(0, 63) };
  if (mode === 'addbinary') { const s = () => { const v = g.int(0, 255); return v.toString(2); }; return { mode, a: s(), b: s() }; }
  if (mode === 'rangeand') { const l = g.int(0, 255); return { mode, left: l, right: g.int(l, Math.min(255, l + g.int(0, 40))) }; }
  return { mode, n: g.int(1, 16), x: g.int(1, 40) };
}

export const bitWalkFields = (input) => ({
  pow2: [{ name: 'n', label: 'n', placeholder: '16', short: true }],
  countbits: [{ name: 'n', label: 'n (0 to 15)', placeholder: '5', short: true }],
  reverse: [{ name: 'n', label: 'n (0 to 255)', placeholder: '13', short: true }],
  single2: [{ name: 'a', label: 'nums (triples + one)', placeholder: '2, 2, 3, 2' }],
  single3: [{ name: 'a', label: 'nums (pairs + two singles)', placeholder: '1, 2, 1, 3, 2, 5' }],
  sum: [{ name: 'a', label: 'a', placeholder: '5', short: true }, { name: 'b', label: 'b', placeholder: '7', short: true }],
  addbinary: [{ name: 'a', label: 'a', placeholder: '1011', short: true }, { name: 'b', label: 'b', placeholder: '111', short: true }],
  rangeand: [{ name: 'left', label: 'left', placeholder: '5', short: true }, { name: 'right', label: 'right', placeholder: '7', short: true }],
  arrayend: [{ name: 'n', label: 'n', placeholder: '3', short: true }, { name: 'x', label: 'x', placeholder: '4', short: true }],
})[input.mode];

export function bitWalkDescribe(input) {
  const { mode } = input;
  if (['pow2', 'countbits', 'reverse'].includes(mode)) return `n = ${input.n}`;
  if (mode === 'single2' || mode === 'single3') return list(input.a);
  if (mode === 'sum') return `${input.a} + ${input.b}`;
  if (mode === 'addbinary') return `"${input.a}" + "${input.b}"`;
  if (mode === 'rangeand') return `[${input.left}, ${input.right}]`;
  return `n = ${input.n}, x = ${input.x}`;
}

export const bitWalkRule = {
  pow2: 'n > 0 and n & (n − 1) == 0',
  countbits: 'ans[i] = ans[i >> 1] + (i & 1)',
  reverse: 'take the lowest bit of n, push it onto the result',
  single2: 'per column: count of 1s, modulo 3',
  sum: 'sum = a ^ b, carry = (a & b) << 1, repeat until no carry',
  single3: 'XOR all, split on a bit where the two singles differ',
  addbinary: 'column by column from the right, with a carry',
  rangeand: 'shift both until equal: the common prefix survives',
  arrayend: 'fill x\'s 0-bits with the bits of n − 1',
};
