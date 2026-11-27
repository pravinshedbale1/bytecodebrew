/** Practice thinking walkthroughs: graph-traversal (format: src/data/think/index.js). */

export default {
  'flood-fill': {
    free: true,
    aha: 'The pixels to recolour are exactly the ones reachable from the start through pixels of the start\'s colour: a connected component on a grid. Search it with DFS (or BFS), painting as you go. Painting doubles as the visited mark, which is why you must stop at once if the new colour equals the old one.',
    asks: {
      read: 'Which pixels change: all pixels of that colour, or only some?',
      budget: 'At most 50 × 50. How many times can a pixel be painted?',
      observe: 'In [[1,1,1],[1,1,0],[1,0,1]] from the centre, why does the bottom-right 1 keep its colour?',
      brute: 'Repainting until nothing changes works. What does it repeat?',
      pattern: 'What is "connected through same-coloured neighbours" in graph terms?',
      watch: 'Watch the fill spread through the call stack.',
    },
    read: [
      {
        phrase: 'every pixel connected to it up, down, left or right through pixels of the same original colour',
        says: 'A connected component in the grid: 4 neighbours, only cells of the original colour.',
      },
      { phrase: 'change the starting pixel', says: 'The search starts at (sr, sc), not at every pixel of that colour.' },
    ],
    budget: { from: 'image up to 50 × 50', n: 2500, aim: 'O(m · n)', note: 'Each pixel is painted at most once and looked at from at most 4 neighbours.' },
    observe: [
      {
        title: 'Only the connected pixels change',
        text: 'From the centre of [[1,1,1],[1,1,0],[1,0,1]] the 1s spread left, up and around the top. The bottom-right 1 is boxed in by 0s: same colour, but not connected, so it stays 1.',
        sketch: {
          kind: 'grid',
          grid: [[1, 1, 1], [1, 1, 0], [1, 0, 1]],
          marks: { '0,0': 'hit', '0,1': 'hit', '0,2': 'hit', '1,0': 'hit', '1,1': 'cur', '2,0': 'hit' },
          labels: { '0,0': '2', '0,1': '2', '0,2': '2', '1,0': '2', '1,1': '2', '1,2': '0', '2,0': '2', '2,1': '0', '2,2': '1' },
          caption: 'Result: the connected 1s became 2.',
        },
      },
      {
        title: 'Painting is the visited mark',
        text: 'Once a pixel is painted 2, a later call landing on it sees 2, not 1, and returns. No separate visited array is needed.',
        sketch: {
          kind: 'array',
          rows: [{ items: ['colour 1: paint, spread', 'colour 2: already done', 'colour 0: wall'], marks: { '0': 'hit', '1': 'dim' } }],
        },
      },
      {
        title: 'Same colour: stop before you start',
        text: 'If the new colour equals the old one, a painted pixel still matches the old colour. Every pixel would look unvisited forever and the fill would never end. Return the image unchanged.',
        sketch: { kind: 'array', rows: [{ items: ['old = 0', 'color = 0', 'return image'], marks: { '2': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Paint the start, then scan the whole image again and again, painting any old-colour pixel next to a painted one, until a scan changes nothing.',
      cost: 'O((m · n)²)',
      waste: 'Each scan revisits every pixel to grow the region by one layer.',
    },
    pattern: {
      pick: 'graph-traversal',
      why: 'DFS or BFS from (sr, sc) over 4-neighbours with the original colour, painting each pixel as it is reached. O(m · n).',
      not: [
        { id: 'tree-dfs', why: 'The same recursion, but a grid has cycles: the painted colour stops the search from going round them.' },
        { id: 'union-find', why: 'Union–Find can also group connected cells, but a single search is simpler when the grid doesn\'t change.' },
        { id: 'matrix-simulation', why: 'The grid is a graph to search, not a matrix to walk in a fixed order.' },
      ],
    },
    watch: {
      viz: 'GraphWalkViz',
      inputs: [
        {
          label: '[[1,1,1],[1,1,0],[1,0,1]], (1, 1) → 2',
          input: { mode: 'flood', image: [[1, 1, 1], [1, 1, 0], [1, 0, 1]], sr: 1, sc: 1, color: 2 },
        },
        {
          label: 'a 4 × 5 image',
          input: { mode: 'flood', image: [[3, 3, 1, 1, 1], [1, 3, 3, 1, 2], [1, 1, 3, 3, 2], [2, 1, 1, 3, 3]], sr: 0, sc: 0, color: 4 },
        },
        { label: 'same colour', input: { mode: 'flood', image: [[0, 0, 0], [0, 0, 0]], sr: 0, sc: 0, color: 0 } },
      ],
    },
    edges: [
      'Same colour: [[0,0,0],[0,0,0]], (0, 0), color 0 → unchanged.',
      'One pixel: [[5]], (0, 0), color 3 → [[3]].',
      'Diagonal only: [[1,0],[0,1]], (0, 0), color 2 → [[2,0],[0,1]].',
    ],
  },

  'island-perimeter': {
    aha: 'The perimeter is made of cell sides. A side of a land cell is on the perimeter exactly when the cell on the other side is water or off the map. So each land cell adds 4 minus its land neighbours, and one scan of the grid is enough: no search needed.',
    asks: {
      read: 'Which words promise there is exactly one island and no lakes?',
      budget: 'Up to 100 × 100. Do you need a search at all?',
      observe: 'In the example, the centre cell (1, 1) touches 4 land cells. How many perimeter sides does it add?',
      brute: 'Tracing the outline around the island works. Why is that hard to get right?',
      pattern: 'Which sides of one cell count, and what decides it?',
      watch: 'Watch each land cell add the sides that face water.',
    },
    read: [
      {
        phrase: 'Cells connect horizontally and vertically (not diagonally)',
        says: 'Only the 4 side neighbours matter, which is also exactly which sides can be shared.',
      },
      { phrase: 'Each cell is a 1 × 1 square', says: 'Every side has length 1: count sides.' },
      { phrase: 'no "lakes"', says: 'No water hidden inside, so every water-facing side is on the outer boundary.' },
    ],
    budget: { from: 'grid up to 100 × 100', n: 10000, aim: 'O(m · n)', note: 'One scan; each cell checks its 4 neighbours.' },
    observe: [
      {
        title: 'Count sides that face water',
        text: '(0, 1) has land only below it, so 3 of its sides face water or the edge. (1, 1) has land on all 4 sides: it adds nothing.',
        sketch: {
          kind: 'grid',
          grid: [[0, 1, 0, 0], [1, 1, 1, 0], [0, 1, 0, 0], [1, 1, 0, 0]],
          marks: { '0,1': 'hit' },
          labels: { '0,1': '3', '1,0': '3', '1,1': '0', '1,2': '3', '2,1': '2', '3,0': '3', '3,1': '2' },
          caption: 'Each land cell shows its water-facing sides: total 16.',
        },
      },
      {
        title: 'Or: 4 per cell, minus 2 per touching pair',
        text: '7 land cells bring 28 sides. Each pair of touching land cells hides one side of each: 6 pairs hide 12. 28 − 12 = 16.',
        sketch: { kind: 'array', rows: [{ items: ['4 × 7 = 28', '− 2 × 6 = 12', '= 16'], marks: { '2': 'hit' } }] },
      },
      {
        title: 'One island means no search',
        text: 'Counting islands needs DFS to group cells. Here every land cell belongs to the one island, so a plain scan of every cell gives the answer.',
        sketch: { kind: 'array', rows: [{ items: ['scan every cell', 'land: add 4 − land neighbours'] }] },
      },
    ],
    brute: {
      idea: 'Walk around the outside of the island, counting each boundary side as you go.',
      cost: 'O(m · n)',
      waste: 'Following the outline needs careful turning rules; counting sides cell by cell needs none.',
    },
    pattern: {
      pick: 'graph-traversal',
      why: 'Grid counting: for each land cell add 4 − (land neighbours). Equivalently 4 · land − 2 · shared edges. A DFS that counts edges leaving the island also works. O(m · n).',
      not: [
        { id: 'matrix-simulation', why: 'A single scan of the matrix is all it takes; the trick is what to count per cell.' },
        { id: 'union-find', why: 'There is only one island: nothing needs to be grouped.' },
      ],
    },
    watch: {
      viz: 'GraphWalkViz',
      inputs: [
        { label: 'the example', input: { mode: 'perimeter', grid: [[0, 1, 0, 0], [1, 1, 1, 0], [0, 1, 0, 0], [1, 1, 0, 0]] } },
        { label: 'a 2 × 2 block', input: { mode: 'perimeter', grid: [[1, 1], [1, 1]] } },
      ],
    },
    edges: ['One cell: [[1]] → 4.', 'A row: [[1,1,1]] → 8.', 'A 2 × 2 block: [[1,1],[1,1]] → 8.'],
  },

  'find-the-town-judge': {
    aha: 'Draw trust as arrows. The judge has an arrow coming in from each of the other n − 1 people and none going out. Give each person one score, +1 per arrow in and −1 per arrow out: only the judge can reach n − 1.',
    asks: {
      read: 'Which three conditions define the judge?',
      budget: 'n up to 1000 and 10⁴ pairs. Can you avoid checking each candidate against all pairs?',
      observe: 'With n = 3 and trust [1→3, 2→3], what are the in- and out-arrows of each person?',
      brute: 'For each person, scan all pairs. How much repeated work is that?',
      pattern: 'Which two counts per person describe the judge, and can they be one number?',
      watch: 'Watch the scores move with each trust arrow.',
    },
    read: [
      { phrase: 'the judge trusts nobody', says: 'The judge\'s arrows out: none. In graph terms, out-degree 0.' },
      { phrase: 'everybody else trusts the judge', says: 'Arrows in from all n − 1 other people: in-degree n − 1.' },
      {
        phrase: '`trust[i] = [a, b]` means person `a` trusts person `b`',
        says: 'Each pair is a directed edge a → b (a trusts b). Trust isn\'t mutual, so in and out are counted separately.',
      },
    ],
    budget: { from: 'n ≤ 1000, trust ≤ 10⁴', n: 10000, aim: 'O(n + t)', note: 'One pass over the pairs, one pass over the people.' },
    observe: [
      {
        title: 'Arrows in, arrows out',
        text: 'n = 3, trust [1→3, 2→3]. Person 3 has 2 arrows in and none out; 1 and 2 each have one out. 3 is the judge.',
        sketch: {
          kind: 'array',
          rows: [
            { label: 'in', items: ['1: 0', '2: 0', '3: 2'], marks: { '2': 'hit' } },
            { label: 'out', items: ['1: 1', '2: 1', '3: 0'], marks: { '2': 'hit' } },
          ],
        },
      },
      {
        title: 'One score: in − out',
        text: 'Score = in − out. The judge scores (n − 1) − 0 = n − 1. Anyone else has at most n − 1 arrows in, and if they trust anyone at all they drop below.',
        sketch: { kind: 'array', rows: [{ label: 'score', items: ['1: −1', '2: −1', '3: 2'], marks: { '2': 'hit' } }], caption: 'n − 1 = 2' },
      },
      {
        title: 'Trusting someone disqualifies you',
        text: 'Add 3 → 1: person 3 now has 2 arrows in and 1 out, a score of 1, below n − 1 = 2. Nobody else reaches 2 either, so the answer is −1. Trusting anyone disqualifies you.',
        sketch: { kind: 'array', rows: [{ label: 'score', items: ['1: 0', '2: −1', '3: 1'], marks: { '2': 'bad' } }] },
      },
    ],
    brute: {
      idea: 'For each person p, scan every pair to check that p trusts nobody and that all n − 1 others trust p.',
      cost: 'O(n · t)',
      waste: 'Each person rescans all the pairs; one pass can tally every person\'s arrows at once.',
    },
    pattern: {
      pick: 'graph-traversal',
      why: 'Degrees of a directed graph: score[a]−− and score[b]++ for each pair, then find the person with score n − 1. O(n + t) time, O(n) space.',
      not: [
        { id: 'hashing', why: 'Counting per person is an array indexed by label; no hashing needed.' },
        { id: 'topological-sort', why: 'In-degrees appear there too, but nothing is ordered here: one count decides.' },
      ],
    },
    watch: {
      viz: 'GraphWalkViz',
      inputs: [
        { label: 'n 3, [1→3, 2→3]', input: { mode: 'judge', n: 3, trust: [[1, 3], [2, 3]] } },
        { label: 'n 4, judge 3', input: { mode: 'judge', n: 4, trust: [[1, 3], [2, 3], [4, 3], [4, 1]] } },
        { label: '3 trusts back', input: { mode: 'judge', n: 3, trust: [[1, 3], [2, 3], [3, 1]] } },
      ],
    },
    edges: ['One person, no trust: n = 1, [] → 1.', 'Two people trusting each other: n = 2, [1→2, 2→1] → −1.', 'Nobody trusts anyone: n = 2, [] → −1.'],
  },

  'number-of-islands': {
    aha: 'Scan the grid. Each time you meet land that no search has marked yet, it starts a new island: count it, then flood the whole island (DFS or BFS), marking every cell. Marked cells are skipped later, so each island is counted exactly once.',
    asks: {
      read: 'Which neighbours connect land, and which don\'t?',
      budget: 'Up to 300 × 300. How many times can a cell be visited?',
      observe: 'Scanning row by row, when does the second island get counted?',
      brute: 'Comparing every pair of land cells for connection works. What does it cost?',
      pattern: 'What do you call a group of nodes all reachable from each other?',
      watch: 'Watch each new island get counted and then flooded.',
    },
    read: [
      { phrase: 'connected horizontally or vertically', says: '4 neighbours. Diagonal land doesn\'t join an island.' },
      {
        phrase: 'Each search from an unvisited land cell, marking everything it reaches, finds one whole island',
        says: 'Islands = number of searches you have to start.',
      },
    ],
    budget: {
      from: 'grid up to 300 × 300',
      n: 90000,
      aim: 'O(m · n)',
      note: 'Each cell is visited by at most one search plus the scan. A huge island means deep recursion: BFS avoids that.',
    },
    observe: [
      {
        title: 'New unmarked land = a new island',
        text: 'In [[1,1,0,0,0],[1,1,0,0,0],[0,0,1,0,0],[0,0,0,1,1]], the scan meets (0, 0): island 1. Flooding marks all four cells of the top-left block.',
        sketch: {
          kind: 'grid',
          grid: [[1, 1, 0, 0, 0], [1, 1, 0, 0, 0], [0, 0, 1, 0, 0], [0, 0, 0, 1, 1]],
          marks: { '0,0': 'hit', '0,1': 'hit', '1,0': 'hit', '1,1': 'hit' },
          labels: { '0,0': '1', '0,1': '1', '1,0': '1', '1,1': '1', '2,2': '·', '3,3': '·', '3,4': '·' },
        },
      },
      {
        title: 'Marked cells are skipped',
        text: 'The scan passes (0, 1), (1, 0) and (1, 1) without counting: they are marked. (2, 2) is unmarked land: island 2. (3, 3) starts island 3 and its flood takes (3, 4).',
        sketch: {
          kind: 'grid',
          grid: [[1, 1, 0, 0, 0], [1, 1, 0, 0, 0], [0, 0, 1, 0, 0], [0, 0, 0, 1, 1]],
          marks: { '2,2': 'cur', '3,3': 'hit', '3,4': 'hit' },
          labels: { '0,0': '1', '0,1': '1', '1,0': '1', '1,1': '1', '2,2': '2', '3,3': '3', '3,4': '3' },
        },
      },
      {
        title: 'Diagonals don\'t connect',
        text: '(2, 2) and (3, 3) touch only at a corner, so they are different islands. Only up, down, left and right count.',
        sketch: { kind: 'array', rows: [{ items: ['(2, 2)', 'corner only', '(3, 3)'], marks: { '1': 'bad' } }] },
      },
    ],
    brute: {
      idea: 'Give each land cell its own label, then repeatedly merge labels of neighbouring land cells until nothing changes; count the labels left.',
      cost: 'O((m · n)²)',
      waste: 'Labels creep one cell per pass; one search per island marks the whole island at once.',
    },
    pattern: {
      pick: 'graph-traversal',
      why: 'Connected components on a grid: scan; at unmarked land count++ and flood it with DFS/BFS. O(m · n).',
      not: [
        { id: 'union-find', why: 'Also works: union neighbouring land and count the sets. Useful when land is added over time.' },
        { id: 'tree-dfs', why: 'The recursion looks the same, but a grid has cycles: the visited mark is essential.' },
      ],
    },
    watch: {
      viz: 'IslandsViz',
      inputs: [
        { label: '3 islands', input: { mode: 'count', grid: [[1, 1, 0, 0, 0], [1, 1, 0, 0, 0], [0, 0, 1, 0, 0], [0, 0, 0, 1, 1]] } },
        { label: '1 island', input: { mode: 'count', grid: [[1, 1, 1, 1, 0], [1, 1, 0, 1, 0], [1, 1, 0, 0, 0], [0, 0, 0, 0, 0]] } },
      ],
    },
    edges: [
      'All water: [["0"]] → 0.',
      'Diagonal touch: [["1","0"],["0","1"]] → 2.',
      'A ring around water: [["1","1","1"],["1","0","1"],["1","1","1"]] → 1.',
    ],
  },

  'max-area-of-island': {
    aha: 'Same as counting islands, but each flood reports how many cells it marked. A DFS returns 1 for the cell itself plus whatever its four neighbours return; water, the edge and visited cells return 0. Keep the biggest.',
    asks: {
      read: 'What is the area of an island, and what if there is no land?',
      budget: 'Up to 50 × 50. One visit per cell?',
      observe: 'How would a DFS from the top of an island know the island\'s size?',
      brute: 'Starting a fresh search from every land cell works. What does it repeat?',
      pattern: 'How do you turn "explore everything connected" into "count everything connected"?',
      watch: 'Watch each island\'s area come back from its search.',
    },
    read: [
      { phrase: 'Its area is the number of cells in it', says: 'Count cells per connected component.' },
      { phrase: 'or `0` if there is no land', says: 'With no land at all the answer is 0, so start the best at 0 rather than at some sentinel.' },
    ],
    budget: { from: 'grid up to 50 × 50', n: 2500, aim: 'O(m · n)', note: 'Each cell is counted by exactly one search.' },
    observe: [
      {
        title: 'Each search returns a size',
        text: 'area(r, c) = 0 for water, the edge or a visited cell. Otherwise mark it and return 1 + area(up) + area(down) + area(left) + area(right).',
        sketch: { kind: 'array', rows: [{ items: ['water / visited: 0', 'land: 1 + four neighbours'], marks: { '1': 'hit' } }] },
      },
      {
        title: 'Islands have different sizes',
        text: 'In [[1,1,0,0],[1,0,0,1],[0,0,1,1]] the left island has 3 cells and the right one 3 as well; add one more cell to the right one and it wins with 4.',
        sketch: {
          kind: 'grid',
          grid: [[1, 1, 0, 0], [1, 0, 0, 1], [0, 0, 1, 1]],
          marks: { '1,3': 'hit', '2,2': 'hit', '2,3': 'hit' },
          labels: { '0,0': 'A', '0,1': 'A', '1,0': 'A', '1,3': 'B', '2,2': 'B', '2,3': 'B' },
        },
      },
      {
        title: 'Marking prevents double counting',
        text: 'Without marks, two neighbouring land cells would each count the other again and again. Marking a cell as it is counted means it contributes exactly 1.',
        sketch: { kind: 'array', rows: [{ items: ['(0,0) counts (0,1)', '(0,1) sees (0,0) marked → 0'], marks: { '1': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'From every land cell, run a separate search to find the size of its island; take the largest.',
      cost: 'O((m · n)²)',
      waste: 'An island of k cells is searched k times, once from each of its cells.',
    },
    pattern: {
      pick: 'graph-traversal',
      why: 'Connected components with sizes: DFS returns 1 + the areas of its neighbours, marking as it goes; keep the maximum. O(m · n).',
      not: [
        { id: 'dp-grid', why: 'Cells depend on neighbours in all four directions, so there is no fill order; it is a search.' },
        { id: 'union-find', why: 'Union–Find can also group connected cells, but a single search is simpler when the grid doesn\'t change.' },
      ],
    },
    watch: {
      viz: 'IslandsViz',
      inputs: [
        {
          label: 'several islands',
          input: { mode: 'area', grid: [[1, 1, 0, 0, 1, 0], [1, 0, 0, 1, 1, 0], [0, 0, 1, 1, 1, 0], [0, 1, 0, 0, 0, 1], [1, 1, 0, 0, 1, 1]] },
        },
        { label: 'a small grid', input: { mode: 'area', grid: [[1, 1, 0, 0], [1, 0, 0, 1], [0, 0, 1, 1]] } },
      ],
    },
    edges: ['No land: [[0,0,0]] → 0.', 'All land: [[1,1],[1,1]] → 4.', 'Diagonal cells: [[1,0],[0,1]] → 1.'],
  },

  'number-of-provinces': {
    aha: 'The matrix is a graph: city i and city j are joined when isConnected[i][j] = 1. A province is everything reachable from a city. Start a DFS from each city not reached yet: each start is one new province.',
    asks: {
      read: 'Which words say that connection passes along a chain?',
      budget: 'Up to 200 cities. What does reading the matrix cost?',
      observe: 'In [[1,1,0],[1,1,0],[0,0,1]], which cities can city 0 reach?',
      brute: 'Checking every pair for a path works. How much repeated searching is that?',
      pattern: 'You did this on a grid with islands. What is different when the graph is a matrix?',
      watch: 'Watch each DFS colour one province.',
    },
    read: [
      { phrase: 'Connection is transitive', says: 'Provinces are connected components: reachability, not just direct links.' },
      {
        phrase: '`isConnected[i][j] = 1` means cities `i` and `j` are directly connected',
        says: 'The matrix is the graph: each 1 off the diagonal is an edge. Skip i = j when listing neighbours.',
      },
    ],
    budget: { from: 'n ≤ 200 cities', n: 200, aim: 'O(n²)', note: 'Reading the whole matrix is n² = 40 000 cells: that is the cost of any approach.' },
    observe: [
      {
        title: 'The matrix is an adjacency matrix',
        text: 'Row i lists i\'s direct connections. In [[1,1,0],[1,1,0],[0,0,1]], 0 – 1 is an edge and 2 stands alone.',
        sketch: {
          kind: 'grid',
          grid: [[1, 1, 0], [1, 1, 0], [0, 0, 1]],
          marks: { '0,1': 'hit', '1,0': 'hit' },
          labels: { '0,0': '1', '0,1': '1', '0,2': '0', '1,0': '1', '1,1': '1', '1,2': '0', '2,0': '0', '2,1': '0', '2,2': '1' },
          caption: 'the off-diagonal 1s are the edges',
        },
      },
      {
        title: 'One search per province',
        text: 'DFS from city 0 reaches 1. City 2 was not reached, so it starts a second search: 2 provinces.',
        sketch: { kind: 'array', rows: [{ label: 'province', items: ['0: P1', '1: P1', '2: P2'], marks: { '2': 'hit' } }] },
      },
      {
        title: 'Chains count',
        text: 'With 0 – 1 and 1 – 2 but no direct 0 – 2, all three are still one province: the DFS from 0 reaches 2 through 1.',
        sketch: { kind: 'array', rows: [{ items: ['0 – 1', '1 – 2', '→ one province'], marks: { '2': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'For every pair of cities, run a search to see if they are connected, then group cities that are.',
      cost: 'O(n⁴)',
      waste: 'Each pair repeats a full search; one search per province already finds all its cities.',
    },
    pattern: {
      pick: 'graph-traversal',
      why: 'Connected components: for each unreached city, provinces++ and DFS through its matrix row. O(n²).',
      not: [
        { id: 'union-find', why: 'Merging cities for each 1 in the matrix gives the same count; DFS needs no extra structure.' },
        { id: 'matrix-simulation', why: 'The matrix is just the edge list; the work is a graph search.' },
      ],
    },
    watch: {
      viz: 'GraphWalkViz',
      inputs: [
        { label: '[[1,1,0],[1,1,0],[0,0,1]]', input: { mode: 'provinces', m: [[1, 1, 0], [1, 1, 0], [0, 0, 1]] } },
        { label: '5 cities', input: { mode: 'provinces', m: [[1, 1, 0, 0, 0], [1, 1, 0, 0, 0], [0, 0, 1, 0, 1], [0, 0, 0, 1, 0], [0, 0, 1, 0, 1]] } },
      ],
    },
    edges: ['One city: [[1]] → 1.', 'No connections: [[1,0,0],[0,1,0],[0,0,1]] → 3.', 'A chain: 0 – 1 – 2 with no 0 – 2 → 1.'],
  },

  'clone-graph': {
    aha: 'Walk the graph and copy each node once. A map from original node to its copy does two jobs: it tells you a node was already copied (so cycles don\'t loop forever) and it hands you that copy to connect to. Put the copy in the map before visiting the neighbours.',
    asks: {
      read: 'What must the copy not share with the original?',
      budget: 'At most 100 nodes. What is the real difficulty?',
      observe: 'Copying [[2,4],[1,3],[2,4],[1,3]] naively: what happens when 2\'s neighbour 1 is reached again?',
      brute: 'Copying recursively without remembering anything: why does it never stop?',
      pattern: 'What do you need to look up every time you meet a node?',
      watch: 'Watch the map grow and copies get reused.',
    },
    read: [
      { phrase: 'Return a deep copy of the whole graph', says: 'New nodes for everything; edges point between the new nodes.' },
      { phrase: 'sharing no nodes with the original', says: 'Every neighbour list of a copy must contain copies, never originals.' },
      { phrase: 'you are given node 1', says: 'One starting node; the graph is connected, so a walk from it reaches every node.' },
    ],
    budget: {
      from: 'up to 100 nodes',
      rows: [['copy without a map', 'never stops on a cycle', 'bad', 'wrong'], ['DFS / BFS with a map', 'O(V + E)', 'ok', 'fits']],
      aim: 'O(V + E)',
      note: 'Tiny: the challenge is cycles and shared neighbours, not speed.',
    },
    observe: [
      {
        title: 'Cycles bring you back',
        text: '1 – 2 – 3 – 4 – 1 is a cycle. Copying 1 copies 2, which copies its neighbour 1 again, which copies 2 again… without a memory of what is copied, it never ends.',
        sketch: { kind: 'array', rows: [{ items: ['clone(1)', 'clone(2)', 'clone(1)?!'], marks: { '2': 'bad' } }] },
      },
      {
        title: 'Map original → copy, filled early',
        text: 'Make 1\' and store 1 → 1\' before touching 1\'s neighbours. When the walk comes back to 1, the map returns 1\' instead of making a second copy.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'map', items: ['1 → 1\'', '2 → 2\''] }, { label: 'clone(1) again', items: ['return 1\''], marks: { '0': 'hit' } }],
        },
      },
      {
        title: 'Edges come from the map',
        text: '2\'.neighbors gets clone(1) and clone(3): copies only. When every call has returned, every copy has its full neighbour list.',
        sketch: { kind: 'array', rows: [{ label: '2\'.neighbors', items: ['1\'', '3\''], marks: { '0': 'hit', '1': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Recursively copy a node and then copy each neighbour, with no record of what is already copied.',
      cost: 'O(V + E)',
      waste: 'With no record, a cycle is copied forever, and a node shared by two neighbours gets two separate copies.',
    },
    pattern: {
      pick: 'graph-traversal',
      why: 'DFS (or BFS) with an original → copy map: copy, record, then wire neighbours from the map. O(V + E).',
      not: [
        { id: 'hashing', why: 'The map is a hash map, but the work is the traversal it guards.' },
        { id: 'linked-list-manipulation', why: 'Copy List with Random Pointer uses the same map trick on a list; here nodes have many neighbours.' },
      ],
    },
    watch: {
      viz: 'GraphWalkViz',
      inputs: [
        { label: '4-cycle', input: { mode: 'clone', adj: [[2, 4], [1, 3], [2, 4], [1, 3]] } },
        { label: 'triangle + tail', input: { mode: 'clone', adj: [[2, 3], [1, 3], [1, 2, 4], [3]] } },
      ],
    },
    edges: ['Empty graph: [] → [].', 'One node: [[]] → [[]].', 'Two nodes: [[2],[1]] → [[2],[1]].'],
  },

  'rotting-oranges': {
    aha: 'All rotten oranges spread at the same time, one step per minute. Put every rotten orange in a queue at minute 0 and run one breadth-first search from all of them together: minute t is level t, and any fresh orange left at the end is unreachable.',
    asks: {
      observe: 'In [[2, 1, 1], [1, 1, 0], [0, 1, 1]], which oranges rot at minute 1? Which one rots last?',
      pattern: 'Spreading one step per minute from several starting points at once: which search visits cells in order of distance?',
      read: 'Four phrases describe the process. Which one says "rounds", and which one says the answer might be impossible?',
      budget: 'The grid is at most 10 × 10. Does speed decide anything here, or is it about modelling the spread correctly?',
      brute: 'What is the most literal simulation, and what does each minute rescan?',
      watch: 'In [[2, 1, 1], [1, 1, 0], [0, 1, 1]], how many rings will the search take to reach the last orange?',
    },
    read: [
      { phrase: 'Every minute', says: 'Time moves in rounds, and the rot spreads one step per round: levels of a breadth-first search.' },
      { phrase: 'next to a rotten one (up, down, left or right)', says: 'A grid where each cell has 4 neighbours: a graph.' },
      { phrase: 'the number of minutes until no fresh orange remains', says: 'The number of BFS levels needed to reach the last fresh orange.' },
      { phrase: '`-1` if some orange can never rot', says: 'Some fresh orange may be unreachable: count what is left at the end.' },
    ],
    budget: {
      from: 'grid up to 10 × 10',
      n: 100,
      aim: 'O(rows × cols)',
      note: 'Tiny limits: even minute-by-minute rescans would pass, but BFS is the clean, expected answer.',
    },
    observe: [
      {
        title: 'All rotten oranges spread at the same time',
        text: 'Every rotten orange infects its neighbours in the same minute. So the search starts from all of them at once: put every rotten orange in the queue at minute 0.',
        sketch: {
          kind: 'grid',
          grid: [[2, 1, 1], [1, 1, 0], [0, 1, 1]],
          marks: { '0,0': 'rotten', '0,1': 'fresh', '0,2': 'fresh', '1,0': 'fresh', '1,1': 'fresh', '2,1': 'fresh', '2,2': 'fresh' },
          labels: { '0,0': '0' },
          caption: 'minute 0: the starting rot',
        },
      },
      {
        title: 'Minute t is BFS level t',
        text: 'Cells rot in rings of distance from the starting rot. The answer is the distance of the last ring.',
        sketch: {
          kind: 'grid',
          grid: [[2, 1, 1], [1, 1, 0], [0, 1, 1]],
          marks: { '0,0': 'rotten', '0,1': 'ring', '1,0': 'ring', '0,2': 'ring', '1,1': 'ring', '2,1': 'ring', '2,2': 'ring' },
          labels: { '0,0': '0', '0,1': '1', '1,0': '1', '0,2': '2', '1,1': '2', '2,1': '3', '2,2': '4' },
          caption: 'the last orange rots at minute 4',
        },
      },
      {
        title: 'Unreachable fresh oranges mean −1',
        text: 'Count the fresh oranges first and decrease the count as they rot. If any remain when the queue empties, they were cut off.',
        sketch: {
          kind: 'grid',
          grid: [[2, 1, 1], [0, 1, 1], [1, 0, 1]],
          marks: { '0,0': 'rotten', '2,0': 'fresh' },
          labels: { '2,0': '?' },
          caption: 'the bottom-left orange has no rotten path to it',
        },
      },
    ],
    brute: {
      idea: 'Simulate: each minute, scan the whole grid and rot every fresh orange next to a rotten one; stop when nothing changes.',
      cost: 'O((rows · cols)²)',
      waste: 'Each minute rescans every cell, though only the newest rotten oranges can spread.',
    },
    pattern: {
      pick: 'graph-traversal',
      why: 'Spreading by one step per round from several sources is multi-source BFS: the queue holds the newest rot, and each level is one minute.',
      not: [
        {
          id: 'shortest-paths',
          why: 'Every step costs the same (one minute), so plain BFS already gives shortest times; Dijkstra is for unequal weights.',
        },
        { id: 'union-find', why: 'Union-find tells which cells are connected, but not how long the spread takes.' },
        { id: 'dp-grid', why: 'Grid DP moves in fixed directions (say right and down); rot spreads in all four.' },
      ],
    },
    watch: {
      viz: 'GridBfsViz',
      inputs: [
        { label: 'the example grid', input: { mode: 'oranges', grid: [[2, 1, 1], [1, 1, 0], [0, 1, 1]] } },
        { label: 'an orange out of reach', input: { mode: 'oranges', grid: [[2, 1, 1], [0, 1, 1], [1, 0, 1]] } },
      ],
    },
    edges: ['No fresh oranges: [[0, 2]] → 0.', 'Fresh but nothing rotten: [[1]] → −1.', 'An orange cut off: [[2, 1, 1], [0, 1, 1], [1, 0, 1]] → −1.'],
  },

  '01-matrix': {
    aha: 'Searching from every 1 for its nearest 0 repeats work. Turn it around: start one BFS from all the zeros at once. The waves spread one step per round, so each 1 is first reached by the wave from its nearest 0, at exactly that distance.',
    asks: {
      read: 'Distance to what, and how is distance measured?',
      budget: 'Up to 10⁴ cells. What does one search per cell cost?',
      observe: 'If you started at the zeros instead of the ones, what would the first round reach?',
      brute: 'A BFS from each 1 until it hits a 0 is correct. Why is it slow?',
      pattern: 'You saw this with rotting oranges. What are the sources here?',
      watch: 'Watch the rings grow out of every zero.',
    },
    read: [
      { phrase: 'For every cell, find the distance to the nearest `0`', says: 'One BFS from all zeros together answers every cell.' },
      { phrase: 'moving one step up, down, left or right counts as distance 1', says: 'Unweighted grid steps: BFS rings are exact distances.' },
      { phrase: 'with at least one `0`', says: 'Every cell gets a finite distance.' },
    ],
    budget: { from: 'm × n ≤ 10⁴', n: 10000, aim: 'O(m · n)', note: 'A BFS per cell would be up to 10⁸; one shared BFS is 10⁴.' },
    observe: [
      {
        title: 'Ring 0 is every zero',
        text: 'Put all zeros in the queue with distance 0. Their unvisited neighbours are distance 1, their neighbours\' neighbours 2, and so on.',
        sketch: {
          kind: 'grid',
          grid: [[0, 0, 0], [0, 1, 0], [1, 1, 1]],
          marks: { '1,1': 'hit', '2,0': 'hit', '2,2': 'hit', '2,1': 'cur' },
          labels: { '0,0': '0', '0,1': '0', '0,2': '0', '1,0': '0', '1,1': '1', '1,2': '0', '2,0': '1', '2,1': '2', '2,2': '1' },
        },
      },
      {
        title: 'The first wave to arrive is the nearest zero',
        text: '(2, 1) is 2 steps from the nearest zero. All the waves move in step, so the first to arrive comes from the nearest zero; later waves only find it already set.',
        sketch: { kind: 'array', rows: [{ items: ['ring 1: (1,1) (2,0) (2,2)', 'ring 2: (2,1)'], marks: { '1': 'hit' } }] },
      },
      {
        title: 'Or two sweeps',
        text: 'A shortest route to a zero moves up/left some steps and down/right others. One pass from the top-left takes neighbours above and to the left; a second from the bottom-right takes the rest.',
        sketch: { kind: 'array', rows: [{ items: ['pass 1: min(up, left) + 1', 'pass 2: min(itself, down + 1, right + 1)'] }] },
      },
    ],
    brute: {
      idea: 'For each cell holding 1, run a BFS outward until it reaches a 0.',
      cost: 'O((m · n)²)',
      waste: 'Neighbouring cells repeat almost the same search; the waves from the zeros answer everyone in one go.',
    },
    pattern: {
      pick: 'graph-traversal',
      why: 'Multi-source BFS from every 0: the ring a cell is first reached in is its distance. O(m · n).',
      not: [
        { id: 'dp-grid', why: 'Two passes over the grid also work; BFS is the more direct picture.' },
        { id: 'shortest-paths', why: 'All steps cost 1, so BFS already gives shortest distances.' },
      ],
    },
    watch: {
      viz: 'GraphWalkViz',
      inputs: [
        { label: '[[0,0,0],[0,1,0],[1,1,1]]', input: { mode: 'zeros', mat: [[0, 0, 0], [0, 1, 0], [1, 1, 1]] } },
        { label: 'two zeros', input: { mode: 'zeros', mat: [[0, 1, 1, 1], [1, 1, 1, 1], [1, 1, 0, 1], [1, 1, 1, 1]] } },
      ],
    },
    edges: [
      'All zeros: [[0,0]] → [[0,0]].',
      'One zero in a corner: [[0,1,1]] → [[0,1,2]].',
      'Centre 1: [[0,0,0],[0,1,0],[0,0,0]] → unchanged except centre 1.',
    ],
  },

  'shortest-path-in-binary-matrix': {
    aha: 'Every move costs one cell, so BFS from the top-left reaches cells in order of distance: everything 1 cell away, then 2, and so on. The first time it reaches the bottom-right, that is the shortest path. Remember the 8 neighbours, and that the start counts as 1.',
    asks: {
      read: 'How many directions can you move, and what is counted: cells or moves?',
      budget: 'Up to 100 × 100. What visit order makes the first arrival the shortest?',
      observe: 'In [[0,1],[1,0]], how long is the path?',
      brute: 'DFS over all paths finds the shortest eventually. Why is that a bad idea?',
      pattern: 'Which search finds shortest paths when every step costs the same?',
      watch: 'Watch the rings of distance spread until one touches the corner.',
    },
    read: [
      {
        phrase: 'moving to any of the 8 neighbouring cells (including diagonals)',
        says: 'Diagonal moves count as one step: each cell has 8 neighbours, not 4, so a diagonal shortcut is as cheap as a side step.',
      },
      { phrase: 'the number of cells on the shortest clear path', says: 'Count cells: a 1 × 1 grid with an open cell is a path of 1.' },
      { phrase: 'or `-1` if there is none', says: 'Also when the start or the end is blocked.' },
    ],
    budget: { from: 'n ≤ 100, n × n grid', n: 10000, aim: 'O(n²)', note: 'Each cell enters the queue at most once.' },
    observe: [
      {
        title: 'Diagonals are one step',
        text: '[[0,1],[1,0]]: the two corners touch diagonally, so the path is 2 cells long.',
        sketch: {
          kind: 'grid',
          grid: [[0, 1], [1, 0]],
          marks: { '0,0': 'hit', '1,1': 'hit', '0,1': 'wall', '1,0': 'wall' },
          labels: { '0,0': '1', '1,1': '2', '0,1': '#', '1,0': '#' },
        },
      },
      {
        title: 'Rings of equal distance',
        text: 'BFS finishes every cell at distance d before any at d + 1. So the corner\'s ring number is the shortest length.',
        sketch: {
          kind: 'grid',
          grid: [[0, 0, 0], [1, 1, 0], [1, 1, 0]],
          marks: { '0,0': 'ring', '0,1': 'ring', '0,2': 'ring', '1,2': 'ring', '2,2': 'hit', '1,0': 'wall', '1,1': 'wall', '2,0': 'wall', '2,1': 'wall' },
          labels: { '0,0': '1', '0,1': '2', '0,2': '3', '1,2': '3', '2,2': '4', '1,0': '#', '1,1': '#', '2,0': '#', '2,1': '#' },
        },
      },
      {
        title: 'Mark on enqueue',
        text: 'Mark a cell when you put it in the queue, not when you take it out. Otherwise the same cell can be queued by several neighbours.',
        sketch: { kind: 'array', rows: [{ items: ['enqueue → mark', 'never queued twice'], marks: { '0': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'DFS over every clear path from the top-left to the bottom-right, keeping the shortest.',
      cost: 'O(8^(n²))',
      waste: 'The number of paths explodes; BFS reaches each cell once, already by a shortest path.',
    },
    pattern: {
      pick: 'graph-traversal',
      why: 'BFS on the grid graph with 8 neighbours from (0, 0), distance 1 at the start; the first arrival at (n−1, n−1) is the answer. O(n²).',
      not: [
        { id: 'shortest-paths', why: 'Dijkstra handles weights; with equal steps BFS is enough.' },
        { id: 'dp-grid', why: 'Paths can go up and left too, so there is no single fill order for a DP.' },
      ],
    },
    watch: {
      viz: 'GridBfsViz',
      inputs: [
        { label: '[[0,0,0],[1,1,0],[1,1,0]]', input: { mode: 'path', grid: [[0, 0, 0], [1, 1, 0], [1, 1, 0]] } },
        { label: '5 × 5 maze', input: { mode: 'path', grid: [[0, 0, 0, 1, 0], [1, 1, 0, 1, 0], [0, 0, 0, 0, 0], [0, 1, 1, 1, 0], [0, 0, 0, 1, 0]] } },
      ],
    },
    edges: ['Start blocked: [[1,0],[0,0]] → −1.', 'One open cell: [[0]] → 1.', 'Only a diagonal: [[0,1],[1,0]] → 2.'],
  },

  'surrounded-regions': {
    aha: 'An O region survives exactly when it touches the border. Instead of testing each region, start from every O on the border and mark everything connected to it as safe. Then every O that is not marked is captured: flip it to X.',
    asks: {
      read: 'When is a region captured?',
      budget: 'Up to 200 × 200. Can each cell be handled a constant number of times?',
      observe: 'In the example, which O survives, and why?',
      brute: 'Explore each region and check whether it touches the edge. What is awkward about that?',
      pattern: 'Is it easier to find the captured cells or the safe ones?',
      watch: 'Watch the safe cells spread in from the border, then the flip.',
    },
    read: [
      { phrase: 'A region is captured if none of its cells is on the edge of the board', says: 'Safe = connected to a border O.' },
      { phrase: 'Change the board in place', says: 'Mark safe cells with a temporary character, flip the rest, then restore.' },
    ],
    budget: { from: 'board up to 200 × 200', n: 40000, aim: 'O(m · n)', note: 'One search from the border plus one scan.' },
    observe: [
      {
        title: 'Border O\'s are safe',
        text: 'The O at (3, 1) is on the border, so it can\'t be surrounded. Nothing connects it to the middle O\'s.',
        sketch: {
          kind: 'grid',
          grid: [[0, 0, 0, 0], [0, 1, 1, 0], [0, 0, 1, 0], [0, 1, 0, 0]],
          marks: { '3,1': 'hit' },
          labels: {
            '0,0': 'X',
            '0,1': 'X',
            '0,2': 'X',
            '0,3': 'X',
            '1,0': 'X',
            '1,1': 'O',
            '1,2': 'O',
            '1,3': 'X',
            '2,0': 'X',
            '2,1': 'X',
            '2,2': 'O',
            '2,3': 'X',
            '3,0': 'X',
            '3,1': 'O',
            '3,2': 'X',
            '3,3': 'X',
          },
        },
      },
      {
        title: 'Everything not marked is trapped',
        text: 'Mark from every border O. The middle region (1, 1), (1, 2), (2, 2) is never reached, so it is surrounded: flip it.',
        sketch: {
          kind: 'grid',
          grid: [[0, 0, 0, 0], [0, 1, 1, 0], [0, 0, 1, 0], [0, 1, 0, 0]],
          marks: { '1,1': 'rotten', '1,2': 'rotten', '2,2': 'rotten', '3,1': 'hit' },
          labels: {
            '0,0': 'X',
            '0,1': 'X',
            '0,2': 'X',
            '0,3': 'X',
            '1,0': 'X',
            '1,1': 'X',
            '1,2': 'X',
            '1,3': 'X',
            '2,0': 'X',
            '2,1': 'X',
            '2,2': 'X',
            '2,3': 'X',
            '3,0': 'X',
            '3,1': 'O',
            '3,2': 'X',
            '3,3': 'X',
          },
        },
      },
      {
        title: 'A region can reach the border far away',
        text: 'An O deep inside survives if a chain of O\'s leads from it to any border cell. Searching from the border finds those chains automatically.',
        sketch: { kind: 'array', rows: [{ items: ['border O', '→ O', '→ O (inside)', 'all safe'], marks: { '3': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'For each unvisited O, find its whole region, note whether any cell is on the border, and flip the region if none is.',
      cost: 'O(m · n)',
      waste: 'Same speed, but each region needs to be collected before you know what to do with it; marking from the border decides as it goes.',
    },
    pattern: {
      pick: 'graph-traversal',
      why: 'Boundary search: DFS/BFS from every border O marks the safe cells; flip every O not marked. O(m · n).',
      not: [
        { id: 'union-find', why: 'Joining border O\'s to a virtual "edge" node works too, with more machinery.' },
        { id: 'matrix-simulation', why: 'The grid is a graph to search, not a matrix to walk in a fixed order.' },
      ],
    },
    watch: {
      viz: 'GraphWalkViz',
      inputs: [
        { label: 'the example', input: { mode: 'surrounded', board: [[0, 0, 0, 0], [0, 1, 1, 0], [0, 0, 1, 0], [0, 1, 0, 0]] } },
        {
          label: '5 × 5',
          input: { mode: 'surrounded', board: [[0, 0, 0, 0, 0], [0, 1, 1, 0, 0], [0, 0, 1, 0, 1], [0, 1, 0, 0, 1], [0, 1, 0, 0, 0]] },
        },
      ],
    },
    edges: [
      'One cell: [["O"]] → [["O"]] (it is on the border).',
      'All O: every cell connects to the border → unchanged.',
      'An O ring around X: [["X","X","X"],["X","O","X"],["X","X","X"]] → all X.',
    ],
  },

  'pacific-atlantic-water-flow': {
    aha: 'Following rain downhill from every cell repeats the same paths. Turn it around: start at each ocean\'s edge and walk uphill, to neighbours that are not lower. Every cell that walk reaches can drain back into that ocean. Do it for both oceans and return the cells reached by both.',
    asks: {
      read: 'Which way does water flow, and which edges touch which ocean?',
      budget: 'Up to 200 × 200. What does one search per cell cost?',
      observe: 'Can rain on the top-right corner reach both oceans?',
      brute: 'From every cell, follow the water. How much is searched twice?',
      pattern: 'If water flows down from A to B, which way would you walk to find A from B?',
      watch: 'Watch the two uphill searches and their overlap.',
    },
    read: [
      {
        phrase: 'The Pacific Ocean touches the top and left edges, and the Atlantic touches the bottom and right edges',
        says: 'Each ocean\'s search starts from its own two edges.',
      },
      {
        phrase: 'whose height is less than or equal to its own',
        says: 'Downhill or flat. Walking backwards, step to neighbours that are greater or equal.',
      },
    ],
    budget: {
      from: 'grid up to 200 × 200',
      n: 40000,
      aim: 'O(m · n)',
      note: 'One search per cell would be up to 1.6 × 10⁹; two searches total are 8 × 10⁴.',
    },
    observe: [
      {
        title: 'Corners touch both oceans',
        text: 'The top-right corner (0, 4) is on the top edge (Pacific) and the right edge (Atlantic). Rain there reaches both directly.',
        sketch: { kind: 'array', rows: [{ items: ['(0, 4): top edge', 'and right edge', '→ both'], marks: { '2': 'hit' } }] },
      },
      {
        title: 'Search uphill from the ocean',
        text: 'If water can flow from cell A down to B, then B can "climb" to A. Starting from all Pacific edge cells and climbing to neighbours that are not lower finds every cell that drains into the Pacific.',
        sketch: { kind: 'array', rows: [{ label: 'climb', items: ['edge 1', '→ 2', '→ 3', '→ 5 (peak)'], marks: { '3': 'hit' } }] },
      },
      {
        title: 'Keep the overlap',
        text: 'Run the same climb from the Atlantic edges. Cells marked by both searches are the answer: in the example, 7 cells.',
        sketch: { kind: 'array', rows: [{ items: ['Pacific reach', '∩ Atlantic reach', '= answer'], marks: { '2': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'From every cell, search everywhere the water can flow and check whether it reaches a Pacific edge and an Atlantic edge.',
      cost: 'O((m · n)²)',
      waste: 'Every cell repeats the searches of the cells below it; two searches from the oceans cover all of it.',
    },
    pattern: {
      pick: 'graph-traversal',
      why: 'Reverse flow: multi-source BFS/DFS uphill from each ocean\'s edges, then intersect the two reach sets. O(m · n).',
      not: [
        { id: 'dp-grid', why: 'Flow goes in all four directions, so no fill order exists.' },
        { id: 'union-find', why: 'Reachability here is one-way (downhill), which sets can\'t express.' },
      ],
    },
    watch: {
      viz: 'GraphWalkViz',
      inputs: [
        {
          label: 'the 5 × 5 example',
          input: { mode: 'pacific', h: [[1, 2, 2, 3, 5], [3, 2, 3, 4, 4], [2, 4, 5, 3, 1], [6, 7, 1, 4, 5], [5, 1, 1, 2, 4]] },
        },
        { label: 'a 3 × 3 bowl', input: { mode: 'pacific', h: [[3, 3, 3], [3, 1, 3], [3, 3, 3]] } },
      ],
    },
    edges: [
      'One cell: [[1]] → [[0, 0]].',
      'Flat: [[2,2],[2,2]] → every cell.',
      'A pit in the middle: [[3,3,3],[3,1,3],[3,3,3]] → every cell but the centre.',
    ],
  },

  'walls-and-gates': {
    aha: 'Each room wants its distance to the nearest gate. One BFS from each gate rewrites rooms many times. Instead put every gate in the queue at distance 0 and run one BFS: the nearest gate\'s wave reaches each room first, so every room is written exactly once.',
    asks: {
      read: 'Which cells can you walk through, and what stays INF?',
      budget: 'Up to 250 × 250. How many BFS runs can you afford?',
      observe: 'Two gates are both reachable from a room. Which one decides its value, and when?',
      brute: 'A BFS from each gate, keeping the minimum: what does it repeat?',
      pattern: 'This is rotting oranges with a different story. What are the sources?',
      watch: 'Watch the rings spread from every gate at once.',
    },
    read: [
      { phrase: '`-1`: a wall or obstacle', says: 'Cells marked −1 block movement: the search never steps onto them, so distances go around walls.' },
      { phrase: 'Fill each empty room', says: 'Change the grid itself: an INF room becomes a distance when first reached.' },
      { phrase: 'If no gate can be reached, leave the room as INF', says: 'Rooms the waves never reach keep INF.' },
    ],
    budget: { from: 'up to 250 × 250', n: 62500, aim: 'O(m · n)', note: 'A BFS per gate is O(k · m · n), which can be 10⁹ with many gates.' },
    observe: [
      {
        title: 'Every gate starts at once',
        text: 'Queue both gates at distance 0. Round 1 writes 1 into the rooms next to either gate.',
        sketch: {
          kind: 'grid',
          grid: [[1, 2, 0, 1], [1, 1, 1, 2], [1, 2, 1, 2], [0, 2, 1, 1]],
          marks: {
            '0,2': 'hit',
            '3,0': 'hit',
            '0,3': 'ring',
            '1,2': 'ring',
            '2,0': 'ring',
            '0,1': 'wall',
            '1,3': 'wall',
            '2,1': 'wall',
            '2,3': 'wall',
            '3,1': 'wall',
          },
          labels: {
            '0,0': '∞',
            '0,1': '#',
            '0,2': 'G',
            '0,3': '1',
            '1,0': '∞',
            '1,1': '∞',
            '1,2': '1',
            '1,3': '#',
            '2,0': '1',
            '2,1': '#',
            '2,2': '∞',
            '2,3': '#',
            '3,0': 'G',
            '3,1': '#',
            '3,2': '∞',
            '3,3': '∞',
          },
        },
      },
      {
        title: 'First write wins',
        text: 'A room is written the first time any wave reaches it, and that wave came from its nearest gate. Later waves see a number, not INF, and skip it.',
        sketch: { kind: 'array', rows: [{ items: ['INF → write d + 1', 'already a number → skip'], marks: { '0': 'hit' } }] },
      },
      {
        title: 'Walls shape the distances',
        text: '(3, 3) is 4 steps away: around the walls through (1, 2), (2, 2) and (3, 2). The BFS never steps on #.',
        sketch: { kind: 'array', rows: [{ items: ['G (0,2)', '(1,2)', '(2,2)', '(3,2)', '(3,3) = 4'], marks: { '4': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Run a separate BFS from every gate, and in each room keep the smallest distance seen.',
      cost: 'O(k · m · n)',
      waste: 'Rooms near several gates are reached and compared again by every gate\'s search.',
    },
    pattern: {
      pick: 'graph-traversal',
      why: 'Multi-source BFS from all gates: a room is set the first time it is reached, to its ring number. O(m · n).',
      not: [
        { id: 'shortest-paths', why: 'Steps all cost 1, so BFS levels are the distances.' },
        { id: 'dp-grid', why: 'Walls force detours in any direction, so no single fill order works.' },
      ],
    },
    watch: {
      viz: 'GraphWalkViz',
      inputs: [
        { label: 'the example', input: { mode: 'gates', rooms: [[1, 2, 0, 1], [1, 1, 1, 2], [1, 2, 1, 2], [0, 2, 1, 1]] } },
        { label: 'a room cut off', input: { mode: 'gates', rooms: [[0, 1, 2, 1], [1, 1, 2, 1], [2, 2, 2, 1]] } },
      ],
    },
    edges: ['No gates: [[INF, INF]] → [[INF, INF]].', 'Room walled in: [[0, -1, INF]] → INF stays.', 'Only walls: [[-1]] → [[-1]].'],
  },

  'open-the-lock': {
    aha: 'Each combination is a node, and turning one wheel by one is an edge: every combination has 8 neighbours. The fewest moves is a shortest path, so BFS from "0000", never entering a dead end. There are only 10⁴ combinations, so the whole search is small.',
    asks: {
      read: 'What is one move, and what happens at 9?',
      budget: 'How many combinations exist, and how many neighbours each?',
      observe: 'With two wheels, picture the combinations as a 10 × 10 grid. What does one move do?',
      brute: 'Trying sequences of moves at random or by DFS: why does that fail to give the minimum?',
      pattern: 'Nodes, edges, equal-cost steps, shortest path: which search?',
      watch: 'Watch BFS on a 2-wheel lock, where the combinations form a 10 × 10 grid that wraps.',
    },
    read: [
      { phrase: 'One move turns one wheel by one slot in either direction', says: '4 wheels × 2 directions = 8 neighbours.' },
      { phrase: 'the wheels wrap around (`9` turns into `0` and `0` into `9`)', says: 'Neighbours wrap: from 0 you can reach 9 in one move.' },
      {
        phrase: 'if the wheels ever show one of them, you are stuck',
        says: 'Dead ends are walls: never enter them. If "0000" is one, the answer is −1.',
      },
    ],
    budget: {
      from: '10⁴ combinations, 8 neighbours each',
      rows: [['DFS over move sequences', 'no bound on depth', 'bad', 'no shortest guarantee'], ['BFS over all combinations', '10⁴ × 8', 'ok', 'tiny']],
      aim: 'O(10⁴ · 8)',
      note: 'The state space is fixed and small; generating neighbours as strings is the only cost.',
    },
    observe: [
      {
        title: 'Two wheels make a grid',
        text: 'With two wheels, combination "ab" is the cell at row a, column b of a 10 × 10 grid. One move is one step up, down, left or right, and the grid wraps around its edges.',
        sketch: { kind: 'array', rows: [{ items: ['00', '01', '09', '10', '90'], marks: { '0': 'cur' } }], caption: '00 neighbours: 01, 09, 10, 90' },
      },
      {
        title: 'Dead ends are walls',
        text: 'If 01 and 10 are dead, the only ways out of 00 are 09 and 90, so the search goes round the other side through the wrap.',
        sketch: { kind: 'array', rows: [{ items: ['01 ✕', '10 ✕', '09 ok', '90 ok'], marks: { '0': 'bad', '1': 'bad', '2': 'hit', '3': 'hit' } }] },
      },
      {
        title: 'Four wheels: the same BFS',
        text: 'Four wheels are a 4-dimensional version of that grid: 10⁴ cells, 8 neighbours each. BFS level by level from "0000" until target appears.',
        sketch: { kind: 'array', rows: [{ label: '0000 → level 1', items: ['1000', '9000', '0100', '0900', '0010', '0090', '0001', '0009'] }] },
      },
    ],
    brute: {
      idea: 'DFS over sequences of moves from "0000", tracking the shortest sequence that reaches target.',
      cost: 'O(8^d)',
      waste: 'DFS can wander far before finding a short route and revisits combinations through different move orders.',
    },
    pattern: {
      pick: 'graph-traversal',
      why: 'BFS over an implicit graph: states are combinations, edges are single-wheel turns; skip dead ends and seen states. Bidirectional BFS meets in the middle for fewer states. O(10⁴ · 8).',
      not: [
        { id: 'backtracking', why: 'Trying sequences explores the same states many times; BFS visits each once.' },
        { id: 'shortest-paths', why: 'All moves cost 1: plain BFS.' },
      ],
    },
    watch: {
      viz: 'GraphWalkViz',
      inputs: [
        { label: '2 wheels: dead ends force the wrap', input: { mode: 'lock', dead: ['01', '10', '12', '21'], target: '22' } },
        { label: '2 wheels: 00 → 19', input: { mode: 'lock', dead: [], target: '19' } },
        { label: '2 wheels: walled off', input: { mode: 'lock', dead: ['54', '56', '45', '65'], target: '55' } },
      ],
    },
    edges: ['Start is dead: deadends ["0000"] → −1.', 'Wrap: target "0009" → 1.', 'Target walled off by its 8 neighbours → −1.'],
    not: { '1': [] },
  },

  'evaluate-division': {
    aha: 'Treat each variable as a node and each equation a / b = v as two edges: a → b with weight v, and b → a with 1 / v. Then a / c is the product of the weights along any path from a to c. Each query is a search; unknown variables or no path mean −1.',
    asks: {
      read: 'When must the answer be −1, even for x / x?',
      budget: 'At most 20 equations and 20 queries. Is a search per query fine?',
      observe: 'From a / b = 2 and b / c = 3, how do you get a / c? And b / a?',
      brute: 'Solving for every variable\'s value: what goes wrong?',
      pattern: 'What does chaining two equations look like as a walk?',
      watch: 'Watch each query search for a path, multiplying as it goes.',
    },
    read: [
      { phrase: 'mean that `A_i / B_i = values[i]`', says: 'An edge with a ratio on it; walking backwards uses the reciprocal.' },
      {
        phrase: 'that includes any query mentioning a variable that never appears in the equations (even `x / x`)',
        says: 'Check the variable exists before anything else.',
      },
      { phrase: 'no division by zero and no contradictions', says: 'Any path between two variables gives the same product.' },
    ],
    budget: {
      from: 'equations ≤ 20, queries ≤ 20',
      rows: [
        ['solve for every variable\'s value', 'impossible: only ratios are known', 'bad', 'wrong idea'],
        ['one search per query', '20 × 40 edges', 'ok', 'tiny'],
      ],
      aim: 'O(Q · (V + E))',
      note: 'With many queries, weighted union-find answers each in near O(1).',
    },
    observe: [
      {
        title: 'Chains multiply',
        text: 'a / c = (a / b) × (b / c) = 2 × 3 = 6. A path a → b → c multiplies its edge weights.',
        sketch: { kind: 'array', rows: [{ items: ['a', '×2 →', 'b', '×3 →', 'c'], marks: { '4': 'hit' } }], caption: 'a / c = 6' },
      },
      {
        title: 'Backwards divides',
        text: 'b / a is the a → b edge walked backwards: 1 / 2 = 0.5. Adding both directions for each equation makes every path walkable.',
        sketch: { kind: 'array', rows: [{ items: ['b → a', 'weight 1 / 2', '= 0.5'], marks: { '2': 'hit' } }] },
      },
      {
        title: 'Unknown means −1',
        text: 'x never appears, so x / x is −1, not 1. a / e: e never appears either: −1. Two variables in separate groups also give −1: no path.',
        sketch: { kind: 'array', rows: [{ items: ['a / a = 1', 'x / x = −1', 'a / e = −1'], marks: { '0': 'hit', '1': 'bad', '2': 'bad' } }] },
      },
    ],
    brute: {
      idea: 'Try to give every variable a numeric value from the equations and divide.',
      cost: 'O(V + E)',
      waste: 'Variables in different groups have no common scale, so they can\'t all be given values from the equations; and unknown variables still need special handling.',
    },
    pattern: {
      pick: 'graph-traversal',
      why: 'Weighted graph search: edges a → b (v) and b → a (1 / v); DFS/BFS per query multiplying weights. O(Q · (V + E)). Weighted union-find for many queries.',
      not: [
        { id: 'union-find', why: 'A weighted union-find works too, storing each variable\'s ratio to its root.' },
        { id: 'shortest-paths', why: 'Any path gives the same product (no contradictions), so there is nothing to minimise.' },
      ],
    },
    watch: {
      viz: 'GraphWalkViz',
      inputs: [
        {
          label: 'the example',
          input: { mode: 'division', eq: [['a', 'b', 2], ['b', 'c', 3]], queries: [['a', 'c'], ['b', 'a'], ['a', 'e'], ['a', 'a'], ['x', 'x']] },
        },
        {
          label: 'two groups',
          input: { mode: 'division', eq: [['a', 'b', 2], ['b', 'c', 3], ['x', 'y', 4]], queries: [['c', 'a'], ['a', 'y'], ['y', 'x']] },
        },
      ],
    },
    edges: ['Same known variable: a / a → 1.', 'Unknown variable: x / x → −1.', 'Different groups: a / x → −1.'],
  },

  'word-ladder': {
    aha: 'Words are nodes; two words are connected when they differ in exactly one letter. The shortest transformation is a shortest path, so BFS level by level from beginWord. Generate neighbours by changing each letter to a–z and keeping the results that are in the word set, and remove a word from the set as soon as it is reached.',
    asks: {
      read: 'Must beginWord be in the list? What is counted, words or changes?',
      budget: '5000 words of length up to 10. How do you find a word\'s neighbours quickly?',
      observe: 'From hit, which words in the list are one letter away? From those?',
      brute: 'Comparing a word with every other word to find neighbours: how expensive is that?',
      pattern: 'Fewest one-letter steps: which search, on what graph?',
      watch: 'Watch the BFS levels of words grow until cog appears.',
    },
    read: [
      { phrase: 'changes one letter at a time', says: 'An edge joins words that differ in exactly one position.' },
      { phrase: 'every word after `beginWord` must be in `wordList`', says: 'If endWord isn\'t in the list, the answer is 0 right away.' },
      { phrase: 'counting both ends', says: 'hit → hot → dot → dog → cog is 5 words, 4 changes.' },
    ],
    budget: {
      from: 'N ≤ 5000 words, length L ≤ 10',
      rows: [
        ['compare every pair', 'N² · L = 2.5 × 10⁸', 'bad', 'too slow'],
        ['generate L · 26 candidates per word', 'N · L · 26 = 1.3 × 10⁶', 'ok', 'fits'],
      ],
      aim: 'O(N · L² · 26)',
      note: 'Building each candidate string costs L, hence L².',
    },
    observe: [
      {
        title: 'Levels of words',
        text: 'hit → hot (level 2). hot → dot, lot (level 3). dot → dog, lot → log (level 4). dog → cog (level 5).',
        sketch: {
          kind: 'array',
          rows: [
            { label: '1', items: ['hit'] },
            { label: '2', items: ['hot'] },
            { label: '3', items: ['dot', 'lot'] },
            { label: '4', items: ['dog', 'log'] },
            { label: '5', items: ['cog'], marks: { '0': 'hit' } },
          ],
        },
      },
      {
        title: 'Generate, don\'t compare',
        text: 'For hot, try h?t... no: try every position with every letter: aot, bot, …, hat, hbt, …, dot is in the set, lot is in the set. 3 × 26 lookups instead of comparing with all N words.',
        sketch: { kind: 'array', rows: [{ items: ['?ot → dot, lot', 'h?t → —', 'ho? → —'], marks: { '0': 'hit' } }] },
      },
      {
        title: 'Remove words when reached',
        text: 'When dot is reached at level 3, remove it from the set. If lot could also reach dot later, that would be a longer route anyway; removing it stops it being queued twice.',
        sketch: { kind: 'array', rows: [{ label: 'set after level 3', items: ['dog', 'log', 'cog'] }] },
      },
    ],
    brute: {
      idea: 'BFS where each word\'s neighbours are found by comparing it letter by letter with every unvisited word in the list.',
      cost: 'O(N² · L)',
      waste: 'Most comparisons fail; generating the L × 26 possible neighbours and looking them up is far fewer checks when N is large.',
    },
    pattern: {
      pick: 'graph-traversal',
      why: 'BFS over an implicit graph of words: neighbours by changing one letter (set lookups), remove words as they are reached; the level of endWord is the answer. O(N · L² · 26).',
      not: [
        { id: 'backtracking', why: 'Exploring all chains finds the shortest only after trying the long ones; BFS finds it first.' },
        { id: 'tries', why: 'A trie can help match patterns, but a hash set of words is enough.' },
      ],
    },
    watch: {
      viz: 'GraphWalkViz',
      inputs: [
        { label: 'hit → cog', input: { mode: 'ladder', begin: 'hit', end: 'cog', words: ['hot', 'dot', 'dog', 'lot', 'log', 'cog'] } },
        { label: 'cog missing', input: { mode: 'ladder', begin: 'hit', end: 'cog', words: ['hot', 'dot', 'dog', 'lot', 'log'] } },
      ],
    },
    edges: ['endWord not in the list → 0.', 'One step: hit → hot with [hot] → 2.', 'No connection: hit → cog with [cog] → 0.'],
  },

  'reconstruct-itinerary': {
    aha: 'Using every ticket once is an Eulerian path. Walk greedily along the smallest unused ticket. When you reach an airport with no tickets left, it must be the end of what remains of the trip, so put it at the front of the route and back up. Detours you skipped get spliced in automatically.',
    asks: {
      read: 'Which tie-break picks between valid itineraries? Is one always possible?',
      budget: '300 tickets. Is trying every order feasible?',
      observe: 'With JFK→KUL, JFK→NRT, NRT→JFK, what goes wrong if you always take the smallest ticket?',
      brute: 'Backtracking in lexical order works. When does it have to undo?',
      pattern: 'When you get stuck, what do you know about the airport you\'re stuck at?',
      watch: 'Watch the stack walk greedily and the route build from the back.',
    },
    read: [
      { phrase: 'must use', says: 'Every ticket exactly once: an Eulerian path through the airports.' },
      {
        phrase: 'return the one that is smallest when the airport codes are read in order',
        says: 'Prefer smaller destinations first: sort each airport\'s tickets.',
      },
      {
        phrase: 'At least one valid itinerary always exists',
        says: 'A valid itinerary always exists, so you never need to report failure; the only question is finding the smallest one.',
      },
    ],
    budget: {
      from: 'tickets ≤ 300',
      rows: [['backtracking', 'exponential in the worst case', 'bad', 'risky'], ['Hierholzer', 'E log E for sorting', 'ok', 'fits']],
      aim: 'O(E log E)',
      note: 'Each ticket is used once; sorting destinations dominates.',
    },
    observe: [
      {
        title: 'Greedy can get stuck',
        text: 'From JFK the smallest ticket is KUL. But KUL has no tickets out, and JFK→NRT, NRT→JFK are still unused. The answer is JFK → NRT → JFK → KUL.',
        sketch: {
          kind: 'array',
          rows: [
            { label: 'greedy', items: ['JFK', 'KUL', 'stuck'], marks: { '2': 'bad' } },
            { label: 'answer', items: ['JFK', 'NRT', 'JFK', 'KUL'], marks: { '3': 'hit' } },
          ],
        },
      },
      {
        title: 'Stuck means "this is the end"',
        text: 'An airport with no tickets left can only be where the trip ends (what is left of it). So write KUL at the end of the route, back up to JFK, and keep walking from there.',
        sketch: { kind: 'array', rows: [{ label: 'route (from the back)', items: ['KUL'] }, { label: 'stack', items: ['JFK'] }] },
      },
      {
        title: 'Detours splice in',
        text: 'From JFK the walk does NRT → JFK and gets stuck at JFK: route JFK KUL, then NRT JFK KUL, then JFK NRT JFK KUL. The skipped loop landed before KUL.',
        sketch: { kind: 'array', rows: [{ label: 'route', items: ['JFK', 'NRT', 'JFK', 'KUL'], marks: { '0': 'hit', '1': 'hit', '2': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Backtracking: sort destinations, DFS from JFK trying the smallest unused ticket first, and undo when stuck before all tickets are used.',
      cost: 'O(E^d)',
      waste: 'A dead end found late undoes a lot of work; Hierholzer never undoes, it just defers stuck airports to the end.',
    },
    pattern: {
      pick: 'graph-traversal',
      why: 'Eulerian path (Hierholzer): stack walk along the smallest unused ticket; when stuck, pop to the front of the route. O(E log E).',
      not: [
        { id: 'backtracking', why: 'Works with lexical ordering, but can undo a lot; Hierholzer is linear after sorting.' },
        { id: 'topological-sort', why: 'The graph can have cycles (JFK → NRT → JFK); the route uses edges, not a node order.' },
      ],
    },
    watch: {
      viz: 'GraphWalkViz',
      inputs: [
        { label: 'a dead end first', input: { mode: 'itinerary', tickets: [['JFK', 'KUL'], ['JFK', 'NRT'], ['NRT', 'JFK']] } },
        {
          label: '5 tickets',
          input: { mode: 'itinerary', tickets: [['JFK', 'SFO'], ['JFK', 'ATL'], ['SFO', 'ATL'], ['ATL', 'JFK'], ['ATL', 'SFO']] },
        },
        { label: 'a chain', input: { mode: 'itinerary', tickets: [['MUC', 'LHR'], ['JFK', 'MUC'], ['SFO', 'SJC'], ['LHR', 'SFO']] } },
      ],
    },
    edges: [
      'One ticket: [JFK→ATL] → [JFK, ATL].',
      'Dead end first: [JFK→KUL, JFK→NRT, NRT→JFK] → [JFK, NRT, JFK, KUL].',
      'Same ticket twice: [JFK→A, A→JFK, JFK→A] → [JFK, A, JFK, A].',
    ],
  },
};
