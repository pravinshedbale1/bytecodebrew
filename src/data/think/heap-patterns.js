/** Practice thinking walkthroughs: heap-patterns (format: src/data/think/index.js). */

export default {
  'last-stone-weight': {
    free: true,
    aha: 'Every round needs the two heaviest stones, and the leftover goes back among the others. A max-heap hands you the heaviest in O(log n) each time: pop twice, push back the difference if it is not 0.',
    asks: {
      read: 'Which words say what you need from the stones every round?',
      budget: 'Only 30 stones. What is this problem really about, then?',
      observe: 'Play [2, 7, 4, 1, 8, 1] by hand. After 8 and 7 smash, where does the new stone go?',
      brute: 'Sorting before every smash works. What does each sort redo?',
      pattern: 'Which structure gives "the largest" repeatedly while new values keep arriving?',
      watch: 'Watch the two heaviest pop and the leftover go back.',
    },
    read: [
      { phrase: 'Repeatedly take the two heaviest stones', says: '"Repeatedly the largest" while the set keeps changing: a max-heap.' },
      { phrase: 'the heavier one now weighs `y − x`', says: 'A new stone goes back in and must be ranked among the others.' },
      { phrase: 'or `0` if none remain', says: 'Equal stones destroy each other; the heap can end up empty.' },
    ],
    budget: {
      from: 'stones.length ≤ 30',
      rows: [['sort before every smash', '30 × 30 log 30', 'ok', 'fits'], ['max-heap', '30 log 30', 'ok', 'the point']],
      aim: 'O(n log n)',
      note: 'Tiny input: the lesson is which structure hands you "the two heaviest" every round.',
    },
    observe: [
      {
        title: 'Each round needs the two heaviest',
        text: '8 and 7 smash, leaving 1. Then 4 and 2 leave 2, then 2 and 1 leave 1, then 1 and 1 destroy each other. One stone is left: 1.',
        sketch: { kind: 'array', rows: [{ items: [2, 7, 4, 1, 8, 1], marks: { '1': 'cur', '4': 'cur' } }] },
      },
      {
        title: 'The leftover goes back among the others',
        text: 'After 8 vs 7, the new stone 1 is no longer among the heaviest. It has to be ranked with the rest, every round, and re-sorting everything for one new stone wastes work.',
        sketch: { kind: 'array', rows: [{ label: 'after round 1, heaviest first', items: [4, 2, 1, 1, 1] }] },
      },
      {
        title: 'A max-heap gives the heaviest in O(log n)',
        text: 'Each round pops the two heaviest and pushes back their difference (if any): three heap operations, O(log n). At most n rounds, since each round removes at least one stone.',
        sketch: { kind: 'array', rows: [{ label: 'max-heap after round 1 (top first)', items: [4, 2, 1, 1, 1], marks: { '0': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Sort the stones before every smash and take the two heaviest.',
      cost: 'O(n² log n)',
      waste: 'Each sort reorders stones that didn\'t change; only one new stone came in.',
    },
    pattern: {
      pick: 'heap-patterns',
      why: 'A max-heap of the stones: pop the two heaviest, push back y − x if it is not 0, until at most one stone is left. O(n log n).',
      not: [
        { id: 'sorting-and-selection', why: 'One sort isn\'t enough: every smash creates a new stone that has to be ranked again.' },
        { id: 'greedy', why: 'Taking the two heaviest is the rule you are given, not a choice to prove; the work is doing it fast.' },
      ],
    },
    watch: {
      viz: 'HeapSimViz',
      inputs: [
        { label: '[2, 7, 4, 1, 8, 1]', input: { mode: 'stones', stones: [2, 7, 4, 1, 8, 1] } },
        { label: '[10, 4, 4]', input: { mode: 'stones', stones: [10, 4, 4] } },
      ],
    },
    edges: ['One stone: [1] → 1.', 'An equal pair: [2, 2] → 0.', 'The leftover keeps smashing: [10, 4, 4] → 2.'],
  },

  'kth-largest-element-in-a-stream': {
    aha: 'Only the k largest values can ever be the k-th largest: new values can only push the answer up. Keep those k in a min-heap; its top, the smallest of them, is the k-th largest. A new value either replaces the top or is ignored.',
    asks: {
      read: 'Which words say that values below the answer stop mattering?',
      budget: 'Up to 10⁴ adds. What does inserting into a sorted list cost each time?',
      observe: 'With k = 3 and [4, 5, 8, 2], which values could ever be the 3rd largest again?',
      brute: 'A sorted list of everything works. What does it keep that is never used?',
      pattern: 'You need the smallest of the k largest, after every add. Which heap keeps that on top?',
      watch: 'Watch the k largest kept in a min-heap, the top being the answer.',
    },
    read: [
      { phrase: 'tracks the `k`-th largest value in a stream of numbers', says: 'An answer after every add, while values keep arriving.' },
      { phrase: 'duplicates count', says: 'Equal values each take a place among the k largest.' },
      { phrase: '`add` is only called when at least `k` values exist after adding', says: 'There is always a k-th largest to report.' },
    ],
    budget: {
      from: 'at most 10⁴ adds, 10⁴ starting values',
      rows: [['keep a sorted list', '10⁴ × 10⁴ shifts', 'warn', 'risky'], ['min-heap of size k', '10⁴ × log k', 'ok', 'fits']],
      aim: 'O(log k) per add',
      note: 'Inserting into a sorted list shifts up to 10⁴ values each time.',
    },
    observe: [
      {
        title: 'Only the k largest matter',
        text: 'With k = 3 and [4, 5, 8, 2], keep 4, 5 and 8. The 2 can never be the 3rd largest again: new values only push the answer up.',
        sketch: { kind: 'array', rows: [{ items: [4, 5, 8, 2], marks: { '3': 'dim' } }] },
      },
      {
        title: 'The answer is the smallest of the k kept',
        text: 'The 3rd largest of {4, 5, 8} is the smallest of them, 4. A min-heap of the k largest has exactly that on top.',
        sketch: { kind: 'array', rows: [{ label: 'min-heap of the 3 largest (top first)', items: [4, 5, 8], marks: { '0': 'hit' } }] },
      },
      {
        title: 'A new value replaces the top or is ignored',
        text: 'add(3): 3 < 4, ignore it, answer 4. add(5): 5 > 4, so 5 replaces 4 and the answer is 5. add(10): 10 replaces 5, giving {5, 8, 10}, answer 5.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'after add(5)', items: [5, 5, 8], marks: { '0': 'hit' } }, { label: 'after add(10)', items: [5, 8, 10], marks: { '0': 'hit' } }],
        },
      },
    ],
    brute: {
      idea: 'Keep every value in a sorted list; insert each new value in place and read the k-th from the end.',
      cost: 'O(n) per add',
      waste: 'It keeps and shifts values far below the answer that can never matter again.',
    },
    pattern: {
      pick: 'heap-patterns',
      why: 'A min-heap holding the k largest values: push each value, and if the heap grows past k, pop the smallest. The top is the k-th largest. O(log k) per add.',
      not: [
        { id: 'sorting-and-selection', why: 'Quickselect finds the k-th largest once; a stream needs it again after every add.' },
        { id: 'binary-search', why: 'Binary search finds where a value goes in a sorted list, but inserting there still shifts O(n) values.' },
      ],
    },
    watch: { viz: 'TopKViz', inputs: [{ label: 'k = 3: [4, 5, 8, 2], then 3, 5, 10, 9, 4', input: { a: [4, 5, 8, 2, 3, 5, 10, 9, 4], k: 3 } }] },
    edges: [
      'Starting empty, k = 1: add(−3) → −3.',
      'Duplicates count: k = 2, [5, 5], add(1) → 5.',
      'A value below the top is ignored: k = 3, [4, 5, 8], add(3) → 4.',
    ],
  },

  'kth-largest-element-in-an-array': {
    aha: 'Sorting orders everything, but only the k largest matter. Scan once with a min-heap that keeps the k largest values seen so far: its top is the k-th largest. Quickselect goes further: partition like quicksort and recurse only into the side that holds the answer, O(n) on average.',
    asks: {
      read: 'Which words say duplicates count, and what is the target speed?',
      budget: 'Up to 10⁵ values. Sorting fits; what is "better"?',
      observe: 'In [3, 2, 1, 5, 6, 4] with k = 2, which values does the answer depend on?',
      brute: 'Sort and index works. Which part of the sorted order is never used?',
      pattern: 'Which heap keeps "the smallest of the k largest" on top?',
      watch: 'Watch the heap keep only the k largest seen so far.',
    },
    read: [
      { phrase: 'not the `k`-th distinct value, so duplicates count', says: 'Count positions, not values: the two 5s are separate.' },
      { phrase: 'Sorting is O(n log n). Try to do better.', says: 'O(n log k) with a heap, or O(n) on average with quickselect.' },
      {
        phrase: 'A min-heap holding the `k` largest values seen so far gives O(n log k)',
        says: 'The method: keep k values, throw out the smallest when one more arrives.',
      },
    ],
    budget: {
      from: 'nums.length ≤ 10⁵',
      n: 100000,
      aim: 'O(n log k), or O(n) on average',
      note: 'Sorting fits, but it orders all n values when only the top k matter.',
    },
    observe: [
      {
        title: 'Sorting does more than needed',
        text: 'Sorted: 6, 5, 4, 3, 2, 1, and the 2nd largest is 5. The order of everything below 5 is never used.',
        sketch: { kind: 'array', rows: [{ items: [6, 5, 4, 3, 2, 1], marks: { '1': 'hit', '2': 'dim', '3': 'dim', '4': 'dim', '5': 'dim' } }] },
      },
      {
        title: 'Keep only the k largest so far',
        text: 'Scan with a min-heap of size 2: 3, 2 → {2, 3}; 1 is below the top, skip; 5 replaces 2 → {3, 5}; 6 replaces 3 → {5, 6}; 4 is below 5, skip. The top is 5.',
        sketch: { kind: 'array', rows: [{ label: 'min-heap of the 2 largest, at the end (top first)', items: [5, 6], marks: { '0': 'hit' } }] },
      },
      {
        title: 'Or partition like quicksort',
        text: 'Quickselect partitions around a pivot and recurses into the one side that holds position n − k. With pivot 4: [3, 2, 1] < 4 < [5, 6], and the 2nd largest is on the right.',
        sketch: {
          kind: 'array',
          rows: [{ items: [3, 2, 1, 4, 5, 6], marks: { '3': 'target' }, bands: [{ from: 4, to: 5, tone: 'accent', label: 'answer is here' }] }],
        },
      },
    ],
    brute: { idea: 'Sort the array and take index n − k.', cost: 'O(n log n)', waste: 'It puts all n values in order, though only the top k matter.' },
    pattern: {
      pick: 'heap-patterns',
      why: 'A min-heap of size k: push each value and pop when the size passes k; the top is the k-th largest. O(n log k). Quickselect (sorting-and-selection) is O(n) on average.',
      not: [
        { id: 'sorting-and-selection', why: 'Quickselect lives there and is the O(n) average answer; the heap is simpler and steady at O(n log k).' },
        { id: 'binary-search-on-answer', why: 'Guessing a value x and counting values ≥ x works over the value range, in O(n log range).' },
      ],
    },
    watch: {
      viz: 'TopKViz',
      inputs: [
        { label: '[3, 2, 1, 5, 6, 4], k = 2', input: { a: [3, 2, 1, 5, 6, 4], k: 2 } },
        { label: '[3, 2, 3, 1, 2, 4, 5, 5, 6], k = 4', input: { a: [3, 2, 3, 1, 2, 4, 5, 5, 6], k: 4 } },
      ],
    },
    edges: ['k = 1: [7, 3], 1 → 7.', 'Duplicates count: [3, 2, 3, 1, 2, 4, 5, 5, 6], 4 → 4.', 'k = n: [2, 1], 2 → 1.'],
  },

  'top-k-frequent-elements': {
    aha: 'Count every value, then pick the k largest counts. A count is a whole number between 1 and n, so put each value into bucket number count and read the buckets from n down: the most frequent values come out first, with no sorting at all.',
    asks: {
      read: 'Which words give the plan, and the speed to beat?',
      budget: 'Up to 10⁵ values. What does sorting the distinct values by count cost?',
      observe: 'Count [1, 1, 1, 2, 2, 3]. What range can a count fall in?',
      brute: 'Sorting values by count works. What does the sort spend time on?',
      pattern: 'Counts are small whole numbers. How can they index straight into an array?',
      watch: 'Watch values counted, dropped into buckets by count, and read from the top.',
    },
    read: [
      { phrase: 'Return the `k` values that occur most often', says: 'Count first (a hash map), then select the k largest counts.' },
      { phrase: 'Try to beat O(n log n)', says: 'Sorting all distinct values by count is not enough.' },
      { phrase: 'by bucketing values by their count', says: 'A count is between 1 and n: it can be an array index.' },
    ],
    budget: { from: 'nums.length ≤ 10⁵', n: 100000, aim: 'O(n)', note: 'A heap of size k gives O(n log k); buckets by count give O(n).' },
    observe: [
      {
        title: 'Count first',
        text: 'In [1, 1, 1, 2, 2, 3]: 1 appears 3 times, 2 twice, 3 once. With k = 2 the answer is [1, 2]: the order of the values themselves doesn\'t matter, only their counts.',
        sketch: { kind: 'array', rows: [{ items: ['1 × 3', '2 × 2', '3 × 1'] }] },
      },
      {
        title: 'A count is between 1 and n',
        text: 'So put each value into bucket number = its count: bucket 3 holds 1, bucket 2 holds 2, bucket 1 holds 3. No comparisons needed.',
        sketch: { kind: 'array', rows: [{ label: 'buckets by count', items: ['1: {3}', '2: {2}', '3: {1}'] }] },
      },
      {
        title: 'Read the buckets from the top',
        text: 'From bucket n down, collect values until k are taken: 1 (count 3), then 2 (count 2). Answer [1, 2].',
        sketch: {
          kind: 'array',
          rows: [{ label: 'reading from the top', items: ['3: {1}', '2: {2}', '1: {3}'], marks: { '0': 'hit', '1': 'hit', '2': 'dim' } }],
        },
      },
    ],
    brute: {
      idea: 'Count each value, sort the distinct values by count (highest first), and take the first k.',
      cost: 'O(n log n)',
      waste: 'It orders every distinct value, though only the k most frequent are needed.',
    },
    pattern: {
      pick: 'heap-patterns',
      why: 'Count with a hash map, then select: a min-heap of size k keyed by count (O(n log k)), or buckets indexed by count read from the top (O(n)).',
      not: [
        { id: 'hashing', why: 'Counting is the hash map\'s job; picking the k largest counts is the selection step.' },
        { id: 'sorting-and-selection', why: 'Sorting all distinct values by count is O(n log n); bucket sort is the O(n) version from there.' },
      ],
    },
    watch: {
      viz: 'BucketViz',
      inputs: [
        { label: '[1, 1, 1, 2, 2, 3], k = 2', input: { mode: 'topk', nums: [1, 1, 1, 2, 2, 3], k: 2 } },
        { label: '[1, 1, 1, 2, 2, 3, 4, 4, 5], k = 2', input: { mode: 'topk', nums: [1, 1, 1, 2, 2, 3, 4, 4, 5], k: 2 } },
      ],
    },
    edges: ['k = number of distinct values: [1, 2], 2 → [1, 2].', 'One value: [5, 5, 5], 1 → [5].', 'Negative values: [−1, −1, 2], 1 → [−1].'],
  },

  'k-closest-points-to-origin': {
    aha: 'Compare squared distances (the square root doesn\'t change the order). Keep the k closest points seen so far in a max-heap: its top is the farthest of them, the one a closer point should replace. Once the heap holds k + 1 points, pop the top.',
    asks: {
      read: 'Which words let you skip the square root?',
      budget: 'Up to 10⁴ points. Can you do better than sorting them all?',
      observe: 'With k = 2 and points (3, 3), (5, −1), (−2, 4), which kept point does (−2, 4) push out?',
      brute: 'Sorting by distance works. Which part of the order is never used?',
      pattern: 'You keep the k smallest. Which end of them should the heap keep on top?',
      watch: 'Watch each point join the heap and the farthest get popped.',
    },
    read: [
      { phrase: 'Return the `k` points closest to the origin', says: 'Selection: the k smallest distances, in any order.' },
      { phrase: 'Comparing squared distances is enough', says: 'x² + y² keeps the order and stays in whole numbers.' },
    ],
    budget: { from: 'points.length ≤ 10⁴', n: 10000, aim: 'O(n log k)', note: 'Sorting fits too; a heap of size k avoids ordering all n points.' },
    observe: [
      {
        title: 'Squared distance is enough',
        text: '(3, 3) is at 18, (5, −1) at 26, (−2, 4) at 20. The square root wouldn\'t change who is closer.',
        sketch: { kind: 'array', rows: [{ items: ['(3,3) 18', '(5,−1) 26', '(−2,4) 20'] }] },
      },
      {
        title: 'Keep the k closest; the farthest of them is the one to beat',
        text: 'With k = 2, after two points the heap holds (3, 3) and (5, −1), with the farthest, 26, on top. (−2, 4) at 20 is closer, so (5, −1) is popped.',
        sketch: { kind: 'array', rows: [{ label: 'max-heap of the 2 closest (top first)', items: ['(5,−1) 26', '(3,3) 18'], marks: { '0': 'bad' } }] },
      },
      {
        title: 'A max-heap for the k smallest',
        text: 'For the k smallest, the heap\'s top must be the largest of them (the one to evict). So "k closest" uses a max-heap of size k, the mirror of "k largest" with a min-heap.',
        sketch: { kind: 'array', rows: [{ label: 'after (−2, 4)', items: ['(−2,4) 20', '(3,3) 18'], marks: { '0': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Sort all points by x² + y² and return the first k.',
      cost: 'O(n log n)',
      waste: 'It orders every point, though only the k closest are needed, in any order.',
    },
    pattern: {
      pick: 'heap-patterns',
      why: 'A max-heap of size k by x² + y²: push each point, pop the farthest whenever the size passes k. O(n log k). Quickselect on distance is O(n) on average.',
      not: [
        { id: 'sorting-and-selection', why: 'Sorting is the simple answer and quickselect the O(n) average one; the heap sits between them.' },
        { id: 'math-for-interviews', why: 'Distances are arithmetic, but there is no formula for "the k smallest": it is a selection problem.' },
      ],
    },
    watch: {
      viz: 'HeapSimViz',
      inputs: [
        { label: '(3,3) (5,−1) (−2,4), k = 2', input: { mode: 'closest', points: [[3, 3], [5, -1], [-2, 4]], k: 2 } },
        { label: '(1,3) (−2,2), k = 1', input: { mode: 'closest', points: [[1, 3], [-2, 2]], k: 1 } },
      ],
    },
    edges: [
      'k = n: [[1, 1]], 1 → [[1,1]].',
      'Negative coordinates: [[1, 3], [−2, 2]], 1 → [[−2,2]].',
      'A point on the origin: [[0, 0], [1, 0]], 1 → [[0,0]].',
    ],
  },

  'task-scheduler': {
    aha: 'The most frequent task sets the shape: its copies need n intervals between them, and the other tasks fill those gaps. Each interval, run the available task with the most copies left (a max-heap), and let it cool down for n intervals in a queue.',
    asks: {
      read: 'Which words set the gap, and which leave you free to reorder?',
      budget: 'Up to 10⁴ tasks but only 26 kinds. What does that say about the heap?',
      observe: 'With AAABBB and n = 2, write A, B and idle slots so that equal tasks are 2 apart.',
      brute: 'Trying every order works. Which task always decides the shape?',
      pattern: 'Which task should run when several are available, and why?',
      watch: 'Watch the busiest task run, cool down, and the gaps fill.',
    },
    read: [
      {
        phrase: 'Two runs of the same task must be separated by at least `n` intervals',
        says: 'Each task has a cooldown; idle intervals appear only when nothing is ready.',
      },
      { phrase: 'Tasks can run in any order', says: 'We choose the order: a greedy choice.' },
      { phrase: 'Return the minimum number of intervals', says: 'Only the count is needed, which also has a direct formula.' },
    ],
    budget: {
      from: 'tasks.length ≤ 10⁴, 26 kinds, n ≤ 100',
      n: 10000,
      aim: 'O(T)',
      note: 'A heap of at most 26 tasks makes each interval O(log 26), effectively constant; the counting formula is O(T).',
    },
    observe: [
      {
        title: 'The most frequent task sets the pace',
        text: 'A appears 3 times and needs 2 intervals between runs: A _ _ A _ _ A. That is already 7 intervals.',
        sketch: {
          kind: 'array',
          rows: [
            {
              items: ['A', '_', '_', 'A', '_', '_', 'A'],
              marks: { '0': 'hit', '1': 'dim', '2': 'dim', '3': 'hit', '4': 'dim', '5': 'dim', '6': 'hit' },
            },
          ],
        },
      },
      {
        title: 'Fill the gaps with other tasks',
        text: 'B also appears 3 times: A B _ A B _ A B. One slot per gap stays idle, and the B after the last A adds one: 8 intervals.',
        sketch: { kind: 'array', rows: [{ items: ['A', 'B', 'idle', 'A', 'B', 'idle', 'A', 'B'], marks: { '2': 'dim', '5': 'dim' } }] },
      },
      {
        title: 'Run the task with the most copies left',
        text: 'Each interval, take the available task with the most copies left (a max-heap of counts); a task that just ran waits n intervals in a cooldown queue. At interval 2 both A and B are cooling down: idle.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'interval 2', items: ['A cooling', 'B cooling'], marks: { '0': 'muted', '1': 'muted' } }],
          caption: 'nothing ready: idle',
        },
      },
    ],
    brute: {
      idea: 'Try every order of the tasks and keep the shortest valid schedule.',
      cost: 'O(T!)',
      waste: 'Almost every order is obviously bad; the most frequent task always decides the shape.',
    },
    pattern: {
      pick: 'heap-patterns',
      why: 'Greedy with a max-heap of counts and a cooldown queue: each interval run the available task with the most copies left, then let it cool n intervals. Or count directly: max(T, (maxCount − 1) × (n + 1) + the number of tasks with maxCount).',
      not: [
        {
          id: 'greedy',
          why: 'The choice (most copies first) is greedy; the heap makes each choice quick, and the formula comes from the same picture.',
        },
        {
          id: 'math-for-interviews',
          why: 'The counting formula is the O(T) answer; it needs the frames-around-the-busiest-task picture to be believable.',
        },
      ],
    },
    watch: {
      viz: 'HeapSimViz',
      inputs: [
        { label: 'AAABBB, n = 2', input: { mode: 'tasks', tasks: 'AAABBB', n: 2 } },
        { label: 'AAAB, n = 2', input: { mode: 'tasks', tasks: 'AAAB', n: 2 } },
      ],
    },
    edges: ['n = 0: AAABBB, 0 → 6.', 'Plenty of other tasks: A A A B C D E F G, 2 → 9; no idle needed.', 'Two tasks tie for most: AAABBB, 2 → 8.'],
  },

  'kth-smallest-element-in-a-sorted-matrix': {
    aha: 'Each row is a sorted list, so the matrix is n sorted lists to merge. Keep each row\'s next value in a min-heap: popping the smallest and pushing the next value from its row produces the values in order. The k-th pop is the answer, with only n values in memory.',
    asks: {
      read: 'Which words tell you the rows are lists you can merge, and what memory to aim for?',
      budget: 'Up to 300 × 300. Flattening fits in time; what about memory?',
      observe: 'Merge the three rows of the example by hand. What is the 8th value?',
      brute: 'Flatten and sort works. What does it ignore, and what does it store?',
      pattern: 'The next smallest value is always at one of the row fronts. Which structure picks the smallest front?',
      watch: 'Watch the row fronts merge through a min-heap; the 8th value out is the answer.',
    },
    read: [
      {
        phrase: 'both every row and every column are sorted in ascending order',
        says: 'Rows are sorted lists (merge them); columns being sorted too allows a staircase count.',
      },
      { phrase: 'Try to use less than O(n²) memory', says: 'No flattening: keep only one candidate per row.' },
      { phrase: 'The matrix can be treated as `n` sorted lists merged with a heap', says: 'The method: k-way merge, stopping after k values.' },
    ],
    budget: {
      from: 'n ≤ 300',
      rows: [['flatten and sort', '9 × 10⁴ log', 'ok', 'fits, O(n²) memory'], ['merge rows with a heap', 'k log n', 'ok', 'O(n) memory']],
      aim: 'O(k log n), O(n) memory',
      note: 'Time is fine either way; the follow-up is about memory.',
    },
    observe: [
      {
        title: 'Each row is a sorted list',
        text: 'Rows [1, 5, 9], [10, 11, 13], [12, 13, 15]: merging them lists every value in order.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'row 0', items: [1, 5, 9] }, { label: 'row 1', items: [10, 11, 13] }, { label: 'row 2', items: [12, 13, 15] }],
        },
      },
      {
        title: 'The next smallest is at one of the row fronts',
        text: 'Keep each row\'s next value in a min-heap: 1, 10, 12. Pop 1 and push 5 from its row; pop 5 and push 9; and so on.',
        sketch: { kind: 'array', rows: [{ label: 'heap of row fronts', items: [1, 10, 12], marks: { '0': 'hit' } }] },
      },
      {
        title: 'Stop at the k-th pop',
        text: 'The pops come out 1, 5, 9, 10, 11, 12, 13, 13: the 8th is 13. The two 13s count separately.',
        sketch: { kind: 'array', rows: [{ items: [1, 5, 9, 10, 11, 12, 13, 13], marks: { '7': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Copy every value into one array, sort it, and take index k − 1.',
      cost: 'O(n² log n) time, O(n²) memory',
      waste: 'It ignores that the rows are already sorted and stores every value, when one candidate per row is enough.',
    },
    pattern: {
      pick: 'heap-patterns',
      why: 'K-way merge: a min-heap of (value, row, column), starting with each row\'s first value; pop k times, pushing the next value of the popped row. O(k log n) time, O(n) memory. Binary searching the value with a staircase count is O(n log range).',
      not: [
        {
          id: 'binary-search-on-answer',
          why: 'Guess a value and count the cells ≤ it by walking a staircase from the bottom-left: O(n log range), the other good answer.',
        },
        { id: 'sorting-and-selection', why: 'Flattening and sorting uses O(n²) memory, which the follow-up asks to avoid.' },
      ],
    },
    watch: { viz: 'KWayMergeViz', inputs: [{ label: 'rows [1,5,9] [10,11,13] [12,13,15]', input: { lists: [[1, 5, 9], [10, 11, 13], [12, 13, 15]] } }] },
    edges: ['k = 1: [[5]], 1 → 5.', 'k = n²: [[1, 2], [3, 4]], 4 → 4.', 'Duplicates count: [[1, 2], [1, 3]], 2 → 1.'],
  },

  'single-threaded-cpu': {
    aha: 'Two orders matter: tasks become available by enqueue time, and the CPU picks the shortest available one. Sort indexes by enqueue time once; as the clock moves, push every arrived task into a min-heap by (processing time, index), run the top, and jump the clock when nothing is available.',
    asks: {
      read: 'Which words describe when the CPU waits, and how it chooses?',
      budget: 'Up to 10⁵ tasks. Can the CPU scan every task each time it is free?',
      observe: 'With tasks [[1,2],[2,4],[3,2],[4,1]], what is available at time 3, and which runs?',
      brute: 'Scanning all unprocessed tasks every time works. What does it rescan?',
      pattern: 'Arrivals come in time order; choices come by length. Which two structures handle those?',
      watch: 'Watch tasks arrive into the heap and the shortest one run.',
    },
    read: [
      {
        phrase: 'if the CPU is idle and no task is available, it stays idle',
        says: 'Time can jump: if nothing has arrived, skip to the next arrival.',
      },
      { phrase: 'once started, a task runs to completion without interruption', says: 'No pre-emption: the clock moves by a whole task at a time.' },
      { phrase: 'Return the order in which the CPU processes the tasks', says: 'The answer is the sequence of popped indexes.' },
    ],
    budget: { from: 'n ≤ 10⁵', n: 100000, aim: 'O(n log n)', note: 'Scanning every task each time the CPU is free is O(n²) = 10¹⁰.' },
    observe: [
      {
        title: 'Two orders matter: arrival and length',
        text: 'Tasks become available by enqueue time; among the available ones the CPU wants the shortest. Sort by arrival once, and keep the available tasks in a min-heap by (length, index).',
        sketch: { kind: 'array', rows: [{ items: ['#0 at 1, 2 long', '#1 at 2, 4 long', '#2 at 3, 2 long', '#3 at 4, 1 long'] }] },
      },
      {
        title: 'Move tasks in as the clock passes them',
        text: 'At time 1 only #0 is there: run it until 3. By 3, #1 and #2 have arrived; #2 is shorter (2 < 4), so it runs until 5.',
        sketch: { kind: 'array', rows: [{ label: 'available at time 3 (shortest first)', items: ['#2 (2)', '#1 (4)'], marks: { '0': 'hit' } }] },
      },
      {
        title: 'Jump over idle gaps',
        text: 'By 5, #3 (length 1) has arrived and beats #1. Order: 0, 2, 3, 1. If nothing were available, the clock would jump straight to the next arrival instead of ticking.',
        sketch: { kind: 'array', rows: [{ items: ['#0', '#2', '#3', '#1'], marks: { '0': 'hit', '1': 'hit', '2': 'hit', '3': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Each time the CPU is free, scan every unprocessed task for the available one with the shortest time (smallest index on ties).',
      cost: 'O(n²)',
      waste: 'Every scan revisits tasks that haven\'t arrived yet and re-compares the same available ones.',
    },
    pattern: {
      pick: 'heap-patterns',
      why: 'Event simulation: sort indexes by enqueue time; while tasks remain, move every arrived task into a min-heap by (processing time, index); if the heap is empty jump the clock to the next arrival, otherwise pop, record and advance the clock. O(n log n).',
      not: [
        {
          id: 'sorting-and-selection',
          why: 'Sorting by length alone ignores arrival times; sorting by arrival alone ignores length. The heap combines them.',
        },
        { id: 'intervals', why: 'Tasks have arrival times but no fixed slots; the CPU decides when each one runs.' },
      ],
    },
    watch: {
      viz: 'HeapSimViz',
      inputs: [
        { label: '[[1,2],[2,4],[3,2],[4,1]]', input: { mode: 'cpu', tasks: [[1, 2], [2, 4], [3, 2], [4, 1]] } },
        { label: 'all at time 7', input: { mode: 'cpu', tasks: [[7, 10], [7, 12], [7, 5], [7, 4], [7, 2]] } },
      ],
    },
    edges: [
      'All arrive together: [[7,10],[7,12],[7,5],[7,4],[7,2]] → [4,3,2,0,1].',
      'A gap: [[1,1],[10,1]] → [0,1]; idle in between.',
      'Equal lengths: [[1,2],[1,2]] → [0,1]; the smaller index first.',
    ],
  },

  'reorganize-string': {
    aha: 'The most frequent letter is the hard one to place, so place it whenever you are allowed. Keep counts in a max-heap and write the top letter, but hold the letter you just wrote out of the heap for one turn. If the heap runs dry while a held letter still has copies, it is impossible.',
    asks: {
      read: 'Which words say when the answer is impossible?',
      budget: 'Only 500 letters. What matters more than speed here?',
      observe: 'In "aaabc", how must the a\'s be placed? Could "aaab" work?',
      brute: 'Trying every permutation works. Which letter makes most of them fail?',
      pattern: 'How do you always pick the letter with the most copies left, but never the one just written?',
      watch: 'Watch letters written from the heap, the last one sitting out a turn.',
    },
    read: [
      { phrase: 'no two adjacent characters are the same', says: 'Each copy of a letter needs a different letter next to it.' },
      { phrase: 'or `""` if it is impossible', says: 'Some inputs have no answer: a letter with more than ⌈n / 2⌉ copies.' },
      {
        phrase: 'three a\'s in four characters always leaves two of them side by side',
        says: 'The impossibility test: the most frequent count against half the length.',
      },
    ],
    budget: {
      from: 's.length ≤ 500',
      rows: [['heap of at most 26 letters', '500 × log 26', 'ok', 'fits']],
      aim: 'O(n log 26)',
      note: 'Small input: the question is the rule, not the speed.',
    },
    observe: [
      {
        title: 'The most frequent letter is the hard one',
        text: 'a appears 3 times in 5 letters: it needs a different letter between each pair, a _ a _ a. With more than ⌈n / 2⌉ copies, there are not enough separators.',
        sketch: { kind: 'array', rows: [{ items: ['a', '_', 'a', '_', 'a'], marks: { '0': 'hit', '1': 'dim', '2': 'hit', '3': 'dim', '4': 'hit' } }] },
      },
      {
        title: 'Place the most plentiful letter whenever allowed',
        text: 'Write the letter with the most copies left, but never the one just written. "aaabc" becomes a, b, a, c, a.',
        sketch: { kind: 'array', rows: [{ items: ['a', 'b', 'a', 'c', 'a'], marks: { '0': 'hit', '2': 'hit', '4': 'hit' } }] },
      },
      {
        title: 'Hold the last letter back for one turn',
        text: 'Keep counts in a max-heap; after writing a letter, keep it out for one turn, then put it back. If the heap runs dry while the held letter still has copies, it is impossible: "aaab" leaves an a with no partner.',
        sketch: { kind: 'array', rows: [{ items: ['a', 'b', 'a', 'a?'], marks: { '3': 'bad' } }], caption: '"aaab" → ""' },
      },
    ],
    brute: {
      idea: 'Try every permutation of s and return one with no equal neighbours.',
      cost: 'O(n! · n)',
      waste: 'Almost every permutation fails around the most frequent letter.',
    },
    pattern: {
      pick: 'heap-patterns',
      why: 'Greedy by frequency with a max-heap of (count, letter): write the top letter, put back the letter written last turn, hold this one back. Or place the most frequent letter on even indexes first. O(n log 26).',
      not: [
        { id: 'greedy', why: 'The rule (most copies first) is greedy; the heap makes "most copies left" quick to find as counts change.' },
        { id: 'sorting-and-selection', why: 'Sorting letters by count once isn\'t enough: the counts change as letters are used.' },
      ],
    },
    watch: {
      viz: 'HeapSimViz',
      inputs: [{ label: '"aaabc"', input: { mode: 'reorg', s: 'aaabc' } }, { label: '"aaab" (impossible)', input: { mode: 'reorg', s: 'aaab' } }],
    },
    edges: ['Impossible: "aaab" → "".', 'One letter: "a" → "a".', 'Exactly ⌈n / 2⌉ copies: "aab" → "aba".'],
  },

  'longest-happy-string': {
    aha: 'Use the most plentiful letter whenever it is allowed: saving it only leaves more of it to place later, when fewer separators remain. It is not allowed when the string already ends with two of it; then use the next most plentiful letter once. Stop when the top is blocked and nothing else is left.',
    asks: {
      read: 'Which words forbid what, and which make "any" answer acceptable?',
      budget: 'Counts up to 100. Is speed a concern?',
      observe: 'With a = 1, b = 1, c = 7, how many c\'s can you fit at most?',
      brute: 'Trying all strings works. Which letter always decides the length?',
      pattern: 'Which letter should go next, and what happens when it would make three in a row?',
      watch: 'Watch the most plentiful letter used until blocked, then a separator.',
    },
    read: [
      { phrase: 'never contains `"aaa"`, `"bbb"` or `"ccc"` as a substring', says: 'At most two of the same letter in a row.' },
      { phrase: 'uses at most `a` letters `"a"`', says: 'Letters may be left over: the goal is the longest string, not using everything.' },
      {
        phrase: 'If several are equally long, return any of them',
        says: 'Any valid longest string is accepted, so when two letters are equally good, either choice is fine.',
      },
    ],
    budget: {
      from: 'a, b, c ≤ 100',
      rows: [['greedy, three letters', 'about 300 steps', 'ok', 'fits']],
      aim: 'O(a + b + c)',
      note: 'Tiny: the question is the rule.',
    },
    observe: [
      {
        title: 'Plenty of one letter needs separators',
        text: 'Seven c\'s can only go in pairs, with something else between pairs. One a and one b make two separators: cc a cc b cc, 8 letters. One c is left over.',
        sketch: { kind: 'array', rows: [{ items: ['c', 'c', 'a', 'c', 'c', 'b', 'c', 'c'], marks: { '2': 'kept', '5': 'kept' } }] },
      },
      {
        title: 'Use the most plentiful letter whenever allowed',
        text: 'Spend c while you can. Saving it would only leave more c\'s to place later, when the separators are already used up.',
        sketch: { kind: 'array', rows: [{ label: 'counts', items: ['c × 7', 'a × 1', 'b × 1'], marks: { '0': 'hit' } }] },
      },
      {
        title: 'Two in a row blocks it once',
        text: 'After "cc", c is blocked: use the next most plentiful letter once (a), then c again. When only c is left and the string ends in "cc", stop.',
        sketch: { kind: 'array', rows: [{ items: ['c', 'c', 'a'], marks: { '2': 'kept' }, tags: { '2': [['c blocked → a', 'warn']] } }] },
      },
    ],
    brute: {
      idea: 'Try every string that can be built from the counts and keep the longest happy one.',
      cost: 'O(3^(a + b + c))',
      waste: 'The answer\'s shape is decided by the most plentiful letter; exploring every string ignores that.',
    },
    pattern: {
      pick: 'heap-patterns',
      why: 'Greedy with a max-heap of (count, letter): take the top letter unless the string ends with two of it; then take the second letter once and put the first back. Stop when the top is blocked and nothing else is left. O(a + b + c).',
      not: [
        { id: 'greedy', why: 'The rule is greedy; with three letters a heap (or re-sorting three counts each step) finds the most plentiful one.' },
        { id: 'dp-state-machine', why: 'A DP over (counts, last two letters) works, but is far bigger than needed.' },
      ],
    },
    watch: {
      viz: 'HeapSimViz',
      inputs: [
        { label: 'a 1, b 1, c 7', input: { mode: 'happy', a: 1, b: 1, c: 7 } },
        { label: 'a 7, b 1, c 0', input: { mode: 'happy', a: 7, b: 1, c: 0 } },
      ],
    },
    edges: ['Only one letter: 0, 0, 5 → "cc".', 'Balanced: 1, 1, 1 → "abc" (any order).', 'One separator: 7, 1, 0 → "aabaa".'],
  },

  'merge-k-sorted-lists': {
    aha: 'Every list is sorted, so the next node of the result is the smallest of the k current fronts. A min-heap of the fronts finds it in O(log k): pop it, link it to the result, push the next node of its list. Each node passes through the heap once: O(N log k).',
    asks: {
      read: 'Which words hand you the method, and which cases must the code handle?',
      budget: 'k up to 10⁴ lists. What does merging them one at a time cost?',
      observe: 'With [1, 4, 5], [1, 3, 4], [2, 6], where can the smallest remaining node be?',
      brute: 'Merging list after list into one result works. What gets walked over again and again?',
      pattern: 'Which structure picks the smallest of k fronts quickly, as the fronts change?',
      watch: 'Watch the smallest front leave the heap and its successor take its place.',
    },
    read: [
      { phrase: 'Merge them into one sorted linked list', says: 'A merge of sorted lists: the next node is always at a front.' },
      { phrase: 'Some lists may be empty', says: 'Skip empty lists when filling the heap.' },
      { phrase: 'A min-heap of the current front nodes always gives the next smallest', says: 'The method, spelled out: k-way merge with a heap.' },
    ],
    budget: {
      from: 'k ≤ 10⁴ lists, N nodes in total',
      rows: [['merge one list at a time', 'k × N', 'bad', 'too slow'], ['min-heap of the k fronts', 'N log k', 'ok', 'fits']],
      aim: 'O(N log k)',
      note: 'Merging into a growing result re-walks that result k times.',
    },
    observe: [
      {
        title: 'The next node is at one of the fronts',
        text: 'Every list is sorted, so the smallest remaining node is one of the k fronts: 1, 1 or 2.',
        sketch: {
          kind: 'array',
          rows: [
            { label: 'list 0', items: [1, 4, 5], marks: { '0': 'cur' } },
            { label: 'list 1', items: [1, 3, 4], marks: { '0': 'cur' } },
            { label: 'list 2', items: [2, 6], marks: { '0': 'cur' } },
          ],
        },
      },
      {
        title: 'Merging in a chain re-walks the result',
        text: 'Merging list 0 with list 1, then the result with list 2, and so on, walks the growing result once per list: O(k · N) when there are many lists.',
        sketch: { kind: 'array', rows: [{ label: 'result size after each merge', items: ['3', '6', '8'] }] },
      },
      {
        title: 'A min-heap of the fronts',
        text: 'Pop the smallest front, link it after the result\'s tail, and push the next node of its list. Each node enters and leaves the heap once.',
        sketch: { kind: 'array', rows: [{ label: 'heap of fronts', items: [1, 1, 2], marks: { '0': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Collect every value, sort, and build a new list.',
      cost: 'O(N log N)',
      waste: 'It ignores that each list is already sorted, and builds new nodes instead of relinking.',
    },
    pattern: {
      pick: 'heap-patterns',
      why: 'K-way merge: a min-heap of the current front nodes; pop the smallest, append it behind a dummy tail, push its successor. O(N log k). Merging pairs of lists, merge-sort style, is also O(N log k).',
      not: [
        { id: 'divide-and-conquer', why: 'Merging in pairs (k lists → k / 2 → … → 1) is the other O(N log k) answer.' },
        { id: 'linked-list-manipulation', why: 'The two-list merge with a dummy node is the inner tool; the heap chooses among k fronts.' },
      ],
    },
    watch: {
      viz: 'KWayMergeViz',
      inputs: [
        { label: '[1,4,5] [1,3,4] [2,6]', input: { lists: [[1, 4, 5], [1, 3, 4], [2, 6]] } },
        { label: 'uneven lists', input: { lists: [[2, 8], [3, 5, 9, 12], [1, 10]] } },
      ],
    },
    edges: ['No lists: [] → [].', 'Only an empty list: [[]] → [].', 'One list: [[1, 2]] → [1, 2].'],
  },

  'find-median-from-data-stream': {
    aha: 'Split the numbers into a lower half and an upper half. A max-heap holds the lower half (its top is the largest small number), a min-heap the upper half (its top is the smallest big number). Keep their sizes within one; the median is a top, or the mean of both tops.',
    asks: {
      read: 'Which words define the median for an even count?',
      budget: 'Up to 10⁵ calls. What does keeping a sorted list cost per add?',
      observe: 'For 1, 3, 5, 8, 15, which values actually decide the median?',
      brute: 'A sorted list works. What does each insert do to the rest of the list?',
      pattern: 'You need the largest of the small half and the smallest of the big half. Which two heaps give those?',
      watch: 'Watch each number join a half and the halves rebalance.',
    },
    read: [
      { phrase: 'returns the median of all numbers added so far', says: 'Answers keep coming as numbers arrive: no sorting all at once.' },
      { phrase: 'the mean of the two middle values when the count is even', says: 'Two middle values may be needed: the top of each half.' },
      { phrase: 'Answers within `10^-5` are accepted', says: 'Return a double; integer division of the two tops would be wrong.' },
    ],
    budget: {
      from: 'at most 10⁵ calls',
      rows: [['sorted list insert', '10⁵ × 10⁵ shifts', 'bad', 'too slow'], ['two heaps', '10⁵ × log', 'ok', 'fits']],
      aim: 'O(log n) per add, O(1) per median',
      note: 'Inserting into a sorted list shifts up to n values every time.',
    },
    observe: [
      {
        title: 'The median splits the numbers in half',
        text: 'For 1, 3, 5, 8, 15 the median is 5. Only the largest of the lower half and the smallest of the upper half matter for it.',
        sketch: {
          kind: 'array',
          rows: [
            {
              items: [1, 3, 5, 8, 15],
              marks: { '2': 'hit' },
              bands: [{ from: 0, to: 2, tone: 'accent', label: 'lower half' }, { from: 3, to: 4, tone: 'ghost', label: 'upper half' }],
            },
          ],
        },
      },
      {
        title: 'Two heaps keep the two halves',
        text: 'A max-heap holds the lower half, top 5; a min-heap holds the upper half, top 8. The lower half keeps the extra value when the count is odd, so the median is its top.',
        sketch: {
          kind: 'array',
          rows: [
            { label: 'lower: max-heap (top first)', items: [5, 3, 1], marks: { '0': 'hit' } },
            { label: 'upper: min-heap (top first)', items: [8, 15] },
          ],
        },
      },
      {
        title: 'Rebalance after each add',
        text: 'Push into the lower half, move its top to the upper half, and if the upper half is now bigger, move its top back. After adding 7: lower {5, 3, 1}, upper {7, 8, 15}, median (5 + 7) / 2 = 6.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'lower', items: [5, 3, 1], marks: { '0': 'hit' } }, { label: 'upper', items: [7, 8, 15], marks: { '0': 'hit' } }],
          caption: 'median = (5 + 7) / 2 = 6',
        },
      },
    ],
    brute: {
      idea: 'Keep a sorted list; insert each number in place and read the middle.',
      cost: 'O(n) per add',
      waste: 'Every insert shifts values whose exact order never matters, only which half they are in.',
    },
    pattern: {
      pick: 'heap-patterns',
      why: 'Two heaps: a max-heap for the lower half and a min-heap for the upper half, balanced so the lower one has the same size or one more. addNum is O(log n); findMedian reads the lower top, or the mean of both tops, in O(1).',
      not: [
        { id: 'sorting-and-selection', why: 'Re-sorting, or quickselect on every query, costs O(n) per call.' },
        { id: 'binary-search', why: 'Binary search finds where a number goes in a sorted list, but inserting there still shifts O(n) values.' },
      ],
    },
    watch: {
      viz: 'MedianViz',
      inputs: [
        { label: '5, 15, 1, 3, 8, 7, 9, 10', input: { a: [5, 15, 1, 3, 8, 7, 9, 10] } },
        { label: 'already sorted', input: { a: [1, 2, 3, 4, 5, 6] } },
      ],
    },
    edges: ['One number: add 1 → median 1.0.', 'Even count: add 1, 2 → median 1.5.', 'Negative numbers: add −1, −2 → median −1.5.'],
  },

  'ipo': {
    aha: 'Profits are never negative, so capital only grows and an affordable project stays affordable. Each round, take the most profitable project you can afford. Sort projects by the capital they need; as capital grows, unlock them into a max-heap of profits and take its top.',
    asks: {
      read: 'Which words say what you can start, and what finishing gives you?',
      budget: 'k and n up to 10⁵. Can you rescan every project each round?',
      observe: 'With w = 0, profits [1, 2, 3], capital [0, 1, 1] and k = 2, which projects can you do, in what order?',
      brute: 'Scanning for the best affordable project each round works. What gets rescanned?',
      pattern: 'Projects unlock in order of capital needed; choices go by profit. Which two structures handle those?',
      watch: 'Watch projects unlock as capital grows, and the best one taken each round.',
    },
    read: [
      { phrase: 'may complete at most `k` distinct projects', says: 'At most k rounds; each project once.' },
      {
        phrase: 'Project `i` can only be started if your current capital is at least `capital[i]`',
        says: 'A project unlocks once capital reaches its requirement, and stays unlocked.',
      },
      {
        phrase: 'finishing it adds `profits[i]` to your capital',
        says: 'Capital never shrinks, so taking the biggest profit now never hurts later.',
      },
    ],
    budget: {
      from: 'k, n ≤ 10⁵',
      rows: [['scan all projects each round', '10⁵ × 10⁵', 'bad', 'too slow'], ['sort + max-heap', '(n + k) log n', 'ok', 'fits']],
      aim: 'O((n + k) log n)',
      note: 'Each round should cost O(log n), not a full scan.',
    },
    observe: [
      {
        title: 'Capital only grows',
        text: 'Profits are never negative, so after any project you can still afford everything you could before, and maybe more.',
        sketch: { kind: 'array', rows: [{ items: ['#0 needs 0', '#1 needs 1', '#2 needs 1'] }] },
      },
      {
        title: 'Take the most profitable affordable project',
        text: 'With 0 capital only #0 (+1) is affordable: take it, capital 1. Now #1 (+2) and #2 (+3) unlock; take #2: capital 4.',
        sketch: {
          kind: 'array',
          rows: [
            { label: 'round 1: affordable', items: ['+1'], marks: { '0': 'hit' } },
            { label: 'round 2: affordable', items: ['+2', '+3'], marks: { '1': 'hit' } },
          ],
        },
      },
      {
        title: 'Unlock by capital, pick from a max-heap',
        text: 'Sort projects by the capital they need. As capital grows, move the newly affordable ones into a max-heap of profits; each round, take its top.',
        sketch: { kind: 'array', rows: [{ label: 'max-heap after capital 1 (top first)', items: ['+3', '+2'], marks: { '0': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Each round, scan every unused project for the most profitable one you can afford.',
      cost: 'O(k · n)',
      waste: 'Every round rescans projects that are still locked or were already compared.',
    },
    pattern: {
      pick: 'heap-patterns',
      why: 'Two-stage greedy: sort projects by required capital; each round push every newly affordable profit into a max-heap and take the top. Stop early if nothing is affordable. O((n + k) log n).',
      not: [
        { id: 'greedy', why: 'Taking the best affordable project is the greedy choice; the sort and the heap make each round fast.' },
        { id: 'dp-knapsack', why: 'Choosing projects looks like a knapsack, but capital only grows, so no choice ever needs to be undone.' },
      ],
    },
    watch: {
      viz: 'HeapSimViz',
      inputs: [
        { label: 'k 2, w 0, [1,2,3], [0,1,1]', input: { mode: 'ipo', k: 2, w: 0, profits: [1, 2, 3], capital: [0, 1, 1] } },
        { label: 'k 3, w 0, [1,2,3], [0,1,2]', input: { mode: 'ipo', k: 3, w: 0, profits: [1, 2, 3], capital: [0, 1, 2] } },
      ],
    },
    edges: [
      'Nothing affordable: k 1, w 0, [1], [1] → 0.',
      'k more than the projects: k 5, w 0, [1, 2], [0, 0] → 3.',
      'Everything affordable at once: k 2, w 10, [1, 5, 3], [0, 0, 0] → 18.',
    ],
  },
};
