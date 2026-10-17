export default [
  {
    slug: 'transpose-matrix', title: 'Transpose Matrix', level: 'Easy',
    summary: 'Return the transpose of the matrix: rows become columns.',
    method: 'transpose', params: [['int[][]', 'matrix']], returns: 'int[][]',
    tests: [
      { in: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], out: [[1, 4, 7], [2, 5, 8], [3, 6, 9]] },
      { in: [[[1, 2, 3], [4, 5, 6]]], out: [[1, 4], [2, 5], [3, 6]] },
      { in: [[[5]]] },
      { in: [[[1], [2], [3]]] },
    ],
    ref: `class Solution {
    public int[][] transpose(int[][] m) {
        int[][] t = new int[m[0].length][m.length];
        for (int i = 0; i < m.length; i++) for (int j = 0; j < m[0].length; j++) t[j][i] = m[i][j];
        return t;
    }
}`,
  },
  {
    slug: 'spiral-matrix', title: 'Spiral Matrix', level: 'Medium',
    summary: 'Return all elements of the matrix in clockwise spiral order, starting at the top-left.',
    method: 'spiralOrder', params: [['int[][]', 'matrix']], returns: 'List<Integer>',
    tests: [
      { in: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], out: [1, 2, 3, 6, 9, 8, 7, 4, 5] },
      { in: [[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]], out: [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7] },
      { in: [[[1]]] },
      { in: [[[1], [2], [3]]] },
      { in: [[[1, 2], [3, 4], [5, 6], [7, 8]]] },
    ],
    ref: `class Solution {
    public List<Integer> spiralOrder(int[][] m) {
        List<Integer> out = new ArrayList<>();
        int top = 0, bottom = m.length - 1, left = 0, right = m[0].length - 1;
        while (top <= bottom && left <= right) {
            for (int j = left; j <= right; j++) out.add(m[top][j]);
            for (int i = top + 1; i <= bottom; i++) out.add(m[i][right]);
            if (top < bottom) for (int j = right - 1; j >= left; j--) out.add(m[bottom][j]);
            if (left < right) for (int i = bottom - 1; i > top; i--) out.add(m[i][left]);
            top++; bottom--; left++; right--;
        }
        return out;
    }
}`,
  },
  {
    slug: 'spiral-matrix-ii', title: 'Spiral Matrix II', level: 'Medium',
    summary: 'Return an n×n matrix filled with 1 to n² in clockwise spiral order.',
    method: 'generateMatrix', params: [['int', 'n']], returns: 'int[][]',
    tests: [
      { in: [3], out: [[1, 2, 3], [8, 9, 4], [7, 6, 5]] },
      { in: [1], out: [[1]] },
      { in: [2] },
      { in: [4] },
    ],
    ref: `class Solution {
    public int[][] generateMatrix(int n) {
        int[][] m = new int[n][n];
        int[] dr = { 0, 1, 0, -1 }, dc = { 1, 0, -1, 0 };
        int r = 0, c = 0, d = 0;
        for (int v = 1; v <= n * n; v++) {
            m[r][c] = v;
            int nr = r + dr[d], nc = c + dc[d];
            if (nr < 0 || nr >= n || nc < 0 || nc >= n || m[nr][nc] != 0) { d = (d + 1) % 4; nr = r + dr[d]; nc = c + dc[d]; }
            r = nr; c = nc;
        }
        return m;
    }
}`,
  },
  {
    slug: 'rotate-image', title: 'Rotate Image', level: 'Medium',
    summary: 'Rotate an n×n matrix 90° clockwise in place. The judge prints the matrix after your call.',
    method: 'rotate', params: [['int[][]', 'matrix']], returns: 'void', output: 0,
    tests: [
      { in: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], out: [[7, 4, 1], [8, 5, 2], [9, 6, 3]] },
      { in: [[[5, 1, 9, 11], [2, 4, 8, 10], [13, 3, 6, 7], [15, 14, 12, 16]]], out: [[15, 13, 2, 5], [14, 3, 4, 1], [12, 6, 8, 9], [16, 7, 10, 11]] },
      { in: [[[1]]] },
      { in: [[[1, 2], [3, 4]]] },
    ],
    ref: `class Solution {
    public void rotate(int[][] m) {
        int n = m.length;
        for (int i = 0; i < n; i++) for (int j = i + 1; j < n; j++) { int t = m[i][j]; m[i][j] = m[j][i]; m[j][i] = t; }
        for (int[] row : m) for (int i = 0, j = n - 1; i < j; i++, j--) { int t = row[i]; row[i] = row[j]; row[j] = t; }
    }
}`,
  },
  {
    slug: 'set-matrix-zeroes', title: 'Set Matrix Zeroes', level: 'Medium',
    summary: 'If a cell is 0, set its entire row and column to 0, in place (ideally O(1) extra space). The judge prints the matrix after your call.',
    method: 'setZeroes', params: [['int[][]', 'matrix']], returns: 'void', output: 0,
    tests: [
      { in: [[[1, 1, 1], [1, 0, 1], [1, 1, 1]]], out: [[1, 0, 1], [0, 0, 0], [1, 0, 1]] },
      { in: [[[0, 1, 2, 0], [3, 4, 5, 2], [1, 3, 1, 5]]], out: [[0, 0, 0, 0], [0, 4, 5, 0], [0, 3, 1, 0]] },
      { in: [[[1]]] },
      { in: [[[1, 0]]] },
      { in: [[[1, 2, 3], [4, 0, 6], [7, 8, 0]]] },
    ],
    ref: `class Solution {
    public void setZeroes(int[][] m) {
        int r = m.length, c = m[0].length;
        boolean row0 = false, col0 = false;
        for (int j = 0; j < c; j++) if (m[0][j] == 0) row0 = true;
        for (int i = 0; i < r; i++) if (m[i][0] == 0) col0 = true;
        for (int i = 1; i < r; i++) for (int j = 1; j < c; j++) if (m[i][j] == 0) { m[i][0] = 0; m[0][j] = 0; }
        for (int i = 1; i < r; i++) for (int j = 1; j < c; j++) if (m[i][0] == 0 || m[0][j] == 0) m[i][j] = 0;
        if (row0) for (int j = 0; j < c; j++) m[0][j] = 0;
        if (col0) for (int i = 0; i < r; i++) m[i][0] = 0;
    }
}`,
  },
  {
    slug: 'game-of-life', title: 'Game of Life', level: 'Medium',
    summary: 'Advance Conway\'s Game of Life by one generation, updating every cell simultaneously, in place. The judge prints the board after your call.',
    method: 'gameOfLife', params: [['int[][]', 'board']], returns: 'void', output: 0,
    tests: [
      { in: [[[0, 1, 0], [0, 0, 1], [1, 1, 1], [0, 0, 0]]], out: [[0, 0, 0], [1, 0, 1], [0, 1, 1], [0, 1, 0]] },
      { in: [[[1, 1], [1, 0]]], out: [[1, 1], [1, 1]] },
      { in: [[[1]]] },
      { in: [[[0, 1, 0], [0, 1, 0], [0, 1, 0]]] },
    ],
    ref: `class Solution {
    public void gameOfLife(int[][] b) {
        int r = b.length, c = b[0].length;
        for (int i = 0; i < r; i++) for (int j = 0; j < c; j++) {
            int live = 0;
            for (int di = -1; di <= 1; di++) for (int dj = -1; dj <= 1; dj++) {
                if (di == 0 && dj == 0) continue;
                int ni = i + di, nj = j + dj;
                if (ni >= 0 && ni < r && nj >= 0 && nj < c) live += b[ni][nj] & 1;
            }
            if ((b[i][j] & 1) == 1 && (live == 2 || live == 3)) b[i][j] |= 2;
            if ((b[i][j] & 1) == 0 && live == 3) b[i][j] |= 2;
        }
        for (int i = 0; i < r; i++) for (int j = 0; j < c; j++) b[i][j] >>= 1;
    }
}`,
  },
  {
    slug: 'search-a-2d-matrix-ii', title: 'Search a 2D Matrix II', level: 'Medium',
    summary: 'Each row and each column is sorted ascending. Return whether target appears, efficiently.',
    method: 'searchMatrix', params: [['int[][]', 'matrix'], ['int', 'target']], returns: 'boolean',
    tests: [
      { in: [[[1, 4, 7, 11, 15], [2, 5, 8, 12, 19], [3, 6, 9, 16, 22], [10, 13, 14, 17, 24], [18, 21, 23, 26, 30]], 5], out: true },
      { in: [[[1, 4, 7, 11, 15], [2, 5, 8, 12, 19], [3, 6, 9, 16, 22], [10, 13, 14, 17, 24], [18, 21, 23, 26, 30]], 20], out: false },
      { in: [[[-5]], -5] },
      { in: [[[1, 3, 5]], 4] },
      { in: [[[1], [3], [5]], 5] },
    ],
    ref: `class Solution {
    public boolean searchMatrix(int[][] m, int target) {
        int i = 0, j = m[0].length - 1;
        while (i < m.length && j >= 0) {
            if (m[i][j] == target) return true;
            if (m[i][j] > target) j--; else i++;
        }
        return false;
    }
}`,
  },
  {
    slug: 'diagonal-traverse', title: 'Diagonal Traverse', level: 'Medium',
    summary: 'Return the matrix\'s elements in zig-zag diagonal order: up-right along the first diagonal, then down-left along the next, and so on.',
    method: 'findDiagonalOrder', params: [['int[][]', 'mat']], returns: 'int[]',
    tests: [
      { in: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], out: [1, 2, 4, 7, 5, 3, 6, 8, 9] },
      { in: [[[1, 2], [3, 4]]], out: [1, 2, 3, 4] },
      { in: [[[1]]] },
      { in: [[[1, 2, 3, 4]]] },
      { in: [[[1], [2], [3]]] },
    ],
    ref: `class Solution {
    public int[] findDiagonalOrder(int[][] mat) {
        int r = mat.length, c = mat[0].length, w = 0;
        int[] out = new int[r * c];
        for (int d = 0; d < r + c - 1; d++) {
            if (d % 2 == 0) { int i = Math.min(d, r - 1), j = d - i; while (i >= 0 && j < c) out[w++] = mat[i--][j++]; }
            else { int j = Math.min(d, c - 1), i = d - j; while (j >= 0 && i < r) out[w++] = mat[i++][j--]; }
        }
        return out;
    }
}`,
  },
];
