/** Practice thinking walkthroughs: dp-grid (format: src/data/think/index.js). */

const notGraph = { id: 'shortest-paths', why: 'Moves only go right or down, so cells have a fixed fill order: no Dijkstra needed.' };

export default {
  'unique-paths': {
    aha: 'Every path into a cell arrives from above or from the left, never both, so the counts add: paths(r, c) = paths(r − 1, c) + paths(r, c − 1). The top row and left column have exactly one path each. (It is also a single binomial coefficient: choose which of the m + n − 2 moves go down.)',
    asks: {
      read: 'Which moves are allowed?',
      budget: 'm, n ≤ 100. How many paths could there be?',
      observe: 'For a 3 × 3 grid, how many ways reach the centre?',
      brute: 'Walking every path: how many for a 10 × 10 grid?',
      pattern: 'Where can the last move into a cell come from?',
      watch: 'Watch each cell add the cell above and the cell to its left.',
    },
    read: [
      { phrase: 'It can only move right or down, one cell at a time', says: 'A cell is entered from above or from the left: two terms to add.' },
      { phrase: 'The answer is at most `2 × 10^9`', says: 'Fits in an int; no big numbers.' },
    ],
    budget: { from: 'm, n ≤ 100', rows: [['walk every path', 'C(198, 99) ≈ 10⁵⁸', 'bad', 'impossible'], ['fill the grid', '10⁴', 'ok', 'tiny']], aim: 'O(m · n)', note: 'One row of memory suffices: dp[c] += dp[c − 1].' },
    observe: [
      {
        title: 'Edges have one way',
        text: 'A top-row cell is reached only by moving right all the way; a left-column cell only by moving down.',
        sketch: { kind: 'array', rows: [{ label: 'row 0', items: [1, 1, 1] }, { label: 'row 1', items: [1, '?', '?'] }] },
      },
      {
        title: 'Above + left',
        text: 'The centre of a 3 × 3 grid: 1 way from above + 1 from the left = 2. The bottom-right: 3 + 3 = 6.',
        sketch: { kind: 'array', rows: [{ items: [1, 1, 1] }, { items: [1, 2, 3] }, { items: [1, 3, 6], marks: { 2: 'hit' } }] },
      },
      {
        title: 'Or count the moves',
        text: 'Every path makes m − 1 downs and n − 1 rights in some order: C(m + n − 2, m − 1).',
        sketch: { kind: 'array', rows: [{ items: ['3 × 3', 'C(4, 2)', '= 6'], marks: { 2: 'hit' } }] },
      },
    ],
    brute: { idea: 'Recursively try right and down from every cell and count arrivals at the corner.', cost: 'O(2^(m+n))', waste: 'The number of ways from each cell is recomputed by every path that passes through it.' },
    pattern: {
      pick: 'dp-grid',
      why: 'paths[r][c] = paths[r−1][c] + paths[r][c−1], edges 1. O(m · n) time, O(n) memory.',
      not: [{ id: 'math-for-interviews', why: 'The binomial coefficient gives it in O(min(m, n)) too.' }, notGraph],
    },
    watch: { viz: 'DpGridViz', inputs: [{ label: '4 × 5', input: { mode: 'paths', R: 4, C: 5 } }, { label: '3 × 3', input: { mode: 'paths', R: 3, C: 3 } }] },
    edges: ['One row: m = 1 → 1.', '3 × 7 → 28.', '3 × 2 → 3.'],
  },

  'unique-paths-ii': {
    aha: 'Same recurrence as Unique Paths, but an obstacle cell has zero ways to stand on it, and that zero flows into every cell after it. Careful with the edges: once an obstacle appears in the top row, every cell to its right is unreachable too.',
    asks: {
      read: 'What if the start or the end is blocked?',
      budget: '100 × 100 grid. Same table?',
      observe: 'In a 3 × 3 grid with the centre blocked, how many paths are left?',
      brute: 'Walking every path around obstacles: how many?',
      pattern: 'How does an obstacle change "above + left"?',
      watch: 'Watch zeros spread from the obstacles.',
    },
    read: [
      { phrase: 'the robot cannot enter obstacles', says: 'An obstacle cell gets 0 paths.' },
      { phrase: 'If the start or end is blocked, the answer is `0`', says: 'Handle it naturally: a blocked start gives 0 everywhere.' },
    ],
    budget: { from: 'grid ≤ 100 × 100', n: 1e4, aim: 'O(m · n)', note: 'One row of memory suffices.' },
    observe: [
      {
        title: 'Blocked = 0',
        text: '3 × 3 with the centre blocked: only the two border routes remain, so the corner gets 1 + 1 = 2.',
        sketch: { kind: 'grid', grid: [[0, 0, 0], [0, 1, 0], [0, 0, 0]], marks: { '1,1': 'wall', '2,2': 'hit' }, labels: { '0,0': '1', '0,1': '1', '0,2': '1', '1,0': '1', '1,1': '0', '1,2': '1', '2,0': '1', '2,1': '1', '2,2': '2' } },
      },
      {
        title: 'Edges can be cut off',
        text: 'An obstacle in the top row makes every cell to its right 0: the only way there was straight along the row.',
        sketch: { kind: 'array', rows: [{ label: 'row 0', items: [1, '■', 0, 0], marks: { 1: 'bad' } }] },
      },
      {
        title: 'Start blocked',
        text: 'If (0, 0) is an obstacle, it gets 0 and so does everything else.',
        sketch: { kind: 'array', rows: [{ items: ['start ■', '→ 0'], marks: { 1: 'bad' } }] },
      },
    ],
    brute: { idea: 'Walk every right/down path that avoids obstacles and count those reaching the corner.', cost: 'O(2^(m+n))', waste: 'Each cell\'s count is recomputed by every path through it.' },
    pattern: {
      pick: 'dp-grid',
      why: 'dp[r][c] = 0 on obstacles, else dp[r−1][c] + dp[r][c−1]; dp[0][0] = 1 if open. O(m · n).',
      not: [{ id: 'graph-traversal', why: 'BFS can test reachability, not count paths.' }, notGraph],
    },
    watch: { viz: 'DpGridViz', inputs: [{ label: 'with obstacles', input: { mode: 'obstacles', grid: [[0, 0, 0, 0], [0, 1, 0, 0], [0, 0, 0, 1], [1, 0, 0, 0]] } }, { label: 'centre blocked', input: { mode: 'obstacles', grid: [[0, 0, 0], [0, 1, 0], [0, 0, 0]] } }] },
    edges: ['Start blocked: [[1]] → 0.', 'Centre blocked 3 × 3 → 2.', 'One open cell: [[0]] → 1.'],
  },

  'minimum-path-sum': {
    aha: 'The cheapest path into a cell comes from above or from the left, whichever is cheaper, plus this cell\'s cost: cost(r, c) = grid[r][c] + min(cost above, cost left). Counting adds the two; optimising takes the min.',
    asks: {
      read: 'Which moves are allowed, and can numbers be negative?',
      budget: '200 × 200 grid. One pass?',
      observe: 'In [[1,3,1],[1,5,1],[4,2,1]], why does the best path avoid the 5?',
      brute: 'Summing every path: how many paths?',
      pattern: 'What do you need to know about the cells above and to the left?',
      watch: 'Watch each cell take the cheaper of its two ways in.',
    },
    read: [
      { phrase: 'moving only right or down', says: 'Two ways into each cell.' },
      { phrase: 'the smallest possible sum of the numbers along it', says: 'Min over the two, plus this cell.' },
    ],
    budget: { from: 'grid ≤ 200 × 200', n: 4e4, aim: 'O(m · n)', note: 'The grid itself can hold the DP.' },
    observe: [
      {
        title: 'Cheaper of two',
        text: 'Cell (1, 1) holding 5: from above costs 4, from the left 2; take 2, add 5: 7.',
        sketch: { kind: 'array', rows: [{ items: [1, 4, 5] }, { items: [2, 7, 6] }, { items: [6, 8, 7], marks: { 2: 'hit' } }] },
      },
      {
        title: 'The best path',
        text: '1 → 3 → 1 → 1 → 1 = 7, going round the 5.',
        sketch: { kind: 'array', rows: [{ items: [1, 3, 1, 1, 1], marks: { 0: 'hit', 1: 'hit', 2: 'hit', 3: 'hit', 4: 'hit' } }] },
      },
      {
        title: 'Edges have one way in',
        text: 'Top row: only from the left. Left column: only from above.',
        sketch: { kind: 'array', rows: [{ label: 'row 0', items: [1, 4, 5] }] },
      },
    ],
    brute: { idea: 'Try every right/down path and keep the cheapest sum.', cost: 'O(2^(m+n))', waste: 'The cheapest way to reach each cell is recomputed by every path through it.' },
    pattern: {
      pick: 'dp-grid',
      why: 'cost[r][c] = grid[r][c] + min(cost[r−1][c], cost[r][c−1]). O(m · n), can reuse the grid.',
      not: [{ id: 'greedy', why: 'Always stepping to the cheaper neighbour walks into the 5 later.' }, notGraph],
    },
    watch: { viz: 'DpGridViz', inputs: [{ label: '[[1,3,1],[1,5,1],[4,2,1]]', input: { mode: 'minsum', grid: [[1, 3, 1], [1, 5, 1], [4, 2, 1]] } }, { label: '[[1,2,3],[4,5,6]]', input: { mode: 'minsum', grid: [[1, 2, 3], [4, 5, 6]] } }] },
    edges: ['One cell: [[7]] → 7.', 'One row: [[1, 2, 3]] → 6.', '[[1,2,3],[4,5,6]] → 12.'],
  },

  triangle: {
    aha: 'From the top, the best route depends on choices further down. Turn it around: in the bottom row the best path from a cell is just its value; each cell above adds the cheaper of the two cells below it. After filling upwards, the top cell holds the answer.',
    asks: {
      read: 'From index i, which positions in the next row can you reach?',
      budget: '200 rows. How many paths?',
      observe: 'In the example, which path gives 11?',
      brute: 'Trying every path: how many for 200 rows?',
      pattern: 'Which direction makes the answer a single cell?',
      watch: 'Watch the table fill from the bottom row up.',
    },
    read: [
      { phrase: 'from index `i` you can go to index `i` or `i + 1`', says: 'Two children per cell: below and below-right.' },
      { phrase: 'Return the minimum sum of a path from the top to the bottom row', says: 'Minimise; any bottom cell can end the path.' },
    ],
    budget: { from: 'rows ≤ 200', rows: [['every path', '2¹⁹⁹', 'bad', 'impossible'], ['bottom-up DP', '200² / 2', 'ok', 'tiny']], aim: 'O(n²)', note: 'One row of memory (the row below) suffices.' },
    observe: [
      {
        title: 'Start at the bottom',
        text: 'Bottom row [4, 1, 8, 3]: the best from each cell is itself.',
        sketch: { kind: 'array', rows: [{ items: [4, 1, 8, 3] }] },
      },
      {
        title: 'Each cell takes the cheaper child',
        text: 'Row [6, 5, 7]: 6 + min(4, 1) = 7, 5 + min(1, 8) = 6, 7 + min(8, 3) = 10.',
        sketch: { kind: 'array', rows: [{ items: [7, 6, 10], marks: { 1: 'hit' } }] },
      },
      {
        title: 'The top is the answer',
        text: 'Next row: 3 + 6 = 9, 4 + 6 = 10. Top: 2 + 9 = 11 (2 → 3 → 5 → 1).',
        sketch: { kind: 'array', rows: [{ items: [2, 3, 5, 1, '= 11'], marks: { 4: 'hit' } }] },
      },
    ],
    brute: { idea: 'Recursively try both children from every cell and keep the cheapest total.', cost: 'O(2ⁿ)', waste: 'Each cell is reached from two parents, so its best path is recomputed exponentially often.' },
    pattern: {
      pick: 'dp-grid',
      why: 'Bottom-up: best[r][i] = tri[r][i] + min(best[r+1][i], best[r+1][i+1]); answer best[0][0]. O(n²), O(n) memory.',
      not: [{ id: 'greedy', why: 'Taking the cheaper child at each step can lead into an expensive row later.' }, { id: 'tree-dfs', why: 'It looks like a tree, but children are shared, so plain DFS repeats work.' }],
    },
    watch: { viz: 'DpGridViz', inputs: [{ label: 'the example', input: { mode: 'triangle', tri: [[2], [3, 4], [6, 5, 7], [4, 1, 8, 3]] } }, { label: '[[-10]]', input: { mode: 'triangle', tri: [[-10]] } }] },
    edges: ['One row: [[-10]] → −10.', 'Two rows: [[1],[2,3]] → 3.', 'The example → 11.'],
  },

  'minimum-falling-path-sum': {
    aha: 'Row by row: the cheapest path ending at (r, c) is its value plus the cheapest of the up to three cells above it (above-left, above, above-right). A path may start anywhere in the first row and end anywhere in the last, so the answer is the minimum of the last row.',
    asks: {
      read: 'Which cells can a step reach? Where can a path start and end?',
      budget: '100 × 100. How many paths?',
      observe: 'In [[2,1,3],[6,5,4],[7,8,9]], which path gives 13?',
      brute: 'Trying every path: how many for n = 100?',
      pattern: 'How many cells can drop into (r, c)?',
      watch: 'Watch each cell pick the cheapest of three above.',
    },
    read: [
      { phrase: 'directly below, below-left or below-right', says: 'Three parents per cell (two at the edges).' },
      { phrase: 'starts at any cell of the first row', says: 'First row = the values; answer = min of the last row.' },
    ],
    budget: { from: 'n ≤ 100', rows: [['every path', '100 · 3⁹⁹', 'bad', 'impossible'], ['row DP', '3 · 10⁴', 'ok', 'tiny']], aim: 'O(n²)', note: 'Two rows of memory.' },
    observe: [
      {
        title: 'Three ways in',
        text: '(1, 1) holding 5 can be reached from 2, 1 or 3 above: 5 + 1 = 6.',
        sketch: { kind: 'array', rows: [{ items: [2, 1, 3] }, { items: [7, 6, 5], marks: { 1: 'hit' } }] },
      },
      {
        title: 'Edges have two',
        text: '(1, 0) only from above (2) or above-right (1): 6 + 1 = 7.',
        sketch: { kind: 'array', rows: [{ items: ['(1,0): 6 + min(2, 1)', '= 7'] }] },
      },
      {
        title: 'Minimum of the last row',
        text: 'Row 1 is [7, 6, 5]. Last row: 7 + min(7, 6) = 13, 8 + min(7, 6, 5) = 13, 9 + min(6, 5) = 14. The answer is the smallest: 13.',
        sketch: { kind: 'array', rows: [{ items: [13, 13, 14], marks: { 0: 'hit', 1: 'hit' } }] },
      },
    ],
    brute: { idea: 'From every start cell, recursively try all three moves down and keep the cheapest sum.', cost: 'O(n · 3ⁿ)', waste: 'Each cell is reached from up to three parents, so its best is recomputed exponentially often.' },
    pattern: {
      pick: 'dp-grid',
      why: 'dp[r][c] = m[r][c] + min(dp[r−1][c−1], dp[r−1][c], dp[r−1][c+1]); answer min(dp[last]). O(n²).',
      not: [{ id: 'greedy', why: 'The cheapest cell now may lead into expensive rows.' }, notGraph],
    },
    watch: { viz: 'DpGridViz', inputs: [{ label: '[[2,1,3],[6,5,4],[7,8,9]]', input: { mode: 'falling', m: [[2, 1, 3], [6, 5, 4], [7, 8, 9]] } }, { label: '[[-19,57],[-40,-5]]', input: { mode: 'falling', m: [[-19, 57], [-40, -5]] } }] },
    edges: ['One cell: [[7]] → 7.', 'Negatives: [[-19,57],[-40,-5]] → −59.', 'The example → 13.'],
  },

  'maximal-square': {
    aha: 'Let side(r, c) be the side of the largest all-ones square whose bottom-right corner is (r, c). It is 1 + the smallest of the three neighbours top, left and top-left: the square can only grow as far as the weakest of them allows. The answer is the largest side, squared.',
    asks: {
      read: 'Is the answer a side or an area?',
      budget: '300 × 300. Checking every square?',
      observe: 'Why does a cell surrounded by 2, 2 and 1 only get side 2?',
      brute: 'For every corner and size, check every cell: how slow?',
      pattern: 'What do the three neighbours above and to the left tell you about a square ending here?',
      watch: 'Watch each cell take 1 + the min of its three neighbours.',
    },
    read: [
      { phrase: 'Return the area of the largest square that contains only `\'1\'`s', says: 'Track the largest side; return side².' },
      { phrase: 'every cell inside it must be `\'1\'`', says: 'A 0 makes side 0 at that cell.' },
    ],
    budget: { from: 'grid ≤ 300 × 300', rows: [['every square, checked cell by cell', 'n⁵ ≈ 10¹²', 'bad', 'too slow'], ['side DP', '9 × 10⁴', 'ok', 'fits']], aim: 'O(m · n)', note: 'One row of memory plus the diagonal value.' },
    observe: [
      {
        title: 'Limited by the weakest neighbour',
        text: 'If top and left allow side 2 but top-left only 1, the 3 × 3 square would need a full 2 × 2 at top-left: it isn\'t there. Side 1 + 1 = 2.',
        sketch: { kind: 'array', rows: [{ items: ['top 2', 'left 2', 'diag 1', '→ 2'], marks: { 2: 'bad', 3: 'hit' } }] },
      },
      {
        title: 'Zeros reset',
        text: 'A cell holding 0 has side 0: no square of ones ends there.',
        sketch: { kind: 'array', rows: [{ items: ['0', '→ 0'] }] },
      },
      {
        title: 'Area at the end',
        text: 'The largest side in the example is 2, so the area is 4.',
        sketch: { kind: 'array', rows: [{ items: ['side 2', 'area 4'], marks: { 1: 'hit' } }] },
      },
    ],
    brute: { idea: 'For every cell as a top-left corner, grow the square while all its cells are 1.', cost: 'O((m·n)²)', waste: 'Each square is rechecked cell by cell; neighbours already know how large a square they support.' },
    pattern: {
      pick: 'dp-grid',
      why: 'side[r][c] = m ? 1 + min(top, left, top-left) : 0; answer max side². O(m · n).',
      not: [{ id: 'monotonic-stack', why: 'Maximal rectangle uses histograms and a stack; squares only need this DP.' }, { id: 'prefix-sums', why: '2-D prefix sums can test a square in O(1) but still try every size.' }],
    },
    watch: { viz: 'DpGridViz', inputs: [{ label: 'the example', input: { mode: 'square', grid: [[1, 0, 1, 0, 0], [1, 0, 1, 1, 1], [1, 1, 1, 1, 1], [1, 0, 0, 1, 0]] } }, { label: '[[0,1],[1,0]]', input: { mode: 'square', grid: [[0, 1], [1, 0]] } }] },
    edges: ['No ones: [["0"]] → 0.', 'Diagonal ones: [["0","1"],["1","0"]] → 1.', 'All ones 3 × 3 → 9.'],
  },

  'count-square-submatrices-with-all-ones': {
    aha: 'Use the Maximal Square DP: side(r, c) = 1 + min(top, left, top-left). Now notice that if the largest square ending at (r, c) has side k, then exactly k squares end there (sizes 1 to k). So the count is just the sum of all the sides.',
    asks: {
      read: 'Are overlapping squares counted separately?',
      budget: '300 × 300. Count every square directly?',
      observe: 'How many squares have their bottom-right corner on a cell with side 3?',
      brute: 'For every corner and size, check the square: how slow?',
      pattern: 'Which DP from Maximal Square already tells you this?',
      watch: 'Watch the count grow by each cell\'s side.',
    },
    read: [
      { phrase: 'Count every square submatrix, of any size', says: 'Sizes 1 up to the largest, at every position.' },
      { phrase: 'the number of squares whose bottom-right corner is a given cell equals the side of the largest one there', says: 'count += side[r][c].' },
    ],
    budget: { from: 'grid ≤ 300 × 300', n: 9e4, aim: 'O(m · n)', note: 'The matrix itself can store the sides.' },
    observe: [
      {
        title: 'Side k means k squares',
        text: 'A 2 × 2 block of ones: the bottom-right cell has side 2, so a 1 × 1 and a 2 × 2 end there.',
        sketch: { kind: 'array', rows: [{ label: 'sides', items: [1, 1] }, { items: [1, 2], marks: { 1: 'hit' } }], caption: '1 + 1 + 1 + 2 = 5 squares' },
      },
      {
        title: 'The example',
        text: '[[0,1,1,1],[1,1,1,1],[0,1,1,1]]: sides add up to 15 (10 of size 1, 4 of size 2, 1 of size 3).',
        sketch: { kind: 'array', rows: [{ items: ['size 1: 10', 'size 2: 4', 'size 3: 1', '= 15'], marks: { 3: 'hit' } }] },
      },
      {
        title: 'Same recurrence',
        text: 'Only the final step differs from Maximal Square: sum instead of max.',
        sketch: { kind: 'array', rows: [{ items: ['max → largest square', 'sum → all squares'] }] },
      },
    ],
    brute: { idea: 'For every top-left corner and every size, check that the whole square is ones.', cost: 'O(m · n · min(m,n)³)', waste: 'Each square is checked cell by cell; the side DP counts them all at once.' },
    pattern: {
      pick: 'dp-grid',
      why: 'side[r][c] = m ? 1 + min(top, left, top-left) : 0; answer = Σ side. O(m · n).',
      not: [{ id: 'prefix-sums', why: '2-D prefix sums test a square in O(1) but must still try every size and position.' }, { id: 'contribution-technique', why: 'Counting by bottom-right corner is a contribution count, but the DP supplies each corner\'s count.' }],
    },
    watch: { viz: 'DpGridViz', inputs: [{ label: 'the example', input: { mode: 'countsq', grid: [[0, 1, 1, 1], [1, 1, 1, 1], [0, 1, 1, 1]] } }, { label: '[[1,0,1],[1,1,0],[1,1,0]]', input: { mode: 'countsq', grid: [[1, 0, 1], [1, 1, 0], [1, 1, 0]] } }] },
    edges: ['All zeros → 0.', '2 × 2 of ones → 5.', '[[1,0,1],[1,1,0],[1,1,0]] → 7.'],
  },

  'dungeon-game': {
    aha: 'Going forwards fails: the route with the most health so far might be the one that later hits a deadly room. Go backwards: need(r, c) = the least health needed when entering (r, c) to reach the princess alive = max(1, min(need right, need down) − dungeon[r][c]). The answer is need(0, 0).',
    asks: {
      read: 'When does the knight die? Does health have an upper limit?',
      budget: '200 × 200. Can you try every route?',
      observe: 'Why can\'t you just maximise health along the way?',
      brute: 'Trying every route with its worst point: how many routes?',
      pattern: 'Which end of the grid knows exactly what it needs?',
      watch: 'Watch the table fill from the princess back to the start.',
    },
    read: [
      { phrase: 'If his health ever drops to 0 or below, he dies', says: 'Health must stay at least 1 after every room.' },
      { phrase: 'Return the minimum health he needs at the start', says: 'A requirement, computed backwards.' },
    ],
    budget: { from: 'grid ≤ 200 × 200', rows: [['every route', 'C(398, 199)', 'bad', 'impossible'], ['backwards DP', '4 × 10⁴', 'ok', 'tiny']], aim: 'O(m · n)', note: 'Binary search on the start health + forward check also works, slower.' },
    observe: [
      {
        title: 'Forwards is misleading',
        text: 'A route that gains lots of health early might still need more at the start than a route with a smaller worst moment. What matters is the lowest point along the route, which forwards DP can\'t combine.',
        sketch: { kind: 'array', rows: [{ items: ['best so far', '≠', 'safest'], marks: { 1: 'bad' } }] },
      },
      {
        title: 'Backwards, needs are exact',
        text: 'Princess room −5: enter with 6. Room above it (+1): needs 6 − 1 = 5. Never below 1, because health must stay positive.',
        sketch: { kind: 'array', rows: [{ items: ['need 6 at −5', 'need 5 at +1'] }] },
      },
      {
        title: 'The example needs 7',
        text: 'The best route is right, right, down, down: −2, −3, +3, +1, −5. Starting with 7 he never drops below 1.',
        sketch: { kind: 'array', rows: [{ items: [-2, -3, 3, 1, -5], marks: { 0: 'hit', 1: 'hit', 2: 'hit', 3: 'hit', 4: 'hit' } }], caption: 'start with 7' },
      },
    ],
    brute: { idea: 'Try every right/down route, compute the health it needs (one more than its deepest dip), and take the smallest.', cost: 'O(2^(m+n) · (m+n))', waste: 'The requirement from each room to the end is recomputed by every route through it.' },
    pattern: {
      pick: 'dp-grid',
      why: 'Backwards DP: need[r][c] = max(1, min(need[r][c+1], need[r+1][c]) − d[r][c]); answer need[0][0]. O(m · n).',
      not: [{ id: 'binary-search-on-answer', why: 'Binary search on the start health with a forward check works, slower.' }, notGraph],
    },
    watch: { viz: 'DpGridViz', inputs: [{ label: 'the example', input: { mode: 'dungeon', d: [[-2, -3, 3], [-5, -10, 1], [10, 30, -5]] } }, { label: '[[0]]', input: { mode: 'dungeon', d: [[0]] } }] },
    edges: ['One harmless room: [[0]] → 1.', 'One healing room: [[5]] → 1.', 'One deadly room: [[-5]] → 6.'],
  },

  'cherry-pickup': {
    aha: 'Doing the trip there and then back is the same as two walkers going from the top-left to the bottom-right at the same time. After k steps each walker is on the diagonal r + c = k, so a state is (k, row of walker 1, row of walker 2). If both stand on one cell, its cherry counts once. Each state takes the best of the four ways the two could have arrived.',
    asks: {
      read: 'Can a cherry be picked twice? What blocks a walk?',
      budget: 'n ≤ 50. Can you try every pair of paths?',
      observe: 'Why does doing the best first trip and then the best second trip fail?',
      brute: 'Every pair of paths: how many?',
      pattern: 'If the two trips happen at the same time, what do both walkers share?',
      watch: 'Watch the (walker 1 row, walker 2 row) table, one step at a time.',
    },
    read: [
      { phrase: 'then walk back to the top-left moving only left or up', says: 'The return trip is a second forward path in reverse.' },
      { phrase: 'a cell\'s cherry can be picked only once', says: 'If both walkers are on one cell, count it once.' },
      { phrase: 'or `0` if there is no valid trip', says: 'Unreachable states stay −∞; return max(0, …).' },
    ],
    budget: { from: 'n ≤ 50', rows: [['every pair of paths', 'C(98, 49)²', 'bad', 'impossible'], ['(step, r1, r2) DP', '2n · n² ≈ 2.5 × 10⁵', 'ok', 'fits']], aim: 'O(n³)', note: 'Keep only the previous step\'s table.' },
    observe: [
      {
        title: 'Greedy trips fail',
        text: 'The best single trip can grab cherries in a way that splits the rest awkwardly; two best-in-turn trips can collect less than two coordinated ones.',
        sketch: { kind: 'array', rows: [{ items: ['best trip 1', '+ best trip 2', '≠ best pair'], marks: { 2: 'bad' } }] },
      },
      {
        title: 'Move together',
        text: 'After the same number of steps both walkers are on one diagonal. So they share a cell exactly when they share a row: easy to count the cherry once.',
        sketch: { kind: 'array', rows: [{ items: ['k = r + c', 'same row', '→ same cell'] }] },
      },
      {
        title: 'Four ways to arrive',
        text: 'Each walker came from above or from the left: 2 × 2 combinations of the previous step\'s states.',
        sketch: { kind: 'array', rows: [{ items: ['↓↓', '↓→', '→↓', '→→'] }] },
      },
    ],
    brute: { idea: 'Enumerate every valid path there and every valid path back, and count the union of cherries for each pair.', cost: 'O(C(2n, n)² · n)', waste: 'Pairs of paths share prefixes; the DP merges all pairs reaching the same two cells at the same step.' },
    pattern: {
      pick: 'dp-grid',
      why: 'dp[k][r1][r2] = cherries at both cells (once if equal) + max of four predecessors; thorns −∞; answer max(0, dp[2n−2][n−1][n−1]). O(n³).',
      not: [{ id: 'greedy', why: 'Two greedy trips can miss cherries one coordinated pair would get.' }, { id: 'backtracking', why: 'Enumerating path pairs is exponential.' }],
    },
    watch: { viz: 'DpGridViz', inputs: [{ label: 'the example', input: { mode: 'cherry', g: [[0, 1, -1], [1, 0, -1], [1, 1, 1]] } }, { label: 'blocked', input: { mode: 'cherry', g: [[1, 1, -1], [1, -1, 1], [-1, 1, 1]] } }] },
    edges: ['No valid trip: [[1,1,-1],[1,-1,1],[-1,1,1]] → 0.', 'One cell: [[1]] → 1.', 'The example → 5.'],
  },

  'longest-increasing-path-in-a-matrix': {
    aha: 'Let len(cell) be the longest strictly increasing path ending at that cell: 1 + the best len of a smaller neighbour. Strictly increasing steps can never loop, so the cells form a DAG. Process cells in increasing order of value (or DFS with memoisation) and every smaller neighbour is already finished.',
    asks: {
      read: 'Which moves are allowed, and must steps strictly increase?',
      budget: '200 × 200. DFS from every cell without memory?',
      observe: 'In [[9,9,4],[6,6,8],[2,1,1]], which path has length 4?',
      brute: 'DFS from every cell, exploring every increasing path: why slow?',
      pattern: 'Why can\'t an increasing path loop, and what does that let you do?',
      watch: 'Watch cells fill in increasing order of value.',
    },
    read: [
      { phrase: 'each step must go to a strictly larger value', says: 'No cycles: a DAG, so DP works.' },
      { phrase: 'left, right, up or down', says: 'Four neighbours; no fixed direction, so order the cells by value.' },
    ],
    budget: { from: 'grid ≤ 200 × 200', rows: [['DFS without memo', 'exponential', 'bad', 'too slow'], ['memo / value order', '4 × 10⁴ · 4', 'ok', 'fits']], aim: 'O(m · n)', note: 'O(m · n log(m · n)) if you sort instead of DFS.' },
    observe: [
      {
        title: 'The path',
        text: '1 → 2 → 6 → 9 has length 4.',
        sketch: { kind: 'array', rows: [{ items: [1, 2, 6, 9], marks: { 3: 'hit' } }] },
      },
      {
        title: 'Smaller neighbours first',
        text: 'Sorting by value guarantees that when a cell is handled, all its smaller neighbours already have their final len.',
        sketch: { kind: 'array', rows: [{ label: 'order', items: [1, 1, 2, 4, 6, 6, 8, 9, 9] }] },
      },
      {
        title: 'No cycles',
        text: 'A path can\'t come back to a cell, because values strictly increase along it. That is what makes memoisation safe.',
        sketch: { kind: 'array', rows: [{ items: ['a < b < c', '≠ back to a'] }] },
      },
    ],
    brute: { idea: 'From every cell, DFS through all strictly increasing paths and keep the longest.', cost: 'O(4^(m·n))', waste: 'The longest path from a cell is recomputed every time a path reaches it; memoising it makes each cell O(1).' },
    pattern: {
      pick: 'dp-grid',
      why: 'DP on a DAG: len = 1 + max len of a smaller neighbour, in increasing value order (or memoised DFS). O(m · n).',
      not: [{ id: 'topological-sort', why: 'Kahn-style peeling from local minima also works: the number of layers is the answer.' }, { id: 'graph-traversal', why: 'Plain DFS without memo repeats work exponentially.' }],
    },
    watch: { viz: 'DpGridViz', inputs: [{ label: '[[9,9,4],[6,6,8],[2,1,1]]', input: { mode: 'lip', m: [[9, 9, 4], [6, 6, 8], [2, 1, 1]] } }, { label: '[[3,4,5],[3,2,6],[2,2,1]]', input: { mode: 'lip', m: [[3, 4, 5], [3, 2, 6], [2, 2, 1]] } }] },
    edges: ['One cell: [[1]] → 1.', 'All equal: [[7,7],[7,7]] → 1.', '[[3,4,5],[3,2,6],[2,2,1]] → 4.'],
  },
};
