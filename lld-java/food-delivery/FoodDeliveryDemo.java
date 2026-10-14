// Design a Food Delivery System (Swiggy/Zomato LLD) — runnable reference solution for the lesson.
// Run: java lld-java/food-delivery/FoodDeliveryDemo.java
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class FoodDeliveryDemo {
    public static void main(String[] args) throws Exception {
        var events = new RecordingListener();
        var partners = new PartnerPool();
        var svc = new OrderService(new DistanceDeliveryFee(Money.inr(20), Money.inr(8)), partners, List.of(events));
        var dosa = new MenuItem("M1", "Masala Dosa", Money.inr(120), Integer.MAX_VALUE);
        var thali = new MenuItem("M2", "Special Thali", Money.inr(250), 10);             // limited daily stock
        var cafe = new Restaurant("R1", "Udupi Cafe", new Location(0, 0), List.of(dosa, thali));
        var pizza = new Restaurant("R2", "Pizza Place", new Location(1, 1), List.of(new MenuItem("P1", "Margherita", Money.inr(300), 100)));
        var customer = new Customer("C1", new Location(3, 4));
        partners.add(new Partner("DP1", new Location(0.5, 0)));
        partners.add(new Partner("DP2", new Location(5, 5)));

        // Cart: one restaurant at a time
        var cart = new Cart(customer);
        cart.add(cafe, dosa, 2);
        cart.add(cafe, thali, 1);
        Check.throwsEx(DifferentRestaurantException.class, () -> cart.add(pizza, pizza.item("P1"), 1), "can't mix restaurants");
        Check.that(cart.subtotal().equals(Money.inr(490)), "subtotal 2×120 + 250");

        // Pricing with coupons: best applicable one wins
        var coupons = List.of(new PercentOff("SAVE20", 20, Money.inr(100), Money.inr(300)), new FlatOff("FLAT50", Money.inr(50), Money.inr(200)));
        PriceBreakdown price = svc.price(cart, coupons);
        // subtotal 490, delivery 20 + 8 × 5 km = 60, discount min(20% of 490 = 98, cap 100) = 98 vs 50 → 98; tax 5% of (490 − 98) = 19.60
        Check.that(price.discount().equals(Money.inr(98)) && price.appliedCoupon().equals("SAVE20"), "best coupon chosen");
        Check.that(price.deliveryFee().equals(Money.inr(60)) && price.tax().equals(new Money(1_960)), "fees and tax");
        Check.that(price.total().equals(new Money(49_000 + 6_000 - 9_800 + 1_960)), "total " + price.total());
        Check.that(svc.price(smallCart(customer, cafe, dosa), coupons).discount().equals(Money.ZERO), "coupons below their minimum don't apply");

        // Place → lifecycle
        Order o = svc.place(cart, coupons);
        Check.that(o.status() == OrderStatus.PLACED && thali.stock() == 9, "placed; limited stock reserved");
        svc.restaurantAccepts(o.id());
        Check.that(o.partner().id().equals("DP1") && o.status() == OrderStatus.ACCEPTED, "nearest free partner to the restaurant assigned");
        Check.throwsEx(IllegalTransitionException.class, () -> svc.markDelivered(o.id()), "can't deliver before pickup");
        svc.markPreparing(o.id()); svc.markReady(o.id()); svc.markPickedUp(o.id()); svc.markDelivered(o.id());
        Check.that(o.status() == OrderStatus.DELIVERED && partners.isFree("DP1"), "delivered; partner freed");
        Check.that(events.seen.equals(List.of("PLACED", "ACCEPTED", "PREPARING", "READY", "PICKED_UP", "DELIVERED")), "every transition published " + events.seen);

        // Cancellation rules and refunds
        Order o2 = svc.place(cartWith(customer, cafe, dosa, 1), List.of());
        Check.that(svc.cancelByCustomer(o2.id()).equals(o2.price().total()), "full refund before the restaurant accepts");
        Order o3 = svc.place(cartWith(customer, cafe, thali, 2), List.of());
        svc.restaurantAccepts(o3.id()); svc.markPreparing(o3.id());
        Check.throwsEx(IllegalTransitionException.class, () -> svc.cancelByCustomer(o3.id()), "no customer cancellation once food is being prepared");
        Order o4 = svc.place(cartWith(customer, cafe, thali, 1), List.of());
        int before = thali.stock();
        svc.restaurantRejects(o4.id());
        Check.that(o4.status() == OrderStatus.CANCELLED && thali.stock() == before + 1, "restaurant rejection releases stock");

        // Concurrency: 100 customers race for the last 6 thalis → exactly 6 orders
        int left = thali.stock();
        var start = new CountDownLatch(1);
        var pool = Executors.newFixedThreadPool(32);
        List<Future<Boolean>> res = new ArrayList<>();
        for (int i = 0; i < 100; i++) {
            var c = new Customer("X" + i, new Location(1, 1));
            res.add(pool.submit(() -> {
                start.await();
                try { svc.place(cartWith(c, cafe, thali, 1), List.of()); return true; }
                catch (OutOfStockException e) { return false; }
            }));
        }
        start.countDown();
        int ok = 0; for (var f : res) if (f.get()) ok++;
        pool.shutdown();
        Check.that(ok == left && thali.stock() == 0, "stock never oversold (" + ok + " of " + left + ")");

        Check.done("food-delivery");
    }

    static Cart smallCart(Customer c, Restaurant r, MenuItem i) { return cartWith(c, r, i, 1); }
    static Cart cartWith(Customer c, Restaurant r, MenuItem i, int qty) { var cart = new Cart(c); cart.add(r, i, qty); return cart; }
}

// ---------- value objects ----------
record Money(long paise) implements Comparable<Money> {
    static final Money ZERO = new Money(0);
    static Money inr(long r) { return new Money(r * 100); }
    Money plus(Money o) { return new Money(paise + o.paise); }
    Money minus(Money o) { return new Money(paise - o.paise); }
    Money times(long n) { return new Money(paise * n); }
    Money percent(long p) { return new Money(paise * p / 100); }
    Money min(Money o) { return compareTo(o) <= 0 ? this : o; }
    public int compareTo(Money o) { return Long.compare(paise, o.paise); }
}
record Location(double x, double y) { double distanceTo(Location o) { return Math.hypot(x - o.x, y - o.y); } }
record Customer(String id, Location address) { }
record OrderId(long value) { }
record CartLine(MenuItem item, int quantity) { Money total() { return item.price().times(quantity); } }
record PriceBreakdown(Money subtotal, Money deliveryFee, Money discount, String appliedCoupon, Money tax, Money total) { }

enum OrderStatus { PLACED, ACCEPTED, PREPARING, READY, PICKED_UP, DELIVERED, CANCELLED }

class FoodException extends RuntimeException { FoodException(String m) { super(m); } }
class DifferentRestaurantException extends FoodException { DifferentRestaurantException() { super("Cart already has items from another restaurant"); } }
class OutOfStockException extends FoodException { OutOfStockException(String item) { super("Out of stock: " + item); } }
class IllegalTransitionException extends FoodException { IllegalTransitionException(OrderStatus a, OrderStatus b) { super(a + " → " + b + " not allowed"); } }
class NoPartnerAvailableException extends FoodException { NoPartnerAvailableException() { super("No delivery partner available"); } }

// ---------- catalogue ----------
final class MenuItem {
    private final String id, name; private final Money price;
    private final AtomicInteger stock;
    MenuItem(String id, String name, Money price, int stock) { this.id = id; this.name = name; this.price = price; this.stock = new AtomicInteger(stock); }

    /** Atomic reservation: never goes below zero, no matter how many threads order at once. */
    boolean tryReserve(int qty) {
        while (true) {
            int cur = stock.get();
            if (cur < qty) return false;
            if (stock.compareAndSet(cur, cur - qty)) return true;
        }
    }
    void release(int qty) { stock.addAndGet(qty); }
    String id() { return id; } String name() { return name; } Money price() { return price; } int stock() { return stock.get(); }
}

final class Restaurant {
    private final String id, name; private final Location location; private final Map<String, MenuItem> menu = new LinkedHashMap<>();
    Restaurant(String id, String name, Location location, List<MenuItem> items) {
        this.id = id; this.name = name; this.location = location; items.forEach(i -> menu.put(i.id(), i));
    }
    MenuItem item(String id) { return menu.get(id); }
    String id() { return id; } Location location() { return location; }
}

// ---------- cart ----------
final class Cart {
    private final Customer customer;
    private Restaurant restaurant;
    private final Map<String, CartLine> lines = new LinkedHashMap<>();
    Cart(Customer customer) { this.customer = customer; }

    void add(Restaurant r, MenuItem item, int qty) {
        if (qty <= 0) throw new IllegalArgumentException("quantity must be positive");
        if (restaurant != null && !restaurant.id().equals(r.id())) throw new DifferentRestaurantException();
        restaurant = r;
        lines.merge(item.id(), new CartLine(item, qty), (a, b) -> new CartLine(a.item(), a.quantity() + b.quantity()));
    }
    Money subtotal() { return lines.values().stream().map(CartLine::total).reduce(Money.ZERO, Money::plus); }
    List<CartLine> lines() { return List.copyOf(lines.values()); }
    Restaurant restaurant() { return restaurant; } Customer customer() { return customer; }
}

// ---------- pricing ----------
interface DeliveryFeePolicy { Money fee(Location from, Location to); }
final class DistanceDeliveryFee implements DeliveryFeePolicy {
    private final Money base, perKm;
    DistanceDeliveryFee(Money base, Money perKm) { this.base = base; this.perKm = perKm; }
    public Money fee(Location from, Location to) { return base.plus(perKm.times(Math.round(from.distanceTo(to)))); }
}

interface Coupon {
    String code();
    /** Discount for this subtotal, or ZERO when the coupon doesn't apply. */
    Money discountFor(Money subtotal);
}
record FlatOff(String code, Money amount, Money minOrder) implements Coupon {
    public Money discountFor(Money s) { return s.compareTo(minOrder) >= 0 ? amount.min(s) : Money.ZERO; }
}
record PercentOff(String code, int percent, Money cap, Money minOrder) implements Coupon {
    public Money discountFor(Money s) { return s.compareTo(minOrder) >= 0 ? s.percent(percent).min(cap) : Money.ZERO; }
}

// ---------- delivery partners ----------
final class Partner {
    private final String id; private volatile Location location;
    private final AtomicBoolean busy = new AtomicBoolean();
    Partner(String id, Location location) { this.id = id; this.location = location; }
    boolean tryClaim() { return busy.compareAndSet(false, true); }
    void free() { busy.set(false); }
    boolean isFree() { return !busy.get(); }
    String id() { return id; } Location location() { return location; }
}

final class PartnerPool {
    private final List<Partner> partners = new CopyOnWriteArrayList<>();
    void add(Partner p) { partners.add(p); }
    Partner assignNearest(Location pickup) {
        List<Partner> byDistance = partners.stream().filter(Partner::isFree)
                .sorted(Comparator.comparingDouble(p -> p.location().distanceTo(pickup))).toList();
        for (Partner p : byDistance) if (p.tryClaim()) return p;       // lost a race? take the next
        throw new NoPartnerAvailableException();
    }
    boolean isFree(String id) { return partners.stream().anyMatch(p -> p.id().equals(id) && p.isFree()); }
}

// ---------- order ----------
interface OrderListener { void onStatusChange(Order order, OrderStatus status); }
final class RecordingListener implements OrderListener {
    final List<String> seen = new CopyOnWriteArrayList<>();
    public void onStatusChange(Order o, OrderStatus s) { if (o.id().value() == 1) seen.add(s.name()); }
}

final class Order {
    private static final Map<OrderStatus, Set<OrderStatus>> ALLOWED = Map.of(
            OrderStatus.PLACED, EnumSet.of(OrderStatus.ACCEPTED, OrderStatus.CANCELLED),
            OrderStatus.ACCEPTED, EnumSet.of(OrderStatus.PREPARING, OrderStatus.CANCELLED),
            OrderStatus.PREPARING, EnumSet.of(OrderStatus.READY),
            OrderStatus.READY, EnumSet.of(OrderStatus.PICKED_UP),
            OrderStatus.PICKED_UP, EnumSet.of(OrderStatus.DELIVERED),
            OrderStatus.DELIVERED, EnumSet.noneOf(OrderStatus.class),
            OrderStatus.CANCELLED, EnumSet.noneOf(OrderStatus.class));

    private final OrderId id; private final Customer customer; private final Restaurant restaurant;
    private final List<CartLine> lines; private final PriceBreakdown price;
    private OrderStatus status = OrderStatus.PLACED;
    private Partner partner;

    Order(OrderId id, Customer c, Restaurant r, List<CartLine> lines, PriceBreakdown price) {
        this.id = id; this.customer = c; this.restaurant = r; this.lines = lines; this.price = price;
    }
    synchronized OrderStatus transition(OrderStatus next) {
        if (!ALLOWED.get(status).contains(next)) throw new IllegalTransitionException(status, next);
        OrderStatus prev = status;
        status = next;
        return prev;
    }
    synchronized void assign(Partner p) { this.partner = p; }
    OrderId id() { return id; } synchronized OrderStatus status() { return status; } synchronized Partner partner() { return partner; }
    List<CartLine> lines() { return lines; } PriceBreakdown price() { return price; } Restaurant restaurant() { return restaurant; } Customer customer() { return customer; }
}

final class OrderService {
    private final DeliveryFeePolicy deliveryFees;
    private final PartnerPool partners;
    private final List<OrderListener> listeners;
    private final Map<OrderId, Order> orders = new ConcurrentHashMap<>();
    private final AtomicLong ids = new AtomicLong();

    OrderService(DeliveryFeePolicy fees, PartnerPool partners, List<OrderListener> listeners) {
        this.deliveryFees = fees; this.partners = partners; this.listeners = List.copyOf(listeners);
    }

    PriceBreakdown price(Cart cart, List<? extends Coupon> coupons) {
        Money subtotal = cart.subtotal();
        Money fee = deliveryFees.fee(cart.restaurant().location(), cart.customer().address());
        Coupon best = null; Money discount = Money.ZERO;
        for (Coupon c : coupons) {                                   // pick the best applicable coupon
            Money d = c.discountFor(subtotal);
            if (d.compareTo(discount) > 0) { best = c; discount = d; }
        }
        Money tax = subtotal.minus(discount).percent(5);            // GST on food after discount
        Money total = subtotal.plus(fee).minus(discount).plus(tax);
        return new PriceBreakdown(subtotal, fee, discount, best == null ? null : best.code(), tax, total);
    }

    Order place(Cart cart, List<? extends Coupon> coupons) {
        List<CartLine> reserved = new ArrayList<>();
        for (CartLine line : cart.lines()) {                         // reserve all lines or none
            if (!line.item().tryReserve(line.quantity())) {
                reserved.forEach(l -> l.item().release(l.quantity()));
                throw new OutOfStockException(line.item().name());
            }
            reserved.add(line);
        }
        Order o = new Order(new OrderId(ids.incrementAndGet()), cart.customer(), cart.restaurant(), cart.lines(), price(cart, coupons));
        orders.put(o.id(), o);
        publish(o, OrderStatus.PLACED);
        return o;
    }

    void restaurantAccepts(OrderId id) {
        Order o = get(id);
        o.transition(OrderStatus.ACCEPTED);
        o.assign(partners.assignNearest(o.restaurant().location()));   // partner heads over while food is cooked
        publish(o, OrderStatus.ACCEPTED);
    }
    void markPreparing(OrderId id) { move(id, OrderStatus.PREPARING); }
    void markReady(OrderId id)     { move(id, OrderStatus.READY); }
    void markPickedUp(OrderId id)  { move(id, OrderStatus.PICKED_UP); }
    void markDelivered(OrderId id) {
        Order o = get(id);
        o.transition(OrderStatus.DELIVERED);
        o.partner().free();
        publish(o, OrderStatus.DELIVERED);
    }

    /** Customer may cancel only before preparation starts; returns the refund. */
    Money cancelByCustomer(OrderId id) { cancel(get(id)); return get(id).price().total(); }
    void restaurantRejects(OrderId id) { cancel(get(id)); }

    private void cancel(Order o) {
        o.transition(OrderStatus.CANCELLED);                       // only allowed from PLACED or ACCEPTED
        o.lines().forEach(l -> l.item().release(l.quantity()));
        if (o.partner() != null) o.partner().free();
        publish(o, OrderStatus.CANCELLED);
    }

    private void move(OrderId id, OrderStatus next) { Order o = get(id); o.transition(next); publish(o, next); }
    private void publish(Order o, OrderStatus s) { listeners.forEach(l -> l.onStatusChange(o, s)); }
    private Order get(OrderId id) { return Optional.ofNullable(orders.get(id)).orElseThrow(() -> new FoodException("Unknown order")); }
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
