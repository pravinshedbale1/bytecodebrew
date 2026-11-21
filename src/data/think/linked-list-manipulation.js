/** Practice thinking walkthroughs: linked-list-manipulation (format: src/data/think/index.js). */
export default {
  'reverse-linked-list': {
    free: true,
    aha: 'The nodes stay where they are; only the arrows turn around. Walk once with three pointers (prev, cur, next): save next, point cur back at prev, then step forward. When cur runs out, prev is the new head.',
    asks: {
      read: 'Which words say what you can and can\'t do with this list?',
      budget: 'Any approach is fast enough. What should you save instead of time?',
      observe: 'If you set 1.next = null right away in [1, 2, 3, 4, 5], how do you reach 2 afterwards?',
      brute: 'How would you reverse the values with an array? What does that miss?',
      pattern: 'How many pointers do you need so that flipping an arrow never loses the rest of the list?',
      watch: 'Watch save, flip, advance on every node.',
    },
    read: [
      { phrase: 'singly linked list', says: 'Each node knows only the node after it. Going backwards means changing the arrows themselves.' },
      { phrase: 'reverse the list and return the new head', says: 'The old tail becomes the head, so the function must return a different node than it was given.' },
      { phrase: '`[]` is an empty list', says: 'head can be null: the code must handle it without a special crash.' },
    ],
    budget: { from: 'number of nodes ≤ 5000', n: 5000, aim: 'O(n) time, O(1) space', note: 'Every approach is fast here. The real question is doing it in place, with no extra memory.' },
    observe: [
      {
        title: 'Reversing means every arrow turns around',
        text: 'The nodes don\'t move. 1 → 2 becomes 2 → 1, 2 → 3 becomes 3 → 2, and so on; 1 ends up pointing to null and 5 is the new head.',
        sketch: { kind: 'array', rows: [{ label: 'before: 1 → 2 → 3 → 4 → 5', items: [1, 2, 3, 4, 5] }, { label: 'after: 5 → 4 → 3 → 2 → 1', items: [5, 4, 3, 2, 1], marks: { 0: 'hit' }, tags: { 0: [['new head', 'success']] } }] },
      },
      {
        title: 'Flipping an arrow loses the rest of the list',
        text: 'If 1.next is set to null immediately, nothing points to 2 any more and the rest of the list is gone. Save the next node first, then flip.',
        sketch: { kind: 'array', rows: [{ items: [1, 2, 3, 4, 5], marks: { 0: 'cur', 1: 'target' }, tags: { 0: [['cur', 'accent']], 1: [['save it first', 'warn']] } }] },
      },
      {
        title: 'Three pointers walk together',
        text: 'prev is the reversed part, cur the node being flipped, next the rest. Each step: next = cur.next, cur.next = prev, prev = cur, cur = next. When cur is null, prev is the new head.',
        sketch: { kind: 'array', rows: [{ label: 'after flipping 1 and 2', items: [1, 2, 3, 4, 5], bands: [{ from: 0, to: 1, tone: 'success', label: 'reversed' }], tags: { 1: [['prev', 'accent']], 2: [['cur', 'warn']] } }] },
      },
    ],
    brute: { idea: 'Copy the values into an array, then walk the list again writing them back from the end.', cost: 'O(n) time, O(n) space', waste: 'An extra array of every value, and the links, which are the thing to reverse, never change: only values are shuffled.' },
    pattern: {
      pick: 'linked-list-manipulation',
      why: 'In-place reversal: one walk with prev, cur and next, turning each next pointer back towards the previous node. O(n) time, O(1) space. Saving next before the flip is the one rule that matters.',
      not: [
        { id: 'stack-patterns', why: 'Pushing every node and popping them gives the reverse order too, with O(n) space.' },
        { id: 'two-pointers', why: 'Swapping values from both ends needs to walk backwards, which a singly linked list can\'t.' },
      ],
    },
    watch: {
      viz: 'ReverseListViz',
      inputs: [
        { label: '[1, 2, 3, 4, 5]', input: { mode: 'whole', vals: [1, 2, 3, 4, 5] } },
        { label: '[1, 2]', input: { mode: 'whole', vals: [1, 2] } },
      ],
    },
    edges: ['Empty list: [] → [].', 'One node: [1] → [1].', 'Two nodes: [1, 2] → [2, 1].'],
  },

  'merge-two-sorted-lists': {
    aha: 'Both lists are sorted, so the smallest node left is always at one of the two fronts. Behind a dummy head, keep hanging the smaller front node on the tail; when one list runs out, attach the rest of the other in one step.',
    asks: {
      read: 'Which words say you must reuse the nodes, and which case can the dummy take care of?',
      budget: 'The lists are tiny. Why not just collect, sort and rebuild?',
      observe: 'With [1, 2, 4] and [1, 3, 4], where is the smallest remaining value at every moment?',
      brute: 'What does sorting everything again ignore?',
      pattern: 'How do you avoid a special case for the first node of the result?',
      watch: 'Watch the smaller front node join the tail, again and again.',
    },
    read: [
      { phrase: 'sorted in non-decreasing order', says: 'Both lists are already sorted: the smallest remaining value is always at a front.' },
      { phrase: 'splicing together the existing nodes', says: 'No new nodes: relink the ones you have.' },
      { phrase: 'Either list may be empty', says: 'The result\'s first node isn\'t known in advance; a dummy head avoids an "is it empty?" branch.' },
      { phrase: 'Once one list runs out, attach the rest of the other in one step', says: 'The leftover is already sorted and linked: one pointer change, no loop.' },
    ],
    budget: {
      from: 'each list ≤ 50 nodes',
      rows: [['collect, sort, rebuild', 'O((n + m) log(n + m))', 'ok', 'fits, but makes new nodes'], ['merge in one pass', 'O(n + m)', 'ok', 'the goal']],
      aim: 'O(n + m), no new nodes',
      note: 'With 50 nodes anything is fast. The point is to use what is given: two sorted lists and their nodes.',
    },
    observe: [
      {
        title: 'The smallest is always at a front',
        text: 'Both lists are sorted, so nothing behind a front can be smaller than it. The smallest remaining value is 1 vs 1: take either.',
        sketch: { kind: 'array', rows: [{ label: 'list1', items: [1, 2, 4], marks: { 0: 'cur' } }, { label: 'list2', items: [1, 3, 4], marks: { 0: 'cur' } }] },
      },
      {
        title: 'Take the smaller front, then move on in that list',
        text: 'Then 2 vs 1 → take list2\'s 1; 2 vs 3 → 2; 4 vs 3 → 3; 4 vs 4 → either. Each comparison places one node for good.',
        sketch: { kind: 'array', rows: [{ label: 'merged so far', items: [1, 1, 2, 3], marks: { 0: 'hit', 1: 'hit', 2: 'hit', 3: 'hit' } }, { label: 'left: list1 [4], list2 [4]', items: [4, 4], marks: { 0: 'dim', 1: 'dim' } }] },
      },
      {
        title: 'A dummy head saves the "first node" case',
        text: 'Start tail on a dummy node and hang every taken node after tail. The very first node, and an empty input, need no special code; return dummy.next.',
        sketch: { kind: 'array', rows: [{ items: ['dummy', 1, 1, 2, 3, 4, 4], marks: { 0: 'muted' }, tags: { 0: [['return its next', 'accent']] } }] },
      },
    ],
    brute: { idea: 'Collect every value from both lists, sort them, and build a new list.', cost: 'O((n + m) log(n + m))', waste: 'It throws away that both lists are already sorted, and makes new nodes when the existing ones only need relinking.' },
    pattern: {
      pick: 'linked-list-manipulation',
      why: 'Merge behind a dummy head: tail.next = the smaller front node, advance in that list, advance tail. When one list runs out, hang the rest of the other on the tail. O(n + m) time, O(1) extra space.',
      not: [
        { id: 'two-pointers', why: 'The merge is two pointers, one per list; on linked lists the dummy node and relinking are what make it clean.' },
        { id: 'sorting-and-selection', why: 'Sorting again ignores the order both lists already have.' },
        { id: 'heap-patterns', why: 'A heap of the fronts is the tool for k lists; with two lists, one comparison does it.' },
      ],
    },
    watch: {
      viz: 'DummyNodeViz',
      inputs: [
        { label: '[1, 2, 4] and [1, 3, 4]', input: { mode: 'merge', a: [1, 2, 4], b: [1, 3, 4] } },
        { label: '[5] and [1, 2, 3]', input: { mode: 'merge', a: [5], b: [1, 2, 3] } },
      ],
    },
    edges: ['Both empty: [], [] → [].', 'One empty: [], [0] → [0].', 'One list entirely smaller: [1, 2], [5, 6] → [1, 2, 5, 6]; attach the rest in one step.'],
  },

  'remove-linked-list-elements': {
    aha: 'Removing a node means changing the node before it, and the head has no node before it. Put a dummy in front: then every node, the head included, is removed the same way, by cur.next = cur.next.next.',
    asks: {
      read: 'Which words warn you about the head?',
      budget: 'One pass is easy. Where is the trap?',
      observe: 'To remove the 6 after 2 in [1, 2, 6, 3], which node\'s pointer changes? What if the 6 is the head?',
      brute: 'Building a new list of kept values works. What does it waste?',
      pattern: 'What gives the head a node before it?',
      watch: 'Watch cur look one node ahead, unlink matches, and stay put after an unlink.',
    },
    read: [
      { phrase: 'Remove every node whose value equals `val`', says: 'Every match, not just the first: possibly several in a row.' },
      { phrase: 'The head itself may need to be removed, possibly several times in a row', says: 'The head can change, more than once. Code that only handles "the node after cur" misses these.' },
      { phrase: 'A dummy node in front of the head', says: 'The fix, spelled out: give the head a node before it, so it is removed like any other node.' },
    ],
    budget: { from: 'number of nodes ≤ 10⁴', n: 1e4, aim: 'O(n), one pass, O(1) space', note: 'One pass is easy; the difficulty is the head, not the time.' },
    observe: [
      {
        title: 'Removing a node changes the node before it',
        text: 'To remove the 6 after 2, set 2.next to 3. You have to be standing on the node before the one being removed.',
        sketch: { kind: 'array', rows: [{ items: [1, 2, 6, 3, 4, 5, 6], marks: { 1: 'cur', 2: 'bad' }, tags: { 1: [['cur', 'accent']], 2: [['skip it', 'danger']] } }] },
      },
      {
        title: 'The head has no node before it',
        text: 'In [6, 6, 1] with val = 6, the first two nodes go, and neither has a node before it. Without help, the head needs a loop of its own.',
        sketch: { kind: 'array', rows: [{ items: [6, 6, 1], marks: { 0: 'bad', 1: 'bad' } }] },
      },
      {
        title: 'A dummy gives every node a "before"',
        text: 'Stand on a dummy before the head. If cur.next matches, unlink it and stay (the new cur.next may match too); otherwise step forward. Return dummy.next.',
        sketch: { kind: 'array', rows: [{ items: ['dummy', 6, 6, 1], marks: { 0: 'muted', 1: 'bad', 2: 'bad' }, tags: { 0: [['cur', 'accent']] } }] },
      },
    ],
    brute: { idea: 'Walk the list and copy every value that isn\'t val into a brand-new list.', cost: 'O(n) time, O(n) new nodes', waste: 'A new node for every kept value, when each removal is just one link change on the existing nodes.' },
    pattern: {
      pick: 'linked-list-manipulation',
      why: 'Dummy head and unlink in place: cur starts at the dummy; if cur.next has the value, cur.next = cur.next.next and cur stays; otherwise cur = cur.next. The head is just another node. O(n) time, O(1) space.',
      not: [
        { id: 'two-pointers', why: 'On an array, removing needs a separate write pointer; on a list, skipping a node is one link change.' },
        { id: 'fast-slow-pointers', why: 'Nothing needs two speeds: one pointer standing before the candidate is enough.' },
      ],
    },
    watch: {
      viz: 'DummyNodeViz',
      inputs: [
        { label: '[1, 2, 6, 3, 4, 5, 6], val = 6', input: { mode: 'remove', vals: [1, 2, 6, 3, 4, 5, 6], val: 6 } },
        { label: '[7, 7, 7, 7], val = 7', input: { mode: 'remove', vals: [7, 7, 7, 7], val: 7 } },
      ],
    },
    edges: ['Everything removed: [7, 7, 7, 7], 7 → [].', 'Empty list: [], 1 → [].', 'Nothing matches: [1, 2], 3 → [1, 2].', 'Matches in a row: [1, 6, 6, 2], 6 → [1, 2].'],
  },

  'add-two-numbers': {
    aha: 'The lists hold the ones digit first, which is exactly the order you add in by hand. Walk both lists together: add the two digits and the carry, append the last digit of the sum, and carry the rest, until both lists and the carry are used up.',
    asks: {
      read: 'Which words tell you the digit order, and why is that order lucky?',
      budget: 'Up to 100 digits. Can you turn the lists into numbers and add them?',
      observe: 'Add 342 + 465 column by column, as on paper. In which order do you meet the digits?',
      brute: 'If you copy the digits into arrays first, what have you gained?',
      pattern: 'What three things decide each new digit, and when does the loop stop?',
      watch: 'Watch each column add up, with the carry passed along.',
    },
    read: [
      { phrase: 'in reverse order: the first node holds the ones digit', says: 'Ones first is the order schoolbook addition works in: the carry flows the same way as the walk.' },
      { phrase: 'Return the sum of the two numbers as a linked list in the same reverse order', says: 'Build the answer in the order you compute it: no reversing at the end.' },
    ],
    budget: {
      from: 'each list ≤ 100 digits',
      rows: [['convert to long', '100 digits, a long holds 19', 'bad', 'overflows'], ['add digit by digit', 'O(max(n, m))', 'ok', 'fits']],
      aim: 'O(max(n, m))',
      note: 'Speed is no issue. The numbers are far too big for any built-in integer, so they have to be added digit by digit.',
    },
    observe: [
      {
        title: 'Ones first is the order you add in',
        text: 'On paper you add the ones column first, then the tens, carrying as you go. The lists hand you the digits in exactly that order: 2 + 5, then 4 + 6, then 3 + 4.',
        sketch: { kind: 'array', rows: [{ label: 'l1 = 342', items: [2, 4, 3], marks: { 0: 'cur' } }, { label: 'l2 = 465', items: [5, 6, 4], marks: { 0: 'cur' } }] },
      },
      {
        title: 'A column can overflow: carry 1',
        text: '2 + 5 = 7. Then 4 + 6 = 10: write 0 and carry 1 into the next column, where 3 + 4 + 1 = 8. The sum 807 comes out ones first: [7, 0, 8].',
        sketch: { kind: 'array', rows: [{ label: 'sum', items: [7, 0, 8], marks: { 2: 'hit' }, tags: { 1: [['carry 1 →', 'warn']] } }] },
      },
      {
        title: 'Uneven lengths, and a carry left over',
        text: 'For 99 + 1: 9 + 1 = 10, write 0, carry 1. l2 has run out, so its digit counts as 0: 9 + 0 + 1 = 10 again. Both lists are done but a carry remains, so it becomes one more digit: [0, 0, 1], which is 100.',
        sketch: { kind: 'array', rows: [{ label: 'l1 = 99', items: [9, 9] }, { label: 'l2 = 1', items: [1] }, { label: 'sum = 100', items: [0, 0, 1], marks: { 2: 'hit' } }] },
      },
    ],
    brute: { idea: 'Copy the digits into arrays, add them with carries there, then build a list from the result.', cost: 'O(n + m) time, O(n + m) extra', waste: 'The arrays hold the digits in the same order the lists already give them. Walking the lists does the same addition with no copies.' },
    pattern: {
      pick: 'linked-list-manipulation',
      why: 'Walk both lists together, add digit + digit + carry, append s mod 10 behind a dummy head and carry s / 10. Keep going while either list or the carry is left. O(max(n, m)) time.',
      not: [
        { id: 'math-for-interviews', why: 'It is schoolbook addition, but the numbers are too long to convert; the work is in walking the lists.' },
        { id: 'two-pointers', why: 'There is one pointer per list, but they move in step, not towards each other.' },
        { id: 'stack-patterns', why: 'Stacks are for the follow-up with the most significant digit first; here the order is already right.' },
      ],
    },
    watch: {
      viz: 'ListOpsViz',
      inputs: [
        { label: '342 + 465', input: { mode: 'add', a: [2, 4, 3], b: [5, 6, 4] } },
        { label: '99 + 1', input: { mode: 'add', a: [9, 9], b: [1] } },
      ],
    },
    edges: ['A final carry: [5], [5] → [0, 1].', 'Different lengths: [9, 9, 9], [1] → [0, 0, 0, 1].', 'Zeros: [0], [0] → [0].'],
  },

  'reverse-linked-list-ii': {
    aha: 'Stand on the node just before position left. The node at left will end up last in the reversed part, so keep it as cur and, right − left times, move the node after cur to the front of the part. A dummy before the head handles left = 1.',
    asks: {
      read: 'Which words ask for one pass, and which case does the dummy handle?',
      budget: 'Only 500 nodes. What is the real constraint?',
      observe: 'In [1, 2, 3, 4, 5] with left = 2, right = 4, which node starts the part and which ends it after reversing?',
      brute: 'How would you do it with an array of values?',
      pattern: 'If the first node of the part ends up last, what can you do with each node after it?',
      watch: 'Watch nodes move one by one to the front of the part.',
    },
    read: [
      { phrase: 'from position `left` to position `right`', says: 'Only a slice reverses; the node before it and the node after it must be reconnected.' },
      { phrase: 'Try to do it in one pass', says: 'No counting first, no array: relink as you go.' },
      { phrase: 'A dummy node before the head handles `left = 1`', says: 'With left = 1 the head moves; a dummy gives it a node before it.' },
    ],
    budget: {
      from: 'number of nodes ≤ 500',
      rows: [['copy values, reverse the slice', 'O(n), O(n) space', 'ok', 'fits'], ['one pass, relinking', 'O(n), O(1) space', 'ok', 'the goal']],
      aim: 'one pass, O(1) space',
      note: 'The input is tiny; the challenge is one pass and changing links, not speed.',
    },
    observe: [
      {
        title: 'Only the middle part changes',
        text: '1 and 5 keep their places; 2, 3, 4 become 4, 3, 2. The node before the part (1) and the node after it (5) must be connected to the reversed part.',
        sketch: { kind: 'array', rows: [{ items: [1, 2, 3, 4, 5], bands: [{ from: 1, to: 3, tone: 'accent', label: 'reverse' }] }] },
      },
      {
        title: 'The first node of the part ends up last',
        text: '2 starts the part and finishes it. So stand on 1, keep cur on 2, and move the node after cur to the front of the part: first 3 ([1, 3, 2, 4, 5]), then 4 ([1, 4, 3, 2, 5]).',
        sketch: { kind: 'array', rows: [{ label: 'move 3 to the front', items: [1, 3, 2, 4, 5], marks: { 1: 'kept' } }, { label: 'move 4 to the front', items: [1, 4, 3, 2, 5], marks: { 1: 'kept' } }] },
      },
      {
        title: 'left = 1 needs a node before the head',
        text: 'With left = 1 the head itself moves, and nothing points to it. A dummy in front gives it a "before", so the same moves work.',
        sketch: { kind: 'array', rows: [{ items: ['dummy', 1, 2, 3], marks: { 0: 'muted' }, tags: { 0: [['before', 'accent']] } }] },
      },
    ],
    brute: { idea: 'Copy the values into an array, reverse positions left … right there, and write them back.', cost: 'O(n) time, O(n) space', waste: 'Two passes and an array, only to move values around instead of changing a few links.' },
    pattern: {
      pick: 'linked-list-manipulation',
      why: 'Sub-list reversal in one pass: walk to the node before position left, then right − left times move the node after cur to the front of the part. A dummy handles left = 1. O(n) time, O(1) space.',
      not: [
        { id: 'two-pointers', why: 'Swapping values from both ends of the part needs walking backwards, which a singly linked list can\'t.' },
        { id: 'stack-patterns', why: 'Pushing the part\'s nodes and popping them reverses it too, with extra space.' },
      ],
    },
    watch: {
      viz: 'ReverseListViz',
      inputs: [
        { label: '[1, 2, 3, 4, 5], left 2, right 4', input: { mode: 'between', vals: [1, 2, 3, 4, 5], left: 2, right: 4 } },
        { label: '[3, 5], left 1, right 2', input: { mode: 'between', vals: [3, 5], left: 1, right: 2 } },
      ],
    },
    edges: ['left = right: [1, 2, 3], 2, 2 → [1, 2, 3].', 'From the head: [3, 5], 1, 2 → [5, 3].', 'The whole list: [1, 2, 3], 1, 3 → [3, 2, 1].'],
  },

  'swap-nodes-in-pairs': {
    aha: 'Swapping a pair changes three links: the node before the pair now points to the second node, the second points to the first, and the first points to whatever came after the pair. A dummy is the "node before" the first pair; after each swap, the old first node is the "node before" the next one.',
    asks: {
      read: 'Which words rule out the easy shortcut?',
      budget: 'Only 100 nodes. What makes this hard, if not speed?',
      observe: 'To swap 1 and 2 in [1, 2, 3, 4], which three arrows change?',
      brute: 'Recursion swaps the first pair and recurses. What does it cost that a loop doesn\'t?',
      pattern: 'After a pair is swapped, which node stands just before the next pair?',
      watch: 'Watch each pair: look, rewire three links, move on.',
    },
    read: [
      { phrase: 'Swap every two adjacent nodes', says: 'Pairs (1, 2), (3, 4), …: fixed groups of two, not a sliding pair.' },
      { phrase: 'If the length is odd, the last node stays where it is', says: 'Stop when fewer than two nodes are left.' },
      { phrase: 'Change the links between nodes; do not just swap their values', says: 'Swapping values is ruled out: the arrows have to change.' },
    ],
    budget: { from: 'number of nodes ≤ 100', rows: [['one pass', 'O(n)', 'ok', 'fits']], aim: 'O(n), O(1) space', note: 'Tiny input: the difficulty is changing three links in the right order.' },
    observe: [
      {
        title: 'A swap changes three links',
        text: 'To swap 1 and 2: the node before the pair must point to 2, 2 must point to 1, and 1 must point to what came after 2, which is 3.',
        sketch: { kind: 'array', rows: [{ label: 'before', items: ['dummy', 1, 2, 3, 4], marks: { 0: 'muted', 1: 'cur', 2: 'cur' } }, { label: 'after', items: ['dummy', 2, 1, 3, 4], marks: { 0: 'muted', 1: 'hit', 2: 'hit' } }] },
      },
      {
        title: 'The order of the changes matters',
        text: 'Set 1.next = 2.next (that is, 3) before setting 2.next = 1. The other way round, the only link to 3 is overwritten and the rest of the list is lost.',
        sketch: { kind: 'array', rows: [{ items: [1, 2, 3, 4], tags: { 0: [['a', 'accent']], 1: [['b', 'warn']], 2: [['b.next: save first', 'danger']] } }] },
      },
      {
        title: 'The old first node is the next "before"',
        text: 'After swapping, 1 is second in its pair, so it stands right before the next pair (3, 4). A dummy plays that role for the very first pair.',
        sketch: { kind: 'array', rows: [{ items: ['dummy', 2, 1, 3, 4], marks: { 0: 'muted' }, tags: { 2: [['prev', 'accent']] }, bands: [{ from: 3, to: 4, tone: 'accent', label: 'next pair' }] }] },
      },
    ],
    brute: { idea: 'Recursion: swap the first two nodes and let the recursive call handle the rest.', cost: 'O(n) time, O(n) call stack', waste: 'A call frame for every pair, when a loop does the same three link changes with O(1) memory.' },
    pattern: {
      pick: 'linked-list-manipulation',
      why: 'Pointer rewiring behind a dummy: prev before the pair, a = prev.next, b = a.next; prev.next = b, a.next = b.next, b.next = a; then prev = a. O(n) time, O(1) space.',
      not: [
        { id: 'two-pointers', why: 'There are two pointers, a and b, but they don\'t scan for anything; they are the pair being rewired.' },
        { id: 'fast-slow-pointers', why: 'Stepping two at a time sounds like the hare, but nothing is being found here.' },
      ],
    },
    watch: {
      viz: 'ListOpsViz',
      inputs: [
        { label: '[1, 2, 3, 4]', input: { mode: 'swap', vals: [1, 2, 3, 4] } },
        { label: '[1, 2, 3]', input: { mode: 'swap', vals: [1, 2, 3] } },
      ],
    },
    edges: ['Empty: [] → [].', 'One node: [1] → [1].', 'Odd length: [1, 2, 3] → [2, 1, 3].'],
  },

  'partition-list': {
    aha: 'Grow two lists while walking once: one for values below x, one for the rest. Appending at each list\'s tail keeps the original order inside both groups. Then link the end of the first list to the start of the second.',
    asks: {
      read: 'Which words rule out swapping nodes around freely?',
      budget: 'Only 200 nodes. What is the real requirement?',
      observe: 'In [1, 4, 3, 2, 5, 2] with x = 3, list the values below 3 and the rest, each in their original order.',
      brute: 'You could put the nodes into two arrays. What do the arrays really remember?',
      pattern: 'How do you build two lists at once without "is it empty?" checks?',
      watch: 'Watch each node join one of two lists, then the join.',
    },
    read: [
      { phrase: 'every node with a value less than `x` comes before every node with a value greater than or equal to `x`', says: 'Two groups by one comparison: below x, and the rest (x itself goes in the second group).' },
      { phrase: 'Keep the original relative order of the nodes within each of the two groups', says: 'A stable split: swapping nodes into place (as quicksort does) would break the order.' },
    ],
    budget: { from: 'number of nodes ≤ 200', rows: [['one pass', 'O(n)', 'ok', 'fits']], aim: 'O(n), O(1) space', note: 'Tiny: the point is relinking in one pass while keeping both orders.' },
    observe: [
      {
        title: 'Two groups, each in its original order',
        text: 'Values below 3: 1, 2, 2, in that order. The rest: 4, 3, 5, in that order. The answer is the first group followed by the second: [1, 2, 2, 4, 3, 5].',
        sketch: { kind: 'array', rows: [{ items: [1, 4, 3, 2, 5, 2], marks: { 0: 'kept', 3: 'kept', 5: 'kept' } }], caption: 'shaded: less than 3' },
      },
      {
        title: 'Build two lists while walking',
        text: 'Walk once, and hang each node at the tail of the "less" list or the "≥ x" list. Adding at the tail keeps each group in the order the nodes arrived.',
        sketch: { kind: 'array', rows: [{ label: '< 3', items: [1, 2, 2] }, { label: '≥ 3', items: [4, 3, 5] }] },
      },
      {
        title: 'Join them',
        text: 'Point the tail of the "less" list at the first node of the other list, and make sure the second list ends in null. Dummy heads mean neither list needs an empty check.',
        sketch: { kind: 'array', rows: [{ items: [1, 2, 2, 4, 3, 5], bands: [{ from: 0, to: 2, tone: 'accent', label: '< 3' }, { from: 3, to: 5, tone: 'ghost', label: '≥ 3' }] }] },
      },
    ],
    brute: { idea: 'Put the nodes with values below x in one array and the rest in another, each in their original order, then relink them in that order.', cost: 'O(n) time, O(n) space', waste: 'The arrays only remember an order that two growing lists remember for free.' },
    pattern: {
      pick: 'linked-list-manipulation',
      why: 'Two dummy-headed lists, one per group: append each node to the tail of its list as you walk, then link the first list\'s tail to the second list\'s first node. One pass, O(1) extra space, both orders kept.',
      not: [
        { id: 'two-pointers', why: 'Array partitioning by swapping, as in quicksort, doesn\'t keep the order inside each group.' },
        { id: 'sorting-and-selection', why: 'Sorting by value would reorder within the groups; only "below x or not" matters.' },
      ],
    },
    watch: {
      viz: 'ListOpsViz',
      inputs: [
        { label: '[1, 4, 3, 2, 5, 2], x = 3', input: { mode: 'partition', vals: [1, 4, 3, 2, 5, 2], x: 3 } },
        { label: '[2, 1], x = 2', input: { mode: 'partition', vals: [2, 1], x: 2 } },
      ],
    },
    edges: ['All below x: [1, 2], 5 → [1, 2].', 'None below x: [5, 6], 1 → [5, 6].', 'x itself goes second: [3, 1], 3 → [1, 3].'],
  },

  'rotate-list': {
    aha: 'Rotating by the length changes nothing, so only k mod n matters. Rotating right by k moves the last k nodes to the front: link the tail to the head to make a ring, then cut the ring just before the new head.',
    asks: {
      read: 'Which words warn you about k, and which words hand you the method?',
      budget: 'k can be 2 × 10⁹. What must happen to k before anything else?',
      observe: 'Rotate [1, 2, 3, 4, 5] by 2. Which nodes end up at the front, and which node is the new tail?',
      brute: 'One rotation moves the tail to the front. How much does doing that k times cost?',
      pattern: 'If the list were a circle, how many links would you change to rotate it?',
      watch: 'Watch the length measured, the ring closed, and the ring cut.',
    },
    read: [
      { phrase: 'each step moves the last node to the front', says: 'After k steps the last k nodes are at the front, in their order.' },
      { phrase: '`k` can be much larger than the length of the list', says: 'Never loop k times: reduce it first.' },
      { phrase: 'Join the tail to the head, then cut at the new end', says: 'The method: a ring has no end, so cutting it anywhere gives a rotation.' },
    ],
    budget: {
      from: 'k ≤ 2 × 10⁹, at most 500 nodes',
      rows: [['k single rotations', '2 × 10⁹ × 500', 'bad', 'too slow'], ['k mod n rotations', '≤ 500 × 500', 'ok', 'fits'], ['ring and cut', '≤ 2 × 500', 'ok', 'best']],
      aim: 'O(n)',
      note: 'k itself is the danger: reduce it mod the length before doing anything.',
    },
    observe: [
      {
        title: 'Rotating by the length changes nothing',
        text: 'Five rotations of a 5-node list bring every node back to where it started. So only k mod 5 matters: k = 2, k = 7 and k = 2 000 000 002 all give the same list.',
        sketch: { kind: 'array', rows: [{ items: [1, 2, 3, 4, 5] }], caption: 'k = 5: back to the start' },
      },
      {
        title: 'k rotations move the last k nodes to the front',
        text: 'With k = 2, the last two nodes, 4 and 5, move to the front in their order: [4, 5, 1, 2, 3]. The new head is at index n − k = 3, and the new tail, 3, sits just before it.',
        sketch: { kind: 'array', rows: [{ items: [1, 2, 3, 4, 5], bands: [{ from: 3, to: 4, tone: 'accent', label: 'to the front' }], tags: { 2: [['new tail', 'warn']], 3: [['new head', 'success']] } }] },
      },
      {
        title: 'Make a ring, then cut it',
        text: 'Link the tail 5 back to the head 1: now the list is a circle with no end. Cut it after 3, and the circle reads 4 → 5 → 1 → 2 → 3.',
        sketch: { kind: 'array', rows: [{ items: [4, 5, 1, 2, 3], marks: { 0: 'hit' }, tags: { 0: [['new head', 'success']] } }] },
      },
    ],
    brute: { idea: 'Move the last node to the front, k mod n times.', cost: 'O(n²)', waste: 'Each single rotation walks the whole list to find the tail, though one walk can find where to cut.' },
    pattern: {
      pick: 'linked-list-manipulation',
      why: 'Close the ring and cut: one walk finds the length and the tail; link tail → head; walk n − (k mod n) − 1 steps to the new tail; the node after it is the new head; set newTail.next = null. O(n) time, O(1) space.',
      not: [
        { id: 'two-pointers', why: 'Rotating an array uses three reversals, which needs walking backwards; on a list a ring is simpler.' },
        { id: 'fast-slow-pointers', why: 'A lead pointer k steps ahead also finds the cut, but k still has to be reduced mod the length first.' },
      ],
    },
    watch: {
      viz: 'ListOpsViz',
      inputs: [
        { label: '[1, 2, 3, 4, 5], k = 2', input: { mode: 'rotate', vals: [1, 2, 3, 4, 5], k: 2 } },
        { label: '[0, 1, 2], k = 4', input: { mode: 'rotate', vals: [0, 1, 2], k: 4 } },
      ],
    },
    edges: ['k a multiple of the length: [1, 2, 3], 3 → [1, 2, 3].', 'Huge k: [0, 1, 2], 2000000000 → [1, 2, 0].', 'One node: [1], 99 → [1].', 'Empty: [], 1 → [].'],
  },

  'insert-greatest-common-divisors-in-linked-list': {
    aha: 'Walk the list; between each node and the next, link in a new node holding their GCD (new node first points to the next one, then the current one points to it). Then jump over the new node, so it is never paired up itself.',
    asks: {
      read: 'Which words say which pairs get a new node?',
      budget: 'Values are at most 1000. Does it matter how you compute a GCD?',
      observe: 'Insert gcd(18, 6) between 18 and 6. After that, which node should the walk move to?',
      brute: 'How would you find a GCD by trying divisors, and how many tries can that take?',
      pattern: 'What order of the two link changes keeps the rest of the list safe?',
      watch: 'Watch each GCD linked in, then skipped.',
    },
    read: [
      { phrase: 'For every pair of adjacent nodes in the list', says: 'Pairs of original neighbours only; the new nodes don\'t form pairs of their own.' },
      { phrase: 'insert a new node between them', says: 'An insertion in the middle of a list: two links change, and their order matters.' },
      { phrase: 'The GCD of two numbers is the largest positive integer that divides both', says: 'Euclid\'s algorithm computes it in O(log V) steps.' },
    ],
    budget: {
      from: 'nodes ≤ 5000, values ≤ 1000',
      rows: [['GCD by trying divisors', '5000 × 1000', 'ok', 'fits'], ['Euclid\'s algorithm', '5000 × ~10', 'ok', 'easily fits']],
      aim: 'O(n log V)',
      note: 'Both fit here; Euclid is the standard way to compute a GCD and costs about log V steps.',
    },
    observe: [
      {
        title: 'Insert without losing the rest',
        text: 'Between 18 and 6 goes gcd(18, 6) = 6. Make the new node point to the old 6 first, then point 18 at the new node. The other order would leave nothing pointing to the old 6.',
        sketch: { kind: 'array', rows: [{ items: [18, 6, 6, 10, 3], marks: { 1: 'kept' }, tags: { 1: [['new', 'accent']] } }] },
      },
      {
        title: 'Skip the node you just inserted',
        text: 'After inserting, move to the next original node (the old 6), not to the new one. Otherwise the next GCD would pair the new 6 with the old 6, which aren\'t neighbours in the input.',
        sketch: { kind: 'array', rows: [{ items: [18, 6, 6, 10, 3], marks: { 1: 'dim', 2: 'cur' }, tags: { 2: [['cur', 'accent']] } }] },
      },
      {
        title: 'Euclid finds each GCD quickly',
        text: 'gcd(a, b) = gcd(b, a mod b), until b is 0: gcd(6, 10) → gcd(10, 6) → gcd(6, 4) → gcd(4, 2) → gcd(2, 0) = 2.',
        sketch: { kind: 'array', rows: [{ items: ['(6, 10)', '(10, 6)', '(6, 4)', '(4, 2)', '(2, 0)'], marks: { 4: 'hit' } }], caption: 'gcd(6, 10) = 2' },
      },
    ],
    brute: { idea: 'Walk the list and insert a node between each pair, finding each GCD by testing candidates from the smaller value downwards.', cost: 'O(n · V)', waste: 'Up to 1000 trial divisions per pair, where Euclid needs about 10 steps.' },
    pattern: {
      pick: 'linked-list-manipulation',
      why: 'Insert after the current node, then skip: g = new node(gcd(cur, cur.next)) pointing to cur.next; cur.next = g; cur = g.next. Each GCD by Euclid. O(n log V) time.',
      not: [
        { id: 'math-for-interviews', why: 'Euclid\'s algorithm comes from there, but the list work (insert without losing the rest, then skip) is the actual question.' },
        { id: 'two-pointers', why: 'Only one pointer is needed: the pair is always cur and cur.next.' },
      ],
    },
    watch: {
      viz: 'ListOpsViz',
      inputs: [
        { label: '[18, 6, 10, 3]', input: { mode: 'gcd', vals: [18, 6, 10, 3] } },
        { label: '[12, 8, 4]', input: { mode: 'gcd', vals: [12, 8, 4] } },
      ],
    },
    edges: ['One node: [7] → [7].', 'Neighbours with no common factor: [3, 4] → [3, 1, 4].', 'Equal neighbours: [5, 5] → [5, 5, 5].'],
  },

  'copy-list-with-random-pointer': {
    aha: 'The hard part is finding "the copy of random". Put each copy right after its original (A → A′ → B → B′ …): then the copy of any node X is simply X.next, so copy.random = original.random.next. Finally unzip the two lists.',
    asks: {
      read: 'Which words make this harder than copying a plain list?',
      budget: 'Only 1000 nodes. What is the real question, then?',
      observe: '11.random points to 1. When you are copying 11, how do you find the copy of 1?',
      brute: 'If you translate each random pointer into a position and back, how much walking does it take?',
      pattern: 'Where could each copy live so that it can be found from its original without a map?',
      watch: 'Watch the copies interleaved, their randoms set, and the lists unzipped.',
    },
    read: [
      { phrase: 'a `random` pointer, which points to any node of the list or is `null`', says: 'random can point forwards, backwards, to itself, or nowhere, including to nodes not copied yet.' },
      { phrase: '`n` brand-new nodes with the same values', says: 'A deep copy: one new node per old node.' },
      { phrase: 'No pointer of the copy may point into the original list', says: 'Every copied random must point to the copy of its target, not the target itself.' },
    ],
    budget: {
      from: 'at most 1000 nodes',
      rows: [['find each random by walking', '1000 × 1000', 'ok', 'fits'], ['map old → new', 'O(n), O(n) space', 'ok', 'fits'], ['interleave the copies', 'O(n), O(1) extra', 'ok', 'the follow-up']],
      aim: 'O(n)',
      note: 'Even O(n²) passes at this size. The interview question is how to find "the copy of random" quickly, and then without a map.',
    },
    observe: [
      {
        title: 'next is easy, random is the problem',
        text: 'Copying along next is a simple walk. But 11.random points to 1, which may not be copied yet, and even when it is, you need a way to get from 1 to its copy.',
        sketch: { kind: 'array', rows: [{ items: [7, 13, 11, 10, 1], marks: { 2: 'cur', 4: 'target' }, tags: { 2: [['random → 1', 'accent']] } }] },
      },
      {
        title: 'A map from each node to its copy',
        text: 'First pass: make every copy and store old → new in a hash map. Second pass: copy.next = map[old.next] and copy.random = map[old.random]. O(n) time, but O(n) space for the map.',
        sketch: { kind: 'array', rows: [{ label: 'original', items: [7, 13, 11, 10, 1] }, { label: 'copies', items: ['7′', '13′', '11′', '10′', '1′'], marks: { 0: 'kept', 1: 'kept', 2: 'kept', 3: 'kept', 4: 'kept' } }] },
      },
      {
        title: 'Let the list itself be the map',
        text: 'Put each copy right after its original: 7 → 7′ → 13 → 13′ → …. Now the copy of any node X is X.next, so 11′.random = 11.random.next = 1′. No map needed; afterwards, unzip the two lists.',
        sketch: { kind: 'array', rows: [{ items: [7, '7′', 13, '13′', 11, '11′'], marks: { 1: 'kept', 3: 'kept', 5: 'kept' } }], caption: 'every copy sits right after its original' },
      },
    ],
    brute: { idea: 'Copy the values and next links; for each random, find its position by walking the original from the head, then walk the copy the same number of steps.', cost: 'O(n²)', waste: 'Every random pointer costs two walks, just to translate a node into its position and back.' },
    pattern: {
      pick: 'linked-list-manipulation',
      why: 'Interleave, then unzip: put each copy right after its original, set copy.random = original.random.next, then split the two lists by relinking. O(n) time, O(1) extra space. A HashMap old → new is the simpler O(n)-space version.',
      not: [
        { id: 'hashing', why: 'A map old → new is the common answer and fine in an interview; interleaving removes the map.' },
        { id: 'graph-traversal', why: 'Deep-copying a general graph needs DFS or BFS plus a map; a list with one extra pointer per node has a simpler shape.' },
      ],
    },
    watch: {
      viz: 'ListOpsViz',
      inputs: [
        { label: '[[7,null],[13,0],[11,4],[10,2],[1,0]]', input: { mode: 'copy', list: [[7, null], [13, 0], [11, 4], [10, 2], [1, 0]] } },
        { label: '[[1,1],[2,1]]', input: { mode: 'copy', list: [[1, 1], [2, 1]] } },
      ],
    },
    edges: ['Empty: [] → [].', 'A node pointing to itself: [[1,0]] → [[1,0]].', 'All randoms null: [[1,null],[2,null]] → [[1,null],[2,null]].'],
  },

  'reverse-nodes-in-k-group': {
    aha: 'Each group of k is a sub-list reversal. Keep gp, the node just before the group: check that k nodes follow it, reverse them by moving each node after the group\'s first node to the front, and then the old first node (now last) becomes the next gp.',
    asks: {
      read: 'Which words say what happens to a short group, and what memory you may use?',
      budget: 'Time is easy. Why is O(1) memory a real restriction here?',
      observe: 'Split [1, 2, 3, 4, 5] into groups of 2. Which groups reverse, and which node stands before each group?',
      brute: 'How would you do it with an array of values, and what rule does that break?',
      pattern: 'Which earlier problem reverses one stretch of a list in place?',
      watch: 'Watch each group checked, reversed one move at a time, and handed over to the next.',
    },
    read: [
      { phrase: 'Reverse the nodes of the list `k` at a time', says: 'Fixed groups of k: each is a sub-list reversal, done one after another.' },
      { phrase: 'If the number of nodes left at the end is less than `k`, those nodes keep their order', says: 'Count k nodes ahead before reversing; a short tail is left alone.' },
      { phrase: 'use only O(1) extra memory', says: 'No arrays, and no recursion over the groups (its call stack grows with n / k).' },
    ],
    budget: { from: 'number of nodes ≤ 5000', n: 5000, aim: 'O(n) time, O(1) space', note: 'Speed is easy; O(1) memory rules out copying and recursion.' },
    observe: [
      {
        title: 'Groups of k; a short group at the end stays',
        text: '[1, 2] [3, 4] [5]: the first two groups are reversed; the last has one node, fewer than k, and keeps its order. So check that k nodes are there before reversing.',
        sketch: { kind: 'array', rows: [{ items: [1, 2, 3, 4, 5], bands: [{ from: 0, to: 1, tone: 'accent' }, { from: 2, to: 3, tone: 'accent' }, { from: 4, to: 4, tone: 'ghost', label: 'short' }] }] },
      },
      {
        title: 'Each group is a sub-list reversal',
        text: 'Reversing [3, 4] is Reverse Linked List II on that stretch: stand on the node before the group (gp, here 1) and move each node after the group\'s first node to the front.',
        sketch: { kind: 'array', rows: [{ label: 'after the first group', items: [2, 1, 3, 4, 5], tags: { 1: [['gp', 'accent']], 2: [['first of group', 'warn']] } }] },
      },
      {
        title: 'The group\'s old first node is the next gp',
        text: 'After reversing, 3 (the group\'s old first node) is last in its group, so it stands right before the next group. Repeat until fewer than k nodes follow gp.',
        sketch: { kind: 'array', rows: [{ items: [2, 1, 4, 3, 5], tags: { 3: [['next gp', 'accent']] } }] },
      },
    ],
    brute: { idea: 'Copy the values into an array, reverse each full block of k there, and write them back.', cost: 'O(n) time, O(n) space', waste: 'It moves values, which the statement forbids, and uses an array where k − 1 link moves per group would do.' },
    pattern: {
      pick: 'linked-list-manipulation',
      why: 'Group by group behind a dummy: gp is the node before the group; check that k nodes follow; reverse them by moving each node after the first to the front (k − 1 moves); the old first node becomes the next gp. O(n) time, O(1) space.',
      not: [
        { id: 'stack-patterns', why: 'Pushing k nodes and popping them reverses a group, with O(k) extra space.' },
        { id: 'two-pointers', why: 'Swapping values inside each group from both ends needs walking backwards, and changes values.' },
      ],
    },
    watch: {
      viz: 'ListOpsViz',
      inputs: [
        { label: '[1, 2, 3, 4, 5], k = 2', input: { mode: 'kgroup', vals: [1, 2, 3, 4, 5], k: 2 } },
        { label: '[1, 2, 3, 4, 5], k = 3', input: { mode: 'kgroup', vals: [1, 2, 3, 4, 5], k: 3 } },
      ],
    },
    edges: ['k = 1: [1, 2, 3], 1 → [1, 2, 3].', 'k equal to the length: [1, 2, 3], 3 → [3, 2, 1].', 'A leftover tail: [1, 2, 3, 4, 5], 3 → [3, 2, 1, 4, 5].'],
  },
};
