// Pattern: Binary Search on the Answer. Run: java dsa-java/binary-search-on-answer/SearchOnAnswer.java
import java.util.*;
import java.util.function.LongPredicate;

public class SearchOnAnswer {
    public static void main(String[] args) {
        var rnd = new Random(8);
        for (int t = 0; t < 3_000; t++) {
            int n = 1 + rnd.nextInt(8);
            int[] piles = new int[n]; for (int i = 0; i < n; i++) piles[i] = 1 + rnd.nextInt(30);
            int h = n + rnd.nextInt(20);
            int k = 1; while (!canFinish(piles, h, k)) k++;
            Check.that(minEatingSpeed(piles, h) == k, "Koko");
            int days = 1 + rnd.nextInt(n);
            long cap = Arrays.stream(piles).max().getAsInt(); while (!canShip(piles, days, cap)) cap++;
            Check.that(shipWithinDays(piles, days) == cap, "ship within days");
            Check.that(splitArray(piles, days) == cap, "split array largest sum = same check");
            // aggressive cows / magnetic force: maximise the minimum gap
            int[] pos = rnd.ints(0, 60).distinct().limit(2 + rnd.nextInt(8)).toArray();
            int cows = 2 + rnd.nextInt(pos.length - 1);
            int[] sorted = pos.clone(); Arrays.sort(sorted);
            int best = 0; for (int d = 1; d <= 60; d++) if (canPlace(sorted, cows, d)) best = d;
            Check.that(maxDistance(pos.clone(), cows) == best, "maximise minimum distance");
            // bouquets
            int[] bloom = new int[n]; for (int i = 0; i < n; i++) bloom[i] = 1 + rnd.nextInt(20);
            int m = 1 + rnd.nextInt(3), kk = 1 + rnd.nextInt(2);
            int expect = -1; for (int d = 1; d <= 20; d++) if (canMake(bloom, m, kk, d)) { expect = d; break; }
            Check.that(minDays(bloom, m, kk) == expect, "minDays bouquets");
        }
        Check.done("binary-search-on-answer");
    }

    /** First x in [lo, hi] where ok(x) is true (assumes ok(hi) is true). Same template, long range. */
    static long firstTrue(long lo, long hi, LongPredicate ok) {
        while (lo < hi) {
            long mid = lo + (hi - lo) / 2;
            if (ok.test(mid)) hi = mid; else lo = mid + 1;
        }
        return lo;
    }

    // ---- Koko eating bananas ----
    static int minEatingSpeed(int[] piles, int h) {
        int max = Arrays.stream(piles).max().getAsInt();
        return (int) firstTrue(1, max, k -> canFinish(piles, h, k));
    }
    static boolean canFinish(int[] piles, int h, long k) {
        long hours = 0;
        for (int p : piles) hours += (p + k - 1) / k;        // ceil(p / k) without floating point
        return hours <= h;
    }

    // ---- Ship packages within D days ----
    static int shipWithinDays(int[] weights, int days) {
        long lo = Arrays.stream(weights).max().getAsInt();     // must carry the heaviest package
        long hi = Arrays.stream(weights).asLongStream().sum(); // one day carries everything
        return (int) firstTrue(lo, hi, cap -> canShip(weights, days, cap));
    }
    static boolean canShip(int[] weights, int days, long cap) {
        int used = 1; long load = 0;
        for (int w : weights) {
            if (load + w > cap) { used++; load = 0; }            // start a new day
            load += w;
        }
        return used <= days;
    }

    // ---- Split array largest sum: identical check ----
    static int splitArray(int[] nums, int k) { return shipWithinDays(nums, k); }

    // ---- Maximise the minimum: last true = first false − 1 ----
    static int maxDistance(int[] position, int m) {
        Arrays.sort(position);
        long range = position[position.length - 1] - position[0];
        // canPlace is true…true, false…false as d grows: find the first d where it FAILS
        return (int) firstTrue(1, range + 1, d -> !canPlace(position, m, d)) - 1;
    }
    static boolean canPlace(int[] sorted, int m, long gap) {
        int placed = 1; long last = sorted[0];
        for (int i = 1; i < sorted.length && placed < m; i++)
            if (sorted[i] - last >= gap) { placed++; last = sorted[i]; }   // greedy: place as early as possible
        return placed >= m;
    }

    // ---- Minimum days to make m bouquets of k adjacent flowers ----
    static int minDays(int[] bloomDay, int m, int k) {
        if ((long) m * k > bloomDay.length) return -1;
        int max = Arrays.stream(bloomDay).max().getAsInt();
        return (int) firstTrue(1, max, d -> canMake(bloomDay, m, k, d));
    }
    static boolean canMake(int[] bloom, int m, int k, long day) {
        int bouquets = 0, run = 0;
        for (int b : bloom) {
            run = b <= day ? run + 1 : 0;
            if (run == k) { bouquets++; run = 0; }
        }
        return bouquets >= m;
    }
}

final class Check {
    private static int passed;
    static void that(boolean cond, String what) { if (!cond) throw new AssertionError("FAILED: " + what); passed++; }
    static void done(String name) { System.out.println("✓ " + name + ": " + passed + " checks passed"); }
}
