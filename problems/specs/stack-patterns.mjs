export default [
  {
    slug: 'valid-parentheses', title: 'Valid Parentheses', level: 'Easy',
    summary: 'A string of ()[]{} is valid if every bracket is closed by the same type, in the right order. Return whether s is valid.',
    method: 'isValid', params: [['String', 's']], returns: 'boolean',
    tests: [
      { in: ['()'], out: true },
      { in: ['()[]{}'], out: true },
      { in: ['(]'], out: false },
      { in: ['([)]'] },
      { in: ['{[]}'] },
      { in: ['('] },
      { in: [']'] },
    ],
    ref: `class Solution {
    public boolean isValid(String s) {
        Deque<Character> st = new ArrayDeque<>();
        for (char c : s.toCharArray()) {
            if (c == '(') st.push(')'); else if (c == '[') st.push(']'); else if (c == '{') st.push('}');
            else if (st.isEmpty() || st.pop() != c) return false;
        }
        return st.isEmpty();
    }
}`,
  },
  {
    slug: 'remove-all-adjacent-duplicates-in-string', title: 'Remove All Adjacent Duplicates In String', level: 'Easy',
    summary: 'Repeatedly delete two adjacent equal letters until none remain, and return the final string.',
    method: 'removeDuplicates', params: [['String', 's']], returns: 'String',
    tests: [
      { in: ['abbaca'], out: 'ca' },
      { in: ['azxxzy'], out: 'ay' },
      { in: ['a'] },
      { in: ['aa'] },
      { in: ['abccbaz'] },
    ],
    ref: `class Solution {
    public String removeDuplicates(String s) {
        StringBuilder sb = new StringBuilder();
        for (char c : s.toCharArray()) {
            if (sb.length() > 0 && sb.charAt(sb.length() - 1) == c) sb.deleteCharAt(sb.length() - 1); else sb.append(c);
        }
        return sb.toString();
    }
}`,
  },
  {
    slug: 'backspace-string-compare', title: 'Backspace String Compare', level: 'Easy',
    summary: '"#" is a backspace. Return whether s and t are equal after typing both into empty text editors.',
    method: 'backspaceCompare', params: [['String', 's'], ['String', 't']], returns: 'boolean',
    tests: [
      { in: ['ab#c', 'ad#c'], out: true },
      { in: ['ab##', 'c#d#'], out: true },
      { in: ['a#c', 'b'], out: false },
      { in: ['a##c', '#a#c'] },
      { in: ['bxj##tw', 'bxo#j##tw'] },
      { in: ['xywrrmp', 'xywrrmu#p'] },
    ],
    ref: `class Solution {
    public boolean backspaceCompare(String s, String t) { return type(s).equals(type(t)); }
    private String type(String s) {
        StringBuilder sb = new StringBuilder();
        for (char c : s.toCharArray()) { if (c == '#') { if (sb.length() > 0) sb.deleteCharAt(sb.length() - 1); } else sb.append(c); }
        return sb.toString();
    }
}`,
  },
  {
    slug: 'evaluate-reverse-polish-notation', title: 'Evaluate Reverse Polish Notation', level: 'Medium',
    summary: 'Evaluate an expression in Reverse Polish Notation with + - * / (division truncates toward zero) and return the result.',
    method: 'evalRPN', params: [['String[]', 'tokens']], returns: 'int',
    tests: [
      { in: [['2', '1', '+', '3', '*']], out: 9 },
      { in: [['4', '13', '5', '/', '+']], out: 6 },
      { in: [['10', '6', '9', '3', '+', '-11', '*', '/', '*', '17', '+', '5', '+']], out: 22 },
      { in: [['7']] },
      { in: [['-7', '2', '/']] },
    ],
    ref: `class Solution {
    public int evalRPN(String[] tokens) {
        Deque<Integer> st = new ArrayDeque<>();
        for (String t : tokens) {
            switch (t) {
                case "+": st.push(st.pop() + st.pop()); break;
                case "-": { int b = st.pop(), a = st.pop(); st.push(a - b); break; }
                case "*": st.push(st.pop() * st.pop()); break;
                case "/": { int b = st.pop(), a = st.pop(); st.push(a / b); break; }
                default: st.push(Integer.parseInt(t));
            }
        }
        return st.pop();
    }
}`,
  },
  {
    slug: 'asteroid-collision', title: 'Asteroid Collision', level: 'Medium',
    summary: 'Positive asteroids move right, negative ones left, all at the same speed. When two meet, the smaller explodes (both if equal). Return the asteroids left.',
    method: 'asteroidCollision', params: [['int[]', 'asteroids']], returns: 'int[]',
    tests: [
      { in: [[5, 10, -5]], out: [5, 10] },
      { in: [[8, -8]], out: [] },
      { in: [[10, 2, -5]], out: [10] },
      { in: [[-2, -1, 1, 2]] },
      { in: [[1, -2, -2, -2]] },
      { in: [[3, 5, -6, 2, -1, 4]] },
    ],
    ref: `class Solution {
    public int[] asteroidCollision(int[] asteroids) {
        Deque<Integer> st = new ArrayDeque<>();
        for (int a : asteroids) {
            boolean alive = true;
            while (alive && a < 0 && !st.isEmpty() && st.peek() > 0) {
                if (st.peek() < -a) st.pop();
                else { if (st.peek() == -a) st.pop(); alive = false; }
            }
            if (alive) st.push(a);
        }
        int[] out = new int[st.size()];
        for (int i = out.length - 1; i >= 0; i--) out[i] = st.pop();
        return out;
    }
}`,
  },
  {
    slug: 'simplify-path', title: 'Simplify Path', level: 'Medium',
    summary: 'Convert an absolute Unix-style path to its canonical form: resolve "." and "..", collapse repeated slashes, no trailing slash.',
    method: 'simplifyPath', params: [['String', 'path']], returns: 'String',
    tests: [
      { in: ['/home/'], out: '/home' },
      { in: ['/home//foo/'], out: '/home/foo' },
      { in: ['/home/user/Documents/../Pictures'], out: '/home/user/Pictures' },
      { in: ['/../'], out: '/' },
      { in: ['/.../a/../b/c/../d/./'], out: '/.../b/d' },
      { in: ['/a/./b/../../c/'] },
    ],
    ref: `class Solution {
    public String simplifyPath(String path) {
        Deque<String> st = new ArrayDeque<>();
        for (String part : path.split("/")) {
            if (part.isEmpty() || part.equals(".")) continue;
            if (part.equals("..")) { if (!st.isEmpty()) st.pollLast(); } else st.addLast(part);
        }
        return "/" + String.join("/", st);
    }
}`,
  },
  {
    slug: 'basic-calculator-ii', title: 'Basic Calculator II', level: 'Medium',
    summary: 'Evaluate an expression with non-negative integers, + - * / and spaces (no parentheses). Division truncates toward zero. Don\'t use eval.',
    method: 'calculate', params: [['String', 's']], returns: 'int',
    tests: [
      { in: ['3+2*2'], out: 7 },
      { in: [' 3/2 '], out: 1 },
      { in: [' 3+5 / 2 '], out: 5 },
      { in: ['42'] },
      { in: ['14-3/2'] },
      { in: ['1*2-3/4+5*6-7*8+9/10'] },
    ],
    ref: `class Solution {
    public int calculate(String s) {
        int result = 0, last = 0, num = 0;
        char op = '+';
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (Character.isDigit(c)) num = num * 10 + (c - '0');
            if ((!Character.isDigit(c) && c != ' ') || i == s.length() - 1) {
                if (op == '+') { result += last; last = num; }
                else if (op == '-') { result += last; last = -num; }
                else if (op == '*') last *= num;
                else last /= num;
                op = c; num = 0;
            }
        }
        return result + last;
    }
}`,
  },
  {
    slug: 'decode-string', title: 'Decode String', level: 'Medium',
    summary: 'Decode strings like "3[a2[c]]" where k[x] means x repeated k times; nesting is allowed.',
    method: 'decodeString', params: [['String', 's']], returns: 'String',
    tests: [
      { in: ['3[a]2[bc]'], out: 'aaabcbc' },
      { in: ['3[a2[c]]'], out: 'accaccacc' },
      { in: ['2[abc]3[cd]ef'], out: 'abcabccdcdcdef' },
      { in: ['abc'] },
      { in: ['10[a]'] },
    ],
    ref: `class Solution {
    public String decodeString(String s) {
        Deque<Integer> counts = new ArrayDeque<>();
        Deque<StringBuilder> saved = new ArrayDeque<>();
        StringBuilder cur = new StringBuilder();
        int k = 0;
        for (char c : s.toCharArray()) {
            if (Character.isDigit(c)) k = k * 10 + (c - '0');
            else if (c == '[') { counts.push(k); saved.push(cur); cur = new StringBuilder(); k = 0; }
            else if (c == ']') { String rep = cur.toString().repeat(counts.pop()); cur = saved.pop().append(rep); }
            else cur.append(c);
        }
        return cur.toString();
    }
}`,
  },
  {
    slug: 'longest-valid-parentheses', title: 'Longest Valid Parentheses', level: 'Hard',
    summary: 'Return the length of the longest well-formed substring of a string made of "(" and ")".',
    method: 'longestValidParentheses', params: [['String', 's']], returns: 'int',
    tests: [
      { in: ['(()'], out: 2 },
      { in: [')()())'], out: 4 },
      { in: [''], out: 0 },
      { in: ['()(()'] },
      { in: ['()(())'] },
      { in: [')('] },
    ],
    ref: `class Solution {
    public int longestValidParentheses(String s) {
        Deque<Integer> st = new ArrayDeque<>();
        st.push(-1);
        int best = 0;
        for (int i = 0; i < s.length(); i++) {
            if (s.charAt(i) == '(') st.push(i);
            else { st.pop(); if (st.isEmpty()) st.push(i); else best = Math.max(best, i - st.peek()); }
        }
        return best;
    }
}`,
  },
  {
    slug: 'baseball-game', title: 'Baseball Game', level: 'Easy',
    summary: 'Process score operations: an integer records that score, "+" records the sum of the previous two, "D" doubles the previous one, "C" removes the previous one. Return the sum of the scores left.',
    method: 'calPoints', params: [['String[]', 'operations']], returns: 'int',
    tests: [
      { in: [['5', '2', 'C', 'D', '+']], out: 30 },
      { in: [['5', '-2', '4', 'C', 'D', '9', '+', '+']], out: 27 },
      { in: [['1', 'C']], out: 0 },
      { in: [['7']] },
      { in: [['-3', 'D', 'D', '+', 'C', '+']] },
      { in: [['30000', 'D', '+', 'C', 'C', 'C']] },
    ],
    ref: `class Solution {
    public int calPoints(String[] operations) {
        Deque<Integer> st = new ArrayDeque<>();
        for (String op : operations) {
            if (op.equals("+")) { int a = st.pop(), b = st.peek(); st.push(a); st.push(a + b); }
            else if (op.equals("D")) st.push(2 * st.peek());
            else if (op.equals("C")) st.pop();
            else st.push(Integer.parseInt(op));
        }
        int sum = 0;
        for (int x : st) sum += x;
        return sum;
    }
}`,
  },
  {
    slug: 'car-fleet', title: 'Car Fleet', level: 'Medium',
    summary: 'Cars at distinct positions drive towards target at their own speeds and cannot pass each other: a faster car that catches a slower one joins it and slows down. Return how many groups (fleets) arrive at target.',
    method: 'carFleet', params: [['int', 'target'], ['int[]', 'position'], ['int[]', 'speed']], returns: 'int',
    tests: [
      { in: [12, [10, 8, 0, 5, 3], [2, 4, 1, 1, 3]], out: 3 },
      { in: [10, [3], [3]], out: 1 },
      { in: [100, [0, 2, 4], [4, 2, 1]], out: 1 },
      { in: [10, [6, 8], [3, 2]] },
      { in: [10, [0, 4, 2], [2, 1, 3]] },
      { in: [20, [6, 2, 17], [3, 9, 2]] },
      { in: [10, [8, 3, 7, 4, 6, 5], [4, 4, 4, 4, 4, 4]] },
    ],
    ref: `class Solution {
    public int carFleet(int target, int[] position, int[] speed) {
        int n = position.length;
        Integer[] idx = new Integer[n];
        for (int i = 0; i < n; i++) idx[i] = i;
        Arrays.sort(idx, (a, b) -> position[b] - position[a]);
        int fleets = 0;
        double slowest = 0;
        for (int i : idx) {
            double t = (double) (target - position[i]) / speed[i];
            if (t > slowest) { fleets++; slowest = t; }
        }
        return fleets;
    }
}`,
  },
];
