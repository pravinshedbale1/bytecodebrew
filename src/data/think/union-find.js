/** Practice thinking walkthroughs: union-find (format: src/data/think/index.js). */

export default {
  'find-if-path-exists-in-graph': {
    free: true,
    aha: 'Two nodes are connected when they end up in the same group. Union-find keeps groups as trees: union the two ends of every edge, and afterwards ask whether source and destination have the same root. No adjacency lists, no search.',
    asks: {
      read: 'Does a node count as reaching itself? Are edges one-way?',
      budget: '2 × 10⁵ nodes and edges. What does each edge cost?',
      observe: 'With edges 0–1, 0–2, 3–5, 5–4, 4–3, which nodes can 0 reach?',
      brute: 'Building adjacency lists and running BFS works. What is extra about it?',
      pattern: 'What is a "group of nodes that can reach each other", and how can you keep track of groups as edges arrive?',
      watch: 'Watch the trees merge edge by edge, then compare two roots.',
    },
    read: [
      { phrase: 'each `edges[i] = [u, v]` connects `u` and `v`', says: 'Undirected: an edge joins two nodes into one group.' },
      { phrase: 'Return `true` if there is a path from `source` to `destination`', says: 'Same group = some chain of edges links them.' },
      { phrase: 'A node always has a path to itself', says: 'source == destination is true with no edges at all.' },
    ],
    budget: {
      from: 'n, edges ≤ 2 × 10⁵',
      n: 400000,
      aim: 'O((V + E)·α(V))',
      note: 'α is the inverse Ackermann function: at most 4 or 5 for any real input, so effectively O(V + E).',
    },
    observe: [
      {
        title: 'Two separate pieces',
        text: 'Edges 0–1 and 0–2 make one piece {0, 1, 2}; 3–5, 5–4, 4–3 make another {3, 4, 5}. 0 can\'t reach 5.',
        sketch: { kind: 'array', rows: [{ label: 'piece A', items: [0, 1, 2] }, { label: 'piece B', items: [3, 4, 5], marks: { '2': 'bad' } }] },
      },
      {
        title: 'A group is a tree with a root',
        text: 'Every node points to a parent; following parents ends at the root, the group\'s representative. union(a, b) finds both roots and hangs one under the other.',
        sketch: { kind: 'array', rows: [{ label: 'parent', items: ['0→0', '1→0', '2→0', '3→3', '4→3', '5→3'], marks: { '0': 'hit', '3': 'hit' } }] },
      },
      {
        title: 'Connected = same root',
        text: 'After all unions, find(0) = 0 and find(5) = 3: different roots, so false. Union by size and path halving keep every find nearly O(1).',
        sketch: { kind: 'array', rows: [{ items: ['find(0) = 0', 'find(5) = 3', 'false'], marks: { '2': 'bad' } }] },
      },
    ],
    brute: {
      idea: 'Build adjacency lists and run BFS from source, checking whether destination gets visited.',
      cost: 'O(V + E)',
      waste: 'Equally fast, but needs the whole graph built first; union-find processes each edge as it comes and answers any pair afterwards.',
    },
    pattern: {
      pick: 'union-find',
      why: 'Union both ends of every edge; answer find(source) == find(destination). O((V + E)·α(V)).',
      not: [
        { id: 'graph-traversal', why: 'A BFS or DFS answers this too; union-find needs no adjacency lists and handles edges as they arrive.' },
        { id: 'shortest-paths', why: 'Only "is there a path" is asked, not how long.' },
      ],
    },
    watch: {
      viz: 'UfWalkViz',
      inputs: [
        { label: 'two pieces: 0 → 5', input: { mode: 'path', n: 6, edges: [[0, 1], [0, 2], [3, 5], [5, 4], [4, 3]], source: 0, dest: 5 } },
        { label: 'a triangle: 0 → 2', input: { mode: 'path', n: 3, edges: [[0, 1], [1, 2], [2, 0]], source: 0, dest: 2 } },
      ],
    },
    edges: [
      'Source is destination: n = 1, [] → true.',
      'No edges: n = 2, [], 0 → 1 → false.',
      'Two pieces: [[0,1],[0,2],[3,5],[5,4],[4,3]], 0 → 5 → false.',
    ],
  },

  'redundant-connection': {
    aha: 'Add the edges one by one with union. An edge whose two ends already share a root connects two nodes that were already connected: it closes the cycle. The input has exactly one cycle, and the first such edge is also the last edge of that cycle in the list, which is what the tie-break asks for.',
    asks: {
      read: 'How many cycles are there, and which edge must you return if several work?',
      budget: 'Up to 1000 edges. One pass?',
      observe: 'In [[1,2],[1,3],[2,3]], which edge is the first that connects already-connected nodes?',
      brute: 'Before adding each edge, search for an existing path. How much does that cost?',
      pattern: 'Which operation tells you "these two are already together"?',
      watch: 'Watch union return false on the edge that closes the cycle.',
    },
    read: [
      { phrase: 'now contains exactly one cycle', says: 'Exactly one edge has to go; any edge on the cycle would do.' },
      {
        phrase: 'If several edges qualify, return the one that appears last in `edges`',
        says: 'The cycle\'s edge that comes last in the list: exactly the one that first finds its ends already connected.',
      },
    ],
    budget: { from: 'edges ≤ 1000', n: 1000, aim: 'O(n·α(n))', note: 'One union per edge.' },
    observe: [
      {
        title: 'The first edge that finds its ends together',
        text: '1–2 joins {1} and {2}; 1–3 joins {1, 2} and {3}. 2–3: 2 and 3 already share a root. This edge adds a second path between them: the cycle.',
        sketch: { kind: 'array', rows: [{ items: ['1–2 join', '1–3 join', '2–3 already!'], marks: { '2': 'bad' } }] },
      },
      {
        title: 'It is the last cycle edge in the list',
        text: 'The cycle 1 – 2 – 3 – 1 is complete only once its last edge is processed. So the edge union rejects is the cycle edge appearing last: the required answer.',
        sketch: { kind: 'array', rows: [{ label: 'cycle edges in order', items: ['1–2', '1–3', '2–3'], marks: { '2': 'hit' } }] },
      },
      {
        title: 'union returns false',
        text: 'union(a, b) computes both roots; equal roots mean nothing to merge, so it returns false. That return value is the whole cycle detector.',
        sketch: { kind: 'array', rows: [{ items: ['find(2) = 1', 'find(3) = 1', 'return false'], marks: { '2': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Add edges one at a time; before adding [u, v], DFS in the graph so far to see if u already reaches v.',
      cost: 'O(n²)',
      waste: 'Every edge starts a fresh search; union-find keeps the groups up to date as edges arrive.',
    },
    pattern: {
      pick: 'union-find',
      why: 'Process edges in order with union; the first edge whose ends already share a root is the answer. O(n·α(n)).',
      not: [
        { id: 'graph-traversal', why: 'A BFS or DFS answers this too; union-find needs no adjacency lists and handles edges as they arrive.' },
        { id: 'topological-sort', why: 'Cycle detection in directed graphs; this graph is undirected.' },
      ],
    },
    watch: {
      viz: 'UnionFindViz',
      inputs: [
        { label: '[[1,2],[1,3],[2,3]]', input: { n: 4, ops: [['u', 1, 2], ['u', 1, 3], ['u', 2, 3]], redundant: true } },
        {
          label: '[[1,2],[2,3],[3,4],[1,4],[1,5]]',
          input: { n: 6, ops: [['u', 1, 2], ['u', 2, 3], ['u', 3, 4], ['u', 1, 4], ['u', 1, 5]], redundant: true },
        },
      ],
    },
    edges: [
      'Triangle: [[1,2],[1,3],[2,3]] → [2,3].',
      'Cycle then tail: [[1,2],[2,3],[3,4],[1,4],[1,5]] → [1,4].',
      'Cycle edge first in the list: [[2,3],[1,2],[1,3]] → [1,3].',
    ],
  },

  'satisfiability-of-equality-equations': {
    aha: 'Letters joined by == must share one value, so they form groups. A != only fails if its two letters end up in the same group. Do every == first (union), because a later equality can still merge groups, then check every != against the roots.',
    asks: {
      read: 'What are the variables, and what values can they take?',
      budget: 'At most 500 equations over 26 letters. What is the real question?',
      observe: 'In a==b, b!=c, c==d, d==a, does the order of checking matter?',
      brute: 'Trying values for every letter: why is that hopeless?',
      pattern: 'Equality is transitive. What structure keeps transitive groups?',
      watch: 'Watch the equalities merge letters, then an inequality hit a shared root.',
    },
    read: [
      {
        phrase: 'lowercase letters standing for integer variables',
        says: 'At most 26 variables, and integers are plentiful: each group can get its own value.',
      },
      { phrase: 'so that every equation holds', says: 'Fails only when a != joins two letters forced equal.' },
    ],
    budget: {
      from: 'equations ≤ 500, 26 letters',
      rows: [['guess letters for all 26 variables', '26²⁶', 'bad', 'impossible'], ['union the ==, then check the !=', '≈ 500 operations', 'ok', 'instant']],
      aim: 'O(n)',
      note: 'The trap is order, not speed.',
    },
    observe: [
      {
        title: 'Equalities chain',
        text: 'a==b, c==d and d==a chain together: a, b, c, d all end up in one group, so they must all be equal. Any "!=" between two of them is then a contradiction.',
        sketch: { kind: 'array', rows: [{ items: ['a = b', 'c = d', 'd = a', '→ {a, b, c, d}'], marks: { '3': 'hit' } }] },
      },
      {
        title: 'Checking too early misses it',
        text: 'Checking b!=c in list order, b and c are still in different groups: it looks fine. Only after c==d and d==a do they merge. So process all == before any !=.',
        sketch: { kind: 'array', rows: [{ label: 'in order', items: ['a==b', 'b!=c ✓?', 'c==d', 'd==a'], marks: { '1': 'bad' } }] },
      },
      {
        title: 'Same root = contradiction',
        text: 'With all equalities applied, find(b) = find(c): b!=c can\'t hold. Return false.',
        sketch: { kind: 'array', rows: [{ items: ['find(b)', '= find(c)', 'false'], marks: { '2': 'bad' } }] },
      },
    ],
    brute: {
      idea: 'Try assigning values to every letter (one of a few values each) and check all equations.',
      cost: 'O(kᵘ · n)',
      waste: 'Exponential in the number of letters; the groups decide everything without any values.',
    },
    pattern: {
      pick: 'union-find',
      why: 'Two passes over 26 letters: union every ==, then return false if any != has both letters under one root. O(n).',
      not: [
        {
          id: 'graph-traversal',
          why: 'No values need guessing: "==" equations force groups, and the only question is whether a "!=" lands inside a group.',
        },
        { id: 'backtracking', why: 'No values need guessing: groups decide it.' },
      ],
    },
    watch: {
      viz: 'UfWalkViz',
      inputs: [
        { label: 'a==b, b!=c, c==d, d==a', input: { mode: 'equations', eqs: ['a==b', 'b!=c', 'c==d', 'd==a'] } },
        { label: 'satisfiable', input: { mode: 'equations', eqs: ['a==b', 'b==c', 'c!=d', 'e==d'] } },
        { label: 'a==b, b!=a', input: { mode: 'equations', eqs: ['a==b', 'b!=a'] } },
      ],
    },
    edges: ['Self-inequality: ["a!=a"] → false.', 'Self-equality: ["a==a"] → true.', 'Late merge: ["a==b","b!=c","c==a"] → false.'],
  },

  'smallest-string-with-swaps': {
    aha: 'Swaps chain: if 0 can swap with 3 and 3 with 2, the letters at 0, 2 and 3 can end up in any order. So the pairs split the indices into groups, and inside a group the letters can be arranged freely. For the smallest string, put each group\'s letters in sorted order into its indices in sorted order.',
    asks: {
      read: 'How often and in what order may you swap?',
      budget: '10⁵ letters and 10⁵ pairs. Can you simulate swaps?',
      observe: 'With pairs [0,3], [1,2], [0,2], which indices can trade letters, directly or indirectly?',
      brute: 'Searching over all reachable strings: how many are there?',
      pattern: 'Which indices behave as one group?',
      watch: 'Watch the pairs merge indices, then each group sort its letters.',
    },
    read: [
      {
        phrase: 'as many times as you like and in any order',
        says: 'Unlimited swaps along a chain of pairs reach every arrangement of that chain\'s letters.',
      },
      { phrase: 'Swaps chain together', says: 'Groups are connected components of the pairs.' },
      {
        phrase: 'Return the lexicographically smallest string',
        says: 'Smallest letters as far left as possible: sorted letters into sorted indices, per group.',
      },
    ],
    budget: {
      from: 'length ≤ 10⁵, pairs ≤ 10⁵',
      n: 200000,
      aim: 'O((n + p)·α(n) + n log n)',
      note: 'Unions, then sort each group (or counting sort per group).',
    },
    observe: [
      {
        title: 'Groups of indices',
        text: '"dcabef" with pairs 0↔3, 1↔2, 0↔2, 4↔5: indices {0, 1, 2, 3} form one group (0–3, 0–2, 2–1), {4, 5} another.',
        sketch: {
          kind: 'array',
          rows: [
            {
              label: 's',
              items: ['d', 'c', 'a', 'b', 'e', 'f'],
              bands: [{ from: 0, to: 3, label: 'one group' }, { from: 4, to: 5, label: 'another' }],
            },
          ],
        },
      },
      {
        title: 'Inside a group, any order',
        text: 'Letters d, c, a, b can be arranged freely among indices 0–3. Sorted: a, b, c, d.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'group letters', items: ['d', 'c', 'a', 'b'] }, { label: 'sorted', items: ['a', 'b', 'c', 'd'], marks: { '0': 'hit' } }],
        },
      },
      {
        title: 'Smallest letter to the leftmost index',
        text: 'Write each group\'s sorted letters into its sorted indices: "abcdef". Groups that don\'t overlap keep their own letters.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'answer', items: ['a', 'b', 'c', 'd', 'e', 'f'], marks: { '0': 'hit', '1': 'hit', '2': 'hit', '3': 'hit' } }],
        },
      },
    ],
    brute: {
      idea: 'BFS over strings: from s, apply every allowed swap to reach new strings, and keep the smallest reachable one.',
      cost: 'O(n! · p)',
      waste: 'The number of reachable strings explodes; groups say exactly what is reachable.',
    },
    pattern: {
      pick: 'union-find',
      why: 'Union the indices of every pair; group indices by root; per group, sorted letters into sorted indices. O((n + p)·α(n) + n log n).',
      not: [
        {
          id: 'graph-traversal',
          why: 'DFS over the swap pairs finds the same groups; union-find is the lighter tool when all you need is "which group is each index in".',
        },
        { id: 'greedy', why: 'Swapping greedily pair by pair can miss chains; groups capture everything reachable.' },
      ],
    },
    watch: {
      viz: 'UfWalkViz',
      inputs: [
        { label: '"dcabef"', input: { mode: 'swaps', s: 'dcabef', pairs: [[0, 3], [1, 2], [0, 2], [4, 5]] } },
        { label: '"dcab", [0,3],[1,2]', input: { mode: 'swaps', s: 'dcab', pairs: [[0, 3], [1, 2]] } },
      ],
    },
    edges: ['No pairs: "cba", [] → "cba".', 'Two groups: "dcab", [[0,3],[1,2]] → "bacd".', 'Everything chained: "cba", [[0,1],[1,2]] → "abc".'],
  },

  'accounts-merge': {
    aha: 'Names can repeat across different people, so only a shared email proves two accounts belong together. Remember which account first listed each email; when another account lists it too, union the two. Each final group is one person: collect and sort its emails.',
    asks: {
      read: 'What proves two accounts are the same person, and what doesn\'t?',
      budget: '1000 accounts, up to 9 emails each. Comparing every pair?',
      observe: 'Two "John" accounts share js@m; a third John doesn\'t. How many Johns are there?',
      brute: 'Comparing every pair of accounts for a shared email: what does it cost and what does it miss?',
      pattern: 'Accounts merge transitively through emails. What keeps those groups?',
      watch: 'Watch accounts merge when an email shows up a second time.',
    },
    read: [
      {
        phrase: 'Two accounts belong to the same person if they share at least one email',
        says: 'An email is the link: union the accounts that list it.',
      },
      {
        phrase: 'different people can share a name',
        says: 'Two different people can have the same name, so the name is never a reason to merge; only a shared email is.',
      },
      { phrase: 'with the emails sorted', says: 'Sort each merged group\'s emails at the end.' },
    ],
    budget: {
      from: 'accounts ≤ 1000, ≤ 9 emails each',
      n: 10000,
      aim: 'O(E log E)',
      note: 'A hash map from email to first owner makes each email O(1); sorting dominates.',
    },
    observe: [
      {
        title: 'Names don\'t prove anything',
        text: 'Three accounts are named John. Two share js@m; the third shares nothing: two different Johns.',
        sketch: {
          kind: 'array',
          rows: [
            { label: 'A0 John', items: ['js@m', 'jny@m'], marks: { '0': 'hit' } },
            { label: 'A1 John', items: ['js@m', 'j00@m'], marks: { '0': 'hit' } },
            { label: 'A3 John', items: ['jb@m'] },
          ],
        },
      },
      {
        title: 'First owner of each email',
        text: 'Map every email to the first account that lists it. When A1 lists js@m, already owned by A0, union A0 and A1.',
        sketch: { kind: 'array', rows: [{ items: ['js@m → A0', 'A1 lists js@m', 'union(A0, A1)'], marks: { '2': 'hit' } }] },
      },
      {
        title: 'Merges chain',
        text: 'A4 shares j00@m with A1, which is already joined to A0: all three are one person. Collect every email under that root, sorted.',
        sketch: { kind: 'array', rows: [{ label: 'John', items: ['j00@m', 'jny@m', 'js@m', 'jw@m'] }] },
      },
    ],
    brute: {
      idea: 'Compare every pair of accounts for a shared email and merge them, repeating until nothing changes.',
      cost: 'O(A² · L²)',
      waste: 'Pairs are compared over and over; one map from email to owner finds every link in one pass.',
    },
    pattern: {
      pick: 'union-find',
      why: 'Union-find over accounts: owner map email → first account, union on repeats; group emails by root and sort. O(E log E).',
      not: [
        {
          id: 'hashing',
          why: 'A graph of emails with DFS over each component also works; union-find on accounts does the same grouping without building the graph.',
        },
        { id: 'graph-traversal', why: 'DFS over an email graph also works.' },
      ],
    },
    watch: {
      viz: 'UfWalkViz',
      inputs: [
        {
          label: '5 accounts',
          input: {
            mode: 'accounts',
            accounts: [['John', 'js@m', 'jny@m'], ['John', 'js@m', 'j00@m'], ['Mary', 'mary@m'], ['John', 'jb@m'], ['John', 'j00@m', 'jw@m']],
          },
        },
        { label: 'a chain of links', input: { mode: 'accounts', accounts: [['Ann', 'a@x', 'b@x'], ['Ann', 'c@x'], ['Ann', 'b@x', 'c@x']] } },
      ],
    },
    edges: [
      'Same name, no shared email: [["Ann","a@x"],["Ann","b@x"]] → two separate Anns.',
      'Chain: A0–A2 share b@x, A2–A1 share c@x → one person.',
      'One account: [["Ann","a@x","a@x"]] → [["Ann","a@x"]] (duplicates removed).',
    ],
  },

  'min-cost-to-connect-all-points': {
    aha: 'Connecting all points with the least total cost and no cycles is a minimum spanning tree. Kruskal\'s rule: consider the connections cheapest first, and keep one only if it joins two separate pieces; union-find answers that instantly. With all n² pairs as candidates, Prim\'s algorithm avoids sorting them.',
    asks: {
      read: 'How is the cost of a connection measured, and what shape must the result have?',
      budget: '1000 points: how many possible connections?',
      observe: 'Among the five points, which connection is cheapest? Is it ever wrong to take it?',
      brute: 'Trying every set of n − 1 connections: how many sets?',
      pattern: 'Cheapest first, skipping what would close a cycle. Which structure detects the cycle?',
      watch: 'Watch Kruskal take cheap edges and skip ones inside a piece.',
    },
    read: [
      { phrase: 'Connecting two points costs their Manhattan distance', says: 'Every pair is an edge with weight |dx| + |dy|: a complete graph.' },
      { phrase: 'exactly one path between any two of them', says: 'A tree: n − 1 edges, no cycles.' },
    ],
    budget: {
      from: 'n ≤ 1000 points',
      rows: [['Kruskal on all pairs', 'n² log n ≈ 10⁷', 'ok', 'fits'], ['Prim on the dense graph', 'n² = 10⁶', 'ok', 'fits, faster']],
      aim: 'O(n²)',
      note: 'Every pair is a candidate, so the graph is dense.',
    },
    observe: [
      {
        title: 'Cheapest edges first',
        text: 'The cheapest pairs are 0–1 (4), 1–3 (3), 3–4 (4). Take 1–3 first: it joins two separate points.',
        sketch: { kind: 'array', rows: [{ label: 'sorted', items: ['1–3: 3', '0–1: 4', '3–4: 4', '…'], marks: { '0': 'hit' } }] },
      },
      {
        title: 'Skip edges inside a piece',
        text: 'Once 0, 1, 3 and 4 are joined, 0–3 (cost 7) joins two points already in one piece: it would close a cycle. Skip it.',
        sketch: { kind: 'array', rows: [{ items: ['0–3', 'same root', 'skip'], marks: { '2': 'bad' } }] },
      },
      {
        title: 'Stop at n − 1 edges',
        text: '1–3 (3), 0–1 (4), 3–4 (4), 2–1 (9): four edges for five points, total 20.',
        sketch: { kind: 'array', rows: [{ items: [3, 4, 4, 9, '= 20'], marks: { '4': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Try every set of n − 1 pairs, keep those that connect all points, and take the cheapest.',
      cost: 'O(C(n², n − 1))',
      waste: 'Astronomically many sets; the cheapest-first rule never needs to reconsider a choice.',
    },
    pattern: {
      pick: 'union-find',
      why: 'Kruskal: sort all pairs by distance, union across different roots, stop at n − 1 edges. O(n² log n). Prim with an array of best connections is O(n²).',
      not: [
        { id: 'shortest-paths', why: 'Shortest paths minimise distance from one source; a spanning tree minimises the total of all edges.' },
        { id: 'greedy', why: 'Kruskal is greedy; union-find is what makes the cycle check cheap.' },
      ],
    },
    watch: {
      viz: 'UfWalkViz',
      inputs: [
        { label: '5 points', input: { mode: 'mincost', points: [[0, 0], [2, 2], [3, 10], [5, 2], [7, 0]] } },
        { label: 'a square', input: { mode: 'mincost', points: [[0, 0], [0, 4], [4, 0], [4, 4]] } },
      ],
    },
    edges: ['One point: [[0,0]] → 0.', 'Two points: [[0,0],[3,4]] → 7.', 'A square of side 4: → 12 (three sides).'],
  },

  'regions-cut-by-slashes': {
    aha: 'Diagonal cuts are awkward to count on the grid itself. Blow each cell up so the cuts become ordinary walls: at 3 × 3 pixels per cell, a slash blocks three diagonal pixels, and the regions are just connected areas of free pixels. The union-find version splits each cell into four triangles and joins them according to the character.',
    asks: {
      read: 'Which characters can a cell hold, and how is a backslash written in the tests?',
      budget: 'n ≤ 30. How many pixels at 3×?',
      observe: 'In [" /", "/ "], what does the picture look like? How many pieces?',
      brute: 'Tracing the lines geometrically: why is that hard?',
      pattern: 'Once cuts are walls, what is a region?',
      watch: 'Watch each region flood from a free pixel.',
    },
    read: [
      { phrase: 'the slashes cut the square diagonally', says: 'A cell is split into two triangles by / or \\; a space leaves it whole.' },
      { phrase: 'Return the number of regions the grid is divided into', says: 'Count connected components of the pieces.' },
      { phrase: 'a backslash is escaped', says: '"\\\\/" is two characters: \\ then /.' },
    ],
    budget: {
      from: 'n ≤ 30',
      rows: [['3× pixel flood fill', '(90)² = 8100 pixels', 'ok', 'fits'], ['4 triangles per cell + union-find', '3600 triangles', 'ok', 'fits']],
      aim: 'O(n²)',
      note: 'Either way a few thousand pieces.',
    },
    observe: [
      {
        title: 'Slashes become walls',
        text: 'Each cell becomes 3 × 3 pixels. "/" blocks the pixels from bottom-left to top-right; "\\" from top-left to bottom-right.',
        sketch: {
          kind: 'grid',
          grid: [[0, 0, 1], [0, 1, 0], [1, 0, 0]],
          marks: { '0,2': 'wall', '1,1': 'wall', '2,0': 'wall' },
          labels: {},
          caption: 'one "/" cell at 3 × 3',
        },
      },
      {
        title: 'Regions are connected free pixels',
        text: '[" /", "/ "]: the two slashes form one diagonal line across the grid, cutting it into 2 regions.',
        sketch: { kind: 'array', rows: [{ items: ['top-left region', 'bottom-right region', '= 2'], marks: { '2': 'hit' } }] },
      },
      {
        title: 'Why 3× and not 2×',
        text: 'At 2× the diagonals of two neighbouring slashes can leave a corner gap that a 4-direction fill slips through, merging regions that should be separate. 3× closes those gaps.',
        sketch: { kind: 'array', rows: [{ items: ['2×: leaks', '3×: sealed'], marks: { '0': 'bad', '1': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Treat the slashes as geometric line segments and trace the polygons they cut out.',
      cost: 'O(n²)',
      waste: 'Correct in principle but full of special cases; turning cuts into blocked pixels makes it plain flood fill.',
    },
    pattern: {
      pick: 'union-find',
      why: 'Split each cell into 4 triangles; join them per character ("/": top–left, right–bottom; "\\": top–right, bottom–left; space: all), join facing triangles of neighbours, count roots. Or flood fill the 3× pixel picture. O(n²).',
      not: [
        { id: 'graph-traversal', why: 'The 3× flood fill is a grid DFS; union-find is the other standard way to count the pieces.' },
        { id: 'matrix-simulation', why: 'The grid is only drawn; the count is of connected pieces.' },
      ],
    },
    watch: {
      viz: 'UfWalkViz',
      inputs: [
        { label: '[" /", "/ "]', input: { mode: 'slashes', grid: [' /', '/ '] } },
        { label: '["/\\\\", "\\\\/"]', input: { mode: 'slashes', grid: ['/\\', '\\/'] } },
        { label: '3 × 3', input: { mode: 'slashes', grid: ['/\\ ', '\\/ ', '  /'] } },
      ],
    },
    edges: ['All spaces: ["  ", "  "] → 1.', 'A diamond: ["/\\\\", "\\\\/"] → 5.', 'One slash: ["/"] → 2.'],
  },

  'graph-valid-tree': {
    aha: 'A tree on n nodes has exactly n − 1 edges and no cycle. Check the count first. Then union the edges: one whose ends already share a root closes a cycle, so it isn\'t a tree. With n − 1 edges and no cycle, the graph is automatically connected.',
    asks: {
      read: 'Which two properties make a valid tree?',
      budget: 'n ≤ 2000, edges ≤ 5000. What quick check rules out most inputs?',
      observe: 'Can 5 nodes with 5 edges ever be a tree?',
      brute: 'Checking connectivity and cycles with separate searches works. What is redundant?',
      pattern: 'Which operation reports "this edge closes a cycle"?',
      watch: 'Watch union reject the edge that closes a cycle.',
    },
    read: [
      { phrase: 'every node is reachable from every other node, and there are no cycles', says: 'Connected and acyclic: exactly n − 1 edges.' },
      { phrase: '1, 2 and 3 form a cycle', says: 'An edge between two already-connected nodes is what makes a cycle.' },
    ],
    budget: { from: 'n ≤ 2000, edges ≤ 5000', n: 7000, aim: 'O(n·α(n))', note: 'After the count check there are only n − 1 edges to union.' },
    observe: [
      {
        title: 'Count first',
        text: 'A tree on n nodes has exactly n − 1 edges. [[0,1],[1,2],[2,3],[1,3],[1,4]] has 5 edges for 5 nodes: one too many, so false at once.',
        sketch: { kind: 'array', rows: [{ items: ['5 nodes', '5 edges', '≠ 4'], marks: { '2': 'bad' } }] },
      },
      {
        title: 'A cycle with the right count',
        text: '[[0,1],[1,2],[2,0],[3,4]] has 4 edges for 5 nodes, but 2–0 joins two nodes already connected: a cycle, and then {3, 4} must be cut off.',
        sketch: { kind: 'array', rows: [{ items: ['0–1', '1–2', '2–0 cycle', '3–4'], marks: { '2': 'bad' } }] },
      },
      {
        title: 'n − 1 edges, no cycle → connected',
        text: 'Each edge that merges two pieces lowers the count by one. n − 1 merging edges take n pieces down to 1.',
        sketch: { kind: 'array', rows: [{ label: 'pieces', items: [5, 4, 3, 2, 1], marks: { '4': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Run a DFS to check every node is reached, and a separate cycle check (tracking parents) over the whole graph.',
      cost: 'O(n + e)',
      waste: 'Equally fast; the count check plus union-find does both jobs in one pass.',
    },
    pattern: {
      pick: 'union-find',
      why: 'If edges ≠ n − 1 → false; union every edge, false if one finds its ends already joined; otherwise true. O(n·α(n)).',
      not: [
        { id: 'graph-traversal', why: 'A BFS or DFS answers this too; union-find needs no adjacency lists and handles edges as they arrive.' },
        { id: 'topological-sort', why: 'Cycle detection for directed graphs; these edges are undirected.' },
      ],
    },
    watch: {
      viz: 'UfWalkViz',
      inputs: [
        { label: 'a tree', input: { mode: 'tree', n: 5, edges: [[0, 1], [0, 2], [0, 3], [1, 4]] } },
        { label: 'a cycle', input: { mode: 'tree', n: 5, edges: [[0, 1], [1, 2], [2, 0], [3, 4]] } },
        { label: 'too many edges', input: { mode: 'tree', n: 5, edges: [[0, 1], [1, 2], [2, 3], [1, 3], [1, 4]] } },
      ],
    },
    edges: [
      'One node, no edges: n = 1 → true.',
      'Two nodes, no edges: n = 2 → false (count).',
      'Right count, but a cycle: [[0,1],[1,2],[2,0],[3,4]] → false.',
    ],
  },

  'number-of-connected-components-in-an-undirected-graph': {
    aha: 'Start with every node as its own component: n of them. Every edge that joins two different trees merges them, so the count drops by one. An edge inside one tree changes nothing. The answer is n minus the number of successful unions.',
    asks: {
      read: 'What counts as one component?',
      budget: 'n ≤ 2000, edges ≤ 5000. One pass over the edges?',
      observe: 'With 5 nodes and edges [0,1], [1,2], [3,4], how many pieces?',
      brute: 'DFS from every unvisited node works. What does union-find avoid building?',
      pattern: 'How does the number of groups change with each union?',
      watch: 'Watch the count drop with each real merge.',
    },
    read: [
      { phrase: 'groups of nodes that can reach each other', says: 'Connected components: union-find groups.' },
      { phrase: 'a list of undirected `edges`', says: 'An edge joins its ends both ways.' },
    ],
    budget: { from: 'n ≤ 2000, edges ≤ 5000', n: 7000, aim: 'O(n + e·α(n))', note: 'One union per edge.' },
    observe: [
      {
        title: 'Start with n',
        text: 'Before any edge is read, each of the 5 nodes is its own component: count = 5. Every edge can only lower the count, and only when it joins two different components.',
        sketch: { kind: 'array', rows: [{ items: [0, 1, 2, 3, 4] }], caption: '5 components' },
      },
      {
        title: 'A real merge removes one',
        text: '0–1 merges two components (4 left), 1–2 another (3 left), 3–4 another (2 left).',
        sketch: { kind: 'array', rows: [{ label: 'count', items: [5, 4, 3, 2], marks: { '3': 'hit' } }] },
      },
      {
        title: 'Edges inside a piece change nothing',
        text: 'Add 2–0: 0 and 2 already share a root, so union returns false and the count stays.',
        sketch: { kind: 'array', rows: [{ items: ['2–0', 'same root', 'count stays'], marks: { '1': 'bad' } }] },
      },
    ],
    brute: {
      idea: 'Build adjacency lists; start a DFS from every node not yet visited and count the starts.',
      cost: 'O(n + e)',
      waste: 'Same speed; union-find needs no adjacency lists and works as edges arrive.',
    },
    pattern: {
      pick: 'union-find',
      why: 'count = n; for every edge, if union merges two roots, count−−. O(n + e·α(n)).',
      not: [
        { id: 'graph-traversal', why: 'A BFS or DFS answers this too; union-find needs no adjacency lists and handles edges as they arrive.' },
        { id: 'tree-dfs', why: 'The graph may have cycles and several pieces; a visited set or union-find is needed.' },
      ],
    },
    watch: {
      viz: 'UfWalkViz',
      inputs: [
        { label: '6 nodes', input: { mode: 'components', n: 6, edges: [[0, 1], [1, 2], [3, 4], [2, 0]] } },
        { label: '[[0,1],[1,2],[3,4]]', input: { mode: 'components', n: 5, edges: [[0, 1], [1, 2], [3, 4]] } },
      ],
    },
    edges: ['No edges: n = 3 → 3.', 'All in a line: n = 4, [[0,1],[1,2],[2,3]] → 1.', 'A cycle plus a single: n = 4, [[0,1],[1,2],[2,0]] → 2.'],
    why: 'Start with count = n. For each edge, union its endpoints; if they had different roots, two components became one: count−−. Edges inside a component change nothing. O(n + e · α(n)).',
  },

  'largest-component-size-by-common-factor': {
    aha: 'Comparing every pair with gcd is n² checks. But two numbers share a factor greater than 1 exactly when they share a prime factor. So union each number with each of its prime factors: numbers sharing a prime meet in that prime\'s tree. Then count numbers per root.',
    asks: {
      read: 'When are two values connected?',
      budget: '2 × 10⁴ numbers up to 10⁵. Can you compare every pair?',
      observe: '4 and 15 share no factor. Why are they in the same component in [4, 6, 15, 35]?',
      brute: 'gcd for every pair, then components: how many gcd calls?',
      pattern: 'What can numbers that share a factor meet at, without meeting each other directly?',
      watch: 'Watch numbers join their primes, and components form through them.',
    },
    read: [
      { phrase: 'connect two values with an edge if they share a common factor greater than 1', says: 'Edges come from shared prime factors.' },
      { phrase: 'Return the number of nodes in the largest connected component', says: 'Count numbers per root (not the prime helper nodes).' },
    ],
    budget: {
      from: 'n ≤ 2 × 10⁴, values ≤ 10⁵',
      rows: [['gcd for every pair', 'n² / 2 = 2 × 10⁸', 'bad', 'too slow'], ['factor each number', 'n · √M ≈ 6 × 10⁶', 'ok', 'fits']],
      aim: 'O(n·√M)',
      note: 'A sieve of smallest prime factors makes factoring even faster.',
    },
    observe: [
      {
        title: 'Connections chain',
        text: '4 and 6 share 2; 6 and 15 share 3; 15 and 35 share 5. So all four are one component, though 4 and 35 share nothing.',
        sketch: { kind: 'array', rows: [{ items: ['4', '–2–', '6', '–3–', '15', '–5–', '35'], marks: { '1': 'hit', '3': 'hit', '5': 'hit' } }] },
      },
      {
        title: 'Meet at the primes',
        text: 'Add a node for each prime. Union 4 with p2, 6 with p2 and p3, 15 with p3 and p5, 35 with p5 and p7. Numbers sharing a prime end up in one tree.',
        sketch: { kind: 'array', rows: [{ items: ['4 → p2', '6 → p2, p3', '15 → p3, p5', '35 → p5, p7'] }] },
      },
      {
        title: 'Count numbers only',
        text: 'The primes are helpers. Under the shared root sit 4, 6, 15 and 35: size 4. A number like 11 with an unused prime stays alone.',
        sketch: { kind: 'array', rows: [{ items: ['{4, 6, 15, 35}: 4', '{11}: 1'], marks: { '0': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'For every pair of numbers, compute gcd; if it is greater than 1, union them. Report the biggest set.',
      cost: 'O(n² · log M)',
      waste: 'Most pairs share nothing; factoring each number once finds every link through its primes.',
    },
    pattern: {
      pick: 'union-find',
      why: 'Union each number with its prime factors (union-find indexed by value or with prime nodes); count numbers per root, take the max. O(n·√M).',
      not: [
        { id: 'math-for-interviews', why: 'Prime factorisation is the math part; the grouping is union-find.' },
        { id: 'graph-traversal', why: 'Building the pairwise gcd graph is the n² step to avoid.' },
      ],
    },
    watch: {
      viz: 'UfWalkViz',
      inputs: [
        { label: '[4, 6, 15, 35, 11]', input: { mode: 'factor', nums: [4, 6, 15, 35, 11] } },
        { label: '[20, 50, 9, 63]', input: { mode: 'factor', nums: [20, 50, 9, 63] } },
      ],
    },
    edges: ['One number: [7] → 1.', 'Coprime: [2, 3, 5] → 1.', 'All even: [2, 4, 8] → 3.'],
  },

  'find-critical-and-pseudo-critical-edges-in-minimum-spanning-tree': {
    aha: 'Compute the minimum spanning tree weight once with Kruskal. Then test each edge twice. Remove it: if the best weight rises (or the graph disconnects), every MST needs it, so it is critical. Otherwise force it in first: if the weight is still the best, some MST uses it, so it is pseudo-critical.',
    asks: {
      read: 'What exactly separates critical from pseudo-critical?',
      budget: '200 edges, 100 nodes. How many Kruskal runs can you afford?',
      observe: 'With two edges of weight 1 that are both cheapest, can either one be removed?',
      brute: 'Enumerating every MST: why is that hopeless in general?',
      pattern: 'How can one Kruskal run answer "is this edge needed?" and "can this edge be used?"',
      watch: 'Watch each edge tested by removing it, then forcing it.',
    },
    read: [
      {
        phrase: 'if removing it from the graph would make the MST weight larger (or the graph disconnected)',
        says: 'Test: Kruskal without the edge.',
      },
      {
        phrase: 'if it appears in some MSTs but not in all of them',
        says: 'Test: Kruskal that takes the edge first; same weight means some MST uses it.',
      },
    ],
    budget: {
      from: 'edges ≤ 200, nodes ≤ 100',
      rows: [['2 Kruskal runs per edge', '2E · E·α(n) = 8 × 10⁴', 'ok', 'tiny'], ['enumerate all MSTs', 'exponential', 'bad', 'no']],
      aim: 'O(E²·α(n))',
      note: 'Sort the edges once and reuse the order for every run.',
    },
    observe: [
      {
        title: 'Remove it: does it hurt?',
        text: 'Edges #0 (0–1, weight 1) and #1 (1–2, weight 1) are the only cheap way to reach their ends. Without either, the best tree gets heavier: critical.',
        sketch: { kind: 'array', rows: [{ items: ['best = 7', 'without #0: 8', 'critical'], marks: { '2': 'bad' } }] },
      },
      {
        title: 'Force it: can it be in a best tree?',
        text: '#2 (2–3, weight 2) and #3 (0–3, weight 2) are interchangeable: without either, another weight-2 edge fills in (no harm), and forcing either still gives weight 7. Pseudo-critical.',
        sketch: { kind: 'array', rows: [{ items: ['without #2: 7', 'forced #2: 7', 'pseudo'], marks: { '2': 'hit' } }] },
      },
      {
        title: 'Neither',
        text: '#6 (1–4, weight 6) is never worth it: forcing it in raises the total above 7, so no MST uses it.',
        sketch: { kind: 'array', rows: [{ items: ['forced #6: 10', '> 7', 'neither'], marks: { '2': 'dim' } }] },
      },
    ],
    brute: {
      idea: 'Enumerate every spanning tree, keep the minimum-weight ones, and check which edges are in all of them and which in some.',
      cost: 'O(C(E, n − 1) · n)',
      waste: 'The number of spanning trees explodes; two Kruskal runs per edge answer both questions.',
    },
    pattern: {
      pick: 'union-find',
      why: 'Kruskal with union-find, re-run per edge: excluded (weight up or disconnected → critical), else forced (weight equal → pseudo-critical). O(E²·α(n)).',
      not: [
        { id: 'greedy', why: 'Kruskal is the greedy part; the insight is re-running it with an edge removed or forced.' },
        { id: 'shortest-paths', why: 'Spanning tree weight, not distances from a source.' },
      ],
    },
    watch: {
      viz: 'UfWalkViz',
      inputs: [
        {
          label: 'the example',
          input: { mode: 'critical', n: 5, edges: [[0, 1, 1], [1, 2, 1], [2, 3, 2], [0, 3, 2], [0, 4, 3], [3, 4, 3], [1, 4, 6]] },
        },
        { label: 'a square of equal edges', input: { mode: 'critical', n: 4, edges: [[0, 1, 1], [1, 2, 1], [2, 3, 1], [0, 3, 1]] } },
      ],
    },
    edges: [
      'A tree already (n − 1 edges) → every edge is critical.',
      'Square of equal weights: every edge pseudo-critical → [[], [0, 1, 2, 3]].',
      'A bridge (the only link to a node) → critical, whatever its weight.',
    ],
  },

  'greatest-common-divisor-traversal': {
    aha: 'You can step between two indices when their values share a prime factor. Instead of checking every pair, give every prime a node and union each index with the primes dividing its value. Indices sharing a prime meet in its tree. The answer is true exactly when every index ends up under one root.',
    asks: {
      read: 'When can you move between two indices, and what must be true for every pair?',
      budget: '10⁵ values up to 10⁵. Pairwise gcd?',
      observe: 'In [2, 3, 6], 2 and 3 share nothing. How do you still get from one to the other?',
      brute: 'Building the pairwise gcd graph: how many pairs?',
      pattern: 'Where can indices with a common prime meet?',
      watch: 'Watch indices join their primes, then check for one root.',
    },
    read: [
      { phrase: 'if and only if `gcd(nums[i], nums[j]) > 1`', says: 'A move needs a shared prime factor.' },
      {
        phrase: 'there is a sequence of moves that takes you from `i` to `j`',
        says: 'Paths may go through other indices: connectivity of the whole set.',
      },
    ],
    budget: {
      from: 'n ≤ 10⁵, values ≤ 10⁵',
      rows: [['pairwise gcd', 'n² = 10¹⁰', 'bad', 'too slow'], ['sieve + factor each value', 'V log log V + n log V', 'ok', 'fits']],
      aim: 'O(V log log V + n log V)',
      note: 'A smallest-prime-factor sieve factors each value in O(log V).',
    },
    observe: [
      {
        title: 'Through a middle index',
        text: '2 and 3 share nothing, but 6 shares 2 with the first and 3 with the second: 2 → 6 → 3.',
        sketch: { kind: 'array', rows: [{ items: ['2', '–p2–', '6', '–p3–', '3'], marks: { '2': 'hit' } }] },
      },
      {
        title: 'Primes as meeting points',
        text: 'Union index 0 (value 2) with p2, index 1 (value 3) with p3, index 2 (value 6) with p2 and p3. Everything ends under one root: true.',
        sketch: { kind: 'array', rows: [{ items: ['2 → p2', '3 → p3', '6 → p2, p3', 'one root'], marks: { '3': 'hit' } }] },
      },
      {
        title: 'A 1 is stuck',
        text: 'gcd(1, x) = 1 for every x: an index holding 1 can\'t move anywhere. With more than one index, that alone makes the answer false.',
        sketch: { kind: 'array', rows: [{ items: ['[1, 2]', '1 has no primes', 'false'], marks: { '2': 'bad' } }] },
      },
    ],
    brute: {
      idea: 'Connect every pair of indices whose values have gcd > 1, then BFS from index 0 and check it reaches all.',
      cost: 'O(n² · log V)',
      waste: 'Up to 10¹⁰ pairs; factoring each value once finds every link through primes.',
    },
    pattern: {
      pick: 'union-find',
      why: 'Union each index with the primes of its value (sieve for factoring); true when all indices share one root. O(V log log V + n log V).',
      not: [
        { id: 'math-for-interviews', why: 'The sieve and factoring are the math; connectivity is union-find.' },
        { id: 'graph-traversal', why: 'A BFS needs the edges, and building them pairwise is the slow part.' },
      ],
    },
    watch: {
      viz: 'UfWalkViz',
      inputs: [
        { label: '[2, 3, 6]', input: { mode: 'gcd', nums: [2, 3, 6] } },
        { label: '[3, 9, 5]', input: { mode: 'gcd', nums: [3, 9, 5] } },
        { label: '[4, 3, 12, 8]', input: { mode: 'gcd', nums: [4, 3, 12, 8] } },
      ],
    },
    edges: ['One index: [1] → true.', 'A 1 among others: [1, 2] → false.', 'Repeated values: [6, 6] → true.'],
  },
};
