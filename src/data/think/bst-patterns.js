/** Practice thinking walkthroughs: bst-patterns (format: src/data/think/index.js). */

export default {
  'search-in-a-binary-search-tree': {
    free: true,
    aha: 'In a BST every node splits the remaining values: smaller ones to the left, bigger ones to the right. So one comparison tells you which side val must be on, and the other side can be ignored. Follow that single path: binary search on a tree.',
    asks: {
      read: 'Which words describe the ordering, and what do you return when val is missing?',
      budget: 'Up to 5000 nodes. Do you have to look at all of them?',
      observe: 'Looking for 2 in [4, 2, 7, 1, 3]: after comparing with 4, which nodes can you rule out?',
      brute: 'A plain DFS finds it. What does it ignore?',
      pattern: 'Where else does one comparison throw away half of what is left?',
      watch: 'Watch one path, one comparison per node.',
    },
    read: [
      { phrase: 'for every node, smaller values are in its left subtree and larger values in its right subtree', says: 'Comparing with any node tells you which subtree can hold val: the other is ruled out entirely.' },
      { phrase: 'return the subtree rooted at it', says: 'Return the node itself; its children come along.' },
      { phrase: 'If no node has that value, return `null`', says: 'Falling off the tree means "not there".' },
    ],
    budget: { from: 'number of nodes ≤ 5000', rows: [['check every node', 'O(n)', 'ok', 'fits, ignores the order'], ['follow one path', 'O(h)', 'ok', 'log n if balanced, n if a chain']], aim: 'O(h)', note: 'Both fit; the point is using the ordering. h is the height: about log₂ n for a balanced tree, n for a chain.' },
    observe: [
      {
        title: 'One comparison rules out a whole side',
        text: 'Looking for 2 in [4, 2, 7, 1, 3]: 2 < 4, so 2 can only be left of 4. 7, and anything under it, is never looked at.',
        sketch: { kind: 'array', rows: [{ label: 'at 4', items: ['left: 2, 1, 3', 'right: 7'], marks: { 0: 'hit', 1: 'dim' } }] },
      },
      {
        title: 'A path, not a search of the tree',
        text: 'Keep comparing: at 2 the values match, so return that node. Two comparisons for five nodes; on a balanced tree of 5000, about 13.',
        sketch: { kind: 'array', rows: [{ label: 'path', items: ['4: go left', '2: found'], marks: { 1: 'hit' } }] },
      },
      {
        title: 'Falling off means missing',
        text: 'Looking for 5: 5 > 4 go right; 5 < 7 go left; 7 has no left child. The value would have to be there, and it isn\'t: return null.',
        sketch: { kind: 'array', rows: [{ label: 'path', items: ['4: right', '7: left', 'null'], marks: { 2: 'bad' } }] },
      },
    ],
    brute: { idea: 'DFS through every node until one has value val.', cost: 'O(n)', waste: 'It ignores the ordering, which says exactly which side val is on.' },
    pattern: {
      pick: 'bst-patterns',
      why: 'BST descent: while the node isn\'t val, go left if val is smaller, right if bigger. O(h) time, O(1) space with a loop.',
      not: [
        { id: 'binary-search', why: 'The same idea on an array; here the halves are subtrees and you move by pointers.' },
        { id: 'tree-dfs', why: 'A full traversal works on any tree; a BST lets you skip everything off the path.' },
      ],
    },
    watch: { viz: 'BstViz', inputs: [{ label: '[4, 2, 7, 1, 3], val 2', input: { mode: 'search', tree: [4, 2, 7, 1, 3], x: 2 } }, { label: '[4, 2, 7, 1, 3], val 5', input: { mode: 'search', tree: [4, 2, 7, 1, 3], x: 5 } }] },
    edges: ['val at the root: [4, 2, 7], val 4 → [4, 2, 7].', 'Missing: [4, 2, 7, 1, 3], val 5 → [].', 'A chain: [1, null, 2, null, 3], val 3 → [3] after 3 steps.'],
  },

  'convert-sorted-array-to-binary-search-tree': {
    aha: 'Any value can be a BST\'s root: smaller values go left, bigger ones right, and in a sorted array they already are on those sides. For balance, choose the root with as many values on each side as possible: the middle. Then build each half the same way.',
    asks: {
      read: 'What does height-balanced require, and how many answers are accepted?',
      budget: 'Up to 10⁴ values. How many times must each value be touched?',
      observe: 'Build a BST from [-10, -3, 0, 5, 9] by inserting left to right. What shape comes out?',
      brute: 'Inserting the values one by one makes a valid BST. Why is it not balanced?',
      pattern: 'Which choice of root splits the remaining values evenly?',
      watch: 'Watch each range split at its middle.',
    },
    read: [
      { phrase: '`nums` is sorted in strictly increasing order', says: 'The left part of any range is smaller than its middle and the right part bigger: BST order for free.' },
      { phrase: 'at every node, the heights of the two subtrees differ by at most one', says: 'Balance at every node, not just the root: each subtree must also split evenly.' },
      { phrase: 'Several trees qualify; any of them is accepted', says: 'For an even-length range either middle works.' },
    ],
    budget: { from: 'nums.length ≤ 10⁴', n: 1e4, aim: 'O(n)', note: 'Each value becomes one node. Recursion depth is the tree height, about log₂ n.' },
    observe: [
      {
        title: 'Inserting in order makes a chain',
        text: 'Insert -10, -3, 0, 5, 9 one by one: each is bigger than everything so far, so each goes right. A chain of height 5: a valid BST, but not balanced.',
        sketch: { kind: 'array', rows: [{ label: 'chain', items: [-10, '→ -3', '→ 0', '→ 5', '→ 9'], marks: { 4: 'bad' } }] },
      },
      {
        title: 'The middle splits evenly',
        text: 'Make 0, the middle, the root: [-10, -3] are smaller and go left, [5, 9] are bigger and go right. Two values on each side.',
        sketch: { kind: 'array', rows: [{ items: [-10, -3, 0, 5, 9], marks: { 2: 'hit' }, bands: [{ from: 0, to: 1, label: 'left subtree' }, { from: 3, to: 4, label: 'right subtree' }] }] },
      },
      {
        title: 'Repeat for each half',
        text: '[-10, -3] has middle -10 (index (0 + 1) / 2 = 0), with -3 as its right child. [5, 9] gives 5 with 9 on the right. Every node\'s sides differ by at most one value.',
        sketch: { kind: 'array', rows: [{ label: 'level 1', items: [0] }, { label: 'level 2', items: [-10, 5] }, { label: 'level 3', items: [-3, 9] }] },
      },
    ],
    brute: { idea: 'Insert the values into an empty BST one by one.', cost: 'O(n²)', waste: 'Sorted input always goes right, so the tree becomes a chain: every insert walks the whole chain and the result isn\'t balanced.' },
    pattern: {
      pick: 'bst-patterns',
      why: 'Build from sorted values: root = middle, left = build(left half), right = build(right half). O(n) time, O(log n) recursion.',
      not: [
        { id: 'divide-and-conquer', why: 'It is split-in-half recursion; what makes it work is that sorted order is already BST order.' },
        { id: 'binary-search', why: 'The middle index is the same, but you build every half instead of discarding one.' },
      ],
    },
    watch: { viz: 'BstViz', inputs: [{ label: '[-10, -3, 0, 5, 9]', input: { mode: 'sorted', nums: [-10, -3, 0, 5, 9] } }, { label: '[1, 2, 3, 4, 5, 6, 7]', input: { mode: 'sorted', nums: [1, 2, 3, 4, 5, 6, 7] } }] },
    edges: ['One value: [5] → [5].', 'Two values: [1, 3] → [1, null, 3] (or [3, 1]).', 'Seven values: [1, 2, 3, 4, 5, 6, 7] → [4, 2, 6, 1, 3, 5, 7], a perfect tree.'],
  },

  'lowest-common-ancestor-of-a-binary-search-tree': {
    aha: 'Walk down from the root. If p and q are both smaller than the node, both are in its left subtree, and so is their lowest common ancestor; both bigger, go right. The first node where they don\'t go the same way (one on each side, or one is the node itself) is the answer.',
    asks: {
      read: 'Which words let a node be its own descendant, and what is guaranteed about p and q?',
      budget: 'Up to 10⁵ nodes. Is one path enough?',
      observe: 'In [6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], where do 2 and 8 part ways? And 2 and 4?',
      brute: 'The general binary-tree LCA works here. What does it fail to use?',
      pattern: 'What does comparing p and q with one node tell you about where they both are?',
      watch: 'Watch the walk stop where p and q split.',
    },
    read: [
      { phrase: 'the lowest node that has both as descendants (a node is a descendant of itself)', says: 'If p is an ancestor of q, the answer is p itself.' },
      { phrase: 'Values are unique and both `p` and `q` are in the tree', says: 'No need to check they exist: the split point is always the answer.' },
    ],
    budget: { from: 'number of nodes ≤ 10⁵', n: 1e5, aim: 'O(h)', note: 'One path down; O(n) only when the tree is a chain.' },
    observe: [
      {
        title: 'Both on one side: go there',
        text: 'For p = 3 and q = 5 at the root 6: both are smaller, so both are in 6\'s left subtree, and any common ancestor below 6 is too. Go left to 2.',
        sketch: { kind: 'array', rows: [{ label: 'at 6', items: ['3 < 6', '5 < 6', 'go left'], marks: { 2: 'hit' } }] },
      },
      {
        title: 'They split: that is the LCA',
        text: 'p = 2, q = 8 at 6: 2 is left and 8 is right. No node below 6 has both under it, so 6 is the answer.',
        sketch: { kind: 'array', rows: [{ label: 'at 6', items: ['2 < 6', '8 > 6', 'LCA = 6'], marks: { 2: 'hit' } }] },
      },
      {
        title: 'Or one of them is the node',
        text: 'p = 2, q = 4: at 6 both go left; at 2, p is the node itself and 4 is below it. A node counts as its own descendant, so the answer is 2.',
        sketch: { kind: 'array', rows: [{ label: 'path', items: ['6: both left', '2: p is here → 2'], marks: { 1: 'hit' } }] },
      },
    ],
    brute: { idea: 'Use the general binary-tree LCA: search both subtrees of every node for p and q, and return the node where they are found on different sides.', cost: 'O(n)', waste: 'It searches both subtrees everywhere, though at each node the values say which single side to take.' },
    pattern: {
      pick: 'bst-patterns',
      why: 'BST split point: go left while both are smaller, right while both are bigger; the first node between them (inclusive) is the LCA. O(h) time, O(1) space.',
      not: [
        { id: 'tree-dfs', why: 'The two-sided search for a general binary tree; the BST order replaces it with one path.' },
        { id: 'binary-search', why: 'The same "which side?" comparison, with two targets that eventually part.' },
      ],
    },
    watch: { viz: 'BstViz', inputs: [{ label: 'p 2, q 8', input: { mode: 'lca', tree: [6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], p: 2, q: 8 } }, { label: 'p 3, q 5', input: { mode: 'lca', tree: [6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], p: 3, q: 5 } }] },
    edges: ['One is the ancestor: p = 2, q = 4 → 2.', 'Split at the root: p = 2, q = 8 → 6.', 'Two nodes: [2, 1], p = 2, q = 1 → 2.'],
  },

  'validate-binary-search-tree': {
    aha: 'A node must not only be on the right side of its parent: it must be on the right side of every ancestor. So pass a range down: going left, the node\'s value becomes the new upper bound; going right, the new lower bound. A node outside its range breaks the tree.',
    asks: {
      read: 'Which words say the rule covers whole subtrees, and which forbid equal values?',
      budget: 'Up to 10⁴ nodes. One visit each?',
      observe: 'In [5, 1, 4, null, null, 3, 6], every parent–child pair looks fine except one. Which, and why is it a problem?',
      brute: 'Checking max(left) < node < min(right) at every node works. What does it repeat?',
      pattern: 'What does a node inherit from all of its ancestors at once?',
      watch: 'Watch each node checked against the range handed down to it.',
    },
    read: [
      { phrase: 'every value in a node\'s left subtree is strictly less than the node\'s value', says: 'The whole subtree, not just the child: a grandchild can break it.' },
      { phrase: 'Equal values are not allowed', says: 'Use strict comparisons: a value equal to a bound fails.' },
    ],
    budget: { from: 'number of nodes ≤ 10⁴', n: 1e4, aim: 'O(n)', note: 'One visit per node. Values reach ±2³¹, so bounds need a wider type (or null for "no bound").' },
    observe: [
      {
        title: 'Parent–child checks are not enough',
        text: 'In [5, 3, 8, null, null, 4, 9], 4 is the left child of 8 and 4 < 8: fine locally. But 4 is in 5\'s right subtree, where everything must be bigger than 5.',
        sketch: { kind: 'array', rows: [{ label: 'right of 5', items: [8, 4, 9], marks: { 1: 'bad' } }], caption: '4 < 5 but sits on 5\'s right' },
      },
      {
        title: 'Each node inherits a range',
        text: 'The root may be anything: (−∞, ∞). Its left child must be in (−∞, 5) and its right child in (5, ∞). 8\'s left child must be in (5, 8): it inherits 5 from the grandparent and 8 from the parent.',
        sketch: { kind: 'array', rows: [{ items: ['5: (−∞, ∞)', '8: (5, ∞)', '8.left: (5, 8)'], marks: { 2: 'hit' } }] },
      },
      {
        title: 'Or: inorder must strictly increase',
        text: 'Inorder of [5, 3, 8, null, null, 4, 9] reads 3, 5, 4, 8, 9. The drop from 5 to 4 shows it isn\'t a BST.',
        sketch: { kind: 'array', rows: [{ label: 'inorder', items: [3, 5, 4, 8, 9], marks: { 2: 'bad' } }] },
      },
    ],
    brute: { idea: 'At every node, compute the maximum of its left subtree and the minimum of its right subtree, and check max < node < min.', cost: 'O(n²)', waste: 'Each subtree is scanned again for every ancestor above it.' },
    pattern: {
      pick: 'bst-patterns',
      why: 'DFS with a (lo, hi) range: check lo < val < hi, then recurse left with (lo, val) and right with (val, hi). Or an inorder walk that must keep increasing. O(n).',
      not: [
        { id: 'tree-dfs', why: 'It is a DFS, but the context passed down is a range from all the ancestors.' },
        { id: 'sorting-and-selection', why: 'Sorting the values and comparing is wasteful; inorder already gives the order to check.' },
      ],
    },
    watch: { viz: 'BstViz', inputs: [{ label: '[5, 3, 8, null, null, 4, 9]', input: { mode: 'validate', tree: [5, 3, 8, null, null, 4, 9] } }, { label: '[5, 1, 4, null, null, 3, 6]', input: { mode: 'validate', tree: [5, 1, 4, null, null, 3, 6] } }, { label: '[8, 3, 10, 1, 6]', input: { mode: 'validate', tree: [8, 3, 10, 1, 6] } }] },
    edges: ['Equal child: [2, 2, 2] → false.', 'Deep violation: [5, 3, 8, null, null, 4, 9] → false.', 'Extreme values: [2147483647] → true (bounds must go beyond int).'],
  },

  'kth-smallest-element-in-a-bst': {
    aha: 'Inorder (left, node, right) lists a BST\'s values in sorted order. So the k-th value inorder visits is the k-th smallest. Do the walk with an explicit stack, count each visit, and stop at k: nothing after it is touched.',
    asks: {
      read: 'Is k counted from 0 or 1, and what does the follow-up ask?',
      budget: 'Up to 10⁴ nodes. Can you avoid visiting all of them?',
      observe: 'In which order does inorder visit [3, 1, 4, null, 2]?',
      brute: 'Collecting and sorting all values works. What does sorting redo?',
      pattern: 'Which traversal of a BST already produces sorted values?',
      watch: 'Watch the stack walk left, then count visits to k.',
    },
    read: [
      { phrase: 'counting from 1 (so `k = 1` asks for the minimum)', says: 'Stop at the k-th visit: index k − 1 in sorted order.' },
      { phrase: 'if the tree were modified often', says: 'The follow-up: store subtree sizes in each node and descend by counts in O(h).' },
    ],
    budget: { from: 'number of nodes ≤ 10⁴', n: 1e4, aim: 'O(h + k)', note: 'The stack walk reaches the smallest value in h steps, then each visit is one more step.' },
    observe: [
      {
        title: 'Inorder is sorted',
        text: 'Inorder of [3, 1, 4, null, 2] goes left of 3 to 1, then 1\'s right child 2, then 3, then 4: 1, 2, 3, 4. Sorted, because each node comes after its smaller left side and before its bigger right side.',
        sketch: { kind: 'array', rows: [{ label: 'inorder', items: [1, 2, 3, 4], marks: { 0: 'hit' } }], caption: 'k = 1 → 1' },
      },
      {
        title: 'The stack holds the way back',
        text: 'Walk left from the root pushing nodes: 3, 1. The top, 1, has no left child: it is the smallest. Pop it, count 1, then continue from its right child.',
        sketch: { kind: 'array', rows: [{ label: 'stack', items: [3, 1], marks: { 1: 'hit' } }] },
      },
      {
        title: 'Stop at k',
        text: 'For k = 3 in [5, 3, 6, 2, 4, null, null, 1]: visits go 1, 2, 3, and the third is the answer. 4, 5 and 6 are never visited.',
        sketch: { kind: 'array', rows: [{ label: 'visits', items: [1, 2, 3, 4, 5, 6], marks: { 2: 'hit', 3: 'dim', 4: 'dim', 5: 'dim' } }] },
      },
    ],
    brute: { idea: 'Collect every value, sort, and return index k − 1.', cost: 'O(n log n)', waste: 'The BST already holds the values in order; sorting rebuilds that order, and every value is collected even for k = 1.' },
    pattern: {
      pick: 'bst-patterns',
      why: 'Iterative inorder with a stack, counting visits and stopping at the k-th. O(h + k) time, O(h) space.',
      not: [
        { id: 'heap-patterns', why: 'A size-k heap finds the k-th smallest in any collection; a BST already holds the order.' },
        { id: 'sorting-and-selection', why: 'Quickselect needs an array; inorder gives the sorted order directly.' },
      ],
    },
    watch: { viz: 'BstViz', inputs: [{ label: '[3, 1, 4, null, 2], k 1', input: { mode: 'kth', tree: [3, 1, 4, null, 2], x: 1 } }, { label: '[5, 3, 6, 2, 4, null, null, 1], k 3', input: { mode: 'kth', tree: [5, 3, 6, 2, 4, null, null, 1], x: 3 } }] },
    edges: ['k = 1: [3, 1, 4, null, 2] → 1.', 'k = n: [3, 1, 4, null, 2], k = 4 → 4.', 'A left chain: [3, 2, null, 1], k = 2 → 2.'],
  },

  'insert-into-a-binary-search-tree': {
    aha: 'A new value can always become a leaf. Search for it as if it were already there: the search falls off the tree at exactly the empty spot where it belongs. Attach it there; nothing else moves.',
    asks: {
      read: 'Is val already in the tree? Is only one result accepted?',
      budget: 'Up to 10⁴ nodes. Do you need to restructure anything?',
      observe: 'Insert 5 into [4, 2, 7, 1, 3]. Where does a search for 5 end?',
      brute: 'Rebuilding the tree with the new value works. What does it touch needlessly?',
      pattern: 'Where does a failed search stop, and what would fit there?',
      watch: 'Watch the search fall off at the spot for val.',
    },
    read: [
      { phrase: '`val` is not already in the tree', says: 'No duplicate handling: the search always ends at an empty spot.' },
      { phrase: 'any valid BST containing all the old values plus `val` is accepted', says: 'No rebalancing needed: the simplest valid answer is adding a leaf.' },
    ],
    budget: { from: 'number of nodes ≤ 10⁴', n: 1e4, aim: 'O(h)', note: 'One path down. O(n) on a chain, but no rebalancing is asked for.' },
    observe: [
      {
        title: 'Search for it',
        text: 'Insert 5 into [4, 2, 7, 1, 3]: 5 > 4, go right to 7; 5 < 7, go left: 7 has no left child.',
        sketch: { kind: 'array', rows: [{ label: 'path', items: ['4: right', '7: left', 'empty'], marks: { 2: 'hit' } }] },
      },
      {
        title: 'The empty spot fits',
        text: 'Everything left of 7 and right of 4 must be between 4 and 7. 5 is. Attach 5 as 7\'s left child: the tree is [4, 2, 7, 1, 3, 5].',
        sketch: { kind: 'array', rows: [{ label: 'inorder after', items: [1, 2, 3, 4, 5, 7], marks: { 4: 'hit' } }] },
      },
      {
        title: 'An empty tree',
        text: 'With no root, the new node is the whole tree: return it. The recursive version handles that with the same line: null → new TreeNode(val).',
        sketch: { kind: 'array', rows: [{ items: ['root = null', '→ [val]'], marks: { 1: 'hit' } }] },
      },
    ],
    brute: { idea: 'Read all values inorder, add val, sort, and build a new BST from them.', cost: 'O(n log n)', waste: 'Every node is rebuilt when one new leaf on one path is enough.' },
    pattern: {
      pick: 'bst-patterns',
      why: 'BST descent to the empty spot: go left or right by comparison until the needed child is null, then attach the new node there. O(h).',
      not: [
        { id: 'binary-search', why: 'Finding an insert position by halving, but here you follow pointers and attach a node.' },
        { id: 'tree-dfs', why: 'No full traversal: only one path is followed.' },
      ],
    },
    watch: { viz: 'BstViz', inputs: [{ label: '[4, 2, 7, 1, 3], val 5', input: { mode: 'insert', tree: [4, 2, 7, 1, 3], x: 5 } }, { label: '[40, 20, 60, 10, 30, 50, 70], val 25', input: { mode: 'insert', tree: [40, 20, 60, 10, 30, 50, 70], x: 25 } }] },
    edges: ['Empty tree: [], val 5 → [5].', 'New minimum: [4, 2, 7], val 1 → [4, 2, 7, 1].', 'New maximum: [4, 2, 7], val 9 → [4, 2, 7, null, null, null, 9].'],
  },

  'delete-node-in-a-bst': {
    aha: 'Find the node like a search. With at most one child, its child (or nothing) takes its place. With two children, one value must sit between both sides: the next value up, the smallest in its right subtree. Copy that value in, then delete it from the right subtree, where it has no left child: the easy case.',
    asks: {
      read: 'What happens when key isn\'t there, and how many results are accepted?',
      budget: 'Up to 10⁴ nodes. One path down?',
      observe: 'Delete 3 from [5, 3, 6, 2, 4, null, 7]. 3 has two children: what can take its place?',
      brute: 'Rebuilding without the key works. What does it do to the rest of the tree?',
      pattern: 'Which value is bigger than everything on the left and smaller than everything else on the right?',
      watch: 'Watch the successor found, copied up and spliced out.',
    },
    read: [
      { phrase: 'if it exists', says: 'A failed search means return the root unchanged.' },
      { phrase: 'The result must still be a valid BST', says: 'Whatever fills the hole must be bigger than all of the left subtree and smaller than all of the right.' },
      { phrase: 'Several valid results are possible', says: 'The successor (smallest on the right) or the predecessor (largest on the left) both work.' },
    ],
    budget: { from: 'number of nodes ≤ 10⁴', n: 1e4, aim: 'O(h)', note: 'One path to the key, then one path to its successor.' },
    observe: [
      {
        title: 'Zero or one child: splice',
        text: 'Deleting 7 (a leaf) just cuts it. Deleting 6 in [5, 3, 6, 2, 4, null, 7] leaves its only child 7 to take its place: everything under 6 was right of 5, and so is 7.',
        sketch: { kind: 'array', rows: [{ label: 'before', items: ['5 → 6 → 7'] }, { label: 'after', items: ['5 → 7'], marks: { 0: 'hit' } }] },
      },
      {
        title: 'Two children: borrow the next value up',
        text: '3 has 2 on its left and 4 on its right. The node in its place must be > 2 and < everything else on the right. The smallest on the right, 4, is exactly that.',
        sketch: { kind: 'array', rows: [{ label: 'inorder', items: [2, 3, 4, 5, 6, 7], marks: { 1: 'bad', 2: 'hit' } }], caption: '3\'s successor is the next value in sorted order' },
      },
      {
        title: 'The successor has no left child',
        text: 'Go right once, then left as far as possible: the node you stop at has no left child. Copy its value into 3\'s node, then remove it from below: at most one child, the easy case.',
        sketch: { kind: 'array', rows: [{ label: 'result', items: [5, 4, 6, 2, 'null', 'null', 7], marks: { 1: 'hit' } }] },
      },
    ],
    brute: { idea: 'Collect the values inorder, drop key, and build a new balanced BST from the rest.', cost: 'O(n)', waste: 'Every node is rebuilt, though only one or two nodes on one path change.' },
    pattern: {
      pick: 'bst-patterns',
      why: 'BST delete: search for key; at most one child → replace by it; two children → copy the inorder successor\'s value, then delete the successor from the right subtree. O(h).',
      not: [
        { id: 'linked-list-manipulation', why: 'Splicing a one-child node is like unlinking from a list, but the two-child case needs the BST order.' },
        { id: 'tree-dfs', why: 'No full traversal: only the path to the key and to its successor.' },
      ],
    },
    watch: { viz: 'BstViz', inputs: [{ label: 'delete 3 (two children)', input: { mode: 'delete', tree: [5, 3, 6, 2, 4, null, 7], x: 3 } }, { label: 'delete 6 (one child)', input: { mode: 'delete', tree: [5, 3, 6, 2, 4, null, 7], x: 6 } }, { label: 'delete 8, the root', input: { mode: 'delete', tree: [8, 3, 10, 1, 6, null, 14, null, null, 4, 7], x: 8 } }] },
    edges: ['Key missing: [5, 3, 6], key 0 → [5, 3, 6].', 'Delete the only node: [5], key 5 → [].', 'Delete a root with two children: [5, 3, 6], key 5 → [6, 3].'],
  },

  'binary-search-tree-iterator': {
    aha: 'Inorder with an explicit stack can be paused between calls. The stack holds the path of nodes whose left side is done but which haven\'t been returned. next() pops the top (the smallest left) and pushes the left path of its right child. Each node is pushed and popped once: O(1) per call on average, O(h) memory.',
    asks: {
      read: 'Which memory and time limits are asked for?',
      budget: 'Up to 10⁵ calls. What does storing all values up front cost?',
      observe: 'In [7, 3, 15, null, null, 9, 20], what is on the stack before the first next(), and after it?',
      brute: 'Flattening the tree in the constructor makes every call O(1). What limit does it break?',
      pattern: 'How do you stop an inorder walk halfway and resume it later?',
      watch: 'Watch the stack between next() calls.',
    },
    read: [
      { phrase: 'walks a binary search tree in order (smallest to largest)', says: 'Inorder: each call returns the next value in sorted order.' },
      { phrase: 'Aim for O(h) memory, where h is the height of the tree', says: 'You can\'t store all n values: keep only one path at a time.' },
      { phrase: 'O(1) time per call', says: 'On average over all calls: one call may push several nodes, as long as the total over all calls is O(n).' },
    ],
    budget: { from: 'nodes ≤ 10⁵, calls ≤ 10⁵', rows: [['flatten up front', 'O(n) memory', 'warn', 'fast, breaks O(h) memory'], ['stack of one path', 'O(h) memory, 2n pushes/pops in total', 'ok', 'fits both limits']], aim: 'O(1) per call on average', note: 'Every node goes onto the stack once and comes off once, whatever the shape.' },
    observe: [
      {
        title: 'The smallest is at the end of the left path',
        text: 'From 7 go left to 3; 3 has no left child, so it is the smallest. The constructor pushes 7 and 3, and nothing else.',
        sketch: { kind: 'array', rows: [{ label: 'stack', items: [7, 3], marks: { 1: 'hit' } }] },
      },
      {
        title: 'next() pops, then pushes the right side\'s left path',
        text: 'next() pops 3 (no right child) and returns it. Next pops 7: its right child 15 has the values just above 7, smallest first, so push 15 and its left path: 15, 9. The top, 9, is next.',
        sketch: { kind: 'array', rows: [{ label: 'after next() = 7', items: [15, 9], marks: { 1: 'hit' } }] },
      },
      {
        title: 'Expensive calls are paid back',
        text: 'One next() may push a long path, but each node is pushed once and popped once over all calls: 2n operations for n calls. hasNext() is just "is the stack non-empty".',
        sketch: { kind: 'array', rows: [{ label: 'returned', items: [3, 7, 9, 15, 20] }], caption: 'each node pushed once, popped once' },
      },
    ],
    brute: { idea: 'Do a full inorder walk in the constructor into a list; next() returns the next list item.', cost: 'O(n)', waste: 'It stores all n values in memory when only one root-to-leaf path is ever needed at once.' },
    pattern: {
      pick: 'bst-patterns',
      why: 'Controlled inorder: a stack of the pending left path; next() pops and pushes the left path of the popped node\'s right child. O(1) on average per call, O(h) memory.',
      not: [
        { id: 'stack-patterns', why: 'A stack does the work, but it holds tree nodes to resume an inorder walk.' },
        { id: 'design-data-structures', why: 'It is a class with operations, but the content is one paused traversal.' },
      ],
    },
    watch: { viz: 'BstViz', inputs: [{ label: '[7, 3, 15, null, null, 9, 20]', input: { mode: 'iter', tree: [7, 3, 15, null, null, 9, 20] } }, { label: '[8, 3, 10, 1, 6, null, 14]', input: { mode: 'iter', tree: [8, 3, 10, 1, 6, null, 14] } }] },
    edges: ['One node: [1] → next() = 1, then hasNext() = false.', 'A left chain: [3, 2, null, 1] → the constructor pushes all 3; each next() pushes nothing.', 'A right chain: [1, null, 2, null, 3] → each next() pushes one node.'],
  },

  'recover-binary-search-tree': {
    aha: 'Inorder of a BST increases. Swapping two values breaks that in one place (if they were neighbours in sorted order) or two. At the first drop, the earlier value is too big; at the last drop, the later value is too small. Swap those two values back.',
    asks: {
      read: 'How many nodes were swapped, and may the structure change?',
      budget: 'Only 1000 nodes. What is the follow-up asking about memory?',
      observe: 'Write the inorder of [3, 1, 4, null, null, 2] and of [1, 3, null, null, 2]. Where does it go down?',
      brute: 'Sorting the inorder values and writing them back works. What is sorted for no reason?',
      pattern: 'What sequence should a BST produce, and how do you spot the two wrong spots in it?',
      watch: 'Watch the inorder walk mark the drops, then swap.',
    },
    read: [
      { phrase: 'Exactly two nodes of a binary search tree had their values swapped', says: 'In the inorder sequence, exactly two values are out of place.' },
      { phrase: 'without changing the tree\'s structure', says: 'Swap the values back; don\'t move nodes.' },
    ],
    budget: { from: 'number of nodes ≤ 1000', rows: [['inorder + sort', 'O(n log n)', 'ok', 'fits'], ['inorder, find two drops', 'O(n)', 'ok', 'fits; O(1) space with Morris']], aim: 'O(n)', note: 'Small: the follow-up is O(1) extra space (Morris traversal instead of a stack).' },
    observe: [
      {
        title: 'Two drops when they were far apart',
        text: 'Sorted 1, 3, 4, 6, 7, 8, 10, 14 with 6 and 10 swapped reads 1, 3, 4, 10, 7, 8, 6, 14. It drops at 10 > 7 and at 8 > 6.',
        sketch: { kind: 'array', rows: [{ label: 'inorder', items: [1, 3, 4, 10, 7, 8, 6, 14], marks: { 3: 'bad', 6: 'bad' } }] },
      },
      {
        title: 'First drop: the earlier value; last drop: the later one',
        text: 'A too-big value moved left shows up as the high side of the first drop (10). A too-small value moved right shows up as the low side of the last drop (6). Swap 10 and 6.',
        sketch: { kind: 'array', rows: [{ items: ['first = 10', 'second = 6'], marks: { 0: 'hit', 1: 'hit' } }] },
      },
      {
        title: 'One drop when they were neighbours',
        text: '[3, 1, 4, null, null, 2] reads 1, 3, 2, 4: only 3 > 2 drops. Then both wrong values are in that one drop. Setting second at every drop handles both cases.',
        sketch: { kind: 'array', rows: [{ label: 'inorder', items: [1, 3, 2, 4], marks: { 1: 'bad', 2: 'bad' } }] },
      },
    ],
    brute: { idea: 'Collect the values inorder, sort them, and write them back into the nodes in inorder.', cost: 'O(n log n)', waste: 'All but two values are already in place; sorting reorders a sequence that is off by a single swap.' },
    pattern: {
      pick: 'bst-patterns',
      why: 'Inorder with a prev pointer: at a drop, first = prev (only the first time) and second = cur (every time); swap them at the end. O(n) time; O(h) stack, or O(1) with Morris traversal.',
      not: [
        { id: 'sorting-and-selection', why: 'Sorting fixes it but ignores that only one swap happened.' },
        { id: 'tree-dfs', why: 'It is a traversal, but specifically inorder, because only inorder turns BST order into a sorted list.' },
      ],
    },
    watch: { viz: 'BstViz', inputs: [{ label: 'two drops', input: { mode: 'recover', tree: [8, 3, 6, 1, 10, null, 14, null, null, 4, 7] } }, { label: '[3, 1, 4, null, null, 2]', input: { mode: 'recover', tree: [3, 1, 4, null, null, 2] } }, { label: '[1, 3, null, null, 2]', input: { mode: 'recover', tree: [1, 3, null, null, 2] } }] },
    edges: ['Neighbours swapped: [3, 1, 4, null, null, 2] → [2, 1, 4, null, null, 3].', 'Two nodes: [1, 2] → [2, 1] (inorder 2, 1 has one drop).', 'Root involved: [1, 3, null, null, 2] → [3, 1, null, null, 2].'],
  },
};
