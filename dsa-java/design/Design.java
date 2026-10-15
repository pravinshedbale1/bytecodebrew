// Pattern: Designing Data Structures. Run: java dsa-java/design/Design.java
import java.util.*;

public class Design {
    public static void main(String[] args) {
        var rnd = new Random(41);
        testLRU(rnd);
        testLFU(rnd);
        testRandomizedSet(rnd);
        testTimeMap(rnd);
        testIterators(rnd);
        Check.done("design");
    }

    // ---------------------------------------------------------------- LRU cache
    static class LRUCache {
        private static class Node {
            int key, val;
            Node prev, next;
            Node(int k, int v) { key = k; val = v; }
        }
        private final int capacity;
        private final Map<Integer, Node> map = new HashMap<>();
        private final Node head = new Node(0, 0), tail = new Node(0, 0);   // sentinels: no null checks

        LRUCache(int capacity) {
            this.capacity = capacity;
            head.next = tail;
            tail.prev = head;
        }

        int get(int key) {
            Node n = map.get(key);
            if (n == null) return -1;
            remove(n);
            addFront(n);                                // used: now the most recent
            return n.val;
        }

        void put(int key, int value) {
            Node n = map.get(key);
            if (n != null) {
                n.val = value;
                remove(n);
                addFront(n);
                return;
            }
            if (map.size() == capacity) {
                Node lru = tail.prev;                   // least recently used sits before the tail
                remove(lru);
                map.remove(lru.key);                    // why the node stores its key
            }
            n = new Node(key, value);
            map.put(key, n);
            addFront(n);
        }

        private void remove(Node n) { n.prev.next = n.next; n.next.prev = n.prev; }
        private void addFront(Node n) { n.next = head.next; n.prev = head; head.next.prev = n; head.next = n; }
    }

    static void testLRU(Random rnd) {
        for (int t = 0; t < 2_000; t++) {
            int cap = 1 + rnd.nextInt(4);
            LRUCache c = new LRUCache(cap);
            List<int[]> model = new ArrayList<>();      // {key, val}, most recent last
            for (int op = 0; op < 60; op++) {
                int k = rnd.nextInt(6);
                if (rnd.nextBoolean()) {
                    int idx = indexOf(model, k), exp = -1;
                    if (idx >= 0) { int[] e = model.remove(idx); model.add(e); exp = e[1]; }
                    Check.that(c.get(k) == exp, "LRU get");
                } else {
                    int v = rnd.nextInt(100), idx = indexOf(model, k);
                    if (idx >= 0) model.remove(idx);
                    else if (model.size() == cap) model.remove(0);
                    model.add(new int[] { k, v });
                    c.put(k, v);
                }
            }
        }
    }

    static int indexOf(List<int[]> m, int k) {
        for (int i = 0; i < m.size(); i++) if (m.get(i)[0] == k) return i;
        return -1;
    }

    // ---------------------------------------------------------------- LFU cache
    static class LFUCache {
        private final int capacity;
        private final Map<Integer, Integer> vals = new HashMap<>(), freq = new HashMap<>();
        private final Map<Integer, LinkedHashSet<Integer>> byFreq = new HashMap<>();   // freq → keys, oldest first
        private int minFreq;

        LFUCache(int capacity) { this.capacity = capacity; }

        int get(int key) {
            if (!vals.containsKey(key)) return -1;
            touch(key);
            return vals.get(key);
        }

        void put(int key, int value) {
            if (capacity == 0) return;
            if (vals.containsKey(key)) {
                vals.put(key, value);
                touch(key);
                return;
            }
            if (vals.size() == capacity) {
                Iterator<Integer> it = byFreq.get(minFreq).iterator();
                int evict = it.next();                  // least frequent; among those, least recent
                it.remove();
                vals.remove(evict);
                freq.remove(evict);
            }
            vals.put(key, value);
            freq.put(key, 1);
            byFreq.computeIfAbsent(1, f -> new LinkedHashSet<>()).add(key);
            minFreq = 1;                                // a new key always has the lowest count
        }

        private void touch(int key) {                   // move key from bucket f to bucket f + 1
            int f = freq.get(key);
            freq.put(key, f + 1);
            LinkedHashSet<Integer> bucket = byFreq.get(f);
            bucket.remove(key);
            if (bucket.isEmpty() && f == minFreq) minFreq++;
            byFreq.computeIfAbsent(f + 1, x -> new LinkedHashSet<>()).add(key);
        }
    }

    static void testLFU(Random rnd) {
        for (int t = 0; t < 2_000; t++) {
            int cap = rnd.nextInt(4);
            LFUCache c = new LFUCache(cap);
            Map<Integer, int[]> model = new HashMap<>();   // key → {val, freq, lastUse}
            int clock = 0;
            for (int op = 0; op < 60; op++) {
                int k = rnd.nextInt(6);
                clock++;
                if (rnd.nextBoolean()) {
                    int[] e = model.get(k);
                    int exp = -1;
                    if (e != null) { e[1]++; e[2] = clock; exp = e[0]; }
                    Check.that(c.get(k) == exp, "LFU get");
                } else {
                    int v = rnd.nextInt(100);
                    c.put(k, v);
                    if (cap == 0) continue;
                    int[] e = model.get(k);
                    if (e != null) { e[0] = v; e[1]++; e[2] = clock; continue; }
                    if (model.size() == cap) {
                        int victim = -1;
                        for (var en : model.entrySet()) {
                            int[] x = en.getValue();
                            if (victim == -1 || x[1] < model.get(victim)[1] || (x[1] == model.get(victim)[1] && x[2] < model.get(victim)[2]))
                                victim = en.getKey();
                        }
                        model.remove(victim);
                    }
                    model.put(k, new int[] { v, 1, clock });
                }
            }
        }
    }

    // ---------------------------------------------------------------- insert / delete / getRandom in O(1)
    static class RandomizedSet {
        private final List<Integer> items = new ArrayList<>();
        private final Map<Integer, Integer> index = new HashMap<>();   // value → its position in items
        private final Random random = new Random();

        boolean insert(int val) {
            if (index.containsKey(val)) return false;
            index.put(val, items.size());
            items.add(val);
            return true;
        }

        boolean remove(int val) {
            Integer i = index.get(val);
            if (i == null) return false;
            int last = items.get(items.size() - 1);
            items.set(i, last);                         // move the last element into the hole
            index.put(last, i);
            items.remove(items.size() - 1);             // removing the end is O(1)
            index.remove(val);
            return true;
        }

        int getRandom() { return items.get(random.nextInt(items.size())); }
    }

    static void testRandomizedSet(Random rnd) {
        for (int t = 0; t < 2_000; t++) {
            RandomizedSet s = new RandomizedSet();
            Set<Integer> model = new HashSet<>();
            for (int op = 0; op < 50; op++) {
                int v = rnd.nextInt(10);
                if (rnd.nextBoolean()) Check.that(s.insert(v) == model.add(v), "insert");
                else Check.that(s.remove(v) == model.remove(v), "remove");
                if (!model.isEmpty()) Check.that(model.contains(s.getRandom()), "getRandom member");
            }
        }
        RandomizedSet s = new RandomizedSet();                    // uniformity
        for (int v = 0; v < 5; v++) s.insert(v);
        s.remove(2);
        int[] count = new int[5];
        for (int i = 0; i < 40_000; i++) count[s.getRandom()]++;
        Check.that(count[2] == 0, "removed never returned");
        for (int v : new int[] { 0, 1, 3, 4 }) Check.that(Math.abs(count[v] - 10_000) < 600, "uniform");
    }

    // ---------------------------------------------------------------- time-based key-value store
    static class TimeMap {
        private final Map<String, List<Integer>> times = new HashMap<>();
        private final Map<String, List<String>> values = new HashMap<>();

        /** Timestamps for a key arrive in increasing order, so each list stays sorted. */
        void set(String key, String value, int timestamp) {
            times.computeIfAbsent(key, k -> new ArrayList<>()).add(timestamp);
            values.computeIfAbsent(key, k -> new ArrayList<>()).add(value);
        }

        /** The value with the largest timestamp ≤ the given one, or "". */
        String get(String key, int timestamp) {
            List<Integer> ts = times.get(key);
            if (ts == null) return "";
            int lo = 0, hi = ts.size();                 // first index with ts > timestamp
            while (lo < hi) {
                int mid = lo + (hi - lo) / 2;
                if (ts.get(mid) > timestamp) hi = mid; else lo = mid + 1;
            }
            return lo == 0 ? "" : values.get(key).get(lo - 1);
        }
    }

    static void testTimeMap(Random rnd) {
        for (int t = 0; t < 2_000; t++) {
            TimeMap m = new TimeMap();
            Map<String, TreeMap<Integer, String>> model = new HashMap<>();
            Map<String, Integer> lastT = new HashMap<>();
            for (int op = 0; op < 40; op++) {
                String k = "k" + rnd.nextInt(3);
                if (rnd.nextInt(3) == 0) {
                    int ts = lastT.getOrDefault(k, 0) + 1 + rnd.nextInt(4);
                    lastT.put(k, ts);
                    String v = "v" + rnd.nextInt(100);
                    m.set(k, v, ts);
                    model.computeIfAbsent(k, x -> new TreeMap<>()).put(ts, v);
                } else {
                    int ts = rnd.nextInt(30);
                    var e = model.containsKey(k) ? model.get(k).floorEntry(ts) : null;
                    Check.that(m.get(k, ts).equals(e == null ? "" : e.getValue()), "TimeMap get");
                }
            }
        }
    }

    // ---------------------------------------------------------------- iterators
    /** Wraps any iterator so you can look at the next element without consuming it. */
    static class PeekingIterator<T> implements Iterator<T> {
        private final Iterator<T> it;
        private T next;
        private boolean hasNext;

        PeekingIterator(Iterator<T> it) { this.it = it; advance(); }

        T peek() { return next; }
        @Override public boolean hasNext() { return hasNext; }
        @Override public T next() {
            if (!hasNext) throw new NoSuchElementException();
            T r = next;
            advance();
            return r;
        }
        private void advance() { hasNext = it.hasNext(); next = hasNext ? it.next() : null; }
    }

    /** Iterates a nested list like [1, [2, [3]], 4] lazily: a stack of iterators, one per open list. */
    static class NestedIterator implements Iterator<Integer> {
        private final Deque<Iterator<Object>> stack = new ArrayDeque<>();
        private Integer next;

        NestedIterator(List<Object> list) { stack.push(list.iterator()); }

        @Override public boolean hasNext() {
            while (next == null && !stack.isEmpty()) {
                Iterator<Object> top = stack.peek();
                if (!top.hasNext()) { stack.pop(); continue; }          // this list is finished
                Object o = top.next();
                if (o instanceof Integer i) next = i;
                else {
                    @SuppressWarnings("unchecked") List<Object> inner = (List<Object>) o;
                    stack.push(inner.iterator());                     // descend into the inner list
                }
            }
            return next != null;
        }

        @Override public Integer next() {
            if (!hasNext()) throw new NoSuchElementException();
            Integer r = next;
            next = null;
            return r;
        }
    }

    static void testIterators(Random rnd) {
        for (int t = 0; t < 2_000; t++) {
            List<Integer> base = new ArrayList<>();
            for (int i = rnd.nextInt(8); i > 0; i--) base.add(rnd.nextInt(50));
            PeekingIterator<Integer> p = new PeekingIterator<>(base.iterator());
            for (int x : base) { Check.that(p.hasNext() && p.peek() == x && p.peek() == x && p.next() == x, "peeking"); }
            Check.that(!p.hasNext(), "peeking end");

            List<Object> nested = randomNested(rnd, 3);
            List<Integer> flat = new ArrayList<>(), got = new ArrayList<>();
            flatten(nested, flat);
            NestedIterator it = new NestedIterator(nested);
            while (it.hasNext()) got.add(it.next());
            Check.that(got.equals(flat), "nested iterator");
        }
    }

    static List<Object> randomNested(Random rnd, int depth) {
        List<Object> l = new ArrayList<>();
        for (int i = rnd.nextInt(4); i > 0; i--)
            l.add(depth > 0 && rnd.nextInt(3) == 0 ? randomNested(rnd, depth - 1) : (Object) rnd.nextInt(100));
        return l;
    }

    @SuppressWarnings("unchecked")
    static void flatten(List<Object> l, List<Integer> out) {
        for (Object o : l) if (o instanceof Integer i) out.add(i); else flatten((List<Object>) o, out);
    }
}

final class Check {
    private static int passed;
    static void that(boolean cond, String what) { if (!cond) throw new AssertionError("FAILED: " + what); passed++; }
    static void done(String name) { System.out.println("✓ " + name + ": " + passed + " checks passed"); }
}
