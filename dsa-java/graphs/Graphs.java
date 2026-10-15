// Patterns: Graph traversal, Topological sort, Union-Find, Shortest paths. Run: java dsa-java/graphs/Graphs.java
import java.util.*;

public class Graphs {
    static final int[][] DIRS = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } };

    public static void main(String[] args) {
        var rnd = new Random(14);
        for (int t = 0; t < 2_000; t++) {
            int R = 1 + rnd.nextInt(7), C = 1 + rnd.nextInt(7);
            char[][] g = new char[R][C]; for (char[] row : g) for (int j = 0; j < C; j++) row[j] = rnd.nextInt(5) < 2 ? '1' : '0';
            // islands: compare DFS count, BFS count and union-find count
            int dfs = numIslands(copy(g)), uf = numIslandsUF(g), bfs = numIslandsBFS(copy(g));
            Check.that(dfs == uf && uf == bfs, "numIslands DFS = BFS = union-find");
            int[][] gi = new int[R][C]; for (int i = 0; i < R; i++) for (int j = 0; j < C; j++) gi[i][j] = g[i][j] - '0';
            Check.that(maxAreaOfIsland(copyInt(gi)) == areaBrute(gi), "maxAreaOfIsland");
            // rotting oranges vs repeated simulation
            int[][] oranges = new int[R][C]; for (int[] row : oranges) for (int j = 0; j < C; j++) row[j] = rnd.nextInt(3);
            Check.that(orangesRotting(copyInt(oranges)) == rotSim(copyInt(oranges)), "orangesRotting multi-source BFS");
            // shortest path in binary matrix (8 directions) vs Floyd-style relaxation
            int[][] bm = new int[R][R]; for (int[] row : bm) for (int j = 0; j < R; j++) row[j] = rnd.nextInt(4) == 0 ? 1 : 0;
            Check.that(shortestPathBinaryMatrix(bm) == spBrute(bm), "shortestPathBinaryMatrix");

            // ---- random directed graph: topological sort ----
            int n = 1 + rnd.nextInt(8); int[][] pre = randomEdges(rnd, n, rnd.nextInt(12), true);
            int[] order = findOrder(n, pre);
            boolean cyclic = hasCycleBrute(n, pre);
            Check.that((order.length == 0) == cyclic, "findOrder detects cycles");
            if (!cyclic) { int[] pos = new int[n]; for (int i = 0; i < n; i++) pos[order[i]] = i; for (int[] e : pre) Check.that(pos[e[1]] < pos[e[0]], "prerequisite before course"); }
            Check.that(canFinish(n, pre) == !cyclic, "canFinish");
            int[] dfsOrder = findOrderDFS(n, pre);
            Check.that((dfsOrder.length == 0) == cyclic, "DFS topo detects cycles");
            if (!cyclic) { int[] pos = new int[n]; for (int i = 0; i < n; i++) pos[dfsOrder[i]] = i; for (int[] e : pre) Check.that(pos[e[1]] < pos[e[0]], "DFS topo order valid"); }

            // ---- union-find ----
            int[][] und = randomEdges(rnd, n, rnd.nextInt(10), false);
            Check.that(countComponents(n, und) == componentsDFS(n, und), "union-find components");
            int pts = 1 + rnd.nextInt(8); int[][] P = new int[pts][]; for (int i = 0; i < pts; i++) P[i] = new int[] { rnd.nextInt(20), rnd.nextInt(20) };
            Check.that(minCostConnectPoints(P) == primBrute(P), "Kruskal = Prim");
            String[] eqs = new String[rnd.nextInt(6)]; for (int i = 0; i < eqs.length; i++) eqs[i] = "" + (char) ('a' + rnd.nextInt(4)) + (rnd.nextBoolean() ? "==" : "!=") + (char) ('a' + rnd.nextInt(4));
            Check.that(equationsPossible(eqs) == equationsBrute(eqs), "equationsPossible");
            int[] red = findRedundantConnection(treePlusOne(rnd, n + 1));
            Check.that(red.length == 2, "redundant connection found");

            // ---- shortest paths ----
            int[][] times = randomWeighted(rnd, n, rnd.nextInt(15), 10);
            for (int[] e : times) { e[0]++; e[1]++; }                     // the problem numbers nodes 1..n
            int k = 1 + rnd.nextInt(n);
            Check.that(networkDelayTime(times, n, k) == delayBrute(times, n, k), "Dijkstra = Bellman-Ford");
            int[][] flights = randomWeighted(rnd, n, rnd.nextInt(15), 20);
            int src = rnd.nextInt(n), dst = rnd.nextInt(n), stops = rnd.nextInt(4);
            Check.that(findCheapestPrice(n, flights, src, dst, stops) == cheapestBrute(n, flights, src, dst, stops), "cheapest flights within k stops");
            int[][] heights = new int[R][C]; for (int[] row : heights) for (int j = 0; j < C; j++) row[j] = rnd.nextInt(10);
            Check.that(minimumEffortPath(heights) == effortBrute(heights), "minimumEffortPath");
            int[][] bin = new int[R][C]; for (int[] row : bin) for (int j = 0; j < C; j++) row[j] = rnd.nextInt(2);
            Check.that(zeroOneBFS(bin) == zeroOneBrute(bin), "0-1 BFS");
        }
        Check.done("graphs");
    }

    // ===================== Traversal =====================
    static int numIslands(char[][] grid) {
        int count = 0;
        for (int r = 0; r < grid.length; r++)
            for (int c = 0; c < grid[0].length; c++)
                if (grid[r][c] == '1') { count++; sink(grid, r, c); }   // each unvisited land cell starts a new island
        return count;
    }
    static void sink(char[][] g, int r, int c) {
        if (r < 0 || c < 0 || r >= g.length || c >= g[0].length || g[r][c] != '1') return;
        g[r][c] = '0';                                                  // mark visited by sinking it
        for (int[] d : DIRS) sink(g, r + d[0], c + d[1]);
    }

    static int numIslandsBFS(char[][] grid) {
        int R = grid.length, C = grid[0].length, count = 0;
        for (int r = 0; r < R; r++) for (int c = 0; c < C; c++) {
            if (grid[r][c] != '1') continue;
            count++;
            Deque<int[]> q = new ArrayDeque<>();
            q.offer(new int[] { r, c }); grid[r][c] = '0';             // mark when ENQUEUED, not when polled
            while (!q.isEmpty()) {
                int[] cell = q.poll();
                for (int[] d : DIRS) {
                    int nr = cell[0] + d[0], nc = cell[1] + d[1];
                    if (nr >= 0 && nc >= 0 && nr < R && nc < C && grid[nr][nc] == '1') { grid[nr][nc] = '0'; q.offer(new int[] { nr, nc }); }
                }
            }
        }
        return count;
    }

    static int maxAreaOfIsland(int[][] g) {
        int best = 0;
        for (int r = 0; r < g.length; r++) for (int c = 0; c < g[0].length; c++) best = Math.max(best, area(g, r, c));
        return best;
    }
    static int area(int[][] g, int r, int c) {
        if (r < 0 || c < 0 || r >= g.length || c >= g[0].length || g[r][c] != 1) return 0;
        g[r][c] = 0;
        return 1 + area(g, r + 1, c) + area(g, r - 1, c) + area(g, r, c + 1) + area(g, r, c - 1);
    }

    /** Multi-source BFS: every rotten orange starts in the queue at minute 0. */
    static int orangesRotting(int[][] grid) {
        int R = grid.length, C = grid[0].length, fresh = 0;
        Deque<int[]> q = new ArrayDeque<>();
        for (int r = 0; r < R; r++) for (int c = 0; c < C; c++) {
            if (grid[r][c] == 2) q.offer(new int[] { r, c });
            else if (grid[r][c] == 1) fresh++;
        }
        int minutes = 0;
        while (!q.isEmpty() && fresh > 0) {
            int size = q.size();                                       // one minute = one BFS level
            for (int i = 0; i < size; i++) {
                int[] cell = q.poll();
                for (int[] d : DIRS) {
                    int nr = cell[0] + d[0], nc = cell[1] + d[1];
                    if (nr >= 0 && nc >= 0 && nr < R && nc < C && grid[nr][nc] == 1) { grid[nr][nc] = 2; fresh--; q.offer(new int[] { nr, nc }); }
                }
            }
            minutes++;
        }
        return fresh == 0 ? minutes : -1;
    }

    static int shortestPathBinaryMatrix(int[][] grid) {
        int n = grid.length;
        if (grid[0][0] == 1 || grid[n - 1][n - 1] == 1) return -1;
        int[][] dist = new int[n][n];
        dist[0][0] = 1;
        Deque<int[]> q = new ArrayDeque<>(List.of(new int[] { 0, 0 }));
        while (!q.isEmpty()) {
            int[] cell = q.poll();
            if (cell[0] == n - 1 && cell[1] == n - 1) return dist[n - 1][n - 1];
            for (int dr = -1; dr <= 1; dr++) for (int dc = -1; dc <= 1; dc++) {
                int nr = cell[0] + dr, nc = cell[1] + dc;
                if (nr >= 0 && nc >= 0 && nr < n && nc < n && grid[nr][nc] == 0 && dist[nr][nc] == 0) {
                    dist[nr][nc] = dist[cell[0]][cell[1]] + 1;
                    q.offer(new int[] { nr, nc });
                }
            }
        }
        return -1;
    }

    // ===================== Topological sort (Kahn) =====================
    /** prerequisites[i] = {course, prereq}: prereq must come first. */
    static int[] findOrder(int n, int[][] prerequisites) {
        List<List<Integer>> graph = new ArrayList<>();
        for (int i = 0; i < n; i++) graph.add(new ArrayList<>());
        int[] indegree = new int[n];
        for (int[] p : prerequisites) { graph.get(p[1]).add(p[0]); indegree[p[0]]++; }   // edge prereq → course
        Deque<Integer> q = new ArrayDeque<>();
        for (int i = 0; i < n; i++) if (indegree[i] == 0) q.offer(i);                    // nothing blocks these
        int[] order = new int[n];
        int idx = 0;
        while (!q.isEmpty()) {
            int u = q.poll();
            order[idx++] = u;
            for (int v : graph.get(u)) if (--indegree[v] == 0) q.offer(v);              // v's last blocker is done
        }
        return idx == n ? order : new int[0];                                            // leftovers ⇒ a cycle
    }
    /** DFS topological sort with three colours: 0 = unvisited, 1 = on the current path, 2 = finished. */
    static int[] findOrderDFS(int n, int[][] prerequisites) {
        List<List<Integer>> graph = new ArrayList<>();
        for (int i = 0; i < n; i++) graph.add(new ArrayList<>());
        for (int[] p : prerequisites) graph.get(p[1]).add(p[0]);
        int[] state = new int[n];
        Deque<Integer> finished = new ArrayDeque<>();
        for (int i = 0; i < n; i++) if (state[i] == 0 && !dfsTopo(i, graph, state, finished)) return new int[0];
        int[] order = new int[n];
        for (int i = 0; i < n; i++) order[i] = finished.pop();      // reverse finishing order
        return order;
    }
    static boolean dfsTopo(int u, List<List<Integer>> graph, int[] state, Deque<Integer> finished) {
        state[u] = 1;                                                // on the current path
        for (int v : graph.get(u)) {
            if (state[v] == 1) return false;                         // back edge: a cycle
            if (state[v] == 0 && !dfsTopo(v, graph, state, finished)) return false;
        }
        state[u] = 2;
        finished.push(u);                                            // u finishes after everything that depends on it
        return true;
    }

    static boolean canFinish(int n, int[][] prerequisites) { return findOrder(n, prerequisites).length == n || n == 0; }

    // ===================== Union-Find =====================
    static class DSU {
        final int[] parent, size;
        int components;
        DSU(int n) { parent = new int[n]; size = new int[n]; components = n; for (int i = 0; i < n; i++) { parent[i] = i; size[i] = 1; } }
        int find(int x) {
            while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }   // path halving
            return x;
        }
        boolean union(int a, int b) {
            int ra = find(a), rb = find(b);
            if (ra == rb) return false;                                 // already connected
            if (size[ra] < size[rb]) { int t = ra; ra = rb; rb = t; }   // attach the smaller tree under the larger
            parent[rb] = ra; size[ra] += size[rb];
            components--;
            return true;
        }
    }

    static int countComponents(int n, int[][] edges) {
        DSU dsu = new DSU(n);
        for (int[] e : edges) dsu.union(e[0], e[1]);
        return dsu.components;
    }

    static int[] findRedundantConnection(int[][] edges) {
        DSU dsu = new DSU(edges.length + 1);
        for (int[] e : edges) if (!dsu.union(e[0], e[1])) return e;     // already connected → this edge closes a cycle
        return new int[0];
    }

    /** Kruskal: sort all edges by weight, add each one that joins two different groups. */
    static int minCostConnectPoints(int[][] p) {
        int n = p.length;
        List<int[]> edges = new ArrayList<>();                         // {cost, i, j}
        for (int i = 0; i < n; i++) for (int j = i + 1; j < n; j++)
            edges.add(new int[] { Math.abs(p[i][0] - p[j][0]) + Math.abs(p[i][1] - p[j][1]), i, j });
        edges.sort((a, b) -> Integer.compare(a[0], b[0]));
        DSU dsu = new DSU(n);
        int total = 0, used = 0;
        for (int[] e : edges) {
            if (dsu.union(e[1], e[2])) { total += e[0]; if (++used == n - 1) break; }   // skip edges inside a group (they'd form a cycle)
        }
        return total;
    }

    /** "a==b" unions first; then every "a!=b" must be in different groups. */
    static boolean equationsPossible(String[] equations) {
        DSU dsu = new DSU(26);
        for (String e : equations) if (e.charAt(1) == '=') dsu.union(e.charAt(0) - 'a', e.charAt(3) - 'a');
        for (String e : equations) if (e.charAt(1) == '!' && dsu.find(e.charAt(0) - 'a') == dsu.find(e.charAt(3) - 'a')) return false;
        return true;
    }

    static int numIslandsUF(char[][] g) {
        int R = g.length, C = g[0].length, water = 0;
        DSU dsu = new DSU(R * C);
        for (int r = 0; r < R; r++) for (int c = 0; c < C; c++) {
            if (g[r][c] != '1') { water++; continue; }
            if (r + 1 < R && g[r + 1][c] == '1') dsu.union(r * C + c, (r + 1) * C + c);
            if (c + 1 < C && g[r][c + 1] == '1') dsu.union(r * C + c, r * C + c + 1);
        }
        return dsu.components - water;
    }

    // ===================== Shortest paths =====================
    /** Dijkstra: times[i] = {from, to, weight}, nodes 1..n. */
    static int networkDelayTime(int[][] times, int n, int k) {
        List<List<int[]>> graph = new ArrayList<>();
        for (int i = 0; i <= n; i++) graph.add(new ArrayList<>());
        for (int[] e : times) graph.get(e[0]).add(new int[] { e[1], e[2] });
        int[] dist = new int[n + 1];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[k] = 0;
        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> Integer.compare(a[1], b[1]));   // {node, distance}
        pq.offer(new int[] { k, 0 });
        while (!pq.isEmpty()) {
            int[] top = pq.poll();
            int u = top[0], d = top[1];
            if (d > dist[u]) continue;                                   // stale entry: a shorter path was found already
            for (int[] e : graph.get(u)) {
                int v = e[0], nd = d + e[1];
                if (nd < dist[v]) { dist[v] = nd; pq.offer(new int[] { v, nd }); }
            }
        }
        int worst = 0;
        for (int i = 1; i <= n; i++) worst = Math.max(worst, dist[i]);
        return worst == Integer.MAX_VALUE ? -1 : worst;
    }

    /** At most k stops = at most k + 1 edges: Bellman-Ford limited to k + 1 rounds. */
    static int findCheapestPrice(int n, int[][] flights, int src, int dst, int k) {
        int[] cost = new int[n];
        Arrays.fill(cost, Integer.MAX_VALUE);
        cost[src] = 0;
        for (int round = 0; round <= k; round++) {
            int[] next = cost.clone();                                   // relax from LAST round's costs only
            for (int[] f : flights)
                if (cost[f[0]] != Integer.MAX_VALUE && cost[f[0]] + f[2] < next[f[1]]) next[f[1]] = cost[f[0]] + f[2];
            cost = next;
        }
        return cost[dst] == Integer.MAX_VALUE ? -1 : cost[dst];
    }

    /** Minimise the maximum step: Dijkstra where a path's cost is its largest edge. */
    static int minimumEffortPath(int[][] h) {
        int R = h.length, C = h[0].length;
        int[][] effort = new int[R][C];
        for (int[] row : effort) Arrays.fill(row, Integer.MAX_VALUE);
        effort[0][0] = 0;
        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> Integer.compare(a[2], b[2]));   // {r, c, effort}
        pq.offer(new int[] { 0, 0, 0 });
        while (!pq.isEmpty()) {
            int[] cur = pq.poll();
            if (cur[2] > effort[cur[0]][cur[1]]) continue;
            if (cur[0] == R - 1 && cur[1] == C - 1) return cur[2];
            for (int[] d : DIRS) {
                int nr = cur[0] + d[0], nc = cur[1] + d[1];
                if (nr < 0 || nc < 0 || nr >= R || nc >= C) continue;
                int ne = Math.max(cur[2], Math.abs(h[nr][nc] - h[cur[0]][cur[1]]));
                if (ne < effort[nr][nc]) { effort[nr][nc] = ne; pq.offer(new int[] { nr, nc, ne }); }
            }
        }
        return 0;
    }

    /** 0-1 BFS: moving onto a 1-cell costs 1, onto a 0-cell costs 0. Deque instead of a heap. */
    static int zeroOneBFS(int[][] grid) {
        int R = grid.length, C = grid[0].length;
        int[][] dist = new int[R][C];
        for (int[] row : dist) Arrays.fill(row, Integer.MAX_VALUE);
        dist[0][0] = grid[0][0];
        Deque<int[]> dq = new ArrayDeque<>(List.of(new int[] { 0, 0 }));
        while (!dq.isEmpty()) {
            int[] cur = dq.pollFirst();
            for (int[] d : DIRS) {
                int nr = cur[0] + d[0], nc = cur[1] + d[1];
                if (nr < 0 || nc < 0 || nr >= R || nc >= C) continue;
                int w = grid[nr][nc], nd = dist[cur[0]][cur[1]] + w;
                if (nd < dist[nr][nc]) {
                    dist[nr][nc] = nd;
                    if (w == 0) dq.offerFirst(new int[] { nr, nc });      // free move: front
                    else dq.offerLast(new int[] { nr, nc });              // cost 1: back
                }
            }
        }
        return dist[R - 1][C - 1];
    }

    // ===================== testing helpers =====================
    static char[][] copy(char[][] g) { char[][] c = new char[g.length][]; for (int i = 0; i < g.length; i++) c[i] = g[i].clone(); return c; }
    static int[][] copyInt(int[][] g) { int[][] c = new int[g.length][]; for (int i = 0; i < g.length; i++) c[i] = g[i].clone(); return c; }
    static int areaBrute(int[][] g) { int R = g.length, C = g[0].length; DSU d = new DSU(R * C); for (int r = 0; r < R; r++) for (int c = 0; c < C; c++) if (g[r][c] == 1) { if (r + 1 < R && g[r + 1][c] == 1) d.union(r * C + c, (r + 1) * C + c); if (c + 1 < C && g[r][c + 1] == 1) d.union(r * C + c, r * C + c + 1); }
        int best = 0; for (int r = 0; r < R; r++) for (int c = 0; c < C; c++) if (g[r][c] == 1) best = Math.max(best, d.size[d.find(r * C + c)]); return best; }
    static int rotSim(int[][] g) { int min = 0; while (true) { List<int[]> next = new ArrayList<>(); for (int r = 0; r < g.length; r++) for (int c = 0; c < g[0].length; c++) if (g[r][c] == 1) for (int[] d : DIRS) { int nr = r + d[0], nc = c + d[1]; if (nr >= 0 && nc >= 0 && nr < g.length && nc < g[0].length && g[nr][nc] == 2) { next.add(new int[] { r, c }); break; } }
        if (next.isEmpty()) break; for (int[] x : next) g[x[0]][x[1]] = 2; min++; } for (int[] row : g) for (int v : row) if (v == 1) return -1; return min; }
    static int spBrute(int[][] g) { int n = g.length, INF = 1_000_000; int[][] d = new int[n][n]; for (int[] row : d) Arrays.fill(row, INF); if (g[0][0] == 1) return -1; d[0][0] = 1;
        for (int it = 0; it < n * n; it++) for (int r = 0; r < n; r++) for (int c = 0; c < n; c++) if (g[r][c] == 0 && d[r][c] < INF) for (int dr = -1; dr <= 1; dr++) for (int dc = -1; dc <= 1; dc++) { int nr = r + dr, nc = c + dc; if (nr >= 0 && nc >= 0 && nr < n && nc < n && g[nr][nc] == 0) d[nr][nc] = Math.min(d[nr][nc], d[r][c] + 1); }
        return d[n - 1][n - 1] >= INF ? -1 : d[n - 1][n - 1]; }
    static int[][] randomEdges(Random r, int n, int m, boolean directed) { int[][] e = new int[m][]; for (int i = 0; i < m; i++) { int a = r.nextInt(n), b = r.nextInt(n); if (directed && a == b) b = (a + 1) % Math.max(1, n); e[i] = new int[] { a, b }; } if (directed && n == 1) return new int[0][]; return e; }
    static boolean hasCycleBrute(int n, int[][] pre) { int[] state = new int[n]; List<List<Integer>> g = new ArrayList<>(); for (int i = 0; i < n; i++) g.add(new ArrayList<>()); for (int[] p : pre) g.get(p[1]).add(p[0]);
        for (int i = 0; i < n; i++) if (dfsCycle(i, g, state)) return true; return false; }
    static boolean dfsCycle(int u, List<List<Integer>> g, int[] st) { if (st[u] == 1) return true; if (st[u] == 2) return false; st[u] = 1; for (int v : g.get(u)) if (dfsCycle(v, g, st)) return true; st[u] = 2; return false; }
    static int componentsDFS(int n, int[][] e) { List<List<Integer>> g = new ArrayList<>(); for (int i = 0; i < n; i++) g.add(new ArrayList<>()); for (int[] x : e) { g.get(x[0]).add(x[1]); g.get(x[1]).add(x[0]); }
        boolean[] seen = new boolean[n]; int c = 0; for (int i = 0; i < n; i++) if (!seen[i]) { c++; Deque<Integer> st = new ArrayDeque<>(List.of(i)); seen[i] = true; while (!st.isEmpty()) { int u = st.pop(); for (int v : g.get(u)) if (!seen[v]) { seen[v] = true; st.push(v); } } } return c; }
    static int primBrute(int[][] p) { int n = p.length; boolean[] in = new boolean[n]; int[] best = new int[n]; Arrays.fill(best, Integer.MAX_VALUE); best[0] = 0; int total = 0;
        for (int it = 0; it < n; it++) { int u = -1; for (int i = 0; i < n; i++) if (!in[i] && (u == -1 || best[i] < best[u])) u = i; in[u] = true; total += best[u];
            for (int v = 0; v < n; v++) if (!in[v]) best[v] = Math.min(best[v], Math.abs(p[u][0] - p[v][0]) + Math.abs(p[u][1] - p[v][1])); } return total; }
    static boolean equationsBrute(String[] eqs) { // try every assignment of 4 variables to values 0..3
        for (int mask = 0; mask < 256; mask++) { boolean ok = true; for (String e : eqs) { int a = (mask >> (2 * (e.charAt(0) - 'a'))) & 3, b = (mask >> (2 * (e.charAt(3) - 'a'))) & 3;
            if (e.charAt(1) == '=' ? a != b : a == b) { ok = false; break; } } if (ok) return true; } return false; }
    static int[][] treePlusOne(Random r, int n) { List<int[]> e = new ArrayList<>(); for (int i = 2; i <= n; i++) e.add(new int[] { 1 + r.nextInt(i - 1), i }); int a = 1 + r.nextInt(n), b; do b = 1 + r.nextInt(n); while (b == a); e.add(new int[] { a, b }); Collections.shuffle(e, r); return e.toArray(new int[0][]); }
    static int[][] randomWeighted(Random r, int n, int m, int maxW) { int[][] e = new int[m][]; for (int i = 0; i < m; i++) { int a = r.nextInt(n), b = r.nextInt(n); e[i] = new int[] { a, b, 1 + r.nextInt(maxW) }; } return e; }
    static int delayBrute(int[][] times, int n, int k) { // Bellman-Ford on 1-based edges
        long[] d = new long[n + 1]; Arrays.fill(d, Long.MAX_VALUE / 4); d[k] = 0;
        for (int it = 0; it < n; it++) for (int[] e : times) if (d[e[0]] + e[2] < d[e[1]]) d[e[1]] = d[e[0]] + e[2];
        long w = 0; for (int i = 1; i <= n; i++) w = Math.max(w, d[i]); return w >= Long.MAX_VALUE / 4 ? -1 : (int) w; }
    static int cheapestBrute(int n, int[][] fl, int src, int dst, int k) { int[] best = { Integer.MAX_VALUE }; walk(fl, src, dst, k + 1, 0, best); return best[0] == Integer.MAX_VALUE ? -1 : best[0]; }
    static void walk(int[][] fl, int u, int dst, int edgesLeft, int cost, int[] best) { if (u == dst) best[0] = Math.min(best[0], cost); if (edgesLeft == 0) return; for (int[] f : fl) if (f[0] == u) walk(fl, f[1], dst, edgesLeft - 1, cost + f[2], best); }
    static int effortBrute(int[][] h) { int R = h.length, C = h[0].length; for (int lim = 0; lim <= 10; lim++) { boolean[][] seen = new boolean[R][C]; Deque<int[]> q = new ArrayDeque<>(List.of(new int[] { 0, 0 })); seen[0][0] = true;
        while (!q.isEmpty()) { int[] c = q.poll(); for (int[] d : DIRS) { int nr = c[0] + d[0], nc = c[1] + d[1]; if (nr >= 0 && nc >= 0 && nr < R && nc < C && !seen[nr][nc] && Math.abs(h[nr][nc] - h[c[0]][c[1]]) <= lim) { seen[nr][nc] = true; q.offer(new int[] { nr, nc }); } } }
        if (seen[R - 1][C - 1]) return lim; } return -1; }
    static int zeroOneBrute(int[][] g) { int R = g.length, C = g[0].length, INF = 1_000_000; int[][] d = new int[R][C]; for (int[] row : d) Arrays.fill(row, INF); d[0][0] = g[0][0];
        for (int it = 0; it < R * C; it++) for (int r = 0; r < R; r++) for (int c = 0; c < C; c++) if (d[r][c] < INF) for (int[] dd : DIRS) { int nr = r + dd[0], nc = c + dd[1]; if (nr >= 0 && nc >= 0 && nr < R && nc < C) d[nr][nc] = Math.min(d[nr][nc], d[r][c] + g[nr][nc]); } return d[R - 1][C - 1]; }
}

final class Check {
    private static int passed;
    static void that(boolean cond, String what) { if (!cond) throw new AssertionError("FAILED: " + what); passed++; }
    static void done(String name) { System.out.println("✓ " + name + ": " + passed + " checks passed"); }
}
