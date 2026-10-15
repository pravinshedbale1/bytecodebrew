// Pattern: Intervals. Run: java dsa-java/intervals/Intervals.java
import java.util.*;

public class Intervals {
    public static void main(String[] args) {
        var rnd = new Random(6);
        for (int t = 0; t < 3_000; t++) {
            int[][] iv = random(rnd, rnd.nextInt(10));
            // merge: compare covered points (scaled by 2 so touching ends merge like the problem says)
            int[][] merged = merge(copy(iv));
            Check.that(coverage(merged).equals(coverage(iv)) && disjointSorted(merged), "merge");
            // insert into sorted non-overlapping list
            int[][] base = merge(copy(iv)); int s = rnd.nextInt(20); int[] ni = { s, s + rnd.nextInt(6) };
            int[][] ins = insert(base, ni);
            int[][] all = Arrays.copyOf(base, base.length + 1); all[base.length] = ni;
            Check.that(Arrays.deepEquals(ins, merge(copy(all))), "insert");
            // erase overlap: min removals so the rest don't overlap (touching is fine) — brute force over subsets
            int[][] pos = new int[iv.length][];                    // the problem guarantees start < end
            for (int i = 0; i < iv.length; i++) pos[i] = new int[] { iv[i][0], iv[i][1] + 1 };
            if (pos.length <= 9) Check.that(eraseOverlapIntervals(copy(pos)) == eraseBrute(pos), "eraseOverlapIntervals");
            // meeting rooms: max overlap (half-open [s, e))
            Check.that(minMeetingRooms(copy(iv)) == roomsBrute(iv), "minMeetingRooms");
            // arrows (closed intervals, touching shares a point)
            if (iv.length <= 9) Check.that(findMinArrowShots(copy(iv)) == arrowsBrute(iv), "findMinArrowShots");
            // intersections
            int[][] A = merge(random(rnd, rnd.nextInt(6))), B = merge(random(rnd, rnd.nextInt(6)));
            Check.that(pointsOf(intervalIntersection(A, B)).equals(intersect(pointsOf(A), pointsOf(B))), "intervalIntersection");
        }
        Check.done("intervals");
    }

    static int[][] merge(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));   // 1. sort by start
        List<int[]> out = new ArrayList<>();
        for (int[] cur : intervals) {
            if (!out.isEmpty() && cur[0] <= out.get(out.size() - 1)[1]) {
                int[] last = out.get(out.size() - 1);
                last[1] = Math.max(last[1], cur[1]);                       // 2. overlaps: extend
            } else {
                out.add(cur);                                              // 3. gap: start a new one
            }
        }
        return out.toArray(new int[0][]);
    }

    static int[][] insert(int[][] intervals, int[] add) {
        List<int[]> out = new ArrayList<>();
        int i = 0, n = intervals.length;
        int[] cur = { add[0], add[1] };
        while (i < n && intervals[i][1] < cur[0]) out.add(intervals[i++]);          // entirely before
        while (i < n && intervals[i][0] <= cur[1]) {                                 // overlapping: absorb
            cur[0] = Math.min(cur[0], intervals[i][0]);
            cur[1] = Math.max(cur[1], intervals[i][1]);
            i++;
        }
        out.add(cur);
        while (i < n) out.add(intervals[i++]);                                       // entirely after
        return out.toArray(new int[0][]);
    }

    /** Greedy: keep the interval that ENDS first; it leaves the most room for the rest. */
    static int eraseOverlapIntervals(int[][] intervals) {
        if (intervals.length == 0) return 0;
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[1], b[1]));   // sort by END
        int kept = 1, end = intervals[0][1];
        for (int i = 1; i < intervals.length; i++) {
            if (intervals[i][0] >= end) { kept++; end = intervals[i][1]; }   // fits after the last kept
        }
        return intervals.length - kept;
    }

    /** Sweep line: sort starts and ends separately; rooms in use = starts passed − ends passed. */
    static int minMeetingRooms(int[][] meetings) {
        int n = meetings.length;
        int[] starts = new int[n], ends = new int[n];
        for (int i = 0; i < n; i++) { starts[i] = meetings[i][0]; ends[i] = meetings[i][1]; }
        Arrays.sort(starts); Arrays.sort(ends);
        int rooms = 0, best = 0, e = 0;
        for (int s = 0; s < n; s++) {
            while (e < n && ends[e] <= starts[s]) { rooms--; e++; }   // free rooms whose meeting ended (ends at s is free)
            rooms++;
            best = Math.max(best, rooms);
        }
        return best;
    }

    static int findMinArrowShots(int[][] points) {
        if (points.length == 0) return 0;
        Arrays.sort(points, (a, b) -> Integer.compare(a[1], b[1]));
        int arrows = 1, at = points[0][1];                  // shoot at the earliest end
        for (int[] p : points) if (p[0] > at) { arrows++; at = p[1]; }
        return arrows;
    }

    static int[][] intervalIntersection(int[][] A, int[][] B) {
        List<int[]> out = new ArrayList<>();
        int i = 0, j = 0;
        while (i < A.length && j < B.length) {
            int lo = Math.max(A[i][0], B[j][0]), hi = Math.min(A[i][1], B[j][1]);
            if (lo <= hi) out.add(new int[] { lo, hi });
            if (A[i][1] < B[j][1]) i++; else j++;           // drop the one that ends first
        }
        return out.toArray(new int[0][]);
    }

    // ---- testing helpers ----
    static int[][] random(Random r, int n) { int[][] a = new int[n][]; for (int i = 0; i < n; i++) { int s = r.nextInt(20); a[i] = new int[] { s, s + r.nextInt(6) }; } return a; }
    static int[][] copy(int[][] a) { int[][] c = new int[a.length][]; for (int i = 0; i < a.length; i++) c[i] = a[i].clone(); return c; }
    static Set<Integer> coverage(int[][] iv) { Set<Integer> s = new TreeSet<>(); for (int[] x : iv) for (int p = 2 * x[0]; p <= 2 * x[1]; p++) s.add(p); return s; }
    static Set<Integer> pointsOf(int[][] iv) { return coverage(iv); }
    static Set<Integer> intersect(Set<Integer> a, Set<Integer> b) { Set<Integer> s = new TreeSet<>(a); s.retainAll(b); return s; }
    static boolean disjointSorted(int[][] m) { for (int i = 1; i < m.length; i++) if (m[i][0] <= m[i - 1][1]) return false; return true; }
    static int roomsBrute(int[][] iv) { int best = 0; for (int t = 0; t < 30; t++) { int c = 0; for (int[] x : iv) if (x[0] <= t && t < x[1]) c++; best = Math.max(best, c); } return best; }
    static int eraseBrute(int[][] iv) {
        int n = iv.length, bestKeep = 0;
        for (int mask = 0; mask < (1 << n); mask++) {
            boolean ok = true;
            for (int i = 0; i < n && ok; i++) for (int j = i + 1; j < n && ok; j++)
                if ((mask >> i & 1) == 1 && (mask >> j & 1) == 1 && iv[i][0] < iv[j][1] && iv[j][0] < iv[i][1]) ok = false;
            if (ok) bestKeep = Math.max(bestKeep, Integer.bitCount(mask));
        }
        return n - bestKeep;
    }
    static int arrowsBrute(int[][] iv) {
        // minimum points hitting all closed intervals: try points at interval ends, greedy is optimal but brute via BFS over subsets of ends
        int n = iv.length; if (n == 0) return 0;
        List<Integer> cand = new ArrayList<>(); for (int[] x : iv) cand.add(x[1]);
        for (int k = 1; k <= n; k++) if (canHit(iv, cand, k, 0, new ArrayList<>())) return k;
        return n;
    }
    static boolean canHit(int[][] iv, List<Integer> cand, int k, int from, List<Integer> chosen) {
        if (chosen.size() == k) { for (int[] x : iv) { boolean hit = false; for (int p : chosen) if (x[0] <= p && p <= x[1]) hit = true; if (!hit) return false; } return true; }
        for (int i = from; i < cand.size(); i++) { chosen.add(cand.get(i)); if (canHit(iv, cand, k, i + 1, chosen)) return true; chosen.remove(chosen.size() - 1); }
        return false;
    }
}

final class Check {
    private static int passed;
    static void that(boolean cond, String what) { if (!cond) throw new AssertionError("FAILED: " + what); passed++; }
    static void done(String name) { System.out.println("✓ " + name + ": " + passed + " checks passed"); }
}
