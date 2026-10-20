// Design a Vending Machine — the interview-sized version from the top of the lesson.
// Run: java lld-java/vending-machine/VendingMachineInterview.java
import java.util.*;

public class VendingMachineInterview {
    public static void main(String[] args) {
        var m = new VendingMachine();
        m.addProduct("A1", new Product("Chips", 20, 1));
        fails(() -> m.select("A1"), "select before paying");
        m.insertCoin(10);
        fails(() -> m.select("A1"), "not enough money");
        m.insertCoin(20);
        check(m.select("A1") == 10, "change returned");
        m.insertCoin(50);
        fails(() -> m.select("A1"), "sold out");
        check(m.cancel() == 50, "cancel refunds the balance");
        fails(m::cancel, "nothing to cancel when idle");
        m.insertCoin(5);
        fails(() -> m.select("Z9"), "unknown product");
        check(m.cancel() == 5, "money kept after a failed selection");
        done("vending-machine");
    }

    static int passed;
    static void check(boolean ok, String what) { if (!ok) throw new AssertionError("FAILED: " + what); passed++; }
    static void fails(Runnable r, String what) { try { r.run(); } catch (RuntimeException e) { passed++; return; } throw new AssertionError("FAILED (no exception): " + what); }
    static void done(String name) { System.out.println("✓ " + name + " (interview version): " + passed + " checks passed"); }
}

// ---- lesson excerpt: everything below is shown in the lesson
class Product {
    final String name;
    final int price;
    int stock;
    Product(String name, int price, int stock) { this.name = name; this.price = price; this.stock = stock; }
}

interface State {                                  // each action is "not allowed" unless a state allows it
    default void insertCoin(VendingMachine m, int amount) { throw new IllegalStateException("Can't insert coins now"); }
    default int select(VendingMachine m, String code)      { throw new IllegalStateException("Insert money first"); }
    default int cancel(VendingMachine m)                   { throw new IllegalStateException("Nothing to cancel"); }
}

class Idle implements State {
    public void insertCoin(VendingMachine m, int amount) { m.balance += amount; m.state = new HasMoney(); }
}

class HasMoney implements State {
    public void insertCoin(VendingMachine m, int amount) { m.balance += amount; }

    public int select(VendingMachine m, String code) {
        Product p = m.products.get(code);
        if (p == null) throw new IllegalArgumentException("No product " + code);
        if (p.stock == 0) throw new IllegalStateException(p.name + " is sold out");
        if (m.balance < p.price) throw new IllegalStateException("Insert ₹" + (p.price - m.balance) + " more");
        p.stock--;
        int change = m.balance - p.price;
        m.balance = 0;
        m.state = new Idle();
        return change;
    }

    public int cancel(VendingMachine m) {
        int refund = m.balance;
        m.balance = 0;
        m.state = new Idle();
        return refund;
    }
}

class VendingMachine {                             // the context: it just forwards to the current state
    final Map<String, Product> products = new HashMap<>();
    State state = new Idle();
    int balance;

    void addProduct(String code, Product p) { products.put(code, p); }
    synchronized void insertCoin(int amount) { state.insertCoin(this, amount); }
    synchronized int select(String code)    { return state.select(this, code); }
    synchronized int cancel()               { return state.cancel(this); }
}
