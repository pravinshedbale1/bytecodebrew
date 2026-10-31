const r = String.raw;

export default {
  'sort-list': {
    pattern: 'Divide and conquer: merge sort on a linked list (split at the middle, sort halves, merge)',
    approaches: [
      {
        level: 'Brute force', name: 'Insertion sort by relinking',
        idea: 'Build a sorted list one node at a time: take each node from the input and walk the sorted list to find where it belongs.',
        steps: [
          'Start with an empty sorted list behind a dummy head.',
          'For each node in the input, walk from the dummy until the next node is larger, and splice the node in there.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'Each insertion may walk the whole sorted list, so 5 × 10⁴ nodes means about 10⁹ steps in the worst case. Correct, but too slow for the performance test.',
        code: {
          java: r`class Solution {
    public ListNode sortList(ListNode head) {
        ListNode dummy = new ListNode(Integer.MIN_VALUE);
        while (head != null) {
            ListNode next = head.next, at = dummy;
            while (at.next != null && at.next.val < head.val) at = at.next;
            head.next = at.next;
            at.next = head;
            head = next;
        }
        return dummy.next;
    }
}`,
          cpp: r`class Solution {
public:
    ListNode* sortList(ListNode* head) {
        ListNode dummy(INT_MIN);
        while (head) {
            ListNode* next = head->next;
            ListNode* at = &dummy;
            while (at->next && at->next->val < head->val) at = at->next;
            head->next = at->next;
            at->next = head;
            head = next;
        }
        return dummy.next;
    }
};`,
          python: r`class Solution:
    def sortList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        dummy = ListNode(float('-inf'))
        while head:
            nxt, at = head.next, dummy
            while at.next and at.next.val < head.val:
                at = at.next
            head.next = at.next
            at.next = head
            head = nxt
        return dummy.next`,
          javascript: r`var sortList = function(head) {
    const dummy = new ListNode(-Infinity);
    while (head) {
        const next = head.next;
        let at = dummy;
        while (at.next && at.next.val < head.val) at = at.next;
        head.next = at.next;
        at.next = head;
        head = next;
    }
    return dummy.next;
};`,
        },
      },
      {
        level: 'Better', name: 'Copy values to an array and sort',
        idea: 'Read the values into an array, sort it with the library sort, and write the sorted values back into the nodes in order.',
        steps: [
          'Walk the list and collect every value.',
          'Sort the array.',
          'Walk the list again, overwriting each node\'s value with the next sorted value.',
        ],
        time: 'O(n log n)', space: 'O(n)',
        why: 'Fast and simple, and often acceptable in practice. It misses the follow-up (O(1) extra memory), and it changes node values instead of relinking nodes, which an interviewer may disallow.',
        code: {
          java: r`class Solution {
    public ListNode sortList(ListNode head) {
        List<Integer> vals = new ArrayList<>();
        for (ListNode p = head; p != null; p = p.next) vals.add(p.val);
        Collections.sort(vals);
        int i = 0;
        for (ListNode p = head; p != null; p = p.next) p.val = vals.get(i++);
        return head;
    }
}`,
          cpp: r`class Solution {
public:
    ListNode* sortList(ListNode* head) {
        vector<int> vals;
        for (ListNode* p = head; p; p = p->next) vals.push_back(p->val);
        sort(vals.begin(), vals.end());
        int i = 0;
        for (ListNode* p = head; p; p = p->next) p->val = vals[i++];
        return head;
    }
};`,
          python: r`class Solution:
    def sortList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        vals = []
        p = head
        while p:
            vals.append(p.val)
            p = p.next
        vals.sort()
        p = head
        for v in vals:
            p.val = v
            p = p.next
        return head`,
          javascript: r`var sortList = function(head) {
    const vals = [];
    for (let p = head; p; p = p.next) vals.push(p.val);
    vals.sort((a, b) => a - b);
    let i = 0;
    for (let p = head; p; p = p.next) p.val = vals[i++];
    return head;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Merge sort: split with slow/fast pointers, merge by relinking',
        idea: 'Divide: find the middle with slow and fast pointers and cut the list in two. Conquer: sort each half recursively. Combine: merge two sorted lists by relinking nodes behind a dummy head.',
        steps: [
          'A list of 0 or 1 nodes is sorted.',
          'Move `slow` one step and `fast` two steps (starting `fast` at `head.next`) so `slow` stops at the end of the first half; cut after it.',
          'Sort both halves recursively.',
          'Merge: repeatedly attach the smaller head to the tail of the result, then append whatever remains.',
        ],
        time: 'O(n log n)', space: 'O(log n)',
        why: 'log n levels of splitting, O(n) merging per level. The only extra memory is the recursion stack. For strictly O(1) space, run merge sort bottom-up: merge adjacent runs of length 1, then 2, 4, … iteratively.',
        code: {
          java: r`class Solution {
    public ListNode sortList(ListNode head) {
        if (head == null || head.next == null) return head;
        ListNode slow = head, fast = head.next;
        while (fast != null && fast.next != null) { slow = slow.next; fast = fast.next.next; }
        ListNode second = slow.next;
        slow.next = null;
        return merge(sortList(head), sortList(second));
    }
    private ListNode merge(ListNode a, ListNode b) {
        ListNode dummy = new ListNode(0), tail = dummy;
        while (a != null && b != null) {
            if (a.val <= b.val) { tail.next = a; a = a.next; } else { tail.next = b; b = b.next; }
            tail = tail.next;
        }
        tail.next = a != null ? a : b;
        return dummy.next;
    }
}`,
          cpp: r`class Solution {
    ListNode* merge(ListNode* a, ListNode* b) {
        ListNode dummy(0);
        ListNode* tail = &dummy;
        while (a && b) {
            if (a->val <= b->val) { tail->next = a; a = a->next; } else { tail->next = b; b = b->next; }
            tail = tail->next;
        }
        tail->next = a ? a : b;
        return dummy.next;
    }
public:
    ListNode* sortList(ListNode* head) {
        if (!head || !head->next) return head;
        ListNode *slow = head, *fast = head->next;
        while (fast && fast->next) { slow = slow->next; fast = fast->next->next; }
        ListNode* second = slow->next;
        slow->next = nullptr;
        return merge(sortList(head), sortList(second));
    }
};`,
          python: r`class Solution:
    def sortList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        if not head or not head.next:
            return head
        slow, fast = head, head.next
        while fast and fast.next:
            slow, fast = slow.next, fast.next.next
        second = slow.next
        slow.next = None
        a, b = self.sortList(head), self.sortList(second)
        dummy = tail = ListNode(0)
        while a and b:
            if a.val <= b.val:
                tail.next, a = a, a.next
            else:
                tail.next, b = b, b.next
            tail = tail.next
        tail.next = a or b
        return dummy.next`,
          javascript: r`var sortList = function(head) {
    if (!head || !head.next) return head;
    let slow = head, fast = head.next;
    while (fast && fast.next) { slow = slow.next; fast = fast.next.next; }
    const second = slow.next;
    slow.next = null;
    let a = sortList(head), b = sortList(second);
    const dummy = new ListNode(0);
    let tail = dummy;
    while (a && b) {
        if (a.val <= b.val) { tail.next = a; a = a.next; } else { tail.next = b; b = b.next; }
        tail = tail.next;
    }
    tail.next = a || b;
    return dummy.next;
};`,
        },
      },
    ],
  },

  'different-ways-to-add-parentheses': {
    pattern: 'Divide and conquer on the last operator applied, with memoisation',
    approaches: [
      {
        level: 'Better', name: 'Split at every operator, recursively',
        idea: 'Any full parenthesisation applies some operator last. For each operator, compute every result of the left side and every result of the right side, then combine each pair. A string with no operator is a number.',
        steps: [
          'For each operator at index i: left = all results of expression[0..i), right = all results of expression(i..].',
          'Add `a op b` for every a in left and b in right.',
          'If no operator was found, return the number itself.',
        ],
        time: 'O(Cₙ · n)', space: 'O(Cₙ · n)',
        why: 'Cₙ is the n-th Catalan number, the count of groupings for n operators; the answer itself has that many values, so no algorithm can beat its size. Without memoisation, the same sub-expressions are recomputed under many different splits.',
        code: {
          java: r`class Solution {
    public List<Integer> diffWaysToCompute(String expression) {
        List<Integer> res = new ArrayList<>();
        for (int i = 0; i < expression.length(); i++) {
            char c = expression.charAt(i);
            if (c != '+' && c != '-' && c != '*') continue;
            for (int a : diffWaysToCompute(expression.substring(0, i)))
                for (int b : diffWaysToCompute(expression.substring(i + 1)))
                    res.add(c == '+' ? a + b : c == '-' ? a - b : a * b);
        }
        if (res.isEmpty()) res.add(Integer.parseInt(expression));
        return res;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> diffWaysToCompute(string expression) {
        vector<int> res;
        for (int i = 0; i < (int)expression.size(); i++) {
            char c = expression[i];
            if (c != '+' && c != '-' && c != '*') continue;
            vector<int> left = diffWaysToCompute(expression.substr(0, i));
            vector<int> right = diffWaysToCompute(expression.substr(i + 1));
            for (int a : left)
                for (int b : right)
                    res.push_back(c == '+' ? a + b : c == '-' ? a - b : a * b);
        }
        if (res.empty()) res.push_back(stoi(expression));
        return res;
    }
};`,
          python: r`class Solution:
    def diffWaysToCompute(self, expression: str) -> List[int]:
        res = []
        for i, c in enumerate(expression):
            if c in '+-*':
                for a in self.diffWaysToCompute(expression[:i]):
                    for b in self.diffWaysToCompute(expression[i + 1:]):
                        res.append(a + b if c == '+' else a - b if c == '-' else a * b)
        return res or [int(expression)]`,
          javascript: r`var diffWaysToCompute = function(expression) {
    const res = [];
    for (let i = 0; i < expression.length; i++) {
        const c = expression[i];
        if (c !== '+' && c !== '-' && c !== '*') continue;
        for (const a of diffWaysToCompute(expression.slice(0, i)))
            for (const b of diffWaysToCompute(expression.slice(i + 1)))
                res.push(c === '+' ? a + b : c === '-' ? a - b : a * b);
    }
    if (!res.length) res.push(Number(expression));
    return res;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Same split, memoised by substring',
        idea: 'The recursion asks for the same sub-expressions over and over (for example the middle part of a long expression). Cache each substring\'s list of results so each is computed once.',
        steps: [
          'Before computing a substring, return its cached list if present.',
          'Otherwise split at each operator as before, combine the results, and cache the list.',
        ],
        time: 'O(Cₙ · n)', space: 'O(Cₙ · n)',
        why: 'There are only O(n²) distinct substrings, so repeated work disappears; the remaining cost is producing the answer itself, which has Catalan-many values. Memoising on (start, end) indices instead of substrings avoids building strings.',
        code: {
          java: r`class Solution {
    private final Map<String, List<Integer>> memo = new HashMap<>();
    public List<Integer> diffWaysToCompute(String expression) {
        List<Integer> cached = memo.get(expression);
        if (cached != null) return cached;
        List<Integer> res = new ArrayList<>();
        for (int i = 0; i < expression.length(); i++) {
            char c = expression.charAt(i);
            if (c != '+' && c != '-' && c != '*') continue;
            for (int a : diffWaysToCompute(expression.substring(0, i)))
                for (int b : diffWaysToCompute(expression.substring(i + 1)))
                    res.add(c == '+' ? a + b : c == '-' ? a - b : a * b);
        }
        if (res.isEmpty()) res.add(Integer.parseInt(expression));
        memo.put(expression, res);
        return res;
    }
}`,
          cpp: r`class Solution {
    unordered_map<string, vector<int>> memo;
public:
    vector<int> diffWaysToCompute(string expression) {
        auto it = memo.find(expression);
        if (it != memo.end()) return it->second;
        vector<int> res;
        for (int i = 0; i < (int)expression.size(); i++) {
            char c = expression[i];
            if (c != '+' && c != '-' && c != '*') continue;
            vector<int> left = diffWaysToCompute(expression.substr(0, i));
            vector<int> right = diffWaysToCompute(expression.substr(i + 1));
            for (int a : left)
                for (int b : right)
                    res.push_back(c == '+' ? a + b : c == '-' ? a - b : a * b);
        }
        if (res.empty()) res.push_back(stoi(expression));
        return memo[expression] = res;
    }
};`,
          python: r`class Solution:
    def diffWaysToCompute(self, expression: str) -> List[int]:
        @cache
        def solve(expr):
            res = []
            for i, c in enumerate(expr):
                if c in '+-*':
                    for a in solve(expr[:i]):
                        for b in solve(expr[i + 1:]):
                            res.append(a + b if c == '+' else a - b if c == '-' else a * b)
            return res or [int(expr)]
        return solve(expression)`,
          javascript: r`var diffWaysToCompute = function(expression) {
    const memo = new Map();
    const solve = (expr) => {
        if (memo.has(expr)) return memo.get(expr);
        const res = [];
        for (let i = 0; i < expr.length; i++) {
            const c = expr[i];
            if (c !== '+' && c !== '-' && c !== '*') continue;
            for (const a of solve(expr.slice(0, i)))
                for (const b of solve(expr.slice(i + 1)))
                    res.push(c === '+' ? a + b : c === '-' ? a - b : a * b);
        }
        if (!res.length) res.push(Number(expr));
        memo.set(expr, res);
        return res;
    };
    return solve(expression);
};`,
        },
      },
    ],
  },

  'longest-substring-with-at-least-k-repeating-characters': {
    pattern: 'Divide and conquer: split the string at characters that can never be in a valid substring',
    approaches: [
      {
        level: 'Brute force', name: 'Check every substring with running counts',
        idea: 'Fix each start, extend the end one character at a time keeping counts, and after each step check whether every present character has count at least k.',
        steps: [
          'For each start i, reset a 26-entry count array.',
          'For each end j ≥ i: add s[j], then check the counts; if valid, update the best length.',
        ],
        time: 'O(26 · n²)', space: 'O(1)',
        why: 'n² substrings with a 26-step check each: about 2.6 × 10⁹ operations at n = 10⁴, too slow for the performance test.',
        code: {
          java: r`class Solution {
    public int longestSubstring(String s, int k) {
        int n = s.length(), best = 0;
        for (int i = 0; i < n; i++) {
            int[] count = new int[26];
            for (int j = i; j < n; j++) {
                count[s.charAt(j) - 'a']++;
                boolean ok = true;
                for (int c : count) if (c > 0 && c < k) { ok = false; break; }
                if (ok) best = Math.max(best, j - i + 1);
            }
        }
        return best;
    }
}`,
          cpp: r`class Solution {
public:
    int longestSubstring(string s, int k) {
        int n = s.size(), best = 0;
        for (int i = 0; i < n; i++) {
            int count[26] = {0};
            for (int j = i; j < n; j++) {
                count[s[j] - 'a']++;
                bool ok = true;
                for (int c : count) if (c > 0 && c < k) { ok = false; break; }
                if (ok) best = max(best, j - i + 1);
            }
        }
        return best;
    }
};`,
          python: r`class Solution:
    def longestSubstring(self, s: str, k: int) -> int:
        best = 0
        for i in range(len(s)):
            count = [0] * 26
            for j in range(i, len(s)):
                count[ord(s[j]) - 97] += 1
                if all(c == 0 or c >= k for c in count):
                    best = max(best, j - i + 1)
        return best`,
          javascript: r`var longestSubstring = function(s, k) {
    let best = 0;
    for (let i = 0; i < s.length; i++) {
        const count = new Array(26).fill(0);
        for (let j = i; j < s.length; j++) {
            count[s.charCodeAt(j) - 97]++;
            if (count.every((c) => c === 0 || c >= k)) best = Math.max(best, j - i + 1);
        }
    }
    return best;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Sliding window per number of distinct letters',
        idea: 'A plain sliding window fails because adding characters can both break and restore validity. Fix the number of distinct letters u (1 to 26): for each u, a window with at most u distinct letters is monotone, and it is valid when exactly u letters each reach k.',
        steps: [
          'For u = 1 … 26: slide a window keeping counts, the number of distinct letters, and how many letters have count ≥ k.',
          'Grow the right end; shrink from the left while distinct > u.',
          'If distinct == u and all u letters have count ≥ k, record the window length.',
        ],
        time: 'O(26 · n)', space: 'O(1)',
        why: 'Each of the 26 passes moves both pointers at most n times. A good alternative when the interviewer wants an iterative solution; the divide-and-conquer version below is easier to come up with.',
        code: {
          java: r`class Solution {
    public int longestSubstring(String s, int k) {
        int best = 0, n = s.length();
        for (int u = 1; u <= 26; u++) {
            int[] count = new int[26];
            int distinct = 0, atLeastK = 0, left = 0;
            for (int right = 0; right < n; right++) {
                int c = s.charAt(right) - 'a';
                if (count[c]++ == 0) distinct++;
                if (count[c] == k) atLeastK++;
                while (distinct > u) {
                    int d = s.charAt(left++) - 'a';
                    if (count[d]-- == k) atLeastK--;
                    if (count[d] == 0) distinct--;
                }
                if (distinct == u && atLeastK == u) best = Math.max(best, right - left + 1);
            }
        }
        return best;
    }
}`,
          cpp: r`class Solution {
public:
    int longestSubstring(string s, int k) {
        int best = 0, n = s.size();
        for (int u = 1; u <= 26; u++) {
            int count[26] = {0};
            int distinct = 0, atLeastK = 0, left = 0;
            for (int right = 0; right < n; right++) {
                int c = s[right] - 'a';
                if (count[c]++ == 0) distinct++;
                if (count[c] == k) atLeastK++;
                while (distinct > u) {
                    int d = s[left++] - 'a';
                    if (count[d]-- == k) atLeastK--;
                    if (count[d] == 0) distinct--;
                }
                if (distinct == u && atLeastK == u) best = max(best, right - left + 1);
            }
        }
        return best;
    }
};`,
          python: r`class Solution:
    def longestSubstring(self, s: str, k: int) -> int:
        best = 0
        for u in range(1, 27):
            count = [0] * 26
            distinct = at_least_k = left = 0
            for right, ch in enumerate(s):
                c = ord(ch) - 97
                if count[c] == 0:
                    distinct += 1
                count[c] += 1
                if count[c] == k:
                    at_least_k += 1
                while distinct > u:
                    d = ord(s[left]) - 97
                    left += 1
                    if count[d] == k:
                        at_least_k -= 1
                    count[d] -= 1
                    if count[d] == 0:
                        distinct -= 1
                if distinct == u and at_least_k == u:
                    best = max(best, right - left + 1)
        return best`,
          javascript: r`var longestSubstring = function(s, k) {
    let best = 0;
    for (let u = 1; u <= 26; u++) {
        const count = new Array(26).fill(0);
        let distinct = 0, atLeastK = 0, left = 0;
        for (let right = 0; right < s.length; right++) {
            const c = s.charCodeAt(right) - 97;
            if (count[c]++ === 0) distinct++;
            if (count[c] === k) atLeastK++;
            while (distinct > u) {
                const d = s.charCodeAt(left++) - 97;
                if (count[d]-- === k) atLeastK--;
                if (count[d] === 0) distinct--;
            }
            if (distinct === u && atLeastK === u) best = Math.max(best, right - left + 1);
        }
    }
    return best;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Divide and conquer on the "bad" characters',
        idea: 'Count letters in the current range. A letter appearing fewer than k times can\'t be in any valid substring, so split the range at every such letter and solve each piece; a range with no such letter is valid as a whole.',
        steps: [
          'If the range is shorter than k, return 0.',
          'Count each letter in the range.',
          'If every present letter has count ≥ k, return the range length.',
          'Otherwise split at each letter with count < k and return the best answer among the pieces.',
        ],
        time: 'O(26 · n)', space: 'O(26)',
        why: 'Each recursion level does O(n) total counting across its pieces, and every level removes at least one of the 26 letters from consideration, so the depth is at most 26. Splitting at every bad letter at once (not just the first) keeps the recursion shallow.',
        code: {
          java: r`class Solution {
    public int longestSubstring(String s, int k) {
        return solve(s.toCharArray(), 0, s.length(), k);
    }
    private int solve(char[] s, int lo, int hi, int k) {
        if (hi - lo < k) return 0;
        int[] count = new int[26];
        for (int i = lo; i < hi; i++) count[s[i] - 'a']++;
        boolean allGood = true;
        for (int i = lo; i < hi; i++) if (count[s[i] - 'a'] < k) { allGood = false; break; }
        if (allGood) return hi - lo;
        int best = 0, start = lo;
        for (int j = lo; j <= hi; j++) {
            if (j == hi || count[s[j] - 'a'] < k) {
                best = Math.max(best, solve(s, start, j, k));
                start = j + 1;
            }
        }
        return best;
    }
}`,
          cpp: r`class Solution {
    int solve(const string& s, int lo, int hi, int k) {
        if (hi - lo < k) return 0;
        int count[26] = {0};
        for (int i = lo; i < hi; i++) count[s[i] - 'a']++;
        bool allGood = true;
        for (int i = lo; i < hi; i++) if (count[s[i] - 'a'] < k) { allGood = false; break; }
        if (allGood) return hi - lo;
        int best = 0, start = lo;
        for (int j = lo; j <= hi; j++) {
            if (j == hi || count[s[j] - 'a'] < k) {
                best = max(best, solve(s, start, j, k));
                start = j + 1;
            }
        }
        return best;
    }
public:
    int longestSubstring(string s, int k) { return solve(s, 0, s.size(), k); }
};`,
          python: r`class Solution:
    def longestSubstring(self, s: str, k: int) -> int:
        if len(s) < k:
            return 0
        counts = Counter(s)
        for ch, c in counts.items():
            if c < k:
                return max(self.longestSubstring(part, k) for part in s.split(ch))
        return len(s)`,
          javascript: r`var longestSubstring = function(s, k) {
    const solve = (lo, hi) => {
        if (hi - lo < k) return 0;
        const count = new Array(26).fill(0);
        for (let i = lo; i < hi; i++) count[s.charCodeAt(i) - 97]++;
        let allGood = true;
        for (let i = lo; i < hi; i++) if (count[s.charCodeAt(i) - 97] < k) { allGood = false; break; }
        if (allGood) return hi - lo;
        let best = 0, start = lo;
        for (let j = lo; j <= hi; j++) {
            if (j === hi || count[s.charCodeAt(j) - 97] < k) {
                best = Math.max(best, solve(start, j));
                start = j + 1;
            }
        }
        return best;
    };
    return solve(0, s.length);
};`,
        },
      },
    ],
  },
};
