const r = String.raw;

export default {
  'valid-parentheses': {
    pattern: 'Stack of open brackets (the most recent opener must close first)',
    approaches: [
      {
        level: 'Brute force', name: 'Keep deleting matched pairs',
        idea: 'A valid string always contains an adjacent pair `()`, `[]` or `{}` somewhere. Delete such pairs until none is left; the string was valid exactly when it ends up empty.',
        steps: [
          'Repeat: replace every `()`, `[]` and `{}` with nothing.',
          'Stop when a round removes nothing.',
          'Return whether the string is now empty.',
        ],
        time: 'O(n²)', space: 'O(n)',
        why: 'Each round is O(n) and removes at least one pair, so up to n/2 rounds. Each round builds a new string.',
        code: {
          java: r`class Solution {
    public boolean isValid(String s) {
        String prev;
        do {
            prev = s;
            s = s.replace("()", "").replace("[]", "").replace("{}", "");
        } while (!s.equals(prev));
        return s.isEmpty();
    }
}`,
          cpp: r`class Solution {
public:
    bool isValid(string s) {
        while (true) {
            size_t before = s.size();
            for (string pair : {"()", "[]", "{}"}) {
                size_t at;
                while ((at = s.find(pair)) != string::npos) s.erase(at, 2);
            }
            if (s.size() == before) break;
        }
        return s.empty();
    }
};`,
          python: r`class Solution:
    def isValid(self, s: str) -> bool:
        prev = None
        while s != prev:
            prev = s
            s = s.replace("()", "").replace("[]", "").replace("{}", "")
        return s == ""`,
          javascript: r`var isValid = function(s) {
    let prev;
    do {
        prev = s;
        s = s.split('()').join('').split('[]').join('').split('{}').join('');
    } while (s !== prev);
    return s.length === 0;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Stack of expected closers',
        idea: 'Read left to right. Every opening bracket must be closed before any bracket opened earlier, which is last-in-first-out order: push what each opener expects, and check each closer against the top of the stack.',
        steps: [
          'For each character: if it is an opener, push its matching closer.',
          'If it is a closer, the stack must be non-empty and its top must equal this character; pop it, otherwise return false.',
          'At the end, return whether the stack is empty (no opener left unclosed).',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'One push or pop per character; the stack holds up to n openers (e.g. `((((`).',
        code: {
          java: r`class Solution {
    public boolean isValid(String s) {
        Deque<Character> stack = new ArrayDeque<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '[') stack.push(']');
            else if (c == '{') stack.push('}');
            else if (stack.isEmpty() || stack.pop() != c) return false;
        }
        return stack.isEmpty();
    }
}`,
          cpp: r`class Solution {
public:
    bool isValid(string s) {
        string stack;
        for (char c : s) {
            if (c == '(') stack.push_back(')');
            else if (c == '[') stack.push_back(']');
            else if (c == '{') stack.push_back('}');
            else {
                if (stack.empty() || stack.back() != c) return false;
                stack.pop_back();
            }
        }
        return stack.empty();
    }
};`,
          python: r`class Solution:
    def isValid(self, s: str) -> bool:
        closer = {"(": ")", "[": "]", "{": "}"}
        stack = []
        for c in s:
            if c in closer:
                stack.append(closer[c])
            elif not stack or stack.pop() != c:
                return False
        return not stack`,
          javascript: r`var isValid = function(s) {
    const closer = { '(': ')', '[': ']', '{': '}' }, stack = [];
    for (const c of s) {
        if (c in closer) stack.push(closer[c]);
        else if (stack.length === 0 || stack.pop() !== c) return false;
    }
    return stack.length === 0;
};`,
        },
      },
    ],
  },

  'remove-all-adjacent-duplicates-in-string': {
    pattern: 'Stack as the output buffer (compare each character with the top)',
    approaches: [
      {
        level: 'Brute force', name: 'Remove one adjacent pair at a time',
        idea: 'Simulate the rule literally: find any two equal neighbours, delete them, and start again until no pair is left.',
        steps: [
          'Scan for the first index `i` with `s[i] == s[i + 1]`.',
          'If found, remove those two characters and scan again from just before them.',
          'When no pair is found, return the string.',
        ],
        time: 'O(n²)', space: 'O(n)',
        why: 'Up to n/2 removals, each costing O(n) to rebuild the string. For n = 10⁵ this is too slow.',
        code: {
          java: r`class Solution {
    public String removeDuplicates(String s) {
        StringBuilder sb = new StringBuilder(s);
        int i = 0;
        while (i + 1 < sb.length()) {
            if (sb.charAt(i) == sb.charAt(i + 1)) {
                sb.delete(i, i + 2);
                i = Math.max(0, i - 1);
            } else i++;
        }
        return sb.toString();
    }
}`,
          cpp: r`class Solution {
public:
    string removeDuplicates(string s) {
        int i = 0;
        while (i + 1 < (int) s.size()) {
            if (s[i] == s[i + 1]) {
                s.erase(i, 2);
                i = max(0, i - 1);
            } else i++;
        }
        return s;
    }
};`,
          python: r`class Solution:
    def removeDuplicates(self, s: str) -> str:
        i = 0
        while i + 1 < len(s):
            if s[i] == s[i + 1]:
                s = s[:i] + s[i + 2:]
                i = max(0, i - 1)
            else:
                i += 1
        return s`,
          javascript: r`var removeDuplicates = function(s) {
    let i = 0;
    while (i + 1 < s.length) {
        if (s[i] === s[i + 1]) {
            s = s.slice(0, i) + s.slice(i + 2);
            i = Math.max(0, i - 1);
        } else i++;
    }
    return s;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Stack: cancel against the last kept character',
        idea: 'Build the answer left to right. A new character either cancels the last kept character (if they are equal) or is kept. Cancelling can expose an older character, which is exactly what a stack handles.',
        steps: [
          'Use a string builder as a stack.',
          'For each character: if the builder is non-empty and its last character equals it, delete that last character; otherwise append it.',
          'Return the builder\'s contents.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Each character is pushed once and popped at most once; the builder holds up to n characters (the output).',
        code: {
          java: r`class Solution {
    public String removeDuplicates(String s) {
        StringBuilder st = new StringBuilder();
        for (char c : s.toCharArray()) {
            int n = st.length();
            if (n > 0 && st.charAt(n - 1) == c) st.deleteCharAt(n - 1);
            else st.append(c);
        }
        return st.toString();
    }
}`,
          cpp: r`class Solution {
public:
    string removeDuplicates(string s) {
        string st;
        for (char c : s) {
            if (!st.empty() && st.back() == c) st.pop_back();
            else st.push_back(c);
        }
        return st;
    }
};`,
          python: r`class Solution:
    def removeDuplicates(self, s: str) -> str:
        st = []
        for c in s:
            if st and st[-1] == c:
                st.pop()
            else:
                st.append(c)
        return "".join(st)`,
          javascript: r`var removeDuplicates = function(s) {
    const st = [];
    for (const c of s) {
        if (st.length && st[st.length - 1] === c) st.pop();
        else st.push(c);
    }
    return st.join('');
};`,
        },
      },
    ],
  },

  'backspace-string-compare': {
    pattern: 'Stack simulation, or two pointers from the end that skip deleted characters',
    approaches: [
      {
        level: 'Better', name: 'Build both final texts with a stack',
        idea: 'Type each string into a stack: a letter is pushed, `#` pops (if anything is there). Compare the two results.',
        steps: [
          'For each string, push letters and pop on `#` when the stack is not empty.',
          'Turn both stacks into strings.',
          'Return whether they are equal.',
        ],
        time: 'O(n + m)', space: 'O(n + m)',
        why: 'One pass per string; the two stacks hold up to n + m characters.',
        code: {
          java: r`class Solution {
    public boolean backspaceCompare(String s, String t) {
        return type(s).equals(type(t));
    }

    private String type(String s) {
        StringBuilder sb = new StringBuilder();
        for (char c : s.toCharArray()) {
            if (c != '#') sb.append(c);
            else if (sb.length() > 0) sb.deleteCharAt(sb.length() - 1);
        }
        return sb.toString();
    }
}`,
          cpp: r`class Solution {
    string type(const string& s) {
        string out;
        for (char c : s) {
            if (c != '#') out.push_back(c);
            else if (!out.empty()) out.pop_back();
        }
        return out;
    }
public:
    bool backspaceCompare(string s, string t) {
        return type(s) == type(t);
    }
};`,
          python: r`class Solution:
    def backspaceCompare(self, s: str, t: str) -> bool:
        def typed(x):
            st = []
            for c in x:
                if c != "#":
                    st.append(c)
                elif st:
                    st.pop()
            return st
        return typed(s) == typed(t)`,
          javascript: r`var backspaceCompare = function(s, t) {
    const type = (x) => {
        const st = [];
        for (const c of x) {
            if (c !== '#') st.push(c);
            else st.pop();
        }
        return st.join('');
    };
    return type(s) === type(t);
};`,
        },
      },
      {
        level: 'Optimal', name: 'Two pointers from the end',
        idea: 'A `#` only affects characters before it, so read both strings backwards. Keep a count of pending backspaces and skip the characters they delete; then compare the next surviving character of each string.',
        steps: [
          'Set `i` and `j` at the last index of `s` and `t`.',
          'Move `i` left to the next surviving character: a `#` adds one to `skip`; a letter with `skip > 0` uses one up; otherwise stop. Do the same for `j`.',
          'If both are in range, the characters must be equal; if exactly one is in range, return false; if neither, return true.',
          'Step both left and repeat.',
        ],
        time: 'O(n + m)', space: 'O(1)',
        why: 'Each index is passed once; only the two indices and two skip counters are stored.',
        code: {
          java: r`class Solution {
    public boolean backspaceCompare(String s, String t) {
        int i = s.length() - 1, j = t.length() - 1;
        while (true) {
            i = next(s, i);
            j = next(t, j);
            if (i < 0 || j < 0) return i < 0 && j < 0;
            if (s.charAt(i) != t.charAt(j)) return false;
            i--;
            j--;
        }
    }

    // index of the next character (at or left of i) that survives the backspaces, or -1
    private int next(String s, int i) {
        int skip = 0;
        while (i >= 0) {
            if (s.charAt(i) == '#') skip++;
            else if (skip > 0) skip--;
            else break;
            i--;
        }
        return i;
    }
}`,
          cpp: r`class Solution {
    // index of the next character (at or left of i) that survives the backspaces, or -1
    int next(const string& s, int i) {
        int skip = 0;
        while (i >= 0) {
            if (s[i] == '#') skip++;
            else if (skip > 0) skip--;
            else break;
            i--;
        }
        return i;
    }
public:
    bool backspaceCompare(string s, string t) {
        int i = (int) s.size() - 1, j = (int) t.size() - 1;
        while (true) {
            i = next(s, i);
            j = next(t, j);
            if (i < 0 || j < 0) return i < 0 && j < 0;
            if (s[i] != t[j]) return false;
            i--;
            j--;
        }
    }
};`,
          python: r`class Solution:
    def backspaceCompare(self, s: str, t: str) -> bool:
        def nxt(x, i):
            skip = 0
            while i >= 0:
                if x[i] == "#":
                    skip += 1
                elif skip:
                    skip -= 1
                else:
                    break
                i -= 1
            return i
        i, j = len(s) - 1, len(t) - 1
        while True:
            i, j = nxt(s, i), nxt(t, j)
            if i < 0 or j < 0:
                return i < 0 and j < 0
            if s[i] != t[j]:
                return False
            i -= 1
            j -= 1`,
          javascript: r`var backspaceCompare = function(s, t) {
    const next = (x, i) => {
        let skip = 0;
        while (i >= 0) {
            if (x[i] === '#') skip++;
            else if (skip > 0) skip--;
            else break;
            i--;
        }
        return i;
    };
    let i = s.length - 1, j = t.length - 1;
    while (true) {
        i = next(s, i);
        j = next(t, j);
        if (i < 0 || j < 0) return i < 0 && j < 0;
        if (s[i] !== t[j]) return false;
        i--;
        j--;
    }
};`,
        },
      },
    ],
  },

  'evaluate-reverse-polish-notation': {
    pattern: 'Operand stack (an operator pops its two operands and pushes the result)',
    approaches: [
      {
        level: 'Brute force', name: 'Repeatedly collapse the first operator',
        idea: 'The first operator in the list always applies to the two values just before it. Replace those three tokens with their result and repeat until one value remains.',
        steps: [
          'Copy the tokens into a list.',
          'Find the first operator at index `i`; compute `list[i − 2] op list[i − 1]`.',
          'Replace the three tokens with the result; repeat until one token is left, and return it.',
        ],
        time: 'O(n²)', space: 'O(n)',
        why: 'Each of up to n/2 operators needs a scan and a list removal, both O(n).',
        code: {
          java: r`class Solution {
    public int evalRPN(String[] tokens) {
        List<String> list = new ArrayList<>(Arrays.asList(tokens));
        while (list.size() > 1) {
            int i = 0;
            while (!"+-*/".contains(list.get(i)) || list.get(i).length() != 1) i++;
            int a = Integer.parseInt(list.get(i - 2)), b = Integer.parseInt(list.get(i - 1));
            int v = switch (list.get(i)) {
                case "+" -> a + b;
                case "-" -> a - b;
                case "*" -> a * b;
                default -> a / b;
            };
            list.subList(i - 2, i + 1).clear();
            list.add(i - 2, String.valueOf(v));
        }
        return Integer.parseInt(list.get(0));
    }
}`,
          cpp: r`class Solution {
public:
    int evalRPN(vector<string>& tokens) {
        vector<string> list = tokens;
        auto isOp = [](const string& t) { return t == "+" || t == "-" || t == "*" || t == "/"; };
        while (list.size() > 1) {
            int i = 0;
            while (!isOp(list[i])) i++;
            int a = stoi(list[i - 2]), b = stoi(list[i - 1]), v;
            if (list[i] == "+") v = a + b;
            else if (list[i] == "-") v = a - b;
            else if (list[i] == "*") v = a * b;
            else v = a / b;
            list.erase(list.begin() + i - 2, list.begin() + i + 1);
            list.insert(list.begin() + i - 2, to_string(v));
        }
        return stoi(list[0]);
    }
};`,
          python: r`class Solution:
    def evalRPN(self, tokens: List[str]) -> int:
        items = list(tokens)
        while len(items) > 1:
            i = next(k for k, t in enumerate(items) if t in ("+", "-", "*", "/"))
            a, b, op = int(items[i - 2]), int(items[i - 1]), items[i]
            if op == "+":
                v = a + b
            elif op == "-":
                v = a - b
            elif op == "*":
                v = a * b
            else:
                v = abs(a) // abs(b) * (1 if (a < 0) == (b < 0) else -1)  # truncate toward zero
            items[i - 2:i + 1] = [str(v)]
        return int(items[0])`,
          javascript: r`var evalRPN = function(tokens) {
    const list = [...tokens], ops = new Set(['+', '-', '*', '/']);
    while (list.length > 1) {
        let i = 0;
        while (!ops.has(list[i])) i++;
        const a = Number(list[i - 2]), b = Number(list[i - 1]);
        let v;
        if (list[i] === '+') v = a + b;
        else if (list[i] === '-') v = a - b;
        else if (list[i] === '*') v = a * b;
        else v = Math.trunc(a / b);
        list.splice(i - 2, 3, String(v));
    }
    return Number(list[0]);
};`,
        },
      },
      {
        level: 'Optimal', name: 'One pass with a stack',
        idea: 'Push numbers. An operator applies to the two most recent values: pop the right operand, then the left, and push the result. The last value on the stack is the answer.',
        steps: [
          'For each token: if it is a number, push it.',
          'If it is an operator: pop `b`, then pop `a`, and push `a op b` (the order matters for `-` and `/`).',
          'Division truncates toward zero.',
          'Return the single value left on the stack.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'One push or pop per token; the stack holds up to about n/2 numbers.',
        code: {
          java: r`class Solution {
    public int evalRPN(String[] tokens) {
        Deque<Integer> st = new ArrayDeque<>();
        for (String t : tokens) {
            switch (t) {
                case "+" -> st.push(st.pop() + st.pop());
                case "*" -> st.push(st.pop() * st.pop());
                case "-" -> { int b = st.pop(), a = st.pop(); st.push(a - b); }
                case "/" -> { int b = st.pop(), a = st.pop(); st.push(a / b); }
                default -> st.push(Integer.parseInt(t));
            }
        }
        return st.pop();
    }
}`,
          cpp: r`class Solution {
public:
    int evalRPN(vector<string>& tokens) {
        vector<long long> st;
        for (auto& t : tokens) {
            if (t == "+" || t == "-" || t == "*" || t == "/") {
                long long b = st.back(); st.pop_back();
                long long a = st.back(); st.pop_back();
                if (t == "+") st.push_back(a + b);
                else if (t == "-") st.push_back(a - b);
                else if (t == "*") st.push_back(a * b);
                else st.push_back(a / b);
            } else st.push_back(stoll(t));
        }
        return (int) st.back();
    }
};`,
          python: r`class Solution:
    def evalRPN(self, tokens: List[str]) -> int:
        st = []
        for t in tokens:
            if t in ("+", "-", "*", "/"):
                b, a = st.pop(), st.pop()
                if t == "+":
                    st.append(a + b)
                elif t == "-":
                    st.append(a - b)
                elif t == "*":
                    st.append(a * b)
                else:
                    q = abs(a) // abs(b)  # truncate toward zero, unlike //
                    st.append(q if (a < 0) == (b < 0) else -q)
            else:
                st.append(int(t))
        return st[0]`,
          javascript: r`var evalRPN = function(tokens) {
    const st = [];
    for (const t of tokens) {
        if (t === '+' || t === '-' || t === '*' || t === '/') {
            const b = st.pop(), a = st.pop();
            if (t === '+') st.push(a + b);
            else if (t === '-') st.push(a - b);
            else if (t === '*') st.push(a * b);
            else st.push(Math.trunc(a / b));
        } else st.push(Number(t));
    }
    return st[0];
};`,
        },
      },
    ],
  },

  'asteroid-collision': {
    pattern: 'Stack of survivors (a left-mover collides with right-movers on top of the stack)',
    approaches: [
      {
        level: 'Brute force', name: 'Resolve one collision at a time',
        idea: 'A collision happens only where a right-mover is immediately followed by a left-mover. Find such a pair, resolve it, and repeat until none is left.',
        steps: [
          'Keep the asteroids in a list.',
          'Find the first `i` with `a[i] > 0` and `a[i + 1] < 0`.',
          'Remove the smaller one, or both if equal sizes; repeat until no such pair exists.',
          'Return the list.',
        ],
        time: 'O(n²)', space: 'O(n)',
        why: 'Each collision removes at least one asteroid (at most n collisions), and each search and removal is O(n).',
        code: {
          java: r`class Solution {
    public int[] asteroidCollision(int[] asteroids) {
        List<Integer> a = new ArrayList<>();
        for (int x : asteroids) a.add(x);
        boolean changed = true;
        while (changed) {
            changed = false;
            for (int i = 0; i + 1 < a.size(); i++) {
                int l = a.get(i), r = a.get(i + 1);
                if (l > 0 && r < 0) {
                    if (l == -r) { a.remove(i + 1); a.remove(i); }
                    else if (l > -r) a.remove(i + 1);
                    else a.remove(i);
                    changed = true;
                    break;
                }
            }
        }
        return a.stream().mapToInt(Integer::intValue).toArray();
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> asteroidCollision(vector<int>& asteroids) {
        vector<int> a = asteroids;
        bool changed = true;
        while (changed) {
            changed = false;
            for (size_t i = 0; i + 1 < a.size(); i++) {
                int l = a[i], r = a[i + 1];
                if (l > 0 && r < 0) {
                    if (l == -r) a.erase(a.begin() + i, a.begin() + i + 2);
                    else if (l > -r) a.erase(a.begin() + i + 1);
                    else a.erase(a.begin() + i);
                    changed = true;
                    break;
                }
            }
        }
        return a;
    }
};`,
          python: r`class Solution:
    def asteroidCollision(self, asteroids: List[int]) -> List[int]:
        a = list(asteroids)
        changed = True
        while changed:
            changed = False
            for i in range(len(a) - 1):
                l, r = a[i], a[i + 1]
                if l > 0 and r < 0:
                    if l == -r:
                        del a[i:i + 2]
                    elif l > -r:
                        del a[i + 1]
                    else:
                        del a[i]
                    changed = True
                    break
        return a`,
          javascript: r`var asteroidCollision = function(asteroids) {
    const a = [...asteroids];
    let changed = true;
    while (changed) {
        changed = false;
        for (let i = 0; i + 1 < a.length; i++) {
            const l = a[i], r = a[i + 1];
            if (l > 0 && r < 0) {
                if (l === -r) a.splice(i, 2);
                else if (l > -r) a.splice(i + 1, 1);
                else a.splice(i, 1);
                changed = true;
                break;
            }
        }
    }
    return a;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Stack of survivors',
        idea: 'Process asteroids left to right, keeping the survivors so far on a stack. Only a left-mover arriving while right-movers are on top can collide, so it fights the top until it is destroyed or nothing on top moves right.',
        steps: [
          'For each asteroid `x`: set `alive = true`.',
          'While `alive`, `x < 0`, and the top of the stack is positive: if `top < −x`, pop it and keep going; if `top == −x`, pop it and `x` dies too; if `top > −x`, `x` dies.',
          'If `x` is still alive, push it.',
          'The stack, bottom to top, is the answer.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Every asteroid is pushed at most once and popped at most once, so all the while loops together do O(n) work.',
        code: {
          java: r`class Solution {
    public int[] asteroidCollision(int[] asteroids) {
        int[] st = new int[asteroids.length];
        int top = 0;
        for (int x : asteroids) {
            boolean alive = true;
            while (alive && x < 0 && top > 0 && st[top - 1] > 0) {
                if (st[top - 1] < -x) top--;
                else {
                    if (st[top - 1] == -x) top--;
                    alive = false;
                }
            }
            if (alive) st[top++] = x;
        }
        return Arrays.copyOf(st, top);
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> asteroidCollision(vector<int>& asteroids) {
        vector<int> st;
        for (int x : asteroids) {
            bool alive = true;
            while (alive && x < 0 && !st.empty() && st.back() > 0) {
                if (st.back() < -x) st.pop_back();
                else {
                    if (st.back() == -x) st.pop_back();
                    alive = false;
                }
            }
            if (alive) st.push_back(x);
        }
        return st;
    }
};`,
          python: r`class Solution:
    def asteroidCollision(self, asteroids: List[int]) -> List[int]:
        st = []
        for x in asteroids:
            alive = True
            while alive and x < 0 and st and st[-1] > 0:
                if st[-1] < -x:
                    st.pop()
                else:
                    if st[-1] == -x:
                        st.pop()
                    alive = False
            if alive:
                st.append(x)
        return st`,
          javascript: r`var asteroidCollision = function(asteroids) {
    const st = [];
    for (const x of asteroids) {
        let alive = true;
        while (alive && x < 0 && st.length && st[st.length - 1] > 0) {
            const top = st[st.length - 1];
            if (top < -x) st.pop();
            else {
                if (top === -x) st.pop();
                alive = false;
            }
        }
        if (alive) st.push(x);
    }
    return st;
};`,
        },
      },
    ],
  },

  'simplify-path': {
    pattern: 'Stack of directory names (".." pops, "." and empty parts are ignored)',
    approaches: [
      {
        level: 'Optimal', name: 'Split on "/" and keep a stack of directories',
        idea: 'Split the path into parts. Each real name goes deeper (push); `..` goes up one level (pop, if not at the root); `.` and the empty parts made by repeated slashes do nothing. The stack is the canonical path.',
        steps: [
          'Split `path` on `/`.',
          'For each part: skip it if it is empty or `.`; if it is `..`, pop when the stack is non-empty; otherwise push it.',
          'Join the stack with `/` and put one `/` in front (the root alone is `/`).',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Splitting and joining are linear in the path length; the parts and the stack hold O(n) characters. There is no slower approach worth writing: every character must be read once anyway.',
        code: {
          java: r`class Solution {
    public String simplifyPath(String path) {
        Deque<String> st = new ArrayDeque<>();
        for (String part : path.split("/")) {
            if (part.isEmpty() || part.equals(".")) continue;
            if (part.equals("..")) { if (!st.isEmpty()) st.pollLast(); }
            else st.addLast(part);
        }
        return "/" + String.join("/", st);
    }
}`,
          cpp: r`class Solution {
public:
    string simplifyPath(string path) {
        vector<string> st;
        stringstream ss(path);
        string part;
        while (getline(ss, part, '/')) {
            if (part.empty() || part == ".") continue;
            if (part == "..") { if (!st.empty()) st.pop_back(); }
            else st.push_back(part);
        }
        string out;
        for (auto& d : st) out += "/" + d;
        return out.empty() ? "/" : out;
    }
};`,
          python: r`class Solution:
    def simplifyPath(self, path: str) -> str:
        st = []
        for part in path.split("/"):
            if part in ("", "."):
                continue
            if part == "..":
                if st:
                    st.pop()
            else:
                st.append(part)
        return "/" + "/".join(st)`,
          javascript: r`var simplifyPath = function(path) {
    const st = [];
    for (const part of path.split('/')) {
        if (part === '' || part === '.') continue;
        if (part === '..') st.pop();
        else st.push(part);
    }
    return '/' + st.join('/');
};`,
        },
      },
    ],
  },

  'basic-calculator-ii': {
    pattern: 'Stack of signed terms (apply * and / immediately, add everything at the end)',
    approaches: [
      {
        level: 'Better', name: 'Stack of terms',
        idea: 'Read each number together with the operator before it. `+x` and `−x` start a new term (push `x` or `−x`); `*x` and `/x` change the last term (pop, combine, push). The answer is the sum of the stack.',
        steps: [
          'Keep `num = 0` and `op = "+"` (the operator before the current number).',
          'For each character: digits extend `num`. When a non-space operator or the end of the string is reached, apply `op` to `num`: push `num` for `+`, `−num` for `−`, or pop and push `top * num` / `top / num` (truncating toward zero) for `*` and `/`.',
          'Then remember the new operator as `op` and reset `num`.',
          'Return the sum of the stack.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'One pass over the string; the stack holds one entry per `+`/`−` term, up to O(n).',
        code: {
          java: r`class Solution {
    public int calculate(String s) {
        Deque<Integer> st = new ArrayDeque<>();
        int num = 0;
        char op = '+';
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (Character.isDigit(c)) num = num * 10 + (c - '0');
            if ((!Character.isDigit(c) && c != ' ') || i == s.length() - 1) {
                if (op == '+') st.push(num);
                else if (op == '-') st.push(-num);
                else if (op == '*') st.push(st.pop() * num);
                else st.push(st.pop() / num);
                op = c;
                num = 0;
            }
        }
        int sum = 0;
        for (int v : st) sum += v;
        return sum;
    }
}`,
          cpp: r`class Solution {
public:
    int calculate(string s) {
        vector<int> st;
        int num = 0;
        char op = '+';
        for (size_t i = 0; i < s.size(); i++) {
            char c = s[i];
            if (isdigit(c)) num = num * 10 + (c - '0');
            if ((!isdigit(c) && c != ' ') || i == s.size() - 1) {
                if (op == '+') st.push_back(num);
                else if (op == '-') st.push_back(-num);
                else if (op == '*') st.back() *= num;
                else st.back() /= num;
                op = c;
                num = 0;
            }
        }
        long long sum = 0;
        for (int v : st) sum += v;
        return (int) sum;
    }
};`,
          python: r`class Solution:
    def calculate(self, s: str) -> int:
        st, num, op = [], 0, "+"
        for i, c in enumerate(s):
            if c.isdigit():
                num = num * 10 + int(c)
            if (not c.isdigit() and c != " ") or i == len(s) - 1:
                if op == "+":
                    st.append(num)
                elif op == "-":
                    st.append(-num)
                elif op == "*":
                    st.append(st.pop() * num)
                else:
                    top = st.pop()
                    st.append(abs(top) // num * (1 if top >= 0 else -1))  # truncate toward zero
                op, num = c, 0
        return sum(st)`,
          javascript: r`var calculate = function(s) {
    const st = [];
    let num = 0, op = '+';
    for (let i = 0; i < s.length; i++) {
        const c = s[i], digit = c >= '0' && c <= '9';
        if (digit) num = num * 10 + (c.charCodeAt(0) - 48);
        if ((!digit && c !== ' ') || i === s.length - 1) {
            if (op === '+') st.push(num);
            else if (op === '-') st.push(-num);
            else if (op === '*') st.push(st.pop() * num);
            else st.push(Math.trunc(st.pop() / num));
            op = c;
            num = 0;
        }
    }
    return st.reduce((a, b) => a + b, 0);
};`,
        },
      },
      {
        level: 'Optimal', name: 'Running total plus the last term',
        idea: 'Only the most recent term can still be changed by `*` or `/`; everything before it is final. So keep `total` (finished terms) and `last` (the current term) instead of a whole stack.',
        steps: [
          'Keep `total = 0`, `last = 0`, `num = 0`, `op = "+"`.',
          'When an operator or the end is reached: for `+`/`−`, add `last` to `total` and set `last = ±num`; for `*`/`/`, set `last = last * num` or `last / num` (truncating toward zero).',
          'Then remember the new operator and reset `num`.',
          'Return `total + last`.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'One pass; four variables replace the stack.',
        code: {
          java: r`class Solution {
    public int calculate(String s) {
        int total = 0, last = 0, num = 0;
        char op = '+';
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (Character.isDigit(c)) num = num * 10 + (c - '0');
            if ((!Character.isDigit(c) && c != ' ') || i == s.length() - 1) {
                if (op == '+' || op == '-') {
                    total += last;
                    last = op == '+' ? num : -num;
                } else if (op == '*') last *= num;
                else last /= num;
                op = c;
                num = 0;
            }
        }
        return total + last;
    }
}`,
          cpp: r`class Solution {
public:
    int calculate(string s) {
        long long total = 0, last = 0, num = 0;
        char op = '+';
        for (size_t i = 0; i < s.size(); i++) {
            char c = s[i];
            if (isdigit(c)) num = num * 10 + (c - '0');
            if ((!isdigit(c) && c != ' ') || i == s.size() - 1) {
                if (op == '+' || op == '-') {
                    total += last;
                    last = op == '+' ? num : -num;
                } else if (op == '*') last *= num;
                else last /= num;
                op = c;
                num = 0;
            }
        }
        return (int) (total + last);
    }
};`,
          python: r`class Solution:
    def calculate(self, s: str) -> int:
        total = last = num = 0
        op = "+"
        for i, c in enumerate(s):
            if c.isdigit():
                num = num * 10 + int(c)
            if (not c.isdigit() and c != " ") or i == len(s) - 1:
                if op in "+-":
                    total += last
                    last = num if op == "+" else -num
                elif op == "*":
                    last *= num
                else:
                    last = abs(last) // num * (1 if last >= 0 else -1)  # truncate toward zero
                op, num = c, 0
        return total + last`,
          javascript: r`var calculate = function(s) {
    let total = 0, last = 0, num = 0, op = '+';
    for (let i = 0; i < s.length; i++) {
        const c = s[i], digit = c >= '0' && c <= '9';
        if (digit) num = num * 10 + (c.charCodeAt(0) - 48);
        if ((!digit && c !== ' ') || i === s.length - 1) {
            if (op === '+' || op === '-') {
                total += last;
                last = op === '+' ? num : -num;
            } else if (op === '*') last *= num;
            else last = Math.trunc(last / num);
            op = c;
            num = 0;
        }
    }
    return total + last;
};`,
        },
      },
    ],
  },

  'decode-string': {
    pattern: 'Stack of (partial string, repeat count) for nested brackets',
    approaches: [
      {
        level: 'Optimal', name: 'Recursive descent',
        idea: 'Decoding `k[...]` means decoding the inside first. A recursive function reads characters from a shared index until it meets `]` (or the end), and calls itself for every nested `k[`.',
        steps: [
          'Keep a shared index `i`. `decode()` builds a result string.',
          'While `i` is in range and `s[i] != "]"`: a letter is appended; digits are read into `k`, then skip `[`, call `decode()` for the inside, skip `]`, and append the inside `k` times.',
          'Return the result; the top-level call decodes the whole string.',
        ],
        time: 'O(n + L)', space: 'O(n + L)',
        why: 'Each input character is read once, and the work of copying is proportional to the output length L. The recursion depth is at most the nesting depth (≤ n), plus the output itself.',
        code: {
          java: r`class Solution {
    private int i;

    public String decodeString(String s) {
        i = 0;
        return decode(s);
    }

    private String decode(String s) {
        StringBuilder out = new StringBuilder();
        while (i < s.length() && s.charAt(i) != ']') {
            char c = s.charAt(i);
            if (Character.isLetter(c)) { out.append(c); i++; continue; }
            int k = 0;
            while (Character.isDigit(s.charAt(i))) k = k * 10 + (s.charAt(i++) - '0');
            i++; // '['
            String inner = decode(s);
            i++; // ']'
            out.append(inner.repeat(k));
        }
        return out.toString();
    }
}`,
          cpp: r`class Solution {
    size_t i = 0;
    string decode(const string& s) {
        string out;
        while (i < s.size() && s[i] != ']') {
            if (isalpha(s[i])) { out += s[i++]; continue; }
            int k = 0;
            while (isdigit(s[i])) k = k * 10 + (s[i++] - '0');
            i++; // '['
            string inner = decode(s);
            i++; // ']'
            while (k--) out += inner;
        }
        return out;
    }
public:
    string decodeString(string s) {
        i = 0;
        return decode(s);
    }
};`,
          python: r`class Solution:
    def decodeString(self, s: str) -> str:
        i = 0
        def decode():
            nonlocal i
            out = []
            while i < len(s) and s[i] != "]":
                if s[i].isalpha():
                    out.append(s[i])
                    i += 1
                    continue
                k = 0
                while s[i].isdigit():
                    k = k * 10 + int(s[i])
                    i += 1
                i += 1  # '['
                inner = decode()
                i += 1  # ']'
                out.append(inner * k)
            return "".join(out)
        return decode()`,
          javascript: r`var decodeString = function(s) {
    let i = 0;
    const decode = () => {
        let out = '';
        while (i < s.length && s[i] !== ']') {
            if (/[a-z]/.test(s[i])) { out += s[i++]; continue; }
            let k = 0;
            while (s[i] >= '0' && s[i] <= '9') k = k * 10 + Number(s[i++]);
            i++; // '['
            const inner = decode();
            i++; // ']'
            out += inner.repeat(k);
        }
        return out;
    };
    return decode();
};`,
        },
      },
      {
        level: 'Optimal', name: 'Explicit stack of (text so far, count)',
        idea: 'The same idea without recursion. On `[`, save the text built so far and the repeat count, and start a fresh piece. On `]`, the fresh piece is complete: repeat it and append it to the saved text.',
        steps: [
          'Keep `cur` (text being built) and `k` (number being read), plus two stacks.',
          'Digit: `k = k * 10 + digit`. Letter: append to `cur`.',
          '`[`: push `cur` and `k`, then reset both.',
          '`]`: pop `prev` and `count`; set `cur = prev + cur repeated count`. Return `cur` at the end.',
        ],
        time: 'O(n + L)', space: 'O(n + L)',
        why: 'Same work as the recursive version: each character is read once and the copying is proportional to the output length L. The stacks hold at most one entry per nesting level.',
        code: {
          java: r`class Solution {
    public String decodeString(String s) {
        Deque<StringBuilder> texts = new ArrayDeque<>();
        Deque<Integer> counts = new ArrayDeque<>();
        StringBuilder cur = new StringBuilder();
        int k = 0;
        for (char c : s.toCharArray()) {
            if (Character.isDigit(c)) k = k * 10 + (c - '0');
            else if (c == '[') {
                texts.push(cur);
                counts.push(k);
                cur = new StringBuilder();
                k = 0;
            } else if (c == ']') {
                StringBuilder prev = texts.pop();
                prev.append(cur.toString().repeat(counts.pop()));
                cur = prev;
            } else cur.append(c);
        }
        return cur.toString();
    }
}`,
          cpp: r`class Solution {
public:
    string decodeString(string s) {
        vector<string> texts;
        vector<int> counts;
        string cur;
        int k = 0;
        for (char c : s) {
            if (isdigit(c)) k = k * 10 + (c - '0');
            else if (c == '[') {
                texts.push_back(cur);
                counts.push_back(k);
                cur.clear();
                k = 0;
            } else if (c == ']') {
                string prev = texts.back(); texts.pop_back();
                int count = counts.back(); counts.pop_back();
                while (count--) prev += cur;
                cur = prev;
            } else cur += c;
        }
        return cur;
    }
};`,
          python: r`class Solution:
    def decodeString(self, s: str) -> str:
        stack, cur, k = [], "", 0
        for c in s:
            if c.isdigit():
                k = k * 10 + int(c)
            elif c == "[":
                stack.append((cur, k))
                cur, k = "", 0
            elif c == "]":
                prev, count = stack.pop()
                cur = prev + cur * count
            else:
                cur += c
        return cur`,
          javascript: r`var decodeString = function(s) {
    const stack = [];
    let cur = '', k = 0;
    for (const c of s) {
        if (c >= '0' && c <= '9') k = k * 10 + Number(c);
        else if (c === '[') {
            stack.push([cur, k]);
            cur = '';
            k = 0;
        } else if (c === ']') {
            const [prev, count] = stack.pop();
            cur = prev + cur.repeat(count);
        } else cur += c;
    }
    return cur;
};`,
        },
      },
    ],
  },

  'longest-valid-parentheses': {
    pattern: 'Stack of indices with a "last unmatched" base, or two counter scans',
    approaches: [
      {
        level: 'Brute force', name: 'Check every even-length substring',
        idea: 'Test every substring with a balance counter; keep the longest that is well-formed.',
        steps: [
          'For each start `i`, walk `j` to the right keeping `balance` (+1 for `(`, −1 for `)`).',
          'If `balance` drops below 0, no longer substring from `i` can be valid: stop.',
          'Whenever `balance == 0`, `s[i..j]` is valid: update the best with `j − i + 1`.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'n starts, each scanning up to n characters. (Checking each substring from scratch would be O(n³); extending the balance avoids that.)',
        code: {
          java: r`class Solution {
    public int longestValidParentheses(String s) {
        int n = s.length(), best = 0;
        for (int i = 0; i < n; i++) {
            int balance = 0;
            for (int j = i; j < n; j++) {
                balance += s.charAt(j) == '(' ? 1 : -1;
                if (balance < 0) break;
                if (balance == 0) best = Math.max(best, j - i + 1);
            }
        }
        return best;
    }
}`,
          cpp: r`class Solution {
public:
    int longestValidParentheses(string s) {
        int n = s.size(), best = 0;
        for (int i = 0; i < n; i++) {
            int balance = 0;
            for (int j = i; j < n; j++) {
                balance += s[j] == '(' ? 1 : -1;
                if (balance < 0) break;
                if (balance == 0) best = max(best, j - i + 1);
            }
        }
        return best;
    }
};`,
          python: r`class Solution:
    def longestValidParentheses(self, s: str) -> int:
        n, best = len(s), 0
        for i in range(n):
            balance = 0
            for j in range(i, n):
                balance += 1 if s[j] == "(" else -1
                if balance < 0:
                    break
                if balance == 0:
                    best = max(best, j - i + 1)
        return best`,
          javascript: r`var longestValidParentheses = function(s) {
    const n = s.length;
    let best = 0;
    for (let i = 0; i < n; i++) {
        let balance = 0;
        for (let j = i; j < n; j++) {
            balance += s[j] === '(' ? 1 : -1;
            if (balance < 0) break;
            if (balance === 0) best = Math.max(best, j - i + 1);
        }
    }
    return best;
};`,
        },
      },
      {
        level: 'Better', name: 'Stack of indices',
        idea: 'Keep a stack of indices whose bottom is the last position that cannot be part of a valid run (start with −1). A `)` pops its matching `(`; the valid run ending here then starts right after the new top.',
        steps: [
          'Push −1.',
          'For each `i`: if `s[i] == "("`, push `i`.',
          'Otherwise pop. If the stack is now empty, this `)` is unmatched: push `i` as the new base. Otherwise update the best with `i − top`.',
          'Return the best.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Each index is pushed and popped at most once; the stack can hold up to n indices.',
        code: {
          java: r`class Solution {
    public int longestValidParentheses(String s) {
        Deque<Integer> st = new ArrayDeque<>();
        st.push(-1);
        int best = 0;
        for (int i = 0; i < s.length(); i++) {
            if (s.charAt(i) == '(') st.push(i);
            else {
                st.pop();
                if (st.isEmpty()) st.push(i);
                else best = Math.max(best, i - st.peek());
            }
        }
        return best;
    }
}`,
          cpp: r`class Solution {
public:
    int longestValidParentheses(string s) {
        vector<int> st{-1};
        int best = 0;
        for (int i = 0; i < (int) s.size(); i++) {
            if (s[i] == '(') st.push_back(i);
            else {
                st.pop_back();
                if (st.empty()) st.push_back(i);
                else best = max(best, i - st.back());
            }
        }
        return best;
    }
};`,
          python: r`class Solution:
    def longestValidParentheses(self, s: str) -> int:
        st, best = [-1], 0
        for i, c in enumerate(s):
            if c == "(":
                st.append(i)
            else:
                st.pop()
                if not st:
                    st.append(i)
                else:
                    best = max(best, i - st[-1])
        return best`,
          javascript: r`var longestValidParentheses = function(s) {
    const st = [-1];
    let best = 0;
    for (let i = 0; i < s.length; i++) {
        if (s[i] === '(') st.push(i);
        else {
            st.pop();
            if (st.length === 0) st.push(i);
            else best = Math.max(best, i - st[st.length - 1]);
        }
    }
    return best;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Two scans with open/close counters',
        idea: 'Scanning left to right, count `(` and `)`. Equal counts mean a valid run; more `)` than `(` means the run is broken, so reset. This misses runs with extra `(` (like `(()`), so scan right to left too with the roles swapped.',
        steps: [
          'Left to right: count `open` and `close`. If equal, update the best with `2·close`; if `close > open`, reset both to 0.',
          'Right to left: same, but update when equal and reset when `open > close`.',
          'Return the best.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'Two linear scans with two counters. Every valid run is caught by one of the two scans: a left-to-right scan only fails when there are unmatched `(` before the run ends, and those are exactly the cases the reverse scan handles.',
        code: {
          java: r`class Solution {
    public int longestValidParentheses(String s) {
        int best = 0, open = 0, close = 0, n = s.length();
        for (int i = 0; i < n; i++) {
            if (s.charAt(i) == '(') open++; else close++;
            if (open == close) best = Math.max(best, 2 * close);
            else if (close > open) open = close = 0;
        }
        open = close = 0;
        for (int i = n - 1; i >= 0; i--) {
            if (s.charAt(i) == '(') open++; else close++;
            if (open == close) best = Math.max(best, 2 * open);
            else if (open > close) open = close = 0;
        }
        return best;
    }
}`,
          cpp: r`class Solution {
public:
    int longestValidParentheses(string s) {
        int best = 0, open = 0, close = 0, n = s.size();
        for (int i = 0; i < n; i++) {
            if (s[i] == '(') open++; else close++;
            if (open == close) best = max(best, 2 * close);
            else if (close > open) open = close = 0;
        }
        open = close = 0;
        for (int i = n - 1; i >= 0; i--) {
            if (s[i] == '(') open++; else close++;
            if (open == close) best = max(best, 2 * open);
            else if (open > close) open = close = 0;
        }
        return best;
    }
};`,
          python: r`class Solution:
    def longestValidParentheses(self, s: str) -> int:
        best = 0
        for chars, opener in ((s, "("), (reversed(s), ")")):
            here = away = 0
            for c in chars:
                if c == opener:
                    here += 1
                else:
                    away += 1
                if here == away:
                    best = max(best, 2 * away)
                elif away > here:
                    here = away = 0
        return best`,
          javascript: r`var longestValidParentheses = function(s) {
    let best = 0, open = 0, close = 0;
    const n = s.length;
    for (let i = 0; i < n; i++) {
        if (s[i] === '(') open++; else close++;
        if (open === close) best = Math.max(best, 2 * close);
        else if (close > open) open = close = 0;
    }
    open = close = 0;
    for (let i = n - 1; i >= 0; i--) {
        if (s[i] === '(') open++; else close++;
        if (open === close) best = Math.max(best, 2 * open);
        else if (open > close) open = close = 0;
    }
    return best;
};`,
        },
      },
    ],
  },
  'baseball-game': {
    pattern: 'Stack of recent values (undo = pop)',
    approaches: [
      {
        level: 'Brute force', name: 'List with removals at the end',
        idea: 'Keep the scores in a plain list, look back by index, and recompute the total at the end.',
        steps: [
          'For each operation, append, double, add the last two, or delete the last element of the list.',
          'Sum the list at the end.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'A dynamic list used only at its end already behaves like a stack, so this is linear too. It is the same idea with less explicit structure.',
        code: {
          java: r`class Solution {
    public int calPoints(String[] operations) {
        List<Integer> rec = new ArrayList<>();
        for (String op : operations) {
            int n = rec.size();
            switch (op) {
                case "+": rec.add(rec.get(n - 1) + rec.get(n - 2)); break;
                case "D": rec.add(2 * rec.get(n - 1)); break;
                case "C": rec.remove(n - 1); break;
                default: rec.add(Integer.parseInt(op));
            }
        }
        int sum = 0;
        for (int x : rec) sum += x;
        return sum;
    }
}`,
          cpp: r`class Solution {
public:
    int calPoints(vector<string>& operations) {
        vector<int> rec;
        for (const string& op : operations) {
            int n = rec.size();
            if (op == "+") rec.push_back(rec[n - 1] + rec[n - 2]);
            else if (op == "D") rec.push_back(2 * rec[n - 1]);
            else if (op == "C") rec.pop_back();
            else rec.push_back(stoi(op));
        }
        return accumulate(rec.begin(), rec.end(), 0);
    }
};`,
          python: r`class Solution:
    def calPoints(self, operations: List[str]) -> int:
        rec = []
        for op in operations:
            if op == '+':
                rec.append(rec[-1] + rec[-2])
            elif op == 'D':
                rec.append(2 * rec[-1])
            elif op == 'C':
                rec.pop()
            else:
                rec.append(int(op))
        return sum(rec)`,
          javascript: r`var calPoints = function(operations) {
    const rec = [];
    for (const op of operations) {
        const n = rec.length;
        if (op === "+") rec.push(rec[n - 1] + rec[n - 2]);
        else if (op === "D") rec.push(2 * rec[n - 1]);
        else if (op === "C") rec.pop();
        else rec.push(Number(op));
    }
    return rec.reduce((a, b) => a + b, 0);
};`,
        },
      },
      {
        level: 'Optimal', name: 'Stack with a running total',
        idea: 'Push scores on a stack and keep the total up to date as you go, so no final pass is needed.',
        steps: [
          'For a number, push it and add it to `total`. For "D", push twice the top and add it.',
          'For "+", pop the top `a`, peek `b`, push `a` back, push `a + b` and add it.',
          'For "C", pop the top and subtract it. Return `total`.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Each operation is O(1). Only the most recent scores are ever read, which is exactly what a stack provides, and "C" is a pop. The stack can hold up to n scores.',
        code: {
          java: r`class Solution {
    public int calPoints(String[] operations) {
        Deque<Integer> st = new ArrayDeque<>();
        int total = 0;
        for (String op : operations) {
            int v;
            if (op.equals("C")) { total -= st.pop(); continue; }
            if (op.equals("+")) { int a = st.pop(); v = a + st.peek(); st.push(a); }
            else if (op.equals("D")) v = 2 * st.peek();
            else v = Integer.parseInt(op);
            st.push(v);
            total += v;
        }
        return total;
    }
}`,
          cpp: r`class Solution {
public:
    int calPoints(vector<string>& operations) {
        stack<int> st;
        int total = 0;
        for (const string& op : operations) {
            int v;
            if (op == "C") { total -= st.top(); st.pop(); continue; }
            if (op == "+") { int a = st.top(); st.pop(); v = a + st.top(); st.push(a); }
            else if (op == "D") v = 2 * st.top();
            else v = stoi(op);
            st.push(v);
            total += v;
        }
        return total;
    }
};`,
          python: r`class Solution:
    def calPoints(self, operations: List[str]) -> int:
        st, total = [], 0
        for op in operations:
            if op == 'C':
                total -= st.pop()
                continue
            if op == '+':
                v = st[-1] + st[-2]
            elif op == 'D':
                v = 2 * st[-1]
            else:
                v = int(op)
            st.append(v)
            total += v
        return total`,
          javascript: r`var calPoints = function(operations) {
    const st = [];
    let total = 0;
    for (const op of operations) {
        if (op === "C") { total -= st.pop(); continue; }
        let v;
        if (op === "+") v = st[st.length - 1] + st[st.length - 2];
        else if (op === "D") v = 2 * st[st.length - 1];
        else v = Number(op);
        st.push(v);
        total += v;
    }
    return total;
};`,
        },
      },
    ],
  },
  'car-fleet': {
    pattern: 'Sort by position, then a monotonic stack of arrival times',
    approaches: [
      {
        level: 'Brute force', name: 'Check every car ahead',
        idea: 'A car leads a fleet exactly when no car in front of it arrives later (or at the same time) on its own. Check that for each car by scanning all the others.',
        steps: [
          'Compute each car\'s solo time `t[i] = (target − position[i]) / speed[i]`.',
          'Car `i` starts a fleet if no car `j` with `position[j] > position[i]` has `t[j] >= t[i]`.',
          'Count such cars.',
        ],
        time: 'O(n²)', space: 'O(n)',
        why: 'If some car ahead is no faster to arrive, car `i` catches it (or the fleet it is in) before or at `target`. Otherwise car `i` is never blocked. Correct, but 10¹⁰ checks for n = 10⁵.',
        code: {
          java: r`class Solution {
    public int carFleet(int target, int[] position, int[] speed) {
        int n = position.length, fleets = 0;
        double[] t = new double[n];
        for (int i = 0; i < n; i++) t[i] = (double) (target - position[i]) / speed[i];
        for (int i = 0; i < n; i++) {
            boolean blocked = false;
            for (int j = 0; j < n && !blocked; j++)
                if (position[j] > position[i] && t[j] >= t[i]) blocked = true;
            if (!blocked) fleets++;
        }
        return fleets;
    }
}`,
          cpp: r`class Solution {
public:
    int carFleet(int target, vector<int>& position, vector<int>& speed) {
        int n = position.size(), fleets = 0;
        vector<double> t(n);
        for (int i = 0; i < n; i++) t[i] = (double) (target - position[i]) / speed[i];
        for (int i = 0; i < n; i++) {
            bool blocked = false;
            for (int j = 0; j < n && !blocked; j++)
                if (position[j] > position[i] && t[j] >= t[i]) blocked = true;
            if (!blocked) fleets++;
        }
        return fleets;
    }
};`,
          python: r`class Solution:
    def carFleet(self, target: int, position: List[int], speed: List[int]) -> int:
        n = len(position)
        t = [(target - p) / s for p, s in zip(position, speed)]
        return sum(1 for i in range(n)
                   if not any(position[j] > position[i] and t[j] >= t[i] for j in range(n)))`,
          javascript: r`var carFleet = function(target, position, speed) {
    const n = position.length;
    const t = position.map((p, i) => (target - p) / speed[i]);
    let fleets = 0;
    for (let i = 0; i < n; i++) {
        let blocked = false;
        for (let j = 0; j < n && !blocked; j++)
            if (position[j] > position[i] && t[j] >= t[i]) blocked = true;
        if (!blocked) fleets++;
    }
    return fleets;
};`,
        },
      },
      {
        level: 'Better', name: 'Sort, then a stack of fleet times',
        idea: 'Visit cars from the closest to `target` backwards. Push each car\'s solo time; if it is not more than the fleet time on top of the stack, the car merges into that fleet and is popped again.',
        steps: [
          'Pair each position with its speed and sort by position, descending.',
          'For each car compute its time `t`. If the stack is not empty and `t <=` the top, the car catches that fleet and merges: skip it. Otherwise push `t` as a new fleet.',
          'The stack size is the number of fleets.',
        ],
        time: 'O(n log n)', space: 'O(n)',
        why: 'A merged car takes on the fleet\'s (slower) time, so only each fleet\'s leading time matters. The stack is strictly increasing from bottom to top, which is the monotonic-stack shape.',
        code: {
          java: r`class Solution {
    public int carFleet(int target, int[] position, int[] speed) {
        int n = position.length;
        Integer[] idx = new Integer[n];
        for (int i = 0; i < n; i++) idx[i] = i;
        Arrays.sort(idx, (a, b) -> position[b] - position[a]);
        Deque<Double> st = new ArrayDeque<>();
        for (int i : idx) {
            double t = (double) (target - position[i]) / speed[i];
            if (!st.isEmpty() && t <= st.peek()) continue;
            st.push(t);
        }
        return st.size();
    }
}`,
          cpp: r`class Solution {
public:
    int carFleet(int target, vector<int>& position, vector<int>& speed) {
        int n = position.size();
        vector<pair<int, int>> cars(n);
        for (int i = 0; i < n; i++) cars[i] = {position[i], speed[i]};
        sort(cars.rbegin(), cars.rend());
        vector<double> st;
        for (auto& [p, s] : cars) {
            double t = (double) (target - p) / s;
            if (!st.empty() && t <= st.back()) continue;
            st.push_back(t);
        }
        return st.size();
    }
};`,
          python: r`class Solution:
    def carFleet(self, target: int, position: List[int], speed: List[int]) -> int:
        st = []
        for p, s in sorted(zip(position, speed), reverse=True):
            t = (target - p) / s
            if st and t <= st[-1]:
                continue
            st.append(t)
        return len(st)`,
          javascript: r`var carFleet = function(target, position, speed) {
    const cars = position.map((p, i) => [p, speed[i]]).sort((a, b) => b[0] - a[0]);
    const st = [];
    for (const [p, s] of cars) {
        const t = (target - p) / s;
        if (st.length && t <= st[st.length - 1]) continue;
        st.push(t);
    }
    return st.length;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Bucket by position, keep only the slowest time',
        idea: 'Positions are integers below `target`, so place each car in an array indexed by position instead of sorting. Then sweep from `target` down, keeping just the time of the fleet in front.',
        steps: [
          'Make `time[p]` for `p` in `[0, target)`, filled with 0, and set `time[position[i]]` to car `i`\'s solo time.',
          'Sweep `p` from `target − 1` down to 0 with `slowest = 0`.',
          'When `time[p] > slowest`, a new fleet starts: count it and set `slowest = time[p]`.',
        ],
        time: 'O(n + target)', space: 'O(target)',
        why: 'Counting-sort by position removes the log factor; it is a win when `target` is not much larger than n (here up to 10⁶). The stack is replaced by one variable, because a new fleet only ever compares with the fleet directly ahead. Equal times merge (`>` not `>=`), matching "catches up exactly at target".',
        code: {
          java: r`class Solution {
    public int carFleet(int target, int[] position, int[] speed) {
        double[] time = new double[target];
        for (int i = 0; i < position.length; i++) time[position[i]] = (double) (target - position[i]) / speed[i];
        int fleets = 0;
        double slowest = 0;
        for (int p = target - 1; p >= 0; p--) {
            if (time[p] > slowest) { fleets++; slowest = time[p]; }
        }
        return fleets;
    }
}`,
          cpp: r`class Solution {
public:
    int carFleet(int target, vector<int>& position, vector<int>& speed) {
        vector<double> time(target, 0);
        for (size_t i = 0; i < position.size(); i++) time[position[i]] = (double) (target - position[i]) / speed[i];
        int fleets = 0;
        double slowest = 0;
        for (int p = target - 1; p >= 0; p--) {
            if (time[p] > slowest) { fleets++; slowest = time[p]; }
        }
        return fleets;
    }
};`,
          python: r`class Solution:
    def carFleet(self, target: int, position: List[int], speed: List[int]) -> int:
        time = [0.0] * target
        for p, s in zip(position, speed):
            time[p] = (target - p) / s
        fleets, slowest = 0, 0.0
        for p in range(target - 1, -1, -1):
            if time[p] > slowest:
                fleets += 1
                slowest = time[p]
        return fleets`,
          javascript: r`var carFleet = function(target, position, speed) {
    const time = new Float64Array(target);
    for (let i = 0; i < position.length; i++) time[position[i]] = (target - position[i]) / speed[i];
    let fleets = 0, slowest = 0;
    for (let p = target - 1; p >= 0; p--) {
        if (time[p] > slowest) { fleets++; slowest = time[p]; }
    }
    return fleets;
};`,
        },
      },
    ],
  },
};
