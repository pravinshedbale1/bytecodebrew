// Pattern: Contribution Technique. Run: java dsa-java/contribution-technique/Contribution.java
// Every method is the lesson's code (instance methods made static; the two countSubarrays renamed).
// Each is checked against a brute force that lists every subarray / pair / subset / substring / path.
import java.util.*;

public class Contribution {
    public static void main(String[] args) {
        var rnd = new Random(2026);
        for (int t = 0; t < 3_000; t++) {
            int n = 1 + rnd.nextInt(12);
            int[] a = ints(n, -30, 30, rnd), pos = ints(n, 1, 12, rnd), small = ints(n, 0, 15, rnd);

            // plain counting
            long allSums = 0, odd = 0;
            for (int l = 0; l < n; l++) for (int r = l; r < n; r++) {
                long s = 0; for (int k = l; k <= r; k++) s += a[k];
                allSums += s; if ((r - l) % 2 == 0) odd += s;
            }
            Check.that(sumOfAllSubarraySums(a) == allSums, "sumOfAllSubarraySums");
            Check.that(sumOddLengthSubarrays(a) == odd, "sumOddLengthSubarrays");
            String word = letters(n, "abeiou", rnd);
            long vowels = 0;
            for (int l = 0; l < n; l++) for (int r = l; r < n; r++) for (int k = l; k <= r; k++) if ("aeiou".indexOf(word.charAt(k)) >= 0) vowels++;
            Check.that(countVowels(word) == vowels, "countVowels");
            int[] zeros = ints(n, 0, 1, rnd);
            long zf = 0;
            for (int l = 0; l < n; l++) for (int r = l; r < n && zeros[r] == 0; r++) zf++;
            Check.that(zeroFilledSubarray(zeros) == zf, "zeroFilledSubarray");

            // bits
            long ham = 0, px = 0;
            for (int i = 0; i < n; i++) for (int j = i + 1; j < n; j++) { ham += Integer.bitCount(small[i] ^ small[j]); px += small[i] ^ small[j]; }
            Check.that(totalHammingDistance(small) == ham, "totalHammingDistance");
            Check.that(sumOfPairXors(small) == px, "sumOfPairXors");
            if (n <= 10) {
                long sx = 0;
                for (int m = 0; m < 1 << n; m++) { int x = 0; for (int k = 0; k < n; k++) if ((m >> k & 1) == 1) x ^= small[k]; sx += x; }
                Check.that(subsetXORSum(small) == sx, "subsetXORSum");
            }
            int[] other = ints(1 + rnd.nextInt(6), 0, 50, rnd);
            int allPairs = 0;
            for (int x : small) for (int y : other) allPairs ^= x ^ y;
            Check.that(xorAllNums(small, other) == allPairs, "xorAllNums");

            // sorting + prefix sums
            long pd = 0;
            for (int i = 0; i < n; i++) for (int j = i + 1; j < n; j++) pd += Math.abs(a[i] - a[j]);
            Check.that(sumOfPairDifferences(a) == pd, "sumOfPairDifferences");
            int[] sorted = pos.clone(); Arrays.sort(sorted);
            int[] want = new int[n];
            for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) want[i] += Math.abs(sorted[i] - sorted[j]);
            Check.that(Arrays.equals(getSumAbsoluteDifferences(sorted), want), "getSumAbsoluteDifferences");
            int[] few = ints(n, 1, 3, rnd);
            long[] dist = new long[n];
            for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) if (few[i] == few[j]) dist[i] += Math.abs(i - j);
            Check.that(Arrays.equals(distance(few), dist), "distance");
            if (n <= 10) {
                long w = 0;
                for (int m = 1; m < 1 << n; m++) {
                    int mx = Integer.MIN_VALUE, mn = Integer.MAX_VALUE;
                    for (int k = 0; k < n; k++) if ((m >> k & 1) == 1) { mx = Math.max(mx, pos[k]); mn = Math.min(mn, pos[k]); }
                    w += mx - mn;
                }
                Check.that(sumSubseqWidths(pos.clone()) == w % 1_000_000_007, "sumSubseqWidths");
            }

            // strings
            String s = letters(n, "abc", rnd), up = letters(n, "ABC", rnd);
            long appeal = 0, unique = 0;
            for (int l = 0; l < n; l++) for (int r = l; r < n; r++) {
                int[] c1 = new int[26], c2 = new int[26];
                for (int k = l; k <= r; k++) { c1[s.charAt(k) - 'a']++; c2[up.charAt(k) - 'A']++; }
                for (int c = 0; c < 26; c++) { if (c1[c] > 0) appeal++; if (c2[c] == 1) unique++; }
            }
            Check.that(appealSum(s) == appeal, "appealSum");
            Check.that(uniqueLetterString(up) == unique, "uniqueLetterString");

            // monotonic stack
            long mins = 0, ranges = 0, strength = 0;
            for (int l = 0; l < n; l++) for (int r = l; r < n; r++) {
                int mn = Integer.MAX_VALUE, mx = Integer.MIN_VALUE; long sm = 0;
                for (int k = l; k <= r; k++) { mn = Math.min(mn, few[k] * 4 + pos[k] % 3); }
                for (int k = l; k <= r; k++) { mx = Math.max(mx, a[k]); }
                int mna = Integer.MAX_VALUE; for (int k = l; k <= r; k++) mna = Math.min(mna, a[k]);
                int mnp = Integer.MAX_VALUE; for (int k = l; k <= r; k++) { mnp = Math.min(mnp, pos[k]); sm += pos[k]; }
                mins += mn; ranges += mx - mna; strength += mnp * sm;
            }
            int[] tied = new int[n]; for (int k = 0; k < n; k++) tied[k] = few[k] * 4 + pos[k] % 3;
            Check.that(sumSubarrayMins(tied) == mins % 1_000_000_007, "sumSubarrayMins (with ties)");
            Check.that(subArrayRanges(a) == ranges, "subArrayRanges");
            Check.that(totalStrength(pos) == strength % 1_000_000_007, "totalStrength");

            // sliding window
            int k = 1 + rnd.nextInt(150);
            long lessK = 0, score = 0, atLeast = 0;
            int max = Arrays.stream(pos).max().getAsInt(), need = 1 + rnd.nextInt(3);
            for (int l = 0; l < n; l++) for (int r = l; r < n; r++) {
                long prod = 1, sm = 0; int copies = 0;
                for (int q = l; q <= r; q++) { prod *= pos[q]; sm += pos[q]; if (pos[q] == max) copies++; }
                if (prod < k) lessK++;
                if (sm * (r - l + 1) < k) score++;
                if (copies >= need) atLeast++;
            }
            Check.that(numSubarrayProductLessThanK(pos, k) == lessK, "numSubarrayProductLessThanK");
            Check.that(countScore(pos, k) == score, "countSubarrays (score < k)");
            Check.that(countAtLeast(pos, need) == atLeast, "countSubarrays (max at least k times)");

            // trees
            int[][] edges = new int[n - 1][];
            for (int v = 1; v < n; v++) edges[v - 1] = rnd.nextBoolean() ? new int[] { rnd.nextInt(v), v } : new int[] { v, rnd.nextInt(v) };
            int[][] d = allDistances(n, edges);
            int[] perNode = new int[n];
            for (int u = 0; u < n; u++) for (int v = 0; v < n; v++) perNode[u] += d[u][v];
            Check.that(Arrays.equals(sumOfDistancesInTree(n, edges), perNode), "sumOfDistancesInTree");
            int seats = 1 + rnd.nextInt(4);
            Check.that(minimumFuelCost(edges, seats) == fuelBySimulation(n, edges, seats), "minimumFuelCost");
        }
        // the lesson's worked examples
        Check.that(sumOddLengthSubarrays(new int[] { 1, 4, 2, 5, 3 }) == 58, "1588 example");
        Check.that(totalHammingDistance(new int[] { 4, 14, 2 }) == 6, "477 example");
        Check.that(appealSum("abbca") == 28, "2262 example");
        Check.that(uniqueLetterString("LEETCODE") == 92, "828 example");
        Check.that(sumSubarrayMins(new int[] { 3, 1, 2, 4 }) == 17, "907 example");
        Check.that(totalStrength(new int[] { 1, 3, 1, 2 }) == 44, "2281 example");
        Check.that(minimumFuelCost(new int[][] { { 3, 1 }, { 3, 2 }, { 1, 0 }, { 0, 4 }, { 0, 5 }, { 4, 6 } }, 2) == 7, "2477 example");
        Check.that(Arrays.equals(sumOfDistancesInTree(6, new int[][] { { 0, 1 }, { 0, 2 }, { 2, 3 }, { 2, 4 }, { 2, 5 } }), new int[] { 8, 12, 6, 10, 10, 10 }), "834 example");
        // a path of 100,000 nodes: the iterative traversal must not overflow the stack
        int big = 100_000;
        int[][] path = new int[big - 1][];
        for (int v = 1; v < big; v++) path[v - 1] = new int[] { v - 1, v };
        Check.that(minimumFuelCost(path, 1) == (long) big * (big - 1) / 2, "minimumFuelCost on a long path");
        Check.done("Contribution");
    }

    // ---------------------------------------------------------------- lesson code

    static long sumOfAllSubarraySums(int[] a) {
        int n = a.length;
        long total = 0;
        for (int i = 0; i < n; i++) total += (long) a[i] * (i + 1) * (n - i);
        return total;
    }

    static int sumOddLengthSubarrays(int[] arr) {
        int n = arr.length, total = 0;
        for (int i = 0; i < n; i++) {
            int all = (i + 1) * (n - i);
            total += arr[i] * ((all + 1) / 2);
        }
        return total;
    }

    static long countVowels(String word) {
        long n = word.length(), total = 0;
        for (int i = 0; i < n; i++)
            if ("aeiou".indexOf(word.charAt(i)) >= 0) total += (i + 1) * (n - i);
        return total;
    }

    static long zeroFilledSubarray(int[] nums) {
        long total = 0, run = 0;
        for (int x : nums) {
            run = (x == 0) ? run + 1 : 0;
            total += run;
        }
        return total;
    }

    static int totalHammingDistance(int[] nums) {
        int n = nums.length, total = 0;
        for (int b = 0; b < 32; b++) {
            int ones = 0;
            for (int x : nums) ones += (x >> b) & 1;
            total += ones * (n - ones);
        }
        return total;
    }

    static long sumOfPairXors(int[] nums) {
        int n = nums.length;
        long total = 0;
        for (int b = 0; b < 31; b++) {
            long ones = 0;
            for (int x : nums) ones += (x >> b) & 1;
            total += ones * (n - ones) << b;
        }
        return total;
    }

    static int subsetXORSum(int[] nums) {
        int or = 0;
        for (int x : nums) or |= x;
        return or << (nums.length - 1);
    }

    static int xorAllNums(int[] nums1, int[] nums2) {
        int x = 0;
        if (nums2.length % 2 == 1) for (int a : nums1) x ^= a;
        if (nums1.length % 2 == 1) for (int b : nums2) x ^= b;
        return x;
    }

    static long sumOfPairDifferences(int[] a) {
        int[] s = a.clone();
        Arrays.sort(s);
        long total = 0, prefix = 0;
        for (int i = 0; i < s.length; i++) {
            total += (long) s[i] * i - prefix;
            prefix += s[i];
        }
        return total;
    }

    static int[] getSumAbsoluteDifferences(int[] nums) {
        int n = nums.length;
        int[] p = new int[n + 1];
        for (int i = 0; i < n; i++) p[i + 1] = p[i] + nums[i];
        int[] res = new int[n];
        for (int i = 0; i < n; i++) {
            int left = nums[i] * i - p[i];
            int right = (p[n] - p[i + 1]) - nums[i] * (n - 1 - i);
            res[i] = left + right;
        }
        return res;
    }

    static long[] distance(int[] nums) {
        Map<Integer, List<Integer>> groups = new HashMap<>();
        for (int i = 0; i < nums.length; i++) groups.computeIfAbsent(nums[i], k -> new ArrayList<>()).add(i);
        long[] res = new long[nums.length];
        for (List<Integer> idx : groups.values()) {
            long total = 0;
            for (int j : idx) total += j;
            long left = 0;
            for (int k = 0; k < idx.size(); k++) {
                long j = idx.get(k);
                long right = total - left - j;
                res[(int) j] = (j * k - left) + (right - j * (idx.size() - 1 - k));
                left += j;
            }
        }
        return res;
    }

    static int sumSubseqWidths(int[] nums) {
        final int MOD = 1_000_000_007;
        int n = nums.length;
        Arrays.sort(nums);
        long[] pow2 = new long[n];
        pow2[0] = 1;
        for (int i = 1; i < n; i++) pow2[i] = pow2[i - 1] * 2 % MOD;
        long total = 0;
        for (int i = 0; i < n; i++)
            total = (total + nums[i] * (pow2[i] - pow2[n - 1 - i])) % MOD;
        return (int) ((total + MOD) % MOD);
    }

    static long appealSum(String s) {
        int[] last = new int[26];
        Arrays.fill(last, -1);
        long n = s.length(), total = 0;
        for (int i = 0; i < n; i++) {
            int c = s.charAt(i) - 'a';
            total += (i - last[c]) * (n - i);
            last[c] = i;
        }
        return total;
    }

    static int uniqueLetterString(String s) {
        int n = s.length();
        int[] prev = new int[n], next = new int[n], seen = new int[26];
        Arrays.fill(seen, -1);
        for (int i = 0; i < n; i++) { int c = s.charAt(i) - 'A'; prev[i] = seen[c]; seen[c] = i; }
        Arrays.fill(seen, n);
        for (int i = n - 1; i >= 0; i--) { int c = s.charAt(i) - 'A'; next[i] = seen[c]; seen[c] = i; }
        long total = 0;
        for (int i = 0; i < n; i++) total += (long) (i - prev[i]) * (next[i] - i);
        return (int) total;
    }

    static int sumSubarrayMins(int[] arr) {
        final int MOD = 1_000_000_007;
        int n = arr.length;
        int[] prev = new int[n], next = new int[n];
        Deque<Integer> st = new ArrayDeque<>();
        for (int i = 0; i < n; i++) {
            while (!st.isEmpty() && arr[st.peek()] >= arr[i]) next[st.pop()] = i;
            prev[i] = st.isEmpty() ? -1 : st.peek();
            st.push(i);
        }
        while (!st.isEmpty()) next[st.pop()] = n;
        long total = 0;
        for (int i = 0; i < n; i++) total = (total + (long) arr[i] * (i - prev[i]) * (next[i] - i)) % MOD;
        return (int) total;
    }

    static long subArrayRanges(int[] nums) {
        return sumOf(nums, true) - sumOf(nums, false);
    }

    static long sumOf(int[] a, boolean max) {
        int n = a.length;
        int[] prev = new int[n], next = new int[n];
        Deque<Integer> st = new ArrayDeque<>();
        for (int i = 0; i < n; i++) {
            while (!st.isEmpty() && (max ? a[st.peek()] <= a[i] : a[st.peek()] >= a[i])) next[st.pop()] = i;
            prev[i] = st.isEmpty() ? -1 : st.peek();
            st.push(i);
        }
        while (!st.isEmpty()) next[st.pop()] = n;
        long total = 0;
        for (int i = 0; i < n; i++) total += (long) a[i] * (i - prev[i]) * (next[i] - i);
        return total;
    }

    static int totalStrength(int[] strength) {
        final long MOD = 1_000_000_007;
        int n = strength.length;
        int[] prev = new int[n], next = new int[n];
        Deque<Integer> st = new ArrayDeque<>();
        for (int i = 0; i < n; i++) {
            while (!st.isEmpty() && strength[st.peek()] >= strength[i]) next[st.pop()] = i;
            prev[i] = st.isEmpty() ? -1 : st.peek();
            st.push(i);
        }
        while (!st.isEmpty()) next[st.pop()] = n;
        long[] p = new long[n + 1], pp = new long[n + 2];
        for (int i = 0; i < n; i++) p[i + 1] = (p[i] + strength[i]) % MOD;
        for (int i = 0; i <= n; i++) pp[i + 1] = (pp[i] + p[i]) % MOD;
        long total = 0;
        for (int i = 0; i < n; i++) {
            int l = prev[i], r = next[i];
            long ends = (pp[r + 1] - pp[i + 1] + MOD) % MOD * (i - l) % MOD;
            long starts = (pp[i + 1] - pp[l + 1] + MOD) % MOD * (r - i) % MOD;
            total = (total + strength[i] * ((ends - starts + MOD) % MOD)) % MOD;
        }
        return (int) total;
    }

    static int numSubarrayProductLessThanK(int[] nums, int k) {
        if (k <= 1) return 0;
        int count = 0, l = 0;
        long prod = 1;
        for (int r = 0; r < nums.length; r++) {
            prod *= nums[r];
            while (prod >= k) prod /= nums[l++];
            count += r - l + 1;
        }
        return count;
    }

    static long countScore(int[] nums, long k) {
        long sum = 0, count = 0;
        for (int l = 0, r = 0; r < nums.length; r++) {
            sum += nums[r];
            while (sum * (r - l + 1) >= k) sum -= nums[l++];
            count += r - l + 1;
        }
        return count;
    }

    static long countAtLeast(int[] nums, int k) {
        int max = Arrays.stream(nums).max().getAsInt();
        long count = 0;
        int seen = 0, l = 0;
        for (int r = 0; r < nums.length; r++) {
            if (nums[r] == max) seen++;
            while (seen >= k) if (nums[l++] == max) seen--;
            count += l;
        }
        return count;
    }

    static long minimumFuelCost(int[][] roads, int seats) {
        int n = roads.length + 1;
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (int[] e : roads) { adj.get(e[0]).add(e[1]); adj.get(e[1]).add(e[0]); }
        int[] parent = new int[n], order = new int[n], size = new int[n];
        parent[0] = -1;
        int len = 0;
        order[len++] = 0;
        for (int k = 0; k < len; k++)
            for (int c : adj.get(order[k])) if (c != parent[order[k]]) { parent[c] = order[k]; order[len++] = c; }
        long fuel = 0;
        for (int k = n - 1; k > 0; k--) {
            int v = order[k];
            size[v] += 1;
            fuel += (size[v] + seats - 1) / seats;
            size[parent[v]] += size[v];
        }
        return fuel;
    }

    static int[] sumOfDistancesInTree(int n, int[][] edges) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (int[] e : edges) { adj.get(e[0]).add(e[1]); adj.get(e[1]).add(e[0]); }
        int[] parent = new int[n], order = new int[n], size = new int[n], ans = new int[n];
        parent[0] = -1;
        int len = 0;
        order[len++] = 0;
        for (int k = 0; k < len; k++)
            for (int c : adj.get(order[k])) if (c != parent[order[k]]) { parent[c] = order[k]; order[len++] = c; }
        for (int k = n - 1; k >= 0; k--) {
            int v = order[k];
            size[v] += 1;
            if (v != 0) { size[parent[v]] += size[v]; ans[0] += size[v]; }
        }
        for (int k = 1; k < n; k++) {
            int v = order[k];
            ans[v] = ans[parent[v]] - size[v] + (n - size[v]);
        }
        return ans;
    }

    // ---------------------------------------------------------------- brute-force helpers

    static int[] ints(int n, int lo, int hi, Random rnd) {
        int[] a = new int[n];
        for (int i = 0; i < n; i++) a[i] = lo + rnd.nextInt(hi - lo + 1);
        return a;
    }

    static String letters(int n, String from, Random rnd) {
        var sb = new StringBuilder();
        for (int i = 0; i < n; i++) sb.append(from.charAt(rnd.nextInt(from.length())));
        return sb.toString();
    }

    static int[][] allDistances(int n, int[][] edges) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (int[] e : edges) { adj.get(e[0]).add(e[1]); adj.get(e[1]).add(e[0]); }
        int[][] d = new int[n][n];
        for (int s = 0; s < n; s++) {
            Arrays.fill(d[s], -1);
            d[s][s] = 0;
            Deque<Integer> q = new ArrayDeque<>(List.of(s));
            while (!q.isEmpty()) { int v = q.poll(); for (int c : adj.get(v)) if (d[s][c] < 0) { d[s][c] = d[s][v] + 1; q.add(c); } }
        }
        return d;
    }

    /** Fuel by simulation: every round, every car moves one step towards 0; cars meeting at a city regroup into as few cars as possible. */
    static long fuelBySimulation(int n, int[][] edges, int seats) {
        int[][] d = allDistances(n, edges);
        int[] parent = new int[n];
        for (int v = 1; v < n; v++) for (int[] e : edges) {
            int u = e[0] == v ? e[1] : e[1] == v ? e[0] : -1;
            if (u >= 0 && d[0][u] == d[0][v] - 1) parent[v] = u;
        }
        int[] people = new int[n];
        Arrays.fill(people, 1);
        long fuel = 0;
        int depth = 0;
        for (int v = 0; v < n; v++) depth = Math.max(depth, d[0][v]);
        for (int level = depth; level >= 1; level--)       // the deepest group leaves first, everyone waits to regroup
            for (int v = 0; v < n; v++) if (d[0][v] == level) {
                fuel += (people[v] + seats - 1) / seats;
                people[parent[v]] += people[v];
            }
        return fuel;
    }
}

final class Check {
    private static int passed;
    static void that(boolean cond, String what) { if (!cond) throw new AssertionError("FAILED: " + what); passed++; }
    static void done(String name) { System.out.println("✓ " + name + ": " + passed + " checks passed"); }
}
