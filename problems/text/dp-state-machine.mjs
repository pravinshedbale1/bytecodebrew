export default {
  'best-time-to-buy-and-sell-stock-ii': {
    statement: `\`prices[i]\` is the price of a stock on day \`i\`. You may buy and sell as many times as you like, but you can hold at most one share at a time (you may sell and buy again on the same day).

Return the maximum profit.`,
    constraints: ['1 <= prices.length <= 3e4', '0 <= prices[i] <= 1e4'],
    hints: [
      'Any profitable stretch can be split into day-to-day rises.',
      'Add up every positive difference prices[i] − prices[i − 1].',
      'The general method, two states (holding / not holding) updated each day, extends to the harder variants.',
    ],
  },
  'best-time-to-buy-and-sell-stock-with-transaction-fee': {
    statement: `\`prices[i]\` is the price of a stock on day \`i\`. You may make as many transactions as you like, holding at most one share at a time, but every transaction (a buy followed by a sell) costs \`fee\`.

Return the maximum profit.`,
    constraints: ['1 <= prices.length <= 5e4', '1 <= prices[i] <= 5e4', '0 <= fee <= 5e4'],
    hints: [
      'Small rises are no longer worth trading on: the fee eats them.',
      'Track two states: cash (not holding a share) and hold (holding one).',
      'Each day: cash = max(cash, hold + price − fee), hold = max(hold, cash − price). Use the old values on the right-hand side.',
    ],
  },
  'best-time-to-buy-and-sell-stock-iii': {
    statement: `\`prices[i]\` is the price of a stock on day \`i\`. You may complete at most two transactions, and you must sell before you buy again.

Return the maximum profit.`,
    constraints: ['1 <= prices.length <= 1e5', '0 <= prices[i] <= 1e5'],
    hints: [
      'Model the stages: after the first buy, after the first sell, after the second buy, after the second sell.',
      'buy1 = max(buy1, −price); sell1 = max(sell1, buy1 + price); buy2 = max(buy2, sell1 − price); sell2 = max(sell2, buy2 + price).',
      'Start buy1 and buy2 at negative infinity (or −prices[0]) and the sells at 0. The answer is sell2.',
    ],
  },
  'best-time-to-buy-and-sell-stock-iv': {
    statement: `\`prices[i]\` is the price of a stock on day \`i\`. You may complete at most \`k\` transactions, and you must sell before you buy again.

Return the maximum profit.`,
    constraints: ['1 <= k <= 100', '1 <= prices.length <= 1000', '0 <= prices[i] <= 1000'],
    hints: [
      'Generalise the two-transaction solution to k pairs of states: buy[j] and sell[j] for j = 1 … k.',
      'Each day: buy[j] = max(buy[j], sell[j − 1] − price) and sell[j] = max(sell[j], buy[j] + price).',
      'If k ≥ n / 2, the limit never matters, so just add every rise as in "Stock II". That avoids a large table.',
    ],
  },
  'student-attendance-record-ii': {
    statement: `An attendance record is a string of length \`n\` using \`A\` (absent), \`L\` (late) and \`P\` (present). A record is eligible for an award if it has fewer than 2 \`A\`s in total and never has 3 or more consecutive \`L\`s.

Return the number of eligible records of length \`n\`, modulo \`10^9 + 7\`.`,
    constraints: ['1 <= n <= 1e5'],
    hints: [
      'A record is described well enough by two numbers: how many A\'s so far (0 or 1), and how many L\'s at the very end (0, 1 or 2).',
      'That is 6 states. Appending P, A or L moves between them: P resets the trailing Ls, A requires 0 A\'s so far, L requires fewer than 2 trailing Ls.',
      'Update the 6 counts n times, modulo 10⁹ + 7, and add them up. Matrix exponentiation would make it O(log n).',
    ],
  },
  'beautiful-arrangement': {
    statement: `A permutation \`perm\` of the numbers \`1\` to \`n\` is beautiful if, for every position \`i\` (1-indexed), \`perm[i]\` is divisible by \`i\` or \`i\` is divisible by \`perm[i]\`.

Return the number of beautiful permutations.`,
    constraints: ['1 <= n <= 15'],
    hints: [
      'Build the permutation position by position and prune as soon as a placement breaks the rule.',
      'Backtracking with a "used" array is fast enough for n ≤ 15.',
      'For a DP version, let the state be the set of numbers used (a bit mask). The next position is the count of bits set plus 1.',
    ],
  },
  'partition-to-k-equal-sum-subsets': {
    statement: `Return \`true\` if the values of \`nums\` can be divided into \`k\` non-empty groups whose sums are all equal. Every value must be used exactly once.`,
    constraints: ['1 <= nums.length <= 16', '1 <= k <= nums.length', '1 <= nums[i] <= 1e4'],
    hints: [
      'Each group must sum to total / k. If that is not an integer, or some value is larger than it, return false.',
      'Bit-mask DP: for each mask of used values, store the sum of the bucket currently being filled (total of mask modulo target). A value can be added if it fits in that bucket.',
      'A backtracking alternative fills buckets one at a time, trying values in descending order and skipping equal choices.',
    ],
  },
  'minimum-number-of-work-sessions-to-finish-the-tasks': {
    statement: `\`tasks[i]\` is the number of hours task \`i\` takes. You work in sessions of at most \`sessionTime\` hours each. A task must be finished within a single session, but you can do tasks in any order.

Return the minimum number of work sessions needed to finish all the tasks.`,
    constraints: ['1 <= tasks.length <= 14', '1 <= tasks[i] <= 10', 'sessionTime <= 15', 'Every task fits in a session: max(tasks) ≤ sessionTime'],
    hints: [
      'With at most 14 tasks, you can afford a state that records which tasks are done: a bit mask.',
      'For each mask, store the best pair (sessions used, hours used in the current session).',
      'From a mask, add a task: if it fits in the current session, add its hours; otherwise start a new session. Keep the lexicographically smallest pair.',
    ],
  },
  'shortest-path-visiting-all-nodes': {
    statement: `\`graph\` is a connected undirected graph with \`n\` nodes, where \`graph[i]\` lists the neighbours of node \`i\`. Return the length (number of edges) of the shortest walk that visits every node.

You may start and end at any node, and you may revisit nodes and reuse edges.`,
    constraints: ['1 <= graph.length <= 12', '0 <= graph[i][j] < graph.length', 'The graph is connected and has no self-loops'],
    hints: [
      'The position alone is not enough as a state: you also need to know which nodes have been visited.',
      'Run BFS over states (node, mask of visited nodes), starting from every (i, 1 << i) at once.',
      'The first time you reach a state whose mask has every bit set, its distance is the answer.',
    ],
  },
  'find-the-shortest-superstring': {
    statement: `Return a shortest string that contains every string in \`words\` as a substring. No word is a substring of another.

If several shortest strings exist, any of them is accepted.`,
    constraints: ['1 <= words.length <= 12', '1 <= words[i].length <= 20', 'Words are lowercase and unique', 'No word is a substring of another'],
    hints: [
      'Placing word b right after word a saves the length of the longest suffix of a that is a prefix of b. Precompute that overlap for every pair.',
      'The task becomes finding the order of words that maximises the total overlap: a travelling-salesman style problem.',
      'DP over (mask of words used, last word) storing the best total overlap and the parent choice, then rebuild the string by following the parents.',
    ],
  },
};
