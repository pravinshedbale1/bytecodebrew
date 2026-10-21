const r = String.raw;

export default {
  'network-delay-time': {
    pattern: 'Single-source shortest paths with non-negative weights (Dijkstra)',
    approaches: [
      {
        level: 'Better', name: 'Bellman–Ford: relax every edge n − 1 times',
        idea: 'A shortest path uses at most n − 1 edges. Starting with `dist[k] = 0`, relaxing every edge n − 1 times makes every distance final. The answer is the largest distance, or −1 if some node stays unreachable.',
        steps: [
          'Set `dist[k] = 0` and every other distance to ∞.',
          'Repeat n − 1 times: for every edge `u → v` of weight `w`, if `dist[u] + w < dist[v]`, update `dist[v]`.',
          'If any distance is still ∞, return −1; otherwise return the maximum distance.',
        ],
        time: 'O(V·E)', space: 'O(V)',
        why: 'n − 1 rounds over all E edges. Slower than Dijkstra, but it also handles negative edge weights.',
        code: {
          java: r`class Solution {
    public int networkDelayTime(int[][] times, int n, int k) {
        int INF = Integer.MAX_VALUE / 2;
        int[] dist = new int[n + 1];
        Arrays.fill(dist, INF);
        dist[k] = 0;
        for (int round = 1; round < n; round++)
            for (int[] t : times)
                if (dist[t[0]] + t[2] < dist[t[1]]) dist[t[1]] = dist[t[0]] + t[2];
        int best = 0;
        for (int i = 1; i <= n; i++) best = Math.max(best, dist[i]);
        return best == INF ? -1 : best;
    }
}`,
          cpp: r`class Solution {
public:
    int networkDelayTime(vector<vector<int>>& times, int n, int k) {
        const int INF = INT_MAX / 2;
        vector<int> dist(n + 1, INF);
        dist[k] = 0;
        for (int round = 1; round < n; round++)
            for (auto& t : times)
                if (dist[t[0]] + t[2] < dist[t[1]]) dist[t[1]] = dist[t[0]] + t[2];
        int best = *max_element(dist.begin() + 1, dist.end());
        return best == INF ? -1 : best;
    }
};`,
          python: r`class Solution:
    def networkDelayTime(self, times: List[List[int]], n: int, k: int) -> int:
        dist = [inf] * (n + 1)
        dist[k] = 0
        for _ in range(n - 1):
            for u, v, w in times:
                if dist[u] + w < dist[v]:
                    dist[v] = dist[u] + w
        best = max(dist[1:])
        return -1 if best == inf else best`,
          javascript: r`var networkDelayTime = function(times, n, k) {
    const dist = new Array(n + 1).fill(Infinity);
    dist[k] = 0;
    for (let round = 1; round < n; round++)
        for (const [u, v, w] of times)
            if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;
    const best = Math.max(...dist.slice(1));
    return best === Infinity ? -1 : best;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Dijkstra with a min-heap',
        idea: 'Always settle the unsettled node with the smallest known distance; with non-negative weights, no later path can make it shorter. Relax its outgoing edges and continue.',
        steps: [
          'Build adjacency lists. Push `(0, k)` into a min-heap; `dist[k] = 0`.',
          'Pop `(d, u)`; skip it if `d > dist[u]` (an outdated entry).',
          'For each edge `u → v` with weight `w`, if `d + w < dist[v]`, update `dist[v]` and push `(dist[v], v)`.',
          'Return the largest distance, or −1 if some node was never reached.',
        ],
        time: 'O(E log V)', space: 'O(V + E)',
        why: 'Each edge can push one heap entry, and each heap operation costs O(log E) = O(log V).',
        code: {
          java: r`class Solution {
    public int networkDelayTime(int[][] times, int n, int k) {
        List<List<int[]>> adj = new ArrayList<>();
        for (int i = 0; i <= n; i++) adj.add(new ArrayList<>());
        for (int[] t : times) adj.get(t[0]).add(new int[] { t[1], t[2] });
        int[] dist = new int[n + 1];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[k] = 0;
        PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));
        heap.add(new int[] { 0, k });
        while (!heap.isEmpty()) {
            int[] top = heap.poll();
            int d = top[0], u = top[1];
            if (d > dist[u]) continue;
            for (int[] e : adj.get(u))
                if (d + e[1] < dist[e[0]]) { dist[e[0]] = d + e[1]; heap.add(new int[] { dist[e[0]], e[0] }); }
        }
        int best = 0;
        for (int i = 1; i <= n; i++) best = Math.max(best, dist[i]);
        return best == Integer.MAX_VALUE ? -1 : best;
    }
}`,
          cpp: r`class Solution {
public:
    int networkDelayTime(vector<vector<int>>& times, int n, int k) {
        vector<vector<pair<int, int>>> adj(n + 1);
        for (auto& t : times) adj[t[0]].push_back({t[1], t[2]});
        vector<int> dist(n + 1, INT_MAX);
        dist[k] = 0;
        priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> heap;
        heap.push({0, k});
        while (!heap.empty()) {
            auto [d, u] = heap.top();
            heap.pop();
            if (d > dist[u]) continue;
            for (auto [v, w] : adj[u])
                if (d + w < dist[v]) { dist[v] = d + w; heap.push({dist[v], v}); }
        }
        int best = *max_element(dist.begin() + 1, dist.end());
        return best == INT_MAX ? -1 : best;
    }
};`,
          python: r`class Solution:
    def networkDelayTime(self, times: List[List[int]], n: int, k: int) -> int:
        adj = defaultdict(list)
        for u, v, w in times:
            adj[u].append((v, w))
        dist = {}
        heap = [(0, k)]
        while heap:
            d, u = heappop(heap)
            if u in dist:
                continue
            dist[u] = d
            for v, w in adj[u]:
                if v not in dist:
                    heappush(heap, (d + w, v))
        return max(dist.values()) if len(dist) == n else -1`,
          javascript: r`var networkDelayTime = function(times, n, k) {
    const adj = Array.from({ length: n + 1 }, () => []);
    for (const [u, v, w] of times) adj[u].push([v, w]);
    const dist = new Array(n + 1).fill(Infinity);
    dist[k] = 0;
    const heap = new PriorityQueue((a, b) => a[0] - b[0]);
    heap.enqueue([0, k]);
    while (heap.size()) {
        const [d, u] = heap.dequeue();
        if (d > dist[u]) continue;
        for (const [v, w] of adj[u])
            if (d + w < dist[v]) { dist[v] = d + w; heap.enqueue([dist[v], v]); }
    }
    const best = Math.max(...dist.slice(1));
    return best === Infinity ? -1 : best;
};`,
        },
      },
    ],
  },

  'path-with-minimum-effort': {
    pattern: 'Minimax path: Dijkstra where a path\'s cost is its largest step (or binary search + BFS)',
    approaches: [
      {
        level: 'Better', name: 'Binary search the effort, check with BFS',
        idea: 'For a limit `E`, ask: can you reach the corner using only steps with height difference ≤ `E`? That is a plain BFS, and if it works for `E` it works for anything larger. Binary search the smallest `E`.',
        steps: [
          'Search `E` in `[0, 10⁶]`.',
          'BFS from the top-left using only moves whose height difference is at most `E`; see whether the bottom-right is reached.',
          'If reachable, `hi = E`; else `lo = E + 1`. Return `lo`.',
        ],
        time: 'O(m·n·log H)', space: 'O(m·n)',
        why: 'About 20 BFS runs (H = 10⁶ is the height range), each O(m·n).',
        code: {
          java: r`class Solution {
    public int minimumEffortPath(int[][] heights) {
        int lo = 0, hi = 1_000_000;
        while (lo < hi) {
            int mid = (lo + hi) >>> 1;
            if (reachable(heights, mid)) hi = mid; else lo = mid + 1;
        }
        return lo;
    }

    private boolean reachable(int[][] h, int limit) {
        int m = h.length, n = h[0].length;
        boolean[][] seen = new boolean[m][n];
        int[][] dirs = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } };
        Deque<int[]> queue = new ArrayDeque<>();
        queue.add(new int[] { 0, 0 });
        seen[0][0] = true;
        while (!queue.isEmpty()) {
            int[] c = queue.poll();
            if (c[0] == m - 1 && c[1] == n - 1) return true;
            for (int[] d : dirs) {
                int r = c[0] + d[0], col = c[1] + d[1];
                if (r >= 0 && col >= 0 && r < m && col < n && !seen[r][col] && Math.abs(h[r][col] - h[c[0]][c[1]]) <= limit) {
                    seen[r][col] = true;
                    queue.add(new int[] { r, col });
                }
            }
        }
        return false;
    }
}`,
          cpp: r`class Solution {
    bool reachable(vector<vector<int>>& h, int limit) {
        int m = h.size(), n = h[0].size();
        vector<vector<bool>> seen(m, vector<bool>(n, false));
        int dr[] = {1, -1, 0, 0}, dc[] = {0, 0, 1, -1};
        queue<pair<int, int>> q;
        q.push({0, 0});
        seen[0][0] = true;
        while (!q.empty()) {
            auto [r0, c0] = q.front();
            q.pop();
            if (r0 == m - 1 && c0 == n - 1) return true;
            for (int k = 0; k < 4; k++) {
                int r = r0 + dr[k], c = c0 + dc[k];
                if (r >= 0 && c >= 0 && r < m && c < n && !seen[r][c] && abs(h[r][c] - h[r0][c0]) <= limit) {
                    seen[r][c] = true;
                    q.push({r, c});
                }
            }
        }
        return false;
    }
public:
    int minimumEffortPath(vector<vector<int>>& heights) {
        int lo = 0, hi = 1000000;
        while (lo < hi) {
            int mid = (lo + hi) / 2;
            if (reachable(heights, mid)) hi = mid; else lo = mid + 1;
        }
        return lo;
    }
};`,
          python: r`class Solution:
    def minimumEffortPath(self, heights: List[List[int]]) -> int:
        m, n = len(heights), len(heights[0])
        def reachable(limit):
            seen, queue = {(0, 0)}, deque([(0, 0)])
            while queue:
                r0, c0 = queue.popleft()
                if (r0, c0) == (m - 1, n - 1):
                    return True
                for r, c in ((r0 + 1, c0), (r0 - 1, c0), (r0, c0 + 1), (r0, c0 - 1)):
                    if 0 <= r < m and 0 <= c < n and (r, c) not in seen and abs(heights[r][c] - heights[r0][c0]) <= limit:
                        seen.add((r, c))
                        queue.append((r, c))
            return False
        lo, hi = 0, 10**6
        while lo < hi:
            mid = (lo + hi) // 2
            if reachable(mid):
                hi = mid
            else:
                lo = mid + 1
        return lo`,
          javascript: r`var minimumEffortPath = function(heights) {
    const m = heights.length, n = heights[0].length;
    const reachable = (limit) => {
        const seen = new Uint8Array(m * n), queue = [[0, 0]];
        seen[0] = 1;
        for (let h = 0; h < queue.length; h++) {
            const [r0, c0] = queue[h];
            if (r0 === m - 1 && c0 === n - 1) return true;
            for (const [r, c] of [[r0 + 1, c0], [r0 - 1, c0], [r0, c0 + 1], [r0, c0 - 1]]) {
                if (r >= 0 && c >= 0 && r < m && c < n && !seen[r * n + c] && Math.abs(heights[r][c] - heights[r0][c0]) <= limit) {
                    seen[r * n + c] = 1;
                    queue.push([r, c]);
                }
            }
        }
        return false;
    };
    let lo = 0, hi = 1000000;
    while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (reachable(mid)) hi = mid; else lo = mid + 1;
    }
    return lo;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Dijkstra on the largest step so far',
        idea: 'Let `effort[cell]` be the smallest possible "largest step" of a path to it. Extending a path with a step of size `d` gives effort `max(current, d)`, which never decreases — so Dijkstra still works with `max` in place of `+`.',
        steps: [
          'Set `effort[0][0] = 0` and push it into a min-heap.',
          'Pop the cell with the smallest effort; if it is the bottom-right, return it (skip outdated entries).',
          'For each neighbour, `candidate = max(effort, |height difference|)`; if smaller than its recorded effort, record and push it.',
        ],
        time: 'O(m·n·log(m·n))', space: 'O(m·n)',
        why: 'Each cell has 4 edges, so O(m·n) heap pushes of O(log(m·n)) each.',
        code: {
          java: r`class Solution {
    public int minimumEffortPath(int[][] heights) {
        int m = heights.length, n = heights[0].length;
        int[][] effort = new int[m][n];
        for (int[] row : effort) Arrays.fill(row, Integer.MAX_VALUE);
        effort[0][0] = 0;
        PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));
        heap.add(new int[] { 0, 0, 0 });
        int[][] dirs = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } };
        while (!heap.isEmpty()) {
            int[] top = heap.poll();
            int e = top[0], r0 = top[1], c0 = top[2];
            if (e > effort[r0][c0]) continue;
            if (r0 == m - 1 && c0 == n - 1) return e;
            for (int[] d : dirs) {
                int r = r0 + d[0], c = c0 + d[1];
                if (r < 0 || c < 0 || r >= m || c >= n) continue;
                int cand = Math.max(e, Math.abs(heights[r][c] - heights[r0][c0]));
                if (cand < effort[r][c]) { effort[r][c] = cand; heap.add(new int[] { cand, r, c }); }
            }
        }
        return 0;
    }
}`,
          cpp: r`class Solution {
public:
    int minimumEffortPath(vector<vector<int>>& heights) {
        int m = heights.size(), n = heights[0].size();
        vector<vector<int>> effort(m, vector<int>(n, INT_MAX));
        effort[0][0] = 0;
        priority_queue<array<int, 3>, vector<array<int, 3>>, greater<>> heap;
        heap.push({0, 0, 0});
        int dr[] = {1, -1, 0, 0}, dc[] = {0, 0, 1, -1};
        while (!heap.empty()) {
            auto [e, r0, c0] = heap.top();
            heap.pop();
            if (e > effort[r0][c0]) continue;
            if (r0 == m - 1 && c0 == n - 1) return e;
            for (int k = 0; k < 4; k++) {
                int r = r0 + dr[k], c = c0 + dc[k];
                if (r < 0 || c < 0 || r >= m || c >= n) continue;
                int cand = max(e, abs(heights[r][c] - heights[r0][c0]));
                if (cand < effort[r][c]) { effort[r][c] = cand; heap.push({cand, r, c}); }
            }
        }
        return 0;
    }
};`,
          python: r`class Solution:
    def minimumEffortPath(self, heights: List[List[int]]) -> int:
        m, n = len(heights), len(heights[0])
        effort = [[inf] * n for _ in range(m)]
        effort[0][0] = 0
        heap = [(0, 0, 0)]
        while heap:
            e, r0, c0 = heappop(heap)
            if e > effort[r0][c0]:
                continue
            if (r0, c0) == (m - 1, n - 1):
                return e
            for r, c in ((r0 + 1, c0), (r0 - 1, c0), (r0, c0 + 1), (r0, c0 - 1)):
                if 0 <= r < m and 0 <= c < n:
                    cand = max(e, abs(heights[r][c] - heights[r0][c0]))
                    if cand < effort[r][c]:
                        effort[r][c] = cand
                        heappush(heap, (cand, r, c))
        return 0`,
          javascript: r`var minimumEffortPath = function(heights) {
    const m = heights.length, n = heights[0].length;
    const effort = Array.from({ length: m }, () => new Array(n).fill(Infinity));
    effort[0][0] = 0;
    const heap = new PriorityQueue((a, b) => a[0] - b[0]);
    heap.enqueue([0, 0, 0]);
    while (heap.size()) {
        const [e, r0, c0] = heap.dequeue();
        if (e > effort[r0][c0]) continue;
        if (r0 === m - 1 && c0 === n - 1) return e;
        for (const [r, c] of [[r0 + 1, c0], [r0 - 1, c0], [r0, c0 + 1], [r0, c0 - 1]]) {
            if (r < 0 || c < 0 || r >= m || c >= n) continue;
            const cand = Math.max(e, Math.abs(heights[r][c] - heights[r0][c0]));
            if (cand < effort[r][c]) { effort[r][c] = cand; heap.enqueue([cand, r, c]); }
        }
    }
    return 0;
};`,
        },
      },
    ],
  },

  'cheapest-flights-within-k-stops': {
    pattern: 'Bellman–Ford limited to k + 1 rounds (shortest path with at most k + 1 edges)',
    approaches: [
      {
        level: 'Brute force', name: 'DFS over every route with at most k + 1 flights',
        idea: 'Explore every route from `src` that uses at most k + 1 flights, and keep the cheapest one that ends at `dst`. Prune routes that already cost more than the best found.',
        steps: [
          '`dfs(city, flightsLeft, cost)`: if `cost >= best`, stop; if `city == dst`, record `cost`.',
          'If flights remain, follow every outgoing flight with `flightsLeft − 1`.',
          'Start with `dfs(src, k + 1, 0)` and return the best, or −1.',
        ],
        time: 'O(dᵏ⁺¹)', space: 'O(k)',
        why: 'With out-degree d, the number of routes grows exponentially in k; pruning helps but does not change the worst case.',
        code: {
          java: r`class Solution {
    private List<List<int[]>> adj;
    private int dst, best = Integer.MAX_VALUE;

    public int findCheapestPrice(int n, int[][] flights, int src, int dst, int k) {
        adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (int[] f : flights) adj.get(f[0]).add(new int[] { f[1], f[2] });
        this.dst = dst;
        dfs(src, k + 1, 0);
        return best == Integer.MAX_VALUE ? -1 : best;
    }

    private void dfs(int city, int left, int cost) {
        if (cost >= best) return;
        if (city == dst) { best = cost; return; }
        if (left == 0) return;
        for (int[] f : adj.get(city)) dfs(f[0], left - 1, cost + f[1]);
    }
}`,
          cpp: r`class Solution {
    vector<vector<pair<int, int>>> adj;
    int dst, best = INT_MAX;
    void dfs(int city, int left, int cost) {
        if (cost >= best) return;
        if (city == dst) { best = cost; return; }
        if (left == 0) return;
        for (auto [v, p] : adj[city]) dfs(v, left - 1, cost + p);
    }
public:
    int findCheapestPrice(int n, vector<vector<int>>& flights, int src, int dst, int k) {
        adj.assign(n, {});
        for (auto& f : flights) adj[f[0]].push_back({f[1], f[2]});
        this->dst = dst;
        dfs(src, k + 1, 0);
        return best == INT_MAX ? -1 : best;
    }
};`,
          python: r`class Solution:
    def findCheapestPrice(self, n: int, flights: List[List[int]], src: int, dst: int, k: int) -> int:
        adj = defaultdict(list)
        for u, v, p in flights:
            adj[u].append((v, p))
        best = inf
        def dfs(city, left, cost):
            nonlocal best
            if cost >= best:
                return
            if city == dst:
                best = cost
                return
            if left:
                for v, p in adj[city]:
                    dfs(v, left - 1, cost + p)
        dfs(src, k + 1, 0)
        return -1 if best == inf else best`,
          javascript: r`var findCheapestPrice = function(n, flights, src, dst, k) {
    const adj = Array.from({ length: n }, () => []);
    for (const [u, v, p] of flights) adj[u].push([v, p]);
    let best = Infinity;
    const dfs = (city, left, cost) => {
        if (cost >= best) return;
        if (city === dst) { best = cost; return; }
        if (left === 0) return;
        for (const [v, p] of adj[city]) dfs(v, left - 1, cost + p);
    };
    dfs(src, k + 1, 0);
    return best === Infinity ? -1 : best;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Bellman–Ford for exactly k + 1 rounds',
        idea: 'After round `i` of Bellman–Ford, `dist` holds the cheapest prices using at most `i` flights — as long as each round reads the previous round\'s values (a copy), so one round cannot chain several flights together.',
        steps: [
          'Set `dist[src] = 0`, all others ∞.',
          'Repeat k + 1 times: copy `dist` to `next`; for each flight `u → v` with price `p`, if `dist[u] + p < next[v]`, set `next[v]`. Then `dist = next`.',
          'Return `dist[dst]`, or −1 if it is still ∞.',
        ],
        time: 'O(k·E)', space: 'O(V)',
        why: 'k + 1 rounds over all E flights, with two arrays of size V. Plain Dijkstra fails here, because the cheapest path might use too many stops.',
        code: {
          java: r`class Solution {
    public int findCheapestPrice(int n, int[][] flights, int src, int dst, int k) {
        int INF = Integer.MAX_VALUE;
        int[] dist = new int[n];
        Arrays.fill(dist, INF);
        dist[src] = 0;
        for (int round = 0; round <= k; round++) {
            int[] next = dist.clone();
            for (int[] f : flights)
                if (dist[f[0]] != INF && dist[f[0]] + f[2] < next[f[1]]) next[f[1]] = dist[f[0]] + f[2];
            dist = next;
        }
        return dist[dst] == INF ? -1 : dist[dst];
    }
}`,
          cpp: r`class Solution {
public:
    int findCheapestPrice(int n, vector<vector<int>>& flights, int src, int dst, int k) {
        const int INF = INT_MAX;
        vector<int> dist(n, INF);
        dist[src] = 0;
        for (int round = 0; round <= k; round++) {
            vector<int> next = dist;
            for (auto& f : flights)
                if (dist[f[0]] != INF && dist[f[0]] + f[2] < next[f[1]]) next[f[1]] = dist[f[0]] + f[2];
            dist = next;
        }
        return dist[dst] == INF ? -1 : dist[dst];
    }
};`,
          python: r`class Solution:
    def findCheapestPrice(self, n: int, flights: List[List[int]], src: int, dst: int, k: int) -> int:
        dist = [inf] * n
        dist[src] = 0
        for _ in range(k + 1):
            nxt = dist[:]
            for u, v, p in flights:
                if dist[u] + p < nxt[v]:
                    nxt[v] = dist[u] + p
            dist = nxt
        return -1 if dist[dst] == inf else dist[dst]`,
          javascript: r`var findCheapestPrice = function(n, flights, src, dst, k) {
    let dist = new Array(n).fill(Infinity);
    dist[src] = 0;
    for (let round = 0; round <= k; round++) {
        const next = dist.slice();
        for (const [u, v, p] of flights)
            if (dist[u] + p < next[v]) next[v] = dist[u] + p;
        dist = next;
    }
    return dist[dst] === Infinity ? -1 : dist[dst];
};`,
        },
      },
    ],
  },

  'path-with-maximum-probability': {
    pattern: 'Dijkstra for a "best product" path (max-heap; probabilities only shrink along a path)',
    approaches: [
      {
        level: 'Better', name: 'Bellman–Ford style relaxation until nothing improves',
        idea: 'Keep the best known probability for each node. Repeatedly go over every edge (both directions) and improve a node if reaching it through the edge gives a higher product. Stop when a full pass changes nothing.',
        steps: [
          'Set `prob[start] = 1`, others 0.',
          'Repeat up to n − 1 times: for each edge `(a, b, p)`, update `prob[b]` with `prob[a]·p` and `prob[a]` with `prob[b]·p` if larger.',
          'Stop early when a pass makes no change; return `prob[end]`.',
        ],
        time: 'O(V·E)', space: 'O(V)',
        why: 'At most n − 1 passes over E edges; the early stop makes it fast on most inputs.',
        code: {
          java: r`class Solution {
    public double maxProbability(int n, int[][] edges, double[] succProb, int start_node, int end_node) {
        double[] prob = new double[n];
        prob[start_node] = 1;
        for (int round = 1; round < n; round++) {
            boolean changed = false;
            for (int i = 0; i < edges.length; i++) {
                int a = edges[i][0], b = edges[i][1];
                double p = succProb[i];
                if (prob[a] * p > prob[b]) { prob[b] = prob[a] * p; changed = true; }
                if (prob[b] * p > prob[a]) { prob[a] = prob[b] * p; changed = true; }
            }
            if (!changed) break;
        }
        return prob[end_node];
    }
}`,
          cpp: r`class Solution {
public:
    double maxProbability(int n, vector<vector<int>>& edges, vector<double>& succProb, int start_node, int end_node) {
        vector<double> prob(n, 0.0);
        prob[start_node] = 1;
        for (int round = 1; round < n; round++) {
            bool changed = false;
            for (size_t i = 0; i < edges.size(); i++) {
                int a = edges[i][0], b = edges[i][1];
                double p = succProb[i];
                if (prob[a] * p > prob[b]) { prob[b] = prob[a] * p; changed = true; }
                if (prob[b] * p > prob[a]) { prob[a] = prob[b] * p; changed = true; }
            }
            if (!changed) break;
        }
        return prob[end_node];
    }
};`,
          python: r`class Solution:
    def maxProbability(self, n: int, edges: List[List[int]], succProb: List[float], start_node: int, end_node: int) -> float:
        prob = [0.0] * n
        prob[start_node] = 1.0
        for _ in range(n - 1):
            changed = False
            for (a, b), p in zip(edges, succProb):
                if prob[a] * p > prob[b]:
                    prob[b] = prob[a] * p
                    changed = True
                if prob[b] * p > prob[a]:
                    prob[a] = prob[b] * p
                    changed = True
            if not changed:
                break
        return prob[end_node]`,
          javascript: r`var maxProbability = function(n, edges, succProb, start_node, end_node) {
    const prob = new Array(n).fill(0);
    prob[start_node] = 1;
    for (let round = 1; round < n; round++) {
        let changed = false;
        edges.forEach(([a, b], i) => {
            const p = succProb[i];
            if (prob[a] * p > prob[b]) { prob[b] = prob[a] * p; changed = true; }
            if (prob[b] * p > prob[a]) { prob[a] = prob[b] * p; changed = true; }
        });
        if (!changed) break;
    }
    return prob[end_node];
};`,
        },
      },
      {
        level: 'Optimal', name: 'Dijkstra with a max-heap',
        idea: 'Multiplying by a probability ≤ 1 can only keep a value the same or make it smaller — the mirror image of adding a non-negative weight. So Dijkstra works with a max-heap: the node with the highest probability popped first is final.',
        steps: [
          'Build adjacency lists with probabilities (both directions).',
          'Push `(1, start)`; `best[start] = 1`.',
          'Pop the largest probability; if it is the end node, return it; skip outdated entries.',
          'For each neighbour, if `p·edge > best[nb]`, update and push. Return 0 if the end is never reached.',
        ],
        time: 'O(E log V)', space: 'O(V + E)',
        why: 'Each edge can cause one push, at O(log V) per heap operation.',
        code: {
          java: r`class Solution {
    public double maxProbability(int n, int[][] edges, double[] succProb, int start_node, int end_node) {
        List<List<double[]>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (int i = 0; i < edges.length; i++) {
            adj.get(edges[i][0]).add(new double[] { edges[i][1], succProb[i] });
            adj.get(edges[i][1]).add(new double[] { edges[i][0], succProb[i] });
        }
        double[] best = new double[n];
        best[start_node] = 1;
        PriorityQueue<double[]> heap = new PriorityQueue<>((a, b) -> Double.compare(b[0], a[0]));
        heap.add(new double[] { 1, start_node });
        while (!heap.isEmpty()) {
            double[] top = heap.poll();
            double p = top[0];
            int u = (int) top[1];
            if (u == end_node) return p;
            if (p < best[u]) continue;
            for (double[] e : adj.get(u)) {
                int v = (int) e[0];
                if (p * e[1] > best[v]) { best[v] = p * e[1]; heap.add(new double[] { best[v], v }); }
            }
        }
        return 0;
    }
}`,
          cpp: r`class Solution {
public:
    double maxProbability(int n, vector<vector<int>>& edges, vector<double>& succProb, int start_node, int end_node) {
        vector<vector<pair<int, double>>> adj(n);
        for (size_t i = 0; i < edges.size(); i++) {
            adj[edges[i][0]].push_back({edges[i][1], succProb[i]});
            adj[edges[i][1]].push_back({edges[i][0], succProb[i]});
        }
        vector<double> best(n, 0.0);
        best[start_node] = 1;
        priority_queue<pair<double, int>> heap;
        heap.push({1.0, start_node});
        while (!heap.empty()) {
            auto [p, u] = heap.top();
            heap.pop();
            if (u == end_node) return p;
            if (p < best[u]) continue;
            for (auto [v, q] : adj[u])
                if (p * q > best[v]) { best[v] = p * q; heap.push({best[v], v}); }
        }
        return 0;
    }
};`,
          python: r`class Solution:
    def maxProbability(self, n: int, edges: List[List[int]], succProb: List[float], start_node: int, end_node: int) -> float:
        adj = defaultdict(list)
        for (a, b), p in zip(edges, succProb):
            adj[a].append((b, p))
            adj[b].append((a, p))
        best = [0.0] * n
        best[start_node] = 1.0
        heap = [(-1.0, start_node)]  # negated for a max-heap
        while heap:
            neg, u = heappop(heap)
            p = -neg
            if u == end_node:
                return p
            if p < best[u]:
                continue
            for v, q in adj[u]:
                if p * q > best[v]:
                    best[v] = p * q
                    heappush(heap, (-best[v], v))
        return 0.0`,
          javascript: r`var maxProbability = function(n, edges, succProb, start_node, end_node) {
    const adj = Array.from({ length: n }, () => []);
    edges.forEach(([a, b], i) => { adj[a].push([b, succProb[i]]); adj[b].push([a, succProb[i]]); });
    const best = new Array(n).fill(0);
    best[start_node] = 1;
    const heap = new PriorityQueue((x, y) => y[0] - x[0]);
    heap.enqueue([1, start_node]);
    while (heap.size()) {
        const [p, u] = heap.dequeue();
        if (u === end_node) return p;
        if (p < best[u]) continue;
        for (const [v, q] of adj[u])
            if (p * q > best[v]) { best[v] = p * q; heap.enqueue([best[v], v]); }
    }
    return 0;
};`,
        },
      },
    ],
  },

  'minimum-obstacle-removal-to-reach-corner': {
    pattern: '0-1 BFS: edges cost 0 or 1, so a deque replaces Dijkstra\'s heap',
    approaches: [
      {
        level: 'Better', name: 'Dijkstra: entering an obstacle costs 1',
        idea: 'Treat each cell as a node; moving into a cell costs its value (1 for an obstacle, 0 for empty). The answer is the cheapest path cost from the top-left to the bottom-right.',
        steps: [
          'Set `cost[0][0] = 0`; push it into a min-heap.',
          'Pop the cheapest cell (skip outdated entries); if it is the target, return its cost.',
          'For each neighbour, `cand = cost + grid[neighbour]`; if better, record and push.',
        ],
        time: 'O(m·n·log(m·n))', space: 'O(m·n)',
        why: 'Standard Dijkstra over m·n cells with 4 edges each. Correct, but the heap is more than needed when costs are only 0 or 1.',
        code: {
          java: r`class Solution {
    public int minimumObstacles(int[][] grid) {
        int m = grid.length, n = grid[0].length;
        int[][] cost = new int[m][n];
        for (int[] row : cost) Arrays.fill(row, Integer.MAX_VALUE);
        cost[0][0] = 0;
        PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));
        heap.add(new int[] { 0, 0, 0 });
        int[][] dirs = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } };
        while (!heap.isEmpty()) {
            int[] top = heap.poll();
            int c0 = top[0], r = top[1], c = top[2];
            if (c0 > cost[r][c]) continue;
            if (r == m - 1 && c == n - 1) return c0;
            for (int[] d : dirs) {
                int rr = r + d[0], cc = c + d[1];
                if (rr < 0 || cc < 0 || rr >= m || cc >= n) continue;
                int cand = c0 + grid[rr][cc];
                if (cand < cost[rr][cc]) { cost[rr][cc] = cand; heap.add(new int[] { cand, rr, cc }); }
            }
        }
        return -1;
    }
}`,
          cpp: r`class Solution {
public:
    int minimumObstacles(vector<vector<int>>& grid) {
        int m = grid.size(), n = grid[0].size();
        vector<vector<int>> cost(m, vector<int>(n, INT_MAX));
        cost[0][0] = 0;
        priority_queue<array<int, 3>, vector<array<int, 3>>, greater<>> heap;
        heap.push({0, 0, 0});
        int dr[] = {1, -1, 0, 0}, dc[] = {0, 0, 1, -1};
        while (!heap.empty()) {
            auto [c0, r, c] = heap.top();
            heap.pop();
            if (c0 > cost[r][c]) continue;
            if (r == m - 1 && c == n - 1) return c0;
            for (int k = 0; k < 4; k++) {
                int rr = r + dr[k], cc = c + dc[k];
                if (rr < 0 || cc < 0 || rr >= m || cc >= n) continue;
                int cand = c0 + grid[rr][cc];
                if (cand < cost[rr][cc]) { cost[rr][cc] = cand; heap.push({cand, rr, cc}); }
            }
        }
        return -1;
    }
};`,
          python: r`class Solution:
    def minimumObstacles(self, grid: List[List[int]]) -> int:
        m, n = len(grid), len(grid[0])
        cost = [[inf] * n for _ in range(m)]
        cost[0][0] = 0
        heap = [(0, 0, 0)]
        while heap:
            c0, r, c = heappop(heap)
            if c0 > cost[r][c]:
                continue
            if (r, c) == (m - 1, n - 1):
                return c0
            for rr, cc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= rr < m and 0 <= cc < n and c0 + grid[rr][cc] < cost[rr][cc]:
                    cost[rr][cc] = c0 + grid[rr][cc]
                    heappush(heap, (cost[rr][cc], rr, cc))
        return -1`,
          javascript: r`var minimumObstacles = function(grid) {
    const m = grid.length, n = grid[0].length;
    const cost = Array.from({ length: m }, () => new Array(n).fill(Infinity));
    cost[0][0] = 0;
    const heap = new PriorityQueue((a, b) => a[0] - b[0]);
    heap.enqueue([0, 0, 0]);
    while (heap.size()) {
        const [c0, r, c] = heap.dequeue();
        if (c0 > cost[r][c]) continue;
        if (r === m - 1 && c === n - 1) return c0;
        for (const [rr, cc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
            if (rr < 0 || cc < 0 || rr >= m || cc >= n) continue;
            const cand = c0 + grid[rr][cc];
            if (cand < cost[rr][cc]) { cost[rr][cc] = cand; heap.enqueue([cand, rr, cc]); }
        }
    }
    return -1;
};`,
        },
      },
      {
        level: 'Optimal', name: '0-1 BFS with a deque',
        idea: 'When every edge costs 0 or 1, a deque keeps the frontier sorted for free: push a 0-cost neighbour to the front and a 1-cost neighbour to the back. Cells then leave the deque in order of cost, just as in Dijkstra.',
        steps: [
          'Set `cost[0][0] = 0` and put it in a deque.',
          'Pop from the front. For each neighbour, `cand = cost + grid[neighbour]`; if it improves the neighbour, record it.',
          'Push the neighbour to the front if the step cost 0, otherwise to the back.',
          'Return `cost` of the bottom-right cell.',
        ],
        time: 'O(m·n)', space: 'O(m·n)',
        why: 'Each cell is improved at most twice (its cost can only be one of two adjacent values while it waits), and deque operations are O(1).',
        code: {
          java: r`class Solution {
    public int minimumObstacles(int[][] grid) {
        int m = grid.length, n = grid[0].length;
        int[][] cost = new int[m][n];
        for (int[] row : cost) Arrays.fill(row, Integer.MAX_VALUE);
        cost[0][0] = 0;
        Deque<int[]> dq = new ArrayDeque<>();
        dq.add(new int[] { 0, 0 });
        int[][] dirs = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } };
        while (!dq.isEmpty()) {
            int[] cell = dq.pollFirst();
            int r = cell[0], c = cell[1];
            for (int[] d : dirs) {
                int rr = r + d[0], cc = c + d[1];
                if (rr < 0 || cc < 0 || rr >= m || cc >= n) continue;
                int cand = cost[r][c] + grid[rr][cc];
                if (cand >= cost[rr][cc]) continue;
                cost[rr][cc] = cand;
                if (grid[rr][cc] == 0) dq.addFirst(new int[] { rr, cc });
                else dq.addLast(new int[] { rr, cc });
            }
        }
        return cost[m - 1][n - 1];
    }
}`,
          cpp: r`class Solution {
public:
    int minimumObstacles(vector<vector<int>>& grid) {
        int m = grid.size(), n = grid[0].size();
        vector<vector<int>> cost(m, vector<int>(n, INT_MAX));
        cost[0][0] = 0;
        deque<pair<int, int>> dq;
        dq.push_back({0, 0});
        int dr[] = {1, -1, 0, 0}, dc[] = {0, 0, 1, -1};
        while (!dq.empty()) {
            auto [r, c] = dq.front();
            dq.pop_front();
            for (int k = 0; k < 4; k++) {
                int rr = r + dr[k], cc = c + dc[k];
                if (rr < 0 || cc < 0 || rr >= m || cc >= n) continue;
                int cand = cost[r][c] + grid[rr][cc];
                if (cand >= cost[rr][cc]) continue;
                cost[rr][cc] = cand;
                if (grid[rr][cc] == 0) dq.push_front({rr, cc});
                else dq.push_back({rr, cc});
            }
        }
        return cost[m - 1][n - 1];
    }
};`,
          python: r`class Solution:
    def minimumObstacles(self, grid: List[List[int]]) -> int:
        m, n = len(grid), len(grid[0])
        cost = [[inf] * n for _ in range(m)]
        cost[0][0] = 0
        dq = deque([(0, 0)])
        while dq:
            r, c = dq.popleft()
            for rr, cc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= rr < m and 0 <= cc < n:
                    cand = cost[r][c] + grid[rr][cc]
                    if cand < cost[rr][cc]:
                        cost[rr][cc] = cand
                        if grid[rr][cc] == 0:
                            dq.appendleft((rr, cc))
                        else:
                            dq.append((rr, cc))
        return cost[m - 1][n - 1]`,
          javascript: r`var minimumObstacles = function(grid) {
    const m = grid.length, n = grid[0].length, size = m * n;
    const cost = new Array(size).fill(Infinity);
    // a deque as a ring buffer: each cell is pushed at most twice
    const buf = new Int32Array(4 * size + 4);
    let head = 2 * size + 2, tail = head;
    cost[0] = 0;
    buf[tail++] = 0;
    while (head < tail) {
        const cell = buf[head++], r = Math.floor(cell / n), c = cell % n;
        for (const [rr, cc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
            if (rr < 0 || cc < 0 || rr >= m || cc >= n) continue;
            const next = rr * n + cc, cand = cost[cell] + grid[rr][cc];
            if (cand >= cost[next]) continue;
            cost[next] = cand;
            if (grid[rr][cc] === 0) buf[--head] = next;
            else buf[tail++] = next;
        }
    }
    return cost[size - 1];
};`,
        },
      },
    ],
  },

  'minimum-cost-to-make-at-least-one-valid-path-in-a-grid': {
    pattern: '0-1 BFS: following a sign costs 0, going any other way costs 1',
    approaches: [
      {
        level: 'Better', name: 'Dijkstra over cells',
        idea: 'From each cell you may move in all four directions: moving where the sign points is free, any other direction costs 1 (changing the sign). The answer is the cheapest path cost.',
        steps: [
          'Directions 1..4 = right, left, down, up.',
          'Dijkstra from the top-left: pop the cheapest cell, skip outdated entries, stop at the bottom-right.',
          'For each direction `k`, the step costs 0 if `k == grid[r][c]`, else 1; relax the neighbour.',
        ],
        time: 'O(m·n·log(m·n))', space: 'O(m·n)',
        why: 'Each cell has 4 edges, giving O(m·n) heap operations of O(log(m·n)).',
        code: {
          java: r`class Solution {
    public int minCost(int[][] grid) {
        int m = grid.length, n = grid[0].length;
        int[][] dirs = { { 0, 1 }, { 0, -1 }, { 1, 0 }, { -1, 0 } };
        int[][] cost = new int[m][n];
        for (int[] row : cost) Arrays.fill(row, Integer.MAX_VALUE);
        cost[0][0] = 0;
        PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));
        heap.add(new int[] { 0, 0, 0 });
        while (!heap.isEmpty()) {
            int[] top = heap.poll();
            int c0 = top[0], r = top[1], c = top[2];
            if (c0 > cost[r][c]) continue;
            if (r == m - 1 && c == n - 1) return c0;
            for (int k = 0; k < 4; k++) {
                int rr = r + dirs[k][0], cc = c + dirs[k][1];
                if (rr < 0 || cc < 0 || rr >= m || cc >= n) continue;
                int cand = c0 + (grid[r][c] == k + 1 ? 0 : 1);
                if (cand < cost[rr][cc]) { cost[rr][cc] = cand; heap.add(new int[] { cand, rr, cc }); }
            }
        }
        return -1;
    }
}`,
          cpp: r`class Solution {
public:
    int minCost(vector<vector<int>>& grid) {
        int m = grid.size(), n = grid[0].size();
        int dr[] = {0, 0, 1, -1}, dc[] = {1, -1, 0, 0};
        vector<vector<int>> cost(m, vector<int>(n, INT_MAX));
        cost[0][0] = 0;
        priority_queue<array<int, 3>, vector<array<int, 3>>, greater<>> heap;
        heap.push({0, 0, 0});
        while (!heap.empty()) {
            auto [c0, r, c] = heap.top();
            heap.pop();
            if (c0 > cost[r][c]) continue;
            if (r == m - 1 && c == n - 1) return c0;
            for (int k = 0; k < 4; k++) {
                int rr = r + dr[k], cc = c + dc[k];
                if (rr < 0 || cc < 0 || rr >= m || cc >= n) continue;
                int cand = c0 + (grid[r][c] == k + 1 ? 0 : 1);
                if (cand < cost[rr][cc]) { cost[rr][cc] = cand; heap.push({cand, rr, cc}); }
            }
        }
        return -1;
    }
};`,
          python: r`class Solution:
    def minCost(self, grid: List[List[int]]) -> int:
        m, n = len(grid), len(grid[0])
        dirs = ((0, 1), (0, -1), (1, 0), (-1, 0))
        cost = [[inf] * n for _ in range(m)]
        cost[0][0] = 0
        heap = [(0, 0, 0)]
        while heap:
            c0, r, c = heappop(heap)
            if c0 > cost[r][c]:
                continue
            if (r, c) == (m - 1, n - 1):
                return c0
            for k, (dr, dc) in enumerate(dirs):
                rr, cc = r + dr, c + dc
                if 0 <= rr < m and 0 <= cc < n:
                    cand = c0 + (0 if grid[r][c] == k + 1 else 1)
                    if cand < cost[rr][cc]:
                        cost[rr][cc] = cand
                        heappush(heap, (cand, rr, cc))
        return -1`,
          javascript: r`var minCost = function(grid) {
    const m = grid.length, n = grid[0].length, dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    const cost = Array.from({ length: m }, () => new Array(n).fill(Infinity));
    cost[0][0] = 0;
    const heap = new PriorityQueue((a, b) => a[0] - b[0]);
    heap.enqueue([0, 0, 0]);
    while (heap.size()) {
        const [c0, r, c] = heap.dequeue();
        if (c0 > cost[r][c]) continue;
        if (r === m - 1 && c === n - 1) return c0;
        dirs.forEach(([dr, dc], k) => {
            const rr = r + dr, cc = c + dc;
            if (rr < 0 || cc < 0 || rr >= m || cc >= n) return;
            const cand = c0 + (grid[r][c] === k + 1 ? 0 : 1);
            if (cand < cost[rr][cc]) { cost[rr][cc] = cand; heap.enqueue([cand, rr, cc]); }
        });
    }
    return -1;
};`,
        },
      },
      {
        level: 'Optimal', name: '0-1 BFS with a deque',
        idea: 'Edge costs are only 0 (follow the sign) or 1 (change it), so a deque gives the Dijkstra order without a heap: 0-cost moves go to the front, 1-cost moves to the back.',
        steps: [
          'Set `cost[0][0] = 0` and push it.',
          'Pop from the front; for each direction compute the step cost (0 if it matches the sign) and relax the neighbour.',
          'On an improvement, push to the front for cost 0 and to the back for cost 1.',
          'Return the bottom-right cost.',
        ],
        time: 'O(m·n)', space: 'O(m·n)',
        why: 'Constant work per cell and edge, since deque operations are O(1).',
        code: {
          java: r`class Solution {
    public int minCost(int[][] grid) {
        int m = grid.length, n = grid[0].length;
        int[][] dirs = { { 0, 1 }, { 0, -1 }, { 1, 0 }, { -1, 0 } };
        int[][] cost = new int[m][n];
        for (int[] row : cost) Arrays.fill(row, Integer.MAX_VALUE);
        cost[0][0] = 0;
        Deque<int[]> dq = new ArrayDeque<>();
        dq.add(new int[] { 0, 0 });
        while (!dq.isEmpty()) {
            int[] cell = dq.pollFirst();
            int r = cell[0], c = cell[1];
            for (int k = 0; k < 4; k++) {
                int rr = r + dirs[k][0], cc = c + dirs[k][1];
                if (rr < 0 || cc < 0 || rr >= m || cc >= n) continue;
                int step = grid[r][c] == k + 1 ? 0 : 1;
                if (cost[r][c] + step >= cost[rr][cc]) continue;
                cost[rr][cc] = cost[r][c] + step;
                if (step == 0) dq.addFirst(new int[] { rr, cc });
                else dq.addLast(new int[] { rr, cc });
            }
        }
        return cost[m - 1][n - 1];
    }
}`,
          cpp: r`class Solution {
public:
    int minCost(vector<vector<int>>& grid) {
        int m = grid.size(), n = grid[0].size();
        int dr[] = {0, 0, 1, -1}, dc[] = {1, -1, 0, 0};
        vector<vector<int>> cost(m, vector<int>(n, INT_MAX));
        cost[0][0] = 0;
        deque<pair<int, int>> dq;
        dq.push_back({0, 0});
        while (!dq.empty()) {
            auto [r, c] = dq.front();
            dq.pop_front();
            for (int k = 0; k < 4; k++) {
                int rr = r + dr[k], cc = c + dc[k];
                if (rr < 0 || cc < 0 || rr >= m || cc >= n) continue;
                int step = grid[r][c] == k + 1 ? 0 : 1;
                if (cost[r][c] + step >= cost[rr][cc]) continue;
                cost[rr][cc] = cost[r][c] + step;
                if (step == 0) dq.push_front({rr, cc});
                else dq.push_back({rr, cc});
            }
        }
        return cost[m - 1][n - 1];
    }
};`,
          python: r`class Solution:
    def minCost(self, grid: List[List[int]]) -> int:
        m, n = len(grid), len(grid[0])
        dirs = ((0, 1), (0, -1), (1, 0), (-1, 0))
        cost = [[inf] * n for _ in range(m)]
        cost[0][0] = 0
        dq = deque([(0, 0)])
        while dq:
            r, c = dq.popleft()
            for k, (dr, dc) in enumerate(dirs):
                rr, cc = r + dr, c + dc
                if 0 <= rr < m and 0 <= cc < n:
                    step = 0 if grid[r][c] == k + 1 else 1
                    if cost[r][c] + step < cost[rr][cc]:
                        cost[rr][cc] = cost[r][c] + step
                        if step == 0:
                            dq.appendleft((rr, cc))
                        else:
                            dq.append((rr, cc))
        return cost[m - 1][n - 1]`,
          javascript: r`var minCost = function(grid) {
    const m = grid.length, n = grid[0].length, size = m * n, dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    const cost = new Array(size).fill(Infinity);
    // a deque as a ring buffer: each cell is pushed a bounded number of times
    const buf = new Int32Array(10 * size + 10);
    let head = 5 * size + 5, tail = head;
    cost[0] = 0;
    buf[tail++] = 0;
    while (head < tail) {
        const cell = buf[head++], r = Math.floor(cell / n), c = cell % n;
        dirs.forEach(([dr, dc], k) => {
            const rr = r + dr, cc = c + dc;
            if (rr < 0 || cc < 0 || rr >= m || cc >= n) return;
            const next = rr * n + cc, step = grid[r][c] === k + 1 ? 0 : 1;
            if (cost[cell] + step >= cost[next]) return;
            cost[next] = cost[cell] + step;
            if (step === 0) buf[--head] = next;
            else buf[tail++] = next;
        });
    }
    return cost[size - 1];
};`,
        },
      },
    ],
  },

  'swim-in-rising-water': {
    pattern: 'Minimax path: Dijkstra on the highest cell so far (or binary search + BFS)',
    approaches: [
      {
        level: 'Better', name: 'Binary search the time, check with BFS',
        idea: 'At time `t` you may use every cell with height ≤ `t`. Being able to cross at time `t` means you can at any later time, so binary search the smallest `t` for which a BFS through cells ≤ `t` connects the corners.',
        steps: [
          'Search `t` in `[grid[0][0], n² − 1]`.',
          'BFS from `(0, 0)` through cells with height ≤ `t`; check whether `(n − 1, n − 1)` is reached.',
          'If yes, `hi = t`; else `lo = t + 1`. Return `lo`.',
        ],
        time: 'O(n²·log n)', space: 'O(n²)',
        why: 'About log₂(n²) BFS runs of O(n²) each.',
        code: {
          java: r`class Solution {
    public int swimInWater(int[][] grid) {
        int n = grid.length, lo = grid[0][0], hi = n * n - 1;
        while (lo < hi) {
            int mid = (lo + hi) >>> 1;
            if (reachable(grid, mid)) hi = mid; else lo = mid + 1;
        }
        return lo;
    }

    private boolean reachable(int[][] g, int t) {
        int n = g.length;
        boolean[][] seen = new boolean[n][n];
        int[][] dirs = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } };
        Deque<int[]> queue = new ArrayDeque<>();
        queue.add(new int[] { 0, 0 });
        seen[0][0] = true;
        while (!queue.isEmpty()) {
            int[] c = queue.poll();
            if (c[0] == n - 1 && c[1] == n - 1) return true;
            for (int[] d : dirs) {
                int r = c[0] + d[0], col = c[1] + d[1];
                if (r >= 0 && col >= 0 && r < n && col < n && !seen[r][col] && g[r][col] <= t) {
                    seen[r][col] = true;
                    queue.add(new int[] { r, col });
                }
            }
        }
        return false;
    }
}`,
          cpp: r`class Solution {
    bool reachable(vector<vector<int>>& g, int t) {
        int n = g.size();
        vector<vector<bool>> seen(n, vector<bool>(n, false));
        int dr[] = {1, -1, 0, 0}, dc[] = {0, 0, 1, -1};
        queue<pair<int, int>> q;
        q.push({0, 0});
        seen[0][0] = true;
        while (!q.empty()) {
            auto [r0, c0] = q.front();
            q.pop();
            if (r0 == n - 1 && c0 == n - 1) return true;
            for (int k = 0; k < 4; k++) {
                int r = r0 + dr[k], c = c0 + dc[k];
                if (r >= 0 && c >= 0 && r < n && c < n && !seen[r][c] && g[r][c] <= t) {
                    seen[r][c] = true;
                    q.push({r, c});
                }
            }
        }
        return false;
    }
public:
    int swimInWater(vector<vector<int>>& grid) {
        int n = grid.size(), lo = grid[0][0], hi = n * n - 1;
        while (lo < hi) {
            int mid = (lo + hi) / 2;
            if (reachable(grid, mid)) hi = mid; else lo = mid + 1;
        }
        return lo;
    }
};`,
          python: r`class Solution:
    def swimInWater(self, grid: List[List[int]]) -> int:
        n = len(grid)
        def reachable(t):
            seen, queue = {(0, 0)}, deque([(0, 0)])
            while queue:
                r0, c0 = queue.popleft()
                if (r0, c0) == (n - 1, n - 1):
                    return True
                for r, c in ((r0 + 1, c0), (r0 - 1, c0), (r0, c0 + 1), (r0, c0 - 1)):
                    if 0 <= r < n and 0 <= c < n and (r, c) not in seen and grid[r][c] <= t:
                        seen.add((r, c))
                        queue.append((r, c))
            return False
        lo, hi = grid[0][0], n * n - 1
        while lo < hi:
            mid = (lo + hi) // 2
            if reachable(mid):
                hi = mid
            else:
                lo = mid + 1
        return lo`,
          javascript: r`var swimInWater = function(grid) {
    const n = grid.length;
    const reachable = (t) => {
        const seen = new Uint8Array(n * n), queue = [[0, 0]];
        seen[0] = 1;
        for (let h = 0; h < queue.length; h++) {
            const [r0, c0] = queue[h];
            if (r0 === n - 1 && c0 === n - 1) return true;
            for (const [r, c] of [[r0 + 1, c0], [r0 - 1, c0], [r0, c0 + 1], [r0, c0 - 1]]) {
                if (r >= 0 && c >= 0 && r < n && c < n && !seen[r * n + c] && grid[r][c] <= t) {
                    seen[r * n + c] = 1;
                    queue.push([r, c]);
                }
            }
        }
        return false;
    };
    let lo = grid[0][0], hi = n * n - 1;
    while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (reachable(mid)) hi = mid; else lo = mid + 1;
    }
    return lo;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Dijkstra on the highest cell on the path',
        idea: 'The time a route needs is the highest cell on it. Expand cells in order of that value with a min-heap: the first time the bottom-right cell is popped, its value is the answer.',
        steps: [
          'Push `(grid[0][0], 0, 0)`; mark `(0, 0)` visited.',
          'Pop the cell with the lowest "highest so far" `t`; if it is the bottom-right, return `t`.',
          'For each unvisited neighbour, mark it and push `(max(t, height), r, c)`.',
        ],
        time: 'O(n²·log n)', space: 'O(n²)',
        why: 'Each of the n² cells is pushed once, with O(log n²) = O(log n) per heap operation.',
        code: {
          java: r`class Solution {
    public int swimInWater(int[][] grid) {
        int n = grid.length;
        boolean[][] seen = new boolean[n][n];
        PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));
        heap.add(new int[] { grid[0][0], 0, 0 });
        seen[0][0] = true;
        int[][] dirs = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } };
        while (true) {
            int[] top = heap.poll();
            int t = top[0], r0 = top[1], c0 = top[2];
            if (r0 == n - 1 && c0 == n - 1) return t;
            for (int[] d : dirs) {
                int r = r0 + d[0], c = c0 + d[1];
                if (r < 0 || c < 0 || r >= n || c >= n || seen[r][c]) continue;
                seen[r][c] = true;
                heap.add(new int[] { Math.max(t, grid[r][c]), r, c });
            }
        }
    }
}`,
          cpp: r`class Solution {
public:
    int swimInWater(vector<vector<int>>& grid) {
        int n = grid.size();
        vector<vector<bool>> seen(n, vector<bool>(n, false));
        priority_queue<array<int, 3>, vector<array<int, 3>>, greater<>> heap;
        heap.push({grid[0][0], 0, 0});
        seen[0][0] = true;
        int dr[] = {1, -1, 0, 0}, dc[] = {0, 0, 1, -1};
        while (true) {
            auto [t, r0, c0] = heap.top();
            heap.pop();
            if (r0 == n - 1 && c0 == n - 1) return t;
            for (int k = 0; k < 4; k++) {
                int r = r0 + dr[k], c = c0 + dc[k];
                if (r < 0 || c < 0 || r >= n || c >= n || seen[r][c]) continue;
                seen[r][c] = true;
                heap.push({max(t, grid[r][c]), r, c});
            }
        }
    }
};`,
          python: r`class Solution:
    def swimInWater(self, grid: List[List[int]]) -> int:
        n = len(grid)
        seen = {(0, 0)}
        heap = [(grid[0][0], 0, 0)]
        while True:
            t, r0, c0 = heappop(heap)
            if (r0, c0) == (n - 1, n - 1):
                return t
            for r, c in ((r0 + 1, c0), (r0 - 1, c0), (r0, c0 + 1), (r0, c0 - 1)):
                if 0 <= r < n and 0 <= c < n and (r, c) not in seen:
                    seen.add((r, c))
                    heappush(heap, (max(t, grid[r][c]), r, c))`,
          javascript: r`var swimInWater = function(grid) {
    const n = grid.length, seen = new Uint8Array(n * n);
    const heap = new PriorityQueue((a, b) => a[0] - b[0]);
    heap.enqueue([grid[0][0], 0, 0]);
    seen[0] = 1;
    while (true) {
        const [t, r0, c0] = heap.dequeue();
        if (r0 === n - 1 && c0 === n - 1) return t;
        for (const [r, c] of [[r0 + 1, c0], [r0 - 1, c0], [r0, c0 + 1], [r0, c0 - 1]]) {
            if (r < 0 || c < 0 || r >= n || c >= n || seen[r * n + c]) continue;
            seen[r * n + c] = 1;
            heap.enqueue([Math.max(t, grid[r][c]), r, c]);
        }
    }
};`,
        },
      },
    ],
  },

  'find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance': {
    pattern: 'All-pairs shortest paths (Floyd–Warshall, or Dijkstra from every city)',
    approaches: [
      {
        level: 'Optimal', name: 'Floyd–Warshall',
        idea: 'Compute the shortest distance between every pair of cities: for each possible middle city `k`, a route `i → k → j` may beat the best known `i → j`. Then count, for each city, the others within the threshold.',
        steps: [
          'Initialise `dist[i][i] = 0`, `dist[u][v] = dist[v][u] = w` for each road, others ∞.',
          'For `k`, then `i`, then `j`: `dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])`.',
          'For each city, count `j != i` with `dist[i][j] <= threshold`; keep the smallest count, preferring the larger city number on ties (scan with `<=`).',
        ],
        time: 'O(n³)', space: 'O(n²)',
        why: 'n³ = 10⁶ relaxations for n = 100, and an n × n table. Simple and ideal for a small, dense graph.',
        code: {
          java: r`class Solution {
    public int findTheCity(int n, int[][] edges, int distanceThreshold) {
        int INF = Integer.MAX_VALUE / 2;
        int[][] dist = new int[n][n];
        for (int i = 0; i < n; i++) { Arrays.fill(dist[i], INF); dist[i][i] = 0; }
        for (int[] e : edges) { dist[e[0]][e[1]] = e[2]; dist[e[1]][e[0]] = e[2]; }
        for (int k = 0; k < n; k++)
            for (int i = 0; i < n; i++)
                for (int j = 0; j < n; j++)
                    if (dist[i][k] + dist[k][j] < dist[i][j]) dist[i][j] = dist[i][k] + dist[k][j];
        int answer = -1, fewest = Integer.MAX_VALUE;
        for (int i = 0; i < n; i++) {
            int count = 0;
            for (int j = 0; j < n; j++) if (j != i && dist[i][j] <= distanceThreshold) count++;
            if (count <= fewest) { fewest = count; answer = i; }
        }
        return answer;
    }
}`,
          cpp: r`class Solution {
public:
    int findTheCity(int n, vector<vector<int>>& edges, int distanceThreshold) {
        const int INF = INT_MAX / 2;
        vector<vector<int>> dist(n, vector<int>(n, INF));
        for (int i = 0; i < n; i++) dist[i][i] = 0;
        for (auto& e : edges) dist[e[0]][e[1]] = dist[e[1]][e[0]] = e[2];
        for (int k = 0; k < n; k++)
            for (int i = 0; i < n; i++)
                for (int j = 0; j < n; j++)
                    dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]);
        int answer = -1, fewest = INT_MAX;
        for (int i = 0; i < n; i++) {
            int count = 0;
            for (int j = 0; j < n; j++) if (j != i && dist[i][j] <= distanceThreshold) count++;
            if (count <= fewest) { fewest = count; answer = i; }
        }
        return answer;
    }
};`,
          python: r`class Solution:
    def findTheCity(self, n: int, edges: List[List[int]], distanceThreshold: int) -> int:
        dist = [[inf] * n for _ in range(n)]
        for i in range(n):
            dist[i][i] = 0
        for u, v, w in edges:
            dist[u][v] = dist[v][u] = w
        for k in range(n):
            dk = dist[k]
            for i in range(n):
                di, dik = dist[i], dist[i][k]
                for j in range(n):
                    if dik + dk[j] < di[j]:
                        di[j] = dik + dk[j]
        answer, fewest = -1, inf
        for i in range(n):
            count = sum(1 for j in range(n) if j != i and dist[i][j] <= distanceThreshold)
            if count <= fewest:
                fewest, answer = count, i
        return answer`,
          javascript: r`var findTheCity = function(n, edges, distanceThreshold) {
    const dist = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : Infinity)));
    for (const [u, v, w] of edges) { dist[u][v] = w; dist[v][u] = w; }
    for (let k = 0; k < n; k++)
        for (let i = 0; i < n; i++)
            for (let j = 0; j < n; j++)
                if (dist[i][k] + dist[k][j] < dist[i][j]) dist[i][j] = dist[i][k] + dist[k][j];
    let answer = -1, fewest = Infinity;
    for (let i = 0; i < n; i++) {
        let count = 0;
        for (let j = 0; j < n; j++) if (j !== i && dist[i][j] <= distanceThreshold) count++;
        if (count <= fewest) { fewest = count; answer = i; }
    }
    return answer;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Dijkstra from every city',
        idea: 'Run Dijkstra from each city; it can stop expanding once distances exceed the threshold. Count the cities reached within it.',
        steps: [
          'Build adjacency lists (roads go both ways).',
          'For each city `s`, run Dijkstra, not pushing anything farther than the threshold; count settled cities other than `s`.',
          'Return the city with the smallest count, choosing the larger number on ties.',
        ],
        time: 'O(n·E·log n)', space: 'O(n + E)',
        why: 'n Dijkstra runs of O(E log n). For sparse graphs this beats O(n³); for this dense limit both are fast.',
        code: {
          java: r`class Solution {
    public int findTheCity(int n, int[][] edges, int distanceThreshold) {
        List<List<int[]>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (int[] e : edges) { adj.get(e[0]).add(new int[] { e[1], e[2] }); adj.get(e[1]).add(new int[] { e[0], e[2] }); }
        int answer = -1, fewest = Integer.MAX_VALUE;
        for (int s = 0; s < n; s++) {
            int[] dist = new int[n];
            Arrays.fill(dist, Integer.MAX_VALUE);
            dist[s] = 0;
            PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));
            heap.add(new int[] { 0, s });
            int count = 0;
            while (!heap.isEmpty()) {
                int[] top = heap.poll();
                if (top[0] > dist[top[1]]) continue;
                if (top[1] != s) count++;
                for (int[] e : adj.get(top[1])) {
                    int d = top[0] + e[1];
                    if (d <= distanceThreshold && d < dist[e[0]]) { dist[e[0]] = d; heap.add(new int[] { d, e[0] }); }
                }
            }
            if (count <= fewest) { fewest = count; answer = s; }
        }
        return answer;
    }
}`,
          cpp: r`class Solution {
public:
    int findTheCity(int n, vector<vector<int>>& edges, int distanceThreshold) {
        vector<vector<pair<int, int>>> adj(n);
        for (auto& e : edges) { adj[e[0]].push_back({e[1], e[2]}); adj[e[1]].push_back({e[0], e[2]}); }
        int answer = -1, fewest = INT_MAX;
        for (int s = 0; s < n; s++) {
            vector<int> dist(n, INT_MAX);
            dist[s] = 0;
            priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> heap;
            heap.push({0, s});
            int count = 0;
            while (!heap.empty()) {
                auto [d0, u] = heap.top();
                heap.pop();
                if (d0 > dist[u]) continue;
                if (u != s) count++;
                for (auto [v, w] : adj[u]) {
                    int d = d0 + w;
                    if (d <= distanceThreshold && d < dist[v]) { dist[v] = d; heap.push({d, v}); }
                }
            }
            if (count <= fewest) { fewest = count; answer = s; }
        }
        return answer;
    }
};`,
          python: r`class Solution:
    def findTheCity(self, n: int, edges: List[List[int]], distanceThreshold: int) -> int:
        adj = defaultdict(list)
        for u, v, w in edges:
            adj[u].append((v, w))
            adj[v].append((u, w))
        answer, fewest = -1, inf
        for s in range(n):
            dist = {}
            heap = [(0, s)]
            while heap:
                d0, u = heappop(heap)
                if u in dist:
                    continue
                dist[u] = d0
                for v, w in adj[u]:
                    if v not in dist and d0 + w <= distanceThreshold:
                        heappush(heap, (d0 + w, v))
            count = len(dist) - 1
            if count <= fewest:
                fewest, answer = count, s
        return answer`,
          javascript: r`var findTheCity = function(n, edges, distanceThreshold) {
    const adj = Array.from({ length: n }, () => []);
    for (const [u, v, w] of edges) { adj[u].push([v, w]); adj[v].push([u, w]); }
    let answer = -1, fewest = Infinity;
    for (let s = 0; s < n; s++) {
        const dist = new Array(n).fill(Infinity);
        dist[s] = 0;
        const heap = new PriorityQueue((a, b) => a[0] - b[0]);
        heap.enqueue([0, s]);
        let count = 0;
        while (heap.size()) {
            const [d0, u] = heap.dequeue();
            if (d0 > dist[u]) continue;
            if (u !== s) count++;
            for (const [v, w] of adj[u]) {
                const d = d0 + w;
                if (d <= distanceThreshold && d < dist[v]) { dist[v] = d; heap.enqueue([d, v]); }
            }
        }
        if (count <= fewest) { fewest = count; answer = s; }
    }
    return answer;
};`,
        },
      },
    ],
  },
};
