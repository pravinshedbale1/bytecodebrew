export default {
  'last-stone-weight': {
    statement: `Each element of \`stones\` is the weight of a stone. Repeatedly take the two heaviest stones, with weights \`x ≤ y\`, and smash them together:

- if \`x == y\`, both stones are destroyed,
- otherwise the lighter stone is destroyed and the heavier one now weighs \`y − x\`.

When at most one stone is left, return its weight, or \`0\` if none remain.`,
    constraints: ['1 <= stones.length <= 30', '1 <= stones[i] <= 1000'],
    hints: [
      'You need the two largest values over and over, while the collection changes.',
      'A max-heap (PriorityQueue with a reversed comparator) gives you the largest in O(log n).',
      'Poll two, push back the difference if it is non-zero, and repeat while the heap has at least two stones.',
    ],
  },
  'kth-largest-element-in-a-stream': {
    statement: `Design \`KthLargest\`, which tracks the \`k\`-th largest value in a stream of numbers (in sorted order, so duplicates count):

- \`KthLargest(int k, int[] nums)\` starts with the values in \`nums\`,
- \`int add(int val)\` adds \`val\` to the stream and returns the current \`k\`-th largest value.

\`add\` is only called when at least \`k\` values exist after adding. The tests call the class with a list of operations and their arguments.`,
    constraints: ['0 ≤ nums.length ≤ 10⁴', '1 ≤ k ≤ nums.length + 1', '-10⁴ ≤ nums[i], val ≤ 10⁴', 'At most 10^4 calls to add'],
    hints: [
      'You do not need all the values, only the k largest ones.',
      'Keep a min-heap of size k: its smallest element is the k-th largest overall.',
      'On add, push the value and pop while the heap has more than k elements; then return the top.',
    ],
  },
  'kth-largest-element-in-an-array': {
    statement: `Return the \`k\`-th largest element of \`nums\`. This means the \`k\`-th element in sorted (descending) order, not the \`k\`-th distinct value, so duplicates count.

Sorting is O(n log n). Try to do better.`,
    constraints: ['1 <= nums.length <= 1e5', '1 <= k <= nums.length', '-1e4 <= nums[i] <= 1e4'],
    hints: [
      'A min-heap holding the k largest values seen so far gives O(n log k).',
      'Quickselect partitions around a pivot like quicksort but only recurses into the side that contains position n − k: average O(n).',
      'Pick a random pivot (or use three-way partitioning) so arrays with many equal values or already-sorted input do not degrade to O(n²). Since values are small, counting sort is also O(n).',
    ],
  },
  'top-k-frequent-elements': {
    statement: `Return the \`k\` values that occur most often in \`nums\`, in any order.

The answer is unique: there is no tie at the boundary. Try to beat O(n log n).`,
    constraints: ['1 <= nums.length <= 1e5', '-1e4 <= nums[i] <= 1e4', '1 ≤ k ≤ number of distinct values'],
    hints: [
      'Start by counting each value with a HashMap.',
      'A min-heap of size k ordered by count keeps the k most frequent values: O(n log k).',
      'For O(n), use bucket sort: bucket[c] lists the values that occur c times. Walk the buckets from the highest count down until you have k values.',
    ],
  },
  'k-closest-points-to-origin': {
    statement: `\`points[i] = [x, y]\` is a point on the plane. Return the \`k\` points closest to the origin \`(0, 0)\` by Euclidean distance, in any order.

The answer is unique for every test (no ties at the boundary).`,
    constraints: ['1 <= points.length <= 1e4', '1 <= k <= points.length', '-1e4 <= points[i][j] <= 1e4'],
    hints: [
      'Compare squared distances x² + y²; the square root does not change the order.',
      'A max-heap of size k, ordered by distance, keeps the k closest points seen so far: pop the farthest whenever it grows past k.',
      'Quickselect on the distances gives average O(n).',
    ],
  },
  'task-scheduler': {
    statement: `\`tasks\` lists CPU tasks, each named by an uppercase letter. Each task takes one interval. In every interval the CPU either runs one task or stays idle.

Two runs of the same task must be separated by at least \`n\` intervals. Tasks can run in any order. Return the minimum number of intervals needed to finish all of them.`,
    constraints: ['1 <= tasks.length <= 1e4', '`tasks[i]` is an uppercase English letter', '0 <= n <= 100'],
    hints: [
      'The most frequent task decides the shape: its runs must be spread out with n slots in between.',
      'If the highest count is maxCount and m tasks share it, the frame (maxCount − 1) × (n + 1) + m is a lower bound.',
      'The answer is max(tasks.length, that frame): if there are enough other tasks, no idle slots are needed at all.',
    ],
  },
  'kth-smallest-element-in-a-sorted-matrix': {
    statement: `\`matrix\` is \`n × n\`, and both every row and every column are sorted in ascending order. Return the \`k\`-th smallest value in the whole matrix, counting duplicates.

Try to use less than O(n²) memory.`,
    constraints: ['1 <= matrix.length <= 300', '-1e9 <= matrix[i][j] <= 1e9', '1 ≤ k ≤ n²'],
    hints: [
      'Each row is a sorted list, so this is like merging n sorted lists and stopping at the k-th value.',
      'A min-heap seeded with the first element of each row, popping k times and pushing the next element of the same row, takes O(k log n).',
      'Alternatively binary-search on the value: count how many entries are ≤ mid by walking a staircase from the bottom-left corner in O(n).',
    ],
  },
  'merge-k-sorted-lists': {
    statement: `\`lists\` holds \`k\` linked lists, each sorted in ascending order. Merge them into one sorted linked list and return its head.

Some lists may be empty, and \`lists\` itself may be empty.`,
    constraints: ['0 <= lists.length <= 1e4', '0 <= lists[i].length <= 500', '-1e6 <= lists[i][j] <= 1e6', 'Each list is sorted in ascending order'],
    hints: [
      'Merging lists one at a time into a growing result repeats work: O(k · N).',
      'Keep the current head of every list in a min-heap. Repeatedly take the smallest node, append it, and push its successor.',
      'That is O(N log k) for N nodes in total. Merging lists in pairs, like merge sort, has the same complexity.',
    ],
  },
  'find-median-from-data-stream': {
    statement: `Design \`MedianFinder\`:

- \`MedianFinder()\` creates an empty structure,
- \`void addNum(int num)\` adds a number,
- \`double findMedian()\` returns the median of all numbers added so far: the middle value, or the mean of the two middle values when the count is even.

\`findMedian\` is only called after at least one \`addNum\`. Answers within \`10^-5\` are accepted. The tests call the class with a list of operations and their arguments.`,
    constraints: ['-1e5 ≤ num ≤ 1e5', 'At most 10^5 calls in total'],
    hints: [
      'Keeping a sorted list costs O(n) per insert. You only ever need the middle.',
      'Use two heaps: a max-heap for the smaller half and a min-heap for the larger half.',
      'After each insert, rebalance so the max-heap has the same size as the min-heap or one more. The median is the max-heap top, or the average of both tops.',
    ],
  },
  'ipo': {
    statement: `You start with capital \`w\` and may complete at most \`k\` distinct projects, one after another. Project \`i\` can only be started if your current capital is at least \`capital[i]\`; finishing it adds \`profits[i]\` to your capital.

Return the largest capital you can have at the end.`,
    constraints: ['1 <= k <= 1e5', '0 <= w <= 1e9', '1 <= profits.length <= 1e5', 'capital.length == profits.length', '0 <= profits[i] <= 1e4', '0 <= capital[i] <= 1e9'],
    hints: [
      'Capital never decreases, so the set of projects you can afford only grows over time.',
      'Greedily pick, each round, the most profitable project you can currently afford.',
      'Sort projects by required capital. Each round, push every newly affordable project\'s profit into a max-heap, then take the top. Stop early if the heap is empty.',
    ],
  },
  'single-threaded-cpu': {
    statement: `\`tasks[i] = [enqueueTime_i, processingTime_i]\` describes task \`i\`: it becomes available at time \`enqueueTime_i\` and takes \`processingTime_i\` units to finish.

A single-threaded CPU processes at most one task at a time:

- if the CPU is idle and no task is available, it stays idle;
- if the CPU is idle and tasks are available, it picks the one with the **shortest processing time**, breaking ties by the **smallest index**;
- once started, a task runs to completion without interruption, and the CPU can pick the next task the moment it finishes.

Return the order in which the CPU processes the tasks.`,
    constraints: ['n == tasks.length', '1 <= n <= 1e5', '1 <= tasks[i][j] <= 1e9'],
    hints: [
      'Simulate time. Sort the task indices by enqueue time so you can add newly available tasks in order.',
      'Keep the available tasks in a min-heap ordered by (processing time, index). Whenever the CPU is free, pop the top.',
      'If the heap is empty, jump the clock forward to the next enqueue time instead of ticking one unit at a time. Use a 64-bit clock: total processing time can reach 10¹⁴.',
    ],
  },
  'reorganize-string': {
    statement: `Rearrange the characters of \`s\` so that no two adjacent characters are the same. Return any valid arrangement, or \`""\` if it is impossible.`,
    constraints: ['1 <= s.length <= 500', '`s` has only lowercase English letters'],
    hints: [
      'When is it impossible? Think about the most frequent letter: it needs a different letter between every two of its copies.',
      'It is possible exactly when the highest count is at most ⌈n / 2⌉, that is (n + 1) / 2 in integer division.',
      'Place the most frequent letter at indices 0, 2, 4, …, then keep filling the remaining even indices and wrap around to the odd ones with the other letters. Alternatively, greedily take the two most frequent letters from a max-heap each round.',
    ],
  },
  'longest-happy-string': {
    statement: `A string is **happy** if it contains only the letters \`"a"\`, \`"b"\` and \`"c"\` and never contains \`"aaa"\`, \`"bbb"\` or \`"ccc"\` as a substring.

Given \`a\`, \`b\` and \`c\`, return the **longest** happy string that uses at most \`a\` letters \`"a"\`, at most \`b\` letters \`"b"\` and at most \`c\` letters \`"c"\`. If several are equally long, return any of them. If none exists, return \`""\`.`,
    constraints: ['0 <= a, b, c <= 100', 'a + b + c > 0'],
    hints: [
      'Greedy: at every step, try to use the letter you have the most of left, because that is the one most likely to be stranded.',
      'If the last two letters you wrote are already that letter, use the letter with the second-highest count instead (if any remain).',
      'Stop when neither choice is possible. A max-heap of (count, letter), or simply sorting three counts each step, finds the top two.',
    ],
  },
};
