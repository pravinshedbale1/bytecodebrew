export default {
  'reverse-linked-list': {
    statement: `Given the \`head\` of a singly linked list, reverse the list and return the new head.

Lists are written as arrays in the tests, so \`[1,2,3]\` is \`1 → 2 → 3\`, and \`[]\` is an empty list (\`head\` is \`null\`).`,
    constraints: ['0 <= head.nodes <= 5000', '-5000 <= Node.val <= 5000'],
    hints: [
      'Walk the list once and point each node back at the node before it.',
      'Keep three references: prev (starts null), curr, and next (saved before you overwrite curr.next).',
      'Loop: next = curr.next; curr.next = prev; prev = curr; curr = next. At the end prev is the new head. A recursive version is a good second exercise.',
    ],
  },
  'merge-two-sorted-lists': {
    statement: `\`list1\` and \`list2\` are sorted in non-decreasing order. Merge them into one sorted list by splicing together the existing nodes (no new value nodes), and return its head.

Either list may be empty.`,
    constraints: ['0 <= list1.nodes, list2.nodes <= 50', '-100 <= list1.val, list2.val <= 100', 'Both lists are sorted in non-decreasing order'],
    hints: [
      'At every step the next node of the result is the smaller of the two current heads.',
      'A dummy head node avoids special-casing the first node: keep a tail pointer and attach the smaller node to tail.next.',
      'When one list runs out, attach the rest of the other list in one step.',
    ],
  },
  'remove-linked-list-elements': {
    statement: `Remove every node whose value equals \`val\` from the list starting at \`head\`, and return the head of the resulting list.

The head itself may need to be removed, possibly several times in a row.`,
    constraints: ['0 <= head.nodes <= 1e4', '1 <= Node.val <= 50', '0 <= val <= 50'],
    hints: [
      'Removing a node means changing the next pointer of the node before it. What about the head, which has no node before it?',
      'Put a dummy node in front of head, so every real node has a predecessor.',
      'Walk with a pointer to the previous node: if prev.next has the value, skip it (prev.next = prev.next.next); otherwise advance prev. Return dummy.next.',
    ],
  },
  'add-two-numbers': {
    statement: `Two non-negative integers are stored as linked lists of digits in reverse order: the first node holds the ones digit. For example, \`[2,4,3]\` is 342.

Return the sum of the two numbers as a linked list in the same reverse order. Neither number has leading zeros except the number 0 itself.`,
    constraints: ['1 <= l1.nodes, l2.nodes <= 100', '0 <= l1.val, l2.val <= 9'],
    hints: [
      'Reverse order is convenient: it is the order in which you add digits by hand, from the ones place up.',
      'Walk both lists together with a carry. Each new digit is (a + b + carry) % 10 and the new carry is the sum / 10.',
      'Keep going while either list has nodes left or the carry is non-zero, treating a missing digit as 0.',
    ],
  },
  'reverse-linked-list-ii': {
    statement: `Reverse the part of the list from position \`left\` to position \`right\` (positions start at 1, both ends included) and return the head of the list.

Try to do it in one pass.`,
    constraints: ['1 <= head.nodes <= 500', '-500 <= Node.val <= 500', '1 <= left <= right', 'right <= head.nodes'],
    hints: [
      'Find the node just before position left. A dummy head handles left = 1.',
      'Reverse the next (right − left + 1) nodes the usual way, remembering the node where the reversed part starts (it becomes its tail).',
      'Reconnect: the node before the section points to the new section head, and the old section head points to the node after the section. Or repeatedly move the next node to the front of the section.',
    ],
  },
  'swap-nodes-in-pairs': {
    statement: `Swap every two adjacent nodes of the list and return its head: \`1 → 2 → 3 → 4\` becomes \`2 → 1 → 4 → 3\`. If the length is odd, the last node stays where it is.

Change the links between nodes; do not just swap their values.`,
    constraints: ['0 <= head.nodes <= 100', '0 <= Node.val <= 100'],
    hints: [
      'Each step works on a pair (a, b) and the node before it, prev. A dummy head gives the first pair a prev.',
      'Rewire: prev.next = b, a.next = b.next, b.next = a. Then a is the prev of the next pair.',
      'Stop when fewer than two nodes remain. Recursion also works: swap the first two and attach swapPairs(rest).',
    ],
  },
  'partition-list': {
    statement: `Rearrange the list so that every node with a value less than \`x\` comes before every node with a value greater than or equal to \`x\`.

Keep the original relative order of the nodes within each of the two groups, and return the head.`,
    constraints: ['0 <= head.nodes <= 200', '-100 <= Node.val <= 100', '-200 <= x <= 200'],
    hints: [
      'Build two separate lists as you walk: one for values < x and one for the rest.',
      'Use a dummy head and a tail pointer for each list, appending nodes in the order you meet them.',
      'Join the "less" list\'s tail to the "rest" list\'s head, and set the end of the "rest" list to null so you do not create a cycle.',
    ],
  },
  'rotate-list': {
    statement: `Rotate the list to the right by \`k\` places: each step moves the last node to the front. Return the new head.

\`k\` can be much larger than the length of the list.`,
    constraints: ['0 <= head.nodes <= 500', '-100 <= Node.val <= 100', '0 <= k <= 2e9'],
    hints: [
      'Rotating by the list length gives the same list back, so only k % length matters.',
      'Find the length and the tail in one pass, then connect the tail to the head to make a ring.',
      'Walk length − (k % length) steps from the old tail; that node is the new tail. Its next is the new head; cut the ring there.',
    ],
  },
  'reverse-nodes-in-k-group': {
    statement: `Reverse the nodes of the list \`k\` at a time and return the head. If the number of nodes left at the end is less than \`k\`, those nodes keep their order.

Change the links, not the values, and use only O(1) extra memory.`,
    constraints: ['1 <= head.nodes <= 5000', '0 <= Node.val <= 1000', '1 <= k <= head.nodes'],
    hints: [
      'Handle one group at a time: first check that k nodes remain, and stop if they do not.',
      'Reverse exactly k nodes with the usual three-pointer loop, keeping a pointer to the node before the group (start with a dummy).',
      'After reversing, the group\'s old first node is its new last node: connect it to the rest of the list and make it the "before" node of the next group.',
    ],
  },
  'insert-greatest-common-divisors-in-linked-list': {
    statement: `For every pair of adjacent nodes in the list, insert a new node between them whose value is the **greatest common divisor** (GCD) of the two values. Return the head of the resulting list.

The GCD of two numbers is the largest positive integer that divides both.`,
    constraints: ['1 <= head.nodes <= 5000', '1 <= head.val <= 1000'],
    hints: [
      'Walk the list with a pointer a. While a has a next node b, a new node goes between them.',
      'Create the node with value gcd(a.val, b.val), point it at b, and point a at it. Then jump to b (two steps), so you never insert next to a node you just created.',
      'Euclid\'s algorithm: gcd(a, b) = gcd(b, a mod b), and gcd(a, 0) = a.',
    ],
  },
  'copy-list-with-random-pointer': {
    statement: `Each node of the list has a \`val\`, a \`next\` pointer and a \`random\` pointer, which points to any node of the list or is \`null\`.

Return a **deep copy** of the list: \`n\` brand-new nodes with the same values, whose \`next\` and \`random\` pointers point to the corresponding **new** nodes. No pointer of the copy may point into the original list.

In the tests, a list is written as \`[[val, random_index], …]\`, where \`random_index\` is the position of the node \`random\` points to, or \`null\`. The judge prints your copy in the same form and rejects it if it shares any node with the original.`,
    constraints: ['The list has between 0 and 1000 nodes', '-10⁴ ≤ Node.val ≤ 10⁴', '`Node.random` is null or points to a node in the list'],
    hints: [
      'Creating the new nodes is easy. The problem is the random pointer: when you copy a node, the node its random points to may not have been copied yet.',
      'Make two passes. First create every copy and remember old → new in a hash map. Then set copy.next = map[old.next] and copy.random = map[old.random].',
      'For O(1) extra space, weave each copy right after its original (A → A\' → B → B\'). Then A\'.random = A.random.next, and finally unweave the two lists.',
    ],
  },
};
