const r = String.raw;

export default {
  'is-graph-bipartite': {
    pattern: 'Two-colouring with BFS or DFS: a graph is bipartite exactly when it has no odd cycle',
    approaches: [
      {
        level: 'Brute force', name: 'Try every split',
        idea: 'Each of the n nodes goes into group 0 or group 1. Try all 2ⁿ assignments and check whether any of them puts the two ends of every edge in different groups.',
        steps: [
          'For every mask from 0 to 2ⁿ − 1, node u is in group `(mask >> u) & 1`.',
          'Check every edge u–v: the assignment fails if both ends are in the same group.',
          'Return true as soon as one assignment passes every edge.',
        ],
        time: 'O(2ⁿ · E)', space: 'O(1)',
        why: 'Correct but exponential. With n = 100 it is hopeless, which is why the generated tests time out. It shows what the efficient algorithm avoids: once one node is placed, every node connected to it is forced.',
        timesOut: ['generated'],
        code: {
          java: r`class Solution {
    public boolean isBipartite(int[][] graph) {
        int n = graph.length;
        for (long mask = 0; mask < (1L << n); mask++) {
            boolean ok = true;
            for (int u = 0; u < n && ok; u++)
                for (int v : graph[u])
                    if (((mask >> u) & 1) == ((mask >> v) & 1)) { ok = false; break; }
            if (ok) return true;
        }
        return false;
    }
}`,
          cpp: r`class Solution {
public:
    bool isBipartite(vector<vector<int>>& graph) {
        int n = graph.size();
        for (long long mask = 0; mask < (1LL << n); mask++) {
            bool ok = true;
            for (int u = 0; u < n && ok; u++)
                for (int v : graph[u])
                    if (((mask >> u) & 1) == ((mask >> v) & 1)) { ok = false; break; }
            if (ok) return true;
        }
        return false;
    }
};`,
          python: r`class Solution:
    def isBipartite(self, graph: List[List[int]]) -> bool:
        n = len(graph)
        for mask in range(1 << n):
            if all((mask >> u) & 1 != (mask >> v) & 1 for u in range(n) for v in graph[u]):
                return True
        return False`,
          javascript: r`var isBipartite = function(graph) {
    const n = graph.length;
    for (let mask = 0n; mask < (1n << BigInt(n)); mask++) {
        let ok = true;
        for (let u = 0; u < n && ok; u++)
            for (const v of graph[u])
                if (((mask >> BigInt(u)) & 1n) === ((mask >> BigInt(v)) & 1n)) { ok = false; break; }
        if (ok) return true;
    }
    return false;
};`,
        },
      },
      {
        level: 'Optimal', name: 'BFS two-colouring',
        idea: 'Colour a start node 1; every neighbour must get the other colour, every neighbour of those the first colour, and so on. If an edge ever joins two nodes of the same colour, an odd cycle exists and the answer is false. Repeat from every uncoloured node, because the graph may be disconnected.',
        steps: [
          '`colour[u]` is 0 (unseen), 1 or −1.',
          'For each unseen node s: colour it 1 and BFS from it.',
          'For each edge u–v met in the BFS: if v is unseen, give it `−colour[u]` and queue it; if it already has `colour[u]`, return false.',
          'If every component is coloured without conflict, return true.',
        ],
        time: 'O(V + E)', space: 'O(V)',
        why: 'Every node and edge is processed once. DFS works equally well; BFS avoids deep recursion. The colouring is forced, so there is never a choice to undo: that is why no backtracking is needed.',
        code: {
          java: r`class Solution {
    public boolean isBipartite(int[][] graph) {
        int n = graph.length;
        int[] colour = new int[n];
        ArrayDeque<Integer> queue = new ArrayDeque<>();
        for (int s = 0; s < n; s++) {
            if (colour[s] != 0) continue;
            colour[s] = 1;
            queue.add(s);
            while (!queue.isEmpty()) {
                int u = queue.poll();
                for (int v : graph[u]) {
                    if (colour[v] == 0) { colour[v] = -colour[u]; queue.add(v); }
                    else if (colour[v] == colour[u]) return false;
                }
            }
        }
        return true;
    }
}`,
          cpp: r`class Solution {
public:
    bool isBipartite(vector<vector<int>>& graph) {
        int n = graph.size();
        vector<int> colour(n, 0);
        queue<int> q;
        for (int s = 0; s < n; s++) {
            if (colour[s] != 0) continue;
            colour[s] = 1;
            q.push(s);
            while (!q.empty()) {
                int u = q.front(); q.pop();
                for (int v : graph[u]) {
                    if (colour[v] == 0) { colour[v] = -colour[u]; q.push(v); }
                    else if (colour[v] == colour[u]) return false;
                }
            }
        }
        return true;
    }
};`,
          python: r`class Solution:
    def isBipartite(self, graph: List[List[int]]) -> bool:
        colour = [0] * len(graph)
        for s in range(len(graph)):
            if colour[s]:
                continue
            colour[s] = 1
            queue = deque([s])
            while queue:
                u = queue.popleft()
                for v in graph[u]:
                    if colour[v] == 0:
                        colour[v] = -colour[u]
                        queue.append(v)
                    elif colour[v] == colour[u]:
                        return False
        return True`,
          javascript: r`var isBipartite = function(graph) {
    const n = graph.length, colour = new Array(n).fill(0);
    for (let s = 0; s < n; s++) {
        if (colour[s] !== 0) continue;
        colour[s] = 1;
        const queue = [s];
        for (let head = 0; head < queue.length; head++) {
            const u = queue[head];
            for (const v of graph[u]) {
                if (colour[v] === 0) { colour[v] = -colour[u]; queue.push(v); }
                else if (colour[v] === colour[u]) return false;
            }
        }
    }
    return true;
};`,
        },
      },
    ],
  },

  'possible-bipartition': {
    pattern: 'Model dislikes as edges and two-colour the graph (BFS/DFS or Union-Find)',
    approaches: [
      {
        level: 'Brute force', name: 'Try every split',
        idea: 'Put each person in group 0 or 1 in all 2ⁿ ways and check every dislike.',
        steps: [
          'For every mask, person p is in group `(mask >> (p − 1)) & 1`.',
          'The split works if every dislike [a, b] puts a and b in different groups.',
        ],
        time: 'O(2ⁿ · D)', space: 'O(1)',
        why: 'D is the number of dislikes. Exponential in n, so only tiny inputs finish. The insight that removes the search: after one person is placed, everyone connected to them by dislikes has a forced group.',
        timesOut: ['generated'],
        code: {
          java: r`class Solution {
    public boolean possibleBipartition(int n, int[][] dislikes) {
        for (long mask = 0; mask < (1L << n); mask++) {
            boolean ok = true;
            for (int[] d : dislikes)
                if (((mask >> (d[0] - 1)) & 1) == ((mask >> (d[1] - 1)) & 1)) { ok = false; break; }
            if (ok) return true;
        }
        return false;
    }
}`,
          cpp: r`class Solution {
public:
    bool possibleBipartition(int n, vector<vector<int>>& dislikes) {
        for (long long mask = 0; mask < (1LL << n); mask++) {
            bool ok = true;
            for (auto& d : dislikes)
                if (((mask >> (d[0] - 1)) & 1) == ((mask >> (d[1] - 1)) & 1)) { ok = false; break; }
            if (ok) return true;
        }
        return false;
    }
};`,
          python: r`class Solution:
    def possibleBipartition(self, n: int, dislikes: List[List[int]]) -> bool:
        for mask in range(1 << n):
            if all((mask >> (a - 1)) & 1 != (mask >> (b - 1)) & 1 for a, b in dislikes):
                return True
        return False`,
          javascript: r`var possibleBipartition = function(n, dislikes) {
    for (let mask = 0n; mask < (1n << BigInt(n)); mask++) {
        let ok = true;
        for (const [a, b] of dislikes)
            if (((mask >> BigInt(a - 1)) & 1n) === ((mask >> BigInt(b - 1)) & 1n)) { ok = false; break; }
        if (ok) return true;
    }
    return false;
};`,
        },
      },
      {
        level: 'Optimal', name: 'BFS two-colouring',
        idea: 'People are nodes and dislikes are edges. Two groups with every dislike split between them is a two-colouring, so colour each component with BFS and fail on a conflict.',
        steps: [
          'Build an adjacency list for people 1..n.',
          'For each uncoloured person, colour them 1 and BFS; each neighbour gets the opposite colour.',
          'If a neighbour already has the same colour, return false. Otherwise return true at the end.',
        ],
        time: 'O(n + D)', space: 'O(n + D)',
        why: 'Each person and dislike is handled once. People with no dislikes can go in either group, so they never cause a conflict.',
        code: {
          java: r`class Solution {
    public boolean possibleBipartition(int n, int[][] dislikes) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i <= n; i++) adj.add(new ArrayList<>());
        for (int[] d : dislikes) { adj.get(d[0]).add(d[1]); adj.get(d[1]).add(d[0]); }
        int[] colour = new int[n + 1];
        ArrayDeque<Integer> queue = new ArrayDeque<>();
        for (int s = 1; s <= n; s++) {
            if (colour[s] != 0) continue;
            colour[s] = 1;
            queue.add(s);
            while (!queue.isEmpty()) {
                int u = queue.poll();
                for (int v : adj.get(u)) {
                    if (colour[v] == 0) { colour[v] = -colour[u]; queue.add(v); }
                    else if (colour[v] == colour[u]) return false;
                }
            }
        }
        return true;
    }
}`,
          cpp: r`class Solution {
public:
    bool possibleBipartition(int n, vector<vector<int>>& dislikes) {
        vector<vector<int>> adj(n + 1);
        for (auto& d : dislikes) { adj[d[0]].push_back(d[1]); adj[d[1]].push_back(d[0]); }
        vector<int> colour(n + 1, 0);
        queue<int> q;
        for (int s = 1; s <= n; s++) {
            if (colour[s] != 0) continue;
            colour[s] = 1;
            q.push(s);
            while (!q.empty()) {
                int u = q.front(); q.pop();
                for (int v : adj[u]) {
                    if (colour[v] == 0) { colour[v] = -colour[u]; q.push(v); }
                    else if (colour[v] == colour[u]) return false;
                }
            }
        }
        return true;
    }
};`,
          python: r`class Solution:
    def possibleBipartition(self, n: int, dislikes: List[List[int]]) -> bool:
        adj = [[] for _ in range(n + 1)]
        for a, b in dislikes:
            adj[a].append(b)
            adj[b].append(a)
        colour = [0] * (n + 1)
        for s in range(1, n + 1):
            if colour[s]:
                continue
            colour[s] = 1
            queue = deque([s])
            while queue:
                u = queue.popleft()
                for v in adj[u]:
                    if colour[v] == 0:
                        colour[v] = -colour[u]
                        queue.append(v)
                    elif colour[v] == colour[u]:
                        return False
        return True`,
          javascript: r`var possibleBipartition = function(n, dislikes) {
    const adj = Array.from({ length: n + 1 }, () => []);
    for (const [a, b] of dislikes) { adj[a].push(b); adj[b].push(a); }
    const colour = new Array(n + 1).fill(0);
    for (let s = 1; s <= n; s++) {
        if (colour[s] !== 0) continue;
        colour[s] = 1;
        const queue = [s];
        for (let head = 0; head < queue.length; head++) {
            const u = queue[head];
            for (const v of adj[u]) {
                if (colour[v] === 0) { colour[v] = -colour[u]; queue.push(v); }
                else if (colour[v] === colour[u]) return false;
            }
        }
    }
    return true;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Union-Find on "same group" sets',
        idea: 'Everyone a person dislikes must be in the group opposite that person, so they are all in the same group as each other. Union them together; if a person ever lands in the same set as someone they dislike, it is impossible.',
        steps: [
          'Build adjacency lists. For each person u with dislikes [v1, v2, …]:',
          'If u is already in the same set as some vi, return false.',
          'Union every vi with v1 (they must share a group).',
          'Return true when every person has been processed.',
        ],
        time: 'O((n + D) · α(n))', space: 'O(n + D)',
        why: 'α is the inverse Ackermann function, effectively a small constant, so this matches BFS. It is a good alternative to know when the problem arrives as a stream of constraints rather than a graph you can traverse.',
        code: {
          java: r`class Solution {
    private int[] parent;
    private int find(int x) { while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }
    public boolean possibleBipartition(int n, int[][] dislikes) {
        parent = new int[n + 1];
        for (int i = 0; i <= n; i++) parent[i] = i;
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i <= n; i++) adj.add(new ArrayList<>());
        for (int[] d : dislikes) { adj.get(d[0]).add(d[1]); adj.get(d[1]).add(d[0]); }
        for (int u = 1; u <= n; u++) {
            List<Integer> nb = adj.get(u);
            for (int v : nb) {
                if (find(u) == find(v)) return false;
                parent[find(v)] = find(nb.get(0));
            }
        }
        return true;
    }
}`,
          cpp: r`class Solution {
    vector<int> parent;
    int find(int x) { while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }
public:
    bool possibleBipartition(int n, vector<vector<int>>& dislikes) {
        parent.resize(n + 1);
        iota(parent.begin(), parent.end(), 0);
        vector<vector<int>> adj(n + 1);
        for (auto& d : dislikes) { adj[d[0]].push_back(d[1]); adj[d[1]].push_back(d[0]); }
        for (int u = 1; u <= n; u++) {
            for (int v : adj[u]) {
                if (find(u) == find(v)) return false;
                parent[find(v)] = find(adj[u][0]);
            }
        }
        return true;
    }
};`,
          python: r`class Solution:
    def possibleBipartition(self, n: int, dislikes: List[List[int]]) -> bool:
        parent = list(range(n + 1))

        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x

        adj = [[] for _ in range(n + 1)]
        for a, b in dislikes:
            adj[a].append(b)
            adj[b].append(a)
        for u in range(1, n + 1):
            for v in adj[u]:
                if find(u) == find(v):
                    return False
                parent[find(v)] = find(adj[u][0])
        return True`,
          javascript: r`var possibleBipartition = function(n, dislikes) {
    const parent = Array.from({ length: n + 1 }, (_, i) => i);
    const find = (x) => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
    const adj = Array.from({ length: n + 1 }, () => []);
    for (const [a, b] of dislikes) { adj[a].push(b); adj[b].push(a); }
    for (let u = 1; u <= n; u++) {
        for (const v of adj[u]) {
            if (find(u) === find(v)) return false;
            parent[find(v)] = find(adj[u][0]);
        }
    }
    return true;
};`,
        },
      },
    ],
  },

  'critical-connections-in-a-network': {
    pattern: 'Bridges with Tarjan\'s low-link DFS: an edge is critical exactly when it lies on no cycle',
    approaches: [
      {
        level: 'Brute force', name: 'Remove each edge and test connectivity',
        idea: 'Take out one connection at a time and BFS from server 0. If some server becomes unreachable, that connection is critical.',
        steps: [
          'For each connection e: build the graph without e.',
          'BFS from node 0 and count reachable nodes.',
          'If fewer than n are reachable, add e to the answer.',
        ],
        time: 'O(E · (V + E))', space: 'O(V + E)',
        why: 'E separate traversals. With 10⁵ connections that is around 10¹⁰ steps, far beyond the limit. The fix is to learn, in a single DFS, which edges lie on a cycle.',
        code: {
          java: r`class Solution {
    public List<List<Integer>> criticalConnections(int n, List<List<Integer>> connections) {
        List<List<Integer>> res = new ArrayList<>();
        int m = connections.size();
        for (int skip = 0; skip < m; skip++) {
            List<List<Integer>> adj = new ArrayList<>();
            for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
            for (int e = 0; e < m; e++) {
                if (e == skip) continue;
                int a = connections.get(e).get(0), b = connections.get(e).get(1);
                adj.get(a).add(b); adj.get(b).add(a);
            }
            boolean[] seen = new boolean[n];
            ArrayDeque<Integer> q = new ArrayDeque<>();
            q.add(0); seen[0] = true;
            int count = 1;
            while (!q.isEmpty()) {
                int u = q.poll();
                for (int v : adj.get(u)) if (!seen[v]) { seen[v] = true; count++; q.add(v); }
            }
            if (count < n) res.add(connections.get(skip));
        }
        return res;
    }
}`,
          cpp: r`class Solution {
public:
    vector<vector<int>> criticalConnections(int n, vector<vector<int>>& connections) {
        vector<vector<int>> res;
        int m = connections.size();
        for (int skip = 0; skip < m; skip++) {
            vector<vector<int>> adj(n);
            for (int e = 0; e < m; e++) {
                if (e == skip) continue;
                adj[connections[e][0]].push_back(connections[e][1]);
                adj[connections[e][1]].push_back(connections[e][0]);
            }
            vector<bool> seen(n, false);
            queue<int> q;
            q.push(0); seen[0] = true;
            int count = 1;
            while (!q.empty()) {
                int u = q.front(); q.pop();
                for (int v : adj[u]) if (!seen[v]) { seen[v] = true; count++; q.push(v); }
            }
            if (count < n) res.push_back(connections[skip]);
        }
        return res;
    }
};`,
          python: r`class Solution:
    def criticalConnections(self, n: int, connections: List[List[int]]) -> List[List[int]]:
        res = []
        for skip in range(len(connections)):
            adj = [[] for _ in range(n)]
            for e, (a, b) in enumerate(connections):
                if e != skip:
                    adj[a].append(b)
                    adj[b].append(a)
            seen = [False] * n
            seen[0] = True
            queue = deque([0])
            count = 1
            while queue:
                u = queue.popleft()
                for v in adj[u]:
                    if not seen[v]:
                        seen[v] = True
                        count += 1
                        queue.append(v)
            if count < n:
                res.append(connections[skip])
        return res`,
          javascript: r`var criticalConnections = function(n, connections) {
    const res = [];
    for (let skip = 0; skip < connections.length; skip++) {
        const adj = Array.from({ length: n }, () => []);
        connections.forEach(([a, b], e) => { if (e !== skip) { adj[a].push(b); adj[b].push(a); } });
        const seen = new Array(n).fill(false);
        seen[0] = true;
        const queue = [0];
        for (let head = 0; head < queue.length; head++)
            for (const v of adj[queue[head]]) if (!seen[v]) { seen[v] = true; queue.push(v); }
        if (queue.length < n) res.push(connections[skip]);
    }
    return res;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Tarjan\'s bridge-finding (discovery time and low-link)',
        idea: 'Run one DFS. disc[u] is when u was first visited; low[u] is the earliest discovery time reachable from u\'s subtree using tree edges plus at most one back edge. For a tree edge u → v, if low[v] > disc[u], nothing below v can climb back to u or above without that edge: it is a bridge.',
        steps: [
          'Build the adjacency list. Set every disc to −1 and DFS from node 0.',
          'On entering u: disc[u] = low[u] = time++.',
          'For each neighbour v other than the parent: if unvisited, DFS(v), then low[u] = min(low[u], low[v]) and, if low[v] > disc[u], record [u, v]. If visited, it is a back edge: low[u] = min(low[u], disc[v]).',
          'Return the recorded edges.',
        ],
        time: 'O(V + E)', space: 'O(V + E)',
        why: 'One traversal touches every node and edge once. Skipping the parent is safe here because there are no parallel connections; with duplicate edges you would skip the parent edge by its index instead.',
        code: {
          java: r`class Solution {
    private List<Integer>[] adj;
    private int[] disc, low;
    private int time = 0;
    private final List<List<Integer>> res = new ArrayList<>();
    public List<List<Integer>> criticalConnections(int n, List<List<Integer>> connections) {
        adj = new List[n];
        for (int i = 0; i < n; i++) adj[i] = new ArrayList<>();
        for (List<Integer> c : connections) { adj[c.get(0)].add(c.get(1)); adj[c.get(1)].add(c.get(0)); }
        disc = new int[n];
        low = new int[n];
        Arrays.fill(disc, -1);
        dfs(0, -1);
        return res;
    }
    private void dfs(int u, int parent) {
        disc[u] = low[u] = time++;
        for (int v : adj[u]) {
            if (v == parent) continue;
            if (disc[v] == -1) {
                dfs(v, u);
                low[u] = Math.min(low[u], low[v]);
                if (low[v] > disc[u]) res.add(Arrays.asList(u, v));
            } else {
                low[u] = Math.min(low[u], disc[v]);
            }
        }
    }
}`,
          cpp: r`class Solution {
    vector<vector<int>> adj, res;
    vector<int> disc, low;
    int timer = 0;
    void dfs(int u, int parent) {
        disc[u] = low[u] = timer++;
        for (int v : adj[u]) {
            if (v == parent) continue;
            if (disc[v] == -1) {
                dfs(v, u);
                low[u] = min(low[u], low[v]);
                if (low[v] > disc[u]) res.push_back({u, v});
            } else {
                low[u] = min(low[u], disc[v]);
            }
        }
    }
public:
    vector<vector<int>> criticalConnections(int n, vector<vector<int>>& connections) {
        adj.assign(n, {});
        for (auto& c : connections) { adj[c[0]].push_back(c[1]); adj[c[1]].push_back(c[0]); }
        disc.assign(n, -1);
        low.assign(n, 0);
        dfs(0, -1);
        return res;
    }
};`,
          python: r`class Solution:
    def criticalConnections(self, n: int, connections: List[List[int]]) -> List[List[int]]:
        adj = [[] for _ in range(n)]
        for a, b in connections:
            adj[a].append(b)
            adj[b].append(a)
        disc = [-1] * n
        low = [0] * n
        res = []
        timer = 0

        def dfs(u, parent):
            nonlocal timer
            disc[u] = low[u] = timer
            timer += 1
            for v in adj[u]:
                if v == parent:
                    continue
                if disc[v] == -1:
                    dfs(v, u)
                    low[u] = min(low[u], low[v])
                    if low[v] > disc[u]:
                        res.append([u, v])
                else:
                    low[u] = min(low[u], disc[v])

        dfs(0, -1)
        return res`,
          javascript: r`var criticalConnections = function(n, connections) {
    const adj = Array.from({ length: n }, () => []);
    for (const [a, b] of connections) { adj[a].push(b); adj[b].push(a); }
    const disc = new Array(n).fill(-1), low = new Array(n).fill(0), res = [];
    let time = 0;
    const dfs = (u, parent) => {
        disc[u] = low[u] = time++;
        for (const v of adj[u]) {
            if (v === parent) continue;
            if (disc[v] === -1) {
                dfs(v, u);
                low[u] = Math.min(low[u], low[v]);
                if (low[v] > disc[u]) res.push([u, v]);
            } else {
                low[u] = Math.min(low[u], disc[v]);
            }
        }
    };
    dfs(0, -1);
    return res;
};`,
        },
      },
    ],
  },

  'valid-arrangement-of-pairs': {
    pattern: 'Euler path in a directed graph with Hierholzer\'s algorithm',
    approaches: [
      {
        level: 'Brute force', name: 'Backtracking over the next pair',
        idea: 'Pick a start, then repeatedly try each unused pair that starts where the chain currently ends. If the chain gets stuck before using every pair, undo the last choice and try another.',
        steps: [
          'Group pair indices by their start value.',
          'Start from the value whose out-degree exceeds its in-degree (or any start).',
          'DFS: if all pairs are used, succeed; otherwise try each unused pair from the current end, recurse, and undo on failure.',
        ],
        time: 'O(Eᵈ)', space: 'O(E)',
        why: 'd is the largest number of pairs sharing a start. It explores dead ends, which can blow up exponentially on branchy inputs, so the generated tests time out. Hierholzer never needs to undo a choice.',
        timesOut: ['generated'],
        code: {
          java: r`class Solution {
    private Map<Integer, List<Integer>> from = new HashMap<>();
    private boolean[] used;
    private int[][] pairs, res;
    public int[][] validArrangement(int[][] pairs) {
        this.pairs = pairs;
        int n = pairs.length;
        used = new boolean[n];
        res = new int[n][];
        Map<Integer, Integer> bal = new HashMap<>();
        for (int i = 0; i < n; i++) {
            from.computeIfAbsent(pairs[i][0], k -> new ArrayList<>()).add(i);
            bal.merge(pairs[i][0], 1, Integer::sum);
            bal.merge(pairs[i][1], -1, Integer::sum);
        }
        int start = pairs[0][0];
        for (Map.Entry<Integer, Integer> e : bal.entrySet()) if (e.getValue() == 1) start = e.getKey();
        dfs(start, 0);
        return res;
    }
    private boolean dfs(int at, int k) {
        if (k == pairs.length) return true;
        for (int i : from.getOrDefault(at, List.of())) {
            if (used[i]) continue;
            used[i] = true;
            res[k] = pairs[i];
            if (dfs(pairs[i][1], k + 1)) return true;
            used[i] = false;
        }
        return false;
    }
}`,
          cpp: r`class Solution {
    unordered_map<int, vector<int>> from;
    vector<bool> used;
    vector<vector<int>> res;
    vector<vector<int>>* P;
    bool dfs(int at, int k) {
        if (k == (int)P->size()) return true;
        auto it = from.find(at);
        if (it == from.end()) return false;
        for (int i : it->second) {
            if (used[i]) continue;
            used[i] = true;
            res[k] = (*P)[i];
            if (dfs((*P)[i][1], k + 1)) return true;
            used[i] = false;
        }
        return false;
    }
public:
    vector<vector<int>> validArrangement(vector<vector<int>>& pairs) {
        P = &pairs;
        int n = pairs.size();
        used.assign(n, false);
        res.assign(n, {});
        unordered_map<int, int> bal;
        for (int i = 0; i < n; i++) { from[pairs[i][0]].push_back(i); bal[pairs[i][0]]++; bal[pairs[i][1]]--; }
        int start = pairs[0][0];
        for (auto& [v, b] : bal) if (b == 1) start = v;
        dfs(start, 0);
        return res;
    }
};`,
          python: r`class Solution:
    def validArrangement(self, pairs: List[List[int]]) -> List[List[int]]:
        frm = defaultdict(list)
        bal = defaultdict(int)
        for i, (a, b) in enumerate(pairs):
            frm[a].append(i)
            bal[a] += 1
            bal[b] -= 1
        start = next((v for v, d in bal.items() if d == 1), pairs[0][0])
        used = [False] * len(pairs)
        res = []

        def dfs(at):
            if len(res) == len(pairs):
                return True
            for i in frm[at]:
                if not used[i]:
                    used[i] = True
                    res.append(pairs[i])
                    if dfs(pairs[i][1]):
                        return True
                    res.pop()
                    used[i] = False
            return False

        dfs(start)
        return res`,
          javascript: r`var validArrangement = function(pairs) {
    const from = new Map(), bal = new Map();
    pairs.forEach(([a, b], i) => {
        if (!from.has(a)) from.set(a, []);
        from.get(a).push(i);
        bal.set(a, (bal.get(a) || 0) + 1);
        bal.set(b, (bal.get(b) || 0) - 1);
    });
    let start = pairs[0][0];
    for (const [v, d] of bal) if (d === 1) start = v;
    const used = new Array(pairs.length).fill(false), res = [];
    const dfs = (at) => {
        if (res.length === pairs.length) return true;
        for (const i of from.get(at) || []) {
            if (used[i]) continue;
            used[i] = true;
            res.push(pairs[i]);
            if (dfs(pairs[i][1])) return true;
            res.pop();
            used[i] = false;
        }
        return false;
    };
    dfs(start);
    return res;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Hierholzer\'s algorithm',
        idea: 'Numbers are nodes and pairs are directed edges; the answer is an Euler path. Start at the node with one more outgoing than incoming edge (or anywhere if all balance). Follow unused edges until stuck, then back up; each node you back up from is appended to the path, so the path comes out reversed. Detours found later are spliced in automatically.',
        steps: [
          'Build out-edge lists and the balance (out − in) of every node; start at the node with balance +1, if any.',
          'Push the start on a stack. While the stack is non-empty: if the top has an unused out-edge, push its target (consuming the edge); otherwise pop it onto `path`.',
          'Reverse `path`; consecutive nodes in it are the arranged pairs.',
        ],
        time: 'O(E)', space: 'O(E)',
        why: 'Each edge is pushed and popped once. Use an explicit stack: the path can be 10⁵ edges long, which is too deep for recursion in some languages.',
        code: {
          java: r`class Solution {
    public int[][] validArrangement(int[][] pairs) {
        Map<Integer, Deque<Integer>> out = new HashMap<>();
        Map<Integer, Integer> bal = new HashMap<>();
        for (int[] p : pairs) {
            out.computeIfAbsent(p[0], k -> new ArrayDeque<>()).push(p[1]);
            bal.merge(p[0], 1, Integer::sum);
            bal.merge(p[1], -1, Integer::sum);
        }
        int start = pairs[0][0];
        for (Map.Entry<Integer, Integer> e : bal.entrySet()) if (e.getValue() == 1) { start = e.getKey(); break; }
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
          cpp: r`class Solution {
public:
    vector<vector<int>> validArrangement(vector<vector<int>>& pairs) {
        unordered_map<int, vector<int>> out;
        unordered_map<int, int> bal;
        for (auto& p : pairs) { out[p[0]].push_back(p[1]); bal[p[0]]++; bal[p[1]]--; }
        int start = pairs[0][0];
        for (auto& [v, b] : bal) if (b == 1) { start = v; break; }
        vector<int> stack = {start}, path;
        while (!stack.empty()) {
            auto it = out.find(stack.back());
            if (it != out.end() && !it->second.empty()) {
                int nxt = it->second.back();
                it->second.pop_back();
                stack.push_back(nxt);
            } else {
                path.push_back(stack.back());
                stack.pop_back();
            }
        }
        reverse(path.begin(), path.end());
        vector<vector<int>> res;
        for (size_t i = 0; i + 1 < path.size(); i++) res.push_back({path[i], path[i + 1]});
        return res;
    }
};`,
          python: r`class Solution:
    def validArrangement(self, pairs: List[List[int]]) -> List[List[int]]:
        out = defaultdict(list)
        bal = defaultdict(int)
        for a, b in pairs:
            out[a].append(b)
            bal[a] += 1
            bal[b] -= 1
        start = next((v for v, d in bal.items() if d == 1), pairs[0][0])
        stack, path = [start], []
        while stack:
            if out[stack[-1]]:
                stack.append(out[stack[-1]].pop())
            else:
                path.append(stack.pop())
        path.reverse()
        return [[path[i], path[i + 1]] for i in range(len(path) - 1)]`,
          javascript: r`var validArrangement = function(pairs) {
    const out = new Map(), bal = new Map();
    for (const [a, b] of pairs) {
        if (!out.has(a)) out.set(a, []);
        out.get(a).push(b);
        bal.set(a, (bal.get(a) || 0) + 1);
        bal.set(b, (bal.get(b) || 0) - 1);
    }
    let start = pairs[0][0];
    for (const [v, d] of bal) if (d === 1) { start = v; break; }
    const stack = [start], path = [];
    while (stack.length) {
        const next = out.get(stack[stack.length - 1]);
        if (next && next.length) stack.push(next.pop());
        else path.push(stack.pop());
    }
    path.reverse();
    const res = [];
    for (let i = 0; i + 1 < path.length; i++) res.push([path[i], path[i + 1]]);
    return res;
};`,
        },
      },
    ],
  },
};
