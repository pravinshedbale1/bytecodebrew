export default {
  'diameter-of-binary-tree': {
    explain: 'The longest path is 4 → 2 → 1 → 3 (or 5 → 2 → 1 → 3), which has 3 edges. So the diameter is 3.',
    more: 'Length is counted in edges, not nodes. At every node, the longest path through it is the height of its left subtree plus the height of its right subtree.',
  },
  'house-robber-iii': {
    explain: 'Rob the root (3), the 3 below the left child and the 1 below the right child. None of them is directly linked to another, and together they give 3 + 3 + 1 = 7.',
  },
  'longest-zigzag-path-in-a-binary-tree': {
    explain: 'The longest zigzag starts at the root\'s right child and goes right → left → right: 3 edges, alternating direction each step. So the answer is 3.',
  },
  'predict-the-winner': {
    explain: 'Player 1 must take 1 or 2 from an end, and either way player 2 then takes the 5. Player 1 ends with 3 at most against player 2\'s 5, so the answer is `false`.',
  },
  'minimum-score-triangulation-of-polygon': {
    explain: 'A triangle is already triangulated: the only triangle is the polygon itself, with score 1 × 2 × 3 = 6.',
  },
  'binary-tree-maximum-path-sum': {
    explain: 'The path 2 → 1 → 3 goes through the root and sums to 6. Any shorter path has a smaller sum, so the answer is 6.',
  },
  'binary-tree-cameras': {
    explain: 'One camera on the root\'s left child watches that node, its parent (the root) and its two children, which is every node in the tree. So the answer is 1.',
    more: 'Cameras watch only directly connected nodes, not grandparents or grandchildren. Placing cameras on the parents of leaves, from the bottom up, is the key idea.',
  },
  'burst-balloons': {
    explain: 'Burst 1 (3 × 1 × 5 = 15), then 5 (3 × 5 × 8 = 120), then 3 (1 × 3 × 8 = 24), then 8 (1 × 8 × 1 = 8). That collects 15 + 120 + 24 + 8 = 167 coins, the most possible.',
  },
  'minimum-cost-to-cut-a-stick': {
    explain: 'Cutting in the order 3, 5, 1, 4 costs 7 (the whole stick), then 4 (the piece 3–7), then 3 (piece 0–3), then 2 (piece 3–5): 16 in total, the cheapest order.',
  },
  'stone-game': {
    explain: 'Alice takes the 5 at the start. Whatever end Bob takes from [3,4,5], Alice can take a 5 or 4 next and finish with 9 or 10 stones out of 17, so the answer is `true`.',
  },
  'stone-game-ii': {
    explain: 'If Alice takes pile 1 (2 stones), M stays 1 and Bob takes piles 2 and 3 (16); Alice then takes the last two piles (8), for 10. Taking two piles first only gets her 9, so the answer is 10.',
  },
};
