const r = String.raw;

export default {
  'transpose-matrix': {
    pattern: 'Index mapping: result[j][i] = matrix[i][j]',
    approaches: [
      {
        level: 'Optimal', name: 'Build the n × m result',
        idea: 'Every element moves from `(i, j)` to `(j, i)`. Because the shape changes for non-square matrices, write into a new `n × m` matrix.',
        steps: [
          'Create `result` with `n` rows and `m` columns.',
          'For every cell, set `result[j][i] = matrix[i][j]`.',
          'Return `result`.',
        ],
        time: 'O(m·n)', space: 'O(m·n)',
        why: 'Every element must be read and written once, so O(m·n) is the lower bound; the new matrix is the required output, not extra working space. (Only a square matrix could be transposed in place, by swapping across the diagonal.)',
        code: {
          java: r`class Solution {
    public int[][] transpose(int[][] matrix) {
        int m = matrix.length, n = matrix[0].length;
        int[][] result = new int[n][m];
        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++) result[j][i] = matrix[i][j];
        return result;
    }
}`,
          cpp: r`class Solution {
public:
    vector<vector<int>> transpose(vector<vector<int>>& matrix) {
        int m = matrix.size(), n = matrix[0].size();
        vector<vector<int>> result(n, vector<int>(m));
        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++) result[j][i] = matrix[i][j];
        return result;
    }
};`,
          python: r`class Solution:
    def transpose(self, matrix: List[List[int]]) -> List[List[int]]:
        return [list(col) for col in zip(*matrix)]`,
          javascript: r`var transpose = function(matrix) {
    const m = matrix.length, n = matrix[0].length;
    const result = Array.from({ length: n }, () => new Array(m));
    for (let i = 0; i < m; i++)
        for (let j = 0; j < n; j++) result[j][i] = matrix[i][j];
    return result;
};`,
        },
      },
    ],
  },

  'spiral-matrix': {
    pattern: 'Layer-by-layer traversal with four shrinking boundaries',
    approaches: [
      {
        level: 'Brute force', name: 'Walk with a direction and a visited grid',
        idea: 'Simulate the walk: keep moving in the current direction (right, down, left, up) and turn clockwise whenever the next cell is outside the matrix or already visited.',
        steps: [
          'Keep a `visited` grid and direction vectors `dr = [0,1,0,−1]`, `dc = [1,0,−1,0]`.',
          'Repeat m·n times: record the cell, mark it visited, and look at the next cell in the current direction.',
          'If that cell is out of bounds or visited, turn clockwise; then step.',
        ],
        time: 'O(m·n)', space: 'O(m·n)',
        why: 'Each cell is visited once, but the visited grid costs as much memory as the matrix.',
        code: {
          java: r`class Solution {
    public List<Integer> spiralOrder(int[][] matrix) {
        int m = matrix.length, n = matrix[0].length;
        int[] dr = { 0, 1, 0, -1 }, dc = { 1, 0, -1, 0 };
        boolean[][] visited = new boolean[m][n];
        List<Integer> result = new ArrayList<>();
        for (int k = 0, r = 0, c = 0, d = 0; k < m * n; k++) {
            result.add(matrix[r][c]);
            visited[r][c] = true;
            int nr = r + dr[d], nc = c + dc[d];
            if (nr < 0 || nr >= m || nc < 0 || nc >= n || visited[nr][nc]) {
                d = (d + 1) % 4;
                nr = r + dr[d];
                nc = c + dc[d];
            }
            r = nr;
            c = nc;
        }
        return result;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> spiralOrder(vector<vector<int>>& matrix) {
        int m = matrix.size(), n = matrix[0].size();
        int dr[] = {0, 1, 0, -1}, dc[] = {1, 0, -1, 0};
        vector<vector<bool>> visited(m, vector<bool>(n, false));
        vector<int> result;
        for (int k = 0, r = 0, c = 0, d = 0; k < m * n; k++) {
            result.push_back(matrix[r][c]);
            visited[r][c] = true;
            int nr = r + dr[d], nc = c + dc[d];
            if (nr < 0 || nr >= m || nc < 0 || nc >= n || visited[nr][nc]) {
                d = (d + 1) % 4;
                nr = r + dr[d];
                nc = c + dc[d];
            }
            r = nr;
            c = nc;
        }
        return result;
    }
};`,
          python: r`class Solution:
    def spiralOrder(self, matrix: List[List[int]]) -> List[int]:
        m, n = len(matrix), len(matrix[0])
        dirs = [(0, 1), (1, 0), (0, -1), (-1, 0)]
        visited = [[False] * n for _ in range(m)]
        result, r, c, d = [], 0, 0, 0
        for _ in range(m * n):
            result.append(matrix[r][c])
            visited[r][c] = True
            nr, nc = r + dirs[d][0], c + dirs[d][1]
            if not (0 <= nr < m and 0 <= nc < n) or visited[nr][nc]:
                d = (d + 1) % 4
                nr, nc = r + dirs[d][0], c + dirs[d][1]
            r, c = nr, nc
        return result`,
          javascript: r`var spiralOrder = function(matrix) {
    const m = matrix.length, n = matrix[0].length;
    const dr = [0, 1, 0, -1], dc = [1, 0, -1, 0];
    const visited = Array.from({ length: m }, () => new Array(n).fill(false));
    const result = [];
    for (let k = 0, r = 0, c = 0, d = 0; k < m * n; k++) {
        result.push(matrix[r][c]);
        visited[r][c] = true;
        let nr = r + dr[d], nc = c + dc[d];
        if (nr < 0 || nr >= m || nc < 0 || nc >= n || visited[nr][nc]) {
            d = (d + 1) % 4;
            nr = r + dr[d];
            nc = c + dc[d];
        }
        r = nr;
        c = nc;
    }
    return result;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Four boundaries',
        idea: 'Keep `top`, `bottom`, `left`, `right`. Read the top row, the right column, the bottom row (reversed) and the left column (upwards), shrinking the matching boundary after each side.',
        steps: [
          'While `top ≤ bottom` and `left ≤ right`:',
          'Read `top` row from `left` to `right`, then `top++`; read `right` column from `top` to `bottom`, then `right--`.',
          'If `top ≤ bottom`: read `bottom` row from `right` to `left`, then `bottom--`.',
          'If `left ≤ right`: read `left` column from `bottom` to `top`, then `left++`.',
        ],
        time: 'O(m·n)', space: 'O(1)',
        why: 'Each cell is read once and only four integers are kept (the output list is not extra space). The two `if` checks stop a single remaining row or column from being read twice.',
        code: {
          java: r`class Solution {
    public List<Integer> spiralOrder(int[][] matrix) {
        List<Integer> result = new ArrayList<>();
        int top = 0, bottom = matrix.length - 1, left = 0, right = matrix[0].length - 1;
        while (top <= bottom && left <= right) {
            for (int j = left; j <= right; j++) result.add(matrix[top][j]);
            top++;
            for (int i = top; i <= bottom; i++) result.add(matrix[i][right]);
            right--;
            if (top <= bottom) {
                for (int j = right; j >= left; j--) result.add(matrix[bottom][j]);
                bottom--;
            }
            if (left <= right) {
                for (int i = bottom; i >= top; i--) result.add(matrix[i][left]);
                left++;
            }
        }
        return result;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> spiralOrder(vector<vector<int>>& matrix) {
        vector<int> result;
        int top = 0, bottom = matrix.size() - 1, left = 0, right = matrix[0].size() - 1;
        while (top <= bottom && left <= right) {
            for (int j = left; j <= right; j++) result.push_back(matrix[top][j]);
            top++;
            for (int i = top; i <= bottom; i++) result.push_back(matrix[i][right]);
            right--;
            if (top <= bottom) {
                for (int j = right; j >= left; j--) result.push_back(matrix[bottom][j]);
                bottom--;
            }
            if (left <= right) {
                for (int i = bottom; i >= top; i--) result.push_back(matrix[i][left]);
                left++;
            }
        }
        return result;
    }
};`,
          python: r`class Solution:
    def spiralOrder(self, matrix: List[List[int]]) -> List[int]:
        result = []
        top, bottom, left, right = 0, len(matrix) - 1, 0, len(matrix[0]) - 1
        while top <= bottom and left <= right:
            for j in range(left, right + 1):
                result.append(matrix[top][j])
            top += 1
            for i in range(top, bottom + 1):
                result.append(matrix[i][right])
            right -= 1
            if top <= bottom:
                for j in range(right, left - 1, -1):
                    result.append(matrix[bottom][j])
                bottom -= 1
            if left <= right:
                for i in range(bottom, top - 1, -1):
                    result.append(matrix[i][left])
                left += 1
        return result`,
          javascript: r`var spiralOrder = function(matrix) {
    const result = [];
    let top = 0, bottom = matrix.length - 1, left = 0, right = matrix[0].length - 1;
    while (top <= bottom && left <= right) {
        for (let j = left; j <= right; j++) result.push(matrix[top][j]);
        top++;
        for (let i = top; i <= bottom; i++) result.push(matrix[i][right]);
        right--;
        if (top <= bottom) {
            for (let j = right; j >= left; j--) result.push(matrix[bottom][j]);
            bottom--;
        }
        if (left <= right) {
            for (let i = bottom; i >= top; i--) result.push(matrix[i][left]);
            left++;
        }
    }
    return result;
};`,
        },
      },
    ],
  },

  'spiral-matrix-ii': {
    pattern: 'Spiral fill with four shrinking boundaries',
    approaches: [
      {
        level: 'Brute force', name: 'Walk and turn when blocked',
        idea: 'Walk from the top-left placing 1, 2, 3, …; turn clockwise whenever the next cell is outside the grid or already filled (non-zero).',
        steps: [
          'Start with an all-zero n × n grid at `(0, 0)` heading right.',
          'For `v` from 1 to n²: write `v`, then look at the next cell; if it is out of bounds or non-zero, turn clockwise; step.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'Each cell is filled once. The grid itself acts as the visited marker, so no extra memory beyond the output is needed.',
        code: {
          java: r`class Solution {
    public int[][] generateMatrix(int n) {
        int[][] a = new int[n][n];
        int[] dr = { 0, 1, 0, -1 }, dc = { 1, 0, -1, 0 };
        for (int v = 1, r = 0, c = 0, d = 0; v <= n * n; v++) {
            a[r][c] = v;
            int nr = r + dr[d], nc = c + dc[d];
            if (nr < 0 || nr >= n || nc < 0 || nc >= n || a[nr][nc] != 0) {
                d = (d + 1) % 4;
                nr = r + dr[d];
                nc = c + dc[d];
            }
            r = nr;
            c = nc;
        }
        return a;
    }
}`,
          cpp: r`class Solution {
public:
    vector<vector<int>> generateMatrix(int n) {
        vector<vector<int>> a(n, vector<int>(n, 0));
        int dr[] = {0, 1, 0, -1}, dc[] = {1, 0, -1, 0};
        for (int v = 1, r = 0, c = 0, d = 0; v <= n * n; v++) {
            a[r][c] = v;
            int nr = r + dr[d], nc = c + dc[d];
            if (nr < 0 || nr >= n || nc < 0 || nc >= n || a[nr][nc] != 0) {
                d = (d + 1) % 4;
                nr = r + dr[d];
                nc = c + dc[d];
            }
            r = nr;
            c = nc;
        }
        return a;
    }
};`,
          python: r`class Solution:
    def generateMatrix(self, n: int) -> List[List[int]]:
        a = [[0] * n for _ in range(n)]
        dirs = [(0, 1), (1, 0), (0, -1), (-1, 0)]
        r = c = d = 0
        for v in range(1, n * n + 1):
            a[r][c] = v
            nr, nc = r + dirs[d][0], c + dirs[d][1]
            if not (0 <= nr < n and 0 <= nc < n) or a[nr][nc]:
                d = (d + 1) % 4
                nr, nc = r + dirs[d][0], c + dirs[d][1]
            r, c = nr, nc
        return a`,
          javascript: r`var generateMatrix = function(n) {
    const a = Array.from({ length: n }, () => new Array(n).fill(0));
    const dr = [0, 1, 0, -1], dc = [1, 0, -1, 0];
    for (let v = 1, r = 0, c = 0, d = 0; v <= n * n; v++) {
        a[r][c] = v;
        let nr = r + dr[d], nc = c + dc[d];
        if (nr < 0 || nr >= n || nc < 0 || nc >= n || a[nr][nc] !== 0) {
            d = (d + 1) % 4;
            nr = r + dr[d];
            nc = c + dc[d];
        }
        r = nr;
        c = nc;
    }
    return a;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Fill layer by layer with four boundaries',
        idea: 'Fill the top row, right column, bottom row and left column of the current layer, shrinking each boundary as it is completed.',
        steps: [
          '`top = left = 0`, `bottom = right = n − 1`, `v = 1`.',
          'While `v ≤ n²`: fill top row left→right (`top++`), right column top→bottom (`right--`), bottom row right→left (`bottom--`), left column bottom→top (`left++`).',
          'Return the grid.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'Each cell is written once with no per-step bounds checks. For a square grid the loop conditions alone stop at the centre.',
        code: {
          java: r`class Solution {
    public int[][] generateMatrix(int n) {
        int[][] a = new int[n][n];
        int top = 0, bottom = n - 1, left = 0, right = n - 1, v = 1;
        while (v <= n * n) {
            for (int j = left; j <= right; j++) a[top][j] = v++;
            top++;
            for (int i = top; i <= bottom; i++) a[i][right] = v++;
            right--;
            for (int j = right; j >= left; j--) a[bottom][j] = v++;
            bottom--;
            for (int i = bottom; i >= top; i--) a[i][left] = v++;
            left++;
        }
        return a;
    }
}`,
          cpp: r`class Solution {
public:
    vector<vector<int>> generateMatrix(int n) {
        vector<vector<int>> a(n, vector<int>(n, 0));
        int top = 0, bottom = n - 1, left = 0, right = n - 1, v = 1;
        while (v <= n * n) {
            for (int j = left; j <= right; j++) a[top][j] = v++;
            top++;
            for (int i = top; i <= bottom; i++) a[i][right] = v++;
            right--;
            for (int j = right; j >= left; j--) a[bottom][j] = v++;
            bottom--;
            for (int i = bottom; i >= top; i--) a[i][left] = v++;
            left++;
        }
        return a;
    }
};`,
          python: r`class Solution:
    def generateMatrix(self, n: int) -> List[List[int]]:
        a = [[0] * n for _ in range(n)]
        top, bottom, left, right, v = 0, n - 1, 0, n - 1, 1
        while v <= n * n:
            for j in range(left, right + 1):
                a[top][j] = v
                v += 1
            top += 1
            for i in range(top, bottom + 1):
                a[i][right] = v
                v += 1
            right -= 1
            for j in range(right, left - 1, -1):
                a[bottom][j] = v
                v += 1
            bottom -= 1
            for i in range(bottom, top - 1, -1):
                a[i][left] = v
                v += 1
            left += 1
        return a`,
          javascript: r`var generateMatrix = function(n) {
    const a = Array.from({ length: n }, () => new Array(n).fill(0));
    let top = 0, bottom = n - 1, left = 0, right = n - 1, v = 1;
    while (v <= n * n) {
        for (let j = left; j <= right; j++) a[top][j] = v++;
        top++;
        for (let i = top; i <= bottom; i++) a[i][right] = v++;
        right--;
        for (let j = right; j >= left; j--) a[bottom][j] = v++;
        bottom--;
        for (let i = bottom; i >= top; i--) a[i][left] = v++;
        left++;
    }
    return a;
};`,
        },
      },
    ],
  },

  'rotate-image': {
    pattern: 'Rotation = transpose + reverse rows, or four-way cyclic swaps per layer',
    approaches: [
      {
        level: 'Brute force', name: 'Rotate into a copy, then copy back',
        idea: 'After a clockwise rotation, the new `(i, j)` holds the old `(n − 1 − j, i)`. Fill a second matrix that way and copy it back.',
        steps: [
          'Create `copy[i][j] = matrix[n − 1 − j][i]` for every cell.',
          'Copy `copy` back into `matrix`.',
        ],
        time: 'O(n²)', space: 'O(n²)',
        why: 'Simple and correct, but it allocates a whole second matrix, which the problem forbids.',
        code: {
          java: r`class Solution {
    public void rotate(int[][] matrix) {
        int n = matrix.length;
        int[][] copy = new int[n][n];
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++) copy[i][j] = matrix[n - 1 - j][i];
        for (int i = 0; i < n; i++) matrix[i] = copy[i];
    }
}`,
          cpp: r`class Solution {
public:
    void rotate(vector<vector<int>>& matrix) {
        int n = matrix.size();
        vector<vector<int>> copy(n, vector<int>(n));
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++) copy[i][j] = matrix[n - 1 - j][i];
        matrix = copy;
    }
};`,
          python: r`class Solution:
    def rotate(self, matrix: List[List[int]]) -> None:
        n = len(matrix)
        copy = [[matrix[n - 1 - j][i] for j in range(n)] for i in range(n)]
        matrix[:] = copy`,
          javascript: r`var rotate = function(matrix) {
    const n = matrix.length;
    const copy = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => matrix[n - 1 - j][i]));
    for (let i = 0; i < n; i++) matrix[i] = copy[i];
};`,
        },
      },
      {
        level: 'Better', name: 'Transpose, then reverse each row',
        idea: 'Transposing sends `(i, j)` to `(j, i)`; reversing each row then sends it to `(j, n − 1 − i)` — exactly a 90° clockwise rotation. Both steps are in-place swaps.',
        steps: [
          'Transpose: for `i < j`, swap `matrix[i][j]` and `matrix[j][i]`.',
          'Reverse every row.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'Two passes of swaps, no extra matrix. Easy to remember and hard to get wrong in an interview.',
        code: {
          java: r`class Solution {
    public void rotate(int[][] matrix) {
        int n = matrix.length;
        for (int i = 0; i < n; i++)
            for (int j = i + 1; j < n; j++) {
                int t = matrix[i][j]; matrix[i][j] = matrix[j][i]; matrix[j][i] = t;
            }
        for (int[] row : matrix)
            for (int l = 0, r = n - 1; l < r; l++, r--) {
                int t = row[l]; row[l] = row[r]; row[r] = t;
            }
    }
}`,
          cpp: r`class Solution {
public:
    void rotate(vector<vector<int>>& matrix) {
        int n = matrix.size();
        for (int i = 0; i < n; i++)
            for (int j = i + 1; j < n; j++) swap(matrix[i][j], matrix[j][i]);
        for (auto& row : matrix) reverse(row.begin(), row.end());
    }
};`,
          python: r`class Solution:
    def rotate(self, matrix: List[List[int]]) -> None:
        n = len(matrix)
        for i in range(n):
            for j in range(i + 1, n):
                matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
        for row in matrix:
            row.reverse()`,
          javascript: r`var rotate = function(matrix) {
    const n = matrix.length;
    for (let i = 0; i < n; i++)
        for (let j = i + 1; j < n; j++) [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];
    for (const row of matrix) row.reverse();
};`,
        },
      },
      {
        level: 'Optimal', name: 'Four-way cycle per layer',
        idea: 'Each element belongs to a cycle of four positions that rotate into each other: top → right → bottom → left. Rotate each cycle with one temporary value, layer by layer.',
        steps: [
          'For each layer `i < n/2`, for `j` from `i` to `n − 2 − i`:',
          'Save `t = a[i][j]`; then `a[i][j] = a[n−1−j][i]`, `a[n−1−j][i] = a[n−1−i][n−1−j]`, `a[n−1−i][n−1−j] = a[j][n−1−i]`, `a[j][n−1−i] = t`.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'Every element is moved exactly once (instead of twice in transpose + reverse), with one temporary variable.',
        code: {
          java: r`class Solution {
    public void rotate(int[][] a) {
        int n = a.length;
        for (int i = 0; i < n / 2; i++)
            for (int j = i; j < n - 1 - i; j++) {
                int t = a[i][j];
                a[i][j] = a[n - 1 - j][i];
                a[n - 1 - j][i] = a[n - 1 - i][n - 1 - j];
                a[n - 1 - i][n - 1 - j] = a[j][n - 1 - i];
                a[j][n - 1 - i] = t;
            }
    }
}`,
          cpp: r`class Solution {
public:
    void rotate(vector<vector<int>>& a) {
        int n = a.size();
        for (int i = 0; i < n / 2; i++)
            for (int j = i; j < n - 1 - i; j++) {
                int t = a[i][j];
                a[i][j] = a[n - 1 - j][i];
                a[n - 1 - j][i] = a[n - 1 - i][n - 1 - j];
                a[n - 1 - i][n - 1 - j] = a[j][n - 1 - i];
                a[j][n - 1 - i] = t;
            }
    }
};`,
          python: r`class Solution:
    def rotate(self, a: List[List[int]]) -> None:
        n = len(a)
        for i in range(n // 2):
            for j in range(i, n - 1 - i):
                t = a[i][j]
                a[i][j] = a[n - 1 - j][i]
                a[n - 1 - j][i] = a[n - 1 - i][n - 1 - j]
                a[n - 1 - i][n - 1 - j] = a[j][n - 1 - i]
                a[j][n - 1 - i] = t`,
          javascript: r`var rotate = function(a) {
    const n = a.length;
    for (let i = 0; i < Math.floor(n / 2); i++)
        for (let j = i; j < n - 1 - i; j++) {
            const t = a[i][j];
            a[i][j] = a[n - 1 - j][i];
            a[n - 1 - j][i] = a[n - 1 - i][n - 1 - j];
            a[n - 1 - i][n - 1 - j] = a[j][n - 1 - i];
            a[j][n - 1 - i] = t;
        }
};`,
        },
      },
    ],
  },

  'set-matrix-zeroes': {
    pattern: 'Use the first row and column as in-place marker arrays',
    approaches: [
      {
        level: 'Brute force', name: 'Copy, then zero rows and columns from the copy',
        idea: 'Zeroing while scanning would spread new zeros. So read the zeros from an untouched copy and, for each one, clear its row and column in the original.',
        steps: [
          'Copy the matrix.',
          'For every cell that is 0 in the copy, set its whole row and column to 0 in `matrix`.',
        ],
        time: 'O(m·n·(m + n))', space: 'O(m·n)',
        why: 'Each zero clears up to m + n cells, and the copy doubles the memory.',
        code: {
          java: r`class Solution {
    public void setZeroes(int[][] matrix) {
        int m = matrix.length, n = matrix[0].length;
        int[][] copy = new int[m][];
        for (int i = 0; i < m; i++) copy[i] = matrix[i].clone();
        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++)
                if (copy[i][j] == 0) {
                    for (int k = 0; k < n; k++) matrix[i][k] = 0;
                    for (int k = 0; k < m; k++) matrix[k][j] = 0;
                }
    }
}`,
          cpp: r`class Solution {
public:
    void setZeroes(vector<vector<int>>& matrix) {
        int m = matrix.size(), n = matrix[0].size();
        vector<vector<int>> copy = matrix;
        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++)
                if (copy[i][j] == 0) {
                    for (int k = 0; k < n; k++) matrix[i][k] = 0;
                    for (int k = 0; k < m; k++) matrix[k][j] = 0;
                }
    }
};`,
          python: r`class Solution:
    def setZeroes(self, matrix: List[List[int]]) -> None:
        m, n = len(matrix), len(matrix[0])
        copy = [row[:] for row in matrix]
        for i in range(m):
            for j in range(n):
                if copy[i][j] == 0:
                    for k in range(n):
                        matrix[i][k] = 0
                    for k in range(m):
                        matrix[k][j] = 0`,
          javascript: r`var setZeroes = function(matrix) {
    const m = matrix.length, n = matrix[0].length;
    const copy = matrix.map((row) => [...row]);
    for (let i = 0; i < m; i++)
        for (let j = 0; j < n; j++)
            if (copy[i][j] === 0) {
                for (let k = 0; k < n; k++) matrix[i][k] = 0;
                for (let k = 0; k < m; k++) matrix[k][j] = 0;
            }
};`,
        },
      },
      {
        level: 'Better', name: 'Row and column flags',
        idea: 'Only which rows and which columns contain a zero matters. Record them in two boolean arrays, then clear in a second pass.',
        steps: [
          'Pass 1: for each zero at `(i, j)`, set `zeroRow[i]` and `zeroCol[j]`.',
          'Pass 2: set `matrix[i][j] = 0` when `zeroRow[i]` or `zeroCol[j]`.',
        ],
        time: 'O(m·n)', space: 'O(m + n)',
        why: 'Two passes; m + n flags.',
        code: {
          java: r`class Solution {
    public void setZeroes(int[][] matrix) {
        int m = matrix.length, n = matrix[0].length;
        boolean[] zeroRow = new boolean[m], zeroCol = new boolean[n];
        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++)
                if (matrix[i][j] == 0) { zeroRow[i] = true; zeroCol[j] = true; }
        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++)
                if (zeroRow[i] || zeroCol[j]) matrix[i][j] = 0;
    }
}`,
          cpp: r`class Solution {
public:
    void setZeroes(vector<vector<int>>& matrix) {
        int m = matrix.size(), n = matrix[0].size();
        vector<bool> zeroRow(m, false), zeroCol(n, false);
        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++)
                if (matrix[i][j] == 0) { zeroRow[i] = true; zeroCol[j] = true; }
        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++)
                if (zeroRow[i] || zeroCol[j]) matrix[i][j] = 0;
    }
};`,
          python: r`class Solution:
    def setZeroes(self, matrix: List[List[int]]) -> None:
        m, n = len(matrix), len(matrix[0])
        zero_row, zero_col = [False] * m, [False] * n
        for i in range(m):
            for j in range(n):
                if matrix[i][j] == 0:
                    zero_row[i] = zero_col[j] = True
        for i in range(m):
            for j in range(n):
                if zero_row[i] or zero_col[j]:
                    matrix[i][j] = 0`,
          javascript: r`var setZeroes = function(matrix) {
    const m = matrix.length, n = matrix[0].length;
    const zeroRow = new Array(m).fill(false), zeroCol = new Array(n).fill(false);
    for (let i = 0; i < m; i++)
        for (let j = 0; j < n; j++)
            if (matrix[i][j] === 0) { zeroRow[i] = true; zeroCol[j] = true; }
    for (let i = 0; i < m; i++)
        for (let j = 0; j < n; j++)
            if (zeroRow[i] || zeroCol[j]) matrix[i][j] = 0;
};`,
        },
      },
      {
        level: 'Optimal', name: 'First row and column as the flags',
        idea: 'Store the row flags in column 0 and the column flags in row 0 of the matrix itself. Two extra booleans remember whether row 0 and column 0 themselves need clearing.',
        steps: [
          'Record `firstRowZero` / `firstColZero` = whether row 0 / column 0 contains a 0.',
          'For `i, j ≥ 1`: if `matrix[i][j] == 0`, set `matrix[i][0] = 0` and `matrix[0][j] = 0`.',
          'For `i, j ≥ 1`: zero the cell if `matrix[i][0] == 0` or `matrix[0][j] == 0`.',
          'Finally clear row 0 and/or column 0 according to the two booleans.',
        ],
        time: 'O(m·n)', space: 'O(1)',
        why: 'Same two passes, but the markers live inside the matrix. Row 0 and column 0 are cleared last so their markers are read before being overwritten.',
        code: {
          java: r`class Solution {
    public void setZeroes(int[][] matrix) {
        int m = matrix.length, n = matrix[0].length;
        boolean firstRowZero = false, firstColZero = false;
        for (int j = 0; j < n; j++) if (matrix[0][j] == 0) firstRowZero = true;
        for (int i = 0; i < m; i++) if (matrix[i][0] == 0) firstColZero = true;
        for (int i = 1; i < m; i++)
            for (int j = 1; j < n; j++)
                if (matrix[i][j] == 0) { matrix[i][0] = 0; matrix[0][j] = 0; }
        for (int i = 1; i < m; i++)
            for (int j = 1; j < n; j++)
                if (matrix[i][0] == 0 || matrix[0][j] == 0) matrix[i][j] = 0;
        if (firstRowZero) for (int j = 0; j < n; j++) matrix[0][j] = 0;
        if (firstColZero) for (int i = 0; i < m; i++) matrix[i][0] = 0;
    }
}`,
          cpp: r`class Solution {
public:
    void setZeroes(vector<vector<int>>& matrix) {
        int m = matrix.size(), n = matrix[0].size();
        bool firstRowZero = false, firstColZero = false;
        for (int j = 0; j < n; j++) if (matrix[0][j] == 0) firstRowZero = true;
        for (int i = 0; i < m; i++) if (matrix[i][0] == 0) firstColZero = true;
        for (int i = 1; i < m; i++)
            for (int j = 1; j < n; j++)
                if (matrix[i][j] == 0) { matrix[i][0] = 0; matrix[0][j] = 0; }
        for (int i = 1; i < m; i++)
            for (int j = 1; j < n; j++)
                if (matrix[i][0] == 0 || matrix[0][j] == 0) matrix[i][j] = 0;
        if (firstRowZero) for (int j = 0; j < n; j++) matrix[0][j] = 0;
        if (firstColZero) for (int i = 0; i < m; i++) matrix[i][0] = 0;
    }
};`,
          python: r`class Solution:
    def setZeroes(self, matrix: List[List[int]]) -> None:
        m, n = len(matrix), len(matrix[0])
        first_row_zero = any(matrix[0][j] == 0 for j in range(n))
        first_col_zero = any(matrix[i][0] == 0 for i in range(m))
        for i in range(1, m):
            for j in range(1, n):
                if matrix[i][j] == 0:
                    matrix[i][0] = matrix[0][j] = 0
        for i in range(1, m):
            for j in range(1, n):
                if matrix[i][0] == 0 or matrix[0][j] == 0:
                    matrix[i][j] = 0
        if first_row_zero:
            for j in range(n):
                matrix[0][j] = 0
        if first_col_zero:
            for i in range(m):
                matrix[i][0] = 0`,
          javascript: r`var setZeroes = function(matrix) {
    const m = matrix.length, n = matrix[0].length;
    const firstRowZero = matrix[0].some((v) => v === 0);
    const firstColZero = matrix.some((row) => row[0] === 0);
    for (let i = 1; i < m; i++)
        for (let j = 1; j < n; j++)
            if (matrix[i][j] === 0) { matrix[i][0] = 0; matrix[0][j] = 0; }
    for (let i = 1; i < m; i++)
        for (let j = 1; j < n; j++)
            if (matrix[i][0] === 0 || matrix[0][j] === 0) matrix[i][j] = 0;
    if (firstRowZero) for (let j = 0; j < n; j++) matrix[0][j] = 0;
    if (firstColZero) for (let i = 0; i < m; i++) matrix[i][0] = 0;
};`,
        },
      },
    ],
  },

  'game-of-life': {
    pattern: 'Simultaneous update via state encoding: keep the old state in bit 0, the new one in bit 1',
    approaches: [
      {
        level: 'Better', name: 'Read from a copy',
        idea: 'All cells must update at once, so count neighbours on an unchanged copy of the board and write the new states into the original.',
        steps: [
          'Copy the board.',
          'For each cell, count live neighbours among its 8 surrounding cells in the copy.',
          'Apply the rules: alive next turn if `live == 3`, or if `live == 2` and the cell is alive now.',
        ],
        time: 'O(m·n)', space: 'O(m·n)',
        why: '8 neighbours per cell, plus a full copy of the board.',
        code: {
          java: r`class Solution {
    public void gameOfLife(int[][] board) {
        int m = board.length, n = board[0].length;
        int[][] old = new int[m][];
        for (int i = 0; i < m; i++) old[i] = board[i].clone();
        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++) {
                int live = 0;
                for (int di = -1; di <= 1; di++)
                    for (int dj = -1; dj <= 1; dj++) {
                        int r = i + di, c = j + dj;
                        if ((di != 0 || dj != 0) && r >= 0 && r < m && c >= 0 && c < n) live += old[r][c];
                    }
                board[i][j] = live == 3 || (live == 2 && old[i][j] == 1) ? 1 : 0;
            }
    }
}`,
          cpp: r`class Solution {
public:
    void gameOfLife(vector<vector<int>>& board) {
        int m = board.size(), n = board[0].size();
        vector<vector<int>> old = board;
        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++) {
                int live = 0;
                for (int di = -1; di <= 1; di++)
                    for (int dj = -1; dj <= 1; dj++) {
                        int r = i + di, c = j + dj;
                        if ((di || dj) && r >= 0 && r < m && c >= 0 && c < n) live += old[r][c];
                    }
                board[i][j] = live == 3 || (live == 2 && old[i][j] == 1) ? 1 : 0;
            }
    }
};`,
          python: r`class Solution:
    def gameOfLife(self, board: List[List[int]]) -> None:
        m, n = len(board), len(board[0])
        old = [row[:] for row in board]
        for i in range(m):
            for j in range(n):
                live = sum(old[r][c]
                           for r in range(max(0, i - 1), min(m, i + 2))
                           for c in range(max(0, j - 1), min(n, j + 2))
                           if (r, c) != (i, j))
                board[i][j] = 1 if live == 3 or (live == 2 and old[i][j]) else 0`,
          javascript: r`var gameOfLife = function(board) {
    const m = board.length, n = board[0].length;
    const old = board.map((row) => [...row]);
    for (let i = 0; i < m; i++)
        for (let j = 0; j < n; j++) {
            let live = 0;
            for (let di = -1; di <= 1; di++)
                for (let dj = -1; dj <= 1; dj++) {
                    const r = i + di, c = j + dj;
                    if ((di || dj) && r >= 0 && r < m && c >= 0 && c < n) live += old[r][c];
                }
            board[i][j] = live === 3 || (live === 2 && old[i][j] === 1) ? 1 : 0;
        }
};`,
        },
      },
      {
        level: 'Optimal', name: 'Encode the next state in bit 1',
        idea: 'Each cell only uses bit 0 (alive now). Write the next state into bit 1 while still reading neighbours through `& 1`, then shift every cell right by one.',
        steps: [
          'For each cell, count live neighbours using `board[r][c] & 1`.',
          'If it lives next turn (`live == 3`, or `live == 2` and alive now), set `board[i][j] |= 2`.',
          'Second pass: `board[i][j] >>= 1`.',
        ],
        time: 'O(m·n)', space: 'O(1)',
        why: 'Same neighbour counting, but the old state is never lost, so no copy is needed.',
        code: {
          java: r`class Solution {
    public void gameOfLife(int[][] board) {
        int m = board.length, n = board[0].length;
        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++) {
                int live = 0;
                for (int di = -1; di <= 1; di++)
                    for (int dj = -1; dj <= 1; dj++) {
                        int r = i + di, c = j + dj;
                        if ((di != 0 || dj != 0) && r >= 0 && r < m && c >= 0 && c < n) live += board[r][c] & 1;
                    }
                if (live == 3 || (live == 2 && (board[i][j] & 1) == 1)) board[i][j] |= 2;
            }
        for (int[] row : board)
            for (int j = 0; j < n; j++) row[j] >>= 1;
    }
}`,
          cpp: r`class Solution {
public:
    void gameOfLife(vector<vector<int>>& board) {
        int m = board.size(), n = board[0].size();
        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++) {
                int live = 0;
                for (int di = -1; di <= 1; di++)
                    for (int dj = -1; dj <= 1; dj++) {
                        int r = i + di, c = j + dj;
                        if ((di || dj) && r >= 0 && r < m && c >= 0 && c < n) live += board[r][c] & 1;
                    }
                if (live == 3 || (live == 2 && (board[i][j] & 1))) board[i][j] |= 2;
            }
        for (auto& row : board)
            for (int& cell : row) cell >>= 1;
    }
};`,
          python: r`class Solution:
    def gameOfLife(self, board: List[List[int]]) -> None:
        m, n = len(board), len(board[0])
        for i in range(m):
            for j in range(n):
                live = sum(board[r][c] & 1
                           for r in range(max(0, i - 1), min(m, i + 2))
                           for c in range(max(0, j - 1), min(n, j + 2))
                           if (r, c) != (i, j))
                if live == 3 or (live == 2 and board[i][j] & 1):
                    board[i][j] |= 2
        for row in board:
            for j in range(n):
                row[j] >>= 1`,
          javascript: r`var gameOfLife = function(board) {
    const m = board.length, n = board[0].length;
    for (let i = 0; i < m; i++)
        for (let j = 0; j < n; j++) {
            let live = 0;
            for (let di = -1; di <= 1; di++)
                for (let dj = -1; dj <= 1; dj++) {
                    const r = i + di, c = j + dj;
                    if ((di || dj) && r >= 0 && r < m && c >= 0 && c < n) live += board[r][c] & 1;
                }
            if (live === 3 || (live === 2 && (board[i][j] & 1))) board[i][j] |= 2;
        }
    for (const row of board)
        for (let j = 0; j < n; j++) row[j] >>= 1;
};`,
        },
      },
    ],
  },

  'search-a-2d-matrix-ii': {
    pattern: 'Staircase search from a corner where one move discards a whole row or column',
    approaches: [
      {
        level: 'Brute force', name: 'Scan every cell',
        idea: 'Check every element against the target.',
        steps: [
          'Loop over all rows and columns.',
          'Return true on a match, false after the scan.',
        ],
        time: 'O(m·n)', space: 'O(1)',
        why: 'Ignores the sorted order entirely.',
        code: {
          java: r`class Solution {
    public boolean searchMatrix(int[][] matrix, int target) {
        for (int[] row : matrix)
            for (int v : row) if (v == target) return true;
        return false;
    }
}`,
          cpp: r`class Solution {
public:
    bool searchMatrix(vector<vector<int>>& matrix, int target) {
        for (auto& row : matrix)
            for (int v : row) if (v == target) return true;
        return false;
    }
};`,
          python: r`class Solution:
    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:
        return any(target in row for row in matrix)`,
          javascript: r`var searchMatrix = function(matrix, target) {
    return matrix.some((row) => row.includes(target));
};`,
        },
      },
      {
        level: 'Better', name: 'Binary search each row',
        idea: 'Every row is sorted, so binary search each one. (Columns being sorted is not used.)',
        steps: [
          'For each row, binary search for `target`.',
          'Return true if any search finds it.',
        ],
        time: 'O(m·log n)', space: 'O(1)',
        why: 'm binary searches of length n.',
        code: {
          java: r`class Solution {
    public boolean searchMatrix(int[][] matrix, int target) {
        for (int[] row : matrix)
            if (Arrays.binarySearch(row, target) >= 0) return true;
        return false;
    }
}`,
          cpp: r`class Solution {
public:
    bool searchMatrix(vector<vector<int>>& matrix, int target) {
        for (auto& row : matrix)
            if (binary_search(row.begin(), row.end(), target)) return true;
        return false;
    }
};`,
          python: r`class Solution:
    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:
        for row in matrix:
            i = bisect_left(row, target)
            if i < len(row) and row[i] == target:
                return True
        return False`,
          javascript: r`var searchMatrix = function(matrix, target) {
    for (const row of matrix) {
        let lo = 0, hi = row.length - 1;
        while (lo <= hi) {
            const mid = (lo + hi) >> 1;
            if (row[mid] === target) return true;
            if (row[mid] < target) lo = mid + 1;
            else hi = mid - 1;
        }
    }
    return false;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Staircase from the top-right corner',
        idea: 'At the top-right cell, everything to the left is smaller and everything below is larger. If the cell is too big, its whole column is too big — move left. If too small, its whole row is too small — move down.',
        steps: [
          'Start at `r = 0`, `c = n − 1`.',
          'While inside the matrix: equal → true; greater than target → `c--`; less → `r++`.',
          'Return false when you walk off the matrix.',
        ],
        time: 'O(m + n)', space: 'O(1)',
        why: 'Each step removes one row or one column, so at most m + n steps. (The bottom-left corner works the same way.)',
        code: {
          java: r`class Solution {
    public boolean searchMatrix(int[][] matrix, int target) {
        int r = 0, c = matrix[0].length - 1;
        while (r < matrix.length && c >= 0) {
            if (matrix[r][c] == target) return true;
            if (matrix[r][c] > target) c--;
            else r++;
        }
        return false;
    }
}`,
          cpp: r`class Solution {
public:
    bool searchMatrix(vector<vector<int>>& matrix, int target) {
        int r = 0, c = matrix[0].size() - 1;
        while (r < (int) matrix.size() && c >= 0) {
            if (matrix[r][c] == target) return true;
            if (matrix[r][c] > target) c--;
            else r++;
        }
        return false;
    }
};`,
          python: r`class Solution:
    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:
        r, c = 0, len(matrix[0]) - 1
        while r < len(matrix) and c >= 0:
            if matrix[r][c] == target:
                return True
            if matrix[r][c] > target:
                c -= 1
            else:
                r += 1
        return False`,
          javascript: r`var searchMatrix = function(matrix, target) {
    let r = 0, c = matrix[0].length - 1;
    while (r < matrix.length && c >= 0) {
        if (matrix[r][c] === target) return true;
        if (matrix[r][c] > target) c--;
        else r++;
    }
    return false;
};`,
        },
      },
    ],
  },

  'diagonal-traverse': {
    pattern: 'Diagonals share i + j; alternate direction by parity and bounce off the edges',
    approaches: [
      {
        level: 'Brute force', name: 'Scan the whole matrix for each diagonal',
        idea: 'For each diagonal index `d = i + j` from 0 to m + n − 2, scan every cell and collect those with `i + j == d` — rows bottom-to-top for even `d`, top-to-bottom for odd `d`.',
        steps: [
          'For `d` from 0 to m + n − 2:',
          'If `d` is even, scan rows from m − 1 down to 0; otherwise from 0 up to m − 1.',
          'Within the row, take the cell with `j = d − i` if it exists.',
        ],
        time: 'O(m·(m + n))', space: 'O(1)',
        why: 'Every diagonal looks at all m rows, so most of the work finds nothing.',
        code: {
          java: r`class Solution {
    public int[] findDiagonalOrder(int[][] mat) {
        int m = mat.length, n = mat[0].length, k = 0;
        int[] result = new int[m * n];
        for (int d = 0; d <= m + n - 2; d++)
            for (int t = 0; t < m; t++) {
                int i = d % 2 == 0 ? m - 1 - t : t, j = d - i;
                if (j >= 0 && j < n) result[k++] = mat[i][j];
            }
        return result;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> findDiagonalOrder(vector<vector<int>>& mat) {
        int m = mat.size(), n = mat[0].size();
        vector<int> result;
        for (int d = 0; d <= m + n - 2; d++)
            for (int t = 0; t < m; t++) {
                int i = d % 2 == 0 ? m - 1 - t : t, j = d - i;
                if (j >= 0 && j < n) result.push_back(mat[i][j]);
            }
        return result;
    }
};`,
          python: r`class Solution:
    def findDiagonalOrder(self, mat: List[List[int]]) -> List[int]:
        m, n = len(mat), len(mat[0])
        result = []
        for d in range(m + n - 1):
            rows = range(m - 1, -1, -1) if d % 2 == 0 else range(m)
            for i in rows:
                if 0 <= d - i < n:
                    result.append(mat[i][d - i])
        return result`,
          javascript: r`var findDiagonalOrder = function(mat) {
    const m = mat.length, n = mat[0].length, result = [];
    for (let d = 0; d <= m + n - 2; d++)
        for (let t = 0; t < m; t++) {
            const i = d % 2 === 0 ? m - 1 - t : t, j = d - i;
            if (j >= 0 && j < n) result.push(mat[i][j]);
        }
    return result;
};`,
        },
      },
      {
        level: 'Better', name: 'Group by i + j, reverse the even groups',
        idea: 'Bucket every cell by its diagonal `i + j` (scanning rows top to bottom), then output the buckets in order, reversing the even ones so they read upwards.',
        steps: [
          'Create m + n − 1 lists; append `mat[i][j]` to list `i + j` in row-major order.',
          'For each `d`: append list `d` reversed if `d` is even, as-is if odd.',
        ],
        time: 'O(m·n)', space: 'O(m·n)',
        why: 'Each cell is touched twice, but the buckets hold a full copy of the matrix.',
        code: {
          java: r`class Solution {
    public int[] findDiagonalOrder(int[][] mat) {
        int m = mat.length, n = mat[0].length, k = 0;
        List<List<Integer>> groups = new ArrayList<>();
        for (int d = 0; d < m + n - 1; d++) groups.add(new ArrayList<>());
        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++) groups.get(i + j).add(mat[i][j]);
        int[] result = new int[m * n];
        for (int d = 0; d < groups.size(); d++) {
            List<Integer> g = groups.get(d);
            if (d % 2 == 0) Collections.reverse(g);
            for (int v : g) result[k++] = v;
        }
        return result;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> findDiagonalOrder(vector<vector<int>>& mat) {
        int m = mat.size(), n = mat[0].size();
        vector<vector<int>> groups(m + n - 1);
        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++) groups[i + j].push_back(mat[i][j]);
        vector<int> result;
        for (int d = 0; d < (int) groups.size(); d++) {
            if (d % 2 == 0) reverse(groups[d].begin(), groups[d].end());
            result.insert(result.end(), groups[d].begin(), groups[d].end());
        }
        return result;
    }
};`,
          python: r`class Solution:
    def findDiagonalOrder(self, mat: List[List[int]]) -> List[int]:
        m, n = len(mat), len(mat[0])
        groups = [[] for _ in range(m + n - 1)]
        for i in range(m):
            for j in range(n):
                groups[i + j].append(mat[i][j])
        result = []
        for d, g in enumerate(groups):
            result.extend(reversed(g) if d % 2 == 0 else g)
        return result`,
          javascript: r`var findDiagonalOrder = function(mat) {
    const m = mat.length, n = mat[0].length;
    const groups = Array.from({ length: m + n - 1 }, () => []);
    for (let i = 0; i < m; i++)
        for (let j = 0; j < n; j++) groups[i + j].push(mat[i][j]);
    const result = [];
    groups.forEach((g, d) => result.push(...(d % 2 === 0 ? g.reverse() : g)));
    return result;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Walk the zig-zag and bounce off the edges',
        idea: 'Move up-right on even diagonals and down-left on odd ones. When a move would leave the matrix, step to the start of the next diagonal instead — which edge you hit decides whether that is right or down.',
        steps: [
          'Start at `(0, 0)`; repeat m·n times, recording the current cell.',
          'Going up (`(r + c)` even): if at the last column, `r++`; else if at the top row, `c++`; else `r--, c++`.',
          'Going down (odd): if at the last row, `c++`; else if at the first column, `r++`; else `r++, c--`.',
        ],
        time: 'O(m·n)', space: 'O(1)',
        why: 'One step per cell and no buffers besides the output. The last-column / last-row checks come first so corners turn the right way.',
        code: {
          java: r`class Solution {
    public int[] findDiagonalOrder(int[][] mat) {
        int m = mat.length, n = mat[0].length, r = 0, c = 0;
        int[] result = new int[m * n];
        for (int k = 0; k < m * n; k++) {
            result[k] = mat[r][c];
            if ((r + c) % 2 == 0) {
                if (c == n - 1) r++;
                else if (r == 0) c++;
                else { r--; c++; }
            } else {
                if (r == m - 1) c++;
                else if (c == 0) r++;
                else { r++; c--; }
            }
        }
        return result;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> findDiagonalOrder(vector<vector<int>>& mat) {
        int m = mat.size(), n = mat[0].size(), r = 0, c = 0;
        vector<int> result(m * n);
        for (int k = 0; k < m * n; k++) {
            result[k] = mat[r][c];
            if ((r + c) % 2 == 0) {
                if (c == n - 1) r++;
                else if (r == 0) c++;
                else { r--; c++; }
            } else {
                if (r == m - 1) c++;
                else if (c == 0) r++;
                else { r++; c--; }
            }
        }
        return result;
    }
};`,
          python: r`class Solution:
    def findDiagonalOrder(self, mat: List[List[int]]) -> List[int]:
        m, n = len(mat), len(mat[0])
        r = c = 0
        result = []
        for _ in range(m * n):
            result.append(mat[r][c])
            if (r + c) % 2 == 0:
                if c == n - 1:
                    r += 1
                elif r == 0:
                    c += 1
                else:
                    r, c = r - 1, c + 1
            else:
                if r == m - 1:
                    c += 1
                elif c == 0:
                    r += 1
                else:
                    r, c = r + 1, c - 1
        return result`,
          javascript: r`var findDiagonalOrder = function(mat) {
    const m = mat.length, n = mat[0].length, result = new Array(m * n);
    let r = 0, c = 0;
    for (let k = 0; k < m * n; k++) {
        result[k] = mat[r][c];
        if ((r + c) % 2 === 0) {
            if (c === n - 1) r++;
            else if (r === 0) c++;
            else { r--; c++; }
        } else {
            if (r === m - 1) c++;
            else if (c === 0) r++;
            else { r++; c--; }
        }
    }
    return result;
};`,
        },
      },
    ],
  },
};
