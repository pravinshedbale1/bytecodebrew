// Design a Library Management System — the interview-sized version from the top of the lesson.
// Run: java lld-java/library-management/LibraryManagementInterview.java
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.*;

public class LibraryManagementInterview {
    public static void main(String[] args) {
        var lib = new Library(new PerDayFine(10));
        var book = new Book("978-0", "Clean Code");
        lib.addCopy(new BookCopy("C1", book));
        lib.addCopy(new BookCopy("C2", new Book("978-1", "Refactoring")));
        lib.addMember(new Member("M1"));
        lib.addMember(new Member("M2"));
        LocalDate day = LocalDate.of(2026, 1, 1);
        lib.borrow("M1", "C1", day);
        fails(() -> lib.borrow("M2", "C1", day), "copy already out");
        check(lib.search("clean").isEmpty(), "borrowed copy not in search results");
        check(lib.returnCopy("C1", day.plusDays(14)) == 0, "on time: no fine");
        lib.borrow("M2", "C1", day);
        check(lib.returnCopy("C1", day.plusDays(17)) == 30, "3 days late at ₹10/day");
        fails(() -> lib.returnCopy("C1", day), "returning a copy that is on the shelf");
        lib.addCopy(new BookCopy("C3", book));
        lib.addCopy(new BookCopy("C4", book));
        lib.borrow("M1", "C1", day); lib.borrow("M1", "C2", day); lib.borrow("M1", "C3", day);
        fails(() -> lib.borrow("M1", "C4", day), "loan limit of 3");
        fails(() -> lib.borrow("NOPE", "C4", day), "unknown member");
        check(lib.search("clean").size() == 1, "search finds the free copy");
        done("library-management");
    }

    static int passed;
    static void check(boolean ok, String what) { if (!ok) throw new AssertionError("FAILED: " + what); passed++; }
    static void fails(Runnable r, String what) { try { r.run(); } catch (RuntimeException e) { passed++; return; } throw new AssertionError("FAILED (no exception): " + what); }
    static void done(String name) { System.out.println("✓ " + name + " (interview version): " + passed + " checks passed"); }
}

// ---- lesson excerpt: everything below is shown in the lesson
record Book(String isbn, String title) { }

class BookCopy {                                   // a Book is the title; a copy is the thing on the shelf
    final String barcode;
    final Book book;
    String borrowedBy;                             // member id, or null when on the shelf
    LocalDate dueDate;
    BookCopy(String barcode, Book book) { this.barcode = barcode; this.book = book; }
}

class Member {
    static final int MAX_LOANS = 3;
    final String id;
    final List<BookCopy> loans = new ArrayList<>();
    Member(String id) { this.id = id; }
}

interface FinePolicy { int fine(LocalDate due, LocalDate returned); }

class PerDayFine implements FinePolicy {
    private final int perDay;
    PerDayFine(int perDay) { this.perDay = perDay; }
    public int fine(LocalDate due, LocalDate returned) {
        long lateDays = ChronoUnit.DAYS.between(due, returned);
        return lateDays > 0 ? (int) lateDays * perDay : 0;
    }
}

class Library {
    private final Map<String, BookCopy> copies = new HashMap<>();
    private final Map<String, Member> members = new HashMap<>();
    private final FinePolicy finePolicy;

    Library(FinePolicy finePolicy) { this.finePolicy = finePolicy; }
    void addCopy(BookCopy c) { copies.put(c.barcode, c); }
    void addMember(Member m) { members.put(m.id, m); }

    synchronized void borrow(String memberId, String barcode, LocalDate today) {
        Member m = find(members, memberId);
        BookCopy c = find(copies, barcode);
        if (c.borrowedBy != null) throw new IllegalStateException("Copy " + barcode + " is already out");
        if (m.loans.size() >= Member.MAX_LOANS) throw new IllegalStateException("Loan limit reached");
        c.borrowedBy = memberId;
        c.dueDate = today.plusDays(14);
        m.loans.add(c);
    }

    synchronized int returnCopy(String barcode, LocalDate today) {          // returns the fine
        BookCopy c = find(copies, barcode);
        if (c.borrowedBy == null) throw new IllegalStateException("Copy " + barcode + " is not on loan");
        members.get(c.borrowedBy).loans.remove(c);
        int fine = finePolicy.fine(c.dueDate, today);
        c.borrowedBy = null;
        c.dueDate = null;
        return fine;
    }

    synchronized List<BookCopy> search(String titleWord) {                  // free copies only
        String w = titleWord.toLowerCase();
        return copies.values().stream()
                .filter(c -> c.borrowedBy == null && c.book.title().toLowerCase().contains(w))
                .toList();
    }

    private static <T> T find(Map<String, T> map, String id) {
        T value = map.get(id);
        if (value == null) throw new IllegalArgumentException("Not found: " + id);
        return value;
    }
}
