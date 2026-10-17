export default {
  'binary-tree-level-order-traversal': {
    statement: `Return the values of the tree level by level: a list for each level, from the root level down, with each level's values from left to right.`,
    constraints: ['0 <= root.nodes <= 2000', '-1000 <= Node.val <= 1000'],
    hints: [
      'Use a queue: nodes come out in the order they went in, which is level by level.',
      'At the start of each level, the queue holds exactly that level. Record its size before you start.',
      'Pop that many nodes into the current level\'s list, pushing their children for the next level.',
    ],
  },
  'average-of-levels-in-binary-tree': {
    statement: `Return the average of the node values on each level of the tree, from the top level down.

Answers within \`10^-5\` of the exact value are accepted.`,
    constraints: ['1 <= root.nodes <= 1e4', '-2^31 <= Node.val <= 2^31 - 1'],
    hints: [
      'This is a level-order traversal where you only keep one number per level.',
      'Process the queue one level at a time, adding the values and counting the nodes.',
      'Values can be as large as 2³¹ − 1, so add them in a long or a double to avoid overflow.',
    ],
  },
  'minimum-depth-of-binary-tree': {
    statement: `Return the minimum depth of the tree: the number of nodes on the shortest path from the root down to a leaf (a node with no children). An empty tree has depth 0.`,
    constraints: ['0 <= root.nodes <= 1e5', '-1000 <= Node.val <= 1000'],
    hints: [
      'A node with only one child is not a leaf. That is the trap in a simple 1 + min(left, right).',
      'Breadth-first search finds the nearest leaf first: return the current depth at the first leaf you pop.',
      'In a recursive version, if one child is null, return 1 + the depth of the other child.',
    ],
  },
  'binary-tree-right-side-view': {
    statement: `Imagine standing to the right of the tree. Return the values of the nodes you can see, from top to bottom: on each level, the rightmost node.`,
    constraints: ['0 <= root.nodes <= 100', '-100 <= Node.val <= 100'],
    hints: [
      'The visible node on each level is the last one on that level, even if it sits in the left subtree.',
      'Do a level-order traversal and record the last node popped on each level.',
      'Alternatively, run a DFS that visits right before left and records the first node it reaches at each new depth.',
    ],
  },
  'binary-tree-zigzag-level-order-traversal': {
    statement: `Return the values level by level, alternating direction: the first level left to right, the next right to left, and so on.`,
    constraints: ['0 <= root.nodes <= 2000', '-100 <= Node.val <= 100'],
    hints: [
      'Start with an ordinary level-order traversal.',
      'Keep a flag that flips after each level.',
      'Either reverse the level\'s list on alternate levels, or build it with a deque, adding to the front on right-to-left levels.',
    ],
  },
  'find-largest-value-in-each-tree-row': {
    statement: `Return a list with the largest value on each level of the tree, from the top level down. An empty tree gives an empty list.`,
    constraints: ['0 <= root.nodes <= 1e4', '-2^31 <= Node.val <= 2^31 - 1'],
    hints: [
      'Visit the tree level by level and keep the maximum of each level.',
      'Start each level\'s maximum at the first node\'s value (or Integer.MIN_VALUE) and update it as you pop nodes.',
      'Values can be Integer.MIN_VALUE itself, so make sure a level of only those values still reports it correctly.',
    ],
  },
  'populating-next-right-pointers-in-each-node': {
    statement: `The tree is perfect: every internal node has two children and all leaves are on the same level. Each node has an extra pointer \`next\`. Set every node's \`next\` to the node to its right on the same level, or to \`null\` for the last node of a level.

Return the root. The judge prints each level by following \`next\` pointers, ending every level with \`#\`.`,
    constraints: ['0 <= root.nodes <= 4095', '-1000 <= Node.val <= 1000', 'The tree is a perfect binary tree'],
    hints: [
      'A level-order traversal with a queue works: link each node to the next one popped on the same level.',
      'For O(1) extra space, use the next pointers of the level you have already connected to walk across it.',
      'For each node on a level: node.left.next = node.right, and if node.next exists, node.right.next = node.next.left. Then move down to the leftmost node of the next level.',
    ],
  },
  'maximum-width-of-binary-tree': {
    statement: `The width of a level is the number of positions between its leftmost and rightmost non-null nodes, inclusive, counting the empty positions in between as if the tree were a complete binary tree.

Return the maximum width over all levels. The answer fits in a 32-bit signed integer.`,
    constraints: ['1 <= root.nodes <= 3000', '-100 <= Node.val <= 100'],
    hints: [
      'Give every node a position number as in a heap: the root is 0, the children of i are 2i + 1 and 2i + 2.',
      'Do a level-order traversal carrying these positions. A level\'s width is last position − first position + 1.',
      'Positions double every level and can overflow. Subtract the level\'s first position from each position before computing the children.',
    ],
  },
};
