// Design a Rate Limiter (LLD) — runnable reference solution for the lesson.
// Run: java lld-java/rate-limiter/RateLimiterDemo.java
import java.time.Duration;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.function.*;
import java.util.stream.Collectors;

public class RateLimiterDemo {
    public static void main(String[] args) throws Exception {
        var nanos = new AtomicLong(0);
        LongSupplier nanoClock = nanos::get;
        LongSupplier millisClock = () -> nanos.get() / 1_000_000;

        // Token bucket: burst of 5, then 1 token per 200 ms
        var tb = new TokenBucketLimiter(5, 1, Duration.ofMillis(200), nanoClock);
        Check.that(count(tb, "u", 10) == 5, "burst up to capacity");
        nanos.addAndGet(Duration.ofMillis(400).toNanos());
        Check.that(count(tb, "u", 10) == 2, "two tokens refilled after 400 ms");
        Check.that(count(tb, "other", 10) == 5, "keys are independent");
        nanos.addAndGet(Duration.ofSeconds(60).toNanos());
        Check.that(count(tb, "u", 10) == 5, "refill is capped at capacity");

        // Fixed window: 3 per second, resets at the boundary (and allows a 2× burst across it)
        nanos.set(Duration.ofMillis(900).toNanos());
        var fw = new FixedWindowLimiter(3, 1_000, millisClock);
        Check.that(count(fw, "k", 5) == 3, "3 at the end of window 0");
        nanos.set(Duration.ofMillis(1_000).toNanos());
        Check.that(count(fw, "k", 5) == 3, "3 more right after the boundary: the known 2× burst");

        // Sliding log: exact — 3 per second over any rolling second
        nanos.set(0);
        var log = new SlidingWindowLogLimiter(3, Duration.ofSeconds(1).toNanos(), nanoClock);
        Check.that(count(log, "k", 3) == 3, "3 allowed");
        nanos.set(Duration.ofMillis(999).toNanos());
        Check.that(!log.tryAcquire("k"), "still within the rolling second");
        nanos.set(Duration.ofMillis(1_000).toNanos());
        Check.that(log.tryAcquire("k"), "oldest entry slides out at exactly 1 s");

        // Sliding counter: weighted estimate blocks the boundary burst
        nanos.set(Duration.ofMillis(900).toNanos());
        var sc = new SlidingWindowCounterLimiter(10, 1_000, millisClock);
        Check.that(count(sc, "k", 20) == 10, "10 in window 0");
        nanos.set(Duration.ofMillis(1_100).toNanos());              // 10% into window 1 → previous weighted 0.9
        Check.that(count(sc, "k", 20) == 1, "only 1 more: 10 × 0.9 + 1 reaches the limit");

        // Concurrency: 32 threads × 1,000 attempts on one key, no refill → exactly 5,000 allowed
        var noRefill = new TokenBucketLimiter(5_000, 1, Duration.ofDays(365), System::nanoTime);
        Check.that(hammer(noRefill, 32, 1_000) == 5_000, "token bucket never over-admits under contention");
        var fixed = new FixedWindowLimiter(5_000, 3_600_000, System::currentTimeMillis);
        Check.that(hammer(fixed, 32, 1_000) == 5_000, "fixed window exact under contention");
        var logC = new SlidingWindowLogLimiter(5_000, Duration.ofHours(1).toNanos(), System::nanoTime);
        Check.that(hammer(logC, 32, 1_000) == 5_000, "sliding log exact under contention");

        // Clock read inside the lock: interleaved timestamps never produce negative refills
        var weird = new AtomicLong(1_000_000_000L);
        var tb2 = new TokenBucketLimiter(1, 1, Duration.ofSeconds(1), () -> weird.getAndAdd(1));
        Check.that(tb2.tryAcquire("x") && !tb2.tryAcquire("x"), "one token, then empty");

        // Service: several rules per request; rules whose key is null are skipped
        var rules = List.of(
                new RateLimitRule("per-user", 2, Duration.ofMinutes(1), Algorithm.FIXED_WINDOW, ctx -> ctx.userId()),
                new RateLimitRule("per-ip", 3, Duration.ofMinutes(1), Algorithm.FIXED_WINDOW, ctx -> ctx.ip()));
        var service = new RateLimiterService(rules, new RateLimiterFactory());
        Check.that(service.allow(new RequestContext("alice", "1.1.1.1")).allowed(), "1st ok");
        Check.that(service.allow(new RequestContext("alice", "1.1.1.1")).allowed(), "2nd ok");
        Decision d = service.allow(new RequestContext("alice", "1.1.1.1"));
        Check.that(!d.allowed() && d.rule().equals("per-user"), "3rd rejected by the per-user rule");
        // The rejected 3rd request never reached the per-ip rule, so the IP has used 2 of 3
        Check.that(service.allow(new RequestContext(null, "1.1.1.1")).allowed(), "anonymous request: per-user rule skipped, per-ip 3/3");
        Check.that(service.allow(new RequestContext(null, "1.1.1.1")).rule().equals("per-ip"), "next anonymous request rejected by per-ip");

        // Idle-key eviction bounds memory
        nanos.set(0);
        var evicting = new TokenBucketLimiter(5, 5, Duration.ofSeconds(1), nanoClock);
        for (int i = 0; i < 1_000; i++) evicting.tryAcquire("user-" + i);
        nanos.set(Duration.ofSeconds(10).toNanos());
        evicting.tryAcquire("fresh");
        int removed = evicting.evictIdle(Duration.ofSeconds(5));
        Check.that(removed == 1_000 && evicting.size() == 1, "idle buckets removed, active one kept");

        Check.done("rate-limiter");
    }

    static int count(RateLimiter l, String key, int attempts) {
        int ok = 0;
        for (int i = 0; i < attempts; i++) if (l.tryAcquire(key)) ok++;
        return ok;
    }

    static int hammer(RateLimiter l, int threads, int each) throws Exception {
        var allowed = new AtomicInteger();
        var start = new CountDownLatch(1);
        var pool = Executors.newFixedThreadPool(threads);
        List<Future<?>> fs = new ArrayList<>();
        for (int t = 0; t < threads; t++) fs.add(pool.submit(() -> {
            start.await();
            for (int i = 0; i < each; i++) if (l.tryAcquire("hot")) allowed.incrementAndGet();
            return null;
        }));
        start.countDown();
        for (var f : fs) f.get();
        pool.shutdown();
        return allowed.get();
    }
}

interface RateLimiter { boolean tryAcquire(String key); }

final class TokenBucketLimiter implements RateLimiter {
    private final long capacity;
    private final double refillPerNano;
    private final LongSupplier nanoClock;
    private final ConcurrentHashMap<String, Bucket> buckets = new ConcurrentHashMap<>();

    private static final class Bucket {
        double tokens;
        long lastRefillNanos;
        Bucket(double tokens, long now) { this.tokens = tokens; this.lastRefillNanos = now; }
    }

    TokenBucketLimiter(long capacity, long refillTokens, Duration refillPeriod, LongSupplier nanoClock) {
        this.capacity = capacity;
        this.refillPerNano = (double) refillTokens / refillPeriod.toNanos();
        this.nanoClock = nanoClock;
    }

    @Override public boolean tryAcquire(String key) {
        Bucket b = buckets.computeIfAbsent(key, k -> new Bucket(capacity, nanoClock.getAsLong()));
        synchronized (b) {                                      // per-key lock: keys don't contend
            long now = nanoClock.getAsLong();                   // read time inside the lock: monotonic per bucket
            double refill = Math.max(0, now - b.lastRefillNanos) * refillPerNano;
            b.tokens = Math.min(capacity, b.tokens + refill);
            b.lastRefillNanos = Math.max(b.lastRefillNanos, now);
            if (b.tokens >= 1) { b.tokens -= 1; return true; }
            return false;
        }
    }

    /** Removes buckets idle for longer than maxIdle (they would be full anyway). */
    int evictIdle(Duration maxIdle) {
        long cutoff = nanoClock.getAsLong() - maxIdle.toNanos();
        int[] removed = {0};
        buckets.forEach((key, b) -> {
            boolean idle;
            synchronized (b) { idle = b.lastRefillNanos < cutoff; }
            if (idle && buckets.remove(key, b)) removed[0]++;   // remove only if still the same bucket
        });
        return removed[0];
    }

    int size() { return buckets.size(); }
}

final class FixedWindowLimiter implements RateLimiter {
    private final int limit;
    private final long windowMillis;
    private final LongSupplier millisClock;
    private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();

    private record Window(long start, AtomicInteger count) { }

    FixedWindowLimiter(int limit, long windowMillis, LongSupplier millisClock) {
        this.limit = limit; this.windowMillis = windowMillis; this.millisClock = millisClock;
    }

    @Override public boolean tryAcquire(String key) {
        long now = millisClock.getAsLong();
        long start = now - (now % windowMillis);
        Window w = windows.compute(key, (k, old) ->
                old == null || old.start() < start ? new Window(start, new AtomicInteger()) : old);
        return w.count().incrementAndGet() <= limit;
    }
}

final class SlidingWindowLogLimiter implements RateLimiter {
    private final int limit;
    private final long windowNanos;
    private final LongSupplier nanoClock;
    private final ConcurrentHashMap<String, Deque<Long>> logs = new ConcurrentHashMap<>();

    SlidingWindowLogLimiter(int limit, long windowNanos, LongSupplier nanoClock) {
        this.limit = limit; this.windowNanos = windowNanos; this.nanoClock = nanoClock;
    }

    @Override public boolean tryAcquire(String key) {
        Deque<Long> log = logs.computeIfAbsent(key, k -> new ArrayDeque<>());
        synchronized (log) {
            long now = nanoClock.getAsLong();
            while (!log.isEmpty() && now - log.peekFirst() >= windowNanos) log.pollFirst();   // drop old entries
            if (log.size() >= limit) return false;           // rejected requests are NOT recorded
            log.addLast(now);
            return true;
        }
    }
}

final class SlidingWindowCounterLimiter implements RateLimiter {
    private final int limit; private final long windowMillis; private final LongSupplier millisClock;
    private final ConcurrentHashMap<String, Counters> state = new ConcurrentHashMap<>();

    private static final class Counters { long windowStart; int current; int previous; }

    SlidingWindowCounterLimiter(int limit, long windowMillis, LongSupplier millisClock) {
        this.limit = limit; this.windowMillis = windowMillis; this.millisClock = millisClock;
    }

    @Override public boolean tryAcquire(String key) {
        Counters c = state.computeIfAbsent(key, k -> new Counters());
        synchronized (c) {
            long now = millisClock.getAsLong();
            long start = now - (now % windowMillis);
            if (c.windowStart != start) {                    // roll windows forward
                c.previous = (start - c.windowStart == windowMillis) ? c.current : 0;
                c.current = 0;
                c.windowStart = start;
            }
            double elapsed = (double) (now - start) / windowMillis;
            double estimated = c.current + c.previous * (1 - elapsed);
            if (estimated + 1 > limit) return false;         // admitting this one must stay within the limit
            c.current++;
            return true;
        }
    }
}

enum Algorithm { TOKEN_BUCKET, FIXED_WINDOW, SLIDING_LOG, SLIDING_COUNTER }
record RequestContext(String userId, String ip) { }
record Decision(boolean allowed, String rule) {
    static Decision allowedDecision() { return new Decision(true, null); }
    static Decision rejected(String rule) { return new Decision(false, rule); }
}
record RateLimitRule(String id, int limit, Duration window, Algorithm algorithm,
                     Function<RequestContext, String> keyExtractor) { }

final class RateLimiterFactory {
    RateLimiter create(RateLimitRule r) {
        return switch (r.algorithm()) {
            case TOKEN_BUCKET    -> new TokenBucketLimiter(r.limit(), r.limit(), r.window(), System::nanoTime);
            case FIXED_WINDOW    -> new FixedWindowLimiter(r.limit(), r.window().toMillis(), System::currentTimeMillis);
            case SLIDING_LOG     -> new SlidingWindowLogLimiter(r.limit(), r.window().toNanos(), System::nanoTime);
            case SLIDING_COUNTER -> new SlidingWindowCounterLimiter(r.limit(), r.window().toMillis(), System::currentTimeMillis);
        };
    }
}

final class RateLimiterService {
    private final List<RateLimitRule> rules;
    private final Map<String, RateLimiter> limiters;

    RateLimiterService(List<RateLimitRule> rules, RateLimiterFactory factory) {
        this.rules = List.copyOf(rules);
        this.limiters = rules.stream().collect(Collectors.toMap(RateLimitRule::id, factory::create));
    }

    Decision allow(RequestContext ctx) {
        for (RateLimitRule rule : rules) {
            String key = rule.keyExtractor().apply(ctx);
            if (key == null) continue;                        // rule doesn't apply
            if (!limiters.get(rule.id()).tryAcquire(key)) return Decision.rejected(rule.id());
        }
        return Decision.allowedDecision();
    }
}

final class Check {
    private static int passed;
    static void that(boolean cond, String what) { if (!cond) throw new AssertionError("FAILED: " + what); passed++; }
    static void done(String name) { System.out.println("✓ " + name + ": " + passed + " checks passed"); }
}
