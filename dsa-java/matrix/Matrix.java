// Pattern: Matrix & Simulation. Run: java dsa-java/matrix/Matrix.java
import java.util.*;

public class Matrix {
    public static void main(String[] args) {
        var rnd = new Random(7);
        for (int t = 0; t < 3_000; t++) {
            int R = 1 + rnd.nextInt(6), C = 1 + rnd.nextInt(6);
            int[][] m = new int[R][C];
            for (int[] row : m) for (int c = 0; c < C; c++) row[c] = rnd.nextInt(4);

            Check.that(spiralOrder(m).equals(spiralBrute(m)), "spiral");

            int n = 1 + rnd.nextInt(6);
            int[][] sq = new int[n][n];
            for (int[] row : sq) for (int c = 0; c < n; c++) row[c] = rnd.nextInt(100);
            int[][] rot = copy(sq);
            rotate(rot);
            for (int r = 0; r < n; r++) for (int c = 0; c < n; c++) Check.that(rot[c][n - 1 - r] == sq[r][c], "rotate");

            int[][] z = copy(m);
            setZeroes(z);
            Check.that(Arrays.deepEquals(z, zeroesBrute(m)), "setZeroes");

            int[][] life = new int[R][C];
            for (int[] row : life) for (int c = 0; c < C; c++) row[c] = rnd.nextInt(2);
            int[][] expect = lifeBrute(life);
            gameOfLife(life);
            Check.that(Arrays.deepEquals(life, expect), "gameOfLife");

            int[][] sorted = sortedMatrix(rnd, R, C);
            for (int target = -1; target <= sorted[R - 1][C - 1] + 1; target++) {
                boolean exp = false;
                for (int[] row : sorted) for (int v : row) exp |= v == target;
                Check.that(searchMatrix(sorted, target) == exp, "staircase search");
            }

            int k = 1 + rnd.nextInt(5);
            int[][] g = generateMatrix(k);
            List<Integer> order = spiralOrder(g);
            for (int i = 0; i < k * k; i++) Check.that(order.get(i) == i + 1, "generateMatrix");
        }
        Check.done("matrix");
    }

    static final int[][] DIRS = { { 0, 1 }, { 1, 0 }, { 0, -1 }, { -1, 0 } };   // right, down, left, up

    /** Shrinking boundaries: walk the outer ring, then move every boundary inward. */
    static List<Integer> spiralOrder(int[][] m) {
        List<Integer> out = new ArrayList<>();
        int top = 0, bottom = m.length - 1, left = 0, right = m[0].length - 1;
        while (top <= bottom && left <= right) {
            for (int c = left; c <= right; c++) out.add(m[top][c]);
            top++;
            for (int r = top; r <= bottom; r++) out.add(m[r][right]);
            right--;
            if (top <= bottom) {                                   // a row is left to walk back along
                for (int c = right; c >= left; c--) out.add(m[bottom][c]);
                bottom--;
            }
            if (left <= right) {                                   // a column is left to walk up
                for (int r = bottom; r >= top; r--) out.add(m[r][left]);
                left++;
            }
        }
        return out;
    }

    /** The "walk and turn" alternative: go straight until blocked, then turn right. */
    static List<Integer> spiralBrute(int[][] m) {
        int R = m.length, C = m[0].length, r = 0, c = 0, d = 0;
        boolean[][] seen = new boolean[R][C];
        List<Integer> out = new ArrayList<>();
        for (int i = 0; i < R * C; i++) {
            out.add(m[r][c]);
            seen[r][c] = true;
            int nr = r + DIRS[d][0], nc = c + DIRS[d][1];
            if (nr < 0 || nc < 0 || nr >= R || nc >= C || seen[nr][nc]) { d = (d + 1) % 4; nr = r + DIRS[d][0]; nc = c + DIRS[d][1]; }
            r = nr; c = nc;
        }
        return out;
    }

    static int[][] generateMatrix(int n) {
        int[][] g = new int[n][n];
        int r = 0, c = 0, d = 0;
        for (int v = 1; v <= n * n; v++) {
            g[r][c] = v;
            int nr = r + DIRS[d][0], nc = c + DIRS[d][1];
            if (nr < 0 || nc < 0 || nr >= n || nc >= n || g[nr][nc] != 0) {   // blocked: turn right
                d = (d + 1) % 4;
                nr = r + DIRS[d][0]; nc = c + DIRS[d][1];
            }
            r = nr; c = nc;
        }
        return g;
    }

    /** Rotate 90° clockwise in place: transpose, then reverse each row. */
    static void rotate(int[][] m) {
        int n = m.length;
        for (int r = 0; r < n; r++)
            for (int c = r + 1; c < n; c++) { int t = m[r][c]; m[r][c] = m[c][r]; m[c][r] = t; }
        for (int[] row : m)
            for (int l = 0, h = n - 1; l < h; l++, h--) { int t = row[l]; row[l] = row[h]; row[h] = t; }
    }

    /** O(1) extra space: row 0 and column 0 store the markers; two flags remember their own zeros. */
    static void setZeroes(int[][] m) {
        int R = m.length, C = m[0].length;
        boolean firstRow = false, firstCol = false;
        for (int c = 0; c < C; c++) if (m[0][c] == 0) firstRow = true;
        for (int r = 0; r < R; r++) if (m[r][0] == 0) firstCol = true;
        for (int r = 1; r < R; r++)
            for (int c = 1; c < C; c++)
                if (m[r][c] == 0) { m[r][0] = 0; m[0][c] = 0; }          // mark the row and the column
        for (int r = 1; r < R; r++)
            for (int c = 1; c < C; c++)
                if (m[r][0] == 0 || m[0][c] == 0) m[r][c] = 0;
        if (firstRow) Arrays.fill(m[0], 0);                           // markers are applied last
        if (firstCol) for (int r = 0; r < R; r++) m[r][0] = 0;
    }

    /**
     * In place with two extra states: 2 = alive now, dead next; 3 = dead now, alive next.
     * "Alive now" is (v == 1 || v == 2), so neighbours still read the old generation.
     */
    static void gameOfLife(int[][] b) {
        int R = b.length, C = b[0].length;
        for (int r = 0; r < R; r++)
            for (int c = 0; c < C; c++) {
                int live = 0;
                for (int dr = -1; dr <= 1; dr++)
                    for (int dc = -1; dc <= 1; dc++) {
                        if (dr == 0 && dc == 0) continue;
                        int nr = r + dr, nc = c + dc;
                        if (nr >= 0 && nc >= 0 && nr < R && nc < C && (b[nr][nc] == 1 || b[nr][nc] == 2)) live++;
                    }
                if (b[r][c] == 1 && (live < 2 || live > 3)) b[r][c] = 2;   // dies
                else if (b[r][c] == 0 && live == 3) b[r][c] = 3;           // is born
            }
        for (int[] row : b)
            for (int c = 0; c < C; c++) row[c] = row[c] == 1 || row[c] == 3 ? 1 : 0;
    }

    /** Rows and columns both sorted: start top-right; each comparison discards a row or a column. */
    static boolean searchMatrix(int[][] m, int target) {
        int r = 0, c = m[0].length - 1;
        while (r < m.length && c >= 0) {
            if (m[r][c] == target) return true;
            if (m[r][c] > target) c--;          // everything below in this column is even bigger
            else r++;                           // everything left in this row is even smaller
        }
        return false;
    }

    // ---- brute forces and helpers
    static int[][] zeroesBrute(int[][] m) {
        int R = m.length, C = m[0].length;
        boolean[] rows = new boolean[R], cols = new boolean[C];
        for (int r = 0; r < R; r++) for (int c = 0; c < C; c++) if (m[r][c] == 0) { rows[r] = true; cols[c] = true; }
        int[][] out = copy(m);
        for (int r = 0; r < R; r++) for (int c = 0; c < C; c++) if (rows[r] || cols[c]) out[r][c] = 0;
        return out;
    }

    static int[][] lifeBrute(int[][] b) {
        int R = b.length, C = b[0].length;
        int[][] out = new int[R][C];
        for (int r = 0; r < R; r++) for (int c = 0; c < C; c++) {
            int live = 0;
            for (int dr = -1; dr <= 1; dr++) for (int dc = -1; dc <= 1; dc++) {
                int nr = r + dr, nc = c + dc;
                if ((dr != 0 || dc != 0) && nr >= 0 && nc >= 0 && nr < R && nc < C) live += b[nr][nc];
            }
            out[r][c] = (b[r][c] == 1 && (live == 2 || live == 3)) || (b[r][c] == 0 && live == 3) ? 1 : 0;
        }
        return out;
    }

    static int[][] sortedMatrix(Random rnd, int R, int C) {
        int[][] m = new int[R][C];
        for (int r = 0; r < R; r++) for (int c = 0; c < C; c++) {
            int base = Math.max(r > 0 ? m[r - 1][c] : 0, c > 0 ? m[r][c - 1] : 0);
            m[r][c] = base + rnd.nextInt(3);
        }
        return m;
    }

    static int[][] copy(int[][] m) {
        int[][] c = new int[m.length][];
        for (int i = 0; i < m.length; i++) c[i] = m[i].clone();
        return c;
    }
}

final class Check {
    private static int passed;
    static void that(boolean cond, String what) { if (!cond) throw new AssertionError("FAILED: " + what); passed++; }
    static void done(String name) { System.out.println("✓ " + name + ": " + passed + " checks passed"); }
}
