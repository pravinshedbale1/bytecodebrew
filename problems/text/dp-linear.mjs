export default {
  'house-robber': {
    statement: `Houses along a street contain \`nums[i]\` money each. You cannot rob two adjacent houses, because the alarm would go off.

Return the maximum amount of money you can rob.`,
    constraints: ['1 <= nums.length <= 100', '0 <= nums[i] <= 400'],
    hints: [
      'At each house you either rob it or skip it.',
      'best[i] = max(best[i − 1], best[i − 2] + nums[i]): skip house i, or rob it on top of the best up to i − 2.',
      'Only the last two values are needed, so keep two variables.',
    ],
  },
  'house-robber-ii': {
    statement: `As in "House Robber", but the houses are arranged in a circle: the first house and the last house are neighbours. You still cannot rob two adjacent houses.

Return the maximum amount of money you can rob.`,
    constraints: ['1 <= nums.length <= 100', '0 <= nums[i] <= 1000'],
    hints: [
      'The circle only adds one conflict: the first and last houses cannot both be robbed.',
      'So either the first house is skipped or the last house is skipped.',
      'Run the linear House Robber on nums[0..n−2] and on nums[1..n−1] and take the larger result. A single house is a special case.',
    ],
  },
  'maximum-subarray': {
    statement: `Return the largest sum of any non-empty contiguous subarray of \`nums\`.

If every value is negative, the answer is the largest single value.`,
    constraints: ['1 <= nums.length <= 1e5', '-1e4 <= nums[i] <= 1e4'],
    hints: [
      'For each index, what is the best subarray that ends exactly there?',
      'Kadane\'s algorithm: bestEndingHere = max(nums[i], bestEndingHere + nums[i]). A negative running sum is never worth keeping.',
      'Track the maximum of bestEndingHere over all i. Start both with nums[0] to handle all-negative arrays.',
    ],
  },
  'maximum-product-subarray': {
    statement: `Return the largest product of any non-empty contiguous subarray of \`nums\`.

The answer fits in a 32-bit integer.`,
    constraints: ['1 <= nums.length <= 2e4', '-10 <= nums[i] <= 10', 'Every subarray product fits in a 32-bit integer'],
    hints: [
      'Unlike sums, a very negative product can turn into the largest one when multiplied by another negative number.',
      'Track both the maximum and the minimum product of a subarray ending at each index.',
      'For each value x: newMax = max(x, x·max, x·min) and newMin = min(x, x·max, x·min), computed from the old values. A zero resets both.',
    ],
  },
  'decode-ways': {
    statement: `Letters are encoded as numbers: \`A\` → \`"1"\`, \`B\` → \`"2"\`, …, \`Z\` → \`"26"\`. Given a string of digits \`s\`, return the number of ways to decode it back into letters.

A piece with a leading zero, such as \`"06"\`, is not a valid code. If the string cannot be decoded at all, return \`0\`. The answer fits in a 32-bit integer.`,
    constraints: ['1 <= s.length <= 100', '`s` has only digits and may contain leading zeros'],
    hints: [
      'The last letter of a decoding uses either the last one digit or the last two digits.',
      'ways[i] = (ways[i − 1] if s[i − 1] is 1–9) + (ways[i − 2] if s[i − 2..i − 1] is 10–26), with ways[0] = 1.',
      'Zeros are the trap: "0" alone is never valid, so "30" decodes zero ways. Two variables are enough.',
    ],
  },
  'word-break': {
    statement: `Return \`true\` if \`s\` can be split into a sequence of one or more words from \`wordDict\`. The same dictionary word may be used many times.`,
    constraints: ['1 <= s.length <= 300', '1 <= wordDict.length <= 1000', '1 <= wordDict[i].length <= 20', 'All strings are lowercase; dictionary words are unique'],
    hints: [
      'Trying every split recursively explodes on inputs like "aaaa…ab". The same suffix gets solved again and again.',
      'Let ok[i] mean "the first i characters can be split". ok[0] is true.',
      'ok[i] is true if some j < i has ok[j] and s[j..i) in the dictionary (use a HashSet, and only try lengths up to the longest word).',
    ],
  },
  'longest-increasing-subsequence': {
    statement: `Return the length of the longest strictly increasing subsequence of \`nums\`. A subsequence keeps the original order but may skip elements.

The O(n²) dynamic programming solution is fine for these sizes; an O(n log n) solution exists.`,
    constraints: ['1 <= nums.length <= 2500', '-1e4 <= nums[i] <= 1e4'],
    hints: [
      'Let lis[i] be the length of the longest increasing subsequence ending at index i.',
      'lis[i] = 1 + max(lis[j]) over j < i with nums[j] < nums[i]. That is O(n²).',
      'For O(n log n), keep tails[k] = the smallest possible tail of an increasing subsequence of length k + 1, and binary-search where each value goes.',
    ],
  },
  'number-of-longest-increasing-subsequence': {
    statement: `Return how many strictly increasing subsequences of \`nums\` have the maximum possible length.

Subsequences are counted by the positions they use, so equal values at different positions make different subsequences. The answer fits in a 32-bit integer.`,
    constraints: ['1 <= nums.length <= 2000', '-1e6 <= nums[i] <= 1e6'],
    hints: [
      'Extend the O(n²) LIS solution: alongside length[i], track count[i], the number of longest subsequences ending at i.',
      'For j < i with nums[j] < nums[i]: if length[j] + 1 is longer than length[i], take over count[j]; if it is equal, add count[j].',
      'At the end, add up count[i] for every i whose length equals the overall maximum.',
    ],
  },
  'best-time-to-buy-and-sell-stock-with-cooldown': {
    statement: `\`prices[i]\` is a stock's price on day \`i\`. You may make as many trades as you like, holding at most one share at a time, but after you sell you must wait one day (a cooldown) before you can buy again.

Return the maximum profit.`,
    constraints: ['1 <= prices.length <= 5000', '0 <= prices[i] <= 1000'],
    hints: [
      'Describe each day by your state: holding a share, just sold (cooling down), or free to buy.',
      'hold = max(hold, free − price); sold = hold + price; free = max(free, previous sold). Compute the new values from the old ones.',
      'The answer is max(sold, free) after the last day.',
    ],
  },
  'russian-doll-envelopes': {
    statement: `\`envelopes[i] = [width, height]\`. One envelope fits inside another only if both its width and its height are strictly smaller. Envelopes cannot be rotated.

Return the maximum number of envelopes you can nest one inside the other.`,
    constraints: ['1 <= envelopes.length <= 1e5', '1 <= envelopes[i][j] <= 1e5'],
    hints: [
      'Sort by width; then you need an increasing subsequence of heights. Equal widths are the catch.',
      'Sort by width ascending and, for equal widths, by height descending. Then two envelopes of the same width can never both be in an increasing run of heights.',
      'Run the O(n log n) longest increasing subsequence on the heights; O(n²) is too slow for 10⁵ envelopes.',
    ],
  },
  'integer-break': {
    statement: `Break the positive integer \`n\` into the sum of **at least two** positive integers, and make the product of those integers as large as possible. Return that maximum product.`,
    constraints: ['2 <= n <= 58'],
    hints: [
      'Try small cases by hand: 4 → 2 + 2 (4), 5 → 2 + 3 (6), 6 → 3 + 3 (9). Which pieces keep appearing?',
      'DP: best[i] = max over j of max(j, best[j]) × max(i − j, best[i − j]). The max(…) lets a part stay unsplit, which matters because the whole n must be split but its parts need not be.',
      'Maths: use as many 3s as possible, but never leave a 1; turn a final 3 + 1 into 2 + 2. That gives an O(1) or O(log n) answer.',
    ],
  },
  'maximum-sum-circular-subarray': {
    statement: `\`nums\` is a **circular** array: the element after \`nums[n − 1]\` is \`nums[0]\`. Return the largest possible sum of a **non-empty** subarray.

A subarray may wrap around the end, but it may include each element at most once.`,
    constraints: ['n == nums.length', '1 <= n <= 3e4', '-3e4 <= nums[i] <= 3e4'],
    hints: [
      'A best subarray either does not wrap (plain Kadane finds it) or wraps around the end.',
      'A wrapping subarray is everything except a contiguous middle part, so its sum is total − (that middle part). To make it large, make the middle part as small as possible.',
      'Run Kadane for the maximum and the minimum subarray in one pass. The answer is max(maxSum, total − minSum), except when every number is negative: then minSum is the whole array and you must return maxSum.',
    ],
  },
  'longest-turbulent-subarray': {
    statement: `A subarray \`arr[i..j]\` is **turbulent** if the comparison sign flips between each adjacent pair: either \`arr[i] > arr[i + 1] < arr[i + 2] > …\` or \`arr[i] < arr[i + 1] > arr[i + 2] < …\`. Equal neighbours break turbulence.

Return the length of the longest turbulent subarray of \`arr\`. A single element counts, with length 1.`,
    constraints: ['1 <= arr.length <= 4e4', '0 <= arr[i] <= 1e9'],
    hints: [
      'Look at the sign of each step arr[i] − arr[i − 1]: +, − or 0. A turbulent subarray is a run of alternating + and − signs.',
      'Keep two lengths ending at i: up (the last step went up) and down (the last step went down).',
      'If arr[i] > arr[i − 1] then up = down + 1 and down = 1; if smaller, down = up + 1 and up = 1; if equal, both reset to 1. The answer is the largest value seen.',
    ],
  },
  'stone-game-iii': {
    statement: `Stones are arranged in a row and \`stoneValue[i]\` is the value of the \`i\`-th stone (values can be negative). Alice and Bob take turns, Alice first. On each turn the player takes **1, 2 or 3** stones from the front of the row, adding their values to their score. The game ends when no stones are left.

Both players play optimally to maximise their own final score. Return \`"Alice"\` if Alice ends with the higher score, \`"Bob"\` if Bob does, or \`"Tie"\` if the scores are equal.`,
    constraints: ['1 <= stoneValue.length <= 5e4', '-1000 <= stoneValue[i] <= 1000'],
    hints: [
      'Instead of tracking both scores, track the difference: dp[i] = the best (my score − opponent\'s score) the player to move can get from stones i onward.',
      'If the player takes k stones (k = 1..3), they gain their sum and the opponent then gets dp[i + k] as their own difference. So dp[i] = max over k of (sum of the k stones − dp[i + k]).',
      'Fill dp from the end (dp[n] = 0). The sign of dp[0] decides the winner. Taking stones is not optional, which matters when values are negative.',
    ],
  },
};
