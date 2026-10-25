export default [
  {
    slug: 'unique-paths', title: 'Unique Paths', level: 'Medium',
    summary: 'A robot moves only right or down on an m×n grid. Return the number of distinct paths from the top-left to the bottom-right corner.',
    method: 'uniquePaths', params: [['int', 'm'], ['int', 'n']], returns: 'int',
    tests: [
      { in: [3, 7], out: 28 },
      { in: [3, 2], out: 3 },
      { in: [1, 1] },
      { in: [10, 10] },
      { in: [23, 12] },
    ],
    ref: `class Solution {
    public int uniquePaths(int m, int n) {
        int[] row = new int[n];
        Arrays.fill(row, 1);
        for (int i = 1; i < m; i++) for (int j = 1; j < n; j++) row[j] += row[j - 1];
        return row[n - 1];
    }
}`,
  },
  {
    slug: 'unique-paths-ii', title: 'Unique Paths II', level: 'Medium',
    summary: 'Like Unique Paths, but cells marked 1 are obstacles. Return the number of paths moving only right or down.',
    method: 'uniquePathsWithObstacles', params: [['int[][]', 'obstacleGrid']], returns: 'int',
    tests: [
      { in: [[[0, 0, 0], [0, 1, 0], [0, 0, 0]]], out: 2 },
      { in: [[[0, 1], [0, 0]]], out: 1 },
      { in: [[[1]]] },
      { in: [[[0, 0], [1, 1], [0, 0]]] },
    ],
    ref: `class Solution {
    public int uniquePathsWithObstacles(int[][] g) {
        int n = g[0].length;
        int[] row = new int[n];
        row[0] = 1;
        for (int[] r : g) for (int j = 0; j < n; j++) { if (r[j] == 1) row[j] = 0; else if (j > 0) row[j] += row[j - 1]; }
        return row[n - 1];
    }
}`,
  },
  {
    slug: 'minimum-path-sum', title: 'Minimum Path Sum', level: 'Medium',
    summary: 'Moving only right or down, return the smallest possible sum of a path from the top-left to the bottom-right cell.',
    method: 'minPathSum', params: [['int[][]', 'grid']], returns: 'int',
    tests: [
      { in: [[[1, 3, 1], [1, 5, 1], [4, 2, 1]]], out: 7 },
      { in: [[[1, 2, 3], [4, 5, 6]]], out: 12 },
      { in: [[[5]]] },
      { in: [[[1], [2], [3]]] },
    ],
    ref: `class Solution {
    public int minPathSum(int[][] g) {
        int r = g.length, c = g[0].length;
        int[] dp = new int[c];
        for (int i = 0; i < r; i++) for (int j = 0; j < c; j++) {
            if (i == 0 && j == 0) dp[j] = g[0][0];
            else if (i == 0) dp[j] = dp[j - 1] + g[i][j];
            else if (j == 0) dp[j] += g[i][j];
            else dp[j] = Math.min(dp[j], dp[j - 1]) + g[i][j];
        }
        return dp[c - 1];
    }
}`,
  },
  {
    slug: 'triangle', title: 'Triangle', level: 'Medium',
    summary: 'From the top of the triangle, move to an adjacent number on the row below each step. Return the minimum path sum to the bottom.',
    method: 'minimumTotal', params: [['List<List<Integer>>', 'triangle']], returns: 'int',
    tests: [
      { in: [[[2], [3, 4], [6, 5, 7], [4, 1, 8, 3]]], out: 11 },
      { in: [[[-10]]], out: -10 },
      { in: [[[1], [2, 3]]] },
      { in: [[[-1], [2, 3], [1, -1, -3]]] },
    ],
    ref: `class Solution {
    public int minimumTotal(List<List<Integer>> t) {
        int n = t.size();
        int[] dp = new int[n + 1];
        for (int i = n - 1; i >= 0; i--) for (int j = 0; j <= i; j++) dp[j] = t.get(i).get(j) + Math.min(dp[j], dp[j + 1]);
        return dp[0];
    }
}`,
  },
  {
    slug: 'minimum-falling-path-sum', title: 'Minimum Falling Path Sum', level: 'Medium',
    summary: 'A falling path starts in the first row and moves to the cell below, below-left or below-right each step. Return the minimum sum of any falling path.',
    method: 'minFallingPathSum', params: [['int[][]', 'matrix']], returns: 'int',
    tests: [
      { in: [[[2, 1, 3], [6, 5, 4], [7, 8, 9]]], out: 13 },
      { in: [[[-19, 57], [-40, -5]]], out: -59 },
      { in: [[[7]]] },
      { in: [[[100, -42, -46, -41], [31, 97, 10, -10], [-58, -51, 82, 89], [51, 81, 69, -51]]] },
    ],
    ref: `class Solution {
    public int minFallingPathSum(int[][] m) {
        int n = m.length;
        int[] dp = m[0].clone();
        for (int i = 1; i < n; i++) {
            int[] next = new int[n];
            for (int j = 0; j < n; j++) {
                int best = dp[j];
                if (j > 0) best = Math.min(best, dp[j - 1]);
                if (j < n - 1) best = Math.min(best, dp[j + 1]);
                next[j] = best + m[i][j];
            }
            dp = next;
        }
        int best = Integer.MAX_VALUE;
        for (int x : dp) best = Math.min(best, x);
        return best;
    }
}`,
  },
  {
    slug: 'maximal-square', title: 'Maximal Square', level: 'Medium',
    summary: 'In a grid of "0"/"1" characters, return the area of the largest square containing only "1"s.',
    method: 'maximalSquare', params: [['char[][]', 'matrix']], returns: 'int',
    tests: [
      { in: [[['1', '0', '1', '0', '0'], ['1', '0', '1', '1', '1'], ['1', '1', '1', '1', '1'], ['1', '0', '0', '1', '0']]], out: 4 },
      { in: [[['0', '1'], ['1', '0']]], out: 1 },
      { in: [[['0']]], out: 0 },
      { in: [[['1', '1', '1'], ['1', '1', '1'], ['1', '1', '1']]] },
    ],
    ref: `class Solution {
    public int maximalSquare(char[][] m) {
        int r = m.length, c = m[0].length, best = 0;
        int[][] dp = new int[r + 1][c + 1];
        for (int i = 1; i <= r; i++) for (int j = 1; j <= c; j++) if (m[i - 1][j - 1] == '1') {
            dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], Math.min(dp[i - 1][j], dp[i][j - 1]));
            best = Math.max(best, dp[i][j]);
        }
        return best * best;
    }
}`,
  },
  {
    slug: 'count-square-submatrices-with-all-ones', title: 'Count Square Submatrices with All Ones', level: 'Medium',
    summary: 'Count every square submatrix (of any size) made entirely of 1s.',
    method: 'countSquares', params: [['int[][]', 'matrix']], returns: 'int',
    tests: [
      { in: [[[0, 1, 1, 1], [1, 1, 1, 1], [0, 1, 1, 1]]], out: 15 },
      { in: [[[1, 0, 1], [1, 1, 0], [1, 1, 0]]], out: 7 },
      { in: [[[0]]] },
      { in: [[[1, 1], [1, 1]]] },
    ],
    ref: `class Solution {
    public int countSquares(int[][] m) {
        int r = m.length, c = m[0].length, total = 0;
        int[][] dp = new int[r + 1][c + 1];
        for (int i = 1; i <= r; i++) for (int j = 1; j <= c; j++) if (m[i - 1][j - 1] == 1) {
            dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], Math.min(dp[i - 1][j], dp[i][j - 1]));
            total += dp[i][j];
        }
        return total;
    }
}`,
  },
  {
    slug: 'dungeon-game', title: 'Dungeon Game', level: 'Hard',
    summary: 'A knight walks right or down from the top-left to the bottom-right room; each room adds or removes health, and health must stay above 0. Return the minimum starting health.',
    method: 'calculateMinimumHP', params: [['int[][]', 'dungeon']], returns: 'int',
    tests: [
      { in: [[[-2, -3, 3], [-5, -10, 1], [10, 30, -5]]], out: 7 },
      { in: [[[0]]], out: 1 },
      { in: [[[100]]] },
      { in: [[[1, -3, 3], [0, -2, 0], [-3, -3, -3]]] },
    ],
    ref: `class Solution {
    public int calculateMinimumHP(int[][] d) {
        int r = d.length, c = d[0].length;
        int[][] need = new int[r + 1][c + 1];
        for (int[] row : need) Arrays.fill(row, Integer.MAX_VALUE);
        need[r][c - 1] = need[r - 1][c] = 1;
        for (int i = r - 1; i >= 0; i--) for (int j = c - 1; j >= 0; j--) need[i][j] = Math.max(1, Math.min(need[i + 1][j], need[i][j + 1]) - d[i][j]);
        return need[0][0];
    }
}`,
  },
  {
    slug: 'cherry-pickup', title: 'Cherry Pickup', level: 'Hard',
    summary: 'Cells are 1 (cherry), 0 (empty) or −1 (thorn). Walk from the top-left to the bottom-right moving right/down, then back moving left/up, collecting cherries (each picked once). Return the most cherries, or 0 if no valid trip exists.',
    method: 'cherryPickup', params: [['int[][]', 'grid']], returns: 'int',
    tests: [
      { in: [[[0, 1, -1], [1, 0, -1], [1, 1, 1]]], out: 5 },
      { in: [[[1, 1, -1], [1, -1, 1], [-1, 1, 1]]], out: 0 },
      { in: [[[1]]] },
      { in: [[[1, 1, 1, 1, 0, 0, 0], [0, 0, 0, 1, 0, 0, 0], [0, 0, 0, 1, 0, 0, 1], [1, 0, 0, 1, 0, 0, 0], [0, 0, 0, 1, 0, 0, 0], [0, 0, 0, 1, 0, 0, 0], [0, 0, 0, 1, 1, 1, 1]]] },
    ],
    ref: `class Solution {
    public int cherryPickup(int[][] g) {
        int n = g.length;
        int[][] dp = new int[n][n];
        for (int[] row : dp) Arrays.fill(row, Integer.MIN_VALUE);
        dp[0][0] = g[0][0];
        for (int t = 1; t <= 2 * n - 2; t++) {
            int[][] next = new int[n][n];
            for (int[] row : next) Arrays.fill(row, Integer.MIN_VALUE);
            for (int i = Math.max(0, t - n + 1); i <= Math.min(n - 1, t); i++) for (int j = Math.max(0, t - n + 1); j <= Math.min(n - 1, t); j++) {
                if (g[i][t - i] == -1 || g[j][t - j] == -1) continue;
                int best = Integer.MIN_VALUE;
                for (int a = i - 1; a <= i; a++) for (int b = j - 1; b <= j; b++) if (a >= 0 && b >= 0) best = Math.max(best, dp[a][b]);
                if (best == Integer.MIN_VALUE) continue;
                next[i][j] = best + g[i][t - i] + (i != j ? g[j][t - j] : 0);
            }
            dp = next;
        }
        return Math.max(0, dp[n - 1][n - 1]);
    }
}`,
  },
  {
    slug: 'longest-increasing-path-in-a-matrix', title: 'Longest Increasing Path in a Matrix', level: 'Hard',
    summary: 'Moving up, down, left or right, return the length of the longest path whose values strictly increase at every step.',
    method: 'longestIncreasingPath', params: [['int[][]', 'matrix']], returns: 'int',
    tests: [
      { in: [[[9, 9, 4], [6, 6, 8], [2, 1, 1]]], out: 4 },
      { in: [[[3, 4, 5], [3, 2, 6], [2, 2, 1]]], out: 4 },
      { in: [[[1]]], out: 1 },
      { in: [[[7, 7], [7, 7]]] },
      { in: [[[1, 2, 3], [6, 5, 4], [7, 8, 9]]] },
      { in: [[[0, 2147483647]]] },
      { in: [[[3, 2, 1], [4, 9, 0], [5, 6, 7]]] },
    ],
    ref: `class Solution {
    public int longestIncreasingPath(int[][] matrix) {
        int m = matrix.length, n = matrix[0].length, best = 0;
        int[][] memo = new int[m][n];
        for (int r = 0; r < m; r++) for (int c = 0; c < n; c++) best = Math.max(best, dfs(matrix, r, c, memo));
        return best;
    }
    private static final int[][] DIRS = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } };
    private int dfs(int[][] g, int r, int c, int[][] memo) {
        if (memo[r][c] != 0) return memo[r][c];
        int best = 1;
        for (int[] d : DIRS) {
            int nr = r + d[0], nc = c + d[1];
            if (nr < 0 || nc < 0 || nr >= g.length || nc >= g[0].length || g[nr][nc] <= g[r][c]) continue;
            best = Math.max(best, 1 + dfs(g, nr, nc, memo));
        }
        return memo[r][c] = best;
    }
}`,
  },
];
