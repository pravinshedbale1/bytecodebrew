export default {
  'reverse-linked-list': {
    explain: 'Each `next` pointer is turned around, so the last node becomes the head and the list reads `[5,4,3,2,1]`.',
  },
  'merge-two-sorted-lists': {
    explain: 'Repeatedly take the smaller front node of the two lists: 1, 1, 2, 3, 4, 4. The merged list is `[1,1,2,3,4,4]`.',
    more: 'When the front values are equal, either node can go first. Once one list runs out, attach the rest of the other in one step.',
  },
  'remove-linked-list-elements': {
    explain: 'Both nodes with value 6 are removed and the rest keep their order, leaving `[1,2,3,4,5]`.',
    more: 'For example removing 7 from `[7,7,7,7]` leaves an empty list. A dummy node in front of the head lets you remove the head like any other node.',
  },
  'add-two-numbers': {
    explain: 'The lists hold 342 and 465 with the ones digit first. 342 + 465 = 807, stored the same way as `[7,0,8]`.',
  },
  'reverse-linked-list-ii': {
    explain: 'Positions 2 to 4 hold 2, 3, 4. Reversing only that part gives 4, 3, 2 while 1 and 5 stay in place: `[1,4,3,2,5]`.',
    more: 'If `left` equals `right` the list is unchanged. A dummy node before the head handles `left = 1`, where the head itself moves.',
  },
  'swap-nodes-in-pairs': {
    explain: 'Nodes are swapped two at a time: (1, 2) becomes 2, 1 and (3, 4) becomes 4, 3. The result is `[2,1,4,3]`.',
  },
  'partition-list': {
    explain: 'Nodes smaller than 3 (1, 2, 2) come first, then the rest (4, 3, 5), each group keeping its original order: `[1,2,2,4,3,5]`.',
  },
  'rotate-list': {
    explain: 'Rotating right by 2 moves the last two nodes, 4 and 5, to the front: `[4,5,1,2,3]`.',
    more: 'Rotating by the list\'s length gives back the same list, so only `k mod length` steps matter. Join the tail to the head, then cut at the new end.',
  },
  'reverse-nodes-in-k-group': {
    explain: 'With `k = 2`, the groups (1, 2) and (3, 4) are reversed. The last group has only one node, fewer than `k`, so it stays as it is: `[2,1,4,3,5]`.',
  },
};
