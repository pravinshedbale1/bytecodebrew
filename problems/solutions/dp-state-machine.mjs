const r = String.raw;

export default {
  'best-time-to-buy-and-sell-stock-ii': {
    pattern: 'State-machine DP (holding / not holding), which collapses to a greedy sum of rises',
    approaches: [
      {
        level: 'Brute force', name: 'Recursion over each day\'s choice',
        idea: 'On each day we either do nothing, or act: buy if we hold nothing, sell if we hold a share. Try both and take the best.',
        steps: [
          '`best(i, holding)`: 0 once `i == n`.',
          'Skip: `best(i + 1, holding)`.',
          'Act: if holding, `prices[i] + best(i + 1, false)`; otherwise `−prices[i] + best(i + 1, true)`. Return the larger.',
        ],
        time: 'O(2ⁿ)', space: 'O(n)',
        why: 'Two branches per day without caching. A share still held at the end adds nothing, so its purchase cost makes that branch lose automatically.',
        code: {
          java: r`class Solution {
    public int maxProfit(int[] prices) {
        return best(prices, 0, false);
    }

    private int best(int[] p, int i, boolean holding) {
        if (i == p.length) return 0;
        int skip = best(p, i + 1, holding);
        int act = holding ? p[i] + best(p, i + 1, false) : -p[i] + best(p, i + 1, true);
        return Math.max(skip, act);
    }
}`,
          cpp: r`class Solution {
    int best(vector<int>& p, int i, bool holding) {
        if (i == (int) p.size()) return 0;
        int skip = best(p, i + 1, holding);
        int act = holding ? p[i] + best(p, i + 1, false) : -p[i] + best(p, i + 1, true);
        return max(skip, act);
    }
public:
    int maxProfit(vector<int>& prices) {
        return best(prices, 0, false);
    }
};`,
          python: r`class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        n = len(prices)
        def best(i, holding):
            if i == n:
                return 0
            skip = best(i + 1, holding)
            act = prices[i] + best(i + 1, False) if holding else -prices[i] + best(i + 1, True)
            return max(skip, act)
        return best(0, False)`,
          javascript: r`var maxProfit = function(prices) {
    const n = prices.length;
    const best = (i, holding) => {
        if (i === n) return 0;
        const skip = best(i + 1, holding);
        const act = holding ? prices[i] + best(i + 1, false) : -prices[i] + best(i + 1, true);
        return Math.max(skip, act);
    };
    return best(0, false);
};`,
        },
        timesOut: ['generated'],
      },
      {
        level: 'Better', name: 'DP table over (day, holding)',
        idea: 'There are only 2n states, so fill them from the last day backwards.',
        steps: [
          '`dp[n][0] = dp[n][1] = 0`.',
          '`dp[i][0] = max(dp[i + 1][0], −prices[i] + dp[i + 1][1])` (free: wait or buy).',
          '`dp[i][1] = max(dp[i + 1][1], prices[i] + dp[i + 1][0])` (holding: wait or sell).',
          'Return `dp[0][0]`.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Two states per day, each O(1).',
        code: {
          java: r`class Solution {
    public int maxProfit(int[] prices) {
        int n = prices.length;
        int[][] dp = new int[n + 1][2];
        for (int i = n - 1; i >= 0; i--) {
            dp[i][0] = Math.max(dp[i + 1][0], -prices[i] + dp[i + 1][1]);
            dp[i][1] = Math.max(dp[i + 1][1], prices[i] + dp[i + 1][0]);
        }
        return dp[0][0];
    }
}`,
          cpp: r`class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int n = prices.size();
        vector<array<int, 2>> dp(n + 1, {0, 0});
        for (int i = n - 1; i >= 0; i--) {
            dp[i][0] = max(dp[i + 1][0], -prices[i] + dp[i + 1][1]);
            dp[i][1] = max(dp[i + 1][1], prices[i] + dp[i + 1][0]);
        }
        return dp[0][0];
    }
};`,
          python: r`class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        n = len(prices)
        dp = [[0, 0] for _ in range(n + 1)]
        for i in range(n - 1, -1, -1):
            dp[i][0] = max(dp[i + 1][0], -prices[i] + dp[i + 1][1])
            dp[i][1] = max(dp[i + 1][1], prices[i] + dp[i + 1][0])
        return dp[0][0]`,
          javascript: r`var maxProfit = function(prices) {
    const n = prices.length, dp = Array.from({ length: n + 1 }, () => [0, 0]);
    for (let i = n - 1; i >= 0; i--) {
        dp[i][0] = Math.max(dp[i + 1][0], -prices[i] + dp[i + 1][1]);
        dp[i][1] = Math.max(dp[i + 1][1], prices[i] + dp[i + 1][0]);
    }
    return dp[0][0];
};`,
        },
      },
      {
        level: 'Optimal', name: 'Greedy: collect every rise',
        idea: 'With unlimited transactions, any rising stretch can be split into day-to-day rises, and each rise can be captured by buying the day before and selling that day. So the answer is the sum of all positive day-to-day differences.',
        steps: [
          'For each day `i ≥ 1`, add `max(0, prices[i] − prices[i − 1])`.',
          'Return the total.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'One pass. It is exactly the DP above with the two states kept in variables: holding through a rise is the same as selling and re-buying each day.',
        code: {
          java: r`class Solution {
    public int maxProfit(int[] prices) {
        int profit = 0;
        for (int i = 1; i < prices.length; i++) profit += Math.max(0, prices[i] - prices[i - 1]);
        return profit;
    }
}`,
          cpp: r`class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int profit = 0;
        for (size_t i = 1; i < prices.size(); i++) profit += max(0, prices[i] - prices[i - 1]);
        return profit;
    }
};`,
          python: r`class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        return sum(max(0, b - a) for a, b in zip(prices, prices[1:]))`,
          javascript: r`var maxProfit = function(prices) {
    let profit = 0;
    for (let i = 1; i < prices.length; i++) profit += Math.max(0, prices[i] - prices[i - 1]);
    return profit;
};`,
        },
      },
    ],
  },

  'best-time-to-buy-and-sell-stock-with-transaction-fee': {
    pattern: 'State-machine DP with two states: cash (no share) and hold (one share)',
    approaches: [
      {
        level: 'Brute force', name: 'Recursion over each day\'s choice',
        idea: 'Each day, either wait or act (buy when free, sell when holding — paying the fee on the sale). Try both.',
        steps: [
          '`best(i, holding)`: 0 once `i == n`.',
          'Skip: `best(i + 1, holding)`.',
          'Act: if holding, `prices[i] − fee + best(i + 1, false)`; otherwise `−prices[i] + best(i + 1, true)`. Return the larger.',
        ],
        time: 'O(2ⁿ)', space: 'O(n)',
        why: 'Two branches per day without caching.',
        code: {
          java: r`class Solution {
    public int maxProfit(int[] prices, int fee) {
        return best(prices, fee, 0, false);
    }

    private int best(int[] p, int fee, int i, boolean holding) {
        if (i == p.length) return 0;
        int skip = best(p, fee, i + 1, holding);
        int act = holding ? p[i] - fee + best(p, fee, i + 1, false) : -p[i] + best(p, fee, i + 1, true);
        return Math.max(skip, act);
    }
}`,
          cpp: r`class Solution {
    int best(vector<int>& p, int fee, int i, bool holding) {
        if (i == (int) p.size()) return 0;
        int skip = best(p, fee, i + 1, holding);
        int act = holding ? p[i] - fee + best(p, fee, i + 1, false) : -p[i] + best(p, fee, i + 1, true);
        return max(skip, act);
    }
public:
    int maxProfit(vector<int>& prices, int fee) {
        return best(prices, fee, 0, false);
    }
};`,
          python: r`class Solution:
    def maxProfit(self, prices: List[int], fee: int) -> int:
        n = len(prices)
        def best(i, holding):
            if i == n:
                return 0
            skip = best(i + 1, holding)
            act = prices[i] - fee + best(i + 1, False) if holding else -prices[i] + best(i + 1, True)
            return max(skip, act)
        return best(0, False)`,
          javascript: r`var maxProfit = function(prices, fee) {
    const n = prices.length;
    const best = (i, holding) => {
        if (i === n) return 0;
        const skip = best(i + 1, holding);
        const act = holding ? prices[i] - fee + best(i + 1, false) : -prices[i] + best(i + 1, true);
        return Math.max(skip, act);
    };
    return best(0, false);
};`,
        },
      },
      {
        level: 'Better', name: 'DP table over (day, holding)',
        idea: 'Only 2n distinct states — fill them from the last day backwards.',
        steps: [
          '`dp[n][0] = dp[n][1] = 0`.',
          '`dp[i][0] = max(dp[i + 1][0], −prices[i] + dp[i + 1][1])`.',
          '`dp[i][1] = max(dp[i + 1][1], prices[i] − fee + dp[i + 1][0])`.',
          'Return `dp[0][0]`.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Two O(1) states per day.',
        code: {
          java: r`class Solution {
    public int maxProfit(int[] prices, int fee) {
        int n = prices.length;
        int[][] dp = new int[n + 1][2];
        for (int i = n - 1; i >= 0; i--) {
            dp[i][0] = Math.max(dp[i + 1][0], -prices[i] + dp[i + 1][1]);
            dp[i][1] = Math.max(dp[i + 1][1], prices[i] - fee + dp[i + 1][0]);
        }
        return dp[0][0];
    }
}`,
          cpp: r`class Solution {
public:
    int maxProfit(vector<int>& prices, int fee) {
        int n = prices.size();
        vector<array<int, 2>> dp(n + 1, {0, 0});
        for (int i = n - 1; i >= 0; i--) {
            dp[i][0] = max(dp[i + 1][0], -prices[i] + dp[i + 1][1]);
            dp[i][1] = max(dp[i + 1][1], prices[i] - fee + dp[i + 1][0]);
        }
        return dp[0][0];
    }
};`,
          python: r`class Solution:
    def maxProfit(self, prices: List[int], fee: int) -> int:
        n = len(prices)
        dp = [[0, 0] for _ in range(n + 1)]
        for i in range(n - 1, -1, -1):
            dp[i][0] = max(dp[i + 1][0], -prices[i] + dp[i + 1][1])
            dp[i][1] = max(dp[i + 1][1], prices[i] - fee + dp[i + 1][0])
        return dp[0][0]`,
          javascript: r`var maxProfit = function(prices, fee) {
    const n = prices.length, dp = Array.from({ length: n + 1 }, () => [0, 0]);
    for (let i = n - 1; i >= 0; i--) {
        dp[i][0] = Math.max(dp[i + 1][0], -prices[i] + dp[i + 1][1]);
        dp[i][1] = Math.max(dp[i + 1][1], prices[i] - fee + dp[i + 1][0]);
    }
    return dp[0][0];
};`,
        },
      },
      {
        level: 'Optimal', name: 'Two rolling variables',
        idea: 'Walk forward keeping `cash` (best profit with no share) and `hold` (best profit while holding one). Each day, `cash` may sell what `hold` has, and `hold` may buy from `cash`.',
        steps: [
          'Start `cash = 0`, `hold = −prices[0]`.',
          'For each price `p`: `cash = max(cash, hold + p − fee)`; `hold = max(hold, cash − p)`.',
          'Return `cash`.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'One pass with two numbers. Using the updated `cash` in `hold` means selling and re-buying on the same day, which only loses the fee, so it never wrongly helps. Profit stays below (n/2)·max price ≈ 1.25·10⁹, inside a 32-bit int.',
        code: {
          java: r`class Solution {
    public int maxProfit(int[] prices, int fee) {
        int cash = 0, hold = -prices[0];
        for (int p : prices) {
            cash = Math.max(cash, hold + p - fee);
            hold = Math.max(hold, cash - p);
        }
        return cash;
    }
}`,
          cpp: r`class Solution {
public:
    int maxProfit(vector<int>& prices, int fee) {
        int cash = 0, hold = -prices[0];
        for (int p : prices) {
            cash = max(cash, hold + p - fee);
            hold = max(hold, cash - p);
        }
        return cash;
    }
};`,
          python: r`class Solution:
    def maxProfit(self, prices: List[int], fee: int) -> int:
        cash, hold = 0, -prices[0]
        for p in prices:
            cash = max(cash, hold + p - fee)
            hold = max(hold, cash - p)
        return cash`,
          javascript: r`var maxProfit = function(prices, fee) {
    let cash = 0, hold = -prices[0];
    for (const p of prices) {
        cash = Math.max(cash, hold + p - fee);
        hold = Math.max(hold, cash - p);
    }
    return cash;
};`,
        },
      },
    ],
  },

  'best-time-to-buy-and-sell-stock-iii': {
    pattern: 'State machine with four states: after first buy, first sell, second buy, second sell',
    approaches: [
      {
        level: 'Brute force', name: 'Try every split point',
        idea: 'Two non-overlapping transactions fit on either side of some split day. For every split, find the best single transaction on the left part and on the right part with a scan.',
        steps: [
          '`one(from, to)`: best single transaction in `prices[from..to)` — track the minimum so far and the best `price − min`.',
          'For every split `s` from 0 to n: candidate = `one(0, s) + one(s, n)`.',
          'Return the largest candidate (a split at 0 or n covers using only one transaction).',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'n + 1 splits, each scanning the whole array.',
        code: {
          java: r`class Solution {
    public int maxProfit(int[] prices) {
        int n = prices.length, best = 0;
        for (int s = 0; s <= n; s++) best = Math.max(best, one(prices, 0, s) + one(prices, s, n));
        return best;
    }

    private int one(int[] p, int from, int to) {
        int min = Integer.MAX_VALUE, profit = 0;
        for (int i = from; i < to; i++) {
            min = Math.min(min, p[i]);
            profit = Math.max(profit, p[i] - min);
        }
        return profit;
    }
}`,
          cpp: r`class Solution {
    int one(vector<int>& p, int from, int to) {
        int lo = INT_MAX, profit = 0;
        for (int i = from; i < to; i++) {
            lo = min(lo, p[i]);
            profit = max(profit, p[i] - lo);
        }
        return profit;
    }
public:
    int maxProfit(vector<int>& prices) {
        int n = prices.size(), best = 0;
        for (int s = 0; s <= n; s++) best = max(best, one(prices, 0, s) + one(prices, s, n));
        return best;
    }
};`,
          python: r`class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        def one(part):
            lo, profit = inf, 0
            for p in part:
                lo = min(lo, p)
                profit = max(profit, p - lo)
            return profit
        return max(one(prices[:s]) + one(prices[s:]) for s in range(len(prices) + 1))`,
          javascript: r`var maxProfit = function(prices) {
    const one = (from, to) => {
        let lo = Infinity, profit = 0;
        for (let i = from; i < to; i++) {
            lo = Math.min(lo, prices[i]);
            profit = Math.max(profit, prices[i] - lo);
        }
        return profit;
    };
    const n = prices.length;
    let best = 0;
    for (let s = 0; s <= n; s++) best = Math.max(best, one(0, s) + one(s, n));
    return best;
};`,
        },
      },
      {
        level: 'Better', name: 'Prefix best and suffix best arrays',
        idea: 'Precompute the best single transaction ending by each day (left to right) and starting from each day (right to left). Then every split costs O(1).',
        steps: [
          '`left[i]` = best profit within `prices[0..i]`, using a running minimum.',
          '`right[i]` = best profit within `prices[i..n−1]`, using a running maximum from the right; `right[n] = 0`.',
          'Return the maximum of `left[i] + right[i + 1]` over all `i`.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Three linear passes and two arrays.',
        code: {
          java: r`class Solution {
    public int maxProfit(int[] prices) {
        int n = prices.length;
        int[] left = new int[n], right = new int[n + 1];
        for (int i = 0, min = Integer.MAX_VALUE; i < n; i++) {
            min = Math.min(min, prices[i]);
            left[i] = Math.max(i > 0 ? left[i - 1] : 0, prices[i] - min);
        }
        for (int i = n - 1, max = 0; i >= 0; i--) {
            max = Math.max(max, prices[i]);
            right[i] = Math.max(right[i + 1], max - prices[i]);
        }
        int best = 0;
        for (int i = 0; i < n; i++) best = Math.max(best, left[i] + right[i + 1]);
        return best;
    }
}`,
          cpp: r`class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int n = prices.size();
        vector<int> left(n), right(n + 1, 0);
        for (int i = 0, lo = INT_MAX; i < n; i++) {
            lo = min(lo, prices[i]);
            left[i] = max(i > 0 ? left[i - 1] : 0, prices[i] - lo);
        }
        for (int i = n - 1, hi = 0; i >= 0; i--) {
            hi = max(hi, prices[i]);
            right[i] = max(right[i + 1], hi - prices[i]);
        }
        int best = 0;
        for (int i = 0; i < n; i++) best = max(best, left[i] + right[i + 1]);
        return best;
    }
};`,
          python: r`class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        n = len(prices)
        left, right = [0] * n, [0] * (n + 1)
        lo = inf
        for i, p in enumerate(prices):
            lo = min(lo, p)
            left[i] = max(left[i - 1] if i else 0, p - lo)
        hi = 0
        for i in range(n - 1, -1, -1):
            hi = max(hi, prices[i])
            right[i] = max(right[i + 1], hi - prices[i])
        return max(left[i] + right[i + 1] for i in range(n))`,
          javascript: r`var maxProfit = function(prices) {
    const n = prices.length, left = new Array(n).fill(0), right = new Array(n + 1).fill(0);
    for (let i = 0, lo = Infinity; i < n; i++) {
        lo = Math.min(lo, prices[i]);
        left[i] = Math.max(i > 0 ? left[i - 1] : 0, prices[i] - lo);
    }
    for (let i = n - 1, hi = 0; i >= 0; i--) {
        hi = Math.max(hi, prices[i]);
        right[i] = Math.max(right[i + 1], hi - prices[i]);
    }
    let best = 0;
    for (let i = 0; i < n; i++) best = Math.max(best, left[i] + right[i + 1]);
    return best;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Four-state machine',
        idea: 'Track the best balance after each stage: first buy, first sell, second buy, second sell. Each stage can only improve from the stage before it on the same day.',
        steps: [
          'Start `buy1 = buy2 = −prices[0]`, `sell1 = sell2 = 0`.',
          'For each price `p`: `buy1 = max(buy1, −p)`; `sell1 = max(sell1, buy1 + p)`; `buy2 = max(buy2, sell1 − p)`; `sell2 = max(sell2, buy2 + p)`.',
          'Return `sell2` (it already covers using one or zero transactions).',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'One pass, four numbers. Updating in order on the same day only allows buy-and-sell on one day, which adds 0, so it never overcounts.',
        code: {
          java: r`class Solution {
    public int maxProfit(int[] prices) {
        int buy1 = -prices[0], sell1 = 0, buy2 = -prices[0], sell2 = 0;
        for (int p : prices) {
            buy1 = Math.max(buy1, -p);
            sell1 = Math.max(sell1, buy1 + p);
            buy2 = Math.max(buy2, sell1 - p);
            sell2 = Math.max(sell2, buy2 + p);
        }
        return sell2;
    }
}`,
          cpp: r`class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int buy1 = -prices[0], sell1 = 0, buy2 = -prices[0], sell2 = 0;
        for (int p : prices) {
            buy1 = max(buy1, -p);
            sell1 = max(sell1, buy1 + p);
            buy2 = max(buy2, sell1 - p);
            sell2 = max(sell2, buy2 + p);
        }
        return sell2;
    }
};`,
          python: r`class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        buy1 = buy2 = -prices[0]
        sell1 = sell2 = 0
        for p in prices:
            buy1 = max(buy1, -p)
            sell1 = max(sell1, buy1 + p)
            buy2 = max(buy2, sell1 - p)
            sell2 = max(sell2, buy2 + p)
        return sell2`,
          javascript: r`var maxProfit = function(prices) {
    let buy1 = -prices[0], sell1 = 0, buy2 = -prices[0], sell2 = 0;
    for (const p of prices) {
        buy1 = Math.max(buy1, -p);
        sell1 = Math.max(sell1, buy1 + p);
        buy2 = Math.max(buy2, sell1 - p);
        sell2 = Math.max(sell2, buy2 + p);
    }
    return sell2;
};`,
        },
      },
    ],
  },

  'best-time-to-buy-and-sell-stock-iv': {
    pattern: 'State machine generalised to k transactions: buy[j] and sell[j] per transaction',
    approaches: [
      {
        level: 'Brute force', name: 'Recursion over (day, transactions left, holding)',
        idea: 'Each day, wait or act. A transaction is counted when the share is sold; buying is only allowed while some transactions remain.',
        steps: [
          '`best(i, left, holding)`: 0 when `i == n` or `left == 0`.',
          'Skip: `best(i + 1, left, holding)`.',
          'Act: if holding, `prices[i] + best(i + 1, left − 1, false)`; otherwise `−prices[i] + best(i + 1, left, true)`. Return the larger.',
        ],
        time: 'O(2ⁿ)', space: 'O(n)',
        why: 'Two branches per day without caching.',
        code: {
          java: r`class Solution {
    public int maxProfit(int k, int[] prices) {
        return best(prices, 0, k, false);
    }

    private int best(int[] p, int i, int left, boolean holding) {
        if (i == p.length || left == 0) return 0;
        int skip = best(p, i + 1, left, holding);
        int act = holding ? p[i] + best(p, i + 1, left - 1, false) : -p[i] + best(p, i + 1, left, true);
        return Math.max(skip, act);
    }
}`,
          cpp: r`class Solution {
    int best(vector<int>& p, int i, int left, bool holding) {
        if (i == (int) p.size() || left == 0) return 0;
        int skip = best(p, i + 1, left, holding);
        int act = holding ? p[i] + best(p, i + 1, left - 1, false) : -p[i] + best(p, i + 1, left, true);
        return max(skip, act);
    }
public:
    int maxProfit(int k, vector<int>& prices) {
        return best(prices, 0, k, false);
    }
};`,
          python: r`class Solution:
    def maxProfit(self, k: int, prices: List[int]) -> int:
        n = len(prices)
        def best(i, left, holding):
            if i == n or left == 0:
                return 0
            skip = best(i + 1, left, holding)
            if holding:
                act = prices[i] + best(i + 1, left - 1, False)
            else:
                act = -prices[i] + best(i + 1, left, True)
            return max(skip, act)
        return best(0, k, False)`,
          javascript: r`var maxProfit = function(k, prices) {
    const n = prices.length;
    const best = (i, left, holding) => {
        if (i === n || left === 0) return 0;
        const skip = best(i + 1, left, holding);
        const act = holding ? prices[i] + best(i + 1, left - 1, false) : -prices[i] + best(i + 1, left, true);
        return Math.max(skip, act);
    };
    return best(0, k, false);
};`,
        },
        timesOut: ['generated'],
      },
      {
        level: 'Better', name: 'DP table over (day, transactions left, holding)',
        idea: 'Fill the 2·n·(k + 1) states from the last day backwards.',
        steps: [
          '`dp[n][j][h] = 0`; also `dp[i][0][*] = 0` (no transactions left).',
          'Free: `dp[i][j][0] = max(dp[i + 1][j][0], −prices[i] + dp[i + 1][j][1])`.',
          'Holding: `dp[i][j][1] = max(dp[i + 1][j][1], prices[i] + dp[i + 1][j − 1][0])`.',
          'Return `dp[0][k][0]`.',
        ],
        time: 'O(n·k)', space: 'O(n·k)',
        why: 'n·(k + 1)·2 states with O(1) work each.',
        code: {
          java: r`class Solution {
    public int maxProfit(int k, int[] prices) {
        int n = prices.length;
        int[][][] dp = new int[n + 1][k + 1][2];
        for (int i = n - 1; i >= 0; i--)
            for (int j = 1; j <= k; j++) {
                dp[i][j][0] = Math.max(dp[i + 1][j][0], -prices[i] + dp[i + 1][j][1]);
                dp[i][j][1] = Math.max(dp[i + 1][j][1], prices[i] + dp[i + 1][j - 1][0]);
            }
        return dp[0][k][0];
    }
}`,
          cpp: r`class Solution {
public:
    int maxProfit(int k, vector<int>& prices) {
        int n = prices.size();
        vector<vector<array<int, 2>>> dp(n + 1, vector<array<int, 2>>(k + 1, {0, 0}));
        for (int i = n - 1; i >= 0; i--)
            for (int j = 1; j <= k; j++) {
                dp[i][j][0] = max(dp[i + 1][j][0], -prices[i] + dp[i + 1][j][1]);
                dp[i][j][1] = max(dp[i + 1][j][1], prices[i] + dp[i + 1][j - 1][0]);
            }
        return dp[0][k][0];
    }
};`,
          python: r`class Solution:
    def maxProfit(self, k: int, prices: List[int]) -> int:
        n = len(prices)
        dp = [[[0, 0] for _ in range(k + 1)] for _ in range(n + 1)]
        for i in range(n - 1, -1, -1):
            for j in range(1, k + 1):
                dp[i][j][0] = max(dp[i + 1][j][0], -prices[i] + dp[i + 1][j][1])
                dp[i][j][1] = max(dp[i + 1][j][1], prices[i] + dp[i + 1][j - 1][0])
        return dp[0][k][0]`,
          javascript: r`var maxProfit = function(k, prices) {
    const n = prices.length;
    const dp = Array.from({ length: n + 1 }, () => Array.from({ length: k + 1 }, () => [0, 0]));
    for (let i = n - 1; i >= 0; i--)
        for (let j = 1; j <= k; j++) {
            dp[i][j][0] = Math.max(dp[i + 1][j][0], -prices[i] + dp[i + 1][j][1]);
            dp[i][j][1] = Math.max(dp[i + 1][j][1], prices[i] + dp[i + 1][j - 1][0]);
        }
    return dp[0][k][0];
};`,
        },
      },
      {
        level: 'Optimal', name: 'buy[j] / sell[j] arrays, with the unlimited shortcut',
        idea: 'Generalise the four-state machine from Stock III: `buy[j]` is the best balance holding a share during transaction j, `sell[j]` the best after completing j. If `2k ≥ n`, the limit can never bind, so just sum every rise.',
        steps: [
          'If `2k ≥ n`: return the sum of positive day-to-day differences.',
          'Otherwise start `buy[j] = −prices[0]`, `sell[j] = 0` for j = 1..k (`sell[0] = 0`).',
          'For each price `p`, for j = 1..k: `buy[j] = max(buy[j], sell[j − 1] − p)`; `sell[j] = max(sell[j], buy[j] + p)`.',
          'Return `sell[k]`.',
        ],
        time: 'O(n·min(k, n))', space: 'O(k)',
        why: 'k numbers per day instead of a whole table. A profitable transaction needs at least two days, so at most n/2 can ever be used — which is why the shortcut is exact.',
        code: {
          java: r`class Solution {
    public int maxProfit(int k, int[] prices) {
        int n = prices.length;
        if (2 * k >= n) {
            int profit = 0;
            for (int i = 1; i < n; i++) profit += Math.max(0, prices[i] - prices[i - 1]);
            return profit;
        }
        int[] buy = new int[k + 1], sell = new int[k + 1];
        Arrays.fill(buy, -prices[0]);
        for (int p : prices)
            for (int j = 1; j <= k; j++) {
                buy[j] = Math.max(buy[j], sell[j - 1] - p);
                sell[j] = Math.max(sell[j], buy[j] + p);
            }
        return sell[k];
    }
}`,
          cpp: r`class Solution {
public:
    int maxProfit(int k, vector<int>& prices) {
        int n = prices.size();
        if (2 * k >= n) {
            int profit = 0;
            for (int i = 1; i < n; i++) profit += max(0, prices[i] - prices[i - 1]);
            return profit;
        }
        vector<int> buy(k + 1, -prices[0]), sell(k + 1, 0);
        for (int p : prices)
            for (int j = 1; j <= k; j++) {
                buy[j] = max(buy[j], sell[j - 1] - p);
                sell[j] = max(sell[j], buy[j] + p);
            }
        return sell[k];
    }
};`,
          python: r`class Solution:
    def maxProfit(self, k: int, prices: List[int]) -> int:
        n = len(prices)
        if 2 * k >= n:
            return sum(max(0, b - a) for a, b in zip(prices, prices[1:]))
        buy, sell = [-prices[0]] * (k + 1), [0] * (k + 1)
        for p in prices:
            for j in range(1, k + 1):
                buy[j] = max(buy[j], sell[j - 1] - p)
                sell[j] = max(sell[j], buy[j] + p)
        return sell[k]`,
          javascript: r`var maxProfit = function(k, prices) {
    const n = prices.length;
    if (2 * k >= n) {
        let profit = 0;
        for (let i = 1; i < n; i++) profit += Math.max(0, prices[i] - prices[i - 1]);
        return profit;
    }
    const buy = new Array(k + 1).fill(-prices[0]), sell = new Array(k + 1).fill(0);
    for (const p of prices)
        for (let j = 1; j <= k; j++) {
            buy[j] = Math.max(buy[j], sell[j - 1] - p);
            sell[j] = Math.max(sell[j], buy[j] + p);
        }
    return sell[k];
};`,
        },
      },
    ],
  },

  'student-attendance-record-ii': {
    pattern: 'Counting DP over a small state machine: (absences so far, trailing late streak)',
    approaches: [
      {
        level: 'Brute force', name: 'Build every eligible record',
        idea: 'Grow the record one day at a time, tracking how many A\'s it has and how many L\'s it currently ends with, and count each complete record.',
        steps: [
          '`count(i, a, l)`: 1 when `i == n`.',
          'Add P: `count(i + 1, a, 0)`. Add A if `a == 0`: `count(i + 1, 1, 0)`. Add L if `l < 2`: `count(i + 1, a, l + 1)`.',
          'Sum the branches modulo 10⁹ + 7.',
        ],
        time: 'O(3ⁿ)', space: 'O(n)',
        why: 'It visits every eligible record one by one, and their number grows exponentially.',
        timesOut: [2, 4, 'generated'],
        code: {
          java: r`class Solution {
    private static final int MOD = 1_000_000_007;

    public int checkRecord(int n) {
        return count(n, 0, 0, 0);
    }

    private int count(int n, int i, int a, int l) {
        if (i == n) return 1;
        long total = count(n, i + 1, a, 0);
        if (a == 0) total += count(n, i + 1, 1, 0);
        if (l < 2) total += count(n, i + 1, a, l + 1);
        return (int) (total % MOD);
    }
}`,
          cpp: r`class Solution {
    static const int MOD = 1'000'000'007;
    int count(int n, int i, int a, int l) {
        if (i == n) return 1;
        long long total = count(n, i + 1, a, 0);
        if (a == 0) total += count(n, i + 1, 1, 0);
        if (l < 2) total += count(n, i + 1, a, l + 1);
        return total % MOD;
    }
public:
    int checkRecord(int n) {
        return count(n, 0, 0, 0);
    }
};`,
          python: r`class Solution:
    def checkRecord(self, n: int) -> int:
        MOD = 10**9 + 7
        def count(i, a, l):
            if i == n:
                return 1
            total = count(i + 1, a, 0)
            if a == 0:
                total += count(i + 1, 1, 0)
            if l < 2:
                total += count(i + 1, a, l + 1)
            return total % MOD
        return count(0, 0, 0)`,
          javascript: r`var checkRecord = function(n) {
    const MOD = 1e9 + 7;
    const count = (i, a, l) => {
        if (i === n) return 1;
        let total = count(i + 1, a, 0);
        if (a === 0) total += count(i + 1, 1, 0);
        if (l < 2) total += count(i + 1, a, l + 1);
        return total % MOD;
    };
    return count(0, 0, 0);
};`,
        },
      },
      {
        level: 'Better', name: 'DP table over (day, absences, late streak)',
        idea: 'The recursion only depends on `(i, a, l)` — 6 combinations per day. Fill them from the last day backwards.',
        steps: [
          '`dp[n][a][l] = 1` for all a ∈ {0, 1}, l ∈ {0, 1, 2}.',
          '`dp[i][a][l] = dp[i + 1][a][0]` (P) `+ dp[i + 1][1][0]` if a = 0 (A) `+ dp[i + 1][a][l + 1]` if l < 2 (L), mod 10⁹ + 7.',
          'Return `dp[0][0][0]`.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: '6 states per day, O(1) each.',
        code: {
          java: r`class Solution {
    public int checkRecord(int n) {
        final int MOD = 1_000_000_007;
        long[][][] dp = new long[n + 1][2][3];
        for (long[] row : dp[n]) Arrays.fill(row, 1);
        for (int i = n - 1; i >= 0; i--)
            for (int a = 0; a < 2; a++)
                for (int l = 0; l < 3; l++) {
                    long total = dp[i + 1][a][0];
                    if (a == 0) total += dp[i + 1][1][0];
                    if (l < 2) total += dp[i + 1][a][l + 1];
                    dp[i][a][l] = total % MOD;
                }
        return (int) dp[0][0][0];
    }
}`,
          cpp: r`class Solution {
public:
    int checkRecord(int n) {
        const long long MOD = 1'000'000'007;
        vector<array<array<long long, 3>, 2>> dp(n + 1);
        for (auto& row : dp[n]) row.fill(1);
        for (int i = n - 1; i >= 0; i--)
            for (int a = 0; a < 2; a++)
                for (int l = 0; l < 3; l++) {
                    long long total = dp[i + 1][a][0];
                    if (a == 0) total += dp[i + 1][1][0];
                    if (l < 2) total += dp[i + 1][a][l + 1];
                    dp[i][a][l] = total % MOD;
                }
        return dp[0][0][0];
    }
};`,
          python: r`class Solution:
    def checkRecord(self, n: int) -> int:
        MOD = 10**9 + 7
        dp = [[[0] * 3 for _ in range(2)] for _ in range(n + 1)]
        dp[n] = [[1] * 3 for _ in range(2)]
        for i in range(n - 1, -1, -1):
            for a in range(2):
                for l in range(3):
                    total = dp[i + 1][a][0]
                    if a == 0:
                        total += dp[i + 1][1][0]
                    if l < 2:
                        total += dp[i + 1][a][l + 1]
                    dp[i][a][l] = total % MOD
        return dp[0][0][0]`,
          javascript: r`var checkRecord = function(n) {
    const MOD = 1e9 + 7;
    const dp = Array.from({ length: n + 1 }, () => [[0, 0, 0], [0, 0, 0]]);
    dp[n] = [[1, 1, 1], [1, 1, 1]];
    for (let i = n - 1; i >= 0; i--)
        for (let a = 0; a < 2; a++)
            for (let l = 0; l < 3; l++) {
                let total = dp[i + 1][a][0];
                if (a === 0) total += dp[i + 1][1][0];
                if (l < 2) total += dp[i + 1][a][l + 1];
                dp[i][a][l] = total % MOD;
            }
    return dp[0][0][0];
};`,
        },
      },
      {
        level: 'Optimal', name: 'Roll the six states',
        idea: 'Each day only needs the next day\'s six numbers, so keep two 2 × 3 grids and swap them.',
        steps: [
          'Start `cur[a][l] = 1` for all six states (records of length 0 remaining).',
          'Repeat n times: `next[a][l] = cur[a][0] + (a == 0 ? cur[1][0] : 0) + (l < 2 ? cur[a][l + 1] : 0)` mod 10⁹ + 7; then `cur = next`.',
          'Return `cur[0][0]`.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'Six numbers per step. (The transition is a fixed 6 × 6 matrix, so matrix fast power would give O(log n), but O(n) is what interviews expect for n ≤ 10⁵.)',
        code: {
          java: r`class Solution {
    public int checkRecord(int n) {
        final int MOD = 1_000_000_007;
        long[][] cur = { { 1, 1, 1 }, { 1, 1, 1 } };
        for (int i = 0; i < n; i++) {
            long[][] next = new long[2][3];
            for (int a = 0; a < 2; a++)
                for (int l = 0; l < 3; l++) {
                    long total = cur[a][0];
                    if (a == 0) total += cur[1][0];
                    if (l < 2) total += cur[a][l + 1];
                    next[a][l] = total % MOD;
                }
            cur = next;
        }
        return (int) cur[0][0];
    }
}`,
          cpp: r`class Solution {
public:
    int checkRecord(int n) {
        const long long MOD = 1'000'000'007;
        long long cur[2][3] = {{1, 1, 1}, {1, 1, 1}}, next[2][3];
        for (int i = 0; i < n; i++) {
            for (int a = 0; a < 2; a++)
                for (int l = 0; l < 3; l++) {
                    long long total = cur[a][0];
                    if (a == 0) total += cur[1][0];
                    if (l < 2) total += cur[a][l + 1];
                    next[a][l] = total % MOD;
                }
            memcpy(cur, next, sizeof cur);
        }
        return cur[0][0];
    }
};`,
          python: r`class Solution:
    def checkRecord(self, n: int) -> int:
        MOD = 10**9 + 7
        cur = [[1, 1, 1], [1, 1, 1]]
        for _ in range(n):
            cur = [[(cur[a][0] + (cur[1][0] if a == 0 else 0) + (cur[a][l + 1] if l < 2 else 0)) % MOD
                    for l in range(3)] for a in range(2)]
        return cur[0][0]`,
          javascript: r`var checkRecord = function(n) {
    const MOD = 1e9 + 7;
    let cur = [[1, 1, 1], [1, 1, 1]];
    for (let i = 0; i < n; i++) {
        const next = [[0, 0, 0], [0, 0, 0]];
        for (let a = 0; a < 2; a++)
            for (let l = 0; l < 3; l++)
                next[a][l] = (cur[a][0] + (a === 0 ? cur[1][0] : 0) + (l < 2 ? cur[a][l + 1] : 0)) % MOD;
        cur = next;
    }
    return cur[0][0];
};`,
        },
      },
    ],
  },

  'beautiful-arrangement': {
    pattern: 'Bitmask DP: the set of numbers already used decides the next position',
    approaches: [
      {
        level: 'Brute force', name: 'Generate every permutation, then check',
        idea: 'List all n! permutations by swapping, and count those where every position passes the divisibility rule.',
        steps: [
          'Recursively fix each position by swapping every remaining number into it.',
          'At a full permutation, check `perm[i] % i == 0 || i % perm[i] == 0` for every position; count it if all pass.',
        ],
        time: 'O(n!·n)', space: 'O(n)',
        why: 'All n! orders are built, each checked in O(n). n = 15 means 1.3·10¹² permutations — far too many.',
        timesOut: [4, 'generated'],
        code: {
          java: r`class Solution {
    private int count = 0;

    public int countArrangement(int n) {
        int[] perm = new int[n];
        for (int i = 0; i < n; i++) perm[i] = i + 1;
        permute(perm, 0);
        return count;
    }

    private void permute(int[] a, int pos) {
        if (pos == a.length) {
            for (int i = 0; i < a.length; i++)
                if (a[i] % (i + 1) != 0 && (i + 1) % a[i] != 0) return;
            count++;
            return;
        }
        for (int i = pos; i < a.length; i++) {
            int t = a[pos]; a[pos] = a[i]; a[i] = t;
            permute(a, pos + 1);
            t = a[pos]; a[pos] = a[i]; a[i] = t;
        }
    }
}`,
          cpp: r`class Solution {
public:
    int countArrangement(int n) {
        vector<int> perm(n);
        iota(perm.begin(), perm.end(), 1);
        int count = 0;
        do {
            bool ok = true;
            for (int i = 0; i < n && ok; i++)
                if (perm[i] % (i + 1) != 0 && (i + 1) % perm[i] != 0) ok = false;
            if (ok) count++;
        } while (next_permutation(perm.begin(), perm.end()));
        return count;
    }
};`,
          python: r`class Solution:
    def countArrangement(self, n: int) -> int:
        return sum(
            all(x % i == 0 or i % x == 0 for i, x in enumerate(perm, 1))
            for perm in permutations(range(1, n + 1))
        )`,
          javascript: r`var countArrangement = function(n) {
    const a = Array.from({ length: n }, (_, i) => i + 1);
    let count = 0;
    const permute = (pos) => {
        if (pos === n) {
            for (let i = 0; i < n; i++) if (a[i] % (i + 1) !== 0 && (i + 1) % a[i] !== 0) return;
            count++;
            return;
        }
        for (let i = pos; i < n; i++) {
            [a[pos], a[i]] = [a[i], a[pos]];
            permute(pos + 1);
            [a[pos], a[i]] = [a[i], a[pos]];
        }
    };
    permute(0);
    return count;
};`,
        },
      },
      {
        level: 'Better', name: 'Backtracking that only places valid numbers',
        idea: 'Fill positions 1, 2, … in order, and at each position only try unused numbers that already satisfy the rule there. Invalid prefixes are cut off immediately.',
        steps: [
          '`place(pos)`: if `pos > n`, return 1.',
          'For each unused `x` with `x % pos == 0 || pos % x == 0`: mark it used, add `place(pos + 1)`, unmark.',
          'Return the total.',
        ],
        time: 'O(n!)', space: 'O(n)',
        why: 'Still exponential in the worst case, but pruning keeps the search to a few hundred thousand calls for n = 15, because most numbers fail at most positions.',
        code: {
          java: r`class Solution {
    public int countArrangement(int n) {
        return place(n, 1, new boolean[n + 1]);
    }

    private int place(int n, int pos, boolean[] used) {
        if (pos > n) return 1;
        int total = 0;
        for (int x = 1; x <= n; x++)
            if (!used[x] && (x % pos == 0 || pos % x == 0)) {
                used[x] = true;
                total += place(n, pos + 1, used);
                used[x] = false;
            }
        return total;
    }
}`,
          cpp: r`class Solution {
    int place(int n, int pos, vector<bool>& used) {
        if (pos > n) return 1;
        int total = 0;
        for (int x = 1; x <= n; x++)
            if (!used[x] && (x % pos == 0 || pos % x == 0)) {
                used[x] = true;
                total += place(n, pos + 1, used);
                used[x] = false;
            }
        return total;
    }
public:
    int countArrangement(int n) {
        vector<bool> used(n + 1, false);
        return place(n, 1, used);
    }
};`,
          python: r`class Solution:
    def countArrangement(self, n: int) -> int:
        used = [False] * (n + 1)
        def place(pos):
            if pos > n:
                return 1
            total = 0
            for x in range(1, n + 1):
                if not used[x] and (x % pos == 0 or pos % x == 0):
                    used[x] = True
                    total += place(pos + 1)
                    used[x] = False
            return total
        return place(1)`,
          javascript: r`var countArrangement = function(n) {
    const used = new Array(n + 1).fill(false);
    const place = (pos) => {
        if (pos > n) return 1;
        let total = 0;
        for (let x = 1; x <= n; x++)
            if (!used[x] && (x % pos === 0 || pos % x === 0)) {
                used[x] = true;
                total += place(pos + 1);
                used[x] = false;
            }
        return total;
    };
    return place(1);
};`,
        },
      },
      {
        level: 'Optimal', name: 'Bitmask DP over the set of used numbers',
        idea: 'If `mask` is the set of numbers placed so far, the next position is `popcount(mask) + 1` — the order inside the prefix no longer matters. So count ways per mask.',
        steps: [
          '`dp[0] = 1`.',
          'For each mask in increasing order with `dp[mask] > 0`: `pos = popcount(mask) + 1`.',
          'For each unused number `x` that fits `pos`: `dp[mask | bit(x)] += dp[mask]`.',
          'Return `dp[full]`.',
        ],
        time: 'O(n·2ⁿ)', space: 'O(2ⁿ)',
        why: '2ⁿ masks × n candidate numbers — about 5·10⁵ steps for n = 15, regardless of how the pruning would behave.',
        code: {
          java: r`class Solution {
    public int countArrangement(int n) {
        int[] dp = new int[1 << n];
        dp[0] = 1;
        for (int mask = 0; mask < (1 << n); mask++) {
            if (dp[mask] == 0) continue;
            int pos = Integer.bitCount(mask) + 1;
            for (int x = 1; x <= n; x++)
                if ((mask >> (x - 1) & 1) == 0 && (x % pos == 0 || pos % x == 0))
                    dp[mask | 1 << (x - 1)] += dp[mask];
        }
        return dp[(1 << n) - 1];
    }
}`,
          cpp: r`class Solution {
public:
    int countArrangement(int n) {
        vector<int> dp(1 << n, 0);
        dp[0] = 1;
        for (int mask = 0; mask < (1 << n); mask++) {
            if (dp[mask] == 0) continue;
            int pos = __builtin_popcount(mask) + 1;
            for (int x = 1; x <= n; x++)
                if (!(mask >> (x - 1) & 1) && (x % pos == 0 || pos % x == 0))
                    dp[mask | 1 << (x - 1)] += dp[mask];
        }
        return dp[(1 << n) - 1];
    }
};`,
          python: r`class Solution:
    def countArrangement(self, n: int) -> int:
        dp = [0] * (1 << n)
        dp[0] = 1
        for mask in range(1 << n):
            if not dp[mask]:
                continue
            pos = mask.bit_count() + 1
            for x in range(1, n + 1):
                if not mask >> (x - 1) & 1 and (x % pos == 0 or pos % x == 0):
                    dp[mask | 1 << (x - 1)] += dp[mask]
        return dp[-1]`,
          javascript: r`var countArrangement = function(n) {
    const dp = new Array(1 << n).fill(0);
    dp[0] = 1;
    for (let mask = 0; mask < (1 << n); mask++) {
        if (dp[mask] === 0) continue;
        let pos = 1;
        for (let m = mask; m; m &= m - 1) pos++;
        for (let x = 1; x <= n; x++)
            if (!((mask >> (x - 1)) & 1) && (x % pos === 0 || pos % x === 0))
                dp[mask | (1 << (x - 1))] += dp[mask];
    }
    return dp[(1 << n) - 1];
};`,
        },
      },
    ],
  },

  'partition-to-k-equal-sum-subsets': {
    pattern: 'Bitmask DP: for each set of used numbers, remember how full the current bucket is',
    approaches: [
      {
        level: 'Brute force', name: 'Put each number into each bucket',
        idea: 'Try every way of assigning each number to one of k buckets, and accept an assignment where every bucket sums to the target.',
        steps: [
          'Fail fast if the total is not divisible by k; `target = total / k`.',
          '`assign(i)`: at `i == n`, check that every bucket equals `target`.',
          'Otherwise, for each bucket: add `nums[i]`, recurse, take it back.',
        ],
        time: 'O(kⁿ)', space: 'O(n + k)',
        why: 'Each of n numbers has k choices, with no pruning.',
        code: {
          java: r`class Solution {
    public boolean canPartitionKSubsets(int[] nums, int k) {
        int total = 0;
        for (int x : nums) total += x;
        if (total % k != 0) return false;
        return assign(nums, 0, new int[k], total / k);
    }

    private boolean assign(int[] nums, int i, int[] buckets, int target) {
        if (i == nums.length) {
            for (int b : buckets) if (b != target) return false;
            return true;
        }
        for (int b = 0; b < buckets.length; b++) {
            buckets[b] += nums[i];
            if (assign(nums, i + 1, buckets, target)) return true;
            buckets[b] -= nums[i];
        }
        return false;
    }
}`,
          cpp: r`class Solution {
    bool assign(vector<int>& nums, int i, vector<int>& buckets, int target) {
        if (i == (int) nums.size()) {
            for (int b : buckets) if (b != target) return false;
            return true;
        }
        for (auto& b : buckets) {
            b += nums[i];
            if (assign(nums, i + 1, buckets, target)) return true;
            b -= nums[i];
        }
        return false;
    }
public:
    bool canPartitionKSubsets(vector<int>& nums, int k) {
        int total = accumulate(nums.begin(), nums.end(), 0);
        if (total % k != 0) return false;
        vector<int> buckets(k, 0);
        return assign(nums, 0, buckets, total / k);
    }
};`,
          python: r`class Solution:
    def canPartitionKSubsets(self, nums: List[int], k: int) -> bool:
        total = sum(nums)
        if total % k:
            return False
        target, buckets = total // k, [0] * k
        def assign(i):
            if i == len(nums):
                return all(b == target for b in buckets)
            for b in range(k):
                buckets[b] += nums[i]
                if assign(i + 1):
                    return True
                buckets[b] -= nums[i]
            return False
        return assign(0)`,
          javascript: r`var canPartitionKSubsets = function(nums, k) {
    const total = nums.reduce((a, b) => a + b, 0);
    if (total % k !== 0) return false;
    const target = total / k, buckets = new Array(k).fill(0);
    const assign = (i) => {
        if (i === nums.length) return buckets.every((b) => b === target);
        for (let b = 0; b < k; b++) {
            buckets[b] += nums[i];
            if (assign(i + 1)) return true;
            buckets[b] -= nums[i];
        }
        return false;
    };
    return assign(0);
};`,
        },
      },
      {
        level: 'Better', name: 'Pruned backtracking (largest first)',
        idea: 'Same search, with three cuts: place the largest numbers first, never let a bucket exceed the target, and if a number fails in an empty bucket, it will fail in every other empty bucket too.',
        steps: [
          'Check divisibility and that the largest number ≤ `target`; sort descending.',
          'For `nums[i]`, try each bucket where `bucket + nums[i] ≤ target`.',
          'After trying an empty bucket, stop — the other empty buckets are identical.',
          'Success when every number is placed (each bucket is then exactly `target`).',
        ],
        time: 'O(kⁿ)', space: 'O(n + k)',
        why: 'The same worst case, but the pruning removes symmetric and overfull branches, which in practice cuts the search drastically.',
        code: {
          java: r`class Solution {
    public boolean canPartitionKSubsets(int[] nums, int k) {
        int total = 0;
        for (int x : nums) total += x;
        Arrays.sort(nums);
        if (total % k != 0 || nums[nums.length - 1] > total / k) return false;
        return assign(nums, nums.length - 1, new int[k], total / k);
    }

    // nums is sorted ascending, so walk i downwards to place the largest first
    private boolean assign(int[] nums, int i, int[] buckets, int target) {
        if (i < 0) return true;
        for (int b = 0; b < buckets.length; b++) {
            if (buckets[b] + nums[i] <= target) {
                buckets[b] += nums[i];
                if (assign(nums, i - 1, buckets, target)) return true;
                buckets[b] -= nums[i];
            }
            if (buckets[b] == 0) break;
        }
        return false;
    }
}`,
          cpp: r`class Solution {
    bool assign(vector<int>& nums, int i, vector<int>& buckets, int target) {
        if (i == (int) nums.size()) return true;
        for (auto& b : buckets) {
            if (b + nums[i] <= target) {
                b += nums[i];
                if (assign(nums, i + 1, buckets, target)) return true;
                b -= nums[i];
            }
            if (b == 0) break;
        }
        return false;
    }
public:
    bool canPartitionKSubsets(vector<int>& nums, int k) {
        int total = accumulate(nums.begin(), nums.end(), 0);
        sort(nums.rbegin(), nums.rend());
        if (total % k != 0 || nums[0] > total / k) return false;
        vector<int> buckets(k, 0);
        return assign(nums, 0, buckets, total / k);
    }
};`,
          python: r`class Solution:
    def canPartitionKSubsets(self, nums: List[int], k: int) -> bool:
        total = sum(nums)
        nums = sorted(nums, reverse=True)
        if total % k or nums[0] > total // k:
            return False
        target, buckets = total // k, [0] * k
        def assign(i):
            if i == len(nums):
                return True
            for b in range(k):
                if buckets[b] + nums[i] <= target:
                    buckets[b] += nums[i]
                    if assign(i + 1):
                        return True
                    buckets[b] -= nums[i]
                if buckets[b] == 0:
                    break
            return False
        return assign(0)`,
          javascript: r`var canPartitionKSubsets = function(nums, k) {
    const total = nums.reduce((a, b) => a + b, 0);
    const sorted = [...nums].sort((a, b) => b - a);
    if (total % k !== 0 || sorted[0] > total / k) return false;
    const target = total / k, buckets = new Array(k).fill(0);
    const assign = (i) => {
        if (i === sorted.length) return true;
        for (let b = 0; b < k; b++) {
            if (buckets[b] + sorted[i] <= target) {
                buckets[b] += sorted[i];
                if (assign(i + 1)) return true;
                buckets[b] -= sorted[i];
            }
            if (buckets[b] === 0) break;
        }
        return false;
    };
    return assign(0);
};`,
        },
      },
      {
        level: 'Optimal', name: 'Bitmask DP on the used set',
        idea: 'Fill buckets one after another. Whatever order the numbers in `mask` were placed in, the current bucket holds `sum(mask) % target`. So for each mask just remember whether it is reachable (and that remainder).',
        steps: [
          'Check divisibility; `target = total / k`. `fill[mask] = −1` (unreachable) except `fill[0] = 0`.',
          'For each reachable mask, for each unused `i` with `fill[mask] + nums[i] ≤ target`: `fill[mask | bit(i)] = (fill[mask] + nums[i]) % target`.',
          'Return `fill[full] == 0`.',
        ],
        time: 'O(n·2ⁿ)', space: 'O(2ⁿ)',
        why: '2ⁿ masks × n numbers ≈ 10⁶ steps for n = 16. The `≤ target` check means a bucket is never overfilled, so reaching the full mask means every bucket was filled exactly.',
        code: {
          java: r`class Solution {
    public boolean canPartitionKSubsets(int[] nums, int k) {
        int total = 0, n = nums.length;
        for (int x : nums) total += x;
        if (total % k != 0) return false;
        int target = total / k;
        int[] fill = new int[1 << n];
        Arrays.fill(fill, -1);
        fill[0] = 0;
        for (int mask = 0; mask < (1 << n); mask++) {
            if (fill[mask] < 0) continue;
            for (int i = 0; i < n; i++)
                if ((mask >> i & 1) == 0 && fill[mask] + nums[i] <= target)
                    fill[mask | 1 << i] = (fill[mask] + nums[i]) % target;
        }
        return fill[(1 << n) - 1] == 0;
    }
}`,
          cpp: r`class Solution {
public:
    bool canPartitionKSubsets(vector<int>& nums, int k) {
        int total = accumulate(nums.begin(), nums.end(), 0), n = nums.size();
        if (total % k != 0) return false;
        int target = total / k;
        vector<int> fill(1 << n, -1);
        fill[0] = 0;
        for (int mask = 0; mask < (1 << n); mask++) {
            if (fill[mask] < 0) continue;
            for (int i = 0; i < n; i++)
                if (!(mask >> i & 1) && fill[mask] + nums[i] <= target)
                    fill[mask | 1 << i] = (fill[mask] + nums[i]) % target;
        }
        return fill[(1 << n) - 1] == 0;
    }
};`,
          python: r`class Solution:
    def canPartitionKSubsets(self, nums: List[int], k: int) -> bool:
        total, n = sum(nums), len(nums)
        if total % k:
            return False
        target = total // k
        fill = [-1] * (1 << n)
        fill[0] = 0
        for mask in range(1 << n):
            if fill[mask] < 0:
                continue
            for i in range(n):
                if not mask >> i & 1 and fill[mask] + nums[i] <= target:
                    fill[mask | 1 << i] = (fill[mask] + nums[i]) % target
        return fill[-1] == 0`,
          javascript: r`var canPartitionKSubsets = function(nums, k) {
    const total = nums.reduce((a, b) => a + b, 0), n = nums.length;
    if (total % k !== 0) return false;
    const target = total / k, fill = new Array(1 << n).fill(-1);
    fill[0] = 0;
    for (let mask = 0; mask < (1 << n); mask++) {
        if (fill[mask] < 0) continue;
        for (let i = 0; i < n; i++)
            if (!((mask >> i) & 1) && fill[mask] + nums[i] <= target)
                fill[mask | (1 << i)] = (fill[mask] + nums[i]) % target;
    }
    return fill[(1 << n) - 1] === 0;
};`,
        },
      },
    ],
  },

  'minimum-number-of-work-sessions-to-finish-the-tasks': {
    pattern: 'Bitmask DP storing (sessions used, load of the last session) per set of finished tasks',
    approaches: [
      {
        level: 'Brute force', name: 'Backtracking over session assignments',
        idea: 'Take tasks one at a time and put each into any open session with room, or open a new session. Record the fewest sessions over all complete assignments.',
        steps: [
          '`assign(i, used)`: at `i == n`, update the best with `used`.',
          'For each open session `s < used` with `loads[s] + tasks[i] ≤ sessionTime`: add it there and recurse.',
          'Also try opening session `used` with just this task.',
        ],
        time: 'O(Bₙ·n)', space: 'O(n)',
        why: 'It explores every way to group the tasks — the Bell number Bₙ of them (about 1.9·10⁸ for n = 14).',
        code: {
          java: r`class Solution {
    private int best;

    public int minSessions(int[] tasks, int sessionTime) {
        best = tasks.length;
        assign(tasks, sessionTime, 0, new int[tasks.length], 0);
        return best;
    }

    private void assign(int[] tasks, int cap, int i, int[] loads, int used) {
        if (i == tasks.length) {
            best = Math.min(best, used);
            return;
        }
        for (int s = 0; s < used; s++)
            if (loads[s] + tasks[i] <= cap) {
                loads[s] += tasks[i];
                assign(tasks, cap, i + 1, loads, used);
                loads[s] -= tasks[i];
            }
        loads[used] = tasks[i];
        assign(tasks, cap, i + 1, loads, used + 1);
        loads[used] = 0;
    }
}`,
          cpp: r`class Solution {
    int best;
    void assign(vector<int>& tasks, int cap, int i, vector<int>& loads, int used) {
        if (i == (int) tasks.size()) {
            best = min(best, used);
            return;
        }
        for (int s = 0; s < used; s++)
            if (loads[s] + tasks[i] <= cap) {
                loads[s] += tasks[i];
                assign(tasks, cap, i + 1, loads, used);
                loads[s] -= tasks[i];
            }
        loads[used] = tasks[i];
        assign(tasks, cap, i + 1, loads, used + 1);
        loads[used] = 0;
    }
public:
    int minSessions(vector<int>& tasks, int sessionTime) {
        best = tasks.size();
        vector<int> loads(tasks.size(), 0);
        assign(tasks, sessionTime, 0, loads, 0);
        return best;
    }
};`,
          python: r`class Solution:
    def minSessions(self, tasks: List[int], sessionTime: int) -> int:
        n = len(tasks)
        loads, best = [0] * n, n
        def assign(i, used):
            nonlocal best
            if i == n:
                best = min(best, used)
                return
            for s in range(used):
                if loads[s] + tasks[i] <= sessionTime:
                    loads[s] += tasks[i]
                    assign(i + 1, used)
                    loads[s] -= tasks[i]
            loads[used] = tasks[i]
            assign(i + 1, used + 1)
            loads[used] = 0
        assign(0, 0)
        return best`,
          javascript: r`var minSessions = function(tasks, sessionTime) {
    const n = tasks.length, loads = new Array(n).fill(0);
    let best = n;
    const assign = (i, used) => {
        if (i === n) {
            best = Math.min(best, used);
            return;
        }
        for (let s = 0; s < used; s++)
            if (loads[s] + tasks[i] <= sessionTime) {
                loads[s] += tasks[i];
                assign(i + 1, used);
                loads[s] -= tasks[i];
            }
        loads[used] = tasks[i];
        assign(i + 1, used + 1);
        loads[used] = 0;
    };
    assign(0, 0);
    return best;
};`,
        },
      },
      {
        level: 'Better', name: 'Subset DP: peel off one full session at a time',
        idea: '`dp[mask]` = fewest sessions to finish the tasks in `mask`. The last session is some sub-mask that fits in one session; the rest is a smaller problem.',
        steps: [
          'Precompute `sum[mask]` for every mask.',
          '`dp[0] = 0`; for each mask, try every non-empty sub-mask `sub` with `sum[sub] ≤ sessionTime`: `dp[mask] = min(dp[mask], dp[mask ^ sub] + 1)`.',
          'Return `dp[full]`.',
        ],
        time: 'O(3ⁿ)', space: 'O(2ⁿ)',
        why: 'Enumerating all sub-masks of all masks costs 3ⁿ in total (each task is out, in the rest, or in the session) — about 4.8·10⁶ for n = 14.',
        code: {
          java: r`class Solution {
    public int minSessions(int[] tasks, int sessionTime) {
        int n = tasks.length, full = 1 << n;
        int[] sum = new int[full], dp = new int[full];
        for (int mask = 1; mask < full; mask++)
            sum[mask] = sum[mask & (mask - 1)] + tasks[Integer.numberOfTrailingZeros(mask)];
        for (int mask = 1; mask < full; mask++) {
            dp[mask] = n;
            for (int sub = mask; sub > 0; sub = (sub - 1) & mask)
                if (sum[sub] <= sessionTime) dp[mask] = Math.min(dp[mask], dp[mask ^ sub] + 1);
        }
        return dp[full - 1];
    }
}`,
          cpp: r`class Solution {
public:
    int minSessions(vector<int>& tasks, int sessionTime) {
        int n = tasks.size(), full = 1 << n;
        vector<int> sum(full, 0), dp(full, 0);
        for (int mask = 1; mask < full; mask++)
            sum[mask] = sum[mask & (mask - 1)] + tasks[__builtin_ctz(mask)];
        for (int mask = 1; mask < full; mask++) {
            dp[mask] = n;
            for (int sub = mask; sub > 0; sub = (sub - 1) & mask)
                if (sum[sub] <= sessionTime) dp[mask] = min(dp[mask], dp[mask ^ sub] + 1);
        }
        return dp[full - 1];
    }
};`,
          python: r`class Solution:
    def minSessions(self, tasks: List[int], sessionTime: int) -> int:
        n = len(tasks)
        full = 1 << n
        total = [0] * full
        for mask in range(1, full):
            low = mask & -mask
            total[mask] = total[mask ^ low] + tasks[low.bit_length() - 1]
        dp = [0] * full
        for mask in range(1, full):
            best, sub = n, mask
            while sub:
                if total[sub] <= sessionTime and dp[mask ^ sub] + 1 < best:
                    best = dp[mask ^ sub] + 1
                sub = (sub - 1) & mask
            dp[mask] = best
        return dp[-1]`,
          javascript: r`var minSessions = function(tasks, sessionTime) {
    const n = tasks.length, full = 1 << n;
    const sum = new Array(full).fill(0), dp = new Array(full).fill(0);
    for (let mask = 1; mask < full; mask++) {
        const low = mask & -mask;
        sum[mask] = sum[mask ^ low] + tasks[31 - Math.clz32(low)];
    }
    for (let mask = 1; mask < full; mask++) {
        dp[mask] = n;
        for (let sub = mask; sub > 0; sub = (sub - 1) & mask)
            if (sum[sub] <= sessionTime) dp[mask] = Math.min(dp[mask], dp[mask ^ sub] + 1);
    }
    return dp[full - 1];
};`,
        },
      },
      {
        level: 'Optimal', name: 'Bitmask DP on (sessions, last load)',
        idea: 'Add tasks one at a time. For each set `mask` of finished tasks keep the best pair (sessions used, hours in the last open session), compared first by sessions and then by load. Adding a task either fits in the last session or opens a new one.',
        steps: [
          '`best[0] = (1, 0)` — one empty session open.',
          'For each mask and each unfinished task `t`: if `load + tasks[t] ≤ sessionTime` the pair becomes `(c, load + tasks[t])`, else `(c + 1, tasks[t])`.',
          'Keep the smaller pair for `mask | bit(t)`.',
          'Return the session count of `best[full]`.',
        ],
        time: 'O(n·2ⁿ)', space: 'O(2ⁿ)',
        why: '2ⁿ masks × n tasks ≈ 2.3·10⁵ steps for n = 14. Fewer sessions always wins regardless of load, because `(c, anything)` can be turned into `(c + 1, 0)` by opening a fresh session, which beats any `(c + 1, load)`.',
        code: {
          java: r`class Solution {
    public int minSessions(int[] tasks, int sessionTime) {
        int n = tasks.length, full = 1 << n;
        int[] count = new int[full], load = new int[full];
        Arrays.fill(count, Integer.MAX_VALUE);
        count[0] = 1;
        for (int mask = 0; mask < full; mask++)
            for (int t = 0; t < n; t++) {
                if ((mask >> t & 1) == 1) continue;
                int c = count[mask], l = load[mask] + tasks[t];
                if (l > sessionTime) { c++; l = tasks[t]; }
                int next = mask | 1 << t;
                if (c < count[next] || (c == count[next] && l < load[next])) {
                    count[next] = c;
                    load[next] = l;
                }
            }
        return count[full - 1];
    }
}`,
          cpp: r`class Solution {
public:
    int minSessions(vector<int>& tasks, int sessionTime) {
        int n = tasks.size(), full = 1 << n;
        vector<pair<int, int>> best(full, {INT_MAX, 0}); // (sessions, load of the last one)
        best[0] = {1, 0};
        for (int mask = 0; mask < full; mask++)
            for (int t = 0; t < n; t++) {
                if (mask >> t & 1) continue;
                auto [c, l] = best[mask];
                l += tasks[t];
                if (l > sessionTime) { c++; l = tasks[t]; }
                best[mask | 1 << t] = min(best[mask | 1 << t], {c, l});
            }
        return best[full - 1].first;
    }
};`,
          python: r`class Solution:
    def minSessions(self, tasks: List[int], sessionTime: int) -> int:
        n = len(tasks)
        full = 1 << n
        best = [(inf, 0)] * full  # (sessions, load of the last one)
        best[0] = (1, 0)
        for mask in range(full):
            c, load = best[mask]
            for t in range(n):
                if mask >> t & 1:
                    continue
                cand = (c, load + tasks[t]) if load + tasks[t] <= sessionTime else (c + 1, tasks[t])
                nxt = mask | 1 << t
                if cand < best[nxt]:
                    best[nxt] = cand
        return best[-1][0]`,
          javascript: r`var minSessions = function(tasks, sessionTime) {
    const n = tasks.length, full = 1 << n;
    const count = new Array(full).fill(Infinity), load = new Array(full).fill(0);
    count[0] = 1;
    for (let mask = 0; mask < full; mask++)
        for (let t = 0; t < n; t++) {
            if ((mask >> t) & 1) continue;
            let c = count[mask], l = load[mask] + tasks[t];
            if (l > sessionTime) { c++; l = tasks[t]; }
            const next = mask | (1 << t);
            if (c < count[next] || (c === count[next] && l < load[next])) {
                count[next] = c;
                load[next] = l;
            }
        }
    return count[full - 1];
};`,
        },
      },
    ],
  },

  'shortest-path-visiting-all-nodes': {
    pattern: 'BFS over (current node, visited set) states — bitmask state-space search',
    approaches: [
      {
        level: 'Brute force', name: 'Try every visiting order',
        idea: 'Any walk is described by the order in which nodes are first reached; between two consecutive new nodes, the walk should take a shortest path. So compute all-pairs distances with BFS and try every order.',
        steps: [
          'BFS from every node to get `dist[u][v]`.',
          'For every permutation of the nodes, sum `dist` between consecutive nodes.',
          'Return the smallest sum.',
        ],
        time: 'O(n!·n)', space: 'O(n²)',
        why: 'n! orders — fine for a handful of nodes, about 4.8·10⁸ for n = 12.',
        code: {
          java: r`class Solution {
    private int[][] dist;
    private int best;

    public int shortestPathLength(int[][] graph) {
        int n = graph.length;
        dist = new int[n][n];
        for (int s = 0; s < n; s++) {
            Arrays.fill(dist[s], -1);
            dist[s][s] = 0;
            ArrayDeque<Integer> q = new ArrayDeque<>();
            q.add(s);
            while (!q.isEmpty()) {
                int u = q.poll();
                for (int v : graph[u])
                    if (dist[s][v] < 0) { dist[s][v] = dist[s][u] + 1; q.add(v); }
            }
        }
        best = Integer.MAX_VALUE;
        boolean[] used = new boolean[n];
        for (int s = 0; s < n; s++) {
            used[s] = true;
            tour(s, 1, 0, used);
            used[s] = false;
        }
        return best;
    }

    private void tour(int at, int seen, int len, boolean[] used) {
        if (seen == used.length) { best = Math.min(best, len); return; }
        for (int v = 0; v < used.length; v++)
            if (!used[v]) {
                used[v] = true;
                tour(v, seen + 1, len + dist[at][v], used);
                used[v] = false;
            }
    }
}`,
          cpp: r`class Solution {
public:
    int shortestPathLength(vector<vector<int>>& graph) {
        int n = graph.size();
        vector<vector<int>> dist(n, vector<int>(n, -1));
        for (int s = 0; s < n; s++) {
            dist[s][s] = 0;
            queue<int> q;
            q.push(s);
            while (!q.empty()) {
                int u = q.front();
                q.pop();
                for (int v : graph[u])
                    if (dist[s][v] < 0) { dist[s][v] = dist[s][u] + 1; q.push(v); }
            }
        }
        vector<int> order(n);
        iota(order.begin(), order.end(), 0);
        int best = INT_MAX;
        do {
            int len = 0;
            for (int i = 1; i < n; i++) len += dist[order[i - 1]][order[i]];
            best = min(best, len);
        } while (next_permutation(order.begin(), order.end()));
        return best;
    }
};`,
          python: r`class Solution:
    def shortestPathLength(self, graph: List[List[int]]) -> int:
        n = len(graph)
        dist = [[-1] * n for _ in range(n)]
        for s in range(n):
            dist[s][s] = 0
            q = deque([s])
            while q:
                u = q.popleft()
                for v in graph[u]:
                    if dist[s][v] < 0:
                        dist[s][v] = dist[s][u] + 1
                        q.append(v)
        return min(sum(dist[a][b] for a, b in zip(order, order[1:])) for order in permutations(range(n)))`,
          javascript: r`var shortestPathLength = function(graph) {
    const n = graph.length;
    const dist = Array.from({ length: n }, () => new Array(n).fill(-1));
    for (let s = 0; s < n; s++) {
        dist[s][s] = 0;
        const q = [s];
        for (let head = 0; head < q.length; head++) {
            const u = q[head];
            for (const v of graph[u]) if (dist[s][v] < 0) { dist[s][v] = dist[s][u] + 1; q.push(v); }
        }
    }
    let best = Infinity;
    const used = new Array(n).fill(false);
    const tour = (at, seen, len) => {
        if (seen === n) { best = Math.min(best, len); return; }
        for (let v = 0; v < n; v++)
            if (!used[v]) {
                used[v] = true;
                tour(v, seen + 1, len + dist[at][v]);
                used[v] = false;
            }
    };
    for (let s = 0; s < n; s++) {
        used[s] = true;
        tour(s, 1, 0);
        used[s] = false;
    }
    return best;
};`,
        },
        timesOut: ['generated'],
      },
      {
        level: 'Optimal', name: 'Multi-source BFS over (node, visited mask)',
        idea: 'A state is "standing at node u having visited set mask". Every edge costs 1, so BFS from all starting states `(i, {i})` at once finds the fewest steps to any state whose mask contains every node.',
        steps: [
          'Push `(i, 1 << i)` for every node with distance 0, marking them seen.',
          'Pop a state; if its mask is full, return its distance.',
          'For each neighbour `v`: the new state is `(v, mask | 1 << v)`; push it if unseen.',
        ],
        time: 'O(2ⁿ·n²)', space: 'O(2ⁿ·n)',
        why: 'n·2ⁿ states, each scanning up to n neighbours. (A Held-Karp DP over `dist` has the same bound; BFS is simpler because edges are unweighted.)',
        code: {
          java: r`class Solution {
    public int shortestPathLength(int[][] graph) {
        int n = graph.length, full = (1 << n) - 1;
        boolean[][] seen = new boolean[n][1 << n];
        ArrayDeque<int[]> q = new ArrayDeque<>();
        for (int i = 0; i < n; i++) {
            seen[i][1 << i] = true;
            q.add(new int[] { i, 1 << i, 0 });
        }
        while (!q.isEmpty()) {
            int[] s = q.poll();
            if (s[1] == full) return s[2];
            for (int v : graph[s[0]]) {
                int mask = s[1] | 1 << v;
                if (!seen[v][mask]) {
                    seen[v][mask] = true;
                    q.add(new int[] { v, mask, s[2] + 1 });
                }
            }
        }
        return 0;
    }
}`,
          cpp: r`class Solution {
public:
    int shortestPathLength(vector<vector<int>>& graph) {
        int n = graph.size(), full = (1 << n) - 1;
        vector<vector<bool>> seen(n, vector<bool>(1 << n, false));
        queue<array<int, 3>> q; // node, mask, distance
        for (int i = 0; i < n; i++) {
            seen[i][1 << i] = true;
            q.push({i, 1 << i, 0});
        }
        while (!q.empty()) {
            auto [u, mask, d] = q.front();
            q.pop();
            if (mask == full) return d;
            for (int v : graph[u]) {
                int next = mask | 1 << v;
                if (!seen[v][next]) {
                    seen[v][next] = true;
                    q.push({v, next, d + 1});
                }
            }
        }
        return 0;
    }
};`,
          python: r`class Solution:
    def shortestPathLength(self, graph: List[List[int]]) -> int:
        n = len(graph)
        full = (1 << n) - 1
        q = deque((i, 1 << i, 0) for i in range(n))
        seen = {(i, 1 << i) for i in range(n)}
        while q:
            u, mask, d = q.popleft()
            if mask == full:
                return d
            for v in graph[u]:
                state = (v, mask | 1 << v)
                if state not in seen:
                    seen.add(state)
                    q.append((v, state[1], d + 1))
        return 0`,
          javascript: r`var shortestPathLength = function(graph) {
    const n = graph.length, full = (1 << n) - 1;
    const seen = Array.from({ length: n }, () => new Array(1 << n).fill(false));
    const q = [];
    for (let i = 0; i < n; i++) {
        seen[i][1 << i] = true;
        q.push([i, 1 << i, 0]);
    }
    for (let head = 0; head < q.length; head++) {
        const [u, mask, d] = q[head];
        if (mask === full) return d;
        for (const v of graph[u]) {
            const next = mask | (1 << v);
            if (!seen[v][next]) {
                seen[v][next] = true;
                q.push([v, next, d + 1]);
            }
        }
    }
    return 0;
};`,
        },
      },
    ],
  },

  'find-the-shortest-superstring': {
    pattern: 'Held-Karp bitmask DP (travelling-salesman style) on pairwise overlaps',
    approaches: [
      {
        level: 'Brute force', name: 'Try every order of the words',
        idea: 'For a fixed order, the shortest string joins each word to the previous one with their largest overlap. Try every order and keep the shortest result.',
        steps: [
          '`overlap(a, b)` = the largest `k` with `a` ending in the first `k` letters of `b` (`k < min(|a|, |b|)`, since no word contains another).',
          'Recursively choose the next unused word, appending `b.substring(overlap(last, b))`.',
          'At a full order, keep the result if it is the shortest so far.',
        ],
        time: 'O(n!·n·L²)', space: 'O(n·L)',
        why: 'n! orders, each join taking up to O(L²) to find the overlap. Fine for a few words; 12 words would mean 4.8·10⁸ orders.',
        code: {
          java: r`class Solution {
    private String best;

    public String shortestSuperstring(String[] words) {
        best = null;
        search(words, new boolean[words.length], 0, -1, "");
        return best;
    }

    private void search(String[] w, boolean[] used, int count, int last, String cur) {
        if (count == w.length) {
            if (best == null || cur.length() < best.length()) best = cur;
            return;
        }
        for (int j = 0; j < w.length; j++)
            if (!used[j]) {
                used[j] = true;
                String next = last < 0 ? w[j] : cur + w[j].substring(overlap(w[last], w[j]));
                search(w, used, count + 1, j, next);
                used[j] = false;
            }
    }

    private int overlap(String a, String b) {
        for (int k = Math.min(a.length(), b.length()) - 1; k > 0; k--)
            if (a.endsWith(b.substring(0, k))) return k;
        return 0;
    }
}`,
          cpp: r`class Solution {
    int overlap(const string& a, const string& b) {
        for (int k = min(a.size(), b.size()) - 1; k > 0; k--)
            if (a.compare(a.size() - k, k, b, 0, k) == 0) return k;
        return 0;
    }
public:
    string shortestSuperstring(vector<string>& words) {
        int n = words.size();
        vector<int> order(n);
        iota(order.begin(), order.end(), 0);
        string best;
        bool found = false;
        do {
            string cur = words[order[0]];
            for (int i = 1; i < n; i++) cur += words[order[i]].substr(overlap(words[order[i - 1]], words[order[i]]));
            if (!found || cur.size() < best.size()) { best = cur; found = true; }
        } while (next_permutation(order.begin(), order.end()));
        return best;
    }
};`,
          python: r`class Solution:
    def shortestSuperstring(self, words: List[str]) -> str:
        def overlap(a, b):
            for k in range(min(len(a), len(b)) - 1, 0, -1):
                if a.endswith(b[:k]):
                    return k
            return 0
        best = None
        for order in permutations(words):
            cur = order[0]
            for a, b in zip(order, order[1:]):
                cur += b[overlap(a, b):]
            if best is None or len(cur) < len(best):
                best = cur
        return best`,
          javascript: r`var shortestSuperstring = function(words) {
    const overlap = (a, b) => {
        for (let k = Math.min(a.length, b.length) - 1; k > 0; k--) if (a.endsWith(b.slice(0, k))) return k;
        return 0;
    };
    const n = words.length, used = new Array(n).fill(false);
    let best = null;
    const search = (count, last, cur) => {
        if (count === n) {
            if (best === null || cur.length < best.length) best = cur;
            return;
        }
        for (let j = 0; j < n; j++)
            if (!used[j]) {
                used[j] = true;
                search(count + 1, j, last < 0 ? words[j] : cur + words[j].slice(overlap(words[last], words[j])));
                used[j] = false;
            }
    };
    search(0, -1, '');
    return best;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Held-Karp DP over (used set, last word)',
        idea: 'The result length is `sum of lengths − sum of overlaps between consecutive words`, so maximise total overlap. Like the travelling salesman, the best way to extend an order depends only on which words are used and which came last.',
        steps: [
          'Precompute `ov[i][j]` = overlap of word i followed by word j.',
          '`dp[1 << i][i] = 0`; for every mask, last and unused next: `dp[mask | bit(next)][next] = max(…, dp[mask][last] + ov[last][next])`, remembering `parent`.',
          'Pick the last word with the best `dp[full][last]`; walk `parent` back to recover the order.',
          'Build the answer: the first word, then each next word without its overlapping prefix.',
        ],
        time: 'O(n²·2ⁿ + n²·L²)', space: 'O(n·2ⁿ)',
        why: '2ⁿ·n states with n transitions each (≈ 5.9·10⁵ for n = 12), plus the pairwise overlaps of words up to length L.',
        code: {
          java: r`class Solution {
    public String shortestSuperstring(String[] words) {
        int n = words.length, full = 1 << n;
        int[][] ov = new int[n][n];
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                if (i != j) ov[i][j] = overlap(words[i], words[j]);
        int[][] dp = new int[full][n], parent = new int[full][n];
        for (int[] row : dp) Arrays.fill(row, -1);
        for (int i = 0; i < n; i++) dp[1 << i][i] = 0;
        for (int mask = 1; mask < full; mask++)
            for (int last = 0; last < n; last++) {
                if (dp[mask][last] < 0) continue;
                for (int next = 0; next < n; next++) {
                    if ((mask >> next & 1) == 1) continue;
                    int m = mask | 1 << next, v = dp[mask][last] + ov[last][next];
                    if (v > dp[m][next]) { dp[m][next] = v; parent[m][next] = last; }
                }
            }
        int last = 0;
        for (int i = 1; i < n; i++) if (dp[full - 1][i] > dp[full - 1][last]) last = i;
        int[] order = new int[n];
        for (int pos = n - 1, mask = full - 1; pos >= 0; pos--) {
            order[pos] = last;
            int prev = parent[mask][last];
            mask ^= 1 << last;
            last = prev;
        }
        StringBuilder sb = new StringBuilder(words[order[0]]);
        for (int i = 1; i < n; i++) sb.append(words[order[i]].substring(ov[order[i - 1]][order[i]]));
        return sb.toString();
    }

    private int overlap(String a, String b) {
        for (int k = Math.min(a.length(), b.length()) - 1; k > 0; k--)
            if (a.endsWith(b.substring(0, k))) return k;
        return 0;
    }
}`,
          cpp: r`class Solution {
    int overlap(const string& a, const string& b) {
        for (int k = min(a.size(), b.size()) - 1; k > 0; k--)
            if (a.compare(a.size() - k, k, b, 0, k) == 0) return k;
        return 0;
    }
public:
    string shortestSuperstring(vector<string>& words) {
        int n = words.size(), full = 1 << n;
        vector<vector<int>> ov(n, vector<int>(n, 0));
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                if (i != j) ov[i][j] = overlap(words[i], words[j]);
        vector<vector<int>> dp(full, vector<int>(n, -1)), parent(full, vector<int>(n, -1));
        for (int i = 0; i < n; i++) dp[1 << i][i] = 0;
        for (int mask = 1; mask < full; mask++)
            for (int last = 0; last < n; last++) {
                if (dp[mask][last] < 0) continue;
                for (int next = 0; next < n; next++) {
                    if (mask >> next & 1) continue;
                    int m = mask | 1 << next, v = dp[mask][last] + ov[last][next];
                    if (v > dp[m][next]) { dp[m][next] = v; parent[m][next] = last; }
                }
            }
        int last = max_element(dp[full - 1].begin(), dp[full - 1].end()) - dp[full - 1].begin();
        vector<int> order(n);
        for (int pos = n - 1, mask = full - 1; pos >= 0; pos--) {
            order[pos] = last;
            int prev = parent[mask][last];
            mask ^= 1 << last;
            last = prev;
        }
        string result = words[order[0]];
        for (int i = 1; i < n; i++) result += words[order[i]].substr(ov[order[i - 1]][order[i]]);
        return result;
    }
};`,
          python: r`class Solution:
    def shortestSuperstring(self, words: List[str]) -> str:
        def overlap(a, b):
            for k in range(min(len(a), len(b)) - 1, 0, -1):
                if a.endswith(b[:k]):
                    return k
            return 0
        n = len(words)
        full = 1 << n
        ov = [[overlap(a, b) if i != j else 0 for j, b in enumerate(words)] for i, a in enumerate(words)]
        dp = [[-1] * n for _ in range(full)]
        parent = [[-1] * n for _ in range(full)]
        for i in range(n):
            dp[1 << i][i] = 0
        for mask in range(1, full):
            for last in range(n):
                if dp[mask][last] < 0:
                    continue
                for nxt in range(n):
                    if mask >> nxt & 1:
                        continue
                    m, v = mask | 1 << nxt, dp[mask][last] + ov[last][nxt]
                    if v > dp[m][nxt]:
                        dp[m][nxt], parent[m][nxt] = v, last
        last = max(range(n), key=lambda i: dp[full - 1][i])
        order, mask = [], full - 1
        while last >= 0:
            order.append(last)
            last, mask = parent[mask][last], mask ^ (1 << last)
        order.reverse()
        result = words[order[0]]
        for a, b in zip(order, order[1:]):
            result += words[b][ov[a][b]:]
        return result`,
          javascript: r`var shortestSuperstring = function(words) {
    const overlap = (a, b) => {
        for (let k = Math.min(a.length, b.length) - 1; k > 0; k--) if (a.endsWith(b.slice(0, k))) return k;
        return 0;
    };
    const n = words.length, full = 1 << n;
    const ov = words.map((a, i) => words.map((b, j) => (i === j ? 0 : overlap(a, b))));
    const dp = Array.from({ length: full }, () => new Array(n).fill(-1));
    const parent = Array.from({ length: full }, () => new Array(n).fill(-1));
    for (let i = 0; i < n; i++) dp[1 << i][i] = 0;
    for (let mask = 1; mask < full; mask++)
        for (let last = 0; last < n; last++) {
            if (dp[mask][last] < 0) continue;
            for (let next = 0; next < n; next++) {
                if ((mask >> next) & 1) continue;
                const m = mask | (1 << next), v = dp[mask][last] + ov[last][next];
                if (v > dp[m][next]) { dp[m][next] = v; parent[m][next] = last; }
            }
        }
    let last = 0;
    for (let i = 1; i < n; i++) if (dp[full - 1][i] > dp[full - 1][last]) last = i;
    const order = new Array(n);
    for (let pos = n - 1, mask = full - 1; pos >= 0; pos--) {
        order[pos] = last;
        const prev = parent[mask][last];
        mask ^= 1 << last;
        last = prev;
    }
    let result = words[order[0]];
    for (let i = 1; i < n; i++) result += words[order[i]].slice(ov[order[i - 1]][order[i]]);
    return result;
};`,
        },
      },
    ],
  },
};
