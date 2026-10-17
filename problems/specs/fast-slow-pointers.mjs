export default [
  {
    slug: 'middle-of-the-linked-list', title: 'Middle of the Linked List', level: 'Easy',
    summary: 'Return the middle node of the list; with two middle nodes, return the second. The judge prints the list from the node you return.',
    method: 'middleNode', params: [['ListNode', 'head']], returns: 'ListNode',
    tests: [
      { in: [[1, 2, 3, 4, 5]], out: [3, 4, 5] },
      { in: [[1, 2, 3, 4, 5, 6]], out: [4, 5, 6] },
      { in: [[1]] },
      { in: [[1, 2]] },
    ],
    ref: `class Solution {
    public ListNode middleNode(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) { slow = slow.next; fast = fast.next.next; }
        return slow;
    }
}`,
  },
  {
    slug: 'linked-list-cycle', title: 'Linked List Cycle', level: 'Easy',
    summary: 'Return true if the list contains a cycle. (The tests give the list and pos, the index the tail links back to, or -1 for no cycle; your method only receives head.) Aim for O(1) memory.',
    method: 'hasCycle', params: [['ListNode', 'head'], ['int', 'pos']], starterParams: [['ListNode', 'head']], returns: 'boolean',
    call: 'Object r = s.hasCycle(BCBN.cycle($0, BCB.I($1)));',
    tests: [
      { in: [[3, 2, 0, -4], 1], out: true },
      { in: [[1, 2], 0], out: true },
      { in: [[1], -1], out: false },
      { in: [[], -1] },
      { in: [[1, 2, 3, 4, 5], 4] },
      { in: [[1, 2, 3, 4, 5], -1] },
    ],
    ref: `class Solution {
    public boolean hasCycle(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) { slow = slow.next; fast = fast.next.next; if (slow == fast) return true; }
        return false;
    }
}`,
  },
  {
    slug: 'happy-number', title: 'Happy Number', level: 'Easy',
    summary: 'Repeatedly replace n by the sum of the squares of its digits. n is happy if this reaches 1; otherwise it loops forever. Return whether n is happy.',
    method: 'isHappy', params: [['int', 'n']], returns: 'boolean',
    tests: [
      { in: [19], out: true },
      { in: [2], out: false },
      { in: [1] },
      { in: [7] },
      { in: [2147483647] },
    ],
    ref: `class Solution {
    public boolean isHappy(int n) {
        int slow = n, fast = next(n);
        while (fast != 1 && slow != fast) { slow = next(slow); fast = next(next(fast)); }
        return fast == 1;
    }
    private int next(int n) { int s = 0; while (n > 0) { int d = n % 10; s += d * d; n /= 10; } return s; }
}`,
  },
  {
    slug: 'palindrome-linked-list', title: 'Palindrome Linked List', level: 'Easy',
    summary: 'Return whether the list\'s values read the same forwards and backwards — ideally in O(n) time and O(1) space.',
    method: 'isPalindrome', params: [['ListNode', 'head']], returns: 'boolean',
    tests: [
      { in: [[1, 2, 2, 1]], out: true },
      { in: [[1, 2]], out: false },
      { in: [[1]] },
      { in: [[1, 2, 1]] },
      { in: [[1, 2, 3, 1]] },
    ],
    ref: `class Solution {
    public boolean isPalindrome(ListNode head) {
        ListNode slow = head, fast = head, prev = null;
        while (fast != null && fast.next != null) { fast = fast.next.next; ListNode nx = slow.next; slow.next = prev; prev = slow; slow = nx; }
        if (fast != null) slow = slow.next;
        while (prev != null) { if (prev.val != slow.val) return false; prev = prev.next; slow = slow.next; }
        return true;
    }
}`,
  },
  {
    slug: 'remove-nth-node-from-end-of-list', title: 'Remove Nth Node From End of List', level: 'Medium',
    summary: 'Remove the n-th node from the end of the list (n is valid) and return the head — in one pass if you can.',
    method: 'removeNthFromEnd', params: [['ListNode', 'head'], ['int', 'n']], returns: 'ListNode',
    tests: [
      { in: [[1, 2, 3, 4, 5], 2], out: [1, 2, 3, 5] },
      { in: [[1], 1], out: [] },
      { in: [[1, 2], 1], out: [1] },
      { in: [[1, 2], 2] },
      { in: [[1, 2, 3], 3] },
    ],
    ref: `class Solution {
    public ListNode removeNthFromEnd(ListNode head, int n) {
        ListNode dummy = new ListNode(0, head), lead = dummy, trail = dummy;
        for (int i = 0; i <= n; i++) lead = lead.next;
        while (lead != null) { lead = lead.next; trail = trail.next; }
        trail.next = trail.next.next;
        return dummy.next;
    }
}`,
  },
  {
    slug: 'linked-list-cycle-ii', title: 'Linked List Cycle II', level: 'Medium',
    summary: 'Return the node where the cycle begins, or null if there is no cycle, without modifying the list. The judge prints that node\'s index (-1 for null). Tests give the list and the tail\'s link position.',
    method: 'detectCycle', params: [['ListNode', 'head'], ['int', 'pos']], starterParams: [['ListNode', 'head']], returns: 'ListNode',
    call: 'ListNode h = BCBN.cycle($0, BCB.I($1)); ListNode c = s.detectCycle(h); Object r = c == null ? -1 : BCBN.indexOf(h, c);',
    tests: [
      { in: [[3, 2, 0, -4], 1], out: 1 },
      { in: [[1, 2], 0], out: 0 },
      { in: [[1], -1], out: -1 },
      { in: [[1, 2, 3, 4, 5, 6], 3] },
      { in: [[1, 2, 3], 2] },
    ],
    ref: `class Solution {
    public ListNode detectCycle(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next; fast = fast.next.next;
            if (slow == fast) { slow = head; while (slow != fast) { slow = slow.next; fast = fast.next; } return slow; }
        }
        return null;
    }
}`,
  },
  {
    slug: 'reorder-list', title: 'Reorder List', level: 'Medium',
    summary: 'Reorder L0 → L1 → … → Ln into L0 → Ln → L1 → Ln−1 → … in place, by relinking nodes. The judge prints the list after your call.',
    method: 'reorderList', params: [['ListNode', 'head']], returns: 'void', output: 0,
    tests: [
      { in: [[1, 2, 3, 4]], out: [1, 4, 2, 3] },
      { in: [[1, 2, 3, 4, 5]], out: [1, 5, 2, 4, 3] },
      { in: [[1]] },
      { in: [[1, 2]] },
      { in: [[1, 2, 3, 4, 5, 6]] },
    ],
    ref: `class Solution {
    public void reorderList(ListNode head) {
        if (head == null || head.next == null) return;
        ListNode slow = head, fast = head;
        while (fast.next != null && fast.next.next != null) { slow = slow.next; fast = fast.next.next; }
        ListNode prev = null, cur = slow.next; slow.next = null;
        while (cur != null) { ListNode nx = cur.next; cur.next = prev; prev = cur; cur = nx; }
        ListNode a = head, b = prev;
        while (b != null) { ListNode an = a.next, bn = b.next; a.next = b; b.next = an; a = an; b = bn; }
    }
}`,
  },
  {
    slug: 'find-the-duplicate-number', title: 'Find the Duplicate Number', level: 'Medium',
    summary: 'nums has n + 1 values, each in 1..n, and exactly one value repeats (possibly many times). Return it without modifying the array, using O(1) extra space.',
    method: 'findDuplicate', params: [['int[]', 'nums']], returns: 'int',
    tests: [
      { in: [[1, 3, 4, 2, 2]], out: 2 },
      { in: [[3, 1, 3, 4, 2]], out: 3 },
      { in: [[3, 3, 3, 3, 3]], out: 3 },
      { in: [[1, 1]] },
      { in: [[2, 5, 9, 6, 9, 3, 8, 9, 7, 1]] },
    ],
    ref: `class Solution {
    public int findDuplicate(int[] nums) {
        int slow = nums[0], fast = nums[0];
        do { slow = nums[slow]; fast = nums[nums[fast]]; } while (slow != fast);
        slow = nums[0];
        while (slow != fast) { slow = nums[slow]; fast = nums[fast]; }
        return slow;
    }
}`,
  },
];
