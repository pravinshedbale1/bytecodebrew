export default {
  'next-greater-element-i': {
    statement: `\`nums2\` has distinct values, and every value of \`nums1\` also appears in \`nums2\`. For each \`x\` in \`nums1\`, find \`x\` in \`nums2\` and return the first value to its right that is greater than \`x\`, or \`-1\` if there is none.

Return the answers in the order of \`nums1\`.`,
    constraints: ['1 <= nums1.length <= nums2.length', 'nums2.length <= 1000', '0 <= nums1[i], nums2[i] <= 1e4', 'The values in each array are distinct'],
    hints: [
      'Answer the question once for every value of nums2, then look up the values of nums1.',
      'Scan nums2 with a stack of values still waiting for a greater one. When a bigger value arrives, it is the answer for every smaller value it pops.',
      'Store the answers in a HashMap from value to next greater value; values left on the stack get −1.',
    ],
  },
  'daily-temperatures': {
    statement: `\`temperatures[i]\` is the temperature on day \`i\`. Return an array \`answer\` where \`answer[i]\` is the number of days you have to wait after day \`i\` to get a strictly warmer temperature. If no warmer day ever comes, \`answer[i]\` is \`0\`.`,
    constraints: ['1 <= temperatures.length <= 1e5', '30 <= temperatures[i] <= 100'],
    hints: [
      'Comparing every day with every later day is O(n²). Which days are still "waiting" for a warmer one?',
      'Keep a stack of indices whose temperatures decrease from bottom to top. A warmer day resolves every colder day on top of the stack.',
      'When day i pops index j, answer[j] = i − j. Each index is pushed and popped at most once, so the total is O(n).',
    ],
  },
  'next-greater-element-ii': {
    statement: `\`nums\` is circular: after the last element comes the first one again. For each element, return the first greater value you meet when walking forward (wrapping around), or \`-1\` if no greater value exists.

Values can repeat.`,
    constraints: ['1 <= nums.length <= 1e4', '-1e9 <= nums[i] <= 1e9'],
    hints: [
      'Wrapping around once is like scanning the array twice in a row.',
      'Loop i from 0 to 2n − 1 using nums[i % n], with a monotonic stack of indices that still need an answer.',
      'Only push indices during the first pass (i < n); the second pass only resolves them. Fill the answer with −1 first.',
    ],
  },
  'online-stock-span': {
    statement: `Design \`StockSpanner\`, which receives one stock price per day:

- \`StockSpanner()\` creates the object,
- \`int next(int price)\` records today's price and returns today's span: the number of consecutive days, ending with today and counting backwards, on which the price was less than or equal to today's price.

For prices \`[7, 2, 1, 2]\` the span on the last day is 4: 2, 1, 2 and today. The tests call the class with a list of operations and their arguments.`,
    constraints: ['1 <= price <= 1e5', 'At most 10^5 calls to next'],
    hints: [
      'Walking back day by day is O(n) per call. Which older days can you forget for good?',
      'Once a higher price arrives, a lower earlier price can never stop a later span. Keep a stack of (price, span) pairs with decreasing prices.',
      'On next(price), pop every pair with price ≤ today\'s and add their spans to today\'s span (which starts at 1), then push today. Amortised O(1).',
    ],
  },
  'remove-k-digits': {
    statement: `\`num\` is a non-negative integer written as a string. Remove exactly \`k\` digits so that the remaining number is as small as possible, and return it as a string.

The result must not have leading zeros, and if nothing is left, return \`"0"\`.`,
    constraints: ['1 <= num.length <= 1e5', '1 <= k <= num.length', '`num` has only digits and no leading zeros (except the number "0")'],
    hints: [
      'The leftmost digits matter most. When a digit is followed by a smaller one, removing the larger digit helps the most.',
      'Scan left to right with a stack: while k > 0 and the top is bigger than the current digit, pop it (that uses one removal).',
      'If removals are left over at the end, remove from the end (the stack is non-decreasing). Then strip leading zeros and return "0" if empty.',
    ],
  },
  'sum-of-subarray-minimums': {
    statement: `For every contiguous subarray of \`arr\`, take its minimum value. Return the sum of all those minimums, modulo \`10^9 + 7\`.`,
    constraints: ['1 <= arr.length <= 3e4', '1 <= arr[i] <= 3e4'],
    hints: [
      'Instead of looping over subarrays, ask for each element: in how many subarrays is arr[i] the minimum?',
      'If left[i] elements to the left are strictly greater and right[i] elements to the right are greater or equal, arr[i] is the minimum of left[i] × right[i] subarrays (counting itself on both sides).',
      'Find both counts with monotonic stacks. Use strict < on one side and ≤ on the other so equal values are not counted twice, and add with longs modulo 10⁹ + 7.',
    ],
  },
  'sliding-window-maximum': {
    statement: `A window of size \`k\` slides over \`nums\` from the far left to the far right, one position at a time. Return the maximum value inside the window at each position, in order.

The array has \`n − k + 1\` windows. Aim for O(n) time.`,
    constraints: ['1 <= nums.length <= 1e5', '-1e4 <= nums[i] <= 1e4', '1 <= k <= nums.length'],
    hints: [
      'An element smaller than a newer element to its right can never be a maximum again. You can drop it.',
      'Keep a deque of indices whose values decrease from front to back. The front is the current maximum.',
      'For each i: pop smaller values off the back, push i, remove the front if it has left the window (index ≤ i − k), and record the front once i ≥ k − 1.',
    ],
  },
  'largest-rectangle-in-histogram': {
    statement: `\`heights[i]\` is the height of a bar of width 1 in a histogram. Return the area of the largest rectangle that fits entirely inside the histogram (it may span several adjacent bars and is limited by the shortest of them).`,
    constraints: ['1 <= heights.length <= 1e5', '0 <= heights[i] <= 1e4'],
    hints: [
      'For each bar, the widest rectangle of exactly its height extends until a shorter bar on each side.',
      'A stack of indices with increasing heights finds those shorter neighbours: when a shorter bar arrives, it is the right boundary for every taller bar it pops.',
      'When you pop index j, its left boundary is the new top of the stack, so the width is i − top − 1 (or i if the stack is empty). Add a sentinel height 0 at the end to flush the stack.',
    ],
  },
  'maximal-rectangle': {
    statement: `\`matrix\` is filled with the characters \`'0'\` and \`'1'\`. Return the area of the largest rectangle that contains only \`'1'\`s.`,
    constraints: ['1 <= matrix.length <= 200', '1 <= matrix[0].length <= 200', '`matrix[i][j]` is "0" or "1"'],
    hints: [
      'Treat each row as the floor of a histogram: the height of column c is the number of consecutive 1s ending at this row.',
      'Update the heights row by row (reset to 0 on a "0", otherwise add 1).',
      'Run "Largest Rectangle in Histogram" on each row\'s heights and keep the best area. O(rows × cols).',
    ],
  },
};
