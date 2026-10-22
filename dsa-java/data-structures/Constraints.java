// Code from the "Reading Constraints" lesson (Data Structures Basics). Each piece is tested against
// BigInteger or a brute force on random inputs. Run: java dsa-java/data-structures/Constraints.java
import java.math.BigInteger;
import java.util.*;

public class Constraints {
    static final int MOD = 1_000_000_007;

    public static void main(String[] args) {
        var rnd = new Random(11);
        testOverflow(rnd);
        testModulo(rnd);
        testCompression(rnd);
        testRollingLcs(rnd);
        testIterativeDfs(rnd);
        Check.done("constraints");
    }

    // ================================================================ overflow: int vs long
    static long sum(int[] nums) {
        long total = 0;                       // up to 10^5 values of 10^9 → 10^14: needs long
        for (int x : nums) total += x;
        return total;
    }

    static long countPairs(int n) {
        // (long) (n * (n - 1) / 2) is wrong: it multiplies in int, overflows, THEN widens
        return (long) n * (n - 1) / 2;        // cast BEFORE multiplying; n = 10^5 gives 4,999,950,000
    }

    static int mid(int low, int high) {
        return low + (high - low) / 2;        // (low + high) / 2 overflows when both are near 2^31
    }

    static long maxSubarray(int[] nums) {     // Kadane: start from nums[0], not 0, so all-negative input works
        long best = nums[0], cur = nums[0];
        for (int i = 1; i < nums.length; i++) {
            cur = Math.max(nums[i], cur + nums[i]);
            best = Math.max(best, cur);
        }
        return best;
    }

    static void testOverflow(Random rnd) {
        int[] big = {1_000_000_000, 1_000_000_000, 1_000_000_000};
        int bad = 0;
        for (int x : big) bad += x;
        Check.that(bad == -1_294_967_296 && sum(big) == 3_000_000_000L, "int sum overflows, long sum is right");
        int n = 100_000;
        Check.that(n * (n - 1) / 2 == 704_982_704 && countPairs(n) == 4_999_950_000L, "pairs: int gives a wrong POSITIVE number");
        Check.that((Integer.MAX_VALUE + 1) == Integer.MIN_VALUE && Math.abs(Integer.MIN_VALUE) < 0, "int wraps around");
        Check.that(-3 % 7 == -3 && Math.floorMod(-3, 7) == 4 && -7 / 2 == -3 && Math.floorDiv(-7, 2) == -4, "Java rounds toward zero");
        Check.that(10e9 == 1e10 && 1e9 + 7 == 1_000_000_007.0, "10e9 is 10^10, and both are doubles");
        for (int t = 0; t < 20_000; t++) {
            int low = rnd.nextInt(Integer.MAX_VALUE), high = low + rnd.nextInt(Integer.MAX_VALUE - low + 1);
            Check.that(mid(low, high) == (int) (((long) low + high) / 2), "safe mid");
            int[] a = new int[1 + rnd.nextInt(30)];
            boolean allNeg = rnd.nextBoolean();
            for (int i = 0; i < a.length; i++) a[i] = allNeg ? -1 - rnd.nextInt(1_000_000_000) : rnd.nextInt(2_000_000_001) - 1_000_000_000;
            long brute = Long.MIN_VALUE;
            for (int i = 0; i < a.length; i++) { long s = 0; for (int j = i; j < a.length; j++) { s += a[j]; brute = Math.max(brute, s); } }
            Check.that(maxSubarray(a) == brute, "Kadane in long, all-negative safe");
            int m = rnd.nextInt(200_001);
            Check.that(countPairs(m) == BigInteger.valueOf(m).multiply(BigInteger.valueOf(m - 1)).divide(BigInteger.TWO).longValueExact(), "countPairs");
        }
    }

    // ================================================================ modulo 10^9 + 7
    static int add(int a, int b) { return (a + b) % MOD; }                      // a, b < MOD, so a + b < 2^31
    static int sub(int a, int b) { return ((a - b) % MOD + MOD) % MOD; }        // Java: -3 % 7 == -3
    static int mul(int a, int b) { return (int) ((long) a * b % MOD); }         // cast first, or a * b overflows

    static long power(long base, long exp, long mod) {
        long result = 1;
        base %= mod;
        while (exp > 0) {
            if ((exp & 1) == 1) result = (result * base) % mod; // this bit of exp is set: multiply it in
            base = (base * base) % mod;                         // base, base², base⁴, base⁸, …
            exp >>= 1;                                          // move to the next bit
        }
        return result;
    }

    static int inverse(int b) { return (int) power(b, MOD - 2, MOD); }          // Fermat: b^(p-2) = 1/b mod p
    static int div(int a, int b) { return mul(a, inverse(b)); }

    static int climbStairs(int n) {           // ways to climb n stairs taking 1 or 2 steps, mod 10^9 + 7
        long[] dp = new long[n + 1];
        dp[0] = 1;
        if (n >= 1) dp[1] = 1;
        for (int i = 2; i <= n; i++) {
            dp[i] = (dp[i - 1] + dp[i - 2]) % MOD;   // mod at every step, not once at the end
        }
        return (int) dp[n];
    }

    static void testModulo(Random rnd) {
        BigInteger M = BigInteger.valueOf(MOD);
        for (int t = 0; t < 50_000; t++) {
            int a = rnd.nextInt(MOD), b = 1 + rnd.nextInt(MOD - 1);
            BigInteger A = BigInteger.valueOf(a), B = BigInteger.valueOf(b);
            Check.that(add(a, b) == A.add(B).mod(M).intValue(), "add");
            Check.that(sub(a, b) == A.subtract(B).mod(M).intValue(), "sub");
            Check.that(mul(a, b) == A.multiply(B).mod(M).intValue(), "mul");
            Check.that(mul(div(a, b), b) == a, "div undoes mul");
            long e = rnd.nextLong(1_000_000_000_000_000L);
            Check.that(power(a, e, MOD) == A.modPow(BigInteger.valueOf(e), M).longValue(), "fast power");
        }
        BigInteger[] f = new BigInteger[2001];
        f[0] = BigInteger.ONE; f[1] = BigInteger.ONE;
        for (int i = 2; i <= 2000; i++) f[i] = f[i - 1].add(f[i - 2]);
        for (int n = 0; n <= 2000; n++) Check.that(climbStairs(n) == f[n].mod(M).intValue(), "climbStairs mod");
    }

    // ================================================================ coordinate compression
    /** Replaces each value by its rank among the distinct values: {100, 5, 10^9, 5, 42} → {2, 0, 3, 0, 1}. */
    static int[] compress(int[] nums) {
        int[] sorted = Arrays.stream(nums).distinct().sorted().toArray();
        int[] rank = new int[nums.length];
        for (int i = 0; i < nums.length; i++) rank[i] = Arrays.binarySearch(sorted, nums[i]);
        return rank;
    }

    static void testCompression(Random rnd) {
        Check.that(Arrays.equals(compress(new int[]{100, 5, 1_000_000_000, 5, 42}), new int[]{2, 0, 3, 0, 1}), "lesson example");
        for (int t = 0; t < 5_000; t++) {
            int[] a = new int[rnd.nextInt(40)];
            for (int i = 0; i < a.length; i++) a[i] = rnd.nextBoolean() ? rnd.nextInt(10) : rnd.nextInt();
            int[] r = compress(a);
            for (int i = 0; i < a.length; i++) {
                int v = a[i];
                int smaller = (int) Arrays.stream(a).filter(x -> x < v).distinct().count();
                Check.that(r[i] == smaller, "rank = number of distinct smaller values");
            }
        }
    }

    // ================================================================ memory: keep one DP row
    static int lcs(String a, String b) {      // O(m·n) time, O(n) memory: only the previous row is kept
        int[] prev = new int[b.length() + 1], cur = new int[b.length() + 1];
        for (int i = 1; i <= a.length(); i++) {
            for (int j = 1; j <= b.length(); j++) {
                cur[j] = a.charAt(i - 1) == b.charAt(j - 1) ? prev[j - 1] + 1 : Math.max(prev[j], cur[j - 1]);
            }
            int[] tmp = prev; prev = cur; cur = tmp;
        }
        return prev[b.length()];
    }

    static int lcsFullTable(String a, String b) {
        int[][] dp = new int[a.length() + 1][b.length() + 1];
        for (int i = 1; i <= a.length(); i++)
            for (int j = 1; j <= b.length(); j++)
                dp[i][j] = a.charAt(i - 1) == b.charAt(j - 1) ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
        return dp[a.length()][b.length()];
    }

    static void testRollingLcs(Random rnd) {
        for (int t = 0; t < 3_000; t++) {
            String a = randomWord(rnd, rnd.nextInt(30)), b = randomWord(rnd, rnd.nextInt(30));
            Check.that(lcs(a, b) == lcsFullTable(a, b), "rolling-row LCS");
        }
    }

    static String randomWord(Random rnd, int len) {
        var sb = new StringBuilder();
        for (int i = 0; i < len; i++) sb.append((char) ('a' + rnd.nextInt(4)));
        return sb.toString();
    }

    // ================================================================ recursion depth: your own stack
    /** Number of islands with an explicit stack, so a 300 × 300 all-land grid can't overflow the call stack. */
    static int countIslands(char[][] grid) {
        int rows = grid.length, cols = grid[0].length, islands = 0;
        int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        boolean[][] seen = new boolean[rows][cols];
        Deque<int[]> stack = new ArrayDeque<>();
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (grid[r][c] != '1' || seen[r][c]) continue;
                islands++;
                seen[r][c] = true;
                stack.push(new int[]{r, c});
                while (!stack.isEmpty()) {
                    int[] cell = stack.pop();
                    for (int[] d : dirs) {
                        int nr = cell[0] + d[0], nc = cell[1] + d[1];
                        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == '1' && !seen[nr][nc]) {
                            seen[nr][nc] = true;
                            stack.push(new int[]{nr, nc});
                        }
                    }
                }
            }
        }
        return islands;
    }

    static int countIslandsRecursive(char[][] g) {
        int count = 0;
        boolean[][] seen = new boolean[g.length][g[0].length];
        for (int r = 0; r < g.length; r++)
            for (int c = 0; c < g[0].length; c++)
                if (g[r][c] == '1' && !seen[r][c]) { count++; flood(g, r, c, seen); }
        return count;
    }

    static void flood(char[][] g, int r, int c, boolean[][] seen) {
        if (r < 0 || r >= g.length || c < 0 || c >= g[0].length || g[r][c] != '1' || seen[r][c]) return;
        seen[r][c] = true;
        flood(g, r + 1, c, seen); flood(g, r - 1, c, seen); flood(g, r, c + 1, seen); flood(g, r, c - 1, seen);
    }

    static void testIterativeDfs(Random rnd) {
        for (int t = 0; t < 3_000; t++) {
            char[][] g = new char[1 + rnd.nextInt(12)][1 + rnd.nextInt(12)];
            for (char[] row : g) for (int c = 0; c < row.length; c++) row[c] = rnd.nextInt(100) < 55 ? '1' : '0';
            Check.that(countIslands(g) == countIslandsRecursive(g), "iterative DFS matches recursive");
        }
        char[][] land = new char[300][300];
        for (char[] row : land) Arrays.fill(row, '1');
        Check.that(countIslands(land) == 1, "300 × 300 all-land grid, no StackOverflowError");
    }
}

final class Check {
    private static int passed;
    static void that(boolean cond, String what) { if (!cond) throw new AssertionError("FAILED: " + what); passed++; }
    static void done(String name) { System.out.println("✓ " + name + ": " + passed + " checks passed"); }
}
