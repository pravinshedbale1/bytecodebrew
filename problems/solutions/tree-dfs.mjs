const r = String.raw;

export default {
  'maximum-depth-of-binary-tree': {
    pattern: 'Tree DFS returning a value up (depth = 1 + max of the children\'s depths)',
    approaches: [
      {
        level: 'Optimal', name: 'Recursive DFS',
        idea: 'The depth of a tree is one more than the deeper of its two subtrees; an empty tree has depth 0.',
        steps: [
          'If `root` is null, return 0.',
          'Return `1 + max(maxDepth(root.left), maxDepth(root.right))`.',
        ],
        time: 'O(n)', space: 'O(h)',
        why: 'Every node is visited once. The recursion stack is as deep as the tree height h: O(log n) when balanced, O(n) for a chain.',
        code: {
          java: r`class Solution {
    public int maxDepth(TreeNode root) {
        if (root == null) return 0;
        return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
    }
}`,
          cpp: r`class Solution {
public:
    int maxDepth(TreeNode* root) {
        if (!root) return 0;
        return 1 + max(maxDepth(root->left), maxDepth(root->right));
    }
};`,
          python: r`class Solution:
    def maxDepth(self, root: Optional[TreeNode]) -> int:
        if not root:
            return 0
        return 1 + max(self.maxDepth(root.left), self.maxDepth(root.right))`,
          javascript: r`var maxDepth = function(root) {
    if (!root) return 0;
    return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
};`,
        },
      },
      {
        level: 'Optimal', name: 'Level-order BFS, counting levels',
        idea: 'Process the tree one level at a time with a queue; the number of levels is the depth. No recursion, so a very deep tree cannot overflow the call stack.',
        steps: [
          'If `root` is null, return 0. Put `root` in a queue; `depth = 0`.',
          'While the queue is not empty: take exactly the nodes currently in it (one level), adding their children.',
          'Increase `depth` after each level; return it.',
        ],
        time: 'O(n)', space: 'O(w)',
        why: 'Every node is enqueued once. The queue holds at most one level, whose size w can be up to about n/2 in a full tree.',
        code: {
          java: r`class Solution {
    public int maxDepth(TreeNode root) {
        if (root == null) return 0;
        Deque<TreeNode> queue = new ArrayDeque<>();
        queue.add(root);
        int depth = 0;
        while (!queue.isEmpty()) {
            for (int k = queue.size(); k > 0; k--) {
                TreeNode node = queue.poll();
                if (node.left != null) queue.add(node.left);
                if (node.right != null) queue.add(node.right);
            }
            depth++;
        }
        return depth;
    }
}`,
          cpp: r`class Solution {
public:
    int maxDepth(TreeNode* root) {
        if (!root) return 0;
        queue<TreeNode*> q;
        q.push(root);
        int depth = 0;
        while (!q.empty()) {
            for (int k = q.size(); k > 0; k--) {
                TreeNode* node = q.front();
                q.pop();
                if (node->left) q.push(node->left);
                if (node->right) q.push(node->right);
            }
            depth++;
        }
        return depth;
    }
};`,
          python: r`class Solution:
    def maxDepth(self, root: Optional[TreeNode]) -> int:
        if not root:
            return 0
        queue, depth = deque([root]), 0
        while queue:
            for _ in range(len(queue)):
                node = queue.popleft()
                if node.left:
                    queue.append(node.left)
                if node.right:
                    queue.append(node.right)
            depth += 1
        return depth`,
          javascript: r`var maxDepth = function(root) {
    if (!root) return 0;
    let level = [root], depth = 0;
    while (level.length) {
        const next = [];
        for (const node of level) {
            if (node.left) next.push(node.left);
            if (node.right) next.push(node.right);
        }
        level = next;
        depth++;
    }
    return depth;
};`,
        },
      },
    ],
  },

  'same-tree': {
    pattern: 'Simultaneous DFS over two trees',
    approaches: [
      {
        level: 'Brute force', name: 'Serialise both trees and compare the strings',
        idea: 'Write each tree as a preorder string that includes a marker for every missing child. Two trees are the same exactly when their strings are equal.',
        steps: [
          'Serialise a tree: for null write `#`, otherwise write the value, then serialise left and right, separated by commas.',
          'Serialise `p` and `q`.',
          'Return whether the two strings are equal.',
        ],
        time: 'O(n + m)', space: 'O(n + m)',
        why: 'Both trees are walked fully even if they differ at the root, and both strings are stored. The null markers matter: without them `[1,2]` and `[1,null,2]` would look the same.',
        code: {
          java: r`class Solution {
    public boolean isSameTree(TreeNode p, TreeNode q) {
        return write(p, new StringBuilder()).toString().equals(write(q, new StringBuilder()).toString());
    }

    private StringBuilder write(TreeNode t, StringBuilder sb) {
        if (t == null) return sb.append("#,");
        sb.append(t.val).append(',');
        write(t.left, sb);
        return write(t.right, sb);
    }
}`,
          cpp: r`class Solution {
    void write(TreeNode* t, string& out) {
        if (!t) { out += "#,"; return; }
        out += to_string(t->val) + ",";
        write(t->left, out);
        write(t->right, out);
    }
public:
    bool isSameTree(TreeNode* p, TreeNode* q) {
        string a, b;
        write(p, a);
        write(q, b);
        return a == b;
    }
};`,
          python: r`class Solution:
    def isSameTree(self, p: Optional[TreeNode], q: Optional[TreeNode]) -> bool:
        def write(t):
            return "#" if not t else f"{t.val},{write(t.left)},{write(t.right)}"
        return write(p) == write(q)`,
          javascript: r`var isSameTree = function(p, q) {
    const write = (t) => (t ? t.val + ',' + write(t.left) + ',' + write(t.right) : '#');
    return write(p) === write(q);
};`,
        },
      },
      {
        level: 'Optimal', name: 'Recursive comparison',
        idea: 'Two trees are the same if both are empty, or both roots exist with equal values and their left subtrees and right subtrees are the same.',
        steps: [
          'If both are null, return true; if exactly one is null, return false.',
          'If the values differ, return false.',
          'Return `same(p.left, q.left) && same(p.right, q.right)`.',
        ],
        time: 'O(min(n, m))', space: 'O(h)',
        why: 'It stops at the first difference, so it visits at most the smaller tree. The stack is as deep as the tree height.',
        code: {
          java: r`class Solution {
    public boolean isSameTree(TreeNode p, TreeNode q) {
        if (p == null || q == null) return p == q;
        return p.val == q.val && isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
    }
}`,
          cpp: r`class Solution {
public:
    bool isSameTree(TreeNode* p, TreeNode* q) {
        if (!p || !q) return p == q;
        return p->val == q->val && isSameTree(p->left, q->left) && isSameTree(p->right, q->right);
    }
};`,
          python: r`class Solution:
    def isSameTree(self, p: Optional[TreeNode], q: Optional[TreeNode]) -> bool:
        if not p or not q:
            return p is q
        return p.val == q.val and self.isSameTree(p.left, q.left) and self.isSameTree(p.right, q.right)`,
          javascript: r`var isSameTree = function(p, q) {
    if (!p || !q) return p === q;
    return p.val === q.val && isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
};`,
        },
      },
    ],
  },

  'invert-binary-tree': {
    pattern: 'Tree DFS (or BFS) visiting every node once and swapping its children',
    approaches: [
      {
        level: 'Optimal', name: 'Recursive DFS',
        idea: 'Mirroring a tree means mirroring both subtrees and swapping them.',
        steps: [
          'If `root` is null, return null.',
          'Invert the left and right subtrees.',
          'Swap `root.left` and `root.right`; return `root`.',
        ],
        time: 'O(n)', space: 'O(h)',
        why: 'Each node is visited once; the stack is as deep as the tree height h.',
        code: {
          java: r`class Solution {
    public TreeNode invertTree(TreeNode root) {
        if (root == null) return null;
        TreeNode left = invertTree(root.left);
        root.left = invertTree(root.right);
        root.right = left;
        return root;
    }
}`,
          cpp: r`class Solution {
public:
    TreeNode* invertTree(TreeNode* root) {
        if (!root) return nullptr;
        TreeNode* left = invertTree(root->left);
        root->left = invertTree(root->right);
        root->right = left;
        return root;
    }
};`,
          python: r`class Solution:
    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:
        if root:
            root.left, root.right = self.invertTree(root.right), self.invertTree(root.left)
        return root`,
          javascript: r`var invertTree = function(root) {
    if (!root) return null;
    [root.left, root.right] = [invertTree(root.right), invertTree(root.left)];
    return root;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Iterative BFS with a queue',
        idea: 'The order in which nodes are visited does not matter: every node just needs its children swapped once. A queue visits them all without recursion.',
        steps: [
          'If `root` is null, return it. Put `root` in a queue.',
          'Pop a node, swap its children, and push the non-null children.',
          'Repeat until the queue is empty; return `root`.',
        ],
        time: 'O(n)', space: 'O(w)',
        why: 'Each node is processed once; the queue holds at most one level (width w).',
        code: {
          java: r`class Solution {
    public TreeNode invertTree(TreeNode root) {
        if (root == null) return null;
        Deque<TreeNode> queue = new ArrayDeque<>();
        queue.add(root);
        while (!queue.isEmpty()) {
            TreeNode node = queue.poll();
            TreeNode t = node.left; node.left = node.right; node.right = t;
            if (node.left != null) queue.add(node.left);
            if (node.right != null) queue.add(node.right);
        }
        return root;
    }
}`,
          cpp: r`class Solution {
public:
    TreeNode* invertTree(TreeNode* root) {
        if (!root) return nullptr;
        queue<TreeNode*> q;
        q.push(root);
        while (!q.empty()) {
            TreeNode* node = q.front();
            q.pop();
            swap(node->left, node->right);
            if (node->left) q.push(node->left);
            if (node->right) q.push(node->right);
        }
        return root;
    }
};`,
          python: r`class Solution:
    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:
        queue = deque([root] if root else [])
        while queue:
            node = queue.popleft()
            node.left, node.right = node.right, node.left
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        return root`,
          javascript: r`var invertTree = function(root) {
    const queue = root ? [root] : [];
    for (let i = 0; i < queue.length; i++) {
        const node = queue[i];
        [node.left, node.right] = [node.right, node.left];
        if (node.left) queue.push(node.left);
        if (node.right) queue.push(node.right);
    }
    return root;
};`,
        },
      },
    ],
  },

  'symmetric-tree': {
    pattern: 'Mirror DFS: compare left.left with right.right and left.right with right.left',
    approaches: [
      {
        level: 'Brute force', name: 'Build a mirrored copy and compare',
        idea: 'A tree is symmetric when it equals its own mirror image. Build a mirrored copy, then check the two trees are the same.',
        steps: [
          'Build `mirror(t)`: a new node with the same value, whose left is `mirror(t.right)` and right is `mirror(t.left)`.',
          'Compare `root` and `mirror(root)` with the Same Tree check.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'The copy has n new nodes; the comparison is O(n).',
        code: {
          java: r`class Solution {
    public boolean isSymmetric(TreeNode root) {
        return same(root, mirror(root));
    }

    private TreeNode mirror(TreeNode t) {
        return t == null ? null : new TreeNode(t.val, mirror(t.right), mirror(t.left));
    }

    private boolean same(TreeNode a, TreeNode b) {
        if (a == null || b == null) return a == b;
        return a.val == b.val && same(a.left, b.left) && same(a.right, b.right);
    }
}`,
          cpp: r`class Solution {
    TreeNode* mirror(TreeNode* t) {
        return t ? new TreeNode(t->val, mirror(t->right), mirror(t->left)) : nullptr;
    }
    bool same(TreeNode* a, TreeNode* b) {
        if (!a || !b) return a == b;
        return a->val == b->val && same(a->left, b->left) && same(a->right, b->right);
    }
public:
    bool isSymmetric(TreeNode* root) {
        return same(root, mirror(root));
    }
};`,
          python: r`class Solution:
    def isSymmetric(self, root: Optional[TreeNode]) -> bool:
        def mirror(t):
            return TreeNode(t.val, mirror(t.right), mirror(t.left)) if t else None
        def same(a, b):
            if not a or not b:
                return a is b
            return a.val == b.val and same(a.left, b.left) and same(a.right, b.right)
        return same(root, mirror(root))`,
          javascript: r`var isSymmetric = function(root) {
    const mirror = (t) => (t ? new TreeNode(t.val, mirror(t.right), mirror(t.left)) : null);
    const same = (a, b) => {
        if (!a || !b) return a === b;
        return a.val === b.val && same(a.left, b.left) && same(a.right, b.right);
    };
    return same(root, mirror(root));
};`,
        },
      },
      {
        level: 'Optimal', name: 'Compare the two halves as mirror images',
        idea: 'The left and right subtrees mirror each other when their roots are equal, the outer children mirror each other (`a.left` with `b.right`), and the inner children do (`a.right` with `b.left`).',
        steps: [
          '`mirror(a, b)`: if both are null, true; if one is null, false.',
          'Return `a.val == b.val && mirror(a.left, b.right) && mirror(a.right, b.left)`.',
          'Answer `mirror(root.left, root.right)`.',
        ],
        time: 'O(n)', space: 'O(h)',
        why: 'Each node is visited once with no copy; only the recursion stack (height h) is used.',
        code: {
          java: r`class Solution {
    public boolean isSymmetric(TreeNode root) {
        return mirror(root.left, root.right);
    }

    private boolean mirror(TreeNode a, TreeNode b) {
        if (a == null || b == null) return a == b;
        return a.val == b.val && mirror(a.left, b.right) && mirror(a.right, b.left);
    }
}`,
          cpp: r`class Solution {
    bool mirror(TreeNode* a, TreeNode* b) {
        if (!a || !b) return a == b;
        return a->val == b->val && mirror(a->left, b->right) && mirror(a->right, b->left);
    }
public:
    bool isSymmetric(TreeNode* root) {
        return mirror(root->left, root->right);
    }
};`,
          python: r`class Solution:
    def isSymmetric(self, root: Optional[TreeNode]) -> bool:
        def mirror(a, b):
            if not a or not b:
                return a is b
            return a.val == b.val and mirror(a.left, b.right) and mirror(a.right, b.left)
        return mirror(root.left, root.right)`,
          javascript: r`var isSymmetric = function(root) {
    const mirror = (a, b) => {
        if (!a || !b) return a === b;
        return a.val === b.val && mirror(a.left, b.right) && mirror(a.right, b.left);
    };
    return mirror(root.left, root.right);
};`,
        },
      },
    ],
  },

  'path-sum': {
    pattern: 'Top-down DFS carrying the remaining sum',
    approaches: [
      {
        level: 'Brute force', name: 'Collect every root-to-leaf sum',
        idea: 'Walk the tree recording the sum of every root-to-leaf path, then check whether `targetSum` is among them.',
        steps: [
          'DFS carrying the running sum; at a leaf, append the sum to a list.',
          'Return whether `targetSum` is in the list (false for an empty tree).',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Every node is visited, and the list can hold up to about n/2 leaf sums even when the first path already matches.',
        code: {
          java: r`class Solution {
    public boolean hasPathSum(TreeNode root, int targetSum) {
        List<Integer> sums = new ArrayList<>();
        collect(root, 0, sums);
        return sums.contains(targetSum);
    }

    private void collect(TreeNode t, int sum, List<Integer> sums) {
        if (t == null) return;
        sum += t.val;
        if (t.left == null && t.right == null) sums.add(sum);
        collect(t.left, sum, sums);
        collect(t.right, sum, sums);
    }
}`,
          cpp: r`class Solution {
    void collect(TreeNode* t, int sum, vector<int>& sums) {
        if (!t) return;
        sum += t->val;
        if (!t->left && !t->right) sums.push_back(sum);
        collect(t->left, sum, sums);
        collect(t->right, sum, sums);
    }
public:
    bool hasPathSum(TreeNode* root, int targetSum) {
        vector<int> sums;
        collect(root, 0, sums);
        return find(sums.begin(), sums.end(), targetSum) != sums.end();
    }
};`,
          python: r`class Solution:
    def hasPathSum(self, root: Optional[TreeNode], targetSum: int) -> bool:
        sums = []
        def collect(t, s):
            if not t:
                return
            s += t.val
            if not t.left and not t.right:
                sums.append(s)
            collect(t.left, s)
            collect(t.right, s)
        collect(root, 0)
        return targetSum in sums`,
          javascript: r`var hasPathSum = function(root, targetSum) {
    const sums = [];
    const collect = (t, s) => {
        if (!t) return;
        s += t.val;
        if (!t.left && !t.right) sums.push(s);
        collect(t.left, s);
        collect(t.right, s);
    };
    collect(root, 0);
    return sums.includes(targetSum);
};`,
        },
      },
      {
        level: 'Optimal', name: 'DFS subtracting as you go',
        idea: 'Pass down how much is still needed. At a leaf, the path works exactly when the remainder equals the leaf\'s value. Return as soon as one path works.',
        steps: [
          'If `root` is null, return false.',
          'If `root` is a leaf, return `root.val == targetSum`.',
          'Otherwise return `hasPathSum(left, targetSum − root.val) || hasPathSum(right, targetSum − root.val)`.',
        ],
        time: 'O(n)', space: 'O(h)',
        why: 'Each node at most once, stopping early on success; only the recursion stack is used.',
        code: {
          java: r`class Solution {
    public boolean hasPathSum(TreeNode root, int targetSum) {
        if (root == null) return false;
        if (root.left == null && root.right == null) return root.val == targetSum;
        int rest = targetSum - root.val;
        return hasPathSum(root.left, rest) || hasPathSum(root.right, rest);
    }
}`,
          cpp: r`class Solution {
public:
    bool hasPathSum(TreeNode* root, int targetSum) {
        if (!root) return false;
        if (!root->left && !root->right) return root->val == targetSum;
        int rest = targetSum - root->val;
        return hasPathSum(root->left, rest) || hasPathSum(root->right, rest);
    }
};`,
          python: r`class Solution:
    def hasPathSum(self, root: Optional[TreeNode], targetSum: int) -> bool:
        if not root:
            return False
        if not root.left and not root.right:
            return root.val == targetSum
        rest = targetSum - root.val
        return self.hasPathSum(root.left, rest) or self.hasPathSum(root.right, rest)`,
          javascript: r`var hasPathSum = function(root, targetSum) {
    if (!root) return false;
    if (!root.left && !root.right) return root.val === targetSum;
    const rest = targetSum - root.val;
    return hasPathSum(root.left, rest) || hasPathSum(root.right, rest);
};`,
        },
      },
    ],
  },

  'balanced-binary-tree': {
    pattern: 'Bottom-up DFS returning height, with −1 meaning "already unbalanced"',
    approaches: [
      {
        level: 'Brute force', name: 'Top-down: compute heights at every node',
        idea: 'Check the definition directly: at each node, compute both subtree heights from scratch and compare them, then check both subtrees the same way.',
        steps: [
          '`height(t)` = 0 for null, else `1 + max(height(left), height(right))`.',
          '`isBalanced(t)`: true for null; otherwise `|height(left) − height(right)| <= 1` and both subtrees are balanced.',
        ],
        time: 'O(n²)', space: 'O(h)',
        why: 'Each node\'s height is recomputed once for every ancestor: O(n·h), which is O(n²) for a chain-like tree.',
        code: {
          java: r`class Solution {
    public boolean isBalanced(TreeNode root) {
        if (root == null) return true;
        return Math.abs(height(root.left) - height(root.right)) <= 1 && isBalanced(root.left) && isBalanced(root.right);
    }

    private int height(TreeNode t) {
        return t == null ? 0 : 1 + Math.max(height(t.left), height(t.right));
    }
}`,
          cpp: r`class Solution {
    int height(TreeNode* t) {
        return t ? 1 + max(height(t->left), height(t->right)) : 0;
    }
public:
    bool isBalanced(TreeNode* root) {
        if (!root) return true;
        return abs(height(root->left) - height(root->right)) <= 1 && isBalanced(root->left) && isBalanced(root->right);
    }
};`,
          python: r`class Solution:
    def isBalanced(self, root: Optional[TreeNode]) -> bool:
        def height(t):
            return 1 + max(height(t.left), height(t.right)) if t else 0
        if not root:
            return True
        return abs(height(root.left) - height(root.right)) <= 1 and self.isBalanced(root.left) and self.isBalanced(root.right)`,
          javascript: r`var isBalanced = function(root) {
    const height = (t) => (t ? 1 + Math.max(height(t.left), height(t.right)) : 0);
    if (!root) return true;
    return Math.abs(height(root.left) - height(root.right)) <= 1 && isBalanced(root.left) && isBalanced(root.right);
};`,
        },
      },
      {
        level: 'Optimal', name: 'Bottom-up heights with an early stop',
        idea: 'Compute each node\'s height once from its children\'s heights. If any subtree is unbalanced, return −1 and pass it straight up, skipping the rest of the work.',
        steps: [
          '`check(t)`: return 0 for null.',
          '`l = check(t.left)`; if −1, return −1. Same for `r = check(t.right)`.',
          'If `|l − r| > 1`, return −1; otherwise return `1 + max(l, r)`.',
          'The tree is balanced when `check(root) != −1`.',
        ],
        time: 'O(n)', space: 'O(h)',
        why: 'Each node is visited once and its height reused by its parent; the stack is as deep as the height.',
        code: {
          java: r`class Solution {
    public boolean isBalanced(TreeNode root) {
        return check(root) != -1;
    }

    private int check(TreeNode t) {
        if (t == null) return 0;
        int l = check(t.left);
        if (l == -1) return -1;
        int r = check(t.right);
        if (r == -1 || Math.abs(l - r) > 1) return -1;
        return 1 + Math.max(l, r);
    }
}`,
          cpp: r`class Solution {
    int check(TreeNode* t) {
        if (!t) return 0;
        int l = check(t->left);
        if (l == -1) return -1;
        int r = check(t->right);
        if (r == -1 || abs(l - r) > 1) return -1;
        return 1 + max(l, r);
    }
public:
    bool isBalanced(TreeNode* root) {
        return check(root) != -1;
    }
};`,
          python: r`class Solution:
    def isBalanced(self, root: Optional[TreeNode]) -> bool:
        def check(t):
            if not t:
                return 0
            l = check(t.left)
            if l == -1:
                return -1
            r = check(t.right)
            if r == -1 or abs(l - r) > 1:
                return -1
            return 1 + max(l, r)
        return check(root) != -1`,
          javascript: r`var isBalanced = function(root) {
    const check = (t) => {
        if (!t) return 0;
        const l = check(t.left);
        if (l === -1) return -1;
        const r = check(t.right);
        if (r === -1 || Math.abs(l - r) > 1) return -1;
        return 1 + Math.max(l, r);
    };
    return check(root) !== -1;
};`,
        },
      },
    ],
  },

  'count-good-nodes-in-binary-tree': {
    pattern: 'Top-down DFS carrying the path maximum',
    approaches: [
      {
        level: 'Brute force', name: 'Keep the whole path and scan it at every node',
        idea: 'Walk the tree keeping the list of values on the current root-to-node path. At each node, scan that list to see whether anything is larger.',
        steps: [
          'DFS with a `path` list: push the node\'s value before visiting its children and pop it afterwards.',
          'At each node, if no value in `path` is greater than the node\'s value, count it.',
          'Return the count.',
        ],
        time: 'O(n·h)', space: 'O(h)',
        why: 'Each node scans a path of length up to the height h: O(n²) for a chain-like tree.',
        code: {
          java: r`class Solution {
    private final List<Integer> path = new ArrayList<>();

    public int goodNodes(TreeNode root) {
        if (root == null) return 0;
        boolean good = true;
        for (int v : path) if (v > root.val) { good = false; break; }
        path.add(root.val);
        int count = (good ? 1 : 0) + goodNodes(root.left) + goodNodes(root.right);
        path.remove(path.size() - 1);
        return count;
    }
}`,
          cpp: r`class Solution {
    vector<int> path;
public:
    int goodNodes(TreeNode* root) {
        if (!root) return 0;
        bool good = true;
        for (int v : path) if (v > root->val) { good = false; break; }
        path.push_back(root->val);
        int count = (good ? 1 : 0) + goodNodes(root->left) + goodNodes(root->right);
        path.pop_back();
        return count;
    }
};`,
          python: r`class Solution:
    def goodNodes(self, root: TreeNode) -> int:
        path = []
        def dfs(t):
            if not t:
                return 0
            good = all(v <= t.val for v in path)
            path.append(t.val)
            count = (1 if good else 0) + dfs(t.left) + dfs(t.right)
            path.pop()
            return count
        return dfs(root)`,
          javascript: r`var goodNodes = function(root) {
    const path = [];
    const dfs = (t) => {
        if (!t) return 0;
        const good = path.every((v) => v <= t.val);
        path.push(t.val);
        const count = (good ? 1 : 0) + dfs(t.left) + dfs(t.right);
        path.pop();
        return count;
    };
    return dfs(root);
};`,
        },
      },
      {
        level: 'Optimal', name: 'DFS carrying the maximum so far',
        idea: 'Only the largest value on the path matters, so pass that one number down instead of the whole path.',
        steps: [
          '`dfs(t, maxSoFar)`: return 0 for null.',
          'The node is good if `t.val >= maxSoFar`.',
          'Recurse into both children with `max(maxSoFar, t.val)` and add up the counts.',
          'Start with `dfs(root, root.val)`.',
        ],
        time: 'O(n)', space: 'O(h)',
        why: 'O(1) work per node; only the recursion stack is used.',
        code: {
          java: r`class Solution {
    public int goodNodes(TreeNode root) {
        return dfs(root, root.val);
    }

    private int dfs(TreeNode t, int maxSoFar) {
        if (t == null) return 0;
        int max = Math.max(maxSoFar, t.val);
        return (t.val >= maxSoFar ? 1 : 0) + dfs(t.left, max) + dfs(t.right, max);
    }
}`,
          cpp: r`class Solution {
    int dfs(TreeNode* t, int maxSoFar) {
        if (!t) return 0;
        int mx = max(maxSoFar, t->val);
        return (t->val >= maxSoFar ? 1 : 0) + dfs(t->left, mx) + dfs(t->right, mx);
    }
public:
    int goodNodes(TreeNode* root) {
        return dfs(root, root->val);
    }
};`,
          python: r`class Solution:
    def goodNodes(self, root: TreeNode) -> int:
        def dfs(t, max_so_far):
            if not t:
                return 0
            m = max(max_so_far, t.val)
            return (1 if t.val >= max_so_far else 0) + dfs(t.left, m) + dfs(t.right, m)
        return dfs(root, root.val)`,
          javascript: r`var goodNodes = function(root) {
    const dfs = (t, maxSoFar) => {
        if (!t) return 0;
        const m = Math.max(maxSoFar, t.val);
        return (t.val >= maxSoFar ? 1 : 0) + dfs(t.left, m) + dfs(t.right, m);
    };
    return dfs(root, root.val);
};`,
        },
      },
    ],
  },

  'lowest-common-ancestor-of-a-binary-tree': {
    pattern: 'Post-order DFS: the first node where p and q come from different sides (or it is one of them)',
    approaches: [
      {
        level: 'Better', name: 'Find both root-to-node paths and compare them',
        idea: 'Record the path from the root to `p` and from the root to `q`. Both paths start the same way; the last node they share is the lowest common ancestor.',
        steps: [
          'DFS to find the path (list of nodes) from `root` to `p`, and likewise to `q`.',
          'Walk both paths together while the nodes are the same.',
          'Return the last shared node.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Two DFS passes over the tree; each path can be up to n nodes long in a chain-like tree.',
        code: {
          java: r`class Solution {
    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        List<TreeNode> a = new ArrayList<>(), b = new ArrayList<>();
        path(root, p, a);
        path(root, q, b);
        TreeNode lca = null;
        for (int i = 0; i < Math.min(a.size(), b.size()) && a.get(i) == b.get(i); i++) lca = a.get(i);
        return lca;
    }

    private boolean path(TreeNode t, TreeNode target, List<TreeNode> out) {
        if (t == null) return false;
        out.add(t);
        if (t == target || path(t.left, target, out) || path(t.right, target, out)) return true;
        out.remove(out.size() - 1);
        return false;
    }
}`,
          cpp: r`class Solution {
    bool path(TreeNode* t, TreeNode* target, vector<TreeNode*>& out) {
        if (!t) return false;
        out.push_back(t);
        if (t == target || path(t->left, target, out) || path(t->right, target, out)) return true;
        out.pop_back();
        return false;
    }
public:
    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
        vector<TreeNode*> a, b;
        path(root, p, a);
        path(root, q, b);
        TreeNode* lca = nullptr;
        for (size_t i = 0; i < min(a.size(), b.size()) && a[i] == b[i]; i++) lca = a[i];
        return lca;
    }
};`,
          python: r`class Solution:
    def lowestCommonAncestor(self, root: 'TreeNode', p: 'TreeNode', q: 'TreeNode') -> 'TreeNode':
        def path(t, target, out):
            if not t:
                return False
            out.append(t)
            if t is target or path(t.left, target, out) or path(t.right, target, out):
                return True
            out.pop()
            return False
        a, b = [], []
        path(root, p, a)
        path(root, q, b)
        lca = None
        for x, y in zip(a, b):
            if x is not y:
                break
            lca = x
        return lca`,
          javascript: r`var lowestCommonAncestor = function(root, p, q) {
    const path = (t, target, out) => {
        if (!t) return false;
        out.push(t);
        if (t === target || path(t.left, target, out) || path(t.right, target, out)) return true;
        out.pop();
        return false;
    };
    const a = [], b = [];
    path(root, p, a);
    path(root, q, b);
    let lca = null;
    for (let i = 0; i < Math.min(a.length, b.length) && a[i] === b[i]; i++) lca = a[i];
    return lca;
};`,
        },
      },
      {
        level: 'Optimal', name: 'One recursive pass',
        idea: 'Ask each subtree "do you contain p or q?" by returning the node found (or null). The first node where both the left and right answers are non-null is the LCA; if a node is itself `p` or `q`, it is the answer for its subtree.',
        steps: [
          'If `root` is null, `p` or `q`, return `root`.',
          'Recurse: `left = lca(root.left)`, `right = lca(root.right)`.',
          'If both are non-null, `p` and `q` are on different sides: return `root`.',
          'Otherwise return whichever one is non-null.',
        ],
        time: 'O(n)', space: 'O(h)',
        why: 'Each node is visited once; the recursion stack is as deep as the tree height. Returning a node that is `p` (or `q`) handles the case where one is an ancestor of the other.',
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
    ],
  },

  'construct-binary-tree-from-preorder-and-inorder-traversal': {
    pattern: 'Divide and conquer: preorder gives the root, inorder splits left and right subtrees',
    approaches: [
      {
        level: 'Brute force', name: 'Recursion with a linear search for the root',
        idea: 'The first preorder value is the root. Its position in the inorder list splits the inorder list into the left subtree (before it) and the right subtree (after it); the sizes tell how to split the preorder list too.',
        steps: [
          '`build(preStart, inStart, inEnd)`: if the inorder range is empty, return null.',
          'The root value is `preorder[preStart]`; scan `inorder[inStart..inEnd]` for it at index `k`.',
          'The left subtree has `k − inStart` nodes: build it from `preStart + 1` and inorder `[inStart, k − 1]`.',
          'Build the right subtree from `preStart + 1 + leftSize` and inorder `[k + 1, inEnd]`.',
        ],
        time: 'O(n²)', space: 'O(n)',
        why: 'Each of the n nodes scans its inorder range, which can be O(n) long in a skewed tree. Recursion depth is up to n.',
        code: {
          java: r`class Solution {
    public TreeNode buildTree(int[] preorder, int[] inorder) {
        return build(preorder, inorder, 0, 0, inorder.length - 1);
    }

    private TreeNode build(int[] pre, int[] in, int preStart, int inStart, int inEnd) {
        if (inStart > inEnd) return null;
        TreeNode root = new TreeNode(pre[preStart]);
        int k = inStart;
        while (in[k] != root.val) k++;
        int leftSize = k - inStart;
        root.left = build(pre, in, preStart + 1, inStart, k - 1);
        root.right = build(pre, in, preStart + 1 + leftSize, k + 1, inEnd);
        return root;
    }
}`,
          cpp: r`class Solution {
    TreeNode* build(vector<int>& pre, vector<int>& in, int preStart, int inStart, int inEnd) {
        if (inStart > inEnd) return nullptr;
        TreeNode* root = new TreeNode(pre[preStart]);
        int k = inStart;
        while (in[k] != root->val) k++;
        int leftSize = k - inStart;
        root->left = build(pre, in, preStart + 1, inStart, k - 1);
        root->right = build(pre, in, preStart + 1 + leftSize, k + 1, inEnd);
        return root;
    }
public:
    TreeNode* buildTree(vector<int>& preorder, vector<int>& inorder) {
        return build(preorder, inorder, 0, 0, (int) inorder.size() - 1);
    }
};`,
          python: r`class Solution:
    def buildTree(self, preorder: List[int], inorder: List[int]) -> Optional[TreeNode]:
        def build(pre_start, in_start, in_end):
            if in_start > in_end:
                return None
            root = TreeNode(preorder[pre_start])
            k = inorder.index(root.val, in_start, in_end + 1)
            left_size = k - in_start
            root.left = build(pre_start + 1, in_start, k - 1)
            root.right = build(pre_start + 1 + left_size, k + 1, in_end)
            return root
        return build(0, 0, len(inorder) - 1)`,
          javascript: r`var buildTree = function(preorder, inorder) {
    const build = (preStart, inStart, inEnd) => {
        if (inStart > inEnd) return null;
        const root = new TreeNode(preorder[preStart]);
        let k = inStart;
        while (inorder[k] !== root.val) k++;
        const leftSize = k - inStart;
        root.left = build(preStart + 1, inStart, k - 1);
        root.right = build(preStart + 1 + leftSize, k + 1, inEnd);
        return root;
    };
    return build(0, 0, inorder.length - 1);
};`,
        },
      },
      {
        level: 'Optimal', name: 'Recursion with a value → inorder-index map',
        idea: 'Same divide and conquer, but a hash map from value to inorder index finds each root in O(1) (values are distinct). Consuming preorder with a single moving index removes the size arithmetic.',
        steps: [
          'Map every inorder value to its index; set `next = 0` (the next preorder position).',
          '`build(lo, hi)`: if `lo > hi`, return null.',
          'Take the root value `preorder[next++]` and its inorder index `k`.',
          'Build the left subtree from `[lo, k − 1]` first (preorder lists the left subtree before the right), then the right from `[k + 1, hi]`.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Each node is created once with O(1) lookups. The map takes O(n) and the recursion is up to n deep for a skewed tree.',
        code: {
          java: r`class Solution {
    private final Map<Integer, Integer> index = new HashMap<>();
    private int next = 0;

    public TreeNode buildTree(int[] preorder, int[] inorder) {
        for (int i = 0; i < inorder.length; i++) index.put(inorder[i], i);
        return build(preorder, 0, inorder.length - 1);
    }

    private TreeNode build(int[] pre, int lo, int hi) {
        if (lo > hi) return null;
        TreeNode root = new TreeNode(pre[next++]);
        int k = index.get(root.val);
        root.left = build(pre, lo, k - 1);
        root.right = build(pre, k + 1, hi);
        return root;
    }
}`,
          cpp: r`class Solution {
    unordered_map<int, int> index;
    int next = 0;
    TreeNode* build(vector<int>& pre, int lo, int hi) {
        if (lo > hi) return nullptr;
        TreeNode* root = new TreeNode(pre[next++]);
        int k = index[root->val];
        root->left = build(pre, lo, k - 1);
        root->right = build(pre, k + 1, hi);
        return root;
    }
public:
    TreeNode* buildTree(vector<int>& preorder, vector<int>& inorder) {
        for (int i = 0; i < (int) inorder.size(); i++) index[inorder[i]] = i;
        return build(preorder, 0, (int) inorder.size() - 1);
    }
};`,
          python: r`class Solution:
    def buildTree(self, preorder: List[int], inorder: List[int]) -> Optional[TreeNode]:
        index = {v: i for i, v in enumerate(inorder)}
        nxt = 0
        def build(lo, hi):
            nonlocal nxt
            if lo > hi:
                return None
            root = TreeNode(preorder[nxt])
            nxt += 1
            k = index[root.val]
            root.left = build(lo, k - 1)
            root.right = build(k + 1, hi)
            return root
        return build(0, len(inorder) - 1)`,
          javascript: r`var buildTree = function(preorder, inorder) {
    const index = new Map(inorder.map((v, i) => [v, i]));
    let next = 0;
    const build = (lo, hi) => {
        if (lo > hi) return null;
        const root = new TreeNode(preorder[next++]);
        const k = index.get(root.val);
        root.left = build(lo, k - 1);
        root.right = build(k + 1, hi);
        return root;
    };
    return build(0, inorder.length - 1);
};`,
        },
      },
    ],
  },

  'serialize-and-deserialize-binary-tree': {
    pattern: 'Preorder (or level-order) traversal with explicit null markers',
    approaches: [
      {
        level: 'Optimal', name: 'Level order (BFS) with null markers',
        idea: 'Write the tree level by level, writing `#` for each missing child, like the test format. To rebuild, read values in the same order: each node read from the queue takes the next two tokens as its children.',
        steps: [
          'Serialise: BFS from the root; for each dequeued node write its value and enqueue both children; for null write `#`.',
          'Deserialise: split on commas. If the first token is `#`, the tree is empty.',
          'Create the root and put it in a queue; for each dequeued node, the next two tokens are its left and right children (create and enqueue those that are not `#`).',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Each node and each null marker (n + 1 of them) is written and read once. No recursion, so a 10⁵-deep chain is no problem.',
        code: {
          java: r`class Codec {
    public Codec() {
    }

    public String serialize(TreeNode root) {
        StringBuilder sb = new StringBuilder();
        Deque<TreeNode> queue = new ArrayDeque<>();
        if (root == null) return "#";
        queue.add(root);
        sb.append(root.val);
        while (!queue.isEmpty()) {
            TreeNode node = queue.poll();
            for (TreeNode child : new TreeNode[] { node.left, node.right }) {
                if (child == null) sb.append(",#");
                else { sb.append(',').append(child.val); queue.add(child); }
            }
        }
        return sb.toString();
    }

    public TreeNode deserialize(String data) {
        String[] t = data.split(",");
        if (t[0].equals("#")) return null;
        TreeNode root = new TreeNode(Integer.parseInt(t[0]));
        Deque<TreeNode> queue = new ArrayDeque<>();
        queue.add(root);
        int i = 1;
        while (!queue.isEmpty()) {
            TreeNode node = queue.poll();
            if (!t[i].equals("#")) { node.left = new TreeNode(Integer.parseInt(t[i])); queue.add(node.left); }
            i++;
            if (!t[i].equals("#")) { node.right = new TreeNode(Integer.parseInt(t[i])); queue.add(node.right); }
            i++;
        }
        return root;
    }
}`,
          cpp: r`class Codec {
public:
    Codec() {}

    string serialize(TreeNode* root) {
        if (!root) return "#";
        string out = to_string(root->val);
        queue<TreeNode*> q;
        q.push(root);
        while (!q.empty()) {
            TreeNode* node = q.front();
            q.pop();
            for (TreeNode* child : {node->left, node->right}) {
                if (!child) out += ",#";
                else { out += "," + to_string(child->val); q.push(child); }
            }
        }
        return out;
    }

    TreeNode* deserialize(string data) {
        vector<string> t;
        stringstream ss(data);
        string tok;
        while (getline(ss, tok, ',')) t.push_back(tok);
        if (t[0] == "#") return nullptr;
        TreeNode* root = new TreeNode(stoi(t[0]));
        queue<TreeNode*> q;
        q.push(root);
        size_t i = 1;
        while (!q.empty()) {
            TreeNode* node = q.front();
            q.pop();
            if (t[i] != "#") { node->left = new TreeNode(stoi(t[i])); q.push(node->left); }
            i++;
            if (t[i] != "#") { node->right = new TreeNode(stoi(t[i])); q.push(node->right); }
            i++;
        }
        return root;
    }
};`,
          python: r`class Codec:

    def __init__(self):
        pass

    def serialize(self, root: Optional[TreeNode]) -> str:
        if not root:
            return "#"
        out, queue = [str(root.val)], deque([root])
        while queue:
            node = queue.popleft()
            for child in (node.left, node.right):
                if child:
                    out.append(str(child.val))
                    queue.append(child)
                else:
                    out.append("#")
        return ",".join(out)

    def deserialize(self, data: str) -> Optional[TreeNode]:
        t = data.split(",")
        if t[0] == "#":
            return None
        root = TreeNode(int(t[0]))
        queue, i = deque([root]), 1
        while queue:
            node = queue.popleft()
            if t[i] != "#":
                node.left = TreeNode(int(t[i]))
                queue.append(node.left)
            if t[i + 1] != "#":
                node.right = TreeNode(int(t[i + 1]))
                queue.append(node.right)
            i += 2
        return root`,
          javascript: r`var serialize = function(root) {
    if (!root) return '#';
    const out = [String(root.val)], queue = [root];
    for (let h = 0; h < queue.length; h++) {
        for (const child of [queue[h].left, queue[h].right]) {
            if (child) { out.push(String(child.val)); queue.push(child); }
            else out.push('#');
        }
    }
    return out.join(',');
};

var deserialize = function(data) {
    const t = data.split(',');
    if (t[0] === '#') return null;
    const root = new TreeNode(Number(t[0])), queue = [root];
    let i = 1;
    for (let h = 0; h < queue.length; h++) {
        const node = queue[h];
        if (t[i] !== '#') { node.left = new TreeNode(Number(t[i])); queue.push(node.left); }
        i++;
        if (t[i] !== '#') { node.right = new TreeNode(Number(t[i])); queue.push(node.right); }
        i++;
    }
    return root;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Preorder DFS with null markers',
        idea: 'Write the root, then the left subtree, then the right subtree, with `#` for every null. Because every null is marked, preorder alone pins down the tree: reading tokens in the same order rebuilds it recursively.',
        steps: [
          'Serialise: `write(t)` writes `#` for null, else the value, then `write(t.left)`, `write(t.right)`.',
          'Deserialise: keep a shared index into the tokens; `read()` takes the next token — `#` means null, otherwise make a node and set `left = read()`, `right = read()`.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Each node and null marker is handled once. The recursion goes as deep as the tree; the judge runs Java and Python with a large stack, but in other settings a very deep tree favours the BFS version.',
        code: {
          java: r`class Codec {
    private String[] tokens;
    private int pos;

    public Codec() {
    }

    public String serialize(TreeNode root) {
        StringBuilder sb = new StringBuilder();
        write(root, sb);
        return sb.toString();
    }

    private void write(TreeNode t, StringBuilder sb) {
        if (t == null) { sb.append("#,"); return; }
        sb.append(t.val).append(',');
        write(t.left, sb);
        write(t.right, sb);
    }

    public TreeNode deserialize(String data) {
        tokens = data.split(",");
        pos = 0;
        return read();
    }

    private TreeNode read() {
        String tok = tokens[pos++];
        if (tok.equals("#")) return null;
        TreeNode node = new TreeNode(Integer.parseInt(tok));
        node.left = read();
        node.right = read();
        return node;
    }
}`,
          cpp: r`class Codec {
    vector<string> tokens;
    size_t pos = 0;
    void write(TreeNode* t, string& out) {
        if (!t) { out += "#,"; return; }
        out += to_string(t->val) + ",";
        write(t->left, out);
        write(t->right, out);
    }
    TreeNode* read() {
        string tok = tokens[pos++];
        if (tok == "#") return nullptr;
        TreeNode* node = new TreeNode(stoi(tok));
        node->left = read();
        node->right = read();
        return node;
    }
public:
    Codec() {}

    string serialize(TreeNode* root) {
        string out;
        write(root, out);
        return out;
    }

    TreeNode* deserialize(string data) {
        tokens.clear();
        stringstream ss(data);
        string tok;
        while (getline(ss, tok, ',')) tokens.push_back(tok);
        pos = 0;
        return read();
    }
};`,
          python: r`class Codec:

    def __init__(self):
        pass

    def serialize(self, root: Optional[TreeNode]) -> str:
        out = []
        def write(t):
            if not t:
                out.append("#")
                return
            out.append(str(t.val))
            write(t.left)
            write(t.right)
        write(root)
        return ",".join(out)

    def deserialize(self, data: str) -> Optional[TreeNode]:
        tokens = iter(data.split(","))
        def read():
            tok = next(tokens)
            if tok == "#":
                return None
            node = TreeNode(int(tok))
            node.left = read()
            node.right = read()
            return node
        return read()`,
          javascript: r`var serialize = function(root) {
    const out = [];
    const write = (t) => {
        if (!t) { out.push('#'); return; }
        out.push(String(t.val));
        write(t.left);
        write(t.right);
    };
    write(root);
    return out.join(',');
};

var deserialize = function(data) {
    const tokens = data.split(',');
    let pos = 0;
    const read = () => {
        const tok = tokens[pos++];
        if (tok === '#') return null;
        const node = new TreeNode(Number(tok));
        node.left = read();
        node.right = read();
        return node;
    };
    return read();
};`,
        },
      },
    ],
  },
};
