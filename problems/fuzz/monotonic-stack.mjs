export default {
  'next-greater-element-i': (g) => {
    const nums2 = g.ints(g.len(1, 1000, 20), 0, g.pick([1e4, 30]), { distinct: true });
    return [g.shuffle([...nums2]).slice(0, g.int(1, nums2.length)), nums2];
  },
  'daily-temperatures': (g) => [g.ints(g.len(1, 1e5, 30), 30, g.pick([100, 32]))],
  'next-greater-element-ii': (g) => [g.ints(g.len(1, 1e4, 25), -1e9, 1e9)],
  'online-stock-span': (g) => { const k = g.len(1, 1e4, 25); const p = g.palette(1, 1e5); return [['StockSpanner', ...Array(k).fill('next')], [[], ...Array.from({ length: k }, () => [p()])]]; },
  'remove-k-digits': (g) => {
    let num = g.str(g.len(1, 1e5, 20), g.pick(['0123456789', '10', '9', '1230']));
    num = num.replace(/^0+(?=.)/, '');
    if (num.length > 1 && num[0] === '0') num = '1' + num.slice(1);
    return [num, g.pick([1, num.length, g.int(1, num.length)])];
  },
  'sum-of-subarray-minimums': (g) => [g.ints(g.len(1, 3e4, 30), 1, g.pick([3e4, 3]))],
  'sliding-window-maximum': (g) => { const a = g.ints(g.len(1, 1e5, 25), -1e4, 1e4); return [a, g.pick([1, a.length, g.int(1, a.length)])]; },
  'largest-rectangle-in-histogram': (g) => [g.ints(g.len(1, 1e5, 30), 0, g.pick([1e4, 5, 1]))],
  'maximal-rectangle': (g) => { const m = g.len(1, 200, 8), n = g.len(1, 200, 8); const p = g.pick([0.5, 0.8, 0.1, 1]); return [g.grid(m, n, () => (g.rand() < p ? '1' : '0'))]; },
  'longest-continuous-subarray-with-absolute-diff-less-than-or-equal-to-limit': (g) => {
    const a = g.ints(g.len(1, 1e5, 25), 1, g.pick([1e9, 10, 3]));
    const spread = Math.max(...a) - Math.min(...a);
    return [a, g.pick([0, 1, g.int(0, spread), spread, 1e9])];
  },
  'jump-game-vi': (g) => { const a = g.ints(g.len(1, 1e5, 25), -1e4, g.pick([1e4, 3, -1])); return [a, g.pick([1, 2, a.length, g.int(1, a.length), 1e5])]; },
  'constrained-subsequence-sum': (g) => { const a = g.ints(g.len(1, 1e5, 25), -1e4, g.pick([1e4, 3, -1])); return [a, g.pick([1, a.length, g.int(1, a.length)])]; },
  'shortest-subarray-with-sum-at-least-k': (g) => {
    const a = g.ints(g.len(1, 1e5, 25), -1e5, g.pick([1e5, 10, -1]));
    const pos = a.filter((v) => v > 0).reduce((s, v) => s + v, 0);
    return [a, g.pick([1, g.int(1, Math.max(1, pos)), Math.max(1, pos), pos + 1, 1e9])];
  },
};
