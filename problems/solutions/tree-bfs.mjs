const r = String.raw;

export default {
  'binary-tree-level-order-traversal': {
    pattern: 'BFS with a queue, one level at a time (take queue.size() nodes per level)',
    approaches: [
      {
        level: 'Optimal', name: 'BFS, level by level',
        idea: 'A queue visits nodes in level order. Taking exactly the number of nodes in the queue at the start of a round gives one complete level.',
        steps: [
          'If `root` is null, return an empty list. Put `root` in a queue.',
          'While the queue is not empty: let `size` be its length; pop `size` nodes, recording their values and enqueuing their children.',
          'Append that level\'s values to the answer.',
        ],
        time: 'O(n)', space: 'O(w)',
        why: 'Each node is enqueued and dequeued once. Besides the output, the queue holds at most one level (width w, up to about n/2).',
        code: {
          java: r`class Solution {
    public List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> out = new ArrayList<>();
        if (root == null) return out;
        Deque<TreeNode> queue = new ArrayDeque<>();
        queue.add(root);
        while (!queue.isEmpty()) {
            List<Integer> level = new ArrayList<>();
            for (int k = queue.size(); k > 0; k--) {
                TreeNode node = queue.poll();
                level.add(node.val);
                if (node.left != null) queue.add(node.left);
                if (node.right != null) queue.add(node.right);
            }
            out.add(level);
        }
        return out;
    }
}`,
          cpp: r`class Solution {
public:
    vector<vector<int>> levelOrder(TreeNode* root) {
        vector<vector<int>> out;
        if (!root) return out;
        queue<TreeNode*> q;
        q.push(root);
        while (!q.empty()) {
            vector<int> level;
            for (int k = q.size(); k > 0; k--) {
                TreeNode* node = q.front();
                q.pop();
                level.push_back(node->val);
                if (node->left) q.push(node->left);
                if (node->right) q.push(node->right);
            }
            out.push_back(level);
        }
        return out;
    }
};`,
          python: r`class Solution:
    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:
        out = []
        queue = deque([root] if root else [])
        while queue:
            level = []
            for _ in range(len(queue)):
                node = queue.popleft()
                level.append(node.val)
                if node.left:
                    queue.append(node.left)
                if node.right:
                    queue.append(node.right)
            out.append(level)
        return out`,
          javascript: r`var levelOrder = function(root) {
    const out = [];
    let level = root ? [root] : [];
    while (level.length) {
        out.push(level.map((node) => node.val));
        const next = [];
        for (const node of level) {
            if (node.left) next.push(node.left);
            if (node.right) next.push(node.right);
        }
        level = next;
    }
    return out;
};`,
        },
      },
      {
        level: 'Optimal', name: 'DFS that files each value under its depth',
        idea: 'A preorder DFS (left before right) reaches the nodes of every level from left to right, so appending each value to the list for its depth produces the same answer.',
        steps: [
          '`dfs(node, depth)`: if null, return.',
          'If the answer has no list for `depth` yet, add one.',
          'Append the value to `out[depth]`; recurse left, then right, with `depth + 1`.',
        ],
        time: 'O(n)', space: 'O(h)',
        why: 'Each node is visited once; besides the output only the recursion stack (height h) is used.',
        code: {
          java: r`class Solution {
    public List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> out = new ArrayList<>();
        dfs(root, 0, out);
        return out;
    }

    private void dfs(TreeNode node, int depth, List<List<Integer>> out) {
        if (node == null) return;
        if (out.size() == depth) out.add(new ArrayList<>());
        out.get(depth).add(node.val);
        dfs(node.left, depth + 1, out);
        dfs(node.right, depth + 1, out);
    }
}`,
          cpp: r`class Solution {
    void dfs(TreeNode* node, int depth, vector<vector<int>>& out) {
        if (!node) return;
        if ((int) out.size() == depth) out.push_back({});
        out[depth].push_back(node->val);
        dfs(node->left, depth + 1, out);
        dfs(node->right, depth + 1, out);
    }
public:
    vector<vector<int>> levelOrder(TreeNode* root) {
        vector<vector<int>> out;
        dfs(root, 0, out);
        return out;
    }
};`,
          python: r`class Solution:
    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:
        out = []
        def dfs(node, depth):
            if not node:
                return
            if len(out) == depth:
                out.append([])
            out[depth].append(node.val)
            dfs(node.left, depth + 1)
            dfs(node.right, depth + 1)
        dfs(root, 0)
        return out`,
          javascript: r`var levelOrder = function(root) {
    const out = [];
    const dfs = (node, depth) => {
        if (!node) return;
        if (out.length === depth) out.push([]);
        out[depth].push(node.val);
        dfs(node.left, depth + 1);
        dfs(node.right, depth + 1);
    };
    dfs(root, 0);
    return out;
};`,
        },
      },
    ],
  },

  'average-of-levels-in-binary-tree': {
    pattern: 'Level-order BFS with a per-level aggregate (sum and count)',
    approaches: [
      {
        level: 'Optimal', name: 'BFS, summing each level',
        idea: 'Process one level at a time; add up its values in a 64-bit (or floating) sum and divide by the number of nodes on it.',
        steps: [
          'Put `root` in a queue.',
          'For each level: pop its `size` nodes, adding their values to `sum` and enqueuing children.',
          'Append `sum / size` to the answer.',
        ],
        time: 'O(n)', space: 'O(w)',
        why: 'Each node once; the queue holds one level. Values reach ±2³¹, so a 32-bit sum would overflow — use `long` / `long long`.',
        code: {
          java: r`class Solution {
    public List<Double> averageOfLevels(TreeNode root) {
        List<Double> out = new ArrayList<>();
        Deque<TreeNode> queue = new ArrayDeque<>();
        queue.add(root);
        while (!queue.isEmpty()) {
            int size = queue.size();
            long sum = 0;
            for (int k = 0; k < size; k++) {
                TreeNode node = queue.poll();
                sum += node.val;
                if (node.left != null) queue.add(node.left);
                if (node.right != null) queue.add(node.right);
            }
            out.add((double) sum / size);
        }
        return out;
    }
}`,
          cpp: r`class Solution {
public:
    vector<double> averageOfLevels(TreeNode* root) {
        vector<double> out;
        queue<TreeNode*> q;
        q.push(root);
        while (!q.empty()) {
            int size = q.size();
            long long sum = 0;
            for (int k = 0; k < size; k++) {
                TreeNode* node = q.front();
                q.pop();
                sum += node->val;
                if (node->left) q.push(node->left);
                if (node->right) q.push(node->right);
            }
            out.push_back((double) sum / size);
        }
        return out;
    }
};`,
          python: r`class Solution:
    def averageOfLevels(self, root: Optional[TreeNode]) -> List[float]:
        out, queue = [], deque([root])
        while queue:
            size, total = len(queue), 0
            for _ in range(size):
                node = queue.popleft()
                total += node.val
                if node.left:
                    queue.append(node.left)
                if node.right:
                    queue.append(node.right)
            out.append(total / size)
        return out`,
          javascript: r`var averageOfLevels = function(root) {
    const out = [];
    let level = [root];
    while (level.length) {
        let sum = 0;
        const next = [];
        for (const node of level) {
            sum += node.val;
            if (node.left) next.push(node.left);
            if (node.right) next.push(node.right);
        }
        out.push(sum / level.length);
        level = next;
    }
    return out;
};`,
        },
      },
      {
        level: 'Optimal', name: 'DFS collecting sum and count per depth',
        idea: 'Any traversal works if every node adds its value to the sum for its depth and bumps that depth\'s count. Divide at the end.',
        steps: [
          '`dfs(node, depth)`: if `depth` is new, add a sum of 0 and a count of 0.',
          'Add `node.val` to `sum[depth]`, increase `count[depth]`, and recurse into both children.',
          'Return `sum[d] / count[d]` for every depth.',
        ],
        time: 'O(n)', space: 'O(h)',
        why: 'Each node once; the per-depth arrays have h entries and the recursion is h deep.',
        code: {
          java: r`class Solution {
    private final List<Long> sum = new ArrayList<>();
    private final List<Integer> count = new ArrayList<>();

    public List<Double> averageOfLevels(TreeNode root) {
        dfs(root, 0);
        List<Double> out = new ArrayList<>();
        for (int d = 0; d < sum.size(); d++) out.add((double) sum.get(d) / count.get(d));
        return out;
    }

    private void dfs(TreeNode node, int depth) {
        if (node == null) return;
        if (sum.size() == depth) { sum.add(0L); count.add(0); }
        sum.set(depth, sum.get(depth) + node.val);
        count.set(depth, count.get(depth) + 1);
        dfs(node.left, depth + 1);
        dfs(node.right, depth + 1);
    }
}`,
          cpp: r`class Solution {
    vector<long long> sum;
    vector<int> count;
    void dfs(TreeNode* node, int depth) {
        if (!node) return;
        if ((int) sum.size() == depth) { sum.push_back(0); count.push_back(0); }
        sum[depth] += node->val;
        count[depth]++;
        dfs(node->left, depth + 1);
        dfs(node->right, depth + 1);
    }
public:
    vector<double> averageOfLevels(TreeNode* root) {
        dfs(root, 0);
        vector<double> out;
        for (size_t d = 0; d < sum.size(); d++) out.push_back((double) sum[d] / count[d]);
        return out;
    }
};`,
          python: r`class Solution:
    def averageOfLevels(self, root: Optional[TreeNode]) -> List[float]:
        total, count = [], []
        def dfs(node, depth):
            if not node:
                return
            if len(total) == depth:
                total.append(0)
                count.append(0)
            total[depth] += node.val
            count[depth] += 1
            dfs(node.left, depth + 1)
            dfs(node.right, depth + 1)
        dfs(root, 0)
        return [t / c for t, c in zip(total, count)]`,
          javascript: r`var averageOfLevels = function(root) {
    const sum = [], count = [];
    const dfs = (node, depth) => {
        if (!node) return;
        if (sum.length === depth) { sum.push(0); count.push(0); }
        sum[depth] += node.val;
        count[depth]++;
        dfs(node.left, depth + 1);
        dfs(node.right, depth + 1);
    };
    dfs(root, 0);
    return sum.map((s, d) => s / count[d]);
};`,
        },
      },
    ],
  },

  'minimum-depth-of-binary-tree': {
    pattern: 'BFS stops at the first leaf (shortest path in an unweighted tree)',
    approaches: [
      {
        level: 'Better', name: 'Recursive DFS, careful with one-child nodes',
        idea: 'For a node with two children, the answer is 1 + the smaller child depth. But a node with one child is not a leaf, so its depth comes from that child only — taking the min with the missing side (0) would be wrong.',
        steps: [
          'If `root` is null, return 0.',
          'If one child is missing, return `1 + minDepth(otherChild)`.',
          'Otherwise return `1 + min(minDepth(left), minDepth(right))`.',
        ],
        time: 'O(n)', space: 'O(h)',
        why: 'It always explores the whole tree, even when a leaf sits right below the root.',
        code: {
          java: r`class Solution {
    public int minDepth(TreeNode root) {
        if (root == null) return 0;
        if (root.left == null) return 1 + minDepth(root.right);
        if (root.right == null) return 1 + minDepth(root.left);
        return 1 + Math.min(minDepth(root.left), minDepth(root.right));
    }
}`,
          cpp: r`class Solution {
public:
    int minDepth(TreeNode* root) {
        if (!root) return 0;
        if (!root->left) return 1 + minDepth(root->right);
        if (!root->right) return 1 + minDepth(root->left);
        return 1 + min(minDepth(root->left), minDepth(root->right));
    }
};`,
          python: r`class Solution:
    def minDepth(self, root: Optional[TreeNode]) -> int:
        if not root:
            return 0
        if not root.left:
            return 1 + self.minDepth(root.right)
        if not root.right:
            return 1 + self.minDepth(root.left)
        return 1 + min(self.minDepth(root.left), self.minDepth(root.right))`,
          javascript: r`var minDepth = function(root) {
    if (!root) return 0;
    if (!root.left) return 1 + minDepth(root.right);
    if (!root.right) return 1 + minDepth(root.left);
    return 1 + Math.min(minDepth(root.left), minDepth(root.right));
};`,
        },
      },
      {
        level: 'Optimal', name: 'BFS that stops at the first leaf',
        idea: 'Level order visits shallower nodes first, so the first leaf found is on the shallowest level. Return its depth immediately.',
        steps: [
          'If `root` is null, return 0. Queue `root`; `depth = 1`.',
          'For each level, pop its nodes; if a node has no children, return `depth`.',
          'Otherwise enqueue its children; after the level, increase `depth`.',
        ],
        time: 'O(n)', space: 'O(w)',
        why: 'Worst case it still visits every node, but it stops at the first leaf, which on unbalanced trees can be far earlier than the DFS. No recursion.',
        code: {
          java: r`class Solution {
    public int minDepth(TreeNode root) {
        if (root == null) return 0;
        Deque<TreeNode> queue = new ArrayDeque<>();
        queue.add(root);
        for (int depth = 1; ; depth++) {
            for (int k = queue.size(); k > 0; k--) {
                TreeNode node = queue.poll();
                if (node.left == null && node.right == null) return depth;
                if (node.left != null) queue.add(node.left);
                if (node.right != null) queue.add(node.right);
            }
        }
    }
}`,
          cpp: r`class Solution {
public:
    int minDepth(TreeNode* root) {
        if (!root) return 0;
        queue<TreeNode*> q;
        q.push(root);
        for (int depth = 1; ; depth++) {
            for (int k = q.size(); k > 0; k--) {
                TreeNode* node = q.front();
                q.pop();
                if (!node->left && !node->right) return depth;
                if (node->left) q.push(node->left);
                if (node->right) q.push(node->right);
            }
        }
    }
};`,
          python: r`class Solution:
    def minDepth(self, root: Optional[TreeNode]) -> int:
        if not root:
            return 0
        queue, depth = deque([root]), 1
        while True:
            for _ in range(len(queue)):
                node = queue.popleft()
                if not node.left and not node.right:
                    return depth
                if node.left:
                    queue.append(node.left)
                if node.right:
                    queue.append(node.right)
            depth += 1`,
          javascript: r`var minDepth = function(root) {
    if (!root) return 0;
    let level = [root];
    for (let depth = 1; ; depth++) {
        const next = [];
        for (const node of level) {
            if (!node.left && !node.right) return depth;
            if (node.left) next.push(node.left);
            if (node.right) next.push(node.right);
        }
        level = next;
    }
};`,
        },
      },
    ],
  },

  'binary-tree-right-side-view': {
    pattern: 'Level-order BFS keeping the last node of each level (or right-first DFS)',
    approaches: [
      {
        level: 'Optimal', name: 'BFS: the last node of every level',
        idea: 'Visiting each level left to right, the last node processed on a level is the one seen from the right.',
        steps: [
          'Queue `root` (if any).',
          'For each level, pop its `size` nodes, enqueuing children; record the value of the last one popped.',
          'Return the recorded values.',
        ],
        time: 'O(n)', space: 'O(w)',
        why: 'Each node once; the queue holds one level at a time.',
        code: {
          java: r`class Solution {
    public List<Integer> rightSideView(TreeNode root) {
        List<Integer> out = new ArrayList<>();
        if (root == null) return out;
        Deque<TreeNode> queue = new ArrayDeque<>();
        queue.add(root);
        while (!queue.isEmpty()) {
            int size = queue.size();
            for (int k = 0; k < size; k++) {
                TreeNode node = queue.poll();
                if (k == size - 1) out.add(node.val);
                if (node.left != null) queue.add(node.left);
                if (node.right != null) queue.add(node.right);
            }
        }
        return out;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> rightSideView(TreeNode* root) {
        vector<int> out;
        if (!root) return out;
        queue<TreeNode*> q;
        q.push(root);
        while (!q.empty()) {
            int size = q.size();
            for (int k = 0; k < size; k++) {
                TreeNode* node = q.front();
                q.pop();
                if (k == size - 1) out.push_back(node->val);
                if (node->left) q.push(node->left);
                if (node->right) q.push(node->right);
            }
        }
        return out;
    }
};`,
          python: r`class Solution:
    def rightSideView(self, root: Optional[TreeNode]) -> List[int]:
        out = []
        queue = deque([root] if root else [])
        while queue:
            size = len(queue)
            for k in range(size):
                node = queue.popleft()
                if k == size - 1:
                    out.append(node.val)
                if node.left:
                    queue.append(node.left)
                if node.right:
                    queue.append(node.right)
        return out`,
          javascript: r`var rightSideView = function(root) {
    const out = [];
    let level = root ? [root] : [];
    while (level.length) {
        out.push(level[level.length - 1].val);
        const next = [];
        for (const node of level) {
            if (node.left) next.push(node.left);
            if (node.right) next.push(node.right);
        }
        level = next;
    }
    return out;
};`,
        },
      },
      {
        level: 'Optimal', name: 'DFS visiting the right child first',
        idea: 'If the DFS goes right before left, the first node it reaches at each new depth is the rightmost one on that level.',
        steps: [
          '`dfs(node, depth)`: if null, return.',
          'If `depth == out.size()`, this is the first node seen at this depth: append its value.',
          'Recurse into the right child, then the left, with `depth + 1`.',
        ],
        time: 'O(n)', space: 'O(h)',
        why: 'Each node once; the recursion is as deep as the tree.',
        code: {
          java: r`class Solution {
    public List<Integer> rightSideView(TreeNode root) {
        List<Integer> out = new ArrayList<>();
        dfs(root, 0, out);
        return out;
    }

    private void dfs(TreeNode node, int depth, List<Integer> out) {
        if (node == null) return;
        if (depth == out.size()) out.add(node.val);
        dfs(node.right, depth + 1, out);
        dfs(node.left, depth + 1, out);
    }
}`,
          cpp: r`class Solution {
    void dfs(TreeNode* node, int depth, vector<int>& out) {
        if (!node) return;
        if (depth == (int) out.size()) out.push_back(node->val);
        dfs(node->right, depth + 1, out);
        dfs(node->left, depth + 1, out);
    }
public:
    vector<int> rightSideView(TreeNode* root) {
        vector<int> out;
        dfs(root, 0, out);
        return out;
    }
};`,
          python: r`class Solution:
    def rightSideView(self, root: Optional[TreeNode]) -> List[int]:
        out = []
        def dfs(node, depth):
            if not node:
                return
            if depth == len(out):
                out.append(node.val)
            dfs(node.right, depth + 1)
            dfs(node.left, depth + 1)
        dfs(root, 0)
        return out`,
          javascript: r`var rightSideView = function(root) {
    const out = [];
    const dfs = (node, depth) => {
        if (!node) return;
        if (depth === out.length) out.push(node.val);
        dfs(node.right, depth + 1);
        dfs(node.left, depth + 1);
    };
    dfs(root, 0);
    return out;
};`,
        },
      },
    ],
  },

  'binary-tree-zigzag-level-order-traversal': {
    pattern: 'Level-order BFS, reversing the direction on alternate levels',
    approaches: [
      {
        level: 'Optimal', name: 'BFS, filling each level from the correct end',
        idea: 'Do a normal level-order traversal. On even levels place values left to right; on odd levels write them into the level\'s array from the back, so it reads right to left.',
        steps: [
          'Queue `root`; `leftToRight = true`.',
          'For each level of `size` nodes, make an array of that size; the k-th node popped goes to index `k` or `size − 1 − k` depending on the direction.',
          'Enqueue children as usual (always left then right), add the array to the answer, and flip the direction.',
        ],
        time: 'O(n)', space: 'O(w)',
        why: 'Each node once; writing into a pre-sized array avoids a separate reverse.',
        code: {
          java: r`class Solution {
    public List<List<Integer>> zigzagLevelOrder(TreeNode root) {
        List<List<Integer>> out = new ArrayList<>();
        if (root == null) return out;
        Deque<TreeNode> queue = new ArrayDeque<>();
        queue.add(root);
        boolean leftToRight = true;
        while (!queue.isEmpty()) {
            int size = queue.size();
            Integer[] level = new Integer[size];
            for (int k = 0; k < size; k++) {
                TreeNode node = queue.poll();
                level[leftToRight ? k : size - 1 - k] = node.val;
                if (node.left != null) queue.add(node.left);
                if (node.right != null) queue.add(node.right);
            }
            out.add(Arrays.asList(level));
            leftToRight = !leftToRight;
        }
        return out;
    }
}`,
          cpp: r`class Solution {
public:
    vector<vector<int>> zigzagLevelOrder(TreeNode* root) {
        vector<vector<int>> out;
        if (!root) return out;
        queue<TreeNode*> q;
        q.push(root);
        bool leftToRight = true;
        while (!q.empty()) {
            int size = q.size();
            vector<int> level(size);
            for (int k = 0; k < size; k++) {
                TreeNode* node = q.front();
                q.pop();
                level[leftToRight ? k : size - 1 - k] = node->val;
                if (node->left) q.push(node->left);
                if (node->right) q.push(node->right);
            }
            out.push_back(level);
            leftToRight = !leftToRight;
        }
        return out;
    }
};`,
          python: r`class Solution:
    def zigzagLevelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:
        out = []
        queue = deque([root] if root else [])
        left_to_right = True
        while queue:
            level = []
            for _ in range(len(queue)):
                node = queue.popleft()
                level.append(node.val)
                if node.left:
                    queue.append(node.left)
                if node.right:
                    queue.append(node.right)
            out.append(level if left_to_right else level[::-1])
            left_to_right = not left_to_right
        return out`,
          javascript: r`var zigzagLevelOrder = function(root) {
    const out = [];
    let level = root ? [root] : [], leftToRight = true;
    while (level.length) {
        const vals = level.map((node) => node.val);
        out.push(leftToRight ? vals : vals.reverse());
        const next = [];
        for (const node of level) {
            if (node.left) next.push(node.left);
            if (node.right) next.push(node.right);
        }
        level = next;
        leftToRight = !leftToRight;
    }
    return out;
};`,
        },
      },
      {
        level: 'Optimal', name: 'DFS by depth, then reverse the odd levels',
        idea: 'Collect plain level order with a DFS (left before right, appending to the list for each depth), then reverse every odd-numbered level.',
        steps: [
          'DFS with depth: append each value to `out[depth]`, left child before right.',
          'Reverse `out[d]` for every odd `d`.',
          'Return `out`.',
        ],
        time: 'O(n)', space: 'O(h)',
        why: 'One DFS plus reversals that touch each value once; besides the output, the recursion stack is h deep.',
        code: {
          java: r`class Solution {
    public List<List<Integer>> zigzagLevelOrder(TreeNode root) {
        List<List<Integer>> out = new ArrayList<>();
        dfs(root, 0, out);
        for (int d = 1; d < out.size(); d += 2) Collections.reverse(out.get(d));
        return out;
    }

    private void dfs(TreeNode node, int depth, List<List<Integer>> out) {
        if (node == null) return;
        if (out.size() == depth) out.add(new ArrayList<>());
        out.get(depth).add(node.val);
        dfs(node.left, depth + 1, out);
        dfs(node.right, depth + 1, out);
    }
}`,
          cpp: r`class Solution {
    void dfs(TreeNode* node, int depth, vector<vector<int>>& out) {
        if (!node) return;
        if ((int) out.size() == depth) out.push_back({});
        out[depth].push_back(node->val);
        dfs(node->left, depth + 1, out);
        dfs(node->right, depth + 1, out);
    }
public:
    vector<vector<int>> zigzagLevelOrder(TreeNode* root) {
        vector<vector<int>> out;
        dfs(root, 0, out);
        for (size_t d = 1; d < out.size(); d += 2) reverse(out[d].begin(), out[d].end());
        return out;
    }
};`,
          python: r`class Solution:
    def zigzagLevelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:
        out = []
        def dfs(node, depth):
            if not node:
                return
            if len(out) == depth:
                out.append([])
            out[depth].append(node.val)
            dfs(node.left, depth + 1)
            dfs(node.right, depth + 1)
        dfs(root, 0)
        return [level if d % 2 == 0 else level[::-1] for d, level in enumerate(out)]`,
          javascript: r`var zigzagLevelOrder = function(root) {
    const out = [];
    const dfs = (node, depth) => {
        if (!node) return;
        if (out.length === depth) out.push([]);
        out[depth].push(node.val);
        dfs(node.left, depth + 1);
        dfs(node.right, depth + 1);
    };
    dfs(root, 0);
    return out.map((level, d) => (d % 2 ? level.reverse() : level));
};`,
        },
      },
    ],
  },

  'find-largest-value-in-each-tree-row': {
    pattern: 'Level-order BFS with a per-level maximum (or DFS by depth)',
    approaches: [
      {
        level: 'Optimal', name: 'BFS, maximum of each level',
        idea: 'Process one level at a time and keep the largest value on it, starting from the level\'s first node (values can be negative, even −2³¹).',
        steps: [
          'Queue `root` (if any).',
          'For each level, set `best` to the smallest possible value (or the first node\'s value), then take the max over the level\'s nodes while enqueuing children.',
          'Append `best`.',
        ],
        time: 'O(n)', space: 'O(w)',
        why: 'Each node once; the queue holds one level.',
        code: {
          java: r`class Solution {
    public List<Integer> largestValues(TreeNode root) {
        List<Integer> out = new ArrayList<>();
        if (root == null) return out;
        Deque<TreeNode> queue = new ArrayDeque<>();
        queue.add(root);
        while (!queue.isEmpty()) {
            int best = Integer.MIN_VALUE;
            for (int k = queue.size(); k > 0; k--) {
                TreeNode node = queue.poll();
                best = Math.max(best, node.val);
                if (node.left != null) queue.add(node.left);
                if (node.right != null) queue.add(node.right);
            }
            out.add(best);
        }
        return out;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> largestValues(TreeNode* root) {
        vector<int> out;
        if (!root) return out;
        queue<TreeNode*> q;
        q.push(root);
        while (!q.empty()) {
            int best = INT_MIN;
            for (int k = q.size(); k > 0; k--) {
                TreeNode* node = q.front();
                q.pop();
                best = max(best, node->val);
                if (node->left) q.push(node->left);
                if (node->right) q.push(node->right);
            }
            out.push_back(best);
        }
        return out;
    }
};`,
          python: r`class Solution:
    def largestValues(self, root: Optional[TreeNode]) -> List[int]:
        out = []
        level = [root] if root else []
        while level:
            out.append(max(node.val for node in level))
            level = [c for node in level for c in (node.left, node.right) if c]
        return out`,
          javascript: r`var largestValues = function(root) {
    const out = [];
    let level = root ? [root] : [];
    while (level.length) {
        let best = -Infinity;
        const next = [];
        for (const node of level) {
            best = Math.max(best, node.val);
            if (node.left) next.push(node.left);
            if (node.right) next.push(node.right);
        }
        out.push(best);
        level = next;
    }
    return out;
};`,
        },
      },
      {
        level: 'Optimal', name: 'DFS keeping the maximum per depth',
        idea: 'Visit nodes in any order; the first node at a new depth starts that depth\'s entry, and later nodes at that depth update it with the larger value.',
        steps: [
          '`dfs(node, depth)`: if null, return.',
          'If `depth == out.size()`, append `node.val`; otherwise set `out[depth] = max(out[depth], node.val)`.',
          'Recurse into both children with `depth + 1`.',
        ],
        time: 'O(n)', space: 'O(h)',
        why: 'Each node once; the recursion stack is h deep.',
        code: {
          java: r`class Solution {
    public List<Integer> largestValues(TreeNode root) {
        List<Integer> out = new ArrayList<>();
        dfs(root, 0, out);
        return out;
    }

    private void dfs(TreeNode node, int depth, List<Integer> out) {
        if (node == null) return;
        if (depth == out.size()) out.add(node.val);
        else out.set(depth, Math.max(out.get(depth), node.val));
        dfs(node.left, depth + 1, out);
        dfs(node.right, depth + 1, out);
    }
}`,
          cpp: r`class Solution {
    void dfs(TreeNode* node, int depth, vector<int>& out) {
        if (!node) return;
        if (depth == (int) out.size()) out.push_back(node->val);
        else out[depth] = max(out[depth], node->val);
        dfs(node->left, depth + 1, out);
        dfs(node->right, depth + 1, out);
    }
public:
    vector<int> largestValues(TreeNode* root) {
        vector<int> out;
        dfs(root, 0, out);
        return out;
    }
};`,
          python: r`class Solution:
    def largestValues(self, root: Optional[TreeNode]) -> List[int]:
        out = []
        def dfs(node, depth):
            if not node:
                return
            if depth == len(out):
                out.append(node.val)
            else:
                out[depth] = max(out[depth], node.val)
            dfs(node.left, depth + 1)
            dfs(node.right, depth + 1)
        dfs(root, 0)
        return out`,
          javascript: r`var largestValues = function(root) {
    const out = [];
    const dfs = (node, depth) => {
        if (!node) return;
        if (depth === out.length) out.push(node.val);
        else out[depth] = Math.max(out[depth], node.val);
        dfs(node.left, depth + 1);
        dfs(node.right, depth + 1);
    };
    dfs(root, 0);
    return out;
};`,
        },
      },
    ],
  },

  'populating-next-right-pointers-in-each-node': {
    pattern: 'Level linking: use the next pointers of the level above to wire the level below',
    approaches: [
      {
        level: 'Better', name: 'BFS with a queue',
        idea: 'Walk each level left to right with a queue and point every node at the next node popped on the same level.',
        steps: [
          'Queue `root` (if any).',
          'For each level of `size` nodes: pop them in order; set `node.next` to the queue\'s front unless it is the level\'s last node (then null).',
          'Enqueue children as you go; return `root`.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Each node once. The queue holds a whole level, which in a perfect tree is about n/2 nodes — the follow-up asks for O(1) extra space.',
        code: {
          java: r`class Solution {
    public Node connect(Node root) {
        if (root == null) return null;
        Deque<Node> queue = new ArrayDeque<>();
        queue.add(root);
        while (!queue.isEmpty()) {
            for (int k = queue.size(); k > 0; k--) {
                Node node = queue.poll();
                node.next = k > 1 ? queue.peek() : null;
                if (node.left != null) { queue.add(node.left); queue.add(node.right); }
            }
        }
        return root;
    }
}`,
          cpp: r`class Solution {
public:
    Node* connect(Node* root) {
        if (!root) return nullptr;
        queue<Node*> q;
        q.push(root);
        while (!q.empty()) {
            for (int k = q.size(); k > 0; k--) {
                Node* node = q.front();
                q.pop();
                node->next = k > 1 ? q.front() : nullptr;
                if (node->left) { q.push(node->left); q.push(node->right); }
            }
        }
        return root;
    }
};`,
          python: r`class Solution:
    def connect(self, root: Optional['Node']) -> Optional['Node']:
        level = [root] if root else []
        while level:
            for a, b in zip(level, level[1:]):
                a.next = b
            level = [c for node in level for c in (node.left, node.right) if c]
        return root`,
          javascript: r`var connect = function(root) {
    let level = root ? [root] : [];
    while (level.length) {
        for (let i = 0; i + 1 < level.length; i++) level[i].next = level[i + 1];
        const next = [];
        for (const node of level) if (node.left) next.push(node.left, node.right);
        level = next;
    }
    return root;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Walk each level through its next pointers',
        idea: 'Once a level is linked, you can walk it like a linked list. While walking it, wire its children: a node\'s left child points to its right child, and its right child points to the left child of the node\'s `next`.',
        steps: [
          'Start with `leftmost = root`.',
          'While `leftmost` has children: walk `node` along the current level using `next`.',
          'For each `node`: `node.left.next = node.right`; if `node.next` exists, `node.right.next = node.next.left`.',
          'Move down: `leftmost = leftmost.left`. Return `root`.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'Each node is visited once as part of its level\'s walk, and only two pointers are used. It relies on the tree being perfect, so every internal node has both children.',
        code: {
          java: r`class Solution {
    public Node connect(Node root) {
        for (Node leftmost = root; leftmost != null && leftmost.left != null; leftmost = leftmost.left) {
            for (Node node = leftmost; node != null; node = node.next) {
                node.left.next = node.right;
                if (node.next != null) node.right.next = node.next.left;
            }
        }
        return root;
    }
}`,
          cpp: r`class Solution {
public:
    Node* connect(Node* root) {
        for (Node* leftmost = root; leftmost && leftmost->left; leftmost = leftmost->left) {
            for (Node* node = leftmost; node; node = node->next) {
                node->left->next = node->right;
                if (node->next) node->right->next = node->next->left;
            }
        }
        return root;
    }
};`,
          python: r`class Solution:
    def connect(self, root: Optional['Node']) -> Optional['Node']:
        leftmost = root
        while leftmost and leftmost.left:
            node = leftmost
            while node:
                node.left.next = node.right
                if node.next:
                    node.right.next = node.next.left
                node = node.next
            leftmost = leftmost.left
        return root`,
          javascript: r`var connect = function(root) {
    for (let leftmost = root; leftmost && leftmost.left; leftmost = leftmost.left) {
        for (let node = leftmost; node; node = node.next) {
            node.left.next = node.right;
            if (node.next) node.right.next = node.next.left;
        }
    }
    return root;
};`,
        },
      },
    ],
  },

  'maximum-width-of-binary-tree': {
    pattern: 'BFS with heap-style positions (children of i are 2i and 2i + 1), normalised per level',
    approaches: [
      {
        level: 'Optimal', name: 'BFS with positions, re-based on every level',
        idea: 'Number positions as in an array heap: the root is 0 and a node at `i` has children `2i` and `2i + 1`. The width of a level is `last − first + 1`. Positions double every level and would overflow on deep trees, so subtract the level\'s first position before computing children.',
        steps: [
          'Queue `(root, 0)`.',
          'For each level: note the first position `first`; for each node `(node, pos)`, let `p = pos − first`, and enqueue its children at `2p` and `2p + 1`.',
          'The level\'s width is the last `p` + 1; keep the maximum.',
        ],
        time: 'O(n)', space: 'O(w)',
        why: 'Each node once; the queue holds one level. After re-basing, positions on a level stay below twice the width, which the problem guarantees fits in 32 bits — use 64-bit integers for the doubling step.',
        code: {
          java: r`class Solution {
    public int widthOfBinaryTree(TreeNode root) {
        Deque<TreeNode> nodes = new ArrayDeque<>();
        Deque<Long> pos = new ArrayDeque<>();
        nodes.add(root);
        pos.add(0L);
        long best = 0;
        while (!nodes.isEmpty()) {
            long first = pos.peek(), last = 0;
            for (int k = nodes.size(); k > 0; k--) {
                TreeNode node = nodes.poll();
                long p = pos.poll() - first;
                last = p;
                if (node.left != null) { nodes.add(node.left); pos.add(2 * p); }
                if (node.right != null) { nodes.add(node.right); pos.add(2 * p + 1); }
            }
            best = Math.max(best, last + 1);
        }
        return (int) best;
    }
}`,
          cpp: r`class Solution {
public:
    int widthOfBinaryTree(TreeNode* root) {
        queue<pair<TreeNode*, unsigned long long>> q;
        q.push({root, 0});
        unsigned long long best = 0;
        while (!q.empty()) {
            unsigned long long first = q.front().second, last = 0;
            for (int k = q.size(); k > 0; k--) {
                auto [node, pos] = q.front();
                q.pop();
                unsigned long long p = pos - first;
                last = p;
                if (node->left) q.push({node->left, 2 * p});
                if (node->right) q.push({node->right, 2 * p + 1});
            }
            best = max(best, last + 1);
        }
        return (int) best;
    }
};`,
          python: r`class Solution:
    def widthOfBinaryTree(self, root: Optional[TreeNode]) -> int:
        level, best = [(root, 0)], 0
        while level:
            first = level[0][1]
            best = max(best, level[-1][1] - first + 1)
            nxt = []
            for node, pos in level:
                p = pos - first
                if node.left:
                    nxt.append((node.left, 2 * p))
                if node.right:
                    nxt.append((node.right, 2 * p + 1))
            level = nxt
        return best`,
          javascript: r`var widthOfBinaryTree = function(root) {
    let level = [[root, 0]], best = 0;
    while (level.length) {
        const first = level[0][1];
        best = Math.max(best, level[level.length - 1][1] - first + 1);
        const next = [];
        for (const [node, pos] of level) {
            const p = pos - first;
            if (node.left) next.push([node.left, 2 * p]);
            if (node.right) next.push([node.right, 2 * p + 1]);
        }
        level = next;
    }
    return best;
};`,
        },
      },
      {
        level: 'Optimal', name: 'DFS remembering the first position of each depth',
        idea: 'The same positions, found with a DFS that goes left first: the first node reached at each depth is the leftmost, so record its position. Every later node at that depth measures its distance from it. Children are numbered relative to that leftmost position to keep the numbers small.',
        steps: [
          '`dfs(node, depth, pos)`: if null, return.',
          'If this depth is new, record `first[depth] = pos`.',
          'Update the best width with `pos − first[depth] + 1`.',
          'Let `p = pos − first[depth]`; recurse left with `2p`, right with `2p + 1`.',
        ],
        time: 'O(n)', space: 'O(h)',
        why: 'Each node once; `first` and the recursion stack are h long. Re-basing on `first[depth]` keeps positions bounded just like the BFS version.',
        code: {
          java: r`class Solution {
    private final List<Long> first = new ArrayList<>();
    private long best = 0;

    public int widthOfBinaryTree(TreeNode root) {
        dfs(root, 0, 0);
        return (int) best;
    }

    private void dfs(TreeNode node, int depth, long pos) {
        if (node == null) return;
        if (first.size() == depth) first.add(pos);
        long p = pos - first.get(depth);
        best = Math.max(best, p + 1);
        dfs(node.left, depth + 1, 2 * p);
        dfs(node.right, depth + 1, 2 * p + 1);
    }
}`,
          cpp: r`class Solution {
    vector<unsigned long long> first;
    unsigned long long best = 0;
    void dfs(TreeNode* node, int depth, unsigned long long pos) {
        if (!node) return;
        if ((int) first.size() == depth) first.push_back(pos);
        unsigned long long p = pos - first[depth];
        best = max(best, p + 1);
        dfs(node->left, depth + 1, 2 * p);
        dfs(node->right, depth + 1, 2 * p + 1);
    }
public:
    int widthOfBinaryTree(TreeNode* root) {
        dfs(root, 0, 0);
        return (int) best;
    }
};`,
          python: r`class Solution:
    def widthOfBinaryTree(self, root: Optional[TreeNode]) -> int:
        first, best = [], 0
        def dfs(node, depth, pos):
            nonlocal best
            if not node:
                return
            if len(first) == depth:
                first.append(pos)
            p = pos - first[depth]
            best = max(best, p + 1)
            dfs(node.left, depth + 1, 2 * p)
            dfs(node.right, depth + 1, 2 * p + 1)
        dfs(root, 0, 0)
        return best`,
          javascript: r`var widthOfBinaryTree = function(root) {
    const first = [];
    let best = 0;
    const dfs = (node, depth, pos) => {
        if (!node) return;
        if (first.length === depth) first.push(pos);
        const p = pos - first[depth];
        best = Math.max(best, p + 1);
        dfs(node.left, depth + 1, 2 * p);
        dfs(node.right, depth + 1, 2 * p + 1);
    };
    dfs(root, 0, 0);
    return best;
};`,
        },
      },
    ],
  },
};
