export default {
  'transpose-matrix': {
    explain: 'Row 0 `1 2 3` becomes column 0, row 1 becomes column 1, and so on. The result is `[[1,4,7],[2,5,8],[3,6,9]]`.',
    more: 'For a non-square matrix the shape changes: a 2 × 3 matrix becomes 3 × 2. So create a new `n × m` result rather than swapping in place.',
  },
  'spiral-matrix': {
    explain: 'Go right along the top (1, 2, 3), down the right side (6, 9), left along the bottom (8, 7), up (4), then into the centre (5): `[1,2,3,6,9,8,7,4,5]`.',
  },
  'spiral-matrix-ii': {
    explain: 'Filling 1 to 9 clockwise from the top-left: 1, 2, 3 across the top, 4, 5 down the right, 6, 7 back along the bottom, 8 up, and 9 in the centre. The result is `[[1,2,3],[8,9,4],[7,6,5]]`.',
    more: 'Keep four boundaries (top, bottom, left, right) and shrink one after finishing each side of the spiral.',
  },
  'rotate-image': {
    explain: 'After a 90° clockwise turn the first column, read from the bottom (7, 4, 1), becomes the first row. The result is `[[7,4,1],[8,5,2],[9,6,3]]`.',
    more: 'A rotation in place is a transpose (swap across the main diagonal) followed by reversing every row.',
  },
  'set-matrix-zeroes': {
    explain: 'The 0 is in row 1, column 1, so that entire row and column become 0. The result is `[[1,0,1],[0,0,0],[1,0,1]]`.',
  },
  'game-of-life': {
    explain: 'Every cell is updated at the same time from its 8 neighbours: a live cell with 2 or 3 live neighbours survives, and a dead cell with exactly 3 comes alive. Applying that to every cell gives `[[0,0,0],[1,0,1],[0,1,1],[0,1,0]]`.',
  },
  'search-a-2d-matrix-ii': {
    explain: 'Start at the top-right (15). 5 is smaller, so move left to 11, 7 and 4; 5 is larger than 4, so move down to 5. Found, so the answer is `true`.',
  },
  'diagonal-traverse': {
    explain: 'The diagonals are read alternately up-right and down-left: 1, then 2, 4, then 7, 5, 3, then 6, 8, then 9, giving `[1,2,4,7,5,3,6,8,9]`.',
    more: 'All cells on one diagonal share the same `row + column`. Read even diagonals bottom to top and odd ones top to bottom.',
  },
};
