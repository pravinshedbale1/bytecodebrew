/** Practice thinking walkthroughs: advanced-graphs (format: src/data/think/index.js). */

export default {
  'is-graph-bipartite': {
    aha: 'Put any node in group A. Then there is no choice left: its neighbours must be in B, theirs in A, and so on. Spread the colours with BFS; the graph splits exactly when no edge ever joins two nodes of the same colour. A clash means an odd cycle, which can\'t alternate A, B, A, B and close up.',
    asks: {
      read: 'What must every edge do? Can the graph have several separate parts?',
      budget: '100 nodes. Is trying every split possible?',
      observe: 'In [[1,2,3],[0,2],[0,1,3],[0,2]], put 0 in A. Where must 1 and 2 go? What goes wrong?',
      brute: 'Trying all 2ⁿ splits: what does that cost?',
      pattern: 'Once one node is placed, are the others free to choose?',
      watch: 'Watch the colours spread until an edge clashes.',
    },
    read: [
      { phrase: 'every edge connects a node in A with a node in B', says: 'A two-colouring: neighbours always differ.' },
      { phrase: 'The graph may be made of several disconnected parts', says: 'Start a new colouring from every node not yet coloured.' },
    ],
    budget: {
      from: 'n ≤ 100',
      rows: [['try every split', '2¹⁰⁰', 'bad', 'impossible'], ['BFS colouring', 'V + E', 'ok', 'tiny']],
      aim: 'O(V + E)',
      note: 'Each part has only two possible colourings: placing one node decides the rest.',
    },
    observe: [
      {
        title: 'One choice forces the rest',
        text: 'Put 0 in A. Its neighbours 1, 2, 3 must all go to B. But 1–2 is an edge, and both are now in B.',
        sketch: { kind: 'array', rows: [{ label: 'A', items: [0] }, { label: 'B', items: [1, 2, 3], marks: { '0': 'bad', '1': 'bad' } }] },
      },
      {
        title: 'A clash is an odd cycle',
        text: '0 – 1 – 2 – 0 is a triangle: three edges. Going round it, colours alternate A, B, A… and the third step lands back on A at a node that needs B. Even cycles close up fine.',
        sketch: { kind: 'array', rows: [{ items: ['0: A', '1: B', '2: A?', '2–0 clash'], marks: { '3': 'bad' } }] },
      },
      {
        title: 'Restart for every part',
        text: 'A node not reached by earlier searches belongs to a separate part. Colour it A and spread again: parts don\'t affect each other.',
        sketch: { kind: 'array', rows: [{ items: ['part 1 done', 'new part: start A'], marks: { '1': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Try all 2ⁿ ways to put each node in A or B and check every edge.',
      cost: 'O(2ⁿ · E)',
      waste: 'Placing one node fixes its whole part, so only one colouring per part needs trying.',
    },
    pattern: {
      pick: 'advanced-graphs',
      why: 'BFS/DFS two-colouring of every part; false on the first edge with equal colours. O(V + E).',
      not: [
        { id: 'graph-traversal', why: 'It is a BFS; what it tracks (a colour per node and a clash check) is the bipartite test.' },
        { id: 'union-find', why: 'Union-find can also do it (each node with "the opposite of" its neighbours); BFS is simpler.' },
      ],
    },
    watch: {
      viz: 'AgWalkViz',
      inputs: [
        { label: 'the example (a triangle)', input: { mode: 'color', n: 4, edges: [[0, 1], [0, 2], [0, 3], [1, 2], [2, 3]], base: 0 } },
        { label: 'a square', input: { mode: 'color', n: 4, edges: [[0, 1], [0, 3], [1, 2], [2, 3]], base: 0 } },
      ],
    },
    edges: ['No edges: [[],[]] → true.', 'A triangle: [[1,2],[0,2],[0,1]] → false.', 'Two parts, one with a triangle → false.'],
  },

  'possible-bipartition': {
    aha: 'People are nodes and dislikes are edges. Two groups with every dislike split between them is exactly a two-colouring. Colour each part with BFS: everyone a person dislikes goes to the other group, and if two people who dislike each other are forced into the same group, it\'s impossible.',
    asks: {
      read: 'Can a group be empty? What must every dislike satisfy?',
      budget: '2000 people, 10⁴ dislikes. One pass?',
      observe: 'With dislikes 1–2, 1–3, 2–4, where must 2, 3 and 4 go if 1 is in group A?',
      brute: 'Trying all 2ⁿ splits: why is that hopeless?',
      pattern: 'This is "Is Graph Bipartite?" in disguise. What are the nodes and edges?',
      watch: 'Watch people fill two groups as the dislikes force them.',
    },
    read: [
      { phrase: 'must end up in different groups', says: 'A dislike is an edge whose ends need different colours.' },
      { phrase: '(a group may be empty)', says: 'People with no dislikes can go anywhere.' },
    ],
    budget: { from: 'n ≤ 2000, dislikes ≤ 10⁴', n: 12000, aim: 'O(n + D)', note: 'Build adjacency lists, then one BFS per part.' },
    observe: [
      {
        title: 'Dislikes force the groups',
        text: '1 in A. 1 dislikes 2 and 3: both to B. 2 dislikes 4: 4 to A. No dislike is inside a group: true.',
        sketch: { kind: 'array', rows: [{ label: 'A', items: [1, 4] }, { label: 'B', items: [2, 3] }] },
      },
      {
        title: 'Three who all dislike each other',
        text: '1–2, 1–3, 2–3: 1 in A forces 2 and 3 into B, but they dislike each other. Impossible.',
        sketch: { kind: 'array', rows: [{ label: 'B', items: [2, 3], marks: { '0': 'bad', '1': 'bad' } }] },
      },
      {
        title: 'Or: union "the enemies of x"',
        text: 'Everyone x dislikes must share the group opposite x, so union them together. If x ever lands in the same set as someone it dislikes, fail.',
        sketch: { kind: 'array', rows: [{ items: ['enemies of 1: {2, 3}', 'same group'], marks: { '1': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Assign each person to group 0 or 1 in all 2ⁿ ways and check every dislike.',
      cost: 'O(2ⁿ · D)',
      waste: 'Trying both groups for every person repeats work: once one person in a connected group of dislikes is placed, everyone else in that group is forced.',
    },
    pattern: {
      pick: 'advanced-graphs',
      why: 'Build the dislike graph and two-colour it with BFS (or union each person\'s enemies); false on a clash. O(n + D).',
      not: [
        { id: 'union-find', why: 'The union-find version merges each person\'s enemies; same result.' },
        { id: 'greedy', why: 'Placing people one by one without propagating misses chains of dislikes.' },
      ],
    },
    watch: {
      viz: 'AgWalkViz',
      inputs: [
        { label: 'n 4, [1,2],[1,3],[2,4]', input: { mode: 'color', n: 4, edges: [[1, 2], [1, 3], [2, 4]], base: 1 } },
        { label: 'a triangle of dislikes', input: { mode: 'color', n: 3, edges: [[1, 2], [1, 3], [2, 3]], base: 1 } },
      ],
    },
    edges: ['No dislikes: n = 3, [] → true.', 'A triangle: [[1,2],[1,3],[2,3]] → false.', 'A 4-cycle: [[1,2],[2,3],[3,4],[4,1]] → true.'],
  },

  'critical-connections-in-a-network': {
    aha: 'A connection is critical exactly when no cycle passes through it: a cycle would give a second way around. One DFS finds every such edge. Record disc[u], when u was first reached, and low[u], the earliest disc reachable from u\'s subtree using one back edge. For a DFS edge u → v, if low[v] > disc[u], nothing below v can get back above u without that edge: a bridge.',
    asks: {
      read: 'What makes a connection critical?',
      budget: '10⁵ servers and connections. Can you test each edge separately?',
      observe: 'In [[0,1],[1,2],[2,0],[1,3]], which edge is on no cycle?',
      brute: 'Remove each edge and check connectivity: how expensive is that?',
      pattern: 'How can one DFS tell whether a subtree has another way back up?',
      watch: 'Watch disc and low fill in, and bridges appear when low stays too high.',
    },
    read: [
      { phrase: 'one whose removal would leave some server unable to reach some other server', says: 'A bridge: an edge on no cycle.' },
      { phrase: 'Every server can reach every other server', says: 'One DFS from server 0 reaches everything.' },
    ],
    budget: {
      from: 'V, E ≤ 10⁵',
      rows: [['remove each edge + BFS', 'E · (V + E) = 2 × 10¹⁰', 'bad', 'too slow'], ['one DFS (low-link)', 'V + E', 'ok', 'fits']],
      aim: 'O(V + E)',
      note: 'Use an explicit stack in languages with small recursion limits.',
    },
    observe: [
      {
        title: 'Bridges are on no cycle',
        text: '0, 1, 2 form a triangle: removing any of its edges leaves another way round. 1–3 is the only way to reach 3: critical.',
        sketch: { kind: 'array', rows: [{ items: ['0–1', '1–2', '2–0', '1–3'], marks: { '3': 'bad' } }] },
      },
      {
        title: 'low = how high the subtree can climb',
        text: 'DFS reaches 0 (disc 1), 1 (2), 2 (3). From 2, the back edge to 0 lets it climb to time 1, so low[2] = 1, and low[1] = 1 too.',
        sketch: { kind: 'array', rows: [{ label: 'disc / low', items: ['0: 1/1', '1: 2/1', '2: 3/1', '3: 4/4'] }] },
      },
      {
        title: 'low[v] > disc[u] → bridge',
        text: 'For 1 → 3: low[3] = 4 > disc[1] = 2. Nothing under 3 can climb back to 1 or above without this edge. For 1 → 2: low[2] = 1 ≤ 2, so a cycle covers it.',
        sketch: { kind: 'array', rows: [{ items: ['1→3: 4 > 2 bridge', '1→2: 1 ≤ 2 no'], marks: { '0': 'bad', '1': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Remove one connection at a time and BFS from server 0; if some server becomes unreachable, that connection is critical.',
      cost: 'O(E · (V + E))',
      waste: 'Each test redoes a whole search; one DFS with low-link values decides every edge at once.',
    },
    pattern: {
      pick: 'advanced-graphs',
      why: 'Tarjan\'s bridge finding: DFS with disc and low; tree edge u → v is a bridge when low[v] > disc[u]. O(V + E).',
      not: [
        { id: 'graph-traversal', why: 'A plain DFS visits everything; disc/low is what reveals the cycles.' },
        { id: 'union-find', why: 'Union-find can\'t remove edges, so it can\'t test each one cheaply.' },
      ],
    },
    watch: {
      viz: 'AgWalkViz',
      inputs: [
        { label: 'the example', input: { mode: 'bridges', n: 4, edges: [[0, 1], [1, 2], [2, 0], [1, 3]] } },
        {
          label: 'two cycles and a chain',
          input: { mode: 'bridges', n: 7, edges: [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [4, 5], [5, 3], [5, 6]] },
        },
      ],
    },
    edges: ['Two servers: [[0,1]] → [[0,1]].', 'One big cycle: [[0,1],[1,2],[2,0]] → [].', 'A tree: [[0,1],[1,2]] → both connections are critical.'],
  },

  'valid-arrangement-of-pairs': {
    aha: 'Treat each number as a node and each pair [a, b] as an arrow a → b. A valid arrangement walks every arrow exactly once: an Euler path. Start where one more arrow leaves than arrives, walk unused arrows until stuck, and put stuck nodes at the front of the path as you back up (Hierholzer). Any loops skipped on the first walk get spliced in.',
    asks: {
      read: 'What links one pair to the next? Must every pair be used?',
      budget: '10⁵ pairs. Can backtracking work?',
      observe: 'In [[5,1],[4,5],[11,9],[9,4]], which number must come first?',
      brute: 'Trying every order of the pairs: how many orders?',
      pattern: 'Using every arrow exactly once: what kind of path is that?',
      watch: 'Watch the walk get stuck and the path build from the back.',
    },
    read: [
      { phrase: 'the end of the previous pair equals the start of the current one', says: 'Pairs are arrows that must chain head to tail.' },
      { phrase: 'uses every pair exactly once', says: 'Every arrow once: an Euler path.' },
      { phrase: 'The input is guaranteed to have one', says: 'At most one node has out − in = +1 (the start); no failure case.' },
    ],
    budget: {
      from: 'pairs ≤ 10⁵',
      rows: [['backtracking', 'exponential', 'bad', 'no'], ['Hierholzer', 'O(E)', 'ok', 'fits']],
      aim: 'O(E)',
      note: 'Each arrow is pushed and popped once; use a stack, not recursion.',
    },
    observe: [
      {
        title: 'The start leaves more than it receives',
        text: '11 has one arrow out (11 → 9) and none in: out − in = +1. Every other number balances except 1 (−1), where the path ends.',
        sketch: { kind: 'array', rows: [{ label: 'out − in', items: ['11: +1', '9: 0', '4: 0', '5: 0', '1: −1'], marks: { '0': 'hit', '4': 'bad' } }] },
      },
      {
        title: 'Greedy can hit a dead end',
        text: 'With [1,5], [1,2], [2,1], [1,3], [3,1], walking 1 → 5 first gets stuck at 5 with arrows still unused at 1.',
        sketch: { kind: 'array', rows: [{ items: ['1 → 5', 'stuck', '1 → 2, 2 → 1, 1 → 3, 3 → 1 unused'], marks: { '1': 'bad' } }] },
      },
      {
        title: 'Stuck nodes go to the front',
        text: '5 is the end of the trip: write it last. Back at 1, walk the loops 1 → 2 → 1 → 3 → 1, then unwind: the path reads 1 2 1 3 1 5.',
        sketch: { kind: 'array', rows: [{ label: 'path', items: [1, 2, 1, 3, 1, 5], marks: { '5': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Backtracking: from the start, try each unused pair that begins where the chain ends; undo when stuck before using every pair.',
      cost: 'O(E^d)',
      waste: 'A wrong early choice can force a huge undo; Hierholzer never undoes, it just defers stuck nodes.',
    },
    pattern: {
      pick: 'advanced-graphs',
      why: 'Euler path by Hierholzer: start at out − in = +1, stack-walk unused arrows, prepend stuck nodes; consecutive path nodes are the pairs. O(E).',
      not: [
        {
          id: 'backtracking',
          why: 'Trying pairs in every order with undo is correct, but can explore exponentially many dead ends; Hierholzer\'s walk uses every edge once.',
        },
        { id: 'topological-sort', why: 'Arrows can form cycles; the order is over edges, not nodes.' },
      ],
    },
    watch: {
      viz: 'AgWalkViz',
      inputs: [
        { label: 'the example', input: { mode: 'euler', pairs: [[5, 1], [4, 5], [11, 9], [9, 4]] } },
        { label: 'a dead end first', input: { mode: 'euler', pairs: [[1, 5], [1, 2], [2, 1], [1, 3], [3, 1]] } },
      ],
    },
    edges: [
      'One pair: [[1,2]] → [[1,2]].',
      'A loop: [[1,2],[2,1]] → [[1,2],[2,1]] (start anywhere).',
      'Dead end first: [[1,5],[1,2],[2,1]] → [[1,2],[2,1],[1,5]].',
    ],
  },
};
