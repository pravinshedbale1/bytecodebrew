/** Practice thinking walkthroughs: matrix-simulation (format: src/data/think/index.js). */

export default {
  'transpose-matrix': {
    free: true,
    aha: 'Row i of the input becomes column i of the output: t[c][r] = m[r][c]. For a non-square matrix the shape flips from m × n to n × m, so you can\'t swap in place; build a new n × m array and copy each cell once.',
    asks: {
      read: 'What happens to the shape of a 2 × 3 matrix?',
      budget: 'Up to 10⁵ cells. How many times must each cell be touched?',
      observe: 'Where does the 6 of [[1, 2, 3], [4, 5, 6]] end up?',
      brute: 'Why does swapping m[r][c] with m[c][r] in place fail here?',
      pattern: 'What is the formula that sends (r, c) to its new place?',
      watch: 'Watch each row become a column of the new matrix.',
    },
    read: [
      { phrase: 'flip it over its main diagonal, so row `i` becomes column `i`', says: 't[c][r] = m[r][c].' },
      { phrase: 'create a new `n × m` result rather than swapping in place', says: 'The shape changes: allocate the result.' },
    ],
    budget: { from: '≤ 10⁵ cells', rows: [['copy each cell once', '10⁵', 'ok', 'instant']], aim: 'O(rows × cols)', note: 'A square matrix can be transposed in place by swapping above the diagonal only.' },
    observe: [
      {
        title: 'Rows become columns',
        text: '[[1, 2, 3], [4, 5, 6]] becomes [[1, 4], [2, 5], [3, 6]]: the first row (1, 2, 3) is now the first column.',
        sketch: { kind: 'grid', grid: [['1', '4'], ['2', '5'], ['3', '6']], marks: { '0,0': 'hit', '1,0': 'hit', '2,0': 'hit' } },
      },
      {
        title: 'The 6 moves from (1, 2) to (2, 1)',
        text: 'Swap the indexes: m[1][2] = 6 lands at t[2][1].',
        sketch: { kind: 'grid', grid: [['1', '2', '3'], ['4', '5', '6']], marks: { '1,2': 'cur' } },
      },
    ],
    brute: { idea: 'Swap m[r][c] with m[c][r] in place, as for a square matrix.', cost: 'O(rows × cols)', waste: 'Not slow, but wrong for non-square shapes: m[c][r] doesn\'t exist when the matrix isn\'t square.' },
    pattern: {
      pick: 'matrix-simulation',
      why: 'int[][] t = new int[cols][rows]; for r, c: t[c][r] = m[r][c]. O(rows × cols).',
      not: [{ id: 'two-pointers', why: 'There is nothing to search; every cell has a fixed destination.' }, { id: 'math-for-interviews', why: 'The formula is trivial; the only trap is the changing shape.' }],
    },
    watch: { viz: 'MatrixViz', inputs: [{ label: '2 × 3', input: { mode: 'transpose', m: [[1, 2, 3], [4, 5, 6]] } }, { label: '3 × 3', input: { mode: 'transpose', m: [[1, 2, 3], [4, 5, 6], [7, 8, 9]] } }] },
    edges: ['One row: [[1, 2, 3]] → [[1], [2], [3]].', 'One cell: [[5]] → [[5]].', '[[1, 2, 3], [4, 5, 6]] → [[1, 4], [2, 5], [3, 6]].'],
  },

  'spiral-matrix': {
    aha: 'Keep the unread part of the matrix as four boundaries: top, bottom, left, right. Read the top row, then the right column, then the bottom row backwards, then the left column upwards, moving each boundary inwards after its side. Check top ≤ bottom and left ≤ right before the last two sides, or a single leftover row or column is read twice.',
    asks: {
      read: 'Which direction comes after each side?',
      budget: 'At most 100 cells. What matters more than speed here?',
      observe: 'For a 3 × 1 matrix, what goes wrong if you always walk all four sides?',
      brute: 'Walking with a direction and a visited set: does it work?',
      pattern: 'What four numbers describe the part not read yet?',
      watch: 'Watch the boundaries shrink after each side.',
    },
    read: [
      { phrase: 'go right along the top row, down the right column, left along the bottom row, up the left column', says: 'Four sides per lap, then shrink inwards.' },
      { phrase: 'and continue inward', says: 'Boundaries: top++, right--, bottom--, left++ after each side.' },
    ],
    budget: { from: '≤ 10 × 10', rows: [['every cell once', '100', 'ok', 'instant']], aim: 'O(rows × cols)', note: 'The challenge is correctness on thin matrices, not speed.' },
    observe: [
      {
        title: 'Shrink after every side',
        text: '[[1, 2, 3], [4, 5, 6], [7, 8, 9]]: top row 1, 2, 3; right column 6, 9; bottom row 8, 7; left column 4; then the centre 5.',
        sketch: { kind: 'grid', grid: [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9']], marks: { '1,1': 'hit' } },
      },
      {
        title: 'A single column',
        text: '[[1], [2], [3]]: after the top (1) and the right column (2, 3), left > right, so the left column must not be walked again.',
        sketch: { kind: 'grid', grid: [['1'], ['2'], ['3']], marks: { '0,0': 'hit', '1,0': 'hit', '2,0': 'hit' } },
      },
    ],
    brute: { idea: 'Walk with a direction, turning right whenever the next cell is outside or already visited (a visited matrix).', cost: 'O(rows × cols)', waste: 'Correct too, but needs a visited array; boundaries need no extra memory.' },
    pattern: {
      pick: 'matrix-simulation',
      why: 'while (top ≤ bottom && left ≤ right): top row → top++; right column → right--; if (top ≤ bottom) bottom row ← bottom--; if (left ≤ right) left column ↑ left++. O(rows × cols).',
      not: [{ id: 'graph-traversal', why: 'It is not a search: the order is fixed, so no queue or visited set is needed.' }, { id: 'two-pointers', why: 'Four boundaries move, but they describe a shrinking rectangle, not a pair scan.' }],
    },
    watch: { viz: 'MatrixViz', inputs: [{ label: '4 × 4', input: { mode: 'spiral', m: [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]] } }, { label: '3 × 1', input: { mode: 'spiral', m: [[1], [2], [3]] } }] },
    edges: ['One row: [[1, 2, 3, 4]] → [1, 2, 3, 4].', 'One column: [[1], [2], [3]] → [1, 2, 3].', '3 × 3 → [1, 2, 3, 6, 9, 8, 7, 4, 5].'],
  },

  'spiral-matrix-ii': {
    aha: 'The Spiral Matrix boundaries, writing instead of reading: fill the top row, right column, bottom row and left column with the next numbers, moving each boundary inwards after its side, until the counter passes n².',
    asks: {
      read: 'Which number goes in the top-left, and which direction comes next?',
      budget: 'n ≤ 20: 400 cells. What matters here?',
      observe: 'For n = 3, where does 9 end up?',
      brute: 'A direction walk that turns at filled cells: does it work?',
      pattern: 'Which four numbers describe the part not filled yet?',
      watch: 'Watch each side fill and its boundary move in.',
    },
    read: [
      { phrase: 'filled with the numbers `1` to `n²` in spiral order', says: 'A counter from 1, written in spiral order.' },
      { phrase: 'Keep four boundaries (top, bottom, left, right) and shrink one after finishing each side', says: 'The same loop as reading a spiral.' },
    ],
    budget: { from: 'n ≤ 20', rows: [['every cell once', '400', 'ok', 'instant']], aim: 'O(n²)', note: 'A turn-when-blocked walk works too, since unfilled cells are 0.' },
    observe: [
      {
        title: 'n = 3',
        text: '1, 2, 3 along the top; 4, 5 down the right; 6, 7 along the bottom; 8 up the left; 9 in the centre.',
        sketch: { kind: 'grid', grid: [['1', '2', '3'], ['8', '9', '4'], ['7', '6', '5']], marks: { '1,1': 'hit' } },
      },
      {
        title: 'The centre of an odd square',
        text: 'For odd n the last lap is a single cell: the top row of length 1. The boundary checks stop the other sides from overwriting it.',
        sketch: { kind: 'grid', grid: [['·', '·', '·'], ['·', '9', '·'], ['·', '·', '·']], marks: { '1,1': 'cur' } },
      },
    ],
    brute: { idea: 'Walk right, turning clockwise whenever the next cell is outside or already filled.', cost: 'O(n²)', waste: 'Correct as well; the boundary version just makes each side an explicit loop.' },
    pattern: {
      pick: 'matrix-simulation',
      why: 'k = 1; while (top ≤ bottom && left ≤ right): fill top row, top++; right column, right--; if (top ≤ bottom) bottom row, bottom--; if (left ≤ right) left column, left++. O(n²).',
      not: [{ id: 'math-for-interviews', why: 'There are formulas for the value at (r, c), but the loop is clearer and just as fast.' }, { id: 'graph-traversal', why: 'The order is fixed; nothing to search.' }],
    },
    watch: { viz: 'MatrixViz', inputs: [{ label: 'n = 4', input: { mode: 'spiral2', n: 4 } }, { label: 'n = 3', input: { mode: 'spiral2', n: 3 } }] },
    edges: ['n = 1 → [[1]].', 'n = 2 → [[1, 2], [4, 3]].', 'n = 3 → [[1, 2, 3], [8, 9, 4], [7, 6, 5]].'],
  },

  'rotate-image': {
    aha: 'Tracing four-way swaps around the rings is error-prone. Two simple passes do the same thing: transpose (swap across the main diagonal, so rows become columns), then reverse each row. Together they send (r, c) to (c, n − 1 − r), a 90° clockwise turn, in place.',
    asks: {
      read: 'What does "in place" forbid?',
      budget: 'n ≤ 20. What is the extra-memory limit?',
      observe: 'For [[1, 2], [3, 4]], where does the 1 go?',
      brute: 'Copying into a new matrix with new[c][n − 1 − r] = m[r][c]: what is wrong with it here?',
      pattern: 'Which two simple flips combine into a rotation?',
      watch: 'Watch the transpose, then each row reverse.',
    },
    read: [
      { phrase: 'in place: modify `matrix` directly without allocating another matrix', says: 'O(1) extra space: swaps only.' },
      { phrase: 'A rotation in place is a transpose (swap across the main diagonal) followed by reversing every row', says: 'Two passes of swaps.' },
    ],
    budget: { from: 'n ≤ 20', rows: [['copy to a new matrix', 'O(n²) memory', 'bad', 'not allowed'], ['transpose + reverse rows', 'O(n²) time, O(1) memory', 'ok', 'the answer']], aim: 'O(n²) time, O(1) space', note: 'Rotating ring by ring with four-way swaps is the other in-place method.' },
    observe: [
      {
        title: 'Transpose',
        text: '[[1, 2], [3, 4]] → [[1, 3], [2, 4]]: swap across the diagonal, starting each row at c = r + 1 so no pair is swapped twice.',
        sketch: { kind: 'grid', grid: [['1', '3'], ['2', '4']], marks: { '0,1': 'cur', '1,0': 'cur' } },
      },
      {
        title: 'Then reverse each row',
        text: '[[1, 3], [2, 4]] → [[3, 1], [4, 2]]: the 90° clockwise rotation.',
        sketch: { kind: 'grid', grid: [['3', '1'], ['4', '2']], marks: { '0,1': 'hit' } },
      },
    ],
    brute: { idea: 'Allocate a new matrix and write new[c][n − 1 − r] = m[r][c].', cost: 'O(n²) extra memory', waste: 'Correct, but the problem forbids the second matrix; the two flips need none.' },
    pattern: {
      pick: 'matrix-simulation',
      why: 'for r, for c > r: swap(m[r][c], m[c][r]); then reverse every row. O(n²) time, O(1) space.',
      not: [{ id: 'two-pointers', why: 'Reversing a row uses two pointers, but the key is decomposing the rotation into two flips.' }, { id: 'math-for-interviews', why: 'The index formula is the brute force; it needs a copy.' }],
    },
    watch: { viz: 'MatrixViz', inputs: [{ label: '4 × 4', input: { mode: 'rotate', m: [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]] } }, { label: '3 × 3', input: { mode: 'rotate', m: [[1, 2, 3], [4, 5, 6], [7, 8, 9]] } }] },
    edges: ['1 × 1 → unchanged.', '[[1, 2], [3, 4]] → [[3, 1], [4, 2]].', '3 × 3 → [[7, 4, 1], [8, 5, 2], [9, 6, 3]].'],
  },

  'set-matrix-zeroes': {
    aha: 'You need to know, for every row and column, whether it contains a 0, before changing anything. Two boolean arrays give O(m + n) space. For O(1), use row 0 and column 0 as those arrays: first remember in two flags whether row 0 and column 0 themselves contain a 0, write markers, clear the inner cells from the markers, and clear row 0 and column 0 last.',
    asks: {
      read: 'Why can\'t you clear rows and columns as you find zeros?',
      budget: 'O(m + n) is easy. What does the follow-up want?',
      observe: 'In [[1, 1, 1], [1, 0, 1], [1, 1, 1]], what goes wrong if you zero row 1 immediately?',
      brute: 'Copying the matrix and reading zeros from the copy: what does it cost?',
      pattern: 'Where in the matrix can you store "this row must be cleared"?',
      watch: 'Watch markers go into row 0 and column 0, then the clearing.',
    },
    read: [
      { phrase: 'set its entire row and its entire column to `0`', says: 'Decide per row and per column, then clear.' },
      { phrase: 'Do it in place', says: 'No copy of the matrix.' },
      { phrase: 'the follow-up asks for O(1)', says: 'Store the markers inside the matrix: row 0 and column 0.' },
    ],
    budget: { from: '≤ 200 × 200', rows: [['copy the matrix', 'O(mn) memory', 'bad', 'wasteful'], ['row / column flags', 'O(m + n)', 'ok', 'simple'], ['markers in row 0 / column 0', 'O(1)', 'ok', 'the follow-up']], aim: 'O(mn) time, O(1) space', note: 'Clear row 0 and column 0 last, or the markers get destroyed.' },
    observe: [
      {
        title: 'Clearing too early spreads zeros',
        text: 'Zeroing row 1 right away creates new zeros in columns 0 and 2, which would then wrongly clear those columns too.',
        sketch: { kind: 'grid', grid: [['1', '1', '1'], ['0', '0', '0'], ['1', '1', '1']], marks: { '1,0': 'rotten', '1,2': 'rotten' } },
      },
      {
        title: 'Markers in the first row and column',
        text: 'The 0 at (1, 1) writes 0 at (1, 0) and (0, 1). Then any inner cell whose row or column marker is 0 is cleared: [[1, 0, 1], [0, 0, 0], [1, 0, 1]].',
        sketch: { kind: 'grid', grid: [['1', '0', '1'], ['0', '0', '0'], ['1', '0', '1']], marks: { '0,1': 'cur', '1,0': 'cur' } },
      },
    ],
    brute: { idea: 'Copy the matrix; for every zero in the copy, clear its row and column in the original.', cost: 'O(mn · (m + n)) time, O(mn) memory', waste: 'Rows and columns are cleared many times over, and the copy is only needed to know which rows and columns had a zero.' },
    pattern: {
      pick: 'matrix-simulation',
      why: 'firstRow/firstCol flags; for inner zeros set m[r][0] = m[0][c] = 0; clear inner cells by markers; finally clear row 0 / column 0 by the flags. O(mn), O(1).',
      not: [{ id: 'hashing', why: 'Sets of rows and columns are the O(m + n) version; the follow-up needs no sets.' }, { id: 'graph-traversal', why: 'Zeros don\'t spread step by step; each one clears exactly its row and column.' }],
    },
    watch: { viz: 'MatrixViz', inputs: [{ label: 'zeros in row 0', input: { mode: 'zeroes', m: [[0, 1, 2, 0], [3, 4, 5, 2], [1, 3, 1, 5]] } }, { label: 'one inner zero', input: { mode: 'zeroes', m: [[1, 1, 1], [1, 0, 1], [1, 1, 1]] } }] },
    edges: ['No zeros → unchanged.', '[[1, 1, 1], [1, 0, 1], [1, 1, 1]] → [[1, 0, 1], [0, 0, 0], [1, 0, 1]].', 'A zero in row 0 → the whole first row and its column are cleared.'],
  },

  'game-of-life': {
    aha: 'All cells change at the same moment, so no cell may see a neighbour\'s new state. Copying the board solves it; to do it in place, keep both states in one cell: 2 = alive now, dies; 3 = dead now, is born. While counting, treat 1 and 2 as alive. A second pass turns 2 into 0 and 3 into 1.',
    asks: {
      read: 'Which rule makes a dead cell come alive?',
      budget: '25 × 25 board. Is a copy acceptable? What is the in-place version?',
      observe: 'In the blinker [[0,1,0],[0,1,0],[0,1,0]], how many live neighbours does the middle-left cell have?',
      brute: 'Updating cells one by one in place: what goes wrong?',
      pattern: 'How can one cell hold its old and its new state at the same time?',
      watch: 'Watch each row encode its changes, then the decode pass.',
    },
    read: [
      { phrase: 'All cells update at the same time', says: 'Counts must use the old states only.' },
      { phrase: 'every cell looks at its 8 neighbours', says: 'Diagonals count too.' },
      { phrase: 'Change `board` in place', says: 'Encode old and new together (2 and 3), then decode.' },
    ],
    budget: { from: '≤ 25 × 25', rows: [['copy the board', 'O(mn) memory', 'ok', 'simple'], ['encode 2 / 3', 'O(1) memory', 'ok', 'the follow-up']], aim: 'O(mn) time, O(1) space', note: 'Bit tricks (old state in bit 0, new state in bit 1) are the same idea.' },
    observe: [
      {
        title: 'Updating in order breaks the rules',
        text: 'If a cell dies and is written as 0 right away, its neighbours further on count one live neighbour too few.',
        sketch: { kind: 'grid', grid: [['0', '1', '0'], ['0', '1', '0'], ['0', '1', '0']], marks: { '0,1': 'rotten' } },
      },
      {
        title: 'Old and new in one cell',
        text: 'The blinker: the top and bottom live cells have 1 neighbour, so they become 2 (dies); the side cells have 3, so they become 3 (born). Decoding gives the horizontal bar.',
        sketch: { kind: 'grid', grid: [['0', '2', '0'], ['3', '1', '3'], ['0', '2', '0']], marks: { '0,1': 'wall', '2,1': 'wall', '1,0': 'hit', '1,2': 'hit' } },
      },
    ],
    brute: { idea: 'Copy the board and compute every cell of the next generation from the copy.', cost: 'O(mn) time and memory', waste: 'Correct; the in-place version only saves the copy.' },
    pattern: {
      pick: 'matrix-simulation',
      why: 'Pass 1: n = live neighbours counting 1 and 2; live with n < 2 or > 3 → 2; dead with n == 3 → 3. Pass 2: 2 → 0, 3 → 1. O(mn), O(1).',
      not: [{ id: 'graph-traversal', why: 'Every cell is updated once from its neighbours; nothing spreads or is searched.' }, { id: 'dp-grid', why: 'No cell depends on a computed value of another; all depend on the old board.' }],
    },
    watch: { viz: 'MatrixViz', inputs: [{ label: 'LeetCode example', input: { mode: 'life', m: [[0, 1, 0], [0, 0, 1], [1, 1, 1], [0, 0, 0]] } }, { label: 'blinker', input: { mode: 'life', m: [[0, 1, 0], [0, 1, 0], [0, 1, 0]] } }] },
    edges: ['One live cell → it dies: [[1]] → [[0]].', '[[1, 1], [1, 0]] → [[1, 1], [1, 1]].', 'Blinker vertical → horizontal.'],
  },

  'search-a-2d-matrix-ii': {
    aha: 'Start at the top-right corner. Its value is the largest in its row and the smallest in its column. If it is bigger than the target, nothing below it in that column can match: move left. If it is smaller, nothing to its left in that row can match: move down. Each comparison rules out a whole row or column.',
    asks: {
      read: 'How is this different from Search a 2D Matrix (I)?',
      budget: '300 × 300. Is a binary search per row good enough? Can you do better?',
      observe: 'In the 4 × 4 example, what does comparing 5 with the top-right 11 tell you?',
      brute: 'Scanning every cell: what does it cost?',
      pattern: 'Which corner lets one comparison rule out a whole row or column?',
      watch: 'Watch rows and columns fade as they are ruled out.',
    },
    read: [
      { phrase: 'Each row of `matrix` is sorted in ascending order from left to right', says: 'Left of a cell is smaller.' },
      { phrase: 'each column is sorted in ascending order from top to bottom', says: 'Below a cell is bigger.' },
      { phrase: 'a row does not have to start after the previous row ends', says: 'Not one sorted list: a single binary search won\'t work.' },
    ],
    budget: { from: '≤ 300 × 300', rows: [['scan everything', '9 × 10⁴', 'ok', 'works, slowest'], ['binary search per row', '300 × 9', 'ok', 'O(m log n)'], ['staircase from a corner', '≤ 600', 'ok', 'O(m + n)']], aim: 'O(m + n)', note: 'The bottom-left corner works the same way.' },
    observe: [
      {
        title: 'Too big: drop the column',
        text: 'Target 5. Top-right is 11 > 5, and everything below 11 is bigger still: column 3 is out.',
        sketch: { kind: 'grid', grid: [['1', '4', '7', '11'], ['2', '5', '8', '12'], ['3', '6', '9', '16'], ['10', '13', '14', '17']], marks: { '0,3': 'rotten', '1,3': 'wall', '2,3': 'wall', '3,3': 'wall' } },
      },
      {
        title: 'Too small: drop the row',
        text: 'After 7 and then 4 (< 5), row 0 is out: everything left of 4 is smaller. Move down to 5: found.',
        sketch: { kind: 'grid', grid: [['1', '4', '7', '11'], ['2', '5', '8', '12']], marks: { '0,1': 'cur', '1,1': 'hit' } },
      },
    ],
    brute: { idea: 'Check every cell.', cost: 'O(m · n)', waste: 'The sorted rows and columns are ignored; one comparison at the right corner rules out a whole line.' },
    pattern: {
      pick: 'matrix-simulation',
      why: 'r = 0, c = n − 1; while in bounds: equal → true; bigger → c--; smaller → r++. False when you walk off. O(m + n).',
      not: [{ id: 'binary-search', why: 'Binary search per row is O(m log n); there is no single sorted order to search.' }, { id: 'two-pointers', why: 'r and c move like two pointers, but on two dimensions of a grid.' }],
    },
    watch: { viz: 'MatrixViz', inputs: [{ label: 'target 5', input: { mode: 'search2d', m: [[1, 4, 7, 11], [2, 5, 8, 12], [3, 6, 9, 16], [10, 13, 14, 17]], target: 5 } }, { label: 'target 15', input: { mode: 'search2d', m: [[1, 4, 7, 11], [2, 5, 8, 12], [3, 6, 9, 16], [10, 13, 14, 17]], target: 15 } }] },
    edges: ['One cell: [[−5]], target −5 → true.', 'Target 15 in the 4 × 4 example → false.', 'Target smaller than everything → false after walking left off the matrix.'],
  },

  'diagonal-traverse': {
    aha: 'Every cell on one anti-diagonal has the same r + c. Loop d from 0 to rows + cols − 2 and read the cells with r + c = d, upwards (bottom-left to top-right) when d is even and downwards when it is odd. Clamp the starting row so the diagonal stays inside the matrix.',
    asks: {
      read: 'Which way does the first diagonal go?',
      budget: 'Up to 10⁴ cells. What matters here?',
      observe: 'In a 3 × 3 matrix, which cells share r + c = 2?',
      brute: 'Bouncing a pointer around the edges: why is that fiddly?',
      pattern: 'What do the cells of one diagonal have in common?',
      watch: 'Watch each diagonal read in alternating directions.',
    },
    read: [
      { phrase: 'All cells on one diagonal share the same `row + column`', says: 'Index the diagonals by d = r + c.' },
      { phrase: 'Read even diagonals bottom to top and odd ones top to bottom', says: 'Alternate the direction by parity.' },
    ],
    budget: { from: '≤ 10⁴ cells', rows: [['every cell once', '10⁴', 'ok', 'instant']], aim: 'O(rows × cols)', note: 'The edge-bouncing simulation is the same speed but easy to get wrong.' },
    observe: [
      {
        title: 'Diagonals by r + c',
        text: '3 × 3: d = 2 holds (2, 0), (1, 1), (0, 2): 7, 5, 3. It is even, so read upwards: 7, 5, 3.',
        sketch: { kind: 'grid', grid: [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9']], marks: { '2,0': 'hit', '1,1': 'hit', '0,2': 'hit' } },
      },
      {
        title: 'Alternate directions',
        text: 'd = 0: 1. d = 1 (down): 2, 4. d = 2 (up): 7, 5, 3. d = 3 (down): 6, 8. d = 4: 9.',
        sketch: { kind: 'array', rows: [{ items: [1, 2, 4, 7, 5, 3, 6, 8, 9] }] },
      },
    ],
    brute: { idea: 'Move a pointer up-right or down-left, turning when it hits an edge, with special cases for corners.', cost: 'O(rows × cols)', waste: 'Same speed, but the edge cases (which edge, which corner) are where bugs live; grouping by r + c avoids them.' },
    pattern: {
      pick: 'matrix-simulation',
      why: 'for d in 0..R + C − 2: rows r from max(0, d − C + 1) to min(R − 1, d), c = d − r; reverse the list for even d; append. O(R × C).',
      not: [{ id: 'hashing', why: 'Grouping by r + c in a map works but isn\'t needed: the bounds come from a formula.' }, { id: 'graph-traversal', why: 'The order is fixed; nothing to search.' }],
    },
    watch: { viz: 'MatrixViz', inputs: [{ label: '3 × 3', input: { mode: 'diagonal', m: [[1, 2, 3], [4, 5, 6], [7, 8, 9]] } }, { label: '2 × 4', input: { mode: 'diagonal', m: [[1, 2, 3, 4], [5, 6, 7, 8]] } }] },
    edges: ['One row: [[1, 2, 3]] → [1, 2, 3].', '[[1, 2], [3, 4]] → [1, 2, 3, 4].', '3 × 3 → [1, 2, 4, 7, 5, 3, 6, 8, 9].'],
  },
};
