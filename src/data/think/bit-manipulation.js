/** Practice thinking walkthroughs: bit-manipulation (format: src/data/think/index.js). */

export default {
  'single-number': {
    free: true,
    aha: 'XOR a value with itself and you get 0; XOR anything with 0 and it is unchanged. So XOR every number together: each pair cancels itself out, wherever its two copies are, and only the single value is left. One int, one pass.',
    asks: {
      read: 'What does the extra-space limit rule out?',
      budget: '3 × 10⁴ numbers and O(1) extra space. What can you keep?',
      observe: 'In [4, 1, 2, 1, 2], what happens to the two 1s if you "toggle" them in and out?',
      brute: 'Counting with a hash map works. Why isn\'t it allowed?',
      pattern: 'Which operation undoes itself when applied twice?',
      watch: 'Watch x collect values and drop them when their twin arrives.',
    },
    read: [
      {
        phrase: 'Every value in `nums` appears exactly twice, except for one value that appears once',
        says: 'Pairs plus one: something that cancels pairs leaves the single.',
      },
      { phrase: 'Use O(n) time and O(1) extra space', says: 'No map, no sorting copy: one running value.' },
      {
        phrase: 'Think about an operation that cancels a value with itself',
        says: 'XOR is that operation: v ^ v = 0 (a value cancels itself) and v ^ 0 = v (zero changes nothing). XOR everything and the pairs vanish.',
      },
    ],
    budget: {
      from: 'n ≤ 3 × 10⁴, O(1) space',
      rows: [
        ['hash map of counts', 'O(n) space', 'bad', 'breaks the limit'],
        ['sort, then scan pairs', 'O(n log n)', 'bad', 'too slow by the rule'],
        ['XOR everything', 'O(n), O(1)', 'ok', 'fits'],
      ],
      aim: 'O(n) time, O(1) space',
      note: 'Order doesn\'t matter: XOR is commutative.',
    },
    observe: [
      {
        title: 'Pairs vanish wherever they are',
        text: 'XOR doesn\'t care about order, so 4 ^ 1 ^ 2 ^ 1 ^ 2 can be regrouped as 4 ^ (1 ^ 1) ^ (2 ^ 2) = 4 ^ 0 ^ 0 = 4. The pairs never need to be next to each other.',
        sketch: { kind: 'array', rows: [{ items: [4, 1, 2, 1, 2], marks: { '0': 'hit', '1': 'dim', '2': 'dim', '3': 'dim', '4': 'dim' } }], caption: '= 4' },
      },
      {
        title: 'Column by column',
        text: 'XOR works bit by bit: a column ends up 1 only if an odd number of values have a 1 there. Each pair adds two 1s to its columns: even, so nothing.',
        sketch: {
          kind: 'array',
          rows: [{ label: '1', items: [0, 0, 1] }, { label: '1', items: [0, 0, 1] }, { label: 'xor', items: [0, 0, 0], marks: { '2': 'bad' } }],
        },
      },
    ],
    brute: {
      idea: 'Count each value in a hash map and return the one with count 1.',
      cost: 'O(n)',
      waste: 'Correct and fast, but it stores up to n / 2 + 1 entries; XOR keeps only the parity, which is all the question needs.',
    },
    pattern: {
      pick: 'bit-manipulation',
      why: 'x = 0; for v in nums: x ^= v; return x. O(n), O(1).',
      not: [
        { id: 'hashing', why: 'Counting works but needs O(n) memory, which the statement forbids.' },
        { id: 'sorting-and-selection', why: 'Sorting puts pairs side by side, but costs O(n log n).' },
      ],
    },
    watch: {
      viz: 'BitsViz',
      inputs: [{ label: '[4, 1, 2, 1, 2]', input: { mode: 'single', a: [4, 1, 2, 1, 2] } }, { label: '[2, 2, 1]', input: { mode: 'single', a: [2, 2, 1] } }],
    },
    edges: ['One number: [1] → 1.', '[2, 2, 1] → 1.', 'Zero can be the single: [0, 3, 3] → 0.'],
    why: 'One running XOR over the array: every pair cancels to 0 and the single value is what remains. x = 0; for v in nums: x ^= v. O(n) time, O(1) space.',
  },

  'number-of-1-bits': {
    aha: 'n & (n − 1) turns off exactly the lowest 1-bit: subtracting 1 flips that bit and every 0 below it, and the AND clears all the flipped columns. Repeat until n is 0 and count the rounds: one round per 1-bit, not one per position.',
    asks: {
      read: 'How are negative numbers counted?',
      budget: 'A 32-bit number. Is checking all 32 positions acceptable? Can you do fewer?',
      observe: 'What does 52 − 1 look like next to 52 in binary?',
      brute: 'Checking each of the 32 bits with a mask: how many steps for 128?',
      pattern: 'What does n & (n − 1) do to n?',
      watch: 'Watch each round remove the lowest 1.',
    },
    read: [
      { phrase: 'Return the number of `1` bits in the 32-bit binary representation of `n`', says: 'Count set bits: Hamming weight.' },
      {
        phrase: 'Negative inputs are counted by their 32-bit two\'s-complement pattern',
        says: 'Work on the bits, not the sign: use >>> or a loop of exactly 32 steps, or n & (n − 1), which also works on negatives.',
      },
    ],
    budget: {
      from: '32-bit n',
      rows: [['check all 32 positions', '32', 'ok', 'fine'], ['n & (n − 1) loop', 'number of 1s', 'ok', 'fewer steps']],
      aim: 'O(number of 1-bits)',
      note: 'Integer.bitCount does it in a few instructions.',
    },
    observe: [
      {
        title: 'n − 1 flips the lowest 1 and below',
        text: '52 = 110100. 51 = 110011: the lowest 1 (worth 4) turned off and the two 0s below it turned on. Everything left of it is unchanged.',
        sketch: {
          kind: 'array',
          rows: [
            { label: '52', items: [1, 1, 0, 1, 0, 0], marks: { '3': 'cur', '4': 'cur', '5': 'cur' } },
            { label: '51', items: [1, 1, 0, 0, 1, 1], marks: { '3': 'cur', '4': 'cur', '5': 'cur' } },
          ],
        },
      },
      {
        title: 'AND keeps only the agreeing columns',
        text: '52 & 51 = 110000 = 48: the lowest 1 is gone, the other 1s untouched. Three rounds empty 52, so it has three 1s.',
        sketch: {
          kind: 'array',
          rows: [{ label: '52 & 51', items: [1, 1, 0, 0, 0, 0], marks: { '0': 'hit', '1': 'hit' } }],
          caption: 'one 1 removed per round',
        },
      },
    ],
    brute: {
      idea: 'For each of the 32 positions, test (n >>> k) & 1 and add it up.',
      cost: 'O(32)',
      waste: 'Positions holding 0 are visited for nothing; 128 has one 1 but costs 32 checks.',
    },
    pattern: {
      pick: 'bit-manipulation',
      why: 'count = 0; while (n != 0) { n &= n − 1; count++; }. O(number of 1s). For negatives in Java the loop still ends, because n & (n − 1) only ever clears bits.',
      not: [
        { id: 'math-for-interviews', why: 'Dividing by 2 and checking the remainder fails for negative numbers (the sign bit is never reached).' },
        { id: 'dp-linear', why: 'A table of counts helps when counting for every number up to n (Counting Bits), not for one number.' },
      ],
    },
    watch: { viz: 'BitsViz', inputs: [{ label: '52', input: { mode: 'popcount', n: 52 } }, { label: '128', input: { mode: 'popcount', n: 128 } }] },
    edges: ['n = 11 (1011) → 3.', 'n = 128 → 1.', 'n = −1 (32 ones) → 32.'],
  },

  'power-of-two': {
    aha: 'A power of two is a single 1-bit followed by zeros. n − 1 flips that 1 and every bit below it, so n & (n − 1) is 0 exactly when n had one 1-bit. Reject n ≤ 0 first: zero and negatives are never powers of two.',
    asks: {
      read: 'Which values are rejected before any bit work?',
      budget: 'One number. Can you answer without a loop?',
      observe: 'What do 16 and 6 look like in binary?',
      brute: 'Dividing by 2 while even: how many steps for 2³⁰?',
      pattern: 'What is special about the 1-bits of a power of two?',
      watch: 'Watch n & (n − 1) clear the only 1, or leave others behind.',
    },
    read: [
      {
        phrase: 'Zero and negative numbers are not powers of two',
        says: '0 and negatives are never powers of two, and the bit trick would wrongly accept 0 (0 & −1 = 0), so check n > 0 first.',
      },
      { phrase: 'A power of two has exactly one 1 bit in binary', says: 'One 1-bit: n & (n − 1) removes it and leaves 0.' },
    ],
    budget: {
      from: '32-bit n',
      rows: [['divide by 2 repeatedly', 'up to 31 steps', 'ok', 'fine'], ['n & (n − 1)', '1 step', 'ok', 'instant']],
      aim: 'O(1)',
      note: 'Also: (n & −n) == n.',
    },
    observe: [
      {
        title: '16 is one 1-bit',
        text: '16 = 10000 and 16 − 1 = 15 = 01111: subtracting 1 turned the single 1 into 0 and the zeros below it into 1s. They share no 1 bit, so 16 & 15 = 0.',
        sketch: {
          kind: 'array',
          rows: [
            { label: '16', items: [1, 0, 0, 0, 0] },
            { label: '15', items: [0, 1, 1, 1, 1] },
            { label: 'AND', items: [0, 0, 0, 0, 0], marks: { '0': 'hit', '1': 'hit', '2': 'hit', '3': 'hit', '4': 'hit' } },
          ],
        },
      },
      {
        title: '6 has two',
        text: '6 = 110 and 5 = 101: subtracting 1 only changed the lowest 1 and below, so the higher 1 survives. 6 & 5 = 100 = 4 ≠ 0: more than one 1 bit, not a power of two.',
        sketch: { kind: 'array', rows: [{ label: '6 & 5', items: [1, 0, 0], marks: { '0': 'bad' } }] },
      },
    ],
    brute: {
      idea: 'While n is even, divide by 2; it is a power of two if you end at 1.',
      cost: 'O(log n)',
      waste: 'Each division just shifts the lowest 1 down; one AND checks whether there is more than one.',
    },
    pattern: {
      pick: 'bit-manipulation',
      why: 'return n > 0 && (n & (n − 1)) == 0. O(1).',
      not: [
        { id: 'math-for-interviews', why: 'log₂(n) and a rounding check is fragile with floating point.' },
        { id: 'hashing', why: 'A set of the 31 powers works but is silly next to one AND.' },
      ],
    },
    watch: { viz: 'BitWalkViz', inputs: [{ label: 'n = 16', input: { mode: 'pow2', n: 16 } }, { label: 'n = 6', input: { mode: 'pow2', n: 6 } }] },
    edges: ['n = 1 → true (2⁰).', 'n = 0 → false.', 'n = −16 → false.'],
    why: 'n − 1 flips the lowest 1 bit and everything below it, so n & (n − 1) erases exactly the lowest 1. It is 0 only when there was a single 1: return n > 0 && (n & (n − 1)) == 0. O(1).',
  },

  'missing-number': {
    aha: 'XOR together every index 0 … n − 1, every value, and n itself. A number that is present goes in twice (once as an index or n, once as a value) and cancels; the missing number goes in once and is what\'s left. The sum formula works too, but XOR can\'t overflow.',
    asks: {
      read: 'Which range do the numbers come from, and how many are missing?',
      budget: '10⁴ numbers and O(1) space. What can you keep?',
      observe: 'For [3, 0, 1], which numbers of 0..3 appear as indexes or n, and which as values?',
      brute: 'Checking each candidate 0..n against the array: what does it cost?',
      pattern: 'How can each present number be paired with itself?',
      watch: 'Watch indexes and values cancel in pairs.',
    },
    read: [
      {
        phrase: '`nums` contains `n` distinct numbers taken from the range `0` to `n`',
        says: 'n + 1 candidates, n present: pair indexes 0..n − 1 and n against the values.',
      },
      {
        phrase: 'Use O(n) time and O(1) extra space',
        says: 'O(1) space rules out a set or a seen-array. One running value must do it: an XOR (or a sum) of everything.',
      },
      { phrase: 'XOR gives the same result without any risk of overflow', says: 'XOR index, value and n together.' },
    ],
    budget: {
      from: 'n ≤ 10⁴, O(1) space',
      rows: [['search for each candidate', 'n² = 10⁸', 'bad', 'slow'], ['XOR (or sum) once', '10⁴', 'ok', 'instant']],
      aim: 'O(n) time, O(1) space',
      note: 'Cyclic sort also works in O(n) by moving values to their index.',
    },
    observe: [
      {
        title: 'Everything present appears twice',
        text: '[3, 0, 1]: indexes 0, 1, 2 plus n = 3 give 0, 1, 2, 3; values give 3, 0, 1. Only 2 appears once.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'indexes + n', items: [0, 1, 2, 3], marks: { '2': 'hit' } }, { label: 'values', items: [3, 0, 1] }],
          caption: 'missing: 2',
        },
      },
      {
        title: 'The sum view',
        text: '0 + 1 + 2 + 3 = 6, and the values add to 4: 6 − 4 = 2. XOR is the same idea, with cancelling instead of subtracting.',
        sketch: { kind: 'array', rows: [{ items: ['6 − 4', '= 2'], marks: { '1': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'For each candidate 0..n, scan the array to see whether it is there.',
      cost: 'O(n²)',
      waste: 'Each scan rediscovers the same values; one pass that cancels each present number does it all.',
    },
    pattern: {
      pick: 'bit-manipulation',
      why: 'x = n; for i: x ^= i ^ nums[i]; return x. O(n), O(1).',
      not: [
        { id: 'cyclic-sort', why: 'Placing each value at its index finds the gap in O(n) too, but it moves the array around.' },
        { id: 'math-for-interviews', why: 'n(n + 1)/2 − sum is fine in Java for n ≤ 10⁴, but can overflow for large n; XOR can\'t.' },
      ],
    },
    watch: {
      viz: 'BitsViz',
      inputs: [
        { label: '[3, 0, 1]', input: { mode: 'missing', a: [3, 0, 1] } },
        { label: '[9, 6, 4, 2, 3, 5, 7, 0, 1]', input: { mode: 'missing', a: [9, 6, 4, 2, 3, 5, 7, 0, 1] } },
      ],
    },
    edges: ['n itself missing: [0, 1] → 2.', 'Zero missing: [1] → 0.', '[9, 6, 4, 2, 3, 5, 7, 0, 1] → 8.'],
    why: 'Start with x = n, then XOR in every index i and every value nums[i]. Each present number appears twice (once as an index, once as a value) and cancels; the missing one appears once and remains. O(n), O(1).',
  },

  'counting-bits': {
    aha: 'i >> 1 is i with its last bit chopped off: a smaller number whose count you already know. So ans[i] = ans[i >> 1] + (i & 1), the chopped bit added back. One addition per number, filling the table from 0 up.',
    asks: {
      read: 'How long is the answer array?',
      budget: 'n up to 10⁵: is counting each number\'s bits separately OK? Can you do one step per number?',
      observe: 'How are the counts of 5 (101) and 2 (10) related?',
      brute: 'Popcount each number from scratch: what does it cost?',
      pattern: 'Which smaller number shares all but one bit with i?',
      watch: 'Watch each count built from the count of i >> 1.',
    },
    read: [
      { phrase: 'Return an array `ans` of length `n + 1`', says: 'One entry for every number 0..n: a table filled in order.' },
      { phrase: 'Aim for O(n) time', says: 'O(1) per number: reuse earlier answers.' },
      { phrase: '`ans[i] = ans[i >> 1] + (i & 1)`', says: 'The statement gives the recurrence: chop the last bit.' },
    ],
    budget: {
      from: 'n ≤ 10⁵',
      rows: [['popcount each number', '10⁵ × 17', 'ok', 'fine, but not O(n)'], ['ans[i >> 1] + (i & 1)', '10⁵', 'ok', 'O(n)']],
      aim: 'O(n)',
      note: 'ans[i & (i − 1)] + 1 is the other classic recurrence.',
    },
    observe: [
      {
        title: '5 is 2 with a 1 appended',
        text: '5 = 101, and 5 >> 1 = 10 = 2. The count of 5 is the count of 2 (one) plus the chopped bit (1): two.',
        sketch: {
          kind: 'array',
          rows: [{ label: '5', items: [1, 0, 1], marks: { '2': 'cur' } }, { label: '2', items: [1, 0] }],
          caption: 'ans[5] = ans[2] + 1 = 2',
        },
      },
      {
        title: 'Even numbers copy their half',
        text: '4 = 100 ends in 0, so chopping the last bit loses no 1s: ans[4] = ans[2] + 0 = 1. Every even number has the same count as its half.',
        sketch: { kind: 'array', rows: [{ label: 'ans', items: [0, 1, 1, 2, 1, 2], marks: { '2': 'hit', '4': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'For each i, count its 1-bits from scratch.',
      cost: 'O(n log n)',
      waste: 'Every number shares all but its last bit with i >> 1, whose count was already computed.',
    },
    pattern: {
      pick: 'bit-manipulation',
      why: 'ans[0] = 0; for i in 1..n: ans[i] = ans[i >> 1] + (i & 1). O(n).',
      not: [
        { id: 'dp-linear', why: 'It is a tiny DP; the bit view is what tells you which smaller entry to reuse.' },
        { id: 'math-for-interviews', why: 'Patterns by powers of two (the counts repeat with +1) work but are harder to code correctly.' },
      ],
    },
    watch: { viz: 'BitWalkViz', inputs: [{ label: 'n = 5', input: { mode: 'countbits', n: 5 } }, { label: 'n = 2', input: { mode: 'countbits', n: 2 } }] },
    edges: ['n = 0 → [0].', 'n = 2 → [0, 1, 1].', 'n = 5 → [0, 1, 1, 2, 1, 2].'],
    why: 'i >> 1 is i without its last bit, and it is smaller than i, so its count is already in the table. Add back the last bit: ans[i] = ans[i >> 1] + (i & 1), for i = 1 … n. O(n).',
  },

  'reverse-bits': {
    aha: 'Read n from its lowest bit up and push each bit onto the result from the right: res = (res << 1) | ((n >> k) & 1), 32 times. The first bit read travels furthest, to the top. Leading zeros count, so the loop always runs exactly 32 times.',
    asks: {
      read: 'How many bits does the input have? Do leading zeros count?',
      budget: '32 bits: how many steps?',
      observe: 'In 8 bits, where does the lowest 1 of 13 (00001101) end up?',
      brute: 'Converting to a string, reversing and parsing: what goes wrong with negatives?',
      pattern: 'How do you take bits off one end and push them onto another?',
      watch: 'Watch each bit taken from the bottom of n land at the mirror position.',
    },
    read: [
      { phrase: 'Reverse the order of the 32 bits of `n`', says: 'Exactly 32 iterations, one per bit.' },
      { phrase: 'Leading zeros count', says: 'Don\'t stop when n becomes 0: the zeros must be pushed too.' },
      { phrase: 'it can come out negative when the new top bit is 1', says: 'Use >>> or test bits with (n >> k) & 1; the sign is just bit 31.' },
    ],
    budget: {
      from: '32-bit n',
      rows: [['string: format, reverse, parse', '32 chars', 'ok', 'sign trouble'], ['bit by bit with shifts', '32 steps', 'ok', 'instant']],
      aim: 'O(32)',
      note: 'Swapping halves, then quarters, … (masks) does it in 5 steps.',
    },
    observe: [
      {
        title: 'Mirror positions',
        text: '13 = 00001101 in 8 bits. Reversed: 10110000 = 176. Bit 0 became bit 7, bit 2 became bit 5.',
        sketch: {
          kind: 'array',
          rows: [
            { label: '13', items: [0, 0, 0, 0, 1, 1, 0, 1], marks: { '7': 'cur' } },
            { label: '176', items: [1, 0, 1, 1, 0, 0, 0, 0], marks: { '0': 'hit' } },
          ],
        },
      },
      {
        title: 'Zeros matter',
        text: '1 reversed in 32 bits is 2³¹, the top bit: a negative int in Java. The 31 leading zeros all moved to the bottom.',
        sketch: { kind: 'array', rows: [{ items: ['0…01', '→', '10…0'], marks: { '2': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Format n as a 32-character binary string, reverse it, and parse it back.',
      cost: 'O(32)',
      waste: 'Same cost, but parsing a 32-bit string with a leading 1 overflows int; shifting avoids strings and the sign issue.',
    },
    pattern: {
      pick: 'bit-manipulation',
      why: 'res = 0; for k in 0..31: res = (res << 1) | ((n >> k) & 1). O(32).',
      not: [
        { id: 'two-pointers', why: 'Swapping bit i with bit 31 − i works with two pointers, but takes more masks than pushing bits.' },
        { id: 'math-for-interviews', why: 'Using % 2 and / 2 breaks on negative inputs.' },
      ],
    },
    watch: {
      viz: 'BitWalkViz',
      inputs: [{ label: 'n = 13 (8 bits)', input: { mode: 'reverse', n: 13 } }, { label: 'n = 1 (8 bits)', input: { mode: 'reverse', n: 1 } }],
    },
    edges: ['n = 0 → 0.', 'n = 1 → −2147483648 (only the top bit, read as a Java int).', 'All ones (−1) → −1.'],
    why: 'Build the result one bit at a time: shift it left and append bit k of n, for k = 0 … 31. Bit 0 of n ends up as bit 31 of the result. res = (res << 1) | ((n >> k) & 1). O(32).',
    not: { '1': [] },
  },

  'single-number-ii': {
    aha: 'Look at one bit column at a time. Every value seen three times adds 0 or 3 to the column\'s count of 1s; the single value adds 0 or 1. So count % 3 is exactly the single value\'s bit in that column. Put the 32 leftover bits together.',
    asks: {
      read: 'Why doesn\'t XOR work this time?',
      budget: '3 × 10⁴ numbers, O(1) space. Is 32 counters O(1)?',
      observe: 'For [2, 2, 3, 2], how many 1s are in each column?',
      brute: 'A hash map of counts: what does the space rule say?',
      pattern: 'Triples cancel modulo what?',
      watch: 'Watch the column counts grow, then reduce modulo 3.',
    },
    read: [
      {
        phrase: 'Every value in `nums` appears exactly three times, except for one value that appears exactly once',
        says: 'Cancel triples instead of pairs.',
      },
      { phrase: 'XOR alone doesn\'t work here', says: 'XOR cancels in twos; three copies leave one behind.' },
      { phrase: 'Count how many times each bit is set and take that count modulo 3', says: 'A counter per column, then % 3.' },
    ],
    budget: {
      from: 'n ≤ 3 × 10⁴',
      rows: [['hash map', 'O(n) space', 'bad', 'breaks the limit'], ['32 column counts', '32 × n', 'ok', '10⁶']],
      aim: 'O(32 · n) time, O(1) space',
      note: 'The "ones / twos" two-mask trick does it in one pass.',
    },
    observe: [
      {
        title: 'Count each column',
        text: '2 = 10, 3 = 11. Three 2s and one 3: the 2s column has 4 ones, the 1s column has 1.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'count', items: [4, 1] }, { label: '% 3', items: [1, 1], marks: { '0': 'hit', '1': 'hit' } }],
          caption: '11 = 3',
        },
      },
      {
        title: 'Triples disappear',
        text: 'Any column the triples set gets 3 more; 3 % 3 = 0. Only the single value\'s bits leave a remainder.',
        sketch: { kind: 'array', rows: [{ items: ['3 → 0', '4 → 1', '6 → 0'], marks: { '1': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Count every value in a hash map and return the one seen once.',
      cost: 'O(n)',
      waste: 'It stores every distinct value; the answer only needs 32 counts, one per bit.',
    },
    pattern: {
      pick: 'bit-manipulation',
      why: 'For each bit b in 0..31: c = number of values with bit b set; if c % 3 == 1, set bit b of the answer. O(32 · n), O(1).',
      not: [
        { id: 'hashing', why: 'Counting by value needs O(n) memory.' },
        { id: 'sorting-and-selection', why: 'Sorting groups the triples but costs O(n log n).' },
      ],
    },
    watch: {
      viz: 'BitWalkViz',
      inputs: [
        { label: '[2, 2, 3, 2]', input: { mode: 'single2', a: [2, 2, 3, 2] } },
        { label: '[5, 6, 5, 6, 9, 5, 6]', input: { mode: 'single2', a: [5, 6, 5, 6, 9, 5, 6] } },
      ],
    },
    edges: ['One number: [7] → 7.', '[2, 2, 3, 2] → 3.', 'Negative single: [−2, −2, 1, −2] → 1, and [1, 1, 1, −5] → −5 (the sign bit is one more column).'],
    not: { '0': [] },
  },

  'sum-of-two-integers': {
    aha: 'Add the way you do on paper, in two parts. a ^ b adds every column but drops carries (1 + 1 → 0). (a & b) << 1 is exactly the carries, each moved one column left. Now add those two the same way, until the carry is 0.',
    asks: {
      read: 'Which operators are forbidden?',
      budget: 'Values up to ±1000. How many rounds can the carry need?',
      observe: 'For 5 + 7 in binary, which columns produce a carry?',
      brute: 'Incrementing one by one with ++? Why is that not in the spirit (and slow)?',
      pattern: 'Which bit operation adds without carrying, and which one finds the carries?',
      watch: 'Watch the carry move left each round until it is gone.',
    },
    read: [
      { phrase: 'without using the `+` or `-` operators anywhere in your solution', says: 'Build addition from ^, & and <<.' },
      { phrase: 'think about how a computer adds two numbers in binary', says: 'Column sum = XOR, carry = AND, shifted left.' },
    ],
    budget: {
      from: '|a|, |b| ≤ 1000',
      rows: [['add 1 at a time', 'up to 1000 steps', 'bad', 'uses ++, still addition'], ['XOR / carry rounds', '≤ 32 rounds', 'ok', 'instant']],
      aim: 'O(32)',
      note: 'Each round pushes the lowest carry at least one column left.',
    },
    observe: [
      {
        title: 'XOR is the sum without carries',
        text: '5 = 101, 7 = 111. XOR = 010 = 2. Columns where both are 1 lost their 1 + 1.',
        sketch: {
          kind: 'array',
          rows: [
            { label: '5', items: [1, 0, 1], marks: { '0': 'bad', '2': 'bad' } },
            { label: '7', items: [1, 1, 1], marks: { '0': 'bad', '2': 'bad' } },
            { label: 'xor', items: [0, 1, 0] },
          ],
        },
      },
      {
        title: 'AND finds the carries',
        text: '5 & 7 = 101; shifted left: 1010 = 10. Now add 2 + 10 the same way: 8 and a carry of 4, then 12.',
        sketch: { kind: 'array', rows: [{ items: ['2 + 10', '8 + 4', '12 + 0'], marks: { '2': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Repeatedly increment a with a loop that runs b times (using ++).',
      cost: 'O(|b|)',
      waste: 'Even ignoring that ++ is addition in disguise, it handles one unit at a time instead of all bits at once.',
    },
    pattern: {
      pick: 'bit-manipulation',
      why: 'while (b != 0) { int carry = (a & b) << 1; a ^= b; b = carry; } return a. O(32), and two\'s complement makes negatives work unchanged in Java.',
      not: [
        { id: 'math-for-interviews', why: 'Using logarithms or exponentials (log(e^a · e^b)) is a float hack, not an answer.' },
        { id: 'design-data-structures', why: 'No structure needed: two ints.' },
      ],
    },
    watch: { viz: 'BitWalkViz', inputs: [{ label: '5 + 7', input: { mode: 'sum', a: 5, b: 7 } }, { label: '1 + 2', input: { mode: 'sum', a: 1, b: 2 } }] },
    edges: ['1 + 2 → 3 (no carry at all).', '5 + 7 → 12.', 'A negative: −2 + 3 → 1 (the carry runs off the top in Java ints and is dropped).'],
    not: { '1': [] },
  },

  'single-number-iii': {
    aha: 'XOR everything: pairs cancel and you get x = p ^ q for the two single values. They differ, so x has some 1-bit, and in that column p and q differ. Split all numbers by that bit: each pair stays together, and p and q land in different groups. XOR each group to get them.',
    asks: {
      read: 'How many values appear once, and what does XOR of everything give?',
      budget: 'O(n) time, O(1) space. How many passes?',
      observe: 'For [1, 2, 1, 3, 2, 5], what is the XOR of everything, and which bit separates 3 and 5?',
      brute: 'Counting with a map: why not?',
      pattern: 'XOR mixes the two singles together. What tells them apart?',
      watch: 'Watch the XOR, the splitting bit, then the two groups.',
    },
    read: [
      { phrase: 'exactly two values appear once and every other value appears exactly twice', says: 'XOR of all = p ^ q: pairs cancel.' },
      { phrase: 'Use O(n) time and O(1) extra space', says: 'A couple of XOR passes, no map.' },
      { phrase: 'Using that bit to split `nums` into two groups', says: 'x & −x gives a bit where p and q differ.' },
    ],
    budget: {
      from: 'n ≤ 3 × 10⁴, O(1) space',
      rows: [['hash map', 'O(n) space', 'bad', 'breaks the limit'], ['XOR, split, XOR', '2n', 'ok', 'instant']],
      aim: 'O(n), O(1)',
      note: 'x & −x isolates the lowest 1 of x.',
    },
    observe: [
      {
        title: 'Everything XOR-ed: 3 ^ 5',
        text: 'In [1, 2, 1, 3, 2, 5], XOR everything: 1 and 2 cancel, leaving 3 ^ 5 = 011 ^ 101 = 110 = 6. That isn\'t either answer, but every 1 bit in it is a place where 3 and 5 differ.',
        sketch: {
          kind: 'array',
          rows: [{ label: '3', items: [0, 1, 1] }, { label: '5', items: [1, 0, 1] }, { label: 'x', items: [1, 1, 0], marks: { '1': 'cur' } }],
        },
      },
      {
        title: 'Split on the 2s bit',
        text: 'The lowest 1 of 6 is the 2s bit. With it: 2, 3, 2 → XOR 3. Without it: 1, 1, 5 → XOR 5.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'bit set', items: [2, 3, 2], marks: { '1': 'hit' } }, { label: 'bit clear', items: [1, 1, 5], marks: { '2': 'hit' } }],
        },
      },
    ],
    brute: {
      idea: 'Count each value in a hash map and return the two seen once.',
      cost: 'O(n)',
      waste: 'It stores up to n / 2 + 2 counts; two XOR passes find both values with no extra memory.',
    },
    pattern: {
      pick: 'bit-manipulation',
      why: 'x = XOR of all; d = x & −x; p = XOR of the values with (v & d) != 0; q = x ^ p. O(n), O(1).',
      not: [
        { id: 'hashing', why: 'Counting works but uses O(n) memory.' },
        { id: 'sorting-and-selection', why: 'Sorting and scanning for unpaired values costs O(n log n).' },
      ],
    },
    watch: {
      viz: 'BitWalkViz',
      inputs: [
        { label: '[1, 2, 1, 3, 2, 5]', input: { mode: 'single3', a: [1, 2, 1, 3, 2, 5] } },
        { label: '[0, 1]', input: { mode: 'single3', a: [0, 1] } },
      ],
    },
    edges: ['Only the two: [0, 1] → [0, 1].', '[1, 2, 1, 3, 2, 5] → [3, 5].', 'Negatives: [−1, 0] → [−1, 0] (x & −x still works).'],
    not: { '0': [] },
  },

  'add-binary': {
    aha: 'Add the strings like decimal on paper, from the right, one column at a time with a carry: column sum = a digit + b digit + carry; write sum % 2, carry sum / 2. A carry left at the end becomes a leading 1. The numbers are far too long for any integer type.',
    asks: {
      read: 'How long can the strings be? Can you convert them to int?',
      budget: 'Up to 10⁴ digits. What does one pass cost?',
      observe: 'For "1011" + "111", which columns carry?',
      brute: 'Parsing both to a number and adding: what breaks?',
      pattern: 'What is the smallest state you carry from one column to the next?',
      watch: 'Watch each column add up, write a digit, and pass a carry left.',
    },
    read: [
      { phrase: '`a` and `b` are binary numbers written as strings of `0`s and `1`s', says: 'Work on the digits; the lengths may differ.' },
      { phrase: 'Return their sum, also as a binary string', says: 'Build the digits from the right, then reverse.' },
    ],
    budget: {
      from: 'lengths ≤ 10⁴',
      rows: [['parse to long', '64 bits max', 'bad', 'overflows'], ['column by column', '10⁴', 'ok', 'instant']],
      aim: 'O(max(len a, len b))',
      note: 'BigInteger works but hides the point.',
    },
    observe: [
      {
        title: '1 + 1 = 10',
        text: 'A column adding to 2 writes 0 and carries 1; adding to 3 (1 + 1 + carry) writes 1 and carries 1.',
        sketch: { kind: 'array', rows: [{ items: ['0 → 0', '1 → 1', '2 → 0, carry', '3 → 1, carry'], marks: { '2': 'cur', '3': 'cur' } }] },
      },
      {
        title: '"1011" + "111"',
        text: '11 + 7 = 18 = 10010. The carry ripples through the three right columns and out the top.',
        sketch: {
          kind: 'array',
          rows: [
            { label: 'a', items: ['', 1, 0, 1, 1] },
            { label: 'b', items: ['', '', 1, 1, 1] },
            { label: 'sum', items: [1, 0, 0, 1, 0], marks: { '0': 'hit' } },
          ],
        },
      },
    ],
    brute: {
      idea: 'Convert both strings to numbers, add, and convert back.',
      cost: 'O(n)',
      waste: 'Not slow, just wrong: the strings can be 10⁴ digits, far past the 63 bits of a long, so the numbers overflow. Column-by-column addition has no size limit.',
    },
    pattern: {
      pick: 'bit-manipulation',
      why: 'i, j at the ends, carry = 0; while i ≥ 0 or j ≥ 0 or carry: s = carry + a[i] + b[j]; append s % 2; carry = s / 2. Reverse. O(n).',
      not: [
        { id: 'math-for-interviews', why: 'It is grade-school addition; the only "math" is base 2.' },
        { id: 'two-pointers', why: 'Two indexes walk from the right, but they move together: there is no pointer decision to make.' },
      ],
    },
    watch: {
      viz: 'BitWalkViz',
      inputs: [
        { label: '"1011" + "111"', input: { mode: 'addbinary', a: '1011', b: '111' } },
        { label: '"1010" + "1011"', input: { mode: 'addbinary', a: '1010', b: '1011' } },
      ],
    },
    edges: ['"11" + "1" → "100".', '"0" + "0" → "0".', '"1010" + "1011" → "10101".'],
  },

  'bitwise-and-of-numbers-range': {
    aha: 'Counting from left to right, every bit below the first column where left and right differ must flip somewhere in the range, so some number has a 0 there and the AND is 0. Only the common prefix of left and right survives. Shift both right until they are equal, then shift back.',
    asks: {
      read: 'Which numbers are ANDed? Is the range ever huge?',
      budget: 'right − left can be 2³¹. Can you AND them one by one?',
      observe: 'For [5, 7], why is the 1s bit of the answer 0?',
      brute: 'AND every number in the range: how many steps at worst?',
      pattern: 'Which bits are the same in every number between left and right?',
      watch: 'Watch the differing low columns drop away, leaving the common prefix.',
    },
    read: [
      { phrase: 'return the bitwise AND of **every** integer in that range', says: 'A bit survives only if every number has it.' },
      { phrase: 'including both ends', says: 'left and right themselves are in the range.' },
    ],
    budget: {
      from: 'up to 2³¹ numbers',
      rows: [['AND each number', '2 × 10⁹', 'bad', 'too slow'], ['shift to the common prefix', '≤ 31 shifts', 'ok', 'instant']],
      aim: 'O(32)',
      note: 'Brian Kernighan variant: while right > left, right &= right − 1.',
    },
    observe: [
      {
        title: '[5, 7]: 101, 110, 111',
        text: 'The top bit is 1 in all three. The two lower bits each take both values in the range, so they AND to 0: 100 = 4.',
        sketch: {
          kind: 'array',
          rows: [
            { label: '5', items: [1, 0, 1] },
            { label: '6', items: [1, 1, 0] },
            { label: '7', items: [1, 1, 1] },
            { label: 'AND', items: [1, 0, 0], marks: { '0': 'hit' } },
          ],
        },
      },
      {
        title: 'Only the common prefix survives',
        text: '26 = 11010 and 30 = 11110 agree on "11" and differ next. Below that, everything flips within the range: answer 11000 = 24.',
        sketch: { kind: 'array', rows: [{ items: [1, 1, 0, 0, 0], marks: { '0': 'hit', '1': 'hit', '2': 'dim', '3': 'dim', '4': 'dim' } }], caption: '24' },
      },
    ],
    brute: {
      idea: 'AND every number from left to right.',
      cost: 'O(right − left)',
      waste: 'Once a low bit has flipped, it is 0 forever; only the shared high bits ever matter.',
    },
    pattern: {
      pick: 'bit-manipulation',
      why: 'shift = 0; while (left != right) { left >>= 1; right >>= 1; shift++; } return left << shift. O(32).',
      not: [
        { id: 'math-for-interviews', why: 'There is no formula over the values; the answer is about where their binary forms first differ.' },
        { id: 'binary-search', why: 'Searching for the highest differing bit works, but shifting finds it directly.' },
      ],
    },
    watch: {
      viz: 'BitWalkViz',
      inputs: [{ label: '[5, 7]', input: { mode: 'rangeand', left: 5, right: 7 } }, { label: '[26, 30]', input: { mode: 'rangeand', left: 26, right: 30 } }],
    },
    edges: ['One number: [7, 7] → 7.', 'Spanning a power of two: [1, 2147483647] → 0.', '[0, 0] → 0.'],
  },

  'minimum-array-end': {
    aha: 'The AND keeps a bit only if every number has it, so every number must contain all of x\'s 1-bits; its 0-bits are free slots. Numbers that contain x, listed from small to large, fill those free slots with 0, 1, 2, … in binary. So the smallest valid last number fills x\'s free slots with the bits of n − 1.',
    asks: {
      read: 'What must every number share with x? Must the numbers be consecutive?',
      budget: 'n and x up to 10⁸. Can you step through numbers one at a time?',
      observe: 'For x = 4 (100), which numbers keep that bit, in order?',
      brute: 'Start at x and repeatedly find the next number containing x: how many steps?',
      pattern: 'Numbers that contain x: what part of them can change, and how does it count?',
      watch: 'Watch the bits of n − 1 drop into x\'s free slots.',
    },
    read: [
      { phrase: 'whose bitwise AND of all elements equals `x`', says: 'Every number must contain every 1-bit of x.' },
      { phrase: 'is **strictly increasing**', says: 'Distinct numbers containing x, in order: the 0th, 1st, …, (n − 1)th.' },
      { phrase: 'Return the minimum possible value of `nums[n − 1]`', says: 'The (n − 1)th number that contains x, counting from x itself.' },
    ],
    budget: {
      from: 'n, x ≤ 10⁸',
      rows: [['step to the next valid number', 'up to n × gaps', 'bad', 'too slow'], ['fill free slots with n − 1', '≈ 60 bits', 'ok', 'instant']],
      aim: 'O(log n + log x)',
      note: 'Use a long: the answer can exceed 2³¹.',
    },
    observe: [
      {
        title: 'Numbers that contain 4',
        text: '4 = 100. Keeping that bit: 4, 5, 6, 7, 12, … The free slots (1s and 2s, then 8s …) count 0, 1, 2, 3, 4.',
        sketch: { kind: 'array', rows: [{ items: [4, 5, 6, 7, 12], marks: { '2': 'hit' } }], caption: 'n = 3: the third is 6' },
      },
      {
        title: 'Fill the slots with n − 1',
        text: 'n = 3, so n − 1 = 2 = 10. x = 100 has free slots at the 1s and 2s: write 0 into the 1s and 1 into the 2s: 110 = 6.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'x', items: [1, 0, 0], marks: { '1': 'cur', '2': 'cur' } }, { label: 'result', items: [1, 1, 0], marks: { '1': 'hit' } }],
        },
      },
    ],
    brute: {
      idea: 'Start at x; n − 1 times, move to the next number v with (v & x) == x.',
      cost: 'O(answer − x)',
      waste: 'It walks through every number in between; the valid ones are just a counter written into x\'s free slots.',
    },
    pattern: {
      pick: 'bit-manipulation',
      why: 'k = n − 1; res = x; for each 0-bit of x from the bottom: if k is odd, set that bit of res; k >>= 1. Stop when k = 0. O(log n + log x) with longs.',
      not: [
        { id: 'greedy', why: 'Building the array greedily (the next valid number each time) is correct but O(n) or worse.' },
        { id: 'math-for-interviews', why: 'It looks like arithmetic on n and x, but it is a bit placement, not a formula.' },
      ],
    },
    watch: {
      viz: 'BitWalkViz',
      inputs: [{ label: 'n = 3, x = 4', input: { mode: 'arrayend', n: 3, x: 4 } }, { label: 'n = 6, x = 9', input: { mode: 'arrayend', n: 6, x: 9 } }],
    },
    edges: ['n = 1 → x itself.', 'n = 3, x = 4 → 6.', 'n = 2, x = 7 → 15 (the next free slot is the 8s).'],
  },
};
