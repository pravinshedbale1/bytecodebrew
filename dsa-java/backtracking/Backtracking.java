// Pattern: Backtracking. Run: java dsa-java/backtracking/Backtracking.java
import java.util.*;

public class Backtracking {
    public static void main(String[] args) {
        var rnd = new Random(15);
        for (int t = 0; t < 400; t++) {
            int n = rnd.nextInt(8);
            int[] distinct = rnd.ints(1, 30).distinct().limit(n).toArray();
            int[] dup = new int[n]; for (int i = 0; i < n; i++) dup[i] = 1 + rnd.nextInt(3);
            // subsets: 2^n distinct
            List<List<Integer>> ss = subsets(distinct);
            Check.that(ss.size() == (1 << n) && normalise(ss).size() == ss.size(), "subsets");
            // subsets with duplicates: compare with brute-force set of sorted subsets
            Check.that(normalise(subsetsWithDup(dup.clone())).equals(subsetSetBrute(dup)) && subsetsWithDup(dup.clone()).size() == subsetSetBrute(dup).size(), "subsetsWithDup");
            // permutations
            List<List<Integer>> ps = permute(distinct);
            Check.that(ps.size() == fact(n) && new HashSet<>(ps).size() == ps.size(), "permute n!");
            List<List<Integer>> pu = permuteUnique(dup.clone());
            Check.that(new HashSet<>(pu).size() == pu.size() && pu.size() == uniquePermCount(dup), "permuteUnique");
            // combinations C(n, k)
            int k = n == 0 ? 0 : rnd.nextInt(n + 1);
            Check.that(combine(n, k).size() == choose(n, k), "combine");
            // combination sum (reuse allowed) vs DP count of multisets
            int[] cands = rnd.ints(2, 9).distinct().limit(1 + rnd.nextInt(4)).toArray(); int target = 1 + rnd.nextInt(20);
            List<List<Integer>> cs = combinationSum(cands, target);
            Check.that(cs.size() == countCombos(cands, target) && cs.stream().allMatch(l -> l.stream().mapToInt(i -> i).sum() == target), "combinationSum");
            // combination sum II (each used once, duplicates in input)
            int[] c2 = new int[1 + rnd.nextInt(7)]; for (int i = 0; i < c2.length; i++) c2[i] = 1 + rnd.nextInt(5);
            int t2 = 1 + rnd.nextInt(12);
            Check.that(normalise(combinationSum2(c2.clone(), t2)).equals(comboSet(c2, t2)) && combinationSum2(c2.clone(), t2).size() == comboSet(c2, t2).size(), "combinationSum2");
            // generate parentheses: Catalan numbers
            int p = rnd.nextInt(7); List<String> gp = generateParenthesis(p);
            Check.that(gp.size() == catalan(p) && gp.stream().allMatch(Backtracking::balanced), "generateParenthesis");
            // palindrome partitioning vs brute over cut masks
            String s = word(rnd, 8, 2);
            Check.that(partition(s).size() == partitionsBrute(s), "palindrome partition count");
            // word search vs brute DFS without pruning order assumptions
            char[][] board = new char[1 + rnd.nextInt(4)][1 + rnd.nextInt(4)]; for (char[] row : board) for (int j = 0; j < row.length; j++) row[j] = (char) ('a' + rnd.nextInt(3));
            String w = word(rnd, 5, 3); if (w.isEmpty()) w = "a";
            Check.that(exist(copy(board), w) == existBrute(board, w), "word search");
        }
        int[] queens = { 1, 0, 0, 2, 10, 4, 40, 92 };
        for (int n = 1; n <= 8; n++) Check.that(solveNQueens(n).size() == queens[n - 1], "N-Queens count for n=" + n);
        Check.that(letterCombinations("23").equals(List.of("ad", "ae", "af", "bd", "be", "bf", "cd", "ce", "cf")), "letterCombinations");
        Check.done("backtracking");
    }

    // ---------- Subsets: every node of the decision tree is an answer ----------
    static List<List<Integer>> subsets(int[] nums) {
        List<List<Integer>> out = new ArrayList<>();
        dfsSubsets(nums, 0, new ArrayList<>(), out);
        return out;
    }
    static void dfsSubsets(int[] nums, int start, List<Integer> path, List<List<Integer>> out) {
        out.add(new ArrayList<>(path));                    // record every partial choice
        for (int i = start; i < nums.length; i++) {
            path.add(nums[i]);                             // choose
            dfsSubsets(nums, i + 1, path, out);            // explore (only later elements: no reorderings)
            path.remove(path.size() - 1);                  // un-choose
        }
    }

    static List<List<Integer>> subsetsWithDup(int[] nums) {
        Arrays.sort(nums);                                 // duplicates become neighbours
        List<List<Integer>> out = new ArrayList<>();
        dfsDup(nums, 0, new ArrayList<>(), out);
        return out;
    }
    static void dfsDup(int[] nums, int start, List<Integer> path, List<List<Integer>> out) {
        out.add(new ArrayList<>(path));
        for (int i = start; i < nums.length; i++) {
            if (i > start && nums[i] == nums[i - 1]) continue;   // same value at the same depth → same subtree
            path.add(nums[i]);
            dfsDup(nums, i + 1, path, out);
            path.remove(path.size() - 1);
        }
    }

    // ---------- Combinations: answers are paths of a given length / sum ----------
    static List<List<Integer>> combine(int n, int k) {
        List<List<Integer>> out = new ArrayList<>();
        dfsCombine(1, n, k, new ArrayList<>(), out);
        return out;
    }
    static void dfsCombine(int start, int n, int k, List<Integer> path, List<List<Integer>> out) {
        if (path.size() == k) { out.add(new ArrayList<>(path)); return; }
        for (int i = start; i <= n - (k - path.size()) + 1; i++) {   // prune: leave room for the rest
            path.add(i);
            dfsCombine(i + 1, n, k, path, out);
            path.remove(path.size() - 1);
        }
    }

    static List<List<Integer>> combinationSum(int[] candidates, int target) {
        Arrays.sort(candidates);
        List<List<Integer>> out = new ArrayList<>();
        dfsSum(candidates, 0, target, new ArrayList<>(), out);
        return out;
    }
    static void dfsSum(int[] c, int start, int remaining, List<Integer> path, List<List<Integer>> out) {
        if (remaining == 0) { out.add(new ArrayList<>(path)); return; }
        for (int i = start; i < c.length; i++) {
            if (c[i] > remaining) break;                   // sorted: everything after is too big too
            path.add(c[i]);
            dfsSum(c, i, remaining - c[i], path, out);     // i, not i + 1: the same number may be reused
            path.remove(path.size() - 1);
        }
    }

    static List<List<Integer>> combinationSum2(int[] candidates, int target) {
        Arrays.sort(candidates);
        List<List<Integer>> out = new ArrayList<>();
        dfsSum2(candidates, 0, target, new ArrayList<>(), out);
        return out;
    }
    static void dfsSum2(int[] c, int start, int remaining, List<Integer> path, List<List<Integer>> out) {
        if (remaining == 0) { out.add(new ArrayList<>(path)); return; }
        for (int i = start; i < c.length; i++) {
            if (i > start && c[i] == c[i - 1]) continue;   // skip duplicate values at this depth
            if (c[i] > remaining) break;
            path.add(c[i]);
            dfsSum2(c, i + 1, remaining - c[i], path, out);   // i + 1: each element at most once
            path.remove(path.size() - 1);
        }
    }

    // ---------- Permutations: track what's used ----------
    static List<List<Integer>> permute(int[] nums) {
        List<List<Integer>> out = new ArrayList<>();
        dfsPerm(nums, new boolean[nums.length], new ArrayList<>(), out);
        return out;
    }
    static void dfsPerm(int[] nums, boolean[] used, List<Integer> path, List<List<Integer>> out) {
        if (path.size() == nums.length) { out.add(new ArrayList<>(path)); return; }
        for (int i = 0; i < nums.length; i++) {
            if (used[i]) continue;
            used[i] = true; path.add(nums[i]);
            dfsPerm(nums, used, path, out);
            used[i] = false; path.remove(path.size() - 1);
        }
    }

    static List<List<Integer>> permuteUnique(int[] nums) {
        Arrays.sort(nums);
        List<List<Integer>> out = new ArrayList<>();
        dfsPermU(nums, new boolean[nums.length], new ArrayList<>(), out);
        return out;
    }
    static void dfsPermU(int[] nums, boolean[] used, List<Integer> path, List<List<Integer>> out) {
        if (path.size() == nums.length) { out.add(new ArrayList<>(path)); return; }
        for (int i = 0; i < nums.length; i++) {
            if (used[i]) continue;
            if (i > 0 && nums[i] == nums[i - 1] && !used[i - 1]) continue;   // use equal values in order only
            used[i] = true; path.add(nums[i]);
            dfsPermU(nums, used, path, out);
            used[i] = false; path.remove(path.size() - 1);
        }
    }

    // ---------- Building strings ----------
    static List<String> generateParenthesis(int n) {
        List<String> out = new ArrayList<>();
        dfsParen(n, 0, 0, new StringBuilder(), out);
        return out;
    }
    static void dfsParen(int n, int open, int close, StringBuilder sb, List<String> out) {
        if (sb.length() == 2 * n) { out.add(sb.toString()); return; }
        if (open < n)     { sb.append('('); dfsParen(n, open + 1, close, sb, out); sb.deleteCharAt(sb.length() - 1); }
        if (close < open) { sb.append(')'); dfsParen(n, open, close + 1, sb, out); sb.deleteCharAt(sb.length() - 1); }
    }

    static final String[] KEYS = { "", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz" };
    static List<String> letterCombinations(String digits) {
        List<String> out = new ArrayList<>();
        if (!digits.isEmpty()) dfsLetters(digits, 0, new StringBuilder(), out);
        return out;
    }
    static void dfsLetters(String d, int i, StringBuilder sb, List<String> out) {
        if (i == d.length()) { out.add(sb.toString()); return; }
        for (char c : KEYS[d.charAt(i) - '0'].toCharArray()) {
            sb.append(c);
            dfsLetters(d, i + 1, sb, out);
            sb.deleteCharAt(sb.length() - 1);
        }
    }

    static List<List<String>> partition(String s) {
        List<List<String>> out = new ArrayList<>();
        dfsPart(s, 0, new ArrayList<>(), out);
        return out;
    }
    static void dfsPart(String s, int start, List<String> path, List<List<String>> out) {
        if (start == s.length()) { out.add(new ArrayList<>(path)); return; }
        for (int end = start + 1; end <= s.length(); end++) {
            if (!isPal(s, start, end - 1)) continue;        // prune: only palindromic pieces
            path.add(s.substring(start, end));
            dfsPart(s, end, path, out);
            path.remove(path.size() - 1);
        }
    }
    static boolean isPal(String s, int i, int j) { while (i < j) if (s.charAt(i++) != s.charAt(j--)) return false; return true; }

    // ---------- Grids and constraints ----------
    static boolean exist(char[][] board, String word) {
        for (int r = 0; r < board.length; r++)
            for (int c = 0; c < board[0].length; c++)
                if (search(board, word, 0, r, c)) return true;
        return false;
    }
    static boolean search(char[][] b, String w, int i, int r, int c) {
        if (i == w.length()) return true;
        if (r < 0 || c < 0 || r >= b.length || c >= b[0].length || b[r][c] != w.charAt(i)) return false;
        char saved = b[r][c];
        b[r][c] = '#';                                     // choose: mark as used on this path
        boolean found = search(b, w, i + 1, r + 1, c) || search(b, w, i + 1, r - 1, c)
                     || search(b, w, i + 1, r, c + 1) || search(b, w, i + 1, r, c - 1);
        b[r][c] = saved;                                   // un-choose: restore for other paths
        return found;
    }

    static List<List<String>> solveNQueens(int n) {
        List<List<String>> out = new ArrayList<>();
        placeQueens(n, 0, new int[n], new boolean[n], new boolean[2 * n], new boolean[2 * n], out);
        return out;
    }
    static void placeQueens(int n, int row, int[] colOf, boolean[] cols, boolean[] diag, boolean[] anti, List<List<String>> out) {
        if (row == n) { out.add(render(colOf)); return; }
        for (int c = 0; c < n; c++) {
            if (cols[c] || diag[row - c + n] || anti[row + c]) continue;     // attacked: prune
            cols[c] = diag[row - c + n] = anti[row + c] = true; colOf[row] = c;
            placeQueens(n, row + 1, colOf, cols, diag, anti, out);
            cols[c] = diag[row - c + n] = anti[row + c] = false;
        }
    }
    static List<String> render(int[] colOf) { List<String> b = new ArrayList<>(); for (int c : colOf) { char[] row = new char[colOf.length]; Arrays.fill(row, '.'); row[c] = 'Q'; b.add(new String(row)); } return b; }

    // ---------- testing helpers ----------
    static Set<List<Integer>> normalise(List<List<Integer>> l) { Set<List<Integer>> s = new HashSet<>(); for (List<Integer> x : l) { List<Integer> c = new ArrayList<>(x); Collections.sort(c); s.add(c); } return s; }
    static Set<List<Integer>> subsetSetBrute(int[] a) { Set<List<Integer>> s = new HashSet<>(); for (int m = 0; m < (1 << a.length); m++) { List<Integer> l = new ArrayList<>(); for (int i = 0; i < a.length; i++) if ((m >> i & 1) == 1) l.add(a[i]); Collections.sort(l); s.add(l); } return s; }
    static Set<List<Integer>> comboSet(int[] a, int t) { Set<List<Integer>> s = new HashSet<>(); for (int m = 0; m < (1 << a.length); m++) { List<Integer> l = new ArrayList<>(); int sum = 0; for (int i = 0; i < a.length; i++) if ((m >> i & 1) == 1) { l.add(a[i]); sum += a[i]; } if (sum == t) { Collections.sort(l); s.add(l); } } return s; }
    static long fact(int n) { long f = 1; for (int i = 2; i <= n; i++) f *= i; return f; }
    static long choose(int n, int k) { long c = 1; for (int i = 0; i < k; i++) c = c * (n - i) / (i + 1); return c; }
    static long uniquePermCount(int[] a) { Map<Integer, Integer> f = new HashMap<>(); for (int x : a) f.merge(x, 1, Integer::sum); long r = fact(a.length); for (int v : f.values()) r /= fact(v); return r; }
    static int countCombos(int[] c, int target) { int[] ways = new int[target + 1]; ways[0] = 1; for (int x : c) for (int s = x; s <= target; s++) ways[s] += ways[s - x]; return ways[target]; }
    static long catalan(int n) { long c = 1; for (int i = 0; i < n; i++) c = c * 2 * (2 * i + 1) / (i + 2); return c; }
    static boolean balanced(String s) { int d = 0; for (char c : s.toCharArray()) { d += c == '(' ? 1 : -1; if (d < 0) return false; } return d == 0; }
    static String word(Random r, int max, int alpha) { StringBuilder sb = new StringBuilder(); int n = r.nextInt(max + 1); for (int i = 0; i < n; i++) sb.append((char) ('a' + r.nextInt(alpha))); return sb.toString(); }
    static int partitionsBrute(String s) { int n = s.length(); if (n == 0) return 1; int count = 0; for (int m = 0; m < (1 << (n - 1)); m++) { int start = 0; boolean ok = true; for (int i = 0; i < n && ok; i++) if (i == n - 1 || (m >> i & 1) == 1) { if (!isPal(s, start, i)) ok = false; start = i + 1; } if (ok) count++; } return count; }
    static char[][] copy(char[][] b) { char[][] c = new char[b.length][]; for (int i = 0; i < b.length; i++) c[i] = b[i].clone(); return c; }
    static boolean existBrute(char[][] b, String w) { for (int r = 0; r < b.length; r++) for (int c = 0; c < b[0].length; c++) if (walk(b, w, 0, r, c, new boolean[b.length][b[0].length])) return true; return false; }
    static boolean walk(char[][] b, String w, int i, int r, int c, boolean[][] used) { if (r < 0 || c < 0 || r >= b.length || c >= b[0].length || used[r][c] || b[r][c] != w.charAt(i)) return false; if (i == w.length() - 1) return true; used[r][c] = true;
        boolean f = walk(b, w, i + 1, r + 1, c, used) || walk(b, w, i + 1, r - 1, c, used) || walk(b, w, i + 1, r, c + 1, used) || walk(b, w, i + 1, r, c - 1, used); used[r][c] = false; return f; }
}

final class Check {
    private static int passed;
    static void that(boolean cond, String what) { if (!cond) throw new AssertionError("FAILED: " + what); passed++; }
    static void done(String name) { System.out.println("✓ " + name + ": " + passed + " checks passed"); }
}
