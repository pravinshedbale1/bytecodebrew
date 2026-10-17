export default {
  'longest-common-subsequence': {
    statement: `Return the length of the longest common subsequence of \`text1\` and \`text2\`, or \`0\` if they share none.

A subsequence keeps the original order of characters but may skip some, so \`"ace"\` is a subsequence of \`"abcde"\`.`,
    constraints: ['1 <= text1.length, text2.length <= 1000', 'Both strings have only lowercase English letters'],
    hints: [
      'Compare the last characters. If they match, they can end the common subsequence; if not, one of them must be dropped.',
      'L[i][j] = L[i − 1][j − 1] + 1 if text1[i − 1] == text2[j − 1], otherwise max(L[i − 1][j], L[i][j − 1]).',
      'The table is (m + 1) × (n + 1) with zeros in row 0 and column 0. Two rows are enough for O(n) space.',
    ],
  },
  'delete-operation-for-two-strings': {
    statement: `In one step you may delete exactly one character from either \`word1\` or \`word2\`. Return the minimum number of steps needed to make the two strings equal.`,
    constraints: ['1 <= word1.length, word2.length <= 500', 'Both strings have only lowercase English letters'],
    hints: [
      'The characters you keep form a common subsequence. To delete as little as possible, keep the longest one.',
      'Compute the longest common subsequence L.',
      'The answer is (word1.length − L) + (word2.length − L). A direct DP on deletions works too.',
    ],
  },
  'longest-palindromic-substring': {
    statement: `Return a longest contiguous substring of \`s\` that reads the same forwards and backwards.

If several substrings share the maximum length, any of them is accepted.`,
    constraints: ['1 <= s.length <= 1000', '`s` has only digits and English letters'],
    hints: [
      'Every palindrome mirrors around its centre, and a centre is either one character or the gap between two.',
      'For each of the 2n − 1 centres, expand outward while the characters on both sides match.',
      'Keep the longest expansion. That is O(n²) time and O(1) space. A DP table isPal[i][j] also works, and Manacher\'s algorithm is O(n).',
    ],
  },
  'longest-palindromic-subsequence': {
    statement: `Return the length of the longest subsequence of \`s\` that is a palindrome. A subsequence keeps the order of characters but may skip some.`,
    constraints: ['1 <= s.length <= 1000', '`s` has only lowercase English letters'],
    hints: [
      'Look at the two ends of the range s[i..j]. If they are equal, both can be in the palindrome.',
      'P[i][j] = P[i + 1][j − 1] + 2 if s[i] == s[j], otherwise max(P[i + 1][j], P[i][j − 1]); P[i][i] = 1.',
      'Fill by increasing length (or i from the end). It is also the LCS of s and reverse(s).',
    ],
  },
  'palindromic-substrings': {
    statement: `Count the substrings of \`s\` that are palindromes. Substrings at different positions are counted separately even if they contain the same characters.`,
    constraints: ['1 <= s.length <= 1000', '`s` has only lowercase English letters'],
    hints: [
      'Every palindromic substring has a centre: a single character or the gap between two characters.',
      'Expand around each of the 2n − 1 centres and count every step at which the two sides still match.',
      'That counts each palindrome exactly once, in O(n²) time and O(1) space.',
    ],
  },
  'interleaving-string': {
    statement: `Return \`true\` if \`s3\` can be formed by interleaving \`s1\` and \`s2\`: merging their characters into one string while keeping the characters of each in their original order.

For example, \`"aadbbcbcac"\` interleaves \`"aabcc"\` and \`"dbbca"\`.`,
    constraints: ['0 <= s1.length, s2.length <= 100', '0 <= s3.length <= 200', 'All strings have only lowercase English letters'],
    hints: [
      'If the lengths do not add up, the answer is false. Greedy matching fails when both strings could supply the next character.',
      'ok[i][j] means "the first i characters of s1 and the first j of s2 can form the first i + j of s3".',
      'ok[i][j] = (ok[i − 1][j] && s1[i − 1] == s3[i + j − 1]) || (ok[i][j − 1] && s2[j − 1] == s3[i + j − 1]), with ok[0][0] = true.',
    ],
  },
  'edit-distance': {
    statement: `Return the minimum number of operations that turn \`word1\` into \`word2\`. Each operation inserts, deletes or replaces a single character.`,
    constraints: ['0 <= word1.length, word2.length <= 500', 'Both strings have only lowercase English letters'],
    hints: [
      'Look at the last characters of the prefixes word1[0..i) and word2[0..j). If they match, no operation is needed for them.',
      'Otherwise D[i][j] = 1 + min(D[i − 1][j] (delete), D[i][j − 1] (insert), D[i − 1][j − 1] (replace)).',
      'D[i][0] = i and D[0][j] = j. Two rows are enough.',
    ],
  },
  'distinct-subsequences': {
    statement: `Return the number of distinct subsequences of \`s\` that equal \`t\`. Two subsequences are different if they use different positions of \`s\`.

The answer fits in a 32-bit signed integer.`,
    constraints: ['1 <= s.length, t.length <= 1000', 'Both strings have only English letters'],
    hints: [
      'Count the ways to match t[0..j) using s[0..i). The new character s[i − 1] can be used for t[j − 1] if they are equal, or skipped.',
      'W[i][j] = W[i − 1][j] + (s[i − 1] == t[j − 1] ? W[i − 1][j − 1] : 0), with W[i][0] = 1.',
      'With a one-dimensional array, update j from right to left. Intermediate values can exceed an int, so use a long or guard them.',
    ],
  },
  'regular-expression-matching': {
    statement: `Implement matching of a pattern \`p\` against the whole string \`s\` (not just a part of it), where:

- \`.\` matches any single character,
- \`*\` matches zero or more copies of the element just before it.

Every \`*\` in the pattern has a valid character or \`.\` before it.`,
    constraints: ['0 <= s.length <= 21', '1 <= p.length <= 21', '`s` has only lowercase letters; `p` has lowercase letters, "." and "*"'],
    hints: [
      'Plain recursion branches at every "*" and can take exponential time on patterns like "a*a*a*…c". Memoise it.',
      'M[i][j] means s[i..] matches p[j..]. If p[j + 1] is "*", either skip "x*" (M[i][j + 2]) or, if s[i] matches x, consume one character (M[i + 1][j]).',
      'Otherwise the characters must match and you move on: first-match && M[i + 1][j + 1]. The base case is the end of the pattern.',
    ],
  },
};
