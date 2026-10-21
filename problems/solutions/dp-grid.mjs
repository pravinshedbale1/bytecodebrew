const r = String.raw;

export default {
  'unique-paths': {
    pattern: 'Grid DP: paths(r, c) = paths(r − 1, c) + paths(r, c − 1) (or one binomial coefficient)',
    approaches: [
      {
        level: 'Brute force', name: 'Recursion over the last move',
        idea: 'The robot reaches cell `(r, c)` from the cell above or the cell to the left, so the number of paths is the sum of the paths to those two cells.',
        steps: [
          '`paths(r, c)`: if `r == 0` or `c == 0`, return 1 (a single straight line).',
          'Otherwise return `paths(r − 1, c) + paths(r, c − 1)`.',
          'Answer `paths(m − 1, n − 1)`.',
        ],
        time: 'O(2^(m+n))', space: 'O(m + n)',
        why: 'Every path is traced separately, so the work is at least the answer itself (up to 2·10⁹ here).',
        timesOut: [4],
        code: {
          java: r`class Solution {
    public int uniquePaths(int m, int n) {
        if (m == 1 || n == 1) return 1;
        return uniquePaths(m - 1, n) + uniquePaths(m, n - 1);
    }
}`,
          cpp: r`class Solution {
public:
    int uniquePaths(int m, int n) {
        if (m == 1 || n == 1) return 1;
        return uniquePaths(m - 1, n) + uniquePaths(m, n - 1);
    }
};`,
          python: r`class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        if m == 1 or n == 1:
            return 1
        return self.uniquePaths(m - 1, n) + self.uniquePaths(m, n - 1)`,
          javascript: r`var uniquePaths = function(m, n) {
    if (m === 1 || n === 1) return 1;
    return uniquePaths(m - 1, n) + uniquePaths(m, n - 1);
};`,
        },
      },
      {
        level: 'Better', name: '2-D table',
        idea: 'Fill `dp[r][c]` = paths to `(r, c)` row by row; the first row and column are all 1.',
        steps: [
          'Set `dp[0][*] = dp[*][0] = 1`.',
          'For every other cell: `dp[r][c] = dp[r − 1][c] + dp[r][c − 1]`.',
          'Return `dp[m − 1][n − 1]`.',
        ],
        time: 'O(m·n)', space: 'O(m·n)',
        why: 'Each of the m·n cells is computed once from two neighbours.',
        code: {
          java: r`class Solution {
    public int uniquePaths(int m, int n) {
        int[][] dp = new int[m][n];
        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++)
                dp[r][c] = (r == 0 || c == 0) ? 1 : dp[r - 1][c] + dp[r][c - 1];
        return dp[m - 1][n - 1];
    }
}`,
          cpp: r`class Solution {
public:
    int uniquePaths(int m, int n) {
        vector<vector<int>> dp(m, vector<int>(n, 1));
        for (int r = 1; r < m; r++)
            for (int c = 1; c < n; c++) dp[r][c] = dp[r - 1][c] + dp[r][c - 1];
        return dp[m - 1][n - 1];
    }
};`,
          python: r`class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        dp = [[1] * n for _ in range(m)]
        for r in range(1, m):
            for c in range(1, n):
                dp[r][c] = dp[r - 1][c] + dp[r][c - 1]
        return dp[m - 1][n - 1]`,
          javascript: r`var uniquePaths = function(m, n) {
    const dp = Array.from({ length: m }, () => new Array(n).fill(1));
    for (let r = 1; r < m; r++)
        for (let c = 1; c < n; c++) dp[r][c] = dp[r - 1][c] + dp[r][c - 1];
    return dp[m - 1][n - 1];
};`,
        },
      },
      {
        level: 'Better', name: 'One row',
        idea: 'Each row only needs the row above. Keep one array: before the update `row[c]` is the value from above, and `row[c − 1]` is already the new value to the left.',
        steps: [
          'Set `row` to n ones.',
          'Repeat for each of the remaining m − 1 rows: for `c` from 1, `row[c] += row[c − 1]`.',
          'Return `row[n − 1]`.',
        ],
        time: 'O(m·n)', space: 'O(n)',
        why: 'Same number of steps; memory drops to a single row.',
        code: {
          java: r`class Solution {
    public int uniquePaths(int m, int n) {
        int[] row = new int[n];
        Arrays.fill(row, 1);
        for (int r = 1; r < m; r++)
            for (int c = 1; c < n; c++) row[c] += row[c - 1];
        return row[n - 1];
    }
}`,
          cpp: r`class Solution {
public:
    int uniquePaths(int m, int n) {
        vector<int> row(n, 1);
        for (int r = 1; r < m; r++)
            for (int c = 1; c < n; c++) row[c] += row[c - 1];
        return row[n - 1];
    }
};`,
          python: r`class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        row = [1] * n
        for _ in range(m - 1):
            for c in range(1, n):
                row[c] += row[c - 1]
        return row[-1]`,
          javascript: r`var uniquePaths = function(m, n) {
    const row = new Array(n).fill(1);
    for (let r = 1; r < m; r++)
        for (let c = 1; c < n; c++) row[c] += row[c - 1];
    return row[n - 1];
};`,
        },
      },
      {
        level: 'Optimal', name: 'Count arrangements: C(m + n − 2, m − 1)',
        idea: 'Every path is a sequence of m − 1 downs and n − 1 rights in some order. The number of paths is the number of ways to choose which of the m + n − 2 moves are downs.',
        steps: [
          'Let `k = min(m, n) − 1` and `total = m + n − 2`.',
          'Compute `C(total, k)` incrementally: `result = result · (total − k + i) / i` for `i = 1..k`.',
          'Each intermediate value is an exact binomial coefficient, so the division is exact; use 64-bit numbers.',
        ],
        time: 'O(min(m, n))', space: 'O(1)',
        why: 'k multiplications and divisions. The intermediate product before dividing stays below about 2·10⁹ × 100, well inside 64 bits.',
        code: {
          java: r`class Solution {
    public int uniquePaths(int m, int n) {
        int total = m + n - 2, k = Math.min(m, n) - 1;
        long result = 1;
        for (int i = 1; i <= k; i++) result = result * (total - k + i) / i;
        return (int) result;
    }
}`,
          cpp: r`class Solution {
public:
    int uniquePaths(int m, int n) {
        int total = m + n - 2, k = min(m, n) - 1;
        long long result = 1;
        for (int i = 1; i <= k; i++) result = result * (total - k + i) / i;
        return (int) result;
    }
};`,
          python: r`class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        return comb(m + n - 2, m - 1)`,
          javascript: r`var uniquePaths = function(m, n) {
    const total = m + n - 2, k = Math.min(m, n) - 1;
    let result = 1;
    // result stays an exact integer: each step equals C(total - k + i, i)
    for (let i = 1; i <= k; i++) result = result * (total - k + i) / i;
    return Math.round(result);
};`,
        },
      },
    ],
  },

  'unique-paths-ii': {
    pattern: 'Grid DP where blocked cells contribute 0 paths',
    approaches: [
      {
        level: 'Brute force', name: 'Recursion that stops at obstacles',
        idea: 'Same as Unique Paths, but a blocked cell (or a cell off the grid) has 0 paths.',
        steps: [
          '`paths(r, c)`: return 0 if `r < 0`, `c < 0` or the cell is blocked; return 1 at `(0, 0)`.',
          'Otherwise return `paths(r − 1, c) + paths(r, c − 1)`.',
        ],
        time: 'O(2^(m+n))', space: 'O(m + n)',
        why: 'Every path is traced separately.',
        code: {
          java: r`class Solution {
    public int uniquePathsWithObstacles(int[][] obstacleGrid) {
        return paths(obstacleGrid, obstacleGrid.length - 1, obstacleGrid[0].length - 1);
    }

    private int paths(int[][] g, int r, int c) {
        if (r < 0 || c < 0 || g[r][c] == 1) return 0;
        if (r == 0 && c == 0) return 1;
        return paths(g, r - 1, c) + paths(g, r, c - 1);
    }
}`,
          cpp: r`class Solution {
    int paths(vector<vector<int>>& g, int r, int c) {
        if (r < 0 || c < 0 || g[r][c] == 1) return 0;
        if (r == 0 && c == 0) return 1;
        return paths(g, r - 1, c) + paths(g, r, c - 1);
    }
public:
    int uniquePathsWithObstacles(vector<vector<int>>& obstacleGrid) {
        return paths(obstacleGrid, obstacleGrid.size() - 1, obstacleGrid[0].size() - 1);
    }
};`,
          python: r`class Solution:
    def uniquePathsWithObstacles(self, obstacleGrid: List[List[int]]) -> int:
        def paths(r, c):
            if r < 0 or c < 0 or obstacleGrid[r][c] == 1:
                return 0
            if r == 0 and c == 0:
                return 1
            return paths(r - 1, c) + paths(r, c - 1)
        return paths(len(obstacleGrid) - 1, len(obstacleGrid[0]) - 1)`,
          javascript: r`var uniquePathsWithObstacles = function(obstacleGrid) {
    const paths = (r, c) => {
        if (r < 0 || c < 0 || obstacleGrid[r][c] === 1) return 0;
        if (r === 0 && c === 0) return 1;
        return paths(r - 1, c) + paths(r, c - 1);
    };
    return paths(obstacleGrid.length - 1, obstacleGrid[0].length - 1);
};`,
        },
      },
      {
        level: 'Better', name: '2-D table',
        idea: 'Fill `dp[r][c]` row by row: 0 for obstacles, otherwise the sum of the values above and to the left.',
        steps: [
          '`dp[0][0] = 1` if the start is free, else 0.',
          'For every cell: if blocked, 0; else add `dp[r − 1][c]` (if `r > 0`) and `dp[r][c − 1]` (if `c > 0`).',
          'Return the bottom-right value.',
        ],
        time: 'O(m·n)', space: 'O(m·n)',
        why: 'One pass over the grid. Obstacles can make counts at middle cells larger than the final answer (even beyond 64 bits), so the sums wrap modulo 2³² on purpose: the final answer is below 2³¹, so the wrapped value is still exact. Java\'s `int` wraps by itself; C++ uses `unsigned` (signed overflow is undefined there) and JavaScript uses `>>> 0`.',
        code: {
          java: r`class Solution {
    public int uniquePathsWithObstacles(int[][] obstacleGrid) {
        int m = obstacleGrid.length, n = obstacleGrid[0].length;
        int[][] dp = new int[m][n];
        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++) {
                if (obstacleGrid[r][c] == 1) continue;
                if (r == 0 && c == 0) { dp[r][c] = 1; continue; }
                dp[r][c] = (r > 0 ? dp[r - 1][c] : 0) + (c > 0 ? dp[r][c - 1] : 0);
            }
        return dp[m - 1][n - 1];
    }
}`,
          cpp: r`class Solution {
public:
    int uniquePathsWithObstacles(vector<vector<int>>& obstacleGrid) {
        int m = obstacleGrid.size(), n = obstacleGrid[0].size();
        vector<vector<unsigned>> dp(m, vector<unsigned>(n, 0));
        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++) {
                if (obstacleGrid[r][c] == 1) continue;
                if (r == 0 && c == 0) { dp[r][c] = 1; continue; }
                dp[r][c] = (r > 0 ? dp[r - 1][c] : 0u) + (c > 0 ? dp[r][c - 1] : 0u);
            }
        return (int) dp[m - 1][n - 1];
    }
};`,
          python: r`class Solution:
    def uniquePathsWithObstacles(self, obstacleGrid: List[List[int]]) -> int:
        m, n = len(obstacleGrid), len(obstacleGrid[0])
        dp = [[0] * n for _ in range(m)]
        for r in range(m):
            for c in range(n):
                if obstacleGrid[r][c] == 1:
                    continue
                if r == 0 and c == 0:
                    dp[r][c] = 1
                else:
                    dp[r][c] = (dp[r - 1][c] if r else 0) + (dp[r][c - 1] if c else 0)
        return dp[m - 1][n - 1]`,
          javascript: r`var uniquePathsWithObstacles = function(obstacleGrid) {
    const m = obstacleGrid.length, n = obstacleGrid[0].length;
    const dp = Array.from({ length: m }, () => new Array(n).fill(0));
    for (let r = 0; r < m; r++)
        for (let c = 0; c < n; c++) {
            if (obstacleGrid[r][c] === 1) continue;
            if (r === 0 && c === 0) { dp[r][c] = 1; continue; }
            dp[r][c] = ((r > 0 ? dp[r - 1][c] : 0) + (c > 0 ? dp[r][c - 1] : 0)) >>> 0;
        }
    return dp[m - 1][n - 1];
};`,
        },
      },
      {
        level: 'Optimal', name: 'One row',
        idea: 'Keep a single row: `row[c]` holds the value from above until it is updated; add the new value on its left, or reset it to 0 on an obstacle.',
        steps: [
          '`row[0] = 1` if the start is free.',
          'For each grid row, for each `c`: if blocked, `row[c] = 0`; else if `c > 0`, `row[c] += row[c − 1]`.',
          'Return `row[n − 1]`.',
        ],
        time: 'O(m·n)', space: 'O(n)',
        why: 'Same pass with one row of memory (and the same deliberate 32-bit wrap-around).',
        code: {
          java: r`class Solution {
    public int uniquePathsWithObstacles(int[][] obstacleGrid) {
        int n = obstacleGrid[0].length;
        int[] row = new int[n];
        row[0] = obstacleGrid[0][0] == 1 ? 0 : 1;
        for (int[] cells : obstacleGrid)
            for (int c = 0; c < n; c++) {
                if (cells[c] == 1) row[c] = 0;
                else if (c > 0) row[c] += row[c - 1];
            }
        return row[n - 1];
    }
}`,
          cpp: r`class Solution {
public:
    int uniquePathsWithObstacles(vector<vector<int>>& obstacleGrid) {
        int n = obstacleGrid[0].size();
        vector<unsigned> row(n, 0);
        row[0] = obstacleGrid[0][0] == 1 ? 0 : 1;
        for (auto& cells : obstacleGrid)
            for (int c = 0; c < n; c++) {
                if (cells[c] == 1) row[c] = 0;
                else if (c > 0) row[c] += row[c - 1];
            }
        return (int) row[n - 1];
    }
};`,
          python: r`class Solution:
    def uniquePathsWithObstacles(self, obstacleGrid: List[List[int]]) -> int:
        n = len(obstacleGrid[0])
        row = [0] * n
        row[0] = 0 if obstacleGrid[0][0] == 1 else 1
        for cells in obstacleGrid:
            for c in range(n):
                if cells[c] == 1:
                    row[c] = 0
                elif c > 0:
                    row[c] += row[c - 1]
        return row[-1]`,
          javascript: r`var uniquePathsWithObstacles = function(obstacleGrid) {
    const n = obstacleGrid[0].length, row = new Array(n).fill(0);
    row[0] = obstacleGrid[0][0] === 1 ? 0 : 1;
    for (const cells of obstacleGrid)
        for (let c = 0; c < n; c++) {
            if (cells[c] === 1) row[c] = 0;
            else if (c > 0) row[c] = (row[c] + row[c - 1]) >>> 0;
        }
    return row[n - 1];
};`,
        },
      },
    ],
  },

  'minimum-path-sum': {
    pattern: 'Grid DP: cost(r, c) = grid[r][c] + min(cost from above, cost from the left)',
    approaches: [
      {
        level: 'Brute force', name: 'Recursion over the last move',
        idea: 'The cheapest path to a cell comes from the cheaper of its top and left neighbours, plus the cell\'s own value.',
        steps: [
          '`cost(r, c)`: if out of the grid, return ∞; at `(0, 0)`, return `grid[0][0]`.',
          'Return `grid[r][c] + min(cost(r − 1, c), cost(r, c − 1))`.',
        ],
        time: 'O(2^(m+n))', space: 'O(m + n)',
        why: 'Overlapping subproblems are recomputed for every path.',
        code: {
          java: r`class Solution {
    public int minPathSum(int[][] grid) {
        return cost(grid, grid.length - 1, grid[0].length - 1);
    }

    private int cost(int[][] g, int r, int c) {
        if (r < 0 || c < 0) return Integer.MAX_VALUE;
        if (r == 0 && c == 0) return g[0][0];
        return g[r][c] + Math.min(cost(g, r - 1, c), cost(g, r, c - 1));
    }
}`,
          cpp: r`class Solution {
    int cost(vector<vector<int>>& g, int r, int c) {
        if (r < 0 || c < 0) return INT_MAX;
        if (r == 0 && c == 0) return g[0][0];
        return g[r][c] + min(cost(g, r - 1, c), cost(g, r, c - 1));
    }
public:
    int minPathSum(vector<vector<int>>& grid) {
        return cost(grid, grid.size() - 1, grid[0].size() - 1);
    }
};`,
          python: r`class Solution:
    def minPathSum(self, grid: List[List[int]]) -> int:
        def cost(r, c):
            if r < 0 or c < 0:
                return inf
            if r == 0 and c == 0:
                return grid[0][0]
            return grid[r][c] + min(cost(r - 1, c), cost(r, c - 1))
        return cost(len(grid) - 1, len(grid[0]) - 1)`,
          javascript: r`var minPathSum = function(grid) {
    const cost = (r, c) => {
        if (r < 0 || c < 0) return Infinity;
        if (r === 0 && c === 0) return grid[0][0];
        return grid[r][c] + Math.min(cost(r - 1, c), cost(r, c - 1));
    };
    return cost(grid.length - 1, grid[0].length - 1);
};`,
        },
      },
      {
        level: 'Better', name: '2-D table',
        idea: 'Fill `dp[r][c]` row by row from the same recurrence; the first row and column only have one way in.',
        steps: [
          '`dp[0][0] = grid[0][0]`; the first row and column are running sums.',
          'Other cells: `dp[r][c] = grid[r][c] + min(dp[r − 1][c], dp[r][c − 1])`.',
          'Return the bottom-right value.',
        ],
        time: 'O(m·n)', space: 'O(m·n)',
        why: 'Each cell once.',
        code: {
          java: r`class Solution {
    public int minPathSum(int[][] grid) {
        int m = grid.length, n = grid[0].length;
        int[][] dp = new int[m][n];
        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++) {
                if (r == 0 && c == 0) dp[r][c] = grid[0][0];
                else if (r == 0) dp[r][c] = dp[r][c - 1] + grid[r][c];
                else if (c == 0) dp[r][c] = dp[r - 1][c] + grid[r][c];
                else dp[r][c] = grid[r][c] + Math.min(dp[r - 1][c], dp[r][c - 1]);
            }
        return dp[m - 1][n - 1];
    }
}`,
          cpp: r`class Solution {
public:
    int minPathSum(vector<vector<int>>& grid) {
        int m = grid.size(), n = grid[0].size();
        vector<vector<int>> dp(m, vector<int>(n));
        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++) {
                if (r == 0 && c == 0) dp[r][c] = grid[0][0];
                else if (r == 0) dp[r][c] = dp[r][c - 1] + grid[r][c];
                else if (c == 0) dp[r][c] = dp[r - 1][c] + grid[r][c];
                else dp[r][c] = grid[r][c] + min(dp[r - 1][c], dp[r][c - 1]);
            }
        return dp[m - 1][n - 1];
    }
};`,
          python: r`class Solution:
    def minPathSum(self, grid: List[List[int]]) -> int:
        m, n = len(grid), len(grid[0])
        dp = [[0] * n for _ in range(m)]
        for r in range(m):
            for c in range(n):
                if r == 0 and c == 0:
                    dp[r][c] = grid[0][0]
                elif r == 0:
                    dp[r][c] = dp[r][c - 1] + grid[r][c]
                elif c == 0:
                    dp[r][c] = dp[r - 1][c] + grid[r][c]
                else:
                    dp[r][c] = grid[r][c] + min(dp[r - 1][c], dp[r][c - 1])
        return dp[m - 1][n - 1]`,
          javascript: r`var minPathSum = function(grid) {
    const m = grid.length, n = grid[0].length;
    const dp = Array.from({ length: m }, () => new Array(n).fill(0));
    for (let r = 0; r < m; r++)
        for (let c = 0; c < n; c++) {
            if (r === 0 && c === 0) dp[r][c] = grid[0][0];
            else if (r === 0) dp[r][c] = dp[r][c - 1] + grid[r][c];
            else if (c === 0) dp[r][c] = dp[r - 1][c] + grid[r][c];
            else dp[r][c] = grid[r][c] + Math.min(dp[r - 1][c], dp[r][c - 1]);
        }
    return dp[m - 1][n - 1];
};`,
        },
      },
      {
        level: 'Optimal', name: 'One row',
        idea: 'Keep one row of costs: `row[c]` is the cost from above until updated, and `row[c − 1]` is the new cost to the left.',
        steps: [
          'Fill `row` with the first row\'s running sums.',
          'For each next grid row: `row[0] += grid[r][0]`; for `c >= 1`, `row[c] = grid[r][c] + min(row[c], row[c − 1])`.',
          'Return `row[n − 1]`.',
        ],
        time: 'O(m·n)', space: 'O(n)',
        why: 'Same work, one row of memory.',
        code: {
          java: r`class Solution {
    public int minPathSum(int[][] grid) {
        int m = grid.length, n = grid[0].length;
        int[] row = new int[n];
        row[0] = grid[0][0];
        for (int c = 1; c < n; c++) row[c] = row[c - 1] + grid[0][c];
        for (int r = 1; r < m; r++) {
            row[0] += grid[r][0];
            for (int c = 1; c < n; c++) row[c] = grid[r][c] + Math.min(row[c], row[c - 1]);
        }
        return row[n - 1];
    }
}`,
          cpp: r`class Solution {
public:
    int minPathSum(vector<vector<int>>& grid) {
        int m = grid.size(), n = grid[0].size();
        vector<int> row(n);
        row[0] = grid[0][0];
        for (int c = 1; c < n; c++) row[c] = row[c - 1] + grid[0][c];
        for (int r = 1; r < m; r++) {
            row[0] += grid[r][0];
            for (int c = 1; c < n; c++) row[c] = grid[r][c] + min(row[c], row[c - 1]);
        }
        return row[n - 1];
    }
};`,
          python: r`class Solution:
    def minPathSum(self, grid: List[List[int]]) -> int:
        row = list(accumulate(grid[0]))
        for cells in grid[1:]:
            row[0] += cells[0]
            for c in range(1, len(row)):
                row[c] = cells[c] + min(row[c], row[c - 1])
        return row[-1]`,
          javascript: r`var minPathSum = function(grid) {
    const m = grid.length, n = grid[0].length, row = new Array(n);
    row[0] = grid[0][0];
    for (let c = 1; c < n; c++) row[c] = row[c - 1] + grid[0][c];
    for (let r = 1; r < m; r++) {
        row[0] += grid[r][0];
        for (let c = 1; c < n; c++) row[c] = grid[r][c] + Math.min(row[c], row[c - 1]);
    }
    return row[n - 1];
};`,
        },
      },
    ],
  },

  'triangle': {
    pattern: 'Bottom-up DP: best(r, i) = value + min(best below-left, best below-right)',
    approaches: [
      {
        level: 'Brute force', name: 'Recursion from the top',
        idea: 'From position `(r, i)`, the best path is its value plus the better of the two paths starting just below it.',
        steps: [
          '`best(r, i)`: on the last row, return the value.',
          'Otherwise return `triangle[r][i] + min(best(r + 1, i), best(r + 1, i + 1))`.',
          'Answer `best(0, 0)`.',
        ],
        time: 'O(2ⁿ)', space: 'O(n)',
        why: 'Two calls per level for n levels, revisiting shared positions repeatedly.',
        code: {
          java: r`class Solution {
    public int minimumTotal(List<List<Integer>> triangle) {
        return best(triangle, 0, 0);
    }

    private int best(List<List<Integer>> t, int r, int i) {
        int v = t.get(r).get(i);
        if (r == t.size() - 1) return v;
        return v + Math.min(best(t, r + 1, i), best(t, r + 1, i + 1));
    }
}`,
          cpp: r`class Solution {
    int best(vector<vector<int>>& t, int r, int i) {
        if (r == (int) t.size() - 1) return t[r][i];
        return t[r][i] + min(best(t, r + 1, i), best(t, r + 1, i + 1));
    }
public:
    int minimumTotal(vector<vector<int>>& triangle) {
        return best(triangle, 0, 0);
    }
};`,
          python: r`class Solution:
    def minimumTotal(self, triangle: List[List[int]]) -> int:
        def best(r, i):
            if r == len(triangle) - 1:
                return triangle[r][i]
            return triangle[r][i] + min(best(r + 1, i), best(r + 1, i + 1))
        return best(0, 0)`,
          javascript: r`var minimumTotal = function(triangle) {
    const best = (r, i) => {
        if (r === triangle.length - 1) return triangle[r][i];
        return triangle[r][i] + Math.min(best(r + 1, i), best(r + 1, i + 1));
    };
    return best(0, 0);
};`,
        },
      },
      {
        level: 'Better', name: 'Memoised recursion',
        idea: 'There are only about n²/2 positions; cache `best(r, i)` for each.',
        steps: [
          'Same recurrence as the brute force.',
          'Store each position\'s result the first time it is computed and reuse it.',
        ],
        time: 'O(n²)', space: 'O(n²)',
        why: 'Each of the n(n + 1)/2 positions is solved once; the cache has the same size.',
        code: {
          java: r`class Solution {
    private Integer[][] memo;

    public int minimumTotal(List<List<Integer>> triangle) {
        memo = new Integer[triangle.size()][triangle.size()];
        return best(triangle, 0, 0);
    }

    private int best(List<List<Integer>> t, int r, int i) {
        if (memo[r][i] != null) return memo[r][i];
        int v = t.get(r).get(i);
        if (r < t.size() - 1) v += Math.min(best(t, r + 1, i), best(t, r + 1, i + 1));
        return memo[r][i] = v;
    }
}`,
          cpp: r`class Solution {
    vector<vector<int>> memo;
    vector<vector<bool>> done;
    int best(vector<vector<int>>& t, int r, int i) {
        if (done[r][i]) return memo[r][i];
        int v = t[r][i];
        if (r < (int) t.size() - 1) v += min(best(t, r + 1, i), best(t, r + 1, i + 1));
        done[r][i] = true;
        return memo[r][i] = v;
    }
public:
    int minimumTotal(vector<vector<int>>& triangle) {
        int n = triangle.size();
        memo.assign(n, vector<int>(n, 0));
        done.assign(n, vector<bool>(n, false));
        return best(triangle, 0, 0);
    }
};`,
          python: r`class Solution:
    def minimumTotal(self, triangle: List[List[int]]) -> int:
        @cache
        def best(r, i):
            if r == len(triangle) - 1:
                return triangle[r][i]
            return triangle[r][i] + min(best(r + 1, i), best(r + 1, i + 1))
        return best(0, 0)`,
          javascript: r`var minimumTotal = function(triangle) {
    const memo = new Map(), n = triangle.length;
    const best = (r, i) => {
        if (r === n - 1) return triangle[r][i];
        const key = r * n + i;
        if (!memo.has(key)) memo.set(key, triangle[r][i] + Math.min(best(r + 1, i), best(r + 1, i + 1)));
        return memo.get(key);
    };
    return best(0, 0);
};`,
        },
      },
      {
        level: 'Optimal', name: 'Bottom-up with one row',
        idea: 'Start from the bottom row and fold upwards: after processing row `r`, `row[i]` is the best path from `(r, i)` to the bottom. The top entry is the answer.',
        steps: [
          'Copy the last row into `row`.',
          'For `r` from n − 2 up to 0, for `i` from 0 to r: `row[i] = triangle[r][i] + min(row[i], row[i + 1])`.',
          'Return `row[0]`.',
        ],
        time: 'O(n²)', space: 'O(n)',
        why: 'Each position once; going left to right is safe because `row[i]` only reads `row[i]` and `row[i + 1]`, which are still from the row below.',
        code: {
          java: r`class Solution {
    public int minimumTotal(List<List<Integer>> triangle) {
        int n = triangle.size();
        int[] row = new int[n];
        for (int i = 0; i < n; i++) row[i] = triangle.get(n - 1).get(i);
        for (int r = n - 2; r >= 0; r--)
            for (int i = 0; i <= r; i++) row[i] = triangle.get(r).get(i) + Math.min(row[i], row[i + 1]);
        return row[0];
    }
}`,
          cpp: r`class Solution {
public:
    int minimumTotal(vector<vector<int>>& triangle) {
        int n = triangle.size();
        vector<int> row = triangle[n - 1];
        for (int r = n - 2; r >= 0; r--)
            for (int i = 0; i <= r; i++) row[i] = triangle[r][i] + min(row[i], row[i + 1]);
        return row[0];
    }
};`,
          python: r`class Solution:
    def minimumTotal(self, triangle: List[List[int]]) -> int:
        row = list(triangle[-1])
        for r in range(len(triangle) - 2, -1, -1):
            for i in range(r + 1):
                row[i] = triangle[r][i] + min(row[i], row[i + 1])
        return row[0]`,
          javascript: r`var minimumTotal = function(triangle) {
    const n = triangle.length, row = [...triangle[n - 1]];
    for (let r = n - 2; r >= 0; r--)
        for (let i = 0; i <= r; i++) row[i] = triangle[r][i] + Math.min(row[i], row[i + 1]);
    return row[0];
};`,
        },
      },
    ],
  },

  'minimum-falling-path-sum': {
    pattern: 'Row-by-row DP over three possible parents',
    approaches: [
      {
        level: 'Brute force', name: 'Recursion from every starting cell',
        idea: 'From `(r, c)`, the best falling path is its value plus the best of the paths starting at the three cells below (those inside the grid). Try every cell of the first row.',
        steps: [
          '`best(r, c)`: on the last row, return the value.',
          'Otherwise return `matrix[r][c] + min(best(r + 1, c + d))` over `d ∈ {−1, 0, 1}` inside the grid.',
          'Answer the minimum of `best(0, c)` over all columns.',
        ],
        time: 'O(n·3ⁿ)', space: 'O(n)',
        why: 'Up to three branches per row for n rows, from each of n starts.',
        code: {
          java: r`class Solution {
    public int minFallingPathSum(int[][] matrix) {
        int best = Integer.MAX_VALUE;
        for (int c = 0; c < matrix.length; c++) best = Math.min(best, fall(matrix, 0, c));
        return best;
    }

    private int fall(int[][] m, int r, int c) {
        if (r == m.length - 1) return m[r][c];
        int below = Integer.MAX_VALUE;
        for (int d = -1; d <= 1; d++)
            if (c + d >= 0 && c + d < m.length) below = Math.min(below, fall(m, r + 1, c + d));
        return m[r][c] + below;
    }
}`,
          cpp: r`class Solution {
    int fall(vector<vector<int>>& m, int r, int c) {
        int n = m.size();
        if (r == n - 1) return m[r][c];
        int below = INT_MAX;
        for (int d = -1; d <= 1; d++)
            if (c + d >= 0 && c + d < n) below = min(below, fall(m, r + 1, c + d));
        return m[r][c] + below;
    }
public:
    int minFallingPathSum(vector<vector<int>>& matrix) {
        int best = INT_MAX;
        for (int c = 0; c < (int) matrix.size(); c++) best = min(best, fall(matrix, 0, c));
        return best;
    }
};`,
          python: r`class Solution:
    def minFallingPathSum(self, matrix: List[List[int]]) -> int:
        n = len(matrix)
        def fall(r, c):
            if r == n - 1:
                return matrix[r][c]
            return matrix[r][c] + min(fall(r + 1, c + d) for d in (-1, 0, 1) if 0 <= c + d < n)
        return min(fall(0, c) for c in range(n))`,
          javascript: r`var minFallingPathSum = function(matrix) {
    const n = matrix.length;
    const fall = (r, c) => {
        if (r === n - 1) return matrix[r][c];
        let below = Infinity;
        for (let d = -1; d <= 1; d++) if (c + d >= 0 && c + d < n) below = Math.min(below, fall(r + 1, c + d));
        return matrix[r][c] + below;
    };
    let best = Infinity;
    for (let c = 0; c < n; c++) best = Math.min(best, fall(0, c));
    return best;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Row-by-row DP with one row of memory',
        idea: 'Keep `prev[c]` = the cheapest falling path ending at column `c` of the previous row. Each cell of the next row adds its value to the cheapest of the up-to-three parents above.',
        steps: [
          '`prev` = the first row.',
          'For each next row: `cur[c] = matrix[r][c] + min(prev[c − 1], prev[c], prev[c + 1])` (ignoring parents outside the grid).',
          'Set `prev = cur`; at the end return `min(prev)`.',
        ],
        time: 'O(n²)', space: 'O(n)',
        why: 'n² cells with 3 parents each; two rows of n values.',
        code: {
          java: r`class Solution {
    public int minFallingPathSum(int[][] matrix) {
        int n = matrix.length;
        int[] prev = matrix[0].clone();
        for (int r = 1; r < n; r++) {
            int[] cur = new int[n];
            for (int c = 0; c < n; c++) {
                int best = prev[c];
                if (c > 0) best = Math.min(best, prev[c - 1]);
                if (c < n - 1) best = Math.min(best, prev[c + 1]);
                cur[c] = matrix[r][c] + best;
            }
            prev = cur;
        }
        int ans = Integer.MAX_VALUE;
        for (int v : prev) ans = Math.min(ans, v);
        return ans;
    }
}`,
          cpp: r`class Solution {
public:
    int minFallingPathSum(vector<vector<int>>& matrix) {
        int n = matrix.size();
        vector<int> prev = matrix[0];
        for (int r = 1; r < n; r++) {
            vector<int> cur(n);
            for (int c = 0; c < n; c++) {
                int best = prev[c];
                if (c > 0) best = min(best, prev[c - 1]);
                if (c < n - 1) best = min(best, prev[c + 1]);
                cur[c] = matrix[r][c] + best;
            }
            prev = cur;
        }
        return *min_element(prev.begin(), prev.end());
    }
};`,
          python: r`class Solution:
    def minFallingPathSum(self, matrix: List[List[int]]) -> int:
        n = len(matrix)
        prev = matrix[0][:]
        for r in range(1, n):
            prev = [matrix[r][c] + min(prev[max(c - 1, 0):c + 2]) for c in range(n)]
        return min(prev)`,
          javascript: r`var minFallingPathSum = function(matrix) {
    const n = matrix.length;
    let prev = [...matrix[0]];
    for (let r = 1; r < n; r++) {
        const cur = new Array(n);
        for (let c = 0; c < n; c++) {
            let best = prev[c];
            if (c > 0) best = Math.min(best, prev[c - 1]);
            if (c < n - 1) best = Math.min(best, prev[c + 1]);
            cur[c] = matrix[r][c] + best;
        }
        prev = cur;
    }
    return Math.min(...prev);
};`,
        },
      },
    ],
  },

  'maximal-square': {
    pattern: 'Square DP: side(r, c) = 1 + min(top, left, top-left)',
    approaches: [
      {
        level: 'Brute force', name: 'Grow a square from every cell',
        idea: 'Treat each `1` as a top-left corner and keep growing the square while the new bottom row and right column are all `1`s.',
        steps: [
          'For each cell with `1`, set `side = 1`.',
          'While the square of `side + 1` fits and its new row and column are all `1`, increase `side`.',
          'Keep the largest `side`; return `side²`.',
        ],
        time: 'O((m·n)·k²)', space: 'O(1)',
        why: 'k = min(m, n): each start can grow up to k times, checking up to 2k cells each time.',
        code: {
          java: r`class Solution {
    public int maximalSquare(char[][] matrix) {
        int m = matrix.length, n = matrix[0].length, best = 0;
        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++) {
                if (matrix[r][c] != '1') continue;
                int side = 1;
                boolean grow = true;
                while (grow && r + side < m && c + side < n) {
                    for (int k = 0; k <= side && grow; k++)
                        if (matrix[r + side][c + k] != '1' || matrix[r + k][c + side] != '1') grow = false;
                    if (grow) side++;
                }
                best = Math.max(best, side);
            }
        return best * best;
    }
}`,
          cpp: r`class Solution {
public:
    int maximalSquare(vector<vector<char>>& matrix) {
        int m = matrix.size(), n = matrix[0].size(), best = 0;
        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++) {
                if (matrix[r][c] != '1') continue;
                int side = 1;
                bool grow = true;
                while (grow && r + side < m && c + side < n) {
                    for (int k = 0; k <= side && grow; k++)
                        if (matrix[r + side][c + k] != '1' || matrix[r + k][c + side] != '1') grow = false;
                    if (grow) side++;
                }
                best = max(best, side);
            }
        return best * best;
    }
};`,
          python: r`class Solution:
    def maximalSquare(self, matrix: List[List[str]]) -> int:
        m, n, best = len(matrix), len(matrix[0]), 0
        for r in range(m):
            for c in range(n):
                if matrix[r][c] != "1":
                    continue
                side = 1
                while r + side < m and c + side < n and all(
                    matrix[r + side][c + k] == "1" and matrix[r + k][c + side] == "1" for k in range(side + 1)
                ):
                    side += 1
                best = max(best, side)
        return best * best`,
          javascript: r`var maximalSquare = function(matrix) {
    const m = matrix.length, n = matrix[0].length;
    let best = 0;
    for (let r = 0; r < m; r++)
        for (let c = 0; c < n; c++) {
            if (matrix[r][c] !== '1') continue;
            let side = 1, grow = true;
            while (grow && r + side < m && c + side < n) {
                for (let k = 0; k <= side && grow; k++)
                    if (matrix[r + side][c + k] !== '1' || matrix[r + k][c + side] !== '1') grow = false;
                if (grow) side++;
            }
            best = Math.max(best, side);
        }
    return best * best;
};`,
        },
      },
      {
        level: 'Better', name: '2-D DP on the bottom-right corner',
        idea: '`dp[r][c]` = side of the largest all-ones square whose bottom-right corner is `(r, c)`. It can extend the squares ending above, to the left and diagonally above-left only as far as the smallest of them.',
        steps: [
          'Use a table with an extra zero row and column.',
          'If `matrix[r][c] == "1"`: `dp[r + 1][c + 1] = 1 + min(dp[r][c + 1], dp[r + 1][c], dp[r][c])`.',
          'Track the largest side; return its square.',
        ],
        time: 'O(m·n)', space: 'O(m·n)',
        why: 'One pass with O(1) work per cell.',
        code: {
          java: r`class Solution {
    public int maximalSquare(char[][] matrix) {
        int m = matrix.length, n = matrix[0].length, best = 0;
        int[][] dp = new int[m + 1][n + 1];
        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++)
                if (matrix[r][c] == '1') {
                    dp[r + 1][c + 1] = 1 + Math.min(dp[r][c], Math.min(dp[r][c + 1], dp[r + 1][c]));
                    best = Math.max(best, dp[r + 1][c + 1]);
                }
        return best * best;
    }
}`,
          cpp: r`class Solution {
public:
    int maximalSquare(vector<vector<char>>& matrix) {
        int m = matrix.size(), n = matrix[0].size(), best = 0;
        vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));
        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++)
                if (matrix[r][c] == '1') {
                    dp[r + 1][c + 1] = 1 + min({dp[r][c], dp[r][c + 1], dp[r + 1][c]});
                    best = max(best, dp[r + 1][c + 1]);
                }
        return best * best;
    }
};`,
          python: r`class Solution:
    def maximalSquare(self, matrix: List[List[str]]) -> int:
        m, n = len(matrix), len(matrix[0])
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        best = 0
        for r in range(m):
            for c in range(n):
                if matrix[r][c] == "1":
                    dp[r + 1][c + 1] = 1 + min(dp[r][c], dp[r][c + 1], dp[r + 1][c])
                    best = max(best, dp[r + 1][c + 1])
        return best * best`,
          javascript: r`var maximalSquare = function(matrix) {
    const m = matrix.length, n = matrix[0].length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    let best = 0;
    for (let r = 0; r < m; r++)
        for (let c = 0; c < n; c++)
            if (matrix[r][c] === '1') {
                dp[r + 1][c + 1] = 1 + Math.min(dp[r][c], dp[r][c + 1], dp[r + 1][c]);
                best = Math.max(best, dp[r + 1][c + 1]);
            }
    return best * best;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Same DP with one row',
        idea: 'Each row of the table only needs the row above, plus the old value of the diagonal neighbour, which can be kept in a variable before it is overwritten.',
        steps: [
          'Keep `row[0..n]` and a variable `diag` (the value from up-left).',
          'For each cell: save `old = row[c + 1]` (the value above); if `1`, `row[c + 1] = 1 + min(old, row[c], diag)`, else 0; then `diag = old`.',
          'Reset `diag = 0` at the start of each row; track the best side.',
        ],
        time: 'O(m·n)', space: 'O(n)',
        why: 'Same pass, one row of n + 1 integers.',
        code: {
          java: r`class Solution {
    public int maximalSquare(char[][] matrix) {
        int n = matrix[0].length, best = 0;
        int[] row = new int[n + 1];
        for (char[] cells : matrix) {
            int diag = 0;
            for (int c = 0; c < n; c++) {
                int old = row[c + 1];
                row[c + 1] = cells[c] == '1' ? 1 + Math.min(old, Math.min(row[c], diag)) : 0;
                best = Math.max(best, row[c + 1]);
                diag = old;
            }
        }
        return best * best;
    }
}`,
          cpp: r`class Solution {
public:
    int maximalSquare(vector<vector<char>>& matrix) {
        int n = matrix[0].size(), best = 0;
        vector<int> row(n + 1, 0);
        for (auto& cells : matrix) {
            int diag = 0;
            for (int c = 0; c < n; c++) {
                int old = row[c + 1];
                row[c + 1] = cells[c] == '1' ? 1 + min({old, row[c], diag}) : 0;
                best = max(best, row[c + 1]);
                diag = old;
            }
        }
        return best * best;
    }
};`,
          python: r`class Solution:
    def maximalSquare(self, matrix: List[List[str]]) -> int:
        n = len(matrix[0])
        row = [0] * (n + 1)
        best = 0
        for cells in matrix:
            diag = 0
            for c in range(n):
                old = row[c + 1]
                row[c + 1] = 1 + min(old, row[c], diag) if cells[c] == "1" else 0
                best = max(best, row[c + 1])
                diag = old
        return best * best`,
          javascript: r`var maximalSquare = function(matrix) {
    const n = matrix[0].length, row = new Array(n + 1).fill(0);
    let best = 0;
    for (const cells of matrix) {
        let diag = 0;
        for (let c = 0; c < n; c++) {
            const old = row[c + 1];
            row[c + 1] = cells[c] === '1' ? 1 + Math.min(old, row[c], diag) : 0;
            best = Math.max(best, row[c + 1]);
            diag = old;
        }
    }
    return best * best;
};`,
        },
      },
    ],
  },

  'count-square-submatrices-with-all-ones': {
    pattern: 'Square DP: the largest square ending at a cell also counts the smaller ones there',
    approaches: [
      {
        level: 'Brute force', name: 'Check every square of every size',
        idea: 'For each top-left corner, grow the square one size at a time while its new edge cells are all ones, counting each size that works.',
        steps: [
          'For each cell with 1, grow `side` from 1 while the square fits and the new bottom row and right column are all 1.',
          'Each successful size is one more square; add them up.',
        ],
        time: 'O(m·n·k²)', space: 'O(1)',
        why: 'k = min(m, n): up to k sizes per corner with up to 2k edge checks each.',
        code: {
          java: r`class Solution {
    public int countSquares(int[][] matrix) {
        int m = matrix.length, n = matrix[0].length, total = 0;
        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++) {
                if (matrix[r][c] != 1) continue;
                int side = 1;
                total++;
                boolean grow = true;
                while (r + side < m && c + side < n) {
                    for (int k = 0; k <= side && grow; k++)
                        if (matrix[r + side][c + k] != 1 || matrix[r + k][c + side] != 1) grow = false;
                    if (!grow) break;
                    side++;
                    total++;
                }
            }
        return total;
    }
}`,
          cpp: r`class Solution {
public:
    int countSquares(vector<vector<int>>& matrix) {
        int m = matrix.size(), n = matrix[0].size(), total = 0;
        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++) {
                if (matrix[r][c] != 1) continue;
                int side = 1;
                total++;
                bool grow = true;
                while (r + side < m && c + side < n) {
                    for (int k = 0; k <= side && grow; k++)
                        if (matrix[r + side][c + k] != 1 || matrix[r + k][c + side] != 1) grow = false;
                    if (!grow) break;
                    side++;
                    total++;
                }
            }
        return total;
    }
};`,
          python: r`class Solution:
    def countSquares(self, matrix: List[List[int]]) -> int:
        m, n, total = len(matrix), len(matrix[0]), 0
        for r in range(m):
            for c in range(n):
                if matrix[r][c] != 1:
                    continue
                side = 1
                total += 1
                while r + side < m and c + side < n and all(
                    matrix[r + side][c + k] == 1 and matrix[r + k][c + side] == 1 for k in range(side + 1)
                ):
                    side += 1
                    total += 1
        return total`,
          javascript: r`var countSquares = function(matrix) {
    const m = matrix.length, n = matrix[0].length;
    let total = 0;
    for (let r = 0; r < m; r++)
        for (let c = 0; c < n; c++) {
            if (matrix[r][c] !== 1) continue;
            let side = 1, grow = true;
            total++;
            while (r + side < m && c + side < n) {
                for (let k = 0; k <= side && grow; k++)
                    if (matrix[r + side][c + k] !== 1 || matrix[r + k][c + side] !== 1) grow = false;
                if (!grow) break;
                side++;
                total++;
            }
        }
    return total;
};`,
        },
      },
      {
        level: 'Optimal', name: 'DP on the bottom-right corner, summing the sides',
        idea: 'With `dp[r][c]` = side of the largest all-ones square ending at `(r, c)` (as in Maximal Square), that cell is the bottom-right corner of exactly `dp[r][c]` squares: one of each size up to it. Sum the table.',
        steps: [
          'For each cell with 1: `dp[r][c] = 1` on the first row or column, else `1 + min(dp[r − 1][c], dp[r][c − 1], dp[r − 1][c − 1])`.',
          'Add `dp[r][c]` to the total.',
          'Return the total. (The matrix itself can store `dp`.)',
        ],
        time: 'O(m·n)', space: 'O(1)',
        why: 'One pass with O(1) work per cell; writing the values into the input avoids an extra table.',
        code: {
          java: r`class Solution {
    public int countSquares(int[][] matrix) {
        int total = 0;
        for (int r = 0; r < matrix.length; r++)
            for (int c = 0; c < matrix[0].length; c++) {
                if (matrix[r][c] == 1 && r > 0 && c > 0)
                    matrix[r][c] = 1 + Math.min(matrix[r - 1][c - 1], Math.min(matrix[r - 1][c], matrix[r][c - 1]));
                total += matrix[r][c];
            }
        return total;
    }
}`,
          cpp: r`class Solution {
public:
    int countSquares(vector<vector<int>>& matrix) {
        int total = 0;
        for (size_t r = 0; r < matrix.size(); r++)
            for (size_t c = 0; c < matrix[0].size(); c++) {
                if (matrix[r][c] == 1 && r > 0 && c > 0)
                    matrix[r][c] = 1 + min({matrix[r - 1][c - 1], matrix[r - 1][c], matrix[r][c - 1]});
                total += matrix[r][c];
            }
        return total;
    }
};`,
          python: r`class Solution:
    def countSquares(self, matrix: List[List[int]]) -> int:
        total = 0
        for r in range(len(matrix)):
            for c in range(len(matrix[0])):
                if matrix[r][c] == 1 and r > 0 and c > 0:
                    matrix[r][c] = 1 + min(matrix[r - 1][c - 1], matrix[r - 1][c], matrix[r][c - 1])
                total += matrix[r][c]
        return total`,
          javascript: r`var countSquares = function(matrix) {
    let total = 0;
    for (let r = 0; r < matrix.length; r++)
        for (let c = 0; c < matrix[0].length; c++) {
            if (matrix[r][c] === 1 && r > 0 && c > 0)
                matrix[r][c] = 1 + Math.min(matrix[r - 1][c - 1], matrix[r - 1][c], matrix[r][c - 1]);
            total += matrix[r][c];
        }
    return total;
};`,
        },
      },
    ],
  },

  'dungeon-game': {
    pattern: 'Reverse grid DP: health needed on entering a cell, computed from the princess back to the start',
    approaches: [
      {
        level: 'Brute force', name: 'Recursion on the health needed from each cell',
        idea: 'Working forwards fails (a path that looks good early may need more health later). Instead ask: entering `(r, c)`, how much health do I need to survive to the end? It is what the better next cell needs, minus this room\'s effect, but at least 1.',
        steps: [
          '`need(r, c)`: if out of the grid, return ∞.',
          'At the princess\'s room: `max(1, 1 − dungeon[r][c])`.',
          'Otherwise `max(1, min(need(r + 1, c), need(r, c + 1)) − dungeon[r][c])`.',
          'Answer `need(0, 0)`.',
        ],
        time: 'O(2^(m+n))', space: 'O(m + n)',
        why: 'Two calls per cell without remembering results.',
        code: {
          java: r`class Solution {
    public int calculateMinimumHP(int[][] dungeon) {
        return need(dungeon, 0, 0);
    }

    private int need(int[][] d, int r, int c) {
        int m = d.length, n = d[0].length;
        if (r >= m || c >= n) return Integer.MAX_VALUE;
        if (r == m - 1 && c == n - 1) return Math.max(1, 1 - d[r][c]);
        return Math.max(1, Math.min(need(d, r + 1, c), need(d, r, c + 1)) - d[r][c]);
    }
}`,
          cpp: r`class Solution {
    int need(vector<vector<int>>& d, int r, int c) {
        int m = d.size(), n = d[0].size();
        if (r >= m || c >= n) return INT_MAX;
        if (r == m - 1 && c == n - 1) return max(1, 1 - d[r][c]);
        return max(1, min(need(d, r + 1, c), need(d, r, c + 1)) - d[r][c]);
    }
public:
    int calculateMinimumHP(vector<vector<int>>& dungeon) {
        return need(dungeon, 0, 0);
    }
};`,
          python: r`class Solution:
    def calculateMinimumHP(self, dungeon: List[List[int]]) -> int:
        m, n = len(dungeon), len(dungeon[0])
        def need(r, c):
            if r >= m or c >= n:
                return inf
            if r == m - 1 and c == n - 1:
                return max(1, 1 - dungeon[r][c])
            return max(1, min(need(r + 1, c), need(r, c + 1)) - dungeon[r][c])
        return need(0, 0)`,
          javascript: r`var calculateMinimumHP = function(dungeon) {
    const m = dungeon.length, n = dungeon[0].length;
    const need = (r, c) => {
        if (r >= m || c >= n) return Infinity;
        if (r === m - 1 && c === n - 1) return Math.max(1, 1 - dungeon[r][c]);
        return Math.max(1, Math.min(need(r + 1, c), need(r, c + 1)) - dungeon[r][c]);
    };
    return need(0, 0);
};`,
        },
      },
      {
        level: 'Better', name: '2-D table from the bottom-right',
        idea: 'Fill `dp[r][c]` (health needed on entering) from the princess\'s room backwards, using a border of ∞ with a 1 placed just right of and just below the end so the formula works there too.',
        steps: [
          'Make `dp` of size (m + 1) × (n + 1) filled with ∞; set `dp[m][n − 1] = dp[m − 1][n] = 1`.',
          'For `r` from m − 1 down to 0, `c` from n − 1 down to 0: `dp[r][c] = max(1, min(dp[r + 1][c], dp[r][c + 1]) − dungeon[r][c])`.',
          'Return `dp[0][0]`.',
        ],
        time: 'O(m·n)', space: 'O(m·n)',
        why: 'Each cell once.',
        code: {
          java: r`class Solution {
    public int calculateMinimumHP(int[][] dungeon) {
        int m = dungeon.length, n = dungeon[0].length;
        int[][] dp = new int[m + 1][n + 1];
        for (int[] row : dp) Arrays.fill(row, Integer.MAX_VALUE);
        dp[m][n - 1] = dp[m - 1][n] = 1;
        for (int r = m - 1; r >= 0; r--)
            for (int c = n - 1; c >= 0; c--)
                dp[r][c] = Math.max(1, Math.min(dp[r + 1][c], dp[r][c + 1]) - dungeon[r][c]);
        return dp[0][0];
    }
}`,
          cpp: r`class Solution {
public:
    int calculateMinimumHP(vector<vector<int>>& dungeon) {
        int m = dungeon.size(), n = dungeon[0].size();
        vector<vector<int>> dp(m + 1, vector<int>(n + 1, INT_MAX));
        dp[m][n - 1] = dp[m - 1][n] = 1;
        for (int r = m - 1; r >= 0; r--)
            for (int c = n - 1; c >= 0; c--)
                dp[r][c] = max(1, min(dp[r + 1][c], dp[r][c + 1]) - dungeon[r][c]);
        return dp[0][0];
    }
};`,
          python: r`class Solution:
    def calculateMinimumHP(self, dungeon: List[List[int]]) -> int:
        m, n = len(dungeon), len(dungeon[0])
        dp = [[inf] * (n + 1) for _ in range(m + 1)]
        dp[m][n - 1] = dp[m - 1][n] = 1
        for r in range(m - 1, -1, -1):
            for c in range(n - 1, -1, -1):
                dp[r][c] = max(1, min(dp[r + 1][c], dp[r][c + 1]) - dungeon[r][c])
        return dp[0][0]`,
          javascript: r`var calculateMinimumHP = function(dungeon) {
    const m = dungeon.length, n = dungeon[0].length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(Infinity));
    dp[m][n - 1] = dp[m - 1][n] = 1;
    for (let r = m - 1; r >= 0; r--)
        for (let c = n - 1; c >= 0; c--)
            dp[r][c] = Math.max(1, Math.min(dp[r + 1][c], dp[r][c + 1]) - dungeon[r][c]);
    return dp[0][0];
};`,
        },
      },
      {
        level: 'Optimal', name: 'One row, filled backwards',
        idea: 'Each row only needs the row below, so one array of n + 1 values is enough: `row[c]` holds the value from below until it is overwritten.',
        steps: [
          '`row` = n + 1 values of ∞, with `row[n − 1] = 1` before the last grid row.',
          'For `r` from m − 1 down to 0, for `c` from n − 1 down to 0: `row[c] = max(1, min(row[c], row[c + 1]) − dungeon[r][c])`. `row[n]` stays ∞: there is no way out past the right edge.',
          'Return `row[0]`.',
        ],
        time: 'O(m·n)', space: 'O(n)',
        why: 'Same pass with a single row of memory.',
        code: {
          java: r`class Solution {
    public int calculateMinimumHP(int[][] dungeon) {
        int m = dungeon.length, n = dungeon[0].length;
        int[] row = new int[n + 1];
        Arrays.fill(row, Integer.MAX_VALUE);
        row[n - 1] = 1;
        for (int r = m - 1; r >= 0; r--)
            for (int c = n - 1; c >= 0; c--)
                row[c] = Math.max(1, Math.min(row[c], row[c + 1]) - dungeon[r][c]);
        return row[0];
    }
}`,
          cpp: r`class Solution {
public:
    int calculateMinimumHP(vector<vector<int>>& dungeon) {
        int m = dungeon.size(), n = dungeon[0].size();
        vector<int> row(n + 1, INT_MAX);
        row[n - 1] = 1;
        for (int r = m - 1; r >= 0; r--)
            for (int c = n - 1; c >= 0; c--)
                row[c] = max(1, min(row[c], row[c + 1]) - dungeon[r][c]);
        return row[0];
    }
};`,
          python: r`class Solution:
    def calculateMinimumHP(self, dungeon: List[List[int]]) -> int:
        n = len(dungeon[0])
        row = [inf] * (n + 1)
        row[n - 1] = 1
        for cells in reversed(dungeon):
            for c in range(n - 1, -1, -1):
                row[c] = max(1, min(row[c], row[c + 1]) - cells[c])
        return row[0]`,
          javascript: r`var calculateMinimumHP = function(dungeon) {
    const m = dungeon.length, n = dungeon[0].length, row = new Array(n + 1).fill(Infinity);
    row[n - 1] = 1;
    for (let r = m - 1; r >= 0; r--)
        for (let c = n - 1; c >= 0; c--)
            row[c] = Math.max(1, Math.min(row[c], row[c + 1]) - dungeon[r][c]);
    return row[0];
};`,
        },
      },
    ],
  },

  'cherry-pickup': {
    pattern: 'Two walkers moving together: DP over (step, row of walker 1, row of walker 2)',
    approaches: [
      {
        level: 'Brute force', name: 'Every forward path, then the best return path',
        idea: 'Enumerate every right/down path from the top-left to the bottom-right. For each, pick up its cherries, then find the best return path on the remaining grid with a simple grid DP. (Taking the single best forward path first and then the best return path is NOT enough — the two trips must be planned together.)',
        steps: [
          'DFS over all forward paths avoiding thorns.',
          'At the bottom-right, compute the best second trip with `best[r][c] = grid[r][c] + max(best from above, best from the left)` on the grid with the first path\'s cherries removed.',
          'Answer = max over forward paths of (cherries on it + best second trip); 0 if no path exists.',
        ],
        time: 'O(C(2n − 2, n − 1)·n²)', space: 'O(n²)',
        why: 'The number of forward paths grows like 4ⁿ/√n, and each needs an O(n²) DP for the return trip. Only workable for tiny grids, but it shows why both trips must be decided together.',
        code: {
          java: r`class Solution {
    private int n, best = 0;
    private int[][] g;

    public int cherryPickup(int[][] grid) {
        g = grid;
        n = grid.length;
        walk(0, 0, 0);
        return best;
    }

    private void walk(int r, int c, int got) {
        if (r >= n || c >= n || g[r][c] == -1) return;
        int cherry = g[r][c];
        got += cherry;
        g[r][c] = 0;
        if (r == n - 1 && c == n - 1) {
            int back = secondTrip();
            if (back >= 0) best = Math.max(best, got + back);
        } else {
            walk(r + 1, c, got);
            walk(r, c + 1, got);
        }
        g[r][c] = cherry;
    }

    // the most cherries on one right/down path over the current grid (-1 if there is none)
    private int secondTrip() {
        int[][] dp = new int[n][n];
        for (int r = 0; r < n; r++)
            for (int c = 0; c < n; c++) {
                if (g[r][c] == -1) { dp[r][c] = -1; continue; }
                int from = (r == 0 && c == 0) ? 0 : Math.max(r > 0 ? dp[r - 1][c] : -1, c > 0 ? dp[r][c - 1] : -1);
                dp[r][c] = from < 0 ? -1 : from + g[r][c];
            }
        return dp[n - 1][n - 1];
    }
}`,
          cpp: r`class Solution {
    int n, best = 0;
    vector<vector<int>>* g;
    int secondTrip() {
        auto& G = *g;
        vector<vector<int>> dp(n, vector<int>(n, -1));
        for (int r = 0; r < n; r++)
            for (int c = 0; c < n; c++) {
                if (G[r][c] == -1) continue;
                int from = (r == 0 && c == 0) ? 0 : max(r > 0 ? dp[r - 1][c] : -1, c > 0 ? dp[r][c - 1] : -1);
                dp[r][c] = from < 0 ? -1 : from + G[r][c];
            }
        return dp[n - 1][n - 1];
    }
    void walk(int r, int c, int got) {
        auto& G = *g;
        if (r >= n || c >= n || G[r][c] == -1) return;
        int cherry = G[r][c];
        got += cherry;
        G[r][c] = 0;
        if (r == n - 1 && c == n - 1) {
            int back = secondTrip();
            if (back >= 0) best = max(best, got + back);
        } else {
            walk(r + 1, c, got);
            walk(r, c + 1, got);
        }
        G[r][c] = cherry;
    }
public:
    int cherryPickup(vector<vector<int>>& grid) {
        g = &grid;
        n = grid.size();
        walk(0, 0, 0);
        return best;
    }
};`,
          python: r`class Solution:
    def cherryPickup(self, grid: List[List[int]]) -> int:
        n = len(grid)
        best = 0
        def second_trip():
            dp = [[-1] * n for _ in range(n)]
            for r in range(n):
                for c in range(n):
                    if grid[r][c] == -1:
                        continue
                    if r == 0 and c == 0:
                        frm = 0
                    else:
                        frm = max(dp[r - 1][c] if r else -1, dp[r][c - 1] if c else -1)
                    dp[r][c] = -1 if frm < 0 else frm + grid[r][c]
            return dp[n - 1][n - 1]
        def walk(r, c, got):
            nonlocal best
            if r >= n or c >= n or grid[r][c] == -1:
                return
            cherry = grid[r][c]
            got += cherry
            grid[r][c] = 0
            if r == n - 1 and c == n - 1:
                back = second_trip()
                if back >= 0:
                    best = max(best, got + back)
            else:
                walk(r + 1, c, got)
                walk(r, c + 1, got)
            grid[r][c] = cherry
        walk(0, 0, 0)
        return best`,
          javascript: r`var cherryPickup = function(grid) {
    const n = grid.length;
    let best = 0;
    const secondTrip = () => {
        const dp = Array.from({ length: n }, () => new Array(n).fill(-1));
        for (let r = 0; r < n; r++)
            for (let c = 0; c < n; c++) {
                if (grid[r][c] === -1) continue;
                const from = r === 0 && c === 0 ? 0 : Math.max(r > 0 ? dp[r - 1][c] : -1, c > 0 ? dp[r][c - 1] : -1);
                dp[r][c] = from < 0 ? -1 : from + grid[r][c];
            }
        return dp[n - 1][n - 1];
    };
    const walk = (r, c, got) => {
        if (r >= n || c >= n || grid[r][c] === -1) return;
        const cherry = grid[r][c];
        got += cherry;
        grid[r][c] = 0;
        if (r === n - 1 && c === n - 1) {
            const back = secondTrip();
            if (back >= 0) best = Math.max(best, got + back);
        } else {
            walk(r + 1, c, got);
            walk(r, c + 1, got);
        }
        grid[r][c] = cherry;
    };
    walk(0, 0, 0);
    return best;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Two walkers at once: DP over (step, r1, r2)',
        idea: 'The return trip reversed is just another top-left → bottom-right path, so send two walkers forward together. After `t` steps each is on the anti-diagonal `r + c = t`, so the state is `(t, r1, r2)`. When both stand on the same cell, its cherry counts once.',
        steps: [
          '`dp[r1][r2]` = most cherries with walker 1 at `(r1, t − r1)` and walker 2 at `(r2, t − r2)`; −∞ if impossible. Start: `dp[0][0] = grid[0][0]` at `t = 0`.',
          'For `t` from 1 to 2n − 2: for each pair of rows, skip thorns and out-of-grid cells; take the best of the four previous pairs (each walker came from up or left).',
          'Add the cherries at both cells (once if they are the same cell).',
          'Answer `max(0, dp[n − 1][n − 1])` after the last step.',
        ],
        time: 'O(n³)', space: 'O(n²)',
        why: '2n − 1 steps × n² row pairs with 4 transitions each; only the previous step\'s n × n table is kept.',
        code: {
          java: r`class Solution {
    public int cherryPickup(int[][] grid) {
        int n = grid.length, NEG = Integer.MIN_VALUE / 2;
        int[][] dp = new int[n][n];
        for (int[] row : dp) Arrays.fill(row, NEG);
        dp[0][0] = grid[0][0];
        for (int t = 1; t <= 2 * n - 2; t++) {
            int[][] next = new int[n][n];
            for (int[] row : next) Arrays.fill(row, NEG);
            for (int r1 = Math.max(0, t - n + 1); r1 <= Math.min(n - 1, t); r1++)
                for (int r2 = Math.max(0, t - n + 1); r2 <= Math.min(n - 1, t); r2++) {
                    int c1 = t - r1, c2 = t - r2;
                    if (grid[r1][c1] == -1 || grid[r2][c2] == -1) continue;
                    int prev = NEG;
                    for (int d1 = 0; d1 <= 1; d1++)
                        for (int d2 = 0; d2 <= 1; d2++) {
                            int p1 = r1 - d1, p2 = r2 - d2;
                            if (p1 >= 0 && p2 >= 0) prev = Math.max(prev, dp[p1][p2]);
                        }
                    if (prev == NEG) continue;
                    next[r1][r2] = prev + grid[r1][c1] + (r1 == r2 ? 0 : grid[r2][c2]);
                }
            dp = next;
        }
        return Math.max(0, dp[n - 1][n - 1]);
    }
}`,
          cpp: r`class Solution {
public:
    int cherryPickup(vector<vector<int>>& grid) {
        int n = grid.size(), NEG = INT_MIN / 2;
        vector<vector<int>> dp(n, vector<int>(n, NEG));
        dp[0][0] = grid[0][0];
        for (int t = 1; t <= 2 * n - 2; t++) {
            vector<vector<int>> next(n, vector<int>(n, NEG));
            for (int r1 = max(0, t - n + 1); r1 <= min(n - 1, t); r1++)
                for (int r2 = max(0, t - n + 1); r2 <= min(n - 1, t); r2++) {
                    int c1 = t - r1, c2 = t - r2;
                    if (grid[r1][c1] == -1 || grid[r2][c2] == -1) continue;
                    int prev = NEG;
                    for (int d1 = 0; d1 <= 1; d1++)
                        for (int d2 = 0; d2 <= 1; d2++) {
                            int p1 = r1 - d1, p2 = r2 - d2;
                            if (p1 >= 0 && p2 >= 0) prev = max(prev, dp[p1][p2]);
                        }
                    if (prev == NEG) continue;
                    next[r1][r2] = prev + grid[r1][c1] + (r1 == r2 ? 0 : grid[r2][c2]);
                }
            dp = next;
        }
        return max(0, dp[n - 1][n - 1]);
    }
};`,
          python: r`class Solution:
    def cherryPickup(self, grid: List[List[int]]) -> int:
        n = len(grid)
        NEG = -inf
        dp = [[NEG] * n for _ in range(n)]
        dp[0][0] = grid[0][0]
        for t in range(1, 2 * n - 1):
            nxt = [[NEG] * n for _ in range(n)]
            lo, hi = max(0, t - n + 1), min(n - 1, t)
            for r1 in range(lo, hi + 1):
                for r2 in range(lo, hi + 1):
                    c1, c2 = t - r1, t - r2
                    if grid[r1][c1] == -1 or grid[r2][c2] == -1:
                        continue
                    prev = max(dp[p1][p2] for p1 in (r1, r1 - 1) for p2 in (r2, r2 - 1) if p1 >= 0 and p2 >= 0)
                    if prev == NEG:
                        continue
                    nxt[r1][r2] = prev + grid[r1][c1] + (0 if r1 == r2 else grid[r2][c2])
            dp = nxt
        return max(0, dp[n - 1][n - 1])`,
          javascript: r`var cherryPickup = function(grid) {
    const n = grid.length, NEG = -Infinity;
    let dp = Array.from({ length: n }, () => new Array(n).fill(NEG));
    dp[0][0] = grid[0][0];
    for (let t = 1; t <= 2 * n - 2; t++) {
        const next = Array.from({ length: n }, () => new Array(n).fill(NEG));
        const lo = Math.max(0, t - n + 1), hi = Math.min(n - 1, t);
        for (let r1 = lo; r1 <= hi; r1++)
            for (let r2 = lo; r2 <= hi; r2++) {
                const c1 = t - r1, c2 = t - r2;
                if (grid[r1][c1] === -1 || grid[r2][c2] === -1) continue;
                let prev = NEG;
                for (const p1 of [r1, r1 - 1])
                    for (const p2 of [r2, r2 - 1])
                        if (p1 >= 0 && p2 >= 0) prev = Math.max(prev, dp[p1][p2]);
                if (prev === NEG) continue;
                next[r1][r2] = prev + grid[r1][c1] + (r1 === r2 ? 0 : grid[r2][c2]);
            }
        dp = next;
    }
    return Math.max(0, dp[n - 1][n - 1]);
};`,
        },
      },
    ],
  },
};
