export default [
  {
    slug: 'flood-fill', title: 'Flood Fill', level: 'Easy',
    summary: 'Starting at (sr, sc), recolour that pixel and every pixel connected to it 4-directionally with the same original colour. Return the image.',
    method: 'floodFill', params: [['int[][]', 'image'], ['int', 'sr'], ['int', 'sc'], ['int', 'color']], returns: 'int[][]',
    tests: [
      { in: [[[1, 1, 1], [1, 1, 0], [1, 0, 1]], 1, 1, 2], out: [[2, 2, 2], [2, 2, 0], [2, 0, 1]] },
      { in: [[[0, 0, 0], [0, 0, 0]], 0, 0, 0], out: [[0, 0, 0], [0, 0, 0]] },
      { in: [[[5]], 0, 0, 3] },
      { in: [[[1, 2, 1], [2, 1, 2], [1, 2, 1]], 1, 1, 7] },
    ],
    ref: `class Solution {
    public int[][] floodFill(int[][] image, int sr, int sc, int color) {
        if (image[sr][sc] != color) fill(image, sr, sc, image[sr][sc], color);
        return image;
    }
    private void fill(int[][] g, int r, int c, int from, int to) {
        if (r < 0 || c < 0 || r >= g.length || c >= g[0].length || g[r][c] != from) return;
        g[r][c] = to;
        fill(g, r + 1, c, from, to); fill(g, r - 1, c, from, to); fill(g, r, c + 1, from, to); fill(g, r, c - 1, from, to);
    }
}`,
  },
  {
    slug: 'number-of-islands', title: 'Number of Islands', level: 'Medium',
    summary: 'Count the islands in a grid of "1" (land) and "0" (water); land connects horizontally and vertically.',
    method: 'numIslands', params: [['char[][]', 'grid']], returns: 'int',
    tests: [
      { in: [[['1', '1', '1', '1', '0'], ['1', '1', '0', '1', '0'], ['1', '1', '0', '0', '0'], ['0', '0', '0', '0', '0']]], out: 1 },
      { in: [[['1', '1', '0', '0', '0'], ['1', '1', '0', '0', '0'], ['0', '0', '1', '0', '0'], ['0', '0', '0', '1', '1']]], out: 3 },
      { in: [[['0']]] },
      { in: [[['1', '0', '1'], ['0', '1', '0'], ['1', '0', '1']]] },
    ],
    ref: `class Solution {
    public int numIslands(char[][] grid) {
        int count = 0;
        for (int i = 0; i < grid.length; i++) for (int j = 0; j < grid[0].length; j++) if (grid[i][j] == '1') { count++; sink(grid, i, j); }
        return count;
    }
    private void sink(char[][] g, int i, int j) {
        if (i < 0 || j < 0 || i >= g.length || j >= g[0].length || g[i][j] != '1') return;
        g[i][j] = '0';
        sink(g, i + 1, j); sink(g, i - 1, j); sink(g, i, j + 1); sink(g, i, j - 1);
    }
}`,
  },
  {
    slug: 'max-area-of-island', title: 'Max Area of Island', level: 'Medium',
    summary: 'In a 0/1 grid, return the area (cell count) of the largest island of 1s connected 4-directionally, or 0.',
    method: 'maxAreaOfIsland', params: [['int[][]', 'grid']], returns: 'int',
    tests: [
      { in: [[[0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0], [0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0], [0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0], [0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0]]], out: 6 },
      { in: [[[0, 0, 0, 0, 0, 0, 0, 0]]], out: 0 },
      { in: [[[1]]] },
      { in: [[[1, 1], [1, 0]]] },
    ],
    ref: `class Solution {
    public int maxAreaOfIsland(int[][] grid) {
        int best = 0;
        for (int i = 0; i < grid.length; i++) for (int j = 0; j < grid[0].length; j++) best = Math.max(best, area(grid, i, j));
        return best;
    }
    private int area(int[][] g, int i, int j) {
        if (i < 0 || j < 0 || i >= g.length || j >= g[0].length || g[i][j] != 1) return 0;
        g[i][j] = 0;
        return 1 + area(g, i + 1, j) + area(g, i - 1, j) + area(g, i, j + 1) + area(g, i, j - 1);
    }
}`,
  },
  {
    slug: 'number-of-provinces', title: 'Number of Provinces', level: 'Medium',
    summary: 'isConnected[i][j] = 1 when cities i and j are directly connected. A province is a group of cities connected directly or indirectly. Count the provinces.',
    method: 'findCircleNum', params: [['int[][]', 'isConnected']], returns: 'int',
    tests: [
      { in: [[[1, 1, 0], [1, 1, 0], [0, 0, 1]]], out: 2 },
      { in: [[[1, 0, 0], [0, 1, 0], [0, 0, 1]]], out: 3 },
      { in: [[[1]]] },
      { in: [[[1, 0, 0, 1], [0, 1, 1, 0], [0, 1, 1, 1], [1, 0, 1, 1]]] },
    ],
    ref: `class Solution {
    public int findCircleNum(int[][] g) {
        int n = g.length, count = 0;
        boolean[] seen = new boolean[n];
        for (int i = 0; i < n; i++) if (!seen[i]) { count++; dfs(g, i, seen); }
        return count;
    }
    private void dfs(int[][] g, int i, boolean[] seen) { seen[i] = true; for (int j = 0; j < g.length; j++) if (g[i][j] == 1 && !seen[j]) dfs(g, j, seen); }
}`,
  },
  {
    slug: 'clone-graph', title: 'Clone Graph', level: 'Medium',
    summary: 'Return a deep copy of a connected undirected graph given one of its nodes (node values are 1..n). Tests describe the graph as an adjacency list; the judge prints your copy\'s adjacency list and rejects copies that reuse original nodes.',
    method: 'cloneGraph', params: [['Node', 'node']], returns: 'Node', uses: ['GraphNode'],
    call: 'Node orig = BCBG.build($0); Object r = BCBG.dump(s.cloneGraph(orig), orig);',
    tests: [
      { in: [[[2, 4], [1, 3], [2, 4], [1, 3]]], out: [[2, 4], [1, 3], [2, 4], [1, 3]] },
      { in: [[[]]], out: [[]] },
      { in: [[]], out: [] },
      { in: [[[2], [1, 3], [2]]] },
    ],
    ref: `class Solution {
    private final Map<Node, Node> copies = new HashMap<>();
    public Node cloneGraph(Node node) {
        if (node == null) return null;
        Node c = copies.get(node);
        if (c != null) return c;
        c = new Node(node.val);
        copies.put(node, c);
        for (Node n : node.neighbors) c.neighbors.add(cloneGraph(n));
        return c;
    }
}`,
  },
  {
    slug: 'rotting-oranges', title: 'Rotting Oranges', level: 'Medium',
    summary: 'Each minute, fresh oranges (1) next to rotten ones (2) rot. Return the minutes until no fresh orange remains, or -1 if some never rot.',
    method: 'orangesRotting', params: [['int[][]', 'grid']], returns: 'int',
    tests: [
      { in: [[[2, 1, 1], [1, 1, 0], [0, 1, 1]]], out: 4 },
      { in: [[[2, 1, 1], [0, 1, 1], [1, 0, 1]]], out: -1 },
      { in: [[[0, 2]]], out: 0 },
      { in: [[[0]]] },
      { in: [[[2, 1, 1, 1, 2]]] },
    ],
    ref: `class Solution {
    public int orangesRotting(int[][] grid) {
        Deque<int[]> q = new ArrayDeque<>();
        int fresh = 0, minutes = 0;
        for (int i = 0; i < grid.length; i++) for (int j = 0; j < grid[0].length; j++) { if (grid[i][j] == 2) q.add(new int[] { i, j }); else if (grid[i][j] == 1) fresh++; }
        int[][] dirs = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } };
        while (!q.isEmpty() && fresh > 0) {
            minutes++;
            for (int k = q.size(); k > 0; k--) {
                int[] c = q.poll();
                for (int[] d : dirs) {
                    int r = c[0] + d[0], s = c[1] + d[1];
                    if (r >= 0 && s >= 0 && r < grid.length && s < grid[0].length && grid[r][s] == 1) { grid[r][s] = 2; fresh--; q.add(new int[] { r, s }); }
                }
            }
        }
        return fresh == 0 ? minutes : -1;
    }
}`,
  },
  {
    slug: '01-matrix', title: '01 Matrix', level: 'Medium',
    summary: 'For each cell of a 0/1 matrix, return the distance (in 4-directional steps) to the nearest 0.',
    method: 'updateMatrix', params: [['int[][]', 'mat']], returns: 'int[][]',
    tests: [
      { in: [[[0, 0, 0], [0, 1, 0], [0, 0, 0]]], out: [[0, 0, 0], [0, 1, 0], [0, 0, 0]] },
      { in: [[[0, 0, 0], [0, 1, 0], [1, 1, 1]]], out: [[0, 0, 0], [0, 1, 0], [1, 2, 1]] },
      { in: [[[0]]] },
      { in: [[[1, 1, 1, 0]]] },
    ],
    ref: `class Solution {
    public int[][] updateMatrix(int[][] mat) {
        int r = mat.length, c = mat[0].length;
        int[][] dist = new int[r][c];
        Deque<int[]> q = new ArrayDeque<>();
        for (int i = 0; i < r; i++) for (int j = 0; j < c; j++) { if (mat[i][j] == 0) q.add(new int[] { i, j }); else dist[i][j] = -1; }
        int[][] dirs = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } };
        while (!q.isEmpty()) {
            int[] p = q.poll();
            for (int[] d : dirs) {
                int a = p[0] + d[0], b = p[1] + d[1];
                if (a >= 0 && b >= 0 && a < r && b < c && dist[a][b] == -1) { dist[a][b] = dist[p[0]][p[1]] + 1; q.add(new int[] { a, b }); }
            }
        }
        return dist;
    }
}`,
  },
  {
    slug: 'shortest-path-in-binary-matrix', title: 'Shortest Path in Binary Matrix', level: 'Medium',
    summary: 'Return the length (in cells) of the shortest path of 0s from the top-left to the bottom-right cell moving in 8 directions, or -1.',
    method: 'shortestPathBinaryMatrix', params: [['int[][]', 'grid']], returns: 'int',
    tests: [
      { in: [[[0, 1], [1, 0]]], out: 2 },
      { in: [[[0, 0, 0], [1, 1, 0], [1, 1, 0]]], out: 4 },
      { in: [[[1, 0, 0], [1, 1, 0], [1, 1, 0]]], out: -1 },
      { in: [[[0]]] },
      { in: [[[0, 1, 1], [1, 1, 1], [1, 1, 0]]] },
    ],
    ref: `class Solution {
    public int shortestPathBinaryMatrix(int[][] grid) {
        int n = grid.length;
        if (grid[0][0] != 0 || grid[n - 1][n - 1] != 0) return -1;
        Deque<int[]> q = new ArrayDeque<>();
        q.add(new int[] { 0, 0 }); grid[0][0] = 1;
        for (int len = 1; !q.isEmpty(); len++) {
            for (int k = q.size(); k > 0; k--) {
                int[] p = q.poll();
                if (p[0] == n - 1 && p[1] == n - 1) return len;
                for (int dr = -1; dr <= 1; dr++) for (int dc = -1; dc <= 1; dc++) {
                    int r = p[0] + dr, c = p[1] + dc;
                    if (r >= 0 && c >= 0 && r < n && c < n && grid[r][c] == 0) { grid[r][c] = 1; q.add(new int[] { r, c }); }
                }
            }
        }
        return -1;
    }
}`,
  },
  {
    slug: 'surrounded-regions', title: 'Surrounded Regions', level: 'Medium',
    summary: 'Flip every region of "O" that is completely surrounded by "X" (not connected to the border) into "X", in place. The judge prints the board after your call.',
    method: 'solve', params: [['char[][]', 'board']], returns: 'void', output: 0,
    tests: [
      { in: [[['X', 'X', 'X', 'X'], ['X', 'O', 'O', 'X'], ['X', 'X', 'O', 'X'], ['X', 'O', 'X', 'X']]], out: [['X', 'X', 'X', 'X'], ['X', 'X', 'X', 'X'], ['X', 'X', 'X', 'X'], ['X', 'O', 'X', 'X']] },
      { in: [[['X']]], out: [['X']] },
      { in: [[['O', 'O'], ['O', 'O']]] },
      { in: [[['X', 'O', 'X'], ['O', 'X', 'O'], ['X', 'O', 'X']]] },
    ],
    ref: `class Solution {
    public void solve(char[][] b) {
        int r = b.length, c = b[0].length;
        for (int i = 0; i < r; i++) { mark(b, i, 0); mark(b, i, c - 1); }
        for (int j = 0; j < c; j++) { mark(b, 0, j); mark(b, r - 1, j); }
        for (int i = 0; i < r; i++) for (int j = 0; j < c; j++) b[i][j] = b[i][j] == '#' ? 'O' : 'X';
    }
    private void mark(char[][] b, int i, int j) {
        if (i < 0 || j < 0 || i >= b.length || j >= b[0].length || b[i][j] != 'O') return;
        b[i][j] = '#';
        mark(b, i + 1, j); mark(b, i - 1, j); mark(b, i, j + 1); mark(b, i, j - 1);
    }
}`,
  },
  {
    slug: 'pacific-atlantic-water-flow', title: 'Pacific Atlantic Water Flow', level: 'Medium',
    summary: 'Water flows to a neighbour of equal or lower height. The Pacific touches the top and left edges, the Atlantic the bottom and right. Return every cell [r, c] whose water can reach both oceans, in any order.',
    method: 'pacificAtlantic', params: [['int[][]', 'heights']], returns: 'List<List<Integer>>', check: 'any-order',
    tests: [
      { in: [[[1, 2, 2, 3, 5], [3, 2, 3, 4, 4], [2, 4, 5, 3, 1], [6, 7, 1, 4, 5], [5, 1, 1, 2, 4]]], out: [[0, 4], [1, 3], [1, 4], [2, 2], [3, 0], [3, 1], [4, 0]] },
      { in: [[[1]]], out: [[0, 0]] },
      { in: [[[3, 3], [3, 3]]] },
      { in: [[[1, 2, 3], [8, 9, 4], [7, 6, 5]]] },
    ],
    ref: `class Solution {
    public List<List<Integer>> pacificAtlantic(int[][] h) {
        int r = h.length, c = h[0].length;
        boolean[][] pac = new boolean[r][c], atl = new boolean[r][c];
        for (int i = 0; i < r; i++) { climb(h, i, 0, pac, -1); climb(h, i, c - 1, atl, -1); }
        for (int j = 0; j < c; j++) { climb(h, 0, j, pac, -1); climb(h, r - 1, j, atl, -1); }
        List<List<Integer>> out = new ArrayList<>();
        for (int i = 0; i < r; i++) for (int j = 0; j < c; j++) if (pac[i][j] && atl[i][j]) out.add(Arrays.asList(i, j));
        return out;
    }
    private void climb(int[][] h, int i, int j, boolean[][] seen, int from) {
        if (i < 0 || j < 0 || i >= h.length || j >= h[0].length || seen[i][j] || h[i][j] < from) return;
        seen[i][j] = true;
        climb(h, i + 1, j, seen, h[i][j]); climb(h, i - 1, j, seen, h[i][j]); climb(h, i, j + 1, seen, h[i][j]); climb(h, i, j - 1, seen, h[i][j]);
    }
}`,
  },
  {
    slug: 'word-ladder', title: 'Word Ladder', level: 'Hard',
    summary: 'Change beginWord into endWord one letter at a time, every intermediate word being in wordList. Return the number of words in the shortest such sequence (including both ends), or 0.',
    method: 'ladderLength', params: [['String', 'beginWord'], ['String', 'endWord'], ['List<String>', 'wordList']], returns: 'int',
    tests: [
      { in: ['hit', 'cog', ['hot', 'dot', 'dog', 'lot', 'log', 'cog']], out: 5 },
      { in: ['hit', 'cog', ['hot', 'dot', 'dog', 'lot', 'log']], out: 0 },
      { in: ['a', 'c', ['a', 'b', 'c']] },
      { in: ['hot', 'dog', ['hot', 'dog']] },
      { in: ['lost', 'cost', ['most', 'fist', 'lost', 'cost', 'fish']] },
    ],
    ref: `class Solution {
    public int ladderLength(String beginWord, String endWord, List<String> wordList) {
        Set<String> words = new HashSet<>(wordList);
        if (!words.contains(endWord)) return 0;
        Deque<String> q = new ArrayDeque<>();
        q.add(beginWord); words.remove(beginWord);
        for (int len = 1; !q.isEmpty(); len++) {
            for (int k = q.size(); k > 0; k--) {
                String w = q.poll();
                if (w.equals(endWord)) return len;
                char[] cs = w.toCharArray();
                for (int i = 0; i < cs.length; i++) {
                    char orig = cs[i];
                    for (char ch = 'a'; ch <= 'z'; ch++) { cs[i] = ch; String n = new String(cs); if (words.remove(n)) q.add(n); }
                    cs[i] = orig;
                }
            }
        }
        return 0;
    }
}`,
  },
  {
    slug: 'island-perimeter', title: 'Island Perimeter', level: 'Easy',
    summary: 'grid has exactly one island of 1s (connected up/down/left/right, no lakes inside). Return the length of its perimeter.',
    method: 'islandPerimeter', params: [['int[][]', 'grid']], returns: 'int',
    tests: [
      { in: [[[0, 1, 0, 0], [1, 1, 1, 0], [0, 1, 0, 0], [1, 1, 0, 0]]], out: 16 },
      { in: [[[1]]], out: 4 },
      { in: [[[1, 0]]], out: 4 },
      { in: [[[1, 1], [1, 1]]] },
      { in: [[[0, 0, 0], [0, 1, 1], [0, 0, 1]]] },
      { in: [[[1, 1, 1, 1, 1]]] },
    ],
    ref: `class Solution {
    public int islandPerimeter(int[][] grid) {
        int land = 0, shared = 0;
        for (int r = 0; r < grid.length; r++)
            for (int c = 0; c < grid[0].length; c++) {
                if (grid[r][c] == 0) continue;
                land++;
                if (r + 1 < grid.length && grid[r + 1][c] == 1) shared++;
                if (c + 1 < grid[0].length && grid[r][c + 1] == 1) shared++;
            }
        return 4 * land - 2 * shared;
    }
}`,
  },
  {
    slug: 'find-the-town-judge', title: 'Find the Town Judge', level: 'Easy',
    summary: 'People are labelled 1..n; trust[i] = [a, b] means a trusts b. The town judge trusts nobody and is trusted by everyone else. Return the judge\'s label, or -1 if there is none.',
    method: 'findJudge', params: [['int', 'n'], ['int[][]', 'trust']], returns: 'int',
    tests: [
      { in: [2, [[1, 2]]], out: 2 },
      { in: [3, [[1, 3], [2, 3]]], out: 3 },
      { in: [3, [[1, 3], [2, 3], [3, 1]]], out: -1 },
      { in: [1, []] },
      { in: [2, []] },
      { in: [4, [[1, 3], [1, 4], [2, 3], [2, 4], [4, 3]]] },
      { in: [3, [[1, 2], [2, 3]]] },
    ],
    ref: `class Solution {
    public int findJudge(int n, int[][] trust) {
        int[] score = new int[n + 1];
        for (int[] t : trust) { score[t[0]]--; score[t[1]]++; }
        for (int i = 1; i <= n; i++) if (score[i] == n - 1) return i;
        return -1;
    }
}`,
  },
  {
    slug: 'walls-and-gates', title: 'Walls and Gates', level: 'Medium',
    summary: 'rooms holds -1 (wall), 0 (gate) or 2147483647 (empty room). Fill each empty room in place with the number of steps to its nearest gate, leaving it 2147483647 if no gate is reachable. The judge prints rooms after your call.',
    method: 'wallsAndGates', params: [['int[][]', 'rooms']], returns: 'void', output: 0,
    tests: [
      { in: [[[2147483647, -1, 0, 2147483647], [2147483647, 2147483647, 2147483647, -1], [2147483647, -1, 2147483647, -1], [0, -1, 2147483647, 2147483647]]], out: [[3, -1, 0, 1], [2, 2, 1, -1], [1, -1, 2, -1], [0, -1, 3, 4]] },
      { in: [[[-1]]], out: [[-1]] },
      { in: [[[2147483647]]] },
      { in: [[[0, 2147483647, 2147483647, 0]]] },
      { in: [[[2147483647, -1], [-1, 0]]] },
      { in: [[[0, -1, 2147483647], [2147483647, -1, 2147483647], [2147483647, 2147483647, 2147483647]]] },
    ],
    ref: `class Solution {
    public void wallsAndGates(int[][] rooms) {
        int m = rooms.length, n = rooms[0].length;
        Deque<int[]> q = new ArrayDeque<>();
        for (int r = 0; r < m; r++) for (int c = 0; c < n; c++) if (rooms[r][c] == 0) q.add(new int[] { r, c });
        int[][] dirs = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } };
        while (!q.isEmpty()) {
            int[] p = q.poll();
            for (int[] d : dirs) {
                int r = p[0] + d[0], c = p[1] + d[1];
                if (r < 0 || c < 0 || r >= m || c >= n || rooms[r][c] != Integer.MAX_VALUE) continue;
                rooms[r][c] = rooms[p[0]][p[1]] + 1;
                q.add(new int[] { r, c });
            }
        }
    }
}`,
  },
  {
    slug: 'open-the-lock', title: 'Open the Lock', level: 'Medium',
    summary: 'A lock has four wheels with digits 0–9 and starts at "0000". One move turns one wheel up or down by one (9 and 0 wrap around). Never landing on a deadend, return the fewest moves to reach target, or -1.',
    method: 'openLock', params: [['String[]', 'deadends'], ['String', 'target']], returns: 'int',
    tests: [
      { in: [['0201', '0101', '0102', '1212', '2002'], '0202'], out: 6 },
      { in: [['8888'], '0009'], out: 1 },
      { in: [['8887', '8889', '8878', '8898', '8788', '8988', '7888', '9888'], '8888'], out: -1 },
      { in: [['0000'], '8888'] },
      { in: [['1111'], '5555'] },
      { in: [['0001', '0010', '0100', '1000'], '0011'] },
      { in: [['0009', '0090', '0900', '9000', '0001', '0010', '0100'], '1000'] },
    ],
    ref: `class Solution {
    public int openLock(String[] deadends, String target) {
        Set<String> dead = new HashSet<>(Arrays.asList(deadends));
        if (dead.contains("0000")) return -1;
        Set<String> seen = new HashSet<>();
        Deque<String> q = new ArrayDeque<>();
        q.add("0000"); seen.add("0000");
        for (int steps = 0; !q.isEmpty(); steps++) {
            for (int size = q.size(); size > 0; size--) {
                String cur = q.poll();
                if (cur.equals(target)) return steps;
                char[] c = cur.toCharArray();
                for (int i = 0; i < 4; i++) {
                    char orig = c[i];
                    for (int d : new int[] { 1, 9 }) {
                        c[i] = (char) ('0' + (orig - '0' + d) % 10);
                        String next = new String(c);
                        if (!dead.contains(next) && seen.add(next)) q.add(next);
                    }
                    c[i] = orig;
                }
            }
        }
        return -1;
    }
}`,
  },
  {
    slug: 'evaluate-division', title: 'Evaluate Division', level: 'Medium',
    summary: 'equations[i] = [A, B] with values[i] means A / B = values[i]. Answer each query [C, D] with C / D, or -1.0 if it cannot be determined (including when a variable never appears).',
    method: 'calcEquation', params: [['List<List<String>>', 'equations'], ['double[]', 'values'], ['List<List<String>>', 'queries']], returns: 'double[]',
    tests: [
      { in: [[['a', 'b'], ['b', 'c']], [2.0, 3.0], [['a', 'c'], ['b', 'a'], ['a', 'e'], ['a', 'a'], ['x', 'x']]], out: [6.0, 0.5, -1.0, 1.0, -1.0] },
      { in: [[['a', 'b'], ['b', 'c'], ['bc', 'cd']], [1.5, 2.5, 5.0], [['a', 'c'], ['c', 'b'], ['bc', 'cd'], ['cd', 'bc']]], out: [3.75, 0.4, 5.0, 0.2] },
      { in: [[['a', 'b']], [0.5], [['a', 'b'], ['b', 'a'], ['a', 'c'], ['x', 'y']]], out: [0.5, 2.0, -1.0, -1.0] },
      { in: [[['x1', 'x2'], ['x2', 'x3'], ['x3', 'x4'], ['x4', 'x5']], [3.0, 4.0, 5.0, 6.0], [['x1', 'x5'], ['x5', 'x2'], ['x2', 'x4'], ['x2', 'x2'], ['x2', 'x9'], ['x9', 'x9']]] },
      { in: [[['a', 'b'], ['c', 'd']], [1.0, 1.0], [['a', 'c'], ['b', 'd'], ['b', 'a'], ['d', 'c']]] },
      { in: [[['a', 'aa']], [9.0], [['aa', 'a'], ['aa', 'aa']]] },
    ],
    ref: `class Solution {
    public double[] calcEquation(List<List<String>> equations, double[] values, List<List<String>> queries) {
        Map<String, Map<String, Double>> g = new HashMap<>();
        for (int i = 0; i < values.length; i++) {
            String a = equations.get(i).get(0), b = equations.get(i).get(1);
            g.computeIfAbsent(a, k -> new HashMap<>()).put(b, values[i]);
            g.computeIfAbsent(b, k -> new HashMap<>()).put(a, 1 / values[i]);
        }
        double[] out = new double[queries.size()];
        for (int q = 0; q < out.length; q++) {
            String c = queries.get(q).get(0), d = queries.get(q).get(1);
            out[q] = g.containsKey(c) && g.containsKey(d) ? dfs(g, c, d, new HashSet<>()) : -1.0;
        }
        return out;
    }
    private double dfs(Map<String, Map<String, Double>> g, String cur, String target, Set<String> seen) {
        if (cur.equals(target)) return 1.0;
        seen.add(cur);
        for (Map.Entry<String, Double> e : g.get(cur).entrySet()) {
            if (seen.contains(e.getKey())) continue;
            double r = dfs(g, e.getKey(), target, seen);
            if (r >= 0) return e.getValue() * r;
        }
        return -1.0;
    }
}`,
  },
  {
    slug: 'reconstruct-itinerary', title: 'Reconstruct Itinerary', level: 'Hard',
    summary: 'tickets[i] = [from, to]. Use every ticket exactly once in a trip starting at "JFK". If several itineraries work, return the one that is smallest in lexical order when read as a single string.',
    method: 'findItinerary', params: [['List<List<String>>', 'tickets']], returns: 'List<String>',
    tests: [
      { in: [[['MUC', 'LHR'], ['JFK', 'MUC'], ['SFO', 'SJC'], ['LHR', 'SFO']]], out: ['JFK', 'MUC', 'LHR', 'SFO', 'SJC'] },
      { in: [[['JFK', 'SFO'], ['JFK', 'ATL'], ['SFO', 'ATL'], ['ATL', 'JFK'], ['ATL', 'SFO']]], out: ['JFK', 'ATL', 'JFK', 'SFO', 'ATL', 'SFO'] },
      { in: [[['JFK', 'KUL'], ['JFK', 'NRT'], ['NRT', 'JFK']]] },
      { in: [[['JFK', 'AAA'], ['AAA', 'JFK'], ['JFK', 'AAA'], ['AAA', 'JFK']]] },
      { in: [[['JFK', 'ATL']]] },
      { in: [[['EZE', 'AXA'], ['TIA', 'ANU'], ['ANU', 'JFK'], ['JFK', 'ANU'], ['ANU', 'EZE'], ['TIA', 'ANU'], ['AXA', 'TIA'], ['TIA', 'JFK'], ['ANU', 'TIA'], ['JFK', 'TIA']]] },
    ],
    ref: `class Solution {
    public List<String> findItinerary(List<List<String>> tickets) {
        Map<String, PriorityQueue<String>> g = new HashMap<>();
        for (List<String> t : tickets) g.computeIfAbsent(t.get(0), k -> new PriorityQueue<>()).add(t.get(1));
        LinkedList<String> route = new LinkedList<>();
        Deque<String> st = new ArrayDeque<>();
        st.push("JFK");
        while (!st.isEmpty()) {
            PriorityQueue<String> out = g.get(st.peek());
            if (out != null && !out.isEmpty()) st.push(out.poll());
            else route.addFirst(st.pop());
        }
        return route;
    }
}`,
  },
];
