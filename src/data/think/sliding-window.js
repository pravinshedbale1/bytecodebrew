/** Practice thinking walkthroughs: sliding-window (format: src/data/think/index.js). */

export default {
  'longest-substring-without-repeating-characters': {
    aha: 'Keep a window [l, r] with no repeated letter. Grow it on the right; when the new letter is a repeat, move the left end past the earlier copy. Both ends only ever move right, so it is one pass.',
    asks: {
      read: 'Which word in the statement tells you the answer is one unbroken stretch of the string?',
      observe: 'In "abcabcbb", the window "abc" meets another a. Which letters must leave so the window is valid again?',
      pattern: 'Once a window has a repeated letter, can growing it ever fix that?',
      budget: '5 × 10⁴ characters. How many substrings would you have to check one by one?',
      brute: 'Restarting from every start position works. What does each restart re-learn?',
      watch: 'Watch the left end jump past the earlier copy whenever a letter repeats.',
    },
    read: [
      { phrase: 'the longest substring', says: 'Maximise the length of a range of the string, so we compare ranges, not single letters.' },
      { phrase: 'a contiguous run of characters', says: 'An unbroken stretch: a sliding window is the first thing to try.' },
      {
        phrase: 'no character appears more than once',
        says: 'The rule for a valid window: every letter count is at most 1. Something must keep those counts.',
      },
    ],
    budget: { from: 's.length ≤ 5 × 10⁴', n: 50000, aim: 'O(n)', note: 'Listing all substrings is 1.25 × 10⁹ before even checking them: too slow.' },
    observe: [
      {
        title: 'A repeat spoils every bigger window too',
        text: '"abca" has two a\'s, and every window containing it does too. Growing a bad window never fixes it; only moving the left end can.',
        sketch: {
          kind: 'array',
          rows: [
            {
              items: ['a', 'b', 'c', 'a', 'b', 'c', 'b', 'b'],
              marks: { '0': 'bad', '3': 'bad' },
              bands: [{ from: 0, to: 3, tone: 'danger', label: 'two a\'s' }],
            },
          ],
        },
      },
      {
        title: 'The left end only ever moves right',
        text: 'Drop the first a and "bca" is valid again. The best window ending at the next letter can\'t start further left than this, so the left end never needs to go back.',
        sketch: {
          kind: 'array',
          rows: [
            {
              items: ['a', 'b', 'c', 'a', 'b', 'c', 'b', 'b'],
              bands: [{ from: 1, to: 3, tone: 'success', label: 'valid' }],
              tags: { '1': [['l', 'interview']], '3': [['r', 'accent']] },
            },
          ],
        },
      },
      {
        title: 'The window\'s state is a count per letter',
        text: 'To know whether adding s[r] creates a repeat, keep how many times each letter is in the window. Adding or removing one letter changes one count.',
        sketch: { kind: 'array', rows: [{ label: 'counts in "bca"', items: ['a:1', 'b:1', 'c:1'], marks: { '0': 'kept', '1': 'kept', '2': 'kept' } }] },
      },
    ],
    brute: {
      idea: 'For each start, extend while the letters stay unique (using a set), and keep the longest.',
      cost: 'O(n²)',
      waste: 'When the start moves by one, it re-checks letters it already knew were unique.',
    },
    pattern: {
      pick: 'sliding-window',
      why: 'An unbroken range, a rule that only gets worse as the window grows, and window state (letter counts) that updates in one step as a letter enters or leaves: O(n).',
      not: [
        {
          id: 'two-pointers',
          why: 'Classic two pointers walk towards each other; here both ends move the same way, which is exactly a sliding window.',
        },
        { id: 'hashing', why: 'The letter counts live in a map, but the map alone doesn\'t say which range to look at.' },
      ],
    },
    watch: {
      viz: 'WindowCountsViz',
      inputs: [{ label: '"abcabcbb"', input: { mode: 'unique', s: 'abcabcbb' } }, { label: '"pwwkew"', input: { mode: 'unique', s: 'pwwkew' } }],
    },
    edges: ['The empty string: "" → 0.', 'All the same letter: "bbbb" → 1.', 'Spaces count as characters: "a b" → 3.'],
  },

  'maximum-average-subarray-i': {
    free: true,
    aha: 'Every window has the same length k, so the best average is just the best sum. Slide the window one step at a time: add the number that enters, subtract the one that leaves.',
    asks: {
      observe: 'The window [1, 12, −5, −6] sums to 2. What is the sum of the next window, using only one addition and one subtraction?',
      pattern: 'Two neighbouring windows share k − 1 numbers. How can you avoid adding those again?',
      read: 'Which phrase tells you every candidate has the same length?',
      budget: '10⁵ numbers and k up to n. What does summing each window from scratch cost?',
      brute: 'Summing every window separately is correct. Which numbers does it add again and again?',
      watch: 'Watch one number enter and one leave as the window slides, and the best sum update.',
    },
    read: [
      {
        phrase: 'contiguous subarrays of `nums` that have exactly `k` elements',
        says: 'Every candidate has the same length k: a fixed-size sliding window.',
      },
      { phrase: 'the largest average', says: 'With k fixed, the largest average is just the largest sum divided by k.' },
      {
        phrase: 'adding the element that enters and subtracting the one that leaves',
        says: 'The statement spells out the update: one step per move.',
      },
    ],
    budget: { from: 'n ≤ 10⁵, k ≤ n', n: 100000, aim: 'O(n)', note: 'Summing each window from scratch is O(n · k), up to 2.5 × 10⁹ when k ≈ n / 2.' },
    observe: [
      {
        title: 'Neighbouring windows share k − 1 numbers',
        text: 'Moving the window one step changes only two numbers: one enters on the right, one leaves on the left.',
        sketch: {
          kind: 'array',
          rows: [
            {
              items: [1, 12, -5, -6, 50, 3],
              bands: [{ from: 0, to: 3, tone: 'ghost', label: 'sum 2' }, { from: 1, to: 4, tone: 'accent' }],
              marks: { '0': 'dim', '4': 'cur' },
            },
          ],
          caption: 'next sum = 2 − 1 + 50 = 51',
        },
      },
      {
        title: 'Track the sum, divide once',
        text: 'Keep the best sum while sliding; divide by k only at the end.',
        sketch: { kind: 'array', rows: [{ label: 'window sums', items: [2, 51, 42], marks: { '1': 'hit' } }], caption: 'best 51 → 51 / 4 = 12.75' },
      },
    ],
    brute: {
      idea: 'For each of the n − k + 1 windows, add up its k numbers.',
      cost: 'O(n · k)',
      waste: 'Each window re-adds the k − 1 numbers it shares with the previous one.',
    },
    pattern: {
      pick: 'sliding-window',
      why: 'A fixed-size window over neighbouring numbers: update the sum in one step as it slides. O(n).',
      not: [
        { id: 'prefix-sums', why: 'prefix[i + k] − prefix[i] gives each window sum in one step too, but needs an extra array.' },
        { id: 'two-pointers', why: 'The two ends move together at a fixed distance; that is exactly a fixed-size window.' },
      ],
    },
    watch: { viz: 'SlidingWindowViz', inputs: [{ label: '[1, 12, −5, −6, 50, 3], k = 4', input: { mode: 'fixed', nums: [1, 12, -5, -6, 50, 3], k: 4 } }] },
    edges: ['k = n: one window, [5, 5], k 2 → 5.', 'All negative: [−1, −2, −3], k 2 → −1.5.', 'k = 1: the largest value, [3, 9, 4] → 9.'],
  },

  'contains-duplicate-ii': {
    aha: 'Only the last k numbers can be close enough to matter. Keep exactly those k numbers in a set: if the new number is already in the set, it has a copy at most k positions back.',
    asks: {
      observe: 'In [1, 2, 3, 1] with k = 3, how far apart are the two 1s? Would k = 2 still be enough?',
      pattern: 'If only the last k numbers matter, what should you keep, and what should you throw away as you move?',
      read: 'Which condition limits how far back a matching copy may be?',
      budget: '10⁵ values and k up to 10⁵. What does comparing each value with the next k cost?',
      brute: 'Comparing each value with its next k neighbours works. What is re-scanned each time?',
      watch: 'Watch the set hold only the last k values: check, add, and drop the oldest.',
    },
    read: [
      { phrase: '`nums[i] == nums[j]`', says: 'We are looking for two positions holding the same value…' },
      { phrase: '`|i − j| <= k`', says: '…but only within distance k: only the last k values matter at any moment.' },
    ],
    budget: { from: 'nums.length, k ≤ 10⁵', n: 100000, aim: 'O(n)', note: 'Comparing each value with the next k is O(n · k), up to 10¹⁰.' },
    observe: [
      {
        title: 'Only a window of the last k values matters',
        text: 'A copy further back than k positions is too far. So the set only ever needs the last k values.',
        sketch: {
          kind: 'array',
          rows: [{ items: [1, 2, 3, 1], bands: [{ from: 0, to: 2, tone: 'accent', label: 'last k = 3' }], marks: { '0': 'hit', '3': 'cur' } }],
          caption: '1 is in the window: true',
        },
      },
      {
        title: 'Slide: check, add, drop the oldest',
        text: 'Before adding nums[i], check the set. After adding it, remove nums[i − k] so the set never holds more than k values.',
        sketch: {
          kind: 'array',
          rows: [
            {
              label: '[1, 2, 3, 1, 2, 3], k = 2',
              items: [1, 2, 3, 1, 2, 3],
              bands: [{ from: 1, to: 2, tone: 'accent', label: 'set' }],
              marks: { '0': 'muted', '3': 'cur' },
            },
          ],
          caption: 'the old 1 has already left: no match',
        },
      },
    ],
    brute: {
      idea: 'For each index, compare its value with the next k values.',
      cost: 'O(n · k)',
      waste: 'Overlapping ranges are re-scanned; a set of the window answers "is it there?" in one step.',
    },
    pattern: {
      pick: 'sliding-window',
      why: 'A fixed-size window of the last k values, kept in a hash set: O(n).',
      not: [
        { id: 'hashing', why: 'A map of each value\'s last position also works in O(n); the window view explains why only k values matter.' },
        { id: 'two-pointers', why: 'Nothing is steered towards a target: the window just moves forward one position at a time.' },
      ],
    },
    watch: {
      viz: 'WindowWalkViz',
      inputs: [
        { label: '[1, 2, 3, 1], k = 3', input: { mode: 'dup2', nums: [1, 2, 3, 1], k: 3 } },
        { label: '[1, 2, 3, 1, 2, 3], k = 2', input: { mode: 'dup2', nums: [1, 2, 3, 1, 2, 3], k: 2 } },
      ],
    },
    edges: ['k = 0: [1, 1], k 0 → false.', 'Repeats exactly k + 1 apart: [1, 2, 1], k 1 → false.', 'A single element: [7], k 3 → false.'],
  },

  'minimum-size-subarray-sum': {
    aha: 'All numbers are positive, so growing a window raises its sum and shrinking lowers it. Grow on the right until the sum is enough, then shrink from the left as long as it stays enough, recording each length.',
    asks: {
      observe: 'In [2, 3, 1, 2, 4, 3] with target 7, once [2, 3, 1, 2] reaches 8, can you drop the 2 on the left and still have at least 7?',
      pattern: 'With only positive numbers, what happens to the sum when the window grows? When it shrinks?',
      read: 'Which phrase makes the window\'s sum behave predictably as it grows and shrinks?',
      budget: '10⁵ positive numbers. What does extending from every start cost?',
      brute: 'Extending from each start until the target is reached works. What does each start rebuild?',
      watch: 'Watch the window grow until the sum is enough, then shrink while it still is.',
    },
    read: [
      {
        phrase: 'contains only positive integers',
        says: 'Adding a number always raises the sum, removing one always lowers it: the window behaves predictably.',
      },
      { phrase: 'the shortest contiguous subarray', says: 'Minimise a window\'s length: grow until it is enough, then shrink as far as possible.' },
      { phrase: 'return `0`', says: 'If even the whole array sums to less than target, no window works: return 0, not a huge length.' },
    ],
    budget: { from: 'nums.length ≤ 10⁵', n: 100000, aim: 'O(n)', note: 'Extending from every start is O(n²).' },
    observe: [
      {
        title: 'Once the sum is enough, shrink from the left',
        text: 'With positive numbers, the window that just reached the target may still reach it after dropping its leftmost number. Keep dropping while it does.',
        sketch: {
          kind: 'array',
          rows: [{ items: [2, 3, 1, 2, 4, 3], bands: [{ from: 2, to: 4, tone: 'success', label: 'sum 7' }], marks: { '0': 'dim', '1': 'dim' } }],
          caption: '[1, 2, 4] has length 3',
        },
      },
      {
        title: 'Neither end ever moves back',
        text: 'Both ends only move right, so the whole scan is at most 2n moves.',
        sketch: {
          kind: 'array',
          rows: [
            {
              items: [2, 3, 1, 2, 4, 3],
              bands: [{ from: 4, to: 5, tone: 'success', label: 'sum 7' }],
              marks: { '0': 'dim', '1': 'dim', '2': 'dim', '3': 'dim' },
            },
          ],
          caption: 'the shortest: [4, 3], length 2',
        },
      },
    ],
    brute: {
      idea: 'From every start, add numbers until the sum reaches the target.',
      cost: 'O(n²)',
      waste: 'Each start rebuilds sums that the previous window already had.',
    },
    pattern: {
      pick: 'sliding-window',
      why: 'A window that grows on the right until the sum is enough and shrinks on the left while it still is: each number enters and leaves once, O(n).',
      not: [
        { id: 'prefix-sums', why: 'Prefix sums plus binary search for each start give O(n log n).' },
        { id: 'two-pointers', why: 'These are two pointers moving the same way: that is the sliding window.' },
      ],
    },
    watch: {
      viz: 'SlidingWindowViz',
      inputs: [{ label: 'target 7, [2, 3, 1, 2, 4, 3]', input: { mode: 'shortest', nums: [2, 3, 1, 2, 4, 3], target: 7 } }],
    },
    edges: [
      'The total falls short: target 11, [1, 1, 1, 1] → 0.',
      'One number is enough: target 4, [1, 4, 4] → 1.',
      'The whole array is needed: target 6, [1, 2, 3] → 3.',
    ],
  },

  'max-consecutive-ones-iii': {
    aha: 'Flipping at most k zeros means finding the longest stretch that contains at most k zeros. Grow the window to the right counting zeros; when there are too many, move the left end past the oldest zero.',
    asks: {
      observe: 'In [1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0] with k = 2, which stretch holds at most two zeros and is the longest?',
      pattern: 'Rephrase it without the word "flip": what must the window contain at most?',
      read: 'Which phrase turns flipping into a limit on what the window may contain?',
      budget: '10⁵ values. What does extending from every start cost?',
      brute: 'Extending from every start until a (k + 1)-th zero appears works. What is recounted?',
      watch: 'Watch the zero count inside the window, and the left end jump past the oldest zero.',
    },
    read: [
      { phrase: 'flip at most `k` of the zeros', says: 'A budget of k zeros we are allowed to keep in the run.' },
      { phrase: 'longest run of consecutive ones', says: 'An unbroken stretch, as long as possible.' },
      {
        phrase: 'the longest window that contains at most `k` zeros',
        says: 'The statement reframes it: a window is fine while its zero count is ≤ k.',
      },
    ],
    budget: { from: 'nums.length ≤ 10⁵', n: 100000, aim: 'O(n)', note: 'Extending from every start is O(n²).' },
    observe: [
      {
        title: 'Count the zeros inside the window',
        text: 'The window is fine while it holds at most k zeros; a (k + 1)-th zero makes it too much.',
        sketch: {
          kind: 'array',
          rows: [
            {
              items: [1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0],
              bands: [{ from: 5, to: 10, tone: 'success', label: '2 zeros' }],
              marks: { '5': 'target', '10': 'target' },
            },
          ],
          caption: 'k = 2: length 6',
        },
      },
      {
        title: 'Shrink until a zero leaves',
        text: 'When there are k + 1 zeros, move the left end past the oldest zero in the window.',
        sketch: {
          kind: 'array',
          rows: [{ items: [1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], bands: [{ from: 0, to: 5, tone: 'danger', label: '3 zeros' }], marks: { '3': 'bad' } }],
          caption: 'drop everything up to the first zero',
        },
      },
    ],
    brute: {
      idea: 'From every start, extend until a (k + 1)-th zero appears.',
      cost: 'O(n²)',
      waste: 'Each start recounts zeros that the previous window already counted.',
    },
    pattern: {
      pick: 'sliding-window',
      why: 'The longest window under a budget (at most k zeros): grow right, shrink left when over budget. O(n).',
      not: [
        { id: 'prefix-sums', why: 'Prefix counts of zeros with binary search work in O(n log n).' },
        { id: 'dp-linear', why: 'A DP over positions is possible, but the window is simpler and O(n).' },
      ],
    },
    watch: {
      viz: 'WindowWalkViz',
      inputs: [{ label: '[1,1,1,0,0,0,1,1,1,1,0], k = 2', input: { mode: 'ones', nums: [1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], k: 2 } }],
    },
    edges: ['k = 0: [1, 0, 1, 1] → 2 (the longest run as it is).', 'k at least the number of zeros: [0, 1, 0], k 2 → 3.', 'All zeros: [0, 0, 0], k 1 → 1.'],
  },

  'minimum-operations-to-make-binary-array-elements-equal-to-one-i': {
    aha: 'Only the window starting at index 0 can change index 0, so whether to flip there is forced. Fix index 0, then index 1 is forced the same way, and so on: one left-to-right pass makes every decision.',
    asks: {
      observe: 'In [0, 1, 1, 1, 0, 0], which flips could possibly change index 0?',
      pattern: 'If every decision is forced, is there anything left to search or compare?',
      read: 'Which phrase tells you each operation covers exactly three neighbours?',
      budget: '10⁵ values. Could you try sets of windows, or must every choice be forced?',
      brute: 'Trying every set of window starts is exponential. How many plans really exist?',
      watch: 'Watch each 0 force a flip at its own position, and the last two cells decide the answer.',
    },
    read: [
      { phrase: 'flip all of them', says: 'An operation on a fixed-size window of 3.' },
      { phrase: 'the minimum number of operations', says: 'Each window is flipped once or not at all (twice cancels), and order doesn\'t matter.' },
      { phrase: 'or `-1` if it is impossible', says: 'Some arrays can\'t be fixed: the last two cells may be stuck.' },
    ],
    budget: { from: 'nums.length ≤ 10⁵', n: 100000, aim: 'O(n)', note: 'Trying sets of windows is exponential; there is a forced choice instead.' },
    observe: [
      {
        title: 'Index 0 can only be fixed by the window starting at 0',
        text: 'So if nums[0] is 0, that flip is forced; if it is 1, flipping there is forbidden. Then index 1 is decided the same way.',
        sketch: { kind: 'array', rows: [{ items: [0, 1, 1, 1, 0, 0], bands: [{ from: 0, to: 2, tone: 'accent', label: 'forced' }], marks: { '0': 'bad' } }] },
      },
      {
        title: 'The last two cells have no window of their own',
        text: 'After the scan, if either of the last two is still 0, nothing can fix it: −1.',
        sketch: {
          kind: 'array',
          rows: [{ label: '[0, 1, 1, 1] after flipping at 0', items: [1, 0, 0, 1], marks: { '1': 'bad', '2': 'bad' } }],
          caption: 'flipping at 1 fixes index 1 but breaks index 3 → −1',
        },
      },
    ],
    brute: {
      idea: 'Try every set of window starts and keep the smallest that leaves all ones.',
      cost: 'O(2ⁿ · n)',
      waste: 'Every decision is actually forced; there is only one plan to find.',
    },
    pattern: {
      pick: 'sliding-window',
      why: 'A window of 3 sweeps left to right, and at each step the choice is forced, so one pass gives the minimum.',
      not: [
        { id: 'backtracking', why: 'Exploring every set of flips is exponential, and pointless: each decision is forced by the leftmost 0.' },
        { id: 'dp-linear', why: 'A DP is unnecessary: no choice ever branches.' },
      ],
    },
    watch: {
      viz: 'FlipWindowViz',
      inputs: [
        { label: '[0, 1, 1, 1, 0, 0], k = 3', input: { nums: [0, 1, 1, 1, 0, 0], k: 3 } },
        { label: '[0, 1, 1, 1], k = 3 (impossible)', input: { nums: [0, 1, 1, 1], k: 3 } },
      ],
    },
    edges: ['All ones: [1, 1, 1] → 0.', 'A zero stuck at the end: [1, 1, 0] → −1.', 'Exactly one window: [0, 0, 0] → 1.'],
  },

  'longest-repeating-character-replacement': {
    aha: 'A window can be turned into one repeated letter if the letters that are NOT its most common letter number at most k. Slide a window keeping letter counts; shrink it when length − (most common count) goes above k.',
    asks: {
      observe: 'In "AABABBA" with k = 1, how many letters must change to make "AABA" all A? And "AABAB"?',
      pattern: 'For a given window, which letter should you keep, and how many changes does that need?',
      read: 'Which phrase sets the limit on how many letters may change?',
      budget: '10⁵ characters. What does extending from every start cost?',
      brute: 'Extending from every start while the changes fit works. What is rebuilt each time?',
      watch: 'Watch length − (most common count) stay within k, and the window shrink when it doesn\'t.',
    },
    read: [
      { phrase: 'at most `k` times in total', says: 'A budget of k changes for the window.' },
      {
        phrase: 'the longest substring that can be made to consist of a single repeated letter',
        says: 'A longest valid window. Which letter? The one already most common in it, so the fewest letters change.',
      },
    ],
    budget: { from: 's.length ≤ 10⁵', n: 100000, aim: 'O(n)', note: 'Extending from every start is O(n²).' },
    observe: [
      {
        title: 'Changes needed = length − most common count',
        text: 'Keep the most common letter and change everything else. "AABA" has three A\'s, so one change (the B) makes it "AAAA".',
        sketch: {
          kind: 'array',
          rows: [
            {
              items: ['A', 'A', 'B', 'A', 'B', 'B', 'A'],
              bands: [{ from: 0, to: 3, tone: 'success', label: '4 − 3 = 1 ≤ k' }],
              marks: { '2': 'target' },
            },
          ],
        },
      },
      {
        title: 'Too many changes? Shrink from the left',
        text: '"AABAB" has length 5 and three A\'s: 2 changes, more than k = 1. Drop the left letter.',
        sketch: {
          kind: 'array',
          rows: [{ items: ['A', 'A', 'B', 'A', 'B', 'B', 'A'], bands: [{ from: 0, to: 4, tone: 'danger', label: '5 − 3 = 2 > k' }] }],
        },
      },
    ],
    brute: {
      idea: 'From every start, extend while the window needs at most k changes.',
      cost: 'O(n²)',
      waste: 'Letter counts are rebuilt for every start.',
    },
    pattern: {
      pick: 'sliding-window',
      why: 'The longest window satisfying length − (most common count) ≤ k, with counts updated in one step as letters enter and leave: O(n).',
      not: [
        { id: 'dp-strings', why: 'There is no second string and no table over positions; one window is enough.' },
        { id: 'hashing', why: 'The letter counts are a table, but the window decides which range to look at.' },
      ],
    },
    watch: { viz: 'WindowWalkViz', inputs: [{ label: '"AABABBA", k = 1', input: { mode: 'replace', s: 'AABABBA', k: 1 } }] },
    edges: ['k at least the length: "ABC", k 3 → 3.', 'All the same letter: "AAAA", k 0 → 4.', 'k = 0: "AABBB" → 3 (the longest run as it is).'],
  },

  'permutation-in-string': {
    aha: 'A rearrangement of s1 has exactly s1\'s letter counts and exactly its length. Slide a window of that length over s2, updating counts as one letter enters and one leaves; when the counts match, you found one.',
    asks: {
      observe: 'In "eidbaooo", which window of length 2 has the same letters as "ab"?',
      pattern: 'Every candidate has the same length. What changes between one window and the next?',
      read: 'Which phrase tells you only the letter counts matter, not their order?',
      budget: 'Both strings up to 10⁴ letters. What does sorting every window cost?',
      brute: 'Sorting each window and comparing works. How much do two neighbouring windows differ?',
      watch: 'Watch one letter enter and one leave, and the counts match at "ba".',
    },
    read: [
      { phrase: 'a rearrangement (a permutation) of `s1`', says: 'Same letters, same counts: compare counts, not order.' },
      { phrase: 'contiguous substring', says: 'The permutation must be one unbroken piece of s2: a window, not letters picked from anywhere.' },
      { phrase: 'Only windows of exactly the length of `s1` can match', says: 'Fixed size: the window slides one letter at a time.' },
    ],
    budget: { from: 's1, s2 ≤ 10⁴ letters', n: 10000, aim: 'O(n)', note: 'Sorting every window is O(n · m log m).' },
    observe: [
      {
        title: 'A rearrangement has the same letter counts',
        text: '"ba" is a rearrangement of "ab": one a and one b.',
        sketch: { kind: 'array', rows: [{ items: ['e', 'i', 'd', 'b', 'a', 'o', 'o', 'o'], bands: [{ from: 3, to: 4, tone: 'success', label: 'b, a' }] }] },
      },
      {
        title: 'Sliding changes two counts',
        text: 'One letter enters, one leaves. Updating two counts and comparing is quick, so each step is one move.',
        sketch: {
          kind: 'array',
          rows: [{ items: ['e', 'i', 'd', 'b', 'a', 'o', 'o', 'o'], bands: [{ from: 2, to: 3, tone: 'accent' }], marks: { '1': 'dim', '3': 'cur' } }],
          caption: 'i leaves, b enters',
        },
      },
    ],
    brute: {
      idea: 'Sort s1, then sort every window of s2 of the same length and compare.',
      cost: 'O(n · m log m)',
      waste: 'Each window is sorted again, though it differs from the previous one by only two letters.',
    },
    pattern: {
      pick: 'sliding-window',
      why: 'A fixed-size window over s2 with letter counts, updated in one step per move: O(n).',
      not: [
        { id: 'sorting-and-selection', why: 'Sorting each window works, but costs a sort per window.' },
        { id: 'hashing', why: 'Counts are the state; the window is what makes each update cheap.' },
      ],
    },
    watch: { viz: 'WindowCountsViz', inputs: [{ label: 's2 = "eidbaooo", s1 = "ab"', input: { mode: 'anagram', s: 'eidbaooo', p: 'ab' } }] },
    edges: ['s1 longer than s2: "abc", "ab" → false.', 's1 equal to s2: "ab", "ab" → true.', 'Repeated letters: "aab", "baaa" → true ("baa").'],
  },

  'find-all-anagrams-in-a-string': {
    aha: 'Every candidate window has length |p|. Slide one window across s, keeping letter counts: each move adds one letter and removes one, and whenever the counts equal p\'s counts, record the start.',
    asks: {
      observe: 'In "cbaebabacd", which windows of length 3 use exactly the letters a, b and c?',
      pattern: 'Windows of fixed length, compared by letter counts: what changes between neighbouring windows?',
      read: 'Which phrases fix the window\'s length and say how to compare it with p?',
      budget: 'Both strings up to 3 × 10⁴ letters. What does sorting every window cost?',
      brute: 'Sorting every window works. What do neighbouring windows share?',
      watch: 'Watch the counts update as the window slides, and every matching start get recorded.',
    },
    read: [
      { phrase: 'has length `p.length`', says: 'Every candidate window has exactly p\'s length: a fixed-size window slides across s.' },
      {
        phrase: 'is an anagram (a rearrangement) of `p`',
        says: 'An anagram has the same letters with the same counts: compare count tables, not strings.',
      },
      { phrase: 'If `p` is longer than `s`, the answer is empty', says: 'Check that before sliding.' },
    ],
    budget: { from: 's, p ≤ 3 × 10⁴ letters', n: 30000, aim: 'O(n)', note: 'Sorting every window is O(n · m log m).' },
    observe: [
      {
        title: 'Every window of length |p| is a candidate',
        text: 'In "cbaebabacd", the windows starting at 0 ("cba") and 6 ("bac") use exactly a, b and c.',
        sketch: {
          kind: 'array',
          rows: [
            {
              items: ['c', 'b', 'a', 'e', 'b', 'a', 'b', 'a', 'c', 'd'],
              bands: [{ from: 0, to: 2, tone: 'success' }, { from: 6, to: 8, tone: 'success' }],
            },
          ],
        },
      },
      {
        title: 'One in, one out',
        text: 'Each slide updates two counts; a running number of "letters still missing" says at once whether the window matches.',
        sketch: {
          kind: 'array',
          rows: [
            {
              items: ['c', 'b', 'a', 'e', 'b', 'a', 'b', 'a', 'c', 'd'],
              bands: [{ from: 1, to: 3, tone: 'accent' }],
              marks: { '0': 'dim', '3': 'bad' },
            },
          ],
          caption: 'e enters: no longer a match',
        },
      },
    ],
    brute: {
      idea: 'Sort p, then sort and compare every window of s.',
      cost: 'O(n · m log m)',
      waste: 'Windows that differ by two letters are sorted from scratch.',
    },
    pattern: {
      pick: 'sliding-window',
      why: 'A fixed-size window with letter counts: each slide is one step, so every start position is checked in O(n) total.',
      not: [
        { id: 'sorting-and-selection', why: 'Sorting each window is correct but slow.' },
        { id: 'string-matching', why: 'KMP finds exact copies of p; anagrams can be in any order.' },
      ],
    },
    watch: { viz: 'WindowCountsViz', inputs: [{ label: 's = "cbaebabacd", p = "abc"', input: { mode: 'anagram', s: 'cbaebabacd', p: 'abc' } }] },
    edges: ['p longer than s: "ab", "abc" → [].', 'Overlapping matches: "abab", "ab" → [0, 1, 2].', 'p of length 1: "aba", "a" → [0, 2].'],
  },

  'find-k-closest-elements': {
    aha: 'Because the array is sorted, the k closest values sit side by side: the answer is one window of k. To place it, compare the value just inside the window\'s left edge with the value just outside its right edge, and binary search the start.',
    asks: {
      observe: 'For [1, 2, 3, 4, 5], k = 4, x = 3: the window could start at 0 or 1. Which of 1 and 5 is closer to 3?',
      pattern: 'If the answer is always one block of k neighbours, what single number do you actually need to find?',
      read: 'Which phrase tells you the closest values sit side by side?',
      budget: '10⁴ values. Sorting by distance is fast enough. What does the sorted input allow instead?',
      brute: 'Sorting every value by distance works. What does it ignore about the input?',
      watch: 'Watch the inside and outside edge values decide where the window starts.',
    },
    read: [
      { phrase: '`arr` is sorted in ascending order', says: 'The k closest values sit together: they form one block.' },
      { phrase: 'Return the `k` values of `arr` closest to `x`', says: 'A window of exactly k values; we need its start.' },
      { phrase: 'if the distances are equal and `a < b`', says: 'Ties go to the smaller value, which is the left side.' },
    ],
    budget: {
      from: 'arr.length ≤ 10⁴',
      n: 10000,
      aim: 'O(log n + k)',
      note: 'Sorting by distance is O(n log n): fine, but the sorted input allows much better.',
    },
    observe: [
      {
        title: 'The answer is a window of k',
        text: 'If a value is in the answer, every value between it and x is even closer, so it is in too. The answer is one block.',
        sketch: {
          kind: 'array',
          rows: [{ items: [1, 2, 3, 4, 5], bands: [{ from: 0, to: 3, tone: 'success', label: 'k = 4' }], tags: { '2': [['x = 3', 'warn']] } }],
        },
      },
      {
        title: 'Compare the edges to choose the start',
        text: 'For a start s, compare arr[s] (just inside) with arr[s + k] (just outside). If the outside value is closer, the window should move right. That decision flips only once, so binary search the start.',
        sketch: {
          kind: 'array',
          rows: [{ items: [1, 2, 3, 4, 5], marks: { '0': 'target', '4': 'target' }, tags: { '0': [['inside', 'warn']], '4': [['outside', 'warn']] } }],
          caption: '|1 − 3| = |5 − 3|: a tie keeps the left window',
        },
      },
    ],
    brute: {
      idea: 'Sort all values by (distance, value), take the first k, then sort them back.',
      cost: 'O(n log n)',
      waste: 'It ignores that the array is already sorted and the answer is a single block.',
    },
    pattern: {
      pick: 'sliding-window',
      why: 'The answer is a fixed-size window; binary search its start by comparing the value just inside with the value just outside: O(log n + k).',
      not: [
        { id: 'heap-patterns', why: 'A heap of size k by distance works in O(n log k), without using the sort.' },
        { id: 'two-pointers', why: 'Shrinking from both ends (drop the farther end until k remain) is O(n − k): correct, slower.' },
      ],
    },
    watch: {
      viz: 'WindowWalkViz',
      inputs: [
        { label: '[1 … 5], k = 4, x = 3', input: { mode: 'closest', arr: [1, 2, 3, 4, 5], k: 4, x: 3 } },
        { label: '[1, 1, 2, 3, 4, 5], k = 4, x = −1', input: { mode: 'closest', arr: [1, 1, 2, 3, 4, 5], k: 4, x: -1 } },
      ],
    },
    edges: ['x below every value: [1, 2, 3], k 2, x 0 → [1, 2].', 'x above every value: [1, 2, 3], k 2, x 9 → [2, 3].', 'A tie: [1, 3], k 1, x 2 → [1].'],
  },

  'minimum-window-substring': {
    aha: 'Grow a window on the right until it contains all of t (a counter of "letters still missing" hits 0). Then shrink it from the left as long as it still contains all of t, recording the shortest. Repeat until the right end reaches the end.',
    asks: {
      observe: 'In "ADOBECODEBANC", what is the first window that contains A, B and C? Can its left end move without losing one of them?',
      pattern: 'Once a window covers t, what is the only way it can get shorter?',
      read: 'Which phrase means repeated letters in t must be covered as many times as they appear?',
      budget: 'Both strings up to 10⁵. What does extending from every start cost?',
      brute: 'Extending from every start until t is covered works. What does each start recount?',
      watch: 'Watch the window grow until it covers t, then shrink while it still does.',
    },
    read: [
      {
        phrase: 'the shortest contiguous substring of `s` that contains every character of `t`',
        says: 'Minimise a window that must cover a requirement: grow until it covers, shrink while it still does.',
      },
      { phrase: 'including repeats', says: 'Counts, not just presence: track how many of each letter are still needed.' },
      { phrase: 'Letters are case-sensitive', says: '"a" and "A" are different letters.' },
    ],
    budget: { from: 's, t ≤ 10⁵', n: 100000, aim: 'O(m + n)', note: 'Extending from every start is O(m²), 10¹⁰.' },
    observe: [
      {
        title: 'Grow until the window covers t',
        text: 'A counter of letters still missing reaches 0 exactly when the window contains all of t.',
        sketch: {
          kind: 'array',
          rows: [
            {
              items: ['A', 'D', 'O', 'B', 'E', 'C', 'O', 'D', 'E', 'B', 'A', 'N', 'C'],
              bands: [{ from: 0, to: 5, tone: 'accent', label: 'covers ABC' }],
            },
          ],
        },
      },
      {
        title: 'Then shrink while it still covers',
        text: 'Drop letters from the left until removing one more would lose a needed letter. Record the window, then keep growing.',
        sketch: {
          kind: 'array',
          rows: [
            {
              items: ['A', 'D', 'O', 'B', 'E', 'C', 'O', 'D', 'E', 'B', 'A', 'N', 'C'],
              bands: [{ from: 9, to: 12, tone: 'success', label: 'BANC' }],
            },
          ],
        },
      },
    ],
    brute: {
      idea: 'From every start, extend until all of t is covered.',
      cost: 'O(m²)',
      waste: 'Each start recounts letters the previous window already had.',
    },
    pattern: {
      pick: 'sliding-window',
      why: 'A window with a "missing" counter: grow until it covers t, shrink while it still does, keep the shortest. Each letter enters and leaves once: O(m + n).',
      not: [
        { id: 'hashing', why: 'The needed counts are a map, but the window decides which ranges are tried.' },
        { id: 'two-pointers', why: 'These are two pointers moving the same way: a sliding window.' },
      ],
    },
    watch: {
      viz: 'WindowWalkViz',
      inputs: [
        { label: '"ADOBECODEBANC", "ABC"', input: { mode: 'minwin', s: 'ADOBECODEBANC', t: 'ABC' } },
        { label: '"A", "AA"', input: { mode: 'minwin', s: 'A', t: 'AA' } },
      ],
    },
    edges: ['t longer than s: "a", "aa" → "".', 'Repeats in t: "aa", "aa" → "aa".', 't is one letter: "abc", "b" → "b".'],
  },

  'minimum-number-of-k-consecutive-bit-flips': {
    aha: 'The leftmost 0 can only be fixed by a flip starting exactly there, so every flip is forced. Instead of flipping k cells each time, just count how many flips cover the current cell: an odd count means the bit is flipped.',
    asks: {
      observe: 'In [0, 0, 0, 1, 0, 1, 1, 0] with k = 3, which flip is forced first? Which cells does it cover?',
      pattern: 'Flipping k cells each time is slow. What single number tells you whether the current cell has been flipped?',
      read: 'Which phrase tells you a flip always covers exactly k neighbours?',
      budget: '10⁵ bits and k up to n. What does flipping k bits per decision cost?',
      brute: 'Flipping the next k bits for real at each 0 is correct. How many cell writes is that?',
      watch: 'Watch the count of active flips decide each bit, and flips expire k cells later.',
    },
    read: [
      { phrase: 'subarray of length exactly `k`', says: 'Each operation covers a fixed-size window.' },
      { phrase: 'flips every bit in it', says: 'Flipping twice cancels and order doesn\'t matter: each window is used once or not at all.' },
      { phrase: 'or `-1` if it is not possible', says: 'A zero near the end may have no window left to fix it.' },
    ],
    budget: { from: 'nums.length ≤ 10⁵, k ≤ n', n: 100000, aim: 'O(n)', note: 'Flipping k cells per decision is O(n · k), up to 2.5 × 10⁹.' },
    observe: [
      {
        title: 'The leftmost 0 forces a flip right there',
        text: 'No window further left can still change it, so a flip must start at that index.',
        sketch: { kind: 'array', rows: [{ items: [0, 0, 0, 1, 0, 1, 1, 0], bands: [{ from: 0, to: 2, tone: 'accent', label: 'forced' }] }] },
      },
      {
        title: 'Count the flips covering each cell',
        text: 'Keep "active" = how many flips cover the current cell. The bit is nums[i] if active is even and flipped if odd. A flip started at s stops counting at s + k.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'active flips per cell', items: [1, 1, 1, 0, 1, 2, 2, 1], marks: { '5': 'target', '6': 'target' } }],
          caption: 'cells 5 and 6 are covered twice: back to their original value',
        },
      },
    ],
    brute: {
      idea: 'Scan left to right; at each 0, flip the next k bits for real.',
      cost: 'O(n · k)',
      waste: 'Each flip rewrites k cells, when a count of active flips gives every bit\'s current value in one step.',
    },
    pattern: {
      pick: 'sliding-window',
      why: 'A sliding count of active flips: add a flip where a 0 forces it, let it expire k cells later. O(n).',
      not: [
        { id: 'greedy', why: 'The reasoning is greedy (each flip is forced), but the speed comes from counting active flips instead of flipping.' },
        { id: 'prefix-sums', why: 'Recording where flips end is a difference-array idea; on its own it doesn\'t decide where to flip.' },
      ],
    },
    watch: {
      viz: 'FlipWindowViz',
      inputs: [
        { label: '[0, 0, 0, 1, 0, 1, 1, 0], k = 3', input: { nums: [0, 0, 0, 1, 0, 1, 1, 0], k: 3 } },
        { label: '[1, 1, 0], k = 2 (impossible)', input: { nums: [1, 1, 0], k: 2 } },
      ],
    },
    edges: [
      'k = 1: count the zeros, [0, 1, 0] → 2.',
      'k = n: [0, 0, 0], k 3 → 1; [0, 1, 0], k 3 → −1.',
      'A zero in the last k − 1 cells after the scan: [1, 1, 0], k 2 → −1.',
    ],
  },

  'subarrays-with-k-different-integers': {
    aha: '"Exactly k different values" is awkward to slide, but "at most k" is easy: for each right end, every start from l to r works. So count "at most k", subtract "at most k − 1", and what is left is "exactly k".',
    asks: {
      observe: 'For [1, 2, 1, 2, 3] and k = 2: how many subarrays have at most 2 different values? How many have at most 1?',
      pattern: 'Why is "at most k" easier to slide than "exactly k"? What happens to each when the window shrinks?',
      budget: '2 × 10⁴ values. What does extending from every start cost?',
      brute: 'Extending from every start while counting different values works. What is rebuilt?',
      watch: 'Watch "at most 2" and "at most 1" get counted, then subtracted.',
      read: 'Why is "exactly k" awkward for a sliding window, and which phrase hands you the way around it?',
    },
    read: [
      {
        phrase: 'exactly `k` different values',
        says: '"Exactly" is awkward: shrinking a window can drop it below k, so a plain window can\'t count it directly.',
      },
      { phrase: 'Count the good contiguous subarrays', says: 'Counting, not maximising: for each right end, how many starts work.' },
      {
        phrase: 'the number with exactly k different values equals the number with at most k minus the number with at most k − 1',
        says: 'The trick: "at most" only ever gets easier as the window shrinks, so slide it twice and subtract.',
      },
    ],
    budget: { from: 'nums.length ≤ 2 × 10⁴', n: 20000, aim: 'O(n)', note: 'Extending from every start is O(n²) = 4 × 10⁸: risky.' },
    observe: [
      {
        title: '"At most k" is easy to slide',
        text: 'Shrinking a window never adds new values. For each right end r, shrink until at most k values remain; then every start from l to r works: add r − l + 1.',
        sketch: {
          kind: 'array',
          rows: [
            {
              label: 'at most 2, added per right end',
              items: [1, 2, 3, 4, 2],
              marks: { '0': 'kept', '1': 'kept', '2': 'kept', '3': 'kept', '4': 'kept' },
            },
          ],
          caption: '1 + 2 + 3 + 4 + 2 = 12',
        },
      },
      {
        title: 'Exactly k = at most k − at most (k − 1)',
        text: 'At most 1 different value: no two neighbours are equal, so only the 5 single elements. 12 − 5 = 7.',
        sketch: { kind: 'array', rows: [{ label: 'at most 1, added per right end', items: [1, 1, 1, 1, 1] }], caption: '12 − 5 = 7' },
      },
    ],
    brute: {
      idea: 'From every start, extend while tracking the number of different values, counting ends with exactly k.',
      cost: 'O(n²)',
      waste: 'Value counts are rebuilt for each start.',
    },
    pattern: {
      pick: 'sliding-window',
      why: 'Count "at most k" with a sliding window (adding r − l + 1 per right end), do it for k and k − 1, and subtract: O(n).',
      not: [
        { id: 'prefix-sums', why: 'Prefix sums count subarrays by their sum; "different values" doesn\'t subtract like a sum.' },
        { id: 'hashing', why: 'The value counts live in a map, but the window and the subtraction do the counting.' },
      ],
    },
    watch: { viz: 'WindowWalkViz', inputs: [{ label: '[1, 2, 1, 2, 3], k = 2', input: { mode: 'kdiff', nums: [1, 2, 1, 2, 3], k: 2 } }] },
    edges: ['k = 1: [1, 1, 2], k 1 → 4.', 'k larger than the number of different values: [1, 2], k 3 → 0.', 'All values equal: [5, 5, 5], k 1 → 6.'],
  },
};
