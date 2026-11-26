/** Practice thinking walkthroughs: topological-sort (format: src/data/think/index.js). */

export default {
  'course-schedule': {
    aha: 'Courses and prerequisites form a directed graph. You can finish everything exactly when the graph has no cycle. Kahn\'s algorithm checks that by doing it: take any course with no unfinished prerequisites, which frees the courses after it, and repeat. If some courses are never freed, they wait on each other in a cycle.',
    asks: {
      read: 'Which way does [a, b] point? What makes finishing impossible?',
      budget: '2000 courses, 5000 pairs. One pass over the edges?',
      observe: 'With [[1,0],[0,1]], which course can you take first?',
      brute: 'Scanning again and again for a course you can take works. What does each scan repeat?',
      pattern: 'What structure in the graph blocks a schedule, and how do you detect it?',
      watch: 'Watch in-degrees fall as courses are taken; leftovers are a cycle.',
    },
    read: [
      { phrase: 'means you must take course `b` before course `a`', says: 'An edge b → a: b first. Getting the direction right matters for the order, not for the yes/no answer.' },
      { phrase: 'Return `true` if it is possible to finish every course', says: 'Possible exactly when the prerequisite graph has no cycle.' },
    ],
    budget: { from: 'courses ≤ 2000, prerequisites ≤ 5000', n: 7000, aim: 'O(V + E)', note: 'Each course is taken once and each edge lowers one count once.' },
    observe: [
      {
        title: 'A cycle blocks everything on it',
        text: '[[1,0],[0,1]]: 1 needs 0 and 0 needs 1. Neither can go first, so neither is ever taken.',
        sketch: { kind: 'array', rows: [{ items: ['0 needs 1', '1 needs 0', 'stuck'], marks: { 2: 'bad' } }] },
      },
      {
        title: 'Count what each course waits for',
        text: 'A course\'s in-degree is its number of unfinished prerequisites. With edges 0→2, 1→2, 1→3, 2→4, 3→4, 4→5, courses 0 and 1 wait for nothing: they can be taken now.',
        sketch: { kind: 'array', rows: [{ label: 'in-degree', items: ['0: 0', '1: 0', '2: 2', '3: 1', '4: 2', '5: 1'], marks: { 0: 'hit', 1: 'hit' } }] },
      },
      {
        title: 'Taking a course frees others',
        text: 'Taking 0 and then 1 lowers the in-degree of 2 (twice) and 3: both reach 0 and join the queue. If every course gets taken this way, return true.',
        sketch: { kind: 'array', rows: [{ label: 'after 0 and 1', items: ['2: 0', '3: 0', '4: 2', '5: 1'], marks: { 0: 'hit', 1: 'hit' } }] },
      },
    ],
    brute: { idea: 'Repeatedly scan all courses for one whose prerequisites are all taken; take it. If a scan finds none while courses remain, there is a cycle.', cost: 'O(V · (V + E))', waste: 'Each scan rechecks every course; a count per course and a queue of ready courses avoid rescanning.' },
    pattern: {
      pick: 'topological-sort',
      why: 'Kahn\'s algorithm: in-degree counts, a queue of courses at 0; finished = (taken == numCourses). Or DFS with three colours, where meeting a grey course is a cycle. O(V + E).',
      not: [
        { id: 'graph-traversal', why: 'A plain visited set can\'t tell a cycle from two paths meeting; the order of finishing matters.' },
        { id: 'union-find', why: 'Union–Find finds cycles in undirected graphs; prerequisites have a direction.' },
      ],
    },
    watch: { viz: 'TopoViz', inputs: [{ label: '6 courses, no cycle', input: { n: 6, edges: [[0, 2], [1, 2], [1, 3], [2, 4], [3, 4], [4, 5]] } }, { label: 'with a cycle', input: { n: 5, edges: [[0, 1], [1, 2], [2, 3], [3, 1], [0, 4]] } }] },
    edges: ['No prerequisites: n = 3, [] → true.', 'Two-course cycle: [[1,0],[0,1]] → false.', 'Self-contained chain: [[1,0],[2,1],[3,2]] → true.'],
  },

  'course-schedule-ii': {
    aha: 'The order in which Kahn\'s algorithm takes courses is itself a valid schedule: a course is only taken after every course it needs. Record the order as you go. If it ends up shorter than numCourses, a cycle blocked the rest: return an empty array.',
    asks: {
      read: 'What should you return when it\'s impossible, and does the order have to be unique?',
      budget: 'Same limits as Course Schedule. Can the check and the order come from one pass?',
      observe: 'In the 6-course example, list the courses in the order they become ready.',
      brute: 'Trying orders and checking them: how many are there?',
      pattern: 'What does the queue of ready courses produce, read in order?',
      watch: 'Watch the order fill up as in-degrees reach 0.',
    },
    read: [
      { phrase: 'Return an order in which you can take all `numCourses` courses', says: 'A topological order of the prerequisite graph.' },
      { phrase: 'If several orders work, return any of them', says: 'Any valid topological order; which ready course you take first doesn\'t matter.' },
      { phrase: 'If it is impossible, return an empty array', says: 'A cycle leaves courses unscheduled: check the length.' },
    ],
    budget: { from: 'courses ≤ 2000, prerequisites ≤ 5000', n: 7000, aim: 'O(V + E)', note: 'Same pass as Course Schedule; the order is a by-product.' },
    observe: [
      {
        title: 'Ready courses come out in a valid order',
        text: 'A course enters the queue only when all its prerequisites are taken. So whatever order the queue gives out respects every prerequisite.',
        sketch: { kind: 'array', rows: [{ label: 'order', items: [0, 1, 2, 3, 4, 5], marks: { 0: 'hit', 1: 'hit' } }], caption: '0 and 1 have no prerequisites' },
      },
      {
        title: 'Several answers are fine',
        text: '0 and 1 are both ready at the start: [0, 1, …] and [1, 0, …] are both correct.',
        sketch: { kind: 'array', rows: [{ items: ['0, 1, 3, 2, 4, 5', '1, 0, 2, 3, 4, 5'], marks: { 0: 'hit', 1: 'hit' } }] },
      },
      {
        title: 'Short order = cycle',
        text: 'If a cycle exists, its courses never reach in-degree 0 and never enter the order. Fewer than numCourses entries means return [].',
        sketch: { kind: 'array', rows: [{ items: ['order length 2', 'numCourses 5', '→ []'], marks: { 2: 'bad' } }] },
      },
    ],
    brute: { idea: 'Try permutations of the courses and return the first in which every course comes after its prerequisites.', cost: 'O(V! · E)', waste: 'Almost every permutation breaks some rule; Kahn builds a valid order directly.' },
    pattern: {
      pick: 'topological-sort',
      why: 'Kahn\'s algorithm, recording courses as they are taken; return [] if fewer than numCourses were taken. Or reversed DFS post-order. O(V + E).',
      not: [
        { id: 'graph-traversal', why: 'A plain BFS from one course doesn\'t wait for all of a course\'s prerequisites.' },
        { id: 'sorting-and-selection', why: 'There is no key to sort by; the order comes from the rules.' },
      ],
    },
    watch: { viz: 'TopoViz', inputs: [{ label: '6 courses', input: { n: 6, edges: [[0, 2], [1, 2], [1, 3], [2, 4], [3, 4], [4, 5]] } }, { label: 'a cycle', input: { n: 5, edges: [[0, 1], [1, 2], [2, 3], [3, 1], [0, 4]] } }] },
    edges: ['One course: n = 1, [] → [0].', 'Cycle: [[1,0],[0,1]] → [].', 'Independent courses: n = 3, [] → any order, e.g. [0, 1, 2].'],
  },

  'course-schedule-iv': {
    aha: 'A query asks whether u can reach v along prerequisite arrows. With up to 10⁴ queries but only 100 courses, compute the answer for every pair once: let each course in turn act as a stepping stone, and i reaches j if i reaches k and k reaches j. Then every query is a table lookup.',
    asks: {
      read: 'Which way does the pair point here, and do indirect prerequisites count?',
      budget: '100 courses, 10⁴ queries. Search per query, or precompute?',
      observe: 'With 0 → 1 and 1 → 2, is 0 a prerequisite of 2? Which course connects them?',
      brute: 'A fresh search for every query: what does it repeat?',
      pattern: 'How do you build all chains out of single steps?',
      watch: 'Watch the reachability table fill as each course becomes a stepping stone.',
    },
    read: [
      { phrase: 'means course `a` must be taken before course `b`', says: 'Edge a → b, the opposite direction from Course Schedule.' },
      { phrase: 'Prerequisites can be indirect', says: 'Reachability along any chain, not just direct edges.' },
      { phrase: 'The prerequisite graph has no cycles', says: 'No contradictions: u before v and v before u can\'t both hold.' },
    ],
    budget: { from: 'courses ≤ 100, queries ≤ 10⁴', rows: [['search per query', '10⁴ × (V + E)', 'ok', 'fits, repeats work'], ['all pairs once (Floyd–Warshall)', '100³ = 10⁶, then O(1) each', 'ok', 'fits']], aim: 'O(V³ + Q)', note: 'Small V and many queries: precomputing every pair pays off.' },
    observe: [
      {
        title: 'Chains count',
        text: '0 → 1 → 2: 0 is a prerequisite of 2 although no pair says so directly.',
        sketch: { kind: 'array', rows: [{ items: ['0', '→ 1', '→ 2', '0 before 2'], marks: { 3: 'hit' } }] },
      },
      {
        title: 'One stepping stone at a time',
        text: 'Allow course 1 as a middle: everything before 1 is now before everything after 1. Then allow course 2, and so on. After all courses, chains of any length are covered.',
        sketch: { kind: 'array', rows: [{ items: ['reach[0][1]', '&& reach[1][2]', '→ reach[0][2]'], marks: { 2: 'hit' } }] },
      },
      {
        title: 'Queries become lookups',
        text: 'With the table filled, [0, 2] is reach[0][2] = true and [2, 0] is false. No search per query.',
        sketch: { kind: 'array', rows: [{ items: ['[0, 2] → true', '[2, 0] → false'], marks: { 0: 'hit' } }] },
      },
    ],
    brute: { idea: 'For each query [u, v], run a BFS from u and check whether it reaches v.', cost: 'O(Q · (V + E))', waste: 'Many queries share a starting course and repeat the same search.' },
    pattern: {
      pick: 'topological-sort',
      why: 'Reachability for all pairs in a DAG: Floyd–Warshall-style closure (or one BFS per course, or propagating sets in topological order); then O(1) per query. O(V³ + Q).',
      not: [
        { id: 'shortest-paths', why: 'Floyd–Warshall usually computes distances; here it only tracks yes/no.' },
        { id: 'graph-traversal', why: 'One search per query works but repeats; precomputing serves every query.' },
      ],
    },
    watch: { viz: 'TopoWalkViz', inputs: [{ label: '4 courses', input: { mode: 'reach', n: 4, pre: [[0, 1], [1, 2], [3, 2]], queries: [[0, 2], [2, 0], [3, 1], [0, 3]] } }, { label: 'a longer chain', input: { mode: 'reach', n: 5, pre: [[0, 1], [1, 2], [2, 3], [3, 4]], queries: [[0, 4], [4, 0], [1, 3]] } }] },
    edges: ['No prerequisites: n = 2, [], queries [[0,1]] → [false].', 'Reverse query: [[1,0]], query [0,1] → false.', 'Indirect: [[0,1],[1,2]], query [0,2] → true.'],
  },

  'minimum-height-trees': {
    aha: 'The best root is the middle of the tree\'s longest path. Find it from the outside in: remove every leaf at once, then the new leaves, and repeat. Each round shortens every longest path at both ends, so what remains at the end (one node, or two neighbours) is the centre.',
    asks: {
      read: 'What is a tree\'s height here, and can there be more than one answer?',
      budget: 'Up to 2 × 10⁴ nodes. Can you afford a BFS from every node?',
      observe: 'On a straight path 0 – 1 – 2 – 3 – 4, which root gives the lowest tree?',
      brute: 'Root at every node and measure: how expensive is that?',
      pattern: 'Leaves are never the best root. What happens if you remove them all?',
      watch: 'Watch the leaves peel away layer by layer.',
    },
    read: [
      { phrase: 'the number of edges on its longest root-to-leaf path', says: 'Height = distance from the root to its farthest node.' },
      { phrase: 'Return every node that, chosen as the root, gives the minimum possible height', says: 'There can be two: the two middle nodes of an even-length longest path.' },
    ],
    budget: { from: 'n ≤ 2 × 10⁴', rows: [['BFS from every node', 'n² = 4 × 10⁸', 'bad', 'too slow'], ['peel leaves', 'O(n)', 'ok', 'fits']], aim: 'O(n)', note: 'Each node is removed once.' },
    observe: [
      {
        title: 'The middle of a path',
        text: 'On 0 – 1 – 2 – 3 – 4, rooting at 2 gives height 2; anywhere else is taller. The best root is the middle of the longest path.',
        sketch: { kind: 'array', rows: [{ label: 'height if root', items: ['0: 4', '1: 3', '2: 2', '3: 3', '4: 4'], marks: { 2: 'hit' } }] },
      },
      {
        title: 'Peel all the leaves together',
        text: 'Removing every leaf at once shortens every longest path by one at each end; its middle stays the middle. Neighbours whose degree drops to 1 are the next leaves.',
        sketch: { kind: 'array', rows: [{ label: 'round 1', items: ['remove 0, 4, 5'] }, { label: 'round 2', items: ['remove 1, 3'] }, { label: 'left', items: [2], marks: { 0: 'hit' } }] },
      },
      {
        title: 'One or two centres',
        text: 'Stop when at most 2 nodes remain. A longest path with an even number of nodes has two middles: 0 – 3 – 4 – 5 gives both 3 and 4.',
        sketch: { kind: 'array', rows: [{ items: [0, 3, 4, 5], marks: { 1: 'hit', 2: 'hit' } }] },
      },
    ],
    brute: { idea: 'Root the tree at each node in turn, measure its height with a BFS, and keep the nodes with the smallest height.', cost: 'O(n²)', waste: 'Every BFS walks the whole tree; neighbouring roots give almost the same answer.' },
    pattern: {
      pick: 'topological-sort',
      why: 'Topological trimming: queue the degree-1 nodes, remove them layer by layer, decrementing neighbours, until ≤ 2 nodes remain. O(n).',
      not: [
        { id: 'tree-bfs', why: 'A BFS per root is the brute force; trimming does one pass for all roots.' },
        { id: 'dp-trees-intervals', why: 'Rerooting DP also works (height of every root in O(n)), with more bookkeeping.' },
      ],
    },
    watch: { viz: 'TopoWalkViz', inputs: [{ label: 'one centre', input: { mode: 'mht', n: 6, edges: [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5]] } }, { label: 'two centres', input: { mode: 'mht', n: 6, edges: [[3, 0], [3, 1], [3, 2], [3, 4], [5, 4]] } }, { label: 'a star', input: { mode: 'mht', n: 4, edges: [[1, 0], [1, 2], [1, 3]] } }] },
    edges: ['One node: n = 1 → [0].', 'Two nodes: [[0,1]] → [0, 1].', 'A star: [[1,0],[1,2],[1,3]] → [1].'],
  },

  'find-eventual-safe-states': {
    aha: 'A terminal node is safe. Any other node is safe once every one of its out-edges leads to a safe node. So work backwards from the terminals: reverse the edges, count each node\'s out-edges, and whenever a node becomes safe, take one off the count of every node pointing at it. Nodes that reach 0 are safe; the rest can reach a cycle.',
    asks: {
      read: 'What exactly makes a node safe?',
      budget: '10⁴ nodes, 4 × 10⁴ edges. A search from every node?',
      observe: 'In the example, why is 2 safe but 1 not?',
      brute: 'For each node, search for a reachable cycle. What does that repeat?',
      pattern: 'Safe-ness spreads backwards from the terminals. Which algorithm peels nodes once all their edges are done?',
      watch: 'Watch safe nodes free the nodes pointing at them.',
    },
    read: [
      { phrase: 'A terminal node has no outgoing edges', says: 'The starting safe nodes.' },
      { phrase: 'A node is safe if every path starting from it leads to a terminal node', says: 'All out-edges must lead to safe nodes: one bad edge makes it unsafe.' },
      { phrase: 'Return all safe nodes in ascending order', says: 'Sort at the end (or scan nodes in order).' },
    ],
    budget: { from: 'nodes ≤ 10⁴, edges ≤ 4 × 10⁴', n: 5e4, aim: 'O(V + E)', note: 'Each edge lowers a count once.' },
    observe: [
      {
        title: 'Terminals are safe',
        text: 'In [[1,2],[2,3],[5],[0],[5],[],[]], nodes 5 and 6 have no out-edges: safe.',
        sketch: { kind: 'array', rows: [{ label: 'out-edges', items: ['0: 2', '1: 2', '2: 1', '3: 1', '4: 1', '5: 0', '6: 0'], marks: { 5: 'hit', 6: 'hit' } }] },
      },
      {
        title: 'All edges safe → safe',
        text: '2 only points to 5, so once 5 is safe, 2 is too. Same for 4. But 1 points to 3, and 3 → 0 → 1 is a cycle: 1 can wander forever.',
        sketch: { kind: 'array', rows: [{ items: ['2 → 5 ✓', '4 → 5 ✓', '1 → 3 → 0 → 1 ✗'], marks: { 0: 'hit', 1: 'hit', 2: 'bad' } }] },
      },
      {
        title: 'Kahn on the reversed graph',
        text: 'Count out-edges; queue the terminals; each safe node lowers the count of its parents. Nodes on or leading into a cycle never reach 0.',
        sketch: { kind: 'array', rows: [{ label: 'safe', items: [2, 4, 5, 6] }] },
      },
    ],
    brute: { idea: 'For each node, run a DFS with grey/black colours to see whether any path from it reaches a cycle.', cost: 'O(V · (V + E))', waste: 'Searches from neighbouring nodes cover the same edges again; one shared pass decides every node.' },
    pattern: {
      pick: 'topological-sort',
      why: 'Kahn\'s algorithm on the reversed graph: out-degree counts, queue the terminals, peel; nodes reaching 0 are safe. Or one shared colour DFS. O(V + E).',
      not: [
        { id: 'graph-traversal', why: 'A plain DFS needs the three colours to tell "on a cycle" from "already proven safe".' },
        { id: 'union-find', why: 'Cycles here are directed; union–find ignores direction.' },
      ],
    },
    watch: { viz: 'TopoWalkViz', inputs: [{ label: 'the example', input: { mode: 'safe', graph: [[1, 2], [2, 3], [5], [0], [5], [], []] } }, { label: 'a cycle at the end', input: { mode: 'safe', graph: [[1], [2], [3], [2], []] } }] },
    edges: ['One terminal node: [[]] → [0].', 'Self-loop: [[0]] → [].', 'Chain into a cycle: [[1],[2],[1]] → [].'],
  },

  'find-all-possible-recipes-from-given-supplies': {
    aha: 'Each recipe waits for a number of missing ingredients. Supplies are available from the start. Every item that becomes available takes one off the missing count of every recipe that uses it; a recipe that reaches 0 is made, and becomes available itself. That is Kahn\'s algorithm with ingredients as edges.',
    asks: {
      read: 'Can a recipe be an ingredient? How many of each supply do you have?',
      budget: '100 recipes, 100 ingredients each. Can you avoid rescanning?',
      observe: 'If sandwich needs bread and bread needs yeast and flour, in what order do things become available?',
      brute: 'Rescanning all recipes until nothing changes: what does it recheck?',
      pattern: 'Each recipe waits for a count of things. Where have you seen that?',
      watch: 'Watch supplies unlock recipes, which unlock more.',
    },
    read: [
      { phrase: 'another recipe that you must make first', says: 'Ingredients can be recipes: dependencies chain.' },
      { phrase: 'of which you have an unlimited amount', says: 'Using an item never uses it up: once available, it counts for every recipe.' },
      { phrase: 'Return every recipe you can make, in any order', says: 'Collect the recipes that reach 0 missing.' },
    ],
    budget: { from: 'recipes ≤ 100, ingredients ≤ 100 each', n: 1e4, aim: 'O(S + R · I)', note: 'Each ingredient entry is decremented once.' },
    observe: [
      {
        title: 'Recipes wait on counts',
        text: 'bread needs 2 (yeast, flour); sandwich needs 2 (bread, meat). Supplies yeast, flour and meat are available at once.',
        sketch: { kind: 'array', rows: [{ label: 'missing', items: ['bread: 2', 'sandwich: 2'] }] },
      },
      {
        title: 'Made recipes join the queue',
        text: 'yeast and flour bring bread to 0: bread is made and becomes available. meat and bread then bring sandwich to 0.',
        sketch: { kind: 'array', rows: [{ label: 'order', items: ['yeast', 'flour', '→ bread', 'meat', '→ sandwich'], marks: { 2: 'hit', 4: 'hit' } }] },
      },
      {
        title: 'Recipes that need each other never start',
        text: 'If cake needs icing and icing needs cake, neither count ever reaches 0. They are simply not in the answer.',
        sketch: { kind: 'array', rows: [{ items: ['cake needs icing', 'icing needs cake', 'neither'], marks: { 2: 'bad' } }] },
      },
    ],
    brute: { idea: 'Keep a set of available items; scan all recipes repeatedly, making any whose ingredients are all available, until a full scan makes nothing.', cost: 'O(R² · I)', waste: 'Every scan rechecks every ingredient of every recipe; counts update only what changed.' },
    pattern: {
      pick: 'topological-sort',
      why: 'Kahn\'s algorithm: need[r] = ingredient count, queue the supplies, each available item decrements its users, recipes at 0 are made and queued. O(S + R · I).',
      not: [
        { id: 'hashing', why: 'Maps from names to recipes are needed, but the order comes from the counts.' },
        { id: 'graph-traversal', why: 'A plain search would make a recipe as soon as one ingredient is reached; it must wait for all.' },
      ],
    },
    watch: { viz: 'TopoWalkViz', inputs: [{ label: 'bread, sandwich, burger', input: { mode: 'recipes', recipes: ['bread', 'sandwich', 'burger'], ingredients: [['yeast', 'flour'], ['bread', 'meat'], ['sandwich', 'meat', 'bread']], supplies: ['yeast', 'flour', 'meat'] } }, { label: 'two recipes need each other', input: { mode: 'recipes', recipes: ['tea', 'cake', 'icing'], ingredients: [['water', 'leaf'], ['icing', 'egg'], ['cake', 'sugar']], supplies: ['water', 'leaf', 'egg', 'sugar'] } }] },
    edges: ['Missing supply: bread needs corn, not supplied → [].', 'Chain: bread, then sandwich from bread → both.', 'Two recipes needing each other → neither.'],
  },

  'alien-dictionary': {
    aha: 'Only neighbouring words tell you anything, and only at their first differing letter: the earlier word\'s letter comes first in the alphabet. Collect those rules as edges between letters, then put the letters in an order that obeys them: a topological sort. Two traps return "": a longer word before its own prefix, and rules that form a cycle.',
    asks: {
      read: 'Which comparison rule does the language follow, and when is the list impossible?',
      budget: 'Up to 100 words of 100 letters. How many rules can there be?',
      observe: 'Compare wrt and wrf. What do you learn, and what don\'t you learn?',
      brute: 'Trying every alphabet and checking the list: how many alphabets are there?',
      pattern: 'You have "x before y" rules between letters. How do you produce an order?',
      watch: 'Watch rules come out of neighbouring words, then the letters sort.',
    },
    read: [
      { phrase: 'two words are compared at their first differing letter', says: 'One rule per neighbouring pair, at that letter; the rest of the words say nothing.' },
      { phrase: 'a word comes before any longer word it is a prefix of', says: 'abc after ab is impossible: return "".' },
      { phrase: 'If several orders are consistent with the list, return any of them', says: 'Any topological order of the letters is fine.' },
    ],
    budget: { from: 'words ≤ 100, length ≤ 100', rows: [['compare neighbours', 'total letters ≤ 10⁴', 'ok', 'fits'], ['sort 26 letters', 'tiny', 'ok', 'fits']], aim: 'O(C + U²)', note: 'C = total letters, U = distinct letters (≤ 26).' },
    observe: [
      {
        title: 'One rule per pair, at the first difference',
        text: 'wrt and wrf share "wr"; then t vs f: t comes before f. The letters after the difference tell nothing.',
        sketch: { kind: 'array', rows: [{ items: ['w', 'r', 't'], marks: { 2: 'hit' } }, { items: ['w', 'r', 'f'], marks: { 2: 'hit' } }], caption: 't before f' },
      },
      {
        title: 'Rules make a graph',
        text: 'From wrt, wrf, er, ett, rftt: t → f, w → e, r → t, e → r. Sorting gives w, e, r, t, f.',
        sketch: { kind: 'array', rows: [{ items: ['w', '→ e', '→ r', '→ t', '→ f'], marks: { 0: 'hit' } }] },
      },
      {
        title: 'Two ways to fail',
        text: '["abc", "ab"]: a prefix after its longer word, impossible. Or rules a → b and b → a from different pairs: a cycle, no order works. Both return "".',
        sketch: { kind: 'array', rows: [{ items: ['abc before ab', 'a → b → a'], marks: { 0: 'bad', 1: 'bad' } }] },
      },
    ],
    brute: { idea: 'Try every ordering of the letters and check whether the list is sorted under it.', cost: 'O(U! · C)', waste: 'Up to 26! orders; the rules from neighbouring pairs pin the order down directly.' },
    pattern: {
      pick: 'topological-sort',
      why: 'Build rules from neighbouring pairs (first differing letter; prefix check), then Kahn\'s algorithm on the letters; a short result means a cycle. O(C + U²).',
      not: [
        { id: 'sorting-and-selection', why: 'You can\'t sort without knowing the comparison; the rules have to be found first.' },
        { id: 'tries', why: 'A trie stores the words, but the rules come from neighbouring pairs alone.' },
      ],
    },
    watch: { viz: 'TopoWalkViz', inputs: [{ label: 'wrt, wrf, er, ett, rftt', input: { mode: 'alien', words: ['wrt', 'wrf', 'er', 'ett', 'rftt'] } }, { label: 'z, x, z (a cycle)', input: { mode: 'alien', words: ['z', 'x', 'z'] } }, { label: 'abc, ab', input: { mode: 'alien', words: ['abc', 'ab'] } }] },
    edges: ['One word: ["abc"] → any order of a, b, c.', 'Prefix after: ["abc","ab"] → "".', 'Cycle: ["z","x","z"] → "".'],
  },

  'sort-items-by-groups-respecting-dependencies': {
    aha: 'There are two orders to respect at once: items within the whole list, and groups as blocks. Give every ungrouped item a group of its own, so every item has exactly one. Then topologically sort the groups (using only rules between different groups) and the items (using all rules), and output each group\'s items, in item order, group by group.',
    asks: {
      read: 'What must be true of items in the same group, and what about ungrouped items?',
      budget: '3 × 10⁴ items. Two sorts plus a pass?',
      observe: 'In the example, item 6 must come before 3 and 4, all in group 0. What order do groups 0 and 1 need?',
      brute: 'Trying arrangements and checking both conditions: how many are there?',
      pattern: 'Sorting groups and sorting items are both topological sorts. How do they combine?',
      watch: 'Watch groups ordered, items ordered, then items placed group by group.',
    },
    read: [
      { phrase: 'items of the same group are next to each other', says: 'Each group is one contiguous block: groups need an order too.' },
      { phrase: 'or `-1` if it belongs to no group', says: 'Give each such item its own new group, so the rules stay uniform.' },
      { phrase: 'every item comes after all of its `beforeItems`', says: 'Item rules: a topological order of items.' },
    ],
    budget: { from: 'n ≤ 3 × 10⁴', n: 3e4, aim: 'O(n + E)', note: 'Two Kahn passes and one bucketing pass.' },
    observe: [
      {
        title: 'Ungrouped items become groups of one',
        text: 'Items 0, 1 and 7 have group −1. Giving each a new group (2, 3, 4) means every item belongs to exactly one block.',
        sketch: { kind: 'array', rows: [{ label: 'group', items: ['0: S2', '1: S3', '2: G1', '3: G0', '4: G0', '5: G1', '6: G0', '7: S4'] }] },
      },
      {
        title: 'Rules between groups order the groups',
        text: 'Item 1 needs 6 (group 0) first, so group 0 must come before item 1\'s group. Rules inside one group only order items within it.',
        sketch: { kind: 'array', rows: [{ items: ['6 → 1', 'G0 → S3'], marks: { 1: 'hit' } }] },
      },
      {
        title: 'Combine the two orders',
        text: 'Walk the groups in group order; for each, write its items in item order. Item rules within a group hold by item order; rules across groups hold by group order.',
        sketch: { kind: 'array', rows: [{ label: 'answer', items: [6, 3, 4, 5, 2, 0, 7, 1] }] },
      },
    ],
    brute: { idea: 'Try permutations of the items and keep the first in which groups are contiguous and every rule holds.', cost: 'O(n! · E)', waste: 'Astronomically many orders; two topological sorts build a valid one directly.' },
    pattern: {
      pick: 'topological-sort',
      why: 'Two-level topological sort: new groups for −1 items; sort groups by cross-group rules, sort items by all rules; bucket items by group in group order. Empty if either sort finds a cycle. O(n + E).',
      not: [
        { id: 'sorting-and-selection', why: 'No comparison key exists: both orders come from rules.' },
        { id: 'union-find', why: 'Groups are given, not discovered; the work is ordering them.' },
      ],
    },
    watch: { viz: 'TopoWalkViz', inputs: [{ label: 'the example', input: { mode: 'groups', n: 8, m: 2, group: [-1, -1, 1, 0, 0, 1, 0, -1], before: [[], [6], [5], [6], [3, 6], [], [], []] } }, { label: 'groups in a cycle', input: { mode: 'groups', n: 4, m: 2, group: [0, 0, 1, 1], before: [[], [2], [], [0]] } }] },
    edges: ['No rules: n = 3, group [0, -1, 0] → e.g. [0, 2, 1].', 'Two groups needing each other: group 0 item after group 1 item and vice versa → [].', 'Item cycle: [1] before 0 and [0] before 1 → [].'],
  },

  'build-a-matrix-with-conditions': {
    aha: 'Row conditions only say which number is higher; column conditions only say which is further left. They never interact. Sort the numbers once by the row conditions and once by the column conditions; each number\'s row is its position in the first order and its column its position in the second.',
    asks: {
      read: 'How many times does each number appear, and what fills the rest?',
      budget: 'k up to 400 and 10⁴ conditions. How expensive are two sorts?',
      observe: 'In the example, which number must be in the bottom row?',
      brute: 'Trying placements and checking conditions: how many are there?',
      pattern: 'Do the row conditions care about columns at all?',
      watch: 'Watch the two orders, then each number land at (row, column).',
    },
    read: [
      { phrase: 'contains each number from `1` to `k`', says: 'k numbers in a k × k grid: one per row and one per column is possible.' },
      { phrase: 'the row of `above` is strictly above the row of `below`', says: 'A rule between rows only: a topological order of numbers top to bottom.' },
      { phrase: 'Return any matrix that satisfies all the conditions, or an empty matrix if none exists', says: 'A cycle in either set of conditions makes it impossible.' },
    ],
    budget: { from: 'k ≤ 400, conditions ≤ 10⁴ each', n: 2e4, aim: 'O(k² + R + C)', note: 'Two topological sorts, then k² to write the matrix.' },
    observe: [
      {
        title: 'Two separate sorts',
        text: 'Rows: 1 above 2, 3 above 2 → order 1, 3, 2 (or 3, 1, 2). Columns: 2 left of 1, 3 left of 2 → order 3, 2, 1.',
        sketch: { kind: 'array', rows: [{ label: 'rows', items: [1, 3, 2] }, { label: 'columns', items: [3, 2, 1] }] },
      },
      {
        title: 'Position in each order is the coordinate',
        text: '1 is first in rows and third in columns: row 0, column 2. 3 is row 1, column 0. 2 is row 2, column 1.',
        sketch: { kind: 'grid', grid: [[0, 0, 1], [3, 0, 0], [0, 2, 0]], marks: { '0,2': 'hit', '1,0': 'hit', '2,1': 'hit' }, labels: { '0,2': '1', '1,0': '3', '2,1': '2' } },
      },
      {
        title: 'A cycle in either axis is fatal',
        text: 'If 1 must be above 2 and 2 above 1, no row order exists: return an empty matrix, whatever the columns say.',
        sketch: { kind: 'array', rows: [{ items: ['1 above 2', '2 above 1', '→ []'], marks: { 2: 'bad' } }] },
      },
    ],
    brute: { idea: 'Try every way of placing 1..k in distinct cells and check all conditions.', cost: 'O((k²)ᵏ)', waste: 'Rows and columns are independent; two orders decide every placement directly.' },
    pattern: {
      pick: 'topological-sort',
      why: 'Two independent topological sorts (Kahn) for rows and columns; place each number at (row index, column index); empty on a cycle. O(k² + R + C).',
      not: [
        { id: 'matrix-simulation', why: 'The matrix is only written at the end; the work is ordering.' },
        { id: 'backtracking', why: 'Searching placements is hopeless at k = 400; sorting each axis decides everything.' },
      ],
    },
    watch: { viz: 'TopoWalkViz', inputs: [{ label: 'the example', input: { mode: 'matrix', k: 3, rows: [[1, 2], [3, 2]], cols: [[2, 1], [3, 2]] } }, { label: 'a row cycle', input: { mode: 'matrix', k: 3, rows: [[1, 2], [2, 3], [3, 1]], cols: [[2, 1]] } }] },
    edges: ['Row cycle: [[1,2],[2,1]] → [].', 'No conflicts: k = 2, rows [[1,2]], cols [[2,1]] → [[0,1],[2,0]].', 'No conditions at all: k = 3 → any placement, e.g. the diagonal.'],
  },
};
