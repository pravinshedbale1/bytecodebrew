// Design a Parking Lot — runnable reference solution for the lesson.
// Run: java lld-java/parking-lot/ParkingLot.java
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.concurrent.locks.ReentrantLock;
import java.util.stream.*;

public class ParkingLot {
    public static void main(String[] args) throws Exception {
        var clock = new MutableClock(Instant.parse("2026-10-15T10:00:00Z"));
        var payments = new FakePaymentProcessor();
        var service = newService(clock, payments, 2, 1, 2, 1);

        // Happy path: park, pay, leave
        Ticket t = service.park(new Vehicle("KA-01-AB-1234", VehicleType.CAR));
        Check.that(t.spotId().equals(new SpotId(0, 1)), "car gets the smallest fitting spot (MEDIUM, floor 0)");
        clock.advance(Duration.ofMinutes(61));
        Receipt r = service.unpark(t.id(), PaymentMethod.UPI);
        Check.that(r.amount().equals(Money.inr(80)), "61 minutes rounds up to 2 hours at ₹40/h");

        // A bike falls back to a larger spot when small ones are gone
        service.park(new Vehicle("B1", VehicleType.BIKE));
        service.park(new Vehicle("B2", VehicleType.BIKE));
        Ticket b3 = service.park(new Vehicle("B3", VehicleType.BIKE));
        Check.that(b3.spotId().equals(new SpotId(0, 2)), "third bike falls back to the last medium spot");

        // Duplicate entry and double exit are rejected
        Check.throwsEx(DuplicateEntryException.class, () -> service.park(new Vehicle("B1", VehicleType.BIKE)), "same plate cannot enter twice");
        service.unpark(b3.id(), PaymentMethod.CARD);
        Check.throwsEx(InvalidTicketException.class, () -> service.unpark(b3.id(), PaymentMethod.CARD), "ticket cannot be used twice");

        // Payment failure leaves the car parked and the ticket usable
        Ticket truck = service.park(new Vehicle("TRK", VehicleType.TRUCK));
        payments.failNext = true;
        Check.throwsEx(PaymentFailedException.class, () -> service.unpark(truck.id(), PaymentMethod.CARD), "payment failure propagates");
        Check.that(service.unpark(truck.id(), PaymentMethod.CARD).amount().equals(Money.inr(100)), "retry after a failed payment succeeds");

        // Two exit gates present the same ticket at once: exactly one charge
        Ticket shared = service.park(new Vehicle("KA-99", VehicleType.CAR));
        int before = payments.charges.get();
        var go = new CountDownLatch(1);
        var pool = Executors.newFixedThreadPool(2);
        List<Future<Boolean>> exits = new ArrayList<>();
        for (int i = 0; i < 2; i++) exits.add(pool.submit(() -> {
            go.await();
            try { service.unpark(shared.id(), PaymentMethod.CASH); return true; }
            catch (InvalidTicketException e) { return false; }
        }));
        go.countDown();
        int ok = 0; for (var f : exits) if (f.get()) ok++;
        pool.shutdown();
        Check.that(ok == 1 && payments.charges.get() == before + 1, "concurrent exits with one ticket charge exactly once");

        // 200 cars race through 16 gates for 3 floors × (10 small, 20 medium, 5 large)
        var big = newService(clock, new FakePaymentProcessor(), 3, 10, 20, 5);
        var start = new CountDownLatch(1);
        var gates = Executors.newFixedThreadPool(16);
        List<Future<Optional<Ticket>>> results = new ArrayList<>();
        for (int i = 0; i < 200; i++) {
            int n = i;
            results.add(gates.submit(() -> {
                start.await();
                try { return Optional.of(big.park(new Vehicle("C" + n, VehicleType.CAR))); }
                catch (ParkingFullException e) { return Optional.<Ticket>empty(); }
            }));
        }
        start.countDown();
        Set<SpotId> taken = new HashSet<>();
        for (var f : results) f.get().ifPresent(tk -> Check.that(taken.add(tk.spotId()), "spot " + tk.spotId() + " assigned once"));
        gates.shutdown();
        Check.that(taken.size() == 75, "cars fill every medium and large spot (60 + 15) and nothing more");
        Check.that(big.availability().get(0).get(SpotSize.SMALL) == 10, "cars never take small spots");

        Check.done("parking-lot");
    }

    static ParkingService newService(Clock clock, PaymentProcessor payments, int floorCount, int small, int medium, int large) {
        List<Floor> floors = IntStream.range(0, floorCount)
                .mapToObj(f -> new Floor(f, buildSpots(f, small, medium, large))).toList();
        return new ParkingService(floors, new SmallestFitFirst(),
                new HourlyPricing(Map.of(VehicleType.BIKE, Money.inr(20), VehicleType.CAR, Money.inr(40),
                                         VehicleType.TRUCK, Money.inr(100))),
                new InMemoryTicketRepository(), payments, clock);
    }

    static List<ParkingSpot> buildSpots(int floor, int small, int medium, int large) {
        List<ParkingSpot> spots = new ArrayList<>();
        int n = 0;
        for (int i = 0; i < small; i++)  spots.add(new ParkingSpot(new SpotId(floor, n++), SpotSize.SMALL));
        for (int i = 0; i < medium; i++) spots.add(new ParkingSpot(new SpotId(floor, n++), SpotSize.MEDIUM));
        for (int i = 0; i < large; i++)  spots.add(new ParkingSpot(new SpotId(floor, n++), SpotSize.LARGE));
        return spots;
    }
}

// ---------- model ----------
enum SpotSize { SMALL, MEDIUM, LARGE }

enum VehicleType {
    BIKE(SpotSize.SMALL), CAR(SpotSize.MEDIUM), TRUCK(SpotSize.LARGE);
    private final SpotSize minSpot;
    VehicleType(SpotSize s) { this.minSpot = s; }
    public SpotSize minSpot() { return minSpot; }
}

enum PaymentMethod { CASH, CARD, UPI }

record Money(long paise) implements Comparable<Money> {
    Money { if (paise < 0) throw new IllegalArgumentException("negative money"); }
    static Money inr(long rupees) { return new Money(rupees * 100); }
    Money times(long n) { return new Money(Math.multiplyExact(paise, n)); }
    public int compareTo(Money o) { return Long.compare(paise, o.paise); }
}

record Vehicle(String plate, VehicleType type) {
    Vehicle {
        if (plate == null || plate.isBlank()) throw new IllegalArgumentException("plate required");
        Objects.requireNonNull(type);
    }
}

record SpotId(int floor, int number) { }
record TicketId(String value) { }
record Ticket(TicketId id, Vehicle vehicle, SpotId spotId, Instant entryTime) { }
record Receipt(TicketId ticketId, Duration parkedFor, Money amount, String paymentRef) { }

// ---------- exceptions ----------
class ParkingException extends RuntimeException { ParkingException(String m) { super(m); } }
class ParkingFullException extends ParkingException { ParkingFullException(VehicleType t) { super("No free spot for " + t); } }
class DuplicateEntryException extends ParkingException { DuplicateEntryException(String p) { super("Already parked: " + p); } }
class InvalidTicketException extends ParkingException { InvalidTicketException(TicketId id) { super("Invalid or used ticket " + id.value()); } }
class PaymentFailedException extends ParkingException { PaymentFailedException(String m) { super(m); } }

// ---------- spots and floors ----------
final class ParkingSpot {
    private final SpotId id;
    private final SpotSize size;
    private Vehicle vehicle;                       // null when free; guarded by the floor's lock

    ParkingSpot(SpotId id, SpotSize size) { this.id = id; this.size = size; }

    boolean isFree() { return vehicle == null; }
    boolean canFit(Vehicle v) { return isFree() && size.compareTo(v.type().minSpot()) >= 0; }

    void occupy(Vehicle v) {
        if (!canFit(v)) throw new IllegalStateException("Spot " + id + " cannot take " + v.plate());
        this.vehicle = v;
    }

    void release() {
        if (vehicle == null) throw new IllegalStateException("Spot " + id + " already free");
        vehicle = null;
    }

    SpotId id() { return id; }
    SpotSize size() { return size; }
}

interface SpotAllocationStrategy {
    Optional<ParkingSpot> choose(List<ParkingSpot> candidates, Vehicle v);
}

/** Prefer the smallest spot that fits, to keep large spots for large vehicles. */
final class SmallestFitFirst implements SpotAllocationStrategy {
    @Override public Optional<ParkingSpot> choose(List<ParkingSpot> spots, Vehicle v) {
        return spots.stream()
                .filter(s -> s.canFit(v))
                .min(Comparator.comparing(ParkingSpot::size).thenComparing(s -> s.id().number()));
    }
}

final class Floor {
    private final int number;
    private final Map<SpotId, ParkingSpot> byId = new HashMap<>();
    private final List<ParkingSpot> spots;
    private final ReentrantLock lock = new ReentrantLock();

    Floor(int number, List<ParkingSpot> spots) {
        this.number = number;
        this.spots = List.copyOf(spots);
        spots.forEach(s -> byId.put(s.id(), s));
    }

    /** Check-and-occupy happens atomically, so two gates can't take the same spot. */
    Optional<ParkingSpot> tryOccupy(Vehicle v, SpotAllocationStrategy strategy) {
        lock.lock();
        try {
            Optional<ParkingSpot> spot = strategy.choose(spots, v);
            spot.ifPresent(s -> s.occupy(v));
            return spot;
        } finally {
            lock.unlock();
        }
    }

    void release(SpotId id) {
        lock.lock();
        try { byId.get(id).release(); } finally { lock.unlock(); }
    }

    long freeCount(SpotSize size) {
        lock.lock();
        try { return spots.stream().filter(s -> s.size() == size && s.isFree()).count(); }
        finally { lock.unlock(); }
    }

    int number() { return number; }
}

// ---------- pricing ----------
interface PricingStrategy { Money price(Ticket ticket, Instant exit); }

final class HourlyPricing implements PricingStrategy {
    private final Map<VehicleType, Money> hourlyRate;
    HourlyPricing(Map<VehicleType, Money> hourlyRate) { this.hourlyRate = Map.copyOf(hourlyRate); }

    @Override public Money price(Ticket t, Instant exit) {
        long minutes = Duration.between(t.entryTime(), exit).toMinutes();
        long hours = Math.max(1, (minutes + 59) / 60);                  // round up, minimum 1 hour
        return hourlyRate.get(t.vehicle().type()).times(hours);
    }
}

// ---------- payments ----------
interface PaymentProcessor { String charge(Money amount, PaymentMethod method); }

final class FakePaymentProcessor implements PaymentProcessor {
    final AtomicInteger charges = new AtomicInteger();
    volatile boolean failNext;
    public String charge(Money amount, PaymentMethod method) {
        if (failNext) { failNext = false; throw new PaymentFailedException("declined"); }
        return "PAY-" + charges.incrementAndGet();
    }
}

// ---------- repository ----------
interface TicketRepository {
    void save(Ticket t);
    Optional<Ticket> findActiveByPlate(String plate);
    Optional<Ticket> claim(TicketId id);          // atomically removes the active ticket; only one caller wins
    void restore(Ticket t);                       // undo a claim (e.g., payment failed)
}

final class InMemoryTicketRepository implements TicketRepository {
    private final ConcurrentHashMap<TicketId, Ticket> active = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, TicketId> byPlate = new ConcurrentHashMap<>();

    public void save(Ticket t) {
        if (byPlate.putIfAbsent(t.vehicle().plate(), t.id()) != null) throw new DuplicateEntryException(t.vehicle().plate());
        active.put(t.id(), t);
    }
    public Optional<Ticket> findActiveByPlate(String plate) {
        return Optional.ofNullable(byPlate.get(plate)).map(active::get);
    }
    public Optional<Ticket> claim(TicketId id) {
        Ticket t = active.remove(id);
        if (t != null) byPlate.remove(t.vehicle().plate());
        return Optional.ofNullable(t);
    }
    public void restore(Ticket t) { save(t); }
}

// ---------- service (facade) ----------
final class ParkingService {
    private final List<Floor> floors;
    private final SpotAllocationStrategy allocator;
    private final PricingStrategy pricing;
    private final TicketRepository tickets;
    private final PaymentProcessor payments;
    private final Clock clock;
    private final AtomicLong ticketSeq = new AtomicLong();

    ParkingService(List<Floor> floors, SpotAllocationStrategy allocator, PricingStrategy pricing,
                   TicketRepository tickets, PaymentProcessor payments, Clock clock) {
        this.floors = List.copyOf(floors); this.allocator = allocator; this.pricing = pricing;
        this.tickets = tickets; this.payments = payments; this.clock = clock;
    }

    Ticket park(Vehicle vehicle) {
        if (tickets.findActiveByPlate(vehicle.plate()).isPresent()) throw new DuplicateEntryException(vehicle.plate());
        for (Floor floor : floors) {                                    // lowest floor first
            Optional<ParkingSpot> spot = floor.tryOccupy(vehicle, allocator);
            if (spot.isPresent()) {
                var ticket = new Ticket(new TicketId("T" + ticketSeq.incrementAndGet()),
                                        vehicle, spot.get().id(), clock.instant());
                try {
                    tickets.save(ticket);                              // atomic plate check
                } catch (DuplicateEntryException e) {
                    floor.release(spot.get().id());                    // lost the race: give the spot back
                    throw e;
                }
                return ticket;
            }
        }
        throw new ParkingFullException(vehicle.type());
    }

    Receipt unpark(TicketId id, PaymentMethod method) {
        Ticket ticket = tickets.claim(id).orElseThrow(() -> new InvalidTicketException(id));   // one exit wins
        Instant exit = clock.instant();
        Money fee = pricing.price(ticket, exit);
        String paymentRef;
        try {
            paymentRef = payments.charge(fee, method);                  // outside any floor lock
        } catch (RuntimeException e) {
            tickets.restore(ticket);                                   // still parked; the driver can retry
            throw e;
        }
        floors.get(ticket.spotId().floor()).release(ticket.spotId());
        return new Receipt(id, Duration.between(ticket.entryTime(), exit), fee, paymentRef);
    }

    Map<Integer, Map<SpotSize, Long>> availability() {
        Map<Integer, Map<SpotSize, Long>> view = new TreeMap<>();
        for (Floor f : floors) {
            Map<SpotSize, Long> counts = new EnumMap<>(SpotSize.class);
            for (SpotSize s : SpotSize.values()) counts.put(s, f.freeCount(s));
            view.put(f.number(), counts);
        }
        return view;
    }
}

// ---------- test support ----------
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
    static void that(boolean cond, String what) {
        if (!cond) throw new AssertionError("FAILED: " + what);
        passed++;
    }
    static void throwsEx(Class<? extends Throwable> type, Runnable r, String what) {
        try { r.run(); } catch (Throwable t) {
            if (type.isInstance(t)) { passed++; return; }
            throw new AssertionError("FAILED: " + what + " — threw " + t);
        }
        throw new AssertionError("FAILED: " + what + " — nothing thrown");
    }
    static void done(String name) { System.out.println("✓ " + name + ": " + passed + " checks passed"); }
}
