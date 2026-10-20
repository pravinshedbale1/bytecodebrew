// Design an LRU Cache — the interview-sized version from the top of the lesson.
// Run: java lld-java/lru-cache/LruCacheInterview.java
import java.util.*;
import java.util.concurrent.*;

public class LruCacheInterview {
    public static void main(String[] args) throws Exception {
        var c = new LruCache<String, Integer>(2);
        c.put("a", 1); c.put("b", 2);
        check(c.get("a") == 1, "hit");
        c.put("c", 3);                                  // evicts b (a was used more recently)
        check(c.get("b") == null, "least recently used evicted");
        check(c.get("a") == 1 && c.get("c") == 3, "others kept");
        c.put("a", 10);                                 // update moves a to the front
        c.put("d", 4);                                  // evicts c
        check(c.get("c") == null && c.get("a") == 10 && c.get("d") == 4, "update counts as use");
        fails(() -> new LruCache<String, String>(0), "capacity must be positive");

        var shared = new LruCache<Integer, Integer>(100);
        try (var pool = Executors.newFixedThreadPool(8)) {
            for (int t = 0; t < 8; t++) {
                int base = t * 1000;
                pool.submit(() -> { for (int i = 0; i < 5000; i++) { shared.put(base + i % 300, i); shared.get(base + (i * 7) % 300); } });
            }
        }
        check(shared.size() == 100, "size stays at capacity under concurrent use");
        done("lru-cache");
    }

    static int passed;
    static void check(boolean ok, String what) { if (!ok) throw new AssertionError("FAILED: " + what); passed++; }
    static void fails(Runnable r, String what) { try { r.run(); } catch (RuntimeException e) { passed++; return; } throw new AssertionError("FAILED (no exception): " + what); }
    static void done(String name) { System.out.println("✓ " + name + " (interview version): " + passed + " checks passed"); }
}

// ---- lesson excerpt: everything below is shown in the lesson
class LruCache<K, V> {
    private final int capacity;
    private final Map<K, Node<K, V>> map = new HashMap<>();      // key -> node, for O(1) lookup
    private final Node<K, V> head = new Node<>(null, null);      // sentinel: most recently used side
    private final Node<K, V> tail = new Node<>(null, null);      // sentinel: least recently used side

    LruCache(int capacity) {
        if (capacity <= 0) throw new IllegalArgumentException("capacity must be positive");
        this.capacity = capacity;
        head.next = tail;
        tail.prev = head;
    }

    synchronized V get(K key) {
        Node<K, V> node = map.get(key);
        if (node == null) return null;
        moveToFront(node);                                       // reading counts as "used"
        return node.value;
    }

    synchronized void put(K key, V value) {
        Node<K, V> node = map.get(key);
        if (node != null) { node.value = value; moveToFront(node); return; }
        if (map.size() == capacity) {                            // full: drop the least recently used
            Node<K, V> lru = tail.prev;
            unlink(lru);
            map.remove(lru.key);
        }
        node = new Node<>(key, value);
        map.put(key, node);
        addFront(node);
    }

    synchronized int size() { return map.size(); }

    private void moveToFront(Node<K, V> n) { unlink(n); addFront(n); }
    private void unlink(Node<K, V> n) { n.prev.next = n.next; n.next.prev = n.prev; }
    private void addFront(Node<K, V> n) { n.next = head.next; n.prev = head; head.next.prev = n; head.next = n; }

    private static final class Node<K, V> {
        final K key;
        V value;
        Node<K, V> prev, next;
        Node(K key, V value) { this.key = key; this.value = value; }
    }
}
