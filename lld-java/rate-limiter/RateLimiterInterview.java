// Design a Rate Limiter (LLD) — the interview-sized version from the top of the lesson.
// Run: java lld-java/rate-limiter/RateLimiterInterview.java
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.function.LongSupplier;

public class RateLimiterInterview {
    public static void main(String[] args) throws Exception {
        var now = new AtomicLong(0);
        LongSupplier clock = now::get;

        var bucket = new TokenBucketLimiter(3, 1, clock);          // burst of 3, then 1 per second
        check(bucket.allow("u") && bucket.allow("u") && bucket.allow("u"), "burst up to capacity");
        check(!bucket.allow("u"), "fourth request rejected");
        check(bucket.allow("v"), "other users have their own bucket");
        now.set(1_000);
        check(bucket.allow("u") && !bucket.allow("u"), "one token back after a second");
        now.set(100_000);
        int burst = 0; while (bucket.allow("u")) burst++;
        check(burst == 3, "tokens never exceed capacity");

        var window = new FixedWindowLimiter(2, 1_000, clock);
        now.set(5_000);
        check(window.allow("u") && window.allow("u") && !window.allow("u"), "two per window");
        now.set(6_000);
        check(window.allow("u"), "new window resets the count");

        var shared = new TokenBucketLimiter(100, 1, () -> 0);
        var ok = new AtomicInteger();
        try (var pool = Executors.newFixedThreadPool(8)) {
            for (int i = 0; i < 1_000; i++) pool.submit(() -> { if (shared.allow("hot")) ok.incrementAndGet(); });
        }
        check(ok.get() == 100, "exactly capacity allowed under concurrency, got " + ok.get());
        done("rate-limiter");
    }

    static int passed;
    static void check(boolean ok, String what) { if (!ok) throw new AssertionError("FAILED: " + what); passed++; }
    static void done(String name) { System.out.println("✓ " + name + " (interview version): " + passed + " checks passed"); }
}

// ---- lesson excerpt: everything below is shown in the lesson
interface RateLimiter { boolean allow(String userId); }

class TokenBucketLimiter implements RateLimiter {
    private final int capacity;
    private final double tokensPerMilli;
    private final LongSupplier clock;                              // injected, so tests control time
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    TokenBucketLimiter(int capacity, int tokensPerSecond, LongSupplier clock) {
        this.capacity = capacity;
        this.tokensPerMilli = tokensPerSecond / 1000.0;
        this.clock = clock;
    }

    public boolean allow(String userId) {
        Bucket b = buckets.computeIfAbsent(userId, id -> new Bucket(capacity, clock.getAsLong()));
        synchronized (b) {                                         // lock one user's bucket, not everyone's
            long now = clock.getAsLong();
            b.tokens = Math.min(capacity, b.tokens + (now - b.lastRefill) * tokensPerMilli);
            b.lastRefill = now;
            if (b.tokens < 1) return false;
            b.tokens -= 1;
            return true;
        }
    }

    private static final class Bucket {
        double tokens;
        long lastRefill;
        Bucket(double tokens, long lastRefill) { this.tokens = tokens; this.lastRefill = lastRefill; }
    }
}

class FixedWindowLimiter implements RateLimiter {
    private final int limit;
    private final long windowMillis;
    private final LongSupplier clock;
    private final Map<String, Window> windows = new ConcurrentHashMap<>();

    FixedWindowLimiter(int limit, long windowMillis, LongSupplier clock) { this.limit = limit; this.windowMillis = windowMillis; this.clock = clock; }

    public boolean allow(String userId) {
        Window w = windows.computeIfAbsent(userId, id -> new Window());
        synchronized (w) {
            long now = clock.getAsLong(), start = now - now % windowMillis;
            if (w.start != start) { w.start = start; w.count = 0; }     // a new window has begun
            if (w.count >= limit) return false;
            w.count++;
            return true;
        }
    }

    private static final class Window { long start = -1; int count; }
}
