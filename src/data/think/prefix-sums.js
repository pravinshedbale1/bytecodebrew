/** Practice thinking walkthroughs: prefix-sums (format: src/data/think/index.js). */

export default {
  'running-sum-of-1d-array': {
    free: true,
    aha: 'Each running total is the previous total plus one new number. Carry the total forward in one pass instead of re-adding the whole prefix every time.',
    asks: {
      observe: 'If the running sum up to index 1 is 3, what one addition gives the running sum up to index 2?',
      pattern: 'Why re-add nums[0] … nums[i] when the previous answer already holds most of that sum?',
      read: 'The statement spells out each answer as a sum. What does each answer have in common with the one before it?',
      budget: 'Re-adding every prefix from scratch: how many additions is that for 1000 numbers?',
      brute: 'What is the most literal way to compute each running sum, and what does it redo?',
      watch: 'For [1, 2, 3, 4], what will the total be after each step?',
    },
    read: [
      { phrase: '`nums[0] + nums[1] + … + nums[i]`', says: 'Element i is the sum of everything up to i: a prefix sum.' },
      {
        phrase: 'Each element is the previous running sum plus the current value',
        says: 'Each answer builds on the one before: one pass, one addition per element.',
      },
    ],
    budget: { from: 'nums.length ≤ 1000', n: 1000, aim: 'O(n)', note: 'Re-adding every prefix is O(n²); carrying the total forward is O(n).' },
    observe: [
      {
        title: 'Each total is the previous total plus one number',
        text: 'running[i] = running[i − 1] + nums[i]. Nothing needs to be re-added.',
        sketch: {
          kind: 'array',
          rows: [
            { label: 'nums', items: [1, 2, 3, 4], marks: { '2': 'cur' } },
            { label: 'running', items: [1, 3, 6, 10], marks: { '1': 'target', '2': 'hit' } },
          ],
          caption: '6 = 3 + 3',
        },
      },
      {
        title: 'It can even be done in place',
        text: 'Overwrite nums[i] with nums[i − 1] + nums[i], going left to right. By the time you reach i, nums[i − 1] already holds the running sum, so no extra array is needed.',
        sketch: { kind: 'array', rows: [{ label: 'nums after the pass', items: [1, 3, 6, 10], marks: { '0': 'hit', '1': 'hit', '2': 'hit', '3': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'For every i, add up nums[0 … i] from scratch.',
      cost: 'O(n²)',
      waste: 'Each prefix is re-added, though it is the previous prefix plus one number.',
    },
    pattern: {
      pick: 'prefix-sums',
      why: 'This is the prefix sum itself, the building block of every other problem in this pattern.',
      not: [
        { id: 'sliding-window', why: 'Nothing leaves on the left; every total starts at index 0.' },
        { id: 'dp-linear', why: 'It is technically a tiny DP (each answer from the previous one), and that DP is exactly a prefix sum.' },
      ],
    },
    watch: {
      frames: [
        {
          title: 'running[0] = 1',
          text: 'The first total is the first number.',
          sketch: { kind: 'array', rows: [{ items: [1, '·', '·', '·'], marks: { '0': 'hit' } }] },
        },
        {
          title: 'running[1] = 1 + 2 = 3',
          text: 'Previous total plus the new number.',
          sketch: { kind: 'array', rows: [{ items: [1, 3, '·', '·'], marks: { '1': 'hit' } }] },
        },
        {
          title: 'running[2] = 6, running[3] = 10',
          text: '3 + 3 = 6, then 6 + 4 = 10: [1, 3, 6, 10].',
          sketch: { kind: 'array', rows: [{ items: [1, 3, 6, 10], marks: { '2': 'hit', '3': 'hit' } }] },
        },
      ],
    },
    edges: ['A single value: [5] → [5].', 'Negative values: [3, −1, −2] → [3, 2, 0].'],
    not: { '0': [] },
  },

  'range-sum-query-immutable': {
    aha: 'Store prefix[i] = the sum of the first i numbers once. Then any range sum is one subtraction: sum(left … right) = prefix[right + 1] − prefix[left].',
    asks: {
      observe: 'How could you get the sum of nums[2 … 5] from "the sum of the first 6" and "the sum of the first 2"?',
      pattern: 'The array never changes and there are many queries. What could you compute once and reuse every time?',
      read: 'Which two facts together say "do the work once, up front"?',
      budget: '10⁴ queries that each loop over up to 10⁴ values: how many steps is that?',
      brute: 'What is the simplest correct sumRange, and what does it redo on every call?',
      watch: 'For sumRange(2, 5), which two prefix values will be subtracted?',
    },
    read: [
      { phrase: 'The array never changes after construction', says: 'Work done once in the constructor is reused by every query: precompute.' },
      { phrase: '`sumRange` may be called many times, so each query should be fast', says: 'Aim for one step per query.' },
      {
        phrase: '(both ends inclusive)',
        says: 'sum(left … right) = prefix[right + 1] − prefix[left], with prefix[i] = the sum of the first i numbers.',
      },
    ],
    budget: {
      from: 'nums ≤ 10⁴, up to 10⁴ queries',
      rows: [['loop over the range each query', '10⁴ × 10⁴ = 10⁸', 'warn'], ['prefix sums, one step per query', '10⁴ + 10⁴', 'ok']],
      aim: 'O(1) per query',
      note: 'The loop is borderline; with more queries it would fail. Precomputing makes queries almost free.',
    },
    observe: [
      {
        title: 'A range is a difference of two prefixes',
        text: 'The sum of [2, 5] is (sum of the first 6) − (sum of the first 2) = −3 − (−2) = −1.',
        sketch: {
          kind: 'array',
          rows: [
            { label: 'nums', items: [-2, 0, 3, -5, 2, -1], bands: [{ from: 2, to: 5, tone: 'accent', label: 'range' }] },
            { label: 'prefix', items: [0, -2, -2, 1, -4, -2, -3], marks: { '2': 'target', '6': 'hit' } },
          ],
        },
      },
      {
        title: 'Store one extra slot',
        text: 'Give prefix n + 1 entries, with prefix[0] = 0 meaning "the sum of nothing". Then sumRange(0, r) = prefix[r + 1] − prefix[0] works like every other query, with no special case for ranges that start at 0.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'prefix', items: [0, -2, -2, 1, -4, -2, -3], marks: { '0': 'target' }, tags: { '0': [['empty prefix', 'warn']] } }],
        },
      },
    ],
    brute: {
      idea: 'Keep the array and add up nums[left … right] on every call.',
      cost: 'O(n) per query',
      waste: 'Overlapping ranges are re-added on every query, though the array never changes.',
    },
    pattern: {
      pick: 'prefix-sums',
      why: 'Precompute prefix sums once (O(n)); each range sum is then one subtraction.',
      not: [
        {
          id: 'range-queries',
          why: 'A Fenwick or segment tree also supports updates; with an array that never changes, plain prefix sums are enough.',
        },
        { id: 'sliding-window', why: 'Queries jump around; there is no window that moves step by step.' },
      ],
    },
    watch: {
      viz: 'PrefixQueryViz',
      inputs: [
        { label: 'sumRange(2, 5)', input: { nums: [-2, 0, 3, -5, 2, -1], l: 2, r: 5 } },
        { label: 'sumRange(0, 2)', input: { nums: [-2, 0, 3, -5, 2, -1], l: 0, r: 2 } },
      ],
    },
    edges: [
      'left = right: sumRange(1, 1) on [5, 7] → 7.',
      'Starting at 0: sumRange(0, 2) on the example → 1.',
      'The whole array: sumRange(0, 5) on the example → −3.',
    ],
  },

  'find-pivot-index': {
    aha: 'Compute the total once. Walking left to right with a running left sum, the right sum is simply total − left − nums[i], so each index is checked in one step.',
    asks: {
      observe: 'In [1, 7, 3, 6, 5, 6] the total is 28. At index 3, the left sum is 11. What is the right sum, without adding anything up?',
      pattern: 'If you know the total and the left sum, do you still need to compute the right sum separately?',
      read: 'The pivot compares two sums. Which one can you keep as you walk, and how do you get the other?',
      budget: 'Summing both sides at every index: how much work is that for 10⁴ values?',
      brute: 'What is the most literal check at each index, and what does it redo?',
      watch: 'For [1, 7, 3, 6, 5, 6], at which index will left and right first match?',
    },
    read: [
      {
        phrase: 'the sum of all values strictly to its left equals the sum of all values strictly to its right',
        says: 'A left sum and a right sum at every index: the left is a running total, the right is "total minus the rest".',
      },
      { phrase: 'Return the leftmost pivot index', says: 'Scan left to right and stop at the first match.' },
      { phrase: 'or `-1` if there is none', says: 'The scan may end without a match.' },
    ],
    budget: { from: 'nums.length ≤ 10⁴', n: 10000, aim: 'O(n), O(1) space', note: 'Summing both sides for every index is O(n²) = 10⁸.' },
    observe: [
      {
        title: 'The right sum comes from the total',
        text: 'right = total − left − nums[i]. At index 3: 28 − 11 − 6 = 11, which equals the left sum.',
        sketch: {
          kind: 'array',
          rows: [
            {
              items: [1, 7, 3, 6, 5, 6],
              bands: [{ from: 0, to: 2, tone: 'accent', label: 'left 11' }, { from: 4, to: 5, tone: 'ghost', label: 'right 11' }],
              marks: { '3': 'hit' },
            },
          ],
        },
      },
      {
        title: 'One running sum is enough',
        text: 'Check left == total − left − nums[i], then add nums[i] to left and move on.',
        sketch: { kind: 'array', rows: [{ label: 'left sum before each index', items: [0, 1, 8, 11, 17, 22], marks: { '3': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'For each index, add up everything on its left and everything on its right.',
      cost: 'O(n²)',
      waste: 'The sums change by one number per step but are recomputed from scratch.',
    },
    pattern: {
      pick: 'prefix-sums',
      why: 'A running prefix sum gives the left side and the total gives the right side for free: O(n), O(1) space.',
      not: [
        { id: 'two-pointers', why: 'Balancing pointers from both ends fails with negative values.' },
        { id: 'sliding-window', why: 'There is no window; both sides always reach the ends of the array.' },
      ],
    },
    watch: {
      frames: [
        { title: 'total = 28', text: 'One pass to add everything up.', sketch: { kind: 'array', rows: [{ items: [1, 7, 3, 6, 5, 6] }] } },
        {
          title: 'Indexes 0, 1, 2: no balance',
          text: 'Left sums 0, 1, 8 against right sums 28 − 0 − 1 = 27, 28 − 1 − 7 = 20, 28 − 8 − 3 = 17. None match.',
          sketch: { kind: 'array', rows: [{ items: [1, 7, 3, 6, 5, 6], marks: { '0': 'dim', '1': 'dim', '2': 'dim' } }] },
        },
        {
          title: 'Index 3: left 11, right 11 → 3',
          text: 'Balanced: the answer is 3.',
          sketch: { kind: 'array', rows: [{ items: [1, 7, 3, 6, 5, 6], marks: { '3': 'hit' } }] },
        },
      ],
    },
    edges: ['Index 0 when the rest sums to 0: [2, 1, −1] → 0.', 'No pivot: [1, 2, 3] → −1.', 'The last index: [−1, 1, 5] → 2.'],
    not: { '0': [] },
  },

  'subarray-sum-equals-k': {
    aha: 'A subarray sum is a difference of two prefix sums. A subarray ending here sums to k once for every earlier prefix equal to (current prefix − k), so keep a map counting how often each prefix has appeared.',
    asks: {
      observe: 'For [1, 1, 1] with k = 2, the prefix sums are 0, 1, 2, 3. Which pairs of them differ by exactly 2?',
      pattern: 'Values can be negative, so a window can\'t tell which end to move. What can you look up instead?',
      read: 'Which sentence rules out a sliding window, and why?',
      budget: 'Every start × every end is 4 × 10⁸ for 2 × 10⁴ values. Is that safe?',
      brute: 'What is the simplest correct count, and what does it repeat for every end?',
      watch: 'For [1, 1, 1] and k = 2, at which positions will a lookup find a match?',
    },
    read: [
      {
        phrase: 'contiguous, non-empty subarrays of `nums` whose values add up to exactly `k`',
        says: 'Count ranges with a given sum: sum of (i, j] = prefix[j] − prefix[i].',
      },
      {
        phrase: 'Values can be negative, so a growing window does not always mean a growing sum',
        says: 'A sliding window won\'t work: adding a number can lower the sum.',
      },
      {
        phrase: 'a hash map counting how often each prefix sum has appeared',
        says: 'For each position, count earlier prefixes equal to prefix − k in one lookup.',
      },
    ],
    budget: { from: 'nums.length ≤ 2 × 10⁴', n: 20000, aim: 'O(n)', note: 'Every subarray with a running sum is O(n²) = 4 × 10⁸: risky.' },
    observe: [
      {
        title: 'A subarray sum is a difference of prefixes',
        text: 'The subarray ending at j sums to k exactly when some earlier prefix equals prefix[j] − k.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'nums', items: [1, 1, 1] }, { label: 'prefix', items: [0, 1, 2, 3], marks: { '1': 'hit', '3': 'cur' } }],
          caption: 'at the end: 3 − 2 = 1 appeared once → the subarray [1, 1]',
        },
      },
      {
        title: 'Count, don\'t search',
        text: 'Keep a map from prefix value to how many times it has appeared, starting with {0: 1}. Each step adds count[prefix − k] to the answer.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'map after the last step', items: ['0: 1', '1: 1', '2: 1', '3: 1'] }],
          caption: 'two lookups found a match: answer 2',
        },
      },
    ],
    brute: {
      idea: 'For every start, extend with a running sum and count the ends where it equals k.',
      cost: 'O(n²)',
      waste: 'For each end, the matching starts are exactly the earlier prefixes equal to prefix − k, which a map counts instantly.',
    },
    pattern: {
      pick: 'prefix-sums',
      why: 'Prefix sums turn "a subarray sums to k" into "two prefixes differ by k", and a map of prefix counts answers that in one pass. O(n).',
      not: [
        { id: 'sliding-window', why: 'With negative values, shrinking a window can increase its sum, so the window logic breaks.' },
        { id: 'hashing', why: 'The map is the tool, but it only works on prefix sums.' },
      ],
    },
    watch: {
      viz: 'SubarraySumViz',
      inputs: [
        { label: '[1, 1, 1], k = 2', input: { nums: [1, 1, 1], k: 2 } },
        { label: '[2, 1, −1, 3, −2, 2], k = 3', input: { nums: [2, 1, -1, 3, -2, 2], k: 3 } },
      ],
    },
    edges: ['k = 0 with cancelling values: [1, −1, 0], k 0 → 3.', 'Negative values: [−1, −1, 1], k 0 → 1.', 'The map must start with {0: 1}: [3], k 3 → 1.'],
    not: { '1': [] },
  },

  'subarray-sums-divisible-by-k': {
    aha: 'A subarray sum is prefix[j] − prefix[i], and that difference is divisible by k exactly when the two prefixes leave the same remainder. So count how many prefixes share each remainder.',
    asks: {
      observe: 'For [4, 5, 0, −2, −3, 1] and k = 5, the prefix sums are 0, 4, 9, 9, 7, 4, 5. What are their remainders when divided by 5?',
      pattern: 'When is a − b divisible by k, in terms of a\'s and b\'s remainders?',
      read: 'Which phrase warns you that Java\'s % can surprise you here?',
      budget: 'Every subarray is 9 × 10⁸ for 3 × 10⁴ values. What must each position cost instead?',
      brute: 'What is the simplest correct count, and what is the only thing it really needs to know about each sum?',
      watch: 'Remainders of the prefix sums are 0, 4, 4, 4, 2, 4, 0. How many pairs is that?',
    },
    read: [
      { phrase: 'whose sum is divisible by `k`', says: 'A range sum with a property: prefix differences again.' },
      { phrase: 'Values may be negative.', says: 'Remainders can come out negative in Java: normalise them.' },
      {
        phrase: 'Two prefix sums with the same remainder modulo `k`',
        says: 'A divisible difference means equal remainders: count pairs of equal remainders.',
      },
    ],
    budget: { from: 'nums.length ≤ 3 × 10⁴', n: 30000, aim: 'O(n + k)', note: 'Every subarray is O(n²) = 9 × 10⁸: too slow.' },
    observe: [
      {
        title: 'Equal remainders bound a divisible subarray',
        text: 'Prefixes 4 and 9 both leave remainder 4 when divided by 5, so their difference (9 − 4 = 5, the subarray [5]) leaves remainder 0: divisible. Same remainder ⇔ divisible difference.',
        sketch: {
          kind: 'array',
          rows: [
            { label: 'prefix', items: [0, 4, 9, 9, 7, 4, 5] },
            {
              label: 'remainder',
              items: [0, 4, 4, 4, 2, 4, 0],
              marks: { '0': 'target', '1': 'hit', '2': 'hit', '3': 'hit', '5': 'hit', '6': 'target' },
            },
          ],
        },
      },
      {
        title: 'Count pairs as you go',
        text: 'Each new prefix pairs with every earlier prefix of the same remainder: add count[r], then increase it.',
        sketch: { kind: 'array', rows: [{ label: 'remainder counts at the end', items: ['0: 2', '2: 1', '4: 4'] }], caption: '1 pair + 0 + 6 pairs = 7' },
      },
    ],
    brute: {
      idea: 'From every start, extend with a running sum and count the sums divisible by k.',
      cost: 'O(n²)',
      waste: 'Only remainders matter, and equal remainders can be counted instead of listed.',
    },
    pattern: {
      pick: 'prefix-sums',
      why: 'Prefix sums taken modulo k, with a count per remainder: each new prefix adds the number of earlier prefixes with the same remainder. O(n + k).',
      not: [
        { id: 'sliding-window', why: 'Divisibility doesn\'t get easier or harder as a window grows, so no window rule works.' },
        { id: 'hashing', why: 'The counts are a table, but the insight is about prefix remainders.' },
      ],
    },
    watch: {
      frames: [
        {
          title: 'Prefix sums',
          text: 'Start with 0 (the empty prefix), then add each value: 0, 4, 9, 9, 7, 4, 5.',
          sketch: { kind: 'array', rows: [{ label: 'nums', items: [4, 5, 0, -2, -3, 1] }, { label: 'prefix', items: [0, 4, 9, 9, 7, 4, 5] }] },
        },
        {
          title: 'Remainders mod 5',
          text: '0, 4, 4, 4, 2, 4, 0. Every pair of equal remainders marks a subarray divisible by 5.',
          sketch: {
            kind: 'array',
            rows: [
              { label: 'prefix', items: [0, 4, 9, 9, 7, 4, 5] },
              { label: 'mod 5', items: [0, 4, 4, 4, 2, 4, 0], marks: { '1': 'hit', '2': 'hit', '3': 'hit', '5': 'hit' } },
            ],
          },
        },
        {
          title: 'Count pairs → 7',
          text: 'Remainder 4 appears 4 times: 4 × 3 / 2 = 6 pairs. Remainder 0 appears twice: 1 pair (the whole array). Remainder 2 once: none. 6 + 1 = 7.',
          sketch: { kind: 'array', rows: [{ label: 'count', items: ['0: 2', '2: 1', '4: 4'], marks: { '0': 'kept', '2': 'kept' } }] },
        },
      ],
    },
    edges: ['Negative sums: use ((s % k) + k) % k, e.g. [−1, 2, 9], k 2 → 2.', 'All zeros: [0, 0], k 3 → 3.', 'Nothing divisible: [1], k 2 → 0.'],
    not: { '1': [] },
  },

  'contiguous-array': {
    aha: 'Count a 0 as −1 and a 1 as +1. A stretch with equal 0s and 1s then sums to 0, which happens exactly between two positions with the same running balance. Remember where each balance first appeared.',
    asks: {
      observe: 'For [0, 0, 1, 0, 1, 1], write the running balance (0 → −1, 1 → +1), starting from 0. Where does a balance repeat?',
      pattern: 'If the balance is the same at two positions, what is true about everything between them?',
      read: 'Which phrase turns "equal 0s and 1s" into a sum you already know how to handle?',
      budget: 'Counting from every start is O(n²). How big is that for 10⁵ values?',
      brute: 'What is the simplest correct search, and what does it recount?',
      watch: 'In [0, 0, 1, 0, 1, 1], where does each balance first appear, and which repeat gives the answer?',
    },
    read: [
      { phrase: 'an equal number of `0`s and `1`s', says: 'A balance condition on a stretch of the array.' },
      { phrase: 'Count a 0 as -1 and a 1 as +1', says: 'Then "balanced" means "sums to 0": a prefix-sum question.' },
      {
        phrase: 'two equal prefix sums as far apart as possible',
        says: 'Remember the first index of each balance; later equal balances give candidate lengths.',
      },
    ],
    budget: { from: 'nums.length ≤ 10⁵', n: 100000, aim: 'O(n)', note: 'Counting from every start is O(n²) = 10¹⁰.' },
    observe: [
      {
        title: 'Turn 0 into −1',
        text: 'Count each 0 as −1 and each 1 as +1. A stretch with as many 0s as 1s now sums to exactly 0, and "sums to 0" means two running balances are equal.',
        sketch: { kind: 'array', rows: [{ label: 'nums', items: [0, 0, 1, 0, 1, 1] }, { label: 'as ±1', items: [-1, -1, 1, -1, 1, 1] }] },
      },
      {
        title: 'Equal balances bound a balanced stretch',
        text: 'The balance is 0 before the first number and 0 again after the last, so the whole array is balanced: length 6.',
        sketch: { kind: 'array', rows: [{ label: 'balance (start = 0)', items: [0, -1, -2, -1, -2, -1, 0], marks: { '0': 'hit', '6': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'For each start, extend while counting 0s and 1s; record lengths where they are equal.',
      cost: 'O(n²)',
      waste: 'Only the running balance matters, and where it first appeared can be looked up.',
    },
    pattern: {
      pick: 'prefix-sums',
      why: 'Turn 0 into −1, keep a running balance, and remember where each balance first appeared: the longest zero-sum stretch in O(n).',
      not: [
        { id: 'sliding-window', why: 'Balance doesn\'t improve steadily as a window grows, so you can\'t decide which end to move.' },
        { id: 'hashing', why: 'The first-position map is a hash map, but it works on prefix balances.' },
      ],
    },
    watch: {
      frames: [
        {
          title: 'Seed: balance 0 at index −1',
          text: 'So a balanced stretch starting at index 0 is found too.',
          sketch: { kind: 'array', rows: [{ label: 'first seen', items: ['0 → −1'] }] },
        },
        {
          title: 'Balances −1, −2, −1, −2, −1',
          text: '−1 first appears at index 0 and −2 at index 1. Repeats give lengths: 2 − 0 = 2, 3 − 1 = 2, 4 − 0 = 4.',
          sketch: { kind: 'array', rows: [{ items: [-1, -2, -1, -2, -1], marks: { '0': 'target', '2': 'hit', '4': 'hit' } }] },
        },
        {
          title: 'Index 5: balance 0 again → 6',
          text: '5 − (−1) = 6: the whole array.',
          sketch: { kind: 'array', rows: [{ items: [0, 0, 1, 0, 1, 1], bands: [{ from: 0, to: 5, tone: 'success' }] }] },
        },
      ],
    },
    edges: ['All 0s: [0, 0] → 0.', '[0, 1] → 2.', 'Only the first position of each balance is stored: [0, 1, 0] → 2.'],
    not: { '1': [] },
  },

  'product-of-array-except-self': {
    aha: 'The product of everything except nums[i] is (the product of everything to its left) × (the product of everything to its right). Build the left products in one pass and multiply in the right products on a second pass from the end.',
    asks: {
      observe: 'For [1, 2, 3, 4] at index 2, what is the product of the numbers on its left? On its right?',
      pattern: 'Division is not allowed. How can "everything except me" be split into two parts you can build up as you go?',
      read: 'Division is banned. What does "everything except nums[i]" split into?',
      budget: 'Multiplying all the others for every index: how much work for 10⁵ values?',
      brute: 'What is the most literal answer, and what do neighbouring answers share?',
      watch: 'For [1, 2, 3, 4], what does the answer array hold after the left pass?',
    },
    read: [
      { phrase: 'the product of every element of `nums` except `nums[i]`', says: 'Everything to the left of i times everything to the right of i.' },
      { phrase: 'Do not use division', says: 'Total ÷ nums[i] is ruled out (and breaks on zeros).' },
      { phrase: 'run in O(n) time', says: 'Multiplying all the others for each i would be O(n²).' },
    ],
    budget: { from: 'nums.length ≤ 10⁵', n: 100000, aim: 'O(n)', note: 'The nested product is 10¹⁰.' },
    observe: [
      {
        title: 'Left product × right product',
        text: 'At index 2 of [1, 2, 3, 4]: left = 1 · 2 = 2, right = 4, answer 8.',
        sketch: {
          kind: 'array',
          rows: [
            { label: 'nums', items: [1, 2, 3, 4], marks: { '2': 'cur' } },
            { label: 'left of i', items: [1, 1, 2, 6], marks: { '2': 'hit' } },
            { label: 'right of i', items: [24, 12, 4, 1], marks: { '2': 'hit' } },
          ],
          caption: '2 × 4 = 8',
        },
      },
      {
        title: 'One answer array, one running number',
        text: 'Write the left products straight into the answer array. Then walk from the right with one number, right = the product of everything after i: multiply it into answer[i], then multiply nums[i] into right. No second array is needed.',
        sketch: { kind: 'array', rows: [{ label: 'answer', items: [24, 12, 8, 6], marks: { '0': 'hit', '1': 'hit', '2': 'hit', '3': 'hit' } }] },
      },
    ],
    brute: { idea: 'For each index, multiply every other number.', cost: 'O(n²)', waste: 'Neighbouring answers share almost all of their factors.' },
    pattern: {
      pick: 'prefix-sums',
      why: 'Prefix and suffix products (prefix sums, but multiplying) give every answer in O(n) with O(1) extra space.',
      not: [
        { id: 'dp-linear', why: 'The two passes are simple DPs; they are exactly prefix and suffix products.' },
        { id: 'sliding-window', why: 'The excluded number moves, but "everything else" is one prefix plus one suffix, not a window.' },
      ],
    },
    watch: {
      frames: [
        {
          title: 'Left pass',
          text: 'answer[i] = product of everything left of i: [1, 1, 2, 6].',
          sketch: { kind: 'array', rows: [{ items: [1, 1, 2, 6], marks: { '0': 'kept', '1': 'kept', '2': 'kept', '3': 'kept' } }] },
        },
        {
          title: 'Right pass starts at the end',
          text: 'right = 1: answer[3] = 6 · 1 = 6. Then right = 4.',
          sketch: { kind: 'array', rows: [{ items: [1, 1, 2, 6], marks: { '3': 'hit' } }] },
        },
        {
          title: 'Finish: [24, 12, 8, 6]',
          text: 'answer[2] = 2 · 4 = 8, answer[1] = 1 · 12 = 12, answer[0] = 1 · 24 = 24.',
          sketch: { kind: 'array', rows: [{ items: [24, 12, 8, 6], marks: { '0': 'hit', '1': 'hit', '2': 'hit' } }] },
        },
      ],
    },
    edges: ['One zero: [1, 0, 3] → [0, 3, 0].', 'Two zeros: [0, 0, 2] → [0, 0, 0].', 'Negative values: [−1, 2] → [2, −1].'],
    not: { '0': [] },
  },

  'range-sum-query-2d-immutable': {
    aha: 'Store P[r][c] = the sum of the whole rectangle from the top-left corner to just before (r, c). Any rectangle is then four lookups: the big corner, minus the strip above, minus the strip to the left, plus the overlap you subtracted twice.',
    asks: {
      observe: 'If you know the sums of every rectangle that starts at the top-left corner, how can you get a rectangle in the middle?',
      pattern: 'In 1D, a range is a difference of two prefixes. What is the 2D version of that?',
      read: 'Which phrase tells you each query must be one step, and which one warns about off-by-one?',
      budget: '10⁴ queries each adding up to 4 × 10⁴ cells: how many steps?',
      brute: 'What is the simplest correct sumRegion, and what does it redo on each call?',
      watch: 'For the rectangle (2, 1) to (4, 3), which four entries of P will be used?',
    },
    read: [
      { phrase: 'Each `sumRegion` call should take O(1) time', says: 'Precompute: a 2D table of prefix sums.' },
      { phrase: 'both inclusive', says: 'Careful with off-by-one: give P an extra row and column of zeros.' },
    ],
    budget: {
      from: '200 × 200 grid, up to 10⁴ queries',
      rows: [['add up each rectangle', '4 × 10⁴ × 10⁴ = 4 × 10⁸', 'warn'], ['2D prefix sums', '4 × 10⁴ + 10⁴', 'ok']],
      aim: 'O(1) per query',
      note: 'Building the table is O(m · n) once.',
    },
    observe: [
      {
        title: 'P holds every top-left rectangle',
        text: 'Build it with P[r][c] = cell + P[r − 1][c] + P[r][c − 1] − P[r − 1][c − 1]: the cell, plus the rectangle above, plus the one on the left, minus their overlap.',
        sketch: {
          kind: 'grid',
          grid: [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
          marks: { '2,2': 'cur', '0,0': 'ring', '0,1': 'ring', '0,2': 'ring', '1,0': 'ring', '1,1': 'ring', '1,2': 'ring', '2,0': 'ring', '2,1': 'ring' },
          caption: 'P at the bottom-right = the whole shaded block',
        },
      },
      {
        title: 'Any rectangle is four corners',
        text: 'Big corner, minus the strip above, minus the strip to the left, plus the overlap that was subtracted twice.',
        sketch: {
          kind: 'grid',
          grid: [[0, 0, 0], [0, 1, 1], [0, 1, 1]],
          marks: { '1,1': 'hit', '1,2': 'hit', '2,1': 'hit', '2,2': 'hit', '0,0': 'cur' },
          labels: { '0,0': '+', '0,1': '−', '0,2': '−', '1,0': '−', '2,0': '−' },
          caption: 'the shaded rectangle = big − top − left + corner',
        },
      },
    ],
    brute: {
      idea: 'Loop over every cell of the rectangle on each call.',
      cost: 'O(m · n) per query',
      waste: 'Overlapping rectangles are re-added on every query, though the grid never changes.',
    },
    pattern: {
      pick: 'prefix-sums',
      why: 'A 2D prefix-sum table answers any rectangle with four lookups: one step per query after O(m · n) setup.',
      not: [
        { id: 'range-queries', why: 'A 2D Fenwick tree supports updates too; with a grid that never changes, prefix sums are simpler.' },
        { id: 'dp-grid', why: 'Building P looks like a grid DP, but it is just a 2D prefix sum.' },
      ],
    },
    watch: {
      frames: [
        {
          title: 'Build P once',
          text: 'One pass over the grid with the formula; P gets an extra row and column of zeros.',
          sketch: {
            kind: 'grid',
            grid: [[0, 0, 0], [0, 3, 3], [0, 8, 14]],
            labels: { '1,1': '3', '1,2': '3', '2,1': '8', '2,2': '14' },
            caption: 'the top-left 2 × 2 of P for the example',
          },
        },
        {
          title: 'Query (2, 1) to (4, 3)',
          text: 'Take P[5][4], subtract P[2][4] and P[5][1], add back P[2][1].',
          sketch: { kind: 'grid', grid: [[0, 0, 0], [0, 1, 1], [0, 1, 1]], marks: { '1,1': 'hit', '1,2': 'hit', '2,1': 'hit', '2,2': 'hit' } },
        },
        {
          title: 'Result: 8',
          text: 'P[5][4] − P[2][4] − P[5][1] + P[2][1] = 8. Four lookups, however big the rectangle.',
          sketch: { kind: 'array', rows: [{ items: [8], marks: { '0': 'hit' } }] },
        },
      ],
    },
    edges: [
      'A single cell: sumRegion(0, 0, 0, 0) → that cell.',
      'Rectangles touching row 0 or column 0 use the zero padding: sumRegion(0, 0, 1, 1) on the example → 14.',
      'The whole grid → the sum of every cell.',
    ],
    not: { '1': [] },
  },

  'corporate-flight-bookings': {
    aha: 'Instead of adding seats to every flight in a booking, mark only where the booking starts (+seats) and where it stops (−seats just after). One running sum at the end turns those marks into every flight\'s total.',
    asks: {
      observe: 'For the booking [2, 5, 25], which two positions would you mark so that a running sum adds 25 to flights 2 … 5 only?',
      pattern: 'Many "add to a whole range" updates, read once at the end: what lets each update cost one step?',
      read: 'Which phrase tells you each update covers a whole range, and when are the totals read?',
      budget: 'Each booking can cover all 2 × 10⁴ flights. How much work is the direct way?',
      brute: 'What is the most literal way to apply the bookings, and how much of it is new information?',
      watch: 'For booking [2, 5, 25], which two cells of the difference array change?',
    },
    read: [
      {
        phrase: 'reserves `seats` seats on every flight from `first` to `last` inclusive',
        says: 'Many range updates (add v to a whole range), read once at the end: a difference array.',
      },
      { phrase: 'element `i` is the total number of seats booked on flight `i + 1`', says: 'Flights are numbered from 1; the answer array from 0.' },
    ],
    budget: {
      from: 'n, bookings ≤ 2 × 10⁴',
      rows: [['add to every flight of each booking', '2 × 10⁴ × 2 × 10⁴ = 4 × 10⁸', 'warn'], ['difference array + one running sum', '4 × 10⁴', 'ok']],
      aim: 'O(n + bookings)',
      note: 'Each booking can cover every flight, so the direct way is quadratic.',
    },
    observe: [
      {
        title: 'Mark where each booking starts and stops',
        text: 'For [2, 5, 25], add 25 at flight 2 and −25 at flight 6 (just after 5). A running sum then carries the 25 forward from flight 2 and cancels it at flight 6: flights 2 … 5 get it, nobody else does.',
        sketch: { kind: 'array', rows: [{ label: 'marks for [2, 5, 25]', items: [0, 25, 0, 0, 0, '−25'], marks: { '1': 'hit', '5': 'bad' } }] },
      },
      {
        title: 'One running sum rebuilds every flight',
        text: 'Adding the marks up from left to right applies each booking exactly to its range.',
        sketch: {
          kind: 'array',
          rows: [
            { label: 'all marks', items: [10, 45, -10, -20, 0, -25] },
            { label: 'running sum', items: [10, 55, 45, 25, 25], marks: { '0': 'hit', '1': 'hit', '2': 'hit', '3': 'hit', '4': 'hit' } },
          ],
        },
      },
    ],
    brute: {
      idea: 'For each booking, add seats to every flight from first to last.',
      cost: 'O(b · n)',
      waste: 'Each booking touches its whole range, though only its two ends carry new information.',
    },
    pattern: {
      pick: 'prefix-sums',
      why: 'A difference array makes each range update one step; one running sum at the end gives every total. O(n + b).',
      not: [
        { id: 'range-queries', why: 'A segment tree with range updates works, but there are no questions in between, so it is overkill.' },
        { id: 'intervals', why: 'Sorting the bookings and sweeping works too, with an extra sort.' },
      ],
    },
    watch: {
      viz: 'DifferenceArrayViz',
      inputs: [{ label: '5 flights, bookings [1,2,10], [2,3,20], [2,5,25] (0-based here)', input: { n: 5, updates: [[0, 1, 10], [1, 2, 20], [1, 4, 25]] } }],
    },
    edges: [
      'A booking ending at the last flight needs no −seats inside the array: [[1, 2, 5]], n 2 → [5, 5].',
      'A single flight: [[1, 1, 7]], n 1 → [7].',
      'Overlapping bookings add up: [[1, 2, 1], [2, 2, 1]], n 2 → [1, 2].',
    ],
    not: { '1': [] },
  },

  'number-of-submatrices-that-sum-to-target': {
    aha: 'Fix a top row and a bottom row. Each column then contributes one number (its sum between those rows), and rectangles in that band are just subarrays of that row of numbers: count them with prefix sums and a map, like Subarray Sum Equals K.',
    asks: {
      observe: 'Between rows 0 and 1 of [[0, 1, 0], [1, 1, 1], [0, 1, 0]], what is each column\'s sum? Which stretches of those sums add to 0?',
      pattern: 'Have you already solved "count stretches of a 1D array that sum to a target"? How could a grid become a 1D array?',
      read: 'Which two phrases reduce this to a problem you have already solved?',
      budget: 'Every rectangle is (100²)² = 10⁸. What does fixing two rows bring it down to?',
      brute: 'What is the simplest correct count, and what does it try pair by pair?',
      watch: 'Which single-row bands contain zero-sum stretches, and do any taller bands?',
    },
    read: [
      { phrase: 'rectangular submatrices of `matrix` whose values add up to `target`', says: 'The 2D version of Subarray Sum Equals K.' },
      {
        phrase: 'Fix a pair of rows, collapse the columns between them into one array of sums',
        says: 'Reduce 2D to 1D: for each pair of rows, the columns become one array.',
      },
      { phrase: 'using prefix sums and a hash map', says: 'Then count stretches summing to the target, exactly as in the 1D problem.' },
    ],
    budget: {
      from: 'up to 100 × 100',
      rows: [['every rectangle with 2D prefix sums', '(100²)² = 10⁸', 'warn'], ['row pairs × 1D count', '100² × 100 = 10⁶', 'ok']],
      aim: 'O(m² · n)',
      note: 'Listing every rectangle is borderline; the reduction is 100 times faster.',
    },
    observe: [
      {
        title: 'Two rows turn the grid into one array',
        text: 'Between rows 0 and 1, each column\'s sum is 1, 2, 1. Rectangles in that band are stretches of [1, 2, 1].',
        sketch: {
          kind: 'grid',
          grid: [[0, 1, 0], [1, 1, 1], [0, 1, 0]],
          marks: { '0,0': 'ring', '0,1': 'ring', '0,2': 'ring', '1,0': 'ring', '1,1': 'ring', '1,2': 'ring' },
          caption: 'rows 0–1 collapse to [1, 2, 1]',
        },
      },
      {
        title: 'Count with prefix sums + a map',
        text: 'For each band, run the 1D "subarray sum equals k" count, then add up the counts over all pairs of rows.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'band rows 0–0', items: [0, 1, 0], marks: { '0': 'hit', '2': 'hit' } }],
          caption: 'two zero-sum stretches: [0] and [0]',
        },
      },
    ],
    brute: {
      idea: 'List every rectangle by its two corners and get each sum from a 2D prefix table.',
      cost: 'O(m² · n²)',
      waste: 'For a fixed pair of rows, column choices are tried pair by pair instead of with one map pass.',
    },
    pattern: {
      pick: 'prefix-sums',
      why: 'Fix two rows, collapse the columns into one array, then count stretches with the target sum using prefix sums and a map: O(m² · n).',
      not: [
        { id: 'sliding-window', why: 'Values can be negative, so no window rule works.' },
        { id: 'dp-grid', why: 'There is no path or best choice; we count rectangles by their sums.' },
      ],
    },
    watch: {
      frames: [
        {
          title: 'Single rows',
          text: 'Row 0 [0, 1, 0]: two zero-sum stretches. Row 1 [1, 1, 1]: none. Row 2 [0, 1, 0]: two more.',
          sketch: { kind: 'grid', grid: [[0, 1, 0], [1, 1, 1], [0, 1, 0]], marks: { '0,0': 'hit', '0,2': 'hit', '2,0': 'hit', '2,2': 'hit' } },
        },
        {
          title: 'Bands of two or three rows',
          text: 'Column sums [1, 2, 1] or [1, 3, 1]: no stretch sums to 0.',
          sketch: { kind: 'array', rows: [{ label: 'rows 0–1 and 1–2', items: [1, 2, 1] }, { label: 'rows 0–2', items: [1, 3, 1] }] },
        },
        {
          title: 'Total: 4',
          text: 'The four single zero cells are the only rectangles that sum to 0.',
          sketch: {
            kind: 'grid',
            grid: [[0, 1, 0], [1, 1, 1], [0, 1, 0]],
            marks: { '0,0': 'hit', '0,2': 'hit', '2,0': 'hit', '2,2': 'hit' },
            labels: { '0,0': '✓', '0,2': '✓', '2,0': '✓', '2,2': '✓' },
          },
        },
      ],
    },
    edges: ['A 1 × 1 grid: [[5]], target 5 → 1.', 'Negative values: [[1, −1]], target 0 → 1.', 'All zeros: [[0, 0]], target 0 → 3.'],
    not: { '1': [] },
  },
};
