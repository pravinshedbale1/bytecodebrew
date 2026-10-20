// Design Splitwise — the interview-sized version from the top of the lesson.
// Run: java lld-java/splitwise/SplitwiseInterview.java
import java.util.*;

public class SplitwiseInterview {
    public static void main(String[] args) {
        var s = new ExpenseService();
        // Asha pays ₹100.00 for three people: 3334 + 3333 + 3333 paise
        Map<String, Long> eq = new EqualSplit().split(10_000, List.of("asha", "ravi", "meera"), List.of());
        check(eq.values().stream().mapToLong(Long::longValue).sum() == 10_000 && eq.get("asha") == 3334, "leftover paise are spread, total kept");
        s.addExpense("asha", 10_000, List.of("asha", "ravi", "meera"), List.of(), new EqualSplit());
        check(s.owes("ravi", "asha") == 3333, "ravi owes asha");
        s.addExpense("ravi", 5_000, List.of("asha", "ravi"), List.of(2_000L, 3_000L), new ExactSplit());
        check(s.owes("ravi", "asha") == 1333, "balances net off in both directions");
        s.addExpense("meera", 20_000, List.of("asha", "meera"), List.of(25L, 75L), new PercentSplit());
        check(s.owes("asha", "meera") == 5_000 - 3333, "percent split nets against the earlier debt");
        check(s.owes("meera", "asha") == 0, "only one direction is positive");
        fails(() -> new ExactSplit().split(100, List.of("a", "b"), List.of(30L, 30L)), "exact amounts must add up");
        fails(() -> new PercentSplit().split(100, List.of("a", "b"), List.of(50L, 40L)), "percentages must add up to 100");
        Map<String, Long> pct = new PercentSplit().split(100, List.of("a", "b", "c"), List.of(33L, 33L, 34L));
        check(pct.values().stream().mapToLong(Long::longValue).sum() == 100, "percent split keeps the total");
        done("splitwise");
    }

    static int passed;
    static void check(boolean ok, String what) { if (!ok) throw new AssertionError("FAILED: " + what); passed++; }
    static void fails(Runnable r, String what) { try { r.run(); } catch (RuntimeException e) { passed++; return; } throw new AssertionError("FAILED (no exception): " + what); }
    static void done(String name) { System.out.println("✓ " + name + " (interview version): " + passed + " checks passed"); }
}

// ---- lesson excerpt: everything below is shown in the lesson
// Amounts are in paise (long), so ₹100 split three ways never loses a paisa to rounding.
interface SplitStrategy { Map<String, Long> split(long total, List<String> people, List<Long> values); }

class EqualSplit implements SplitStrategy {
    public Map<String, Long> split(long total, List<String> people, List<Long> ignored) {
        Map<String, Long> shares = new LinkedHashMap<>();
        long base = total / people.size(), leftover = total % people.size();
        for (int i = 0; i < people.size(); i++) shares.put(people.get(i), base + (i < leftover ? 1 : 0));
        return shares;
    }
}

class ExactSplit implements SplitStrategy {
    public Map<String, Long> split(long total, List<String> people, List<Long> amounts) {
        if (amounts.stream().mapToLong(Long::longValue).sum() != total) throw new IllegalArgumentException("Amounts must add up to the total");
        Map<String, Long> shares = new LinkedHashMap<>();
        for (int i = 0; i < people.size(); i++) shares.put(people.get(i), amounts.get(i));
        return shares;
    }
}

class PercentSplit implements SplitStrategy {
    public Map<String, Long> split(long total, List<String> people, List<Long> percents) {
        if (percents.stream().mapToLong(Long::longValue).sum() != 100) throw new IllegalArgumentException("Percentages must add up to 100");
        Map<String, Long> shares = new LinkedHashMap<>();
        long given = 0;
        for (int i = 0; i < people.size(); i++) {
            long share = i == people.size() - 1 ? total - given : total * percents.get(i) / 100;   // last person takes the rounding
            shares.put(people.get(i), share);
            given += share;
        }
        return shares;
    }
}

class ExpenseService {
    // balance.get(a).get(b) = how much b owes a (negative means a owes b)
    private final Map<String, Map<String, Long>> balance = new HashMap<>();

    synchronized void addExpense(String paidBy, long total, List<String> people, List<Long> values, SplitStrategy strategy) {
        strategy.split(total, people, values).forEach((person, share) -> {
            if (person.equals(paidBy)) return;
            add(paidBy, person, share);
            add(person, paidBy, -share);
        });
    }

    synchronized long owes(String debtor, String creditor) {
        long amount = balance.getOrDefault(creditor, Map.of()).getOrDefault(debtor, 0L);
        return Math.max(0, amount);
    }

    private void add(String a, String b, long amount) {
        balance.computeIfAbsent(a, k -> new HashMap<>()).merge(b, amount, Long::sum);
    }
}
