export default {
  'longest-common-subsequence': {
    explain: '"ace" appears in both strings with its letters in order (a, c and e are picked from "abcde" skipping b and d). No longer common subsequence exists, so the answer is 3.',
  },
  'delete-operation-for-two-strings': {
    explain: 'Delete "s" from "sea" and "t" from "eat"; both become "ea". That takes 2 steps, the fewest possible.',
    more: 'The strings end up equal to a common subsequence of both, so the fewest deletions keep their longest common subsequence: the answer is `len(word1) + len(word2) − 2 × LCS`.',
  },
  'longest-palindromic-substring': {
    explain: '"bab" reads the same both ways and no palindrome in "babad" is longer than 3. "aba" is just as long and would also be accepted; the example shows "bab".',
    more: 'A substring is contiguous: its characters sit next to each other in `s`. Every single character is a palindrome, so the answer is never empty.',
  },
  'longest-palindromic-subsequence': {
    explain: 'Skipping the "a" leaves "bbbb", a palindrome of length 4. Keeping all five characters gives "bbbab", which is not a palindrome, so the answer is 4.',
    more: 'For example in "cbbd" the longest palindromic subsequence is "bb", of length 2.',
  },
  'palindromic-substrings': {
    explain: 'The palindromic substrings of "abc" are "a", "b" and "c". No longer substring reads the same backwards, so the answer is 3.',
    more: 'For example "aaa" has 6 palindromic substrings: three single "a"s, two "aa"s and "aaa" itself.',
  },
  'interleaving-string': {
    explain: 'Split s1 as "aa" + "bc" + "c" and s2 as "dbbc" + "a". Alternating the pieces gives "aa" + "dbbc" + "bc" + "a" + "c" = "aadbbcbcac", which is s3, so the answer is `true`.',
  },
  'edit-distance': {
    explain: 'Replace "h" with "r" ("horse" → "rorse"), delete the second "r" ("rose"), then delete "e" ("ros"). Three operations, and no shorter sequence works, so the answer is 3.',
    more: 'For example turning "intention" into "execution" takes 5 operations. Each operation changes exactly one character.',
  },
  'distinct-subsequences': {
    explain: '"rabbbit" has three b\'s and "rabbit" needs two of them. Skipping the first, second or third b gives 3 different choices of positions, so the answer is 3.',
    more: 'The characters of `t` must be matched in order, but they don\'t have to be next to each other in `s`.',
  },
  'regular-expression-matching': {
    explain: 'The pattern "a" matches exactly one "a", but `s` is "aa" and the whole string must match. So the answer is `false`.',
  },
};
