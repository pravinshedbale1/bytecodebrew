const r = String.raw;

export default {
  'longest-common-subsequence': {
    pattern: 'Two-string DP: dp[i][j] over prefixes (match → diagonal + 1, else max of dropping one)',
    approaches: [
      {
        level: 'Brute force', name: 'Recursion on the first characters',
        idea: 'Compare the first characters: if they match, they can both be part of the subsequence; if not, the answer drops one of them.',
        steps: [
          '`lcs(i, j)`: 0 if either string is used up.',
          'If `a[i] == b[j]`, return `1 + lcs(i + 1, j + 1)`.',
          'Otherwise return `max(lcs(i + 1, j), lcs(i, j + 1))`.',
        ],
        time: 'O(2^(m+n))', space: 'O(m + n)',
        why: 'Mismatches branch in two, and the same `(i, j)` pairs are reached many times.',
        code: {
          java: r`class Solution {
    public int longestCommonSubsequence(String text1, String text2) {
        return lcs(text1, text2, 0, 0);
    }

    private int lcs(String a, String b, int i, int j) {
        if (i == a.length() || j == b.length()) return 0;
        if (a.charAt(i) == b.charAt(j)) return 1 + lcs(a, b, i + 1, j + 1);
        return Math.max(lcs(a, b, i + 1, j), lcs(a, b, i, j + 1));
    }
}`,
          cpp: r`class Solution {
    int lcs(const string& a, const string& b, size_t i, size_t j) {
        if (i == a.size() || j == b.size()) return 0;
        if (a[i] == b[j]) return 1 + lcs(a, b, i + 1, j + 1);
        return max(lcs(a, b, i + 1, j), lcs(a, b, i, j + 1));
    }
public:
    int longestCommonSubsequence(string text1, string text2) {
        return lcs(text1, text2, 0, 0);
    }
};`,
          python: r`class Solution:
    def longestCommonSubsequence(self, text1: str, text2: str) -> int:
        def lcs(i, j):
            if i == len(text1) or j == len(text2):
                return 0
            if text1[i] == text2[j]:
                return 1 + lcs(i + 1, j + 1)
            return max(lcs(i + 1, j), lcs(i, j + 1))
        return lcs(0, 0)`,
          javascript: r`var longestCommonSubsequence = function(text1, text2) {
    const lcs = (i, j) => {
        if (i === text1.length || j === text2.length) return 0;
        if (text1[i] === text2[j]) return 1 + lcs(i + 1, j + 1);
        return Math.max(lcs(i + 1, j), lcs(i, j + 1));
    };
    return lcs(0, 0);
};`,
        },
      },
      {
        level: 'Better', name: '2-D table over prefixes',
        idea: '`dp[i][j]` = LCS length of the first `i` characters of `a` and the first `j` of `b`. A matching last character extends the diagonal; otherwise drop the last character of one string.',
        steps: [
          'Row 0 and column 0 are 0 (an empty prefix).',
          'If `a[i − 1] == b[j − 1]`: `dp[i][j] = dp[i − 1][j − 1] + 1`; else `max(dp[i − 1][j], dp[i][j − 1])`.',
          'Return `dp[m][n]`.',
        ],
        time: 'O(m·n)', space: 'O(m·n)',
        why: 'Every pair of prefix lengths is computed once in O(1).',
        code: {
          java: r`class Solution {
    public int longestCommonSubsequence(String text1, String text2) {
        int m = text1.length(), n = text2.length();
        int[][] dp = new int[m + 1][n + 1];
        for (int i = 1; i <= m; i++)
            for (int j = 1; j <= n; j++)
                dp[i][j] = text1.charAt(i - 1) == text2.charAt(j - 1) ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
        return dp[m][n];
    }
}`,
          cpp: r`class Solution {
public:
    int longestCommonSubsequence(string text1, string text2) {
        int m = text1.size(), n = text2.size();
        vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));
        for (int i = 1; i <= m; i++)
            for (int j = 1; j <= n; j++)
                dp[i][j] = text1[i - 1] == text2[j - 1] ? dp[i - 1][j - 1] + 1 : max(dp[i - 1][j], dp[i][j - 1]);
        return dp[m][n];
    }
};`,
          python: r`class Solution:
    def longestCommonSubsequence(self, text1: str, text2: str) -> int:
        m, n = len(text1), len(text2)
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if text1[i - 1] == text2[j - 1]:
                    dp[i][j] = dp[i - 1][j - 1] + 1
                else:
                    dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
        return dp[m][n]`,
          javascript: r`var longestCommonSubsequence = function(text1, text2) {
    const m = text1.length, n = text2.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 1; i <= m; i++)
        for (let j = 1; j <= n; j++)
            dp[i][j] = text1[i - 1] === text2[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    return dp[m][n];
};`,
        },
      },
      {
        level: 'Optimal', name: 'Two rows',
        idea: 'Row `i` only reads row `i − 1`, so keep just the previous and the current row (sized by the shorter string).',
        steps: [
          'Keep `prev` and `cur` of length n + 1.',
          'For each `i`, fill `cur[j]` with the same rule using `prev[j − 1]`, `prev[j]` and `cur[j − 1]`.',
          'Swap the rows; return `prev[n]` at the end.',
        ],
        time: 'O(m·n)', space: 'O(min(m, n))',
        why: 'Same work, two rows of memory (swap the strings so the rows use the shorter one).',
        code: {
          java: r`class Solution {
    public int longestCommonSubsequence(String text1, String text2) {
        if (text2.length() > text1.length()) { String t = text1; text1 = text2; text2 = t; }
        int m = text1.length(), n = text2.length();
        int[] prev = new int[n + 1], cur = new int[n + 1];
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++)
                cur[j] = text1.charAt(i - 1) == text2.charAt(j - 1) ? prev[j - 1] + 1 : Math.max(prev[j], cur[j - 1]);
            int[] t = prev; prev = cur; cur = t;
        }
        return prev[n];
    }
}`,
          cpp: r`class Solution {
public:
    int longestCommonSubsequence(string text1, string text2) {
        if (text2.size() > text1.size()) swap(text1, text2);
        int m = text1.size(), n = text2.size();
        vector<int> prev(n + 1, 0), cur(n + 1, 0);
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++)
                cur[j] = text1[i - 1] == text2[j - 1] ? prev[j - 1] + 1 : max(prev[j], cur[j - 1]);
            swap(prev, cur);
        }
        return prev[n];
    }
};`,
          python: r`class Solution:
    def longestCommonSubsequence(self, text1: str, text2: str) -> int:
        if len(text2) > len(text1):
            text1, text2 = text2, text1
        n = len(text2)
        prev = [0] * (n + 1)
        for a in text1:
            cur = [0] * (n + 1)
            for j in range(1, n + 1):
                cur[j] = prev[j - 1] + 1 if a == text2[j - 1] else max(prev[j], cur[j - 1])
            prev = cur
        return prev[n]`,
          javascript: r`var longestCommonSubsequence = function(text1, text2) {
    if (text2.length > text1.length) [text1, text2] = [text2, text1];
    const m = text1.length, n = text2.length;
    let prev = new Array(n + 1).fill(0), cur = new Array(n + 1).fill(0);
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++)
            cur[j] = text1[i - 1] === text2[j - 1] ? prev[j - 1] + 1 : Math.max(prev[j], cur[j - 1]);
        [prev, cur] = [cur, prev];
    }
    return prev[n];
};`,
        },
      },
    ],
  },

  'delete-operation-for-two-strings': {
    pattern: 'Two-string DP (equivalently: m + n − 2·LCS)',
    approaches: [
      {
        level: 'Brute force', name: 'Recursion on the first characters',
        idea: 'If the first characters match, keep both and move on. Otherwise one of them must be deleted: try both and take the cheaper.',
        steps: [
          '`cost(i, j)`: if one word is used up, delete everything left in the other.',
          'If `a[i] == b[j]`, return `cost(i + 1, j + 1)`.',
          'Otherwise return `1 + min(cost(i + 1, j), cost(i, j + 1))`.',
        ],
        time: 'O(2^(m+n))', space: 'O(m + n)',
        why: 'Branches twice on every mismatch with repeated states.',
        code: {
          java: r`class Solution {
    public int minDistance(String word1, String word2) {
        return cost(word1, word2, 0, 0);
    }

    private int cost(String a, String b, int i, int j) {
        if (i == a.length()) return b.length() - j;
        if (j == b.length()) return a.length() - i;
        if (a.charAt(i) == b.charAt(j)) return cost(a, b, i + 1, j + 1);
        return 1 + Math.min(cost(a, b, i + 1, j), cost(a, b, i, j + 1));
    }
}`,
          cpp: r`class Solution {
    int cost(const string& a, const string& b, size_t i, size_t j) {
        if (i == a.size()) return b.size() - j;
        if (j == b.size()) return a.size() - i;
        if (a[i] == b[j]) return cost(a, b, i + 1, j + 1);
        return 1 + min(cost(a, b, i + 1, j), cost(a, b, i, j + 1));
    }
public:
    int minDistance(string word1, string word2) {
        return cost(word1, word2, 0, 0);
    }
};`,
          python: r`class Solution:
    def minDistance(self, word1: str, word2: str) -> int:
        def cost(i, j):
            if i == len(word1):
                return len(word2) - j
            if j == len(word2):
                return len(word1) - i
            if word1[i] == word2[j]:
                return cost(i + 1, j + 1)
            return 1 + min(cost(i + 1, j), cost(i, j + 1))
        return cost(0, 0)`,
          javascript: r`var minDistance = function(word1, word2) {
    const cost = (i, j) => {
        if (i === word1.length) return word2.length - j;
        if (j === word2.length) return word1.length - i;
        if (word1[i] === word2[j]) return cost(i + 1, j + 1);
        return 1 + Math.min(cost(i + 1, j), cost(i, j + 1));
    };
    return cost(0, 0);
};`,
        },
      },
      {
        level: 'Better', name: 'Through the longest common subsequence',
        idea: 'After the deletions both words equal some common subsequence. Keeping the longest one deletes the fewest characters: `m + n − 2·LCS`.',
        steps: [
          'Compute the LCS length with the standard 2-D table.',
          'Return `m + n − 2·LCS`.',
        ],
        time: 'O(m·n)', space: 'O(m·n)',
        why: 'One LCS table of (m + 1)(n + 1) entries.',
        code: {
          java: r`class Solution {
    public int minDistance(String word1, String word2) {
        int m = word1.length(), n = word2.length();
        int[][] dp = new int[m + 1][n + 1];
        for (int i = 1; i <= m; i++)
            for (int j = 1; j <= n; j++)
                dp[i][j] = word1.charAt(i - 1) == word2.charAt(j - 1) ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
        return m + n - 2 * dp[m][n];
    }
}`,
          cpp: r`class Solution {
public:
    int minDistance(string word1, string word2) {
        int m = word1.size(), n = word2.size();
        vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));
        for (int i = 1; i <= m; i++)
            for (int j = 1; j <= n; j++)
                dp[i][j] = word1[i - 1] == word2[j - 1] ? dp[i - 1][j - 1] + 1 : max(dp[i - 1][j], dp[i][j - 1]);
        return m + n - 2 * dp[m][n];
    }
};`,
          python: r`class Solution:
    def minDistance(self, word1: str, word2: str) -> int:
        m, n = len(word1), len(word2)
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if word1[i - 1] == word2[j - 1]:
                    dp[i][j] = dp[i - 1][j - 1] + 1
                else:
                    dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
        return m + n - 2 * dp[m][n]`,
          javascript: r`var minDistance = function(word1, word2) {
    const m = word1.length, n = word2.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 1; i <= m; i++)
        for (let j = 1; j <= n; j++)
            dp[i][j] = word1[i - 1] === word2[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    return m + n - 2 * dp[m][n];
};`,
        },
      },
      {
        level: 'Optimal', name: 'Direct deletion DP with one row',
        idea: '`dp[i][j]` = deletions to make the first `i` and first `j` characters equal: the diagonal when the last characters match, otherwise 1 + the cheaper deletion. Keep one row plus the old diagonal value.',
        steps: [
          '`row[j] = j` (delete all of the second prefix).',
          'For each `i`: remember `diag = row[0]`, set `row[0] = i`; for each `j`, `next = match ? diag : 1 + min(row[j], row[j − 1])`; then `diag = row[j]` (old), `row[j] = next`.',
          'Return `row[n]`.',
        ],
        time: 'O(m·n)', space: 'O(n)',
        why: 'Same table, one row of memory.',
        code: {
          java: r`class Solution {
    public int minDistance(String word1, String word2) {
        int m = word1.length(), n = word2.length();
        int[] row = new int[n + 1];
        for (int j = 0; j <= n; j++) row[j] = j;
        for (int i = 1; i <= m; i++) {
            int diag = row[0];
            row[0] = i;
            for (int j = 1; j <= n; j++) {
                int next = word1.charAt(i - 1) == word2.charAt(j - 1) ? diag : 1 + Math.min(row[j], row[j - 1]);
                diag = row[j];
                row[j] = next;
            }
        }
        return row[n];
    }
}`,
          cpp: r`class Solution {
public:
    int minDistance(string word1, string word2) {
        int m = word1.size(), n = word2.size();
        vector<int> row(n + 1);
        for (int j = 0; j <= n; j++) row[j] = j;
        for (int i = 1; i <= m; i++) {
            int diag = row[0];
            row[0] = i;
            for (int j = 1; j <= n; j++) {
                int next = word1[i - 1] == word2[j - 1] ? diag : 1 + min(row[j], row[j - 1]);
                diag = row[j];
                row[j] = next;
            }
        }
        return row[n];
    }
};`,
          python: r`class Solution:
    def minDistance(self, word1: str, word2: str) -> int:
        n = len(word2)
        row = list(range(n + 1))
        for i, a in enumerate(word1, 1):
            diag, row[0] = row[0], i
            for j in range(1, n + 1):
                nxt = diag if a == word2[j - 1] else 1 + min(row[j], row[j - 1])
                diag, row[j] = row[j], nxt
        return row[n]`,
          javascript: r`var minDistance = function(word1, word2) {
    const m = word1.length, n = word2.length, row = Array.from({ length: n + 1 }, (_, j) => j);
    for (let i = 1; i <= m; i++) {
        let diag = row[0];
        row[0] = i;
        for (let j = 1; j <= n; j++) {
            const next = word1[i - 1] === word2[j - 1] ? diag : 1 + Math.min(row[j], row[j - 1]);
            diag = row[j];
            row[j] = next;
        }
    }
    return row[n];
};`,
        },
      },
    ],
  },

  'longest-palindromic-substring': {
    pattern: 'Expand around each of the 2n − 1 centres',
    approaches: [
      {
        level: 'Brute force', name: 'Check every substring',
        idea: 'Test every substring with two pointers and keep the longest palindrome.',
        steps: [
          'For every `i <= j`, check whether `s[i..j]` is a palindrome by comparing from both ends.',
          'Keep the longest one found.',
        ],
        time: 'O(n³)', space: 'O(1)',
        why: 'n²/2 substrings, each checked in O(n).',
        code: {
          java: r`class Solution {
    public String longestPalindrome(String s) {
        int bestStart = 0, bestLen = 1;
        for (int i = 0; i < s.length(); i++)
            for (int j = i + bestLen; j < s.length(); j++)
                if (isPal(s, i, j)) { bestStart = i; bestLen = j - i + 1; }
        return s.substring(bestStart, bestStart + bestLen);
    }

    private boolean isPal(String s, int i, int j) {
        while (i < j) if (s.charAt(i++) != s.charAt(j--)) return false;
        return true;
    }
}`,
          cpp: r`class Solution {
    bool isPal(const string& s, int i, int j) {
        while (i < j) if (s[i++] != s[j--]) return false;
        return true;
    }
public:
    string longestPalindrome(string s) {
        int bestStart = 0, bestLen = 1, n = s.size();
        for (int i = 0; i < n; i++)
            for (int j = i + bestLen; j < n; j++)
                if (isPal(s, i, j)) { bestStart = i; bestLen = j - i + 1; }
        return s.substr(bestStart, bestLen);
    }
};`,
          python: r`class Solution:
    def longestPalindrome(self, s: str) -> str:
        best = s[0]
        for i in range(len(s)):
            for j in range(i + len(best), len(s)):
                piece = s[i:j + 1]
                if piece == piece[::-1]:
                    best = piece
        return best`,
          javascript: r`var longestPalindrome = function(s) {
    const isPal = (i, j) => {
        while (i < j) if (s[i++] !== s[j--]) return false;
        return true;
    };
    let bestStart = 0, bestLen = 1;
    for (let i = 0; i < s.length; i++)
        for (let j = i + bestLen; j < s.length; j++)
            if (isPal(i, j)) { bestStart = i; bestLen = j - i + 1; }
    return s.slice(bestStart, bestStart + bestLen);
};`,
        },
      },
      {
        level: 'Better', name: 'DP table of palindromic substrings',
        idea: '`pal[i][j]` is true when `s[i] == s[j]` and the inside `s[i + 1..j − 1]` is a palindrome (or has length < 2). Fill it by increasing `i` from the end so the inside is ready first.',
        steps: [
          'For `i` from n − 1 down to 0, for `j` from `i` to n − 1: `pal[i][j] = s[i] == s[j] && (j − i < 2 || pal[i + 1][j − 1])`.',
          'Whenever `pal[i][j]` is true and longer than the best, record it.',
        ],
        time: 'O(n²)', space: 'O(n²)',
        why: 'n²/2 entries, each O(1); the table itself is n².',
        code: {
          java: r`class Solution {
    public String longestPalindrome(String s) {
        int n = s.length(), bestStart = 0, bestLen = 1;
        boolean[][] pal = new boolean[n][n];
        for (int i = n - 1; i >= 0; i--)
            for (int j = i; j < n; j++) {
                pal[i][j] = s.charAt(i) == s.charAt(j) && (j - i < 2 || pal[i + 1][j - 1]);
                if (pal[i][j] && j - i + 1 > bestLen) { bestStart = i; bestLen = j - i + 1; }
            }
        return s.substring(bestStart, bestStart + bestLen);
    }
}`,
          cpp: r`class Solution {
public:
    string longestPalindrome(string s) {
        int n = s.size(), bestStart = 0, bestLen = 1;
        vector<vector<bool>> pal(n, vector<bool>(n, false));
        for (int i = n - 1; i >= 0; i--)
            for (int j = i; j < n; j++) {
                pal[i][j] = s[i] == s[j] && (j - i < 2 || pal[i + 1][j - 1]);
                if (pal[i][j] && j - i + 1 > bestLen) { bestStart = i; bestLen = j - i + 1; }
            }
        return s.substr(bestStart, bestLen);
    }
};`,
          python: r`class Solution:
    def longestPalindrome(self, s: str) -> str:
        n = len(s)
        pal = [[False] * n for _ in range(n)]
        best_start, best_len = 0, 1
        for i in range(n - 1, -1, -1):
            for j in range(i, n):
                pal[i][j] = s[i] == s[j] and (j - i < 2 or pal[i + 1][j - 1])
                if pal[i][j] and j - i + 1 > best_len:
                    best_start, best_len = i, j - i + 1
        return s[best_start:best_start + best_len]`,
          javascript: r`var longestPalindrome = function(s) {
    const n = s.length, pal = Array.from({ length: n }, () => new Array(n).fill(false));
    let bestStart = 0, bestLen = 1;
    for (let i = n - 1; i >= 0; i--)
        for (let j = i; j < n; j++) {
            pal[i][j] = s[i] === s[j] && (j - i < 2 || pal[i + 1][j - 1]);
            if (pal[i][j] && j - i + 1 > bestLen) { bestStart = i; bestLen = j - i + 1; }
        }
    return s.slice(bestStart, bestStart + bestLen);
};`,
        },
      },
      {
        level: 'Optimal', name: 'Expand around every centre',
        idea: 'Every palindrome is symmetric about a centre: a character (odd length) or the gap between two characters (even length). From each of the 2n − 1 centres, grow outwards while the ends match.',
        steps: [
          'For each `i`, expand from `(i, i)` and from `(i, i + 1)`.',
          'Expanding: while `l >= 0`, `r < n` and `s[l] == s[r]`, move `l` left and `r` right; the palindrome is `s[l + 1..r − 1]`.',
          'Keep the longest one.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'Each expansion is O(n) in the worst case (e.g. "aaaa…"), for 2n − 1 centres, with no table. (Manacher\'s algorithm reaches O(n) by reusing mirrored expansions, but is rarely expected.)',
        code: {
          java: r`class Solution {
    private int bestStart = 0, bestLen = 1;

    public String longestPalindrome(String s) {
        for (int i = 0; i < s.length(); i++) {
            expand(s, i, i);
            expand(s, i, i + 1);
        }
        return s.substring(bestStart, bestStart + bestLen);
    }

    private void expand(String s, int l, int r) {
        while (l >= 0 && r < s.length() && s.charAt(l) == s.charAt(r)) { l--; r++; }
        if (r - l - 1 > bestLen) { bestStart = l + 1; bestLen = r - l - 1; }
    }
}`,
          cpp: r`class Solution {
    int bestStart = 0, bestLen = 1;
    void expand(const string& s, int l, int r) {
        while (l >= 0 && r < (int) s.size() && s[l] == s[r]) { l--; r++; }
        if (r - l - 1 > bestLen) { bestStart = l + 1; bestLen = r - l - 1; }
    }
public:
    string longestPalindrome(string s) {
        for (int i = 0; i < (int) s.size(); i++) {
            expand(s, i, i);
            expand(s, i, i + 1);
        }
        return s.substr(bestStart, bestLen);
    }
};`,
          python: r`class Solution:
    def longestPalindrome(self, s: str) -> str:
        best_start, best_len = 0, 1
        def expand(l, r):
            nonlocal best_start, best_len
            while l >= 0 and r < len(s) and s[l] == s[r]:
                l -= 1
                r += 1
            if r - l - 1 > best_len:
                best_start, best_len = l + 1, r - l - 1
        for i in range(len(s)):
            expand(i, i)
            expand(i, i + 1)
        return s[best_start:best_start + best_len]`,
          javascript: r`var longestPalindrome = function(s) {
    let bestStart = 0, bestLen = 1;
    const expand = (l, r) => {
        while (l >= 0 && r < s.length && s[l] === s[r]) { l--; r++; }
        if (r - l - 1 > bestLen) { bestStart = l + 1; bestLen = r - l - 1; }
    };
    for (let i = 0; i < s.length; i++) {
        expand(i, i);
        expand(i, i + 1);
    }
    return s.slice(bestStart, bestStart + bestLen);
};`,
        },
      },
    ],
  },

  'longest-palindromic-subsequence': {
    pattern: 'Interval DP: lps(i, j) from lps(i + 1, j − 1), lps(i + 1, j), lps(i, j − 1)',
    approaches: [
      {
        level: 'Brute force', name: 'Recursion on the two ends',
        idea: 'If the two ends match, they wrap a palindrome around the best answer for the inside. Otherwise drop one end.',
        steps: [
          '`lps(i, j)`: 0 if `i > j`; 1 if `i == j`.',
          'If `s[i] == s[j]`, return `2 + lps(i + 1, j − 1)`.',
          'Otherwise return `max(lps(i + 1, j), lps(i, j − 1))`.',
        ],
        time: 'O(2ⁿ)', space: 'O(n)',
        why: 'Mismatches branch in two and overlapping ranges are recomputed.',
        code: {
          java: r`class Solution {
    public int longestPalindromeSubseq(String s) {
        return lps(s, 0, s.length() - 1);
    }

    private int lps(String s, int i, int j) {
        if (i > j) return 0;
        if (i == j) return 1;
        if (s.charAt(i) == s.charAt(j)) return 2 + lps(s, i + 1, j - 1);
        return Math.max(lps(s, i + 1, j), lps(s, i, j - 1));
    }
}`,
          cpp: r`class Solution {
    int lps(const string& s, int i, int j) {
        if (i > j) return 0;
        if (i == j) return 1;
        if (s[i] == s[j]) return 2 + lps(s, i + 1, j - 1);
        return max(lps(s, i + 1, j), lps(s, i, j - 1));
    }
public:
    int longestPalindromeSubseq(string s) {
        return lps(s, 0, (int) s.size() - 1);
    }
};`,
          python: r`class Solution:
    def longestPalindromeSubseq(self, s: str) -> int:
        def lps(i, j):
            if i > j:
                return 0
            if i == j:
                return 1
            if s[i] == s[j]:
                return 2 + lps(i + 1, j - 1)
            return max(lps(i + 1, j), lps(i, j - 1))
        return lps(0, len(s) - 1)`,
          javascript: r`var longestPalindromeSubseq = function(s) {
    const lps = (i, j) => {
        if (i > j) return 0;
        if (i === j) return 1;
        if (s[i] === s[j]) return 2 + lps(i + 1, j - 1);
        return Math.max(lps(i + 1, j), lps(i, j - 1));
    };
    return lps(0, s.length - 1);
};`,
        },
      },
      {
        level: 'Better', name: '2-D interval table',
        idea: 'Fill `dp[i][j]` for every range, from short ranges to long ones (by starting `i` at the end), so the inner ranges are ready.',
        steps: [
          '`dp[i][i] = 1`.',
          'For `i` from n − 1 down to 0, for `j` from `i + 1` to n − 1: `dp[i][j] = s[i] == s[j] ? dp[i + 1][j − 1] + 2 : max(dp[i + 1][j], dp[i][j − 1])`.',
          'Return `dp[0][n − 1]`.',
        ],
        time: 'O(n²)', space: 'O(n²)',
        why: 'About n²/2 ranges, O(1) each.',
        code: {
          java: r`class Solution {
    public int longestPalindromeSubseq(String s) {
        int n = s.length();
        int[][] dp = new int[n][n];
        for (int i = n - 1; i >= 0; i--) {
            dp[i][i] = 1;
            for (int j = i + 1; j < n; j++)
                dp[i][j] = s.charAt(i) == s.charAt(j) ? dp[i + 1][j - 1] + 2 : Math.max(dp[i + 1][j], dp[i][j - 1]);
        }
        return dp[0][n - 1];
    }
}`,
          cpp: r`class Solution {
public:
    int longestPalindromeSubseq(string s) {
        int n = s.size();
        vector<vector<int>> dp(n, vector<int>(n, 0));
        for (int i = n - 1; i >= 0; i--) {
            dp[i][i] = 1;
            for (int j = i + 1; j < n; j++)
                dp[i][j] = s[i] == s[j] ? dp[i + 1][j - 1] + 2 : max(dp[i + 1][j], dp[i][j - 1]);
        }
        return dp[0][n - 1];
    }
};`,
          python: r`class Solution:
    def longestPalindromeSubseq(self, s: str) -> int:
        n = len(s)
        dp = [[0] * n for _ in range(n)]
        for i in range(n - 1, -1, -1):
            dp[i][i] = 1
            for j in range(i + 1, n):
                if s[i] == s[j]:
                    dp[i][j] = dp[i + 1][j - 1] + 2
                else:
                    dp[i][j] = max(dp[i + 1][j], dp[i][j - 1])
        return dp[0][n - 1]`,
          javascript: r`var longestPalindromeSubseq = function(s) {
    const n = s.length, dp = Array.from({ length: n }, () => new Array(n).fill(0));
    for (let i = n - 1; i >= 0; i--) {
        dp[i][i] = 1;
        for (let j = i + 1; j < n; j++)
            dp[i][j] = s[i] === s[j] ? dp[i + 1][j - 1] + 2 : Math.max(dp[i + 1][j], dp[i][j - 1]);
    }
    return dp[0][n - 1];
};`,
        },
      },
      {
        level: 'Optimal', name: 'One row (row i + 1 rolled into row i)',
        idea: 'Row `i` only reads row `i + 1`. Keep one array holding row `i + 1`; while filling row `i` left to right, save the old value of `dp[j − 1]` (that is `dp[i + 1][j − 1]`) before overwriting it.',
        steps: [
          '`row` = n zeros.',
          'For `i` from n − 1 down to 0: `row[i] = 1`; `diag = 0` (dp[i + 1][i]); for `j` from `i + 1`: `old = row[j]`; `row[j] = s[i] == s[j] ? diag + 2 : max(row[j], row[j − 1])`; `diag = old`.',
          'Return `row[n − 1]`.',
        ],
        time: 'O(n²)', space: 'O(n)',
        why: 'Same work in one row. (Equivalently: the LCS of `s` and its reverse.)',
        code: {
          java: r`class Solution {
    public int longestPalindromeSubseq(String s) {
        int n = s.length();
        int[] row = new int[n];
        for (int i = n - 1; i >= 0; i--) {
            row[i] = 1;
            int diag = 0;
            for (int j = i + 1; j < n; j++) {
                int old = row[j];
                row[j] = s.charAt(i) == s.charAt(j) ? diag + 2 : Math.max(row[j], row[j - 1]);
                diag = old;
            }
        }
        return row[n - 1];
    }
}`,
          cpp: r`class Solution {
public:
    int longestPalindromeSubseq(string s) {
        int n = s.size();
        vector<int> row(n, 0);
        for (int i = n - 1; i >= 0; i--) {
            row[i] = 1;
            int diag = 0;
            for (int j = i + 1; j < n; j++) {
                int old = row[j];
                row[j] = s[i] == s[j] ? diag + 2 : max(row[j], row[j - 1]);
                diag = old;
            }
        }
        return row[n - 1];
    }
};`,
          python: r`class Solution:
    def longestPalindromeSubseq(self, s: str) -> int:
        n = len(s)
        row = [0] * n
        for i in range(n - 1, -1, -1):
            row[i] = 1
            diag = 0
            for j in range(i + 1, n):
                old = row[j]
                row[j] = diag + 2 if s[i] == s[j] else max(row[j], row[j - 1])
                diag = old
        return row[n - 1]`,
          javascript: r`var longestPalindromeSubseq = function(s) {
    const n = s.length, row = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        row[i] = 1;
        let diag = 0;
        for (let j = i + 1; j < n; j++) {
            const old = row[j];
            row[j] = s[i] === s[j] ? diag + 2 : Math.max(row[j], row[j - 1]);
            diag = old;
        }
    }
    return row[n - 1];
};`,
        },
      },
    ],
  },

  'palindromic-substrings': {
    pattern: 'Expand around each of the 2n − 1 centres, counting as you grow',
    approaches: [
      {
        level: 'Brute force', name: 'Check every substring',
        idea: 'Test each of the n(n + 1)/2 substrings with two pointers and count the palindromes.',
        steps: [
          'For every `i <= j`, check `s[i..j]` from both ends.',
          'Count those that are palindromes.',
        ],
        time: 'O(n³)', space: 'O(1)',
        why: 'n²/2 substrings, each checked in O(n).',
        code: {
          java: r`class Solution {
    public int countSubstrings(String s) {
        int count = 0;
        for (int i = 0; i < s.length(); i++)
            for (int j = i; j < s.length(); j++) {
                int l = i, r = j;
                while (l < r && s.charAt(l) == s.charAt(r)) { l++; r--; }
                if (l >= r) count++;
            }
        return count;
    }
}`,
          cpp: r`class Solution {
public:
    int countSubstrings(string s) {
        int count = 0, n = s.size();
        for (int i = 0; i < n; i++)
            for (int j = i; j < n; j++) {
                int l = i, r = j;
                while (l < r && s[l] == s[r]) { l++; r--; }
                if (l >= r) count++;
            }
        return count;
    }
};`,
          python: r`class Solution:
    def countSubstrings(self, s: str) -> int:
        n = len(s)
        return sum(1 for i in range(n) for j in range(i, n) if s[i:j + 1] == s[i:j + 1][::-1])`,
          javascript: r`var countSubstrings = function(s) {
    let count = 0;
    for (let i = 0; i < s.length; i++)
        for (let j = i; j < s.length; j++) {
            let l = i, r = j;
            while (l < r && s[l] === s[r]) { l++; r--; }
            if (l >= r) count++;
        }
    return count;
};`,
        },
      },
      {
        level: 'Better', name: 'DP table of palindromic substrings',
        idea: '`pal[i][j]` is true when the ends match and the inside is a palindrome. Fill it from the end and count the true entries.',
        steps: [
          'For `i` from n − 1 down to 0, `j` from `i` up: `pal[i][j] = s[i] == s[j] && (j − i < 2 || pal[i + 1][j − 1])`.',
          'Count the entries that are true.',
        ],
        time: 'O(n²)', space: 'O(n²)',
        why: 'n²/2 entries at O(1) each, stored in a table.',
        code: {
          java: r`class Solution {
    public int countSubstrings(String s) {
        int n = s.length(), count = 0;
        boolean[][] pal = new boolean[n][n];
        for (int i = n - 1; i >= 0; i--)
            for (int j = i; j < n; j++) {
                pal[i][j] = s.charAt(i) == s.charAt(j) && (j - i < 2 || pal[i + 1][j - 1]);
                if (pal[i][j]) count++;
            }
        return count;
    }
}`,
          cpp: r`class Solution {
public:
    int countSubstrings(string s) {
        int n = s.size(), count = 0;
        vector<vector<bool>> pal(n, vector<bool>(n, false));
        for (int i = n - 1; i >= 0; i--)
            for (int j = i; j < n; j++) {
                pal[i][j] = s[i] == s[j] && (j - i < 2 || pal[i + 1][j - 1]);
                if (pal[i][j]) count++;
            }
        return count;
    }
};`,
          python: r`class Solution:
    def countSubstrings(self, s: str) -> int:
        n = len(s)
        pal = [[False] * n for _ in range(n)]
        count = 0
        for i in range(n - 1, -1, -1):
            for j in range(i, n):
                pal[i][j] = s[i] == s[j] and (j - i < 2 or pal[i + 1][j - 1])
                count += pal[i][j]
        return count`,
          javascript: r`var countSubstrings = function(s) {
    const n = s.length, pal = Array.from({ length: n }, () => new Array(n).fill(false));
    let count = 0;
    for (let i = n - 1; i >= 0; i--)
        for (let j = i; j < n; j++) {
            pal[i][j] = s[i] === s[j] && (j - i < 2 || pal[i + 1][j - 1]);
            if (pal[i][j]) count++;
        }
    return count;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Expand around every centre',
        idea: 'From each of the 2n − 1 centres (characters and gaps), grow outwards while the ends match. Every successful step is one more palindromic substring.',
        steps: [
          'For each centre `(i, i)` and `(i, i + 1)`: while `l >= 0`, `r < n` and `s[l] == s[r]`, count one and move outwards.',
          'Return the total.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'The total expansion work equals the number of palindromes found plus 2n − 1 failed checks, at most O(n²), with no table.',
        code: {
          java: r`class Solution {
    public int countSubstrings(String s) {
        int count = 0;
        for (int c = 0; c < 2 * s.length() - 1; c++) {
            int l = c / 2, r = l + c % 2;
            while (l >= 0 && r < s.length() && s.charAt(l) == s.charAt(r)) { count++; l--; r++; }
        }
        return count;
    }
}`,
          cpp: r`class Solution {
public:
    int countSubstrings(string s) {
        int count = 0, n = s.size();
        for (int c = 0; c < 2 * n - 1; c++) {
            int l = c / 2, r = l + c % 2;
            while (l >= 0 && r < n && s[l] == s[r]) { count++; l--; r++; }
        }
        return count;
    }
};`,
          python: r`class Solution:
    def countSubstrings(self, s: str) -> int:
        n, count = len(s), 0
        for c in range(2 * n - 1):
            l, r = c // 2, c // 2 + c % 2
            while l >= 0 and r < n and s[l] == s[r]:
                count += 1
                l -= 1
                r += 1
        return count`,
          javascript: r`var countSubstrings = function(s) {
    const n = s.length;
    let count = 0;
    for (let c = 0; c < 2 * n - 1; c++) {
        let l = c >> 1, r = l + (c % 2);
        while (l >= 0 && r < n && s[l] === s[r]) { count++; l--; r++; }
    }
    return count;
};`,
        },
      },
    ],
  },

  'interleaving-string': {
    pattern: 'Two-string DP: can the first i of s1 and j of s2 form the first i + j of s3?',
    approaches: [
      {
        level: 'Brute force', name: 'Recursion choosing the next source',
        idea: 'The next character of `s3` must come from the front of `s1` or the front of `s2`. Try whichever matches (both, if both do).',
        steps: [
          'If the lengths do not add up, return false.',
          '`can(i, j)`: true when both are used up.',
          'Return `(s1[i] == s3[i + j] && can(i + 1, j)) || (s2[j] == s3[i + j] && can(i, j + 1))`.',
        ],
        time: 'O(2^(m+n))', space: 'O(m + n)',
        why: 'When both fronts match, both branches are explored, and the same `(i, j)` repeats.',
        code: {
          java: r`class Solution {
    public boolean isInterleave(String s1, String s2, String s3) {
        if (s1.length() + s2.length() != s3.length()) return false;
        return can(s1, s2, s3, 0, 0);
    }

    private boolean can(String a, String b, String c, int i, int j) {
        if (i == a.length() && j == b.length()) return true;
        return (i < a.length() && a.charAt(i) == c.charAt(i + j) && can(a, b, c, i + 1, j))
            || (j < b.length() && b.charAt(j) == c.charAt(i + j) && can(a, b, c, i, j + 1));
    }
}`,
          cpp: r`class Solution {
    bool can(const string& a, const string& b, const string& c, size_t i, size_t j) {
        if (i == a.size() && j == b.size()) return true;
        return (i < a.size() && a[i] == c[i + j] && can(a, b, c, i + 1, j))
            || (j < b.size() && b[j] == c[i + j] && can(a, b, c, i, j + 1));
    }
public:
    bool isInterleave(string s1, string s2, string s3) {
        if (s1.size() + s2.size() != s3.size()) return false;
        return can(s1, s2, s3, 0, 0);
    }
};`,
          python: r`class Solution:
    def isInterleave(self, s1: str, s2: str, s3: str) -> bool:
        if len(s1) + len(s2) != len(s3):
            return False
        def can(i, j):
            if i == len(s1) and j == len(s2):
                return True
            return (i < len(s1) and s1[i] == s3[i + j] and can(i + 1, j)) or \
                (j < len(s2) and s2[j] == s3[i + j] and can(i, j + 1))
        return can(0, 0)`,
          javascript: r`var isInterleave = function(s1, s2, s3) {
    if (s1.length + s2.length !== s3.length) return false;
    const can = (i, j) => {
        if (i === s1.length && j === s2.length) return true;
        return (i < s1.length && s1[i] === s3[i + j] && can(i + 1, j))
            || (j < s2.length && s2[j] === s3[i + j] && can(i, j + 1));
    };
    return can(0, 0);
};`,
        },
      },
      {
        level: 'Better', name: '2-D table over prefixes',
        idea: '`dp[i][j]` = can `s1[0..i)` and `s2[0..j)` interleave into `s3[0..i + j)`? The last character came from `s1` or from `s2`.',
        steps: [
          'If lengths do not add up, return false. `dp[0][0] = true`.',
          '`dp[i][j] = (i > 0 && dp[i − 1][j] && s1[i − 1] == s3[i + j − 1]) || (j > 0 && dp[i][j − 1] && s2[j − 1] == s3[i + j − 1])`.',
          'Return `dp[m][n]`.',
        ],
        time: 'O(m·n)', space: 'O(m·n)',
        why: 'Every pair of prefix lengths once.',
        code: {
          java: r`class Solution {
    public boolean isInterleave(String s1, String s2, String s3) {
        int m = s1.length(), n = s2.length();
        if (m + n != s3.length()) return false;
        boolean[][] dp = new boolean[m + 1][n + 1];
        dp[0][0] = true;
        for (int i = 0; i <= m; i++)
            for (int j = 0; j <= n; j++) {
                if (i > 0 && dp[i - 1][j] && s1.charAt(i - 1) == s3.charAt(i + j - 1)) dp[i][j] = true;
                if (j > 0 && dp[i][j - 1] && s2.charAt(j - 1) == s3.charAt(i + j - 1)) dp[i][j] = true;
            }
        return dp[m][n];
    }
}`,
          cpp: r`class Solution {
public:
    bool isInterleave(string s1, string s2, string s3) {
        int m = s1.size(), n = s2.size();
        if (m + n != (int) s3.size()) return false;
        vector<vector<bool>> dp(m + 1, vector<bool>(n + 1, false));
        dp[0][0] = true;
        for (int i = 0; i <= m; i++)
            for (int j = 0; j <= n; j++) {
                if (i > 0 && dp[i - 1][j] && s1[i - 1] == s3[i + j - 1]) dp[i][j] = true;
                if (j > 0 && dp[i][j - 1] && s2[j - 1] == s3[i + j - 1]) dp[i][j] = true;
            }
        return dp[m][n];
    }
};`,
          python: r`class Solution:
    def isInterleave(self, s1: str, s2: str, s3: str) -> bool:
        m, n = len(s1), len(s2)
        if m + n != len(s3):
            return False
        dp = [[False] * (n + 1) for _ in range(m + 1)]
        dp[0][0] = True
        for i in range(m + 1):
            for j in range(n + 1):
                if i > 0 and dp[i - 1][j] and s1[i - 1] == s3[i + j - 1]:
                    dp[i][j] = True
                if j > 0 and dp[i][j - 1] and s2[j - 1] == s3[i + j - 1]:
                    dp[i][j] = True
        return dp[m][n]`,
          javascript: r`var isInterleave = function(s1, s2, s3) {
    const m = s1.length, n = s2.length;
    if (m + n !== s3.length) return false;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(false));
    dp[0][0] = true;
    for (let i = 0; i <= m; i++)
        for (let j = 0; j <= n; j++) {
            if (i > 0 && dp[i - 1][j] && s1[i - 1] === s3[i + j - 1]) dp[i][j] = true;
            if (j > 0 && dp[i][j - 1] && s2[j - 1] === s3[i + j - 1]) dp[i][j] = true;
        }
    return dp[m][n];
};`,
        },
      },
      {
        level: 'Optimal', name: 'One row',
        idea: 'Row `i` only needs row `i − 1` (same column) and the current row (column to the left), so one boolean array is enough.',
        steps: [
          '`row[0] = true` initially; for each `i` from 0 to m, for each `j` from 0 to n, update `row[j]` in place.',
          '`row[j]` (still holding row `i − 1`) stays true only if `s1[i − 1]` matches; OR it with `row[j − 1] && s2[j − 1]` matching.',
          'Return `row[n]`.',
        ],
        time: 'O(m·n)', space: 'O(n)',
        why: 'Same work with n + 1 booleans.',
        code: {
          java: r`class Solution {
    public boolean isInterleave(String s1, String s2, String s3) {
        int m = s1.length(), n = s2.length();
        if (m + n != s3.length()) return false;
        boolean[] row = new boolean[n + 1];
        for (int i = 0; i <= m; i++)
            for (int j = 0; j <= n; j++) {
                if (i == 0 && j == 0) { row[0] = true; continue; }
                boolean fromS1 = i > 0 && row[j] && s1.charAt(i - 1) == s3.charAt(i + j - 1);
                boolean fromS2 = j > 0 && row[j - 1] && s2.charAt(j - 1) == s3.charAt(i + j - 1);
                row[j] = fromS1 || fromS2;
            }
        return row[n];
    }
}`,
          cpp: r`class Solution {
public:
    bool isInterleave(string s1, string s2, string s3) {
        int m = s1.size(), n = s2.size();
        if (m + n != (int) s3.size()) return false;
        vector<bool> row(n + 1, false);
        for (int i = 0; i <= m; i++)
            for (int j = 0; j <= n; j++) {
                if (i == 0 && j == 0) { row[0] = true; continue; }
                bool fromS1 = i > 0 && row[j] && s1[i - 1] == s3[i + j - 1];
                bool fromS2 = j > 0 && row[j - 1] && s2[j - 1] == s3[i + j - 1];
                row[j] = fromS1 || fromS2;
            }
        return row[n];
    }
};`,
          python: r`class Solution:
    def isInterleave(self, s1: str, s2: str, s3: str) -> bool:
        m, n = len(s1), len(s2)
        if m + n != len(s3):
            return False
        row = [False] * (n + 1)
        for i in range(m + 1):
            for j in range(n + 1):
                if i == 0 and j == 0:
                    row[0] = True
                    continue
                from_s1 = i > 0 and row[j] and s1[i - 1] == s3[i + j - 1]
                from_s2 = j > 0 and row[j - 1] and s2[j - 1] == s3[i + j - 1]
                row[j] = from_s1 or from_s2
        return row[n]`,
          javascript: r`var isInterleave = function(s1, s2, s3) {
    const m = s1.length, n = s2.length;
    if (m + n !== s3.length) return false;
    const row = new Array(n + 1).fill(false);
    for (let i = 0; i <= m; i++)
        for (let j = 0; j <= n; j++) {
            if (i === 0 && j === 0) { row[0] = true; continue; }
            const fromS1 = i > 0 && row[j] && s1[i - 1] === s3[i + j - 1];
            const fromS2 = j > 0 && row[j - 1] && s2[j - 1] === s3[i + j - 1];
            row[j] = fromS1 || fromS2;
        }
    return row[n];
};`,
        },
      },
    ],
  },

  'edit-distance': {
    pattern: 'Two-string DP: insert, delete or replace from the three neighbouring cells',
    approaches: [
      {
        level: 'Brute force', name: 'Recursion on the first characters',
        idea: 'If the first characters match, no edit is needed for them. Otherwise one edit happens here: insert, delete or replace; try all three.',
        steps: [
          '`dist(i, j)`: if `word1` is used up, insert the rest of `word2`; if `word2` is used up, delete the rest of `word1`.',
          'If `a[i] == b[j]`, return `dist(i + 1, j + 1)`.',
          'Otherwise `1 + min(dist(i, j + 1) /* insert */, dist(i + 1, j) /* delete */, dist(i + 1, j + 1) /* replace */)`.',
        ],
        time: 'O(3^(m+n))', space: 'O(m + n)',
        why: 'Three branches on every mismatch with massive repetition.',
        code: {
          java: r`class Solution {
    public int minDistance(String word1, String word2) {
        return dist(word1, word2, 0, 0);
    }

    private int dist(String a, String b, int i, int j) {
        if (i == a.length()) return b.length() - j;
        if (j == b.length()) return a.length() - i;
        if (a.charAt(i) == b.charAt(j)) return dist(a, b, i + 1, j + 1);
        return 1 + Math.min(dist(a, b, i, j + 1), Math.min(dist(a, b, i + 1, j), dist(a, b, i + 1, j + 1)));
    }
}`,
          cpp: r`class Solution {
    int dist(const string& a, const string& b, size_t i, size_t j) {
        if (i == a.size()) return b.size() - j;
        if (j == b.size()) return a.size() - i;
        if (a[i] == b[j]) return dist(a, b, i + 1, j + 1);
        return 1 + min({dist(a, b, i, j + 1), dist(a, b, i + 1, j), dist(a, b, i + 1, j + 1)});
    }
public:
    int minDistance(string word1, string word2) {
        return dist(word1, word2, 0, 0);
    }
};`,
          python: r`class Solution:
    def minDistance(self, word1: str, word2: str) -> int:
        def dist(i, j):
            if i == len(word1):
                return len(word2) - j
            if j == len(word2):
                return len(word1) - i
            if word1[i] == word2[j]:
                return dist(i + 1, j + 1)
            return 1 + min(dist(i, j + 1), dist(i + 1, j), dist(i + 1, j + 1))
        return dist(0, 0)`,
          javascript: r`var minDistance = function(word1, word2) {
    const dist = (i, j) => {
        if (i === word1.length) return word2.length - j;
        if (j === word2.length) return word1.length - i;
        if (word1[i] === word2[j]) return dist(i + 1, j + 1);
        return 1 + Math.min(dist(i, j + 1), dist(i + 1, j), dist(i + 1, j + 1));
    };
    return dist(0, 0);
};`,
        },
      },
      {
        level: 'Better', name: '2-D table over prefixes',
        idea: '`dp[i][j]` = edits to turn the first `i` characters of `word1` into the first `j` of `word2`. Matching last characters cost nothing; otherwise take 1 + the cheapest of the three neighbouring cells.',
        steps: [
          '`dp[i][0] = i` (delete everything), `dp[0][j] = j` (insert everything).',
          'If `a[i − 1] == b[j − 1]`: `dp[i][j] = dp[i − 1][j − 1]`; else `1 + min(dp[i − 1][j], dp[i][j − 1], dp[i − 1][j − 1])`.',
          'Return `dp[m][n]`.',
        ],
        time: 'O(m·n)', space: 'O(m·n)',
        why: 'Every pair of prefixes once.',
        code: {
          java: r`class Solution {
    public int minDistance(String word1, String word2) {
        int m = word1.length(), n = word2.length();
        int[][] dp = new int[m + 1][n + 1];
        for (int i = 0; i <= m; i++) dp[i][0] = i;
        for (int j = 0; j <= n; j++) dp[0][j] = j;
        for (int i = 1; i <= m; i++)
            for (int j = 1; j <= n; j++)
                dp[i][j] = word1.charAt(i - 1) == word2.charAt(j - 1) ? dp[i - 1][j - 1]
                    : 1 + Math.min(dp[i - 1][j - 1], Math.min(dp[i - 1][j], dp[i][j - 1]));
        return dp[m][n];
    }
}`,
          cpp: r`class Solution {
public:
    int minDistance(string word1, string word2) {
        int m = word1.size(), n = word2.size();
        vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));
        for (int i = 0; i <= m; i++) dp[i][0] = i;
        for (int j = 0; j <= n; j++) dp[0][j] = j;
        for (int i = 1; i <= m; i++)
            for (int j = 1; j <= n; j++)
                dp[i][j] = word1[i - 1] == word2[j - 1] ? dp[i - 1][j - 1]
                    : 1 + min({dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]});
        return dp[m][n];
    }
};`,
          python: r`class Solution:
    def minDistance(self, word1: str, word2: str) -> int:
        m, n = len(word1), len(word2)
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        for i in range(m + 1):
            dp[i][0] = i
        for j in range(n + 1):
            dp[0][j] = j
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if word1[i - 1] == word2[j - 1]:
                    dp[i][j] = dp[i - 1][j - 1]
                else:
                    dp[i][j] = 1 + min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1])
        return dp[m][n]`,
          javascript: r`var minDistance = function(word1, word2) {
    const m = word1.length, n = word2.length;
    const dp = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
    for (let i = 1; i <= m; i++)
        for (let j = 1; j <= n; j++)
            dp[i][j] = word1[i - 1] === word2[j - 1] ? dp[i - 1][j - 1]
                : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    return dp[m][n];
};`,
        },
      },
      {
        level: 'Optimal', name: 'One row plus the saved diagonal',
        idea: 'Keep row `i − 1` in an array and update it to row `i` in place, saving the old left-diagonal value in a variable before it is overwritten.',
        steps: [
          '`row[j] = j`.',
          'For each `i`: `diag = row[0]`, `row[0] = i`; for each `j`: `old = row[j]`; `row[j] = match ? diag : 1 + min(diag, row[j], row[j − 1])`; `diag = old`.',
          'Return `row[n]`.',
        ],
        time: 'O(m·n)', space: 'O(n)',
        why: 'Same work, one row of n + 1 integers.',
        code: {
          java: r`class Solution {
    public int minDistance(String word1, String word2) {
        int m = word1.length(), n = word2.length();
        int[] row = new int[n + 1];
        for (int j = 0; j <= n; j++) row[j] = j;
        for (int i = 1; i <= m; i++) {
            int diag = row[0];
            row[0] = i;
            for (int j = 1; j <= n; j++) {
                int old = row[j];
                row[j] = word1.charAt(i - 1) == word2.charAt(j - 1) ? diag : 1 + Math.min(diag, Math.min(row[j], row[j - 1]));
                diag = old;
            }
        }
        return row[n];
    }
}`,
          cpp: r`class Solution {
public:
    int minDistance(string word1, string word2) {
        int m = word1.size(), n = word2.size();
        vector<int> row(n + 1);
        for (int j = 0; j <= n; j++) row[j] = j;
        for (int i = 1; i <= m; i++) {
            int diag = row[0];
            row[0] = i;
            for (int j = 1; j <= n; j++) {
                int old = row[j];
                row[j] = word1[i - 1] == word2[j - 1] ? diag : 1 + min({diag, row[j], row[j - 1]});
                diag = old;
            }
        }
        return row[n];
    }
};`,
          python: r`class Solution:
    def minDistance(self, word1: str, word2: str) -> int:
        n = len(word2)
        row = list(range(n + 1))
        for i, a in enumerate(word1, 1):
            diag, row[0] = row[0], i
            for j in range(1, n + 1):
                old = row[j]
                row[j] = diag if a == word2[j - 1] else 1 + min(diag, row[j], row[j - 1])
                diag = old
        return row[n]`,
          javascript: r`var minDistance = function(word1, word2) {
    const m = word1.length, n = word2.length, row = Array.from({ length: n + 1 }, (_, j) => j);
    for (let i = 1; i <= m; i++) {
        let diag = row[0];
        row[0] = i;
        for (let j = 1; j <= n; j++) {
            const old = row[j];
            row[j] = word1[i - 1] === word2[j - 1] ? diag : 1 + Math.min(diag, row[j], row[j - 1]);
            diag = old;
        }
    }
    return row[n];
};`,
        },
      },
    ],
  },

  'distinct-subsequences': {
    pattern: 'Two-string counting DP: use s[i] for t[j] (if equal) or skip s[i]',
    approaches: [
      {
        level: 'Brute force', name: 'Recursion: use or skip each character of s',
        idea: 'Walk through `s`. Each character can be skipped; if it equals the next needed character of `t`, it can also be used to match it.',
        steps: [
          '`count(i, j)`: 1 if `j == |t|` (all of `t` matched); 0 if `i == |s|`.',
          'Skip: `count(i + 1, j)`; use (if `s[i] == t[j]`): `count(i + 1, j + 1)`.',
          'Return the sum.',
        ],
        time: 'O(2ⁿ)', space: 'O(n)',
        why: 'Two branches per character of `s` with overlapping states.',
        code: {
          java: r`class Solution {
    public int numDistinct(String s, String t) {
        return count(s, t, 0, 0);
    }

    private int count(String s, String t, int i, int j) {
        if (j == t.length()) return 1;
        if (i == s.length()) return 0;
        int ways = count(s, t, i + 1, j);
        if (s.charAt(i) == t.charAt(j)) ways += count(s, t, i + 1, j + 1);
        return ways;
    }
}`,
          cpp: r`class Solution {
    unsigned count(const string& s, const string& t, size_t i, size_t j) {
        if (j == t.size()) return 1;
        if (i == s.size()) return 0;
        unsigned ways = count(s, t, i + 1, j);
        if (s[i] == t[j]) ways += count(s, t, i + 1, j + 1);
        return ways;
    }
public:
    int numDistinct(string s, string t) {
        return (int) count(s, t, 0, 0);
    }
};`,
          python: r`class Solution:
    def numDistinct(self, s: str, t: str) -> int:
        def count(i, j):
            if j == len(t):
                return 1
            if i == len(s):
                return 0
            ways = count(i + 1, j)
            if s[i] == t[j]:
                ways += count(i + 1, j + 1)
            return ways
        return count(0, 0)`,
          javascript: r`var numDistinct = function(s, t) {
    const count = (i, j) => {
        if (j === t.length) return 1;
        if (i === s.length) return 0;
        let ways = count(i + 1, j);
        if (s[i] === t[j]) ways += count(i + 1, j + 1);
        return ways;
    };
    return count(0, 0);
};`,
        },
      },
      {
        level: 'Better', name: '2-D table over prefixes',
        idea: '`dp[i][j]` = ways the first `i` characters of `s` contain the first `j` of `t` as a subsequence. Either `s[i − 1]` is not used (`dp[i − 1][j]`), or it matches `t[j − 1]` and is used (`dp[i − 1][j − 1]`).',
        steps: [
          '`dp[i][0] = 1` for every `i` (the empty `t` is matched once).',
          '`dp[i][j] = dp[i − 1][j] + (s[i − 1] == t[j − 1] ? dp[i − 1][j − 1] : 0)`.',
          'Return `dp[|s|][|t|]`.',
        ],
        time: 'O(m·n)', space: 'O(m·n)',
        why: 'Every pair of prefixes once. Counts in the middle of the table can exceed 64 bits although the answer fits in 32, so the sums wrap modulo 2³² on purpose (Java `int`, C++ `unsigned`, JS `>>> 0`) — the final value is still exact.',
        code: {
          java: r`class Solution {
    public int numDistinct(String s, String t) {
        int m = s.length(), n = t.length();
        int[][] dp = new int[m + 1][n + 1];
        for (int i = 0; i <= m; i++) dp[i][0] = 1;
        for (int i = 1; i <= m; i++)
            for (int j = 1; j <= n; j++)
                dp[i][j] = dp[i - 1][j] + (s.charAt(i - 1) == t.charAt(j - 1) ? dp[i - 1][j - 1] : 0);
        return dp[m][n];
    }
}`,
          cpp: r`class Solution {
public:
    int numDistinct(string s, string t) {
        int m = s.size(), n = t.size();
        vector<vector<unsigned>> dp(m + 1, vector<unsigned>(n + 1, 0));
        for (int i = 0; i <= m; i++) dp[i][0] = 1;
        for (int i = 1; i <= m; i++)
            for (int j = 1; j <= n; j++)
                dp[i][j] = dp[i - 1][j] + (s[i - 1] == t[j - 1] ? dp[i - 1][j - 1] : 0u);
        return (int) dp[m][n];
    }
};`,
          python: r`class Solution:
    def numDistinct(self, s: str, t: str) -> int:
        m, n = len(s), len(t)
        dp = [[1] + [0] * n for _ in range(m + 1)]
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                dp[i][j] = dp[i - 1][j] + (dp[i - 1][j - 1] if s[i - 1] == t[j - 1] else 0)
        return dp[m][n]`,
          javascript: r`var numDistinct = function(s, t) {
    const m = s.length, n = t.length;
    const dp = Array.from({ length: m + 1 }, () => { const row = new Array(n + 1).fill(0); row[0] = 1; return row; });
    for (let i = 1; i <= m; i++)
        for (let j = 1; j <= n; j++)
            dp[i][j] = (dp[i - 1][j] + (s[i - 1] === t[j - 1] ? dp[i - 1][j - 1] : 0)) >>> 0;
    return dp[m][n];
};`,
        },
      },
      {
        level: 'Optimal', name: 'One row, updated from right to left',
        idea: 'Keep `ways[j]` for the prefix of `s` seen so far. For each new character of `s`, update `j` from right to left so `ways[j − 1]` still holds the value from before this character.',
        steps: [
          '`ways[0] = 1`, the rest 0.',
          'For each character `c` of `s`, for `j` from n down to 1: if `c == t[j − 1]`, `ways[j] += ways[j − 1]`.',
          'Return `ways[n]`.',
        ],
        time: 'O(m·n)', space: 'O(n)',
        why: 'Same work in one row, with the same deliberate 32-bit wrap-around.',
        code: {
          java: r`class Solution {
    public int numDistinct(String s, String t) {
        int n = t.length();
        int[] ways = new int[n + 1];
        ways[0] = 1;
        for (int i = 0; i < s.length(); i++)
            for (int j = n; j >= 1; j--)
                if (s.charAt(i) == t.charAt(j - 1)) ways[j] += ways[j - 1];
        return ways[n];
    }
}`,
          cpp: r`class Solution {
public:
    int numDistinct(string s, string t) {
        int n = t.size();
        vector<unsigned> ways(n + 1, 0);
        ways[0] = 1;
        for (char c : s)
            for (int j = n; j >= 1; j--)
                if (c == t[j - 1]) ways[j] += ways[j - 1];
        return (int) ways[n];
    }
};`,
          python: r`class Solution:
    def numDistinct(self, s: str, t: str) -> int:
        n = len(t)
        ways = [1] + [0] * n
        for c in s:
            for j in range(n, 0, -1):
                if c == t[j - 1]:
                    ways[j] += ways[j - 1]
        return ways[n]`,
          javascript: r`var numDistinct = function(s, t) {
    const n = t.length, ways = new Array(n + 1).fill(0);
    ways[0] = 1;
    for (const c of s)
        for (let j = n; j >= 1; j--)
            if (c === t[j - 1]) ways[j] = (ways[j] + ways[j - 1]) >>> 0;
    return ways[n];
};`,
        },
      },
    ],
  },

  'regular-expression-matching': {
    pattern: 'Two-string DP: a star either matches zero copies (skip it) or one more character',
    approaches: [
      {
        level: 'Brute force', name: 'Recursion on the pattern',
        idea: 'Check whether the first characters match. If the next pattern character is `*`, either skip the starred element entirely, or (if the first character matches) use it for one character of `s` and stay on the same pattern position.',
        steps: [
          '`match(i, j)`: if the pattern is used up, the string must be too.',
          '`first = i < |s| && (p[j] == s[i] || p[j] == ".")`.',
          'If `p[j + 1] == "*"`: return `match(i, j + 2) || (first && match(i + 1, j))`.',
          'Otherwise return `first && match(i + 1, j + 1)`.',
        ],
        time: 'O(2^(m+n))', space: 'O(m + n)',
        why: 'Each star branches in two and the same `(i, j)` repeats.',
        code: {
          java: r`class Solution {
    public boolean isMatch(String s, String p) {
        return match(s, p, 0, 0);
    }

    private boolean match(String s, String p, int i, int j) {
        if (j == p.length()) return i == s.length();
        boolean first = i < s.length() && (p.charAt(j) == s.charAt(i) || p.charAt(j) == '.');
        if (j + 1 < p.length() && p.charAt(j + 1) == '*')
            return match(s, p, i, j + 2) || (first && match(s, p, i + 1, j));
        return first && match(s, p, i + 1, j + 1);
    }
}`,
          cpp: r`class Solution {
    bool match(const string& s, const string& p, size_t i, size_t j) {
        if (j == p.size()) return i == s.size();
        bool first = i < s.size() && (p[j] == s[i] || p[j] == '.');
        if (j + 1 < p.size() && p[j + 1] == '*')
            return match(s, p, i, j + 2) || (first && match(s, p, i + 1, j));
        return first && match(s, p, i + 1, j + 1);
    }
public:
    bool isMatch(string s, string p) {
        return match(s, p, 0, 0);
    }
};`,
          python: r`class Solution:
    def isMatch(self, s: str, p: str) -> bool:
        def match(i, j):
            if j == len(p):
                return i == len(s)
            first = i < len(s) and p[j] in (s[i], ".")
            if j + 1 < len(p) and p[j + 1] == "*":
                return match(i, j + 2) or (first and match(i + 1, j))
            return first and match(i + 1, j + 1)
        return match(0, 0)`,
          javascript: r`var isMatch = function(s, p) {
    const match = (i, j) => {
        if (j === p.length) return i === s.length;
        const first = i < s.length && (p[j] === s[i] || p[j] === '.');
        if (j + 1 < p.length && p[j + 1] === '*') return match(i, j + 2) || (first && match(i + 1, j));
        return first && match(i + 1, j + 1);
    };
    return match(0, 0);
};`,
        },
      },
      {
        level: 'Better', name: 'Memoised recursion on (i, j)',
        idea: 'The result depends only on the positions `(i, j)`, so cache it: (m + 1)(n + 1) states.',
        steps: [
          'Same recursion as the brute force.',
          'Cache `match(i, j)` and reuse it.',
        ],
        time: 'O(m·n)', space: 'O(m·n)',
        why: 'Each state is computed once with O(1) work.',
        code: {
          java: r`class Solution {
    private Boolean[][] memo;

    public boolean isMatch(String s, String p) {
        memo = new Boolean[s.length() + 1][p.length() + 1];
        return match(s, p, 0, 0);
    }

    private boolean match(String s, String p, int i, int j) {
        if (memo[i][j] != null) return memo[i][j];
        boolean result;
        if (j == p.length()) result = i == s.length();
        else {
            boolean first = i < s.length() && (p.charAt(j) == s.charAt(i) || p.charAt(j) == '.');
            if (j + 1 < p.length() && p.charAt(j + 1) == '*')
                result = match(s, p, i, j + 2) || (first && match(s, p, i + 1, j));
            else result = first && match(s, p, i + 1, j + 1);
        }
        return memo[i][j] = result;
    }
}`,
          cpp: r`class Solution {
    vector<vector<int>> memo; // -1 unknown
    bool match(const string& s, const string& p, size_t i, size_t j) {
        if (memo[i][j] != -1) return memo[i][j];
        bool result;
        if (j == p.size()) result = i == s.size();
        else {
            bool first = i < s.size() && (p[j] == s[i] || p[j] == '.');
            if (j + 1 < p.size() && p[j + 1] == '*') result = match(s, p, i, j + 2) || (first && match(s, p, i + 1, j));
            else result = first && match(s, p, i + 1, j + 1);
        }
        return memo[i][j] = result;
    }
public:
    bool isMatch(string s, string p) {
        memo.assign(s.size() + 1, vector<int>(p.size() + 1, -1));
        return match(s, p, 0, 0);
    }
};`,
          python: r`class Solution:
    def isMatch(self, s: str, p: str) -> bool:
        @cache
        def match(i, j):
            if j == len(p):
                return i == len(s)
            first = i < len(s) and p[j] in (s[i], ".")
            if j + 1 < len(p) and p[j + 1] == "*":
                return match(i, j + 2) or (first and match(i + 1, j))
            return first and match(i + 1, j + 1)
        return match(0, 0)`,
          javascript: r`var isMatch = function(s, p) {
    const memo = new Map();
    const match = (i, j) => {
        const key = i * (p.length + 1) + j;
        if (memo.has(key)) return memo.get(key);
        let result;
        if (j === p.length) result = i === s.length;
        else {
            const first = i < s.length && (p[j] === s[i] || p[j] === '.');
            if (j + 1 < p.length && p[j + 1] === '*') result = match(i, j + 2) || (first && match(i + 1, j));
            else result = first && match(i + 1, j + 1);
        }
        memo.set(key, result);
        return result;
    };
    return match(0, 0);
};`,
        },
      },
      {
        level: 'Optimal', name: 'Bottom-up table from the ends',
        idea: '`dp[i][j]` = does `s[i..]` match `p[j..]`? Fill it from the back with the same rules, so no recursion is needed.',
        steps: [
          '`dp[m][n] = true` (both empty).',
          'For `i` from m down to 0 and `j` from n − 1 down to 0: compute `first`; if `p[j + 1] == "*"`, `dp[i][j] = dp[i][j + 2] || (first && dp[i + 1][j])`; else `dp[i][j] = first && dp[i + 1][j + 1]`.',
          'Return `dp[0][0]`.',
        ],
        time: 'O(m·n)', space: 'O(m·n)',
        why: 'Each cell once with O(1) work; i goes up to m so an empty rest of `s` against a pattern like `a*b*` is handled.',
        code: {
          java: r`class Solution {
    public boolean isMatch(String s, String p) {
        int m = s.length(), n = p.length();
        boolean[][] dp = new boolean[m + 1][n + 1];
        dp[m][n] = true;
        for (int i = m; i >= 0; i--)
            for (int j = n - 1; j >= 0; j--) {
                boolean first = i < m && (p.charAt(j) == s.charAt(i) || p.charAt(j) == '.');
                if (j + 1 < n && p.charAt(j + 1) == '*') dp[i][j] = dp[i][j + 2] || (first && dp[i + 1][j]);
                else dp[i][j] = first && dp[i + 1][j + 1];
            }
        return dp[0][0];
    }
}`,
          cpp: r`class Solution {
public:
    bool isMatch(string s, string p) {
        int m = s.size(), n = p.size();
        vector<vector<bool>> dp(m + 1, vector<bool>(n + 1, false));
        dp[m][n] = true;
        for (int i = m; i >= 0; i--)
            for (int j = n - 1; j >= 0; j--) {
                bool first = i < m && (p[j] == s[i] || p[j] == '.');
                if (j + 1 < n && p[j + 1] == '*') dp[i][j] = dp[i][j + 2] || (first && dp[i + 1][j]);
                else dp[i][j] = first && dp[i + 1][j + 1];
            }
        return dp[0][0];
    }
};`,
          python: r`class Solution:
    def isMatch(self, s: str, p: str) -> bool:
        m, n = len(s), len(p)
        dp = [[False] * (n + 1) for _ in range(m + 1)]
        dp[m][n] = True
        for i in range(m, -1, -1):
            for j in range(n - 1, -1, -1):
                first = i < m and p[j] in (s[i], ".")
                if j + 1 < n and p[j + 1] == "*":
                    dp[i][j] = dp[i][j + 2] or (first and dp[i + 1][j])
                else:
                    dp[i][j] = first and dp[i + 1][j + 1]
        return dp[0][0]`,
          javascript: r`var isMatch = function(s, p) {
    const m = s.length, n = p.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(false));
    dp[m][n] = true;
    for (let i = m; i >= 0; i--)
        for (let j = n - 1; j >= 0; j--) {
            const first = i < m && (p[j] === s[i] || p[j] === '.');
            if (j + 1 < n && p[j + 1] === '*') dp[i][j] = dp[i][j + 2] || (first && dp[i + 1][j]);
            else dp[i][j] = first && dp[i + 1][j + 1];
        }
    return dp[0][0];
};`,
        },
      },
    ],
  },
};
