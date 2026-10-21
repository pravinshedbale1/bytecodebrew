const r = String.raw;

export default {
  'diameter-of-binary-tree': {
    pattern: 'Tree DP: return height upwards, update the best "left height + right height" at each node',
    approaches: [
      {
        level: 'Brute force', name: 'Compute both heights separately at every node',
        idea: 'The longest path through a node uses the height of its left subtree plus the height of its right subtree. Compute those heights from scratch at each node and take the best.',
        steps: [
          '`height(t)`: 0 for null, else `1 + max(height(left), height(right))`.',
          'For every node, candidate = `height(left) + height(right)`.',
          'Return the largest candidate over all nodes.',
        ],
        time: 'O(n²)', space: 'O(h)',
        why: 'Heights are recomputed for every ancestor: O(n·h), O(n²) for a chain.',
        code: {
          java: r`class Solution {
    public int diameterOfBinaryTree(TreeNode root) {
        if (root == null) return 0;
        int through = height(root.left) + height(root.right);
        return Math.max(through, Math.max(diameterOfBinaryTree(root.left), diameterOfBinaryTree(root.right)));
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
    int diameterOfBinaryTree(TreeNode* root) {
        if (!root) return 0;
        int through = height(root->left) + height(root->right);
        return max(through, max(diameterOfBinaryTree(root->left), diameterOfBinaryTree(root->right)));
    }
};`,
          python: r`class Solution:
    def diameterOfBinaryTree(self, root: Optional[TreeNode]) -> int:
        def height(t):
            return 1 + max(height(t.left), height(t.right)) if t else 0
        if not root:
            return 0
        through = height(root.left) + height(root.right)
        return max(through, self.diameterOfBinaryTree(root.left), self.diameterOfBinaryTree(root.right))`,
          javascript: r`var diameterOfBinaryTree = function(root) {
    const height = (t) => (t ? 1 + Math.max(height(t.left), height(t.right)) : 0);
    if (!root) return 0;
    const through = height(root.left) + height(root.right);
    return Math.max(through, diameterOfBinaryTree(root.left), diameterOfBinaryTree(root.right));
};`,
        },
      },
      {
        level: 'Optimal', name: 'One DFS returning heights',
        idea: 'A single post-order DFS returns each subtree\'s height to its parent; at each node, `leftHeight + rightHeight` is the longest path bending there, so update a running best.',
        steps: [
          '`height(t)`: 0 for null.',
          'Compute `l = height(left)`, `r = height(right)`; update `best = max(best, l + r)`.',
          'Return `1 + max(l, r)`. The answer is `best`.',
        ],
        time: 'O(n)', space: 'O(h)',
        why: 'Each node is visited once; the recursion is as deep as the tree.',
        code: {
          java: r`class Solution {
    private int best = 0;

    public int diameterOfBinaryTree(TreeNode root) {
        height(root);
        return best;
    }

    private int height(TreeNode t) {
        if (t == null) return 0;
        int l = height(t.left), r = height(t.right);
        best = Math.max(best, l + r);
        return 1 + Math.max(l, r);
    }
}`,
          cpp: r`class Solution {
    int best = 0;
    int height(TreeNode* t) {
        if (!t) return 0;
        int l = height(t->left), r = height(t->right);
        best = max(best, l + r);
        return 1 + max(l, r);
    }
public:
    int diameterOfBinaryTree(TreeNode* root) {
        height(root);
        return best;
    }
};`,
          python: r`class Solution:
    def diameterOfBinaryTree(self, root: Optional[TreeNode]) -> int:
        best = 0
        def height(t):
            nonlocal best
            if not t:
                return 0
            l, r = height(t.left), height(t.right)
            best = max(best, l + r)
            return 1 + max(l, r)
        height(root)
        return best`,
          javascript: r`var diameterOfBinaryTree = function(root) {
    let best = 0;
    const height = (t) => {
        if (!t) return 0;
        const l = height(t.left), r = height(t.right);
        best = Math.max(best, l + r);
        return 1 + Math.max(l, r);
    };
    height(root);
    return best;
};`,
        },
      },
    ],
  },

  'house-robber-iii': {
    pattern: 'Tree DP returning two values per node: best if robbed, best if skipped',
    approaches: [
      {
        level: 'Brute force', name: 'Rob this house or not, recursively',
        idea: 'Either rob the root (then skip its children and continue from its grandchildren) or skip it (and solve both children freely). Take the better.',
        steps: [
          '`best(t)`: 0 for null.',
          'Rob: `t.val + best(grandchildren…)` (the four grandchildren).',
          'Skip: `best(t.left) + best(t.right)`. Return the larger.',
        ],
        time: 'O(2ⁿ)', space: 'O(h)',
        why: 'Each node is solved again from its parent and from its grandparent, so work grows exponentially with depth.',
        code: {
          java: r`class Solution {
    public int rob(TreeNode root) {
        if (root == null) return 0;
        int take = root.val;
        if (root.left != null) take += rob(root.left.left) + rob(root.left.right);
        if (root.right != null) take += rob(root.right.left) + rob(root.right.right);
        return Math.max(take, rob(root.left) + rob(root.right));
    }
}`,
          cpp: r`class Solution {
public:
    int rob(TreeNode* root) {
        if (!root) return 0;
        int take = root->val;
        if (root->left) take += rob(root->left->left) + rob(root->left->right);
        if (root->right) take += rob(root->right->left) + rob(root->right->right);
        return max(take, rob(root->left) + rob(root->right));
    }
};`,
          python: r`class Solution:
    def rob(self, root: Optional[TreeNode]) -> int:
        if not root:
            return 0
        take = root.val
        if root.left:
            take += self.rob(root.left.left) + self.rob(root.left.right)
        if root.right:
            take += self.rob(root.right.left) + self.rob(root.right.right)
        return max(take, self.rob(root.left) + self.rob(root.right))`,
          javascript: r`var rob = function(root) {
    if (!root) return 0;
    let take = root.val;
    if (root.left) take += rob(root.left.left) + rob(root.left.right);
    if (root.right) take += rob(root.right.left) + rob(root.right.right);
    return Math.max(take, rob(root.left) + rob(root.right));
};`,
        },
      },
      {
        level: 'Better', name: 'Same recursion with a memo per node',
        idea: 'Cache `best(t)` in a hash map keyed by the node, so every subtree is solved once.',
        steps: [
          'Same recurrence as the brute force.',
          'Store each node\'s result in a map and return it on repeat visits.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'n distinct subproblems; the map holds n entries.',
        code: {
          java: r`class Solution {
    private final Map<TreeNode, Integer> memo = new HashMap<>();

    public int rob(TreeNode root) {
        if (root == null) return 0;
        if (memo.containsKey(root)) return memo.get(root);
        int take = root.val;
        if (root.left != null) take += rob(root.left.left) + rob(root.left.right);
        if (root.right != null) take += rob(root.right.left) + rob(root.right.right);
        int best = Math.max(take, rob(root.left) + rob(root.right));
        memo.put(root, best);
        return best;
    }
}`,
          cpp: r`class Solution {
    unordered_map<TreeNode*, int> memo;
public:
    int rob(TreeNode* root) {
        if (!root) return 0;
        auto it = memo.find(root);
        if (it != memo.end()) return it->second;
        int take = root->val;
        if (root->left) take += rob(root->left->left) + rob(root->left->right);
        if (root->right) take += rob(root->right->left) + rob(root->right->right);
        return memo[root] = max(take, rob(root->left) + rob(root->right));
    }
};`,
          python: r`class Solution:
    def rob(self, root: Optional[TreeNode]) -> int:
        memo = {}
        def best(t):
            if not t:
                return 0
            if t in memo:
                return memo[t]
            take = t.val
            if t.left:
                take += best(t.left.left) + best(t.left.right)
            if t.right:
                take += best(t.right.left) + best(t.right.right)
            memo[t] = max(take, best(t.left) + best(t.right))
            return memo[t]
        return best(root)`,
          javascript: r`var rob = function(root) {
    const memo = new Map();
    const best = (t) => {
        if (!t) return 0;
        if (memo.has(t)) return memo.get(t);
        let take = t.val;
        if (t.left) take += best(t.left.left) + best(t.left.right);
        if (t.right) take += best(t.right.left) + best(t.right.right);
        memo.set(t, Math.max(take, best(t.left) + best(t.right)));
        return memo.get(t);
    };
    return best(root);
};`,
        },
      },
      {
        level: 'Optimal', name: 'Return (robbed, skipped) for each subtree',
        idea: 'Let each call return two numbers: the best for its subtree if its root is robbed, and if it is not. The parent combines them directly — no map needed.',
        steps: [
          '`dfs(null) = (0, 0)`.',
          'With `(lr, ls) = dfs(left)` and `(rr, rs) = dfs(right)`: robbed = `val + ls + rs`; skipped = `max(lr, ls) + max(rr, rs)`.',
          'Return `max(robbed, skipped)` for the root.',
        ],
        time: 'O(n)', space: 'O(h)',
        why: 'One post-order pass; only the recursion stack is used.',
        code: {
          java: r`class Solution {
    public int rob(TreeNode root) {
        int[] r = dfs(root);
        return Math.max(r[0], r[1]);
    }

    // [best if this node is robbed, best if it is not]
    private int[] dfs(TreeNode t) {
        if (t == null) return new int[] { 0, 0 };
        int[] l = dfs(t.left), r = dfs(t.right);
        return new int[] { t.val + l[1] + r[1], Math.max(l[0], l[1]) + Math.max(r[0], r[1]) };
    }
}`,
          cpp: r`class Solution {
    // {best if this node is robbed, best if it is not}
    pair<int, int> dfs(TreeNode* t) {
        if (!t) return {0, 0};
        auto [lr, ls] = dfs(t->left);
        auto [rr, rs] = dfs(t->right);
        return {t->val + ls + rs, max(lr, ls) + max(rr, rs)};
    }
public:
    int rob(TreeNode* root) {
        auto [robbed, skipped] = dfs(root);
        return max(robbed, skipped);
    }
};`,
          python: r`class Solution:
    def rob(self, root: Optional[TreeNode]) -> int:
        def dfs(t):  # (best if t is robbed, best if it is not)
            if not t:
                return 0, 0
            lr, ls = dfs(t.left)
            rr, rs = dfs(t.right)
            return t.val + ls + rs, max(lr, ls) + max(rr, rs)
        return max(dfs(root))`,
          javascript: r`var rob = function(root) {
    // [best if this node is robbed, best if it is not]
    const dfs = (t) => {
        if (!t) return [0, 0];
        const [lr, ls] = dfs(t.left), [rr, rs] = dfs(t.right);
        return [t.val + ls + rs, Math.max(lr, ls) + Math.max(rr, rs)];
    };
    return Math.max(...dfs(root));
};`,
        },
      },
    ],
  },

  'longest-zigzag-path-in-a-binary-tree': {
    pattern: 'Tree DP carrying the zigzag length that arrived from each direction',
    approaches: [
      {
        level: 'Brute force', name: 'Walk a zigzag from every node in both directions',
        idea: 'From each node, follow the zigzag starting left and starting right, alternating until a child is missing, and record the longest.',
        steps: [
          'For each node, walk: go left, then right, then left… counting edges; then do the same starting with right.',
          'Keep the longest walk over all nodes and both directions.',
        ],
        time: 'O(n·h)', space: 'O(h)',
        why: 'Each of the n nodes walks down at most h levels in each direction.',
        code: {
          java: r`class Solution {
    public int longestZigZag(TreeNode root) {
        if (root == null) return 0;
        int here = Math.max(walk(root, true), walk(root, false));
        return Math.max(here, Math.max(longestZigZag(root.left), longestZigZag(root.right)));
    }

    private int walk(TreeNode t, boolean goLeft) {
        int len = 0;
        while (true) {
            TreeNode next = goLeft ? t.left : t.right;
            if (next == null) return len;
            t = next;
            len++;
            goLeft = !goLeft;
        }
    }
}`,
          cpp: r`class Solution {
    int walk(TreeNode* t, bool goLeft) {
        int len = 0;
        while (true) {
            TreeNode* next = goLeft ? t->left : t->right;
            if (!next) return len;
            t = next;
            len++;
            goLeft = !goLeft;
        }
    }
public:
    int longestZigZag(TreeNode* root) {
        if (!root) return 0;
        int here = max(walk(root, true), walk(root, false));
        return max(here, max(longestZigZag(root->left), longestZigZag(root->right)));
    }
};`,
          python: r`class Solution:
    def longestZigZag(self, root: Optional[TreeNode]) -> int:
        def walk(t, go_left):
            length = 0
            while True:
                nxt = t.left if go_left else t.right
                if not nxt:
                    return length
                t, length, go_left = nxt, length + 1, not go_left
        best, stack = 0, [root]
        while stack:
            t = stack.pop()
            best = max(best, walk(t, True), walk(t, False))
            stack.extend(c for c in (t.left, t.right) if c)
        return best`,
          javascript: r`var longestZigZag = function(root) {
    const walk = (t, goLeft) => {
        let len = 0;
        while (true) {
            const next = goLeft ? t.left : t.right;
            if (!next) return len;
            t = next;
            len++;
            goLeft = !goLeft;
        }
    };
    let best = 0;
    const stack = [root];
    while (stack.length) {
        const t = stack.pop();
        best = Math.max(best, walk(t, true), walk(t, false));
        if (t.left) stack.push(t.left);
        if (t.right) stack.push(t.right);
    }
    return best;
};`,
        },
      },
      {
        level: 'Optimal', name: 'DFS carrying the length of the zigzag that arrives here',
        idea: 'Pass down two numbers: the zigzag length if we arrived by going left, and if we arrived by going right. Going left from here continues a path that arrived going right (+1), and starts fresh for the other direction.',
        steps: [
          '`dfs(t, cameLeft, cameRight)`: update the best with both values.',
          'Go to the left child with `(cameRight + 1, 0)`: continuing the zigzag that came from the right, or starting over.',
          'Go to the right child with `(0, cameLeft + 1)`.',
          'Start with `dfs(root, 0, 0)`.',
        ],
        time: 'O(n)', space: 'O(h)',
        why: 'Each node is visited once; the recursion is h deep.',
        code: {
          java: r`class Solution {
    private int best = 0;

    public int longestZigZag(TreeNode root) {
        dfs(root, 0, 0);
        return best;
    }

    private void dfs(TreeNode t, int cameLeft, int cameRight) {
        if (t == null) return;
        best = Math.max(best, Math.max(cameLeft, cameRight));
        dfs(t.left, cameRight + 1, 0);
        dfs(t.right, 0, cameLeft + 1);
    }
}`,
          cpp: r`class Solution {
    int best = 0;
    void dfs(TreeNode* t, int cameLeft, int cameRight) {
        if (!t) return;
        best = max(best, max(cameLeft, cameRight));
        dfs(t->left, cameRight + 1, 0);
        dfs(t->right, 0, cameLeft + 1);
    }
public:
    int longestZigZag(TreeNode* root) {
        dfs(root, 0, 0);
        return best;
    }
};`,
          python: r`class Solution:
    def longestZigZag(self, root: Optional[TreeNode]) -> int:
        best = 0
        stack = [(root, 0, 0)]  # node, length arriving by a left move, by a right move
        while stack:
            t, came_left, came_right = stack.pop()
            best = max(best, came_left, came_right)
            if t.left:
                stack.append((t.left, came_right + 1, 0))
            if t.right:
                stack.append((t.right, 0, came_left + 1))
        return best`,
          javascript: r`var longestZigZag = function(root) {
    let best = 0;
    const stack = [[root, 0, 0]]; // node, length arriving by a left move, by a right move
    while (stack.length) {
        const [t, cameLeft, cameRight] = stack.pop();
        best = Math.max(best, cameLeft, cameRight);
        if (t.left) stack.push([t.left, cameRight + 1, 0]);
        if (t.right) stack.push([t.right, 0, cameLeft + 1]);
    }
    return best;
};`,
        },
      },
    ],
  },

  'predict-the-winner': {
    pattern: 'Interval minimax DP on the score difference',
    approaches: [
      {
        level: 'Brute force', name: 'Recursion on the best score difference',
        idea: 'Let `diff(i, j)` be the best (my score − opponent\'s score) the player to move can get from `nums[i..j]`. Taking an end gives that number minus whatever the opponent then achieves on the rest.',
        steps: [
          '`diff(i, j)`: if `i == j`, return `nums[i]`.',
          'Return `max(nums[i] − diff(i + 1, j), nums[j] − diff(i, j − 1))`.',
          'Player 1 wins (or ties) when `diff(0, n − 1) >= 0`.',
        ],
        time: 'O(2ⁿ)', space: 'O(n)',
        why: 'Two choices per move over n moves, with repeated ranges.',
        code: {
          java: r`class Solution {
    public boolean predictTheWinner(int[] nums) {
        return diff(nums, 0, nums.length - 1) >= 0;
    }

    private int diff(int[] nums, int i, int j) {
        if (i == j) return nums[i];
        return Math.max(nums[i] - diff(nums, i + 1, j), nums[j] - diff(nums, i, j - 1));
    }
}`,
          cpp: r`class Solution {
    int diff(vector<int>& nums, int i, int j) {
        if (i == j) return nums[i];
        return max(nums[i] - diff(nums, i + 1, j), nums[j] - diff(nums, i, j - 1));
    }
public:
    bool predictTheWinner(vector<int>& nums) {
        return diff(nums, 0, (int) nums.size() - 1) >= 0;
    }
};`,
          python: r`class Solution:
    def predictTheWinner(self, nums: List[int]) -> bool:
        def diff(i, j):
            if i == j:
                return nums[i]
            return max(nums[i] - diff(i + 1, j), nums[j] - diff(i, j - 1))
        return diff(0, len(nums) - 1) >= 0`,
          javascript: r`var predictTheWinner = function(nums) {
    const diff = (i, j) => (i === j ? nums[i] : Math.max(nums[i] - diff(i + 1, j), nums[j] - diff(i, j - 1)));
    return diff(0, nums.length - 1) >= 0;
};`,
        },
      },
      {
        level: 'Better', name: 'Memoisation on the range',
        idea: 'There are only n(n + 1)/2 ranges, so cache `diff(i, j)`.',
        steps: [
          'Same recurrence as the brute force.',
          'Cache each range\'s result in an n × n table.',
        ],
        time: 'O(n²)', space: 'O(n²)',
        why: 'Each range is computed once with O(1) work.',
        code: {
          java: r`class Solution {
    private Integer[][] memo;

    public boolean predictTheWinner(int[] nums) {
        memo = new Integer[nums.length][nums.length];
        return diff(nums, 0, nums.length - 1) >= 0;
    }

    private int diff(int[] nums, int i, int j) {
        if (i == j) return nums[i];
        if (memo[i][j] != null) return memo[i][j];
        return memo[i][j] = Math.max(nums[i] - diff(nums, i + 1, j), nums[j] - diff(nums, i, j - 1));
    }
}`,
          cpp: r`class Solution {
    vector<vector<int>> memo;
    vector<vector<bool>> done;
    int diff(vector<int>& nums, int i, int j) {
        if (i == j) return nums[i];
        if (done[i][j]) return memo[i][j];
        done[i][j] = true;
        return memo[i][j] = max(nums[i] - diff(nums, i + 1, j), nums[j] - diff(nums, i, j - 1));
    }
public:
    bool predictTheWinner(vector<int>& nums) {
        int n = nums.size();
        memo.assign(n, vector<int>(n, 0));
        done.assign(n, vector<bool>(n, false));
        return diff(nums, 0, n - 1) >= 0;
    }
};`,
          python: r`class Solution:
    def predictTheWinner(self, nums: List[int]) -> bool:
        @cache
        def diff(i, j):
            if i == j:
                return nums[i]
            return max(nums[i] - diff(i + 1, j), nums[j] - diff(i, j - 1))
        return diff(0, len(nums) - 1) >= 0`,
          javascript: r`var predictTheWinner = function(nums) {
    const n = nums.length, memo = new Map();
    const diff = (i, j) => {
        if (i === j) return nums[i];
        const key = i * n + j;
        if (!memo.has(key)) memo.set(key, Math.max(nums[i] - diff(i + 1, j), nums[j] - diff(i, j - 1)));
        return memo.get(key);
    };
    return diff(0, n - 1) >= 0;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Bottom-up with one row',
        idea: 'Fill ranges by increasing start from the end: `dp[j]` holds `diff(i + 1, j)` before it is updated to `diff(i, j)`, and `dp[j − 1]` is already `diff(i, j − 1)`.',
        steps: [
          'For `i` from n − 1 down to 0: `dp[i] = nums[i]`; for `j` from `i + 1`: `dp[j] = max(nums[i] − dp[j], nums[j] − dp[j − 1])`.',
          'Return `dp[n − 1] >= 0`.',
        ],
        time: 'O(n²)', space: 'O(n)',
        why: 'Same n²/2 ranges in one row of memory.',
        code: {
          java: r`class Solution {
    public boolean predictTheWinner(int[] nums) {
        int n = nums.length;
        int[] dp = new int[n];
        for (int i = n - 1; i >= 0; i--) {
            dp[i] = nums[i];
            for (int j = i + 1; j < n; j++) dp[j] = Math.max(nums[i] - dp[j], nums[j] - dp[j - 1]);
        }
        return dp[n - 1] >= 0;
    }
}`,
          cpp: r`class Solution {
public:
    bool predictTheWinner(vector<int>& nums) {
        int n = nums.size();
        vector<int> dp(n);
        for (int i = n - 1; i >= 0; i--) {
            dp[i] = nums[i];
            for (int j = i + 1; j < n; j++) dp[j] = max(nums[i] - dp[j], nums[j] - dp[j - 1]);
        }
        return dp[n - 1] >= 0;
    }
};`,
          python: r`class Solution:
    def predictTheWinner(self, nums: List[int]) -> bool:
        n = len(nums)
        dp = [0] * n
        for i in range(n - 1, -1, -1):
            dp[i] = nums[i]
            for j in range(i + 1, n):
                dp[j] = max(nums[i] - dp[j], nums[j] - dp[j - 1])
        return dp[n - 1] >= 0`,
          javascript: r`var predictTheWinner = function(nums) {
    const n = nums.length, dp = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        dp[i] = nums[i];
        for (let j = i + 1; j < n; j++) dp[j] = Math.max(nums[i] - dp[j], nums[j] - dp[j - 1]);
    }
    return dp[n - 1] >= 0;
};`,
        },
      },
    ],
  },

  'minimum-score-triangulation-of-polygon': {
    pattern: 'Interval DP: the edge (i, j) belongs to one triangle (i, k, j); split there',
    approaches: [
      {
        level: 'Brute force', name: 'Recursion over the third vertex of edge (i, j)',
        idea: 'In any triangulation of the polygon `i..j`, the side `(i, j)` is in exactly one triangle `(i, k, j)`. That triangle splits the rest into two smaller polygons `i..k` and `k..j`. Try every `k`.',
        steps: [
          '`best(i, j)`: 0 if `j − i < 2` (no triangle possible).',
          'Return the minimum over `k` in `(i, j)` of `best(i, k) + values[i]·values[k]·values[j] + best(k, j)`.',
          'Answer `best(0, n − 1)`.',
        ],
        time: 'O(Cₙ·n)', space: 'O(n)',
        why: 'Without caching it explores every triangulation — the Catalan number Cₙ₋₂ of them, which grows like 4ⁿ.',
        code: {
          java: r`class Solution {
    public int minScoreTriangulation(int[] values) {
        return best(values, 0, values.length - 1);
    }

    private int best(int[] v, int i, int j) {
        if (j - i < 2) return 0;
        int result = Integer.MAX_VALUE;
        for (int k = i + 1; k < j; k++) result = Math.min(result, best(v, i, k) + v[i] * v[k] * v[j] + best(v, k, j));
        return result;
    }
}`,
          cpp: r`class Solution {
    int best(vector<int>& v, int i, int j) {
        if (j - i < 2) return 0;
        int result = INT_MAX;
        for (int k = i + 1; k < j; k++) result = min(result, best(v, i, k) + v[i] * v[k] * v[j] + best(v, k, j));
        return result;
    }
public:
    int minScoreTriangulation(vector<int>& values) {
        return best(values, 0, (int) values.size() - 1);
    }
};`,
          python: r`class Solution:
    def minScoreTriangulation(self, values: List[int]) -> int:
        def best(i, j):
            if j - i < 2:
                return 0
            return min(best(i, k) + values[i] * values[k] * values[j] + best(k, j) for k in range(i + 1, j))
        return best(0, len(values) - 1)`,
          javascript: r`var minScoreTriangulation = function(values) {
    const best = (i, j) => {
        if (j - i < 2) return 0;
        let result = Infinity;
        for (let k = i + 1; k < j; k++) result = Math.min(result, best(i, k) + values[i] * values[k] * values[j] + best(k, j));
        return result;
    };
    return best(0, values.length - 1);
};`,
        },
      },
      {
        level: 'Optimal', name: 'Bottom-up interval DP',
        idea: 'Compute `dp[i][j]` for every sub-polygon, from short gaps to long ones, using the same split rule.',
        steps: [
          '`dp[i][j] = 0` when `j − i < 2`.',
          'For `gap` from 2 to n − 1, for each `i` with `j = i + gap`: `dp[i][j] = min over k of dp[i][k] + v[i]·v[k]·v[j] + dp[k][j]`.',
          'Return `dp[0][n − 1]`.',
        ],
        time: 'O(n³)', space: 'O(n²)',
        why: 'n²/2 intervals, each trying up to n split points. Scores stay below 49 × 100³ ≈ 5·10⁷, so 32-bit ints suffice.',
        code: {
          java: r`class Solution {
    public int minScoreTriangulation(int[] values) {
        int n = values.length;
        int[][] dp = new int[n][n];
        for (int gap = 2; gap < n; gap++)
            for (int i = 0; i + gap < n; i++) {
                int j = i + gap;
                dp[i][j] = Integer.MAX_VALUE;
                for (int k = i + 1; k < j; k++)
                    dp[i][j] = Math.min(dp[i][j], dp[i][k] + values[i] * values[k] * values[j] + dp[k][j]);
            }
        return dp[0][n - 1];
    }
}`,
          cpp: r`class Solution {
public:
    int minScoreTriangulation(vector<int>& values) {
        int n = values.size();
        vector<vector<int>> dp(n, vector<int>(n, 0));
        for (int gap = 2; gap < n; gap++)
            for (int i = 0; i + gap < n; i++) {
                int j = i + gap;
                dp[i][j] = INT_MAX;
                for (int k = i + 1; k < j; k++)
                    dp[i][j] = min(dp[i][j], dp[i][k] + values[i] * values[k] * values[j] + dp[k][j]);
            }
        return dp[0][n - 1];
    }
};`,
          python: r`class Solution:
    def minScoreTriangulation(self, values: List[int]) -> int:
        n = len(values)
        dp = [[0] * n for _ in range(n)]
        for gap in range(2, n):
            for i in range(n - gap):
                j = i + gap
                dp[i][j] = min(dp[i][k] + values[i] * values[k] * values[j] + dp[k][j] for k in range(i + 1, j))
        return dp[0][n - 1]`,
          javascript: r`var minScoreTriangulation = function(values) {
    const n = values.length, dp = Array.from({ length: n }, () => new Array(n).fill(0));
    for (let gap = 2; gap < n; gap++)
        for (let i = 0; i + gap < n; i++) {
            const j = i + gap;
            dp[i][j] = Infinity;
            for (let k = i + 1; k < j; k++)
                dp[i][j] = Math.min(dp[i][j], dp[i][k] + values[i] * values[k] * values[j] + dp[k][j]);
        }
    return dp[0][n - 1];
};`,
        },
      },
    ],
  },

  'binary-tree-maximum-path-sum': {
    pattern: 'Tree DP: return the best downward branch, combine both branches at each node',
    approaches: [
      {
        level: 'Brute force', name: 'At every node, recompute its best downward branches',
        idea: 'The best path whose highest node is `t` is `t.val` plus the best non-negative downward path from each child. Compute those downward paths from scratch at every node.',
        steps: [
          '`down(t)`: the best sum of a path starting at `t` going down = `t.val + max(0, down(left), down(right))`.',
          'For every node: candidate = `t.val + max(0, down(left)) + max(0, down(right))`.',
          'Return the largest candidate.',
        ],
        time: 'O(n²)', space: 'O(h)',
        why: '`down` is recomputed for every ancestor of a node: O(n·h).',
        code: {
          java: r`class Solution {
    public int maxPathSum(TreeNode root) {
        int here = root.val + Math.max(0, down(root.left)) + Math.max(0, down(root.right));
        if (root.left != null) here = Math.max(here, maxPathSum(root.left));
        if (root.right != null) here = Math.max(here, maxPathSum(root.right));
        return here;
    }

    private int down(TreeNode t) {
        if (t == null) return 0;
        return t.val + Math.max(0, Math.max(down(t.left), down(t.right)));
    }
}`,
          cpp: r`class Solution {
    int down(TreeNode* t) {
        if (!t) return 0;
        return t->val + max(0, max(down(t->left), down(t->right)));
    }
public:
    int maxPathSum(TreeNode* root) {
        int here = root->val + max(0, down(root->left)) + max(0, down(root->right));
        if (root->left) here = max(here, maxPathSum(root->left));
        if (root->right) here = max(here, maxPathSum(root->right));
        return here;
    }
};`,
          python: r`class Solution:
    def maxPathSum(self, root: Optional[TreeNode]) -> int:
        def down(t):
            return t.val + max(0, down(t.left), down(t.right)) if t else 0
        best = -inf
        stack = [root]
        while stack:
            t = stack.pop()
            best = max(best, t.val + max(0, down(t.left)) + max(0, down(t.right)))
            stack.extend(c for c in (t.left, t.right) if c)
        return best`,
          javascript: r`var maxPathSum = function(root) {
    const down = (t) => (t ? t.val + Math.max(0, down(t.left), down(t.right)) : 0);
    let best = -Infinity;
    const stack = [root];
    while (stack.length) {
        const t = stack.pop();
        best = Math.max(best, t.val + Math.max(0, down(t.left)) + Math.max(0, down(t.right)));
        if (t.left) stack.push(t.left);
        if (t.right) stack.push(t.right);
    }
    return best;
};`,
        },
      },
      {
        level: 'Optimal', name: 'One post-order DFS',
        idea: 'Compute each node\'s best downward branch once, bottom-up. At the node, the best path that peaks there uses both branches (each only if positive); the parent can only continue one branch.',
        steps: [
          '`gain(t)`: 0 for null. `l = max(0, gain(left))`, `r = max(0, gain(right))`.',
          'Update `best = max(best, t.val + l + r)`.',
          'Return `t.val + max(l, r)` to the parent.',
          'Start `best` at −∞ so all-negative trees work.',
        ],
        time: 'O(n)', space: 'O(h)',
        why: 'Each node once; the recursion is h deep.',
        code: {
          java: r`class Solution {
    private int best = Integer.MIN_VALUE;

    public int maxPathSum(TreeNode root) {
        gain(root);
        return best;
    }

    private int gain(TreeNode t) {
        if (t == null) return 0;
        int l = Math.max(0, gain(t.left)), r = Math.max(0, gain(t.right));
        best = Math.max(best, t.val + l + r);
        return t.val + Math.max(l, r);
    }
}`,
          cpp: r`class Solution {
    int best = INT_MIN;
    int gain(TreeNode* t) {
        if (!t) return 0;
        int l = max(0, gain(t->left)), r = max(0, gain(t->right));
        best = max(best, t->val + l + r);
        return t->val + max(l, r);
    }
public:
    int maxPathSum(TreeNode* root) {
        gain(root);
        return best;
    }
};`,
          python: r`class Solution:
    def maxPathSum(self, root: Optional[TreeNode]) -> int:
        best = -inf
        def gain(t):
            nonlocal best
            if not t:
                return 0
            l, r = max(0, gain(t.left)), max(0, gain(t.right))
            best = max(best, t.val + l + r)
            return t.val + max(l, r)
        gain(root)
        return best`,
          javascript: r`var maxPathSum = function(root) {
    let best = -Infinity;
    const gain = (t) => {
        if (!t) return 0;
        const l = Math.max(0, gain(t.left)), r = Math.max(0, gain(t.right));
        best = Math.max(best, t.val + l + r);
        return t.val + Math.max(l, r);
    };
    gain(root);
    return best;
};`,
        },
      },
    ],
  },

  'binary-tree-cameras': {
    pattern: 'Tree DP / greedy from the leaves up with three states (covered, has camera, needs cover)',
    approaches: [
      {
        level: 'Brute force', name: 'Try every set of camera nodes',
        idea: 'List the nodes, try every subset as the set of cameras (smallest first), and return the first size that covers every node.',
        steps: [
          'Collect the nodes with their parent and children indices.',
          'For each subset (bitmask) of nodes, check that every node has a camera on itself, its parent or a child.',
          'Return the smallest number of cameras among covering subsets.',
        ],
        time: 'O(2ⁿ·n)', space: 'O(n)',
        why: 'Every subset of the n nodes is checked in O(n). Only usable for tiny trees.',
        code: {
          java: r`class Solution {
    public int minCameraCover(TreeNode root) {
        List<TreeNode> nodes = new ArrayList<>();
        Map<TreeNode, Integer> idx = new HashMap<>();
        Deque<TreeNode> stack = new ArrayDeque<>();
        stack.push(root);
        while (!stack.isEmpty()) {
            TreeNode t = stack.pop();
            idx.put(t, nodes.size());
            nodes.add(t);
            if (t.left != null) stack.push(t.left);
            if (t.right != null) stack.push(t.right);
        }
        int n = nodes.size(), best = n;
        int[] parent = new int[n];
        Arrays.fill(parent, -1);
        for (TreeNode t : nodes) {
            if (t.left != null) parent[idx.get(t.left)] = idx.get(t);
            if (t.right != null) parent[idx.get(t.right)] = idx.get(t);
        }
        for (int mask = 0; mask < (1 << n); mask++) {
            if (Integer.bitCount(mask) >= best) continue;
            boolean ok = true;
            for (int i = 0; i < n && ok; i++) {
                TreeNode t = nodes.get(i);
                boolean covered = (mask >> i & 1) == 1
                    || (parent[i] >= 0 && (mask >> parent[i] & 1) == 1)
                    || (t.left != null && (mask >> idx.get(t.left) & 1) == 1)
                    || (t.right != null && (mask >> idx.get(t.right) & 1) == 1);
                if (!covered) ok = false;
            }
            if (ok) best = Integer.bitCount(mask);
        }
        return best;
    }
}`,
          cpp: r`class Solution {
public:
    int minCameraCover(TreeNode* root) {
        vector<TreeNode*> nodes;
        unordered_map<TreeNode*, int> idx;
        vector<TreeNode*> stack{root};
        while (!stack.empty()) {
            TreeNode* t = stack.back();
            stack.pop_back();
            idx[t] = nodes.size();
            nodes.push_back(t);
            if (t->left) stack.push_back(t->left);
            if (t->right) stack.push_back(t->right);
        }
        int n = nodes.size(), best = n;
        vector<int> parent(n, -1);
        for (auto* t : nodes) {
            if (t->left) parent[idx[t->left]] = idx[t];
            if (t->right) parent[idx[t->right]] = idx[t];
        }
        for (int mask = 0; mask < (1 << n); mask++) {
            if (__builtin_popcount(mask) >= best) continue;
            bool ok = true;
            for (int i = 0; i < n && ok; i++) {
                TreeNode* t = nodes[i];
                bool covered = (mask >> i & 1) || (parent[i] >= 0 && (mask >> parent[i] & 1))
                    || (t->left && (mask >> idx[t->left] & 1)) || (t->right && (mask >> idx[t->right] & 1));
                if (!covered) ok = false;
            }
            if (ok) best = __builtin_popcount(mask);
        }
        return best;
    }
};`,
          python: r`class Solution:
    def minCameraCover(self, root: Optional[TreeNode]) -> int:
        nodes, stack = [], [root]
        while stack:
            t = stack.pop()
            nodes.append(t)
            stack.extend(c for c in (t.left, t.right) if c)
        idx = {t: i for i, t in enumerate(nodes)}
        neighbours = [[i] for i in range(len(nodes))]
        for t in nodes:
            for c in (t.left, t.right):
                if c:
                    neighbours[idx[t]].append(idx[c])
                    neighbours[idx[c]].append(idx[t])
        n = len(nodes)
        for size in range(1, n + 1):
            for cams in combinations(range(n), size):
                chosen = set(cams)
                if all(any(j in chosen for j in neighbours[i]) for i in range(n)):
                    return size
        return n`,
          javascript: r`var minCameraCover = function(root) {
    const nodes = [], stack = [root];
    while (stack.length) {
        const t = stack.pop();
        nodes.push(t);
        if (t.left) stack.push(t.left);
        if (t.right) stack.push(t.right);
    }
    const n = nodes.length, idx = new Map(nodes.map((t, i) => [t, i]));
    const neighbours = nodes.map((_, i) => [i]);
    for (const t of nodes)
        for (const c of [t.left, t.right])
            if (c) { neighbours[idx.get(t)].push(idx.get(c)); neighbours[idx.get(c)].push(idx.get(t)); }
    let best = n;
    for (let mask = 0; mask < (1 << n); mask++) {
        let cams = 0;
        for (let x = mask; x; x &= x - 1) cams++;
        if (cams >= best) continue;
        if (neighbours.every((list) => list.some((j) => (mask >> j) & 1))) best = cams;
    }
    return best;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Greedy from the leaves up',
        idea: 'A leaf should never hold a camera: putting it on the leaf\'s parent covers strictly more. So work bottom-up with three states per node — 0: not covered yet, 1: has a camera, 2: covered without a camera. Place a camera at a node exactly when some child is not covered.',
        steps: [
          '`state(null) = 2` (a missing child needs nothing).',
          'If either child is 0 (uncovered), put a camera here: count it and return 1.',
          'If either child has a camera, return 2 (covered). Otherwise return 0 (let the parent cover it).',
          'After the DFS, if the root returned 0, add one camera for it.',
        ],
        time: 'O(n)', space: 'O(h)',
        why: 'One post-order pass. The greedy choice is safe: covering an uncovered child with a camera at its parent covers the parent and grandparent too, which no other placement beats.',
        code: {
          java: r`class Solution {
    private int cameras = 0;

    public int minCameraCover(TreeNode root) {
        return state(root) == 0 ? cameras + 1 : cameras;
    }

    // 0: needs cover, 1: has a camera, 2: covered without a camera
    private int state(TreeNode t) {
        if (t == null) return 2;
        int l = state(t.left), r = state(t.right);
        if (l == 0 || r == 0) { cameras++; return 1; }
        if (l == 1 || r == 1) return 2;
        return 0;
    }
}`,
          cpp: r`class Solution {
    int cameras = 0;
    // 0: needs cover, 1: has a camera, 2: covered without a camera
    int state(TreeNode* t) {
        if (!t) return 2;
        int l = state(t->left), r = state(t->right);
        if (l == 0 || r == 0) { cameras++; return 1; }
        if (l == 1 || r == 1) return 2;
        return 0;
    }
public:
    int minCameraCover(TreeNode* root) {
        return state(root) == 0 ? cameras + 1 : cameras;
    }
};`,
          python: r`class Solution:
    def minCameraCover(self, root: Optional[TreeNode]) -> int:
        cameras = 0
        def state(t):  # 0: needs cover, 1: has a camera, 2: covered without a camera
            nonlocal cameras
            if not t:
                return 2
            l, r = state(t.left), state(t.right)
            if l == 0 or r == 0:
                cameras += 1
                return 1
            if l == 1 or r == 1:
                return 2
            return 0
        return cameras + 1 if state(root) == 0 else cameras`,
          javascript: r`var minCameraCover = function(root) {
    let cameras = 0;
    // 0: needs cover, 1: has a camera, 2: covered without a camera
    const state = (t) => {
        if (!t) return 2;
        const l = state(t.left), r = state(t.right);
        if (l === 0 || r === 0) { cameras++; return 1; }
        if (l === 1 || r === 1) return 2;
        return 0;
    };
    return state(root) === 0 ? cameras + 1 : cameras;
};`,
        },
      },
    ],
  },

  'burst-balloons': {
    pattern: 'Interval DP on the LAST balloon burst in each range',
    approaches: [
      {
        level: 'Brute force', name: 'Try every bursting order',
        idea: 'Recursively choose which balloon to burst next from those remaining, adding its coins (with its current neighbours), and keep the best total.',
        steps: [
          'Keep the remaining balloons in a list.',
          'For each position `i`: coins = `left · nums[i] · right` (1 past the ends); remove it, recurse, put it back.',
          'Return the best total.',
        ],
        time: 'O(n!·n)', space: 'O(n)',
        why: 'n! orders, each step rebuilding the list. Only feasible for a handful of balloons.',
        code: {
          java: r`class Solution {
    public int maxCoins(int[] nums) {
        List<Integer> left = new ArrayList<>();
        for (int x : nums) left.add(x);
        return best(left);
    }

    private int best(List<Integer> b) {
        if (b.isEmpty()) return 0;
        int result = 0;
        for (int i = 0; i < b.size(); i++) {
            int coins = (i > 0 ? b.get(i - 1) : 1) * b.get(i) * (i + 1 < b.size() ? b.get(i + 1) : 1);
            int x = b.remove(i);
            result = Math.max(result, coins + best(b));
            b.add(i, x);
        }
        return result;
    }
}`,
          cpp: r`class Solution {
    int best(vector<int>& b) {
        if (b.empty()) return 0;
        int result = 0;
        for (size_t i = 0; i < b.size(); i++) {
            int coins = (i > 0 ? b[i - 1] : 1) * b[i] * (i + 1 < b.size() ? b[i + 1] : 1);
            int x = b[i];
            b.erase(b.begin() + i);
            result = max(result, coins + best(b));
            b.insert(b.begin() + i, x);
        }
        return result;
    }
public:
    int maxCoins(vector<int>& nums) {
        vector<int> b = nums;
        return best(b);
    }
};`,
          python: r`class Solution:
    def maxCoins(self, nums: List[int]) -> int:
        def best(b):
            result = 0
            for i in range(len(b)):
                coins = (b[i - 1] if i > 0 else 1) * b[i] * (b[i + 1] if i + 1 < len(b) else 1)
                result = max(result, coins + best(b[:i] + b[i + 1:]))
            return result
        return best(nums)`,
          javascript: r`var maxCoins = function(nums) {
    const best = (b) => {
        let result = 0;
        for (let i = 0; i < b.length; i++) {
            const coins = (i > 0 ? b[i - 1] : 1) * b[i] * (i + 1 < b.length ? b[i + 1] : 1);
            result = Math.max(result, coins + best([...b.slice(0, i), ...b.slice(i + 1)]));
        }
        return result;
    };
    return best(nums);
};`,
        },
      },
      {
        level: 'Optimal', name: 'Interval DP choosing the last balloon',
        idea: 'Pad the array with 1 on both ends. For an open range `(l, r)`, choose which balloon `k` bursts LAST inside it: at that moment its neighbours are exactly `l` and `r`, and the two sides `(l, k)` and `(k, r)` were solved independently before.',
        steps: [
          'Let `a = [1] + nums + [1]`; `dp[l][r]` = best coins from bursting everything strictly between `l` and `r`.',
          'For gaps from 2 up to n + 1, for each `l` with `r = l + gap`: `dp[l][r] = max over k in (l, r) of dp[l][k] + a[l]·a[k]·a[r] + dp[k][r]`.',
          'Return `dp[0][n + 1]`.',
        ],
        time: 'O(n³)', space: 'O(n²)',
        why: 'n²/2 ranges, each trying up to n last balloons. Thinking about the first burst instead makes the sides depend on each other; the last burst is what makes them independent.',
        code: {
          java: r`class Solution {
    public int maxCoins(int[] nums) {
        int n = nums.length;
        int[] a = new int[n + 2];
        a[0] = a[n + 1] = 1;
        for (int i = 0; i < n; i++) a[i + 1] = nums[i];
        int[][] dp = new int[n + 2][n + 2];
        for (int gap = 2; gap <= n + 1; gap++)
            for (int l = 0; l + gap <= n + 1; l++) {
                int r = l + gap;
                for (int k = l + 1; k < r; k++)
                    dp[l][r] = Math.max(dp[l][r], dp[l][k] + a[l] * a[k] * a[r] + dp[k][r]);
            }
        return dp[0][n + 1];
    }
}`,
          cpp: r`class Solution {
public:
    int maxCoins(vector<int>& nums) {
        int n = nums.size();
        vector<int> a(n + 2, 1);
        for (int i = 0; i < n; i++) a[i + 1] = nums[i];
        vector<vector<int>> dp(n + 2, vector<int>(n + 2, 0));
        for (int gap = 2; gap <= n + 1; gap++)
            for (int l = 0; l + gap <= n + 1; l++) {
                int r = l + gap;
                for (int k = l + 1; k < r; k++)
                    dp[l][r] = max(dp[l][r], dp[l][k] + a[l] * a[k] * a[r] + dp[k][r]);
            }
        return dp[0][n + 1];
    }
};`,
          python: r`class Solution:
    def maxCoins(self, nums: List[int]) -> int:
        a = [1] + nums + [1]
        n = len(a)
        dp = [[0] * n for _ in range(n)]
        for gap in range(2, n):
            for l in range(n - gap):
                r = l + gap
                dp[l][r] = max(dp[l][k] + a[l] * a[k] * a[r] + dp[k][r] for k in range(l + 1, r))
        return dp[0][n - 1]`,
          javascript: r`var maxCoins = function(nums) {
    const a = [1, ...nums, 1], n = a.length;
    const dp = Array.from({ length: n }, () => new Array(n).fill(0));
    for (let gap = 2; gap < n; gap++)
        for (let l = 0; l + gap < n; l++) {
            const r = l + gap;
            for (let k = l + 1; k < r; k++)
                dp[l][r] = Math.max(dp[l][r], dp[l][k] + a[l] * a[k] * a[r] + dp[k][r]);
        }
    return dp[0][n - 1];
};`,
        },
      },
    ],
  },

  'minimum-cost-to-cut-a-stick': {
    pattern: 'Interval DP over sorted cut positions (the first cut in a piece splits it into two subproblems)',
    approaches: [
      {
        level: 'Brute force', name: 'Recursion over which cut to make first in each piece',
        idea: 'For a piece between two positions, choose which of its cuts to make first: it costs the piece\'s length and splits it into two independent pieces. Try every choice.',
        steps: [
          'Sort the cuts and add the ends 0 and n.',
          '`cost(i, j)`: 0 if there is no cut strictly between `points[i]` and `points[j]`.',
          'Otherwise `points[j] − points[i] + min over k in (i, j) of cost(i, k) + cost(k, j)`.',
        ],
        time: 'O(Cₘ·m)', space: 'O(m)',
        why: 'Without caching it explores every order of cutting, which grows like the Catalan numbers in m (the number of cuts).',
        code: {
          java: r`class Solution {
    private int[] p;

    public int minCost(int n, int[] cuts) {
        Arrays.sort(cuts);
        p = new int[cuts.length + 2];
        p[p.length - 1] = n;
        System.arraycopy(cuts, 0, p, 1, cuts.length);
        return cost(0, p.length - 1);
    }

    private int cost(int i, int j) {
        if (j - i < 2) return 0;
        int best = Integer.MAX_VALUE;
        for (int k = i + 1; k < j; k++) best = Math.min(best, cost(i, k) + cost(k, j));
        return p[j] - p[i] + best;
    }
}`,
          cpp: r`class Solution {
    vector<int> p;
    int cost(int i, int j) {
        if (j - i < 2) return 0;
        int best = INT_MAX;
        for (int k = i + 1; k < j; k++) best = min(best, cost(i, k) + cost(k, j));
        return p[j] - p[i] + best;
    }
public:
    int minCost(int n, vector<int>& cuts) {
        sort(cuts.begin(), cuts.end());
        p = {0};
        p.insert(p.end(), cuts.begin(), cuts.end());
        p.push_back(n);
        return cost(0, (int) p.size() - 1);
    }
};`,
          python: r`class Solution:
    def minCost(self, n: int, cuts: List[int]) -> int:
        p = [0] + sorted(cuts) + [n]
        def cost(i, j):
            if j - i < 2:
                return 0
            return p[j] - p[i] + min(cost(i, k) + cost(k, j) for k in range(i + 1, j))
        return cost(0, len(p) - 1)`,
          javascript: r`var minCost = function(n, cuts) {
    const p = [0, ...[...cuts].sort((a, b) => a - b), n];
    const cost = (i, j) => {
        if (j - i < 2) return 0;
        let best = Infinity;
        for (let k = i + 1; k < j; k++) best = Math.min(best, cost(i, k) + cost(k, j));
        return p[j] - p[i] + best;
    };
    return cost(0, p.length - 1);
};`,
        },
      },
      {
        level: 'Optimal', name: 'Bottom-up interval DP',
        idea: 'With the sorted points `0, cuts…, n`, compute `dp[i][j]` (cheapest way to make every cut strictly between points `i` and `j`) for short ranges first.',
        steps: [
          'Build `p = [0] + sorted(cuts) + [n]`; let `k = p.length`.',
          'For gaps from 2 to k − 1, for each `i` with `j = i + gap`: `dp[i][j] = p[j] − p[i] + min over mid in (i, j) of dp[i][mid] + dp[mid][j]`.',
          'Return `dp[0][k − 1]`.',
        ],
        time: 'O(m³)', space: 'O(m²)',
        why: 'm = number of cuts (≤ 100): m²/2 ranges × m split points. The stick length n (up to 10⁶) never enters the complexity.',
        code: {
          java: r`class Solution {
    public int minCost(int n, int[] cuts) {
        Arrays.sort(cuts);
        int k = cuts.length + 2;
        int[] p = new int[k];
        p[k - 1] = n;
        System.arraycopy(cuts, 0, p, 1, cuts.length);
        int[][] dp = new int[k][k];
        for (int gap = 2; gap < k; gap++)
            for (int i = 0; i + gap < k; i++) {
                int j = i + gap, best = Integer.MAX_VALUE;
                for (int mid = i + 1; mid < j; mid++) best = Math.min(best, dp[i][mid] + dp[mid][j]);
                dp[i][j] = p[j] - p[i] + best;
            }
        return dp[0][k - 1];
    }
}`,
          cpp: r`class Solution {
public:
    int minCost(int n, vector<int>& cuts) {
        sort(cuts.begin(), cuts.end());
        vector<int> p{0};
        p.insert(p.end(), cuts.begin(), cuts.end());
        p.push_back(n);
        int k = p.size();
        vector<vector<int>> dp(k, vector<int>(k, 0));
        for (int gap = 2; gap < k; gap++)
            for (int i = 0; i + gap < k; i++) {
                int j = i + gap, best = INT_MAX;
                for (int mid = i + 1; mid < j; mid++) best = min(best, dp[i][mid] + dp[mid][j]);
                dp[i][j] = p[j] - p[i] + best;
            }
        return dp[0][k - 1];
    }
};`,
          python: r`class Solution:
    def minCost(self, n: int, cuts: List[int]) -> int:
        p = [0] + sorted(cuts) + [n]
        k = len(p)
        dp = [[0] * k for _ in range(k)]
        for gap in range(2, k):
            for i in range(k - gap):
                j = i + gap
                dp[i][j] = p[j] - p[i] + min(dp[i][m] + dp[m][j] for m in range(i + 1, j))
        return dp[0][k - 1]`,
          javascript: r`var minCost = function(n, cuts) {
    const p = [0, ...[...cuts].sort((a, b) => a - b), n], k = p.length;
    const dp = Array.from({ length: k }, () => new Array(k).fill(0));
    for (let gap = 2; gap < k; gap++)
        for (let i = 0; i + gap < k; i++) {
            const j = i + gap;
            let best = Infinity;
            for (let mid = i + 1; mid < j; mid++) best = Math.min(best, dp[i][mid] + dp[mid][j]);
            dp[i][j] = p[j] - p[i] + best;
        }
    return dp[0][k - 1];
};`,
        },
      },
    ],
  },
};
