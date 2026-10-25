export default {
  'maximum-depth-of-binary-tree': {
    statement: `Return the maximum depth of the binary tree: the number of nodes on the longest path from the root down to a leaf. An empty tree has depth 0.

Trees in the tests are written in level order with \`null\` for a missing child, so \`[3,9,20,null,null,15,7]\` has root 3, children 9 and 20, and 20 has children 15 and 7.`,
    constraints: ['0 <= root.nodes <= 1e4', '-100 <= Node.val <= 100'],
    hints: [
      'The depth of a tree is 1 + the larger depth of its two subtrees.',
      'Write it recursively: maxDepth(null) = 0, otherwise 1 + max(maxDepth(left), maxDepth(right)).',
      'An iterative alternative counts levels with a breadth-first search.',
    ],
  },
  'same-tree': {
    statement: `Return \`true\` if the binary trees \`p\` and \`q\` are the same: they have exactly the same shape and every pair of corresponding nodes has the same value.`,
    constraints: ['0 <= p.nodes, q.nodes <= 100', '-1e4 <= p.val, q.val <= 1e4'],
    hints: [
      'Two trees are the same if their roots match and their left subtrees are the same and their right subtrees are the same.',
      'Handle the base cases first: both null is true; exactly one null is false.',
      'Then compare the values and recurse on (p.left, q.left) and (p.right, q.right).',
    ],
  },
  'invert-binary-tree': {
    statement: `Invert the binary tree, which means mirroring it: swap the left and right child of every node. Return the root.`,
    constraints: ['0 <= root.nodes <= 100', '-100 <= Node.val <= 100'],
    hints: [
      'Mirroring a tree means mirroring both subtrees and then swapping them.',
      'Recursively invert the left and right subtrees, then swap the two pointers.',
      'Any traversal works as long as every node gets its children swapped exactly once; a queue-based BFS is the iterative version.',
    ],
  },
  'symmetric-tree': {
    statement: `Return \`true\` if the binary tree is symmetric around its centre, meaning the left subtree is a mirror image of the right subtree.`,
    constraints: ['1 <= root.nodes <= 1000', '-100 <= Node.val <= 100'],
    hints: [
      'Compare two subtrees at a time: are they mirror images of each other?',
      'Two trees a and b mirror each other if a.val == b.val, a.left mirrors b.right, and a.right mirrors b.left.',
      'Start with isMirror(root.left, root.right). Both null is true; exactly one null is false.',
    ],
  },
  'path-sum': {
    statement: `Return \`true\` if the tree has a root-to-leaf path whose node values add up to \`targetSum\`. A leaf is a node with no children.

An empty tree has no paths, so the answer for it is \`false\`.`,
    constraints: ['0 <= root.nodes <= 5000', '-1000 <= Node.val <= 1000', '-1000 <= targetSum <= 1000'],
    hints: [
      'As you walk down, subtract each node\'s value from the target that remains.',
      'At a leaf, check whether the remaining target equals the leaf\'s value.',
      'Only stop at real leaves (both children null). A node with one child is not the end of a path, which is why [1,2] with target 1 is false.',
    ],
  },
  'balanced-binary-tree': {
    statement: `A binary tree is height-balanced if, at every node, the heights of the left and right subtrees differ by at most one. Return \`true\` if the tree is height-balanced.`,
    constraints: ['0 <= root.nodes <= 5000', '-1e4 <= Node.val <= 1e4'],
    hints: [
      'Checking the heights from the top, at every node, recomputes heights again and again (O(n²) on a skewed tree).',
      'Compute heights bottom-up instead: a function that returns the height of a subtree, or −1 if it is unbalanced.',
      'If either child returns −1, or their heights differ by more than 1, return −1; otherwise return 1 + max. The tree is balanced if the root does not return −1.',
    ],
  },
  'count-good-nodes-in-binary-tree': {
    statement: `A node \`X\` is good if no node on the path from the root to \`X\` has a value greater than \`X\`'s value. The root is always good.

Return the number of good nodes in the tree.`,
    constraints: ['1 <= root.nodes <= 1e5', '-1e4 <= Node.val <= 1e4'],
    hints: [
      'Whether a node is good depends only on the largest value seen on the path above it.',
      'Do a DFS that passes down the maximum so far.',
      'A node is good when node.val ≥ maxSoFar; pass max(maxSoFar, node.val) to the children and add up the counts.',
    ],
  },
  'lowest-common-ancestor-of-a-binary-tree': {
    statement: `Return the lowest common ancestor (LCA) of the nodes with values \`p\` and \`q\`: the lowest node in the tree that has both of them as descendants, where a node counts as a descendant of itself.

All values are unique, \`p != q\`, and both are in the tree. The tests give \`p\` and \`q\` as values; the judge prints the value of the node you return.`,
    constraints: ['2 <= root.nodes <= 1e5', '-1e9 <= Node.val <= 1e9', 'All values are unique; p and q are in the tree and differ'],
    hints: [
      'Ask each subtree: "do you contain p or q?" and pass the answer up.',
      'Recurse: if the current node is p or q, return it. Otherwise look in both subtrees.',
      'If both sides return a node, the current node is the LCA. If only one side does, return that side\'s result.',
    ],
  },
  'construct-binary-tree-from-preorder-and-inorder-traversal': {
    statement: `\`preorder\` and \`inorder\` are the preorder and inorder traversals of the same binary tree, whose values are all distinct. Build the tree and return its root.`,
    constraints: ['1 <= preorder.length <= 3000', 'inorder.length == preorder.length', '-3000 <= preorder[i], inorder[i] <= 3000', 'The values are unique'],
    hints: [
      'The first value of preorder is the root. Where does that value sit in inorder?',
      'Everything left of the root in inorder is the left subtree; everything right of it is the right subtree. Their sizes tell you how to split preorder too.',
      'Use a HashMap from value to inorder index and recurse on index ranges, consuming preorder from left to right. That is O(n) instead of O(n²).',
    ],
  },
  'serialize-and-deserialize-binary-tree': {
    statement: `Design a \`Codec\` with two methods:

- \`String serialize(TreeNode root)\` turns a binary tree into a string,
- \`TreeNode deserialize(String data)\` turns that string back into the same tree.

You choose the format. The judge serialises with one \`Codec\` object, deserialises with a second one, and prints the rebuilt tree, so the string must carry everything.`,
    constraints: ['0 <= root.nodes <= 1e5', '-1000 <= Node.val <= 1000'],
    hints: [
      'A preorder traversal alone is ambiguous, but it becomes unambiguous if you also write a marker for every null child.',
      'serialize: preorder DFS writing "val," for a node and "#," for null. deserialize: read tokens in order, recursively building root, left, then right.',
      'Use a StringBuilder, not string concatenation, and avoid deep recursion for very tall trees (or build iteratively), since a 10⁵-node chain is possible.',
    ],
  },
  'binary-tree-inorder-traversal': {
    statement: `Return the **inorder** traversal of the tree's values: for every node, first everything in its left subtree, then the node itself, then everything in its right subtree.

Follow-up: the recursive solution is short. Can you do it iteratively?`,
    constraints: ['0 <= root.nodes <= 100', '-100 <= root.val <= 100'],
    hints: [
      'Recursively: traverse(left), add the node, traverse(right).',
      'Iteratively, a stack replaces the call stack. Go as far left as you can, pushing each node you pass.',
      'Pop a node, record it, then move to its right child and repeat the "go left" step. Stop when both the current pointer is null and the stack is empty.',
    ],
  },
  'binary-tree-preorder-traversal': {
    statement: `Return the **preorder** traversal of the tree's values: for every node, first the node itself, then everything in its left subtree, then everything in its right subtree.

Follow-up: can you do it iteratively?`,
    constraints: ['0 <= root.nodes <= 100', '-100 <= root.val <= 100'],
    hints: [
      'Recursively: add the node, traverse(left), traverse(right).',
      'Iteratively, pop a node from a stack, record it and push its children.',
      'Push the right child before the left one, so the left child is popped (and visited) first.',
    ],
  },
  'binary-tree-postorder-traversal': {
    statement: `Return the **postorder** traversal of the tree's values: for every node, first everything in its left subtree, then everything in its right subtree, then the node itself.

Follow-up: can you do it iteratively?`,
    constraints: ['0 <= root.nodes <= 100', '-100 <= root.val <= 100'],
    hints: [
      'Recursively: traverse(left), traverse(right), add the node.',
      'Postorder reversed is "node, right, left", which is just preorder with the children swapped.',
      'Run that modified preorder with a stack (push left, then right) and reverse the result, or add each value to the front of the list.',
    ],
  },
  'subtree-of-another-tree': {
    statement: `Return \`true\` if \`root\` contains a subtree with exactly the same structure and node values as \`subRoot\`, and \`false\` otherwise.

A subtree of \`root\` is a node of \`root\` together with **all** of its descendants. \`root\` counts as a subtree of itself.`,
    constraints: ['1 <= root.nodes <= 2000', '1 <= subRoot.nodes <= 1000', '-1e4 <= root.val <= 1e4', '-1e4 <= subRoot.val <= 1e4'],
    hints: [
      'Write a helper sameTree(a, b) that checks whether two trees are identical.',
      'Then try every node of root as a starting point: isSubtree(root) = sameTree(root, subRoot) || isSubtree(root.left) || isSubtree(root.right).',
      'That is O(m · n). For O(m + n), serialise both trees with markers for null children and between values (like ",4,1,#,#,2,#,#"), then search for one string in the other with KMP.',
    ],
  },
  'construct-quad-tree': {
    statement: `\`grid\` is an \`n × n\` matrix of 0s and 1s, where \`n\` is a power of 2. Represent it as a **quad tree** and return the root.

Each quad tree node has \`val\` (true for 1, false for 0) and \`isLeaf\`, plus four children \`topLeft\`, \`topRight\`, \`bottomLeft\` and \`bottomRight\`. To build the node for a square region:

- if every cell in the region has the same value, the node is a leaf: \`isLeaf = true\`, \`val\` = that value, and no children;
- otherwise \`isLeaf = false\` (\`val\` can be anything) and the region is split into four equal quarters, each built the same way.

The output lists the nodes level by level as \`[isLeaf, val]\` (1 for true, 0 for false), writing \`null\` for the missing children of leaves, as LeetCode does. Inner nodes are shown with \`val = 1\`, whatever you set.`,
    constraints: ['n == grid.length', 'n == grid[i].length', 'n is a power of 2 between 1 and 64', '0 <= grid[i][j] <= 1'],
    hints: [
      'Write build(row, col, size) for the square starting at (row, col). A 1 × 1 square is always a leaf.',
      'Top-down: if all cells in the square are equal, return a leaf; otherwise recurse on the four quarters. Checking every square costs O(n²) per level, O(n² log n) in total.',
      'Bottom-up is O(n²): build the four quarters first, and if all four are leaves with the same value, merge them into one leaf instead of creating an inner node.',
    ],
  },
  'delete-leaves-with-a-given-value': {
    statement: `Delete every **leaf** node whose value is \`target\`. If deleting a leaf turns its parent into a leaf with value \`target\`, delete the parent too, and keep going until no such leaf is left. Return the root of the remaining tree (which may be empty).`,
    constraints: ['1 <= root.nodes <= 3000', '1 <= root.val <= 1000', '1 <= target <= 1000'],
    hints: [
      'Whether a node becomes a leaf depends on what happens to its children first. Which traversal order handles children before their parent?',
      'Postorder: recursively clean the left and right subtrees and assign the results back to root.left and root.right.',
      'After that, if root has no children and root.val == target, return null; otherwise return root. One pass handles the chain reaction.',
    ],
  },
};
