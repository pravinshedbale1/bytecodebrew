export default {
  'running-sum-of-1d-array': {
    statement: `Return the running sum of \`nums\`: an array of the same length where element \`i\` equals \`nums[0] + nums[1] + … + nums[i]\`.`,
    constraints: ['1 <= nums.length <= 1000', '-1e6 <= nums[i] <= 1e6'],
    hints: [
      'Each running sum is the previous running sum plus one new value.',
      'Loop from index 1 and add the previous element into the current one. You can even do it in place.',
    ],
  },
  'range-sum-query-immutable': {
    statement: `Implement the class \`NumArray\`:

- \`NumArray(int[] nums)\` stores the array,
- \`int sumRange(int left, int right)\` returns \`nums[left] + … + nums[right]\` (both ends inclusive).

The array never changes after construction, and \`sumRange\` may be called many times, so each query should be fast. The tests call the class like LeetCode does: a list of operations and a list of their arguments.`,
    constraints: ['1 <= nums.length <= 1e4', '-1e5 <= nums[i] <= 1e5', '0 <= left <= right < nums.length', 'At most 10^4 calls to sumRange'],
    hints: [
      'Summing the range on every call costs O(n) per query. What could you precompute once?',
      'Store prefix[i] = sum of the first i values (prefix has length n + 1, with prefix[0] = 0).',
      'Then sumRange(left, right) = prefix[right + 1] − prefix[left], which is O(1).',
    ],
  },
  'find-pivot-index': {
    statement: `The pivot index is an index where the sum of all values strictly to its left equals the sum of all values strictly to its right. For the first index the left sum is 0; for the last index the right sum is 0.

Return the leftmost pivot index, or \`-1\` if there is none.`,
    constraints: ['1 <= nums.length <= 1e4', '-1000 <= nums[i] <= 1000'],
    hints: [
      'If you know the total sum and the sum to the left of i, you also know the sum to the right of i.',
      'rightSum = total − leftSum − nums[i].',
      'Scan from the left keeping leftSum; return the first i where leftSum == total − leftSum − nums[i], then add nums[i] to leftSum.',
    ],
  },
  'subarray-sum-equals-k': {
    statement: `Count the contiguous, non-empty subarrays of \`nums\` whose values add up to exactly \`k\`.

Values can be negative, so a growing window does not always mean a growing sum.`,
    constraints: ['1 <= nums.length <= 2e4', '-1000 <= nums[i] <= 1000', '-1e7 <= k <= 1e7'],
    hints: [
      'A sliding window does not work here because of the negative numbers. Think about prefix sums instead.',
      'The subarray (i, j] sums to k exactly when prefix[j] − prefix[i] = k, that is, when prefix[i] = prefix[j] − k.',
      'Scan once, keeping a HashMap from prefix sum to how many times it has occurred (start with {0: 1}). At each step add count[prefix − k] to the answer, then record the current prefix.',
    ],
  },
  'subarray-sums-divisible-by-k': {
    statement: `Count the non-empty contiguous subarrays of \`nums\` whose sum is divisible by \`k\`.

Values may be negative.`,
    constraints: ['1 <= nums.length <= 3e4', '-1e4 <= nums[i] <= 1e4', '2 <= k <= 1e4'],
    hints: [
      'A subarray sum is divisible by k when the two prefix sums at its ends leave the same remainder.',
      'Count how many prefix sums have each remainder, starting with remainder 0 seen once.',
      'Java\'s % can return a negative value for a negative sum. Normalise it with ((sum % k) + k) % k before using it as a key.',
    ],
  },
  'contiguous-array': {
    statement: `\`nums\` contains only \`0\`s and \`1\`s. Return the length of the longest contiguous subarray that has an equal number of \`0\`s and \`1\`s.`,
    constraints: ['1 <= nums.length <= 1e5', '0 <= nums[i] <= 1'],
    hints: [
      'Treat each 0 as −1. Then "equal numbers of 0s and 1s" means "the subarray sums to 0".',
      'A subarray sums to 0 when the same prefix sum appears at both of its ends.',
      'Store the first index at which each prefix sum appears (with sum 0 at index −1). The answer is the largest i − first[prefix].',
    ],
  },
  'product-of-array-except-self': {
    statement: `Return an array \`answer\` where \`answer[i]\` is the product of every element of \`nums\` except \`nums[i]\`.

Do not use division (zeros would break it anyway), and run in O(n) time. Every product fits in a 32-bit integer.`,
    constraints: ['2 <= nums.length <= 1e5', '-30 <= nums[i] <= 30', 'Every prefix and suffix product fits in a 32-bit integer'],
    hints: [
      'The product of everything except i is (product of everything left of i) × (product of everything right of i).',
      'Fill the answer with prefix products in one pass from the left.',
      'Then pass from the right with a running suffix product, multiplying it in. That gives O(1) extra space besides the output.',
    ],
  },
  'range-sum-query-2d-immutable': {
    statement: `Implement the class \`NumMatrix\`:

- \`NumMatrix(int[][] matrix)\` stores the grid,
- \`int sumRegion(int row1, int col1, int row2, int col2)\` returns the sum of the rectangle whose top-left corner is \`(row1, col1)\` and bottom-right corner is \`(row2, col2)\`, both inclusive.

Each \`sumRegion\` call should take O(1) time. The tests call the class with a list of operations and their arguments.`,
    constraints: ['1 <= m, n <= 200 (the grid is m × n)', '-1e4 <= matrix[i][j] <= 1e4', '0 <= row1 <= row2 < m and 0 <= col1 <= col2 < n', 'At most 10^4 calls to sumRegion'],
    hints: [
      'Extend the 1D prefix-sum idea to two dimensions: P[r][c] = sum of the rectangle from (0, 0) to (r − 1, c − 1).',
      'Build P with P[r][c] = matrix[r−1][c−1] + P[r−1][c] + P[r][c−1] − P[r−1][c−1] (the overlap was added twice).',
      'Then a query is inclusion–exclusion: P[r2+1][c2+1] − P[r1][c2+1] − P[r2+1][c1] + P[r1][c1].',
    ],
  },
  'corporate-flight-bookings': {
    statement: `There are \`n\` flights, numbered \`1\` to \`n\`. Each booking \`[first, last, seats]\` reserves \`seats\` seats on every flight from \`first\` to \`last\` inclusive.

Return an array of length \`n\` where element \`i\` is the total number of seats booked on flight \`i + 1\`.`,
    constraints: ['1 <= n <= 2e4', '1 <= bookings.length <= 2e4', '`bookings[i]` = [first, last, seats] with 1 ≤ first ≤ last ≤ n', '1 ≤ seats ≤ 10⁴'],
    hints: [
      'Adding seats to every flight of every booking is O(n) per booking. Can a booking be recorded in O(1)?',
      'Use a difference array: add seats at position first and subtract seats just after last.',
      'A running (prefix) sum over the difference array then gives the total on every flight. O(n + bookings).',
    ],
  },
  'number-of-submatrices-that-sum-to-target': {
    statement: `Count the non-empty rectangular submatrices of \`matrix\` whose values add up to \`target\`.

Two submatrices are different if they differ in any coordinate, even if they contain the same values.`,
    constraints: ['1 <= matrix.length <= 100', '1 <= matrix[0].length <= 100', '-1000 <= matrix[i][j] <= 1000', '-1e8 <= target <= 1e8'],
    hints: [
      'Fix a pair of rows (top and bottom). Collapsing the columns between them gives a 1D array of column sums.',
      'Counting 1D subarrays with sum equal to target is "Subarray Sum Equals K": prefix sums plus a HashMap of counts.',
      'Do that for every pair of rows, updating the column sums incrementally as the bottom row moves down. O(rows² × cols).',
    ],
  },
};
