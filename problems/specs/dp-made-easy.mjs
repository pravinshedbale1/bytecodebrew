export default [
  {
    slug: 'fibonacci-number', title: 'Fibonacci Number', level: 'Easy',
    summary: 'Return F(n), where F(0) = 0, F(1) = 1 and F(n) = F(n − 1) + F(n − 2).',
    method: 'fib', params: [['int', 'n']], returns: 'int',
    tests: [
      { in: [2], out: 1 },
      { in: [3], out: 2 },
      { in: [4], out: 3 },
      { in: [0] },
      { in: [30] },
    ],
    ref: `class Solution {
    public int fib(int n) { int a = 0, b = 1; for (int i = 0; i < n; i++) { int t = a + b; a = b; b = t; } return a; }
}`,
  },
  {
    slug: 'climbing-stairs', title: 'Climbing Stairs', level: 'Easy',
    summary: 'You climb 1 or 2 steps at a time. Return how many distinct ways reach the top of n steps.',
    method: 'climbStairs', params: [['int', 'n']], returns: 'int',
    tests: [
      { in: [2], out: 2 },
      { in: [3], out: 3 },
      { in: [1] },
      { in: [10] },
      { in: [45] },
    ],
    ref: `class Solution {
    public int climbStairs(int n) { int a = 1, b = 1; for (int i = 2; i <= n; i++) { int t = a + b; a = b; b = t; } return b; }
}`,
  },
  {
    slug: 'min-cost-climbing-stairs', title: 'Min Cost Climbing Stairs', level: 'Easy',
    summary: 'Stepping on stair i costs cost[i]; from there you climb 1 or 2 stairs. Starting at stair 0 or 1, return the least cost to get past the last stair.',
    method: 'minCostClimbingStairs', params: [['int[]', 'cost']], returns: 'int',
    tests: [
      { in: [[10, 15, 20]], out: 15 },
      { in: [[1, 100, 1, 1, 1, 100, 1, 1, 100, 1]], out: 6 },
      { in: [[0, 0]] },
      { in: [[5, 1, 5, 1, 5]] },
    ],
    ref: `class Solution {
    public int minCostClimbingStairs(int[] cost) {
        int a = 0, b = 0;
        for (int i = 2; i <= cost.length; i++) { int t = Math.min(b + cost[i - 1], a + cost[i - 2]); a = b; b = t; }
        return b;
    }
}`,
  },
  {
    slug: 'n-th-tribonacci-number', title: 'N-th Tribonacci Number', level: 'Easy',
    summary: 'T(0) = 0, T(1) = 1, T(2) = 1 and T(n) = T(n − 1) + T(n − 2) + T(n − 3). Return T(n).',
    method: 'tribonacci', params: [['int', 'n']], returns: 'int',
    tests: [
      { in: [4], out: 4 },
      { in: [25], out: 1389537 },
      { in: [0] },
      { in: [2] },
      { in: [37] },
    ],
    ref: `class Solution {
    public int tribonacci(int n) {
        if (n == 0) return 0;
        int a = 0, b = 1, c = 1;
        for (int i = 3; i <= n; i++) { int t = a + b + c; a = b; b = c; c = t; }
        return c;
    }
}`,
  },
];
