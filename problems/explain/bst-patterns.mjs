export default {
  'search-in-a-binary-search-tree': {
    explain: 'Starting at 4, the value 2 is smaller, so go left and find it immediately. The answer is the subtree rooted at 2, written in level order as `[2,1,3]`.',
  },
  'convert-sorted-array-to-binary-search-tree': {
    explain: 'The middle value 0 becomes the root. The left half `[-10,-3]` becomes the left subtree (-10 with -3 to its right) and the right half `[5,9]` the right subtree (5 with 9 to its right): `[0,-10,5,null,-3,null,9]`. Any height-balanced BST with these values is accepted.',
  },
  'lowest-common-ancestor-of-a-binary-search-tree': {
    explain: '2 is smaller than the root 6 and 8 is larger, so they lie in different subtrees of 6. That makes 6 their lowest common ancestor, and the answer is 6.',
  },
  'validate-binary-search-tree': {
    explain: '1 is in the left subtree of 2 and smaller than it; 3 is in the right subtree and larger. Every node satisfies the rule, so the answer is `true`.',
  },
  'kth-smallest-element-in-a-bst': {
    explain: 'An in-order walk of the tree visits the values in sorted order: 1, 2, 3, 4. The 1st smallest is 1, so the answer is 1.',
  },
  'insert-into-a-binary-search-tree': {
    explain: '5 is larger than 4 (go right to 7) and smaller than 7 (go left), and 7 has no left child, so 5 becomes it. The tree is now `[4,2,7,1,3,5]`.',
  },
  'delete-node-in-a-bst': {
    explain: 'Node 3 has two children, so it is replaced by the smallest value in its right subtree, 4, which keeps the order. The result is `[5,4,6,2,null,null,7]`; other valid BSTs without 3 are accepted too.',
  },
  'binary-search-tree-iterator': {
    explain: 'The tree\'s values in order are 3, 7, 9, 15, 20. The calls return them one at a time, and `hasNext` is `true` until all five have been returned: `[null,3,7,true,9,true,15,true,20,false]`.',
  },
  'recover-binary-search-tree': {
    explain: 'An in-order walk gives 3, 2, 1, which should be increasing. Swapping the values 3 and 1 restores the order, giving `[3,1,null,null,2]`.',
  },
};
