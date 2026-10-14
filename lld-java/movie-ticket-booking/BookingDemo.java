// Design a Movie Ticket Booking System — runnable reference solution for the lesson.
// Run: java lld-java/movie-ticket-booking/BookingDemo.java
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class BookingDemo {
    public static void main(String[] args) throws Exception {
        var clock = new MutableClock(Instant.parse("2026-10-15T12:00:00Z"));
        var payments = new FakePayments();
        var show = new ShowId("S1");
        Set<SeatId> screenSeats = new HashSet<>();
        for (int i = 1; i <= 100; i++) screenSeats.add(new SeatId("A" + i));
        var svc = new BookingService(new InMemorySeatInventory(clock), payments,
                (s, seats) -> Money.inr(250L * seats.size()), clock, Duration.ofMinutes(5));
        svc.addShow(show, screenSeats);
        var u1 = new UserId("u1"); var u2 = new UserId("u2");
        Set<SeatId> pair = Set.of(new SeatId("A1"), new SeatId("A2"));

        // Hold → pay → confirmed
        Booking b1 = svc.holdSeats(u1, show, pair);
        Check.that(b1.status() == BookingStatus.PENDING && b1.amount().equals(Money.inr(500)), "pending with price");
        Check.throwsEx(SeatUnavailableException.class, () -> svc.holdSeats(u2, show, Set.of(new SeatId("A2"), new SeatId("A3"))), "held seat unavailable to others");
        Check.that(svc.availableSeats(show).size() == 98, "held seats hidden from the seat map");
        svc.confirm(b1.id(), "card-ok");
        Check.that(b1.status() == BookingStatus.CONFIRMED, "confirmed");
        Check.throwsEx(SeatUnavailableException.class, () -> svc.holdSeats(u2, show, pair), "booked seats stay unavailable");

        // All-or-nothing: one taken seat → nothing locked
        Check.throwsEx(SeatUnavailableException.class, () -> svc.holdSeats(u2, show, Set.of(new SeatId("A1"), new SeatId("A9"))), "partial selection rejected");
        Check.that(svc.availableSeats(show).contains(new SeatId("A9")), "A9 not left dangling");

        // Payment failure releases the hold
        Booking b2 = svc.holdSeats(u2, show, Set.of(new SeatId("A5")));
        payments.failNext = true;
        svc.confirm(b2.id(), "card-declined");
        Check.that(b2.status() == BookingStatus.FAILED && svc.availableSeats(show).contains(new SeatId("A5")), "failed payment frees the seat");

        // Lock expires before payment: user is NOT charged
        Booking b3 = svc.holdSeats(u1, show, Set.of(new SeatId("A7")));
        clock.advance(Duration.ofMinutes(6));
        int chargesBefore = payments.charges.get();
        Check.throwsEx(BookingExpiredException.class, () -> svc.confirm(b3.id(), "card-ok"), "expired hold cannot be confirmed");
        Check.that(payments.charges.get() == chargesBefore && b3.status() == BookingStatus.EXPIRED, "no charge for an expired hold");

        // Lock expires DURING payment and someone else books the seat → refund
        Booking b4 = svc.holdSeats(u1, show, Set.of(new SeatId("A8")));
        payments.duringCharge = () -> {                      // simulate a slow payment
            clock.advance(Duration.ofMinutes(6));
            Booking thief = svc.holdSeats(u2, show, Set.of(new SeatId("A8")));
            svc.confirm(thief.id(), "card-ok");
        };
        Check.throwsEx(BookingExpiredException.class, () -> svc.confirm(b4.id(), "card-ok"), "lost the seat during payment");
        Check.that(payments.refunds.get() == 1, "compensating refund issued");

        // Unknown seat and limits
        Check.throwsEx(InvalidSelectionException.class, () -> svc.holdSeats(u1, show, Set.of(new SeatId("Z1"))), "unknown seat");
        Check.throwsEx(InvalidSelectionException.class, () -> svc.holdSeats(u1, show, Set.of()), "empty selection");

        // Concurrency: 50 users race for the same 2 seats → exactly one booking, no double booking
        var race = new BookingService(new InMemorySeatInventory(clock), new FakePayments(),
                (s, seats) -> Money.inr(100), clock, Duration.ofMinutes(5));
        var hot = new ShowId("HOT");
        race.addShow(hot, Set.of(new SeatId("H1"), new SeatId("H2"), new SeatId("H3")));
        var start = new CountDownLatch(1);
        var pool = Executors.newFixedThreadPool(50);
        List<Future<Boolean>> res = new ArrayList<>();
        for (int i = 0; i < 50; i++) {
            var user = new UserId("r" + i);
            Set<SeatId> want = (i % 2 == 0) ? Set.of(new SeatId("H1"), new SeatId("H2")) : Set.of(new SeatId("H2"), new SeatId("H3"));
            res.add(pool.submit(() -> {
                start.await();
                try { Booking b = race.holdSeats(user, hot, want); race.confirm(b.id(), "ok"); return true; }
                catch (SeatUnavailableException e) { return false; }
            }));
        }
        start.countDown();
        int wins = 0; for (var f : res) if (f.get()) wins++;
        pool.shutdown();
        Check.that(wins == 1, "overlapping selections: exactly one winner (" + wins + ")");

        Check.done("movie-ticket-booking");
    }
}

record ShowId(String value) { }
record SeatId(String value) { }
record UserId(String value) { }
record BookingId(long value) { }
record Money(long paise) { static Money inr(long r) { return new Money(r * 100); } }
record PaymentResult(boolean success, String paymentId) { }
enum BookingStatus { PENDING, CONFIRMED, EXPIRED, FAILED, CANCELLED }

class BookingException extends RuntimeException { BookingException(String m) { super(m); } }
class SeatUnavailableException extends BookingException { SeatUnavailableException(SeatId s) { super("Seat unavailable: " + s.value()); } }
class InvalidSelectionException extends BookingException { InvalidSelectionException(String m) { super(m); } }
class BookingExpiredException extends BookingException { BookingExpiredException(BookingId id) { super("Hold expired for booking " + id.value()); } }

final class Booking {
    private final BookingId id;
    private final ShowId show;
    private final UserId user;
    private final Set<SeatId> seats;
    private final Money amount;
    private volatile BookingStatus status = BookingStatus.PENDING;
    private String paymentId;

    Booking(BookingId id, ShowId show, UserId user, Set<SeatId> seats, Money amount) {
        this.id = id; this.show = show; this.user = user; this.seats = Set.copyOf(seats); this.amount = amount;
    }
    synchronized void transition(BookingStatus from, BookingStatus to) {
        if (status != from) throw new IllegalStateException("Booking " + id.value() + " is " + status);
        status = to;
    }
    void markConfirmed(String paymentId) { transition(BookingStatus.PENDING, BookingStatus.CONFIRMED); this.paymentId = paymentId; }
    void markFailed()  { transition(BookingStatus.PENDING, BookingStatus.FAILED); }
    void markExpired() { transition(BookingStatus.PENDING, BookingStatus.EXPIRED); }
    BookingId id() { return id; } ShowId show() { return show; } UserId user() { return user; }
    Set<SeatId> seats() { return seats; } Money amount() { return amount; } BookingStatus status() { return status; }
}

/** Seat availability for every show: holds (with owner + expiry) and confirmed bookings, under one lock per show. */
interface SeatInventory {
    void addShow(ShowId show, Set<SeatId> seats);
    void hold(ShowId show, Set<SeatId> seats, UserId user, Duration ttl);      // all or nothing
    boolean isHeldBy(ShowId show, Set<SeatId> seats, UserId user);
    boolean confirm(ShowId show, Set<SeatId> seats, UserId user);              // held by user → booked, atomically
    void release(ShowId show, Set<SeatId> seats, UserId user);
    Set<SeatId> available(ShowId show);
}

final class InMemorySeatInventory implements SeatInventory {
    private record Hold(UserId user, Instant expiresAt) {
        boolean isExpired(Instant now) { return !now.isBefore(expiresAt); }
    }
    private static final class ShowSeats {                  // guarded by its own monitor
        final Set<SeatId> all;
        final Map<SeatId, Hold> holds = new HashMap<>();
        final Set<SeatId> booked = new HashSet<>();
        ShowSeats(Set<SeatId> all) { this.all = Set.copyOf(all); }
    }

    private final Map<ShowId, ShowSeats> shows = new ConcurrentHashMap<>();
    private final Clock clock;
    InMemorySeatInventory(Clock clock) { this.clock = clock; }

    public void addShow(ShowId show, Set<SeatId> seats) { shows.put(show, new ShowSeats(seats)); }

    private ShowSeats seats(ShowId show) {
        ShowSeats s = shows.get(show);
        if (s == null) throw new InvalidSelectionException("Unknown show " + show.value());
        return s;
    }

    public void hold(ShowId show, Set<SeatId> wanted, UserId user, Duration ttl) {
        ShowSeats s = seats(show);
        synchronized (s) {                                    // check and set for all seats atomically
            Instant now = clock.instant();
            for (SeatId seat : wanted) {
                if (!s.all.contains(seat)) throw new InvalidSelectionException("Unknown seat " + seat.value());
                if (s.booked.contains(seat)) throw new SeatUnavailableException(seat);
                Hold h = s.holds.get(seat);
                if (h != null && !h.isExpired(now) && !h.user().equals(user)) throw new SeatUnavailableException(seat);
            }
            Hold hold = new Hold(user, now.plus(ttl));
            wanted.forEach(seat -> s.holds.put(seat, hold));
        }
    }

    public boolean isHeldBy(ShowId show, Set<SeatId> wanted, UserId user) {
        ShowSeats s = seats(show);
        synchronized (s) { return heldBy(s, wanted, user, clock.instant()); }
    }

    public boolean confirm(ShowId show, Set<SeatId> wanted, UserId user) {
        ShowSeats s = seats(show);
        synchronized (s) {
            if (!heldBy(s, wanted, user, clock.instant())) return false;
            wanted.forEach(seat -> { s.holds.remove(seat); s.booked.add(seat); });
            return true;
        }
    }

    public void release(ShowId show, Set<SeatId> wanted, UserId user) {
        ShowSeats s = seats(show);
        synchronized (s) {
            wanted.forEach(seat -> {
                Hold h = s.holds.get(seat);
                if (h != null && h.user().equals(user)) s.holds.remove(seat);   // only the owner releases
            });
        }
    }

    public Set<SeatId> available(ShowId show) {
        ShowSeats s = seats(show);
        synchronized (s) {
            Instant now = clock.instant();
            Set<SeatId> out = new HashSet<>();
            for (SeatId seat : s.all) {
                Hold h = s.holds.get(seat);
                if (!s.booked.contains(seat) && (h == null || h.isExpired(now))) out.add(seat);
            }
            return out;
        }
    }

    private static boolean heldBy(ShowSeats s, Set<SeatId> wanted, UserId user, Instant now) {
        for (SeatId seat : wanted) {
            Hold h = s.holds.get(seat);
            if (h == null || h.isExpired(now) || !h.user().equals(user)) return false;
        }
        return true;
    }
}

interface PaymentGateway {
    PaymentResult charge(Money amount, String paymentDetails, String idempotencyKey);
    void refund(String paymentId);
}

final class FakePayments implements PaymentGateway {
    final AtomicInteger charges = new AtomicInteger(), refunds = new AtomicInteger();
    volatile boolean failNext;
    volatile Runnable duringCharge;
    public PaymentResult charge(Money amount, String details, String key) {
        Runnable hook = duringCharge; duringCharge = null;
        if (hook != null) hook.run();
        if (failNext) { failNext = false; return new PaymentResult(false, null); }
        return new PaymentResult(true, "PAY-" + charges.incrementAndGet());
    }
    public void refund(String paymentId) { refunds.incrementAndGet(); }
}

interface PricingStrategy { Money price(ShowId show, Set<SeatId> seats); }

final class BookingService {
    private final SeatInventory inventory;
    private final PaymentGateway payments;
    private final PricingStrategy pricing;
    private final Clock clock;
    private final Duration holdTtl;
    private final Map<BookingId, Booking> bookings = new ConcurrentHashMap<>();
    private final AtomicLong ids = new AtomicLong();

    BookingService(SeatInventory inventory, PaymentGateway payments, PricingStrategy pricing, Clock clock, Duration holdTtl) {
        this.inventory = inventory; this.payments = payments; this.pricing = pricing; this.clock = clock; this.holdTtl = holdTtl;
    }

    void addShow(ShowId show, Set<SeatId> seats) { inventory.addShow(show, seats); }
    Set<SeatId> availableSeats(ShowId show) { return inventory.available(show); }

    Booking holdSeats(UserId user, ShowId show, Set<SeatId> seats) {
        if (seats.isEmpty() || seats.size() > 10) throw new InvalidSelectionException("1–10 seats per booking");
        inventory.hold(show, seats, user, holdTtl);                 // atomic: unknown, booked or held → throws
        Booking booking = new Booking(new BookingId(ids.incrementAndGet()), show, user, seats, pricing.price(show, seats));
        bookings.put(booking.id(), booking);
        return booking;
    }

    Booking confirm(BookingId id, String paymentDetails) {
        Booking b = bookings.get(id);
        if (b.status() != BookingStatus.PENDING) throw new IllegalStateException("Booking is " + b.status());

        // 1. Don't charge for a hold that has already lapsed
        if (!inventory.isHeldBy(b.show(), b.seats(), b.user())) {
            b.markExpired();
            throw new BookingExpiredException(id);
        }

        // 2. Charge outside any lock, with the booking id as the idempotency key
        PaymentResult result = payments.charge(b.amount(), paymentDetails, "booking-" + id.value());
        if (!result.success()) {
            b.markFailed();
            inventory.release(b.show(), b.seats(), b.user());
            return b;
        }

        // 3. Hold → booked atomically; if the hold lapsed during payment, compensate
        if (!inventory.confirm(b.show(), b.seats(), b.user())) {
            b.markExpired();
            payments.refund(result.paymentId());
            throw new BookingExpiredException(id);
        }
        b.markConfirmed(result.paymentId());
        return b;
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
