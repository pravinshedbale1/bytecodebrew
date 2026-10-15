// Patterns: Greedy, Tries, Bit Manipulation. Run: java dsa-java/greedy-special/GreedySpecial.java
import java.util.*;

public class GreedySpecial {
    public static void main(String[] args) {
        var rnd = new Random(17);
        for (int t = 0; t < 3_000; t++) {
            int n = 1 + rnd.nextInt(10);
            int[] jumps = new int[n]; for (int i = 0; i < n; i++) jumps[i] = rnd.nextInt(4);
            Check.that(canJump(jumps) == jumpBrute(jumps), "jump game");
            int[] reach = new int[n]; for (int i = 0; i < n; i++) reach[i] = 1 + rnd.nextInt(3);
            Check.that(jump(reach) == minJumpsDP(reach), "jump game II");
            int[] gas = new int[n], cost = new int[n]; for (int i = 0; i < n; i++) { gas[i] = rnd.nextInt(6); cost[i] = rnd.nextInt(6); }
            Check.that(canCompleteCircuit(gas, cost) == gasBrute(gas, cost), "gas station");
            int[] g = new int[n], s = new int[rnd.nextInt(10)]; for (int i = 0; i < n; i++) g[i] = 1 + rnd.nextInt(6); for (int i = 0; i < s.length; i++) s[i] = 1 + rnd.nextInt(6);
            Check.that(findContentChildren(g.clone(), s.clone()) == cookiesBrute(g, s), "assign cookies");
            String str = word(rnd, 12, 4);
            Check.that(partitionLabels(str).equals(labelsBrute(str)), "partition labels");
            int[] ratings = new int[n]; for (int i = 0; i < n; i++) ratings[i] = rnd.nextInt(5);
            Check.that(candy(ratings) == candyBrute(ratings), "candy");
            int[] people = new int[n]; int limit = 6; for (int i = 0; i < n; i++) people[i] = 1 + rnd.nextInt(limit);
            Check.that(numRescueBoats(people.clone(), limit) == boatsBrute(people, limit), "boats to save people");

            // ---- tries ----
            Trie trie = new Trie(); Set<String> words = new HashSet<>();
            for (int i = 0; i < 8; i++) { String w = word(rnd, 5, 3); if (w.isEmpty()) continue; trie.insert(w); words.add(w); }
            String q = word(rnd, 5, 3);
            Check.that(trie.search(q) == words.contains(q), "trie search");
            Check.that(trie.startsWith(q) == words.stream().anyMatch(w -> w.startsWith(q)), "trie startsWith");
            Check.that(trie.countWithPrefix(q) == words.stream().filter(w -> w.startsWith(q)).count(), "trie prefix count");
            WordDictionary wd = new WordDictionary(); for (String w : words) wd.addWord(w);
            String pattern = q.chars().mapToObj(c -> rnd.nextInt(3) == 0 ? "." : String.valueOf((char) c)).reduce("", String::concat);
            Check.that(wd.search(pattern) == words.stream().anyMatch(w -> w.matches(pattern)), "wildcard search");
            char[][] board = new char[1 + rnd.nextInt(3)][1 + rnd.nextInt(3)]; for (char[] row : board) for (int j = 0; j < row.length; j++) row[j] = (char) ('a' + rnd.nextInt(3));
            String[] ws = words.toArray(new String[0]);
            Check.that(new HashSet<>(findWords(copy(board), ws)).equals(wordsBrute(board, ws)), "word search II");

            // ---- bits ----
            int x = rnd.nextInt(Integer.MAX_VALUE) - rnd.nextInt(Integer.MAX_VALUE);
            Check.that(hammingWeight(x) == Integer.bitCount(x), "count set bits");
            Check.that(isPowerOfTwo(x) == (x > 0 && Integer.bitCount(x) == 1), "power of two");
            Check.that(reverseBits(x) == Integer.reverse(x), "reverse bits");
            int a = rnd.nextInt(2001) - 1000, b = rnd.nextInt(2001) - 1000;
            Check.that(getSum(a, b) == a + b, "sum without +");
            int[] pairs = new int[2 * n + 1]; for (int i = 0; i < n; i++) pairs[2 * i] = pairs[2 * i + 1] = rnd.nextInt(100); pairs[2 * n] = 1000 + rnd.nextInt(100); shuffle(pairs, rnd);
            Check.that(singleNumber(pairs) == Arrays.stream(pairs).filter(v -> v >= 1000).findFirst().getAsInt(), "single number (XOR)");
            int[] triples = new int[3 * n + 1]; for (int i = 0; i < n; i++) triples[3 * i] = triples[3 * i + 1] = triples[3 * i + 2] = rnd.nextInt(201) - 100; int lone = 500 - rnd.nextInt(1000); triples[3 * n] = lone; shuffle(triples, rnd);
            boolean loneUnique = Arrays.stream(triples).filter(v -> v == lone).count() == 1;
            if (loneUnique) Check.that(singleNumberII(triples) == lone, "single number II (bit counts)");
            int[] miss = new int[n]; int gone = rnd.nextInt(n + 1); for (int i = 0, v = 0; i < n; v++) if (v != gone) miss[i++] = v; shuffle(miss, rnd);
            Check.that(missingNumber(miss) == gone, "missing number");
            int[] bits = countBits(n * 10); for (int i = 0; i <= n * 10; i++) Check.that(bits[i] == Integer.bitCount(i), "countBits DP");
            int[] distinct = rnd.ints(0, 50).distinct().limit(rnd.nextInt(6)).toArray();
            Check.that(subsetsByMask(distinct).size() == (1 << distinct.length), "subsets by bitmask");
        }
        Check.done("greedy-special");
    }

    // ===================== Greedy =====================
    static boolean canJump(int[] a) {
        int furthest = 0;
        for (int i = 0; i < a.length; i++) {
            if (i > furthest) return false;                   // can't even reach i
            furthest = Math.max(furthest, i + a[i]);
        }
        return true;
    }

    static int jump(int[] a) {                                // fewest jumps; the end is reachable
        int jumps = 0, curEnd = 0, furthest = 0;
        for (int i = 0; i < a.length - 1; i++) {
            furthest = Math.max(furthest, i + a[i]);
            if (i == curEnd) { jumps++; curEnd = furthest; } // finished this "level": must jump again
        }
        return jumps;
    }

    static int canCompleteCircuit(int[] gas, int[] cost) {
        int total = 0, tank = 0, start = 0;
        for (int i = 0; i < gas.length; i++) {
            total += gas[i] - cost[i];
            tank += gas[i] - cost[i];
            if (tank < 0) { start = i + 1; tank = 0; }        // no station in (start..i] can be the start
        }
        return total >= 0 ? start : -1;
    }

    static int findContentChildren(int[] greed, int[] cookies) {
        Arrays.sort(greed); Arrays.sort(cookies);
        int child = 0;
        for (int c = 0; c < cookies.length && child < greed.length; c++)
            if (cookies[c] >= greed[child]) child++;          // smallest cookie that satisfies the least greedy child
        return child;
    }

    static List<Integer> partitionLabels(String s) {
        int[] last = new int[26];
        for (int i = 0; i < s.length(); i++) last[s.charAt(i) - 'a'] = i;
        List<Integer> out = new ArrayList<>();
        int start = 0, end = 0;
        for (int i = 0; i < s.length(); i++) {
            end = Math.max(end, last[s.charAt(i) - 'a']);     // this part must reach every letter's last occurrence
            if (i == end) { out.add(end - start + 1); start = i + 1; }
        }
        return out;
    }

    static int candy(int[] r) {                               // two passes: left rule, then right rule
        int n = r.length;
        int[] c = new int[n];
        Arrays.fill(c, 1);
        for (int i = 1; i < n; i++) if (r[i] > r[i - 1]) c[i] = c[i - 1] + 1;
        for (int i = n - 2; i >= 0; i--) if (r[i] > r[i + 1]) c[i] = Math.max(c[i], c[i + 1] + 1);
        return Arrays.stream(c).sum();
    }

    static int numRescueBoats(int[] people, int limit) {     // at most two per boat
        Arrays.sort(people);
        int boats = 0, light = 0, heavy = people.length - 1;
        while (light <= heavy) {
            if (people[light] + people[heavy] <= limit) light++;   // the lightest rides with the heaviest if possible
            heavy--;
            boats++;
        }
        return boats;
    }

    // ===================== Tries =====================
    static class Trie {
        private static class Node { Node[] next = new Node[26]; boolean end; int pass; }
        private final Node root = new Node();

        void insert(String w) {
            if (search(w)) return;                            // already stored: don't double-count prefixes
            Node cur = root;
            for (char c : w.toCharArray()) {
                int i = c - 'a';
                if (cur.next[i] == null) cur.next[i] = new Node();
                cur = cur.next[i];
                cur.pass++;                                   // words passing through this node
            }
            cur.end = true;
        }
        boolean search(String w) { Node n = walk(w); return n != null && n.end; }
        boolean startsWith(String p) { return walk(p) != null; }
        int countWithPrefix(String p) { if (p.isEmpty()) return countWords(root); Node n = walk(p); return n == null ? 0 : n.pass; }
        private int countWords(Node n) { int c = n.end ? 1 : 0; for (Node x : n.next) if (x != null) c += countWords(x); return c; }
        private Node walk(String s) {
            Node cur = root;
            for (char c : s.toCharArray()) { cur = cur.next[c - 'a']; if (cur == null) return null; }
            return cur;
        }
    }

    static class WordDictionary {                             // '.' matches any letter
        private static class Node { Node[] next = new Node[26]; boolean end; }
        private final Node root = new Node();
        void addWord(String w) { Node cur = root; for (char c : w.toCharArray()) { int i = c - 'a'; if (cur.next[i] == null) cur.next[i] = new Node(); cur = cur.next[i]; } cur.end = true; }
        boolean search(String w) { return match(root, w, 0); }
        private boolean match(Node n, String w, int i) {
            if (n == null) return false;
            if (i == w.length()) return n.end;
            char c = w.charAt(i);
            if (c != '.') return match(n.next[c - 'a'], w, i + 1);
            for (Node child : n.next) if (match(child, w, i + 1)) return true;   // try every branch
            return false;
        }
    }

    /** Word Search II: one DFS over the board, guided by a trie of all the words. */
    static List<String> findWords(char[][] board, String[] words) {
        TNode root = new TNode();
        for (String w : words) { TNode cur = root; for (char c : w.toCharArray()) { int i = c - 'a'; if (cur.next[i] == null) cur.next[i] = new TNode(); cur = cur.next[i]; } cur.word = w; }
        List<String> out = new ArrayList<>();
        for (int r = 0; r < board.length; r++) for (int c = 0; c < board[0].length; c++) dfsBoard(board, r, c, root, out);
        return out;
    }
    static class TNode { TNode[] next = new TNode[26]; String word; }
    static void dfsBoard(char[][] b, int r, int c, TNode parent, List<String> out) {
        if (r < 0 || c < 0 || r >= b.length || c >= b[0].length || b[r][c] == '#') return;
        TNode node = parent.next[b[r][c] - 'a'];
        if (node == null) return;                             // no word continues this way: prune
        if (node.word != null) { out.add(node.word); node.word = null; }   // report once
        char saved = b[r][c];
        b[r][c] = '#';
        dfsBoard(b, r + 1, c, node, out); dfsBoard(b, r - 1, c, node, out);
        dfsBoard(b, r, c + 1, node, out); dfsBoard(b, r, c - 1, node, out);
        b[r][c] = saved;
    }

    // ===================== Bits =====================
    static int hammingWeight(int n) {
        int count = 0;
        while (n != 0) { n &= n - 1; count++; }               // clear the lowest set bit
        return count;
    }
    static boolean isPowerOfTwo(int n) { return n > 0 && (n & (n - 1)) == 0; }
    static int reverseBits(int n) {
        int r = 0;
        for (int i = 0; i < 32; i++) { r = (r << 1) | (n & 1); n >>>= 1; }   // >>> : logical shift
        return r;
    }
    static int getSum(int a, int b) {                         // add without +: XOR = sum without carry, AND<<1 = carry
        while (b != 0) { int carry = (a & b) << 1; a ^= b; b = carry; }
        return a;
    }
    static int singleNumber(int[] a) { int x = 0; for (int v : a) x ^= v; return x; }   // pairs cancel: v ^ v = 0
    static int singleNumberII(int[] a) {                      // everyone else appears three times
        int result = 0;
        for (int bit = 0; bit < 32; bit++) {
            int count = 0;
            for (int v : a) count += (v >> bit) & 1;
            if (count % 3 != 0) result |= 1 << bit;           // leftover bit belongs to the single number
        }
        return result;
    }
    static int missingNumber(int[] a) { int x = a.length; for (int i = 0; i < a.length; i++) x ^= i ^ a[i]; return x; }
    static int[] countBits(int n) { int[] r = new int[n + 1]; for (int i = 1; i <= n; i++) r[i] = r[i >> 1] + (i & 1); return r; }
    static List<List<Integer>> subsetsByMask(int[] nums) {
        List<List<Integer>> out = new ArrayList<>();
        for (int mask = 0; mask < (1 << nums.length); mask++) {
            List<Integer> s = new ArrayList<>();
            for (int i = 0; i < nums.length; i++) if ((mask & (1 << i)) != 0) s.add(nums[i]);   // bit i = take nums[i]
            out.add(s);
        }
        return out;
    }

    // ===================== brute forces =====================
    static boolean jumpBrute(int[] a) { boolean[] ok = new boolean[a.length]; ok[0] = true; for (int i = 0; i < a.length; i++) if (ok[i]) for (int j = 1; j <= a[i] && i + j < a.length; j++) ok[i + j] = true; return ok[a.length - 1]; }
    static int minJumpsDP(int[] a) { int n = a.length; int[] d = new int[n]; Arrays.fill(d, Integer.MAX_VALUE); d[0] = 0; for (int i = 0; i < n; i++) if (d[i] != Integer.MAX_VALUE) for (int j = 1; j <= a[i] && i + j < n; j++) d[i + j] = Math.min(d[i + j], d[i] + 1); return d[n - 1]; }
    static int gasBrute(int[] g, int[] c) { int n = g.length; for (int s = 0; s < n; s++) { int tank = 0; boolean ok = true; for (int k = 0; k < n; k++) { int i = (s + k) % n; tank += g[i] - c[i]; if (tank < 0) { ok = false; break; } } if (ok) return s; } return -1; }
    static int cookiesBrute(int[] g, int[] s) { return matchBrute(g, s, 0, new boolean[s.length]); }
    static int matchBrute(int[] g, int[] s, int i, boolean[] used) { if (i == g.length) return 0; int best = matchBrute(g, s, i + 1, used); for (int j = 0; j < s.length; j++) if (!used[j] && s[j] >= g[i]) { used[j] = true; best = Math.max(best, 1 + matchBrute(g, s, i + 1, used)); used[j] = false; } return best; }
    static List<Integer> labelsBrute(String s) { // try cut points greedily from the left: smallest valid prefix each time
        List<Integer> out = new ArrayList<>(); int start = 0;
        while (start < s.length()) { for (int end = start; end < s.length(); end++) { String part = s.substring(start, end + 1), rest = s.substring(end + 1); boolean ok = true; for (char ch : part.toCharArray()) if (rest.indexOf(ch) >= 0) ok = false; if (ok) { out.add(part.length()); start = end + 1; break; } } }
        return out; }
    static int candyBrute(int[] r) { int n = r.length; int[] c = new int[n]; Arrays.fill(c, 1); boolean changed = true; while (changed) { changed = false; for (int i = 0; i < n; i++) { if (i > 0 && r[i] > r[i - 1] && c[i] <= c[i - 1]) { c[i] = c[i - 1] + 1; changed = true; } if (i + 1 < n && r[i] > r[i + 1] && c[i] <= c[i + 1]) { c[i] = c[i + 1] + 1; changed = true; } } } return Arrays.stream(c).sum(); }
    static int boatsBrute(int[] p, int limit) { int n = p.length; int[] memo = new int[1 << n]; Arrays.fill(memo, -1); return boats(p, limit, (1 << n) - 1, memo); }
    static int boats(int[] p, int limit, int mask, int[] memo) { if (mask == 0) return 0; if (memo[mask] >= 0) return memo[mask]; int i = Integer.numberOfTrailingZeros(mask), rest = mask & ~(1 << i); int best = 1 + boats(p, limit, rest, memo);
        for (int j = i + 1; j < p.length; j++) if ((rest >> j & 1) == 1 && p[i] + p[j] <= limit) best = Math.min(best, 1 + boats(p, limit, rest & ~(1 << j), memo)); return memo[mask] = best; }
    static Set<String> wordsBrute(char[][] b, String[] ws) { Set<String> out = new HashSet<>(); for (String w : ws) for (int r = 0; r < b.length; r++) for (int c = 0; c < b[0].length; c++) if (walk(b, w, 0, r, c, new boolean[b.length][b[0].length])) out.add(w); return out; }
    static boolean walk(char[][] b, String w, int i, int r, int c, boolean[][] used) { if (r < 0 || c < 0 || r >= b.length || c >= b[0].length || used[r][c] || b[r][c] != w.charAt(i)) return false; if (i == w.length() - 1) return true; used[r][c] = true;
        boolean f = walk(b, w, i + 1, r + 1, c, used) || walk(b, w, i + 1, r - 1, c, used) || walk(b, w, i + 1, r, c + 1, used) || walk(b, w, i + 1, r, c - 1, used); used[r][c] = false; return f; }
    static char[][] copy(char[][] b) { char[][] c = new char[b.length][]; for (int i = 0; i < b.length; i++) c[i] = b[i].clone(); return c; }
    static String word(Random r, int max, int alpha) { StringBuilder sb = new StringBuilder(); int n = r.nextInt(max + 1); for (int i = 0; i < n; i++) sb.append((char) ('a' + r.nextInt(alpha))); return sb.toString(); }
    static void shuffle(int[] a, Random r) { for (int i = a.length - 1; i > 0; i--) { int j = r.nextInt(i + 1); int t = a[i]; a[i] = a[j]; a[j] = t; } }
}

final class Check {
    private static int passed;
    static void that(boolean cond, String what) { if (!cond) throw new AssertionError("FAILED: " + what); passed++; }
    static void done(String name) { System.out.println("✓ " + name + ": " + passed + " checks passed"); }
}
