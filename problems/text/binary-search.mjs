export default {
  'binary-search': {
    statement: `\`nums\` is sorted in ascending order and its values are distinct. Return the index of \`target\` in \`nums\`, or \`-1\` if it is not there.

Your algorithm must run in O(log n) time.`,
    constraints: ['1 <= nums.length <= 1e4', '-1e4 < nums[i] < 1e4', '-1e4 < target < 1e4', '`nums` is sorted ascending and has distinct values'],
    hints: [
      'Compare target with the middle element. What does the result tell you about the half you can ignore?',
      'Keep a search range [lo, hi]. If nums[mid] < target the answer is right of mid; if it is greater, left of mid.',
      'Use lo <= hi as the loop condition and mid = lo + (hi − lo) / 2 to avoid overflow. Return −1 when the range is empty.',
    ],
  },
  'search-insert-position': {
    statement: `\`nums\` is sorted in ascending order with distinct values. If \`target\` is in the array, return its index. Otherwise return the index where it would have to be inserted to keep the array sorted.

Run in O(log n) time.`,
    constraints: ['1 <= nums.length <= 1e4', '-1e4 <= nums[i] <= 1e4', '-1e4 <= target <= 1e4', '`nums` is sorted ascending and has distinct values'],
    hints: [
      'Both cases ask the same question: what is the first index whose value is ≥ target?',
      'Binary-search for that "lower bound". The insert position can be nums.length, so search the range [0, n].',
      'With lo = 0, hi = n: if nums[mid] < target set lo = mid + 1, otherwise hi = mid. When lo == hi, that is the answer.',
    ],
  },
  'first-bad-version': {
    statement: `You have versions \`1, 2, …, n\` of a product. At some point a bad version was released, and every version after it is bad as well. Find the first bad version.

You are given an API \`boolean isBadVersion(int version)\`. Call it as few times as possible. (The judge also passes the first bad version as \`bad\` so that it can answer \`isBadVersion\`; your code should not read it.)`,
    constraints: ['1 <= n <= 2^31 - 1', '1 <= bad <= n'],
    hints: [
      'The versions look like good, good, …, good, bad, bad, … . You are searching for the boundary.',
      'Binary search: if mid is bad, the first bad version is at mid or before it; if mid is good, it is after mid.',
      'Use lo = 1, hi = n and keep hi = mid when mid is bad. Compute mid as lo + (hi − lo) / 2, because lo + hi can overflow an int when n is near 2³¹.',
    ],
  },
  'sqrtx': {
    statement: `Given a non-negative integer \`x\`, return the square root of \`x\` rounded down to the nearest integer.

Do not use built-in power or square-root functions such as \`Math.sqrt\` or \`Math.pow\`.`,
    constraints: ['0 <= x <= 2^31 - 1'],
    hints: [
      'You want the largest integer r with r × r ≤ x. That condition is true for small r and false for large r.',
      'Binary-search r in [0, x] (or [0, 46340], since 46341² overflows an int).',
      'Compute mid × mid as a long, or compare mid <= x / mid, so the square never overflows.',
    ],
  },
  'find-first-and-last-position-of-element-in-sorted-array': {
    statement: `\`nums\` is sorted in non-decreasing order and may contain duplicates. Return the first and the last index at which \`target\` appears, as \`[first, last]\`. If \`target\` does not appear, return \`[-1, -1]\`.

Run in O(log n) time, so a linear scan over the duplicates is not enough.`,
    constraints: ['0 <= nums.length <= 1e5', '-1e9 <= nums[i] <= 1e9', '-1e9 <= target <= 1e9', '`nums` is sorted in non-decreasing order'],
    hints: [
      'Do two binary searches: one for the leftmost occurrence and one for the rightmost.',
      'Leftmost: the first index with nums[i] ≥ target. Rightmost: the first index with nums[i] > target, minus one.',
      'If the leftmost index is out of range or nums[left] != target, return [-1, -1].',
    ],
  },
  'search-a-2d-matrix': {
    statement: `Every row of \`matrix\` is sorted in ascending order, and the first value of each row is greater than the last value of the row before it. Return \`true\` if \`target\` is in the matrix and \`false\` otherwise.

Run in O(log(m · n)) time.`,
    constraints: ['1 <= matrix.length <= 100', '1 <= matrix[0].length <= 100', '-1e4 <= matrix[i][j] <= 1e4', '-1e4 <= target <= 1e4'],
    hints: [
      'Read the matrix row by row: it is one long sorted list.',
      'Binary-search over positions 0 … m·n − 1 of that imaginary list.',
      'Position p is the cell matrix[p / cols][p % cols].',
    ],
  },
  'find-minimum-in-rotated-sorted-array': {
    statement: `A sorted array of distinct values was rotated: some prefix was moved to the end, so \`[0,1,2,4,5,6,7]\` might become \`[4,5,6,7,0,1,2]\`. It may also have been rotated by a full cycle and be sorted again.

Return the minimum value, in O(log n) time.`,
    constraints: ['1 <= nums.length <= 5000', '-5000 <= nums[i] <= 5000', 'The values are distinct'],
    hints: [
      'The array is two sorted runs. The minimum is the first element of the second run.',
      'Compare nums[mid] with nums[hi]. If nums[mid] > nums[hi], the drop (and the minimum) is to the right of mid.',
      'Otherwise the minimum is at mid or to its left, so set hi = mid. Stop when lo == hi.',
    ],
  },
  'search-in-rotated-sorted-array': {
    statement: `A sorted array of distinct values was rotated at an unknown index, for example \`[4,5,6,7,0,1,2]\`. Return the index of \`target\` in the rotated array, or \`-1\` if it is not there.

Run in O(log n) time.`,
    constraints: ['1 <= nums.length <= 5000', '-1e4 <= nums[i] <= 1e4', '-1e4 <= target <= 1e4', 'The values are distinct'],
    hints: [
      'At any mid, at least one of the two halves [lo, mid] and [mid, hi] is sorted normally.',
      'Find out which half is sorted by comparing nums[lo] with nums[mid].',
      'If target lies within the sorted half\'s range, search there; otherwise search the other half.',
    ],
  },
  'find-peak-element': {
    statement: `A peak is an element strictly greater than both of its neighbours. Treat the positions just outside the array as \`−∞\`, so the first or last element can be a peak. Neighbouring values are never equal.

Return the index of any peak; there may be several. Run in O(log n) time.`,
    constraints: ['1 <= nums.length <= 1000', '-2^31 <= nums[i] <= 2^31 - 1', '`nums[i] != nums[i + 1]` for every valid i'],
    hints: [
      'If you stand at mid and the value to the right is bigger, keep walking right: you must reach a peak before falling off the edge.',
      'So compare nums[mid] with nums[mid + 1] and keep the half that goes uphill.',
      'If nums[mid] < nums[mid + 1] set lo = mid + 1, else hi = mid. When lo == hi you are on a peak.',
    ],
  },
  'median-of-two-sorted-arrays': {
    statement: `\`nums1\` and \`nums2\` are each sorted in ascending order. Return the median of all their values combined. If the total count is even, the median is the average of the two middle values.

The intended solution runs in O(log(m + n)) time; merging the arrays is O(m + n).`,
    constraints: ['0 <= nums1.length, nums2.length <= 1000', '1 <= nums1.length + nums2.length <= 2000', '-1e6 <= nums1[i], nums2[i] <= 1e6'],
    hints: [
      'The median splits the combined values into a left half and a right half of equal size. You only need to choose how many of the left half come from nums1.',
      'Binary-search i (taken from nums1) in the shorter array; then j = half − i come from nums2. The split is right when nums1[i−1] ≤ nums2[j] and nums2[j−1] ≤ nums1[i].',
      'Treat out-of-range neighbours as −∞ and +∞. Once the split is right, the median comes from max(left sides) and min(right sides).',
    ],
  },
  'guess-number-higher-or-lower': {
    statement: `We have picked a number \`pick\` between \`1\` and \`n\`. Find it.

Each time you guess, call the provided \`guess(num)\`. It returns:

- \`-1\` if \`num\` is higher than the picked number,
- \`1\` if \`num\` is lower than the picked number,
- \`0\` if \`num\` is the picked number.

Return the picked number. (In our tests the second input tells the judge which number was picked; your code only receives \`n\`.)`,
    constraints: ['1 <= n <= 2^31 - 1', '1 <= pick <= n'],
    hints: [
      'Guessing 1, 2, 3, … needs up to n calls, which is about 2 · 10⁹ in the worst case.',
      'Each answer tells you which half the number is in. Keep a range [lo, hi] and always guess the middle.',
      'Compute the middle as lo + (hi − lo) / 2: lo + hi can overflow a 32-bit int when n is close to 2³¹ − 1.',
    ],
  },
  'search-in-rotated-sorted-array-ii': {
    statement: `\`nums\` was sorted in non-decreasing order (it **may contain duplicates**) and then rotated at an unknown index \`k\`, so it reads \`[nums[k], …, nums[n − 1], nums[0], …, nums[k − 1]]\`. For example \`[0,1,2,4,4,4,5,6,6,7]\` might become \`[4,5,6,6,7,0,1,2,4,4]\`.

Return \`true\` if \`target\` is in \`nums\`, and \`false\` otherwise. Try to use as few steps as you can.`,
    constraints: ['1 <= nums.length <= 5000', '-1e4 <= nums[i] <= 1e4', '`nums` is a sorted array rotated at some index', '-1e4 <= target <= 1e4'],
    hints: [
      'Without duplicates, one half around mid is always sorted, and you can tell which by comparing nums[lo] with nums[mid].',
      'Duplicates break that test: when nums[lo] == nums[mid] == nums[hi], you cannot tell which side is sorted.',
      'In that case, shrink both ends by one (lo++, hi−−); they are not the target, since they equal nums[mid]. Otherwise search the sorted half as usual. Worst case O(n), for arrays like [1,1,1,…,13,1,1].',
    ],
  },
  'find-in-mountain-array': {
    statement: `A **mountain array** \`arr\` has length at least 3 and a peak index \`p\` (\`0 < p < arr.length − 1\`) such that values strictly increase up to \`arr[p]\` and strictly decrease after it.

You cannot read the array directly. You only get a \`MountainArray\` object with:

- \`get(k)\`, which returns the value at index \`k\`,
- \`length()\`, which returns the array's length.

Return the **smallest** index whose value equals \`target\`, or \`-1\` if there is none. Calling \`get\` more than **100** times is treated as a wrong answer.`,
    constraints: ['3 <= mountainArr.length <= 1e4', '0 <= target <= 1e9', '0 <= mountainArr[i] <= 1e9'],
    hints: [
      'A linear scan needs up to 10⁴ calls. With 100 allowed, you need a few binary searches of about 14 steps each.',
      'First find the peak: if get(mid) < get(mid + 1), the peak is to the right of mid; otherwise it is at mid or to its left.',
      'Then binary-search the increasing part [0, peak]. Only if the target is not there, binary-search the decreasing part with the comparison reversed. Searching the left side first gives the smallest index.',
    ],
  },
};
