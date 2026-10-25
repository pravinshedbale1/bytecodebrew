export default [
  {
    slug: 'subsets', title: 'Subsets', level: 'Medium',
    summary: 'Return every subset (the power set) of an array of distinct values, in any order.',
    method: 'subsets', params: [['int[]', 'nums']], returns: 'List<List<Integer>>', check: 'any-order-deep',
    tests: [
      { in: [[1, 2, 3]], out: [[], [1], [2], [1, 2], [3], [1, 3], [2, 3], [1, 2, 3]] },
      { in: [[0]], out: [[], [0]] },
      { in: [[5, -1]] },
      { in: [[4, 1, 0, 9]] },
    ],
    ref: `class Solution {
    public List<List<Integer>> subsets(int[] nums) {
        List<List<Integer>> out = new ArrayList<>();
        go(nums, 0, new ArrayList<>(), out);
        return out;
    }
    private void go(int[] a, int start, List<Integer> path, List<List<Integer>> out) {
        out.add(new ArrayList<>(path));
        for (int i = start; i < a.length; i++) { path.add(a[i]); go(a, i + 1, path, out); path.remove(path.size() - 1); }
    }
}`,
  },
  {
    slug: 'combinations', title: 'Combinations', level: 'Medium',
    summary: 'Return every combination of k numbers chosen from 1..n, in any order.',
    method: 'combine', params: [['int', 'n'], ['int', 'k']], returns: 'List<List<Integer>>', check: 'any-order-deep',
    tests: [
      { in: [4, 2], out: [[1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]] },
      { in: [1, 1], out: [[1]] },
      { in: [5, 5] },
      { in: [5, 3] },
    ],
    ref: `class Solution {
    public List<List<Integer>> combine(int n, int k) {
        List<List<Integer>> out = new ArrayList<>();
        go(n, k, 1, new ArrayList<>(), out);
        return out;
    }
    private void go(int n, int k, int start, List<Integer> path, List<List<Integer>> out) {
        if (path.size() == k) { out.add(new ArrayList<>(path)); return; }
        for (int i = start; i <= n - (k - path.size()) + 1; i++) { path.add(i); go(n, k, i + 1, path, out); path.remove(path.size() - 1); }
    }
}`,
  },
  {
    slug: 'permutations', title: 'Permutations', level: 'Medium',
    summary: 'Return every permutation of an array of distinct values. The permutations may be listed in any order.',
    method: 'permute', params: [['int[]', 'nums']], returns: 'List<List<Integer>>', check: 'any-order',
    tests: [
      { in: [[1, 2, 3]], out: [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]] },
      { in: [[0, 1]], out: [[0, 1], [1, 0]] },
      { in: [[1]], out: [[1]] },
      { in: [[-1, 4, 2, 7]] },
    ],
    ref: `class Solution {
    public List<List<Integer>> permute(int[] nums) {
        List<List<Integer>> out = new ArrayList<>();
        go(nums, new boolean[nums.length], new ArrayList<>(), out);
        return out;
    }
    private void go(int[] a, boolean[] used, List<Integer> path, List<List<Integer>> out) {
        if (path.size() == a.length) { out.add(new ArrayList<>(path)); return; }
        for (int i = 0; i < a.length; i++) if (!used[i]) { used[i] = true; path.add(a[i]); go(a, used, path, out); path.remove(path.size() - 1); used[i] = false; }
    }
}`,
  },
  {
    slug: 'combination-sum', title: 'Combination Sum', level: 'Medium',
    summary: 'Return every unique combination of the distinct candidates (each usable any number of times) that sums to target. Any order.',
    method: 'combinationSum', params: [['int[]', 'candidates'], ['int', 'target']], returns: 'List<List<Integer>>', check: 'any-order-deep',
    tests: [
      { in: [[2, 3, 6, 7], 7], out: [[2, 2, 3], [7]] },
      { in: [[2, 3, 5], 8], out: [[2, 2, 2, 2], [2, 3, 3], [3, 5]] },
      { in: [[2], 1], out: [] },
      { in: [[7, 3, 2], 18] },
    ],
    ref: `class Solution {
    public List<List<Integer>> combinationSum(int[] c, int target) {
        List<List<Integer>> out = new ArrayList<>();
        go(c, target, 0, new ArrayList<>(), out);
        return out;
    }
    private void go(int[] c, int left, int start, List<Integer> path, List<List<Integer>> out) {
        if (left == 0) { out.add(new ArrayList<>(path)); return; }
        for (int i = start; i < c.length; i++) if (c[i] <= left) { path.add(c[i]); go(c, left - c[i], i, path, out); path.remove(path.size() - 1); }
    }
}`,
  },
  {
    slug: 'letter-combinations-of-a-phone-number', title: 'Letter Combinations of a Phone Number', level: 'Medium',
    summary: 'Given digits 2–9, return every letter string they could spell on a phone keypad, in any order ([] for an empty input).',
    method: 'letterCombinations', params: [['String', 'digits']], returns: 'List<String>', check: 'any-order',
    tests: [
      { in: ['23'], out: ['ad', 'ae', 'af', 'bd', 'be', 'bf', 'cd', 'ce', 'cf'] },
      { in: [''], out: [] },
      { in: ['2'], out: ['a', 'b', 'c'] },
      { in: ['79'] },
    ],
    ref: `class Solution {
    private static final String[] KEYS = { "", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz" };
    public List<String> letterCombinations(String digits) {
        List<String> out = new ArrayList<>();
        if (!digits.isEmpty()) go(digits, 0, new StringBuilder(), out);
        return out;
    }
    private void go(String d, int i, StringBuilder sb, List<String> out) {
        if (i == d.length()) { out.add(sb.toString()); return; }
        for (char c : KEYS[d.charAt(i) - '0'].toCharArray()) { sb.append(c); go(d, i + 1, sb, out); sb.deleteCharAt(sb.length() - 1); }
    }
}`,
  },
  {
    slug: 'generate-parentheses', title: 'Generate Parentheses', level: 'Medium',
    summary: 'Return every well-formed string of n pairs of parentheses, in any order.',
    method: 'generateParenthesis', params: [['int', 'n']], returns: 'List<String>', check: 'any-order',
    tests: [
      { in: [3], out: ['((()))', '(()())', '(())()', '()(())', '()()()'] },
      { in: [1], out: ['()'] },
      { in: [2] },
      { in: [4] },
    ],
    ref: `class Solution {
    public List<String> generateParenthesis(int n) {
        List<String> out = new ArrayList<>();
        go(n, 0, 0, new StringBuilder(), out);
        return out;
    }
    private void go(int n, int open, int close, StringBuilder sb, List<String> out) {
        if (sb.length() == 2 * n) { out.add(sb.toString()); return; }
        if (open < n) { sb.append('('); go(n, open + 1, close, sb, out); sb.deleteCharAt(sb.length() - 1); }
        if (close < open) { sb.append(')'); go(n, open, close + 1, sb, out); sb.deleteCharAt(sb.length() - 1); }
    }
}`,
  },
  {
    slug: 'subsets-ii', title: 'Subsets II', level: 'Medium',
    summary: 'The array may contain duplicates. Return every distinct subset, in any order.',
    method: 'subsetsWithDup', params: [['int[]', 'nums']], returns: 'List<List<Integer>>', check: 'any-order-deep',
    tests: [
      { in: [[1, 2, 2]], out: [[], [1], [1, 2], [1, 2, 2], [2], [2, 2]] },
      { in: [[0]], out: [[], [0]] },
      { in: [[4, 4, 4, 1, 4]] },
      { in: [[3, 1, 2]] },
    ],
    ref: `class Solution {
    public List<List<Integer>> subsetsWithDup(int[] nums) {
        Arrays.sort(nums);
        List<List<Integer>> out = new ArrayList<>();
        go(nums, 0, new ArrayList<>(), out);
        return out;
    }
    private void go(int[] a, int start, List<Integer> path, List<List<Integer>> out) {
        out.add(new ArrayList<>(path));
        for (int i = start; i < a.length; i++) {
            if (i > start && a[i] == a[i - 1]) continue;
            path.add(a[i]); go(a, i + 1, path, out); path.remove(path.size() - 1);
        }
    }
}`,
  },
  {
    slug: 'combination-sum-ii', title: 'Combination Sum II', level: 'Medium',
    summary: 'Each candidate (duplicates possible) may be used once. Return every distinct combination summing to target, in any order.',
    method: 'combinationSum2', params: [['int[]', 'candidates'], ['int', 'target']], returns: 'List<List<Integer>>', check: 'any-order-deep',
    tests: [
      { in: [[10, 1, 2, 7, 6, 1, 5], 8], out: [[1, 1, 6], [1, 2, 5], [1, 7], [2, 6]] },
      { in: [[2, 5, 2, 1, 2], 5], out: [[1, 2, 2], [5]] },
      { in: [[1], 2] },
      { in: [[1, 1, 1, 1, 1], 3] },
    ],
    ref: `class Solution {
    public List<List<Integer>> combinationSum2(int[] c, int target) {
        Arrays.sort(c);
        List<List<Integer>> out = new ArrayList<>();
        go(c, target, 0, new ArrayList<>(), out);
        return out;
    }
    private void go(int[] c, int left, int start, List<Integer> path, List<List<Integer>> out) {
        if (left == 0) { out.add(new ArrayList<>(path)); return; }
        for (int i = start; i < c.length && c[i] <= left; i++) {
            if (i > start && c[i] == c[i - 1]) continue;
            path.add(c[i]); go(c, left - c[i], i + 1, path, out); path.remove(path.size() - 1);
        }
    }
}`,
  },
  {
    slug: 'permutations-ii', title: 'Permutations II', level: 'Medium',
    summary: 'The array may contain duplicates. Return every distinct permutation, in any order.',
    method: 'permuteUnique', params: [['int[]', 'nums']], returns: 'List<List<Integer>>', check: 'any-order',
    tests: [
      { in: [[1, 1, 2]], out: [[1, 1, 2], [1, 2, 1], [2, 1, 1]] },
      { in: [[1, 2, 3]], out: [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]] },
      { in: [[2, 2, 2]] },
      { in: [[3, 3, 0, 3]] },
    ],
    ref: `class Solution {
    public List<List<Integer>> permuteUnique(int[] nums) {
        Arrays.sort(nums);
        List<List<Integer>> out = new ArrayList<>();
        go(nums, new boolean[nums.length], new ArrayList<>(), out);
        return out;
    }
    private void go(int[] a, boolean[] used, List<Integer> path, List<List<Integer>> out) {
        if (path.size() == a.length) { out.add(new ArrayList<>(path)); return; }
        for (int i = 0; i < a.length; i++) {
            if (used[i] || (i > 0 && a[i] == a[i - 1] && !used[i - 1])) continue;
            used[i] = true; path.add(a[i]); go(a, used, path, out); path.remove(path.size() - 1); used[i] = false;
        }
    }
}`,
  },
  {
    slug: 'palindrome-partitioning', title: 'Palindrome Partitioning', level: 'Medium',
    summary: 'Split s into pieces that are all palindromes; return every such split. The splits may be in any order.',
    method: 'partition', params: [['String', 's']], returns: 'List<List<String>>', check: 'any-order',
    tests: [
      { in: ['aab'], out: [['a', 'a', 'b'], ['aa', 'b']] },
      { in: ['a'], out: [['a']] },
      { in: ['abba'] },
      { in: ['racecar'] },
    ],
    ref: `class Solution {
    public List<List<String>> partition(String s) {
        List<List<String>> out = new ArrayList<>();
        go(s, 0, new ArrayList<>(), out);
        return out;
    }
    private void go(String s, int start, List<String> path, List<List<String>> out) {
        if (start == s.length()) { out.add(new ArrayList<>(path)); return; }
        for (int end = start + 1; end <= s.length(); end++) if (pal(s, start, end - 1)) { path.add(s.substring(start, end)); go(s, end, path, out); path.remove(path.size() - 1); }
    }
    private boolean pal(String s, int i, int j) { while (i < j) if (s.charAt(i++) != s.charAt(j--)) return false; return true; }
}`,
  },
  {
    slug: 'word-search', title: 'Word Search', level: 'Medium',
    summary: 'Return whether word can be traced on the letter grid through horizontally or vertically adjacent cells, using each cell at most once.',
    method: 'exist', params: [['char[][]', 'board'], ['String', 'word']], returns: 'boolean',
    tests: [
      { in: [[['A', 'B', 'C', 'E'], ['S', 'F', 'C', 'S'], ['A', 'D', 'E', 'E']], 'ABCCED'], out: true },
      { in: [[['A', 'B', 'C', 'E'], ['S', 'F', 'C', 'S'], ['A', 'D', 'E', 'E']], 'SEE'], out: true },
      { in: [[['A', 'B', 'C', 'E'], ['S', 'F', 'C', 'S'], ['A', 'D', 'E', 'E']], 'ABCB'], out: false },
      { in: [[['a']], 'a'] },
      { in: [[['a', 'a']], 'aaa'] },
    ],
    ref: `class Solution {
    public boolean exist(char[][] board, String word) {
        for (int i = 0; i < board.length; i++) for (int j = 0; j < board[0].length; j++) if (dfs(board, word, i, j, 0)) return true;
        return false;
    }
    private boolean dfs(char[][] b, String w, int i, int j, int k) {
        if (k == w.length()) return true;
        if (i < 0 || j < 0 || i >= b.length || j >= b[0].length || b[i][j] != w.charAt(k)) return false;
        char c = b[i][j]; b[i][j] = '#';
        boolean found = dfs(b, w, i + 1, j, k + 1) || dfs(b, w, i - 1, j, k + 1) || dfs(b, w, i, j + 1, k + 1) || dfs(b, w, i, j - 1, k + 1);
        b[i][j] = c;
        return found;
    }
}`,
  },
  {
    slug: 'n-queens', title: 'N-Queens', level: 'Hard',
    summary: 'Return every way to place n queens on an n×n board so none attack another. Each board is a list of rows using "Q" and "."; the boards may be in any order.',
    method: 'solveNQueens', params: [['int', 'n']], returns: 'List<List<String>>', check: 'any-order',
    tests: [
      { in: [4], out: [['.Q..', '...Q', 'Q...', '..Q.'], ['..Q.', 'Q...', '...Q', '.Q..']] },
      { in: [1], out: [['Q']] },
      { in: [3] },
      { in: [5] },
    ],
    ref: `class Solution {
    public List<List<String>> solveNQueens(int n) {
        List<List<String>> out = new ArrayList<>();
        go(n, 0, new int[n], new boolean[n], new boolean[2 * n], new boolean[2 * n], out);
        return out;
    }
    private void go(int n, int r, int[] col, boolean[] cols, boolean[] d1, boolean[] d2, List<List<String>> out) {
        if (r == n) {
            List<String> board = new ArrayList<>();
            for (int i = 0; i < n; i++) { char[] row = new char[n]; Arrays.fill(row, '.'); row[col[i]] = 'Q'; board.add(new String(row)); }
            out.add(board); return;
        }
        for (int c = 0; c < n; c++) {
            if (cols[c] || d1[r + c] || d2[r - c + n]) continue;
            cols[c] = d1[r + c] = d2[r - c + n] = true; col[r] = c;
            go(n, r + 1, col, cols, d1, d2, out);
            cols[c] = d1[r + c] = d2[r - c + n] = false;
        }
    }
}`,
  },
  {
    slug: 'sudoku-solver', title: 'Sudoku Solver', level: 'Hard',
    summary: 'Fill the empty cells (".") so every row, column and 3×3 box holds 1–9 exactly once. The puzzle has one solution. The judge prints the board after your call.',
    method: 'solveSudoku', params: [['char[][]', 'board']], returns: 'void', output: 0,
    tests: [
      { in: [[['5', '3', '.', '.', '7', '.', '.', '.', '.'], ['6', '.', '.', '1', '9', '5', '.', '.', '.'], ['.', '9', '8', '.', '.', '.', '.', '6', '.'], ['8', '.', '.', '.', '6', '.', '.', '.', '3'], ['4', '.', '.', '8', '.', '3', '.', '.', '1'], ['7', '.', '.', '.', '2', '.', '.', '.', '6'], ['.', '6', '.', '.', '.', '.', '2', '8', '.'], ['.', '.', '.', '4', '1', '9', '.', '.', '5'], ['.', '.', '.', '.', '8', '.', '.', '7', '9']]], out: [['5', '3', '4', '6', '7', '8', '9', '1', '2'], ['6', '7', '2', '1', '9', '5', '3', '4', '8'], ['1', '9', '8', '3', '4', '2', '5', '6', '7'], ['8', '5', '9', '7', '6', '1', '4', '2', '3'], ['4', '2', '6', '8', '5', '3', '7', '9', '1'], ['7', '1', '3', '9', '2', '4', '8', '5', '6'], ['9', '6', '1', '5', '3', '7', '2', '8', '4'], ['2', '8', '7', '4', '1', '9', '6', '3', '5'], ['3', '4', '5', '2', '8', '6', '1', '7', '9']] },
      { in: [[['.', '.', '9', '7', '4', '8', '.', '.', '.'], ['7', '.', '.', '.', '.', '.', '.', '.', '.'], ['.', '2', '.', '1', '.', '9', '.', '.', '.'], ['.', '.', '7', '.', '.', '.', '2', '4', '.'], ['.', '6', '4', '.', '1', '.', '5', '9', '.'], ['.', '9', '8', '.', '.', '.', '3', '.', '.'], ['.', '.', '.', '8', '.', '3', '.', '2', '.'], ['.', '.', '.', '.', '.', '.', '.', '.', '6'], ['.', '.', '.', '2', '7', '5', '9', '.', '.']]] },
    ],
    ref: `class Solution {
    public void solveSudoku(char[][] board) { solve(board); }
    private boolean solve(char[][] b) {
        for (int r = 0; r < 9; r++) for (int c = 0; c < 9; c++) {
            if (b[r][c] != '.') continue;
            for (char d = '1'; d <= '9'; d++) if (ok(b, r, c, d)) { b[r][c] = d; if (solve(b)) return true; b[r][c] = '.'; }
            return false;
        }
        return true;
    }
    private boolean ok(char[][] b, int r, int c, char d) {
        for (int i = 0; i < 9; i++) if (b[r][i] == d || b[i][c] == d || b[3 * (r / 3) + i / 3][3 * (c / 3) + i % 3] == d) return false;
        return true;
    }
}`,
  },
  {
    slug: 'sum-of-all-subset-xor-totals', title: 'Sum of All Subset XOR Totals', level: 'Easy',
    summary: 'The XOR total of a subset is the XOR of its elements (0 for the empty subset). Return the sum of the XOR totals of every subset of nums.',
    method: 'subsetXORSum', params: [['int[]', 'nums']], returns: 'int',
    tests: [
      { in: [[1, 3]], out: 6 },
      { in: [[5, 1, 6]], out: 28 },
      { in: [[3, 4, 5, 6, 7, 8]], out: 480 },
      { in: [[1]] },
      { in: [[20, 20]] },
      { in: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]] },
    ],
    ref: `class Solution {
    public int subsetXORSum(int[] nums) {
        int or = 0;
        for (int x : nums) or |= x;
        return or << (nums.length - 1);
    }
}`,
  },
  {
    slug: 'matchsticks-to-square', title: 'Matchsticks to Square', level: 'Medium',
    summary: 'Return true if all the matchsticks can be used, each exactly once and unbroken, to form a square.',
    method: 'makesquare', params: [['int[]', 'matchsticks']], returns: 'boolean',
    tests: [
      { in: [[1, 1, 2, 2, 2]], out: true },
      { in: [[3, 3, 3, 3, 4]], out: false },
      { in: [[5, 5, 5, 5, 4, 4, 4, 4, 3, 3, 3, 3]] },
      { in: [[1, 1, 1]] },
      { in: [[100000000, 100000000, 100000000, 100000000]] },
      { in: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 5, 4, 3, 2, 1]] },
      { in: [[5969561, 8742425, 2513572, 3352059, 9084275, 2194427, 1017540, 2324577, 6810719, 8936380, 7868365, 2755770, 9954463, 9912280, 4713511]] },
      { in: [[10, 6, 5, 5, 5, 3, 3, 3, 2, 2, 2, 2]] },
    ],
    ref: `class Solution {
    public boolean makesquare(int[] matchsticks) {
        long sum = 0;
        for (int m : matchsticks) sum += m;
        if (matchsticks.length < 4 || sum % 4 != 0) return false;
        long side = sum / 4;
        Integer[] sticks = new Integer[matchsticks.length];
        for (int i = 0; i < sticks.length; i++) sticks[i] = matchsticks[i];
        Arrays.sort(sticks, Collections.reverseOrder());
        if (sticks[0] > side) return false;
        return place(sticks, 0, new long[4], side);
    }
    private boolean place(Integer[] s, int i, long[] sides, long side) {
        if (i == s.length) return true;
        for (int k = 0; k < 4; k++) {
            if (sides[k] + s[i] > side) continue;
            if (k > 0 && sides[k] == sides[k - 1]) continue;
            sides[k] += s[i];
            if (place(s, i + 1, sides, side)) return true;
            sides[k] -= s[i];
        }
        return false;
    }
}`,
  },
  {
    slug: 'n-queens-ii', title: 'N-Queens II', level: 'Hard',
    summary: 'Return the number of ways to place n queens on an n × n chessboard so that no two attack each other.',
    method: 'totalNQueens', params: [['int', 'n']], returns: 'int',
    tests: [
      { in: [4], out: 2 },
      { in: [1], out: 1 },
      { in: [2] },
      { in: [3] },
      { in: [6] },
      { in: [8] },
      { in: [9] },
    ],
    ref: `class Solution {
    public int totalNQueens(int n) { return count(n, 0, 0, 0, 0); }
    private int count(int n, int row, int cols, int d1, int d2) {
        if (row == n) return 1;
        int total = 0, free = ~(cols | d1 | d2) & ((1 << n) - 1);
        while (free != 0) {
            int bit = free & -free;
            free -= bit;
            total += count(n, row + 1, cols | bit, (d1 | bit) << 1, (d2 | bit) >> 1);
        }
        return total;
    }
}`,
  },
  {
    slug: 'word-break-ii', title: 'Word Break II', level: 'Hard',
    summary: 'Insert spaces into s so that every piece is a dictionary word, and return all such sentences in any order. Words may be reused.',
    method: 'wordBreak', params: [['String', 's'], ['List<String>', 'wordDict']], returns: 'List<String>', check: 'any-order',
    tests: [
      { in: ['catsanddog', ['cat', 'cats', 'and', 'sand', 'dog']], out: ['cats and dog', 'cat sand dog'] },
      { in: ['pineapplepenapple', ['apple', 'pen', 'applepen', 'pine', 'pineapple']], out: ['pine apple pen apple', 'pineapple pen apple', 'pine applepen apple'] },
      { in: ['catsandog', ['cats', 'dog', 'sand', 'and', 'cat']], out: [] },
      { in: ['a', ['a']] },
      { in: ['aaaa', ['a', 'aa']] },
      { in: ['abcd', ['a', 'abc', 'b', 'cd']] },
      { in: ['aaaaaaaaaaaaaaaaaaab', ['a', 'aa', 'aaa', 'aaaa', 'aaaaa']] },
    ],
    ref: `class Solution {
    public List<String> wordBreak(String s, List<String> wordDict) {
        return go(s, 0, new HashSet<>(wordDict), new HashMap<>());
    }
    private List<String> go(String s, int i, Set<String> dict, Map<Integer, List<String>> memo) {
        if (memo.containsKey(i)) return memo.get(i);
        List<String> out = new ArrayList<>();
        if (i == s.length()) out.add("");
        for (int j = i + 1; j <= s.length(); j++) {
            String w = s.substring(i, j);
            if (!dict.contains(w)) continue;
            for (String rest : go(s, j, dict, memo)) out.add(rest.isEmpty() ? w : w + " " + rest);
        }
        memo.put(i, out);
        return out;
    }
}`,
  },
];
