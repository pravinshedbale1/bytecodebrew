// Design a Logging Framework — runnable reference solution for the lesson.
// Run: java lld-java/logging-framework/LoggingDemo.java
import java.io.*;
import java.nio.file.*;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.concurrent.locks.ReentrantLock;

public class LoggingDemo {
    public static void main(String[] args) throws Exception {
        var factory = new LoggerFactory();
        var root = factory.root();
        var mem = new MemoryAppender(new PatternFormatter(), Level.TRACE);
        root.addAppender(mem);
        root.setLevel(Level.INFO);

        // Level filtering and inheritance
        Logger pay = factory.getLogger("com.shop.payment");
        pay.debug("hidden {}", 1);
        pay.info("charged {} for order {}", "₹500", "O-1");
        Check.that(mem.lines.size() == 1 && mem.lines.get(0).contains("charged ₹500 for order O-1"), "INFO passes, DEBUG filtered; placeholders filled");
        factory.getLogger("com.shop").setLevel(Level.DEBUG);
        pay.debug("now visible");
        Check.that(mem.lines.size() == 2, "child inherits the nearest ancestor's level");
        Check.that(factory.getLogger("com.shop.payment") == pay, "one logger per name");

        // Placeholders are not formatted when the level is off
        var counter = new AtomicInteger();
        Object expensive = new Object() { public String toString() { counter.incrementAndGet(); return "x"; } };
        factory.getLogger("com.other").debug("value {}", expensive);
        Check.that(counter.get() == 0, "argument toString() never called for a disabled level");

        // Additivity: a logger's own appender plus its parents'
        var auditMem = new MemoryAppender(new JsonFormatter(), Level.TRACE);
        Logger audit = factory.getLogger("com.shop.audit");
        audit.addAppender(auditMem);
        LogContext.put("requestId", "r-42");
        audit.warn("refund issued");
        LogContext.clear();
        Check.that(auditMem.lines.size() == 1 && mem.lines.size() == 3, "event reaches own and root appenders");
        Check.that(auditMem.lines.get(0).contains("\"requestId\":\"r-42\"") && auditMem.lines.get(0).contains("\"level\":\"WARN\""), "JSON includes MDC context");
        audit.setAdditive(false);
        audit.warn("only here");
        Check.that(auditMem.lines.size() == 2 && mem.lines.size() == 3, "additivity off stops propagation");

        // Errors carry stack traces
        pay.error("payment failed", new IllegalStateException("gateway timeout"));
        Check.that(mem.lines.getLast().contains("IllegalStateException: gateway timeout"), "stack trace appended");

        // Async + file appender: 8 threads × 5,000 events, all written, none interleaved
        Path file = Files.createTempFile("app", ".log");
        var fileAppender = new FileAppender(new PatternFormatter(), file);
        var async = new AsyncAppender(fileAppender, 100_000);
        var f2 = new LoggerFactory();
        f2.root().setLevel(Level.INFO);
        f2.root().addAppender(async);
        var pool = Executors.newFixedThreadPool(8);
        List<Future<?>> fs = new ArrayList<>();
        for (int t = 0; t < 8; t++) {
            int id = t;
            fs.add(pool.submit(() -> {
                Logger lg = f2.getLogger("svc.worker" + id);
                for (int i = 0; i < 5_000; i++) lg.info("event {} from {}", i, id);
            }));
        }
        for (var f : fs) f.get();
        pool.shutdown();
        async.close();                                  // drains the queue, then closes the file
        List<String> lines = Files.readAllLines(file);
        Check.that(lines.size() == 40_000, "every event written after close() drains: " + lines.size());
        Check.that(lines.stream().allMatch(l -> l.matches("\\S+ INFO  \\[.+] svc\\.worker\\d - event \\d+ from \\d")), "no torn or interleaved lines");

        // Drop policy: a tiny queue with a slow delegate drops INFO but counts it
        var slow = new Appender() { public void append(LogEvent e) { sleep(2); } };
        var tiny = new AsyncAppender(slow, 4);
        for (int i = 0; i < 200; i++) tiny.append(event(Level.INFO, "spam"));
        Check.that(tiny.dropped() > 0, "overflowing INFO events are dropped and counted (" + tiny.dropped() + ")");
        tiny.close();

        // Concurrent getLogger on deep names never trips the recursive-update bug
        var f3 = new LoggerFactory();
        var p3 = Executors.newFixedThreadPool(32);
        List<Future<Logger>> got = new ArrayList<>();
        for (int i = 0; i < 2_000; i++) {
            int n = i % 50;
            got.add(p3.submit(() -> f3.getLogger("a.b.c.d.e.f.g.h" + n)));
        }
        Set<Logger> unique = Collections.newSetFromMap(new IdentityHashMap<>());
        for (var g : got) unique.add(g.get());
        p3.shutdown();
        Check.that(unique.size() == 50, "exactly one logger per name under contention");

        Check.done("logging-framework");
    }

    static LogEvent event(Level l, String msg) {
        return new LogEvent(Instant.now(), l, "test", "main", msg, null, Map.of());
    }
    static void sleep(long ms) { try { Thread.sleep(ms); } catch (InterruptedException e) { Thread.currentThread().interrupt(); } }
}

enum Level {
    TRACE, DEBUG, INFO, WARN, ERROR, FATAL;
    boolean isAtLeast(Level other) { return compareTo(other) >= 0; }
}

record LogEvent(Instant timestamp, Level level, String loggerName, String thread,
                String message, Throwable error, Map<String, String> context) { }

/** The MDC: per-thread contextual fields such as request IDs. Clear it at the end of every request. */
final class LogContext {
    private static final ThreadLocal<Map<String, String>> CTX = ThreadLocal.withInitial(HashMap::new);
    static void put(String k, String v) { CTX.get().put(k, v); }
    static Map<String, String> snapshot() { return Map.copyOf(CTX.get()); }
    static void clear() { CTX.remove(); }
}

final class MessageFormatter {
    static String format(String template, Object... args) {
        if (args == null || args.length == 0) return template;
        StringBuilder sb = new StringBuilder();
        int argIdx = 0, from = 0, at;
        while ((at = template.indexOf("{}", from)) >= 0 && argIdx < args.length) {
            sb.append(template, from, at).append(args[argIdx++]);
            from = at + 2;
        }
        return sb.append(template.substring(from)).toString();
    }
}

interface Formatter { String format(LogEvent e); }

final class PatternFormatter implements Formatter {
    private static final DateTimeFormatter TS = DateTimeFormatter.ISO_INSTANT;
    @Override public String format(LogEvent e) {
        String line = "%s %-5s [%s] %s - %s".formatted(TS.format(e.timestamp()), e.level(),
                e.thread(), e.loggerName(), e.message());
        return e.error() == null ? line : line + System.lineSeparator() + stackTrace(e.error());
    }
    static String stackTrace(Throwable t) {
        var sw = new StringWriter();
        t.printStackTrace(new PrintWriter(sw));
        return sw.toString().stripTrailing();
    }
}

final class JsonFormatter implements Formatter {
    @Override public String format(LogEvent e) {
        StringBuilder sb = new StringBuilder("{");
        field(sb, "ts", e.timestamp().toString()).append(',');
        field(sb, "level", e.level().name()).append(',');
        field(sb, "logger", e.loggerName()).append(',');
        field(sb, "thread", e.thread()).append(',');
        field(sb, "msg", e.message());
        e.context().forEach((k, v) -> field(sb.append(','), k, v));
        if (e.error() != null) field(sb.append(','), "error", e.error().toString());
        return sb.append('}').toString();
    }
    private static StringBuilder field(StringBuilder sb, String k, String v) {
        return sb.append('"').append(escape(k)).append("\":\"").append(escape(v)).append('"');
    }
    private static String escape(String s) {
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n");
    }
}

interface Appender extends AutoCloseable {
    void append(LogEvent event);
    @Override default void close() { }
}

final class MemoryAppender implements Appender {
    final List<String> lines = new CopyOnWriteArrayList<>();
    private final Formatter formatter;
    private final Level threshold;
    MemoryAppender(Formatter f, Level threshold) { this.formatter = f; this.threshold = threshold; }
    public void append(LogEvent e) { if (e.level().isAtLeast(threshold)) lines.add(formatter.format(e)); }
}

final class FileAppender implements Appender {
    private final Formatter formatter;
    private final BufferedWriter writer;
    private final ReentrantLock lock = new ReentrantLock();   // serialise writes to one file

    FileAppender(Formatter formatter, Path path) throws IOException {
        this.formatter = formatter;
        this.writer = Files.newBufferedWriter(path, StandardOpenOption.CREATE, StandardOpenOption.APPEND);
    }

    @Override public void append(LogEvent e) {
        String line = formatter.format(e);                     // format outside the lock
        lock.lock();
        try {
            writer.write(line);
            writer.newLine();
            if (e.level().isAtLeast(Level.ERROR)) writer.flush();   // don't lose errors on crash
        } catch (IOException io) {
            System.err.println("FileAppender failed: " + io.getMessage());   // logging must never throw into app code
        } finally {
            lock.unlock();
        }
    }

    @Override public void close() {
        lock.lock();
        try { writer.close(); } catch (IOException io) { System.err.println("close failed: " + io); }
        finally { lock.unlock(); }
    }
}

final class AsyncAppender implements Appender {
    private final Appender delegate;
    private final BlockingQueue<LogEvent> queue;
    private final Thread worker;
    private final AtomicLong dropped = new AtomicLong();
    private volatile boolean running = true;

    AsyncAppender(Appender delegate, int capacity) {
        this.delegate = delegate;
        this.queue = new ArrayBlockingQueue<>(capacity);
        this.worker = new Thread(this::drain, "async-appender");
        this.worker.setDaemon(true);
        this.worker.start();
    }

    @Override public void append(LogEvent e) {
        if (queue.offer(e)) return;
        // Back-pressure policy: never block the app on DEBUG/INFO; wait briefly for errors
        if (e.level().isAtLeast(Level.ERROR)) {
            try {
                if (queue.offer(e, 50, TimeUnit.MILLISECONDS)) return;
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
            }
        }
        dropped.incrementAndGet();                              // count every lost event
    }

    private void drain() {
        while (running || !queue.isEmpty()) {
            try {
                LogEvent e = queue.poll(200, TimeUnit.MILLISECONDS);
                if (e != null) delegate.append(e);
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                return;
            } catch (RuntimeException ex) {
                System.err.println("Appender failed: " + ex);       // keep draining
            }
        }
    }

    long dropped() { return dropped.get(); }

    @Override public void close() {
        running = false;
        try { worker.join(5_000); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); }
        delegate.close();
    }
}

final class Logger {
    private final String name;
    private final Logger parent;
    private volatile Level level;                      // null → inherit from parent
    private final List<Appender> appenders = new CopyOnWriteArrayList<>();
    private volatile boolean additive = true;          // also send to parent's appenders

    Logger(String name, Logger parent) { this.name = name; this.parent = parent; }

    boolean isEnabled(Level l) { return l.isAtLeast(effectiveLevel()); }

    void trace(String msg, Object... args) { log(Level.TRACE, msg, null, args); }
    void debug(String msg, Object... args) { log(Level.DEBUG, msg, null, args); }
    void info(String msg, Object... args)  { log(Level.INFO, msg, null, args); }
    void warn(String msg, Object... args)  { log(Level.WARN, msg, null, args); }
    void error(String msg, Throwable t)    { log(Level.ERROR, msg, t); }

    private void log(Level l, String template, Throwable t, Object... args) {
        if (!isEnabled(l)) return;                     // cheap check before any formatting work
        var event = new LogEvent(Instant.now(), l, name, Thread.currentThread().getName(),
                                 MessageFormatter.format(template, args), t, LogContext.snapshot());
        for (Logger lg = this; lg != null; lg = lg.additive ? lg.parent : null) {
            for (Appender a : lg.appenders) a.append(event);
        }
    }

    private Level effectiveLevel() {
        for (Logger lg = this; lg != null; lg = lg.parent) if (lg.level != null) return lg.level;
        return Level.INFO;
    }

    void setLevel(Level l) { this.level = l; }
    void setAdditive(boolean a) { this.additive = a; }
    void addAppender(Appender a) { appenders.add(a); }
}

final class LoggerFactory {
    private final ConcurrentMap<String, Logger> loggers = new ConcurrentHashMap<>();
    private final Logger root = new Logger("", null);

    Logger root() { return root; }

    Logger getLogger(String name) {
        Logger existing = loggers.get(name);
        if (existing != null) return existing;
        Logger parent = parentOf(name);                    // resolve the parent chain first...
        return loggers.computeIfAbsent(name, n -> new Logger(n, parent));   // ...then create atomically
    }

    private Logger parentOf(String name) {
        int dot = name.lastIndexOf('.');
        return dot < 0 ? root : getLogger(name.substring(0, dot));
    }
}

final class Check {
    private static int passed;
    static void that(boolean cond, String what) { if (!cond) throw new AssertionError("FAILED: " + what); passed++; }
    static void done(String name) { System.out.println("✓ " + name + ": " + passed + " checks passed"); }
}
