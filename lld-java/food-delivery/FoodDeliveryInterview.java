// Design a Food Delivery System — the interview-sized version from the top of the lesson.
// Run: java lld-java/food-delivery/FoodDeliveryInterview.java
import java.util.*;

public class FoodDeliveryInterview {
    public static void main(String[] args) {
        var dosaPlace = new Restaurant("R1", List.of(new MenuItem("Masala Dosa", 120), new MenuItem("Filter Coffee", 40)));
        var pizzaPlace = new Restaurant("R2", List.of(new MenuItem("Margherita", 300)));
        var cart = new Cart();
        cart.add(dosaPlace, "Masala Dosa", 2);
        cart.add(dosaPlace, "Filter Coffee", 1);
        fails(() -> cart.add(pizzaPlace, "Margherita", 1), "one restaurant per cart");
        fails(() -> cart.add(dosaPlace, "Biryani", 1), "item must be on the menu");
        check(cart.subtotal() == 280, "subtotal");

        var service = new OrderService();
        Order order = service.place(cart, new PercentOff(10, 50));
        check(order.total == 252, "10% off: 280 - 28");
        check(service.place(cartWith(dosaPlace, "Masala Dosa", 5), new PercentOff(50, 100)).total == 500, "discount is capped at ₹100");
        check(service.place(cartWith(dosaPlace, "Filter Coffee", 1), Coupon.NONE).total == 40, "no coupon");
        fails(() -> service.place(new Cart(), Coupon.NONE), "empty cart");

        order.moveTo(OrderStatus.PREPARING);
        fails(() -> order.moveTo(OrderStatus.DELIVERED), "can't skip delivery");
        order.moveTo(OrderStatus.OUT_FOR_DELIVERY);
        fails(() -> order.moveTo(OrderStatus.CANCELLED), "can't cancel once out for delivery");
        order.moveTo(OrderStatus.DELIVERED);
        check(order.status == OrderStatus.DELIVERED, "delivered");
        done("food-delivery");
    }

    static Cart cartWith(Restaurant r, String item, int qty) { var c = new Cart(); c.add(r, item, qty); return c; }
    static int passed;
    static void check(boolean ok, String what) { if (!ok) throw new AssertionError("FAILED: " + what); passed++; }
    static void fails(Runnable r, String what) { try { r.run(); } catch (RuntimeException e) { passed++; return; } throw new AssertionError("FAILED (no exception): " + what); }
    static void done(String name) { System.out.println("✓ " + name + " (interview version): " + passed + " checks passed"); }
}

// ---- lesson excerpt: everything below is shown in the lesson
record MenuItem(String name, int price) { }

class Restaurant {
    final String id;
    final Map<String, MenuItem> menu = new HashMap<>();
    Restaurant(String id, List<MenuItem> items) { this.id = id; items.forEach(i -> menu.put(i.name(), i)); }
}

class Cart {                                          // the cart owns its own rules
    private String restaurantId;
    private final Map<MenuItem, Integer> lines = new LinkedHashMap<>();

    void add(Restaurant r, String itemName, int qty) {
        if (restaurantId != null && !restaurantId.equals(r.id)) throw new IllegalStateException("Cart has items from another restaurant");
        MenuItem item = r.menu.get(itemName);
        if (item == null) throw new IllegalArgumentException(itemName + " is not on the menu");
        restaurantId = r.id;
        lines.merge(item, qty, Integer::sum);
    }

    int subtotal() { return lines.entrySet().stream().mapToInt(e -> e.getKey().price() * e.getValue()).sum(); }
    boolean isEmpty() { return lines.isEmpty(); }
}

interface Coupon {                                    // Strategy: each offer is one class
    int discount(int subtotal);
    Coupon NONE = subtotal -> 0;
}

record PercentOff(int percent, int maxDiscount) implements Coupon {
    public int discount(int subtotal) { return Math.min(subtotal * percent / 100, maxDiscount); }
}

enum OrderStatus {                                    // an enum is enough for a simple state machine
    PLACED, PREPARING, OUT_FOR_DELIVERY, DELIVERED, CANCELLED;

    boolean canMoveTo(OrderStatus next) {
        return switch (this) {
            case PLACED -> next == PREPARING || next == CANCELLED;
            case PREPARING -> next == OUT_FOR_DELIVERY || next == CANCELLED;
            case OUT_FOR_DELIVERY -> next == DELIVERED;
            case DELIVERED, CANCELLED -> false;
        };
    }
}

class Order {
    final int id;
    final int total;
    OrderStatus status = OrderStatus.PLACED;
    Order(int id, int total) { this.id = id; this.total = total; }

    synchronized void moveTo(OrderStatus next) {
        if (!status.canMoveTo(next)) throw new IllegalStateException("Can't go from " + status + " to " + next);
        status = next;
    }
}

class OrderService {
    private int nextId = 1;

    synchronized Order place(Cart cart, Coupon coupon) {
        if (cart.isEmpty()) throw new IllegalArgumentException("Cart is empty");
        int subtotal = cart.subtotal();
        return new Order(nextId++, subtotal - coupon.discount(subtotal));
    }
}
