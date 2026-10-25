import { I32 } from './lib.mjs';

const bin = (g, n) => (n === 1 && g.bool(0.2) ? '0' : '1' + g.str(n - 1, '01'));
const bits = (g) => (g.bool(0.5) ? g.int(...I32) : g.pick([0, 1, -1, 2, 3, I32[0], I32[1], -2, 0x55555555, -0x55555556, 43261596, 1 << 30, g.int(...I32), g.int(0, 1024)]));

export default {
  'single-number': (g) => { const vals = g.ints(g.len(0, 30, 12) + 1, -3e4, 3e4, { distinct: true }); const one = vals.pop(); return [g.shuffle([...vals, ...vals, one])]; },
  'number-of-1-bits': (g) => [bits(g)],
  'power-of-two': (g) => [g.pick([0, 1, 2, 3, -2, -1, 1 << 30, (1 << 30) + 1, I32[0], I32[1], 2 ** g.int(0, 30), 2 ** g.int(0, 30) - 1, g.int(...I32)])],
  'missing-number': (g) => { const n = g.len(1, 1e4, 25); const a = g.perm(n + 1); a.splice(g.int(0, n), 1); return [a]; },
  'counting-bits': (g) => [g.bool(0.5) ? g.int(0, 2000) : g.pick([0, 1, 2, 3, 7, 8, 16, 31, 32, 63, 64, 100, 255, 256, 1023, 1024, g.int(0, 2000)])],
  'reverse-bits': (g) => [bits(g)],
  'single-number-ii': (g) => { const vals = g.ints(g.len(0, 20, 8) + 1, ...(g.bool() ? I32 : [-5, 5]), { distinct: true }); const one = vals.pop(); return [g.shuffle([...vals, ...vals, ...vals, one])]; },
  'sum-of-two-integers': (g) => [g.val(-1000, 1000), g.val(-1000, 1000)],
  'single-number-iii': (g) => { const vals = g.ints(g.len(0, 20, 8) + 2, ...(g.bool() ? I32 : [-5, 5]), { distinct: true }); const [a, b] = [vals.pop(), vals.pop()]; return [g.shuffle([...vals, ...vals, a, b])]; },
  'add-binary': (g) => [bin(g, g.len(1, 1e4, 40)), bin(g, g.len(1, 1e4, 40))],
  'bitwise-and-of-numbers-range': (g) => {
    const a = g.pick([0, 1, 5, 2 ** 30, I32[1], g.int(0, I32[1]), g.int(0, 1000)]);
    const b = g.pick([a, a + 1, I32[1], 2 ** 31 - 2, a + g.int(0, 1000), g.int(a, I32[1])]);
    return [a, Math.min(I32[1], Math.max(a, b))];
  },
  'minimum-array-end': (g) => [g.pick([1, 2, 3, 1e8, g.int(1, 100), g.int(1, 1e8)]), g.pick([1, 2, 4, 7, 1e8, 2 ** 26 - 1, g.int(1, 100), g.int(1, 1e8)])],
};
