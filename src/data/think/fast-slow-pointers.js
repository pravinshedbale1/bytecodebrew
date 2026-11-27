/** Practice thinking walkthroughs: fast-slow-pointers (format: src/data/think/index.js). */

export default {
  'middle-of-the-linked-list': {
    free: true,
    aha: 'Send two pointers from the head, one moving two nodes for every one the other moves. When the fast one can\'t go on, the slow one has gone exactly half as far: it is on the middle.',
    asks: {
      read: 'Which words decide between the two middles of an even-length list?',
      budget: 'Only 100 nodes. If speed is no issue, what is the interview really testing?',
      observe: 'If one pointer moves 2 nodes each time another moves 1, where is the slow one when the fast one reaches the end of [1, 2, 3, 4, 5]?',
      brute: 'How would you find the middle if you knew the length? What does learning the length cost?',
      pattern: 'Two walkers at different speeds: what does the ratio of their distances tell you?',
      watch: 'Watch slow and fast on an odd and an even length.',
    },
    read: [
      {
        phrase: 'Return the middle node of the list',
        says: 'A singly linked list doesn\'t know its length, so "the middle" can\'t be reached by index.',
      },
      {
        phrase: 'If there are two middle nodes (an even length), return the second of them',
        says: 'Decide up front which middle the loop stops on: here the second one.',
      },
    ],
    budget: {
      from: 'number of nodes ≤ 100',
      rows: [
        ['copy into an array', 'n extra cells', 'ok', 'fits'],
        ['count, then walk n / 2', '2 passes', 'ok', 'fits'],
        ['slow and fast pointers', '1 pass, O(1) space', 'ok', 'the goal'],
      ],
      aim: 'O(n), one pass, O(1) space',
      note: 'With 100 nodes anything is fast. The question is whether you can do it in one pass with no extra memory.',
    },
    observe: [
      {
        title: 'Counting first takes two passes',
        text: 'To walk to node n / 2 you need n, and the list doesn\'t store it: one pass to count, then a second pass to walk half way.',
        sketch: {
          kind: 'array',
          rows: [
            { label: 'pass 1: count → 5', items: [1, 2, 3, 4, 5] },
            { label: 'pass 2: walk 5 / 2 = 2 steps', items: [1, 2, 3, 4, 5], marks: { '2': 'hit' } },
          ],
        },
      },
      {
        title: 'One walker twice as fast as the other',
        text: 'Move slow one node and fast two nodes at a time. After 2 steps fast is on the last node, 5, and slow has gone half as far: it is on 3, the middle. One pass.',
        sketch: {
          kind: 'array',
          rows: [
            { label: 'after 1 step', items: [1, 2, 3, 4, 5], tags: { '1': [['slow', 'accent']], '2': [['fast', 'warn']] } },
            { label: 'after 2 steps', items: [1, 2, 3, 4, 5], marks: { '2': 'hit' }, tags: { '2': [['slow', 'accent']], '4': [['fast', 'warn']] } },
          ],
        },
      },
      {
        title: 'Even length: which middle?',
        text: 'With [1, 2, 3, 4, 5, 6], fast steps past the end after 3 steps and slow is on 4, the second middle: exactly what is asked. Stopping one step earlier (when fast.next.next is null) would give the first middle, 3.',
        sketch: {
          kind: 'array',
          rows: [
            {
              items: [1, 2, 3, 4, 5, 6],
              marks: { '2': 'kept', '3': 'hit' },
              tags: { '2': [['first middle', 'warn']], '3': [['slow: second middle', 'accent']] },
            },
          ],
        },
      },
    ],
    brute: {
      idea: 'Copy every node into an array and return the one at index n / 2.',
      cost: 'O(n) time, O(n) space',
      waste: 'An array of every node just to pick one of them. Counting then walking avoids the array but reads half the list twice.',
    },
    pattern: {
      pick: 'fast-slow-pointers',
      why: 'fast moves two nodes for each one of slow, so when fast can\'t go on, slow has covered half the list: the middle in one pass and O(1) space. The condition `fast != null && fast.next != null` stops on the second middle for even lengths.',
      not: [
        {
          id: 'two-pointers',
          why: 'Two pointers closing in from both ends would meet in the middle, but a singly linked list can\'t walk backwards from the end.',
        },
        { id: 'linked-list-manipulation', why: 'Nothing is relinked here; we only need to find a node.' },
      ],
    },
    watch: {
      viz: 'FastSlowViz',
      inputs: [
        { label: '[1, 2, 3, 4, 5]', input: { mode: 'middle', vals: [1, 2, 3, 4, 5] } },
        { label: '[1, 2, 3, 4, 5, 6]', input: { mode: 'middle', vals: [1, 2, 3, 4, 5, 6] } },
      ],
    },
    edges: ['One node: [1] → [1].', 'Two nodes: [1, 2] → [2], the second middle.', 'Odd length: [1, 2, 3] → [2, 3].'],
  },

  'linked-list-cycle': {
    aha: 'On a circular track a faster runner always catches a slower one. Move slow one node and fast two: without a cycle fast reaches the end; with one, fast gains one node per step inside the loop and must land on slow.',
    asks: {
      read: 'Which words limit what you may store while walking?',
      budget: 'Time is easy here. What is the real limit?',
      observe: 'In [3, 2, 0, −4] where −4 links back to 2, both pointers end up going round 2 → 0 → −4. Can fast jump over slow?',
      brute: 'What would you remember while walking to notice a node you have seen before?',
      pattern: 'What happens to the distance between a fast and a slow runner on a loop?',
      watch: 'Watch the gap shrink by one each step until they meet, or fast fall off the end.',
    },
    read: [
      {
        phrase: 'following the `next` pointers would visit some node again',
        says: 'A cycle means the walk never ends. A plain walk can confirm "no cycle" by reaching null, but never "cycle".',
      },
      { phrase: 'your solution should look at the nodes, not at `pos`', says: 'pos only builds the test; the code only has the head.' },
      { phrase: 'Try to use O(1) extra memory', says: 'No set of visited nodes: something else has to notice the repeat.' },
    ],
    budget: {
      from: 'number of nodes ≤ 10⁴',
      n: 10000,
      aim: 'O(n) time, O(1) space',
      note: 'Any linear walk is fast. The real limit is memory: no set of visited nodes.',
    },
    observe: [
      {
        title: 'Without a cycle the walk reaches null',
        text: 'Walking [1, 2, 3] ends at null after 3 nodes. With a cycle there is no end, so "walk until null" can say "no cycle" but can never say "cycle".',
        sketch: { kind: 'array', rows: [{ items: [1, 2, 3, 'null'], marks: { '3': 'dim' } }], caption: 'the end of the list: no cycle' },
      },
      {
        title: 'Both pointers end up on the loop',
        text: 'In [3, 2, 0, −4], −4 links back to 2. Once slow enters the loop 2 → 0 → −4, fast is already going round it, somewhere behind slow.',
        sketch: {
          kind: 'array',
          rows: [{ items: [3, 2, 0, -4], bands: [{ from: 1, to: 3, tone: 'accent', label: 'the loop' }], tags: { '3': [['→ back to 2', 'warn']] } }],
        },
      },
      {
        title: 'The gap can\'t jump over zero',
        text: 'Each step slow moves 1 and fast moves 2, so fast gains exactly one node. A gap of 3 becomes 2, 1, 0: they land on the same node instead of skipping past each other.',
        sketch: { kind: 'array', rows: [{ label: 'nodes from fast up to slow, step by step', items: [3, 2, 1, 0], marks: { '3': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Walk the list storing every node in a hash set; meeting a node already in the set means a cycle.',
      cost: 'O(n) time, O(n) space',
      waste: 'Up to 10⁴ stored nodes just to answer yes or no, when the follow-up asks for O(1) memory.',
    },
    pattern: {
      pick: 'fast-slow-pointers',
      why: 'Floyd\'s tortoise and hare: slow moves 1, fast moves 2. Without a cycle fast reaches null first. With one, both end up on the loop and fast closes in by one node per step, so they meet. O(n) time, O(1) space.',
      not: [
        { id: 'hashing', why: 'A set of visited nodes works in O(n) time but O(n) space, which the follow-up rules out.' },
        {
          id: 'two-pointers',
          why: 'Array two pointers usually move towards each other. Here both move forward, and the difference in speed does the work.',
        },
        { id: 'linked-list-manipulation', why: 'Redirecting each visited node\'s next to a marker detects the loop too, but destroys the list.' },
      ],
    },
    watch: {
      viz: 'FastSlowViz',
      inputs: [
        { label: '[3, 2, 0, −4], pos = 1', input: { mode: 'detect', vals: [3, 2, 0, -4], pos: 1 } },
        { label: '[1, 2, 3, 4, 5], no cycle', input: { mode: 'detect', vals: [1, 2, 3, 4, 5], pos: -1 } },
      ],
    },
    edges: ['Empty list: [] → false.', 'One node pointing to itself: [1], pos 0 → true.', 'Two nodes, no cycle: [1, 2], pos −1 → false.'],
  },

  'happy-number': {
    aha: 'n → (sum of the squares of its digits) is a next pointer, so the numbers form a linked list, and it always ends in a loop. Run slow and fast pointers along it: n is happy exactly when they meet at 1.',
    asks: {
      read: 'Which words say what happens when n is not happy?',
      budget: 'One step turns any n into a number below 811. What does that say about how long the sequence can go on without repeating?',
      observe: 'Follow 19 and follow 2 for a few steps. How does each one end?',
      brute: 'What would you remember to notice that the sequence has started repeating?',
      pattern: 'Each number has exactly one next number. Which structure does that make, and which problem is "does it loop?"',
      watch: 'Watch slow and fast on 19 (happy) and on 2 (not happy).',
    },
    read: [
      {
        phrase: 'repeatedly replace it with the sum of the squares of its digits',
        says: 'Each number leads to exactly one next number, like a next pointer.',
      },
      { phrase: 'If this process reaches 1', says: '1 leads to 1² = 1: once there, it stays. Reaching 1 is itself a loop of length one.' },
      {
        phrase: 'the values loop forever in a cycle that does not include 1',
        says: 'Every start ends in a loop; the only question is which loop. That is cycle detection.',
      },
    ],
    budget: {
      from: 'n ≤ 2³¹ − 1',
      rows: [['digits of n', '≤ 10', 'ok', 'tiny'], ['after one step', '≤ 10 × 81 = 810', 'ok', 'small']],
      aim: 'O(log n) time, O(1) space',
      note: 'After one step every value is below 811, and from there it stays below 244 (three digits, at most 3 × 81). The sequence must repeat quickly: time is never the problem; noticing the repeat is.',
    },
    observe: [
      {
        title: 'Follow 19: it reaches 1',
        text: '19 → 1² + 9² = 82 → 64 + 4 = 68 → 36 + 64 = 100 → 1, and then 1 → 1 forever. 19 is happy.',
        sketch: { kind: 'array', rows: [{ items: [19, 82, 68, 100, 1], marks: { '4': 'hit' }, tags: { '4': [['1 → 1', 'success']] } }] },
      },
      {
        title: 'Follow 2: it comes back to 4',
        text: '2 → 4 → 16 → 37 → 58 → 89 → 145 → 42 → 20 → 4. It is back at 4, so the same eight numbers repeat forever and never reach 1. 2 is not happy.',
        sketch: {
          kind: 'array',
          rows: [{ items: [2, 4, 16, 37, 58, 89, 145, 42, 20], bands: [{ from: 1, to: 8, tone: 'danger', label: 'loops back to 4' }] }],
        },
      },
      {
        title: 'It is a linked list with a loop',
        text: 'Each number points to exactly one next number, and every start ends in a loop: either 1 → 1, or a loop without 1. So the question is Linked List Cycle with one extra check: is the loop at 1?',
        sketch: {
          kind: 'array',
          rows: [
            { label: 'happy', items: [19, 82, 68, 100, 1], tags: { '4': [['→ itself', 'success']] } },
            { label: 'not happy', items: [2, 4, '…', 42, 20], tags: { '4': [['→ 4', 'danger']] } },
          ],
        },
      },
    ],
    brute: {
      idea: 'Keep applying the step and remember every value in a hash set. Stop at 1 (happy) or at a value seen before (not happy).',
      cost: 'O(log n) time, a set of up to a few hundred values',
      waste: 'It is correct and fast; the set is the only cost, and it is exactly the memory that two pointers make unnecessary.',
    },
    pattern: {
      pick: 'fast-slow-pointers',
      why: 'Treat n → sum of squares as a next pointer and run Floyd\'s slow (one step) and fast (two steps) along the sequence. They must meet inside the loop; n is happy exactly when they meet at 1. O(1) memory.',
      not: [
        { id: 'hashing', why: 'A set of seen values is the simple correct answer; the two pointers only remove the memory.' },
        { id: 'math-for-interviews', why: 'Digit sums are arithmetic, but there is no formula for "happy": the sequence has to be followed.' },
      ],
    },
    watch: { viz: 'FastSlowViz', inputs: [{ label: 'n = 19', input: { mode: 'happy', n: 19 } }, { label: 'n = 2', input: { mode: 'happy', n: 2 } }] },
    edges: [
      'n = 1: 1 → true.',
      'n = 7: 7 → 49 → 97 → 130 → 10 → 1 → true.',
      'n = 4: 4 → false; it is already inside the loop.',
      'Zeros add nothing: 100 → true.',
    ],
  },

  'palindrome-linked-list': {
    aha: 'A palindrome check compares each value with its mirror from the end, and a singly linked list can\'t be read backwards. So make half of it readable backwards: find the middle with slow and fast pointers, reverse the second half in place, then walk both halves together.',
    asks: {
      read: 'Which words rule out the easy way, and which words hint at the fast way?',
      budget: 'O(n) time is easy. What makes O(1) extra space hard?',
      observe: 'Cut [1, 2, 2, 1] in half and reverse the second half. What do the two halves look like now?',
      brute: 'How would you check a palindrome if the values were in an array?',
      pattern: 'Which pointer trick finds the middle of a list in one pass?',
      watch: 'Watch the middle found, the second half reversed, and the halves compared.',
    },
    read: [
      {
        phrase: 'read the same forwards and backwards',
        says: 'Compare the first with the last, the second with the second-last, and so on: you need to read from both ends.',
      },
      {
        phrase: 'try for O(n) time and O(1) extra space',
        says: 'Copying the values into an array is ruled out; the list itself has to be read backwards somehow.',
      },
      {
        phrase: 'find the middle with fast and slow pointers, reverse the second half',
        says: 'The statement spells out the plan: middle, reverse, compare, then reverse back to restore the list.',
      },
    ],
    budget: {
      from: 'number of nodes ≤ 10⁵',
      n: 100000,
      aim: 'O(n) time, O(1) space',
      note: 'O(n) time comes free with any approach; the O(1) space is what makes it a puzzle.',
    },
    observe: [
      {
        title: 'You need to read from both ends',
        text: 'A palindrome check compares the first value with the last, then the second with the second-last. A singly linked list only goes forwards.',
        sketch: { kind: 'array', rows: [{ items: [1, 2, 2, 1], tags: { '0': [['first', 'accent']], '3': [['last', 'warn']] } }] },
      },
      {
        title: 'Reverse just the second half',
        text: 'Cut [1, 2, 2, 1] after the middle: [1, 2] and [2, 1]. Reversed, the second half reads 1, 2 starting from the old tail. Now both halves can be read from their fronts, in step.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'first half', items: [1, 2] }, { label: 'second half, reversed', items: [1, 2], marks: { '0': 'kept', '1': 'kept' } }],
        },
      },
      {
        title: 'Walk both halves together',
        text: '1 with 1, then 2 with 2: every pair matches, a palindrome. With an odd length like [1, 2, 3, 2, 1] the first half keeps the middle 3, which has no partner and needs none.',
        sketch: {
          kind: 'array',
          rows: [
            { label: 'first half', items: [1, 2], marks: { '0': 'hit', '1': 'hit' } },
            { label: 'reversed second half', items: [1, 2], marks: { '0': 'hit', '1': 'hit' } },
          ],
        },
      },
    ],
    brute: {
      idea: 'Copy the values into an array and check it with two pointers from both ends.',
      cost: 'O(n) time, O(n) space',
      waste: 'A second copy of up to 10⁵ values only to read them backwards, which the list can do itself once half of it is reversed in place.',
    },
    pattern: {
      pick: 'fast-slow-pointers',
      why: 'Slow and fast pointers find the middle in one pass; reversing the second half in place makes it readable backwards; then walk both halves comparing. O(n) time, O(1) space. Reverse the second half back afterwards to leave the list as it was.',
      not: [
        {
          id: 'two-pointers',
          why: 'The idea is two pointers from both ends, but a singly linked list can\'t move backwards until half of it is reversed.',
        },
        { id: 'stack-patterns', why: 'Pushing the values on a stack reads them backwards too, but uses O(n) space.' },
        { id: 'linked-list-manipulation', why: 'Reversal is one of the steps; knowing where to start it is the fast/slow part.' },
      ],
    },
    watch: {
      viz: 'FastSlowViz',
      inputs: [
        { label: '[1, 2, 2, 1]', input: { mode: 'palin', vals: [1, 2, 2, 1] } },
        { label: '[1, 2, 3, 2, 1]', input: { mode: 'palin', vals: [1, 2, 3, 2, 1] } },
        { label: '[1, 2]', input: { mode: 'palin', vals: [1, 2] } },
      ],
    },
    edges: [
      'One node: [7] → true.',
      'Two different values: [1, 2] → false.',
      'Odd length: [1, 0, 1] → true; the middle needs no partner.',
      'Only the inner pair differs: [1, 2, 3, 1] → false.',
    ],
  },

  'remove-nth-node-from-end-of-list': {
    aha: 'Keep a fixed gap: send one pointer n + 1 nodes ahead of another, both starting at a dummy before the head, then move them together. When the leader falls off the end, the trailer is right before the node to remove.',
    asks: {
      read: 'Which words ask for one pass, and which case does the dummy node take care of?',
      budget: 'Only 30 nodes. What is the real constraint?',
      observe: 'If lead is 3 nodes ahead of lag, where is lag when lead falls off the end of [1, 2, 3, 4, 5]?',
      brute: 'If you knew the length, which node would you walk to? What does learning the length cost?',
      pattern: 'How can two pointers measure "n from the end" without knowing the length?',
      watch: 'Watch the gap open, then both pointers move until lead falls off.',
    },
    read: [
      {
        phrase: '`n`-th node counted from the end',
        says: 'Counted from the end, which a singly linked list can\'t walk from. Either learn the length, or measure the distance some other way.',
      },
      { phrase: 'Try to do it in a single pass', says: 'Counting the length first is the two-pass answer; the follow-up wants one pass.' },
      {
        phrase: 'If `n` equals the list\'s length, the head itself is removed',
        says: 'The node before the target doesn\'t exist when the target is the head: a dummy node in front gives it one.',
      },
    ],
    budget: {
      from: 'number of nodes ≤ 30',
      rows: [['count, then walk', '2 passes', 'ok', 'fits'], ['lead n + 1 ahead of lag', '1 pass', 'ok', 'asked for']],
      aim: 'one pass, O(1) space',
      note: '30 nodes is tiny: the challenge is the single pass, not speed.',
    },
    observe: [
      {
        title: 'From the end is from the start, if you know the length',
        text: 'In [1, 2, 3, 4, 5], the 2nd node from the end is the 4th from the start (5 − 2 + 1). But knowing that 5 costs a pass of its own.',
        sketch: { kind: 'array', rows: [{ items: [1, 2, 3, 4, 5], marks: { '3': 'bad' }, tags: { '3': [['2nd from the end', 'danger']] } }] },
      },
      {
        title: 'A fixed gap measures it for free',
        text: 'Put lag on a dummy before the head and send lead n + 1 = 3 nodes ahead. Move both together: when lead falls off the end, lag is 3 nodes behind it, right before 4, the node to remove.',
        sketch: {
          kind: 'array',
          rows: [{ items: ['D', 1, 2, 3, 4, 5, 'null'], marks: { '4': 'bad', '6': 'dim' }, tags: { '3': [['lag', 'accent']], '6': [['lead', 'warn']] } }],
          caption: 'lag.next = lag.next.next unlinks 4',
        },
      },
      {
        title: 'The dummy makes removing the head ordinary',
        text: 'With n = 5 the node to remove is the head, and there is no node before it. Starting lag on the dummy gives the head a node before it, so the same unlink works.',
        sketch: { kind: 'array', rows: [{ items: ['D', 1, 2, 3, 4, 5], marks: { '1': 'bad' }, tags: { '0': [['lag', 'accent']] } }] },
      },
    ],
    brute: {
      idea: 'Count the length L, then walk to node L − n and unlink the node after it.',
      cost: 'O(L), two passes',
      waste: 'The first pass only measures how far to walk. A pointer running ahead measures the same distance while the other one walks.',
    },
    pattern: {
      pick: 'fast-slow-pointers',
      why: 'Two pointers with a fixed gap: lead goes n + 1 nodes ahead of lag (both starting at a dummy), then both move until lead falls off. lag stops right before the n-th node from the end; unlink it. One pass, O(1) space.',
      not: [
        { id: 'linked-list-manipulation', why: 'The dummy node and the unlink come from there; finding the node in one pass is the gap trick.' },
        {
          id: 'two-pointers',
          why: 'Same family, but on a list both pointers must move forward, so a gap between them does the work, not opposite ends.',
        },
        { id: 'stack-patterns', why: 'Pushing every node and popping n of them also finds it, with O(L) extra space.' },
      ],
    },
    watch: {
      viz: 'FastSlowViz',
      inputs: [
        { label: '[1, 2, 3, 4, 5], n = 2', input: { mode: 'nth', vals: [1, 2, 3, 4, 5], n: 2 } },
        { label: '[1, 2], n = 2 (the head)', input: { mode: 'nth', vals: [1, 2], n: 2 } },
      ],
    },
    edges: ['Remove the head: [1, 2], n = 2 → [2].', 'The only node: [1], n = 1 → [].', 'Remove the tail: [1, 2, 3], n = 1 → [1, 2].'],
  },

  'linked-list-cycle-ii': {
    aha: 'Floyd\'s pointers meet somewhere inside the loop, and that meeting point is a whole number of laps away from the head. So a pointer from the head and one from the meeting point, both moving one step at a time, arrive at the loop\'s entrance together.',
    asks: {
      read: 'Which words rule out marking or breaking the list?',
      budget: 'Time is easy again. What is the limit?',
      observe: 'In [3, 2, 0, −4] slow and fast meet at −4, but the loop begins at 2. How far is the meeting point from the entrance, compared with the head?',
      brute: 'What would you store to spot the first node visited twice?',
      pattern: 'Once slow and fast have met, what do you know about how far slow has walked?',
      watch: 'Watch phase 1 find the meeting point, then phase 2 walk to the entrance.',
    },
    read: [
      {
        phrase: 'return the node where the cycle begins',
        says: 'Not just "is there a loop" but where it starts: a second question on top of Linked List Cycle.',
      },
      { phrase: 'otherwise return `null`', says: 'With no loop, fast falls off the end first, exactly as in Linked List Cycle.' },
      { phrase: 'Do not modify the list', says: 'No marking visited nodes by redirecting their links.' },
    ],
    budget: { from: 'number of nodes ≤ 10⁴', n: 10000, aim: 'O(n) time, O(1) space', note: 'As in Linked List Cycle, time is easy; memory is the limit.' },
    observe: [
      {
        title: 'Detecting is the easy half',
        text: 'Floyd\'s slow and fast pointers meet somewhere inside the loop. In [3, 2, 0, −4] they meet at −4, but the loop begins at 2: the meeting point is not the answer.',
        sketch: {
          kind: 'array',
          rows: [{ items: [3, 2, 0, -4], marks: { '1': 'hit', '3': 'cur' }, tags: { '1': [['entrance', 'success']], '3': [['they meet', 'accent']] } }],
        },
      },
      {
        title: 'Count the distances',
        text: 'Call a the distance from the head to the entrance and C the loop\'s length. When they meet, slow has walked d steps and fast 2d; fast\'s extra d steps are whole laps, so d is a multiple of C. Here a = 1, C = 3, and they meet after d = 3 steps.',
        sketch: {
          kind: 'array',
          rows: [{ items: [3, 2, 0, -4], bands: [{ from: 0, to: 0, tone: 'ghost', label: 'a = 1' }, { from: 1, to: 3, tone: 'accent', label: 'C = 3' }] }],
        },
      },
      {
        title: 'Walk a more steps from both places',
        text: 'Walking a steps from the head reaches the entrance. The meeting point is d steps from the head, and d is whole laps, so walking a more steps from it also lands on the entrance. Put p at the head and move p and slow one step each: here one step, and both are on 2.',
        sketch: {
          kind: 'array',
          rows: [
            { label: 'start of phase 2', items: [3, 2, 0, -4], tags: { '0': [['p', 'accent']], '3': [['slow', 'warn']] } },
            { label: 'one step each', items: [3, 2, 0, -4], marks: { '1': 'hit' }, tags: { '1': [['p = slow', 'success']] } },
          ],
        },
      },
    ],
    brute: {
      idea: 'Walk the list storing nodes in a hash set; the first node already in the set is the entrance.',
      cost: 'O(n) time, O(n) space',
      waste: 'Up to 10⁴ stored nodes, when two pointers and a little counting find the same node with no memory.',
    },
    pattern: {
      pick: 'fast-slow-pointers',
      why: 'Floyd in two phases: slow and fast meet inside the loop; then a pointer from the head and slow, both moving one step, meet exactly at the entrance, because the meeting point is a whole number of laps from the head. O(n) time, O(1) space.',
      not: [
        { id: 'hashing', why: 'A set finds the first repeated node in O(n) time, but with O(n) space.' },
        { id: 'linked-list-manipulation', why: 'Redirecting links as you go finds the entrance but modifies the list, which is forbidden.' },
        { id: 'two-pointers', why: 'A fixed gap of C nodes also finds the entrance, but needs an extra lap to measure C first.' },
      ],
    },
    watch: {
      viz: 'FastSlowViz',
      inputs: [
        { label: '[3, 2, 0, −4], pos = 1', input: { mode: 'cycle', vals: [3, 2, 0, -4], pos: 1 } },
        { label: '[1, 2, 3, 4, 5, 6, 7], pos = 2', input: { mode: 'cycle', vals: [1, 2, 3, 4, 5, 6, 7], pos: 2 } },
      ],
    },
    edges: [
      'No cycle: [1, 2], pos −1 → null (prints −1).',
      'The whole list is the loop: [1, 2], pos 0 → index 0.',
      'The tail points to itself: [1, 2, 3], pos 2 → index 2.',
    ],
  },

  'reorder-list': {
    aha: 'The new order takes one node from the front, then one from the back, and so on. The nodes from the back, in order, are just the second half reversed. So find the middle, reverse the second half, and weave the two halves together.',
    asks: {
      read: 'Which words say you may only relink nodes?',
      budget: 'Up to 5 × 10⁴ nodes. How slow is walking to the current tail every time?',
      observe: 'In [1, 2, 3, 4] → [1, 4, 2, 3], which nodes come from the back, and in what order?',
      brute: 'How would you move the tail into place, one node at a time?',
      pattern: 'Which three in-place steps turn the list into front, back, front, back?',
      watch: 'Watch the middle found, the second half reversed, and the halves woven together.',
    },
    read: [
      {
        phrase: 'Reorder it into',
        says: 'Front, back, front, back: L0, Ln, L1, Ln−1, …. Every "back" step needs the current last node, which a singly linked list can\'t reach cheaply.',
      },
      {
        phrase: 'Change the links between nodes in place (do not change values)',
        says: 'Copying values around is ruled out: relink the nodes themselves, with O(1) extra memory.',
      },
    ],
    budget: {
      from: 'number of nodes ≤ 5 × 10⁴',
      n: 50000,
      aim: 'O(n) time, O(1) space',
      note: 'Walking to the current tail for every node is O(n²) ≈ 2.5 × 10⁹: too slow. An array of nodes is O(n), but uses O(n) memory.',
    },
    observe: [
      {
        title: 'Front, back, front, back',
        text: '[1, 2, 3, 4] becomes 1, 4, 2, 3: one node from the front, one from the back, again and again. Every "back" needs the current last node, and the list can\'t step backwards.',
        sketch: {
          kind: 'array',
          rows: [{ items: [1, 2, 3, 4], tags: { '0': [['1st', 'accent']], '1': [['3rd', 'accent']], '2': [['4th', 'warn']], '3': [['2nd', 'warn']] } }],
        },
      },
      {
        title: 'The backs are the second half reversed',
        text: 'The nodes taken from the back are 4, then 3: the second half [3, 4] read backwards. The fronts are the first half, [1, 2], in order.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'first half', items: [1, 2] }, { label: 'second half, reversed', items: [4, 3], marks: { '0': 'kept', '1': 'kept' } }],
        },
      },
      {
        title: 'Weave the two halves',
        text: 'Take one node from each in turn: 1, 4, 2, 3. Only next pointers change: 1 → 4, 4 → 2, 2 → 3.',
        sketch: {
          kind: 'array',
          rows: [{ items: [1, 4, 2, 3], marks: { '1': 'kept', '3': 'kept' } }],
          caption: 'shaded: the nodes from the reversed second half',
        },
      },
    ],
    brute: {
      idea: 'For each front node, walk to the current tail, unlink it, and insert it after the front node.',
      cost: 'O(n²)',
      waste: 'Every insert walks the remaining list again just to find its last node.',
    },
    pattern: {
      pick: 'fast-slow-pointers',
      why: 'Three in-place steps: find the middle with slow and fast pointers, reverse the second half, then weave the two halves together. O(n) time, O(1) space.',
      not: [
        { id: 'linked-list-manipulation', why: 'Reversing and relinking are the tools, but where to cut comes from the fast/slow pointers.' },
        { id: 'stack-patterns', why: 'A stack of the second-half nodes gives them back to front, with O(n) extra space.' },
        { id: 'two-pointers', why: 'Front and back pointers over an array of the nodes work in O(n) time, with O(n) space.' },
      ],
    },
    watch: {
      viz: 'FastSlowViz',
      inputs: [
        { label: '[1, 2, 3, 4]', input: { mode: 'reorder', vals: [1, 2, 3, 4] } },
        { label: '[1, 2, 3, 4, 5]', input: { mode: 'reorder', vals: [1, 2, 3, 4, 5] } },
      ],
    },
    edges: ['One node: [1] → [1].', 'Two nodes: [1, 2] → [1, 2].', 'Odd length: [1, 2, 3] → [1, 3, 2].'],
  },

  'find-the-duplicate-number': {
    aha: 'Read the array as a linked list: index i points to index nums[i]. Nothing points to index 0, so the walk from 0 must end in a loop, and the two places holding the duplicate both point into the loop\'s entrance. Floyd\'s cycle detection finds that entrance: it is the duplicate.',
    asks: {
      read: 'Which words tie the values to the indexes, and which rule out the easy fixes?',
      budget: 'Up to 10⁵ numbers, no changes to the array, O(1) extra space. Which usual tricks are left?',
      observe: 'In [1, 3, 4, 2, 2], follow i → nums[i] from index 0. Where does the walk start repeating?',
      brute: 'What is the simplest correct way, and why can\'t you sort or mark the array?',
      pattern: 'If values are indexes, the array is a linked list. What does a duplicate value look like in that list?',
      watch: 'Watch Floyd find the loop, then its entrance: the duplicate.',
    },
    read: [
      {
        phrase: '`n + 1` integers, each between `1` and `n`',
        says: 'Every value is a valid index (1 … n into 0 … n), so each value can be followed like a next pointer.',
      },
      { phrase: 'it may appear more than twice', says: 'Tricks like "sum minus the expected sum" fail when the value repeats more than once.' },
      {
        phrase: 'Do not modify the array, and use only O(1) extra space',
        says: 'No sorting, no swapping into place, no marking by negating, no set.',
      },
    ],
    budget: {
      from: 'nums.length ≤ 10⁵ + 1',
      n: 100000,
      aim: 'O(n) time, O(1) space',
      note: 'Comparing every pair is about 5 × 10⁹ steps. Sorting or a set is fast enough, but they modify the array or use memory.',
    },
    observe: [
      {
        title: 'Every value can be followed as an arrow',
        text: 'Values are 1 … n and indexes 0 … n, so nums[i] can be read as an arrow from index i to index nums[i]. For [1, 3, 4, 2, 2]: 0 → 1 → 3 → 2 → 4 → 2 → 4 → …',
        sketch: {
          kind: 'array',
          rows: [{ items: [1, 3, 4, 2, 2], tags: { '0': [['0 → 1', 'accent']], '1': [['1 → 3', 'accent']], '3': [['3 → 2', 'accent']] } }],
          caption: 'index i points to index nums[i]',
        },
      },
      {
        title: 'Nothing points to index 0, so the walk must loop',
        text: 'No value is 0, so the walk from index 0 never returns to it. With only n + 1 boxes, it must eventually loop somewhere else: here 2 → 4 → 2.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'indexes visited from 0', items: [0, 1, 3, 2, 4], bands: [{ from: 3, to: 4, tone: 'accent', label: 'loop 2 → 4 → 2' }] }],
        },
      },
      {
        title: 'The duplicate is where the loop starts',
        text: 'Indexes 3 and 4 both hold 2, so two arrows enter box 2: one from the path (3 → 2) and one from inside the loop (4 → 2). A box with two arrows in is the loop\'s entrance, and its index is the duplicate. Finding a loop\'s entrance is Linked List Cycle II.',
        sketch: {
          kind: 'array',
          rows: [{ items: [1, 3, 4, 2, 2], marks: { '3': 'hit', '4': 'hit' }, tags: { '3': [['→ 2', 'success']], '4': [['→ 2', 'success']] } }],
        },
      },
    ],
    brute: {
      idea: 'Compare every pair of positions; the value two positions share is the answer.',
      cost: 'O(n²)',
      waste: 'Each value is compared with every other. The usual shortcuts (sort, a set, negate to mark seen values) all modify the array or use memory, which the rules forbid.',
    },
    pattern: {
      pick: 'fast-slow-pointers',
      why: 'Read the array as a linked list i → nums[i] starting from index 0. Floyd\'s slow and fast pointers meet inside the loop; a second walk from index 0 meets slow at the loop\'s entrance, which is the duplicate. O(n) time, O(1) space, and the array is never changed.',
      not: [
        { id: 'cyclic-sort', why: 'Swapping each value to its home finds the duplicate in O(n), but the swaps modify the array.' },
        {
          id: 'hashing',
          why: 'A set of seen values finds it in one pass, but uses O(n) extra space, which the statement forbids (and the array may not be changed either).',
        },
        {
          id: 'binary-search-on-answer',
          why: 'Counting how many values are ≤ mid and halving the range works without changing anything, but in O(n log n).',
        },
      ],
    },
    watch: {
      viz: 'FastSlowViz',
      inputs: [
        { label: '[1, 3, 4, 2, 2]', input: { mode: 'dup', nums: [1, 3, 4, 2, 2] } },
        { label: '[3, 1, 3, 4, 2]', input: { mode: 'dup', nums: [3, 1, 3, 4, 2] } },
      ],
    },
    edges: ['Repeated many times: [2, 2, 2, 2, 2] → 2.', 'Smallest case: [1, 1] → 1.', 'The largest value repeats: [1, 4, 4, 2, 3] → 4.'],
  },
};
