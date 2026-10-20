// Design a Logging Framework — the interview-sized version from the top of the lesson.
// Run: java lld-java/logging-framework/LoggingFrameworkInterview.java
import java.util.*;
import java.util.concurrent.*;

public class LoggingFrameworkInterview {
    static final class ListAppender implements Appender {
        final List<String> lines = Collections.synchronizedList(new ArrayList<>());
        final Formatter f = new SimpleFormatter();
        public void append(LogEvent e) { lines.add(f.format(e)); }
    }

    public static void main(String[] args) throws Exception {
        Logger log = LoggerFactory.get("payments");
        check(log == LoggerFactory.get("payments"), "one logger per name");
        var out = new ListAppender();
        log.addAppender(out);
        log.debug("hidden");
        log.info("order paid");
        log.error("refund failed");
        check(out.lines.size() == 2, "DEBUG filtered at INFO level");
        check(out.lines.get(0).endsWith("[INFO] payments - order paid"), "format: " + out.lines.get(0));
        log.setLevel(Level.ERROR);
        log.warn("hidden too");
        check(out.lines.size() == 2, "level can change at runtime");

        Logger busy = LoggerFactory.get("busy");
        var all = new ListAppender();
        busy.addAppender(all);
        try (var pool = Executors.newFixedThreadPool(8)) {
            for (int t = 0; t < 8; t++) pool.submit(() -> { for (int i = 0; i < 500; i++) busy.info("x"); });
        }
        check(all.lines.size() == 4000, "no lost lines from 8 threads");
        done("logging-framework");
    }

    static int passed;
    static void check(boolean ok, String what) { if (!ok) throw new AssertionError("FAILED: " + what); passed++; }
    static void done(String name) { System.out.println("✓ " + name + " (interview version): " + passed + " checks passed"); }
}

// ---- lesson excerpt: everything below is shown in the lesson
enum Level { DEBUG, INFO, WARN, ERROR }            // declaration order = severity order

record LogEvent(Level level, String logger, String message, long timeMillis) { }

interface Formatter { String format(LogEvent e); }  // Strategy: how a line looks

class SimpleFormatter implements Formatter {
    public String format(LogEvent e) { return e.timeMillis() + " [" + e.level() + "] " + e.logger() + " - " + e.message(); }
}

interface Appender { void append(LogEvent e); }     // where a line goes: console, file, network

class ConsoleAppender implements Appender {
    private final Formatter formatter;
    ConsoleAppender(Formatter formatter) { this.formatter = formatter; }
    public synchronized void append(LogEvent e) { System.out.println(formatter.format(e)); }
}

class Logger {
    private final String name;
    private volatile Level minLevel = Level.INFO;
    private final List<Appender> appenders = new CopyOnWriteArrayList<>();   // safe to read while others log

    Logger(String name) { this.name = name; }
    void addAppender(Appender a) { appenders.add(a); }
    void setLevel(Level level) { minLevel = level; }

    void debug(String msg) { log(Level.DEBUG, msg); }
    void info(String msg)  { log(Level.INFO, msg); }
    void warn(String msg)  { log(Level.WARN, msg); }
    void error(String msg) { log(Level.ERROR, msg); }

    private void log(Level level, String msg) {
        if (level.compareTo(minLevel) < 0) return;                       // filtered out cheaply
        LogEvent event = new LogEvent(level, name, msg, System.currentTimeMillis());
        for (Appender a : appenders) a.append(event);
    }
}

class LoggerFactory {                               // same name -> same logger
    private static final Map<String, Logger> loggers = new ConcurrentHashMap<>();
    static Logger get(String name) { return loggers.computeIfAbsent(name, Logger::new); }
}
