export default {
  'assign-cookies': {
    statement: `Child \`i\` is content only with a cookie of size at least \`g[i]\` (their greed factor). Cookie \`j\` has size \`s[j]\`. Each child can get at most one cookie and each cookie can go to at most one child.

Return the maximum number of content children.`,
    constraints: ['1 <= g.length <= 3e4', '0 <= s.length <= 3e4', '1 <= g[i], s[i] <= 2^31 - 1'],
    hints: [
      'Wasting a big cookie on a child who would be happy with a small one can only hurt.',
      'Sort both arrays. Try to satisfy the least greedy child with the smallest cookie that is big enough.',
      'Use two pointers: if the current cookie satisfies the current child, move on to the next child; either way, move to the next cookie.',
    ],
  },
  'best-time-to-buy-and-sell-stock': {
    statement: `\`prices[i]\` is the price of a stock on day \`i\`. Choose one day to buy one share and a later day to sell it.

Return the maximum profit you can make, or \`0\` if no profitable trade exists.`,
    constraints: ['1 <= prices.length <= 1e5', '0 <= prices[i] <= 1e4'],
    hints: [
      'If you sell on day i, the best day to buy is the cheapest day before it.',
      'Scan once, tracking the lowest price seen so far.',
      'At each day, the profit of selling today is price − minSoFar. Keep the maximum.',
    ],
  },
  'jump-game': {
    statement: `You start at index \`0\` of \`nums\`. \`nums[i]\` is the maximum length of a jump from index \`i\` (you can jump any shorter distance too).

Return \`true\` if you can reach the last index.`,
    constraints: ['1 <= nums.length <= 1e4', '0 <= nums[i] <= 1e5'],
    hints: [
      'You do not need to choose actual jumps; you only need to know how far you could possibly get.',
      'Track the furthest index reachable so far while scanning from the left.',
      'If you ever stand on an index beyond that furthest reach, you are stuck: return false. Otherwise update reach = max(reach, i + nums[i]).',
    ],
  },
  'jump-game-ii': {
    statement: `You start at index \`0\` of \`nums\`, and \`nums[i]\` is the maximum length of a jump from index \`i\`. The last index is always reachable.

Return the minimum number of jumps needed to reach the last index.`,
    constraints: ['1 <= nums.length <= 1e4', '0 <= nums[i] <= 1000', 'The last index is reachable'],
    hints: [
      'Think in "levels", as in BFS: all indices reachable with one jump, then with two, and so on.',
      'Keep the end of the current level and the furthest index reachable from anywhere inside it.',
      'When you reach the end of the current level, you must jump: count one jump and set the level end to the furthest reach. Stop before the last index.',
    ],
  },
  'gas-station': {
    statement: `There are \`n\` gas stations on a circular route. Station \`i\` gives you \`gas[i]\` units of fuel, and driving from station \`i\` to the next station costs \`cost[i]\`. You start with an empty tank at one station.

Return the index of the station from which you can drive around the whole circuit once, or \`-1\` if it is impossible. If a solution exists, it is unique.`,
    constraints: ['1 <= gas.length <= 1e5', 'cost.length == gas.length', '0 <= gas[i], cost[i] <= 1e4'],
    hints: [
      'If total gas < total cost, no start can work. Otherwise exactly one start does.',
      'Drive from a candidate start, tracking the tank. If it goes negative at station i, no station between the start and i can be the answer either.',
      'So restart the candidate at i + 1 with an empty tank. One pass, O(n).',
    ],
  },
  'partition-labels': {
    statement: `Split \`s\` into as many parts as possible so that each letter appears in at most one part. Joined together in order, the parts must form \`s\`.

Return the sizes of the parts, in order.`,
    constraints: ['1 <= s.length <= 500', '`s` has only lowercase English letters'],
    hints: [
      'A part that contains some letter must extend at least to that letter\'s last occurrence.',
      'First record the last index of every letter.',
      'Scan with the current part\'s end = max(end, last[letter]). When the index reaches end, close the part and start a new one.',
    ],
  },
  'boats-to-save-people': {
    statement: `\`people[i]\` is the weight of person \`i\`. Each boat carries at most two people at the same time, as long as their total weight is at most \`limit\`.

Return the minimum number of boats needed to carry everyone. Every person can fit in a boat on their own.`,
    constraints: ['1 <= people.length <= 5e4', '1 <= people[i] <= limit', 'limit <= 3e4'],
    hints: [
      'The heaviest person needs a boat anyway. Who is the best partner for them?',
      'Sort the weights. Pair the heaviest remaining person with the lightest remaining person if they fit together.',
      'Use two pointers from both ends: the heavy pointer always moves, the light pointer moves only when the pair fits. Count one boat per step.',
    ],
  },
  'two-city-scheduling': {
    statement: `A company is interviewing \`2n\` people. \`costs[i] = [aCost, bCost]\` is the cost of flying person \`i\` to city A or to city B.

Exactly \`n\` people must go to each city. Return the minimum total cost.`,
    constraints: ['2 <= costs.length <= 100', 'costs.length is even', '1 <= costs[i][j] <= 1000'],
    hints: [
      'Imagine sending everyone to B, then choosing n people to switch to A. What does switching person i change?',
      'Switching person i changes the total by aCost − bCost. You want the n most negative (or least positive) changes.',
      'Sort by aCost − bCost; send the first half to A and the rest to B.',
    ],
  },
  'candy': {
    statement: `Children stand in a line, and \`ratings[i]\` is child \`i\`'s rating. Give out candies so that:

- every child gets at least one candy,
- a child with a higher rating than a neighbour gets more candies than that neighbour.

Return the minimum total number of candies.`,
    constraints: ['1 <= ratings.length <= 2e4', '0 <= ratings[i] <= 2e4'],
    hints: [
      'Each child has two constraints: one from the left neighbour and one from the right. Handle them separately.',
      'Left to right: if ratings[i] > ratings[i − 1], give candy[i] = candy[i − 1] + 1, otherwise 1.',
      'Right to left: if ratings[i] > ratings[i + 1], set candy[i] = max(candy[i], candy[i + 1] + 1). Sum the result.',
    ],
  },
  'lemonade-change': {
    statement: `At a lemonade stand each lemonade costs \`$5\`. Customers queue up and buy one at a time, in the order given by \`bills\`. Each customer pays with a single \`$5\`, \`$10\` or \`$20\` bill, and you must give them the right change so they pay exactly \`$5\`.

You start with no change at all. Return \`true\` if you can give every customer correct change, and \`false\` otherwise.`,
    constraints: ['1 <= bills.length <= 1e5', '`bills[i]` is 5, 10 or 20'],
    hints: [
      'Only $5 and $10 bills are ever useful as change. Keep a count of each.',
      'A $10 needs one $5 back. A $20 needs $15 back: either one $10 and one $5, or three $5s.',
      'For a $20, prefer giving the $10 + $5. $5 bills are more flexible (they also pay for $10 customers), so save them when you can.',
    ],
  },
  'merge-triplets-to-form-target-triplet': {
    statement: `\`triplets[i] = [a_i, b_i, c_i]\` and \`target = [x, y, z]\`. In one operation you pick two different indices \`i\` and \`j\` and replace \`triplets[j]\` with \`[max(a_i, a_j), max(b_i, b_j), max(c_i, c_j)]\`.

Return \`true\` if, after any number of operations (possibly none), \`target\` can appear as one of the triplets.`,
    constraints: ['1 <= triplets.length <= 1e5', 'Each triplet and target has three values', '1 <= triplets[i][j] <= 1000', '1 <= target[i] <= 1000'],
    hints: [
      'Merging only ever increases values. So a triplet with any value larger than the target\'s at the same position can never be used.',
      'Among the usable triplets, merging all of them gives the largest reachable values without overshooting.',
      'The answer is yes exactly when, for each of the three positions, some usable triplet matches the target there.',
    ],
  },
  'valid-parenthesis-string': {
    statement: `\`s\` contains only \`"("\`, \`")"\` and \`"*"\`. Return \`true\` if \`s\` is valid. It is valid if:

- every \`"("\` has a matching \`")"\` after it, and every \`")"\` has a matching \`"("\` before it;
- each \`"*"\` can be treated as a single \`"("\`, a single \`")"\`, or an empty string.`,
    constraints: ['1 <= s.length <= 100', '`s[i]` is "(", ")" or "*"'],
    hints: [
      'Trying all three options for every "*" is 3^k work for k stars. A DP over (index, open count) works in O(n²).',
      'Instead of one open count, track the range of possible open counts: lo (treat every "*" as ")") and hi (treat every "*" as "(").',
      'If hi ever drops below 0, too many ")" have appeared: fail. Never let lo go below 0, since a "*" can always be empty instead. The string is valid if lo is 0 at the end.',
    ],
  },
  'hand-of-straights': {
    statement: `Alice wants to rearrange her cards into groups of exactly \`groupSize\` cards, where each group consists of \`groupSize\` **consecutive** values (like 3, 4, 5). \`hand[i]\` is the value written on the \`i\`-th card.

Return \`true\` if she can use every card exactly once in such groups, and \`false\` otherwise.`,
    constraints: ['1 <= hand.length <= 1e4', '0 <= hand[i] <= 1e9', '1 <= groupSize <= hand.length'],
    hints: [
      'If the number of cards is not a multiple of groupSize, the answer is false immediately.',
      'The smallest card left must start a group, because no smaller card exists to come before it.',
      'Count the cards in a sorted map. Repeatedly take the smallest value v and remove one of each of v, v + 1, …, v + groupSize − 1; fail if any is missing.',
    ],
  },
  'dota2-senate': {
    statement: `The Dota2 senate has senators from two parties, Radiant (\`"R"\`) and Dire (\`"D"\`); \`senate[i]\` is the party of the \`i\`-th senator. Voting goes round by round, and in each round the senators act in order from first to last. A senator who has not been banned can do one of two things:

- **ban** one senator of the other party, who loses all rights in this and every later round;
- **announce victory**, if every senator still able to vote belongs to their own party.

Every senator plays the best strategy for their party. Return \`"Radiant"\` or \`"Dire"\`, the party that announces victory.`,
    constraints: ['1 <= senate.length <= 1e4', '`senate[i]` is "R" or "D"'],
    hints: [
      'Greedy: each senator should ban the next opposing senator who would act after them, since that opponent is the most immediate threat.',
      'Simulating round by round and scanning for the next opponent costs O(n²).',
      'Use two queues of positions, one per party. Compare the fronts: the earlier one bans the other and re-enters its queue at position + n (the next round); the later one is removed. The party whose queue empties loses.',
    ],
  },
  'jump-game-vii': {
    statement: `\`s\` is a binary string, and \`s[0]\` is \`"0"\`. You start at index \`0\`. From index \`i\` you can jump to index \`j\` if:

- \`i + minJump <= j <= min(i + maxJump, s.length − 1)\`, and
- \`s[j] == "0"\`.

Return \`true\` if you can reach index \`s.length − 1\`, and \`false\` otherwise.`,
    constraints: ['2 <= s.length <= 1e5', '`s[i]` is "0" or "1"', '`s[0]` is "0"', '1 <= minJump <= maxJump < s.length'],
    hints: [
      'reach[j] is true when s[j] is "0" and some reachable i lies in the window [j − maxJump, j − minJump]. Checking the whole window for every j is O(n · (maxJump − minJump)).',
      'Keep a running count of reachable indices inside that window as it slides: add index j − minJump when it enters, remove j − maxJump − 1 when it leaves.',
      'Alternatively, BFS while remembering the farthest index already scheduled, so each index is examined only once.',
    ],
  },
};
