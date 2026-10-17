export default {
  'car-pooling': {
    statement: `A car has \`capacity\` empty seats and only drives east. Each \`trips[i] = [passengers, from, to]\` picks up \`passengers\` people at kilometre \`from\` and drops them off at kilometre \`to\`.

Return \`true\` if the car can complete every trip without ever carrying more than \`capacity\` passengers. People dropped off at a point free their seats for people picked up at the same point.`,
    constraints: ['1 <= trips.length <= 1000', 'Each trip is [passengers, from, to] with 1 ≤ passengers ≤ 100 and 0 ≤ from < to ≤ 1000', '1 <= capacity <= 1e5'],
    hints: [
      'Only the points where people get on or off matter.',
      'Use a difference array over kilometres 0 … 1000: add passengers at from and subtract them at to.',
      'Take a running sum along the road; if it ever exceeds capacity, return false. Sorting the pickup and drop-off events works when the road is long.',
    ],
  },
  'range-sum-query-mutable': {
    statement: `Implement \`NumArray\`:

- \`NumArray(int[] nums)\` stores the array,
- \`void update(int index, int val)\` sets \`nums[index]\` to \`val\`,
- \`int sumRange(int left, int right)\` returns the sum of \`nums[left..right]\`, both ends inclusive.

Both \`update\` and \`sumRange\` must run in O(log n). The tests call the class with a list of operations and their arguments.`,
    constraints: ['1 ≤ nums.length ≤ 10⁵', '-100 ≤ nums[i], val ≤ 100', '0 ≤ index < nums.length and 0 ≤ left ≤ right < nums.length', 'At most 10^5 calls to update and sumRange'],
    hints: [
      'A prefix-sum array answers queries in O(1) but an update can change O(n) prefix sums.',
      'A Fenwick tree (binary indexed tree) supports "add delta at i" and "sum of the first i" in O(log n).',
      'update(index, val) adds val − nums[index]; sumRange(l, r) = prefix(r + 1) − prefix(l). A segment tree also works.',
    ],
  },
  'count-of-smaller-numbers-after-self': {
    statement: `For each element \`nums[i]\`, count how many elements to its right are strictly smaller than it. Return those counts as a list, in the original order.`,
    constraints: ['1 <= nums.length <= 1e5', '-1e4 <= nums[i] <= 1e4'],
    hints: [
      'Checking every pair is O(n²). Process the array from right to left, asking "how many values seen so far are smaller?"',
      'With values in [−10⁴, 10⁴], shift them to [1, 20001] and use a Fenwick tree over values: query the count below nums[i], then add nums[i].',
      'Merge sort on indices also works: while merging, count how many elements from the right half move before each left-half element.',
    ],
  },
  'reverse-pairs': {
    statement: `A reverse pair is a pair of indices \`(i, j)\` with \`i < j\` and \`nums[i] > 2 × nums[j]\`. Return the number of reverse pairs in \`nums\`.

Values span the full 32-bit range, so \`2 × nums[j]\` can overflow an \`int\`.`,
    constraints: ['1 <= nums.length <= 5e4', '-2^31 <= nums[i] <= 2^31 - 1'],
    hints: [
      'Counting pairs where an earlier element beats a later one is the inversion-counting pattern, solved with merge sort.',
      'During merge sort, before merging two sorted halves, count for each left element how many right elements satisfy left > 2 × right, using a pointer that only moves forward.',
      'Do the multiplication in long. Then merge the halves as usual.',
    ],
  },
  'count-of-range-sum': {
    statement: `Count the contiguous subarrays of \`nums\` whose sum lies in the range \`[lower, upper]\`, inclusive.

Sums can exceed the 32-bit range, so use 64-bit arithmetic.`,
    constraints: ['1 <= nums.length <= 1e5', '-2^31 <= nums[i] <= 2^31 - 1', '-1e5 <= lower <= upper', 'upper <= 1e5'],
    hints: [
      'With prefix sums P, subarray (i, j] has sum P[j] − P[i]. You need, for each j, the number of earlier i with P[j] − upper ≤ P[i] ≤ P[j] − lower.',
      'Merge sort on the prefix sums counts these pairs: for each element of the right half, two pointers find the matching range in the sorted left half.',
      'Use long for the prefix sums. A Fenwick tree over compressed prefix values works too.',
    ],
  },
  'create-sorted-array-through-instructions': {
    statement: `Start with an empty container and insert the values of \`instructions\` one by one, keeping the container sorted. Inserting a value costs the minimum of:

- the number of values already in the container that are strictly less than it, and
- the number already in the container that are strictly greater than it.

Return the total cost of all insertions, modulo \`10^9 + 7\`.`,
    constraints: ['1 <= instructions.length <= 1e5', '1 <= instructions[i] <= 1e5'],
    hints: [
      'For each insertion you need two counts over the values inserted so far: how many are smaller and how many are larger.',
      'Keep a Fenwick tree indexed by value (values go up to 10⁵). smaller = prefix(v − 1); larger = inserted so far − prefix(v).',
      'Add min(smaller, larger) to the answer modulo 10⁹ + 7, then add v to the tree.',
    ],
  },
  'falling-squares': {
    statement: `Squares are dropped one at a time onto the x-axis. Each \`positions[i] = [left, side]\` is a square with side length \`side\` whose left edge is at \`left\`. It falls straight down until it lands on the x-axis or on top of an earlier square, and then stays there. Squares that only touch at an edge do not support each other.

After each square lands, record the height of the tallest stack so far. Return those heights.`,
    constraints: ['1 <= positions.length <= 1000', 'Each square is [left, side] with 1 ≤ left ≤ 10⁸ and 1 ≤ side ≤ 10⁶'],
    hints: [
      'A square covers the half-open interval [left, left + side). It lands on the highest existing square that overlaps that interval.',
      'With at most 1000 squares, an O(n²) solution is fine: for each new square, check every earlier square for overlap and take the maximum height.',
      'Its new height is that maximum + side. Keep a running maximum for the answer. A segment tree with coordinate compression is the scalable version.',
    ],
  },
};
