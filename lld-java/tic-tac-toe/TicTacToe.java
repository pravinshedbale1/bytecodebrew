// Design Tic-Tac-Toe — runnable reference solution for the lesson.
// Run: java lld-java/tic-tac-toe/TicTacToe.java
import java.util.*;

public class TicTacToe {
    public static void main(String[] args) {
        // Row, column, diagonal and anti-diagonal wins on 3×3
        Check.that(play(3, new int[][]{{0,0},{1,0},{0,1},{1,1},{0,2}}).winner().name().equals("Asha"), "row win");
        Check.that(play(3, new int[][]{{0,1},{0,0},{1,1},{1,0},{2,2},{2,0}}).winner().name().equals("Ravi"), "column win for O");
        Check.that(play(3, new int[][]{{0,0},{0,1},{1,1},{0,2},{2,2}}).winner().name().equals("Asha"), "main diagonal");
        Check.that(play(3, new int[][]{{0,2},{0,0},{1,1},{0,1},{2,0}}).winner().name().equals("Asha"), "anti-diagonal");
        MoveResult draw = play(3, new int[][]{{0,0},{0,1},{0,2},{1,1},{1,0},{1,2},{2,1},{2,0},{2,2}});
        Check.that(draw.status() == GameStatus.DRAW && draw.winner() == null, "full board without a line is a draw");

        // Invalid moves
        var g = newGame(3);
        Player x = g.currentPlayer();
        g.makeMove(x, new Position(1, 1));
        Check.throwsEx(InvalidMoveException.class, () -> g.makeMove(x, new Position(0, 0)), "same player twice");
        Player o = g.currentPlayer();
        Check.throwsEx(InvalidMoveException.class, () -> g.makeMove(o, new Position(1, 1)), "occupied cell");
        Check.throwsEx(InvalidMoveException.class, () -> g.makeMove(o, new Position(3, 0)), "out of bounds");
        Check.that(g.currentPlayer() == o, "rejected move does not advance the turn");

        // N×N with the counter detector: a 5×5 column needs 5
        var big = new Game(new Board(5), List.of(new Player("A", Symbol.X, null), new Player("B", Symbol.O, null)), new CounterWinDetector(5));
        for (int r = 0; r < 4; r++) { big.makeMove(big.currentPlayer(), new Position(r, 0)); big.makeMove(big.currentPlayer(), new Position(r, 4)); }
        Check.that(big.makeMove(big.currentPlayer(), new Position(4, 0)).status() == GameStatus.WON, "5 in a column on 5×5");

        // K-in-a-row (Gomoku-style): 4 in a row on a 7×7 board, diagonal through the last move
        var board = new Board(7);
        var detector = new KInARowDetector(board, 4);
        var k = new Game(board, List.of(new Player("A", Symbol.X, null), new Player("B", Symbol.O, null)), detector);
        int[][] moves = {{1,1},{0,6},{2,2},{1,6},{4,4},{2,6},{3,3}};    // X fills 1,1 2,2 4,4 then 3,3 completes four
        MoveResult last = null;
        for (int[] m : moves) last = k.makeMove(k.currentPlayer(), new Position(m[0], m[1]));
        Check.that(last.status() == GameStatus.WON && last.winner().name().equals("A"), "gap filled last still wins (both directions counted)");

        // Three players and bots: random bots always finish with a valid result
        for (int seed = 0; seed < 500; seed++) {
            var rnd = new Random(seed);
            var players = List.of(new Player("X", Symbol.X, new RandomBot(rnd)), new Player("O", Symbol.O, new RandomBot(rnd)),
                                  new Player("T", Symbol.TRIANGLE, new RandomBot(rnd)));
            var game = new Game(new Board(4), players, new CounterWinDetector(4));
            MoveResult r = game.play();
            Check.that(r.status() != GameStatus.IN_PROGRESS, "bot game " + seed + " finished");
        }
        Check.throwsEx(IllegalArgumentException.class,
                () -> new Game(new Board(3), List.of(new Player("A", Symbol.X, null), new Player("B", Symbol.X, null)), new CounterWinDetector(3)),
                "duplicate symbols rejected");

        Check.done("tic-tac-toe");
    }

    static Game newGame(int n) {
        return new Game(new Board(n), List.of(new Player("Asha", Symbol.X, null), new Player("Ravi", Symbol.O, null)), new CounterWinDetector(n));
    }

    static MoveResult play(int n, int[][] moves) {
        Game g = newGame(n);
        MoveResult r = null;
        for (int[] m : moves) r = g.makeMove(g.currentPlayer(), new Position(m[0], m[1]));
        return r;
    }
}

enum Symbol { X, O, TRIANGLE }
record Position(int row, int col) { }
enum GameStatus { IN_PROGRESS, WON, DRAW }
record MoveResult(GameStatus status, Player winner) { }

class InvalidMoveException extends RuntimeException { InvalidMoveException(String m) { super(m); } }

final class Board {
    private final int size;
    private final Symbol[][] cells;
    private int filled;

    Board(int size) {
        if (size < 3) throw new IllegalArgumentException("size must be >= 3");
        this.size = size;
        this.cells = new Symbol[size][size];
    }

    void place(Position p, Symbol s) {
        if (!inBounds(p)) throw new InvalidMoveException("Out of bounds: " + p);
        if (cells[p.row()][p.col()] != null) throw new InvalidMoveException("Occupied: " + p);
        cells[p.row()][p.col()] = s;
        filled++;
    }

    boolean inBounds(Position p) { return p.row() >= 0 && p.row() < size && p.col() >= 0 && p.col() < size; }
    boolean isEmpty(Position p)  { return inBounds(p) && cells[p.row()][p.col()] == null; }
    boolean isFull()             { return filled == size * size; }
    Symbol symbolAt(Position p)  { return cells[p.row()][p.col()]; }
    int size()                   { return size; }

    List<Position> emptyCells() {
        List<Position> out = new ArrayList<>();
        for (int r = 0; r < size; r++) for (int c = 0; c < size; c++) if (cells[r][c] == null) out.add(new Position(r, c));
        return out;
    }
}

interface WinDetector {
    /** Records a move and returns true if it wins the game. */
    boolean record(Position p, Symbol s);
}

final class CounterWinDetector implements WinDetector {
    private final int n;
    private final Map<Symbol, int[]> rows = new EnumMap<>(Symbol.class);
    private final Map<Symbol, int[]> cols = new EnumMap<>(Symbol.class);
    private final Map<Symbol, int[]> diags = new EnumMap<>(Symbol.class);   // [0] main, [1] anti

    CounterWinDetector(int n) { this.n = n; }

    @Override public boolean record(Position p, Symbol s) {
        int[] r = rows.computeIfAbsent(s, k -> new int[n]);
        int[] c = cols.computeIfAbsent(s, k -> new int[n]);
        int[] d = diags.computeIfAbsent(s, k -> new int[2]);

        boolean win = ++r[p.row()] == n | ++c[p.col()] == n;      // non-short-circuit: update both
        if (p.row() == p.col())          win |= ++d[0] == n;
        if (p.row() + p.col() == n - 1)  win |= ++d[1] == n;
        return win;
    }
}

final class KInARowDetector implements WinDetector {
    private static final int[][] DIRS = {{0, 1}, {1, 0}, {1, 1}, {1, -1}};   // row, column, two diagonals
    private final Board board;          // called after board.place(...), so p already holds s
    private final int k;

    KInARowDetector(Board board, int k) { this.board = board; this.k = k; }

    @Override public boolean record(Position p, Symbol s) {
        for (int[] d : DIRS) {
            int count = 1 + countDir(p, d[0], d[1], s) + countDir(p, -d[0], -d[1], s);
            if (count >= k) return true;
        }
        return false;
    }

    private int countDir(Position p, int dr, int dc, Symbol s) {
        int count = 0;
        for (Position q = new Position(p.row() + dr, p.col() + dc);
             board.inBounds(q) && board.symbolAt(q) == s;
             q = new Position(q.row() + dr, q.col() + dc)) count++;
        return count;
    }
}

interface MoveStrategy { Position choose(Board board, Symbol me); }

final class RandomBot implements MoveStrategy {
    private final Random random;
    RandomBot(Random random) { this.random = random; }        // injected → deterministic tests
    public Position choose(Board b, Symbol me) {
        List<Position> empty = b.emptyCells();
        return empty.get(random.nextInt(empty.size()));
    }
}

record Player(String name, Symbol symbol, MoveStrategy strategy) {
    Position nextMove(Board b) { return strategy.choose(b, symbol); }
}

final class Game {
    private final Board board;
    private final List<Player> players;
    private final WinDetector detector;
    private final Deque<Position> history = new ArrayDeque<>();
    private int turn;
    private GameStatus status = GameStatus.IN_PROGRESS;
    private Player winner;

    Game(Board board, List<Player> players, WinDetector detector) {
        if (players.size() < 2) throw new IllegalArgumentException("need at least 2 players");
        if (players.stream().map(Player::symbol).distinct().count() != players.size())
            throw new IllegalArgumentException("symbols must be unique");
        this.board = board; this.players = List.copyOf(players); this.detector = detector;
    }

    MoveResult makeMove(Player player, Position p) {
        if (status != GameStatus.IN_PROGRESS) throw new InvalidMoveException("Game is over");
        if (!player.equals(currentPlayer())) throw new InvalidMoveException("Not " + player.name() + "'s turn");

        board.place(p, player.symbol());              // validates bounds and occupancy
        history.push(p);

        if (detector.record(p, player.symbol())) { status = GameStatus.WON; winner = player; }
        else if (board.isFull())                  { status = GameStatus.DRAW; }
        else                                      { turn = (turn + 1) % players.size(); }

        return new MoveResult(status, winner);
    }

    MoveResult play() {                               // drives bots/humans until the game ends
        MoveResult result;
        do {
            Player p = currentPlayer();
            result = makeMove(p, p.nextMove(board));
        } while (result.status() == GameStatus.IN_PROGRESS);
        return result;
    }

    Player currentPlayer() { return players.get(turn); }
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
