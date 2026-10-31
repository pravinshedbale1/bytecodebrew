export default [
  {
    slug: 'sort-list', title: 'Sort List', level: 'Medium',
    summary: 'Sort a singly linked list in ascending order and return its head. Aim for O(n log n) time.',
    method: 'sortList', params: [['ListNode', 'head']], returns: 'ListNode',
    tests: [
      { in: [[4, 2, 1, 3]], out: [1, 2, 3, 4] },
      { in: [[-1, 5, 3, 4, 0]], out: [-1, 0, 3, 4, 5] },
      { in: [[]], out: [] },
      { in: [[1]] },
      { in: [[2, 1]] },
      { in: [[3, 3, 1, 1, 2, 2]] },
      { in: [[5, 4, 3, 2, 1]] },
    ],
    ref: `class Solution {
    public ListNode sortList(ListNode head) {
        if (head == null || head.next == null) return head;
        ListNode slow = head, fast = head.next;            // split: slow stops at the end of the first half
        while (fast != null && fast.next != null) { slow = slow.next; fast = fast.next.next; }
        ListNode second = slow.next;
        slow.next = null;
        return merge(sortList(head), sortList(second));
    }
    private ListNode merge(ListNode a, ListNode b) {
        ListNode dummy = new ListNode(0), tail = dummy;
        while (a != null && b != null) {
            if (a.val <= b.val) { tail.next = a; a = a.next; } else { tail.next = b; b = b.next; }
            tail = tail.next;
        }
        tail.next = a != null ? a : b;
        return dummy.next;
    }
}`,
  },
  {
    slug: 'different-ways-to-add-parentheses', title: 'Different Ways to Add Parentheses', level: 'Medium',
    summary: 'expression contains non-negative integers and the operators +, - and *. Return the results of every way of fully parenthesising it, in any order (with repeats).',
    method: 'diffWaysToCompute', params: [['String', 'expression']], returns: 'List<Integer>', check: 'any-order',
    tests: [
      { in: ['2-1-1'], out: [0, 2] },
      { in: ['2*3-4*5'], out: [-34, -14, -10, -10, 10] },
      { in: ['7'] },
      { in: ['11'] },
      { in: ['1+2'] },
      { in: ['99*99'] },
      { in: ['0-1+2*3'] },
    ],
    ref: `class Solution {
    private final Map<String, List<Integer>> memo = new HashMap<>();
    public List<Integer> diffWaysToCompute(String expression) {
        List<Integer> cached = memo.get(expression);
        if (cached != null) return cached;
        List<Integer> res = new ArrayList<>();
        for (int i = 0; i < expression.length(); i++) {
            char c = expression.charAt(i);
            if (c != '+' && c != '-' && c != '*') continue;
            for (int a : diffWaysToCompute(expression.substring(0, i)))
                for (int b : diffWaysToCompute(expression.substring(i + 1)))
                    res.add(c == '+' ? a + b : c == '-' ? a - b : a * b);
        }
        if (res.isEmpty()) res.add(Integer.parseInt(expression));   // a plain number
        memo.put(expression, res);
        return res;
    }
}`,
  },
  {
    slug: 'longest-substring-with-at-least-k-repeating-characters', title: 'Longest Substring with At Least K Repeating Characters', level: 'Medium',
    summary: 'Return the length of the longest substring of s in which every character that appears, appears at least k times.',
    method: 'longestSubstring', params: [['String', 's'], ['int', 'k']], returns: 'int',
    tests: [
      { in: ['aaabb', 3], out: 3 },
      { in: ['ababbc', 2], out: 5 },
      { in: ['a', 1] },
      { in: ['a', 2] },
      { in: ['abcde', 1] },
      { in: ['aaabbbcdddeee', 3] },
      { in: ['bbaaacbd', 3] },
    ],
    ref: `class Solution {
    public int longestSubstring(String s, int k) {
        return solve(s.toCharArray(), 0, s.length(), k);
    }
    private int solve(char[] s, int lo, int hi, int k) {
        if (hi - lo < k) return 0;
        int[] count = new int[26];
        for (int i = lo; i < hi; i++) count[s[i] - 'a']++;
        for (int i = lo; i < hi; i++) {
            if (count[s[i] - 'a'] >= k) continue;
            // s[i] can't be in any valid substring: split around every such character
            int best = 0, start = lo;
            for (int j = lo; j <= hi; j++) {
                if (j == hi || count[s[j] - 'a'] < k) {
                    best = Math.max(best, solve(s, start, j, k));
                    start = j + 1;
                }
            }
            return best;
        }
        return hi - lo;                                     // every character appears at least k times
    }
}`,
  },
];
