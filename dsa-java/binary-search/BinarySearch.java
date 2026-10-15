// Pattern: Binary Search. Run: java dsa-java/binary-search/BinarySearch.java
import java.util.*;
import java.util.function.IntPredicate;

public class BinarySearch {
    public static void main(String[] args) {
        var rnd = new Random(7);
        for (int t = 0; t < 5_000; t++) {
            int n = rnd.nextInt(30);
            int[] a = new int[n];
            for (int i = 0; i < n; i++) a[i] = rnd.nextInt(20);
            Arrays.sort(a);
            int x = rnd.nextInt(22) - 1;
            int lb = 0; while (lb < n && a[lb] < x) lb++;
            int ub = 0; while (ub < n && a[ub] <= x) ub++;
            Check.that(lowerBound(a, x) == lb, "lowerBound");
            Check.that(search(a, x) == (lb < n && a[lb] == x ? lb : -1) || (search(a, x) >= 0 && a[search(a, x)] == x), "search");
            int[] range = searchRange(a, x);
            Check.that(range[0] == (lb < n && a[lb] == x ? lb : -1) && range[1] == (lb < n && a[lb] == x ? ub - 1 : -1), "searchRange");
            // rotated (distinct values)
            int[] d = rnd.ints(0, 100).distinct().limit(1 + rnd.nextInt(20)).sorted().toArray();
            int k = rnd.nextInt(d.length); int[] rot = new int[d.length];
            for (int i = 0; i < d.length; i++) rot[i] = d[(i + k) % d.length];
            int target = rnd.nextBoolean() ? rot[rnd.nextInt(rot.length)] : rnd.nextInt(100);
            int expect = -1; for (int i = 0; i < rot.length; i++) if (rot[i] == target) expect = i;
            Check.that(searchRotated(rot, target) == expect, "searchRotated");
            Check.that(findMin(rot) == d[0], "findMin rotated");
            // peak: adjacent elements differ
            int[] p = new int[1 + rnd.nextInt(15)]; p[0] = rnd.nextInt(5);
            for (int i = 1; i < p.length; i++) { int v; do v = rnd.nextInt(10); while (v == p[i - 1]); p[i] = v; }
            int pk = findPeakElement(p);
            Check.that((pk == 0 || p[pk] > p[pk - 1]) && (pk == p.length - 1 || p[pk] > p[pk + 1]), "findPeakElement");
            // 2D matrix
            int R = 1 + rnd.nextInt(4), C = 1 + rnd.nextInt(4); int[][] m = new int[R][C]; int v = rnd.nextInt(3);
            for (int i = 0; i < R; i++) for (int j = 0; j < C; j++) { v += 1 + rnd.nextInt(3); m[i][j] = v; }
            int q = rnd.nextInt(v + 3); boolean has = false; for (int[] row : m) for (int y : row) if (y == q) has = true;
            Check.that(searchMatrix(m, q) == has, "searchMatrix");
        }
        // sqrt on large inputs
        for (int t = 0; t < 5_000; t++) { int xx = t < 100 ? t : new Random(t).nextInt(Integer.MAX_VALUE); long r = (long) Math.sqrt(xx); while (r * r > xx) r--; while ((r + 1) * (r + 1) <= xx) r++; Check.that(mySqrt(xx) == r, "mySqrt"); }
        Check.that(mySqrt(Integer.MAX_VALUE) == 46340, "sqrt(MAX_VALUE)");
        Check.done("binary-search");
    }

    /** THE template: smallest i in [lo, hi) with ok(i) true, or hi if none. ok must be false…false true…true. */
    static int firstTrue(int lo, int hi, IntPredicate ok) {
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;           // no overflow; rounds down so lo < hi always shrinks
            if (ok.test(mid)) hi = mid;             // mid could be the answer: keep it
            else lo = mid + 1;                      // mid is not: discard it and everything left of it
        }
        return lo;
    }

    static int lowerBound(int[] a, int x) { return firstTrue(0, a.length, i -> a[i] >= x); }   // first index with a[i] ≥ x

    static int search(int[] a, int x) {
        int i = lowerBound(a, x);
        return i < a.length && a[i] == x ? i : -1;
    }

    static int[] searchRange(int[] a, int x) {
        int first = firstTrue(0, a.length, i -> a[i] >= x);
        if (first == a.length || a[first] != x) return new int[] { -1, -1 };
        int afterLast = firstTrue(0, a.length, i -> a[i] > x);   // first index with a[i] > x
        return new int[] { first, afterLast - 1 };
    }

    static int mySqrt(int x) {
        // largest r with r*r ≤ x  =  (first r with r*r > x) − 1
        return firstTrue(0, 46341, r -> (long) r * r > x) - 1;
    }

    /** Minimum of a rotated sorted array (distinct): first index whose value is ≤ the last element. */
    static int findMin(int[] a) {
        int last = a[a.length - 1];
        return a[firstTrue(0, a.length, i -> a[i] <= last)];
    }

    static int searchRotated(int[] a, int target) {
        int lo = 0, hi = a.length - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (a[mid] == target) return mid;
            if (a[lo] <= a[mid]) {                              // left half [lo, mid] is sorted
                if (a[lo] <= target && target < a[mid]) hi = mid - 1;
                else lo = mid + 1;
            } else {                                            // right half [mid, hi] is sorted
                if (a[mid] < target && target <= a[hi]) lo = mid + 1;
                else hi = mid - 1;
            }
        }
        return -1;
    }

    /** Any peak: first i where the array starts going down (a[i] > a[i + 1]); the last index if it never does. */
    static int findPeakElement(int[] a) {
        return firstTrue(0, a.length - 1, i -> a[i] > a[i + 1]);
    }

    /** Rows sorted, each row starts after the previous ends: treat as one sorted array of R*C. */
    static boolean searchMatrix(int[][] m, int target) {
        int R = m.length, C = m[0].length;
        int i = firstTrue(0, R * C, k -> m[k / C][k % C] >= target);
        return i < R * C && m[i / C][i % C] == target;
    }
}

final class Check {
    private static int passed;
    static void that(boolean cond, String what) { if (!cond) throw new AssertionError("FAILED: " + what); passed++; }
    static void done(String name) { System.out.println("✓ " + name + ": " + passed + " checks passed"); }
}
