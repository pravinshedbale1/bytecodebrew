export default [
  {
    slug: 'house-robber', title: 'House Robber', level: 'Medium',
    summary: 'You can\'t rob two adjacent houses. Return the most money you can rob.',
    method: 'rob', params: [['int[]', 'nums']], returns: 'int',
    tests: [
      { in: [[1, 2, 3, 1]], out: 4 },
      { in: [[2, 7, 9, 3, 1]], out: 12 },
      { in: [[5]] },
      { in: [[2, 1, 1, 2]] },
      { in: [[0, 0, 0]] },
    ],
    ref: `class Solution {
    public int rob(int[] nums) { int take = 0, skip = 0; for (int x : nums) { int t = skip + x; skip = Math.max(skip, take); take = t; } return Math.max(take, skip); }
}`,
  },
  {
    slug: 'house-robber-ii', title: 'House Robber II', level: 'Medium',
    summary: 'The houses form a circle, so the first and last are adjacent. You can\'t rob two adjacent houses. Return the most money you can rob.',
    method: 'rob', params: [['int[]', 'nums']], returns: 'int',
    tests: [
      { in: [[2, 3, 2]], out: 3 },
      { in: [[1, 2, 3, 1]], out: 4 },
      { in: [[1, 2, 3]], out: 3 },
      { in: [[7]] },
      { in: [[200, 3, 140, 20, 10]] },
    ],
    ref: `class Solution {
    public int rob(int[] nums) {
        if (nums.length == 1) return nums[0];
        return Math.max(line(nums, 0, nums.length - 2), line(nums, 1, nums.length - 1));
    }
    private int line(int[] a, int lo, int hi) { int take = 0, skip = 0; for (int i = lo; i <= hi; i++) { int t = skip + a[i]; skip = Math.max(skip, take); take = t; } return Math.max(take, skip); }
}`,
  },
  {
    slug: 'maximum-subarray', title: 'Maximum Subarray', level: 'Medium',
    summary: 'Return the largest sum of any non-empty contiguous subarray.',
    method: 'maxSubArray', params: [['int[]', 'nums']], returns: 'int',
    tests: [
      { in: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], out: 6 },
      { in: [[1]], out: 1 },
      { in: [[5, 4, -1, 7, 8]], out: 23 },
      { in: [[-3, -1, -2]] },
      { in: [[-1, 0, -2]] },
    ],
    ref: `class Solution {
    public int maxSubArray(int[] nums) { int best = nums[0], cur = 0; for (int x : nums) { cur = Math.max(x, cur + x); best = Math.max(best, cur); } return best; }
}`,
  },
  {
    slug: 'maximum-product-subarray', title: 'Maximum Product Subarray', level: 'Medium',
    summary: 'Return the largest product of any non-empty contiguous subarray.',
    method: 'maxProduct', params: [['int[]', 'nums']], returns: 'int',
    tests: [
      { in: [[2, 3, -2, 4]], out: 6 },
      { in: [[-2, 0, -1]], out: 0 },
      { in: [[-2]] },
      { in: [[-2, 3, -4]] },
      { in: [[0, 2, -3, -2, 0, 5, -1]] },
    ],
    ref: `class Solution {
    public int maxProduct(int[] nums) {
        int hi = nums[0], lo = nums[0], best = nums[0];
        for (int i = 1; i < nums.length; i++) {
            int x = nums[i], a = hi * x, b = lo * x;
            hi = Math.max(x, Math.max(a, b)); lo = Math.min(x, Math.min(a, b));
            best = Math.max(best, hi);
        }
        return best;
    }
}`,
  },
  {
    slug: 'decode-ways', title: 'Decode Ways', level: 'Medium',
    summary: 'Letters map to "1".."26". Return how many ways the digit string can be decoded ("06" is not a valid code).',
    method: 'numDecodings', params: [['String', 's']], returns: 'int',
    tests: [
      { in: ['12'], out: 2 },
      { in: ['226'], out: 3 },
      { in: ['06'], out: 0 },
      { in: ['10'] },
      { in: ['11106'] },
      { in: ['2101'] },
    ],
    ref: `class Solution {
    public int numDecodings(String s) {
        int prev2 = 1, prev = s.charAt(0) == '0' ? 0 : 1;
        for (int i = 2; i <= s.length(); i++) {
            int cur = 0, one = s.charAt(i - 1) - '0', two = Integer.parseInt(s.substring(i - 2, i));
            if (one != 0) cur += prev;
            if (two >= 10 && two <= 26) cur += prev2;
            prev2 = prev; prev = cur;
        }
        return prev;
    }
}`,
  },
  {
    slug: 'word-break', title: 'Word Break', level: 'Medium',
    summary: 'Return whether s can be split into a sequence of dictionary words (words may be reused).',
    method: 'wordBreak', params: [['String', 's'], ['List<String>', 'wordDict']], returns: 'boolean',
    tests: [
      { in: ['leetcode', ['leet', 'code']], out: true },
      { in: ['applepenapple', ['apple', 'pen']], out: true },
      { in: ['catsandog', ['cats', 'dog', 'sand', 'and', 'cat']], out: false },
      { in: ['a', ['b']] },
      { in: ['aaaaaaa', ['aaaa', 'aaa']] },
    ],
    ref: `class Solution {
    public boolean wordBreak(String s, List<String> wordDict) {
        Set<String> words = new HashSet<>(wordDict);
        boolean[] ok = new boolean[s.length() + 1];
        ok[0] = true;
        for (int i = 1; i <= s.length(); i++) for (int j = 0; j < i && !ok[i]; j++) if (ok[j] && words.contains(s.substring(j, i))) ok[i] = true;
        return ok[s.length()];
    }
}`,
  },
  {
    slug: 'longest-increasing-subsequence', title: 'Longest Increasing Subsequence', level: 'Medium',
    summary: 'Return the length of the longest strictly increasing subsequence — O(n log n) if you can.',
    method: 'lengthOfLIS', params: [['int[]', 'nums']], returns: 'int',
    tests: [
      { in: [[10, 9, 2, 5, 3, 7, 101, 18]], out: 4 },
      { in: [[0, 1, 0, 3, 2, 3]], out: 4 },
      { in: [[7, 7, 7, 7, 7, 7, 7]], out: 1 },
      { in: [[1]] },
      { in: [[4, 10, 4, 3, 8, 9]] },
    ],
    ref: `class Solution {
    public int lengthOfLIS(int[] nums) {
        int[] tails = new int[nums.length];
        int size = 0;
        for (int x : nums) {
            int lo = 0, hi = size;
            while (lo < hi) { int m = (lo + hi) >>> 1; if (tails[m] >= x) hi = m; else lo = m + 1; }
            tails[lo] = x;
            if (lo == size) size++;
        }
        return size;
    }
}`,
  },
  {
    slug: 'number-of-longest-increasing-subsequence', title: 'Number of Longest Increasing Subsequence', level: 'Medium',
    summary: 'Return how many longest strictly increasing subsequences there are.',
    method: 'findNumberOfLIS', params: [['int[]', 'nums']], returns: 'int',
    tests: [
      { in: [[1, 3, 5, 4, 7]], out: 2 },
      { in: [[2, 2, 2, 2, 2]], out: 5 },
      { in: [[1]] },
      { in: [[1, 2, 4, 3, 5, 4, 7, 2]] },
    ],
    ref: `class Solution {
    public int findNumberOfLIS(int[] nums) {
        int n = nums.length, best = 0, total = 0;
        int[] len = new int[n], cnt = new int[n];
        for (int i = 0; i < n; i++) {
            len[i] = 1; cnt[i] = 1;
            for (int j = 0; j < i; j++) if (nums[j] < nums[i]) {
                if (len[j] + 1 > len[i]) { len[i] = len[j] + 1; cnt[i] = cnt[j]; }
                else if (len[j] + 1 == len[i]) cnt[i] += cnt[j];
            }
            if (len[i] > best) { best = len[i]; total = cnt[i]; } else if (len[i] == best) total += cnt[i];
        }
        return total;
    }
}`,
  },
  {
    slug: 'best-time-to-buy-and-sell-stock-with-cooldown', title: 'Best Time to Buy and Sell Stock with Cooldown', level: 'Medium',
    summary: 'Trade as often as you like (one share at a time), but after selling you must skip the next day. Return the maximum profit.',
    method: 'maxProfit', params: [['int[]', 'prices']], returns: 'int',
    tests: [
      { in: [[1, 2, 3, 0, 2]], out: 3 },
      { in: [[1]], out: 0 },
      { in: [[6, 1, 3, 2, 4, 7]] },
      { in: [[1, 2, 4]] },
    ],
    ref: `class Solution {
    public int maxProfit(int[] prices) {
        int hold = Integer.MIN_VALUE / 2, sold = 0, rest = 0;
        for (int p : prices) { int h = Math.max(hold, rest - p), s = hold + p, r = Math.max(rest, sold); hold = h; sold = s; rest = r; }
        return Math.max(sold, rest);
    }
}`,
  },
  {
    slug: 'russian-doll-envelopes', title: 'Russian Doll Envelopes', level: 'Hard',
    summary: 'An envelope fits into another only if both its width and height are strictly smaller. Return the most envelopes you can nest.',
    method: 'maxEnvelopes', params: [['int[][]', 'envelopes']], returns: 'int',
    tests: [
      { in: [[[5, 4], [6, 4], [6, 7], [2, 3]]], out: 3 },
      { in: [[[1, 1], [1, 1], [1, 1]]], out: 1 },
      { in: [[[4, 5], [4, 6], [6, 7], [2, 3], [1, 1]]] },
      { in: [[[1, 3], [3, 5], [6, 7], [6, 8], [8, 4], [9, 5]]] },
    ],
    ref: `class Solution {
    public int maxEnvelopes(int[][] env) {
        Arrays.sort(env, (a, b) -> a[0] != b[0] ? Integer.compare(a[0], b[0]) : Integer.compare(b[1], a[1]));
        int[] tails = new int[env.length];
        int size = 0;
        for (int[] e : env) {
            int lo = 0, hi = size;
            while (lo < hi) { int m = (lo + hi) >>> 1; if (tails[m] >= e[1]) hi = m; else lo = m + 1; }
            tails[lo] = e[1];
            if (lo == size) size++;
        }
        return size;
    }
}`,
  },
  {
    slug: 'integer-break', title: 'Integer Break', level: 'Medium',
    summary: 'Split n into the sum of at least two positive integers and return the largest possible product of those integers.',
    method: 'integerBreak', params: [['int', 'n']], returns: 'int',
    tests: [
      { in: [2], out: 1 },
      { in: [10], out: 36 },
      { in: [3] },
      { in: [4] },
      { in: [8] },
      { in: [27] },
      { in: [58] },
    ],
    ref: `class Solution {
    public int integerBreak(int n) {
        if (n <= 3) return n - 1;
        int product = 1;
        while (n > 4) { product *= 3; n -= 3; }
        return product * n;
    }
}`,
  },
  {
    slug: 'maximum-sum-circular-subarray', title: 'Maximum Sum Circular Subarray', level: 'Medium',
    summary: 'nums is circular: the end wraps around to the start. Return the largest sum of a non-empty subarray, where a subarray may wrap around but uses each element at most once.',
    method: 'maxSubarraySumCircular', params: [['int[]', 'nums']], returns: 'int',
    tests: [
      { in: [[1, -2, 3, -2]], out: 3 },
      { in: [[5, -3, 5]], out: 10 },
      { in: [[-3, -2, -3]], out: -2 },
      { in: [[7]] },
      { in: [[3, -1, 2, -1]] },
      { in: [[-2, 4, -5, 4, -5, 9, 4]] },
      { in: [[30000, -30000, 30000]] },
    ],
    ref: `class Solution {
    public int maxSubarraySumCircular(int[] nums) {
        int total = 0, curMax = 0, best = Integer.MIN_VALUE, curMin = 0, worst = Integer.MAX_VALUE;
        for (int x : nums) {
            total += x;
            curMax = Math.max(curMax + x, x); best = Math.max(best, curMax);
            curMin = Math.min(curMin + x, x); worst = Math.min(worst, curMin);
        }
        return best < 0 ? best : Math.max(best, total - worst);
    }
}`,
  },
  {
    slug: 'longest-turbulent-subarray', title: 'Longest Turbulent Subarray', level: 'Medium',
    summary: 'A subarray is turbulent if the comparison sign flips between each pair of neighbours (up, down, up, … or down, up, down, …). Return the length of the longest turbulent subarray.',
    method: 'maxTurbulenceSize', params: [['int[]', 'arr']], returns: 'int',
    tests: [
      { in: [[9, 4, 2, 10, 7, 8, 8, 1, 9]], out: 5 },
      { in: [[4, 8, 12, 16]], out: 2 },
      { in: [[100]], out: 1 },
      { in: [[5, 5, 5]] },
      { in: [[1, 2, 1, 2, 1, 2]] },
      { in: [[0, 1, 1, 0, 1, 0, 1, 1, 0, 0]] },
      { in: [[2, 1]] },
    ],
    ref: `class Solution {
    public int maxTurbulenceSize(int[] arr) {
        int best = 1, up = 1, down = 1;
        for (int i = 1; i < arr.length; i++) {
            if (arr[i] > arr[i - 1]) { up = down + 1; down = 1; }
            else if (arr[i] < arr[i - 1]) { down = up + 1; up = 1; }
            else { up = 1; down = 1; }
            best = Math.max(best, Math.max(up, down));
        }
        return best;
    }
}`,
  },
  {
    slug: 'stone-game-iii', title: 'Stone Game III', level: 'Hard',
    summary: 'Stones are in a row with values (possibly negative). Alice and Bob alternate, Alice first; each turn takes 1, 2 or 3 stones from the front. Both play optimally to maximise their own total. Return "Alice", "Bob" or "Tie".',
    method: 'stoneGameIII', params: [['int[]', 'stoneValue']], returns: 'String',
    tests: [
      { in: [[1, 2, 3, 7]], out: 'Bob' },
      { in: [[1, 2, 3, -9]], out: 'Alice' },
      { in: [[1, 2, 3, 6]], out: 'Tie' },
      { in: [[-1]] },
      { in: [[0]] },
      { in: [[-1, -2, -3]] },
      { in: [[5, -10, 20, -1, 3, 4, -6, 2]] },
    ],
    ref: `class Solution {
    public String stoneGameIII(int[] stoneValue) {
        int n = stoneValue.length;
        int[] dp = new int[n + 4];
        for (int i = n - 1; i >= 0; i--) {
            int take = 0;
            dp[i] = Integer.MIN_VALUE;
            for (int k = 0; k < 3 && i + k < n; k++) {
                take += stoneValue[i + k];
                dp[i] = Math.max(dp[i], take - dp[i + k + 1]);
            }
        }
        return dp[0] > 0 ? "Alice" : dp[0] < 0 ? "Bob" : "Tie";
    }
}`,
  },
];
