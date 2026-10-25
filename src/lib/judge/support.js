/**
 * Java support code appended to every judged submission (not shown to the learner).
 *
 *  BCB   parses LeetCode-format inputs ("[1,2]", "\"abc\"", "[[\"a\"]]") into Java values,
 *        formats any result back to canonical JSON, and prints tagged result lines:
 *          \u0001BCB|<test>|<json>            a result
 *          \u0001BCB|<test>|!<error>@L<line>  an exception (line in the combined file)
 *  Extra pieces (TreeNode, ListNode, graph Node…) are included only when a problem needs them,
 *  mirroring the classes LeetCode predefines.
 */
export const IMPORTS = 'import java.util.*; import java.util.function.*; import java.util.stream.*;';

export const BCB = String.raw`
@SuppressWarnings({"unchecked", "rawtypes"})
final class BCB {
    private static String src; private static int pos;
    static Object parse(String s) { src = s; pos = 0; return val(); }
    private static void ws() { while (pos < src.length() && Character.isWhitespace(src.charAt(pos))) pos++; }
    private static Object val() {
        ws();
        char c = src.charAt(pos);
        if (c == '[') {
            pos++; List<Object> l = new ArrayList<>(); ws();
            if (src.charAt(pos) == ']') { pos++; return l; }
            while (true) { l.add(val()); ws(); char d = src.charAt(pos++); if (d == ']') return l; }
        }
        if (c == '"') {
            pos++; StringBuilder sb = new StringBuilder();
            while (true) {
                char d = src.charAt(pos++);
                if (d == '"') return sb.toString();
                if (d != '\\') { sb.append(d); continue; }
                char e = src.charAt(pos++);
                if (e == 'n') sb.append('\n'); else if (e == 't') sb.append('\t');
                else if (e == 'u') { sb.append((char) Integer.parseInt(src.substring(pos, pos + 4), 16)); pos += 4; }
                else sb.append(e);
            }
        }
        if (src.startsWith("null", pos)) { pos += 4; return null; }
        if (src.startsWith("true", pos)) { pos += 4; return Boolean.TRUE; }
        if (src.startsWith("false", pos)) { pos += 5; return Boolean.FALSE; }
        int st = pos;
        while (pos < src.length() && "+-0123456789.eE".indexOf(src.charAt(pos)) >= 0) pos++;
        String n = src.substring(st, pos);
        return n.contains(".") || n.contains("e") || n.contains("E") ? (Object) Double.parseDouble(n) : (Object) Long.parseLong(n);
    }

    // ---- conversions: the String overloads parse JSON, the Object overloads convert parsed values
    static int I(String s) { return I(parse(s)); }
    static int I(Object o) { return ((Number) o).intValue(); }
    static long L(String s) { return L(parse(s)); }
    static long L(Object o) { return ((Number) o).longValue(); }
    static double D(String s) { return D(parse(s)); }
    static double D(Object o) { return ((Number) o).doubleValue(); }
    static boolean Z(String s) { return Z(parse(s)); }
    static boolean Z(Object o) { return (Boolean) o; }
    static char C(String s) { return C(parse(s)); }
    static char C(Object o) { return ((String) o).charAt(0); }
    static String S(String s) { return S(parse(s)); }
    static String S(Object o) { return (String) o; }
    static int[] IA(String s) { return IA(parse(s)); }
    static int[] IA(Object o) { List<?> l = (List<?>) o; int[] a = new int[l.size()]; for (int i = 0; i < a.length; i++) a[i] = I(l.get(i)); return a; }
    static long[] LA(String s) { return LA(parse(s)); }
    static long[] LA(Object o) { List<?> l = (List<?>) o; long[] a = new long[l.size()]; for (int i = 0; i < a.length; i++) a[i] = L(l.get(i)); return a; }
    static double[] DA(String s) { return DA(parse(s)); }
    static double[] DA(Object o) { List<?> l = (List<?>) o; double[] a = new double[l.size()]; for (int i = 0; i < a.length; i++) a[i] = D(l.get(i)); return a; }
    static char[] CA(String s) { return CA(parse(s)); }
    static char[] CA(Object o) { List<?> l = (List<?>) o; char[] a = new char[l.size()]; for (int i = 0; i < a.length; i++) a[i] = C(l.get(i)); return a; }
    static String[] SA(String s) { return SA(parse(s)); }
    static String[] SA(Object o) { List<?> l = (List<?>) o; String[] a = new String[l.size()]; for (int i = 0; i < a.length; i++) a[i] = (String) l.get(i); return a; }
    static int[][] IAA(String s) { return IAA(parse(s)); }
    static int[][] IAA(Object o) { List<?> l = (List<?>) o; int[][] a = new int[l.size()][]; for (int i = 0; i < a.length; i++) a[i] = IA(l.get(i)); return a; }
    static char[][] CAA(String s) { return CAA(parse(s)); }
    static char[][] CAA(Object o) { List<?> l = (List<?>) o; char[][] a = new char[l.size()][]; for (int i = 0; i < a.length; i++) a[i] = CA(l.get(i)); return a; }
    static String[][] SAA(String s) { return SAA(parse(s)); }
    static String[][] SAA(Object o) { List<?> l = (List<?>) o; String[][] a = new String[l.size()][]; for (int i = 0; i < a.length; i++) a[i] = SA(l.get(i)); return a; }
    static List<Integer> LI(String s) { return LI(parse(s)); }
    static List<Integer> LI(Object o) { List<Integer> r = new ArrayList<>(); for (Object x : (List<?>) o) r.add(I(x)); return r; }
    static List<String> LS(String s) { return LS(parse(s)); }
    static List<String> LS(Object o) { List<String> r = new ArrayList<>(); for (Object x : (List<?>) o) r.add((String) x); return r; }
    static List<List<Integer>> LLI(String s) { return LLI(parse(s)); }
    static List<List<Integer>> LLI(Object o) { List<List<Integer>> r = new ArrayList<>(); for (Object x : (List<?>) o) r.add(LI(x)); return r; }
    static List<List<String>> LLS(String s) { return LLS(parse(s)); }
    static List<List<String>> LLS(Object o) { List<List<String>> r = new ArrayList<>(); for (Object x : (List<?>) o) r.add(LS(x)); return r; }
    static List<Object> LO(String s) { return (List<Object>) parse(s); }
    static Iterator<Integer> IT(Object o) { return LI(o).iterator(); }

    // ---- formatting any result as canonical JSON
    static String F(Object o) { StringBuilder sb = new StringBuilder(); f(o, sb, 0); return sb.toString(); }
    private static void str(String s, StringBuilder sb) {
        sb.append('"');
        for (char c : s.toCharArray()) {
            if (c == '"' || c == '\\') sb.append('\\').append(c);
            else if (c == '\n') sb.append("\\n");
            else if (c < 32) sb.append(String.format("\\u%04x", (int) c));
            else sb.append(c);
        }
        sb.append('"');
    }
    private static void f(Object o, StringBuilder sb, int depth) {
        if (depth > 64) { sb.append("\"…\""); return; }
        if (o == null) { sb.append("null"); return; }
        if (o instanceof String) { str((String) o, sb); return; }
        if (o instanceof Character) { str(String.valueOf(o), sb); return; }
        if (o instanceof Double || o instanceof Float) {
            double d = ((Number) o).doubleValue();
            if (Double.isNaN(d) || Double.isInfinite(d)) str(String.valueOf(d), sb); else sb.append(d);
            return;
        }
        if (o instanceof Number || o instanceof Boolean) { sb.append(o); return; }
        if (o.getClass().isArray()) {
            int n = java.lang.reflect.Array.getLength(o);
            sb.append('[');
            for (int i = 0; i < n; i++) { if (i > 0) sb.append(','); f(java.lang.reflect.Array.get(o, i), sb, depth + 1); }
            sb.append(']');
            return;
        }
        if (o instanceof Iterable) {
            sb.append('['); boolean first = true;
            for (Object x : (Iterable<?>) o) { if (!first) sb.append(','); first = false; f(x, sb, depth + 1); }
            sb.append(']');
            return;
        }
        String cn = o.getClass().getSimpleName();
        try {
            if (cn.equals("TreeNode")) { tree(o, sb); return; }
            if (cn.equals("ListNode")) { list(o, sb); return; }
        } catch (ReflectiveOperationException e) { /* fall through */ }
        str(String.valueOf(o), sb);
    }
    private static Object field(Object o, String name) throws ReflectiveOperationException {
        java.lang.reflect.Field fd = o.getClass().getDeclaredField(name); fd.setAccessible(true); return fd.get(o);
    }
    private static void tree(Object root, StringBuilder sb) throws ReflectiveOperationException {
        List<Object> out = new ArrayList<>(); Deque<Object> q = new ArrayDeque<>(); List<Object> level = new ArrayList<>();
        level.add(root);
        int guard = 0;
        while (!level.isEmpty() && guard++ < 2000000) {
            List<Object> next = new ArrayList<>();
            for (Object n : level) {
                if (n == null) { out.add(null); continue; }
                out.add(field(n, "val")); next.add(field(n, "left")); next.add(field(n, "right"));
            }
            boolean any = false; for (Object n : next) if (n != null) any = true;
            level = any ? next : new ArrayList<>();
        }
        while (!out.isEmpty() && out.get(out.size() - 1) == null) out.remove(out.size() - 1);
        f(out, sb, 1);
    }
    private static void list(Object head, StringBuilder sb) throws ReflectiveOperationException {
        List<Object> out = new ArrayList<>(); Object n = head;
        while (n != null && out.size() < 2000000) { out.add(field(n, "val")); n = field(n, "next"); }
        if (n != null) out.add("…cycle");
        f(out, sb, 1);
    }

    static void out(int i, Object r) { System.out.println("\u0001BCB|" + i + "|" + F(r)); }

    // ---- performance tests: big inputs generated from a fixed seed; the answer is compared by hash
    static final Random R = new Random(20261016L);
    static int rnd(int lo, int hi) { return lo + R.nextInt(hi - lo + 1); }
    static int[] ints(int n, int lo, int hi) { int[] a = new int[n]; for (int i = 0; i < n; i++) a[i] = rnd(lo, hi); return a; }
    static int[] sorted(int n, int lo, int hi) { int[] a = ints(n, lo, hi); Arrays.sort(a); return a; }
    static int[] distinct(int n, int lo, int hi) {
        Set<Integer> seen = new HashSet<>(); int[] a = new int[n]; int k = 0;
        while (k < n) { int v = rnd(lo, hi); if (seen.add(v)) a[k++] = v; }
        return a;
    }
    static int[] perm(int n, int from) { int[] a = new int[n]; for (int i = 0; i < n; i++) a[i] = from + i; for (int i = n - 1; i > 0; i--) { int j = R.nextInt(i + 1); int t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
    static String str(int n, String alphabet) { StringBuilder sb = new StringBuilder(n); for (int i = 0; i < n; i++) sb.append(alphabet.charAt(R.nextInt(alphabet.length()))); return sb.toString(); }
    static int[][] grid(int r, int c, int lo, int hi) { int[][] g = new int[r][]; for (int i = 0; i < r; i++) g[i] = ints(c, lo, hi); return g; }
    static char[][] charGrid(int r, int c, String alphabet) { char[][] g = new char[r][c]; for (int i = 0; i < r; i++) for (int j = 0; j < c; j++) g[i][j] = alphabet.charAt(R.nextInt(alphabet.length())); return g; }
    /** n intervals [start, end] with start in [lo, hi] and 1 ≤ end − start ≤ maxLen. */
    static int[][] intervals(int n, int lo, int hi, int maxLen) { int[][] a = new int[n][]; for (int i = 0; i < n; i++) { int s = rnd(lo, hi); a[i] = new int[] { s, s + rnd(1, maxLen) }; } return a; }
    static int[] shuffle(int[] a) { for (int i = a.length - 1; i > 0; i--) { int j = R.nextInt(i + 1); int t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
    static int[] repeatEach(int[] vals, int times, int[] singles) { int[] a = new int[vals.length * times + singles.length]; int k = 0; for (int v : vals) for (int t = 0; t < times; t++) a[k++] = v; for (int v : singles) a[k++] = v; return shuffle(a); }
    /** Edges of a random tree on nodes [base, base + n). */
    static int[][] treeEdges(int n, int base) { int[][] e = new int[n - 1][]; for (int i = 1; i < n; i++) e[i - 1] = new int[] { base + R.nextInt(i), base + i }; return e; }
    static List<Integer> list(int[] a) { List<Integer> l = new ArrayList<>(a.length); for (int x : a) l.add(x); return l; }
    static String[] words(int n, int minLen, int maxLen, String alphabet) { String[] w = new String[n]; for (int i = 0; i < n; i++) w[i] = str(rnd(minLen, maxLen), alphabet); return w; }

    /**
     * A fixed workload timed on whatever machine runs the code, so performance limits measured on the
     * build machine can be scaled to the judge's speed (milliseconds; the first pass warms up the JIT).
     */
    static long calibrate() {
        long ms = 0;
        for (int pass = 0; pass < 2; pass++) {
            long t0 = System.nanoTime();
            Random rr = new Random(7);
            int[] a = new int[1000000];
            for (int i = 0; i < a.length; i++) a[i] = rr.nextInt();
            Arrays.sort(a);
            HashMap<Integer, Integer> m = new HashMap<>();
            for (int i = 0; i < 300000; i++) m.merge(a[i] & 4095, 1, Integer::sum);
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < 200000; i++) sb.append(a[i] & 7);
            if (m.size() + sb.length() == 42) System.out.print("");
            ms = (System.nanoTime() - t0) / 1000000;
        }
        return Math.max(1, ms);
    }

    /** Canonical text of a result whose order doesn't matter (1 = top level, 2 = every level). */
    static String canon(Object o, int mode) {
        if (mode == 0 || o == null) return F(o);
        List<String> parts = new ArrayList<>();
        if (o instanceof Iterable) for (Object e : (Iterable<?>) o) parts.add(mode == 2 ? canon(e, 1) : F(e));
        else if (o.getClass().isArray()) for (int k = 0; k < java.lang.reflect.Array.getLength(o); k++) { Object e = java.lang.reflect.Array.get(o, k); parts.add(mode == 2 ? canon(e, 1) : F(e)); }
        else return F(o);
        Collections.sort(parts);
        return "[" + String.join(",", parts) + "]";
    }
    static void outHash(int i, Object r, long nanos) { outHash(i, r, nanos, 0); }
    static void outHash(int i, Object r, long nanos, int mode) {
        String s = canon(r, mode);
        long h = 0xcbf29ce484222325L;
        for (int k = 0; k < s.length(); k++) { h ^= s.charAt(k); h *= 0x100000001b3L; }
        System.out.println("\u0001BCB|" + i + "|\"#" + s.length() + ":" + Long.toHexString(h) + "\"");
        System.out.println("\u0001BCBT|" + i + "|" + (nanos / 1000000));
    }
    static void err(int i, Throwable t) {
        int line = -1;
        for (StackTraceElement e : t.getStackTrace()) {
            String c = e.getClassName();
            if (!c.equals("Main") && !c.startsWith("BCB") && !c.startsWith("java.") && !c.startsWith("jdk.") && !c.startsWith("sun.")) { line = e.getLineNumber(); break; }
        }
        String msg = t.getMessage() == null ? "" : ": " + t.getMessage().replace('\n', ' ');
        if (t instanceof StackOverflowError) msg = " (recursion too deep)";
        System.out.println("\u0001BCB|" + i + "|!" + t.getClass().getSimpleName() + msg + "@L" + line);
    }
}
`;

/** Extra classes, keyed by the names problems list in `uses`. */
export const EXTRAS = {
  TreeNode: {
    decl: String.raw`
class TreeNode {
    int val; TreeNode left; TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) { this.val = val; this.left = left; this.right = right; }
}
final class BCBT {
    static TreeNode T(String s) { return T(BCB.parse(s)); }
    static TreeNode T(Object o) {
        List<?> v = (List<?>) o;
        if (v.isEmpty() || v.get(0) == null) return null;
        TreeNode root = new TreeNode(BCB.I(v.get(0))); Deque<TreeNode> q = new ArrayDeque<>(); q.add(root);
        int i = 1;
        while (!q.isEmpty() && i < v.size()) {
            TreeNode n = q.poll();
            if (i < v.size() && v.get(i) != null) { n.left = new TreeNode(BCB.I(v.get(i))); q.add(n.left); } i++;
            if (i < v.size() && v.get(i) != null) { n.right = new TreeNode(BCB.I(v.get(i))); q.add(n.right); } i++;
        }
        return root;
    }
    static TreeNode find(TreeNode n, int val) {
        if (n == null) return null;
        if (n.val == val) return n;
        TreeNode l = find(n.left, val); return l != null ? l : find(n.right, val);
    }
    static Object val(TreeNode n) { return n == null ? null : n.val; }
    /** A balanced BST holding sorted values (perf inputs). */
    static TreeNode bst(int[] sorted, int lo, int hi) { if (lo > hi) return null; int m = (lo + hi) >>> 1; return new TreeNode(sorted[m], bst(sorted, lo, m - 1), bst(sorted, m + 1, hi)); }
    static TreeNode bst(int[] sorted) { return bst(sorted, 0, sorted.length - 1); }
    /** A random tree of n nodes with values from vals, depth about log n (perf inputs). */
    static TreeNode random(int[] vals) { return bst(vals, 0, vals.length - 1); }
}
`,
    comment: `/**
 * Definition for a binary tree node (provided).
 * class TreeNode {
 *     int val; TreeNode left; TreeNode right;
 *     TreeNode() {}
 *     TreeNode(int val) { this.val = val; }
 *     TreeNode(int val, TreeNode left, TreeNode right) { ... }
 * }
 */`,
  },
  ListNode: {
    decl: String.raw`
class ListNode {
    int val; ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}
final class BCBN {
    static ListNode N(String s) { return N(BCB.parse(s)); }
    static ListNode N(Object o) {
        ListNode d = new ListNode(), t = d;
        for (Object x : (List<?>) o) { t.next = new ListNode(BCB.I(x)); t = t.next; }
        return d.next;
    }
    static ListNode cycle(String s, int pos) {
        ListNode h = N(s); if (pos < 0 || h == null) return h;
        ListNode t = h, at = null; int i = 0;
        while (true) { if (i == pos) at = t; if (t.next == null) break; t = t.next; i++; }
        t.next = at; return h;
    }
    static int indexOf(ListNode h, ListNode n) { int i = 0; for (ListNode t = h; t != null && i < 100000; t = t.next, i++) if (t == n) return i; return -1; }
    static ListNode of(int[] a) { ListNode d = new ListNode(), t = d; for (int x : a) { t.next = new ListNode(x); t = t.next; } return d.next; }
    static ListNode[] lists(String s) { List<?> l = (List<?>) BCB.parse(s); ListNode[] a = new ListNode[l.size()]; for (int i = 0; i < a.length; i++) a[i] = N(l.get(i)); return a; }
}
`,
    comment: `/**
 * Definition for singly-linked list (provided).
 * class ListNode {
 *     int val; ListNode next;
 *     ListNode() {}
 *     ListNode(int val) { this.val = val; }
 *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
 * }
 */`,
  },
  GraphNode: {
    decl: String.raw`
class Node {
    public int val; public List<Node> neighbors;
    public Node() { val = 0; neighbors = new ArrayList<>(); }
    public Node(int val) { this.val = val; neighbors = new ArrayList<>(); }
    public Node(int val, ArrayList<Node> neighbors) { this.val = val; this.neighbors = neighbors; }
}
final class BCBG {
    static Node build(String s) {
        List<?> adj = (List<?>) BCB.parse(s);
        if (adj.isEmpty()) return null;
        Node[] n = new Node[adj.size() + 1];
        for (int i = 1; i <= adj.size(); i++) n[i] = new Node(i);
        for (int i = 1; i <= adj.size(); i++) for (Object x : (List<?>) adj.get(i - 1)) n[i].neighbors.add(n[BCB.I(x)]);
        return n[1];
    }
    /** Adjacency list of the copy, or an error string if it shares nodes with the original. */
    static Object dump(Node copy, Node original) {
        if (copy == null) return new ArrayList<>();
        Set<Node> orig = new HashSet<>(); Deque<Node> q = new ArrayDeque<>();
        if (original != null) { q.add(original); orig.add(original); }
        while (!q.isEmpty()) for (Node x : q.poll().neighbors) if (orig.add(x)) q.add(x);
        Map<Integer, Node> seen = new TreeMap<>(); q.add(copy); seen.put(copy.val, copy);
        while (!q.isEmpty()) { Node c = q.poll(); if (orig.contains(c)) return "copy shares nodes with the original"; for (Node x : c.neighbors) if (!seen.containsKey(x.val)) { seen.put(x.val, x); q.add(x); } }
        List<List<Integer>> out = new ArrayList<>();
        for (Node c : seen.values()) { List<Integer> row = new ArrayList<>(); for (Node x : c.neighbors) row.add(x.val); out.add(row); }
        return out;
    }
}
`,
    comment: `/**
 * Definition for a graph node (provided).
 * class Node {
 *     public int val; public List<Node> neighbors;
 *     public Node() / Node(int val) / Node(int val, ArrayList<Node> neighbors)
 * }
 */`,
  },
  NextNode: {
    decl: String.raw`
class Node {
    public int val; public Node left; public Node right; public Node next;
    public Node() {}
    public Node(int _val) { val = _val; }
    public Node(int _val, Node _left, Node _right, Node _next) { val = _val; left = _left; right = _right; next = _next; }
}
final class BCBX {
    static Node build(String s) {
        List<?> v = (List<?>) BCB.parse(s);
        if (v.isEmpty() || v.get(0) == null) return null;
        Node root = new Node(BCB.I(v.get(0))); Deque<Node> q = new ArrayDeque<>(); q.add(root); int i = 1;
        while (!q.isEmpty() && i < v.size()) {
            Node n = q.poll();
            if (i < v.size() && v.get(i) != null) { n.left = new Node(BCB.I(v.get(i))); q.add(n.left); } i++;
            if (i < v.size() && v.get(i) != null) { n.right = new Node(BCB.I(v.get(i))); q.add(n.right); } i++;
        }
        return root;
    }
    /** LeetCode's output: each level left to right via next pointers, then "#". */
    static List<String> dump(Node root) {
        List<String> out = new ArrayList<>(); Node start = root;
        while (start != null) {
            for (Node n = start; n != null; n = n.next) out.add(String.valueOf(n.val));
            out.add("#");
            Node nxt = null; for (Node n = start; n != null && nxt == null; n = n.next) nxt = n.left != null ? n.left : n.right;
            start = nxt;
        }
        return out;
    }
}
`,
    comment: `/**
 * Definition for a Node (provided).
 * class Node {
 *     public int val; public Node left; public Node right; public Node next;
 * }
 */`,
  },
  NestedInteger: {
    decl: String.raw`
interface NestedInteger {
    boolean isInteger();
    Integer getInteger();
    List<NestedInteger> getList();
}
final class BCBNI implements NestedInteger {
    private Integer v; private List<NestedInteger> l;
    public boolean isInteger() { return v != null; }
    public Integer getInteger() { return v; }
    public List<NestedInteger> getList() { return l; }
    static List<NestedInteger> build(String s) { return build((List<?>) BCB.parse(s)); }
    static List<NestedInteger> build(List<?> src) {
        List<NestedInteger> out = new ArrayList<>();
        for (Object x : src) { BCBNI n = new BCBNI(); if (x instanceof List) n.l = build((List<?>) x); else n.v = BCB.I(x); out.add(n); }
        return out;
    }
}
`,
    comment: `/**
 * This interface is provided:
 * interface NestedInteger {
 *     boolean isInteger();          // true if this holds a single integer
 *     Integer getInteger();         // the integer, or null if it holds a list
 *     List<NestedInteger> getList(); // the list, or null if it holds an integer
 * }
 */`,
  },
  VersionControl: {
    decl: String.raw`
class VersionControl {
    static int BAD = 1; static int CALLS = 0;
    boolean isBadVersion(int version) { CALLS++; return version >= BAD; }
}
`,
    comment: `/* The isBadVersion API is defined in the parent class VersionControl:
   boolean isBadVersion(int version); */`,
  },
  SolBase: {
    decl: String.raw`
class SolBase {
    static Random RNG = new Random(7);
    public int rand7() { return RNG.nextInt(7) + 1; }
}
`,
    comment: `/**
 * The rand7() API is already defined in the parent class SolBase.
 * public int rand7();
 * @return a random integer in the range 1 to 7
 */`,
  },
  GuessGame: {
    decl: String.raw`
class GuessGame {
    static int PICK = 1;
    int guess(int num) { return num > PICK ? -1 : num < PICK ? 1 : 0; }
}
`,
    comment: `/**
 * Forward declaration of guess API (defined in the parent class GuessGame).
 * @param  num   your guess
 * @return       -1 if num is higher than the picked number
 *               1 if num is lower than the picked number
 *               otherwise return 0
 * int guess(int num);
 */`,
  },
  MountainArray: {
    decl: String.raw`
interface MountainArray {
    public int get(int index);
    public int length();
}
final class BCBM implements MountainArray {
    private final int[] a; private int calls = 0;
    BCBM(int[] a) { this.a = a; }
    public int get(int index) {
        if (++calls > 100) throw new IllegalStateException("more than 100 calls to MountainArray.get");
        return a[index];
    }
    public int length() { return a.length; }
}
`,
    comment: `/**
 * // This is MountainArray's API interface (provided).
 * // You should not implement it, or speculate about its implementation
 * interface MountainArray {
 *     public int get(int index);   // at most 100 calls in total
 *     public int length();
 * }
 */`,
  },
  RandomNode: {
    decl: String.raw`
class Node {
    int val; Node next; Node random;
    public Node(int val) { this.val = val; this.next = null; this.random = null; }
}
final class BCBR {
    /** [[val, randomIndex or null], …] into a list. */
    static Node build(String s) {
        List<?> v = (List<?>) BCB.parse(s);
        Node[] n = new Node[v.size()];
        for (int i = 0; i < n.length; i++) n[i] = new Node(BCB.I(((List<?>) v.get(i)).get(0)));
        for (int i = 0; i < n.length; i++) {
            if (i + 1 < n.length) n[i].next = n[i + 1];
            Object r = ((List<?>) v.get(i)).get(1);
            if (r != null) n[i].random = n[BCB.I(r)];
        }
        return n.length == 0 ? null : n[0];
    }
    /** The copy in the same format, or an error string if it shares nodes with the original. */
    static Object dump(Node copy, Node original) {
        Set<Node> orig = Collections.newSetFromMap(new IdentityHashMap<>());
        for (Node t = original; t != null; t = t.next) orig.add(t);
        Map<Node, Integer> at = new IdentityHashMap<>(); List<Node> order = new ArrayList<>();
        for (Node t = copy; t != null && order.size() < 100000; t = t.next) {
            if (orig.contains(t)) return "copy shares nodes with the original";
            at.put(t, order.size()); order.add(t);
        }
        List<Object> out = new ArrayList<>();
        for (Node t : order) {
            if (t.random != null && orig.contains(t.random)) return "copy points into the original list";
            out.add(Arrays.asList(t.val, t.random == null ? null : at.get(t.random)));
        }
        return out;
    }
}
`,
    comment: `/*
// Definition for a Node (provided).
class Node {
    int val;
    Node next;
    Node random;

    public Node(int val) {
        this.val = val;
        this.next = null;
        this.random = null;
    }
}
*/`,
  },
  QuadNode: {
    decl: String.raw`
class Node {
    public boolean val; public boolean isLeaf;
    public Node topLeft; public Node topRight; public Node bottomLeft; public Node bottomRight;
    public Node() {}
    public Node(boolean val, boolean isLeaf) { this.val = val; this.isLeaf = isLeaf; }
    public Node(boolean val, boolean isLeaf, Node topLeft, Node topRight, Node bottomLeft, Node bottomRight) {
        this.val = val; this.isLeaf = isLeaf;
        this.topLeft = topLeft; this.topRight = topRight; this.bottomLeft = bottomLeft; this.bottomRight = bottomRight;
    }
}
final class BCBQ {
    /** LeetCode's level-order output: [isLeaf, val] per node (val shown as 1 on inner nodes, where it doesn't matter). */
    static Object dump(Node root) {
        List<Object> out = new ArrayList<>();
        List<Node> level = new ArrayList<>(); level.add(root);
        int guard = 0;
        for (int i = 0; i < level.size() && guard++ < 2000000; i++) {
            Node n = level.get(i);
            if (n == null) { out.add(null); continue; }
            out.add(Arrays.asList(n.isLeaf ? 1 : 0, n.isLeaf ? (n.val ? 1 : 0) : 1));
            if (n.isLeaf) for (int k = 0; k < 4; k++) level.add(null);
            else { level.add(n.topLeft); level.add(n.topRight); level.add(n.bottomLeft); level.add(n.bottomRight); }
        }
        while (!out.isEmpty() && out.get(out.size() - 1) == null) out.remove(out.size() - 1);
        return out;
    }
}
`,
    comment: `/*
// Definition for a QuadTree node (provided).
class Node {
    public boolean val;
    public boolean isLeaf;
    public Node topLeft;
    public Node topRight;
    public Node bottomLeft;
    public Node bottomRight;

    public Node() / Node(boolean val, boolean isLeaf)
    public Node(boolean val, boolean isLeaf, Node topLeft, Node topRight, Node bottomLeft, Node bottomRight)
}
*/`,
  },
};
