// Min/max queues (Monotonic Stack lesson), heap design with lazy deletion (Designing Data Structures)
// and 2294 (Greedy). Run: java dsa-java/design/QueuesAndHeaps.java
// The lesson's code, checked against brute force on random inputs and operation sequences.
import java.util.*;

public class QueuesAndHeaps {
    public static void main(String[] args) {
        var rnd = new Random(1438);
        for (int t = 0; t < 2_000; t++) {
            // max queues: both designs against a plain list
            var a = new MaxQueue(); var b = new MaxQueueTwoStacks(); var ref = new ArrayDeque<Integer>();
            for (int op = 0; op < 60; op++) {
                int r = rnd.nextInt(10);
                if (r < 5 || ref.isEmpty()) { int x = rnd.nextInt(9) - 4; a.push(x); b.push(x); ref.addLast(x); }
                else if (r < 8) { int x = ref.pollFirst(); Check.that(a.pop() == x && b.pop() == x, "MaxQueue pop"); }
                else { int m = Collections.max(ref); Check.that(a.max() == m && b.max() == m, "MaxQueue max"); }
            }

            int n = 1 + rnd.nextInt(14);
            int[] nums = new int[n];
            for (int i = 0; i < n; i++) nums[i] = 1 + rnd.nextInt(t % 2 == 0 ? 10 : 1000);
            int limit = rnd.nextInt(t % 2 == 0 ? 6 : 500);
            int best = 0;
            for (int l = 0; l < n; l++) { int mx = 0, mn = Integer.MAX_VALUE; for (int r = l; r < n; r++) { mx = Math.max(mx, nums[r]); mn = Math.min(mn, nums[r]); if (mx - mn <= limit) best = Math.max(best, r - l + 1); } }
            Check.that(longestSubarray(nums, limit) == best, "longestSubarray");

            int[] signed = new int[n];
            for (int i = 0; i < n; i++) signed[i] = rnd.nextInt(21) - 10;
            int k = 1 + rnd.nextInt(n);
            int[] dp = new int[n];
            dp[0] = signed[0];
            for (int i = 1; i < n; i++) { int m = Integer.MIN_VALUE; for (int j = Math.max(0, i - k); j < i; j++) m = Math.max(m, dp[j]); dp[i] = signed[i] + m; }
            Check.that(maxResult(signed, k) == dp[n - 1], "maxResult");
            int bestSub = Integer.MIN_VALUE;
            for (int mask = 1; mask < (1 << n); mask++) {
                int last = -1, sum = 0; boolean okGap = true;
                for (int i = 0; i < n; i++) if ((mask >> i & 1) == 1) { if (last >= 0 && i - last > k) okGap = false; last = i; sum += signed[i]; }
                if (okGap) bestSub = Math.max(bestSub, sum);
            }
            Check.that(constrainedSubsetSum(signed, k) == bestSub, "constrainedSubsetSum");
            int target = 1 + rnd.nextInt(25), shortest = -1;
            for (int l = 0; l < n; l++) { int s = 0; for (int r = l; r < n; r++) { s += signed[r]; if (s >= target && (shortest < 0 || r - l + 1 < shortest)) shortest = r - l + 1; } }
            Check.that(shortestSubarray(signed, target) == shortest, "shortestSubarray");

            int kk = rnd.nextInt(5);
            int[] sorted = nums.clone(); Arrays.sort(sorted);
            int[] g = new int[n + 1]; Arrays.fill(g, Integer.MAX_VALUE); g[0] = 0;
            for (int i = 1; i <= n; i++) for (int j = 0; j < i; j++) if (sorted[i - 1] - sorted[j] <= kk && g[j] != Integer.MAX_VALUE) g[i] = Math.min(g[i], g[j] + 1);
            int[] small = new int[n]; for (int i = 0; i < n; i++) small[i] = rnd.nextInt(12);
            int[] ss = small.clone(); Arrays.sort(ss);
            int[] g2 = new int[n + 1]; Arrays.fill(g2, Integer.MAX_VALUE); g2[0] = 0;
            for (int i = 1; i <= n; i++) for (int j = 0; j < i; j++) if (ss[i - 1] - ss[j] <= kk) g2[i] = Math.min(g2[i], g2[j] + 1);
            Check.that(partitionArray(small.clone(), kk) == g2[n], "partitionArray");

            checkStockPrice(rnd);
            checkNumberContainers(rnd);
            checkFoodRatings(rnd);
            checkSeats(rnd);
            checkInfiniteSet(rnd);
            checkExamRoom(rnd);
        }
        Check.that(longestSubarray(new int[] { 10, 1, 2, 4, 7, 2 }, 5) == 4, "1438 example");
        Check.that(maxResult(new int[] { 10, -5, -2, 4, 0, 3 }, 3) == 17, "1696 example");
        Check.that(constrainedSubsetSum(new int[] { 10, -2, -10, -5, 20 }, 2) == 23, "1425 example");
        Check.that(shortestSubarray(new int[] { 2, -1, 2 }, 3) == 3, "862 example");
        Check.that(partitionArray(new int[] { 3, 6, 1, 2, 5 }, 2) == 2, "2294 example");
        Check.done("QueuesAndHeaps");
    }

    static void checkStockPrice(Random rnd) {
        var sp = new StockPrice(); var truth = new HashMap<Integer, Integer>(); int latest = 0;
        for (int op = 0; op < 40; op++) {
            if (truth.isEmpty() || rnd.nextInt(3) == 0) { int ts = 1 + rnd.nextInt(8), p = 1 + rnd.nextInt(20); sp.update(ts, p); truth.put(ts, p); latest = Math.max(latest, ts); }
            else switch (rnd.nextInt(3)) {
                case 0 -> Check.that(sp.current() == truth.get(latest), "StockPrice current");
                case 1 -> Check.that(sp.maximum() == Collections.max(truth.values()), "StockPrice maximum");
                default -> Check.that(sp.minimum() == Collections.min(truth.values()), "StockPrice minimum");
            }
        }
    }

    static void checkNumberContainers(Random rnd) {
        var nc = new NumberContainers(); var at = new HashMap<Integer, Integer>();
        for (int op = 0; op < 40; op++) {
            if (rnd.nextBoolean()) { int i = 1 + rnd.nextInt(8), x = 1 + rnd.nextInt(4); nc.change(i, x); at.put(i, x); }
            else { int x = 1 + rnd.nextInt(5); int want = at.entrySet().stream().filter(e -> e.getValue() == x).mapToInt(Map.Entry::getKey).min().orElse(-1); Check.that(nc.find(x) == want, "NumberContainers find"); }
        }
    }

    static void checkFoodRatings(Random rnd) {
        int n = 1 + rnd.nextInt(6);
        String[] foods = new String[n], cuisines = new String[n]; int[] ratings = new int[n];
        for (int i = 0; i < n; i++) { foods[i] = "f" + (char) ('a' + rnd.nextInt(26)) + i; cuisines[i] = "c" + rnd.nextInt(3); ratings[i] = 1 + rnd.nextInt(5); }
        var fr = new FoodRatings(foods, cuisines, ratings);
        var rating = new HashMap<String, Integer>(); for (int i = 0; i < n; i++) rating.put(foods[i], ratings[i]);
        for (int op = 0; op < 30; op++) {
            int i = rnd.nextInt(n);
            if (rnd.nextBoolean()) { int r = 1 + rnd.nextInt(5); fr.changeRating(foods[i], r); rating.put(foods[i], r); }
            else {
                String c = cuisines[i], want = null;
                for (int j = 0; j < n; j++) if (cuisines[j].equals(c) && (want == null || rating.get(foods[j]) > rating.get(want) || (rating.get(foods[j]).equals(rating.get(want)) && foods[j].compareTo(want) < 0))) want = foods[j];
                Check.that(fr.highestRated(c).equals(want), "FoodRatings highestRated");
            }
        }
    }

    static void checkSeats(Random rnd) {
        int n = 1 + rnd.nextInt(10);
        var sm = new SeatManager(n); var taken = new TreeSet<Integer>();
        for (int op = 0; op < 40; op++) {
            if (taken.size() < n && (taken.isEmpty() || rnd.nextBoolean())) { int want = 1; while (taken.contains(want)) want++; Check.that(sm.reserve() == want, "SeatManager reserve"); taken.add(want); }
            else if (!taken.isEmpty()) { int s = new ArrayList<>(taken).get(rnd.nextInt(taken.size())); sm.unreserve(s); taken.remove(s); }
        }
    }

    static void checkInfiniteSet(Random rnd) {
        var s = new SmallestInfiniteSet(); var removed = new HashSet<Integer>();
        for (int op = 0; op < 40; op++) {
            if (rnd.nextBoolean()) { int want = 1; while (removed.contains(want)) want++; Check.that(s.popSmallest() == want, "SmallestInfiniteSet pop"); removed.add(want); }
            else { int x = 1 + rnd.nextInt(10); s.addBack(x); removed.remove(x); }
        }
    }

    static void checkExamRoom(Random rnd) {
        int n = 1 + rnd.nextInt(12);
        var room = new ExamRoom(n); var seated = new TreeSet<Integer>();
        for (int op = 0; op < 30; op++) {
            if (seated.size() < n && (seated.isEmpty() || rnd.nextInt(3) > 0)) {
                int bestSeat = -1, bestDist = -1;
                for (int p = 0; p < n; p++) {
                    if (seated.contains(p)) continue;
                    int d = Integer.MAX_VALUE;
                    for (int s : seated) d = Math.min(d, Math.abs(s - p));
                    if (d > bestDist) { bestDist = d; bestSeat = p; }
                }
                Check.that(room.seat() == bestSeat, "ExamRoom seat");
                seated.add(bestSeat);
            } else if (!seated.isEmpty()) { int p = new ArrayList<>(seated).get(rnd.nextInt(seated.size())); room.leave(p); seated.remove(p); }
        }
    }

    // ---------------------------------------------------------------- Monotonic Stack lesson

    static class MaxQueue {
        private final Deque<Integer> q = new ArrayDeque<>(), best = new ArrayDeque<>();
        void push(int x) {
            q.offerLast(x);
            while (!best.isEmpty() && best.peekLast() < x) best.pollLast();
            best.offerLast(x);
        }
        int pop() {
            int x = q.pollFirst();
            if (best.peekFirst() == x) best.pollFirst();
            return x;
        }
        int max() { return best.peekFirst(); }
    }

    static class MaxQueueTwoStacks {
        private final Deque<int[]> in = new ArrayDeque<>(), out = new ArrayDeque<>();
        private static void push(Deque<int[]> s, int x) { s.push(new int[] { x, s.isEmpty() ? x : Math.max(x, s.peek()[1]) }); }
        void push(int x) { push(in, x); }
        int pop() {
            if (out.isEmpty()) while (!in.isEmpty()) push(out, in.pop()[0]);
            return out.pop()[0];
        }
        int max() {
            int m = Integer.MIN_VALUE;
            if (!in.isEmpty()) m = in.peek()[1];
            if (!out.isEmpty()) m = Math.max(m, out.peek()[1]);
            return m;
        }
    }

    static int longestSubarray(int[] nums, int limit) {
        Deque<Integer> maxQ = new ArrayDeque<>(), minQ = new ArrayDeque<>();
        int l = 0, best = 0;
        for (int r = 0; r < nums.length; r++) {
            while (!maxQ.isEmpty() && maxQ.peekLast() < nums[r]) maxQ.pollLast();
            maxQ.offerLast(nums[r]);
            while (!minQ.isEmpty() && minQ.peekLast() > nums[r]) minQ.pollLast();
            minQ.offerLast(nums[r]);
            while (maxQ.peekFirst() - minQ.peekFirst() > limit) {
                if (maxQ.peekFirst() == nums[l]) maxQ.pollFirst();
                if (minQ.peekFirst() == nums[l]) minQ.pollFirst();
                l++;
            }
            best = Math.max(best, r - l + 1);
        }
        return best;
    }

    static int maxResult(int[] nums, int k) {
        int n = nums.length;
        int[] dp = new int[n];
        dp[0] = nums[0];
        Deque<Integer> dq = new ArrayDeque<>(List.of(0));
        for (int i = 1; i < n; i++) {
            if (dq.peekFirst() < i - k) dq.pollFirst();
            dp[i] = nums[i] + dp[dq.peekFirst()];
            while (!dq.isEmpty() && dp[dq.peekLast()] <= dp[i]) dq.pollLast();
            dq.offerLast(i);
        }
        return dp[n - 1];
    }

    static int constrainedSubsetSum(int[] nums, int k) {
        int n = nums.length, best = Integer.MIN_VALUE;
        int[] dp = new int[n];
        Deque<Integer> dq = new ArrayDeque<>();
        for (int i = 0; i < n; i++) {
            if (!dq.isEmpty() && dq.peekFirst() < i - k) dq.pollFirst();
            dp[i] = nums[i] + Math.max(0, dq.isEmpty() ? 0 : dp[dq.peekFirst()]);
            while (!dq.isEmpty() && dp[dq.peekLast()] <= dp[i]) dq.pollLast();
            dq.offerLast(i);
            best = Math.max(best, dp[i]);
        }
        return best;
    }

    static int shortestSubarray(int[] nums, int k) {
        int n = nums.length, best = n + 1;
        long[] p = new long[n + 1];
        for (int i = 0; i < n; i++) p[i + 1] = p[i] + nums[i];
        Deque<Integer> dq = new ArrayDeque<>();
        for (int j = 0; j <= n; j++) {
            while (!dq.isEmpty() && p[j] - p[dq.peekFirst()] >= k) best = Math.min(best, j - dq.pollFirst());
            while (!dq.isEmpty() && p[dq.peekLast()] >= p[j]) dq.pollLast();
            dq.offerLast(j);
        }
        return best <= n ? best : -1;
    }

    // ---------------------------------------------------------------- Greedy lesson

    static int partitionArray(int[] nums, int k) {
        Arrays.sort(nums);
        int groups = 1, start = nums[0];
        for (int x : nums)
            if (x - start > k) { groups++; start = x; }
        return groups;
    }

    // ---------------------------------------------------------------- Designing Data Structures lesson

    static class StockPrice {
        private final Map<Integer, Integer> price = new HashMap<>();
        private final PriorityQueue<int[]> maxH = new PriorityQueue<>((a, b) -> b[0] - a[0]);
        private final PriorityQueue<int[]> minH = new PriorityQueue<>((a, b) -> a[0] - b[0]);
        private int latest = 0;
        public void update(int timestamp, int p) {
            price.put(timestamp, p);
            latest = Math.max(latest, timestamp);
            maxH.add(new int[] { p, timestamp });
            minH.add(new int[] { p, timestamp });
        }
        public int current() { return price.get(latest); }
        public int maximum() { return top(maxH); }
        public int minimum() { return top(minH); }
        private int top(PriorityQueue<int[]> h) {
            while (price.get(h.peek()[1]) != h.peek()[0]) h.poll();
            return h.peek()[0];
        }
    }

    static class NumberContainers {
        private final Map<Integer, Integer> at = new HashMap<>();
        private final Map<Integer, PriorityQueue<Integer>> where = new HashMap<>();
        public void change(int index, int number) {
            at.put(index, number);
            where.computeIfAbsent(number, x -> new PriorityQueue<>()).add(index);
        }
        public int find(int number) {
            PriorityQueue<Integer> h = where.get(number);
            if (h == null) return -1;
            while (!h.isEmpty() && at.get(h.peek()) != number) h.poll();
            return h.isEmpty() ? -1 : h.peek();
        }
    }

    static class FoodRatings {
        private record Entry(int rating, String food) {}
        private final Map<String, Integer> rating = new HashMap<>();
        private final Map<String, String> cuisineOf = new HashMap<>();
        private final Map<String, PriorityQueue<Entry>> best = new HashMap<>();
        public FoodRatings(String[] foods, String[] cuisines, int[] ratings) {
            for (int i = 0; i < foods.length; i++) {
                cuisineOf.put(foods[i], cuisines[i]);
                best.computeIfAbsent(cuisines[i], c -> new PriorityQueue<>(
                    (a, b) -> a.rating() != b.rating() ? Integer.compare(b.rating(), a.rating()) : a.food().compareTo(b.food())));
                changeRating(foods[i], ratings[i]);
            }
        }
        public void changeRating(String food, int newRating) {
            rating.put(food, newRating);
            best.get(cuisineOf.get(food)).add(new Entry(newRating, food));
        }
        public String highestRated(String cuisine) {
            PriorityQueue<Entry> h = best.get(cuisine);
            while (h.peek().rating() != rating.get(h.peek().food())) h.poll();
            return h.peek().food();
        }
    }

    static class SeatManager {
        private final PriorityQueue<Integer> returned = new PriorityQueue<>();
        private int next = 1;
        public SeatManager(int n) {}
        public int reserve() { return returned.isEmpty() ? next++ : returned.poll(); }
        public void unreserve(int seatNumber) { returned.add(seatNumber); }
    }

    static class SmallestInfiniteSet {
        private int next = 1;
        private final TreeSet<Integer> added = new TreeSet<>();
        public int popSmallest() { return added.isEmpty() ? next++ : added.pollFirst(); }
        public void addBack(int num) { if (num < next) added.add(num); }
    }

    static class ExamRoom {
        private final int n;
        private final TreeSet<Integer> seated = new TreeSet<>();
        public ExamRoom(int n) { this.n = n; }
        public int seat() {
            if (seated.isEmpty()) { seated.add(0); return 0; }
            int bestSeat = 0, bestDist = seated.first();
            Integer prev = null;
            for (int s : seated) {
                if (prev != null && (s - prev) / 2 > bestDist) { bestDist = (s - prev) / 2; bestSeat = prev + bestDist; }
                prev = s;
            }
            if (n - 1 - seated.last() > bestDist) bestSeat = n - 1;
            seated.add(bestSeat);
            return bestSeat;
        }
        public void leave(int p) { seated.remove(p); }
    }
}

final class Check {
    private static int passed;
    static void that(boolean cond, String what) { if (!cond) throw new AssertionError("FAILED: " + what); passed++; }
    static void done(String name) { System.out.println("✓ " + name + ": " + passed + " checks passed"); }
}
