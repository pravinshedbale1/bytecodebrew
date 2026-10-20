// Design an ATM — the interview-sized version from the top of the lesson.
// Run: java lld-java/atm/AtmInterview.java
import java.util.*;

public class AtmInterview {
    static final class FakeBank implements Bank {
        final Map<String, Integer> balances = new HashMap<>(Map.of("card-1", 10_000));
        public boolean checkPin(String card, String pin) { return pin.equals("1234"); }
        public void debit(String card, int amount) {
            int b = balances.get(card);
            if (b < amount) throw new IllegalStateException("Insufficient funds");
            balances.put(card, b - amount);
        }
    }

    public static void main(String[] args) {
        var bank = new FakeBank();
        var atm = new Atm(bank, new CashBox(Map.of(500, 4, 100, 5)));
        fails(() -> atm.enterPin("1234"), "PIN before card");
        atm.insertCard("card-1");
        fails(() -> atm.withdraw(100), "withdraw before PIN");
        fails(() -> atm.enterPin("0000"), "wrong PIN");
        atm.enterPin("1234");
        check(atm.withdraw(1_300).equals(Map.of(500, 2, 100, 3)), "largest notes first");
        check(bank.balances.get("card-1") == 8_700, "account debited");
        fails(() -> atm.withdraw(150), "amount the notes can't make");
        check(bank.balances.get("card-1") == 8_700, "no debit when notes can't be given");
        fails(() -> atm.withdraw(9_000), "more than the bank allows");
        atm.eject();
        atm.insertCard("card-1");
        fails(() -> atm.enterPin("1"), "wrong 1");
        fails(() -> atm.enterPin("2"), "wrong 2");
        fails(() -> atm.enterPin("3"), "third wrong PIN retains the card");
        fails(() -> atm.enterPin("1234"), "card is gone, back to idle");
        done("atm");
    }

    static int passed;
    static void check(boolean ok, String what) { if (!ok) throw new AssertionError("FAILED: " + what); passed++; }
    static void fails(Runnable r, String what) { try { r.run(); } catch (RuntimeException e) { passed++; return; } throw new AssertionError("FAILED (no exception): " + what); }
    static void done(String name) { System.out.println("✓ " + name + " (interview version): " + passed + " checks passed"); }
}

// ---- lesson excerpt: everything below is shown in the lesson
interface Bank {                                         // the real bank is behind an interface
    boolean checkPin(String card, String pin);
    void debit(String card, int amount);                 // throws if the account can't pay
}

class CashBox {
    private final TreeMap<Integer, Integer> notes = new TreeMap<>(Comparator.reverseOrder());   // ₹500 before ₹100

    CashBox(Map<Integer, Integer> notes) { this.notes.putAll(notes); }

    Map<Integer, Integer> plan(int amount) {             // which notes to give; changes nothing
        Map<Integer, Integer> plan = new LinkedHashMap<>();
        for (var e : notes.entrySet()) {
            int count = Math.min(amount / e.getKey(), e.getValue());
            if (count > 0) { plan.put(e.getKey(), count); amount -= count * e.getKey(); }
        }
        if (amount != 0) throw new IllegalStateException("Can't make this amount with the notes available");
        return plan;
    }

    void remove(Map<Integer, Integer> plan) { plan.forEach((note, count) -> notes.merge(note, -count, Integer::sum)); }
}

interface AtmState {
    default void insertCard(Atm atm, String card)          { throw new IllegalStateException("Not allowed now"); }
    default void enterPin(Atm atm, String pin)             { throw new IllegalStateException("Insert a card first"); }
    default Map<Integer, Integer> withdraw(Atm atm, int a) { throw new IllegalStateException("Enter your PIN first"); }
    default void eject(Atm atm) { atm.card = null; atm.state = new Idle(); }
}

class Idle implements AtmState {
    public void insertCard(Atm atm, String card) { atm.card = card; atm.state = new CardInserted(); }
    public void eject(Atm atm) { throw new IllegalStateException("No card"); }
}

class CardInserted implements AtmState {
    private int wrongTries;
    public void enterPin(Atm atm, String pin) {
        if (atm.bank.checkPin(atm.card, pin)) { atm.state = new Authenticated(); return; }
        if (++wrongTries == 3) { atm.card = null; atm.state = new Idle(); throw new IllegalStateException("Card retained"); }
        throw new IllegalArgumentException("Wrong PIN");
    }
}

class Authenticated implements AtmState {
    public Map<Integer, Integer> withdraw(Atm atm, int amount) {
        Map<Integer, Integer> notes = atm.cash.plan(amount);   // 1. check we can give the notes
        atm.bank.debit(atm.card, amount);                      // 2. only then take the money
        atm.cash.remove(notes);                                // 3. dispense
        return notes;
    }
}

class Atm {                                              // the context: forwards each action to its state
    AtmState state = new Idle();
    String card;
    final Bank bank;
    final CashBox cash;

    Atm(Bank bank, CashBox cash) { this.bank = bank; this.cash = cash; }
    synchronized void insertCard(String card) { state.insertCard(this, card); }
    synchronized void enterPin(String pin) { state.enterPin(this, pin); }
    synchronized Map<Integer, Integer> withdraw(int amount) { return state.withdraw(this, amount); }
    synchronized void eject() { state.eject(this); }
}
