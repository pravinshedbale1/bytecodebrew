export default {
  'is-graph-bipartite': {
    statement: `You are given an undirected graph with \`n\` nodes numbered \`0\` to \`n − 1\` as an adjacency list: \`graph[u]\` holds every node that shares an edge with \`u\`. The graph has no self-loops or repeated edges, and edges are listed in both directions (if \`v\` is in \`graph[u]\`, then \`u\` is in \`graph[v]\`). The graph may be made of several disconnected parts.

A graph is **bipartite** if its nodes can be split into two groups A and B such that every edge connects a node in A with a node in B.

Return \`true\` if the graph is bipartite, otherwise \`false\`.`,
    constraints: ['n == graph.length', '1 <= n <= 100', '0 <= graph[u].length < n', '0 <= graph[u][i] <= n − 1', 'graph[u] does not contain u, and its values are distinct', 'If graph[u] contains v, then graph[v] contains u'],
    hints: [
      'Try to colour every node with one of two colours so that neighbours always differ. When does that become impossible?',
      'Start at any uncoloured node, give it colour 1, and BFS or DFS: each neighbour gets the opposite colour. If you reach a neighbour that already has the same colour as the current node, the graph is not bipartite.',
      'The graph can be disconnected, so start a new search from every node that is still uncoloured. A graph is bipartite exactly when it has no cycle of odd length.',
    ],
  },
  'possible-bipartition': {
    statement: `There are \`n\` people, numbered \`1\` to \`n\`, to be split into two groups (a group may be empty). Some pairs of people refuse to be in the same group: each \`dislikes[i] = [a, b]\` means person \`a\` and person \`b\` must end up in different groups.

Return \`true\` if it is possible to split everyone into two groups so that no dislike is violated.`,
    constraints: ['1 <= n <= 2000', '0 <= dislikes.length <= 1e4', 'dislikes[i].length == 2', '1 <= a < b <= n', 'All pairs in dislikes are distinct'],
    hints: [
      'Draw a graph: people are nodes and each dislike is an edge. Splitting into two groups with every edge crossing between them is exactly a two-colouring.',
      'Build an adjacency list and run BFS or DFS from every uncoloured person, giving neighbours the opposite colour. A conflict means it is impossible.',
      'Union-Find also works: everyone that one person dislikes must share a group, so union them together, and fail if a person ever ends up in the same set as someone they dislike.',
    ],
  },
  'critical-connections-in-a-network': {
    statement: `There are \`n\` servers numbered \`0\` to \`n − 1\`, joined by undirected \`connections\`, where \`connections[i] = [a, b]\` links servers \`a\` and \`b\`. Every server can reach every other server, directly or through others.

A **critical connection** is one whose removal would leave some server unable to reach some other server.

Return all critical connections, in any order. Each connection may be written as \`[a, b]\` or \`[b, a]\`.`,
    constraints: ['2 <= n <= 1e5', 'n − 1 <= connections.length <= 1e5', '0 <= a, b <= n − 1', 'a != b', 'There are no repeated connections', 'The network is connected'],
    hints: [
      'Removing each edge and checking connectivity with BFS works, but that is O(E · (V + E)), far too slow for 10⁵ edges. You need to find all such edges in one traversal.',
      'An edge is critical exactly when it is not on any cycle. During a DFS, give each node a discovery time. Track low[u]: the earliest discovery time reachable from u\'s subtree using at most one back edge.',
      'For a tree edge u → v, if low[v] > disc[u], nothing under v can reach u or above without that edge, so it is a bridge. Skip the edge back to the parent when updating low.',
    ],
  },
  'valid-arrangement-of-pairs': {
    statement: `You are given a 2D array \`pairs\` where \`pairs[i] = [start, end]\`. An arrangement of the pairs is **valid** if, for every index \`i\` from \`1\` to \`pairs.length − 1\`, the end of the previous pair equals the start of the current one: \`arrangement[i − 1][1] == arrangement[i][0]\`.

Return any valid arrangement that uses every pair exactly once. The input is guaranteed to have one.`,
    constraints: ['1 <= pairs.length <= 1e5', 'pairs[i].length == 2', '0 <= start, end <= 1e9', 'start != end', 'No two pairs are the same', 'A valid arrangement exists'],
    hints: [
      'Treat each number as a node and each pair as a directed edge from start to end. A valid arrangement is a path that uses every edge exactly once: an Euler path.',
      'An Euler path starts at the node whose out-degree is one more than its in-degree, if such a node exists; otherwise the path is a cycle and can start anywhere with an outgoing edge.',
      'Hierholzer\'s algorithm: from the start, keep following unused edges; when a node has none left, add it to the answer and back up. The nodes come out in reverse order. Use an explicit stack, since the path can be 10⁵ edges long.',
    ],
  },
};
