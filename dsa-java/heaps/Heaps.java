// Pattern: Heaps — Top-K, K-Way Merge, Two Heaps. Run: java dsa-java/heaps/Heaps.java
import java.util.*;

public class Heaps {
    public static void main(String[] args) {
        var rnd = new Random(12);
        for (int t = 0; t < 3_000; t++) {
            int n = 1 + rnd.nextInt(30);
            int[] a = new int[n]; for (int i = 0; i < n; i++) a[i] = rnd.nextInt(61) - 30;
            int k = 1 + rnd.nextInt(n);
            int[] s = a.clone(); Arrays.sort(s);
            Check.that(findKthLargest(a, k) == s[n - k], "kth largest with a size-k min-heap");
            // k closest points
            int[][] pts = new int[n][]; for (int i = 0; i < n; i++) pts[i] = new int[] { rnd.nextInt(21) - 10, rnd.nextInt(21) - 10 };
            int[][] close = kClosest(pts, k);
            long[] d = Arrays.stream(pts).mapToLong(p -> (long) p[0] * p[0] + (long) p[1] * p[1]).sorted().toArray();
            long[] got = Arrays.stream(close).mapToLong(p -> (long) p[0] * p[0] + (long) p[1] * p[1]).sorted().toArray();
            Check.that(Arrays.equals(got, Arrays.copyOf(d, k)), "kClosest");
            // merge k sorted arrays/lists
            int lists = rnd.nextInt(6); List<int[]> in = new ArrayList<>(); List<Integer> all = new ArrayList<>();
            for (int i = 0; i < lists; i++) { int[] l = new int[rnd.nextInt(6)]; for (int j = 0; j < l.length; j++) l[j] = rnd.nextInt(30); Arrays.sort(l); in.add(l); for (int x : l) all.add(x); }
            Collections.sort(all);
            Check.that(mergeKSorted(in).equals(all), "mergeKSorted");
            // kth smallest in sorted matrix
            int m = 1 + rnd.nextInt(5); int[][] mat = new int[m][m];
            for (int i = 0; i < m; i++) for (int j = 0; j < m; j++) mat[i][j] = (i > 0 ? mat[i - 1][j] : 0) + (j > 0 ? 0 : 0) + rnd.nextInt(4) + (j > 0 ? Math.max(0, mat[i][j - 1] - (i > 0 ? mat[i - 1][j] : 0)) : 0);
            for (int i = 0; i < m; i++) for (int j = 0; j < m; j++) { int need = Math.max(i > 0 ? mat[i - 1][j] : 0, j > 0 ? mat[i][j - 1] : 0); if (mat[i][j] < need) mat[i][j] = need; }
            int kk = 1 + rnd.nextInt(m * m); int[] flat = Arrays.stream(mat).flatMapToInt(Arrays::stream).sorted().toArray();
            Check.that(kthSmallest(mat, kk) == flat[kk - 1], "kthSmallest sorted matrix");
            // running median
            MedianFinder mf = new MedianFinder(); List<Integer> seen = new ArrayList<>();
            for (int i = 0; i < 15; i++) { int v = rnd.nextInt(41) - 20; mf.addNum(v); seen.add(v); List<Integer> c = new ArrayList<>(seen); Collections.sort(c);
                double med = c.size() % 2 == 1 ? c.get(c.size() / 2) : (c.get(c.size() / 2 - 1) + c.get(c.size() / 2)) / 2.0;
                Check.that(mf.findMedian() == med, "running median"); }
            // last stone weight
            int[] stones = new int[n]; for (int i = 0; i < n; i++) stones[i] = 1 + rnd.nextInt(20);
            Check.that(lastStoneWeight(stones) == stoneBrute(stones), "lastStoneWeight");
            // top k frequent with a heap
            int[] f = new int[n]; for (int i = 0; i < n; i++) f[i] = rnd.nextInt(6);
            Map<Integer, Integer> freq = new HashMap<>(); for (int x : f) freq.merge(x, 1, Integer::sum);
            int tk = 1 + rnd.nextInt(freq.size());
            List<Integer> counts = new ArrayList<>(freq.values()); counts.sort(Comparator.reverseOrder());
            List<Integer> gotc = new ArrayList<>(); for (int x : topKFrequent(f, tk)) gotc.add(freq.get(x)); gotc.sort(Comparator.reverseOrder());
            Check.that(gotc.equals(counts.subList(0, tk)), "topKFrequent heap");
        }
        Check.done("heaps");
    }

    // ---------- Top-K: keep a MIN-heap of size k for the k LARGEST ----------
    static int findKthLargest(int[] nums, int k) {
        PriorityQueue<Integer> heap = new PriorityQueue<>();        // min-heap: the weakest of the top k is on top
        for (int x : nums) {
            heap.offer(x);
            if (heap.size() > k) heap.poll();                       // evict the smallest: it can't be in the top k
        }
        return heap.peek();                                          // the smallest of the k largest
    }

    static int[][] kClosest(int[][] points, int k) {
        // MAX-heap by distance: the farthest of the k closest is on top, ready to be evicted
        PriorityQueue<int[]> heap = new PriorityQueue<>((p, q) -> Long.compare(dist(q), dist(p)));
        for (int[] p : points) {
            heap.offer(p);
            if (heap.size() > k) heap.poll();
        }
        return heap.toArray(new int[0][]);
    }
    static long dist(int[] p) { return (long) p[0] * p[0] + (long) p[1] * p[1]; }   // no sqrt needed to compare

    static int[] topKFrequent(int[] nums, int k) {
        Map<Integer, Integer> freq = new HashMap<>();
        for (int x : nums) freq.merge(x, 1, Integer::sum);
        PriorityQueue<Map.Entry<Integer, Integer>> heap = new PriorityQueue<>((x, y) -> Integer.compare(x.getValue(), y.getValue()));
        for (var e : freq.entrySet()) { heap.offer(e); if (heap.size() > k) heap.poll(); }
        return heap.stream().mapToInt(Map.Entry::getKey).toArray();
    }

    static int lastStoneWeight(int[] stones) {
        PriorityQueue<Integer> heap = new PriorityQueue<>(Comparator.reverseOrder());
        for (int s : stones) heap.offer(s);
        while (heap.size() > 1) {
            int y = heap.poll(), x = heap.poll();                     // the two heaviest
            if (y != x) heap.offer(y - x);
        }
        return heap.isEmpty() ? 0 : heap.peek();
    }

    // ---------- K-way merge: one candidate per list in a min-heap ----------
    static List<Integer> mergeKSorted(List<int[]> lists) {
        PriorityQueue<int[]> heap = new PriorityQueue<>((x, y) -> Integer.compare(x[0], y[0]));   // {value, list, index}
        for (int i = 0; i < lists.size(); i++) if (lists.get(i).length > 0) heap.offer(new int[] { lists.get(i)[0], i, 0 });
        List<Integer> out = new ArrayList<>();
        while (!heap.isEmpty()) {
            int[] top = heap.poll();
            out.add(top[0]);
            int list = top[1], next = top[2] + 1;
            if (next < lists.get(list).length) heap.offer(new int[] { lists.get(list)[next], list, next });   // its successor
        }
        return out;
    }

    /** Rows and columns sorted: treat each row as a sorted list; pop k times. */
    static int kthSmallest(int[][] m, int k) {
        PriorityQueue<int[]> heap = new PriorityQueue<>((x, y) -> Integer.compare(x[0], y[0]));
        for (int r = 0; r < Math.min(m.length, k); r++) heap.offer(new int[] { m[r][0], r, 0 });
        for (int i = 1; i < k; i++) {
            int[] top = heap.poll();
            if (top[2] + 1 < m[0].length) heap.offer(new int[] { m[top[1]][top[2] + 1], top[1], top[2] + 1 });
        }
        return heap.peek()[0];
    }

    // ---------- Two heaps: running median ----------
    static class MedianFinder {
        private final PriorityQueue<Integer> low = new PriorityQueue<>(Comparator.reverseOrder());  // max-heap: smaller half
        private final PriorityQueue<Integer> high = new PriorityQueue<>();                          // min-heap: larger half

        void addNum(int x) {
            low.offer(x);                                // 1. add to the smaller half
            high.offer(low.poll());                      // 2. move its largest to the larger half (keeps order)
            if (high.size() > low.size()) low.offer(high.poll());   // 3. rebalance: low may have one extra
        }

        double findMedian() {
            return low.size() > high.size() ? low.peek() : (low.peek() + (long) high.peek()) / 2.0;
        }
    }

    static int stoneBrute(int[] s) { List<Integer> l = new ArrayList<>(); for (int x : s) l.add(x);
        while (l.size() > 1) { Collections.sort(l); int y = l.remove(l.size() - 1), x = l.remove(l.size() - 1); if (y != x) l.add(y - x); }
        return l.isEmpty() ? 0 : l.get(0); }
}

final class Check {
    private static int passed;
    static void that(boolean cond, String what) { if (!cond) throw new AssertionError("FAILED: " + what); passed++; }
    static void done(String name) { System.out.println("✓ " + name + ": " + passed + " checks passed"); }
}
