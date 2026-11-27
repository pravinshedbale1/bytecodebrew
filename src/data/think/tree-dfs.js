/** Practice thinking walkthroughs: tree-dfs (format: src/data/think/index.js). */

export default {
  'maximum-depth-of-binary-tree': {
    free: true,
    aha: 'A tree is one node deeper than the deeper of its two subtrees, and an empty tree has depth 0. So each call asks its children the same question, trusts their answers, and adds 1: depth = 1 + max(left, right).',
    asks: {
      read: 'Which words define depth, and what is the smallest case?',
      budget: 'Up to 10⁴ nodes. What could go wrong with recursion on a long chain?',
      observe: 'In [3, 9, 20, null, null, 15, 7], how deep is each subtree under 3?',
      brute: 'Walking up from every leaf works. What does it repeat?',
      pattern: 'If each child could tell you its own depth, what would you do with the two answers?',
      watch: 'Watch calls go down and depths come back up.',
    },
    read: [
      { phrase: 'the number of nodes on the longest path from the root down to a leaf', says: 'Count nodes, not edges: a single node has depth 1.' },
      { phrase: 'An empty tree has depth 0', says: 'The base case: null returns 0, which makes a leaf 1 + max(0, 0) = 1.' },
    ],
    budget: {
      from: 'number of nodes ≤ 10⁴',
      n: 10000,
      aim: 'O(n)',
      note: 'Every node is visited once. A chain of 10⁴ nodes means 10⁴ nested calls; BFS avoids deep recursion if that is a concern.',
    },
    observe: [
      {
        title: 'A tree\'s depth comes from its subtrees',
        text: 'The tree under 3 is as deep as its deeper subtree, plus 1 for 3 itself. 9 alone is 1 deep; 20 with 15 and 7 is 2 deep. So the answer is 1 + max(1, 2) = 3.',
        sketch: { kind: 'array', rows: [{ label: 'depth of each subtree', items: ['9: 1', '20: 2', '3: 1 + 2 = 3'], marks: { '2': 'hit' } }] },
      },
      {
        title: 'Trust the children',
        text: 'maxDepth(node) asks both children the same question without caring how they answer it. The empty tree answers 0: that is where the questions stop.',
        sketch: { kind: 'array', rows: [{ items: ['maxDepth(null) = 0', 'a leaf: 1 + max(0, 0) = 1'] }] },
      },
      {
        title: 'Or count levels',
        text: 'A level-by-level walk sees [3], then [9, 20], then [15, 7]: 3 levels, the same answer.',
        sketch: { kind: 'array', rows: [{ label: 'level 0', items: [3] }, { label: 'level 1', items: [9, 20] }, { label: 'level 2', items: [15, 7] }] },
      },
    ],
    brute: {
      idea: 'For every leaf, walk up to the root counting nodes, and keep the largest count.',
      cost: 'O(n · h)',
      waste: 'Paths near the root are walked again for every leaf below them.',
    },
    pattern: {
      pick: 'tree-dfs',
      why: 'Bottom-up DFS: depth(node) = 1 + max(depth(left), depth(right)), with depth(null) = 0. Each node is visited once: O(n).',
      not: [
        { id: 'tree-bfs', why: 'Counting levels with a queue also works and avoids deep recursion; DFS is shorter to write.' },
        {
          id: 'dp-trees-intervals',
          why: 'Combining the children\'s answers is tree DP in its simplest form; nothing has to be stored beyond the return value.',
        },
      ],
    },
    watch: {
      viz: 'TreeDfsViz',
      inputs: [
        { label: '[3, 9, 20, null, null, 15, 7]', input: { mode: 'depth', tree: [3, 9, 20, null, null, 15, 7] } },
        { label: '[1, null, 2]', input: { mode: 'depth', tree: [1, null, 2] } },
      ],
    },
    edges: ['Empty tree: [] → 0.', 'One node: [1] → 1.', 'A chain: [1, null, 2, null, 3] → 3.'],
  },

  'same-tree': {
    aha: 'Two trees are the same when both are empty, or both roots exist with equal values and the left subtrees are the same and the right subtrees are the same. Walk both trees together and stop at the first difference in value or shape.',
    asks: {
      read: 'Which words say shape matters, not just values?',
      budget: 'Only 100 nodes. What is the real question?',
      observe: '[1, 2] and [1, null, 2] hold the same values. Why are they different trees?',
      brute: 'Writing both trees as strings and comparing works. What does it do even when the roots already differ?',
      pattern: 'If you know how to compare two subtrees, how do you compare two whole trees?',
      watch: 'Watch both trees compared node by node.',
    },
    read: [
      {
        phrase: 'exactly the same shape and every pair of corresponding nodes has the same value',
        says: 'Two checks at every position: both present (or both missing), and equal values.',
      },
      {
        phrase: '`[1,2]` and `[1,null,2]` hold the same values but are different shapes',
        says: 'Comparing value lists isn\'t enough: missing children matter.',
      },
    ],
    budget: {
      from: 'number of nodes ≤ 100',
      rows: [['walk both together', 'O(min(n, m))', 'ok', 'fits']],
      aim: 'O(min(n, m))',
      note: 'Tiny: the question is comparing shape and values together.',
    },
    observe: [
      {
        title: 'Same values can still be different trees',
        text: '[1, 2] has 2 as a left child; [1, null, 2] has it as a right child. A comparison of values alone would wrongly say "same".',
        sketch: {
          kind: 'array',
          rows: [{ label: 'p, level order', items: [1, 2] }, { label: 'q, level order', items: [1, 'null', 2], marks: { '1': 'bad' } }],
        },
      },
      {
        title: 'Compare in step',
        text: 'Both missing: the same. One missing: different. Both present: the values must match, and then the left pair and the right pair must match.',
        sketch: { kind: 'array', rows: [{ items: ['both null → true', 'one null → false', 'values differ → false'] }] },
      },
      {
        title: 'Stop at the first difference',
        text: 'In [1, 2] vs [1, null, 2]: the roots match (1 = 1); then the left children are 2 and nothing: different shapes, so false.',
        sketch: { kind: 'array', rows: [{ items: ['1 = 1', '2 vs nothing'], marks: { '0': 'hit', '1': 'bad' } }] },
      },
    ],
    brute: {
      idea: 'Write each tree as a preorder string with a marker for every null, then compare the strings.',
      cost: 'O(n + m)',
      waste: 'It builds both whole strings even when the roots already differ.',
    },
    pattern: {
      pick: 'tree-dfs',
      why: 'Simultaneous DFS: same(p, q) is true when both are null, or both are present with equal values and same(p.left, q.left) and same(p.right, q.right). It stops at the first difference: O(min(n, m)).',
      not: [
        {
          id: 'tree-bfs',
          why: 'Hashing the values (say, as a set) ignores the shape: [1, 2] and [1, null, 2] hold the same values but are different trees.',
        },
        { id: 'hashing', why: 'Hashing the values ignores the shape.' },
      ],
    },
    watch: {
      viz: 'TreeWalkViz',
      inputs: [
        { label: '[1, 2, 3] and [1, 2, 3]', input: { mode: 'same', p: [1, 2, 3], q: [1, 2, 3] } },
        { label: '[1, 2] and [1, null, 2]', input: { mode: 'same', p: [1, 2], q: [1, null, 2] } },
      ],
    },
    edges: ['Both empty: [], [] → true.', 'Same values, different shape: [1, 2], [1, null, 2] → false.', 'Swapped children: [1, 2, 1], [1, 1, 2] → false.'],
  },

  'invert-binary-tree': {
    aha: 'Mirroring a tree means every node swaps its left and right child, not just the root. Mirror both subtrees and swap them; each node is visited once, and the order of visits doesn\'t even matter.',
    asks: {
      read: 'Which words say how far down the swapping goes?',
      budget: 'Only 100 nodes. Is there any reason not to visit every node?',
      observe: 'Mirror [4, 2, 7, 1, 3, 6, 9]. Which pairs of children swap?',
      brute: 'Building a mirrored copy works. What does it make that isn\'t needed?',
      pattern: 'If both subtrees were already mirrored, what would be left to do at the root?',
      watch: 'Watch every node with children swap them.',
    },
    read: [
      { phrase: 'swap the left and right child of every node', says: 'Every node, all the way down: not only the root.' },
      { phrase: 'Recursively invert both subtrees and then swap them', says: 'The method: trust the recursion for the subtrees, then do one swap.' },
    ],
    budget: {
      from: 'number of nodes ≤ 100',
      rows: [['visit each node once', 'O(n)', 'ok', 'fits']],
      aim: 'O(n)',
      note: 'Every node needs its children swapped, so O(n) is also the minimum.',
    },
    observe: [
      {
        title: 'Every node swaps its children',
        text: 'Not just the root: 2 and 7 swap places, and below them 1 and 3 swap, and 6 and 9.',
        sketch: {
          kind: 'array',
          rows: [
            { label: 'before, level order', items: [4, 2, 7, 1, 3, 6, 9] },
            { label: 'after', items: [4, 7, 2, 9, 6, 3, 1], marks: { '1': 'hit', '2': 'hit' } },
          ],
        },
      },
      {
        title: 'Each node needs exactly one swap',
        text: 'Top-down, bottom-up or level by level: as long as every node\'s two children are swapped once, the tree ends up mirrored.',
        sketch: { kind: 'array', rows: [{ items: ['swap at 4', 'swap at 2', 'swap at 7'] }] },
      },
      {
        title: 'Mirror the subtrees, then swap them',
        text: 'invert(node) inverts both subtrees, then swaps them. A leaf has nothing to swap, and null returns null.',
        sketch: { kind: 'array', rows: [{ items: ['invert(2): 1 ↔ 3', 'invert(7): 6 ↔ 9', 'then 2 ↔ 7'] }] },
      },
    ],
    brute: {
      idea: 'Build a brand-new mirrored copy of the tree.',
      cost: 'O(n) time, O(n) new nodes',
      waste: 'A new node for every node, when swapping two pointers per node does it in place.',
    },
    pattern: {
      pick: 'tree-dfs',
      why: 'DFS that swaps each node\'s left and right child (after inverting both subtrees). Each node is visited once: O(n).',
      not: [
        { id: 'tree-bfs', why: 'A queue visiting every node and swapping its children works just as well.' },
        { id: 'two-pointers', why: 'Mirroring isn\'t reversing each level as an array: whole subtrees move with their parents.' },
      ],
    },
    watch: {
      viz: 'TreeWalkViz',
      inputs: [
        { label: '[4, 2, 7, 1, 3, 6, 9]', input: { mode: 'invert', tree: [4, 2, 7, 1, 3, 6, 9] } },
        { label: '[2, 1, 3]', input: { mode: 'invert', tree: [2, 1, 3] } },
      ],
    },
    edges: ['Empty: [] → [].', 'One node: [1] → [1].', 'Only a left child: [1, 2] → [1, null, 2].'],
  },

  'symmetric-tree': {
    aha: 'Symmetric is about pairs: each node on the left has a partner in the mirror position on the right. Compare the two halves together, outside with outside (a.left with b.right) and inside with inside (a.right with b.left).',
    asks: {
      read: 'Which words tell you which nodes to compare with which?',
      budget: 'Up to 1000 nodes. Is one pass enough?',
      observe: 'In [1, 2, 2, 3, 4, 4, 3], which node does the left 2\'s left child pair with?',
      brute: 'Building a mirrored copy and comparing works. What does it build that isn\'t needed?',
      pattern: 'How is "mirror of each other" like "same tree", and how is it different?',
      watch: 'Watch mirror pairs compared, outside then inside.',
    },
    read: [
      {
        phrase: 'the left subtree is a mirror image of the right subtree',
        says: 'A relation between two subtrees: compare them together, like Same Tree but crossed.',
      },
      {
        phrase: 'the left child of one with the right child of the other',
        says: 'The pairing rule, spelled out: outside with outside, inside with inside.',
      },
    ],
    budget: {
      from: 'number of nodes ≤ 1000',
      rows: [['compare the two halves once', 'O(n)', 'ok', 'fits']],
      aim: 'O(n)',
      note: 'Each node is compared with its mirror partner once.',
    },
    observe: [
      {
        title: 'Symmetric is about pairs',
        text: 'Each node on the left has a partner in the mirror position on the right: 2 with 2, 3 with 3, 4 with 4.',
        sketch: { kind: 'array', rows: [{ label: 'level 1', items: [2, 2], marks: { '0': 'hit', '1': 'hit' } }, { label: 'level 2', items: [3, 4, 4, 3] }] },
      },
      {
        title: 'Outside with outside, inside with inside',
        text: 'The left 2\'s left child (3) pairs with the right 2\'s right child (3); its right child (4) pairs with the right 2\'s left child (4).',
        sketch: { kind: 'array', rows: [{ items: ['3 ↔ 3 (outside)', '4 ↔ 4 (inside)'] }] },
      },
      {
        title: 'A level that reads the same backwards isn\'t enough',
        text: '[1, 2, 2, null, 3, null, 3] has levels [2, 2] and [3, 3], but both 3s are right children: they are not mirror images.',
        sketch: { kind: 'array', rows: [{ label: 'level 2 positions', items: ['∅', 3, '∅', 3], marks: { '1': 'bad', '3': 'bad' } }] },
      },
    ],
    brute: {
      idea: 'Build a mirrored copy of the tree and check that it is the same as the original.',
      cost: 'O(n) time, O(n) new nodes',
      waste: 'It builds a whole mirrored copy of the tree only to compare against it; walking the two halves inwards together compares them directly with no copy.',
    },
    pattern: {
      pick: 'tree-dfs',
      why: 'Mirror DFS: mirror(a, b) is true when both are null, or both are present with equal values and mirror(a.left, b.right) and mirror(a.right, b.left). Start with the root\'s two children. O(n).',
      not: [
        { id: 'tree-bfs', why: 'A queue of mirror pairs works the same way without recursion.' },
        { id: 'two-pointers', why: 'Checking each level as a palindrome misses where the nulls are (third observation).' },
      ],
    },
    watch: {
      viz: 'TreeWalkViz',
      inputs: [
        { label: '[1, 2, 2, 3, 4, 4, 3]', input: { mode: 'symmetric', tree: [1, 2, 2, 3, 4, 4, 3] } },
        { label: '[1, 2, 2, null, 3, null, 3]', input: { mode: 'symmetric', tree: [1, 2, 2, null, 3, null, 3] } },
      ],
    },
    edges: ['One node: [1] → true.', 'Same values, wrong sides: [1, 2, 2, null, 3, null, 3] → false.', 'Different values: [1, 2, 3] → false.'],
  },

  'path-sum': {
    aha: 'Pass down how much is still needed: each node subtracts its value before asking its children. At a leaf, the path works exactly when what is left equals the leaf\'s value. Stop as soon as one path works.',
    asks: {
      read: 'Which words say where a path must end?',
      budget: 'Up to 5000 nodes. How many times should each node be visited?',
      observe: 'With target 22, how much is still needed after 5, then after 4, then after 11?',
      brute: 'Recording every root-to-leaf sum works. What does it keep doing after a path is found?',
      pattern: 'What should each call pass to its children, so a leaf can answer on its own?',
      watch: 'Watch the remaining sum shrink on the way down.',
    },
    read: [
      {
        phrase: 'a root-to-leaf path whose node values add up to `targetSum`',
        says: 'Paths start at the root and end at a leaf: information flows down.',
      },
      { phrase: 'An empty tree has no paths', says: 'An empty tree returns false, even for target 0.' },
      { phrase: 'The path must end at a leaf', says: 'Check the sum only at leaves; a match halfway down doesn\'t count.' },
    ],
    budget: { from: 'number of nodes ≤ 5000', n: 5000, aim: 'O(n)', note: 'Each node is visited at most once.' },
    observe: [
      {
        title: 'Carry what is still needed',
        text: 'Starting from 5 with 22 needed, its children must find 17. Then after 4, 13 is needed; after 11, 2.',
        sketch: { kind: 'array', rows: [{ items: ['5: need 22', '4: need 17', '11: need 13', '2: need 2 ✓'], marks: { '3': 'hit' } }] },
      },
      {
        title: 'Only leaves can say yes',
        text: 'After 11, 2 is still needed, but 11 has children, so the path can\'t stop there. Leaf 7 needs to be 2 and isn\'t; leaf 2 is exactly 2: yes.',
        sketch: { kind: 'array', rows: [{ items: ['leaf 7: needs 2 → no', 'leaf 2: needs 2 → yes'], marks: { '0': 'bad', '1': 'hit' } }] },
      },
      {
        title: 'Stop at the first yes',
        text: 'Once one path works, return true without exploring the rest: 8, 13, 4 and 1 are never needed.',
        sketch: { kind: 'array', rows: [{ items: [8, 13, 4, 1], marks: { '0': 'dim', '1': 'dim', '2': 'dim', '3': 'dim' } }] },
      },
    ],
    brute: {
      idea: 'Walk the tree recording the sum of every root-to-leaf path, then check whether the target is among them.',
      cost: 'O(n) time, O(leaves) space',
      waste: 'It stores every sum and explores every path, even after one works.',
    },
    pattern: {
      pick: 'tree-dfs',
      why: 'Top-down DFS carrying the remaining sum: subtract each node\'s value on the way down; at a leaf, the path works when the remainder equals its value. Return true as soon as either side does. O(n).',
      not: [
        { id: 'tree-bfs', why: 'A queue of (node, sum so far) works too; DFS stops at the first success with less memory.' },
        { id: 'backtracking', why: 'Path Sum II lists every such path with backtracking; here one yes is enough.' },
      ],
    },
    watch: {
      viz: 'TreeDfsViz',
      inputs: [
        { label: 'target 22', input: { mode: 'pathsum', tree: [5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1], target: 22 } },
        { label: '[1, 2, 3], target 5', input: { mode: 'pathsum', tree: [1, 2, 3], target: 5 } },
      ],
    },
    edges: ['Empty tree: [], 0 → false.', 'Stopping halfway doesn\'t count: [1, 2], 1 → false.', 'Negative values: [−2, null, −3], −5 → true.'],
  },

  'balanced-binary-tree': {
    aha: 'Check every node, but compute each height once: bottom-up, height = 1 + max(left, right). Let the function return −1 for "already unbalanced", so a parent that hears −1 passes it straight up without more work.',
    asks: {
      read: 'Which words say every node must be checked, and which warn about the slow way?',
      budget: 'Up to 5000 nodes. What does recomputing heights at every node cost?',
      observe: 'In [1, 2, 2, 3, 3, null, null, 4, 4], where does the tree become unbalanced?',
      brute: 'Checking the definition at every node works. Which heights get recomputed?',
      pattern: 'How can one function return both "my height" and "something below me failed"?',
      watch: 'Watch heights come up and −1 stop the walk.',
    },
    read: [
      { phrase: 'the heights of the left and right subtrees differ by at most one', says: 'A condition at every node, not just the root.' },
      { phrase: 'Compute heights bottom-up', says: 'Each height from the children\'s heights: once per node.' },
      {
        phrase: 'recomputing heights from every node separately costs O(n²)',
        says: 'The trap: calling height() from every node re-walks its subtree each time.',
      },
    ],
    budget: { from: 'number of nodes ≤ 5000', n: 5000, aim: 'O(n)', note: 'Top-down checking is O(n²) on a chain.' },
    observe: [
      {
        title: 'Check every node, not just the root',
        text: 'In [1, 2, 2, 3, 3, null, null, 4, 4], the root\'s left side is 3 tall and its right side 1 tall: off by 2, unbalanced.',
        sketch: { kind: 'array', rows: [{ items: ['left height 3', 'right height 1'], marks: { '0': 'bad', '1': 'bad' } }] },
      },
      {
        title: 'Heights come from the children\'s heights',
        text: 'height = 1 + max(left, right). Computing it once per node, from the bottom up, costs O(n) in total: the 4s are 1, the 3 above them 2, the left 2 is 3.',
        sketch: { kind: 'array', rows: [{ items: ['4: 1', '3: 2', '2 (left): 3', '2 (right): 1'] }] },
      },
      {
        title: 'Use −1 for "already unbalanced"',
        text: 'Return the height, or −1 to say "unbalanced somewhere below". A parent seeing −1 returns −1 at once, skipping the rest.',
        sketch: { kind: 'array', rows: [{ items: ['h(left) = −1', '→ return −1'], marks: { '0': 'bad' } }] },
      },
    ],
    brute: {
      idea: 'At every node, compute both subtree heights from scratch and compare them, then check both subtrees the same way.',
      cost: 'O(n²)',
      waste: 'Each subtree\'s height is recomputed by every one of its ancestors.',
    },
    pattern: {
      pick: 'tree-dfs',
      why: 'Bottom-up DFS returning a height, or −1 for unbalanced: get l and r (passing −1 straight up), return −1 if |l − r| > 1, else 1 + max(l, r). O(n).',
      not: [
        { id: 'tree-bfs', why: 'Levels don\'t give the subtree heights at each node.' },
        { id: 'dp-trees-intervals', why: 'It is tree DP: each node combines its children\'s heights; the −1 just adds an early stop.' },
      ],
    },
    watch: {
      viz: 'TreeWalkViz',
      inputs: [
        { label: '[1, 2, 2, 3, 3, null, null, 4, 4]', input: { mode: 'balanced', tree: [1, 2, 2, 3, 3, null, null, 4, 4] } },
        { label: '[3, 9, 20, null, null, 15, 7]', input: { mode: 'balanced', tree: [3, 9, 20, null, null, 15, 7] } },
      ],
    },
    edges: ['Empty: [] → true.', 'A chain of three: [1, 2, null, 3] → false.', 'Deep but balanced: [1, 2, 3, 4] → true.'],
  },

  'binary-tree-inorder-traversal': {
    aha: 'All three orders walk the tree the same way; they differ only in when a node is written. Inorder writes it between its left and right subtrees. Recursively that is three lines; iteratively, slide left pushing nodes, pop one, write it, then continue from its right child.',
    asks: {
      read: 'Which words fix when a node is written, and what does the follow-up ask?',
      budget: 'Only 100 nodes. What is the real challenge?',
      observe: 'Walk [1, null, 2, 3] by hand with this rule. In what order do the values come out?',
      brute: 'The recursive version is short. What does it rely on that the follow-up takes away?',
      pattern: 'What replaces the call stack when you walk a tree without recursion?',
      watch: 'Watch each node written at its inorder moment.',
    },
    budget: {
      from: 'number of nodes ≤ 100',
      rows: [['visit each node once', 'O(n)', 'ok', 'fits']],
      aim: 'O(n)',
      note: 'Tiny: the follow-up is about doing it without recursion (or in O(1) space with Morris threads).',
    },
    pattern: {
      pick: 'tree-dfs',
      why: 'Inorder DFS: the node is written between its left and right subtrees. Recursively, or iteratively with an explicit stack. O(n) time, O(h) stack.',
      not: [
        { id: 'tree-bfs', why: 'Level order visits by depth, not by this rule.' },
        { id: 'bst-patterns', why: 'In a binary search tree inorder comes out sorted; here the tree is any binary tree.' },
        { id: 'stack-patterns', why: 'The iterative version uses a stack, but the order comes from the tree walk.' },
      ],
    },
    watch: {
      viz: 'TreeWalkViz',
      inputs: [
        { label: '[1, null, 2, 3]', input: { mode: 'order', which: 'in', tree: [1, null, 2, 3] } },
        { label: '[1, 2, 3, 4, 5, null, 6]', input: { mode: 'order', which: 'in', tree: [1, 2, 3, 4, 5, null, 6] } },
      ],
    },
    edges: ['Empty: [] → [].', 'A left chain: [3, 2, null, 1] → [1, 2, 3].', 'A right chain: [1, null, 2, null, 3] → [1, 2, 3].'],
    read: [
      {
        phrase: 'first everything in its left subtree, then the node itself, then everything in its right subtree',
        says: 'Inorder: the node is written between its two subtrees.',
      },
      { phrase: 'Can you do it iteratively?', says: 'Replace the call stack with your own stack (or Morris threads for O(1) space).' },
    ],
    observe: [
      {
        title: 'Same walk, different moment',
        text: 'All three orders walk the tree the same way. They differ only in when the node is written: before its subtrees (pre), between them (in), or after them (post).',
        sketch: { kind: 'array', rows: [{ items: ['pre: node, L, R', 'in: L, node, R', 'post: L, R, node'], marks: { '1': 'hit' } }] },
      },
      {
        title: 'Work it on [1, null, 2, 3]',
        text: '1 has no left subtree, so it is written first. Then go right to 2: its left subtree, 3, comes before it. Result: [1, 3, 2].',
        sketch: { kind: 'array', rows: [{ items: [1, 3, 2], marks: { '0': 'hit', '1': 'hit', '2': 'hit' } }] },
      },
      {
        title: 'Iteratively: a stack replaces the calls',
        text: 'Slide left from the current node, pushing every node; pop one, write it, then continue from its right child. From 2, sliding left pushes 2 then 3.',
        sketch: { kind: 'array', rows: [{ label: 'stack after sliding left from 2 (bottom → top)', items: [2, 3] }] },
      },
    ],
    brute: {
      idea: 'Recursion: walk(left), write the node, walk(right).',
      cost: 'O(n) time, O(h) call stack',
      waste: 'Nothing wasted in time; the follow-up asks to replace the call stack with your own stack.',
    },
  },

  'binary-tree-preorder-traversal': {
    aha: 'All three orders walk the tree the same way; they differ only in when a node is written. Preorder writes it before its subtrees. Recursively that is three lines; iteratively, pop a node, write it, and push its right child before its left so the left comes out first.',
    asks: {
      read: 'Which words fix when a node is written, and what does the follow-up ask?',
      budget: 'Only 100 nodes. What is the real challenge?',
      observe: 'Walk [1, null, 2, 3] by hand with this rule. In what order do the values come out?',
      brute: 'The recursive version is short. What does it rely on that the follow-up takes away?',
      pattern: 'What replaces the call stack when you walk a tree without recursion?',
      watch: 'Watch each node written at its preorder moment.',
    },
    budget: {
      from: 'number of nodes ≤ 100',
      rows: [['visit each node once', 'O(n)', 'ok', 'fits']],
      aim: 'O(n)',
      note: 'Tiny: the follow-up is about doing it without recursion (or in O(1) space with Morris threads).',
    },
    pattern: {
      pick: 'tree-dfs',
      why: 'Preorder DFS: the node is written before its subtrees. Recursively, or iteratively with an explicit stack. O(n) time, O(h) stack.',
      not: [
        { id: 'tree-bfs', why: 'Level order visits by depth, not by this rule.' },
        { id: 'bst-patterns', why: 'In a binary search tree inorder comes out sorted; here the tree is any binary tree.' },
        { id: 'stack-patterns', why: 'The iterative version uses a stack, but the order comes from the tree walk.' },
      ],
    },
    watch: {
      viz: 'TreeWalkViz',
      inputs: [
        { label: '[1, null, 2, 3]', input: { mode: 'order', which: 'pre', tree: [1, null, 2, 3] } },
        { label: '[1, 2, 3, 4, 5, null, 6]', input: { mode: 'order', which: 'pre', tree: [1, 2, 3, 4, 5, null, 6] } },
      ],
    },
    edges: ['Empty: [] → [].', 'A left chain: [3, 2, null, 1] → [3, 2, 1].', 'Full tree: [1, 2, 3] → [1, 2, 3].'],
    read: [
      {
        phrase: 'first the node itself, then everything in its left subtree, then everything in its right subtree',
        says: 'Preorder: the node is written before its subtrees.',
      },
      { phrase: 'can you do it iteratively?', says: 'With a stack: pop, write, push right then left.' },
    ],
    observe: [
      {
        title: 'Same walk, different moment',
        text: 'All three orders walk the tree the same way. Preorder writes a node the first time it is reached, before either subtree.',
        sketch: { kind: 'array', rows: [{ items: ['pre: node, L, R', 'in: L, node, R', 'post: L, R, node'], marks: { '0': 'hit' } }] },
      },
      {
        title: 'Work it on [1, null, 2, 3]',
        text: 'Write 1; it has no left subtree, so go right and write 2; then 2\'s left child, 3. Result: [1, 2, 3].',
        sketch: { kind: 'array', rows: [{ items: [1, 2, 3], marks: { '0': 'hit', '1': 'hit', '2': 'hit' } }] },
      },
      {
        title: 'Iteratively: push right before left',
        text: 'Pop a node, write it, then push its right child and then its left child, so the left one is popped (and written) first.',
        sketch: { kind: 'array', rows: [{ label: 'after popping 1 in [1, 2, 3]: stack (bottom → top)', items: [3, 2] }] },
      },
    ],
    brute: {
      idea: 'Recursion: write the node, walk(left), walk(right).',
      cost: 'O(n) time, O(h) call stack',
      waste: 'Nothing wasted in time; the follow-up asks to replace the call stack with your own stack.',
    },
  },

  'binary-tree-postorder-traversal': {
    aha: 'All three orders walk the tree the same way; they differ only in when a node is written. Postorder writes it after both of its subtrees. Recursively that is three lines; iteratively, produce node, right, left with a stack (a mirrored preorder) and reverse it.',
    asks: {
      read: 'Which words fix when a node is written, and what does the follow-up ask?',
      budget: 'Only 100 nodes. What is the real challenge?',
      observe: 'Walk [1, null, 2, 3] by hand with this rule. In what order do the values come out?',
      brute: 'The recursive version is short. What does it rely on that the follow-up takes away?',
      pattern: 'What replaces the call stack when you walk a tree without recursion?',
      watch: 'Watch each node written at its postorder moment.',
    },
    budget: {
      from: 'number of nodes ≤ 100',
      rows: [['visit each node once', 'O(n)', 'ok', 'fits']],
      aim: 'O(n)',
      note: 'Tiny: the follow-up is about doing it without recursion (or in O(1) space with Morris threads).',
    },
    pattern: {
      pick: 'tree-dfs',
      why: 'Postorder DFS: the node is written after both of its subtrees. Recursively, or iteratively with an explicit stack. O(n) time, O(h) stack.',
      not: [
        { id: 'tree-bfs', why: 'Level order visits by depth, not by this rule.' },
        { id: 'bst-patterns', why: 'In a binary search tree inorder comes out sorted; here the tree is any binary tree.' },
        { id: 'stack-patterns', why: 'The iterative version uses a stack, but the order comes from the tree walk.' },
      ],
    },
    watch: {
      viz: 'TreeWalkViz',
      inputs: [
        { label: '[1, null, 2, 3]', input: { mode: 'order', which: 'post', tree: [1, null, 2, 3] } },
        { label: '[1, 2, 3, 4, 5, null, 6]', input: { mode: 'order', which: 'post', tree: [1, 2, 3, 4, 5, null, 6] } },
      ],
    },
    edges: ['Empty: [] → [].', 'A left chain: [3, 2, null, 1] → [1, 2, 3].', 'Full tree: [1, 2, 3] → [2, 3, 1].'],
    read: [
      {
        phrase: 'first everything in its left subtree, then everything in its right subtree, then the node itself',
        says: 'Postorder: the node is written after both of its subtrees.',
      },
      {
        phrase: 'can you do it iteratively?',
        says: 'The trickiest of the three iteratively: reverse a mirrored preorder, or track the last node written.',
      },
    ],
    observe: [
      {
        title: 'Same walk, different moment',
        text: 'All three orders walk the tree the same way. Postorder writes a node only when both of its subtrees are finished.',
        sketch: { kind: 'array', rows: [{ items: ['pre: node, L, R', 'in: L, node, R', 'post: L, R, node'], marks: { '2': 'hit' } }] },
      },
      {
        title: 'Work it on [1, null, 2, 3]',
        text: '1 waits for its right subtree; 2 waits for its left child 3. So 3 is written first, then 2, then 1: [3, 2, 1].',
        sketch: { kind: 'array', rows: [{ items: [3, 2, 1], marks: { '0': 'hit', '1': 'hit', '2': 'hit' } }] },
      },
      {
        title: 'Iteratively: a mirrored preorder, reversed',
        text: 'Postorder (L, R, node) read backwards is (node, R, L): a preorder that visits the right child first. Produce that with a stack, then reverse it.',
        sketch: {
          kind: 'array',
          rows: [
            { label: 'node, R, L', items: [1, 2, 3] },
            { label: 'reversed: postorder', items: [3, 2, 1], marks: { '0': 'hit', '1': 'hit', '2': 'hit' } },
          ],
        },
      },
    ],
    brute: {
      idea: 'Recursion: walk(left), walk(right), write the node.',
      cost: 'O(n) time, O(h) call stack',
      waste: 'Nothing wasted in time; the follow-up asks to replace the call stack with your own stack.',
    },
  },

  'subtree-of-another-tree': {
    aha: 'A subtree is a node together with everything below it. So try each node of root as the start, and check whether the tree from there is exactly subRoot: that check is Same Tree.',
    asks: {
      read: 'Which words say a subtree must take everything below its start?',
      budget: 'Up to 2000 and 1000 nodes. Is checking from every start fast enough?',
      observe: 'In [3, 4, 5, 1, 2], from which node does [4, 1, 2] start?',
      brute: 'Writing every subtree out as a string works. What does it rebuild?',
      pattern: 'Checking one starting node is a problem you already know. Which one?',
      watch: 'Watch each node tried as the start of subRoot.',
    },
    read: [
      { phrase: 'exactly the same structure and node values', says: 'The check at each start is Same Tree.' },
      { phrase: '`root` counts as a subtree of itself', says: 'The root is one of the starts to try.' },
      { phrase: 'a subtree must include every descendant', says: 'A match must end where subRoot ends: an extra child below breaks it.' },
    ],
    budget: {
      from: 'root ≤ 2000 nodes, subRoot ≤ 1000 nodes',
      rows: [['Same Tree from every start', '2000 × 1000 = 2 × 10⁶', 'ok', 'fits'], ['serialise both + KMP', 'O(m + n)', 'ok', 'faster']],
      aim: 'O(m · n), or O(m + n)',
      note: 'The simple check from every start fits easily.',
    },
    observe: [
      {
        title: 'A subtree takes everything below its start',
        text: 'The subtree at 4 is 4 with 1 and 2, all of them. If 2 had a child 0, the subtree at 4 would include it and no longer match [4, 1, 2].',
        sketch: { kind: 'array', rows: [{ items: [4, 1, 2], marks: { '0': 'hit', '1': 'hit', '2': 'hit' } }] },
      },
      {
        title: 'Try each node as the start',
        text: 'root = [3, 4, 5, 1, 2], subRoot = [4, 1, 2]. Starting at 3: the values differ (3 ≠ 4), no. Starting at 4: same value, and its children 1 and 2 match subRoot\'s children with the same shape: yes.',
        sketch: { kind: 'array', rows: [{ items: ['from 3: no', 'from 4: yes'], marks: { '0': 'bad', '1': 'hit' } }] },
      },
      {
        title: 'Each try is Same Tree',
        text: 'isSubtree(node) = same(node, subRoot) or isSubtree(left) or isSubtree(right). n starts, each costing up to m: O(m · n).',
        sketch: { kind: 'array', rows: [{ items: ['same(here)', '|| left', '|| right'] }] },
      },
    ],
    brute: {
      idea: 'Write every subtree of root out as its own string and compare each one with subRoot\'s string.',
      cost: 'O(n · m) plus n strings',
      waste: 'Serialising the subtree at every node rebuilds overlapping strings again and again; comparing nodes directly stops at the first difference.',
    },
    pattern: {
      pick: 'tree-dfs',
      why: 'For each node of root, check same(node, subRoot), then recurse left and right. O(m · n). Serialising both trees with null markers and searching one string in the other with KMP gives O(m + n).',
      not: [
        { id: 'string-matching', why: 'The O(m + n) version serialises the trees and uses KMP; the plain DFS is the expected first answer.' },
        { id: 'hashing', why: 'Hashing each subtree (value plus children\'s hashes) works too, with care about collisions.' },
      ],
    },
    watch: {
      viz: 'TreeWalkViz',
      inputs: [
        { label: '[3, 4, 5, 1, 2] and [4, 1, 2]', input: { mode: 'subtree', tree: [3, 4, 5, 1, 2], sub: [4, 1, 2] } },
        { label: 'with an extra 0 below 2', input: { mode: 'subtree', tree: [3, 4, 5, 1, 2, null, null, null, null, 0], sub: [4, 1, 2] } },
      ],
    },
    edges: [
      'The whole tree: [1, 2], [1, 2] → true.',
      'An extra node below: [3, 4, 5, 1, 2, null, null, null, null, 0], [4, 1, 2] → false.',
      'A single leaf: [1, 2, 3], [3] → true.',
    ],
  },

  'count-good-nodes-in-binary-tree': {
    aha: 'A node is good when it is at least as big as everything above it, and only the largest value on the path matters. So pass that one number down; each call adds 1 if its node is good, plus its children\'s counts.',
    asks: {
      read: 'Which words tell you what to carry down?',
      budget: 'Up to 10⁵ nodes. Can every node rescan its path?',
      observe: 'In [3, 1, 4, 3, null, 1, 5], which nodes are good, and what decides it?',
      brute: 'Keeping the whole path works. Which part of it is ever used?',
      pattern: 'What single number should each call pass to its children?',
      watch: 'Watch the path maximum flow down and counts come back up.',
    },
    read: [
      {
        phrase: 'no node on the path from the root to `X` has a value greater than `X`\'s value',
        says: 'A test against everything above: only the largest value above matters.',
      },
      { phrase: 'The root is always good', says: 'Start with the root\'s own value as the maximum.' },
      { phrase: 'carrying the largest value seen so far on the path', says: 'The method: context flows down, counts flow up.' },
    ],
    budget: { from: 'number of nodes ≤ 10⁵', n: 100000, aim: 'O(n)', note: 'Scanning the path at every node is O(n · h), up to 10¹⁰ on a chain.' },
    observe: [
      {
        title: 'Only the largest value above matters',
        text: 'For the lower 3 (under 1), the path above is 3, 1. The largest is 3, and 3 ≥ 3: good.',
        sketch: { kind: 'array', rows: [{ label: 'path to the lower 3', items: [3, 1, '3 ✓'], marks: { '2': 'hit' } }] },
      },
      {
        title: 'Carry one number down',
        text: 'Pass the path maximum to the children: 3 is good (the root); 1 is not (3 above it); the lower 3 is; 4 is (and raises the maximum to 4); then 1 under 4 is not, and 5 is.',
        sketch: {
          kind: 'array',
          rows: [{ items: ['3 ✓', '1 ✗', '3 ✓', '4 ✓', '1 ✗', '5 ✓'], marks: { '0': 'hit', '1': 'bad', '2': 'hit', '3': 'hit', '4': 'bad', '5': 'hit' } }],
        },
      },
      {
        title: 'Counts come back up',
        text: 'Each call returns the number of good nodes in its subtree: 1 or 0 for itself, plus both children\'s counts. Left of 3: 1; right: 2; total 1 + 1 + 2 = 4.',
        sketch: { kind: 'array', rows: [{ items: ['left: 1', 'right: 2', 'root: 1 + 1 + 2 = 4'], marks: { '2': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Keep the list of values on the current path, and at each node scan it for anything larger.',
      cost: 'O(n · h)',
      waste: 'Only the maximum of the path is ever used, but the whole path is rescanned at every node.',
    },
    pattern: {
      pick: 'tree-dfs',
      why: 'Top-down DFS carrying the maximum so far; a node is good when its value ≥ that maximum; return the counts up. O(n).',
      not: [
        {
          id: 'tree-bfs',
          why: 'A BFS queue of (node, maximum so far) works just as well; DFS is the natural fit because the maximum is a property of the path from the root.',
        },
        { id: 'monotonic-stack', why: 'A stack of the path would also answer, but only its maximum is ever needed.' },
      ],
    },
    watch: {
      viz: 'TreeDfsViz',
      inputs: [
        { label: '[3, 1, 4, 3, null, 1, 5]', input: { mode: 'good', tree: [3, 1, 4, 3, null, 1, 5] } },
        { label: '[3, 3, null, 4, 2]', input: { mode: 'good', tree: [3, 3, null, 4, 2] } },
      ],
    },
    edges: ['One node: [1] → 1.', 'Equal values count: [3, 3, null, 4, 2] → 3.', 'A falling chain: [5, 4, null, 3] → 1.'],
  },

  'lowest-common-ancestor-of-a-binary-tree': {
    aha: 'Ask each subtree "did you find p or q?": it returns the node it found, or null. The first node that hears back from both sides is where the paths to p and q split, so it is the answer. If a node is p or q itself, it returns itself, which covers one being the other\'s ancestor.',
    asks: {
      read: 'Which words let a node be its own ancestor, and what is guaranteed about p and q?',
      budget: 'Up to 10⁵ nodes. How many passes do you need?',
      observe: 'For p = 5 and q = 1, which side of 3 contains each of them?',
      brute: 'Recording both root-to-node paths works. What does it store?',
      pattern: 'What should each call return so its parent can tell where p and q are?',
      watch: 'Watch each subtree report what it found, until one node hears from both sides.',
    },
    read: [
      {
        phrase: 'the lowest node in the tree that has both of them as descendants',
        says: 'The deepest node whose subtree contains both: where the paths to p and q split.',
      },
      { phrase: 'a node counts as a descendant of itself', says: 'If p is above q, the answer is p itself.' },
      { phrase: 'both are in the tree', says: 'No need to check that both were found; a single found node can be returned as is.' },
    ],
    budget: { from: 'number of nodes ≤ 10⁵', n: 100000, aim: 'O(n)', note: 'One pass over the tree is enough.' },
    observe: [
      {
        title: 'Each subtree reports what it found',
        text: 'Ask each subtree: "do you contain p or q?" In the example, 3\'s left subtree reports 5 and its right subtree reports 1.',
        sketch: { kind: 'array', rows: [{ items: ['left of 3: found 5', 'right of 3: found 1'] }] },
      },
      {
        title: 'The first node hearing from both sides is the answer',
        text: '3 hears 5 from the left and 1 from the right, so the paths to 5 and 1 split at 3: the answer is 3.',
        sketch: { kind: 'array', rows: [{ items: ['5', '3', '1'], marks: { '1': 'hit' } }], caption: 'the split point' },
      },
      {
        title: 'A node can be its own ancestor',
        text: 'For 5 and 4 (4 is below 5): the search reaches 5 and returns it at once. 3\'s right side finds nothing, so 5 comes back up as the answer.',
        sketch: { kind: 'array', rows: [{ items: ['5 returns itself', '3 hears 5 and null → 5'], marks: { '0': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Record the path from the root to p and the path to q, then find the last node they share.',
      cost: 'O(n) time, O(h) extra',
      waste: 'Two searches and two stored paths, when one pass can decide on the way back up.',
    },
    pattern: {
      pick: 'tree-dfs',
      why: 'Post-order DFS: return the node if it is p or q; otherwise ask both sides; if both return something, this node is the LCA; else return whichever side found something. O(n).',
      not: [
        { id: 'bst-patterns', why: 'In a binary search tree you can walk down by comparing values; this is any binary tree.' },
        { id: 'graph-traversal', why: 'Parent pointers plus a set of p\'s ancestors works too, with an extra pass and extra memory.' },
      ],
    },
    watch: {
      viz: 'TreeDfsViz',
      inputs: [
        { label: 'p = 7, q = 4', input: { mode: 'lca', tree: [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], p: 7, q: 4 } },
        { label: 'p = 5, q = 1', input: { mode: 'lca', tree: [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], p: 5, q: 1 } },
      ],
    },
    edges: [
      'One is the other\'s ancestor: [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], 5, 4 → 5.',
      'Two nodes: [1, 2], 1, 2 → 1.',
      'Leaves on opposite sides: [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], 6, 8 → 3.',
    ],
  },

  'construct-binary-tree-from-preorder-and-inorder-traversal': {
    aha: 'Preorder starts with the root. Find that root in inorder: everything before it is the left subtree, everything after it the right subtree. Recurse on both sides, taking the next preorder values as their roots. A map from value to inorder index makes each split O(1).',
    asks: {
      read: 'Which words make a value-to-index map possible?',
      budget: 'Up to 3000 values. What does searching inorder for each root cost?',
      observe: 'With preorder [3, 9, 20, 15, 7] and inorder [9, 3, 15, 20, 7], which values are left of the root, and which right?',
      brute: 'Searching inorder for each root works. What is searched again and again?',
      pattern: 'Each root splits a range in two. Which kind of recursion is that?',
      watch: 'Watch each preorder value become the root of its inorder range.',
    },
    read: [
      {
        phrase: 'the preorder and inorder traversals of the same binary tree',
        says: 'Preorder gives roots in order; inorder tells what is left and right of each root.',
      },
      { phrase: 'whose values are all distinct', says: 'Each value has one inorder position: a hash map can find it.' },
      {
        phrase: 'A hash map from value to inorder index avoids searching for the root each time',
        says: 'The speed-up: O(1) splits instead of a scan.',
      },
    ],
    budget: { from: 'preorder.length ≤ 3000', n: 3000, aim: 'O(n)', note: 'A linear search per root is O(n²) ≈ 9 × 10⁶, which fits; a map makes it O(n).' },
    observe: [
      {
        title: 'Preorder starts with the root',
        text: '3 comes first in preorder, because preorder writes each node before its subtrees: 3 is the root.',
        sketch: { kind: 'array', rows: [{ label: 'preorder', items: [3, 9, 20, 15, 7], marks: { '0': 'hit' } }] },
      },
      {
        title: 'Inorder splits around the root',
        text: 'In inorder, 3 is at index 1: [9] is its left subtree, [15, 20, 7] its right subtree.',
        sketch: {
          kind: 'array',
          rows: [
            {
              label: 'inorder',
              items: [9, 3, 15, 20, 7],
              marks: { '1': 'hit' },
              bands: [{ from: 0, to: 0, tone: 'accent', label: 'left' }, { from: 2, to: 4, tone: 'ghost', label: 'right' }],
            },
          ],
        },
      },
      {
        title: 'Recurse, taking preorder values in turn',
        text: 'The next preorder value, 9, is the root of the left part [9]. Then 20 is the root of [15, 20, 7], splitting it into [15] and [7].',
        sketch: { kind: 'array', rows: [{ label: 'preorder', items: [3, 9, 20, 15, 7], marks: { '1': 'hit', '2': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'The same recursion, but find each root by scanning the inorder range.',
      cost: 'O(n²)',
      waste: 'Each scan searches for a value whose position never changes; values are distinct, so a map finds it at once.',
    },
    pattern: {
      pick: 'tree-dfs',
      why: 'Divide and conquer over inorder ranges: the next preorder value is the root; its inorder index (from a map) splits the range into left and right; build left, then right. O(n).',
      not: [
        {
          id: 'divide-and-conquer',
          why: 'A map from value to its inorder index only speeds up finding each split point; the idea is the recursive split by the root.',
        },
        { id: 'hashing', why: 'The map only speeds up finding each split.' },
      ],
    },
    watch: {
      viz: 'TreeWalkViz',
      inputs: [
        { label: '[3,9,20,15,7] and [9,3,15,20,7]', input: { mode: 'build', pre: [3, 9, 20, 15, 7], ino: [9, 3, 15, 20, 7] } },
        { label: '[1,2,3] and [2,1,3]', input: { mode: 'build', pre: [1, 2, 3], ino: [2, 1, 3] } },
      ],
    },
    edges: [
      'One node: [1], [1] → [1].',
      'A left chain: [3, 2, 1], [1, 2, 3] → [3, 2, null, 1].',
      'A right chain: [1, 2, 3], [1, 2, 3] → [1, null, 2, null, 3].',
    ],
  },

  'construct-quad-tree': {
    aha: 'A square whose cells all match is one leaf; any other square splits into four quarters, each built the same way. Build the four quarters first: if they are all leaves with the same value, merge them into one leaf. Every cell is read once.',
    asks: {
      read: 'Which words say when a square stops splitting, and how it splits?',
      budget: 'n ≤ 64. Is rescanning squares at every level a problem?',
      observe: 'In the 4 × 4 example, which quarters are uniform and which must split?',
      brute: 'Scanning each square before splitting works. Which cells are scanned more than once?',
      pattern: 'If the four quarters are already built, how do you decide about the whole square?',
      watch: 'Step through the quarters: uniform ones become leaves, mixed ones split.',
    },
    read: [
      { phrase: 'if every cell in the region has the same value, the node is a leaf', says: 'Uniform square: stop, one leaf with that value.' },
      {
        phrase: 'the region is split into four equal quarters, each built the same way',
        says: 'Otherwise recurse into four quarters: divide and conquer.',
      },
      { phrase: '`n` is a power of 2', says: 'The quarters always split evenly, down to single cells.' },
    ],
    budget: {
      from: 'n ≤ 64 (4096 cells)',
      rows: [['scan, then split (top-down)', 'n² log n', 'ok', 'fits'], ['build quarters, then merge', 'n²', 'ok', 'fits']],
      aim: 'O(n²)',
      note: 'Both fit; bottom-up reads each cell once.',
    },
    observe: [
      {
        title: 'A uniform square is one leaf',
        text: 'The top-left quarter is all 1s and the top-right all 0s: each becomes a single leaf, however many cells it covers.',
        sketch: {
          kind: 'grid',
          grid: [['1', '1', '0', '0'], ['1', '1', '0', '0'], ['0', '0', '0', '0'], ['0', '1', '0', '0']],
          labels: {
            '0,0': '1',
            '0,1': '1',
            '0,2': '0',
            '0,3': '0',
            '1,0': '1',
            '1,1': '1',
            '1,2': '0',
            '1,3': '0',
            '2,0': '0',
            '2,1': '0',
            '2,2': '0',
            '2,3': '0',
            '3,0': '0',
            '3,1': '1',
            '3,2': '0',
            '3,3': '0',
          },
          marks: { '0,0': 'hit', '0,1': 'hit', '1,0': 'hit', '1,1': 'hit', '0,2': 'ring', '0,3': 'ring', '1,2': 'ring', '1,3': 'ring' },
          caption: 'top-left: leaf 1 · top-right: leaf 0',
        },
      },
      {
        title: 'A mixed square splits into four',
        text: 'The bottom-left quarter has a 1 among 0s, so it splits again, into four single cells, each a leaf.',
        sketch: {
          kind: 'grid',
          grid: [['1', '1', '0', '0'], ['1', '1', '0', '0'], ['0', '0', '0', '0'], ['0', '1', '0', '0']],
          labels: {
            '0,0': '1',
            '0,1': '1',
            '0,2': '0',
            '0,3': '0',
            '1,0': '1',
            '1,1': '1',
            '1,2': '0',
            '1,3': '0',
            '2,0': '0',
            '2,1': '0',
            '2,2': '0',
            '2,3': '0',
            '3,0': '0',
            '3,1': '1',
            '3,2': '0',
            '3,3': '0',
          },
          marks: { '2,0': 'cur', '2,1': 'cur', '3,0': 'cur', '3,1': 'cur' },
          caption: 'bottom-left: mixed, split into 4',
        },
      },
      {
        title: 'Build the quarters first, then merge',
        text: 'Bottom-up: build the four children; if all four are leaves with the same value, replace them with one leaf. Each cell is read once: O(n²).',
        sketch: {
          kind: 'grid',
          grid: [['1', '1', '0', '0'], ['1', '1', '0', '0'], ['0', '0', '0', '0'], ['0', '1', '0', '0']],
          labels: {
            '0,0': '1',
            '0,1': '1',
            '0,2': '0',
            '0,3': '0',
            '1,0': '1',
            '1,1': '1',
            '1,2': '0',
            '1,3': '0',
            '2,0': '0',
            '2,1': '0',
            '2,2': '0',
            '2,3': '0',
            '3,0': '0',
            '3,1': '1',
            '3,2': '0',
            '3,3': '0',
          },
          marks: { '2,2': 'hit', '2,3': 'hit', '3,2': 'hit', '3,3': 'hit' },
          caption: 'bottom-right: four 0 leaves merge into one',
        },
      },
    ],
    brute: {
      idea: 'Top-down: for each square, scan all its cells; if they match it is a leaf, otherwise split into four and recurse.',
      cost: 'O(n² log n)',
      waste: 'A cell is rescanned at every level of splitting it belongs to.',
    },
    pattern: {
      pick: 'tree-dfs',
      why: 'Divide and conquer on quarters: build the four quarters recursively; if all four are leaves with the same value, return one leaf with that value, otherwise an inner node over them. O(n²).',
      not: [
        { id: 'divide-and-conquer', why: 'It is divide and conquer; the result is a tree, built from its children up.' },
        { id: 'prefix-sums', why: '2D prefix sums can test whether a square is uniform in O(1), which also makes top-down O(n²).' },
      ],
    },
    watch: {
      viz: 'QuadWalkViz',
      inputs: [
        { label: 'the 4 × 4 example', input: { mode: 'quad', g: [[1, 1, 0, 0], [1, 1, 0, 0], [0, 0, 0, 0], [0, 1, 0, 0]] } },
        { label: 'all zeros', input: { mode: 'quad', g: [[0, 0], [0, 0]] } },
      ],
    },
    edges: [
      'One cell: [[1]] → [[1,1]].',
      'All equal: [[0,0],[0,0]] → [[1,0]].',
      'Every cell different from its neighbour: [[0,1],[1,0]] → [[0,1],[1,0],[1,1],[1,1],[1,0]].',
    ],
  },

  'delete-leaves-with-a-given-value': {
    aha: 'Deleting a leaf can turn its parent into a target leaf, and so on upwards. Postorder handles the chain in one pass: clean both subtrees first and reattach what is left; only then can a node see whether it has become a target leaf.',
    asks: {
      read: 'Which words say deletions can chain upwards?',
      budget: 'Up to 3000 nodes. Do you need more than one pass?',
      observe: 'In [1, 2, 3, 2, null, 2, 4] with target 2, what happens to the left 2 once its child is gone?',
      brute: 'Repeating passes until nothing changes works. What does each extra pass rescan?',
      pattern: 'In which order must children and parent be decided, so one pass is enough?',
      watch: 'Watch children cleaned first, then each node decided.',
    },
    read: [
      { phrase: 'delete the parent too', says: 'Deleting can create new target leaves above.' },
      { phrase: 'keep going until no such leaf is left', says: 'The chain can climb several levels: decide parents after children.' },
    ],
    budget: { from: 'number of nodes ≤ 3000', n: 3000, aim: 'O(n)', note: 'Repeated passes can take O(n · h).' },
    observe: [
      {
        title: 'Deleting a leaf can make a new leaf',
        text: 'Under 1, the left 2 has a child 2. Delete that child, and the left 2 becomes a leaf with value 2: delete it too.',
        sketch: { kind: 'array', rows: [{ label: 'the left branch', items: [1, 2, 2], marks: { '1': 'bad', '2': 'bad' } }] },
      },
      {
        title: 'Children first, then the node',
        text: 'Postorder: clean both subtrees, reattach what is left, and only then decide about the node. Chains of deletions happen on the way up, in one pass.',
        sketch: { kind: 'array', rows: [{ items: ['del(left)', 'del(right)', 'then: leaf and value = target?'] }] },
      },
      {
        title: 'A target with a surviving child stays',
        text: 'Under 3, the 2 is a leaf: deleted. 3 keeps its child 4, so it stays. Result: [1, null, 3, null, 4].',
        sketch: { kind: 'array', rows: [{ items: [1, 'null', 3, 'null', 4] }] },
      },
    ],
    brute: {
      idea: 'Delete the current target leaves in one pass, then repeat the pass until nothing changes.',
      cost: 'O(n · h)',
      waste: 'Each repeat rescans the whole tree to find the few new leaves the last pass created.',
    },
    pattern: {
      pick: 'tree-dfs',
      why: 'Postorder DFS: node.left = del(node.left), node.right = del(node.right); then return null if the node is a leaf with the target value, otherwise the node. O(n).',
      not: [
        { id: 'tree-bfs', why: 'A level walk meets parents before children, so it can\'t know yet whether a parent will become a leaf.' },
        { id: 'linked-list-manipulation', why: 'Returning null to the parent to unlink a node is the same move as returning a new head.' },
      ],
    },
    watch: {
      viz: 'TreeWalkViz',
      inputs: [
        { label: '[1, 2, 3, 2, null, 2, 4], target 2', input: { mode: 'delete', tree: [1, 2, 3, 2, null, 2, 4], target: 2 } },
        { label: '[1, 1, 1], target 1', input: { mode: 'delete', tree: [1, 1, 1], target: 1 } },
      ],
    },
    edges: ['Everything deleted: [1, 1, 1], 1 → [].', 'Nothing to delete: [1, 2, 3], 5 → [1, 2, 3].', 'A chain: [1, 2, null, 2, null, 2], 2 → [1].'],
  },

  'serialize-and-deserialize-binary-tree': {
    aha: 'Preorder alone is ambiguous, but preorder with a marker (#) for every missing child is not: the reader always knows when a subtree has ended. Write node, left, right; read the tokens back in the same order, building node, left, right.',
    asks: {
      read: 'Which words leave the format up to you, and what must it carry?',
      budget: 'Up to 10⁵ nodes. How many tokens will the string need?',
      observe: 'Preorder 1, 2 fits two different trees. What extra information separates them?',
      brute: 'Storing each node with its parent and side works. How much does it store per node?',
      pattern: 'If every empty child is written down, how does the reader know where a subtree ends?',
      watch: 'Watch the tree written with # markers, then rebuilt token by token.',
    },
    read: [
      { phrase: 'You choose the format', says: 'Any format works if it can be read back unambiguously.' },
      { phrase: 'the string must carry everything', says: 'Values and shape: where every missing child is.' },
    ],
    budget: { from: 'number of nodes ≤ 10⁵', n: 100000, aim: 'O(n)', note: 'n values plus n + 1 markers: one token per node and per empty slot.' },
    observe: [
      {
        title: 'Preorder alone is ambiguous',
        text: 'Preorder 1, 2 fits both [1, 2] (2 on the left) and [1, null, 2] (2 on the right). The string must also say where subtrees end.',
        sketch: {
          kind: 'array',
          rows: [{ label: '[1, 2]', items: [1, 2] }, { label: '[1, null, 2]', items: [1, 2] }],
          caption: 'the same preorder for two different trees',
        },
      },
      {
        title: 'Mark every missing child',
        text: 'Write # for each null: [1, 2, 3, null, null, 4, 5] becomes 1, 2, #, #, 3, 4, #, #, 5, #, #. Now every subtree visibly ends.',
        sketch: {
          kind: 'array',
          rows: [
            {
              items: ['1', '2', '#', '#', '3', '4', '#', '#', '5', '#', '#'],
              marks: { '2': 'dim', '3': 'dim', '6': 'dim', '7': 'dim', '9': 'dim', '10': 'dim' },
            },
          ],
        },
      },
      {
        title: 'Read it back in the same order',
        text: 'Take the next token: # means empty; a value makes a node, then read its left subtree, then its right. The tokens are used up exactly when the tree is complete.',
        sketch: { kind: 'array', rows: [{ items: ['1 → node', '2 → its left', '# → 2 has no left', '# → 2 has no right', '3 → 1\'s right'] }] },
      },
    ],
    brute: {
      idea: 'Store every node as (value, parent index, left or right) and rebuild from those triples.',
      cost: 'O(n)',
      waste: 'Three numbers per node and a parent lookup, when one token per node and per empty slot is enough.',
    },
    pattern: {
      pick: 'tree-dfs',
      why: 'Preorder DFS with a marker for every null: serialise writes node, left, right; deserialise reads tokens in the same order, building node, left, right. O(n) both ways. Level order with null markers (the test format) works too.',
      not: [
        { id: 'tree-bfs', why: 'Level order with null markers is the other standard answer, using a queue on both sides.' },
        { id: 'string-matching', why: 'Splitting and joining tokens is all the string work there is.' },
      ],
    },
    watch: {
      viz: 'TreeWalkViz',
      inputs: [
        { label: '[1, 2, 3, null, null, 4, 5]', input: { mode: 'serialize', tree: [1, 2, 3, null, null, 4, 5] } },
        { label: '[1, 2]', input: { mode: 'serialize', tree: [1, 2] } },
      ],
    },
    edges: ['Empty tree: [] → [].', 'One node: [1] → [1].', 'Negative values: [−1, 2] → [−1, 2]; keep the minus sign in the token.'],
  },
};
