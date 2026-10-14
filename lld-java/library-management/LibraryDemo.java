// Design a Library Management System — runnable reference solution for the lesson.
// Run: java lld-java/library-management/LibraryDemo.java
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicLong;

public class LibraryDemo {
    public static void main(String[] args) throws Exception {
        var clock = new MutableClock(Instant.parse("2026-10-01T09:00:00Z"));
        var notifier = new RecordingNotifier();
        var lib = newLibrary(clock, notifier);
        var ddd = new Isbn("978-0321125217");
        lib.addBook(new Book(ddd, "Domain-Driven Design", List.of("Eric Evans"), "Software"));
        lib.addCopy(ddd, new Barcode("C1"));
        lib.addCopy(ddd, new Barcode("C2"));
        var asha = lib.addMember("Asha");
        var ravi = lib.addMember("Ravi");
        var meera = lib.addMember("Meera");

        // Checkout and on-time return
        Loan l1 = lib.checkout(asha, new Barcode("C1"));
        Check.that(l1.dueOn().equals(LocalDate.of(2026, 10, 15)), "14-day loan");
        clock.advance(Duration.ofDays(10));
        Check.that(lib.returnCopy(new Barcode("C1")).fine().isZero(), "no fine when on time");

        // Late return → ₹10/day fine, capped; outstanding fine blocks new loans
        lib.checkout(asha, new Barcode("C1"));
        clock.advance(Duration.ofDays(17));                            // 3 days late
        Check.that(lib.returnCopy(new Barcode("C1")).fine().equals(Money.inr(30)), "3 days late = ₹30");
        Check.throwsEx(OutstandingFinesException.class, () -> lib.checkout(asha, new Barcode("C1")), "fines block borrowing");
        lib.payFine(asha, Money.inr(30));
        lib.checkout(asha, new Barcode("C1"));

        // Reservation: no copy free → reserve; return turns into a hold for the first reserver
        lib.checkout(ravi, new Barcode("C2"));
        Check.throwsEx(CopyNotAvailableException.class, () -> lib.checkout(meera, new Barcode("C2")), "loaned copy unavailable");
        lib.reserve(meera, ddd);
        Check.throwsEx(DuplicateReservationException.class, () -> lib.reserve(meera, ddd), "one reservation per member per title");
        lib.returnCopy(new Barcode("C2"));
        Check.that(notifier.ready.contains("Meera:" + ddd.value()), "Meera notified that a copy is held");
        Check.throwsEx(CopyNotAvailableException.class, () -> lib.checkout(asha, new Barcode("C2")), "held copy is only for Meera");
        lib.checkout(meera, new Barcode("C2"));

        // Hold expiry passes the copy to the next reserver, then back to the shelf
        lib.reserve(ravi, ddd);
        lib.reserve(asha, ddd);
        lib.returnCopy(new Barcode("C2"));                             // held for Ravi
        clock.advance(Duration.ofDays(3));
        lib.expireHolds();                                             // Ravi didn't collect → Asha
        Check.that(notifier.ready.getLast().equals("Asha:" + ddd.value()), "expired hold offered to the next reserver");
        clock.advance(Duration.ofDays(3));
        lib.expireHolds();
        Check.that(lib.copyStatus(new Barcode("C2")) == CopyStatus.AVAILABLE, "no reservers left → available");

        // Loan limit and blocked members
        var limits = newLibrary(clock, notifier);
        var isbn = new Isbn("1");
        limits.addBook(new Book(isbn, "Many copies", List.of("A"), "X"));
        for (int i = 0; i < 6; i++) limits.addCopy(isbn, new Barcode("M" + i));
        var heavy = limits.addMember("Heavy reader");
        for (int i = 0; i < 5; i++) limits.checkout(heavy, new Barcode("M" + i));
        Check.throwsEx(LoanLimitExceededException.class, () -> limits.checkout(heavy, new Barcode("M5")), "max 5 active loans");
        var blocked = limits.addMember("Blocked");
        limits.block(blocked);
        Check.throwsEx(MemberBlockedException.class, () -> limits.checkout(blocked, new Barcode("M5")), "blocked member rejected");

        // Concurrency: 20 kiosks try to borrow the same copy at once — exactly one wins
        var race = newLibrary(clock, notifier);
        race.addBook(new Book(isbn, "Hot title", List.of("A"), "X"));
        race.addCopy(isbn, new Barcode("HOT"));
        List<MemberId> members = new ArrayList<>();
        for (int i = 0; i < 20; i++) members.add(race.addMember("m" + i));
        var start = new CountDownLatch(1);
        var pool = Executors.newFixedThreadPool(20);
        List<Future<Boolean>> results = new ArrayList<>();
        for (MemberId m : members) results.add(pool.submit(() -> {
            start.await();
            try { race.checkout(m, new Barcode("HOT")); return true; } catch (CopyNotAvailableException e) { return false; }
        }));
        start.countDown();
        int wins = 0; for (var f : results) if (f.get()) wins++;
        pool.shutdown();
        Check.that(wins == 1, "one copy, one loan");

        // Search by author and title word
        Check.that(lib.search("evans").size() == 1 && lib.search("driven").size() == 1 && lib.search("tolkien").isEmpty(), "indexed search");

        Check.done("library-management");
    }

    static LibraryService newLibrary(Clock clock, Notifier notifier) {
        return new LibraryService(new StandardBorrowing(5, Period.ofDays(14)),
                new PerDayFine(Money.inr(10), Money.inr(500)), notifier, clock, Duration.ofDays(2));
    }
}

// ---------- value objects ----------
record Isbn(String value) { }
record Barcode(String value) { }
record MemberId(long value) { }
record LoanId(long value) { }

record Money(long paise) implements Comparable<Money> {
    static final Money ZERO = new Money(0);
    static Money inr(long rupees) { return new Money(rupees * 100); }
    Money times(long n) { return new Money(paise * n); }
    Money plus(Money o) { return new Money(paise + o.paise); }
    Money minus(Money o) { return new Money(paise - o.paise); }
    boolean isPositive() { return paise > 0; }
    boolean isZero() { return paise == 0; }
    public int compareTo(Money o) { return Long.compare(paise, o.paise); }
}

enum CopyStatus { AVAILABLE, LOANED, ON_HOLD, LOST }
enum MemberStatus { ACTIVE, BLOCKED }

record Book(Isbn isbn, String title, List<String> authors, String subject) { }
record Member(MemberId id, String name, MemberStatus status) { }
record ReturnResult(Loan loan, Money fine) { }
record Reservation(Isbn isbn, MemberId member, Instant createdAt) { }

// ---------- exceptions ----------
class LibraryException extends RuntimeException { LibraryException(String m) { super(m); } }
class CopyNotAvailableException extends LibraryException { CopyNotAvailableException(Barcode b, CopyStatus s) { super(b.value() + " is " + s); } }
class MemberBlockedException extends LibraryException { MemberBlockedException(MemberId m) { super("Member blocked: " + m.value()); } }
class LoanLimitExceededException extends LibraryException { LoanLimitExceededException(MemberId m) { super("Loan limit reached: " + m.value()); } }
class OutstandingFinesException extends LibraryException { OutstandingFinesException(MemberId m) { super("Unpaid fines: " + m.value()); } }
class NoActiveLoanException extends LibraryException { NoActiveLoanException(Barcode b) { super("No active loan for " + b.value()); } }
class CopyAvailableException extends LibraryException { CopyAvailableException(Isbn i) { super("A copy is available; borrow it: " + i.value()); } }
class DuplicateReservationException extends LibraryException { DuplicateReservationException(Isbn i) { super("Already reserved: " + i.value()); } }

// ---------- entities ----------
final class BookCopy {
    private final Barcode barcode;
    private final Isbn isbn;
    private CopyStatus status = CopyStatus.AVAILABLE;
    private MemberId heldFor;                         // set when ON_HOLD
    private LocalDate holdUntil;

    BookCopy(Barcode barcode, Isbn isbn) { this.barcode = barcode; this.isbn = isbn; }

    void checkOut(MemberId member) {
        boolean allowed = status == CopyStatus.AVAILABLE
                || (status == CopyStatus.ON_HOLD && member.equals(heldFor));
        if (!allowed) throw new CopyNotAvailableException(barcode, status);
        status = CopyStatus.LOANED;
        heldFor = null; holdUntil = null;
    }

    void checkIn()  { requireStatus(CopyStatus.LOANED); status = CopyStatus.AVAILABLE; }
    void holdFor(MemberId member, LocalDate until) {
        requireStatus(CopyStatus.AVAILABLE); status = CopyStatus.ON_HOLD; heldFor = member; holdUntil = until;
    }
    void releaseHold() { requireStatus(CopyStatus.ON_HOLD); status = CopyStatus.AVAILABLE; heldFor = null; holdUntil = null; }

    boolean holdExpired(LocalDate today) { return status == CopyStatus.ON_HOLD && today.isAfter(holdUntil); }
    private void requireStatus(CopyStatus expected) {
        if (status != expected) throw new IllegalStateException(barcode.value() + " is " + status + ", expected " + expected);
    }
    Barcode barcode() { return barcode; }
    Isbn isbn() { return isbn; }
    CopyStatus status() { return status; }
}

final class Loan {
    private final LoanId id;
    private final Barcode barcode;
    private final MemberId member;
    private final LocalDate issuedOn, dueOn;
    private LocalDate returnedOn;

    Loan(LoanId id, Barcode barcode, MemberId member, LocalDate issuedOn, LocalDate dueOn) {
        this.id = id; this.barcode = barcode; this.member = member; this.issuedOn = issuedOn; this.dueOn = dueOn;
    }
    boolean isActive() { return returnedOn == null; }
    boolean isOverdue(LocalDate today) { return isActive() && today.isAfter(dueOn); }
    long daysLate(LocalDate on) { return Math.max(0, ChronoUnit.DAYS.between(dueOn, on)); }
    void close(LocalDate on) { if (!isActive()) throw new IllegalStateException("already returned"); returnedOn = on; }
    Barcode barcode() { return barcode; }
    MemberId member() { return member; }
    LocalDate dueOn() { return dueOn; }
}

// ---------- policies (strategies) ----------
interface FinePolicy { Money fineFor(Loan loan, LocalDate returnedOn); }

final class PerDayFine implements FinePolicy {
    private final Money perDay; private final Money cap;
    PerDayFine(Money perDay, Money cap) { this.perDay = perDay; this.cap = cap; }
    public Money fineFor(Loan loan, LocalDate on) {
        Money fine = perDay.times(loan.daysLate(on));
        return fine.compareTo(cap) > 0 ? cap : fine;
    }
}

interface BorrowingPolicy {
    int maxActiveLoans(Member m);
    Period loanPeriod(Member m);
}

final class StandardBorrowing implements BorrowingPolicy {
    private final int max; private final Period period;
    StandardBorrowing(int max, Period period) { this.max = max; this.period = period; }
    public int maxActiveLoans(Member m) { return max; }
    public Period loanPeriod(Member m) { return period; }
}

interface Notifier { void copyReady(MemberId member, Isbn isbn, LocalDate collectBy); }

final class RecordingNotifier implements Notifier {
    final List<String> ready = new ArrayList<>();
    private final Map<MemberId, String> names;
    RecordingNotifier() { this.names = new ConcurrentHashMap<>(); }
    void name(MemberId id, String n) { names.put(id, n); }
    public synchronized void copyReady(MemberId m, Isbn isbn, LocalDate by) { ready.add(names.get(m) + ":" + isbn.value()); }
}

/** FIFO queue of reservations per title. */
final class ReservationQueue {
    private final Map<Isbn, Deque<Reservation>> byTitle = new HashMap<>();

    Reservation enqueue(Isbn isbn, MemberId member, Instant at) {
        Deque<Reservation> q = byTitle.computeIfAbsent(isbn, k -> new ArrayDeque<>());
        if (q.stream().anyMatch(r -> r.member().equals(member))) throw new DuplicateReservationException(isbn);
        Reservation r = new Reservation(isbn, member, at);
        q.addLast(r);
        return r;
    }
    Optional<Reservation> pollNext(Isbn isbn) {
        return Optional.ofNullable(byTitle.getOrDefault(isbn, new ArrayDeque<>()).pollFirst());
    }
    void fulfilledBy(Isbn isbn, MemberId member) {
        Deque<Reservation> q = byTitle.get(isbn);
        if (q != null) q.removeIf(r -> r.member().equals(member));
    }
}

// ---------- service (facade) ----------
final class LibraryService {
    private final Map<Isbn, Book> books = new HashMap<>();
    private final Map<Barcode, BookCopy> copies = new HashMap<>();
    private final Map<MemberId, Member> members = new HashMap<>();
    private final Map<Barcode, Loan> activeLoans = new HashMap<>();
    private final Map<MemberId, Money> fines = new HashMap<>();
    private final Map<String, Set<Isbn>> searchIndex = new HashMap<>();
    private final ReservationQueue reservations = new ReservationQueue();
    private final BorrowingPolicy borrowing;
    private final FinePolicy finePolicy;
    private final Notifier notifier;
    private final Clock clock;
    private final Duration holdWindow;
    private final AtomicLong ids = new AtomicLong();

    LibraryService(BorrowingPolicy borrowing, FinePolicy finePolicy, Notifier notifier, Clock clock, Duration holdWindow) {
        this.borrowing = borrowing; this.finePolicy = finePolicy; this.notifier = notifier;
        this.clock = clock; this.holdWindow = holdWindow;
    }

    synchronized void addBook(Book b) {
        books.put(b.isbn(), b);
        List<String> words = new ArrayList<>(List.of(b.title().toLowerCase().split("\\W+")));
        b.authors().forEach(a -> words.addAll(List.of(a.toLowerCase().split("\\W+"))));
        words.add(b.subject().toLowerCase());
        words.forEach(w -> searchIndex.computeIfAbsent(w, k -> new HashSet<>()).add(b.isbn()));
    }
    synchronized void addCopy(Isbn isbn, Barcode barcode) {
        if (!books.containsKey(isbn)) throw new IllegalArgumentException("Unknown ISBN " + isbn.value());
        copies.put(barcode, new BookCopy(barcode, isbn));
    }
    synchronized MemberId addMember(String name) {
        var id = new MemberId(ids.incrementAndGet());
        members.put(id, new Member(id, name, MemberStatus.ACTIVE));
        if (notifier instanceof RecordingNotifier r) r.name(id, name);
        return id;
    }
    synchronized void block(MemberId id) { members.computeIfPresent(id, (k, m) -> new Member(k, m.name(), MemberStatus.BLOCKED)); }

    synchronized Loan checkout(MemberId memberId, Barcode barcode) {
        Member member = members.get(memberId);
        if (member.status() == MemberStatus.BLOCKED) throw new MemberBlockedException(memberId);
        long active = activeLoans.values().stream().filter(l -> l.member().equals(memberId)).count();
        if (active >= borrowing.maxActiveLoans(member)) throw new LoanLimitExceededException(memberId);
        if (fines.getOrDefault(memberId, Money.ZERO).isPositive()) throw new OutstandingFinesException(memberId);

        BookCopy copy = copies.get(barcode);
        copy.checkOut(memberId);                              // validates AVAILABLE or held for this member
        reservations.fulfilledBy(copy.isbn(), memberId);       // clears their reservation if any

        LocalDate today = LocalDate.now(clock);
        Loan loan = new Loan(new LoanId(ids.incrementAndGet()), barcode, memberId, today, today.plus(borrowing.loanPeriod(member)));
        activeLoans.put(barcode, loan);
        return loan;
    }

    synchronized ReturnResult returnCopy(Barcode barcode) {
        Loan loan = Optional.ofNullable(activeLoans.remove(barcode)).orElseThrow(() -> new NoActiveLoanException(barcode));
        LocalDate today = LocalDate.now(clock);
        loan.close(today);
        Money fine = finePolicy.fineFor(loan, today);
        if (fine.isPositive()) fines.merge(loan.member(), fine, Money::plus);

        BookCopy copy = copies.get(barcode);
        copy.checkIn();
        offerToNextReserver(copy, today);
        return new ReturnResult(loan, fine);
    }

    synchronized Reservation reserve(MemberId memberId, Isbn isbn) {
        boolean anyAvailable = copies.values().stream().anyMatch(c -> c.isbn().equals(isbn) && c.status() == CopyStatus.AVAILABLE);
        if (anyAvailable) throw new CopyAvailableException(isbn);   // just borrow it
        return reservations.enqueue(isbn, memberId, clock.instant());   // FIFO per title
    }

    /** Scheduled job: holds not collected in time go to the next reserver or back to the shelf. */
    synchronized void expireHolds() {
        LocalDate today = LocalDate.now(clock);
        for (BookCopy copy : copies.values()) {
            if (copy.holdExpired(today)) {
                copy.releaseHold();
                offerToNextReserver(copy, today);
            }
        }
    }

    synchronized void payFine(MemberId m, Money amount) {
        fines.computeIfPresent(m, (k, owed) -> { Money left = owed.minus(amount); return left.isPositive() ? left : null; });
    }

    synchronized List<Book> search(String word) {
        return searchIndex.getOrDefault(word.toLowerCase(), Set.of()).stream().map(books::get).toList();
    }

    synchronized CopyStatus copyStatus(Barcode b) { return copies.get(b).status(); }

    private void offerToNextReserver(BookCopy copy, LocalDate today) {
        reservations.pollNext(copy.isbn()).ifPresent(next -> {
            LocalDate collectBy = today.plusDays(holdWindow.toDays());
            copy.holdFor(next.member(), collectBy);
            notifier.copyReady(next.member(), copy.isbn(), collectBy);
        });
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
