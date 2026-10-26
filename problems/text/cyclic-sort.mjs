export default {
  'find-all-numbers-disappeared-in-an-array': {
    statement: `\`nums\` has \`n\` integers, and every one of them is between \`1\` and \`n\`. Some values may repeat, so some numbers in that range may be absent. Return all the numbers from \`1\` to \`n\` that do not appear in \`nums\`, in any order.

Follow-up: can you do it in O(n) time without extra space? The list you return does not count as extra space.`,
    constraints: ['n == nums.length', '1 <= n <= 1e5', '1 <= nums[i] <= n'],
    hints: [
      'A boolean array of size n + 1 marking what you have seen works in O(n) time but O(n) space. Can the input array itself do the marking?',
      'Every value v has a natural home: index v − 1. Swap each value into its home (cyclic sort), skipping a value whose home already holds the same value.',
      'After placement, every value that appears sits at its home. Any index i that does not hold i + 1 means i + 1 is missing.',
    ],
  },
  'set-mismatch': {
    statement: `\`nums\` was meant to contain each number from \`1\` to \`n\` exactly once (in some order), where \`n\` is its length. By mistake, one number was overwritten with a copy of another, so one value now appears twice and one value is missing.

Return an array \`[repeated, missing]\`: the value that appears twice, then the value that is gone.`,
    constraints: ['2 <= nums.length <= 1e4', '1 <= nums[i] <= 1e4', 'Apart from the one overwritten value, nums holds 1 … n exactly once each'],
    hints: [
      'Counting how often each value appears (an int array of size n + 1) finds both answers in O(n) time and O(n) space.',
      'For O(1) extra space, put each value v at index v − 1 by swapping; leave a value in place when its home already holds a copy of it.',
      'After placement exactly one index i does not hold i + 1. The value sitting there is the repeated one, and i + 1 is the missing one.',
    ],
  },
  'find-missing-and-repeated-values': {
    statement: `\`grid\` is an \`n × n\` matrix whose values are between \`1\` and \`n²\`. Every number in that range appears exactly once, except that one number \`a\` appears twice and one number \`b\` does not appear at all.

Return \`[a, b]\`.`,
    constraints: ['n == grid.length', '2 <= n <= 50', 'grid[i].length == n', '1 <= grid[i][j] <= n * n', 'Exactly one value in 1 … n² appears twice and exactly one is missing; every other value appears once'],
    hints: [
      'Forget the rows: this is the same problem as an array of n² values from 1 to n² with one value duplicated and one missing.',
      'A count array of size n² + 1 is the simplest answer. Without it, read cell k as grid[k / n][k % n] and cyclic-sort the grid in place, so value v goes to cell v − 1.',
      'Another O(1)-space route: the sums of the values and of their squares differ from the ideal 1 … n² sums by (a − b) and (a² − b²). Two equations, two unknowns (use long).',
    ],
  },
  'find-all-duplicates-in-an-array': {
    statement: `\`nums\` has \`n\` integers, each between \`1\` and \`n\`, and every value appears either once or twice. Return all the values that appear twice, in any order.

Your algorithm must run in O(n) time and use only constant extra space (the returned list does not count).`,
    constraints: ['n == nums.length', '1 <= n <= 1e5', '1 <= nums[i] <= n', 'Each value appears once or twice'],
    hints: [
      'A HashSet finds repeats in O(n) time but O(n) space. The values are indexes in disguise: value v can be tied to index v − 1.',
      'Cyclic sort: swap each value into index v − 1, skipping a value whose home already holds the same value. Then a slot i holding something other than i + 1 holds a spare copy, a duplicate.',
      'Or sign marking: for each v, look at nums[|v| − 1]. If it is already negative, |v| was seen before, so it is a duplicate; otherwise negate it.',
    ],
  },
  'array-nesting': {
    statement: `\`nums\` is a permutation of the numbers \`0\` to \`n − 1\`. For a starting index \`k\`, build the set \`{nums[k], nums[nums[k]], nums[nums[nums[k]]], …}\`, adding values until the next one would be a repeat.

Return the size of the largest such set over all starting indexes.`,
    constraints: ['1 <= nums.length <= 1e5', '0 <= nums[i] < nums.length', 'All values in nums are distinct'],
    hints: [
      'Draw an arrow from each index i to nums[i]. In a permutation every index has one arrow out and one in, so the arrows form separate cycles. Each set is one cycle.',
      'Starting from every index and walking until a repeat is O(n²) in the worst case (one big cycle). Every index on a cycle gives the same set, so walk each cycle only once.',
      'Mark indexes as visited (a boolean array, or overwrite nums[i] with −1) and skip starts that are already visited. The answer is the longest cycle, found in O(n).',
    ],
  },
  'minimum-number-of-operations-to-sort-a-binary-tree-by-level': {
    statement: `You are given the root of a binary tree whose values are all distinct. In one operation you may pick any two nodes **on the same level** and swap their values.

Return the minimum number of operations needed so that the values on every level, read from left to right, are in strictly increasing order. (The root is on level 0; a node's level is its number of edges from the root.)`,
    constraints: ['1 <= root.nodes <= 1e5', '1 <= root.val <= 1e5', 'All values in the tree are distinct'],
    hints: [
      'Levels never interact: swaps stay within a level. Collect each level\'s values with a BFS, solve "minimum swaps to sort this array" for each, and add the answers.',
      'Give each value a target: its index in a sorted copy of the level. Following i → target of a[i] splits the indexes into cycles.',
      'A cycle of length L takes exactly L − 1 swaps, so one level needs (size − number of cycles). Equivalently, cyclic-sort each value to its target and count the swaps.',
    ],
  },
  'couples-holding-hands': {
    statement: `There are \`n\` couples sitting in a row of \`2n\` seats. \`row[i]\` is the person in seat \`i\`, and the couples are \`(0, 1)\`, \`(2, 3)\`, …, \`(2n − 2, 2n − 1)\`.

In one swap, any two people stand up and exchange seats. Return the minimum number of swaps so that every couple sits side by side, meaning in seats \`2j\` and \`2j + 1\` for some \`j\`.`,
    constraints: ['4 <= row.length <= 60', 'row.length is even: n = row.length / 2 couples, 2 <= n <= 30', '0 <= row[i] < row.length', 'All values in row are distinct'],
    hints: [
      'Person x\'s partner is x ^ 1 (flip the lowest bit): 0 ↔ 1, 2 ↔ 3, …',
      'Go through the seat pairs (0, 1), (2, 3), … in order. If seat 2j + 1 does not hold the partner of the person in seat 2j, swap the partner into it. Keep an array of where each person sits so the partner is found in O(1).',
      'Why is that optimal? Treat each seat pair as a node and each couple as an edge between the seat pairs its two members sit in. The graph splits into cycles, a cycle of k seat pairs needs k − 1 swaps, and each greedy swap fixes one seat pair.',
    ],
  },
};
