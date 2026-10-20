export default {
  'middle-of-the-linked-list': {
    explain: 'The list has 5 nodes, so the middle is the 3rd, the node with value 3. Printing the list from there gives `[3,4,5]`.',
    more: 'For an even length such as `[1,2,3,4,5,6]` there are two middle nodes, 3 and 4, and the answer is the second (`[4,5,6]`).',
  },
  'linked-list-cycle': {
    explain: 'The last node (-4) points back to the node at index 1 (value 2), so following `next` loops forever. The list has a cycle, and the answer is `true`.',
  },
  'happy-number': {
    explain: '1² + 9² = 82, 8² + 2² = 68, 6² + 8² = 100, and 1² + 0² + 0² = 1. The process reaches 1, so 19 is happy and the answer is `true`.',
  },
  'palindrome-linked-list': {
    explain: '1, 2, 2, 1 reads the same in both directions, so the answer is `true`.',
    more: 'For example `[1,2]` is not a palindrome. One way: find the middle with fast and slow pointers, reverse the second half, compare, and reverse it back.',
  },
  'remove-nth-node-from-end-of-list': {
    explain: 'The 2nd node from the end of `[1,2,3,4,5]` is 4. Removing it leaves `[1,2,3,5]`.',
    more: 'If `n` equals the list\'s length, the head itself is removed. A dummy node in front of the head makes that case no different from the others.',
  },
  'linked-list-cycle-ii': {
    explain: 'The tail (-4) links back to the node at index 1, so that is where the cycle begins. The judge prints the index of the node you return, 1.',
  },
  'reorder-list': {
    explain: 'Take nodes alternately from the front and the back: 1, then 4, then 2, then 3. The list becomes `[1,4,2,3]`.',
  },
  'find-the-duplicate-number': {
    explain: 'The values are 1 to 4 plus one extra, and 2 appears twice. So the answer is 2.',
  },
};
