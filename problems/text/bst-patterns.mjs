export default {
  'search-in-a-binary-search-tree': {
    statement: `\`root\` is the root of a binary search tree (BST): for every node, smaller values are in its left subtree and larger values in its right subtree. Find the node whose value is \`val\` and return the subtree rooted at it.

If no node has that value, return \`null\` (an empty tree).`,
    constraints: ['1 <= root.nodes <= 5000', '1 <= Node.val <= 1e7', '1 <= val <= 1e7', '`root` is a binary search tree'],
    hints: [
      'At each node, the BST property tells you which single direction to go.',
      'If val is smaller than node.val go left, if larger go right, if equal you have found it.',
      'This needs no recursion: a loop that walks down one path is O(height) time and O(1) space.',
    ],
  },
  'convert-sorted-array-to-binary-search-tree': {
    statement: `\`nums\` is sorted in strictly increasing order. Build a height-balanced binary search tree from its values and return the root. Height-balanced means that at every node, the heights of the two subtrees differ by at most one.

Several trees qualify; any of them is accepted.`,
    constraints: ['1 <= nums.length <= 1e4', '-1e4 <= nums[i] <= 1e4', '`nums` is strictly increasing'],
    hints: [
      'Which value should be the root so that both sides get about the same number of nodes?',
      'Pick the middle element as the root; the left half builds the left subtree and the right half the right subtree.',
      'Recurse on index ranges [lo, hi] rather than copying sub-arrays, returning null when lo > hi.',
    ],
  },
  'lowest-common-ancestor-of-a-binary-search-tree': {
    statement: `In a binary search tree, return the lowest common ancestor of the nodes with values \`p\` and \`q\`: the lowest node that has both as descendants (a node is a descendant of itself).

Values are unique and both \`p\` and \`q\` are in the tree. The tests give \`p\` and \`q\` as values; the judge prints the value of the node you return.`,
    constraints: ['2 <= root.nodes <= 1e5', '-1e9 <= Node.val <= 1e9', 'All values are unique; p and q are in the tree and differ', '`root` is a binary search tree'],
    hints: [
      'Unlike in a general tree, the values tell you where p and q are.',
      'If both p and q are smaller than the current node, the answer is in the left subtree; if both are larger, in the right.',
      'Otherwise they split here (or one of them is this node), so the current node is the answer. A loop from the root is enough.',
    ],
  },
  'validate-binary-search-tree': {
    statement: `Return \`true\` if the binary tree is a valid binary search tree:

- every value in a node's left subtree is strictly less than the node's value,
- every value in its right subtree is strictly greater,
- both subtrees are themselves valid BSTs.

Equal values are not allowed.`,
    constraints: ['1 <= root.nodes <= 1e4', '-2^31 <= Node.val <= 2^31 - 1'],
    hints: [
      'Checking only each node against its two children is not enough: a value deep in the left subtree must also be smaller than the root.',
      'Pass down an allowed range (low, high) for each subtree. Going left lowers the upper bound; going right raises the lower bound.',
      'Values can be Integer.MIN_VALUE or MAX_VALUE, so use long bounds or null to mean "no bound". An in-order traversal that checks for strictly increasing values also works.',
    ],
  },
  'kth-smallest-element-in-a-bst': {
    statement: `Return the \`k\`-th smallest value stored in the binary search tree, counting from 1 (so \`k = 1\` asks for the minimum).

Think about how you would answer quickly if the tree were modified often, which is a common follow-up.`,
    constraints: ['1 <= root.nodes <= 1e4', '1 <= k <= root.nodes', '0 <= Node.val <= 1e4', '`root` is a binary search tree'],
    hints: [
      'An in-order traversal of a BST visits the values in sorted order.',
      'Count nodes as you visit them in order, and stop at the k-th.',
      'An iterative in-order traversal with an explicit stack lets you stop early without visiting the rest of the tree.',
    ],
  },
  'insert-into-a-binary-search-tree': {
    statement: `Insert \`val\` into the binary search tree and return the root of the resulting tree. \`val\` is not already in the tree.

Several valid trees can result; any valid BST containing all the old values plus \`val\` is accepted.`,
    constraints: ['0 <= root.nodes <= 1e4', '-1e8 <= Node.val <= 1e8', '-1e8 <= val <= 1e8', '`root` is a binary search tree and does not contain val'],
    hints: [
      'There is always a free spot where val can be added as a new leaf.',
      'Walk down as if searching for val. The first null child you would step into is where it belongs.',
      'If the tree is empty, the new node is the root.',
    ],
  },
  'delete-node-in-a-bst': {
    statement: `Delete the node whose value is \`key\` from the binary search tree, if it exists, and return the root of the tree. The result must still be a valid BST.

Several valid results are possible; any of them is accepted.`,
    constraints: ['0 <= root.nodes <= 1e4', '-1e5 <= Node.val <= 1e5', '-1e5 <= key <= 1e5', '`root` is a binary search tree with unique values'],
    hints: [
      'First find the node, then think about the three cases: no children, one child, two children.',
      'With no child, remove it; with one child, replace the node by that child.',
      'With two children, copy in the smallest value of the right subtree (its in-order successor) and then delete that value from the right subtree.',
    ],
  },
  'binary-search-tree-iterator': {
    statement: `Implement \`BSTIterator\`, which walks a binary search tree in order (smallest to largest):

- \`BSTIterator(TreeNode root)\` creates the iterator,
- \`int next()\` returns the next smallest value,
- \`boolean hasNext()\` returns whether there is a next value.

\`next()\` is only called when a next value exists. Aim for O(h) memory, where h is the height of the tree, and amortised O(1) time per call.`,
    constraints: ['1 ≤ number of nodes ≤ 10⁵', '0 ≤ Node.val ≤ 10⁶', 'At most 10^5 calls to next and hasNext'],
    hints: [
      'Copying the whole in-order traversal into a list works but uses O(n) memory.',
      'Simulate an iterative in-order traversal: keep a stack holding the path of left children still to visit.',
      'next() pops a node, then pushes its right child and that child\'s whole chain of left children. hasNext() is "stack is not empty".',
    ],
  },
  'recover-binary-search-tree': {
    statement: `Exactly two nodes of a binary search tree had their values swapped by mistake. Put the values back where they belong without changing the tree's structure.

The method returns nothing; the judge prints the tree after your call.`,
    constraints: ['2 <= root.nodes <= 1000', '-2^31 <= Node.val <= 2^31 - 1'],
    hints: [
      'The in-order traversal of a correct BST is sorted. With two values swapped, it has one or two places where a value is followed by a smaller one.',
      'Walk in order and remember the previous node. At the first drop, the first misplaced node is the previous one; the second misplaced node is the current node at the last drop.',
      'Swap the values of those two nodes. Morris traversal does this with O(1) extra space.',
    ],
  },
};
