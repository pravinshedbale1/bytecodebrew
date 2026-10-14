// Machine-coding walkthrough: Snake & Ladder — runnable reference solution for the lesson.
// Run: java lld-java/snake-and-ladder/SnakeAndLadder.java
import java.util.*;

public class SnakeAndLadder {
    public static void main(String[] args) {
        // Board validation
        Check.throwsEx(InvalidBoardException.class, () -> board(Map.of(100, 5)), "nothing may start on the final cell");
        Check.throwsEx(InvalidBoardException.class, () -> board(Map.of(10, 10)), "a jump must move");
        Check.throwsEx(InvalidBoardException.class, () -> board(Map.of(10, 30, 30, 10)), "ladder top on a snake head would loop");
        Check.throwsEx(InvalidBoardException.class, () -> board(Map.of(5, 101)), "jump must stay on the board");

        // Snakes, ladders and chains
        Board b = board(Map.of(4, 25, 27, 5, 40, 3, 21, 39, 99, 7));
        Check.that(b.finalPosition(4) == 25 && b.finalPosition(27) == 5 && b.finalPosition(50) == 50, "jumps resolve");

        // A scripted game: dice are injected so turns are deterministic
        var dice = new ScriptedDice(4, 1, 2, 6);
        var game = new Game(b, List.of(new Player("Asha"), new Player("Ravi")), dice, new ExactFinishRule());
        TurnResult t1 = game.playTurn();
        Check.that(t1.player().name().equals("Asha") && t1.to() == 25 && t1.jump() == JumpType.LADDER, "Asha rolls 4: ladder 4 → 25");
        TurnResult t2 = game.playTurn();
        Check.that(t2.player().name().equals("Ravi") && t2.to() == 1 && t2.jump() == JumpType.NONE, "Ravi rolls 1: plain move");
        TurnResult t3 = game.playTurn();
        Check.that(t3.to() == 5 && t3.jump() == JumpType.SNAKE, "Asha rolls 2: 27 is a snake down to 5");
        Check.that(game.playTurn().to() == 7 && game.position(game.players().get(0)) == 5, "positions tracked per player");

        // Exact finish: overshooting 100 means you stay put
        var endgame = new Game(board(Map.of()), List.of(new Player("A"), new Player("B")), new ScriptedDice(6, 1, 3, 1), new ExactFinishRule());
        endgame.place(endgame.players().get(0), 97);
        TurnResult over = endgame.playTurn();
        Check.that(over.to() == 97 && !over.won(), "97 + 6 overshoots: stay");
        endgame.playTurn();
        TurnResult win = endgame.playTurn();
        Check.that(win.won() && win.to() == 100, "97 + 3 = 100 wins");
        Check.that(endgame.isOver() && endgame.rankings().get(0).name().equals("A"), "two players: game ends with the first winner");

        // Bounce-back rule as an alternative strategy: 98 + 5 → 100 − 3 = 97
        var bounce = new Game(board(Map.of()), List.of(new Player("A"), new Player("B")), new ScriptedDice(5), new BounceBackRule());
        bounce.place(bounce.players().get(0), 98);
        Check.that(bounce.playTurn().to() == 97, "bounce back from 100");

        // Three players: play continues until one is left; turn order skips finished players
        var three = new Game(board(Map.of()), List.of(new Player("A"), new Player("B"), new Player("C")), new ScriptedDice(1, 1, 1, 2, 1), new ExactFinishRule());
        three.place(three.players().get(0), 99);
        three.place(three.players().get(1), 99);
        Check.that(three.playTurn().won(), "A finishes first");
        Check.that(three.playTurn().won(), "B finishes second");
        Check.that(three.isOver() && three.rankings().stream().map(Player::name).toList().equals(List.of("A", "B", "C")), "C is last");
        Check.throwsEx(IllegalStateException.class, three::playTurn, "no turns after the game is over");

        // Random boards and dice: every game terminates with a valid ranking
        for (int seed = 0; seed < 300; seed++) {
            var rnd = new Random(seed);
            var g = new Game(BoardFactory.random(rnd, 8, 8), List.of(new Player("P1"), new Player("P2"), new Player("P3"), new Player("P4")),
                    new RandomDice(rnd, 1), new ExactFinishRule());
            int turns = 0;
            while (!g.isOver() && turns++ < 100_000) g.playTurn();
            Check.that(g.isOver() && g.rankings().size() == 4, "random game " + seed + " finished");
        }

        Check.done("snake-and-ladder");
    }

    static Board board(Map<Integer, Integer> jumps) { return new Board(100, jumps); }
}

class InvalidBoardException extends RuntimeException { InvalidBoardException(String m) { super(m); } }

enum JumpType { NONE, SNAKE, LADDER }
record Player(String name) { }
record TurnResult(Player player, int roll, int from, int to, JumpType jump, boolean won) { }

final class Board {
    private final int size;
    private final Map<Integer, Integer> jumps;          // start → end (snake if end < start, ladder if end > start)

    Board(int size, Map<Integer, Integer> jumps) {
        this.size = size;
        this.jumps = Map.copyOf(jumps);
        validate();
    }

    private void validate() {
        for (var e : jumps.entrySet()) {
            int from = e.getKey(), to = e.getValue();
            if (from <= 0 || from >= size) throw new InvalidBoardException("jump must start strictly between 0 and " + size + ": " + from);
            if (to < 0 || to > size) throw new InvalidBoardException("jump must end on the board: " + to);
            if (from == to) throw new InvalidBoardException("a jump must move: " + from);
        }
        for (int start : jumps.keySet()) {                 // following jumps must never revisit a cell
            Set<Integer> seen = new HashSet<>();
            for (int at = start; jumps.containsKey(at); at = jumps.get(at))
                if (!seen.add(at)) throw new InvalidBoardException("jumps form a loop through " + at);
        }
    }

    /** Where a token ends up after landing on cell p (follows chained jumps). */
    int finalPosition(int p) {
        while (jumps.containsKey(p)) p = jumps.get(p);
        return p;
    }

    int size() { return size; }
}

final class BoardFactory {
    static Board random(Random rnd, int snakes, int ladders) {
        Map<Integer, Integer> jumps = new HashMap<>();
        while (jumps.size() < snakes + ladders) {
            int a = 2 + rnd.nextInt(97), b = 1 + rnd.nextInt(99);
            if (a == b || jumps.containsKey(a) || jumps.containsValue(a) || jumps.containsKey(b)) continue;
            boolean snake = jumps.size() < snakes;
            int from = snake ? Math.max(a, b) : Math.min(a, b), to = snake ? Math.min(a, b) : Math.max(a, b);
            if (from == 100 || from == 0) continue;
            jumps.put(from, to);
        }
        return new Board(100, jumps);
    }
}

interface Dice { int roll(); }

final class RandomDice implements Dice {
    private final Random random; private final int count;
    RandomDice(Random random, int count) { this.random = random; this.count = count; }
    public int roll() { int sum = 0; for (int i = 0; i < count; i++) sum += 1 + random.nextInt(6); return sum; }
}

final class ScriptedDice implements Dice {
    private final Deque<Integer> rolls;
    ScriptedDice(Integer... rolls) { this.rolls = new ArrayDeque<>(List.of(rolls)); }
    public int roll() { return rolls.removeFirst(); }
}

/** What happens when a roll would go past the last cell. */
interface MoveRule { int target(int from, int roll, int size); }

final class ExactFinishRule implements MoveRule {
    public int target(int from, int roll, int size) { return from + roll > size ? from : from + roll; }
}

final class BounceBackRule implements MoveRule {
    public int target(int from, int roll, int size) { int t = from + roll; return t > size ? size - (t - size) : t; }
}

final class Game {
    private final Board board;
    private final List<Player> players;
    private final Dice dice;
    private final MoveRule rule;
    private final Map<Player, Integer> positions = new HashMap<>();
    private final Deque<Player> turnOrder;
    private final List<Player> rankings = new ArrayList<>();

    Game(Board board, List<Player> players, Dice dice, MoveRule rule) {
        if (players.size() < 2) throw new IllegalArgumentException("need at least 2 players");
        if (new HashSet<>(players).size() != players.size()) throw new IllegalArgumentException("player names must be unique");
        this.board = board; this.players = List.copyOf(players); this.dice = dice; this.rule = rule;
        this.turnOrder = new ArrayDeque<>(players);
        players.forEach(p -> positions.put(p, 0));
    }

    TurnResult playTurn() {
        if (isOver()) throw new IllegalStateException("Game is over");
        Player p = turnOrder.pollFirst();
        int from = positions.get(p);
        int roll = dice.roll();
        int landed = rule.target(from, roll, board.size());
        int to = board.finalPosition(landed);
        JumpType jump = to == landed ? JumpType.NONE : to > landed ? JumpType.LADDER : JumpType.SNAKE;
        positions.put(p, to);

        boolean won = to == board.size();
        if (won) rankings.add(p); else turnOrder.addLast(p);
        if (turnOrder.size() == 1) rankings.add(turnOrder.pollFirst());   // last player standing
        return new TurnResult(p, roll, from, to, jump, won);
    }

    boolean isOver() { return turnOrder.isEmpty(); }
    List<Player> rankings() { return List.copyOf(rankings); }
    List<Player> players() { return players; }
    int position(Player p) { return positions.get(p); }
    void place(Player p, int cell) { positions.put(p, cell); }      // for tests and "resume game"
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
