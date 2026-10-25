const MAX = 2 ** 31 - 1;

const decodings = (s) => { let a = 1, b = s[0] === '0' ? 0 : 1; for (let i = 1; i < s.length; i++) { const c = (s[i] !== '0' ? b : 0) + (s[i - 1] === '1' || (s[i - 1] === '2' && s[i] <= '6') ? a : 0); a = b; b = c; } return b; };

export default {
  'house-robber': (g) => [g.ints(g.len(1, 100, 30), 0, g.pick([400, 3, 0]))],
  'house-robber-ii': (g) => [g.ints(g.len(1, 100, 30), 0, g.pick([1000, 3, 0]))],
  'maximum-subarray': (g) => [g.ints(g.len(1, 1e5, 30), g.pick([-1e4, -5]), g.pick([1e4, 5, -1]))],
  'maximum-product-subarray': (g) => {
    const a = g.ints(g.len(1, 2e4, 20), -10, 10).map((v) => (g.bool(0.4) ? g.pick([-1, 1, 0, 2, -2]) : v));
    for (let i = 0; i < a.length; i++) { let p = 1; for (let j = i; j < a.length; j++) { p *= a[j]; if (Math.abs(p) > MAX) return null; } }
    return [a];
  },
  'decode-ways': (g) => { const s = g.str(g.len(1, 100, 30), g.pick(['0123456789', '12', '1', '102', '226', '30', '27'])); return decodings(s) <= MAX ? [s] : null; },
  'word-break': (g) => {
    const alpha = g.pick(['ab', 'abc', 'a', 'leetcode']);
    const s = g.str(g.len(1, 300, 30), alpha);
    const dict = [...new Set(Array.from({ length: g.len(1, 1000, 8) }, () => { if (g.bool(0.6)) { const i = g.int(0, s.length - 1); return s.slice(i, i + g.int(1, 5)); } return g.str(g.len(1, 20, 4), alpha); }))];
    return [s, dict];
  },
  'longest-increasing-subsequence': (g) => [g.ints(g.len(1, 2500, 30), -1e4, 1e4)],
  'number-of-longest-increasing-subsequence': (g) => [g.ints(g.len(1, 2000, 25), -1e6, g.pick([1e6, -999995]))],
  'best-time-to-buy-and-sell-stock-with-cooldown': (g) => [g.ints(g.len(1, 5000, 30), 0, g.pick([1000, 5]))],
  'russian-doll-envelopes': (g) => { const p = g.palette(1, g.pick([1e5, 6])); return [Array.from({ length: g.len(1, 1e5, 20) }, () => [p(), p()])]; },
  'integer-break': { all: Array.from({ length: 57 }, (_, i) => [i + 2]) },
  'maximum-sum-circular-subarray': (g) => [g.ints(g.len(1, 3e4, 30), -3e4, g.pick([3e4, -1, 5]))],
  'longest-turbulent-subarray': (g) => [g.ints(g.len(1, 4e4, 30), 0, g.pick([1e9, 2, 1]))],
  'stone-game-iii': (g) => [g.ints(g.len(1, 5e4, 25), -1000, g.pick([1000, 3, -1]))],
};
