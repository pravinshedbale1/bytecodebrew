export default [
  {
    slug: 'partition-equal-subset-sum', title: 'Partition Equal Subset Sum', level: 'Medium',
    summary: 'Return whether the array can be split into two subsets with equal sums.',
    method: 'canPartition', params: [['int[]', 'nums']], returns: 'boolean',
    tests: [
      { in: [[1, 5, 11, 5]], out: true },
      { in: [[1, 2, 3, 5]], out: false },
      { in: [[2, 2]] },
      { in: [[1]] },
      { in: [[3, 3, 3, 4, 5]] },
    ],
    ref: `class Solution {
    public boolean canPartition(int[] nums) {
        int sum = 0;
        for (int x : nums) sum += x;
        if (sum % 2 == 1) return false;
        boolean[] can = new boolean[sum / 2 + 1];
        can[0] = true;
        for (int x : nums) for (int c = sum / 2; c >= x; c--) can[c] |= can[c - x];
        return can[sum / 2];
    }
}`,
  },
  {
    slug: 'target-sum', title: 'Target Sum', level: 'Medium',
    summary: 'Put + or − in front of every number. Return how many sign choices make the expression equal target.',
    method: 'findTargetSumWays', params: [['int[]', 'nums'], ['int', 'target']], returns: 'int',
    tests: [
      { in: [[1, 1, 1, 1, 1], 3], out: 5 },
      { in: [[1], 1], out: 1 },
      { in: [[1], 2] },
      { in: [[0, 0, 0], 0] },
      { in: [[2, 3, 7, 1], -1] },
    ],
    ref: `class Solution {
    public int findTargetSumWays(int[] nums, int target) {
        int sum = 0;
        for (int x : nums) sum += x;
        if (Math.abs(target) > sum || (sum + target) % 2 != 0) return 0;
        int p = (sum + target) / 2;
        int[] ways = new int[p + 1];
        ways[0] = 1;
        for (int x : nums) for (int c = p; c >= x; c--) ways[c] += ways[c - x];
        return ways[p];
    }
}`,
  },
  {
    slug: 'last-stone-weight-ii', title: 'Last Stone Weight II', level: 'Medium',
    summary: 'Smashing stones x ≤ y leaves y − x (or nothing). Choose the pairs freely. Return the smallest possible weight of the last stone (0 if none remain).',
    method: 'lastStoneWeightII', params: [['int[]', 'stones']], returns: 'int',
    tests: [
      { in: [[2, 7, 4, 1, 8, 1]], out: 1 },
      { in: [[31, 26, 33, 21, 40]], out: 5 },
      { in: [[1]] },
      { in: [[1, 1, 4, 2, 2]] },
    ],
    ref: `class Solution {
    public int lastStoneWeightII(int[] stones) {
        int sum = 0;
        for (int s : stones) sum += s;
        boolean[] can = new boolean[sum / 2 + 1];
        can[0] = true;
        for (int s : stones) for (int c = sum / 2; c >= s; c--) can[c] |= can[c - s];
        for (int c = sum / 2; ; c--) if (can[c]) return sum - 2 * c;
    }
}`,
  },
  {
    slug: 'coin-change', title: 'Coin Change', level: 'Medium',
    summary: 'With unlimited coins of each denomination, return the fewest coins that make up amount, or -1 if impossible.',
    method: 'coinChange', params: [['int[]', 'coins'], ['int', 'amount']], returns: 'int',
    tests: [
      { in: [[1, 2, 5], 11], out: 3 },
      { in: [[2], 3], out: -1 },
      { in: [[1], 0], out: 0 },
      { in: [[1, 3, 4], 6] },
      { in: [[186, 419, 83, 408], 6249] },
    ],
    ref: `class Solution {
    public int coinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1); dp[0] = 0;
        for (int a = 1; a <= amount; a++) for (int c : coins) if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);
        return dp[amount] > amount ? -1 : dp[amount];
    }
}`,
  },
  {
    slug: 'coin-change-ii', title: 'Coin Change II', level: 'Medium',
    summary: 'With unlimited coins of each denomination, return how many combinations (order doesn\'t matter) make up amount.',
    method: 'change', params: [['int', 'amount'], ['int[]', 'coins']], returns: 'int',
    tests: [
      { in: [5, [1, 2, 5]], out: 4 },
      { in: [3, [2]], out: 0 },
      { in: [10, [10]], out: 1 },
      { in: [0, [7]] },
      { in: [100, [1, 5, 10, 25]] },
    ],
    ref: `class Solution {
    public int change(int amount, int[] coins) {
        int[] ways = new int[amount + 1];
        ways[0] = 1;
        for (int c : coins) for (int a = c; a <= amount; a++) ways[a] += ways[a - c];
        return ways[amount];
    }
}`,
  },
  {
    slug: 'combination-sum-iv', title: 'Combination Sum IV', level: 'Medium',
    summary: 'Count the ordered sequences of values from nums (reuse allowed) that sum to target. Different orders count separately.',
    method: 'combinationSum4', params: [['int[]', 'nums'], ['int', 'target']], returns: 'int',
    tests: [
      { in: [[1, 2, 3], 4], out: 7 },
      { in: [[9], 3], out: 0 },
      { in: [[1], 10] },
      { in: [[2, 1, 3], 35] },
    ],
    ref: `class Solution {
    public int combinationSum4(int[] nums, int target) {
        long[] ways = new long[target + 1];
        ways[0] = 1;
        for (int t = 1; t <= target; t++) for (int x : nums) if (x <= t) ways[t] = (ways[t] + ways[t - x]) & 0xFFFFFFFFL;
        return (int) ways[target];
    }
}`,
  },
  {
    slug: 'perfect-squares', title: 'Perfect Squares', level: 'Medium',
    summary: 'Return the fewest perfect squares (1, 4, 9, …) that sum to n.',
    method: 'numSquares', params: [['int', 'n']], returns: 'int',
    tests: [
      { in: [12], out: 3 },
      { in: [13], out: 2 },
      { in: [1] },
      { in: [7] },
      { in: [9999] },
    ],
    ref: `class Solution {
    public int numSquares(int n) {
        int[] dp = new int[n + 1];
        Arrays.fill(dp, Integer.MAX_VALUE); dp[0] = 0;
        for (int i = 1; i <= n; i++) for (int s = 1; s * s <= i; s++) dp[i] = Math.min(dp[i], dp[i - s * s] + 1);
        return dp[n];
    }
}`,
  },
  {
    slug: 'ones-and-zeroes', title: 'Ones and Zeroes', level: 'Medium',
    summary: 'Pick the largest subset of binary strings that uses at most m zeros and n ones in total. Return its size.',
    method: 'findMaxForm', params: [['String[]', 'strs'], ['int', 'm'], ['int', 'n']], returns: 'int',
    tests: [
      { in: [['10', '0001', '111001', '1', '0'], 5, 3], out: 4 },
      { in: [['10', '0', '1'], 1, 1], out: 2 },
      { in: [['1'], 0, 0] },
      { in: [['00', '000'], 1, 10] },
    ],
    ref: `class Solution {
    public int findMaxForm(String[] strs, int m, int n) {
        int[][] dp = new int[m + 1][n + 1];
        for (String s : strs) {
            int z = 0, o = 0;
            for (char c : s.toCharArray()) if (c == '0') z++; else o++;
            for (int i = m; i >= z; i--) for (int j = n; j >= o; j--) dp[i][j] = Math.max(dp[i][j], dp[i - z][j - o] + 1);
        }
        return dp[m][n];
    }
}`,
  },
];
