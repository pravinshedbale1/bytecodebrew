// Pattern: String Matching — KMP & Rolling Hash. Run: java dsa-java/string-matching/StringMatching.java
import java.util.*;

public class StringMatching {
    public static void main(String[] args) {
        var rnd = new Random(11);
        for (int t = 0; t < 20_000; t++) {
            String text = randomString(rnd, rnd.nextInt(30), 2 + rnd.nextInt(2));
            String pat = randomString(rnd, 1 + rnd.nextInt(5), 2 + rnd.nextInt(2));
            List<Integer> exp = findAllBrute(text, pat);
            Check.that(kmpSearch(text, pat).equals(exp), "KMP search");
            Check.that(rabinKarp(text, pat).equals(exp), "Rabin-Karp");
            Check.that(strStr(text, pat) == text.indexOf(pat), "strStr");
            int[] lps = prefixFunction(pat);
            for (int i = 0; i < pat.length(); i++) Check.that(lps[i] == lpsBrute(pat.substring(0, i + 1)), "prefix function");
            Check.that(repeatedSubstringPattern(text) == repeatedBrute(text) || text.isEmpty(), "repeated pattern");
            String s = randomString(rnd, rnd.nextInt(12), 2);
            String sp = shortestPalindrome(s);
            Check.that(sp.equals(shortestPalindromeBrute(s)), "shortest palindrome");
        }
        for (int t = 0; t < 3_000; t++) {
            String s = randomString(rnd, 2 + rnd.nextInt(40), 2 + rnd.nextInt(3));
            String got = longestDupSubstring(s), exp = longestDupBrute(s);
            Check.that(got.length() == exp.length() && (got.isEmpty() || s.indexOf(got) != s.lastIndexOf(got)), "longest duplicate substring");
        }
        Check.done("string-matching");
    }

    /**
     * lps[i] = length of the longest proper prefix of p[0..i] that is also a suffix of it.
     * Built with the same "fall back on mismatch" step that the search uses.
     */
    static int[] prefixFunction(String p) {
        int[] lps = new int[p.length()];
        for (int i = 1, len = 0; i < p.length(); i++) {
            while (len > 0 && p.charAt(i) != p.charAt(len)) len = lps[len - 1];   // fall back to a shorter border
            if (p.charAt(i) == p.charAt(len)) len++;
            lps[i] = len;
        }
        return lps;
    }

    /** All start indexes of pat in text, in O(n + m). The text pointer never moves backwards. */
    static List<Integer> kmpSearch(String text, String pat) {
        List<Integer> out = new ArrayList<>();
        int[] lps = prefixFunction(pat);
        for (int i = 0, j = 0; i < text.length(); i++) {          // j = characters of pat matched so far
            while (j > 0 && text.charAt(i) != pat.charAt(j)) j = lps[j - 1];
            if (text.charAt(i) == pat.charAt(j)) j++;
            if (j == pat.length()) {
                out.add(i - j + 1);
                j = lps[j - 1];                                    // keep going: matches may overlap
            }
        }
        return out;
    }

    static int strStr(String haystack, String needle) {
        if (needle.isEmpty()) return 0;
        List<Integer> all = kmpSearch(haystack, needle);
        return all.isEmpty() ? -1 : all.get(0);
    }

    /** s is some block repeated ≥ 2 times iff its longest border leaves a period that divides n. */
    static boolean repeatedSubstringPattern(String s) {
        int n = s.length();
        if (n == 0) return false;
        int border = prefixFunction(s)[n - 1];
        int period = n - border;
        return border > 0 && n % period == 0;
    }

    /** Add the fewest characters in front to make a palindrome: the longest palindromic prefix via KMP. */
    static String shortestPalindrome(String s) {
        String rev = new StringBuilder(s).reverse().toString();
        int[] lps = prefixFunction(s + "#" + rev);                 // # stops borders crossing the middle
        int keep = lps[lps.length - 1];                            // longest prefix of s that is a palindrome
        return rev.substring(0, s.length() - keep) + s;
    }

    // ---- Rabin–Karp
    static final long MOD = 1_000_000_007L, BASE = 131;

    /** Rolling hash of each window; compare characters only when the hashes agree. */
    static List<Integer> rabinKarp(String text, String pat) {
        List<Integer> out = new ArrayList<>();
        int n = text.length(), m = pat.length();
        if (m > n) return out;
        long target = 0, h = 0, power = 1;                         // power = BASE^(m−1)
        for (int i = 0; i < m; i++) {
            target = (target * BASE + pat.charAt(i)) % MOD;
            h = (h * BASE + text.charAt(i)) % MOD;
            if (i > 0) power = power * BASE % MOD;
        }
        for (int i = 0; ; i++) {
            if (h == target && text.regionMatches(i, pat, 0, m)) out.add(i);   // verify: hashes can collide
            if (i + m == n) break;
            h = (h - text.charAt(i) * power % MOD + MOD) % MOD;     // drop the leftmost character
            h = (h * BASE + text.charAt(i + m)) % MOD;              // shift and add the new one
        }
        return out;
    }

    /** Longest substring that occurs at least twice: binary search on the length, rolling hash to check. */
    static String longestDupSubstring(String s) {
        int lo = 1, hi = s.length() - 1, bestStart = -1, bestLen = 0;
        while (lo <= hi) {
            int len = lo + (hi - lo) / 2;
            int start = repeatedStart(s, len);
            if (start >= 0) { bestStart = start; bestLen = len; lo = len + 1; }   // works: try longer
            else hi = len - 1;
        }
        return bestStart < 0 ? "" : s.substring(bestStart, bestStart + bestLen);
    }

    /** Start of a length-len substring seen twice, or −1. Equal hashes are verified character by character. */
    static int repeatedStart(String s, int len) {
        long h = 0, power = 1;
        for (int i = 0; i < len; i++) {
            h = (h * BASE + s.charAt(i)) % MOD;
            if (i > 0) power = power * BASE % MOD;
        }
        Map<Long, List<Integer>> seen = new HashMap<>();
        seen.computeIfAbsent(h, k -> new ArrayList<>()).add(0);
        for (int i = 1; i + len <= s.length(); i++) {
            h = (h - s.charAt(i - 1) * power % MOD + MOD) % MOD;
            h = (h * BASE + s.charAt(i + len - 1)) % MOD;
            List<Integer> same = seen.computeIfAbsent(h, k -> new ArrayList<>());
            for (int j : same) if (s.regionMatches(i, s, j, len)) return i;
            same.add(i);
        }
        return -1;
    }

    // ---- brute forces
    static List<Integer> findAllBrute(String t, String p) {
        List<Integer> out = new ArrayList<>();
        for (int i = 0; i + p.length() <= t.length(); i++) if (t.startsWith(p, i)) out.add(i);
        return out;
    }

    static int lpsBrute(String s) {
        for (int k = s.length() - 1; k > 0; k--) if (s.substring(0, k).equals(s.substring(s.length() - k))) return k;
        return 0;
    }

    static boolean repeatedBrute(String s) {
        for (int k = 1; k <= s.length() / 2; k++)
            if (s.length() % k == 0 && s.substring(0, k).repeat(s.length() / k).equals(s)) return true;
        return false;
    }

    static String shortestPalindromeBrute(String s) {
        for (int k = s.length(); k >= 0; k--) {
            String pre = s.substring(0, k);
            if (new StringBuilder(pre).reverse().toString().equals(pre))
                return new StringBuilder(s.substring(k)).reverse() + s;
        }
        return s;
    }

    static String longestDupBrute(String s) {
        String best = "";
        for (int i = 0; i < s.length(); i++)
            for (int j = i + 1; j <= s.length(); j++) {
                String sub = s.substring(i, j);
                if (sub.length() > best.length() && s.indexOf(sub, i + 1) >= 0) best = sub;
            }
        return best;
    }

    static String randomString(Random rnd, int n, int alphabet) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) sb.append((char) ('a' + rnd.nextInt(alphabet)));
        return sb.toString();
    }
}

final class Check {
    private static int passed;
    static void that(boolean cond, String what) { if (!cond) throw new AssertionError("FAILED: " + what); passed++; }
    static void done(String name) { System.out.println("✓ " + name + ": " + passed + " checks passed"); }
}
