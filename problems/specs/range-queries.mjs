export default [
  {
    slug: 'car-pooling', title: 'Car Pooling', level: 'Medium',
    summary: 'A car drives east with capacity seats. Each trip [passengers, from, to] picks people up at km from and drops them at km to. Return whether every trip fits.',
    method: 'carPooling', params: [['int[][]', 'trips'], ['int', 'capacity']], returns: 'boolean',
    tests: [
      { in: [[[2, 1, 5], [3, 3, 7]], 4], out: false },
      { in: [[[2, 1, 5], [3, 3, 7]], 5], out: true },
      { in: [[[2, 1, 5], [3, 5, 7]], 3] },
      { in: [[[9, 0, 1], [3, 3, 7]], 4] },
      { in: [[[3, 2, 7], [3, 7, 9], [8, 3, 9]], 11] },
    ],
    ref: `class Solution {
    public boolean carPooling(int[][] trips, int capacity) {
        int[] diff = new int[1002];
        for (int[] t : trips) { diff[t[1]] += t[0]; diff[t[2]] -= t[0]; }
        int load = 0;
        for (int d : diff) { load += d; if (load > capacity) return false; }
        return true;
    }
}`,
  },
  {
    slug: 'range-sum-query-mutable', title: 'Range Sum Query - Mutable', level: 'Medium',
    summary: 'NumArray(nums) supports update(index, val) and sumRange(left, right) (inclusive), both in O(log n).',
    design: { cls: 'NumArray', ctor: [['int[]', 'nums']], methods: [['void', 'update', [['int', 'index'], ['int', 'val']]], ['int', 'sumRange', [['int', 'left'], ['int', 'right']]]] },
    tests: [
      { in: [['NumArray', 'sumRange', 'update', 'sumRange'], [[[1, 3, 5]], [0, 2], [1, 2], [0, 2]]], out: [null, 9, null, 8] },
      { in: [['NumArray', 'update', 'update', 'sumRange', 'sumRange'], [[[0, 0, 0, 0]], [3, 5], [0, -2], [0, 3], [1, 2]]] },
      { in: [['NumArray', 'sumRange', 'update', 'sumRange', 'update', 'sumRange'], [[[7]], [0, 0], [0, 2], [0, 0], [0, -9], [0, 0]]] },
    ],
    ref: `class NumArray {
    private final int[] tree, nums;
    public NumArray(int[] nums) { this.nums = new int[nums.length]; tree = new int[nums.length + 1]; for (int i = 0; i < nums.length; i++) update(i, nums[i]); }
    public void update(int index, int val) { int d = val - nums[index]; nums[index] = val; for (int i = index + 1; i < tree.length; i += i & -i) tree[i] += d; }
    private int prefix(int i) { int s = 0; for (; i > 0; i -= i & -i) s += tree[i]; return s; }
    public int sumRange(int left, int right) { return prefix(right + 1) - prefix(left); }
}`,
  },
  {
    slug: 'count-of-smaller-numbers-after-self', title: 'Count of Smaller Numbers After Self', level: 'Hard',
    summary: 'For each element, count how many elements to its right are strictly smaller.',
    method: 'countSmaller', params: [['int[]', 'nums']], returns: 'List<Integer>',
    tests: [
      { in: [[5, 2, 6, 1]], out: [2, 1, 1, 0] },
      { in: [[-1]], out: [0] },
      { in: [[-1, -1]], out: [0, 0] },
      { in: [[1, 2, 3, 4]] },
      { in: [[10000, -10000, 5, 5, 0]] },
    ],
    ref: `class Solution {
    public List<Integer> countSmaller(int[] nums) {
        int off = 10001, size = 20003;
        int[] tree = new int[size + 1];
        Integer[] out = new Integer[nums.length];
        for (int i = nums.length - 1; i >= 0; i--) {
            int v = nums[i] + off, c = 0;
            for (int j = v - 1; j > 0; j -= j & -j) c += tree[j];
            out[i] = c;
            for (int j = v; j <= size; j += j & -j) tree[j]++;
        }
        return Arrays.asList(out);
    }
}`,
  },
  {
    slug: 'reverse-pairs', title: 'Reverse Pairs', level: 'Hard',
    summary: 'Count pairs i < j with nums[i] > 2 · nums[j]. Values span the full 32-bit range, so watch for overflow.',
    method: 'reversePairs', params: [['int[]', 'nums']], returns: 'int',
    tests: [
      { in: [[1, 3, 2, 3, 1]], out: 2 },
      { in: [[2, 4, 3, 5, 1]], out: 3 },
      { in: [[2147483647, 2147483647, 2147483647, 2147483647, 2147483647, 2147483647]], out: 0 },
      { in: [[-5, -5]] },
      { in: [[5]] },
    ],
    ref: `class Solution {
    public int reversePairs(int[] nums) { return sort(nums, new int[nums.length], 0, nums.length - 1); }
    private int sort(int[] a, int[] tmp, int lo, int hi) {
        if (lo >= hi) return 0;
        int mid = (lo + hi) >>> 1, count = sort(a, tmp, lo, mid) + sort(a, tmp, mid + 1, hi);
        for (int i = lo, j = mid + 1; i <= mid; i++) { while (j <= hi && (long) a[i] > 2L * a[j]) j++; count += j - mid - 1; }
        int i = lo, j = mid + 1, k = lo;
        while (i <= mid || j <= hi) tmp[k++] = j > hi || (i <= mid && a[i] <= a[j]) ? a[i++] : a[j++];
        System.arraycopy(tmp, lo, a, lo, hi - lo + 1);
        return count;
    }
}`,
  },
  {
    slug: 'count-of-range-sum', title: 'Count of Range Sum', level: 'Hard',
    summary: 'Count the contiguous subarrays whose sum lies in [lower, upper] (inclusive). Sums can exceed 32 bits.',
    method: 'countRangeSum', params: [['int[]', 'nums'], ['int', 'lower'], ['int', 'upper']], returns: 'int',
    tests: [
      { in: [[-2, 5, -1], -2, 2], out: 3 },
      { in: [[0], 0, 0], out: 1 },
      { in: [[2147483647, -2147483648, -1, 0], -1, 0] },
      { in: [[1, 1, 1], 2, 2] },
      { in: [[-3, 1, 2, -2, 2, -1], -3, -1] },
    ],
    ref: `class Solution {
    public int countRangeSum(int[] nums, int lower, int upper) {
        long[] p = new long[nums.length + 1];
        for (int i = 0; i < nums.length; i++) p[i + 1] = p[i] + nums[i];
        return sort(p, new long[p.length], 0, p.length - 1, lower, upper);
    }
    private int sort(long[] p, long[] tmp, int lo, int hi, int lower, int upper) {
        if (lo >= hi) return 0;
        int mid = (lo + hi) >>> 1, count = sort(p, tmp, lo, mid, lower, upper) + sort(p, tmp, mid + 1, hi, lower, upper);
        int a = mid + 1, b = mid + 1;
        for (int i = lo; i <= mid; i++) {
            while (a <= hi && p[a] - p[i] < lower) a++;
            while (b <= hi && p[b] - p[i] <= upper) b++;
            count += b - a;
        }
        int i = lo, j = mid + 1, k = lo;
        while (i <= mid || j <= hi) tmp[k++] = j > hi || (i <= mid && p[i] <= p[j]) ? p[i++] : p[j++];
        System.arraycopy(tmp, lo, p, lo, hi - lo + 1);
        return count;
    }
}`,
  },
  {
    slug: 'create-sorted-array-through-instructions', title: 'Create Sorted Array through Instructions', level: 'Hard',
    summary: 'Insert values one by one into a sorted container. Each insert costs min(#existing values smaller, #existing values larger). Return the total cost modulo 10^9 + 7.',
    method: 'createSortedArray', params: [['int[]', 'instructions']], returns: 'int',
    tests: [
      { in: [[1, 5, 6, 2]], out: 1 },
      { in: [[1, 2, 3, 6, 5, 4]], out: 3 },
      { in: [[1, 3, 3, 3, 2, 4, 2, 1, 2]], out: 4 },
      { in: [[7]] },
      { in: [[5, 5, 5, 1, 9]] },
    ],
    ref: `class Solution {
    public int createSortedArray(int[] instructions) {
        int max = 0;
        for (int x : instructions) max = Math.max(max, x);
        int[] tree = new int[max + 1];
        long cost = 0;
        for (int i = 0; i < instructions.length; i++) {
            int x = instructions[i], smaller = 0, upTo = 0;
            for (int j = x - 1; j > 0; j -= j & -j) smaller += tree[j];
            for (int j = x; j > 0; j -= j & -j) upTo += tree[j];
            cost += Math.min(smaller, i - upTo);
            for (int j = x; j <= max; j += j & -j) tree[j]++;
        }
        return (int) (cost % 1_000_000_007);
    }
}`,
  },
  {
    slug: 'falling-squares', title: 'Falling Squares', level: 'Hard',
    summary: 'Squares [left, side] drop one at a time onto the x-axis and stick where they land (touching edges don\'t support). After each drop, return the height of the tallest stack so far.',
    method: 'fallingSquares', params: [['int[][]', 'positions']], returns: 'List<Integer>',
    tests: [
      { in: [[[1, 2], [2, 3], [6, 1]]], out: [2, 5, 5] },
      { in: [[[100, 100], [200, 100]]], out: [100, 100] },
      { in: [[[1, 5]]] },
      { in: [[[1, 2], [3, 2], [2, 2]]] },
      { in: [[[9, 7], [1, 9], [3, 1]]] },
    ],
    ref: `class Solution {
    public List<Integer> fallingSquares(int[][] positions) {
        List<int[]> placed = new ArrayList<>();
        List<Integer> out = new ArrayList<>();
        int best = 0;
        for (int[] p : positions) {
            int l = p[0], r = p[0] + p[1], base = 0;
            for (int[] q : placed) if (q[0] < r && l < q[1]) base = Math.max(base, q[2]);
            placed.add(new int[] { l, r, base + p[1] });
            best = Math.max(best, base + p[1]);
            out.add(best);
        }
        return out;
    }
}`,
  },
];
