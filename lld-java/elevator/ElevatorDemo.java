// Design an Elevator System — runnable reference solution for the lesson.
// Run: java lld-java/elevator/ElevatorDemo.java
import java.util.*;
import java.util.concurrent.*;

public class ElevatorDemo {
    public static void main(String[] args) throws Exception {
        // LOOK order: car at 5 going up with stops 8 and 2 → serves 8 first, then 2
        var car = new ElevatorCar(1, 0, 10, 5);
        car.addStop(8);
        car.addStop(2);
        List<Integer> served = runUntilIdle(car);
        Check.that(served.equals(List.of(8, 2)), "LOOK serves 8 (ahead) before 2 (behind): " + served);

        // A stop requested behind the car mid-sweep is served on the way back, never skipped
        var c2 = new ElevatorCar(2, 0, 10, 0);
        c2.addStop(9);
        for (int i = 0; i < 4; i++) c2.step();          // now at floor 4 going up
        c2.addStop(2);                                  // behind → downStops
        c2.addStop(6);                                  // ahead → upStops
        Check.that(runUntilIdle(c2).equals(List.of(6, 9, 2)), "6 and 9 on the way up, then 2");

        // Regression: pressing the floor the car is passing while moving DOWN must not strand the stop
        var c4 = new ElevatorCar(4, 0, 10, 8);
        c4.addStop(1);
        c4.step(); c4.step();                           // moving down, now at 6
        c4.addStop(6);                                  // the floor it is passing
        Check.that(runUntilIdle(c4).equals(List.of(1, 6)), "passing floor served after reversing");

        // Door handling: pressing the current floor while idle opens the doors without moving
        var c3 = new ElevatorCar(3, 0, 10, 3);
        c3.addStop(3);
        Check.that(c3.state() == CarState.DOORS_OPEN && c3.currentFloor() == 3, "same-floor call opens doors");

        // Dispatch: idle car nearest to the call wins; maintenance cars are never chosen
        var a = new ElevatorCar(10, 0, 20, 0);
        var b = new ElevatorCar(11, 0, 20, 12);
        var system = new ElevatorSystem(List.of(a, b), new NearestSuitableCar());
        Check.that(system.callFromFloor(10, Direction.DOWN) == b, "car at 12 answers a call at 10");
        b.startMaintenance();
        var c = new ElevatorCar(12, 0, 20, 19);
        var system2 = new ElevatorSystem(List.of(b, c), new NearestSuitableCar());
        Check.that(system2.callFromFloor(13, Direction.UP) == c, "maintenance car skipped");
        Check.throwsEx(IllegalStateException.class, () -> b.addStop(4), "maintenance car rejects stops");
        Check.throwsEx(IllegalArgumentException.class, () -> a.addStop(99), "no such floor");

        // A car moving up is preferred for an up-call ahead of it over an idle car slightly closer behind
        var movingUp = new ElevatorCar(20, 0, 30, 5);
        movingUp.addStop(25);
        movingUp.step();                               // floor 6, going up
        var idleBelow = new ElevatorCar(21, 0, 30, 9);
        idleBelow.addStop(0); idleBelow.step();        // floor 8, going down
        var sys3 = new ElevatorSystem(List.of(movingUp, idleBelow), new NearestSuitableCar());
        Check.that(sys3.callFromFloor(12, Direction.UP) == movingUp, "on-the-way car beats a car moving away");

        // Concurrency: 8 threads press buttons while the tick thread moves the cars; every request is served
        var cars = List.of(new ElevatorCar(30, 0, 40, 0), new ElevatorCar(31, 0, 40, 40), new ElevatorCar(32, 0, 40, 20));
        var building = new ElevatorSystem(cars, new NearestSuitableCar());
        var ticker = Executors.newSingleThreadScheduledExecutor();
        ticker.scheduleAtFixedRate(building::tick, 0, 200, TimeUnit.MICROSECONDS);
        var pressers = Executors.newFixedThreadPool(8);
        var rnd = new Random(42);
        Set<Integer> requested = ConcurrentHashMap.newKeySet();
        List<Future<?>> fs = new ArrayList<>();
        for (int i = 0; i < 400; i++) {
            int floor = rnd.nextInt(41);
            boolean hall = rnd.nextBoolean();
            int carId = 30 + rnd.nextInt(3);
            requested.add(floor);
            fs.add(pressers.submit(() -> {
                if (hall) building.callFromFloor(floor, floor == 40 ? Direction.DOWN : Direction.UP);
                else building.pressInCar(carId, floor);
            }));
        }
        for (var f : fs) f.get();
        pressers.shutdown();
        long deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(10);
        while (cars.stream().anyMatch(ElevatorCar::hasPendingStops) && System.nanoTime() < deadline) Thread.sleep(5);
        ticker.shutdownNow();
        Check.that(cars.stream().noneMatch(ElevatorCar::hasPendingStops), "all stops served under concurrent presses");
        Set<Integer> visited = new HashSet<>();
        cars.forEach(cr -> visited.addAll(cr.doorOpenedAt()));
        Check.that(visited.containsAll(requested), "doors opened at every requested floor");

        Check.done("elevator");
    }

    static List<Integer> runUntilIdle(ElevatorCar car) {
        List<Integer> stops = new ArrayList<>();
        for (int i = 0; i < 200 && (car.hasPendingStops() || car.state() != CarState.IDLE); i++) {
            CarState before = car.state();
            car.step();
            if (before != CarState.DOORS_OPEN && car.state() == CarState.DOORS_OPEN) stops.add(car.currentFloor());
        }
        return stops;
    }
}

enum Direction { UP, DOWN, NONE }
enum CarState { IDLE, MOVING, DOORS_OPEN, MAINTENANCE }
record HallCall(int floor, Direction direction) { }

class NoElevatorAvailableException extends RuntimeException {
    NoElevatorAvailableException(HallCall c) { super("No car available for " + c); }
}

final class ElevatorCar {
    private final int id;
    private final int minFloor, maxFloor;
    private int currentFloor;
    private Direction direction = Direction.NONE;
    private CarState state = CarState.IDLE;
    private final TreeSet<Integer> upStops = new TreeSet<>();
    private final TreeSet<Integer> downStops = new TreeSet<>();
    private int doorTicksRemaining;
    private final List<Integer> doorLog = new ArrayList<>();      // for the demo's assertions

    ElevatorCar(int id, int minFloor, int maxFloor, int startFloor) {
        this.id = id; this.minFloor = minFloor; this.maxFloor = maxFloor; this.currentFloor = startFloor;
    }

    synchronized void addStop(int floor) {
        if (floor < minFloor || floor > maxFloor) throw new IllegalArgumentException("No floor " + floor);
        if (state == CarState.MAINTENANCE) throw new IllegalStateException("Car " + id + " in maintenance");
        if (floor == currentFloor && state != CarState.MOVING) { openDoors(); return; }
        if (floor > currentFloor) upStops.add(floor);
        else if (floor < currentFloor) downStops.add(floor);
        else (direction == Direction.UP ? downStops : upStops).add(floor);   // passing it now: serve on the return sweep
        if (direction == Direction.NONE) direction = floor > currentFloor ? Direction.UP : Direction.DOWN;
    }

    /** One simulation tick: open/close doors or move one floor. */
    synchronized void step() {
        switch (state) {
            case MAINTENANCE -> { return; }
            case DOORS_OPEN -> {
                if (--doorTicksRemaining <= 0) state = hasStops() ? CarState.MOVING : CarState.IDLE;
                return;
            }
            default -> { }
        }
        if (!hasStops()) { direction = Direction.NONE; state = CarState.IDLE; return; }

        // LOOK: reverse only when there are no more stops in the current direction
        if (direction == Direction.UP && upStops.isEmpty()) direction = Direction.DOWN;
        else if (direction == Direction.DOWN && downStops.isEmpty()) direction = Direction.UP;

        currentFloor += (direction == Direction.UP) ? 1 : -1;
        if (currentFloor < minFloor || currentFloor > maxFloor) throw new IllegalStateException("Car " + id + " left the shaft");
        state = CarState.MOVING;

        TreeSet<Integer> stops = direction == Direction.UP ? upStops : downStops;
        if (stops.remove(currentFloor)) openDoors();
    }

    private void openDoors() { state = CarState.DOORS_OPEN; doorTicksRemaining = 2; doorLog.add(currentFloor); }
    private boolean hasStops() { return !upStops.isEmpty() || !downStops.isEmpty(); }

    /** Rough cost for the dispatcher: distance, penalised if the car must reverse first. */
    synchronized int costTo(int floor, Direction callDir) {
        if (state == CarState.MAINTENANCE) return Integer.MAX_VALUE;
        int distance = Math.abs(currentFloor - floor);
        boolean onTheWay =
                direction == Direction.NONE
             || (direction == Direction.UP   && floor >= currentFloor && callDir != Direction.DOWN)
             || (direction == Direction.DOWN && floor <= currentFloor && callDir != Direction.UP);
        int pendingStops = upStops.size() + downStops.size();
        return onTheWay ? distance + pendingStops : distance + 2 * (maxFloor - minFloor) + pendingStops;
    }

    synchronized void startMaintenance() { state = CarState.MAINTENANCE; upStops.clear(); downStops.clear(); direction = Direction.NONE; }
    int id() { return id; }
    synchronized int currentFloor() { return currentFloor; }
    synchronized CarState state() { return state; }
    synchronized boolean hasPendingStops() { return hasStops() || state == CarState.DOORS_OPEN; }
    synchronized List<Integer> doorOpenedAt() { return List.copyOf(doorLog); }
}

interface DispatchStrategy { ElevatorCar choose(List<ElevatorCar> cars, HallCall call); }

final class NearestSuitableCar implements DispatchStrategy {
    @Override public ElevatorCar choose(List<ElevatorCar> cars, HallCall call) {
        ElevatorCar best = null;
        int bestCost = Integer.MAX_VALUE;
        for (ElevatorCar c : cars) {                       // read each cost once
            int cost = c.costTo(call.floor(), call.direction());
            if (cost < bestCost) { best = c; bestCost = cost; }
        }
        if (best == null) throw new NoElevatorAvailableException(call);
        return best;
    }
}

final class ElevatorSystem {
    private final List<ElevatorCar> cars;
    private final DispatchStrategy dispatcher;

    ElevatorSystem(List<ElevatorCar> cars, DispatchStrategy dispatcher) { this.cars = List.copyOf(cars); this.dispatcher = dispatcher; }

    ElevatorCar callFromFloor(int floor, Direction dir) {
        ElevatorCar car = dispatcher.choose(cars, new HallCall(floor, dir));
        car.addStop(floor);
        return car;
    }

    void pressInCar(int carId, int floor) { car(carId).addStop(floor); }

    void tick() { cars.forEach(ElevatorCar::step); }

    private ElevatorCar car(int id) {
        return cars.stream().filter(c -> c.id() == id).findFirst()
                   .orElseThrow(() -> new IllegalArgumentException("No car " + id));
    }
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
