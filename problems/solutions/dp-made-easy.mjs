const r = String.raw;

export default {
  'fibonacci-number': {
    pattern: 'From recursion to DP: memoise overlapping subproblems, then keep only the last two values',
    approaches: [
      {
        level: 'Brute force', name: 'Plain recursion',
        idea: 'Write the definition directly: `F(n) = F(n − 1) + F(n − 2)`, with `F(0) = 0` and `F(1) = 1`.',
        steps: [
          'If `n < 2`, return `n`.',
          'Otherwise return `fib(n − 1) + fib(n − 2)`.',
        ],
        time: 'O(2ⁿ)', space: 'O(n)',
        why: 'Each call makes two more, and the same values are recomputed over and over (F(30) makes about 2.7 million calls). The recursion is n deep.',
        code: {
          java: r`class Solution {
    public int fib(int n) {
        return n < 2 ? n : fib(n - 1) + fib(n - 2);
    }
}`,
          cpp: r`class Solution {
public:
    int fib(int n) {
        return n < 2 ? n : fib(n - 1) + fib(n - 2);
    }
};`,
          python: r`class Solution:
    def fib(self, n: int) -> int:
        return n if n < 2 else self.fib(n - 1) + self.fib(n - 2)`,
          javascript: r`var fib = function(n) {
    return n < 2 ? n : fib(n - 1) + fib(n - 2);
};`,
        },
      },
      {
        level: 'Better', name: 'Memoisation (top-down DP)',
        idea: 'Same recursion, but store each `F(k)` the first time it is computed and reuse it afterwards. Every value is then computed once.',
        steps: [
          'Keep `memo[k]` (unset at first).',
          '`f(k)`: if `k < 2`, return `k`; if `memo[k]` is set, return it.',
          'Otherwise compute `f(k − 1) + f(k − 2)`, store it in `memo[k]`, and return it.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Each of the n + 1 values is computed once in O(1). The memo table and the recursion stack are O(n).',
        code: {
          java: r`class Solution {
    private final int[] memo = new int[31];

    public int fib(int n) {
        if (n < 2) return n;
        if (memo[n] != 0) return memo[n];
        return memo[n] = fib(n - 1) + fib(n - 2);
    }
}`,
          cpp: r`class Solution {
    int memo[31] = {};
public:
    int fib(int n) {
        if (n < 2) return n;
        if (memo[n]) return memo[n];
        return memo[n] = fib(n - 1) + fib(n - 2);
    }
};`,
          python: r`class Solution:
    def fib(self, n: int) -> int:
        @cache
        def f(k):
            return k if k < 2 else f(k - 1) + f(k - 2)
        return f(n)`,
          javascript: r`var fib = function(n) {
    const memo = new Map();
    const f = (k) => {
        if (k < 2) return k;
        if (!memo.has(k)) memo.set(k, f(k - 1) + f(k - 2));
        return memo.get(k);
    };
    return f(n);
};`,
        },
      },
      {
        level: 'Better', name: 'Tabulation (bottom-up DP)',
        idea: 'Fill a table from the smallest values up, so each entry\'s two ingredients are ready when it is computed. No recursion.',
        steps: [
          'If `n < 2`, return `n`.',
          'Create `dp[0..n]` with `dp[0] = 0`, `dp[1] = 1`.',
          'For `i` from 2 to n: `dp[i] = dp[i − 1] + dp[i − 2]`. Return `dp[n]`.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'One loop of n steps and a table of n + 1 values.',
        code: {
          java: r`class Solution {
    public int fib(int n) {
        if (n < 2) return n;
        int[] dp = new int[n + 1];
        dp[1] = 1;
        for (int i = 2; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];
        return dp[n];
    }
}`,
          cpp: r`class Solution {
public:
    int fib(int n) {
        if (n < 2) return n;
        vector<int> dp(n + 1, 0);
        dp[1] = 1;
        for (int i = 2; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];
        return dp[n];
    }
};`,
          python: r`class Solution:
    def fib(self, n: int) -> int:
        if n < 2:
            return n
        dp = [0] * (n + 1)
        dp[1] = 1
        for i in range(2, n + 1):
            dp[i] = dp[i - 1] + dp[i - 2]
        return dp[n]`,
          javascript: r`var fib = function(n) {
    if (n < 2) return n;
    const dp = new Array(n + 1).fill(0);
    dp[1] = 1;
    for (let i = 2; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];
    return dp[n];
};`,
        },
      },
      {
        level: 'Optimal', name: 'Two variables',
        idea: 'Each value only needs the previous two, so keep just those two and slide them forward.',
        steps: [
          'Set `a = 0` (F(0)), `b = 1` (F(1)).',
          'Repeat n times: `(a, b) = (b, a + b)`.',
          'Return `a`, which is now F(n).',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'n constant-time steps and two variables. (Matrix exponentiation can reach O(log n), which only pays off for huge n with modular arithmetic.)',
        code: {
          java: r`class Solution {
    public int fib(int n) {
        int a = 0, b = 1;
        for (int i = 0; i < n; i++) {
            int next = a + b;
            a = b;
            b = next;
        }
        return a;
    }
}`,
          cpp: r`class Solution {
public:
    int fib(int n) {
        int a = 0, b = 1;
        for (int i = 0; i < n; i++) {
            int next = a + b;
            a = b;
            b = next;
        }
        return a;
    }
};`,
          python: r`class Solution:
    def fib(self, n: int) -> int:
        a, b = 0, 1
        for _ in range(n):
            a, b = b, a + b
        return a`,
          javascript: r`var fib = function(n) {
    let a = 0, b = 1;
    for (let i = 0; i < n; i++) [a, b] = [b, a + b];
    return a;
};`,
        },
      },
    ],
  },

  'climbing-stairs': {
    pattern: '1-D DP: ways(i) = ways(i − 1) + ways(i − 2) (the last move was 1 or 2 steps)',
    approaches: [
      {
        level: 'Brute force', name: 'Plain recursion over the last move',
        idea: 'To stand on step `n`, the last move came from step `n − 1` or `n − 2`. So the number of ways is the sum of the ways to reach those two steps.',
        steps: [
          '`ways(n)`: if `n <= 2`, return `n` (1 way for one step, 2 for two).',
          'Otherwise return `ways(n − 1) + ways(n − 2)`.',
        ],
        time: 'O(2ⁿ)', space: 'O(n)',
        why: 'The call tree doubles at every level with massive repetition: n = 45 needs billions of calls.',
        timesOut: [4, 'generated'],
        code: {
          java: r`class Solution {
    public int climbStairs(int n) {
        return n <= 2 ? n : climbStairs(n - 1) + climbStairs(n - 2);
    }
}`,
          cpp: r`class Solution {
public:
    int climbStairs(int n) {
        return n <= 2 ? n : climbStairs(n - 1) + climbStairs(n - 2);
    }
};`,
          python: r`class Solution:
    def climbStairs(self, n: int) -> int:
        return n if n <= 2 else self.climbStairs(n - 1) + self.climbStairs(n - 2)`,
          javascript: r`var climbStairs = function(n) {
    return n <= 2 ? n : climbStairs(n - 1) + climbStairs(n - 2);
};`,
        },
      },
      {
        level: 'Better', name: 'Memoisation',
        idea: 'Cache `ways(k)` so each step count is solved only once.',
        steps: [
          '`ways(k)`: return `k` if `k <= 2`; return the cached value if there is one.',
          'Otherwise compute `ways(k − 1) + ways(k − 2)`, cache it, and return it.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'n distinct subproblems, O(1) each; the cache and the call stack hold O(n).',
        code: {
          java: r`class Solution {
    private final int[] memo = new int[46];

    public int climbStairs(int n) {
        if (n <= 2) return n;
        if (memo[n] != 0) return memo[n];
        return memo[n] = climbStairs(n - 1) + climbStairs(n - 2);
    }
}`,
          cpp: r`class Solution {
    int memo[46] = {};
public:
    int climbStairs(int n) {
        if (n <= 2) return n;
        if (memo[n]) return memo[n];
        return memo[n] = climbStairs(n - 1) + climbStairs(n - 2);
    }
};`,
          python: r`class Solution:
    def climbStairs(self, n: int) -> int:
        @cache
        def ways(k):
            return k if k <= 2 else ways(k - 1) + ways(k - 2)
        return ways(n)`,
          javascript: r`var climbStairs = function(n) {
    const memo = new Map();
    const ways = (k) => {
        if (k <= 2) return k;
        if (!memo.has(k)) memo.set(k, ways(k - 1) + ways(k - 2));
        return memo.get(k);
    };
    return ways(n);
};`,
        },
      },
      {
        level: 'Better', name: 'Tabulation',
        idea: 'Fill `dp[i]` = ways to reach step `i`, from the bottom up.',
        steps: [
          '`dp[1] = 1`, `dp[2] = 2` (handle `n <= 2` directly).',
          'For `i` from 3 to n: `dp[i] = dp[i − 1] + dp[i − 2]`.',
          'Return `dp[n]`.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'One pass over n entries.',
        code: {
          java: r`class Solution {
    public int climbStairs(int n) {
        if (n <= 2) return n;
        int[] dp = new int[n + 1];
        dp[1] = 1;
        dp[2] = 2;
        for (int i = 3; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];
        return dp[n];
    }
}`,
          cpp: r`class Solution {
public:
    int climbStairs(int n) {
        if (n <= 2) return n;
        vector<int> dp(n + 1);
        dp[1] = 1;
        dp[2] = 2;
        for (int i = 3; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];
        return dp[n];
    }
};`,
          python: r`class Solution:
    def climbStairs(self, n: int) -> int:
        if n <= 2:
            return n
        dp = [0] * (n + 1)
        dp[1], dp[2] = 1, 2
        for i in range(3, n + 1):
            dp[i] = dp[i - 1] + dp[i - 2]
        return dp[n]`,
          javascript: r`var climbStairs = function(n) {
    if (n <= 2) return n;
    const dp = new Array(n + 1).fill(0);
    dp[1] = 1;
    dp[2] = 2;
    for (let i = 3; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];
    return dp[n];
};`,
        },
      },
      {
        level: 'Optimal', name: 'Two variables',
        idea: 'Only the ways for the previous two steps are ever needed, so keep two numbers instead of a table.',
        steps: [
          'Set `a = 1` (ways to reach step 1) and `b = 2` (step 2).',
          'Repeat n − 1 times: `(a, b) = (b, a + b)` — each repeat moves both one step up.',
          'Return `a`, which is now the number of ways to reach step n.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'n steps with two variables. The answer for n = 45 is 1,836,311,903, just under 2³¹, so a 32-bit int is enough.',
        code: {
          java: r`class Solution {
    public int climbStairs(int n) {
        long a = 1, b = 2; // b can pass 2^31 on the last step; a (the answer) never does
        for (int i = 1; i < n; i++) {
            long next = a + b;
            a = b;
            b = next;
        }
        return (int) a;
    }
}`,
          cpp: r`class Solution {
public:
    int climbStairs(int n) {
        long long a = 1, b = 2; // b can pass 2^31 on the last step; a (the answer) never does
        for (int i = 1; i < n; i++) {
            long long next = a + b;
            a = b;
            b = next;
        }
        return (int) a;
    }
};`,
          python: r`class Solution:
    def climbStairs(self, n: int) -> int:
        a, b = 1, 2
        for _ in range(n - 1):
            a, b = b, a + b
        return a`,
          javascript: r`var climbStairs = function(n) {
    let a = 1, b = 2;
    for (let i = 1; i < n; i++) [a, b] = [b, a + b];
    return a;
};`,
        },
      },
    ],
  },

  'min-cost-climbing-stairs': {
    pattern: '1-D DP: cheapest cost to stand at step i = cost[i] + min of the two steps before',
    approaches: [
      {
        level: 'Brute force', name: 'Recursion over the last jump',
        idea: 'Let `reach(i)` be the cheapest cost to arrive at position `i` (before paying for it). You arrive from `i − 1` or `i − 2`, paying for that stair. Positions 0 and 1 cost nothing to reach.',
        steps: [
          '`reach(i)`: if `i <= 1`, return 0.',
          'Return `min(reach(i − 1) + cost[i − 1], reach(i − 2) + cost[i − 2])`.',
          'The answer is `reach(n)`, the top.',
        ],
        time: 'O(2ⁿ)', space: 'O(n)',
        why: 'Two recursive calls per position with heavy repetition; only usable for tiny inputs.',
        code: {
          java: r`class Solution {
    public int minCostClimbingStairs(int[] cost) {
        return reach(cost, cost.length);
    }

    private int reach(int[] cost, int i) {
        if (i <= 1) return 0;
        return Math.min(reach(cost, i - 1) + cost[i - 1], reach(cost, i - 2) + cost[i - 2]);
    }
}`,
          cpp: r`class Solution {
    int reach(vector<int>& cost, int i) {
        if (i <= 1) return 0;
        return min(reach(cost, i - 1) + cost[i - 1], reach(cost, i - 2) + cost[i - 2]);
    }
public:
    int minCostClimbingStairs(vector<int>& cost) {
        return reach(cost, cost.size());
    }
};`,
          python: r`class Solution:
    def minCostClimbingStairs(self, cost: List[int]) -> int:
        def reach(i):
            if i <= 1:
                return 0
            return min(reach(i - 1) + cost[i - 1], reach(i - 2) + cost[i - 2])
        return reach(len(cost))`,
          javascript: r`var minCostClimbingStairs = function(cost) {
    const reach = (i) => (i <= 1 ? 0 : Math.min(reach(i - 1) + cost[i - 1], reach(i - 2) + cost[i - 2]));
    return reach(cost.length);
};`,
        },
      },
      {
        level: 'Better', name: 'Memoisation',
        idea: 'Same recurrence, caching `reach(i)` so each position is solved once.',
        steps: [
          '`reach(i)`: return 0 for `i <= 1`; return the cached value if present.',
          'Otherwise compute the minimum of the two options, cache it, and return it.',
          'Answer `reach(n)`.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'n + 1 subproblems at O(1) each; the cache and the recursion stack are O(n).',
        code: {
          java: r`class Solution {
    private int[] memo;

    public int minCostClimbingStairs(int[] cost) {
        memo = new int[cost.length + 1];
        Arrays.fill(memo, -1);
        return reach(cost, cost.length);
    }

    private int reach(int[] cost, int i) {
        if (i <= 1) return 0;
        if (memo[i] != -1) return memo[i];
        return memo[i] = Math.min(reach(cost, i - 1) + cost[i - 1], reach(cost, i - 2) + cost[i - 2]);
    }
}`,
          cpp: r`class Solution {
    vector<int> memo;
    int reach(vector<int>& cost, int i) {
        if (i <= 1) return 0;
        if (memo[i] != -1) return memo[i];
        return memo[i] = min(reach(cost, i - 1) + cost[i - 1], reach(cost, i - 2) + cost[i - 2]);
    }
public:
    int minCostClimbingStairs(vector<int>& cost) {
        memo.assign(cost.size() + 1, -1);
        return reach(cost, cost.size());
    }
};`,
          python: r`class Solution:
    def minCostClimbingStairs(self, cost: List[int]) -> int:
        @cache
        def reach(i):
            if i <= 1:
                return 0
            return min(reach(i - 1) + cost[i - 1], reach(i - 2) + cost[i - 2])
        return reach(len(cost))`,
          javascript: r`var minCostClimbingStairs = function(cost) {
    const memo = new Map();
    const reach = (i) => {
        if (i <= 1) return 0;
        if (!memo.has(i)) memo.set(i, Math.min(reach(i - 1) + cost[i - 1], reach(i - 2) + cost[i - 2]));
        return memo.get(i);
    };
    return reach(cost.length);
};`,
        },
      },
      {
        level: 'Better', name: 'Tabulation',
        idea: 'Fill `dp[i]` = cheapest cost to reach position `i`, for `i` from 2 up to n (the top).',
        steps: [
          '`dp[0] = dp[1] = 0`.',
          'For `i` from 2 to n: `dp[i] = min(dp[i − 1] + cost[i − 1], dp[i − 2] + cost[i − 2])`.',
          'Return `dp[n]`.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'One pass over n + 1 entries.',
        code: {
          java: r`class Solution {
    public int minCostClimbingStairs(int[] cost) {
        int n = cost.length;
        int[] dp = new int[n + 1];
        for (int i = 2; i <= n; i++) dp[i] = Math.min(dp[i - 1] + cost[i - 1], dp[i - 2] + cost[i - 2]);
        return dp[n];
    }
}`,
          cpp: r`class Solution {
public:
    int minCostClimbingStairs(vector<int>& cost) {
        int n = cost.size();
        vector<int> dp(n + 1, 0);
        for (int i = 2; i <= n; i++) dp[i] = min(dp[i - 1] + cost[i - 1], dp[i - 2] + cost[i - 2]);
        return dp[n];
    }
};`,
          python: r`class Solution:
    def minCostClimbingStairs(self, cost: List[int]) -> int:
        n = len(cost)
        dp = [0] * (n + 1)
        for i in range(2, n + 1):
            dp[i] = min(dp[i - 1] + cost[i - 1], dp[i - 2] + cost[i - 2])
        return dp[n]`,
          javascript: r`var minCostClimbingStairs = function(cost) {
    const n = cost.length, dp = new Array(n + 1).fill(0);
    for (let i = 2; i <= n; i++) dp[i] = Math.min(dp[i - 1] + cost[i - 1], dp[i - 2] + cost[i - 2]);
    return dp[n];
};`,
        },
      },
      {
        level: 'Optimal', name: 'Two rolling values',
        idea: '`dp[i]` depends only on `dp[i − 1]` and `dp[i − 2]`, so two variables replace the table.',
        steps: [
          'Set `a = 0` (position i − 2) and `b = 0` (position i − 1), starting at i = 2.',
          'For `i` from 2 to n: `next = min(b + cost[i − 1], a + cost[i − 2])`; then `a = b`, `b = next`.',
          'Return `b`.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'One pass and two variables.',
        code: {
          java: r`class Solution {
    public int minCostClimbingStairs(int[] cost) {
        int a = 0, b = 0;
        for (int i = 2; i <= cost.length; i++) {
            int next = Math.min(b + cost[i - 1], a + cost[i - 2]);
            a = b;
            b = next;
        }
        return b;
    }
}`,
          cpp: r`class Solution {
public:
    int minCostClimbingStairs(vector<int>& cost) {
        int a = 0, b = 0;
        for (size_t i = 2; i <= cost.size(); i++) {
            int next = min(b + cost[i - 1], a + cost[i - 2]);
            a = b;
            b = next;
        }
        return b;
    }
};`,
          python: r`class Solution:
    def minCostClimbingStairs(self, cost: List[int]) -> int:
        a = b = 0
        for i in range(2, len(cost) + 1):
            a, b = b, min(b + cost[i - 1], a + cost[i - 2])
        return b`,
          javascript: r`var minCostClimbingStairs = function(cost) {
    let a = 0, b = 0;
    for (let i = 2; i <= cost.length; i++) [a, b] = [b, Math.min(b + cost[i - 1], a + cost[i - 2])];
    return b;
};`,
        },
      },
    ],
  },

  'n-th-tribonacci-number': {
    pattern: '1-D DP over the last three values',
    approaches: [
      {
        level: 'Brute force', name: 'Plain recursion',
        idea: 'Follow the definition: `T(n) = T(n − 1) + T(n − 2) + T(n − 3)`, with `T(0) = 0`, `T(1) = T(2) = 1`.',
        steps: [
          'If `n == 0`, return 0; if `n <= 2`, return 1.',
          'Return `trib(n − 1) + trib(n − 2) + trib(n − 3)`.',
        ],
        time: 'O(3ⁿ)', space: 'O(n)',
        why: 'Three calls per level with heavy repetition — the call count itself grows like the sequence (about 1.84ⁿ), billions for n = 37.',
        timesOut: [4, 'generated'],
        code: {
          java: r`class Solution {
    public int tribonacci(int n) {
        if (n == 0) return 0;
        if (n <= 2) return 1;
        return tribonacci(n - 1) + tribonacci(n - 2) + tribonacci(n - 3);
    }
}`,
          cpp: r`class Solution {
public:
    int tribonacci(int n) {
        if (n == 0) return 0;
        if (n <= 2) return 1;
        return tribonacci(n - 1) + tribonacci(n - 2) + tribonacci(n - 3);
    }
};`,
          python: r`class Solution:
    def tribonacci(self, n: int) -> int:
        if n == 0:
            return 0
        if n <= 2:
            return 1
        return self.tribonacci(n - 1) + self.tribonacci(n - 2) + self.tribonacci(n - 3)`,
          javascript: r`var tribonacci = function(n) {
    if (n === 0) return 0;
    if (n <= 2) return 1;
    return tribonacci(n - 1) + tribonacci(n - 2) + tribonacci(n - 3);
};`,
        },
      },
      {
        level: 'Better', name: 'Memoisation',
        idea: 'Cache each `T(k)` the first time it is computed.',
        steps: [
          '`t(k)`: base cases as before; return the cached value if present.',
          'Otherwise compute the sum of the three previous terms, cache it, return it.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'n + 1 subproblems with O(1) work each; the cache and recursion take O(n).',
        code: {
          java: r`class Solution {
    private final int[] memo = new int[38];

    public int tribonacci(int n) {
        if (n == 0) return 0;
        if (n <= 2) return 1;
        if (memo[n] != 0) return memo[n];
        return memo[n] = tribonacci(n - 1) + tribonacci(n - 2) + tribonacci(n - 3);
    }
}`,
          cpp: r`class Solution {
    int memo[38] = {};
public:
    int tribonacci(int n) {
        if (n == 0) return 0;
        if (n <= 2) return 1;
        if (memo[n]) return memo[n];
        return memo[n] = tribonacci(n - 1) + tribonacci(n - 2) + tribonacci(n - 3);
    }
};`,
          python: r`class Solution:
    def tribonacci(self, n: int) -> int:
        @cache
        def t(k):
            if k == 0:
                return 0
            if k <= 2:
                return 1
            return t(k - 1) + t(k - 2) + t(k - 3)
        return t(n)`,
          javascript: r`var tribonacci = function(n) {
    const memo = new Map();
    const t = (k) => {
        if (k === 0) return 0;
        if (k <= 2) return 1;
        if (!memo.has(k)) memo.set(k, t(k - 1) + t(k - 2) + t(k - 3));
        return memo.get(k);
    };
    return t(n);
};`,
        },
      },
      {
        level: 'Optimal', name: 'Three rolling variables',
        idea: 'Each term needs only the previous three, so slide a window of three values forward.',
        steps: [
          'Set `a = 0`, `b = 1`, `c = 1` (T(0), T(1), T(2)).',
          'Repeat n times: `(a, b, c) = (b, c, a + b + c)` — the window moves one term forward.',
          'Return `a`, which is now T(n).',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'n constant-time steps and three variables. T(37) = 2,082,876,103 fits in a 32-bit int, but the values computed ahead of it do not, so Java and C++ use 64-bit variables.',
        code: {
          java: r`class Solution {
    public int tribonacci(int n) {
        long a = 0, b = 1, c = 1;
        for (int i = 0; i < n; i++) {
            long next = a + b + c;
            a = b;
            b = c;
            c = next;
        }
        return (int) a;
    }
}`,
          cpp: r`class Solution {
public:
    int tribonacci(int n) {
        long long a = 0, b = 1, c = 1;
        for (int i = 0; i < n; i++) {
            long long next = a + b + c;
            a = b;
            b = c;
            c = next;
        }
        return (int) a;
    }
};`,
          python: r`class Solution:
    def tribonacci(self, n: int) -> int:
        a, b, c = 0, 1, 1
        for _ in range(n):
            a, b, c = b, c, a + b + c
        return a`,
          javascript: r`var tribonacci = function(n) {
    let a = 0, b = 1, c = 1;
    for (let i = 0; i < n; i++) [a, b, c] = [b, c, a + b + c];
    return a;
};`,
        },
      },
    ],
  },
};
