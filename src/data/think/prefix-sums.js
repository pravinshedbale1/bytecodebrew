/** Practice thinking walkthroughs: prefix-sums (format: src/data/think/index.js). */
export default {
  'running-sum-of-1d-array': {
    free: true,
    read: [
      { phrase: '`nums[0] + nums[1] + … + nums[i]`', says: 'Element i is the sum of a prefix: a prefix sum.' },
      { phrase: 'Each element is the previous running sum plus the current value', says: 'Each answer builds on the one before: one pass, O(1) work per element.' },
    ],
    budget: { from: 'nums.length ≤ 1000', n: 1000, aim: 'O(n)', note: 'Re-adding every prefix is O(n²); carrying the total forward is O(n).' },
    observe: [
      {
        title: 'Each total is the previous total plus one value',
        text: 'running[i] = running[i − 1] + nums[i]. Nothing needs to be re-added.',
        sketch: { kind: 'array', rows: [{ label: 'nums', items: [1, 2, 3, 4] }, { label: 'running', items: [1, 3, 6, 10], marks: { 2: 'cur', 1: 'target' } }], caption: '6 = 3 + 3' },
      },
      {
        title: 'It can even be done in place',
        text: 'Overwrite nums[i] with nums[i − 1] + nums[i], left to right.',
      },
    ],
    brute: { idea: 'For every i, add up nums[0 … i] from scratch.', cost: 'O(n²)', waste: 'Each prefix is re-added, though it is the previous prefix plus one value.' },
    pattern: {
      pick: 'prefix-sums',
      why: 'This is the prefix sum itself, the building block of every other problem in this pattern.',
      not: [
        { id: 'sliding-window', why: 'Nothing leaves on the left; every total starts at index 0.' },
        { id: 'dp-linear', why: 'It is technically a one-line DP (each answer from the previous), and that is exactly a prefix sum.' },
      ],
    },
    watch: {
      frames: [
        { title: 'running[0] = 1', text: 'The first total is the first value.', sketch: { kind: 'array', rows: [{ items: [1, '·', '·', '·'], marks: { 0: 'hit' } }] } },
        { title: 'Add as you go', text: '1 + 2 = 3, 3 + 3 = 6, 6 + 4 = 10.', sketch: { kind: 'array', rows: [{ items: [1, 3, 6, 10], marks: { 1: 'hit', 2: 'hit', 3: 'hit' } }] } },
      ],
    },
    edges: ['A single value.', 'Negative values (totals can go down).'],
  },

  'range-sum-query-immutable': {
    read: [
      { phrase: 'The array never changes after construction', says: 'Work done once in the constructor is reused by every query: precompute.' },
      { phrase: '`sumRange` may be called many times, so each query should be fast', says: 'Aim for O(1) per query.' },
      { phrase: '(both ends inclusive)', says: 'sum(left … right) = prefix[right + 1] − prefix[left], with prefix[i] = the sum of the first i values.' },
    ],
    budget: { from: 'nums ≤ 10⁴, up to 10⁴ queries', rows: [['loop over the range each query', '10⁴ × 10⁴ = 10⁸', 'warn'], ['prefix sums, O(1) per query', '10⁴ + 10⁴', 'ok']], aim: 'O(1) per query', note: 'The loop is borderline; with more queries it would not pass. Precomputing makes queries free.' },
    observe: [
      {
        title: 'A range is a difference of two prefixes',
        text: 'The sum of [2, 5] is (sum of the first 6) − (sum of the first 2).',
        sketch: { kind: 'array', rows: [{ label: 'nums', items: [-2, 0, 3, -5, 2, -1], bands: [{ from: 2, to: 5, tone: 'accent', label: 'range' }] }, { label: 'prefix', items: [0, -2, -2, 1, -4, -2, -3], marks: { 2: 'target', 6: 'hit' } }], caption: '−3 − (−2) = −1' },
      },
      {
        title: 'Store one extra slot',
        text: 'prefix has n + 1 entries, with prefix[0] = 0, so ranges starting at 0 need no special case.',
      },
    ],
    brute: { idea: 'Keep the array and add up nums[left … right] on every call.', cost: 'O(n) per query', waste: 'Overlapping ranges are re-added on every query, though the array never changes.' },
    pattern: {
      pick: 'prefix-sums',
      why: 'Precompute prefix sums once (O(n)); each range sum is then one subtraction (O(1)).',
      not: [
        { id: 'range-queries', why: 'A Fenwick or segment tree supports updates too; with an immutable array, plain prefix sums are enough.' },
        { id: 'sliding-window', why: 'Queries jump around; there is no window that moves step by step.' },
      ],
    },
    watch: { viz: 'PrefixQueryViz', inputs: [{ label: 'sumRange(2, 5)', input: { nums: [-2, 0, 3, -5, 2, -1], l: 2, r: 5 } }, { label: 'sumRange(0, 2)', input: { nums: [-2, 0, 3, -5, 2, -1], l: 0, r: 2 } }] },
    edges: ['left = right: a single value.', 'left = 0 (uses prefix[0] = 0).', 'The whole array.'],
  },

  'find-pivot-index': {
    read: [
      { phrase: 'the sum of all values strictly to its left equals the sum of all values strictly to its right', says: 'Left sum and right sum at every index: the left is a running prefix, and the right is the total minus the rest.' },
      { phrase: 'Return the leftmost pivot index', says: 'Scan left to right and stop at the first match.' },
      { phrase: 'or `-1` if there is none', says: 'The scan may end without a match.' },
    ],
    budget: { from: 'nums.length ≤ 10⁴', n: 1e4, aim: 'O(n), O(1) space', note: 'Summing both sides for every index is O(n²) = 10⁸.' },
    observe: [
      {
        title: 'The right sum comes from the total',
        text: 'Knowing the total, right = total − left − nums[i]. So only the left sum needs tracking.',
        sketch: { kind: 'array', rows: [{ items: [1, 7, 3, 6, 5, 6], bands: [{ from: 0, to: 2, tone: 'accent', label: 'left 11' }, { from: 4, to: 5, tone: 'ghost', label: 'right 11' }], marks: { 3: 'hit' } }], caption: 'total 28: right = 28 − 11 − 6 = 11' },
      },
      {
        title: 'One running sum',
        text: 'Check left == total − left − nums[i], then add nums[i] to left and move on.',
      },
    ],
    brute: { idea: 'For each index, add up everything on its left and everything on its right.', cost: 'O(n²)', waste: 'The sums change by one value per step but are recomputed from scratch.' },
    pattern: {
      pick: 'prefix-sums',
      why: 'A running prefix sum gives the left side; the total gives the right side for free: O(n), O(1) space.',
      not: [
        { id: 'two-pointers', why: 'Balancing two pointers from both ends fails with negative values.' },
        { id: 'sliding-window', why: 'There is no window; both sides always reach the array\'s ends.' },
      ],
    },
    watch: {
      frames: [
        { title: 'total = 28', text: 'One pass to sum everything.' },
        { title: 'i = 0, 1, 2: no balance', text: 'left = 0, 1, 8; right = 27, 20, 17.' },
        { title: 'i = 3: left 11, right 11', text: 'Balanced: the answer is 3.', sketch: { kind: 'array', rows: [{ items: [1, 7, 3, 6, 5, 6], marks: { 3: 'hit' } }] } },
      ],
    },
    edges: ['Index 0 is the pivot when the rest sums to 0.', 'The last index is the pivot when everything before sums to 0.', 'No pivot → −1.'],
  },

  'subarray-sum-equals-k': {
    read: [
      { phrase: 'contiguous, non-empty subarrays of `nums` whose values add up to exactly `k`', says: 'Count ranges with a given sum: sum(i, j] = prefix[j] − prefix[i].' },
      { phrase: 'Values can be negative, so a growing window does not always mean a growing sum', says: 'A sliding window won\'t work: validity is not monotone.' },
      { phrase: 'a hash map counting how often each prefix sum has appeared', says: 'For each j, count earlier prefixes equal to prefix[j] − k in O(1).' },
    ],
    budget: { from: 'nums.length ≤ 2 × 10⁴', n: 2e4, aim: 'O(n)', note: 'Every subarray with a running sum is O(n²) = 4 × 10⁸: risky.' },
    observe: [
      {
        title: 'A subarray sum is a difference of prefixes',
        text: 'The subarray ending at j sums to k exactly when some earlier prefix equals prefix[j] − k.',
        sketch: { kind: 'array', rows: [{ label: 'nums', items: [1, 1, 1] }, { label: 'prefix', items: [0, 1, 2, 3], marks: { 3: 'cur', 1: 'hit' } }], caption: 'at the end: 3 − 2 = 1 appeared once → one subarray [1, 1]' },
      },
      {
        title: 'Count, don\'t search',
        text: 'Keep a map from prefix value to how many times it appeared, starting with {0: 1}. Each step adds count[prefix − k] to the answer.',
      },
    ],
    brute: { idea: 'For every start, extend with a running sum and count the ends where it equals k.', cost: 'O(n²)', waste: 'For each end, the matching starts are exactly the earlier prefixes equal to prefix − k, which a map counts instantly.' },
    pattern: {
      pick: 'prefix-sums',
      why: 'Prefix sums turn "subarray sums to k" into "two prefixes differ by k"; a hash map of prefix counts answers it in one pass. O(n).',
      not: [
        { id: 'sliding-window', why: 'With negative values, shrinking a window can increase its sum, so the window logic breaks.' },
        { id: 'hashing', why: 'The map is the tool, but it only works on prefix sums.' },
      ],
    },
    watch: { viz: 'SubarraySumViz', inputs: [{ label: '[1, 1, 1], k = 2', input: { nums: [1, 1, 1], k: 2 } }, { label: '[2, 1, −1, 3, −2, 2], k = 3', input: { nums: [2, 1, -1, 3, -2, 2], k: 3 } }] },
    edges: ['k = 0 with zeros and cancelling values.', 'Negative values.', 'The map must start with {0: 1} (subarrays starting at index 0).'],
  },

  'subarray-sums-divisible-by-k': {
    read: [
      { phrase: 'whose sum is divisible by `k`', says: 'A range sum with a property: prefix differences again.' },
      { phrase: 'Values may be negative.', says: 'Remainders can come out negative in Java: normalise them.' },
      { phrase: 'Two prefix sums with the same remainder modulo `k`', says: 'Divisible differences means equal remainders: count pairs of equal remainders.' },
    ],
    budget: { from: 'nums.length ≤ 3 × 10⁴', n: 3e4, aim: 'O(n + k)', note: 'Every subarray is O(n²) = 9 × 10⁸: too slow.' },
    observe: [
      {
        title: 'Equal remainders bound a divisible subarray',
        text: 'prefix[j] − prefix[i] is divisible by k exactly when both prefixes leave the same remainder.',
        sketch: { kind: 'array', rows: [{ label: 'prefix', items: [0, 4, 9, 9, 7, 4, 5] }, { label: 'mod 5', items: [0, 4, 4, 4, 2, 4, 0], marks: { 1: 'hit', 2: 'hit', 3: 'hit', 5: 'hit', 0: 'target', 6: 'target' } }] },
      },
      {
        title: 'Count pairs as you go',
        text: 'Each new prefix pairs with every earlier prefix of the same remainder: add count[r], then increase it.',
      },
    ],
    brute: { idea: 'From every start, extend with a running sum and count the sums divisible by k.', cost: 'O(n²)', waste: 'Only remainders matter, and equal remainders can be counted instead of enumerated.' },
    pattern: {
      pick: 'prefix-sums',
      why: 'Prefix sums modulo k, with a count per remainder: each new prefix adds the number of earlier prefixes with the same remainder. O(n + k).',
      not: [
        { id: 'sliding-window', why: 'Divisibility isn\'t monotone in the window length.' },
        { id: 'hashing', why: 'The counts are a table, but the insight is about prefix remainders.' },
      ],
    },
    watch: {
      frames: [
        { title: 'Remainders: 0, 4, 4, 4, 2, 4, 0', text: 'Prefix sums 0, 4, 9, 9, 7, 4, 5 taken mod 5.' },
        { title: 'Pairs', text: 'Remainder 0 appears twice (1 pair), remainder 4 four times (6 pairs), remainder 2 once (0 pairs).' },
        { title: 'Answer: 7', text: '1 + 6 = 7 subarrays.' },
      ],
    },
    edges: ['Negative sums: use ((s % k) + k) % k.', 'All zeros: every subarray counts.', 'k larger than every value.'],
  },

  'contiguous-array': {
    read: [
      { phrase: 'an equal number of `0`s and `1`s', says: 'A balance condition on a range.' },
      { phrase: 'Count a 0 as -1 and a 1 as +1', says: 'Then "balanced" means "sums to 0": a prefix-sum question.' },
      { phrase: 'two equal prefix sums as far apart as possible', says: 'Remember the first index of each balance; later equal balances give candidate lengths.' },
    ],
    budget: { from: 'nums.length ≤ 10⁵', n: 1e5, aim: 'O(n)', note: 'Counting from every start is O(n²) = 10¹⁰.' },
    observe: [
      {
        title: 'Turn 0 into −1',
        text: 'A subarray with as many 0s as 1s now sums to 0.',
        sketch: { kind: 'array', rows: [{ label: 'nums', items: [0, 0, 1, 0, 1, 1] }, { label: 'as ±1', items: [-1, -1, 1, -1, 1, 1] }] },
      },
      {
        title: 'Equal running balances bound a balanced subarray',
        text: 'If the balance is the same at two positions, everything between them sums to 0. For the longest, pair each position with the first time its balance appeared.',
        sketch: { kind: 'array', rows: [{ label: 'balance (start = 0)', items: [0, -1, -2, -1, -2, -1, 0], marks: { 0: 'hit', 6: 'hit' } }], caption: 'balance 0 at the start and the end: length 6' },
      },
    ],
    brute: { idea: 'For each start, extend while counting 0s and 1s; record lengths where they are equal.', cost: 'O(n²)', waste: 'Only the running balance matters, and its first occurrence can be looked up.' },
    pattern: {
      pick: 'prefix-sums',
      why: 'Map 0 to −1, keep a running balance, and remember where each balance first appeared: the longest zero-sum subarray in O(n).',
      not: [
        { id: 'sliding-window', why: 'Balance isn\'t monotone in the window size, so you can\'t decide which end to move.' },
        { id: 'hashing', why: 'The first-index map is a hash map, but it works on prefix balances.' },
      ],
    },
    watch: {
      frames: [
        { title: 'Balance 0 at index −1', text: 'Seed the map with {0: −1} so balanced prefixes count.' },
        { title: '[0, 1]: balances −1, 0', text: 'At index 1 the balance is 0 again: length 1 − (−1) = 2.', sketch: { kind: 'array', rows: [{ items: [0, 1], bands: [{ from: 0, to: 1, tone: 'success' }] }] } },
      ],
    },
    edges: ['All 0s or all 1s → 0.', 'The whole array is balanced.', 'Only the first occurrence of each balance is stored.'],
  },

  'product-of-array-except-self': {
    read: [
      { phrase: 'the product of every element of `nums` except `nums[i]`', says: 'Everything to the left of i times everything to the right of i: prefix and suffix products.' },
      { phrase: 'Do not use division', says: 'Total ÷ nums[i] is ruled out (and breaks on zeros).' },
      { phrase: 'run in O(n) time', says: 'Multiplying all others for each i would be O(n²).' },
    ],
    budget: { from: 'nums.length ≤ 10⁵', n: 1e5, aim: 'O(n)', note: 'The nested product is 10¹⁰.' },
    observe: [
      {
        title: 'Left product × right product',
        text: 'For [1, 2, 3, 4] at index 2: left = 1 · 2 = 2, right = 4, answer 8.',
        sketch: { kind: 'array', rows: [{ label: 'nums', items: [1, 2, 3, 4], marks: { 2: 'cur' } }, { label: 'prefix (left of i)', items: [1, 1, 2, 6], marks: { 2: 'hit' } }, { label: 'suffix (right of i)', items: [24, 12, 4, 1], marks: { 2: 'hit' } }], caption: '2 × 4 = 8' },
      },
      {
        title: 'One output array, one running product',
        text: 'Write the prefix products into the answer, then sweep from the right with a single running suffix product.',
      },
    ],
    brute: { idea: 'For each index, multiply every other element.', cost: 'O(n²)', waste: 'Neighbouring answers share almost all of their factors.' },
    pattern: {
      pick: 'prefix-sums',
      why: 'Prefix and suffix products (the multiplicative version of prefix sums) give every answer in O(n), with O(1) extra space.',
      not: [
        { id: 'dp-linear', why: 'The two passes are simple DPs; they are exactly prefix and suffix products.' },
        { id: 'sliding-window', why: 'The excluded element moves, but the "window" is everything else, which a prefix and a suffix describe.' },
      ],
    },
    watch: {
      frames: [
        { title: 'Left pass', text: 'answer = [1, 1, 2, 6] (products to the left).' },
        { title: 'Right pass', text: 'Multiply by the running product to the right: 4 → 24, 4, … answer = [24, 12, 8, 6].', sketch: { kind: 'array', rows: [{ items: [24, 12, 8, 6], marks: { 0: 'hit', 1: 'hit', 2: 'hit', 3: 'hit' } }] } },
      ],
    },
    edges: ['One zero: only its position is non-zero.', 'Two zeros: every answer is 0.', 'Negative values.'],
  },

  'range-sum-query-2d-immutable': {
    read: [
      { phrase: 'Each `sumRegion` call should take O(1) time', says: 'Precompute: a 2D prefix-sum table.' },
      { phrase: 'both inclusive', says: 'Careful with off-by-one: store P with an extra row and column of zeros.' },
    ],
    budget: { from: '200 × 200 grid, up to 10⁴ queries', rows: [['sum each rectangle', '4 × 10⁴ × 10⁴ = 4 × 10⁸', 'warn'], ['2D prefix sums', '4 × 10⁴ + 10⁴', 'ok']], aim: 'O(1) per query', note: 'Building the table is O(m · n) once.' },
    observe: [
      {
        title: 'P[r][c] is the sum of the top-left rectangle',
        text: 'Let P[r][c] be the sum of everything above and to the left of (r, c). Build it with P[r][c] = cell + P[r−1][c] + P[r][c−1] − P[r−1][c−1].',
      },
      {
        title: 'Any rectangle is four corners',
        text: 'Big corner, minus the strip above, minus the strip to the left, plus the overlap that was subtracted twice.',
        sketch: { kind: 'grid', grid: [[0, 0, 0], [0, 1, 1], [0, 1, 1]], marks: { '1,1': 'hit', '1,2': 'hit', '2,1': 'hit', '2,2': 'hit', '0,0': 'cur' }, labels: { '0,0': '+', '0,1': '−', '1,0': '−' }, caption: 'inclusion–exclusion over the corners' },
      },
    ],
    brute: { idea: 'Loop over every cell of the rectangle on each call.', cost: 'O(m · n) per query', waste: 'Overlapping rectangles are re-added on every query, though the grid never changes.' },
    pattern: {
      pick: 'prefix-sums',
      why: 'A 2D prefix-sum table answers any rectangle with four lookups: O(1) per query after O(m · n) setup.',
      not: [
        { id: 'range-queries', why: 'A 2D Fenwick tree supports updates; with an immutable grid, prefix sums are simpler.' },
        { id: 'dp-grid', why: 'Building P looks like a grid DP, but it is just a 2D prefix sum.' },
      ],
    },
    watch: {
      frames: [
        { title: 'Build P', text: 'One pass over the grid with the recurrence; P has one extra row and column of zeros.' },
        { title: 'sumRegion(2, 1, 4, 3)', text: 'P[5][4] − P[2][4] − P[5][1] + P[2][1] = 8.' },
      ],
    },
    edges: ['A single cell.', 'Rectangles touching row 0 or column 0 (the zero padding handles them).', 'The whole grid.'],
  },

  'corporate-flight-bookings': {
    read: [
      { phrase: 'reserves `seats` seats on every flight from `first` to `last` inclusive', says: 'Many range updates (add v to a whole range), read once at the end: a difference array.' },
      { phrase: 'element `i` is the total number of seats booked on flight `i + 1`', says: 'Flights are 1-based; the answer is 0-based.' },
    ],
    budget: { from: 'n, bookings ≤ 2 × 10⁴', rows: [['add to every flight of each booking', '2 × 10⁴ × 2 × 10⁴ = 4 × 10⁸', 'warn'], ['difference array + one prefix sum', '4 × 10⁴', 'ok']], aim: 'O(n + bookings)', note: 'Each booking can cover every flight, so the naive way is quadratic.' },
    observe: [
      {
        title: 'Mark where each booking starts and stops',
        text: '+seats at the first flight and −seats just after the last. Everything in between is implied.',
        sketch: { kind: 'array', rows: [{ label: 'diff after [2, 5, 25]', items: [0, 25, 0, 0, 0, '−25'], marks: { 1: 'hit', 5: 'bad' } }] },
      },
      {
        title: 'One prefix sum rebuilds every flight',
        text: 'Running the marks left to right adds each booking exactly to its range.',
      },
    ],
    brute: { idea: 'For each booking, add seats to every flight from first to last.', cost: 'O(b · n)', waste: 'Each booking touches its whole range, though only its two ends carry information.' },
    pattern: {
      pick: 'prefix-sums',
      why: 'A difference array makes each range update O(1); one prefix sum at the end gives every total. O(n + b).',
      not: [
        { id: 'range-queries', why: 'A segment tree with lazy updates works, but there are no queries in between, so it is overkill.' },
        { id: 'intervals', why: 'Sorting the intervals and sweeping works too, with an extra sort.' },
      ],
    },
    watch: { viz: 'DifferenceArrayViz', inputs: [{ label: '5 flights, bookings [1,2,10], [2,3,20], [2,5,25] (0-based here)', input: { n: 5, updates: [[0, 1, 10], [1, 2, 20], [1, 4, 25]] } }] },
    edges: ['A booking ending at the last flight (no −seats slot needed, or one extra slot).', 'A single flight.', 'Overlapping bookings.'],
  },

  'number-of-submatrices-that-sum-to-target': {
    read: [
      { phrase: 'rectangular submatrices of `matrix` whose values add up to `target`', says: 'The 2D version of Subarray Sum Equals K.' },
      { phrase: 'Fix a pair of rows, collapse the columns between them into one array of sums', says: 'Reduce 2D to 1D: for each pair of rows, the columns become one array.' },
      { phrase: 'using prefix sums and a hash map', says: 'Then count subarrays summing to target, exactly as in the 1D problem.' },
    ],
    budget: { from: 'up to 100 × 100', rows: [['every rectangle with 2D prefix sums', '(100²)² = 10⁸', 'warn'], ['row pairs × 1D count', '100² × 100 = 10⁶', 'ok']], aim: 'O(m² · n)', note: 'Enumerating all rectangles is borderline; the reduction is 100 times faster.' },
    observe: [
      {
        title: 'Two rows turn the grid into one array',
        text: 'Between rows r1 and r2, each column contributes one number: its sum over those rows. Rectangles in that band are subarrays of this array.',
        sketch: { kind: 'grid', grid: [[0, 1, 0], [1, 1, 1], [0, 1, 0]], marks: { '0,0': 'ring', '0,1': 'ring', '0,2': 'ring', '1,0': 'ring', '1,1': 'ring', '1,2': 'ring' }, caption: 'rows 0–1 collapse to [1, 2, 1]' },
      },
      {
        title: 'Count with prefix sums + a map',
        text: 'For each band, run the 1D "subarray sum equals k" count. Sum the counts over all row pairs.',
      },
    ],
    brute: { idea: 'Enumerate every rectangle by its two corners and get each sum from a 2D prefix table.', cost: 'O(m² · n²)', waste: 'For a fixed pair of rows, the column choices are counted pair by pair instead of with one hash-map pass.' },
    pattern: {
      pick: 'prefix-sums',
      why: 'Fix two rows, collapse columns into one array, then count subarrays with the target sum using prefix sums and a hash map: O(m² · n).',
      not: [
        { id: 'sliding-window', why: 'Values can be negative, so no window rule works.' },
        { id: 'dp-grid', why: 'There is no path or optimal choice; we count rectangles by their sums.' },
      ],
    },
    watch: {
      frames: [
        { title: 'Single rows', text: '[0, 1, 0]: two zero-sum subarrays ([0] twice). [1, 1, 1]: none. [0, 1, 0]: two more.' },
        { title: 'Bands of two or three rows', text: 'Column sums [1, 2, 1] or [1, 3, 1]: none sum to 0.' },
        { title: 'Total: 4', text: 'The four single zero cells.' },
      ],
    },
    edges: ['A 1 × 1 grid.', 'Negative values.', 'target = 0 with many zeros.'],
  },
};
