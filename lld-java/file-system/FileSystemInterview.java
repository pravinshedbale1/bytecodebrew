// Design an In-Memory File System — the interview-sized version from the top of the lesson.
// Run: java lld-java/file-system/FileSystemInterview.java
import java.util.*;

public class FileSystemInterview {
    public static void main(String[] args) {
        var fs = new FileSystem();
        fs.mkdir("/a/b/c");
        fs.mkdir("/a/b/c");                                   // mkdir -p: no error the second time
        fs.writeFile("/a/b/notes.txt", "hello");
        fs.writeFile("/a/b/notes.txt", " world");
        check(fs.read("/a/b/notes.txt").equals("hello world"), "append on write");
        check(fs.ls("/a/b").equals(List.of("c", "notes.txt")), "ls is sorted");
        check(fs.ls("/a/b/notes.txt").equals(List.of("notes.txt")), "ls on a file shows the file");
        check(fs.size("/a") == 11, "directory size adds up its children");
        check(fs.ls("/").equals(List.of("a")), "root listing");
        fails(() -> fs.mkdir("/a/b/notes.txt/x"), "can't make a directory under a file");
        fails(() -> fs.writeFile("/a/b", "x"), "can't write to a directory");
        fails(() -> fs.read("/a/missing"), "missing path");
        fails(() -> fs.writeFile("/nope/f.txt", "x"), "parent must exist");
        done("file-system");
    }

    static int passed;
    static void check(boolean ok, String what) { if (!ok) throw new AssertionError("FAILED: " + what); passed++; }
    static void fails(Runnable r, String what) { try { r.run(); } catch (RuntimeException e) { passed++; return; } throw new AssertionError("FAILED (no exception): " + what); }
    static void done(String name) { System.out.println("✓ " + name + " (interview version): " + passed + " checks passed"); }
}

// ---- lesson excerpt: everything below is shown in the lesson
abstract class Node {                                  // Composite: files and folders share one type
    final String name;
    Node(String name) { this.name = name; }
    abstract int size();
}

class FileNode extends Node {
    private final StringBuilder content = new StringBuilder();
    FileNode(String name) { super(name); }
    void append(String text) { content.append(text); }
    String read() { return content.toString(); }
    int size() { return content.length(); }
}

class Directory extends Node {
    final Map<String, Node> children = new TreeMap<>(); // sorted, so ls comes out in order
    Directory(String name) { super(name); }
    int size() { return children.values().stream().mapToInt(Node::size).sum(); }
}

class FileSystem {
    private final Directory root = new Directory("");

    synchronized void mkdir(String path) {             // like mkdir -p
        Directory dir = root;
        for (String part : parts(path)) {
            Node child = dir.children.computeIfAbsent(part, Directory::new);
            if (!(child instanceof Directory d)) throw new IllegalArgumentException(part + " is a file");
            dir = d;
        }
    }

    synchronized void writeFile(String path, String text) {
        List<String> p = parts(path);
        Directory parent = directoryAt(p.subList(0, p.size() - 1));
        Node node = parent.children.computeIfAbsent(p.get(p.size() - 1), FileNode::new);
        if (!(node instanceof FileNode file)) throw new IllegalArgumentException(path + " is a directory");
        file.append(text);
    }

    synchronized String read(String path) {
        if (!(nodeAt(parts(path)) instanceof FileNode file)) throw new IllegalArgumentException(path + " is a directory");
        return file.read();
    }

    synchronized List<String> ls(String path) {
        Node node = nodeAt(parts(path));
        return node instanceof Directory d ? List.copyOf(d.children.keySet()) : List.of(node.name);
    }

    synchronized int size(String path) { return nodeAt(parts(path)).size(); }

    private Node nodeAt(List<String> parts) {
        Node node = root;
        for (String part : parts) {
            if (!(node instanceof Directory d) || !d.children.containsKey(part))
                throw new IllegalArgumentException("No such path: /" + String.join("/", parts));
            node = d.children.get(part);
        }
        return node;
    }

    private Directory directoryAt(List<String> parts) {
        if (!(nodeAt(parts) instanceof Directory d)) throw new IllegalArgumentException("Not a directory");
        return d;
    }

    private static List<String> parts(String path) {
        return Arrays.stream(path.split("/")).filter(s -> !s.isEmpty()).toList();
    }
}
