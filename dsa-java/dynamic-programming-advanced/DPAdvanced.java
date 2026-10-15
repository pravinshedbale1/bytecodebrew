// Patterns: Tree & Interval DP, State-Machine & Bitmask DP. Run: java dsa-java/dynamic-programming-advanced/DPAdvanced.java
import java.util.*;

public class DPAdvanced {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int v) { val = v; }
    }

    public static void main(String[] args) {
        var rnd = new Random(29);
        for (int t = 0; t < 3_000; t++) {
            TreeNode root = randomTree(rnd, rnd.nextInt(13));
            List<TreeNode> nodes = new ArrayList<>(); collect(root, nodes);
            Check.that(rob(root) == robBrute(root, nodes), "house robber III");
            if (root != null) Check.that(minCameraCover(root) == camerasBrute(root, nodes), "cameras");
        }
        for (int t = 0; t < 2_000; t++) {
            int n = rnd.nextInt(7);
            int[] balloons = new int[n];
            for (int i = 0; i < n; i++) balloons[i] = rnd.nextInt(10);
            Check.that(maxCoins(balloons) == burstBrute(toList(balloons)), "burst balloons");
            int len = 2 + rnd.nextInt(15);
            TreeSet<Integer> cutSet = new TreeSet<>();
            for (int k = rnd.nextInt(Math.min(6, len - 1)); k > 0; k--) cutSet.add(1 + rnd.nextInt(len - 1));
            int[] cuts = cutSet.stream().mapToInt(i -> i).toArray();
            shuffle(cuts, rnd);
            Check.that(minCost(len, cuts.clone()) == cutBrute(0, len, toList(cuts)), "cut sticks");
            int[] piles = new int[1 + rnd.nextInt(8)];
            for (int i = 0; i < piles.length; i++) piles[i] = rnd.nextInt(20);
            Check.that(predictTheWinner(piles) == (gameBrute(piles, 0, piles.length - 1) >= 0), "predict the winner");
        }
        for (int t = 0; t < 3_000; t++) {
            int n = rnd.nextInt(9);
            int[] p = new int[n];
            for (int i = 0; i < n; i++) p[i] = rnd.nextInt(10);
            int fee = rnd.nextInt(4), k = rnd.nextInt(4);
            Check.that(maxProfitCooldown(p) == stockBrute(p, 0, false, Integer.MAX_VALUE, 0, true), "stock cooldown");
            Check.that(maxProfitFee(p, fee) == stockBrute(p, 0, false, Integer.MAX_VALUE, fee, false), "stock fee");
            Check.that(maxProfitK(k, p) == stockBrute(p, 0, false, k, 0, false), "stock k transactions");
        }
        for (int t = 0; t < 1_500; t++) {
            int n = 1 + rnd.nextInt(7);
            int[][] dist = new int[n][n];
            for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) dist[i][j] = i == j ? 0 : 1 + rnd.nextInt(20);
            Check.that(tsp(dist) == tspBrute(dist), "TSP Held–Karp");
            int[] nums = new int[1 + rnd.nextInt(9)];
            for (int i = 0; i < nums.length; i++) nums[i] = 1 + rnd.nextInt(6);
            int parts = 1 + rnd.nextInt(4);
            Check.that(canPartitionKSubsets(nums, parts) == partitionBrute(nums, parts, 0, new int[parts]), "k equal subsets");
            int[][] graph = randomConnectedGraph(rnd, n);
            Check.that(shortestPathLength(graph) == visitAllBrute(graph), "shortest path visiting all nodes");
        }
        Check.done("dp-advanced");
    }

    // ================================================================ tree DP
    /** House robber III: each node returns {best if robbed, best if skipped} — the state travels upward. */
    static int rob(TreeNode root) {
        int[] r = robPair(root);
        return Math.max(r[0], r[1]);
    }

    static int[] robPair(TreeNode n) {
        if (n == null) return new int[] { 0, 0 };
        int[] l = robPair(n.left), r = robPair(n.right);
        int take = n.val + l[1] + r[1];                                 // robbing n: children must be skipped
        int skip = Math.max(l[0], l[1]) + Math.max(r[0], r[1]);         // skipping n: children are free
        return new int[] { take, skip };
    }

    /** Binary tree cameras: three states per node, filled bottom-up (a greedy on the post-order). */
    static final int NOT_COVERED = 0, HAS_CAMERA = 1, COVERED = 2;
    static int cameras;

    static int minCameraCover(TreeNode root) {
        cameras = 0;
        if (cover(root) == NOT_COVERED) cameras++;                      // the root still needs one
        return cameras;
    }

    static int cover(TreeNode n) {
        if (n == null) return COVERED;                                 // nothing to watch: never forces a camera
        int l = cover(n.left), r = cover(n.right);
        if (l == NOT_COVERED || r == NOT_COVERED) { cameras++; return HAS_CAMERA; }   // a child needs us
        if (l == HAS_CAMERA || r == HAS_CAMERA) return COVERED;        // a child watches us
        return NOT_COVERED;                                            // let our parent place the camera
    }

    // ================================================================ interval DP
    /**
     * Burst balloons: dp[l][r] = best coins from bursting everything strictly between l and r.
     * Choose the LAST balloon k to burst in (l, r): its neighbours are then exactly l and r.
     */
    static int maxCoins(int[] nums) {
        int n = nums.length;
        int[] a = new int[n + 2];
        a[0] = a[n + 1] = 1;                                           // virtual 1s at both ends
        for (int i = 0; i < n; i++) a[i + 1] = nums[i];
        int[][] dp = new int[n + 2][n + 2];
        for (int len = 2; len <= n + 1; len++)                        // shorter intervals first
            for (int l = 0; l + len <= n + 1; l++) {
                int r = l + len;
                for (int k = l + 1; k < r; k++)
                    dp[l][r] = Math.max(dp[l][r], dp[l][k] + a[l] * a[k] * a[r] + dp[k][r]);
            }
        return dp[0][n + 1];
    }

    /** Minimum cost to cut a stick (cost = current length): dp over pairs of neighbouring cut positions. */
    static int minCost(int n, int[] cuts) {
        Arrays.sort(cuts);
        int m = cuts.length;
        int[] p = new int[m + 2];
        p[m + 1] = n;
        for (int i = 0; i < m; i++) p[i + 1] = cuts[i];
        int[][] dp = new int[m + 2][m + 2];
        for (int len = 2; len <= m + 1; len++)
            for (int i = 0; i + len <= m + 1; i++) {
                int j = i + len;
                dp[i][j] = Integer.MAX_VALUE;
                for (int k = i + 1; k < j; k++)                        // first cut inside (p[i], p[j])
                    dp[i][j] = Math.min(dp[i][j], dp[i][k] + dp[k][j] + p[j] - p[i]);
            }
        return dp[0][m + 1];
    }

    /** dp[i][j] = best (my score − opponent's score) on piles i..j for whoever moves next. */
    static boolean predictTheWinner(int[] nums) {
        int n = nums.length;
        int[][] dp = new int[n][n];
        for (int i = 0; i < n; i++) dp[i][i] = nums[i];
        for (int i = n - 2; i >= 0; i--)
            for (int j = i + 1; j < n; j++)
                dp[i][j] = Math.max(nums[i] - dp[i + 1][j], nums[j] - dp[i][j - 1]);   // the opponent then plays optimally
        return dp[0][n - 1] >= 0;
    }

    // ================================================================ state-machine DP
    /** Cooldown: hold / sold (cooldown tomorrow) / rest, updated once per day from yesterday's values. */
    static int maxProfitCooldown(int[] prices) {
        int hold = Integer.MIN_VALUE / 2, sold = 0, rest = 0;
        for (int p : prices) {
            int prevSold = sold;
            sold = hold + p;                                           // sell the share we held
            hold = Math.max(hold, rest - p);                           // keep holding, or buy (only from rest)
            rest = Math.max(rest, prevSold);                           // cooldown ends
        }
        return Math.max(sold, rest);
    }

    static int maxProfitFee(int[] prices, int fee) {
        int hold = Integer.MIN_VALUE / 2, cash = 0;
        for (int p : prices) {
            int prevCash = cash;
            cash = Math.max(cash, hold + p - fee);
            hold = Math.max(hold, prevCash - p);
        }
        return cash;
    }

    /** At most k transactions: buy[j] / sell[j] = best after the j-th buy / sell. */
    static int maxProfitK(int k, int[] prices) {
        int[] buy = new int[k + 1], sell = new int[k + 1];
        Arrays.fill(buy, Integer.MIN_VALUE / 2);
        for (int p : prices)
            for (int j = 1; j <= k; j++) {
                buy[j] = Math.max(buy[j], sell[j - 1] - p);
                sell[j] = Math.max(sell[j], buy[j] + p);
            }
        return sell[k];
    }

    // ================================================================ bitmask DP
    /** Held–Karp: dp[mask][v] = cheapest path from 0 visiting exactly `mask`, ending at v. O(2ⁿ · n²). */
    static int tsp(int[][] d) {
        int n = d.length, FULL = (1 << n) - 1, INF = Integer.MAX_VALUE / 2;
        int[][] dp = new int[1 << n][n];
        for (int[] row : dp) Arrays.fill(row, INF);
        dp[1][0] = 0;                                                  // start at city 0
        for (int mask = 1; mask <= FULL; mask++)
            for (int v = 0; v < n; v++) {
                if (dp[mask][v] == INF) continue;
                for (int u = 0; u < n; u++) {
                    if ((mask & (1 << u)) != 0) continue;              // already visited
                    int next = mask | (1 << u);
                    dp[next][u] = Math.min(dp[next][u], dp[mask][v] + d[v][u]);
                }
            }
        int best = INF;
        for (int v = 0; v < n; v++) best = Math.min(best, dp[FULL][v] + d[v][0]);   // return home
        return best;
    }

    /** dp[mask] = fill of the current bucket after placing `mask`'s numbers, or −1 if impossible. */
    static boolean canPartitionKSubsets(int[] nums, int k) {
        int sum = Arrays.stream(nums).sum();
        if (sum % k != 0) return false;
        int target = sum / k, n = nums.length;
        int[] dp = new int[1 << n];
        Arrays.fill(dp, -1);
        dp[0] = 0;
        for (int mask = 0; mask < (1 << n); mask++) {
            if (dp[mask] < 0) continue;
            for (int i = 0; i < n; i++) {
                if ((mask & (1 << i)) != 0 || dp[mask] + nums[i] > target) continue;
                dp[mask | (1 << i)] = (dp[mask] + nums[i]) % target;  // a full bucket wraps to 0: start the next
            }
        }
        return dp[(1 << n) - 1] == 0;
    }

    /** BFS over states (node, visited mask): the first time a full mask appears is the answer. */
    static int shortestPathLength(int[][] graph) {
        int n = graph.length, FULL = (1 << n) - 1;
        if (n == 1) return 0;
        boolean[][] seen = new boolean[n][1 << n];
        Deque<int[]> q = new ArrayDeque<>();
        for (int v = 0; v < n; v++) { q.offer(new int[] { v, 1 << v }); seen[v][1 << v] = true; }   // start anywhere
        for (int steps = 1; !q.isEmpty(); steps++)
            for (int size = q.size(); size > 0; size--) {
                int[] cur = q.poll();
                for (int u : graph[cur[0]]) {
                    int mask = cur[1] | (1 << u);
                    if (mask == FULL) return steps;
                    if (!seen[u][mask]) { seen[u][mask] = true; q.offer(new int[] { u, mask }); }
                }
            }
        return -1;
    }

    // ================================================================ brute forces
    static int robBrute(TreeNode root, List<TreeNode> nodes) {
        int n = nodes.size(), best = 0;
        Map<TreeNode, Integer> idx = new HashMap<>();
        for (int i = 0; i < n; i++) idx.put(nodes.get(i), i);
        for (int mask = 0; mask < (1 << n); mask++) {
            boolean ok = true; int sum = 0;
            for (int i = 0; i < n && ok; i++) {
                if ((mask >> i & 1) == 0) continue;
                TreeNode x = nodes.get(i); sum += x.val;
                for (TreeNode c : new TreeNode[] { x.left, x.right }) if (c != null && (mask >> idx.get(c) & 1) == 1) ok = false;
            }
            if (ok) best = Math.max(best, sum);
        }
        return best;
    }

    static int camerasBrute(TreeNode root, List<TreeNode> nodes) {
        int n = nodes.size(), best = Integer.MAX_VALUE;
        Map<TreeNode, TreeNode> parent = new HashMap<>();
        for (TreeNode x : nodes) { if (x.left != null) parent.put(x.left, x); if (x.right != null) parent.put(x.right, x); }
        for (int mask = 0; mask < (1 << n); mask++) {
            Set<TreeNode> cam = new HashSet<>();
            for (int i = 0; i < n; i++) if ((mask >> i & 1) == 1) cam.add(nodes.get(i));
            boolean ok = true;
            for (TreeNode x : nodes)
                if (!(cam.contains(x) || cam.contains(x.left) || cam.contains(x.right) || cam.contains(parent.get(x)))) ok = false;
            if (ok) best = Math.min(best, cam.size());
        }
        return best;
    }

    static int burstBrute(List<Integer> b) {
        int best = 0;
        for (int i = 0; i < b.size(); i++) {
            int coins = (i > 0 ? b.get(i - 1) : 1) * b.get(i) * (i + 1 < b.size() ? b.get(i + 1) : 1);
            List<Integer> rest = new ArrayList<>(b); rest.remove(i);
            best = Math.max(best, coins + burstBrute(rest));
        }
        return best;
    }

    static int cutBrute(int lo, int hi, List<Integer> cuts) {
        int best = Integer.MAX_VALUE;
        for (int c : cuts) {
            if (c <= lo || c >= hi) continue;
            best = Math.min(best, hi - lo + cutBrute(lo, c, cuts) + cutBrute(c, hi, cuts));
        }
        return best == Integer.MAX_VALUE ? 0 : best;
    }

    static int gameBrute(int[] a, int i, int j) {
        if (i > j) return 0;
        return Math.max(a[i] - gameBrute(a, i + 1, j), a[j] - gameBrute(a, i, j - 1));
    }

    /** Try every action each day: buy, sell or wait. `cool` = selling forces a rest day. */
    static int stockBrute(int[] p, int day, boolean holding, int buysLeft, int fee, boolean cool) {
        if (day >= p.length) return 0;
        int best = stockBrute(p, day + 1, holding, buysLeft, fee, cool);
        if (holding) best = Math.max(best, p[day] - fee + stockBrute(p, day + (cool ? 2 : 1), false, buysLeft, fee, cool));
        else if (buysLeft > 0) best = Math.max(best, -p[day] + stockBrute(p, day + 1, true, buysLeft == Integer.MAX_VALUE ? buysLeft : buysLeft - 1, fee, cool));
        return best;
    }

    static int tspBrute(int[][] d) {
        int n = d.length;
        List<Integer> rest = new ArrayList<>();
        for (int i = 1; i < n; i++) rest.add(i);
        return permBest(d, 0, rest);
    }

    static int permBest(int[][] d, int at, List<Integer> rest) {
        if (rest.isEmpty()) return d[at][0];
        int best = Integer.MAX_VALUE;
        for (int i = 0; i < rest.size(); i++) {
            List<Integer> r = new ArrayList<>(rest); int nx = r.remove(i);
            best = Math.min(best, d[at][nx] + permBest(d, nx, r));
        }
        return best;
    }

    static boolean partitionBrute(int[] nums, int k, int i, int[] buckets) {
        if (i == nums.length) {
            for (int b : buckets) if (b != buckets[0]) return false;
            return true;
        }
        for (int b = 0; b < k; b++) {
            buckets[b] += nums[i];
            if (partitionBrute(nums, k, i + 1, buckets)) { buckets[b] -= nums[i]; return true; }
            buckets[b] -= nums[i];
        }
        return false;
    }

    static int visitAllBrute(int[][] g) {
        int n = g.length, INF = 1_000;
        int[][] d = new int[n][n];
        for (int[] r : d) Arrays.fill(r, INF);
        for (int i = 0; i < n; i++) { d[i][i] = 0; for (int j : g[i]) d[i][j] = 1; }
        for (int k = 0; k < n; k++) for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) d[i][j] = Math.min(d[i][j], d[i][k] + d[k][j]);
        int best = INF;
        List<Integer> all = new ArrayList<>(); for (int i = 0; i < n; i++) all.add(i);
        for (int s = 0; s < n; s++) { List<Integer> r = new ArrayList<>(all); r.remove(Integer.valueOf(s)); best = Math.min(best, orderBest(d, s, r)); }
        return best;
    }

    static int orderBest(int[][] d, int at, List<Integer> rest) {
        if (rest.isEmpty()) return 0;
        int best = Integer.MAX_VALUE;
        for (int i = 0; i < rest.size(); i++) { List<Integer> r = new ArrayList<>(rest); int nx = r.remove(i); best = Math.min(best, d[at][nx] + orderBest(d, nx, r)); }
        return best;
    }

    // ================================================================ helpers
    static TreeNode randomTree(Random rnd, int n) {
        if (n == 0) return null;
        TreeNode root = new TreeNode(rnd.nextInt(10));
        int left = rnd.nextInt(n);
        root.left = randomTree(rnd, left);
        root.right = randomTree(rnd, n - 1 - left);
        return root;
    }

    static void collect(TreeNode n, List<TreeNode> out) { if (n == null) return; out.add(n); collect(n.left, out); collect(n.right, out); }

    static int[][] randomConnectedGraph(Random rnd, int n) {
        List<Set<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new TreeSet<>());
        for (int i = 1; i < n; i++) { int p = rnd.nextInt(i); adj.get(i).add(p); adj.get(p).add(i); }   // a random tree
        for (int e = rnd.nextInt(n + 1); e > 0; e--) { int a = rnd.nextInt(n), b = rnd.nextInt(n); if (a != b) { adj.get(a).add(b); adj.get(b).add(a); } }
        int[][] g = new int[n][];
        for (int i = 0; i < n; i++) g[i] = adj.get(i).stream().mapToInt(x -> x).toArray();
        return g;
    }

    static List<Integer> toList(int[] a) { List<Integer> l = new ArrayList<>(); for (int x : a) l.add(x); return l; }

    static void shuffle(int[] a, Random rnd) { for (int i = a.length - 1; i > 0; i--) { int j = rnd.nextInt(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } }
}

final class Check {
    private static int passed;
    static void that(boolean cond, String what) { if (!cond) throw new AssertionError("FAILED: " + what); passed++; }
    static void done(String name) { System.out.println("✓ " + name + ": " + passed + " checks passed"); }
}
