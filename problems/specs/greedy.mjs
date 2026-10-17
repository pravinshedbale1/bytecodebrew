export default [
  {
    slug: 'assign-cookies', title: 'Assign Cookies', level: 'Easy',
    summary: 'Child i is content with a cookie of size at least g[i]; each child gets at most one cookie. Return the most content children.',
    method: 'findContentChildren', params: [['int[]', 'g'], ['int[]', 's']], returns: 'int',
    tests: [
      { in: [[1, 2, 3], [1, 1]], out: 1 },
      { in: [[1, 2], [1, 2, 3]], out: 2 },
      { in: [[5], []] },
      { in: [[10, 9, 8, 7], [5, 6, 7, 8]] },
    ],
    ref: `class Solution {
    public int findContentChildren(int[] g, int[] s) {
        Arrays.sort(g); Arrays.sort(s);
        int i = 0;
        for (int j = 0; j < s.length && i < g.length; j++) if (s[j] >= g[i]) i++;
        return i;
    }
}`,
  },
  {
    slug: 'best-time-to-buy-and-sell-stock', title: 'Best Time to Buy and Sell Stock', level: 'Easy',
    summary: 'Choose one day to buy and a later day to sell. Return the maximum profit, or 0.',
    method: 'maxProfit', params: [['int[]', 'prices']], returns: 'int',
    tests: [
      { in: [[7, 1, 5, 3, 6, 4]], out: 5 },
      { in: [[7, 6, 4, 3, 1]], out: 0 },
      { in: [[1]] },
      { in: [[2, 4, 1, 7]] },
    ],
    ref: `class Solution {
    public int maxProfit(int[] prices) { int lo = Integer.MAX_VALUE, best = 0; for (int p : prices) { lo = Math.min(lo, p); best = Math.max(best, p - lo); } return best; }
}`,
  },
  {
    slug: 'jump-game', title: 'Jump Game', level: 'Medium',
    summary: 'nums[i] is the furthest jump from index i. Starting at index 0, return whether you can reach the last index.',
    method: 'canJump', params: [['int[]', 'nums']], returns: 'boolean',
    tests: [
      { in: [[2, 3, 1, 1, 4]], out: true },
      { in: [[3, 2, 1, 0, 4]], out: false },
      { in: [[0]] },
      { in: [[2, 0, 0]] },
      { in: [[1, 0, 1]] },
    ],
    ref: `class Solution {
    public boolean canJump(int[] nums) { int reach = 0; for (int i = 0; i < nums.length; i++) { if (i > reach) return false; reach = Math.max(reach, i + nums[i]); } return true; }
}`,
  },
  {
    slug: 'jump-game-ii', title: 'Jump Game II', level: 'Medium',
    summary: 'nums[i] is the furthest jump from index i, and the end is always reachable. Return the fewest jumps from index 0 to the last index.',
    method: 'jump', params: [['int[]', 'nums']], returns: 'int',
    tests: [
      { in: [[2, 3, 1, 1, 4]], out: 2 },
      { in: [[2, 3, 0, 1, 4]], out: 2 },
      { in: [[0]] },
      { in: [[1, 1, 1, 1]] },
      { in: [[5, 9, 3, 2, 1, 0, 2, 3, 3, 1, 0, 0]] },
    ],
    ref: `class Solution {
    public int jump(int[] nums) {
        int jumps = 0, end = 0, far = 0;
        for (int i = 0; i < nums.length - 1; i++) { far = Math.max(far, i + nums[i]); if (i == end) { jumps++; end = far; } }
        return jumps;
    }
}`,
  },
  {
    slug: 'gas-station', title: 'Gas Station', level: 'Medium',
    summary: 'Stations on a circle give gas[i] and the trip to the next costs cost[i]. Return the starting station to complete the loop (unique), or -1.',
    method: 'canCompleteCircuit', params: [['int[]', 'gas'], ['int[]', 'cost']], returns: 'int',
    tests: [
      { in: [[1, 2, 3, 4, 5], [3, 4, 5, 1, 2]], out: 3 },
      { in: [[2, 3, 4], [3, 4, 3]], out: -1 },
      { in: [[5], [4]] },
      { in: [[5, 1, 2, 3, 4], [4, 4, 1, 5, 1]] },
    ],
    ref: `class Solution {
    public int canCompleteCircuit(int[] gas, int[] cost) {
        int total = 0, tank = 0, start = 0;
        for (int i = 0; i < gas.length; i++) { int d = gas[i] - cost[i]; total += d; tank += d; if (tank < 0) { start = i + 1; tank = 0; } }
        return total < 0 ? -1 : start;
    }
}`,
  },
  {
    slug: 'partition-labels', title: 'Partition Labels', level: 'Medium',
    summary: 'Split s into as many parts as possible so each letter appears in at most one part. Return the part sizes in order.',
    method: 'partitionLabels', params: [['String', 's']], returns: 'List<Integer>',
    tests: [
      { in: ['ababcbacadefegdehijhklij'], out: [9, 7, 8] },
      { in: ['eccbbbbdec'], out: [10] },
      { in: ['a'] },
      { in: ['abc'] },
    ],
    ref: `class Solution {
    public List<Integer> partitionLabels(String s) {
        int[] last = new int[26];
        for (int i = 0; i < s.length(); i++) last[s.charAt(i) - 'a'] = i;
        List<Integer> out = new ArrayList<>();
        int start = 0, end = 0;
        for (int i = 0; i < s.length(); i++) { end = Math.max(end, last[s.charAt(i) - 'a']); if (i == end) { out.add(end - start + 1); start = i + 1; } }
        return out;
    }
}`,
  },
  {
    slug: 'boats-to-save-people', title: 'Boats to Save People', level: 'Medium',
    summary: 'Each boat carries at most two people with total weight ≤ limit. Return the fewest boats to carry everyone.',
    method: 'numRescueBoats', params: [['int[]', 'people'], ['int', 'limit']], returns: 'int',
    tests: [
      { in: [[1, 2], 3], out: 1 },
      { in: [[3, 2, 2, 1], 3], out: 3 },
      { in: [[3, 5, 3, 4], 5], out: 4 },
      { in: [[5], 5] },
      { in: [[2, 2, 2, 2], 4] },
    ],
    ref: `class Solution {
    public int numRescueBoats(int[] people, int limit) {
        Arrays.sort(people);
        int boats = 0, i = 0, j = people.length - 1;
        while (i <= j) { if (people[i] + people[j] <= limit) i++; j--; boats++; }
        return boats;
    }
}`,
  },
  {
    slug: 'two-city-scheduling', title: 'Two City Scheduling', level: 'Medium',
    summary: 'costs[i] = [toA, toB]. Send exactly half of the 2n people to each city at minimum total cost.',
    method: 'twoCitySchedCost', params: [['int[][]', 'costs']], returns: 'int',
    tests: [
      { in: [[[10, 20], [30, 200], [400, 50], [30, 20]]], out: 110 },
      { in: [[[259, 770], [448, 54], [926, 667], [184, 139], [840, 118], [577, 469]]], out: 1859 },
      { in: [[[1, 2], [2, 1]]] },
      { in: [[[5, 5], [5, 5], [1, 9], [9, 1]]] },
    ],
    ref: `class Solution {
    public int twoCitySchedCost(int[][] costs) {
        Arrays.sort(costs, (a, b) -> Integer.compare(a[0] - a[1], b[0] - b[1]));
        int n = costs.length / 2, total = 0;
        for (int i = 0; i < costs.length; i++) total += i < n ? costs[i][0] : costs[i][1];
        return total;
    }
}`,
  },
  {
    slug: 'candy', title: 'Candy', level: 'Hard',
    summary: 'Every child gets at least one candy, and a child with a higher rating than a neighbour gets more candies than that neighbour. Return the fewest candies needed.',
    method: 'candy', params: [['int[]', 'ratings']], returns: 'int',
    tests: [
      { in: [[1, 0, 2]], out: 5 },
      { in: [[1, 2, 2]], out: 4 },
      { in: [[5]] },
      { in: [[1, 3, 4, 5, 2]] },
      { in: [[5, 4, 3, 2, 1]] },
    ],
    ref: `class Solution {
    public int candy(int[] r) {
        int n = r.length;
        int[] c = new int[n];
        Arrays.fill(c, 1);
        for (int i = 1; i < n; i++) if (r[i] > r[i - 1]) c[i] = c[i - 1] + 1;
        for (int i = n - 2; i >= 0; i--) if (r[i] > r[i + 1]) c[i] = Math.max(c[i], c[i + 1] + 1);
        int total = 0;
        for (int x : c) total += x;
        return total;
    }
}`,
  },
];
