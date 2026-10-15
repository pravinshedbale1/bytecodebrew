// Proves every claim in "Java Toolkit for DSA". Run: java dsa-java/toolkit/Toolkit.java
import java.util.*;

public class Toolkit {
    public static void main(String[] args) {
        Integer a = 127, b = 127, c = 128, d = 128;
        Check.that(a == b, "Integer cache: 127 == 127");
        Check.that(c != d && c.equals(d), "128 == 128 is false; equals is true");
        Check.that(-7 % 3 == -1 && Math.floorMod(-7, 3) == 2 && ((-7 % 3) + 3) % 3 == 2, "negative remainder");
        Check.that(Math.abs(Integer.MIN_VALUE) < 0, "abs(MIN_VALUE) is negative");
        int lo = 2_000_000_000, hi = 2_100_000_000;
        Check.that((lo + hi) / 2 < 0 && lo + (hi - lo) / 2 == 2_050_000_000 && ((lo + hi) >>> 1) == 2_050_000_000, "midpoint overflow");

        // subtracting comparator breaks ordering
        Integer[] vals = { 2_000_000_000, -2_000_000_000, 5 };
        Integer[] bad = vals.clone(); Arrays.sort(bad, (x, y) -> x - y);
        Integer[] good = vals.clone(); Arrays.sort(good, Integer::compare);
        Check.that(!Arrays.equals(bad, good) && good[0] == -2_000_000_000, "subtraction comparator mis-sorts");

        // idioms
        Map<Integer, Integer> freq = new HashMap<>();
        for (int x : new int[] { 1, 2, 2, 3, 3, 3 }) freq.merge(x, 1, Integer::sum);
        Check.that(freq.get(3) == 3 && freq.getOrDefault(9, 0) == 0, "merge counting");
        Map<String, List<String>> groups = new HashMap<>();
        for (String w : List.of("eat", "tea", "tan", "ate", "nat", "bat")) {
            char[] key = w.toCharArray(); Arrays.sort(key);
            groups.computeIfAbsent(new String(key), k -> new ArrayList<>()).add(w);
        }
        Check.that(groups.size() == 3 && groups.get("aet").size() == 3, "anagram grouping");
        TreeMap<Integer, String> events = new TreeMap<>(Map.of(10, "a", 20, "b", 30, "c"));
        Check.that(events.floorKey(25) == 20 && events.ceilingKey(25) == 30 && events.firstKey() == 10 && events.headMap(20).size() == 1, "TreeMap navigation");
        PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Comparator.reverseOrder());
        maxHeap.addAll(List.of(3, 9, 1)); Check.that(maxHeap.peek() == 9, "max-heap");
        Deque<Integer> stack = new ArrayDeque<>(); stack.push(1); stack.push(2);
        Check.that(stack.pop() == 2, "ArrayDeque as stack");
        try { new ArrayDeque<Integer>().push(null); Check.that(false, "null accepted"); } catch (NullPointerException e) { Check.that(true, "ArrayDeque rejects null"); }
        List<Integer> list = new ArrayList<>(List.of(1, 2, 3));
        try { for (Integer x : list) if (x == 1) list.remove(x); Check.that(false, "no CME"); }
        catch (ConcurrentModificationException e) { Check.that(true, "CME when removing during for-each"); }
        List<Integer> quiet = new ArrayList<>(List.of(1, 2, 3)), visited = new ArrayList<>();
        for (Integer x : quiet) { visited.add(x); if (x == 2) quiet.remove(x); }
        Check.that(visited.equals(List.of(1, 2)), "removing the second-to-last element silently skips the last one");
        Check.done("toolkit");
    }
}

final class Check {
    private static int passed;
    static void that(boolean cond, String what) { if (!cond) throw new AssertionError("FAILED: " + what); passed++; }
    static void done(String name) { System.out.println("✓ " + name + ": " + passed + " checks passed"); }
}
