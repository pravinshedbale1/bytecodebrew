// Course: Data Structures Basics. Each structure is built from scratch and tested against the Java library.
// Run: java dsa-java/data-structures/Basics.java
import java.util.*;

public class Basics {
    public static void main(String[] args) {
        var rnd = new Random(5);
        testDynamicArray(rnd);
        testLinkedList(rnd);
        testStackQueue(rnd);
        testHashMap(rnd);
        testBST(rnd);
        testHeap(rnd);
        testGraph(rnd);
        testIdioms();
        Check.done("data-structures");
    }

    // ================================================================ dynamic array
    /** What ArrayList does inside: a fixed array that is replaced by one twice as big when full. */
    static class DynamicArray {
        private int[] data = new int[1];
        private int size;
        long copies;                                   // elements copied during resizes (for the amortised check)

        void add(int x) {
            if (size == data.length) {                 // full: allocate double and copy everything over
                data = Arrays.copyOf(data, data.length * 2);
                copies += size;
            }
            data[size++] = x;
        }

        int get(int i) {
            if (i < 0 || i >= size) throw new IndexOutOfBoundsException(i);
            return data[i];                            // address = start + i × 4 bytes: O(1)
        }

        void insert(int i, int x) {                    // O(n): everything after i shifts right
            add(0);
            System.arraycopy(data, i, data, i + 1, size - 1 - i);
            data[i] = x;
        }

        int removeLast() { return data[--size]; }
        int size() { return size; }
    }

    static void testDynamicArray(Random rnd) {
        for (int t = 0; t < 1_000; t++) {
            DynamicArray a = new DynamicArray();
            List<Integer> model = new ArrayList<>();
            for (int op = 0; op < 60; op++) {
                int r = rnd.nextInt(4);
                if (r == 0 && model.size() > 0) Check.that(a.removeLast() == model.remove(model.size() - 1), "removeLast");
                else if (r == 1) { int i = rnd.nextInt(model.size() + 1), x = rnd.nextInt(100); a.insert(i, x); model.add(i, x); }
                else { int x = rnd.nextInt(100); a.add(x); model.add(x); }
                Check.that(a.size() == model.size(), "size");
                for (int i = 0; i < model.size(); i++) Check.that(a.get(i) == model.get(i), "get");
            }
        }
        DynamicArray a = new DynamicArray();
        for (int i = 0; i < 1_000_000; i++) a.add(i);
        Check.that(a.copies < 2_000_000, "amortised O(1): total copies < 2n");
    }

    // ================================================================ singly linked list
    static class Node {
        int val;
        Node next;
        Node(int val, Node next) { this.val = val; this.next = next; }
    }

    static class SinglyLinkedList {
        Node head, tail;
        int size;

        void addFirst(int x) {                         // O(1): the new node points at the old head
            head = new Node(x, head);
            if (tail == null) tail = head;
            size++;
        }

        void addLast(int x) {                          // O(1) thanks to the tail pointer
            Node n = new Node(x, null);
            if (tail == null) head = tail = n;
            else { tail.next = n; tail = n; }
            size++;
        }

        int removeFirst() {
            if (head == null) throw new NoSuchElementException();
            int x = head.val;
            head = head.next;                          // the old first node is now unreachable
            if (head == null) tail = null;
            size--;
            return x;
        }

        boolean remove(int x) {                        // O(n): find the node BEFORE the one to unlink
            Node dummy = new Node(0, head), prev = dummy;
            while (prev.next != null && prev.next.val != x) prev = prev.next;
            if (prev.next == null) return false;
            if (prev.next == tail) tail = prev == dummy ? null : prev;
            prev.next = prev.next.next;
            head = dummy.next;
            size--;
            return true;
        }

        int get(int i) {                               // O(i): no index arithmetic, you must walk
            Node cur = head;
            for (int k = 0; k < i; k++) cur = cur.next;
            return cur.val;
        }

        List<Integer> toList() {
            List<Integer> out = new ArrayList<>();
            for (Node cur = head; cur != null; cur = cur.next) out.add(cur.val);
            return out;
        }
    }

    static void testLinkedList(Random rnd) {
        for (int t = 0; t < 2_000; t++) {
            SinglyLinkedList l = new SinglyLinkedList();
            LinkedList<Integer> model = new LinkedList<>();
            for (int op = 0; op < 40; op++) {
                int r = rnd.nextInt(4), x = rnd.nextInt(8);
                if (r == 0) { l.addFirst(x); model.addFirst(x); }
                else if (r == 1) { l.addLast(x); model.addLast(x); }
                else if (r == 2 && !model.isEmpty()) Check.that(l.removeFirst() == model.removeFirst(), "removeFirst");
                else Check.that(l.remove(x) == model.remove((Integer) x), "remove value");
                Check.that(l.toList().equals(model) && l.size == model.size(), "list contents");
                if (!model.isEmpty()) {
                    Check.that(l.tail.val == model.getLast() && l.tail.next == null, "tail pointer");
                    int i = rnd.nextInt(model.size());
                    Check.that(l.get(i) == model.get(i), "get(i)");
                } else Check.that(l.head == null && l.tail == null, "empty");
            }
        }
    }

    // ================================================================ stack and queue
    static class ArrayStack {
        private int[] data = new int[4];
        private int size;

        void push(int x) {
            if (size == data.length) data = Arrays.copyOf(data, size * 2);
            data[size++] = x;                          // the top is the END of the array
        }
        int pop() { if (size == 0) throw new NoSuchElementException(); return data[--size]; }
        int peek() { if (size == 0) throw new NoSuchElementException(); return data[size - 1]; }
        boolean isEmpty() { return size == 0; }
    }

    /** Queue on a circular array: head moves forward on poll, indexes wrap with % capacity. */
    static class ArrayQueue {
        private int[] data = new int[4];
        private int head, size;

        void offer(int x) {
            if (size == data.length) grow();
            data[(head + size) % data.length] = x;     // the slot after the last element, wrapping round
            size++;
        }

        int poll() {
            if (size == 0) throw new NoSuchElementException();
            int x = data[head];
            head = (head + 1) % data.length;
            size--;
            return x;
        }

        int peek() { if (size == 0) throw new NoSuchElementException(); return data[head]; }
        boolean isEmpty() { return size == 0; }

        private void grow() {                          // unwrap into a bigger array, oldest first
            int[] bigger = new int[data.length * 2];
            for (int i = 0; i < size; i++) bigger[i] = data[(head + i) % data.length];
            data = bigger;
            head = 0;
        }
    }

    static void testStackQueue(Random rnd) {
        for (int t = 0; t < 2_000; t++) {
            ArrayStack s = new ArrayStack(); ArrayQueue q = new ArrayQueue();
            Deque<Integer> sm = new ArrayDeque<>(), qm = new ArrayDeque<>();
            for (int op = 0; op < 80; op++) {
                int x = rnd.nextInt(100);
                if (rnd.nextInt(3) > 0) { s.push(x); sm.push(x); q.offer(x); qm.offer(x); }
                else {
                    if (!sm.isEmpty()) { Check.that(s.peek() == sm.peek(), "stack peek"); Check.that(s.pop() == sm.pop(), "stack pop (LIFO)"); }
                    if (!qm.isEmpty()) { Check.that(q.peek() == qm.peek(), "queue peek"); Check.that(q.poll() == qm.poll(), "queue poll (FIFO)"); }
                }
                Check.that(s.isEmpty() == sm.isEmpty() && q.isEmpty() == qm.isEmpty(), "isEmpty");
            }
        }
    }

    // ================================================================ hash map (separate chaining)
    static class ChainedHashMap {
        private static class Entry {
            final String key;
            int value;
            Entry next;
            Entry(String k, int v, Entry n) { key = k; value = v; next = n; }
        }
        private Entry[] buckets = new Entry[8];
        private int size;

        private int index(String key, int capacity) {
            return (key.hashCode() & 0x7fffffff) % capacity;   // non-negative hash → bucket number
        }

        void put(String key, int value) {
            int i = index(key, buckets.length);
            Entry last = null;
            for (Entry e = buckets[i]; e != null; last = e, e = e.next)
                if (e.key.equals(key)) { e.value = value; return; }   // existing key: overwrite
            Entry added = new Entry(key, value, null);               // new key: append to the chain
            if (last == null) buckets[i] = added; else last.next = added;
            if (++size > buckets.length * 3 / 4) resize();           // load factor 0.75
        }

        Integer get(String key) {
            for (Entry e = buckets[index(key, buckets.length)]; e != null; e = e.next)
                if (e.key.equals(key)) return e.value;
            return null;
        }

        boolean remove(String key) {
            int i = index(key, buckets.length);
            Entry dummy = new Entry(null, 0, buckets[i]);
            for (Entry prev = dummy; prev.next != null; prev = prev.next)
                if (prev.next.key.equals(key)) {
                    prev.next = prev.next.next;
                    buckets[i] = dummy.next;
                    size--;
                    return true;
                }
            return false;
        }

        private void resize() {                                   // double, and re-bucket every entry
            Entry[] old = buckets;
            buckets = new Entry[old.length * 2];
            for (Entry head : old)
                for (Entry e = head; e != null; e = e.next) {
                    int i = index(e.key, buckets.length);
                    buckets[i] = new Entry(e.key, e.value, buckets[i]);
                }
        }

        int size() { return size; }
        int capacity() { return buckets.length; }
    }

    static void testHashMap(Random rnd) {
        for (int t = 0; t < 1_000; t++) {
            ChainedHashMap m = new ChainedHashMap();
            Map<String, Integer> model = new HashMap<>();
            for (int op = 0; op < 120; op++) {
                String k = "k" + rnd.nextInt(60);
                int r = rnd.nextInt(3), v = rnd.nextInt(1000);
                if (r == 0) { m.put(k, v); model.put(k, v); }
                else if (r == 1) Check.that(Objects.equals(m.get(k), model.get(k)), "get");
                else Check.that(m.remove(k) == (model.remove(k) != null), "remove");
                Check.that(m.size() == model.size() && m.size() <= m.capacity() * 3 / 4, "size and load factor");
            }
        }
        ChainedHashMap m = new ChainedHashMap();                    // "Aa" and "BB" have the same hashCode
        m.put("Aa", 1); m.put("BB", 2);
        Check.that("Aa".hashCode() == "BB".hashCode() && m.get("Aa") == 1 && m.get("BB") == 2, "collisions chain");
    }

    // ================================================================ binary search tree + traversals
    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int v) { val = v; }
    }

    static TreeNode insert(TreeNode root, int x) {
        if (root == null) return new TreeNode(x);
        if (x < root.val) root.left = insert(root.left, x);
        else if (x > root.val) root.right = insert(root.right, x);   // equal: already present
        return root;
    }

    static boolean contains(TreeNode root, int x) {
        while (root != null) {
            if (x == root.val) return true;
            root = x < root.val ? root.left : root.right;   // discard the other half
        }
        return false;
    }

    static TreeNode delete(TreeNode root, int x) {
        if (root == null) return null;
        if (x < root.val) root.left = delete(root.left, x);
        else if (x > root.val) root.right = delete(root.right, x);
        else {
            if (root.left == null) return root.right;        // zero or one child: splice it out
            if (root.right == null) return root.left;
            TreeNode succ = root.right;                      // two children: copy the successor's value
            while (succ.left != null) succ = succ.left;
            root.val = succ.val;
            root.right = delete(root.right, succ.val);
        }
        return root;
    }

    static void preorder(TreeNode n, List<Integer> out) {   // node, left, right
        if (n == null) return;
        out.add(n.val); preorder(n.left, out); preorder(n.right, out);
    }

    static void inorder(TreeNode n, List<Integer> out) {    // left, node, right — sorted for a BST
        if (n == null) return;
        inorder(n.left, out); out.add(n.val); inorder(n.right, out);
    }

    static void postorder(TreeNode n, List<Integer> out) {  // left, right, node
        if (n == null) return;
        postorder(n.left, out); postorder(n.right, out); out.add(n.val);
    }

    static List<Integer> inorderIterative(TreeNode root) {   // the same order with an explicit stack
        List<Integer> out = new ArrayList<>();
        Deque<TreeNode> stack = new ArrayDeque<>();
        TreeNode cur = root;
        while (cur != null || !stack.isEmpty()) {
            while (cur != null) { stack.push(cur); cur = cur.left; }   // go left as far as possible
            cur = stack.pop();
            out.add(cur.val);
            cur = cur.right;
        }
        return out;
    }

    static List<Integer> levelOrder(TreeNode root) {        // breadth-first with a queue
        List<Integer> out = new ArrayList<>();
        if (root == null) return out;
        Deque<TreeNode> q = new ArrayDeque<>(List.of(root));
        while (!q.isEmpty()) {
            TreeNode n = q.poll();
            out.add(n.val);
            if (n.left != null) q.offer(n.left);
            if (n.right != null) q.offer(n.right);
        }
        return out;
    }

    static int height(TreeNode n) { return n == null ? 0 : 1 + Math.max(height(n.left), height(n.right)); }

    static void testBST(Random rnd) {
        for (int t = 0; t < 2_000; t++) {
            TreeNode root = null;
            TreeSet<Integer> model = new TreeSet<>();
            for (int op = 0; op < 40; op++) {
                int x = rnd.nextInt(30);
                if (rnd.nextInt(3) > 0) { root = insert(root, x); model.add(x); }
                else { root = delete(root, x); model.remove(x); }
                for (int y = 0; y < 30; y++) Check.that(contains(root, y) == model.contains(y), "contains");
                List<Integer> in = new ArrayList<>(); inorder(root, in);
                Check.that(in.equals(new ArrayList<>(model)), "inorder is sorted");
                Check.that(inorderIterative(root).equals(in), "iterative inorder");
                List<Integer> pre = new ArrayList<>(), post = new ArrayList<>(); preorder(root, pre); postorder(root, post);
                Check.that(pre.size() == in.size() && post.size() == in.size(), "traversal sizes");
                if (root != null) Check.that(pre.get(0) == root.val && post.get(post.size() - 1) == root.val && levelOrder(root).get(0) == root.val, "root first/last");
                Check.that(new HashSet<>(levelOrder(root)).equals(model), "level order visits all");
            }
        }
        TreeNode line = null;                                       // sorted inserts → a linked-list-shaped tree
        for (int i = 0; i < 100; i++) line = insert(line, i);
        Check.that(height(line) == 100, "degenerate BST has height n");
    }

    // ================================================================ binary min-heap
    static class MinHeap {
        private int[] a = new int[8];
        private int size;

        void offer(int x) {
            if (size == a.length) a = Arrays.copyOf(a, size * 2);
            a[size] = x;
            siftUp(size++);
        }

        int peek() { if (size == 0) throw new NoSuchElementException(); return a[0]; }

        int poll() {
            if (size == 0) throw new NoSuchElementException();
            int min = a[0];
            a[0] = a[--size];                          // move the last leaf to the root…
            siftDown(0);                               // …and let it sink to its place
            return min;
        }

        private void siftUp(int i) {
            while (i > 0 && a[(i - 1) / 2] > a[i]) {   // parent of i is (i − 1) / 2
                swap(i, (i - 1) / 2);
                i = (i - 1) / 2;
            }
        }

        private void siftDown(int i) {
            while (true) {
                int l = 2 * i + 1, r = 2 * i + 2, smallest = i;   // children of i
                if (l < size && a[l] < a[smallest]) smallest = l;
                if (r < size && a[r] < a[smallest]) smallest = r;
                if (smallest == i) return;
                swap(i, smallest);
                i = smallest;
            }
        }

        /** Build from an array in O(n): sift down every non-leaf, from the last one up to the root. */
        static MinHeap heapify(int[] values) {
            MinHeap h = new MinHeap();
            h.a = Arrays.copyOf(values, Math.max(1, values.length));
            h.size = values.length;
            for (int i = values.length / 2 - 1; i >= 0; i--) h.siftDown(i);
            return h;
        }

        int size() { return size; }
        private void swap(int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }
    }

    static void testHeap(Random rnd) {
        for (int t = 0; t < 2_000; t++) {
            MinHeap h = new MinHeap();
            PriorityQueue<Integer> model = new PriorityQueue<>();
            for (int op = 0; op < 60; op++) {
                if (rnd.nextInt(3) > 0) { int x = rnd.nextInt(50); h.offer(x); model.offer(x); }
                else if (!model.isEmpty()) { Check.that(h.peek() == model.peek(), "peek"); Check.that(h.poll() == model.poll(), "poll"); }
                Check.that(h.size() == model.size(), "heap size");
            }
            int[] vals = new int[rnd.nextInt(30)];
            for (int i = 0; i < vals.length; i++) vals[i] = rnd.nextInt(100);
            MinHeap b = MinHeap.heapify(vals);
            int[] sorted = vals.clone(); Arrays.sort(sorted);
            for (int x : sorted) Check.that(b.poll() == x, "heapify then poll = sorted");
        }
    }

    // ================================================================ graphs
    /** Adjacency list for an undirected graph with nodes 0..n−1. */
    static List<List<Integer>> buildGraph(int n, int[][] edges) {
        List<List<Integer>> g = new ArrayList<>();
        for (int i = 0; i < n; i++) g.add(new ArrayList<>());
        for (int[] e : edges) {
            g.get(e[0]).add(e[1]);
            g.get(e[1]).add(e[0]);                     // undirected: store both directions
        }
        return g;
    }

    /** BFS from src: visits nodes in order of distance; dist[v] = fewest edges, −1 if unreachable. */
    static int[] bfs(List<List<Integer>> g, int src) {
        int[] dist = new int[g.size()];
        Arrays.fill(dist, -1);
        dist[src] = 0;
        Deque<Integer> q = new ArrayDeque<>(List.of(src));
        while (!q.isEmpty()) {
            int u = q.poll();
            for (int v : g.get(u))
                if (dist[v] == -1) { dist[v] = dist[u] + 1; q.offer(v); }   // first time seen = shortest
        }
        return dist;
    }

    /** DFS from src: goes as deep as possible before backing up. Returns the visiting order. */
    static List<Integer> dfs(List<List<Integer>> g, int src) {
        List<Integer> order = new ArrayList<>();
        dfsVisit(g, src, new boolean[g.size()], order);
        return order;
    }

    static void dfsVisit(List<List<Integer>> g, int u, boolean[] seen, List<Integer> order) {
        seen[u] = true;
        order.add(u);
        for (int v : g.get(u)) if (!seen[v]) dfsVisit(g, v, seen, order);
    }

    static boolean[][] toMatrix(int n, int[][] edges) {   // O(n²) memory, O(1) "is there an edge?"
        boolean[][] m = new boolean[n][n];
        for (int[] e : edges) { m[e[0]][e[1]] = true; m[e[1]][e[0]] = true; }
        return m;
    }

    static void testGraph(Random rnd) {
        for (int t = 0; t < 2_000; t++) {
            int n = 1 + rnd.nextInt(9), E = rnd.nextInt(14);
            int[][] edges = new int[E][];
            for (int i = 0; i < E; i++) edges[i] = new int[] { rnd.nextInt(n), rnd.nextInt(n) };
            var g = buildGraph(n, edges);
            boolean[][] m = toMatrix(n, edges);
            int[][] d = new int[n][n];                   // Floyd–Warshall as the reference for distances
            for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) d[i][j] = i == j ? 0 : m[i][j] ? 1 : 1_000;
            for (int k = 0; k < n; k++) for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) d[i][j] = Math.min(d[i][j], d[i][k] + d[k][j]);
            int src = rnd.nextInt(n);
            int[] dist = bfs(g, src);
            for (int v = 0; v < n; v++) Check.that(dist[v] == (d[src][v] >= 1_000 ? -1 : d[src][v]), "BFS distance");
            List<Integer> order = dfs(g, src);
            Set<Integer> reach = new HashSet<>();
            for (int v = 0; v < n; v++) if (dist[v] >= 0) reach.add(v);
            Check.that(order.get(0) == src && new HashSet<>(order).equals(reach) && order.size() == reach.size(), "DFS reaches the same nodes once");
            for (int u = 0; u < n; u++) for (int v = 0; v < n; v++) Check.that(m[u][v] == g.get(u).contains(v), "matrix = list");
        }
    }
    // ================================================================ library idioms shown in the lessons
    record Point(int x, int y) { }                     // a record generates equals and hashCode for you

    static void testIdioms() {
        int n = 1_000;
        String s = "";
        for (int i = 0; i < n; i++) s += i;                // O(n²): each += copies the whole string so far

        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) sb.append(i);          // O(n) total: a dynamic array of chars
        String result = sb.toString();
        Check.that(result.equals(s), "StringBuilder = concatenation");

        Map<Point, Integer> seen = new HashMap<>();
        seen.put(new Point(1, 2), 7);
        Check.that(seen.get(new Point(1, 2)) == 7, "record keys");

        List<String> words = List.of("cat", "dog", "cat");
        Map<String, Integer> count = new HashMap<>();
        for (String w : words) count.merge(w, 1, Integer::sum);          // count occurrences

        int c = count.getOrDefault("cat", 0);                            // read with a default
        Check.that(c == 2 && count.getOrDefault("owl", 0) == 0, "counting");

        String key = "act", word = "cat";
        Map<String, List<String>> groups = new HashMap<>();
        groups.computeIfAbsent(key, k -> new ArrayList<>()).add(word);    // group into lists
        Check.that(groups.get("act").equals(List.of("cat")), "grouping");

        Set<Integer> seenSet = new HashSet<>();
        int x = 4, dup = 0;
        seenSet.add(x);
        if (!seenSet.add(x)) { dup++; }
        Check.that(dup == 1, "add returns false for duplicates");

        Deque<Integer> stack = new ArrayDeque<>();
        stack.push(1); stack.push(2);
        Check.that(stack.peek() == 2, "stack peek");
        Check.that(stack.pop() == 2, "stack pop");

        Deque<Integer> queue = new ArrayDeque<>();
        queue.offer(1); queue.offer(2);
        Check.that(queue.peek() == 1, "queue peek");
        Check.that(queue.poll() == 1, "queue poll");

        PriorityQueue<Integer> minHeap = new PriorityQueue<>();
        minHeap.offer(5); minHeap.offer(1); minHeap.offer(3);
        Check.that(minHeap.peek() == 1 && minHeap.poll() == 1 && minHeap.poll() == 3 && minHeap.poll() == 5, "PriorityQueue order");

        PriorityQueue<int[]> byDistance = new PriorityQueue<>((p, q) -> Integer.compare(p[0], q[0]));
        byDistance.offer(new int[] { 5 }); byDistance.offer(new int[] { 2 });
        Check.that(byDistance.poll()[0] == 2, "comparator heap");

        SinglyLinkedList list = new SinglyLinkedList();
        list.addLast(1); list.addLast(2);
        int sum = 0;
        for (Node cur = list.head; cur != null; cur = cur.next) {
            sum += cur.val;
        }
        Check.that(sum == 3, "list loop");
    }
}

final class Check {
    private static int passed;
    static void that(boolean cond, String what) { if (!cond) throw new AssertionError("FAILED: " + what); passed++; }
    static void done(String name) { System.out.println("✓ " + name + ": " + passed + " checks passed"); }
}
