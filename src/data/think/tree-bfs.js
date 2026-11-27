/** Practice thinking walkthroughs: tree-bfs (format: src/data/think/index.js). */

export default {
  'binary-tree-level-order-traversal': {
    aha: 'A queue hands out nodes in the order they arrived, and children are always added after their whole level. So at the start of a round, the queue holds exactly one level. Freeze its size, poll that many nodes, and everything they add is the next level.',
    asks: {
      read: 'What shape must the answer have, and which words fix the order inside a level?',
      budget: 'Up to 2000 nodes. Is anything harder than one visit per node needed?',
      observe: 'Put 3 in a queue, then poll and add children. When does level 2 start and end inside the queue?',
      brute: 'You could find each node\'s depth first and group by it. What does that cost you?',
      pattern: 'The queue mixes two levels while you work. How do you know where one ends?',
      watch: 'Watch the size freeze at the start of each round.',
    },
    read: [
      {
        phrase: 'a list for each level, from the root level down',
        says: 'The answer is a list of lists: you must know where each level ends, not just the order of the values.',
      },
      { phrase: 'with each level\'s values from left to right', says: 'Add the left child before the right one, so the queue keeps that order.' },
      { phrase: 'processing one whole level at a time', says: 'The hint: finish a level before starting the next.' },
    ],
    budget: { from: 'number of nodes ≤ 2000', n: 2000, aim: 'O(n)', note: 'Every node goes into the queue once and comes out once.' },
    observe: [
      {
        title: 'A queue already gives level order',
        text: 'Poll 3, add 9 and 20. Poll 9 (no children), poll 20, add 15 and 7. The values came out 3, 9, 20, 15, 7: top to bottom, left to right. The order is right; only the level breaks are missing.',
        sketch: {
          kind: 'array',
          rows: [
            {
              label: 'polled in order',
              items: [3, 9, 20, 15, 7],
              bands: [{ from: 0, to: 0, label: 'L1' }, { from: 1, to: 2, label: 'L2' }, { from: 3, to: 4, label: 'L3' }],
            },
          ],
        },
      },
      {
        title: 'At the start of a round, the queue is one level',
        text: 'Right after 3 is done, the queue is [9, 20]: all of level 2 and nothing else. Its size, 2, says how many polls make up this level. While you poll them, 15 and 7 join the back, but they are outside the 2 you counted.',
        sketch: {
          kind: 'array',
          rows: [
            {
              label: 'queue',
              items: [9, 20, 15, 7],
              marks: { '0': 'hit', '1': 'hit' },
              bands: [{ from: 0, to: 1, label: 'size = 2: this level' }, { from: 2, to: 3, label: 'added meanwhile: next' }],
            },
          ],
        },
      },
      {
        title: 'Freeze size, poll that many',
        text: 'Each round: size = queue.size(), poll exactly size nodes into one list, queue their children. Three rounds give [3], [9, 20], [15, 7].',
        sketch: { kind: 'array', rows: [{ label: 'level 1', items: [3] }, { label: 'level 2', items: [9, 20] }, { label: 'level 3', items: [15, 7] }] },
      },
    ],
    brute: {
      idea: 'Find every node\'s depth with one walk, then for each depth from 0 up, walk the tree again collecting the nodes at that depth.',
      cost: 'O(n · h)',
      waste: 'Each level costs a whole new walk of the tree, though one pass already visits everything in level order.',
    },
    pattern: {
      pick: 'tree-bfs',
      why: 'BFS level by level: freeze size = queue.size() at the start of a round, poll exactly that many into one list, queue their children. O(n) time, O(width) queue.',
      not: [
        {
          id: 'tree-dfs',
          why: 'A DFS that files each value under its depth also works, but it reaches the levels out of order; BFS hands them out one at a time.',
        },
        { id: 'graph-traversal', why: 'This is BFS from graph traversal, but a tree has no cycles, so no visited set is needed.' },
      ],
    },
    watch: {
      viz: 'TreeBfsViz',
      inputs: [
        { label: '[3, 9, 20, null, null, 15, 7]', input: { mode: 'level', tree: [3, 9, 20, null, null, 15, 7] } },
        { label: '[1, 2, 3, 4, null, null, 5]', input: { mode: 'level', tree: [1, 2, 3, 4, null, null, 5] } },
      ],
    },
    edges: ['Empty tree: [] → [].', 'One node: [1] → [[1]].', 'A chain: [1, 2, null, 3] → [[1], [2], [3]].'],
  },

  'average-of-levels-in-binary-tree': {
    free: true,
    aha: 'An average needs a level\'s sum and how many nodes it has. Level-by-level BFS gives you both: freeze size = queue.size() at the start of a round, add up exactly size values, and divide by size. The count was never in doubt.',
    asks: {
      read: 'Which words say how precise the answer must be, and which warn about the sum?',
      budget: 'Up to 10⁴ nodes. One visit each is fine. What can still go wrong?',
      observe: 'In [3, 9, 20, null, null, 15, 7], which values share a level, and how many are there?',
      brute: 'You could collect each level\'s list, then average it. What is stored that never needed to be?',
      pattern: 'Where does the count for each level come from, for free?',
      watch: 'Watch each level\'s sum grow, then get divided by its frozen size.',
    },
    read: [
      {
        phrase: 'the average of the node values on each level of the tree, from the top level down',
        says: 'One number per level, in level order: a level-by-level walk produces them in exactly that order.',
      },
      { phrase: 'Answers within `10^-5` of the exact value are accepted', says: 'Return doubles; small rounding is fine.' },
      { phrase: 'Use a wide enough type for the sums', says: 'Values reach 2³¹ − 1; two of them overflow an int. Sum in a long or a double.' },
    ],
    budget: { from: 'number of nodes ≤ 10⁴', n: 10000, aim: 'O(n)', note: 'Every node is visited once. The real trap is the sum overflowing a 32-bit int.' },
    observe: [
      {
        title: 'Three levels, three averages',
        text: 'Level 1 is [3]: average 3. Level 2 is [9, 20]: 29 / 2 = 14.5. Level 3 is [15, 7]: 22 / 2 = 11. The answer is [3.0, 14.5, 11.0].',
        sketch: {
          kind: 'array',
          rows: [
            { label: 'level 1', items: [3, '→ 3.0'], marks: { '1': 'hit' } },
            { label: 'level 2', items: [9, 20, '→ 14.5'], marks: { '2': 'hit' } },
            { label: 'level 3', items: [15, 7, '→ 11.0'], marks: { '2': 'hit' } },
          ],
        },
      },
      {
        title: 'The size you froze is the count',
        text: 'When level 2 starts, the queue is [9, 20], so size = 2. Poll 2 nodes, summing 9 + 20 = 29; their children join the back but are not counted. Divide by that same 2.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'queue', items: [9, 20, 15, 7], marks: { '0': 'hit', '1': 'hit' }, bands: [{ from: 0, to: 1, label: 'size = 2, sum = 29' }] }],
        },
      },
      {
        title: 'Two big values overflow an int',
        text: 'A level holding 2147483647 and 2147483647 sums to 4294967294, past the int limit. In a long (or double) the average is 2147483647, as it should be.',
        sketch: { kind: 'array', rows: [{ items: ['2³¹ − 1', '+ 2³¹ − 1', '= 2³² − 2'], marks: { '2': 'bad' } }], caption: 'Sum in a long or a double.' },
      },
    ],
    brute: {
      idea: 'Build the full level-order list of lists, then average each inner list.',
      cost: 'O(n)',
      waste: 'It stores every value just to add them up; a running sum per level needs O(1) extra.',
    },
    pattern: {
      pick: 'tree-bfs',
      why: 'Level-by-level BFS with a running sum: freeze size, add up size values, divide by size. O(n) time, O(width) queue.',
      not: [
        {
          id: 'tree-dfs',
          why: 'A DFS that files each value under its depth also works, but it reaches the levels out of order; BFS hands them out one at a time.',
        },
        { id: 'prefix-sums', why: 'Only one total per level is needed; nothing asks for sums of ranges.' },
      ],
    },
    watch: {
      viz: 'TreeBfsViz',
      inputs: [
        { label: '[3, 9, 20, null, null, 15, 7]', input: { mode: 'avg', tree: [3, 9, 20, null, null, 15, 7] } },
        { label: '[3, 9, 20, 15, 7]', input: { mode: 'avg', tree: [3, 9, 20, 15, 7] } },
      ],
    },
    edges: [
      'One node: [5] → [5.0].',
      'Huge values: [2147483647, 2147483647, 2147483647] → [2147483647.0, 2147483647.0] (sum in a long).',
      'Negatives: [-1, -2, 3] → [-1.0, 0.5].',
    ],
  },

  'minimum-depth-of-binary-tree': {
    aha: 'Level-by-level BFS reaches every node on level d before any node on level d + 1. So the first leaf it meets is on the shallowest level that has one: return that level number on the spot. The trap is the definition of a leaf: a node with one child isn\'t one.',
    asks: {
      read: 'What exactly is a leaf here, and what goes wrong with a one-child node?',
      budget: 'Up to 10⁵ nodes. Must you always look at all of them?',
      observe: 'In [2, null, 3, null, 4], what is the minimum depth? Why isn\'t it 1?',
      brute: 'The recursive mirror of max depth looks right. Where does it break?',
      pattern: 'Which order of visiting finds the shallowest leaf first?',
      watch: 'Watch BFS stop at the first leaf, deeper nodes untouched.',
    },
    read: [
      {
        phrase: 'the number of nodes on the shortest path from the root down to a leaf (a node with no children)',
        says: 'Count nodes, and the path must end at a real leaf: no children at all.',
      },
      { phrase: 'An empty tree has depth 0', says: 'The one case with no leaf at all: return 0 before starting.' },
      {
        phrase: 'a node with only one child is not a leaf',
        says: 'The missing side is not a path you can stop on. A min over both children would wrongly pick its 0.',
      },
    ],
    budget: {
      from: 'number of nodes ≤ 10⁵',
      n: 100000,
      aim: 'O(n)',
      note: 'O(n) at worst, but BFS stops early when a shallow leaf exists. A 10⁵ chain also makes recursion deep.',
    },
    observe: [
      {
        title: 'Depth counts down to a real leaf',
        text: 'In [3, 9, 20, null, null, 15, 7], 9 has no children: a leaf on level 2. The 20 side goes one level deeper. Minimum depth: 2.',
        sketch: {
          kind: 'array',
          rows: [
            { label: 'level 1', items: [3] },
            { label: 'level 2', items: ['9 (leaf)', 20], marks: { '0': 'hit' } },
            { label: 'level 3', items: [15, 7] },
          ],
        },
      },
      {
        title: 'A one-child node is not a leaf',
        text: 'In the chain [2, null, 3, null, 4], 2 has no left child, but that empty side is not a path to a leaf. The only leaf is 4, so the answer is 3. Taking 1 + min(left, right) would see the empty left as 0 and wrongly say 1.',
        sketch: {
          kind: 'array',
          rows: [
            { label: 'chain', items: [2, 3, '4 (leaf)'], marks: { '2': 'hit' } },
            { label: 'wrong min', items: ['1 + min(0, 2) = 1'], marks: { '0': 'bad' } },
          ],
        },
      },
      {
        title: 'BFS meets the shallowest leaf first',
        text: 'Levels are finished in order, so the first node with no children that BFS polls is on the shallowest such level. Return its level right away; the deeper nodes still queued are never visited.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'polled', items: [3, '9: leaf → return 2', 20, 15, 7], marks: { '1': 'hit', '2': 'dim', '3': 'dim', '4': 'dim' } }],
        },
      },
    ],
    brute: {
      idea: 'Visit every node, and for each leaf record its depth; return the smallest recorded depth.',
      cost: 'O(n)',
      waste: 'It explores the deepest branches even when a leaf sits on level 2.',
    },
    pattern: {
      pick: 'tree-bfs',
      why: 'BFS level by level, returning the level number at the first leaf polled. Shortest path in an unweighted tree. O(n) worst case, often far less.',
      not: [
        {
          id: 'tree-dfs',
          why: 'A DFS that files each value under its depth also works, but it reaches the levels out of order; BFS hands them out one at a time.',
        },
        { id: 'shortest-paths', why: 'Every edge counts 1, so plain BFS already gives shortest paths; no Dijkstra needed.' },
      ],
    },
    watch: {
      viz: 'TreeBfsViz',
      inputs: [
        { label: '[3, 9, 20, null, null, 15, 7]', input: { mode: 'min', tree: [3, 9, 20, null, null, 15, 7] } },
        { label: '[2, null, 3, null, 4, null, 5]', input: { mode: 'min', tree: [2, null, 3, null, 4, null, 5] } },
      ],
    },
    edges: ['Empty tree: [] → 0.', 'One node: [1] → 1.', 'A right chain: [2, null, 3, null, 4] → 3, not 1.'],
  },

  'binary-tree-right-side-view': {
    aha: 'From the right you see exactly one node per level: the rightmost one on it. It doesn\'t have to be a right child or on the rightmost branch. Level-by-level BFS knows where each level ends, so the last node polled in each round is the answer for that level.',
    asks: {
      read: 'Which example shows that a left-side node can be visible?',
      budget: 'Only 100 nodes. What is the real trap?',
      observe: 'In [1, 2, 3, 4], why is 4 visible although it sits under the left child?',
      brute: 'Following right children from the root is tempting. What does it miss?',
      pattern: 'What does "visible" mean in terms of levels?',
      watch: 'Watch the last node of each round get picked.',
    },
    read: [
      { phrase: 'on each level, the rightmost node', says: 'One value per level: the last one on it from left to right.' },
      {
        phrase: 'A node hidden on the left can still be visible if nothing is to its right on that level',
        says: 'Don\'t just follow right children: a deeper level may only have nodes on the left side.',
      },
    ],
    budget: {
      from: 'number of nodes ≤ 100',
      rows: [['one pass, level by level', 'O(n)', 'ok', 'fits']],
      aim: 'O(n)',
      note: 'Tiny: the trap is the definition of visible, not speed.',
    },
    observe: [
      {
        title: 'One visible node per level',
        text: 'In [1, 2, 3, null, 5, null, 4], the levels are [1], [2, 3], [5, 4]. From the right you see the last of each: 1, 3, 4.',
        sketch: {
          kind: 'array',
          rows: [
            { label: 'level 1', items: [1], marks: { '0': 'hit' } },
            { label: 'level 2', items: [2, 3], marks: { '1': 'hit' } },
            { label: 'level 3', items: [5, 4], marks: { '1': 'hit' } },
          ],
        },
      },
      {
        title: 'The right branch is not enough',
        text: 'In [1, 2, 3, 4], following right children gives 1, 3 and stops. But level 3 has one node, 4, under the left child 2, and nothing hides it. The view is [1, 3, 4].',
        sketch: {
          kind: 'array',
          rows: [
            { label: 'right branch only', items: [1, 3], marks: { '1': 'bad' } },
            { label: 'last per level', items: [1, 3, 4], marks: { '2': 'hit' } },
          ],
        },
      },
      {
        title: 'The last poll of each round',
        text: 'Freeze size at the start of a round; the node polled when i = size − 1 is the rightmost on that level. Add only that one.',
        sketch: { kind: 'array', rows: [{ label: 'round 3 polls', items: ['5 (i = 0)', '4 (i = 1 = size − 1)'], marks: { '1': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Collect the whole level-order list of lists, then take the last element of each.',
      cost: 'O(n)',
      waste: 'It stores every node\'s value level by level, though only the last value of each level is ever used; BFS can keep just that one.',
    },
    pattern: {
      pick: 'tree-bfs',
      why: 'Level-by-level BFS, keeping the node polled at i = size − 1. Or DFS going right first: the first node seen at each new depth is visible. O(n).',
      not: [
        {
          id: 'tree-dfs',
          why: 'A DFS that files each value under its depth also works, but it reaches the levels out of order; BFS hands them out one at a time.',
        },
        { id: 'stack-patterns', why: 'Nothing is hidden by something taller; "visible" just means rightmost on its level.' },
      ],
    },
    watch: {
      viz: 'TreeBfsViz',
      inputs: [
        { label: '[1, 2, 3, null, 5, null, 4]', input: { mode: 'right', tree: [1, 2, 3, null, 5, null, 4] } },
        { label: '[1, 2, 3, 4]', input: { mode: 'right', tree: [1, 2, 3, 4] } },
      ],
    },
    edges: ['Empty tree: [] → [].', 'Left-only deep node: [1, 2, 3, 4] → [1, 3, 4].', 'A left chain: [1, 2, null, 3] → [1, 2, 3].'],
  },

  'binary-tree-zigzag-level-order-traversal': {
    aha: 'The tree is still visited in plain level order; only where each value is written changes. On left-to-right levels, append to the level\'s list; on right-to-left levels, put each value at the front. Flip a flag after every level.',
    asks: {
      read: 'Which level goes which way, and does the visiting order have to change?',
      budget: 'Up to 2000 nodes. Can every level be fixed after the fact?',
      observe: 'In [1, 2, 3, 4, 5, 6, 7], level 2 holds 2, 3. How should it read?',
      brute: 'Swapping the order children are queued in seems natural. What goes wrong one level later?',
      pattern: 'What if the queue never changes and only the writing does?',
      watch: 'Watch the same polls write to the end, then to the front.',
    },
    read: [
      {
        phrase: 'alternating direction: the first level left to right, the next right to left',
        says: 'Level 1, 3, 5… read normally; level 2, 4, 6… reversed.',
      },
      {
        phrase: 'Collect each level in the normal left-to-right order, then reverse every other level',
        says: 'The hint: keep the traversal plain and fix the direction per level.',
      },
    ],
    budget: { from: 'number of nodes ≤ 2000', n: 2000, aim: 'O(n)', note: 'Reversing a level costs its length, so all reversals together are O(n).' },
    observe: [
      {
        title: 'Plain levels, then flip every other one',
        text: '[1, 2, 3, 4, 5, 6, 7] has levels [1], [2, 3], [4, 5, 6, 7]. Zigzag reads the middle one backwards: [1], [3, 2], [4, 5, 6, 7].',
        sketch: {
          kind: 'array',
          rows: [
            { label: 'L1 →', items: [1] },
            { label: 'L2 ←', items: [3, 2], marks: { '0': 'hit', '1': 'hit' } },
            { label: 'L3 →', items: [4, 5, 6, 7] },
          ],
        },
      },
      {
        title: 'Changing the queue order breaks the next level',
        text: 'Queueing right children first on level 2 gives 3, 2 correctly, but then their children come out as 7, 6, 5, 4. Level 3 should read 4, 5, 6, 7. The order of the queue and the order you write in are two separate things.',
        sketch: {
          kind: 'array',
          rows: [
            { label: 'L3 if queue flipped', items: [7, 6, 5, 4], marks: { '0': 'bad', '1': 'bad', '2': 'bad', '3': 'bad' } },
            { label: 'L3 wanted', items: [4, 5, 6, 7] },
          ],
        },
      },
      {
        title: 'Write at the front on reversed levels',
        text: 'Polls on level 2 come out 2 then 3. Put 2 in the list, then 3 at its front: [3, 2]. A deque (or filling an array of size `size` from the back) does it without a separate reverse.',
        sketch: { kind: 'array', rows: [{ label: 'after 2', items: [2] }, { label: 'after 3 (front)', items: [3, 2], marks: { '0': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Do a plain level order, then reverse every second level with a separate pass.',
      cost: 'O(n)',
      waste: 'Correct and fast, just an extra pass: each value on a reversed level is written twice.',
    },
    pattern: {
      pick: 'tree-bfs',
      why: 'Level-by-level BFS with a direction flag: append on left-to-right levels, insert at the front on the others, flip after each level. O(n).',
      not: [
        {
          id: 'tree-dfs',
          why: 'A DFS that files each value under its depth also works, but it reaches the levels out of order; BFS hands them out one at a time.',
        },
        { id: 'two-pointers', why: 'Reversing a level with two pointers is fine, but the work is producing the levels.' },
      ],
    },
    watch: {
      viz: 'TreeBfsViz',
      inputs: [
        { label: '[1, 2, 3, 4, 5, 6, 7]', input: { mode: 'zigzag', tree: [1, 2, 3, 4, 5, 6, 7] } },
        { label: '[3, 9, 20, null, null, 15, 7]', input: { mode: 'zigzag', tree: [3, 9, 20, null, null, 15, 7] } },
      ],
    },
    edges: ['Empty tree: [] → [].', 'One node: [1] → [[1]].', 'Two levels: [1, 2, 3] → [[1], [3, 2]].'],
  },

  'find-largest-value-in-each-tree-row': {
    aha: 'Same level-by-level BFS, keeping one number per round: the largest value polled. Start that number from the level\'s first node, never from 0, because a level can be all negative.',
    asks: {
      read: 'Which sentence warns about the starting value?',
      budget: 'Up to 10⁴ nodes. One pass?',
      observe: 'If a level is [-5, -3], what does starting the maximum at 0 return?',
      brute: 'Collecting each level and calling max on it works. What is kept around for no reason?',
      pattern: 'Where does each level start and end, so you know when to reset?',
      watch: 'Watch the running maximum reset at every level.',
    },
    read: [
      { phrase: 'the largest value on each level of the tree', says: 'One number per level, in level order.' },
      { phrase: 'An empty tree gives an empty list', says: 'An empty tree has no rows: return an empty list before starting the queue.' },
      {
        phrase: 'Values can be negative, so start each level\'s maximum from the first node on it rather than from 0',
        says: 'Initialise with the first value of the level (or −∞), not 0.',
      },
    ],
    budget: { from: 'number of nodes ≤ 10⁴', n: 10000, aim: 'O(n)', note: 'One visit per node.' },
    observe: [
      {
        title: 'One maximum per level',
        text: 'In [1, 3, 2, 5, 3, null, 9], the levels are [1], [3, 2], [5, 3, 9]. Their largest values: 1, 3, 9.',
        sketch: {
          kind: 'array',
          rows: [
            { label: 'level 1', items: [1], marks: { '0': 'hit' } },
            { label: 'level 2', items: [3, 2], marks: { '0': 'hit' } },
            { label: 'level 3', items: [5, 3, 9], marks: { '2': 'hit' } },
          ],
        },
      },
      {
        title: 'Starting at 0 lies on negative levels',
        text: 'A level [-5, -3] has largest value −3. A maximum that starts at 0 never changes and reports 0, a value that isn\'t even in the tree.',
        sketch: {
          kind: 'array',
          rows: [
            { label: 'start 0', items: [-5, -3, '→ 0'], marks: { '2': 'bad' } },
            { label: 'start at first', items: [-5, -3, '→ −3'], marks: { '2': 'hit' } },
          ],
        },
      },
      {
        title: 'Reset at every round',
        text: 'When i = 0 in a round, best = that node\'s value; after that, best = max(best, value). After size polls, best goes in the answer.',
        sketch: { kind: 'array', rows: [{ label: 'level 3 polls', items: ['5: best 5', '3: best 5', '9: best 9'], marks: { '2': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Build the full list of levels, then take the max of each list.',
      cost: 'O(n)',
      waste: 'Every value is stored only to be compared once; a running maximum per level needs O(1) extra.',
    },
    pattern: {
      pick: 'tree-bfs',
      why: 'Level-by-level BFS with a running maximum started from the level\'s first node. Or DFS keeping a maximum per depth. O(n).',
      not: [
        {
          id: 'tree-dfs',
          why: 'A DFS that files each value under its depth also works, but it reaches the levels out of order; BFS hands them out one at a time.',
        },
        { id: 'heap-patterns', why: 'One maximum per level needs only a running comparison, not a heap.' },
      ],
    },
    watch: {
      viz: 'TreeBfsViz',
      inputs: [
        { label: '[1, 3, 2, 5, 3, null, 9]', input: { mode: 'max', tree: [1, 3, 2, 5, 3, null, 9] } },
        { label: '[-1, -5, -3, -8]', input: { mode: 'max', tree: [-1, -5, -3, -8] } },
      ],
    },
    edges: ['Empty tree: [] → [].', 'All negative: [-1, -5, -3] → [-1, -3].', 'Extreme value: [-2147483648] → [-2147483648].'],
  },

  'populating-next-right-pointers-in-each-node': {
    aha: 'Once a level\'s next pointers are set, the level is a linked list you can walk without a queue. Walk it, and for each node wire its children: left.next = right (same parent), and right.next = next.left (the neighbouring parent\'s left child). Then move down a level.',
    asks: {
      read: 'What does "perfect" promise, and where must the last node of a level point?',
      budget: 'Up to 4095 nodes. Easy in time. What does the follow-up ask about memory?',
      observe: 'In [1, 2, 3, 4, 5, 6, 7], how does 5 find 6? They have different parents.',
      brute: 'A level-order queue does it directly. What does it cost in memory?',
      pattern: 'After level 2 is linked (2 → 3), what can you reach from 2 alone?',
      watch: 'Watch each linked level wire the one below it.',
    },
    read: [
      {
        phrase: 'The tree is perfect: every internal node has two children and all leaves are on the same level',
        says: 'Every parent has both children, so left and right always exist: no null checks inside a level.',
      },
      { phrase: 'or to `null` for the last node of a level', says: 'The rightmost node of each level keeps next = null.' },
    ],
    budget: { from: 'number of nodes ≤ 4095', n: 4095, aim: 'O(n)', note: 'Time is easy; the follow-up asks for O(1) extra space, which rules out a queue.' },
    observe: [
      {
        title: 'Siblings are easy',
        text: '4 and 5 have the same parent, 2. Standing on 2: 2.left.next = 2.right, so 4 → 5.',
        sketch: { kind: 'array', rows: [{ label: 'parent 2', items: ['4 → 5'], marks: { '0': 'hit' } }] },
      },
      {
        title: 'Cousins go through the parent\'s next',
        text: '5 (under 2) must point at 6 (under 3). 2 doesn\'t own 6, but 2.next is 3, already set when level 2 was linked, and 3.left is 6. So 2.right.next = 2.next.left.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'level 2, linked', items: [2, '→', 3] }, { label: 'level 3', items: [4, 5, '→', 6, 7], marks: { '1': 'hit', '3': 'hit' } }],
          caption: '5.next = 2.next.left = 6',
        },
      },
      {
        title: 'A linked level replaces the queue',
        text: 'Walk level 2 through next: 2, then 3, then null. That walk wires all of level 3. Then start again from the leftmost node one level down. Only two pointers are needed: leftmost and the current node.',
        sketch: {
          kind: 'array',
          rows: [
            { label: 'L1', items: ['1 → null'] },
            { label: 'L2', items: ['2 → 3 → null'] },
            { label: 'L3', items: ['4 → 5 → 6 → 7 → null'], marks: { '0': 'hit' } },
          ],
        },
      },
    ],
    brute: {
      idea: 'Level-order BFS with a queue: within a round, point each polled node at the next one polled; the last of the round gets null.',
      cost: 'O(n)',
      waste: 'The queue holds up to half the tree (2048 leaves) though the next pointers being built already link each level.',
    },
    pattern: {
      pick: 'tree-bfs',
      why: 'Level linking: walk each linked level through next and wire its children (left → right, right → next.left), then step down to leftmost.left. O(n) time, O(1) extra space.',
      not: [
        {
          id: 'tree-dfs',
          why: 'A DFS that files each value under its depth also works, but it reaches the levels out of order; BFS hands them out one at a time.',
        },
        { id: 'linked-list-manipulation', why: 'Each level does become a linked list, but the links are built from the tree\'s parent structure.' },
      ],
    },
    watch: {
      viz: 'TreeBfsViz',
      inputs: [
        { label: '[1, 2, 3, 4, 5, 6, 7]', input: { mode: 'next', tree: [1, 2, 3, 4, 5, 6, 7] } },
        { label: '[1, 2, 3]', input: { mode: 'next', tree: [1, 2, 3] } },
      ],
    },
    edges: ['Empty tree: [] → [].', 'One node: [1] → ["1", "#"].', 'Three nodes: [1, 2, 3] → ["1", "#", "2", "3", "#"].'],
  },

  'maximum-width-of-binary-tree': {
    aha: 'Give each node the position it would have in a complete tree: root 0, children of p at 2p and 2p + 1. A level\'s width is then last position − first + 1, gaps included. Positions double every level, so subtract each level\'s first position before using them; that keeps the numbers small.',
    asks: {
      read: 'Which words say the empty spots between nodes count?',
      budget: 'Only 3000 nodes, but the tree can be 3000 levels deep. What happens to positions?',
      observe: 'In [1, 3, 2, 5, 3, null, 9], level 3 has nodes 5, 3, 9. Why is its width 4, not 3?',
      brute: 'Laying the tree out in an array as if complete works on paper. How big is that array?',
      pattern: 'How can a node know its position from its parent alone?',
      watch: 'Watch positions handed down, re-based on every level.',
    },
    read: [
      {
        phrase: 'counting the empty positions in between as if the tree were a complete binary tree',
        says: 'Width is about positions, not node counts: holes between nodes count.',
      },
      {
        phrase: 'between its leftmost and rightmost non-null nodes, inclusive',
        says: 'Only holes between real nodes count, not the ones past the ends: last − first + 1.',
      },
      { phrase: 'The answer fits in a 32-bit signed integer', says: 'The answer is small, but raw positions on a deep tree are not: re-base them.' },
    ],
    budget: {
      from: 'number of nodes ≤ 3000',
      n: 3000,
      aim: 'O(n)',
      note: 'One visit per node. Raw positions can reach 2³⁰⁰⁰ on a deep tree, so they must be re-based every level.',
    },
    observe: [
      {
        title: 'Holes count',
        text: 'Level 3 of [1, 3, 2, 5, 3, null, 9] has 5 and 3 under the left 3, then a hole where 2\'s left child would be, then 9. Four positions from 5 to 9: width 4.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'level 3 positions', items: ['5@0', '3@1', '·@2', '9@3'], marks: { '2': 'dim' }, bands: [{ from: 0, to: 3, label: 'width 4' }] }],
        },
      },
      {
        title: 'Positions like an array heap',
        text: 'Root at 0; a node at p has children at 2p and 2p + 1. Then 3 is at 0 and 2 at 1; 5, 3 at 0, 1; 9 is 2\'s right child: 2·1 + 1 = 3. Width = 3 − 0 + 1 = 4.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'level 2', items: ['3@0', '2@1'] }, { label: 'level 3', items: ['5@0', '3@1', '9@3'], marks: { '2': 'hit' } }],
        },
      },
      {
        title: 'Re-base, or positions explode',
        text: 'On a tree that goes right 40 times, positions double every level and overflow even a long. Only differences matter, so subtract the level\'s first position from every node on it: the numbers stay below the level\'s width.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'raw', items: ['2⁴⁰ − 1'], marks: { '0': 'bad' } }, { label: 're-based', items: [0], marks: { '0': 'hit' } }],
        },
      },
    ],
    brute: {
      idea: 'Store the tree in an array as if it were complete (index p, children 2p and 2p + 1), then measure each level\'s span.',
      cost: 'O(2^h)',
      waste: 'The array has room for every missing node: a chain 3000 deep would need 2³⁰⁰⁰ slots.',
    },
    pattern: {
      pick: 'tree-bfs',
      why: 'BFS level by level carrying positions (children 2p, 2p + 1), re-based so each level starts at 0; width = last + 1. O(n) time, O(width) queue.',
      not: [
        {
          id: 'tree-dfs',
          why: 'A DFS that files each value under its depth also works, but it reaches the levels out of order; BFS hands them out one at a time.',
        },
        { id: 'heap-patterns', why: 'The numbering is the array-heap layout, but nothing is ordered by value.' },
      ],
    },
    watch: {
      viz: 'TreeBfsViz',
      inputs: [
        { label: '[1, 3, 2, 5, 3, null, 9]', input: { mode: 'width', tree: [1, 3, 2, 5, 3, null, 9] } },
        { label: '[1, 3, 2, 5, null, null, 9, 6, null, 7]', input: { mode: 'width', tree: [1, 3, 2, 5, null, null, 9, 6, null, 7] } },
      ],
    },
    edges: ['One node: [1] → 1.', 'Holes in the middle: [1, 3, 2, 5, null, null, 9, 6, null, 7] → 7.', 'A right chain: [1, null, 2, null, 3] → 1.'],
  },
};
