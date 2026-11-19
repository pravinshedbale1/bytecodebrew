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
  {
    slug: 'longest-continuous-subarray-with-absolute-diff-less-than-or-equal-to-limit', title: 'Longest Continuous Subarray With Absolute Diff Less Than or Equal to Limit', level: 'Medium',
    summary: 'Return the length of the longest non-empty subarray in which the absolute difference between any two elements is at most limit.',
    method: 'longestSubarray', params: [['int[]', 'nums'], ['int', 'limit']], returns: 'int',
    tests: [
      { in: [[8, 2, 4, 7], 4], out: 2 },
      { in: [[10, 1, 2, 4, 7, 2], 5], out: 4 },
      { in: [[4, 2, 2, 2, 4, 4, 2, 2], 0], out: 3 },
      { in: [[5], 0] },
      { in: [[1, 1000000000], 999999999] },
      { in: [[1, 5, 6, 7, 8, 10, 6, 5, 6], 4] },
    ],
    ref: `class Solution {
    public int longestSubarray(int[] nums, int limit) {
        Deque<Integer> maxQ = new ArrayDeque<>(), minQ = new ArrayDeque<>();
        int l = 0, best = 0;
        for (int r = 0; r < nums.length; r++) {
            while (!maxQ.isEmpty() && maxQ.peekLast() < nums[r]) maxQ.pollLast();
            maxQ.offerLast(nums[r]);
            while (!minQ.isEmpty() && minQ.peekLast() > nums[r]) minQ.pollLast();
            minQ.offerLast(nums[r]);
            while (maxQ.peekFirst() - minQ.peekFirst() > limit) {
                if (maxQ.peekFirst() == nums[l]) maxQ.pollFirst();
                if (minQ.peekFirst() == nums[l]) minQ.pollFirst();
                l++;
            }
            best = Math.max(best, r - l + 1);
        }
        return best;
    }
}`,
  },
  {
    slug: 'jump-game-vi', title: 'Jump Game VI', level: 'Medium',
    summary: 'Start at index 0; from index i you may jump to any of i + 1 … i + k (inside the array). Your score is the sum of nums over every index you land on, including the first and last. Return the maximum score for reaching the last index.',
    method: 'maxResult', params: [['int[]', 'nums'], ['int', 'k']], returns: 'int',
    tests: [
      { in: [[1, -1, -2, 4, -7, 3], 2], out: 7 },
      { in: [[10, -5, -2, 4, 0, 3], 3], out: 17 },
      { in: [[1, -5, -20, 4, -1, 3, -6, -3], 2], out: 0 },
      { in: [[-7], 1] },
      { in: [[5, -10000, -10000, -10000, 5], 1] },
      { in: [[5, -10000, -10000, -10000, 5], 4] },
    ],
    ref: `class Solution {
    public int maxResult(int[] nums, int k) {
        int n = nums.length;
        int[] dp = new int[n];
        dp[0] = nums[0];
        Deque<Integer> dq = new ArrayDeque<>(List.of(0));
        for (int i = 1; i < n; i++) {
            if (dq.peekFirst() < i - k) dq.pollFirst();
            dp[i] = nums[i] + dp[dq.peekFirst()];
            while (!dq.isEmpty() && dp[dq.peekLast()] <= dp[i]) dq.pollLast();
            dq.offerLast(i);
        }
        return dp[n - 1];
    }
}`,
  },
  {
    slug: 'constrained-subsequence-sum', title: 'Constrained Subsequence Sum', level: 'Hard',
    summary: 'Pick a non-empty subsequence of nums such that any two consecutive picked indices i < j satisfy j − i ≤ k. Return the largest possible sum.',
    method: 'constrainedSubsetSum', params: [['int[]', 'nums'], ['int', 'k']], returns: 'int',
    tests: [
      { in: [[10, 2, -10, 5, 20], 2], out: 37 },
      { in: [[-1, -2, -3], 1], out: -1 },
      { in: [[10, -2, -10, -5, 20], 2], out: 23 },
      { in: [[-5], 1] },
      { in: [[3, -1, -1, -1, 3], 3] },
      { in: [[3, -1, -1, -1, 3], 4] },
    ],
    ref: `class Solution {
    public int constrainedSubsetSum(int[] nums, int k) {
        int n = nums.length, best = Integer.MIN_VALUE;
        int[] dp = new int[n];
        Deque<Integer> dq = new ArrayDeque<>();
        for (int i = 0; i < n; i++) {
            if (!dq.isEmpty() && dq.peekFirst() < i - k) dq.pollFirst();
            dp[i] = nums[i] + Math.max(0, dq.isEmpty() ? 0 : dp[dq.peekFirst()]);
            while (!dq.isEmpty() && dp[dq.peekLast()] <= dp[i]) dq.pollLast();
            dq.offerLast(i);
            best = Math.max(best, dp[i]);
        }
        return best;
    }
}`,
  },
  {
    slug: 'shortest-subarray-with-sum-at-least-k', title: 'Shortest Subarray with Sum at Least K', level: 'Hard',
    summary: 'Return the length of the shortest non-empty subarray of nums (which may contain negatives) whose sum is at least k, or −1 if there is none.',
    method: 'shortestSubarray', params: [['int[]', 'nums'], ['int', 'k']], returns: 'int',
    tests: [
      { in: [[1], 1], out: 1 },
      { in: [[1, 2], 4], out: -1 },
      { in: [[2, -1, 2], 3], out: 3 },
      { in: [[84, -37, 32, 40, 95], 167] },
      { in: [[-100000, -100000], 1] },
      { in: [[17, 85, 93, -45, -21], 150] },
    ],
    ref: `class Solution {
    public int shortestSubarray(int[] nums, int k) {
        int n = nums.length, best = n + 1;
        long[] p = new long[n + 1];
        for (int i = 0; i < n; i++) p[i + 1] = p[i] + nums[i];
        Deque<Integer> dq = new ArrayDeque<>();
        for (int j = 0; j <= n; j++) {
            while (!dq.isEmpty() && p[j] - p[dq.peekFirst()] >= k) best = Math.min(best, j - dq.pollFirst());
            while (!dq.isEmpty() && p[dq.peekLast()] >= p[j]) dq.pollLast();
            dq.offerLast(j);
        }
        return best <= n ? best : -1;
    }
}`,
  },
];
