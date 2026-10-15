/**
 * DSA track — pattern-first, Java only.
 *
 * Ordering matters: lessons are listed in the order a learner should study them.
 * A lesson becomes readable as soon as src/content/dsa/<courseId>/<lessonId>.mdx exists.
 */

const L = (id, title, summary, minutes, level) => ({ id, title, summary, minutes, level });

const startHere = {
  id: 'start-here',
  title: 'DSA Without Fear',
  shortTitle: 'Start Here',
  description:
    'The mindset, method and tools that make DSA learnable: why it feels hard, how to practise, Big-O in plain words, and recursion without the fear.',
  outcomes: [
    'Know why DSA feels hard and what actually fixes it',
    'Use one repeatable framework on any problem, including when you are stuck',
    'Read the input constraints and know the target complexity before writing code',
    'Write recursion by trusting the function instead of tracing every call',
    'Use the Java collections that matter for interviews, without the classic pitfalls',
  ],
  modules: [
    {
      id: 'mindset',
      title: 'Mindset & Method',
      description: 'Break the myths, then learn how to practise and how to attack a problem you have never seen.',
      lessons: [
        L('dsa-is-not-hard', 'Why DSA Feels Hard (and Why It Isn\'t)', 'The real reasons people struggle, the myths that make it worse, and the pattern-first way out.', 12, 'Beginner'),
        L('how-to-practice', 'How to Practise So It Sticks', 'Fewer problems, better reps: the three-pass method, spaced revision and when to look at the answer.', 12, 'Beginner'),
        L('problem-solving-framework', 'A Framework for Any Problem', 'Understand, brute force, spot the pattern, optimise, code, test — and a playbook for when you are stuck.', 15, 'Beginner'),
      ],
    },
    {
      id: 'toolkit',
      title: 'The Toolkit',
      description: 'The three tools every pattern relies on: complexity, recursion and Java collections.',
      lessons: [
        L('complexity-made-easy', 'Big-O the Easy Way', 'Count loops, not symbols — and read the constraints to know which complexity the problem wants.', 16, 'Beginner'),
        L('recursion-made-easy', 'Recursion Without Fear', 'Trust the function: base case, smaller problem, combine. Recursion trees and the call stack.', 16, 'Beginner'),
        L('java-dsa-toolkit', 'Java Toolkit for DSA', 'The collections and idioms you will use in every problem, and the pitfalls that cost marks.', 14, 'Beginner'),
      ],
    },
  ],
};

const dataStructures = {
  id: 'data-structures',
  title: 'Data Structures Basics',
  shortTitle: 'Data Structures',
  description:
    'What each data structure is, how it sits in memory, its types, what every operation costs and which Java class to use, with step-through visuals. Read the one you need before its patterns.',
  outcomes: [
    'Picture how arrays, linked lists, hash tables, trees, heaps and graphs are laid out',
    'State the cost of every common operation and explain why',
    'Name the types of each structure (singly vs doubly, BST vs heap, directed vs undirected…)',
    'Pick the right Java class for a job and avoid the legacy ones',
    'Choose a data structure from the operations a problem needs',
  ],
  modules: [
    {
      id: 'linear',
      title: 'Linear Structures',
      description: 'Elements in a sequence: by position, by link, by order of arrival, or by key.',
      lessons: [
        L('arrays-and-strings', 'Arrays & Strings', 'Contiguous memory, O(1) indexing, dynamic arrays that double, 2D arrays and immutable strings.', 14, 'Beginner'),
        L('linked-lists', 'Linked Lists', 'Nodes and pointers: singly, doubly and circular lists, and when they beat arrays.', 14, 'Beginner'),
        L('stacks-and-queues', 'Stacks & Queues', 'Last-in-first-out and first-in-first-out, deques, and how both are built on arrays.', 12, 'Beginner'),
        L('hash-tables', 'Hash Tables', 'Hash functions, buckets, collisions and resizing: why lookups are O(1) on average.', 16, 'Beginner'),
      ],
    },
    {
      id: 'hierarchical',
      title: 'Trees, Heaps & Graphs',
      description: 'Structures with branches: hierarchies, priority orders and networks.',
      lessons: [
        L('trees', 'Trees', 'Vocabulary, the types of tree, binary search trees and the four traversals.', 18, 'Beginner'),
        L('heaps', 'Heaps & Priority Queues', 'A complete tree stored in an array: always know the minimum, in O(log n) per change.', 14, 'Beginner'),
        L('graphs', 'Graphs', 'Nodes and edges: directed, weighted, cyclic; adjacency lists vs matrices; BFS and DFS.', 18, 'Beginner'),
      ],
    },
    {
      id: 'choosing',
      title: 'Putting It Together',
      description: 'From "what operations do I need?" to the right structure.',
      lessons: [
        L('choosing-a-data-structure', 'Choosing a Data Structure', 'One table of every structure and operation, and a decision guide for picking one.', 12, 'Beginner'),
      ],
    },
  ],
};

const patterns = {
  id: 'patterns',
  title: 'Problem-Solving Patterns',
  shortTitle: 'Patterns',
  description:
    'About 35 patterns cover the large majority of interview problems. Each lesson shows how to spot the pattern, why it works, one reusable template and a practice ladder.',
  outcomes: [
    'Recognise the pattern from the wording and the constraints of a problem',
    'Reuse one template per pattern instead of memorising hundreds of solutions',
    'Explain why each pattern is correct and what it costs',
    'Avoid the classic off-by-one, overflow and edge-case traps',
    'Climb from easy to hard problems in every pattern with a curated ladder',
  ],
  modules: [
    {
      id: 'arrays-strings',
      title: 'Arrays & Strings',
      description: 'The most common interview category. Five patterns turn most O(n²) brute forces into O(n).',
      lessons: [
        L('hashing', 'Hash Maps & Sets', 'Trade memory for time: "have I seen this?", counting, and grouping in O(1).', 18, 'Beginner'),
        L('two-pointers', 'Two Pointers', 'Two indexes moving toward each other or in the same direction to avoid nested loops.', 20, 'Beginner'),
        L('sliding-window', 'Sliding Window', 'Grow the window, shrink when it breaks the rule — for subarrays and substrings.', 22, 'Intermediate'),
        L('prefix-sums', 'Prefix Sums & Difference Arrays', 'Answer range-sum questions in O(1) and count subarrays with a hash map.', 18, 'Intermediate'),
        L('intervals', 'Intervals', 'Sort by start, then merge, insert or sweep — meeting rooms and overlaps.', 16, 'Intermediate'),
      ],
    },
    {
      id: 'searching-sorting',
      title: 'Searching & Sorting',
      description: 'Binary search is far more than finding a number in a sorted array.',
      lessons: [
        L('binary-search', 'Binary Search', 'One bug-free template: find the first position where a condition becomes true.', 20, 'Beginner'),
        L('binary-search-on-answer', 'Binary Search on the Answer', 'When the answer is a number and "can I do it with X?" is monotonic.', 18, 'Intermediate'),
        L('sorting-and-selection', 'Sorting as a Tool', 'Custom comparators, counting sort and quickselect for the k-th element.', 16, 'Intermediate'),
      ],
    },
    {
      id: 'linked-lists',
      title: 'Linked Lists',
      description: 'Two techniques solve almost every linked-list question.',
      lessons: [
        L('fast-slow-pointers', 'Fast & Slow Pointers', 'Cycles, middles and the k-th from the end with two runners at different speeds.', 16, 'Beginner'),
        L('linked-list-manipulation', 'In-Place Reversal & Dummy Nodes', 'Reverse, merge and reorder lists without losing a pointer.', 18, 'Intermediate'),
      ],
    },
    {
      id: 'stacks-queues',
      title: 'Stacks & Queues',
      description: 'Last-in-first-out for matching and parsing; monotonic stacks for "next greater".',
      lessons: [
        L('stack-patterns', 'Stack Patterns', 'Matching brackets, evaluating expressions and simulating undo.', 16, 'Beginner'),
        L('monotonic-stack', 'Monotonic Stack & Queue', 'Next greater element, histograms and sliding-window maximum in O(n).', 22, 'Intermediate'),
      ],
    },
    {
      id: 'heaps',
      title: 'Heaps',
      description: 'When you need the smallest or largest quickly, again and again.',
      lessons: [
        L('heap-patterns', 'Heaps: Top-K, K-Way Merge, Two Heaps', 'Keep only k items, merge sorted streams, and track a running median.', 22, 'Intermediate'),
      ],
    },
    {
      id: 'trees',
      title: 'Trees',
      description: 'Think in subtrees: most tree problems are three lines of recursion.',
      lessons: [
        L('tree-dfs', 'Tree DFS: Think in Subtrees', 'Return values up, pass constraints down — depth, paths, diameter and LCA.', 24, 'Intermediate'),
        L('tree-bfs', 'Tree BFS: Level by Level', 'Level-order traversal and every "per level" question.', 14, 'Beginner'),
        L('bst-patterns', 'Binary Search Trees', 'In-order is sorted: validation, k-th smallest and searching with bounds.', 16, 'Intermediate'),
      ],
    },
    {
      id: 'graphs',
      title: 'Graphs',
      description: 'Grids are graphs too. Four patterns cover nearly every graph interview question.',
      lessons: [
        L('graph-traversal', 'Graphs & Grids: BFS and DFS', 'Islands, flood fill, shortest steps in a grid and multi-source BFS.', 24, 'Intermediate'),
        L('topological-sort', 'Topological Sort', 'Order tasks with dependencies and detect cycles (Kahn\'s algorithm).', 18, 'Intermediate'),
        L('union-find', 'Union-Find', 'Group things that are connected, fast — with path compression.', 16, 'Intermediate'),
        L('shortest-paths', 'Shortest Paths', 'BFS for unweighted, Dijkstra for weighted, 0-1 BFS for in between.', 20, 'Advanced'),
      ],
    },
    {
      id: 'backtracking',
      title: 'Backtracking',
      description: 'Choose, explore, un-choose — one template for subsets, permutations and puzzles.',
      lessons: [
        L('backtracking', 'Backtracking', 'Subsets, combinations, permutations and constraint puzzles with one template.', 24, 'Intermediate'),
      ],
    },
    {
      id: 'dynamic-programming',
      title: 'Dynamic Programming',
      description: 'DP is recursion plus memory. Learn to find the state and the rest follows.',
      lessons: [
        L('dp-made-easy', 'DP Without Fear', 'From brute-force recursion to memoisation to a table, in four mechanical steps.', 24, 'Intermediate'),
        L('dp-linear', '1D DP', 'Climbing stairs, house robber, maximum subarray and longest increasing subsequence.', 22, 'Intermediate'),
        L('dp-knapsack', 'Knapsack Family', 'Take it or leave it: subset sum, coin change and their variants.', 22, 'Intermediate'),
        L('dp-grid', 'Grid DP', 'Paths and costs on a grid, and how to save memory with one row.', 16, 'Intermediate'),
        L('dp-strings', 'String DP', 'Two strings, two indexes: LCS, edit distance and palindromes.', 24, 'Advanced'),
        L('dp-trees-intervals', 'Tree & Interval DP', 'DP on subtrees (house robber III, cameras) and on ranges (burst balloons, cutting sticks).', 24, 'Advanced'),
        L('dp-state-machine', 'State-Machine & Bitmask DP', 'Stock problems as a few states per day, and subsets of a small set as the state.', 22, 'Advanced'),
      ],
    },
    {
      id: 'greedy-special',
      title: 'Greedy & Special Topics',
      description: 'When a local choice is safe, plus two data structures that appear often enough to learn.',
      lessons: [
        L('greedy', 'Greedy', 'Make the best local choice — and how to convince yourself it is safe.', 18, 'Intermediate'),
        L('tries', 'Tries', 'Prefix trees for autocomplete, word search and prefix counting.', 16, 'Intermediate'),
        L('bit-manipulation', 'Bit Manipulation', 'XOR tricks, masks and counting bits — the handful that interviews use.', 14, 'Intermediate'),
      ],
    },
    {
      id: 'advanced',
      title: 'Design, Matrices & Advanced Topics',
      description: 'The remaining interview favourites: design-a-data-structure, matrix simulation, maths, string matching and range queries.',
      lessons: [
        L('design-data-structures', 'Designing Data Structures', 'LRU and LFU caches, O(1) random sets, time-based maps and iterators — combine two structures.', 26, 'Intermediate'),
        L('matrix-simulation', 'Matrix & Simulation', 'Spiral order, rotation, in-place markers and the Game of Life — index bookkeeping without bugs.', 18, 'Intermediate'),
        L('math-for-interviews', 'Math for Interviews', 'GCD, primes and the sieve, fast power, modular arithmetic, overflow, and random sampling.', 22, 'Intermediate'),
        L('string-matching', 'String Matching: KMP & Rolling Hash', 'Find a pattern in O(n + m) with the failure table, and compare substrings in O(1) with hashing.', 22, 'Advanced'),
        L('range-queries', 'Range Queries: Fenwick & Segment Trees', 'Prefix sums that survive updates: O(log n) update and query, and counting inversions.', 22, 'Advanced'),
      ],
    },
  ],
};

const playbook = {
  id: 'playbook',
  title: 'Interview Playbook',
  shortTitle: 'Playbook',
  description: 'Pick the pattern under pressure, follow a study plan, and communicate like a strong candidate.',
  outcomes: [
    'Choose a pattern from a problem statement in under two minutes',
    'Follow a realistic week-by-week plan with a curated problem list',
    'Talk through a solution the way interviewers score it',
    'Track every practice problem you have solved, per pattern',
  ],
  modules: [
    {
      id: 'interview',
      title: 'Interview Playbook',
      description: 'Everything that turns pattern knowledge into offers.',
      lessons: [
        L('pattern-picker', 'The Pattern Picker', 'Signals in the wording and constraints that point to each pattern — a decision guide.', 16, 'Intermediate'),
        L('study-plan', 'A 10-Week Study Plan', 'What to study each week, which problems to solve and how to revise.', 14, 'Beginner'),
        L('interview-communication', 'Solving Out Loud', 'How DSA interviews are scored and what to say at each step.', 14, 'Beginner'),
        L('pattern-drills', 'Spot-the-Pattern Drills', 'Sixty unseen problem statements: name the pattern in under a minute, then check.', 30, 'Intermediate'),
        L('mock-interviews', 'Mock Interviews, Annotated', 'Two full transcripts of the same problem — a weak and a strong candidate — and a recovery from being stuck, scored.', 20, 'Intermediate'),
        L('dsa-cheat-sheet', 'DSA Cheat Sheet', 'Every pattern, template and complexity on one page for revision.', 12, 'Intermediate'),
        L('problem-tracker', 'Problem Tracker', 'Every practice problem in one place: tick what you have solved and see your progress per pattern.', 5, 'Beginner'),
      ],
    },
  ],
};

export const dsa = {
  id: 'dsa',
  title: 'Data Structures & Algorithms',
  icon: 'binary',
  description:
    'Pattern-first problem solving in Java: learn about 35 patterns instead of 500 solutions, with the reasoning interviewers want to hear.',
  courses: [startHere, dataStructures, patterns, playbook],
};
