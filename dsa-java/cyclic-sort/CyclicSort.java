// Pattern: Cyclic Sort. Run: java dsa-java/cyclic-sort/CyclicSort.java
import java.util.*;

public class CyclicSort {
    public static void main(String[] args) {
        var rnd = new Random(41);
        for (int t = 0; t < 4_000; t++) {
            int n = 1 + rnd.nextInt(30);
            // values 1..n with repeats: cyclic sort puts every value that has a copy at its home
            int[] a = new int[n]; for (int i = 0; i < n; i++) a[i] = 1 + rnd.nextInt(t % 3 == 0 ? n : Math.max(1, n / 2));
            int[] placed = a.clone(); cyclicSort(placed);
            Set<Integer> present = new HashSet<>(); for (int x : a) present.add(x);
            for (int v = 1; v <= n; v++) Check.that(present.contains(v) == (placed[v - 1] == v), "cyclicSort puts every present value home");
            int[] sortedA = a.clone(), sortedP = placed.clone(); Arrays.sort(sortedA); Arrays.sort(sortedP);
            Check.that(Arrays.equals(sortedA, sortedP), "cyclicSort only moves values around");
            // all missing, by cyclic sort and by sign marking (which must restore the input)
            List<Integer> missing = new ArrayList<>(); for (int v = 1; v <= n; v++) if (!present.contains(v)) missing.add(v);
            Check.that(findDisappearedNumbers(a.clone()).equals(missing), "findDisappearedNumbers");
            int[] m = a.clone();
            Check.that(findDisappearedByMarking(m).equals(missing) && Arrays.equals(m, a), "findDisappearedByMarking restores the input");
            // values that appear at most twice: duplicates
            int[] twiceMax = atMostTwice(n, rnd);
            Map<Integer, Integer> cnt = new HashMap<>(); for (int x : twiceMax) cnt.merge(x, 1, Integer::sum);
            List<Integer> dups = new ArrayList<>(); for (var e : cnt.entrySet()) if (e.getValue() == 2) dups.add(e.getKey());
            List<Integer> got = findDuplicates(twiceMax.clone()); Collections.sort(got); Collections.sort(dups);
            Check.that(got.equals(dups), "findDuplicates");
            // set mismatch: 1..n with one value replaced by another
            if (n >= 2) {
                int[] s = perm(n, 1, rnd);
                int lost = s[rnd.nextInt(n)], dup;
                do dup = 1 + rnd.nextInt(n); while (dup == lost);
                for (int i = 0; i < n; i++) if (s[i] == lost) s[i] = dup;
                Check.that(Arrays.equals(findErrorNums(s), new int[] { dup, lost }), "findErrorNums");
            }
            // missing number: 0..n with one gone
            int[] full = perm(n + 1, 0, rnd);
            int gone = full[n];
            Check.that(missingNumber(Arrays.copyOf(full, n)) == gone, "missingNumber");
            // first missing positive: anything goes
            int[] any = new int[n]; for (int i = 0; i < n; i++) any[i] = rnd.nextInt(2 * n + 3) - n / 2;
            Set<Integer> anySet = new HashSet<>(); for (int x : any) anySet.add(x);
            int fmp = 1; while (anySet.contains(fmp)) fmp++;
            Check.that(firstMissingPositive(any.clone()) == fmp, "firstMissingPositive");
            // first k missing positives (practice), with values above n mixed in
            int[] wide = new int[n]; for (int i = 0; i < n; i++) wide[i] = rnd.nextInt(3 * n + 3) - n / 2;
            Set<Integer> wideSet = new HashSet<>(); for (int x : wide) wideSet.add(x);
            int k = 1 + rnd.nextInt(n + 3);
            List<Integer> wantK = new ArrayList<>(); for (int v = 1; wantK.size() < k; v++) if (!wideSet.contains(v)) wantK.add(v);
            Check.that(firstKMissing(wide.clone(), k).equals(wantK), "firstKMissing");
            // any duplicate in 0..n−1 (practice)
            if (n >= 2) {
                int[] z = new int[n]; for (int i = 0; i < n; i++) z[i] = rnd.nextInt(n);
                Map<Integer, Integer> zc = new HashMap<>(); for (int x : z) zc.merge(x, 1, Integer::sum);
                if (zc.size() < n) Check.that(zc.get(anyDuplicate(z.clone())) >= 2, "anyDuplicate");
            }
            // array nesting: longest cycle of a permutation, against walking from every start
            int[] p = perm(n, 0, rnd);
            Check.that(arrayNesting(p.clone()) == nestingBrute(p), "arrayNesting");
            // a permutation of 1..n needs n − cycles swaps, and cyclic sort uses exactly that many
            int[] q = perm(n, 1, rnd);
            int cycles = 0; boolean[] seen = new boolean[n];
            for (int i = 0; i < n; i++) if (!seen[i]) { cycles++; for (int j = i; !seen[j]; j = q[j] - 1) seen[j] = true; }
            Check.that(countSwaps(q.clone()) == n - cycles, "cyclic sort swaps = n − cycles");
            // minimum swaps to sort distinct values, against BFS over every arrangement
            if (n <= 6) {
                int[] d = new int[n]; Set<Integer> used = new HashSet<>();
                for (int i = 0; i < n; i++) { int v; do v = rnd.nextInt(100) - 50; while (!used.add(v)); d[i] = v; }
                Check.that(minSwapsToSort(d.clone()) == bfsSwaps(d, CyclicSort::isSorted), "minSwapsToSort");
            }
            // couples holding hands, against BFS for up to 4 couples
            int couples = 2 + rnd.nextInt(t % 100 == 0 ? 3 : 2);
            int[] row = perm(2 * couples, 0, rnd);
            Check.that(minSwapsCouples(row.clone()) == bfsSwaps(row, CyclicSort::seated), "minSwapsCouples");
        }
        Check.done("cyclic-sort");
    }

    /** Values 1..n (repeats allowed): send each value v to index v − 1. O(n) time, O(1) space. */
    static void cyclicSort(int[] nums) {
        int i = 0;
        while (i < nums.length) {
            int home = nums[i] - 1;                          // where nums[i] belongs
            if (nums[i] != nums[home]) swap(nums, i, home);  // send it home; check what came back
            else i++;                                        // home already holds this value: move on
        }
    }

    /** Values 0..n, one missing. The value n has no home, so it is left wherever it lands. */
    static int missingNumber(int[] nums) {
        int i = 0, n = nums.length;
        while (i < n) {
            int home = nums[i];                              // range 0..n: value v belongs at index v
            if (home < n && nums[i] != nums[home]) swap(nums, i, home);
            else i++;
        }
        for (i = 0; i < n; i++) if (nums[i] != i) return i;  // the slot nobody came home to
        return n;
    }

    /** After cyclic sort, every slot not holding i + 1 means i + 1 is missing. */
    static List<Integer> findDisappearedNumbers(int[] nums) {
        cyclicSort(nums);
        List<Integer> missing = new ArrayList<>();
        for (int i = 0; i < nums.length; i++) if (nums[i] != i + 1) missing.add(i + 1);
        return missing;
    }

    /** ...and the value sitting in that slot is a spare copy: a duplicate. */
    static List<Integer> findDuplicates(int[] nums) {
        cyclicSort(nums);
        List<Integer> twice = new ArrayList<>();
        for (int i = 0; i < nums.length; i++) if (nums[i] != i + 1) twice.add(nums[i]);
        return twice;
    }

    /** One value replaced by another: the single wrong slot gives both. Returns {duplicate, missing}. */
    static int[] findErrorNums(int[] nums) {
        cyclicSort(nums);
        for (int i = 0; i < nums.length; i++)
            if (nums[i] != i + 1) return new int[] { nums[i], i + 1 };
        throw new IllegalArgumentException("nothing is missing");
    }

    /** Any values: only 1..n have a home, and the answer is at most n + 1. */
    static int firstMissingPositive(int[] nums) {
        int i = 0, n = nums.length;
        while (i < n) {
            int v = nums[i];
            if (v >= 1 && v <= n && nums[v - 1] != v) swap(nums, i, v - 1);
            else i++;                                        // out of range, or already home
        }
        for (i = 0; i < n; i++) if (nums[i] != i + 1) return i + 1;
        return n + 1;
    }

    /** Sign marking: the other way to use the array as a "seen" table. Restores the input. */
    static List<Integer> findDisappearedByMarking(int[] nums) {
        for (int v : nums) {
            int home = Math.abs(v) - 1;
            if (nums[home] > 0) nums[home] = -nums[home];    // mark "|v| is present"
        }
        List<Integer> missing = new ArrayList<>();
        for (int i = 0; i < nums.length; i++) {
            if (nums[i] > 0) missing.add(i + 1);
            else nums[i] = -nums[i];                         // undo the mark
        }
        return missing;
    }

    /** Longest cycle of a permutation of 0..n−1: walk each cycle once, marking as you go. */
    static int arrayNesting(int[] nums) {
        int best = 0;
        for (int start = 0; start < nums.length; start++) {
            int len = 0;
            for (int i = start; nums[i] >= 0; len++) {
                int next = nums[i];
                nums[i] = -1;                                // visited: never walked again
                i = next;
            }
            best = Math.max(best, len);
        }
        return best;
    }

    /** Minimum swaps to sort distinct values: cyclic sort to each value's sorted position, counting swaps. */
    static int minSwapsToSort(int[] a) {
        int[] sorted = a.clone();
        Arrays.sort(sorted);
        Map<Integer, Integer> home = new HashMap<>();        // value → its index once sorted
        for (int i = 0; i < sorted.length; i++) home.put(sorted[i], i);
        int swaps = 0;
        for (int i = 0; i < a.length; i++)
            while (home.get(a[i]) != i) { swap(a, i, home.get(a[i])); swaps++; }
        return swaps;
    }

    /** Couples (0,1), (2,3)…: fix each couch in turn by fetching the partner. Every swap seats one couple. */
    static int minSwapsCouples(int[] row) {
        int[] seat = new int[row.length];                    // seat[person] = where they sit
        for (int i = 0; i < row.length; i++) seat[row[i]] = i;
        int swaps = 0;
        for (int i = 0; i < row.length; i += 2) {
            int partner = row[i] ^ 1;                        // 0↔1, 2↔3, 4↔5…
            if (row[i + 1] == partner) continue;
            int j = seat[partner];                           // swap the partner into seat i + 1
            row[j] = row[i + 1]; seat[row[j]] = j;
            row[i + 1] = partner; seat[partner] = i + 1;
            swaps++;
        }
        return swaps;
    }

    /** Practice: values 0..n−1, at least one repeats. The first value whose home is taken is a duplicate. */
    static int anyDuplicate(int[] nums) {
        int i = 0;
        while (i < nums.length) {
            int home = nums[i];
            if (home == i) i++;
            else if (nums[home] == nums[i]) return nums[i];  // its home is already taken
            else swap(nums, i, home);
        }
        throw new IllegalArgumentException("no duplicate");
    }

    /** Practice: the first k missing positives of any values. Values above n are present but homeless. */
    static List<Integer> firstKMissing(int[] nums, int k) {
        int i = 0, n = nums.length;
        while (i < n) {
            int v = nums[i];
            if (v >= 1 && v <= n && nums[v - 1] != v) swap(nums, i, v - 1);
            else i++;
        }
        List<Integer> out = new ArrayList<>();
        Set<Integer> above = new HashSet<>();                // values > n: present, but homeless
        for (i = 0; i < n; i++) {
            if (nums[i] == i + 1) continue;
            if (out.size() < k) out.add(i + 1);              // nobody came home: i + 1 is missing
            if (nums[i] > n) above.add(nums[i]);
        }
        for (int v = n + 1; out.size() < k; v++) if (!above.contains(v)) out.add(v);
        return out;
    }

    static void swap(int[] a, int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }

    // ---- test helpers

    static int countSwaps(int[] nums) {                      // cyclicSort, counting its swaps
        int i = 0, swaps = 0;
        while (i < nums.length) {
            int home = nums[i] - 1;
            if (nums[i] != nums[home]) { swap(nums, i, home); swaps++; } else i++;
        }
        return swaps;
    }

    static int[] perm(int n, int from, Random rnd) {
        int[] a = new int[n]; for (int i = 0; i < n; i++) a[i] = from + i;
        for (int i = n - 1; i > 0; i--) swap(a, i, rnd.nextInt(i + 1));
        return a;
    }

    static int[] atMostTwice(int n, Random rnd) {            // n values in 1..n, each at most twice
        List<Integer> vals = new ArrayList<>();
        List<Integer> pool = new ArrayList<>(); for (int v = 1; v <= n; v++) pool.add(v);
        Collections.shuffle(pool, rnd);
        for (int v : pool) {
            if (vals.size() < n) vals.add(v);
            if (vals.size() < n && rnd.nextBoolean()) vals.add(v);
        }
        Collections.shuffle(vals, rnd);
        return vals.stream().mapToInt(Integer::intValue).toArray();
    }

    static int nestingBrute(int[] p) {
        int best = 0;
        for (int s = 0; s < p.length; s++) {
            Set<Integer> set = new HashSet<>();
            for (int i = s; set.add(p[i]); i = p[i]) { }
            best = Math.max(best, set.size());
        }
        return best;
    }

    static boolean isSorted(int[] a) { for (int i = 1; i < a.length; i++) if (a[i - 1] > a[i]) return false; return true; }
    static boolean seated(int[] r) { for (int i = 0; i < r.length; i += 2) if ((r[i] ^ 1) != r[i + 1]) return false; return true; }

    /** Fewest swaps (any two positions) to reach a goal, by breadth-first search over arrangements. */
    static int bfsSwaps(int[] start, java.util.function.Predicate<int[]> goal) {
        Map<String, Integer> dist = new HashMap<>();
        Deque<int[]> q = new ArrayDeque<>();
        dist.put(Arrays.toString(start), 0); q.add(start);
        while (!q.isEmpty()) {
            int[] cur = q.poll();
            int d = dist.get(Arrays.toString(cur));
            if (goal.test(cur)) return d;
            for (int i = 0; i < cur.length; i++)
                for (int j = i + 1; j < cur.length; j++) {
                    int[] nx = cur.clone(); swap(nx, i, j);
                    if (dist.putIfAbsent(Arrays.toString(nx), d + 1) == null) q.add(nx);
                }
        }
        throw new IllegalStateException("unreachable");
    }
}

final class Check {
    private static int passed;
    static void that(boolean cond, String what) { if (!cond) throw new AssertionError("FAILED: " + what); passed++; }
    static void done(String name) { System.out.println("✓ " + name + ": " + passed + " checks passed"); }
}
