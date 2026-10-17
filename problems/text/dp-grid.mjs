export default {
  'unique-paths': {
    statement: `A robot stands in the top-left corner of an \`m × n\` grid and wants to reach the bottom-right corner. It can only move right or down, one cell at a time.

Return the number of distinct paths. The answer is at most \`2 × 10^9\`.`,
    constraints: ['1 <= m, n <= 100'],
    hints: [
      'The only ways into a cell are from the cell above it and from the cell to its left.',
      'paths[r][c] = paths[r − 1][c] + paths[r][c − 1], with every cell of the first row and column equal to 1.',
      'One row of the table is enough. It is also a combination: C(m + n − 2, m − 1).',
    ],
  },
  'unique-paths-ii': {
    statement: `As in "Unique Paths", a robot moves only right or down from the top-left cell to the bottom-right cell. Now \`obstacleGrid[i][j]\` is \`1\` for an obstacle and \`0\` for a free cell, and the robot cannot enter obstacles.

Return the number of distinct paths. If the start or end is blocked, the answer is \`0\`.`,
    constraints: ['1 <= obstacleGrid.length <= 100', '1 <= obstacleGrid[0].length <= 100', '0 <= obstacleGrid[i][j] <= 1'],
    hints: [
      'Use the same recurrence as "Unique Paths", but a cell with an obstacle has 0 paths.',
      'Careful with the first row and column: past an obstacle, nothing further along can be reached.',
      'A single array works: set dp[c] = 0 on an obstacle, otherwise dp[c] += dp[c − 1].',
    ],
  },
  'minimum-path-sum': {
    statement: `\`grid\` contains non-negative numbers. Find a path from the top-left cell to the bottom-right cell, moving only right or down, that has the smallest possible sum of the numbers along it.

Return that sum.`,
    constraints: ['1 <= grid.length <= 200', '1 <= grid[0].length <= 200', '0 <= grid[i][j] <= 200'],
    hints: [
      'The cheapest way into a cell comes from the cheaper of the cell above and the cell to the left.',
      'cost[r][c] = grid[r][c] + min(cost[r − 1][c], cost[r][c − 1]); the first row and column only have one way in.',
      'You can update the grid in place or keep a single row.',
    ],
  },
  'triangle': {
    statement: `\`triangle\` has one value in its first row, two in its second, and so on. Starting at the top, each step moves to an adjacent value in the row below: from index \`i\` you can go to index \`i\` or \`i + 1\`.

Return the minimum sum of a path from the top to the bottom row.`,
    constraints: ['1 <= triangle.length <= 200', 'Row i has i + 1 values', '-1e4 <= triangle[i][j] <= 1e4'],
    hints: [
      'Going top-down, each cell has two parents and the edges need special cases. Try going bottom-up.',
      'Start with the bottom row. Each cell above becomes its value plus the smaller of its two children.',
      'After processing all rows, the top holds the answer. One array the size of the bottom row is enough.',
    ],
  },
  'minimum-falling-path-sum': {
    statement: `\`matrix\` is \`n × n\`. A falling path starts at any cell of the first row and, at each step, moves to the next row: directly below, below-left or below-right.

Return the minimum sum of any falling path.`,
    constraints: ['1 <= matrix.length <= 100', 'matrix[0].length == matrix.length', '-100 <= matrix[i][j] <= 100'],
    hints: [
      'The best path to a cell comes from one of the three cells above it.',
      'best[r][c] = matrix[r][c] + min(best[r − 1][c − 1], best[r − 1][c], best[r − 1][c + 1]), skipping columns that are out of range.',
      'The answer is the minimum of the last row. Keeping only the previous row gives O(n) space.',
    ],
  },
  'maximal-square': {
    statement: `\`matrix\` is filled with the characters \`'0'\` and \`'1'\`. Return the area of the largest square that contains only \`'1'\`s.`,
    constraints: ['1 <= matrix.length <= 300', '1 <= matrix[0].length <= 300', '`matrix[i][j]` is "0" or "1"'],
    hints: [
      'Let side[r][c] be the side of the largest all-1 square whose bottom-right corner is (r, c).',
      'If the cell is "1", side[r][c] = 1 + min(side above, side to the left, side above-left). Any of the three can limit the square.',
      'Track the largest side and return its square. One row of the table plus a variable for the diagonal is enough.',
    ],
  },
  'count-square-submatrices-with-all-ones': {
    statement: `\`matrix\` contains \`0\`s and \`1\`s. Count every square submatrix, of any size, that is made entirely of \`1\`s.

A 2 × 2 block of ones contains five such squares: four of size 1 and one of size 2.`,
    constraints: ['1 <= matrix.length <= 300', '1 <= matrix[0].length <= 300', '0 <= matrix[i][j] <= 1'],
    hints: [
      'Use the same table as "Maximal Square": side[r][c] = the largest all-ones square ending at (r, c).',
      'A square of side k ending at (r, c) also contains squares of sides k − 1, …, 1 ending there, so the cell contributes side[r][c] squares.',
      'Sum side[r][c] over all cells.',
    ],
  },
  'dungeon-game': {
    statement: `A knight starts in the top-left room of \`dungeon\` and must reach the princess in the bottom-right room, moving only right or down. Each room changes his health by \`dungeon[i][j]\` (negative values hurt, positive values heal). If his health ever drops to 0 or below, he dies.

Return the minimum health he needs at the start.`,
    constraints: ['1 <= dungeon.length <= 200', '1 <= dungeon[0].length <= 200', '-1000 <= dungeon[i][j] <= 1000'],
    hints: [
      'Working forward is hard because you have to balance the health needed now against the health gained later.',
      'Work backward from the princess: need[r][c] is the health needed when entering room (r, c).',
      'need[r][c] = max(1, min(need[r + 1][c], need[r][c + 1]) − dungeon[r][c]), with the last room needing max(1, 1 − its value).',
    ],
  },
  'cherry-pickup': {
    statement: `\`grid\` is \`n × n\`. Each cell is \`1\` (a cherry), \`0\` (empty) or \`-1\` (a thorn you cannot pass). Walk from the top-left to the bottom-right moving only right or down, then walk back to the top-left moving only left or up, picking up every cherry you pass (a cell's cherry can be picked only once).

Return the maximum number of cherries you can collect, or \`0\` if there is no valid trip.`,
    constraints: ['1 <= grid.length <= 50', 'grid[0].length == grid.length', '-1 <= grid[i][j] <= 1', 'The start and end cells are not thorns'],
    hints: [
      'Doing the best trip there and then the best trip back is not optimal. Treat it as two people walking from the start at the same time.',
      'After t steps both people are on the diagonal r + c = t, so the state (t, r1, r2) determines both positions.',
      'For each state, take the best of the four combinations of previous moves, and add the cherries at both cells (only once if they are on the same cell). Thorns make a state invalid.',
    ],
  },
};
