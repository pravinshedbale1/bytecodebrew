export default {
  'find-the-index-of-the-first-occurrence-in-a-string': {
    statement: `Return the index of the first place where \`needle\` occurs as a substring of \`haystack\`, or \`-1\` if it does not occur at all.

Try to write the search yourself instead of calling \`indexOf\`.`,
    constraints: ['1 <= haystack.length, needle.length <= 1e4', 'Both strings have only lowercase English letters'],
    hints: [
      'The simple approach tries every start position and compares character by character: O(n · m).',
      'KMP avoids re-reading text: precompute for the needle the length of the longest proper prefix that is also a suffix, for every prefix.',
      'When a mismatch happens, fall back in the needle using that table instead of moving the text pointer back. That is O(n + m).',
    ],
  },
  'rotate-string': {
    statement: `A shift moves the first character of \`s\` to the end, so \`"abcde"\` becomes \`"bcdea"\`. Return \`true\` if \`s\` can become \`goal\` after some number of shifts (including zero).`,
    constraints: ['1 <= s.length, goal.length <= 100', 'Both strings have only lowercase English letters'],
    hints: [
      'Write s twice in a row. Every rotation of s appears inside that doubled string.',
      'So goal is a rotation of s exactly when the lengths are equal and goal is a substring of s + s.',
      'The length check matters: "a" is a substring of "aaaa" but not a rotation of "aa".',
    ],
  },
  'repeated-substring-pattern': {
    statement: `Return \`true\` if \`s\` can be built by taking one of its substrings and repeating it two or more times, as \`"abab"\` = \`"ab"\` + \`"ab"\`.`,
    constraints: ['1 <= s.length <= 1e4', '`s` has only lowercase English letters'],
    hints: [
      'The repeated block must be a prefix of s, and its length must divide s.length.',
      'Try each divisor length d < n and check whether s equals its first d characters repeated.',
      'A neat trick: s is made of a repeated block exactly when s appears in (s + s) with the first and last characters removed. The KMP prefix table gives an O(n) check too.',
    ],
  },
  'repeated-string-match': {
    statement: `Return the minimum number of times you must repeat string \`a\` so that \`b\` becomes a substring of the result. If no number of repetitions works, return \`-1\`.

Repeating \`"abc"\` 0 times gives \`""\`, once gives \`"abc"\`, and twice gives \`"abcabc"\`.`,
    constraints: ['1 <= a.length, b.length <= 1e4', 'Both strings have only lowercase English letters'],
    hints: [
      'Any match of b must start inside the first copy of a.',
      'So you need at least ceil(b.length / a.length) copies, and never more than one extra copy beyond that.',
      'Build the repeated string with q copies and check for b; if that fails, try q + 1; otherwise the answer is −1. Rabin–Karp or KMP make the search linear.',
    ],
  },
  'repeated-dna-sequences': {
    statement: `A DNA sequence is a string of the letters \`A\`, \`C\`, \`G\` and \`T\`. Return every 10-letter-long substring that occurs more than once in \`s\`.

Return each such substring once, in any order.`,
    constraints: ['1 <= s.length <= 1e5', '`s` has only the letters A, C, G and T'],
    hints: [
      'Slide a window of length 10 and count the substrings you have seen.',
      'A HashSet of seen substrings plus a set of repeated ones is simple and fast enough.',
      'To save memory, encode each letter as 2 bits: a window is a 20-bit integer you can update in O(1) with a shift, an OR and a mask (a rolling hash).',
    ],
  },
  'longest-happy-prefix': {
    statement: `A happy prefix is a non-empty prefix of \`s\` that is also a suffix of \`s\`, not counting \`s\` itself. The prefix and the suffix may overlap.

Return the longest happy prefix, or \`""\` if there is none.`,
    constraints: ['1 <= s.length <= 1e5', '`s` has only lowercase English letters'],
    hints: [
      'Checking every length with a string comparison is O(n²).',
      'This is exactly what the KMP prefix function computes: the length of the longest proper prefix that is also a suffix.',
      'Build the prefix table for the whole string; the answer is s.substring(0, table[n − 1]). A rolling hash comparing prefix and suffix hashes also works.',
    ],
  },
  'shortest-palindrome': {
    statement: `You may add characters only in front of \`s\`. Return the shortest palindrome you can make this way.`,
    constraints: ['0 <= s.length <= 5e4', '`s` has only lowercase English letters'],
    hints: [
      'Find the longest prefix of s that is already a palindrome. Only the rest needs to be mirrored in front.',
      'The longest palindromic prefix is the longest prefix of s that equals a suffix of reverse(s).',
      'Run the KMP prefix function on s + "#" + reverse(s). The last value is that length L; the answer is reverse(s.substring(L)) + s.',
    ],
  },
  'longest-duplicate-substring': {
    statement: `Return any longest substring of \`s\` that occurs at least twice (the occurrences may overlap). If no substring repeats, return \`""\`.

If several repeated substrings have the maximum length, any of them is accepted.`,
    constraints: ['2 <= s.length <= 3e4', '`s` has only lowercase English letters'],
    hints: [
      'If some substring of length L repeats, a substring of every shorter length repeats too. Binary-search the length.',
      'To test a length L, slide a window over s with a rolling hash (Rabin–Karp) and look for a repeated hash.',
      'Hash collisions can happen: confirm a match by comparing the actual substrings, or use two independent hashes. A suffix array also solves it.',
    ],
  },
};
