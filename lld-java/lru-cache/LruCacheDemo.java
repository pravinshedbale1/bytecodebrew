// Design an LRU Cache — runnable reference solution for the lesson.
// Run: java lld-java/lru-cache/LruCacheDemo.java
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.locks.ReentrantLock;
import java.util.function.BiConsumer;

public class LruCacheDemo {
    public static void main(String[] args) throws Exception {
        // Classic LRU
        var lru = new LruCache<String, Integer>(2);
        lru.put("a", 1); lru.put("b", 2);
        lru.get("a");                                  // a is now most recent
        lru.put("c", 3);                               // evicts b
        Check.that(lru.get("b").isEmpty() && lru.get("a").orElse(-1) == 1 && lru.get("c").orElse(-1) == 3, "b evicted, a and c kept");
        lru.put("a", 10);                              // update counts as use
        lru.put("d", 4);                               // evicts c
        Check.that(lru.get("c").isEmpty() && lru.get("a").orElse(-1) == 10 && lru.size() == 2, "update refreshes recency");
        Check.throwsEx(IllegalArgumentException.class, () -> new LruCache<String, String>(0), "capacity must be positive");

        // JDK shortcut behaves the same
        var simple = new SimpleLru<String, Integer>(2);
        simple.put("a", 1); simple.put("b", 2); simple.get("a"); simple.put("c", 3);
        Check.that(!simple.containsKey("b") && simple.containsKey("a"), "LinkedHashMap access-order LRU");

        // Randomised cross-check: LruCache vs LinkedHashMap reference over 100k operations
        var rnd = new Random(7);
        var mine = new LruCache<Integer, Integer>(50);
        var ref = new SimpleLru<Integer, Integer>(50);
        for (int i = 0; i < 100_000; i++) {
            int key = rnd.nextInt(120);
            if (rnd.nextBoolean()) { mine.put(key, i); ref.put(key, i); }
            else Check.that(Objects.equals(mine.get(key).orElse(null), ref.get(key)), "get(" + key + ") matches reference");
        }

        // Pluggable policies
        List<String> evicted = new ArrayList<>();
        var fifo = new Cache<String, Integer>(2, new FifoPolicy<>());
        fifo.onEviction((k, v) -> evicted.add(k));
        fifo.put("a", 1); fifo.put("b", 2); fifo.get("a"); fifo.put("c", 3);
        Check.that(evicted.equals(List.of("a")), "FIFO ignores access and evicts the oldest insert");

        var lfu = new Cache<String, Integer>(2, new LfuPolicy<>());
        lfu.put("a", 1); lfu.put("b", 2);
        lfu.get("a"); lfu.get("a"); lfu.get("b");     // a: 3 uses, b: 2 uses
        lfu.put("c", 3);                               // evicts b
        Check.that(lfu.get("b").isEmpty() && lfu.get("a").isPresent(), "LFU evicts the least frequently used");
        lfu.put("d", 4);                               // c (freq 1) evicted before a (freq 4)
        Check.that(lfu.get("c").isEmpty() && lfu.get("a").isPresent() && lfu.get("d").isPresent(), "new key starts at frequency 1");

        var lruPolicy = new Cache<String, Integer>(2, new LruPolicy<>());
        lruPolicy.put("a", 1); lruPolicy.put("b", 2); lruPolicy.get("a"); lruPolicy.put("c", 3);
        Check.that(lruPolicy.get("b").isEmpty() && lruPolicy.get("a").isPresent(), "LRU policy plugged into the generic cache");

        // TTL with an injected clock
        var clock = new MutableClock(Instant.parse("2026-10-15T10:00:00Z"));
        var ttl = new TtlCache<String, String>(10, Duration.ofMinutes(5), clock);
        ttl.put("session", "s1");
        clock.advance(Duration.ofMinutes(4));
        Check.that(ttl.get("session").isPresent(), "alive before expiry");
        clock.advance(Duration.ofMinutes(1));
        Check.that(ttl.get("session").isEmpty(), "expired exactly at the TTL boundary");

        // Thread safety: 16 threads hammer a synchronised cache; structure stays consistent
        var shared = new SynchronizedCache<Integer, Integer>(new LruCache<>(100));
        var pool = Executors.newFixedThreadPool(16);
        List<Future<?>> fs = new ArrayList<>();
        for (int t = 0; t < 16; t++) {
            int seed = t;
            fs.add(pool.submit(() -> {
                var r = new Random(seed);
                for (int i = 0; i < 50_000; i++) {
                    int k = r.nextInt(300);
                    if (r.nextBoolean()) shared.put(k, k); else shared.get(k).ifPresent(v -> { if (v != k) throw new AssertionError("wrong value"); });
                }
            }));
        }
        for (var f : fs) f.get();
        pool.shutdown();
        Check.that(shared.size() == 100, "size never exceeds capacity and the list matches the map");
        Check.that(shared.selfCheck(), "linked list and map agree after concurrent use");

        Check.done("lru-cache");
    }
}

final class LruCache<K, V> {
    private static final class Node<K, V> {
        final K key;
        V value;
        Node<K, V> prev, next;
        Node(K key, V value) { this.key = key; this.value = value; }
    }

    private final int capacity;
    private final Map<K, Node<K, V>> index;
    private final Node<K, V> head = new Node<>(null, null);    // sentinel: most-recent side
    private final Node<K, V> tail = new Node<>(null, null);    // sentinel: least-recent side

    LruCache(int capacity) {
        if (capacity <= 0) throw new IllegalArgumentException("capacity must be positive");
        this.capacity = capacity;
        this.index = new HashMap<>(capacity * 4 / 3 + 1);
        head.next = tail;
        tail.prev = head;
    }

    Optional<V> get(K key) {
        Node<K, V> node = index.get(key);
        if (node == null) return Optional.empty();
        moveToHead(node);
        return Optional.of(node.value);
    }

    void put(K key, V value) {
        Objects.requireNonNull(key);
        Node<K, V> node = index.get(key);
        if (node != null) {                      // update existing
            node.value = value;
            moveToHead(node);
            return;
        }
        if (index.size() == capacity) {          // evict least recently used
            Node<K, V> lru = tail.prev;
            unlink(lru);
            index.remove(lru.key);
        }
        node = new Node<>(key, value);
        index.put(key, node);
        addAfterHead(node);
    }

    int size() { return index.size(); }

    boolean selfCheck() {
        int n = 0;
        for (Node<K, V> x = head.next; x != tail; x = x.next) {
            if (x.next.prev != x || index.get(x.key) != x) return false;
            n++;
        }
        return n == index.size();
    }

    private void moveToHead(Node<K, V> n) { unlink(n); addAfterHead(n); }

    private void addAfterHead(Node<K, V> n) {
        n.prev = head;
        n.next = head.next;
        head.next.prev = n;
        head.next = n;
    }

    private void unlink(Node<K, V> n) {
        n.prev.next = n.next;
        n.next.prev = n.prev;
    }
}

final class SimpleLru<K, V> extends LinkedHashMap<K, V> {
    private final int capacity;
    SimpleLru(int capacity) { super(16, 0.75f, true); this.capacity = capacity; }
    @Override protected boolean removeEldestEntry(Map.Entry<K, V> eldest) { return size() > capacity; }
}

/** One lock around the compound map + list update (a Decorator over the cache). */
final class SynchronizedCache<K, V> {
    private final LruCache<K, V> delegate;
    private final ReentrantLock lock = new ReentrantLock();
    SynchronizedCache(LruCache<K, V> delegate) { this.delegate = delegate; }

    Optional<V> get(K key) { lock.lock(); try { return delegate.get(key); } finally { lock.unlock(); } }
    void put(K key, V value) { lock.lock(); try { delegate.put(key, value); } finally { lock.unlock(); } }
    int size() { lock.lock(); try { return delegate.size(); } finally { lock.unlock(); } }
    boolean selfCheck() { lock.lock(); try { return delegate.selfCheck(); } finally { lock.unlock(); } }
}

interface EvictionPolicy<K> {
    void keyAdded(K key);
    void keyAccessed(K key);
    void keyRemoved(K key);
    K evictCandidate();                        // which key to evict next
}

final class Cache<K, V> {
    private final int capacity;
    private final Map<K, V> store = new HashMap<>();
    private final EvictionPolicy<K> policy;
    private final List<BiConsumer<K, V>> evictionListeners = new CopyOnWriteArrayList<>();

    Cache(int capacity, EvictionPolicy<K> policy) { this.capacity = capacity; this.policy = policy; }

    Optional<V> get(K key) {
        V v = store.get(key);
        if (v != null) policy.keyAccessed(key);
        return Optional.ofNullable(v);
    }

    void put(K key, V value) {
        if (store.containsKey(key)) {
            store.put(key, value);
            policy.keyAccessed(key);
            return;
        }
        if (store.size() == capacity) {
            K victim = policy.evictCandidate();
            V old = store.remove(victim);
            policy.keyRemoved(victim);
            evictionListeners.forEach(l -> l.accept(victim, old));
        }
        store.put(key, value);
        policy.keyAdded(key);
    }

    void onEviction(BiConsumer<K, V> listener) { evictionListeners.add(listener); }
}

/** LinkedHashSet keeps insertion order: re-inserting on access moves a key to the end. */
final class LruPolicy<K> implements EvictionPolicy<K> {
    private final LinkedHashSet<K> order = new LinkedHashSet<>();
    public void keyAdded(K key) { order.add(key); }
    public void keyAccessed(K key) { order.remove(key); order.add(key); }
    public void keyRemoved(K key) { order.remove(key); }
    public K evictCandidate() { return order.iterator().next(); }
}

final class FifoPolicy<K> implements EvictionPolicy<K> {
    private final LinkedHashSet<K> order = new LinkedHashSet<>();
    public void keyAdded(K key) { order.add(key); }
    public void keyAccessed(K key) { }
    public void keyRemoved(K key) { order.remove(key); }
    public K evictCandidate() { return order.iterator().next(); }
}

/** O(1) LFU: key → frequency, frequency → keys in recency order, and the minimum frequency. */
final class LfuPolicy<K> implements EvictionPolicy<K> {
    private final Map<K, Integer> freq = new HashMap<>();
    private final Map<Integer, LinkedHashSet<K>> buckets = new HashMap<>();
    private int minFrequency;

    public void keyAdded(K key) {
        freq.put(key, 1);
        buckets.computeIfAbsent(1, f -> new LinkedHashSet<>()).add(key);
        minFrequency = 1;
    }
    public void keyAccessed(K key) {
        int f = freq.get(key);
        LinkedHashSet<K> bucket = buckets.get(f);
        bucket.remove(key);
        if (bucket.isEmpty()) { buckets.remove(f); if (minFrequency == f) minFrequency = f + 1; }
        freq.put(key, f + 1);
        buckets.computeIfAbsent(f + 1, x -> new LinkedHashSet<>()).add(key);
    }
    public void keyRemoved(K key) {
        Integer f = freq.remove(key);
        if (f == null) return;
        LinkedHashSet<K> bucket = buckets.get(f);
        bucket.remove(key);
        if (bucket.isEmpty()) buckets.remove(f);
    }
    public K evictCandidate() { return buckets.get(minFrequency).iterator().next(); }
}

final class TtlCache<K, V> {
    private record Entry<V>(V value, Instant expiresAt) {
        boolean isExpired(Instant now) { return expiresAt != null && !now.isBefore(expiresAt); }
    }
    private final LruCache<K, Entry<V>> inner;
    private final Duration ttl;
    private final Clock clock;

    TtlCache(int capacity, Duration ttl, Clock clock) { this.inner = new LruCache<>(capacity); this.ttl = ttl; this.clock = clock; }

    void put(K key, V value) { inner.put(key, new Entry<>(value, clock.instant().plus(ttl))); }

    Optional<V> get(K key) {                      // lazy expiry on read
        return inner.get(key).filter(e -> !e.isExpired(clock.instant())).map(Entry::value);
    }
}

final class MutableClock extends Clock {
    private volatile Instant now;
    MutableClock(Instant start) { this.now = start; }
    void advance(Duration d) { now = now.plus(d); }
    @Override public ZoneId getZone() { return ZoneOffset.UTC; }
    @Override public Clock withZone(ZoneId zone) { return this; }
    @Override public Instant instant() { return now; }
}

final class Check {
    private static int passed;
    static void that(boolean cond, String what) { if (!cond) throw new AssertionError("FAILED: " + what); passed++; }
    static void throwsEx(Class<? extends Throwable> type, Runnable r, String what) {
        try { r.run(); } catch (Throwable t) {
            if (type.isInstance(t)) { passed++; return; }
            throw new AssertionError("FAILED: " + what + " — threw " + t);
        }
        throw new AssertionError("FAILED: " + what + " — nothing thrown");
    }
    static void done(String name) { System.out.println("✓ " + name + ": " + passed + " checks passed"); }
}
