// Design a Key-Value Store with Transactions — the interview-sized version from the top of the lesson.
// Run: java lld-java/kv-store/KvStoreInterview.java
import java.util.*;

public class KvStoreInterview {
    public static void main(String[] args) {
        var kv = new KvStore();
        kv.set("a", "1");
        kv.begin();
        kv.set("a", "2");
        check(kv.get("a").equals("2"), "transaction sees its own write");
        kv.begin();
        kv.delete("a");
        check(kv.get("a") == null, "delete inside nested transaction");
        kv.rollback();
        check(kv.get("a").equals("2"), "rollback undoes only the inner transaction");
        kv.commit();
        check(kv.get("a").equals("2"), "commit keeps the value");
        fails(kv::commit, "commit with no transaction");
        fails(kv::rollback, "rollback with no transaction");

        kv.begin(); kv.set("b", "x"); kv.begin(); kv.set("c", "y"); kv.commit(); kv.rollback();
        check(kv.get("b") == null && kv.get("c") == null, "inner commit merges into outer, outer rollback drops both");
        kv.begin(); kv.delete("a"); kv.commit();
        check(kv.get("a") == null, "a committed delete removes the key");
        done("kv-store");
    }

    static int passed;
    static void check(boolean ok, String what) { if (!ok) throw new AssertionError("FAILED: " + what); passed++; }
    static void fails(Runnable r, String what) { try { r.run(); } catch (RuntimeException e) { passed++; return; } throw new AssertionError("FAILED (no exception): " + what); }
    static void done(String name) { System.out.println("✓ " + name + " (interview version): " + passed + " checks passed"); }
}

// ---- lesson excerpt: everything below is shown in the lesson
class KvStore {
    private final Map<String, String> data = new HashMap<>();
    // One layer of changes per open BEGIN, newest first. A null value means "deleted in this layer".
    private final Deque<Map<String, String>> transactions = new ArrayDeque<>();

    String get(String key) {
        for (Map<String, String> layer : transactions)       // newest layer wins
            if (layer.containsKey(key)) return layer.get(key);
        return data.get(key);
    }

    void set(String key, String value) { write(key, value); }
    void delete(String key)            { write(key, null); }

    void begin() { transactions.push(new HashMap<>()); }

    void rollback() {
        if (transactions.isEmpty()) throw new IllegalStateException("No transaction");
        transactions.pop();                                  // just throw the layer away
    }

    void commit() {
        if (transactions.isEmpty()) throw new IllegalStateException("No transaction");
        Map<String, String> top = transactions.pop();
        top.forEach(this::write);                            // fold into the parent layer, or the store
    }

    private void write(String key, String value) {
        if (!transactions.isEmpty()) { transactions.peek().put(key, value); return; }
        if (value == null) data.remove(key); else data.put(key, value);
    }
}
