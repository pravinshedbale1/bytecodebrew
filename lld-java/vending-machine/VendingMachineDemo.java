// Design a Vending Machine — runnable reference solution for the lesson.
// Run: java lld-java/vending-machine/VendingMachineDemo.java
import java.util.*;

public class VendingMachineDemo {
    public static void main(String[] args) {
        var hw = new RecordingHardware();
        var inventory = new Inventory();
        inventory.addProduct(new Product("A1", "Chips", 20), 2);
        inventory.addProduct(new Product("B1", "Soda", 35), 1);
        var cash = new CashBox(new BoundedChange());
        cash.add(List.of(Denomination.FIVE, Denomination.FIVE, Denomination.TWO, Denomination.TWO, Denomination.TWO,
                         Denomination.TEN, Denomination.TEN, Denomination.TWENTY));
        var m = new VendingMachine(inventory, cash, hw);

        // Happy path with change
        m.insert(Denomination.FIFTY);
        m.select("A1");
        Check.that(hw.dropped.equals(List.of("A1")), "chips dispensed");
        Check.that(total(hw.returned.getLast()) == 30, "₹30 change returned");
        Check.that(m.stateName().equals("IDLE"), "back to IDLE");

        // Not enough money: stays in HAS_MONEY, then cancel refunds
        m.insert(Denomination.TWENTY);
        Check.throwsEx(InsufficientFundsException.class, () -> m.select("B1"), "₹20 is not enough for ₹35");
        Check.that(m.stateName().equals("HAS_MONEY"), "still HAS_MONEY after insufficient funds");
        m.cancel();
        Check.that(total(hw.returned.getLast()) == 20, "cancel refunds ₹20");

        // Invalid operations per state
        Check.throwsEx(IllegalOperationException.class, () -> m.select("A1"), "select without money is rejected");
        Check.throwsEx(UnknownProductException.class, () -> { m.insert(Denomination.TEN); m.select("Z9"); }, "unknown code rejected");
        m.cancel();

        // Greedy fails here: owe 6 with one ₹5 and three ₹2 — the bounded search finds 2+2+2
        var tricky = new CashBox(new BoundedChange());
        tricky.add(List.of(Denomination.FIVE, Denomination.TWO, Denomination.TWO, Denomination.TWO));
        Check.that(new GreedyChange().compute(6, Map.of(Denomination.FIVE, 1, Denomination.TWO, 3)).isEmpty(), "greedy fails to make 6");
        Check.that(tricky.planChange(6).map(VendingMachineDemo::total).orElse(-1) == 6, "bounded search makes 6 as 2+2+2");

        // Exact change unavailable: sale refused, coins stay refundable
        var inv2 = new Inventory();
        inv2.addProduct(new Product("C1", "Gum", 3), 5);
        var m2 = new VendingMachine(inv2, new CashBox(new BoundedChange()), new RecordingHardware());
        m2.insert(Denomination.TEN);
        Check.throwsEx(ExactChangeRequiredException.class, () -> m2.select("C1"), "no change for ₹7");
        Check.that(m2.stateName().equals("HAS_MONEY") && m2.cashBoxTotal() == 0, "inserted coins taken back out of the cash box");

        // Sold out
        m.insert(Denomination.FIFTY);
        m.select("B1");
        m.insert(Denomination.FIFTY);
        Check.throwsEx(SoldOutException.class, () -> m.select("B1"), "B1 sold out");
        m.cancel();

        // Maintenance only from IDLE; customer operations rejected and money refunded
        m.insert(Denomination.TEN);
        Check.throwsEx(IllegalOperationException.class, m::startMaintenance, "maintenance rejected mid-sale");
        m.cancel();
        m.startMaintenance();
        int refundsBefore = hw.returned.size();
        Check.throwsEx(IllegalOperationException.class, () -> m.insert(Denomination.TEN), "insert rejected in maintenance");
        Check.that(hw.returned.size() == refundsBefore + 1, "coin inserted during maintenance is returned");
        m.finishMaintenance();
        Check.that(m.stateName().equals("IDLE"), "maintenance → IDLE");

        Check.done("vending-machine");
    }

    static int total(Map<Denomination, Integer> coins) {
        return coins.entrySet().stream().mapToInt(e -> e.getKey().value() * e.getValue()).sum();
    }
}

enum Denomination {
    ONE(1), TWO(2), FIVE(5), TEN(10), TWENTY(20), FIFTY(50), HUNDRED(100);
    private final int value;
    Denomination(int v) { this.value = v; }
    int value() { return value; }
}

record Product(String code, String name, int price) { }

class VendingException extends RuntimeException { VendingException(String m) { super(m); } }
class IllegalOperationException extends VendingException {
    IllegalOperationException(String op, String state) { super("Cannot " + op + " while " + state); }
    IllegalOperationException(String m) { super(m); }
}
class UnknownProductException extends VendingException { UnknownProductException(String c) { super("Unknown product " + c); } }
class SoldOutException extends VendingException { SoldOutException(String c) { super("Sold out: " + c); } }
class InsufficientFundsException extends VendingException { InsufficientFundsException(int due) { super("Insert ₹" + due + " more"); } }
class ExactChangeRequiredException extends VendingException { ExactChangeRequiredException() { super("Exact change only"); } }

final class Inventory {
    private final Map<String, Product> products = new HashMap<>();
    private final Map<String, Integer> stock = new HashMap<>();

    void addProduct(Product p, int qty) { products.put(p.code(), p); stock.merge(p.code(), qty, Integer::sum); }
    Product product(String code) {
        Product p = products.get(code);
        if (p == null) throw new UnknownProductException(code);
        return p;
    }
    boolean isAvailable(String code) { return stock.getOrDefault(code, 0) > 0; }
    void removeOne(String code) {
        stock.computeIfPresent(code, (k, n) -> {
            if (n <= 0) throw new SoldOutException(code);
            return n - 1;
        });
    }
}

interface ChangeStrategy {
    Optional<Map<Denomination, Integer>> compute(int amount, Map<Denomination, Integer> available);
}

/** Greedy with availability limits — fine for canonical systems with plenty of coins. */
final class GreedyChange implements ChangeStrategy {
    public Optional<Map<Denomination, Integer>> compute(int amount, Map<Denomination, Integer> available) {
        Map<Denomination, Integer> result = new EnumMap<>(Denomination.class);
        List<Denomination> desc = new ArrayList<>(List.of(Denomination.values()));
        Collections.reverse(desc);
        for (Denomination d : desc) {
            int use = Math.min(amount / d.value(), available.getOrDefault(d, 0));
            if (use > 0) { result.put(d, use); amount -= use * d.value(); }
        }
        return amount == 0 ? Optional.of(result) : Optional.empty();
    }
}

/** Bounded coin change: fewest coins using only what is in the box. O(amount × coins in box). */
final class BoundedChange implements ChangeStrategy {
    public Optional<Map<Denomination, Integer>> compute(int amount, Map<Denomination, Integer> available) {
        int[] best = new int[amount + 1];                  // fewest coins to make each sum
        Denomination[] lastCoin = new Denomination[amount + 1];
        int[] prev = new int[amount + 1];
        Arrays.fill(best, Integer.MAX_VALUE);
        best[0] = 0;
        for (Denomination d : Denomination.values()) {
            int count = available.getOrDefault(d, 0);
            for (int k = 0; k < count; k++) {              // each physical coin can be used once
                for (int s = amount; s >= d.value(); s--) {
                    int from = s - d.value();
                    if (best[from] != Integer.MAX_VALUE && best[from] + 1 < best[s]) {
                        best[s] = best[from] + 1; lastCoin[s] = d; prev[s] = from;
                    }
                }
            }
        }
        if (best[amount] == Integer.MAX_VALUE) return Optional.empty();
        Map<Denomination, Integer> plan = new EnumMap<>(Denomination.class);
        for (int s = amount; s > 0; s = prev[s]) plan.merge(lastCoin[s], 1, Integer::sum);
        return Optional.of(plan);
    }
}

final class CashBox {
    private final EnumMap<Denomination, Integer> counts = new EnumMap<>(Denomination.class);
    private final ChangeStrategy changeStrategy;

    CashBox(ChangeStrategy s) { this.changeStrategy = s; }

    void add(Collection<Denomination> money) { money.forEach(d -> counts.merge(d, 1, Integer::sum)); }

    /** Plans change without committing; returns empty if impossible. */
    Optional<Map<Denomination, Integer>> planChange(int amount) {
        if (amount == 0) return Optional.of(Map.of());
        return changeStrategy.compute(amount, Collections.unmodifiableMap(counts));
    }

    void dispense(Map<Denomination, Integer> plan) {
        plan.forEach((d, n) -> {
            int have = counts.getOrDefault(d, 0);
            if (have < n) throw new IllegalStateException("Not enough " + d);
            counts.put(d, have - n);
        });
    }

    int total() { return counts.entrySet().stream().mapToInt(e -> e.getKey().value() * e.getValue()).sum(); }
}

interface Hardware {
    void dropProduct(String code);
    void returnMoney(Map<Denomination, Integer> coins);
}

final class RecordingHardware implements Hardware {
    final List<String> dropped = new ArrayList<>();
    final List<Map<Denomination, Integer>> returned = new ArrayList<>();
    public void dropProduct(String code) { dropped.add(code); }
    public void returnMoney(Map<Denomination, Integer> coins) { returned.add(Map.copyOf(coins)); }
}

interface State {
    default void insert(VendingMachine m, Denomination d) { throw new IllegalOperationException("insert money", name()); }
    default void select(VendingMachine m, String code)    { throw new IllegalOperationException("select", name()); }
    default void cancel(VendingMachine m)                 { throw new IllegalOperationException("cancel", name()); }
    default void startMaintenance(VendingMachine m)       { throw new IllegalOperationException("start maintenance", name()); }
    default void finishMaintenance(VendingMachine m)      { throw new IllegalOperationException("finish maintenance", name()); }
    String name();

    static Map<Denomination, Integer> toCounts(List<Denomination> coins) {
        Map<Denomination, Integer> counts = new EnumMap<>(Denomination.class);
        coins.forEach(d -> counts.merge(d, 1, Integer::sum));
        return counts;
    }
}

final class IdleState implements State {
    public void insert(VendingMachine m, Denomination d) { m.addInserted(d); m.transitionTo(m.hasMoney()); }
    public void select(VendingMachine m, String code)    { throw new IllegalOperationException("Insert money first"); }
    public void cancel(VendingMachine m)                 { /* nothing to refund */ }
    public void startMaintenance(VendingMachine m)       { m.transitionTo(m.maintenance()); }
    public String name() { return "IDLE"; }
}

final class HasMoneyState implements State {
    public void insert(VendingMachine m, Denomination d) { m.addInserted(d); }

    public void select(VendingMachine m, String code) {
        Product p = m.inventory().product(code);
        if (!m.inventory().isAvailable(code)) throw new SoldOutException(code);

        int paid = m.insertedTotal();
        if (paid < p.price()) throw new InsufficientFundsException(p.price() - paid);   // stay in HasMoney

        // Plan change against the cash box *including* the coins just inserted
        m.cashBox().add(m.inserted());
        Optional<Map<Denomination, Integer>> change = m.cashBox().planChange(paid - p.price());
        if (change.isEmpty()) {
            m.cashBox().dispense(State.toCounts(m.inserted()));   // take the inserted coins back out
            throw new ExactChangeRequiredException();             // user can cancel or add exact amount
        }

        m.transitionTo(m.dispensing());
        m.inventory().removeOne(code);
        m.cashBox().dispense(change.get());
        m.hardware().dropProduct(code);
        m.hardware().returnMoney(change.get());
        m.clearInserted();
        m.transitionTo(m.idle());
    }

    public void cancel(VendingMachine m) {
        m.hardware().returnMoney(State.toCounts(m.inserted()));
        m.clearInserted();
        m.transitionTo(m.idle());
    }
    public String name() { return "HAS_MONEY"; }
}

/** Transient while the motor runs; every customer action is rejected (defaults). */
final class DispensingState implements State {
    public String name() { return "DISPENSING"; }
}

final class MaintenanceState implements State {
    public void insert(VendingMachine m, Denomination d) {
        m.hardware().returnMoney(State.toCounts(List.of(d)));     // give the coin straight back
        throw new IllegalOperationException("insert money", name());
    }
    public void cancel(VendingMachine m) { }
    public void finishMaintenance(VendingMachine m) { m.transitionTo(m.idle()); }
    public String name() { return "MAINTENANCE"; }
}

final class VendingMachine {
    private final State idle = new IdleState(), hasMoney = new HasMoneyState(),
                        dispensing = new DispensingState(), maintenance = new MaintenanceState();
    private final Inventory inventory;
    private final CashBox cashBox;
    private final Hardware hardware;
    private final List<Denomination> inserted = new ArrayList<>();
    private State state = idle;

    VendingMachine(Inventory inventory, CashBox cashBox, Hardware hardware) {
        this.inventory = inventory; this.cashBox = cashBox; this.hardware = hardware;
    }

    // Public API: one lock serialises user and admin operations
    public synchronized void insert(Denomination d)   { state.insert(this, d); }
    public synchronized void select(String code)      { state.select(this, code); }
    public synchronized void cancel()                 { state.cancel(this); }
    public synchronized void startMaintenance()       { state.startMaintenance(this); }
    public synchronized void finishMaintenance()      { state.finishMaintenance(this); }
    public synchronized String stateName()            { return state.name(); }
    public synchronized int cashBoxTotal()            { return cashBox.total(); }

    // Hooks for states (package-private)
    void transitionTo(State s) { state = s; }
    void addInserted(Denomination d) { inserted.add(d); }
    int insertedTotal() { return inserted.stream().mapToInt(Denomination::value).sum(); }
    List<Denomination> inserted() { return List.copyOf(inserted); }
    void clearInserted() { inserted.clear(); }
    State idle() { return idle; }
    State hasMoney() { return hasMoney; }
    State dispensing() { return dispensing; }
    State maintenance() { return maintenance; }
    Inventory inventory() { return inventory; }
    CashBox cashBox() { return cashBox; }
    Hardware hardware() { return hardware; }
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
