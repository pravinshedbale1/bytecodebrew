export default [
  {
    slug: 'reverse-linked-list', title: 'Reverse Linked List', level: 'Easy',
    summary: 'Reverse a singly linked list and return the new head.',
    method: 'reverseList', params: [['ListNode', 'head']], returns: 'ListNode',
    tests: [
      { in: [[1, 2, 3, 4, 5]], out: [5, 4, 3, 2, 1] },
      { in: [[1, 2]], out: [2, 1] },
      { in: [[]], out: [] },
      { in: [[7]] },
    ],
    ref: `class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null;
        while (head != null) { ListNode next = head.next; head.next = prev; prev = head; head = next; }
        return prev;
    }
}`,
  },
  {
    slug: 'merge-two-sorted-lists', title: 'Merge Two Sorted Lists', level: 'Easy',
    summary: 'Merge two sorted linked lists into one sorted list by splicing their nodes together; return its head.',
    method: 'mergeTwoLists', params: [['ListNode', 'list1'], ['ListNode', 'list2']], returns: 'ListNode',
    tests: [
      { in: [[1, 2, 4], [1, 3, 4]], out: [1, 1, 2, 3, 4, 4] },
      { in: [[], []], out: [] },
      { in: [[], [0]], out: [0] },
      { in: [[5], [1, 2, 4]] },
      { in: [[-3, 7, 9], [-3, -2, 10]] },
    ],
    ref: `class Solution {
    public ListNode mergeTwoLists(ListNode a, ListNode b) {
        ListNode dummy = new ListNode(), t = dummy;
        while (a != null && b != null) {
            if (a.val <= b.val) { t.next = a; a = a.next; } else { t.next = b; b = b.next; }
            t = t.next;
        }
        t.next = a != null ? a : b;
        return dummy.next;
    }
}`,
  },
  {
    slug: 'remove-linked-list-elements', title: 'Remove Linked List Elements', level: 'Easy',
    summary: 'Remove every node whose value equals val and return the new head.',
    method: 'removeElements', params: [['ListNode', 'head'], ['int', 'val']], returns: 'ListNode',
    tests: [
      { in: [[1, 2, 6, 3, 4, 5, 6], 6], out: [1, 2, 3, 4, 5] },
      { in: [[], 1], out: [] },
      { in: [[7, 7, 7, 7], 7], out: [] },
      { in: [[1, 2, 2, 1], 2] },
      { in: [[1], 2] },
    ],
    ref: `class Solution {
    public ListNode removeElements(ListNode head, int val) {
        ListNode dummy = new ListNode(0, head), t = dummy;
        while (t.next != null) { if (t.next.val == val) t.next = t.next.next; else t = t.next; }
        return dummy.next;
    }
}`,
  },
  {
    slug: 'add-two-numbers', title: 'Add Two Numbers', level: 'Medium',
    summary: 'Two non-negative numbers are stored as linked lists of digits in reverse order (ones digit first). Return their sum in the same form.',
    method: 'addTwoNumbers', params: [['ListNode', 'l1'], ['ListNode', 'l2']], returns: 'ListNode',
    tests: [
      { in: [[2, 4, 3], [5, 6, 4]], out: [7, 0, 8] },
      { in: [[0], [0]], out: [0] },
      { in: [[9, 9, 9, 9, 9, 9, 9], [9, 9, 9, 9]], out: [8, 9, 9, 9, 0, 0, 0, 1] },
      { in: [[5], [5]] },
      { in: [[1, 8], [0]] },
    ],
    ref: `class Solution {
    public ListNode addTwoNumbers(ListNode a, ListNode b) {
        ListNode dummy = new ListNode(), t = dummy;
        int carry = 0;
        while (a != null || b != null || carry != 0) {
            int sum = carry + (a != null ? a.val : 0) + (b != null ? b.val : 0);
            t.next = new ListNode(sum % 10); t = t.next; carry = sum / 10;
            if (a != null) a = a.next;
            if (b != null) b = b.next;
        }
        return dummy.next;
    }
}`,
  },
  {
    slug: 'reverse-linked-list-ii', title: 'Reverse Linked List II', level: 'Medium',
    summary: 'Reverse the nodes from position left to position right (1-indexed, inclusive) in one pass and return the head.',
    method: 'reverseBetween', params: [['ListNode', 'head'], ['int', 'left'], ['int', 'right']], returns: 'ListNode',
    tests: [
      { in: [[1, 2, 3, 4, 5], 2, 4], out: [1, 4, 3, 2, 5] },
      { in: [[5], 1, 1], out: [5] },
      { in: [[3, 5], 1, 2] },
      { in: [[1, 2, 3, 4, 5], 1, 5] },
      { in: [[1, 2, 3], 3, 3] },
    ],
    ref: `class Solution {
    public ListNode reverseBetween(ListNode head, int left, int right) {
        ListNode dummy = new ListNode(0, head), before = dummy;
        for (int i = 1; i < left; i++) before = before.next;
        ListNode cur = before.next;
        for (int i = 0; i < right - left; i++) {
            ListNode move = cur.next;
            cur.next = move.next; move.next = before.next; before.next = move;
        }
        return dummy.next;
    }
}`,
  },
  {
    slug: 'swap-nodes-in-pairs', title: 'Swap Nodes in Pairs', level: 'Medium',
    summary: 'Swap every two adjacent nodes (by relinking nodes, not by changing values) and return the head.',
    method: 'swapPairs', params: [['ListNode', 'head']], returns: 'ListNode',
    tests: [
      { in: [[1, 2, 3, 4]], out: [2, 1, 4, 3] },
      { in: [[]], out: [] },
      { in: [[1]], out: [1] },
      { in: [[1, 2, 3]], out: [2, 1, 3] },
      { in: [[6, 5, 4, 3, 2, 1]] },
    ],
    ref: `class Solution {
    public ListNode swapPairs(ListNode head) {
        ListNode dummy = new ListNode(0, head), t = dummy;
        while (t.next != null && t.next.next != null) {
            ListNode a = t.next, b = a.next;
            a.next = b.next; b.next = a; t.next = b; t = a;
        }
        return dummy.next;
    }
}`,
  },
  {
    slug: 'partition-list', title: 'Partition List', level: 'Medium',
    summary: 'Move every node with value less than x before the nodes with value ≥ x, keeping the original relative order within each part.',
    method: 'partition', params: [['ListNode', 'head'], ['int', 'x']], returns: 'ListNode',
    tests: [
      { in: [[1, 4, 3, 2, 5, 2], 3], out: [1, 2, 2, 4, 3, 5] },
      { in: [[2, 1], 2], out: [1, 2] },
      { in: [[], 0] },
      { in: [[5, 4, 3], 1] },
      { in: [[1, 2, 3], 4] },
    ],
    ref: `class Solution {
    public ListNode partition(ListNode head, int x) {
        ListNode lessHead = new ListNode(), moreHead = new ListNode(), less = lessHead, more = moreHead;
        for (ListNode n = head; n != null; n = n.next) {
            if (n.val < x) { less.next = n; less = n; } else { more.next = n; more = n; }
        }
        more.next = null; less.next = moreHead.next;
        return lessHead.next;
    }
}`,
  },
  {
    slug: 'rotate-list', title: 'Rotate List', level: 'Medium',
    summary: 'Rotate the list to the right by k places (k may exceed the length) and return the new head.',
    method: 'rotateRight', params: [['ListNode', 'head'], ['int', 'k']], returns: 'ListNode',
    tests: [
      { in: [[1, 2, 3, 4, 5], 2], out: [4, 5, 1, 2, 3] },
      { in: [[0, 1, 2], 4], out: [2, 0, 1] },
      { in: [[], 3] },
      { in: [[1], 99] },
      { in: [[1, 2], 2] },
    ],
    ref: `class Solution {
    public ListNode rotateRight(ListNode head, int k) {
        if (head == null) return null;
        int n = 1; ListNode tail = head;
        while (tail.next != null) { tail = tail.next; n++; }
        k %= n;
        if (k == 0) return head;
        ListNode newTail = head;
        for (int i = 1; i < n - k; i++) newTail = newTail.next;
        ListNode newHead = newTail.next;
        newTail.next = null; tail.next = head;
        return newHead;
    }
}`,
  },
  {
    slug: 'reverse-nodes-in-k-group', title: 'Reverse Nodes in k-Group', level: 'Hard',
    summary: 'Reverse the nodes k at a time; a final group shorter than k stays as it is. Use O(1) extra memory.',
    method: 'reverseKGroup', params: [['ListNode', 'head'], ['int', 'k']], returns: 'ListNode',
    tests: [
      { in: [[1, 2, 3, 4, 5], 2], out: [2, 1, 4, 3, 5] },
      { in: [[1, 2, 3, 4, 5], 3], out: [3, 2, 1, 4, 5] },
      { in: [[1, 2, 3, 4], 1] },
      { in: [[1, 2, 3, 4], 4] },
      { in: [[1, 2, 3, 4, 5, 6, 7], 3] },
    ],
    ref: `class Solution {
    public ListNode reverseKGroup(ListNode head, int k) {
        ListNode dummy = new ListNode(0, head), groupPrev = dummy;
        while (true) {
            ListNode kth = groupPrev;
            for (int i = 0; i < k && kth != null; i++) kth = kth.next;
            if (kth == null) break;
            ListNode groupNext = kth.next, prev = groupNext, cur = groupPrev.next;
            while (cur != groupNext) { ListNode nx = cur.next; cur.next = prev; prev = cur; cur = nx; }
            ListNode first = groupPrev.next;
            groupPrev.next = kth; groupPrev = first;
        }
        return dummy.next;
    }
}`,
  },
];
