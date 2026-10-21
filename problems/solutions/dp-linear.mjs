const r = String.raw;

export default {
  'house-robber': {
    pattern: '1-D DP: best(i) = max(skip house i, rob it + best(i − 2))',
    approaches: [
      {
        level: 'Brute force', name: 'Recursion: rob or skip each house',
        idea: 'For house `i`, either skip it (best of the houses before) or rob it (its money plus the best two houses back). Recurse on both choices.',
        steps: [
          '`best(i)` = most money from houses `0..i`; `best(−1) = best(−2) = 0`.',
          '`best(i) = max(best(i − 1), nums[i] + best(i − 2))`.',
          'Return `best(n − 1)`.',
        ],
        time: 'O(2ⁿ)', space: 'O(n)',
        why: 'Two calls per house with the same subproblems recomputed many times.',
        code: {
          java: r`class Solution {
    public int rob(int[] nums) {
        return best(nums, nums.length - 1);
    }

    private int best(int[] nums, int i) {
        if (i < 0) return 0;
        return Math.max(best(nums, i - 1), nums[i] + best(nums, i - 2));
    }
}`,
          cpp: r`class Solution {
    int best(vector<int>& nums, int i) {
        if (i < 0) return 0;
        return max(best(nums, i - 1), nums[i] + best(nums, i - 2));
    }
public:
    int rob(vector<int>& nums) {
        return best(nums, (int) nums.size() - 1);
    }
};`,
          python: r`class Solution:
    def rob(self, nums: List[int]) -> int:
        def best(i):
            return 0 if i < 0 else max(best(i - 1), nums[i] + best(i - 2))
        return best(len(nums) - 1)`,
          javascript: r`var rob = function(nums) {
    const best = (i) => (i < 0 ? 0 : Math.max(best(i - 1), nums[i] + best(i - 2)));
    return best(nums.length - 1);
};`,
        },
      },
      {
        level: 'Better', name: 'Tabulation',
        idea: 'Compute `dp[i]` (best for the first `i` houses) from left to right; each entry needs only the two before it.',
        steps: [
          '`dp[0] = 0`, `dp[1] = nums[0]`.',
          'For `i` from 2 to n: `dp[i] = max(dp[i − 1], dp[i − 2] + nums[i − 1])`.',
          'Return `dp[n]`.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'One pass with an array of n + 1 values.',
        code: {
          java: r`class Solution {
    public int rob(int[] nums) {
        int n = nums.length;
        int[] dp = new int[n + 1];
        dp[1] = nums[0];
        for (int i = 2; i <= n; i++) dp[i] = Math.max(dp[i - 1], dp[i - 2] + nums[i - 1]);
        return dp[n];
    }
}`,
          cpp: r`class Solution {
public:
    int rob(vector<int>& nums) {
        int n = nums.size();
        vector<int> dp(n + 1, 0);
        dp[1] = nums[0];
        for (int i = 2; i <= n; i++) dp[i] = max(dp[i - 1], dp[i - 2] + nums[i - 1]);
        return dp[n];
    }
};`,
          python: r`class Solution:
    def rob(self, nums: List[int]) -> int:
        n = len(nums)
        dp = [0] * (n + 1)
        dp[1] = nums[0]
        for i in range(2, n + 1):
            dp[i] = max(dp[i - 1], dp[i - 2] + nums[i - 1])
        return dp[n]`,
          javascript: r`var rob = function(nums) {
    const n = nums.length, dp = new Array(n + 1).fill(0);
    dp[1] = nums[0];
    for (let i = 2; i <= n; i++) dp[i] = Math.max(dp[i - 1], dp[i - 2] + nums[i - 1]);
    return dp[n];
};`,
        },
      },
      {
        level: 'Optimal', name: 'Two rolling values',
        idea: 'Keep only `prev2` (best up to two houses back) and `prev1` (best up to the previous house).',
        steps: [
          'Set `prev2 = 0`, `prev1 = 0`.',
          'For each amount `x`: `cur = max(prev1, prev2 + x)`; then `prev2 = prev1`, `prev1 = cur`.',
          'Return `prev1`.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'One pass with two variables.',
        code: {
          java: r`class Solution {
    public int rob(int[] nums) {
        int prev2 = 0, prev1 = 0;
        for (int x : nums) {
            int cur = Math.max(prev1, prev2 + x);
            prev2 = prev1;
            prev1 = cur;
        }
        return prev1;
    }
}`,
          cpp: r`class Solution {
public:
    int rob(vector<int>& nums) {
        int prev2 = 0, prev1 = 0;
        for (int x : nums) {
            int cur = max(prev1, prev2 + x);
            prev2 = prev1;
            prev1 = cur;
        }
        return prev1;
    }
};`,
          python: r`class Solution:
    def rob(self, nums: List[int]) -> int:
        prev2 = prev1 = 0
        for x in nums:
            prev2, prev1 = prev1, max(prev1, prev2 + x)
        return prev1`,
          javascript: r`var rob = function(nums) {
    let prev2 = 0, prev1 = 0;
    for (const x of nums) [prev2, prev1] = [prev1, Math.max(prev1, prev2 + x)];
    return prev1;
};`,
        },
      },
    ],
  },

  'house-robber-ii': {
    pattern: 'Break the circle into two straight lines (without the first house, without the last)',
    approaches: [
      {
        level: 'Brute force', name: 'Recursion remembering whether the first house was robbed',
        idea: 'Go house by house choosing rob or skip, carrying a flag that says whether house 0 was robbed; at the last house, robbing is allowed only if house 0 was not.',
        steps: [
          '`best(i, firstRobbed)`: if `i >= n`, return 0.',
          'Skip: `best(i + 1, firstRobbed)`. Rob (if allowed — not the last house when `firstRobbed`): `nums[i] + best(i + 2, firstRobbed || i == 0)`.',
          'Return the larger; answer `best(0, false)`.',
        ],
        time: 'O(2ⁿ)', space: 'O(n)',
        why: 'Two choices per house without remembering results.',
        code: {
          java: r`class Solution {
    public int rob(int[] nums) {
        return best(nums, 0, false);
    }

    private int best(int[] nums, int i, boolean firstRobbed) {
        int n = nums.length;
        if (i >= n) return 0;
        int skip = best(nums, i + 1, firstRobbed);
        if (i == n - 1 && firstRobbed && n > 1) return skip;
        return Math.max(skip, nums[i] + best(nums, i + 2, firstRobbed || i == 0));
    }
}`,
          cpp: r`class Solution {
    int best(vector<int>& nums, int i, bool firstRobbed) {
        int n = nums.size();
        if (i >= n) return 0;
        int skip = best(nums, i + 1, firstRobbed);
        if (i == n - 1 && firstRobbed && n > 1) return skip;
        return max(skip, nums[i] + best(nums, i + 2, firstRobbed || i == 0));
    }
public:
    int rob(vector<int>& nums) {
        return best(nums, 0, false);
    }
};`,
          python: r`class Solution:
    def rob(self, nums: List[int]) -> int:
        n = len(nums)
        def best(i, first_robbed):
            if i >= n:
                return 0
            skip = best(i + 1, first_robbed)
            if i == n - 1 and first_robbed and n > 1:
                return skip
            return max(skip, nums[i] + best(i + 2, first_robbed or i == 0))
        return best(0, False)`,
          javascript: r`var rob = function(nums) {
    const n = nums.length;
    const best = (i, firstRobbed) => {
        if (i >= n) return 0;
        const skip = best(i + 1, firstRobbed);
        if (i === n - 1 && firstRobbed && n > 1) return skip;
        return Math.max(skip, nums[i] + best(i + 2, firstRobbed || i === 0));
    };
    return best(0, false);
};`,
        },
      },
      {
        level: 'Optimal', name: 'Two passes of House Robber',
        idea: 'The first and last houses cannot both be robbed, so the answer is the better of two straight-line problems: houses `0..n − 2` and houses `1..n − 1`. Each is the ordinary House Robber.',
        steps: [
          'If there is one house, return its money.',
          'Run the two-variable House Robber on `nums[0..n − 2]` and on `nums[1..n − 1]`.',
          'Return the larger result.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'Two linear passes with two variables each. Every valid circular choice avoids house 0 or house n − 1, so it is counted in one of the passes.',
        code: {
          java: r`class Solution {
    public int rob(int[] nums) {
        int n = nums.length;
        if (n == 1) return nums[0];
        return Math.max(line(nums, 0, n - 2), line(nums, 1, n - 1));
    }

    private int line(int[] nums, int lo, int hi) {
        int prev2 = 0, prev1 = 0;
        for (int i = lo; i <= hi; i++) {
            int cur = Math.max(prev1, prev2 + nums[i]);
            prev2 = prev1;
            prev1 = cur;
        }
        return prev1;
    }
}`,
          cpp: r`class Solution {
    int line(vector<int>& nums, int lo, int hi) {
        int prev2 = 0, prev1 = 0;
        for (int i = lo; i <= hi; i++) {
            int cur = max(prev1, prev2 + nums[i]);
            prev2 = prev1;
            prev1 = cur;
        }
        return prev1;
    }
public:
    int rob(vector<int>& nums) {
        int n = nums.size();
        if (n == 1) return nums[0];
        return max(line(nums, 0, n - 2), line(nums, 1, n - 1));
    }
};`,
          python: r`class Solution:
    def rob(self, nums: List[int]) -> int:
        def line(houses):
            prev2 = prev1 = 0
            for x in houses:
                prev2, prev1 = prev1, max(prev1, prev2 + x)
            return prev1
        if len(nums) == 1:
            return nums[0]
        return max(line(nums[:-1]), line(nums[1:]))`,
          javascript: r`var rob = function(nums) {
    const n = nums.length;
    if (n === 1) return nums[0];
    const line = (lo, hi) => {
        let prev2 = 0, prev1 = 0;
        for (let i = lo; i <= hi; i++) [prev2, prev1] = [prev1, Math.max(prev1, prev2 + nums[i])];
        return prev1;
    };
    return Math.max(line(0, n - 2), line(1, n - 1));
};`,
        },
      },
    ],
  },

  'maximum-subarray': {
    pattern: 'Kadane\'s algorithm (best subarray ending here = max(x, previous best + x))',
    approaches: [
      {
        level: 'Brute force', name: 'Every start, extended with a running sum',
        idea: 'Try every start and extend to the right, keeping the running sum and the best seen.',
        steps: [
          'For each `i`, set `sum = 0`.',
          'For each `j >= i`, add `nums[j]` and update the best.',
          'Return the best.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'n(n + 1)/2 subarrays, O(1) each thanks to the running sum.',
        code: {
          java: r`class Solution {
    public int maxSubArray(int[] nums) {
        int best = Integer.MIN_VALUE;
        for (int i = 0; i < nums.length; i++) {
            int sum = 0;
            for (int j = i; j < nums.length; j++) {
                sum += nums[j];
                best = Math.max(best, sum);
            }
        }
        return best;
    }
}`,
          cpp: r`class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int best = INT_MIN, n = nums.size();
        for (int i = 0; i < n; i++) {
            int sum = 0;
            for (int j = i; j < n; j++) {
                sum += nums[j];
                best = max(best, sum);
            }
        }
        return best;
    }
};`,
          python: r`class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        best = -inf
        for i in range(len(nums)):
            s = 0
            for j in range(i, len(nums)):
                s += nums[j]
                best = max(best, s)
        return best`,
          javascript: r`var maxSubArray = function(nums) {
    let best = -Infinity;
    for (let i = 0; i < nums.length; i++) {
        let sum = 0;
        for (let j = i; j < nums.length; j++) {
            sum += nums[j];
            best = Math.max(best, sum);
        }
    }
    return best;
};`,
        },
      },
      {
        level: 'Better', name: 'Divide and conquer',
        idea: 'The best subarray lies entirely in the left half, entirely in the right half, or crosses the middle. The crossing case is the best suffix of the left half plus the best prefix of the right half.',
        steps: [
          '`solve(lo, hi)`: if one element, return it.',
          'Recursively solve both halves.',
          'Compute the best sum ending at `mid` (going left) and the best sum starting at `mid + 1` (going right); add them.',
          'Return the largest of the three.',
        ],
        time: 'O(n log n)', space: 'O(log n)',
        why: 'Each level does O(n) work for the crossing sums and there are log n levels; the recursion depth is log n.',
        code: {
          java: r`class Solution {
    public int maxSubArray(int[] nums) {
        return solve(nums, 0, nums.length - 1);
    }

    private int solve(int[] a, int lo, int hi) {
        if (lo == hi) return a[lo];
        int mid = (lo + hi) >>> 1;
        int leftBest = Integer.MIN_VALUE, rightBest = Integer.MIN_VALUE, sum = 0;
        for (int i = mid; i >= lo; i--) { sum += a[i]; leftBest = Math.max(leftBest, sum); }
        sum = 0;
        for (int i = mid + 1; i <= hi; i++) { sum += a[i]; rightBest = Math.max(rightBest, sum); }
        return Math.max(leftBest + rightBest, Math.max(solve(a, lo, mid), solve(a, mid + 1, hi)));
    }
}`,
          cpp: r`class Solution {
    int solve(vector<int>& a, int lo, int hi) {
        if (lo == hi) return a[lo];
        int mid = (lo + hi) / 2;
        int leftBest = INT_MIN, rightBest = INT_MIN, sum = 0;
        for (int i = mid; i >= lo; i--) { sum += a[i]; leftBest = max(leftBest, sum); }
        sum = 0;
        for (int i = mid + 1; i <= hi; i++) { sum += a[i]; rightBest = max(rightBest, sum); }
        return max(leftBest + rightBest, max(solve(a, lo, mid), solve(a, mid + 1, hi)));
    }
public:
    int maxSubArray(vector<int>& nums) {
        return solve(nums, 0, (int) nums.size() - 1);
    }
};`,
          python: r`class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        def solve(lo, hi):
            if lo == hi:
                return nums[lo]
            mid = (lo + hi) // 2
            left_best = right_best = -inf
            s = 0
            for i in range(mid, lo - 1, -1):
                s += nums[i]
                left_best = max(left_best, s)
            s = 0
            for i in range(mid + 1, hi + 1):
                s += nums[i]
                right_best = max(right_best, s)
            return max(left_best + right_best, solve(lo, mid), solve(mid + 1, hi))
        return solve(0, len(nums) - 1)`,
          javascript: r`var maxSubArray = function(nums) {
    const solve = (lo, hi) => {
        if (lo === hi) return nums[lo];
        const mid = (lo + hi) >> 1;
        let leftBest = -Infinity, rightBest = -Infinity, sum = 0;
        for (let i = mid; i >= lo; i--) { sum += nums[i]; leftBest = Math.max(leftBest, sum); }
        sum = 0;
        for (let i = mid + 1; i <= hi; i++) { sum += nums[i]; rightBest = Math.max(rightBest, sum); }
        return Math.max(leftBest + rightBest, solve(lo, mid), solve(mid + 1, hi));
    };
    return solve(0, nums.length - 1);
};`,
        },
      },
      {
        level: 'Optimal', name: 'Kadane\'s algorithm',
        idea: 'The best subarray ending at `i` either extends the best one ending at `i − 1` or starts fresh at `i` — whichever is larger. A negative running sum only hurts, so drop it.',
        steps: [
          'Set `cur = best = nums[0]`.',
          'For each next value `x`: `cur = max(x, cur + x)`; `best = max(best, cur)`.',
          'Return `best`.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'One pass with two variables. Starting from `nums[0]` (not 0) handles all-negative arrays.',
        code: {
          java: r`class Solution {
    public int maxSubArray(int[] nums) {
        int cur = nums[0], best = nums[0];
        for (int i = 1; i < nums.length; i++) {
            cur = Math.max(nums[i], cur + nums[i]);
            best = Math.max(best, cur);
        }
        return best;
    }
}`,
          cpp: r`class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int cur = nums[0], best = nums[0];
        for (size_t i = 1; i < nums.size(); i++) {
            cur = max(nums[i], cur + nums[i]);
            best = max(best, cur);
        }
        return best;
    }
};`,
          python: r`class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        cur = best = nums[0]
        for x in nums[1:]:
            cur = max(x, cur + x)
            best = max(best, cur)
        return best`,
          javascript: r`var maxSubArray = function(nums) {
    let cur = nums[0], best = nums[0];
    for (let i = 1; i < nums.length; i++) {
        cur = Math.max(nums[i], cur + nums[i]);
        best = Math.max(best, cur);
    }
    return best;
};`,
        },
      },
    ],
  },

  'maximum-product-subarray': {
    pattern: 'Kadane variant tracking both the largest and the smallest product ending here',
    approaches: [
      {
        level: 'Brute force', name: 'Every start, extended with a running product',
        idea: 'For each start, multiply in elements one by one and keep the best product seen.',
        steps: [
          'For each `i`, set `prod = 1`.',
          'For each `j >= i`, multiply by `nums[j]` and update the best.',
          'Return the best.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'n(n + 1)/2 subarrays with O(1) work each.',
        code: {
          java: r`class Solution {
    public int maxProduct(int[] nums) {
        int best = Integer.MIN_VALUE;
        for (int i = 0; i < nums.length; i++) {
            int prod = 1;
            for (int j = i; j < nums.length; j++) {
                prod *= nums[j];
                best = Math.max(best, prod);
            }
        }
        return best;
    }
}`,
          cpp: r`class Solution {
public:
    int maxProduct(vector<int>& nums) {
        int best = INT_MIN, n = nums.size();
        for (int i = 0; i < n; i++) {
            int prod = 1;
            for (int j = i; j < n; j++) {
                prod *= nums[j];
                best = max(best, prod);
            }
        }
        return best;
    }
};`,
          python: r`class Solution:
    def maxProduct(self, nums: List[int]) -> int:
        best = -inf
        for i in range(len(nums)):
            prod = 1
            for j in range(i, len(nums)):
                prod *= nums[j]
                best = max(best, prod)
        return best`,
          javascript: r`var maxProduct = function(nums) {
    let best = -Infinity;
    for (let i = 0; i < nums.length; i++) {
        let prod = 1;
        for (let j = i; j < nums.length; j++) {
            prod *= nums[j];
            best = Math.max(best, prod);
        }
    }
    return best;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Track the maximum and minimum product ending here',
        idea: 'A negative number turns the smallest product into the largest one. So at each position keep both the largest and the smallest product of a subarray ending there; the new values come from `x`, `max·x` and `min·x`.',
        steps: [
          'Set `hi = lo = best = nums[0]`.',
          'For each next `x`: compute `a = hi·x`, `b = lo·x`; `hi = max(x, a, b)`, `lo = min(x, a, b)`.',
          'Update `best` with `hi`; return it.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'One pass with three variables. Taking `x` alone restarts after a zero.',
        code: {
          java: r`class Solution {
    public int maxProduct(int[] nums) {
        int hi = nums[0], lo = nums[0], best = nums[0];
        for (int i = 1; i < nums.length; i++) {
            int x = nums[i], a = hi * x, b = lo * x;
            hi = Math.max(x, Math.max(a, b));
            lo = Math.min(x, Math.min(a, b));
            best = Math.max(best, hi);
        }
        return best;
    }
}`,
          cpp: r`class Solution {
public:
    int maxProduct(vector<int>& nums) {
        int hi = nums[0], lo = nums[0], best = nums[0];
        for (size_t i = 1; i < nums.size(); i++) {
            int x = nums[i], a = hi * x, b = lo * x;
            hi = max({x, a, b});
            lo = min({x, a, b});
            best = max(best, hi);
        }
        return best;
    }
};`,
          python: r`class Solution:
    def maxProduct(self, nums: List[int]) -> int:
        hi = lo = best = nums[0]
        for x in nums[1:]:
            a, b = hi * x, lo * x
            hi, lo = max(x, a, b), min(x, a, b)
            best = max(best, hi)
        return best`,
          javascript: r`var maxProduct = function(nums) {
    let hi = nums[0], lo = nums[0], best = nums[0];
    for (let i = 1; i < nums.length; i++) {
        const x = nums[i], a = hi * x, b = lo * x;
        hi = Math.max(x, a, b);
        lo = Math.min(x, a, b);
        best = Math.max(best, hi);
    }
    return best;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Prefix and suffix products',
        idea: 'Within a stretch without zeros, the best product starts at the left end or ends at the right end (dropping a prefix or suffix up to an odd negative). So scan running products from both ends, restarting after zeros, and take the best value seen.',
        steps: [
          'Keep `left = right = 1` and `best = −∞`.',
          'For `i` from 0 to n − 1: multiply `left` by `nums[i]` and `right` by `nums[n − 1 − i]`; update `best` with both.',
          'If either product becomes 0, reset it to 1 (a zero splits the array) — after recording 0.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'One pass with two products. A max-product subarray never contains a zero unless the answer is 0, and among zero-free stretches it is a prefix or a suffix.',
        code: {
          java: r`class Solution {
    public int maxProduct(int[] nums) {
        int n = nums.length, best = Integer.MIN_VALUE, left = 1, right = 1;
        for (int i = 0; i < n; i++) {
            left *= nums[i];
            right *= nums[n - 1 - i];
            best = Math.max(best, Math.max(left, right));
            if (left == 0) left = 1;
            if (right == 0) right = 1;
        }
        return best;
    }
}`,
          cpp: r`class Solution {
public:
    int maxProduct(vector<int>& nums) {
        int n = nums.size(), best = INT_MIN, left = 1, right = 1;
        for (int i = 0; i < n; i++) {
            left *= nums[i];
            right *= nums[n - 1 - i];
            best = max(best, max(left, right));
            if (left == 0) left = 1;
            if (right == 0) right = 1;
        }
        return best;
    }
};`,
          python: r`class Solution:
    def maxProduct(self, nums: List[int]) -> int:
        n, best, left, right = len(nums), -inf, 1, 1
        for i in range(n):
            left *= nums[i]
            right *= nums[n - 1 - i]
            best = max(best, left, right)
            left = left or 1
            right = right or 1
        return best`,
          javascript: r`var maxProduct = function(nums) {
    const n = nums.length;
    let best = -Infinity, left = 1, right = 1;
    for (let i = 0; i < n; i++) {
        left *= nums[i];
        right *= nums[n - 1 - i];
        best = Math.max(best, left, right);
        if (left === 0) left = 1;
        if (right === 0) right = 1;
    }
    return best;
};`,
        },
      },
    ],
  },

  'decode-ways': {
    pattern: '1-D DP over string positions (take one digit or two digits)',
    approaches: [
      {
        level: 'Brute force', name: 'Recursion over the first one or two digits',
        idea: 'From position `i`, decode one digit (if it is not `0`) or two digits (if they form 10–26), and count the ways for the rest.',
        steps: [
          '`ways(i)`: if `i == n`, return 1 (decoded everything).',
          'If `s[i] == "0"`, return 0 (no code starts with 0).',
          'Return `ways(i + 1)` plus `ways(i + 2)` when `s[i..i + 1]` is between 10 and 26.',
        ],
        time: 'O(2ⁿ)', space: 'O(n)',
        why: 'Up to two branches per position and no memory of results.',
        code: {
          java: r`class Solution {
    public int numDecodings(String s) {
        return ways(s, 0);
    }

    private int ways(String s, int i) {
        if (i == s.length()) return 1;
        if (s.charAt(i) == '0') return 0;
        int total = ways(s, i + 1);
        if (i + 1 < s.length() && Integer.parseInt(s.substring(i, i + 2)) <= 26) total += ways(s, i + 2);
        return total;
    }
}`,
          cpp: r`class Solution {
    int ways(const string& s, size_t i) {
        if (i == s.size()) return 1;
        if (s[i] == '0') return 0;
        int total = ways(s, i + 1);
        if (i + 1 < s.size() && stoi(s.substr(i, 2)) <= 26) total += ways(s, i + 2);
        return total;
    }
public:
    int numDecodings(string s) {
        return ways(s, 0);
    }
};`,
          python: r`class Solution:
    def numDecodings(self, s: str) -> int:
        n = len(s)
        def ways(i):
            if i == n:
                return 1
            if s[i] == "0":
                return 0
            total = ways(i + 1)
            if i + 1 < n and int(s[i:i + 2]) <= 26:
                total += ways(i + 2)
            return total
        return ways(0)`,
          javascript: r`var numDecodings = function(s) {
    const n = s.length;
    const ways = (i) => {
        if (i === n) return 1;
        if (s[i] === '0') return 0;
        let total = ways(i + 1);
        if (i + 1 < n && Number(s.slice(i, i + 2)) <= 26) total += ways(i + 2);
        return total;
    };
    return ways(0);
};`,
        },
      },
      {
        level: 'Better', name: 'Tabulation from the end',
        idea: '`dp[i]` = number of ways to decode `s[i..]`. Fill it from right to left with the same rule.',
        steps: [
          '`dp[n] = 1`.',
          'For `i` from n − 1 down to 0: if `s[i] == "0"`, `dp[i] = 0`; else `dp[i] = dp[i + 1]` plus `dp[i + 2]` if the two-digit number is ≤ 26.',
          'Return `dp[0]`.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'One pass over n positions with an n + 1 table.',
        code: {
          java: r`class Solution {
    public int numDecodings(String s) {
        int n = s.length();
        int[] dp = new int[n + 1];
        dp[n] = 1;
        for (int i = n - 1; i >= 0; i--) {
            if (s.charAt(i) == '0') continue;
            dp[i] = dp[i + 1];
            if (i + 1 < n && (s.charAt(i) - '0') * 10 + (s.charAt(i + 1) - '0') <= 26) dp[i] += dp[i + 2];
        }
        return dp[0];
    }
}`,
          cpp: r`class Solution {
public:
    int numDecodings(string s) {
        int n = s.size();
        vector<int> dp(n + 1, 0);
        dp[n] = 1;
        for (int i = n - 1; i >= 0; i--) {
            if (s[i] == '0') continue;
            dp[i] = dp[i + 1];
            if (i + 1 < n && (s[i] - '0') * 10 + (s[i + 1] - '0') <= 26) dp[i] += dp[i + 2];
        }
        return dp[0];
    }
};`,
          python: r`class Solution:
    def numDecodings(self, s: str) -> int:
        n = len(s)
        dp = [0] * (n + 1)
        dp[n] = 1
        for i in range(n - 1, -1, -1):
            if s[i] == "0":
                continue
            dp[i] = dp[i + 1]
            if i + 1 < n and int(s[i:i + 2]) <= 26:
                dp[i] += dp[i + 2]
        return dp[0]`,
          javascript: r`var numDecodings = function(s) {
    const n = s.length, dp = new Array(n + 1).fill(0);
    dp[n] = 1;
    for (let i = n - 1; i >= 0; i--) {
        if (s[i] === '0') continue;
        dp[i] = dp[i + 1];
        if (i + 1 < n && Number(s.slice(i, i + 2)) <= 26) dp[i] += dp[i + 2];
    }
    return dp[0];
};`,
        },
      },
      {
        level: 'Optimal', name: 'Two rolling values',
        idea: 'Each `dp[i]` uses only `dp[i + 1]` and `dp[i + 2]`, so keep those two numbers.',
        steps: [
          'Set `next1 = 1` (dp[i + 1]) and `next2 = 0` (dp[i + 2]), starting from the end.',
          'For `i` from n − 1 down to 0: `cur = 0` if `s[i] == "0"`, else `next1` plus `next2` when the pair is ≤ 26.',
          'Shift: `next2 = next1`, `next1 = cur`. Return `next1`.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'One pass with two variables.',
        code: {
          java: r`class Solution {
    public int numDecodings(String s) {
        int n = s.length(), next1 = 1, next2 = 0;
        for (int i = n - 1; i >= 0; i--) {
            int cur = 0;
            if (s.charAt(i) != '0') {
                cur = next1;
                if (i + 1 < n && (s.charAt(i) - '0') * 10 + (s.charAt(i + 1) - '0') <= 26) cur += next2;
            }
            next2 = next1;
            next1 = cur;
        }
        return next1;
    }
}`,
          cpp: r`class Solution {
public:
    int numDecodings(string s) {
        int n = s.size(), next1 = 1, next2 = 0;
        for (int i = n - 1; i >= 0; i--) {
            int cur = 0;
            if (s[i] != '0') {
                cur = next1;
                if (i + 1 < n && (s[i] - '0') * 10 + (s[i + 1] - '0') <= 26) cur += next2;
            }
            next2 = next1;
            next1 = cur;
        }
        return next1;
    }
};`,
          python: r`class Solution:
    def numDecodings(self, s: str) -> int:
        n, next1, next2 = len(s), 1, 0
        for i in range(n - 1, -1, -1):
            cur = 0
            if s[i] != "0":
                cur = next1
                if i + 1 < n and int(s[i:i + 2]) <= 26:
                    cur += next2
            next1, next2 = cur, next1
        return next1`,
          javascript: r`var numDecodings = function(s) {
    const n = s.length;
    let next1 = 1, next2 = 0;
    for (let i = n - 1; i >= 0; i--) {
        let cur = 0;
        if (s[i] !== '0') {
            cur = next1;
            if (i + 1 < n && Number(s.slice(i, i + 2)) <= 26) cur += next2;
        }
        next2 = next1;
        next1 = cur;
    }
    return next1;
};`,
        },
      },
    ],
  },

  'word-break': {
    pattern: '1-D DP over prefixes: dp[i] is true if some word ends at i after a breakable prefix',
    approaches: [
      {
        level: 'Brute force', name: 'Recursion trying every first word',
        idea: 'From position `i`, try every dictionary word that matches at `i`; if the rest can be broken, the whole string can.',
        steps: [
          '`can(i)`: if `i == n`, return true.',
          'For each word `w` with `s.startsWith(w, i)`, if `can(i + |w|)`, return true.',
          'Return false.',
        ],
        time: 'O(2ⁿ)', space: 'O(n)',
        why: 'Different word choices reach the same position many times, and each is re-explored (e.g. "aaaa…b" with words "a", "aa").',
        code: {
          java: r`class Solution {
    public boolean wordBreak(String s, List<String> wordDict) {
        return can(s, 0, wordDict);
    }

    private boolean can(String s, int i, List<String> dict) {
        if (i == s.length()) return true;
        for (String w : dict)
            if (s.startsWith(w, i) && can(s, i + w.length(), dict)) return true;
        return false;
    }
}`,
          cpp: r`class Solution {
    bool can(const string& s, size_t i, vector<string>& dict) {
        if (i == s.size()) return true;
        for (auto& w : dict)
            if (s.compare(i, w.size(), w) == 0 && can(s, i + w.size(), dict)) return true;
        return false;
    }
public:
    bool wordBreak(string s, vector<string>& wordDict) {
        return can(s, 0, wordDict);
    }
};`,
          python: r`class Solution:
    def wordBreak(self, s: str, wordDict: List[str]) -> bool:
        def can(i):
            if i == len(s):
                return True
            return any(s.startswith(w, i) and can(i + len(w)) for w in wordDict)
        return can(0)`,
          javascript: r`var wordBreak = function(s, wordDict) {
    const can = (i) => i === s.length || wordDict.some((w) => s.startsWith(w, i) && can(i + w.length));
    return can(0);
};`,
        },
      },
      {
        level: 'Better', name: 'Memoised recursion',
        idea: 'Whether `s[i..]` can be broken depends only on `i`, so remember the answer for each position.',
        steps: [
          '`can(i)`: return a cached answer if there is one.',
          'Try every word matching at `i` as before; cache and return the result.',
        ],
        time: 'O(n·m·L)', space: 'O(n)',
        why: 'n positions, each trying m words with an O(L) match check (L = word length).',
        code: {
          java: r`class Solution {
    private Boolean[] memo;

    public boolean wordBreak(String s, List<String> wordDict) {
        memo = new Boolean[s.length() + 1];
        return can(s, 0, wordDict);
    }

    private boolean can(String s, int i, List<String> dict) {
        if (i == s.length()) return true;
        if (memo[i] != null) return memo[i];
        for (String w : dict)
            if (s.startsWith(w, i) && can(s, i + w.length(), dict)) return memo[i] = true;
        return memo[i] = false;
    }
}`,
          cpp: r`class Solution {
    vector<int> memo; // -1 unknown, 0 false, 1 true
    bool can(const string& s, size_t i, vector<string>& dict) {
        if (i == s.size()) return true;
        if (memo[i] != -1) return memo[i];
        for (auto& w : dict)
            if (s.compare(i, w.size(), w) == 0 && can(s, i + w.size(), dict)) return memo[i] = 1;
        return memo[i] = 0;
    }
public:
    bool wordBreak(string s, vector<string>& wordDict) {
        memo.assign(s.size() + 1, -1);
        return can(s, 0, wordDict);
    }
};`,
          python: r`class Solution:
    def wordBreak(self, s: str, wordDict: List[str]) -> bool:
        @cache
        def can(i):
            if i == len(s):
                return True
            return any(s.startswith(w, i) and can(i + len(w)) for w in wordDict)
        return can(0)`,
          javascript: r`var wordBreak = function(s, wordDict) {
    const memo = new Map();
    const can = (i) => {
        if (i === s.length) return true;
        if (!memo.has(i)) memo.set(i, wordDict.some((w) => s.startsWith(w, i) && can(i + w.length)));
        return memo.get(i);
    };
    return can(0);
};`,
        },
      },
      {
        level: 'Optimal', name: 'Bottom-up DP with a word set and the longest word length',
        idea: '`dp[i]` is true when `s[0..i)` can be broken. It is true if for some length `len` (up to the longest word), `dp[i − len]` is true and `s[i − len..i)` is a dictionary word.',
        steps: [
          'Put the words in a set; let `maxLen` be the longest word.',
          '`dp[0] = true`.',
          'For each `i` from 1 to n, for `len` from 1 to `min(i, maxLen)`: if `dp[i − len]` and the substring is in the set, set `dp[i] = true` and stop.',
          'Return `dp[n]`.',
        ],
        time: 'O(n·L²)', space: 'O(n + m·L)',
        why: 'n positions × up to L lengths, each building and hashing a substring of length up to L (L ≤ 20). Independent of the number of words m, which only affects the set.',
        code: {
          java: r`class Solution {
    public boolean wordBreak(String s, List<String> wordDict) {
        Set<String> words = new HashSet<>(wordDict);
        int maxLen = 0;
        for (String w : wordDict) maxLen = Math.max(maxLen, w.length());
        int n = s.length();
        boolean[] dp = new boolean[n + 1];
        dp[0] = true;
        for (int i = 1; i <= n; i++)
            for (int len = 1; len <= Math.min(i, maxLen) && !dp[i]; len++)
                if (dp[i - len] && words.contains(s.substring(i - len, i))) dp[i] = true;
        return dp[n];
    }
}`,
          cpp: r`class Solution {
public:
    bool wordBreak(string s, vector<string>& wordDict) {
        unordered_set<string> words(wordDict.begin(), wordDict.end());
        size_t maxLen = 0;
        for (auto& w : wordDict) maxLen = max(maxLen, w.size());
        int n = s.size();
        vector<bool> dp(n + 1, false);
        dp[0] = true;
        for (int i = 1; i <= n; i++)
            for (int len = 1; len <= min(i, (int) maxLen) && !dp[i]; len++)
                if (dp[i - len] && words.count(s.substr(i - len, len))) dp[i] = true;
        return dp[n];
    }
};`,
          python: r`class Solution:
    def wordBreak(self, s: str, wordDict: List[str]) -> bool:
        words = set(wordDict)
        max_len = max(map(len, wordDict))
        n = len(s)
        dp = [True] + [False] * n
        for i in range(1, n + 1):
            for length in range(1, min(i, max_len) + 1):
                if dp[i - length] and s[i - length:i] in words:
                    dp[i] = True
                    break
        return dp[n]`,
          javascript: r`var wordBreak = function(s, wordDict) {
    const words = new Set(wordDict), maxLen = Math.max(...wordDict.map((w) => w.length));
    const n = s.length, dp = new Array(n + 1).fill(false);
    dp[0] = true;
    for (let i = 1; i <= n; i++)
        for (let len = 1; len <= Math.min(i, maxLen) && !dp[i]; len++)
            if (dp[i - len] && words.has(s.slice(i - len, i))) dp[i] = true;
    return dp[n];
};`,
        },
      },
    ],
  },

  'longest-increasing-subsequence': {
    pattern: 'O(n²) DP over "LIS ending at i", or patience sorting with binary search (O(n log n))',
    approaches: [
      {
        level: 'Brute force', name: 'Recursion: take or skip each element',
        idea: 'Walk the array keeping the last taken value; each element can be taken (if larger) or skipped. Return the longest result.',
        steps: [
          '`best(i, prev)`: the longest increasing subsequence from index `i` with all values greater than `nums[prev]` (`prev = −1` means no limit).',
          'Skip: `best(i + 1, prev)`. Take (if `prev == −1` or `nums[i] > nums[prev]`): `1 + best(i + 1, i)`.',
          'Return the larger; answer `best(0, −1)`.',
        ],
        time: 'O(2ⁿ)', space: 'O(n)',
        why: 'Every subset of positions can be explored.',
        code: {
          java: r`class Solution {
    public int lengthOfLIS(int[] nums) {
        return best(nums, 0, -1);
    }

    private int best(int[] nums, int i, int prev) {
        if (i == nums.length) return 0;
        int result = best(nums, i + 1, prev);
        if (prev == -1 || nums[i] > nums[prev]) result = Math.max(result, 1 + best(nums, i + 1, i));
        return result;
    }
}`,
          cpp: r`class Solution {
    int best(vector<int>& nums, int i, int prev) {
        if (i == (int) nums.size()) return 0;
        int result = best(nums, i + 1, prev);
        if (prev == -1 || nums[i] > nums[prev]) result = max(result, 1 + best(nums, i + 1, i));
        return result;
    }
public:
    int lengthOfLIS(vector<int>& nums) {
        return best(nums, 0, -1);
    }
};`,
          python: r`class Solution:
    def lengthOfLIS(self, nums: List[int]) -> int:
        def best(i, prev):
            if i == len(nums):
                return 0
            result = best(i + 1, prev)
            if prev == -1 or nums[i] > nums[prev]:
                result = max(result, 1 + best(i + 1, i))
            return result
        return best(0, -1)`,
          javascript: r`var lengthOfLIS = function(nums) {
    const best = (i, prev) => {
        if (i === nums.length) return 0;
        let result = best(i + 1, prev);
        if (prev === -1 || nums[i] > nums[prev]) result = Math.max(result, 1 + best(i + 1, i));
        return result;
    };
    return best(0, -1);
};`,
        },
      },
      {
        level: 'Better', name: 'DP: longest subsequence ending at each index',
        idea: '`dp[i]` = length of the longest increasing subsequence that ends with `nums[i]`. It is 1 plus the best `dp[j]` over earlier `j` with a smaller value.',
        steps: [
          'Set every `dp[i] = 1`.',
          'For each `i`, for each `j < i` with `nums[j] < nums[i]`: `dp[i] = max(dp[i], dp[j] + 1)`.',
          'Return the maximum of `dp`.',
        ],
        time: 'O(n²)', space: 'O(n)',
        why: 'Every pair `j < i` is checked once.',
        code: {
          java: r`class Solution {
    public int lengthOfLIS(int[] nums) {
        int n = nums.length, best = 0;
        int[] dp = new int[n];
        for (int i = 0; i < n; i++) {
            dp[i] = 1;
            for (int j = 0; j < i; j++) if (nums[j] < nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
            best = Math.max(best, dp[i]);
        }
        return best;
    }
}`,
          cpp: r`class Solution {
public:
    int lengthOfLIS(vector<int>& nums) {
        int n = nums.size();
        vector<int> dp(n, 1);
        for (int i = 0; i < n; i++)
            for (int j = 0; j < i; j++) if (nums[j] < nums[i]) dp[i] = max(dp[i], dp[j] + 1);
        return *max_element(dp.begin(), dp.end());
    }
};`,
          python: r`class Solution:
    def lengthOfLIS(self, nums: List[int]) -> int:
        n = len(nums)
        dp = [1] * n
        for i in range(n):
            for j in range(i):
                if nums[j] < nums[i]:
                    dp[i] = max(dp[i], dp[j] + 1)
        return max(dp)`,
          javascript: r`var lengthOfLIS = function(nums) {
    const n = nums.length, dp = new Array(n).fill(1);
    for (let i = 0; i < n; i++)
        for (let j = 0; j < i; j++) if (nums[j] < nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
    return Math.max(...dp);
};`,
        },
      },
      {
        level: 'Optimal', name: 'Patience sorting with binary search',
        idea: 'Keep `tails[k]` = the smallest possible last value of an increasing subsequence of length `k + 1`. `tails` is sorted, so for each value binary search the first tail `>= x` and replace it (or append if `x` is larger than all). The length of `tails` is the answer.',
        steps: [
          'Start with an empty `tails`.',
          'For each `x`: find the first index `p` with `tails[p] >= x` (lower bound).',
          'If `p == tails.length`, append `x`; otherwise set `tails[p] = x`.',
          'Return `tails.length`.',
        ],
        time: 'O(n log n)', space: 'O(n)',
        why: 'One binary search per element. Using "≥" (lower bound) makes the subsequence strictly increasing. Note `tails` is not itself an LIS — only its length is meaningful.',
        code: {
          java: r`class Solution {
    public int lengthOfLIS(int[] nums) {
        int[] tails = new int[nums.length];
        int size = 0;
        for (int x : nums) {
            int lo = 0, hi = size;
            while (lo < hi) {
                int mid = (lo + hi) >>> 1;
                if (tails[mid] < x) lo = mid + 1; else hi = mid;
            }
            tails[lo] = x;
            if (lo == size) size++;
        }
        return size;
    }
}`,
          cpp: r`class Solution {
public:
    int lengthOfLIS(vector<int>& nums) {
        vector<int> tails;
        for (int x : nums) {
            auto it = lower_bound(tails.begin(), tails.end(), x);
            if (it == tails.end()) tails.push_back(x);
            else *it = x;
        }
        return tails.size();
    }
};`,
          python: r`class Solution:
    def lengthOfLIS(self, nums: List[int]) -> int:
        tails = []
        for x in nums:
            p = bisect_left(tails, x)
            if p == len(tails):
                tails.append(x)
            else:
                tails[p] = x
        return len(tails)`,
          javascript: r`var lengthOfLIS = function(nums) {
    const tails = [];
    for (const x of nums) {
        let lo = 0, hi = tails.length;
        while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (tails[mid] < x) lo = mid + 1; else hi = mid;
        }
        tails[lo] = x;
    }
    return tails.length;
};`,
        },
      },
    ],
  },

  'number-of-longest-increasing-subsequence': {
    pattern: 'LIS DP carrying both the length and the count of subsequences ending at each index',
    approaches: [
      {
        level: 'Brute force', name: 'Enumerate every increasing subsequence',
        idea: 'Recursively build every increasing subsequence (each element taken or skipped), tracking the longest length found and how many subsequences have it.',
        steps: [
          '`explore(i, prev, length)`: at the end of the array, record `length` (raise the best and reset the count, or add to the count if equal).',
          'Always try skipping `nums[i]`; take it if it is larger than `nums[prev]`.',
          'Return the count for the best length.',
        ],
        time: 'O(2ⁿ)', space: 'O(n)',
        why: 'Every subset of positions may be visited.',
        code: {
          java: r`class Solution {
    private int bestLen = 0, count = 0;

    public int findNumberOfLIS(int[] nums) {
        explore(nums, 0, -1, 0);
        return count;
    }

    private void explore(int[] nums, int i, int prev, int len) {
        if (i == nums.length) {
            if (len > bestLen) { bestLen = len; count = 1; }
            else if (len == bestLen) count++;
            return;
        }
        explore(nums, i + 1, prev, len);
        if (prev == -1 || nums[i] > nums[prev]) explore(nums, i + 1, i, len + 1);
    }
}`,
          cpp: r`class Solution {
    int bestLen = 0, count = 0;
    void explore(vector<int>& nums, int i, int prev, int len) {
        if (i == (int) nums.size()) {
            if (len > bestLen) { bestLen = len; count = 1; }
            else if (len == bestLen) count++;
            return;
        }
        explore(nums, i + 1, prev, len);
        if (prev == -1 || nums[i] > nums[prev]) explore(nums, i + 1, i, len + 1);
    }
public:
    int findNumberOfLIS(vector<int>& nums) {
        explore(nums, 0, -1, 0);
        return count;
    }
};`,
          python: r`class Solution:
    def findNumberOfLIS(self, nums: List[int]) -> int:
        best = [0, 0]  # [length, count]
        def explore(i, prev, length):
            if i == len(nums):
                if length > best[0]:
                    best[0], best[1] = length, 1
                elif length == best[0]:
                    best[1] += 1
                return
            explore(i + 1, prev, length)
            if prev == -1 or nums[i] > nums[prev]:
                explore(i + 1, i, length + 1)
        explore(0, -1, 0)
        return best[1]`,
          javascript: r`var findNumberOfLIS = function(nums) {
    let bestLen = 0, count = 0;
    const explore = (i, prev, len) => {
        if (i === nums.length) {
            if (len > bestLen) { bestLen = len; count = 1; }
            else if (len === bestLen) count++;
            return;
        }
        explore(i + 1, prev, len);
        if (prev === -1 || nums[i] > nums[prev]) explore(i + 1, i, len + 1);
    };
    explore(0, -1, 0);
    return count;
};`,
        },
      },
      {
        level: 'Optimal', name: 'DP with lengths and counts',
        idea: 'For each `i`, keep `len[i]` (longest increasing subsequence ending at `i`) and `cnt[i]` (how many have that length). An earlier `j` with a smaller value either gives a longer length (take over its count) or the same length (add its count).',
        steps: [
          'Set `len[i] = cnt[i] = 1`.',
          'For each `j < i` with `nums[j] < nums[i]`: if `len[j] + 1 > len[i]`, set `len[i] = len[j] + 1`, `cnt[i] = cnt[j]`; else if equal, `cnt[i] += cnt[j]`.',
          'Let `L` be the maximum length; return the sum of `cnt[i]` over all `i` with `len[i] == L`.',
        ],
        time: 'O(n²)', space: 'O(n)',
        why: 'All pairs `j < i` once; two arrays of size n. (An O(n log n) version exists with a segment tree or Fenwick tree keyed by value.)',
        code: {
          java: r`class Solution {
    public int findNumberOfLIS(int[] nums) {
        int n = nums.length, longest = 0;
        int[] len = new int[n], cnt = new int[n];
        for (int i = 0; i < n; i++) {
            len[i] = cnt[i] = 1;
            for (int j = 0; j < i; j++) {
                if (nums[j] >= nums[i]) continue;
                if (len[j] + 1 > len[i]) { len[i] = len[j] + 1; cnt[i] = cnt[j]; }
                else if (len[j] + 1 == len[i]) cnt[i] += cnt[j];
            }
            longest = Math.max(longest, len[i]);
        }
        int total = 0;
        for (int i = 0; i < n; i++) if (len[i] == longest) total += cnt[i];
        return total;
    }
}`,
          cpp: r`class Solution {
public:
    int findNumberOfLIS(vector<int>& nums) {
        int n = nums.size(), longest = 0;
        vector<int> len(n, 1), cnt(n, 1);
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < i; j++) {
                if (nums[j] >= nums[i]) continue;
                if (len[j] + 1 > len[i]) { len[i] = len[j] + 1; cnt[i] = cnt[j]; }
                else if (len[j] + 1 == len[i]) cnt[i] += cnt[j];
            }
            longest = max(longest, len[i]);
        }
        int total = 0;
        for (int i = 0; i < n; i++) if (len[i] == longest) total += cnt[i];
        return total;
    }
};`,
          python: r`class Solution:
    def findNumberOfLIS(self, nums: List[int]) -> int:
        n = len(nums)
        length, cnt = [1] * n, [1] * n
        for i in range(n):
            for j in range(i):
                if nums[j] < nums[i]:
                    if length[j] + 1 > length[i]:
                        length[i], cnt[i] = length[j] + 1, cnt[j]
                    elif length[j] + 1 == length[i]:
                        cnt[i] += cnt[j]
        longest = max(length)
        return sum(c for l, c in zip(length, cnt) if l == longest)`,
          javascript: r`var findNumberOfLIS = function(nums) {
    const n = nums.length, len = new Array(n).fill(1), cnt = new Array(n).fill(1);
    for (let i = 0; i < n; i++)
        for (let j = 0; j < i; j++) {
            if (nums[j] >= nums[i]) continue;
            if (len[j] + 1 > len[i]) { len[i] = len[j] + 1; cnt[i] = cnt[j]; }
            else if (len[j] + 1 === len[i]) cnt[i] += cnt[j];
        }
    const longest = Math.max(...len);
    let total = 0;
    for (let i = 0; i < n; i++) if (len[i] === longest) total += cnt[i];
    return total;
};`,
        },
      },
    ],
  },

  'best-time-to-buy-and-sell-stock-with-cooldown': {
    pattern: 'State-machine DP: holding, just sold (cooldown), resting',
    approaches: [
      {
        level: 'Brute force', name: 'Recursion over each day\'s choice',
        idea: 'On each day you either do nothing, or buy (if not holding), or sell (if holding — and then you must skip the next day). Try every choice.',
        steps: [
          '`best(day, holding)`: return 0 after the last day.',
          'Rest: `best(day + 1, holding)`.',
          'If holding: also `prices[day] + best(day + 2, false)` (sell, skip a day). Else: also `−prices[day] + best(day + 1, true)` (buy).',
          'Return the maximum; answer `best(0, false)`.',
        ],
        time: 'O(2ⁿ)', space: 'O(n)',
        why: 'Two branches per day without memory.',
        code: {
          java: r`class Solution {
    public int maxProfit(int[] prices) {
        return best(prices, 0, false);
    }

    private int best(int[] p, int day, boolean holding) {
        if (day >= p.length) return 0;
        int rest = best(p, day + 1, holding);
        int act = holding ? p[day] + best(p, day + 2, false) : -p[day] + best(p, day + 1, true);
        return Math.max(rest, act);
    }
}`,
          cpp: r`class Solution {
    int best(vector<int>& p, int day, bool holding) {
        if (day >= (int) p.size()) return 0;
        int rest = best(p, day + 1, holding);
        int act = holding ? p[day] + best(p, day + 2, false) : -p[day] + best(p, day + 1, true);
        return max(rest, act);
    }
public:
    int maxProfit(vector<int>& prices) {
        return best(prices, 0, false);
    }
};`,
          python: r`class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        def best(day, holding):
            if day >= len(prices):
                return 0
            rest = best(day + 1, holding)
            if holding:
                act = prices[day] + best(day + 2, False)
            else:
                act = -prices[day] + best(day + 1, True)
            return max(rest, act)
        return best(0, False)`,
          javascript: r`var maxProfit = function(prices) {
    const best = (day, holding) => {
        if (day >= prices.length) return 0;
        const rest = best(day + 1, holding);
        const act = holding ? prices[day] + best(day + 2, false) : -prices[day] + best(day + 1, true);
        return Math.max(rest, act);
    };
    return best(0, false);
};`,
        },
      },
      {
        level: 'Better', name: 'Memoised recursion over (day, holding)',
        idea: 'The future depends only on the day and whether you hold a share: 2n states. Cache them.',
        steps: [
          'Same recurrence as the brute force.',
          'Store `memo[day][holding]` and reuse it.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: '2n states, O(1) each; the table and recursion are O(n).',
        code: {
          java: r`class Solution {
    private Integer[][] memo;

    public int maxProfit(int[] prices) {
        memo = new Integer[prices.length][2];
        return best(prices, 0, 0);
    }

    private int best(int[] p, int day, int holding) {
        if (day >= p.length) return 0;
        if (memo[day][holding] != null) return memo[day][holding];
        int rest = best(p, day + 1, holding);
        int act = holding == 1 ? p[day] + best(p, day + 2, 0) : -p[day] + best(p, day + 1, 1);
        return memo[day][holding] = Math.max(rest, act);
    }
}`,
          cpp: r`class Solution {
    vector<array<int, 2>> memo;
    int best(vector<int>& p, int day, int holding) {
        if (day >= (int) p.size()) return 0;
        if (memo[day][holding] != INT_MIN) return memo[day][holding];
        int rest = best(p, day + 1, holding);
        int act = holding ? p[day] + best(p, day + 2, 0) : -p[day] + best(p, day + 1, 1);
        return memo[day][holding] = max(rest, act);
    }
public:
    int maxProfit(vector<int>& prices) {
        memo.assign(prices.size(), {INT_MIN, INT_MIN});
        return best(prices, 0, 0);
    }
};`,
          python: r`class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        @cache
        def best(day, holding):
            if day >= len(prices):
                return 0
            rest = best(day + 1, holding)
            act = prices[day] + best(day + 2, False) if holding else -prices[day] + best(day + 1, True)
            return max(rest, act)
        return best(0, False)`,
          javascript: r`var maxProfit = function(prices) {
    const memo = new Map();
    const best = (day, holding) => {
        if (day >= prices.length) return 0;
        const key = day * 2 + holding;
        if (memo.has(key)) return memo.get(key);
        const rest = best(day + 1, holding);
        const act = holding ? prices[day] + best(day + 2, 0) : -prices[day] + best(day + 1, 1);
        memo.set(key, Math.max(rest, act));
        return memo.get(key);
    };
    return best(0, 0);
};`,
        },
      },
      {
        level: 'Optimal', name: 'Three rolling states',
        idea: 'At the end of each day you are in one of three states: holding a share, just sold today (cooldown tomorrow), or resting with no share. Each state\'s best profit depends only on yesterday\'s three values.',
        steps: [
          'Start: `hold = −∞`, `sold = 0`, `rest = 0`.',
          'For each price `p`: `newHold = max(hold, rest − p)` (keep holding, or buy after resting); `newSold = hold + p`; `newRest = max(rest, sold)`.',
          'Update the three values; return `max(sold, rest)`.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'One pass with three variables. Buying only from `rest` (not from `sold`) is what enforces the cooldown.',
        code: {
          java: r`class Solution {
    public int maxProfit(int[] prices) {
        int hold = Integer.MIN_VALUE / 2, sold = 0, rest = 0;
        for (int p : prices) {
            int newHold = Math.max(hold, rest - p), newSold = hold + p, newRest = Math.max(rest, sold);
            hold = newHold;
            sold = newSold;
            rest = newRest;
        }
        return Math.max(sold, rest);
    }
}`,
          cpp: r`class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int hold = INT_MIN / 2, sold = 0, rest = 0;
        for (int p : prices) {
            int newHold = max(hold, rest - p), newSold = hold + p, newRest = max(rest, sold);
            hold = newHold;
            sold = newSold;
            rest = newRest;
        }
        return max(sold, rest);
    }
};`,
          python: r`class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        hold, sold, rest = -inf, 0, 0
        for p in prices:
            hold, sold, rest = max(hold, rest - p), hold + p, max(rest, sold)
        return max(sold, rest)`,
          javascript: r`var maxProfit = function(prices) {
    let hold = -Infinity, sold = 0, rest = 0;
    for (const p of prices) [hold, sold, rest] = [Math.max(hold, rest - p), hold + p, Math.max(rest, sold)];
    return Math.max(sold, rest);
};`,
        },
      },
    ],
  },

  'russian-doll-envelopes': {
    pattern: 'Sort by width ascending and height descending, then LIS on heights',
    approaches: [
      {
        level: 'Better', name: 'Sort, then O(n²) LIS',
        idea: 'Sort envelopes by width; then nesting is an increasing chain in both width and height. `dp[i]` = longest chain ending at envelope `i`, built from every earlier envelope that is strictly smaller in both dimensions.',
        steps: [
          'Sort by width ascending (ties in any order).',
          'For each `i`, `dp[i] = 1 + max(dp[j])` over `j < i` with `w[j] < w[i]` and `h[j] < h[i]`.',
          'Return the largest `dp[i]`.',
        ],
        time: 'O(n²)', space: 'O(n)',
        why: 'All pairs are compared: too slow for n = 10⁵, but simple and correct.',
        code: {
          java: r`class Solution {
    public int maxEnvelopes(int[][] envelopes) {
        Arrays.sort(envelopes, (a, b) -> Integer.compare(a[0], b[0]));
        int n = envelopes.length, best = 0;
        int[] dp = new int[n];
        for (int i = 0; i < n; i++) {
            dp[i] = 1;
            for (int j = 0; j < i; j++)
                if (envelopes[j][0] < envelopes[i][0] && envelopes[j][1] < envelopes[i][1]) dp[i] = Math.max(dp[i], dp[j] + 1);
            best = Math.max(best, dp[i]);
        }
        return best;
    }
}`,
          cpp: r`class Solution {
public:
    int maxEnvelopes(vector<vector<int>>& envelopes) {
        sort(envelopes.begin(), envelopes.end());
        int n = envelopes.size(), best = 0;
        vector<int> dp(n, 1);
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < i; j++)
                if (envelopes[j][0] < envelopes[i][0] && envelopes[j][1] < envelopes[i][1]) dp[i] = max(dp[i], dp[j] + 1);
            best = max(best, dp[i]);
        }
        return best;
    }
};`,
          python: r`class Solution:
    def maxEnvelopes(self, envelopes: List[List[int]]) -> int:
        envelopes.sort()
        n = len(envelopes)
        dp = [1] * n
        for i in range(n):
            for j in range(i):
                if envelopes[j][0] < envelopes[i][0] and envelopes[j][1] < envelopes[i][1]:
                    dp[i] = max(dp[i], dp[j] + 1)
        return max(dp)`,
          javascript: r`var maxEnvelopes = function(envelopes) {
    envelopes.sort((a, b) => a[0] - b[0]);
    const n = envelopes.length, dp = new Array(n).fill(1);
    for (let i = 0; i < n; i++)
        for (let j = 0; j < i; j++)
            if (envelopes[j][0] < envelopes[i][0] && envelopes[j][1] < envelopes[i][1]) dp[i] = Math.max(dp[i], dp[j] + 1);
    return Math.max(...dp);
};`,
        },
      },
      {
        level: 'Optimal', name: 'Sort (width ↑, height ↓) and patience-sort the heights',
        idea: 'After sorting by width ascending, the problem is a strictly increasing subsequence of heights — except that envelopes with the same width must not chain. Sorting equal widths by height descending makes any increasing run of heights pick at most one envelope per width. Then run the O(n log n) LIS on the heights.',
        steps: [
          'Sort by width ascending; for equal widths, by height descending.',
          'Run patience sorting on the heights: for each height, replace the first tail `>=` it (lower bound) or append.',
          'Return the number of tails.',
        ],
        time: 'O(n log n)', space: 'O(n)',
        why: 'The sort and n binary searches are each O(n log n).',
        code: {
          java: r`class Solution {
    public int maxEnvelopes(int[][] envelopes) {
        Arrays.sort(envelopes, (a, b) -> a[0] != b[0] ? Integer.compare(a[0], b[0]) : Integer.compare(b[1], a[1]));
        int[] tails = new int[envelopes.length];
        int size = 0;
        for (int[] e : envelopes) {
            int lo = 0, hi = size;
            while (lo < hi) {
                int mid = (lo + hi) >>> 1;
                if (tails[mid] < e[1]) lo = mid + 1; else hi = mid;
            }
            tails[lo] = e[1];
            if (lo == size) size++;
        }
        return size;
    }
}`,
          cpp: r`class Solution {
public:
    int maxEnvelopes(vector<vector<int>>& envelopes) {
        sort(envelopes.begin(), envelopes.end(), [](auto& a, auto& b) { return a[0] != b[0] ? a[0] < b[0] : a[1] > b[1]; });
        vector<int> tails;
        for (auto& e : envelopes) {
            auto it = lower_bound(tails.begin(), tails.end(), e[1]);
            if (it == tails.end()) tails.push_back(e[1]);
            else *it = e[1];
        }
        return tails.size();
    }
};`,
          python: r`class Solution:
    def maxEnvelopes(self, envelopes: List[List[int]]) -> int:
        envelopes.sort(key=lambda e: (e[0], -e[1]))
        tails = []
        for _, h in envelopes:
            p = bisect_left(tails, h)
            if p == len(tails):
                tails.append(h)
            else:
                tails[p] = h
        return len(tails)`,
          javascript: r`var maxEnvelopes = function(envelopes) {
    envelopes.sort((a, b) => (a[0] !== b[0] ? a[0] - b[0] : b[1] - a[1]));
    const tails = [];
    for (const [, h] of envelopes) {
        let lo = 0, hi = tails.length;
        while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (tails[mid] < h) lo = mid + 1; else hi = mid;
        }
        tails[lo] = h;
    }
    return tails.length;
};`,
        },
      },
    ],
  },
};
