export default [
  {
    slug: 'is-graph-bipartite', title: 'Is Graph Bipartite?', level: 'Medium',
    summary: 'graph[u] lists the neighbours of node u in an undirected graph (possibly disconnected). Return true if the nodes can be split into two groups so that every edge joins nodes from different groups.',
    method: 'isBipartite', params: [['int[][]', 'graph']], returns: 'boolean',
    tests: [
      { in: [[[1, 2, 3], [0, 2], [0, 1, 3], [0, 2]]], out: false },
      { in: [[[1, 3], [0, 2], [1, 3], [0, 2]]], out: true },
      { in: [[[]]] },
      { in: [[[], [2], [1], []]] },
      { in: [[[1, 5], [0, 2], [1, 3], [2, 4], [3, 5], [4, 0]]] },
      { in: [[[1], [0], [3, 4], [2, 4], [2, 3]]] },
      { in: [[[4], [], [], [], [0]]] },
    ],
    ref: `class Solution {
    public boolean isBipartite(int[][] graph) {
        int n = graph.length;
        int[] colour = new int[n];                 // 0 = not visited, 1 / -1 = the two sides
        int[] queue = new int[n];
        for (int s = 0; s < n; s++) {
            if (colour[s] != 0) continue;
            colour[s] = 1;
            int head = 0, tail = 0;
            queue[tail++] = s;
            while (head < tail) {
                int u = queue[head++];
                for (int v : graph[u]) {
                    if (colour[v] == 0) { colour[v] = -colour[u]; queue[tail++] = v; }
                    else if (colour[v] == colour[u]) return false;
                }
            }
        }
        return true;
    }
}`,
  },
  {
    slug: 'possible-bipartition', title: 'Possible Bipartition', level: 'Medium',
    summary: 'People are numbered 1..n. Each pair [a, b] in dislikes means a and b refuse to be in the same group. Return true if everyone can be split into two groups that respect every dislike.',
    method: 'possibleBipartition', params: [['int', 'n'], ['int[][]', 'dislikes']], returns: 'boolean',
    tests: [
      { in: [4, [[1, 2], [1, 3], [2, 4]]], out: true },
      { in: [3, [[1, 2], [1, 3], [2, 3]]], out: false },
      { in: [1, []] },
      { in: [5, []] },
      { in: [5, [[1, 2], [2, 3], [3, 4], [4, 5], [1, 5]]] },
      { in: [6, [[1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [1, 6]]] },
      { in: [10, [[4, 7], [4, 8], [5, 6], [1, 6], [3, 7], [2, 5], [5, 8], [1, 2], [4, 9], [6, 10], [8, 10], [3, 6], [2, 10], [9, 10], [3, 9], [2, 3], [1, 9], [4, 6], [5, 7], [3, 8], [1, 8], [1, 7], [2, 4]]] },
    ],
    ref: `class Solution {
    public boolean possibleBipartition(int n, int[][] dislikes) {
        int[] parent = new int[n + 1];
        for (int i = 0; i <= n; i++) parent[i] = i;
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i <= n; i++) adj.add(new ArrayList<>());
        for (int[] d : dislikes) { adj.get(d[0]).add(d[1]); adj.get(d[1]).add(d[0]); }
        // everyone a person dislikes must end up in one group: union them all together
        for (int u = 1; u <= n; u++) {
            List<Integer> nb = adj.get(u);
            for (int v : nb) {
                if (find(parent, u) == find(parent, v)) return false;
                union(parent, nb.get(0), v);
            }
        }
        return true;
    }
    private int find(int[] p, int x) {
        while (p[x] != x) { p[x] = p[p[x]]; x = p[x]; }
        return x;
    }
    private void union(int[] p, int a, int b) { p[find(p, a)] = find(p, b); }
}`,
  },
  {
    slug: 'critical-connections-in-a-network', title: 'Critical Connections in a Network', level: 'Hard',
    summary: 'n servers 0..n−1 are joined by undirected connections and every server can reach every other. A connection is critical if removing it disconnects some servers. Return all critical connections in any order.',
    method: 'criticalConnections', params: [['int', 'n'], ['List<List<Integer>>', 'connections']], returns: 'List<List<Integer>>', check: 'any-order-deep',
    tests: [
      { in: [4, [[0, 1], [1, 2], [2, 0], [1, 3]]], out: [[1, 3]] },
      { in: [2, [[0, 1]]], out: [[0, 1]] },
      { in: [3, [[0, 1], [1, 2], [2, 0]]] },
      { in: [5, [[0, 1], [1, 2], [2, 3], [3, 4]]] },
      { in: [6, [[0, 1], [1, 2], [2, 0], [1, 3], [3, 4], [4, 5], [5, 3]]] },
      { in: [7, [[0, 1], [0, 2], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 4]]] },
    ],
    ref: `class Solution {
    private List<Integer>[] adj;
    private int[] disc, low;
    private int time = 0;
    private List<List<Integer>> bridges = new ArrayList<>();

    public List<List<Integer>> criticalConnections(int n, List<List<Integer>> connections) {
        adj = new List[n];
        for (int i = 0; i < n; i++) adj[i] = new ArrayList<>();
        for (int e = 0; e < connections.size(); e++) {
            int a = connections.get(e).get(0), b = connections.get(e).get(1);
            adj[a].add(b); adj[b].add(a);
        }
        disc = new int[n];
        low = new int[n];
        Arrays.fill(disc, -1);
        dfs(0, -1);
        return bridges;
    }

    private void dfs(int u, int parent) {
        disc[u] = low[u] = time++;
        for (int v : adj[u]) {
            if (v == parent) continue;                       // no parallel edges, so skipping the parent is safe
            if (disc[v] == -1) {
                dfs(v, u);
                low[u] = Math.min(low[u], low[v]);
                if (low[v] > disc[u]) bridges.add(Arrays.asList(u, v));
            } else {
                low[u] = Math.min(low[u], disc[v]);
            }
        }
    }
}`,
  },
  {
    slug: 'valid-arrangement-of-pairs', title: 'Valid Arrangement of Pairs', level: 'Hard',
    summary: 'pairs[i] = [start, end]. Reorder all the pairs so that each pair\'s end equals the next pair\'s start. A valid arrangement is guaranteed to exist; return any one.',
    method: 'validArrangement', params: [['int[][]', 'pairs']], returns: 'int[][]', check: 'custom:eulerPairs',
    tests: [
      { in: [[[5, 1], [4, 5], [11, 9], [9, 4]]], out: [[11, 9], [9, 4], [4, 5], [5, 1]] },
      { in: [[[1, 3], [3, 2], [2, 1]]], out: [[1, 3], [3, 2], [2, 1]] },
      { in: [[[1, 2], [1, 3], [2, 1]]], out: [[1, 2], [2, 1], [1, 3]] },
      { in: [[[0, 1]]] },
      { in: [[[1, 2], [2, 3], [3, 1], [1, 4], [4, 5], [5, 1]]] },
      { in: [[[1000000000, 0], [0, 7], [7, 1000000000], [1000000000, 3]]] },
    ],
    ref: `class Solution {
    public int[][] validArrangement(int[][] pairs) {
        Map<Integer, Deque<Integer>> out = new HashMap<>();
        Map<Integer, Integer> balance = new HashMap<>();      // out-degree minus in-degree
        for (int[] p : pairs) {
            out.computeIfAbsent(p[0], k -> new ArrayDeque<>()).push(p[1]);
            balance.merge(p[0], 1, Integer::sum);
            balance.merge(p[1], -1, Integer::sum);
        }
        int start = pairs[0][0];
        for (Map.Entry<Integer, Integer> e : balance.entrySet()) if (e.getValue() == 1) { start = e.getKey(); break; }

        // Hierholzer, iteratively: walk until stuck, then back up; nodes come off the stack in reverse path order
        Deque<Integer> stack = new ArrayDeque<>();
        List<Integer> path = new ArrayList<>();
        stack.push(start);
        while (!stack.isEmpty()) {
            Deque<Integer> next = out.get(stack.peek());
            if (next != null && !next.isEmpty()) stack.push(next.pop());
            else path.add(stack.pop());
        }
        Collections.reverse(path);
        int[][] res = new int[path.size() - 1][];
        for (int i = 0; i + 1 < path.size(); i++) res[i] = new int[] { path.get(i), path.get(i + 1) };
        return res;
    }
}`,
  },
];
