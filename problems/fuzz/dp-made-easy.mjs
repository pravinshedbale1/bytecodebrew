export default {
  'fibonacci-number': { all: Array.from({ length: 31 }, (_, n) => [n]) },
  'climbing-stairs': { all: Array.from({ length: 45 }, (_, n) => [n + 1]) },
  'min-cost-climbing-stairs': (g) => [g.ints(g.len(2, 1000, 30), 0, g.pick([999, 3, 0]))],
  'n-th-tribonacci-number': { all: Array.from({ length: 38 }, (_, n) => [n]) },
};
