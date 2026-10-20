export default {
  'partition-equal-subset-sum': {
    explain: 'The total is 22, so each group must sum to 11. `[1,5,5]` and `[11]` both sum to 11, so the answer is `true`.',
    more: 'This is the same as asking whether some subset of `nums` sums to exactly half of the total. An odd total can never be split evenly.',
  },
  'target-sum': {
    explain: 'To reach 3 from five 1s, exactly one of them must be negative, for example `-1 + 1 + 1 + 1 + 1 = 3`. The minus sign can go on any of the 5 numbers, so there are 5 ways.',
    more: 'Every number gets exactly one sign. Two assignments are different if any position\'s sign differs, even when the numbers are equal.',
  },
  'last-stone-weight-ii': {
    explain: 'The total weight is 23. Smashing stones is the same as splitting them into two groups and subtracting; the most even split is 11 against 12 (for example `[2,1,8]` against `[7,4,1]`). So the smallest possible final weight is 1.',
  },
  'coin-change': {
    explain: '11 = 5 + 5 + 1 uses 3 coins, and no combination of 1, 2 and 5 makes 11 with fewer. So the answer is 3.',
  },
  'coin-change-ii': {
    explain: 'There are 4 ways to make 5: `5`, `2 + 2 + 1`, `2 + 1 + 1 + 1` and `1 + 1 + 1 + 1 + 1`. Order doesn\'t matter, so `1 + 2 + 2` is the same way as `2 + 2 + 1`.',
  },
  'combination-sum-iv': {
    explain: 'Here order matters. The sequences summing to 4 are (1,1,1,1), (1,1,2), (1,2,1), (2,1,1), (2,2), (1,3) and (3,1), so the answer is 7.',
  },
  'perfect-squares': {
    explain: '12 = 4 + 4 + 4 uses 3 perfect squares. It can\'t be done with 2 (no two squares add to 12) or with 1 (12 is not a square), so the answer is 3.',
    more: 'The same square may be used more than once. Every number can be written as a sum of 1s, so an answer always exists.',
  },
  'ones-and-zeroes': {
    explain: 'Choosing "10", "0001", "1" and "0" uses 1 + 3 + 0 + 1 = 5 zeros and 1 + 1 + 1 + 0 = 3 ones, exactly the limits. No 5 strings fit, so the answer is 4.',
    more: 'Each string can be chosen at most once. The limits apply to the chosen strings together, counting every `0` and `1` character they contain.',
  },
};
