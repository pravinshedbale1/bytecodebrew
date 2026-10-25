const r = String.raw;

export default {
  'partition-equal-subset-sum': {
    pattern: '0/1 knapsack (subset sum): can some subset reach total / 2?',
    approaches: [
      {
        level: 'Brute force', name: 'Recursion: include or exclude each number',
        idea: 'An equal split exists exactly when some subset sums to half the total. Try including or excluding each number.',
        steps: [
          'If the total is odd, return false; `target = total / 2`.',
          '`can(i, remaining)`: true if `remaining == 0`; false if `i == n` or `remaining < 0`.',
          'Return `can(i + 1, remaining − nums[i]) || can(i + 1, remaining)`.',
        ],
        time: 'O(2ⁿ)', space: 'O(n)',
        why: 'Every subset may be tried.',
        code: {
          java: r`class Solution {
    public boolean canPartition(int[] nums) {
        int total = 0;
        for (int x : nums) total += x;
        return total % 2 == 0 && can(nums, 0, total / 2);
    }

    private boolean can(int[] nums, int i, int remaining) {
        if (remaining == 0) return true;
        if (i == nums.length || remaining < 0) return false;
        return can(nums, i + 1, remaining - nums[i]) || can(nums, i + 1, remaining);
    }
}`,
          cpp: r`class Solution {
    bool can(vector<int>& nums, size_t i, int remaining) {
        if (remaining == 0) return true;
        if (i == nums.size() || remaining < 0) return false;
        return can(nums, i + 1, remaining - nums[i]) || can(nums, i + 1, remaining);
    }
public:
    bool canPartition(vector<int>& nums) {
        int total = accumulate(nums.begin(), nums.end(), 0);
        return total % 2 == 0 && can(nums, 0, total / 2);
    }
};`,
          python: r`class Solution:
    def canPartition(self, nums: List[int]) -> bool:
        total = sum(nums)
        def can(i, remaining):
            if remaining == 0:
                return True
            if i == len(nums) or remaining < 0:
                return False
            return can(i + 1, remaining - nums[i]) or can(i + 1, remaining)
        return total % 2 == 0 and can(0, total // 2)`,
          javascript: r`var canPartition = function(nums) {
    const total = nums.reduce((a, b) => a + b, 0);
    const can = (i, remaining) => {
        if (remaining === 0) return true;
        if (i === nums.length || remaining < 0) return false;
        return can(i + 1, remaining - nums[i]) || can(i + 1, remaining);
    };
    return total % 2 === 0 && can(0, total / 2);
};`,
        },
      },
      {
        level: 'Better', name: 'Memoisation on (index, remaining)',
        idea: 'The answer for the rest depends only on the index and the remaining sum, so cache it.',
        steps: [
          'Same recursion, but remember `can(i, remaining)` in a table of size n × (target + 1).',
          'Return the cached result when a state repeats.',
        ],
        time: 'O(n·S)', space: 'O(n·S)',
        why: 'S = total / 2 ≤ 10⁴; there are at most n·(S + 1) states with O(1) work each.',
        code: {
          java: r`class Solution {
    private Boolean[][] memo;

    public boolean canPartition(int[] nums) {
        int total = 0;
        for (int x : nums) total += x;
        if (total % 2 != 0) return false;
        memo = new Boolean[nums.length][total / 2 + 1];
        return can(nums, 0, total / 2);
    }

    private boolean can(int[] nums, int i, int remaining) {
        if (remaining == 0) return true;
        if (i == nums.length || remaining < 0) return false;
        if (memo[i][remaining] != null) return memo[i][remaining];
        return memo[i][remaining] = can(nums, i + 1, remaining - nums[i]) || can(nums, i + 1, remaining);
    }
}`,
          cpp: r`class Solution {
    vector<vector<int>> memo; // -1 unknown
    bool can(vector<int>& nums, size_t i, int remaining) {
        if (remaining == 0) return true;
        if (i == nums.size() || remaining < 0) return false;
        if (memo[i][remaining] != -1) return memo[i][remaining];
        return memo[i][remaining] = can(nums, i + 1, remaining - nums[i]) || can(nums, i + 1, remaining);
    }
public:
    bool canPartition(vector<int>& nums) {
        int total = accumulate(nums.begin(), nums.end(), 0);
        if (total % 2) return false;
        memo.assign(nums.size(), vector<int>(total / 2 + 1, -1));
        return can(nums, 0, total / 2);
    }
};`,
          python: r`class Solution:
    def canPartition(self, nums: List[int]) -> bool:
        total = sum(nums)
        if total % 2:
            return False
        @cache
        def can(i, remaining):
            if remaining == 0:
                return True
            if i == len(nums) or remaining < 0:
                return False
            return can(i + 1, remaining - nums[i]) or can(i + 1, remaining)
        return can(0, total // 2)`,
          javascript: r`var canPartition = function(nums) {
    const total = nums.reduce((a, b) => a + b, 0);
    if (total % 2) return false;
    const target = total / 2, memo = new Map();
    const can = (i, remaining) => {
        if (remaining === 0) return true;
        if (i === nums.length || remaining < 0) return false;
        const key = i * (target + 1) + remaining;
        if (!memo.has(key)) memo.set(key, can(i + 1, remaining - nums[i]) || can(i + 1, remaining));
        return memo.get(key);
    };
    return can(0, target);
};`,
        },
      },
      {
        level: 'Optimal', name: '1-D reachable-sums table, iterated backwards',
        idea: '`reach[s]` says whether some subset of the numbers seen so far sums to `s`. Adding a number `x` makes `s` reachable if `s − x` was. Looping `s` downwards ensures each number is used at most once.',
        steps: [
          'If the total is odd, return false; `target = total / 2`; `reach[0] = true`.',
          'For each `x`, for `s` from `target` down to `x`: `reach[s] |= reach[s − x]`.',
          'Return `reach[target]`.',
        ],
        time: 'O(n·S)', space: 'O(S)',
        why: 'n numbers × S sums; one boolean row. Going upwards instead would let one number count twice (that is the unbounded knapsack).',
        code: {
          java: r`class Solution {
    public boolean canPartition(int[] nums) {
        int total = 0;
        for (int x : nums) total += x;
        if (total % 2 != 0) return false;
        int target = total / 2;
        boolean[] reach = new boolean[target + 1];
        reach[0] = true;
        for (int x : nums)
            for (int s = target; s >= x; s--) reach[s] |= reach[s - x];
        return reach[target];
    }
}`,
          cpp: r`class Solution {
public:
    bool canPartition(vector<int>& nums) {
        int total = accumulate(nums.begin(), nums.end(), 0);
        if (total % 2) return false;
        int target = total / 2;
        vector<bool> reach(target + 1, false);
        reach[0] = true;
        for (int x : nums)
            for (int s = target; s >= x; s--) reach[s] = reach[s] || reach[s - x];
        return reach[target];
    }
};`,
          python: r`class Solution:
    def canPartition(self, nums: List[int]) -> bool:
        total = sum(nums)
        if total % 2:
            return False
        target = total // 2
        reach = [True] + [False] * target
        for x in nums:
            for s in range(target, x - 1, -1):
                if reach[s - x]:
                    reach[s] = True
        return reach[target]`,
          javascript: r`var canPartition = function(nums) {
    const total = nums.reduce((a, b) => a + b, 0);
    if (total % 2) return false;
    const target = total / 2, reach = new Array(target + 1).fill(false);
    reach[0] = true;
    for (const x of nums)
        for (let s = target; s >= x; s--) if (reach[s - x]) reach[s] = true;
    return reach[target];
};`,
        },
      },
    ],
  },

  'target-sum': {
    pattern: 'Reduce to counting subsets with sum (total + target) / 2 (0/1 knapsack count)',
    approaches: [
      {
        level: 'Brute force', name: 'Try every sign assignment',
        idea: 'Recursively give each number a `+` or a `−` and count the assignments whose total equals `target`.',
        steps: [
          '`count(i, sum)`: at `i == n`, return 1 if `sum == target`, else 0.',
          'Return `count(i + 1, sum + nums[i]) + count(i + 1, sum − nums[i])`.',
        ],
        time: 'O(2ⁿ)', space: 'O(n)',
        why: 'Every one of the 2ⁿ sign patterns is evaluated (about a million for n = 20).',
        code: {
          java: r`class Solution {
    public int findTargetSumWays(int[] nums, int target) {
        return count(nums, 0, 0, target);
    }

    private int count(int[] nums, int i, int sum, int target) {
        if (i == nums.length) return sum == target ? 1 : 0;
        return count(nums, i + 1, sum + nums[i], target) + count(nums, i + 1, sum - nums[i], target);
    }
}`,
          cpp: r`class Solution {
    int count(vector<int>& nums, size_t i, int sum, int target) {
        if (i == nums.size()) return sum == target ? 1 : 0;
        return count(nums, i + 1, sum + nums[i], target) + count(nums, i + 1, sum - nums[i], target);
    }
public:
    int findTargetSumWays(vector<int>& nums, int target) {
        return count(nums, 0, 0, target);
    }
};`,
          python: r`class Solution:
    def findTargetSumWays(self, nums: List[int], target: int) -> int:
        def count(i, s):
            if i == len(nums):
                return 1 if s == target else 0
            return count(i + 1, s + nums[i]) + count(i + 1, s - nums[i])
        return count(0, 0)`,
          javascript: r`var findTargetSumWays = function(nums, target) {
    const count = (i, sum) => {
        if (i === nums.length) return sum === target ? 1 : 0;
        return count(i + 1, sum + nums[i]) + count(i + 1, sum - nums[i]);
    };
    return count(0, 0);
};`,
        },
      },
      {
        level: 'Better', name: 'Memoisation on (index, running sum)',
        idea: 'Running sums stay within `[−total, total]`, so the state `(i, sum)` repeats often. Cache it.',
        steps: [
          'Same recursion as the brute force.',
          'Cache `count(i, sum)` (offset `sum` by `total` to use an array).',
        ],
        time: 'O(n·S)', space: 'O(n·S)',
        why: 'n × (2·total + 1) states, total ≤ 1000.',
        code: {
          java: r`class Solution {
    private Integer[][] memo;
    private int total;

    public int findTargetSumWays(int[] nums, int target) {
        for (int x : nums) total += x;
        memo = new Integer[nums.length][2 * total + 1];
        return count(nums, 0, 0, target);
    }

    private int count(int[] nums, int i, int sum, int target) {
        if (i == nums.length) return sum == target ? 1 : 0;
        if (memo[i][sum + total] != null) return memo[i][sum + total];
        return memo[i][sum + total] = count(nums, i + 1, sum + nums[i], target) + count(nums, i + 1, sum - nums[i], target);
    }
}`,
          cpp: r`class Solution {
    vector<vector<int>> memo;
    int total = 0;
    int count(vector<int>& nums, size_t i, int sum, int target) {
        if (i == nums.size()) return sum == target ? 1 : 0;
        int& slot = memo[i][sum + total];
        if (slot != -1) return slot;
        return slot = count(nums, i + 1, sum + nums[i], target) + count(nums, i + 1, sum - nums[i], target);
    }
public:
    int findTargetSumWays(vector<int>& nums, int target) {
        total = accumulate(nums.begin(), nums.end(), 0);
        memo.assign(nums.size(), vector<int>(2 * total + 1, -1));
        return count(nums, 0, 0, target);
    }
};`,
          python: r`class Solution:
    def findTargetSumWays(self, nums: List[int], target: int) -> int:
        @cache
        def count(i, s):
            if i == len(nums):
                return 1 if s == target else 0
            return count(i + 1, s + nums[i]) + count(i + 1, s - nums[i])
        return count(0, 0)`,
          javascript: r`var findTargetSumWays = function(nums, target) {
    const memo = new Map();
    const count = (i, sum) => {
        if (i === nums.length) return sum === target ? 1 : 0;
        const key = i + ',' + sum;
        if (!memo.has(key)) memo.set(key, count(i + 1, sum + nums[i]) + count(i + 1, sum - nums[i]));
        return memo.get(key);
    };
    return count(0, 0);
};`,
        },
      },
      {
        level: 'Optimal', name: 'Count subsets with sum (total + target) / 2',
        idea: 'Call the numbers with `+` the set P. Then `sum(P) − (total − sum(P)) = target`, so `sum(P) = (total + target) / 2`. Count the subsets with that sum using a 1-D counting DP.',
        steps: [
          'If `|target| > total` or `total + target` is odd, return 0. Let `want = (total + target) / 2`.',
          '`ways[0] = 1`.',
          'For each `x`, for `s` from `want` down to `x`: `ways[s] += ways[s − x]`.',
          'Return `ways[want]`.',
        ],
        time: 'O(n·S)', space: 'O(S)',
        why: 'n numbers × up to S = total sums, one counting row. Zeros work automatically: each doubles the counts, matching ±0.',
        code: {
          java: r`class Solution {
    public int findTargetSumWays(int[] nums, int target) {
        int total = 0;
        for (int x : nums) total += x;
        if (Math.abs(target) > total || (total + target) % 2 != 0) return 0;
        int want = (total + target) / 2;
        int[] ways = new int[want + 1];
        ways[0] = 1;
        for (int x : nums)
            for (int s = want; s >= x; s--) ways[s] += ways[s - x];
        return ways[want];
    }
}`,
          cpp: r`class Solution {
public:
    int findTargetSumWays(vector<int>& nums, int target) {
        int total = accumulate(nums.begin(), nums.end(), 0);
        if (abs(target) > total || (total + target) % 2) return 0;
        int want = (total + target) / 2;
        vector<int> ways(want + 1, 0);
        ways[0] = 1;
        for (int x : nums)
            for (int s = want; s >= x; s--) ways[s] += ways[s - x];
        return ways[want];
    }
};`,
          python: r`class Solution:
    def findTargetSumWays(self, nums: List[int], target: int) -> int:
        total = sum(nums)
        if abs(target) > total or (total + target) % 2:
            return 0
        want = (total + target) // 2
        ways = [1] + [0] * want
        for x in nums:
            for s in range(want, x - 1, -1):
                ways[s] += ways[s - x]
        return ways[want]`,
          javascript: r`var findTargetSumWays = function(nums, target) {
    const total = nums.reduce((a, b) => a + b, 0);
    if (Math.abs(target) > total || (total + target) % 2 !== 0) return 0;
    const want = (total + target) / 2, ways = new Array(want + 1).fill(0);
    ways[0] = 1;
    for (const x of nums)
        for (let s = want; s >= x; s--) ways[s] += ways[s - x];
    return ways[want];
};`,
        },
      },
    ],
  },

  'last-stone-weight-ii': {
    pattern: 'Split into two groups with sums as close as possible (subset sum up to total / 2)',
    approaches: [
      {
        level: 'Brute force', name: 'Try every + / − sign',
        idea: 'Whatever the order of smashes, the final weight is `|sum of one group − sum of the other|` for some split of the stones into two groups, and every split is achievable. Try every split.',
        steps: [
          'Recursively give each stone a `+` or `−` sign.',
          'At the end, the candidate answer is `|signed sum|`.',
          'Return the smallest candidate.',
        ],
        time: 'O(2ⁿ)', space: 'O(n)',
        why: 'All 2ⁿ sign patterns are tried.',
        code: {
          java: r`class Solution {
    public int lastStoneWeightII(int[] stones) {
        return best(stones, 0, 0);
    }

    private int best(int[] s, int i, int sum) {
        if (i == s.length) return Math.abs(sum);
        return Math.min(best(s, i + 1, sum + s[i]), best(s, i + 1, sum - s[i]));
    }
}`,
          cpp: r`class Solution {
    int best(vector<int>& s, size_t i, int sum) {
        if (i == s.size()) return abs(sum);
        return min(best(s, i + 1, sum + s[i]), best(s, i + 1, sum - s[i]));
    }
public:
    int lastStoneWeightII(vector<int>& stones) {
        return best(stones, 0, 0);
    }
};`,
          python: r`class Solution:
    def lastStoneWeightII(self, stones: List[int]) -> int:
        def best(i, s):
            if i == len(stones):
                return abs(s)
            return min(best(i + 1, s + stones[i]), best(i + 1, s - stones[i]))
        return best(0, 0)`,
          javascript: r`var lastStoneWeightII = function(stones) {
    const best = (i, sum) => {
        if (i === stones.length) return Math.abs(sum);
        return Math.min(best(i + 1, sum + stones[i]), best(i + 1, sum - stones[i]));
    };
    return best(0, 0);
};`,
        },
        timesOut: ['generated'],
      },
      {
        level: 'Optimal', name: 'Subset sum: the largest reachable sum ≤ total / 2',
        idea: 'To make the two groups as even as possible, find the largest subset sum `best` that does not exceed `total / 2`; the other group has `total − best`, and the leftover stone weighs `total − 2·best`.',
        steps: [
          '`reach[0] = true`; `half = total / 2`.',
          'For each stone `x`, for `s` from `half` down to `x`: `reach[s] |= reach[s − x]`.',
          'Find the largest `s <= half` with `reach[s]`; return `total − 2s`.',
        ],
        time: 'O(n·S)', space: 'O(S)',
        why: 'n stones × S = total / 2 ≤ 1500 sums; one boolean row.',
        code: {
          java: r`class Solution {
    public int lastStoneWeightII(int[] stones) {
        int total = 0;
        for (int x : stones) total += x;
        int half = total / 2;
        boolean[] reach = new boolean[half + 1];
        reach[0] = true;
        for (int x : stones)
            for (int s = half; s >= x; s--) reach[s] |= reach[s - x];
        for (int s = half; ; s--) if (reach[s]) return total - 2 * s;
    }
}`,
          cpp: r`class Solution {
public:
    int lastStoneWeightII(vector<int>& stones) {
        int total = accumulate(stones.begin(), stones.end(), 0), half = total / 2;
        vector<bool> reach(half + 1, false);
        reach[0] = true;
        for (int x : stones)
            for (int s = half; s >= x; s--) reach[s] = reach[s] || reach[s - x];
        for (int s = half; ; s--) if (reach[s]) return total - 2 * s;
    }
};`,
          python: r`class Solution:
    def lastStoneWeightII(self, stones: List[int]) -> int:
        total = sum(stones)
        half = total // 2
        reach = [True] + [False] * half
        for x in stones:
            for s in range(half, x - 1, -1):
                if reach[s - x]:
                    reach[s] = True
        best = max(s for s in range(half + 1) if reach[s])
        return total - 2 * best`,
          javascript: r`var lastStoneWeightII = function(stones) {
    const total = stones.reduce((a, b) => a + b, 0), half = Math.floor(total / 2);
    const reach = new Array(half + 1).fill(false);
    reach[0] = true;
    for (const x of stones)
        for (let s = half; s >= x; s--) if (reach[s - x]) reach[s] = true;
    for (let s = half; ; s--) if (reach[s]) return total - 2 * s;
};`,
        },
      },
    ],
  },

  'coin-change': {
    pattern: 'Unbounded knapsack (minimum count): best(a) = 1 + min over coins of best(a − coin)',
    approaches: [
      {
        level: 'Brute force', name: 'Recursion over the last coin',
        idea: 'The fewest coins for `amount` is 1 plus the fewest for `amount − c`, minimised over every coin `c` that fits.',
        steps: [
          '`fewest(a)`: 0 if `a == 0`.',
          'Try each coin `c <= a`; take `1 + fewest(a − c)` when that is possible.',
          'Return the minimum (or "impossible"); map impossible to −1 at the end.',
        ],
        time: 'O(kᵃ)', space: 'O(a)',
        why: 'k branches per level and up to a levels deep (a = amount); amounts repeat endlessly.',
        timesOut: [4, 'generated'],
        code: {
          java: r`class Solution {
    public int coinChange(int[] coins, int amount) {
        int best = fewest(coins, amount);
        return best == Integer.MAX_VALUE ? -1 : best;
    }

    private int fewest(int[] coins, int a) {
        if (a == 0) return 0;
        int best = Integer.MAX_VALUE;
        for (int c : coins) {
            if (c > a) continue;
            int sub = fewest(coins, a - c);
            if (sub != Integer.MAX_VALUE) best = Math.min(best, sub + 1);
        }
        return best;
    }
}`,
          cpp: r`class Solution {
    int fewest(vector<int>& coins, int a) {
        if (a == 0) return 0;
        int best = INT_MAX;
        for (int c : coins) {
            if (c > a) continue;
            int sub = fewest(coins, a - c);
            if (sub != INT_MAX) best = min(best, sub + 1);
        }
        return best;
    }
public:
    int coinChange(vector<int>& coins, int amount) {
        int best = fewest(coins, amount);
        return best == INT_MAX ? -1 : best;
    }
};`,
          python: r`class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:
        def fewest(a):
            if a == 0:
                return 0
            return min((fewest(a - c) + 1 for c in coins if c <= a), default=inf)
        best = fewest(amount)
        return -1 if best == inf else best`,
          javascript: r`var coinChange = function(coins, amount) {
    const fewest = (a) => {
        if (a === 0) return 0;
        let best = Infinity;
        for (const c of coins) if (c <= a) best = Math.min(best, fewest(a - c) + 1);
        return best;
    };
    const best = fewest(amount);
    return best === Infinity ? -1 : best;
};`,
        },
      },
      {
        level: 'Better', name: 'Memoisation on the amount',
        idea: 'The answer for an amount never changes, so compute it once per amount.',
        steps: [
          'Same recurrence as the brute force.',
          'Cache `fewest(a)` (including "impossible") the first time it is computed, and reuse it for every later call with the same amount.',
        ],
        time: 'O(a·k)', space: 'O(a)',
        why: 'a + 1 amounts, each trying k coins once; the recursion can be a levels deep.',
        code: {
          java: r`class Solution {
    private int[] memo;

    public int coinChange(int[] coins, int amount) {
        memo = new int[amount + 1];
        Arrays.fill(memo, -2); // -2 = not computed yet, -1 = impossible
        return fewest(coins, amount);
    }

    private int fewest(int[] coins, int a) {
        if (a == 0) return 0;
        if (memo[a] != -2) return memo[a];
        int best = Integer.MAX_VALUE;
        for (int c : coins) {
            if (c > a) continue;
            int sub = fewest(coins, a - c);
            if (sub >= 0) best = Math.min(best, sub + 1);
        }
        return memo[a] = best == Integer.MAX_VALUE ? -1 : best;
    }
}`,
          cpp: r`class Solution {
    vector<int> memo;
    int fewest(vector<int>& coins, int a) {
        if (a == 0) return 0;
        if (memo[a] != -2) return memo[a];
        int best = INT_MAX;
        for (int c : coins) {
            if (c > a) continue;
            int sub = fewest(coins, a - c);
            if (sub >= 0) best = min(best, sub + 1);
        }
        return memo[a] = best == INT_MAX ? -1 : best;
    }
public:
    int coinChange(vector<int>& coins, int amount) {
        memo.assign(amount + 1, -2); // -2 = not computed yet, -1 = impossible
        return fewest(coins, amount);
    }
};`,
          python: r`class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:
        @cache
        def fewest(a):
            if a == 0:
                return 0
            return min((fewest(a - c) + 1 for c in coins if c <= a), default=inf)
        best = fewest(amount)
        return -1 if best == inf else best`,
          javascript: r`var coinChange = function(coins, amount) {
    const memo = new Map();
    const fewest = (a) => {
        if (a === 0) return 0;
        if (memo.has(a)) return memo.get(a);
        let best = Infinity;
        for (const c of coins) if (c <= a) best = Math.min(best, fewest(a - c) + 1);
        memo.set(a, best);
        return best;
    };
    const best = fewest(amount);
    return best === Infinity ? -1 : best;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Bottom-up table over amounts',
        idea: 'Fill `dp[a]` for `a = 1..amount` from smaller amounts: `dp[a] = 1 + min(dp[a − c])` over coins `c <= a`. No recursion.',
        steps: [
          'Set `dp[0] = 0` and every other entry to "infinity" (`amount + 1` works, since no answer can exceed `amount`).',
          'For each `a` from 1 to `amount`, for each coin `c <= a`: `dp[a] = min(dp[a], dp[a − c] + 1)`.',
          'Return `dp[amount]`, or −1 if it is still `amount + 1`.',
        ],
        time: 'O(a·k)', space: 'O(a)',
        why: 'a amounts × k coins. Coin values reach 2³¹ − 1, so compare `c <= a` before subtracting rather than computing `a − c` blindly.',
        code: {
          java: r`class Solution {
    public int coinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1);
        dp[0] = 0;
        for (int a = 1; a <= amount; a++)
            for (int c : coins)
                if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);
        return dp[amount] > amount ? -1 : dp[amount];
    }
}`,
          cpp: r`class Solution {
public:
    int coinChange(vector<int>& coins, int amount) {
        vector<int> dp(amount + 1, amount + 1);
        dp[0] = 0;
        for (int a = 1; a <= amount; a++)
            for (int c : coins)
                if (c <= a) dp[a] = min(dp[a], dp[a - c] + 1);
        return dp[amount] > amount ? -1 : dp[amount];
    }
};`,
          python: r`class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:
        dp = [0] + [amount + 1] * amount
        for a in range(1, amount + 1):
            for c in coins:
                if c <= a and dp[a - c] + 1 < dp[a]:
                    dp[a] = dp[a - c] + 1
        return -1 if dp[amount] > amount else dp[amount]`,
          javascript: r`var coinChange = function(coins, amount) {
    const dp = new Array(amount + 1).fill(amount + 1);
    dp[0] = 0;
    for (let a = 1; a <= amount; a++)
        for (const c of coins)
            if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);
    return dp[amount] > amount ? -1 : dp[amount];
};`,
        },
      },
    ],
  },

  'coin-change-ii': {
    pattern: 'Unbounded knapsack (count combinations): coins in the outer loop so order does not matter',
    approaches: [
      {
        level: 'Brute force', name: 'Recursion over coins in a fixed order',
        idea: 'To count combinations (not orders), decide coin by coin: use coin `i` again, or move on to the next coin for good.',
        steps: [
          '`ways(i, a)`: 1 if `a == 0`; 0 if `i == coins.length` or `a < 0`.',
          'Return `ways(i, a − coins[i]) + ways(i + 1, a)`.',
        ],
        time: 'O(2^(n + a))', space: 'O(n + a)',
        why: 'Each call branches into two, with heavy repetition of the same `(i, a)` states.',
        code: {
          java: r`class Solution {
    public int change(int amount, int[] coins) {
        return ways(coins, 0, amount);
    }

    private int ways(int[] coins, int i, int a) {
        if (a == 0) return 1;
        if (i == coins.length || a < 0) return 0;
        return ways(coins, i, a - coins[i]) + ways(coins, i + 1, a);
    }
}`,
          cpp: r`class Solution {
    int ways(vector<int>& coins, size_t i, int a) {
        if (a == 0) return 1;
        if (i == coins.size() || a < 0) return 0;
        return ways(coins, i, a - coins[i]) + ways(coins, i + 1, a);
    }
public:
    int change(int amount, vector<int>& coins) {
        return ways(coins, 0, amount);
    }
};`,
          python: r`class Solution:
    def change(self, amount: int, coins: List[int]) -> int:
        def ways(i, a):
            if a == 0:
                return 1
            if i == len(coins) or a < 0:
                return 0
            return ways(i, a - coins[i]) + ways(i + 1, a)
        return ways(0, amount)`,
          javascript: r`var change = function(amount, coins) {
    const ways = (i, a) => {
        if (a === 0) return 1;
        if (i === coins.length || a < 0) return 0;
        return ways(i, a - coins[i]) + ways(i + 1, a);
    };
    return ways(0, amount);
};`,
        },
        timesOut: ['generated'],
      },
      {
        level: 'Better', name: '2-D table over (coins used, amount)',
        idea: '`dp[i][a]` = combinations of the first `i` coin types that make `a`. Either coin `i − 1` is not used (`dp[i − 1][a]`), or it is used at least once (`dp[i][a − coin]`).',
        steps: [
          '`dp[i][0] = 1` for all `i`.',
          '`dp[i][a] = dp[i − 1][a] + (a >= coin ? dp[i][a − coin] : 0)`.',
          'Return `dp[n][amount]`.',
        ],
        time: 'O(n·a)', space: 'O(n·a)',
        why: 'n coin types × a amounts.',
        code: {
          java: r`class Solution {
    public int change(int amount, int[] coins) {
        int n = coins.length;
        int[][] dp = new int[n + 1][amount + 1];
        for (int i = 0; i <= n; i++) dp[i][0] = 1;
        for (int i = 1; i <= n; i++)
            for (int a = 1; a <= amount; a++)
                dp[i][a] = dp[i - 1][a] + (a >= coins[i - 1] ? dp[i][a - coins[i - 1]] : 0);
        return dp[n][amount];
    }
}`,
          cpp: r`class Solution {
public:
    int change(int amount, vector<int>& coins) {
        int n = coins.size();
        vector<vector<unsigned>> dp(n + 1, vector<unsigned>(amount + 1, 0));
        for (int i = 0; i <= n; i++) dp[i][0] = 1;
        for (int i = 1; i <= n; i++)
            for (int a = 1; a <= amount; a++)
                dp[i][a] = dp[i - 1][a] + (a >= coins[i - 1] ? dp[i][a - coins[i - 1]] : 0u);
        return (int) dp[n][amount];
    }
};`,
          python: r`class Solution:
    def change(self, amount: int, coins: List[int]) -> int:
        n = len(coins)
        dp = [[1] + [0] * amount for _ in range(n + 1)]
        for i in range(1, n + 1):
            c = coins[i - 1]
            for a in range(1, amount + 1):
                dp[i][a] = dp[i - 1][a] + (dp[i][a - c] if a >= c else 0)
        return dp[n][amount]`,
          javascript: r`var change = function(amount, coins) {
    const n = coins.length;
    const dp = Array.from({ length: n + 1 }, () => { const row = new Array(amount + 1).fill(0); row[0] = 1; return row; });
    for (let i = 1; i <= n; i++)
        for (let a = 1; a <= amount; a++)
            dp[i][a] = (dp[i - 1][a] + (a >= coins[i - 1] ? dp[i][a - coins[i - 1]] : 0)) >>> 0;
    return dp[n][amount];
};`,
        },
      },
      {
        level: 'Optimal', name: '1-D table, coins in the outer loop',
        idea: 'Process one coin type at a time. Looping amounts upwards lets a coin be reused; putting coins in the outer loop means each combination is built in one fixed coin order, so it is counted once.',
        steps: [
          '`ways[0] = 1`.',
          'For each coin `c`, for `a` from `c` to `amount`: `ways[a] += ways[a − c]`.',
          'Return `ways[amount]`.',
        ],
        time: 'O(n·a)', space: 'O(a)',
        why: 'Same work in one row. Swapping the loops (amount outside, coins inside) would count orderings instead — that is Combination Sum IV. Middle values can exceed 32 bits even when the answer does not, so the sums wrap on purpose (Java `int`, C++ `unsigned`, JS `>>> 0`).',
        code: {
          java: r`class Solution {
    public int change(int amount, int[] coins) {
        int[] ways = new int[amount + 1];
        ways[0] = 1;
        for (int c : coins)
            for (int a = c; a <= amount; a++) ways[a] += ways[a - c];
        return ways[amount];
    }
}`,
          cpp: r`class Solution {
public:
    int change(int amount, vector<int>& coins) {
        vector<unsigned> ways(amount + 1, 0);
        ways[0] = 1;
        for (int c : coins)
            for (int a = c; a <= amount; a++) ways[a] += ways[a - c];
        return (int) ways[amount];
    }
};`,
          python: r`class Solution:
    def change(self, amount: int, coins: List[int]) -> int:
        ways = [1] + [0] * amount
        for c in coins:
            for a in range(c, amount + 1):
                ways[a] += ways[a - c]
        return ways[amount]`,
          javascript: r`var change = function(amount, coins) {
    const ways = new Array(amount + 1).fill(0);
    ways[0] = 1;
    for (const c of coins)
        for (let a = c; a <= amount; a++) ways[a] = (ways[a] + ways[a - c]) >>> 0;
    return ways[amount];
};`,
        },
      },
    ],
  },

  'combination-sum-iv': {
    pattern: 'Count ordered sequences: dp(t) = Σ dp(t − x) with the target in the outer loop',
    approaches: [
      {
        level: 'Brute force', name: 'Recursion over the first number',
        idea: 'An ordered sequence summing to `t` starts with some `x`; the rest is any sequence summing to `t − x`.',
        steps: [
          '`count(t)`: 1 if `t == 0`.',
          'Return the sum of `count(t − x)` over every `x <= t`.',
        ],
        time: 'O(kᵗ)', space: 'O(t)',
        why: 'It visits every sequence one by one, so the work is at least the answer (over a billion for one test).',
        timesOut: [3, 'generated'],
        code: {
          java: r`class Solution {
    public int combinationSum4(int[] nums, int target) {
        if (target == 0) return 1;
        int total = 0;
        for (int x : nums) if (x <= target) total += combinationSum4(nums, target - x);
        return total;
    }
}`,
          cpp: r`class Solution {
public:
    int combinationSum4(vector<int>& nums, int target) {
        if (target == 0) return 1;
        unsigned total = 0;
        for (int x : nums) if (x <= target) total += combinationSum4(nums, target - x);
        return (int) total;
    }
};`,
          python: r`class Solution:
    def combinationSum4(self, nums: List[int], target: int) -> int:
        if target == 0:
            return 1
        return sum(self.combinationSum4(nums, target - x) for x in nums if x <= target)`,
          javascript: r`var combinationSum4 = function(nums, target) {
    if (target === 0) return 1;
    let total = 0;
    for (const x of nums) if (x <= target) total += combinationSum4(nums, target - x);
    return total;
};`,
        },
      },
      {
        level: 'Better', name: 'Memoisation on the remaining target',
        idea: 'The count for a remaining target never changes, so compute each once.',
        steps: [
          'Same recurrence as the brute force.',
          'Cache `count(t)` the first time it is computed and reuse it for every later call with the same remaining target.',
        ],
        time: 'O(t·k)', space: 'O(t)',
        why: 't + 1 values, each summing over k numbers; the recursion can be t deep.',
        code: {
          java: r`class Solution {
    private int[] memo;

    public int combinationSum4(int[] nums, int target) {
        memo = new int[target + 1];
        Arrays.fill(memo, -1);
        return count(nums, target);
    }

    private int count(int[] nums, int t) {
        if (t == 0) return 1;
        if (memo[t] != -1) return memo[t];
        int total = 0;
        for (int x : nums) if (x <= t) total += count(nums, t - x);
        return memo[t] = total;
    }
}`,
          cpp: r`class Solution {
    vector<long long> memo; // -1 unknown; values kept modulo 2^32
    unsigned count(vector<int>& nums, int t) {
        if (t == 0) return 1;
        if (memo[t] != -1) return (unsigned) memo[t];
        unsigned total = 0;
        for (int x : nums) if (x <= t) total += count(nums, t - x);
        memo[t] = total;
        return total;
    }
public:
    int combinationSum4(vector<int>& nums, int target) {
        memo.assign(target + 1, -1);
        return (int) count(nums, target);
    }
};`,
          python: r`class Solution:
    def combinationSum4(self, nums: List[int], target: int) -> int:
        @cache
        def count(t):
            if t == 0:
                return 1
            return sum(count(t - x) for x in nums if x <= t)
        return count(target)`,
          javascript: r`var combinationSum4 = function(nums, target) {
    const memo = new Map();
    const count = (t) => {
        if (t === 0) return 1;
        if (memo.has(t)) return memo.get(t);
        let total = 0;
        for (const x of nums) if (x <= t) total = (total + count(t - x)) >>> 0;
        memo.set(t, total);
        return total;
    };
    return count(target);
};`,
        },
      },
      {
        level: 'Optimal', name: 'Bottom-up table, target in the outer loop',
        idea: 'Fill `dp[t]` for `t = 1..target`. Putting the target in the outer loop and the numbers in the inner loop counts every order separately — the opposite loop order from Coin Change II.',
        steps: [
          '`dp[0] = 1`.',
          'For `t` from 1 to `target`, for each `x <= t`: `dp[t] += dp[t − x]`.',
          'Return `dp[target]`.',
        ],
        time: 'O(t·k)', space: 'O(t)',
        why: 'target × k additions. Middle values can exceed 32 (or even 64) bits although the answer fits, so the sums wrap modulo 2³² on purpose: Java `int`, C++ `unsigned`, JS `>>> 0`; the final value is still exact because it is below 2³¹.',
        code: {
          java: r`class Solution {
    public int combinationSum4(int[] nums, int target) {
        int[] dp = new int[target + 1];
        dp[0] = 1;
        for (int t = 1; t <= target; t++)
            for (int x : nums)
                if (x <= t) dp[t] += dp[t - x];
        return dp[target];
    }
}`,
          cpp: r`class Solution {
public:
    int combinationSum4(vector<int>& nums, int target) {
        vector<unsigned> dp(target + 1, 0);
        dp[0] = 1;
        for (int t = 1; t <= target; t++)
            for (int x : nums)
                if (x <= t) dp[t] += dp[t - x];
        return (int) dp[target];
    }
};`,
          python: r`class Solution:
    def combinationSum4(self, nums: List[int], target: int) -> int:
        dp = [1] + [0] * target
        for t in range(1, target + 1):
            dp[t] = sum(dp[t - x] for x in nums if x <= t)
        return dp[target]`,
          javascript: r`var combinationSum4 = function(nums, target) {
    const dp = new Array(target + 1).fill(0);
    dp[0] = 1;
    for (let t = 1; t <= target; t++)
        for (const x of nums)
            if (x <= t) dp[t] = (dp[t] + dp[t - x]) >>> 0;
    return dp[target];
};`,
        },
      },
    ],
  },

  'perfect-squares': {
    pattern: 'Unbounded knapsack over square numbers (or number theory: the four-square theorem)',
    approaches: [
      {
        level: 'Brute force', name: 'Recursion over the largest square used',
        idea: 'The fewest squares summing to `n` is 1 plus the fewest for `n − k²`, minimised over every square `k² <= n`.',
        steps: [
          '`fewest(0) = 0`.',
          '`fewest(n) = 1 + min(fewest(n − k²))` over `k = 1, 2, …` with `k² <= n`.',
        ],
        time: 'O(√n^n)', space: 'O(n)',
        why: 'Branching by up to √n at every level with no reuse — hopeless beyond tiny n.',
        timesOut: [4, 'generated'],
        code: {
          java: r`class Solution {
    public int numSquares(int n) {
        if (n == 0) return 0;
        int best = Integer.MAX_VALUE;
        for (int k = 1; k * k <= n; k++) best = Math.min(best, 1 + numSquares(n - k * k));
        return best;
    }
}`,
          cpp: r`class Solution {
public:
    int numSquares(int n) {
        if (n == 0) return 0;
        int best = INT_MAX;
        for (int k = 1; k * k <= n; k++) best = min(best, 1 + numSquares(n - k * k));
        return best;
    }
};`,
          python: r`class Solution:
    def numSquares(self, n: int) -> int:
        if n == 0:
            return 0
        return 1 + min(self.numSquares(n - k * k) for k in range(1, isqrt(n) + 1))`,
          javascript: r`var numSquares = function(n) {
    if (n === 0) return 0;
    let best = Infinity;
    for (let k = 1; k * k <= n; k++) best = Math.min(best, 1 + numSquares(n - k * k));
    return best;
};`,
        },
      },
      {
        level: 'Better', name: 'Bottom-up DP over 0..n',
        idea: 'Fill `dp[i]` = fewest squares summing to `i`, for every `i` up to `n`, from the same recurrence.',
        steps: [
          '`dp[0] = 0`.',
          'For each `i` from 1 to n: `dp[i] = 1 + min(dp[i − k²])` over `k² <= i`.',
          'Return `dp[n]`.',
        ],
        time: 'O(n·√n)', space: 'O(n)',
        why: 'n values, each trying up to √n squares: about 10⁶ steps for n = 10⁴.',
        code: {
          java: r`class Solution {
    public int numSquares(int n) {
        int[] dp = new int[n + 1];
        for (int i = 1; i <= n; i++) {
            dp[i] = Integer.MAX_VALUE;
            for (int k = 1; k * k <= i; k++) dp[i] = Math.min(dp[i], dp[i - k * k] + 1);
        }
        return dp[n];
    }
}`,
          cpp: r`class Solution {
public:
    int numSquares(int n) {
        vector<int> dp(n + 1, INT_MAX);
        dp[0] = 0;
        for (int i = 1; i <= n; i++)
            for (int k = 1; k * k <= i; k++) dp[i] = min(dp[i], dp[i - k * k] + 1);
        return dp[n];
    }
};`,
          python: r`class Solution:
    def numSquares(self, n: int) -> int:
        squares = [k * k for k in range(1, isqrt(n) + 1)]
        dp = [0] + [inf] * n
        for i in range(1, n + 1):
            for sq in squares:
                if sq > i:
                    break
                if dp[i - sq] + 1 < dp[i]:
                    dp[i] = dp[i - sq] + 1
        return dp[n]`,
          javascript: r`var numSquares = function(n) {
    const dp = new Array(n + 1).fill(Infinity);
    dp[0] = 0;
    for (let i = 1; i <= n; i++)
        for (let k = 1; k * k <= i; k++) dp[i] = Math.min(dp[i], dp[i - k * k] + 1);
    return dp[n];
};`,
        },
      },
      {
        level: 'Optimal', name: 'Number theory: the answer is always 1, 2, 3 or 4',
        idea: 'Lagrange\'s four-square theorem says every number is a sum of at most 4 squares, and Legendre\'s three-square theorem says it needs exactly 4 precisely when it has the form `4ᵃ·(8b + 7)`. So test for 1, then 4, then 2; otherwise the answer is 3.',
        steps: [
          'If `n` is a perfect square, return 1.',
          'Divide out factors of 4; if what remains is `7 mod 8`, return 4.',
          'If `n = i² + j²` for some `i` (check whether `n − i²` is a square), return 2.',
          'Otherwise return 3.',
        ],
        time: 'O(√n)', space: 'O(1)',
        why: 'Only the "two squares" check loops, over at most √n values of `i`. Worth knowing; in an interview the DP is usually what is expected, with this as a follow-up.',
        code: {
          java: r`class Solution {
    public int numSquares(int n) {
        if (isSquare(n)) return 1;
        int m = n;
        while (m % 4 == 0) m /= 4;
        if (m % 8 == 7) return 4;
        for (int i = 1; i * i <= n; i++) if (isSquare(n - i * i)) return 2;
        return 3;
    }

    private boolean isSquare(int x) {
        int r = (int) Math.sqrt(x);
        return r * r == x;
    }
}`,
          cpp: r`class Solution {
    bool isSquare(int x) {
        int r = (int) sqrt((double) x);
        while (r * r > x) r--;
        while ((r + 1) * (r + 1) <= x) r++;
        return r * r == x;
    }
public:
    int numSquares(int n) {
        if (isSquare(n)) return 1;
        int m = n;
        while (m % 4 == 0) m /= 4;
        if (m % 8 == 7) return 4;
        for (int i = 1; i * i <= n; i++) if (isSquare(n - i * i)) return 2;
        return 3;
    }
};`,
          python: r`class Solution:
    def numSquares(self, n: int) -> int:
        def is_square(x):
            return isqrt(x) ** 2 == x
        if is_square(n):
            return 1
        m = n
        while m % 4 == 0:
            m //= 4
        if m % 8 == 7:
            return 4
        if any(is_square(n - i * i) for i in range(1, isqrt(n) + 1)):
            return 2
        return 3`,
          javascript: r`var numSquares = function(n) {
    const isSquare = (x) => { const r = Math.round(Math.sqrt(x)); return r * r === x; };
    if (isSquare(n)) return 1;
    let m = n;
    while (m % 4 === 0) m /= 4;
    if (m % 8 === 7) return 4;
    for (let i = 1; i * i <= n; i++) if (isSquare(n - i * i)) return 2;
    return 3;
};`,
        },
      },
    ],
  },

  'ones-and-zeroes': {
    pattern: '0/1 knapsack with two capacities (zeros and ones)',
    approaches: [
      {
        level: 'Brute force', name: 'Recursion: take or skip each string',
        idea: 'For each string, either skip it or take it (if its zeros and ones still fit); return the largest number of strings taken.',
        steps: [
          'Count zeros and ones of each string.',
          '`best(i, m, n)`: 0 if `i == len`; otherwise the max of skipping and (if it fits) `1 + best(i + 1, m − zeros, n − ones)`.',
        ],
        time: 'O(2ᴸ)', space: 'O(L)',
        why: 'L strings, two choices each, no reuse.',
        code: {
          java: r`class Solution {
    private int[][] counts;

    public int findMaxForm(String[] strs, int m, int n) {
        counts = new int[strs.length][2];
        for (int i = 0; i < strs.length; i++)
            for (char c : strs[i].toCharArray()) counts[i][c - '0']++;
        return best(0, m, n);
    }

    private int best(int i, int m, int n) {
        if (i == counts.length) return 0;
        int result = best(i + 1, m, n);
        if (counts[i][0] <= m && counts[i][1] <= n) result = Math.max(result, 1 + best(i + 1, m - counts[i][0], n - counts[i][1]));
        return result;
    }
}`,
          cpp: r`class Solution {
    vector<pair<int, int>> counts;
    int best(size_t i, int m, int n) {
        if (i == counts.size()) return 0;
        int result = best(i + 1, m, n);
        auto [z, o] = counts[i];
        if (z <= m && o <= n) result = max(result, 1 + best(i + 1, m - z, n - o));
        return result;
    }
public:
    int findMaxForm(vector<string>& strs, int m, int n) {
        for (auto& s : strs) {
            int z = count(s.begin(), s.end(), '0');
            counts.push_back({z, (int) s.size() - z});
        }
        return best(0, m, n);
    }
};`,
          python: r`class Solution:
    def findMaxForm(self, strs: List[str], m: int, n: int) -> int:
        counts = [(s.count("0"), s.count("1")) for s in strs]
        def best(i, m, n):
            if i == len(counts):
                return 0
            result = best(i + 1, m, n)
            z, o = counts[i]
            if z <= m and o <= n:
                result = max(result, 1 + best(i + 1, m - z, n - o))
            return result
        return best(0, m, n)`,
          javascript: r`var findMaxForm = function(strs, m, n) {
    const counts = strs.map((s) => { const z = s.split('0').length - 1; return [z, s.length - z]; });
    const best = (i, m, n) => {
        if (i === counts.length) return 0;
        let result = best(i + 1, m, n);
        const [z, o] = counts[i];
        if (z <= m && o <= n) result = Math.max(result, 1 + best(i + 1, m - z, n - o));
        return result;
    };
    return best(0, m, n);
};`,
        },
      },
      {
        level: 'Optimal', name: '2-D knapsack table, both capacities iterated backwards',
        idea: '`dp[z][o]` = most strings that fit in `z` zeros and `o` ones using the strings processed so far. For each string, update the table from the largest capacities down so each string is used at most once.',
        steps: [
          '`dp` is (m + 1) × (n + 1) of zeros.',
          'For each string with `zeros`, `ones`: for `z` from m down to `zeros`, `o` from n down to `ones`: `dp[z][o] = max(dp[z][o], dp[z − zeros][o − ones] + 1)`.',
          'Return `dp[m][n]`.',
        ],
        time: 'O(L·m·n + S)', space: 'O(m·n)',
        why: 'L strings × (m + 1)(n + 1) cells, plus S to count characters. It is the 0/1 knapsack with a 2-D capacity, already compressed from three dimensions to two.',
        code: {
          java: r`class Solution {
    public int findMaxForm(String[] strs, int m, int n) {
        int[][] dp = new int[m + 1][n + 1];
        for (String s : strs) {
            int zeros = 0;
            for (char c : s.toCharArray()) if (c == '0') zeros++;
            int ones = s.length() - zeros;
            for (int z = m; z >= zeros; z--)
                for (int o = n; o >= ones; o--) dp[z][o] = Math.max(dp[z][o], dp[z - zeros][o - ones] + 1);
        }
        return dp[m][n];
    }
}`,
          cpp: r`class Solution {
public:
    int findMaxForm(vector<string>& strs, int m, int n) {
        vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));
        for (auto& s : strs) {
            int zeros = count(s.begin(), s.end(), '0'), ones = s.size() - zeros;
            for (int z = m; z >= zeros; z--)
                for (int o = n; o >= ones; o--) dp[z][o] = max(dp[z][o], dp[z - zeros][o - ones] + 1);
        }
        return dp[m][n];
    }
};`,
          python: r`class Solution:
    def findMaxForm(self, strs: List[str], m: int, n: int) -> int:
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        for s in strs:
            zeros = s.count("0")
            ones = len(s) - zeros
            for z in range(m, zeros - 1, -1):
                row, src = dp[z], dp[z - zeros]
                for o in range(n, ones - 1, -1):
                    if src[o - ones] + 1 > row[o]:
                        row[o] = src[o - ones] + 1
        return dp[m][n]`,
          javascript: r`var findMaxForm = function(strs, m, n) {
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (const s of strs) {
        const zeros = s.split('0').length - 1, ones = s.length - zeros;
        for (let z = m; z >= zeros; z--)
            for (let o = n; o >= ones; o--) dp[z][o] = Math.max(dp[z][o], dp[z - zeros][o - ones] + 1);
    }
    return dp[m][n];
};`,
        },
      },
    ],
  },
};
