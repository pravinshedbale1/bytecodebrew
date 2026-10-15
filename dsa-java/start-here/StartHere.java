// Code from the "DSA Without Fear" lessons. Run: java dsa-java/start-here/StartHere.java
import java.util.*;

public class StartHere {
    public static void main(String[] args) {
        var rnd = new Random(1);
        for (int t = 0; t < 5_000; t++) {
            int n = 2 + rnd.nextInt(30);
            int[] a = new int[n];
            for (int i = 0; i < n; i++) a[i] = rnd.nextInt(41) - 20;
            int target = rnd.nextInt(81) - 40;
            int[] fast = twoSum(a, target), slow = twoSumBrute(a, target);
            Check.that((fast.length == 0) == (slow.length == 0), "both find a pair or neither does");
            if (fast.length == 2) Check.that(fast[0] != fast[1] && a[fast[0]] + a[fast[1]] == target, "valid pair");
        }
        // problem-solving framework: stock profit
        for (int t = 0; t < 5_000; t++) {
            int[] p = new int[rnd.nextInt(30)];
            for (int i = 0; i < p.length; i++) p[i] = rnd.nextInt(100);
            Check.that(maxProfit(p) == maxProfitBrute(p), "maxProfit matches brute force");
        }
        // recursion
        for (int t = 0; t < 2_000; t++) {
            int[] a = new int[rnd.nextInt(50)];
            for (int i = 0; i < a.length; i++) a[i] = rnd.nextInt(201) - 100;
            Check.that(sum(a, 0) == Arrays.stream(a).sum(), "recursive sum");
            int[] sorted = a.clone(); Arrays.sort(sorted);
            int[] mine = a.clone(); mergeSort(mine, 0, mine.length, new int[mine.length]);
            Check.that(Arrays.equals(mine, sorted), "merge sort");
            long x = rnd.nextInt(7) - 3; int n = rnd.nextInt(20);
            long slow = 1; for (int i = 0; i < n; i++) slow *= x;
            Check.that(power(x, n) == slow, "fast power");
        }
        for (int n = 0; n <= 10; n++) {
            int[] nums = new int[n]; for (int i = 0; i < n; i++) nums[i] = i;
            List<List<Integer>> out = new ArrayList<>();
            subsets(nums, 0, new ArrayList<>(), out);
            Check.that(out.size() == (1 << n) && new HashSet<>(out).size() == out.size(), "2^n distinct subsets");
        }
        Check.that(isPal("racecar", 0, 6) && isPal("", 0, -1) && !isPal("ab", 0, 1), "palindrome");
        Check.done("start-here");
    }

    // Try every pair: about n²/2 checks.
    static int[] twoSumBrute(int[] nums, int target) {
        for (int i = 0; i < nums.length; i++)
            for (int j = i + 1; j < nums.length; j++)
                if (nums[i] + nums[j] == target) return new int[] { i, j };
        return new int[0];
    }

    // One pass with a hash map.
    static int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();          // value → index
        for (int i = 0; i < nums.length; i++) {
            Integer j = seen.get(target - nums[i]);            // the partner we need
            if (j != null) return new int[] { j, i };
            seen.put(nums[i], i);
        }
        return new int[0];
    }

    static int maxProfitBrute(int[] prices) {
        int best = 0;
        for (int i = 0; i < prices.length; i++)
            for (int j = i + 1; j < prices.length; j++)
                best = Math.max(best, prices[j] - prices[i]);
        return best;
    }

    static int maxProfit(int[] prices) {
        int minSoFar = Integer.MAX_VALUE, best = 0;
        for (int price : prices) {
            minSoFar = Math.min(minSoFar, price);
            best = Math.max(best, price - minSoFar);
        }
        return best;
    }

    static int sum(int[] a, int i) {
        if (i == a.length) return 0;
        return a[i] + sum(a, i + 1);
    }

    static long power(long x, int n) {
        if (n == 0) return 1;
        long half = power(x, n / 2);
        return n % 2 == 0 ? half * half : half * half * x;
    }

    static void mergeSort(int[] a, int lo, int hi, int[] tmp) {
        if (hi - lo <= 1) return;
        int mid = (lo + hi) >>> 1;
        mergeSort(a, lo, mid, tmp);
        mergeSort(a, mid, hi, tmp);
        int i = lo, j = mid, k = lo;
        while (i < mid && j < hi) tmp[k++] = a[i] <= a[j] ? a[i++] : a[j++];
        while (i < mid) tmp[k++] = a[i++];
        while (j < hi) tmp[k++] = a[j++];
        System.arraycopy(tmp, lo, a, lo, hi - lo);
    }

    static void subsets(int[] nums, int i, List<Integer> current, List<List<Integer>> out) {
        if (i == nums.length) { out.add(new ArrayList<>(current)); return; }
        subsets(nums, i + 1, current, out);
        current.add(nums[i]);
        subsets(nums, i + 1, current, out);
        current.remove(current.size() - 1);
    }

    static boolean isPal(String s, int i, int j) {
        return i >= j || (s.charAt(i) == s.charAt(j) && isPal(s, i + 1, j - 1));
    }
}

final class Check {
    private static int passed;
    static void that(boolean cond, String what) { if (!cond) throw new AssertionError("FAILED: " + what); passed++; }
    static void done(String name) { System.out.println("✓ " + name + ": " + passed + " checks passed"); }
}
