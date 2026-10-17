export default [
  {
    slug: 'network-delay-time', title: 'Network Delay Time', level: 'Medium',
    summary: 'times[i] = [u, v, w] is a directed edge of travel time w between nodes 1..n. A signal starts at k. Return the time for all nodes to receive it, or -1 if some never do.',
    method: 'networkDelayTime', params: [['int[][]', 'times'], ['int', 'n'], ['int', 'k']], returns: 'int',
    tests: [
      { in: [[[2, 1, 1], [2, 3, 1], [3, 4, 1]], 4, 2], out: 2 },
      { in: [[[1, 2, 1]], 2, 1], out: 1 },
      { in: [[[1, 2, 1]], 2, 2], out: -1 },
      { in: [[[1, 2, 5], [1, 3, 1], [3, 2, 1]], 3, 1] },
    ],
    ref: `class Solution {
    public int networkDelayTime(int[][] times, int n, int k) {
        List<List<int[]>> adj = new ArrayList<>();
        for (int i = 0; i <= n; i++) adj.add(new ArrayList<>());
        for (int[] t : times) adj.get(t[0]).add(new int[] { t[1], t[2] });
        int[] dist = new int[n + 1];
        Arrays.fill(dist, Integer.MAX_VALUE); dist[k] = 0;
        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> Integer.compare(a[1], b[1]));
        pq.add(new int[] { k, 0 });
        while (!pq.isEmpty()) {
            int[] c = pq.poll();
            if (c[1] > dist[c[0]]) continue;
            for (int[] e : adj.get(c[0])) if (c[1] + e[1] < dist[e[0]]) { dist[e[0]] = c[1] + e[1]; pq.add(new int[] { e[0], dist[e[0]] }); }
        }
        int best = 0;
        for (int i = 1; i <= n; i++) { if (dist[i] == Integer.MAX_VALUE) return -1; best = Math.max(best, dist[i]); }
        return best;
    }
}`,
  },
  {
    slug: 'path-with-minimum-effort', title: 'Path With Minimum Effort', level: 'Medium',
    summary: 'A route\'s effort is the largest height difference between consecutive cells. Return the minimum effort to walk from the top-left to the bottom-right cell (4 directions).',
    method: 'minimumEffortPath', params: [['int[][]', 'heights']], returns: 'int',
    tests: [
      { in: [[[1, 2, 2], [3, 8, 2], [5, 3, 5]]], out: 2 },
      { in: [[[1, 2, 3], [3, 8, 4], [5, 3, 5]]], out: 1 },
      { in: [[[1, 2, 1, 1, 1], [1, 2, 1, 2, 1], [1, 2, 1, 2, 1], [1, 2, 1, 2, 1], [1, 1, 1, 2, 1]]], out: 0 },
      { in: [[[7]]] },
    ],
    ref: `class Solution {
    public int minimumEffortPath(int[][] h) {
        int r = h.length, c = h[0].length;
        int[][] best = new int[r][c];
        for (int[] row : best) Arrays.fill(row, Integer.MAX_VALUE);
        best[0][0] = 0;
        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> Integer.compare(a[2], b[2]));
        pq.add(new int[] { 0, 0, 0 });
        int[][] dirs = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } };
        while (!pq.isEmpty()) {
            int[] cur = pq.poll();
            if (cur[0] == r - 1 && cur[1] == c - 1) return cur[2];
            if (cur[2] > best[cur[0]][cur[1]]) continue;
            for (int[] d : dirs) {
                int a = cur[0] + d[0], b = cur[1] + d[1];
                if (a < 0 || b < 0 || a >= r || b >= c) continue;
                int e = Math.max(cur[2], Math.abs(h[a][b] - h[cur[0]][cur[1]]));
                if (e < best[a][b]) { best[a][b] = e; pq.add(new int[] { a, b, e }); }
            }
        }
        return 0;
    }
}`,
  },
  {
    slug: 'cheapest-flights-within-k-stops', title: 'Cheapest Flights Within K Stops', level: 'Medium',
    summary: 'flights[i] = [from, to, price]. Return the cheapest price from src to dst using at most k stops (k + 1 flights), or -1.',
    method: 'findCheapestPrice', params: [['int', 'n'], ['int[][]', 'flights'], ['int', 'src'], ['int', 'dst'], ['int', 'k']], returns: 'int',
    tests: [
      { in: [4, [[0, 1, 100], [1, 2, 100], [2, 0, 100], [1, 3, 600], [2, 3, 200]], 0, 3, 1], out: 700 },
      { in: [3, [[0, 1, 100], [1, 2, 100], [0, 2, 500]], 0, 2, 1], out: 200 },
      { in: [3, [[0, 1, 100], [1, 2, 100], [0, 2, 500]], 0, 2, 0], out: 500 },
      { in: [3, [[0, 1, 1]], 0, 2, 5] },
      { in: [5, [[0, 1, 5], [1, 2, 5], [0, 3, 2], [3, 1, 2], [1, 4, 1], [4, 2, 1]], 0, 2, 2] },
    ],
    ref: `class Solution {
    public int findCheapestPrice(int n, int[][] flights, int src, int dst, int k) {
        int[] dist = new int[n];
        Arrays.fill(dist, Integer.MAX_VALUE); dist[src] = 0;
        for (int round = 0; round <= k; round++) {
            int[] next = dist.clone();
            for (int[] f : flights) if (dist[f[0]] != Integer.MAX_VALUE && dist[f[0]] + f[2] < next[f[1]]) next[f[1]] = dist[f[0]] + f[2];
            dist = next;
        }
        return dist[dst] == Integer.MAX_VALUE ? -1 : dist[dst];
    }
}`,
  },
  {
    slug: 'path-with-maximum-probability', title: 'Path with Maximum Probability', level: 'Medium',
    summary: 'Each undirected edge succeeds with probability succProb[i]. Return the highest probability of a path from start_node to end_node (0 if none). Answers within 10^-5 are accepted.',
    method: 'maxProbability', params: [['int', 'n'], ['int[][]', 'edges'], ['double[]', 'succProb'], ['int', 'start_node'], ['int', 'end_node']], returns: 'double',
    tests: [
      { in: [3, [[0, 1], [1, 2], [0, 2]], [0.5, 0.5, 0.2], 0, 2], out: 0.25 },
      { in: [3, [[0, 1], [1, 2], [0, 2]], [0.5, 0.5, 0.3], 0, 2], out: 0.3 },
      { in: [3, [[0, 1]], [0.5], 0, 2], out: 0.0 },
      { in: [4, [[0, 1], [1, 3], [0, 2], [2, 3]], [0.9, 0.9, 0.5, 1.0], 0, 3] },
    ],
    ref: `class Solution {
    public double maxProbability(int n, int[][] edges, double[] succProb, int start, int end) {
        List<List<double[]>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (int i = 0; i < edges.length; i++) { adj.get(edges[i][0]).add(new double[] { edges[i][1], succProb[i] }); adj.get(edges[i][1]).add(new double[] { edges[i][0], succProb[i] }); }
        double[] best = new double[n];
        best[start] = 1;
        PriorityQueue<double[]> pq = new PriorityQueue<>((a, b) -> Double.compare(b[1], a[1]));
        pq.add(new double[] { start, 1 });
        while (!pq.isEmpty()) {
            double[] c = pq.poll(); int u = (int) c[0];
            if (u == end) return c[1];
            if (c[1] < best[u]) continue;
            for (double[] e : adj.get(u)) { int v = (int) e[0]; double p = c[1] * e[1]; if (p > best[v]) { best[v] = p; pq.add(new double[] { v, p }); } }
        }
        return 0;
    }
}`,
  },
  {
    slug: 'minimum-obstacle-removal-to-reach-corner', title: 'Minimum Obstacle Removal to Reach Corner', level: 'Hard',
    summary: 'Cells are 0 (empty) or 1 (obstacle you may remove). Return the fewest obstacles to remove to walk from the top-left to the bottom-right (4 directions).',
    method: 'minimumObstacles', params: [['int[][]', 'grid']], returns: 'int',
    tests: [
      { in: [[[0, 1, 1], [1, 1, 0], [1, 1, 0]]], out: 2 },
      { in: [[[0, 1, 0, 0, 0], [0, 1, 0, 1, 0], [0, 0, 0, 1, 0]]], out: 0 },
      { in: [[[0, 1], [1, 0]]] },
      { in: [[[0, 1, 1, 1, 0]]] },
    ],
    ref: `class Solution {
    public int minimumObstacles(int[][] grid) {
        int r = grid.length, c = grid[0].length;
        int[][] dist = new int[r][c];
        for (int[] row : dist) Arrays.fill(row, Integer.MAX_VALUE);
        Deque<int[]> dq = new ArrayDeque<>();
        dist[0][0] = 0; dq.add(new int[] { 0, 0 });
        int[][] dirs = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } };
        while (!dq.isEmpty()) {
            int[] p = dq.pollFirst();
            for (int[] d : dirs) {
                int a = p[0] + d[0], b = p[1] + d[1];
                if (a < 0 || b < 0 || a >= r || b >= c) continue;
                int nd = dist[p[0]][p[1]] + grid[a][b];
                if (nd < dist[a][b]) { dist[a][b] = nd; if (grid[a][b] == 0) dq.addFirst(new int[] { a, b }); else dq.addLast(new int[] { a, b }); }
            }
        }
        return dist[r - 1][c - 1];
    }
}`,
  },
  {
    slug: 'minimum-cost-to-make-at-least-one-valid-path-in-a-grid', title: 'Minimum Cost to Make at Least One Valid Path in a Grid', level: 'Hard',
    summary: 'Each cell points right (1), left (2), down (3) or up (4). Changing a cell\'s sign costs 1. Return the minimum cost to make a path from the top-left to the bottom-right by following signs.',
    method: 'minCost', params: [['int[][]', 'grid']], returns: 'int',
    tests: [
      { in: [[[1, 1, 1, 1], [2, 2, 2, 2], [1, 1, 1, 1], [2, 2, 2, 2]]], out: 3 },
      { in: [[[1, 1, 3], [3, 2, 2], [1, 1, 4]]], out: 0 },
      { in: [[[1, 2], [4, 3]]], out: 1 },
      { in: [[[4]]] },
    ],
    ref: `class Solution {
    public int minCost(int[][] grid) {
        int r = grid.length, c = grid[0].length;
        int[][] dirs = { {}, { 0, 1 }, { 0, -1 }, { 1, 0 }, { -1, 0 } };
        int[][] dist = new int[r][c];
        for (int[] row : dist) Arrays.fill(row, Integer.MAX_VALUE);
        Deque<int[]> dq = new ArrayDeque<>();
        dist[0][0] = 0; dq.add(new int[] { 0, 0 });
        while (!dq.isEmpty()) {
            int[] p = dq.pollFirst();
            for (int k = 1; k <= 4; k++) {
                int a = p[0] + dirs[k][0], b = p[1] + dirs[k][1];
                if (a < 0 || b < 0 || a >= r || b >= c) continue;
                int w = grid[p[0]][p[1]] == k ? 0 : 1, nd = dist[p[0]][p[1]] + w;
                if (nd < dist[a][b]) { dist[a][b] = nd; if (w == 0) dq.addFirst(new int[] { a, b }); else dq.addLast(new int[] { a, b }); }
            }
        }
        return dist[r - 1][c - 1];
    }
}`,
  },
  {
    slug: 'swim-in-rising-water', title: 'Swim in Rising Water', level: 'Hard',
    summary: 'At time t you can swim into any cell with height ≤ t. Return the least time to get from the top-left to the bottom-right of the n×n grid.',
    method: 'swimInWater', params: [['int[][]', 'grid']], returns: 'int',
    tests: [
      { in: [[[0, 2], [1, 3]]], out: 3 },
      { in: [[[0, 1, 2, 3, 4], [24, 23, 22, 21, 5], [12, 13, 14, 15, 16], [11, 17, 18, 19, 20], [10, 9, 8, 7, 6]]], out: 16 },
      { in: [[[0]]] },
      { in: [[[3, 2], [0, 1]]] },
    ],
    ref: `class Solution {
    public int swimInWater(int[][] grid) {
        int n = grid.length;
        boolean[][] seen = new boolean[n][n];
        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> Integer.compare(a[2], b[2]));
        pq.add(new int[] { 0, 0, grid[0][0] }); seen[0][0] = true;
        int[][] dirs = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } };
        while (true) {
            int[] p = pq.poll();
            if (p[0] == n - 1 && p[1] == n - 1) return p[2];
            for (int[] d : dirs) {
                int a = p[0] + d[0], b = p[1] + d[1];
                if (a < 0 || b < 0 || a >= n || b >= n || seen[a][b]) continue;
                seen[a][b] = true;
                pq.add(new int[] { a, b, Math.max(p[2], grid[a][b]) });
            }
        }
    }
}`,
  },
  {
    slug: 'find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance', title: 'Find the City With the Smallest Number of Neighbors at a Threshold Distance', level: 'Medium',
    summary: 'Return the city that can reach the fewest other cities within distanceThreshold along weighted undirected roads; on ties, the city with the larger number.',
    method: 'findTheCity', params: [['int', 'n'], ['int[][]', 'edges'], ['int', 'distanceThreshold']], returns: 'int',
    tests: [
      { in: [4, [[0, 1, 3], [1, 2, 1], [1, 3, 4], [2, 3, 1]], 4], out: 3 },
      { in: [5, [[0, 1, 2], [0, 4, 8], [1, 2, 3], [1, 4, 2], [2, 3, 1], [3, 4, 1]], 2], out: 0 },
      { in: [2, [[0, 1, 10]], 5] },
      { in: [3, [[0, 1, 1], [1, 2, 1]], 1] },
    ],
    ref: `class Solution {
    public int findTheCity(int n, int[][] edges, int threshold) {
        int[][] d = new int[n][n];
        for (int[] row : d) Arrays.fill(row, 1_000_000);
        for (int i = 0; i < n; i++) d[i][i] = 0;
        for (int[] e : edges) { d[e[0]][e[1]] = Math.min(d[e[0]][e[1]], e[2]); d[e[1]][e[0]] = Math.min(d[e[1]][e[0]], e[2]); }
        for (int k = 0; k < n; k++) for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) d[i][j] = Math.min(d[i][j], d[i][k] + d[k][j]);
        int best = -1, fewest = Integer.MAX_VALUE;
        for (int i = 0; i < n; i++) {
            int reach = 0;
            for (int j = 0; j < n; j++) if (j != i && d[i][j] <= threshold) reach++;
            if (reach <= fewest) { fewest = reach; best = i; }
        }
        return best;
    }
}`,
  },
];
