// Design an In-Memory Key-Value Store with Transactions — runnable reference solution for the lesson.
// Run: java lld-java/kv-store/KvStoreDemo.java
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.*;

public class KvStoreDemo {
    public static void main(String[] args) throws Exception {
        var clock = new MutableClock(Instant.parse("2026-10-15T10:00:00Z"));
        var store = new KeyValueStore(clock);
        var s = store.openSession();

        // Auto-commit outside a transaction
        s.set("a", "10");
        Check.that(s.get("a").orElse("").equals("10") && store.countEqualTo("10") == 1, "set/get and value count");
        s.delete("a");
        Check.that(s.get("a").isEmpty() && store.countEqualTo("10") == 0, "delete");

        // Nested transactions: rollback the inner, commit the outer
        s.set("a", "1");
        s.begin();
        s.set("a", "2");
        s.begin();
        s.set("a", "3");
        s.delete("b");
        Check.that(s.get("a").orElse("").equals("3"), "read your own writes");
        s.rollback();
        Check.that(s.get("a").orElse("").equals("2"), "inner rollback restores the outer transaction's value");
        Check.that(store.openSession().get("a").orElse("").equals("1"), "others still see committed data (no dirty reads)");
        s.commit();
        Check.that(store.openSession().get("a").orElse("").equals("2"), "outer commit publishes");
        Check.throwsEx(NoTransactionException.class, s::rollback, "rollback with no transaction");

        // Inner commit merges into the parent; the parent's rollback discards both
        s.begin(); s.set("x", "1"); s.begin(); s.set("y", "2"); s.commit();
        Check.that(s.get("y").isPresent(), "inner commit visible inside the outer transaction");
        s.rollback();
        Check.that(s.get("x").isEmpty() && s.get("y").isEmpty(), "outer rollback discards merged inner changes");

        // Optimistic concurrency: lost update detected
        var alice = store.openSession(); var bob = store.openSession();
        alice.set("balance", "100");
        alice.begin(); bob.begin();
        int aRead = Integer.parseInt(alice.get("balance").orElseThrow());
        int bRead = Integer.parseInt(bob.get("balance").orElseThrow());
        alice.set("balance", String.valueOf(aRead + 10));
        bob.set("balance", String.valueOf(bRead + 20));
        alice.commit();
        Check.throwsEx(ConflictException.class, bob::commit, "bob's read is stale → conflict, not a lost update");
        Check.that(store.openSession().get("balance").orElse("").equals("110"), "alice's commit stands");

        // Blind writes (no read) don't conflict
        var c1 = store.openSession(); var c2 = store.openSession();
        c1.begin(); c2.begin();
        c1.set("k", "one"); c2.set("k", "two");
        c1.commit(); c2.commit();
        Check.that(store.openSession().get("k").orElse("").equals("two"), "last blind write wins");

        // TTL: lazy expiry with an injected clock
        s.setWithTtl("otp", "4821", Duration.ofMinutes(5));
        clock.advance(Duration.ofMinutes(4));
        Check.that(s.get("otp").isPresent(), "alive before expiry");
        clock.advance(Duration.ofMinutes(1));
        Check.that(s.get("otp").isEmpty() && store.countEqualTo("4821") == 0, "expired at the TTL");

        // Concurrency: 16 threads × 500 increments with retry-on-conflict → no lost updates
        store.openSession().set("counter", "0");
        var pool = Executors.newFixedThreadPool(16);
        var conflicts = new AtomicInteger();
        List<Future<?>> fs = new ArrayList<>();
        for (int t = 0; t < 16; t++) fs.add(pool.submit(() -> {
            Session me = store.openSession();
            for (int i = 0; i < 500; i++) {
                while (true) {
                    me.begin();
                    int v = Integer.parseInt(me.get("counter").orElseThrow());
                    me.set("counter", String.valueOf(v + 1));
                    try { me.commit(); break; } catch (ConflictException e) { conflicts.incrementAndGet(); }
                }
            }
        }));
        for (var f : fs) f.get();
        pool.shutdown();
        Check.that(store.openSession().get("counter").orElse("").equals("8000"), "8,000 increments, none lost (" + conflicts.get() + " retries)");

        Check.done("kv-store");
    }
}

class NoTransactionException extends RuntimeException { NoTransactionException() { super("No transaction in progress"); } }
class ConflictException extends RuntimeException { ConflictException(String key) { super("Concurrent update to " + key); } }

/** Committed data: value + version (+ optional expiry). Guarded by one read-write lock. */
final class KeyValueStore {
    private record Entry(String value, long version, Instant expiresAt) {
        boolean isLive(Instant now) { return expiresAt == null || now.isBefore(expiresAt); }
    }
    record Read(Optional<String> value, long version) { }

    private final Map<String, Entry> data = new HashMap<>();
    private final Map<String, Integer> valueCounts = new HashMap<>();
    private final ReadWriteLock lock = new ReentrantReadWriteLock();
    private final Clock clock;
    private long nextVersion = 1;

    KeyValueStore(Clock clock) { this.clock = clock; }

    Session openSession() { return new Session(this); }

    /** A read returns the value and the version it saw (0 = absent). */
    Read read(String key) {
        lock.readLock().lock();
        try {
            Entry e = data.get(key);
            if (e == null || !e.isLive(clock.instant())) return new Read(Optional.empty(), versionOf(e));
            return new Read(Optional.of(e.value()), e.version());
        } finally { lock.readLock().unlock(); }
    }

    /**
     * Atomically validates that every key read is still at the version seen, then applies all writes.
     * An empty Optional in writes means delete.
     */
    void commit(Map<String, Long> readVersions, Map<String, Write> writes) {
        lock.writeLock().lock();
        try {
            Instant now = clock.instant();
            for (var r : readVersions.entrySet()) {
                Entry e = data.get(r.getKey());
                long current = (e == null || !e.isLive(now)) ? versionOf(e) : e.version();
                if (current != r.getValue()) throw new ConflictException(r.getKey());
            }
            writes.forEach((key, w) -> apply(key, w, now));
        } finally { lock.writeLock().unlock(); }
    }

    int countEqualTo(String value) {
        lock.writeLock().lock();                         // write lock: purges expired entries as it counts
        try {
            Instant now = clock.instant();
            List<String> expired = data.entrySet().stream().filter(e -> !e.getValue().isLive(now)).map(Map.Entry::getKey).toList();
            expired.forEach(k -> apply(k, Write.delete(), now));
            return valueCounts.getOrDefault(value, 0);
        } finally { lock.writeLock().unlock(); }
    }

    private void apply(String key, Write w, Instant now) {
        Entry old = data.get(key);
        if (old != null) valueCounts.merge(old.value(), -1, (a, b) -> a + b == 0 ? null : a + b);
        long version = nextVersion++;
        if (w.value().isEmpty()) {
            data.put(key, new Entry(null, version, now));                       // tombstone keeps the version
        } else {
            Instant exp = w.ttl() == null ? null : now.plus(w.ttl());
            data.put(key, new Entry(w.value().get(), version, exp));
            valueCounts.merge(w.value().get(), 1, Integer::sum);
        }
    }

    private static long versionOf(Entry e) { return e == null ? 0 : e.version(); }
}

record Write(Optional<String> value, Duration ttl) {
    static Write set(String v, Duration ttl) { return new Write(Optional.of(v), ttl); }
    static Write delete() { return new Write(Optional.empty(), null); }
}

/**
 * One client's view. Writes inside a transaction are buffered in a stack of layers (one per BEGIN);
 * reads see the newest layer first, then committed data. The outermost COMMIT validates and publishes.
 */
final class Session {
    private final KeyValueStore store;
    private final Deque<Map<String, Write>> layers = new ArrayDeque<>();
    private final Map<String, Long> readVersions = new HashMap<>();   // first version seen per key, outermost txn

    Session(KeyValueStore store) { this.store = store; }

    Optional<String> get(String key) {
        for (Map<String, Write> layer : layers) {                       // newest first
            Write w = layer.get(key);
            if (w != null) return w.value();
        }
        KeyValueStore.Read r = store.read(key);
        if (!layers.isEmpty()) readVersions.putIfAbsent(key, r.version());
        return r.value();
    }

    void set(String key, String value) { write(key, Write.set(value, null)); }
    void setWithTtl(String key, String value, Duration ttl) { write(key, Write.set(value, ttl)); }
    void delete(String key) { write(key, Write.delete()); }

    private void write(String key, Write w) {
        if (layers.isEmpty()) store.commit(Map.of(), Map.of(key, w));   // auto-commit
        else layers.peekFirst().put(key, w);
    }

    void begin() { layers.push(new LinkedHashMap<>()); }

    void rollback() {
        if (layers.isEmpty()) throw new NoTransactionException();
        layers.pop();
        if (layers.isEmpty()) readVersions.clear();
    }

    void commit() {
        if (layers.isEmpty()) throw new NoTransactionException();
        Map<String, Write> top = layers.pop();
        if (!layers.isEmpty()) { layers.peekFirst().putAll(top); return; }   // inner commit: merge into parent
        try {
            store.commit(readVersions, top);                                // outermost: validate + publish
        } finally {
            readVersions.clear();
        }
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
