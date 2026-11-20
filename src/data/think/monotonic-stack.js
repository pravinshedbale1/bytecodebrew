/** Practice thinking walkthroughs: monotonic-stack (format: src/data/think/index.js). */
export default {
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
};
