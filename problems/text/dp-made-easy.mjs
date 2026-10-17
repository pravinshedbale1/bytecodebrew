export default {
  'fibonacci-number': {
    statement: `The Fibonacci numbers are defined by \`F(0) = 0\`, \`F(1) = 1\` and \`F(n) = F(n − 1) + F(n − 2)\` for \`n > 1\`. Return \`F(n)\`.

The plain recursive definition recomputes the same values exponentially many times. This problem is about avoiding that.`,
    constraints: ['0 <= n <= 30'],
    hints: [
      'Draw the recursion tree for F(5). Which calls repeat?',
      'Memoise: store each F(i) the first time you compute it. Or build the values bottom-up from F(0) and F(1).',
      'You only ever need the last two values, so two variables are enough: O(n) time, O(1) space.',
    ],
  },
  'climbing-stairs': {
    statement: `A staircase has \`n\` steps. Each time you can climb either 1 or 2 steps. Return the number of distinct ways to reach the top.

Two ways are different if the sequence of step sizes differs.`,
    constraints: ['1 <= n <= 45'],
    hints: [
      'Your last move onto step n was either a 1-step from n − 1 or a 2-step from n − 2.',
      'So ways(n) = ways(n − 1) + ways(n − 2), with ways(1) = 1 and ways(2) = 2.',
      'It is the Fibonacci sequence shifted by one: keep two variables and iterate.',
    ],
  },
  'min-cost-climbing-stairs': {
    statement: `\`cost[i]\` is the cost of stepping on stair \`i\`. After paying for a stair you may climb one or two stairs. You can start on stair \`0\` or stair \`1\` for free (you pay only when you step on a stair).

Return the minimum cost to reach the top, which is the position just past the last stair.`,
    constraints: ['2 <= cost.length <= 1000', '0 <= cost[i] <= 999'],
    hints: [
      'Let best[i] be the minimum cost to stand on stair i (including paying cost[i]).',
      'best[i] = cost[i] + min(best[i − 1], best[i − 2]), with best[0] = cost[0] and best[1] = cost[1].',
      'The top can be reached from either of the last two stairs, so the answer is min(best[n − 1], best[n − 2]). Two variables suffice.',
    ],
  },
  'n-th-tribonacci-number': {
    statement: `The Tribonacci sequence is defined by \`T(0) = 0\`, \`T(1) = 1\`, \`T(2) = 1\` and \`T(n) = T(n − 1) + T(n − 2) + T(n − 3)\` for \`n ≥ 3\`. Return \`T(n)\`.

The answer fits in a 32-bit integer.`,
    constraints: ['0 <= n <= 37'],
    hints: [
      'Like Fibonacci, but each value depends on the previous three.',
      'Build the values bottom-up instead of recursing.',
      'Keep three variables and shift them along: O(n) time, O(1) space.',
    ],
  },
};
