// Pattern: Hash Maps & Sets. Run: java dsa-java/hashing/Hashing.java
import java.util.*;

public class Hashing {
    public static void main(String[] args) {
        var rnd = new Random(2);
        for (int t = 0; t < 3_000; t++) {
            int n = rnd.nextInt(40);
            int[] a = new int[n];
            for (int i = 0; i < n; i++) a[i] = rnd.nextInt(30) - 10;
            // contains duplicate
            boolean dupBrute = false;
            for (int i = 0; i < n; i++) for (int j = i + 1; j < n; j++) if (a[i] == a[j]) dupBrute = true;
            Check.that(containsDuplicate(a) == dupBrute, "containsDuplicate");
            // longest consecutive vs sorting
            Check.that(longestConsecutive(a) == longestConsecutiveBySorting(a), "longestConsecutive");
            // anagram
            String s1 = randomWord(rnd, 8), s2 = rnd.nextBoolean() ? shuffle(s1, rnd) : randomWord(rnd, 8);
            char[] x = s1.toCharArray(), y = s2.toCharArray(); Arrays.sort(x); Arrays.sort(y);
            Check.that(isAnagram(s1, s2) == Arrays.equals(x, y), "isAnagram");
            // first unique
            String w = randomWord(rnd, 12);
            int expect = -1;
            for (int i = 0; i < w.length() && expect < 0; i++) if (w.indexOf(w.charAt(i)) == w.lastIndexOf(w.charAt(i))) expect = i;
            Check.that(firstUniqChar(w) == expect, "firstUniqChar");
        }
        // group anagrams
        List<List<String>> g = groupAnagrams(new String[] { "eat", "tea", "tan", "ate", "nat", "bat" });
        Set<Set<String>> groups = new HashSet<>();
        for (List<String> l : g) groups.add(new HashSet<>(l));
        Check.that(groups.equals(Set.of(Set.of("eat", "tea", "ate"), Set.of("tan", "nat"), Set.of("bat"))), "groupAnagrams");
        for (int t = 0; t < 1_000; t++) {
            String[] words = new String[rnd.nextInt(15)];
            for (int i = 0; i < words.length; i++) words[i] = randomWord(rnd, 4);
            Check.that(normalise(groupAnagrams(words)).equals(normalise(groupAnagramsSorted(words))), "count key = sorted key grouping");
        }
        Check.done("hashing");
    }

    static boolean containsDuplicate(int[] nums) {
        Set<Integer> seen = new HashSet<>();
        for (int x : nums) if (!seen.add(x)) return true;      // add returns false if already present
        return false;
    }

    static boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) return false;
        int[] count = new int[26];
        for (int i = 0; i < s.length(); i++) {
            count[s.charAt(i) - 'a']++;
            count[t.charAt(i) - 'a']--;
        }
        for (int c : count) if (c != 0) return false;
        return true;
    }

    static int firstUniqChar(String s) {
        int[] count = new int[26];
        for (char c : s.toCharArray()) count[c - 'a']++;
        for (int i = 0; i < s.length(); i++) if (count[s.charAt(i) - 'a'] == 1) return i;
        return -1;
    }

    /** Key = letter counts, so each word costs O(k) instead of O(k log k) for sorting. */
    static List<List<String>> groupAnagrams(String[] words) {
        Map<String, List<String>> groups = new HashMap<>();
        for (String w : words) {
            int[] count = new int[26];
            for (char c : w.toCharArray()) count[c - 'a']++;
            String key = Arrays.toString(count);                // e.g. "[1, 0, 0, …]"
            groups.computeIfAbsent(key, k -> new ArrayList<>()).add(w);
        }
        return new ArrayList<>(groups.values());
    }

    static List<List<String>> groupAnagramsSorted(String[] words) {
        Map<String, List<String>> groups = new HashMap<>();
        for (String w : words) {
            char[] key = w.toCharArray(); Arrays.sort(key);
            groups.computeIfAbsent(new String(key), k -> new ArrayList<>()).add(w);
        }
        return new ArrayList<>(groups.values());
    }

    /** O(n): only start counting at numbers that begin a run (x − 1 not present). */
    static int longestConsecutive(int[] nums) {
        Set<Integer> set = new HashSet<>();
        for (int x : nums) set.add(x);
        int best = 0;
        for (int x : set) {
            if (set.contains(x - 1)) continue;                 // not the start of a run
            int len = 1;
            while (set.contains(x + len)) len++;
            best = Math.max(best, len);
        }
        return best;
    }

    static int longestConsecutiveBySorting(int[] nums) {
        int[] a = nums.clone(); Arrays.sort(a);
        int best = a.length == 0 ? 0 : 1, run = 1;
        for (int i = 1; i < a.length; i++) {
            if (a[i] == a[i - 1]) continue;
            run = a[i] == a[i - 1] + 1 ? run + 1 : 1;
            best = Math.max(best, run);
        }
        return best;
    }

    static Set<Set<String>> normalise(List<List<String>> g) {
        Set<Set<String>> out = new HashSet<>();
        for (List<String> l : g) { List<String> c = new ArrayList<>(l); Collections.sort(c); out.add(new HashSet<>(List.of(String.join(",", c)))); }
        return out;
    }
    static String randomWord(Random r, int max) { StringBuilder sb = new StringBuilder(); int n = 1 + r.nextInt(max); for (int i = 0; i < n; i++) sb.append((char) ('a' + r.nextInt(4))); return sb.toString(); }
    static String shuffle(String s, Random r) { List<Character> cs = new ArrayList<>(); for (char c : s.toCharArray()) cs.add(c); Collections.shuffle(cs, r); StringBuilder sb = new StringBuilder(); cs.forEach(sb::append); return sb.toString(); }
}

final class Check {
    private static int passed;
    static void that(boolean cond, String what) { if (!cond) throw new AssertionError("FAILED: " + what); passed++; }
    static void done(String name) { System.out.println("✓ " + name + ": " + passed + " checks passed"); }
}
