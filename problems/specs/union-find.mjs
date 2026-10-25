export default [
  {
    slug: 'find-if-path-exists-in-graph', title: 'Find if Path Exists in Graph', level: 'Easy',
    summary: 'Return whether an undirected graph with n nodes has a path from source to destination.',
    method: 'validPath', params: [['int', 'n'], ['int[][]', 'edges'], ['int', 'source'], ['int', 'destination']], returns: 'boolean',
    tests: [
      { in: [3, [[0, 1], [1, 2], [2, 0]], 0, 2], out: true },
      { in: [6, [[0, 1], [0, 2], [3, 5], [5, 4], [4, 3]], 0, 5], out: false },
      { in: [1, [], 0, 0] },
      { in: [4, [[0, 1], [2, 3]], 1, 0] },
    ],
    ref: `class Solution {
    private int[] parent;
    public boolean validPath(int n, int[][] edges, int source, int destination) {
        parent = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
        for (int[] e : edges) parent[find(e[0])] = find(e[1]);
        return find(source) == find(destination);
    }
    private int find(int x) { while (parent[x] != x) x = parent[x] = parent[parent[x]]; return x; }
}`,
  },
  {
    slug: 'redundant-connection', title: 'Redundant Connection', level: 'Medium',
    summary: 'A tree of n nodes (labelled 1..n) had one extra edge added. Return an edge whose removal leaves a tree; if several qualify, the one that appears last in the input.',
    method: 'findRedundantConnection', params: [['int[][]', 'edges']], returns: 'int[]',
    tests: [
      { in: [[[1, 2], [1, 3], [2, 3]]], out: [2, 3] },
      { in: [[[1, 2], [2, 3], [3, 4], [1, 4], [1, 5]]], out: [1, 4] },
      { in: [[[1, 2], [2, 3], [3, 1]]] },
      { in: [[[3, 4], [1, 2], [2, 4], [3, 5], [2, 5]]] },
    ],
    ref: `class Solution {
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
    private int find(int[] p, int x) { while (p[x] != x) x = p[x] = p[p[x]]; return x; }
}`,
  },
  {
    slug: 'satisfiability-of-equality-equations', title: 'Satisfiability of Equality Equations', level: 'Medium',
    summary: 'Equations look like "a==b" or "a!=b" over single-letter variables. Return whether integers can be assigned so every equation holds.',
    method: 'equationsPossible', params: [['String[]', 'equations']], returns: 'boolean',
    tests: [
      { in: [['a==b', 'b!=a']], out: false },
      { in: [['b==a', 'a==b']], out: true },
      { in: [['a!=a']] },
      { in: [['a==b', 'b==c', 'a!=c']] },
      { in: [['a==b', 'c==d', 'a!=d', 'b!=c']] },
    ],
    ref: `class Solution {
    public boolean equationsPossible(String[] equations) {
        int[] p = new int[26];
        for (int i = 0; i < 26; i++) p[i] = i;
        for (String e : equations) if (e.charAt(1) == '=') p[find(p, e.charAt(0) - 'a')] = find(p, e.charAt(3) - 'a');
        for (String e : equations) if (e.charAt(1) == '!' && find(p, e.charAt(0) - 'a') == find(p, e.charAt(3) - 'a')) return false;
        return true;
    }
    private int find(int[] p, int x) { while (p[x] != x) x = p[x] = p[p[x]]; return x; }
}`,
  },
  {
    slug: 'smallest-string-with-swaps', title: 'Smallest String With Swaps', level: 'Medium',
    summary: 'You may swap the characters at any listed pair of indices, any number of times. Return the lexicographically smallest string you can reach.',
    method: 'smallestStringWithSwaps', params: [['String', 's'], ['List<List<Integer>>', 'pairs']], returns: 'String',
    tests: [
      { in: ['dcab', [[0, 3], [1, 2]]], out: 'bacd' },
      { in: ['dcab', [[0, 3], [1, 2], [0, 2]]], out: 'abcd' },
      { in: ['cba', [[0, 1], [1, 2]]], out: 'abc' },
      { in: ['zxy', []] },
      { in: ['udyyek', [[3, 3], [3, 0], [5, 1], [3, 1], [3, 4], [3, 5]]] },
    ],
    ref: `class Solution {
    public String smallestStringWithSwaps(String s, List<List<Integer>> pairs) {
        int n = s.length();
        int[] p = new int[n];
        for (int i = 0; i < n; i++) p[i] = i;
        for (List<Integer> pr : pairs) p[find(p, pr.get(0))] = find(p, pr.get(1));
        Map<Integer, PriorityQueue<Character>> groups = new HashMap<>();
        for (int i = 0; i < n; i++) groups.computeIfAbsent(find(p, i), k -> new PriorityQueue<>()).add(s.charAt(i));
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) sb.append(groups.get(find(p, i)).poll());
        return sb.toString();
    }
    private int find(int[] p, int x) { while (p[x] != x) x = p[x] = p[p[x]]; return x; }
}`,
  },
  {
    slug: 'accounts-merge', title: 'Accounts Merge', level: 'Medium',
    summary: 'Each account is [name, email…]. Accounts sharing any email belong to the same person. Return the merged accounts as [name, emails in sorted order…]; the accounts themselves may be in any order.',
    method: 'accountsMerge', params: [['List<List<String>>', 'accounts']], returns: 'List<List<String>>', check: 'any-order',
    tests: [
      { in: [[['John', 'johnsmith@mail.com', 'john_newyork@mail.com'], ['John', 'johnsmith@mail.com', 'john00@mail.com'], ['Mary', 'mary@mail.com'], ['John', 'johnnybravo@mail.com']]], out: [['John', 'john00@mail.com', 'john_newyork@mail.com', 'johnsmith@mail.com'], ['Mary', 'mary@mail.com'], ['John', 'johnnybravo@mail.com']] },
      { in: [[['Gabe', 'Gabe0@m.co', 'Gabe3@m.co', 'Gabe1@m.co'], ['Kevin', 'Kevin3@m.co', 'Kevin5@m.co', 'Kevin0@m.co'], ['Ethan', 'Ethan5@m.co', 'Ethan4@m.co', 'Ethan0@m.co'], ['Hanzo', 'Hanzo3@m.co', 'Hanzo1@m.co', 'Hanzo0@m.co'], ['Fern', 'Fern5@m.co', 'Fern1@m.co', 'Fern0@m.co']]] },
      { in: [[['A', 'a@x', 'b@x'], ['A', 'c@x'], ['A', 'b@x', 'c@x']]] },
    ],
    ref: `class Solution {
    public List<List<String>> accountsMerge(List<List<String>> accounts) {
        Map<String, String> parent = new HashMap<>(), owner = new HashMap<>();
        for (List<String> a : accounts) for (int i = 1; i < a.size(); i++) { parent.putIfAbsent(a.get(i), a.get(i)); owner.put(a.get(i), a.get(0)); }
        for (List<String> a : accounts) for (int i = 2; i < a.size(); i++) parent.put(find(parent, a.get(i)), find(parent, a.get(1)));
        Map<String, TreeSet<String>> groups = new HashMap<>();
        for (String e : parent.keySet()) groups.computeIfAbsent(find(parent, e), k -> new TreeSet<>()).add(e);
        List<List<String>> out = new ArrayList<>();
        for (var g : groups.entrySet()) { List<String> row = new ArrayList<>(); row.add(owner.get(g.getKey())); row.addAll(g.getValue()); out.add(row); }
        return out;
    }
    private String find(Map<String, String> p, String x) { while (!p.get(x).equals(x)) { p.put(x, p.get(p.get(x))); x = p.get(x); } return x; }
}`,
  },
  {
    slug: 'min-cost-to-connect-all-points', title: 'Min Cost to Connect All Points', level: 'Medium',
    summary: 'Connecting two points costs their Manhattan distance. Return the minimum total cost to connect every point (a minimum spanning tree).',
    method: 'minCostConnectPoints', params: [['int[][]', 'points']], returns: 'int',
    tests: [
      { in: [[[0, 0], [2, 2], [3, 10], [5, 2], [7, 0]]], out: 20 },
      { in: [[[3, 12], [-2, 5], [-4, 1]]], out: 18 },
      { in: [[[0, 0]]], out: 0 },
      { in: [[[0, 0], [1, 1], [1, 0], [-1, 1]]] },
    ],
    ref: `class Solution {
    public int minCostConnectPoints(int[][] pts) {
        int n = pts.length, total = 0;
        int[] dist = new int[n];
        boolean[] in = new boolean[n];
        Arrays.fill(dist, Integer.MAX_VALUE); dist[0] = 0;
        for (int k = 0; k < n; k++) {
            int u = -1;
            for (int i = 0; i < n; i++) if (!in[i] && (u == -1 || dist[i] < dist[u])) u = i;
            in[u] = true; total += dist[u];
            for (int v = 0; v < n; v++) if (!in[v]) dist[v] = Math.min(dist[v], Math.abs(pts[u][0] - pts[v][0]) + Math.abs(pts[u][1] - pts[v][1]));
        }
        return total;
    }
}`,
  },
  {
    slug: 'regions-cut-by-slashes', title: 'Regions Cut By Slashes', level: 'Medium',
    summary: 'Each cell of an n×n grid holds "/", "\\" or a space, cutting the cell. Return how many regions the grid is divided into.',
    method: 'regionsBySlashes', params: [['String[]', 'grid']], returns: 'int',
    tests: [
      { in: [[' /', '/ ']], out: 2 },
      { in: [[' /', '  ']], out: 1 },
      { in: [['/\\', '\\/']], out: 5 },
      { in: [[' ']] },
      { in: [['//', '/ ']] },
    ],
    ref: `class Solution {
    private int[] p;
    public int regionsBySlashes(String[] grid) {
        int n = grid.length;
        p = new int[4 * n * n];
        for (int i = 0; i < p.length; i++) p[i] = i;
        for (int r = 0; r < n; r++) for (int c = 0; c < n; c++) {
            int b = 4 * (r * n + c);
            char ch = grid[r].charAt(c);
            if (ch != '\\\\') { union(b, b + 3); union(b + 1, b + 2); }
            if (ch != '/') { union(b, b + 1); union(b + 2, b + 3); }
            if (r + 1 < n) union(b + 2, b + 4 * n);
            if (c + 1 < n) union(b + 1, b + 4 + 3);
        }
        int regions = 0;
        for (int i = 0; i < p.length; i++) if (find(i) == i) regions++;
        return regions;
    }
    private int find(int x) { while (p[x] != x) x = p[x] = p[p[x]]; return x; }
    private void union(int a, int b) { p[find(a)] = find(b); }
}`,
  },
  {
    slug: 'largest-component-size-by-common-factor', title: 'Largest Component Size by Common Factor', level: 'Hard',
    summary: 'Values are nodes; two values are connected when they share a factor greater than 1. Return the size of the largest connected component.',
    method: 'largestComponentSize', params: [['int[]', 'nums']], returns: 'int',
    tests: [
      { in: [[4, 6, 15, 35]], out: 4 },
      { in: [[20, 50, 9, 63]], out: 2 },
      { in: [[2, 3, 6, 7, 4, 12, 21, 39]], out: 8 },
      { in: [[1]] },
      { in: [[2, 3, 5, 7, 11]] },
    ],
    ref: `class Solution {
    private int[] p;
    public int largestComponentSize(int[] nums) {
        int max = 0;
        for (int x : nums) max = Math.max(max, x);
        p = new int[max + 1];
        for (int i = 0; i <= max; i++) p[i] = i;
        for (int x : nums) for (int f = 2; f * f <= x; f++) if (x % f == 0) { union(x, f); union(x, x / f); }
        Map<Integer, Integer> size = new HashMap<>();
        int best = 0;
        for (int x : nums) best = Math.max(best, size.merge(find(x), 1, Integer::sum));
        return best;
    }
    private int find(int x) { while (p[x] != x) x = p[x] = p[p[x]]; return x; }
    private void union(int a, int b) { p[find(a)] = find(b); }
}`,
  },
  {
    slug: 'graph-valid-tree', title: 'Graph Valid Tree', level: 'Medium',
    summary: 'Nodes are labelled 0..n − 1 and edges are undirected. Return true if the edges form a valid tree: connected and without cycles.',
    method: 'validTree', params: [['int', 'n'], ['int[][]', 'edges']], returns: 'boolean',
    tests: [
      { in: [5, [[0, 1], [0, 2], [0, 3], [1, 4]]], out: true },
      { in: [5, [[0, 1], [1, 2], [2, 3], [1, 3], [1, 4]]], out: false },
      { in: [1, []] },
      { in: [2, []] },
      { in: [4, [[0, 1], [2, 3]]] },
      { in: [4, [[0, 1], [1, 2], [2, 0]]] },
      { in: [3, [[1, 0], [2, 0]]] },
    ],
    ref: `class Solution {
    public boolean validTree(int n, int[][] edges) {
        if (edges.length != n - 1) return false;
        int[] parent = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
        for (int[] e : edges) {
            int a = find(parent, e[0]), b = find(parent, e[1]);
            if (a == b) return false;
            parent[a] = b;
        }
        return true;
    }
    private int find(int[] p, int x) { while (p[x] != x) { p[x] = p[p[x]]; x = p[x]; } return x; }
}`,
  },
  {
    slug: 'number-of-connected-components-in-an-undirected-graph', title: 'Number of Connected Components in an Undirected Graph', level: 'Medium',
    summary: 'Nodes are labelled 0..n − 1 and edges are undirected. Return the number of connected components.',
    method: 'countComponents', params: [['int', 'n'], ['int[][]', 'edges']], returns: 'int',
    tests: [
      { in: [5, [[0, 1], [1, 2], [3, 4]]], out: 2 },
      { in: [5, [[0, 1], [1, 2], [2, 3], [3, 4]]], out: 1 },
      { in: [1, []] },
      { in: [4, []] },
      { in: [6, [[0, 1], [1, 2], [2, 0], [3, 4]]] },
      { in: [3, [[2, 1]]] },
    ],
    ref: `class Solution {
    public int countComponents(int n, int[][] edges) {
        int[] parent = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
        int comps = n;
        for (int[] e : edges) {
            int a = find(parent, e[0]), b = find(parent, e[1]);
            if (a != b) { parent[a] = b; comps--; }
        }
        return comps;
    }
    private int find(int[] p, int x) { while (p[x] != x) { p[x] = p[p[x]]; x = p[x]; } return x; }
}`,
  },
  {
    slug: 'find-critical-and-pseudo-critical-edges-in-minimum-spanning-tree', title: 'Find Critical and Pseudo-Critical Edges in Minimum Spanning Tree', level: 'Hard',
    summary: 'edges[i] = [a, b, weight] in a connected undirected graph. An edge is critical if every minimum spanning tree uses it, and pseudo-critical if some but not all do. Return [critical indices, pseudo-critical indices]; each list may be in any order.',
    method: 'findCriticalAndPseudoCriticalEdges', params: [['int', 'n'], ['int[][]', 'edges']], returns: 'List<List<Integer>>', check: 'custom:twoSets',
    tests: [
      { in: [5, [[0, 1, 1], [1, 2, 1], [2, 3, 2], [0, 3, 2], [0, 4, 3], [3, 4, 3], [1, 4, 6]]], out: [[0, 1], [2, 3, 4, 5]] },
      { in: [4, [[0, 1, 1], [1, 2, 1], [2, 3, 1], [0, 3, 1]]], out: [[], [0, 1, 2, 3]] },
      { in: [2, [[0, 1, 5]]] },
      { in: [3, [[0, 1, 1], [1, 2, 2], [0, 2, 3]]] },
      { in: [4, [[0, 1, 1], [0, 3, 1], [0, 2, 1], [1, 2, 1], [1, 3, 1], [2, 3, 1]]] },
      { in: [6, [[0, 1, 1], [1, 2, 1], [0, 2, 1], [2, 3, 4], [3, 4, 2], [3, 5, 2], [4, 5, 2]]] },
    ],
    ref: `class Solution {
    public List<List<Integer>> findCriticalAndPseudoCriticalEdges(int n, int[][] edges) {
        int m = edges.length;
        Integer[] order = new Integer[m];
        for (int i = 0; i < m; i++) order[i] = i;
        Arrays.sort(order, (x, y) -> edges[x][2] - edges[y][2]);
        int best = mst(n, edges, order, -1, -1);
        List<Integer> critical = new ArrayList<>(), pseudo = new ArrayList<>();
        for (int i = 0; i < m; i++) {
            if (mst(n, edges, order, i, -1) > best) critical.add(i);
            else if (mst(n, edges, order, -1, i) == best) pseudo.add(i);
        }
        return Arrays.asList(critical, pseudo);
    }
    private int mst(int n, int[][] edges, Integer[] order, int skip, int force) {
        int[] parent = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
        int total = 0, used = 0;
        if (force >= 0) { parent[find(parent, edges[force][0])] = find(parent, edges[force][1]); total += edges[force][2]; used++; }
        for (int i : order) {
            if (i == skip) continue;
            int a = find(parent, edges[i][0]), b = find(parent, edges[i][1]);
            if (a == b) continue;
            parent[a] = b; total += edges[i][2]; used++;
        }
        return used == n - 1 ? total : Integer.MAX_VALUE;
    }
    private int find(int[] p, int x) { while (p[x] != x) { p[x] = p[p[x]]; x = p[x]; } return x; }
}`,
  },
  {
    slug: 'greatest-common-divisor-traversal', title: 'Greatest Common Divisor Traversal', level: 'Hard',
    summary: 'You may move between indices i and j when gcd(nums[i], nums[j]) > 1. Return true if every pair of indices is connected by some sequence of moves.',
    method: 'canTraverseAllPairs', params: [['int[]', 'nums']], returns: 'boolean',
    tests: [
      { in: [[2, 3, 6]], out: true },
      { in: [[3, 9, 5]], out: false },
      { in: [[4, 3, 12, 8]], out: true },
      { in: [[1]] },
      { in: [[1, 1]] },
      { in: [[7]] },
      { in: [[10, 21, 55, 143, 13]] },
      { in: [[30, 7, 49, 11]] },
    ],
    ref: `class Solution {
    public boolean canTraverseAllPairs(int[] nums) {
        int n = nums.length;
        if (n == 1) return true;
        int max = 0;
        for (int x : nums) { if (x == 1) return false; max = Math.max(max, x); }
        int[] spf = new int[max + 1];
        for (int i = 2; i <= max; i++) if (spf[i] == 0) for (int j = i; j <= max; j += i) if (spf[j] == 0) spf[j] = i;
        int[] parent = new int[n + max + 1];
        for (int i = 0; i < parent.length; i++) parent[i] = i;
        for (int i = 0; i < n; i++) {
            int x = nums[i];
            while (x > 1) {
                int p = spf[x];
                union(parent, i, n + p);
                while (x % p == 0) x /= p;
            }
        }
        int root = find(parent, 0);
        for (int i = 1; i < n; i++) if (find(parent, i) != root) return false;
        return true;
    }
    private int find(int[] p, int x) { while (p[x] != x) { p[x] = p[p[x]]; x = p[x]; } return x; }
    private void union(int[] p, int a, int b) { p[find(p, a)] = find(p, b); }
}`,
  },
];
