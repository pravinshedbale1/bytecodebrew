// Design Tic-Tac-Toe — the interview-sized version from the top of the lesson.
// Run: java lld-java/tic-tac-toe/TicTacToeInterview.java
import java.util.*;

public class TicTacToeInterview {
    public static void main(String[] args) {
        var g = new Game(3, new Player("Asha", 'X'), new Player("Ravi", 'O'));
        g.move(0, 0); g.move(1, 0); g.move(0, 1); g.move(1, 1);
        check(g.move(0, 2) == Status.WON && g.winner().name().equals("Asha"), "row win");
        fails(() -> g.move(2, 2), "no moves after the game ends");

        var d = new Game(3, new Player("A", 'X'), new Player("B", 'O'));
        int[][] moves = {{0,0},{0,1},{0,2},{1,1},{1,0},{1,2},{2,1},{2,0},{2,2}};
        Status s = null;
        for (int[] m : moves) s = d.move(m[0], m[1]);
        check(s == Status.DRAW && d.winner() == null, "full board is a draw");

        var e = new Game(3, new Player("A", 'X'), new Player("B", 'O'));
        e.move(1, 1);
        fails(() -> e.move(1, 1), "occupied cell");
        fails(() -> e.move(3, 0), "off the board");
        e.move(0, 0);                      // still O's turn after the rejected moves
        e.move(2, 2); e.move(1, 0); e.move(0, 2);
        check(e.move(2, 0) == Status.WON && e.winner().name().equals("B"), "column win for O");
        done("tic-tac-toe");
    }

    static int passed;
    static void check(boolean ok, String what) { if (!ok) throw new AssertionError("FAILED: " + what); passed++; }
    static void fails(Runnable r, String what) { try { r.run(); } catch (RuntimeException e) { passed++; return; } throw new AssertionError("FAILED (no exception): " + what); }
    static void done(String name) { System.out.println("✓ " + name + " (interview version): " + passed + " checks passed"); }
}

// ---- lesson excerpt: everything below is shown in the lesson
enum Status { IN_PROGRESS, WON, DRAW }

record Player(String name, char mark) { }

class Board {
    private final int n;
    private final char[][] cells;
    private final int[] rows, cols;            // +1 for each X, -1 for each O
    private int diagonal, antiDiagonal, moves;

    Board(int n) { this.n = n; cells = new char[n][n]; rows = new int[n]; cols = new int[n]; }

    /** Places a mark and says whether it wins. O(1): only counters change, no scanning. */
    boolean place(int r, int c, char mark) {
        if (r < 0 || r >= n || c < 0 || c >= n) throw new IllegalArgumentException("Off the board");
        if (cells[r][c] != 0) throw new IllegalArgumentException("Cell already taken");
        cells[r][c] = mark;
        moves++;
        int d = mark == 'X' ? 1 : -1;
        rows[r] += d;
        cols[c] += d;
        if (r == c) diagonal += d;
        if (r + c == n - 1) antiDiagonal += d;
        return Math.abs(rows[r]) == n || Math.abs(cols[c]) == n || Math.abs(diagonal) == n || Math.abs(antiDiagonal) == n;
    }

    boolean isFull() { return moves == n * n; }
}

class Game {
    private final Board board;
    private final Deque<Player> turns;          // the player at the front moves next
    private Status status = Status.IN_PROGRESS;
    private Player winner;

    Game(int n, Player first, Player second) { board = new Board(n); turns = new ArrayDeque<>(List.of(first, second)); }

    Status move(int r, int c) {
        if (status != Status.IN_PROGRESS) throw new IllegalStateException("Game is over");
        Player p = turns.peekFirst();
        if (board.place(r, c, p.mark())) { status = Status.WON; winner = p; }
        else if (board.isFull()) status = Status.DRAW;
        else turns.addLast(turns.pollFirst());  // next player's turn
        return status;
    }

    Player winner() { return winner; }
}
