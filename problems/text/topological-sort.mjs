export default {
  'course-schedule': {
    statement: `There are \`numCourses\` courses, numbered \`0\` to \`numCourses − 1\`. Each pair \`[a, b]\` in \`prerequisites\` means you must take course \`b\` before course \`a\`.

Return \`true\` if it is possible to finish every course.`,
    constraints: ['1 <= numCourses <= 2000', '0 <= prerequisites.length <= 5000', '0 <= prerequisites[i][j] < numCourses', 'All pairs are distinct'],
    hints: [
      'Courses are nodes and prerequisites are directed edges. When is finishing impossible?',
      'It is impossible exactly when the graph has a cycle. Kahn\'s algorithm: repeatedly take a course with no remaining prerequisites (in-degree 0) and remove its outgoing edges.',
      'Count the courses you manage to take. If the count equals numCourses there is no cycle. (A DFS with three colours detects the cycle too.)',
    ],
  },
  'course-schedule-ii': {
    statement: `Same setup as "Course Schedule": \`[a, b]\` means course \`b\` must come before course \`a\`. Return an order in which you can take all \`numCourses\` courses.

If several orders work, return any of them. If it is impossible, return an empty array.`,
    constraints: ['1 <= numCourses <= 2000', '0 <= prerequisites.length <= 5000', '0 <= prerequisites[i][j] < numCourses', 'All pairs are distinct'],
    hints: [
      'An order that respects every prerequisite is a topological order of the graph.',
      'Run Kahn\'s algorithm and append each course to the answer when you take it from the queue.',
      'If the answer ends up shorter than numCourses, the graph has a cycle: return an empty array.',
    ],
  },
  'course-schedule-iv': {
    statement: `Courses are numbered \`0\` to \`numCourses − 1\`. Each pair \`[a, b]\` in \`prerequisites\` means course \`a\` must be taken before course \`b\` (note the direction is the opposite of "Course Schedule"). Prerequisites can be indirect: if \`a\` comes before \`b\` and \`b\` before \`c\`, then \`a\` is a prerequisite of \`c\`.

For each query \`[u, v]\`, answer whether \`u\` is a prerequisite of \`v\`. The prerequisite graph has no cycles.`,
    constraints: ['2 <= numCourses <= 100', '0 <= prerequisites[i][j] < numCourses', '1 <= queries.length <= 1e4', '0 <= queries[i][j] < numCourses'],
    hints: [
      'There are many queries but at most 100 courses, so precompute every reachability answer once.',
      'Build a boolean reach[u][v] table. Either run a DFS/BFS from every course, or use Floyd–Warshall style: reach[i][j] |= reach[i][k] && reach[k][j].',
      'Then every query is a single table lookup.',
    ],
  },
  'minimum-height-trees': {
    statement: `An undirected tree has \`n\` nodes labelled \`0\` to \`n − 1\` and the given \`edges\`. Choosing any node as the root gives a rooted tree with some height (the number of edges on its longest root-to-leaf path).

Return every node that, chosen as the root, gives the minimum possible height. The order does not matter.`,
    constraints: ['1 <= n <= 2e4', 'edges.length == n − 1', '0 <= edges[i][j] < n', 'The edges form a tree'],
    hints: [
      'Running a BFS from every node to measure heights is O(n²).',
      'The best roots are in the "middle" of the longest path. Peel the tree from the outside in: remove all current leaves, then the new leaves, and so on.',
      'Track degrees and remove leaves level by level, like a topological sort. When at most two nodes remain, they are the answer.',
    ],
  },
  'find-eventual-safe-states': {
    statement: `\`graph\` is a directed graph: \`graph[i]\` lists the nodes that node \`i\` has edges to. A terminal node has no outgoing edges. A node is safe if every path starting from it leads to a terminal node (so it can never get stuck in a cycle).

Return all safe nodes in ascending order.`,
    constraints: ['1 <= graph.length <= 1e4', '0 <= graph[i][j] < graph.length', '`graph[i]` is sorted and has no duplicates', 'There are at most 4 × 10⁴ edges'],
    hints: [
      'A node is unsafe exactly when it can reach a cycle.',
      'Reverse every edge. Terminal nodes are safe; a node becomes safe once all its original successors are safe. That is Kahn\'s algorithm on the reversed graph, starting from the terminal nodes.',
      'Alternatively, DFS with three colours (unvisited, in progress, safe): a node that reaches an "in progress" node is on or leads to a cycle.',
    ],
  },
  'find-all-possible-recipes-from-given-supplies': {
    statement: `You have the recipes in \`recipes\`; recipe \`i\` needs every item in \`ingredients[i]\`. An ingredient can be one of your \`supplies\` (of which you have an unlimited amount) or another recipe that you must make first.

Return every recipe you can make, in any order.`,
    constraints: ['1 <= recipes.length <= 100', 'ingredients.length == recipes.length', '1 <= ingredients[i].length <= 100', '1 <= supplies.length <= 100', 'All names are lowercase, 1 to 10 characters, and recipe names do not repeat'],
    hints: [
      'A recipe can be made once all of its ingredients are available. Recipes that depend on each other in a loop can never be made.',
      'Topological sort: the in-degree of a recipe is the number of its ingredients. Start a queue with all supplies.',
      'When an item becomes available, decrement every recipe that uses it. A recipe reaching 0 is made, and joins the queue as a new available item.',
    ],
  },
  'sort-items-by-groups-respecting-dependencies': {
    statement: `There are \`n\` items. \`group[i]\` is the group of item \`i\` (\`0\` to \`m − 1\`), or \`-1\` if it belongs to no group. \`beforeItems[i]\` lists the items that must come before item \`i\`.

Return an ordering of all items such that items of the same group are next to each other, and every item comes after all of its \`beforeItems\`. If several orderings work, return any. If none exists, return an empty array.`,
    constraints: ['1 <= m <= n', 'n <= 3e4', 'group.length == n', '-1 <= group[i] < m', '0 <= beforeItems[i][j] < n', 'beforeItems[i] has no duplicates and does not contain i'],
    hints: [
      'There are two layers of ordering: groups relative to each other, and items inside each group.',
      'Give every ungrouped item its own new group. Then build two graphs: one between groups (from dependencies that cross groups) and one between items.',
      'Topologically sort both graphs. If either has a cycle, return []. Then output the groups in their sorted order, and within each group its items in their sorted order.',
    ],
  },
  'alien-dictionary': {
    statement: `An alien language uses lowercase English letters, but in an order you don't know. You are given \`words\`, a list of words in this language that is claimed to be **sorted** by its dictionary rules.

Return a string containing every distinct letter that appears in \`words\`, ordered from first to last in the alien alphabet. If several orders are consistent with the list, return any of them. If the list cannot be sorted under any order, return \`""\`.

As in English, two words are compared at their first differing letter, and a word comes before any longer word it is a prefix of. So \`["abc","ab"]\` is impossible.`,
    constraints: ['1 <= words.length <= 100', '1 <= words[i].length <= 100', '`words[i]` has only lowercase English letters'],
    hints: [
      'Only neighbouring words carry information. Their first differing letters give one rule: the letter in the first word comes before the letter in the second.',
      'Collect those rules as edges of a directed graph whose nodes are the letters that appear. A valid alphabet is a topological order of that graph.',
      'Run Kahn\'s algorithm (or DFS with colours). If not every letter gets output, there is a cycle: return "". Check the prefix case ("abc" before "ab") separately: it is invalid even though it gives no edge.',
    ],
  },
  'build-a-matrix-with-conditions': {
    statement: `Build a \`k × k\` matrix that contains each number from \`1\` to \`k\` **exactly once**, with \`0\` in every other cell, such that:

- for each \`rowConditions[i] = [above, below]\`, the row of \`above\` is strictly above the row of \`below\`;
- for each \`colConditions[i] = [left, right]\`, the column of \`left\` is strictly to the left of the column of \`right\`.

Return any matrix that satisfies all the conditions, or an empty matrix if none exists.`,
    constraints: ['2 <= k <= 400', '1 <= rowConditions.length, colConditions.length <= 1e4', '1 <= rowConditions[i][j], colConditions[i][j] <= k', '`above != below` and `left != right`'],
    hints: [
      'Rows and columns don\'t interact: the row conditions only fix the order of rows, the column conditions only the order of columns.',
      'Each set of conditions is a directed graph on 1..k. A topological order gives a row (or column) index to every number; a cycle means no answer.',
      'Put number v at (rowIndex[v], colIndex[v]). Since every number gets a unique row and a unique column, no two numbers collide.',
    ],
  },
};
