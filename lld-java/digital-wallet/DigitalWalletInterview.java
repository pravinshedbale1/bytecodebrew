// Design a Digital Wallet — the interview-sized version from the top of the lesson.
// Run: java lld-java/digital-wallet/DigitalWalletInterview.java
import java.util.*;
import java.util.concurrent.*;

public class DigitalWalletInterview {
    public static void main(String[] args) throws Exception {
        var w = new Wallet();
        w.open("asha");
        w.open("ravi");
        w.addMoney("asha", 1_000);
        String t1 = w.transfer("asha", "ravi", 300, "req-1");
        check(w.balance("asha") == 700 && w.balance("ravi") == 300, "money moved");
        check(w.transfer("asha", "ravi", 300, "req-1").equals(t1), "a retried request returns the first result");
        check(w.balance("asha") == 700, "...and doesn't pay twice");
        fails(() -> w.transfer("asha", "ravi", 5_000, "req-2"), "insufficient funds");
        fails(() -> w.transfer("asha", "asha", 1, "req-3"), "no transfer to yourself");
        fails(() -> w.transfer("asha", "ravi", 0, "req-4"), "amount must be positive");
        check(w.statement("asha").stream().mapToLong(Entry::amount).sum() == w.balance("asha"), "ledger adds up to the balance");

        // A pays B and B pays A at the same time, many times: no deadlock, no money lost
        w.addMoney("ravi", 10_000);
        try (var pool = Executors.newFixedThreadPool(8)) {
            for (int i = 0; i < 2_000; i++) {
                int n = i;
                pool.submit(() -> n % 2 == 0 ? w.transfer("asha", "ravi", 1, "a" + n) : w.transfer("ravi", "asha", 1, "r" + n));
            }
        }
        check(w.balance("asha") + w.balance("ravi") == 11_000, "total money is conserved");
        check(w.balance("asha") == 700, "equal transfers both ways cancel out");
        done("digital-wallet");
    }

    static int passed;
    static void check(boolean ok, String what) { if (!ok) throw new AssertionError("FAILED: " + what); passed++; }
    static void fails(Runnable r, String what) { try { r.run(); } catch (RuntimeException e) { passed++; return; } throw new AssertionError("FAILED (no exception): " + what); }
    static void done(String name) { System.out.println("✓ " + name + " (interview version): " + passed + " checks passed"); }
}

// ---- lesson excerpt: everything below is shown in the lesson
class Account {
    final String id;
    long balance;                                        // in paise; changed only while holding this account's lock
    Account(String id) { this.id = id; }
}

record Entry(String txnId, String accountId, long amount) { }   // + credit, − debit; every transfer writes two

class Wallet {
    private final Map<String, Account> accounts = new ConcurrentHashMap<>();
    private final List<Entry> ledger = new CopyOnWriteArrayList<>();
    private final Map<String, String> finished = new ConcurrentHashMap<>();   // request id -> txn id
    private int nextTxn = 1;

    void open(String id) { accounts.putIfAbsent(id, new Account(id)); }

    void addMoney(String id, long amount) {
        Account a = account(id);
        synchronized (a) { a.balance += amount; ledger.add(new Entry("topup", id, amount)); }
    }

    String transfer(String from, String to, long amount, String requestId) {
        if (amount <= 0 || from.equals(to)) throw new IllegalArgumentException("Bad transfer");
        Account a = account(from), b = account(to);
        Account first = from.compareTo(to) < 0 ? a : b;  // always lock in id order, so A→B and B→A can't deadlock
        Account second = first == a ? b : a;
        synchronized (first) {
            synchronized (second) {
                String done = finished.get(requestId);
                if (done != null) return done;           // a retried tap: return the first result, don't pay again
                if (a.balance < amount) throw new IllegalStateException("Insufficient funds");
                String txn = "T" + nextTxnId();
                a.balance -= amount;
                b.balance += amount;
                ledger.add(new Entry(txn, from, -amount));
                ledger.add(new Entry(txn, to, amount));
                finished.put(requestId, txn);
                return txn;
            }
        }
    }

    long balance(String id) { Account a = account(id); synchronized (a) { return a.balance; } }
    List<Entry> statement(String id) { return ledger.stream().filter(e -> e.accountId().equals(id)).toList(); }

    private synchronized int nextTxnId() { return nextTxn++; }

    private Account account(String id) {
        Account a = accounts.get(id);
        if (a == null) throw new IllegalArgumentException("No account " + id);
        return a;
    }
}
