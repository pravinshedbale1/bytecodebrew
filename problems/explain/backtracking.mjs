// Example 1 explained (and extra description where the statement is terse). See problems/text.mjs.
export default {
  subsets: {
    explain: 'Each of the 3 values is either in a subset or not, so there are 2 × 2 × 2 = 8 subsets, from the empty `[]` to the whole `[1,2,3]`. The answer lists all 8: `[[],[1],[1,2],[1,2,3],[1,3],[2],[2,3],[3]]` (any order is fine).',
  },
  combinations: {
    explain: 'With `n = 4` and `k = 2` we choose 2 of the numbers 1, 2, 3, 4. There are C(4, 2) = 6 ways, so the answer is `[[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]`. Order inside a pair doesn\'t matter, so `[2,1]` is the same as `[1,2]` and is not listed again.',
    more: 'A combination is a set, not a sequence: `[1,2]` and `[2,1]` count as the same combination and must appear only once. Every number is used at most once within a combination.',
  },
  permutations: {
    explain: 'Three distinct values can be arranged in 3 × 2 × 1 = 6 orders: `[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]`. Every value appears exactly once in each permutation.',
    more: 'Each permutation uses every value of `nums` exactly once, so all of them have the same length as `nums`. For n values there are n! permutations.',
  },
  'combination-sum': {
    explain: '`2 + 2 + 3 = 7` uses the value 2 twice, which is allowed, and `7` alone also reaches the target. No other multiset of 2, 3, 6 and 7 sums to 7, so the answer is `[[2,2,3],[7]]`.',
  },
  'letter-combinations-of-a-phone-number': {
    explain: 'On a phone keypad `2` is "abc" and `3` is "def". Pick one letter for each digit, in order: 3 choices × 3 choices gives 9 strings, `["ad","ae","af","bd","be","bf","cd","ce","cf"]`.',
  },
  'generate-parentheses': {
    explain: 'With 3 pairs, a string is valid when no prefix closes more brackets than it has opened. Exactly 5 strings of length 6 qualify: `["((()))","(()())","(())()","()(())","()()()"]`.',
  },
  'subsets-ii': {
    explain: 'The two 2s are interchangeable, so taking "the first 2" or "the second 2" gives the same subset. The distinct subsets are `[[],[1],[1,2],[1,2,2],[2],[2,2]]`: 6 instead of the 8 a set of three distinct values would have.',
    more: 'Because values can repeat, two different choices of positions can produce the same subset (for `[1,2,2]`, picking either 2 gives `[1,2]`). Such duplicates must appear only once in the answer.',
  },
  'combination-sum-ii': {
    explain: 'Each candidate may be used at most once (the two 1s are two separate candidates). The combinations reaching 8 are `1 + 1 + 6`, `1 + 2 + 5`, `1 + 7` and `2 + 6`, so the answer is `[[1,1,6],[1,2,5],[1,7],[2,6]]`, with no combination listed twice.',
  },
  'permutations-ii': {
    explain: 'The two 1s are identical, so swapping them doesn\'t create a new order. Of the 3! = 6 arrangements only 3 are distinct: `[[1,1,2],[1,2,1],[2,1,1]]`.',
  },
  'palindrome-partitioning': {
    explain: '"aab" can be cut as `a | a | b` (every piece is a palindrome) or `aa | b` ("aa" reads the same both ways). Cuts that produce "ab" or "aab" fail because those are not palindromes. So the answer is `[["a","a","b"],["aa","b"]]`.',
    more: 'A partition cuts `s` into consecutive pieces that, joined back together, give `s` exactly. A single character is always a palindrome, so the all-single-letters partition is always one of the answers.',
  },
  'word-search': {
    explain: 'Start at the `A` in the top-left corner and move right to `B` and `C`, down to the `C` below it, down to `E`, then left to `D`. That traces "ABCCED" through adjacent cells without reusing any, so the answer is `true`.',
    more: 'Adjacent means sharing an edge (up, down, left or right), never diagonally. The same cell cannot be used twice within one word, even if the letter is needed again.',
  },
  'n-queens': {
    explain: 'On a 4 × 4 board there are exactly 2 ways to place 4 queens so that no two share a row, column or diagonal. In the first, the queens sit in columns 1, 3, 0 and 2 of rows 0 to 3 (`.Q..`, `...Q`, `Q...`, `..Q.`); the second is its mirror image.',
  },
  'sudoku-solver': {
    explain: 'Every empty `.` is filled so that each row, each column and each 3 × 3 box contains the digits 1 to 9 exactly once. For example the first row `5 3 . . 7 . . . .` becomes `5 3 4 6 7 8 9 1 2`; the puzzle has exactly one such completion.',
  },
  'sum-of-all-subset-xor-totals': {
    explain: 'The subsets are [], [1], [3] and [1,3], with XOR totals 0, 1, 3 and 1 XOR 3 = 2. Their sum is 0 + 1 + 3 + 2 = 6.',
  },
  'matchsticks-to-square': {
    explain: 'The total is 8, so each side must be 2. One side uses the two 1s and each 2 forms a side on its own, so the answer is `true`.',
    more: 'For example `[3,3,3,3,4]` has total 16, so each side would be 4. The 4 fills one side, but the four 3s cannot make three sides of 4, so that answer is `false`.',
  },
  'n-queens-ii': {
    explain: 'On a 4 × 4 board there are exactly two arrangements: queens in columns 2, 4, 1, 3 (rows 1 to 4) and its mirror image 3, 1, 4, 2. The answer is 2.',
  },
  'word-break-ii': {
    explain: '"catsanddog" splits as cat + sand + dog or as cats + and + dog, and no other split uses only dictionary words. The answer is `["cats and dog","cat sand dog"]` in any order.',
  },
};
