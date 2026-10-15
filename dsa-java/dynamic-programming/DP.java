// Dynamic Programming lessons. Every DP is checked against plain exhaustive recursion. Run: java dsa-java/dynamic-programming/DP.java
import java.util.*;

public class DP {
    public static void main(String[] args) {
        var rnd = new Random(16);
        // ---- DP Without Fear ----
        for (int n = 0; n <= 30; n++) {
            long f = fibNaive(n);
            Check.that(fibMemo(n, new long[n + 1]) == f && fibTab(n) == f && fibConst(n) == f, "fib four ways, n=" + n);
            Check.that(climbStairs(n) == fibNaive(n + 1), "climbStairs = fib(n+1)");
        }
        for (int t = 0; t < 2_000; t++) {
            int n = 2 + rnd.nextInt(12); int[] cost = new int[n]; for (int i = 0; i < n; i++) cost[i] = rnd.nextInt(20);
            Check.that(minCostClimbingStairs(cost) == minCostBrute(cost, -1), "minCostClimbingStairs");
            Check.that(minCostMemo(cost) == minCostClimbingStairs(cost), "min cost memo = table");
        }
        // ---- 1D DP ----
        for (int t = 0; t < 2_000; t++) {
            int n = rnd.nextInt(14); int[] a = new int[n]; for (int i = 0; i < n; i++) a[i] = rnd.nextInt(20);
            Check.that(rob(a) == robBrute(a, 0), "house robber");
            Check.that(robCircular(a) == robCircularBrute(a), "house robber II");
            int[] s = new int[Math.max(1, n)]; for (int i = 0; i < s.length; i++) s[i] = rnd.nextInt(21) - 10;
            Check.that(maxSubArray(s) == maxSubBrute(s), "Kadane");
            int[] p = new int[s.length]; for (int i = 0; i < p.length; i++) p[i] = rnd.nextInt(9) - 4;
            Check.that(maxProduct(p) == maxProductBrute(p), "max product subarray");
            Check.that(lengthOfLIS(a) == lisBrute(a) && lisNlogN(a) == lisBrute(a), "LIS O(n²) and O(n log n)");
            String digits = randomDigits(rnd, 10);
            Check.that(numDecodings(digits) == decodeBrute(digits, 0), "decode ways");
            String w = randomWord(rnd, 10, 2); List<String> dict = List.of("a", "b", "ab", "ba", "aab", "bb");
            Check.that(wordBreak(w, dict) == wordBreakBrute(w, new HashSet<>(dict)), "word break");
        }
        // ---- Knapsack ----
        for (int t = 0; t < 2_000; t++) {
            int n = rnd.nextInt(10); int[] a = new int[n]; for (int i = 0; i < n; i++) a[i] = 1 + rnd.nextInt(12);
            Check.that(canPartition(a) == partitionBrute(a), "partition equal subset sum");
            int target = rnd.nextInt(21) - 10;
            Check.that(findTargetSumWays(a, target) == targetBrute(a, 0, target), "target sum");
            int[] withZeros = new int[n]; for (int i = 0; i < n; i++) withZeros[i] = rnd.nextInt(4);   // zeros double the count
            Check.that(findTargetSumWays(withZeros, target) == targetBrute(withZeros, 0, target), "target sum with zeros");
            int[] coins = rnd.ints(1, 12).distinct().limit(1 + rnd.nextInt(4)).toArray(); int amount = rnd.nextInt(30);
            Check.that(coinChange(coins, amount) == coinMinBrute(coins, amount, new HashMap<>()), "coin change (min)");
            Check.that(change(amount, coins) == coinWaysBrute(coins, 0, amount), "coin change II (count)");
            int[] wt = new int[n], val = new int[n]; for (int i = 0; i < n; i++) { wt[i] = 1 + rnd.nextInt(8); val[i] = rnd.nextInt(20); }
            int cap = rnd.nextInt(25);
            Check.that(knapsack(wt, val, cap) == knapBrute(wt, val, 0, cap), "0/1 knapsack");
            Check.that(knapsack2D(wt, val, cap) == knapsack(wt, val, cap), "2D table = 1D table");
            Check.that(lastStoneWeightII(a) == lastStoneBrute(a), "last stone weight II");
        }
        // ---- Grid DP ----
        for (int t = 0; t < 2_000; t++) {
            int R = 1 + rnd.nextInt(6), C = 1 + rnd.nextInt(6);
            Check.that(uniquePaths(R, C) == choose(R + C - 2, R - 1), "unique paths = C(m+n−2, m−1)");
            int[][] obs = new int[R][C]; for (int[] row : obs) for (int j = 0; j < C; j++) row[j] = rnd.nextInt(5) == 0 ? 1 : 0;
            Check.that(uniquePathsWithObstacles(obs) == pathsBrute(obs, 0, 0), "unique paths with obstacles");
            int[][] g = new int[R][C]; for (int[] row : g) for (int j = 0; j < C; j++) row[j] = rnd.nextInt(10);
            Check.that(minPathSum(g) == minPathBrute(g, 0, 0), "min path sum");
            Check.that(minPathSum1D(g) == minPathSum(g), "min path sum one row");
            char[][] m = new char[R][C]; for (char[] row : m) for (int j = 0; j < C; j++) row[j] = rnd.nextInt(4) == 0 ? '0' : '1';
            Check.that(maximalSquare(m) == squareBrute(m), "maximal square");
            int[][] dungeon = new int[R][C]; for (int[] row : dungeon) for (int j = 0; j < C; j++) row[j] = rnd.nextInt(21) - 12;
            Check.that(calculateMinimumHP(dungeon) == dungeonBrute(dungeon), "dungeon game");
        }
        // ---- String DP ----
        for (int t = 0; t < 2_000; t++) {
            String a = randomWord(rnd, 8, 3), b = randomWord(rnd, 8, 3);
            Check.that(longestCommonSubsequence(a, b) == lcsBrute(a, b, 0, 0), "LCS");
            Check.that(minDistance(a, b) == editBrute(a, b, 0, 0), "edit distance");
            Check.that(longestPalindromeSubseq(a) == lcsBrute(a, new StringBuilder(a).reverse().toString(), 0, 0), "longest palindromic subsequence = LCS(s, reverse s)");
            String lp = longestPalindrome(a); Check.that(lp.length() == longestPalSubstrBrute(a) && a.contains(lp) && isPal(lp), "longest palindromic substring");
            String c = randomWord(rnd, 6, 2), d = randomWord(rnd, 3, 2);
            Check.that(numDistinct(c, d) == distinctBrute(c, d, 0, 0), "distinct subsequences");
            String x = randomWord(rnd, 4, 2), y = randomWord(rnd, 4, 2), z = rnd.nextBoolean() ? interleave(x, y, rnd) : randomWord(rnd, 8, 2);
            Check.that(isInterleave(x, y, z) == interleaveBrute(x, y, z, 0, 0), "interleaving string");
        }
        Check.done("dynamic-programming");
    }

    // ===================== DP Without Fear =====================
    static long fibNaive(int n) { return n < 2 ? n : fibNaive(n - 1) + fibNaive(n - 2); }

    static long fibMemo(int n, long[] memo) {                   // memo[i] = 0 means "not computed" (fib(i) > 0 for i ≥ 1)
        if (n < 2) return n;
        if (memo[n] != 0) return memo[n];
        return memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
    }

    static long fibTab(int n) {
        if (n < 2) return n;
        long[] dp = new long[n + 1];
        dp[1] = 1;
        for (int i = 2; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];
        return dp[n];
    }

    static long fibConst(int n) {
        long prev = 0, cur = 1;
        if (n == 0) return 0;
        for (int i = 2; i <= n; i++) { long next = prev + cur; prev = cur; cur = next; }
        return cur;
    }

    static long climbStairs(int n) {                           // ways(n) = ways(n−1) + ways(n−2)
        long a = 1, b = 1;                                     // ways(0) = 1, ways(1) = 1
        for (int i = 2; i <= n; i++) { long c = a + b; a = b; b = c; }
        return b;
    }

    /** dp[i] = cheapest cost to stand on step i (you may start on step 0 or 1). */
    static int minCostClimbingStairs(int[] cost) {
        int n = cost.length;
        int[] dp = new int[n + 1];                             // dp[0] = dp[1] = 0: starting is free
        for (int i = 2; i <= n; i++) dp[i] = Math.min(dp[i - 1] + cost[i - 1], dp[i - 2] + cost[i - 2]);
        return dp[n];                                          // the top is one past the last step
    }

    static int minCostMemo(int[] cost) { int[] memo = new int[cost.length + 1]; Arrays.fill(memo, -1); return minCostAt(cost, cost.length, memo); }
    static int minCostAt(int[] cost, int i, int[] memo) {
        if (i <= 1) return 0;
        if (memo[i] != -1) return memo[i];
        return memo[i] = Math.min(minCostAt(cost, i - 1, memo) + cost[i - 1], minCostAt(cost, i - 2, memo) + cost[i - 2]);
    }

    // ===================== 1D DP =====================
    static int rob(int[] a) {                                  // best(i) = max(skip i, take i + best(i−2))
        int prev2 = 0, prev1 = 0;
        for (int x : a) { int cur = Math.max(prev1, prev2 + x); prev2 = prev1; prev1 = cur; }
        return prev1;
    }

    static int robCircular(int[] a) {                          // first and last are neighbours
        if (a.length == 0) return 0;
        if (a.length == 1) return a[0];
        return Math.max(rob(Arrays.copyOfRange(a, 0, a.length - 1)), rob(Arrays.copyOfRange(a, 1, a.length)));
    }

    static int maxSubArray(int[] a) {                          // Kadane: best subarray ENDING here
        int endingHere = a[0], best = a[0];
        for (int i = 1; i < a.length; i++) {
            endingHere = Math.max(a[i], endingHere + a[i]);    // extend, or start fresh
            best = Math.max(best, endingHere);
        }
        return best;
    }

    static int maxProduct(int[] a) {                           // track max AND min ending here (negatives flip them)
        int hi = a[0], lo = a[0], best = a[0];
        for (int i = 1; i < a.length; i++) {
            int x = a[i], h = Math.max(x, Math.max(hi * x, lo * x)), l = Math.min(x, Math.min(hi * x, lo * x));
            hi = h; lo = l;
            best = Math.max(best, hi);
        }
        return best;
    }

    static int lengthOfLIS(int[] a) {                          // dp[i] = LIS ending at i
        int n = a.length, best = 0;
        int[] dp = new int[n];
        for (int i = 0; i < n; i++) {
            dp[i] = 1;
            for (int j = 0; j < i; j++) if (a[j] < a[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
            best = Math.max(best, dp[i]);
        }
        return best;
    }

    static int lisNlogN(int[] a) {                             // tails[k] = smallest tail of an increasing subsequence of length k+1
        int[] tails = new int[a.length];
        int len = 0;
        for (int x : a) {
            int lo = 0, hi = len;
            while (lo < hi) { int mid = (lo + hi) >>> 1; if (tails[mid] >= x) hi = mid; else lo = mid + 1; }   // first tail ≥ x
            tails[lo] = x;
            if (lo == len) len++;
        }
        return len;
    }

    static int numDecodings(String s) {                        // dp[i] = ways to decode the first i characters
        int n = s.length();
        int[] dp = new int[n + 1];
        dp[0] = 1;
        for (int i = 1; i <= n; i++) {
            if (s.charAt(i - 1) != '0') dp[i] += dp[i - 1];                       // single digit 1–9
            if (i >= 2) {
                int two = Integer.parseInt(s.substring(i - 2, i));
                if (two >= 10 && two <= 26) dp[i] += dp[i - 2];                   // two digits 10–26
            }
        }
        return dp[n];
    }

    static boolean wordBreak(String s, List<String> words) {   // ok[i] = s[0..i) can be segmented
        Set<String> dict = new HashSet<>(words);
        boolean[] ok = new boolean[s.length() + 1];
        ok[0] = true;
        for (int i = 1; i <= s.length(); i++)
            for (int j = 0; j < i && !ok[i]; j++)
                if (ok[j] && dict.contains(s.substring(j, i))) ok[i] = true;
        return ok[s.length()];
    }

    // ===================== Knapsack =====================
    /** 0/1 knapsack, 1D table: iterate capacity DOWNWARD so each item is used at most once. */
    static int knapsack(int[] wt, int[] val, int cap) {
        int[] dp = new int[cap + 1];                           // dp[c] = best value with capacity c
        for (int i = 0; i < wt.length; i++)
            for (int c = cap; c >= wt[i]; c--)
                dp[c] = Math.max(dp[c], dp[c - wt[i]] + val[i]);
        return dp[cap];
    }

    static int knapsack2D(int[] wt, int[] val, int cap) {
        int n = wt.length;
        int[][] dp = new int[n + 1][cap + 1];                  // dp[i][c] = best using the first i items
        for (int i = 1; i <= n; i++)
            for (int c = 0; c <= cap; c++) {
                dp[i][c] = dp[i - 1][c];                                                    // skip item i
                if (c >= wt[i - 1]) dp[i][c] = Math.max(dp[i][c], dp[i - 1][c - wt[i - 1]] + val[i - 1]);   // take it
            }
        return dp[n][cap];
    }

    static boolean canPartition(int[] nums) {                  // subset with sum = total / 2?
        int total = Arrays.stream(nums).sum();
        if (total % 2 == 1) return false;
        int target = total / 2;
        boolean[] can = new boolean[target + 1];
        can[0] = true;
        for (int x : nums)
            for (int s = target; s >= x; s--) can[s] = can[s] || can[s - x];   // downward: each number once
        return can[target];
    }

    /** Assign + or − to each number: P − N = target and P + N = total ⇒ P = (total + target) / 2. Count subsets. */
    static int findTargetSumWays(int[] nums, int target) {
        int total = Arrays.stream(nums).sum();
        if (Math.abs(target) > total || (total + target) % 2 != 0) return 0;
        int p = (total + target) / 2;
        int[] ways = new int[p + 1];
        ways[0] = 1;
        for (int x : nums)
            for (int s = p; s >= x; s--) ways[s] += ways[s - x];
        return ways[p];
    }

    /** Unbounded: fewest coins. Iterate amounts UPWARD so a coin can be reused. */
    static int coinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1);                           // "infinity" that can't overflow
        dp[0] = 0;
        for (int a = 1; a <= amount; a++)
            for (int c : coins) if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);
        return dp[amount] > amount ? -1 : dp[amount];
    }

    /** Unbounded: number of COMBINATIONS. Coins in the outer loop so each multiset is counted once. */
    static int change(int amount, int[] coins) {
        int[] ways = new int[amount + 1];
        ways[0] = 1;
        for (int c : coins)
            for (int a = c; a <= amount; a++) ways[a] += ways[a - c];
        return ways[amount];
    }

    static int lastStoneWeightII(int[] stones) {               // split into two groups as equal as possible
        int total = Arrays.stream(stones).sum(), half = total / 2;
        boolean[] can = new boolean[half + 1];
        can[0] = true;
        for (int s : stones) for (int x = half; x >= s; x--) can[x] = can[x] || can[x - s];
        for (int x = half; x >= 0; x--) if (can[x]) return total - 2 * x;
        return total;
    }

    // ===================== Grid DP =====================
    static int uniquePaths(int m, int n) {
        int[] dp = new int[n];
        Arrays.fill(dp, 1);                                    // first row: one way to each cell
        for (int r = 1; r < m; r++) for (int c = 1; c < n; c++) dp[c] += dp[c - 1];   // from above (old dp[c]) + from left
        return dp[n - 1];
    }

    static int uniquePathsWithObstacles(int[][] g) {
        int n = g[0].length;
        int[] dp = new int[n];
        dp[0] = g[0][0] == 1 ? 0 : 1;
        for (int[] row : g)
            for (int c = 0; c < n; c++) {
                if (row[c] == 1) dp[c] = 0;                    // blocked: no way to stand here
                else if (c > 0) dp[c] += dp[c - 1];
            }
        return dp[n - 1];
    }

    static int minPathSum(int[][] g) {
        int R = g.length, C = g[0].length;
        int[][] dp = new int[R][C];
        for (int r = 0; r < R; r++)
            for (int c = 0; c < C; c++) {
                if (r == 0 && c == 0) dp[r][c] = g[0][0];
                else if (r == 0) dp[r][c] = dp[r][c - 1] + g[r][c];
                else if (c == 0) dp[r][c] = dp[r - 1][c] + g[r][c];
                else dp[r][c] = Math.min(dp[r - 1][c], dp[r][c - 1]) + g[r][c];
            }
        return dp[R - 1][C - 1];
    }

    static int minPathSum1D(int[][] g) {                       // one row is enough: dp[c] is "above" until overwritten
        int C = g[0].length;
        int[] dp = new int[C];
        Arrays.fill(dp, Integer.MAX_VALUE);
        dp[0] = 0;
        for (int[] row : g)
            for (int c = 0; c < C; c++)
                dp[c] = (c == 0 ? dp[0] : Math.min(dp[c], dp[c - 1])) + row[c];
        return dp[C - 1];
    }

    static int maximalSquare(char[][] m) {                     // dp = side of the largest square with bottom-right here
        int R = m.length, C = m[0].length, best = 0;
        int[][] dp = new int[R + 1][C + 1];
        for (int r = 1; r <= R; r++)
            for (int c = 1; c <= C; c++)
                if (m[r - 1][c - 1] == '1') {
                    dp[r][c] = 1 + Math.min(dp[r - 1][c - 1], Math.min(dp[r - 1][c], dp[r][c - 1]));
                    best = Math.max(best, dp[r][c]);
                }
        return best * best;
    }

    /** Minimum starting health: computed BACKWARDS from the princess, because need depends on the future. */
    static int calculateMinimumHP(int[][] d) {
        int R = d.length, C = d[0].length;
        int[][] need = new int[R + 1][C + 1];
        for (int[] row : need) Arrays.fill(row, Integer.MAX_VALUE);
        need[R][C - 1] = need[R - 1][C] = 1;                   // after the last room you need at least 1
        for (int r = R - 1; r >= 0; r--)
            for (int c = C - 1; c >= 0; c--)
                need[r][c] = Math.max(1, Math.min(need[r + 1][c], need[r][c + 1]) - d[r][c]);
        return need[0][0];
    }

    // ===================== String DP =====================
    static int longestCommonSubsequence(String a, String b) {
        int n = a.length(), m = b.length();
        int[][] dp = new int[n + 1][m + 1];                    // dp[i][j] = LCS of a[0..i) and b[0..j)
        for (int i = 1; i <= n; i++)
            for (int j = 1; j <= m; j++)
                dp[i][j] = a.charAt(i - 1) == b.charAt(j - 1)
                        ? dp[i - 1][j - 1] + 1                               // match: extend
                        : Math.max(dp[i - 1][j], dp[i][j - 1]);              // drop one character
        return dp[n][m];
    }

    static int minDistance(String a, String b) {               // edit distance
        int n = a.length(), m = b.length();
        int[][] dp = new int[n + 1][m + 1];
        for (int i = 0; i <= n; i++) dp[i][0] = i;             // delete everything
        for (int j = 0; j <= m; j++) dp[0][j] = j;             // insert everything
        for (int i = 1; i <= n; i++)
            for (int j = 1; j <= m; j++)
                dp[i][j] = a.charAt(i - 1) == b.charAt(j - 1)
                        ? dp[i - 1][j - 1]
                        : 1 + Math.min(dp[i - 1][j - 1], Math.min(dp[i - 1][j], dp[i][j - 1]));   // replace, delete, insert
        return dp[n][m];
    }

    static int longestPalindromeSubseq(String s) {             // dp[i][j] over substrings, by increasing length
        int n = s.length();
        if (n == 0) return 0;
        int[][] dp = new int[n][n];
        for (int i = n - 1; i >= 0; i--) {
            dp[i][i] = 1;
            for (int j = i + 1; j < n; j++)
                dp[i][j] = s.charAt(i) == s.charAt(j) ? dp[i + 1][j - 1] + 2 : Math.max(dp[i + 1][j], dp[i][j - 1]);
        }
        return dp[0][n - 1];
    }

    static String longestPalindrome(String s) {                // expand around each centre: O(n²) time, O(1) space
        int bestL = 0, bestR = 0;
        for (int c = 0; c < s.length(); c++) {
            for (int[] lr : new int[][] { { c, c }, { c, c + 1 } }) {          // odd and even centres
                int l = lr[0], r = lr[1];
                while (l >= 0 && r < s.length() && s.charAt(l) == s.charAt(r)) { l--; r++; }
                if (r - l - 1 > bestR - bestL) { bestL = l + 1; bestR = r; }
            }
        }
        return s.substring(bestL, bestR);
    }

    static int numDistinct(String s, String t) {               // ways t appears as a subsequence of s
        int n = s.length(), m = t.length();
        long[][] dp = new long[n + 1][m + 1];
        for (int i = 0; i <= n; i++) dp[i][0] = 1;             // empty t: one way
        for (int i = 1; i <= n; i++)
            for (int j = 1; j <= m; j++)
                dp[i][j] = dp[i - 1][j] + (s.charAt(i - 1) == t.charAt(j - 1) ? dp[i - 1][j - 1] : 0);   // skip s[i] or use it
        return (int) dp[n][m];
    }

    static boolean isInterleave(String a, String b, String c) {
        if (a.length() + b.length() != c.length()) return false;
        boolean[][] dp = new boolean[a.length() + 1][b.length() + 1];
        dp[0][0] = true;
        for (int i = 0; i <= a.length(); i++)
            for (int j = 0; j <= b.length(); j++) {
                if (i > 0 && a.charAt(i - 1) == c.charAt(i + j - 1)) dp[i][j] |= dp[i - 1][j];
                if (j > 0 && b.charAt(j - 1) == c.charAt(i + j - 1)) dp[i][j] |= dp[i][j - 1];
            }
        return dp[a.length()][b.length()];
    }

    // ===================== brute forces =====================
    static int minCostBrute(int[] cost, int unused) { return Math.min(minCostFrom(cost, 0), minCostFrom(cost, 1)); }   // start on step 0 or 1
    static int minCostFrom(int[] cost, int i) { if (i >= cost.length) return 0; return cost[i] + Math.min(minCostFrom(cost, i + 1), minCostFrom(cost, i + 2)); }
    static int robBrute(int[] a, int i) { if (i >= a.length) return 0; return Math.max(robBrute(a, i + 1), a[i] + robBrute(a, i + 2)); }
    static int robCircularBrute(int[] a) { int n = a.length, best = 0; for (int m = 0; m < (1 << n); m++) { boolean ok = true; int s = 0; for (int i = 0; i < n; i++) if ((m >> i & 1) == 1) { if ((m >> ((i + 1) % n) & 1) == 1 && n > 1) ok = false; s += a[i]; } if (ok) best = Math.max(best, s); } return best; }
    static int maxSubBrute(int[] a) { int best = Integer.MIN_VALUE; for (int i = 0; i < a.length; i++) { int s = 0; for (int j = i; j < a.length; j++) { s += a[j]; best = Math.max(best, s); } } return best; }
    static int maxProductBrute(int[] a) { int best = Integer.MIN_VALUE; for (int i = 0; i < a.length; i++) { int p = 1; for (int j = i; j < a.length; j++) { p *= a[j]; best = Math.max(best, p); } } return best; }
    static int lisBrute(int[] a) { int best = 0; for (int m = 0; m < (1 << a.length); m++) { int last = Integer.MIN_VALUE, len = 0; boolean ok = true; for (int i = 0; i < a.length; i++) if ((m >> i & 1) == 1) { if (a[i] <= last) { ok = false; break; } last = a[i]; len++; } if (ok) best = Math.max(best, len); } return best; }
    static int decodeBrute(String s, int i) { if (i == s.length()) return 1; if (s.charAt(i) == '0') return 0; int w = decodeBrute(s, i + 1); if (i + 1 < s.length() && Integer.parseInt(s.substring(i, i + 2)) <= 26) w += decodeBrute(s, i + 2); return w; }
    static boolean wordBreakBrute(String s, Set<String> d) { if (s.isEmpty()) return true; for (int i = 1; i <= s.length(); i++) if (d.contains(s.substring(0, i)) && wordBreakBrute(s.substring(i), d)) return true; return false; }
    static boolean partitionBrute(int[] a) { int total = Arrays.stream(a).sum(); for (int m = 0; m < (1 << a.length); m++) { int s = 0; for (int i = 0; i < a.length; i++) if ((m >> i & 1) == 1) s += a[i]; if (2 * s == total) return true; } return false; }
    static int targetBrute(int[] a, int i, int target) { if (i == a.length) return target == 0 ? 1 : 0; return targetBrute(a, i + 1, target - a[i]) + targetBrute(a, i + 1, target + a[i]); }
    static int coinMinBrute(int[] coins, int amt, Map<Integer, Integer> memo) { if (amt == 0) return 0; if (memo.containsKey(amt)) return memo.get(amt); int best = -1; for (int c : coins) if (c <= amt) { int r = coinMinBrute(coins, amt - c, memo); if (r >= 0 && (best < 0 || r + 1 < best)) best = r + 1; } memo.put(amt, best); return best; }
    static int coinWaysBrute(int[] coins, int i, int amt) { if (amt == 0) return 1; if (i == coins.length) return 0; int w = 0; for (int k = 0; k * coins[i] <= amt; k++) w += coinWaysBrute(coins, i + 1, amt - k * coins[i]); return w; }
    static int knapBrute(int[] wt, int[] val, int i, int cap) { if (i == wt.length) return 0; int best = knapBrute(wt, val, i + 1, cap); if (wt[i] <= cap) best = Math.max(best, val[i] + knapBrute(wt, val, i + 1, cap - wt[i])); return best; }
    static int lastStoneBrute(int[] a) { int total = Arrays.stream(a).sum(), best = total; for (int m = 0; m < (1 << a.length); m++) { int s = 0; for (int i = 0; i < a.length; i++) if ((m >> i & 1) == 1) s += a[i]; best = Math.min(best, Math.abs(total - 2 * s)); } return best; }
    static long choose(int n, int k) { long c = 1; for (int i = 0; i < k; i++) c = c * (n - i) / (i + 1); return c; }
    static int pathsBrute(int[][] g, int r, int c) { if (r >= g.length || c >= g[0].length || g[r][c] == 1) return 0; if (r == g.length - 1 && c == g[0].length - 1) return 1; return pathsBrute(g, r + 1, c) + pathsBrute(g, r, c + 1); }
    static int minPathBrute(int[][] g, int r, int c) { if (r == g.length - 1 && c == g[0].length - 1) return g[r][c]; int best = Integer.MAX_VALUE; if (r + 1 < g.length) best = Math.min(best, minPathBrute(g, r + 1, c)); if (c + 1 < g[0].length) best = Math.min(best, minPathBrute(g, r, c + 1)); return g[r][c] + best; }
    static int squareBrute(char[][] m) { int best = 0; for (int r = 0; r < m.length; r++) for (int c = 0; c < m[0].length; c++) for (int k = 1; r + k <= m.length && c + k <= m[0].length; k++) { boolean ok = true; for (int i = r; i < r + k && ok; i++) for (int j = c; j < c + k && ok; j++) if (m[i][j] != '1') ok = false; if (ok) best = Math.max(best, k * k); } return best; }
    static int dungeonBrute(int[][] d) { for (int h = 1; ; h++) if (survive(d, 0, 0, h)) return h; }
    static boolean survive(int[][] d, int r, int c, int hp) { hp += d[r][c]; if (hp <= 0) return false; if (r == d.length - 1 && c == d[0].length - 1) return true; return (r + 1 < d.length && survive(d, r + 1, c, hp)) || (c + 1 < d[0].length && survive(d, r, c + 1, hp)); }
    static int lcsBrute(String a, String b, int i, int j) { if (i == a.length() || j == b.length()) return 0; if (a.charAt(i) == b.charAt(j)) return 1 + lcsBrute(a, b, i + 1, j + 1); return Math.max(lcsBrute(a, b, i + 1, j), lcsBrute(a, b, i, j + 1)); }
    static int editBrute(String a, String b, int i, int j) { if (i == a.length()) return b.length() - j; if (j == b.length()) return a.length() - i; if (a.charAt(i) == b.charAt(j)) return editBrute(a, b, i + 1, j + 1); return 1 + Math.min(editBrute(a, b, i + 1, j + 1), Math.min(editBrute(a, b, i + 1, j), editBrute(a, b, i, j + 1))); }
    static int longestPalSubstrBrute(String s) { int best = 0; for (int i = 0; i < s.length(); i++) for (int j = i; j < s.length(); j++) if (isPal(s.substring(i, j + 1))) best = Math.max(best, j - i + 1); return best; }
    static boolean isPal(String s) { return new StringBuilder(s).reverse().toString().equals(s); }
    static int distinctBrute(String s, String t, int i, int j) { if (j == t.length()) return 1; if (i == s.length()) return 0; int w = distinctBrute(s, t, i + 1, j); if (s.charAt(i) == t.charAt(j)) w += distinctBrute(s, t, i + 1, j + 1); return w; }
    static boolean interleaveBrute(String a, String b, String c, int i, int j) { if (i + j == c.length()) return i == a.length() && j == b.length(); if (i + j > c.length()) return false;
        return (i < a.length() && a.charAt(i) == c.charAt(i + j) && interleaveBrute(a, b, c, i + 1, j)) || (j < b.length() && b.charAt(j) == c.charAt(i + j) && interleaveBrute(a, b, c, i, j + 1)); }
    static String interleave(String a, String b, Random r) { StringBuilder sb = new StringBuilder(); int i = 0, j = 0; while (i < a.length() || j < b.length()) { if (j == b.length() || (i < a.length() && r.nextBoolean())) sb.append(a.charAt(i++)); else sb.append(b.charAt(j++)); } return sb.toString(); }
    static String randomWord(Random r, int max, int alpha) { StringBuilder sb = new StringBuilder(); int n = r.nextInt(max + 1); for (int i = 0; i < n; i++) sb.append((char) ('a' + r.nextInt(alpha))); return sb.toString(); }
    static String randomDigits(Random r, int max) { StringBuilder sb = new StringBuilder(); int n = r.nextInt(max + 1); for (int i = 0; i < n; i++) sb.append(r.nextInt(4) == 0 ? '0' : (char) ('1' + r.nextInt(3))); return sb.toString(); }
}

final class Check {
    private static int passed;
    static void that(boolean cond, String what) { if (!cond) throw new AssertionError("FAILED: " + what); passed++; }
    static void done(String name) { System.out.println("✓ " + name + ": " + passed + " checks passed"); }
}
