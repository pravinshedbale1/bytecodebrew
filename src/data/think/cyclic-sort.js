/** Practice thinking walkthroughs: cyclic-sort (format: src/data/think/index.js). */

export default {
  'find-all-numbers-disappeared-in-an-array': {
    free: true,
    aha: 'Every number from 1 to n has its own seat: number v sits at index v − 1. Walk everyone to their seat, and the seats left without their own number are exactly the missing numbers.',
    asks: {
      read: 'Which words tie the values to the length of the array?',
      budget: 'The follow-up allows no extra array. What could remember "I have seen 5" instead?',
      observe: 'In [4, 3, 2, 7, 8, 2, 3, 1], if every number moved to index (number − 1), which seats would end up holding the wrong number?',
      brute: 'How would you check each of 1 … 8 without any trick, and what does that keep re-reading?',
      pattern: 'What can an array of length n do with values that are all between 1 and n?',
      watch: 'Watch each value walk to its seat, then read off the wrong seats.',
    },
    read: [
      {
        phrase: 'every one of them is between `1` and `n`',
        says: 'Values and positions have the same range, so every value can point at a position: value v ↔ index v − 1.',
      },
      {
        phrase: 'Some values may repeat, so some numbers in that range may be absent',
        says: 'Each extra copy takes the place of a missing number. The answer is "which numbers have no copy at all".',
      },
      { phrase: 'can you do it in O(n) time without extra space?', says: 'No "seen" array allowed: the array itself has to do the remembering.' },
    ],
    budget: { from: 'n ≤ 10⁵', n: 100000, aim: 'O(n), no extra array', note: 'Checking each number with a full scan is 10¹⁰ steps.' },
    observe: [
      {
        title: 'Each value already knows its seat',
        text: 'There are exactly n seats for the numbers 1 … n. Value 4 belongs at index 3, value 1 at index 0: no searching needed, the value itself says where it goes.',
        sketch: { kind: 'array', rows: [{ items: [4, 3, 2, 7, 8, 2, 3, 1], tags: { '0': [['→ seat 3', 'accent']], '7': [['→ seat 0', 'accent']] } }] },
      },
      {
        title: 'After seating everyone, the wrong seats tell the answer',
        text: 'Seat everyone and you get [1, 2, 3, 4, 3, 2, 7, 8]. Seats 4 and 5 should hold 5 and 6, but nobody came: 5 and 6 are missing.',
        sketch: {
          kind: 'array',
          rows: [
            {
              label: 'after seating',
              items: [1, 2, 3, 4, 3, 2, 7, 8],
              marks: { '4': 'bad', '5': 'bad' },
              tags: { '4': [['5?', 'danger']], '5': [['6?', 'danger']] },
            },
          ],
        },
      },
      {
        title: 'A second copy finds its seat taken, and just stays',
        text: 'When the second 2 tries to go to seat 1, a 2 is already there. Swapping would change nothing (and loop forever), so it waits in whatever seat it is in.',
        sketch: {
          kind: 'array',
          rows: [{ items: [1, 2, 3, 4, 3, 2, 7, 8], marks: { '1': 'hit', '5': 'target' } }],
          caption: 'seat 1 already has its 2; the spare 2 sits in seat 5',
        },
      },
    ],
    brute: {
      idea: 'For every k from 1 to n, scan the whole array for k; if it is not there, k is missing.',
      cost: 'O(n²)',
      waste: 'For each of the 8 numbers it re-reads all 8 values: 64 reads to learn what one round of seating shows at a glance.',
    },
    pattern: {
      pick: 'cyclic-sort',
      why: 'Values 1 … n match seats 0 … n − 1, so the array can sort itself by swapping each value into its seat: O(n) with no extra memory. Afterwards, a seat i that doesn\'t hold i + 1 means i + 1 is missing.',
      not: [
        { id: 'hashing', why: 'A set of seen values is the natural first answer, but it uses O(n) extra memory, which the follow-up forbids.' },
        { id: 'sorting-and-selection', why: 'A normal sort costs O(n log n) and ignores the fact that each value already tells you its position.' },
      ],
    },
    watch: { viz: 'CyclicSortViz', inputs: [{ label: '[4, 3, 2, 7, 8, 2, 3, 1]', input: { range: 'one', arr: [4, 3, 2, 7, 8, 2, 3, 1] } }] },
    edges: ['No repeats: [1, 2, 3] → [].', 'All the same: [2, 2, 2] → [1, 3].', 'A single value: [1] → [].'],
  },

  'set-mismatch': {
    aha: 'Seat every number at index (number − 1). Exactly one seat ends up wrong: the number sitting in it is the duplicate, and the number that seat was waiting for is the missing one.',
    asks: {
      observe: 'In [1, 2, 2, 4], which seat never gets its own number, and who is sitting there instead?',
      pattern: 'One number appears twice and one is missing, all between 1 and n. What does a wrong seat tell you?',
      watch: 'Watch the values find their seats; the one wrong seat holds both answers.',
      read: 'Which phrase gives every number a home seat, and what does the "one twice, one missing" phrase predict about the seats?',
      budget: 'Counting each value with a full scan: how many steps for 10⁴ values?',
      brute: 'What is the most direct way to find both numbers, and what does it rescan?',
    },
    read: [
      { phrase: 'contain each number from `1` to `n` exactly once', says: 'Numbers and seats match one to one: every number has a home seat.' },
      {
        phrase: 'one value now appears twice and one value is missing',
        says: 'After seating, exactly one seat will be wrong, and it holds both answers at once.',
      },
      { phrase: 'Return an array `[repeated, missing]`', says: 'Mind the order: the duplicate first.' },
    ],
    budget: { from: 'nums.length ≤ 10⁴', n: 10000, aim: 'O(n)', note: 'Counting each number with a full scan is 10⁸ steps: slow and unnecessary.' },
    observe: [
      {
        title: 'Seat 2 waits for a 3 that never comes',
        text: 'In [1, 2, 2, 4], seats 0, 1 and 3 hold 1, 2 and 4. Seat 2 should hold 3, but it holds the second 2.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'holds', items: [1, 2, 2, 4], marks: { '2': 'bad' } }, { label: 'should hold', items: [1, 2, 3, 4], marks: { '2': 'target' } }],
          caption: 'duplicate 2, missing 3',
        },
      },
      {
        title: 'Scrambled input works the same way',
        text: '[4, 2, 1, 2] seats itself into [1, 2, 2, 4]: the spare 2 can\'t go home (seat 1 is taken), so it ends up in the one seat nobody claims.',
        sketch: { kind: 'array', rows: [{ label: 'before', items: [4, 2, 1, 2] }, { label: 'after seating', items: [1, 2, 2, 4], marks: { '2': 'bad' } }] },
      },
    ],
    brute: {
      idea: 'For every v from 1 to n, count how many times it appears: twice means repeated, zero means missing.',
      cost: 'O(n²)',
      waste: 'Every count rescans the whole array; seating everyone once answers both questions together.',
    },
    pattern: {
      pick: 'cyclic-sort',
      why: 'Values 1 … n have home seats. Swap each value home; the single seat that ends up wrong holds the duplicate, and its index + 1 is the missing number. O(n) time, O(1) space.',
      not: [
        { id: 'hashing', why: 'A count array finds the 2 and the 0 in O(n), with O(n) extra memory.' },
        {
          id: 'math-for-interviews',
          why: 'Comparing the sum and the sum of squares with 1 … n also works in O(1) space, but the algebra is harder to get right under pressure.',
        },
      ],
    },
    watch: {
      viz: 'CyclicSortViz',
      inputs: [{ label: '[4, 2, 1, 2]', input: { range: 'one', arr: [4, 2, 1, 2] } }, { label: '[1, 2, 2, 4]', input: { range: 'one', arr: [1, 2, 2, 4] } }],
    },
    edges: ['[1, 1] → [1, 2].', '[2, 2] → [2, 1].', 'The duplicate is the largest value: [1, 3, 3] → [3, 2].'],
  },

  'find-missing-and-repeated-values': {
    aha: 'Read the grid row by row and it becomes an ordinary list of n² numbers from 1 to n², with one value twice and one missing: exactly Set Mismatch. Value v belongs in cell v − 1 (row (v − 1) / n, column (v − 1) % n); seat them all and the one wrong cell holds both answers.',
    asks: {
      observe: 'Number the cells 0, 1, 2, 3 row by row. Which cell should hold the value 4 in [[1, 3], [2, 2]]?',
      pattern: 'Have you met "one number twice, one missing, values 1 … N" before, in a plain array?',
      read: 'Which two phrases describe a problem you have already solved, just drawn as a grid?',
      budget: 'The grid has at most 2500 cells. Does speed decide anything here?',
      brute: 'What is the most direct count, and how many times does it read the grid?',
      watch: 'Read row by row, [[1, 3], [2, 2]] is [1, 3, 2, 2]. Which cell will end up wrong?',
    },
    read: [
      { phrase: 'whose values are between `1` and `n²`', says: 'n² cells and values 1 … n²: every value has its own cell.' },
      {
        phrase: 'one number `a` appears twice and one number `b` does not appear at all',
        says: 'One duplicate, one missing: the same shape as Set Mismatch.',
      },
    ],
    budget: {
      from: 'n ≤ 50, so at most 2500 cells',
      n: 2500,
      aim: 'O(n²)',
      note: 'Small enough that a count array is fine; the point is to recognise the problem.',
    },
    observe: [
      {
        title: 'The grid is a list in disguise',
        text: 'Cell k is grid[k / n][k % n]. Read [[1, 3], [2, 2]] row by row: [1, 3, 2, 2].',
        sketch: {
          kind: 'array',
          rows: [
            {
              label: 'cells 0 … 3',
              items: [1, 3, 2, 2],
              bands: [{ from: 0, to: 1, tone: 'ghost', label: 'row 0' }, { from: 2, to: 3, tone: 'accent', label: 'row 1' }],
            },
          ],
        },
      },
      {
        title: 'Seat the values, find the one wrong cell',
        text: 'Seating gives [1, 2, 3, 2]. Cell 3 should hold 4 but holds a spare 2: a = 2, b = 4.',
        sketch: { kind: 'array', rows: [{ label: 'after seating', items: [1, 2, 3, 2], marks: { '3': 'bad' }, tags: { '3': [['should be 4', 'danger']] } }] },
      },
    ],
    brute: {
      idea: 'For every v from 1 to n², count how many cells hold it.',
      cost: 'O(n⁴)',
      waste: 'Each count rescans the whole grid; one pass of seating (or one counting pass) is enough.',
    },
    pattern: {
      pick: 'cyclic-sort',
      why: 'Flatten the grid in your head (cell k ↔ row k / n, column k % n) and run the Set Mismatch seating: O(n²) time, O(1) space.',
      not: [
        { id: 'hashing', why: 'A count array of size n² + 1 is the easy answer, using O(n²) extra memory.' },
        { id: 'math-for-interviews', why: 'Sums and sums of squares work too, with more algebra.' },
      ],
    },
    watch: { viz: 'CyclicSortViz', inputs: [{ label: '[[1, 3], [2, 2]] read row by row', input: { range: 'one', arr: [1, 3, 2, 2] } }] },
    edges: [
      'The duplicate is 1: [[1, 1], [3, 4]] → [1, 2].',
      'The missing value is n²: [[1, 2], [3, 3]] → [3, 4].',
      'The missing value is 1: [[2, 2], [3, 4]] → [2, 1].',
    ],
  },

  'find-all-duplicates-in-an-array': {
    aha: 'Seat every number at index (number − 1). A second copy finds its seat already taken and stays where it is, so after seating, every seat holding the wrong number holds a duplicate.',
    asks: {
      observe: 'In [4, 3, 2, 7, 8, 2, 3, 1], where do the second 2 and the second 3 end up when their seats are already taken?',
      pattern: 'Values 1 … n, each once or twice, and no extra memory. What can the array itself remember?',
      read: 'Which phrase gives every value a seat, and which one rules out a set?',
      budget: 'n is up to 10⁵ and extra memory must be O(1). What does that leave?',
      brute: 'What is the simplest correct method that uses no extra memory, and how slow is it?',
      watch: 'In [4, 3, 2, 7, 8, 2, 3, 1], which seats will end up holding the spare copies?',
    },
    read: [
      { phrase: 'each between `1` and `n`', says: 'Every value has a seat at index value − 1.' },
      { phrase: 'every value appears either once or twice', says: 'A value is a duplicate exactly when its seat is already taken by its twin.' },
      { phrase: 'use only constant extra space', says: 'No set: seat the values in place (or mark seats with a minus sign).' },
    ],
    budget: { from: 'n ≤ 10⁵', n: 100000, aim: 'O(n), O(1) extra space', note: 'Counting each value with a scan is 10¹⁰ steps.' },
    observe: [
      {
        title: 'After seating, spare copies sit in the empty seats',
        text: '[4, 3, 2, 7, 8, 2, 3, 1] seats itself into [1, 2, 3, 4, 3, 2, 7, 8]. Seats 4 and 5 hold a 3 and a 2: those are the spare copies.',
        sketch: {
          kind: 'array',
          rows: [
            {
              items: [1, 2, 3, 4, 3, 2, 7, 8],
              marks: { '4': 'bad', '5': 'bad' },
              tags: { '4': [['spare 3', 'danger']], '5': [['spare 2', 'danger']] },
            },
          ],
        },
      },
      {
        title: 'Or mark seats with a minus sign',
        text: 'For each value v, look at seat |v| − 1. Positive: make it negative ("v seen once"). Already negative: v has been seen before, so it is a duplicate. Nothing moves.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'after reading 4, 3, 2, 7, 8', items: [4, -3, -2, -7, 8, 2, -3, -1], marks: { '1': 'target' } }],
          caption: 'the next value, 2, finds seat 1 already negative: 2 is a duplicate',
        },
      },
    ],
    brute: {
      idea: 'For every v from 1 to n, count its copies with a full scan.',
      cost: 'O(n²)',
      waste: 'Every value is re-counted from scratch, though one seat per value can record "seen".',
    },
    pattern: {
      pick: 'cyclic-sort',
      why: 'The array is its own "seen" table: seat each value at index value − 1 (or mark that seat negative). Copies that can\'t take their seat are the duplicates. O(n) time, O(1) space.',
      not: [
        { id: 'hashing', why: 'A set of seen values is simplest, but uses O(n) memory, which the statement forbids.' },
        { id: 'sorting-and-selection', why: 'Sorting puts copies side by side, at O(n log n).' },
      ],
    },
    watch: { viz: 'CyclicSortViz', inputs: [{ label: '[4, 3, 2, 7, 8, 2, 3, 1]', input: { range: 'one', arr: [4, 3, 2, 7, 8, 2, 3, 1] } }] },
    edges: ['No duplicates: [1, 2, 3] → [].', 'Every value twice: [1, 1, 2, 2] → [1, 2].', 'A single value: [1] → [].'],
  },

  'array-nesting': {
    aha: 'Following "go to index nums[k]" from any start walks round a loop and comes back to the start. The loops never share an index, so walk each loop once and keep the longest.',
    asks: {
      observe: 'Start at index 0 of [5, 4, 0, 3, 1, 6, 2] and keep jumping to nums[k]. Which indexes do you visit before you are back at 0?',
      pattern: 'If two starting indexes lie on the same loop, can they give sets of different sizes?',
      read: 'Which phrase tells you every index has exactly one arrow in and one arrow out? What shapes can such arrows make?',
      budget: 'If you walked the loop again from every start, how much work could one big loop of 10⁵ cost?',
      brute: 'What is the most direct method, and how many times does it walk the same loop?',
      watch: 'In [5, 4, 0, 3, 1, 6, 2], how many separate loops are there, and which is longest?',
    },
    read: [
      {
        phrase: '`nums` is a permutation of the numbers `0` to `n − 1`',
        says: 'Every index has exactly one arrow out (to nums[k]) and exactly one arrow in. Arrows like that can only form separate loops.',
      },
      { phrase: 'adding values until the next one would be a repeat', says: 'You stop exactly when the loop closes: the set is one whole loop.' },
      { phrase: 'the size of the largest such set', says: 'The answer is the length of the longest loop.' },
    ],
    budget: {
      from: 'nums.length ≤ 10⁵',
      n: 100000,
      aim: 'O(n)',
      note: 'Walking the loop again from every start is O(n²): one big loop of 10⁵ would be walked 10⁵ times.',
    },
    observe: [
      {
        title: 'Follow the arrows from index 0',
        text: '0 → 5 → 6 → 2 → back to 0. That loop has 4 indexes, so the set from index 0 has 4 values.',
        sketch: {
          kind: 'array',
          rows: [
            {
              items: [5, 4, 0, 3, 1, 6, 2],
              marks: { '0': 'hit', '2': 'hit', '5': 'hit', '6': 'hit' },
              tags: { '0': [['1st', 'success']], '2': [['4th', 'success']], '5': [['2nd', 'success']], '6': [['3rd', 'success']] },
            },
          ],
        },
      },
      {
        title: 'Every index on a loop gives the same set',
        text: 'Starting at 5 visits 5 → 6 → 2 → 0: the same four indexes. So once a loop is measured, its indexes never need walking again.',
        sketch: {
          kind: 'array',
          rows: [{ items: [5, 4, 0, 3, 1, 6, 2], marks: { '0': 'muted', '2': 'muted', '5': 'muted', '6': 'muted' } }],
          caption: 'already measured: skip them',
        },
      },
      {
        title: 'The other loops are separate',
        text: 'The remaining indexes form their own loops: 1 → 4 → 1 (length 2) and 3 → 3 (length 1). No index is on two loops, so the loops can be measured one after another, and the longest is 4.',
        sketch: {
          kind: 'array',
          rows: [
            {
              items: [5, 4, 0, 3, 1, 6, 2],
              marks: { '1': 'target', '3': 'kept', '4': 'target' },
              tags: { '1': [['loop of 2', 'warn']], '3': [['loop of 1', 'accent']] },
            },
          ],
        },
      },
    ],
    brute: {
      idea: 'From every start index, follow the arrows until you return, counting steps.',
      cost: 'O(n²)',
      waste: 'The loop 0 → 5 → 6 → 2 is walked four times, once from each of its members.',
    },
    pattern: {
      pick: 'cyclic-sort',
      why: 'A permutation splits into separate loops (cycles). Walk each loop once, marking its indexes as visited, and keep the longest: every index is visited once, O(n).',
      not: [
        {
          id: 'graph-traversal',
          why: 'It is a graph, but every node has exactly one arrow out, so a plain "follow the arrow" loop replaces DFS or BFS.',
        },
        { id: 'union-find', why: 'Joining i with nums[i] finds the loops too, with more machinery than needed.' },
      ],
    },
    watch: { viz: 'CycleWalkViz', inputs: [{ label: '[5, 4, 0, 3, 1, 6, 2]', input: { mode: 'nesting', nums: [5, 4, 0, 3, 1, 6, 2] } }] },
    edges: ['Already in place: [0, 1, 2] → 1.', 'One big loop: [1, 2, 0] → 3.', 'A single element: [0] → 1.'],
  },

  'minimum-number-of-operations-to-sort-a-binary-tree-by-level': {
    aha: 'Each level is just a list of distinct numbers to sort with swaps. The fewest swaps to sort a list is its length minus the number of loops formed by "where each value should go".',
    asks: {
      observe: 'Level 2 is [7, 6, 8, 5]. Where should each value go, and how many swaps does that take?',
      pattern: 'Once each level is a list, what is the smallest number of swaps that sorts a list of distinct values?',
      read: 'Which phrase lets you solve each level on its own, and which one guarantees each value has one correct position?',
      budget: 'A wide level can hold half of 10⁵ nodes. What happens with an O(n²) sort there?',
      brute: 'What is the simplest way to count swaps per level, and what does it rescan?',
      watch: 'For level [7, 6, 8, 5], how many swaps will the loop count predict?',
    },
    read: [
      { phrase: 'and swap their values', says: 'Swaps stay inside one level, so every level is solved on its own and the answers add up.' },
      { phrase: 'the minimum number of operations', says: 'Not just any sort: the fewest swaps.' },
      { phrase: 'whose values are all distinct', says: 'Each value has exactly one correct position in its sorted level.' },
    ],
    budget: {
      from: 'up to 10⁵ nodes',
      n: 100000,
      aim: 'O(n log n)',
      note: 'Sorting each level dominates. Selection sort per level would be O(n²) on a wide level.',
    },
    observe: [
      {
        title: 'Collect the tree level by level',
        text: 'The example\'s levels are [1], [4, 3], [7, 6, 8, 5] and [9, 10]. Each one is sorted separately.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'level 1', items: [4, 3] }, { label: 'level 2', items: [7, 6, 8, 5] }, { label: 'level 3', items: [9, 10] }],
        },
      },
      {
        title: 'Each value knows its target seat',
        text: 'Sorted, level 2 is [5, 6, 7, 8], so 7 belongs at index 2, 6 at 1, 8 at 3 and 5 at 0. Following "my seat is taken by…" gives loops: 0 → 2 → 3 → 0 (three values) and 1 alone.',
        sketch: {
          kind: 'array',
          rows: [
            {
              items: [7, 6, 8, 5],
              marks: { '0': 'target', '1': 'hit', '2': 'target', '3': 'target' },
              tags: { '0': [['→ 2', 'warn']], '2': [['→ 3', 'warn']], '3': [['→ 0', 'warn']] },
            },
          ],
          caption: 'a loop of 3 takes 2 swaps; 6 is already home',
        },
      },
      {
        title: 'Swaps = length − loops',
        text: 'Each swap puts at least one value home, and a loop of k values needs k − 1 swaps. Level 2: 4 − 2 = 2. Level 1: 2 − 1 = 1. Level 3: 0. Total 3.',
        sketch: { kind: 'array', rows: [{ label: 'swaps per level', items: [0, 1, 2, 0], marks: { '1': 'hit', '2': 'hit' } }], caption: '0 + 1 + 2 + 0 = 3' },
      },
    ],
    brute: {
      idea: 'Collect each level and selection-sort it, counting the swaps that move something.',
      cost: 'O(n²)',
      waste: 'Selection sort scans the rest of the level for every position; knowing each value\'s target lets you swap it straight there.',
    },
    pattern: {
      pick: 'cyclic-sort',
      why: 'A level-by-level walk collects the levels; then each value\'s target is its index in the sorted level, and swapping values to their targets (cyclic sort) uses exactly length − loops swaps, the minimum.',
      not: [
        { id: 'tree-bfs', why: 'Breadth-first search collects the levels, but counting the fewest swaps is the cyclic-sort part.' },
        { id: 'sorting-and-selection', why: 'Sorting tells you where values should go; it doesn\'t count the fewest swaps.' },
      ],
    },
    watch: { viz: 'CycleWalkViz', inputs: [{ label: 'the example tree', input: { mode: 'levels', s: '1 | 4, 3 | 7, 6, 8, 5 | 9, 10' } }] },
    edges: ['A single node → 0.', 'Every level already sorted → 0.', 'A level in reverse order, [3, 2, 1] → 1 (swap 3 and 1).'],
  },

  'couples-holding-hands': {
    aha: 'Fix the seat pairs from left to right: if the person next to you isn\'t your partner, swap your partner into that seat. Each swap seats at least one couple, and no plan can do with fewer.',
    asks: {
      observe: 'In [0, 2, 1, 3], who sits next to person 0, and who should?',
      pattern: 'Why is it always safe to fix the leftmost seat pair right away, without planning ahead?',
      read: 'Which phrase gives you a one-line formula for anyone\'s partner, and which one fixes the seat pairs?',
      budget: 'At most 60 seats. Is speed the difficulty, or is it something else?',
      brute: 'What search is certainly correct, and how many arrangements could it visit?',
      watch: 'In [0, 2, 1, 3], which swap will the greedy make, and how many swaps in total?',
    },
    read: [
      { phrase: 'the couples are `(0, 1)`, `(2, 3)`', says: 'Partners differ only in the last bit: the partner of x is x ^ 1 (0 ↔ 1, 2 ↔ 3, …).' },
      { phrase: 'any two people stand up and exchange seats', says: 'Any swap is allowed, not just neighbours.' },
      {
        phrase: 'meaning in seats `2j` and `2j + 1` for some `j`',
        says: 'The seat pairs are fixed: (0, 1), (2, 3), …. Each pair must end up holding one couple.',
      },
    ],
    budget: { from: 'at most 60 seats', n: 60, aim: 'O(n)', note: 'Tiny input; the challenge is knowing the greedy is optimal, not speed.' },
    observe: [
      {
        title: 'Look at the seat pairs',
        text: 'In [0, 2, 1, 3], seat pair 0 holds 0 and 2, and seat pair 1 holds 1 and 3. Neither pair is a couple.',
        sketch: {
          kind: 'array',
          rows: [
            {
              items: [0, 2, 1, 3],
              bands: [{ from: 0, to: 1, tone: 'danger', label: 'pair 0' }, { from: 2, to: 3, tone: 'danger', label: 'pair 1' }],
            },
          ],
        },
      },
      {
        title: 'Keep the left person, bring the partner',
        text: 'Person 0\'s partner is 1, sitting in seat 2. Swap them into seat 1: [0, 1, 2, 3]. One swap fixed both pairs.',
        sketch: {
          kind: 'array',
          rows: [
            {
              items: [0, 1, 2, 3],
              bands: [{ from: 0, to: 1, tone: 'success' }, { from: 2, to: 3, tone: 'success' }],
              marks: { '1': 'hit', '2': 'hit' },
            },
          ],
        },
      },
      {
        title: 'Why it is the minimum',
        text: 'Link seat pairs that share a split couple. They form loops; a loop of k seat pairs needs exactly k − 1 swaps, and each greedy swap removes one pair from its loop. So the answer is couples − loops.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'seat pairs', items: ['0, 2', '1, 3'], marks: { '0': 'target', '1': 'target' } }],
          caption: '2 pairs in one loop → 2 − 1 = 1 swap',
        },
      },
    ],
    brute: {
      idea: 'Search over all sequences of swaps (breadth-first) until everyone is seated with their partner.',
      cost: 'O((2n)!)',
      waste: 'It explores countless arrangements, though a simple rule is always optimal.',
    },
    pattern: {
      pick: 'cyclic-sort',
      why: 'It is a loop-counting problem in disguise: seat pairs linked by split couples form loops, and a loop of k pairs takes k − 1 swaps. The greedy "bring my partner here" makes exactly those swaps. O(n) with a person → seat index.',
      not: [
        { id: 'greedy', why: 'The rule is greedy, but the reason it is optimal is the loop count.' },
        { id: 'union-find', why: 'Joining the couples that share a seat pair also counts the loops: couples − groups.' },
      ],
    },
    watch: {
      viz: 'CycleWalkViz',
      inputs: [
        { label: '[0, 2, 1, 3]', input: { mode: 'couples', row: [0, 2, 1, 3] } },
        { label: '[0, 2, 4, 1, 3, 5]', input: { mode: 'couples', row: [0, 2, 4, 1, 3, 5] } },
      ],
    },
    edges: [
      'Everyone already beside their partner, [1, 0, 3, 2] → 0.',
      'Partners in either order count, [3, 2, 0, 1] → 0.',
      'Three couples tangled, [0, 2, 4, 1, 3, 5] → 2.',
    ],
  },
};
