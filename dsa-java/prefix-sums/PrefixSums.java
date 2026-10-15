// Pattern: Prefix Sums & Difference Arrays. Run: java dsa-java/prefix-sums/PrefixSums.java
import java.util.*;

public class PrefixSums {
    public static void main(String[] args) {
        var rnd = new Random(5);
        for (int t = 0; t < 3_000; t++) {
            int n = rnd.nextInt(25);
            int[] a = new int[n];
            for (int i = 0; i < n; i++) a[i] = rnd.nextInt(13) - 6;
            // range sum
            long[] p = prefix(a);
            if (n > 0) { int l = rnd.nextInt(n), r = l + rnd.nextInt(n - l); long bf = 0; for (int i = l; i <= r; i++) bf += a[i];
                Check.that(rangeSum(p, l, r) == bf, "rangeSum"); }
            // subarray sum equals k
            int k = rnd.nextInt(13) - 6, cnt = 0, div = 0, bestLen = 0;
            int kd = 1 + rnd.nextInt(6);
            for (int i = 0; i < n; i++) { long s = 0; for (int j = i; j < n; j++) { s += a[j]; if (s == k) cnt++; if (Math.floorMod(s, kd) == 0) div++; } }
            Check.that(subarraySum(a, k) == cnt, "subarraySum");
            Check.that(subarraysDivByK(a, kd) == div, "subarraysDivByK");
            // contiguous array (equal 0s and 1s)
            int[] bin = new int[n]; for (int i = 0; i < n; i++) bin[i] = rnd.nextInt(2);
            for (int i = 0; i < n; i++) { int z = 0, o = 0; for (int j = i; j < n; j++) { if (bin[j] == 0) z++; else o++; if (z == o) bestLen = Math.max(bestLen, j - i + 1); } }
            Check.that(findMaxLength(bin) == bestLen, "findMaxLength");
            // product except self
            int[] small = new int[n]; for (int i = 0; i < n; i++) small[i] = rnd.nextInt(7) - 3;
            int[] pes = productExceptSelf(small);
            for (int i = 0; i < n; i++) { long prod = 1; for (int j = 0; j < n; j++) if (j != i) prod *= small[j]; Check.that(pes[i] == prod, "productExceptSelf"); }
            // difference array
            int len = 1 + rnd.nextInt(10); int[][] ups = new int[rnd.nextInt(8)][];
            int[] naive = new int[len];
            for (int u = 0; u < ups.length; u++) { int l = rnd.nextInt(len), r = l + rnd.nextInt(len - l), v = rnd.nextInt(9) - 4; ups[u] = new int[] { l, r, v }; for (int i = l; i <= r; i++) naive[i] += v; }
            Check.that(Arrays.equals(applyRangeAdds(len, ups), naive), "difference array");
        }
        // 2D prefix
        for (int t = 0; t < 500; t++) {
            int R = 1 + rnd.nextInt(6), C = 1 + rnd.nextInt(6); int[][] m = new int[R][C];
            for (int[] row : m) for (int j = 0; j < C; j++) row[j] = rnd.nextInt(19) - 9;
            long[][] P = prefix2D(m);
            int r1 = rnd.nextInt(R), r2 = r1 + rnd.nextInt(R - r1), c1 = rnd.nextInt(C), c2 = c1 + rnd.nextInt(C - c1);
            long bf = 0; for (int i = r1; i <= r2; i++) for (int j = c1; j <= c2; j++) bf += m[i][j];
            Check.that(sumRegion(P, r1, c1, r2, c2) == bf, "2D region sum");
        }
        Check.done("prefix-sums");
    }

    /** p[i] = a[0] + … + a[i−1]; p has n + 1 entries so p[0] = 0. */
    static long[] prefix(int[] a) {
        long[] p = new long[a.length + 1];
        for (int i = 0; i < a.length; i++) p[i + 1] = p[i] + a[i];
        return p;
    }

    static long rangeSum(long[] p, int l, int r) { return p[r + 1] - p[l]; }   // a[l..r] inclusive

    /** Count subarrays summing to k: a subarray (j, i] sums to k ⇔ prefix(i) − prefix(j) = k. */
    static int subarraySum(int[] nums, int k) {
        Map<Long, Integer> seen = new HashMap<>();
        seen.put(0L, 1);                                   // the empty prefix
        long prefix = 0; int count = 0;
        for (int x : nums) {
            prefix += x;
            count += seen.getOrDefault(prefix - k, 0);     // earlier prefixes that complete a sum of k
            seen.merge(prefix, 1, Integer::sum);
        }
        return count;
    }

    /** Same idea with remainders: two prefixes with equal remainder mod k bracket a multiple of k. */
    static int subarraysDivByK(int[] nums, int k) {
        int[] seen = new int[k];
        seen[0] = 1;
        int prefix = 0, count = 0;
        for (int x : nums) {
            prefix = Math.floorMod(prefix + x, k);         // floorMod: never negative
            count += seen[prefix];
            seen[prefix]++;
        }
        return count;
    }

    /** Longest subarray with equal 0s and 1s: treat 0 as −1, find the longest zero-sum subarray. */
    static int findMaxLength(int[] nums) {
        Map<Integer, Integer> firstIndex = new HashMap<>();
        firstIndex.put(0, -1);                             // prefix 0 "seen" before the array starts
        int prefix = 0, best = 0;
        for (int i = 0; i < nums.length; i++) {
            prefix += nums[i] == 1 ? 1 : -1;
            Integer j = firstIndex.get(prefix);
            if (j != null) best = Math.max(best, i - j);   // equal prefixes → zero-sum in between
            else firstIndex.put(prefix, i);                // keep only the EARLIEST index
        }
        return best;
    }

    static int[] productExceptSelf(int[] nums) {
        int n = nums.length;
        int[] out = new int[n];
        int left = 1;
        for (int i = 0; i < n; i++) { out[i] = left; left *= nums[i]; }          // product of everything to the left
        int right = 1;
        for (int i = n - 1; i >= 0; i--) { out[i] *= right; right *= nums[i]; } // times everything to the right
        return out;
    }

    /** Difference array: O(1) per range update, one prefix-sum pass at the end. */
    static int[] applyRangeAdds(int n, int[][] updates) {
        int[] diff = new int[n + 1];
        for (int[] u : updates) {
            diff[u[0]] += u[2];                            // start adding at l
            diff[u[1] + 1] -= u[2];                        // stop after r
        }
        int[] out = new int[n];
        int running = 0;
        for (int i = 0; i < n; i++) { running += diff[i]; out[i] = running; }
        return out;
    }

    static long[][] prefix2D(int[][] m) {
        int R = m.length, C = m[0].length;
        long[][] P = new long[R + 1][C + 1];
        for (int i = 0; i < R; i++)
            for (int j = 0; j < C; j++)
                P[i + 1][j + 1] = m[i][j] + P[i][j + 1] + P[i + 1][j] - P[i][j];   // inclusion–exclusion
        return P;
    }

    static long sumRegion(long[][] P, int r1, int c1, int r2, int c2) {
        return P[r2 + 1][c2 + 1] - P[r1][c2 + 1] - P[r2 + 1][c1] + P[r1][c1];
    }
}

final class Check {
    private static int passed;
    static void that(boolean cond, String what) { if (!cond) throw new AssertionError("FAILED: " + what); passed++; }
    static void done(String name) { System.out.println("✓ " + name + ": " + passed + " checks passed"); }
}
