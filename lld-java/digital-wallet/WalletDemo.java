// Design a Digital Wallet (Paytm/PhonePe LLD) — runnable reference solution for the lesson.
// Run: java lld-java/digital-wallet/WalletDemo.java
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.concurrent.locks.ReentrantLock;

public class WalletDemo {
    public static void main(String[] args) throws Exception {
        var clock = new MutableClock(Instant.parse("2026-10-15T10:00:00Z"));
        var w = new WalletService(new TierLimits(Map.of(KycTier.MIN, Money.inr(10_000), KycTier.FULL, Money.inr(100_000))), clock);
        var asha = w.open("asha", KycTier.FULL);
        var ravi = w.open("ravi", KycTier.MIN);

        // Top-up from the bank: money enters through the external settlement account
        w.topUp(asha, Money.inr(5_000), "topup-1");
        Check.that(w.balance(asha).equals(Money.inr(5_000)), "top-up credited");

        // Transfer, with an idempotency key
        Txn t1 = w.transfer(asha, ravi, Money.inr(1_200), "pay-1");
        Check.that(w.balance(asha).equals(Money.inr(3_800)) && w.balance(ravi).equals(Money.inr(1_200)), "transfer moves money");
        Txn retry = w.transfer(asha, ravi, Money.inr(1_200), "pay-1");
        Check.that(retry == t1 && w.balance(asha).equals(Money.inr(3_800)), "retry with the same key returns the first result, no double debit");
        Check.throwsEx(IdempotencyConflictException.class, () -> w.transfer(asha, ravi, Money.inr(999), "pay-1"), "same key, different request");

        // Validation
        Check.throwsEx(InsufficientFundsException.class, () -> w.transfer(ravi, asha, Money.inr(5_000), "pay-2"), "can't overdraw");
        Check.throwsEx(IllegalArgumentException.class, () -> w.transfer(asha, asha, Money.inr(1), "pay-3"), "no self transfer");
        Check.throwsEx(IllegalArgumentException.class, () -> w.transfer(asha, ravi, Money.ZERO, "pay-4"), "amount must be positive");

        // Daily outgoing limit by KYC tier (minimum-KYC wallets: ₹10,000/day)
        w.topUp(ravi, Money.inr(20_000), "topup-2");
        w.transfer(ravi, asha, Money.inr(9_000), "pay-5");
        Check.throwsEx(LimitExceededException.class, () -> w.transfer(ravi, asha, Money.inr(1_500), "pay-6"), "daily limit");
        clock.advance(Duration.ofDays(1));
        w.transfer(ravi, asha, Money.inr(1_500), "pay-7");
        Check.that(w.balance(ravi).equals(Money.inr(1_200 + 20_000 - 9_000 - 1_500)), "limit resets the next day");

        // Frozen wallets can receive but not send
        w.freeze(ravi);
        Check.throwsEx(AccountFrozenException.class, () -> w.transfer(ravi, asha, Money.inr(1), "pay-8"), "frozen can't send");
        w.transfer(asha, ravi, Money.inr(1), "pay-9");
        w.unfreeze(ravi);

        // Refund = compensating transaction that references the original
        Txn refund = w.refund(t1.id(), "refund-1");
        Check.that(refund.reverses().equals(t1.id()) && w.balance(ravi).equals(Money.inr(10_701 - 1_200)), "refund moves the money back");
        Check.throwsEx(IllegalStateException.class, () -> w.refund(t1.id(), "refund-2"), "can't refund twice");

        // Statement and reconciliation: balances equal the sum of ledger entries; the whole ledger sums to zero
        Check.that(w.statement(asha).size() == 6, "one entry per movement: top-up, pay-1, pay-5, pay-7, pay-9, refund");
        Check.that(w.reconcile(), "ledger reconciles");

        // Concurrency: 16 threads × 2,000 random transfers among 10 wallets, including opposite directions
        var big = new WalletService(new TierLimits(Map.of(KycTier.FULL, Money.inr(1_000_000_000))), clock);
        List<AccountId> ids = new ArrayList<>();
        for (int i = 0; i < 10; i++) { AccountId a = big.open("u" + i, KycTier.FULL); big.topUp(a, Money.inr(10_000), "seed" + i); ids.add(a); }
        var pool = Executors.newFixedThreadPool(16);
        var rejected = new AtomicInteger();
        List<Future<?>> fs = new ArrayList<>();
        for (int t = 0; t < 16; t++) {
            int seed = t;
            fs.add(pool.submit(() -> {
                var rnd = new Random(seed);
                for (int i = 0; i < 2_000; i++) {
                    AccountId from = ids.get(rnd.nextInt(10)), to = ids.get(rnd.nextInt(10));
                    if (from.equals(to)) continue;
                    try { big.transfer(from, to, Money.inr(1 + rnd.nextInt(3_000)), "t" + seed + "-" + i); }
                    catch (InsufficientFundsException e) { rejected.incrementAndGet(); }
                }
            }));
        }
        for (var f : fs) f.get(30, TimeUnit.SECONDS);                     // a deadlock would time out here
        pool.shutdown();
        long total = ids.stream().mapToLong(a -> big.balance(a).paise()).sum();
        Check.that(total == Money.inr(100_000).paise(), "money conserved across 32,000 concurrent transfers");
        Check.that(ids.stream().allMatch(a -> big.balance(a).paise() >= 0), "no negative balances");
        Check.that(big.reconcile(), "ledger reconciles after concurrent load (" + rejected.get() + " rejected for funds)");

        Check.done("digital-wallet");
    }
}

// ---------- value objects ----------
record Money(long paise) implements Comparable<Money> {
    static final Money ZERO = new Money(0);
    static Money inr(long r) { return new Money(r * 100); }
    Money plus(Money o) { return new Money(paise + o.paise); }
    Money minus(Money o) { return new Money(paise - o.paise); }
    Money negate() { return new Money(-paise); }
    boolean isPositive() { return paise > 0; }
    public int compareTo(Money o) { return Long.compare(paise, o.paise); }
}
record AccountId(String value) implements Comparable<AccountId> {
    public int compareTo(AccountId o) { return value.compareTo(o.value); }
}
record TxnId(long value) { }
enum KycTier { MIN, FULL }
enum TxnType { TOP_UP, TRANSFER, REFUND }

/** One leg of a transaction. A transaction's legs always sum to zero. */
record LedgerEntry(TxnId txn, AccountId account, Money amount, Instant at) { }

record Txn(TxnId id, TxnType type, AccountId from, AccountId to, Money amount, TxnId reverses, Instant at) { }

class WalletException extends RuntimeException { WalletException(String m) { super(m); } }
class InsufficientFundsException extends WalletException { InsufficientFundsException() { super("Insufficient balance"); } }
class LimitExceededException extends WalletException { LimitExceededException() { super("Daily limit exceeded"); } }
class AccountFrozenException extends WalletException { AccountFrozenException(AccountId a) { super("Account frozen: " + a.value()); } }
class IdempotencyConflictException extends WalletException { IdempotencyConflictException(String k) { super("Key reused with a different request: " + k); } }

final class Account {
    final AccountId id; final KycTier tier;
    final ReentrantLock lock = new ReentrantLock();
    private final boolean allowNegative;                    // only the external settlement account
    private long balance;                                   // paise; guarded by lock
    private volatile boolean frozen;
    private LocalDate limitDay; private long sentToday;     // guarded by lock
    Account(AccountId id, KycTier tier, boolean allowNegative) { this.id = id; this.tier = tier; this.allowNegative = allowNegative; }

    long balance() { return balance; }
    void apply(long delta) {
        if (!allowNegative && balance + delta < 0) throw new InsufficientFundsException();
        balance += delta;
    }
    void recordOutgoing(LocalDate day, long amount, long limit) {
        if (!day.equals(limitDay)) { limitDay = day; sentToday = 0; }
        if (sentToday + amount > limit) throw new LimitExceededException();
        sentToday += amount;
    }
    boolean frozen() { return frozen; }
    void setFrozen(boolean f) { frozen = f; }
}

interface LimitPolicy { Money dailyOutgoing(KycTier tier); }
record TierLimits(Map<KycTier, Money> limits) implements LimitPolicy {
    public Money dailyOutgoing(KycTier tier) { return limits.get(tier); }
}

final class WalletService {
    /** Money entering or leaving the system (bank top-ups, withdrawals) moves through this account. */
    static final AccountId SETTLEMENT = new AccountId("~bank-settlement");
    private static final TxnId PENDING = new TxnId(-1);                         // refund in progress

    private final Map<AccountId, Account> accounts = new ConcurrentHashMap<>();
    private final List<LedgerEntry> ledger = new CopyOnWriteArrayList<>();       // append-only
    private final Map<TxnId, Txn> txns = new ConcurrentHashMap<>();
    private final Map<TxnId, TxnId> refundedBy = new ConcurrentHashMap<>();
    private final AtomicLong ids = new AtomicLong();
    private final LimitPolicy limits;
    private final Clock clock;

    WalletService(LimitPolicy limits, Clock clock) {
        this.limits = limits; this.clock = clock;
        accounts.put(SETTLEMENT, new Account(SETTLEMENT, KycTier.FULL, true));   // goes negative as money enters
    }

    AccountId open(String name, KycTier tier) {
        var id = new AccountId(name);
        if (accounts.putIfAbsent(id, new Account(id, tier, false)) != null) throw new IllegalArgumentException("exists: " + name);
        return id;
    }

    Txn topUp(AccountId to, Money amount, String key) {
        return idempotent(key, new Request(TxnType.TOP_UP, SETTLEMENT, to, amount), () -> move(TxnType.TOP_UP, SETTLEMENT, to, amount, null, false));
    }

    Txn transfer(AccountId from, AccountId to, Money amount, String key) {
        if (from.equals(to)) throw new IllegalArgumentException("cannot transfer to self");
        if (!amount.isPositive()) throw new IllegalArgumentException("amount must be positive");
        return idempotent(key, new Request(TxnType.TRANSFER, from, to, amount), () -> move(TxnType.TRANSFER, from, to, amount, null, true));
    }

    /** A refund is a new, compensating transaction — the original is never edited. */
    Txn refund(TxnId original, String key) {
        Txn o = txns.get(original);
        return idempotent(key, new Request(TxnType.REFUND, o.to(), o.from(), o.amount()), () -> {
            if (refundedBy.putIfAbsent(original, PENDING) != null) throw new IllegalStateException("already refunded");
            try {
                Txn r = move(TxnType.REFUND, o.to(), o.from(), o.amount(), original, false);
                refundedBy.put(original, r.id());
                return r;
            } catch (RuntimeException e) { refundedBy.remove(original); throw e; }
        });
    }

    void freeze(AccountId a) { account(a).setFrozen(true); }
    void unfreeze(AccountId a) { account(a).setFrozen(false); }

    Money balance(AccountId a) {
        Account acc = account(a);
        acc.lock.lock();
        try { return new Money(acc.balance()); } finally { acc.lock.unlock(); }
    }

    List<LedgerEntry> statement(AccountId a) { return ledger.stream().filter(e -> e.account().equals(a)).toList(); }

    /** Invariants: every balance equals the sum of its entries, and all entries together sum to zero. */
    boolean reconcile() {
        Map<AccountId, Long> sums = new HashMap<>();
        long total = 0;
        for (LedgerEntry e : ledger) { sums.merge(e.account(), e.amount().paise(), Long::sum); total += e.amount().paise(); }
        for (Account a : accounts.values()) if (sums.getOrDefault(a.id, 0L) != balance(a.id).paise()) return false;
        return total == 0;
    }

    // ---- internals ----
    private record Request(TxnType type, AccountId from, AccountId to, Money amount) { }
    private record Attempt(Request request, CompletableFuture<Txn> result) { }
    private final ConcurrentHashMap<String, Attempt> attempts = new ConcurrentHashMap<>();

    /** The first caller with a key does the work; concurrent or later callers with the same key get its result. */
    private Txn idempotent(String key, Request req, java.util.function.Supplier<Txn> action) {
        var mine = new Attempt(req, new CompletableFuture<>());
        Attempt existing = attempts.putIfAbsent(key, mine);
        if (existing != null) {
            if (!existing.request().equals(req)) throw new IdempotencyConflictException(key);
            try { return existing.result().join(); }                       // replay (or wait for) the first attempt
            catch (CompletionException e) { throw (RuntimeException) e.getCause(); }
        }
        try {
            Txn t = action.get();
            mine.result().complete(t);
            return t;
        } catch (RuntimeException e) {
            attempts.remove(key, mine);                                    // a failed attempt may be retried
            mine.result().completeExceptionally(e);
            throw e;
        }
    }

    private Txn move(TxnType type, AccountId fromId, AccountId toId, Money amount, TxnId reverses, boolean enforceLimits) {
        Account from = account(fromId), to = account(toId);
        Account first = from.id.compareTo(to.id) < 0 ? from : to;      // global lock order → no deadlock
        Account second = first == from ? to : from;
        first.lock.lock();
        try {
            second.lock.lock();
            try {
                if (enforceLimits) {
                    if (from.frozen()) throw new AccountFrozenException(from.id);
                    if (from.balance() < amount.paise()) throw new InsufficientFundsException();
                    from.recordOutgoing(LocalDate.ofInstant(clock.instant(), ZoneOffset.UTC), amount.paise(),
                                        limits.dailyOutgoing(from.tier).paise());
                }
                from.apply(-amount.paise());
                to.apply(amount.paise());
                Instant now = clock.instant();
                Txn t = new Txn(new TxnId(ids.incrementAndGet()), type, fromId, toId, amount, reverses, now);
                ledger.add(new LedgerEntry(t.id(), fromId, amount.negate(), now));     // double entry:
                ledger.add(new LedgerEntry(t.id(), toId, amount, now));                // legs sum to zero
                txns.put(t.id(), t);
                return t;
            } finally { second.lock.unlock(); }
        } finally { first.lock.unlock(); }
    }

    private Account account(AccountId id) {
        Account a = accounts.get(id);
        if (a == null) throw new WalletException("Unknown account " + id.value());
        return a;
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
