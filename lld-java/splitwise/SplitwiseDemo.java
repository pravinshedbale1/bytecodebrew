// Design Splitwise — runnable reference solution for the lesson.
// Run: java lld-java/splitwise/SplitwiseDemo.java
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicLong;

public class SplitwiseDemo {
    public static void main(String[] args) throws Exception {
        UserId a = new UserId("A"), b = new UserId("B"), c = new UserId("C"), d = new UserId("D");
        var svc = new ExpenseService(new SplitStrategies(), new BalanceSheet());

        // ₹100 among three → 3334 + 3333 + 3333 paise
        Expense e1 = svc.addExpense(new ExpenseRequest(a, 10_000, List.of(a, b, c), SplitType.EQUAL, Map.of(), "dinner"));
        Check.that(e1.splits().stream().mapToLong(Split::amountPaise).sum() == 10_000, "equal split sums exactly");
        Check.that(e1.splits().get(0).amountPaise() == 3334, "remainder paisa goes to the first participant");
        Check.that(svc.netBalances().get(a) == 6_666 && svc.netBalances().get(b) == -3_333, "A is owed 66.66; B owes 33.33");

        // Netting: B pays for A → the pair is netted, only one direction stored
        svc.addExpense(new ExpenseRequest(b, 2_000, List.of(a), SplitType.EXACT, Map.of(a, 2_000L), "cab"));
        Check.that(svc.owes(b, a) == 1_333 && svc.owes(a, b) == 0, "B now owes A 13.33, netted");
        svc.settle(b, a, 1_333);
        Check.that(svc.owes(b, a) == 0, "settle clears the debt");

        // Percent (basis points) and shares use largest remainder
        Expense pct = svc.addExpense(new ExpenseRequest(c, 1_000, List.of(a, b, c), SplitType.PERCENT,
                Map.of(a, 3_333L, b, 3_333L, c, 3_334L), "snacks"));
        Check.that(pct.splits().stream().mapToLong(Split::amountPaise).sum() == 1_000, "percent split sums exactly");
        Expense sh = svc.addExpense(new ExpenseRequest(d, 1_001, List.of(a, b, d), SplitType.SHARES, Map.of(a, 2L, b, 1L, d, 1L), "fuel"));
        Check.that(sh.splits().stream().mapToLong(Split::amountPaise).sum() == 1_001
                && sh.splits().get(0).amountPaise() == 501, "2:1:1 of 1001 → 501, 250, 250 (largest remainder)");

        // Validation
        Check.throwsEx(InvalidSplitException.class, () -> svc.addExpense(new ExpenseRequest(a, 1_000, List.of(a, b), SplitType.EXACT, Map.of(a, 400L, b, 500L), "x")), "exact must sum to total");
        Check.throwsEx(InvalidSplitException.class, () -> svc.addExpense(new ExpenseRequest(a, 1_000, List.of(a, b), SplitType.PERCENT, Map.of(a, 5_000L, b, 4_000L), "x")), "percent must total 100");
        Check.throwsEx(IllegalArgumentException.class, () -> svc.addExpense(new ExpenseRequest(a, 1_000, List.of(a, a), SplitType.EQUAL, Map.of(), "x")), "duplicate participants");
        Check.throwsEx(IllegalArgumentException.class, () -> svc.addExpense(new ExpenseRequest(a, 0, List.of(a, b), SplitType.EQUAL, Map.of(), "x")), "amount must be positive");

        // Simplification: A owes B 100, B owes C 100 → A pays C 100
        var chain = new BalanceSheet();
        chain.addDebt(a, b, 10_000); chain.addDebt(b, c, 10_000);
        List<Payment> p = new DebtSimplifier().simplify(chain.netBalances());
        Check.that(p.equals(List.of(new Payment(a, c, 10_000))), "chain collapses to one payment");

        // Property test: random groups — balances net to zero, simplification settles everyone in ≤ N−1 payments
        var rnd = new Random(1);
        for (int trial = 0; trial < 2_000; trial++) {
            int n = 2 + rnd.nextInt(8);
            List<UserId> people = new ArrayList<>();
            for (int i = 0; i < n; i++) people.add(new UserId("U" + i));
            var group = new ExpenseService(new SplitStrategies(), new BalanceSheet());
            for (int k = 0; k < 1 + rnd.nextInt(15); k++) {
                List<UserId> parts = new ArrayList<>(people);
                Collections.shuffle(parts, rnd);
                parts = parts.subList(0, 1 + rnd.nextInt(n));
                group.addExpense(new ExpenseRequest(people.get(rnd.nextInt(n)), 1 + rnd.nextInt(100_000), parts, SplitType.EQUAL, Map.of(), "e"));
            }
            Map<UserId, Long> net = group.netBalances();
            Check.that(net.values().stream().mapToLong(Long::longValue).sum() == 0, "balances sum to zero");
            List<Payment> pay = new DebtSimplifier().simplify(net);
            long nonZero = net.values().stream().filter(v -> v != 0).count();
            Check.that(pay.size() <= Math.max(0, nonZero - 1), "≤ N−1 payments");
            Map<UserId, Long> after = new HashMap<>(net);
            for (Payment x : pay) { after.merge(x.from(), x.amount(), Long::sum); after.merge(x.to(), -x.amount(), Long::sum); }
            Check.that(after.values().stream().allMatch(v -> v == 0), "payments settle everyone exactly");
        }

        // Concurrency: 8 threads add 1,000 expenses each; totals still consistent
        var shared = new ExpenseService(new SplitStrategies(), new BalanceSheet());
        var pool = Executors.newFixedThreadPool(8);
        List<Future<?>> fs = new ArrayList<>();
        for (int t = 0; t < 8; t++) fs.add(pool.submit(() -> {
            for (int i = 0; i < 1_000; i++) shared.addExpense(new ExpenseRequest(a, 300, List.of(a, b, c), SplitType.EQUAL, Map.of(), "tea"));
        }));
        for (var f : fs) f.get();
        pool.shutdown();
        Check.that(shared.owes(b, a) == 8_000L * 100 && shared.owes(c, a) == 8_000L * 100, "8,000 × ₹1 owed by each of B and C");

        Check.done("splitwise");
    }
}

record UserId(String value) { }
record ExpenseId(long value) { }
enum SplitType { EQUAL, EXACT, PERCENT, SHARES }

record ExpenseRequest(UserId paidBy, long amountPaise, List<UserId> participants,
                      SplitType type, Map<UserId, Long> values,   // exact paise, percent×100, or shares
                      String description) { }

record Split(UserId user, long amountPaise) { }
record Expense(ExpenseId id, ExpenseRequest request, List<Split> splits) {
    UserId paidBy() { return request.paidBy(); }
}
record Payment(UserId from, UserId to, long amount) { }

class InvalidSplitException extends RuntimeException { InvalidSplitException(String m) { super(m); } }

interface SplitStrategy {
    List<Split> split(ExpenseRequest req);           // validates and computes; parts sum to the total
}

final class Splits {
    static long[] splitEqually(long totalPaise, int n) {
        long base = totalPaise / n, remainder = totalPaise % n;
        long[] parts = new long[n];
        for (int i = 0; i < n; i++) parts[i] = base + (i < remainder ? 1 : 0);
        return parts;                                   // ₹100.00 / 3 → 3334, 3333, 3333 paise
    }

    /** Hamilton's method: floor each share, then give leftover paise to the largest fractional remainders. */
    static List<Split> largestRemainder(ExpenseRequest r, Map<UserId, Long> weights, long totalWeight) {
        List<UserId> people = r.participants();
        long[] parts = new long[people.size()];
        long[] remainders = new long[people.size()];
        long allocated = 0;
        for (int i = 0; i < people.size(); i++) {
            long w = weights.getOrDefault(people.get(i), 0L);
            long numerator = Math.multiplyExact(r.amountPaise(), w);
            parts[i] = numerator / totalWeight;
            remainders[i] = numerator % totalWeight;
            allocated += parts[i];
        }
        Integer[] order = new Integer[people.size()];
        for (int i = 0; i < order.length; i++) order[i] = i;
        Arrays.sort(order, (x, y) -> remainders[y] != remainders[x] ? Long.compare(remainders[y], remainders[x]) : Integer.compare(x, y));
        for (int k = 0; k < r.amountPaise() - allocated; k++) parts[order[k]]++;
        List<Split> out = new ArrayList<>();
        for (int i = 0; i < people.size(); i++) out.add(new Split(people.get(i), parts[i]));
        return out;
    }

    static long sumOf(ExpenseRequest r) {
        return r.participants().stream().mapToLong(u -> r.values().getOrDefault(u, 0L)).sum();
    }
}

final class EqualSplit implements SplitStrategy {
    public List<Split> split(ExpenseRequest r) {
        long[] parts = Splits.splitEqually(r.amountPaise(), r.participants().size());
        List<Split> out = new ArrayList<>();
        for (int i = 0; i < parts.length; i++) out.add(new Split(r.participants().get(i), parts[i]));
        return out;
    }
}

final class ExactSplit implements SplitStrategy {
    public List<Split> split(ExpenseRequest r) {
        long sum = Splits.sumOf(r);
        if (sum != r.amountPaise())
            throw new InvalidSplitException("Exact amounts sum to " + sum + ", expected " + r.amountPaise());
        return r.participants().stream().map(u -> new Split(u, r.values().get(u))).toList();
    }
}

final class PercentSplit implements SplitStrategy {
    public List<Split> split(ExpenseRequest r) {
        if (Splits.sumOf(r) != 10_000) throw new InvalidSplitException("Percentages must total 100");   // basis points
        return Splits.largestRemainder(r, r.values(), 10_000);
    }
}

final class ShareSplit implements SplitStrategy {
    public List<Split> split(ExpenseRequest r) {
        long totalShares = Splits.sumOf(r);
        if (totalShares <= 0) throw new InvalidSplitException("Shares must be positive");
        return Splits.largestRemainder(r, r.values(), totalShares);
    }
}

final class SplitStrategies {
    private final Map<SplitType, SplitStrategy> byType = new EnumMap<>(Map.of(
            SplitType.EQUAL, new EqualSplit(), SplitType.EXACT, new ExactSplit(),
            SplitType.PERCENT, new PercentSplit(), SplitType.SHARES, new ShareSplit()));
    SplitStrategy forType(SplitType t) { return byType.get(t); }
}

final class BalanceSheet {
    // owes.get(a).get(b) = amount a owes b (always positive; only one direction stored per pair)
    private final Map<UserId, Map<UserId, Long>> owes = new HashMap<>();

    synchronized void apply(Expense e) {
        for (Split s : e.splits()) {
            if (!s.user().equals(e.paidBy())) addDebt(s.user(), e.paidBy(), s.amountPaise());
        }
    }

    synchronized void settle(UserId from, UserId to, long amount) {
        addDebt(to, from, amount);                    // paying reduces from's debt (or creates the reverse)
    }

    synchronized void addDebt(UserId debtor, UserId creditor, long amount) {
        long reverse = get(creditor, debtor);
        if (reverse >= amount) {                       // net against the opposite debt
            put(creditor, debtor, reverse - amount);
        } else {
            put(creditor, debtor, 0);
            put(debtor, creditor, get(debtor, creditor) + amount - reverse);
        }
    }

    /** Positive = others owe this user; negative = this user owes others. */
    synchronized Map<UserId, Long> netBalances() {
        Map<UserId, Long> net = new HashMap<>();
        owes.forEach((debtor, m) -> m.forEach((creditor, amt) -> {
            net.merge(debtor, -amt, Long::sum);
            net.merge(creditor, amt, Long::sum);
        }));
        return net;
    }

    synchronized long owes(UserId a, UserId b) { return get(a, b); }

    private long get(UserId a, UserId b) { return owes.getOrDefault(a, Map.of()).getOrDefault(b, 0L); }
    private void put(UserId a, UserId b, long v) {
        if (v == 0) { Map<UserId, Long> m = owes.get(a); if (m != null) m.remove(b); }
        else owes.computeIfAbsent(a, k -> new HashMap<>()).put(b, v);
    }
}

final class ExpenseService {
    private final SplitStrategies strategies;
    private final BalanceSheet balances;
    private final Map<ExpenseId, Expense> expenses = new ConcurrentHashMap<>();
    private final AtomicLong ids = new AtomicLong();

    ExpenseService(SplitStrategies strategies, BalanceSheet balances) { this.strategies = strategies; this.balances = balances; }

    Expense addExpense(ExpenseRequest req) {
        validate(req);
        List<Split> splits = strategies.forType(req.type()).split(req);
        Expense expense = new Expense(new ExpenseId(ids.incrementAndGet()), req, List.copyOf(splits));
        expenses.put(expense.id(), expense);
        balances.apply(expense);
        return expense;
    }

    void settle(UserId from, UserId to, long amount) {
        if (amount <= 0) throw new IllegalArgumentException("amount must be positive");
        balances.settle(from, to, amount);
    }

    Map<UserId, Long> netBalances() { return balances.netBalances(); }
    long owes(UserId a, UserId b) { return balances.owes(a, b); }

    private void validate(ExpenseRequest r) {
        if (r.amountPaise() <= 0) throw new IllegalArgumentException("amount must be positive");
        if (r.participants().isEmpty()) throw new IllegalArgumentException("at least one participant");
        if (new HashSet<>(r.participants()).size() != r.participants().size()) throw new IllegalArgumentException("duplicate participants");
    }
}

final class DebtSimplifier {
    List<Payment> simplify(Map<UserId, Long> net) {
        PriorityQueue<Map.Entry<UserId, Long>> creditors = new PriorityQueue<>((x, y) -> Long.compare(y.getValue(), x.getValue()));
        PriorityQueue<Map.Entry<UserId, Long>> debtors   = new PriorityQueue<>((x, y) -> Long.compare(x.getValue(), y.getValue()));
        net.forEach((u, v) -> {
            if (v > 0) creditors.add(Map.entry(u, v));
            else if (v < 0) debtors.add(Map.entry(u, v));
        });

        List<Payment> payments = new ArrayList<>();
        while (!creditors.isEmpty() && !debtors.isEmpty()) {
            var c = creditors.poll(); var d = debtors.poll();
            long amount = Math.min(c.getValue(), -d.getValue());
            payments.add(new Payment(d.getKey(), c.getKey(), amount));
            if (c.getValue() - amount > 0) creditors.add(Map.entry(c.getKey(), c.getValue() - amount));
            if (d.getValue() + amount < 0) debtors.add(Map.entry(d.getKey(), d.getValue() + amount));
        }
        return payments;
    }
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
