export default [
  {
    slug: 'best-time-to-buy-and-sell-stock-ii', title: 'Best Time to Buy and Sell Stock II', level: 'Medium',
    summary: 'Buy and sell as often as you like, holding at most one share at a time. Return the maximum profit.',
    method: 'maxProfit', params: [['int[]', 'prices']], returns: 'int',
    tests: [
      { in: [[7, 1, 5, 3, 6, 4]], out: 7 },
      { in: [[1, 2, 3, 4, 5]], out: 4 },
      { in: [[7, 6, 4, 3, 1]], out: 0 },
      { in: [[5]] },
    ],
    ref: `class Solution {
    public int maxProfit(int[] prices) { int p = 0; for (int i = 1; i < prices.length; i++) p += Math.max(0, prices[i] - prices[i - 1]); return p; }
}`,
  },
  {
    slug: 'best-time-to-buy-and-sell-stock-with-transaction-fee', title: 'Best Time to Buy and Sell Stock with Transaction Fee', level: 'Medium',
    summary: 'Trade as often as you like (one share at a time), paying fee per completed transaction. Return the maximum profit.',
    method: 'maxProfit', params: [['int[]', 'prices'], ['int', 'fee']], returns: 'int',
    tests: [
      { in: [[1, 3, 2, 8, 4, 9], 2], out: 8 },
      { in: [[1, 3, 7, 5, 10, 3], 3], out: 6 },
      { in: [[5], 1] },
      { in: [[1, 2, 3], 5] },
    ],
    ref: `class Solution {
    public int maxProfit(int[] prices, int fee) {
        int cash = 0, hold = -prices[0];
        for (int p : prices) { int c = Math.max(cash, hold + p - fee); hold = Math.max(hold, cash - p); cash = c; }
        return cash;
    }
}`,
  },
  {
    slug: 'best-time-to-buy-and-sell-stock-iii', title: 'Best Time to Buy and Sell Stock III', level: 'Hard',
    summary: 'Complete at most two transactions (sell before buying again). Return the maximum profit.',
    method: 'maxProfit', params: [['int[]', 'prices']], returns: 'int',
    tests: [
      { in: [[3, 3, 5, 0, 0, 3, 1, 4]], out: 6 },
      { in: [[1, 2, 3, 4, 5]], out: 4 },
      { in: [[7, 6, 4, 3, 1]], out: 0 },
      { in: [[1, 2, 4, 2, 5, 7, 2, 4, 9, 0]] },
    ],
    ref: `class Solution {
    public int maxProfit(int[] prices) {
        int b1 = Integer.MIN_VALUE, s1 = 0, b2 = Integer.MIN_VALUE, s2 = 0;
        for (int p : prices) { b1 = Math.max(b1, -p); s1 = Math.max(s1, b1 + p); b2 = Math.max(b2, s1 - p); s2 = Math.max(s2, b2 + p); }
        return s2;
    }
}`,
  },
  {
    slug: 'best-time-to-buy-and-sell-stock-iv', title: 'Best Time to Buy and Sell Stock IV', level: 'Hard',
    summary: 'Complete at most k transactions (sell before buying again). Return the maximum profit.',
    method: 'maxProfit', params: [['int', 'k'], ['int[]', 'prices']], returns: 'int',
    tests: [
      { in: [2, [2, 4, 1]], out: 2 },
      { in: [2, [3, 2, 6, 5, 0, 3]], out: 7 },
      { in: [1, [1]] },
      { in: [3, [1, 2, 4, 2, 5, 7, 2, 4, 9, 0]] },
      { in: [100, [3, 1, 4, 1, 5, 9, 2, 6]] },
    ],
    ref: `class Solution {
    public int maxProfit(int k, int[] prices) {
        int[] buy = new int[k + 1], sell = new int[k + 1];
        Arrays.fill(buy, Integer.MIN_VALUE / 2);
        for (int p : prices) for (int t = 1; t <= k; t++) { buy[t] = Math.max(buy[t], sell[t - 1] - p); sell[t] = Math.max(sell[t], buy[t] + p); }
        return sell[k];
    }
}`,
  },
  {
    slug: 'student-attendance-record-ii', title: 'Student Attendance Record II', level: 'Hard',
    summary: 'Records of length n use A (absent), L (late) and P (present). Count the records with fewer than 2 A in total and never 3 or more consecutive L, modulo 10^9 + 7.',
    method: 'checkRecord', params: [['int', 'n']], returns: 'int',
    tests: [
      { in: [2], out: 8 },
      { in: [1], out: 3 },
      { in: [10101], out: 183236316 },
      { in: [3] },
      { in: [100] },
    ],
    ref: `class Solution {
    public int checkRecord(int n) {
        long M = 1_000_000_007;
        long[][] dp = new long[2][3];
        dp[0][0] = 1;
        for (int i = 0; i < n; i++) {
            long[][] nx = new long[2][3];
            for (int a = 0; a < 2; a++) for (int l = 0; l < 3; l++) {
                long v = dp[a][l];
                if (v == 0) continue;
                nx[a][0] = (nx[a][0] + v) % M;
                if (a == 0) nx[1][0] = (nx[1][0] + v) % M;
                if (l < 2) nx[a][l + 1] = (nx[a][l + 1] + v) % M;
            }
            dp = nx;
        }
        long total = 0;
        for (long[] row : dp) for (long v : row) total = (total + v) % M;
        return (int) total;
    }
}`,
  },
  {
    slug: 'beautiful-arrangement', title: 'Beautiful Arrangement', level: 'Medium',
    summary: 'Count permutations of 1..n where, at every 1-indexed position i, perm[i] is divisible by i or i is divisible by perm[i].',
    method: 'countArrangement', params: [['int', 'n']], returns: 'int',
    tests: [
      { in: [2], out: 2 },
      { in: [1], out: 1 },
      { in: [3] },
      { in: [6] },
      { in: [15] },
    ],
    ref: `class Solution {
    public int countArrangement(int n) {
        int[] dp = new int[1 << n];
        dp[0] = 1;
        for (int mask = 0; mask < (1 << n); mask++) {
            if (dp[mask] == 0) continue;
            int pos = Integer.bitCount(mask) + 1;
            for (int v = 1; v <= n; v++) if ((mask & (1 << (v - 1))) == 0 && (v % pos == 0 || pos % v == 0)) dp[mask | (1 << (v - 1))] += dp[mask];
        }
        return dp[(1 << n) - 1];
    }
}`,
  },
  {
    slug: 'partition-to-k-equal-sum-subsets', title: 'Partition to K Equal Sum Subsets', level: 'Medium',
    summary: 'Return whether the array can be split into k non-empty subsets with equal sums.',
    method: 'canPartitionKSubsets', params: [['int[]', 'nums'], ['int', 'k']], returns: 'boolean',
    tests: [
      { in: [[4, 3, 2, 3, 5, 2, 1], 4], out: true },
      { in: [[1, 2, 3, 4], 3], out: false },
      { in: [[5], 1] },
      { in: [[2, 2, 2, 2, 3, 4, 5], 4] },
      { in: [[1, 1, 1, 1, 2, 2, 2, 2], 4] },
    ],
    ref: `class Solution {
    public boolean canPartitionKSubsets(int[] nums, int k) {
        int sum = 0;
        for (int x : nums) sum += x;
        if (sum % k != 0) return false;
        int target = sum / k, n = nums.length;
        int[] fill = new int[1 << n];
        Arrays.fill(fill, -1); fill[0] = 0;
        for (int mask = 0; mask < (1 << n); mask++) {
            if (fill[mask] < 0) continue;
            for (int i = 0; i < n; i++) if ((mask & (1 << i)) == 0 && fill[mask] + nums[i] <= target) fill[mask | (1 << i)] = (fill[mask] + nums[i]) % target;
        }
        return fill[(1 << n) - 1] == 0;
    }
}`,
  },
  {
    slug: 'minimum-number-of-work-sessions-to-finish-the-tasks', title: 'Minimum Number of Work Sessions to Finish the Tasks', level: 'Medium',
    summary: 'A work session lasts at most sessionTime hours and a task can\'t be split across sessions. Return the fewest sessions to finish every task (any order).',
    method: 'minSessions', params: [['int[]', 'tasks'], ['int', 'sessionTime']], returns: 'int',
    tests: [
      { in: [[1, 2, 3], 3], out: 2 },
      { in: [[3, 1, 3, 1, 1], 8], out: 2 },
      { in: [[1, 2, 3, 4, 5], 15], out: 1 },
      { in: [[5, 5, 5], 5] },
      { in: [[2, 3, 3, 4, 4, 4, 5, 6, 7, 10], 12] },
    ],
    ref: `class Solution {
    public int minSessions(int[] tasks, int sessionTime) {
        int n = tasks.length;
        int[][] dp = new int[1 << n][];
        dp[0] = new int[] { 1, 0 };
        for (int mask = 0; mask < (1 << n); mask++) {
            if (dp[mask] == null) continue;
            for (int i = 0; i < n; i++) {
                if ((mask & (1 << i)) != 0) continue;
                int[] cur = dp[mask], next;
                if (cur[1] + tasks[i] <= sessionTime) next = new int[] { cur[0], cur[1] + tasks[i] };
                else next = new int[] { cur[0] + 1, tasks[i] };
                int[] old = dp[mask | (1 << i)];
                if (old == null || next[0] < old[0] || (next[0] == old[0] && next[1] < old[1])) dp[mask | (1 << i)] = next;
            }
        }
        return dp[(1 << n) - 1][0];
    }
}`,
  },
  {
    slug: 'shortest-path-visiting-all-nodes', title: 'Shortest Path Visiting All Nodes', level: 'Hard',
    summary: 'In a connected undirected graph (graph[i] lists i\'s neighbours), return the length of the shortest walk that visits every node. You may start and end anywhere and revisit nodes and edges.',
    method: 'shortestPathLength', params: [['int[][]', 'graph']], returns: 'int',
    tests: [
      { in: [[[1, 2, 3], [0], [0], [0]]], out: 4 },
      { in: [[[1], [0, 2, 4], [1, 3, 4], [2], [1, 2]]], out: 4 },
      { in: [[[]]] },
      { in: [[[1], [0, 2], [1, 3], [2]]] },
    ],
    ref: `class Solution {
    public int shortestPathLength(int[][] graph) {
        int n = graph.length, all = (1 << n) - 1;
        boolean[][] seen = new boolean[n][1 << n];
        Deque<int[]> q = new ArrayDeque<>();
        for (int i = 0; i < n; i++) { q.add(new int[] { i, 1 << i }); seen[i][1 << i] = true; }
        for (int steps = 0; !q.isEmpty(); steps++) {
            for (int k = q.size(); k > 0; k--) {
                int[] s = q.poll();
                if (s[1] == all) return steps;
                for (int v : graph[s[0]]) { int m = s[1] | (1 << v); if (!seen[v][m]) { seen[v][m] = true; q.add(new int[] { v, m }); } }
            }
        }
        return 0;
    }
}`,
  },
  {
    slug: 'find-the-shortest-superstring', title: 'Find the Shortest Superstring', level: 'Hard',
    summary: 'Return a shortest string that contains every word as a substring (no word contains another). Any shortest answer is accepted.',
    method: 'shortestSuperstring', params: [['String[]', 'words']], returns: 'String', check: 'custom:superstring',
    tests: [
      { in: [['alex', 'loves', 'leetcode']] },
      { in: [['catg', 'ctaagt', 'gcta', 'ttca', 'atgcatc']], out: 'gctaagttcatgcatc' },
      { in: [['ab']] },
      { in: [['abc', 'bcd', 'cde']] },
    ],
    ref: `class Solution {
    public String shortestSuperstring(String[] w) {
        int n = w.length;
        int[][] over = new int[n][n];
        for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) if (i != j)
            for (int k = Math.min(w[i].length(), w[j].length()); k > 0; k--) if (w[i].endsWith(w[j].substring(0, k))) { over[i][j] = k; break; }
        int[][] dp = new int[1 << n][n], parent = new int[1 << n][n];
        for (int[] row : dp) Arrays.fill(row, -1);
        for (int i = 0; i < n; i++) dp[1 << i][i] = 0;
        for (int mask = 1; mask < (1 << n); mask++) for (int last = 0; last < n; last++) {
            if (dp[mask][last] < 0) continue;
            for (int nx = 0; nx < n; nx++) {
                if ((mask & (1 << nx)) != 0) continue;
                int m = mask | (1 << nx), v = dp[mask][last] + over[last][nx];
                if (v > dp[m][nx]) { dp[m][nx] = v; parent[m][nx] = last; }
            }
        }
        int mask = (1 << n) - 1, last = 0;
        for (int i = 0; i < n; i++) if (dp[mask][i] > dp[mask][last]) last = i;
        Deque<Integer> order = new ArrayDeque<>();
        while (true) { order.push(last); if (Integer.bitCount(mask) == 1) break; int p = parent[mask][last]; mask ^= 1 << last; last = p; }
        StringBuilder sb = new StringBuilder();
        int prev = -1;
        for (int i : order) { sb.append(prev < 0 ? w[i] : w[i].substring(over[prev][i])); prev = i; }
        return sb.toString();
    }
}`,
  },
];
