const r = String.raw;

export default {
  'assign-cookies': {
    pattern: 'Greedy matching after sorting (smallest cookie that satisfies the least greedy child)',
    approaches: [
      {
        level: 'Brute force', name: 'For each child, search all cookies for the smallest that fits',
        idea: 'Serve children from least to most greedy; give each the smallest unused cookie that satisfies them, found by scanning every cookie.',
        steps: [
          'Sort `g`. Keep a `used` flag per cookie.',
          'For each child, scan all cookies for the smallest unused `s[j] >= g[i]`.',
          'If found, mark it used and count the child.',
        ],
        time: 'O(n·m + n log n)', space: 'O(m)',
        why: 'Each of the n children scans m cookies. The flags take O(m).',
        code: {
          java: r`class Solution {
    public int findContentChildren(int[] g, int[] s) {
        Arrays.sort(g);
        boolean[] used = new boolean[s.length];
        int content = 0;
        for (int need : g) {
            int best = -1;
            for (int j = 0; j < s.length; j++)
                if (!used[j] && s[j] >= need && (best == -1 || s[j] < s[best])) best = j;
            if (best != -1) { used[best] = true; content++; }
        }
        return content;
    }
}`,
          cpp: r`class Solution {
public:
    int findContentChildren(vector<int>& g, vector<int>& s) {
        sort(g.begin(), g.end());
        vector<bool> used(s.size(), false);
        int content = 0;
        for (int need : g) {
            int best = -1;
            for (int j = 0; j < (int) s.size(); j++)
                if (!used[j] && s[j] >= need && (best == -1 || s[j] < s[best])) best = j;
            if (best != -1) { used[best] = true; content++; }
        }
        return content;
    }
};`,
          python: r`class Solution:
    def findContentChildren(self, g: List[int], s: List[int]) -> int:
        used = [False] * len(s)
        content = 0
        for need in sorted(g):
            best = -1
            for j, size in enumerate(s):
                if not used[j] and size >= need and (best == -1 or size < s[best]):
                    best = j
            if best != -1:
                used[best] = True
                content += 1
        return content`,
          javascript: r`var findContentChildren = function(g, s) {
    g.sort((a, b) => a - b);
    const used = new Array(s.length).fill(false);
    let content = 0;
    for (const need of g) {
        let best = -1;
        for (let j = 0; j < s.length; j++)
            if (!used[j] && s[j] >= need && (best === -1 || s[j] < s[best])) best = j;
        if (best !== -1) { used[best] = true; content++; }
    }
    return content;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Sort both and match with two pointers',
        idea: 'With both lists sorted, walk the cookies from small to large. Each cookie goes to the least greedy unserved child if it is big enough; otherwise it is too small for everyone left, so skip it.',
        steps: [
          'Sort `g` and `s`. Set `child = 0`.',
          'For each cookie in increasing size: if `child < g.length` and the cookie is `>= g[child]`, serve that child (`child++`).',
          'Return `child`, the number of content children.',
        ],
        time: 'O(n log n + m log m)', space: 'O(1)',
        why: 'Two sorts and one linear pass (aside from the sorts\' own memory). Using the smallest cookie that works never hurts: any larger cookie saved is at least as useful later.',
        code: {
          java: r`class Solution {
    public int findContentChildren(int[] g, int[] s) {
        Arrays.sort(g);
        Arrays.sort(s);
        int child = 0;
        for (int cookie : s)
            if (child < g.length && cookie >= g[child]) child++;
        return child;
    }
}`,
          cpp: r`class Solution {
public:
    int findContentChildren(vector<int>& g, vector<int>& s) {
        sort(g.begin(), g.end());
        sort(s.begin(), s.end());
        int child = 0;
        for (int cookie : s)
            if (child < (int) g.size() && cookie >= g[child]) child++;
        return child;
    }
};`,
          python: r`class Solution:
    def findContentChildren(self, g: List[int], s: List[int]) -> int:
        g.sort()
        s.sort()
        child = 0
        for cookie in s:
            if child < len(g) and cookie >= g[child]:
                child += 1
        return child`,
          javascript: r`var findContentChildren = function(g, s) {
    g.sort((a, b) => a - b);
    s.sort((a, b) => a - b);
    let child = 0;
    for (const cookie of s)
        if (child < g.length && cookie >= g[child]) child++;
    return child;
};`,
        },
      },
    ],
  },

  'best-time-to-buy-and-sell-stock': {
    pattern: 'One pass tracking the minimum so far (best sale = today − cheapest earlier day)',
    approaches: [
      {
        level: 'Brute force', name: 'Try every buy day and sell day',
        idea: 'Check every pair of days `i < j` and keep the largest `prices[j] − prices[i]`.',
        steps: [
          'Set `best = 0`.',
          'For each `i` and each `j > i`, update `best` with `prices[j] − prices[i]`.',
          'Return `best`.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'n(n − 1)/2 pairs; for n = 10⁵ that is 5 × 10⁹.',
        code: {
          java: r`class Solution {
    public int maxProfit(int[] prices) {
        int best = 0;
        for (int i = 0; i < prices.length; i++)
            for (int j = i + 1; j < prices.length; j++) best = Math.max(best, prices[j] - prices[i]);
        return best;
    }
}`,
          cpp: r`class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int best = 0, n = prices.size();
        for (int i = 0; i < n; i++)
            for (int j = i + 1; j < n; j++) best = max(best, prices[j] - prices[i]);
        return best;
    }
};`,
          python: r`class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        n, best = len(prices), 0
        for i in range(n):
            for j in range(i + 1, n):
                best = max(best, prices[j] - prices[i])
        return best`,
          javascript: r`var maxProfit = function(prices) {
    let best = 0;
    for (let i = 0; i < prices.length; i++)
        for (let j = i + 1; j < prices.length; j++) best = Math.max(best, prices[j] - prices[i]);
    return best;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Track the cheapest price so far',
        idea: 'If you sell on day `j`, the best buy day is the cheapest day before it. So scan once, remembering the lowest price seen, and check the profit of selling today.',
        steps: [
          'Set `minPrice = ∞`, `best = 0`.',
          'For each price: update `best` with `price − minPrice`, then update `minPrice`.',
          'Return `best`.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'One pass with two variables. Updating `best` before `minPrice` ensures you never sell on the day you buy (which would only give 0 anyway).',
        code: {
          java: r`class Solution {
    public int maxProfit(int[] prices) {
        int minPrice = Integer.MAX_VALUE, best = 0;
        for (int p : prices) {
            best = Math.max(best, p - minPrice);
            minPrice = Math.min(minPrice, p);
        }
        return best;
    }
}`,
          cpp: r`class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int minPrice = INT_MAX, best = 0;
        for (int p : prices) {
            best = max(best, p - minPrice);
            minPrice = min(minPrice, p);
        }
        return best;
    }
};`,
          python: r`class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        min_price, best = inf, 0
        for p in prices:
            best = max(best, p - min_price)
            min_price = min(min_price, p)
        return best`,
          javascript: r`var maxProfit = function(prices) {
    let minPrice = Infinity, best = 0;
    for (const p of prices) {
        best = Math.max(best, p - minPrice);
        minPrice = Math.min(minPrice, p);
    }
    return best;
};`,
        },
      },
    ],
  },

  'jump-game': {
    pattern: 'Greedy farthest reach',
    approaches: [
      {
        level: 'Brute force', name: 'Try every jump recursively',
        idea: 'From index `i`, try every jump length from 1 to `nums[i]` and see whether any of them leads to the end.',
        steps: [
          '`canReach(i)`: if `i` is the last index, return true.',
          'For each step from `min(nums[i], last − i)` down to 1, if `canReach(i + step)` is true, return true.',
          'Return false. Answer `canReach(0)`.',
        ],
        time: 'O(2ⁿ)', space: 'O(n)',
        why: 'The same indices are explored again and again along different paths, which can be exponential; the recursion depth is up to n.',
        code: {
          java: r`class Solution {
    public boolean canJump(int[] nums) {
        return canReach(nums, 0);
    }

    private boolean canReach(int[] nums, int i) {
        int last = nums.length - 1;
        if (i == last) return true;
        for (int step = Math.min(nums[i], last - i); step >= 1; step--)
            if (canReach(nums, i + step)) return true;
        return false;
    }
}`,
          cpp: r`class Solution {
    bool canReach(vector<int>& nums, int i) {
        int last = nums.size() - 1;
        if (i == last) return true;
        for (int step = min(nums[i], last - i); step >= 1; step--)
            if (canReach(nums, i + step)) return true;
        return false;
    }
public:
    bool canJump(vector<int>& nums) {
        return canReach(nums, 0);
    }
};`,
          python: r`class Solution:
    def canJump(self, nums: List[int]) -> bool:
        last = len(nums) - 1
        def can_reach(i):
            if i == last:
                return True
            return any(can_reach(i + step) for step in range(min(nums[i], last - i), 0, -1))
        return can_reach(0)`,
          javascript: r`var canJump = function(nums) {
    const last = nums.length - 1;
    const canReach = (i) => {
        if (i === last) return true;
        for (let step = Math.min(nums[i], last - i); step >= 1; step--)
            if (canReach(i + step)) return true;
        return false;
    };
    return canReach(0);
};`,
        },
      },
      {
        level: 'Better', name: 'DP from the right: which indices are "good"?',
        idea: 'An index is good if some jump from it lands on a good index; the last index is good. Fill this in from right to left so every answer it depends on is already known.',
        steps: [
          'Mark the last index good.',
          'For `i` from n − 2 down to 0: `i` is good if any `j` in `i + 1 .. min(i + nums[i], n − 1)` is good.',
          'Return whether index 0 is good.',
        ],
        time: 'O(n²)', space: 'O(n)',
        why: 'Each index may check up to n later indices; the good/bad table is O(n).',
        code: {
          java: r`class Solution {
    public boolean canJump(int[] nums) {
        int n = nums.length;
        boolean[] good = new boolean[n];
        good[n - 1] = true;
        for (int i = n - 2; i >= 0; i--)
            for (int j = i + 1; j <= Math.min(i + nums[i], n - 1) && !good[i]; j++)
                if (good[j]) good[i] = true;
        return good[0];
    }
}`,
          cpp: r`class Solution {
public:
    bool canJump(vector<int>& nums) {
        int n = nums.size();
        vector<bool> good(n, false);
        good[n - 1] = true;
        for (int i = n - 2; i >= 0; i--)
            for (int j = i + 1; j <= min(i + nums[i], n - 1) && !good[i]; j++)
                if (good[j]) good[i] = true;
        return good[0];
    }
};`,
          python: r`class Solution:
    def canJump(self, nums: List[int]) -> bool:
        n = len(nums)
        good = [False] * n
        good[-1] = True
        for i in range(n - 2, -1, -1):
            good[i] = any(good[j] for j in range(i + 1, min(i + nums[i], n - 1) + 1))
        return good[0]`,
          javascript: r`var canJump = function(nums) {
    const n = nums.length, good = new Array(n).fill(false);
    good[n - 1] = true;
    for (let i = n - 2; i >= 0; i--)
        for (let j = i + 1; j <= Math.min(i + nums[i], n - 1) && !good[i]; j++)
            if (good[j]) good[i] = true;
    return good[0];
};`,
        },
      },
      {
        level: 'Optimal', name: 'Greedy: track the farthest reachable index',
        idea: 'Every index up to the farthest point reached so far is reachable. Walk forward, extending that farthest point; if you ever stand beyond it, you are stuck.',
        steps: [
          'Set `reach = 0`.',
          'For each index `i`: if `i > reach`, return false.',
          'Update `reach = max(reach, i + nums[i])`; if it reaches the last index, return true.',
          'Return true after the loop.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'One pass with one variable. The reachable set is always a prefix of the array, so a single number describes it.',
        code: {
          java: r`class Solution {
    public boolean canJump(int[] nums) {
        int reach = 0;
        for (int i = 0; i < nums.length; i++) {
            if (i > reach) return false;
            reach = Math.max(reach, i + nums[i]);
        }
        return true;
    }
}`,
          cpp: r`class Solution {
public:
    bool canJump(vector<int>& nums) {
        int reach = 0;
        for (int i = 0; i < (int) nums.size(); i++) {
            if (i > reach) return false;
            reach = max(reach, i + nums[i]);
        }
        return true;
    }
};`,
          python: r`class Solution:
    def canJump(self, nums: List[int]) -> bool:
        reach = 0
        for i, x in enumerate(nums):
            if i > reach:
                return False
            reach = max(reach, i + x)
        return True`,
          javascript: r`var canJump = function(nums) {
    let reach = 0;
    for (let i = 0; i < nums.length; i++) {
        if (i > reach) return false;
        reach = Math.max(reach, i + nums[i]);
    }
    return true;
};`,
        },
      },
    ],
  },

  'jump-game-ii': {
    pattern: 'Greedy BFS by levels (each jump count covers a window of indices)',
    approaches: [
      {
        level: 'Better', name: 'DP: fewest jumps to each index',
        idea: '`jumps[j]` = the fewest jumps to reach index `j`. From each index `i`, every index it can reach in one jump can be reached in `jumps[i] + 1`.',
        steps: [
          'Set `jumps[0] = 0` and every other entry to ∞.',
          'For each `i` in order, for each `j` in `i + 1 .. min(i + nums[i], n − 1)`, set `jumps[j] = min(jumps[j], jumps[i] + 1)`.',
          'Return `jumps[n − 1]`.',
        ],
        time: 'O(n·J)', space: 'O(n)',
        why: 'J = the largest jump (≤ 1000): each index relaxes up to J later indices. The table is O(n).',
        code: {
          java: r`class Solution {
    public int jump(int[] nums) {
        int n = nums.length;
        int[] jumps = new int[n];
        Arrays.fill(jumps, Integer.MAX_VALUE);
        jumps[0] = 0;
        for (int i = 0; i < n; i++)
            for (int j = i + 1; j <= Math.min(i + nums[i], n - 1); j++)
                jumps[j] = Math.min(jumps[j], jumps[i] + 1);
        return jumps[n - 1];
    }
}`,
          cpp: r`class Solution {
public:
    int jump(vector<int>& nums) {
        int n = nums.size();
        vector<int> jumps(n, INT_MAX);
        jumps[0] = 0;
        for (int i = 0; i < n; i++)
            for (int j = i + 1; j <= min(i + nums[i], n - 1); j++)
                jumps[j] = min(jumps[j], jumps[i] + 1);
        return jumps[n - 1];
    }
};`,
          python: r`class Solution:
    def jump(self, nums: List[int]) -> int:
        n = len(nums)
        jumps = [0] + [inf] * (n - 1)
        for i in range(n):
            for j in range(i + 1, min(i + nums[i], n - 1) + 1):
                jumps[j] = min(jumps[j], jumps[i] + 1)
        return jumps[-1]`,
          javascript: r`var jump = function(nums) {
    const n = nums.length, jumps = new Array(n).fill(Infinity);
    jumps[0] = 0;
    for (let i = 0; i < n; i++)
        for (let j = i + 1; j <= Math.min(i + nums[i], n - 1); j++)
            jumps[j] = Math.min(jumps[j], jumps[i] + 1);
    return jumps[n - 1];
};`,
        },
      },
      {
        level: 'Optimal', name: 'Greedy jump windows',
        idea: 'Indices reachable with exactly `j` jumps form a contiguous window. Scanning the current window, track the farthest index the next jump could reach; when the scan reaches the window\'s end, take a jump and the next window ends at that farthest point.',
        steps: [
          'Set `jumps = 0`, `end = 0` (end of the current window), `farthest = 0`.',
          'For `i` from 0 to n − 2: `farthest = max(farthest, i + nums[i])`.',
          'If `i == end`, the window is used up: `jumps++`, `end = farthest`.',
          'Return `jumps`.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'One pass with three variables — a breadth-first search over windows instead of single indices. The loop stops before the last index so no extra jump is counted from it.',
        code: {
          java: r`class Solution {
    public int jump(int[] nums) {
        int jumps = 0, end = 0, farthest = 0;
        for (int i = 0; i < nums.length - 1; i++) {
            farthest = Math.max(farthest, i + nums[i]);
            if (i == end) { jumps++; end = farthest; }
        }
        return jumps;
    }
}`,
          cpp: r`class Solution {
public:
    int jump(vector<int>& nums) {
        int jumps = 0, end = 0, farthest = 0;
        for (int i = 0; i + 1 < (int) nums.size(); i++) {
            farthest = max(farthest, i + nums[i]);
            if (i == end) { jumps++; end = farthest; }
        }
        return jumps;
    }
};`,
          python: r`class Solution:
    def jump(self, nums: List[int]) -> int:
        jumps = end = farthest = 0
        for i in range(len(nums) - 1):
            farthest = max(farthest, i + nums[i])
            if i == end:
                jumps += 1
                end = farthest
        return jumps`,
          javascript: r`var jump = function(nums) {
    let jumps = 0, end = 0, farthest = 0;
    for (let i = 0; i < nums.length - 1; i++) {
        farthest = Math.max(farthest, i + nums[i]);
        if (i === end) { jumps++; end = farthest; }
    }
    return jumps;
};`,
        },
      },
    ],
  },

  'gas-station': {
    pattern: 'Greedy with running sums (a failed stretch rules out every start inside it)',
    approaches: [
      {
        level: 'Brute force', name: 'Simulate from every start',
        idea: 'Try each station as the start and drive around, adding gas and subtracting cost; the first start whose tank never goes negative is the answer.',
        steps: [
          'For each start `s`, set `tank = 0`.',
          'For `k = 0 .. n − 1`, at station `(s + k) % n` add `gas − cost`; if the tank drops below 0, this start fails.',
          'Return the first start that completes the loop, or −1.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'n starts, each simulating up to n stations.',
        code: {
          java: r`class Solution {
    public int canCompleteCircuit(int[] gas, int[] cost) {
        int n = gas.length;
        for (int s = 0; s < n; s++) {
            int tank = 0, k = 0;
            for (; k < n; k++) {
                int i = (s + k) % n;
                tank += gas[i] - cost[i];
                if (tank < 0) break;
            }
            if (k == n) return s;
        }
        return -1;
    }
}`,
          cpp: r`class Solution {
public:
    int canCompleteCircuit(vector<int>& gas, vector<int>& cost) {
        int n = gas.size();
        for (int s = 0; s < n; s++) {
            int tank = 0, k = 0;
            for (; k < n; k++) {
                int i = (s + k) % n;
                tank += gas[i] - cost[i];
                if (tank < 0) break;
            }
            if (k == n) return s;
        }
        return -1;
    }
};`,
          python: r`class Solution:
    def canCompleteCircuit(self, gas: List[int], cost: List[int]) -> int:
        n = len(gas)
        for s in range(n):
            tank = 0
            for k in range(n):
                i = (s + k) % n
                tank += gas[i] - cost[i]
                if tank < 0:
                    break
            else:
                return s
        return -1`,
          javascript: r`var canCompleteCircuit = function(gas, cost) {
    const n = gas.length;
    for (let s = 0; s < n; s++) {
        let tank = 0, k = 0;
        for (; k < n; k++) {
            const i = (s + k) % n;
            tank += gas[i] - cost[i];
            if (tank < 0) break;
        }
        if (k === n) return s;
    }
    return -1;
};`,
        },
      },
      {
        level: 'Optimal', name: 'One pass: restart after the tank runs dry',
        idea: 'If the total gas is less than the total cost, no start works. Otherwise drive from a candidate start; if the tank goes negative at station `i`, no station between the start and `i` can be the start either (each would arrive with even less fuel), so try `i + 1` next.',
        steps: [
          'Keep `total` (sum of all `gas − cost`), `tank` and `start = 0`.',
          'For each `i`: add `gas[i] − cost[i]` to both `total` and `tank`.',
          'If `tank < 0`, set `start = i + 1` and `tank = 0`.',
          'Return `start` if `total >= 0`, else −1.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'One pass. When the total is non-negative, the final candidate makes it to the end, and the fuel left covers the deficit of the part before it, so it completes the circle.',
        code: {
          java: r`class Solution {
    public int canCompleteCircuit(int[] gas, int[] cost) {
        int total = 0, tank = 0, start = 0;
        for (int i = 0; i < gas.length; i++) {
            total += gas[i] - cost[i];
            tank += gas[i] - cost[i];
            if (tank < 0) { start = i + 1; tank = 0; }
        }
        return total >= 0 ? start : -1;
    }
}`,
          cpp: r`class Solution {
public:
    int canCompleteCircuit(vector<int>& gas, vector<int>& cost) {
        int total = 0, tank = 0, start = 0;
        for (int i = 0; i < (int) gas.size(); i++) {
            total += gas[i] - cost[i];
            tank += gas[i] - cost[i];
            if (tank < 0) { start = i + 1; tank = 0; }
        }
        return total >= 0 ? start : -1;
    }
};`,
          python: r`class Solution:
    def canCompleteCircuit(self, gas: List[int], cost: List[int]) -> int:
        total = tank = start = 0
        for i in range(len(gas)):
            total += gas[i] - cost[i]
            tank += gas[i] - cost[i]
            if tank < 0:
                start, tank = i + 1, 0
        return start if total >= 0 else -1`,
          javascript: r`var canCompleteCircuit = function(gas, cost) {
    let total = 0, tank = 0, start = 0;
    for (let i = 0; i < gas.length; i++) {
        total += gas[i] - cost[i];
        tank += gas[i] - cost[i];
        if (tank < 0) { start = i + 1; tank = 0; }
    }
    return total >= 0 ? start : -1;
};`,
        },
      },
    ],
  },

  'partition-labels': {
    pattern: 'Greedy with last occurrences (extend the part to the furthest last index)',
    approaches: [
      {
        level: 'Brute force', name: 'Find each letter\'s last position by scanning',
        idea: 'A part that contains a letter must extend to that letter\'s last occurrence. Grow the current part, finding last occurrences by scanning the string from the end each time.',
        steps: [
          'Start a part at `start = 0` with `end = 0`.',
          'For each `i` in the part, find the last index of `s[i]` by scanning from the end of `s`, and set `end` to the larger of the two.',
          'When `i == end`, the part is closed: record `end − start + 1` and start the next part at `i + 1`.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'Each of the n positions scans the string for its letter\'s last index (output aside).',
        code: {
          java: r`class Solution {
    public List<Integer> partitionLabels(String s) {
        List<Integer> out = new ArrayList<>();
        int start = 0, end = 0;
        for (int i = 0; i < s.length(); i++) {
            end = Math.max(end, s.lastIndexOf(s.charAt(i)));
            if (i == end) { out.add(end - start + 1); start = i + 1; }
        }
        return out;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> partitionLabels(string s) {
        vector<int> out;
        int start = 0, end = 0;
        for (int i = 0; i < (int) s.size(); i++) {
            end = max(end, (int) s.rfind(s[i]));
            if (i == end) { out.push_back(end - start + 1); start = i + 1; }
        }
        return out;
    }
};`,
          python: r`class Solution:
    def partitionLabels(self, s: str) -> List[int]:
        out, start, end = [], 0, 0
        for i, c in enumerate(s):
            end = max(end, s.rfind(c))
            if i == end:
                out.append(end - start + 1)
                start = i + 1
        return out`,
          javascript: r`var partitionLabels = function(s) {
    const out = [];
    let start = 0, end = 0;
    for (let i = 0; i < s.length; i++) {
        end = Math.max(end, s.lastIndexOf(s[i]));
        if (i === end) { out.push(end - start + 1); start = i + 1; }
    }
    return out;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Precompute last occurrences, then one sweep',
        idea: 'Record the last index of every letter in one pass. Then sweep: the current part must reach at least the last index of every letter seen in it; once the sweep reaches that point, close the part.',
        steps: [
          'Fill `last[c]` with the last index of each letter.',
          'Sweep `i` with `start` and `end`: `end = max(end, last[s[i]])`.',
          'When `i == end`, record `end − start + 1` and set `start = i + 1`.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'Two linear passes; the table has 26 entries. Closing a part as early as possible maximises the number of parts.',
        code: {
          java: r`class Solution {
    public List<Integer> partitionLabels(String s) {
        int[] last = new int[26];
        for (int i = 0; i < s.length(); i++) last[s.charAt(i) - 'a'] = i;
        List<Integer> out = new ArrayList<>();
        int start = 0, end = 0;
        for (int i = 0; i < s.length(); i++) {
            end = Math.max(end, last[s.charAt(i) - 'a']);
            if (i == end) { out.add(end - start + 1); start = i + 1; }
        }
        return out;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> partitionLabels(string s) {
        int last[26] = {0};
        for (int i = 0; i < (int) s.size(); i++) last[s[i] - 'a'] = i;
        vector<int> out;
        int start = 0, end = 0;
        for (int i = 0; i < (int) s.size(); i++) {
            end = max(end, last[s[i] - 'a']);
            if (i == end) { out.push_back(end - start + 1); start = i + 1; }
        }
        return out;
    }
};`,
          python: r`class Solution:
    def partitionLabels(self, s: str) -> List[int]:
        last = {c: i for i, c in enumerate(s)}
        out, start, end = [], 0, 0
        for i, c in enumerate(s):
            end = max(end, last[c])
            if i == end:
                out.append(end - start + 1)
                start = i + 1
        return out`,
          javascript: r`var partitionLabels = function(s) {
    const last = new Array(26).fill(0);
    for (let i = 0; i < s.length; i++) last[s.charCodeAt(i) - 97] = i;
    const out = [];
    let start = 0, end = 0;
    for (let i = 0; i < s.length; i++) {
        end = Math.max(end, last[s.charCodeAt(i) - 97]);
        if (i === end) { out.push(end - start + 1); start = i + 1; }
    }
    return out;
};`,
        },
      },
    ],
  },

  'boats-to-save-people': {
    pattern: 'Sort + two pointers (pair the heaviest with the lightest when possible)',
    approaches: [
      {
        level: 'Brute force', name: 'Heaviest first, search for the heaviest partner that fits',
        idea: 'Seat the heaviest unseated person; give them the heaviest remaining partner that still fits under the limit (found by scanning), or send them alone.',
        steps: [
          'Sort weights descending; keep a `seated` flag per person.',
          'For each unseated person (heaviest first): scan the remaining unseated people for the heaviest one with `weight + theirs <= limit`.',
          'Seat both (or just the first) in one boat and count it.',
        ],
        time: 'O(n²)', space: 'O(n)',
        why: 'Each boat may scan all remaining people. The flags take O(n).',
        code: {
          java: r`class Solution {
    public int numRescueBoats(int[] people, int limit) {
        Arrays.sort(people);
        int n = people.length, boats = 0;
        boolean[] seated = new boolean[n];
        for (int i = n - 1; i >= 0; i--) {
            if (seated[i]) continue;
            seated[i] = true;
            for (int j = i - 1; j >= 0; j--)
                if (!seated[j] && people[i] + people[j] <= limit) { seated[j] = true; break; }
            boats++;
        }
        return boats;
    }
}`,
          cpp: r`class Solution {
public:
    int numRescueBoats(vector<int>& people, int limit) {
        sort(people.begin(), people.end());
        int n = people.size(), boats = 0;
        vector<bool> seated(n, false);
        for (int i = n - 1; i >= 0; i--) {
            if (seated[i]) continue;
            seated[i] = true;
            for (int j = i - 1; j >= 0; j--)
                if (!seated[j] && people[i] + people[j] <= limit) { seated[j] = true; break; }
            boats++;
        }
        return boats;
    }
};`,
          python: r`class Solution:
    def numRescueBoats(self, people: List[int], limit: int) -> int:
        people.sort()
        n, boats = len(people), 0
        seated = [False] * n
        for i in range(n - 1, -1, -1):
            if seated[i]:
                continue
            seated[i] = True
            for j in range(i - 1, -1, -1):
                if not seated[j] and people[i] + people[j] <= limit:
                    seated[j] = True
                    break
            boats += 1
        return boats`,
          javascript: r`var numRescueBoats = function(people, limit) {
    people.sort((a, b) => a - b);
    const n = people.length, seated = new Array(n).fill(false);
    let boats = 0;
    for (let i = n - 1; i >= 0; i--) {
        if (seated[i]) continue;
        seated[i] = true;
        for (let j = i - 1; j >= 0; j--)
            if (!seated[j] && people[i] + people[j] <= limit) { seated[j] = true; break; }
        boats++;
    }
    return boats;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Sort, then pair heaviest with lightest',
        idea: 'The heaviest person needs a boat no matter what. If even the lightest person cannot share it, nobody can, so they go alone; otherwise pair them with the lightest. Two pointers do this in one pass.',
        steps: [
          'Sort the weights; `i` at the lightest, `j` at the heaviest.',
          'While `i <= j`: if `people[i] + people[j] <= limit`, the lightest joins (`i++`).',
          'The heaviest always leaves in this boat (`j--`); count the boat.',
        ],
        time: 'O(n log n)', space: 'O(1)',
        why: 'Sorting dominates; the two-pointer pass is O(n) (aside from the sort\'s own memory). Pairing with the lightest is safe: if the lightest does not fit with the heaviest, no one does.',
        code: {
          java: r`class Solution {
    public int numRescueBoats(int[] people, int limit) {
        Arrays.sort(people);
        int i = 0, j = people.length - 1, boats = 0;
        while (i <= j) {
            if (people[i] + people[j] <= limit) i++;
            j--;
            boats++;
        }
        return boats;
    }
}`,
          cpp: r`class Solution {
public:
    int numRescueBoats(vector<int>& people, int limit) {
        sort(people.begin(), people.end());
        int i = 0, j = (int) people.size() - 1, boats = 0;
        while (i <= j) {
            if (people[i] + people[j] <= limit) i++;
            j--;
            boats++;
        }
        return boats;
    }
};`,
          python: r`class Solution:
    def numRescueBoats(self, people: List[int], limit: int) -> int:
        people.sort()
        i, j, boats = 0, len(people) - 1, 0
        while i <= j:
            if people[i] + people[j] <= limit:
                i += 1
            j -= 1
            boats += 1
        return boats`,
          javascript: r`var numRescueBoats = function(people, limit) {
    people.sort((a, b) => a - b);
    let i = 0, j = people.length - 1, boats = 0;
    while (i <= j) {
        if (people[i] + people[j] <= limit) i++;
        j--;
        boats++;
    }
    return boats;
};`,
        },
      },
    ],
  },

  'two-city-scheduling': {
    pattern: 'Greedy by the difference aCost − bCost (or DP over how many went to A)',
    approaches: [
      {
        level: 'Better', name: 'DP over people and the number sent to A',
        idea: '`dp[i][a]` = the cheapest cost for the first `i` people with exactly `a` of them sent to city A. Each person goes to A or B.',
        steps: [
          '`dp[0][0] = 0`, everything else ∞.',
          'For person `i` (0-based) and each count `a`: `dp[i + 1][a] = min(dp[i][a] + bCost, dp[i][a − 1] + aCost)` (when `a >= 1`).',
          'Return `dp[2n][n]`.',
        ],
        time: 'O(n²)', space: 'O(n²)',
        why: '2n people × up to n + 1 counts, O(1) each; the table has the same size.',
        code: {
          java: r`class Solution {
    public int twoCitySchedCost(int[][] costs) {
        int m = costs.length, n = m / 2, INF = Integer.MAX_VALUE / 2;
        int[][] dp = new int[m + 1][n + 1];
        for (int[] row : dp) Arrays.fill(row, INF);
        dp[0][0] = 0;
        for (int i = 0; i < m; i++)
            for (int a = 0; a <= n; a++) {
                if (dp[i][a] == INF) continue;
                dp[i + 1][a] = Math.min(dp[i + 1][a], dp[i][a] + costs[i][1]);
                if (a < n) dp[i + 1][a + 1] = Math.min(dp[i + 1][a + 1], dp[i][a] + costs[i][0]);
            }
        return dp[m][n];
    }
}`,
          cpp: r`class Solution {
public:
    int twoCitySchedCost(vector<vector<int>>& costs) {
        int m = costs.size(), n = m / 2, INF = INT_MAX / 2;
        vector<vector<int>> dp(m + 1, vector<int>(n + 1, INF));
        dp[0][0] = 0;
        for (int i = 0; i < m; i++)
            for (int a = 0; a <= n; a++) {
                if (dp[i][a] == INF) continue;
                dp[i + 1][a] = min(dp[i + 1][a], dp[i][a] + costs[i][1]);
                if (a < n) dp[i + 1][a + 1] = min(dp[i + 1][a + 1], dp[i][a] + costs[i][0]);
            }
        return dp[m][n];
    }
};`,
          python: r`class Solution:
    def twoCitySchedCost(self, costs: List[List[int]]) -> int:
        m = len(costs)
        n = m // 2
        dp = [[inf] * (n + 1) for _ in range(m + 1)]
        dp[0][0] = 0
        for i, (a_cost, b_cost) in enumerate(costs):
            for a in range(n + 1):
                if dp[i][a] == inf:
                    continue
                dp[i + 1][a] = min(dp[i + 1][a], dp[i][a] + b_cost)
                if a < n:
                    dp[i + 1][a + 1] = min(dp[i + 1][a + 1], dp[i][a] + a_cost)
        return dp[m][n]`,
          javascript: r`var twoCitySchedCost = function(costs) {
    const m = costs.length, n = m / 2;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(Infinity));
    dp[0][0] = 0;
    for (let i = 0; i < m; i++)
        for (let a = 0; a <= n; a++) {
            if (dp[i][a] === Infinity) continue;
            dp[i + 1][a] = Math.min(dp[i + 1][a], dp[i][a] + costs[i][1]);
            if (a < n) dp[i + 1][a + 1] = Math.min(dp[i + 1][a + 1], dp[i][a] + costs[i][0]);
        }
    return dp[m][n];
};`,
        },
      },
      {
        level: 'Optimal', name: 'Sort by aCost − bCost',
        idea: 'Imagine first sending everyone to B. Moving a person to A changes the total by `aCost − bCost`. Exactly n people must move, so move the n with the smallest (most negative) change.',
        steps: [
          'Sort people by `aCost − bCost`.',
          'Send the first n to A and the remaining n to B.',
          'Return the sum.',
        ],
        time: 'O(n log n)', space: 'O(1)',
        why: 'One sort plus a linear sum (aside from the sort\'s own memory).',
        code: {
          java: r`class Solution {
    public int twoCitySchedCost(int[][] costs) {
        Arrays.sort(costs, (x, y) -> Integer.compare(x[0] - x[1], y[0] - y[1]));
        int n = costs.length / 2, total = 0;
        for (int i = 0; i < costs.length; i++) total += i < n ? costs[i][0] : costs[i][1];
        return total;
    }
}`,
          cpp: r`class Solution {
public:
    int twoCitySchedCost(vector<vector<int>>& costs) {
        sort(costs.begin(), costs.end(), [](auto& x, auto& y) { return x[0] - x[1] < y[0] - y[1]; });
        int n = costs.size() / 2, total = 0;
        for (int i = 0; i < (int) costs.size(); i++) total += i < n ? costs[i][0] : costs[i][1];
        return total;
    }
};`,
          python: r`class Solution:
    def twoCitySchedCost(self, costs: List[List[int]]) -> int:
        costs.sort(key=lambda c: c[0] - c[1])
        n = len(costs) // 2
        return sum(c[0] for c in costs[:n]) + sum(c[1] for c in costs[n:])`,
          javascript: r`var twoCitySchedCost = function(costs) {
    costs.sort((x, y) => (x[0] - x[1]) - (y[0] - y[1]));
    const n = costs.length / 2;
    let total = 0;
    for (let i = 0; i < costs.length; i++) total += i < n ? costs[i][0] : costs[i][1];
    return total;
};`,
        },
      },
    ],
  },

  'candy': {
    pattern: 'Two greedy passes (left neighbours, then right neighbours), or counting slopes',
    approaches: [
      {
        level: 'Brute force', name: 'Fix violations until none remain',
        idea: 'Start everyone at 1 candy. Repeatedly sweep the line; whenever a child has a higher rating than a neighbour but not more candies, raise them to one more than that neighbour. Stop when a sweep changes nothing.',
        steps: [
          'Give every child 1 candy.',
          'Sweep: for each `i`, if `ratings[i] > ratings[i − 1]` and `candy[i] <= candy[i − 1]`, set `candy[i] = candy[i − 1] + 1`; likewise for the right neighbour.',
          'Repeat sweeps until nothing changes; return the sum.',
        ],
        time: 'O(n²)', space: 'O(n)',
        why: 'A long falling slope may need up to n sweeps of O(n) each. Raising only to the minimum needed keeps the total minimal.',
        code: {
          java: r`class Solution {
    public int candy(int[] ratings) {
        int n = ratings.length;
        int[] c = new int[n];
        Arrays.fill(c, 1);
        boolean changed = true;
        while (changed) {
            changed = false;
            for (int i = 0; i < n; i++) {
                if (i > 0 && ratings[i] > ratings[i - 1] && c[i] <= c[i - 1]) { c[i] = c[i - 1] + 1; changed = true; }
                if (i + 1 < n && ratings[i] > ratings[i + 1] && c[i] <= c[i + 1]) { c[i] = c[i + 1] + 1; changed = true; }
            }
        }
        int total = 0;
        for (int x : c) total += x;
        return total;
    }
}`,
          cpp: r`class Solution {
public:
    int candy(vector<int>& ratings) {
        int n = ratings.size();
        vector<int> c(n, 1);
        bool changed = true;
        while (changed) {
            changed = false;
            for (int i = 0; i < n; i++) {
                if (i > 0 && ratings[i] > ratings[i - 1] && c[i] <= c[i - 1]) { c[i] = c[i - 1] + 1; changed = true; }
                if (i + 1 < n && ratings[i] > ratings[i + 1] && c[i] <= c[i + 1]) { c[i] = c[i + 1] + 1; changed = true; }
            }
        }
        return accumulate(c.begin(), c.end(), 0);
    }
};`,
          python: r`class Solution:
    def candy(self, ratings: List[int]) -> int:
        n = len(ratings)
        c = [1] * n
        changed = True
        while changed:
            changed = False
            for i in range(n):
                if i > 0 and ratings[i] > ratings[i - 1] and c[i] <= c[i - 1]:
                    c[i] = c[i - 1] + 1
                    changed = True
                if i + 1 < n and ratings[i] > ratings[i + 1] and c[i] <= c[i + 1]:
                    c[i] = c[i + 1] + 1
                    changed = True
        return sum(c)`,
          javascript: r`var candy = function(ratings) {
    const n = ratings.length, c = new Array(n).fill(1);
    let changed = true;
    while (changed) {
        changed = false;
        for (let i = 0; i < n; i++) {
            if (i > 0 && ratings[i] > ratings[i - 1] && c[i] <= c[i - 1]) { c[i] = c[i - 1] + 1; changed = true; }
            if (i + 1 < n && ratings[i] > ratings[i + 1] && c[i] <= c[i + 1]) { c[i] = c[i + 1] + 1; changed = true; }
        }
    }
    return c.reduce((a, b) => a + b, 0);
};`,
        },
      },
      {
        level: 'Better', name: 'Two passes with one array',
        idea: 'Satisfy the left-neighbour rule with a left-to-right pass, then the right-neighbour rule with a right-to-left pass, keeping the larger value so the first rule still holds.',
        steps: [
          'Give every child 1 candy.',
          'Left to right: if `ratings[i] > ratings[i − 1]`, set `c[i] = c[i − 1] + 1`.',
          'Right to left: if `ratings[i] > ratings[i + 1]`, set `c[i] = max(c[i], c[i + 1] + 1)`.',
          'Return the sum.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Two linear passes and one array of n counts. Each value is the smallest that satisfies both directions, so the total is minimal.',
        code: {
          java: r`class Solution {
    public int candy(int[] ratings) {
        int n = ratings.length;
        int[] c = new int[n];
        Arrays.fill(c, 1);
        for (int i = 1; i < n; i++) if (ratings[i] > ratings[i - 1]) c[i] = c[i - 1] + 1;
        for (int i = n - 2; i >= 0; i--) if (ratings[i] > ratings[i + 1]) c[i] = Math.max(c[i], c[i + 1] + 1);
        int total = 0;
        for (int x : c) total += x;
        return total;
    }
}`,
          cpp: r`class Solution {
public:
    int candy(vector<int>& ratings) {
        int n = ratings.size();
        vector<int> c(n, 1);
        for (int i = 1; i < n; i++) if (ratings[i] > ratings[i - 1]) c[i] = c[i - 1] + 1;
        for (int i = n - 2; i >= 0; i--) if (ratings[i] > ratings[i + 1]) c[i] = max(c[i], c[i + 1] + 1);
        return accumulate(c.begin(), c.end(), 0);
    }
};`,
          python: r`class Solution:
    def candy(self, ratings: List[int]) -> int:
        n = len(ratings)
        c = [1] * n
        for i in range(1, n):
            if ratings[i] > ratings[i - 1]:
                c[i] = c[i - 1] + 1
        for i in range(n - 2, -1, -1):
            if ratings[i] > ratings[i + 1]:
                c[i] = max(c[i], c[i + 1] + 1)
        return sum(c)`,
          javascript: r`var candy = function(ratings) {
    const n = ratings.length, c = new Array(n).fill(1);
    for (let i = 1; i < n; i++) if (ratings[i] > ratings[i - 1]) c[i] = c[i - 1] + 1;
    for (let i = n - 2; i >= 0; i--) if (ratings[i] > ratings[i + 1]) c[i] = Math.max(c[i], c[i + 1] + 1);
    return c.reduce((a, b) => a + b, 0);
};`,
        },
      },
      {
        level: 'Optimal', name: 'One pass counting up and down slopes',
        idea: 'Candies along a rising run go 1, 2, 3, …, and along a falling run the last child gets 1 and each one before it one more. Track the current rising length `up`, falling length `down`, and the height `peak` reached before the fall; add each child\'s candies as you go. When a fall gets as long as the rise before it, the peak itself must grow by one too.',
        steps: [
          'Start with `total = 1` (the first child) and `up = down = peak = 0`.',
          'Rising (`r[i] > r[i − 1]`): `up++`, `peak = up`, `down = 0`, add `up + 1`.',
          'Equal: reset `up = down = peak = 0`, add 1.',
          'Falling: `up = 0`, `down++`; add `down + 1` (each child in the fall shifts up by one, plus the new child), minus 1 if `peak >= down` (the peak is still tall enough).',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'One pass with four counters and no array. It produces the same totals as the two-pass method.',
        code: {
          java: r`class Solution {
    public int candy(int[] ratings) {
        int total = 1, up = 0, down = 0, peak = 0;
        for (int i = 1; i < ratings.length; i++) {
            if (ratings[i] > ratings[i - 1]) { up++; peak = up; down = 0; total += up + 1; }
            else if (ratings[i] == ratings[i - 1]) { up = down = peak = 0; total += 1; }
            else { up = 0; down++; total += down + 1 - (peak >= down ? 1 : 0); }
        }
        return total;
    }
}`,
          cpp: r`class Solution {
public:
    int candy(vector<int>& ratings) {
        int total = 1, up = 0, down = 0, peak = 0;
        for (size_t i = 1; i < ratings.size(); i++) {
            if (ratings[i] > ratings[i - 1]) { up++; peak = up; down = 0; total += up + 1; }
            else if (ratings[i] == ratings[i - 1]) { up = down = peak = 0; total += 1; }
            else { up = 0; down++; total += down + 1 - (peak >= down ? 1 : 0); }
        }
        return total;
    }
};`,
          python: r`class Solution:
    def candy(self, ratings: List[int]) -> int:
        total, up, down, peak = 1, 0, 0, 0
        for i in range(1, len(ratings)):
            if ratings[i] > ratings[i - 1]:
                up += 1
                peak, down = up, 0
                total += up + 1
            elif ratings[i] == ratings[i - 1]:
                up = down = peak = 0
                total += 1
            else:
                up = 0
                down += 1
                total += down + 1 - (1 if peak >= down else 0)
        return total`,
          javascript: r`var candy = function(ratings) {
    let total = 1, up = 0, down = 0, peak = 0;
    for (let i = 1; i < ratings.length; i++) {
        if (ratings[i] > ratings[i - 1]) { up++; peak = up; down = 0; total += up + 1; }
        else if (ratings[i] === ratings[i - 1]) { up = down = peak = 0; total += 1; }
        else { up = 0; down++; total += down + 1 - (peak >= down ? 1 : 0); }
    }
    return total;
};`,
        },
      },
    ],
  },
  'lemonade-change': {
    pattern: 'Greedy change-making: spend the least flexible bill first',
    approaches: [
      {
        level: 'Brute force', name: 'Keep every bill and search for change',
        idea: 'Store all the bills you hold. For each customer, try combinations of held bills that add up to the change owed.',
        steps: [
          'Keep a list of bills in the till.',
          'For a $10, look for a $5 to remove. For a $20, try to remove a $10 and a $5, or else three $5s, by scanning the list.',
          'Add the customer\'s bill to the till; fail if no combination was found.',
        ],
        time: 'O(n²)', space: 'O(n)',
        why: 'Each customer may scan the whole till. It mirrors how you might do it by hand, but the till only ever needs two numbers: how many $5s and how many $10s.',
        code: {
          java: r`class Solution {
    public boolean lemonadeChange(int[] bills) {
        List<Integer> till = new ArrayList<>();
        for (int b : bills) {
            if (b == 10 && !till.remove(Integer.valueOf(5))) return false;
            if (b == 20) {
                if (till.contains(10) && till.contains(5)) { till.remove(Integer.valueOf(10)); till.remove(Integer.valueOf(5)); }
                else if (Collections.frequency(till, 5) >= 3) for (int k = 0; k < 3; k++) till.remove(Integer.valueOf(5));
                else return false;
            }
            till.add(b);
        }
        return true;
    }
}`,
          cpp: r`class Solution {
    bool take(vector<int>& till, int v) {
        auto it = find(till.begin(), till.end(), v);
        if (it == till.end()) return false;
        till.erase(it);
        return true;
    }
public:
    bool lemonadeChange(vector<int>& bills) {
        vector<int> till;
        for (int b : bills) {
            if (b == 10 && !take(till, 5)) return false;
            if (b == 20) {
                bool hasTen = find(till.begin(), till.end(), 10) != till.end();
                bool hasFive = find(till.begin(), till.end(), 5) != till.end();
                if (hasTen && hasFive) { take(till, 10); take(till, 5); }
                else if (count(till.begin(), till.end(), 5) >= 3) { take(till, 5); take(till, 5); take(till, 5); }
                else return false;
            }
            till.push_back(b);
        }
        return true;
    }
};`,
          python: r`class Solution:
    def lemonadeChange(self, bills: List[int]) -> bool:
        till = []
        for b in bills:
            if b == 10:
                if 5 not in till:
                    return False
                till.remove(5)
            elif b == 20:
                if 10 in till and 5 in till:
                    till.remove(10)
                    till.remove(5)
                elif till.count(5) >= 3:
                    for _ in range(3):
                        till.remove(5)
                else:
                    return False
            till.append(b)
        return True`,
          javascript: r`var lemonadeChange = function(bills) {
    const till = [];
    const take = (v) => {
        const i = till.indexOf(v);
        if (i < 0) return false;
        till.splice(i, 1);
        return true;
    };
    for (const b of bills) {
        if (b === 10 && !take(5)) return false;
        if (b === 20) {
            if (till.includes(10) && till.includes(5)) { take(10); take(5); }
            else if (till.filter((x) => x === 5).length >= 3) { take(5); take(5); take(5); }
            else return false;
        }
        till.push(b);
    }
    return true;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Count fives and tens',
        idea: 'Track only how many $5 and $10 bills you hold. For a $20, give a $10 + $5 when possible and three $5s otherwise.',
        steps: [
          'A $5: `fives++`.',
          'A $10: needs a $5 (`fives--`, `tens++`), else fail.',
          'A $20: if `tens > 0 && fives > 0`, use one of each; else if `fives >= 3`, use three; else fail.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: '$20 bills are never given as change, so they need not be counted. Preferring the $10 is the greedy choice: a $5 can pay any future customer, a $10 can only help a $20 customer, so keeping $5s never hurts.',
        code: {
          java: r`class Solution {
    public boolean lemonadeChange(int[] bills) {
        int fives = 0, tens = 0;
        for (int b : bills) {
            if (b == 5) fives++;
            else if (b == 10) { if (fives == 0) return false; fives--; tens++; }
            else if (tens > 0 && fives > 0) { tens--; fives--; }
            else if (fives >= 3) fives -= 3;
            else return false;
        }
        return true;
    }
}`,
          cpp: r`class Solution {
public:
    bool lemonadeChange(vector<int>& bills) {
        int fives = 0, tens = 0;
        for (int b : bills) {
            if (b == 5) fives++;
            else if (b == 10) { if (fives == 0) return false; fives--; tens++; }
            else if (tens > 0 && fives > 0) { tens--; fives--; }
            else if (fives >= 3) fives -= 3;
            else return false;
        }
        return true;
    }
};`,
          python: r`class Solution:
    def lemonadeChange(self, bills: List[int]) -> bool:
        fives = tens = 0
        for b in bills:
            if b == 5:
                fives += 1
            elif b == 10:
                if fives == 0:
                    return False
                fives -= 1
                tens += 1
            elif tens and fives:
                tens -= 1
                fives -= 1
            elif fives >= 3:
                fives -= 3
            else:
                return False
        return True`,
          javascript: r`var lemonadeChange = function(bills) {
    let fives = 0, tens = 0;
    for (const b of bills) {
        if (b === 5) fives++;
        else if (b === 10) { if (fives === 0) return false; fives--; tens++; }
        else if (tens > 0 && fives > 0) { tens--; fives--; }
        else if (fives >= 3) fives -= 3;
        else return false;
    }
    return true;
};`,
        },
      },
    ],
  },
  'merge-triplets-to-form-target-triplet': {
    pattern: 'Greedy filter: drop anything that overshoots, then cover each position',
    approaches: [
      {
        level: 'Better', name: 'Filter, then merge everything usable',
        idea: 'Discard triplets that exceed the target anywhere. Merging all remaining ones gives the element-wise maximum, which equals the target exactly when the target is reachable.',
        steps: [
          'Collect every triplet with all three values at most the target\'s.',
          'Take the element-wise maximum over that list (start from [0,0,0]).',
          'Return whether it equals `target`.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Merges only increase values, so an overshooting triplet can never be part of the answer, and merging more usable triplets never hurts. The extra list is unnecessary: the maximum can be tracked on the fly.',
        code: {
          java: r`class Solution {
    public boolean mergeTriplets(int[][] triplets, int[] target) {
        List<int[]> usable = new ArrayList<>();
        for (int[] t : triplets) if (t[0] <= target[0] && t[1] <= target[1] && t[2] <= target[2]) usable.add(t);
        int[] best = new int[3];
        for (int[] t : usable) for (int k = 0; k < 3; k++) best[k] = Math.max(best[k], t[k]);
        return Arrays.equals(best, target);
    }
}`,
          cpp: r`class Solution {
public:
    bool mergeTriplets(vector<vector<int>>& triplets, vector<int>& target) {
        vector<vector<int>> usable;
        for (auto& t : triplets) if (t[0] <= target[0] && t[1] <= target[1] && t[2] <= target[2]) usable.push_back(t);
        vector<int> best(3, 0);
        for (auto& t : usable) for (int k = 0; k < 3; k++) best[k] = max(best[k], t[k]);
        return best == target;
    }
};`,
          python: r`class Solution:
    def mergeTriplets(self, triplets: List[List[int]], target: List[int]) -> bool:
        usable = [t for t in triplets if all(t[k] <= target[k] for k in range(3))]
        best = [0, 0, 0]
        for t in usable:
            best = [max(best[k], t[k]) for k in range(3)]
        return best == target`,
          javascript: r`var mergeTriplets = function(triplets, target) {
    const usable = triplets.filter((t) => t[0] <= target[0] && t[1] <= target[1] && t[2] <= target[2]);
    const best = [0, 0, 0];
    for (const t of usable) for (let k = 0; k < 3; k++) best[k] = Math.max(best[k], t[k]);
    return best[0] === target[0] && best[1] === target[1] && best[2] === target[2];
};`,
        },
      },
      {
        level: 'Optimal', name: 'One pass with three flags',
        idea: 'Skip any triplet that overshoots. For the rest, just record whether each position of the target has been matched exactly by some usable triplet.',
        steps: [
          'Set flags `a = b = c = false`.',
          'For each triplet with all values at most the target\'s, set `a |= t[0] == x`, `b |= t[1] == y`, `c |= t[2] == z`.',
          'Return `a && b && c`.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'Usable triplets never push a value above the target, so the merged maximum at each position equals the target value exactly when some usable triplet already has it there.',
        code: {
          java: r`class Solution {
    public boolean mergeTriplets(int[][] triplets, int[] target) {
        boolean a = false, b = false, c = false;
        for (int[] t : triplets) {
            if (t[0] > target[0] || t[1] > target[1] || t[2] > target[2]) continue;
            a |= t[0] == target[0]; b |= t[1] == target[1]; c |= t[2] == target[2];
        }
        return a && b && c;
    }
}`,
          cpp: r`class Solution {
public:
    bool mergeTriplets(vector<vector<int>>& triplets, vector<int>& target) {
        bool a = false, b = false, c = false;
        for (auto& t : triplets) {
            if (t[0] > target[0] || t[1] > target[1] || t[2] > target[2]) continue;
            a |= t[0] == target[0]; b |= t[1] == target[1]; c |= t[2] == target[2];
        }
        return a && b && c;
    }
};`,
          python: r`class Solution:
    def mergeTriplets(self, triplets: List[List[int]], target: List[int]) -> bool:
        x, y, z = target
        a = b = c = False
        for t in triplets:
            if t[0] > x or t[1] > y or t[2] > z:
                continue
            a |= t[0] == x
            b |= t[1] == y
            c |= t[2] == z
        return a and b and c`,
          javascript: r`var mergeTriplets = function(triplets, target) {
    let a = false, b = false, c = false;
    for (const t of triplets) {
        if (t[0] > target[0] || t[1] > target[1] || t[2] > target[2]) continue;
        a ||= t[0] === target[0]; b ||= t[1] === target[1]; c ||= t[2] === target[2];
    }
    return a && b && c;
};`,
        },
      },
    ],
  },
  'valid-parenthesis-string': {
    pattern: 'Greedy range of possible open-bracket counts',
    approaches: [
      {
        level: 'Brute force', name: 'Try every meaning of every star',
        idea: 'Recursively replace each "*" with "(", ")" or nothing and check whether the open count ever goes negative or ends non-zero.',
        steps: [
          '`go(i, open)`: if `open < 0` return false; if `i == n` return `open == 0`.',
          'For "(" recurse with `open + 1`; for ")" with `open − 1`.',
          'For "*" return `go(i + 1, open + 1) || go(i + 1, open − 1) || go(i + 1, open)`.',
        ],
        time: 'O(3ᵏ · n)', space: 'O(n)',
        why: 'k is the number of stars, each tripling the search. A string with fifty stars is far beyond reach, so it times out on those tests.',
        code: {
          java: r`class Solution {
    public boolean checkValidString(String s) { return go(s, 0, 0); }
    private boolean go(String s, int i, int open) {
        if (open < 0) return false;
        if (i == s.length()) return open == 0;
        char c = s.charAt(i);
        if (c == '(') return go(s, i + 1, open + 1);
        if (c == ')') return go(s, i + 1, open - 1);
        return go(s, i + 1, open + 1) || go(s, i + 1, open - 1) || go(s, i + 1, open);
    }
}`,
          cpp: r`class Solution {
    bool go(const string& s, int i, int open) {
        if (open < 0) return false;
        if (i == (int) s.size()) return open == 0;
        if (s[i] == '(') return go(s, i + 1, open + 1);
        if (s[i] == ')') return go(s, i + 1, open - 1);
        return go(s, i + 1, open + 1) || go(s, i + 1, open - 1) || go(s, i + 1, open);
    }
public:
    bool checkValidString(string s) { return go(s, 0, 0); }
};`,
          python: r`class Solution:
    def checkValidString(self, s: str) -> bool:
        def go(i, open_):
            if open_ < 0:
                return False
            if i == len(s):
                return open_ == 0
            if s[i] == '(':
                return go(i + 1, open_ + 1)
            if s[i] == ')':
                return go(i + 1, open_ - 1)
            return go(i + 1, open_ + 1) or go(i + 1, open_ - 1) or go(i + 1, open_)
        return go(0, 0)`,
          javascript: r`var checkValidString = function(s) {
    const go = (i, open) => {
        if (open < 0) return false;
        if (i === s.length) return open === 0;
        if (s[i] === "(") return go(i + 1, open + 1);
        if (s[i] === ")") return go(i + 1, open - 1);
        return go(i + 1, open + 1) || go(i + 1, open - 1) || go(i + 1, open);
    };
    return go(0, 0);
};`,
        },
        timesOut: [7, 8],
      },
      {
        level: 'Better', name: 'Memoised (index, open count)',
        idea: 'The recursion only depends on the position and the current open count, both at most n. Cache the result of each state.',
        steps: [
          'Use a table `memo[i][open]` with three values: unknown, true, false.',
          'Run the same recursion, returning the cached result when a state repeats.',
          'Return `go(0, 0)`.',
        ],
        time: 'O(n²)', space: 'O(n²)',
        why: 'n · n states, O(1) each. Always correct and easy to derive from the brute force, which makes it a safe interview answer before the greedy insight.',
        code: {
          java: r`class Solution {
    private Boolean[][] memo;
    public boolean checkValidString(String s) {
        memo = new Boolean[s.length() + 1][s.length() + 1];
        return go(s, 0, 0);
    }
    private boolean go(String s, int i, int open) {
        if (open < 0 || open > s.length()) return false;
        if (i == s.length()) return open == 0;
        if (memo[i][open] != null) return memo[i][open];
        char c = s.charAt(i);
        boolean r;
        if (c == '(') r = go(s, i + 1, open + 1);
        else if (c == ')') r = go(s, i + 1, open - 1);
        else r = go(s, i + 1, open + 1) || go(s, i + 1, open - 1) || go(s, i + 1, open);
        return memo[i][open] = r;
    }
}`,
          cpp: r`class Solution {
    vector<vector<int>> memo;
    bool go(const string& s, int i, int open) {
        if (open < 0 || open > (int) s.size()) return false;
        if (i == (int) s.size()) return open == 0;
        int& m = memo[i][open];
        if (m != -1) return m;
        bool r;
        if (s[i] == '(') r = go(s, i + 1, open + 1);
        else if (s[i] == ')') r = go(s, i + 1, open - 1);
        else r = go(s, i + 1, open + 1) || go(s, i + 1, open - 1) || go(s, i + 1, open);
        return m = r;
    }
public:
    bool checkValidString(string s) {
        memo.assign(s.size() + 1, vector<int>(s.size() + 2, -1));
        return go(s, 0, 0);
    }
};`,
          python: r`class Solution:
    def checkValidString(self, s: str) -> bool:
        n = len(s)
        @lru_cache(maxsize=None)
        def go(i, open_):
            if open_ < 0 or open_ > n:
                return False
            if i == n:
                return open_ == 0
            if s[i] == '(':
                return go(i + 1, open_ + 1)
            if s[i] == ')':
                return go(i + 1, open_ - 1)
            return go(i + 1, open_ + 1) or go(i + 1, open_ - 1) or go(i + 1, open_)
        return go(0, 0)`,
          javascript: r`var checkValidString = function(s) {
    const n = s.length, memo = new Map();
    const go = (i, open) => {
        if (open < 0 || open > n) return false;
        if (i === n) return open === 0;
        const key = i * 128 + open;
        if (memo.has(key)) return memo.get(key);
        let r;
        if (s[i] === "(") r = go(i + 1, open + 1);
        else if (s[i] === ")") r = go(i + 1, open - 1);
        else r = go(i + 1, open + 1) || go(i + 1, open - 1) || go(i + 1, open);
        memo.set(key, r);
        return r;
    };
    return go(0, 0);
};`,
        },
      },
      {
        level: 'Optimal', name: 'Track the lowest and highest possible open count',
        idea: 'Every choice of stars gives some open count after each character, and those counts form a contiguous range `[lo, hi]`. Track the range instead of each choice.',
        steps: [
          '"(" raises both `lo` and `hi`; ")" lowers both; "*" lowers `lo` and raises `hi`.',
          'If `hi < 0`, even treating every star as "(" cannot cover the ")": return `false`.',
          'Clamp `lo` at 0 (a negative count is never a valid choice). At the end, return `lo == 0`.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'Each step changes the possible counts by exactly −1, 0 or +1, so the set of reachable counts stays an interval, and only its ends matter. Clamping `lo` drops choices that would already be invalid.',
        code: {
          java: r`class Solution {
    public boolean checkValidString(String s) {
        int lo = 0, hi = 0;
        for (char c : s.toCharArray()) {
            if (c == '(') { lo++; hi++; }
            else if (c == ')') { lo--; hi--; }
            else { lo--; hi++; }
            if (hi < 0) return false;
            if (lo < 0) lo = 0;
        }
        return lo == 0;
    }
}`,
          cpp: r`class Solution {
public:
    bool checkValidString(string s) {
        int lo = 0, hi = 0;
        for (char c : s) {
            if (c == '(') { lo++; hi++; }
            else if (c == ')') { lo--; hi--; }
            else { lo--; hi++; }
            if (hi < 0) return false;
            if (lo < 0) lo = 0;
        }
        return lo == 0;
    }
};`,
          python: r`class Solution:
    def checkValidString(self, s: str) -> bool:
        lo = hi = 0
        for c in s:
            if c == '(':
                lo, hi = lo + 1, hi + 1
            elif c == ')':
                lo, hi = lo - 1, hi - 1
            else:
                lo, hi = lo - 1, hi + 1
            if hi < 0:
                return False
            lo = max(lo, 0)
        return lo == 0`,
          javascript: r`var checkValidString = function(s) {
    let lo = 0, hi = 0;
    for (const c of s) {
        if (c === "(") { lo++; hi++; }
        else if (c === ")") { lo--; hi--; }
        else { lo--; hi++; }
        if (hi < 0) return false;
        if (lo < 0) lo = 0;
    }
    return lo === 0;
};`,
        },
      },
    ],
  },
  'hand-of-straights': {
    pattern: 'Greedy from the smallest card with a sorted count map',
    approaches: [
      {
        level: 'Brute force', name: 'Sort, then pull out runs from a list',
        idea: 'Sort the cards. Repeatedly take the smallest remaining card and search the list for the next `groupSize − 1` consecutive values, removing each one.',
        steps: [
          'Sort `hand` into a list.',
          'While the list is not empty, remove its first value `v`, then for `v + 1 … v + groupSize − 1` find and remove one occurrence each.',
          'If any value is missing, return `false`; otherwise `true`.',
        ],
        time: 'O(n²)', space: 'O(n)',
        why: 'Searching and deleting from the middle of a list are linear operations, done once per card. Correct, but a count map makes each step O(log n).',
        code: {
          java: r`class Solution {
    public boolean isNStraightHand(int[] hand, int groupSize) {
        if (hand.length % groupSize != 0) return false;
        List<Integer> cards = new ArrayList<>();
        for (int h : hand) cards.add(h);
        Collections.sort(cards);
        while (!cards.isEmpty()) {
            int v = cards.remove(0);
            for (int k = 1; k < groupSize; k++)
                if (!cards.remove(Integer.valueOf(v + k))) return false;
        }
        return true;
    }
}`,
          cpp: r`class Solution {
public:
    bool isNStraightHand(vector<int>& hand, int groupSize) {
        if (hand.size() % groupSize != 0) return false;
        vector<int> cards(hand);
        sort(cards.begin(), cards.end());
        while (!cards.empty()) {
            int v = cards[0];
            cards.erase(cards.begin());
            for (int k = 1; k < groupSize; k++) {
                auto it = find(cards.begin(), cards.end(), v + k);
                if (it == cards.end()) return false;
                cards.erase(it);
            }
        }
        return true;
    }
};`,
          python: r`class Solution:
    def isNStraightHand(self, hand: List[int], groupSize: int) -> bool:
        if len(hand) % groupSize:
            return False
        cards = sorted(hand)
        while cards:
            v = cards.pop(0)
            for k in range(1, groupSize):
                if v + k not in cards:
                    return False
                cards.remove(v + k)
        return True`,
          javascript: r`var isNStraightHand = function(hand, groupSize) {
    if (hand.length % groupSize !== 0) return false;
    const cards = [...hand].sort((a, b) => a - b);
    while (cards.length) {
        const v = cards.shift();
        for (let k = 1; k < groupSize; k++) {
            const i = cards.indexOf(v + k);
            if (i < 0) return false;
            cards.splice(i, 1);
        }
    }
    return true;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Sorted count map',
        idea: 'Count each value. The smallest remaining value must start a group, so repeatedly consume one of each value from it upwards.',
        steps: [
          'If `n % groupSize != 0`, return `false`. Count the values in a sorted map (or sort the distinct values).',
          'Take the smallest value `v` still present; for `v … v + groupSize − 1`, decrement each count, failing if a value is missing.',
          'Remove values whose count reaches 0; repeat until the map is empty.',
        ],
        time: 'O(n log n)', space: 'O(n)',
        why: 'Each card is decremented once, at O(log n) per map operation. The greedy choice is forced: nothing smaller than the minimum exists, so the minimum card can only be the start of a run.',
        code: {
          java: r`class Solution {
    public boolean isNStraightHand(int[] hand, int groupSize) {
        if (hand.length % groupSize != 0) return false;
        TreeMap<Integer, Integer> count = new TreeMap<>();
        for (int h : hand) count.merge(h, 1, Integer::sum);
        while (!count.isEmpty()) {
            int start = count.firstKey();
            for (int v = start; v < start + groupSize; v++) {
                Integer c = count.get(v);
                if (c == null) return false;
                if (c == 1) count.remove(v); else count.put(v, c - 1);
            }
        }
        return true;
    }
}`,
          cpp: r`class Solution {
public:
    bool isNStraightHand(vector<int>& hand, int groupSize) {
        if (hand.size() % groupSize != 0) return false;
        map<int, int> count;
        for (int h : hand) count[h]++;
        while (!count.empty()) {
            int start = count.begin()->first;
            for (int v = start; v < start + groupSize; v++) {
                auto it = count.find(v);
                if (it == count.end()) return false;
                if (--it->second == 0) count.erase(it);
            }
        }
        return true;
    }
};`,
          python: r`class Solution:
    def isNStraightHand(self, hand: List[int], groupSize: int) -> bool:
        if len(hand) % groupSize:
            return False
        count = Counter(hand)
        for v in sorted(count):
            c = count[v]
            if c == 0:
                continue
            for k in range(groupSize):
                if count[v + k] < c:
                    return False
                count[v + k] -= c
        return True`,
          javascript: r`var isNStraightHand = function(hand, groupSize) {
    if (hand.length % groupSize !== 0) return false;
    const count = new Map();
    for (const h of hand) count.set(h, (count.get(h) || 0) + 1);
    for (const v of [...count.keys()].sort((a, b) => a - b)) {
        const c = count.get(v);
        if (c === 0) continue;
        for (let k = 0; k < groupSize; k++) {
            const have = count.get(v + k) || 0;
            if (have < c) return false;
            count.set(v + k, have - c);
        }
    }
    return true;
};`,
        },
      },
    ],
  },
  'dota2-senate': {
    pattern: 'Greedy bans simulated with two queues',
    approaches: [
      {
        level: 'Brute force', name: 'Simulate rounds on the string',
        idea: 'Walk through the senators in order. Each active senator bans the next active opponent, searching forward (and wrapping around) for them; repeat rounds until one party is left.',
        steps: [
          'Keep a `banned` array and counts of active R and D senators.',
          'For each active senator in turn, if the other party has no active members, that party has lost. Otherwise scan forward cyclically for the next active opponent and ban them.',
          'Return the party left standing.',
        ],
        time: 'O(n²)', space: 'O(n)',
        why: 'Each ban may scan up to n positions, and there are up to n − 1 bans. Banning the next opponent in line is optimal because that is the senator who would otherwise act soonest against you.',
        code: {
          java: r`class Solution {
    public String predictPartyVictory(String senate) {
        int n = senate.length(), r = 0, d = 0;
        boolean[] banned = new boolean[n];
        for (char c : senate.toCharArray()) if (c == 'R') r++; else d++;
        while (true) {
            for (int i = 0; i < n; i++) {
                if (banned[i]) continue;
                char me = senate.charAt(i);
                if (me == 'R' ? d == 0 : r == 0) return me == 'R' ? "Radiant" : "Dire";
                for (int j = (i + 1) % n; ; j = (j + 1) % n) {
                    if (!banned[j] && senate.charAt(j) != me) {
                        banned[j] = true;
                        if (me == 'R') d--; else r--;
                        break;
                    }
                }
            }
        }
    }
}`,
          cpp: r`class Solution {
public:
    string predictPartyVictory(string senate) {
        int n = senate.size(), r = 0, d = 0;
        vector<bool> banned(n, false);
        for (char c : senate) (c == 'R' ? r : d)++;
        while (true) {
            for (int i = 0; i < n; i++) {
                if (banned[i]) continue;
                char me = senate[i];
                if (me == 'R' ? d == 0 : r == 0) return me == 'R' ? "Radiant" : "Dire";
                for (int j = (i + 1) % n; ; j = (j + 1) % n) {
                    if (!banned[j] && senate[j] != me) {
                        banned[j] = true;
                        (me == 'R' ? d : r)--;
                        break;
                    }
                }
            }
        }
    }
};`,
          python: r`class Solution:
    def predictPartyVictory(self, senate: str) -> str:
        n = len(senate)
        banned = [False] * n
        left = {'R': senate.count('R'), 'D': senate.count('D')}
        while True:
            for i in range(n):
                if banned[i]:
                    continue
                me = senate[i]
                other = 'D' if me == 'R' else 'R'
                if left[other] == 0:
                    return "Radiant" if me == 'R' else "Dire"
                j = (i + 1) % n
                while banned[j] or senate[j] == me:
                    j = (j + 1) % n
                banned[j] = True
                left[other] -= 1`,
          javascript: r`var predictPartyVictory = function(senate) {
    const n = senate.length, banned = new Array(n).fill(false);
    const left = { R: 0, D: 0 };
    for (const c of senate) left[c]++;
    while (true) {
        for (let i = 0; i < n; i++) {
            if (banned[i]) continue;
            const me = senate[i], other = me === "R" ? "D" : "R";
            if (left[other] === 0) return me === "R" ? "Radiant" : "Dire";
            let j = (i + 1) % n;
            while (banned[j] || senate[j] === me) j = (j + 1) % n;
            banned[j] = true;
            left[other]--;
        }
    }
};`,
        },
      },
      {
        level: 'Optimal', name: 'Two queues of turn positions',
        idea: 'Keep each party\'s senators as a queue of positions. The front senator with the smaller position acts first: they ban the other front and rejoin their queue for the next round at position + n.',
        steps: [
          'Push every index into the R queue or the D queue.',
          'While both are non-empty, pop the fronts `a` (R) and `b` (D). The smaller one wins this duel and is pushed back as `index + n`.',
          'Return the party whose queue is not empty.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Every duel removes one senator for good, so there are at most n duels, each O(1). Adding n keeps the turn order correct across rounds without rebuilding anything.',
        code: {
          java: r`class Solution {
    public String predictPartyVictory(String senate) {
        int n = senate.length();
        Deque<Integer> r = new ArrayDeque<>(), d = new ArrayDeque<>();
        for (int i = 0; i < n; i++) (senate.charAt(i) == 'R' ? r : d).add(i);
        while (!r.isEmpty() && !d.isEmpty()) {
            int a = r.poll(), b = d.poll();
            if (a < b) r.add(a + n); else d.add(b + n);
        }
        return r.isEmpty() ? "Dire" : "Radiant";
    }
}`,
          cpp: r`class Solution {
public:
    string predictPartyVictory(string senate) {
        int n = senate.size();
        queue<int> r, d;
        for (int i = 0; i < n; i++) (senate[i] == 'R' ? r : d).push(i);
        while (!r.empty() && !d.empty()) {
            int a = r.front(), b = d.front();
            r.pop(); d.pop();
            if (a < b) r.push(a + n); else d.push(b + n);
        }
        return r.empty() ? "Dire" : "Radiant";
    }
};`,
          python: r`class Solution:
    def predictPartyVictory(self, senate: str) -> str:
        n = len(senate)
        r = deque(i for i, c in enumerate(senate) if c == 'R')
        d = deque(i for i, c in enumerate(senate) if c == 'D')
        while r and d:
            a, b = r.popleft(), d.popleft()
            if a < b:
                r.append(a + n)
            else:
                d.append(b + n)
        return "Radiant" if r else "Dire"`,
          javascript: r`var predictPartyVictory = function(senate) {
    const n = senate.length, r = new Queue(), d = new Queue();
    for (let i = 0; i < n; i++) (senate[i] === "R" ? r : d).enqueue(i);
    while (!r.isEmpty() && !d.isEmpty()) {
        const a = r.dequeue(), b = d.dequeue();
        if (a < b) r.enqueue(a + n); else d.enqueue(b + n);
    }
    return r.isEmpty() ? "Dire" : "Radiant";
};`,
        },
      },
    ],
  },
  'jump-game-vii': {
    pattern: 'Reachability DP with a sliding-window count',
    approaches: [
      {
        level: 'Brute force', name: 'Check every jump',
        idea: 'Mark index 0 reachable. For every reachable index, mark every "0" within its jump range as reachable.',
        steps: [
          'Set `ok[0] = true`.',
          'For each `i` with `ok[i]`, mark `ok[j] = true` for every `j` in `[i + minJump, min(i + maxJump, n − 1)]` with `s[j] == "0"`.',
          'Return `ok[n − 1]`.',
        ],
        time: 'O(n · (maxJump − minJump))', space: 'O(n)',
        why: 'Each reachable index scans its whole jump window. With a window of 50,000 and 10⁵ indices that is billions of steps, so it times out on the large test.',
        code: {
          java: r`class Solution {
    public boolean canReach(String s, int minJump, int maxJump) {
        int n = s.length();
        boolean[] ok = new boolean[n];
        ok[0] = true;
        for (int i = 0; i < n; i++) {
            if (!ok[i]) continue;
            for (int j = i + minJump; j <= Math.min(i + maxJump, n - 1); j++)
                if (s.charAt(j) == '0') ok[j] = true;
        }
        return ok[n - 1];
    }
}`,
          cpp: r`class Solution {
public:
    bool canReach(string s, int minJump, int maxJump) {
        int n = s.size();
        vector<bool> ok(n, false);
        ok[0] = true;
        for (int i = 0; i < n; i++) {
            if (!ok[i]) continue;
            for (int j = i + minJump; j <= min(i + maxJump, n - 1); j++)
                if (s[j] == '0') ok[j] = true;
        }
        return ok[n - 1];
    }
};`,
          python: r`class Solution:
    def canReach(self, s: str, minJump: int, maxJump: int) -> bool:
        n = len(s)
        ok = [False] * n
        ok[0] = True
        for i in range(n):
            if ok[i]:
                for j in range(i + minJump, min(i + maxJump, n - 1) + 1):
                    if s[j] == '0':
                        ok[j] = True
        return ok[n - 1]`,
          javascript: r`var canReach = function(s, minJump, maxJump) {
    const n = s.length, ok = new Array(n).fill(false);
    ok[0] = true;
    for (let i = 0; i < n; i++) {
        if (!ok[i]) continue;
        for (let j = i + minJump; j <= Math.min(i + maxJump, n - 1); j++)
            if (s[j] === "0") ok[j] = true;
    }
    return ok[n - 1];
};`,
        },
      },
      {
        level: 'Better', name: 'BFS with a "farthest scheduled" pointer',
        idea: 'BFS from index 0, but remember the farthest index already examined. Each new window only scans the part beyond it, so every index is looked at once.',
        steps: [
          'Queue index 0 and set `farthest = 0`.',
          'Pop `i`; scan `j` from `max(i + minJump, farthest + 1)` to `min(i + maxJump, n − 1)`, queueing each `"0"`.',
          'Set `farthest = i + maxJump`. Return true when `n − 1` is queued.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Windows of later indices start later, so scanning only past `farthest` never misses anything, and each index is scanned at most once. The queue costs O(n) memory, which the DP below avoids keeping as a separate structure.',
        code: {
          java: r`class Solution {
    public boolean canReach(String s, int minJump, int maxJump) {
        int n = s.length(), farthest = 0;
        Deque<Integer> q = new ArrayDeque<>();
        q.add(0);
        while (!q.isEmpty()) {
            int i = q.poll();
            if (i == n - 1) return true;
            for (int j = Math.max(i + minJump, farthest + 1); j <= Math.min(i + maxJump, n - 1); j++)
                if (s.charAt(j) == '0') q.add(j);
            farthest = Math.max(farthest, i + maxJump);
        }
        return false;
    }
}`,
          cpp: r`class Solution {
public:
    bool canReach(string s, int minJump, int maxJump) {
        int n = s.size(), farthest = 0;
        queue<int> q;
        q.push(0);
        while (!q.empty()) {
            int i = q.front(); q.pop();
            if (i == n - 1) return true;
            for (int j = max(i + minJump, farthest + 1); j <= min(i + maxJump, n - 1); j++)
                if (s[j] == '0') q.push(j);
            farthest = max(farthest, i + maxJump);
        }
        return false;
    }
};`,
          python: r`class Solution:
    def canReach(self, s: str, minJump: int, maxJump: int) -> bool:
        n, farthest = len(s), 0
        q = deque([0])
        while q:
            i = q.popleft()
            if i == n - 1:
                return True
            for j in range(max(i + minJump, farthest + 1), min(i + maxJump, n - 1) + 1):
                if s[j] == '0':
                    q.append(j)
            farthest = max(farthest, i + maxJump)
        return False`,
          javascript: r`var canReach = function(s, minJump, maxJump) {
    const n = s.length, q = [0];
    let farthest = 0;
    for (let head = 0; head < q.length; head++) {
        const i = q[head];
        if (i === n - 1) return true;
        for (let j = Math.max(i + minJump, farthest + 1); j <= Math.min(i + maxJump, n - 1); j++)
            if (s[j] === "0") q.push(j);
        farthest = Math.max(farthest, i + maxJump);
    }
    return false;
};`,
        },
      },
      {
        level: 'Optimal', name: 'DP with a sliding count of reachable indices',
        idea: 'Index `j` is reachable if it is a "0" and some reachable index lies in `[j − maxJump, j − minJump]`. Keep a running count of reachable indices in that window as it slides right.',
        steps: [
          'Set `ok[0] = true` and `count = 0`.',
          'For `j` from 1: if `j − minJump >= 0` and `ok[j − minJump]`, increment `count` (it entered the window); if `j − maxJump − 1 >= 0` and `ok[j − maxJump − 1]`, decrement it (it left).',
          'Set `ok[j] = count > 0 && s[j] == "0"`. Return `ok[n − 1]`.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Each index enters and leaves the window once, so every step is O(1). This "sliding window over a DP array" trick turns many range-reachability DPs from O(n · k) into O(n); a prefix-sum array over `ok` is an equivalent formulation.',
        code: {
          java: r`class Solution {
    public boolean canReach(String s, int minJump, int maxJump) {
        int n = s.length();
        boolean[] ok = new boolean[n];
        ok[0] = true;
        int reachable = 0;
        for (int i = 1; i < n; i++) {
            if (i - minJump >= 0 && ok[i - minJump]) reachable++;
            if (i - maxJump - 1 >= 0 && ok[i - maxJump - 1]) reachable--;
            ok[i] = reachable > 0 && s.charAt(i) == '0';
        }
        return ok[n - 1];
    }
}`,
          cpp: r`class Solution {
public:
    bool canReach(string s, int minJump, int maxJump) {
        int n = s.size(), reachable = 0;
        vector<bool> ok(n, false);
        ok[0] = true;
        for (int i = 1; i < n; i++) {
            if (i - minJump >= 0 && ok[i - minJump]) reachable++;
            if (i - maxJump - 1 >= 0 && ok[i - maxJump - 1]) reachable--;
            ok[i] = reachable > 0 && s[i] == '0';
        }
        return ok[n - 1];
    }
};`,
          python: r`class Solution:
    def canReach(self, s: str, minJump: int, maxJump: int) -> bool:
        n = len(s)
        ok = [False] * n
        ok[0] = True
        reachable = 0
        for i in range(1, n):
            if i - minJump >= 0 and ok[i - minJump]:
                reachable += 1
            if i - maxJump - 1 >= 0 and ok[i - maxJump - 1]:
                reachable -= 1
            ok[i] = reachable > 0 and s[i] == '0'
        return ok[n - 1]`,
          javascript: r`var canReach = function(s, minJump, maxJump) {
    const n = s.length, ok = new Array(n).fill(false);
    ok[0] = true;
    let reachable = 0;
    for (let i = 1; i < n; i++) {
        if (i - minJump >= 0 && ok[i - minJump]) reachable++;
        if (i - maxJump - 1 >= 0 && ok[i - maxJump - 1]) reachable--;
        ok[i] = reachable > 0 && s[i] === "0";
    }
    return ok[n - 1];
};`,
        },
      },
    ],
  },
};
