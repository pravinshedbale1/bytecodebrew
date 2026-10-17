export default {
  'flood-fill': {
    statement: `\`image[i][j]\` is the colour of a pixel. Starting from pixel \`(sr, sc)\`, perform a flood fill: change the starting pixel and every pixel connected to it up, down, left or right through pixels of the same original colour to \`color\`.

Return the modified image.`,
    constraints: ['1 <= image.length <= 50', '1 <= image[0].length <= 50', '0 <= image[i][j] < 2^16', '0 <= color < 2^16', '0 <= sr < image.length', '0 <= sc < image[0].length'],
    hints: [
      'This is a graph search on the grid: pixels are nodes and same-coloured neighbours are edges.',
      'Run a DFS or BFS from (sr, sc), recolouring each pixel with the original colour and visiting its four neighbours.',
      'If the new colour equals the original colour, return immediately; otherwise recoloured pixels would be visited again forever.',
    ],
  },
  'number-of-islands': {
    statement: `\`grid\` is a map of \`'1'\` (land) and \`'0'\` (water). An island is a group of land cells connected horizontally or vertically. The grid is surrounded by water.

Return the number of islands.`,
    constraints: ['1 <= grid.length <= 300', '1 <= grid[0].length <= 300', '`grid[i][j]` is "0" or "1"'],
    hints: [
      'Every time you find an unvisited land cell, you have found a new island.',
      'From that cell, visit the whole island with DFS or BFS and mark its cells as visited (for example by turning them into "0").',
      'Count how many searches you start. Union-find is another way to count the connected groups.',
    ],
  },
  'max-area-of-island': {
    statement: `\`grid\` contains \`0\` (water) and \`1\` (land). An island is a group of 1s connected up, down, left or right. Its area is the number of cells in it.

Return the area of the largest island, or \`0\` if there is no land.`,
    constraints: ['1 <= grid.length <= 50', '1 <= grid[0].length <= 50', '0 <= grid[i][j] <= 1'],
    hints: [
      'Like "Number of Islands", but the search returns how many cells it visited.',
      'A DFS returns 1 + the areas returned from its four neighbours, and 0 for water, visited or out-of-bounds cells.',
      'Mark cells as visited by setting them to 0 so each cell is counted once. Keep the maximum over all islands.',
    ],
  },
  'number-of-provinces': {
    statement: `There are \`n\` cities. \`isConnected[i][j] = 1\` means cities \`i\` and \`j\` are directly connected, and \`0\` means they are not. Connection is transitive: if \`a\` connects to \`b\` and \`b\` to \`c\`, then \`a\` and \`c\` are in the same province.

Return the number of provinces (groups of connected cities).`,
    constraints: ['1 <= isConnected.length <= 200', '0 <= isConnected[i][j] <= 1', '`isConnected[i][i]` is 1 and the matrix is symmetric'],
    hints: [
      'The matrix is an adjacency matrix of an undirected graph; a province is a connected component.',
      'Loop over the cities. From each unvisited city, DFS to every city reachable from it and count one province.',
      'Union-find works too: union i and j whenever isConnected[i][j] is 1, then count the distinct roots.',
    ],
  },
  'clone-graph': {
    statement: `You are given one node of a connected, undirected graph. Each node has an integer \`val\` and a list of \`neighbors\`. Return a deep copy of the whole graph: new nodes with the same values and the same connections, sharing no nodes with the original.

The tests describe the graph as an adjacency list where node \`i + 1\`'s neighbours are at index \`i\`, and you are given node 1. The judge prints your copy's adjacency list and rejects copies that reuse original nodes.`,
    constraints: ['The graph has between 0 and 100 nodes', 'Node values are 1 … n and unique', 'No repeated edges and no self-loops; the graph is connected'],
    hints: [
      'Copy every node exactly once, even though you will reach most nodes several times.',
      'Keep a HashMap from original node to its copy. Before copying a node, check the map.',
      'DFS or BFS: create the copy, record it in the map, then for each neighbour add the neighbour\'s copy (creating it if needed) to the copy\'s neighbour list.',
    ],
  },
  'rotting-oranges': {
    statement: `Each cell of \`grid\` is \`0\` (empty), \`1\` (a fresh orange) or \`2\` (a rotten orange). Every minute, each fresh orange that is next to a rotten one (up, down, left or right) becomes rotten.

Return the number of minutes until no fresh orange remains, or \`-1\` if some orange can never rot.`,
    constraints: ['1 <= grid.length <= 10', '1 <= grid[0].length <= 10', '0 <= grid[i][j] <= 2'],
    hints: [
      'Rot spreads from all rotten oranges at once, one step per minute: a breadth-first search with many starting points.',
      'Put every rotten orange in the queue first and count the fresh ones. Process the queue one level (one minute) at a time.',
      'Each newly rotten orange decreases the fresh count. At the end, return the minutes taken if the count is 0, otherwise −1. No fresh oranges at the start means 0.',
    ],
  },
  '01-matrix': {
    statement: `\`mat\` is a matrix of \`0\`s and \`1\`s with at least one \`0\`. For every cell, find the distance to the nearest \`0\`, where moving one step up, down, left or right counts as distance 1.

Return a matrix of those distances.`,
    constraints: ['1 <= mat.length <= 1e4', '1 <= mat[0].length <= 1e4', 'mat.length × mat[0].length ≤ 10⁴', '0 <= mat[i][j] <= 1', 'At least one cell is 0'],
    hints: [
      'Searching from every 1 separately can be O((mn)²). Turn it around: search outward from the zeros.',
      'Multi-source BFS: start the queue with every 0 at distance 0 and mark the 1s as unvisited.',
      'Each cell gets its distance the first time BFS reaches it, which is guaranteed to be the shortest. A two-pass dynamic programming solution also works.',
    ],
  },
  'shortest-path-in-binary-matrix': {
    statement: `\`grid\` is an \`n × n\` matrix of \`0\`s (open) and \`1\`s (blocked). A clear path goes from the top-left cell to the bottom-right cell through open cells only, moving to any of the 8 neighbouring cells (including diagonals).

Return the number of cells on the shortest clear path, or \`-1\` if there is none.`,
    constraints: ['1 <= grid.length <= 100', 'grid[0].length == grid.length', '0 <= grid[i][j] <= 1'],
    hints: [
      'All moves cost the same, so breadth-first search finds the shortest path.',
      'If the start or the end cell is blocked, return −1 straight away.',
      'BFS from (0, 0) with distance 1, exploring the 8 neighbours and marking cells visited when you enqueue them. The distance when you reach (n − 1, n − 1) is the answer.',
    ],
  },
  'surrounded-regions': {
    statement: `\`board\` contains \`'X'\` and \`'O'\`. A region is a group of \`'O'\`s connected up, down, left or right. A region is captured if none of its cells is on the edge of the board; captured regions are flipped to \`'X'\`.

Change the board in place. The judge prints the board after your call.`,
    constraints: ['1 <= board.length <= 200', '1 <= board[0].length <= 200', '`board[i][j]` is "X" or "O"'],
    hints: [
      'It is easier to find the regions that survive: those connected to the border.',
      'From every "O" on the border, DFS or BFS and mark its whole region with a temporary symbol such as "#".',
      'Then scan the board: every remaining "O" is captured and becomes "X", and every "#" goes back to "O".',
    ],
  },
  'pacific-atlantic-water-flow': {
    statement: `\`heights[r][c]\` is the height of a cell on an island. The Pacific Ocean touches the top and left edges, and the Atlantic touches the bottom and right edges. Rain flows from a cell to a neighbour (up, down, left or right) whose height is less than or equal to its own, and from edge cells into the ocean next to them.

Return every cell \`[r, c]\` from which water can reach both oceans, in any order.`,
    constraints: ['1 <= heights.length <= 200', '1 <= heights[0].length <= 200', '0 <= heights[i][j] <= 1e5'],
    hints: [
      'Simulating water from every cell is slow. Reverse the direction: which cells can each ocean "climb up" to?',
      'Search from all Pacific edge cells, moving only to neighbours that are at least as high, and mark them. Do the same for the Atlantic edges.',
      'The answer is the cells marked by both searches.',
    ],
  },
  'word-ladder': {
    statement: `A transformation sequence from \`beginWord\` to \`endWord\` changes one letter at a time, and every word after \`beginWord\` must be in \`wordList\`. \`beginWord\` itself does not need to be in the list.

Return the number of words in the shortest such sequence, counting both ends, or \`0\` if none exists.`,
    constraints: ['1 <= beginWord.length <= 10', 'endWord.length == beginWord.length', '1 <= wordList.length <= 5000', 'All words have the same length and only lowercase letters', 'beginWord != endWord; wordList has no duplicates'],
    hints: [
      'Words are nodes and a one-letter change is an edge. The shortest sequence is a shortest path, so use BFS.',
      'To find neighbours, change each position to each of the 26 letters and look the result up in a HashSet of the word list.',
      'Remove words from the set when you enqueue them so they are not visited twice. BFS from both ends at once makes it faster still.',
    ],
  },
};
