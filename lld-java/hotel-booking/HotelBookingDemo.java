// Design a Hotel Booking System — runnable reference solution for the lesson.
// Run: java lld-java/hotel-booking/HotelBookingDemo.java
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicLong;

public class HotelBookingDemo {
    public static void main(String[] args) throws Exception {
        var clock = new MutableClock(Instant.parse("2026-10-01T06:00:00Z"));
        var rooms = new ArrayList<Room>();
        for (int i = 101; i <= 103; i++) rooms.add(new Room(String.valueOf(i), RoomType.DELUXE));
        rooms.add(new Room("201", RoomType.SUITE));
        var pricing = new WeekendSurcharge(new NightlyRate(Map.of(RoomType.DELUXE, Money.inr(4_000), RoomType.SUITE, Money.inr(9_000))), 25);
        var hotel = new HotelService(rooms, pricing, new FreeUntilHoursBefore(48), clock, ZoneId.of("Asia/Kolkata"));
        var g = new Guest("G1");

        // Half-open ranges: checkout day is free for the next guest
        var oct10to12 = new DateRange(d("2026-10-10"), d("2026-10-12"));
        var oct12to13 = new DateRange(d("2026-10-12"), d("2026-10-13"));
        Check.that(!oct10to12.overlaps(oct12to13) && oct10to12.overlaps(new DateRange(d("2026-10-11"), d("2026-10-15"))), "half-open overlap rules");
        Check.throwsEx(IllegalArgumentException.class, () -> new DateRange(d("2026-10-12"), d("2026-10-12")), "at least one night");

        // Book a specific type; price per night with weekend surcharge (Oct 10, 2026 is a Saturday)
        Booking b1 = hotel.book(g, RoomType.DELUXE, oct10to12);
        Check.that(b1.room().number().equals("101"), "first free deluxe room");
        Check.that(b1.price().equals(Money.inr(5_000 + 4_000)), "Sat night +25% (5,000) + Sun night (4,000) = 9,000 (" + b1.price() + ")");
        Booking b2 = hotel.book(g, RoomType.DELUXE, oct12to13);
        Check.that(b2.room().number().equals("101"), "same room re-used from the checkout day");

        // Availability search
        Check.that(hotel.availableRooms(RoomType.DELUXE, new DateRange(d("2026-10-11"), d("2026-10-12"))).size() == 2, "101 busy, 102 and 103 free");
        hotel.book(g, RoomType.DELUXE, new DateRange(d("2026-10-09"), d("2026-10-14")));
        hotel.book(g, RoomType.DELUXE, new DateRange(d("2026-10-01"), d("2026-10-30")));
        Check.throwsEx(NoAvailabilityException.class, () -> hotel.book(g, RoomType.DELUXE, new DateRange(d("2026-10-11"), d("2026-10-12"))), "sold out");
        Check.that(hotel.book(g, RoomType.SUITE, new DateRange(d("2026-10-11"), d("2026-10-12"))).room().number().equals("201"), "other types unaffected");

        // Cancellation policy: free more than 48 h before check-in, one night charged after that
        Booking far = hotel.book(g, RoomType.SUITE, new DateRange(d("2026-10-20"), d("2026-10-22")));
        Check.that(hotel.cancel(far.id()).equals(Money.ZERO), "free cancellation well before check-in");
        Booking near = hotel.book(g, RoomType.SUITE, new DateRange(d("2026-10-02"), d("2026-10-04")));
        Check.that(hotel.cancel(near.id()).equals(Money.inr(11_250)), "late cancellation charges the first night (a Friday: 9,000 + 25%)");
        Check.that(hotel.availableRooms(RoomType.SUITE, new DateRange(d("2026-10-02"), d("2026-10-04"))).size() == 1, "cancelled dates are free again");
        Check.throwsEx(IllegalStateException.class, () -> hotel.cancel(near.id()), "can't cancel twice");

        // Property test: random bookings never overlap within a room (checked against brute force)
        var rnd = new Random(5);
        var big = new HotelService(List.of(new Room("1", RoomType.DELUXE), new Room("2", RoomType.DELUXE)), pricing, new FreeUntilHoursBefore(48), clock, ZoneId.of("Asia/Kolkata"));
        List<Booking> made = new ArrayList<>();
        for (int i = 0; i < 2_000; i++) {
            LocalDate in = d("2026-11-01").plusDays(rnd.nextInt(60));
            var range = new DateRange(in, in.plusDays(1 + rnd.nextInt(5)));
            boolean expectFree = made.stream().filter(b -> b.status() == BookingStatus.CONFIRMED).map(b -> b.room().number()).distinct().count() < 2
                    || big.availableRooms(RoomType.DELUXE, range).size() > 0;
            try { made.add(big.book(g, RoomType.DELUXE, range)); Check.that(expectFree, "booked only when free"); }
            catch (NoAvailabilityException e) { Check.that(big.availableRooms(RoomType.DELUXE, range).isEmpty(), "rejected only when full"); }
            if (rnd.nextInt(5) == 0 && !made.isEmpty()) {
                Booking victim = made.get(rnd.nextInt(made.size()));
                if (victim.status() == BookingStatus.CONFIRMED) big.cancel(victim.id());
            }
        }
        Check.that(noOverlaps(made), "no two confirmed bookings overlap in any room");

        // Concurrency: 60 guests race for 3 deluxe rooms on the same nights → exactly 3 bookings
        var race = new HotelService(List.of(new Room("A", RoomType.DELUXE), new Room("B", RoomType.DELUXE), new Room("C", RoomType.DELUXE)),
                pricing, new FreeUntilHoursBefore(48), clock, ZoneId.of("Asia/Kolkata"));
        var start = new CountDownLatch(1);
        var pool = Executors.newFixedThreadPool(32);
        List<Future<Booking>> res = new ArrayList<>();
        for (int i = 0; i < 60; i++) {
            var who = new Guest("R" + i);
            var range = i % 2 == 0 ? new DateRange(d("2026-12-24"), d("2026-12-26")) : new DateRange(d("2026-12-25"), d("2026-12-27"));
            res.add(pool.submit(() -> { start.await(); try { return race.book(who, RoomType.DELUXE, range); } catch (NoAvailabilityException e) { return null; } }));
        }
        start.countDown();
        List<Booking> won = new ArrayList<>();
        for (var f : res) { Booking b = f.get(); if (b != null) won.add(b); }
        pool.shutdown();
        Check.that(won.size() == 3 && noOverlaps(won), "3 rooms, 3 overlapping bookings max, no double booking (" + won.size() + ")");

        Check.done("hotel-booking");
    }

    static LocalDate d(String s) { return LocalDate.parse(s); }

    static boolean noOverlaps(List<Booking> bookings) {
        List<Booking> live = bookings.stream().filter(b -> b.status() == BookingStatus.CONFIRMED).toList();
        for (int i = 0; i < live.size(); i++)
            for (int j = i + 1; j < live.size(); j++)
                if (live.get(i).room() == live.get(j).room() && live.get(i).dates().overlaps(live.get(j).dates())) return false;
        return true;
    }
}

// ---------- value objects ----------
record Money(long paise) implements Comparable<Money> {
    static final Money ZERO = new Money(0);
    static Money inr(long r) { return new Money(r * 100); }
    Money plus(Money o) { return new Money(paise + o.paise); }
    Money percent(long p) { return new Money(paise * p / 100); }
    public int compareTo(Money o) { return Long.compare(paise, o.paise); }
    @Override public String toString() { return "₹" + paise / 100; }
}

/** Nights from checkIn (inclusive) to checkOut (exclusive): [checkIn, checkOut). */
record DateRange(LocalDate checkIn, LocalDate checkOut) {
    DateRange {
        if (!checkOut.isAfter(checkIn)) throw new IllegalArgumentException("stay must be at least one night");
    }
    boolean overlaps(DateRange o) { return checkIn.isBefore(o.checkOut) && o.checkIn.isBefore(checkOut); }
    List<LocalDate> nights() { return checkIn.datesUntil(checkOut).toList(); }
}

enum RoomType { DELUXE, SUITE }
enum BookingStatus { CONFIRMED, CANCELLED }
record Guest(String id) { }
record BookingId(long value) { }

class NoAvailabilityException extends RuntimeException { NoAvailabilityException(RoomType t, DateRange r) { super("No " + t + " room for " + r); } }

final class Room {
    private final String number; private final RoomType type;
    /** Confirmed bookings keyed by check-in date; ranges never overlap, so neighbours are enough to check. */
    private final TreeMap<LocalDate, Booking> calendar = new TreeMap<>();
    Room(String number, RoomType type) { this.number = number; this.type = type; }

    synchronized boolean isFree(DateRange r) {
        Map.Entry<LocalDate, Booking> before = calendar.lowerEntry(r.checkOut());   // last booking starting before we leave
        return before == null || !before.getValue().dates().overlaps(r);
    }

    /** Check and insert atomically for this room. */
    synchronized boolean tryBook(Booking b) {
        if (!isFree(b.dates())) return false;
        calendar.put(b.dates().checkIn(), b);
        return true;
    }

    synchronized void remove(Booking b) { calendar.remove(b.dates().checkIn(), b); }

    String number() { return number; } RoomType type() { return type; }
}

final class Booking {
    private final BookingId id; private final Guest guest; private final Room room; private final DateRange dates; private final Money price;
    private volatile BookingStatus status = BookingStatus.CONFIRMED;
    Booking(BookingId id, Guest guest, Room room, DateRange dates, Money price) {
        this.id = id; this.guest = guest; this.room = room; this.dates = dates; this.price = price;
    }
    synchronized void cancel() {
        if (status != BookingStatus.CONFIRMED) throw new IllegalStateException("Booking already " + status);
        status = BookingStatus.CANCELLED;
    }
    BookingId id() { return id; } Room room() { return room; } DateRange dates() { return dates; } Money price() { return price; } BookingStatus status() { return status; }
}

// ---------- pricing ----------
interface PricingStrategy { Money nightly(RoomType type, LocalDate night); }

final class NightlyRate implements PricingStrategy {
    private final Map<RoomType, Money> rates;
    NightlyRate(Map<RoomType, Money> rates) { this.rates = Map.copyOf(rates); }
    public Money nightly(RoomType type, LocalDate night) { return rates.get(type); }
}

/** Decorator: Friday and Saturday nights cost more. */
final class WeekendSurcharge implements PricingStrategy {
    private final PricingStrategy inner; private final int percent;
    WeekendSurcharge(PricingStrategy inner, int percent) { this.inner = inner; this.percent = percent; }
    public Money nightly(RoomType type, LocalDate night) {
        Money base = inner.nightly(type, night);
        DayOfWeek d = night.getDayOfWeek();
        return (d == DayOfWeek.FRIDAY || d == DayOfWeek.SATURDAY) ? base.plus(base.percent(percent)) : base;
    }
}

interface CancellationPolicy { Money fee(Booking b, Instant now, ZoneId hotelZone, PricingStrategy pricing); }

/** Free until N hours before check-in (14:00 local); after that, the first night is charged. */
final class FreeUntilHoursBefore implements CancellationPolicy {
    private final long hours;
    FreeUntilHoursBefore(long hours) { this.hours = hours; }
    public Money fee(Booking b, Instant now, ZoneId zone, PricingStrategy pricing) {
        Instant checkIn = b.dates().checkIn().atTime(14, 0).atZone(zone).toInstant();
        return Duration.between(now, checkIn).toHours() >= hours ? Money.ZERO
                : pricing.nightly(b.room().type(), b.dates().checkIn());
    }
}

// ---------- service ----------
final class HotelService {
    private final List<Room> rooms;
    private final PricingStrategy pricing;
    private final CancellationPolicy cancellation;
    private final Clock clock;
    private final ZoneId zone;
    private final Map<BookingId, Booking> bookings = new ConcurrentHashMap<>();
    private final AtomicLong ids = new AtomicLong();

    HotelService(List<Room> rooms, PricingStrategy pricing, CancellationPolicy cancellation, Clock clock, ZoneId zone) {
        this.rooms = List.copyOf(rooms); this.pricing = pricing; this.cancellation = cancellation; this.clock = clock; this.zone = zone;
    }

    List<Room> availableRooms(RoomType type, DateRange range) {
        return rooms.stream().filter(r -> r.type() == type && r.isFree(range)).toList();
    }

    Money quote(RoomType type, DateRange range) {
        return range.nights().stream().map(n -> pricing.nightly(type, n)).reduce(Money.ZERO, Money::plus);
    }

    Booking book(Guest guest, RoomType type, DateRange range) {
        Money price = quote(type, range);
        for (Room room : rooms) {
            if (room.type() != type) continue;
            Booking b = new Booking(new BookingId(ids.incrementAndGet()), guest, room, range, price);
            if (room.tryBook(b)) {                       // atomic per room; on a lost race, try the next room
                bookings.put(b.id(), b);
                return b;
            }
        }
        throw new NoAvailabilityException(type, range);
    }

    /** Cancels and returns the fee charged. */
    Money cancel(BookingId id) {
        Booking b = bookings.get(id);
        b.cancel();                                       // throws if already cancelled
        b.room().remove(b);
        return cancellation.fee(b, clock.instant(), zone, pricing);
    }
}

final class MutableClock extends Clock {
    private volatile Instant now;
    MutableClock(Instant start) { this.now = start; }
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
