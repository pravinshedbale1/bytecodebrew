export default {
  'find-all-numbers-disappeared-in-an-array': {
    explain: 'n is 8, so the numbers 1 to 8 should appear. 1, 2, 3, 4, 7 and 8 are present (2 and 3 twice), and 5 and 6 never appear, so the answer is `[5,6]`.',
  },
  'set-mismatch': {
    explain: '`[1,2,2,4]` should have been 1, 2, 3, 4. The value 2 appears twice and 3 is gone, so the answer is `[2,3]`: the repeated value first, then the missing one.',
  },
  'find-missing-and-repeated-values': {
    explain: 'The 2 × 2 grid should hold 1, 2, 3 and 4 once each. It holds 1, 3, 2 and 2: the value 2 appears twice and 4 never appears, so the answer is `[2,4]`.',
  },
  'find-all-duplicates-in-an-array': {
    explain: 'In `[4,3,2,7,8,2,3,1]` the values 2 and 3 each appear twice and every other value appears once, so the answer is `[2,3]` (in any order).',
  },
  'array-nesting': {
    explain: 'Starting at index 0: nums[0] = 5, nums[5] = 6, nums[6] = 2, nums[2] = 0, and the next value would be 5 again. That set {5, 6, 2, 0} has 4 values. The other cycles are {4, 1} and {3}, so the largest size is 4.',
  },
  'minimum-number-of-operations-to-sort-a-binary-tree-by-level': {
    explain: 'Level 1 is [4, 3]: one swap gives [3, 4]. Level 2 is [7, 6, 8, 5]: swapping 7 and 5 gives [5, 6, 8, 7], and swapping 8 and 7 gives [5, 6, 7, 8]. Level 3 is [9, 10], already sorted. That is 1 + 2 = 3 operations.',
  },
  'couples-holding-hands': {
    explain: 'Seats 0 and 1 hold persons 0 and 2, and seats 2 and 3 hold persons 1 and 3. Swapping the people in seats 1 and 2 gives [0, 1, 2, 3], where both couples sit together, so the answer is 1.',
  },
};
