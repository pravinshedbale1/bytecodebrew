/** Practice thinking walkthroughs: monotonic-stack (format: src/data/think/index.js). */

export default {
  'daily-temperatures': {
    aha: 'Days still waiting for a warmer day form a falling staircase. Keep them on a stack: each new day pops every colder waiting day (it is their answer, i − j days later), then waits itself. Every day is pushed and popped at most once.',
    asks: {
      observe: 'In [73, 74, 75, 71, 69, 72, 76, 73], which days are still waiting when 72 arrives? Which of them does 72 answer?',
      pattern: 'Waiting days are always colder than the waiting day before them. Which one can a new warm day answer first?',
      read: 'Which phrase makes this a "next greater" question, and does an equal temperature count?',
      budget: 'Scanning right from every day: how bad can that get for 10⁵ days?',
      brute: 'What is the most direct answer for each day, and what does it rescan?',
      watch: 'For [73, 74, 75, 71, 69, 72, 76, 73], which days will 76 answer when it arrives?',
    },
    read: [
      {
        phrase: 'the number of days you have to wait after day `i`',
        says: 'For each day, the distance to something on its right: a "next ..." question. Distances mean we keep indexes, not values.',
      },
      { phrase: 'strictly warmer', says: 'The next strictly greater element. An equal temperature does not count.' },
      { phrase: 'If no warmer day ever comes, `answer[i]` is `0`', says: 'Days still waiting at the end get the default.' },
    ],
    budget: {
      from: 'temperatures.length ≤ 10⁵',
      n: 100000,
      aim: 'O(n)',
      note: 'Scanning right from every day is O(n²) = 10¹⁰ for a falling sequence: far too slow.',
    },
    observe: [
      {
        title: 'Waiting days form a falling run',
        text: 'After 75, the days 71 and 69 are also waiting for something warmer. Every day still waiting is colder than the waiting day before it.',
        sketch: {
          kind: 'array',
          rows: [{ items: [73, 74, 75, 71, 69, 72, 76, 73], marks: { '2': 'kept', '3': 'kept', '4': 'kept', '5': 'dim', '6': 'dim', '7': 'dim' } }],
          caption: '75, 71, 69 are waiting, each colder than the last',
        },
      },
      {
        title: 'One warm day answers several waiting days at once',
        text: '72 is warmer than 69 and 71, so it answers both, but not 75. Because the waiting days fall, it answers them from the most recent backwards, and stops at the first one it can\'t beat.',
        sketch: {
          kind: 'array',
          rows: [
            { items: [73, 74, 75, 71, 69, 72, 76, 73], marks: { '2': 'target', '3': 'hit', '4': 'hit', '5': 'cur' } },
            { label: 'answers written', items: ['·', '·', '·', 2, 1, '·', '·', '·'], marks: { '3': 'hit', '4': 'hit' } },
          ],
        },
      },
      {
        title: 'Keep the waiting days on a stack',
        text: 'Most recent waiting day on top: a new day pops every colder day (writing i − j for each), then waits itself. Each day is pushed once and popped once.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'stack of indexes (bottom → top)', items: [2, 3, 4], marks: { '2': 'target' } }],
          caption: 'temperatures 75, 71, 69: decreasing towards the top',
        },
      },
    ],
    brute: {
      idea: 'For each day, scan to the right until a warmer day appears.',
      cost: 'O(n²)',
      waste: 'A long cold stretch is rescanned again for every day before it.',
    },
    pattern: {
      pick: 'monotonic-stack',
      why: '"Next greater element" with distances: a stack of indexes whose temperatures decrease. Each new day pops the days it answers.',
      not: [
        { id: 'stack-patterns', why: 'A plain stack is the container, but the key is keeping it ordered by value and popping by comparison.' },
        { id: 'heap-patterns', why: 'A heap of waiting days would also work, at O(n log n), and loses the "only the top can be answered" insight.' },
        { id: 'sliding-window', why: 'There is no fixed or valid window here; each day waits an unknown distance.' },
      ],
    },
    watch: {
      viz: 'StackSideViz',
      inputs: [{ label: '[73, 74, 75, 71, 69, 72, 76, 73]', input: { a: [73, 74, 75, 71, 69, 72, 76, 73], want: 'ng', store: 'index', dist: true } }],
    },
    edges: ['Always falling: [5, 4, 3] → [0, 0, 0].', 'Equal is not warmer: [70, 70] → [0, 0].', 'A single day: [50] → [0].'],
  },

  'sliding-window-maximum': {
    aha: 'A value that is older and not bigger than a newer value can never be a window maximum again. Keep only the candidates in a deque (biggest at the front): drop beaten values from the back, drop expired ones from the front, and read the maximum at the front.',
    asks: {
      observe: 'Once 3 arrives after 1 in [1, 3, −1, …], can the 1 ever be the maximum of a window again?',
      pattern: 'You need the maximum while values enter on the right and leave on the left. Which values are worth keeping?',
      read: 'Which phrase rules out a heap, and why is removing the maximum the hard part?',
      budget: 'n up to 10⁵ and k up to n. What does scanning every window cost?',
      brute: 'What is the most direct answer per window, and what do neighbouring windows share?',
      watch: 'For [1, 3, −1, −3, 5, 3, 6, 7] with k = 3, when does the front of the deque leave because it slid out of the window?',
    },
    read: [
      {
        phrase: 'A window of size `k` slides',
        says: 'A fixed-size sliding window: one element enters on the right and one leaves on the left at every step.',
      },
      {
        phrase: 'the maximum value inside the window',
        says: 'We need the max of a set that changes at both ends. Adding is easy; removing the max is the hard part.',
      },
      {
        phrase: 'Aim for O(n) time',
        says: 'A heap (O(n log n)) is not enough: each value should enter and leave the structure only once, for O(n) in total.',
      },
    ],
    budget: { from: 'nums.length ≤ 10⁵, k ≤ n', n: 100000, aim: 'O(n)', note: 'Recomputing each window is O(nk), up to 10¹⁰ when k is about n/2.' },
    observe: [
      {
        title: 'An older, smaller value can never win again',
        text: 'Once 3 arrives, the 1 before it will leave the window first and is smaller: it can never be a maximum again. Throw it away.',
        sketch: { kind: 'array', rows: [{ items: [1, 3, -1, -3, 5, 3, 6, 7], marks: { '0': 'bad', '1': 'cur' }, tags: { '0': [['useless', 'danger']] } }] },
      },
      {
        title: 'What survives is a falling list; its front is the max',
        text: 'After discarding useless values, the candidates decrease from front to back. The front is the window\'s maximum.',
        sketch: {
          kind: 'array',
          rows: [
            {
              items: [1, 3, -1, -3, 5, 3, 6, 7],
              bands: [{ from: 1, to: 3, tone: 'accent', label: 'window' }],
              marks: { '1': 'hit', '2': 'kept', '3': 'kept' },
            },
            { label: 'candidates (front → back)', items: [3, -1, -3], marks: { '0': 'hit' } },
          ],
        },
      },
      {
        title: 'Store indexes, so the front can expire',
        text: 'The front may be old enough to have left the window. With indexes, "has it left?" is just front ≤ i − k.',
        sketch: { kind: 'array', rows: [{ label: 'deque of indexes', items: [1, 2, 3] }], caption: 'index 1 leaves once i reaches 4 (with k = 3)' },
      },
    ],
    brute: {
      idea: 'For each of the n − k + 1 windows, scan its k values for the maximum.',
      cost: 'O(n · k)',
      waste: 'Neighbouring windows share k − 1 values, and their maximum is recomputed from scratch.',
    },
    pattern: {
      pick: 'monotonic-stack',
      why: 'A monotonic deque: drop dominated values from the back, expired ones from the front, and read the max at the front. Every index enters and leaves once: O(n).',
      not: [
        { id: 'heap-patterns', why: 'A max-heap of (value, index) with lazy removal of expired tops works, but is O(n log n).' },
        {
          id: 'sliding-window',
          why: 'The window itself is trivial (fixed size); the difficulty is its maximum, which the window template doesn\'t give you.',
        },
        { id: 'range-queries', why: 'A sparse table answers range max in O(1) after O(n log n) preprocessing: correct, but heavier than needed.' },
      ],
    },
    watch: { viz: 'DequeSideViz', inputs: [{ label: '[1, 3, −1, −3, 5, 3, 6, 7], k = 3', input: { a: [1, 3, -1, -3, 5, 3, 6, 7], k: 3, mode: 'max' } }] },
    edges: ['k = 1: [4, 2] → [4, 2].', 'k = n: [1, 3, 2], k 3 → [3].', 'A falling array: [5, 4, 3], k 2 → [5, 4].'],
  },

  'next-greater-element-i': {
    free: true,
    aha: 'Walk nums2 once with a stack of values still waiting for something bigger; they fall towards the top. A new value answers every smaller waiting value (pop each one, its answer is the new value), then waits itself. Store the answers in a map and read them off for nums1.',
    asks: {
      read: 'Which words let you store answers by value instead of by position?',
      budget: 'Brute force fits at this size. What does the follow-up ask for?',
      observe: 'Walk [1, 3, 4, 2]. When 3 arrives, who has been waiting for it?',
      brute: 'For each x, you scan right from x. Which values get scanned over and over?',
      pattern: 'Waiting values always fall from left to right. Which ones can a new value answer?',
      watch: 'Watch each value answer the smaller ones waiting, then wait itself.',
    },
    read: [
      {
        phrase: 'return the first value to its right that is greater than `x`',
        says: '"Next greater element": for each value, the nearest bigger value to its right.',
      },
      { phrase: '`nums2` has distinct values', says: 'Each value appears once, so answers can be stored in a map by value.' },
      { phrase: 'every value of `nums1` also appears in `nums2`', says: 'nums1 only asks questions; all the work happens on nums2.' },
    ],
    budget: {
      from: 'nums2.length ≤ 1000',
      rows: [['scan right for each x', '10³ × 10³ = 10⁶', 'ok', 'fits'], ['one stack pass + a map', 'O(n + m)', 'ok', 'the follow-up']],
      aim: 'O(n + m)',
      note: 'Brute force fits at this size; the follow-up asks for O(n + m), which is the real lesson.',
    },
    observe: [
      {
        title: 'Values wait for something bigger',
        text: 'Walking nums2 = [1, 3, 4, 2]: 1 waits until something bigger appears. 3 arrives and answers it. Then 3 waits, and 4 answers it.',
        sketch: { kind: 'array', rows: [{ items: [1, 3, 4, 2], marks: { '0': 'target', '1': 'cur' }, tags: { '0': [['next greater: 3', 'success']] } }] },
      },
      {
        title: 'One value can answer several waiting values',
        text: 'Waiting values always fall (a bigger one would already have answered the smaller ones before it). In [5, 3, 1, 4], 3 and 1 wait under 5; 4 answers 1, then 3, and stops at 5. Most recent first: a stack.',
        sketch: {
          kind: 'array',
          rows: [{ items: [5, 3, 1, 4], marks: { '0': 'target', '1': 'hit', '2': 'hit', '3': 'cur' } }],
          caption: '4 answers 1 and 3; 5 keeps waiting',
        },
      },
      {
        title: 'Store the answers in a map',
        text: 'The values are distinct, so a map from value to next greater answers each x in nums1 in O(1). Values never answered get −1: nums1 = [4, 1, 2] → [−1, 3, −1].',
        sketch: { kind: 'array', rows: [{ items: ['1 → 3', '3 → 4', '4 → −1', '2 → −1'], marks: { '0': 'hit', '1': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'For each x in nums1, find it in nums2, then walk right until a bigger value appears.',
      cost: 'O(m · n)',
      waste: 'A falling stretch of nums2 is rescanned again for every x before it.',
    },
    pattern: {
      pick: 'monotonic-stack',
      why: 'Next greater element: one pass over nums2 with a stack of values still waiting, falling towards the top; each new value pops and answers every smaller one. Store answers in a hash map and read them for nums1. O(n + m).',
      not: [
        { id: 'hashing', why: 'The map only stores the answers; finding them is the stack\'s job.' },
        { id: 'two-pointers', why: 'Nothing moves towards anything; each value looks only to its right.' },
      ],
    },
    watch: {
      viz: 'StackSideViz',
      inputs: [
        { label: 'nums2 = [1, 3, 4, 2]', input: { a: [1, 3, 4, 2], want: 'ng', store: 'value' } },
        { label: '[5, 3, 1, 4]', input: { a: [5, 3, 1, 4], want: 'ng', store: 'value' } },
      ],
    },
    edges: ['x is the last value: [2], [1, 2] → [−1].', 'Rising nums2: [1, 2], [1, 2, 3] → [2, 3].', 'Falling nums2: [3, 1], [3, 2, 1] → [−1, −1].'],
  },

  'next-greater-element-ii': {
    aha: 'In a circle, an element near the end may find its answer near the start. Walk the array twice with the usual next-greater stack: the second lap only answers elements still waiting, and never adds new ones. Whatever still waits after two laps has no greater value: −1.',
    asks: {
      read: 'Which words change the usual "look to the right"?',
      budget: 'n² = 10⁸. Is that safe, and what would be better?',
      observe: 'In [1, 2, 1], what is the next greater value of the last 1?',
      brute: 'From each element you walk forward up to n − 1 steps. What is rescanned?',
      pattern: 'How can a left-to-right scan reach past the end and back to the start?',
      watch: 'Watch two laps: the second only answers, never waits.',
    },
    read: [
      {
        phrase: '`nums` is circular: after the last element comes the first one again',
        says: 'Looking right may wrap around the end: every element can see all the others.',
      },
      { phrase: 'Values can repeat', says: 'Equal is not greater: a value never answers an equal one.' },
      { phrase: 'or `-1` if no greater value exists', says: 'The maximum (and its equals) never get an answer.' },
    ],
    budget: { from: 'nums.length ≤ 10⁴', n: 10000, aim: 'O(n)', note: 'n² = 10⁸ is borderline; one stack pass over two laps is O(n).' },
    observe: [
      {
        title: 'The answer may wrap around',
        text: 'In [1, 2, 1], the last 1 has nothing to its right, but walking on past the end reaches 2 at the start: its answer is 2.',
        sketch: { kind: 'array', rows: [{ items: [1, 2, 1], marks: { '1': 'hit' }, tags: { '2': [['→ wraps to 2', 'accent']] } }] },
      },
      {
        title: 'Two laps show everything after each element',
        text: 'Read [1, 2, 1, 1, 2, 1]: for every element of the first lap, the next n − 1 positions around the circle appear right after it.',
        sketch: { kind: 'array', rows: [{ items: [1, 2, 1, 1, 2, 1], bands: [{ from: 3, to: 5, tone: 'ghost', label: 'second lap' }] }] },
      },
      {
        title: 'The second lap only answers',
        text: 'Run the next-greater stack over both laps, but push only during the first; the second lap answers the elements still waiting. The maximum, 2, is never answered: −1.',
        sketch: { kind: 'array', rows: [{ label: 'answers', items: [2, -1, 2], marks: { '1': 'bad' } }] },
      },
    ],
    brute: {
      idea: 'From each index, walk forward up to n − 1 steps (wrapping with % n) and stop at the first greater value.',
      cost: 'O(n²)',
      waste: 'A long falling stretch is rescanned from every element before it.',
    },
    pattern: {
      pick: 'monotonic-stack',
      why: 'Next greater element over two laps: for i from 0 to 2n − 1, x = nums[i % n]; pop and answer every waiting index with a smaller value; push i only during the first lap. O(n).',
      not: [
        { id: 'two-pointers', why: 'Wrapping around isn\'t a second pointer; it is the same scan continued.' },
        { id: 'sliding-window', why: 'Each element looks a different distance ahead; there is no window to slide.' },
      ],
    },
    watch: {
      viz: 'TokenStackViz',
      inputs: [
        { label: '[1, 2, 1]', input: { mode: 'nge2', nums: [1, 2, 1] } },
        { label: '[1, 2, 3, 4, 3]', input: { mode: 'nge2', nums: [1, 2, 3, 4, 3] } },
      ],
    },
    edges: ['All equal: [5, 5, 5] → [−1, −1, −1]; equal is not greater.', 'One element: [7] → [−1].', 'Wrapping needed: [3, 1, 2] → [−1, 2, 3].'],
  },

  'online-stock-span': {
    aha: 'Once a day is beaten by a later day at least as high, no future day can stop at it: the later day blocks first. So fold its span into the later day and forget it. The stack keeps (price, span) for unbeaten days, prices falling towards the top; each new price pops every day ≤ it and adds their spans.',
    asks: {
      read: 'Which words define the span, and which way does it count?',
      budget: 'Up to 10⁵ calls. What does counting back every time cost on rising prices?',
      observe: 'Prices 100, 80, 60, 70, 60, 75: which earlier days does 75 count, and where does it stop?',
      brute: 'Walking back over every earlier day works. Which days are walked over again and again?',
      pattern: 'After 70 beats the 60 before it, can that 60 ever stop a later count?',
      watch: 'Watch each day absorb the beaten days and their spans.',
    },
    read: [
      { phrase: 'records today\'s price and returns today\'s span', says: 'Answers come one day at a time, as the prices arrive: no looking ahead.' },
      {
        phrase: 'consecutive days, ending with today and counting backwards',
        says: 'Count back from today until the first day with a higher price.',
      },
      { phrase: 'less than or equal to today\'s price', says: 'Equal prices are included in the span.' },
    ],
    budget: {
      from: 'at most 10⁵ calls',
      rows: [['count back on each call', '10⁵ × 10⁵', 'bad', 'too slow'], ['stack of (price, span)', 'O(1) per call on average', 'ok', 'fits']],
      aim: 'O(1) per call on average',
      note: 'With rising prices, every call would walk back over every earlier day.',
    },
    observe: [
      {
        title: 'A span counts back to the first higher price',
        text: 'On the day of 75: 60, 70 and 60 before it are ≤ 75; 80 is higher and stops the count. Span 4, today included.',
        sketch: { kind: 'array', rows: [{ items: [100, 80, 60, 70, 60, 75], marks: { '1': 'target', '2': 'hit', '3': 'hit', '4': 'hit', '5': 'cur' } }] },
      },
      {
        title: 'A beaten day never stops anyone again',
        text: '70 beat the 60 before it. Any later price ≥ 70 also passes that 60, and a price < 70 stops at 70 first. So 60 can be folded into 70\'s span (2) and forgotten.',
        sketch: { kind: 'array', rows: [{ items: [60, 70], marks: { '0': 'dim', '1': 'kept' }, tags: { '1': [['span 2', 'accent']] } }] },
      },
      {
        title: 'Keep (price, span) for unbeaten days',
        text: '75 absorbs 60 (span 1) and 70 (span 2): 1 + 1 + 2 = 4. Then 85 absorbs 75 (4) and 80 (1): span 6. The days left on the stack fall in price.',
        sketch: { kind: 'array', rows: [{ label: 'stack after 75, bottom → top', items: ['100 (1)', '80 (1)', '75 (4)'] }] },
      },
    ],
    brute: {
      idea: 'Keep every price; for each new one, walk back while the prices are ≤ today.',
      cost: 'O(n) per call, O(n²) in total',
      waste: 'Days already beaten by a later, higher day are walked over again by every later call.',
    },
    pattern: {
      pick: 'monotonic-stack',
      why: 'A stack of (price, span) with falling prices: today pops every day with price ≤ today and adds its span to today\'s, then pushes (price, span). Each day is pushed and popped once: O(1) per call on average.',
      not: [
        { id: 'heap-patterns', why: 'A heap knows the largest price, not the nearest higher one before today.' },
        { id: 'prefix-sums', why: 'A span isn\'t a sum of anything; it depends on comparisons.' },
      ],
    },
    watch: {
      viz: 'TokenStackViz',
      inputs: [
        { label: '100, 80, 60, 70, 60, 75, 85', input: { mode: 'span', prices: [100, 80, 60, 70, 60, 75, 85] } },
        { label: '10, 20, 30', input: { mode: 'span', prices: [10, 20, 30] } },
      ],
    },
    edges: ['Rising prices: 10, 20, 30 → spans 1, 2, 3.', 'Falling prices: 30, 20, 10 → spans 1, 1, 1.', 'Equal prices count: 5, 5 → spans 1, 2.'],
  },

  'remove-k-digits': {
    aha: 'The leftmost digits matter most. A digit followed by a smaller one is a "peak": removing it brings the smaller digit forward. Keep the kept digits on a stack and, while removals are left, pop a top that is bigger than the new digit. Cut any leftover removals from the end, and strip leading zeros.',
    asks: {
      read: 'Which words decide how the result is written?',
      budget: 'Up to 10⁵ digits. Can you try each removal and rescan?',
      observe: 'Compare 1219 with 1432. Which digit position decides which is smaller?',
      brute: 'Removing the first "peak" k times works. Where does each rescan start, and where is the next peak?',
      pattern: 'Once kept digits never go down, which kept digit should a smaller new digit replace?',
      watch: 'Watch bigger digits leave when a smaller one arrives.',
    },
    read: [
      {
        phrase: 'Remove exactly `k` digits so that the remaining number is as small as possible',
        says: 'Same number of digits left either way, so the number is smallest when its earliest digits are smallest.',
      },
      { phrase: 'The result must not have leading zeros', says: 'Strip them at the end: "0200" is written "200".' },
      { phrase: 'if nothing is left, return `"0"`', says: 'Removing every digit (or leaving only zeros) gives "0".' },
    ],
    budget: { from: 'num.length ≤ 10⁵', n: 100000, aim: 'O(n)', note: 'Removing one digit at a time with a rescan is O(k · n) ≈ 10¹⁰.' },
    observe: [
      {
        title: 'The leftmost digit matters most',
        text: '1219 < 1432 because they first differ at the second digit, and 2 < 4. Making an early digit smaller beats anything that happens later.',
        sketch: { kind: 'array', rows: [{ items: [1, 4, 3, 2, 2, 1, 9], marks: { '1': 'bad' }, tags: { '1': [['too big this early', 'danger']] } }] },
      },
      {
        title: 'Remove a digit bigger than the next one',
        text: 'In 1432219, 4 is followed by the smaller 3: remove 4. Now 3 is followed by 2: remove 3. Later the second 2 is followed by 1: remove it. Left: 1219.',
        sketch: { kind: 'array', rows: [{ items: [1, 4, 3, 2, 2, 1, 9], marks: { '1': 'bad', '2': 'bad', '4': 'bad' } }] },
      },
      {
        title: 'Kept digits never go down: a stack',
        text: 'Keep the kept digits on a stack; a smaller new digit pops bigger tops while removals are left. If removals remain at the end, cut from the end, where the digits are biggest. "10200" with k = 1 keeps "0200", written "200".',
        sketch: { kind: 'array', rows: [{ label: 'kept from 1432219', items: [1, 2, 1, 9], marks: { '0': 'hit', '1': 'hit', '2': 'hit', '3': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Remove one digit at a time, k times: each time delete the first digit that is bigger than the digit after it.',
      cost: 'O(k · n)',
      waste: 'Each removal rescans from the start, though the next peak is always right next to the last removal.',
    },
    pattern: {
      pick: 'monotonic-stack',
      why: 'Greedy with a rising stack: for each digit, pop the top while removals are left and the top is bigger; push the digit. Then remove what is left from the end and strip leading zeros. Each digit is pushed and popped once: O(n).',
      not: [
        { id: 'greedy', why: 'The rule ("remove the first peak") is greedy; the stack is what makes it one pass.' },
        { id: 'sorting-and-selection', why: 'Removing the k largest digits ignores position: from 1432219 it leaves 1221, not 1219.' },
      ],
    },
    watch: {
      viz: 'TokenStackViz',
      inputs: [
        { label: '"1432219", k = 3', input: { mode: 'removek', num: '1432219', k: 3 } },
        { label: '"10200", k = 1', input: { mode: 'removek', num: '10200', k: 1 } },
      ],
    },
    edges: ['Everything removed: "10", 2 → "0".', 'Leading zeros: "10200", 1 → "200".', 'Rising digits: "12345", 2 → "123"; cut from the end.'],
  },

  'sum-of-subarray-minimums': {
    aha: 'Count instead of listing: each value is the minimum of every subarray that stays between the nearest smaller value on its left and on its right. With left choices of start and right choices of end, it contributes value × left × right. A monotonic stack finds those nearest smaller values.',
    asks: {
      read: 'Which words tell you how to count each value\'s subarrays?',
      budget: 'Up to 3 × 10⁴ values. How many subarrays is that?',
      observe: 'In [3, 1, 2, 4], how many subarrays have 1 as their minimum? And 2?',
      brute: 'A running minimum from every start works. What does it cost?',
      pattern: 'How far can a subarray stretch and still have arr[i] as its minimum?',
      watch: 'Watch each value\'s reach, then its share of the sum.',
    },
    read: [
      {
        phrase: 'For every contiguous subarray of `arr`, take its minimum value',
        says: 'About n²/2 subarrays: too many to list, so count each value\'s share instead.',
      },
      {
        phrase: 'reaches no further than the nearest smaller value on its left and on its right',
        says: 'The counting rule, spelled out: find the previous and next smaller values.',
      },
      { phrase: 'modulo `10^9 + 7`', says: 'The sum is huge: take the remainder as you add.' },
    ],
    budget: { from: 'arr.length ≤ 3 × 10⁴', n: 30000, aim: 'O(n)', note: 'n² = 9 × 10⁸ subarrays: far too many to visit one by one.' },
    observe: [
      {
        title: 'Count, don\'t list',
        text: 'Ask the other way round: for each value, how many subarrays is it the minimum of? 1 in [3, 1, 2, 4] is the minimum of every subarray containing it: 2 starts × 3 ends = 6.',
        sketch: { kind: 'array', rows: [{ items: [3, 1, 2, 4], marks: { '1': 'cur' }, bands: [{ from: 0, to: 3, tone: 'accent', label: '2 × 3 = 6' }] }] },
      },
      {
        title: 'Each value reaches to the nearest smaller values',
        text: '2 stays the minimum while the subarray is between 1 (on the left) and the end: 1 start × 2 ends = 2 subarrays. 3 and 4 are each the minimum of only themselves.',
        sketch: {
          kind: 'array',
          rows: [{ items: [3, 1, 2, 4], marks: { '1': 'target', '2': 'cur' }, bands: [{ from: 2, to: 3, tone: 'accent', label: '1 × 2' }] }],
        },
      },
      {
        title: 'Add value × count',
        text: '3 × 1 + 1 × 6 + 2 × 2 + 4 × 1 = 17. For equal values, stop at a strictly smaller value on one side and a smaller-or-equal one on the other, so each subarray is counted once.',
        sketch: { kind: 'array', rows: [{ items: ['3 × 1', '1 × 6', '2 × 2', '4 × 1'] }], caption: 'sum = 17' },
      },
    ],
    brute: {
      idea: 'For each start, extend the end keeping a running minimum, and add it each time.',
      cost: 'O(n²)',
      waste: 'n²/2 subarrays visited one by one, though each value\'s share can be counted in one go.',
    },
    pattern: {
      pick: 'monotonic-stack',
      why: 'arr[i] is the minimum of left × right subarrays, where left and right reach to the previous smaller and next smaller values (strict on one side, ≤ on the other). Both come from a monotonic stack; add arr[i] × left × right. O(n).',
      not: [
        {
          id: 'contribution-technique',
          why: 'The counting idea is the contribution technique; the boundaries come from the stack, so the work here is the stack.',
        },
        { id: 'prefix-sums', why: 'Prefix sums add values, but a minimum can\'t be subtracted out of a range.' },
      ],
    },
    watch: {
      viz: 'MinSpanViz',
      inputs: [
        { label: '[3, 1, 2, 4]', input: { mode: 'min', nums: [3, 1, 2, 4] } },
        { label: '[2, 4, 2, 3] (ties)', input: { mode: 'min', nums: [2, 4, 2, 3] } },
      ],
    },
    edges: ['One value: [5] → 5.', 'Equal values: [2, 2] → 6 (2 + 2 + 2).', 'Rising: [1, 2, 3] → 10.'],
  },

  'continuous-subarrays': {
    aha: 'Every pair is within 2 exactly when max − min ≤ 2, and every window inside a good window is good. So slide: for each end r, move l right while max − min > 2, then all r − l + 1 windows ending at r count. A max queue and a min queue give the window\'s max and min.',
    asks: {
      read: 'Which words can you replace with a check on just two values?',
      budget: 'Up to 10⁵ values. Can you check every subarray?',
      observe: 'In [5, 4, 2, 4], for each end, how many good windows end there?',
      brute: 'Extending from every start works. What does it repeat?',
      pattern: 'You need the max and min of a window as both ends move. Which structures give them in O(1)?',
      watch: 'Watch the window grow, shrink when too wide, and add r − l + 1.',
    },
    read: [
      { phrase: 'every pair of its elements differs by at most `2`', says: 'The farthest-apart pair is the max and the min: check max − min ≤ 2.' },
      {
        phrase: 'Return the total number of continuous subarrays',
        says: 'A count of windows, not the longest: add up the windows ending at each position.',
      },
    ],
    budget: { from: 'nums.length ≤ 10⁵', n: 100000, aim: 'O(n)', note: 'n² = 10¹⁰ windows: far too many to check one by one.' },
    observe: [
      {
        title: 'Every pair close means max − min ≤ 2',
        text: 'The farthest-apart pair is always the max and the min. [5, 4] has 5 − 4 = 1, fine; [5, 4, 2] has 5 − 2 = 3, not.',
        sketch: { kind: 'array', rows: [{ items: [5, 4, 2, 4], bands: [{ from: 0, to: 2, tone: 'danger', label: 'spread 3' }] }] },
      },
      {
        title: 'Count all good windows ending at r at once',
        text: 'Inside a good window every window is good, so the good windows ending at r start anywhere in [l, r]. Ends 0, 1, 2, 3 give 1, 2, 2, 3 windows: 8.',
        sketch: {
          kind: 'array',
          rows: [{ items: [5, 4, 2, 4], tags: { '0': [['1', 'accent']], '1': [['2', 'accent']], '2': [['2', 'accent']], '3': [['3', 'accent']] } }],
          caption: '1 + 2 + 2 + 3 = 8',
        },
      },
      {
        title: 'Max and min of a sliding window',
        text: 'As l and r move, a deque of falling values gives the max at its front and a deque of rising values gives the min, each in O(1) on average.',
        sketch: { kind: 'array', rows: [{ label: 'window [1, 3]', items: [4, 2, 4] }], caption: 'max 4, min 2: spread 2, fine' },
      },
    ],
    brute: {
      idea: 'Fix the start, extend the end tracking the running min and max, and stop when they differ by more than 2.',
      cost: 'O(n²)',
      waste: 'Neighbouring starts re-extend over the same values again and again.',
    },
    pattern: {
      pick: 'monotonic-stack',
      why: 'Sliding-window counting with a max deque and a min deque: for each r, push nums[r] into both, move l while max − min > 2, then add r − l + 1. Every index enters and leaves each deque once: O(n).',
      not: [
        { id: 'sliding-window', why: 'The window is the frame, but it can\'t tell you its max and min as values leave; the deques do.' },
        { id: 'heap-patterns', why: 'Two heaps with lazy removal also give the max and min, in O(n log n).' },
      ],
    },
    watch: {
      viz: 'LimitWindowViz',
      inputs: [
        { label: '[5, 4, 2, 4]', input: { nums: [5, 4, 2, 4], limit: 2, goal: 'count' } },
        { label: '[1, 2, 3]', input: { nums: [1, 2, 3], limit: 2, goal: 'count' } },
      ],
    },
    edges: ['All equal: [7, 7, 7] → 6.', 'One element: [9] → 1.', 'Big jumps: [1, 5, 9] → 3.'],
  },

  'count-subarrays-with-cost-less-than-or-equal-to-k': {
    aha: 'Shrinking a window never raises its cost: the spread can only stay or drop, and so does the length. So the cheap windows ending at r start anywhere in a range [l, r]: slide l right while the cost is over k, then add r − l + 1. A max queue and a min queue give the spread.',
    asks: {
      read: 'Which words define the cost, and what happens to each part when a window shrinks?',
      budget: 'Up to 10⁵ values and k up to 10¹⁵. What does that say about the arithmetic?',
      observe: 'For [1, 3, 2] and k = 4, which windows ending at index 2 are cheap enough?',
      brute: 'Extending from every start works. What does it repeat?',
      pattern: 'Once shrinking is always safe, which sliding-window shape counts the windows?',
      watch: 'Watch the cost checked, the window shrunk, and r − l + 1 added.',
    },
    read: [
      { phrase: 'its spread times its length', says: 'Both factors only shrink when the window shrinks: cheaper windows sit inside cheap ones.' },
      { phrase: 'Return the number of subarrays whose cost is at most `k`', says: 'A count: add the windows ending at each r.' },
    ],
    budget: {
      from: 'nums.length ≤ 10⁵, k ≤ 10¹⁵',
      n: 100000,
      aim: 'O(n)',
      note: 'n² windows is far too many. The cost can reach about 10¹⁴, so use 64-bit arithmetic.',
    },
    observe: [
      {
        title: 'Shrinking lowers the cost',
        text: 'A smaller window has a spread no bigger and a length smaller, so its cost can only go down. [1, 3, 2] costs (3 − 1) × 3 = 6 > 4, but [3, 2] costs 1 × 2 = 2.',
        sketch: { kind: 'array', rows: [{ items: [1, 3, 2], bands: [{ from: 1, to: 2, tone: 'success', label: 'cost 2' }] }] },
      },
      {
        title: 'Count all cheap windows ending at r',
        text: 'r = 0: [1], 1 window. r = 1: [1, 3] costs 2 × 2 = 4 ≤ 4, so 2 windows. r = 2: the whole costs 6, so l moves to 1 and 2 windows count. Total 5.',
        sketch: {
          kind: 'array',
          rows: [{ items: [1, 3, 2], tags: { '0': [['1', 'accent']], '1': [['2', 'accent']], '2': [['2', 'accent']] } }],
          caption: '1 + 2 + 2 = 5',
        },
      },
      {
        title: 'Max and min from two deques',
        text: 'The window\'s max and min come from a max queue and a min queue, so every move of l or r costs O(1) on average.',
        sketch: { kind: 'array', rows: [{ label: 'window [1, 2]', items: [3, 2] }], caption: 'max 3, min 2: cost 1 × 2 = 2' },
      },
    ],
    brute: {
      idea: 'Fix the start and extend the end tracking the min and max; the cost only grows, so stop at the first window over k.',
      cost: 'O(n²)',
      waste: 'Each start re-extends over values the previous start already scanned; one window whose left end only moves right visits each value twice in total.',
    },
    pattern: {
      pick: 'monotonic-stack',
      why: 'Sliding-window counting with a max deque and a min deque: for each r, move l while (max − min) × (r − l + 1) > k, then add r − l + 1. O(n).',
      not: [
        { id: 'sliding-window', why: 'The window is the frame; its max and min as values leave come from the deques.' },
        {
          id: 'range-queries',
          why: 'A sparse table answers any window\'s max and min in O(1) after O(n log n) building; the deques do it as the window moves.',
        },
      ],
    },
    watch: {
      viz: 'LimitWindowViz',
      inputs: [
        { label: '[1, 3, 2], k = 4', input: { nums: [1, 3, 2], limit: 4, goal: 'cost' } },
        { label: '[5, 5, 1], k = 3', input: { nums: [5, 5, 1], limit: 3, goal: 'cost' } },
      ],
    },
    edges: ['k = 0: [2, 2, 3], 0 → 4; only windows of equal values.', 'Every window is cheap: [1, 1], 0 → 3.', 'One element: [9], 0 → 1.'],
  },

  'count-prime-gap-balanced-subarrays': {
    aha: 'Only primes matter, so mark them with a sieve and let only primes enter a max queue and a min queue. Shrinking a window can only lower its prime spread, so for each r slide l while the spread is over k. The windows that also keep two primes start between l and the second-last prime.',
    asks: {
      read: 'Which values matter at all, and what two conditions must a window meet?',
      budget: 'Values up to 5 × 10⁴. How do you test "is it prime" quickly, many times?',
      observe: 'In [1, 2, 3] with k = 1, which windows contain two primes at most 1 apart?',
      brute: 'Extending from every start works. What does it repeat?',
      pattern: 'For a fixed end, which starts keep the spread small, and which still keep two primes?',
      watch: 'Watch primes enter the deques, the window shrink, and the count per end.',
    },
    read: [
      {
        phrase: 'the difference between the largest and the smallest prime number in it is at most `k`',
        says: 'A spread condition, like max − min ≤ k, but only over the primes in the window.',
      },
      { phrase: 'Repeated primes count separately', says: '[2, 2] has two primes: count primes by position, not by value.' },
    ],
    budget: {
      from: 'nums.length ≤ 5 × 10⁴, values ≤ 5 × 10⁴',
      rows: [['every subarray', '(5 × 10⁴)² = 2.5 × 10⁹', 'bad', 'too slow'], ['sieve + one window pass', 'about 5 × 10⁴ + n', 'ok', 'fits']],
      aim: 'O(n + M log log M)',
      note: 'A sieve marks every prime up to 5 × 10⁴ once; after that each check is O(1).',
    },
    observe: [
      {
        title: 'Only the primes matter',
        text: 'In [1, 2, 3], 1 is not prime, so it never changes the prime spread; only 2 and 3 do. Mark the primes once with a sieve.',
        sketch: { kind: 'array', rows: [{ items: [1, 2, 3], marks: { '1': 'kept', '2': 'kept' } }], caption: 'shaded: primes' },
      },
      {
        title: 'Shrinking can only lower the spread',
        text: 'Dropping elements from the left removes primes, so the prime spread can only fall. For each r, the starts with spread ≤ k form a range [l, r]: a sliding window whose max and min queues hold only primes.',
        sketch: { kind: 'array', rows: [{ items: [1, 2, 3], bands: [{ from: 0, to: 2, tone: 'accent' }] }], caption: 'primes 2 and 3: spread 1 ≤ 1' },
      },
      {
        title: 'Two primes must stay inside',
        text: 'A start must also leave at least two primes in the window, so it must be at or before the second-last prime. For r = 2 the second-last prime is at index 1: starts 0 and 1 count. Total 2.',
        sketch: {
          kind: 'array',
          rows: [{ items: [1, 2, 3], marks: { '1': 'hit' }, tags: { '0': [['start', 'accent']], '1': [['start', 'accent']] } }],
          caption: '[1, 2, 3] and [2, 3]',
        },
      },
    ],
    brute: {
      idea: 'For each start, extend the end tracking the number of primes and the smallest and largest prime; stop once the spread exceeds k.',
      cost: 'O(n²)',
      waste: 'Each start re-extends over values the previous start already scanned; a window whose ends only move right touches each value a constant number of times.',
    },
    pattern: {
      pick: 'monotonic-stack',
      why: 'Sieve, then a sliding window where only primes enter a max deque and a min deque. For each r, move l while the prime spread > k; the counted windows ending at r start in [l, secondLastPrime], adding secondLastPrime − l + 1 when that is positive. O(n + M log log M).',
      not: [
        { id: 'math-for-interviews', why: 'The sieve comes from there; counting the windows is the deque part.' },
        { id: 'sliding-window', why: 'The window is the frame; the prime max and min as values leave come from the deques.' },
      ],
    },
    watch: {
      viz: 'LimitWindowViz',
      inputs: [
        { label: '[1, 2, 3], k = 1', input: { nums: [1, 2, 3], limit: 1, goal: 'prime' } },
        { label: '[2, 3, 5, 7], k = 2', input: { nums: [2, 3, 5, 7], limit: 2, goal: 'prime' } },
      ],
    },
    edges: ['Fewer than two primes: [1, 4, 6], 5 → 0.', 'Repeated primes count: [2, 2], 0 → 1.', 'Primes too far apart: [2, 11], 3 → 0.'],
  },

  'longest-continuous-subarray-with-absolute-diff-less-than-or-equal-to-limit': {
    aha: 'Any two elements are within limit exactly when max − min ≤ limit, and shrinking a good window keeps it good. So slide a window: extend r, move l while max − min > limit, and keep the longest. A deque of falling values gives the max and a deque of rising values gives the min.',
    asks: {
      read: 'Which words can you replace with a check on just two values?',
      budget: 'Up to 10⁵ values. Can every window be checked?',
      observe: 'In [8, 2, 4, 7] with limit 4, which windows are good? Which is longest?',
      brute: 'A running min and max from every start works. What does it repeat?',
      pattern: 'You need the window\'s max and min as values arrive and leave. Which two structures give them?',
      watch: 'Watch both deques change as the window slides.',
    },
    read: [
      {
        phrase: 'the absolute difference between any two elements is at most `limit`',
        says: 'The farthest-apart pair is the max and the min: check max − min ≤ limit.',
      },
      {
        phrase: 'return the length of the longest non-empty contiguous subarray',
        says: 'The longest valid window: a sliding window that keeps the best length.',
      },
    ],
    budget: { from: 'nums.length ≤ 10⁵', n: 100000, aim: 'O(n)', note: 'n² = 10¹⁰ windows: far too many.' },
    observe: [
      {
        title: 'Any two elements: just check max and min',
        text: 'In [2, 4, 7] the farthest pair is 7 and 2: 5 > 4, too wide. If max − min is within the limit, every pair is.',
        sketch: { kind: 'array', rows: [{ items: [8, 2, 4, 7], bands: [{ from: 1, to: 3, tone: 'danger', label: 'spread 5' }] }] },
      },
      {
        title: 'A good window stays good when shrunk',
        text: 'So slide it: [8, 2] has spread 6, too wide, so it shrinks to [2]; [2, 4] has spread 2, length 2; [2, 4, 7] has 5, so it shrinks to [4, 7], spread 3. The best is 2.',
        sketch: { kind: 'array', rows: [{ items: [8, 2, 4, 7], bands: [{ from: 1, to: 2, tone: 'success', label: 'length 2' }] }] },
      },
      {
        title: 'Window max and min in O(1)',
        text: 'A deque of falling values gives the max at its front; a deque of rising values gives the min. When l passes an index at a front, it leaves that deque.',
        sketch: { kind: 'array', rows: [{ label: 'window [4, 7]: max deque', items: [7] }, { label: 'min deque', items: [4, 7] }] },
      },
    ],
    brute: {
      idea: 'Fix the start, extend the end tracking the running min and max, and stop when they differ by more than the limit.',
      cost: 'O(n²)',
      waste: 'Each start re-extends over values the previous start already scanned, recomputing the same running min and max.',
    },
    pattern: {
      pick: 'monotonic-stack',
      why: 'Sliding window with a max deque and a min deque: push nums[r] into both (dropping beaten values from the backs), move l while front(max) − front(min) > limit, then record r − l + 1. O(n).',
      not: [
        { id: 'heap-patterns', why: 'Two heaps of the window with lazy removal also work, in O(n log n).' },
        { id: 'sliding-window', why: 'The window is the frame; its max and min as values leave come from the deques.' },
      ],
    },
    watch: {
      viz: 'LimitWindowViz',
      inputs: [
        { label: '[8, 2, 4, 7], limit 4', input: { nums: [8, 2, 4, 7], limit: 4 } },
        { label: '[10, 1, 2, 4, 7, 2], limit 5', input: { nums: [10, 1, 2, 4, 7, 2], limit: 5 } },
      ],
    },
    edges: ['limit 0: [4, 2, 2, 2, 4, 4, 2, 2], 0 → 3.', 'One element: [5], 0 → 1.', 'Everything fits: [1, 2, 3], 5 → 3.'],
  },

  'jump-game-vi': {
    aha: 'dp[i], the best score of a path ending at i, is nums[i] plus the best dp among the k indexes before it. The best of the last k is a sliding-window maximum, so keep a deque of indexes with dp falling from front to back: drop the front when it is out of reach, use it, then push i.',
    asks: {
      read: 'Which words say where you can come from, and what you must visit?',
      budget: 'n and k up to 10⁵. Can each index scan its last k?',
      observe: 'Work out dp for [1, −1, −2, 4, −7, 3] with k = 2. Which earlier dp does each step use?',
      brute: 'DP scanning the last k works. Which maxima are recomputed?',
      pattern: 'The k candidates slide right by one each step. Which earlier problem is that?',
      watch: 'Watch dp fill in, with the deque\'s front as the place to jump from.',
    },
    read: [
      { phrase: 'jump from index `i` to any index in', says: 'You reach i from one of the k indexes before it: dp over the last k.' },
      {
        phrase: 'Your score is the sum of `nums[j]` over every index `j` you visit',
        says: 'Every visited index counts, negatives included: you may have to land on some.',
      },
      {
        phrase: 'Return the maximum score you can get when you reach index `n − 1`',
        says: 'The goal is the best score at the last index, so the answer is dp[n − 1], not the largest dp anywhere.',
      },
    ],
    budget: {
      from: 'nums.length, k ≤ 10⁵',
      rows: [['DP scanning the last k', '10⁵ × 10⁵', 'bad', 'too slow'], ['DP + max deque', 'O(n)', 'ok', 'fits']],
      aim: 'O(n)',
      note: 'Each step needs the max of the last k dp values, without rescanning them.',
    },
    observe: [
      {
        title: 'The best at i comes from the best of the last k',
        text: 'You land on i from one of the k indexes before it, so dp[i] = nums[i] + max(dp[i − k … i − 1]). For the example: dp = [1, 0, −1, 4, −3, 7], and the answer is 7.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'nums', items: [1, -1, -2, 4, -7, 3] }, { label: 'dp', items: [1, 0, -1, 4, -3, 7], marks: { '5': 'hit' } }],
        },
      },
      {
        title: 'The max of the last k is a sliding-window maximum',
        text: 'As i moves right, the k candidates slide right by one: exactly Sliding Window Maximum, over dp values.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'dp', items: [1, 0, -1, 4, -3, 7], bands: [{ from: 3, to: 4, tone: 'accent', label: 'the last 2 for i = 5' }] }],
        },
      },
      {
        title: 'A newer, better dp makes older ones useless',
        text: 'dp[3] = 4 beats dp[1] and dp[2] and stays in reach longer: they can never be the best again. So keep a deque with dp falling from front to back.',
        sketch: { kind: 'array', rows: [{ label: 'deque after i = 3', items: ['3 (dp 4)'], marks: { '0': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'DP: dp[i] = nums[i] + the max of dp[i − k … i − 1], found with a loop.',
      cost: 'O(n · k)',
      waste: 'Neighbouring steps share k − 1 candidates, and the max is recomputed from scratch each time.',
    },
    pattern: {
      pick: 'monotonic-stack',
      why: 'DP + max deque: drop the front if it is more than k back, set dp[i] = nums[i] + dp[front], pop the back while its dp ≤ dp[i], and push i. O(n).',
      not: [
        { id: 'greedy', why: 'Always jumping to the best-looking next index fails: reaching the 4 means landing on −1 or −2 first.' },
        { id: 'dp-linear', why: 'The recurrence is linear DP; the deque only speeds up its "max of the last k".' },
        { id: 'heap-patterns', why: 'A max-heap of (dp, index) with lazy removal works too, in O(n log n).' },
      ],
    },
    watch: {
      viz: 'DpDequeViz',
      inputs: [
        { label: '[1, −1, −2, 4, −7, 3], k = 2', input: { mode: 'jump', nums: [1, -1, -2, 4, -7, 3], k: 2 } },
        { label: '[10, −5, −2, 4, 0, 3], k = 3', input: { mode: 'jump', nums: [10, -5, -2, 4, 0, 3], k: 3 } },
      ],
    },
    edges: ['One element: [5], 1 → 5.', 'All negative, k = 1: [−1, −2, −3], 1 → −6; every index is visited.', 'Jump over a hole: [1, −5, 2], 2 → 3.'],
  },

  'number-of-visible-people-in-a-queue': {
    aha: 'Scanning from the right, keep a stack of people who could still be seen from further left; their heights rise from the top of the stack to the bottom. A new person sees everyone shorter that they pop (those are now hidden for good), plus the first taller person left on the stack, if any.',
    asks: {
      read: 'Which words define who can be seen?',
      budget: 'Up to 10⁵ people. Can everyone look along the whole queue?',
      observe: 'Who does person 0 (height 10) see in [10, 6, 8, 5, 11, 9]?',
      brute: 'Looking right from every person works. What does it repeat?',
      pattern: 'Once 10 stands in front of 6 and 8, can anyone further left still see them?',
      watch: 'Watch each person pop the people they see.',
    },
    read: [
      {
        phrase: 'everybody standing between them is shorter than both of them',
        says: 'What i sees from the left is a rising staircase, ending at the first person taller than i.',
      },
      { phrase: 'Everyone looks to the right', says: 'Each answer depends only on the people to the right: scan from the right.' },
      {
        phrase: 'with distinct heights',
        says: 'All heights are different, so "shorter than both" is never ambiguous: no equal heights to block or not block a view.',
      },
    ],
    budget: { from: 'heights.length ≤ 10⁵', n: 100000, aim: 'O(n)', note: 'Looking right from everyone is O(n²) on a falling queue.' },
    observe: [
      {
        title: 'A taller person hides the shorter ones behind',
        text: 'Person 0 (10) sees 6, then 8 (taller than 6), then 11 (taller than both). 11 is taller than 10, so it blocks everything after it: 3 people.',
        sketch: { kind: 'array', rows: [{ items: [10, 6, 8, 5, 11, 9], marks: { '0': 'cur', '1': 'hit', '2': 'hit', '3': 'dim', '4': 'hit', '5': 'dim' } }] },
      },
      {
        title: 'Keep the people still visible from the left',
        text: 'Scan from the right with a stack of people who could still be seen from further left; heights rise from top to bottom. Before person 0 the stack holds 11, 8, 6 (bottom to top).',
        sketch: { kind: 'array', rows: [{ label: 'stack before person 0, bottom → top', items: [11, 8, 6] }] },
      },
      {
        title: 'Each pop is one person seen',
        text: '10 pops 6 and 8 (both seen, and now hidden from everyone further left), then sees 11 still on top: 3. Then 10 is pushed.',
        sketch: { kind: 'array', rows: [{ items: ['6 ✓', '8 ✓', '11 ✓'], marks: { '0': 'hit', '1': 'hit', '2': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'From each person, walk right keeping the tallest height so far; count everyone taller than all in between, and stop at the first person taller than you.',
      cost: 'O(n²)',
      waste: 'The same people are walked over from every person to their left.',
    },
    pattern: {
      pick: 'monotonic-stack',
      why: 'A stack scanned from the right, heights rising from top to bottom: person i pops everyone shorter (each one is seen), sees the next one on the stack too if there is one, then is pushed. O(n).',
      not: [
        { id: 'stack-patterns', why: 'A plain stack holds the people, but the key is keeping it ordered by height and counting the pops.' },
        { id: 'two-pointers', why: 'Nothing moves towards anything; each person looks right over a staircase.' },
      ],
    },
    watch: {
      viz: 'VisiblePeopleViz',
      inputs: [
        { label: '[10, 6, 8, 5, 11, 9]', input: { heights: [10, 6, 8, 5, 11, 9] } },
        { label: '[5, 1, 2, 3, 10]', input: { heights: [5, 1, 2, 3, 10] } },
      ],
    },
    edges: ['One person: [7] → [0].', 'Rising: [1, 2, 3] → [1, 1, 0].', 'Falling: [3, 2, 1] → [1, 1, 0].'],
  },

  'count-subarrays-with-fixed-bounds': {
    aha: 'Fix the end r. A start works when no value outside [minK, maxK] lies between, and both a minK and a maxK appear in the window. So remember three positions: the last bad value, the last minK and the last maxK. End r adds max(0, min(lastMin, lastMax) − lastBad).',
    asks: {
      read: 'Which words fix the window\'s minimum and maximum exactly?',
      budget: 'Up to 10⁵ values. Can you check every window?',
      observe: 'In [1, 3, 5, 2, 7, 5] with minK 1 and maxK 5, what does 7 do to the windows around it?',
      brute: 'Extending from every start works. What does it repeat?',
      pattern: 'For a fixed end, how far left can a start go, and how far right?',
      watch: 'Watch the three positions move and each end add its count.',
    },
    read: [
      {
        phrase: 'whose minimum value is exactly `minK` and whose maximum value is exactly `maxK`',
        says: 'Two conditions: nothing outside [minK, maxK], and both minK and maxK present.',
      },
      { phrase: 'Return the number of fixed-bound subarrays', says: 'A count: add the good windows ending at each r.' },
    ],
    budget: { from: 'nums.length ≤ 10⁵', n: 100000, aim: 'O(n)', note: 'n² windows: far too many to check.' },
    observe: [
      {
        title: 'A value outside the bounds is a wall',
        text: '7 > 5, so no counted window can contain it. It splits [1, 3, 5, 2, 7, 5] into [1, 3, 5, 2] and [5].',
        sketch: { kind: 'array', rows: [{ items: [1, 3, 5, 2, 7, 5], marks: { '4': 'bad' }, tags: { '4': [['wall', 'danger']] } }] },
      },
      {
        title: 'Fix the end; which starts work?',
        text: 'For end r = 3 (value 2), a start works if no wall lies between and the window holds a 1 and a 5. The last 1 is at 0 and the last 5 at 2, so the start must be ≤ 0: only start 0.',
        sketch: {
          kind: 'array',
          rows: [
            {
              items: [1, 3, 5, 2, 7, 5],
              tags: { '0': [['last minK', 'accent']], '2': [['last maxK', 'warn']] },
              bands: [{ from: 0, to: 3, tone: 'success' }],
            },
          ],
        },
      },
      {
        title: 'Three positions are enough',
        text: 'Each end adds min(lastMin, lastMax) − lastBad when that is positive. Ends 2 and 3 add 1 each; after the wall nothing counts. Total 2. Since nothing outside the bounds is allowed, "minimum is minK" just means "a minK is inside": no deque needed.',
        sketch: { kind: 'array', rows: [{ label: 'added at each end', items: [0, 0, 1, 1, 0, 0], marks: { '2': 'hit', '3': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Fix the start and extend the end tracking the min and max; a value outside [minK, maxK] ends the extension.',
      cost: 'O(n²)',
      waste: 'Each start re-walks the same stretch to rediscover the same minK and maxK positions.',
    },
    pattern: {
      pick: 'monotonic-stack',
      why: 'One pass remembering the last bad index, the last minK and the last maxK; each end r adds max(0, min(lastMin, lastMax) − lastBad). This is the deque-free end of the min/max window family: the bounds are fixed, so only "seen minK and maxK" matters. O(n).',
      not: [
        {
          id: 'sliding-window',
          why: '"Minimum exactly minK" isn\'t kept by shrinking (removing the minK breaks it), so plain shrink-while-invalid doesn\'t apply.',
        },
        {
          id: 'two-pointers',
          why: 'The start isn\'t a single pointer: every start in a range counts, and the range comes from three remembered positions.',
        },
      ],
    },
    watch: {
      viz: 'FixedBoundsViz',
      inputs: [
        { label: '[1, 3, 5, 2, 7, 5], 1, 5', input: { nums: [1, 3, 5, 2, 7, 5], minK: 1, maxK: 5 } },
        { label: '[1, 1, 1, 1], 1, 1', input: { nums: [1, 1, 1, 1], minK: 1, maxK: 1 } },
      ],
    },
    edges: ['minK = maxK: [1, 1, 1, 1], 1, 1 → 10.', 'No minK at all: [2, 3], 1, 3 → 0.', 'A wall at the start: [7, 1, 5], 1, 5 → 1.'],
  },

  'constrained-subsequence-sum': {
    aha: 'dp[i], the best sum of a valid subsequence ending at i, is nums[i] plus the best dp among the previous k indexes, or plus nothing if they are all negative (start fresh). The best of the last k is a sliding-window maximum: keep a deque with dp falling from front to back. The answer is the best dp anywhere.',
    asks: {
      read: 'Which words limit the gaps, and which allow skipping?',
      budget: 'Up to 10⁵ values. Can each index scan its last k?',
      observe: 'Work out dp for [10, 2, −10, 5, 20] with k = 2. Which value gets skipped?',
      brute: 'DP scanning the last k works. Which maxima are recomputed?',
      pattern: 'The k candidates slide right by one each step. Which problem in this pattern is that?',
      watch: 'Watch dp fill in, extending the front or starting fresh.',
    },
    read: [
      { phrase: 'the maximum sum of a non-empty subsequence', says: 'At least one element; you choose where it starts and ends.' },
      { phrase: 'for every two consecutive chosen indices', says: 'Gaps of at most k between chosen elements: dp over the last k.' },
      { phrase: 'may skip elements', says: 'Negative values can be jumped over, if the gap allows it.' },
    ],
    budget: {
      from: 'nums.length ≤ 10⁵',
      rows: [['DP scanning the last k', '10⁵ × 10⁵', 'bad', 'too slow'], ['DP + max deque', 'O(n)', 'ok', 'fits']],
      aim: 'O(n)',
      note: 'Each step needs the max of the last k dp values without rescanning them.',
    },
    observe: [
      {
        title: 'Extend the best in reach, or start fresh',
        text: 'dp[i] = nums[i] + max(0, best dp among i − k … i − 1). Starting fresh is allowed because a subsequence can begin anywhere. dp = [10, 12, 2, 17, 37].',
        sketch: { kind: 'array', rows: [{ label: 'nums', items: [10, 2, -10, 5, 20] }, { label: 'dp', items: [10, 12, 2, 17, 37], marks: { '4': 'hit' } }] },
      },
      {
        title: 'Skip what hurts',
        text: '−10 is skipped: 10, 2, 5, 20 uses gaps of 1, 2 and 1, all ≤ 2. Sum 37.',
        sketch: { kind: 'array', rows: [{ items: [10, 2, -10, 5, 20], marks: { '0': 'hit', '1': 'hit', '2': 'dim', '3': 'hit', '4': 'hit' } }] },
      },
      {
        title: 'The same deque as Jump Game VI',
        text: 'The max of the last k dp values is a sliding-window maximum: a deque with dp falling from front to back. After i = 3, dp[3] = 17 has pushed out dp[1] and dp[2].',
        sketch: { kind: 'array', rows: [{ label: 'deque after i = 3', items: ['3 (dp 17)'], marks: { '0': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'DP: dp[i] = nums[i] + max(0, the max of dp[i − k … i − 1]), found with a loop.',
      cost: 'O(n · k)',
      waste: 'Neighbouring steps share k − 1 candidates, and the max is recomputed each time.',
    },
    pattern: {
      pick: 'monotonic-stack',
      why: 'DP + max deque: drop the front when it is more than k back, set dp[i] = nums[i] + max(0, dp[front]), pop the back while its dp ≤ dp[i], push i, and keep the best dp. O(n).',
      not: [
        { id: 'dp-linear', why: 'The recurrence is linear DP; the deque only speeds up its "max of the last k".' },
        { id: 'heap-patterns', why: 'A max-heap of (dp, index) with lazy removal works too, in O(n log n).' },
      ],
    },
    watch: {
      viz: 'DpDequeViz',
      inputs: [
        { label: '[10, 2, −10, 5, 20], k = 2', input: { mode: 'csum', nums: [10, 2, -10, 5, 20], k: 2 } },
        { label: '[−1, −2, −3], k = 1', input: { mode: 'csum', nums: [-1, -2, -3], k: 1 } },
      ],
    },
    edges: [
      'All negative: [−1, −2, −3], 1 → −1; take the single best.',
      'k = 1, nothing to skip: [1, −1, 2], 1 → 2.',
      'Skipping helps: [10, −10, 10], 2 → 20.',
    ],
  },

  'shortest-subarray-with-sum-at-least-k': {
    aha: 'With negative numbers a sliding window can\'t decide when to shrink, so use prefix sums: the subarray from i to j − 1 sums to p[j] − p[i]. For each j, the best start is a recent i with a small p[i]. Keep candidate starts in a deque with p rising: pop the front once it pairs with j (record the length), and pop the back when the new p is no bigger.',
    asks: {
      read: 'Which words break the usual sliding window?',
      budget: 'Up to 10⁵ values. Can every start extend to every end?',
      observe: 'In [2, −1, 2], what happens to the window sum when you drop −1 from the left?',
      brute: 'Every start with a running sum works. What does it repeat?',
      pattern: 'Which earlier starts can never be the best start for any later end?',
      watch: 'Watch starts leave from the front when they pair up, and from the back when beaten.',
    },
    read: [
      { phrase: '(which may contain negative numbers)', says: 'Shrinking a window can raise its sum: the usual sliding window breaks.' },
      {
        phrase: 'shortest non-empty contiguous subarray whose sum is at least `k`',
        says: 'Subarray sums are differences of prefix sums: p[j] − p[i] ≥ k with j − i as small as possible.',
      },
      { phrase: 'If there is no such subarray, return `-1`', says: 'Start the best length at infinity and turn it into −1 if nothing is found.' },
    ],
    budget: { from: 'nums.length ≤ 10⁵', n: 100000, aim: 'O(n)', note: 'Trying every start with a running sum is O(n²) = 10¹⁰.' },
    observe: [
      {
        title: 'Negatives break the sliding window',
        text: 'With only positives, growing a window raises its sum and shrinking lowers it. In [2, −1, 2], shrinking [2, −1, 2] to [−1, 2] lowers the sum, but dropping −1 next raises it again: there is no safe rule for when to shrink.',
        sketch: { kind: 'array', rows: [{ items: [2, -1, 2], marks: { '1': 'bad' } }] },
      },
      {
        title: 'Use prefix sums',
        text: 'p = [0, 2, 1, 3]. The subarray from i to j − 1 sums to p[j] − p[i], so we want the latest i before j with p[i] ≤ p[j] − k. For j = 3: p[3] − p[0] = 3 ≥ 3, length 3.',
        sketch: { kind: 'array', rows: [{ label: 'prefix sums p', items: [0, 2, 1, 3], tags: { '0': [['i', 'accent']], '3': [['j', 'warn']] } }] },
      },
      {
        title: 'Keep only useful starts, in a deque',
        text: 'A start further left with a bigger p is never better than a later one with a smaller p: drop it from the back. Once a start pairs with some j, later ends would only be longer for it: drop it from the front. Before j = 3 the deque holds starts 0 and 2.',
        sketch: { kind: 'array', rows: [{ label: 'deque of starts (p rising)', items: ['0 (p 0)', '2 (p 1)'] }] },
      },
    ],
    brute: {
      idea: 'For every start, extend the end with a running sum and record the first end that reaches k.',
      cost: 'O(n²)',
      waste: 'Starts that can never win (an earlier, higher prefix sum) are extended anyway.',
    },
    pattern: {
      pick: 'monotonic-stack',
      why: 'A monotonic deque over prefix sums: for each j, pop the front while p[j] − p[front] ≥ k (recording j − front), pop the back while p[back] ≥ p[j], then push j. O(n).',
      not: [
        { id: 'sliding-window', why: 'Works only without negatives (Minimum Size Subarray Sum); here shrinking can raise the sum.' },
        { id: 'binary-search', why: 'Binary searching a sorted structure of earlier prefix sums works, in O(n log n).' },
        { id: 'prefix-sums', why: 'The prefix sums are the base; the deque decides which starts are still worth keeping.' },
      ],
    },
    watch: {
      viz: 'DpDequeViz',
      inputs: [
        { label: '[2, −1, 2], k = 3', input: { mode: 'shortest', nums: [2, -1, 2], k: 3 } },
        { label: '[84, −37, 32, 40, 95], k = 167', input: { mode: 'shortest', nums: [84, -37, 32, 40, 95], k: 167 } },
      ],
    },
    edges: ['A single element: [1], 1 → 1.', 'Impossible: [1, 2], 4 → −1.', 'A negative in the middle: [84, −37, 32, 40, 95], 167 → 3.'],
  },

  'largest-rectangle-in-histogram': {
    aha: 'Every rectangle is as tall as its shortest bar. So try each bar as the shortest: it stretches left and right until a shorter bar. Keep bars in rising order on a stack; when a shorter bar arrives, each taller bar popped has found its right edge (here) and its left edge (the bar below it on the stack).',
    asks: {
      read: 'Which words say what limits a rectangle\'s height?',
      budget: 'Up to 10⁵ bars. Can you try every pair of ends?',
      observe: 'In [2, 1, 5, 6, 2, 3], how wide can a rectangle of height 5 be?',
      brute: 'Every pair of ends with a running minimum works. What does it repeat?',
      pattern: 'When a shorter bar arrives, which earlier bars have just found their right edge?',
      watch: 'Watch taller bars pop and measure their rectangles.',
    },
    read: [
      {
        phrase: 'it may span several adjacent bars and is limited by the shortest of them',
        says: 'Height = the shortest bar inside. Try each bar as that shortest bar.',
      },
      { phrase: 'a bar of width 1', says: 'The width is just the number of bars covered.' },
    ],
    budget: { from: 'heights.length ≤ 10⁵', n: 100000, aim: 'O(n)', note: 'Every pair of ends is O(n²) = 10¹⁰.' },
    observe: [
      {
        title: 'Every rectangle has a shortest bar',
        text: 'Its height is the height of its shortest bar. So try each bar as the shortest one and ask how far it can stretch.',
        sketch: { kind: 'array', rows: [{ items: [2, 1, 5, 6, 2, 3], bands: [{ from: 2, to: 3, tone: 'accent', label: '5 × 2 = 10' }] }] },
      },
      {
        title: 'A bar stretches until a shorter bar on each side',
        text: 'The 5 stretches right over 6 and stops at 2; to the left it stops at 1. Width 2, area 10, the answer.',
        sketch: { kind: 'array', rows: [{ items: [2, 1, 5, 6, 2, 3], marks: { '1': 'target', '2': 'cur', '4': 'target' } }] },
      },
      {
        title: 'A shorter bar ends the taller ones before it',
        text: 'Keep bars in rising order on a stack. When 2 arrives, 6 and then 5 on top are taller: their right edge is here, their left edge is the bar below them on the stack. Pop and measure: 6 × 1, then 5 × 2.',
        sketch: { kind: 'array', rows: [{ label: 'stack when 2 arrives, bottom → top', items: [1, 5, 6], marks: { '1': 'bad', '2': 'bad' } }] },
      },
    ],
    brute: {
      idea: 'Fix the left end, extend the right end keeping the running minimum, and track the best height × width.',
      cost: 'O(n²)',
      waste: 'Each left end re-scans the bars to its right; each bar\'s reach is discovered over and over.',
    },
    pattern: {
      pick: 'monotonic-stack',
      why: 'A rising stack of bar indexes: when a shorter bar arrives at i, pop each taller bar; its rectangle is height × (i − newTop − 1). A 0-height bar at the end empties the stack. O(n).',
      not: [
        {
          id: 'two-pointers',
          why: 'Container With Most Water uses two pointers because only the two ends matter; here every bar in between limits the height.',
        },
        { id: 'divide-and-conquer', why: 'Splitting at the shortest bar works, but is O(n²) on sorted heights.' },
      ],
    },
    watch: { viz: 'HistogramViz', inputs: [{ label: '[2, 1, 5, 6, 2, 3]', input: { h: [2, 1, 5, 6, 2, 3] } }, { label: '[2, 4]', input: { h: [2, 4] } }] },
    edges: ['One bar: [5] → 5.', 'Rising: [2, 4] → 4.', 'All equal: [3, 3, 3] → 9.', 'A zero bar splits: [2, 0, 2] → 2.'],
  },

  'maximal-rectangle': {
    aha: 'Every all-ones rectangle has a bottom row. Standing on each row, the columns of 1s above form a histogram (heights grow by one for a 1 and reset to 0 for a 0), and the best rectangle on that row is Largest Rectangle in Histogram.',
    asks: {
      read: 'Which words hand you the method?',
      budget: 'Up to 200 × 200 cells. Can you try every rectangle?',
      observe: 'Standing on row 2 of the example, how tall is the column of 1s above each cell?',
      brute: 'For each bottom-right corner you look upwards. What does it repeat?',
      pattern: 'Once each row is a histogram, which problem finds its largest rectangle?',
      watch: 'Run Largest Rectangle on each row\'s histogram; row 2 holds the answer.',
    },
    read: [
      { phrase: 'the largest rectangle that contains only', says: 'Every such rectangle has a bottom row and is made of columns of 1s.' },
      { phrase: 'Treat each row as the floor of a histogram', says: 'Bar heights = consecutive 1s ending at that row in each column.' },
      {
        phrase: 'apply the largest-rectangle-in-histogram method row by row',
        says: 'Each row is one Largest Rectangle in Histogram problem: O(n) each with a stack.',
      },
    ],
    budget: {
      from: 'matrix ≤ 200 × 200',
      rows: [['every rectangle', '(200 × 200)² = 1.6 × 10⁹', 'bad', 'too slow'], ['a histogram per row', '200 × 200', 'ok', 'easily fits']],
      aim: 'O(m · n)',
      note: 'One pass per row over its histogram.',
    },
    observe: [
      {
        title: 'Every rectangle has a bottom row',
        text: 'Fix the bottom row; the rectangle reaches up through columns of 1s. Standing on row 2, the columns of 1s ending there have heights [3, 1, 3, 2, 2].',
        sketch: {
          kind: 'grid',
          grid: [['1', '0', '1', '0', '0'], ['1', '0', '1', '1', '1'], ['1', '1', '1', '1', '1'], ['1', '0', '0', '1', '0']],
          marks: { '1,2': 'hit', '1,3': 'hit', '1,4': 'hit', '2,2': 'hit', '2,3': 'hit', '2,4': 'hit' },
          caption: 'the answer: rows 1–2, columns 2–4, area 6',
        },
      },
      {
        title: 'Heights update in O(1) per cell',
        text: 'Going down one row: a 1 adds one to its column\'s height, a 0 resets it to 0.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'row 1', items: [2, 0, 2, 1, 1] }, { label: 'row 2', items: [3, 1, 3, 2, 2] }, { label: 'row 3', items: [4, 0, 0, 3, 0] }],
        },
      },
      {
        title: 'Each row is Largest Rectangle in Histogram',
        text: 'Row 2\'s histogram [3, 1, 3, 2, 2] holds a rectangle of height 2 across its last three bars: 2 × 3 = 6, the answer.',
        sketch: { kind: 'array', rows: [{ items: [3, 1, 3, 2, 2], bands: [{ from: 2, to: 4, tone: 'success', label: '2 × 3 = 6' }] }] },
      },
    ],
    brute: {
      idea: 'For each cell as the bottom-right corner, look upwards row by row, keeping the narrowest run of 1s ending in that column.',
      cost: 'O(m² · n)',
      waste: 'Every corner walks up through the same rows its neighbours already walked; keeping running column heights per row avoids re-walking.',
    },
    pattern: {
      pick: 'monotonic-stack',
      why: 'A histogram per row: heights[c] += 1 for a 1, = 0 for a 0; run the monotonic-stack largest rectangle on each row\'s heights and keep the best. O(m · n).',
      not: [
        { id: 'dp-grid', why: 'The Maximal Square DP doesn\'t extend to rectangles of any shape; the histogram view does.' },
        { id: 'prefix-sums', why: '2D prefix sums test whether a rectangle is all 1s in O(1), but there are O(m² n²) rectangles to test.' },
      ],
    },
    watch: {
      viz: 'HistogramViz',
      inputs: [
        { label: 'row 0: [1, 0, 1, 0, 0]', input: { h: [1, 0, 1, 0, 0] } },
        { label: 'row 1: [2, 0, 2, 1, 1]', input: { h: [2, 0, 2, 1, 1] } },
        { label: 'row 2: [3, 1, 3, 2, 2]', input: { h: [3, 1, 3, 2, 2] } },
        { label: 'row 3: [4, 0, 0, 3, 0]', input: { h: [4, 0, 0, 3, 0] } },
      ],
    },
    edges: ['All zeros: [["0"]] → 0.', 'All ones: [["1","1"],["1","1"]] → 4.', 'A single row: [["1","1","0","1"]] → 2.'],
  },
};
