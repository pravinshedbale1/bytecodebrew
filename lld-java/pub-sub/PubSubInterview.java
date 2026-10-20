// Design a Pub-Sub Message Broker — the interview-sized version from the top of the lesson.
// Run: java lld-java/pub-sub/PubSubInterview.java
import java.util.*;
import java.util.concurrent.*;

public class PubSubInterview {
    public static void main(String[] args) throws Exception {
        var broker = new Broker();
        broker.createTopic("orders");
        fails(() -> broker.publish("nope", "x"), "unknown topic");

        var fastGot = Collections.synchronizedList(new ArrayList<String>());
        var slowGot = Collections.synchronizedList(new ArrayList<String>());
        var fastDone = new CountDownLatch(100);
        var slowDone = new CountDownLatch(100);
        broker.subscribe("orders", (t, m) -> { fastGot.add(m); fastDone.countDown(); });
        broker.subscribe("orders", (t, m) -> { sleep(2); slowGot.add(m); slowDone.countDown(); });

        for (int i = 0; i < 100; i++) broker.publish("orders", "o" + i);
        check(fastDone.await(2, TimeUnit.SECONDS), "fast subscriber got everything");
        check(slowGot.size() < 100, "the fast one did not wait for the slow one");
        check(slowDone.await(5, TimeUnit.SECONDS), "slow subscriber catches up");
        List<String> expected = new ArrayList<>();
        for (int i = 0; i < 100; i++) expected.add("o" + i);
        check(fastGot.equals(expected) && slowGot.equals(expected), "each subscriber sees messages in order");

        var lateGot = new CountDownLatch(100);
        broker.subscribe("orders", (t, m) -> lateGot.countDown());
        check(lateGot.await(2, TimeUnit.SECONDS), "a late subscriber can read from the start of the log");
        broker.shutdown();
        done("pub-sub");
    }

    static void sleep(long ms) { try { Thread.sleep(ms); } catch (InterruptedException e) { Thread.currentThread().interrupt(); } }
    static int passed;
    static void check(boolean ok, String what) { if (!ok) throw new AssertionError("FAILED: " + what); passed++; }
    static void fails(Runnable r, String what) { try { r.run(); } catch (RuntimeException e) { passed++; return; } throw new AssertionError("FAILED (no exception): " + what); }
    static void done(String name) { System.out.println("✓ " + name + " (interview version): " + passed + " checks passed"); }
}

// ---- lesson excerpt: everything below is shown in the lesson
interface Subscriber { void onMessage(String topic, String message); }

class Topic {
    final String name;
    private final List<String> log = new ArrayList<>();     // messages are kept; each reader tracks its position

    Topic(String name) { this.name = name; }

    synchronized void publish(String message) {
        log.add(message);
        notifyAll();                                         // wake readers waiting for new messages
    }

    synchronized String read(int offset) throws InterruptedException {
        while (offset >= log.size()) wait();                 // nothing new yet: wait
        return log.get(offset);
    }
}

class Subscription implements Runnable {                     // one per subscriber, on its own thread
    private final Topic topic;
    private final Subscriber subscriber;
    private int offset = 0;                                  // the next message this subscriber will read

    Subscription(Topic topic, Subscriber subscriber) { this.topic = topic; this.subscriber = subscriber; }

    public void run() {
        try {
            while (true) {
                String message = topic.read(offset);
                subscriber.onMessage(topic.name, message);   // a slow subscriber only slows itself
                offset++;
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();              // shutdown
        }
    }
}

class Broker {
    private final Map<String, Topic> topics = new ConcurrentHashMap<>();
    private final List<Thread> workers = new CopyOnWriteArrayList<>();

    void createTopic(String name) { topics.putIfAbsent(name, new Topic(name)); }
    void publish(String topic, String message) { topic(topic).publish(message); }

    void subscribe(String topic, Subscriber s) {
        workers.add(Thread.ofVirtual().start(new Subscription(topic(topic), s)));
    }

    void shutdown() { workers.forEach(Thread::interrupt); }

    private Topic topic(String name) {
        Topic t = topics.get(name);
        if (t == null) throw new IllegalArgumentException("No topic " + name);
        return t;
    }
}
