export default {
  'flood-fill': {
    explain: 'Starting at the centre (value 1), every 1 connected to it up, down, left or right becomes 2. The 1 in the bottom-right corner touches only 0s, so it stays 1: `[[2,2,2],[2,2,0],[2,0,1]]`.',
  },
  'number-of-islands': {
    explain: 'All the land cells in this grid connect into one shape through horizontal and vertical neighbours, so there is exactly 1 island.',
    more: 'Diagonal neighbours don\'t connect land. Each search from an unvisited land cell, marking everything it reaches, finds one whole island.',
  },
  'max-area-of-island': {
    explain: 'The largest island is on the right of the grid, around rows 3–5 and columns 8–10, and has 6 cells. The 1s are only connected horizontally or vertically, so nothing bigger exists: the answer is 6.',
  },
  'number-of-provinces': {
    explain: 'Cities 0 and 1 are connected to each other, and city 2 is connected to no one. That makes 2 provinces.',
  },
  'clone-graph': {
    explain: 'The graph is a square: 1–2, 2–3, 3–4 and 4–1. The copy has new nodes connected the same way, so its adjacency list is the same, `[[2,4],[1,3],[2,4],[1,3]]`, but none of its nodes is an original.',
  },
  'rotting-oranges': {
    explain: 'The rot spreads from the top-left corner one step per minute: after 1 minute to its neighbours, and so on, reaching the bottom-right orange after 4 minutes. So the answer is 4.',
  },
  '01-matrix': {
    explain: 'Every 0 is at distance 0, and the only 1 (in the centre) has a 0 right next to it, so its distance is 1. The result is `[[0,0,0],[0,1,0],[0,0,0]]`.',
  },
  'shortest-path-in-binary-matrix': {
    explain: 'Moving diagonally from the top-left 0 to the bottom-right 0 is allowed. That path visits 2 cells, so the answer is 2.',
  },
  'surrounded-regions': {
    explain: 'The three Os in the middle are enclosed by Xs, so they flip to X. The O on the bottom edge touches the border, so it and anything connected to it stay O: `[["X","X","X","X"],["X","X","X","X"],["X","X","X","X"],["X","O","X","X"]]`.',
  },
  'pacific-atlantic-water-flow': {
    explain: 'Water flows to neighbours of equal or lower height. From each listed cell it can reach both the top/left edges (Pacific) and the bottom/right edges (Atlantic): `[[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]`.',
  },
  'word-ladder': {
    explain: '"hit" → "hot" → "dot" → "dog" → "cog" changes one letter at a time and every word is in the list. The sequence has 5 words, the shortest possible.',
  },
};
