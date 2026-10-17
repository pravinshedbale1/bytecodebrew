/**
 * Performance tests: one large, generated input per problem where an inefficient solution would
 * pass the small tests but time out in an interview (O(n²) instead of O(n), exponential recursion
 * instead of DP). Inputs stay within LeetCode's own constraints and always have a unique answer, so
 * comparing the answer's hash is fair.
 *
 *   label  shown to the learner ("n = 100,000")
 *   gen    Java declaring a0, a1… (the method's arguments) from BCB's seeded generators
 *   call   optional Java setting `Object r` (design problems, custom signatures, or comparing a length)
 *   floorMs  optional minimum time limit (default 400 ms; the limit is max(floor, 10 × reference) scaled to the judge)
 *
 * Problems without an entry have tiny inputs by definition (backtracking outputs, Sudoku, bitmask DP…)
 * or answers that aren't unique; their small tests already catch brute force.
 */
const P = (label, gen, call, floorMs) => ({ label, gen, ...(call ? { call } : {}), ...(floorMs ? { floorMs } : {}) });
// DP and tree-recursion problems: the brute force is exponential and times out regardless, so allow
// slower-but-correct styles (memoising with a HashMap, recursion) plenty of room.
const DP = (label, gen, call) => P(label, gen, call, 2000);
const AZ = 'abcdefghijklmnopqrstuvwxyz';
const skewed = (n, val) => `TreeNode a0 = null; for (int i = 0; i < ${n}; i++) a0 = new TreeNode(${val}, a0, null);`;

export default {
  // ---- two pointers
  'valid-palindrome': P('a 200,000-character string', 'String a0 = BCB.str(200000, "ab ,.AB09");'),
  'remove-duplicates-from-sorted-array': P('n = 30,000', 'int[] a0 = BCB.sorted(30000, -100, 100);',
    'int k = s.removeDuplicates(a0); Object r = new Object[] { k, Arrays.copyOf(a0, Math.max(0, Math.min(k, a0.length))) };'),
  'two-sum-ii-input-array-is-sorted': P('n = 30,000', 'int[] a0 = new int[30000]; for (int i = 0; i < a0.length; i++) a0[i] = 4 * i - 60000; a0[5000] += 1; a0[25000] += 1; int a1 = a0[5000] + a0[25000];'),
  'container-with-most-water': P('n = 100,000', 'int[] a0 = BCB.ints(100000, 0, 10000);'),
  '3sum': P('n = 3,000', 'int[] a0 = BCB.ints(3000, -100000, 100000);'),
  'trapping-rain-water': P('n = 20,000', 'int[] a0 = BCB.ints(20000, 0, 100000);'),

  // ---- hashing
  'contains-duplicate': P('n = 100,000, all distinct', 'int[] a0 = BCB.distinct(100000, -1000000000, 1000000000);'),
  'valid-anagram': P('strings of 50,000 letters', `String a0 = BCB.str(50000, "${AZ}"); char[] c = a0.toCharArray(); for (int i = c.length - 1; i > 0; i--) { int j = BCB.R.nextInt(i + 1); char t = c[i]; c[i] = c[j]; c[j] = t; } String a1 = new String(c);`),
  'first-unique-character-in-a-string': P('a 100,000-character string', 'String a0 = BCB.str(100000, "abcdefghijklmnopqrstuvwxy") + "z";'),
  'group-anagrams': P('10,000 words', 'String[] a0 = BCB.words(10000, 1, 30, "abc");'),
  'longest-consecutive-sequence': P('n = 100,000', 'int[] a0 = BCB.perm(100000, -50000);'),
  'first-missing-positive': P('n = 100,000', 'int[] a0 = BCB.perm(100000, 1);'),

  // ---- sliding window
  'maximum-average-subarray-i': P('n = 100,000, k = 50,000', 'int[] a0 = BCB.ints(100000, -10000, 10000); int a1 = 50000;'),
  'longest-substring-without-repeating-characters': P('a 50,000-character string', 'String a0 = BCB.str(50000, " !abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789");'),
  'minimum-size-subarray-sum': P('n = 100,000', 'int a0 = 50000000; int[] a1 = BCB.ints(100000, 1, 10000);'),
  'max-consecutive-ones-iii': P('n = 100,000, k = 1,000', 'int[] a0 = BCB.ints(100000, 0, 1); int a1 = 1000;'),
  'longest-repeating-character-replacement': P('a 100,000-character string', 'String a0 = BCB.str(100000, "ABCD"); int a1 = 1000;'),
  'permutation-in-string': P('s2 of 10,000 characters', 'String a0 = BCB.str(1000, "abcde"); String a1 = BCB.str(10000, "abcde");'),
  'find-all-anagrams-in-a-string': P('s of 30,000 characters', 'String a0 = BCB.str(30000, "abc"); String a1 = BCB.str(1000, "abc");'),
  'minimum-window-substring': P('s of 100,003 characters', 'String base = BCB.str(100000, "abcdefghij"); String a0 = base.substring(0, 50000) + "xyz" + base.substring(50000); String a1 = "zyx";'),
  'subarrays-with-k-different-integers': P('n = 20,000, k = 10', 'int[] a0 = BCB.ints(20000, 1, 50); int a1 = 10;'),

  // ---- prefix sums
  'subarray-sum-equals-k': P('n = 20,000', 'int[] a0 = BCB.ints(20000, -1000, 1000); int a1 = 0;'),
  'subarray-sums-divisible-by-k': P('n = 30,000', 'int[] a0 = BCB.ints(30000, -10000, 10000); int a1 = 7;'),
  'contiguous-array': P('n = 100,000', 'int[] a0 = BCB.ints(100000, 0, 1);'),
  'product-of-array-except-self': P('n = 100,000', 'int[] a0 = new int[100000]; for (int i = 0; i < a0.length; i++) a0[i] = BCB.R.nextBoolean() ? 1 : -1;'),
  'corporate-flight-bookings': P('20,000 bookings over 20,000 flights', 'int[][] a0 = new int[20000][]; for (int i = 0; i < a0.length; i++) { int f = BCB.rnd(1, 20000), l = BCB.rnd(f, 20000); a0[i] = new int[] { f, l, BCB.rnd(1, 10000) }; } int a1 = 20000;'),
  'number-of-submatrices-that-sum-to-target': P('a 100×100 matrix', 'int[][] a0 = BCB.grid(100, 100, -1, 1); int a1 = 0;'),

  // ---- intervals
  'merge-intervals': P('10,000 intervals', 'int[][] a0 = BCB.intervals(10000, 0, 1000000, 100);'),
  'non-overlapping-intervals': P('100,000 intervals', 'int[][] a0 = BCB.intervals(100000, -50000, 50000, 1000);'),
  'minimum-number-of-arrows-to-burst-balloons': P('100,000 balloons', 'int[][] a0 = BCB.intervals(100000, -1000000000, 1000000000, 1000000);'),
  'minimum-interval-to-include-each-query': P('100,000 intervals and queries', 'int[][] a0 = BCB.intervals(100000, 1, 10000000, 10000); int[] a1 = BCB.ints(100000, 1, 10000000);'),

  // ---- sorting
  'sort-an-array': P('n = 50,000', 'int[] a0 = BCB.ints(50000, -50000, 50000);'),
  'maximum-gap': P('n = 100,000', 'int[] a0 = BCB.ints(100000, 0, 1000000000);'),

  // ---- binary search on the answer
  'koko-eating-bananas': P('10,000 piles of up to 10⁹', 'int[] a0 = BCB.ints(10000, 1, 1000000000); int a1 = 20000;'),
  'find-the-smallest-divisor-given-a-threshold': P('n = 50,000', 'int[] a0 = BCB.ints(50000, 1, 1000000); int a1 = 60000;'),
  'capacity-to-ship-packages-within-d-days': P('50,000 packages', 'int[] a0 = BCB.ints(50000, 1, 500); int a1 = 100;'),
  'minimum-number-of-days-to-make-m-bouquets': P('n = 100,000', 'int[] a0 = BCB.ints(100000, 1, 1000000000); int a1 = 1000; int a2 = 50;'),
  'minimum-time-to-complete-trips': P('100,000 buses, 10⁷ trips', 'int[] a0 = BCB.ints(100000, 1, 10000000); int a1 = 10000000;'),
  'magnetic-force-between-two-balls': P('100,000 baskets', 'int[] a0 = BCB.distinct(100000, 1, 1000000000); int a1 = 1000;'),

  // ---- fast and slow pointers
  'find-the-duplicate-number': P('n = 100,000', 'int[] a0 = Arrays.copyOf(BCB.perm(100000, 1), 100001); a0[100000] = 77777;'),

  // ---- stacks
  'remove-all-adjacent-duplicates-in-string': P('a 100,000-character string', `String h = BCB.str(50000, "${AZ}"); String a0 = h + new StringBuilder(h).reverse();`),
  'basic-calculator-ii': P('an expression of about 200,000 characters', 'StringBuilder sb = new StringBuilder("1"); for (int i = 0; i < 50000; i++) sb.append(BCB.R.nextBoolean() ? \'+\' : \'-\').append(BCB.rnd(0, 9)).append(BCB.R.nextBoolean() ? \'*\' : \'/\').append(BCB.rnd(1, 9)); String a0 = sb.toString();'),
  'longest-valid-parentheses': P('a 30,000-character string', 'String a0 = BCB.str(30000, "()");'),

  // ---- monotonic stack
  'daily-temperatures': P('n = 100,000', 'int[] a0 = new int[100000]; for (int i = 0; i < a0.length; i++) a0[i] = 100 - (int) (i * 70L / 100000);'),
  'online-stock-span': P('100,000 prices', '', 'StockSpanner sp = new StockSpanner(); long sum = 0; for (int i = 0; i < 100000; i++) sum += sp.next(i < 50000 ? 100000 - i : i); Object r = sum;'),
  'remove-k-digits': P('a 100,000-digit number, k = 50,000', 'String a0 = "1" + BCB.str(99999, "0123456789"); int a1 = 50000;'),
  'sum-of-subarray-minimums': P('n = 30,000', 'int[] a0 = BCB.ints(30000, 1, 30000);'),
  'sliding-window-maximum': P('n = 100,000, k = 50,000', 'int[] a0 = BCB.ints(100000, -10000, 10000); int a1 = 50000;'),
  'largest-rectangle-in-histogram': P('n = 100,000', 'int[] a0 = BCB.ints(100000, 0, 10000);'),
  'maximal-rectangle': P('a 200×200 matrix', 'char[][] a0 = BCB.charGrid(200, 200, "1110");'),

  // ---- heaps
  'kth-largest-element-in-a-stream': P('10,000 adds, k = 5,000', '', 'KthLargest kl = new KthLargest(5000, BCB.ints(10000, -10000, 10000)); long sum = 0; for (int i = 0; i < 10000; i++) sum += kl.add(BCB.rnd(-10000, 10000)); Object r = sum;'),
  'kth-largest-element-in-an-array': P('n = 100,000', 'int[] a0 = BCB.ints(100000, -10000, 10000); int a1 = 50000;'),
  'top-k-frequent-elements': P('80,200 values, k = 50', 'List<Integer> l = new ArrayList<>(); for (int v = 1; v <= 400; v++) for (int c = 0; c < v; c++) l.add(v); Collections.shuffle(l, BCB.R); int[] a0 = l.stream().mapToInt(x -> x).toArray(); int a1 = 50;'),
  'k-closest-points-to-origin': P('10,000 points', 'int[] p = BCB.perm(10000, 0); int[][] a0 = new int[10000][]; for (int i = 0; i < a0.length; i++) a0[i] = new int[] { p[i], 0 }; int a1 = 2000;'),
  'merge-k-sorted-lists': P('1,000 lists of 100 nodes', 'ListNode[] a0 = new ListNode[1000]; for (int i = 0; i < a0.length; i++) a0[i] = BCBN.of(BCB.sorted(100, -1000000, 1000000));'),
  'find-median-from-data-stream': P('50,000 adds, each followed by findMedian', '', 'MedianFinder mf = new MedianFinder(); double sum = 0; for (int i = 0; i < 50000; i++) { mf.addNum(BCB.rnd(-100000, 100000)); sum += mf.findMedian(); } Object r = sum;'),
  'ipo': P('100,000 projects, k = 50,000', 'int a0 = 50000; int a1 = 0; int[] a2 = BCB.ints(100000, 0, 10000); int[] a3 = BCB.ints(100000, 0, 100000); a3[0] = 0;'),

  // ---- designing data structures
  'design-hashmap': P('100,000 operations on keys up to 10⁶', '', 'MyHashMap m = new MyHashMap(); long sum = 0; for (int i = 0; i < 100000; i++) { int k = BCB.rnd(0, 1000000), op = BCB.rnd(0, 2); if (op == 0) m.put(k, i); else if (op == 1) sum += m.get(k); else m.remove(k); } Object r = sum;'),
  'min-stack': P('150,000 operations', '', 'MinStack ms = new MinStack(); long sum = 0; for (int i = 0; i < 100000; i++) { ms.push(BCB.rnd(-1000000, 1000000)); sum += ms.getMin(); } for (int i = 0; i < 50000; i++) { ms.pop(); sum += ms.getMin() + ms.top(); } Object r = sum;'),
  'lru-cache': P('200,000 operations, capacity 10,000', '', 'LRUCache c = new LRUCache(10000); long sum = 0; for (int i = 0; i < 200000; i++) { int k = BCB.rnd(0, 30000); if (BCB.R.nextBoolean()) c.put(k, i); else sum += c.get(k); } Object r = sum;'),
  'lfu-cache': P('200,000 operations, capacity 10,000', '', 'LFUCache c = new LFUCache(10000); long sum = 0; for (int i = 0; i < 200000; i++) { int k = BCB.rnd(0, 30000); if (BCB.R.nextBoolean()) c.put(k, i); else sum += c.get(k); } Object r = sum;'),
  'insert-delete-getrandom-o1': P('100,000 updates and 100,000 getRandom calls', '', 'RandomizedSet rs = new RandomizedSet(); long sum = 0; for (int i = 0; i < 100000; i++) { int v = BCB.rnd(0, 50000); if (BCB.R.nextBoolean()) sum += rs.insert(v) ? 1 : 0; else sum += rs.remove(v) ? 2 : 0; } rs.insert(-1); for (int i = 0; i < 100000; i++) rs.getRandom(); Object r = sum;'),
  'insert-delete-getrandom-o1-duplicates-allowed': P('100,000 updates and 100,000 getRandom calls', '', 'RandomizedCollection rc = new RandomizedCollection(); long sum = 0; for (int i = 0; i < 100000; i++) { int v = BCB.rnd(0, 5000); if (BCB.R.nextInt(3) > 0) sum += rc.insert(v) ? 1 : 0; else sum += rc.remove(v) ? 2 : 0; } rc.insert(-1); for (int i = 0; i < 100000; i++) rc.getRandom(); Object r = sum;'),
  'time-based-key-value-store': P('100,000 sets and 100,000 gets', '', 'TimeMap tm = new TimeMap(); long sum = 0; for (int i = 1; i <= 100000; i++) tm.set("k" + (i % 10), "v" + i, i); for (int i = 0; i < 100000; i++) sum += tm.get("k" + BCB.rnd(0, 9), BCB.rnd(1, 100000)).length(); Object r = sum;'),
  'snapshot-array': P('50,000 sets, 25,000 snaps, 50,000 gets', '', 'SnapshotArray sa = new SnapshotArray(50000); long sum = 0; for (int i = 0; i < 50000; i++) { sa.set(BCB.rnd(0, 49999), i); if (i % 2 == 0) sa.snap(); } for (int i = 0; i < 50000; i++) sum += sa.get(BCB.rnd(0, 49999), BCB.rnd(0, 24999)); Object r = sum;'),

  // ---- range queries
  'range-sum-query-mutable': P('n = 100,000 with 100,000 operations', '', 'NumArray na = new NumArray(BCB.ints(100000, -100, 100)); long sum = 0; for (int q = 0; q < 100000; q++) { if (BCB.R.nextBoolean()) na.update(BCB.rnd(0, 99999), BCB.rnd(-100, 100)); else { int l = BCB.rnd(0, 99999); sum += na.sumRange(l, BCB.rnd(l, 99999)); } } Object r = sum;'),
  'count-of-smaller-numbers-after-self': P('n = 100,000', 'int[] a0 = BCB.ints(100000, -10000, 10000);'),
  'reverse-pairs': P('n = 50,000 across the full int range', 'int[] a0 = new int[50000]; for (int i = 0; i < a0.length; i++) a0[i] = BCB.R.nextInt();'),
  'count-of-range-sum': P('n = 100,000', 'int[] a0 = BCB.ints(100000, -100000, 100000); int a1 = -1000; int a2 = 1000;'),
  'create-sorted-array-through-instructions': P('n = 100,000', 'int[] a0 = BCB.ints(100000, 1, 100000);'),

  // ---- string matching
  'repeated-dna-sequences': P('a 100,000-letter DNA string', 'String a0 = BCB.str(100000, "ACGT");'),
  'longest-happy-prefix': P('a 100,000-character string', 'String a0 = "a".repeat(99999) + "b";'),
  'shortest-palindrome': P('a 50,000-character string', 'String a0 = "a".repeat(25000) + "b" + "a".repeat(24999);'),
  'longest-duplicate-substring': P('a 30,000-character string (length compared)', `String a0 = BCB.str(30000, "${AZ}");`, 'Object r = s.longestDupSubstring(a0).length();'),

  // ---- trees
  'serialize-and-deserialize-binary-tree': P('a tree of 100,000 nodes', '', 'TreeNode t = BCBT.random(BCB.perm(100000, 0)); Codec ser = new Codec(), de = new Codec(); Object r = de.deserialize(ser.serialize(t));'),
  'diameter-of-binary-tree': DP('a 100,000-node path-shaped tree', skewed(100000, 'i')),
  'house-robber-iii': DP('a 10,000-node path-shaped tree', skewed(10000, 'BCB.rnd(0, 10000)')),

  // ---- tries
  'implement-trie-prefix-tree': P('30,000 inserts and 60,000 queries', '', 'Trie t = new Trie(); long sum = 0; for (int i = 0; i < 30000; i++) t.insert(BCB.str(BCB.rnd(5, 20), "abcde")); for (int i = 0; i < 30000; i++) { if (t.search(BCB.str(BCB.rnd(1, 10), "abcde"))) sum++; if (t.startsWith(BCB.str(BCB.rnd(1, 8), "abcde"))) sum += 2; } Object r = sum;'),
  'design-add-and-search-words-data-structure': P('20,000 words and 20,000 wildcard searches', '', 'WordDictionary d = new WordDictionary(); long sum = 0; for (int i = 0; i < 20000; i++) d.addWord(BCB.str(BCB.rnd(3, 10), "abcd")); for (int i = 0; i < 20000; i++) { char[] w = BCB.str(BCB.rnd(3, 10), "abcd").toCharArray(); w[0] = \'.\'; if (d.search(new String(w))) sum++; } Object r = sum;'),
  'replace-words': P('1,000 roots and a 100,000-word sentence', `List<String> a0 = new ArrayList<>(); for (int i = 0; i < 1000; i++) a0.add(BCB.str(BCB.rnd(1, 5), "${AZ}")); StringBuilder sb = new StringBuilder(); for (int i = 0; i < 100000; i++) { if (i > 0) sb.append(' '); sb.append(BCB.str(BCB.rnd(3, 10), "${AZ}")); } String a1 = sb.toString();`),
  'maximum-xor-of-two-numbers-in-an-array': P('n = 200,000', 'int[] a0 = new int[200000]; for (int i = 0; i < a0.length; i++) a0[i] = BCB.R.nextInt(Integer.MAX_VALUE);'),
  'word-search-ii': P('a 12×12 board and 30,000 words', 'char[][] a0 = BCB.charGrid(12, 12, "abcde"); Set<String> ws = new LinkedHashSet<>(); while (ws.size() < 30000) ws.add(BCB.str(BCB.rnd(1, 10), "abcde")); String[] a1 = ws.toArray(new String[0]);'),

  // ---- graphs
  '01-matrix': P('a 100×100 matrix with a single 0', 'int[][] a0 = new int[100][100]; for (int[] row : a0) Arrays.fill(row, 1); a0[0][0] = 0;'),
  'pacific-atlantic-water-flow': P('a 200×200 grid', 'int[][] a0 = BCB.grid(200, 200, 0, 100000);'),
  'minimum-height-trees': P('a tree of 20,000 nodes', 'int a0 = 20000; int[][] a1 = BCB.treeEdges(20000, 0);'),
  'find-eventual-safe-states': P('10,000 nodes', 'int n = 10000; int[][] a0 = new int[n][]; for (int i = 0; i < n; i++) { TreeSet<Integer> ts = new TreeSet<>(); int deg = BCB.rnd(0, 4); while (ts.size() < deg) ts.add(BCB.rnd(0, n - 1)); a0[i] = ts.stream().mapToInt(x -> x).toArray(); }'),
  'smallest-string-with-swaps': P('a 100,000-character string with 100,000 pairs', `String a0 = BCB.str(100000, "${AZ}"); List<List<Integer>> a1 = new ArrayList<>(); for (int i = 0; i < 100000; i++) a1.add(Arrays.asList(BCB.rnd(0, 99999), BCB.rnd(0, 99999)));`),
  'largest-component-size-by-common-factor': P('20,000 values up to 100,000', 'int[] a0 = BCB.distinct(20000, 1, 100000);'),
  'path-with-minimum-effort': P('a 100×100 grid', 'int[][] a0 = BCB.grid(100, 100, 1, 1000000);'),
  'minimum-obstacle-removal-to-reach-corner': P('a 300×300 grid', 'int[][] a0 = BCB.grid(300, 300, 0, 1); a0[0][0] = 0; a0[299][299] = 0;'),
  'minimum-cost-to-make-at-least-one-valid-path-in-a-grid': P('a 100×100 grid', 'int[][] a0 = BCB.grid(100, 100, 1, 4);'),

  // ---- dynamic programming
  'min-cost-climbing-stairs': DP('1,000 stairs', 'int[] a0 = BCB.ints(1000, 0, 999);'),
  'house-robber': DP('100 houses', 'int[] a0 = BCB.ints(100, 0, 400);'),
  'house-robber-ii': DP('100 houses', 'int[] a0 = BCB.ints(100, 0, 1000);'),
  'maximum-subarray': DP('n = 100,000', 'int[] a0 = BCB.ints(100000, -10000, 10000);'),
  'decode-ways': DP('a 44-digit string', 'String a0 = "1".repeat(44);'),
  'word-break': DP('a 151-character string', 'String a0 = "a".repeat(150) + "b"; List<String> a1 = new ArrayList<>(); for (int i = 1; i <= 10; i++) a1.add("a".repeat(i));'),
  'longest-increasing-subsequence': DP('n = 2,500', 'int[] a0 = BCB.ints(2500, -10000, 10000);'),
  'best-time-to-buy-and-sell-stock-with-cooldown': DP('5,000 days', 'int[] a0 = BCB.ints(5000, 0, 1000);'),
  'russian-doll-envelopes': DP('100,000 envelopes', 'int[][] a0 = new int[100000][]; for (int i = 0; i < a0.length; i++) a0[i] = new int[] { BCB.rnd(1, 100000), BCB.rnd(1, 100000) };'),
  'partition-equal-subset-sum': DP('200 numbers', 'int[] a0 = BCB.ints(200, 1, 100);'),
  'coin-change': DP('amount 10,000', 'int[] a0 = { 186, 419, 83, 408, 7, 13 }; int a1 = 10000;'),
  'ones-and-zeroes': DP('600 strings, m = n = 100', 'String[] a0 = BCB.words(600, 1, 10, "01"); int a1 = 100; int a2 = 100;'),
  'minimum-path-sum': DP('a 200×200 grid', 'int[][] a0 = BCB.grid(200, 200, 0, 200);'),
  'triangle': DP('200 rows', 'List<List<Integer>> a0 = new ArrayList<>(); for (int i = 0; i < 200; i++) a0.add(BCB.list(BCB.ints(i + 1, -10000, 10000)));'),
  'minimum-falling-path-sum': DP('a 100×100 matrix', 'int[][] a0 = BCB.grid(100, 100, -100, 100);'),
  'maximal-square': DP('a 300×300 matrix', 'char[][] a0 = BCB.charGrid(300, 300, "11110");'),
  'count-square-submatrices-with-all-ones': DP('a 300×300 matrix', 'int[][] a0 = new int[300][300]; for (int[] row : a0) for (int j = 0; j < 300; j++) row[j] = BCB.R.nextInt(10) == 0 ? 0 : 1;'),
  'dungeon-game': DP('a 200×200 dungeon', 'int[][] a0 = BCB.grid(200, 200, -1000, 1000);'),
  'cherry-pickup': DP('a 50×50 grid', 'int[][] a0 = BCB.grid(50, 50, 0, 1);'),
  'longest-common-subsequence': DP('two 1,000-character strings', 'String a0 = BCB.str(1000, "abcde"); String a1 = BCB.str(1000, "abcde");'),
  'delete-operation-for-two-strings': DP('two 500-character strings', 'String a0 = BCB.str(500, "abc"); String a1 = BCB.str(500, "abc");'),
  'longest-palindromic-substring': DP('a 1,000-character string (length compared)', 'String a0 = BCB.str(1000, "ab");', 'Object r = s.longestPalindrome(a0).length();'),
  'longest-palindromic-subsequence': DP('a 1,000-character string', 'String a0 = BCB.str(1000, "abc");'),
  'palindromic-substrings': DP('a 1,000-character string', 'String a0 = BCB.str(1000, "ab");'),
  'interleaving-string': DP('100 + 100 characters', 'String a0 = "a".repeat(100); String a1 = "a".repeat(99) + "b"; String a2 = "a".repeat(200);'),
  'edit-distance': DP('two 500-character strings', 'String a0 = BCB.str(500, "abcd"); String a1 = BCB.str(500, "abcd");'),
  'distinct-subsequences': DP('a 1,000-character string', 'String a0 = BCB.str(1000, "abc"); String a1 = "abc";'),
  'regular-expression-matching': DP('a pattern that defeats plain backtracking', 'String a0 = "a".repeat(20) + "b"; String a1 = "a*".repeat(10) + "c";'),
  'best-time-to-buy-and-sell-stock-with-transaction-fee': DP('50,000 days', 'int[] a0 = BCB.ints(50000, 1, 50000); int a1 = 100;'),
  'best-time-to-buy-and-sell-stock-iii': DP('100,000 days', 'int[] a0 = BCB.ints(100000, 0, 100000);'),
  'best-time-to-buy-and-sell-stock-iv': DP('1,000 days, k = 100', 'int a0 = 100; int[] a1 = BCB.ints(1000, 0, 1000);'),
  'minimum-score-triangulation-of-polygon': DP('a 50-sided polygon', 'int[] a0 = BCB.ints(50, 1, 100);'),
  'burst-balloons': DP('300 balloons', 'int[] a0 = BCB.ints(300, 0, 100);'),
  'minimum-cost-to-cut-a-stick': DP('100 cuts on a stick of 10⁶', 'int a0 = 1000000; int[] a1 = BCB.distinct(100, 1, 999999);'),

  // ---- greedy
  'assign-cookies': P('30,000 children and cookies', 'int[] a0 = BCB.ints(30000, 1, 100000); int[] a1 = BCB.ints(30000, 1, 100000);'),
  'best-time-to-buy-and-sell-stock': P('100,000 days', 'int[] a0 = BCB.ints(100000, 0, 10000);'),
  'jump-game': P('10,000 positions, end unreachable', 'int[] a0 = new int[10000]; Arrays.fill(a0, 3); for (int i = 9995; i <= 9998; i++) a0[i] = 0;'),
  'jump-game-ii': P('10,000 positions', 'int[] a0 = BCB.ints(10000, 1, 1000);'),
  'boats-to-save-people': P('50,000 people', 'int[] a0 = BCB.ints(50000, 1, 30000); int a1 = 30000;'),
  'candy': P('20,000 children', 'int[] a0 = new int[20000]; for (int i = 0; i < a0.length; i++) a0[i] = 20000 - i;'),

  // ---- bits
  'single-number': P('n = 29,999', 'int[] d = BCB.distinct(15000, -30000, 30000); int[] a0 = BCB.repeatEach(Arrays.copyOf(d, 14999), 2, new int[] { d[14999] });'),
  'single-number-ii': P('n = 29,998', 'int[] d = BCB.distinct(10000, -1000000, 1000000); int[] a0 = BCB.repeatEach(Arrays.copyOf(d, 9999), 3, new int[] { d[9999] });'),
  'single-number-iii': P('n = 30,000', 'int[] d = BCB.distinct(15001, -1000000, 1000000); int[] a0 = BCB.repeatEach(Arrays.copyOf(d, 14999), 2, new int[] { d[14999], d[15000] });'),
};
