export default [
  {
    slug: 'longest-common-subsequence', title: 'Longest Common Subsequence', level: 'Medium',
    summary: 'Return the length of the longest subsequence common to both strings (0 if none).',
    method: 'longestCommonSubsequence', params: [['String', 'text1'], ['String', 'text2']], returns: 'int',
    tests: [
      { in: ['abcde', 'ace'], out: 3 },
      { in: ['abc', 'abc'], out: 3 },
      { in: ['abc', 'def'], out: 0 },
      { in: ['bsbininm', 'jmjkbkjkv'] },
      { in: ['ezupkr', 'ubmrapg'] },
    ],
    ref: `class Solution {
    public int longestCommonSubsequence(String a, String b) {
        int[][] dp = new int[a.length() + 1][b.length() + 1];
        for (int i = 1; i <= a.length(); i++) for (int j = 1; j <= b.length(); j++)
            dp[i][j] = a.charAt(i - 1) == b.charAt(j - 1) ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
        return dp[a.length()][b.length()];
    }
}`,
  },
  {
    slug: 'delete-operation-for-two-strings', title: 'Delete Operation for Two Strings', level: 'Medium',
    summary: 'Each step deletes one character from either string. Return the fewest steps to make the two strings equal.',
    method: 'minDistance', params: [['String', 'word1'], ['String', 'word2']], returns: 'int',
    tests: [
      { in: ['sea', 'eat'], out: 2 },
      { in: ['leetcode', 'etco'], out: 4 },
      { in: ['a', 'a'] },
      { in: ['abc', 'xyz'] },
      { in: ['intention', 'execution'] },
    ],
    ref: `class Solution {
    public int minDistance(String a, String b) {
        int[][] dp = new int[a.length() + 1][b.length() + 1];
        for (int i = 1; i <= a.length(); i++) for (int j = 1; j <= b.length(); j++)
            dp[i][j] = a.charAt(i - 1) == b.charAt(j - 1) ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
        return a.length() + b.length() - 2 * dp[a.length()][b.length()];
    }
}`,
  },
  {
    slug: 'longest-palindromic-substring', title: 'Longest Palindromic Substring', level: 'Medium',
    summary: 'Return a longest substring of s that is a palindrome. Any palindrome of the maximum length is accepted.',
    method: 'longestPalindrome', params: [['String', 's']], returns: 'String', check: 'custom:palindrome',
    tests: [
      { in: ['babad'] },
      { in: ['cbbd'], out: 'bb' },
      { in: ['a'] },
      { in: ['forgeeksskeegfor'] },
      { in: ['abcda'] },
    ],
    ref: `class Solution {
    public String longestPalindrome(String s) {
        int bestL = 0, bestLen = 0;
        for (int c = 0; c < 2 * s.length() - 1; c++) {
            int l = c / 2, r = l + c % 2;
            while (l >= 0 && r < s.length() && s.charAt(l) == s.charAt(r)) { l--; r++; }
            if (r - l - 1 > bestLen) { bestLen = r - l - 1; bestL = l + 1; }
        }
        return s.substring(bestL, bestL + bestLen);
    }
}`,
  },
  {
    slug: 'longest-palindromic-subsequence', title: 'Longest Palindromic Subsequence', level: 'Medium',
    summary: 'Return the length of the longest subsequence of s that is a palindrome.',
    method: 'longestPalindromeSubseq', params: [['String', 's']], returns: 'int',
    tests: [
      { in: ['bbbab'], out: 4 },
      { in: ['cbbd'], out: 2 },
      { in: ['a'] },
      { in: ['agbdba'] },
      { in: ['abcdef'] },
    ],
    ref: `class Solution {
    public int longestPalindromeSubseq(String s) {
        int n = s.length();
        int[][] dp = new int[n][n];
        for (int i = n - 1; i >= 0; i--) {
            dp[i][i] = 1;
            for (int j = i + 1; j < n; j++) dp[i][j] = s.charAt(i) == s.charAt(j) ? dp[i + 1][j - 1] + 2 : Math.max(dp[i + 1][j], dp[i][j - 1]);
        }
        return dp[0][n - 1];
    }
}`,
  },
  {
    slug: 'palindromic-substrings', title: 'Palindromic Substrings', level: 'Medium',
    summary: 'Count the substrings of s that are palindromes (substrings at different positions count separately).',
    method: 'countSubstrings', params: [['String', 's']], returns: 'int',
    tests: [
      { in: ['abc'], out: 3 },
      { in: ['aaa'], out: 6 },
      { in: ['a'] },
      { in: ['abba'] },
      { in: ['racecar'] },
    ],
    ref: `class Solution {
    public int countSubstrings(String s) {
        int count = 0;
        for (int c = 0; c < 2 * s.length() - 1; c++) {
            int l = c / 2, r = l + c % 2;
            while (l >= 0 && r < s.length() && s.charAt(l) == s.charAt(r)) { count++; l--; r++; }
        }
        return count;
    }
}`,
  },
  {
    slug: 'interleaving-string', title: 'Interleaving String', level: 'Medium',
    summary: 'Return whether s3 can be formed by interleaving s1 and s2, keeping each string\'s characters in their original order.',
    method: 'isInterleave', params: [['String', 's1'], ['String', 's2'], ['String', 's3']], returns: 'boolean',
    tests: [
      { in: ['aabcc', 'dbbca', 'aadbbcbcac'], out: true },
      { in: ['aabcc', 'dbbca', 'aadbbbaccc'], out: false },
      { in: ['', '', ''], out: true },
      { in: ['a', '', 'a'] },
      { in: ['ab', 'cd', 'acdb'] },
    ],
    ref: `class Solution {
    public boolean isInterleave(String a, String b, String c) {
        if (a.length() + b.length() != c.length()) return false;
        boolean[][] dp = new boolean[a.length() + 1][b.length() + 1];
        dp[0][0] = true;
        for (int i = 0; i <= a.length(); i++) for (int j = 0; j <= b.length(); j++) {
            if (i > 0 && dp[i - 1][j] && a.charAt(i - 1) == c.charAt(i + j - 1)) dp[i][j] = true;
            if (j > 0 && dp[i][j - 1] && b.charAt(j - 1) == c.charAt(i + j - 1)) dp[i][j] = true;
        }
        return dp[a.length()][b.length()];
    }
}`,
  },
  {
    slug: 'edit-distance', title: 'Edit Distance', level: 'Medium',
    summary: 'Return the fewest insertions, deletions and replacements of single characters that turn word1 into word2.',
    method: 'minDistance', params: [['String', 'word1'], ['String', 'word2']], returns: 'int',
    tests: [
      { in: ['horse', 'ros'], out: 3 },
      { in: ['intention', 'execution'], out: 5 },
      { in: ['', 'abc'] },
      { in: ['same', 'same'] },
      { in: ['kitten', 'sitting'] },
    ],
    ref: `class Solution {
    public int minDistance(String a, String b) {
        int[][] dp = new int[a.length() + 1][b.length() + 1];
        for (int i = 0; i <= a.length(); i++) dp[i][0] = i;
        for (int j = 0; j <= b.length(); j++) dp[0][j] = j;
        for (int i = 1; i <= a.length(); i++) for (int j = 1; j <= b.length(); j++)
            dp[i][j] = a.charAt(i - 1) == b.charAt(j - 1) ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j - 1], Math.min(dp[i - 1][j], dp[i][j - 1]));
        return dp[a.length()][b.length()];
    }
}`,
  },
  {
    slug: 'distinct-subsequences', title: 'Distinct Subsequences', level: 'Hard',
    summary: 'Return how many distinct subsequences of s equal t (the answer fits in 32 bits).',
    method: 'numDistinct', params: [['String', 's'], ['String', 't']], returns: 'int',
    tests: [
      { in: ['rabbbit', 'rabbit'], out: 3 },
      { in: ['babgbag', 'bag'], out: 5 },
      { in: ['a', 'b'] },
      { in: ['aaaa', 'aa'] },
    ],
    ref: `class Solution {
    public int numDistinct(String s, String t) {
        long[] dp = new long[t.length() + 1];
        dp[0] = 1;
        for (int i = 1; i <= s.length(); i++) for (int j = Math.min(i, t.length()); j >= 1; j--) if (s.charAt(i - 1) == t.charAt(j - 1)) dp[j] += dp[j - 1];
        return (int) dp[t.length()];
    }
}`,
  },
  {
    slug: 'regular-expression-matching', title: 'Regular Expression Matching', level: 'Hard',
    summary: 'Match the whole string s against pattern p, where "." matches any character and "*" matches zero or more of the preceding element.',
    method: 'isMatch', params: [['String', 's'], ['String', 'p']], returns: 'boolean',
    tests: [
      { in: ['aa', 'a'], out: false },
      { in: ['aa', 'a*'], out: true },
      { in: ['ab', '.*'], out: true },
      { in: ['aab', 'c*a*b'] },
      { in: ['mississippi', 'mis*is*p*.'] },
      { in: ['', 'a*b*'] },
    ],
    ref: `class Solution {
    public boolean isMatch(String s, String p) {
        boolean[][] dp = new boolean[s.length() + 1][p.length() + 1];
        dp[0][0] = true;
        for (int j = 2; j <= p.length(); j++) if (p.charAt(j - 1) == '*') dp[0][j] = dp[0][j - 2];
        for (int i = 1; i <= s.length(); i++) for (int j = 1; j <= p.length(); j++) {
            char pc = p.charAt(j - 1);
            if (pc == '*') {
                dp[i][j] = dp[i][j - 2];
                char prev = p.charAt(j - 2);
                if (prev == '.' || prev == s.charAt(i - 1)) dp[i][j] |= dp[i - 1][j];
            } else dp[i][j] = dp[i - 1][j - 1] && (pc == '.' || pc == s.charAt(i - 1));
        }
        return dp[s.length()][p.length()];
    }
}`,
  },
];
