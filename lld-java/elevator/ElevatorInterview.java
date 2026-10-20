// Design an Elevator System — the interview-sized version from the top of the lesson.
// Run: java lld-java/elevator/ElevatorInterview.java
import java.util.*;

public class ElevatorInterview {
    public static void main(String[] args) {
        var a = new Elevator(0);
        var b = new Elevator(1);
        var system = new ElevatorSystem(List.of(a, b), new NearestIdleFirst());
        b.floor = 8;
        check(system.callFromHall(6) == b, "nearest idle car answers");
        check(system.callFromHall(1) == a, "the other idle car takes the next call");
        system.pressInCar(0, 3);
        for (int i = 0; i < 3; i++) system.tick();
        check(a.floor == 3 && a.direction == Direction.IDLE, "car A served 1 then 3 and is idle");
        for (int i = 0; i < 2; i++) system.tick();
        check(b.floor == 6, "car B came down to 6");

        // LOOK: keep going up while stops remain above, then turn
        var c = new Elevator(2);
        c.floor = 5;
        c.addStop(7); c.addStop(2); c.addStop(9);
        List<Integer> visited = new ArrayList<>();
        while (c.direction != Direction.IDLE) { int before = c.stopsLeft(); c.step(); if (c.stopsLeft() < before) visited.add(c.floor); }
        check(visited.equals(List.of(7, 9, 2)), "serves 7, 9 going up, then 2: " + visited);
        c.addStop(2);
        check(c.direction == Direction.IDLE && c.stopsLeft() == 0, "a stop at the current floor opens the doors at once");
        done("elevator");
    }

    static int passed;
    static void check(boolean ok, String what) { if (!ok) throw new AssertionError("FAILED: " + what); passed++; }
    static void done(String name) { System.out.println("✓ " + name + " (interview version): " + passed + " checks passed"); }
}

// ---- lesson excerpt: everything below is shown in the lesson
enum Direction { UP, DOWN, IDLE }

class Elevator {
    final int id;
    int floor = 0;
    Direction direction = Direction.IDLE;
    private final TreeSet<Integer> stops = new TreeSet<>();      // sorted, so "next stop above me" is cheap

    Elevator(int id) { this.id = id; }

    void addStop(int f) {
        if (f == floor && direction == Direction.IDLE) return;   // already here: just open the doors
        stops.add(f);
        if (direction == Direction.IDLE) direction = f > floor ? Direction.UP : Direction.DOWN;
    }

    /** Move one floor. Keep going the same way while there are stops ahead, then turn (the LOOK algorithm). */
    void step() {
        if (stops.isEmpty()) { direction = Direction.IDLE; return; }
        if (direction == Direction.UP && stops.ceiling(floor) == null) direction = Direction.DOWN;
        if (direction == Direction.DOWN && stops.floor(floor) == null) direction = Direction.UP;
        floor += direction == Direction.UP ? 1 : -1;
        stops.remove(floor);                                     // arrived at a stop: doors open
        if (stops.isEmpty()) direction = Direction.IDLE;
    }

    int stopsLeft() { return stops.size(); }
}

interface DispatchStrategy { Elevator pick(List<Elevator> cars, int floor); }

class NearestIdleFirst implements DispatchStrategy {
    public Elevator pick(List<Elevator> cars, int floor) {
        return cars.stream()
                .min(Comparator.comparing((Elevator c) -> c.direction != Direction.IDLE)   // idle cars first
                        .thenComparingInt(c -> Math.abs(c.floor - floor)))                 // then the closest
                .orElseThrow();
    }
}

class ElevatorSystem {
    private final List<Elevator> cars;
    private final DispatchStrategy strategy;

    ElevatorSystem(List<Elevator> cars, DispatchStrategy strategy) { this.cars = cars; this.strategy = strategy; }

    synchronized Elevator callFromHall(int floor) {              // someone presses the button on a floor
        Elevator car = strategy.pick(cars, floor);
        car.addStop(floor);
        return car;
    }
    synchronized void pressInCar(int carId, int floor) { cars.get(carId).addStop(floor); }
    synchronized void tick() { cars.forEach(Elevator::step); }   // one time step for every car
}
