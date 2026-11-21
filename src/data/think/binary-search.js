/** Practice thinking walkthroughs: binary-search (format: src/data/think/index.js). */
export default {
  'binary-search': {
    free: true,
    aha: 'Because the array is sorted, comparing the target with the middle value tells you which half it must be in. Throw the other half away and repeat: about 14 looks for 10⁴ values.',
    asks: {
      observe: 'Looking for 9 in [−1, 0, 3, 5, 9, 12], you check the middle value 3. Which half can you throw away?',
      pattern: 'What does one comparison with the middle tell you when the array is sorted?',
    },
    read: [
      { phrase: '`nums` is sorted in ascending order', says: 'Sorted input: one comparison with the middle tells you which half to keep.' },
      { phrase: 'Your algorithm must run in O(log n) time', says: 'O(log n) on an array almost always means halving: binary search.' },
      { phrase: 'or `-1` if it is not there', says: 'The search can end with nothing left to look at.' },
    ],
    budget: { from: 'nums.length ≤ 10⁴', n: 1e4, aim: 'O(log n)', note: 'A scan is O(n) and would pass, but the statement asks for log n: about 14 steps here.' },
    observe: [
      {
        title: 'The middle splits the candidates',
        text: 'If the target is bigger than nums[mid], it can only be on the right; if smaller, only on the left. Half the candidates are gone after one comparison.',
        sketch: { kind: 'array', rows: [{ items: [-1, 0, 3, 5, 9, 12], marks: { 2: 'cur', 0: 'dim', 1: 'dim' }, tags: { 2: [['mid', 'accent']] } }], caption: '9 > 3: drop the left half' },
      },
      {
        title: 'Keep the answer inside [lo, hi]',
        text: 'Decide what [lo, hi] means and never break it: "if the target is here at all, it is between lo and hi". Then lo = mid + 1 or hi = mid − 1, and stop when lo passes hi.',
        sketch: { kind: 'array', rows: [{ items: [-1, 0, 3, 5, 9, 12], bands: [{ from: 3, to: 5, tone: 'accent', label: 'still possible' }], tags: { 3: [['lo', 'interview']], 5: [['hi', 'accent']] } }] },
      },
    ],
    brute: { idea: 'Scan from the left until the target is found.', cost: 'O(n)', waste: 'It ignores the order: almost every comparison tells it nothing new.' },
    pattern: {
      pick: 'binary-search',
      why: 'Sorted data and a log n requirement: halve the range by comparing with the middle value.',
      not: [
        { id: 'two-pointers', why: 'Two pointers walk inwards one step at a time: O(n), not O(log n).' },
        { id: 'hashing', why: 'A set finds it in one step after O(n) to build, which ignores the sort and the requirement.' },
      ],
    },
    watch: { viz: 'FirstTrueViz', inputs: [{ label: 'first value ≥ 9 (it is 9 itself)', input: { mode: 'lower', nums: [-1, 0, 3, 5, 9, 12], x: 9 } }, { label: 'target 2 is missing', input: { mode: 'lower', nums: [-1, 0, 3, 5, 9, 12], x: 2 } }] },
    edges: ['One element: [5], target 5 → 0.', 'Smaller than everything: [1, 3], target 0 → −1.', 'Larger than everything: [1, 3], target 9 → −1.'],
  },

  'search-insert-position': {
    aha: 'Whether or not the target is present, the answer is the same position: the first index whose value is at least the target. Binary search for that first "yes".',
    asks: {
      observe: 'In [1, 3, 5, 6], mark each value "≥ 5?" as yes or no. Where does the first yes sit? Now do the same for 2.',
      pattern: 'Found or not found, can one question cover both cases?',
    },
    read: [
      { phrase: 'Otherwise return the index where it would have to be inserted', says: 'Found or not, the answer is the same position: the first index whose value is ≥ the target.' },
      { phrase: 'Run in O(log n) time', says: 'Binary search.' },
    ],
    budget: { from: 'nums.length ≤ 10⁴', n: 1e4, aim: 'O(log n)', note: 'A scan is O(n); the statement asks for log n.' },
    observe: [
      {
        title: 'One question covers both cases',
        text: '"First index with value ≥ target" is the target\'s index if it is there, and its insertion point if it isn\'t.',
        sketch: { kind: 'array', rows: [{ items: [1, 3, 5, 6], marks: { 0: 'bad', 1: 'bad', 2: 'hit', 3: 'hit' }, tags: { 2: [['first ≥ 5', 'success']] } }], caption: 'no, no, yes, yes: find the first yes' },
      },
      {
        title: 'Search positions 0 … n',
        text: 'Position n means "after the end", for a target bigger than everything.',
        sketch: { kind: 'array', rows: [{ items: [1, 3, 5, 6, '·'], marks: { 4: 'target' }, tags: { 4: [['n: insert 7 here', 'warn']] } }] },
      },
    ],
    brute: { idea: 'Scan for the first value that is at least the target.', cost: 'O(n)', waste: 'The yes/no answers are sorted (no … no, yes … yes), so halving finds the switch.' },
    pattern: {
      pick: 'binary-search',
      why: 'Binary search for the first position where nums[i] ≥ target. O(log n).',
      not: [
        { id: 'binary-search-on-answer', why: 'We search positions in an array, not a range of possible answers.' },
        { id: 'two-pointers', why: 'Nothing to pair; there is one switch point to find.' },
      ],
    },
    watch: { viz: 'FirstTrueViz', inputs: [{ label: 'target 5 (present)', input: { mode: 'lower', nums: [1, 3, 5, 6], x: 5 } }, { label: 'target 2 (insert)', input: { mode: 'lower', nums: [1, 3, 5, 6], x: 2 } }] },
    edges: ['Smaller than everything: [1, 3], 0 → 0.', 'Larger than everything: [1, 3], 7 → 2.', 'One element: [4], 4 → 0.'],
  },

  'first-bad-version': {
    aha: 'The versions read good, good, …, good, bad, …, bad: the answer flips only once. Check the middle version: bad means the first bad one is here or earlier, good means it is later. Halve until one version is left.',
    asks: {
      observe: 'With 5 versions and the first bad one at 4, what does checking version 3 tell you?',
      pattern: 'If every version after a bad one is also bad, what shape do the answers have?',
    },
    read: [
      { phrase: 'every version after it is bad as well', says: 'good, good, …, bad, bad: a yes/no that flips only once. Find the first yes.' },
      { phrase: 'Call it as few times as possible', says: 'Each call is costly: binary search needs about 31 calls even for 2³¹ versions.' },
    ],
    budget: { from: 'n ≤ 2³¹ − 1', rows: [['try every version', 'up to 2.1 × 10⁹ calls', 'bad'], ['binary search', '31 calls', 'ok']], aim: 'O(log n)', note: 'A scan is hopeless at this size.' },
    observe: [
      {
        title: 'The answers flip only once',
        text: 'Once a version is bad, all later ones are too. So the versions split into a good part and a bad part.',
        sketch: { kind: 'array', rows: [{ items: [1, 2, 3, 4, 5], marks: { 0: 'hit', 1: 'hit', 2: 'hit', 3: 'bad', 4: 'bad' }, tags: { 3: [['first bad', 'danger']] } }] },
      },
      {
        title: 'Bad middle: keep it; good middle: go right',
        text: 'If mid is bad, the answer is mid or earlier (hi = mid). If it is good, the answer is after it (lo = mid + 1). Stop when lo = hi.',
        sketch: { kind: 'array', rows: [{ items: [1, 2, 3, 4, 5], marks: { 2: 'cur', 0: 'dim', 1: 'dim' }, tags: { 2: [['good', 'success']] } }], caption: 'version 3 is good: search 4 … 5' },
      },
    ],
    brute: { idea: 'Call isBadVersion(1), (2), … and return the first bad one.', cost: 'O(n)', waste: 'Each call could rule out half of the remaining versions, but the scan uses it for one.' },
    pattern: {
      pick: 'binary-search',
      why: 'Binary search for the first "yes" of a yes/no that flips once. O(log n) calls.',
      not: [
        { id: 'binary-search-on-answer', why: 'Closely related; here the yes/no is given as an API rather than something we compute.' },
        { id: 'two-pointers', why: 'Walking pointers inwards still makes O(n) calls.' },
      ],
    },
    watch: {
      frames: [
        { title: 'lo 1, hi 5: version 3 is good', text: 'The first bad version is after 3: lo = 4.', sketch: { kind: 'array', rows: [{ items: [1, 2, 3, 4, 5], marks: { 2: 'hit', 0: 'dim', 1: 'dim' } }] } },
        { title: 'lo 4, hi 5: version 4 is bad', text: 'It is 4 or earlier: hi = 4.', sketch: { kind: 'array', rows: [{ items: [1, 2, 3, 4, 5], marks: { 3: 'bad', 0: 'dim', 1: 'dim', 2: 'dim', 4: 'dim' } }] } },
        { title: 'lo = hi = 4 → 4', text: 'Found with 2 calls.', sketch: { kind: 'array', rows: [{ items: [1, 2, 3, 4, 5], marks: { 3: 'hit' } }] } },
      ],
    },
    edges: ['The first version is bad: n 3, bad 1 → 1.', 'Only the last is bad: n 3, bad 3 → 3.', 'n = 2³¹ − 1: compute mid as lo + (hi − lo) / 2 → no overflow.'],
  },

  'sqrtx': {
    aha: 'The answer is the largest r with r × r ≤ x. Check a middle r: if its square fits, the answer is r or bigger; if not, smaller. Binary search r between 0 and x.',
    asks: {
      observe: 'For x = 8, which of r = 0, 1, 2, 3, 4 have r × r ≤ 8? Where does it switch?',
      pattern: 'You are not searching an array. What range of numbers are you searching, and what yes/no splits it?',
    },
    read: [
      { phrase: 'rounded down to the nearest integer', says: 'A whole-number answer: the largest r with r² ≤ x.' },
      { phrase: 'Do not use built-in power or square-root functions', says: 'Search for r instead of computing it directly.' },
      { phrase: 'Use a type wide enough for `r × r`', says: 'r² overflows int near 2³¹: use long.' },
    ],
    budget: { from: 'x ≤ 2³¹ − 1', rows: [['count r = 1, 2, 3, …', 'up to 46,341 steps', 'ok'], ['binary search on r', '31 steps', 'ok']], aim: 'O(log x)', note: 'Counting up passes, but binary search is the expected answer.' },
    observe: [
      {
        title: '"r × r ≤ x" is yes, then no',
        text: 'For x = 8: r = 0, 1, 2 fit; r = 3 gives 9 > 8. We want the last r that fits.',
        sketch: { kind: 'array', rows: [{ label: 'r', items: [0, 1, 2, 3, 4], marks: { 0: 'hit', 1: 'hit', 2: 'hit', 3: 'bad', 4: 'bad' }, tags: { 2: [['last fit', 'success']] } }] },
      },
      {
        title: 'Binary search the r, not an array',
        text: 'Search r in [0, x], checking mid × mid ≤ x in 64-bit arithmetic.',
        sketch: { kind: 'array', rows: [{ label: 'r range for x = 8', items: [0, 1, 2, 3, 4, 5, 6, 7, 8], marks: { 4: 'cur' }, tags: { 4: [['16 > 8', 'danger']] } }], caption: 'too big: search 0 … 3' },
      },
    ],
    brute: { idea: 'Try r = 1, 2, 3, … while (r + 1)² ≤ x.', cost: 'O(√x)', waste: 'The answers are sorted (yes … no); halving finds the switch in about 31 steps.' },
    pattern: {
      pick: 'binary-search',
      why: 'Binary search for the last r with r² ≤ x: a yes/no that flips once over a range of numbers. O(log x).',
      not: [
        { id: 'binary-search-on-answer', why: 'It is the same idea; the check is a direct multiplication rather than a simulation.' },
        { id: 'math-for-interviews', why: 'Newton\'s method also works in O(log x), with care for integer rounding.' },
      ],
    },
    watch: { viz: 'FirstTrueViz', inputs: [{ label: 'x = 8', input: { mode: 'sqrt', x: 8 } }, { label: 'x = 40', input: { mode: 'sqrt', x: 40 } }] },
    edges: ['x = 0 → 0 and x = 1 → 1.', 'A perfect square: 16 → 4.', 'x = 2³¹ − 1 → 46340 (mid × mid would overflow an int).'],
  },

  'guess-number-higher-or-lower': {
    aha: 'Each answer from guess() tells you which side of your guess the number is on. Guess the middle of what is left and throw the other half away: about 31 guesses for any n.',
    asks: {
      observe: 'For n = 10 and pick 6, you guess 5 and hear "higher". Which numbers are still possible?',
      pattern: 'What does each "higher/lower" answer let you throw away?',
    },
    read: [
      { phrase: '`-1` if `num` is higher than the picked number', says: 'Each guess says which side the pick is on: halve the range.' },
      { phrase: 'between `1` and `n`', says: 'Search the numbers 1 … n, not an array.' },
    ],
    budget: { from: 'n ≤ 2³¹ − 1', rows: [['guess 1, 2, 3, …', 'up to 2.1 × 10⁹', 'bad'], ['binary search', '31 guesses', 'ok']], aim: 'O(log n)', note: 'The range is huge; halving is the only option.' },
    observe: [
      {
        title: 'Each answer removes half',
        text: 'Guess the middle. Too high: keep the lower half. Too low: keep the upper half.',
        sketch: { kind: 'array', rows: [{ label: '1 … 10', items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], marks: { 4: 'cur', 0: 'dim', 1: 'dim', 2: 'dim', 3: 'dim' } }], caption: 'guess 5: too low, keep 6 … 10' },
      },
      {
        title: 'Mind the overflow',
        text: 'With n near 2³¹, (lo + hi) / 2 overflows an int; lo + (hi − lo) / 2 doesn\'t.',
        sketch: { kind: 'array', rows: [{ items: ['lo + hi', '> 2³¹ − 1'], marks: { 1: 'bad' } }] },
      },
    ],
    brute: { idea: 'Guess 1, 2, 3, … until the answer is 0.', cost: 'O(n)', waste: 'Each "higher/lower" answer is used for one number instead of half the range.' },
    pattern: {
      pick: 'binary-search',
      why: 'Binary search over a range of numbers, steered by the API\'s answer. O(log n).',
      not: [
        { id: 'binary-search-on-answer', why: 'Very close; here the API answers directly instead of us checking each guess.' },
        { id: 'two-pointers', why: 'Moving the bounds one step at a time is linear.' },
      ],
    },
    watch: {
      frames: [
        { title: 'Guess 5: too low', text: 'Keep 6 … 10.', sketch: { kind: 'array', rows: [{ items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], marks: { 4: 'cur', 0: 'dim', 1: 'dim', 2: 'dim', 3: 'dim' } }] } },
        { title: 'Guess 8: too high', text: 'Keep 6 … 7.', sketch: { kind: 'array', rows: [{ items: [6, 7, 8, 9, 10], marks: { 2: 'cur', 3: 'dim', 4: 'dim' } }] } },
        { title: 'Guess 6: correct → 6', text: 'Found in 3 guesses.', sketch: { kind: 'array', rows: [{ items: [6, 7], marks: { 0: 'hit' } }] } },
      ],
    },
    edges: ['The pick is 1: n 10, pick 1 → 1.', 'n = 1 → 1.', 'n = 2³¹ − 1, pick 2³¹ − 1 → found without overflow.'],
  },

  'find-first-and-last-position-of-element-in-sorted-array': {
    aha: 'The target occupies one block. Its first index is "the first value ≥ target", and one past its last index is "the first value > target". Both are ordinary binary searches.',
    asks: {
      observe: 'In [5, 7, 7, 8, 8, 10], where is the first value ≥ 8? The first value > 8?',
      pattern: 'Finding one copy and walking left and right can be slow. Which two switch points describe the block?',
    },
    read: [
      { phrase: 'may contain duplicates', says: 'The target can fill a whole block; we need both of its ends.' },
      { phrase: 'Return the first and the last index', says: 'Two switch points: first index ≥ target, and first index > target (minus one).' },
      { phrase: 'a linear scan over the duplicates is not enough', says: 'Finding one copy and walking outwards is O(k): two binary searches instead.' },
    ],
    budget: { from: 'nums.length ≤ 10⁵', n: 1e5, aim: 'O(log n)', note: 'A scan, or walking outwards from one match, can be O(n).' },
    observe: [
      {
        title: 'Two switch points in one sorted array',
        text: 'first = the first index with value ≥ 8 (index 3). last = the first index with value > 8 (index 5), minus one: 4.',
        sketch: { kind: 'array', rows: [{ items: [5, 7, 7, 8, 8, 10], bands: [{ from: 3, to: 4, tone: 'success', label: '8s' }], tags: { 3: [['≥ 8', 'success']], 5: [['> 8', 'warn']] } }] },
      },
      {
        title: 'Same search, different condition',
        text: 'Write one "first index where the condition holds" search and use it twice: once with ≥, once with >.',
        sketch: { kind: 'array', rows: [{ label: '> 8 ?', items: ['no', 'no', 'no', 'no', 'no', 'yes'], marks: { 5: 'hit' } }] },
      },
    ],
    brute: { idea: 'Scan and record the first and last index where the target appears.', cost: 'O(n)', waste: 'Both ends of the block are switch points of a sorted condition, which binary search finds in O(log n).' },
    pattern: {
      pick: 'binary-search',
      why: 'Two binary searches: the first value ≥ target and the first value > target. O(log n).',
      not: [
        { id: 'two-pointers', why: 'Walking left and right from one match is O(k) for k copies.' },
        { id: 'hashing', why: 'A map of value → positions ignores the sort and costs O(n) to build.' },
      ],
    },
    watch: { viz: 'FirstTrueViz', inputs: [{ label: 'first index with a value ≥ 8', input: { mode: 'lower', nums: [5, 7, 7, 8, 8, 10], x: 8 } }, { label: 'the last 8', input: { mode: 'upper', nums: [5, 7, 7, 8, 8, 10], x: 8 } }] },
    edges: ['Target missing: [5, 7], 6 → [−1, −1].', 'An empty array: [], 0 → [−1, −1].', 'Everything is the target: [2, 2, 2], 2 → [0, 2].'],
  },

  'search-a-2d-matrix': {
    aha: 'Each row continues where the previous one ended, so reading the rows one after another gives one sorted list of m · n values. Binary search that list, turning position k into row k / n and column k % n.',
    asks: {
      observe: 'Read [[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]] row by row. Is the result sorted? Where is position 5?',
      pattern: 'If the whole grid is one sorted list in disguise, what search does it need?',
    },
    read: [
      { phrase: 'Every row of `matrix` is sorted in ascending order', says: 'Each row is sorted…' },
      { phrase: 'the first value of each row is greater than the last value of the row before it', says: '…and each row continues the previous one: read row by row, it is one sorted list.' },
      { phrase: 'Run in O(log(m · n)) time', says: 'One binary search over all m · n cells.' },
    ],
    budget: { from: 'up to 100 × 100', n: 1e4, aim: 'O(log(m · n))', note: 'Scanning every cell is 10⁴: fine for time, but not what is asked.' },
    observe: [
      {
        title: 'The grid is one sorted list',
        text: 'Read row by row: 1, 3, 5, 7, 10, 11, 16, 20, 23, 30, 34, 60. Position k is cell (k / 4, k % 4).',
        sketch: { kind: 'array', rows: [{ items: [1, 3, 5, 7, 10, 11, 16, 20, 23, 30, 34, 60], bands: [{ from: 0, to: 3, tone: 'ghost', label: 'row 0' }, { from: 4, to: 7, tone: 'accent', label: 'row 1' }, { from: 8, to: 11, tone: 'ghost', label: 'row 2' }] }] },
      },
      {
        title: 'Only the index maths is new',
        text: 'mid = 5 → row 5 / 4 = 1, column 5 % 4 = 1 → value 11.',
        sketch: { kind: 'grid', grid: [[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], marks: { '1,1': 'cur' }, labels: { '1,1': '11' } },
      },
    ],
    brute: { idea: 'Check every cell.', cost: 'O(m · n)', waste: 'The whole grid is sorted, so each comparison could throw away half of it.' },
    pattern: {
      pick: 'binary-search',
      why: 'Treat the matrix as one sorted list of m · n values and binary search it, converting position → (row, column).',
      not: [
        { id: 'two-pointers', why: 'Walking from the top-right corner is O(m + n); that is the method when rows don\'t continue each other (Search a 2D Matrix II).' },
        { id: 'matrix-simulation', why: 'Nothing is walked cell by cell; we jump by halves.' },
      ],
    },
    watch: {
      frames: [
        { title: 'lo 0, hi 11: mid 5 → 11', text: 'target 3 < 11: hi = 4.', sketch: { kind: 'array', rows: [{ items: [1, 3, 5, 7, 10, 11, 16, 20, 23, 30, 34, 60], marks: { 5: 'cur', 6: 'dim', 7: 'dim', 8: 'dim', 9: 'dim', 10: 'dim', 11: 'dim' } }] } },
        { title: 'lo 0, hi 4: mid 2 → 5', text: '3 < 5: hi = 1.', sketch: { kind: 'array', rows: [{ items: [1, 3, 5, 7, 10], marks: { 2: 'cur', 3: 'dim', 4: 'dim' } }] } },
        { title: 'lo 0, hi 1: mid 0 → 1, then mid 1 → 3', text: 'Found: true.', sketch: { kind: 'array', rows: [{ items: [1, 3], marks: { 1: 'hit' } }] } },
      ],
    },
    edges: ['A single row: [[1, 3, 5]], 5 → true.', 'Smaller than the first cell: the example, 0 → false.', 'Between two rows: the example, 9 → false.'],
  },

  'find-minimum-in-rotated-sorted-array': {
    aha: 'Compare the middle value with the right end. If the middle is bigger, the drop (and the minimum) is to its right; otherwise the stretch from the middle to the right end is in order, so the minimum is at the middle or to its left.',
    asks: {
      observe: 'In [3, 4, 5, 1, 2], the middle is 5 and the right end is 2. Which side holds the drop?',
      pattern: 'Why compare with the right end rather than the left end?',
    },
    read: [
      { phrase: 'some prefix was moved to the end', says: 'Two sorted runs; the minimum is where the second run starts (the "drop").' },
      { phrase: 'It may also have been rotated by a full cycle and be sorted again', says: 'There may be no drop at all: then the minimum is the first value.' },
      { phrase: 'in O(log n) time', says: 'Binary search for the drop.' },
    ],
    budget: { from: 'nums.length ≤ 5000', n: 5000, aim: 'O(log n)', note: 'A scan is fine for time; log n is the requirement.' },
    observe: [
      {
        title: 'Compare the middle with the right end',
        text: '5 > 2, so the values fall somewhere after the middle: the minimum is to the right of index 2.',
        sketch: { kind: 'array', rows: [{ items: [3, 4, 5, 1, 2], marks: { 2: 'cur', 4: 'target', 3: 'hit' }, tags: { 2: [['mid', 'accent']], 4: [['hi', 'warn']] } }] },
      },
      {
        title: 'Why the right end',
        text: 'The right end always belongs to the second run (or the only run), so comparing with it is never ambiguous.',
        sketch: { kind: 'array', rows: [{ items: [4, 5, 6, 7, 0, 1, 2], bands: [{ from: 0, to: 3, tone: 'ghost', label: 'first run' }, { from: 4, to: 6, tone: 'accent', label: 'second run' }] }] },
      },
    ],
    brute: { idea: 'Scan for the smallest value.', cost: 'O(n)', waste: 'One comparison with the right end rules out half the array.' },
    pattern: {
      pick: 'binary-search',
      why: 'Binary search on "is mid still in the first run?" (nums[mid] > nums[hi]): the first position where that becomes false is the minimum. O(log n).',
      not: [
        { id: 'binary-search-on-answer', why: 'We search positions in the array, not a range of answers.' },
        { id: 'two-pointers', why: 'Walking inwards is linear.' },
      ],
    },
    watch: { viz: 'FirstTrueViz', inputs: [{ label: '[3, 4, 5, 1, 2]', input: { mode: 'rotmin', nums: [3, 4, 5, 1, 2] } }, { label: '[4, 5, 6, 7, 0, 1, 2]', input: { mode: 'rotmin', nums: [4, 5, 6, 7, 0, 1, 2] } }] },
    edges: ['Not rotated: [1, 2, 3] → 1.', 'Two elements: [2, 1] → 1.', 'The minimum is last: [2, 3, 1] → 1.'],
  },

  'search-in-rotated-sorted-array': {
    aha: 'Around any middle point, at least one half is in plain sorted order. Check whether the target lies inside that sorted half\'s range: if yes, search there; if not, search the other half.',
    asks: {
      observe: 'In [4, 5, 6, 7, 0, 1, 2] the middle is 7. Is the left half [4, 5, 6, 7] in order? Could 0 be in it?',
      pattern: 'You can\'t tell which side to keep by comparing with the middle alone. What can you check about each half instead?',
    },
    read: [
      { phrase: 'rotated at an unknown index', says: 'Two sorted runs. Around any middle, at least one side is in order.' },
      { phrase: 'Run in O(log n) time', says: 'One modified binary search.' },
      { phrase: 'it consists of two sorted runs', says: 'Use the sorted side to decide where the target can be.' },
    ],
    budget: { from: 'nums.length ≤ 5000', n: 5000, aim: 'O(log n)', note: 'Scanning is O(n); the requirement is log n.' },
    observe: [
      {
        title: 'One half is always in order',
        text: 'If nums[lo] ≤ nums[mid], the left half is in order; otherwise the right half is.',
        sketch: { kind: 'array', rows: [{ items: [4, 5, 6, 7, 0, 1, 2], marks: { 3: 'cur' }, bands: [{ from: 0, to: 3, tone: 'success', label: 'in order' }] }] },
      },
      {
        title: 'Is the target inside the sorted half\'s range?',
        text: '0 is not between 4 and 7, so it can\'t be in the left half: search the right half.',
        sketch: { kind: 'array', rows: [{ items: [4, 5, 6, 7, 0, 1, 2], marks: { 0: 'dim', 1: 'dim', 2: 'dim', 3: 'dim', 4: 'hit' } }] },
      },
    ],
    brute: { idea: 'Check every index.', cost: 'O(n)', waste: 'Each comparison could rule out half the array.' },
    pattern: {
      pick: 'binary-search',
      why: 'Find the half that is in order, check whether the target lies in its range, and keep the right half. O(log n).',
      not: [
        { id: 'two-pointers', why: 'Linear.' },
        { id: 'sorting-and-selection', why: 'Sorting again loses the original positions and costs O(n log n).' },
      ],
    },
    watch: { viz: 'RotatedSearchViz', inputs: [{ label: 'target 0', input: { nums: [4, 5, 6, 7, 0, 1, 2], target: 0 } }, { label: 'target 3 (missing)', input: { nums: [4, 5, 6, 7, 0, 1, 2], target: 3 } }] },
    edges: ['Not rotated: [1, 2, 3], 3 → 2.', 'One element: [1], 0 → −1.', 'The target is the smallest value: [5, 1, 3], 1 → 1.'],
  },

  'find-peak-element': {
    aha: 'Look at the middle and its right neighbour. If the right one is higher, you are walking uphill, and since the edge counts as −∞, a peak must lie to the right. Otherwise one lies at the middle or to its left.',
    asks: {
      observe: 'In [1, 2, 1, 3, 5, 6, 4], the middle 3 has a right neighbour 5. Which direction is uphill, and must a peak exist there?',
      pattern: 'The array isn\'t sorted. What single comparison still tells you which half surely contains a peak?',
    },
    read: [
      { phrase: 'strictly greater than both of its neighbours', says: 'A local high point, not the overall maximum.' },
      { phrase: 'Treat the positions just outside the array as `−∞`', says: 'Walking uphill must eventually reach a peak, because the edges count as down.' },
      { phrase: 'Return the index of any peak', says: 'Any one will do: we can follow a slope instead of comparing everything.' },
    ],
    budget: { from: 'nums.length ≤ 1000', n: 1000, aim: 'O(log n)', note: 'A scan for the first drop is O(n); log n is the requirement.' },
    observe: [
      {
        title: 'Follow the uphill side',
        text: '3 < 5: the values rise to the right, and the far edge is −∞, so the climb must stop at a peak somewhere on the right.',
        sketch: { kind: 'array', rows: [{ items: [1, 2, 1, 3, 5, 6, 4], marks: { 3: 'cur', 4: 'target', 5: 'hit' }, tags: { 3: [['mid', 'accent']] } }], caption: 'go right: the peak 6 is there' },
      },
      {
        title: 'Not sorted, still binary search',
        text: 'Binary search only needs a check that says which half surely contains an answer.',
        sketch: { kind: 'array', rows: [{ items: [1, 2, 1, 3, 5, 6, 4], marks: { 0: 'dim', 1: 'dim', 2: 'dim', 3: 'dim' } }], caption: 'the left half can be dropped' },
      },
    ],
    brute: { idea: 'Walk from the left until the values first drop; the element before the drop is a peak.', cost: 'O(n)', waste: 'One neighbour comparison can rule out half the array.' },
    pattern: {
      pick: 'binary-search',
      why: 'Binary search on the slope: move towards the higher neighbour, and the range always contains a peak. O(log n).',
      not: [
        { id: 'sorting-and-selection', why: 'Finding the overall maximum is O(n) and more than asked.' },
        { id: 'two-pointers', why: 'Walking inwards is linear.' },
      ],
    },
    watch: { viz: 'FirstTrueViz', inputs: [{ label: '[1, 2, 3, 1]', input: { mode: 'peak', nums: [1, 2, 3, 1] } }, { label: '[1, 2, 1, 3, 5, 6, 4]', input: { mode: 'peak', nums: [1, 2, 1, 3, 5, 6, 4] } }] },
    edges: ['One element: [7] → 0.', 'Always rising: [1, 2, 3] → 2.', 'Always falling: [3, 2, 1] → 0.'],
  },

  'search-in-rotated-sorted-array-ii': {
    aha: 'It is the rotated search again, except duplicates can hide which half is in order (when the left end, middle and right end are all equal). In that case just shrink both ends by one and look again.',
    asks: {
      observe: 'In [1, 0, 1, 1, 1], the left end, middle and right end are all 1. Can you tell which half is in order?',
      pattern: 'When you can\'t tell which half is sorted, what small step is still safe?',
    },
    read: [
      { phrase: 'may contain duplicates', says: 'With duplicates, the ends and the middle can be equal and hide which side is in order.' },
      { phrase: 'rotated at an unknown index `k`', says: 'Still two sorted runs, as in the version without duplicates.' },
      { phrase: 'Try to use as few steps as you can', says: 'Logarithmic usually; when everything is equal, nothing can avoid looking at most values.' },
    ],
    budget: { from: 'nums.length ≤ 5000', n: 5000, aim: 'O(log n) usually, O(n) worst', note: 'With [1, 1, …, 1, 2, 1, 1] no method can avoid looking at most values.' },
    observe: [
      {
        title: 'When the ends differ, it is the usual search',
        text: 'Find the half that is in order and check whether the target is in its range.',
        sketch: { kind: 'array', rows: [{ items: [2, 5, 6, 0, 0, 1, 2], marks: { 3: 'cur' }, bands: [{ from: 3, to: 6, tone: 'success', label: 'in order' }] }] },
      },
      {
        title: 'Ties hide the sorted side',
        text: 'If the left end, middle and right end are all equal, we can\'t tell. Drop both ends (they can\'t be the only copies of the target) and continue.',
        sketch: { kind: 'array', rows: [{ items: [1, 0, 1, 1, 1], marks: { 0: 'target', 2: 'cur', 4: 'target' } }], caption: 'all three are 1: drop both ends' },
      },
    ],
    brute: { idea: 'Scan every element.', cost: 'O(n)', waste: 'When the ends differ, half the array can be ruled out at once.' },
    pattern: {
      pick: 'binary-search',
      why: 'Rotated binary search, shrinking the ends when all three values tie. O(log n) usually, O(n) in the worst case.',
      not: [
        { id: 'two-pointers', why: 'Always linear.' },
        { id: 'hashing', why: 'A set answers membership in one step after O(n) to build, ignoring the structure.' },
      ],
    },
    watch: {
      frames: [
        { title: '[2, 5, 6, 0, 0, 1, 2], target 0', text: 'Left end 2, middle 0, right end 2: the ends differ from the middle, so a half can be identified.', sketch: { kind: 'array', rows: [{ items: [2, 5, 6, 0, 0, 1, 2], marks: { 0: 'target', 3: 'cur', 6: 'target' } }] } },
        { title: 'The right half [0, 0, 1, 2] is in order', text: '0 lies between 0 and 2: search it.', sketch: { kind: 'array', rows: [{ items: [2, 5, 6, 0, 0, 1, 2], bands: [{ from: 3, to: 6, tone: 'success' }], marks: { 0: 'dim', 1: 'dim', 2: 'dim' } }] } },
        { title: 'Found → true', text: 'The middle itself is 0.', sketch: { kind: 'array', rows: [{ items: [2, 5, 6, 0, 0, 1, 2], marks: { 3: 'hit' } }] } },
      ],
    },
    edges: ['All equal: [1, 1, 1], 1 → true.', 'Target missing: [2, 5, 6, 0, 0, 1, 2], 3 → false.', 'Duplicates at both ends: [1, 0, 1, 1, 1], 0 → true.'],
  },

  'median-of-two-sorted-arrays': {
    aha: 'The median splits all values into a left half and a right half. Choose how many values come from the shorter array (i); the rest of the left half comes from the other array (j = half − i). Binary search i until every left value is ≤ every right value.',
    asks: {
      observe: 'For [1, 3, 8, 9] and [2, 4, 5, 7], take two values from each array into the left half. Is every left value ≤ every right value?',
      pattern: 'Merging is O(m + n). What single number could you binary search instead?',
    },
    read: [
      { phrase: 'each sorted in ascending order', says: 'Two sorted arrays: the median is defined by how many values fall on its left.' },
      { phrase: 'the average of the two middle values', says: 'Handle both even and odd totals.' },
      { phrase: 'The intended solution runs in O(log(m + n)) time', says: 'Merging is O(m + n); we must binary search something.' },
    ],
    budget: { from: 'up to 1000 + 1000 values', rows: [['merge up to the middle', '2000 steps', 'ok'], ['binary search the cut', '≈ 10 steps', 'ok']], aim: 'O(log min(m, n))', note: 'Both pass at this size; the question is about the logarithmic idea.' },
    observe: [
      {
        title: 'Cut both arrays so the left side holds half',
        text: 'Two values from each array: left {1, 3, 2, 4}, right {8, 9, 5, 7}. The largest left (4) ≤ the smallest right (5), so the cut is right: median (4 + 5) / 2 = 4.5.',
        sketch: { kind: 'array', rows: [{ label: 'nums1', items: [1, 3, 8, 9], bands: [{ from: 0, to: 1, tone: 'accent', label: 'left' }] }, { label: 'nums2', items: [2, 4, 5, 7], bands: [{ from: 0, to: 1, tone: 'accent', label: 'left' }] }] },
      },
      {
        title: 'Binary search i',
        text: 'If nums1[i − 1] > nums2[j], i is too big; if nums2[j − 1] > nums1[i], it is too small. Only the shorter array\'s cut is searched.',
        sketch: { kind: 'array', rows: [{ label: 'nums1 cut at 3 (too many)', items: [1, 3, 8, 9], bands: [{ from: 0, to: 2, tone: 'danger' }], marks: { 2: 'bad' } }], caption: '8 > nums2[1] = 4: take fewer from nums1' },
      },
    ],
    brute: { idea: 'Concatenate and sort, then read the middle.', cost: 'O((m + n) log(m + n))', waste: 'Both arrays are already sorted; only the position of one cut needs finding.' },
    pattern: {
      pick: 'binary-search',
      why: 'Binary search the cut in the shorter array; the other cut follows. O(log min(m, n)).',
      not: [
        { id: 'two-pointers', why: 'A merge walk to the middle is O(m + n): correct, but not logarithmic.' },
        { id: 'heap-patterns', why: 'Two heaps track a running median of a stream; here the data is fixed and sorted.' },
      ],
    },
    watch: {
      frames: [
        { title: 'nums1 = [1, 3], nums2 = [2]', text: 'Total 3, so the left half holds 2 values. Search the cut in the shorter array, [2].', sketch: { kind: 'array', rows: [{ label: 'nums1', items: [1, 3] }, { label: 'nums2', items: [2] }] } },
        { title: 'Try one value from each', text: 'Left {1, 2}, right {3}: 2 ≤ 3, so the cut is right.', sketch: { kind: 'array', rows: [{ label: 'nums1', items: [1, 3], bands: [{ from: 0, to: 0, tone: 'accent' }] }, { label: 'nums2', items: [2], bands: [{ from: 0, to: 0, tone: 'accent' }] }] } },
        { title: 'Odd total → the largest left value: 2', text: 'The median is 2.0.', sketch: { kind: 'array', rows: [{ label: 'left half', items: [1, 2], marks: { 1: 'hit' } }] } },
      ],
    },
    edges: ['One array empty: [], [3] → 3.0.', 'All of one array smaller: [1, 2], [3, 4] → 2.5.', 'Equal values: [1, 1], [1, 1] → 1.0.'],
  },

  'find-in-mountain-array': {
    aha: 'Find the peak with a binary search on the slope. The left side is sorted upwards and the right side downwards, so search the left side first (for the smallest index), and only then the right side.',
    asks: {
      observe: 'In [1, 2, 3, 4, 5, 3, 1], where is the peak? The target 3 appears twice: which copy is the answer?',
      pattern: 'With at most 100 calls and 10⁴ values, how many binary searches can you afford, and on what?',
    },
    read: [
      { phrase: 'values strictly increase up to `arr[p]` and strictly decrease after it', says: 'Two sorted slopes around a peak: find the peak, then binary search each slope.' },
      { phrase: 'Return the **smallest** index', says: 'Search the rising slope first; only if that fails, the falling one.' },
      { phrase: 'Calling `get` more than **100** times is treated as a wrong answer', says: 'n is 10⁴: three binary searches use about 3 × 14 = 42 calls; a scan is impossible.' },
    ],
    budget: { from: 'length ≤ 10⁴, at most 100 get calls', rows: [['scan from the left', 'up to 10⁴ calls', 'bad'], ['three binary searches', '≈ 42 calls', 'ok']], aim: 'O(log n) calls', note: 'The call limit decides it.' },
    observe: [
      {
        title: 'Find the peak by comparing neighbours',
        text: 'If arr[mid] < arr[mid + 1] you are on the rising side, so the peak is to the right.',
        sketch: { kind: 'array', rows: [{ items: [1, 2, 3, 4, 5, 3, 1], marks: { 4: 'hit' }, tags: { 4: [['peak', 'success']] } }] },
      },
      {
        title: 'Then two ordinary searches',
        text: 'The left slope is sorted upwards; the right slope downwards (flip the comparison). Search the left one first, for the smallest index.',
        sketch: { kind: 'array', rows: [{ items: [1, 2, 3, 4, 5, 3, 1], bands: [{ from: 0, to: 4, tone: 'accent', label: 'rising' }, { from: 4, to: 6, tone: 'ghost', label: 'falling' }], marks: { 2: 'hit' } }] },
      },
    ],
    brute: { idea: 'Read values from the left until the target appears.', cost: 'O(n)', waste: 'It needs far more than the 100 calls allowed.' },
    pattern: {
      pick: 'binary-search',
      why: 'Three binary searches: the peak, the rising side, then the falling side. O(log n) calls.',
      not: [
        { id: 'two-pointers', why: 'Any linear walk breaks the call limit.' },
        { id: 'binary-search-on-answer', why: 'We search positions of a fixed array, not a range of answers.' },
      ],
    },
    watch: {
      frames: [
        { title: 'Search the peak', text: 'Comparing neighbours, the peak is index 4 (value 5).', sketch: { kind: 'array', rows: [{ items: [1, 2, 3, 4, 5, 3, 1], marks: { 4: 'hit' } }] } },
        { title: 'Search the rising side [0, 4] for 3', text: 'An ordinary binary search finds 3 at index 2.', sketch: { kind: 'array', rows: [{ items: [1, 2, 3, 4, 5, 3, 1], marks: { 2: 'hit', 5: 'dim', 6: 'dim' } }] } },
        { title: 'Answer: 2', text: 'Found on the rising side, so the falling side (with its 3 at index 5) is never searched.', sketch: { kind: 'array', rows: [{ items: [1, 2, 3, 4, 5, 3, 1], marks: { 2: 'hit' }, tags: { 2: [['answer', 'success']] } }] } },
      ],
    },
    edges: ['The target is the peak: [1, 5, 2], 5 → 1.', 'Only on the falling side: [1, 5, 2], 2 → 2.', 'Missing: [1, 5, 2], 7 → −1.'],
  },
};
