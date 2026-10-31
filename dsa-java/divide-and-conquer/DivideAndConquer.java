// Pattern: Divide and Conquer. Run: java dsa-java/divide-and-conquer/DivideAndConquer.java
import java.util.*;

public class DivideAndConquer {
    public static void main(String[] args) {
        var rnd = new Random(61);
        for (int t = 0; t < 4_000; t++) {
            int n = rnd.nextInt(40);
            int[] a = new int[n];
            int spread = 1 + rnd.nextInt(t % 4 == 0 ? 3 : 1000);
            for (int i = 0; i < n; i++) a[i] = rnd.nextInt(2 * spread + 1) - spread;

            // count inversions while merge sorting
            long brute = 0;
            for (int i = 0; i < n; i++) for (int j = i + 1; j < n; j++) if (a[i] > a[j]) brute++;
            int[] copy = a.clone();
            Check.that(countInversions(copy, 0, n) == brute, "countInversions matches counting every pair");
            int[] sorted = a.clone(); Arrays.sort(sorted);
            Check.that(Arrays.equals(copy, sorted), "countInversions leaves the array sorted");

            // maximum subarray by divide and conquer vs every subarray
            if (n > 0) {
                long best = Long.MIN_VALUE;
                for (int i = 0; i < n; i++) { long s = 0; for (int j = i; j < n; j++) { s += a[j]; best = Math.max(best, s); } }
                Check.that(maxSubarray(a, 0, n - 1) == best, "maxSubarray matches every subarray");
            }

            // sort a linked list by merge sort
            ListNode head = null;
            for (int i = n - 1; i >= 0; i--) head = new ListNode(a[i], head);
            ListNode s = sortList(head);
            for (int i = 0; i < n; i++, s = s.next) Check.that(s != null && s.val == sorted[i], "sortList gives sorted order");
            Check.that(s == null, "sortList keeps every node");

            // longest substring where every letter appears at least k times
            int len = 1 + rnd.nextInt(30), k = 1 + rnd.nextInt(4);
            StringBuilder sb = new StringBuilder();
            String alpha = "abcd".substring(0, 1 + rnd.nextInt(4));
            for (int i = 0; i < len; i++) sb.append(alpha.charAt(rnd.nextInt(alpha.length())));
            String str = sb.toString();
            Check.that(longestSubstring(str.toCharArray(), 0, len, k) == bruteLongest(str, k), "longestSubstring matches checking every substring");

            // every parenthesisation of a short expression
            String expr = randomExpression(rnd);
            List<Integer> got = diffWays(expr, new HashMap<>());
            List<Integer> want = bruteWays(expr);
            Collections.sort(got); Collections.sort(want);
            Check.that(got.equals(want), "diffWays matches evaluating every grouping");
        }
        Check.done("Divide and conquer");
    }

    // ---- merge sort that counts inversions: pairs i < j with a[i] > a[j]
    static long countInversions(int[] a, int lo, int hi) {           // sorts a[lo, hi)
        if (hi - lo < 2) return 0;
        int mid = (lo + hi) >>> 1;
        long count = countInversions(a, lo, mid) + countInversions(a, mid, hi);
        int[] merged = new int[hi - lo];
        int i = lo, j = mid, k = 0;
        while (i < mid && j < hi) {
            if (a[i] <= a[j]) merged[k++] = a[i++];
            else {
                count += mid - i;                                       // a[j] is smaller than every left element still waiting
                merged[k++] = a[j++];
            }
        }
        while (i < mid) merged[k++] = a[i++];
        while (j < hi) merged[k++] = a[j++];
        System.arraycopy(merged, 0, a, lo, merged.length);
        return count;
    }

    // ---- maximum subarray: best on the left, best on the right, or best crossing the middle
    static long maxSubarray(int[] a, int lo, int hi) {
        if (lo == hi) return a[lo];
        int mid = (lo + hi) >>> 1;
        long leftBest = Long.MIN_VALUE, sum = 0;
        for (int i = mid; i >= lo; i--) { sum += a[i]; leftBest = Math.max(leftBest, sum); }
        long rightBest = Long.MIN_VALUE; sum = 0;
        for (int i = mid + 1; i <= hi; i++) { sum += a[i]; rightBest = Math.max(rightBest, sum); }
        long crossing = leftBest + rightBest;
        return Math.max(crossing, Math.max(maxSubarray(a, lo, mid), maxSubarray(a, mid + 1, hi)));
    }

    // ---- merge sort on a linked list
    static ListNode sortList(ListNode head) {
        if (head == null || head.next == null) return head;
        ListNode slow = head, fast = head.next;
        while (fast != null && fast.next != null) { slow = slow.next; fast = fast.next.next; }
        ListNode second = slow.next;
        slow.next = null;
        ListNode a = sortList(head), b = sortList(second), dummy = new ListNode(0, null), tail = dummy;
        while (a != null && b != null) {
            if (a.val <= b.val) { tail.next = a; a = a.next; } else { tail.next = b; b = b.next; }
            tail = tail.next;
        }
        tail.next = a != null ? a : b;
        return dummy.next;
    }

    // ---- split at characters that can't be in any valid substring
    static int longestSubstring(char[] s, int lo, int hi, int k) {   // the answer inside s[lo, hi)
        if (hi - lo < k) return 0;
        int[] count = new int[26];
        for (int i = lo; i < hi; i++) count[s[i] - 'a']++;
        boolean allGood = true;
        for (int i = lo; i < hi; i++) if (count[s[i] - 'a'] < k) { allGood = false; break; }
        if (allGood) return hi - lo;                                    // the whole range is valid
        int best = 0, start = lo;
        for (int j = lo; j <= hi; j++) {
            if (j == hi || count[s[j] - 'a'] < k) {                     // a "bad" letter (or the end): close a piece
                best = Math.max(best, longestSubstring(s, start, j, k));
                start = j + 1;
            }
        }
        return best;
    }

    // ---- split on the operator applied last
    static List<Integer> diffWays(String e, Map<String, List<Integer>> memo) {
        if (memo.containsKey(e)) return new ArrayList<>(memo.get(e));
        List<Integer> res = new ArrayList<>();
        for (int i = 0; i < e.length(); i++) {
            char c = e.charAt(i);
            if (c != '+' && c != '-' && c != '*') continue;
            for (int x : diffWays(e.substring(0, i), memo))
                for (int y : diffWays(e.substring(i + 1), memo))
                    res.add(c == '+' ? x + y : c == '-' ? x - y : x * y);
        }
        if (res.isEmpty()) res.add(Integer.parseInt(e));
        memo.put(e, res);
        return new ArrayList<>(res);
    }

    // ---- brute forces
    static int bruteLongest(String s, int k) {
        int best = 0;
        for (int i = 0; i < s.length(); i++) for (int j = i + 1; j <= s.length(); j++) {
            int[] c = new int[26];
            for (int x = i; x < j; x++) c[s.charAt(x) - 'a']++;
            boolean ok = true;
            for (int v : c) if (v > 0 && v < k) ok = false;
            if (ok) best = Math.max(best, j - i);
        }
        return best;
    }

    /** Evaluate every binary tree over the numbers and operators (an independent enumeration). */
    static List<Integer> bruteWays(String e) {
        List<Integer> nums = new ArrayList<>(); List<Character> ops = new ArrayList<>();
        int v = 0;
        for (char c : e.toCharArray()) { if (Character.isDigit(c)) v = v * 10 + (c - '0'); else { nums.add(v); v = 0; ops.add(c); } }
        nums.add(v);
        return trees(nums, ops, 0, nums.size() - 1);
    }

    static List<Integer> trees(List<Integer> nums, List<Character> ops, int lo, int hi) {
        if (lo == hi) return new ArrayList<>(List.of(nums.get(lo)));
        List<Integer> out = new ArrayList<>();
        for (int m = lo; m < hi; m++) {
            char op = ops.get(m);
            for (int x : trees(nums, ops, lo, m)) for (int y : trees(nums, ops, m + 1, hi))
                out.add(op == '+' ? x + y : op == '-' ? x - y : x * y);
        }
        return out;
    }

    static String randomExpression(Random rnd) {
        int count = 1 + rnd.nextInt(6);
        StringBuilder sb = new StringBuilder().append(rnd.nextInt(20));
        for (int i = 1; i < count; i++) sb.append("+-*".charAt(rnd.nextInt(3))).append(rnd.nextInt(20));
        return sb.toString();
    }
}

final class ListNode {
    int val; ListNode next;
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

final class Check {
    private static int passed;
    static void that(boolean cond, String what) { if (!cond) throw new AssertionError("FAILED: " + what); passed++; }
    static void done(String name) { System.out.println("✓ " + name + ": " + passed + " checks passed"); }
}
