import { I32, UPPER } from './lib.mjs';

const ROMAN = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
const roman = (n) => { let s = ''; for (const [v, r] of ROMAN) while (n >= v) { s += r; n -= v; } return s; };
const decimal = (g, n) => { let s = String(g.int(1, 9)); for (let i = 1; i < n; i++) s += g.int(0, 9); return s; };

export default {
  'find-greatest-common-divisor-of-array': (g) => { const k = g.pick([1, 2, 3, 6, 7, 12]); return [g.ints(g.len(2, 1000, 15), 1, Math.floor(1000 / k)).map((v) => (g.bool(0.8) ? v * k : v))]; },
  'palindrome-number': (g) => {
    const k = g.int(0, 3);
    if (k === 0) { const half = String(g.int(1, 99999)); const s = half + (g.bool() ? String(g.int(0, 9)) : '') + [...half].reverse().join(''); const v = Number(s); return [v <= I32[1] ? v : 1221]; }
    return [g.bool(0.4) ? g.int(...I32) : g.pick([0, 1, -1, 10, -121, 121, 1000000001, I32[0], I32[1], 2147447412, g.int(...I32), g.int(0, 1000)])];
  },
  'count-primes': (g) => [g.pick([0, 1, 2, 3, 4, 5, 10, 11, 12, 100, 499979, 5e6, g.int(0, 200), g.int(0, 1e4), g.int(0, 1e5)])],
  'powx-n': (g) => {
    const x = g.pick([0, 1, -1, 2, -2, 0.5, -0.5, 1.00001, 0.99999, 2.1, 34.00515, -99.99, 99.99, 0.00001, Math.round((g.rand() * 20 - 10) * 1e4) / 1e4]);
    const n = g.pick([0, 1, -1, 2, 3, 10, -10, 31, I32[0], I32[1], g.int(-20, 20), g.int(...I32)]);
    if (x === 0 && n <= 0) return null;
    const r = x ** n;
    return Number.isFinite(r) && Math.abs(r) <= 1e4 ? [x, n] : null;
  },
  'reverse-integer': (g) => [g.pick([0, 1, -1, 10, 120, -123, 1534236469, 1463847412, -2147483412, I32[0], I32[1], g.int(...I32), g.int(-1e5, 1e5)])],
  'factorial-trailing-zeroes': (g) => [g.bool(0.5) ? g.int(0, 1e4) : g.pick([0, 1, 4, 5, 6, 24, 25, 26, 124, 125, 126, 1e4, 9999, g.int(0, 1e4)])],
  'count-good-numbers': (g) => [g.pick([1, 2, 3, 4, 50, 1e15, 1e15 - 1, 999999999999999, g.int(1, 100), g.int(1, 1e9), Math.floor(g.rand() * 1e15) + 1])],
  'shuffle-an-array': (g) => { const nums = g.ints(g.len(1, 50, 10), -1e6, 1e6, { distinct: true }); const k = g.len(1, 30, 12); return [['Solution', ...Array.from({ length: k }, () => g.pick(['shuffle', 'reset']))], [[nums], ...Array(k).fill([])]]; },
  'linked-list-random-node': (g) => { const list = g.ints(g.len(1, 1e4, 12), -1e4, 1e4); const k = g.len(1, 30, 12); return [['Solution', ...Array(k).fill('getRandom')], [[list], ...Array(k).fill([])]]; },
  'implement-rand10-using-rand7': (g) => [g.bool(0.5) ? g.int(1, 300) : g.pick([1, 2, 3, 10, 20, 50, 100, 1000, g.int(1, 200)])],
  'plus-one': (g) => { const n = g.len(1, 100, 12); if (g.bool(0.25)) return [Array(n).fill(9)]; const d = [...decimal(g, n)].map(Number); if (g.bool(0.3)) for (let i = n - g.int(1, n); i < n; i++) d[i] = 9; return [d.length === 1 && g.bool(0.2) ? [0] : d]; },
  'roman-to-integer': (g) => [roman(g.bool(0.5) ? g.int(1, 3999) : g.pick([1, 3, 4, 9, 14, 40, 90, 400, 900, 1994, 3999, 3888, 2024, g.int(1, 3999), g.int(1, 50)]))],
  'excel-sheet-column-title': (g) => [g.bool(0.5) ? g.int(1, g.pick([1000, 2e5, 2 ** 31 - 1])) : g.pick([1, 26, 27, 52, 53, 701, 702, 703, 18278, 18279, I32[1], g.int(1, 1000), g.int(1, I32[1])])],
  'greatest-common-divisor-of-strings': (g) => {
    const base = g.str(g.int(1, 4), g.pick(['AB', 'ABC', UPPER]));
    if (g.bool(0.35)) return [g.str(g.len(1, 1000, 12), 'AB'), g.str(g.len(1, 1000, 12), 'AB')];
    const a = base.repeat(g.int(1, 12)), b = base.repeat(g.int(1, 12));
    return g.bool(0.2) ? [a + base[0], b] : [a, b];
  },
  'multiply-strings': (g) => [g.bool(0.15) ? '0' : decimal(g, g.len(1, 200, 25)), g.bool(0.15) ? '0' : g.bool(0.2) ? '9'.repeat(g.len(1, 200, 25)) : decimal(g, g.len(1, 200, 25))],
};
