export default {
  'find-the-index-of-the-first-occurrence-in-a-string': {
    explain: '"sad" occurs at index 0 and again at index 6. The first occurrence is at index 0, so the answer is 0.',
    more: 'A simple check at every start position is O(n·m). KMP or a rolling hash brings it down to O(n + m).',
  },
  'rotate-string': {
    explain: 'Two shifts turn "abcde" into "bcdea" and then "cdeab", which is `goal`. So the answer is `true`.',
    more: 'A neat test: `goal` is a rotation of `s` exactly when the two have the same length and `goal` appears inside `s + s`.',
  },
  'repeated-substring-pattern': {
    explain: '"abab" is "ab" written twice, so the answer is `true`.',
    more: 'For contrast, `"aba"` cannot be built this way, and neither can `"abcabcab"`, because no piece repeats a whole number of times to fill it exactly.',
  },
  'repeated-string-match': {
    explain: 'Two copies "abcdabcd" do not contain "cdabcdab", but three copies "abcdabcdabcd" do (starting at index 2). So the answer is 3.',
  },
  'repeated-dna-sequences': {
    explain: '"AAAAACCCCC" appears at index 0 and again at index 10, and "CCCCCAAAAA" appears at index 5 and index 15. No other 10-letter piece repeats, so the answer is `["AAAAACCCCC","CCCCCAAAAA"]`.',
    more: 'Slide a 10-letter window along `s` and remember the windows you have already seen; a window seen a second time is part of the answer.',
  },
  'longest-happy-prefix': {
    explain: '"l" is both the first and the last letter. Longer prefixes ("le", "lev", "leve") do not match the suffixes of the same length ("el", "vel", "evel"), so the answer is "l".',
    more: 'This is exactly the last value of the KMP failure (prefix) function for `s`, so it can be found in linear time.',
  },
  'shortest-palindrome': {
    explain: 'The longest palindrome at the start of "aacecaaa" is "aacecaa". Only the final "a" is left over, so putting one "a" in front gives "aaacecaaa".',
    more: 'For example "abcd" has only "a" as a palindromic start, so the answer there is "dcbabcd". Finding the longest palindromic prefix quickly is the heart of the problem.',
  },
  'longest-duplicate-substring': {
    explain: '"ana" appears at index 1 and again at index 3 (the two copies overlap). No substring of length 4 appears twice, so the answer is "ana".',
  },
};
