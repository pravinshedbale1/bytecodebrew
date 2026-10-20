export default {
  'binary-search': {
    explain: '9 is stored at index 4 of `[-1,0,3,5,9,12]` (indices start at 0), so the answer is 4. Binary search finds it by comparing with the middle and discarding half of the array each step.',
    more: 'Indices start at 0. Because the values are sorted, comparing `target` with the middle element tells you which half can still contain it, so each step halves the search range.',
  },
  'search-insert-position': {
    explain: '5 is already in `[1,3,5,6]` at index 2, so the answer is 2. If it were missing, the answer would be the index where it would have to be inserted to keep the array sorted.',
  },
  'first-bad-version': {
    explain: 'Versions 4 and 5 are bad and 1 to 3 are good. Checking version 3 shows good, so the first bad one is later; checking version 4 shows bad, and it is the first. The answer is 4.',
  },
  sqrtx: {
    explain: '2 × 2 = 4, so the square root of 4 is exactly 2. For a value like 8 the true root is about 2.83, and rounding down would also give 2.',
    more: 'Rounding down means returning the largest integer `r` with `r × r ≤ x`. Use a type wide enough for `r × r` (a `long` in Java), since the square can overflow a 32-bit int near the top of the range.',
  },
  'find-first-and-last-position-of-element-in-sorted-array': {
    explain: 'The value 8 appears at indices 3 and 4 of `[5,7,7,8,8,10]`, so its first position is 3 and its last is 4: `[3,4]`. A value that doesn\'t appear would give `[-1,-1]`.',
  },
  'search-a-2d-matrix': {
    explain: 'Read row by row, the matrix is one sorted list `1, 3, 5, 7, 10, …, 60`. 3 is in the first row, so the answer is `true`.',
  },
  'find-minimum-in-rotated-sorted-array': {
    explain: '`[3,4,5,1,2]` is `[1,2,3,4,5]` rotated three places. The minimum is where the order breaks, right after 5, so the answer is 1.',
  },
  'search-in-rotated-sorted-array': {
    explain: '0 sits at index 4 of `[4,5,6,7,0,1,2]`, so the answer is 4. At every step one half of the range is sorted, which tells you whether the target can be inside it.',
    more: 'Rotation keeps the values in order but starts the array part-way through, so it consists of two sorted runs. Searching for a value that isn\'t present returns `-1`.',
  },
  'find-peak-element': {
    explain: 'In `[1,2,3,1]` the 3 at index 2 is larger than both neighbours (2 and 1), so index 2 is a peak and the answer is 2.',
  },
  'median-of-two-sorted-arrays': {
    explain: 'Merged, the arrays are `[1,2,3]`. With an odd count the median is the middle value, 2, returned as a double: 2.0.',
  },
};
