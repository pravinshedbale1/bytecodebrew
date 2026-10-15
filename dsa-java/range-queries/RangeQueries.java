// Pattern: Range Queries — Fenwick & Segment Trees. Run: java dsa-java/range-queries/RangeQueries.java
import java.util.*;

public class RangeQueries {
    public static void main(String[] args) {
        var rnd = new Random(23);
        for (int t = 0; t < 2_000; t++) {
            int n = 1 + rnd.nextInt(20);
            int[] a = new int[n];
            for (int i = 0; i < n; i++) a[i] = rnd.nextInt(41) - 20;
            NumArray fen = new NumArray(a.clone());
            SegmentTree seg = new SegmentTree(a.clone());
            LazySegmentTree lazy = new LazySegmentTree(a.clone());
            long[] model = Arrays.stream(a).asLongStream().toArray();
            for (int op = 0; op < 40; op++) {
                int l = rnd.nextInt(n), r = l + rnd.nextInt(n - l);
                switch (rnd.nextInt(4)) {
                    case 0 -> { int v = rnd.nextInt(41) - 20; fen.update(l, v); seg.update(l, v); lazy.add(l, l, v - (int) model[l]); model[l] = v; }
                    case 1 -> { int v = rnd.nextInt(11) - 5; lazy.add(l, r, v); for (int i = l; i <= r; i++) model[i] += v;
                                for (int i = l; i <= r; i++) { fen.update(i, (int) model[i]); seg.update(i, (int) model[i]); } }
                    default -> {
                        long sum = 0, max = Long.MIN_VALUE;
                        for (int i = l; i <= r; i++) { sum += model[i]; max = Math.max(max, model[i]); }
                        Check.that(fen.sumRange(l, r) == sum, "Fenwick range sum");
                        Check.that(seg.sum(l, r) == sum && seg.max(l, r) == max, "segment tree sum/max");
                        Check.that(lazy.sum(l, r) == sum, "lazy segment tree");
                    }
                }
            }
            int[] b = new int[n];
            for (int i = 0; i < n; i++) b[i] = rnd.nextInt(10) - 5;
            Check.that(countSmaller(b).equals(countSmallerBrute(b)), "countSmaller");
            long inv = inversionsBrute(b);
            Check.that(countInversions(b.clone()) == inv && inversionsFenwick(b) == inv, "inversions");
        }
        Check.done("range-queries");
    }

    /** Fenwick (binary indexed) tree over 1..n: point add and prefix sum, both O(log n). */
    static class Fenwick {
        final long[] tree;
        Fenwick(int n) { tree = new long[n + 1]; }

        void add(int i, long delta) {                    // i is 1-based
            for (; i < tree.length; i += i & -i) tree[i] += delta;   // climb to every range that covers i
        }

        long prefix(int i) {                             // sum of positions 1..i
            long s = 0;
            for (; i > 0; i -= i & -i) s += tree[i];     // strip the lowest set bit each step
            return s;
        }
    }

    /** Range Sum Query – Mutable: set a value, ask for a range sum. */
    static class NumArray {
        private final int[] a;
        private final Fenwick fw;

        NumArray(int[] nums) {
            a = nums;
            fw = new Fenwick(nums.length);
            for (int i = 0; i < nums.length; i++) fw.add(i + 1, nums[i]);
        }

        void update(int i, int val) {
            fw.add(i + 1, val - a[i]);                   // Fenwick stores deltas: add the difference
            a[i] = val;
        }

        long sumRange(int l, int r) { return fw.prefix(r + 1) - fw.prefix(l); }
    }

    /** Recursive segment tree storing sum and max per node. Node 1 covers [0, n−1]; children 2k and 2k+1. */
    static class SegmentTree {
        private final int n;
        private final long[] sum, max;

        SegmentTree(int[] a) {
            n = a.length;
            sum = new long[4 * n];
            max = new long[4 * n];
            build(1, 0, n - 1, a);
        }

        private void build(int node, int lo, int hi, int[] a) {
            if (lo == hi) { sum[node] = max[node] = a[lo]; return; }
            int mid = (lo + hi) / 2;
            build(2 * node, lo, mid, a);
            build(2 * node + 1, mid + 1, hi, a);
            pull(node);
        }

        private void pull(int node) {
            sum[node] = sum[2 * node] + sum[2 * node + 1];
            max[node] = Math.max(max[2 * node], max[2 * node + 1]);
        }

        void update(int i, int val) { update(1, 0, n - 1, i, val); }

        private void update(int node, int lo, int hi, int i, int val) {
            if (lo == hi) { sum[node] = max[node] = val; return; }
            int mid = (lo + hi) / 2;
            if (i <= mid) update(2 * node, lo, mid, i, val);
            else update(2 * node + 1, mid + 1, hi, i, val);
            pull(node);                                  // recompute on the way back up
        }

        long sum(int l, int r) { return sum(1, 0, n - 1, l, r); }

        private long sum(int node, int lo, int hi, int l, int r) {
            if (r < lo || hi < l) return 0;              // no overlap
            if (l <= lo && hi <= r) return sum[node];    // fully inside: use the stored answer
            int mid = (lo + hi) / 2;
            return sum(2 * node, lo, mid, l, r) + sum(2 * node + 1, mid + 1, hi, l, r);
        }

        long max(int l, int r) { return max(1, 0, n - 1, l, r); }

        private long max(int node, int lo, int hi, int l, int r) {
            if (r < lo || hi < l) return Long.MIN_VALUE;
            if (l <= lo && hi <= r) return max[node];
            int mid = (lo + hi) / 2;
            return Math.max(max(2 * node, lo, mid, l, r), max(2 * node + 1, mid + 1, hi, l, r));
        }
    }

    /** Range add + range sum with lazy propagation: a pending add is pushed to the children only when needed. */
    static class LazySegmentTree {
        private final int n;
        private final long[] sum, pending;

        LazySegmentTree(int[] a) {
            n = a.length;
            sum = new long[4 * n];
            pending = new long[4 * n];
            build(1, 0, n - 1, a);
        }

        private void build(int node, int lo, int hi, int[] a) {
            if (lo == hi) { sum[node] = a[lo]; return; }
            int mid = (lo + hi) / 2;
            build(2 * node, lo, mid, a);
            build(2 * node + 1, mid + 1, hi, a);
            sum[node] = sum[2 * node] + sum[2 * node + 1];
        }

        private void apply(int node, int lo, int hi, long v) { sum[node] += v * (hi - lo + 1); pending[node] += v; }

        private void push(int node, int lo, int hi) {
            if (pending[node] == 0) return;
            int mid = (lo + hi) / 2;
            apply(2 * node, lo, mid, pending[node]);
            apply(2 * node + 1, mid + 1, hi, pending[node]);
            pending[node] = 0;
        }

        void add(int l, int r, long v) { add(1, 0, n - 1, l, r, v); }

        private void add(int node, int lo, int hi, int l, int r, long v) {
            if (r < lo || hi < l) return;
            if (l <= lo && hi <= r) { apply(node, lo, hi, v); return; }
            push(node, lo, hi);
            int mid = (lo + hi) / 2;
            add(2 * node, lo, mid, l, r, v);
            add(2 * node + 1, mid + 1, hi, l, r, v);
            sum[node] = sum[2 * node] + sum[2 * node + 1];
        }

        long sum(int l, int r) { return sum(1, 0, n - 1, l, r); }

        private long sum(int node, int lo, int hi, int l, int r) {
            if (r < lo || hi < l) return 0;
            if (l <= lo && hi <= r) return sum[node];
            push(node, lo, hi);
            int mid = (lo + hi) / 2;
            return sum(2 * node, lo, mid, l, r) + sum(2 * node + 1, mid + 1, hi, l, r);
        }
    }

    /** For each i, how many later elements are smaller. Scan right to left; the Fenwick tree counts values seen. */
    static List<Integer> countSmaller(int[] nums) {
        int[] sorted = Arrays.stream(nums).distinct().sorted().toArray();   // coordinate compression
        Fenwick fw = new Fenwick(sorted.length);
        Integer[] out = new Integer[nums.length];
        for (int i = nums.length - 1; i >= 0; i--) {
            int rank = Arrays.binarySearch(sorted, nums[i]) + 1;   // 1-based rank
            out[i] = (int) fw.prefix(rank - 1);                    // seen values strictly smaller
            fw.add(rank, 1);
        }
        return Arrays.asList(out);
    }

    /** Pairs i < j with a[i] > a[j], counted during merge sort. O(n log n). */
    static long countInversions(int[] a) { return sortCount(a, new int[a.length], 0, a.length - 1); }

    private static long sortCount(int[] a, int[] tmp, int lo, int hi) {
        if (lo >= hi) return 0;
        int mid = (lo + hi) / 2;
        long count = sortCount(a, tmp, lo, mid) + sortCount(a, tmp, mid + 1, hi);
        int i = lo, j = mid + 1, k = lo;
        while (i <= mid && j <= hi) {
            if (a[i] <= a[j]) tmp[k++] = a[i++];
            else { count += mid - i + 1; tmp[k++] = a[j++]; }       // a[j] is smaller than everything left in the left half
        }
        while (i <= mid) tmp[k++] = a[i++];
        while (j <= hi) tmp[k++] = a[j++];
        System.arraycopy(tmp, lo, a, lo, hi - lo + 1);
        return count;
    }

    static long inversionsFenwick(int[] a) {
        long total = 0;
        for (int c : countSmaller(a)) total += c;
        return total;
    }

    static List<Integer> countSmallerBrute(int[] a) {
        List<Integer> out = new ArrayList<>();
        for (int i = 0; i < a.length; i++) { int c = 0; for (int j = i + 1; j < a.length; j++) if (a[j] < a[i]) c++; out.add(c); }
        return out;
    }

    static long inversionsBrute(int[] a) {
        long c = 0;
        for (int i = 0; i < a.length; i++) for (int j = i + 1; j < a.length; j++) if (a[i] > a[j]) c++;
        return c;
    }
}

final class Check {
    private static int passed;
    static void that(boolean cond, String what) { if (!cond) throw new AssertionError("FAILED: " + what); passed++; }
    static void done(String name) { System.out.println("✓ " + name + ": " + passed + " checks passed"); }
}
