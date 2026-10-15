// Pattern: Sliding Window. Run: java dsa-java/sliding-window/SlidingWindow.java
import java.util.*;

public class SlidingWindow {
    public static void main(String[] args) {
        var rnd = new Random(4);
        for (int t = 0; t < 3_000; t++) {
            String s = word(rnd, 20, 5);
            // longest without repeating
            int best = 0;
            for (int i = 0; i < s.length(); i++) for (int j = i; j < s.length(); j++)
                if (s.substring(i, j + 1).chars().distinct().count() == j - i + 1) best = Math.max(best, j - i + 1);
            Check.that(lengthOfLongestSubstring(s) == best, "longest without repeating");
            // character replacement
            int k = rnd.nextInt(4), bestR = 0;
            for (int i = 0; i < s.length(); i++) for (int j = i; j < s.length(); j++) {
                int[] c = new int[26]; int mx = 0;
                for (int x = i; x <= j; x++) mx = Math.max(mx, ++c[s.charAt(x) - 'a']);
                if (j - i + 1 - mx <= k) bestR = Math.max(bestR, j - i + 1);
            }
            Check.that(characterReplacement(s, k) == bestR, "characterReplacement");
            // min size subarray sum (positives)
            int n = rnd.nextInt(20); int[] a = new int[n];
            for (int i = 0; i < n; i++) a[i] = 1 + rnd.nextInt(9);
            int target = 1 + rnd.nextInt(40), bestM = 0;
            for (int i = 0; i < n; i++) { int sum = 0; for (int j = i; j < n; j++) { sum += a[j]; if (sum >= target) { bestM = bestM == 0 ? j - i + 1 : Math.min(bestM, j - i + 1); break; } } }
            Check.that(minSubArrayLen(target, a) == bestM, "minSubArrayLen");
            // fixed window max sum
            if (n > 0) { int kk = 1 + rnd.nextInt(n); long bf = Long.MIN_VALUE;
                for (int i = 0; i + kk <= n; i++) { long sm = 0; for (int j = i; j < i + kk; j++) sm += a[j]; bf = Math.max(bf, sm); }
                Check.that(maxSumOfSizeK(a, kk) == bf, "maxSumOfSizeK"); }
            // find anagrams
            String p = "a" + word(rnd, 3, 3), text = word(rnd, 25, 3);   // the problem guarantees a non-empty p
            List<Integer> expect = new ArrayList<>();
            char[] ps = p.toCharArray(); Arrays.sort(ps);
            for (int i = 0; i + p.length() <= text.length(); i++) { char[] w = text.substring(i, i + p.length()).toCharArray(); Arrays.sort(w); if (Arrays.equals(w, ps)) expect.add(i); }
            Check.that(findAnagrams(text, p).equals(expect), "findAnagrams");
            // min window substring
            String tt = "a" + word(rnd, 3, 4), ss = word(rnd, 20, 4);   // t is non-empty by the problem statement
            Check.that(minWindow(ss, tt).equals(minWindowBrute(ss, tt)), "minWindow");
            // exactly k distinct
            int[] b = new int[rnd.nextInt(15)]; for (int i = 0; i < b.length; i++) b[i] = rnd.nextInt(4);
            int kd = 1 + rnd.nextInt(3), cnt = 0;
            for (int i = 0; i < b.length; i++) { Set<Integer> st = new HashSet<>(); for (int j = i; j < b.length; j++) { st.add(b[j]); if (st.size() == kd) cnt++; } }
            Check.that(subarraysWithKDistinct(b, kd) == cnt, "exactly k distinct");
        }
        Check.done("sliding-window");
    }

    // Fixed size k
    static long maxSumOfSizeK(int[] a, int k) {
        long sum = 0, best;
        for (int i = 0; i < k; i++) sum += a[i];
        best = sum;
        for (int right = k; right < a.length; right++) {
            sum += a[right] - a[right - k];          // slide: add the new element, drop the oldest
            best = Math.max(best, sum);
        }
        return best;
    }

    // Variable size, longest valid window
    static int lengthOfLongestSubstring(String s) {
        Map<Character, Integer> count = new HashMap<>();
        int left = 0, best = 0;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            count.merge(c, 1, Integer::sum);                       // 1. expand
            while (count.get(c) > 1) {                             // 2. shrink while invalid
                count.merge(s.charAt(left), -1, Integer::sum);
                left++;
            }
            best = Math.max(best, right - left + 1);               // 3. window is valid: record
        }
        return best;
    }

    static int characterReplacement(String s, int k) {
        int[] count = new int[26];
        int left = 0, maxFreq = 0, best = 0;
        for (int right = 0; right < s.length(); right++) {
            maxFreq = Math.max(maxFreq, ++count[s.charAt(right) - 'a']);
            while (right - left + 1 - maxFreq > k) {           // more than k letters to change
                count[s.charAt(left) - 'a']--;
                left++;
            }
            best = Math.max(best, right - left + 1);
        }
        return best;
    }

    // Variable size, shortest valid window
    static int minSubArrayLen(int target, int[] nums) {
        int left = 0, sum = 0, best = Integer.MAX_VALUE;
        for (int right = 0; right < nums.length; right++) {
            sum += nums[right];                                    // expand
            while (sum >= target) {                                // shrink while STILL valid
                best = Math.min(best, right - left + 1);           // record before shrinking
                sum -= nums[left++];
            }
        }
        return best == Integer.MAX_VALUE ? 0 : best;
    }

    // Fixed size, compare counts
    static List<Integer> findAnagrams(String s, String p) {
        List<Integer> out = new ArrayList<>();
        if (p.length() > s.length()) return out;
        int[] need = new int[26], have = new int[26];
        for (char c : p.toCharArray()) need[c - 'a']++;
        for (int right = 0; right < s.length(); right++) {
            have[s.charAt(right) - 'a']++;
            if (right >= p.length()) have[s.charAt(right - p.length()) - 'a']--;   // drop the char that left
            if (right >= p.length() - 1 && Arrays.equals(have, need)) out.add(right - p.length() + 1);
        }
        return out;
    }

    static String minWindow(String s, String t) {
        if (t.isEmpty()) return "";
        Map<Character, Integer> need = new HashMap<>();
        for (char c : t.toCharArray()) need.merge(c, 1, Integer::sum);
        int missing = t.length(), left = 0, bestStart = 0, bestLen = Integer.MAX_VALUE;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (need.containsKey(c)) { if (need.get(c) > 0) missing--; need.merge(c, -1, Integer::sum); }
            while (missing == 0) {                                 // window covers t: try to shrink
                if (right - left + 1 < bestLen) { bestLen = right - left + 1; bestStart = left; }
                char d = s.charAt(left++);
                if (need.containsKey(d)) { need.merge(d, 1, Integer::sum); if (need.get(d) > 0) missing++; }
            }
        }
        return bestLen == Integer.MAX_VALUE ? "" : s.substring(bestStart, bestStart + bestLen);
    }

    // exactly(k) = atMost(k) − atMost(k − 1)
    static int subarraysWithKDistinct(int[] nums, int k) { return atMostK(nums, k) - atMostK(nums, k - 1); }

    static int atMostK(int[] nums, int k) {
        Map<Integer, Integer> count = new HashMap<>();
        int left = 0, total = 0;
        for (int right = 0; right < nums.length; right++) {
            count.merge(nums[right], 1, Integer::sum);
            while (count.size() > k) {
                if (count.merge(nums[left], -1, Integer::sum) == 0) count.remove(nums[left]);
                left++;
            }
            total += right - left + 1;               // every subarray ending at right and starting in [left, right]
        }
        return total;
    }

    // ---- testing helpers ----
    static String minWindowBrute(String s, String t) {
        String best = "";
        for (int i = 0; i < s.length(); i++) for (int j = i; j < s.length(); j++) {
            int[] c = new int[128];
            for (int x = i; x <= j; x++) c[s.charAt(x)]++;
            boolean ok = true;
            for (char ch : t.toCharArray()) if (--c[ch] < 0) ok = false;
            if (ok && (best.isEmpty() || j - i + 1 < best.length())) best = s.substring(i, j + 1);
        }
        return best;
    }
    static String word(Random r, int max, int alpha) { StringBuilder sb = new StringBuilder(); int n = r.nextInt(max + 1); for (int i = 0; i < n; i++) sb.append((char) ('a' + r.nextInt(alpha))); return sb.toString(); }
}

final class Check {
    private static int passed;
    static void that(boolean cond, String what) { if (!cond) throw new AssertionError("FAILED: " + what); passed++; }
    static void done(String name) { System.out.println("✓ " + name + ": " + passed + " checks passed"); }
}
