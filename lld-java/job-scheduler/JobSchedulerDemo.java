// Design a Task/Job Scheduler — runnable reference solution for the lesson.
// Run: java lld-java/job-scheduler/JobSchedulerDemo.java
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.concurrent.locks.*;

public class JobSchedulerDemo {
    public static void main(String[] args) throws Exception {
        // ---- Deterministic tests: fake clock, jobs run inline via runDue() ----
        var clock = new MutableClock(Instant.parse("2026-10-15T00:00:00Z"));
        var log = new CopyOnWriteArrayList<String>();
        var s = new JobScheduler(clock, Runnable::run);           // inline executor: no threads in these tests
        Instant t0 = clock.instant();

        s.schedule("report", () -> log.add("report"), Schedule.once(t0.plusSeconds(30)), Priority.NORMAL, RetryPolicy.none());
        s.runDue();
        Check.that(log.isEmpty(), "not due yet");
        clock.advance(Duration.ofSeconds(30));
        s.runDue();
        Check.that(log.equals(List.of("report")), "one-time job ran at its time");
        s.runDue();
        Check.that(log.size() == 1, "and never again");

        // Fixed rate: every 10 s from t0+40
        log.clear();
        JobId tick = s.schedule("tick", () -> log.add("tick@" + Duration.between(t0, clock.instant()).toSeconds()),
                Schedule.fixedRate(t0.plusSeconds(40), Duration.ofSeconds(10)), Priority.NORMAL, RetryPolicy.none());
        for (int i = 0; i < 4; i++) { clock.advance(Duration.ofSeconds(10)); s.runDue(); }
        Check.that(log.equals(List.of("tick@40", "tick@50", "tick@60", "tick@70")), "fixed rate " + log);
        s.cancel(tick);
        clock.advance(Duration.ofSeconds(10)); s.runDue();
        Check.that(log.size() == 4, "cancelled job stops");

        // Missed runs: fixed-rate does not fire a burst to catch up (one run, then realigns)
        log.clear();
        Instant t1 = clock.instant();
        s.schedule("gauge", () -> log.add("g"), Schedule.fixedRate(t1, Duration.ofSeconds(5)), Priority.NORMAL, RetryPolicy.none());
        s.runDue();
        clock.advance(Duration.ofSeconds(23));                // machine was asleep for 4+ periods
        s.runDue();
        Check.that(log.size() == 2, "skipped missed runs instead of bursting");
        s.cancelAll();

        // Priority: at the same due time, HIGH runs before NORMAL before LOW
        log.clear();
        Instant at = clock.instant().plusSeconds(1);
        s.schedule("low", () -> log.add("low"), Schedule.once(at), Priority.LOW, RetryPolicy.none());
        s.schedule("normal", () -> log.add("normal"), Schedule.once(at), Priority.NORMAL, RetryPolicy.none());
        s.schedule("high", () -> log.add("high"), Schedule.once(at), Priority.HIGH, RetryPolicy.none());
        clock.advance(Duration.ofSeconds(1)); s.runDue();
        Check.that(log.equals(List.of("high", "normal", "low")), "priority breaks ties " + log);

        // Retries with exponential backoff, then success
        log.clear();
        var attempts = new AtomicInteger();
        JobId flaky = s.schedule("flaky", () -> {
            log.add("attempt " + attempts.incrementAndGet());
            if (attempts.get() < 3) throw new IllegalStateException("downstream unavailable");
        }, Schedule.once(clock.instant()), Priority.NORMAL, RetryPolicy.exponential(5, Duration.ofSeconds(2)));
        s.runDue();                                           // attempt 1 fails → retry in 2 s
        clock.advance(Duration.ofSeconds(1)); s.runDue();
        Check.that(attempts.get() == 1, "backoff respected");
        clock.advance(Duration.ofSeconds(1)); s.runDue();      // attempt 2 fails → retry in 4 s
        clock.advance(Duration.ofSeconds(4)); s.runDue();      // attempt 3 succeeds
        Check.that(attempts.get() == 3 && s.status(flaky) == JobStatus.SUCCEEDED, "succeeded on the 3rd attempt");

        // Gives up after max attempts
        JobId doomed = s.schedule("doomed", () -> { throw new IllegalStateException("always"); },
                Schedule.once(clock.instant()), Priority.NORMAL, RetryPolicy.exponential(2, Duration.ofSeconds(1)));
        s.runDue(); clock.advance(Duration.ofSeconds(1)); s.runDue();
        Check.that(s.status(doomed) == JobStatus.FAILED, "failed permanently after 2 attempts");

        // Fixed delay: the next run is measured from the END of the previous one
        var slowLog = new ArrayList<Long>();
        Instant t2 = clock.instant();
        s.schedule("cleanup", () -> { slowLog.add(Duration.between(t2, clock.instant()).toSeconds()); clock.advance(Duration.ofSeconds(3)); },
                Schedule.fixedDelay(t2, Duration.ofSeconds(10)), Priority.NORMAL, RetryPolicy.none());
        s.runDue();                                           // runs at 0, finishes at 3 → next at 13
        clock.advance(Duration.ofSeconds(9)); s.runDue();      // t = 12: not yet
        clock.advance(Duration.ofSeconds(1)); s.runDue();      // t = 13: runs
        Check.that(slowLog.equals(List.of(0L, 13L)), "fixed delay counts from completion " + slowLog);
        s.cancelAll();

        // ---- Real time: dispatcher thread + worker pool ----
        var real = new JobScheduler(Clock.systemUTC(), Executors.newFixedThreadPool(8));
        real.start();
        var ran = ConcurrentHashMap.<Integer>newKeySet();
        var duplicates = new AtomicInteger();
        var latch = new CountDownLatch(1_000);
        var rnd = new Random(9);
        List<JobId> toCancel = new ArrayList<>();
        Instant now = Instant.now();
        for (int i = 0; i < 1_100; i++) {
            int n = i;
            JobId id = real.schedule("job" + i, () -> { if (!ran.add(n)) duplicates.incrementAndGet(); latch.countDown(); },
                    Schedule.once(now.plusMillis(20 + rnd.nextInt(200))), Priority.NORMAL, RetryPolicy.none());
            if (i >= 1_000) toCancel.add(id);
        }
        toCancel.forEach(real::cancel);
        Check.that(latch.await(10, TimeUnit.SECONDS), "1,000 jobs ran on time");
        Thread.sleep(300);
        Check.that(ran.size() == 1_000 && duplicates.get() == 0, "each exactly once; 100 cancelled jobs never ran");
        var early = new AtomicBoolean();
        Instant due = Instant.now().plusMillis(150);
        var done = new CountDownLatch(1);
        real.schedule("timed", () -> { if (Instant.now().isBefore(due)) early.set(true); done.countDown(); },
                Schedule.once(due), Priority.HIGH, RetryPolicy.none());
        Check.that(done.await(5, TimeUnit.SECONDS) && !early.get(), "never runs early");
        real.shutdown();

        Check.done("job-scheduler");
    }
}

record JobId(long value) { }
enum Priority { HIGH, NORMAL, LOW }
enum JobStatus { SCHEDULED, RUNNING, SUCCEEDED, FAILED, CANCELLED }

/** When a job runs: first time, and how to compute the next one. */
sealed interface Schedule {
    Instant first();
    record Once(Instant first) implements Schedule { }
    record FixedRate(Instant first, Duration period) implements Schedule { }
    record FixedDelay(Instant first, Duration delay) implements Schedule { }
    static Schedule once(Instant at) { return new Once(at); }
    static Schedule fixedRate(Instant first, Duration period) { return new FixedRate(first, period); }
    static Schedule fixedDelay(Instant first, Duration delay) { return new FixedDelay(first, delay); }
}

interface RetryPolicy {
    /** Delay before the next attempt, or empty to give up. attempt starts at 1. */
    Optional<Duration> nextDelay(int attempt);
    static RetryPolicy none() { return a -> Optional.empty(); }
    static RetryPolicy exponential(int maxAttempts, Duration base) {
        return a -> a >= maxAttempts ? Optional.empty() : Optional.of(base.multipliedBy(1L << (a - 1)));
    }
}

final class Job {
    final JobId id; final String name; final Runnable task; final Schedule schedule; final Priority priority; final RetryPolicy retry;
    final AtomicReference<JobStatus> status = new AtomicReference<>(JobStatus.SCHEDULED);
    volatile int attempt;                                  // failed attempts of the current run
    Job(JobId id, String name, Runnable task, Schedule schedule, Priority priority, RetryPolicy retry) {
        this.id = id; this.name = name; this.task = task; this.schedule = schedule; this.priority = priority; this.retry = retry;
    }
}

/** One queue entry: a job and when it should next run. Ties broken by priority, then FIFO. */
record Trigger(Job job, Instant at, long seq) implements Comparable<Trigger> {
    public int compareTo(Trigger o) {
        int c = at.compareTo(o.at);
        if (c != 0) return c;
        c = job.priority.compareTo(o.job.priority);
        return c != 0 ? c : Long.compare(seq, o.seq);
    }
}

final class JobScheduler {
    private final Clock clock;
    private final Executor workers;
    private final PriorityQueue<Trigger> queue = new PriorityQueue<>();
    private final Map<JobId, Job> jobs = new ConcurrentHashMap<>();
    private final ReentrantLock lock = new ReentrantLock();
    private final Condition changed = lock.newCondition();
    private final AtomicLong ids = new AtomicLong(), seq = new AtomicLong();
    private volatile boolean running;
    private Thread dispatcher;

    JobScheduler(Clock clock, Executor workers) { this.clock = clock; this.workers = workers; }

    JobId schedule(String name, Runnable task, Schedule schedule, Priority priority, RetryPolicy retry) {
        Job job = new Job(new JobId(ids.incrementAndGet()), name, task, schedule, priority, retry);
        jobs.put(job.id, job);
        enqueue(job, schedule.first());
        return job.id;
    }

    void cancel(JobId id) {
        Job j = jobs.get(id);
        if (j != null) j.status.set(JobStatus.CANCELLED);    // lazily dropped when it reaches the head
    }

    void cancelAll() { jobs.keySet().forEach(this::cancel); }

    JobStatus status(JobId id) { return jobs.get(id).status.get(); }

    private void enqueue(Job job, Instant at) {
        lock.lock();
        try {
            queue.add(new Trigger(job, at, seq.incrementAndGet()));
            changed.signal();                                // a new earliest job may need an earlier wake-up
        } finally { lock.unlock(); }
    }

    /** Removes and dispatches every trigger that is due now. Used directly in tests, and by the dispatcher thread. */
    void runDue() {
        List<Trigger> due = new ArrayList<>();
        lock.lock();
        try {
            Instant now = clock.instant();
            while (!queue.isEmpty() && !queue.peek().at().isAfter(now)) due.add(queue.poll());
        } finally { lock.unlock(); }
        for (Trigger t : due) dispatch(t);
    }

    private void dispatch(Trigger t) {
        Job job = t.job();
        if (!job.status.compareAndSet(JobStatus.SCHEDULED, JobStatus.RUNNING)) return;   // cancelled (or already running)
        workers.execute(() -> execute(job, t.at()));
    }

    private void execute(Job job, Instant scheduledFor) {
        try {
            job.task.run();
            job.attempt = 0;
            reschedule(job, scheduledFor);
        } catch (RuntimeException e) {
            int failed = ++job.attempt;
            Optional<Duration> delay = job.retry.nextDelay(failed);
            if (delay.isPresent() && job.status.compareAndSet(JobStatus.RUNNING, JobStatus.SCHEDULED)) {
                enqueue(job, clock.instant().plus(delay.get()));
            } else {
                job.status.compareAndSet(JobStatus.RUNNING, JobStatus.FAILED);
            }
        }
    }

    private void reschedule(Job job, Instant scheduledFor) {
        Instant next = switch (job.schedule) {
            case Schedule.Once o -> null;
            case Schedule.FixedRate r -> {
                Instant n = scheduledFor.plus(r.period());
                Instant now = clock.instant();
                while (!n.isAfter(now)) n = n.plus(r.period());   // skip missed runs instead of bursting
                yield n;
            }
            case Schedule.FixedDelay d -> clock.instant().plus(d.delay());   // measured from completion
        };
        if (next == null) { job.status.compareAndSet(JobStatus.RUNNING, JobStatus.SUCCEEDED); return; }
        if (job.status.compareAndSet(JobStatus.RUNNING, JobStatus.SCHEDULED)) enqueue(job, next);
    }

    // ---- real-time dispatcher ----
    void start() {
        running = true;
        dispatcher = new Thread(this::loop, "scheduler-dispatcher");
        dispatcher.start();
    }

    private void loop() {
        while (running) {
            lock.lock();
            try {
                while (running) {
                    Trigger head = queue.peek();
                    if (head == null) { changed.await(); continue; }
                    long waitNanos = Duration.between(clock.instant(), head.at()).toNanos();
                    if (waitNanos <= 0) break;
                    changed.awaitNanos(waitNanos);           // woken early if an earlier job arrives
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return;
            } finally { lock.unlock(); }
            runDue();
        }
    }

    void shutdown() throws InterruptedException {
        running = false;
        lock.lock(); try { changed.signalAll(); } finally { lock.unlock(); }
        dispatcher.join();
        if (workers instanceof ExecutorService es) { es.shutdown(); es.awaitTermination(5, TimeUnit.SECONDS); }
    }
}

final class MutableClock extends Clock {
    private volatile Instant now;
    MutableClock(Instant start) { this.now = start; }
    void advance(Duration d) { now = now.plus(d); }
    @Override public ZoneId getZone() { return ZoneOffset.UTC; }
    @Override public Clock withZone(ZoneId zone) { return this; }
    @Override public Instant instant() { return now; }
}

final class Check {
    private static int passed;
    static void that(boolean cond, String what) { if (!cond) throw new AssertionError("FAILED: " + what); passed++; }
    static void done(String name) { System.out.println("✓ " + name + ": " + passed + " checks passed"); }
}
