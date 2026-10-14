// Design a Pub-Sub Message Broker — runnable reference solution for the lesson.
// Run: java lld-java/pub-sub/PubSubDemo.java
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.concurrent.locks.*;

public class PubSubDemo {
    public static void main(String[] args) throws Exception {
        try (var broker = new Broker(Clock.systemUTC())) {
            broker.createTopic("orders");
            Check.throwsEx(TopicExistsException.class, () -> broker.createTopic("orders"), "duplicate topic");
            Check.throwsEx(UnknownTopicException.class, () -> broker.publish("nope", "k", new byte[0]), "unknown topic");

            // Two subscribers, one slow: both get everything, in order; the slow one doesn't hold up the fast one
            var fast = new CollectingSubscriber(0);
            var slow = new CollectingSubscriber(2);
            broker.subscribe("orders", fast, StartFrom.EARLIEST);
            broker.subscribe("orders", slow, StartFrom.EARLIEST);
            for (int i = 0; i < 200; i++) broker.publish("orders", "k" + (i % 5), ("m" + i).getBytes());
            Check.that(fast.await(200, 5), "fast subscriber received all 200");
            Check.that(slow.received.size() < 200, "slow subscriber lags behind (" + slow.received.size() + ")");
            Check.that(slow.await(200, 10), "slow subscriber eventually catches up");
            Check.that(inOrder(fast.received) && inOrder(slow.received), "per-subscriber order preserved");

            // Concurrent publishers: offsets are unique and gap-free
            broker.createTopic("events");
            var all = new CollectingSubscriber(0);
            broker.subscribe("events", all, StartFrom.EARLIEST);
            var pool = Executors.newFixedThreadPool(8);
            Set<Long> offsets = ConcurrentHashMap.newKeySet();
            List<Future<?>> fs = new ArrayList<>();
            for (int t = 0; t < 8; t++) fs.add(pool.submit(() -> {
                for (int i = 0; i < 1_000; i++) offsets.add(broker.publish("events", null, new byte[]{1}));
            }));
            for (var f : fs) f.get();
            pool.shutdown();
            Check.that(offsets.size() == 8_000 && Collections.max(offsets) == 7_999, "8,000 unique, gap-free offsets");
            Check.that(all.await(8_000, 10) && inOrder(all.received), "subscriber sees all 8,000 in offset order");

            // Replay with seek: after rewinding, delivery restarts from the new offset (no stale batch leaks through)
            broker.createTopic("audit");
            for (int i = 0; i < 50; i++) broker.publish("audit", null, new byte[]{(byte) i});
            var replayer = new CollectingSubscriber(1);
            Subscription sub = broker.subscribe("audit", replayer, StartFrom.EARLIEST);
            replayer.await(10, 5);
            int seenAtSeek = replayer.received.size();
            sub.seek(0);                                       // rewind mid-batch
            Check.that(replayer.awaitCondition(() -> replayer.received.size() >= 60, 10), "replay delivered again");
            List<Long> seq = replayer.offsets();
            int rewindAt = -1;
            for (int i = 1; i < seq.size(); i++) if (seq.get(i) < seq.get(i - 1)) { rewindAt = i; break; }
            Check.that(rewindAt > 0 && seq.get(rewindAt) == 0, "after seek(0) the next delivered offset is 0");
            Check.that(rewindAt <= seenAtSeek + 1, "at most one in-flight message after seek, not the rest of the stale batch ("
                    + (rewindAt - seenAtSeek) + " extra)");
            Check.that(inOrder(seq.subList(rewindAt, seq.size())), "contiguous from 0 after the rewind");

            // Poison message: bounded retries, then dead-letter; later messages still delivered
            broker.createTopic("payments");
            var flaky = new FailingSubscriber(3);              // offset 3 always throws
            broker.subscribe("payments", flaky, StartFrom.EARLIEST);
            for (int i = 0; i < 6; i++) broker.publish("payments", null, new byte[]{(byte) i});
            Check.that(flaky.awaitCondition(() -> flaky.ok.size() == 5, 10), "other messages delivered past the poison one");
            Check.that(broker.deadLetters().stream().anyMatch(m -> m.offset() == 3), "poison message dead-lettered");

            // LATEST skips history; payloads are defensively copied
            var late = new CollectingSubscriber(0);
            broker.subscribe("audit", late, StartFrom.LATEST);
            byte[] payload = {42};
            broker.publish("audit", null, payload);
            payload[0] = 0;
            Check.that(late.await(1, 5) && late.received.get(0).payload()[0] == 42, "LATEST sees only new messages; payload copied");
        }
        Check.done("pub-sub");
    }

    static boolean inOrder(List<?> items) {
        long prev = -1;
        for (Object o : items) {
            long off = o instanceof Message m ? m.offset() : (Long) o;
            if (off != prev + 1 && prev != -1) return false;
            prev = off;
        }
        return true;
    }
}

enum StartFrom { EARLIEST, LATEST }

/** Immutable once appended: the payload is copied on the way in and on the way out. */
record Message(long offset, String key, byte[] payload, Instant timestamp) {
    Message { payload = payload.clone(); }
    @Override public byte[] payload() { return payload.clone(); }
}

class TopicExistsException extends RuntimeException { TopicExistsException(String t) { super("Topic exists: " + t); } }
class UnknownTopicException extends RuntimeException { UnknownTopicException(String t) { super("Unknown topic: " + t); } }

interface Subscriber { void onMessage(Message m); }

final class Topic {
    private final String name;
    private final List<Message> log = new ArrayList<>();
    private final ReentrantLock lock = new ReentrantLock();
    private final Condition newData = lock.newCondition();

    Topic(String name) { this.name = name; }

    long append(String key, byte[] payload, Instant now) {
        lock.lock();
        try {
            long offset = log.size();
            log.add(new Message(offset, key, payload, now));
            newData.signalAll();                      // wake waiting subscribers
            return offset;
        } finally {
            lock.unlock();
        }
    }

    /** Returns up to max messages from offset, waiting up to timeout if none are available. */
    List<Message> read(long offset, int max, Duration timeout) throws InterruptedException {
        lock.lock();
        try {
            long nanos = timeout.toNanos();
            while (offset >= log.size()) {
                if (nanos <= 0) return List.of();
                nanos = newData.awaitNanos(nanos);
            }
            int end = (int) Math.min(log.size(), offset + max);
            return List.copyOf(log.subList((int) offset, end));
        } finally {
            lock.unlock();
        }
    }

    long endOffset() { lock.lock(); try { return log.size(); } finally { lock.unlock(); } }
}

interface RetryPolicy {
    boolean shouldRetry(int attempt, RuntimeException e);
    void backoff(int attempt);
    static RetryPolicy exponential(int maxAttempts) {
        return new RetryPolicy() {
            public boolean shouldRetry(int attempt, RuntimeException e) { return attempt < maxAttempts; }
            public void backoff(int attempt) {
                try { Thread.sleep(1L << attempt); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); }
            }
        };
    }
}

final class SubscriptionWorker implements Runnable {
    private final Topic topic;
    private final Subscriber subscriber;
    private final AtomicLong offset;
    private final RetryPolicy retryPolicy;
    private final Queue<Message> deadLetters;
    private volatile boolean running = true;

    SubscriptionWorker(Topic topic, Subscriber subscriber, long startOffset, RetryPolicy retryPolicy, Queue<Message> deadLetters) {
        this.topic = topic; this.subscriber = subscriber;
        this.offset = new AtomicLong(startOffset); this.retryPolicy = retryPolicy; this.deadLetters = deadLetters;
    }

    @Override public void run() {
        while (running) {
            try {
                List<Message> batch = topic.read(offset.get(), 100, Duration.ofMillis(500));
                for (Message m : batch) {
                    if (!running || offset.get() != m.offset()) break;   // a seek happened: drop the stale batch
                    deliverWithRetry(m);                                  // in order, one at a time
                    offset.compareAndSet(m.offset(), m.offset() + 1);     // don't clobber a concurrent seek
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return;
            }
        }
    }

    private void deliverWithRetry(Message m) {
        for (int attempt = 1; ; attempt++) {
            try { subscriber.onMessage(m); return; }
            catch (RuntimeException e) {
                if (!retryPolicy.shouldRetry(attempt, e)) { deadLetters.add(m); return; }   // don't block forever
                retryPolicy.backoff(attempt);
            }
        }
    }

    void seek(long newOffset) { offset.set(newOffset); }   // replay or skip
    void stop() { running = false; }
}

record Subscription(SubscriptionWorker worker) {
    void seek(long offset) { worker.seek(offset); }
    void cancel() { worker.stop(); }
}

final class Broker implements AutoCloseable {
    private final ConcurrentMap<String, Topic> topics = new ConcurrentHashMap<>();
    private final ExecutorService workers = Executors.newVirtualThreadPerTaskExecutor();   // Java 21+
    private final Queue<Message> deadLetters = new ConcurrentLinkedQueue<>();
    private final Clock clock;

    Broker(Clock clock) { this.clock = clock; }

    void createTopic(String name) {
        if (topics.putIfAbsent(name, new Topic(name)) != null) throw new TopicExistsException(name);
    }

    long publish(String topicName, String key, byte[] payload) {
        return topic(topicName).append(key, payload, clock.instant());
    }

    Subscription subscribe(String topicName, Subscriber s, StartFrom from) {
        Topic t = topic(topicName);
        long start = from == StartFrom.EARLIEST ? 0 : t.endOffset();
        var worker = new SubscriptionWorker(t, s, start, RetryPolicy.exponential(3), deadLetters);
        workers.submit(worker);
        return new Subscription(worker);
    }

    List<Message> deadLetters() { return List.copyOf(deadLetters); }

    private Topic topic(String name) {
        Topic t = topics.get(name);
        if (t == null) throw new UnknownTopicException(name);
        return t;
    }

    @Override public void close() { workers.shutdownNow(); }
}

// ---------- test subscribers ----------
class CollectingSubscriber implements Subscriber {
    final List<Message> received = new CopyOnWriteArrayList<>();
    private final long delayMs;
    CollectingSubscriber(long delayMs) { this.delayMs = delayMs; }
    public void onMessage(Message m) {
        if (delayMs > 0) try { Thread.sleep(delayMs); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        received.add(m);
    }
    List<Long> offsets() { return received.stream().map(Message::offset).toList(); }
    boolean await(int count, int seconds) throws InterruptedException { return awaitCondition(() -> received.size() >= count, seconds); }
    boolean awaitCondition(java.util.function.BooleanSupplier cond, int seconds) throws InterruptedException {
        long deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(seconds);
        while (!cond.getAsBoolean() && System.nanoTime() < deadline) Thread.sleep(5);
        return cond.getAsBoolean();
    }
}

final class FailingSubscriber extends CollectingSubscriber {
    final List<Long> ok = new CopyOnWriteArrayList<>();
    private final long poisonOffset;
    FailingSubscriber(long poisonOffset) { super(0); this.poisonOffset = poisonOffset; }
    @Override public void onMessage(Message m) {
        if (m.offset() == poisonOffset) throw new IllegalStateException("cannot process " + m.offset());
        ok.add(m.offset());
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
