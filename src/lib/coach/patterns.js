/**
 * The Daily Coach's view of the 36 DSA pattern lessons: a short name for drill answers and, for each
 * pattern, the patterns learners most often mistake it for (wrong answers in recognition drills).
 * Ids are the pattern lesson ids (src/curriculum/tracks/dsa.js); every judged problem belongs to one
 * (src/data/problems/index.json).
 */
export const PATTERNS = {
  hashing: { name: 'Hash map / set', confused: ['two-pointers', 'sorting-and-selection', 'prefix-sums', 'sliding-window'] },
  'two-pointers': { name: 'Two pointers', confused: ['sliding-window', 'hashing', 'binary-search', 'fast-slow-pointers'] },
  'sliding-window': { name: 'Sliding window', confused: ['two-pointers', 'prefix-sums', 'hashing', 'monotonic-stack'] },
  'prefix-sums': { name: 'Prefix sums', confused: ['sliding-window', 'hashing', 'range-queries', 'dp-linear'] },
  intervals: { name: 'Intervals: sort and sweep', confused: ['greedy', 'sorting-and-selection', 'heap-patterns', 'prefix-sums'] },
  'binary-search': { name: 'Binary search', confused: ['binary-search-on-answer', 'two-pointers', 'bst-patterns', 'sorting-and-selection'] },
  'binary-search-on-answer': { name: 'Binary search on the answer', confused: ['binary-search', 'greedy', 'dp-linear', 'sliding-window'] },
  'sorting-and-selection': { name: 'Sorting as a tool', confused: ['heap-patterns', 'hashing', 'greedy', 'intervals'] },
  'fast-slow-pointers': { name: 'Fast & slow pointers', confused: ['two-pointers', 'linked-list-manipulation', 'hashing', 'math-for-interviews'] },
  'linked-list-manipulation': { name: 'Linked-list reversal & dummy nodes', confused: ['fast-slow-pointers', 'two-pointers', 'stack-patterns', 'design-data-structures'] },
  'stack-patterns': { name: 'Stack', confused: ['monotonic-stack', 'two-pointers', 'dp-linear', 'tree-dfs'] },
  'monotonic-stack': { name: 'Monotonic stack / queue', confused: ['stack-patterns', 'sliding-window', 'heap-patterns', 'two-pointers'] },
  'heap-patterns': { name: 'Heap: top-k, k-way merge, two heaps', confused: ['sorting-and-selection', 'greedy', 'binary-search', 'intervals'] },
  'tree-dfs': { name: 'Tree DFS', confused: ['tree-bfs', 'bst-patterns', 'dp-trees-intervals', 'backtracking'] },
  'tree-bfs': { name: 'Tree BFS (level by level)', confused: ['tree-dfs', 'graph-traversal', 'bst-patterns', 'heap-patterns'] },
  'bst-patterns': { name: 'Binary search tree', confused: ['tree-dfs', 'binary-search', 'tree-bfs', 'sorting-and-selection'] },
  'graph-traversal': { name: 'Graph / grid BFS & DFS', confused: ['shortest-paths', 'union-find', 'backtracking', 'dp-grid'] },
  'topological-sort': { name: 'Topological sort', confused: ['graph-traversal', 'union-find', 'shortest-paths', 'greedy'] },
  'union-find': { name: 'Union-find', confused: ['graph-traversal', 'topological-sort', 'hashing', 'shortest-paths'] },
  'shortest-paths': { name: 'Shortest paths (Dijkstra, 0-1 BFS)', confused: ['graph-traversal', 'dp-grid', 'union-find', 'binary-search-on-answer'] },
  backtracking: { name: 'Backtracking', confused: ['dp-made-easy', 'graph-traversal', 'dp-state-machine', 'greedy'] },
  'dp-made-easy': { name: 'Basic DP (memo, then table)', confused: ['dp-linear', 'backtracking', 'math-for-interviews', 'greedy'] },
  'dp-linear': { name: '1D DP', confused: ['greedy', 'dp-knapsack', 'sliding-window', 'dp-state-machine'] },
  'dp-knapsack': { name: 'Knapsack DP', confused: ['backtracking', 'dp-linear', 'greedy', 'dp-grid'] },
  'dp-grid': { name: 'Grid DP', confused: ['graph-traversal', 'shortest-paths', 'dp-strings', 'dp-linear'] },
  'dp-strings': { name: 'String DP (two indexes)', confused: ['two-pointers', 'sliding-window', 'dp-linear', 'string-matching'] },
  'dp-trees-intervals': { name: 'Tree & interval DP', confused: ['tree-dfs', 'dp-strings', 'greedy', 'backtracking'] },
  'dp-state-machine': { name: 'State-machine / bitmask DP', confused: ['greedy', 'dp-linear', 'backtracking', 'graph-traversal'] },
  greedy: { name: 'Greedy', confused: ['dp-linear', 'sorting-and-selection', 'heap-patterns', 'two-pointers'] },
  tries: { name: 'Trie', confused: ['hashing', 'backtracking', 'string-matching', 'bit-manipulation'] },
  'bit-manipulation': { name: 'Bit manipulation', confused: ['hashing', 'math-for-interviews', 'dp-linear', 'two-pointers'] },
  'design-data-structures': { name: 'Design a data structure', confused: ['hashing', 'heap-patterns', 'stack-patterns', 'linked-list-manipulation'] },
  'matrix-simulation': { name: 'Matrix simulation', confused: ['graph-traversal', 'dp-grid', 'binary-search', 'two-pointers'] },
  'math-for-interviews': { name: 'Math', confused: ['bit-manipulation', 'dp-made-easy', 'binary-search', 'greedy'] },
  'string-matching': { name: 'String matching (KMP, rolling hash)', confused: ['sliding-window', 'hashing', 'dp-strings', 'tries'] },
  'range-queries': { name: 'Range queries (Fenwick / segment tree)', confused: ['prefix-sums', 'sorting-and-selection', 'heap-patterns', 'binary-search'] },
};

/** First-visit placement: one drill in each of these core patterns. */
export const PLACEMENT = ['hashing', 'two-pointers', 'sliding-window', 'binary-search', 'linked-list-manipulation', 'stack-patterns', 'tree-dfs', 'graph-traversal', 'heap-patterns', 'dp-linear'];

/**
 * Growth classes for the complexity question, slowest first. The rule a learner applies: the worst
 * case of the standard solution, with every size in the input counted as n (m·n counts as n²).
 */
export const CX = [
  { id: '1', label: 'O(1)' },
  { id: 'logn', label: 'O(log n)' },
  { id: 'n', label: 'O(n)' },
  { id: 'nlogn', label: 'O(n log n)' },
  { id: 'n2', label: 'O(n²)' },
  { id: 'n2logn', label: 'O(n² log n)' },
  { id: 'n3', label: 'O(n³)' },
  { id: 'exp', label: 'O(2ⁿ) or similar' },
  { id: 'fact', label: 'O(n!)' },
];
export const CX_IDS = CX.map((c) => c.id);
export const cxLabel = (id) => CX.find((c) => c.id === id)?.label ?? id;
