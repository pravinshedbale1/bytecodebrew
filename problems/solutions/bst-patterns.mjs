const r = String.raw;

export default {
  'search-in-a-binary-search-tree': {
    pattern: 'BST descent: compare and go left or right (binary search on a tree)',
    approaches: [
      {
        level: 'Brute force', name: 'Search the whole tree',
        idea: 'Ignore the ordering and look at every node with a DFS until one has value `val`.',
        steps: [
          'If `root` is null or holds `val`, return it.',
          'Search the left subtree; if found, return that node.',
          'Otherwise return the result of searching the right subtree.',
        ],
        time: 'O(n)', space: 'O(h)',
        why: 'It may visit all n nodes; the stack is as deep as the tree.',
        code: {
          java: r`class Solution {
    public TreeNode searchBST(TreeNode root, int val) {
        if (root == null || root.val == val) return root;
        TreeNode left = searchBST(root.left, val);
        return left != null ? left : searchBST(root.right, val);
    }
}`,
          cpp: r`class Solution {
public:
    TreeNode* searchBST(TreeNode* root, int val) {
        if (!root || root->val == val) return root;
        TreeNode* left = searchBST(root->left, val);
        return left ? left : searchBST(root->right, val);
    }
};`,
          python: r`class Solution:
    def searchBST(self, root: Optional[TreeNode], val: int) -> Optional[TreeNode]:
        if not root or root.val == val:
            return root
        return self.searchBST(root.left, val) or self.searchBST(root.right, val)`,
          javascript: r`var searchBST = function(root, val) {
    if (!root || root.val === val) return root;
    return searchBST(root.left, val) ?? searchBST(root.right, val);
};`,
        },
      },
      {
        level: 'Optimal', name: 'Walk down using the BST order',
        idea: 'At each node the ordering tells you which side `val` must be on, so follow a single path from the root.',
        steps: [
          'Start at `root`.',
          'While the node is not null and its value is not `val`: go left if `val` is smaller, right otherwise.',
          'Return the node (null if the walk fell off the tree).',
        ],
        time: 'O(h)', space: 'O(1)',
        why: 'One root-to-leaf path at most: O(log n) for a balanced tree, O(n) for a chain. The loop needs no stack.',
        code: {
          java: r`class Solution {
    public TreeNode searchBST(TreeNode root, int val) {
        while (root != null && root.val != val) root = val < root.val ? root.left : root.right;
        return root;
    }
}`,
          cpp: r`class Solution {
public:
    TreeNode* searchBST(TreeNode* root, int val) {
        while (root && root->val != val) root = val < root->val ? root->left : root->right;
        return root;
    }
};`,
          python: r`class Solution:
    def searchBST(self, root: Optional[TreeNode], val: int) -> Optional[TreeNode]:
        while root and root.val != val:
            root = root.left if val < root.val else root.right
        return root`,
          javascript: r`var searchBST = function(root, val) {
    while (root && root.val !== val) root = val < root.val ? root.left : root.right;
    return root;
};`,
        },
      },
    ],
  },

  'convert-sorted-array-to-binary-search-tree': {
    pattern: 'Divide and conquer: the middle element is the root',
    approaches: [
      {
        level: 'Optimal', name: 'Recursively take the middle as the root',
        idea: 'Making the middle element the root puts (almost) the same number of values on each side; doing the same for each half keeps every subtree balanced, and the sorted order makes it a BST.',
        steps: [
          '`build(lo, hi)`: if `lo > hi`, return null.',
          'Take `mid = (lo + hi) / 2` as the root.',
          'Set `root.left = build(lo, mid − 1)` and `root.right = build(mid + 1, hi)`; return `root`.',
        ],
        time: 'O(n)', space: 'O(log n)',
        why: 'Each value becomes one node. The recursion depth is the height of the balanced tree, log n (the output tree itself aside). A simpler alternative — inserting the values one by one — would build a chain, since they arrive in sorted order.',
        code: {
          java: r`class Solution {
    public TreeNode sortedArrayToBST(int[] nums) {
        return build(nums, 0, nums.length - 1);
    }

    private TreeNode build(int[] nums, int lo, int hi) {
        if (lo > hi) return null;
        int mid = (lo + hi) >>> 1;
        return new TreeNode(nums[mid], build(nums, lo, mid - 1), build(nums, mid + 1, hi));
    }
}`,
          cpp: r`class Solution {
    TreeNode* build(vector<int>& nums, int lo, int hi) {
        if (lo > hi) return nullptr;
        int mid = (lo + hi) / 2;
        return new TreeNode(nums[mid], build(nums, lo, mid - 1), build(nums, mid + 1, hi));
    }
public:
    TreeNode* sortedArrayToBST(vector<int>& nums) {
        return build(nums, 0, (int) nums.size() - 1);
    }
};`,
          python: r`class Solution:
    def sortedArrayToBST(self, nums: List[int]) -> Optional[TreeNode]:
        def build(lo, hi):
            if lo > hi:
                return None
            mid = (lo + hi) // 2
            return TreeNode(nums[mid], build(lo, mid - 1), build(mid + 1, hi))
        return build(0, len(nums) - 1)`,
          javascript: r`var sortedArrayToBST = function(nums) {
    const build = (lo, hi) => {
        if (lo > hi) return null;
        const mid = (lo + hi) >> 1;
        return new TreeNode(nums[mid], build(lo, mid - 1), build(mid + 1, hi));
    };
    return build(0, nums.length - 1);
};`,
        },
      },
    ],
  },

  'lowest-common-ancestor-of-a-binary-search-tree': {
    pattern: 'BST split point: the first node whose value lies between p and q',
    approaches: [
      {
        level: 'Brute force', name: 'Generic binary-tree LCA',
        idea: 'Ignore the BST order and use the general method: a node whose left and right subtrees each contain one of the targets (or which is a target) is the answer.',
        steps: [
          'If `root` is null, `p` or `q`, return `root`.',
          'Recurse into both subtrees.',
          'If both return a node, return `root`; otherwise return whichever is non-null.',
        ],
        time: 'O(n)', space: 'O(h)',
        why: 'It may visit every node, because it never uses the values to choose a side.',
        code: {
          java: r`class Solution {
    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        if (root == null || root == p || root == q) return root;
        TreeNode left = lowestCommonAncestor(root.left, p, q);
        TreeNode right = lowestCommonAncestor(root.right, p, q);
        if (left != null && right != null) return root;
        return left != null ? left : right;
    }
}`,
          cpp: r`class Solution {
public:
    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
        if (!root || root == p || root == q) return root;
        TreeNode* left = lowestCommonAncestor(root->left, p, q);
        TreeNode* right = lowestCommonAncestor(root->right, p, q);
        if (left && right) return root;
        return left ? left : right;
    }
};`,
          python: r`class Solution:
    def lowestCommonAncestor(self, root: 'TreeNode', p: 'TreeNode', q: 'TreeNode') -> 'TreeNode':
        if not root or root is p or root is q:
            return root
        left = self.lowestCommonAncestor(root.left, p, q)
        right = self.lowestCommonAncestor(root.right, p, q)
        if left and right:
            return root
        return left or right`,
          javascript: r`var lowestCommonAncestor = function(root, p, q) {
    if (!root || root === p || root === q) return root;
    const left = lowestCommonAncestor(root.left, p, q);
    const right = lowestCommonAncestor(root.right, p, q);
    if (left && right) return root;
    return left ?? right;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Walk down until p and q split',
        idea: 'If both values are smaller than the current node, both targets are in its left subtree, so the LCA is too; if both are larger, go right. Otherwise the node lies between them (or equals one), so it is the LCA.',
        steps: [
          'Start at `root`.',
          'If `p.val` and `q.val` are both less than the node\'s value, move left; if both greater, move right.',
          'Otherwise return the current node.',
        ],
        time: 'O(h)', space: 'O(1)',
        why: 'A single downward path with no recursion: O(log n) when balanced, O(n) for a chain.',
        code: {
          java: r`class Solution {
    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        while (true) {
            if (p.val < root.val && q.val < root.val) root = root.left;
            else if (p.val > root.val && q.val > root.val) root = root.right;
            else return root;
        }
    }
}`,
          cpp: r`class Solution {
public:
    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
        while (true) {
            if (p->val < root->val && q->val < root->val) root = root->left;
            else if (p->val > root->val && q->val > root->val) root = root->right;
            else return root;
        }
    }
};`,
          python: r`class Solution:
    def lowestCommonAncestor(self, root: 'TreeNode', p: 'TreeNode', q: 'TreeNode') -> 'TreeNode':
        while True:
            if p.val < root.val and q.val < root.val:
                root = root.left
            elif p.val > root.val and q.val > root.val:
                root = root.right
            else:
                return root`,
          javascript: r`var lowestCommonAncestor = function(root, p, q) {
    while (true) {
        if (p.val < root.val && q.val < root.val) root = root.left;
        else if (p.val > root.val && q.val > root.val) root = root.right;
        else return root;
    }
};`,
        },
      },
    ],
  },

  'validate-binary-search-tree': {
    pattern: 'DFS with a valid (low, high) range per node, or an inorder walk that must strictly increase',
    approaches: [
      {
        level: 'Brute force', name: 'Compare every node with its whole subtrees',
        idea: 'Apply the definition directly: at every node, check that the maximum of its left subtree is smaller and the minimum of its right subtree is larger, recomputing those with full subtree scans.',
        steps: [
          'For a node, compute `max(left subtree)` and `min(right subtree)` by visiting those subtrees.',
          'Fail if `max(left) >= node.val` or `min(right) <= node.val`.',
          'Check both subtrees the same way.',
        ],
        time: 'O(n²)', space: 'O(h)',
        why: 'Every node rescans its subtrees, so each node is visited once per ancestor: O(n·h), which is O(n²) for a chain.',
        code: {
          java: r`class Solution {
    public boolean isValidBST(TreeNode root) {
        if (root == null) return true;
        if (root.left != null && max(root.left) >= root.val) return false;
        if (root.right != null && min(root.right) <= root.val) return false;
        return isValidBST(root.left) && isValidBST(root.right);
    }

    private int max(TreeNode t) {
        int m = t.val;
        if (t.left != null) m = Math.max(m, max(t.left));
        if (t.right != null) m = Math.max(m, max(t.right));
        return m;
    }

    private int min(TreeNode t) {
        int m = t.val;
        if (t.left != null) m = Math.min(m, min(t.left));
        if (t.right != null) m = Math.min(m, min(t.right));
        return m;
    }
}`,
          cpp: r`class Solution {
    int mx(TreeNode* t) {
        int m = t->val;
        if (t->left) m = max(m, mx(t->left));
        if (t->right) m = max(m, mx(t->right));
        return m;
    }
    int mn(TreeNode* t) {
        int m = t->val;
        if (t->left) m = min(m, mn(t->left));
        if (t->right) m = min(m, mn(t->right));
        return m;
    }
public:
    bool isValidBST(TreeNode* root) {
        if (!root) return true;
        if (root->left && mx(root->left) >= root->val) return false;
        if (root->right && mn(root->right) <= root->val) return false;
        return isValidBST(root->left) && isValidBST(root->right);
    }
};`,
          python: r`class Solution:
    def isValidBST(self, root: Optional[TreeNode]) -> bool:
        def values(t):
            return [] if not t else values(t.left) + [t.val] + values(t.right)
        if not root:
            return True
        if root.left and max(values(root.left)) >= root.val:
            return False
        if root.right and min(values(root.right)) <= root.val:
            return False
        return self.isValidBST(root.left) and self.isValidBST(root.right)`,
          javascript: r`var isValidBST = function(root) {
    const values = (t) => (t ? [...values(t.left), t.val, ...values(t.right)] : []);
    if (!root) return true;
    if (root.left && Math.max(...values(root.left)) >= root.val) return false;
    if (root.right && Math.min(...values(root.right)) <= root.val) return false;
    return isValidBST(root.left) && isValidBST(root.right);
};`,
        },
      },
      {
        level: 'Better', name: 'Inorder into a list, check it strictly increases',
        idea: 'An inorder traversal of a BST lists its values in sorted order. Collect them and check every value is larger than the one before.',
        steps: [
          'Collect the values with an inorder traversal (left, node, right).',
          'Return false if any `vals[i] <= vals[i − 1]`; otherwise true.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'One traversal and one scan; the list holds all n values.',
        code: {
          java: r`class Solution {
    public boolean isValidBST(TreeNode root) {
        List<Integer> vals = new ArrayList<>();
        inorder(root, vals);
        for (int i = 1; i < vals.size(); i++) if (vals.get(i) <= vals.get(i - 1)) return false;
        return true;
    }

    private void inorder(TreeNode t, List<Integer> vals) {
        if (t == null) return;
        inorder(t.left, vals);
        vals.add(t.val);
        inorder(t.right, vals);
    }
}`,
          cpp: r`class Solution {
    void inorder(TreeNode* t, vector<int>& vals) {
        if (!t) return;
        inorder(t->left, vals);
        vals.push_back(t->val);
        inorder(t->right, vals);
    }
public:
    bool isValidBST(TreeNode* root) {
        vector<int> vals;
        inorder(root, vals);
        for (size_t i = 1; i < vals.size(); i++) if (vals[i] <= vals[i - 1]) return false;
        return true;
    }
};`,
          python: r`class Solution:
    def isValidBST(self, root: Optional[TreeNode]) -> bool:
        vals = []
        def inorder(t):
            if t:
                inorder(t.left)
                vals.append(t.val)
                inorder(t.right)
        inorder(root)
        return all(a < b for a, b in zip(vals, vals[1:]))`,
          javascript: r`var isValidBST = function(root) {
    const vals = [];
    const inorder = (t) => {
        if (!t) return;
        inorder(t.left);
        vals.push(t.val);
        inorder(t.right);
    };
    inorder(root);
    for (let i = 1; i < vals.length; i++) if (vals[i] <= vals[i - 1]) return false;
    return true;
};`,
        },
      },
      {
        level: 'Optimal', name: 'DFS with value bounds',
        idea: 'Every node must lie strictly inside a range set by its ancestors: going left lowers the upper bound to the parent\'s value, going right raises the lower bound. Checking each node against its range checks the whole definition.',
        steps: [
          '`valid(node, low, high)`: true for null.',
          'If `node.val <= low` or `node.val >= high`, return false.',
          'Return `valid(left, low, node.val) && valid(right, node.val, high)`.',
          'Start with bounds −∞ and +∞ (64-bit, or null), since values reach ±2³¹.',
        ],
        time: 'O(n)', space: 'O(h)',
        why: 'Each node is checked once against two numbers. Comparing only with the parent is the classic bug: `[5,4,6,null,null,3,7]` passes a parent check but 3 is in 5\'s right subtree.',
        code: {
          java: r`class Solution {
    public boolean isValidBST(TreeNode root) {
        return valid(root, Long.MIN_VALUE, Long.MAX_VALUE);
    }

    private boolean valid(TreeNode t, long low, long high) {
        if (t == null) return true;
        if (t.val <= low || t.val >= high) return false;
        return valid(t.left, low, t.val) && valid(t.right, t.val, high);
    }
}`,
          cpp: r`class Solution {
    bool valid(TreeNode* t, long long low, long long high) {
        if (!t) return true;
        if (t->val <= low || t->val >= high) return false;
        return valid(t->left, low, t->val) && valid(t->right, t->val, high);
    }
public:
    bool isValidBST(TreeNode* root) {
        return valid(root, LLONG_MIN, LLONG_MAX);
    }
};`,
          python: r`class Solution:
    def isValidBST(self, root: Optional[TreeNode]) -> bool:
        def valid(t, low, high):
            if not t:
                return True
            if not low < t.val < high:
                return False
            return valid(t.left, low, t.val) and valid(t.right, t.val, high)
        return valid(root, -inf, inf)`,
          javascript: r`var isValidBST = function(root) {
    const valid = (t, low, high) => {
        if (!t) return true;
        if (t.val <= low || t.val >= high) return false;
        return valid(t.left, low, t.val) && valid(t.right, t.val, high);
    };
    return valid(root, -Infinity, Infinity);
};`,
        },
      },
    ],
  },

  'kth-smallest-element-in-a-bst': {
    pattern: 'Inorder traversal of a BST visits values in sorted order (stop at the k-th)',
    approaches: [
      {
        level: 'Brute force', name: 'Collect all values and sort',
        idea: 'Ignore the BST property: gather every value, sort, and take index `k − 1`.',
        steps: [
          'Collect all values with any traversal.',
          'Sort them and return the one at index `k − 1`.',
        ],
        time: 'O(n log n)', space: 'O(n)',
        why: 'The sort dominates; the list holds n values.',
        code: {
          java: r`class Solution {
    public int kthSmallest(TreeNode root, int k) {
        List<Integer> vals = new ArrayList<>();
        collect(root, vals);
        Collections.sort(vals);
        return vals.get(k - 1);
    }

    private void collect(TreeNode t, List<Integer> vals) {
        if (t == null) return;
        vals.add(t.val);
        collect(t.left, vals);
        collect(t.right, vals);
    }
}`,
          cpp: r`class Solution {
    void collect(TreeNode* t, vector<int>& vals) {
        if (!t) return;
        vals.push_back(t->val);
        collect(t->left, vals);
        collect(t->right, vals);
    }
public:
    int kthSmallest(TreeNode* root, int k) {
        vector<int> vals;
        collect(root, vals);
        sort(vals.begin(), vals.end());
        return vals[k - 1];
    }
};`,
          python: r`class Solution:
    def kthSmallest(self, root: Optional[TreeNode], k: int) -> int:
        vals = []
        def collect(t):
            if t:
                vals.append(t.val)
                collect(t.left)
                collect(t.right)
        collect(root)
        return sorted(vals)[k - 1]`,
          javascript: r`var kthSmallest = function(root, k) {
    const vals = [];
    const collect = (t) => {
        if (!t) return;
        vals.push(t.val);
        collect(t.left);
        collect(t.right);
    };
    collect(root);
    return vals.sort((a, b) => a - b)[k - 1];
};`,
        },
      },
      {
        level: 'Better', name: 'Full inorder traversal',
        idea: 'Inorder visits a BST in sorted order, so the list it produces needs no sorting.',
        steps: [
          'Collect values with an inorder traversal (left, node, right).',
          'Return `vals[k − 1]`.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'It still walks the whole tree and stores every value even when k is small.',
        code: {
          java: r`class Solution {
    public int kthSmallest(TreeNode root, int k) {
        List<Integer> vals = new ArrayList<>();
        inorder(root, vals);
        return vals.get(k - 1);
    }

    private void inorder(TreeNode t, List<Integer> vals) {
        if (t == null) return;
        inorder(t.left, vals);
        vals.add(t.val);
        inorder(t.right, vals);
    }
}`,
          cpp: r`class Solution {
    void inorder(TreeNode* t, vector<int>& vals) {
        if (!t) return;
        inorder(t->left, vals);
        vals.push_back(t->val);
        inorder(t->right, vals);
    }
public:
    int kthSmallest(TreeNode* root, int k) {
        vector<int> vals;
        inorder(root, vals);
        return vals[k - 1];
    }
};`,
          python: r`class Solution:
    def kthSmallest(self, root: Optional[TreeNode], k: int) -> int:
        vals = []
        def inorder(t):
            if t:
                inorder(t.left)
                vals.append(t.val)
                inorder(t.right)
        inorder(root)
        return vals[k - 1]`,
          javascript: r`var kthSmallest = function(root, k) {
    const vals = [];
    const inorder = (t) => {
        if (!t) return;
        inorder(t.left);
        vals.push(t.val);
        inorder(t.right);
    };
    inorder(root);
    return vals[k - 1];
};`,
        },
      },
      {
        level: 'Optimal', name: 'Iterative inorder that stops at the k-th node',
        idea: 'Run inorder with an explicit stack and count nodes as they are visited; stop the moment the k-th is reached.',
        steps: [
          'Push the path down the left spine onto a stack.',
          'Pop a node: it is the next smallest. Decrease `k`; if it hits 0, return the value.',
          'Move to the popped node\'s right child and push its left spine; repeat.',
        ],
        time: 'O(h + k)', space: 'O(h)',
        why: 'It walks down to the minimum (h steps) and then visits only k nodes. The stack never holds more than one root-to-leaf path. (If the tree changed often, storing subtree sizes in each node would allow O(h) queries.)',
        code: {
          java: r`class Solution {
    public int kthSmallest(TreeNode root, int k) {
        Deque<TreeNode> stack = new ArrayDeque<>();
        TreeNode node = root;
        while (true) {
            while (node != null) { stack.push(node); node = node.left; }
            node = stack.pop();
            if (--k == 0) return node.val;
            node = node.right;
        }
    }
}`,
          cpp: r`class Solution {
public:
    int kthSmallest(TreeNode* root, int k) {
        vector<TreeNode*> st;
        TreeNode* node = root;
        while (true) {
            while (node) { st.push_back(node); node = node->left; }
            node = st.back();
            st.pop_back();
            if (--k == 0) return node->val;
            node = node->right;
        }
    }
};`,
          python: r`class Solution:
    def kthSmallest(self, root: Optional[TreeNode], k: int) -> int:
        stack, node = [], root
        while True:
            while node:
                stack.append(node)
                node = node.left
            node = stack.pop()
            k -= 1
            if k == 0:
                return node.val
            node = node.right`,
          javascript: r`var kthSmallest = function(root, k) {
    const stack = [];
    let node = root;
    while (true) {
        while (node) { stack.push(node); node = node.left; }
        node = stack.pop();
        if (--k === 0) return node.val;
        node = node.right;
    }
};`,
        },
      },
    ],
  },

  'insert-into-a-binary-search-tree': {
    pattern: 'BST descent to the empty spot where the value belongs',
    approaches: [
      {
        level: 'Optimal', name: 'Recursive insert',
        idea: 'A new value always becomes a leaf. Follow the BST order down; the first null child on that path is where it goes.',
        steps: [
          'If `root` is null, return a new node with `val`.',
          'If `val < root.val`, set `root.left = insert(root.left, val)`; otherwise `root.right = insert(root.right, val)`.',
          'Return `root`.',
        ],
        time: 'O(h)', space: 'O(h)',
        why: 'One root-to-leaf path; the recursion uses a stack frame per level.',
        code: {
          java: r`class Solution {
    public TreeNode insertIntoBST(TreeNode root, int val) {
        if (root == null) return new TreeNode(val);
        if (val < root.val) root.left = insertIntoBST(root.left, val);
        else root.right = insertIntoBST(root.right, val);
        return root;
    }
}`,
          cpp: r`class Solution {
public:
    TreeNode* insertIntoBST(TreeNode* root, int val) {
        if (!root) return new TreeNode(val);
        if (val < root->val) root->left = insertIntoBST(root->left, val);
        else root->right = insertIntoBST(root->right, val);
        return root;
    }
};`,
          python: r`class Solution:
    def insertIntoBST(self, root: Optional[TreeNode], val: int) -> Optional[TreeNode]:
        if not root:
            return TreeNode(val)
        if val < root.val:
            root.left = self.insertIntoBST(root.left, val)
        else:
            root.right = self.insertIntoBST(root.right, val)
        return root`,
          javascript: r`var insertIntoBST = function(root, val) {
    if (!root) return new TreeNode(val);
    if (val < root.val) root.left = insertIntoBST(root.left, val);
    else root.right = insertIntoBST(root.right, val);
    return root;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Iterative insert',
        idea: 'The same walk with a loop: move down until the side you need is empty, then attach the new node there.',
        steps: [
          'If `root` is null, return a new node.',
          'From `root`, go left if `val` is smaller, right otherwise; when that child is null, attach the new node there and stop.',
          'Return `root`.',
        ],
        time: 'O(h)', space: 'O(1)',
        why: 'The same path as the recursive version, with constant extra memory.',
        code: {
          java: r`class Solution {
    public TreeNode insertIntoBST(TreeNode root, int val) {
        if (root == null) return new TreeNode(val);
        TreeNode node = root;
        while (true) {
            if (val < node.val) {
                if (node.left == null) { node.left = new TreeNode(val); break; }
                node = node.left;
            } else {
                if (node.right == null) { node.right = new TreeNode(val); break; }
                node = node.right;
            }
        }
        return root;
    }
}`,
          cpp: r`class Solution {
public:
    TreeNode* insertIntoBST(TreeNode* root, int val) {
        if (!root) return new TreeNode(val);
        TreeNode* node = root;
        while (true) {
            TreeNode*& next = val < node->val ? node->left : node->right;
            if (!next) { next = new TreeNode(val); break; }
            node = next;
        }
        return root;
    }
};`,
          python: r`class Solution:
    def insertIntoBST(self, root: Optional[TreeNode], val: int) -> Optional[TreeNode]:
        if not root:
            return TreeNode(val)
        node = root
        while True:
            if val < node.val:
                if not node.left:
                    node.left = TreeNode(val)
                    break
                node = node.left
            else:
                if not node.right:
                    node.right = TreeNode(val)
                    break
                node = node.right
        return root`,
          javascript: r`var insertIntoBST = function(root, val) {
    if (!root) return new TreeNode(val);
    let node = root;
    while (true) {
        const side = val < node.val ? 'left' : 'right';
        if (!node[side]) { node[side] = new TreeNode(val); break; }
        node = node[side];
    }
    return root;
};`,
        },
      },
    ],
  },

  'delete-node-in-a-bst': {
    pattern: 'BST delete: replace a two-child node by its inorder successor',
    approaches: [
      {
        level: 'Brute force', name: 'Rebuild the tree without the key',
        idea: 'Read all values in sorted order (inorder), drop `key`, and build a fresh balanced BST from what is left.',
        steps: [
          'Collect the values with an inorder traversal, skipping `key`.',
          'Build a balanced BST from the sorted list by taking the middle as the root recursively.',
          'Return the new root.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Every node is read and rebuilt, even though deleting one value only needs to touch a single path.',
        code: {
          java: r`class Solution {
    public TreeNode deleteNode(TreeNode root, int key) {
        List<Integer> vals = new ArrayList<>();
        inorder(root, key, vals);
        return build(vals, 0, vals.size() - 1);
    }

    private void inorder(TreeNode t, int key, List<Integer> vals) {
        if (t == null) return;
        inorder(t.left, key, vals);
        if (t.val != key) vals.add(t.val);
        inorder(t.right, key, vals);
    }

    private TreeNode build(List<Integer> vals, int lo, int hi) {
        if (lo > hi) return null;
        int mid = (lo + hi) >>> 1;
        return new TreeNode(vals.get(mid), build(vals, lo, mid - 1), build(vals, mid + 1, hi));
    }
}`,
          cpp: r`class Solution {
    void inorder(TreeNode* t, int key, vector<int>& vals) {
        if (!t) return;
        inorder(t->left, key, vals);
        if (t->val != key) vals.push_back(t->val);
        inorder(t->right, key, vals);
    }
    TreeNode* build(vector<int>& vals, int lo, int hi) {
        if (lo > hi) return nullptr;
        int mid = (lo + hi) / 2;
        return new TreeNode(vals[mid], build(vals, lo, mid - 1), build(vals, mid + 1, hi));
    }
public:
    TreeNode* deleteNode(TreeNode* root, int key) {
        vector<int> vals;
        inorder(root, key, vals);
        return build(vals, 0, (int) vals.size() - 1);
    }
};`,
          python: r`class Solution:
    def deleteNode(self, root: Optional[TreeNode], key: int) -> Optional[TreeNode]:
        vals = []
        def inorder(t):
            if t:
                inorder(t.left)
                if t.val != key:
                    vals.append(t.val)
                inorder(t.right)
        def build(lo, hi):
            if lo > hi:
                return None
            mid = (lo + hi) // 2
            return TreeNode(vals[mid], build(lo, mid - 1), build(mid + 1, hi))
        inorder(root)
        return build(0, len(vals) - 1)`,
          javascript: r`var deleteNode = function(root, key) {
    const vals = [];
    const inorder = (t) => {
        if (!t) return;
        inorder(t.left);
        if (t.val !== key) vals.push(t.val);
        inorder(t.right);
    };
    const build = (lo, hi) => {
        if (lo > hi) return null;
        const mid = (lo + hi) >> 1;
        return new TreeNode(vals[mid], build(lo, mid - 1), build(mid + 1, hi));
    };
    inorder(root);
    return build(0, vals.length - 1);
};`,
        },
      },
      {
        level: 'Optimal', name: 'Find the node and splice it out',
        idea: 'Search for `key` using the BST order. A node with at most one child is replaced by that child. A node with two children takes the value of its inorder successor (the smallest value in its right subtree), and that successor is then deleted from the right subtree.',
        steps: [
          'If `root` is null, return null. If `key < root.val`, delete from the left subtree; if greater, from the right.',
          'Found it: if it has no left child, return its right child; if no right child, return its left child.',
          'Two children: find the leftmost node of the right subtree, copy its value into `root`, and delete that value from the right subtree.',
          'Return `root`.',
        ],
        time: 'O(h)', space: 'O(h)',
        why: 'The search and the successor\'s removal each follow one downward path. The successor has no left child, so removing it is the simple case.',
        code: {
          java: r`class Solution {
    public TreeNode deleteNode(TreeNode root, int key) {
        if (root == null) return null;
        if (key < root.val) root.left = deleteNode(root.left, key);
        else if (key > root.val) root.right = deleteNode(root.right, key);
        else {
            if (root.left == null) return root.right;
            if (root.right == null) return root.left;
            TreeNode succ = root.right;
            while (succ.left != null) succ = succ.left;
            root.val = succ.val;
            root.right = deleteNode(root.right, succ.val);
        }
        return root;
    }
}`,
          cpp: r`class Solution {
public:
    TreeNode* deleteNode(TreeNode* root, int key) {
        if (!root) return nullptr;
        if (key < root->val) root->left = deleteNode(root->left, key);
        else if (key > root->val) root->right = deleteNode(root->right, key);
        else {
            if (!root->left) return root->right;
            if (!root->right) return root->left;
            TreeNode* succ = root->right;
            while (succ->left) succ = succ->left;
            root->val = succ->val;
            root->right = deleteNode(root->right, succ->val);
        }
        return root;
    }
};`,
          python: r`class Solution:
    def deleteNode(self, root: Optional[TreeNode], key: int) -> Optional[TreeNode]:
        if not root:
            return None
        if key < root.val:
            root.left = self.deleteNode(root.left, key)
        elif key > root.val:
            root.right = self.deleteNode(root.right, key)
        else:
            if not root.left:
                return root.right
            if not root.right:
                return root.left
            succ = root.right
            while succ.left:
                succ = succ.left
            root.val = succ.val
            root.right = self.deleteNode(root.right, succ.val)
        return root`,
          javascript: r`var deleteNode = function(root, key) {
    if (!root) return null;
    if (key < root.val) root.left = deleteNode(root.left, key);
    else if (key > root.val) root.right = deleteNode(root.right, key);
    else {
        if (!root.left) return root.right;
        if (!root.right) return root.left;
        let succ = root.right;
        while (succ.left) succ = succ.left;
        root.val = succ.val;
        root.right = deleteNode(root.right, succ.val);
    }
    return root;
};`,
        },
      },
    ],
  },

  'binary-search-tree-iterator': {
    pattern: 'Controlled inorder traversal with an explicit stack (left spine)',
    approaches: [
      {
        level: 'Brute force', name: 'Flatten the tree up front',
        idea: 'Do a full inorder traversal in the constructor and store the values; `next` and `hasNext` just walk the list.',
        steps: [
          'Constructor: inorder traversal into a list; set an index to 0.',
          '`next()`: return `list[index++]`.',
          '`hasNext()`: return `index < list.size()`.',
        ],
        time: 'O(1) per call', space: 'O(n)',
        why: 'O(n) work once in the constructor, then O(1) calls — but it stores all n values instead of the O(h) the problem asks for.',
        code: {
          java: r`class BSTIterator {
    private final List<Integer> vals = new ArrayList<>();
    private int index = 0;

    public BSTIterator(TreeNode root) {
        inorder(root);
    }

    private void inorder(TreeNode t) {
        if (t == null) return;
        inorder(t.left);
        vals.add(t.val);
        inorder(t.right);
    }

    public int next() {
        return vals.get(index++);
    }

    public boolean hasNext() {
        return index < vals.size();
    }
}`,
          cpp: r`class BSTIterator {
    vector<int> vals;
    size_t index = 0;
    void inorder(TreeNode* t) {
        if (!t) return;
        inorder(t->left);
        vals.push_back(t->val);
        inorder(t->right);
    }
public:
    BSTIterator(TreeNode* root) {
        inorder(root);
    }

    int next() {
        return vals[index++];
    }

    bool hasNext() {
        return index < vals.size();
    }
};`,
          python: r`class BSTIterator:

    def __init__(self, root: Optional[TreeNode]):
        self.vals, self.index = [], 0
        def inorder(t):
            if t:
                inorder(t.left)
                self.vals.append(t.val)
                inorder(t.right)
        inorder(root)

    def next(self) -> int:
        self.index += 1
        return self.vals[self.index - 1]

    def hasNext(self) -> bool:
        return self.index < len(self.vals)`,
          javascript: r`var BSTIterator = function(root) {
    this.vals = [];
    this.index = 0;
    const inorder = (t) => {
        if (!t) return;
        inorder(t.left);
        this.vals.push(t.val);
        inorder(t.right);
    };
    inorder(root);
};

BSTIterator.prototype.next = function() {
    return this.vals[this.index++];
};

BSTIterator.prototype.hasNext = function() {
    return this.index < this.vals.length;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Stack of the pending left spine',
        idea: 'Pause an iterative inorder traversal between calls. The stack holds the nodes whose left side is done but which have not been returned yet; the top is always the next smallest.',
        steps: [
          'Constructor: push `root` and all its left descendants.',
          '`next()`: pop the top node; push its right child and that child\'s left descendants; return the popped value.',
          '`hasNext()`: return whether the stack is non-empty.',
        ],
        time: 'O(1) amortised per call', space: 'O(h)',
        why: 'Each node is pushed and popped exactly once over the whole iteration, so n calls cost O(n). The stack holds at most one root-to-leaf path.',
        code: {
          java: r`class BSTIterator {
    private final Deque<TreeNode> stack = new ArrayDeque<>();

    public BSTIterator(TreeNode root) {
        pushLeft(root);
    }

    private void pushLeft(TreeNode node) {
        for (; node != null; node = node.left) stack.push(node);
    }

    public int next() {
        TreeNode node = stack.pop();
        pushLeft(node.right);
        return node.val;
    }

    public boolean hasNext() {
        return !stack.isEmpty();
    }
}`,
          cpp: r`class BSTIterator {
    vector<TreeNode*> st;
    void pushLeft(TreeNode* node) {
        for (; node; node = node->left) st.push_back(node);
    }
public:
    BSTIterator(TreeNode* root) {
        pushLeft(root);
    }

    int next() {
        TreeNode* node = st.back();
        st.pop_back();
        pushLeft(node->right);
        return node->val;
    }

    bool hasNext() {
        return !st.empty();
    }
};`,
          python: r`class BSTIterator:

    def __init__(self, root: Optional[TreeNode]):
        self.stack = []
        self._push_left(root)

    def _push_left(self, node):
        while node:
            self.stack.append(node)
            node = node.left

    def next(self) -> int:
        node = self.stack.pop()
        self._push_left(node.right)
        return node.val

    def hasNext(self) -> bool:
        return bool(self.stack)`,
          javascript: r`var BSTIterator = function(root) {
    this.stack = [];
    this.pushLeft(root);
};

BSTIterator.prototype.pushLeft = function(node) {
    for (; node; node = node.left) this.stack.push(node);
};

BSTIterator.prototype.next = function() {
    const node = this.stack.pop();
    this.pushLeft(node.right);
    return node.val;
};

BSTIterator.prototype.hasNext = function() {
    return this.stack.length > 0;
};`,
        },
      },
    ],
  },

  'recover-binary-search-tree': {
    pattern: 'Inorder should be increasing: find the two places it goes down (Morris traversal for O(1) space)',
    approaches: [
      {
        level: 'Brute force', name: 'Sort the inorder values and write them back',
        idea: 'Collect the values inorder, sort them, and write them back into the nodes in inorder. Sorted values in inorder positions are exactly a valid BST.',
        steps: [
          'Collect the nodes in inorder.',
          'Sort their values.',
          'Assign the k-th sorted value to the k-th inorder node.',
        ],
        time: 'O(n log n)', space: 'O(n)',
        why: 'The sort dominates; the node list and value list take O(n). It ignores the fact that only two values are wrong.',
        code: {
          java: r`class Solution {
    public void recoverTree(TreeNode root) {
        List<TreeNode> nodes = new ArrayList<>();
        inorder(root, nodes);
        int[] vals = nodes.stream().mapToInt(t -> t.val).sorted().toArray();
        for (int i = 0; i < vals.length; i++) nodes.get(i).val = vals[i];
    }

    private void inorder(TreeNode t, List<TreeNode> nodes) {
        if (t == null) return;
        inorder(t.left, nodes);
        nodes.add(t);
        inorder(t.right, nodes);
    }
}`,
          cpp: r`class Solution {
    void inorder(TreeNode* t, vector<TreeNode*>& nodes) {
        if (!t) return;
        inorder(t->left, nodes);
        nodes.push_back(t);
        inorder(t->right, nodes);
    }
public:
    void recoverTree(TreeNode* root) {
        vector<TreeNode*> nodes;
        inorder(root, nodes);
        vector<int> vals;
        for (auto* t : nodes) vals.push_back(t->val);
        sort(vals.begin(), vals.end());
        for (size_t i = 0; i < vals.size(); i++) nodes[i]->val = vals[i];
    }
};`,
          python: r`class Solution:
    def recoverTree(self, root: Optional[TreeNode]) -> None:
        nodes = []
        def inorder(t):
            if t:
                inorder(t.left)
                nodes.append(t)
                inorder(t.right)
        inorder(root)
        for node, v in zip(nodes, sorted(t.val for t in nodes)):
            node.val = v`,
          javascript: r`var recoverTree = function(root) {
    const nodes = [];
    const inorder = (t) => {
        if (!t) return;
        inorder(t.left);
        nodes.push(t);
        inorder(t.right);
    };
    inorder(root);
    const vals = nodes.map((t) => t.val).sort((a, b) => a - b);
    nodes.forEach((t, i) => { t.val = vals[i]; });
};`,
        },
      },
      {
        level: 'Better', name: 'Inorder with a previous pointer, find the two misplaced nodes',
        idea: 'In the inorder sequence, a swap creates one or two "drops" where `prev.val > cur.val`. The first misplaced node is `prev` at the first drop; the second is `cur` at the last drop. Swap their values.',
        steps: [
          'Do an inorder traversal keeping `prev`.',
          'At each drop (`prev.val > cur.val`): if `first` is unset, set `first = prev`; always set `second = cur`.',
          'After the traversal, swap `first.val` and `second.val`.',
        ],
        time: 'O(n)', space: 'O(h)',
        why: 'One traversal with O(1) work per node; the recursion stack is h deep. Adjacent swapped nodes give a single drop, which the "always set second" rule still handles.',
        code: {
          java: r`class Solution {
    private TreeNode prev, first, second;

    public void recoverTree(TreeNode root) {
        inorder(root);
        int t = first.val; first.val = second.val; second.val = t;
    }

    private void inorder(TreeNode cur) {
        if (cur == null) return;
        inorder(cur.left);
        if (prev != null && prev.val > cur.val) {
            if (first == null) first = prev;
            second = cur;
        }
        prev = cur;
        inorder(cur.right);
    }
}`,
          cpp: r`class Solution {
    TreeNode *prev = nullptr, *first = nullptr, *second = nullptr;
    void inorder(TreeNode* cur) {
        if (!cur) return;
        inorder(cur->left);
        if (prev && prev->val > cur->val) {
            if (!first) first = prev;
            second = cur;
        }
        prev = cur;
        inorder(cur->right);
    }
public:
    void recoverTree(TreeNode* root) {
        inorder(root);
        swap(first->val, second->val);
    }
};`,
          python: r`class Solution:
    def recoverTree(self, root: Optional[TreeNode]) -> None:
        prev = first = second = None
        def inorder(cur):
            nonlocal prev, first, second
            if not cur:
                return
            inorder(cur.left)
            if prev and prev.val > cur.val:
                if not first:
                    first = prev
                second = cur
            prev = cur
            inorder(cur.right)
        inorder(root)
        first.val, second.val = second.val, first.val`,
          javascript: r`var recoverTree = function(root) {
    let prev = null, first = null, second = null;
    const inorder = (cur) => {
        if (!cur) return;
        inorder(cur.left);
        if (prev && prev.val > cur.val) {
            if (!first) first = prev;
            second = cur;
        }
        prev = cur;
        inorder(cur.right);
    };
    inorder(root);
    [first.val, second.val] = [second.val, first.val];
};`,
        },
      },
      {
        level: 'Optimal', name: 'Morris inorder traversal (no stack)',
        idea: 'Morris traversal walks inorder without recursion or a stack by temporarily linking each node\'s inorder predecessor back to it, then removing that link on the way back. Run the same drop detection along the way.',
        steps: [
          'Set `cur = root`. If `cur` has no left child, visit it and go right.',
          'Otherwise find its predecessor (rightmost node of the left subtree). If the predecessor\'s right is null, link it to `cur` and go left.',
          'If the predecessor already links to `cur`, remove the link, visit `cur`, and go right.',
          '"Visit" means the drop check with `prev`; at the end swap `first.val` and `second.val`.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'Each edge is walked a constant number of times (predecessor searches add up to O(n) in total), and only a few pointers are used. All temporary links are removed, so the tree shape is restored.',
        code: {
          java: r`class Solution {
    public void recoverTree(TreeNode root) {
        TreeNode cur = root, prev = null, first = null, second = null;
        while (cur != null) {
            if (cur.left != null) {
                TreeNode pred = cur.left;
                while (pred.right != null && pred.right != cur) pred = pred.right;
                if (pred.right == null) { pred.right = cur; cur = cur.left; continue; }
                pred.right = null;
            }
            if (prev != null && prev.val > cur.val) {
                if (first == null) first = prev;
                second = cur;
            }
            prev = cur;
            cur = cur.right;
        }
        int t = first.val; first.val = second.val; second.val = t;
    }
}`,
          cpp: r`class Solution {
public:
    void recoverTree(TreeNode* root) {
        TreeNode *cur = root, *prev = nullptr, *first = nullptr, *second = nullptr;
        while (cur) {
            if (cur->left) {
                TreeNode* pred = cur->left;
                while (pred->right && pred->right != cur) pred = pred->right;
                if (!pred->right) { pred->right = cur; cur = cur->left; continue; }
                pred->right = nullptr;
            }
            if (prev && prev->val > cur->val) {
                if (!first) first = prev;
                second = cur;
            }
            prev = cur;
            cur = cur->right;
        }
        swap(first->val, second->val);
    }
};`,
          python: r`class Solution:
    def recoverTree(self, root: Optional[TreeNode]) -> None:
        cur, prev, first, second = root, None, None, None
        while cur:
            if cur.left:
                pred = cur.left
                while pred.right and pred.right is not cur:
                    pred = pred.right
                if not pred.right:
                    pred.right = cur
                    cur = cur.left
                    continue
                pred.right = None
            if prev and prev.val > cur.val:
                if not first:
                    first = prev
                second = cur
            prev = cur
            cur = cur.right
        first.val, second.val = second.val, first.val`,
          javascript: r`var recoverTree = function(root) {
    let cur = root, prev = null, first = null, second = null;
    while (cur) {
        if (cur.left) {
            let pred = cur.left;
            while (pred.right && pred.right !== cur) pred = pred.right;
            if (!pred.right) { pred.right = cur; cur = cur.left; continue; }
            pred.right = null;
        }
        if (prev && prev.val > cur.val) {
            if (!first) first = prev;
            second = cur;
        }
        prev = cur;
        cur = cur.right;
    }
    [first.val, second.val] = [second.val, first.val];
};`,
        },
      },
    ],
  },
};
