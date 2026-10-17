export default [
  {
    slug: 'maximum-depth-of-binary-tree', title: 'Maximum Depth of Binary Tree', level: 'Easy',
    summary: 'Return the number of nodes on the longest path from the root down to a leaf. Trees are given in level order with null for missing children.',
    method: 'maxDepth', params: [['TreeNode', 'root']], returns: 'int',
    tests: [
      { in: [[3, 9, 20, null, null, 15, 7]], out: 3 },
      { in: [[1, null, 2]], out: 2 },
      { in: [[]], out: 0 },
      { in: [[1, 2, null, 3, null, 4]] },
    ],
    ref: `class Solution {
    public int maxDepth(TreeNode root) { return root == null ? 0 : 1 + Math.max(maxDepth(root.left), maxDepth(root.right)); }
}`,
  },
  {
    slug: 'same-tree', title: 'Same Tree', level: 'Easy',
    summary: 'Return whether two binary trees have the same shape and the same values.',
    method: 'isSameTree', params: [['TreeNode', 'p'], ['TreeNode', 'q']], returns: 'boolean',
    tests: [
      { in: [[1, 2, 3], [1, 2, 3]], out: true },
      { in: [[1, 2], [1, null, 2]], out: false },
      { in: [[1, 2, 1], [1, 1, 2]], out: false },
      { in: [[], []] },
      { in: [[5], []] },
    ],
    ref: `class Solution {
    public boolean isSameTree(TreeNode p, TreeNode q) {
        if (p == null || q == null) return p == q;
        return p.val == q.val && isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
    }
}`,
  },
  {
    slug: 'invert-binary-tree', title: 'Invert Binary Tree', level: 'Easy',
    summary: 'Mirror the tree (swap every node\'s left and right children) and return its root.',
    method: 'invertTree', params: [['TreeNode', 'root']], returns: 'TreeNode',
    tests: [
      { in: [[4, 2, 7, 1, 3, 6, 9]], out: [4, 7, 2, 9, 6, 3, 1] },
      { in: [[2, 1, 3]], out: [2, 3, 1] },
      { in: [[]], out: [] },
      { in: [[1, 2]] },
    ],
    ref: `class Solution {
    public TreeNode invertTree(TreeNode root) {
        if (root == null) return null;
        TreeNode l = invertTree(root.left);
        root.left = invertTree(root.right); root.right = l;
        return root;
    }
}`,
  },
  {
    slug: 'symmetric-tree', title: 'Symmetric Tree', level: 'Easy',
    summary: 'Return whether the tree is a mirror image of itself around its centre.',
    method: 'isSymmetric', params: [['TreeNode', 'root']], returns: 'boolean',
    tests: [
      { in: [[1, 2, 2, 3, 4, 4, 3]], out: true },
      { in: [[1, 2, 2, null, 3, null, 3]], out: false },
      { in: [[1]] },
      { in: [[1, 2, 2, 2, null, 2]] },
    ],
    ref: `class Solution {
    public boolean isSymmetric(TreeNode root) { return mirror(root.left, root.right); }
    private boolean mirror(TreeNode a, TreeNode b) {
        if (a == null || b == null) return a == b;
        return a.val == b.val && mirror(a.left, b.right) && mirror(a.right, b.left);
    }
}`,
  },
  {
    slug: 'path-sum', title: 'Path Sum', level: 'Easy',
    summary: 'Return whether some root-to-leaf path has values summing to targetSum.',
    method: 'hasPathSum', params: [['TreeNode', 'root'], ['int', 'targetSum']], returns: 'boolean',
    tests: [
      { in: [[5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1], 22], out: true },
      { in: [[1, 2, 3], 5], out: false },
      { in: [[], 0], out: false },
      { in: [[1, 2], 1] },
      { in: [[-2, null, -3], -5] },
    ],
    ref: `class Solution {
    public boolean hasPathSum(TreeNode root, int targetSum) {
        if (root == null) return false;
        if (root.left == null && root.right == null) return targetSum == root.val;
        return hasPathSum(root.left, targetSum - root.val) || hasPathSum(root.right, targetSum - root.val);
    }
}`,
  },
  {
    slug: 'balanced-binary-tree', title: 'Balanced Binary Tree', level: 'Easy',
    summary: 'Return whether, at every node, the heights of the left and right subtrees differ by at most one.',
    method: 'isBalanced', params: [['TreeNode', 'root']], returns: 'boolean',
    tests: [
      { in: [[3, 9, 20, null, null, 15, 7]], out: true },
      { in: [[1, 2, 2, 3, 3, null, null, 4, 4]], out: false },
      { in: [[]], out: true },
      { in: [[1, 2, 2, 3, null, null, 3, 4, null, null, 4]] },
    ],
    ref: `class Solution {
    public boolean isBalanced(TreeNode root) { return height(root) >= 0; }
    private int height(TreeNode n) {
        if (n == null) return 0;
        int l = height(n.left), r = height(n.right);
        if (l < 0 || r < 0 || Math.abs(l - r) > 1) return -1;
        return 1 + Math.max(l, r);
    }
}`,
  },
  {
    slug: 'count-good-nodes-in-binary-tree', title: 'Count Good Nodes in Binary Tree', level: 'Medium',
    summary: 'A node is good if no node on the path from the root to it has a greater value. Count the good nodes.',
    method: 'goodNodes', params: [['TreeNode', 'root']], returns: 'int',
    tests: [
      { in: [[3, 1, 4, 3, null, 1, 5]], out: 4 },
      { in: [[3, 3, null, 4, 2]], out: 3 },
      { in: [[1]], out: 1 },
      { in: [[9, null, 3, 6]] },
    ],
    ref: `class Solution {
    public int goodNodes(TreeNode root) { return count(root, Integer.MIN_VALUE); }
    private int count(TreeNode n, int max) {
        if (n == null) return 0;
        int m = Math.max(max, n.val);
        return (n.val >= max ? 1 : 0) + count(n.left, m) + count(n.right, m);
    }
}`,
  },
  {
    slug: 'lowest-common-ancestor-of-a-binary-tree', title: 'Lowest Common Ancestor of a Binary Tree', level: 'Medium',
    summary: 'Return the lowest node that has both p and q as descendants (a node counts as its own descendant). The tests give p and q by value (values are unique); the judge prints the value of the node you return.',
    method: 'lowestCommonAncestor', params: [['TreeNode', 'root'], ['int', 'p'], ['int', 'q']],
    starterParams: [['TreeNode', 'root'], ['TreeNode', 'p'], ['TreeNode', 'q']], returns: 'TreeNode',
    call: 'TreeNode t = BCBT.T($0); Object r = BCBT.val(s.lowestCommonAncestor(t, BCBT.find(t, BCB.I($1)), BCBT.find(t, BCB.I($2))));',
    tests: [
      { in: [[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], 5, 1], out: 3 },
      { in: [[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], 5, 4], out: 5 },
      { in: [[1, 2], 1, 2], out: 1 },
      { in: [[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], 7, 6] },
    ],
    ref: `class Solution {
    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        if (root == null || root == p || root == q) return root;
        TreeNode l = lowestCommonAncestor(root.left, p, q), r = lowestCommonAncestor(root.right, p, q);
        return l != null && r != null ? root : l != null ? l : r;
    }
}`,
  },
  {
    slug: 'construct-binary-tree-from-preorder-and-inorder-traversal', title: 'Construct Binary Tree from Preorder and Inorder Traversal', level: 'Medium',
    summary: 'Rebuild the binary tree (unique values) from its preorder and inorder traversals and return its root.',
    method: 'buildTree', params: [['int[]', 'preorder'], ['int[]', 'inorder']], returns: 'TreeNode',
    tests: [
      { in: [[3, 9, 20, 15, 7], [9, 3, 15, 20, 7]], out: [3, 9, 20, null, null, 15, 7] },
      { in: [[-1], [-1]], out: [-1] },
      { in: [[1, 2], [2, 1]] },
      { in: [[1, 2, 3], [1, 2, 3]] },
      { in: [[4, 2, 1, 3, 6, 5, 7], [1, 2, 3, 4, 5, 6, 7]] },
    ],
    ref: `class Solution {
    private int pre = 0;
    private final Map<Integer, Integer> at = new HashMap<>();
    public TreeNode buildTree(int[] preorder, int[] inorder) {
        for (int i = 0; i < inorder.length; i++) at.put(inorder[i], i);
        return build(preorder, 0, inorder.length - 1);
    }
    private TreeNode build(int[] preorder, int lo, int hi) {
        if (lo > hi) return null;
        TreeNode n = new TreeNode(preorder[pre++]);
        int mid = at.get(n.val);
        n.left = build(preorder, lo, mid - 1); n.right = build(preorder, mid + 1, hi);
        return n;
    }
}`,
  },
  {
    slug: 'serialize-and-deserialize-binary-tree', title: 'Serialize and Deserialize Binary Tree', level: 'Hard',
    summary: 'Design Codec: serialize(root) turns a tree into a string, deserialize(data) rebuilds the same tree. Any format works. The judge serialises with one Codec, deserialises with another, and prints the rebuilt tree.',
    design: { cls: 'Codec', ctor: [], methods: [['String', 'serialize', [['TreeNode', 'root']]], ['TreeNode', 'deserialize', [['String', 'data']]]] },
    params: [['TreeNode', 'root']],
    call: 'Codec ser = new Codec(), deser = new Codec(); Object r = deser.deserialize(ser.serialize(BCBT.T($0))); if (r == null) r = new ArrayList<>();',
    tests: [
      { in: [[1, 2, 3, null, null, 4, 5]], out: [1, 2, 3, null, null, 4, 5] },
      { in: [[]], out: [] },
      { in: [[-1000]] },
      { in: [[1, null, 2, null, 3, null, 4]] },
      { in: [[5, 4, 7, 3, null, 2, null, -1, null, 9]] },
    ],
    ref: `class Codec {
    public String serialize(TreeNode root) {
        StringBuilder sb = new StringBuilder();
        write(root, sb);
        return sb.toString();
    }
    private void write(TreeNode n, StringBuilder sb) {
        if (n == null) { sb.append("#,"); return; }
        sb.append(n.val).append(',');
        write(n.left, sb); write(n.right, sb);
    }
    public TreeNode deserialize(String data) { return read(new ArrayDeque<>(Arrays.asList(data.split(",")))); }
    private TreeNode read(Deque<String> q) {
        String s = q.poll();
        if (s == null || s.equals("#")) return null;
        TreeNode n = new TreeNode(Integer.parseInt(s));
        n.left = read(q); n.right = read(q);
        return n;
    }
}`,
  },
];
