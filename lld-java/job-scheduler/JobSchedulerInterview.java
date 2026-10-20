// Design a Job Scheduler — the interview-sized version from the top of the lesson.
// Run: java lld-java/job-scheduler/JobSchedulerInterview.java
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class JobSchedulerInterview {
    public static void main(String[] args) throws Exception {
        var s = new Scheduler(4);
        long now = System.currentTimeMillis();
        var order = Collections.synchronizedList(new ArrayList<String>());
        var both = new CountDownLatch(2);
        s.schedule(new Job("late", now + 150, () -> { order.add("late"); both.countDown(); }, 0));
        s.schedule(new Job("early", now + 50, () -> { order.add("early"); both.countDown(); }, 0));   // added second, due first
        check(both.await(2, TimeUnit.SECONDS), "both one-off jobs ran");
        check(order.equals(List.of("early", "late")), "jobs run in due-time order: " + order);

        var ticks = new AtomicInteger();
        s.schedule(new Job("tick", System.currentTimeMillis(), ticks::incrementAndGet, 30));
        Thread.sleep(200);
        s.cancel("tick");
        int seen = ticks.get();
        check(seen >= 3, "recurring job repeats, ran " + seen);
        Thread.sleep(120);
        check(ticks.get() <= seen + 1, "cancelled job stops repeating");

        var never = new AtomicBoolean();
        s.schedule(new Job("never", System.currentTimeMillis() + 50, () -> never.set(true), 0));
        s.cancel("never");
        Thread.sleep(150);
        check(!never.get(), "a job cancelled before it is due never runs");

        var slowStarted = new CountDownLatch(1);
        var quick = new CountDownLatch(1);
        s.schedule(new Job("slow", System.currentTimeMillis(), () -> { slowStarted.countDown(); sleepQuietly(500); }, 0));
        slowStarted.await();
        s.schedule(new Job("quick", System.currentTimeMillis(), quick::countDown, 0));
        check(quick.await(200, TimeUnit.MILLISECONDS), "a slow job doesn't block the dispatcher");
        s.shutdown();
        done("job-scheduler");
    }

    static void sleepQuietly(long ms) { try { Thread.sleep(ms); } catch (InterruptedException e) { Thread.currentThread().interrupt(); } }
    static int passed;
    static void check(boolean ok, String what) { if (!ok) throw new AssertionError("FAILED: " + what); passed++; }
    static void done(String name) { System.out.println("✓ " + name + " (interview version): " + passed + " checks passed"); }
}

// ---- lesson excerpt: everything below is shown in the lesson
record Job(String id, long runAt, Runnable task, long repeatEveryMillis) { }   // repeatEveryMillis = 0: run once

class Scheduler {
    private final PriorityQueue<Job> queue = new PriorityQueue<>(Comparator.comparingLong(Job::runAt));
    private final Set<String> cancelled = ConcurrentHashMap.newKeySet();
    private final ExecutorService workers;
    private final Thread dispatcher = new Thread(this::dispatchLoop);
    private volatile boolean running = true;

    Scheduler(int workerThreads) {
        workers = Executors.newFixedThreadPool(workerThreads);
        dispatcher.setDaemon(true);
        dispatcher.start();
    }

    synchronized void schedule(Job job) {
        queue.add(job);
        notify();                                    // wake the dispatcher: this job may now be the earliest
    }

    void cancel(String id) { cancelled.add(id); }   // checked when the job comes due: no searching the heap

    private synchronized void dispatchLoop() {
        try {
            while (running) {
                Job next = queue.peek();
                long now = System.currentTimeMillis();
                if (next == null) { wait(); continue; }                              // nothing to do
                if (next.runAt() > now) { wait(next.runAt() - now); continue; }      // sleep until due (or a new job)
                queue.poll();
                if (cancelled.contains(next.id())) continue;
                workers.submit(next.task());         // run on the pool, so a slow job never blocks the loop
                if (next.repeatEveryMillis() > 0)
                    queue.add(new Job(next.id(), next.runAt() + next.repeatEveryMillis(), next.task(), next.repeatEveryMillis()));
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    void shutdown() { running = false; dispatcher.interrupt(); workers.shutdown(); }
}
