export default [
  {
    slug: 'sum-of-all-odd-length-subarrays', title: 'Sum of All Odd Length Subarrays', level: 'Easy',
    summary: 'Add up the sums of every contiguous subarray of arr whose length is odd.',
    method: 'sumOddLengthSubarrays', params: [['int[]', 'arr']], returns: 'int',
    tests: [
      { in: [[1, 4, 2, 5, 3]], out: 58 },
      { in: [[1, 2]], out: 3 },
      { in: [[10, 11, 12]], out: 66 },
      { in: [[7]] },
      { in: [[1000, 1000, 1000, 1000]] },
      { in: [[5, 1, 9, 2, 8, 3]] },
    ],
    ref: `class Solution {
    public int sumOddLengthSubarrays(int[] arr) {
        int n = arr.length, total = 0;
        for (int i = 0; i < n; i++) {
            int all = (i + 1) * (n - i);
            total += arr[i] * ((all + 1) / 2);
        }
        return total;
    }
}`,
  },
  {
    slug: 'number-of-zero-filled-subarrays', title: 'Number of Zero-Filled Subarrays', level: 'Medium',
    summary: 'Count the contiguous subarrays of nums in which every element is 0.',
    method: 'zeroFilledSubarray', params: [['int[]', 'nums']], returns: 'long',
    tests: [
      { in: [[1, 3, 0, 0, 2, 0, 0, 4]], out: 6 },
      { in: [[0, 0, 0, 2, 0, 0]], out: 9 },
      { in: [[2, 10, 2019]], out: 0 },
      { in: [[0]] },
      { in: [[-1, 0, -1, 0, 0, 0, 0]] },
      { in: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]] },
    ],
    ref: `class Solution {
    public long zeroFilledSubarray(int[] nums) {
        long total = 0, run = 0;
        for (int x : nums) {
            run = (x == 0) ? run + 1 : 0;
            total += run;
        }
        return total;
    }
}`,
  },
  {
    slug: 'vowels-of-all-substrings', title: 'Vowels of All Substrings', level: 'Medium',
    summary: 'Add up, over every substring of word, the number of vowels (a, e, i, o, u) it contains.',
    method: 'countVowels', params: [['String', 'word']], returns: 'long',
    tests: [
      { in: ['aba'], out: 6 },
      { in: ['abc'], out: 3 },
      { in: ['ltcd'], out: 0 },
      { in: ['a'] },
      { in: ['aeiou'] },
      { in: ['xyzxyzaxyz'] },
    ],
    ref: `class Solution {
    public long countVowels(String word) {
        long n = word.length(), total = 0;
        for (int i = 0; i < n; i++)
            if ("aeiou".indexOf(word.charAt(i)) >= 0) total += (i + 1) * (n - i);
        return total;
    }
}`,
  },
  {
    slug: 'total-hamming-distance', title: 'Total Hamming Distance', level: 'Medium',
    summary: 'The Hamming distance of two integers is the number of bit positions where they differ. Return the sum of the Hamming distances over every pair of numbers in nums.',
    method: 'totalHammingDistance', params: [['int[]', 'nums']], returns: 'int',
    tests: [
      { in: [[4, 14, 2]], out: 6 },
      { in: [[4, 14, 4]], out: 4 },
      { in: [[0]] },
      { in: [[7, 7, 7]] },
      { in: [[0, 1000000000]] },
      { in: [[1, 2, 3, 4, 5, 6, 7, 8]] },
    ],
    ref: `class Solution {
    public int totalHammingDistance(int[] nums) {
        int n = nums.length, total = 0;
        for (int b = 0; b < 32; b++) {
            int ones = 0;
            for (int x : nums) ones += (x >> b) & 1;
            total += ones * (n - ones);
        }
        return total;
    }
}`,
  },
  {
    slug: 'bitwise-xor-of-all-pairings', title: 'Bitwise XOR of All Pairings', level: 'Medium',
    summary: 'Form nums3 from nums1[i] ^ nums2[j] for every pair (i, j). Return the XOR of all the values in nums3.',
    method: 'xorAllNums', params: [['int[]', 'nums1'], ['int[]', 'nums2']], returns: 'int',
    tests: [
      { in: [[2, 1, 3], [10, 2, 5, 0]], out: 13 },
      { in: [[1, 2], [3, 4]], out: 0 },
      { in: [[5], [9]] },
      { in: [[1, 2, 3], [4, 5, 6]] },
      { in: [[0, 0, 0], [7]] },
      { in: [[1000000000, 1], [123456789]] },
    ],
    ref: `class Solution {
    public int xorAllNums(int[] nums1, int[] nums2) {
        int x = 0;
        if (nums2.length % 2 == 1) for (int a : nums1) x ^= a;
        if (nums1.length % 2 == 1) for (int b : nums2) x ^= b;
        return x;
    }
}`,
  },
  {
    slug: 'sum-of-absolute-differences-in-a-sorted-array', title: 'Sum of Absolute Differences in a Sorted Array', level: 'Medium',
    summary: 'nums is sorted in non-decreasing order. For each i, compute the sum of |nums[i] − nums[j]| over all j, and return these sums as an array.',
    method: 'getSumAbsoluteDifferences', params: [['int[]', 'nums']], returns: 'int[]',
    tests: [
      { in: [[2, 3, 5]], out: [4, 3, 5] },
      { in: [[1, 4, 6, 8, 10]], out: [24, 15, 13, 15, 21] },
      { in: [[1, 1]] },
      { in: [[1, 10000]] },
      { in: [[3, 3, 3, 7, 7]] },
    ],
    ref: `class Solution {
    public int[] getSumAbsoluteDifferences(int[] nums) {
        int n = nums.length;
        int[] p = new int[n + 1];
        for (int i = 0; i < n; i++) p[i + 1] = p[i] + nums[i];
        int[] res = new int[n];
        for (int i = 0; i < n; i++) {
            int left = nums[i] * i - p[i];
            int right = (p[n] - p[i + 1]) - nums[i] * (n - 1 - i);
            res[i] = left + right;
        }
        return res;
    }
}`,
  },
  {
    slug: 'sum-of-distances', title: 'Sum of Distances', level: 'Medium',
    summary: 'For each index i, add up |i − j| over every other index j with nums[j] == nums[i] (0 if there is none). Return these sums.',
    method: 'distance', params: [['int[]', 'nums']], returns: 'long[]',
    tests: [
      { in: [[1, 3, 1, 1, 2]], out: [5, 0, 3, 4, 0] },
      { in: [[0, 5, 3]], out: [0, 0, 0] },
      { in: [[7]] },
      { in: [[4, 4, 4, 4, 4, 4]] },
      { in: [[1, 2, 1, 2, 1, 2, 1000000000]] },
    ],
    ref: `class Solution {
    public long[] distance(int[] nums) {
        Map<Integer, List<Integer>> groups = new HashMap<>();
        for (int i = 0; i < nums.length; i++) groups.computeIfAbsent(nums[i], k -> new ArrayList<>()).add(i);
        long[] res = new long[nums.length];
        for (List<Integer> idx : groups.values()) {
            long total = 0;
            for (int j : idx) total += j;
            long left = 0;
            for (int k = 0; k < idx.size(); k++) {
                long j = idx.get(k);
                long right = total - left - j;
                res[(int) j] = (j * k - left) + (right - j * (idx.size() - 1 - k));
                left += j;
            }
        }
        return res;
    }
}`,
  },
  {
    slug: 'subarray-product-less-than-k', title: 'Subarray Product Less Than K', level: 'Medium',
    summary: 'nums holds positive integers. Count the contiguous subarrays whose product is strictly less than k.',
    method: 'numSubarrayProductLessThanK', params: [['int[]', 'nums'], ['int', 'k']], returns: 'int',
    tests: [
      { in: [[10, 5, 2, 6], 100], out: 8 },
      { in: [[1, 2, 3], 0], out: 0 },
      { in: [[1, 1, 1], 1] },
      { in: [[1, 1, 1], 2] },
      { in: [[1000, 1000, 1000], 1000000] },
      { in: [[5], 6] },
    ],
    ref: `class Solution {
    public int numSubarrayProductLessThanK(int[] nums, int k) {
        if (k <= 1) return 0;
        int count = 0, l = 0;
        long prod = 1;
        for (int r = 0; r < nums.length; r++) {
            prod *= nums[r];
            while (prod >= k) prod /= nums[l++];
            count += r - l + 1;
        }
        return count;
    }
}`,
  },
  {
    slug: 'count-subarrays-where-max-element-appears-at-least-k-times', title: 'Count Subarrays Where Max Element Appears at Least K Times', level: 'Medium',
    summary: 'Let m be the largest value in nums. Count the contiguous subarrays in which m appears at least k times.',
    method: 'countSubarrays', params: [['int[]', 'nums'], ['int', 'k']], returns: 'long',
    tests: [
      { in: [[1, 3, 2, 3, 3], 2], out: 6 },
      { in: [[1, 4, 2, 1], 3], out: 0 },
      { in: [[5], 1] },
      { in: [[2, 2, 2, 2], 1] },
      { in: [[2, 2, 2, 2], 4] },
      { in: [[1, 7, 1, 1, 7, 1, 7], 2] },
    ],
    ref: `class Solution {
    public long countSubarrays(int[] nums, int k) {
        int max = Arrays.stream(nums).max().getAsInt();
        long count = 0;
        int seen = 0, l = 0;
        for (int r = 0; r < nums.length; r++) {
            if (nums[r] == max) seen++;
            while (seen >= k) if (nums[l++] == max) seen--;
            count += l;
        }
        return count;
    }
}`,
  },
  {
    slug: 'sum-of-subarray-ranges', title: 'Sum of Subarray Ranges', level: 'Medium',
    summary: 'The range of a subarray is its largest element minus its smallest. Return the sum of the ranges of every contiguous subarray of nums.',
    method: 'subArrayRanges', params: [['int[]', 'nums']], returns: 'long',
    tests: [
      { in: [[1, 2, 3]], out: 4 },
      { in: [[1, 3, 3]], out: 4 },
      { in: [[4, -2, -3, 4, 1]], out: 59 },
      { in: [[42]] },
      { in: [[-1000000000, 1000000000]] },
      { in: [[2, 2, 2, 2]] },
    ],
    ref: `class Solution {
    public long subArrayRanges(int[] nums) {
        return sumOf(nums, true) - sumOf(nums, false);
    }

    private long sumOf(int[] a, boolean max) {
        int n = a.length;
        int[] prev = new int[n], next = new int[n];
        Deque<Integer> st = new ArrayDeque<>();
        for (int i = 0; i < n; i++) {
            while (!st.isEmpty() && (max ? a[st.peek()] <= a[i] : a[st.peek()] >= a[i])) next[st.pop()] = i;
            prev[i] = st.isEmpty() ? -1 : st.peek();
            st.push(i);
        }
        while (!st.isEmpty()) next[st.pop()] = n;
        long total = 0;
        for (int i = 0; i < n; i++) total += (long) a[i] * (i - prev[i]) * (next[i] - i);
        return total;
    }
}`,
  },
  {
    slug: 'minimum-fuel-cost-to-report-to-the-capital', title: 'Minimum Fuel Cost to Report to the Capital', level: 'Medium',
    summary: 'n cities form a tree (roads) and city 0 is the capital. Each city sends one representative to the capital; every city has a car with `seats` seats, and representatives may switch cars or share them. Each road travelled by one car costs one litre. Return the minimum total fuel.',
    method: 'minimumFuelCost', params: [['int[][]', 'roads'], ['int', 'seats']], returns: 'long',
    tests: [
      { in: [[[0, 1], [0, 2], [0, 3]], 5], out: 3 },
      { in: [[[3, 1], [3, 2], [1, 0], [0, 4], [0, 5], [4, 6]], 2], out: 7 },
      { in: [[], 1], out: 0 },
      { in: [[[0, 1], [1, 2], [2, 3], [3, 4]], 1] },
      { in: [[[0, 1], [1, 2], [2, 3], [3, 4]], 100000] },
      { in: [[[1, 0], [2, 0], [3, 1], [4, 1], [5, 2], [6, 2]], 3] },
    ],
    ref: `class Solution {
    public long minimumFuelCost(int[][] roads, int seats) {
        int n = roads.length + 1;
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (int[] e : roads) { adj.get(e[0]).add(e[1]); adj.get(e[1]).add(e[0]); }
        int[] parent = new int[n], order = new int[n], size = new int[n];
        parent[0] = -1;
        int len = 0;
        order[len++] = 0;
        for (int k = 0; k < len; k++)
            for (int c : adj.get(order[k])) if (c != parent[order[k]]) { parent[c] = order[k]; order[len++] = c; }
        long fuel = 0;
        for (int k = n - 1; k > 0; k--) {
            int v = order[k];
            size[v] += 1;
            fuel += (size[v] + seats - 1) / seats;
            size[parent[v]] += size[v];
        }
        return fuel;
    }
}`,
  },
  {
    slug: 'sum-of-subsequence-widths', title: 'Sum of Subsequence Widths', level: 'Hard',
    summary: 'The width of a sequence is its maximum minus its minimum. Return the sum of the widths of all non-empty subsequences of nums, modulo 10⁹ + 7.',
    method: 'sumSubseqWidths', params: [['int[]', 'nums']], returns: 'int',
    tests: [
      { in: [[2, 1, 3]], out: 6 },
      { in: [[2]], out: 0 },
      { in: [[5, 5, 5]] },
      { in: [[1, 100000]] },
      { in: [[3, 7, 1, 9, 4, 4, 8]] },
    ],
    ref: `class Solution {
    public int sumSubseqWidths(int[] nums) {
        final int MOD = 1_000_000_007;
        int n = nums.length;
        Arrays.sort(nums);
        long[] pow2 = new long[n];
        pow2[0] = 1;
        for (int i = 1; i < n; i++) pow2[i] = pow2[i - 1] * 2 % MOD;
        long total = 0;
        for (int i = 0; i < n; i++)
            total = (total + nums[i] * (pow2[i] - pow2[n - 1 - i])) % MOD;
        return (int) ((total + MOD) % MOD);
    }
}`,
  },
  {
    slug: 'total-appeal-of-a-string', title: 'Total Appeal of A String', level: 'Hard',
    summary: 'The appeal of a string is the number of distinct characters in it. Return the total appeal of all substrings of s.',
    method: 'appealSum', params: [['String', 's']], returns: 'long',
    tests: [
      { in: ['abbca'], out: 28 },
      { in: ['code'], out: 20 },
      { in: ['a'] },
      { in: ['aaaa'] },
      { in: ['abcdefghijklmnopqrstuvwxyz'] },
      { in: ['abababab'] },
    ],
    ref: `class Solution {
    public long appealSum(String s) {
        int[] last = new int[26];
        Arrays.fill(last, -1);
        long n = s.length(), total = 0;
        for (int i = 0; i < n; i++) {
            int c = s.charAt(i) - 'a';
            total += (i - last[c]) * (n - i);
            last[c] = i;
        }
        return total;
    }
}`,
  },
  {
    slug: 'count-unique-characters-of-all-substrings-of-a-given-string', title: 'Count Unique Characters of All Substrings of a Given String', level: 'Hard',
    summary: 'For a string t, countUniqueChars(t) is the number of characters that appear exactly once in t. Return the sum of countUniqueChars over every substring of s (substrings at different positions count separately).',
    method: 'uniqueLetterString', params: [['String', 's']], returns: 'int',
    tests: [
      { in: ['ABC'], out: 10 },
      { in: ['ABA'], out: 8 },
      { in: ['LEETCODE'], out: 92 },
      { in: ['Z'] },
      { in: ['AAAA'] },
      { in: ['ABCDEFGHIJKLMNOPQRSTUVWXYZ'] },
    ],
    ref: `class Solution {
    public int uniqueLetterString(String s) {
        int n = s.length();
        int[] prev = new int[n], next = new int[n], seen = new int[26];
        Arrays.fill(seen, -1);
        for (int i = 0; i < n; i++) { int c = s.charAt(i) - 'A'; prev[i] = seen[c]; seen[c] = i; }
        Arrays.fill(seen, n);
        for (int i = n - 1; i >= 0; i--) { int c = s.charAt(i) - 'A'; next[i] = seen[c]; seen[c] = i; }
        long total = 0;
        for (int i = 0; i < n; i++) total += (long) (i - prev[i]) * (next[i] - i);
        return (int) total;
    }
}`,
  },
  {
    slug: 'count-subarrays-with-score-less-than-k', title: 'Count Subarrays With Score Less Than K', level: 'Hard',
    summary: 'The score of an array is its sum multiplied by its length. nums holds positive integers; count the non-empty contiguous subarrays whose score is strictly less than k.',
    method: 'countSubarrays', params: [['int[]', 'nums'], ['long', 'k']], returns: 'long',
    tests: [
      { in: [[2, 1, 4, 3, 5], 10], out: 6 },
      { in: [[1, 1, 1], 5], out: 5 },
      { in: [[1], 1] },
      { in: [[1], 2] },
      { in: [[100000, 100000], 1000000000000000] },
      { in: [[3, 3, 3, 3], 13] },
    ],
    ref: `class Solution {
    public long countSubarrays(int[] nums, long k) {
        long sum = 0, count = 0;
        for (int l = 0, r = 0; r < nums.length; r++) {
            sum += nums[r];
            while (sum * (r - l + 1) >= k) sum -= nums[l++];
            count += r - l + 1;
        }
        return count;
    }
}`,
  },
  {
    slug: 'sum-of-total-strength-of-wizards', title: 'Sum of Total Strength of Wizards', level: 'Hard',
    summary: 'For a contiguous group of wizards, its total strength is (the weakest strength in the group) × (the sum of all strengths in the group). Return the sum of the total strengths of every contiguous group, modulo 10⁹ + 7.',
    method: 'totalStrength', params: [['int[]', 'strength']], returns: 'int',
    tests: [
      { in: [[1, 3, 1, 2]], out: 44 },
      { in: [[5, 4, 6]], out: 213 },
      { in: [[7]] },
      { in: [[1000000000, 1000000000, 1000000000]] },
      { in: [[2, 2, 2, 2, 2]] },
      { in: [[5, 1, 4, 2, 3, 1, 6]] },
    ],
    ref: `class Solution {
    public int totalStrength(int[] strength) {
        final long MOD = 1_000_000_007;
        int n = strength.length;
        int[] prev = new int[n], next = new int[n];
        Deque<Integer> st = new ArrayDeque<>();
        for (int i = 0; i < n; i++) {
            while (!st.isEmpty() && strength[st.peek()] >= strength[i]) next[st.pop()] = i;
            prev[i] = st.isEmpty() ? -1 : st.peek();
            st.push(i);
        }
        while (!st.isEmpty()) next[st.pop()] = n;
        long[] p = new long[n + 1], pp = new long[n + 2];
        for (int i = 0; i < n; i++) p[i + 1] = (p[i] + strength[i]) % MOD;
        for (int i = 0; i <= n; i++) pp[i + 1] = (pp[i] + p[i]) % MOD;
        long total = 0;
        for (int i = 0; i < n; i++) {
            int l = prev[i], r = next[i];
            long ends = (pp[r + 1] - pp[i + 1] + MOD) % MOD * (i - l) % MOD;
            long starts = (pp[i + 1] - pp[l + 1] + MOD) % MOD * (r - i) % MOD;
            total = (total + strength[i] * ((ends - starts + MOD) % MOD)) % MOD;
        }
        return (int) total;
    }
}`,
  },
  {
    slug: 'sum-of-distances-in-tree', title: 'Sum of Distances in Tree', level: 'Hard',
    summary: 'An undirected tree has n nodes labelled 0 … n − 1 and the given edges. For every node i, return the sum of the distances (number of edges) from i to all other nodes.',
    method: 'sumOfDistancesInTree', params: [['int', 'n'], ['int[][]', 'edges']], returns: 'int[]',
    tests: [
      { in: [6, [[0, 1], [0, 2], [2, 3], [2, 4], [2, 5]]], out: [8, 12, 6, 10, 10, 10] },
      { in: [1, []], out: [0] },
      { in: [2, [[1, 0]]], out: [1, 1] },
      { in: [5, [[0, 1], [1, 2], [2, 3], [3, 4]]] },
      { in: [5, [[3, 0], [3, 1], [3, 2], [3, 4]]] },
      { in: [7, [[4, 2], [2, 6], [6, 0], [0, 5], [5, 1], [1, 3]]] },
    ],
    ref: `class Solution {
    public int[] sumOfDistancesInTree(int n, int[][] edges) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (int[] e : edges) { adj.get(e[0]).add(e[1]); adj.get(e[1]).add(e[0]); }
        int[] parent = new int[n], order = new int[n], size = new int[n], ans = new int[n];
        parent[0] = -1;
        int len = 0;
        order[len++] = 0;
        for (int k = 0; k < len; k++)
            for (int c : adj.get(order[k])) if (c != parent[order[k]]) { parent[c] = order[k]; order[len++] = c; }
        for (int k = n - 1; k >= 0; k--) {
            int v = order[k];
            size[v] += 1;
            if (v != 0) { size[parent[v]] += size[v]; ans[0] += size[v]; }
        }
        for (int k = 1; k < n; k++) {
            int v = order[k];
            ans[v] = ans[parent[v]] - size[v] + (n - size[v]);
        }
        return ans;
    }
}`,
  },
];
