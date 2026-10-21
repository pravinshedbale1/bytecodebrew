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
};
