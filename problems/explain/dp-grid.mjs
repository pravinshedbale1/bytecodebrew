export default {
  'unique-paths': {
    explain: 'Every path from the top-left to the bottom-right of a 3 × 7 grid makes 2 moves down and 6 moves right, 8 moves in all. Choosing which 2 of the 8 are "down" gives C(8, 2) = 28 paths.',
  },
  'unique-paths-ii': {
    explain: 'The obstacle in the centre blocks every path through the middle. That leaves two routes: right, right, down, down along the top edge, and down, down, right, right along the left edge. So the answer is 2.',
  },
  'minimum-path-sum': {
    explain: 'The path 1 → 3 → 1 → 1 → 1 (right, right, down, down) adds up to 7, and no other path of right and down moves is cheaper. So the answer is 7.',
  },
  triangle: {
    explain: 'Going down 2 → 3 → 5 → 1, each step to an adjacent number in the row below, adds up to 11, the smallest possible. So the answer is 11.',
  },
  'minimum-falling-path-sum': {
    explain: 'Start at 1 in the top row, fall to 5 (straight down) and then to 7 (down-left): 1 + 5 + 7 = 13. The path 1 → 4 → 8 also sums to 13, and nothing is smaller, so the answer is 13.',
  },
  'maximal-square': {
    explain: 'The largest all-`1` square is 2 × 2, for example rows 1–2 and columns 2–3 (counting from 0). No 3 × 3 block is all ones, so the answer is its area, 4.',
    more: 'The square must be axis-aligned and every cell inside it must be `\'1\'`. Return its area, the side length squared, or 0 if the matrix has no `\'1\'` at all.',
  },
  'count-square-submatrices-with-all-ones': {
    explain: 'There are 10 cells containing 1 (squares of side 1), 4 all-ones squares of side 2 and 1 of side 3. In total 10 + 4 + 1 = 15.',
    more: 'Squares of different sizes and positions are all counted, even when they overlap. A useful fact: the number of squares whose bottom-right corner is a given cell equals the side of the largest one there.',
  },
  'dungeon-game': {
    explain: 'The best route is right, right, down, down through -2, -3, 3, 1 and -5. Starting with 7 health, the knight never drops below 1 (7 → 5 → 2 → 5 → 6 → 1), and starting with 6 he would. So the answer is 7.',
  },
  'cherry-pickup': {
    explain: 'Going down, down, right, right picks the cherries at (1,0), (2,0), (2,1) and (2,2): 4 cherries. Coming back up the other side picks the remaining one at (0,1). That makes 5, the most possible.',
  },
  'longest-increasing-path-in-a-matrix': {
    explain: 'One longest path is 1 → 2 → 6 → 9: from the 1 in the bottom row, up to 2, up to 6, up to 9. No path is longer, so the answer is 4.',
  },
};
