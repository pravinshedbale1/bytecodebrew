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
  {
    slug: 'lemonade-change', title: 'Lemonade Change', level: 'Easy',
    summary: 'Lemonade costs $5. Customers pay in order with a $5, $10 or $20 bill, and you start with no change. Return true if you can give every customer correct change.',
    method: 'lemonadeChange', params: [['int[]', 'bills']], returns: 'boolean',
    tests: [
      { in: [[5, 5, 5, 10, 20]], out: true },
      { in: [[5, 5, 10, 10, 20]], out: false },
      { in: [[10]] },
      { in: [[5, 5, 5, 5, 20, 20]] },
      { in: [[5, 10, 5, 20]] },
      { in: [[5, 5, 5, 20, 5, 10, 5, 20]] },
    ],
    ref: `class Solution {
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
  },
  {
    slug: 'merge-triplets-to-form-target-triplet', title: 'Merge Triplets to Form Target Triplet', level: 'Medium',
    summary: 'An operation replaces triplet j with the element-wise maximum of triplets i and j. Return true if, after any number of operations, some triplet can equal target.',
    method: 'mergeTriplets', params: [['int[][]', 'triplets'], ['int[]', 'target']], returns: 'boolean',
    tests: [
      { in: [[[2, 5, 3], [1, 8, 4], [1, 7, 5]], [2, 7, 5]], out: true },
      { in: [[[3, 4, 5], [4, 5, 6]], [3, 2, 5]], out: false },
      { in: [[[2, 5, 3], [2, 3, 4], [1, 2, 5], [5, 2, 3]], [5, 5, 5]], out: true },
      { in: [[[1, 1, 1]], [1, 1, 1]] },
      { in: [[[1, 3, 1], [3, 1, 1]], [3, 3, 2]] },
      { in: [[[7, 1, 1], [1, 7, 1], [1, 1, 7], [8, 8, 8]], [7, 7, 7]] },
    ],
    ref: `class Solution {
    public boolean mergeTriplets(int[][] triplets, int[] target) {
        boolean a = false, b = false, c = false;
        for (int[] t : triplets) {
            if (t[0] > target[0] || t[1] > target[1] || t[2] > target[2]) continue;
            a |= t[0] == target[0]; b |= t[1] == target[1]; c |= t[2] == target[2];
        }
        return a && b && c;
    }
}`,
  },
  {
    slug: 'valid-parenthesis-string', title: 'Valid Parenthesis String', level: 'Medium',
    summary: 's contains "(", ")" and "*", where each "*" may be treated as "(", ")" or nothing. Return true if some choice makes s a valid parentheses string.',
    method: 'checkValidString', params: [['String', 's']], returns: 'boolean',
    tests: [
      { in: ['()'], out: true },
      { in: ['(*)'], out: true },
      { in: ['(*))'], out: true },
      { in: ['*'] },
      { in: [')*'] },
      { in: ['(((*)'] },
      { in: ['((*)(*))((*'] },
      { in: ['**************************************************))'] },
      { in: ['(((((*(()((((*((**(((()()*)()()()*((((**)())*)*)))))))(())(()))())((*()()(((()((()*(())*(()**)()(())'] },
    ],
    ref: `class Solution {
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
  },
  {
    slug: 'hand-of-straights', title: 'Hand of Straights', level: 'Medium',
    summary: 'Return true if the cards in hand can be split into groups of groupSize consecutive values, using every card exactly once.',
    method: 'isNStraightHand', params: [['int[]', 'hand'], ['int', 'groupSize']], returns: 'boolean',
    tests: [
      { in: [[1, 2, 3, 6, 2, 3, 4, 7, 8], 3], out: true },
      { in: [[1, 2, 3, 4, 5], 4], out: false },
      { in: [[5], 1] },
      { in: [[1, 1, 2, 2, 3, 3], 3] },
      { in: [[1, 2, 4, 5, 6, 7], 3] },
      { in: [[8, 10, 12], 3] },
      { in: [[1000000000, 999999999, 999999998, 3, 2, 1], 3] },
    ],
    ref: `class Solution {
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
  },
  {
    slug: 'dota2-senate', title: 'Dota2 Senate', level: 'Medium',
    summary: 'Senators of two parties (R = Radiant, D = Dire) act in order, round after round; each can ban one senator of the other party. When only one party can still vote, it wins. Return "Radiant" or "Dire".',
    method: 'predictPartyVictory', params: [['String', 'senate']], returns: 'String',
    tests: [
      { in: ['RD'], out: 'Radiant' },
      { in: ['RDD'], out: 'Dire' },
      { in: ['D'] },
      { in: ['DDRRR'] },
      { in: ['RRDDD'] },
      { in: ['DRRDRDRDRDDRDRDR'] },
    ],
    ref: `class Solution {
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
  },
  {
    slug: 'jump-game-vii', title: 'Jump Game VII', level: 'Medium',
    summary: 's is a binary string with s[0] = "0". From index i you may jump to j when minJump <= j − i <= maxJump and s[j] = "0". Return true if you can reach the last index.',
    method: 'canReach', params: [['String', 's'], ['int', 'minJump'], ['int', 'maxJump']], returns: 'boolean',
    tests: [
      { in: ['011010', 2, 3], out: true },
      { in: ['01101110', 2, 3], out: false },
      { in: ['00', 1, 1] },
      { in: ['01', 1, 1] },
      { in: ['0000000000', 8, 8] },
      { in: ['00111010', 3, 5] },
      { in: ['0101010101', 2, 2] },
    ],
    ref: `class Solution {
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
  },
];
