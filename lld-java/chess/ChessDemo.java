// Design Chess — runnable reference solution for the lesson.
// Run: java lld-java/chess/ChessDemo.java
// Move generation is verified with perft: counting all legal move sequences to a fixed depth
// from well-known test positions and comparing with published totals.
import java.util.*;

public class ChessDemo {
    public static void main(String[] args) {
        var validator = new MoveValidator();

        // perft — published node counts (Chess Programming Wiki, "Perft Results")
        perft(validator, Board.fromFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -"), new long[]{20, 400, 8_902, 197_281}, "start position");
        perft(validator, Board.fromFen("r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq -"), new long[]{48, 2_039, 97_862}, "Kiwipete (castling, en passant, promotions)");
        perft(validator, Board.fromFen("8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - -"), new long[]{14, 191, 2_812, 43_238}, "position 3 (en passant pins)");
        perft(validator, Board.fromFen("r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq -"), new long[]{6, 264, 9_467}, "position 4 (promotions, checks)");
        perft(validator, Board.fromFen("rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ -"), new long[]{44, 1_486, 62_379}, "position 5");

        // Game flow: fool's mate is checkmate
        var game = new Game(Board.standard(), validator);
        game.makeMove(sq("f2"), sq("f3"), null);
        game.makeMove(sq("e7"), sq("e5"), null);
        game.makeMove(sq("g2"), sq("g4"), null);
        MoveResult mate = game.makeMove(sq("d8"), sq("h4"), null);
        Check.that(mate.status() == GameStatus.BLACK_WON, "fool's mate → black wins");
        Check.throwsEx(IllegalStateException.class, () -> game.makeMove(sq("a2"), sq("a3"), null), "no moves after mate");

        // Illegal moves: wrong turn, through pieces, exposing the king
        var g2 = new Game(Board.standard(), validator);
        Check.throwsEx(IllegalMoveException.class, () -> g2.makeMove(sq("e7"), sq("e5"), null), "black can't move first");
        Check.throwsEx(IllegalMoveException.class, () -> g2.makeMove(sq("a1"), sq("a3"), null), "rook can't jump the pawn");
        var pinned = new Game(Board.fromFen("4k3/8/8/8/4r3/8/4B3/4K3 w - -"), validator);
        Check.throwsEx(IllegalMoveException.class, () -> pinned.makeMove(sq("e2"), sq("d3"), null), "pinned bishop can't move");

        // Stalemate
        var stale = new Game(Board.fromFen("7k/8/6Q1/8/8/8/8/K7 w - -"), validator);
        Check.that(stale.makeMove(sq("g6"), sq("f7"), null).status() == GameStatus.STALEMATE, "Qf7 stalemates the lone king");

        // Castling, en passant, promotion and undo through the Game API
        var g3 = new Game(Board.fromFen("r3k2r/8/8/3pP3/8/8/1p6/R3K2R w KQkq d6"), validator);
        g3.makeMove(sq("e5"), sq("d6"), null);                       // en passant
        Check.that(g3.board().pieceAt(sq("d5")).isEmpty(), "en passant removed the d5 pawn");
        g3.makeMove(sq("b2"), sq("a1"), PieceType.KNIGHT);           // capture-promote to a knight
        Check.that(g3.board().pieceAt(sq("a1")).map(Piece::type).orElse(null) == PieceType.KNIGHT, "under-promotion");
        g3.makeMove(sq("e1"), sq("g1"), null);                       // castle kingside
        Check.that(g3.board().pieceAt(sq("f1")).map(Piece::type).orElse(null) == PieceType.ROOK, "rook moved to f1");
        g3.undo(); g3.undo(); g3.undo();
        Check.that(g3.board().toFen().equals("r3k2r/8/8/3pP3/8/8/1p6/R3K2R w KQkq d6"), "three undos restore the exact position");

        // Black lost queenside castling rights when its a8 rook was captured
        var g4 = new Game(Board.fromFen("r3k2r/8/8/8/8/8/8/R3K2R w KQkq -"), validator);
        g4.makeMove(sq("a1"), sq("a8"), null);
        Check.that(g4.legalMoveStrings().stream().noneMatch(m -> m.equals("e8c8")), "no castling with a captured rook");

        Check.done("chess");
    }

    static void perft(MoveValidator v, Board board, long[] expected, String name) {
        for (int depth = 1; depth <= expected.length; depth++) {
            long nodes = count(v, board, depth);
            Check.that(nodes == expected[depth - 1], name + " depth " + depth + ": got " + nodes + ", want " + expected[depth - 1]);
        }
    }

    static long count(MoveValidator v, Board b, int depth) {
        List<Move> moves = v.legalMoves(b, b.sideToMove());
        if (depth == 1) return moves.size();
        long n = 0;
        for (Move m : moves) { b.apply(m); n += count(v, b, depth - 1); b.revert(m); }
        return n;
    }

    static Position sq(String s) { return new Position(s.charAt(0) - 'a', s.charAt(1) - '1'); }
}

// ---------- core types ----------
enum Color { WHITE, BLACK; Color opposite() { return this == WHITE ? BLACK : WHITE; } }
enum PieceType { KING, QUEEN, ROOK, BISHOP, KNIGHT, PAWN }
enum MoveType { NORMAL, CAPTURE, DOUBLE_PAWN_PUSH, CASTLE_KINGSIDE, CASTLE_QUEENSIDE, EN_PASSANT, PROMOTION }
enum GameStatus {
    ACTIVE, CHECK, WHITE_WON, BLACK_WON, STALEMATE;
    boolean isOver() { return this == WHITE_WON || this == BLACK_WON || this == STALEMATE; }
}

record Position(int file, int rank) {                 // file a–h = 0–7, rank 1–8 = 0–7
    boolean isValid() { return file >= 0 && file < 8 && rank >= 0 && rank < 8; }
    Position offset(int df, int dr) { return new Position(file + df, rank + dr); }
    @Override public String toString() { return "" + (char) ('a' + file) + (rank + 1); }
}

/** A move with everything needed to apply it; the board records what it needs to revert it. */
record Move(Position from, Position to, Piece moved, Piece captured, MoveType type, PieceType promotion) {
    static Move normal(Position f, Position t, Piece p) { return new Move(f, t, p, null, MoveType.NORMAL, null); }
    static Move capture(Position f, Position t, Piece p, Piece c) { return new Move(f, t, p, c, MoveType.CAPTURE, null); }
    @Override public String toString() { return from + "" + to + (promotion == null ? "" : promotion.name().substring(0, 1).toLowerCase()); }
}

record MoveResult(Move move, GameStatus status) { }
class IllegalMoveException extends RuntimeException { IllegalMoveException(Position f, Position t) { super("Illegal move " + f + t); } }

// ---------- pieces ----------
abstract class Piece {
    private final Color color;
    private boolean hasMoved;
    protected Piece(Color color) { this.color = color; }

    abstract PieceType type();
    abstract List<Move> pseudoLegalMoves(Board board, Position from);

    /** Default: a piece attacks a square if it has a pseudo-legal move there. Pawns and sliders override. */
    boolean attacks(Board board, Position from, Position target) {
        return pseudoLegalMoves(board, from).stream().anyMatch(m -> m.to().equals(target));
    }

    Color color() { return color; }
    boolean hasMoved() { return hasMoved; }
    void setMoved(boolean moved) { this.hasMoved = moved; }
}

abstract class SlidingPiece extends Piece {
    protected SlidingPiece(Color c) { super(c); }
    protected abstract int[][] directions();

    @Override List<Move> pseudoLegalMoves(Board board, Position from) {
        List<Move> moves = new ArrayList<>();
        for (int[] d : directions()) {
            for (Position p = from.offset(d[0], d[1]); p.isValid(); p = p.offset(d[0], d[1])) {
                Optional<Piece> occupant = board.pieceAt(p);
                if (occupant.isEmpty()) { moves.add(Move.normal(from, p, this)); continue; }
                if (occupant.get().color() != color()) moves.add(Move.capture(from, p, this, occupant.get()));
                break;                                       // blocked either way
            }
        }
        return moves;
    }

    @Override boolean attacks(Board board, Position from, Position target) {   // walk one ray instead of generating all moves
        for (int[] d : directions()) {
            for (Position p = from.offset(d[0], d[1]); p.isValid(); p = p.offset(d[0], d[1])) {
                if (p.equals(target)) return true;
                if (board.pieceAt(p).isPresent()) break;
            }
        }
        return false;
    }
}

final class Rook extends SlidingPiece {
    private static final int[][] DIRS = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    Rook(Color c) { super(c); }
    protected int[][] directions() { return DIRS; }
    PieceType type() { return PieceType.ROOK; }
}

final class Bishop extends SlidingPiece {
    private static final int[][] DIRS = {{1, 1}, {1, -1}, {-1, 1}, {-1, -1}};
    Bishop(Color c) { super(c); }
    protected int[][] directions() { return DIRS; }
    PieceType type() { return PieceType.BISHOP; }
}

final class Queen extends SlidingPiece {
    private static final int[][] DIRS = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}, {1, 1}, {1, -1}, {-1, 1}, {-1, -1}};
    Queen(Color c) { super(c); }
    protected int[][] directions() { return DIRS; }
    PieceType type() { return PieceType.QUEEN; }
}

abstract class StepPiece extends Piece {
    protected StepPiece(Color c) { super(c); }
    protected abstract int[][] offsets();
    @Override List<Move> pseudoLegalMoves(Board board, Position from) {
        List<Move> moves = new ArrayList<>();
        for (int[] o : offsets()) {
            Position p = from.offset(o[0], o[1]);
            if (!p.isValid()) continue;
            Optional<Piece> occ = board.pieceAt(p);
            if (occ.isEmpty()) moves.add(Move.normal(from, p, this));
            else if (occ.get().color() != color()) moves.add(Move.capture(from, p, this, occ.get()));
        }
        return moves;
    }
    @Override boolean attacks(Board board, Position from, Position target) {
        for (int[] o : offsets()) if (from.offset(o[0], o[1]).equals(target)) return true;
        return false;
    }
}

final class Knight extends StepPiece {
    private static final int[][] OFFS = {{1, 2}, {2, 1}, {2, -1}, {1, -2}, {-1, -2}, {-2, -1}, {-2, 1}, {-1, 2}};
    Knight(Color c) { super(c); }
    protected int[][] offsets() { return OFFS; }
    PieceType type() { return PieceType.KNIGHT; }
}

/** Ordinary king steps only; castling is a special move generated by the validator. */
final class King extends StepPiece {
    private static final int[][] OFFS = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}, {1, 1}, {1, -1}, {-1, 1}, {-1, -1}};
    King(Color c) { super(c); }
    protected int[][] offsets() { return OFFS; }
    PieceType type() { return PieceType.KING; }
}

final class Pawn extends Piece {
    Pawn(Color c) { super(c); }
    PieceType type() { return PieceType.PAWN; }
    int forward() { return color() == Color.WHITE ? 1 : -1; }
    int startRank() { return color() == Color.WHITE ? 1 : 6; }
    int lastRank() { return color() == Color.WHITE ? 7 : 0; }

    @Override List<Move> pseudoLegalMoves(Board board, Position from) {
        List<Move> moves = new ArrayList<>();
        Position one = from.offset(0, forward());
        if (one.isValid() && board.pieceAt(one).isEmpty()) {
            addMaybePromotion(moves, from, one, null);
            Position two = from.offset(0, 2 * forward());
            if (from.rank() == startRank() && board.pieceAt(two).isEmpty())
                moves.add(new Move(from, two, this, null, MoveType.DOUBLE_PAWN_PUSH, null));
        }
        for (int df : new int[]{-1, 1}) {
            Position diag = from.offset(df, forward());
            if (!diag.isValid()) continue;
            board.pieceAt(diag).filter(p -> p.color() != color()).ifPresent(p -> addMaybePromotion(moves, from, diag, p));
        }
        return moves;                                         // en passant is generated by the validator
    }

    private void addMaybePromotion(List<Move> moves, Position from, Position to, Piece captured) {
        if (to.rank() == lastRank()) {
            for (PieceType t : List.of(PieceType.QUEEN, PieceType.ROOK, PieceType.BISHOP, PieceType.KNIGHT))
                moves.add(new Move(from, to, this, captured, MoveType.PROMOTION, t));
        } else {
            moves.add(captured == null ? Move.normal(from, to, this) : Move.capture(from, to, this, captured));
        }
    }

    /** Pawns attack diagonally only — they don't capture forward. */
    @Override boolean attacks(Board board, Position from, Position target) {
        return target.rank() == from.rank() + forward() && Math.abs(target.file() - from.file()) == 1;
    }
}

final class PieceFactory {
    static Piece create(PieceType type, Color color) {
        return switch (type) {
            case KING -> new King(color);
            case QUEEN -> new Queen(color);
            case ROOK -> new Rook(color);
            case BISHOP -> new Bishop(color);
            case KNIGHT -> new Knight(color);
            case PAWN -> new Pawn(color);
        };
    }
}

// ---------- board ----------
final class Board {
    private final Piece[][] squares = new Piece[8][8];
    private Color sideToMove = Color.WHITE;
    private Position enPassantTarget;                         // square skipped by the last double pawn push
    private final Deque<Undo> undo = new ArrayDeque<>();

    private record Undo(Position prevEnPassant, boolean movedBefore, boolean rookMovedBefore, Piece promotedTo) { }

    Optional<Piece> pieceAt(Position p) { return Optional.ofNullable(squares[p.file()][p.rank()]); }
    void put(Position p, Piece piece) { squares[p.file()][p.rank()] = piece; }
    Color sideToMove() { return sideToMove; }
    Position enPassantTarget() { return enPassantTarget; }

    List<Position> positionsOf(Color c) {
        List<Position> out = new ArrayList<>();
        for (int f = 0; f < 8; f++) for (int r = 0; r < 8; r++)
            if (squares[f][r] != null && squares[f][r].color() == c) out.add(new Position(f, r));
        return out;
    }

    Position kingPosition(Color c) {
        for (int f = 0; f < 8; f++) for (int r = 0; r < 8; r++) {
            Piece p = squares[f][r];
            if (p != null && p.color() == c && p.type() == PieceType.KING) return new Position(f, r);
        }
        throw new IllegalStateException("No " + c + " king");
    }

    boolean isAttacked(Position target, Color by) {
        for (int f = 0; f < 8; f++) for (int r = 0; r < 8; r++) {
            Piece p = squares[f][r];
            if (p != null && p.color() == by && p.attacks(this, new Position(f, r), target)) return true;
        }
        return false;
    }

    void apply(Move m) {
        Piece piece = m.moved();
        Piece rook = null;
        Position rookFrom = null, rookTo = null;
        if (m.type() == MoveType.CASTLE_KINGSIDE || m.type() == MoveType.CASTLE_QUEENSIDE) {
            boolean king = m.type() == MoveType.CASTLE_KINGSIDE;
            rookFrom = new Position(king ? 7 : 0, m.from().rank());
            rookTo = new Position(king ? 5 : 3, m.from().rank());
            rook = pieceAt(rookFrom).orElseThrow();
        }
        Piece promoted = m.type() == MoveType.PROMOTION ? PieceFactory.create(m.promotion(), piece.color()) : null;
        undo.push(new Undo(enPassantTarget, piece.hasMoved(), rook != null && rook.hasMoved(), promoted));

        put(m.from(), null);
        if (m.type() == MoveType.EN_PASSANT) put(new Position(m.to().file(), m.from().rank()), null);
        if (promoted != null) { promoted.setMoved(true); put(m.to(), promoted); } else put(m.to(), piece);
        piece.setMoved(true);
        if (rook != null) { put(rookFrom, null); put(rookTo, rook); rook.setMoved(true); }

        enPassantTarget = m.type() == MoveType.DOUBLE_PAWN_PUSH
                ? new Position(m.from().file(), (m.from().rank() + m.to().rank()) / 2) : null;
        sideToMove = sideToMove.opposite();
    }

    void revert(Move m) {
        Undo u = undo.pop();
        sideToMove = sideToMove.opposite();
        enPassantTarget = u.prevEnPassant();
        Piece piece = m.moved();
        piece.setMoved(u.movedBefore());
        put(m.from(), piece);
        if (m.type() == MoveType.EN_PASSANT) {
            put(m.to(), null);
            put(new Position(m.to().file(), m.from().rank()), m.captured());
        } else {
            put(m.to(), m.captured());                       // null for a quiet move
        }
        if (m.type() == MoveType.CASTLE_KINGSIDE || m.type() == MoveType.CASTLE_QUEENSIDE) {
            boolean king = m.type() == MoveType.CASTLE_KINGSIDE;
            Position rookFrom = new Position(king ? 7 : 0, m.from().rank());
            Position rookTo = new Position(king ? 5 : 3, m.from().rank());
            Piece rook = pieceAt(rookTo).orElseThrow();
            put(rookTo, null); put(rookFrom, rook);
            rook.setMoved(u.rookMovedBefore());
        }
    }

    static Board standard() { return fromFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -"); }

    /** Forsyth–Edwards Notation: placement, side to move, castling rights, en-passant square. */
    static Board fromFen(String fen) {
        String[] parts = fen.split(" ");
        Board b = new Board();
        String[] rows = parts[0].split("/");
        for (int i = 0; i < 8; i++) {
            int rank = 7 - i, file = 0;
            for (char ch : rows[i].toCharArray()) {
                if (Character.isDigit(ch)) { file += ch - '0'; continue; }
                Color c = Character.isUpperCase(ch) ? Color.WHITE : Color.BLACK;
                PieceType t = switch (Character.toLowerCase(ch)) {
                    case 'k' -> PieceType.KING; case 'q' -> PieceType.QUEEN; case 'r' -> PieceType.ROOK;
                    case 'b' -> PieceType.BISHOP; case 'n' -> PieceType.KNIGHT; default -> PieceType.PAWN;
                };
                Piece p = PieceFactory.create(t, c);
                p.setMoved(true);                             // assume moved; castling rights below clear the flags
                b.put(new Position(file++, rank), p);
            }
        }
        b.sideToMove = parts[1].equals("w") ? Color.WHITE : Color.BLACK;
        String rights = parts.length > 2 ? parts[2] : "-";
        b.grantCastling(rights, 'K', Color.WHITE, 0, 7);
        b.grantCastling(rights, 'Q', Color.WHITE, 0, 0);
        b.grantCastling(rights, 'k', Color.BLACK, 7, 7);
        b.grantCastling(rights, 'q', Color.BLACK, 7, 0);
        if (parts.length > 3 && !parts[3].equals("-")) b.enPassantTarget = new Position(parts[3].charAt(0) - 'a', parts[3].charAt(1) - '1');
        return b;
    }

    private void grantCastling(String rights, char flag, Color c, int rank, int rookFile) {
        if (rights.indexOf(flag) < 0) return;
        pieceAt(new Position(4, rank)).filter(p -> p.type() == PieceType.KING && p.color() == c).ifPresent(k -> k.setMoved(false));
        pieceAt(new Position(rookFile, rank)).filter(p -> p.type() == PieceType.ROOK && p.color() == c).ifPresent(r -> r.setMoved(false));
    }

    String toFen() {
        StringBuilder sb = new StringBuilder();
        for (int rank = 7; rank >= 0; rank--) {
            int empty = 0;
            for (int file = 0; file < 8; file++) {
                Piece p = squares[file][rank];
                if (p == null) { empty++; continue; }
                if (empty > 0) { sb.append(empty); empty = 0; }
                char ch = switch (p.type()) { case KING -> 'k'; case QUEEN -> 'q'; case ROOK -> 'r'; case BISHOP -> 'b'; case KNIGHT -> 'n'; case PAWN -> 'p'; };
                sb.append(p.color() == Color.WHITE ? Character.toUpperCase(ch) : ch);
            }
            if (empty > 0) sb.append(empty);
            if (rank > 0) sb.append('/');
        }
        sb.append(sideToMove == Color.WHITE ? " w " : " b ");
        StringBuilder rights = new StringBuilder();
        if (canStillCastle(Color.WHITE, 0, 7)) rights.append('K');
        if (canStillCastle(Color.WHITE, 0, 0)) rights.append('Q');
        if (canStillCastle(Color.BLACK, 7, 7)) rights.append('k');
        if (canStillCastle(Color.BLACK, 7, 0)) rights.append('q');
        sb.append(rights.isEmpty() ? "-" : rights).append(' ').append(enPassantTarget == null ? "-" : enPassantTarget.toString());
        return sb.toString();
    }

    private boolean canStillCastle(Color c, int rank, int rookFile) {
        Optional<Piece> k = pieceAt(new Position(4, rank)), r = pieceAt(new Position(rookFile, rank));
        return k.isPresent() && k.get().type() == PieceType.KING && k.get().color() == c && !k.get().hasMoved()
            && r.isPresent() && r.get().type() == PieceType.ROOK && r.get().color() == c && !r.get().hasMoved();
    }
}

// ---------- legality ----------
final class MoveValidator {
    List<Move> legalMoves(Board board, Color side) {
        List<Move> legal = new ArrayList<>();
        for (Position from : board.positionsOf(side)) {
            Piece piece = board.pieceAt(from).orElseThrow();
            List<Move> candidates = new ArrayList<>(piece.pseudoLegalMoves(board, from));
            candidates.addAll(specialMoves(board, from, piece));   // castling, en passant
            for (Move m : candidates) if (isLegal(board, m, side)) legal.add(m);
        }
        return legal;
    }

    boolean isLegal(Board board, Move m, Color side) {
        board.apply(m);                                      // make the move…
        boolean kingSafe = !board.isAttacked(board.kingPosition(side), side.opposite());
        board.revert(m);                                     // …then undo it
        return kingSafe;
    }

    private List<Move> specialMoves(Board board, Position from, Piece piece) {
        List<Move> out = new ArrayList<>();
        if (piece instanceof Pawn pawn && board.enPassantTarget() != null) {
            Position ep = board.enPassantTarget();
            if (ep.rank() == from.rank() + pawn.forward() && Math.abs(ep.file() - from.file()) == 1) {
                Piece victim = board.pieceAt(new Position(ep.file(), from.rank())).orElseThrow();
                out.add(new Move(from, ep, pawn, victim, MoveType.EN_PASSANT, null));
            }
        }
        if (piece instanceof King king && !king.hasMoved() && from.file() == 4) {
            Color enemy = king.color().opposite();
            if (!board.isAttacked(from, enemy)) {                       // can't castle out of check
                if (rookReady(board, new Position(7, from.rank()), king.color())
                        && empty(board, from.rank(), 5, 6)
                        && !board.isAttacked(new Position(5, from.rank()), enemy))   // can't pass through attack
                    out.add(new Move(from, new Position(6, from.rank()), king, null, MoveType.CASTLE_KINGSIDE, null));
                if (rookReady(board, new Position(0, from.rank()), king.color())
                        && empty(board, from.rank(), 1, 3)
                        && !board.isAttacked(new Position(3, from.rank()), enemy))
                    out.add(new Move(from, new Position(2, from.rank()), king, null, MoveType.CASTLE_QUEENSIDE, null));
            }                                                           // landing square checked by isLegal
        }
        return out;
    }

    private boolean rookReady(Board b, Position p, Color c) {
        return b.pieceAt(p).filter(r -> r.type() == PieceType.ROOK && r.color() == c && !r.hasMoved()).isPresent();
    }
    private boolean empty(Board b, int rank, int fromFile, int toFile) {
        for (int f = fromFile; f <= toFile; f++) if (b.pieceAt(new Position(f, rank)).isPresent()) return false;
        return true;
    }
}

// ---------- game ----------
final class Game {
    private final Board board;
    private final MoveValidator validator;
    private final Deque<Move> history = new ArrayDeque<>();
    private GameStatus status = GameStatus.ACTIVE;

    Game(Board board, MoveValidator validator) { this.board = board; this.validator = validator; }

    MoveResult makeMove(Position from, Position to, PieceType promotion) {
        if (status.isOver()) throw new IllegalStateException("Game over: " + status);
        Move move = validator.legalMoves(board, board.sideToMove()).stream()
                .filter(m -> m.from().equals(from) && m.to().equals(to)
                          && (m.promotion() == null || m.promotion() == (promotion == null ? PieceType.QUEEN : promotion)))
                .findFirst()
                .orElseThrow(() -> new IllegalMoveException(from, to));

        board.apply(move);
        history.push(move);
        status = computeStatus();
        return new MoveResult(move, status);
    }

    void undo() {
        Move last = history.pop();
        board.revert(last);
        status = computeStatus();
    }

    private GameStatus computeStatus() {
        Color turn = board.sideToMove();
        boolean inCheck = board.isAttacked(board.kingPosition(turn), turn.opposite());
        boolean hasMoves = !validator.legalMoves(board, turn).isEmpty();
        if (hasMoves) return inCheck ? GameStatus.CHECK : GameStatus.ACTIVE;
        if (!inCheck) return GameStatus.STALEMATE;
        return turn == Color.WHITE ? GameStatus.BLACK_WON : GameStatus.WHITE_WON;
    }

    List<String> legalMoveStrings() { return validator.legalMoves(board, board.sideToMove()).stream().map(Move::toString).toList(); }
    Board board() { return board; }
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
