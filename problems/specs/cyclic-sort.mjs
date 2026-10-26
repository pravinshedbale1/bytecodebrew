export default [
  {
    slug: 'find-all-numbers-disappeared-in-an-array', title: 'Find All Numbers Disappeared in an Array', level: 'Easy',
    summary: 'nums has n values, each between 1 and n. Return every number from 1 to n that does not appear, in any order.',
    method: 'findDisappearedNumbers', params: [['int[]', 'nums']], returns: 'List<Integer>', check: 'any-order',
    tests: [
      { in: [[4, 3, 2, 7, 8, 2, 3, 1]], out: [5, 6] },
      { in: [[1, 1]], out: [2] },
      { in: [[1]] },
      { in: [[2, 2]] },
      { in: [[5, 4, 3, 2, 1]] },
      { in: [[3, 3, 3, 3, 3]] },
    ],
    ref: `class Solution {
    public List<Integer> findDisappearedNumbers(int[] nums) {
        int i = 0;
        while (i < nums.length) {
            int home = nums[i] - 1;
            if (nums[i] != nums[home]) { int t = nums[i]; nums[i] = nums[home]; nums[home] = t; }
            else i++;
        }
        List<Integer> missing = new ArrayList<>();
        for (i = 0; i < nums.length; i++) if (nums[i] != i + 1) missing.add(i + 1);
        return missing;
    }
}`,
  },
  {
    slug: 'set-mismatch', title: 'Set Mismatch', level: 'Easy',
    summary: 'nums should hold 1..n once each, but one number was overwritten by a copy of another. Return [the number that appears twice, the number that is missing].',
    method: 'findErrorNums', params: [['int[]', 'nums']], returns: 'int[]',
    tests: [
      { in: [[1, 2, 2, 4]], out: [2, 3] },
      { in: [[1, 1]], out: [1, 2] },
      { in: [[2, 2]] },
      { in: [[3, 2, 3, 4, 6, 5]] },
      { in: [[1, 5, 3, 2, 2, 7, 6, 4, 8, 9]] },
      { in: [[2, 3, 4, 5, 5]] },
    ],
    ref: `class Solution {
    public int[] findErrorNums(int[] nums) {
        int n = nums.length;
        int[] count = new int[n + 1];
        for (int x : nums) count[x]++;
        int dup = 0, missing = 0;
        for (int v = 1; v <= n; v++) {
            if (count[v] == 2) dup = v;
            if (count[v] == 0) missing = v;
        }
        return new int[] { dup, missing };
    }
}`,
  },
  {
    slug: 'find-missing-and-repeated-values', title: 'Find Missing and Repeated Values', level: 'Easy',
    summary: 'An n × n grid holds the values 1..n², except that one value a appears twice and one value b is missing. Return [a, b].',
    method: 'findMissingAndRepeatedValues', params: [['int[][]', 'grid']], returns: 'int[]',
    tests: [
      { in: [[[1, 3], [2, 2]]], out: [2, 4] },
      { in: [[[9, 1, 7], [8, 9, 2], [3, 4, 6]]], out: [9, 5] },
      { in: [[[1, 1], [3, 4]]] },
      { in: [[[4, 3], [2, 4]]] },
      { in: [[[2, 2, 3], [4, 5, 6], [7, 8, 9]]] },
    ],
    ref: `class Solution {
    public int[] findMissingAndRepeatedValues(int[][] grid) {
        int total = grid.length * grid.length;
        int[] count = new int[total + 1];
        for (int[] row : grid) for (int v : row) count[v]++;
        int repeated = 0, missing = 0;
        for (int v = 1; v <= total; v++) {
            if (count[v] == 2) repeated = v;
            if (count[v] == 0) missing = v;
        }
        return new int[] { repeated, missing };
    }
}`,
  },
  {
    slug: 'find-all-duplicates-in-an-array', title: 'Find All Duplicates in an Array', level: 'Medium',
    summary: 'nums has n values, each between 1 and n, and each value appears once or twice. Return every value that appears twice, in any order, in O(n) time and O(1) extra space.',
    method: 'findDuplicates', params: [['int[]', 'nums']], returns: 'List<Integer>', check: 'any-order',
    tests: [
      { in: [[4, 3, 2, 7, 8, 2, 3, 1]], out: [2, 3] },
      { in: [[1, 1, 2]], out: [1] },
      { in: [[1]], out: [] },
      { in: [[2, 2]] },
      { in: [[1, 2, 3, 4]] },
      { in: [[3, 3, 1, 1, 6, 6]] },
    ],
    ref: `class Solution {
    public List<Integer> findDuplicates(int[] nums) {
        List<Integer> twice = new ArrayList<>();
        for (int v : nums) {
            int home = Math.abs(v) - 1;
            if (nums[home] < 0) twice.add(Math.abs(v));
            else nums[home] = -nums[home];
        }
        return twice;
    }
}`,
  },
  {
    slug: 'array-nesting', title: 'Array Nesting', level: 'Medium',
    summary: 'nums is a permutation of 0..n−1. Starting at any index k, follow k → nums[k] → nums[nums[k]] … until a value repeats. Return the largest number of distinct values such a walk can collect.',
    method: 'arrayNesting', params: [['int[]', 'nums']], returns: 'int',
    tests: [
      { in: [[5, 4, 0, 3, 1, 6, 2]], out: 4 },
      { in: [[0, 1, 2]], out: 1 },
      { in: [[0]] },
      { in: [[1, 0]] },
      { in: [[1, 2, 3, 4, 0]] },
      { in: [[2, 0, 1, 3, 5, 4]] },
    ],
    ref: `class Solution {
    public int arrayNesting(int[] nums) {
        boolean[] seen = new boolean[nums.length];
        int best = 0;
        for (int start = 0; start < nums.length; start++) {
            int len = 0;
            for (int i = start; !seen[i]; i = nums[i]) { seen[i] = true; len++; }
            best = Math.max(best, len);
        }
        return best;
    }
}`,
  },
  {
    slug: 'minimum-number-of-operations-to-sort-a-binary-tree-by-level', title: 'Minimum Number of Operations to Sort a Binary Tree by Level', level: 'Medium',
    summary: 'A binary tree has distinct values. One operation swaps the values of two nodes on the same level. Return the fewest operations that make every level strictly increasing from left to right.',
    method: 'minimumOperations', params: [['TreeNode', 'root']], returns: 'int',
    tests: [
      { in: [[1, 4, 3, 7, 6, 8, 5, null, null, null, null, 9, null, 10]], out: 3 },
      { in: [[1, 3, 2, 7, 6, 5, 4]], out: 3 },
      { in: [[1, 2, 3, 4, 5, 6]], out: 0 },
      { in: [[1]] },
      { in: [[5, null, 3, null, 1]] },
      { in: [[1, 3, 2, 7, 6, 5, 4, 15, 14, 13, 12, 11, 10, 9, 8]] },
    ],
    ref: `class Solution {
    public int minimumOperations(TreeNode root) {
        int ops = 0;
        Deque<TreeNode> queue = new ArrayDeque<>();
        queue.add(root);
        while (!queue.isEmpty()) {
            int[] level = new int[queue.size()];
            for (int k = 0; k < level.length; k++) {
                TreeNode node = queue.poll();
                level[k] = node.val;
                if (node.left != null) queue.add(node.left);
                if (node.right != null) queue.add(node.right);
            }
            ops += minSwaps(level);
        }
        return ops;
    }

    private int minSwaps(int[] a) {
        int[] sorted = a.clone();
        Arrays.sort(sorted);
        Map<Integer, Integer> home = new HashMap<>();
        for (int i = 0; i < sorted.length; i++) home.put(sorted[i], i);
        boolean[] seen = new boolean[a.length];
        int swaps = 0;
        for (int i = 0; i < a.length; i++) {
            int len = 0;
            for (int j = i; !seen[j]; j = home.get(a[j])) { seen[j] = true; len++; }
            if (len > 0) swaps += len - 1;
        }
        return swaps;
    }
}`,
  },
  {
    slug: 'couples-holding-hands', title: 'Couples Holding Hands', level: 'Hard',
    summary: 'row[i] is the person in seat i; persons 2k and 2k + 1 are a couple. A swap exchanges any two people. Return the fewest swaps so that every couple sits in seats 2j and 2j + 1 for some j.',
    method: 'minSwapsCouples', params: [['int[]', 'row']], returns: 'int',
    tests: [
      { in: [[0, 2, 1, 3]], out: 1 },
      { in: [[3, 2, 0, 1]], out: 0 },
      { in: [[0, 3, 1, 2]] },
      { in: [[0, 2, 4, 6, 7, 1, 3, 5]] },
      { in: [[5, 4, 2, 6, 3, 1, 0, 7]] },
      { in: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 0]] },
    ],
    ref: `class Solution {
    public int minSwapsCouples(int[] row) {
        int[] parent = new int[row.length / 2];
        for (int c = 0; c < parent.length; c++) parent[c] = c;
        int swaps = 0;
        for (int i = 0; i < row.length; i += 2) {
            int a = find(parent, row[i] / 2), b = find(parent, row[i + 1] / 2);
            if (a != b) { parent[a] = b; swaps++; }
        }
        return swaps;
    }

    private int find(int[] parent, int x) {
        while (parent[x] != x) x = parent[x] = parent[parent[x]];
        return x;
    }
}`,
  },
];
