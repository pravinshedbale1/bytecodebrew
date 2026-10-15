// Patterns: Stack Patterns, Monotonic Stack & Queue. Run: java dsa-java/stacks/Stacks.java
import java.util.*;

public class Stacks {
    public static void main(String[] args) {
        var rnd = new Random(11);
        for (int t = 0; t < 3_000; t++) {
            // ---- stack patterns ----
            String br = brackets(rnd);
            Check.that(isValid(br) == validBrute(br), "isValid brackets");
            Check.that(longestValidParentheses(parens(rnd)) == longestValidBrute(lastParens), "longestValidParentheses");
            String adj = word(rnd, 12, 3);
            Check.that(removeDuplicates(adj).equals(removeDupBrute(adj)), "remove adjacent duplicates");
            int[] ast = new int[rnd.nextInt(10)]; for (int i = 0; i < ast.length; i++) { int v = 1 + rnd.nextInt(5); ast[i] = rnd.nextBoolean() ? v : -v; }
            Check.that(Arrays.equals(asteroidCollision(ast), asteroidBrute(ast)), "asteroidCollision");
            // expression: random a op b op c … with + - * /
            String expr = expression(rnd);
            Check.that(calculate(expr) == evalBrute(expr), "calculate (+ - * /)");
            // decode string
            String enc = encoded(rnd, 2);
            Check.that(decodeString(enc).equals(decodeBrute(enc)), "decodeString");
            // min stack
            MinStack ms = new MinStack(); Deque<Integer> ref = new ArrayDeque<>();
            for (int i = 0; i < 20; i++) {
                if (ref.isEmpty() || rnd.nextInt(3) > 0) { int v = rnd.nextInt(21) - 10; ms.push(v); ref.push(v); }
                else { ms.pop(); ref.pop(); }
                if (!ref.isEmpty()) Check.that(ms.top() == ref.peek() && ms.getMin() == Collections.min(ref), "MinStack");
            }

            // ---- monotonic stack ----
            int n = rnd.nextInt(20); int[] a = new int[n]; for (int i = 0; i < n; i++) a[i] = rnd.nextInt(10);
            int[] nge = nextGreater(a), ngeB = new int[n];
            for (int i = 0; i < n; i++) { ngeB[i] = -1; for (int j = i + 1; j < n; j++) if (a[j] > a[i]) { ngeB[i] = a[j]; break; } }
            Check.that(Arrays.equals(nge, ngeB), "nextGreater");
            int[] temps = a.clone(), wait = dailyTemperatures(temps);
            for (int i = 0; i < n; i++) { int w = 0; for (int j = i + 1; j < n; j++) if (temps[j] > temps[i]) { w = j - i; break; } Check.that(wait[i] == w, "dailyTemperatures"); }
            int[] circ = nextGreaterCircular(a);
            for (int i = 0; i < n; i++) { int e = -1; for (int s = 1; s < n; s++) if (a[(i + s) % n] > a[i]) { e = a[(i + s) % n]; break; } Check.that(circ[i] == e, "nextGreaterCircular"); }
            int best = 0; for (int i = 0; i < n; i++) { int mn = Integer.MAX_VALUE; for (int j = i; j < n; j++) { mn = Math.min(mn, a[j]); best = Math.max(best, mn * (j - i + 1)); } }
            Check.that(largestRectangleArea(a) == best, "largestRectangleArea");
            if (n > 0) { int k = 1 + rnd.nextInt(n); int[] mx = maxSlidingWindow(a, k);
                for (int i = 0; i + k <= n; i++) { int m = Integer.MIN_VALUE; for (int j = i; j < i + k; j++) m = Math.max(m, a[j]); Check.that(mx[i] == m, "maxSlidingWindow"); } }
            String digits = String.valueOf(1 + rnd.nextInt(9)) + word(rnd, 8, 0).replace("a", "") + randomDigits(rnd);
            int kk = rnd.nextInt(digits.length() + 1);
            Check.that(removeKdigits(digits, kk).equals(removeKBrute(digits, kk)), "removeKdigits");
            long sm = 0; for (int i = 0; i < n; i++) { int mn = Integer.MAX_VALUE; for (int j = i; j < n; j++) { mn = Math.min(mn, a[j]); sm += mn; } }
            Check.that(sumSubarrayMins(a) == sm, "sumSubarrayMins");
        }
        Check.done("stacks");
    }

    // ===================== Stack patterns =====================
    static boolean isValid(String s) {
        Deque<Character> stack = new ArrayDeque<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');                    // push the closer we expect
            else if (c == '[') stack.push(']');
            else if (c == '{') stack.push('}');
            else if (stack.isEmpty() || stack.pop() != c) return false;
        }
        return stack.isEmpty();                               // nothing left open
    }

    static String removeDuplicates(String s) {
        StringBuilder stack = new StringBuilder();            // a StringBuilder makes a fine char stack
        for (char c : s.toCharArray()) {
            int top = stack.length() - 1;
            if (top >= 0 && stack.charAt(top) == c) stack.deleteCharAt(top);
            else stack.append(c);
        }
        return stack.toString();
    }

    static int[] asteroidCollision(int[] asteroids) {
        Deque<Integer> stack = new ArrayDeque<>();
        for (int a : asteroids) {
            boolean alive = true;
            while (alive && a < 0 && !stack.isEmpty() && stack.peek() > 0) {   // only right-mover then left-mover collide
                if (stack.peek() < -a) stack.pop();           // top explodes, keep checking
                else { if (stack.peek() == -a) stack.pop(); alive = false; }   // equal: both; bigger: a dies
            }
            if (alive) stack.push(a);
        }
        int[] out = new int[stack.size()];
        for (int i = out.length - 1; i >= 0; i--) out[i] = stack.pop();
        return out;
    }

    /** + − * / with precedence, no parentheses: push signed terms; apply * and / immediately. */
    static int calculate(String s) {
        Deque<Integer> stack = new ArrayDeque<>();
        int num = 0; char op = '+';
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (Character.isDigit(c)) num = num * 10 + (c - '0');
            if ((!Character.isDigit(c) && c != ' ') || i == s.length() - 1) {
                switch (op) {
                    case '+' -> stack.push(num);
                    case '-' -> stack.push(-num);
                    case '*' -> stack.push(stack.pop() * num);
                    case '/' -> stack.push(stack.pop() / num);
                }
                op = c; num = 0;
            }
        }
        int total = 0;
        for (int x : stack) total += x;
        return total;
    }

    /** "3[a2[c]]" → "accaccacc": push the current string and count when entering a bracket. */
    static String decodeString(String s) {
        Deque<Integer> counts = new ArrayDeque<>();
        Deque<StringBuilder> outer = new ArrayDeque<>();
        StringBuilder cur = new StringBuilder();
        int k = 0;
        for (char c : s.toCharArray()) {
            if (Character.isDigit(c)) k = k * 10 + (c - '0');
            else if (c == '[') { counts.push(k); outer.push(cur); cur = new StringBuilder(); k = 0; }
            else if (c == ']') { String inner = cur.toString(); cur = outer.pop(); cur.append(inner.repeat(counts.pop())); }
            else cur.append(c);
        }
        return cur.toString();
    }

    static int longestValidParentheses(String s) {
        Deque<Integer> stack = new ArrayDeque<>();
        stack.push(-1);                                        // index before the current valid run
        int best = 0;
        for (int i = 0; i < s.length(); i++) {
            if (s.charAt(i) == '(') stack.push(i);
            else {
                stack.pop();
                if (stack.isEmpty()) stack.push(i);           // unmatched ')': new base
                else best = Math.max(best, i - stack.peek());
            }
        }
        return best;
    }

    /** Each entry remembers the minimum at the time it was pushed. */
    static class MinStack {
        private final Deque<int[]> stack = new ArrayDeque<>();     // {value, minSoFar}
        void push(int v) { stack.push(new int[] { v, stack.isEmpty() ? v : Math.min(v, stack.peek()[1]) }); }
        void pop() { stack.pop(); }
        int top() { return stack.peek()[0]; }
        int getMin() { return stack.peek()[1]; }
    }

    // ===================== Monotonic stack & queue =====================
    /** Next greater VALUE to the right, or −1. Stack holds indexes whose answer isn't known yet. */
    static int[] nextGreater(int[] a) {
        int[] ans = new int[a.length];
        Arrays.fill(ans, -1);
        Deque<Integer> stack = new ArrayDeque<>();             // values at these indexes are decreasing
        for (int i = 0; i < a.length; i++) {
            while (!stack.isEmpty() && a[stack.peek()] < a[i]) ans[stack.pop()] = a[i];   // a[i] answers them
            stack.push(i);
        }
        return ans;
    }

    static int[] dailyTemperatures(int[] t) {
        int[] ans = new int[t.length];
        Deque<Integer> stack = new ArrayDeque<>();
        for (int i = 0; i < t.length; i++) {
            while (!stack.isEmpty() && t[stack.peek()] < t[i]) { int j = stack.pop(); ans[j] = i - j; }
            stack.push(i);
        }
        return ans;
    }

    static int[] nextGreaterCircular(int[] a) {
        int n = a.length;
        int[] ans = new int[n];
        Arrays.fill(ans, -1);
        Deque<Integer> stack = new ArrayDeque<>();
        for (int i = 0; i < 2 * n; i++) {                       // walk the array twice
            int v = a[i % n];
            while (!stack.isEmpty() && a[stack.peek()] < v) ans[stack.pop()] = v;
            if (i < n) stack.push(i);                           // only push in the first lap
        }
        return ans;
    }

    /** For each bar, the widest rectangle using it as the shortest bar; popped bars know both boundaries. */
    static int largestRectangleArea(int[] h) {
        Deque<Integer> stack = new ArrayDeque<>();              // increasing heights
        int best = 0;
        for (int i = 0; i <= h.length; i++) {
            int cur = i == h.length ? 0 : h[i];                 // a final 0 flushes the stack
            while (!stack.isEmpty() && h[stack.peek()] >= cur) {
                int height = h[stack.pop()];
                int left = stack.isEmpty() ? -1 : stack.peek(); // first smaller bar on the left
                best = Math.max(best, height * (i - left - 1)); // i is the first smaller bar on the right
            }
            stack.push(i);
        }
        return best;
    }

    /** Sum of the minimum of every subarray: each a[i] is the minimum of (i − left) × (right − i) subarrays. */
    static long sumSubarrayMins(int[] a) {
        int n = a.length;
        int[] left = new int[n], right = new int[n];
        Deque<Integer> stack = new ArrayDeque<>();
        for (int i = 0; i < n; i++) {                           // previous strictly smaller
            while (!stack.isEmpty() && a[stack.peek()] >= a[i]) stack.pop();
            left[i] = stack.isEmpty() ? -1 : stack.peek();
            stack.push(i);
        }
        stack.clear();
        for (int i = n - 1; i >= 0; i--) {                      // next smaller-or-equal (breaks ties once)
            while (!stack.isEmpty() && a[stack.peek()] > a[i]) stack.pop();
            right[i] = stack.isEmpty() ? n : stack.peek();
            stack.push(i);
        }
        long total = 0;
        for (int i = 0; i < n; i++) total += (long) a[i] * (i - left[i]) * (right[i] - i);
        return total;
    }

    static String removeKdigits(String num, int k) {
        StringBuilder stack = new StringBuilder();              // increasing digits
        for (char c : num.toCharArray()) {
            while (k > 0 && stack.length() > 0 && stack.charAt(stack.length() - 1) > c) { stack.deleteCharAt(stack.length() - 1); k--; }
            stack.append(c);
        }
        stack.setLength(stack.length() - k);                    // still need to remove: drop from the end
        int i = 0;
        while (i < stack.length() - 1 && stack.charAt(i) == '0') i++;   // strip leading zeros
        String out = stack.substring(i);
        return out.isEmpty() ? "0" : out;
    }

    /** Monotonic deque of indexes with decreasing values; the front is the window maximum. */
    static int[] maxSlidingWindow(int[] a, int k) {
        int[] out = new int[a.length - k + 1];
        Deque<Integer> dq = new ArrayDeque<>();
        for (int i = 0; i < a.length; i++) {
            if (!dq.isEmpty() && dq.peekFirst() <= i - k) dq.pollFirst();       // front left the window
            while (!dq.isEmpty() && a[dq.peekLast()] <= a[i]) dq.pollLast();    // smaller ones can never be max again
            dq.offerLast(i);
            if (i >= k - 1) out[i - k + 1] = a[dq.peekFirst()];
        }
        return out;
    }

    // ===================== testing helpers =====================
    static String lastParens = "";
    static String parens(Random r) { StringBuilder sb = new StringBuilder(); int n = r.nextInt(14); for (int i = 0; i < n; i++) sb.append(r.nextBoolean() ? '(' : ')'); return lastParens = sb.toString(); }
    static int longestValidBrute(String s) { int best = 0; for (int i = 0; i < s.length(); i++) for (int j = i + 2; j <= s.length(); j += 1) if (balanced(s.substring(i, j))) best = Math.max(best, j - i); return best; }
    static boolean balanced(String s) { int d = 0; for (char c : s.toCharArray()) { d += c == '(' ? 1 : -1; if (d < 0) return false; } return d == 0; }
    static String brackets(Random r) { String al = "()[]{}"; StringBuilder sb = new StringBuilder(); int n = r.nextInt(10); for (int i = 0; i < n; i++) sb.append(al.charAt(r.nextInt(6))); return sb.toString(); }
    static boolean validBrute(String s) { String prev; do { prev = s; s = s.replace("()", "").replace("[]", "").replace("{}", ""); } while (!s.equals(prev)); return s.isEmpty(); }
    static String word(Random r, int max, int alpha) { StringBuilder sb = new StringBuilder(); int n = r.nextInt(max + 1); for (int i = 0; i < n; i++) sb.append((char) ('a' + r.nextInt(Math.max(1, alpha)))); return sb.toString(); }
    static String removeDupBrute(String s) { String prev; do { prev = s; for (char c = 'a'; c <= 'z'; c++) s = s.replace("" + c + c, ""); } while (!s.equals(prev)); return s; }
    static int[] asteroidBrute(int[] a) {
        List<Integer> l = new ArrayList<>(); for (int x : a) l.add(x);
        boolean changed = true;
        while (changed) { changed = false;
            for (int i = 0; i + 1 < l.size(); i++) if (l.get(i) > 0 && l.get(i + 1) < 0) {
                int x = l.get(i), y = -l.get(i + 1);
                if (x > y) l.remove(i + 1); else if (x < y) l.remove(i); else { l.remove(i + 1); l.remove(i); }
                changed = true; break; } }
        return l.stream().mapToInt(Integer::intValue).toArray();
    }
    static String expression(Random r) { StringBuilder sb = new StringBuilder().append(r.nextInt(20)); int n = r.nextInt(5); String ops = "+-*/";
        for (int i = 0; i < n; i++) { char op = ops.charAt(r.nextInt(4)); sb.append(r.nextBoolean() ? " " : "").append(op).append(r.nextBoolean() ? " " : "").append(op == '/' ? 1 + r.nextInt(9) : r.nextInt(20)); } return sb.toString(); }
    static int evalBrute(String s) {
        List<String> tok = new ArrayList<>(); StringBuilder num = new StringBuilder();
        for (char c : s.replace(" ", "").toCharArray()) { if (Character.isDigit(c)) num.append(c); else { tok.add(num.toString()); num.setLength(0); tok.add("" + c); } }
        tok.add(num.toString());
        for (int i = 1; i < tok.size(); ) { String op = tok.get(i); if (op.equals("*") || op.equals("/")) { int a = Integer.parseInt(tok.get(i - 1)), b = Integer.parseInt(tok.get(i + 1));
            tok.set(i - 1, String.valueOf(op.equals("*") ? a * b : a / b)); tok.remove(i); tok.remove(i); } else i += 2; }
        int total = Integer.parseInt(tok.get(0)); for (int i = 1; i < tok.size(); i += 2) total += (tok.get(i).equals("+") ? 1 : -1) * Integer.parseInt(tok.get(i + 1)); return total;
    }
    static String encoded(Random r, int depth) { StringBuilder sb = new StringBuilder(); int parts = 1 + r.nextInt(3);
        for (int i = 0; i < parts; i++) { if (depth > 0 && r.nextBoolean()) sb.append(1 + r.nextInt(3)).append('[').append(encoded(r, depth - 1)).append(']'); else sb.append((char) ('a' + r.nextInt(3))); } return sb.toString(); }
    static String decodeBrute(String s) { java.util.regex.Pattern p = java.util.regex.Pattern.compile("(\\d+)\\[([a-z]*)\\]"); java.util.regex.Matcher m;
        while ((m = p.matcher(s)).find()) s = s.substring(0, m.start()) + m.group(2).repeat(Integer.parseInt(m.group(1))) + s.substring(m.end()); return s; }
    static String randomDigits(Random r) { StringBuilder sb = new StringBuilder(); int n = r.nextInt(7); for (int i = 0; i < n; i++) sb.append(r.nextInt(10)); return sb.toString(); }
    static String removeKBrute(String num, int k) {
        // try every subsequence of length n − k; pick the smallest numeric value
        int n = num.length(), keep = n - k; if (keep == 0) return "0";
        String best = null;
        for (int mask = 0; mask < (1 << n); mask++) if (Integer.bitCount(mask) == keep) {
            StringBuilder sb = new StringBuilder(); for (int i = 0; i < n; i++) if ((mask >> i & 1) == 1) sb.append(num.charAt(i));
            String v = sb.toString().replaceFirst("^0+(?=.)", ""); if (v.isEmpty()) v = "0";
            if (best == null || v.length() < best.length() || (v.length() == best.length() && v.compareTo(best) < 0)) best = v; }
        return best;
    }
}

final class Check {
    private static int passed;
    static void that(boolean cond, String what) { if (!cond) throw new AssertionError("FAILED: " + what); passed++; }
    static void done(String name) { System.out.println("✓ " + name + ": " + passed + " checks passed"); }
}
