export default [
  {
    slug: 'find-the-index-of-the-first-occurrence-in-a-string', title: 'Find the Index of the First Occurrence in a String', level: 'Easy',
    summary: 'Return the index of the first occurrence of needle in haystack, or -1.',
    method: 'strStr', params: [['String', 'haystack'], ['String', 'needle']], returns: 'int',
    tests: [
      { in: ['sadbutsad', 'sad'], out: 0 },
      { in: ['leetcode', 'leeto'], out: -1 },
      { in: ['a', 'a'] },
      { in: ['mississippi', 'issip'] },
      { in: ['aaaaab', 'aab'] },
    ],
    ref: `class Solution {
    public int strStr(String haystack, String needle) {
        int m = needle.length();
        int[] lps = new int[m];
        for (int i = 1, len = 0; i < m; ) { if (needle.charAt(i) == needle.charAt(len)) lps[i++] = ++len; else if (len > 0) len = lps[len - 1]; else lps[i++] = 0; }
        for (int i = 0, j = 0; i < haystack.length(); ) {
            if (haystack.charAt(i) == needle.charAt(j)) { i++; j++; if (j == m) return i - m; }
            else if (j > 0) j = lps[j - 1]; else i++;
        }
        return -1;
    }
}`,
  },
  {
    slug: 'rotate-string', title: 'Rotate String', level: 'Easy',
    summary: 'Return whether s can become goal by repeatedly moving its first character to the end.',
    method: 'rotateString', params: [['String', 's'], ['String', 'goal']], returns: 'boolean',
    tests: [
      { in: ['abcde', 'cdeab'], out: true },
      { in: ['abcde', 'abced'], out: false },
      { in: ['a', 'a'] },
      { in: ['aa', 'a'] },
      { in: ['abab', 'baba'] },
    ],
    ref: `class Solution {
    public boolean rotateString(String s, String goal) { return s.length() == goal.length() && (s + s).contains(goal); }
}`,
  },
  {
    slug: 'repeated-substring-pattern', title: 'Repeated Substring Pattern', level: 'Easy',
    summary: 'Return whether s can be built by repeating one of its substrings two or more times.',
    method: 'repeatedSubstringPattern', params: [['String', 's']], returns: 'boolean',
    tests: [
      { in: ['abab'], out: true },
      { in: ['aba'], out: false },
      { in: ['abcabcabcabc'], out: true },
      { in: ['a'] },
      { in: ['aabaaba'] },
    ],
    ref: `class Solution {
    public boolean repeatedSubstringPattern(String s) {
        int n = s.length();
        int[] lps = new int[n];
        for (int i = 1, len = 0; i < n; ) { if (s.charAt(i) == s.charAt(len)) lps[i++] = ++len; else if (len > 0) len = lps[len - 1]; else lps[i++] = 0; }
        int border = lps[n - 1];
        return border > 0 && n % (n - border) == 0;
    }
}`,
  },
  {
    slug: 'repeated-string-match', title: 'Repeated String Match', level: 'Medium',
    summary: 'Return the fewest times a must be repeated so that b is a substring of the result, or -1 if impossible.',
    method: 'repeatedStringMatch', params: [['String', 'a'], ['String', 'b']], returns: 'int',
    tests: [
      { in: ['abcd', 'cdabcdab'], out: 3 },
      { in: ['a', 'aa'], out: 2 },
      { in: ['abc', 'wxyz'] },
      { in: ['abc', 'cabcabca'] },
      { in: ['aaaaaaaaaaaaaaaaaaaaaab', 'ba'] },
    ],
    ref: `class Solution {
    public int repeatedStringMatch(String a, String b) {
        StringBuilder sb = new StringBuilder();
        int k = 0;
        while (sb.length() < b.length()) { sb.append(a); k++; }
        if (sb.indexOf(b) >= 0) return k;
        if (sb.append(a).indexOf(b) >= 0) return k + 1;
        return -1;
    }
}`,
  },
  {
    slug: 'repeated-dna-sequences', title: 'Repeated DNA Sequences', level: 'Medium',
    summary: 'Return every 10-letter substring that occurs more than once in the DNA string, in any order.',
    method: 'findRepeatedDnaSequences', params: [['String', 's']], returns: 'List<String>', check: 'any-order',
    tests: [
      { in: ['AAAAACCCCCAAAAACCCCCCAAAAAGGGTTT'], out: ['AAAAACCCCC', 'CCCCCAAAAA'] },
      { in: ['AAAAAAAAAAAAA'], out: ['AAAAAAAAAA'] },
      { in: ['ACGT'] },
      { in: ['AAAAAAAAAAA'] },
    ],
    ref: `class Solution {
    public List<String> findRepeatedDnaSequences(String s) {
        Set<String> seen = new HashSet<>(), out = new HashSet<>();
        for (int i = 0; i + 10 <= s.length(); i++) { String t = s.substring(i, i + 10); if (!seen.add(t)) out.add(t); }
        return new ArrayList<>(out);
    }
}`,
  },
  {
    slug: 'longest-happy-prefix', title: 'Longest Happy Prefix', level: 'Hard',
    summary: 'Return the longest non-empty proper prefix of s that is also a suffix (overlaps allowed), or "".',
    method: 'longestPrefix', params: [['String', 's']], returns: 'String',
    tests: [
      { in: ['level'], out: 'l' },
      { in: ['ababab'], out: 'abab' },
      { in: ['a'] },
      { in: ['aaaa'] },
      { in: ['abcd'] },
    ],
    ref: `class Solution {
    public String longestPrefix(String s) {
        int n = s.length();
        int[] lps = new int[n];
        for (int i = 1, len = 0; i < n; ) { if (s.charAt(i) == s.charAt(len)) lps[i++] = ++len; else if (len > 0) len = lps[len - 1]; else lps[i++] = 0; }
        return s.substring(0, lps[n - 1]);
    }
}`,
  },
  {
    slug: 'shortest-palindrome', title: 'Shortest Palindrome', level: 'Hard',
    summary: 'Add the fewest characters in front of s to make it a palindrome, and return that palindrome.',
    method: 'shortestPalindrome', params: [['String', 's']], returns: 'String',
    tests: [
      { in: ['aacecaaa'], out: 'aaacecaaa' },
      { in: ['abcd'], out: 'dcbabcd' },
      { in: [''] },
      { in: ['a'] },
      { in: ['abab'] },
    ],
    ref: `class Solution {
    public String shortestPalindrome(String s) {
        String t = s + "#" + new StringBuilder(s).reverse();
        int[] lps = new int[t.length()];
        for (int i = 1, len = 0; i < t.length(); ) { if (t.charAt(i) == t.charAt(len)) lps[i++] = ++len; else if (len > 0) len = lps[len - 1]; else lps[i++] = 0; }
        return new StringBuilder(s.substring(lps[t.length() - 1])).reverse() + s;
    }
}`,
  },
  {
    slug: 'longest-duplicate-substring', title: 'Longest Duplicate Substring', level: 'Hard',
    summary: 'Return any longest substring that occurs at least twice in s (occurrences may overlap), or "" if none.',
    method: 'longestDupSubstring', params: [['String', 's']], returns: 'String', check: 'custom:duplicateSubstring',
    tests: [
      { in: ['banana'], out: 'ana' },
      { in: ['abcd'], out: '' },
      { in: ['aa'] },
      { in: ['abcabcab'] },
      { in: ['nnpxouomcofdjuujloanjimymadkuepightrfodmauhrsy'] },
    ],
    ref: `class Solution {
    public String longestDupSubstring(String s) {
        int lo = 0, hi = s.length() - 1, start = 0;
        while (lo < hi) {
            int mid = (lo + hi + 1) / 2, at = find(s, mid);
            if (at >= 0) { lo = mid; start = at; } else hi = mid - 1;
        }
        return s.substring(start, start + lo);
    }
    private int find(String s, int len) {
        Map<String, Integer> seen = new HashMap<>();
        for (int i = 0; i + len <= s.length(); i++) { String t = s.substring(i, i + len); if (seen.putIfAbsent(t, i) != null) return i; }
        return -1;
    }
}`,
  },
];
