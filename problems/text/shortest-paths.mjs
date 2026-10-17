export default {
  'network-delay-time': {
    statement: `A network has \`n\` nodes labelled \`1\` to \`n\`. Each \`times[i] = [u, v, w]\` is a directed edge: a signal takes \`w\` time to travel from \`u\` to \`v\`.

A signal is sent from node \`k\`. Return how long it takes until every node has received it, or \`-1\` if some node never does.`,
    constraints: ['1 <= n <= 100', '1 <= k <= n', '1 <= times.length <= 6000', 'Each edge is [u, v, w] with 1 ≤ u, v ≤ n, u ≠ v and 0 ≤ w ≤ 100', 'No repeated (u, v) pairs'],
    hints: [
      'Each node receives the signal at its shortest-path distance from k. The answer is the largest of those distances.',
      'All weights are non-negative, so use Dijkstra\'s algorithm with a priority queue of (distance, node).',
      'Skip queue entries that are stale (their distance is larger than the best already known). If any node stays unreachable, return −1.',
    ],
  },
  'path-with-minimum-effort': {
    statement: `\`heights\` is a grid of cell heights. You start at the top-left cell and want to reach the bottom-right cell, moving up, down, left or right. The effort of a route is the largest absolute height difference between two consecutive cells on it.

Return the minimum effort needed.`,
    constraints: ['1 <= heights.length <= 100', '1 <= heights[0].length <= 100', '1 <= heights[i][j] <= 1e6'],
    hints: [
      'A route\'s cost is a maximum, not a sum, but Dijkstra still works: the cost of a route never decreases as it gets longer.',
      'Run Dijkstra where the cost to reach a neighbour is max(current effort, |height difference|).',
      'Binary search on the effort, checking reachability with BFS, is another way; so is union-find adding edges in order of difference.',
    ],
  },
  'cheapest-flights-within-k-stops': {
    statement: `There are \`n\` cities. Each \`flights[i] = [from, to, price]\` is a one-way flight. Return the cheapest price to travel from \`src\` to \`dst\` with at most \`k\` stops in between (that is, at most \`k + 1\` flights), or \`-1\` if there is no such route.`,
    constraints: ['1 <= n <= 100', '0 <= flights.length <= 4950', 'Each flight is [from, to, price] with 0 ≤ from, to < n, from ≠ to and 1 ≤ price ≤ 10⁴', '0 <= src, dst < n', '0 <= k <= 100', 'src != dst'],
    hints: [
      'Plain Dijkstra can discard a route that is more expensive but uses fewer flights, and that route might be the only one within k stops.',
      'Bellman–Ford limited to k + 1 rounds fits exactly: each round allows one more flight.',
      'Relax every flight in each round using a copy of the previous round\'s prices, so one round never chains two flights together.',
    ],
  },
  'path-with-maximum-probability': {
    statement: `An undirected graph has \`n\` nodes. \`edges[i] = [a, b]\` is an edge whose traversal succeeds with probability \`succProb[i]\`. The success probability of a path is the product of its edges' probabilities.

Return the highest success probability of a path from \`start_node\` to \`end_node\`, or \`0\` if there is no path. Answers within \`10^-5\` are accepted.`,
    constraints: ['2 <= n <= 1e4', '0 <= start_node, end_node < n', 'start_node != end_node', '0 <= edges.length <= 2e4', 'succProb.length == edges.length', '0 <= succProb[i] <= 1'],
    hints: [
      'Multiplying by probabilities ≤ 1 never increases the value, much like adding non-negative weights never decreases a distance.',
      'Run Dijkstra with a max-heap: always expand the node with the highest probability found so far.',
      'The probability of reaching a neighbour is prob[node] × p(edge). Update it when that is higher than what is known.',
    ],
  },
  'minimum-obstacle-removal-to-reach-corner': {
    statement: `Each cell of \`grid\` is \`0\` (empty) or \`1\` (an obstacle that you may remove). You move up, down, left or right through empty cells.

Return the minimum number of obstacles you must remove to walk from the top-left cell to the bottom-right cell. Both corners are empty.`,
    constraints: ['1 <= grid.length <= 1e5', '1 <= grid[0].length <= 1e5', 'grid.length × grid[0].length ≤ 10⁵', '0 <= grid[i][j] <= 1', 'The two corners are 0'],
    hints: [
      'Entering an empty cell costs 0 and entering an obstacle costs 1. You want the cheapest path.',
      'With only weights 0 and 1, use 0-1 BFS: a deque where 0-cost moves go to the front and 1-cost moves go to the back.',
      'Each cell\'s cost is final when it is popped. Dijkstra works too, just with an extra log factor.',
    ],
  },
  'minimum-cost-to-make-at-least-one-valid-path-in-a-grid': {
    statement: `Each cell of \`grid\` has a sign telling you where to go next: \`1\` right, \`2\` left, \`3\` down, \`4\` up. Signs may point outside the grid.

You can change the sign of any cell for a cost of 1 (each cell at most once). Return the minimum total cost so that following the signs from the top-left cell reaches the bottom-right cell.`,
    constraints: ['1 <= grid.length <= 100', '1 <= grid[0].length <= 100', '1 <= grid[i][j] <= 4'],
    hints: [
      'Moving in the direction of the sign is free; moving in any other direction costs 1 (you change the sign).',
      'That is a graph with edge weights 0 and 1, so 0-1 BFS with a deque finds the cheapest path.',
      'Push free moves to the front of the deque and paid moves to the back; the cost when you reach the bottom-right cell is the answer.',
    ],
  },
  'swim-in-rising-water': {
    statement: `\`grid\` is \`n × n\` and \`grid[i][j]\` is the height of that cell; all heights are distinct. At time \`t\` the water level is \`t\`, and you can swim between two adjacent cells (up, down, left, right) if both heights are at most \`t\`. Swimming takes no time.

Return the least time at which you can get from the top-left cell to the bottom-right cell.`,
    constraints: ['1 <= grid.length <= 50', 'grid[0].length == grid.length', '0 ≤ grid[i][j] < n², and all values are distinct'],
    hints: [
      'The time needed for a route is the highest cell on it. Minimise that maximum.',
      'Dijkstra with cost max(current, height of next cell) works, always expanding the lowest such cost.',
      'Alternatively, binary-search t and check reachability with BFS, or add cells in order of height with union-find until the corners connect.',
    ],
  },
  'find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance': {
    statement: `There are \`n\` cities. Each \`edges[i] = [from, to, weight]\` is a two-way road of the given length. For each city, count how many other cities it can reach by a path of total length at most \`distanceThreshold\`.

Return the city with the smallest count. If several cities tie, return the one with the largest number.`,
    constraints: ['2 <= n <= 100', '1 <= edges.length <= 4950', 'Each edge is [from, to, weight] with 0 ≤ from < to < n and 1 ≤ weight ≤ 10⁴', '1 <= distanceThreshold <= 1e4'],
    hints: [
      'You need shortest distances between every pair of cities, and n is at most 100.',
      'Floyd–Warshall computes all of them in O(n³): for each k, i and j, dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]).',
      'Count the reachable cities per row and scan from city 0 upward, using ≤ when comparing counts so later cities win ties. Running Dijkstra from every city also works.',
    ],
  },
};
