// Pattern: Two Pointers. Run: java dsa-java/two-pointers/TwoPointers.java
import java.util.*;

public class TwoPointers {
    public static void main(String[] args) {
        var rnd = new Random(3);
        for (int t = 0; t < 4_000; t++) {
            int n = rnd.nextInt(25);
            int[] a = new int[n];
            for (int i = 0; i < n; i++) a[i] = rnd.nextInt(21) - 10;
            int[] sorted = a.clone(); Arrays.sort(sorted);
            int target = rnd.nextInt(31) - 15;
            // two sum sorted
            int[] r = twoSumSorted(sorted, target);
            boolean exists = false;
            for (int i = 0; i < n; i++) for (int j = i + 1; j < n; j++) if (sorted[i] + sorted[j] == target) exists = true;
            Check.that(exists == (r.length == 2) && (r.length == 0 || (r[0] < r[1] && sorted[r[0]] + sorted[r[1]] == target)), "twoSumSorted");
            // container
            int[] h = new int[n]; for (int i = 0; i < n; i++) h[i] = rnd.nextInt(20);
            int best = 0; for (int i = 0; i < n; i++) for (int j = i + 1; j < n; j++) best = Math.max(best, Math.min(h[i], h[j]) * (j - i));
            Check.that(maxArea(h) == best, "maxArea");
            // 3sum
            Check.that(asSet(threeSum(a.clone())).equals(threeSumBrute(a)) && threeSum(a.clone()).size() == threeSumBrute(a).size(), "threeSum unique triplets");
            // remove duplicates
            int[] d = sorted.clone(); int k = removeDuplicates(d);
            int[] distinct = Arrays.stream(sorted).distinct().toArray();
            Check.that(Arrays.equals(Arrays.copyOf(d, k), distinct), "removeDuplicates");
            // move zeroes
            int[] z = new int[n]; for (int i = 0; i < n; i++) z[i] = rnd.nextInt(3) == 0 ? 0 : rnd.nextInt(9) + 1;
            int[] zc = z.clone(); moveZeroes(zc);
            int[] expect = new int[n]; int w = 0; for (int x : z) if (x != 0) expect[w++] = x;
            Check.that(Arrays.equals(zc, expect), "moveZeroes keeps order");
            // sort colors
            int[] c = new int[n]; for (int i = 0; i < n; i++) c[i] = rnd.nextInt(3);
            int[] cs = c.clone(); Arrays.sort(cs); sortColors(c);
            Check.that(Arrays.equals(c, cs), "sortColors");
            // trapping rain water vs brute
            Check.that(trap(h) == trapBrute(h), "trap");
            // palindrome
            String s = randomPal(rnd);
            String clean = s.toLowerCase().replaceAll("[^a-z0-9]", "");
            Check.that(isPalindrome(s) == new StringBuilder(clean).reverse().toString().equals(clean), "isPalindrome");
        }
        Check.done("two-pointers");
    }

    // ---- opposite ends ----
    static int[] twoSumSorted(int[] a, int target) {
        int left = 0, right = a.length - 1;
        while (left < right) {
            int sum = a[left] + a[right];
            if (sum == target) return new int[] { left, right };
            if (sum < target) left++;            // need a bigger sum: only moving left up can help
            else right--;                        // need a smaller sum: only moving right down can help
        }
        return new int[0];
    }

    static boolean isPalindrome(String s) {
        int left = 0, right = s.length() - 1;
        while (left < right) {
            while (left < right && !Character.isLetterOrDigit(s.charAt(left))) left++;
            while (left < right && !Character.isLetterOrDigit(s.charAt(right))) right--;
            if (Character.toLowerCase(s.charAt(left)) != Character.toLowerCase(s.charAt(right))) return false;
            left++; right--;
        }
        return true;
    }

    static int maxArea(int[] height) {
        int left = 0, right = height.length - 1, best = 0;
        while (left < right) {
            best = Math.max(best, Math.min(height[left], height[right]) * (right - left));
            if (height[left] < height[right]) left++;   // the shorter wall limits the area: move it
            else right--;
        }
        return best;
    }

    static List<List<Integer>> threeSum(int[] nums) {
        Arrays.sort(nums);
        List<List<Integer>> out = new ArrayList<>();
        for (int i = 0; i < nums.length - 2; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;          // skip duplicate first numbers
            int left = i + 1, right = nums.length - 1;
            while (left < right) {
                int sum = nums[i] + nums[left] + nums[right];
                if (sum < 0) left++;
                else if (sum > 0) right--;
                else {
                    out.add(List.of(nums[i], nums[left], nums[right]));
                    left++; right--;
                    while (left < right && nums[left] == nums[left - 1]) left++;     // skip duplicate seconds
                }
            }
        }
        return out;
    }

    static int trap(int[] h) {
        int left = 0, right = h.length - 1, leftMax = 0, rightMax = 0, water = 0;
        while (left < right) {
            if (h[left] < h[right]) {                    // the left side is the limiting one
                leftMax = Math.max(leftMax, h[left]);
                water += leftMax - h[left];
                left++;
            } else {
                rightMax = Math.max(rightMax, h[right]);
                water += rightMax - h[right];
                right--;
            }
        }
        return water;
    }

    // ---- same direction (read/write) ----
    static int removeDuplicates(int[] a) {
        if (a.length == 0) return 0;
        int write = 1;                                   // a[0..write) holds the distinct values so far
        for (int read = 1; read < a.length; read++)
            if (a[read] != a[write - 1]) a[write++] = a[read];
        return write;
    }

    static void moveZeroes(int[] a) {
        int write = 0;
        for (int read = 0; read < a.length; read++)
            if (a[read] != 0) { int tmp = a[write]; a[write] = a[read]; a[read] = tmp; write++; }
    }

    /** Dutch national flag: three regions [0, low) = 0s, [low, mid) = 1s, (high, end] = 2s. */
    static void sortColors(int[] a) {
        int low = 0, mid = 0, high = a.length - 1;
        while (mid <= high) {
            if (a[mid] == 0) swap(a, low++, mid++);
            else if (a[mid] == 1) mid++;
            else swap(a, mid, high--);                   // don't advance mid: the swapped-in value is unchecked
        }
    }
    static void swap(int[] a, int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }

    // ---- brute forces for testing ----
    static int trapBrute(int[] h) {
        int w = 0;
        for (int i = 0; i < h.length; i++) {
            int l = 0, r = 0;
            for (int j = 0; j <= i; j++) l = Math.max(l, h[j]);
            for (int j = i; j < h.length; j++) r = Math.max(r, h[j]);
            w += Math.min(l, r) - h[i];
        }
        return w;
    }
    static Set<List<Integer>> threeSumBrute(int[] a) {
        Set<List<Integer>> s = new HashSet<>();
        for (int i = 0; i < a.length; i++) for (int j = i + 1; j < a.length; j++) for (int k = j + 1; k < a.length; k++)
            if (a[i] + a[j] + a[k] == 0) { int[] t = { a[i], a[j], a[k] }; Arrays.sort(t); s.add(List.of(t[0], t[1], t[2])); }
        return s;
    }
    static Set<List<Integer>> asSet(List<List<Integer>> l) { return new HashSet<>(l); }
    static String randomPal(Random r) {
        String alphabet = "abA ,1";
        StringBuilder sb = new StringBuilder(); int n = r.nextInt(8);
        for (int i = 0; i < n; i++) sb.append(alphabet.charAt(r.nextInt(alphabet.length())));
        String half = sb.toString();
        return r.nextBoolean() ? half + new StringBuilder(half).reverse() : half;
    }
}

final class Check {
    private static int passed;
    static void that(boolean cond, String what) { if (!cond) throw new AssertionError("FAILED: " + what); passed++; }
    static void done(String name) { System.out.println("✓ " + name + ": " + passed + " checks passed"); }
}
