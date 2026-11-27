/** Practice thinking walkthroughs: range-queries (format: src/data/think/index.js). */

export default {
  'car-pooling': {
    aha: 'Adding every trip to every kilometre it covers is slow for long trips. Record only where the load changes: +p at the pickup kilometre and −p at the drop-off kilometre (seats freed at "to" are available to people getting in there). A running sum of those changes gives the load at every kilometre; fail if it ever exceeds the capacity.',
    asks: {
      read: 'At a kilometre where one trip ends and another starts, who counts?',
      budget: 'Up to 1000 trips over 1000 km. Is adding each trip to each kilometre fine? What is cleaner?',
      observe: 'Trips [2, 1, 5] and [3, 3, 7] with 4 seats: where is the car over capacity?',
      brute: 'For every kilometre, add up the trips covering it: what does it cost?',
      pattern: 'Where does the number of passengers actually change?',
      watch: 'Watch the changes get recorded, then the running load checked.',
    },
    read: [
      {
        phrase: 'picks up `passengers` people at kilometre `from` and drops them off at kilometre `to`',
        says: 'Occupied on [from, to): +p at from, −p at to.',
      },
      {
        phrase: 'People dropped off at a point free their seats for people picked up at the same point',
        says: 'Apply the −p at "to" before checking: half-open ranges.',
      },
      { phrase: 'without ever carrying more than `capacity` passengers', says: 'Check the running sum at every kilometre.' },
    ],
    budget: {
      from: '≤ 1000 trips, km ≤ 1000',
      rows: [['each trip on each km', '10⁶', 'ok', 'fine here'], ['difference array', '2 · 1000 + 1000', 'ok', 'linear']],
      aim: 'O(trips + distance)',
      note: 'For huge distances, sort the 2 · trips events instead.',
    },
    observe: [
      {
        title: 'Only the endpoints change the load',
        text: 'Trip [2, 1, 5]: +2 at km 1, −2 at km 5. Trip [3, 3, 7]: +3 at km 3, −3 at km 7.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'change', items: ['·', '+2', '·', '+3', '·', '−2', '·', '−3'], marks: { '1': 'hit', '3': 'hit', '5': 'bad', '7': 'bad' } }],
        },
      },
      {
        title: 'Running sum = load',
        text: 'Loads from km 0: 0, 2, 2, 5, … At km 3 there are 5 passengers > 4: false.',
        sketch: { kind: 'array', rows: [{ label: 'load', items: [0, 2, 2, 5], marks: { '3': 'bad' } }], caption: '5 > 4' },
      },
    ],
    brute: {
      idea: 'For every kilometre, add up the passengers of every trip covering it.',
      cost: 'O(trips · distance)',
      waste: 'Each trip is added kilometre by kilometre, though only its two ends change the load.',
    },
    pattern: {
      pick: 'range-queries',
      why: 'diff[from] += p, diff[to] −= p for every trip; sweep with a running sum and fail if it exceeds capacity. O(trips + distance).',
      not: [
        { id: 'intervals', why: 'Sorting trips by start and using a heap of drop-offs works too, in O(n log n).' },
        { id: 'prefix-sums', why: 'The sweep is a prefix sum over the difference array: this is that pattern applied to range updates.' },
      ],
    },
    watch: {
      viz: 'RangeWalkViz',
      inputs: [
        { label: 'capacity 4: too full', input: { mode: 'carpool', trips: [[2, 1, 5], [3, 3, 7]], capacity: 4 } },
        { label: 'capacity 3: fits', input: { mode: 'carpool', trips: [[2, 1, 5], [3, 5, 7]], capacity: 3 } },
      ],
    },
    edges: [
      '[[2, 1, 5], [3, 3, 7]], capacity 4 → false.',
      'Same trips, capacity 5 → true.',
      'Drop-off and pickup at the same km: [[2, 1, 5], [3, 5, 7]], capacity 3 → true.',
    ],
  },

  'range-sum-query-mutable': {
    aha: 'Prefix sums answer a range sum in O(1) but an update costs O(n). A Fenwick tree (binary indexed tree) stores partial sums over blocks whose sizes are powers of two, chosen by the lowest set bit of the index: a prefix sum adds O(log n) blocks, an update touches O(log n) blocks. sumRange(l, r) = prefix(r) − prefix(l − 1).',
    asks: {
      read: 'Which two operations must both be O(log n)?',
      budget: '10⁵ updates and queries on 10⁵ numbers. What does a prefix-sum array cost per update?',
      observe: 'With a Fenwick tree over 8 numbers, which nodes add up to prefix(7)?',
      brute: 'Summing the range directly on each query: what does it cost?',
      pattern: 'Which structure keeps both "change one value" and "sum a prefix" logarithmic?',
      watch: 'Watch a prefix sum walk down by i −= i & −i, and an update walk up by i += i & −i.',
    },
    read: [
      { phrase: '`void update(int index, int val)` sets `nums[index]` to `val`', says: 'Point updates: add the difference val − nums[index].' },
      {
        phrase: 'Both `update` and `sumRange` must run in O(log n)',
        says: 'Neither a plain array nor a prefix-sum array is enough: a Fenwick or segment tree.',
      },
    ],
    budget: {
      from: 'n, calls ≤ 10⁵',
      rows: [
        ['sum each query', 'O(n) per query', 'bad', '10¹⁰'],
        ['prefix sums', 'O(n) per update', 'bad', '10¹⁰'],
        ['Fenwick tree', 'O(log n) each', 'ok', 'fast'],
      ],
      aim: 'O(log n) per call',
      note: 'A segment tree also works and handles min / max too.',
    },
    observe: [
      {
        title: 'A prefix is a few blocks',
        text: 'prefix(7) = tree[7] + tree[6] + tree[4]: blocks of size 1, 2 and 4, found by removing the lowest set bit each time (7 → 6 → 4 → 0).',
        sketch: { kind: 'array', rows: [{ items: ['tree[7]', 'tree[6]', 'tree[4]'], marks: { '0': 'hit', '1': 'hit', '2': 'hit' } }], caption: '7 = 111₂' },
      },
      {
        title: 'An update climbs',
        text: 'Changing position 3 updates tree[3], tree[4] and tree[8]: every block that covers it (3 → 4 → 8 by adding the lowest set bit).',
        sketch: { kind: 'array', rows: [{ items: ['tree[3]', 'tree[4]', 'tree[8]'], marks: { '0': 'cur', '1': 'cur', '2': 'cur' } }] },
      },
    ],
    brute: {
      idea: 'Keep the array; update in O(1) and add up nums[l..r] for each query.',
      cost: 'O(n) per query',
      waste: 'Every query re-adds values that haven\'t changed; precomputed block sums avoid that.',
    },
    pattern: {
      pick: 'range-queries',
      why: 'Fenwick tree: update(i, Δ): for (i++; i ≤ n; i += i & −i) tree[i] += Δ. prefix(i): for (i++; i > 0; i −= i & −i) s += tree[i]. sumRange = prefix(r) − prefix(l − 1). O(log n).',
      not: [
        { id: 'prefix-sums', why: 'Static prefix sums are perfect until values change; each update would rebuild them.' },
        {
          id: 'divide-and-conquer',
          why: 'A segment tree is divide and conquer on ranges; it works but needs more code than a Fenwick tree for sums.',
        },
      ],
    },
    watch: {
      viz: 'FenwickViz',
      inputs: [
        { label: 'prefix over [1, 3, 5]', input: { mode: 'query', a: [1, 3, 5], i: 3 } },
        { label: 'update position 2 by −1', input: { mode: 'update', a: [1, 3, 5], i: 2, delta: -1 } },
      ],
    },
    edges: [
      '[1, 3, 5]: sumRange(0, 2) → 9; update(1, 2); sumRange(0, 2) → 8.',
      'Single element: sumRange(0, 0) → that element.',
      'Update to the same value → nothing changes.',
    ],
  },

  'count-of-smaller-numbers-after-self': {
    aha: 'Scan from the right, keeping a count of each value seen so far (compress the values to ranks). The answer for nums[i] is the number of seen values strictly below it: a prefix sum over the counts. A Fenwick tree does both the prefix sum and the "count it" update in O(log n).',
    asks: {
      read: 'Which elements are compared with nums[i]?',
      budget: 'n up to 10⁵. Can you compare every pair?',
      observe: 'For [5, 2, 6, 1], which smaller elements lie right of the 5?',
      brute: 'For each element, scan everything to its right: what does it cost?',
      pattern: 'Scanning from the right, what question do you ask the values seen so far?',
      watch: 'Watch counts by value fill in from the right, with a prefix asked for each element.',
    },
    read: [
      { phrase: 'how many elements to its right are strictly smaller than it', says: 'Scan right to left; ask how many seen values are smaller.' },
      { phrase: 'a Fenwick tree works too', says: 'Counts by value rank; prefix sum = how many smaller.' },
    ],
    budget: {
      from: 'n ≤ 10⁵',
      rows: [['every pair', 'n² / 2 = 5 × 10⁹', 'bad', 'too slow'], ['Fenwick over value ranks', 'n log n', 'ok', 'fast']],
      aim: 'O(n log n)',
      note: 'Merge sort, counting right-half elements that jump ahead, is the other classic.',
    },
    observe: [
      {
        title: 'Count the smaller values to the right',
        text: '[5, 2, 6, 1]: right of 5 are 2, 6, 1, of which 2 and 1 are smaller: 2. The full answer is [2, 1, 1, 0].',
        sketch: { kind: 'array', rows: [{ items: [5, 2, 6, 1], marks: { '0': 'cur', '1': 'hit', '2': 'dim', '3': 'hit' } }], caption: '[2, 1, 1, 0]' },
      },
      {
        title: 'A prefix over counts',
        text: 'Scanning from the right, after seeing 1, 6 and 2 the counts by value are 1: 1, 2: 1, 6: 1. For 5, add the counts of values below 5: 2.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'value', items: [1, 2, 5, 6] }, { label: 'count', items: [1, 1, 0, 1], marks: { '0': 'hit', '1': 'hit' } }],
        },
      },
    ],
    brute: {
      idea: 'For each i, count the j > i with nums[j] < nums[i].',
      cost: 'O(n²)',
      waste: 'Each element is compared with every later one; a running count by value answers each question in O(log n).',
    },
    pattern: {
      pick: 'range-queries',
      why: 'Compress values to ranks; for i from n − 1 down: ans[i] = fenwick.prefix(rank[i] − 1); fenwick.add(rank[i], 1). O(n log n).',
      not: [
        { id: 'divide-and-conquer', why: 'Merge sort with counting also gives O(n log n); the Fenwick view is more direct.' },
        { id: 'bst-patterns', why: 'A balanced BST with subtree sizes works, but Java has no built-in one with ranks.' },
      ],
    },
    watch: {
      viz: 'RangeWalkViz',
      inputs: [
        { label: '[5, 2, 6, 1]', input: { mode: 'smaller', nums: [5, 2, 6, 1] } },
        { label: '[3, 1, 3, 2, 1]', input: { mode: 'smaller', nums: [3, 1, 3, 2, 1] } },
      ],
    },
    edges: ['One element: [−1] → [0].', 'Equal values: [−1, −1] → [0, 0] (strictly smaller).', '[5, 2, 6, 1] → [2, 1, 1, 0].'],
  },

  'reverse-pairs': {
    aha: 'Merge sort, and before each merge count the pairs that cross it: i in the left half, j in the right half, left[i] > 2 · right[j]. Both halves are sorted, so as left[i] grows the qualifying right elements only grow too: one pointer sweeps the right half once per merge. Pairs inside a half were counted when that half was sorted. O(n log n).',
    asks: {
      read: 'Why can 2 × nums[j] overflow?',
      budget: '5 × 10⁴ numbers. Can you check every pair?',
      observe: 'In [2, 4, 3, 5, 1], which pairs have nums[i] > 2 · nums[j]?',
      brute: 'Every pair: what does it cost?',
      pattern: 'If both halves are sorted, how fast can you count the crossing pairs?',
      watch: 'Watch each merge count its crossing pairs, then merge.',
    },
    read: [
      { phrase: '`i < j` and `nums[i] > 2 × nums[j]`', says: 'Order matters: count across the split of a merge sort.' },
      {
        phrase: 'so `2 × nums[j]` can overflow an `int`',
        says: 'Values reach ±(2³¹ − 1), so 2 × nums[j] can overflow an int: compute it as a long before comparing.',
      },
    ],
    budget: {
      from: 'n ≤ 5 × 10⁴',
      rows: [['every pair', '1.25 × 10⁹', 'bad', 'too slow'], ['merge sort counting', 'n log n', 'ok', 'fast']],
      aim: 'O(n log n)',
      note: 'A Fenwick tree over compressed values (2x and x) also works.',
    },
    observe: [
      {
        title: 'Three reverse pairs',
        text: '[2, 4, 3, 5, 1]: 4 > 2 · 1, 3 > 2 · 1, 5 > 2 · 1. Everything else fails.',
        sketch: { kind: 'array', rows: [{ items: [2, 4, 3, 5, 1], marks: { '1': 'hit', '2': 'hit', '3': 'hit', '4': 'cur' } }], caption: '3' },
      },
      {
        title: 'Count across a merge',
        text: 'Merging [2, 3, 4] with [1, 5]: for 2, 3 and 4, only 1 qualifies (each > 2 · 1, none > 10). The pointer into the right half never moves back.',
        sketch: { kind: 'array', rows: [{ label: 'left', items: [2, 3, 4] }, { label: 'right', items: [1, 5], marks: { '0': 'hit' } }], caption: '+3' },
      },
    ],
    brute: { idea: 'Check every pair i < j.', cost: 'O(n²)', waste: 'Sorted halves let one sweep count all crossing pairs at once.' },
    pattern: {
      pick: 'range-queries',
      why: 'sort(lo, hi): sort both halves; j = mid; for i in left: while (j < hi && a[i] > 2L · a[j]) j++; count += j − mid; then merge. O(n log n).',
      not: [
        { id: 'divide-and-conquer', why: 'This is merge sort (divide and conquer) used for counting; the counting step is the range-query idea.' },
        { id: 'two-pointers', why: 'The sweep inside a merge is two pointers, but only because both halves are sorted.' },
      ],
    },
    watch: {
      viz: 'RangeWalkViz',
      inputs: [
        { label: '[2, 4, 3, 5, 1]', input: { mode: 'reverse', nums: [2, 4, 3, 5, 1] } },
        { label: '[1, 3, 2, 3, 1]', input: { mode: 'reverse', nums: [1, 3, 2, 3, 1] } },
      ],
    },
    edges: ['[1, 3, 2, 3, 1] → 2.', '[2, 4, 3, 5, 1] → 3.', 'Sorted ascending: [1, 2, 3] → 0.'],
  },

  'count-of-range-sum': {
    aha: 'A subarray sum is P[j] − P[i] for prefix sums with i < j. So count the pairs of prefix sums whose difference lies in [lower, upper]. Merge sort the prefix sums: for each P[i] in the left half, the qualifying P[j] in the right half form one window [P[i] + lower, P[i] + upper], and both window edges only move right as P[i] grows.',
    asks: {
      read: 'Why are 64-bit sums needed?',
      budget: 'n up to 10⁵. How many subarrays are there?',
      observe: 'For [−2, 5, −1] with range [−2, 2], which subarrays count?',
      brute: 'Every subarray\'s sum: what does it cost?',
      pattern: 'A subarray sum is the difference of what?',
      watch: 'Watch each merge count the prefix-sum pairs that fall in the range.',
    },
    read: [
      { phrase: 'whose sum lies in the range `[lower, upper]`', says: 'Count pairs of prefix sums with difference in the range.' },
      {
        phrase: 'A subarray sum is the difference of two prefix sums',
        says: 'Build the prefix array P once; from then on the question is about pairs of P values, and nums itself is no longer needed.',
      },
      { phrase: 'using merge sort or an ordered structure', says: 'Sorted halves make the window counting linear.' },
    ],
    budget: {
      from: 'n ≤ 10⁵',
      rows: [['every subarray', 'n² / 2 = 5 × 10⁹', 'bad', 'too slow'], ['merge sort on prefix sums', 'n log n', 'ok', 'fast']],
      aim: 'O(n log n)',
      note: 'A Fenwick tree over compressed prefix sums also works.',
    },
    observe: [
      {
        title: 'Three subarrays',
        text: 'For [−2, 5, −1] with range [−2, 2]: [−2] (sum −2), [−1] (sum −1) and the whole array (sum 2) qualify. Anything containing 5 but not both negatives is too big.',
        sketch: { kind: 'array', rows: [{ items: [-2, 5, -1], marks: { '0': 'hit', '2': 'hit' } }], caption: '3 (with the whole array, sum 2)' },
      },
      {
        title: 'Pairs of prefix sums',
        text: 'P = [0, −2, 3, 2]. Pairs i < j with −2 ≤ P[j] − P[i] ≤ 2: (0, −2), (0, 2), (3, 2).',
        sketch: { kind: 'array', rows: [{ label: 'P', items: [0, -2, 3, 2], marks: { '0': 'hit', '1': 'hit', '3': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'For every start, extend to every end with a running sum, and count sums in the range.',
      cost: 'O(n²)',
      waste: 'Most pairs are compared needlessly; sorted halves give each left value its window of matches in one sweep.',
    },
    pattern: {
      pick: 'range-queries',
      why: 'P with n + 1 longs; mergeCount(lo, hi): count both halves, then for each left P[i] advance s while P[s] < P[i] + lower and e while P[e] ≤ P[i] + upper; add e − s; merge. O(n log n).',
      not: [
        { id: 'prefix-sums', why: 'Prefix sums turn the question into pairs; counting the pairs fast is the range-query part.' },
        { id: 'sliding-window', why: 'Negative numbers break the sliding window: sums don\'t grow with width.' },
      ],
    },
    watch: {
      viz: 'RangeWalkViz',
      inputs: [
        { label: '[−2, 5, −1], [−2, 2]', input: { mode: 'rangesum', nums: [-2, 5, -1], lower: -2, upper: 2 } },
        { label: '[0], [0, 0]', input: { mode: 'rangesum', nums: [0], lower: 0, upper: 0 } },
      ],
    },
    edges: ['[0], [0, 0] → 1.', '[−2, 5, −1], [−2, 2] → 3.', 'Huge values → use longs for the prefix sums.'],
  },

  'create-sorted-array-through-instructions': {
    aha: 'Keep a count of each value inserted so far. Inserting x costs min(values below x, values above x): two prefix sums over the counts (values above = inserted so far − values ≤ x). A Fenwick tree over the values makes each step O(log max).',
    asks: {
      read: 'Do equal values count toward either side?',
      budget: '10⁵ insertions, values up to 10⁵. Can you keep a real sorted list?',
      observe: 'Inserting [1, 3, 3, 3, 2, 4, 2, 1, 2], what does the 2 at index 4 cost?',
      brute: 'Inserting into a sorted array and counting: what does it cost?',
      pattern: 'Which structure counts "values below x" and "values ≤ x" as values arrive?',
      watch: 'Watch the counts by value grow, and each insertion pay the cheaper side.',
    },
    read: [
      { phrase: 'the number of values already in the container that are strictly less than it', says: 'A prefix count over values below x.' },
      {
        phrase: 'the number already in the container that are strictly greater than it',
        says: '"Greater than x" is (how many are inserted so far) − (how many are ≤ x): both counts come from the same prefix query.',
      },
      { phrase: 'Return the total cost of all insertions, modulo `10^9 + 7`', says: 'Add the minimum of the two each time.' },
    ],
    budget: {
      from: 'n, values ≤ 10⁵',
      rows: [['sorted array inserts', 'n² = 10¹⁰', 'bad', 'too slow'], ['Fenwick over values', 'n log max', 'ok', 'fast']],
      aim: 'O(n log max)',
      note: 'Values are already small: no compression needed.',
    },
    observe: [
      {
        title: 'Pay the cheaper side',
        text: 'Before the 2 at index 4: 1, 3, 3, 3 are in. One is below 2, three are above: cost min(1, 3) = 1.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'value', items: [1, 2, 3, 4] }, { label: 'count', items: [1, 0, 3, 0], marks: { '0': 'hit', '2': 'cur' } }],
          caption: 'min(1, 3) = 1',
        },
      },
      {
        title: 'Equal values are free',
        text: 'Inserting another 3 next to the 3s: values equal to x count on neither side.',
        sketch: { kind: 'array', rows: [{ items: ['< 3', '= 3', '> 3'], marks: { '1': 'dim' } }] },
      },
    ],
    brute: {
      idea: 'Keep a sorted list; insert each value with binary search and count both sides from its position.',
      cost: 'O(n²) for the shifting inserts',
      waste: 'Each insertion shifts up to n elements, though only two counts are needed.',
    },
    pattern: {
      pick: 'range-queries',
      why: 'For i, x: less = bit.prefix(x − 1); more = i − bit.prefix(x); cost += min(less, more); bit.add(x, 1). Return cost mod 10⁹ + 7. O(n log max).',
      not: [
        { id: 'binary-search', why: 'Binary search finds the position in a sorted list, but inserting into the list is O(n).' },
        { id: 'heap-patterns', why: 'Heaps can\'t count how many values are below x.' },
      ],
    },
    watch: {
      viz: 'RangeWalkViz',
      inputs: [
        { label: '[1, 3, 3, 3, 2, 4, 2, 1, 2]', input: { mode: 'instructions', nums: [1, 3, 3, 3, 2, 4, 2, 1, 2] } },
        { label: '[1, 5, 6, 2]', input: { mode: 'instructions', nums: [1, 5, 6, 2] } },
      ],
    },
    edges: ['[1, 5, 6, 2] → 1.', '[1, 2, 3, 6, 5, 4] → 3.', '[1, 3, 3, 3, 2, 4, 2, 1, 2] → 4.'],
  },

  'falling-squares': {
    aha: 'Each square lands on the tallest height under its span [left, left + side), and its top becomes the new height of that whole span. Track heights over intervals: comparing each square with every earlier one that overlaps is O(n²), fine for 1000 squares; a segment tree with lazy "assign max" over compressed coordinates makes it O(n log n). Record the running maximum.',
    asks: {
      read: 'Do squares that only touch at an edge support each other?',
      budget: '1000 squares with coordinates up to 10⁸. Can you keep an array over all coordinates?',
      observe: 'For [[1, 2], [2, 3], [6, 1]], where does the second square land?',
      brute: 'For each square, check every earlier square for overlap: what does it cost?',
      pattern: 'What does a landed square do to the heights under it?',
      watch: 'Watch each square find the tallest height under it and raise its span.',
    },
    read: [
      { phrase: 'It falls straight down until it lands on the x-axis or on top of an earlier square', says: 'Base = max height under its span.' },
      { phrase: 'Squares that only touch at an edge do not support each other', says: 'Spans are half-open: [left, left + side).' },
      {
        phrase: 'record the height of the tallest stack so far',
        says: 'After every square, report the tallest height anywhere so far: a running maximum over the heights of the squares that have landed.',
      },
    ],
    budget: {
      from: 'n ≤ 1000, coordinates ≤ 10⁸',
      rows: [
        ['array over all coordinates', '10⁸ cells', 'bad', 'too big'],
        ['pairwise interval checks', 'n² = 10⁶', 'ok', 'fine'],
        ['segment tree, compressed', 'n log n', 'ok', 'scales'],
      ],
      aim: 'O(n²) or O(n log n)',
      note: 'Compress to the at most 2n distinct edges.',
    },
    observe: [
      {
        title: 'Land on the tallest overlap',
        text: 'Square [1, 2] covers [1, 3), height 2. Square [2, 3] covers [2, 5), overlapping it: lands at 2, top 5.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'height', items: [0, 2, 5, 5, 5, 0, 0], marks: { '2': 'hit', '3': 'hit', '4': 'hit' } }],
          caption: 'tallest 5',
        },
      },
      {
        title: 'Edges don\'t touch',
        text: 'Square [6, 1] covers [6, 7): nothing under it, so it lands on the floor at height 1. The tallest stays 5.',
        sketch: { kind: 'array', rows: [{ label: 'height', items: [0, 2, 5, 5, 5, 0, 1], marks: { '6': 'cur' } }], caption: '[2, 5, 5]' },
      },
    ],
    brute: {
      idea: 'For each square, look at every earlier square; if their spans overlap, its height is a candidate base.',
      cost: 'O(n²)',
      waste: 'With 1000 squares, 10⁶ pair checks are fast enough; the segment tree is the version that still works for 10⁵ squares or more.',
    },
    pattern: {
      pick: 'range-queries',
      why: 'For each square i: base = max over earlier j with overlapping spans of height[j]; height[i] = base + side; best = max(best, height[i]). O(n²); or a lazy segment tree over compressed coordinates for O(n log n).',
      not: [
        { id: 'intervals', why: 'Spans are intervals, but they are compared, not merged.' },
        {
          id: 'monotonic-stack',
          why: 'Heights along the x-axis rise and fall arbitrarily as squares land anywhere; there is no last-in, first-out order for a stack to exploit.',
        },
      ],
    },
    watch: {
      viz: 'RangeWalkViz',
      inputs: [
        { label: '[[1, 2], [2, 3], [6, 1]]', input: { mode: 'squares', positions: [[1, 2], [2, 3], [6, 1]] } },
        { label: 'stacked exactly', input: { mode: 'squares', positions: [[2, 2], [2, 2], [4, 1]] } },
      ],
    },
    edges: ['[[1, 2], [2, 3], [6, 1]] → [2, 5, 5].', '[[100, 100], [200, 100]] → [100, 100] (they only touch).', 'One square → its side.'],
  },
};
