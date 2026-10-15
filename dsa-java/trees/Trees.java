// Patterns: Tree DFS, Tree BFS, Binary Search Trees. Run: java dsa-java/trees/Trees.java
import java.util.*;

public class Trees {
    public static void main(String[] args) {
        var rnd = new Random(13);
        for (int t = 0; t < 3_000; t++) {
            TreeNode root = randomTree(rnd, rnd.nextInt(16));
            List<TreeNode> nodes = new ArrayList<>(); collect(root, nodes);
            // ---- DFS ----
            Check.that(maxDepth(root) == depthBrute(root), "maxDepth");
            Check.that(isBalanced(root) == balancedBrute(root), "isBalanced");
            Check.that(diameterOfBinaryTree(root) == diameterBrute(root, nodes), "diameter");
            Check.that(maxPathSum(root) == maxPathBrute(root, nodes) || root == null, "maxPathSum");
            int target = rnd.nextInt(21) - 10;
            Check.that(hasPathSum(root, target) == pathSumBrute(root, target, 0), "hasPathSum");
            Check.that(isSameTree(root, copy(root)) && isSymmetric(mirrorJoin(copy(root))), "same / symmetric");
            TreeNode inv = invertTree(copy(root)); Check.that(isSameTree(invertTree(inv), root), "invert twice = original");
            Check.that(goodNodes(root) == goodBrute(root, Integer.MIN_VALUE), "goodNodes");
            if (nodes.size() >= 2) { TreeNode p = nodes.get(rnd.nextInt(nodes.size())), q = nodes.get(rnd.nextInt(nodes.size()));
                Check.that(lowestCommonAncestor(root, p, q) == lcaBrute(root, p, q), "LCA"); }
            // build from preorder + inorder (distinct values)
            TreeNode distinct = randomBST(rnd, rnd.nextInt(12));
            List<Integer> pre = new ArrayList<>(), in = new ArrayList<>(); preorder(distinct, pre); inorder(distinct, in);
            Check.that(isSameTree(buildTree(pre.stream().mapToInt(i -> i).toArray(), in.stream().mapToInt(i -> i).toArray()), distinct), "buildTree");
            Check.that(isSameTree(deserialize(serialize(root)), root), "serialize round trip");
            // ---- BFS ----
            List<List<Integer>> levels = levelOrder(root);
            Check.that(levels.equals(levelsBrute(root)), "levelOrder");
            List<Integer> right = rightSideView(root), rb = new ArrayList<>(); for (List<Integer> l : levels) rb.add(l.get(l.size() - 1));
            Check.that(right.equals(rb), "rightSideView");
            Check.that(minDepth(root) == minDepthBrute(root), "minDepth");
            List<List<Integer>> zz = zigzagLevelOrder(root);
            for (int i = 0; i < levels.size(); i++) { List<Integer> e = new ArrayList<>(levels.get(i)); if (i % 2 == 1) Collections.reverse(e); Check.that(zz.get(i).equals(e), "zigzag"); }
            // ---- BST ----
            TreeNode bst = randomBST(rnd, rnd.nextInt(15));
            List<Integer> sorted = new ArrayList<>(); inorder(bst, sorted);
            Check.that(isValidBST(bst) && (root == null || isValidBST(root) == validBrute(root)), "isValidBST");
            if (!sorted.isEmpty()) { int k = 1 + rnd.nextInt(sorted.size()); Check.that(kthSmallest(bst, k) == sorted.get(k - 1), "kthSmallest"); }
            int key = rnd.nextInt(30);
            Check.that((searchBST(bst, key) != null) == sorted.contains(key), "searchBST");
            TreeNode ins = insertIntoBST(copy(bst), key); List<Integer> after = new ArrayList<>(); inorder(ins, after);
            if (!sorted.contains(key)) { List<Integer> e = new ArrayList<>(sorted); e.add(key); Collections.sort(e); Check.that(after.equals(e) && isValidBST(ins), "insertIntoBST"); }
            TreeNode del = deleteNode(copy(bst), key); List<Integer> afterDel = new ArrayList<>(); inorder(del, afterDel);
            List<Integer> e2 = new ArrayList<>(sorted); e2.remove(Integer.valueOf(key)); Check.that(afterDel.equals(e2) && isValidBST(del), "deleteNode");
            int[] arr = sorted.stream().mapToInt(i -> i).toArray(); TreeNode bal = sortedArrayToBST(arr);
            List<Integer> back = new ArrayList<>(); inorder(bal, back); Check.that(back.equals(sorted) && isBalanced(bal), "sortedArrayToBST");
            List<TreeNode> bn = new ArrayList<>(); collect(bst, bn);
            if (bn.size() >= 2) { TreeNode p = bn.get(rnd.nextInt(bn.size())), q = bn.get(rnd.nextInt(bn.size())); Check.that(lcaBST(bst, p, q) == lcaBrute(bst, p, q), "LCA in BST"); }
        }
        Check.done("trees");
    }

    static class TreeNode { int val; TreeNode left, right; TreeNode(int v) { val = v; } }

    // ===================== DFS =====================
    static int maxDepth(TreeNode root) {
        if (root == null) return 0;                                      // base case: empty tree
        return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));  // trust the children
    }

    static boolean isSameTree(TreeNode a, TreeNode b) {
        if (a == null || b == null) return a == b;
        return a.val == b.val && isSameTree(a.left, b.left) && isSameTree(a.right, b.right);
    }

    static boolean isSymmetric(TreeNode root) { return root == null || mirror(root.left, root.right); }
    static boolean mirror(TreeNode a, TreeNode b) {
        if (a == null || b == null) return a == b;
        return a.val == b.val && mirror(a.left, b.right) && mirror(a.right, b.left);
    }

    static TreeNode invertTree(TreeNode root) {
        if (root == null) return null;
        TreeNode l = invertTree(root.left), r = invertTree(root.right);
        root.left = r; root.right = l;
        return root;
    }

    static boolean hasPathSum(TreeNode root, int target) {                // root-to-LEAF
        if (root == null) return false;
        if (root.left == null && root.right == null) return root.val == target;
        return hasPathSum(root.left, target - root.val) || hasPathSum(root.right, target - root.val);
    }

    /** Pass the max so far DOWN; count nodes not smaller than every ancestor. */
    static int goodNodes(TreeNode root) { return good(root, Integer.MIN_VALUE); }
    static int good(TreeNode n, int maxAbove) {
        if (n == null) return 0;
        int self = n.val >= maxAbove ? 1 : 0;
        int m = Math.max(maxAbove, n.val);
        return self + good(n.left, m) + good(n.right, m);
    }

    /** Return height UP, update a global answer on the way: −1 marks "unbalanced". */
    static boolean isBalanced(TreeNode root) { return height(root) != -1; }
    static int height(TreeNode n) {
        if (n == null) return 0;
        int l = height(n.left), r = height(n.right);
        if (l == -1 || r == -1 || Math.abs(l - r) > 1) return -1;
        return 1 + Math.max(l, r);
    }

    static int diameter;
    static int diameterOfBinaryTree(TreeNode root) { diameter = 0; depthForDiameter(root); return diameter; }
    static int depthForDiameter(TreeNode n) {
        if (n == null) return 0;
        int l = depthForDiameter(n.left), r = depthForDiameter(n.right);
        diameter = Math.max(diameter, l + r);              // the longest path that bends at n
        return 1 + Math.max(l, r);                         // what the parent can use: one side only
    }

    static int bestPath;
    static int maxPathSum(TreeNode root) { bestPath = Integer.MIN_VALUE; gain(root); return bestPath; }
    static int gain(TreeNode n) {
        if (n == null) return 0;
        int l = Math.max(0, gain(n.left)), r = Math.max(0, gain(n.right));   // drop negative branches
        bestPath = Math.max(bestPath, n.val + l + r);                         // path bending here
        return n.val + Math.max(l, r);                                        // path continuing to the parent
    }

    static TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        if (root == null || root == p || root == q) return root;
        TreeNode l = lowestCommonAncestor(root.left, p, q), r = lowestCommonAncestor(root.right, p, q);
        if (l != null && r != null) return root;           // p and q are on different sides
        return l != null ? l : r;
    }

    static int preIdx;
    static TreeNode buildTree(int[] preorder, int[] inorder) {
        Map<Integer, Integer> where = new HashMap<>();
        for (int i = 0; i < inorder.length; i++) where.put(inorder[i], i);
        preIdx = 0;
        return build(preorder, where, 0, inorder.length - 1);
    }
    static TreeNode build(int[] pre, Map<Integer, Integer> where, int lo, int hi) {
        if (lo > hi) return null;
        TreeNode root = new TreeNode(pre[preIdx++]);       // preorder: the root comes first
        int mid = where.get(root.val);                     // inorder: left subtree | root | right subtree
        root.left = build(pre, where, lo, mid - 1);
        root.right = build(pre, where, mid + 1, hi);
        return root;
    }

    static String serialize(TreeNode root) {
        StringBuilder sb = new StringBuilder();
        ser(root, sb);
        return sb.toString();
    }
    static void ser(TreeNode n, StringBuilder sb) {
        if (n == null) { sb.append("#,"); return; }         // record nulls so the shape is unambiguous
        sb.append(n.val).append(',');
        ser(n.left, sb); ser(n.right, sb);
    }
    static TreeNode deserialize(String data) { return des(new ArrayDeque<>(Arrays.asList(data.split(",")))); }
    static TreeNode des(Deque<String> q) {
        String s = q.poll();
        if (s == null || s.equals("#") || s.isEmpty()) return null;
        TreeNode n = new TreeNode(Integer.parseInt(s));
        n.left = des(q); n.right = des(q);
        return n;
    }

    // ===================== BFS =====================
    static List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> out = new ArrayList<>();
        if (root == null) return out;
        Deque<TreeNode> queue = new ArrayDeque<>();
        queue.offer(root);
        while (!queue.isEmpty()) {
            int size = queue.size();                       // everything in the queue now is one level
            List<Integer> level = new ArrayList<>();
            for (int i = 0; i < size; i++) {
                TreeNode n = queue.poll();
                level.add(n.val);
                if (n.left != null) queue.offer(n.left);
                if (n.right != null) queue.offer(n.right);
            }
            out.add(level);
        }
        return out;
    }

    static List<Integer> rightSideView(TreeNode root) {
        List<Integer> out = new ArrayList<>();
        if (root == null) return out;
        Deque<TreeNode> queue = new ArrayDeque<>(List.of(root));
        while (!queue.isEmpty()) {
            int size = queue.size();
            for (int i = 0; i < size; i++) {
                TreeNode n = queue.poll();
                if (i == size - 1) out.add(n.val);         // last node of the level
                if (n.left != null) queue.offer(n.left);
                if (n.right != null) queue.offer(n.right);
            }
        }
        return out;
    }

    static int minDepth(TreeNode root) {
        if (root == null) return 0;
        Deque<TreeNode> queue = new ArrayDeque<>(List.of(root));
        for (int depth = 1; ; depth++) {
            int size = queue.size();
            for (int i = 0; i < size; i++) {
                TreeNode n = queue.poll();
                if (n.left == null && n.right == null) return depth;   // first leaf found = shallowest
                if (n.left != null) queue.offer(n.left);
                if (n.right != null) queue.offer(n.right);
            }
        }
    }

    static List<List<Integer>> zigzagLevelOrder(TreeNode root) {
        List<List<Integer>> out = new ArrayList<>();
        if (root == null) return out;
        Deque<TreeNode> queue = new ArrayDeque<>(List.of(root));
        boolean leftToRight = true;
        while (!queue.isEmpty()) {
            int size = queue.size();
            LinkedList<Integer> level = new LinkedList<>();
            for (int i = 0; i < size; i++) {
                TreeNode n = queue.poll();
                if (leftToRight) level.addLast(n.val); else level.addFirst(n.val);
                if (n.left != null) queue.offer(n.left);
                if (n.right != null) queue.offer(n.right);
            }
            out.add(level);
            leftToRight = !leftToRight;
        }
        return out;
    }

    // ===================== BST =====================
    static boolean isValidBST(TreeNode root) { return valid(root, Long.MIN_VALUE, Long.MAX_VALUE); }
    static boolean valid(TreeNode n, long lo, long hi) {               // pass the allowed range DOWN
        if (n == null) return true;
        if (n.val <= lo || n.val >= hi) return false;
        return valid(n.left, lo, n.val) && valid(n.right, n.val, hi);
    }

    static int kthSmallest(TreeNode root, int k) {                     // iterative in-order, stop at k
        Deque<TreeNode> stack = new ArrayDeque<>();
        TreeNode cur = root;
        while (true) {
            while (cur != null) { stack.push(cur); cur = cur.left; }   // go as far left as possible
            cur = stack.pop();
            if (--k == 0) return cur.val;
            cur = cur.right;
        }
    }

    static TreeNode searchBST(TreeNode root, int val) {
        while (root != null && root.val != val) root = val < root.val ? root.left : root.right;
        return root;
    }

    static TreeNode insertIntoBST(TreeNode root, int val) {
        if (root == null) return new TreeNode(val);
        if (val < root.val) root.left = insertIntoBST(root.left, val);
        else root.right = insertIntoBST(root.right, val);
        return root;
    }

    static TreeNode deleteNode(TreeNode root, int key) {
        if (root == null) return null;
        if (key < root.val) root.left = deleteNode(root.left, key);
        else if (key > root.val) root.right = deleteNode(root.right, key);
        else {
            if (root.left == null) return root.right;                  // 0 or 1 child: splice it out
            if (root.right == null) return root.left;
            TreeNode succ = root.right;                                // 2 children: in-order successor
            while (succ.left != null) succ = succ.left;
            root.val = succ.val;                                       // copy it up…
            root.right = deleteNode(root.right, succ.val);             // …and delete it below
        }
        return root;
    }

    static TreeNode sortedArrayToBST(int[] a) { return fromRange(a, 0, a.length - 1); }
    static TreeNode fromRange(int[] a, int lo, int hi) {
        if (lo > hi) return null;
        int mid = lo + (hi - lo) / 2;                                  // middle element as root → balanced
        TreeNode n = new TreeNode(a[mid]);
        n.left = fromRange(a, lo, mid - 1);
        n.right = fromRange(a, mid + 1, hi);
        return n;
    }

    static TreeNode lcaBST(TreeNode root, TreeNode p, TreeNode q) {
        TreeNode cur = root;
        while (true) {
            if (p.val < cur.val && q.val < cur.val) cur = cur.left;       // both smaller: go left
            else if (p.val > cur.val && q.val > cur.val) cur = cur.right; // both bigger: go right
            else return cur;                                              // they split here
        }
    }

    // ===================== testing helpers =====================
    static TreeNode randomTree(Random r, int n) { if (n == 0) return null; TreeNode root = new TreeNode(r.nextInt(21) - 10); List<TreeNode> all = new ArrayList<>(List.of(root));
        for (int i = 1; i < n; i++) { while (true) { TreeNode p = all.get(r.nextInt(all.size())); TreeNode c = new TreeNode(r.nextInt(21) - 10);
            if (r.nextBoolean() && p.left == null) { p.left = c; all.add(c); break; } if (p.right == null) { p.right = c; all.add(c); break; } } } return root; }
    static TreeNode randomBST(Random r, int n) { TreeNode root = null; Set<Integer> used = new HashSet<>(); for (int i = 0; i < n; i++) { int v; do v = r.nextInt(30); while (!used.add(v)); root = insertIntoBST(root, v); } return root; }
    static void collect(TreeNode n, List<TreeNode> out) { if (n == null) return; out.add(n); collect(n.left, out); collect(n.right, out); }
    static void inorder(TreeNode n, List<Integer> out) { if (n == null) return; inorder(n.left, out); out.add(n.val); inorder(n.right, out); }
    static void preorder(TreeNode n, List<Integer> out) { if (n == null) return; out.add(n.val); preorder(n.left, out); preorder(n.right, out); }
    static TreeNode copy(TreeNode n) { if (n == null) return null; TreeNode c = new TreeNode(n.val); c.left = copy(n.left); c.right = copy(n.right); return c; }
    static TreeNode mirrorJoin(TreeNode t) { TreeNode root = new TreeNode(0); root.left = t; root.right = invertTree(copy(t)); return root; }
    static int depthBrute(TreeNode n) { List<List<Integer>> l = levelsBrute(n); return l.size(); }
    static List<List<Integer>> levelsBrute(TreeNode root) { List<List<Integer>> out = new ArrayList<>(); fill(root, 0, out); return out; }
    static void fill(TreeNode n, int d, List<List<Integer>> out) { if (n == null) return; if (out.size() == d) out.add(new ArrayList<>()); out.get(d).add(n.val); fill(n.left, d + 1, out); fill(n.right, d + 1, out); }
    static boolean balancedBrute(TreeNode n) { return n == null || (Math.abs(depthBrute(n.left) - depthBrute(n.right)) <= 1 && balancedBrute(n.left) && balancedBrute(n.right)); }
    static Map<TreeNode, TreeNode> parents(TreeNode root) { Map<TreeNode, TreeNode> p = new HashMap<>(); Deque<TreeNode> st = new ArrayDeque<>(); if (root != null) st.push(root);
        while (!st.isEmpty()) { TreeNode n = st.pop(); for (TreeNode c : new TreeNode[] { n.left, n.right }) if (c != null) { p.put(c, n); st.push(c); } } return p; }
    static List<TreeNode> pathToRoot(TreeNode n, Map<TreeNode, TreeNode> par) { List<TreeNode> l = new ArrayList<>(); for (TreeNode x = n; x != null; x = par.get(x)) l.add(x); return l; }
    static int diameterBrute(TreeNode root, List<TreeNode> nodes) { Map<TreeNode, TreeNode> par = parents(root); int best = 0;
        for (TreeNode a : nodes) for (TreeNode b : nodes) { List<TreeNode> pa = pathToRoot(a, par), pb = pathToRoot(b, par); TreeNode lca = lcaFrom(pa, pb); best = Math.max(best, pa.indexOf(lca) + pb.indexOf(lca)); } return best; }
    static int maxPathBrute(TreeNode root, List<TreeNode> nodes) { Map<TreeNode, TreeNode> par = parents(root); int best = Integer.MIN_VALUE;
        for (TreeNode a : nodes) for (TreeNode b : nodes) { List<TreeNode> pa = pathToRoot(a, par), pb = pathToRoot(b, par); TreeNode lca = lcaFrom(pa, pb); int s = 0;
            for (int i = 0; i <= pa.indexOf(lca); i++) s += pa.get(i).val; for (int i = 0; i < pb.indexOf(lca); i++) s += pb.get(i).val; best = Math.max(best, s); } return best; }
    static TreeNode lcaFrom(List<TreeNode> pa, List<TreeNode> pb) { Set<TreeNode> s = new HashSet<>(pb); for (TreeNode x : pa) if (s.contains(x)) return x; return null; }
    static TreeNode lcaBrute(TreeNode root, TreeNode p, TreeNode q) { Map<TreeNode, TreeNode> par = parents(root); return lcaFrom(pathToRoot(p, par), pathToRoot(q, par)); }
    static boolean pathSumBrute(TreeNode n, int target, int sum) { if (n == null) return false; sum += n.val; if (n.left == null && n.right == null) return sum == target; return pathSumBrute(n.left, target, sum) || pathSumBrute(n.right, target, sum); }
    static int goodBrute(TreeNode n, int max) { if (n == null) return 0; return (n.val >= max ? 1 : 0) + goodBrute(n.left, Math.max(max, n.val)) + goodBrute(n.right, Math.max(max, n.val)); }
    static int minDepthBrute(TreeNode n) { if (n == null) return 0; if (n.left == null && n.right == null) return 1; int best = Integer.MAX_VALUE;
        if (n.left != null) best = Math.min(best, minDepthBrute(n.left)); if (n.right != null) best = Math.min(best, minDepthBrute(n.right)); return 1 + best; }
    static boolean validBrute(TreeNode root) { List<Integer> in = new ArrayList<>(); inorder(root, in); for (int i = 1; i < in.size(); i++) if (in.get(i) <= in.get(i - 1)) return false; return true; }
}

final class Check {
    private static int passed;
    static void that(boolean cond, String what) { if (!cond) throw new AssertionError("FAILED: " + what); passed++; }
    static void done(String name) { System.out.println("✓ " + name + ": " + passed + " checks passed"); }
}
