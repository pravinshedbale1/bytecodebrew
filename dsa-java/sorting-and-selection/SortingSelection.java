// Pattern: Sorting as a Tool. Run: java dsa-java/sorting-and-selection/SortingSelection.java
import java.util.*;

public class SortingSelection {
    public static void main(String[] args) {
        var rnd = new Random(9);
        for (int t = 0; t < 3_000; t++) {
            int n = 1 + rnd.nextInt(30);
            int[] a = new int[n]; for (int i = 0; i < n; i++) a[i] = rnd.nextInt(41) - 20;
            int k = 1 + rnd.nextInt(n);
            int[] s = a.clone(); Arrays.sort(s);
            Check.that(findKthLargest(a.clone(), k, rnd) == s[n - k], "quickselect kth largest");
            // counting sort
            int[] c = new int[n]; for (int i = 0; i < n; i++) c[i] = rnd.nextInt(10);
            int[] cs = c.clone(); Arrays.sort(cs);
            Check.that(Arrays.equals(countingSort(c, 9), cs), "countingSort");
            // top k frequent: compare frequency multisets of the answer with the true top-k frequencies
            int[] f = new int[n]; for (int i = 0; i < n; i++) f[i] = rnd.nextInt(6);
            Map<Integer, Integer> freq = new HashMap<>(); for (int x : f) freq.merge(x, 1, Integer::sum);
            int kk = 1 + rnd.nextInt(freq.size());
            List<Integer> counts = new ArrayList<>(freq.values()); counts.sort(Comparator.reverseOrder());
            int[] top = topKFrequent(f, kk);
            List<Integer> got = new ArrayList<>(); for (int x : top) got.add(freq.get(x)); got.sort(Comparator.reverseOrder());
            Check.that(top.length == kk && got.equals(counts.subList(0, kk)), "topKFrequent");
            // h-index
            int[] cit = new int[n]; for (int i = 0; i < n; i++) cit[i] = rnd.nextInt(15);
            int h = 0; for (int x = 0; x <= n; x++) { int cnt = 0; for (int y : cit) if (y >= x) cnt++; if (cnt >= x) h = x; }
            Check.that(hIndex(cit) == h, "hIndex");
            // largest number: compare with brute force over all permutations for small n
            if (n <= 6) { int[] nums = new int[n]; for (int i = 0; i < n; i++) nums[i] = rnd.nextInt(t % 2 == 0 ? 10 : 200);
                Check.that(largestNumber(nums).equals(largestBrute(nums)), "largestNumber"); }
        }
        Check.done("sorting-and-selection");
    }

    /** Largest number formed by concatenation: order a before b if a+b > b+a. */
    static String largestNumber(int[] nums) {
        String[] s = new String[nums.length];
        for (int i = 0; i < nums.length; i++) s[i] = String.valueOf(nums[i]);
        Arrays.sort(s, (a, b) -> (b + a).compareTo(a + b));
        if (s[0].equals("0")) return "0";                        // all zeros
        return String.join("", s);
    }

    /** Counting sort for values in [0, maxValue]: O(n + maxValue). */
    static int[] countingSort(int[] a, int maxValue) {
        int[] count = new int[maxValue + 1];
        for (int x : a) count[x]++;
        int[] out = new int[a.length];
        int i = 0;
        for (int v = 0; v <= maxValue; v++) while (count[v]-- > 0) out[i++] = v;
        return out;
    }

    /** Bucket sort by frequency: bucket[f] holds values that appear f times. O(n). */
    static int[] topKFrequent(int[] nums, int k) {
        Map<Integer, Integer> freq = new HashMap<>();
        for (int x : nums) freq.merge(x, 1, Integer::sum);
        List<List<Integer>> bucket = new ArrayList<>();
        for (int i = 0; i <= nums.length; i++) bucket.add(new ArrayList<>());
        freq.forEach((value, f) -> bucket.get(f).add(value));
        int[] out = new int[k];
        int i = 0;
        for (int f = nums.length; f >= 1 && i < k; f--)            // highest frequency first
            for (int value : bucket.get(f)) if (i < k) out[i++] = value;
        return out;
    }

    /** h-index with counting: papers with ≥ n citations all go in bucket n. */
    static int hIndex(int[] citations) {
        int n = citations.length;
        int[] count = new int[n + 1];
        for (int c : citations) count[Math.min(c, n)]++;
        int atLeast = 0;
        for (int h = n; h >= 0; h--) {
            atLeast += count[h];                                    // papers with ≥ h citations
            if (atLeast >= h) return h;
        }
        return 0;
    }

    /** Quickselect: average O(n). The k-th largest is index n − k in ascending order. */
    static int findKthLargest(int[] a, int k, Random rnd) {
        int target = a.length - k, lo = 0, hi = a.length - 1;
        while (true) {
            int p = partition(a, lo, hi, lo + rnd.nextInt(hi - lo + 1));
            if (p == target) return a[p];
            if (p < target) lo = p + 1; else hi = p - 1;           // recurse into ONE side only
        }
    }

    /** Lomuto partition around a[pivotIndex]; returns the pivot's final position. */
    static int partition(int[] a, int lo, int hi, int pivotIndex) {
        int pivot = a[pivotIndex];
        swap(a, pivotIndex, hi);                                    // park the pivot at the end
        int store = lo;
        for (int i = lo; i < hi; i++) if (a[i] < pivot) swap(a, i, store++);
        swap(a, store, hi);                                         // pivot into its final place
        return store;
    }
    static void swap(int[] a, int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }

    // brute force for largestNumber
    static String largestBrute(int[] nums) {
        String[] best = { "" };
        permute(nums, 0, best);
        return best[0].replaceFirst("^0+(?=.)", "");
    }
    static void permute(int[] a, int i, String[] best) {
        if (i == a.length) { StringBuilder sb = new StringBuilder(); for (int x : a) sb.append(x); String s = sb.toString();
            if (s.length() > best[0].length() || (s.length() == best[0].length() && s.compareTo(best[0]) > 0)) best[0] = s; return; }
        for (int j = i; j < a.length; j++) { swap(a, i, j); permute(a, i + 1, best); swap(a, i, j); }
    }
}

final class Check {
    private static int passed;
    static void that(boolean cond, String what) { if (!cond) throw new AssertionError("FAILED: " + what); passed++; }
    static void done(String name) { System.out.println("✓ " + name + ": " + passed + " checks passed"); }
}
