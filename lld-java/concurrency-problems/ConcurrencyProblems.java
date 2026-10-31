// Concurrency coding problems, each stress-tested. Run: java lld-java/concurrency-problems/ConcurrencyProblems.java
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.concurrent.locks.*;
import java.util.function.*;

public class ConcurrencyProblems {
    public static void main(String[] args) throws Exception {
        testPrintInOrder();
        testFooBar();
        testBoundedBlockingQueue();
        testDiningPhilosophers();
        testTokenBucket();
        testDelayedScheduler();
        testCrawler();
        Check.done("Concurrency problems");
    }

    // ---- 1. Print in Order: second() waits for first(), third() waits for second()
    static final class InOrder {
        private final CountDownLatch firstDone = new CountDownLatch(1);
        private final CountDownLatch secondDone = new CountDownLatch(1);

        void first(Runnable printFirst) { printFirst.run(); firstDone.countDown(); }
        void second(Runnable printSecond) throws InterruptedException { firstDone.await(); printSecond.run(); secondDone.countDown(); }
        void third(Runnable printThird) throws InterruptedException { secondDone.await(); printThird.run(); }
    }

    // ---- 2. FooBar: two threads alternate strictly, foo first
    static final class FooBar {
        private final int n;
        private final Semaphore fooTurn = new Semaphore(1);   // foo may go first
        private final Semaphore barTurn = new Semaphore(0);

        FooBar(int n) { this.n = n; }

        void foo(Runnable printFoo) throws InterruptedException {
            for (int i = 0; i < n; i++) { fooTurn.acquire(); printFoo.run(); barTurn.release(); }
        }

        void bar(Runnable printBar) throws InterruptedException {
            for (int i = 0; i < n; i++) { barTurn.acquire(); printBar.run(); fooTurn.release(); }
        }
    }

    // ---- 3. Bounded blocking queue from scratch
    static final class BoundedBlockingQueue<T> {
        private final Deque<T> items = new ArrayDeque<>();
        private final int capacity;
        private final ReentrantLock lock = new ReentrantLock();
        private final Condition notFull = lock.newCondition();
        private final Condition notEmpty = lock.newCondition();

        BoundedBlockingQueue(int capacity) { this.capacity = capacity; }

        void put(T item) throws InterruptedException {
            lock.lock();
            try {
                while (items.size() == capacity) notFull.await();     // while, not if: re-check after waking
                items.addLast(item);
                notEmpty.signal();                                    // wake one waiting taker
            } finally {
                lock.unlock();
            }
        }

        T take() throws InterruptedException {
            lock.lock();
            try {
                while (items.isEmpty()) notEmpty.await();
                T item = items.removeFirst();
                notFull.signal();                                     // wake one waiting producer
                return item;
            } finally {
                lock.unlock();
            }
        }

        int size() {
            lock.lock();
            try { return items.size(); } finally { lock.unlock(); }
        }
    }

    // ---- 4. Dining philosophers: lock forks in a global order, so no cycle of waiting can form
    static final class DiningPhilosophers {
        private final ReentrantLock[] forks = new ReentrantLock[5];

        DiningPhilosophers() { for (int i = 0; i < 5; i++) forks[i] = new ReentrantLock(); }

        void wantsToEat(int p, Runnable pickLeft, Runnable pickRight, Runnable eat, Runnable putLeft, Runnable putRight) {
            int left = p, right = (p + 1) % 5;
            int first = Math.min(left, right), second = Math.max(left, right);
            forks[first].lock();
            forks[second].lock();
            try {
                pickLeft.run(); pickRight.run();
                eat.run();
                putLeft.run(); putRight.run();
            } finally {
                forks[second].unlock();
                forks[first].unlock();
            }
        }
    }

    // ---- 5. Thread-safe token bucket: capacity tokens, refilled continuously at `perSecond`
    static final class TokenBucket {
        private final long capacity;
        private final double perNano;
        private double tokens;
        private long last;
        private final LongSupplier clock;

        TokenBucket(long capacity, double perSecond, LongSupplier nanoClock) {
            this.capacity = capacity;
            this.perNano = perSecond / 1e9;
            this.clock = nanoClock;
            this.tokens = capacity;
            this.last = nanoClock.getAsLong();
        }

        synchronized boolean tryAcquire() {                          // refill and take as one atomic step
            long now = clock.getAsLong();
            tokens = Math.min(capacity, tokens + (now - last) * perNano);
            last = now;
            if (tokens < 1) return false;
            tokens -= 1;
            return true;
        }
    }

    // ---- 6. Delayed task scheduler: one worker runs each task when it falls due
    static final class DelayedScheduler implements AutoCloseable {
        private record Job(long dueNanos, long seq, Runnable task) {}

        private final PriorityQueue<Job> jobs = new PriorityQueue<>(
            Comparator.comparingLong(Job::dueNanos).thenComparingLong(Job::seq));
        private final ReentrantLock lock = new ReentrantLock();
        private final Condition changed = lock.newCondition();
        private final Thread worker;
        private long seq = 0;
        private boolean closed = false;

        DelayedScheduler() {
            worker = new Thread(this::run, "scheduler");
            worker.start();
        }

        void schedule(Runnable task, long delayMillis) {
            lock.lock();
            try {
                jobs.add(new Job(System.nanoTime() + TimeUnit.MILLISECONDS.toNanos(delayMillis), seq++, task));
                changed.signal();                     // the new job may be due sooner than the one being waited for
            } finally {
                lock.unlock();
            }
        }

        private void run() {
            while (true) {
                Runnable task;
                lock.lock();
                try {
                    while (true) {
                        if (closed && jobs.isEmpty()) return;
                        if (jobs.isEmpty()) { changed.await(); continue; }
                        long wait = jobs.peek().dueNanos() - System.nanoTime();
                        if (wait <= 0) { task = jobs.poll().task(); break; }
                        changed.awaitNanos(wait);     // wakes early if a sooner job arrives
                    }
                } catch (InterruptedException e) {
                    return;
                } finally {
                    lock.unlock();
                }
                task.run();                           // run outside the lock so schedule() never waits for a task
            }
        }

        @Override public void close() throws InterruptedException {
            lock.lock();
            try { closed = true; changed.signal(); } finally { lock.unlock(); }
            worker.join();
        }
    }

    // ---- 7. Multithreaded crawler: visit every page reachable from the start on the same host
    static Set<String> crawl(String start, Function<String, List<String>> links, int threads) throws InterruptedException {
        String host = hostOf(start);
        Set<String> seen = ConcurrentHashMap.newKeySet();
        ExecutorService pool = Executors.newFixedThreadPool(threads);
        Phaser pending = new Phaser(1);                    // party 1 = this method; one more per page in flight
        seen.add(start);
        submit(pool, pending, start, links, seen, host);
        pending.arriveAndAwaitAdvance();                   // returns when every page's task has finished
        pool.shutdown();
        return seen;
    }

    private static void submit(ExecutorService pool, Phaser pending, String url, Function<String, List<String>> links, Set<String> seen, String host) {
        pending.register();
        pool.execute(() -> {
            try {
                for (String next : links.apply(url))
                    if (hostOf(next).equals(host) && seen.add(next))       // add() is the atomic "first to see it" check
                        submit(pool, pending, next, links, seen, host);
            } finally {
                pending.arriveAndDeregister();
            }
        });
    }

    static String hostOf(String url) {
        String rest = url.substring(url.indexOf("://") + 3);
        int slash = rest.indexOf('/');
        return slash < 0 ? rest : rest.substring(0, slash);
    }

    // =====================================================================================
    // Stress tests
    // =====================================================================================

    static void testPrintInOrder() throws Exception {
        for (int round = 0; round < 300; round++) {
            InOrder o = new InOrder();
            StringBuffer out = new StringBuffer();
            List<Thread> ts = new ArrayList<>(List.of(
                new Thread(() -> o.first(() -> out.append("first"))),
                new Thread(() -> { try { o.second(() -> out.append("second")); } catch (InterruptedException e) { throw new RuntimeException(e); } }),
                new Thread(() -> { try { o.third(() -> out.append("third")); } catch (InterruptedException e) { throw new RuntimeException(e); } })));
            Collections.shuffle(ts, new Random(round));
            for (Thread t : ts) t.start();
            for (Thread t : ts) t.join();
            Check.that(out.toString().equals("firstsecondthird"), "print in order");
        }
    }

    static void testFooBar() throws Exception {
        for (int round = 0; round < 100; round++) {
            int n = 1 + round % 50;
            FooBar fb = new FooBar(n);
            StringBuffer out = new StringBuffer();
            Thread a = new Thread(() -> { try { fb.foo(() -> out.append("foo")); } catch (InterruptedException e) { throw new RuntimeException(e); } });
            Thread b = new Thread(() -> { try { fb.bar(() -> out.append("bar")); } catch (InterruptedException e) { throw new RuntimeException(e); } });
            if (round % 2 == 0) { b.start(); a.start(); } else { a.start(); b.start(); }
            a.join(); b.join();
            Check.that(out.toString().equals("foobar".repeat(n)), "foo and bar alternate");
        }
    }

    static void testBoundedBlockingQueue() throws Exception {
        for (int round = 0; round < 20; round++) {
            int capacity = 1 + round % 5, producers = 4, consumers = 3, perProducer = 2_000;
            BoundedBlockingQueue<Integer> q = new BoundedBlockingQueue<>(capacity);
            AtomicLong consumedSum = new AtomicLong();
            AtomicInteger consumedCount = new AtomicInteger();
            AtomicBoolean overfull = new AtomicBoolean(false);
            int total = producers * perProducer;
            ExecutorService pool = Executors.newFixedThreadPool(producers + consumers);
            List<Future<?>> fs = new ArrayList<>();
            for (int p = 0; p < producers; p++) {
                int base = p * perProducer;
                fs.add(pool.submit(() -> { for (int i = 0; i < perProducer; i++) { q.put(base + i); if (q.size() > capacity) overfull.set(true); } return null; }));
            }
            for (int c = 0; c < consumers; c++) {
                fs.add(pool.submit(() -> {
                    while (true) {
                        int got = consumedCount.incrementAndGet();
                        if (got > total) return null;
                        consumedSum.addAndGet(q.take());
                    }
                }));
            }
            for (Future<?> f : fs) f.get(30, TimeUnit.SECONDS);
            pool.shutdown();
            long expected = (long) total * (total - 1) / 2;
            Check.that(consumedSum.get() == expected, "every item is taken exactly once");
            Check.that(!overfull.get(), "the queue never exceeds its capacity");
            Check.that(q.size() == 0, "the queue ends empty");
        }
    }

    static void testDiningPhilosophers() throws Exception {
        DiningPhilosophers table = new DiningPhilosophers();
        AtomicInteger[] holder = new AtomicInteger[5];
        for (int i = 0; i < 5; i++) holder[i] = new AtomicInteger(-1);
        AtomicBoolean conflict = new AtomicBoolean(false);
        AtomicInteger meals = new AtomicInteger();
        ExecutorService pool = Executors.newFixedThreadPool(5);
        List<Future<?>> fs = new ArrayList<>();
        for (int p = 0; p < 5; p++) {
            int me = p;
            fs.add(pool.submit(() -> {
                for (int m = 0; m < 2_000; m++) {
                    int left = me, right = (me + 1) % 5;
                    table.wantsToEat(me,
                        () -> { if (!holder[left].compareAndSet(-1, me)) conflict.set(true); },
                        () -> { if (!holder[right].compareAndSet(-1, me)) conflict.set(true); },
                        meals::incrementAndGet,
                        () -> holder[left].set(-1),
                        () -> holder[right].set(-1));
                }
                return null;
            }));
        }
        for (Future<?> f : fs) f.get(30, TimeUnit.SECONDS);       // a deadlock would time out here
        pool.shutdown();
        Check.that(!conflict.get(), "no fork is held by two philosophers");
        Check.that(meals.get() == 10_000, "every philosopher eats every meal (no deadlock)");
    }

    static void testTokenBucket() throws Exception {
        AtomicLong now = new AtomicLong(0);                      // a fake clock, so the test is deterministic
        TokenBucket bucket = new TokenBucket(100, 10, now::get);
        ExecutorService pool = Executors.newFixedThreadPool(8);
        AtomicInteger granted = new AtomicInteger();
        List<Future<?>> fs = new ArrayList<>();
        for (int t = 0; t < 8; t++) fs.add(pool.submit(() -> { for (int i = 0; i < 1_000; i++) if (bucket.tryAcquire()) granted.incrementAndGet(); }));
        for (Future<?> f : fs) f.get();
        Check.that(granted.get() == 100, "a full bucket grants exactly its capacity, even under contention");
        now.addAndGet(TimeUnit.SECONDS.toNanos(3));              // 3 s at 10 tokens/s
        fs.clear();
        granted.set(0);
        for (int t = 0; t < 8; t++) fs.add(pool.submit(() -> { for (int i = 0; i < 1_000; i++) if (bucket.tryAcquire()) granted.incrementAndGet(); }));
        for (Future<?> f : fs) f.get();
        pool.shutdown();
        Check.that(granted.get() == 30, "refill adds exactly rate × elapsed tokens");
    }

    static void testDelayedScheduler() throws Exception {
        List<Integer> order = Collections.synchronizedList(new ArrayList<>());
        Map<Integer, Long> ranAt = new ConcurrentHashMap<>();
        long start = System.nanoTime();
        int[] delays = { 120, 20, 80, 0, 60, 40, 100 };
        try (DelayedScheduler s = new DelayedScheduler()) {
            for (int i = 0; i < delays.length; i++) {
                int id = i;
                s.schedule(() -> { order.add(id); ranAt.put(id, System.nanoTime()); }, delays[i]);
            }
            Thread.sleep(400);
        }
        List<Integer> expected = new ArrayList<>();
        Integer[] ids = { 3, 1, 5, 4, 2, 6, 0 };
        Collections.addAll(expected, ids);
        Check.that(order.equals(expected), "tasks run in order of due time");
        for (int i = 0; i < delays.length; i++)
            Check.that(ranAt.get(i) - start >= TimeUnit.MILLISECONDS.toNanos(delays[i]), "no task runs early");
    }

    static void testCrawler() throws Exception {
        var rnd = new Random(7);
        for (int round = 0; round < 30; round++) {
            int pages = 5 + rnd.nextInt(200);
            Map<String, List<String>> web = new HashMap<>();
            List<String> urls = new ArrayList<>();
            for (int i = 0; i < pages; i++) urls.add((rnd.nextInt(5) == 0 ? "http://other.com/p" : "http://site.com/p") + i);
            for (String u : urls) {
                List<String> out = new ArrayList<>();
                for (int k = rnd.nextInt(5); k > 0; k--) out.add(urls.get(rnd.nextInt(pages)));
                web.put(u, out);
            }
            String start = "http://site.com/p0";
            urls.set(0, start);
            web.putIfAbsent(start, new ArrayList<>());
            Function<String, List<String>> links = u -> {
                try { Thread.sleep(rnd.nextInt(2)); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
                return web.getOrDefault(u, List.of());
            };
            Set<String> want = new HashSet<>(List.of(start));
            Deque<String> q = new ArrayDeque<>(List.of(start));
            while (!q.isEmpty()) for (String v : web.getOrDefault(q.poll(), List.of())) if (hostOf(v).equals("site.com") && want.add(v)) q.add(v);
            Check.that(crawl(start, links, 8).equals(want), "crawler visits exactly the reachable same-host pages");
        }
    }
}

final class Check {
    private static int passed;
    static void that(boolean cond, String what) { if (!cond) throw new AssertionError("FAILED: " + what); passed++; }
    static void done(String name) { System.out.println("✓ " + name + ": " + passed + " checks passed"); }
}
