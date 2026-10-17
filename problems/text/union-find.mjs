export default {
  'find-if-path-exists-in-graph': {
    statement: `An undirected graph has \`n\` nodes labelled \`0\` to \`n − 1\`; each \`edges[i] = [u, v]\` connects \`u\` and \`v\`. Return \`true\` if there is a path from \`source\` to \`destination\`.

A node always has a path to itself.`,
    constraints: ['1 <= n <= 2e5', '0 <= edges.length <= 2e5', '0 <= edges[i][j] < n', '0 <= source, destination < n', 'No self-loops or repeated edges'],
    hints: [
      'This is a reachability question: do source and destination belong to the same connected component?',
      'BFS or DFS from source over an adjacency list works in O(n + edges).',
      'Union-find also fits: union every edge, then check find(source) == find(destination).',
    ],
  },
  'redundant-connection': {
    statement: `A tree with \`n\` nodes labelled \`1\` to \`n\` had one extra edge added, so \`edges\` (of length \`n\`) now contains exactly one cycle.

Return an edge that can be removed so the remaining edges form a tree. If several edges qualify, return the one that appears last in \`edges\`.`,
    constraints: ['3 <= edges.length <= 1000', '1 <= edges[i][j] <= edges.length', 'No repeated edges; the graph is connected'],
    hints: [
      'Add the edges one by one. Which edge is the first to close a cycle?',
      'With union-find, an edge [u, v] closes a cycle exactly when u and v already have the same root.',
      'Because you process edges in input order, the first such edge is also the last one in the input among the cycle\'s edges. Return it.',
    ],
  },
  'satisfiability-of-equality-equations': {
    statement: `Each string in \`equations\` has the form \`"a==b"\` or \`"a!=b"\`, where \`a\` and \`b\` are lowercase letters standing for integer variables.

Return \`true\` if you can assign integers to the variables so that every equation holds.`,
    constraints: ['1 <= equations.length <= 500', 'Each equation is four characters: a letter, "==" or "!=", and a letter'],
    hints: [
      'Equalities group variables together; inequalities only need checking afterwards.',
      'First pass: union the two variables of every "==" equation (26 letters, so a small union-find).',
      'Second pass: for every "!=" equation, if both variables have the same root, the equations contradict each other. Note "a!=a" is always false.',
    ],
  },
  'smallest-string-with-swaps': {
    statement: `You may swap the characters at the two indices of any pair in \`pairs\`, as many times as you like and in any order.

Return the lexicographically smallest string \`s\` can become.`,
    constraints: ['1 <= s.length <= 1e5', '0 <= pairs.length <= 1e5', '0 <= pairs[i][j] < s.length', '`s` has only lowercase English letters'],
    hints: [
      'If index a can swap with b, and b with c, then repeated swaps can arrange the characters at a, b and c in any order.',
      'Union the indices of every pair; each connected group of indices can be rearranged freely.',
      'For each group, sort its characters and place them into its indices in increasing order of index.',
    ],
  },
  'accounts-merge': {
    statement: `Each account is a list whose first element is a name and whose other elements are email addresses. Two accounts belong to the same person if they share at least one email. A person always has the same name, but different people can share a name.

Merge the accounts and return them as \`[name, emails…]\` with the emails sorted. The accounts themselves may be in any order.`,
    constraints: ['1 <= accounts.length <= 1000', '2 <= accounts[i].length <= 10', 'Names and emails are 1 to 30 characters'],
    hints: [
      'Emails are the things that link accounts. Think of each email as a node.',
      'Union all emails within one account (for example, each with the account\'s first email), and remember the name for each email.',
      'Group emails by their root, sort each group, and put the name in front.',
    ],
  },
  'min-cost-to-connect-all-points': {
    statement: `\`points[i] = [x, y]\` is a point on a plane. Connecting two points costs their Manhattan distance \`|x1 − x2| + |y1 − y2|\`.

Return the minimum total cost to connect all points so that there is exactly one path between any two of them (a minimum spanning tree).`,
    constraints: ['1 <= points.length <= 1000', '-1e6 <= points[i][j] <= 1e6', 'All points are distinct'],
    hints: [
      'Every pair of points is a possible edge, so the graph is complete: about n²/2 edges.',
      'Kruskal: sort all edges by cost and add each one that joins two different components (union-find), until you have n − 1 edges.',
      'Prim\'s algorithm with an O(n²) array scan, no heap needed, is ideal for a dense graph like this.',
    ],
  },
  'regions-cut-by-slashes': {
    statement: `\`grid\` is an \`n × n\` grid of 1 × 1 squares. Each square holds \`'/'\`, \`'\\'\` or a space, and the slashes cut the square diagonally.

Return the number of regions the grid is divided into. (In the tests a backslash is escaped, so \`"\\\\/"\` is a backslash followed by a slash.)`,
    constraints: ['1 <= grid.length <= 30', 'Each string in grid has length n', 'Each character is "/", "\\" or a space'],
    hints: [
      'Split every square into 4 triangles (top, right, bottom, left) and count connected triangles.',
      'Inside a square: a space joins all four; "/" joins top–left and right–bottom; "\\" joins top–right and left–bottom.',
      'Between squares, join a square\'s right triangle with the left triangle of the square to its right, and its bottom triangle with the top of the square below. Count the components with union-find.',
    ],
  },
  'largest-component-size-by-common-factor': {
    statement: `\`nums\` holds distinct positive integers. Treat each value as a node, and connect two values with an edge if they share a common factor greater than 1.

Return the number of nodes in the largest connected component.`,
    constraints: ['1 <= nums.length <= 2e4', '1 <= nums[i] <= 1e5', 'The values are distinct'],
    hints: [
      'Checking every pair for a common factor is O(n²). Connect values through their factors instead.',
      'For each value, find its prime factors (trial division up to √v) and union the value with each of them, in a union-find over 1 … max.',
      'Two values sharing a prime end up in the same set. Count how many values have each root and return the largest count.',
    ],
  },
};
