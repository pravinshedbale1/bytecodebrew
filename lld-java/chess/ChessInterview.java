// Design Chess — the interview-sized version from the top of the lesson.
// Run: java lld-java/chess/ChessInterview.java
import java.util.*;

public class ChessInterview {
    public static void main(String[] args) {
        var b = new Board();
        b.put(new Pos(0, 0), new Rook(Color.WHITE));
        b.put(new Pos(0, 2), new Bishop(Color.WHITE));
        b.put(new Pos(0, 1), new Knight(Color.WHITE));
        b.put(new Pos(0, 4), new King(Color.WHITE));
        b.put(new Pos(7, 0), new Rook(Color.BLACK));
        b.put(new Pos(7, 4), new King(Color.BLACK));
        var g = new Game(b);
        fails(() -> g.move(new Pos(0, 0), new Pos(0, 3)), "rook can't jump over the knight");
        fails(() -> g.move(new Pos(7, 0), new Pos(6, 0)), "black can't move first");
        fails(() -> g.move(new Pos(0, 1), new Pos(1, 2)), "knight moves in an L only");
        check(g.move(new Pos(0, 1), new Pos(2, 2)) == null, "knight jumps");
        fails(() -> g.move(new Pos(0, 0), new Pos(1, 1)), "still black's turn");
        g.move(new Pos(7, 4), new Pos(6, 4));
        Piece taken = g.move(new Pos(0, 0), new Pos(7, 0));
        check(taken instanceof Rook r && r.color == Color.BLACK, "rook captures up the open file");
        g.move(new Pos(6, 4), new Pos(6, 3));
        fails(() -> g.move(new Pos(2, 2), new Pos(0, 4)), "can't capture your own piece");
        check(g.move(new Pos(0, 2), new Pos(2, 0)) == null, "bishop moves diagonally");
        fails(() -> g.move(new Pos(6, 3), new Pos(8, 3)), "off the board");
        done("chess");
    }

    static int passed;
    static void check(boolean ok, String what) { if (!ok) throw new AssertionError("FAILED: " + what); passed++; }
    static void fails(Runnable r, String what) { try { r.run(); } catch (RuntimeException e) { passed++; return; } throw new AssertionError("FAILED (no exception): " + what); }
    static void done(String name) { System.out.println("✓ " + name + " (interview version): " + passed + " checks passed"); }
}

// ---- lesson excerpt: everything below is shown in the lesson
enum Color { WHITE, BLACK }

record Pos(int row, int col) {
    boolean onBoard() { return row >= 0 && row < 8 && col >= 0 && col < 8; }
}

abstract class Piece {                            // each piece knows the shape of its own moves
    final Color color;
    Piece(Color color) { this.color = color; }
    abstract boolean canMove(Board board, Pos from, Pos to);
}

class Rook extends Piece {
    Rook(Color c) { super(c); }
    boolean canMove(Board b, Pos from, Pos to) {
        return (from.row() == to.row() || from.col() == to.col()) && b.pathClear(from, to);
    }
}

class Bishop extends Piece {
    Bishop(Color c) { super(c); }
    boolean canMove(Board b, Pos from, Pos to) {
        return Math.abs(from.row() - to.row()) == Math.abs(from.col() - to.col()) && b.pathClear(from, to);
    }
}

class Knight extends Piece {                      // jumps, so no path check
    Knight(Color c) { super(c); }
    boolean canMove(Board b, Pos from, Pos to) {
        return Math.abs(from.row() - to.row()) * Math.abs(from.col() - to.col()) == 2;
    }
}

class King extends Piece {
    King(Color c) { super(c); }
    boolean canMove(Board b, Pos from, Pos to) {
        return Math.max(Math.abs(from.row() - to.row()), Math.abs(from.col() - to.col())) == 1;
    }
}

class Board {
    private final Piece[][] grid = new Piece[8][8];
    Piece at(Pos p) { return grid[p.row()][p.col()]; }
    void put(Pos p, Piece piece) { grid[p.row()][p.col()] = piece; }

    boolean pathClear(Pos from, Pos to) {         // every square strictly between from and to is empty
        int dr = Integer.signum(to.row() - from.row()), dc = Integer.signum(to.col() - from.col());
        for (Pos p = new Pos(from.row() + dr, from.col() + dc); !p.equals(to); p = new Pos(p.row() + dr, p.col() + dc))
            if (at(p) != null) return false;
        return true;
    }
}

class Game {
    private final Board board;
    private Color turn = Color.WHITE;
    Game(Board board) { this.board = board; }

    Piece move(Pos from, Pos to) {                // returns the captured piece, or null
        if (!from.onBoard() || !to.onBoard() || from.equals(to)) throw new IllegalArgumentException("Bad squares");
        Piece piece = board.at(from);
        if (piece == null || piece.color != turn) throw new IllegalArgumentException("No " + turn + " piece there");
        Piece target = board.at(to);
        if (target != null && target.color == turn) throw new IllegalArgumentException("Your own piece is there");
        if (!piece.canMove(board, from, to)) throw new IllegalArgumentException("Illegal move");
        board.put(to, piece);
        board.put(from, null);
        turn = turn == Color.WHITE ? Color.BLACK : Color.WHITE;
        return target;
    }
}
