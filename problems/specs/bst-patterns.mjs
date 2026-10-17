export default [
  {
    slug: 'search-in-a-binary-search-tree', title: 'Search in a Binary Search Tree', level: 'Easy',
    summary: 'Return the subtree rooted at the node with value val, or an empty tree if no node has it.',
    method: 'searchBST', params: [['TreeNode', 'root'], ['int', 'val']], returns: 'TreeNode',
    tests: [
      { in: [[4, 2, 7, 1, 3], 2], out: [2, 1, 3] },
      { in: [[4, 2, 7, 1, 3], 5], out: [] },
      { in: [[1], 1] },
      { in: [[8, 3, 10, 1, 6, null, 14, null, null, 4, 7], 6] },
    ],
    ref: `class Solution {
    public TreeNode searchBST(TreeNode root, int val) {
        while (root != null && root.val != val) root = val < root.val ? root.left : root.right;
        return root;
    }
}`,
  },
  {
    slug: 'convert-sorted-array-to-binary-search-tree', title: 'Convert Sorted Array to Binary Search Tree', level: 'Easy',
    summary: 'Build a height-balanced BST from a sorted array. Any balanced answer is accepted.',
    method: 'sortedArrayToBST', params: [['int[]', 'nums']], returns: 'TreeNode', check: 'custom:balancedBst',
    tests: [
      { in: [[-10, -3, 0, 5, 9]] },
      { in: [[1, 3]] },
      { in: [[0]] },
      { in: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]] },
    ],
    ref: `class Solution {
    public TreeNode sortedArrayToBST(int[] nums) { return build(nums, 0, nums.length - 1); }
    private TreeNode build(int[] a, int lo, int hi) {
        if (lo > hi) return null;
        int mid = (lo + hi) >>> 1;
        return new TreeNode(a[mid], build(a, lo, mid - 1), build(a, mid + 1, hi));
    }
}`,
  },
  {
    slug: 'lowest-common-ancestor-of-a-binary-search-tree', title: 'Lowest Common Ancestor of a Binary Search Tree', level: 'Medium',
    summary: 'In a BST, return the lowest node that has both p and q as descendants (a node is its own descendant). Tests give p and q by value; the judge prints the returned node\'s value.',
    method: 'lowestCommonAncestor', params: [['TreeNode', 'root'], ['int', 'p'], ['int', 'q']],
    starterParams: [['TreeNode', 'root'], ['TreeNode', 'p'], ['TreeNode', 'q']], returns: 'TreeNode',
    call: 'TreeNode t = BCBT.T($0); Object r = BCBT.val(s.lowestCommonAncestor(t, BCBT.find(t, BCB.I($1)), BCBT.find(t, BCB.I($2))));',
    tests: [
      { in: [[6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], 2, 8], out: 6 },
      { in: [[6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], 2, 4], out: 2 },
      { in: [[2, 1], 2, 1], out: 2 },
      { in: [[6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], 3, 5] },
    ],
    ref: `class Solution {
    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        while (true) {
            if (p.val < root.val && q.val < root.val) root = root.left;
            else if (p.val > root.val && q.val > root.val) root = root.right;
            else return root;
        }
    }
}`,
  },
  {
    slug: 'validate-binary-search-tree', title: 'Validate Binary Search Tree', level: 'Medium',
    summary: 'Return whether the tree is a valid BST: every left subtree holds strictly smaller values and every right subtree strictly larger ones.',
    method: 'isValidBST', params: [['TreeNode', 'root']], returns: 'boolean',
    tests: [
      { in: [[2, 1, 3]], out: true },
      { in: [[5, 1, 4, null, null, 3, 6]], out: false },
      { in: [[5, 4, 6, null, null, 3, 7]], out: false },
      { in: [[2147483647]] },
      { in: [[2, 2, 2]] },
      { in: [[-2147483648, null, 2147483647]] },
    ],
    ref: `class Solution {
    public boolean isValidBST(TreeNode root) { return valid(root, Long.MIN_VALUE, Long.MAX_VALUE); }
    private boolean valid(TreeNode n, long lo, long hi) {
        if (n == null) return true;
        return n.val > lo && n.val < hi && valid(n.left, lo, n.val) && valid(n.right, n.val, hi);
    }
}`,
  },
  {
    slug: 'kth-smallest-element-in-a-bst', title: 'Kth Smallest Element in a BST', level: 'Medium',
    summary: 'Return the k-th smallest value (1-indexed) in a BST.',
    method: 'kthSmallest', params: [['TreeNode', 'root'], ['int', 'k']], returns: 'int',
    tests: [
      { in: [[3, 1, 4, null, 2], 1], out: 1 },
      { in: [[5, 3, 6, 2, 4, null, null, 1], 3], out: 3 },
      { in: [[1], 1] },
      { in: [[5, 3, 6, 2, 4, null, null, 1], 6] },
    ],
    ref: `class Solution {
    public int kthSmallest(TreeNode root, int k) {
        Deque<TreeNode> st = new ArrayDeque<>();
        while (true) {
            while (root != null) { st.push(root); root = root.left; }
            root = st.pop();
            if (--k == 0) return root.val;
            root = root.right;
        }
    }
}`,
  },
  {
    slug: 'insert-into-a-binary-search-tree', title: 'Insert into a Binary Search Tree', level: 'Medium',
    summary: 'Insert val (not already present) into the BST and return the root. Any valid BST is accepted.',
    method: 'insertIntoBST', params: [['TreeNode', 'root'], ['int', 'val']], returns: 'TreeNode', check: 'custom:bstInsert',
    tests: [
      { in: [[4, 2, 7, 1, 3], 5] },
      { in: [[40, 20, 60, 10, 30, 50, 70], 25] },
      { in: [[], 5] },
      { in: [[4, 2, 7, 1, 3, null, null, null, null, null, null], 0] },
    ],
    ref: `class Solution {
    public TreeNode insertIntoBST(TreeNode root, int val) {
        if (root == null) return new TreeNode(val);
        if (val < root.val) root.left = insertIntoBST(root.left, val); else root.right = insertIntoBST(root.right, val);
        return root;
    }
}`,
  },
  {
    slug: 'delete-node-in-a-bst', title: 'Delete Node in a BST', level: 'Medium',
    summary: 'Delete the node with value key (if present) and return the root of the still-valid BST. Any valid result is accepted.',
    method: 'deleteNode', params: [['TreeNode', 'root'], ['int', 'key']], returns: 'TreeNode', check: 'custom:bstDelete',
    tests: [
      { in: [[5, 3, 6, 2, 4, null, 7], 3] },
      { in: [[5, 3, 6, 2, 4, null, 7], 0] },
      { in: [[], 0] },
      { in: [[5, 3, 6, 2, 4, null, 7], 5] },
      { in: [[1], 1] },
    ],
    ref: `class Solution {
    public TreeNode deleteNode(TreeNode root, int key) {
        if (root == null) return null;
        if (key < root.val) root.left = deleteNode(root.left, key);
        else if (key > root.val) root.right = deleteNode(root.right, key);
        else {
            if (root.left == null) return root.right;
            if (root.right == null) return root.left;
            TreeNode s = root.right;
            while (s.left != null) s = s.left;
            root.val = s.val;
            root.right = deleteNode(root.right, s.val);
        }
        return root;
    }
}`,
  },
  {
    slug: 'binary-search-tree-iterator', title: 'Binary Search Tree Iterator', level: 'Medium',
    summary: 'BSTIterator(root) iterates a BST in order: next() returns the next smallest value, hasNext() says whether one exists. Aim for O(h) memory.',
    design: { cls: 'BSTIterator', ctor: [['TreeNode', 'root']], methods: [['int', 'next', []], ['boolean', 'hasNext', []]] },
    tests: [
      { in: [['BSTIterator', 'next', 'next', 'hasNext', 'next', 'hasNext', 'next', 'hasNext', 'next', 'hasNext'], [[[7, 3, 15, null, null, 9, 20]], [], [], [], [], [], [], [], [], []]], out: [null, 3, 7, true, 9, true, 15, true, 20, false] },
      { in: [['BSTIterator', 'hasNext', 'next', 'hasNext'], [[[1]], [], [], []]] },
      { in: [['BSTIterator', 'next', 'next', 'next', 'hasNext'], [[[2, 1, 3]], [], [], [], []]] },
    ],
    ref: `class BSTIterator {
    private final Deque<TreeNode> st = new ArrayDeque<>();
    public BSTIterator(TreeNode root) { pushLeft(root); }
    private void pushLeft(TreeNode n) { while (n != null) { st.push(n); n = n.left; } }
    public int next() { TreeNode n = st.pop(); pushLeft(n.right); return n.val; }
    public boolean hasNext() { return !st.isEmpty(); }
}`,
  },
  {
    slug: 'recover-binary-search-tree', title: 'Recover Binary Search Tree', level: 'Medium',
    summary: 'Exactly two nodes of a BST had their values swapped by mistake. Fix the tree in place without changing its structure. The judge prints the tree after your call.',
    method: 'recoverTree', params: [['TreeNode', 'root']], returns: 'void', output: 0,
    tests: [
      { in: [[1, 3, null, null, 2]], out: [3, 1, null, null, 2] },
      { in: [[3, 1, 4, null, null, 2]], out: [2, 1, 4, null, null, 3] },
      { in: [[2, 3, 1]] },
      { in: [[5, 3, 9, -2147483648, 2]] },
    ],
    ref: `class Solution {
    private TreeNode first, second, prev;
    public void recoverTree(TreeNode root) {
        walk(root);
        int t = first.val; first.val = second.val; second.val = t;
    }
    private void walk(TreeNode n) {
        if (n == null) return;
        walk(n.left);
        if (prev != null && prev.val > n.val) { if (first == null) first = prev; second = n; }
        prev = n;
        walk(n.right);
    }
}`,
  },
];
