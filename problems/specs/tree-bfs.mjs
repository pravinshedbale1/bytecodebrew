export default [
  {
    slug: 'binary-tree-level-order-traversal', title: 'Binary Tree Level Order Traversal', level: 'Medium',
    summary: 'Return the node values level by level, left to right.',
    method: 'levelOrder', params: [['TreeNode', 'root']], returns: 'List<List<Integer>>',
    tests: [
      { in: [[3, 9, 20, null, null, 15, 7]], out: [[3], [9, 20], [15, 7]] },
      { in: [[1]], out: [[1]] },
      { in: [[]], out: [] },
      { in: [[1, 2, 3, 4, null, null, 5]] },
    ],
    ref: `class Solution {
    public List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> out = new ArrayList<>();
        Deque<TreeNode> q = new ArrayDeque<>();
        if (root != null) q.add(root);
        while (!q.isEmpty()) {
            List<Integer> level = new ArrayList<>();
            for (int k = q.size(); k > 0; k--) { TreeNode n = q.poll(); level.add(n.val); if (n.left != null) q.add(n.left); if (n.right != null) q.add(n.right); }
            out.add(level);
        }
        return out;
    }
}`,
  },
  {
    slug: 'average-of-levels-in-binary-tree', title: 'Average of Levels in Binary Tree', level: 'Easy',
    summary: 'Return the average value of the nodes on each level, top to bottom (answers within 10^-5 are accepted).',
    method: 'averageOfLevels', params: [['TreeNode', 'root']], returns: 'List<Double>',
    tests: [
      { in: [[3, 9, 20, null, null, 15, 7]], out: [3.0, 14.5, 11.0] },
      { in: [[3, 9, 20, 15, 7]], out: [3.0, 14.5, 11.0] },
      { in: [[2147483647, 2147483647, 2147483647]] },
      { in: [[-5]] },
    ],
    ref: `class Solution {
    public List<Double> averageOfLevels(TreeNode root) {
        List<Double> out = new ArrayList<>();
        Deque<TreeNode> q = new ArrayDeque<>();
        q.add(root);
        while (!q.isEmpty()) {
            int k = q.size(); long sum = 0;
            for (int i = 0; i < k; i++) { TreeNode n = q.poll(); sum += n.val; if (n.left != null) q.add(n.left); if (n.right != null) q.add(n.right); }
            out.add((double) sum / k);
        }
        return out;
    }
}`,
  },
  {
    slug: 'minimum-depth-of-binary-tree', title: 'Minimum Depth of Binary Tree', level: 'Easy',
    summary: 'Return the number of nodes on the shortest path from the root down to a leaf.',
    method: 'minDepth', params: [['TreeNode', 'root']], returns: 'int',
    tests: [
      { in: [[3, 9, 20, null, null, 15, 7]], out: 2 },
      { in: [[2, null, 3, null, 4, null, 5, null, 6]], out: 5 },
      { in: [[]], out: 0 },
      { in: [[1, 2]] },
    ],
    ref: `class Solution {
    public int minDepth(TreeNode root) {
        if (root == null) return 0;
        Deque<TreeNode> q = new ArrayDeque<>();
        q.add(root);
        for (int depth = 1; ; depth++) {
            for (int k = q.size(); k > 0; k--) {
                TreeNode n = q.poll();
                if (n.left == null && n.right == null) return depth;
                if (n.left != null) q.add(n.left);
                if (n.right != null) q.add(n.right);
            }
        }
    }
}`,
  },
  {
    slug: 'binary-tree-right-side-view', title: 'Binary Tree Right Side View', level: 'Medium',
    summary: 'Standing to the right of the tree, return the values you see from top to bottom (the last node of each level).',
    method: 'rightSideView', params: [['TreeNode', 'root']], returns: 'List<Integer>',
    tests: [
      { in: [[1, 2, 3, null, 5, null, 4]], out: [1, 3, 4] },
      { in: [[1, 2, 3, 4, null, null, null, 5]], out: [1, 3, 4, 5] },
      { in: [[1, null, 3]], out: [1, 3] },
      { in: [[]], out: [] },
    ],
    ref: `class Solution {
    public List<Integer> rightSideView(TreeNode root) {
        List<Integer> out = new ArrayList<>();
        Deque<TreeNode> q = new ArrayDeque<>();
        if (root != null) q.add(root);
        while (!q.isEmpty()) {
            for (int k = q.size(); k > 0; k--) {
                TreeNode n = q.poll();
                if (k == 1) out.add(n.val);
                if (n.left != null) q.add(n.left);
                if (n.right != null) q.add(n.right);
            }
        }
        return out;
    }
}`,
  },
  {
    slug: 'binary-tree-zigzag-level-order-traversal', title: 'Binary Tree Zigzag Level Order Traversal', level: 'Medium',
    summary: 'Return the values level by level, alternating left-to-right and right-to-left (starting left-to-right).',
    method: 'zigzagLevelOrder', params: [['TreeNode', 'root']], returns: 'List<List<Integer>>',
    tests: [
      { in: [[3, 9, 20, null, null, 15, 7]], out: [[3], [20, 9], [15, 7]] },
      { in: [[1]], out: [[1]] },
      { in: [[]], out: [] },
      { in: [[1, 2, 3, 4, 5, 6, 7, 8]] },
    ],
    ref: `class Solution {
    public List<List<Integer>> zigzagLevelOrder(TreeNode root) {
        List<List<Integer>> out = new ArrayList<>();
        Deque<TreeNode> q = new ArrayDeque<>();
        if (root != null) q.add(root);
        boolean leftToRight = true;
        while (!q.isEmpty()) {
            LinkedList<Integer> level = new LinkedList<>();
            for (int k = q.size(); k > 0; k--) {
                TreeNode n = q.poll();
                if (leftToRight) level.addLast(n.val); else level.addFirst(n.val);
                if (n.left != null) q.add(n.left);
                if (n.right != null) q.add(n.right);
            }
            out.add(level); leftToRight = !leftToRight;
        }
        return out;
    }
}`,
  },
  {
    slug: 'find-largest-value-in-each-tree-row', title: 'Find Largest Value in Each Tree Row', level: 'Medium',
    summary: 'Return the largest value on each level of the tree, top to bottom.',
    method: 'largestValues', params: [['TreeNode', 'root']], returns: 'List<Integer>',
    tests: [
      { in: [[1, 3, 2, 5, 3, null, 9]], out: [1, 3, 9] },
      { in: [[1, 2, 3]], out: [1, 3] },
      { in: [[]], out: [] },
      { in: [[-2147483648, -2147483648]] },
    ],
    ref: `class Solution {
    public List<Integer> largestValues(TreeNode root) {
        List<Integer> out = new ArrayList<>();
        Deque<TreeNode> q = new ArrayDeque<>();
        if (root != null) q.add(root);
        while (!q.isEmpty()) {
            int best = Integer.MIN_VALUE;
            for (int k = q.size(); k > 0; k--) { TreeNode n = q.poll(); best = Math.max(best, n.val); if (n.left != null) q.add(n.left); if (n.right != null) q.add(n.right); }
            out.add(best);
        }
        return out;
    }
}`,
  },
  {
    slug: 'populating-next-right-pointers-in-each-node', title: 'Populating Next Right Pointers in Each Node', level: 'Medium',
    summary: 'In a perfect binary tree, set each node\'s next pointer to the node on its right on the same level (null at the end). The judge prints each level via next pointers, ending each level with "#".',
    method: 'connect', params: [['Node', 'root']], returns: 'Node', uses: ['NextNode'],
    call: 'Object r = BCBX.dump(s.connect(BCBX.build($0)));',
    tests: [
      { in: [[1, 2, 3, 4, 5, 6, 7]], out: ['1', '#', '2', '3', '#', '4', '5', '6', '7', '#'] },
      { in: [[]], out: [] },
      { in: [[1]] },
      { in: [[1, 2, 3]] },
    ],
    ref: `class Solution {
    public Node connect(Node root) {
        for (Node level = root; level != null && level.left != null; level = level.left)
            for (Node n = level; n != null; n = n.next) { n.left.next = n.right; if (n.next != null) n.right.next = n.next.left; }
        return root;
    }
}`,
  },
  {
    slug: 'maximum-width-of-binary-tree', title: 'Maximum Width of Binary Tree', level: 'Medium',
    summary: 'A level\'s width is the distance between its leftmost and rightmost non-null nodes, counting the null positions in between as if the tree were complete. Return the maximum width.',
    method: 'widthOfBinaryTree', params: [['TreeNode', 'root']], returns: 'int',
    tests: [
      { in: [[1, 3, 2, 5, 3, null, 9]], out: 4 },
      { in: [[1, 3, 2, 5, null, null, 9, 6, null, 7]], out: 7 },
      { in: [[1, 3, 2, 5]], out: 2 },
      { in: [[1]] },
    ],
    ref: `class Solution {
    public int widthOfBinaryTree(TreeNode root) {
        Deque<Object[]> q = new ArrayDeque<>();
        q.add(new Object[] { root, 0L });
        long best = 0;
        while (!q.isEmpty()) {
            int k = q.size(); long first = (long) q.peek()[1], last = first;
            for (int i = 0; i < k; i++) {
                Object[] e = q.poll(); TreeNode n = (TreeNode) e[0]; long idx = (long) e[1] - first; last = idx;
                if (n.left != null) q.add(new Object[] { n.left, 2 * idx });
                if (n.right != null) q.add(new Object[] { n.right, 2 * idx + 1 });
            }
            best = Math.max(best, last + 1);
        }
        return (int) best;
    }
}`,
  },
];
