// Design a Hotel Booking System — the interview-sized version from the top of the lesson.
// Run: java lld-java/hotel-booking/HotelBookingInterview.java
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class HotelBookingInterview {
    public static void main(String[] args) throws Exception {
        LocalDate d = LocalDate.of(2026, 12, 20);
        var hotel = new Hotel(List.of(new Room("101", RoomType.STANDARD, 3000), new Room("201", RoomType.DELUXE, 5000)));
        Booking b1 = hotel.book("asha", RoomType.DELUXE, new DateRange(d, d.plusDays(3)));
        check(b1.price() == 15_000, "3 nights × ₹5000");
        fails(() -> hotel.book("ravi", RoomType.DELUXE, new DateRange(d.plusDays(2), d.plusDays(4))), "overlapping stay");
        Booking b2 = hotel.book("ravi", RoomType.DELUXE, new DateRange(d.plusDays(3), d.plusDays(5)));
        check(b2.room == b1.room, "check-out day is free for the next guest (half-open range)");
        check(hotel.search(RoomType.DELUXE, new DateRange(d, d.plusDays(1))).isEmpty(), "search hides booked rooms");
        hotel.cancel(b1);
        check(hotel.search(RoomType.DELUXE, new DateRange(d, d.plusDays(1))).size() == 1, "cancel frees the dates");
        fails(() -> new DateRange(d, d), "zero-night stay");

        var one = new Hotel(List.of(new Room("1", RoomType.STANDARD, 1000)));
        var ok = new AtomicInteger();
        try (var pool = Executors.newFixedThreadPool(8)) {
            for (int i = 0; i < 50; i++) pool.submit(() -> { try { one.book("g", RoomType.STANDARD, new DateRange(d, d.plusDays(1))); ok.incrementAndGet(); } catch (IllegalStateException full) { } });
        }
        check(ok.get() == 1, "no double booking under concurrency");
        done("hotel-booking");
    }

    static int passed;
    static void check(boolean ok, String what) { if (!ok) throw new AssertionError("FAILED: " + what); passed++; }
    static void fails(Runnable r, String what) { try { r.run(); } catch (RuntimeException e) { passed++; return; } throw new AssertionError("FAILED (no exception): " + what); }
    static void done(String name) { System.out.println("✓ " + name + " (interview version): " + passed + " checks passed"); }
}

// ---- lesson excerpt: everything below is shown in the lesson
record DateRange(LocalDate checkIn, LocalDate checkOut) {            // [checkIn, checkOut): you leave on checkOut
    DateRange {
        if (!checkOut.isAfter(checkIn)) throw new IllegalArgumentException("Stay at least one night");
    }
    boolean overlaps(DateRange o) { return checkIn.isBefore(o.checkOut) && o.checkIn.isBefore(checkOut); }
    long nights() { return ChronoUnit.DAYS.between(checkIn, checkOut); }
}

enum RoomType { STANDARD, DELUXE }

class Room {
    final String number;
    final RoomType type;
    final int pricePerNight;
    final List<Booking> bookings = new ArrayList<>();

    Room(String number, RoomType type, int pricePerNight) { this.number = number; this.type = type; this.pricePerNight = pricePerNight; }

    boolean isFree(DateRange dates) {
        return bookings.stream().filter(b -> b.active).noneMatch(b -> b.dates.overlaps(dates));
    }
}

class Booking {
    final String guest;
    final Room room;
    final DateRange dates;
    boolean active = true;

    Booking(String guest, Room room, DateRange dates) { this.guest = guest; this.room = room; this.dates = dates; }
    int price() { return (int) dates.nights() * room.pricePerNight; }
}

class Hotel {
    private final List<Room> rooms;
    Hotel(List<Room> rooms) { this.rooms = rooms; }

    synchronized List<Room> search(RoomType type, DateRange dates) {
        return rooms.stream().filter(r -> r.type == type && r.isFree(dates)).toList();
    }

    // synchronized: "is it free?" and "book it" happen as one step, so two guests can't get the same room
    synchronized Booking book(String guest, RoomType type, DateRange dates) {
        Room room = search(type, dates).stream().findFirst()
                .orElseThrow(() -> new IllegalStateException("No " + type + " room for those dates"));
        Booking booking = new Booking(guest, room, dates);
        room.bookings.add(booking);
        return booking;
    }

    synchronized void cancel(Booking booking) { booking.active = false; }
}
