/** Practice thinking walkthroughs: shortest-paths (format: src/data/think/index.js). */

export default {
  'network-delay-time': {
    aha: 'Every node hears the signal at the length of its fastest path from k, and the answer is the slowest of those. With non-negative times, Dijkstra finds them all: repeatedly settle the unsettled node with the smallest known time. Nothing found later can reach it faster, because every other route is already at least that long.',
    asks: {
      read: 'Are edges one-way? What if some node is never reached?',
      budget: '100 nodes, 6000 edges. Which shortest-path algorithm fits?',
      observe: 'In the 5-node example, why is node 3 not reached at time 6 even though 1 → 3 is a direct edge?',
      brute: 'Relaxing every edge n − 1 times (Bellman–Ford) works. What does it redo?',
      pattern: 'Which node\'s time can you be sure of first?',
      watch: 'Watch nodes settle in order of time, with stale heap entries skipped.',
    },
    read: [
      { phrase: 'a signal takes `w` time to travel from `u` to `v`', says: 'A directed edge with a non-negative weight.' },
      { phrase: 'Return how long it takes until every node has received it', says: 'The largest shortest-path distance from k.' },
      { phrase: 'or `-1` if some node never does', says: 'An unreachable node keeps distance ∞.' },
    ],
    budget: {
      from: 'n ≤ 100, edges ≤ 6000',
      rows: [['Bellman–Ford', 'V · E = 6 × 10⁵', 'ok', 'fits'], ['Dijkstra with a heap', 'E log V ≈ 4 × 10⁴', 'ok', 'fits, faster']],
      aim: 'O(E log V)',
      note: 'Both fit; Dijkstra is the expected answer for non-negative weights.',
    },
    observe: [
      {
        title: 'The direct edge isn\'t always fastest',
        text: 'The direct edge 1 → 3 takes 6, but going 1 → 2 → 3 takes 2 + 3 = 5. Node 3 hears the signal at 5: fewest edges is not fastest, which is why plain BFS isn\'t enough.',
        sketch: { kind: 'array', rows: [{ items: ['1 → 3: 6', '1 → 2 → 3: 5'], marks: { '1': 'hit' } }] },
      },
      {
        title: 'The smallest known time is final',
        text: 'Node 2 is known at 2, node 3 at 6. Any other way to 2 goes through 3 (already 6 > 2) and weights are ≥ 0, so 2\'s time can\'t improve: settle it.',
        sketch: { kind: 'array', rows: [{ label: 'heap', items: ['(2, 2)', '(6, 3)'], marks: { '0': 'hit' } }] },
      },
      {
        title: 'The answer is the slowest node',
        text: 'Final times: 1: 0, 2: 2, 3: 5, 4: 6, 5: 8. Everyone has the signal at 8.',
        sketch: { kind: 'array', rows: [{ items: [0, 2, 5, 6, 8], marks: { '4': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Bellman–Ford: start with dist[k] = 0 and relax every edge n − 1 times.',
      cost: 'O(V · E)',
      waste: 'Every round looks at every edge, even when only a few distances can still change.',
    },
    pattern: {
      pick: 'shortest-paths',
      why: 'Dijkstra from k with a min-heap; skip stale entries; answer = max distance, −1 if any is ∞. O(E log V).',
      not: [
        { id: 'graph-traversal', why: 'Plain BFS finds shortest paths only when every step costs the same; here the costs differ.' },
        { id: 'heap-patterns', why: 'The heap is the tool; the reason it works is that weights are non-negative.' },
      ],
    },
    watch: {
      viz: 'SpWalkViz',
      inputs: [
        { label: '5 nodes from 1', input: { mode: 'delay', n: 5, times: [[1, 2, 2], [1, 3, 6], [2, 3, 3], [2, 4, 7], [3, 4, 1], [4, 5, 2]], k: 1 } },
        { label: 'the example, from 2', input: { mode: 'delay', n: 4, times: [[2, 1, 1], [2, 3, 1], [3, 4, 1]], k: 2 } },
        { label: 'from 1: stuck', input: { mode: 'delay', n: 4, times: [[2, 1, 1], [2, 3, 1], [3, 4, 1]], k: 1 } },
      ],
    },
    edges: ['One node: n = 1 → 0.', 'Unreachable node: [[1,2,1]], n = 2, k = 2 → −1.', 'Zero-time edges: [[1,2,0]], k = 1 → 0.'],
  },

  'path-with-minimum-effort': {
    aha: 'A route\'s effort is its single biggest step, not a sum. Extending a route can only keep that maximum or raise it, never lower it, which is exactly what Dijkstra needs. So run Dijkstra where a cell\'s cost is the smallest possible "biggest step" to reach it, combining with max instead of +.',
    asks: {
      read: 'How is a route\'s effort measured: total or maximum?',
      budget: '100 × 100 cells. Dijkstra, or binary search on the effort?',
      observe: 'In [[1,2,2],[3,8,2],[5,3,5]], which route avoids the 8?',
      brute: 'Trying every route: why is that hopeless?',
      pattern: 'What property of "max so far" lets Dijkstra still work?',
      watch: 'Watch cells settle in order of their best effort.',
    },
    read: [
      {
        phrase: 'The effort of a route is the largest absolute height difference between two consecutive cells on it',
        says: 'Path cost = max of step costs: a minimax path.',
      },
      { phrase: 'moving up, down, left or right', says: 'Routes can wind around high cells in any direction: no fill order, a real search.' },
    ],
    budget: {
      from: 'grid ≤ 100 × 100',
      rows: [['Dijkstra on max-so-far', 'mn log(mn) ≈ 1.4 × 10⁵', 'ok', 'fits'], ['binary search effort + BFS', 'mn · log(10⁶) ≈ 2 × 10⁵', 'ok', 'fits']],
      aim: 'O(mn log(mn))',
      note: 'Both work: if some effort is enough, any bigger effort is too, which is what binary search needs.',
    },
    observe: [
      {
        title: 'Effort is the worst step',
        text: 'Through the 8 the worst step is 6. Around it, 1 → 2 → 2 → 2 → 5 has steps 1, 0, 0, 3: effort 3. The best route, 1 → 3 → 5 → 3 → 5, has steps of 2 at most: effort 2.',
        sketch: { kind: 'array', rows: [{ items: ['via 8: 6', 'right side: 3', 'left side: 2'], marks: { '2': 'hit' } }] },
      },
      {
        title: 'Max never decreases',
        text: 'Extending a route with a step of size d gives effort max(current, d) ≥ current. Like adding a non-negative weight, so the smallest effort in the heap is final.',
        sketch: { kind: 'array', rows: [{ items: ['effort 2', '+ step 1', '= 2'], marks: { '2': 'hit' } }] },
      },
      {
        title: 'Or binary search the effort',
        text: 'Allowing effort E, a BFS using only steps ≤ E either reaches the corner or not, and if E works so does anything bigger. Binary search the smallest E.',
        sketch: { kind: 'array', rows: [{ items: ['E = 1: no', 'E = 2: yes', '→ 2'], marks: { '2': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'DFS over every simple route from the top-left to the bottom-right, tracking the largest step, and keep the smallest.',
      cost: 'O(4^(mn))',
      waste: 'Routes overlap enormously; Dijkstra settles each cell once with its best effort.',
    },
    pattern: {
      pick: 'shortest-paths',
      why: 'Dijkstra with cost = max(effort so far, |height difference|); the corner\'s settled value is the answer. O(mn log(mn)).',
      not: [
        { id: 'binary-search-on-answer', why: 'Also valid: binary search the effort and check with BFS.' },
        { id: 'dp-grid', why: 'Routes can move up and left, so there is no fill order.' },
      ],
    },
    watch: {
      viz: 'SpWalkViz',
      inputs: [
        { label: '[[1,2,2],[3,8,2],[5,3,5]]', input: { mode: 'effort', grid: [[1, 2, 2], [3, 8, 2], [5, 3, 5]] } },
        { label: '[[1,2,3],[3,8,4],[5,3,5]]', input: { mode: 'effort', grid: [[1, 2, 3], [3, 8, 4], [5, 3, 5]] } },
      ],
    },
    edges: ['One cell: [[5]] → 0.', 'Flat grid: all heights equal → 0.', 'One row: [[1,10,2]] → 9.'],
  },

  'cheapest-flights-within-k-stops': {
    aha: 'Dijkstra finds the cheapest route but ignores how many flights it takes. Limit the flights instead: Bellman–Ford rounds, where after round r every price is the cheapest using at most r flights. Run exactly k + 1 rounds, and make each round read a copy of the previous one so a single round can\'t chain two flights.',
    asks: {
      read: 'k stops means how many flights?',
      budget: '100 cities, k up to 100, ~5000 flights. How many rounds?',
      observe: 'With k = 1, why isn\'t 0 → 1 → 2 → 3 (cost 400) allowed?',
      brute: 'Trying every route with at most k + 1 flights: how many are there?',
      pattern: 'Which algorithm grows paths one edge at a time?',
      watch: 'Watch the price table, one round per flight allowed.',
    },
    read: [
      {
        phrase: 'with at most `k` stops in between (that is, at most `k + 1` flights)',
        says: 'A limit on the number of edges: k + 1 Bellman–Ford rounds.',
      },
      { phrase: 'is a one-way flight', says: 'Directed edges.' },
      { phrase: 'or `-1` if there is no such route', says: 'Still ∞ after the rounds → −1.' },
    ],
    budget: {
      from: 'n ≤ 100, k ≤ 100, flights ≤ 4950',
      rows: [['k + 1 rounds over all flights', '101 × 4950 ≈ 5 × 10⁵', 'ok', 'fits']],
      aim: 'O(k · E)',
      note: 'Dijkstra on (city, flights used) states also works.',
    },
    observe: [
      {
        title: 'Cheapest overall breaks the limit',
        text: '0 → 1 → 2 → 3 costs 100 + 100 + 200 = 400 but uses 3 flights. With k = 1 only 2 flights are allowed: 0 → 1 → 3 costs 700.',
        sketch: { kind: 'array', rows: [{ items: ['3 flights: 400 ✗', '2 flights: 700 ✓'], marks: { '0': 'bad', '1': 'hit' } }] },
      },
      {
        title: 'Round r = at most r flights',
        text: 'Round 1 can only use flights out of 0: price[1] = 100. Round 2 extends those by one more flight: price[2] = 200, price[3] = 700.',
        sketch: {
          kind: 'array',
          rows: [
            { label: '≤ 1 flight', items: ['0: 0', '1: 100', '2: ∞', '3: ∞'] },
            { label: '≤ 2 flights', items: ['0: 0', '1: 100', '2: 200', '3: 700'], marks: { '3': 'hit' } },
          ],
        },
      },
      {
        title: 'Read the copy',
        text: 'If round 2 updated price[2] = 200 and then used it for 2 → 3 in the same round, 3 would get 400 using 3 flights. Reading the previous round\'s copy prevents that.',
        sketch: { kind: 'array', rows: [{ items: ['prev[2] = ∞', 'so 2 → 3 waits', 'for round 3'] }] },
      },
    ],
    brute: {
      idea: 'DFS every route from src using at most k + 1 flights and keep the cheapest that ends at dst.',
      cost: 'O(d^(k+1))',
      waste: 'Routes to the same city with the same number of flights are explored many times; one table per round keeps only the cheapest.',
    },
    pattern: {
      pick: 'shortest-paths',
      why: 'Bellman–Ford for exactly k + 1 rounds, each round relaxing every flight from a copy of the previous prices. O(k · E).',
      not: [
        { id: 'dp-linear', why: 'It is a DP over (flights used, city): exactly what the rounds compute.' },
        { id: 'graph-traversal', why: 'Plain BFS finds shortest paths only when every step costs the same; here the costs differ.' },
      ],
    },
    watch: {
      viz: 'SpWalkViz',
      inputs: [
        {
          label: 'k = 1',
          input: { mode: 'flights', n: 4, flights: [[0, 1, 100], [1, 2, 100], [2, 0, 100], [1, 3, 600], [2, 3, 200]], src: 0, dst: 3, k: 1 },
        },
        {
          label: 'k = 2',
          input: { mode: 'flights', n: 4, flights: [[0, 1, 100], [1, 2, 100], [2, 0, 100], [1, 3, 600], [2, 3, 200]], src: 0, dst: 3, k: 2 },
        },
      ],
    },
    edges: [
      'Direct flight only: k = 0 → that flight\'s price, or −1.',
      'Too few stops: dst needs 3 flights, k = 1 → −1.',
      'Cheaper with more stops but over the limit → the pricier legal route.',
    ],
  },

  'path-with-maximum-probability': {
    aha: 'A path\'s probability is the product of its edges, and multiplying by a number ≤ 1 can only keep a value or shrink it: the mirror image of adding a non-negative weight. So run Dijkstra with a max-heap: the node with the highest probability so far can never be improved later.',
    asks: {
      read: 'How do probabilities combine along a path?',
      budget: '10⁴ nodes, 2 × 10⁴ edges. Which algorithm?',
      observe: 'From 0 to 2: is the direct edge (0.2) or 0 → 1 → 2 (0.5 × 0.5) better?',
      brute: 'Relaxing all edges until nothing improves: how many passes?',
      pattern: 'Dijkstra needs costs that never improve as a path grows. Do products of probabilities behave that way?',
      watch: 'Watch the most likely node settle first.',
    },
    read: [
      { phrase: 'The success probability of a path is the product of its edges\' probabilities', says: 'Combine by ×; each factor is at most 1.' },
      { phrase: 'or `0` if there is no path', says: 'Unreached nodes keep probability 0.' },
      { phrase: 'An undirected graph', says: 'Relax each edge in both directions.' },
    ],
    budget: {
      from: 'n ≤ 10⁴, edges ≤ 2 × 10⁴',
      rows: [['Bellman–Ford style', 'V · E = 2 × 10⁸', 'bad', 'too slow'], ['Dijkstra (max-heap)', 'E log V ≈ 3 × 10⁵', 'ok', 'fits']],
      aim: 'O(E log V)',
      note: 'Or take −log of each probability and run ordinary Dijkstra on sums.',
    },
    observe: [
      {
        title: 'Two cheap edges can beat one',
        text: '0 → 2 directly succeeds with 0.2. Through 1: 0.5 × 0.5 = 0.25, better.',
        sketch: { kind: 'array', rows: [{ items: ['direct: 0.2', 'via 1: 0.25'], marks: { '1': 'hit' } }] },
      },
      {
        title: 'Products only shrink',
        text: 'A path through a node with probability p can reach its neighbours with at most p. So once the most likely node in the heap is popped, nothing can beat its value.',
        sketch: { kind: 'array', rows: [{ items: ['p', '× q ≤ 1', '≤ p'] }] },
      },
      {
        title: 'Max-heap Dijkstra',
        text: 'Pop the highest probability; for each neighbour, p × q beats its best? Update and push. Stop when end is popped.',
        sketch: { kind: 'array', rows: [{ label: 'max-heap', items: ['(0.5, 1)', '(0.2, 2)'], marks: { '0': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Repeatedly go over every edge in both directions and improve a node\'s best probability if this edge gives a higher product, until a full pass changes nothing.',
      cost: 'O(V · E)',
      waste: 'Every pass rechecks every edge; Dijkstra finalises one node at a time.',
    },
    pattern: {
      pick: 'shortest-paths',
      why: 'Dijkstra with a max-heap, combining with × instead of +; return best[end] when it is popped, 0 if never. O(E log V).',
      not: [
        { id: 'graph-traversal', why: 'Plain BFS finds shortest paths only when every step costs the same; here the costs differ.' },
        { id: 'dp-linear', why: 'There is no fixed order to fill in; the graph can loop.' },
      ],
    },
    watch: {
      viz: 'SpWalkViz',
      inputs: [
        { label: 'the example', input: { mode: 'prob', n: 3, edges: [[0, 1, 0.5], [1, 2, 0.5], [0, 2, 0.2]], start: 0, end: 2 } },
        {
          label: '4 nodes',
          input: { mode: 'prob', n: 4, edges: [[0, 1, 0.5], [1, 2, 0.5], [0, 2, 0.2], [2, 3, 0.9], [1, 3, 0.3]], start: 0, end: 3 },
        },
      ],
    },
    edges: ['No path: n = 3, [[0,1]], 0 → 2 → 0.', 'A zero edge: [[0,1]] with 0 → 0.', 'Certain path: all probabilities 1 → 1.'],
  },

  'minimum-obstacle-removal-to-reach-corner': {
    aha: 'Moving into an empty cell costs 0 and into an obstacle costs 1 (you remove it). With only 0 and 1 costs, a deque replaces Dijkstra\'s heap: push a 0-cost neighbour to the front and a 1-cost one to the back. Cells still leave the deque in order of cost, in O(1) per move.',
    asks: {
      read: 'What does a move cost?',
      budget: 'Up to 10⁵ cells. Heap or something cheaper?',
      observe: 'In [[0,1,1],[1,1,0],[1,1,0]], what is the fewest obstacles on any route?',
      brute: 'Dijkstra with a heap works. What does the heap do that isn\'t needed here?',
      pattern: 'Edges cost only 0 or 1. How do you keep the frontier sorted without a heap?',
      watch: 'Watch 0-cost moves jump to the front of the deque.',
    },
    read: [
      { phrase: 'an obstacle that you may remove', says: 'Entering an obstacle costs 1; entering an empty cell costs 0.' },
      {
        phrase: 'Return the minimum number of obstacles you must remove',
        says: 'Shortest path where the cost is the number of obstacle cells entered.',
      },
    ],
    budget: {
      from: 'm × n ≤ 10⁵',
      rows: [['Dijkstra (heap)', 'mn log(mn) ≈ 1.7 × 10⁶', 'ok', 'fits'], ['0-1 BFS (deque)', 'mn = 10⁵', 'ok', 'fits, linear']],
      aim: 'O(m · n)',
      note: 'The deque is the standard trick for 0/1 weights.',
    },
    observe: [
      {
        title: 'Cost = obstacles entered',
        text: 'From the top-left, every neighbour is an obstacle. Any route must break through at least 2: (0,1) then (0,2), or similar.',
        sketch: {
          kind: 'grid',
          grid: [[0, 1, 1], [1, 1, 0], [1, 1, 0]],
          marks: { '0,1': 'wall', '0,2': 'wall', '1,0': 'wall', '1,1': 'wall', '2,0': 'wall', '2,1': 'wall' },
          labels: { '0,0': '0', '0,1': '1', '0,2': '2', '1,2': '2', '2,2': '2' },
        },
      },
      {
        title: 'Front for 0, back for 1',
        text: 'The deque holds cells with cost d at the front and d + 1 at the back. A free move keeps cost d: push front. An obstacle makes d + 1: push back. The front is always the cheapest.',
        sketch: { kind: 'array', rows: [{ label: 'deque', items: ['d', 'd', 'd + 1', 'd + 1'], marks: { '0': 'hit' } }] },
      },
      {
        title: 'Like BFS, but with free moves',
        text: 'If every move cost 1 this would be plain BFS. The free moves are what need the front of the deque.',
        sketch: { kind: 'array', rows: [{ items: ['all 1: BFS', '0 or 1: deque', 'any: Dijkstra'], marks: { '1': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Dijkstra with a min-heap where entering a cell costs its value.',
      cost: 'O(mn log(mn))',
      waste: 'The heap sorts arbitrary costs, but here only two cost levels are ever in play; a deque keeps them sorted for free.',
    },
    pattern: {
      pick: 'shortest-paths',
      why: '0-1 BFS: deque; empty neighbour (cost 0) to the front, obstacle (cost 1) to the back; the corner\'s cost is the answer. O(m · n).',
      not: [
        { id: 'graph-traversal', why: 'Plain BFS finds shortest paths only when every step costs the same; here the costs differ.' },
        { id: 'dp-grid', why: 'The best route may go up or left around obstacles; no fill order.' },
      ],
    },
    watch: {
      viz: 'SpWalkViz',
      inputs: [
        { label: 'the example', input: { mode: 'obstacles', grid: [[0, 1, 1], [1, 1, 0], [1, 1, 0]] } },
        { label: 'around or through', input: { mode: 'obstacles', grid: [[0, 1, 0, 0, 0], [0, 1, 0, 1, 0], [0, 0, 0, 1, 0], [1, 1, 1, 1, 0]] } },
      ],
    },
    edges: ['No obstacles needed: a clear path → 0.', 'One cell: [[0]] → 0.', 'A wall across: [[0,1],[1,0]] → 1.'],
  },

  'minimum-cost-to-make-at-least-one-valid-path-in-a-grid': {
    aha: 'From each cell you can move in all four directions: the way the sign points is free, any other way costs 1 (you change the sign). That is a shortest path with 0 and 1 edge costs, so 0-1 BFS: free moves to the front of the deque, paid moves to the back.',
    asks: {
      read: 'What does changing a sign cost, and can a sign point off the grid?',
      budget: '100 × 100 cells, 4 moves each. Which shortest-path tool?',
      observe: 'In the example, which signs would you change to reach the corner?',
      brute: 'Trying sets of signs to change: how many sets?',
      pattern: 'Following a sign is free, changing it costs 1. What kind of graph is that?',
      watch: 'Watch free moves jump to the front of the deque.',
    },
    read: [
      { phrase: 'You can change the sign of any cell for a cost of 1', says: 'Moving against a sign costs 1; following it costs 0.' },
      { phrase: 'Signs may point outside the grid', says: 'Such a free move simply doesn\'t exist; you must pay to go elsewhere.' },
    ],
    budget: { from: 'grid ≤ 100 × 100', n: 10000, aim: 'O(m · n)', note: '4 edges per cell, each 0 or 1.' },
    observe: [
      {
        title: 'Free along the signs',
        text: 'Row 0 points right: from (0,0) you reach (0,3) for free. But (0,3) points right, off the grid.',
        sketch: { kind: 'array', rows: [{ items: ['→', '→', '→', '→'], marks: { '0': 'hit', '1': 'hit', '2': 'hit', '3': 'hit' } }] },
      },
      {
        title: 'Pay 1 to turn',
        text: 'Change (0,3) to point down: cost 1, landing on row 1, which points left for free. Repeat at each row end: 3 changes in total for the 4 × 4 example.',
        sketch: {
          kind: 'array',
          rows: [{ items: ['row 0 →', 'turn ↓ (1)', 'row 1 ←', 'turn ↓ (1)', 'row 2 →', 'turn ↓ (1)'], marks: { '1': 'bad', '3': 'bad', '5': 'bad' } }],
        },
      },
      {
        title: 'A deque keeps it sorted',
        text: 'Cells reached for free keep the current cost and go to the front; paid moves go to the back. The front always holds the cheapest cell.',
        sketch: { kind: 'array', rows: [{ label: 'deque', items: ['cost 1', 'cost 1', 'cost 2'], marks: { '0': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Dijkstra with a heap over cells, where the sign\'s direction costs 0 and other directions cost 1.',
      cost: 'O(mn log(mn))',
      waste: 'With only 0 and 1 costs the heap\'s sorting is overkill; a deque does it in O(1).',
    },
    pattern: {
      pick: 'shortest-paths',
      why: '0-1 BFS over cells: the sign\'s direction costs 0 (push front), the other three cost 1 (push back). O(m · n).',
      not: [
        { id: 'graph-traversal', why: 'Plain BFS finds shortest paths only when every step costs the same; here the costs differ.' },
        { id: 'greedy', why: 'Fixing signs greedily along one route can miss a cheaper detour.' },
      ],
    },
    watch: {
      viz: 'SpWalkViz',
      inputs: [
        { label: 'the 4 × 4 example', input: { mode: 'signs', grid: [[1, 1, 1, 1], [2, 2, 2, 2], [1, 1, 1, 1], [2, 2, 2, 2]] } },
        { label: 'already valid', input: { mode: 'signs', grid: [[1, 1, 3], [3, 2, 2], [1, 1, 4]] } },
      ],
    },
    edges: ['Already valid: [[1,1,3],[3,2,2],[1,1,4]] → 0.', 'One cell: [[4]] → 0.', 'Signs pointing away: [[2],[4]] → 1.'],
  },

  'swim-in-rising-water': {
    aha: 'At time t you can use every cell of height ≤ t, so a route needs as much time as its highest cell. That value never drops as a route grows, so Dijkstra works on "highest cell so far": expand the cell with the lowest such value first. The first time the bottom-right is popped, its value is the answer.',
    asks: {
      read: 'When can you move between two cells, and does swimming take time?',
      budget: 'n ≤ 50: 2500 cells. Dijkstra or binary search?',
      observe: 'In [[0,2],[1,3]], what is the earliest time you can stand on the corner?',
      brute: 'Simulating time t = 0, 1, 2… with a BFS each time: how many BFS runs?',
      pattern: 'A route\'s cost is its maximum. Where have you seen that?',
      watch: 'Watch cells open up in order of the time they need.',
    },
    read: [
      { phrase: 'if both heights are at most `t`', says: 'A route is open at time t when its highest cell ≤ t: the cost is that maximum.' },
      { phrase: 'Swimming takes no time', says: 'Only the water level matters, not the route length.' },
    ],
    budget: {
      from: 'n ≤ 50',
      rows: [['Dijkstra on max', 'n² log n² ≈ 3 × 10⁴', 'ok', 'fits'], ['binary search t + BFS', 'n² log n² ≈ 3 × 10⁴', 'ok', 'fits']],
      aim: 'O(n² log n)',
      note: 'Union-find adding cells in height order also works.',
    },
    observe: [
      {
        title: 'Time = highest cell on the route',
        text: '[[0,2],[1,3]]: every route ends on the corner, height 3, so the answer is at least 3, and at t = 3 everything is open.',
        sketch: { kind: 'grid', grid: [[0, 2], [1, 3]], marks: { '1,1': 'hit' }, labels: { '0,0': '0', '0,1': '2', '1,0': '1', '1,1': '3' } },
      },
      {
        title: 'Avoid the peaks',
        text: 'In the spiral example the edge cells are 0–6 and the middle holds 11–15. Going round the edge needs time 6; cutting through the middle would need 11 or more.',
        sketch: { kind: 'array', rows: [{ items: ['round the edge: 6', 'through the middle: ≥ 11'], marks: { '0': 'hit' } }] },
      },
      {
        title: 'Dijkstra on max',
        text: 'time(next) = max(time(current), height(next)). It never decreases along a route, so the lowest time popped is final.',
        sketch: { kind: 'array', rows: [{ items: ['time 4', 'next cell 2', '→ 4'], marks: { '2': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'For t = 0, 1, 2, …, run a BFS through cells of height ≤ t and stop at the first t that connects the corners.',
      cost: 'O(n⁴)',
      waste: 'Each t repeats the whole BFS; Dijkstra finds the smallest t in one pass.',
    },
    pattern: {
      pick: 'shortest-paths',
      why: 'Minimax Dijkstra: heap ordered by the highest cell on the route; the corner\'s popped value is the answer. O(n² log n).',
      not: [
        { id: 'binary-search-on-answer', why: 'Binary searching t with a BFS check also works.' },
        { id: 'union-find', why: 'Adding cells in height order and stopping when the corners join is another way.' },
      ],
    },
    watch: {
      viz: 'SpWalkViz',
      inputs: [
        { label: '[[0,2],[1,3]]', input: { mode: 'swim', grid: [[0, 2], [1, 3]] } },
        { label: 'a 4 × 4 spiral', input: { mode: 'swim', grid: [[0, 1, 2, 3], [11, 12, 13, 4], [10, 15, 14, 5], [9, 8, 7, 6]] } },
      ],
    },
    edges: ['One cell: [[0]] → 0.', 'Start is high: [[3,0],[1,2]] → 3 (you start at height 3).', 'The corner holds the highest value → n² − 1.'],
  },

  'find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance': {
    aha: 'Every city needs its distance to every other city: all-pairs shortest paths. With n ≤ 100, Floyd–Warshall does it in three loops: let each city k in turn be a stop in the middle, and keep i → k → j if it beats the known i → j. Then count, per city, how many others are within the threshold.',
    asks: {
      read: 'Are roads one-way? Which city wins a tie?',
      budget: 'n ≤ 100. Is n³ affordable?',
      observe: 'In the example with threshold 4, which cities can city 0 reach?',
      brute: 'A DFS per city over all paths: how many paths?',
      pattern: 'You need distances between all pairs, not from one source. Which algorithm?',
      watch: 'Watch the distance table shrink as each city becomes a middle stop.',
    },
    read: [
      { phrase: 'is a two-way road', says: 'Undirected: set both dist[a][b] and dist[b][a].' },
      {
        phrase: 'count how many other cities it can reach by a path of total length at most `distanceThreshold`',
        says: 'Shortest distances, then a count per row.',
      },
      {
        phrase: 'If several cities tie, return the one with the largest number',
        says: 'Use ≤ when scanning upwards, so later (larger) cities win ties.',
      },
    ],
    budget: {
      from: 'n ≤ 100',
      rows: [['Floyd–Warshall', 'n³ = 10⁶', 'ok', 'fits'], ['Dijkstra from each city', 'n · E log n', 'ok', 'fits']],
      aim: 'O(n³)',
      note: 'Small n: the three-loop version is simplest.',
    },
    observe: [
      {
        title: 'Routes through other cities',
        text: 'There is no road 0–2, but 0 → 1 → 2 is 3 + 1 = 4: within the threshold.',
        sketch: { kind: 'array', rows: [{ items: ['0–1: 3', '1–2: 1', '0→2: 4'], marks: { '2': 'hit' } }] },
      },
      {
        title: 'One middle city at a time',
        text: 'After allowing city k as a stop, dist[i][j] is the best route using only stops among 0..k. After all k, it is the true shortest distance.',
        sketch: { kind: 'array', rows: [{ items: ['dist[i][j]', 'vs dist[i][k] + dist[k][j]'] }] },
      },
      {
        title: 'Count, ties to the larger',
        text: 'Within 4: city 0 reaches 1, 2 (2 cities); 1 reaches 0, 2, 3 (3); 2 reaches 0, 1, 3 (3); 3 reaches 1, 2 (2). Cities 0 and 3 tie at 2: answer 3.',
        sketch: { kind: 'array', rows: [{ label: 'count', items: ['0: 2', '1: 3', '2: 3', '3: 2'], marks: { '0': 'hit', '3': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'From each city, DFS over every simple path, tracking the shortest distance found to each other city.',
      cost: 'O(n · n!)',
      waste: 'Exponentially many paths; Floyd–Warshall reuses every sub-route.',
    },
    pattern: {
      pick: 'shortest-paths',
      why: 'All-pairs shortest paths with Floyd–Warshall (or Dijkstra from each city); count per city within the threshold; the fewest, ties to the largest index. O(n³).',
      not: [
        { id: 'graph-traversal', why: 'Plain BFS finds shortest paths only when every step costs the same; here the costs differ.' },
        { id: 'dp-grid', why: 'Floyd–Warshall is a DP over the allowed middle cities, not a grid fill.' },
      ],
    },
    watch: {
      viz: 'SpWalkViz',
      inputs: [
        { label: 'the example, threshold 4', input: { mode: 'city', n: 4, edges: [[0, 1, 3], [1, 2, 1], [1, 3, 4], [2, 3, 1]], threshold: 4 } },
        {
          label: '5 cities, threshold 2',
          input: { mode: 'city', n: 5, edges: [[0, 1, 2], [0, 4, 8], [1, 2, 3], [1, 4, 2], [2, 3, 1], [3, 4, 1]], threshold: 2 },
        },
      ],
    },
    edges: [
      'Threshold below every road → all counts 0 → the largest city number.',
      'Two cities, one short road → both count 1 → 1.',
      'A tie → the larger number.',
    ],
  },
};
