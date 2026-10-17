export default {
  'transpose-matrix': {
    statement: `Return the transpose of \`matrix\`: flip it over its main diagonal, so row \`i\` becomes column \`i\`. An \`m × n\` matrix becomes \`n × m\`.`,
    constraints: ['1 <= matrix.length <= 1000', '1 <= matrix[0].length <= 1000', 'matrix.length × matrix[0].length ≤ 10⁵', '-1e9 <= matrix[i][j] <= 1e9'],
    hints: [
      'The matrix may not be square, so you cannot swap in place in general.',
      'Create a new n × m array.',
      'Set result[j][i] = matrix[i][j] for every cell.',
    ],
  },
  'spiral-matrix': {
    statement: `Return all elements of the \`m × n\` matrix in spiral order: start at the top-left, go right along the top row, down the right column, left along the bottom row, up the left column, and continue inward.`,
    constraints: ['1 <= matrix.length <= 10', '1 <= matrix[0].length <= 10', '-100 <= matrix[i][j] <= 100'],
    hints: [
      'Keep four boundaries: top, bottom, left and right.',
      'Walk the top row and move top down, walk the right column and move right in, then the bottom row (if top ≤ bottom) and the left column (if left ≤ right).',
      'Those two extra checks stop a single remaining row or column from being visited twice. Stop when you have m × n elements.',
    ],
  },
  'spiral-matrix-ii': {
    statement: `Return an \`n × n\` matrix filled with the numbers \`1\` to \`n²\` in spiral order, starting at the top-left and moving clockwise.`,
    constraints: ['1 <= n <= 20'],
    hints: [
      'This is "Spiral Matrix" in reverse: you write values instead of reading them.',
      'Use the same four boundaries and write an increasing counter along each side.',
      'Alternatively, walk with a direction vector and turn right whenever the next cell is outside the grid or already filled.',
    ],
  },
  'rotate-image': {
    statement: `Rotate the \`n × n\` matrix by 90 degrees clockwise, in place: modify \`matrix\` directly without allocating another matrix.

The method returns nothing; the judge prints the matrix after your call.`,
    constraints: ['1 <= matrix.length <= 20', 'matrix[0].length == matrix.length', '-1000 <= matrix[i][j] <= 1000'],
    hints: [
      'A clockwise rotation can be built from two simpler in-place operations.',
      'Transpose the matrix (swap matrix[i][j] with matrix[j][i] for j > i), then reverse each row.',
      'Or rotate layer by layer, moving four cells at a time in a cycle.',
    ],
  },
  'set-matrix-zeroes': {
    statement: `If any cell of \`matrix\` is \`0\`, set its entire row and its entire column to \`0\`. Do it in place.

Using O(m + n) extra space is straightforward; the follow-up asks for O(1). The judge prints the matrix after your call.`,
    constraints: ['1 <= matrix.length <= 200', '1 <= matrix[0].length <= 200', '-2^31 <= matrix[i][j] <= 2^31 - 1'],
    hints: [
      'If you zero rows and columns while scanning, new zeros will wrongly spread further. First record, then apply.',
      'Two boolean arrays (one for rows, one for columns) record which ones to clear.',
      'For O(1) space, use the first row and first column as those markers, with two flags saying whether the first row or column itself must be cleared. Clear the first row and column last.',
    ],
  },
  'game-of-life': {
    statement: `\`board\` is a grid of cells, each alive (\`1\`) or dead (\`0\`). Compute the next generation, where every cell looks at its 8 neighbours:

- a live cell with fewer than 2 or more than 3 live neighbours dies,
- a live cell with 2 or 3 live neighbours stays alive,
- a dead cell with exactly 3 live neighbours becomes alive.

All cells update at the same time. Change \`board\` in place; the judge prints it after your call.`,
    constraints: ['1 <= board.length <= 25', '1 <= board[0].length <= 25', '0 <= board[i][j] <= 1'],
    hints: [
      'If you update cells one by one, later cells see the new values of earlier ones. Copying the board solves that.',
      'To work in place, use the second bit to store the next state: the current state is board[i][j] & 1.',
      'Count neighbours using & 1, set bit 2 for cells that live in the next generation, then shift every cell right by one.',
    ],
  },
  'search-a-2d-matrix-ii': {
    statement: `Each row of \`matrix\` is sorted in ascending order from left to right, and each column is sorted in ascending order from top to bottom. Return \`true\` if \`target\` is in the matrix.

Unlike "Search a 2D Matrix", a row does not have to start after the previous row ends.`,
    constraints: ['1 <= matrix.length <= 300', '1 <= matrix[0].length <= 300', '-1e9 <= matrix[i][j] <= 1e9', '-1e9 <= target <= 1e9'],
    hints: [
      'Start in a corner where one direction makes values larger and the other makes them smaller.',
      'From the top-right corner: if the value is greater than target, move left; if smaller, move down.',
      'Each step removes a row or a column, so it takes O(m + n).',
    ],
  },
  'diagonal-traverse': {
    statement: `Return all elements of the \`m × n\` matrix in diagonal zig-zag order: the first diagonal going up and to the right, the next going down and to the left, and so on, alternating.`,
    constraints: ['1 <= mat.length <= 1e4', '1 <= mat[0].length <= 1e4', 'mat.length × mat[0].length ≤ 10⁴', '-1e5 <= mat[i][j] <= 1e5'],
    hints: [
      'All cells on one diagonal have the same r + c, from 0 to m + n − 2.',
      'For each diagonal d, collect its cells with r from max(0, d − n + 1) to min(d, m − 1).',
      'Reverse the order on even-numbered diagonals so they run upward. That gives the zig-zag.',
    ],
  },
};
