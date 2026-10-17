export default {
  'subsets': {
    statement: `\`nums\` has distinct values. Return every possible subset of \`nums\` (the power set), including the empty subset.

The subsets, and the values within each subset, may be in any order. No subset may appear twice.`,
    constraints: ['1 <= nums.length <= 10', '-10 <= nums[i] <= 10', 'The values are distinct'],
    hints: [
      'Each value is either in a subset or not, so there are 2ⁿ subsets.',
      'Backtracking: at index i, try including nums[i] and recurse, then remove it and recurse without it.',
      'Another way: start from [[]] and, for each value, add a copy of every existing subset with that value appended. Bit masks from 0 to 2ⁿ − 1 also work.',
    ],
  },
  'combinations': {
    statement: `Return every combination of \`k\` distinct numbers chosen from \`1\` to \`n\`.

The combinations may be in any order, and so may the numbers inside each one.`,
    constraints: ['1 <= n <= 20', '1 <= k <= n'],
    hints: [
      'A combination ignores order, so always pick numbers in increasing order to avoid repeats.',
      'Recurse with a start number: choose each next number from start to n, then recurse from that number + 1.',
      'Prune: stop when there are not enough numbers left to reach k (when n − next + 1 < k − chosen).',
    ],
  },
  'permutations': {
    statement: `\`nums\` has distinct values. Return every possible ordering (permutation) of them.

The permutations may be listed in any order.`,
    constraints: ['1 <= nums.length <= 6', '-10 <= nums[i] <= 10', 'The values are distinct'],
    hints: [
      'Build a permutation position by position: any unused value can go next.',
      'Backtrack with a boolean "used" array: pick an unused value, mark it, recurse, then unmark it.',
      'Add a copy of the current list when it has length n. An alternative swaps values in place.',
    ],
  },
  'combination-sum': {
    statement: `\`candidates\` has distinct positive integers. Return every unique combination of candidates that adds up to \`target\`. The same candidate may be used any number of times.

Two combinations are the same if they use the same numbers the same number of times. Return them in any order.`,
    constraints: ['1 <= candidates.length <= 30', '2 <= candidates[i] <= 40', 'The candidates are distinct', '1 <= target <= 40'],
    hints: [
      'To avoid listing [2,3] and [3,2] separately, only allow candidates at or after the current index.',
      'Recurse with (start index, remaining target). Try each candidate from start on, and pass the same index again because reuse is allowed.',
      'Sort the candidates so you can stop the loop as soon as a candidate exceeds the remaining target.',
    ],
  },
  'letter-combinations-of-a-phone-number': {
    statement: `On a phone keypad, the digits \`2\`–\`9\` each map to letters (2 → abc, 3 → def, …, 7 → pqrs, 9 → wxyz). Given a string of such digits, return every letter string they could spell.

Return them in any order. An empty \`digits\` string gives an empty list.`,
    constraints: ['0 <= digits.length <= 4', '`digits[i]` is a digit from 2 to 9'],
    hints: [
      'Each digit adds one letter from its group, so the answer has the product of the group sizes.',
      'Recurse over the positions of digits, appending each possible letter to a StringBuilder and removing it afterwards.',
      'Handle the empty input separately, since the recursion would otherwise return [""].',
    ],
  },
  'generate-parentheses': {
    statement: `Return every well-formed (balanced) string made of \`n\` pairs of parentheses. In a well-formed string every \`(\` is closed by a later \`)\`, and no prefix has more \`)\` than \`(\`.

The strings may be in any order.`,
    constraints: ['1 <= n <= 8'],
    hints: [
      'Generating every string of ( and ) and filtering is wasteful. Only build strings that can still become valid.',
      'You may add "(" while fewer than n have been used, and ")" while there are more "(" than ")" so far.',
      'When the string has length 2n, it is complete and valid.',
    ],
  },
  'subsets-ii': {
    statement: `\`nums\` may contain duplicate values. Return every distinct subset, including the empty one.

No two subsets in the answer may contain the same multiset of values. The subsets may be in any order.`,
    constraints: ['1 <= nums.length <= 10', '-10 <= nums[i] <= 10'],
    hints: [
      'Sort first so equal values are next to each other.',
      'Use the subsets backtracking, but at each level of the recursion skip a value equal to the previous value tried at that same level.',
      'In the loop "for i from start", skip i when i > start and nums[i] == nums[i − 1].',
    ],
  },
  'combination-sum-ii': {
    statement: `\`candidates\` may contain duplicates. Return every unique combination of candidates that adds up to \`target\`, where each candidate (each position) may be used at most once.

The answer must not contain the same combination twice. Return the combinations in any order.`,
    constraints: ['1 <= candidates.length <= 100', '1 <= candidates[i] <= 50', '1 <= target <= 30'],
    hints: [
      'This is "Combination Sum" without reuse, plus the duplicate handling from "Subsets II".',
      'Sort, then recurse with (start, remaining). Pass i + 1 to the recursion because each position is used once.',
      'Skip a candidate equal to the previous one at the same level (i > start), and stop the loop when a candidate exceeds the remaining target.',
    ],
  },
  'permutations-ii': {
    statement: `\`nums\` may contain duplicate values. Return every distinct permutation (ordering) of its values, in any order.

Two permutations that list the same values in the same order count once, even if they come from swapping equal values.`,
    constraints: ['1 <= nums.length <= 8', '-10 <= nums[i] <= 10'],
    hints: [
      'Plain permutation backtracking produces the same permutation several times when values repeat.',
      'Sort, and use a "used" array. At each position, skip a value equal to the previous value if that previous copy is not currently used.',
      'That rule makes equal values always appear in the same relative order, so every distinct permutation is produced once.',
    ],
  },
  'palindrome-partitioning': {
    statement: `Split \`s\` into one or more pieces such that every piece is a palindrome. Return every possible way of doing so.

The partitions may be in any order.`,
    constraints: ['1 <= s.length <= 16', '`s` has only lowercase English letters'],
    hints: [
      'Choose the first piece, then partition the rest of the string the same way.',
      'Backtrack over the end of the first piece: only recurse when s[start..end] is a palindrome.',
      'Precompute isPal[i][j] with dynamic programming so every palindrome check is O(1).',
    ],
  },
  'word-search': {
    statement: `\`board\` is a grid of letters. Return \`true\` if \`word\` can be traced on it through cells that are next to each other horizontally or vertically, using each cell at most once.`,
    constraints: ['1 <= board.length <= 6', '1 <= board[0].length <= 6', '1 <= word.length <= 15', 'Letters are uppercase or lowercase English letters'],
    hints: [
      'Try every cell as the starting point of the word.',
      'DFS from a cell with the index of the next letter: fail if out of bounds or the letter does not match; succeed when the whole word is matched.',
      'Mark a cell as used during the DFS (for example by temporarily changing its letter) and restore it when you backtrack.',
    ],
  },
  'n-queens': {
    statement: `Place \`n\` queens on an \`n × n\` chessboard so that no two attack each other (no two share a row, a column or a diagonal). Return every distinct solution.

Each solution is a list of \`n\` strings, one per row, with \`"Q"\` for a queen and \`"."\` for an empty square. The solutions may be in any order.`,
    constraints: ['1 <= n <= 9'],
    hints: [
      'There must be exactly one queen per row, so place them row by row.',
      'For each row, try each column that is not attacked, and backtrack.',
      'Track used columns and both diagonals in boolean arrays: one diagonal is identified by row − col (offset by n), the other by row + col.',
    ],
  },
  'sudoku-solver': {
    statement: `Solve the Sudoku puzzle in \`board\` by filling the empty cells (\`'.'\`) so that each row, each column and each of the nine 3 × 3 boxes contains every digit 1–9 exactly once.

The puzzle has exactly one solution. Change the board in place; the judge prints it after your call.`,
    constraints: ['board.length == 9', 'board[i].length == 9', '`board[i][j]` is a digit 1-9 or "."', 'The puzzle has exactly one solution'],
    hints: [
      'Backtracking: find an empty cell, try each digit that does not conflict, and recurse.',
      'Keep boolean tables for which digits are used in each row, column and box so checking a digit is O(1).',
      'Undo the digit (and the table entries) when the recursion fails. Choosing the empty cell with the fewest options first speeds it up a lot.',
    ],
  },
};
