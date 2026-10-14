// Code Smells & Refactoring — the worked example from the lesson.
// "Before" and "after" are both here; main() checks they behave identically on thousands of random inputs.
// Run: java lld-java/refactoring/RefactoringDemo.java
import java.time.*;
import java.util.*;

public class RefactoringDemo {
    public static void main(String[] args) {
        var rnd = new Random(11);
        var before = new Before.ParkingManager();
        var after = new After.FeeCalculator(List.of(
                new After.MonthlyPassRule(),
                new After.EventFlatRule(Set.of(LocalDate.of(2026, 12, 31)), After.Money.inr(300)),
                new After.HourlyRule(Map.of(After.VehicleType.BIKE, After.Money.inr(20), After.VehicleType.CAR, After.Money.inr(40),
                        After.VehicleType.TRUCK, After.Money.inr(100)))),
                List.of(new After.WeekendSurcharge(25), new After.EvDiscount(20)));
        int checked = 0;
        for (int i = 0; i < 20_000; i++) {
            String type = List.of("bike", "car", "truck").get(rnd.nextInt(3));
            boolean ev = rnd.nextBoolean(), pass = rnd.nextInt(10) == 0;
            LocalDateTime in = LocalDateTime.of(2026, 12, 20 + rnd.nextInt(12), rnd.nextInt(24), rnd.nextInt(60));
            LocalDateTime out = in.plusMinutes(rnd.nextInt(60 * 30));
            long old = before.calc(type, ev, pass, in, out);
            long neu = after.fee(new After.Stay(After.VehicleType.valueOf(type.toUpperCase()), ev, pass, in, out)).paise();
            if (old != neu) throw new AssertionError("Mismatch for " + type + " ev=" + ev + " pass=" + pass + " " + in + "→" + out + ": " + old + " vs " + neu);
            checked++;
        }
        // The refactored code also rejects what the old code silently accepted
        try {
            after.fee(new After.Stay(After.VehicleType.CAR, false, false, LocalDateTime.of(2026, 12, 2, 10, 0), LocalDateTime.of(2026, 12, 1, 10, 0)));
            throw new AssertionError("exit before entry must be rejected");
        } catch (IllegalArgumentException expected) { checked++; }
        System.out.println("✓ refactoring: " + checked + " checks passed (before and after agree)");
    }
}

/** The original: one method, every smell in the lesson. Paise as long, types as strings. */
final class Before {
    static final class ParkingManager {
        long calc(String type, boolean ev, boolean pass, LocalDateTime in, LocalDateTime out) {
            if (pass) return 0;
            long mins = Duration.between(in, out).toMinutes();
            long hrs = mins / 60;
            if (mins % 60 != 0) hrs = hrs + 1;
            if (hrs == 0) hrs = 1;
            long fee;
            if (in.toLocalDate().equals(LocalDate.of(2026, 12, 31))) {
                fee = 30000;                                     // event night flat rate
            } else {
                if (type.equals("bike")) fee = hrs * 2000;
                else if (type.equals("car")) fee = hrs * 4000;
                else if (type.equals("truck")) fee = hrs * 10000;
                else throw new RuntimeException("bad type");
            }
            if (in.getDayOfWeek() == DayOfWeek.SATURDAY || in.getDayOfWeek() == DayOfWeek.SUNDAY) {
                fee = fee + fee * 25 / 100;
            }
            if (ev) fee = fee - fee * 20 / 100;
            return fee;
        }
    }
}

/** After: value objects, a rule for each way the base fee is computed, adjustments as a list. */
final class After {
    enum VehicleType { BIKE, CAR, TRUCK }

    record Money(long paise) {
        static final Money ZERO = new Money(0);
        static Money inr(long r) { return new Money(r * 100); }
        Money times(long n) { return new Money(paise * n); }
        Money plusPercent(long p) { return new Money(paise + paise * p / 100); }
        Money minusPercent(long p) { return new Money(paise - paise * p / 100); }
    }

    /** Everything the fee depends on, validated once. */
    record Stay(VehicleType type, boolean electric, boolean monthlyPass, LocalDateTime entry, LocalDateTime exit) {
        Stay {
            Objects.requireNonNull(type);
            if (exit.isBefore(entry)) throw new IllegalArgumentException("exit before entry");
        }
        long billableHours() {
            long minutes = Duration.between(entry, exit).toMinutes();
            return Math.max(1, (minutes + 59) / 60);              // round up, minimum one hour
        }
        boolean startsOnWeekend() {
            DayOfWeek d = entry.getDayOfWeek();
            return d == DayOfWeek.SATURDAY || d == DayOfWeek.SUNDAY;
        }
    }

    /** A way of computing the base fee; the first rule that applies wins. */
    interface FeeRule { Optional<Money> baseFee(Stay s); }

    record MonthlyPassRule() implements FeeRule {
        public Optional<Money> baseFee(Stay s) { return s.monthlyPass() ? Optional.of(Money.ZERO) : Optional.empty(); }
    }

    record EventFlatRule(Set<LocalDate> eventDays, Money flat) implements FeeRule {
        public Optional<Money> baseFee(Stay s) {
            return eventDays.contains(s.entry().toLocalDate()) ? Optional.of(flat) : Optional.empty();
        }
    }

    record HourlyRule(Map<VehicleType, Money> rates) implements FeeRule {
        public Optional<Money> baseFee(Stay s) { return Optional.of(rates.get(s.type()).times(s.billableHours())); }
    }

    /** Applied in order to the base fee. */
    interface Adjustment { Money apply(Money fee, Stay s); }

    record WeekendSurcharge(int percent) implements Adjustment {
        public Money apply(Money fee, Stay s) { return s.startsOnWeekend() ? fee.plusPercent(percent) : fee; }
    }

    record EvDiscount(int percent) implements Adjustment {
        public Money apply(Money fee, Stay s) { return s.electric() ? fee.minusPercent(percent) : fee; }
    }

    static final class FeeCalculator {
        private final List<FeeRule> rules;
        private final List<Adjustment> adjustments;
        FeeCalculator(List<FeeRule> rules, List<Adjustment> adjustments) { this.rules = List.copyOf(rules); this.adjustments = List.copyOf(adjustments); }

        Money fee(Stay stay) {
            Money fee = rules.stream().map(r -> r.baseFee(stay)).flatMap(Optional::stream).findFirst()
                    .orElseThrow(() -> new IllegalStateException("no fee rule applies"));
            for (Adjustment a : adjustments) fee = a.apply(fee, stay);
            return fee;
        }
    }
}
