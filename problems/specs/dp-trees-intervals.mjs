export default [
  {
    slug: 'diameter-of-binary-tree', title: 'Diameter of Binary Tree', level: 'Easy',
    summary: 'Return the number of edges on the longest path between any two nodes (it need not pass through the root).',
    method: 'diameterOfBinaryTree', params: [['TreeNode', 'root']], returns: 'int',
    tests: [
      { in: [[1, 2, 3, 4, 5]], out: 3 },
      { in: [[1, 2]], out: 1 },
      { in: [[1]] },
      { in: [[1, 2, null, 3, 4, 5, null, null, 6, 7]] },
    ],
    ref: `class Solution {
    private int best = 0;
    public int diameterOfBinaryTree(TreeNode root) { depth(root); return best; }
    private int depth(TreeNode n) { if (n == null) return 0; int l = depth(n.left), r = depth(n.right); best = Math.max(best, l + r); return 1 + Math.max(l, r); }
}`,
  },
  {
    slug: 'house-robber-iii', title: 'House Robber III', level: 'Medium',
    summary: 'Houses form a binary tree; robbing two directly linked houses sets off the alarm. Return the most money you can rob.',
    method: 'rob', params: [['TreeNode', 'root']], returns: 'int',
    tests: [
      { in: [[3, 2, 3, null, 3, null, 1]], out: 7 },
      { in: [[3, 4, 5, 1, 3, null, 1]], out: 9 },
      { in: [[5]] },
      { in: [[4, 1, null, 2, null, 3]] },
    ],
    ref: `class Solution {
    public int rob(TreeNode root) { int[] r = go(root); return Math.max(r[0], r[1]); }
    private int[] go(TreeNode n) {
        if (n == null) return new int[2];
        int[] l = go(n.left), r = go(n.right);
        return new int[] { n.val + l[1] + r[1], Math.max(l[0], l[1]) + Math.max(r[0], r[1]) };
    }
}`,
  },
  {
    slug: 'longest-zigzag-path-in-a-binary-tree', title: 'Longest ZigZag Path in a Binary Tree', level: 'Medium',
    summary: 'A zigzag path alternates between going to a left child and a right child. Return the number of edges in the longest zigzag path.',
    method: 'longestZigZag', params: [['TreeNode', 'root']], returns: 'int',
    tests: [
      { in: [[1, null, 1, 1, 1, null, null, 1, 1, null, 1, null, null, null, 1]], out: 3 },
      { in: [[1, 1, 1, null, 1, null, null, 1, 1, null, 1]], out: 4 },
      { in: [[1]], out: 0 },
      { in: [[1, 2, 3, 4, 5, 6, 7]] },
    ],
    ref: `class Solution {
    private int best = 0;
    public int longestZigZag(TreeNode root) { go(root, 0, 0); return best; }
    private void go(TreeNode n, int fromLeft, int fromRight) {
        if (n == null) return;
        best = Math.max(best, Math.max(fromLeft, fromRight));
        go(n.left, fromRight + 1, 0);
        go(n.right, 0, fromLeft + 1);
    }
}`,
  },
  {
    slug: 'predict-the-winner', title: 'Predict the Winner', level: 'Medium',
    summary: 'Two players alternately take a number from either end of the array. Return whether player 1 can win (a tie counts as a win) when both play optimally.',
    method: 'predictTheWinner', params: [['int[]', 'nums']], returns: 'boolean',
    tests: [
      { in: [[1, 5, 2]], out: false },
      { in: [[1, 5, 233, 7]], out: true },
      { in: [[7]] },
      { in: [[1, 1]] },
      { in: [[2, 4, 55, 6, 8]] },
    ],
    ref: `class Solution {
    public boolean predictTheWinner(int[] nums) {
        int n = nums.length;
        int[][] diff = new int[n][n];
        for (int i = n - 1; i >= 0; i--) {
            diff[i][i] = nums[i];
            for (int j = i + 1; j < n; j++) diff[i][j] = Math.max(nums[i] - diff[i + 1][j], nums[j] - diff[i][j - 1]);
        }
        return diff[0][n - 1] >= 0;
    }
}`,
  },
  {
    slug: 'minimum-score-triangulation-of-polygon', title: 'Minimum Score Triangulation of Polygon', level: 'Medium',
    summary: 'Triangulate a convex polygon whose vertices have the given values; each triangle scores the product of its three vertex values. Return the minimum total score.',
    method: 'minScoreTriangulation', params: [['int[]', 'values']], returns: 'int',
    tests: [
      { in: [[1, 2, 3]], out: 6 },
      { in: [[3, 7, 4, 5]], out: 144 },
      { in: [[1, 3, 1, 4, 1, 5]], out: 13 },
      { in: [[2, 2, 2, 2]] },
    ],
    ref: `class Solution {
    public int minScoreTriangulation(int[] v) {
        int n = v.length;
        int[][] dp = new int[n][n];
        for (int len = 3; len <= n; len++) for (int i = 0; i + len - 1 < n; i++) {
            int j = i + len - 1;
            dp[i][j] = Integer.MAX_VALUE;
            for (int k = i + 1; k < j; k++) dp[i][j] = Math.min(dp[i][j], dp[i][k] + dp[k][j] + v[i] * v[k] * v[j]);
        }
        return dp[0][n - 1];
    }
}`,
  },
  {
    slug: 'binary-tree-maximum-path-sum', title: 'Binary Tree Maximum Path Sum', level: 'Hard',
    summary: 'A path is any sequence of connected nodes, each used at most once. Return the largest sum of any non-empty path.',
    method: 'maxPathSum', params: [['TreeNode', 'root']], returns: 'int',
    tests: [
      { in: [[1, 2, 3]], out: 6 },
      { in: [[-10, 9, 20, null, null, 15, 7]], out: 42 },
      { in: [[-3]] },
      { in: [[2, -1, -2]] },
      { in: [[5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1]] },
    ],
    ref: `class Solution {
    private int best = Integer.MIN_VALUE;
    public int maxPathSum(TreeNode root) { gain(root); return best; }
    private int gain(TreeNode n) {
        if (n == null) return 0;
        int l = Math.max(0, gain(n.left)), r = Math.max(0, gain(n.right));
        best = Math.max(best, n.val + l + r);
        return n.val + Math.max(l, r);
    }
}`,
  },
  {
    slug: 'binary-tree-cameras', title: 'Binary Tree Cameras', level: 'Hard',
    summary: 'A camera at a node watches it, its parent and its children. Return the fewest cameras that watch every node.',
    method: 'minCameraCover', params: [['TreeNode', 'root']], returns: 'int',
    tests: [
      { in: [[0, 0, null, 0, 0]], out: 1 },
      { in: [[0, 0, null, 0, null, 0, null, null, 0]], out: 2 },
      { in: [[0]] },
      { in: [[0, 0, 0, 0, 0, 0, 0]] },
    ],
    ref: `class Solution {
    private int cameras = 0;
    public int minCameraCover(TreeNode root) { return state(root) == 0 ? cameras + 1 : cameras; }
    // 0 = not covered, 1 = has camera, 2 = covered
    private int state(TreeNode n) {
        if (n == null) return 2;
        int l = state(n.left), r = state(n.right);
        if (l == 0 || r == 0) { cameras++; return 1; }
        return l == 1 || r == 1 ? 2 : 0;
    }
}`,
  },
  {
    slug: 'burst-balloons', title: 'Burst Balloons', level: 'Hard',
    summary: 'Bursting balloon i earns nums[i−1] · nums[i] · nums[i+1] using its current neighbours (missing ones count as 1). Return the most coins from bursting all balloons.',
    method: 'maxCoins', params: [['int[]', 'nums']], returns: 'int',
    tests: [
      { in: [[3, 1, 5, 8]], out: 167 },
      { in: [[1, 5]], out: 10 },
      { in: [[7]] },
      { in: [[2, 4, 3, 1, 9]] },
    ],
    ref: `class Solution {
    public int maxCoins(int[] nums) {
        int n = nums.length;
        int[] a = new int[n + 2];
        a[0] = a[n + 1] = 1;
        System.arraycopy(nums, 0, a, 1, n);
        int[][] dp = new int[n + 2][n + 2];
        for (int len = 1; len <= n; len++) for (int i = 1; i + len - 1 <= n; i++) {
            int j = i + len - 1;
            for (int k = i; k <= j; k++) dp[i][j] = Math.max(dp[i][j], dp[i][k - 1] + dp[k + 1][j] + a[i - 1] * a[k] * a[j + 1]);
        }
        return dp[1][n];
    }
}`,
  },
  {
    slug: 'minimum-cost-to-cut-a-stick', title: 'Minimum Cost to Cut a Stick', level: 'Hard',
    summary: 'A stick of length n must be cut at every position in cuts, in an order you choose; each cut costs the length of the piece being cut. Return the minimum total cost.',
    method: 'minCost', params: [['int', 'n'], ['int[]', 'cuts']], returns: 'int',
    tests: [
      { in: [7, [1, 3, 4, 5]], out: 16 },
      { in: [9, [5, 6, 1, 4, 2]], out: 22 },
      { in: [5, [2]] },
      { in: [30, [10, 20, 5, 25]] },
    ],
    ref: `class Solution {
    public int minCost(int n, int[] cuts) {
        int m = cuts.length;
        int[] c = new int[m + 2];
        System.arraycopy(cuts, 0, c, 1, m);
        c[m + 1] = n;
        Arrays.sort(c);
        int[][] dp = new int[m + 2][m + 2];
        for (int len = 2; len <= m + 1; len++) for (int i = 0; i + len <= m + 1; i++) {
            int j = i + len;
            dp[i][j] = Integer.MAX_VALUE;
            for (int k = i + 1; k < j; k++) dp[i][j] = Math.min(dp[i][j], dp[i][k] + dp[k][j] + c[j] - c[i]);
        }
        return dp[0][m + 1];
    }
}`,
  },
];
