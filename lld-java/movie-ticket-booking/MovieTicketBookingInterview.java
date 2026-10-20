// Design a Movie Ticket Booking System — the interview-sized version from the top of the lesson.
// Run: java lld-java/movie-ticket-booking/MovieTicketBookingInterview.java
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class MovieTicketBookingInterview {
    public static void main(String[] args) throws Exception {
        var show = new Show(List.of("A1", "A2", "A3"));
        check(show.hold("asha", List.of("A1", "A2"), 0), "hold two seats");
        check(!show.hold("ravi", List.of("A2", "A3"), 1_000), "all or nothing: A2 is held");
        check(show.available(1_000).equals(List.of("A3")), "A3 still free, nothing half-held");
        show.confirm("asha", List.of("A1", "A2"), 60_000);
        check(show.available(1_000_000).equals(List.of("A3")), "booked seats stay taken");
        fails(() -> show.confirm("asha", List.of("A1"), 60_000), "can't confirm twice");

        check(show.hold("ravi", List.of("A3"), 0), "ravi holds A3");
        check(show.hold("meera", List.of("A3"), Show.HOLD_MILLIS), "an expired hold frees the seat");
        fails(() -> show.confirm("ravi", List.of("A3"), Show.HOLD_MILLIS + 1), "ravi's hold expired and was taken");
        fails(() -> show.hold("x", List.of("Z9"), 0), "unknown seat");

        var big = new Show(List.of("B1"));
        var winners = new AtomicInteger();
        try (var pool = Executors.newFixedThreadPool(8)) {
            for (int i = 0; i < 100; i++) { String u = "u" + i; pool.submit(() -> { if (big.hold(u, List.of("B1"), 0)) winners.incrementAndGet(); }); }
        }
        check(winners.get() == 1, "100 users race for one seat: one wins");
        done("movie-ticket-booking");
    }

    static int passed;
    static void check(boolean ok, String what) { if (!ok) throw new AssertionError("FAILED: " + what); passed++; }
    static void fails(Runnable r, String what) { try { r.run(); } catch (RuntimeException e) { passed++; return; } throw new AssertionError("FAILED (no exception): " + what); }
    static void done(String name) { System.out.println("✓ " + name + " (interview version): " + passed + " checks passed"); }
}

// ---- lesson excerpt: everything below is shown in the lesson
enum SeatState { FREE, HELD, BOOKED }

class Seat {
    final String id;
    SeatState state = SeatState.FREE;
    String heldBy;
    long holdUntil;

    Seat(String id) { this.id = id; }

    boolean availableAt(long now) {                   // an expired hold counts as free
        return state == SeatState.FREE || (state == SeatState.HELD && now >= holdUntil);
    }
}

class Show {
    static final long HOLD_MILLIS = 10 * 60 * 1000;   // seats are held for 10 minutes while the user pays
    private final Map<String, Seat> seats = new LinkedHashMap<>();

    Show(List<String> seatIds) { seatIds.forEach(id -> seats.put(id, new Seat(id))); }

    // synchronized: two users can never hold the same seat
    synchronized boolean hold(String user, List<String> seatIds, long now) {
        List<Seat> wanted = seatIds.stream().map(this::seat).toList();
        if (!wanted.stream().allMatch(s -> s.availableAt(now))) return false;   // all or nothing
        for (Seat s : wanted) { s.state = SeatState.HELD; s.heldBy = user; s.holdUntil = now + HOLD_MILLIS; }
        return true;
    }

    synchronized void confirm(String user, List<String> seatIds, long now) {   // called after payment succeeds
        List<Seat> wanted = seatIds.stream().map(this::seat).toList();
        for (Seat s : wanted)
            if (s.state != SeatState.HELD || !user.equals(s.heldBy) || now >= s.holdUntil)
                throw new IllegalStateException("Seat " + s.id + " is no longer held for " + user);
        for (Seat s : wanted) s.state = SeatState.BOOKED;
    }

    synchronized List<String> available(long now) {
        return seats.values().stream().filter(s -> s.availableAt(now)).map(s -> s.id).toList();
    }

    private Seat seat(String id) {
        Seat s = seats.get(id);
        if (s == null) throw new IllegalArgumentException("No seat " + id);
        return s;
    }
}
