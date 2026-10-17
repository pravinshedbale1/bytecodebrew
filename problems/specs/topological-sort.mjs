export default [
  {
    slug: 'course-schedule', title: 'Course Schedule', level: 'Medium',
    summary: 'prerequisites[i] = [a, b] means take b before a. Return whether all numCourses courses can be finished.',
    method: 'canFinish', params: [['int', 'numCourses'], ['int[][]', 'prerequisites']], returns: 'boolean',
    tests: [
      { in: [2, [[1, 0]]], out: true },
      { in: [2, [[1, 0], [0, 1]]], out: false },
      { in: [1, []] },
      { in: [4, [[1, 0], [2, 1], [3, 2], [1, 3]]] },
      { in: [5, [[1, 4], [2, 4], [3, 1], [3, 2]]] },
    ],
    ref: `class Solution {
    public boolean canFinish(int n, int[][] pre) { return order(n, pre).length == n; }
    static int[] order(int n, int[][] pre) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        int[] in = new int[n];
        for (int[] p : pre) { adj.get(p[1]).add(p[0]); in[p[0]]++; }
        Deque<Integer> q = new ArrayDeque<>();
        for (int i = 0; i < n; i++) if (in[i] == 0) q.add(i);
        int[] out = new int[n]; int w = 0;
        while (!q.isEmpty()) { int u = q.poll(); out[w++] = u; for (int v : adj.get(u)) if (--in[v] == 0) q.add(v); }
        return Arrays.copyOf(out, w);
    }
}`,
  },
  {
    slug: 'course-schedule-ii', title: 'Course Schedule II', level: 'Medium',
    summary: 'Return any order in which all courses can be taken given the prerequisite pairs [a, b] (b first), or an empty array if impossible.',
    method: 'findOrder', params: [['int', 'numCourses'], ['int[][]', 'prerequisites']], returns: 'int[]', check: 'custom:topoOrder',
    tests: [
      { in: [2, [[1, 0]]] },
      { in: [4, [[1, 0], [2, 0], [3, 1], [3, 2]]] },
      { in: [1, []] },
      { in: [2, [[0, 1], [1, 0]]] },
      { in: [6, [[5, 4], [4, 3], [3, 2], [2, 1], [1, 0]]] },
    ],
    ref: `class Solution {
    public int[] findOrder(int n, int[][] pre) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        int[] in = new int[n];
        for (int[] p : pre) { adj.get(p[1]).add(p[0]); in[p[0]]++; }
        Deque<Integer> q = new ArrayDeque<>();
        for (int i = 0; i < n; i++) if (in[i] == 0) q.add(i);
        int[] out = new int[n]; int w = 0;
        while (!q.isEmpty()) { int u = q.poll(); out[w++] = u; for (int v : adj.get(u)) if (--in[v] == 0) q.add(v); }
        return w == n ? out : new int[0];
    }
}`,
  },
  {
    slug: 'course-schedule-iv', title: 'Course Schedule IV', level: 'Medium',
    summary: 'Given direct prerequisites [a, b] (a before b), answer each query [u, v]: is u a prerequisite of v, directly or indirectly?',
    method: 'checkIfPrerequisite', params: [['int', 'numCourses'], ['int[][]', 'prerequisites'], ['int[][]', 'queries']], returns: 'List<Boolean>',
    tests: [
      { in: [2, [[1, 0]], [[0, 1], [1, 0]]], out: [false, true] },
      { in: [2, [], [[1, 0], [0, 1]]], out: [false, false] },
      { in: [3, [[1, 2], [1, 0], [2, 0]], [[1, 0], [1, 2]]], out: [true, true] },
      { in: [4, [[0, 1], [1, 2], [2, 3]], [[0, 3], [3, 0], [1, 3]]] },
    ],
    ref: `class Solution {
    public List<Boolean> checkIfPrerequisite(int n, int[][] pre, int[][] queries) {
        boolean[][] reach = new boolean[n][n];
        for (int[] p : pre) reach[p[0]][p[1]] = true;
        for (int k = 0; k < n; k++) for (int i = 0; i < n; i++) if (reach[i][k]) for (int j = 0; j < n; j++) if (reach[k][j]) reach[i][j] = true;
        List<Boolean> out = new ArrayList<>();
        for (int[] q : queries) out.add(reach[q[0]][q[1]]);
        return out;
    }
}`,
  },
  {
    slug: 'minimum-height-trees', title: 'Minimum Height Trees', level: 'Medium',
    summary: 'An undirected tree has n nodes. Return every node that, used as the root, gives the minimum possible height. Any order.',
    method: 'findMinHeightTrees', params: [['int', 'n'], ['int[][]', 'edges']], returns: 'List<Integer>', check: 'any-order',
    tests: [
      { in: [4, [[1, 0], [1, 2], [1, 3]]], out: [1] },
      { in: [6, [[3, 0], [3, 1], [3, 2], [3, 4], [5, 4]]], out: [3, 4] },
      { in: [1, []], out: [0] },
      { in: [2, [[0, 1]]] },
      { in: [7, [[0, 1], [1, 2], [1, 3], [2, 4], [3, 5], [4, 6]]] },
    ],
    ref: `class Solution {
    public List<Integer> findMinHeightTrees(int n, int[][] edges) {
        if (n == 1) return List.of(0);
        List<Set<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new HashSet<>());
        for (int[] e : edges) { adj.get(e[0]).add(e[1]); adj.get(e[1]).add(e[0]); }
        List<Integer> leaves = new ArrayList<>();
        for (int i = 0; i < n; i++) if (adj.get(i).size() == 1) leaves.add(i);
        int left = n;
        while (left > 2) {
            left -= leaves.size();
            List<Integer> next = new ArrayList<>();
            for (int l : leaves) { int p = adj.get(l).iterator().next(); adj.get(p).remove(l); if (adj.get(p).size() == 1) next.add(p); }
            leaves = next;
        }
        return leaves;
    }
}`,
  },
  {
    slug: 'find-eventual-safe-states', title: 'Find Eventual Safe States', level: 'Medium',
    summary: 'In a directed graph (graph[i] lists i\'s targets), a node is safe if every path from it ends at a node with no outgoing edges. Return all safe nodes in ascending order.',
    method: 'eventualSafeNodes', params: [['int[][]', 'graph']], returns: 'List<Integer>',
    tests: [
      { in: [[[1, 2], [2, 3], [5], [0], [5], [], []]], out: [2, 4, 5, 6] },
      { in: [[[1, 2, 3, 4], [1, 2], [3, 4], [0, 4], []]], out: [4] },
      { in: [[[]]] },
      { in: [[[0]]] },
      { in: [[[1], [2], []]] },
    ],
    ref: `class Solution {
    public List<Integer> eventualSafeNodes(int[][] graph) {
        int n = graph.length;
        int[] state = new int[n];
        List<Integer> out = new ArrayList<>();
        for (int i = 0; i < n; i++) if (safe(graph, i, state)) out.add(i);
        return out;
    }
    private boolean safe(int[][] g, int u, int[] state) {
        if (state[u] != 0) return state[u] == 2;
        state[u] = 1;
        for (int v : g[u]) if (!safe(g, v, state)) return false;
        state[u] = 2;
        return true;
    }
}`,
  },
  {
    slug: 'find-all-possible-recipes-from-given-supplies', title: 'Find All Possible Recipes from Given Supplies', level: 'Medium',
    summary: 'Recipe i needs every item in ingredients[i]; ingredients can be supplies (unlimited) or other recipes. Return every recipe you can make, in any order.',
    method: 'findAllRecipes', params: [['String[]', 'recipes'], ['List<List<String>>', 'ingredients'], ['String[]', 'supplies']], returns: 'List<String>', check: 'any-order',
    tests: [
      { in: [['bread'], [['yeast', 'flour']], ['yeast', 'flour', 'corn']], out: ['bread'] },
      { in: [['bread', 'sandwich'], [['yeast', 'flour'], ['bread', 'meat']], ['yeast', 'flour', 'meat']], out: ['bread', 'sandwich'] },
      { in: [['bread', 'sandwich', 'burger'], [['yeast', 'flour'], ['bread', 'meat'], ['sandwich', 'meat', 'bread']], ['yeast', 'flour', 'meat']], out: ['bread', 'sandwich', 'burger'] },
      { in: [['a', 'b'], [['b'], ['a']], ['x']] },
    ],
    ref: `class Solution {
    public List<String> findAllRecipes(String[] recipes, List<List<String>> ingredients, String[] supplies) {
        Map<String, List<Integer>> usedBy = new HashMap<>();
        int[] missing = new int[recipes.length];
        Set<String> have = new HashSet<>(Arrays.asList(supplies));
        for (int i = 0; i < recipes.length; i++) for (String ing : ingredients.get(i)) if (!have.contains(ing)) { missing[i]++; usedBy.computeIfAbsent(ing, k -> new ArrayList<>()).add(i); }
        Deque<Integer> q = new ArrayDeque<>();
        for (int i = 0; i < recipes.length; i++) if (missing[i] == 0) q.add(i);
        List<String> out = new ArrayList<>();
        while (!q.isEmpty()) { int i = q.poll(); out.add(recipes[i]); for (int j : usedBy.getOrDefault(recipes[i], List.of())) if (--missing[j] == 0) q.add(j); }
        return out;
    }
}`,
  },
  {
    slug: 'sort-items-by-groups-respecting-dependencies', title: 'Sort Items by Groups Respecting Dependencies', level: 'Hard',
    summary: 'Order n items so that items of the same group are next to each other and every item comes after all items in beforeItems[i]. group[i] = -1 means no group. Return any valid order, or [] if none exists.',
    method: 'sortItems', params: [['int', 'n'], ['int', 'm'], ['int[]', 'group'], ['List<List<Integer>>', 'beforeItems']], returns: 'int[]', check: 'custom:sortItems',
    tests: [
      { in: [8, 2, [-1, -1, 1, 0, 0, 1, 0, -1], [[], [6], [5], [6], [3, 6], [], [], []]] },
      { in: [8, 2, [-1, -1, 1, 0, 0, 1, 0, -1], [[], [6], [5], [6], [3], [], [4], []]] },
      { in: [1, 1, [-1], [[]]] },
      { in: [3, 1, [0, -1, 0], [[], [0], [1]]] },
    ],
    ref: `class Solution {
    public int[] sortItems(int n, int m, int[] group, List<List<Integer>> beforeItems) {
        int[] g = group.clone();
        int groups = m;
        for (int i = 0; i < n; i++) if (g[i] == -1) g[i] = groups++;
        List<List<Integer>> itemAdj = new ArrayList<>(), groupAdj = new ArrayList<>();
        for (int i = 0; i < n; i++) itemAdj.add(new ArrayList<>());
        for (int i = 0; i < groups; i++) groupAdj.add(new ArrayList<>());
        int[] itemIn = new int[n], groupIn = new int[groups];
        for (int i = 0; i < n; i++) for (int b : beforeItems.get(i)) {
            itemAdj.get(b).add(i); itemIn[i]++;
            if (g[b] != g[i]) { groupAdj.get(g[b]).add(g[i]); groupIn[g[i]]++; }
        }
        List<Integer> items = topo(itemAdj, itemIn), gs = topo(groupAdj, groupIn);
        if (items.size() < n || gs.size() < groups) return new int[0];
        Map<Integer, List<Integer>> byGroup = new HashMap<>();
        for (int it : items) byGroup.computeIfAbsent(g[it], k -> new ArrayList<>()).add(it);
        int[] out = new int[n]; int w = 0;
        for (int gr : gs) for (int it : byGroup.getOrDefault(gr, List.of())) out[w++] = it;
        return out;
    }
    private List<Integer> topo(List<List<Integer>> adj, int[] in) {
        Deque<Integer> q = new ArrayDeque<>();
        for (int i = 0; i < in.length; i++) if (in[i] == 0) q.add(i);
        List<Integer> out = new ArrayList<>();
        while (!q.isEmpty()) { int u = q.poll(); out.add(u); for (int v : adj.get(u)) if (--in[v] == 0) q.add(v); }
        return out;
    }
}`,
  },
];
