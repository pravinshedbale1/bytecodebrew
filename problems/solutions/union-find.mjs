const r = String.raw;

export default {
  'find-if-path-exists-in-graph': {
    pattern: 'Connectivity: graph search or Union–Find',
    approaches: [
      {
        level: 'Optimal', name: 'BFS from the source',
        idea: 'Build adjacency lists and run a BFS from `source`; the answer is whether `destination` gets visited.',
        steps: [
          'Build the adjacency lists for the undirected edges.',
          'BFS from `source`, marking visited nodes; stop early if `destination` is reached.',
          'Return whether `destination` was visited.',
        ],
        time: 'O(V + E)', space: 'O(V + E)',
        why: 'Each node and edge is processed at most once.',
        code: {
          java: r`class Solution {
    public boolean validPath(int n, int[][] edges, int source, int destination) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (int[] e : edges) { adj.get(e[0]).add(e[1]); adj.get(e[1]).add(e[0]); }
        boolean[] seen = new boolean[n];
        Deque<Integer> queue = new ArrayDeque<>();
        queue.add(source);
        seen[source] = true;
        while (!queue.isEmpty() && !seen[destination]) {
            for (int v : adj.get(queue.poll())) if (!seen[v]) { seen[v] = true; queue.add(v); }
        }
        return seen[destination];
    }
}`,
          cpp: r`class Solution {
public:
    bool validPath(int n, vector<vector<int>>& edges, int source, int destination) {
        vector<vector<int>> adj(n);
        for (auto& e : edges) { adj[e[0]].push_back(e[1]); adj[e[1]].push_back(e[0]); }
        vector<bool> seen(n, false);
        queue<int> q;
        q.push(source);
        seen[source] = true;
        while (!q.empty() && !seen[destination]) {
            int u = q.front();
            q.pop();
            for (int v : adj[u]) if (!seen[v]) { seen[v] = true; q.push(v); }
        }
        return seen[destination];
    }
};`,
          python: r`class Solution:
    def validPath(self, n: int, edges: List[List[int]], source: int, destination: int) -> bool:
        adj = [[] for _ in range(n)]
        for a, b in edges:
            adj[a].append(b)
            adj[b].append(a)
        seen, queue = {source}, deque([source])
        while queue and destination not in seen:
            for v in adj[queue.popleft()]:
                if v not in seen:
                    seen.add(v)
                    queue.append(v)
        return destination in seen`,
          javascript: r`var validPath = function(n, edges, source, destination) {
    const adj = Array.from({ length: n }, () => []);
    for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a); }
    const seen = new Array(n).fill(false), queue = [source];
    seen[source] = true;
    for (let h = 0; h < queue.length && !seen[destination]; h++)
        for (const v of adj[queue[h]]) if (!seen[v]) { seen[v] = true; queue.push(v); }
    return seen[destination];
};`,
        },
      },
      {
        level: 'Optimal', name: 'Union–Find',
        idea: 'Union the two ends of every edge; afterwards, two nodes are connected exactly when they have the same root.',
        steps: [
          'Initialise `parent[i] = i`.',
          'For each edge, union its endpoints (with path compression and union by size).',
          'Return `find(source) == find(destination)`.',
        ],
        time: 'O((V + E)·α(V))', space: 'O(V)',
        why: 'E unions and two finds, each nearly O(1). No adjacency lists are built, so it is light on memory.',
        code: {
          java: r`class Solution {
    private int[] parent, size;

    public boolean validPath(int n, int[][] edges, int source, int destination) {
        parent = new int[n];
        size = new int[n];
        for (int i = 0; i < n; i++) { parent[i] = i; size[i] = 1; }
        for (int[] e : edges) union(e[0], e[1]);
        return find(source) == find(destination);
    }

    private int find(int x) {
        while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    }

    private void union(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return;
        if (size[a] < size[b]) { int t = a; a = b; b = t; }
        parent[b] = a;
        size[a] += size[b];
    }
}`,
          cpp: r`class Solution {
    vector<int> parent, sz;
    int find(int x) {
        while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    }
    void unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return;
        if (sz[a] < sz[b]) swap(a, b);
        parent[b] = a;
        sz[a] += sz[b];
    }
public:
    bool validPath(int n, vector<vector<int>>& edges, int source, int destination) {
        parent.resize(n);
        sz.assign(n, 1);
        iota(parent.begin(), parent.end(), 0);
        for (auto& e : edges) unite(e[0], e[1]);
        return find(source) == find(destination);
    }
};`,
          python: r`class Solution:
    def validPath(self, n: int, edges: List[List[int]], source: int, destination: int) -> bool:
        parent, size = list(range(n)), [1] * n
        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x
        for a, b in edges:
            a, b = find(a), find(b)
            if a != b:
                if size[a] < size[b]:
                    a, b = b, a
                parent[b] = a
                size[a] += size[b]
        return find(source) == find(destination)`,
          javascript: r`var validPath = function(n, edges, source, destination) {
    const parent = Array.from({ length: n }, (_, i) => i), size = new Array(n).fill(1);
    const find = (x) => {
        while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    };
    for (let [a, b] of edges) {
        a = find(a); b = find(b);
        if (a === b) continue;
        if (size[a] < size[b]) [a, b] = [b, a];
        parent[b] = a;
        size[a] += size[b];
    }
    return find(source) === find(destination);
};`,
        },
      },
    ],
  },

  'redundant-connection': {
    pattern: 'Union–Find: the first edge whose ends are already connected closes the cycle',
    approaches: [
      {
        level: 'Brute force', name: 'Before adding each edge, search for an existing path',
        idea: 'Add edges one at a time. Before adding `[u, v]`, DFS in the graph built so far; if `u` already reaches `v`, this edge closes the cycle.',
        steps: [
          'Start with an empty graph.',
          'For each edge `[u, v]`: if `u` can already reach `v` (DFS), return this edge.',
          'Otherwise add the edge to the graph.',
        ],
        time: 'O(n²)', space: 'O(n)',
        why: 'n edges, each followed by an O(n) search. With exactly one extra edge, the first edge that closes a cycle is the last cycle edge in the input, as required.',
        code: {
          java: r`class Solution {
    public int[] findRedundantConnection(int[][] edges) {
        int n = edges.length;
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i <= n; i++) adj.add(new ArrayList<>());
        for (int[] e : edges) {
            if (reaches(adj, e[0], e[1], new boolean[n + 1])) return e;
            adj.get(e[0]).add(e[1]);
            adj.get(e[1]).add(e[0]);
        }
        return new int[0];
    }

    private boolean reaches(List<List<Integer>> adj, int u, int target, boolean[] seen) {
        if (u == target) return true;
        seen[u] = true;
        for (int v : adj.get(u)) if (!seen[v] && reaches(adj, v, target, seen)) return true;
        return false;
    }
}`,
          cpp: r`class Solution {
    bool reaches(vector<vector<int>>& adj, int u, int target, vector<bool>& seen) {
        if (u == target) return true;
        seen[u] = true;
        for (int v : adj[u]) if (!seen[v] && reaches(adj, v, target, seen)) return true;
        return false;
    }
public:
    vector<int> findRedundantConnection(vector<vector<int>>& edges) {
        int n = edges.size();
        vector<vector<int>> adj(n + 1);
        for (auto& e : edges) {
            vector<bool> seen(n + 1, false);
            if (reaches(adj, e[0], e[1], seen)) return e;
            adj[e[0]].push_back(e[1]);
            adj[e[1]].push_back(e[0]);
        }
        return {};
    }
};`,
          python: r`class Solution:
    def findRedundantConnection(self, edges: List[List[int]]) -> List[int]:
        adj = defaultdict(list)
        def reaches(u, target, seen):
            if u == target:
                return True
            seen.add(u)
            return any(v not in seen and reaches(v, target, seen) for v in adj[u])
        for u, v in edges:
            if reaches(u, v, set()):
                return [u, v]
            adj[u].append(v)
            adj[v].append(u)
        return []`,
          javascript: r`var findRedundantConnection = function(edges) {
    const adj = Array.from({ length: edges.length + 1 }, () => []);
    const reaches = (u, target, seen) => {
        if (u === target) return true;
        seen.add(u);
        return adj[u].some((v) => !seen.has(v) && reaches(v, target, seen));
    };
    for (const [u, v] of edges) {
        if (reaches(u, v, new Set())) return [u, v];
        adj[u].push(v);
        adj[v].push(u);
    }
    return [];
};`,
        },
      },
      {
        level: 'Optimal', name: 'Union–Find',
        idea: 'Process edges in order, unioning their endpoints. The first edge whose endpoints already share a root would create a cycle — that is the redundant edge.',
        steps: [
          'Initialise `parent[i] = i` for nodes 1..n.',
          'For each edge `[u, v]`: if `find(u) == find(v)`, return the edge.',
          'Otherwise union them.',
        ],
        time: 'O(n·α(n))', space: 'O(n)',
        why: 'n near-constant union/find operations. As above, the first cycle-closing edge is the last cycle edge in the input order.',
        code: {
          java: r`class Solution {
    public int[] findRedundantConnection(int[][] edges) {
        int[] parent = new int[edges.length + 1];
        for (int i = 0; i < parent.length; i++) parent[i] = i;
        for (int[] e : edges) {
            int a = find(parent, e[0]), b = find(parent, e[1]);
            if (a == b) return e;
            parent[a] = b;
        }
        return new int[0];
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
    vector<int> findRedundantConnection(vector<vector<int>>& edges) {
        vector<int> parent(edges.size() + 1);
        iota(parent.begin(), parent.end(), 0);
        for (auto& e : edges) {
            int a = find(parent, e[0]), b = find(parent, e[1]);
            if (a == b) return e;
            parent[a] = b;
        }
        return {};
    }
};`,
          python: r`class Solution:
    def findRedundantConnection(self, edges: List[List[int]]) -> List[int]:
        parent = list(range(len(edges) + 1))
        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x
        for u, v in edges:
            a, b = find(u), find(v)
            if a == b:
                return [u, v]
            parent[a] = b
        return []`,
          javascript: r`var findRedundantConnection = function(edges) {
    const parent = Array.from({ length: edges.length + 1 }, (_, i) => i);
    const find = (x) => {
        while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    };
    for (const [u, v] of edges) {
        const a = find(u), b = find(v);
        if (a === b) return [u, v];
        parent[a] = b;
    }
    return [];
};`,
        },
      },
    ],
  },

  'satisfiability-of-equality-equations': {
    pattern: 'Union–Find: apply all equalities first, then check the inequalities',
    approaches: [
      {
        level: 'Optimal', name: 'Graph of equalities and connected components',
        idea: 'Variables joined by `==` must share a value: they form connected components. An inequality `a != b` is impossible exactly when `a` and `b` are in the same component.',
        steps: [
          'Build an undirected graph on 26 letters with an edge for each `==`.',
          'Label each letter with its component using DFS.',
          'For each `!=` equation, return false if both letters have the same label. Otherwise return true.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'n equations, and the graph has only 26 nodes, so the DFS is constant work. The edges stored are at most n, but the 26-node labelling is O(1).',
        code: {
          java: r`class Solution {
    public boolean equationsPossible(String[] equations) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < 26; i++) adj.add(new ArrayList<>());
        for (String e : equations)
            if (e.charAt(1) == '=') {
                int a = e.charAt(0) - 'a', b = e.charAt(3) - 'a';
                adj.get(a).add(b);
                adj.get(b).add(a);
            }
        int[] label = new int[26];
        Arrays.fill(label, -1);
        for (int i = 0; i < 26; i++) if (label[i] == -1) paint(adj, i, i, label);
        for (String e : equations)
            if (e.charAt(1) == '!' && label[e.charAt(0) - 'a'] == label[e.charAt(3) - 'a']) return false;
        return true;
    }

    private void paint(List<List<Integer>> adj, int u, int id, int[] label) {
        label[u] = id;
        for (int v : adj.get(u)) if (label[v] == -1) paint(adj, v, id, label);
    }
}`,
          cpp: r`class Solution {
    void paint(vector<vector<int>>& adj, int u, int id, vector<int>& label) {
        label[u] = id;
        for (int v : adj[u]) if (label[v] == -1) paint(adj, v, id, label);
    }
public:
    bool equationsPossible(vector<string>& equations) {
        vector<vector<int>> adj(26);
        for (auto& e : equations)
            if (e[1] == '=') { adj[e[0] - 'a'].push_back(e[3] - 'a'); adj[e[3] - 'a'].push_back(e[0] - 'a'); }
        vector<int> label(26, -1);
        for (int i = 0; i < 26; i++) if (label[i] == -1) paint(adj, i, i, label);
        for (auto& e : equations)
            if (e[1] == '!' && label[e[0] - 'a'] == label[e[3] - 'a']) return false;
        return true;
    }
};`,
          python: r`class Solution:
    def equationsPossible(self, equations: List[str]) -> bool:
        adj = defaultdict(list)
        for e in equations:
            if e[1] == "=":
                adj[e[0]].append(e[3])
                adj[e[3]].append(e[0])
        label = {}
        def paint(u, comp):
            label[u] = comp
            for v in adj[u]:
                if v not in label:
                    paint(v, comp)
        for c in string.ascii_lowercase:
            if c not in label:
                paint(c, c)
        return all(not (e[1] == "!" and label[e[0]] == label[e[3]]) for e in equations)`,
          javascript: r`var equationsPossible = function(equations) {
    const adj = Array.from({ length: 26 }, () => []), code = (c) => c.charCodeAt(0) - 97;
    for (const e of equations)
        if (e[1] === '=') { adj[code(e[0])].push(code(e[3])); adj[code(e[3])].push(code(e[0])); }
    const label = new Array(26).fill(-1);
    const paint = (u, id) => {
        label[u] = id;
        for (const v of adj[u]) if (label[v] === -1) paint(v, id);
    };
    for (let i = 0; i < 26; i++) if (label[i] === -1) paint(i, i);
    return equations.every((e) => e[1] !== '!' || label[code(e[0])] !== label[code(e[3])]);
};`,
        },
      },
      {
        level: 'Optimal', name: 'Union–Find over 26 letters',
        idea: 'Two passes: first union the letters of every `==`, then check that no `!=` joins two letters with the same root. Doing all equalities first matters, because an equality later in the list can merge groups.',
        steps: [
          'Initialise `parent` for 26 letters.',
          'Pass 1: for each `a==b`, union `a` and `b`.',
          'Pass 2: for each `a!=b`, if `find(a) == find(b)`, return false.',
          'Return true.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'Two passes over the n equations with near-constant finds on a 26-element array.',
        code: {
          java: r`class Solution {
    private final int[] parent = new int[26];

    public boolean equationsPossible(String[] equations) {
        for (int i = 0; i < 26; i++) parent[i] = i;
        for (String e : equations)
            if (e.charAt(1) == '=') parent[find(e.charAt(0) - 'a')] = find(e.charAt(3) - 'a');
        for (String e : equations)
            if (e.charAt(1) == '!' && find(e.charAt(0) - 'a') == find(e.charAt(3) - 'a')) return false;
        return true;
    }

    private int find(int x) {
        while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    }
}`,
          cpp: r`class Solution {
    int parent[26];
    int find(int x) {
        while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    }
public:
    bool equationsPossible(vector<string>& equations) {
        for (int i = 0; i < 26; i++) parent[i] = i;
        for (auto& e : equations)
            if (e[1] == '=') parent[find(e[0] - 'a')] = find(e[3] - 'a');
        for (auto& e : equations)
            if (e[1] == '!' && find(e[0] - 'a') == find(e[3] - 'a')) return false;
        return true;
    }
};`,
          python: r`class Solution:
    def equationsPossible(self, equations: List[str]) -> bool:
        parent = list(range(26))
        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x
        idx = lambda c: ord(c) - 97
        for e in equations:
            if e[1] == "=":
                parent[find(idx(e[0]))] = find(idx(e[3]))
        return all(e[1] == "=" or find(idx(e[0])) != find(idx(e[3])) for e in equations)`,
          javascript: r`var equationsPossible = function(equations) {
    const parent = Array.from({ length: 26 }, (_, i) => i), code = (c) => c.charCodeAt(0) - 97;
    const find = (x) => {
        while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    };
    for (const e of equations) if (e[1] === '=') parent[find(code(e[0]))] = find(code(e[3]));
    return equations.every((e) => e[1] === '=' || find(code(e[0])) !== find(code(e[3])));
};`,
        },
      },
    ],
  },

  'smallest-string-with-swaps': {
    pattern: 'Connected components of indices; sort the letters inside each component',
    approaches: [
      {
        level: 'Optimal', name: 'DFS components, then sort each one',
        idea: 'Swaps along connected pairs can produce any arrangement of the letters within a connected group of indices. So, per group, put its letters in sorted order into its indices in sorted order.',
        steps: [
          'Build a graph on indices with an edge per pair.',
          'For each unvisited index, collect its component with an iterative DFS.',
          'Sort the component\'s indices and its letters; write the smallest letter at the smallest index, and so on.',
          'Return the new string.',
        ],
        time: 'O(n log n + p)', space: 'O(n + p)',
        why: 'Finding components is O(n + p) for p pairs; sorting all components together costs O(n log n). The graph takes O(n + p).',
        code: {
          java: r`class Solution {
    public String smallestStringWithSwaps(String s, List<List<Integer>> pairs) {
        int n = s.length();
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (List<Integer> p : pairs) { adj.get(p.get(0)).add(p.get(1)); adj.get(p.get(1)).add(p.get(0)); }
        char[] out = s.toCharArray();
        boolean[] seen = new boolean[n];
        for (int start = 0; start < n; start++) {
            if (seen[start]) continue;
            List<Integer> comp = new ArrayList<>();
            Deque<Integer> stack = new ArrayDeque<>();
            stack.push(start);
            seen[start] = true;
            while (!stack.isEmpty()) {
                int u = stack.pop();
                comp.add(u);
                for (int v : adj.get(u)) if (!seen[v]) { seen[v] = true; stack.push(v); }
            }
            Collections.sort(comp);
            char[] letters = new char[comp.size()];
            for (int k = 0; k < letters.length; k++) letters[k] = s.charAt(comp.get(k));
            Arrays.sort(letters);
            for (int k = 0; k < letters.length; k++) out[comp.get(k)] = letters[k];
        }
        return new String(out);
    }
}`,
          cpp: r`class Solution {
public:
    string smallestStringWithSwaps(string s, vector<vector<int>>& pairs) {
        int n = s.size();
        vector<vector<int>> adj(n);
        for (auto& p : pairs) { adj[p[0]].push_back(p[1]); adj[p[1]].push_back(p[0]); }
        string out = s;
        vector<bool> seen(n, false);
        for (int start = 0; start < n; start++) {
            if (seen[start]) continue;
            vector<int> comp, stack{start};
            seen[start] = true;
            while (!stack.empty()) {
                int u = stack.back();
                stack.pop_back();
                comp.push_back(u);
                for (int v : adj[u]) if (!seen[v]) { seen[v] = true; stack.push_back(v); }
            }
            sort(comp.begin(), comp.end());
            string letters;
            for (int i : comp) letters += s[i];
            sort(letters.begin(), letters.end());
            for (size_t k = 0; k < comp.size(); k++) out[comp[k]] = letters[k];
        }
        return out;
    }
};`,
          python: r`class Solution:
    def smallestStringWithSwaps(self, s: str, pairs: List[List[int]]) -> str:
        n = len(s)
        adj = [[] for _ in range(n)]
        for a, b in pairs:
            adj[a].append(b)
            adj[b].append(a)
        out, seen = list(s), [False] * n
        for start in range(n):
            if seen[start]:
                continue
            seen[start] = True
            comp, stack = [], [start]
            while stack:
                u = stack.pop()
                comp.append(u)
                for v in adj[u]:
                    if not seen[v]:
                        seen[v] = True
                        stack.append(v)
            comp.sort()
            for i, c in zip(comp, sorted(s[i] for i in comp)):
                out[i] = c
        return "".join(out)`,
          javascript: r`var smallestStringWithSwaps = function(s, pairs) {
    const n = s.length, adj = Array.from({ length: n }, () => []);
    for (const [a, b] of pairs) { adj[a].push(b); adj[b].push(a); }
    const out = s.split(''), seen = new Array(n).fill(false);
    for (let start = 0; start < n; start++) {
        if (seen[start]) continue;
        seen[start] = true;
        const comp = [], stack = [start];
        while (stack.length) {
            const u = stack.pop();
            comp.push(u);
            for (const v of adj[u]) if (!seen[v]) { seen[v] = true; stack.push(v); }
        }
        comp.sort((a, b) => a - b);
        const letters = comp.map((i) => s[i]).sort();
        comp.forEach((i, k) => { out[i] = letters[k]; });
    }
    return out.join('');
};`,
        },
      },
      {
        level: 'Optimal', name: 'Union–Find, then counting sort per group',
        idea: 'Union the indices of every pair. Then count the letters in each group (26 counters per root) and fill the indices from left to right with each group\'s smallest remaining letter.',
        steps: [
          'Union every pair.',
          'For each index, add its letter to the counts of its root.',
          'Walk indices from left to right; for index `i` with root `r`, write the smallest letter whose count in `r` is still positive, and decrease that count.',
        ],
        time: 'O((n + p)·α(n) + 26·n)', space: 'O(26·n)',
        why: 'Union–Find handles the pairs; counting replaces sorting. Scanning for the smallest letter takes at most 26 steps per index.',
        code: {
          java: r`class Solution {
    private int[] parent;

    public String smallestStringWithSwaps(String s, List<List<Integer>> pairs) {
        int n = s.length();
        parent = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
        for (List<Integer> p : pairs) parent[find(p.get(0))] = find(p.get(1));
        int[][] count = new int[n][];
        for (int i = 0; i < n; i++) {
            int root = find(i);
            if (count[root] == null) count[root] = new int[26];
            count[root][s.charAt(i) - 'a']++;
        }
        char[] out = new char[n];
        for (int i = 0; i < n; i++) {
            int[] c = count[find(i)];
            int k = 0;
            while (c[k] == 0) k++;
            c[k]--;
            out[i] = (char) ('a' + k);
        }
        return new String(out);
    }

    private int find(int x) {
        while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    }
}`,
          cpp: r`class Solution {
    vector<int> parent;
    int find(int x) {
        while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    }
public:
    string smallestStringWithSwaps(string s, vector<vector<int>>& pairs) {
        int n = s.size();
        parent.resize(n);
        iota(parent.begin(), parent.end(), 0);
        for (auto& p : pairs) parent[find(p[0])] = find(p[1]);
        vector<array<int, 26>> count(n);
        for (int i = 0; i < n; i++) count[find(i)][s[i] - 'a']++;
        string out(n, ' ');
        for (int i = 0; i < n; i++) {
            auto& c = count[find(i)];
            int k = 0;
            while (c[k] == 0) k++;
            c[k]--;
            out[i] = 'a' + k;
        }
        return out;
    }
};`,
          python: r`class Solution:
    def smallestStringWithSwaps(self, s: str, pairs: List[List[int]]) -> str:
        n = len(s)
        parent = list(range(n))
        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x
        for a, b in pairs:
            parent[find(a)] = find(b)
        count = defaultdict(lambda: [0] * 26)
        for i, ch in enumerate(s):
            count[find(i)][ord(ch) - 97] += 1
        out = []
        for i in range(n):
            c = count[find(i)]
            k = 0
            while c[k] == 0:
                k += 1
            c[k] -= 1
            out.append(chr(97 + k))
        return "".join(out)`,
          javascript: r`var smallestStringWithSwaps = function(s, pairs) {
    const n = s.length, parent = Array.from({ length: n }, (_, i) => i);
    const find = (x) => {
        while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    };
    for (const [a, b] of pairs) parent[find(a)] = find(b);
    const count = new Map();
    for (let i = 0; i < n; i++) {
        const root = find(i);
        if (!count.has(root)) count.set(root, new Array(26).fill(0));
        count.get(root)[s.charCodeAt(i) - 97]++;
    }
    const out = [];
    for (let i = 0; i < n; i++) {
        const c = count.get(find(i));
        let k = 0;
        while (c[k] === 0) k++;
        c[k]--;
        out.push(String.fromCharCode(97 + k));
    }
    return out.join('');
};`,
        },
      },
    ],
  },

  'accounts-merge': {
    pattern: 'Union–Find (or DFS) over shared emails',
    approaches: [
      {
        level: 'Optimal', name: 'Union–Find over account indices',
        idea: 'Map each email to the first account that listed it. When another account lists the same email, union the two accounts. Each final group of accounts is one person; collect its emails into a sorted set.',
        steps: [
          'For each account `i` and each of its emails: if the email was seen in account `j`, union `i` and `j`; otherwise record `owner[email] = i`.',
          'For each email, add it to the set of `find(owner[email])`.',
          'For each root, output `[name, ...sorted emails]`.',
        ],
        time: 'O(E log E)', space: 'O(E)',
        why: 'E is the total number of emails. Unions are near-constant; sorting each person\'s emails dominates.',
        code: {
          java: r`class Solution {
    private int[] parent;

    public List<List<String>> accountsMerge(List<List<String>> accounts) {
        int n = accounts.size();
        parent = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
        Map<String, Integer> owner = new HashMap<>();
        for (int i = 0; i < n; i++)
            for (String email : accounts.get(i).subList(1, accounts.get(i).size())) {
                Integer j = owner.putIfAbsent(email, i);
                if (j != null) parent[find(i)] = find(j);
            }
        Map<Integer, TreeSet<String>> groups = new HashMap<>();
        for (Map.Entry<String, Integer> e : owner.entrySet())
            groups.computeIfAbsent(find(e.getValue()), k -> new TreeSet<>()).add(e.getKey());
        List<List<String>> out = new ArrayList<>();
        for (Map.Entry<Integer, TreeSet<String>> g : groups.entrySet()) {
            List<String> acc = new ArrayList<>();
            acc.add(accounts.get(g.getKey()).get(0));
            acc.addAll(g.getValue());
            out.add(acc);
        }
        return out;
    }

    private int find(int x) {
        while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    }
}`,
          cpp: r`class Solution {
    vector<int> parent;
    int find(int x) {
        while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    }
public:
    vector<vector<string>> accountsMerge(vector<vector<string>>& accounts) {
        int n = accounts.size();
        parent.resize(n);
        iota(parent.begin(), parent.end(), 0);
        unordered_map<string, int> owner;
        for (int i = 0; i < n; i++)
            for (size_t k = 1; k < accounts[i].size(); k++) {
                auto it = owner.find(accounts[i][k]);
                if (it == owner.end()) owner[accounts[i][k]] = i;
                else parent[find(i)] = find(it->second);
            }
        unordered_map<int, set<string>> groups;
        for (auto& [email, i] : owner) groups[find(i)].insert(email);
        vector<vector<string>> out;
        for (auto& [root, emails] : groups) {
            vector<string> acc{accounts[root][0]};
            acc.insert(acc.end(), emails.begin(), emails.end());
            out.push_back(acc);
        }
        return out;
    }
};`,
          python: r`class Solution:
    def accountsMerge(self, accounts: List[List[str]]) -> List[List[str]]:
        parent = list(range(len(accounts)))
        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x
        owner = {}
        for i, acc in enumerate(accounts):
            for email in acc[1:]:
                if email in owner:
                    parent[find(i)] = find(owner[email])
                else:
                    owner[email] = i
        groups = defaultdict(list)
        for email, i in owner.items():
            groups[find(i)].append(email)
        return [[accounts[root][0]] + sorted(emails) for root, emails in groups.items()]`,
          javascript: r`var accountsMerge = function(accounts) {
    const parent = accounts.map((_, i) => i);
    const find = (x) => {
        while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    };
    const owner = new Map();
    accounts.forEach((acc, i) => {
        for (const email of acc.slice(1)) {
            if (owner.has(email)) parent[find(i)] = find(owner.get(email));
            else owner.set(email, i);
        }
    });
    const groups = new Map();
    for (const [email, i] of owner) {
        const root = find(i);
        if (!groups.has(root)) groups.set(root, []);
        groups.get(root).push(email);
    }
    // plain sort compares UTF-16 code units, like Java/C++/Python string order
    return [...groups].map(([root, emails]) => [accounts[root][0], ...emails.sort()]);
};`,
        },
      },
      {
        level: 'Optimal', name: 'DFS over an email graph',
        idea: 'Link every email of an account to the account\'s first email. Each connected component of this graph is one person; collect it with a DFS.',
        steps: [
          'For each account, connect its first email to each of its other emails (both ways) and remember each email\'s name.',
          'DFS from every unvisited email to collect its component.',
          'Sort the component and prepend the name.',
        ],
        time: 'O(E log E)', space: 'O(E)',
        why: 'The graph has E nodes and fewer than E edges; DFS is linear, and sorting each component dominates.',
        code: {
          java: r`class Solution {
    public List<List<String>> accountsMerge(List<List<String>> accounts) {
        Map<String, List<String>> adj = new HashMap<>();
        Map<String, String> name = new HashMap<>();
        for (List<String> acc : accounts) {
            String first = acc.get(1);
            for (String email : acc.subList(1, acc.size())) {
                adj.computeIfAbsent(email, k -> new ArrayList<>()).add(first);
                adj.computeIfAbsent(first, k -> new ArrayList<>()).add(email);
                name.put(email, acc.get(0));
            }
        }
        Set<String> seen = new HashSet<>();
        List<List<String>> out = new ArrayList<>();
        for (String start : adj.keySet()) {
            if (!seen.add(start)) continue;
            List<String> comp = new ArrayList<>();
            Deque<String> stack = new ArrayDeque<>();
            stack.push(start);
            while (!stack.isEmpty()) {
                String e = stack.pop();
                comp.add(e);
                for (String nb : adj.get(e)) if (seen.add(nb)) stack.push(nb);
            }
            Collections.sort(comp);
            comp.add(0, name.get(start));
            out.add(comp);
        }
        return out;
    }
}`,
          cpp: r`class Solution {
public:
    vector<vector<string>> accountsMerge(vector<vector<string>>& accounts) {
        unordered_map<string, vector<string>> adj;
        unordered_map<string, string> name;
        for (auto& acc : accounts)
            for (size_t k = 1; k < acc.size(); k++) {
                adj[acc[k]].push_back(acc[1]);
                adj[acc[1]].push_back(acc[k]);
                name[acc[k]] = acc[0];
            }
        unordered_set<string> seen;
        vector<vector<string>> out;
        for (auto& [start, _] : adj) {
            if (!seen.insert(start).second) continue;
            vector<string> comp, stack{start};
            while (!stack.empty()) {
                string e = stack.back();
                stack.pop_back();
                comp.push_back(e);
                for (auto& nb : adj[e]) if (seen.insert(nb).second) stack.push_back(nb);
            }
            sort(comp.begin(), comp.end());
            comp.insert(comp.begin(), name[start]);
            out.push_back(comp);
        }
        return out;
    }
};`,
          python: r`class Solution:
    def accountsMerge(self, accounts: List[List[str]]) -> List[List[str]]:
        adj, name = defaultdict(list), {}
        for acc in accounts:
            first = acc[1]
            for email in acc[1:]:
                adj[email].append(first)
                adj[first].append(email)
                name[email] = acc[0]
        seen, out = set(), []
        for start in adj:
            if start in seen:
                continue
            seen.add(start)
            comp, stack = [], [start]
            while stack:
                e = stack.pop()
                comp.append(e)
                for nb in adj[e]:
                    if nb not in seen:
                        seen.add(nb)
                        stack.append(nb)
            out.append([name[start]] + sorted(comp))
        return out`,
          javascript: r`var accountsMerge = function(accounts) {
    const adj = new Map(), name = new Map();
    const link = (a, b) => {
        if (!adj.has(a)) adj.set(a, []);
        adj.get(a).push(b);
    };
    for (const acc of accounts)
        for (const email of acc.slice(1)) {
            link(email, acc[1]);
            link(acc[1], email);
            name.set(email, acc[0]);
        }
    const seen = new Set(), out = [];
    for (const start of adj.keys()) {
        if (seen.has(start)) continue;
        seen.add(start);
        const comp = [], stack = [start];
        while (stack.length) {
            const e = stack.pop();
            comp.push(e);
            for (const nb of adj.get(e)) if (!seen.has(nb)) { seen.add(nb); stack.push(nb); }
        }
        out.push([name.get(start), ...comp.sort()]);
    }
    return out;
};`,
        },
      },
    ],
  },

  'min-cost-to-connect-all-points': {
    pattern: 'Minimum spanning tree (Kruskal with Union–Find, or Prim)',
    approaches: [
      {
        level: 'Better', name: 'Kruskal: sort all edges, add those that join two components',
        idea: 'Consider every pair as an edge weighted by Manhattan distance. Take edges from cheapest to most expensive, keeping an edge only if it connects two different components (Union–Find). After n − 1 edges, all points are connected at minimum cost.',
        steps: [
          'Generate all n(n − 1)/2 edges with their costs and sort them.',
          'For each edge in order, if its endpoints are in different sets, union them and add the cost.',
          'Stop after n − 1 edges; return the total.',
        ],
        time: 'O(n² log n)', space: 'O(n²)',
        why: 'There are about n²/2 = 5·10⁵ edges to store and sort. Correct by the cut property: the cheapest edge leaving any component is in some MST.',
        code: {
          java: r`class Solution {
    private int[] parent;

    public int minCostConnectPoints(int[][] points) {
        int n = points.length;
        List<int[]> edges = new ArrayList<>();
        for (int i = 0; i < n; i++)
            for (int j = i + 1; j < n; j++)
                edges.add(new int[] { Math.abs(points[i][0] - points[j][0]) + Math.abs(points[i][1] - points[j][1]), i, j });
        edges.sort((a, b) -> Integer.compare(a[0], b[0]));
        parent = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
        int total = 0, used = 0;
        for (int[] e : edges) {
            if (used == n - 1) break;
            int a = find(e[1]), b = find(e[2]);
            if (a == b) continue;
            parent[a] = b;
            total += e[0];
            used++;
        }
        return total;
    }

    private int find(int x) {
        while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    }
}`,
          cpp: r`class Solution {
    vector<int> parent;
    int find(int x) {
        while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    }
public:
    int minCostConnectPoints(vector<vector<int>>& points) {
        int n = points.size();
        vector<array<int, 3>> edges;
        for (int i = 0; i < n; i++)
            for (int j = i + 1; j < n; j++)
                edges.push_back({abs(points[i][0] - points[j][0]) + abs(points[i][1] - points[j][1]), i, j});
        sort(edges.begin(), edges.end());
        parent.resize(n);
        iota(parent.begin(), parent.end(), 0);
        int total = 0, used = 0;
        for (auto& [w, i, j] : edges) {
            if (used == n - 1) break;
            int a = find(i), b = find(j);
            if (a == b) continue;
            parent[a] = b;
            total += w;
            used++;
        }
        return total;
    }
};`,
          python: r`class Solution:
    def minCostConnectPoints(self, points: List[List[int]]) -> int:
        n = len(points)
        edges = sorted(
            (abs(points[i][0] - points[j][0]) + abs(points[i][1] - points[j][1]), i, j)
            for i in range(n) for j in range(i + 1, n)
        )
        parent = list(range(n))
        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x
        total = used = 0
        for w, i, j in edges:
            if used == n - 1:
                break
            a, b = find(i), find(j)
            if a != b:
                parent[a] = b
                total += w
                used += 1
        return total`,
          javascript: r`var minCostConnectPoints = function(points) {
    const n = points.length, edges = [];
    for (let i = 0; i < n; i++)
        for (let j = i + 1; j < n; j++)
            edges.push([Math.abs(points[i][0] - points[j][0]) + Math.abs(points[i][1] - points[j][1]), i, j]);
    edges.sort((a, b) => a[0] - b[0]);
    const parent = Array.from({ length: n }, (_, i) => i);
    const find = (x) => {
        while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    };
    let total = 0, used = 0;
    for (const [w, i, j] of edges) {
        if (used === n - 1) break;
        const a = find(i), b = find(j);
        if (a === b) continue;
        parent[a] = b;
        total += w;
        used++;
    }
    return total;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Prim\'s algorithm on the dense graph',
        idea: 'Grow the tree from point 0. Keep, for every point outside the tree, the cheapest connection to any point inside it. Repeatedly add the outside point with the cheapest connection and update the others from it. With all pairs as edges, a plain array beats a heap.',
        steps: [
          'Set `dist[i] = ∞` for all points, `dist[0] = 0`.',
          'Repeat n times: pick the point `u` not in the tree with the smallest `dist`; add it and add `dist[u]` to the total.',
          'For every point `v` not in the tree, set `dist[v] = min(dist[v], cost(u, v))`.',
          'Return the total.',
        ],
        time: 'O(n²)', space: 'O(n)',
        why: 'n rounds of O(n) scanning and updating; no edge list is ever built. For a complete graph this matches the number of edges, so it is optimal.',
        code: {
          java: r`class Solution {
    public int minCostConnectPoints(int[][] points) {
        int n = points.length, total = 0;
        int[] dist = new int[n];
        boolean[] inTree = new boolean[n];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[0] = 0;
        for (int round = 0; round < n; round++) {
            int u = -1;
            for (int i = 0; i < n; i++) if (!inTree[i] && (u == -1 || dist[i] < dist[u])) u = i;
            inTree[u] = true;
            total += dist[u];
            for (int v = 0; v < n; v++) {
                if (inTree[v]) continue;
                int cost = Math.abs(points[u][0] - points[v][0]) + Math.abs(points[u][1] - points[v][1]);
                if (cost < dist[v]) dist[v] = cost;
            }
        }
        return total;
    }
}`,
          cpp: r`class Solution {
public:
    int minCostConnectPoints(vector<vector<int>>& points) {
        int n = points.size(), total = 0;
        vector<int> dist(n, INT_MAX);
        vector<bool> inTree(n, false);
        dist[0] = 0;
        for (int round = 0; round < n; round++) {
            int u = -1;
            for (int i = 0; i < n; i++) if (!inTree[i] && (u == -1 || dist[i] < dist[u])) u = i;
            inTree[u] = true;
            total += dist[u];
            for (int v = 0; v < n; v++) {
                if (inTree[v]) continue;
                int cost = abs(points[u][0] - points[v][0]) + abs(points[u][1] - points[v][1]);
                dist[v] = min(dist[v], cost);
            }
        }
        return total;
    }
};`,
          python: r`class Solution:
    def minCostConnectPoints(self, points: List[List[int]]) -> int:
        n = len(points)
        dist, in_tree, total = [inf] * n, [False] * n, 0
        dist[0] = 0
        for _ in range(n):
            u = min((i for i in range(n) if not in_tree[i]), key=lambda i: dist[i])
            in_tree[u] = True
            total += dist[u]
            ux, uy = points[u]
            for v in range(n):
                if not in_tree[v]:
                    cost = abs(ux - points[v][0]) + abs(uy - points[v][1])
                    if cost < dist[v]:
                        dist[v] = cost
        return total`,
          javascript: r`var minCostConnectPoints = function(points) {
    const n = points.length, dist = new Array(n).fill(Infinity), inTree = new Array(n).fill(false);
    dist[0] = 0;
    let total = 0;
    for (let round = 0; round < n; round++) {
        let u = -1;
        for (let i = 0; i < n; i++) if (!inTree[i] && (u === -1 || dist[i] < dist[u])) u = i;
        inTree[u] = true;
        total += dist[u];
        for (let v = 0; v < n; v++) {
            if (inTree[v]) continue;
            const cost = Math.abs(points[u][0] - points[v][0]) + Math.abs(points[u][1] - points[v][1]);
            if (cost < dist[v]) dist[v] = cost;
        }
    }
    return total;
};`,
        },
      },
    ],
  },

  'regions-cut-by-slashes': {
    pattern: 'Split each cell into pieces and count connected components (Union–Find or flood fill)',
    approaches: [
      {
        level: 'Better', name: 'Draw the grid at 3× size and flood fill',
        idea: 'Scale each cell up to a 3 × 3 block of pixels and draw `/` or `\\` as a diagonal of blocked pixels. The regions are then ordinary connected components of free pixels, counted with a flood fill.',
        steps: [
          'Make a `3n × 3n` pixel grid. For `/` in cell `(r, c)`, block pixels `(3r + k, 3c + 2 − k)`; for `\\`, block `(3r + k, 3c + k)`, for `k = 0..2`.',
          'Count connected groups of free pixels with BFS (4 directions).',
        ],
        time: 'O(n²)', space: 'O(n²)',
        why: '9n² pixels are filled and searched once. Two pixels per cell side are needed so that regions do not leak through the corners of a diagonal — 3× scaling is the smallest that works.',
        code: {
          java: r`class Solution {
    public int regionsBySlashes(String[] grid) {
        int n = grid.length, size = 3 * n, regions = 0;
        boolean[][] blocked = new boolean[size][size];
        for (int r = 0; r < n; r++)
            for (int c = 0; c < n; c++) {
                char ch = grid[r].charAt(c);
                for (int k = 0; k < 3; k++) {
                    if (ch == '/') blocked[3 * r + k][3 * c + 2 - k] = true;
                    else if (ch == '\\') blocked[3 * r + k][3 * c + k] = true;
                }
            }
        int[][] dirs = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } };
        Deque<int[]> queue = new ArrayDeque<>();
        for (int r0 = 0; r0 < size; r0++)
            for (int c0 = 0; c0 < size; c0++) {
                if (blocked[r0][c0]) continue;
                regions++;
                blocked[r0][c0] = true;
                queue.add(new int[] { r0, c0 });
                while (!queue.isEmpty()) {
                    int[] p = queue.poll();
                    for (int[] d : dirs) {
                        int r = p[0] + d[0], c = p[1] + d[1];
                        if (r >= 0 && c >= 0 && r < size && c < size && !blocked[r][c]) {
                            blocked[r][c] = true;
                            queue.add(new int[] { r, c });
                        }
                    }
                }
            }
        return regions;
    }
}`,
          cpp: r`class Solution {
public:
    int regionsBySlashes(vector<string>& grid) {
        int n = grid.size(), size = 3 * n, regions = 0;
        vector<vector<bool>> blocked(size, vector<bool>(size, false));
        for (int r = 0; r < n; r++)
            for (int c = 0; c < n; c++)
                for (int k = 0; k < 3; k++) {
                    if (grid[r][c] == '/') blocked[3 * r + k][3 * c + 2 - k] = true;
                    else if (grid[r][c] == '\\') blocked[3 * r + k][3 * c + k] = true;
                }
        int dr[] = {1, -1, 0, 0}, dc[] = {0, 0, 1, -1};
        for (int r0 = 0; r0 < size; r0++)
            for (int c0 = 0; c0 < size; c0++) {
                if (blocked[r0][c0]) continue;
                regions++;
                blocked[r0][c0] = true;
                queue<pair<int, int>> q;
                q.push({r0, c0});
                while (!q.empty()) {
                    auto [r1, c1] = q.front();
                    q.pop();
                    for (int k = 0; k < 4; k++) {
                        int r = r1 + dr[k], c = c1 + dc[k];
                        if (r >= 0 && c >= 0 && r < size && c < size && !blocked[r][c]) {
                            blocked[r][c] = true;
                            q.push({r, c});
                        }
                    }
                }
            }
        return regions;
    }
};`,
          python: r`class Solution:
    def regionsBySlashes(self, grid: List[str]) -> int:
        n = len(grid)
        size = 3 * n
        blocked = [[False] * size for _ in range(size)]
        for r in range(n):
            for c in range(n):
                for k in range(3):
                    if grid[r][c] == "/":
                        blocked[3 * r + k][3 * c + 2 - k] = True
                    elif grid[r][c] == "\\":
                        blocked[3 * r + k][3 * c + k] = True
        regions = 0
        for r0 in range(size):
            for c0 in range(size):
                if blocked[r0][c0]:
                    continue
                regions += 1
                blocked[r0][c0] = True
                queue = deque([(r0, c0)])
                while queue:
                    r1, c1 = queue.popleft()
                    for r, c in ((r1 + 1, c1), (r1 - 1, c1), (r1, c1 + 1), (r1, c1 - 1)):
                        if 0 <= r < size and 0 <= c < size and not blocked[r][c]:
                            blocked[r][c] = True
                            queue.append((r, c))
        return regions`,
          javascript: r`var regionsBySlashes = function(grid) {
    const n = grid.length, size = 3 * n;
    const blocked = Array.from({ length: size }, () => new Array(size).fill(false));
    for (let r = 0; r < n; r++)
        for (let c = 0; c < n; c++)
            for (let k = 0; k < 3; k++) {
                if (grid[r][c] === '/') blocked[3 * r + k][3 * c + 2 - k] = true;
                else if (grid[r][c] === '\\') blocked[3 * r + k][3 * c + k] = true;
            }
    let regions = 0;
    for (let r0 = 0; r0 < size; r0++)
        for (let c0 = 0; c0 < size; c0++) {
            if (blocked[r0][c0]) continue;
            regions++;
            blocked[r0][c0] = true;
            const queue = [[r0, c0]];
            for (let h = 0; h < queue.length; h++) {
                const [r1, c1] = queue[h];
                for (const [r, c] of [[r1 + 1, c1], [r1 - 1, c1], [r1, c1 + 1], [r1, c1 - 1]]) {
                    if (r >= 0 && c >= 0 && r < size && c < size && !blocked[r][c]) {
                        blocked[r][c] = true;
                        queue.push([r, c]);
                    }
                }
            }
        }
    return regions;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Union–Find over four triangles per cell',
        idea: 'Split each cell into four triangles: top (0), right (1), bottom (2), left (3). A space joins all four; `/` joins top–left and right–bottom; `\\` joins top–right and bottom–left. Neighbouring cells always join along their shared edge. The number of distinct sets is the number of regions.',
        steps: [
          'Create 4n² triangles in a Union–Find; `regions` starts at 4n² and drops by one per successful union.',
          'Inside each cell, union according to its character.',
          'Union the cell\'s bottom with the top of the cell below, and its right with the left of the cell to the right.',
          'Return `regions`.',
        ],
        time: 'O(n²·α(n))', space: 'O(n²)',
        why: 'A constant number of unions per cell. It uses 4n² entries instead of 9n² pixels, and needs no flood fill.',
        code: {
          java: r`class Solution {
    private int[] parent;
    private int regions;

    public int regionsBySlashes(String[] grid) {
        int n = grid.length;
        parent = new int[4 * n * n];
        for (int i = 0; i < parent.length; i++) parent[i] = i;
        regions = parent.length;
        for (int r = 0; r < n; r++)
            for (int c = 0; c < n; c++) {
                int base = 4 * (r * n + c);
                char ch = grid[r].charAt(c);
                if (ch == ' ') { union(base, base + 1); union(base + 1, base + 2); union(base + 2, base + 3); }
                else if (ch == '/') { union(base, base + 3); union(base + 1, base + 2); }
                else { union(base, base + 1); union(base + 2, base + 3); }
                if (r + 1 < n) union(base + 2, 4 * ((r + 1) * n + c));
                if (c + 1 < n) union(base + 1, 4 * (r * n + c + 1) + 3);
            }
        return regions;
    }

    private int find(int x) {
        while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    }

    private void union(int a, int b) {
        a = find(a); b = find(b);
        if (a != b) { parent[a] = b; regions--; }
    }
}`,
          cpp: r`class Solution {
    vector<int> parent;
    int regions = 0;
    int find(int x) {
        while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    }
    void unite(int a, int b) {
        a = find(a); b = find(b);
        if (a != b) { parent[a] = b; regions--; }
    }
public:
    int regionsBySlashes(vector<string>& grid) {
        int n = grid.size();
        parent.resize(4 * n * n);
        iota(parent.begin(), parent.end(), 0);
        regions = parent.size();
        for (int r = 0; r < n; r++)
            for (int c = 0; c < n; c++) {
                int base = 4 * (r * n + c);
                char ch = grid[r][c];
                if (ch == ' ') { unite(base, base + 1); unite(base + 1, base + 2); unite(base + 2, base + 3); }
                else if (ch == '/') { unite(base, base + 3); unite(base + 1, base + 2); }
                else { unite(base, base + 1); unite(base + 2, base + 3); }
                if (r + 1 < n) unite(base + 2, 4 * ((r + 1) * n + c));
                if (c + 1 < n) unite(base + 1, 4 * (r * n + c + 1) + 3);
            }
        return regions;
    }
};`,
          python: r`class Solution:
    def regionsBySlashes(self, grid: List[str]) -> int:
        n = len(grid)
        parent = list(range(4 * n * n))
        regions = len(parent)
        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x
        def union(a, b):
            nonlocal regions
            a, b = find(a), find(b)
            if a != b:
                parent[a] = b
                regions -= 1
        for r in range(n):
            for c in range(n):
                base = 4 * (r * n + c)  # 0 top, 1 right, 2 bottom, 3 left
                ch = grid[r][c]
                if ch == " ":
                    union(base, base + 1)
                    union(base + 1, base + 2)
                    union(base + 2, base + 3)
                elif ch == "/":
                    union(base, base + 3)
                    union(base + 1, base + 2)
                else:
                    union(base, base + 1)
                    union(base + 2, base + 3)
                if r + 1 < n:
                    union(base + 2, 4 * ((r + 1) * n + c))
                if c + 1 < n:
                    union(base + 1, 4 * (r * n + c + 1) + 3)
        return regions`,
          javascript: r`var regionsBySlashes = function(grid) {
    const n = grid.length, parent = Array.from({ length: 4 * n * n }, (_, i) => i);
    let regions = parent.length;
    const find = (x) => {
        while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    };
    const union = (a, b) => {
        a = find(a); b = find(b);
        if (a !== b) { parent[a] = b; regions--; }
    };
    for (let r = 0; r < n; r++)
        for (let c = 0; c < n; c++) {
            const base = 4 * (r * n + c), ch = grid[r][c]; // 0 top, 1 right, 2 bottom, 3 left
            if (ch === ' ') { union(base, base + 1); union(base + 1, base + 2); union(base + 2, base + 3); }
            else if (ch === '/') { union(base, base + 3); union(base + 1, base + 2); }
            else { union(base, base + 1); union(base + 2, base + 3); }
            if (r + 1 < n) union(base + 2, 4 * ((r + 1) * n + c));
            if (c + 1 < n) union(base + 1, 4 * (r * n + c + 1) + 3);
        }
    return regions;
};`,
        },
      },
    ],
  },

  'largest-component-size-by-common-factor': {
    pattern: 'Union–Find through prime factors (numbers sharing a prime join the same set)',
    approaches: [
      {
        level: 'Brute force', name: 'Union every pair with a common factor',
        idea: 'Check every pair of numbers with gcd; if it is greater than 1, union them. Then report the largest set.',
        steps: [
          'For every pair `i < j`, if `gcd(nums[i], nums[j]) > 1`, union `i` and `j`.',
          'Count the members of each root and return the largest count.',
        ],
        time: 'O(n²·log M)', space: 'O(n)',
        why: 'n²/2 gcd computations of O(log M) each: 2·10⁸ gcds for n = 2·10⁴.',
        code: {
          java: r`class Solution {
    private int[] parent;

    public int largestComponentSize(int[] nums) {
        int n = nums.length;
        parent = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
        for (int i = 0; i < n; i++)
            for (int j = i + 1; j < n; j++)
                if (gcd(nums[i], nums[j]) > 1) parent[find(i)] = find(j);
        int[] count = new int[n];
        int best = 0;
        for (int i = 0; i < n; i++) best = Math.max(best, ++count[find(i)]);
        return best;
    }

    private int gcd(int a, int b) { return b == 0 ? a : gcd(b, a % b); }

    private int find(int x) {
        while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    }
}`,
          cpp: r`class Solution {
    vector<int> parent;
    int find(int x) {
        while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    }
public:
    int largestComponentSize(vector<int>& nums) {
        int n = nums.size();
        parent.resize(n);
        iota(parent.begin(), parent.end(), 0);
        for (int i = 0; i < n; i++)
            for (int j = i + 1; j < n; j++)
                if (gcd(nums[i], nums[j]) > 1) parent[find(i)] = find(j);
        vector<int> count(n, 0);
        int best = 0;
        for (int i = 0; i < n; i++) best = max(best, ++count[find(i)]);
        return best;
    }
};`,
          python: r`class Solution:
    def largestComponentSize(self, nums: List[int]) -> int:
        n = len(nums)
        parent = list(range(n))
        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x
        for i in range(n):
            for j in range(i + 1, n):
                if gcd(nums[i], nums[j]) > 1:
                    parent[find(i)] = find(j)
        return max(Counter(find(i) for i in range(n)).values())`,
          javascript: r`var largestComponentSize = function(nums) {
    const n = nums.length, parent = Array.from({ length: n }, (_, i) => i);
    const find = (x) => {
        while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    };
    const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
    for (let i = 0; i < n; i++)
        for (let j = i + 1; j < n; j++)
            if (gcd(nums[i], nums[j]) > 1) parent[find(i)] = find(j);
    const count = new Map();
    let best = 0;
    for (let i = 0; i < n; i++) {
        const root = find(i), c = (count.get(root) ?? 0) + 1;
        count.set(root, c);
        best = Math.max(best, c);
    }
    return best;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Union each number with its prime factors',
        idea: 'Two numbers share a factor > 1 exactly when they share a prime factor. Put numbers and primes in one Union–Find (indexed by value): union each number with each of its prime factors. Numbers sharing a prime end up together without ever comparing pairs.',
        steps: [
          'Create a Union–Find over values `0 .. max(nums)`.',
          'For each number, factor it by trial division up to its square root; union the number with every prime factor found (and with the leftover factor if it is greater than 1).',
          'Count how many of the input numbers share each root; return the largest count.',
        ],
        time: 'O(n·√M)', space: 'O(M)',
        why: 'Trial division takes at most √M ≈ 316 steps per number (M = 10⁵), with near-constant unions. The Union–Find covers every value up to M.',
        code: {
          java: r`class Solution {
    private int[] parent;

    public int largestComponentSize(int[] nums) {
        int max = 0;
        for (int x : nums) max = Math.max(max, x);
        parent = new int[max + 1];
        for (int i = 0; i <= max; i++) parent[i] = i;
        for (int x : nums) {
            int v = x;
            for (int p = 2; p * p <= v; p++) {
                if (v % p != 0) continue;
                parent[find(x)] = find(p);
                while (v % p == 0) v /= p;
            }
            if (v > 1) parent[find(x)] = find(v);
        }
        Map<Integer, Integer> count = new HashMap<>();
        int best = 0;
        for (int x : nums) best = Math.max(best, count.merge(find(x), 1, Integer::sum));
        return best;
    }

    private int find(int x) {
        while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    }
}`,
          cpp: r`class Solution {
    vector<int> parent;
    int find(int x) {
        while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    }
public:
    int largestComponentSize(vector<int>& nums) {
        int mx = *max_element(nums.begin(), nums.end());
        parent.resize(mx + 1);
        iota(parent.begin(), parent.end(), 0);
        for (int x : nums) {
            int v = x;
            for (int p = 2; p * p <= v; p++) {
                if (v % p) continue;
                parent[find(x)] = find(p);
                while (v % p == 0) v /= p;
            }
            if (v > 1) parent[find(x)] = find(v);
        }
        unordered_map<int, int> count;
        int best = 0;
        for (int x : nums) best = max(best, ++count[find(x)]);
        return best;
    }
};`,
          python: r`class Solution:
    def largestComponentSize(self, nums: List[int]) -> int:
        parent = list(range(max(nums) + 1))
        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x
        for x in nums:
            v, p = x, 2
            while p * p <= v:
                if v % p == 0:
                    parent[find(x)] = find(p)
                    while v % p == 0:
                        v //= p
                p += 1
            if v > 1:
                parent[find(x)] = find(v)
        return max(Counter(find(x) for x in nums).values())`,
          javascript: r`var largestComponentSize = function(nums) {
    const max = Math.max(...nums), parent = Array.from({ length: max + 1 }, (_, i) => i);
    const find = (x) => {
        while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    };
    for (const x of nums) {
        let v = x;
        for (let p = 2; p * p <= v; p++) {
            if (v % p !== 0) continue;
            parent[find(x)] = find(p);
            while (v % p === 0) v /= p;
        }
        if (v > 1) parent[find(x)] = find(v);
    }
    const count = new Map();
    let best = 0;
    for (const x of nums) {
        const root = find(x), c = (count.get(root) ?? 0) + 1;
        count.set(root, c);
        best = Math.max(best, c);
    }
    return best;
};`,
        },
      },
    ],
  },
};
