// Design a Parking Lot — the interview-sized version from the top of the lesson.
// Run: java lld-java/parking-lot/ParkingLotInterview.java
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class ParkingLotInterview {
    public static void main(String[] args) throws Exception {
        long hour = 3_600_000;
        var lot = new ParkingLot(List.of(new ParkingSpot(1, VehicleType.CAR), new ParkingSpot(2, VehicleType.CAR), new ParkingSpot(3, VehicleType.BIKE)),
                new HourlyPricing(Map.of(VehicleType.CAR, 40, VehicleType.BIKE, 20, VehicleType.TRUCK, 100)));
        Ticket t = lot.park(new Vehicle("KA-01-1234", VehicleType.CAR), 0);
        check(t.spot().id == 1, "first free car spot");
        check(lot.unpark(t.id(), 2 * hour + hour / 2) == 120, "2.5 hours rounds up to 3 × ₹40");
        check(t.spot().isFree(), "spot freed on exit");
        Ticket bike = lot.park(new Vehicle("KA-02-9", VehicleType.BIKE), 0);
        check(lot.unpark(bike.id(), 10) == 20, "minimum one hour");
        fails(() -> lot.park(new Vehicle("TN-1", VehicleType.TRUCK), 0), "no truck spot");
        fails(() -> lot.unpark(999, 0), "unknown ticket");
        fails(() -> lot.unpark(t.id(), 0), "same ticket twice");

        // 50 cars race for 2 spots: exactly 2 get in
        var race = new ParkingLot(List.of(new ParkingSpot(1, VehicleType.CAR), new ParkingSpot(2, VehicleType.CAR)), new HourlyPricing(Map.of(VehicleType.CAR, 40)));
        var parked = new AtomicInteger();
        try (var pool = Executors.newFixedThreadPool(8)) {
            for (int i = 0; i < 50; i++) {
                int n = i;
                pool.submit(() -> { try { race.park(new Vehicle("C" + n, VehicleType.CAR), 0); parked.incrementAndGet(); } catch (IllegalStateException full) { } });
            }
        }
        check(parked.get() == 2, "no spot given twice under concurrent entry");
        done("parking-lot");
    }

    static int passed;
    static void check(boolean ok, String what) { if (!ok) throw new AssertionError("FAILED: " + what); passed++; }
    static void fails(Runnable r, String what) { try { r.run(); } catch (RuntimeException e) { passed++; return; } throw new AssertionError("FAILED (no exception): " + what); }
    static void done(String name) { System.out.println("✓ " + name + " (interview version): " + passed + " checks passed"); }
}

// ---- lesson excerpt: everything below is shown in the lesson
enum VehicleType { BIKE, CAR, TRUCK }

record Vehicle(String plate, VehicleType type) { }

record Ticket(int id, Vehicle vehicle, ParkingSpot spot, long entryMillis) { }

class ParkingSpot {
    final int id;
    final VehicleType type;                    // keep it simple: one vehicle type per spot
    private Vehicle parked;                    // null when free

    ParkingSpot(int id, VehicleType type) { this.id = id; this.type = type; }
    boolean isFree() { return parked == null; }
    void park(Vehicle v) { parked = v; }
    void free() { parked = null; }
}

interface PricingStrategy { int fee(Ticket ticket, long exitMillis); }

class HourlyPricing implements PricingStrategy {
    private final Map<VehicleType, Integer> ratePerHour;
    HourlyPricing(Map<VehicleType, Integer> ratePerHour) { this.ratePerHour = ratePerHour; }

    public int fee(Ticket t, long exitMillis) {
        long hours = Math.max(1, (exitMillis - t.entryMillis() + 3_599_999) / 3_600_000);   // round up, minimum 1
        return (int) hours * ratePerHour.get(t.vehicle().type());
    }
}

class ParkingLot {
    private final List<ParkingSpot> spots;
    private final PricingStrategy pricing;
    private final Map<Integer, Ticket> active = new HashMap<>();
    private int nextTicketId = 1;

    ParkingLot(List<ParkingSpot> spots, PricingStrategy pricing) { this.spots = spots; this.pricing = pricing; }

    // synchronized: two entry gates can never take the same spot
    synchronized Ticket park(Vehicle v, long nowMillis) {
        ParkingSpot spot = spots.stream()
                .filter(s -> s.isFree() && s.type == v.type())
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No free spot for " + v.type()));
        spot.park(v);
        Ticket ticket = new Ticket(nextTicketId++, v, spot, nowMillis);
        active.put(ticket.id(), ticket);
        return ticket;
    }

    synchronized int unpark(int ticketId, long nowMillis) {
        Ticket ticket = active.remove(ticketId);
        if (ticket == null) throw new IllegalArgumentException("Unknown or used ticket " + ticketId);
        ticket.spot().free();
        return pricing.fee(ticket, nowMillis);
    }
}
