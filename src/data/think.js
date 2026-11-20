/**
 * Practice thinking: how an ideal problem solver gets from the statement to the pattern, per problem.
 * Six stages, revealed one at a time on /think/<slug>:
 *   read     clue phrases in the statement (each must appear in it verbatim) and what each suggests
 *   budget   the constraint that sets the time budget, and which complexities fit it
 *   observe  2–3 observations, each with a small sketch of the example
 *   brute    the obvious solution, its cost, and the work it repeats
 *   pattern  the pattern (a DSA lesson id), why, and why not the patterns it is usually confused with
 *   watch    the pattern running on the example: an existing step-through engine on our own inputs, or
 *            sketch frames; then edge cases to test before coding
 * Sketches: { kind: 'array', rows: [{ label?, items, marks?: { i: cls }, bands?: [{ from, to, tone, label? }],
 *             tags?: { i: [[label, tone]] } }], caption? }  or  { kind: 'grid', grid, marks?: { 'r,c': cls },
 *             labels?: { 'r,c': text }, caption? }. Array cls: cur, hit, bad, dim, target, kept, muted.
 *             Grid cls: fresh, rotten, empty, wall, cur, hit, ring.
 * scripts/think-check.mjs checks all of it against the problem data and the lessons.
 */
export const THINK = {
  'two-sum': {
    free: true,
    read: [
      { phrase: 'two numbers', says: 'A pair. For each number x, the question becomes: is its partner somewhere?' },
      { phrase: 'add up to `target`', says: 'The partner is not just any number: it is exactly target − x. A specific value we can look for.' },
      { phrase: 'Return the indices', says: 'We need positions, not values. Sorting would scramble them, so we must remember where each value was.' },
      { phrase: 'you may not use the same element twice', says: 'x must not pair with itself: look for the partner among the numbers before x.' },
    ],
    budget: { from: 'nums.length ≤ 10⁴', n: 1e4, aim: 'O(n)', note: 'O(n²) is about 10⁸ steps: it might pass, but it is the answer the interviewer expects you to improve.' },
    observe: [
      {
        title: 'The partner of each number is fixed',
        text: 'With target 9, the partner of 7 can only be 2. So at each position we are not searching for "something that works", we are checking for one known value.',
        sketch: { kind: 'array', rows: [{ items: [2, 7, 11, 15], marks: { 1: 'cur', 0: 'hit' }, tags: { 1: [['x', 'accent']], 0: [['9 − 7', 'success']] } }], caption: 'x = 7 needs 9 − 7 = 2, which sits at index 0' },
      },
      {
        title: '"Have I seen this value?" is a lookup, not a scan',
        text: 'Scanning back over everything before x costs O(n) each time. A hash map from value to index answers "is 2 here, and where?" in O(1).',
        sketch: { kind: 'array', rows: [{ label: 'seen so far (value → index)', items: ['2 → 0'], marks: { 0: 'kept' } }, { label: 'now', items: [7], marks: { 0: 'cur' } }], caption: 'one map lookup instead of a loop' },
      },
      {
        title: 'Check before storing',
        text: 'With [3, 2, 4] and target 6, the first 3 must not find itself. Look up the partner first, then add x to the map, so the map only ever holds earlier elements.',
        sketch: { kind: 'array', rows: [{ items: [3, 2, 4], marks: { 0: 'bad' }, tags: { 0: [['3 + 3?', 'danger']] } }], caption: 'storing 3 first would wrongly answer [0, 0]' },
      },
    ],
    brute: { idea: 'Try every pair (i, j) with i < j and check nums[i] + nums[j] == target.', cost: 'O(n²)', waste: 'For each x it walks over all earlier numbers again, looking for one specific value it could have remembered.' },
    pattern: {
      pick: 'hashing',
      why: 'We repeatedly ask "has value v appeared, and where?" A map from value to index makes each question O(1), so one pass is O(n).',
      not: [
        { id: 'two-pointers', why: 'Two pointers needs the array sorted, and sorting loses the original indices we must return (you would have to sort index pairs: O(n log n)).' },
        { id: 'sorting-and-selection', why: 'Sorting helps find a pair, but costs O(n log n) and still needs the indices carried along.' },
      ],
    },
    watch: { viz: 'TwoSumMapViz', inputs: [{ label: '[2, 7, 11, 15], target 9', input: { nums: [2, 7, 11, 15], target: 9 } }, { label: '[3, 2, 4], target 6', input: { nums: [3, 2, 4], target: 6 } }] },
    edges: ['Two equal values: [3, 3], target 6 → [0, 1].', 'Negative numbers and a negative target.', 'The answer uses the last element (the map must already hold its partner).'],
  },

  'valid-parentheses': {
    free: true,
    read: [
      { phrase: 'closed by a bracket of the same type', says: 'When a closer arrives, we must know which opener it is closing: remember the openers.' },
      { phrase: 'the most recently opened one first', says: 'Last opened, first closed: last in, first out. That is exactly a stack.' },
      { phrase: 'every closing bracket has a matching opening bracket', says: 'A closer with nothing open (an empty stack) is an immediate failure.' },
    ],
    budget: { from: 's.length ≤ 10⁴', n: 1e4, aim: 'O(n)', note: 'One pass over the string is the target.' },
    observe: [
      {
        title: 'The innermost pair closes first',
        text: 'In "{[()]}", the pairs are nested: ( ) is inside [ ], which is inside { }. A closer always matches the most recent opener that is still open.',
        sketch: { kind: 'array', rows: [{ items: ['{', '[', '(', ')', ']', '}'], bands: [{ from: 0, to: 5, tone: 'ghost' }, { from: 1, to: 4, tone: 'accent' }, { from: 2, to: 3, tone: 'success' }] }], caption: 'pairs nest like boxes inside boxes' },
      },
      {
        title: 'Only the last unmatched opener matters',
        text: 'In "([)]", when ) arrives the last open bracket is [, so ) is wrong, even though a ( is open further back.',
        sketch: { kind: 'array', rows: [{ items: ['(', '[', ')', ']'], marks: { 1: 'target', 2: 'bad' }, tags: { 2: [['≠ [', 'danger']] } }], caption: 'compare only with the most recent opener' },
      },
      {
        title: 'Leftovers mean failure',
        text: 'If openers remain when the string ends, something was never closed: "(()" leaves one ( behind.',
        sketch: { kind: 'array', rows: [{ items: ['(', '(', ')'], marks: { 0: 'bad', 1: 'hit', 2: 'hit' } }], caption: 'one opener is still waiting at the end' },
      },
    ],
    brute: { idea: 'Repeatedly delete every "()", "[]" and "{}" from the string until nothing changes; valid if it becomes empty.', cost: 'O(n²)', waste: 'Each pass rescans and rebuilds the whole string to remove one layer of pairs.' },
    pattern: {
      pick: 'stack-patterns',
      why: 'Openers wait until they are closed, and the most recent one is closed first. Push openers, and let each closer check the top.',
      not: [
        { id: 'monotonic-stack', why: 'A monotonic stack orders values by size; here we only match types, there is no ordering to keep.' },
        { id: 'two-pointers', why: 'Matching from both ends works for "([])" but not for "()[]", where pairs sit side by side.' },
      ],
    },
    watch: { viz: 'BracketsViz', inputs: [{ label: '"{[()]()}" (valid)', input: { s: '{[()]()}' } }, { label: '"([)]" (crossed)', input: { s: '([)]' } }] },
    edges: ['A single character, like "(" or "]".', 'Starts with a closer: ")(".', 'Odd length can never be valid (a quick early exit).'],
  },

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

  'daily-temperatures': {
    read: [
      { phrase: 'the number of days you have to wait after day `i`', says: 'For each day, the distance to something on its right: a "next ..." question. Distances mean we keep indexes, not values.' },
      { phrase: 'strictly warmer', says: 'The next strictly greater element. An equal temperature does not count.' },
      { phrase: 'If no warmer day ever comes, `answer[i]` is `0`', says: 'Days still waiting at the end get the default.' },
    ],
    budget: { from: 'temperatures.length ≤ 10⁵', n: 1e5, aim: 'O(n)', note: 'Scanning right from every day is O(n²) = 10¹⁰ for a falling sequence: far too slow.' },
    observe: [
      {
        title: 'Waiting days form a falling run',
        text: 'After 75, the days 71 and 69 are also waiting for something warmer. Every day still waiting is colder than the waiting day before it.',
        sketch: { kind: 'array', rows: [{ items: [73, 74, 75, 71, 69, 72, 76, 73], marks: { 2: 'kept', 3: 'kept', 4: 'kept', 5: 'dim', 6: 'dim', 7: 'dim' } }], caption: '75, 71, 69 are waiting, each colder than the last' },
      },
      {
        title: 'One warm day answers several waiting days at once',
        text: '72 is warmer than 69 and 71, so it answers both, but not 75. Because the waiting days fall, it answers them from the most recent backwards, and stops at the first one it can\'t beat.',
        sketch: { kind: 'array', rows: [{ items: [73, 74, 75, 71, 69, 72, 76, 73], marks: { 3: 'hit', 4: 'hit', 5: 'cur', 2: 'target' } }, { label: 'answers written', items: ['·', '·', '·', 2, 1, '·', '·', '·'], marks: { 3: 'hit', 4: 'hit' } }] },
      },
      {
        title: 'Keep the waiting days on a stack',
        text: 'Most recent waiting day on top: a new day pops every colder day (writing i − j for each), then waits itself. Each day is pushed once and popped once.',
        sketch: { kind: 'array', rows: [{ label: 'stack of indexes (bottom → top)', items: [2, 3, 4], marks: { 2: 'target' } }], caption: 'temperatures 75, 71, 69: decreasing towards the top' },
      },
    ],
    brute: { idea: 'For each day, scan to the right until a warmer day appears.', cost: 'O(n²)', waste: 'A long cold stretch is rescanned again for every day before it.' },
    pattern: {
      pick: 'monotonic-stack',
      why: '"Next greater element" with distances: a stack of indexes whose temperatures decrease. Each new day pops the days it answers.',
      not: [
        { id: 'stack-patterns', why: 'A plain stack is the container, but the key is keeping it ordered by value and popping by comparison.' },
        { id: 'heap-patterns', why: 'A heap of waiting days would also work, at O(n log n), and loses the "only the top can be answered" insight.' },
        { id: 'sliding-window', why: 'There is no fixed or valid window here; each day waits an unknown distance.' },
      ],
    },
    watch: { viz: 'StackSideViz', inputs: [{ label: '[73, 74, 75, 71, 69, 72, 76, 73]', input: { a: [73, 74, 75, 71, 69, 72, 76, 73], want: 'ng', store: 'index', dist: true } }] },
    edges: ['Strictly falling temperatures: every answer is 0.', 'Equal temperatures are not warmer: [70, 70] → [0, 0].', 'A single day → [0].'],
  },

  'sliding-window-maximum': {
    read: [
      { phrase: 'A window of size `k` slides', says: 'A fixed-size sliding window: one element enters on the right and one leaves on the left at every step.' },
      { phrase: 'the maximum value inside the window', says: 'We need the max of a set that changes at both ends. Adding is easy; removing the max is the hard part.' },
      { phrase: 'Aim for O(n) time', says: 'A heap (O(n log n)) is not enough: each element should be handled in O(1) amortised.' },
    ],
    budget: { from: 'nums.length ≤ 10⁵, k ≤ n', n: 1e5, aim: 'O(n)', note: 'Recomputing each window is O(nk), up to 10¹⁰ when k is about n/2.' },
    observe: [
      {
        title: 'An older, smaller value can never win again',
        text: 'Once 3 arrives, the 1 before it will leave the window first and is smaller: it can never be a maximum again. Throw it away.',
        sketch: { kind: 'array', rows: [{ items: [1, 3, -1, -3, 5, 3, 6, 7], marks: { 0: 'bad', 1: 'cur' }, tags: { 0: [['useless', 'danger']] } }] },
      },
      {
        title: 'What survives is a falling list; its front is the max',
        text: 'After discarding useless values, the candidates decrease from front to back. The front is the window\'s maximum.',
        sketch: { kind: 'array', rows: [{ items: [1, 3, -1, -3, 5, 3, 6, 7], bands: [{ from: 1, to: 3, tone: 'accent', label: 'window' }], marks: { 1: 'hit', 2: 'kept', 3: 'kept' } }, { label: 'candidates (front → back)', items: [3, -1, -3], marks: { 0: 'hit' } }] },
      },
      {
        title: 'Store indexes, so the front can expire',
        text: 'The front may be old enough to have left the window. With indexes, "has it left?" is just front ≤ i − k.',
        sketch: { kind: 'array', rows: [{ label: 'deque of indexes', items: [1, 2, 3] }], caption: 'index 1 leaves once i reaches 4 (with k = 3)' },
      },
    ],
    brute: { idea: 'For each of the n − k + 1 windows, scan its k values for the maximum.', cost: 'O(n · k)', waste: 'Neighbouring windows share k − 1 values, and their maximum is recomputed from scratch.' },
    pattern: {
      pick: 'monotonic-stack',
      why: 'A monotonic deque: drop dominated values from the back, expired ones from the front, and read the max at the front. Every index enters and leaves once: O(n).',
      not: [
        { id: 'heap-patterns', why: 'A max-heap of (value, index) with lazy removal of expired tops works, but is O(n log n).' },
        { id: 'sliding-window', why: 'The window itself is trivial (fixed size); the difficulty is its maximum, which the window template doesn\'t give you.' },
        { id: 'range-queries', why: 'A sparse table answers range max in O(1) after O(n log n) preprocessing: correct, but heavier than needed.' },
      ],
    },
    watch: { viz: 'DequeSideViz', inputs: [{ label: '[1, 3, −1, −3, 5, 3, 6, 7], k = 3', input: { a: [1, 3, -1, -3, 5, 3, 6, 7], k: 3, mode: 'max' } }] },
    edges: ['k = 1: the answer is the array itself.', 'k = n: one window, the overall maximum.', 'Equal values: pop with <= (or keep both; just be consistent).'],
  },

  'koko-eating-bananas': {
    read: [
      { phrase: 'Return the smallest integer `k`', says: 'The answer is a number we choose, and we want the smallest one that works.' },
      { phrase: 'within `h` hours', says: 'For any given k we can just check whether it works: a yes/no test.' },
      { phrase: 'she finishes it and does not start another pile that hour', says: 'Each pile takes ceil(pile / k) hours on its own. The total is a simple sum.' },
    ],
    budget: { from: 'piles ≤ 10⁴, values ≤ 10⁹', rows: [['try every k', '10⁹ × 10⁴', 'bad'], ['binary search on k', '30 × 10⁴', 'ok']], aim: 'O(n log max)', note: 'The answer lies between 1 and max(piles), up to 10⁹: we cannot try them all.' },
    observe: [
      {
        title: 'Checking one speed is easy',
        text: 'For k = 4, the piles [3, 6, 7, 11] take 1, 2, 2 and 3 hours: 8 in total, which fits h = 8.',
        sketch: { kind: 'array', rows: [{ label: 'piles', items: [3, 6, 7, 11] }, { label: 'hours at k = 4', items: [1, 2, 2, 3], marks: { 0: 'hit', 1: 'hit', 2: 'hit', 3: 'hit' } }], caption: '1 + 2 + 2 + 3 = 8 ≤ 8' },
      },
      {
        title: 'Faster never hurts',
        text: 'If speed k works, every faster speed works too. So the answers to "does k work?" look like no, no, no, yes, yes, yes: they switch once.',
        sketch: { kind: 'array', rows: [{ label: 'k', items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], marks: { 0: 'bad', 1: 'bad', 2: 'bad', 3: 'hit', 4: 'hit', 5: 'hit', 6: 'hit', 7: 'hit', 8: 'hit', 9: 'hit', 10: 'hit' }, tags: { 3: [['first yes', 'success']] } }] },
      },
      {
        title: 'Search the answer, not the array',
        text: 'A yes/no that switches once can be binary searched: about 30 checks over 1 … 10⁹, each O(n).',
        sketch: { kind: 'array', rows: [{ label: 'range of k', items: ['1', '…', 'mid', '…', 'max'], marks: { 2: 'cur' } }], caption: 'mid works → look left; it doesn\'t → look right' },
      },
    ],
    brute: { idea: 'Try k = 1, 2, 3, … and return the first speed that finishes in time.', cost: 'O(max(piles) · n)', waste: 'It tests speeds one by one, ignoring that the answers are sorted (no … no, yes … yes).' },
    pattern: {
      pick: 'binary-search-on-answer',
      why: 'Minimise a number whose feasibility test is easy and monotone (faster always still works): binary search over the answer range.',
      not: [
        { id: 'binary-search', why: 'There is no sorted array to search; we search a range of candidate answers instead.' },
        { id: 'greedy', why: 'No local choice builds the answer; we need the smallest speed that passes a global test.' },
      ],
    },
    watch: { viz: 'AnswerSearchViz', inputs: [{ label: 'piles [3, 6, 7, 11], h = 8', input: { mode: 'koko', piles: [3, 6, 7, 11], h: 8 } }] },
    edges: ['h equals the number of piles: the answer is the largest pile.', 'Huge piles: sum the hours in a 64-bit number.', 'A single pile.'],
  },

  'rotting-oranges': {
    read: [
      { phrase: 'Every minute', says: 'Time moves in rounds, and the rot spreads one step per round: levels of a breadth-first search.' },
      { phrase: 'next to a rotten one (up, down, left or right)', says: 'A grid where each cell has 4 neighbours: a graph.' },
      { phrase: 'the number of minutes until no fresh orange remains', says: 'The number of BFS levels needed to reach the last fresh orange.' },
      { phrase: '`-1` if some orange can never rot', says: 'Some fresh orange may be unreachable: count what is left at the end.' },
    ],
    budget: { from: 'grid up to 10 × 10', n: 100, aim: 'O(rows × cols)', note: 'Tiny limits: even minute-by-minute rescans would pass, but BFS is the clean, expected answer.' },
    observe: [
      {
        title: 'All rotten oranges spread at the same time',
        text: 'Every rotten orange infects its neighbours in the same minute. So the search starts from all of them at once: put every rotten orange in the queue at minute 0.',
        sketch: { kind: 'grid', grid: [[2, 1, 1], [1, 1, 0], [0, 1, 1]], marks: { '0,0': 'rotten', '0,1': 'fresh', '0,2': 'fresh', '1,0': 'fresh', '1,1': 'fresh', '2,1': 'fresh', '2,2': 'fresh' }, labels: { '0,0': '0' }, caption: 'minute 0: the starting rot' },
      },
      {
        title: 'Minute t is BFS level t',
        text: 'Cells rot in rings of distance from the starting rot. The answer is the distance of the last ring.',
        sketch: { kind: 'grid', grid: [[2, 1, 1], [1, 1, 0], [0, 1, 1]], marks: { '0,0': 'rotten', '0,1': 'ring', '1,0': 'ring', '0,2': 'ring', '1,1': 'ring', '2,1': 'ring', '2,2': 'ring' }, labels: { '0,0': '0', '0,1': '1', '1,0': '1', '0,2': '2', '1,1': '2', '2,1': '3', '2,2': '4' }, caption: 'the last orange rots at minute 4' },
      },
      {
        title: 'Unreachable fresh oranges mean −1',
        text: 'Count the fresh oranges first and decrease the count as they rot. If any remain when the queue empties, they were cut off.',
        sketch: { kind: 'grid', grid: [[2, 1, 1], [0, 1, 1], [1, 0, 1]], marks: { '0,0': 'rotten', '2,0': 'fresh' }, labels: { '2,0': '?' }, caption: 'the bottom-left orange has no rotten path to it' },
      },
    ],
    brute: { idea: 'Simulate: each minute, scan the whole grid and rot every fresh orange next to a rotten one; stop when nothing changes.', cost: 'O((rows · cols)²)', waste: 'Each minute rescans every cell, though only the newest rotten oranges can spread.' },
    pattern: {
      pick: 'graph-traversal',
      why: 'Spreading by one step per round from several sources is multi-source BFS: the queue holds the newest rot, and each level is one minute.',
      not: [
        { id: 'shortest-paths', why: 'Every step costs the same (one minute), so plain BFS already gives shortest times; Dijkstra is for unequal weights.' },
        { id: 'union-find', why: 'Union-find tells which cells are connected, but not how long the spread takes.' },
        { id: 'dp-grid', why: 'Grid DP moves in fixed directions (say right and down); rot spreads in all four.' },
      ],
    },
    watch: { viz: 'GridBfsViz', inputs: [{ label: 'the example grid', input: { mode: 'oranges', grid: [[2, 1, 1], [1, 1, 0], [0, 1, 1]] } }, { label: 'an orange out of reach', input: { mode: 'oranges', grid: [[2, 1, 1], [0, 1, 1], [1, 0, 1]] } }] },
    edges: ['No fresh oranges at all → 0 (even with no rotten ones).', 'Fresh oranges but nothing rotten → −1.', 'Several rotten oranges far apart: they must all start at minute 0.'],
  },

  'house-robber': {
    read: [
      { phrase: 'You cannot rob two adjacent houses', says: 'Each choice limits the next one: decisions interact, so a simple greedy is suspicious.' },
      { phrase: 'Return the maximum amount of money', says: 'An optimisation over many possible plans: a dynamic programming candidate.' },
      { phrase: 'You can skip as many houses as you like', says: 'At every house the choice is binary: rob it or skip it.' },
    ],
    budget: { from: 'nums.length ≤ 100', n: 100, aim: 'O(n)', note: 'Trying every plan is up to 2¹⁰⁰: impossible. Any polynomial solution passes; the clean one is O(n).' },
    observe: [
      {
        title: 'Greedy fails',
        text: 'Taking every other house, or the biggest house first, can lose. In [2, 1, 1, 2] the best plan robs the two ends (4); alternating gives only 3.',
        sketch: { kind: 'array', rows: [{ items: [2, 1, 1, 2], marks: { 0: 'hit', 3: 'hit' }, tags: { 0: [['rob', 'success']], 3: [['rob', 'success']] } }], caption: 'best = 2 + 2 = 4, skipping two houses in a row' },
      },
      {
        title: 'At house i there are only two options',
        text: 'Skip it: the best is whatever was best up to house i − 1. Rob it: nums[i] plus the best up to house i − 2 (house i − 1 must be skipped).',
        sketch: { kind: 'array', rows: [{ items: [2, 7, 9, 3, 1], marks: { 2: 'cur', 1: 'target', 0: 'kept' }, tags: { 2: [['i', 'accent']], 1: [['skip i', 'warn']], 0: [['rob i', 'success']] } }], caption: 'best(2) = max(best(1), 9 + best(0))' },
      },
      {
        title: 'Only the last two answers matter',
        text: 'best(i) uses only best(i − 1) and best(i − 2), so two variables replace the whole table: O(1) space.',
        sketch: { kind: 'array', rows: [{ label: 'best so far', items: [2, 7, 11, 11, 12], marks: { 3: 'kept', 4: 'hit' } }] },
      },
    ],
    brute: { idea: 'Recursively try both choices at every house (rob it and jump two ahead, or skip it), and take the better total.', cost: 'O(2ⁿ)', waste: '"The best from house i onwards" is solved again and again by different call paths.' },
    pattern: {
      pick: 'dp-linear',
      why: 'Overlapping subproblems ("best up to house i") with a choice that looks only one or two steps back: 1D DP, best(i) = max(best(i − 1), nums[i] + best(i − 2)).',
      not: [
        { id: 'greedy', why: 'No local rule is safe: [2, 1, 1, 2] breaks both "alternate" and "biggest first".' },
        { id: 'backtracking', why: 'Exploring every plan is correct but exponential; memoising it turns it into this DP.' },
      ],
    },
    watch: {
      frames: [
        { title: 'best(0) = 2', text: 'With one house, rob it.', sketch: { kind: 'array', rows: [{ label: 'nums', items: [2, 7, 9, 3, 1], marks: { 0: 'cur' } }, { label: 'best', items: [2, '·', '·', '·', '·'], marks: { 0: 'hit' } }] } },
        { title: 'best(1) = max(2, 7) = 7', text: 'Two houses: rob the richer one.', sketch: { kind: 'array', rows: [{ label: 'nums', items: [2, 7, 9, 3, 1], marks: { 1: 'cur' } }, { label: 'best', items: [2, 7, '·', '·', '·'], marks: { 1: 'hit' } }] } },
        { title: 'best(2) = max(7, 9 + 2) = 11', text: 'Skip house 2 → 7. Rob it → 9 + best(0) = 11. Robbing wins.', sketch: { kind: 'array', rows: [{ label: 'nums', items: [2, 7, 9, 3, 1], marks: { 2: 'cur' } }, { label: 'best', items: [2, 7, 11, '·', '·'], marks: { 0: 'kept', 1: 'target', 2: 'hit' } }] } },
        { title: 'best(3) = max(11, 3 + 7) = 11', text: 'Skip house 3 → 11. Rob it → 3 + best(1) = 10. Skipping wins.', sketch: { kind: 'array', rows: [{ label: 'nums', items: [2, 7, 9, 3, 1], marks: { 3: 'cur' } }, { label: 'best', items: [2, 7, 11, 11, '·'], marks: { 1: 'kept', 2: 'target', 3: 'hit' } }] } },
        { title: 'best(4) = max(11, 1 + 11) = 12', text: 'Rob house 4 → 1 + best(2) = 12. The answer is 12 (houses 0, 2 and 4).', sketch: { kind: 'array', rows: [{ label: 'nums', items: [2, 7, 9, 3, 1], marks: { 0: 'hit', 2: 'hit', 4: 'hit' } }, { label: 'best', items: [2, 7, 11, 11, 12], marks: { 4: 'hit' } }] } },
      ],
    },
    edges: ['One house → its money.', 'Two houses → the richer one.', 'Zeros everywhere → 0.'],
  },
};

/** The order problems appear in on /think. */
export const THINK_ORDER = [
  'two-sum', 'valid-parentheses', 'longest-substring-without-repeating-characters', 'daily-temperatures',
  'koko-eating-bananas', 'rotting-oranges', 'house-robber', 'sliding-window-maximum',
];
