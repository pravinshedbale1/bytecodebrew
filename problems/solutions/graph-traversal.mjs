const r = String.raw;

export default {
  'flood-fill': {
    pattern: 'Grid DFS/BFS over connected cells of the same colour',
    approaches: [
      {
        level: 'Optimal', name: 'Recursive DFS',
        idea: 'Recolour the start pixel, then recursively recolour each of its four neighbours that still has the original colour. Recolouring as you go also marks pixels as visited.',
        steps: [
          'Let `old = image[sr][sc]`; if `old == color`, return the image unchanged (otherwise the fill would never stop).',
          '`fill(r, c)`: stop if out of bounds or `image[r][c] != old`; else set it to `color` and fill the four neighbours.',
          'Call `fill(sr, sc)` and return the image.',
        ],
        time: 'O(m·n)', space: 'O(m·n)',
        why: 'Each pixel is recoloured at most once. The recursion can be as deep as the number of pixels in the region.',
        code: {
          java: r`class Solution {
    public int[][] floodFill(int[][] image, int sr, int sc, int color) {
        int old = image[sr][sc];
        if (old != color) fill(image, sr, sc, old, color);
        return image;
    }

    private void fill(int[][] img, int r, int c, int old, int color) {
        if (r < 0 || c < 0 || r >= img.length || c >= img[0].length || img[r][c] != old) return;
        img[r][c] = color;
        fill(img, r + 1, c, old, color);
        fill(img, r - 1, c, old, color);
        fill(img, r, c + 1, old, color);
        fill(img, r, c - 1, old, color);
    }
}`,
          cpp: r`class Solution {
    void fill(vector<vector<int>>& img, int r, int c, int old, int color) {
        if (r < 0 || c < 0 || r >= (int) img.size() || c >= (int) img[0].size() || img[r][c] != old) return;
        img[r][c] = color;
        fill(img, r + 1, c, old, color);
        fill(img, r - 1, c, old, color);
        fill(img, r, c + 1, old, color);
        fill(img, r, c - 1, old, color);
    }
public:
    vector<vector<int>> floodFill(vector<vector<int>>& image, int sr, int sc, int color) {
        int old = image[sr][sc];
        if (old != color) fill(image, sr, sc, old, color);
        return image;
    }
};`,
          python: r`class Solution:
    def floodFill(self, image: List[List[int]], sr: int, sc: int, color: int) -> List[List[int]]:
        old = image[sr][sc]
        if old == color:
            return image
        m, n = len(image), len(image[0])
        def fill(r, c):
            if 0 <= r < m and 0 <= c < n and image[r][c] == old:
                image[r][c] = color
                fill(r + 1, c)
                fill(r - 1, c)
                fill(r, c + 1)
                fill(r, c - 1)
        fill(sr, sc)
        return image`,
          javascript: r`var floodFill = function(image, sr, sc, color) {
    const old = image[sr][sc], m = image.length, n = image[0].length;
    if (old === color) return image;
    const fill = (r, c) => {
        if (r < 0 || c < 0 || r >= m || c >= n || image[r][c] !== old) return;
        image[r][c] = color;
        fill(r + 1, c);
        fill(r - 1, c);
        fill(r, c + 1);
        fill(r, c - 1);
    };
    fill(sr, sc);
    return image;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Iterative BFS with a queue',
        idea: 'The same fill without recursion: recolour a pixel when it is added to the queue, then process its neighbours.',
        steps: [
          'If the colour is unchanged, return. Recolour `(sr, sc)` and queue it.',
          'Pop a pixel; for each neighbour inside the image with the original colour, recolour it and queue it.',
          'Return the image when the queue is empty.',
        ],
        time: 'O(m·n)', space: 'O(m·n)',
        why: 'Each pixel enters the queue at most once. No recursion, so large regions cannot overflow the call stack.',
        code: {
          java: r`class Solution {
    public int[][] floodFill(int[][] image, int sr, int sc, int color) {
        int old = image[sr][sc], m = image.length, n = image[0].length;
        if (old == color) return image;
        int[][] dirs = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } };
        Deque<int[]> queue = new ArrayDeque<>();
        image[sr][sc] = color;
        queue.add(new int[] { sr, sc });
        while (!queue.isEmpty()) {
            int[] cell = queue.poll();
            for (int[] d : dirs) {
                int r = cell[0] + d[0], c = cell[1] + d[1];
                if (r >= 0 && c >= 0 && r < m && c < n && image[r][c] == old) {
                    image[r][c] = color;
                    queue.add(new int[] { r, c });
                }
            }
        }
        return image;
    }
}`,
          cpp: r`class Solution {
public:
    vector<vector<int>> floodFill(vector<vector<int>>& image, int sr, int sc, int color) {
        int old = image[sr][sc], m = image.size(), n = image[0].size();
        if (old == color) return image;
        int dr[] = {1, -1, 0, 0}, dc[] = {0, 0, 1, -1};
        queue<pair<int, int>> q;
        image[sr][sc] = color;
        q.push({sr, sc});
        while (!q.empty()) {
            auto [r0, c0] = q.front();
            q.pop();
            for (int k = 0; k < 4; k++) {
                int r = r0 + dr[k], c = c0 + dc[k];
                if (r >= 0 && c >= 0 && r < m && c < n && image[r][c] == old) {
                    image[r][c] = color;
                    q.push({r, c});
                }
            }
        }
        return image;
    }
};`,
          python: r`class Solution:
    def floodFill(self, image: List[List[int]], sr: int, sc: int, color: int) -> List[List[int]]:
        old = image[sr][sc]
        if old == color:
            return image
        m, n = len(image), len(image[0])
        image[sr][sc] = color
        queue = deque([(sr, sc)])
        while queue:
            r0, c0 = queue.popleft()
            for r, c in ((r0 + 1, c0), (r0 - 1, c0), (r0, c0 + 1), (r0, c0 - 1)):
                if 0 <= r < m and 0 <= c < n and image[r][c] == old:
                    image[r][c] = color
                    queue.append((r, c))
        return image`,
          javascript: r`var floodFill = function(image, sr, sc, color) {
    const old = image[sr][sc], m = image.length, n = image[0].length;
    if (old === color) return image;
    image[sr][sc] = color;
    const queue = [[sr, sc]];
    for (let h = 0; h < queue.length; h++) {
        const [r0, c0] = queue[h];
        for (const [r, c] of [[r0 + 1, c0], [r0 - 1, c0], [r0, c0 + 1], [r0, c0 - 1]]) {
            if (r >= 0 && c >= 0 && r < m && c < n && image[r][c] === old) {
                image[r][c] = color;
                queue.push([r, c]);
            }
        }
    }
    return image;
};`,
        },
      },
    ],
  },

  'number-of-islands': {
    pattern: 'Count connected components on a grid: start a search at each unvisited land cell',
    approaches: [
      {
        level: 'Optimal', name: 'DFS that sinks each island',
        idea: 'Scan the grid. Each time you meet land that has not been visited, that is a new island: count it, then flood it (turn its cells to water) so none of its cells start another count.',
        steps: [
          'For each cell with `\'1\'`: increase the count and call `sink(r, c)`.',
          '`sink`: stop if out of bounds or not land; otherwise set the cell to `\'0\'` and sink the four neighbours.',
          'Return the count.',
        ],
        time: 'O(m·n)', space: 'O(m·n)',
        why: 'Each cell is sunk at most once. The recursion can go as deep as the largest island (up to m·n cells). The grid is modified; copy it first if that matters.',
        code: {
          java: r`class Solution {
    public int numIslands(char[][] grid) {
        int count = 0;
        for (int r = 0; r < grid.length; r++)
            for (int c = 0; c < grid[0].length; c++)
                if (grid[r][c] == '1') { count++; sink(grid, r, c); }
        return count;
    }

    private void sink(char[][] g, int r, int c) {
        if (r < 0 || c < 0 || r >= g.length || c >= g[0].length || g[r][c] != '1') return;
        g[r][c] = '0';
        sink(g, r + 1, c);
        sink(g, r - 1, c);
        sink(g, r, c + 1);
        sink(g, r, c - 1);
    }
}`,
          cpp: r`class Solution {
    void sink(vector<vector<char>>& g, int r, int c) {
        if (r < 0 || c < 0 || r >= (int) g.size() || c >= (int) g[0].size() || g[r][c] != '1') return;
        g[r][c] = '0';
        sink(g, r + 1, c);
        sink(g, r - 1, c);
        sink(g, r, c + 1);
        sink(g, r, c - 1);
    }
public:
    int numIslands(vector<vector<char>>& grid) {
        int count = 0;
        for (int r = 0; r < (int) grid.size(); r++)
            for (int c = 0; c < (int) grid[0].size(); c++)
                if (grid[r][c] == '1') { count++; sink(grid, r, c); }
        return count;
    }
};`,
          python: r`class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        m, n = len(grid), len(grid[0])
        def sink(r, c):
            if 0 <= r < m and 0 <= c < n and grid[r][c] == "1":
                grid[r][c] = "0"
                sink(r + 1, c)
                sink(r - 1, c)
                sink(r, c + 1)
                sink(r, c - 1)
        count = 0
        for r in range(m):
            for c in range(n):
                if grid[r][c] == "1":
                    count += 1
                    sink(r, c)
        return count`,
          javascript: r`var numIslands = function(grid) {
    const m = grid.length, n = grid[0].length;
    const sink = (r, c) => {
        if (r < 0 || c < 0 || r >= m || c >= n || grid[r][c] !== '1') return;
        grid[r][c] = '0';
        sink(r + 1, c);
        sink(r - 1, c);
        sink(r, c + 1);
        sink(r, c - 1);
    };
    let count = 0;
    for (let r = 0; r < m; r++)
        for (let c = 0; c < n; c++)
            if (grid[r][c] === '1') { count++; sink(r, c); }
    return count;
};`,
        },
      },
      {
        level: 'Optimal', name: 'BFS from each new island',
        idea: 'The same counting, exploring each island with a queue instead of recursion, which is safe even for one huge island.',
        steps: [
          'For each `\'1\'` cell: count it, set it to `\'0\'` and queue it.',
          'While the queue is not empty, pop a cell and queue every neighbouring `\'1\'`, setting it to `\'0\'` when queued.',
          'Return the count.',
        ],
        time: 'O(m·n)', space: 'O(min(m, n))',
        why: 'Each cell is queued at most once. A BFS frontier on a grid stays roughly as wide as the smaller dimension.',
        code: {
          java: r`class Solution {
    public int numIslands(char[][] grid) {
        int m = grid.length, n = grid[0].length, count = 0;
        int[][] dirs = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } };
        Deque<int[]> queue = new ArrayDeque<>();
        for (int r0 = 0; r0 < m; r0++)
            for (int c0 = 0; c0 < n; c0++) {
                if (grid[r0][c0] != '1') continue;
                count++;
                grid[r0][c0] = '0';
                queue.add(new int[] { r0, c0 });
                while (!queue.isEmpty()) {
                    int[] cell = queue.poll();
                    for (int[] d : dirs) {
                        int r = cell[0] + d[0], c = cell[1] + d[1];
                        if (r >= 0 && c >= 0 && r < m && c < n && grid[r][c] == '1') {
                            grid[r][c] = '0';
                            queue.add(new int[] { r, c });
                        }
                    }
                }
            }
        return count;
    }
}`,
          cpp: r`class Solution {
public:
    int numIslands(vector<vector<char>>& grid) {
        int m = grid.size(), n = grid[0].size(), count = 0;
        int dr[] = {1, -1, 0, 0}, dc[] = {0, 0, 1, -1};
        queue<pair<int, int>> q;
        for (int r0 = 0; r0 < m; r0++)
            for (int c0 = 0; c0 < n; c0++) {
                if (grid[r0][c0] != '1') continue;
                count++;
                grid[r0][c0] = '0';
                q.push({r0, c0});
                while (!q.empty()) {
                    auto [r1, c1] = q.front();
                    q.pop();
                    for (int k = 0; k < 4; k++) {
                        int r = r1 + dr[k], c = c1 + dc[k];
                        if (r >= 0 && c >= 0 && r < m && c < n && grid[r][c] == '1') {
                            grid[r][c] = '0';
                            q.push({r, c});
                        }
                    }
                }
            }
        return count;
    }
};`,
          python: r`class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        m, n, count = len(grid), len(grid[0]), 0
        for r0 in range(m):
            for c0 in range(n):
                if grid[r0][c0] != "1":
                    continue
                count += 1
                grid[r0][c0] = "0"
                queue = deque([(r0, c0)])
                while queue:
                    r1, c1 = queue.popleft()
                    for r, c in ((r1 + 1, c1), (r1 - 1, c1), (r1, c1 + 1), (r1, c1 - 1)):
                        if 0 <= r < m and 0 <= c < n and grid[r][c] == "1":
                            grid[r][c] = "0"
                            queue.append((r, c))
        return count`,
          javascript: r`var numIslands = function(grid) {
    const m = grid.length, n = grid[0].length;
    let count = 0;
    for (let r0 = 0; r0 < m; r0++)
        for (let c0 = 0; c0 < n; c0++) {
            if (grid[r0][c0] !== '1') continue;
            count++;
            grid[r0][c0] = '0';
            const queue = [[r0, c0]];
            for (let h = 0; h < queue.length; h++) {
                const [r1, c1] = queue[h];
                for (const [r, c] of [[r1 + 1, c1], [r1 - 1, c1], [r1, c1 + 1], [r1, c1 - 1]]) {
                    if (r >= 0 && c >= 0 && r < m && c < n && grid[r][c] === '1') {
                        grid[r][c] = '0';
                        queue.push([r, c]);
                    }
                }
            }
        }
    return count;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Union–Find over land cells',
        idea: 'Treat every land cell as its own set and union it with its land neighbours to the right and below. Each successful union merges two islands, so islands = land cells − successful unions.',
        steps: [
          'Give each cell an id `r·n + c`; count land cells into `islands`.',
          'For each land cell, union it with the land cell to its right and the one below; whenever two different sets merge, decrease `islands`.',
          'Return `islands`.',
        ],
        time: 'O(m·n·α(m·n))', space: 'O(m·n)',
        why: 'About 2·m·n union operations, each nearly O(1) with path compression and union by size. The parent array has one entry per cell. Useful when land is added over time (Number of Islands II).',
        code: {
          java: r`class Solution {
    private int[] parent, size;

    public int numIslands(char[][] grid) {
        int m = grid.length, n = grid[0].length, islands = 0;
        parent = new int[m * n];
        size = new int[m * n];
        for (int i = 0; i < m * n; i++) { parent[i] = i; size[i] = 1; }
        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++) {
                if (grid[r][c] != '1') continue;
                islands++;
                if (c + 1 < n && grid[r][c + 1] == '1' && union(r * n + c, r * n + c + 1)) islands--;
                if (r + 1 < m && grid[r + 1][c] == '1' && union(r * n + c, (r + 1) * n + c)) islands--;
            }
        return islands;
    }

    private int find(int x) {
        while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    }

    private boolean union(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;
        if (size[a] < size[b]) { int t = a; a = b; b = t; }
        parent[b] = a;
        size[a] += size[b];
        return true;
    }
}`,
          cpp: r`class Solution {
    vector<int> parent, sz;
    int find(int x) {
        while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    }
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;
        if (sz[a] < sz[b]) swap(a, b);
        parent[b] = a;
        sz[a] += sz[b];
        return true;
    }
public:
    int numIslands(vector<vector<char>>& grid) {
        int m = grid.size(), n = grid[0].size(), islands = 0;
        parent.resize(m * n);
        sz.assign(m * n, 1);
        iota(parent.begin(), parent.end(), 0);
        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++) {
                if (grid[r][c] != '1') continue;
                islands++;
                if (c + 1 < n && grid[r][c + 1] == '1' && unite(r * n + c, r * n + c + 1)) islands--;
                if (r + 1 < m && grid[r + 1][c] == '1' && unite(r * n + c, (r + 1) * n + c)) islands--;
            }
        return islands;
    }
};`,
          python: r`class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        m, n = len(grid), len(grid[0])
        parent = list(range(m * n))
        size = [1] * (m * n)
        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x
        def union(a, b):
            a, b = find(a), find(b)
            if a == b:
                return False
            if size[a] < size[b]:
                a, b = b, a
            parent[b] = a
            size[a] += size[b]
            return True
        islands = 0
        for r in range(m):
            for c in range(n):
                if grid[r][c] != "1":
                    continue
                islands += 1
                if c + 1 < n and grid[r][c + 1] == "1" and union(r * n + c, r * n + c + 1):
                    islands -= 1
                if r + 1 < m and grid[r + 1][c] == "1" and union(r * n + c, (r + 1) * n + c):
                    islands -= 1
        return islands`,
          javascript: r`var numIslands = function(grid) {
    const m = grid.length, n = grid[0].length;
    const parent = Array.from({ length: m * n }, (_, i) => i), size = new Array(m * n).fill(1);
    const find = (x) => {
        while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    };
    const union = (a, b) => {
        a = find(a); b = find(b);
        if (a === b) return false;
        if (size[a] < size[b]) [a, b] = [b, a];
        parent[b] = a;
        size[a] += size[b];
        return true;
    };
    let islands = 0;
    for (let r = 0; r < m; r++)
        for (let c = 0; c < n; c++) {
            if (grid[r][c] !== '1') continue;
            islands++;
            if (c + 1 < n && grid[r][c + 1] === '1' && union(r * n + c, r * n + c + 1)) islands--;
            if (r + 1 < m && grid[r + 1][c] === '1' && union(r * n + c, (r + 1) * n + c)) islands--;
        }
    return islands;
};`,
        },
      },
    ],
  },

  'max-area-of-island': {
    pattern: 'Grid DFS returning the size of each connected component',
    approaches: [
      {
        level: 'Optimal', name: 'DFS that returns the area it sinks',
        idea: 'Like counting islands, but each search returns how many cells it visited: 1 for the cell itself plus the areas found through its four neighbours.',
        steps: [
          '`area(r, c)`: return 0 if out of bounds or water; otherwise set the cell to 0 and return `1 + area(4 neighbours)`.',
          'Call `area` from every cell and keep the maximum.',
        ],
        time: 'O(m·n)', space: 'O(m·n)',
        why: 'Each land cell is counted once; the recursion can be as deep as the largest island.',
        code: {
          java: r`class Solution {
    public int maxAreaOfIsland(int[][] grid) {
        int best = 0;
        for (int r = 0; r < grid.length; r++)
            for (int c = 0; c < grid[0].length; c++) best = Math.max(best, area(grid, r, c));
        return best;
    }

    private int area(int[][] g, int r, int c) {
        if (r < 0 || c < 0 || r >= g.length || c >= g[0].length || g[r][c] != 1) return 0;
        g[r][c] = 0;
        return 1 + area(g, r + 1, c) + area(g, r - 1, c) + area(g, r, c + 1) + area(g, r, c - 1);
    }
}`,
          cpp: r`class Solution {
    int area(vector<vector<int>>& g, int r, int c) {
        if (r < 0 || c < 0 || r >= (int) g.size() || c >= (int) g[0].size() || g[r][c] != 1) return 0;
        g[r][c] = 0;
        return 1 + area(g, r + 1, c) + area(g, r - 1, c) + area(g, r, c + 1) + area(g, r, c - 1);
    }
public:
    int maxAreaOfIsland(vector<vector<int>>& grid) {
        int best = 0;
        for (int r = 0; r < (int) grid.size(); r++)
            for (int c = 0; c < (int) grid[0].size(); c++) best = max(best, area(grid, r, c));
        return best;
    }
};`,
          python: r`class Solution:
    def maxAreaOfIsland(self, grid: List[List[int]]) -> int:
        m, n = len(grid), len(grid[0])
        def area(r, c):
            if not (0 <= r < m and 0 <= c < n) or grid[r][c] != 1:
                return 0
            grid[r][c] = 0
            return 1 + area(r + 1, c) + area(r - 1, c) + area(r, c + 1) + area(r, c - 1)
        return max(area(r, c) for r in range(m) for c in range(n))`,
          javascript: r`var maxAreaOfIsland = function(grid) {
    const m = grid.length, n = grid[0].length;
    const area = (r, c) => {
        if (r < 0 || c < 0 || r >= m || c >= n || grid[r][c] !== 1) return 0;
        grid[r][c] = 0;
        return 1 + area(r + 1, c) + area(r - 1, c) + area(r, c + 1) + area(r, c - 1);
    };
    let best = 0;
    for (let r = 0; r < m; r++)
        for (let c = 0; c < n; c++) best = Math.max(best, area(r, c));
    return best;
};`,
        },
      },
      {
        level: 'Optimal', name: 'BFS counting cells per island',
        idea: 'Explore each island with a queue and count the cells popped.',
        steps: [
          'For each land cell: set it to 0, queue it, and set `size = 0`.',
          'Pop cells, counting each; queue land neighbours (setting them to 0 when queued).',
          'Keep the largest `size`.',
        ],
        time: 'O(m·n)', space: 'O(m·n)',
        why: 'Each cell is queued once; no recursion depth to worry about.',
        code: {
          java: r`class Solution {
    public int maxAreaOfIsland(int[][] grid) {
        int m = grid.length, n = grid[0].length, best = 0;
        int[][] dirs = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } };
        Deque<int[]> queue = new ArrayDeque<>();
        for (int r0 = 0; r0 < m; r0++)
            for (int c0 = 0; c0 < n; c0++) {
                if (grid[r0][c0] != 1) continue;
                grid[r0][c0] = 0;
                queue.add(new int[] { r0, c0 });
                int size = 0;
                while (!queue.isEmpty()) {
                    int[] cell = queue.poll();
                    size++;
                    for (int[] d : dirs) {
                        int r = cell[0] + d[0], c = cell[1] + d[1];
                        if (r >= 0 && c >= 0 && r < m && c < n && grid[r][c] == 1) {
                            grid[r][c] = 0;
                            queue.add(new int[] { r, c });
                        }
                    }
                }
                best = Math.max(best, size);
            }
        return best;
    }
}`,
          cpp: r`class Solution {
public:
    int maxAreaOfIsland(vector<vector<int>>& grid) {
        int m = grid.size(), n = grid[0].size(), best = 0;
        int dr[] = {1, -1, 0, 0}, dc[] = {0, 0, 1, -1};
        for (int r0 = 0; r0 < m; r0++)
            for (int c0 = 0; c0 < n; c0++) {
                if (grid[r0][c0] != 1) continue;
                grid[r0][c0] = 0;
                queue<pair<int, int>> q;
                q.push({r0, c0});
                int size = 0;
                while (!q.empty()) {
                    auto [r1, c1] = q.front();
                    q.pop();
                    size++;
                    for (int k = 0; k < 4; k++) {
                        int r = r1 + dr[k], c = c1 + dc[k];
                        if (r >= 0 && c >= 0 && r < m && c < n && grid[r][c] == 1) {
                            grid[r][c] = 0;
                            q.push({r, c});
                        }
                    }
                }
                best = max(best, size);
            }
        return best;
    }
};`,
          python: r`class Solution:
    def maxAreaOfIsland(self, grid: List[List[int]]) -> int:
        m, n, best = len(grid), len(grid[0]), 0
        for r0 in range(m):
            for c0 in range(n):
                if grid[r0][c0] != 1:
                    continue
                grid[r0][c0] = 0
                queue, size = deque([(r0, c0)]), 0
                while queue:
                    r1, c1 = queue.popleft()
                    size += 1
                    for r, c in ((r1 + 1, c1), (r1 - 1, c1), (r1, c1 + 1), (r1, c1 - 1)):
                        if 0 <= r < m and 0 <= c < n and grid[r][c] == 1:
                            grid[r][c] = 0
                            queue.append((r, c))
                best = max(best, size)
        return best`,
          javascript: r`var maxAreaOfIsland = function(grid) {
    const m = grid.length, n = grid[0].length;
    let best = 0;
    for (let r0 = 0; r0 < m; r0++)
        for (let c0 = 0; c0 < n; c0++) {
            if (grid[r0][c0] !== 1) continue;
            grid[r0][c0] = 0;
            const queue = [[r0, c0]];
            for (let h = 0; h < queue.length; h++) {
                const [r1, c1] = queue[h];
                for (const [r, c] of [[r1 + 1, c1], [r1 - 1, c1], [r1, c1 + 1], [r1, c1 - 1]]) {
                    if (r >= 0 && c >= 0 && r < m && c < n && grid[r][c] === 1) {
                        grid[r][c] = 0;
                        queue.push([r, c]);
                    }
                }
            }
            best = Math.max(best, queue.length);
        }
    return best;
};`,
        },
      },
    ],
  },

  'number-of-provinces': {
    pattern: 'Connected components of a graph given as an adjacency matrix (DFS or Union–Find)',
    approaches: [
      {
        level: 'Optimal', name: 'DFS from each unvisited city',
        idea: 'Each DFS from an unvisited city reaches exactly its province. Count how many searches are started.',
        steps: [
          'Keep `visited[n]`.',
          'For each city `i` not yet visited: count a province and DFS from `i`.',
          'DFS(`u`): mark `u`; for every `v` with `isConnected[u][v] == 1` and not visited, DFS(`v`).',
        ],
        time: 'O(n²)', space: 'O(n)',
        why: 'Each city scans its row of the matrix once. `visited` and the recursion take O(n).',
        code: {
          java: r`class Solution {
    public int findCircleNum(int[][] isConnected) {
        int n = isConnected.length, provinces = 0;
        boolean[] visited = new boolean[n];
        for (int i = 0; i < n; i++)
            if (!visited[i]) { provinces++; dfs(isConnected, i, visited); }
        return provinces;
    }

    private void dfs(int[][] g, int u, boolean[] visited) {
        visited[u] = true;
        for (int v = 0; v < g.length; v++)
            if (g[u][v] == 1 && !visited[v]) dfs(g, v, visited);
    }
}`,
          cpp: r`class Solution {
    void dfs(vector<vector<int>>& g, int u, vector<bool>& visited) {
        visited[u] = true;
        for (int v = 0; v < (int) g.size(); v++)
            if (g[u][v] == 1 && !visited[v]) dfs(g, v, visited);
    }
public:
    int findCircleNum(vector<vector<int>>& isConnected) {
        int n = isConnected.size(), provinces = 0;
        vector<bool> visited(n, false);
        for (int i = 0; i < n; i++)
            if (!visited[i]) { provinces++; dfs(isConnected, i, visited); }
        return provinces;
    }
};`,
          python: r`class Solution:
    def findCircleNum(self, isConnected: List[List[int]]) -> int:
        n = len(isConnected)
        visited = [False] * n
        def dfs(u):
            visited[u] = True
            for v in range(n):
                if isConnected[u][v] and not visited[v]:
                    dfs(v)
        provinces = 0
        for i in range(n):
            if not visited[i]:
                provinces += 1
                dfs(i)
        return provinces`,
          javascript: r`var findCircleNum = function(isConnected) {
    const n = isConnected.length, visited = new Array(n).fill(false);
    const dfs = (u) => {
        visited[u] = true;
        for (let v = 0; v < n; v++) if (isConnected[u][v] === 1 && !visited[v]) dfs(v);
    };
    let provinces = 0;
    for (let i = 0; i < n; i++) if (!visited[i]) { provinces++; dfs(i); }
    return provinces;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Union–Find',
        idea: 'Start with n provinces of one city each. For every connection, union the two cities; each union that joins two different sets removes one province.',
        steps: [
          'Initialise `parent[i] = i`; `provinces = n`.',
          'For every pair `i < j` with `isConnected[i][j] == 1`, union them; if they were in different sets, decrease `provinces`.',
          'Return `provinces`.',
        ],
        time: 'O(n²·α(n))', space: 'O(n)',
        why: 'The matrix still has to be read (n²/2 pairs), each union nearly O(1) with path compression.',
        code: {
          java: r`class Solution {
    public int findCircleNum(int[][] isConnected) {
        int n = isConnected.length, provinces = n;
        int[] parent = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
        for (int i = 0; i < n; i++)
            for (int j = i + 1; j < n; j++) {
                if (isConnected[i][j] == 0) continue;
                int a = find(parent, i), b = find(parent, j);
                if (a != b) { parent[a] = b; provinces--; }
            }
        return provinces;
    }

    private int find(int[] parent, int x) {
        while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    }
}`,
          cpp: r`class Solution {
    int find(vector<int>& parent, int x) {
        while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    }
public:
    int findCircleNum(vector<vector<int>>& isConnected) {
        int n = isConnected.size(), provinces = n;
        vector<int> parent(n);
        iota(parent.begin(), parent.end(), 0);
        for (int i = 0; i < n; i++)
            for (int j = i + 1; j < n; j++) {
                if (!isConnected[i][j]) continue;
                int a = find(parent, i), b = find(parent, j);
                if (a != b) { parent[a] = b; provinces--; }
            }
        return provinces;
    }
};`,
          python: r`class Solution:
    def findCircleNum(self, isConnected: List[List[int]]) -> int:
        n = len(isConnected)
        parent = list(range(n))
        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x
        provinces = n
        for i in range(n):
            for j in range(i + 1, n):
                if isConnected[i][j]:
                    a, b = find(i), find(j)
                    if a != b:
                        parent[a] = b
                        provinces -= 1
        return provinces`,
          javascript: r`var findCircleNum = function(isConnected) {
    const n = isConnected.length, parent = Array.from({ length: n }, (_, i) => i);
    const find = (x) => {
        while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    };
    let provinces = n;
    for (let i = 0; i < n; i++)
        for (let j = i + 1; j < n; j++) {
            if (!isConnected[i][j]) continue;
            const a = find(i), b = find(j);
            if (a !== b) { parent[a] = b; provinces--; }
        }
    return provinces;
};`,
        },
      },
    ],
  },

  'clone-graph': {
    pattern: 'Graph traversal with a map from original node to its copy',
    approaches: [
      {
        level: 'Optimal', name: 'DFS with an original → copy map',
        idea: 'Copy a node, record it in the map before visiting its neighbours, then copy the neighbours recursively. The map both returns already-made copies (so shared nodes stay shared) and stops cycles from looping forever.',
        steps: [
          'If `node` is null, return null.',
          '`clone(n)`: if `n` is in the map, return its copy.',
          'Otherwise create `copy = new Node(n.val)`, store `map[n] = copy`, then append `clone(nb)` for each neighbour `nb`.',
          'Return `clone(node)`.',
        ],
        time: 'O(V + E)', space: 'O(V)',
        why: 'Every node is copied once and every edge followed once from each end. The map and recursion stack hold up to V entries.',
        code: {
          java: r`class Solution {
    private final Map<Node, Node> copies = new HashMap<>();

    public Node cloneGraph(Node node) {
        if (node == null) return null;
        if (copies.containsKey(node)) return copies.get(node);
        Node copy = new Node(node.val);
        copies.put(node, copy);
        for (Node nb : node.neighbors) copy.neighbors.add(cloneGraph(nb));
        return copy;
    }
}`,
          cpp: r`class Solution {
    unordered_map<Node*, Node*> copies;
public:
    Node* cloneGraph(Node* node) {
        if (!node) return nullptr;
        if (copies.count(node)) return copies[node];
        Node* copy = new Node(node->val);
        copies[node] = copy;
        for (Node* nb : node->neighbors) copy->neighbors.push_back(cloneGraph(nb));
        return copy;
    }
};`,
          python: r`class Solution:
    def cloneGraph(self, node: Optional['Node']) -> Optional['Node']:
        copies = {}
        def clone(n):
            if n in copies:
                return copies[n]
            copy = copies[n] = Node(n.val)
            copy.neighbors = [clone(nb) for nb in n.neighbors]
            return copy
        return clone(node) if node else None`,
          javascript: r`var cloneGraph = function(node) {
    const copies = new Map();
    const clone = (n) => {
        if (copies.has(n)) return copies.get(n);
        const copy = new _Node(n.val);
        copies.set(n, copy);
        copy.neighbors = n.neighbors.map(clone);
        return copy;
    };
    return node ? clone(node) : null;
};`,
        },
      },
      {
        level: 'Optimal', name: 'BFS with an original → copy map',
        idea: 'Copy nodes as they are discovered by a BFS, and wire each copy\'s neighbour list from the map.',
        steps: [
          'Copy the start node, store it in the map, and queue the original.',
          'Pop a node; for each neighbour, create and queue its copy if it has none yet, then add the neighbour\'s copy to the popped node\'s copy.',
          'Return the start node\'s copy.',
        ],
        time: 'O(V + E)', space: 'O(V)',
        why: 'Each node is queued once and each edge processed once per end; no recursion.',
        code: {
          java: r`class Solution {
    public Node cloneGraph(Node node) {
        if (node == null) return null;
        Map<Node, Node> copies = new HashMap<>();
        copies.put(node, new Node(node.val));
        Deque<Node> queue = new ArrayDeque<>();
        queue.add(node);
        while (!queue.isEmpty()) {
            Node u = queue.poll();
            for (Node v : u.neighbors) {
                if (!copies.containsKey(v)) { copies.put(v, new Node(v.val)); queue.add(v); }
                copies.get(u).neighbors.add(copies.get(v));
            }
        }
        return copies.get(node);
    }
}`,
          cpp: r`class Solution {
public:
    Node* cloneGraph(Node* node) {
        if (!node) return nullptr;
        unordered_map<Node*, Node*> copies{{node, new Node(node->val)}};
        queue<Node*> q;
        q.push(node);
        while (!q.empty()) {
            Node* u = q.front();
            q.pop();
            for (Node* v : u->neighbors) {
                if (!copies.count(v)) { copies[v] = new Node(v->val); q.push(v); }
                copies[u]->neighbors.push_back(copies[v]);
            }
        }
        return copies[node];
    }
};`,
          python: r`class Solution:
    def cloneGraph(self, node: Optional['Node']) -> Optional['Node']:
        if not node:
            return None
        copies = {node: Node(node.val)}
        queue = deque([node])
        while queue:
            u = queue.popleft()
            for v in u.neighbors:
                if v not in copies:
                    copies[v] = Node(v.val)
                    queue.append(v)
                copies[u].neighbors.append(copies[v])
        return copies[node]`,
          javascript: r`var cloneGraph = function(node) {
    if (!node) return null;
    const copies = new Map([[node, new _Node(node.val)]]), queue = [node];
    for (let h = 0; h < queue.length; h++) {
        const u = queue[h];
        for (const v of u.neighbors) {
            if (!copies.has(v)) { copies.set(v, new _Node(v.val)); queue.push(v); }
            copies.get(u).neighbors.push(copies.get(v));
        }
    }
    return copies.get(node);
};`,
        },
      },
    ],
  },

  'rotting-oranges': {
    pattern: 'Multi-source BFS (all rotten oranges start at time 0)',
    approaches: [
      {
        level: 'Brute force', name: 'Simulate minute by minute over the whole grid',
        idea: 'Each minute, scan the grid and find every fresh orange next to a rotten one; rot them all at once. Stop when a minute changes nothing.',
        steps: [
          'Repeat: collect every fresh cell that has a rotten neighbour.',
          'If none, stop; otherwise rot them all and count a minute.',
          'At the end, return −1 if a fresh orange remains, else the minutes counted.',
        ],
        time: 'O((m·n)²)', space: 'O(m·n)',
        why: 'There can be up to m·n minutes (a long winding path), and each minute rescans the whole grid. The list of newly rotten cells is O(m·n).',
        code: {
          java: r`class Solution {
    public int orangesRotting(int[][] grid) {
        int m = grid.length, n = grid[0].length, minutes = 0;
        int[][] dirs = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } };
        while (true) {
            List<int[]> next = new ArrayList<>();
            for (int r = 0; r < m; r++)
                for (int c = 0; c < n; c++) {
                    if (grid[r][c] != 1) continue;
                    for (int[] d : dirs) {
                        int rr = r + d[0], cc = c + d[1];
                        if (rr >= 0 && cc >= 0 && rr < m && cc < n && grid[rr][cc] == 2) { next.add(new int[] { r, c }); break; }
                    }
                }
            if (next.isEmpty()) break;
            for (int[] cell : next) grid[cell[0]][cell[1]] = 2;
            minutes++;
        }
        for (int[] row : grid) for (int v : row) if (v == 1) return -1;
        return minutes;
    }
}`,
          cpp: r`class Solution {
public:
    int orangesRotting(vector<vector<int>>& grid) {
        int m = grid.size(), n = grid[0].size(), minutes = 0;
        int dr[] = {1, -1, 0, 0}, dc[] = {0, 0, 1, -1};
        while (true) {
            vector<pair<int, int>> next;
            for (int r = 0; r < m; r++)
                for (int c = 0; c < n; c++) {
                    if (grid[r][c] != 1) continue;
                    for (int k = 0; k < 4; k++) {
                        int rr = r + dr[k], cc = c + dc[k];
                        if (rr >= 0 && cc >= 0 && rr < m && cc < n && grid[rr][cc] == 2) { next.push_back({r, c}); break; }
                    }
                }
            if (next.empty()) break;
            for (auto [r, c] : next) grid[r][c] = 2;
            minutes++;
        }
        for (auto& row : grid) for (int v : row) if (v == 1) return -1;
        return minutes;
    }
};`,
          python: r`class Solution:
    def orangesRotting(self, grid: List[List[int]]) -> int:
        m, n, minutes = len(grid), len(grid[0]), 0
        while True:
            nxt = [
                (r, c) for r in range(m) for c in range(n)
                if grid[r][c] == 1 and any(
                    0 <= rr < m and 0 <= cc < n and grid[rr][cc] == 2
                    for rr, cc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1))
                )
            ]
            if not nxt:
                break
            for r, c in nxt:
                grid[r][c] = 2
            minutes += 1
        return -1 if any(1 in row for row in grid) else minutes`,
          javascript: r`var orangesRotting = function(grid) {
    const m = grid.length, n = grid[0].length;
    let minutes = 0;
    while (true) {
        const next = [];
        for (let r = 0; r < m; r++)
            for (let c = 0; c < n; c++) {
                if (grid[r][c] !== 1) continue;
                const near = [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]
                    .some(([rr, cc]) => rr >= 0 && cc >= 0 && rr < m && cc < n && grid[rr][cc] === 2);
                if (near) next.push([r, c]);
            }
        if (next.length === 0) break;
        for (const [r, c] of next) grid[r][c] = 2;
        minutes++;
    }
    return grid.some((row) => row.includes(1)) ? -1 : minutes;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Multi-source BFS from every rotten orange',
        idea: 'Put all rotten oranges in the queue at once, as level 0. Each BFS level is one minute: it rots the fresh neighbours of the current level. Count fresh oranges so you know whether any are left.',
        steps: [
          'Queue every rotten cell; count the fresh cells.',
          'While the queue is non-empty and fresh oranges remain: process one level, rotting each fresh neighbour (decrease the fresh count, queue it); then add a minute.',
          'Return −1 if fresh oranges remain, else the minutes.',
        ],
        time: 'O(m·n)', space: 'O(m·n)',
        why: 'Each cell is queued at most once. Starting from all sources at once gives each orange the time of its nearest rotten source.',
        code: {
          java: r`class Solution {
    public int orangesRotting(int[][] grid) {
        int m = grid.length, n = grid[0].length, fresh = 0, minutes = 0;
        Deque<int[]> queue = new ArrayDeque<>();
        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++) {
                if (grid[r][c] == 2) queue.add(new int[] { r, c });
                else if (grid[r][c] == 1) fresh++;
            }
        int[][] dirs = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } };
        while (!queue.isEmpty() && fresh > 0) {
            for (int k = queue.size(); k > 0; k--) {
                int[] cell = queue.poll();
                for (int[] d : dirs) {
                    int r = cell[0] + d[0], c = cell[1] + d[1];
                    if (r >= 0 && c >= 0 && r < m && c < n && grid[r][c] == 1) {
                        grid[r][c] = 2;
                        fresh--;
                        queue.add(new int[] { r, c });
                    }
                }
            }
            minutes++;
        }
        return fresh == 0 ? minutes : -1;
    }
}`,
          cpp: r`class Solution {
public:
    int orangesRotting(vector<vector<int>>& grid) {
        int m = grid.size(), n = grid[0].size(), fresh = 0, minutes = 0;
        queue<pair<int, int>> q;
        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++) {
                if (grid[r][c] == 2) q.push({r, c});
                else if (grid[r][c] == 1) fresh++;
            }
        int dr[] = {1, -1, 0, 0}, dc[] = {0, 0, 1, -1};
        while (!q.empty() && fresh > 0) {
            for (int k = q.size(); k > 0; k--) {
                auto [r0, c0] = q.front();
                q.pop();
                for (int d = 0; d < 4; d++) {
                    int r = r0 + dr[d], c = c0 + dc[d];
                    if (r >= 0 && c >= 0 && r < m && c < n && grid[r][c] == 1) {
                        grid[r][c] = 2;
                        fresh--;
                        q.push({r, c});
                    }
                }
            }
            minutes++;
        }
        return fresh == 0 ? minutes : -1;
    }
};`,
          python: r`class Solution:
    def orangesRotting(self, grid: List[List[int]]) -> int:
        m, n = len(grid), len(grid[0])
        queue = deque((r, c) for r in range(m) for c in range(n) if grid[r][c] == 2)
        fresh = sum(row.count(1) for row in grid)
        minutes = 0
        while queue and fresh:
            for _ in range(len(queue)):
                r0, c0 = queue.popleft()
                for r, c in ((r0 + 1, c0), (r0 - 1, c0), (r0, c0 + 1), (r0, c0 - 1)):
                    if 0 <= r < m and 0 <= c < n and grid[r][c] == 1:
                        grid[r][c] = 2
                        fresh -= 1
                        queue.append((r, c))
            minutes += 1
        return minutes if fresh == 0 else -1`,
          javascript: r`var orangesRotting = function(grid) {
    const m = grid.length, n = grid[0].length;
    let level = [], fresh = 0, minutes = 0;
    for (let r = 0; r < m; r++)
        for (let c = 0; c < n; c++) {
            if (grid[r][c] === 2) level.push([r, c]);
            else if (grid[r][c] === 1) fresh++;
        }
    while (level.length && fresh > 0) {
        const next = [];
        for (const [r0, c0] of level)
            for (const [r, c] of [[r0 + 1, c0], [r0 - 1, c0], [r0, c0 + 1], [r0, c0 - 1]]) {
                if (r >= 0 && c >= 0 && r < m && c < n && grid[r][c] === 1) {
                    grid[r][c] = 2;
                    fresh--;
                    next.push([r, c]);
                }
            }
        level = next;
        minutes++;
    }
    return fresh === 0 ? minutes : -1;
};`,
        },
      },
    ],
  },

  '01-matrix': {
    pattern: 'Multi-source BFS from every 0 (or two-pass DP over the grid)',
    approaches: [
      {
        level: 'Brute force', name: 'BFS from every 1 to its nearest 0',
        idea: 'For each cell holding 1, run a BFS outward until it reaches a 0; the BFS level is the distance.',
        steps: [
          'For each cell with 1: BFS from it with its own visited set.',
          'The first 0 popped gives the distance; write it into the answer.',
          'Cells with 0 have distance 0.',
        ],
        time: 'O((m·n)²)', space: 'O(m·n)',
        why: 'Each of the up to m·n searches can explore the whole grid.',
        code: {
          java: r`class Solution {
    public int[][] updateMatrix(int[][] mat) {
        int m = mat.length, n = mat[0].length;
        int[][] out = new int[m][n];
        int[][] dirs = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } };
        for (int r0 = 0; r0 < m; r0++)
            for (int c0 = 0; c0 < n; c0++) {
                if (mat[r0][c0] == 0) continue;
                boolean[][] seen = new boolean[m][n];
                Deque<int[]> queue = new ArrayDeque<>();
                queue.add(new int[] { r0, c0, 0 });
                seen[r0][c0] = true;
                while (!queue.isEmpty()) {
                    int[] cur = queue.poll();
                    if (mat[cur[0]][cur[1]] == 0) { out[r0][c0] = cur[2]; break; }
                    for (int[] d : dirs) {
                        int r = cur[0] + d[0], c = cur[1] + d[1];
                        if (r >= 0 && c >= 0 && r < m && c < n && !seen[r][c]) {
                            seen[r][c] = true;
                            queue.add(new int[] { r, c, cur[2] + 1 });
                        }
                    }
                }
            }
        return out;
    }
}`,
          cpp: r`class Solution {
public:
    vector<vector<int>> updateMatrix(vector<vector<int>>& mat) {
        int m = mat.size(), n = mat[0].size();
        vector<vector<int>> out(m, vector<int>(n, 0));
        int dr[] = {1, -1, 0, 0}, dc[] = {0, 0, 1, -1};
        for (int r0 = 0; r0 < m; r0++)
            for (int c0 = 0; c0 < n; c0++) {
                if (mat[r0][c0] == 0) continue;
                vector<vector<bool>> seen(m, vector<bool>(n, false));
                queue<array<int, 3>> q;
                q.push({r0, c0, 0});
                seen[r0][c0] = true;
                while (!q.empty()) {
                    auto [r1, c1, d] = q.front();
                    q.pop();
                    if (mat[r1][c1] == 0) { out[r0][c0] = d; break; }
                    for (int k = 0; k < 4; k++) {
                        int r = r1 + dr[k], c = c1 + dc[k];
                        if (r >= 0 && c >= 0 && r < m && c < n && !seen[r][c]) {
                            seen[r][c] = true;
                            q.push({r, c, d + 1});
                        }
                    }
                }
            }
        return out;
    }
};`,
          python: r`class Solution:
    def updateMatrix(self, mat: List[List[int]]) -> List[List[int]]:
        m, n = len(mat), len(mat[0])
        out = [[0] * n for _ in range(m)]
        for r0 in range(m):
            for c0 in range(n):
                if mat[r0][c0] == 0:
                    continue
                seen = {(r0, c0)}
                queue = deque([(r0, c0, 0)])
                while queue:
                    r1, c1, d = queue.popleft()
                    if mat[r1][c1] == 0:
                        out[r0][c0] = d
                        break
                    for r, c in ((r1 + 1, c1), (r1 - 1, c1), (r1, c1 + 1), (r1, c1 - 1)):
                        if 0 <= r < m and 0 <= c < n and (r, c) not in seen:
                            seen.add((r, c))
                            queue.append((r, c, d + 1))
        return out`,
          javascript: r`var updateMatrix = function(mat) {
    const m = mat.length, n = mat[0].length;
    const out = Array.from({ length: m }, () => new Array(n).fill(0));
    for (let r0 = 0; r0 < m; r0++)
        for (let c0 = 0; c0 < n; c0++) {
            if (mat[r0][c0] === 0) continue;
            const seen = new Set([r0 * n + c0]), queue = [[r0, c0, 0]];
            for (let h = 0; h < queue.length; h++) {
                const [r1, c1, d] = queue[h];
                if (mat[r1][c1] === 0) { out[r0][c0] = d; break; }
                for (const [r, c] of [[r1 + 1, c1], [r1 - 1, c1], [r1, c1 + 1], [r1, c1 - 1]]) {
                    if (r >= 0 && c >= 0 && r < m && c < n && !seen.has(r * n + c)) {
                        seen.add(r * n + c);
                        queue.push([r, c, d + 1]);
                    }
                }
            }
        }
    return out;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Multi-source BFS from all zeros',
        idea: 'Reverse the question: start one BFS from every 0 at once. A 1 is first reached by the wave from its nearest 0, at exactly that distance.',
        steps: [
          'Set distance 0 for every 0 and queue it; mark every 1 as unknown (−1).',
          'Pop a cell; for each neighbour that is still unknown, set its distance to the popped cell\'s distance + 1 and queue it.',
          'Return the distances.',
        ],
        time: 'O(m·n)', space: 'O(m·n)',
        why: 'Every cell is queued once; the queue and the result use O(m·n).',
        code: {
          java: r`class Solution {
    public int[][] updateMatrix(int[][] mat) {
        int m = mat.length, n = mat[0].length;
        int[][] dist = new int[m][n];
        Deque<int[]> queue = new ArrayDeque<>();
        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++) {
                if (mat[r][c] == 0) queue.add(new int[] { r, c });
                else dist[r][c] = -1;
            }
        int[][] dirs = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } };
        while (!queue.isEmpty()) {
            int[] cell = queue.poll();
            for (int[] d : dirs) {
                int r = cell[0] + d[0], c = cell[1] + d[1];
                if (r >= 0 && c >= 0 && r < m && c < n && dist[r][c] == -1) {
                    dist[r][c] = dist[cell[0]][cell[1]] + 1;
                    queue.add(new int[] { r, c });
                }
            }
        }
        return dist;
    }
}`,
          cpp: r`class Solution {
public:
    vector<vector<int>> updateMatrix(vector<vector<int>>& mat) {
        int m = mat.size(), n = mat[0].size();
        vector<vector<int>> dist(m, vector<int>(n, -1));
        queue<pair<int, int>> q;
        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++)
                if (mat[r][c] == 0) { dist[r][c] = 0; q.push({r, c}); }
        int dr[] = {1, -1, 0, 0}, dc[] = {0, 0, 1, -1};
        while (!q.empty()) {
            auto [r0, c0] = q.front();
            q.pop();
            for (int k = 0; k < 4; k++) {
                int r = r0 + dr[k], c = c0 + dc[k];
                if (r >= 0 && c >= 0 && r < m && c < n && dist[r][c] == -1) {
                    dist[r][c] = dist[r0][c0] + 1;
                    q.push({r, c});
                }
            }
        }
        return dist;
    }
};`,
          python: r`class Solution:
    def updateMatrix(self, mat: List[List[int]]) -> List[List[int]]:
        m, n = len(mat), len(mat[0])
        dist = [[0 if v == 0 else -1 for v in row] for row in mat]
        queue = deque((r, c) for r in range(m) for c in range(n) if mat[r][c] == 0)
        while queue:
            r0, c0 = queue.popleft()
            for r, c in ((r0 + 1, c0), (r0 - 1, c0), (r0, c0 + 1), (r0, c0 - 1)):
                if 0 <= r < m and 0 <= c < n and dist[r][c] == -1:
                    dist[r][c] = dist[r0][c0] + 1
                    queue.append((r, c))
        return dist`,
          javascript: r`var updateMatrix = function(mat) {
    const m = mat.length, n = mat[0].length;
    const dist = mat.map((row) => row.map((v) => (v === 0 ? 0 : -1)));
    const queue = [];
    for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) if (mat[r][c] === 0) queue.push([r, c]);
    for (let h = 0; h < queue.length; h++) {
        const [r0, c0] = queue[h];
        for (const [r, c] of [[r0 + 1, c0], [r0 - 1, c0], [r0, c0 + 1], [r0, c0 - 1]]) {
            if (r >= 0 && c >= 0 && r < m && c < n && dist[r][c] === -1) {
                dist[r][c] = dist[r0][c0] + 1;
                queue.push([r, c]);
            }
        }
    }
    return dist;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Two DP passes (top-left, then bottom-right)',
        idea: 'A shortest path to the nearest 0 moves in some mix of the four directions. One pass from the top-left handles zeros above and to the left; a second pass from the bottom-right handles zeros below and to the right, keeping the smaller value.',
        steps: [
          'Set 0 cells to 0 and 1 cells to a large number.',
          'Pass 1 (top-left to bottom-right): `d[r][c] = min(d[r][c], d[r − 1][c] + 1, d[r][c − 1] + 1)`.',
          'Pass 2 (bottom-right to top-left): `d[r][c] = min(d[r][c], d[r + 1][c] + 1, d[r][c + 1] + 1)`.',
          'Return `d`.',
        ],
        time: 'O(m·n)', space: 'O(1)',
        why: 'Two linear passes and no queue; apart from the output (which can reuse the input) no extra memory is needed.',
        code: {
          java: r`class Solution {
    public int[][] updateMatrix(int[][] mat) {
        int m = mat.length, n = mat[0].length, INF = m + n;
        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++) {
                if (mat[r][c] == 0) continue;
                int best = INF;
                if (r > 0) best = Math.min(best, mat[r - 1][c] + 1);
                if (c > 0) best = Math.min(best, mat[r][c - 1] + 1);
                mat[r][c] = best;
            }
        for (int r = m - 1; r >= 0; r--)
            for (int c = n - 1; c >= 0; c--) {
                if (r < m - 1) mat[r][c] = Math.min(mat[r][c], mat[r + 1][c] + 1);
                if (c < n - 1) mat[r][c] = Math.min(mat[r][c], mat[r][c + 1] + 1);
            }
        return mat;
    }
}`,
          cpp: r`class Solution {
public:
    vector<vector<int>> updateMatrix(vector<vector<int>>& mat) {
        int m = mat.size(), n = mat[0].size(), INF = m + n;
        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++) {
                if (mat[r][c] == 0) continue;
                int best = INF;
                if (r > 0) best = min(best, mat[r - 1][c] + 1);
                if (c > 0) best = min(best, mat[r][c - 1] + 1);
                mat[r][c] = best;
            }
        for (int r = m - 1; r >= 0; r--)
            for (int c = n - 1; c >= 0; c--) {
                if (r < m - 1) mat[r][c] = min(mat[r][c], mat[r + 1][c] + 1);
                if (c < n - 1) mat[r][c] = min(mat[r][c], mat[r][c + 1] + 1);
            }
        return mat;
    }
};`,
          python: r`class Solution:
    def updateMatrix(self, mat: List[List[int]]) -> List[List[int]]:
        m, n = len(mat), len(mat[0])
        INF = m + n
        for r in range(m):
            for c in range(n):
                if mat[r][c]:
                    up = mat[r - 1][c] + 1 if r else INF
                    left = mat[r][c - 1] + 1 if c else INF
                    mat[r][c] = min(up, left)
        for r in range(m - 1, -1, -1):
            for c in range(n - 1, -1, -1):
                if r < m - 1:
                    mat[r][c] = min(mat[r][c], mat[r + 1][c] + 1)
                if c < n - 1:
                    mat[r][c] = min(mat[r][c], mat[r][c + 1] + 1)
        return mat`,
          javascript: r`var updateMatrix = function(mat) {
    const m = mat.length, n = mat[0].length, INF = m + n;
    for (let r = 0; r < m; r++)
        for (let c = 0; c < n; c++) {
            if (mat[r][c] === 0) continue;
            let best = INF;
            if (r > 0) best = Math.min(best, mat[r - 1][c] + 1);
            if (c > 0) best = Math.min(best, mat[r][c - 1] + 1);
            mat[r][c] = best;
        }
    for (let r = m - 1; r >= 0; r--)
        for (let c = n - 1; c >= 0; c--) {
            if (r < m - 1) mat[r][c] = Math.min(mat[r][c], mat[r + 1][c] + 1);
            if (c < n - 1) mat[r][c] = Math.min(mat[r][c], mat[r][c + 1] + 1);
        }
    return mat;
};`,
        },
      },
    ],
  },

  'shortest-path-in-binary-matrix': {
    pattern: 'BFS on an unweighted grid graph (8 directions)',
    approaches: [
      {
        level: 'Optimal', name: 'BFS with 8 neighbours',
        idea: 'Every step costs the same, so BFS from the top-left reaches each cell first by a shortest path. The distance counts cells, so the start has distance 1.',
        steps: [
          'If the start or the end is blocked, return −1.',
          'Queue `(0, 0)` with distance 1 and mark it visited (set it to 1 in the grid).',
          'Pop a cell; if it is the bottom-right, return its distance. Otherwise queue each of the 8 neighbours that is open, marking it and giving it distance + 1.',
          'If the queue empties, return −1.',
        ],
        time: 'O(n²)', space: 'O(n²)',
        why: 'Each of the n² cells is queued at most once and checks 8 neighbours. A DFS would find a path, but not necessarily the shortest one.',
        code: {
          java: r`class Solution {
    public int shortestPathBinaryMatrix(int[][] grid) {
        int n = grid.length;
        if (grid[0][0] == 1 || grid[n - 1][n - 1] == 1) return -1;
        Deque<int[]> queue = new ArrayDeque<>();
        queue.add(new int[] { 0, 0, 1 });
        grid[0][0] = 1;
        while (!queue.isEmpty()) {
            int[] cur = queue.poll();
            if (cur[0] == n - 1 && cur[1] == n - 1) return cur[2];
            for (int dr = -1; dr <= 1; dr++)
                for (int dc = -1; dc <= 1; dc++) {
                    int r = cur[0] + dr, c = cur[1] + dc;
                    if (r >= 0 && c >= 0 && r < n && c < n && grid[r][c] == 0) {
                        grid[r][c] = 1;
                        queue.add(new int[] { r, c, cur[2] + 1 });
                    }
                }
        }
        return -1;
    }
}`,
          cpp: r`class Solution {
public:
    int shortestPathBinaryMatrix(vector<vector<int>>& grid) {
        int n = grid.size();
        if (grid[0][0] || grid[n - 1][n - 1]) return -1;
        queue<array<int, 3>> q;
        q.push({0, 0, 1});
        grid[0][0] = 1;
        while (!q.empty()) {
            auto [r0, c0, d] = q.front();
            q.pop();
            if (r0 == n - 1 && c0 == n - 1) return d;
            for (int dr = -1; dr <= 1; dr++)
                for (int dc = -1; dc <= 1; dc++) {
                    int r = r0 + dr, c = c0 + dc;
                    if (r >= 0 && c >= 0 && r < n && c < n && grid[r][c] == 0) {
                        grid[r][c] = 1;
                        q.push({r, c, d + 1});
                    }
                }
        }
        return -1;
    }
};`,
          python: r`class Solution:
    def shortestPathBinaryMatrix(self, grid: List[List[int]]) -> int:
        n = len(grid)
        if grid[0][0] or grid[n - 1][n - 1]:
            return -1
        grid[0][0] = 1
        queue = deque([(0, 0, 1)])
        while queue:
            r0, c0, d = queue.popleft()
            if r0 == n - 1 and c0 == n - 1:
                return d
            for dr in (-1, 0, 1):
                for dc in (-1, 0, 1):
                    r, c = r0 + dr, c0 + dc
                    if 0 <= r < n and 0 <= c < n and grid[r][c] == 0:
                        grid[r][c] = 1
                        queue.append((r, c, d + 1))
        return -1`,
          javascript: r`var shortestPathBinaryMatrix = function(grid) {
    const n = grid.length;
    if (grid[0][0] || grid[n - 1][n - 1]) return -1;
    grid[0][0] = 1;
    const queue = [[0, 0, 1]];
    for (let h = 0; h < queue.length; h++) {
        const [r0, c0, d] = queue[h];
        if (r0 === n - 1 && c0 === n - 1) return d;
        for (let dr = -1; dr <= 1; dr++)
            for (let dc = -1; dc <= 1; dc++) {
                const r = r0 + dr, c = c0 + dc;
                if (r >= 0 && c >= 0 && r < n && c < n && grid[r][c] === 0) {
                    grid[r][c] = 1;
                    queue.push([r, c, d + 1]);
                }
            }
    }
    return -1;
};`,
        },
      },
    ],
  },

  'surrounded-regions': {
    pattern: 'Boundary search: mark everything reachable from the edge, flip the rest',
    approaches: [
      {
        level: 'Brute force', name: 'Explore each region and check whether it touches the edge',
        idea: 'For every unvisited `O`, find its whole region with a BFS, noting whether any cell lies on the border. If none does, flip the region to `X`.',
        steps: [
          'For each `O` not yet visited: BFS to collect its region and set `touchesEdge` if any cell is on the border.',
          'If `touchesEdge` is false, set every cell of the region to `X`.',
        ],
        time: 'O(m·n)', space: 'O(m·n)',
        why: 'Each cell is visited once across all regions, so this is also linear — but it needs a visited table and a list per region, and the edge-first approach below is simpler.',
        code: {
          java: r`class Solution {
    public void solve(char[][] board) {
        int m = board.length, n = board[0].length;
        boolean[][] seen = new boolean[m][n];
        int[][] dirs = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } };
        for (int r0 = 0; r0 < m; r0++)
            for (int c0 = 0; c0 < n; c0++) {
                if (board[r0][c0] != 'O' || seen[r0][c0]) continue;
                List<int[]> region = new ArrayList<>();
                boolean edge = false;
                seen[r0][c0] = true;
                region.add(new int[] { r0, c0 });
                for (int i = 0; i < region.size(); i++) {
                    int r = region.get(i)[0], c = region.get(i)[1];
                    if (r == 0 || c == 0 || r == m - 1 || c == n - 1) edge = true;
                    for (int[] d : dirs) {
                        int rr = r + d[0], cc = c + d[1];
                        if (rr >= 0 && cc >= 0 && rr < m && cc < n && board[rr][cc] == 'O' && !seen[rr][cc]) {
                            seen[rr][cc] = true;
                            region.add(new int[] { rr, cc });
                        }
                    }
                }
                if (!edge) for (int[] cell : region) board[cell[0]][cell[1]] = 'X';
            }
    }
}`,
          cpp: r`class Solution {
public:
    void solve(vector<vector<char>>& board) {
        int m = board.size(), n = board[0].size();
        vector<vector<bool>> seen(m, vector<bool>(n, false));
        int dr[] = {1, -1, 0, 0}, dc[] = {0, 0, 1, -1};
        for (int r0 = 0; r0 < m; r0++)
            for (int c0 = 0; c0 < n; c0++) {
                if (board[r0][c0] != 'O' || seen[r0][c0]) continue;
                vector<pair<int, int>> region{{r0, c0}};
                seen[r0][c0] = true;
                bool edge = false;
                for (size_t i = 0; i < region.size(); i++) {
                    auto [r, c] = region[i];
                    if (r == 0 || c == 0 || r == m - 1 || c == n - 1) edge = true;
                    for (int k = 0; k < 4; k++) {
                        int rr = r + dr[k], cc = c + dc[k];
                        if (rr >= 0 && cc >= 0 && rr < m && cc < n && board[rr][cc] == 'O' && !seen[rr][cc]) {
                            seen[rr][cc] = true;
                            region.push_back({rr, cc});
                        }
                    }
                }
                if (!edge) for (auto [r, c] : region) board[r][c] = 'X';
            }
    }
};`,
          python: r`class Solution:
    def solve(self, board: List[List[str]]) -> None:
        m, n = len(board), len(board[0])
        seen = [[False] * n for _ in range(m)]
        for r0 in range(m):
            for c0 in range(n):
                if board[r0][c0] != "O" or seen[r0][c0]:
                    continue
                seen[r0][c0] = True
                region, edge, i = [(r0, c0)], False, 0
                while i < len(region):
                    r, c = region[i]
                    i += 1
                    if r in (0, m - 1) or c in (0, n - 1):
                        edge = True
                    for rr, cc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                        if 0 <= rr < m and 0 <= cc < n and board[rr][cc] == "O" and not seen[rr][cc]:
                            seen[rr][cc] = True
                            region.append((rr, cc))
                if not edge:
                    for r, c in region:
                        board[r][c] = "X"`,
          javascript: r`var solve = function(board) {
    const m = board.length, n = board[0].length;
    const seen = Array.from({ length: m }, () => new Array(n).fill(false));
    for (let r0 = 0; r0 < m; r0++)
        for (let c0 = 0; c0 < n; c0++) {
            if (board[r0][c0] !== 'O' || seen[r0][c0]) continue;
            seen[r0][c0] = true;
            const region = [[r0, c0]];
            let edge = false;
            for (let i = 0; i < region.length; i++) {
                const [r, c] = region[i];
                if (r === 0 || c === 0 || r === m - 1 || c === n - 1) edge = true;
                for (const [rr, cc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
                    if (rr >= 0 && cc >= 0 && rr < m && cc < n && board[rr][cc] === 'O' && !seen[rr][cc]) {
                        seen[rr][cc] = true;
                        region.push([rr, cc]);
                    }
                }
            }
            if (!edge) for (const [r, c] of region) board[r][c] = 'X';
        }
};`,
        },
      },
      {
        level: 'Optimal', name: 'Mark the safe cells from the border, then flip the rest',
        idea: 'An `O` survives exactly when it is connected to a border `O`. So start from every border `O`, mark everything reachable as safe (`#`), then flip the remaining `O`s to `X` and turn the `#`s back into `O`.',
        steps: [
          'From each `O` on the border, run a DFS/BFS marking reachable `O` cells as `#`.',
          'Scan the board: every `O` left is surrounded — set it to `X`; every `#` becomes `O` again.',
        ],
        time: 'O(m·n)', space: 'O(m·n)',
        why: 'Each cell is marked at most once and scanned once. The board itself stores the marks, so only the search queue (up to m·n cells) is extra.',
        code: {
          java: r`class Solution {
    public void solve(char[][] board) {
        int m = board.length, n = board[0].length;
        Deque<int[]> queue = new ArrayDeque<>();
        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++)
                if ((r == 0 || c == 0 || r == m - 1 || c == n - 1) && board[r][c] == 'O') {
                    board[r][c] = '#';
                    queue.add(new int[] { r, c });
                }
        int[][] dirs = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } };
        while (!queue.isEmpty()) {
            int[] cell = queue.poll();
            for (int[] d : dirs) {
                int r = cell[0] + d[0], c = cell[1] + d[1];
                if (r >= 0 && c >= 0 && r < m && c < n && board[r][c] == 'O') {
                    board[r][c] = '#';
                    queue.add(new int[] { r, c });
                }
            }
        }
        for (char[] row : board)
            for (int c = 0; c < n; c++) row[c] = row[c] == '#' ? 'O' : 'X';
    }
}`,
          cpp: r`class Solution {
public:
    void solve(vector<vector<char>>& board) {
        int m = board.size(), n = board[0].size();
        queue<pair<int, int>> q;
        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++)
                if ((r == 0 || c == 0 || r == m - 1 || c == n - 1) && board[r][c] == 'O') {
                    board[r][c] = '#';
                    q.push({r, c});
                }
        int dr[] = {1, -1, 0, 0}, dc[] = {0, 0, 1, -1};
        while (!q.empty()) {
            auto [r0, c0] = q.front();
            q.pop();
            for (int k = 0; k < 4; k++) {
                int r = r0 + dr[k], c = c0 + dc[k];
                if (r >= 0 && c >= 0 && r < m && c < n && board[r][c] == 'O') {
                    board[r][c] = '#';
                    q.push({r, c});
                }
            }
        }
        for (auto& row : board)
            for (char& ch : row) ch = ch == '#' ? 'O' : 'X';
    }
};`,
          python: r`class Solution:
    def solve(self, board: List[List[str]]) -> None:
        m, n = len(board), len(board[0])
        queue = deque()
        for r in range(m):
            for c in range(n):
                if (r in (0, m - 1) or c in (0, n - 1)) and board[r][c] == "O":
                    board[r][c] = "#"
                    queue.append((r, c))
        while queue:
            r0, c0 = queue.popleft()
            for r, c in ((r0 + 1, c0), (r0 - 1, c0), (r0, c0 + 1), (r0, c0 - 1)):
                if 0 <= r < m and 0 <= c < n and board[r][c] == "O":
                    board[r][c] = "#"
                    queue.append((r, c))
        for row in board:
            for c in range(n):
                row[c] = "O" if row[c] == "#" else "X"`,
          javascript: r`var solve = function(board) {
    const m = board.length, n = board[0].length, queue = [];
    for (let r = 0; r < m; r++)
        for (let c = 0; c < n; c++)
            if ((r === 0 || c === 0 || r === m - 1 || c === n - 1) && board[r][c] === 'O') {
                board[r][c] = '#';
                queue.push([r, c]);
            }
    for (let h = 0; h < queue.length; h++) {
        const [r0, c0] = queue[h];
        for (const [r, c] of [[r0 + 1, c0], [r0 - 1, c0], [r0, c0 + 1], [r0, c0 - 1]]) {
            if (r >= 0 && c >= 0 && r < m && c < n && board[r][c] === 'O') {
                board[r][c] = '#';
                queue.push([r, c]);
            }
        }
    }
    for (const row of board)
        for (let c = 0; c < n; c++) row[c] = row[c] === '#' ? 'O' : 'X';
};`,
        },
      },
    ],
  },

  'pacific-atlantic-water-flow': {
    pattern: 'Reverse flow: search uphill from each ocean\'s edge, then intersect',
    approaches: [
      {
        level: 'Brute force', name: 'From every cell, follow the water downhill',
        idea: 'For each cell, explore every cell water can flow to (neighbours that are not higher) and check whether the search reaches a Pacific edge and an Atlantic edge.',
        steps: [
          'For each cell, BFS/DFS to all reachable cells (moving to neighbours with height `<=` the current one).',
          'Note whether any reached cell is in the top row or left column (Pacific) and whether any is in the bottom row or right column (Atlantic).',
          'Record the cell if both are true.',
        ],
        time: 'O((m·n)²)', space: 'O(m·n)',
        why: 'Each of the m·n searches may cover the whole grid; each uses its own visited table.',
        code: {
          java: r`class Solution {
    public List<List<Integer>> pacificAtlantic(int[][] heights) {
        int m = heights.length, n = heights[0].length;
        int[][] dirs = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } };
        List<List<Integer>> out = new ArrayList<>();
        for (int r0 = 0; r0 < m; r0++)
            for (int c0 = 0; c0 < n; c0++) {
                boolean[][] seen = new boolean[m][n];
                Deque<int[]> queue = new ArrayDeque<>();
                queue.add(new int[] { r0, c0 });
                seen[r0][c0] = true;
                boolean pacific = false, atlantic = false;
                while (!queue.isEmpty() && !(pacific && atlantic)) {
                    int[] cell = queue.poll();
                    int r = cell[0], c = cell[1];
                    if (r == 0 || c == 0) pacific = true;
                    if (r == m - 1 || c == n - 1) atlantic = true;
                    for (int[] d : dirs) {
                        int rr = r + d[0], cc = c + d[1];
                        if (rr >= 0 && cc >= 0 && rr < m && cc < n && !seen[rr][cc] && heights[rr][cc] <= heights[r][c]) {
                            seen[rr][cc] = true;
                            queue.add(new int[] { rr, cc });
                        }
                    }
                }
                if (pacific && atlantic) out.add(List.of(r0, c0));
            }
        return out;
    }
}`,
          cpp: r`class Solution {
public:
    vector<vector<int>> pacificAtlantic(vector<vector<int>>& heights) {
        int m = heights.size(), n = heights[0].size();
        int dr[] = {1, -1, 0, 0}, dc[] = {0, 0, 1, -1};
        vector<vector<int>> out;
        for (int r0 = 0; r0 < m; r0++)
            for (int c0 = 0; c0 < n; c0++) {
                vector<vector<bool>> seen(m, vector<bool>(n, false));
                queue<pair<int, int>> q;
                q.push({r0, c0});
                seen[r0][c0] = true;
                bool pacific = false, atlantic = false;
                while (!q.empty() && !(pacific && atlantic)) {
                    auto [r, c] = q.front();
                    q.pop();
                    if (r == 0 || c == 0) pacific = true;
                    if (r == m - 1 || c == n - 1) atlantic = true;
                    for (int k = 0; k < 4; k++) {
                        int rr = r + dr[k], cc = c + dc[k];
                        if (rr >= 0 && cc >= 0 && rr < m && cc < n && !seen[rr][cc] && heights[rr][cc] <= heights[r][c]) {
                            seen[rr][cc] = true;
                            q.push({rr, cc});
                        }
                    }
                }
                if (pacific && atlantic) out.push_back({r0, c0});
            }
        return out;
    }
};`,
          python: r`class Solution:
    def pacificAtlantic(self, heights: List[List[int]]) -> List[List[int]]:
        m, n = len(heights), len(heights[0])
        out = []
        for r0 in range(m):
            for c0 in range(n):
                seen, queue = {(r0, c0)}, deque([(r0, c0)])
                pacific = atlantic = False
                while queue and not (pacific and atlantic):
                    r, c = queue.popleft()
                    pacific |= r == 0 or c == 0
                    atlantic |= r == m - 1 or c == n - 1
                    for rr, cc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                        if 0 <= rr < m and 0 <= cc < n and (rr, cc) not in seen and heights[rr][cc] <= heights[r][c]:
                            seen.add((rr, cc))
                            queue.append((rr, cc))
                if pacific and atlantic:
                    out.append([r0, c0])
        return out`,
          javascript: r`var pacificAtlantic = function(heights) {
    const m = heights.length, n = heights[0].length, out = [];
    for (let r0 = 0; r0 < m; r0++)
        for (let c0 = 0; c0 < n; c0++) {
            const seen = new Set([r0 * n + c0]), queue = [[r0, c0]];
            let pacific = false, atlantic = false;
            for (let h = 0; h < queue.length && !(pacific && atlantic); h++) {
                const [r, c] = queue[h];
                if (r === 0 || c === 0) pacific = true;
                if (r === m - 1 || c === n - 1) atlantic = true;
                for (const [rr, cc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
                    if (rr >= 0 && cc >= 0 && rr < m && cc < n && !seen.has(rr * n + cc) && heights[rr][cc] <= heights[r][c]) {
                        seen.add(rr * n + cc);
                        queue.push([rr, cc]);
                    }
                }
            }
            if (pacific && atlantic) out.push([r0, c0]);
        }
    return out;
};`,
        },
      },
      {
        level: 'Optimal', name: 'BFS uphill from each ocean, then intersect',
        idea: 'Turn the flow around: a cell can drain into the Pacific if the Pacific\'s edge can "climb" to it through neighbours that are not lower. Run one BFS from all Pacific edge cells and one from all Atlantic edge cells; answer the cells reached by both.',
        steps: [
          'BFS from every top-row and left-column cell, moving to neighbours with height `>=` the current cell; mark them `pacific`.',
          'Do the same from the bottom row and right column for `atlantic`.',
          'Return every cell marked in both.',
        ],
        time: 'O(m·n)', space: 'O(m·n)',
        why: 'Each BFS visits every cell at most once, and there are only two of them. Two boolean grids record the results.',
        code: {
          java: r`class Solution {
    private int m, n;
    private int[][] h;

    public List<List<Integer>> pacificAtlantic(int[][] heights) {
        h = heights;
        m = heights.length;
        n = heights[0].length;
        Deque<int[]> pq = new ArrayDeque<>(), aq = new ArrayDeque<>();
        boolean[][] pac = new boolean[m][n], atl = new boolean[m][n];
        for (int r = 0; r < m; r++) { mark(pac, pq, r, 0); mark(atl, aq, r, n - 1); }
        for (int c = 0; c < n; c++) { mark(pac, pq, 0, c); mark(atl, aq, m - 1, c); }
        climb(pac, pq);
        climb(atl, aq);
        List<List<Integer>> out = new ArrayList<>();
        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++) if (pac[r][c] && atl[r][c]) out.add(List.of(r, c));
        return out;
    }

    private void mark(boolean[][] seen, Deque<int[]> q, int r, int c) {
        if (!seen[r][c]) { seen[r][c] = true; q.add(new int[] { r, c }); }
    }

    private void climb(boolean[][] seen, Deque<int[]> q) {
        int[][] dirs = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } };
        while (!q.isEmpty()) {
            int[] cell = q.poll();
            for (int[] d : dirs) {
                int r = cell[0] + d[0], c = cell[1] + d[1];
                if (r >= 0 && c >= 0 && r < m && c < n && h[r][c] >= h[cell[0]][cell[1]]) mark(seen, q, r, c);
            }
        }
    }
}`,
          cpp: r`class Solution {
    int m, n;
    void climb(vector<vector<int>>& h, vector<vector<bool>>& seen, queue<pair<int, int>>& q) {
        int dr[] = {1, -1, 0, 0}, dc[] = {0, 0, 1, -1};
        while (!q.empty()) {
            auto [r0, c0] = q.front();
            q.pop();
            for (int k = 0; k < 4; k++) {
                int r = r0 + dr[k], c = c0 + dc[k];
                if (r >= 0 && c >= 0 && r < m && c < n && !seen[r][c] && h[r][c] >= h[r0][c0]) {
                    seen[r][c] = true;
                    q.push({r, c});
                }
            }
        }
    }
public:
    vector<vector<int>> pacificAtlantic(vector<vector<int>>& heights) {
        m = heights.size();
        n = heights[0].size();
        vector<vector<bool>> pac(m, vector<bool>(n, false)), atl(m, vector<bool>(n, false));
        queue<pair<int, int>> pq, aq;
        auto mark = [](vector<vector<bool>>& seen, queue<pair<int, int>>& q, int r, int c) {
            if (!seen[r][c]) { seen[r][c] = true; q.push({r, c}); }
        };
        for (int r = 0; r < m; r++) { mark(pac, pq, r, 0); mark(atl, aq, r, n - 1); }
        for (int c = 0; c < n; c++) { mark(pac, pq, 0, c); mark(atl, aq, m - 1, c); }
        climb(heights, pac, pq);
        climb(heights, atl, aq);
        vector<vector<int>> out;
        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++) if (pac[r][c] && atl[r][c]) out.push_back({r, c});
        return out;
    }
};`,
          python: r`class Solution:
    def pacificAtlantic(self, heights: List[List[int]]) -> List[List[int]]:
        m, n = len(heights), len(heights[0])
        def climb(starts):
            seen = set(starts)
            queue = deque(starts)
            while queue:
                r0, c0 = queue.popleft()
                for r, c in ((r0 + 1, c0), (r0 - 1, c0), (r0, c0 + 1), (r0, c0 - 1)):
                    if 0 <= r < m and 0 <= c < n and (r, c) not in seen and heights[r][c] >= heights[r0][c0]:
                        seen.add((r, c))
                        queue.append((r, c))
            return seen
        pacific = climb([(r, 0) for r in range(m)] + [(0, c) for c in range(n)])
        atlantic = climb([(r, n - 1) for r in range(m)] + [(m - 1, c) for c in range(n)])
        return [[r, c] for r, c in pacific & atlantic]`,
          javascript: r`var pacificAtlantic = function(heights) {
    const m = heights.length, n = heights[0].length;
    const climb = (starts) => {
        const seen = new Uint8Array(m * n), queue = [];
        for (const [r, c] of starts) if (!seen[r * n + c]) { seen[r * n + c] = 1; queue.push([r, c]); }
        for (let h = 0; h < queue.length; h++) {
            const [r0, c0] = queue[h];
            for (const [r, c] of [[r0 + 1, c0], [r0 - 1, c0], [r0, c0 + 1], [r0, c0 - 1]]) {
                if (r >= 0 && c >= 0 && r < m && c < n && !seen[r * n + c] && heights[r][c] >= heights[r0][c0]) {
                    seen[r * n + c] = 1;
                    queue.push([r, c]);
                }
            }
        }
        return seen;
    };
    const rows = [...Array(m).keys()], cols = [...Array(n).keys()];
    const pac = climb([...rows.map((r) => [r, 0]), ...cols.map((c) => [0, c])]);
    const atl = climb([...rows.map((r) => [r, n - 1]), ...cols.map((c) => [m - 1, c])]);
    const out = [];
    for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) if (pac[r * n + c] && atl[r * n + c]) out.push([r, c]);
    return out;
};`,
        },
      },
    ],
  },

  'word-ladder': {
    pattern: 'BFS over an implicit graph of words (edges = one-letter changes)',
    approaches: [
      {
        level: 'Better', name: 'BFS comparing each word with every word in the list',
        idea: 'Words are nodes and one-letter differences are edges. BFS from `beginWord` finds the shortest chain. Find each word\'s neighbours by comparing it with every unvisited word in the list.',
        steps: [
          'Queue `beginWord` with length 1; keep a visited set.',
          'Pop a word; for each unvisited list word that differs in exactly one position: if it is `endWord`, return length + 1; else mark it and queue it with length + 1.',
          'Return 0 if the queue empties.',
        ],
        time: 'O(N²·L)', space: 'O(N)',
        why: 'Each of the N words, once popped, is compared with all N words in O(L) each.',
        code: {
          java: r`class Solution {
    public int ladderLength(String beginWord, String endWord, List<String> wordList) {
        boolean[] used = new boolean[wordList.size()];
        Deque<String> queue = new ArrayDeque<>();
        queue.add(beginWord);
        for (int len = 1; !queue.isEmpty(); len++) {
            for (int k = queue.size(); k > 0; k--) {
                String w = queue.poll();
                for (int i = 0; i < wordList.size(); i++) {
                    if (used[i] || !oneApart(w, wordList.get(i))) continue;
                    if (wordList.get(i).equals(endWord)) return len + 1;
                    used[i] = true;
                    queue.add(wordList.get(i));
                }
            }
        }
        return 0;
    }

    private boolean oneApart(String a, String b) {
        int diff = 0;
        for (int i = 0; i < a.length() && diff < 2; i++) if (a.charAt(i) != b.charAt(i)) diff++;
        return diff == 1;
    }
}`,
          cpp: r`class Solution {
    bool oneApart(const string& a, const string& b) {
        int diff = 0;
        for (size_t i = 0; i < a.size() && diff < 2; i++) if (a[i] != b[i]) diff++;
        return diff == 1;
    }
public:
    int ladderLength(string beginWord, string endWord, vector<string>& wordList) {
        vector<bool> used(wordList.size(), false);
        queue<string> q;
        q.push(beginWord);
        for (int len = 1; !q.empty(); len++) {
            for (int k = q.size(); k > 0; k--) {
                string w = q.front();
                q.pop();
                for (size_t i = 0; i < wordList.size(); i++) {
                    if (used[i] || !oneApart(w, wordList[i])) continue;
                    if (wordList[i] == endWord) return len + 1;
                    used[i] = true;
                    q.push(wordList[i]);
                }
            }
        }
        return 0;
    }
};`,
          python: r`class Solution:
    def ladderLength(self, beginWord: str, endWord: str, wordList: List[str]) -> int:
        def one_apart(a, b):
            return sum(x != y for x, y in zip(a, b)) == 1
        used = [False] * len(wordList)
        level, length = [beginWord], 1
        while level:
            nxt = []
            for w in level:
                for i, cand in enumerate(wordList):
                    if used[i] or not one_apart(w, cand):
                        continue
                    if cand == endWord:
                        return length + 1
                    used[i] = True
                    nxt.append(cand)
            level, length = nxt, length + 1
        return 0`,
          javascript: r`var ladderLength = function(beginWord, endWord, wordList) {
    const oneApart = (a, b) => {
        let diff = 0;
        for (let i = 0; i < a.length && diff < 2; i++) if (a[i] !== b[i]) diff++;
        return diff === 1;
    };
    const used = new Array(wordList.length).fill(false);
    let level = [beginWord];
    for (let len = 1; level.length; len++) {
        const next = [];
        for (const w of level)
            for (let i = 0; i < wordList.length; i++) {
                if (used[i] || !oneApart(w, wordList[i])) continue;
                if (wordList[i] === endWord) return len + 1;
                used[i] = true;
                next.push(wordList[i]);
            }
        level = next;
    }
    return 0;
};`,
        },
      },
      {
        level: 'Optimal', name: 'BFS generating neighbours letter by letter',
        idea: 'Instead of comparing with every word, generate the possible neighbours: change each position to each of the 26 letters and keep the results that are in the dictionary set. With N large, 26·L candidates per word is far fewer than N comparisons.',
        steps: [
          'Put `wordList` in a set; if `endWord` is not in it, return 0.',
          'BFS from `beginWord`. For each popped word, for each position and each letter, form the candidate.',
          'If the candidate is `endWord`, return length + 1; if it is in the set, remove it (marks it visited) and queue it.',
          'Return 0 if the BFS ends.',
        ],
        time: 'O(N·L²·26)', space: 'O(N·L)',
        why: 'Each word is popped once and builds 26·L candidates of length L (building and hashing one is O(L)). The set and queue hold O(N) words.',
        code: {
          java: r`class Solution {
    public int ladderLength(String beginWord, String endWord, List<String> wordList) {
        Set<String> dict = new HashSet<>(wordList);
        if (!dict.contains(endWord)) return 0;
        Deque<String> queue = new ArrayDeque<>();
        queue.add(beginWord);
        for (int len = 1; !queue.isEmpty(); len++) {
            for (int k = queue.size(); k > 0; k--) {
                char[] w = queue.poll().toCharArray();
                for (int i = 0; i < w.length; i++) {
                    char orig = w[i];
                    for (char c = 'a'; c <= 'z'; c++) {
                        if (c == orig) continue;
                        w[i] = c;
                        String cand = new String(w);
                        if (cand.equals(endWord)) return len + 1;
                        if (dict.remove(cand)) queue.add(cand);
                    }
                    w[i] = orig;
                }
            }
        }
        return 0;
    }
}`,
          cpp: r`class Solution {
public:
    int ladderLength(string beginWord, string endWord, vector<string>& wordList) {
        unordered_set<string> dict(wordList.begin(), wordList.end());
        if (!dict.count(endWord)) return 0;
        queue<string> q;
        q.push(beginWord);
        for (int len = 1; !q.empty(); len++) {
            for (int k = q.size(); k > 0; k--) {
                string w = q.front();
                q.pop();
                for (size_t i = 0; i < w.size(); i++) {
                    char orig = w[i];
                    for (char c = 'a'; c <= 'z'; c++) {
                        if (c == orig) continue;
                        w[i] = c;
                        if (w == endWord) return len + 1;
                        if (dict.erase(w)) q.push(w);
                    }
                    w[i] = orig;
                }
            }
        }
        return 0;
    }
};`,
          python: r`class Solution:
    def ladderLength(self, beginWord: str, endWord: str, wordList: List[str]) -> int:
        words = set(wordList)
        if endWord not in words:
            return 0
        level, length = [beginWord], 1
        while level:
            nxt = []
            for w in level:
                for i in range(len(w)):
                    for c in string.ascii_lowercase:
                        cand = w[:i] + c + w[i + 1:]
                        if cand == endWord:
                            return length + 1
                        if cand in words:
                            words.remove(cand)
                            nxt.append(cand)
            level, length = nxt, length + 1
        return 0`,
          javascript: r`var ladderLength = function(beginWord, endWord, wordList) {
    const words = new Set(wordList);
    if (!words.has(endWord)) return 0;
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    let level = [beginWord];
    for (let len = 1; level.length; len++) {
        const next = [];
        for (const w of level)
            for (let i = 0; i < w.length; i++)
                for (const c of letters) {
                    if (c === w[i]) continue;
                    const cand = w.slice(0, i) + c + w.slice(i + 1);
                    if (cand === endWord) return len + 1;
                    if (words.delete(cand)) next.push(cand);
                }
        level = next;
    }
    return 0;
};`,
        },
      },
    ],
  },
};
