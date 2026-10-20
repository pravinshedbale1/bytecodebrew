// Design a Cab Booking System — the interview-sized version from the top of the lesson.
// Run: java lld-java/cab-booking/CabBookingInterview.java
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class CabBookingInterview {
    public static void main(String[] args) throws Exception {
        var service = new RideService(new NearestFirst(), new PerKmFare(50, 12));
        var near = new Driver("D1", new Location(1, 1));
        var far = new Driver("D2", new Location(9, 9));
        service.addDriver(near);
        service.addDriver(far);
        Ride r1 = service.request("asha", new Location(0, 0), new Location(3, 4));
        check(r1.driver == near, "nearest driver assigned");
        Ride r2 = service.request("ravi", new Location(0, 0), new Location(0, 1));
        check(r2.driver == far, "busy driver skipped");
        fails(() -> service.request("meera", new Location(0, 0), new Location(1, 1)), "no driver left");
        r1.start();
        fails(r1::start, "can't start twice");
        check(service.complete(r1) == 50 + 5 * 12, "fare: base + 5 km × 12");
        check(near.status.get() == DriverStatus.AVAILABLE, "driver free again after the trip");
        fails(() -> service.complete(r2), "can't complete a ride that never started");
        r2.cancel();
        check(far.status.get() == DriverStatus.AVAILABLE, "cancel frees the driver");

        var racer = new RideService(new NearestFirst(), new PerKmFare(50, 12));
        racer.addDriver(new Driver("only", new Location(0, 0)));
        var got = new AtomicInteger();
        try (var pool = Executors.newFixedThreadPool(8)) {
            for (int i = 0; i < 50; i++) pool.submit(() -> { try { racer.request("r", new Location(0, 0), new Location(1, 0)); got.incrementAndGet(); } catch (IllegalStateException none) { } });
        }
        check(got.get() == 1, "one driver is never given two rides");
        done("cab-booking");
    }

    static int passed;
    static void check(boolean ok, String what) { if (!ok) throw new AssertionError("FAILED: " + what); passed++; }
    static void fails(Runnable r, String what) { try { r.run(); } catch (RuntimeException e) { passed++; return; } throw new AssertionError("FAILED (no exception): " + what); }
    static void done(String name) { System.out.println("✓ " + name + " (interview version): " + passed + " checks passed"); }
}

// ---- lesson excerpt: everything below is shown in the lesson
record Location(double x, double y) {
    double distanceTo(Location o) { return Math.hypot(x - o.x, y - o.y); }   // km, on a flat map
}

enum DriverStatus { AVAILABLE, ON_TRIP }
enum RideStatus { ASSIGNED, STARTED, COMPLETED, CANCELLED }

class Driver {
    final String id;
    volatile Location location;
    final AtomicReference<DriverStatus> status = new AtomicReference<>(DriverStatus.AVAILABLE);
    Driver(String id, Location location) { this.id = id; this.location = location; }
}

class Ride {
    final String rider;
    final Driver driver;
    final Location pickup, drop;
    RideStatus status = RideStatus.ASSIGNED;

    Ride(String rider, Driver driver, Location pickup, Location drop) { this.rider = rider; this.driver = driver; this.pickup = pickup; this.drop = drop; }

    synchronized void start()    { moveTo(RideStatus.STARTED, RideStatus.ASSIGNED); }
    synchronized void complete() { moveTo(RideStatus.COMPLETED, RideStatus.STARTED); }
    synchronized void cancel()   { moveTo(RideStatus.CANCELLED, RideStatus.ASSIGNED); driver.status.set(DriverStatus.AVAILABLE); }

    private void moveTo(RideStatus next, RideStatus required) {
        if (status != required) throw new IllegalStateException("Can't go from " + status + " to " + next);
        status = next;
    }
}

interface MatchingStrategy { List<Driver> rank(Collection<Driver> drivers, Location pickup); }

class NearestFirst implements MatchingStrategy {
    public List<Driver> rank(Collection<Driver> drivers, Location pickup) {
        return drivers.stream()
                .filter(d -> d.status.get() == DriverStatus.AVAILABLE)
                .sorted(Comparator.comparingDouble(d -> d.location.distanceTo(pickup)))
                .toList();
    }
}

interface FareStrategy { int fare(double km); }

record PerKmFare(int base, int perKm) implements FareStrategy {
    public int fare(double km) { return base + (int) Math.ceil(km) * perKm; }
}

class RideService {
    private final Map<String, Driver> drivers = new ConcurrentHashMap<>();
    private final MatchingStrategy matching;
    private final FareStrategy fares;

    RideService(MatchingStrategy matching, FareStrategy fares) { this.matching = matching; this.fares = fares; }
    void addDriver(Driver d) { drivers.put(d.id, d); }

    Ride request(String rider, Location pickup, Location drop) {
        for (Driver d : matching.rank(drivers.values(), pickup))
            if (d.status.compareAndSet(DriverStatus.AVAILABLE, DriverStatus.ON_TRIP))   // atomic claim: one ride per driver
                return new Ride(rider, d, pickup, drop);
        throw new IllegalStateException("No driver available");
    }

    int complete(Ride ride) {
        ride.complete();
        ride.driver.status.set(DriverStatus.AVAILABLE);
        return fares.fare(ride.pickup.distanceTo(ride.drop));
    }
}
