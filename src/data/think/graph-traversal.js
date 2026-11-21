/** Practice thinking walkthroughs: graph-traversal (format: src/data/think/index.js). */
export default {
  'rotting-oranges': {
    aha: "All rotten oranges spread at the same time, one step per minute. Put every rotten orange in a queue at minute 0 and run one breadth-first search from all of them together: minute t is level t, and any fresh orange left at the end is unreachable.",
    asks: { observe: "In [[2, 1, 1], [1, 1, 0], [0, 1, 1]], which oranges rot at minute 1? Which one rots last?", pattern: "Spreading one step per minute from several starting points at once: which search visits cells in order of distance?" },
    read: [
      { phrase: 'Every minute', says: 'Time moves in rounds, and the rot spreads one step per round: levels of a breadth-first search.' },
      { phrase: 'next to a rotten one (up, down, left or right)', says: 'A grid where each cell has 4 neighbours: a graph.' },
      { phrase: 'the number of minutes until no fresh orange remains', says: 'The number of BFS levels needed to reach the last fresh orange.' },
      { phrase: '`-1` if some orange can never rot', says: 'Some fresh orange may be unreachable: count what is left at the end.' },
    ],
    budget: { from: 'grid up to 10 × 10', n: 100, aim: 'O(rows × cols)', note: 'Tiny limits: even minute-by-minute rescans would pass, but BFS is the clean, expected answer.' },
    observe: [
      {
        title: 'All rotten oranges spread at the same time',
        text: 'Every rotten orange infects its neighbours in the same minute. So the search starts from all of them at once: put every rotten orange in the queue at minute 0.',
        sketch: { kind: 'grid', grid: [[2, 1, 1], [1, 1, 0], [0, 1, 1]], marks: { '0,0': 'rotten', '0,1': 'fresh', '0,2': 'fresh', '1,0': 'fresh', '1,1': 'fresh', '2,1': 'fresh', '2,2': 'fresh' }, labels: { '0,0': '0' }, caption: 'minute 0: the starting rot' },
      },
      {
        title: 'Minute t is BFS level t',
        text: 'Cells rot in rings of distance from the starting rot. The answer is the distance of the last ring.',
        sketch: { kind: 'grid', grid: [[2, 1, 1], [1, 1, 0], [0, 1, 1]], marks: { '0,0': 'rotten', '0,1': 'ring', '1,0': 'ring', '0,2': 'ring', '1,1': 'ring', '2,1': 'ring', '2,2': 'ring' }, labels: { '0,0': '0', '0,1': '1', '1,0': '1', '0,2': '2', '1,1': '2', '2,1': '3', '2,2': '4' }, caption: 'the last orange rots at minute 4' },
      },
      {
        title: 'Unreachable fresh oranges mean −1',
        text: 'Count the fresh oranges first and decrease the count as they rot. If any remain when the queue empties, they were cut off.',
        sketch: { kind: 'grid', grid: [[2, 1, 1], [0, 1, 1], [1, 0, 1]], marks: { '0,0': 'rotten', '2,0': 'fresh' }, labels: { '2,0': '?' }, caption: 'the bottom-left orange has no rotten path to it' },
      },
    ],
    brute: { idea: 'Simulate: each minute, scan the whole grid and rot every fresh orange next to a rotten one; stop when nothing changes.', cost: 'O((rows · cols)²)', waste: 'Each minute rescans every cell, though only the newest rotten oranges can spread.' },
    pattern: {
      pick: 'graph-traversal',
      why: 'Spreading by one step per round from several sources is multi-source BFS: the queue holds the newest rot, and each level is one minute.',
      not: [
        { id: 'shortest-paths', why: 'Every step costs the same (one minute), so plain BFS already gives shortest times; Dijkstra is for unequal weights.' },
        { id: 'union-find', why: 'Union-find tells which cells are connected, but not how long the spread takes.' },
        { id: 'dp-grid', why: 'Grid DP moves in fixed directions (say right and down); rot spreads in all four.' },
      ],
    },
    watch: { viz: 'GridBfsViz', inputs: [{ label: 'the example grid', input: { mode: 'oranges', grid: [[2, 1, 1], [1, 1, 0], [0, 1, 1]] } }, { label: 'an orange out of reach', input: { mode: 'oranges', grid: [[2, 1, 1], [0, 1, 1], [1, 0, 1]] } }] },
    edges: ["No fresh oranges: [[0, 2]] → 0.", "Fresh but nothing rotten: [[1]] → −1.", "An orange cut off: [[2, 1, 1], [0, 1, 1], [1, 0, 1]] → −1."],
  },
};
