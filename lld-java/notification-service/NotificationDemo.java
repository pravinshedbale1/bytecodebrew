// Design a Notification Service (LLD) — runnable reference solution for the lesson.
// Run: java lld-java/notification-service/NotificationDemo.java
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class NotificationDemo {
    public static void main(String[] args) throws Exception {
        var clock = new MutableClock(Instant.parse("2026-10-15T09:00:00Z"));       // 14:30 IST
        var email = new FakeProvider("ses");
        var smsPrimary = new FakeProvider("sms-a");
        var smsBackup = new FakeProvider("sms-b");
        var push = new FakeProvider("fcm");
        var prefs = new InMemoryPreferences();
        var users = Map.of(new UserId("u1"), new Contact("asha@example.com", "+919800000001", "device-1"),
                           new UserId("u2"), new Contact("ravi@example.com", "+919800000002", "device-2"));
        var templates = new TemplateStore(Map.of(
                "otp", Map.of(Channel.SMS, "Your OTP is {{code}}. Valid for 5 minutes."),
                "order_shipped", Map.of(Channel.EMAIL, "Hi {{name}}, order {{order}} has shipped.", Channel.PUSH, "Order {{order}} shipped"),
                "sale", Map.of(Channel.PUSH, "Big sale today, {{name}}!", Channel.EMAIL, "Sale starts now, {{name}}")));
        var senders = Map.<Channel, ChannelSender>of(
                Channel.EMAIL, new ProviderChannel(List.of(email)),
                Channel.SMS, new ProviderChannel(List.of(smsPrimary, smsBackup)),      // failover chain
                Channel.PUSH, new ProviderChannel(List.of(push)));
        var svc = new NotificationService(users::get, prefs, templates, senders,
                new DailyCap(clock, 2), RetryPolicy.exponential(3, Duration.ofSeconds(1)), clock, ZoneId.of("Asia/Kolkata"));

        // Fan-out across channels, rendered per channel
        svc.send(new NotificationRequest("k1", new UserId("u1"), "order_shipped", Category.TRANSACTIONAL,
                Map.of("name", "Asha", "order", "O-9"), Set.of(Channel.EMAIL, Channel.PUSH)));
        svc.processAll();
        Check.that(email.sent.equals(List.of("asha@example.com: Hi Asha, order O-9 has shipped.")), "email rendered");
        Check.that(push.sent.equals(List.of("device-1: Order O-9 shipped")), "push rendered");

        // Idempotency: the same key twice is delivered once
        svc.send(new NotificationRequest("k1", new UserId("u1"), "order_shipped", Category.TRANSACTIONAL,
                Map.of("name", "Asha", "order", "O-9"), Set.of(Channel.EMAIL)));
        svc.processAll();
        Check.that(email.sent.size() == 1, "duplicate request suppressed");

        // Preferences: opted out of marketing push
        prefs.optOut(new UserId("u2"), Category.MARKETING, Channel.PUSH);
        svc.send(new NotificationRequest("k2", new UserId("u2"), "sale", Category.MARKETING, Map.of("name", "Ravi"), Set.of(Channel.PUSH, Channel.EMAIL)));
        svc.processAll();
        Check.that(push.sent.size() == 1 && email.sent.getLast().startsWith("ravi@"), "push skipped, email sent");
        Check.that(svc.status("k2", Channel.PUSH) == DeliveryStatus.SKIPPED_PREFERENCE, "skip recorded with a reason");

        // Marketing cap: at most 2 per user per day; transactional is never capped
        for (int i = 3; i <= 5; i++)
            svc.send(new NotificationRequest("k" + i, new UserId("u2"), "sale", Category.MARKETING, Map.of("name", "Ravi"), Set.of(Channel.EMAIL)));
        svc.processAll();
        Check.that(email.sent.stream().filter(s -> s.startsWith("ravi@")).count() == 2, "daily marketing cap of 2");
        Check.that(svc.status("k4", Channel.EMAIL) == DeliveryStatus.SKIPPED_RATE_LIMIT, "capped message recorded");

        // Quiet hours (22:00–08:00 local): marketing deferred, OTP still immediate
        clock.set(Instant.parse("2026-10-15T17:00:00Z"));                                    // 22:30 IST
        svc.send(new NotificationRequest("k6", new UserId("u1"), "sale", Category.MARKETING, Map.of("name", "Asha"), Set.of(Channel.PUSH)));
        svc.send(new NotificationRequest("k7", new UserId("u1"), "otp", Category.CRITICAL, Map.of("code", "4821"), Set.of(Channel.SMS)));
        svc.processAll();
        Check.that(smsPrimary.sent.equals(List.of("+919800000001: Your OTP is 4821. Valid for 5 minutes.")), "OTP sent during quiet hours");
        Check.that(svc.status("k6", Channel.PUSH) == DeliveryStatus.DEFERRED, "marketing deferred");
        clock.set(Instant.parse("2026-10-16T02:31:00Z"));                                    // 08:01 IST next day
        svc.processAll();
        Check.that(push.sent.getLast().equals("device-1: Big sale today, Asha!"), "deferred message sent after quiet hours");

        // Provider failover: primary SMS down → backup used
        smsPrimary.down = true;
        svc.send(new NotificationRequest("k8", new UserId("u2"), "otp", Category.CRITICAL, Map.of("code", "1111"), Set.of(Channel.SMS)));
        svc.processAll();
        Check.that(smsBackup.sent.size() == 1 && svc.status("k8", Channel.SMS) == DeliveryStatus.SENT, "failed over to the backup provider");

        // Retries with backoff, then dead letter
        smsBackup.down = true;
        svc.send(new NotificationRequest("k9", new UserId("u2"), "otp", Category.CRITICAL, Map.of("code", "2222"), Set.of(Channel.SMS)));
        svc.processAll();
        Check.that(svc.status("k9", Channel.SMS) == DeliveryStatus.RETRY_SCHEDULED, "first failure → retry later");
        clock.advance(Duration.ofSeconds(1)); svc.processAll();
        clock.advance(Duration.ofSeconds(2)); svc.processAll();
        Check.that(svc.status("k9", Channel.SMS) == DeliveryStatus.FAILED && svc.deadLetters().size() == 1, "dead-lettered after 3 attempts");
        smsPrimary.down = false; smsBackup.down = false;

        // Priority: a backlog of marketing doesn't delay an OTP
        var order = new CopyOnWriteArrayList<String>();
        var recording = new ProviderChannel(List.of(new FakeProvider("rec") { @Override public void deliver(String to, String body) { order.add(body); } }));
        var svc2 = new NotificationService(users::get, new InMemoryPreferences(), templates, Map.of(Channel.SMS, recording, Channel.EMAIL, recording, Channel.PUSH, recording),
                new DailyCap(clock, 1_000), RetryPolicy.none(), clock, ZoneId.of("Asia/Kolkata"));
        for (int i = 0; i < 20; i++)
            svc2.send(new NotificationRequest("m" + i, new UserId("u1"), "sale", Category.MARKETING, Map.of("name", "A"), Set.of(Channel.PUSH)));
        svc2.send(new NotificationRequest("otp", new UserId("u1"), "otp", Category.CRITICAL, Map.of("code", "9"), Set.of(Channel.SMS)));
        svc2.send(new NotificationRequest("bad", new UserId("u1"), "otp", Category.CRITICAL, Map.of("code", "9"), Set.of(Channel.PUSH)));
        svc2.processAll();
        Check.that(order.get(0).startsWith("Your OTP") && order.size() == 21, "OTP delivered first despite the backlog");
        Check.that(svc2.status("bad", Channel.PUSH) == DeliveryStatus.FAILED, "missing template fails that delivery only, without retries");

        // Concurrency: 8 threads × 250 requests through real workers; every message delivered exactly once
        var counter = new FakeProvider("count");
        var svc3 = new NotificationService(users::get, new InMemoryPreferences(), templates,
                Map.of(Channel.EMAIL, new ProviderChannel(List.of(counter))),
                new DailyCap(clock, 1_000_000), RetryPolicy.none(), clock, ZoneId.of("Asia/Kolkata"));
        svc3.start(4);
        var pool = Executors.newFixedThreadPool(8);
        List<Future<?>> fs = new ArrayList<>();
        for (int t = 0; t < 8; t++) {
            int id = t;
            fs.add(pool.submit(() -> {
                for (int i = 0; i < 250; i++) {
                    String key = "c" + (i % 125) + "-" + id;          // every key sent twice → 1,000 unique
                    svc3.send(new NotificationRequest(key, new UserId("u1"), "order_shipped", Category.TRANSACTIONAL,
                            Map.of("name", "A", "order", key), Set.of(Channel.EMAIL)));
                }
            }));
        }
        for (var f : fs) f.get();
        pool.shutdown();
        svc3.awaitIdle(Duration.ofSeconds(10));
        svc3.stop();
        Check.that(counter.sent.size() == 1_000 && new HashSet<>(counter.sent).size() == 1_000, "1,000 unique deliveries, duplicates suppressed (" + counter.sent.size() + ")");

        Check.done("notification-service");
    }
}

// ---------- model ----------
record UserId(String value) { }
record Contact(String email, String phone, String deviceToken) { }
enum Channel { EMAIL, SMS, PUSH }
enum Category { CRITICAL, TRANSACTIONAL, MARKETING }                 // also the priority order
enum DeliveryStatus { QUEUED, SENT, RETRY_SCHEDULED, DEFERRED, FAILED, SKIPPED_PREFERENCE, SKIPPED_RATE_LIMIT }

record NotificationRequest(String idempotencyKey, UserId user, String template, Category category,
                           Map<String, String> params, Set<Channel> channels) { }

/** One unit of work: one request on one channel. */
final class Delivery implements Comparable<Delivery> {
    final NotificationRequest request; final Channel channel; final long seq;
    volatile Instant notBefore; volatile int attempts;
    Delivery(NotificationRequest r, Channel c, long seq, Instant notBefore) { this.request = r; this.channel = c; this.seq = seq; this.notBefore = notBefore; }
    String key() { return request.idempotencyKey() + "/" + channel; }
    public int compareTo(Delivery o) {                                // priority first, then FIFO
        int c = request.category().compareTo(o.request.category());
        return c != 0 ? c : Long.compare(seq, o.seq);
    }
}

// ---------- collaborators ----------
interface Preferences { boolean allows(UserId u, Category c, Channel ch); }
final class InMemoryPreferences implements Preferences {
    private final Set<String> optOuts = ConcurrentHashMap.newKeySet();
    void optOut(UserId u, Category c, Channel ch) { optOuts.add(u.value() + "|" + c + "|" + ch); }
    public boolean allows(UserId u, Category c, Channel ch) {
        return c == Category.CRITICAL || !optOuts.contains(u.value() + "|" + c + "|" + ch);   // can't opt out of OTPs
    }
}

final class TemplateStore {
    private final Map<String, Map<Channel, String>> templates;
    TemplateStore(Map<String, Map<Channel, String>> t) { this.templates = t; }
    Optional<String> render(String name, Channel ch, Map<String, String> params) {
        String body = templates.getOrDefault(name, Map.of()).get(ch);
        if (body == null) return Optional.empty();
        for (var e : params.entrySet()) body = body.replace("{{" + e.getKey() + "}}", e.getValue());
        return Optional.of(body);
    }
}

/** Per user, per day cap on MARKETING messages. */
final class DailyCap {
    private final Clock clock; private final int max;
    private final ConcurrentHashMap<String, AtomicInteger> counts = new ConcurrentHashMap<>();
    DailyCap(Clock clock, int max) { this.clock = clock; this.max = max; }
    boolean tryAcquire(UserId u) {
        String key = u.value() + "|" + LocalDate.ofInstant(clock.instant(), ZoneOffset.UTC);
        return counts.computeIfAbsent(key, k -> new AtomicInteger()).incrementAndGet() <= max;
    }
}

interface RetryPolicy {
    Optional<Duration> nextDelay(int attempt);
    static RetryPolicy none() { return a -> Optional.empty(); }
    static RetryPolicy exponential(int maxAttempts, Duration base) {
        return a -> a >= maxAttempts ? Optional.empty() : Optional.of(base.multipliedBy(1L << (a - 1)));
    }
}

class DeliveryException extends RuntimeException { DeliveryException(String m) { super(m); } }

/** Adapter over one vendor (SES, Twilio, FCM…). */
interface Provider { String name(); void deliver(String to, String body); }

class FakeProvider implements Provider {
    final List<String> sent = new CopyOnWriteArrayList<>();
    volatile boolean down;
    private final String name;
    FakeProvider(String name) { this.name = name; }
    public String name() { return name; }
    public void deliver(String to, String body) {
        if (down) throw new DeliveryException(name + " unavailable");
        sent.add(to + ": " + body);
    }
}

interface ChannelSender { void send(Contact to, Channel ch, String body); }

/** Tries providers in order — a small chain of responsibility for failover. */
final class ProviderChannel implements ChannelSender {
    private final List<Provider> providers;
    ProviderChannel(List<Provider> providers) { this.providers = List.copyOf(providers); }
    public void send(Contact to, Channel ch, String body) {
        String address = switch (ch) { case EMAIL -> to.email(); case SMS -> to.phone(); case PUSH -> to.deviceToken(); };
        DeliveryException last = null;
        for (Provider p : providers) {
            try { p.deliver(address, body); return; }
            catch (DeliveryException e) { last = e; }
        }
        throw last != null ? last : new DeliveryException("no provider");
    }
}

// ---------- service ----------
final class NotificationService {
    private final java.util.function.Function<UserId, Contact> contacts;
    private final Preferences prefs;
    private final TemplateStore templates;
    private final Map<Channel, ChannelSender> senders;
    private final DailyCap marketingCap;
    private final RetryPolicy retry;
    private final Clock clock;
    private final ZoneId userZone;
    private final PriorityBlockingQueue<Delivery> queue = new PriorityBlockingQueue<>();
    private final Set<String> seenKeys = ConcurrentHashMap.newKeySet();              // idempotency (TTL in production)
    private final Map<String, DeliveryStatus> status = new ConcurrentHashMap<>();
    private final Queue<Delivery> deadLetters = new ConcurrentLinkedQueue<>();
    private final AtomicLong seq = new AtomicLong();
    private final AtomicInteger inFlight = new AtomicInteger();
    private ExecutorService workers;
    private volatile boolean running;

    NotificationService(java.util.function.Function<UserId, Contact> contacts, Preferences prefs, TemplateStore templates,
                        Map<Channel, ChannelSender> senders, DailyCap marketingCap, RetryPolicy retry, Clock clock, ZoneId userZone) {
        this.contacts = contacts; this.prefs = prefs; this.templates = templates; this.senders = senders;
        this.marketingCap = marketingCap; this.retry = retry; this.clock = clock; this.userZone = userZone;
    }

    /** Accepts a request and returns immediately; delivery is asynchronous. */
    void send(NotificationRequest r) {
        if (!seenKeys.add(r.idempotencyKey())) return;                                // duplicate request
        for (Channel ch : r.channels()) {
            var d = new Delivery(r, ch, seq.incrementAndGet(), clock.instant());
            status.put(d.key(), DeliveryStatus.QUEUED);
            inFlight.incrementAndGet();
            queue.add(d);
        }
    }

    DeliveryStatus status(String key, Channel ch) { return status.get(key + "/" + ch); }
    List<Delivery> deadLetters() { return List.copyOf(deadLetters); }

    /** Test mode: process everything that is due, in priority order, on the calling thread. */
    void processAll() {
        List<Delivery> notYet = new ArrayList<>();
        Delivery d;
        while ((d = queue.poll()) != null) {
            if (d.notBefore.isAfter(clock.instant())) notYet.add(d); else process(d);
        }
        queue.addAll(notYet);
    }

    void start(int threads) {
        running = true;
        workers = Executors.newFixedThreadPool(threads);
        for (int i = 0; i < threads; i++) workers.submit(() -> {
            while (running) {
                Delivery d = queue.poll(50, TimeUnit.MILLISECONDS);
                if (d == null) continue;
                if (d.notBefore.isAfter(clock.instant())) { queue.add(d); Thread.sleep(5); continue; }
                process(d);
            }
            return null;
        });
    }

    void awaitIdle(Duration max) throws InterruptedException {
        long deadline = System.nanoTime() + max.toNanos();
        while (inFlight.get() > 0 && System.nanoTime() < deadline) Thread.sleep(5);
    }

    void stop() { running = false; workers.shutdown(); }

    private void process(Delivery d) {
        NotificationRequest r = d.request;
        try {
            if (!prefs.allows(r.user(), r.category(), d.channel)) { finish(d, DeliveryStatus.SKIPPED_PREFERENCE); return; }
            if (r.category() == Category.MARKETING && inQuietHours()) {               // defer, don't drop
                d.notBefore = nextMorning();
                status.put(d.key(), DeliveryStatus.DEFERRED);
                queue.add(d);
                return;
            }
            if (r.category() == Category.MARKETING && d.attempts == 0 && !marketingCap.tryAcquire(r.user())) {
                finish(d, DeliveryStatus.SKIPPED_RATE_LIMIT); return;
            }
            String body = templates.render(r.template(), d.channel, r.params())
                    .orElseThrow(() -> new IllegalArgumentException("No " + d.channel + " template for " + r.template()));
            senders.get(d.channel).send(contacts.apply(r.user()), d.channel, body);
            finish(d, DeliveryStatus.SENT);
        } catch (IllegalArgumentException permanent) {                                // bad request: retrying won't help
            deadLetters.add(d);
            finish(d, DeliveryStatus.FAILED);
        } catch (DeliveryException e) {
            Optional<Duration> delay = retry.nextDelay(++d.attempts);
            if (delay.isPresent()) {
                d.notBefore = clock.instant().plus(delay.get());
                status.put(d.key(), DeliveryStatus.RETRY_SCHEDULED);
                queue.add(d);
            } else {
                deadLetters.add(d);
                finish(d, DeliveryStatus.FAILED);
            }
        }
    }

    private void finish(Delivery d, DeliveryStatus s) { status.put(d.key(), s); inFlight.decrementAndGet(); }

    private boolean inQuietHours() {
        LocalTime t = LocalTime.ofInstant(clock.instant(), userZone);
        return t.isAfter(LocalTime.of(22, 0)) || t.isBefore(LocalTime.of(8, 0));
    }

    private Instant nextMorning() {
        ZonedDateTime now = ZonedDateTime.ofInstant(clock.instant(), userZone);
        ZonedDateTime eight = now.toLocalDate().atTime(8, 0).atZone(userZone);
        return (now.isBefore(eight) ? eight : eight.plusDays(1)).toInstant();
    }
}

final class MutableClock extends Clock {
    private volatile Instant now;
    MutableClock(Instant start) { this.now = start; }
    void advance(Duration d) { now = now.plus(d); }
    void set(Instant i) { now = i; }
    @Override public ZoneId getZone() { return ZoneOffset.UTC; }
    @Override public Clock withZone(ZoneId zone) { return this; }
    @Override public Instant instant() { return now; }
}

final class Check {
    private static int passed;
    static void that(boolean cond, String what) { if (!cond) throw new AssertionError("FAILED: " + what); passed++; }
    static void done(String name) { System.out.println("✓ " + name + ": " + passed + " checks passed"); }
}
