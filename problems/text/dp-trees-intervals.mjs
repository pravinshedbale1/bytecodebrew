export default {
  'diameter-of-binary-tree': {
    statement: `The diameter of a binary tree is the number of edges on the longest path between any two nodes. That path may or may not pass through the root.

Return the diameter.`,
    constraints: ['1 <= root.nodes <= 1e5', '-1e5 <= Node.val <= 1e5'],
    hints: [
      'Any path has a highest node. At that node, the path goes down into the left subtree and down into the right subtree.',
      'Write a function that returns a subtree\'s height. At each node, left height + right height is a candidate diameter.',
      'Update a global maximum in that function; the height it returns is 1 + max(left, right). Very tall trees (10⁵ nodes in a line) need deep recursion.',
    ],
  },
  'house-robber-iii': {
    statement: `The houses form a binary tree, and \`root\` holds the money in each house. Robbing two houses that are directly linked (parent and child) sets off the alarm.

Return the maximum amount of money you can rob.`,
    constraints: ['1 <= root.nodes <= 1e4', '0 <= Node.val <= 1e4'],
    hints: [
      'At each house you either rob it (then its children must be skipped) or skip it (then each child is free to choose).',
      'Return a pair from each subtree: the best total if its root is robbed, and the best if it is not.',
      'rob = node.val + left.skip + right.skip; skip = max(left) + max(right). The answer is max of the root\'s pair.',
    ],
  },
  'longest-zigzag-path-in-a-binary-tree': {
    statement: `A zigzag path starts at any node, picks a direction (left or right), and keeps moving to a child while switching direction at every step.

The length of a zigzag path is the number of edges it uses. Return the length of the longest zigzag path in the tree.`,
    constraints: ['1 <= root.nodes <= 5e4', '1 <= Node.val <= 100'],
    hints: [
      'At each node, remember two numbers: the longest zigzag arriving from a left move and from a right move.',
      'Going to the left child continues a path that last moved right (length + 1) and restarts the other direction at 1.',
      'DFS passing (node, leftLength, rightLength), keeping the overall maximum.',
    ],
  },
  'predict-the-winner': {
    statement: `Two players take turns. On each turn, a player takes the number at either end of \`nums\` and adds it to their score. Player 1 starts, and both players play optimally.

Return \`true\` if player 1 can win; a tie counts as a win for player 1.`,
    constraints: ['1 <= nums.length <= 20', '0 <= nums[i] <= 1e7'],
    hints: [
      'Instead of tracking both scores, track the score difference from the point of view of the player to move.',
      'diff(i, j) = max(nums[i] − diff(i + 1, j), nums[j] − diff(i, j − 1)): take one end, then the opponent plays the rest optimally.',
      'Player 1 wins if diff(0, n − 1) ≥ 0. Fill the table by increasing interval length.',
    ],
  },
  'minimum-score-triangulation-of-polygon': {
    statement: `A convex polygon has \`n\` vertices with values \`values[0]\`, …, \`values[n − 1]\`, in clockwise order. Triangulate it into \`n − 2\` triangles. Each triangle's score is the product of its three vertex values.

Return the smallest possible total score.`,
    constraints: ['3 <= values.length <= 50', '1 <= values[i] <= 100'],
    hints: [
      'The edge between vertex i and vertex j belongs to exactly one triangle, whose third vertex k lies between them.',
      'best[i][j] = min over k of best[i][k] + best[k][j] + values[i]·values[k]·values[j], with best[i][i + 1] = 0.',
      'Fill by increasing distance j − i. The answer is best[0][n − 1]. This is interval DP, O(n³).',
    ],
  },
  'binary-tree-maximum-path-sum': {
    statement: `A path is a sequence of nodes where each pair of neighbouring nodes is connected by an edge, and no node appears more than once. It does not have to pass through the root, and it must contain at least one node.

Return the largest sum of node values over all paths.`,
    constraints: ['1 <= root.nodes <= 3e4', '-1000 <= Node.val <= 1000'],
    hints: [
      'Like the diameter: every path has a highest node, where it may join a branch from the left and a branch from the right.',
      'Return from each subtree the best "downward" path starting at its root. Negative branches are never worth taking, so clamp them at 0.',
      'At each node, node.val + left + right is a candidate answer; the value returned upward is node.val + max(left, right).',
    ],
  },
  'binary-tree-cameras': {
    statement: `Cameras can be installed on the nodes of the tree. A camera watches its own node, its parent and its immediate children.

Return the minimum number of cameras needed to watch every node.`,
    constraints: ['1 <= root.nodes <= 1000', '0 <= Node.val <= 0'],
    hints: [
      'A leaf never needs a camera of its own: putting one on its parent covers more.',
      'Work bottom-up and give each node one of three states: covered without a camera, has a camera, or not yet covered.',
      'If any child is not covered, put a camera here. Else if any child has a camera, this node is covered. Else this node is not covered and waits for its parent. Check the root at the end.',
    ],
  },
  'burst-balloons': {
    statement: `\`nums\` holds the numbers painted on balloons in a row. Bursting balloon \`i\` earns \`nums[left] × nums[i] × nums[right]\` coins, where \`left\` and \`right\` are its current neighbours (after earlier balloons have burst). A missing neighbour counts as 1.

Burst all the balloons in the best order and return the maximum number of coins.`,
    constraints: ['1 <= nums.length <= 300', '0 <= nums[i] <= 100'],
    hints: [
      'Choosing the first balloon to burst changes everyone\'s neighbours. Choose the last one to burst in a range instead.',
      'Pad nums with 1 at both ends. best[l][r] is the most coins from bursting everything strictly between l and r.',
      'If k is the last balloon burst between l and r, its neighbours are l and r: best[l][r] = max over k of best[l][k] + nums[l]·nums[k]·nums[r] + best[k][r]. Fill by increasing width.',
    ],
  },
  'minimum-cost-to-cut-a-stick': {
    statement: `A wooden stick has length \`n\` and is marked with positions \`0\` to \`n\`. You must cut it at every position listed in \`cuts\`, in any order you choose. Each cut costs the length of the piece being cut at that moment.

Return the minimum total cost.`,
    constraints: ['2 <= n <= 1e6', '1 <= cuts.length <= 100', '1 <= cuts[i] < n', 'The cut positions are distinct'],
    hints: [
      'The cost of a cut depends on which cuts happened before it. Think about the first cut made in a piece.',
      'Sort the cuts and add the stick ends 0 and n. best[i][j] is the cheapest way to make every cut strictly between positions i and j.',
      'best[i][j] = (pos[j] − pos[i]) + min over k between them of best[i][k] + best[k][j]. Fill by increasing width.',
    ],
  },
};
