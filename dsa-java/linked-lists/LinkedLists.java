// Patterns: Fast & Slow Pointers, In-Place Reversal & Dummy Nodes. Run: java dsa-java/linked-lists/LinkedLists.java
import java.util.*;

public class LinkedLists {
    public static void main(String[] args) {
        var rnd = new Random(10);
        for (int t = 0; t < 3_000; t++) {
            int n = rnd.nextInt(15);
            int[] vals = new int[n]; for (int i = 0; i < n; i++) vals[i] = rnd.nextInt(10);
            // ---- fast & slow ----
            if (n > 0) Check.that(middleNode(build(vals)).val == vals[n / 2], "middleNode (second middle)");
            // cycle
            ListNode head = build(vals); int cycleAt = n > 0 && rnd.nextBoolean() ? rnd.nextInt(n) : -1;
            ListNode entry = null;
            if (cycleAt >= 0) { ListNode tail = head, at = head; for (int i = 0; i < cycleAt; i++) at = at.next; while (tail.next != null) tail = tail.next; tail.next = at; entry = at; }
            Check.that(hasCycle(head) == (cycleAt >= 0), "hasCycle");
            Check.that(detectCycle(head) == entry, "detectCycle start node");
            // remove nth from end
            if (n > 0) { int k = 1 + rnd.nextInt(n); List<Integer> expect = new ArrayList<>(); for (int i = 0; i < n; i++) if (i != n - k) expect.add(vals[i]);
                Check.that(toList(removeNthFromEnd(build(vals), k)).equals(expect), "removeNthFromEnd"); }
            // palindrome
            int[] pal = rnd.nextBoolean() ? palindrome(rnd) : vals;
            List<Integer> pl = new ArrayList<>(); for (int v : pal) pl.add(v); List<Integer> rev = new ArrayList<>(pl); Collections.reverse(rev);
            Check.that(isPalindrome(build(pal)) == pl.equals(rev), "isPalindrome");
            // happy number
            int hn = 1 + rnd.nextInt(1000);
            Check.that(isHappy(hn) == happyBrute(hn), "isHappy");
            // find duplicate (n+1 numbers in 1..n)
            int m = 1 + rnd.nextInt(10); int[] arr = new int[m + 1]; int dup = 1 + rnd.nextInt(m);
            for (int i = 0; i < m; i++) arr[i] = i + 1; arr[m] = dup;
            for (int i = 0; i <= m; i++) if (rnd.nextInt(3) == 0 && arr[i] != dup) arr[i] = dup;   // dup may repeat many times
            shuffle(arr, rnd);
            Check.that(findDuplicate(arr) == dup, "findDuplicate");

            // ---- reversal & dummy nodes ----
            List<Integer> list = toList(build(vals)); List<Integer> r = new ArrayList<>(list); Collections.reverse(r);
            Check.that(toList(reverseList(build(vals))).equals(r), "reverseList");
            Check.that(toList(reverseRecursive(build(vals))).equals(r), "reverseRecursive");
            if (n > 0) { int left = 1 + rnd.nextInt(n), right = left + rnd.nextInt(n - left + 1);
                List<Integer> e = new ArrayList<>(list); Collections.reverse(e.subList(left - 1, right));
                Check.that(toList(reverseBetween(build(vals), left, right)).equals(e), "reverseBetween"); }
            int k = 1 + rnd.nextInt(4); List<Integer> ek = new ArrayList<>(list);
            for (int i = 0; i + k <= n; i += k) Collections.reverse(ek.subList(i, i + k));
            Check.that(toList(reverseKGroup(build(vals), k)).equals(ek), "reverseKGroup");
            // merge two sorted
            int[] x = sortedRandom(rnd), y = sortedRandom(rnd); List<Integer> merged = new ArrayList<>();
            for (int v : x) merged.add(v); for (int v : y) merged.add(v); Collections.sort(merged);
            Check.that(toList(mergeTwoLists(build(x), build(y))).equals(merged), "mergeTwoLists");
            // remove elements
            int del = rnd.nextInt(10); List<Integer> kept = new ArrayList<>(); for (int v : vals) if (v != del) kept.add(v);
            Check.that(toList(removeElements(build(vals), del)).equals(kept), "removeElements");
            // reorder list
            List<Integer> ro = new ArrayList<>(); for (int i = 0, j = n - 1; i <= j; i++, j--) { ro.add(vals[i]); if (i != j) ro.add(vals[j]); }
            ListNode h2 = build(vals); reorderList(h2);
            Check.that(toList(h2).equals(ro), "reorderList");
            // add two numbers
            int[] d1 = digits(rnd), d2 = digits(rnd);
            Check.that(toList(addTwoNumbers(build(d1), build(d2))).equals(digitsOf(value(d1) + value(d2))), "addTwoNumbers");
        }
        Check.done("linked-lists");
    }

    static class ListNode { int val; ListNode next; ListNode(int v) { val = v; } ListNode(int v, ListNode n) { val = v; next = n; } }

    // ================= Fast & slow =================
    static ListNode middleNode(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) { slow = slow.next; fast = fast.next.next; }
        return slow;                                   // second middle for even lengths
    }

    static boolean hasCycle(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next; fast = fast.next.next;
            if (slow == fast) return true;             // fast lapped slow inside the cycle
        }
        return false;                                  // fast fell off the end: no cycle
    }

    static ListNode detectCycle(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next; fast = fast.next.next;
            if (slow == fast) {                        // phase 2: restart one pointer from head
                ListNode p = head;
                while (p != slow) { p = p.next; slow = slow.next; }
                return p;                              // they meet at the cycle's entrance
            }
        }
        return null;
    }

    static ListNode removeNthFromEnd(ListNode head, int n) {
        ListNode dummy = new ListNode(0, head), lead = dummy, lag = dummy;
        for (int i = 0; i <= n; i++) lead = lead.next;   // gap of n + 1 nodes
        while (lead != null) { lead = lead.next; lag = lag.next; }
        lag.next = lag.next.next;                      // lag is just before the node to remove
        return dummy.next;
    }

    static boolean isPalindrome(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) { slow = slow.next; fast = fast.next.next; }
        ListNode second = reverseList(slow);           // reverse the second half
        for (ListNode a = head, b = second; b != null; a = a.next, b = b.next)
            if (a.val != b.val) return false;
        return true;                                   // (restore with reverseList(second) if required)
    }

    static boolean isHappy(int n) {
        int slow = n, fast = n;
        do { slow = digitSquareSum(slow); fast = digitSquareSum(digitSquareSum(fast)); } while (slow != fast);
        return slow == 1;                              // the sequence always cycles; happy iff the cycle is 1 → 1
    }
    static int digitSquareSum(int n) { int s = 0; while (n > 0) { int d = n % 10; s += d * d; n /= 10; } return s; }

    /** n + 1 numbers in [1, n]: treat i → nums[i] as a linked list; the duplicate is the cycle entrance. */
    static int findDuplicate(int[] nums) {
        int slow = nums[0], fast = nums[0];
        do { slow = nums[slow]; fast = nums[nums[fast]]; } while (slow != fast);
        int p = nums[0];
        while (p != slow) { p = nums[p]; slow = nums[slow]; }
        return p;
    }

    // ================= Reversal & dummy nodes =================
    static ListNode reverseList(ListNode head) {
        ListNode prev = null, cur = head;
        while (cur != null) {
            ListNode next = cur.next;                  // 1. save the rest
            cur.next = prev;                           // 2. flip the arrow
            prev = cur;                                // 3. advance both
            cur = next;
        }
        return prev;
    }

    static ListNode reverseRecursive(ListNode head) {
        if (head == null || head.next == null) return head;
        ListNode newHead = reverseRecursive(head.next); // trust: the rest is reversed
        head.next.next = head;                         // the old next now points back to head
        head.next = null;
        return newHead;
    }

    static ListNode reverseBetween(ListNode head, int left, int right) {
        ListNode dummy = new ListNode(0, head), before = dummy;
        for (int i = 1; i < left; i++) before = before.next;     // node just before the segment
        ListNode cur = before.next;
        for (int i = 0; i < right - left; i++) {                 // move cur.next to the front of the segment
            ListNode move = cur.next;
            cur.next = move.next;
            move.next = before.next;
            before.next = move;
        }
        return dummy.next;
    }

    static ListNode reverseKGroup(ListNode head, int k) {
        ListNode dummy = new ListNode(0, head), groupPrev = dummy;
        while (true) {
            ListNode kth = groupPrev;
            for (int i = 0; i < k && kth != null; i++) kth = kth.next;
            if (kth == null) break;                              // fewer than k left: keep as is
            ListNode groupNext = kth.next, prev = groupNext, cur = groupPrev.next;
            while (cur != groupNext) { ListNode next = cur.next; cur.next = prev; prev = cur; cur = next; }
            ListNode oldFirst = groupPrev.next;                  // becomes the group's last node
            groupPrev.next = kth;
            groupPrev = oldFirst;
        }
        return dummy.next;
    }

    static ListNode mergeTwoLists(ListNode a, ListNode b) {
        ListNode dummy = new ListNode(0), tail = dummy;
        while (a != null && b != null) {
            if (a.val <= b.val) { tail.next = a; a = a.next; } else { tail.next = b; b = b.next; }
            tail = tail.next;
        }
        tail.next = a != null ? a : b;                           // attach the leftover
        return dummy.next;
    }

    static ListNode removeElements(ListNode head, int val) {
        ListNode dummy = new ListNode(0, head), cur = dummy;
        while (cur.next != null) {
            if (cur.next.val == val) cur.next = cur.next.next;   // unlink; don't advance
            else cur = cur.next;
        }
        return dummy.next;
    }

    /** L0 → Ln → L1 → Ln−1 …: find middle, reverse second half, interleave. */
    static void reorderList(ListNode head) {
        if (head == null) return;
        ListNode slow = head, fast = head;
        while (fast.next != null && fast.next.next != null) { slow = slow.next; fast = fast.next.next; }
        ListNode second = reverseList(slow.next);
        slow.next = null;                                        // cut the list in two
        for (ListNode first = head; second != null; ) {
            ListNode n1 = first.next, n2 = second.next;
            first.next = second; second.next = n1;
            first = n1; second = n2;
        }
    }

    static ListNode addTwoNumbers(ListNode a, ListNode b) {       // digits in reverse order
        ListNode dummy = new ListNode(0), tail = dummy;
        int carry = 0;
        while (a != null || b != null || carry != 0) {
            int sum = carry + (a != null ? a.val : 0) + (b != null ? b.val : 0);
            tail.next = new ListNode(sum % 10); tail = tail.next;
            carry = sum / 10;
            if (a != null) a = a.next;
            if (b != null) b = b.next;
        }
        return dummy.next;
    }

    // ---- helpers ----
    static ListNode build(int[] v) { ListNode d = new ListNode(0), t = d; for (int x : v) { t.next = new ListNode(x); t = t.next; } return d.next; }
    static List<Integer> toList(ListNode h) { List<Integer> l = new ArrayList<>(); for (; h != null; h = h.next) l.add(h.val); return l; }
    static int[] palindrome(Random r) { int n = r.nextInt(8); int[] a = new int[n]; for (int i = 0; i < (n + 1) / 2; i++) a[i] = a[n - 1 - i] = r.nextInt(4); return a; }
    static int[] sortedRandom(Random r) { int[] a = new int[r.nextInt(8)]; for (int i = 0; i < a.length; i++) a[i] = r.nextInt(20); Arrays.sort(a); return a; }
    static boolean happyBrute(int n) { Set<Integer> seen = new HashSet<>(); while (n != 1 && seen.add(n)) n = digitSquareSum(n); return n == 1; }
    static void shuffle(int[] a, Random r) { for (int i = a.length - 1; i > 0; i--) { int j = r.nextInt(i + 1); int t = a[i]; a[i] = a[j]; a[j] = t; } }
    static int[] digits(Random r) { int n = 1 + r.nextInt(6); int[] d = new int[n]; for (int i = 0; i < n; i++) d[i] = r.nextInt(10); if (n > 1 && d[n - 1] == 0) d[n - 1] = 1; return d; }
    static long value(int[] reversedDigits) { long v = 0; for (int i = reversedDigits.length - 1; i >= 0; i--) v = v * 10 + reversedDigits[i]; return v; }
    static List<Integer> digitsOf(long v) { List<Integer> l = new ArrayList<>(); do { l.add((int) (v % 10)); v /= 10; } while (v > 0); return l; }
}

final class Check {
    private static int passed;
    static void that(boolean cond, String what) { if (!cond) throw new AssertionError("FAILED: " + what); passed++; }
    static void done(String name) { System.out.println("✓ " + name + ": " + passed + " checks passed"); }
}
