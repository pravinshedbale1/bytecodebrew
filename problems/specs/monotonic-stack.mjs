export default [
  {
    slug: 'next-greater-element-i', title: 'Next Greater Element I', level: 'Easy',
    summary: 'nums1 is a subset of nums2 (distinct values). For each x in nums1, return the first value to the right of x in nums2 that is greater than x, or -1.',
    method: 'nextGreaterElement', params: [['int[]', 'nums1'], ['int[]', 'nums2']], returns: 'int[]',
    tests: [
      { in: [[4, 1, 2], [1, 3, 4, 2]], out: [-1, 3, -1] },
      { in: [[2, 4], [1, 2, 3, 4]], out: [3, -1] },
      { in: [[1], [1]] },
      { in: [[5, 1], [6, 5, 4, 3, 2, 1, 7]] },
    ],
    ref: `class Solution {
    public int[] nextGreaterElement(int[] nums1, int[] nums2) {
        Map<Integer, Integer> next = new HashMap<>();
        Deque<Integer> st = new ArrayDeque<>();
        for (int x : nums2) { while (!st.isEmpty() && st.peek() < x) next.put(st.pop(), x); st.push(x); }
        int[] out = new int[nums1.length];
        for (int i = 0; i < out.length; i++) out[i] = next.getOrDefault(nums1[i], -1);
        return out;
    }
}`,
  },
  {
    slug: 'daily-temperatures', title: 'Daily Temperatures', level: 'Medium',
    summary: 'For each day, return how many days you must wait for a warmer temperature, or 0 if none comes.',
    method: 'dailyTemperatures', params: [['int[]', 'temperatures']], returns: 'int[]',
    tests: [
      { in: [[73, 74, 75, 71, 69, 72, 76, 73]], out: [1, 1, 4, 2, 1, 1, 0, 0] },
      { in: [[30, 40, 50, 60]], out: [1, 1, 1, 0] },
      { in: [[30, 60, 90]], out: [1, 1, 0] },
      { in: [[90, 80, 70]] },
      { in: [[50, 50, 51]] },
    ],
    ref: `class Solution {
    public int[] dailyTemperatures(int[] t) {
        int[] out = new int[t.length];
        Deque<Integer> st = new ArrayDeque<>();
        for (int i = 0; i < t.length; i++) {
            while (!st.isEmpty() && t[st.peek()] < t[i]) { int j = st.pop(); out[j] = i - j; }
            st.push(i);
        }
        return out;
    }
}`,
  },
  {
    slug: 'next-greater-element-ii', title: 'Next Greater Element II', level: 'Medium',
    summary: 'The array is circular. For each element return the next greater value, searching forward and wrapping around, or -1.',
    method: 'nextGreaterElements', params: [['int[]', 'nums']], returns: 'int[]',
    tests: [
      { in: [[1, 2, 1]], out: [2, -1, 2] },
      { in: [[1, 2, 3, 4, 3]], out: [2, 3, 4, -1, 4] },
      { in: [[5]] },
      { in: [[3, 3, 3]] },
      { in: [[5, 4, 3, 2, 1]] },
    ],
    ref: `class Solution {
    public int[] nextGreaterElements(int[] nums) {
        int n = nums.length;
        int[] out = new int[n];
        Arrays.fill(out, -1);
        Deque<Integer> st = new ArrayDeque<>();
        for (int i = 0; i < 2 * n; i++) {
            while (!st.isEmpty() && nums[st.peek()] < nums[i % n]) out[st.pop()] = nums[i % n];
            if (i < n) st.push(i);
        }
        return out;
    }
}`,
  },
  {
    slug: 'online-stock-span', title: 'Online Stock Span', level: 'Medium',
    summary: 'StockSpanner.next(price) returns today\'s span: the number of consecutive days, ending today, with price ≤ today\'s price.',
    design: { cls: 'StockSpanner', ctor: [], methods: [['int', 'next', [['int', 'price']]]] },
    tests: [
      { in: [['StockSpanner', 'next', 'next', 'next', 'next', 'next', 'next', 'next'], [[], [100], [80], [60], [70], [60], [75], [85]]], out: [null, 1, 1, 1, 2, 1, 4, 6] },
      { in: [['StockSpanner', 'next', 'next', 'next'], [[], [5], [5], [5]]] },
      { in: [['StockSpanner', 'next', 'next', 'next', 'next'], [[], [31], [41], [48], [59]]] },
    ],
    ref: `class StockSpanner {
    private final Deque<int[]> st = new ArrayDeque<>();
    public StockSpanner() {}
    public int next(int price) {
        int span = 1;
        while (!st.isEmpty() && st.peek()[0] <= price) span += st.pop()[1];
        st.push(new int[] { price, span });
        return span;
    }
}`,
  },
  {
    slug: 'remove-k-digits', title: 'Remove K Digits', level: 'Medium',
    summary: 'Remove k digits from the number string num to make it as small as possible. Return it without leading zeros ("0" if empty).',
    method: 'removeKdigits', params: [['String', 'num'], ['int', 'k']], returns: 'String',
    tests: [
      { in: ['1432219', 3], out: '1219' },
      { in: ['10200', 1], out: '200' },
      { in: ['10', 2], out: '0' },
      { in: ['112', 1] },
      { in: ['123456', 3] },
      { in: ['9', 1] },
    ],
    ref: `class Solution {
    public String removeKdigits(String num, int k) {
        StringBuilder st = new StringBuilder();
        for (char c : num.toCharArray()) {
            while (k > 0 && st.length() > 0 && st.charAt(st.length() - 1) > c) { st.deleteCharAt(st.length() - 1); k--; }
            st.append(c);
        }
        st.setLength(st.length() - k);
        int i = 0;
        while (i < st.length() - 1 && st.charAt(i) == '0') i++;
        String out = st.substring(i);
        return out.isEmpty() ? "0" : out;
    }
}`,
  },
  {
    slug: 'sum-of-subarray-minimums', title: 'Sum of Subarray Minimums', level: 'Medium',
    summary: 'Return the sum of min(sub) over every contiguous subarray, modulo 10^9 + 7.',
    method: 'sumSubarrayMins', params: [['int[]', 'arr']], returns: 'int',
    tests: [
      { in: [[3, 1, 2, 4]], out: 17 },
      { in: [[11, 81, 94, 43, 3]], out: 444 },
      { in: [[1]] },
      { in: [[2, 2, 2]] },
      { in: [[30000, 29999, 29998, 30000]] },
    ],
    ref: `class Solution {
    public int sumSubarrayMins(int[] arr) {
        int n = arr.length;
        long total = 0, MOD = 1_000_000_007;
        Deque<Integer> st = new ArrayDeque<>();
        for (int i = 0; i <= n; i++) {
            while (!st.isEmpty() && (i == n || arr[st.peek()] >= arr[i])) {
                int mid = st.pop(), left = st.isEmpty() ? -1 : st.peek();
                total = (total + (long) arr[mid] * (mid - left) * (i - mid)) % MOD;
            }
            st.push(i);
        }
        return (int) total;
    }
}`,
  },
  {
    slug: 'sliding-window-maximum', title: 'Sliding Window Maximum', level: 'Hard',
    summary: 'Return the maximum of every window of size k as it slides from left to right, in O(n).',
    method: 'maxSlidingWindow', params: [['int[]', 'nums'], ['int', 'k']], returns: 'int[]',
    tests: [
      { in: [[1, 3, -1, -3, 5, 3, 6, 7], 3], out: [3, 3, 5, 5, 6, 7] },
      { in: [[1], 1], out: [1] },
      { in: [[9, 8, 7, 6], 2] },
      { in: [[1, -1], 1] },
      { in: [[4, 2, 12, 3, 8, 5], 4] },
    ],
    ref: `class Solution {
    public int[] maxSlidingWindow(int[] nums, int k) {
        int[] out = new int[nums.length - k + 1];
        Deque<Integer> dq = new ArrayDeque<>();
        for (int i = 0; i < nums.length; i++) {
            while (!dq.isEmpty() && dq.peekFirst() <= i - k) dq.pollFirst();
            while (!dq.isEmpty() && nums[dq.peekLast()] <= nums[i]) dq.pollLast();
            dq.addLast(i);
            if (i >= k - 1) out[i - k + 1] = nums[dq.peekFirst()];
        }
        return out;
    }
}`,
  },
  {
    slug: 'largest-rectangle-in-histogram', title: 'Largest Rectangle in Histogram', level: 'Hard',
    summary: 'Bars have width 1 and the given heights. Return the area of the largest rectangle that fits inside the histogram.',
    method: 'largestRectangleArea', params: [['int[]', 'heights']], returns: 'int',
    tests: [
      { in: [[2, 1, 5, 6, 2, 3]], out: 10 },
      { in: [[2, 4]], out: 4 },
      { in: [[1]] },
      { in: [[2, 2, 2, 2]] },
      { in: [[6, 2, 5, 4, 5, 1, 6]] },
    ],
    ref: `class Solution {
    public int largestRectangleArea(int[] heights) {
        Deque<Integer> st = new ArrayDeque<>();
        int best = 0, n = heights.length;
        for (int i = 0; i <= n; i++) {
            int h = i == n ? 0 : heights[i];
            while (!st.isEmpty() && heights[st.peek()] >= h) {
                int height = heights[st.pop()], left = st.isEmpty() ? -1 : st.peek();
                best = Math.max(best, height * (i - left - 1));
            }
            st.push(i);
        }
        return best;
    }
}`,
  },
  {
    slug: 'maximal-rectangle', title: 'Maximal Rectangle', level: 'Hard',
    summary: 'In a binary matrix of "0"/"1" characters, return the area of the largest rectangle containing only "1"s.',
    method: 'maximalRectangle', params: [['char[][]', 'matrix']], returns: 'int',
    tests: [
      { in: [[['1', '0', '1', '0', '0'], ['1', '0', '1', '1', '1'], ['1', '1', '1', '1', '1'], ['1', '0', '0', '1', '0']]], out: 6 },
      { in: [[['0']]], out: 0 },
      { in: [[['1']]], out: 1 },
      { in: [[['1', '1'], ['1', '1']]] },
      { in: [[['0', '1'], ['1', '0']]] },
    ],
    ref: `class Solution {
    public int maximalRectangle(char[][] matrix) {
        int c = matrix[0].length, best = 0;
        int[] h = new int[c + 1];
        for (char[] row : matrix) {
            for (int j = 0; j < c; j++) h[j] = row[j] == '1' ? h[j] + 1 : 0;
            Deque<Integer> st = new ArrayDeque<>();
            for (int j = 0; j <= c; j++) {
                while (!st.isEmpty() && h[st.peek()] >= h[j]) {
                    int height = h[st.pop()], left = st.isEmpty() ? -1 : st.peek();
                    best = Math.max(best, height * (j - left - 1));
                }
                st.push(j);
            }
        }
        return best;
    }
}`,
  },
];
