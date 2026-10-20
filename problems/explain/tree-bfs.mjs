export default {
  'binary-tree-level-order-traversal': {
    explain: 'The root 3 is alone on the first level, 9 and 20 form the second, and 15 and 7 (the children of 20) form the third. So the answer is `[[3],[9,20],[15,7]]`.',
    more: 'The tree is given in level order, with `null` marking a missing child. Visit it with a queue, processing one whole level at a time.',
  },
  'average-of-levels-in-binary-tree': {
    explain: 'The levels are [3], [9, 20] and [15, 7]. Their averages are 3, (9 + 20) / 2 = 14.5 and (15 + 7) / 2 = 11, giving `[3.0,14.5,11.0]`.',
    more: 'Process the tree one level at a time with a queue, summing the values on each level and dividing by how many there are. Use a wide enough type for the sums.',
  },
  'minimum-depth-of-binary-tree': {
    explain: 'Node 9 has no children, so it is a leaf only two nodes from the top (3 → 9). The other leaves, 15 and 7, are three nodes down, so the answer is 2.',
    more: 'Careful: a node with only one child is not a leaf, so the path has to continue down that child. A level-by-level search can stop at the first leaf it meets.',
  },
  'binary-tree-right-side-view': {
    explain: 'The rightmost node on each level is 1 on the first, 3 on the second, and 4 on the third (it sits further right than 5). So you see `[1,3,4]`.',
    more: 'A node hidden on the left can still be visible if nothing is to its right on that level: in `[1,2,3,4]` the view is `[1,3,4]` because 4 is the only node on the third level.',
  },
  'binary-tree-zigzag-level-order-traversal': {
    explain: 'The first level [3] is read left to right, the second is read right to left as [20, 9], and the third left to right again as [15, 7]. So the answer is `[[3],[20,9],[15,7]]`.',
    more: 'Collect each level in the normal left-to-right order, then reverse every other level (or fill it from the back) before adding it to the answer.',
  },
  'find-largest-value-in-each-tree-row': {
    explain: 'The levels are [1], [3, 2] and [5, 3, 9]. Their largest values are 1, 3 and 9, so the answer is `[1,3,9]`.',
    more: 'Values can be negative, so start each level\'s maximum from the first node on it rather than from 0.',
  },
  'populating-next-right-pointers-in-each-node': {
    explain: 'After linking, 1 points to nothing, 2 points to 3, and 4 → 5 → 6 → 7 on the bottom level. Read level by level with "#" marking the end of each level, that is `["1","#","2","3","#","4","5","6","7","#"]`.',
  },
  'maximum-width-of-binary-tree': {
    explain: 'The bottom level holds 5, 3, a missing node, and 9. Counting from the leftmost node (5) to the rightmost (9), including the gap, gives width 4, the largest of any level.',
  },
};
