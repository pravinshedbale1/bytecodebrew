export default {
  'partition-equal-subset-sum': {
    statement: `Return \`true\` if the values of \`nums\` can be divided into two groups whose sums are equal. Every value must go into exactly one of the groups.`,
    constraints: ['1 <= nums.length <= 200', '1 <= nums[i] <= 100'],
    hints: [
      'If the total is odd, it is impossible. Otherwise you need a subset that adds up to exactly total / 2.',
      'This is 0/1 knapsack: can[s] says whether some subset of the values seen so far sums to s.',
      'For each value v, update can[s] |= can[s − v] for s from target down to v. Going downward ensures each value is used at most once.',
    ],
  },
  'target-sum': {
    statement: `Put either \`+\` or \`-\` in front of every number in \`nums\` and evaluate the resulting expression. Return the number of different sign choices that make the expression equal \`target\`.`,
    constraints: ['1 <= nums.length <= 20', '0 <= nums[i] <= 1000', 'sum(nums) ≤ 1000', '-1000 <= target <= 1000'],
    hints: [
      'Trying all 2ⁿ sign choices works for n ≤ 20, but there is a neat counting reformulation.',
      'If P is the sum of the numbers marked +, then P − (total − P) = target, so P = (total + target) / 2.',
      'Count the subsets that sum to P with a knapsack count: ways[s] += ways[s − v], iterating s downward. If (total + target) is odd or negative, the answer is 0. Zeros double the count, which the DP handles naturally.',
    ],
  },
  'last-stone-weight-ii': {
    statement: `Each value in \`stones\` is the weight of a stone. You repeatedly choose any two stones, with weights \`x ≤ y\`, and smash them: if \`x == y\` both disappear, otherwise only a stone of weight \`y − x\` remains.

At the end at most one stone is left. Return the smallest possible weight of that stone, or \`0\` if none remains.`,
    constraints: ['1 <= stones.length <= 30', '1 <= stones[i] <= 100'],
    hints: [
      'However you smash, the final weight is a sum of the stones with + and − signs: some group minus the other group.',
      'So the question is: split the stones into two groups with sums as close as possible.',
      'Use a 0/1 knapsack to find the largest achievable sum S ≤ total / 2. The answer is total − 2S.',
    ],
  },
  'coin-change': {
    statement: `\`coins\` lists coin denominations, and you have an unlimited number of coins of each. Return the fewest coins needed to make exactly \`amount\`, or \`-1\` if it cannot be made.

Making an amount of 0 needs 0 coins.`,
    constraints: ['1 <= coins.length <= 12', '1 <= coins[i] <= 2^31 - 1', '0 <= amount <= 1e4'],
    hints: [
      'Always taking the largest coin first fails, for example with coins [1, 3, 4] and amount 6.',
      'Let best[a] be the fewest coins for amount a. best[a] = 1 + min(best[a − c]) over coins c ≤ a, with best[0] = 0.',
      'Fill the table from 1 to amount, using a value larger than amount to mean "impossible". Watch out for coins larger than amount.',
    ],
  },
  'coin-change-ii': {
    statement: `\`coins\` lists distinct coin denominations, with an unlimited supply of each. Return the number of different combinations of coins that add up to \`amount\`.

Order does not matter: \`1 + 2\` and \`2 + 1\` are the same combination. If no combination works, return \`0\`. The answer fits in a 32-bit integer.`,
    constraints: ['1 <= coins.length <= 300', '1 <= coins[i] <= 5000', 'The coins are distinct', '0 <= amount <= 5000'],
    hints: [
      'To count combinations rather than sequences, decide how many of each coin to use, one coin type at a time.',
      'ways[a] counts combinations for amount a using the coins processed so far; ways[0] = 1.',
      'Put the loop over coins outside and the loop over amounts (going up) inside: ways[a] += ways[a − coin]. Swapping the loops would count orderings instead.',
    ],
  },
  'combination-sum-iv': {
    statement: `\`nums\` has distinct positive integers. Count the ordered sequences of values from \`nums\` (each value may be used any number of times) that add up to \`target\`.

Different orders count as different sequences, so \`(1, 2)\` and \`(2, 1)\` are both counted. The answer fits in a 32-bit integer.`,
    constraints: ['1 <= nums.length <= 200', '1 <= nums[i] <= 1000', 'The values are distinct', '1 <= target <= 1000'],
    hints: [
      'The last number of a sequence summing to t can be any value v ≤ t from nums.',
      'So ways[t] = sum of ways[t − v] over all v ≤ t, with ways[0] = 1.',
      'Here the loop over amounts is the outer loop, which is what makes order matter (the opposite of Coin Change II). Intermediate counts can overflow an int, so you may need to guard them.',
    ],
  },
  'perfect-squares': {
    statement: `A perfect square is the square of an integer: 1, 4, 9, 16, … . Return the smallest number of perfect squares that add up to \`n\`.`,
    constraints: ['1 <= n <= 1e4'],
    hints: [
      'This is Coin Change where the coins are the squares up to n.',
      'best[i] = 1 + min(best[i − k²]) over k with k² ≤ i, and best[0] = 0.',
      'BFS over remainders also works. There is even a number-theory answer: it is always at most 4 (Lagrange\'s four-square theorem).',
    ],
  },
  'ones-and-zeroes': {
    statement: `\`strs\` is a list of binary strings. Choose the largest possible subset of them such that, in total, the chosen strings contain at most \`m\` zeros and at most \`n\` ones.

Return the size of that subset.`,
    constraints: ['1 <= strs.length <= 600', '1 <= strs[i].length <= 100', '`strs[i]` has only "0" and "1"', '0 <= m, n <= 100'],
    hints: [
      'Each string is an item with two "weights" (its zeros and its ones) and a value of 1. It is a two-dimensional knapsack.',
      'best[z][o] = the most strings you can pick with at most z zeros and o ones.',
      'For each string with (zeros, ones), update best[z][o] = max(best[z][o], 1 + best[z − zeros][o − ones]), looping z and o downward so each string is used once.',
    ],
  },
};
