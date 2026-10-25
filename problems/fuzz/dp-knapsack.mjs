const MAX = 2 ** 31 - 1;

export default {
  'partition-equal-subset-sum': (g) => [g.ints(g.len(1, 200, 25), 1, g.pick([100, 5, 2]))],
  'target-sum': (g) => {
    const a = g.ints(g.len(1, 20, 20), 0, g.pick([1000, 3, 1, 0]));
    const sum = a.reduce((x, y) => x + y, 0);
    if (sum > 1000) return null;
    return [a, g.pick([0, sum, -sum, sum + 1, g.int(-sum, sum), g.int(-1000, 1000)])];
  },
  'last-stone-weight-ii': (g) => [g.ints(g.len(1, 30, 30), 1, g.pick([100, 3]))],
  'coin-change': (g) => [g.ints(g.len(1, 12, 6), 1, g.pick([2 ** 31 - 1, 20, 7]), { distinct: true }), g.pick([0, 1, 1e4, g.int(0, 100), g.int(0, 1e4)])],
  'coin-change-ii': (g) => {
    const coins = g.ints(g.len(1, 300, 6), 1, g.pick([5000, 20, 7]), { distinct: true });
    const amount = g.pick([0, 1, 5000, g.int(0, 100), g.int(0, 5000)]);
    const ways = Array(amount + 1).fill(0);
    ways[0] = 1;
    for (const c of coins) for (let x = c; x <= amount; x++) ways[x] += ways[x - c];
    return ways[amount] <= MAX ? [amount, coins] : null;
  },
  'combination-sum-iv': (g) => {
    const nums = g.ints(g.len(1, 200, 6), 1, g.pick([1000, 10, 4]), { distinct: true });
    const target = g.pick([1, 1000, g.int(1, 40), g.int(1, 1000)]);
    const ways = Array(target + 1).fill(0);
    ways[0] = 1;
    for (let x = 1; x <= target; x++) for (const v of nums) if (v <= x) ways[x] += ways[x - v];
    return ways[target] <= MAX ? [nums, target] : null;
  },
  'perfect-squares': (g) => [g.pick([1, 2, 3, 4, 7, 12, 13, 1e4, 9999, 9998, 7927, 6337, g.int(1, 100), g.int(1, 1e4)])],
  'ones-and-zeroes': (g) => [Array.from({ length: g.len(1, 600, 15) }, () => g.str(g.len(1, 100, 6), g.pick(['01', '0', '1', '001']))), g.pick([0, 1, 100, g.int(0, 10)]), g.pick([0, 1, 100, g.int(0, 10)])],
};
