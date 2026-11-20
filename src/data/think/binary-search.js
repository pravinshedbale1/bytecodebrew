/** Practice thinking walkthroughs: binary-search (format: src/data/think/index.js). */
export default {
  'binary-search': {
    free: true,
    read: [
      { phrase: '`nums` is sorted in ascending order', says: 'Sorted input: one comparison with the middle tells you which half to keep.' },
      { phrase: 'Your algorithm must run in O(log n) time', says: 'O(log n) on an array almost always means binary search.' },
      { phrase: 'or `-1` if it is not there', says: 'The search can end with an empty range.' },
    ],
    budget: { from: 'nums.length ≤ 10⁴', n: 1e4, aim: 'O(log n)', note: 'A scan is O(n) and would pass, but the statement asks for log n: about 14 steps here.' },
    observe: [
      {
        title: 'The middle splits the candidates',
        text: 'If target > nums[mid], it can only be to the right; if smaller, only to the left. Half the range is gone after one comparison.',
        sketch: { kind: 'array', rows: [{ items: [-1, 0, 3, 5, 9, 12], marks: { 2: 'cur', 0: 'dim', 1: 'dim' }, tags: { 2: [['mid', 'accent']] } }], caption: 'target 9 > 3: drop the left half' },
      },
      {
        title: 'Pick a loop invariant and stick to it',
        text: 'For example: the answer, if present, is always inside [lo, hi]. Then lo = mid + 1 or hi = mid − 1, and stop when lo > hi.',
      },
    ],
    brute: { idea: 'Scan from the left until target is found.', cost: 'O(n)', waste: 'It ignores the order: most comparisons tell us nothing new.' },
    pattern: {
      pick: 'binary-search',
      why: 'Sorted data and an O(log n) requirement: halve the range by comparing with the middle element.',
      not: [
        { id: 'two-pointers', why: 'Two pointers walk inwards one step at a time: O(n), not O(log n).' },
        { id: 'hashing', why: 'A set finds it in O(1) after O(n) to build, which ignores the sort and the requirement.' },
      ],
    },
    watch: { viz: 'FirstTrueViz', inputs: [{ label: 'first index with a[i] ≥ 9', input: { mode: 'lower', nums: [-1, 0, 3, 5, 9, 12], x: 9 } }, { label: 'target 2 is missing', input: { mode: 'lower', nums: [-1, 0, 3, 5, 9, 12], x: 2 } }] },
    edges: ['One element.', 'target smaller or larger than everything.', 'Compute mid as lo + (hi − lo) / 2 to avoid overflow.'],
  },

  'search-insert-position': {
    read: [
      { phrase: 'Otherwise return the index where it would have to be inserted', says: 'Found or not, the answer is the same position: the first index whose value is ≥ target (the lower bound).' },
      { phrase: 'Run in O(log n) time', says: 'Binary search.' },
    ],
    budget: { from: 'nums.length ≤ 10⁴', n: 1e4, aim: 'O(log n)', note: 'A scan is O(n); the statement asks for log n.' },
    observe: [
      {
        title: 'One question covers both cases',
        text: '"First index with value ≥ target" is target\'s index if present, and its insertion point if not.',
        sketch: { kind: 'array', rows: [{ items: [1, 3, 5, 6], marks: { 0: 'bad', 1: 'bad', 2: 'hit', 3: 'hit' }, tags: { 2: [['first ≥ 5', 'success']] } }], caption: 'false, false, true, true: find the first true' },
      },
      {
        title: 'Search positions 0 … n',
        text: 'n means "after the end", for a target larger than everything. Use hi = n and a loop that keeps the first true inside [lo, hi].',
      },
    ],
    brute: { idea: 'Scan for the first value ≥ target.', cost: 'O(n)', waste: 'The values are sorted, so the false/true boundary can be found by halving.' },
    pattern: {
      pick: 'binary-search',
      why: 'Lower bound: binary search for the first position where nums[i] ≥ target. O(log n).',
      not: [
        { id: 'binary-search-on-answer', why: 'We search positions in an array, not a range of candidate answers.' },
        { id: 'two-pointers', why: 'Nothing to pair; one boundary to find.' },
      ],
    },
    watch: { viz: 'FirstTrueViz', inputs: [{ label: 'target 5 (present)', input: { mode: 'lower', nums: [1, 3, 5, 6], x: 5 } }, { label: 'target 2 (insert)', input: { mode: 'lower', nums: [1, 3, 5, 6], x: 2 } }] },
    edges: ['Smaller than everything → 0.', 'Larger than everything → n.', 'One element.'],
  },

  'first-bad-version': {
    read: [
      { phrase: 'every version after it is bad as well', says: 'good, good, …, good, bad, …, bad: a yes/no that switches once. Find the first yes.' },
      { phrase: 'Call it as few times as possible', says: 'Each call is costly: binary search makes about 31 calls even for 2³¹ versions.' },
    ],
    budget: { from: 'n ≤ 2³¹ − 1', rows: [['try every version', 'up to 2.1 × 10⁹ calls', 'bad'], ['binary search', '31 calls', 'ok']], aim: 'O(log n)', note: 'A scan is hopeless at this size.' },
    observe: [
      {
        title: 'The answers are monotone',
        text: 'Once a version is bad, all later ones are too. So the versions split into a good prefix and a bad suffix.',
        sketch: { kind: 'array', rows: [{ items: [1, 2, 3, 4, 5], marks: { 0: 'hit', 1: 'hit', 2: 'hit', 3: 'bad', 4: 'bad' }, tags: { 3: [['first bad', 'danger']] } }] },
      },
      {
        title: 'Bad mid: the answer is mid or earlier',
        text: 'Keep mid (hi = mid). Good mid: the answer is after it (lo = mid + 1). Stop when lo == hi.',
      },
    ],
    brute: { idea: 'Call isBadVersion(1), (2), … and return the first bad one.', cost: 'O(n)', waste: 'Each call answers for a whole half of the versions, but the scan uses it for one.' },
    pattern: {
      pick: 'binary-search',
      why: 'Binary search for the first true of a monotone predicate. O(log n) calls.',
      not: [
        { id: 'binary-search-on-answer', why: 'Closely related; here the predicate is given as an API rather than something we compute.' },
        { id: 'two-pointers', why: 'Walking pointers inwards still makes O(n) calls.' },
      ],
    },
    watch: {
      frames: [
        { title: 'lo 1, hi 5: mid 3 is good', text: 'The first bad version is after 3: lo = 4.' },
        { title: 'lo 4, hi 5: mid 4 is bad', text: 'It is 4 or earlier: hi = 4.' },
        { title: 'lo = hi = 4', text: 'The first bad version is 4, found with 2 calls.' },
      ],
    },
    edges: ['The first version is bad.', 'Only the last version is bad.', 'n = 2³¹ − 1: compute mid without overflow.'],
  },

  'sqrtx': {
    read: [
      { phrase: 'rounded down to the nearest integer', says: 'An integer answer: the largest r with r² ≤ x.' },
      { phrase: 'Do not use built-in power or square-root functions', says: 'Search for r instead of computing it directly.' },
      { phrase: 'Use a type wide enough for `r × r`', says: 'r² overflows int near 2³¹: use long.' },
    ],
    budget: { from: 'x ≤ 2³¹ − 1', rows: [['count r = 1, 2, 3, …', 'up to 46,341 steps', 'ok'], ['binary search on r', '31 steps', 'ok']], aim: 'O(log x)', note: 'Counting up passes, but binary search is the expected answer.' },
    observe: [
      {
        title: '"r² ≤ x" is true, then false',
        text: 'For x = 8: r = 0, 1, 2 work; r = 3 gives 9 > 8. We want the last r that works.',
        sketch: { kind: 'array', rows: [{ label: 'r', items: [0, 1, 2, 3, 4], marks: { 0: 'hit', 1: 'hit', 2: 'hit', 3: 'bad', 4: 'bad' }, tags: { 2: [['last ok', 'success']] } }] },
      },
      {
        title: 'Binary search the r, not the array',
        text: 'Search r in [0, x]; check mid · mid ≤ x in 64 bits.',
      },
    ],
    brute: { idea: 'Try r = 1, 2, 3, … while (r + 1)² ≤ x.', cost: 'O(√x)', waste: 'The answers are sorted (true … false); halving finds the boundary in log x steps.' },
    pattern: {
      pick: 'binary-search',
      why: 'Binary search for the last r with r² ≤ x: a monotone predicate over numbers. O(log x).',
      not: [
        { id: 'binary-search-on-answer', why: 'It is the same idea; the predicate is a direct check rather than a simulation.' },
        { id: 'math-for-interviews', why: 'Newton\'s method also works in O(log x), with care for integer rounding.' },
      ],
    },
    watch: { viz: 'FirstTrueViz', inputs: [{ label: 'x = 8', input: { mode: 'sqrt', x: 8 } }, { label: 'x = 40', input: { mode: 'sqrt', x: 40 } }] },
    edges: ['x = 0 and x = 1.', 'Perfect squares.', 'x = 2³¹ − 1 (overflow if mid · mid is an int).'],
  },

  'guess-number-higher-or-lower': {
    read: [
      { phrase: '`-1` if `num` is higher than the picked number', says: 'Each guess says which side the pick is on: halve the range.' },
      { phrase: 'between `1` and `n`', says: 'Search the numbers 1 … n, not an array.' },
    ],
    budget: { from: 'n ≤ 2³¹ − 1', rows: [['guess 1, 2, 3, …', 'up to 2.1 × 10⁹', 'bad'], ['binary search', '31 guesses', 'ok']], aim: 'O(log n)', note: 'The range is huge; halving is the only option.' },
    observe: [
      {
        title: 'Each answer removes half',
        text: 'Guess the middle. Too high → keep the lower half; too low → the upper half.',
        sketch: { kind: 'array', rows: [{ label: '1 … 10', items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], marks: { 4: 'cur', 0: 'dim', 1: 'dim', 2: 'dim', 3: 'dim' } }], caption: 'guess 5: too low, keep 6 … 10' },
      },
      {
        title: 'Mind the overflow',
        text: 'With n near 2³¹, (lo + hi) / 2 overflows; use lo + (hi − lo) / 2.',
      },
    ],
    brute: { idea: 'Guess 1, 2, 3, … until the API returns 0.', cost: 'O(n)', waste: 'Each "higher/lower" answer is used for one number instead of half the range.' },
    pattern: {
      pick: 'binary-search',
      why: 'Classic binary search over a range of numbers, steered by the API\'s answer. O(log n).',
      not: [
        { id: 'binary-search-on-answer', why: 'Very close; here the API answers directly instead of us checking feasibility.' },
        { id: 'two-pointers', why: 'Moving bounds one step at a time is linear.' },
      ],
    },
    watch: {
      frames: [
        { title: 'Guess 5: too low', text: 'Keep 6 … 10.' },
        { title: 'Guess 8: too high', text: 'Keep 6 … 7.' },
        { title: 'Guess 6: correct', text: 'Found in 3 guesses.' },
      ],
    },
    edges: ['The pick is 1 or n.', 'n = 1.', 'n = 2³¹ − 1 (overflow in mid).'],
  },

  'find-first-and-last-position-of-element-in-sorted-array': {
    read: [
      { phrase: 'may contain duplicates', says: 'target can occupy a whole block; we need both of its ends.' },
      { phrase: 'Return the first and the last index', says: 'Two boundaries: first index ≥ target, and first index > target (minus one).' },
      { phrase: 'a linear scan over the duplicates is not enough', says: 'Finding one copy and expanding is O(k): two binary searches instead.' },
    ],
    budget: { from: 'nums.length ≤ 10⁵', n: 1e5, aim: 'O(log n)', note: 'A scan, or expanding from one match, can be O(n).' },
    observe: [
      {
        title: 'Two boundaries in one sorted array',
        text: 'first = first index with a[i] ≥ target; last = (first index with a[i] > target) − 1.',
        sketch: { kind: 'array', rows: [{ items: [5, 7, 7, 8, 8, 10], bands: [{ from: 3, to: 4, tone: 'success', label: '8s' }], tags: { 3: [['≥ 8', 'success']], 5: [['> 8', 'warn']] } }] },
      },
      {
        title: 'Same search, different condition',
        text: 'Write one lower-bound function and call it with ≥ and > (or target and target + 1).',
      },
    ],
    brute: { idea: 'Scan and record the first and last index where target appears.', cost: 'O(n)', waste: 'Both boundaries are where a sorted condition flips, which binary search finds in O(log n).' },
    pattern: {
      pick: 'binary-search',
      why: 'Two binary searches: lower bound for ≥ target and for > target. O(log n).',
      not: [
        { id: 'two-pointers', why: 'Expanding left and right from one match is O(k) for k duplicates.' },
        { id: 'hashing', why: 'A map of value → positions ignores the sort and costs O(n) to build.' },
      ],
    },
    watch: { viz: 'FirstTrueViz', inputs: [{ label: 'first index with a[i] ≥ 8', input: { mode: 'lower', nums: [5, 7, 7, 8, 8, 10], x: 8 } }, { label: 'last 8', input: { mode: 'upper', nums: [5, 7, 7, 8, 8, 10], x: 8 } }] },
    edges: ['target missing → [−1, −1].', 'An empty array.', 'The whole array equals target.'],
  },

  'search-a-2d-matrix': {
    read: [
      { phrase: 'Every row of `matrix` is sorted in ascending order', says: 'Each row is sorted…' },
      { phrase: 'the first value of each row is greater than the last value of the row before it', says: '…and rows follow each other: reading row by row gives one sorted list.' },
      { phrase: 'Run in O(log(m · n)) time', says: 'One binary search over all m · n cells.' },
    ],
    budget: { from: 'up to 100 × 100', n: 1e4, aim: 'O(log(m · n))', note: 'Scanning all cells is 10⁴: fine for time, but not what is asked.' },
    observe: [
      {
        title: 'The grid is one sorted array in disguise',
        text: 'Position k of that array is cell (k / n, k % n). Binary search over k = 0 … m · n − 1.',
        sketch: { kind: 'array', rows: [{ items: [1, 3, 5, 7, 10, 11, 16, 20, 23, 30, 34, 60], bands: [{ from: 0, to: 3, tone: 'ghost', label: 'row 0' }, { from: 4, to: 7, tone: 'accent', label: 'row 1' }, { from: 8, to: 11, tone: 'ghost', label: 'row 2' }] }] },
      },
      {
        title: 'Only the index maths is new',
        text: 'mid = 5 → row 5 / 4 = 1, column 5 % 4 = 1 → value 11.',
      },
    ],
    brute: { idea: 'Check every cell.', cost: 'O(m · n)', waste: 'The whole grid is sorted, so each comparison could discard half of it.' },
    pattern: {
      pick: 'binary-search',
      why: 'Treat the matrix as one sorted array of m · n values and binary search it, converting index → (row, column).',
      not: [
        { id: 'two-pointers', why: 'The staircase walk from the top-right corner is O(m + n); it is what you need when rows don\'t continue each other (Search a 2D Matrix II).' },
        { id: 'matrix-simulation', why: 'Nothing is walked cell by cell; we jump by halves.' },
      ],
    },
    watch: {
      frames: [
        { title: 'lo 0, hi 11: mid 5 → 11', text: 'target 3 < 11: hi = 4.' },
        { title: 'lo 0, hi 4: mid 2 → 5', text: '3 < 5: hi = 1.' },
        { title: 'lo 0, hi 1: mid 0 → 1, then mid 1 → 3', text: 'Found: true.' },
      ],
    },
    edges: ['A single row or a single column.', 'target smaller than the first cell.', 'target between two rows.'],
  },

  'find-minimum-in-rotated-sorted-array': {
    read: [
      { phrase: 'some prefix was moved to the end', says: 'Two sorted runs; the minimum is where the second run starts (the "drop").' },
      { phrase: 'It may also have been rotated by a full cycle and be sorted again', says: 'The array might not have a drop at all: then the minimum is the first value.' },
      { phrase: 'in O(log n) time', says: 'Binary search for the drop.' },
    ],
    budget: { from: 'nums.length ≤ 5000', n: 5000, aim: 'O(log n)', note: 'A scan is fine for time; log n is the requirement.' },
    observe: [
      {
        title: 'Compare the middle with the right end',
        text: 'If nums[mid] > nums[hi], the drop is to the right of mid. Otherwise mid … hi is sorted, so the minimum is at mid or to its left.',
        sketch: { kind: 'array', rows: [{ items: [3, 4, 5, 1, 2], marks: { 2: 'cur', 4: 'target', 3: 'hit' }, tags: { 2: [['mid', 'accent']], 4: [['hi', 'warn']] } }], caption: '5 > 2: the drop is on the right' },
      },
      {
        title: 'Why the right end, not the left',
        text: 'The right end always belongs to the second run (or the only run), so comparing with it is never ambiguous.',
      },
    ],
    brute: { idea: 'Scan for the smallest value.', cost: 'O(n)', waste: 'Each comparison with the right end rules out half the array.' },
    pattern: {
      pick: 'binary-search',
      why: 'Binary search on "is mid in the first run?" (nums[mid] > nums[hi]): the first index where that becomes false is the minimum. O(log n).',
      not: [
        { id: 'binary-search-on-answer', why: 'We search positions in the array, not a range of answers.' },
        { id: 'two-pointers', why: 'Walking inwards is linear.' },
      ],
    },
    watch: { viz: 'FirstTrueViz', inputs: [{ label: '[3, 4, 5, 1, 2]', input: { mode: 'rotmin', nums: [3, 4, 5, 1, 2] } }, { label: '[4, 5, 6, 7, 0, 1, 2]', input: { mode: 'rotmin', nums: [4, 5, 6, 7, 0, 1, 2] } }] },
    edges: ['Not rotated (sorted): the first value.', 'Two elements.', 'The minimum is the last element.'],
  },

  'search-in-rotated-sorted-array': {
    read: [
      { phrase: 'rotated at an unknown index', says: 'Two sorted runs. Around any mid, at least one side is sorted.' },
      { phrase: 'Run in O(log n) time', says: 'One modified binary search.' },
      { phrase: 'it consists of two sorted runs', says: 'Use the sorted side to decide where the target can be.' },
    ],
    budget: { from: 'nums.length ≤ 5000', n: 5000, aim: 'O(log n)', note: 'Scanning is O(n); the requirement is log n.' },
    observe: [
      {
        title: 'One half is always sorted',
        text: 'If nums[lo] ≤ nums[mid], the left half is sorted; otherwise the right half is.',
        sketch: { kind: 'array', rows: [{ items: [4, 5, 6, 7, 0, 1, 2], marks: { 3: 'cur' }, bands: [{ from: 0, to: 3, tone: 'success', label: 'sorted' }] }] },
      },
      {
        title: 'Is the target inside the sorted half\'s range?',
        text: 'With a sorted half, a simple range check says whether the target can be there. If yes, search it; if not, search the other half.',
      },
    ],
    brute: { idea: 'Check every index.', cost: 'O(n)', waste: 'Each comparison could rule out half the array.' },
    pattern: {
      pick: 'binary-search',
      why: 'Modified binary search: find the sorted half, check whether target lies in its range, and keep the right half. O(log n).',
      not: [
        { id: 'two-pointers', why: 'Linear.' },
        { id: 'sorting-and-selection', why: 'Re-sorting loses the original indices and costs O(n log n).' },
      ],
    },
    watch: { viz: 'RotatedSearchViz', inputs: [{ label: 'target 0', input: { nums: [4, 5, 6, 7, 0, 1, 2], target: 0 } }, { label: 'target 3 (missing)', input: { nums: [4, 5, 6, 7, 0, 1, 2], target: 3 } }] },
    edges: ['Not rotated.', 'One element.', 'target at the rotation point.'],
  },

  'find-peak-element': {
    read: [
      { phrase: 'strictly greater than both of its neighbours', says: 'A local maximum, not the global one.' },
      { phrase: 'Treat the positions just outside the array as `−∞`', says: 'Walking uphill must eventually hit a peak (the edges count as down).' },
      { phrase: 'Return the index of any peak', says: 'Any one will do: we can follow a slope instead of comparing everything.' },
    ],
    budget: { from: 'nums.length ≤ 1000', n: 1000, aim: 'O(log n)', note: 'A scan for the first drop is O(n); log n is the requirement.' },
    observe: [
      {
        title: 'Follow the uphill side',
        text: 'If nums[mid] < nums[mid + 1], the values rise to the right, and the edge is −∞, so a peak exists on the right. Otherwise one exists at mid or to its left.',
        sketch: { kind: 'array', rows: [{ items: [1, 2, 1, 3, 5, 6, 4], marks: { 3: 'cur', 4: 'target', 5: 'hit' }, tags: { 3: [['mid', 'accent']] } }], caption: '3 < 5: go right; the peak 6 is there' },
      },
      {
        title: 'Not sorted, still binary search',
        text: 'Binary search only needs a test that says which half surely contains an answer.',
      },
    ],
    brute: { idea: 'Walk from the left until the values first drop; the element before the drop is a peak.', cost: 'O(n)', waste: 'A single neighbour comparison can rule out half the array.' },
    pattern: {
      pick: 'binary-search',
      why: 'Binary search on the slope: move towards the higher neighbour, and the range always contains a peak. O(log n).',
      not: [
        { id: 'sorting-and-selection', why: 'Finding the global maximum is O(n) and more than asked.' },
        { id: 'two-pointers', why: 'Walking inwards is linear.' },
      ],
    },
    watch: { viz: 'FirstTrueViz', inputs: [{ label: '[1, 2, 3, 1]', input: { mode: 'peak', nums: [1, 2, 3, 1] } }, { label: '[1, 2, 1, 3, 5, 6, 4]', input: { mode: 'peak', nums: [1, 2, 1, 3, 5, 6, 4] } }] },
    edges: ['One element: index 0.', 'Strictly increasing: the last index.', 'Strictly decreasing: index 0.'],
  },

  'search-in-rotated-sorted-array-ii': {
    read: [
      { phrase: 'may contain duplicates', says: 'With duplicates, nums[lo] == nums[mid] == nums[hi] can hide which side is sorted.' },
      { phrase: 'rotated at an unknown index `k`', says: 'Still two sorted runs, as in the version without duplicates.' },
      { phrase: 'Try to use as few steps as you can', says: 'Logarithmic on average; the worst case (all equal) has to be linear.' },
    ],
    budget: { from: 'nums.length ≤ 5000', n: 5000, aim: 'O(log n) average, O(n) worst', note: 'With [1, 1, 1, …, 1, 2, 1, 1] no method can avoid looking at most elements.' },
    observe: [
      {
        title: 'Same as before, when the ends differ',
        text: 'Find the sorted half and check whether target is in its range.',
      },
      {
        title: 'Ties hide the sorted side',
        text: 'If nums[lo] == nums[mid] == nums[hi], we can\'t tell. Shrink both ends by one and continue.',
        sketch: { kind: 'array', rows: [{ items: [1, 0, 1, 1, 1], marks: { 0: 'target', 2: 'cur', 4: 'target' } }], caption: 'lo, mid and hi are all 1: drop both ends' },
      },
    ],
    brute: { idea: 'Scan every element.', cost: 'O(n)', waste: 'When the ends differ, half the array can be ruled out at once.' },
    pattern: {
      pick: 'binary-search',
      why: 'Rotated binary search, shrinking the ends when all three values tie. O(log n) typically, O(n) in the worst case.',
      not: [
        { id: 'two-pointers', why: 'Always linear.' },
        { id: 'hashing', why: 'A set answers membership in O(1) after O(n) building, ignoring the structure.' },
      ],
    },
    watch: {
      frames: [
        { title: '[2,5,6,0,0,1,2], target 0', text: 'lo = 2, mid = 0, hi = 2: mid is in the right run.' },
        { title: 'The right half [0,0,1,2] is sorted', text: '0 is in its range: search it. Found: true.' },
      ],
    },
    edges: ['All values equal.', 'target missing.', 'Duplicates at both ends.'],
  },

  'median-of-two-sorted-arrays': {
    read: [
      { phrase: 'each sorted in ascending order', says: 'Two sorted arrays: the median is defined by how many values fall on its left.' },
      { phrase: 'the average of the two middle values', says: 'Handle even and odd totals.' },
      { phrase: 'The intended solution runs in O(log(m + n)) time', says: 'Merging is O(m + n); we must binary search something.' },
    ],
    budget: { from: 'up to 1000 + 1000 values', rows: [['merge up to the middle', '2000 steps', 'ok'], ['binary search the cut', '≈ 10 steps', 'ok']], aim: 'O(log min(m, n))', note: 'Both pass at this size; the question is about the logarithmic idea.' },
    observe: [
      {
        title: 'Cut both arrays so the left side holds half',
        text: 'Take i values from the shorter array and j = half − i from the other. The cut is right when every left value ≤ every right value.',
        sketch: { kind: 'array', rows: [{ label: 'nums1', items: [1, 3, 8, 9], bands: [{ from: 0, to: 1, tone: 'accent', label: 'left' }] }, { label: 'nums2', items: [2, 4, 5, 7], bands: [{ from: 0, to: 1, tone: 'accent', label: 'left' }] }], caption: 'left {1, 3, 2, 4} ≤ right {8, 9, 5, 7}: median (4 + 5) / 2' },
      },
      {
        title: 'Binary search i',
        text: 'If nums1[i − 1] > nums2[j], i is too big; if nums2[j − 1] > nums1[i], too small. Only the shorter array\'s cut is searched.',
      },
    ],
    brute: { idea: 'Concatenate and sort, then read the middle.', cost: 'O((m + n) log(m + n))', waste: 'Both arrays are already sorted; only the position of one cut needs finding.' },
    pattern: {
      pick: 'binary-search',
      why: 'Binary search the partition of the shorter array; the other partition follows. O(log min(m, n)).',
      not: [
        { id: 'two-pointers', why: 'A merge walk to the middle is O(m + n): correct, not logarithmic.' },
        { id: 'heap-patterns', why: 'Two heaps track a running median of a stream; here the data is static and sorted.' },
      ],
    },
    watch: {
      frames: [
        { title: 'nums1 = [1, 3], nums2 = [2]', text: 'Total 3, half = 2. Search the cut in the shorter array, [2].' },
        { title: 'Cut: one value from each side', text: 'Left {1, 2}, right {3}: valid. Odd total → median is the largest left value: 2.' },
      ],
    },
    edges: ['One array empty.', 'All of one array smaller than the other.', 'Even and odd totals; use ±∞ for empty sides of a cut.'],
  },

  'find-in-mountain-array': {
    read: [
      { phrase: 'values strictly increase up to `arr[p]` and strictly decrease after it', says: 'Two sorted slopes around a peak: find the peak, then binary search each slope.' },
      { phrase: 'Return the **smallest** index', says: 'Search the increasing slope first; only if it fails, the decreasing one.' },
      { phrase: 'Calling `get` more than **100** times is treated as a wrong answer', says: 'n is 10⁴: three binary searches use about 3 × 14 = 42 calls; a scan is impossible.' },
    ],
    budget: { from: 'length ≤ 10⁴, at most 100 get calls', rows: [['scan from the left', 'up to 10⁴ calls', 'bad'], ['three binary searches', '≈ 42 calls', 'ok']], aim: 'O(log n) calls', note: 'The call limit decides it.' },
    observe: [
      {
        title: 'Find the peak by comparing neighbours',
        text: 'arr[mid] < arr[mid + 1] means we are on the uphill side; the peak is to the right.',
        sketch: { kind: 'array', rows: [{ items: [1, 2, 3, 4, 5, 3, 1], marks: { 4: 'hit' }, tags: { 4: [['peak', 'success']] } }] },
      },
      {
        title: 'Then two ordinary searches',
        text: 'The left slope is ascending; the right slope is descending (flip the comparison). The left one first, for the smallest index.',
      },
    ],
    brute: { idea: 'Read values from the left until target appears.', cost: 'O(n)', waste: 'It needs far more than the 100 calls allowed.' },
    pattern: {
      pick: 'binary-search',
      why: 'Three binary searches: the peak, the ascending side, then the descending side. O(log n) calls.',
      not: [
        { id: 'two-pointers', why: 'Any linear walk breaks the call limit.' },
        { id: 'binary-search-on-answer', why: 'We search positions of a fixed array, not a range of answers.' },
      ],
    },
    watch: {
      frames: [
        { title: 'Peak search', text: 'The peak is index 4 (value 5).' },
        { title: 'Ascending side [0, 4]', text: 'target 3 is at index 2: return 2 (no need to search the right side, whose 3 is at index 5).' },
      ],
    },
    edges: ['target is the peak itself.', 'target only on the descending side.', 'target missing → −1.'],
  },
};
