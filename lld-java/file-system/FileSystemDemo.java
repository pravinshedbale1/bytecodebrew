// Design an In-Memory File System — runnable reference solution for the lesson.
// Run: java lld-java/file-system/FileSystemDemo.java
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.locks.*;
import java.util.function.Predicate;

public class FileSystemDemo {
    public static void main(String[] args) throws Exception {
        var fs = new FileSystem();

        fs.mkdirs("/a/b/c");
        fs.writeFile("/a/b/c/notes.txt", "hello");
        fs.appendFile("/a/b/c/notes.txt", " world");
        Check.that(fs.readFile("/a/b/c/notes.txt").equals("hello world"), "write + append + read");
        Check.that(fs.ls("/a/b/c/notes.txt").equals(List.of("notes.txt")), "ls on a file lists the file");
        fs.writeFile("/a/b/z.txt", "z");
        fs.mkdirs("/a/b/aa");
        Check.that(fs.ls("/a/b").equals(List.of("aa", "c", "z.txt")), "ls is sorted");
        Check.that(fs.readFile("/a/b/c/../z.txt").equals("z"), ".. and . are resolved");

        // Errors are specific
        Check.throwsEx(NoSuchPathException.class, () -> fs.readFile("/nope.txt"), "missing file");
        Check.throwsEx(NotADirectoryException.class, () -> fs.mkdirs("/a/b/z.txt/d"), "can't create inside a file");
        Check.throwsEx(IsADirectoryException.class, () -> fs.readFile("/a/b"), "can't read a directory");
        Check.throwsEx(AlreadyExistsException.class, () -> fs.mkdir("/a"), "mkdir on an existing path");
        Check.throwsEx(DirectoryNotEmptyException.class, () -> fs.delete("/a", false), "non-recursive delete of a non-empty dir");
        Check.throwsEx(InvalidPathException.class, () -> fs.mkdirs("relative/path"), "paths must be absolute");

        // Composite: sizes roll up
        Check.that(fs.size("/a") == "hello world".length() + 1, "directory size = sum of file sizes");

        // Move / rename, with cycle protection
        fs.move("/a/b/z.txt", "/a/z-renamed.txt");
        Check.that(fs.ls("/a").equals(List.of("b", "z-renamed.txt")), "file moved and renamed");
        Check.throwsEx(InvalidMoveException.class, () -> fs.move("/a", "/a/b/aa/a"), "can't move a directory into itself");

        // Visitor: find by predicate
        fs.writeFile("/a/b/aa/report.log", "x".repeat(10));
        fs.writeFile("/a/b/c/big.log", "y".repeat(500));
        List<String> logs = fs.find("/", n -> n instanceof FileNode f && f.name().endsWith(".log"));
        Check.that(logs.equals(List.of("/a/b/aa/report.log", "/a/b/c/big.log")), "find *.log (" + logs + ")");
        List<String> large = fs.find("/", n -> n instanceof FileNode f && f.size() > 100);
        Check.that(large.equals(List.of("/a/b/c/big.log")), "find files larger than 100 bytes");

        // Recursive delete
        fs.delete("/a/b", true);
        Check.that(fs.ls("/a").equals(List.of("z-renamed.txt")) && fs.size("/") == 1, "recursive delete");

        // Concurrency: 16 threads create files in shared directories; nothing lost
        var pool = Executors.newFixedThreadPool(16);
        List<Future<?>> futures = new ArrayList<>();
        for (int t = 0; t < 16; t++) {
            int id = t;
            futures.add(pool.submit(() -> {
                for (int i = 0; i < 200; i++) {
                    fs.mkdirs("/shared/d" + (i % 10));
                    fs.writeFile("/shared/d" + (i % 10) + "/t" + id + "-" + i, "1");
                }
            }));
        }
        for (var f : futures) f.get();
        pool.shutdown();
        Check.that(fs.size("/shared") == 3_200, "3,200 files created concurrently, none lost");

        Check.done("file-system");
    }
}

// ---------- exceptions ----------
class FsException extends RuntimeException { FsException(String m) { super(m); } }
class NoSuchPathException extends FsException { NoSuchPathException(String p) { super("No such file or directory: " + p); } }
class NotADirectoryException extends FsException { NotADirectoryException(String p) { super("Not a directory: " + p); } }
class IsADirectoryException extends FsException { IsADirectoryException(String p) { super("Is a directory: " + p); } }
class AlreadyExistsException extends FsException { AlreadyExistsException(String p) { super("Already exists: " + p); } }
class DirectoryNotEmptyException extends FsException { DirectoryNotEmptyException(String p) { super("Directory not empty: " + p); } }
class InvalidPathException extends FsException { InvalidPathException(String p) { super("Invalid path: " + p); } }
class InvalidMoveException extends FsException { InvalidMoveException(String m) { super(m); } }

// ---------- composite ----------
abstract sealed class Node permits FileNode, DirectoryNode {
    private String name;
    private DirectoryNode parent;
    Node(String name) { this.name = name; }
    String name() { return name; }
    void rename(String n) { this.name = n; }
    DirectoryNode parent() { return parent; }
    void setParent(DirectoryNode p) { this.parent = p; }
    abstract long size();
    abstract <R> R accept(NodeVisitor<R> v);

    String path() {
        if (parent == null) return "/";
        String p = parent.path();
        return (p.equals("/") ? "" : p) + "/" + name;
    }
}

final class FileNode extends Node {
    private final StringBuilder content = new StringBuilder();
    FileNode(String name) { super(name); }
    long size() { return content.length(); }
    String read() { return content.toString(); }
    void write(String s) { content.setLength(0); content.append(s); }
    void append(String s) { content.append(s); }
    <R> R accept(NodeVisitor<R> v) { return v.visitFile(this); }
}

final class DirectoryNode extends Node {
    private final TreeMap<String, Node> children = new TreeMap<>();     // sorted for ls
    DirectoryNode(String name) { super(name); }
    long size() { return children.values().stream().mapToLong(Node::size).sum(); }
    Optional<Node> child(String name) { return Optional.ofNullable(children.get(name)); }
    void add(Node n) { children.put(n.name(), n); n.setParent(this); }
    void remove(String name) { Node n = children.remove(name); if (n != null) n.setParent(null); }
    Collection<Node> children() { return children.values(); }
    boolean isEmpty() { return children.isEmpty(); }
    <R> R accept(NodeVisitor<R> v) { return v.visitDirectory(this); }
}

interface NodeVisitor<R> {
    R visitFile(FileNode f);
    R visitDirectory(DirectoryNode d);
}

/** Collects paths of nodes matching a predicate, depth-first in name order. */
final class FindVisitor implements NodeVisitor<Void> {
    private final Predicate<Node> predicate;
    final List<String> matches = new ArrayList<>();
    FindVisitor(Predicate<Node> predicate) { this.predicate = predicate; }
    public Void visitFile(FileNode f) { if (predicate.test(f)) matches.add(f.path()); return null; }
    public Void visitDirectory(DirectoryNode d) {
        if (predicate.test(d)) matches.add(d.path());
        for (Node c : d.children()) c.accept(this);
        return null;
    }
}

// ---------- facade ----------
final class FileSystem {
    private final DirectoryNode root = new DirectoryNode("");
    private final ReadWriteLock lock = new ReentrantReadWriteLock();   // one lock for the whole tree

    void mkdir(String path) { write(() -> { createDir(parts(path), false); return null; }); }
    void mkdirs(String path) { write(() -> { createDir(parts(path), true); return null; }); }

    void writeFile(String path, String content) { write(() -> { fileForWrite(path).write(content); return null; }); }
    void appendFile(String path, String content) { write(() -> { fileForWrite(path).append(content); return null; }); }

    String readFile(String path) {
        return read(() -> {
            Node n = resolve(path);
            if (n instanceof FileNode f) return f.read();
            throw new IsADirectoryException(path);
        });
    }

    List<String> ls(String path) {
        return read(() -> {
            Node n = resolve(path);
            if (n instanceof FileNode f) return List.of(f.name());
            return ((DirectoryNode) n).children().stream().map(Node::name).toList();
        });
    }

    long size(String path) { return read(() -> resolve(path).size()); }

    void delete(String path, boolean recursive) {
        write(() -> {
            Node n = resolve(path);
            if (n == root) throw new InvalidPathException("cannot delete /");
            if (n instanceof DirectoryNode d && !d.isEmpty() && !recursive) throw new DirectoryNotEmptyException(path);
            n.parent().remove(n.name());
            return null;
        });
    }

    void move(String from, String to) {
        write(() -> {
            Node src = resolve(from);
            List<String> target = parts(to);
            DirectoryNode destParent = existingDir(target.subList(0, target.size() - 1));
            for (Node p = destParent; p != null; p = p.parent())
                if (p == src) throw new InvalidMoveException("Cannot move " + from + " into itself");
            String newName = target.getLast();
            if (destParent.child(newName).isPresent()) throw new AlreadyExistsException(to);
            src.parent().remove(src.name());
            src.rename(newName);
            destParent.add(src);
            return null;
        });
    }

    List<String> find(String path, Predicate<Node> predicate) {
        return read(() -> {
            var v = new FindVisitor(predicate);
            resolve(path).accept(v);
            return v.matches;
        });
    }

    // ---- helpers (call with the lock held) ----
    private List<String> parts(String path) {
        if (path == null || !path.startsWith("/")) throw new InvalidPathException(path);
        Deque<String> stack = new ArrayDeque<>();
        for (String part : path.split("/")) {
            if (part.isEmpty() || part.equals(".")) continue;
            if (part.equals("..")) { if (!stack.isEmpty()) stack.removeLast(); continue; }
            stack.addLast(part);
        }
        return new ArrayList<>(stack);
    }

    private Node resolve(String path) {
        Node cur = root;
        for (String part : parts(path)) {
            if (!(cur instanceof DirectoryNode d)) throw new NotADirectoryException(cur.path());
            cur = d.child(part).orElseThrow(() -> new NoSuchPathException(path));
        }
        return cur;
    }

    private DirectoryNode createDir(List<String> parts, boolean parents) {
        DirectoryNode cur = root;
        for (int i = 0; i < parts.size(); i++) {
            String part = parts.get(i);
            Optional<Node> next = cur.child(part);
            boolean last = i == parts.size() - 1;
            if (next.isPresent()) {
                if (!(next.get() instanceof DirectoryNode d)) throw new NotADirectoryException(next.get().path());
                if (last && !parents) throw new AlreadyExistsException(d.path());
                cur = d;
            } else {
                if (!last && !parents) throw new NoSuchPathException(cur.path() + "/" + part);
                DirectoryNode d = new DirectoryNode(part);
                cur.add(d);
                cur = d;
            }
        }
        return cur;
    }

    private DirectoryNode existingDir(List<String> parts) {
        Node cur = root;
        for (String part : parts) {
            if (!(cur instanceof DirectoryNode d)) throw new NotADirectoryException(cur.path());
            cur = d.child(part).orElseThrow(() -> new NoSuchPathException("/" + String.join("/", parts)));
        }
        if (!(cur instanceof DirectoryNode d)) throw new NotADirectoryException(cur.path());
        return d;
    }

    private FileNode fileForWrite(String path) {
        List<String> p = parts(path);
        if (p.isEmpty()) throw new IsADirectoryException("/");
        DirectoryNode dir = existingDir(p.subList(0, p.size() - 1));
        Node existing = dir.child(p.getLast()).orElse(null);
        if (existing instanceof DirectoryNode) throw new IsADirectoryException(path);
        if (existing instanceof FileNode f) return f;
        FileNode f = new FileNode(p.getLast());
        dir.add(f);
        return f;
    }

    private <T> T read(Callable<T> op) {
        lock.readLock().lock();
        try { return op.call(); } catch (RuntimeException e) { throw e; } catch (Exception e) { throw new IllegalStateException(e); }
        finally { lock.readLock().unlock(); }
    }

    private <T> T write(Callable<T> op) {
        lock.writeLock().lock();
        try { return op.call(); } catch (RuntimeException e) { throw e; } catch (Exception e) { throw new IllegalStateException(e); }
        finally { lock.writeLock().unlock(); }
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
