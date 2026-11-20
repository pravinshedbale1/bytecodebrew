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
  'longest-continuous-subarray-with-absolute-diff-less-than-or-equal-to-limit': {
    statement: `Given an integer array \`nums\` and an integer \`limit\`, return the length of the longest non-empty contiguous subarray in which the absolute difference between any two elements is at most \`limit\`.`,
    constraints: ['1 <= nums.length <= 1e5', '1 <= nums[i] <= 1e9', '0 <= limit <= 1e9'],
    hints: [
      '"Any two elements differ by at most limit" is the same as max − min ≤ limit. Shrinking a valid window keeps it valid: a sliding window.',
      'The window needs its maximum and minimum while values enter on the right and leave on the left. A TreeMap of counts does it in O(log n) per step.',
      'For O(n), keep a max queue and a min queue: a deque of decreasing values and a deque of increasing values. When nums[l] leaves the window, pop it from any deque whose front it is.',
    ],
  },
  'jump-game-vi': {
    statement: `You are given an integer array \`nums\` and an integer \`k\`. You start at index \`0\`. In one move you can jump from index \`i\` to any index in \`[i + 1, min(n − 1, i + k)]\`.

Your score is the sum of \`nums[j]\` over every index \`j\` you visit, including index 0 and the last index. Return the maximum score you can get when you reach index \`n − 1\`.`,
    constraints: ['1 <= nums.length, k <= 1e5', '-1e4 <= nums[i] <= 1e4'],
    hints: [
      'dp[i] = nums[i] + max(dp[i − k], …, dp[i − 1]). Computing that max by scanning is O(nk), up to 10¹⁰.',
      'The k previous dp values form a window sliding to the right: you need a sliding-window maximum.',
      'Keep a deque of indexes with decreasing dp values. Drop the front when it is more than k behind i, read dp at the front, then pop from the back every dp ≤ dp[i] before pushing i.',
    ],
  },
  'constrained-subsequence-sum': {
    statement: `Given an integer array \`nums\` and an integer \`k\`, return the maximum sum of a non-empty subsequence of \`nums\` such that for every two consecutive chosen indices \`i < j\`, \`j − i ≤ k\`.

A subsequence keeps the original order but may skip elements.`,
    constraints: ['1 <= k <= nums.length <= 1e5', '-1e4 <= nums[i] <= 1e4'],
    hints: [
      'Let dp[i] be the best sum of a valid subsequence that ends by picking index i. It either starts at i, or extends the best subsequence ending somewhere in i − k … i − 1.',
      'So dp[i] = nums[i] + max(0, max(dp[i − k … i − 1])). The answer is the largest dp value.',
      'The window maximum over the last k dp values is a sliding-window maximum: keep a deque of indexes with decreasing dp. O(n).',
    ],
  },
  'shortest-subarray-with-sum-at-least-k': {
    statement: `Given an integer array \`nums\` (which may contain negative numbers) and an integer \`k\`, return the length of the shortest non-empty contiguous subarray whose sum is at least \`k\`. If there is no such subarray, return \`-1\`.`,
    constraints: ['1 <= nums.length <= 1e5', '-1e5 <= nums[i] <= 1e5', '1 <= k <= 1e9'],
    hints: [
      'With negative numbers the usual sliding window breaks: extending a window can lower its sum. Use prefix sums: the subarray [i, j) sums to p[j] − p[i].',
      'For a fixed end j you want the latest start i with p[i] ≤ p[j] − k. Candidate starts with a larger prefix than a later start are useless: drop them, so the candidates have increasing prefix values.',
      'Keep a deque of start indexes with increasing p. For each j: while p[j] − p[front] ≥ k, record j − front and pop the front (a later j could only be longer); then pop the back while p[back] ≥ p[j]; push j. Use 64-bit prefix sums.',
    ],
  },
  // ---- visible people, counting windows with a min and max queue
  'number-of-visible-people-in-a-queue': {
    statement: `There are \`n\` people standing in a queue, numbered \`0\` to \`n − 1\` from left to right, with distinct heights \`heights[i]\`. Everyone looks to the right.

Person \`i\` can see person \`j\` (\`i < j\`) if everybody standing between them is shorter than both of them: \`min(heights[i], heights[j]) > max(heights[i + 1], …, heights[j − 1])\`.

Return an array \`answer\` where \`answer[i]\` is the number of people person \`i\` can see.`,
    constraints: ['1 <= heights.length <= 1e5', '1 <= heights[i] <= 1e5', 'All values of heights are distinct'],
    hints: [
      'Person i sees a run of people who are each taller than everyone before them (and shorter than i), and then the first person taller than i, after which nobody else is visible.',
      'Go from right to left with a stack of heights that could still be seen, decreasing from bottom to top.',
      'For person i: pop every height shorter than heights[i], counting one visible person per pop (they are hidden from everyone further left anyway). If the stack is still non-empty, its top is the first taller person: one more. Then push heights[i].',
    ],
  },
  'continuous-subarrays': {
    statement: `Given an integer array \`nums\`, a subarray is **continuous** if every pair of its elements differs by at most \`2\`: for all indices \`i₁, i₂\` in it, \`|nums[i₁] − nums[i₂]| ≤ 2\`.

Return the total number of continuous subarrays. A subarray is a contiguous non-empty part of the array.`,
    constraints: ['1 <= nums.length <= 1e5', '1 <= nums[i] <= 1e9'],
    hints: [
      '"Every pair differs by at most 2" means max − min ≤ 2. A smaller subarray of a continuous one is continuous too, so use a sliding window.',
      'For every end r, find the smallest start l whose window is valid; then all r − l + 1 subarrays ending at r count.',
      'Keep the window\'s maximum and minimum with a max queue and a min queue (monotonic deques of indexes). Move l forward while max − min > 2, dropping deque fronts that fall out of the window.',
    ],
  },
  'count-subarrays-with-fixed-bounds': {
    statement: `You are given an integer array \`nums\` and two integers \`minK\` and \`maxK\`. A **fixed-bound subarray** is a subarray whose minimum value is exactly \`minK\` and whose maximum value is exactly \`maxK\`.

Return the number of fixed-bound subarrays.`,
    constraints: ['2 <= nums.length <= 1e5', '1 <= nums[i] <= 1e6', '1 <= minK <= 1e6', '1 <= maxK <= 1e6'],
    hints: [
      'A value outside [minK, maxK] can never be inside a valid subarray: it splits the array into independent pieces.',
      'Fix the end r. A start l works if there is no bad value in [l, r], and the window contains at least one minK and one maxK.',
      'Remember the last index of a bad value, of minK and of maxK. The valid starts are bad + 1 … min(lastMin, lastMax): add max(0, min(lastMin, lastMax) − bad) for every r. If minK > maxK, nothing is ever counted.',
    ],
  },
  'count-subarrays-with-cost-less-than-or-equal-to-k': {
    statement: `You are given an integer array \`nums\` and an integer \`k\`. The **cost** of a subarray \`nums[l..r]\` is

\`(max(nums[l..r]) − min(nums[l..r])) × (r − l + 1)\`,

its spread times its length. Return the number of subarrays whose cost is at most \`k\`.`,
    constraints: ['1 <= nums.length <= 1e5', '1 <= nums[i] <= 1e9', '0 <= k <= 1e15'],
    hints: [
      'Removing an element from either end never increases the spread and always shrinks the length, so the cost never goes up. Valid subarrays ending at r are a range of starts: a sliding window.',
      'For each r, move l forward while the cost of [l, r] is above k, then add r − l + 1.',
      'The window\'s max and min come from a max queue and a min queue (monotonic deques). The cost can reach about 10⁹ × 10⁵ = 10¹⁴: compute it in 64 bits.',
    ],
  },
  'count-prime-gap-balanced-subarrays': {
    statement: `You are given an integer array \`nums\` and an integer \`k\`. A subarray is **prime-gap balanced** if:

- it contains **at least two** prime numbers, and
- the difference between the largest and the smallest prime number in it is at most \`k\`.

Return the number of prime-gap balanced subarrays. (Repeated primes count separately: \`[2, 2]\` contains two primes.)`,
    constraints: ['1 <= nums.length <= 5e4', '1 <= nums[i] <= 5e4', '0 <= k <= 5e4'],
    hints: [
      'Sieve the primes up to max(nums) first. Non-primes never affect the condition except by being in the subarray.',
      'For a fixed end r, a larger window only adds primes and can only widen the prime spread. So the starts that keep the spread ≤ k form a range [l, r], and l only moves right: slide l with a max queue and a min queue over the primes in the window.',
      'The subarray also needs two primes: the start must be at or before the second-latest prime at or before r (call it prev). Add prev − l + 1 when prev ≥ l.',
    ],
  },
};
