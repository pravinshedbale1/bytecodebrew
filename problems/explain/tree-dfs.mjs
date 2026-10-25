export default {
  'maximum-depth-of-binary-tree': {
    explain: 'The longest root-to-leaf path is 3 → 20 → 15 (or 3 → 20 → 7), which has 3 nodes. So the depth is 3.',
  },
  'same-tree': {
    explain: 'Both trees have root 1 with left child 2 and right child 3, so they match node for node and the answer is `true`.',
    more: 'For example `[1,2]` and `[1,null,2]` hold the same values but are different shapes (2 is a left child in one and a right child in the other), so they are not the same.',
  },
  'invert-binary-tree': {
    explain: 'Swapping the children of every node makes 7 the left child of 4 and 2 the right child; under them 9, 6 and 3, 1 swap too. Read in level order that is `[4,7,2,9,6,3,1]`.',
    more: 'Trees are given and returned in level order, with `null` for a missing child. Recursively invert both subtrees and then swap them.',
  },
  'symmetric-tree': {
    explain: 'The root\'s two children are both 2. Their children read 3, 4 on the left and 4, 3 on the right, which is the mirror image, so the answer is `true`.',
    more: 'Compare the two subtrees in mirror fashion: the left child of one with the right child of the other, and vice versa.',
  },
  'path-sum': {
    explain: 'The path 5 → 4 → 11 → 2 ends at a leaf and adds up to 5 + 4 + 11 + 2 = 22, so the answer is `true`.',
    more: 'The path must end at a leaf: stopping partway down at a node that still has children does not count, even if the running sum matches.',
  },
  'balanced-binary-tree': {
    explain: 'At the root the left subtree (just 9) has height 1 and the right subtree (20 with two children) has height 2, a difference of 1. Every other node is also within 1, so the answer is `true`.',
    more: 'Compute heights bottom-up and stop as soon as some node is unbalanced; recomputing heights from every node separately costs O(n²).',
  },
  'count-good-nodes-in-binary-tree': {
    explain: 'The good nodes are the root 3, the 4, the 3 under the 1 (the path 3, 1, 3 has nothing bigger than 3), and the 5. The two 1s each have a 3 above them. That is 4 good nodes.',
    more: 'Walk down the tree carrying the largest value seen so far on the path: a node is good when its value is at least that maximum.',
  },
  'lowest-common-ancestor-of-a-binary-tree': {
    explain: 'Node 5 is in the root\'s left subtree and node 1 is in its right subtree, so the deepest node that has both below it is the root, 3.',
  },
  'construct-binary-tree-from-preorder-and-inorder-traversal': {
    explain: 'Preorder starts with the root, 3. In inorder, 9 is left of 3 and 15, 20, 7 are right of it, so 9 is the left subtree and 20 (next in preorder) roots the right one with children 15 and 7. In level order that is `[3,9,20,null,null,15,7]`.',
    more: 'The answer is returned in level order with `null` for a missing child. A hash map from value to inorder index avoids searching for the root each time.',
  },
  'serialize-and-deserialize-binary-tree': {
    explain: 'The tests turn the tree into a string with your serialize, rebuild it with your deserialize, and compare. The rebuilt tree must be the same as the original, `[1,2,3,null,null,4,5]`.',
  },
  'binary-tree-inorder-traversal': {
    explain: 'Node 1 has no left child, so it comes first. Then its right subtree: 2 has left child 3, so 3 comes before 2. The answer is `[1,3,2]`.',
  },
  'binary-tree-preorder-traversal': {
    explain: 'Preorder visits 1 first, then its right subtree rooted at 2, where 2 comes before its left child 3. The answer is `[1,2,3]`.',
  },
  'binary-tree-postorder-traversal': {
    explain: 'Postorder finishes the deepest node first: 3 (left child of 2), then 2, then the root 1. The answer is `[3,2,1]`.',
  },
  'subtree-of-another-tree': {
    explain: 'The node 4 in `root` has children 1 and 2 and nothing below them, which is exactly `subRoot`, so the answer is `true`.',
    more: 'For example, if node 2 had an extra child 0 underneath, the subtree at 4 would no longer match, because a subtree must include every descendant.',
  },
  'construct-quad-tree': {
    explain: 'The 2 × 2 grid mixes 0s and 1s, so the root is an inner node, shown as [0,1]. Each quarter is a single cell and so a leaf: 0, 1, 1, 0. The output is `[[0,1],[1,0],[1,1],[1,1],[1,0]]`.',
  },
  'delete-leaves-with-a-given-value': {
    explain: 'The leaves with value 2 (under node 2 on the left, and under node 3) are deleted. The left 2 then becomes a leaf with value 2, so it goes too. What is left is 1 → 3 → 4: `[1,null,3,null,4]`.',
  },
};
