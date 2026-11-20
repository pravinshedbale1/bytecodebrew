/** Practice thinking walkthroughs: sliding-window (format: src/data/think/index.js). */
export default {
  'longest-substring-without-repeating-characters': {
    read: [
      { phrase: 'the longest substring', says: 'We optimise over ranges of the string: the best range.' },
      { phrase: 'a contiguous run of characters', says: 'Contiguous ranges: a sliding window is the first candidate.' },
      { phrase: 'no character appears more than once', says: 'The rule for a valid window: every letter count is at most 1. Something must track the counts.' },
    ],
    budget: { from: 's.length ≤ 5 × 10⁴', n: 5e4, aim: 'O(n)', note: 'All substrings is O(n²) = 2.5 × 10⁹ before even checking them: too slow.' },
    observe: [
      {
        title: 'A repeat spoils every bigger window too',
        text: '"abca" contains two a\'s, so every window containing "abca" is invalid as well. Growing a bad window never fixes it; only moving the left end can.',
        sketch: { kind: 'array', rows: [{ items: ['a', 'b', 'c', 'a', 'b', 'c', 'b', 'b'], marks: { 0: 'bad', 3: 'bad' }, bands: [{ from: 0, to: 3, tone: 'danger', label: 'two a\'s' }] }] },
      },
      {
        title: 'The left end only ever moves right',
        text: 'If [l, r] is the longest valid window ending at r, the best window ending at r + 1 cannot start before l. So both ends move forward only: about 2n moves in total.',
        sketch: { kind: 'array', rows: [{ items: ['a', 'b', 'c', 'a', 'b', 'c', 'b', 'b'], bands: [{ from: 1, to: 3, tone: 'success', label: 'valid' }], tags: { 1: [['l', 'interview']], 3: [['r', 'accent']] } }], caption: 'drop the first a, and "bca" is valid again' },
      },
      {
        title: 'The window\'s state is a count per letter',
        text: 'To know if adding s[r] breaks the rule, keep how many times each letter is in the window. Adding and removing a letter are both O(1).',
        sketch: { kind: 'array', rows: [{ label: 'counts in "bca"', items: ['a:1', 'b:1', 'c:1'], marks: { 0: 'kept', 1: 'kept', 2: 'kept' } }] },
      },
    ],
    brute: { idea: 'Check every substring: for each start, extend while the letters stay unique (a set), and keep the longest.', cost: 'O(n²)', waste: 'When the start moves by one, it re-checks letters it already knew were unique.' },
    pattern: {
      pick: 'sliding-window',
      why: 'Contiguous ranges, a validity rule that only gets worse as the window grows, and window state (counts) that updates in O(1) when one letter enters or leaves.',
      not: [
        { id: 'two-pointers', why: 'Classic two pointers walk towards each other on sorted data; here both ends move in the same direction, which is what a sliding window is.' },
        { id: 'hashing', why: 'A hash map (or array of counts) is the window\'s state, but on its own it doesn\'t say which range to look at.' },
        { id: 'dp-strings', why: 'String DP compares positions in one or two strings; this asks about one contiguous range, which the window handles in O(n).' },
      ],
    },
    watch: { viz: 'WindowCountsViz', inputs: [{ label: '"abcabcbb"', input: { mode: 'unique', s: 'abcabcbb' } }, { label: '"pwwkew"', input: { mode: 'unique', s: 'pwwkew' } }] },
    edges: ['The empty string → 0.', 'All the same letter: "bbbb" → 1.', 'Spaces and symbols count as characters too.'],
  },

  'maximum-average-subarray-i': {
    free: true,
    read: [
      { phrase: 'contiguous subarrays of `nums` that have exactly `k` elements', says: 'Every candidate has the same length k: a fixed-size sliding window.' },
      { phrase: 'the largest average', says: 'With k fixed, the largest average is just the largest sum divided by k.' },
      { phrase: 'adding the element that enters and subtracting the one that leaves', says: 'The statement spells out the update: O(1) per step.' },
    ],
    budget: { from: 'n ≤ 10⁵, k ≤ n', n: 1e5, aim: 'O(n)', note: 'Summing each window from scratch is O(n · k), up to 2.5 × 10⁹ when k ≈ n / 2.' },
    observe: [
      {
        title: 'Neighbouring windows share k − 1 elements',
        text: 'Moving the window one step changes only two values: one enters on the right, one leaves on the left.',
        sketch: { kind: 'array', rows: [{ items: [1, 12, -5, -6, 50, 3], bands: [{ from: 0, to: 3, tone: 'ghost', label: 'sum 2' }, { from: 1, to: 4, tone: 'accent' }], marks: { 0: 'dim', 4: 'cur' } }], caption: 'next sum = 2 − 1 + 50 = 51' },
      },
      {
        title: 'Track the sum, divide once',
        text: 'Keep the best sum; divide by k only at the end.',
      },
    ],
    brute: { idea: 'For each of the n − k + 1 windows, add up its k values.', cost: 'O(n · k)', waste: 'Each window re-adds the k − 1 values it shares with the previous one.' },
    pattern: {
      pick: 'sliding-window',
      why: 'A fixed-size window over contiguous values: update the sum in O(1) as it slides. O(n).',
      not: [
        { id: 'prefix-sums', why: 'prefix[i + k] − prefix[i] gives each window sum in O(1) too, but needs an extra array.' },
        { id: 'two-pointers', why: 'The two ends move together at a fixed distance; that is exactly a fixed-size window.' },
      ],
    },
    watch: { viz: 'SlidingWindowViz', inputs: [{ label: '[1, 12, −5, −6, 50, 3], k = 4', input: { mode: 'fixed', nums: [1, 12, -5, -6, 50, 3], k: 4 } }] },
    edges: ['k = n: one window.', 'All values negative.', 'k = 1: the largest single value.'],
  },

  'contains-duplicate-ii': {
    read: [
      { phrase: '`nums[i] == nums[j]`', says: 'We are looking for a repeated value…' },
      { phrase: '`|i − j| <= k`', says: '…but only within distance k: only the last k values matter at any moment.' },
    ],
    budget: { from: 'nums.length, k ≤ 10⁵', n: 1e5, aim: 'O(n)', note: 'Comparing each value with the next k is O(n · k), up to 10¹⁰.' },
    observe: [
      {
        title: 'Only a window of the last k values matters',
        text: 'A copy further back than k is too far. So keep exactly the last k values in a set.',
        sketch: { kind: 'array', rows: [{ items: [1, 2, 3, 1], bands: [{ from: 0, to: 2, tone: 'accent', label: 'last k = 3' }], marks: { 3: 'cur', 0: 'hit' } }], caption: '1 is in the window: true' },
      },
      {
        title: 'Slide: add the new value, drop the one k back',
        text: 'Before adding nums[i], check the set; after adding it, remove nums[i − k] if the window is too big.',
      },
    ],
    brute: { idea: 'For each index, compare its value with the next k values.', cost: 'O(n · k)', waste: 'Overlapping ranges are re-scanned; a set of the window answers "is it there?" in O(1).' },
    pattern: {
      pick: 'sliding-window',
      why: 'A fixed-size window of the last k values, held in a hash set: O(n).',
      not: [
        { id: 'hashing', why: 'A map of each value\'s last index also works in O(n); the window view explains why only k values matter.' },
        { id: 'two-pointers', why: 'No pair to steer; the window simply slides.' },
      ],
    },
    watch: {
      frames: [
        { title: 'Add 1, 2, 3', text: 'Window {1, 2, 3}; no repeats yet.' },
        { title: '1 again: in the window', text: 'The earlier 1 is 3 positions back, which is ≤ k = 3: true.', sketch: { kind: 'array', rows: [{ items: [1, 2, 3, 1], marks: { 0: 'hit', 3: 'hit' } }] } },
      ],
    },
    edges: ['k = 0 → always false.', 'Equal values exactly k + 1 apart → false.', 'A single element.'],
  },

  'minimum-size-subarray-sum': {
    read: [
      { phrase: 'contains only positive integers', says: 'Adding an element always raises the sum, removing one always lowers it: the window\'s validity is monotone.' },
      { phrase: 'the shortest contiguous subarray', says: 'Minimise a window length: grow until valid, then shrink as far as possible.' },
      { phrase: 'return `0`', says: 'If even the whole array falls short, there is no answer.' },
    ],
    budget: { from: 'nums.length ≤ 10⁵', n: 1e5, aim: 'O(n)', note: 'Extending from every start is O(n²).' },
    observe: [
      {
        title: 'Once the sum is enough, shrink from the left',
        text: 'With positive values, the window [l, r] that just reached target may still be valid after dropping its left end. Keep dropping while it is.',
        sketch: { kind: 'array', rows: [{ items: [2, 3, 1, 2, 4, 3], bands: [{ from: 2, to: 4, tone: 'success', label: 'sum 7' }], marks: { 0: 'dim', 1: 'dim' } }] },
      },
      {
        title: 'Neither end ever moves back',
        text: 'Both pointers only move right, so the whole scan is O(n).',
      },
    ],
    brute: { idea: 'From every start, add elements until the sum reaches target.', cost: 'O(n²)', waste: 'Each start rebuilds sums that the previous window already had.' },
    pattern: {
      pick: 'sliding-window',
      why: 'Variable-size window on positive numbers: grow right until valid, then shrink left while still valid. O(n).',
      not: [
        { id: 'prefix-sums', why: 'Prefix sums plus binary search for each start give O(n log n).' },
        { id: 'two-pointers', why: 'These are the two pointers, moving in the same direction: that is the sliding window.' },
      ],
    },
    watch: { viz: 'SlidingWindowViz', inputs: [{ label: 'target 7, [2, 3, 1, 2, 4, 3]', input: { mode: 'shortest', nums: [2, 3, 1, 2, 4, 3], target: 7 } }] },
    edges: ['The total is below target → 0.', 'One element already ≥ target → 1.', 'The answer is the whole array.'],
  },

  'max-consecutive-ones-iii': {
    read: [
      { phrase: 'flip at most `k` of the zeros', says: 'A budget of k zeros we are allowed to keep in the run.' },
      { phrase: 'longest run of consecutive ones', says: 'A contiguous range, maximised.' },
      { phrase: 'the longest window that contains at most `k` zeros', says: 'The statement reframes it: a window valid while its zero count ≤ k.' },
    ],
    budget: { from: 'nums.length ≤ 10⁵', n: 1e5, aim: 'O(n)', note: 'Extending from every start is O(n²).' },
    observe: [
      {
        title: 'Count the zeros inside the window',
        text: 'The window is fine while it holds at most k zeros. A (k + 1)-th zero makes it invalid.',
        sketch: { kind: 'array', rows: [{ items: [1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], bands: [{ from: 5, to: 10, tone: 'success', label: '2 zeros' }], marks: { 5: 'target', 10: 'target' } }], caption: 'k = 2: length 6' },
      },
      {
        title: 'Shrink until a zero leaves',
        text: 'When there are k + 1 zeros, move the left end past the oldest zero in the window.',
      },
    ],
    brute: { idea: 'From every start, extend until a (k + 1)-th zero appears.', cost: 'O(n²)', waste: 'Each start recounts zeros the previous window already counted.' },
    pattern: {
      pick: 'sliding-window',
      why: 'A longest window under a budget (zeros ≤ k): grow right, shrink left when over budget. O(n).',
      not: [
        { id: 'prefix-sums', why: 'Prefix counts of zeros with binary search work in O(n log n).' },
        { id: 'dp-linear', why: 'A DP over positions is possible, but the window is simpler and O(n).' },
      ],
    },
    watch: {
      frames: [
        { title: 'Grow to [0, 4]', text: 'Zeros at 3 and 4: two zeros, still fine. Length 5.' },
        { title: 'Index 5 is a third zero: shrink', text: 'Move l past index 3 (the first zero): window [4, 5].' },
        { title: 'Grow to index 10', text: 'Another zero at 10: shrink past index 4. The best window [5, 10] has length 6.', sketch: { kind: 'array', rows: [{ items: [1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], bands: [{ from: 5, to: 10, tone: 'success' }] }] } },
      ],
    },
    edges: ['k = 0: the longest run of ones as it is.', 'k ≥ number of zeros → n.', 'All zeros → k.'],
  },

  'minimum-operations-to-make-binary-array-elements-equal-to-one-i': {
    read: [
      { phrase: 'flip all of them', says: 'An operation on a fixed-size window of 3.' },
      { phrase: 'the minimum number of operations', says: 'Each window is either flipped once or not at all (twice cancels), and order doesn\'t matter.' },
      { phrase: 'or `-1` if it is impossible', says: 'Some arrays can\'t be fixed: the last two cells may be stuck.' },
    ],
    budget: { from: 'nums.length ≤ 10⁵', n: 1e5, aim: 'O(n)', note: 'Trying sets of windows is exponential; there is a forced choice instead.' },
    observe: [
      {
        title: 'Index 0 can only be fixed by the window starting at 0',
        text: 'So if nums[0] is 0, that flip is forced; if it is 1, flipping there is forbidden. Then index 1 is decided the same way.',
        sketch: { kind: 'array', rows: [{ items: [0, 1, 1, 1, 0, 0], bands: [{ from: 0, to: 2, tone: 'accent', label: 'forced' }], marks: { 0: 'bad' } }] },
      },
      {
        title: 'The last two cells have no window of their own',
        text: 'After the scan, if either is still 0, nothing can fix it: −1.',
      },
    ],
    brute: { idea: 'Try every subset of window starts and keep the smallest that leaves all ones.', cost: 'O(2ⁿ · n)', waste: 'Every decision is actually forced; there is only one plan to find.' },
    pattern: {
      pick: 'sliding-window',
      why: 'A fixed window of 3 sweeps left to right; at each step the choice is forced, so one pass gives the minimum.',
      not: [
        { id: 'backtracking', why: 'Exploring all sets of flips is exponential.' },
        { id: 'dp-linear', why: 'A DP is unnecessary: no choice ever branches.' },
      ],
    },
    watch: { viz: 'FlipWindowViz', inputs: [{ label: '[0, 1, 1, 1, 0, 0], k = 3', input: { nums: [0, 1, 1, 1, 0, 0], k: 3 } }, { label: '[0, 1, 1, 1], k = 3 (impossible)', input: { nums: [0, 1, 1, 1], k: 3 } }] },
    edges: ['All ones → 0.', 'A zero stuck in the last two cells → −1.', 'n = 3.'],
  },

  'longest-repeating-character-replacement': {
    read: [
      { phrase: 'at most `k` times in total', says: 'A budget of k changes for the window.' },
      { phrase: 'the longest substring that can be made to consist of a single repeated letter', says: 'A longest valid window. Which letter? The one already most common in the window, so we change the fewest.' },
    ],
    budget: { from: 's.length ≤ 10⁵', n: 1e5, aim: 'O(n)', note: 'Extending from every start is O(n²).' },
    observe: [
      {
        title: 'A window is fixable when length − (most common count) ≤ k',
        text: 'Keep the most common letter and change everything else. In "AABABBA" with k = 1, "AABA" needs one change.',
        sketch: { kind: 'array', rows: [{ items: ['A', 'A', 'B', 'A', 'B', 'B', 'A'], bands: [{ from: 0, to: 3, tone: 'success', label: '4 − 3 = 1 ≤ k' }], marks: { 2: 'target' } }] },
      },
      {
        title: 'Slide, shrinking when the window needs too many changes',
        text: 'Track letter counts in the window. If length − maxCount > k, drop the left letter.',
      },
      {
        title: 'The best count never needs to go down',
        text: 'The answer only improves when some window has a larger maxCount, so a stale (too large) maxCount just makes the window slide instead of shrink. That keeps it O(n).',
      },
    ],
    brute: { idea: 'From every start, extend while the window still needs at most k changes.', cost: 'O(n²)', waste: 'Counts are rebuilt for each start.' },
    pattern: {
      pick: 'sliding-window',
      why: 'A longest window with a validity rule (length − maxCount ≤ k) and O(1) updates: O(n).',
      not: [
        { id: 'dp-strings', why: 'There is no second string or position-pair recursion; one window suffices.' },
        { id: 'hashing', why: 'The letter counts are a hash table, but the window decides which range to look at.' },
      ],
    },
    watch: {
      frames: [
        { title: '"ABAB", k = 2', text: 'The whole string: length 4, most common count 2, changes needed 2 ≤ k. Valid.', sketch: { kind: 'array', rows: [{ items: ['A', 'B', 'A', 'B'], bands: [{ from: 0, to: 3, tone: 'success' }] }] } },
        { title: 'Answer: 4', text: 'Change both B\'s (or both A\'s).' },
      ],
    },
    edges: ['k ≥ length: the whole string.', 'All the same letter.', 'k = 0: the longest run as it is.'],
  },

  'permutation-in-string': {
    read: [
      { phrase: 'a rearrangement (a permutation) of `s1`', says: 'Same letters, same counts: compare counts, not order.' },
      { phrase: 'contiguous substring', says: 'A window of s2.' },
      { phrase: 'Only windows of exactly the length of `s1` can match', says: 'Fixed size: the window slides one letter at a time.' },
    ],
    budget: { from: 's1, s2 ≤ 10⁴ letters', n: 1e4, aim: 'O(n)', note: 'Sorting every window is O(n · m log m).' },
    observe: [
      {
        title: 'A permutation has the same letter counts',
        text: '"ba" is a permutation of "ab": one a, one b.',
        sketch: { kind: 'array', rows: [{ items: ['e', 'i', 'd', 'b', 'a', 'o', 'o', 'o'], bands: [{ from: 3, to: 4, tone: 'success', label: 'b, a' }] }] },
      },
      {
        title: 'Sliding changes two counts',
        text: 'One letter enters, one leaves. Comparing 26 counts (or tracking how many match) is O(1) per step.',
      },
    ],
    brute: { idea: 'Sort s1, then sort every window of s2 of the same length and compare.', cost: 'O(n · m log m)', waste: 'Each window is re-sorted, though it differs from the last by two letters.' },
    pattern: {
      pick: 'sliding-window',
      why: 'A fixed-size window over s2 with letter counts, updated in O(1) as it slides: O(n).',
      not: [
        { id: 'sorting-and-selection', why: 'Sorting each window works, but is O(m log m) per window.' },
        { id: 'hashing', why: 'Counts are the state; the window is what makes each update O(1).' },
      ],
    },
    watch: { viz: 'WindowCountsViz', inputs: [{ label: 's2 = "eidbaooo", s1 = "ab"', input: { mode: 'anagram', s: 'eidbaooo', p: 'ab' } }] },
    edges: ['s1 longer than s2 → false.', 's1 equal to s2 → true.', 'Repeated letters in s1.'],
  },

  'find-all-anagrams-in-a-string': {
    read: [
      { phrase: 'has length `p.length`', says: 'Fixed-size windows.' },
      { phrase: 'is an anagram (a rearrangement) of `p`', says: 'Compare letter counts.' },
      { phrase: 'If `p` is longer than `s`, the answer is empty', says: 'Check that before sliding.' },
    ],
    budget: { from: 's, p ≤ 3 × 10⁴ letters', n: 3e4, aim: 'O(n)', note: 'Sorting every window is O(n · m log m).' },
    observe: [
      {
        title: 'Every window of length |p| is a candidate',
        text: 'In "cbaebabacd", the windows starting at 0 ("cba") and 6 ("bac") match "abc".',
        sketch: { kind: 'array', rows: [{ items: ['c', 'b', 'a', 'e', 'b', 'a', 'b', 'a', 'c', 'd'], bands: [{ from: 0, to: 2, tone: 'success' }, { from: 6, to: 8, tone: 'success' }] }] },
      },
      {
        title: 'One in, one out',
        text: 'Each slide updates two counts; a "missing" counter says in O(1) whether the window matches.',
      },
    ],
    brute: { idea: 'Sort p, then sort and compare every window of s.', cost: 'O(n · m log m)', waste: 'Re-sorting windows that differ by only two letters.' },
    pattern: {
      pick: 'sliding-window',
      why: 'Fixed-size window with letter counts: each slide is O(1), so all start positions are found in O(n).',
      not: [
        { id: 'sorting-and-selection', why: 'Sorting each window is correct but slow.' },
        { id: 'string-matching', why: 'KMP finds exact copies of p; anagrams can be in any order.' },
      ],
    },
    watch: { viz: 'WindowCountsViz', inputs: [{ label: 's = "cbaebabacd", p = "abc"', input: { mode: 'anagram', s: 'cbaebabacd', p: 'abc' } }] },
    edges: ['p longer than s → [].', 'Overlapping matches: "abab", p = "ab" → [0, 1, 2].', 'p of length 1.'],
  },

  'find-k-closest-elements': {
    read: [
      { phrase: '`arr` is sorted in ascending order', says: 'The k closest values sit together: they form one contiguous block.' },
      { phrase: 'Return the `k` values of `arr` closest to `x`', says: 'A window of exactly k elements; we need its start.' },
      { phrase: 'if the distances are equal and `a < b`', says: 'Ties go to the smaller value, which is the left side.' },
    ],
    budget: { from: 'arr.length ≤ 10⁴', n: 1e4, aim: 'O(log n + k)', note: 'Sorting by distance is O(n log n): fine, but the sorted input allows much better.' },
    observe: [
      {
        title: 'The answer is a window of k',
        text: 'If a value is in the answer, every value between it and x is closer, so it is in too. The answer is a contiguous block.',
        sketch: { kind: 'array', rows: [{ items: [1, 2, 3, 4, 5], bands: [{ from: 0, to: 3, tone: 'success', label: 'k = 4' }], tags: { 2: [['x = 3', 'warn']] } }] },
      },
      {
        title: 'Compare the edges to choose the start',
        text: 'For a start s, compare arr[s] (just inside) with arr[s + k] (just outside). If x − arr[s] > arr[s + k] − x, the window should move right. That test is monotone in s, so binary search the start.',
      },
    ],
    brute: { idea: 'Sort all values by (distance, value), take the first k, sort them again.', cost: 'O(n log n)', waste: 'It ignores that the array is already sorted and the answer is a block.' },
    pattern: {
      pick: 'sliding-window',
      why: 'The answer is a fixed-size window; binary search its start by comparing the values just inside and just outside: O(log n + k).',
      not: [
        { id: 'heap-patterns', why: 'A max-heap of size k by distance works in O(n log k), without using the sort.' },
        { id: 'two-pointers', why: 'Shrinking from both ends (drop the farther end) is O(n − k): correct, slower.' },
      ],
    },
    watch: {
      frames: [
        { title: 'Starts 0 or 1 for k = 4, x = 3', text: 'Start 0 covers [1 … 4]; start 1 covers [2 … 5].' },
        { title: 'Compare 1 and 5', text: '|1 − 3| = 2 and |5 − 3| = 2: a tie, which goes to the smaller value, so stay at start 0.' },
        { title: 'Answer [1, 2, 3, 4]', text: 'The window starting at 0.' },
      ],
    },
    edges: ['x below every value: the first k.', 'x above every value: the last k.', 'Ties between equal distances go left.'],
  },

  'minimum-window-substring': {
    read: [
      { phrase: 'the shortest contiguous substring of `s` that contains every character of `t`', says: 'Minimise a window that must cover a requirement: grow until it covers, shrink while it still does.' },
      { phrase: 'including repeats', says: 'Counts, not just presence: track how many of each letter are still needed.' },
      { phrase: 'Letters are case-sensitive', says: '"a" and "A" are different keys.' },
    ],
    budget: { from: 's, t ≤ 10⁵', n: 1e5, aim: 'O(m + n)', note: 'Extending from every start is O(m²), 10¹⁰.' },
    observe: [
      {
        title: 'Grow until the window covers t',
        text: 'A counter of letters still missing reaches 0 exactly when the window contains all of t.',
        sketch: { kind: 'array', rows: [{ items: ['A', 'D', 'O', 'B', 'E', 'C', 'O', 'D', 'E', 'B', 'A', 'N', 'C'], bands: [{ from: 0, to: 5, tone: 'accent', label: 'covers ABC' }] }] },
      },
      {
        title: 'Then shrink while it still covers',
        text: 'Drop letters from the left until removing one would uncover t. Record the window, then keep growing.',
        sketch: { kind: 'array', rows: [{ items: ['A', 'D', 'O', 'B', 'E', 'C', 'O', 'D', 'E', 'B', 'A', 'N', 'C'], bands: [{ from: 9, to: 12, tone: 'success', label: 'BANC' }] }] },
      },
    ],
    brute: { idea: 'From every start, extend until all of t is covered.', cost: 'O(m²)', waste: 'Each start recounts letters the previous window already had.' },
    pattern: {
      pick: 'sliding-window',
      why: 'Variable window with a "missing" counter: expand until valid, shrink while valid, keep the shortest. Each letter enters and leaves once: O(m + n).',
      not: [
        { id: 'hashing', why: 'The need counts are a map, but the window decides which ranges are tried.' },
        { id: 'two-pointers', why: 'These are two same-direction pointers: a sliding window.' },
      ],
    },
    watch: {
      frames: [
        { title: 'Grow to "ADOBEC"', text: 'Now A, B and C are all inside: missing = 0. Shortest so far: 6.' },
        { title: 'Shrink: drop A', text: 'A is needed: missing becomes 1. Grow again.' },
        { title: '… "BANC"', text: 'The last window that covers t and can\'t shrink further has length 4: "BANC".' },
      ],
    },
    edges: ['t longer than s → "".', 't with repeated letters ("AA").', 't is one letter.'],
  },

  'minimum-number-of-k-consecutive-bit-flips': {
    read: [
      { phrase: 'subarray of length exactly `k`', says: 'Each operation is a fixed-size window.' },
      { phrase: 'flips every bit in it', says: 'Flipping twice cancels and order doesn\'t matter: each window is used once or not at all.' },
      { phrase: 'or `-1` if it is not possible', says: 'A zero near the end may have no window left to fix it.' },
    ],
    budget: { from: 'nums.length ≤ 10⁵, k ≤ n', n: 1e5, aim: 'O(n)', note: 'Flipping k cells per decision is O(n · k), up to 2.5 × 10⁹.' },
    observe: [
      {
        title: 'The leftmost 0 forces a flip right there',
        text: 'No window further left can still change it, so a flip must start at that index.',
        sketch: { kind: 'array', rows: [{ items: [0, 0, 0, 1, 0, 1, 1, 0], bands: [{ from: 0, to: 2, tone: 'accent', label: 'forced' }] }] },
      },
      {
        title: 'Count flips instead of doing them',
        text: 'Keep how many active flips cover index i; the bit is flipped if that count is odd. Each flip stops covering at i + k: record it and subtract it there.',
      },
    ],
    brute: { idea: 'Scan left to right; at each 0, flip the next k bits for real.', cost: 'O(n · k)', waste: 'Each flip rewrites k cells, when a counter of active flips gives every bit\'s current value in O(1).' },
    pattern: {
      pick: 'sliding-window',
      why: 'A window of active flips slides along: add a flip where a 0 forces it, expire it k later. O(n).',
      not: [
        { id: 'greedy', why: 'The reasoning is greedy (each flip is forced), but the speed comes from the sliding count of active flips.' },
        { id: 'prefix-sums', why: 'A difference array is exactly how flip ends are recorded; on its own it doesn\'t decide where to flip.' },
      ],
    },
    watch: { viz: 'FlipWindowViz', inputs: [{ label: '[0, 0, 0, 1, 0, 1, 1, 0], k = 3', input: { nums: [0, 0, 0, 1, 0, 1, 1, 0], k: 3 } }, { label: '[1, 1, 0], k = 2 (impossible)', input: { nums: [1, 1, 0], k: 2 } }] },
    edges: ['k = 1: count the zeros.', 'k = n: all ones or all zeros, else −1.', 'A zero within the last k − 1 cells after flips → −1.'],
  },

  'subarrays-with-k-different-integers': {
    read: [
      { phrase: 'exactly `k` different values', says: '"Exactly" is not monotone: shrinking can drop below k. A plain window can\'t count it directly.' },
      { phrase: 'Count the good contiguous subarrays', says: 'Counting, not maximising: for each right end, how many starts work.' },
      { phrase: 'the number with exactly k different values equals the number with at most k minus the number with at most k − 1', says: 'The trick: "at most" is monotone, so slide it twice and subtract.' },
    ],
    budget: { from: 'nums.length ≤ 2 × 10⁴', n: 2e4, aim: 'O(n)', note: 'Extending from every start is O(n²) = 4 × 10⁸: risky.' },
    observe: [
      {
        title: '"At most k distinct" is easy to slide',
        text: 'Shrinking a window never adds distinct values. For each right end r, every start from l to r works: add r − l + 1.',
      },
      {
        title: 'Exactly k = at most k − at most (k − 1)',
        text: 'For [1, 2, 1, 2, 3] with k = 2: at most 2 gives 12 subarrays, at most 1 gives 5, so exactly 2 gives 7.',
        sketch: { kind: 'array', rows: [{ label: 'at most 2, per right end', items: [1, 2, 3, 4, 2], marks: { 0: 'kept', 1: 'kept', 2: 'kept', 3: 'kept', 4: 'kept' } }, { label: 'at most 1, per right end', items: [1, 1, 1, 1, 1] }] },
      },
    ],
    brute: { idea: 'From every start, extend while tracking distinct values, counting ends where there are exactly k.', cost: 'O(n²)', waste: 'Distinct counts are rebuilt for each start.' },
    pattern: {
      pick: 'sliding-window',
      why: 'Count "at most k" with a sliding window (adding r − l + 1 per end), do it for k and k − 1, and subtract: O(n).',
      not: [
        { id: 'prefix-sums', why: 'Prefix sums count subarrays by sum; distinct values don\'t subtract like sums do.' },
        { id: 'hashing', why: 'The value counts live in a map, but the window and the subtraction trick do the counting.' },
      ],
    },
    watch: {
      frames: [
        { title: 'at most 2 distinct: 12', text: 'Right ends add 1, 2, 3, 4, then 2 (the 3 forces the window down to [2, 3]).' },
        { title: 'at most 1 distinct: 5', text: 'No two neighbours are equal, so only single elements: 5.' },
        { title: 'Exactly 2: 12 − 5 = 7', text: 'The answer.' },
      ],
    },
    edges: ['k = 1: runs of equal values.', 'k larger than the number of distinct values → 0.', 'All values equal.'],
  },
};
