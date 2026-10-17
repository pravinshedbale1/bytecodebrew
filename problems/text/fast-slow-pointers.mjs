export default {
  'middle-of-the-linked-list': {
    statement: `Return the middle node of the list. If there are two middle nodes (an even length), return the second of them.

The judge prints the list starting from the node you return.`,
    constraints: ['1 <= head.nodes <= 100', '1 <= Node.val <= 100'],
    hints: [
      'Counting the nodes and then walking half the count works in two passes. Can you do it in one?',
      'Move one pointer one step at a time and another two steps at a time.',
      'Loop while fast != null && fast.next != null. When the fast pointer reaches the end, the slow one is at the (second) middle.',
    ],
  },
  'linked-list-cycle': {
    statement: `Return \`true\` if the list contains a cycle: following the \`next\` pointers would visit some node again.

In the tests, \`pos\` is the index of the node the tail links back to (\`-1\` means no cycle). It only builds the list; your solution should look at the nodes, not at \`pos\`. Try to use O(1) extra memory.`,
    constraints: ['0 <= head.nodes <= 1e4', '-1e5 <= Node.val <= 1e5', '-1 <= pos < head.nodes'],
    hints: [
      'A HashSet of visited nodes finds a repeat, but uses O(n) memory.',
      'Use two pointers: slow moves one step, fast moves two. If there is no cycle, fast reaches null.',
      'If there is a cycle, fast gains one step per move inside it and must land on slow. Compare the nodes themselves (==), not their values.',
    ],
  },
  'happy-number': {
    statement: `Start with a positive integer \`n\` and repeatedly replace it with the sum of the squares of its digits. If this process reaches 1, \`n\` is a happy number. Otherwise the values loop forever in a cycle that does not include 1.

Return \`true\` if \`n\` is happy.`,
    constraints: ['1 <= n <= 2^31 - 1'],
    hints: [
      'The sequence of numbers either reaches 1 or repeats. Detecting a repeat is cycle detection.',
      'A HashSet of seen numbers works. For O(1) memory, run two copies of the sequence: one advances one step, the other two steps.',
      'Stop when the fast one hits 1 (happy) or the two meet at something other than 1 (not happy).',
    ],
  },
  'palindrome-linked-list': {
    statement: `Return \`true\` if the values of the list read the same forwards and backwards.

Copying the values into an array is O(n) extra space; try for O(n) time and O(1) extra space.`,
    constraints: ['1 <= head.nodes <= 1e5', '0 <= Node.val <= 9'],
    hints: [
      'You need to compare the first half with the second half read backwards.',
      'Find the middle with slow and fast pointers, then reverse the second half in place.',
      'Walk from the head and from the head of the reversed half at the same time, comparing values. (Reversing the half back afterwards restores the list.)',
    ],
  },
  'remove-nth-node-from-end-of-list': {
    statement: `Remove the \`n\`-th node counted from the end of the list and return the head. \`n\` is always valid.

Try to do it in a single pass.`,
    constraints: ['1 <= head.nodes <= 30', '0 <= Node.val <= 100', '1 <= n <= head.nodes'],
    hints: [
      'Two passes are easy: count the length L, then remove node L − n + 1. For one pass, think of two pointers with a fixed gap.',
      'Move a fast pointer n steps ahead, then move fast and slow together until fast reaches the last node.',
      'Start slow at a dummy node in front of head, so that it stops just before the node to remove; this also covers removing the head.',
    ],
  },
  'linked-list-cycle-ii': {
    statement: `If the list has a cycle, return the node where the cycle begins; otherwise return \`null\`. Do not modify the list.

As in "Linked List Cycle", the tests pass \`pos\` only to build the list. The judge prints the index of the node you return, or \`-1\` for \`null\`.`,
    constraints: ['0 <= head.nodes <= 1e4', '-1e5 <= Node.val <= 1e5', '-1 <= pos < head.nodes'],
    hints: [
      'First detect the cycle with slow and fast pointers.',
      'At the meeting point, the distance from head to the cycle start equals the distance from the meeting point forward to the cycle start (modulo the cycle length).',
      'So reset one pointer to head and move both one step at a time; where they meet is the start of the cycle.',
    ],
  },
  'reorder-list': {
    statement: `The list is \`L0 → L1 → … → Ln−1 → Ln\`. Reorder it into \`L0 → Ln → L1 → Ln−1 → L2 → Ln−2 → …\`.

Change the links between nodes in place (do not change values). The method returns nothing; the judge prints the list afterwards.`,
    constraints: ['1 <= head.nodes <= 5e4', '1 <= Node.val <= 1000'],
    hints: [
      'The result alternates between the first half (in order) and the second half (reversed).',
      'Find the middle with slow and fast pointers and cut the list there. Reverse the second half.',
      'Merge the two halves by alternating nodes: first from the front half, then from the reversed back half.',
    ],
  },
  'find-the-duplicate-number': {
    statement: `\`nums\` contains \`n + 1\` integers, each between \`1\` and \`n\`, so at least one value repeats. Exactly one value is repeated, though it may appear more than twice. Return it.

Do not modify the array, and use only O(1) extra space.`,
    constraints: ['2 <= nums.length <= 1e5 + 1', '1 <= nums[i] <= 1e5', 'Each `nums[i]` is at most nums.length − 1'],
    hints: [
      'Sorting modifies the array and a HashSet uses O(n) space. Think of the array as a function i → nums[i].',
      'Following i → nums[i] from index 0 is a linked list that must contain a cycle, because two indices point to the duplicate value.',
      'The duplicate is the start of that cycle: find it with Floyd\'s algorithm, exactly as in "Linked List Cycle II".',
    ],
  },
};
