// Pattern: Advanced Graphs. Run: java dsa-java/advanced-graphs/AdvancedGraphs.java
import java.util.*;

public class AdvancedGraphs {
    public static void main(String[] args) {
        var rnd = new Random(53);
        for (int t = 0; t < 3_000; t++) {
            int n = 1 + rnd.nextInt(9);

            // undirected graph
            List<List<Integer>> g = new ArrayList<>();
            for (int i = 0; i < n; i++) g.add(new ArrayList<>());
            List<int[]> edges = new ArrayList<>();
            int density = 2 + rnd.nextInt(4);
            for (int a = 0; a < n; a++) for (int b = a + 1; b < n; b++)
                if (rnd.nextInt(density) == 0) { g.get(a).add(b); g.get(b).add(a); edges.add(new int[] { a, b }); }

            Check.that(isBipartite(g) == bruteBipartite(n, edges), "isBipartite matches trying every split");

            Set<Long> bridges = new HashSet<>();
            for (int[] e : bridges(n, g)) bridges.add(key(e[0], e[1]));
            int base = components(n, g, -1, -1, -1);
            for (int[] e : edges)
                Check.that(bridges.contains(key(e[0], e[1])) == (components(n, g, -1, e[0], e[1]) > base), "bridges match removing each edge");

            boolean[] cut = articulationPoints(n, g);
            for (int x = 0; x < n; x++)
                Check.that(cut[x] == (components(n, g, x, -1, -1) > base), "articulation points match removing each node");

            // directed graph
            List<List<Integer>> d = new ArrayList<>();
            for (int i = 0; i < n; i++) d.add(new ArrayList<>());
            for (int a = 0; a < n; a++) for (int b = 0; b < n; b++) if (a != b && rnd.nextInt(4) == 0) d.get(a).add(b);
            int[] comp = stronglyConnectedComponents(n, d);
            for (int a = 0; a < n; a++) for (int b = 0; b < n; b++)
                Check.that((comp[a] == comp[b]) == (reaches(d, a, b) && reaches(d, b, a)), "SCCs match mutual reachability");

            // Euler path: a random walk's edges, shuffled, must be re-arranged into one valid chain
            int[][] pairs = randomWalkPairs(rnd);
            int[][] arranged = eulerPath(pairs);
            Check.that(arranged.length == pairs.length, "eulerPath uses every pair");
            for (int i = 0; i + 1 < arranged.length; i++) Check.that(arranged[i][1] == arranged[i + 1][0], "eulerPath links each end to the next start");
            Check.that(sameMultiset(pairs, arranged), "eulerPath uses each pair exactly once");
        }
        Check.done("Advanced graphs");
    }

    // ---- two-colouring
    static boolean isBipartite(List<List<Integer>> g) {
        int n = g.size();
        int[] colour = new int[n];                       // 0 = unseen, 1 / -1 = the two groups
        ArrayDeque<Integer> queue = new ArrayDeque<>();
        for (int s = 0; s < n; s++) {
            if (colour[s] != 0) continue;
            colour[s] = 1;
            queue.add(s);
            while (!queue.isEmpty()) {
                int u = queue.poll();
                for (int v : g.get(u)) {
                    if (colour[v] == 0) { colour[v] = -colour[u]; queue.add(v); }
                    else if (colour[v] == colour[u]) return false;   // an edge inside one group: odd cycle
                }
            }
        }
        return true;
    }

    // ---- bridges (Tarjan's low-link)
    static int timer;
    static int[] disc, low;

    static List<int[]> bridges(int n, List<List<Integer>> g) {
        disc = new int[n]; low = new int[n]; timer = 0;
        Arrays.fill(disc, -1);
        List<int[]> out = new ArrayList<>();
        for (int s = 0; s < n; s++) if (disc[s] == -1) bridgeDfs(s, -1, g, out);
        return out;
    }

    static void bridgeDfs(int u, int parent, List<List<Integer>> g, List<int[]> out) {
        disc[u] = low[u] = timer++;
        for (int v : g.get(u)) {
            if (v == parent) continue;
            if (disc[v] == -1) {                         // tree edge
                bridgeDfs(v, u, g, out);
                low[u] = Math.min(low[u], low[v]);
                if (low[v] > disc[u]) out.add(new int[] { u, v });
            } else {                                     // back edge
                low[u] = Math.min(low[u], disc[v]);
            }
        }
    }

    // ---- articulation points (same DFS, slightly different test)
    static boolean[] cut;

    static boolean[] articulationPoints(int n, List<List<Integer>> g) {
        disc = new int[n]; low = new int[n]; cut = new boolean[n]; timer = 0;
        Arrays.fill(disc, -1);
        for (int s = 0; s < n; s++) if (disc[s] == -1) cutDfs(s, -1, g);
        return cut;
    }

    static void cutDfs(int u, int parent, List<List<Integer>> g) {
        disc[u] = low[u] = timer++;
        int children = 0;
        for (int v : g.get(u)) {
            if (v == parent) continue;
            if (disc[v] == -1) {
                children++;
                cutDfs(v, u, g);
                low[u] = Math.min(low[u], low[v]);
                if (parent != -1 && low[v] >= disc[u]) cut[u] = true;
            } else {
                low[u] = Math.min(low[u], disc[v]);
            }
        }
        if (parent == -1 && children > 1) cut[u] = true; // the root is a cut vertex only with 2+ DFS children
    }

    // ---- Euler path (Hierholzer, iterative)
    static int[][] eulerPath(int[][] pairs) {
        Map<Integer, Deque<Integer>> out = new HashMap<>();
        Map<Integer, Integer> balance = new HashMap<>();  // out-degree minus in-degree
        for (int[] p : pairs) {
            out.computeIfAbsent(p[0], k -> new ArrayDeque<>()).push(p[1]);
            balance.merge(p[0], 1, Integer::sum);
            balance.merge(p[1], -1, Integer::sum);
        }
        int start = pairs[0][0];
        for (var e : balance.entrySet()) if (e.getValue() == 1) { start = e.getKey(); break; }
        Deque<Integer> stack = new ArrayDeque<>();
        List<Integer> path = new ArrayList<>();
        stack.push(start);
        while (!stack.isEmpty()) {
            Deque<Integer> next = out.get(stack.peek());
            if (next != null && !next.isEmpty()) stack.push(next.pop());   // keep walking
            else path.add(stack.pop());                                    // stuck: this node is final
        }
        Collections.reverse(path);
        int[][] res = new int[path.size() - 1][];
        for (int i = 0; i + 1 < path.size(); i++) res[i] = new int[] { path.get(i), path.get(i + 1) };
        return res;
    }

    // ---- strongly connected components (Kosaraju)
    static int[] stronglyConnectedComponents(int n, List<List<Integer>> g) {
        boolean[] seen = new boolean[n];
        Deque<Integer> order = new ArrayDeque<>();
        for (int s = 0; s < n; s++) if (!seen[s]) finishOrder(s, g, seen, order);
        List<List<Integer>> rev = new ArrayList<>();
        for (int i = 0; i < n; i++) rev.add(new ArrayList<>());
        for (int u = 0; u < n; u++) for (int v : g.get(u)) rev.get(v).add(u);
        int[] comp = new int[n];
        Arrays.fill(comp, -1);
        int c = 0;
        while (!order.isEmpty()) {                       // latest finish first
            int s = order.pop();
            if (comp[s] != -1) continue;
            Deque<Integer> stack = new ArrayDeque<>();
            stack.push(s);
            comp[s] = c;
            while (!stack.isEmpty()) {
                int u = stack.pop();
                for (int v : rev.get(u)) if (comp[v] == -1) { comp[v] = c; stack.push(v); }
            }
            c++;
        }
        return comp;
    }

    static void finishOrder(int u, List<List<Integer>> g, boolean[] seen, Deque<Integer> order) {
        seen[u] = true;
        for (int v : g.get(u)) if (!seen[v]) finishOrder(v, g, seen, order);
        order.push(u);
    }

    // ---- brute forces and helpers
    static boolean bruteBipartite(int n, List<int[]> edges) {
        for (int mask = 0; mask < (1 << n); mask++) {
            boolean ok = true;
            for (int[] e : edges) if (((mask >> e[0]) & 1) == ((mask >> e[1]) & 1)) { ok = false; break; }
            if (ok) return true;
        }
        return false;
    }

    /** Connected components, ignoring node `skip` and the edge skipA–skipB. */
    static int components(int n, List<List<Integer>> g, int skip, int skipA, int skipB) {
        boolean[] seen = new boolean[n];
        int c = 0;
        for (int s = 0; s < n; s++) {
            if (s == skip || seen[s]) continue;
            c++;
            ArrayDeque<Integer> q = new ArrayDeque<>();
            q.add(s); seen[s] = true;
            while (!q.isEmpty()) {
                int u = q.poll();
                for (int v : g.get(u)) {
                    if (v == skip || seen[v] || (u == skipA && v == skipB) || (u == skipB && v == skipA)) continue;
                    seen[v] = true; q.add(v);
                }
            }
        }
        return c;
    }

    static boolean reaches(List<List<Integer>> g, int a, int b) {
        boolean[] seen = new boolean[g.size()];
        ArrayDeque<Integer> q = new ArrayDeque<>();
        q.add(a); seen[a] = true;
        while (!q.isEmpty()) {
            int u = q.poll();
            if (u == b) return true;
            for (int v : g.get(u)) if (!seen[v]) { seen[v] = true; q.add(v); }
        }
        return false;
    }

    static int[][] randomWalkPairs(Random rnd) {
        int k = 2 + rnd.nextInt(6), steps = 1 + rnd.nextInt(25), cur = rnd.nextInt(k);
        Set<Long> used = new HashSet<>();
        List<int[]> out = new ArrayList<>();
        for (int s = 0; s < steps; s++) {
            List<Integer> options = new ArrayList<>();
            for (int v = 0; v < k; v++) if (v != cur && !used.contains(key(cur, v) * 31 + (cur < v ? 0 : 1))) options.add(v);
            if (options.isEmpty()) break;
            int next = options.get(rnd.nextInt(options.size()));
            used.add(key(cur, next) * 31 + (cur < next ? 0 : 1));
            out.add(new int[] { cur * 1000, next * 1000 });
            cur = next;
        }
        Collections.shuffle(out, rnd);
        return out.toArray(new int[0][]);
    }

    static long key(int a, int b) { return (long) Math.min(a, b) * 1_000_000 + Math.max(a, b); }

    static boolean sameMultiset(int[][] a, int[][] b) {
        List<String> x = new ArrayList<>(), y = new ArrayList<>();
        for (int[] p : a) x.add(p[0] + ">" + p[1]);
        for (int[] p : b) y.add(p[0] + ">" + p[1]);
        Collections.sort(x); Collections.sort(y);
        return x.equals(y);
    }
}

final class Check {
    private static int passed;
    static void that(boolean cond, String what) { if (!cond) throw new AssertionError("FAILED: " + what); passed++; }
    static void done(String name) { System.out.println("✓ " + name + ": " + passed + " checks passed"); }
}
