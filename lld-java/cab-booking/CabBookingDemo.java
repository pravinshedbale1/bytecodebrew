// Design a Cab Booking System (Uber/Ola LLD) — runnable reference solution for the lesson.
// Run: java lld-java/cab-booking/CabBookingDemo.java
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class CabBookingDemo {
    public static void main(String[] args) throws Exception {
        var clock = new MutableClock(Instant.parse("2026-10-15T09:00:00Z"));
        var index = new GridDriverIndex(1.0);                       // 1 km cells
        var fares = new SurgePricing(new DistanceTimeFare(Money.inr(50), Money.inr(12), Money.inr(2)), index, 2.0);
        var svc = new RideService(index, new NearestDriverMatching(index, 5.0), fares, clock);

        var d1 = svc.registerDriver("D1", VehicleType.SEDAN, new Location(0.5, 0.5));
        var d2 = svc.registerDriver("D2", VehicleType.SEDAN, new Location(3.0, 3.0));
        var d3 = svc.registerDriver("D3", VehicleType.AUTO, new Location(0.2, 0.1));
        var rider = new Rider("R1");

        // Nearest available driver of the requested type
        Ride r1 = svc.requestRide(rider, new Location(0, 0), new Location(6, 8), VehicleType.SEDAN);
        Check.that(r1.driver() == d1 && r1.status() == RideStatus.DRIVER_ASSIGNED, "nearest sedan assigned (D3 is an auto)");
        Check.that(d1.status() == DriverStatus.ON_TRIP, "driver taken off the market");
        Check.throwsEx(IllegalStateTransitionException.class, () -> svc.completeRide(r1.id()), "can't complete before starting");

        // Lifecycle and fare
        svc.driverArrived(r1.id());
        svc.startRide(r1.id());
        clock.advance(Duration.ofMinutes(20));
        Receipt receipt = svc.completeRide(r1.id());
        // 50 + 12 × 10 km + 2 × 20 min = 210 (no surge: supply ≥ demand)
        Check.that(receipt.fare().equals(Money.inr(210)), "fare = base + distance + time (" + receipt.fare() + ")");
        Check.that(d1.status() == DriverStatus.AVAILABLE && d1.location().equals(new Location(6, 8)), "driver free again, at the drop point");

        // Radius limit and no-driver case
        Check.throwsEx(NoDriverAvailableException.class,
                () -> svc.requestRide(rider, new Location(50, 50), new Location(51, 51), VehicleType.SEDAN), "nobody within 5 km");

        // Cancellation: free before assignment window ends, fee after the driver arrived
        Ride r2 = svc.requestRide(rider, new Location(3, 3), new Location(4, 4), VehicleType.SEDAN);
        Check.that(r2.driver() == d2, "D2 assigned");
        svc.driverArrived(r2.id());
        clock.advance(Duration.ofMinutes(6));
        Check.that(svc.cancelByRider(r2.id()).equals(Money.inr(50)), "late cancellation after arrival is charged");
        Check.that(d2.status() == DriverStatus.AVAILABLE && r2.status() == RideStatus.CANCELLED, "driver released");

        // Surge: in a cell with more open requests than free drivers, the fare multiplier rises (capped at 2×)
        var surge = new SurgePricing(new DistanceTimeFare(Money.inr(50), Money.inr(12), Money.inr(2)), index, 2.0);
        index.recordDemand(new Location(10.5, 10.5), 6);
        index.update(new Driver("S1", VehicleType.SEDAN, new Location(10.4, 10.4)));
        Money surged = surge.estimate(new Location(10.5, 10.5), new Location(10.5, 10.5), Duration.ZERO);
        Check.that(surged.equals(Money.inr(100)), "6 requests / 1 driver → capped at 2× of ₹50");

        // Concurrency: 200 riders, 60 drivers, same area → each driver assigned at most once
        var big = new GridDriverIndex(1.0);
        var bigSvc = new RideService(big, new NearestDriverMatching(big, 5.0),
                new DistanceTimeFare(Money.inr(50), Money.inr(12), Money.inr(2)), clock);
        var rnd = new Random(3);
        for (int i = 0; i < 60; i++) bigSvc.registerDriver("B" + i, VehicleType.SEDAN, new Location(rnd.nextDouble() * 3, rnd.nextDouble() * 3));
        var start = new CountDownLatch(1);
        var pool = Executors.newFixedThreadPool(32);
        List<Future<Optional<Ride>>> results = new ArrayList<>();
        for (int i = 0; i < 200; i++) {
            var who = new Rider("C" + i);
            var at = new Location(rnd.nextDouble() * 3, rnd.nextDouble() * 3);
            results.add(pool.submit(() -> {
                start.await();
                try { return Optional.of(bigSvc.requestRide(who, at, new Location(5, 5), VehicleType.SEDAN)); }
                catch (NoDriverAvailableException e) { return Optional.<Ride>empty(); }
            }));
        }
        start.countDown();
        Set<Driver> used = Collections.newSetFromMap(new IdentityHashMap<>());
        int assigned = 0;
        for (var f : results) {
            Optional<Ride> r = f.get();
            if (r.isPresent()) { assigned++; Check.that(used.add(r.get().driver()), "driver " + r.get().driver().id() + " assigned once"); }
        }
        pool.shutdown();
        Check.that(assigned == 60, "all 60 drivers used, 140 riders told no driver is available");

        Check.done("cab-booking");
    }
}

// ---------- value objects ----------
record Location(double x, double y) {                    // km on a local grid; use haversine for lat/long
    double distanceTo(Location o) { return Math.hypot(x - o.x, y - o.y); }
}
record Money(long paise) {
    static Money inr(long r) { return new Money(r * 100); }
    Money plus(Money o) { return new Money(paise + o.paise); }
    Money times(double f) { return new Money(Math.round(paise * f)); }
    @Override public String toString() { return "₹" + paise / 100 + (paise % 100 == 0 ? "" : "." + paise % 100); }
}
record Rider(String id) { }
record RideId(long value) { }
record Receipt(RideId ride, double distanceKm, Duration duration, Money fare) { }

enum VehicleType { AUTO, HATCHBACK, SEDAN, SUV }
enum DriverStatus { AVAILABLE, ON_TRIP, OFFLINE }
enum RideStatus { REQUESTED, DRIVER_ASSIGNED, DRIVER_ARRIVED, IN_PROGRESS, COMPLETED, CANCELLED }

class RideException extends RuntimeException { RideException(String m) { super(m); } }
class NoDriverAvailableException extends RideException { NoDriverAvailableException() { super("No driver available nearby"); } }
class IllegalStateTransitionException extends RideException { IllegalStateTransitionException(RideStatus from, RideStatus to) { super(from + " → " + to + " not allowed"); } }

// ---------- driver ----------
final class Driver {
    private final String id;
    private final VehicleType vehicle;
    private final AtomicReference<DriverStatus> status = new AtomicReference<>(DriverStatus.AVAILABLE);
    private volatile Location location;

    Driver(String id, VehicleType vehicle, Location location) { this.id = id; this.vehicle = vehicle; this.location = location; }

    /** The race-critical step: only one ride can move a driver from AVAILABLE to ON_TRIP. */
    boolean tryAssign() { return status.compareAndSet(DriverStatus.AVAILABLE, DriverStatus.ON_TRIP); }
    void release() { status.set(DriverStatus.AVAILABLE); }

    String id() { return id; }
    VehicleType vehicle() { return vehicle; }
    DriverStatus status() { return status.get(); }
    Location location() { return location; }
    void moveTo(Location l) { this.location = l; }
}

// ---------- spatial index ----------
interface DriverIndex {
    void update(Driver d);                                        // insert or move
    List<Driver> nearby(Location at, double radiusKm);            // candidates, unsorted
}

/** Fixed-size grid cells: a driver lives in exactly one cell; a query scans the cells overlapping the radius. */
final class GridDriverIndex implements DriverIndex {
    private record Cell(long cx, long cy) { }
    private final double cellKm;
    private final ConcurrentHashMap<Cell, Set<Driver>> cells = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<Driver, Cell> cellOf = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<Cell, AtomicInteger> demand = new ConcurrentHashMap<>();

    GridDriverIndex(double cellKm) { this.cellKm = cellKm; }

    private Cell cell(Location l) { return new Cell((long) Math.floor(l.x() / cellKm), (long) Math.floor(l.y() / cellKm)); }

    public void update(Driver d) {
        Cell now = cell(d.location());
        Cell before = cellOf.put(d, now);
        if (now.equals(before)) return;
        if (before != null) cells.getOrDefault(before, Set.of()).remove(d);
        cells.computeIfAbsent(now, c -> ConcurrentHashMap.newKeySet()).add(d);
    }

    public List<Driver> nearby(Location at, double radiusKm) {
        Cell c = cell(at);
        long r = (long) Math.ceil(radiusKm / cellKm);
        List<Driver> out = new ArrayList<>();
        for (long dx = -r; dx <= r; dx++)
            for (long dy = -r; dy <= r; dy++)
                for (Driver d : cells.getOrDefault(new Cell(c.cx() + dx, c.cy() + dy), Set.of()))
                    if (d.location().distanceTo(at) <= radiusKm) out.add(d);
        return out;
    }

    void recordDemand(Location at, int requests) { demand.computeIfAbsent(cell(at), k -> new AtomicInteger()).addAndGet(requests); }

    double demandSupplyRatio(Location at) {
        Cell c = cell(at);
        int open = demand.getOrDefault(c, new AtomicInteger()).get();
        long free = cells.getOrDefault(c, Set.of()).stream().filter(d -> d.status() == DriverStatus.AVAILABLE).count();
        return free == 0 ? (open == 0 ? 0 : Double.MAX_VALUE) : (double) open / free;
    }
}

// ---------- matching ----------
interface MatchingStrategy {
    /** Candidates in preference order; the service claims the first one it can. */
    List<Driver> candidates(Location pickup, VehicleType type);
}

final class NearestDriverMatching implements MatchingStrategy {
    private final DriverIndex index; private final double radiusKm;
    NearestDriverMatching(DriverIndex index, double radiusKm) { this.index = index; this.radiusKm = radiusKm; }
    public List<Driver> candidates(Location pickup, VehicleType type) {
        return index.nearby(pickup, radiusKm).stream()
                .filter(d -> d.vehicle() == type && d.status() == DriverStatus.AVAILABLE)
                .sorted(Comparator.comparingDouble(d -> d.location().distanceTo(pickup)))
                .toList();
    }
}

// ---------- pricing ----------
interface FareStrategy { Money estimate(Location from, Location to, Duration duration); }

final class DistanceTimeFare implements FareStrategy {
    private final Money base, perKm, perMinute;
    DistanceTimeFare(Money base, Money perKm, Money perMinute) { this.base = base; this.perKm = perKm; this.perMinute = perMinute; }
    public Money estimate(Location from, Location to, Duration duration) {
        return base.plus(perKm.times(from.distanceTo(to))).plus(perMinute.times(duration.toMinutes()));
    }
}

/** Decorator: multiplies any fare by demand/supply in the pickup cell, capped. */
final class SurgePricing implements FareStrategy {
    private final FareStrategy inner; private final GridDriverIndex index; private final double cap;
    SurgePricing(FareStrategy inner, GridDriverIndex index, double cap) { this.inner = inner; this.index = index; this.cap = cap; }
    public Money estimate(Location from, Location to, Duration duration) {
        double multiplier = Math.min(cap, Math.max(1.0, index.demandSupplyRatio(from)));
        return inner.estimate(from, to, duration).times(multiplier);
    }
}

// ---------- ride (state machine) ----------
final class Ride {
    private static final Map<RideStatus, Set<RideStatus>> ALLOWED = Map.of(
            RideStatus.REQUESTED, EnumSet.of(RideStatus.DRIVER_ASSIGNED, RideStatus.CANCELLED),
            RideStatus.DRIVER_ASSIGNED, EnumSet.of(RideStatus.DRIVER_ARRIVED, RideStatus.CANCELLED),
            RideStatus.DRIVER_ARRIVED, EnumSet.of(RideStatus.IN_PROGRESS, RideStatus.CANCELLED),
            RideStatus.IN_PROGRESS, EnumSet.of(RideStatus.COMPLETED),
            RideStatus.COMPLETED, EnumSet.noneOf(RideStatus.class),
            RideStatus.CANCELLED, EnumSet.noneOf(RideStatus.class));

    private final RideId id; private final Rider rider; private final Location pickup, drop;
    private Driver driver;
    private RideStatus status = RideStatus.REQUESTED;
    private Instant arrivedAt, startedAt;

    Ride(RideId id, Rider rider, Location pickup, Location drop) { this.id = id; this.rider = rider; this.pickup = pickup; this.drop = drop; }

    synchronized void transition(RideStatus next) {
        if (!ALLOWED.get(status).contains(next)) throw new IllegalStateTransitionException(status, next);
        status = next;
    }
    synchronized void assign(Driver d) { transition(RideStatus.DRIVER_ASSIGNED); driver = d; }
    synchronized void arrived(Instant at) { transition(RideStatus.DRIVER_ARRIVED); arrivedAt = at; }
    synchronized void start(Instant at) { transition(RideStatus.IN_PROGRESS); startedAt = at; }

    RideId id() { return id; } Driver driver() { return driver; } synchronized RideStatus status() { return status; }
    Location pickup() { return pickup; } Location drop() { return drop; } Instant arrivedAt() { return arrivedAt; } Instant startedAt() { return startedAt; }
}

// ---------- service (facade) ----------
final class RideService {
    private final GridDriverIndex index;
    private final MatchingStrategy matching;
    private final FareStrategy fares;
    private final Clock clock;
    private final Map<RideId, Ride> rides = new ConcurrentHashMap<>();
    private final AtomicLong ids = new AtomicLong();
    private final Duration freeCancelWindow = Duration.ofMinutes(5);
    private final Money cancellationFee = Money.inr(50);

    RideService(GridDriverIndex index, MatchingStrategy matching, FareStrategy fares, Clock clock) {
        this.index = index; this.matching = matching; this.fares = fares; this.clock = clock;
    }

    Driver registerDriver(String id, VehicleType type, Location at) {
        var d = new Driver(id, type, at);
        index.update(d);
        return d;
    }

    Ride requestRide(Rider rider, Location pickup, Location drop, VehicleType type) {
        Ride ride = new Ride(new RideId(ids.incrementAndGet()), rider, pickup, drop);
        for (Driver d : matching.candidates(pickup, type)) {
            if (d.tryAssign()) {                          // CAS: if another request got this driver first, try the next
                ride.assign(d);
                rides.put(ride.id(), ride);
                return ride;
            }
        }
        throw new NoDriverAvailableException();
    }

    void driverArrived(RideId id) { ride(id).arrived(clock.instant()); }
    void startRide(RideId id) { ride(id).start(clock.instant()); }

    Receipt completeRide(RideId id) {
        Ride r = ride(id);
        r.transition(RideStatus.COMPLETED);
        Duration took = Duration.between(r.startedAt(), clock.instant());
        Money fare = fares.estimate(r.pickup(), r.drop(), took);
        Driver d = r.driver();
        d.moveTo(r.drop());
        index.update(d);
        d.release();
        return new Receipt(id, r.pickup().distanceTo(r.drop()), took, fare);
    }

    /** Free within the window after assignment; a fee once the driver has waited past it. */
    Money cancelByRider(RideId id) {
        Ride r = ride(id);
        RideStatus before = r.status();
        r.transition(RideStatus.CANCELLED);
        if (r.driver() != null) r.driver().release();
        boolean late = before == RideStatus.DRIVER_ARRIVED
                && Duration.between(r.arrivedAt(), clock.instant()).compareTo(freeCancelWindow) > 0;
        return late ? cancellationFee : new Money(0);
    }

    private Ride ride(RideId id) {
        Ride r = rides.get(id);
        if (r == null) throw new RideException("Unknown ride " + id.value());
        return r;
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
