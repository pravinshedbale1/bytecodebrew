// Design an ATM — runnable reference solution for the lesson.
// Run: java lld-java/atm/AtmDemo.java
import java.util.*;
import java.util.concurrent.atomic.AtomicLong;

public class AtmDemo {
    public static void main(String[] args) {
        var bank = new FakeBank();
        var card = new Card("4000-1111");
        bank.open(card, "1234", new AccountId("ACC-1"), 50_000);
        var hw = new FakeCashHardware();
        var atm = new Atm(new CashDispenser(chain(2, 10, 20), hw), bank, new FakeCardReader());

        // Wrong PIN twice, then right
        atm.insertCard(card);
        Check.throwsEx(InvalidPinException.class, () -> atm.enterPin("0000"), "wrong PIN 1");
        Check.throwsEx(InvalidPinException.class, () -> atm.enterPin("1111"), "wrong PIN 2");
        atm.enterPin("1234");
        Check.that(atm.stateName().equals("AUTHENTICATED"), "authenticated on the 3rd try");

        // Withdraw: plan → debit → dispense
        atm.withdraw(4_600);
        Check.that(hw.lastDispensed.equals(Map.of(2000, 2, 500, 1, 100, 1)), "4600 = 2×2000 + 500 + 100");
        Check.that(bank.balance(new AccountId("ACC-1")) == 45_400, "account debited once");
        Check.throwsEx(InvalidAmountException.class, () -> atm.withdraw(150), "multiples of 100 only");
        Check.throwsEx(LimitExceededException.class, () -> atm.withdraw(36_000), "daily limit (40,000) checked before anything else");
        Check.throwsEx(CashUnavailableException.class, () -> atm.withdraw(20_000), "machine holds only 6,400 now");
        atm.cancel();

        // Bank declines: low balance
        var poor = new Card("4000-2222");
        bank.open(poor, "9999", new AccountId("ACC-2"), 300);
        var atmPoor = new Atm(new CashDispenser(chain(5, 5, 5), new FakeCashHardware()), bank, new FakeCardReader());
        atmPoor.insertCard(poor); atmPoor.enterPin("9999");
        Check.throwsEx(TransactionDeclinedException.class, () -> atmPoor.withdraw(500), "insufficient funds declined by the bank");
        Check.that(atm.stateName().equals("IDLE"), "cancel ejects the card");
        Check.throwsEx(IllegalOperationException.class, () -> atm.withdraw(100), "no withdraw without a card");

        // Three wrong PINs → card retained
        var reader = new FakeCardReader();
        var atm2 = new Atm(new CashDispenser(chain(5, 5, 5), new FakeCashHardware()), bank, reader);
        atm2.insertCard(card);
        Check.throwsEx(InvalidPinException.class, () -> atm2.enterPin("1"), "1");
        Check.throwsEx(InvalidPinException.class, () -> atm2.enterPin("2"), "2");
        Check.throwsEx(CardRetainedException.class, () -> atm2.enterPin("3"), "third failure retains the card");
        Check.that(reader.retained == 1 && atm2.stateName().equals("IDLE"), "card kept, session ended");

        // Dispense failure after a successful debit → reversal, out of service
        var broken = new FakeCashHardware();
        broken.failNext = true;
        var atm3 = new Atm(new CashDispenser(chain(5, 5, 5), broken), bank, new FakeCardReader());
        atm3.insertCard(card); atm3.enterPin("1234");
        long before = bank.balance(new AccountId("ACC-1"));
        Check.throwsEx(DispenseFailedException.class, () -> atm3.withdraw(1_000), "jam surfaces");
        Check.that(bank.balance(new AccountId("ACC-1")) == before, "debit reversed: never debited without cash");
        Check.that(atm3.stateName().equals("OUT_OF_SERVICE"), "machine taken out of service");

        // Bank timeout: unknown outcome → no dispense; reconcile by txn id
        bank.timeoutNextDebitAfterApplying = true;
        var hw4 = new FakeCashHardware();
        var atm4 = new Atm(new CashDispenser(chain(5, 5, 5), hw4), bank, new FakeCardReader());
        atm4.insertCard(card); atm4.enterPin("1234");
        long b4 = bank.balance(new AccountId("ACC-1"));
        Check.throwsEx(TransactionUncertainException.class, () -> atm4.withdraw(500), "timeout reported");
        Check.that(hw4.lastDispensed == null && bank.balance(new AccountId("ACC-1")) == b4, "nothing dispensed; the applied debit was reversed");

        // Idempotent debit: retrying with the same txn id does not double-debit
        var txn = new TxnId("T-retry");
        long b5 = bank.balance(new AccountId("ACC-1"));
        bank.debit(new AccountId("ACC-1"), 100, txn);
        bank.debit(new AccountId("ACC-1"), 100, txn);
        Check.that(bank.balance(new AccountId("ACC-1")) == b5 - 100, "same txn id debits once");

        // Greedy with availability limits: 600 with no ₹100 notes but ₹500s → impossible, nothing committed
        var hw6 = new FakeCashHardware();
        var dispenser = new CashDispenser(chain(0, 3, 0), hw6);
        Check.that(dispenser.plan(600).isEmpty() && dispenser.plan(1_500).isPresent(), "600 impossible, 1500 = 3×500");

        Check.done("atm");
    }

    static DenominationHandler chain(int twoThousands, int fiveHundreds, int hundreds) {
        return new DenominationHandler(2000, twoThousands,
               new DenominationHandler(500, fiveHundreds,
               new DenominationHandler(100, hundreds, null)));
    }
}

record Card(String number) { }
record AccountId(String value) { }
record TxnId(String value) {
    private static final AtomicLong SEQ = new AtomicLong();
    static TxnId newId() { return new TxnId("TXN-" + SEQ.incrementAndGet()); }
}
record AuthResult(boolean success, AccountId account) { }
record DebitResult(boolean success, String reason) { }

class AtmException extends RuntimeException { AtmException(String m) { super(m); } }
class InvalidPinException extends AtmException { InvalidPinException(int left) { super("Wrong PIN, " + left + " attempts left"); } }
class CardRetainedException extends AtmException { CardRetainedException() { super("Card retained"); } }
class InvalidAmountException extends AtmException { InvalidAmountException(String m) { super(m); } }
class LimitExceededException extends AtmException { LimitExceededException() { super("Daily limit exceeded"); } }
class CashUnavailableException extends AtmException { CashUnavailableException(long a) { super("Cannot dispense " + a); } }
class TransactionDeclinedException extends AtmException { TransactionDeclinedException(String r) { super("Declined: " + r); } }
class TransactionUncertainException extends AtmException { TransactionUncertainException() { super("Bank did not answer; transaction reversed"); } }
class DispenseFailedException extends AtmException { DispenseFailedException() { super("Dispenser jammed"); } }
class IllegalOperationException extends AtmException { IllegalOperationException(String op, String st) { super("Cannot " + op + " while " + st); } }
class BankTimeoutException extends RuntimeException { }

/** Chain of Responsibility over denominations: plan first, commit only if the whole amount works. */
final class DenominationHandler {
    private final int denomination;
    private int available;
    private final DenominationHandler next;

    DenominationHandler(int denomination, int available, DenominationHandler next) {
        this.denomination = denomination; this.available = available; this.next = next;
    }

    /** Fills the plan; returns the remaining amount that couldn't be served (0 = success). */
    long plan(long remaining, Map<Integer, Integer> plan) {
        int notes = (int) Math.min(remaining / denomination, available);
        if (notes > 0) plan.put(denomination, notes);
        long left = remaining - (long) notes * denomination;
        return (left == 0 || next == null) ? left : next.plan(left, plan);
    }

    void commit(Map<Integer, Integer> plan) {
        available -= plan.getOrDefault(denomination, 0);
        if (next != null) next.commit(plan);
    }
}

interface CashHardware { void dispense(Map<Integer, Integer> notes); }

final class FakeCashHardware implements CashHardware {
    boolean failNext;
    Map<Integer, Integer> lastDispensed;
    public void dispense(Map<Integer, Integer> notes) {
        if (failNext) { failNext = false; throw new DispenseFailedException(); }
        lastDispensed = Map.copyOf(notes);
    }
}

final class CashDispenser {
    private final DenominationHandler chain;          // 2000 → 500 → 100
    private final CashHardware hardware;
    CashDispenser(DenominationHandler chain, CashHardware hardware) { this.chain = chain; this.hardware = hardware; }

    synchronized Optional<Map<Integer, Integer>> plan(long amount) {
        Map<Integer, Integer> plan = new LinkedHashMap<>();
        return chain.plan(amount, plan) == 0 ? Optional.of(plan) : Optional.empty();
    }

    synchronized void dispense(Map<Integer, Integer> plan) {
        hardware.dispense(plan);                      // may throw DispenseFailedException
        chain.commit(plan);
    }
}

interface BankGateway {
    AuthResult verifyPin(Card card, String pin);
    DebitResult debit(AccountId account, long amount, TxnId txn);   // idempotent by txn id
    void reverse(TxnId txn);                                        // idempotent; no-op if the debit never happened
    long balance(AccountId account);
}

final class FakeBank implements BankGateway {
    private final Map<Card, String> pins = new HashMap<>();
    private final Map<Card, AccountId> accounts = new HashMap<>();
    private final Map<AccountId, Long> balances = new HashMap<>();
    private final Map<TxnId, Long> applied = new HashMap<>();
    private final Map<TxnId, AccountId> txnAccount = new HashMap<>();
    boolean timeoutNextDebitAfterApplying;

    void open(Card c, String pin, AccountId a, long balance) { pins.put(c, pin); accounts.put(c, a); balances.put(a, balance); }

    public AuthResult verifyPin(Card card, String pin) {
        return pin.equals(pins.get(card)) ? new AuthResult(true, accounts.get(card)) : new AuthResult(false, null);
    }
    public synchronized DebitResult debit(AccountId a, long amount, TxnId txn) {
        if (applied.containsKey(txn)) return new DebitResult(true, null);        // retry: already done
        if (balances.get(a) < amount) return new DebitResult(false, "insufficient funds");
        balances.merge(a, -amount, Long::sum);
        applied.put(txn, amount); txnAccount.put(txn, a);
        if (timeoutNextDebitAfterApplying) { timeoutNextDebitAfterApplying = false; throw new BankTimeoutException(); }
        return new DebitResult(true, null);
    }
    public synchronized void reverse(TxnId txn) {
        Long amount = applied.remove(txn);
        if (amount != null) balances.merge(txnAccount.get(txn), amount, Long::sum);
    }
    public synchronized long balance(AccountId a) { return balances.get(a); }
}

interface CardReader { void eject(); void retainCard(); }
final class FakeCardReader implements CardReader {
    int retained, ejected;
    public void eject() { ejected++; }
    public void retainCard() { retained++; }
}

final class Session {
    private final Card card;
    private AccountId account;
    private int failedAttempts;
    private long withdrawnToday;
    private final long dailyLimit = 40_000;
    Session(Card card) { this.card = card; }
    Card card() { return card; }
    AccountId account() { return account; }
    void authenticate(AccountId a) { this.account = a; }
    int incrementFailedAttempts() { return ++failedAttempts; }
    int failedAttempts() { return failedAttempts; }
    long dailyLimitRemaining() { return dailyLimit - withdrawnToday; }
    void recordWithdrawal(long amount) { withdrawnToday += amount; }
}

interface AtmState {
    default void insertCard(Atm atm, Card card) { throw new IllegalOperationException("insert card", name()); }
    default void enterPin(Atm atm, String pin)  { throw new IllegalOperationException("enter PIN", name()); }
    default void withdraw(Atm atm, long amount) { throw new IllegalOperationException("withdraw", name()); }
    default void cancel(Atm atm)                { throw new IllegalOperationException("cancel", name()); }
    String name();
}

final class IdleState implements AtmState {
    public void insertCard(Atm atm, Card card) { atm.startSession(card); atm.transitionTo(atm.cardInserted()); }
    public void cancel(Atm atm) { }
    public String name() { return "IDLE"; }
}

final class CardInsertedState implements AtmState {
    public void enterPin(Atm atm, String pin) {
        AuthResult r = atm.bank().verifyPin(atm.session().card(), pin);       // PIN is verified by the bank, never stored
        if (r.success()) { atm.session().authenticate(r.account()); atm.transitionTo(atm.authenticated()); return; }
        if (atm.session().incrementFailedAttempts() >= 3) {
            atm.reader().retainCard();
            atm.endSession(false);
            throw new CardRetainedException();
        }
        throw new InvalidPinException(3 - atm.session().failedAttempts());
    }
    public void cancel(Atm atm) { atm.endSession(true); }
    public String name() { return "CARD_INSERTED"; }
}

final class AuthenticatedState implements AtmState {
    @Override public void withdraw(Atm atm, long amount) {
        if (amount <= 0 || amount % 100 != 0) throw new InvalidAmountException("Multiples of ₹100 only");
        if (amount > atm.session().dailyLimitRemaining()) throw new LimitExceededException();

        Map<Integer, Integer> notes = atm.dispenser().plan(amount)
                .orElseThrow(() -> new CashUnavailableException(amount));      // check machine cash first

        TxnId txn = TxnId.newId();
        DebitResult debit;
        try {
            debit = atm.bank().debit(atm.session().account(), amount, txn);   // idempotent by txn id
        } catch (BankTimeoutException timeout) {
            atm.bank().reverse(txn);                                           // unknown outcome: never dispense
            throw new TransactionUncertainException();
        }
        if (!debit.success()) throw new TransactionDeclinedException(debit.reason());

        try {
            atm.dispenser().dispense(notes);
        } catch (DispenseFailedException e) {
            atm.bank().reverse(txn);                                           // compensate: never debit without cash
            atm.transitionTo(atm.outOfService());
            throw e;
        }
        atm.session().recordWithdrawal(amount);
    }
    public void cancel(Atm atm) { atm.endSession(true); }
    public String name() { return "AUTHENTICATED"; }
}

final class OutOfServiceState implements AtmState {
    public String name() { return "OUT_OF_SERVICE"; }
}

/** Facade over reader, dispenser and bank; context for the session state machine. */
final class Atm {
    private final AtmState idle = new IdleState(), cardInserted = new CardInsertedState(),
                           authenticated = new AuthenticatedState(), outOfService = new OutOfServiceState();
    private final CashDispenser dispenser;
    private final BankGateway bank;
    private final CardReader reader;
    private AtmState state = idle;
    private Session session;

    Atm(CashDispenser dispenser, BankGateway bank, CardReader reader) { this.dispenser = dispenser; this.bank = bank; this.reader = reader; }

    public synchronized void insertCard(Card c)  { state.insertCard(this, c); }
    public synchronized void enterPin(String p)  { state.enterPin(this, p); }
    public synchronized void withdraw(long a)    { state.withdraw(this, a); }
    public synchronized void cancel()            { state.cancel(this); }
    public synchronized String stateName()       { return state.name(); }

    void startSession(Card c) { session = new Session(c); }
    void endSession(boolean eject) { if (eject) reader.eject(); session = null; transitionTo(idle); }
    void transitionTo(AtmState s) { state = s; }
    AtmState cardInserted() { return cardInserted; }
    AtmState authenticated() { return authenticated; }
    AtmState outOfService() { return outOfService; }
    Session session() { return session; }
    CashDispenser dispenser() { return dispenser; }
    BankGateway bank() { return bank; }
    CardReader reader() { return reader; }
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
