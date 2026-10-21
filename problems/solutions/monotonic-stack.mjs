const r = String.raw;

export default {
  'next-greater-element-i': {
    pattern: 'Monotonic decreasing stack (next greater element) + hash map for lookups',
    approaches: [
      {
        level: 'Brute force', name: 'Find each value in nums2 and scan to its right',
        idea: 'For each `x` in `nums1`, locate it in `nums2`, then walk right until a bigger value appears.',
        steps: [
          'For each `x` in `nums1`, find its index `j` in `nums2`.',
          'Scan `nums2[j + 1 ..]` for the first value greater than `x`.',
          'Record that value, or −1 if the scan reaches the end.',
        ],
        time: 'O(m·n)', space: 'O(1)',
        why: 'Each of the m queries may scan all n values of `nums2` (output aside).',
        code: {
          java: r`class Solution {
    public int[] nextGreaterElement(int[] nums1, int[] nums2) {
        int[] ans = new int[nums1.length];
        for (int q = 0; q < nums1.length; q++) {
            int j = 0;
            while (nums2[j] != nums1[q]) j++;
            ans[q] = -1;
            for (int k = j + 1; k < nums2.length; k++)
                if (nums2[k] > nums1[q]) { ans[q] = nums2[k]; break; }
        }
        return ans;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> nextGreaterElement(vector<int>& nums1, vector<int>& nums2) {
        vector<int> ans;
        for (int x : nums1) {
            int j = find(nums2.begin(), nums2.end(), x) - nums2.begin(), g = -1;
            for (int k = j + 1; k < (int) nums2.size(); k++)
                if (nums2[k] > x) { g = nums2[k]; break; }
            ans.push_back(g);
        }
        return ans;
    }
};`,
          python: r`class Solution:
    def nextGreaterElement(self, nums1: List[int], nums2: List[int]) -> List[int]:
        ans = []
        for x in nums1:
            j = nums2.index(x)
            ans.append(next((y for y in nums2[j + 1:] if y > x), -1))
        return ans`,
          javascript: r`var nextGreaterElement = function(nums1, nums2) {
    return nums1.map((x) => {
        const j = nums2.indexOf(x);
        for (let k = j + 1; k < nums2.length; k++) if (nums2[k] > x) return nums2[k];
        return -1;
    });
};`,
        },
      },
      {
        level: 'Optimal', name: 'Monotonic stack over nums2, answers in a map',
        idea: 'Walk `nums2` once with a stack of values still waiting for a bigger value; the stack is always decreasing. A new value is the answer for every smaller value it pops. Store those answers in a map and look up each `nums1` value.',
        steps: [
          'For each `y` in `nums2`: while the stack top is smaller than `y`, pop it and record `next[top] = y`; then push `y`.',
          'Values left on the stack have no greater value to their right.',
          'For each `x` in `nums1`, answer `next[x]` or −1.',
        ],
        time: 'O(n + m)', space: 'O(n)',
        why: 'Each value of `nums2` is pushed and popped at most once; the map and stack hold up to n values. Distinct values make the value a safe map key.',
        code: {
          java: r`class Solution {
    public int[] nextGreaterElement(int[] nums1, int[] nums2) {
        Map<Integer, Integer> next = new HashMap<>();
        Deque<Integer> st = new ArrayDeque<>();
        for (int y : nums2) {
            while (!st.isEmpty() && st.peek() < y) next.put(st.pop(), y);
            st.push(y);
        }
        int[] ans = new int[nums1.length];
        for (int i = 0; i < nums1.length; i++) ans[i] = next.getOrDefault(nums1[i], -1);
        return ans;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> nextGreaterElement(vector<int>& nums1, vector<int>& nums2) {
        unordered_map<int, int> next;
        vector<int> st;
        for (int y : nums2) {
            while (!st.empty() && st.back() < y) { next[st.back()] = y; st.pop_back(); }
            st.push_back(y);
        }
        vector<int> ans;
        for (int x : nums1) ans.push_back(next.count(x) ? next[x] : -1);
        return ans;
    }
};`,
          python: r`class Solution:
    def nextGreaterElement(self, nums1: List[int], nums2: List[int]) -> List[int]:
        nxt, st = {}, []
        for y in nums2:
            while st and st[-1] < y:
                nxt[st.pop()] = y
            st.append(y)
        return [nxt.get(x, -1) for x in nums1]`,
          javascript: r`var nextGreaterElement = function(nums1, nums2) {
    const next = new Map(), st = [];
    for (const y of nums2) {
        while (st.length && st[st.length - 1] < y) next.set(st.pop(), y);
        st.push(y);
    }
    return nums1.map((x) => next.get(x) ?? -1);
};`,
        },
      },
    ],
  },

  'daily-temperatures': {
    pattern: 'Monotonic decreasing stack of indices still waiting for a warmer day',
    approaches: [
      {
        level: 'Brute force', name: 'Scan forward from every day',
        idea: 'For each day, look at the following days one by one until one is warmer.',
        steps: [
          'For each `i`, scan `j = i + 1, i + 2, …`.',
          'At the first `j` with `temperatures[j] > temperatures[i]`, set `answer[i] = j − i`.',
          'If none is found, `answer[i]` stays 0.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'A falling sequence makes each day scan to the end (output array aside).',
        code: {
          java: r`class Solution {
    public int[] dailyTemperatures(int[] temperatures) {
        int n = temperatures.length;
        int[] answer = new int[n];
        for (int i = 0; i < n; i++)
            for (int j = i + 1; j < n; j++)
                if (temperatures[j] > temperatures[i]) { answer[i] = j - i; break; }
        return answer;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> dailyTemperatures(vector<int>& temperatures) {
        int n = temperatures.size();
        vector<int> answer(n, 0);
        for (int i = 0; i < n; i++)
            for (int j = i + 1; j < n; j++)
                if (temperatures[j] > temperatures[i]) { answer[i] = j - i; break; }
        return answer;
    }
};`,
          python: r`class Solution:
    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:
        n = len(temperatures)
        answer = [0] * n
        for i in range(n):
            for j in range(i + 1, n):
                if temperatures[j] > temperatures[i]:
                    answer[i] = j - i
                    break
        return answer`,
          javascript: r`var dailyTemperatures = function(temperatures) {
    const n = temperatures.length, answer = new Array(n).fill(0);
    for (let i = 0; i < n; i++)
        for (let j = i + 1; j < n; j++)
            if (temperatures[j] > temperatures[i]) { answer[i] = j - i; break; }
    return answer;
};`,
        },
      },
      {
        level: 'Better', name: 'Scan backwards, remembering the next day of each temperature',
        idea: 'Temperatures only range over 30..100. Walking from the last day backwards, keep `seen[t]` = the nearest later day with temperature `t`; the answer for day `i` is the nearest of `seen[t]` over all `t` warmer than today.',
        steps: [
          'Fill `seen` (size 101) with "never".',
          'For `i` from n − 1 down to 0: look at every `t` from `temperatures[i] + 1` to 100 and take the smallest `seen[t]`.',
          'If one exists, `answer[i] = thatDay − i`. Then set `seen[temperatures[i]] = i`.',
        ],
        time: 'O(n·W)', space: 'O(W)',
        why: 'Each day checks up to W = 71 possible warmer temperatures. Fast here only because the value range is tiny.',
        code: {
          java: r`class Solution {
    public int[] dailyTemperatures(int[] temperatures) {
        int n = temperatures.length;
        int[] answer = new int[n], seen = new int[101];
        Arrays.fill(seen, Integer.MAX_VALUE);
        for (int i = n - 1; i >= 0; i--) {
            int nearest = Integer.MAX_VALUE;
            for (int t = temperatures[i] + 1; t <= 100; t++) nearest = Math.min(nearest, seen[t]);
            if (nearest != Integer.MAX_VALUE) answer[i] = nearest - i;
            seen[temperatures[i]] = i;
        }
        return answer;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> dailyTemperatures(vector<int>& temperatures) {
        int n = temperatures.size();
        vector<int> answer(n, 0), seen(101, INT_MAX);
        for (int i = n - 1; i >= 0; i--) {
            int nearest = INT_MAX;
            for (int t = temperatures[i] + 1; t <= 100; t++) nearest = min(nearest, seen[t]);
            if (nearest != INT_MAX) answer[i] = nearest - i;
            seen[temperatures[i]] = i;
        }
        return answer;
    }
};`,
          python: r`class Solution:
    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:
        n = len(temperatures)
        answer, seen = [0] * n, [inf] * 101
        for i in range(n - 1, -1, -1):
            nearest = min(seen[temperatures[i] + 1:], default=inf)
            if nearest != inf:
                answer[i] = nearest - i
            seen[temperatures[i]] = i
        return answer`,
          javascript: r`var dailyTemperatures = function(temperatures) {
    const n = temperatures.length, answer = new Array(n).fill(0), seen = new Array(101).fill(Infinity);
    for (let i = n - 1; i >= 0; i--) {
        let nearest = Infinity;
        for (let t = temperatures[i] + 1; t <= 100; t++) nearest = Math.min(nearest, seen[t]);
        if (nearest !== Infinity) answer[i] = nearest - i;
        seen[temperatures[i]] = i;
    }
    return answer;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Monotonic stack of waiting days',
        idea: 'Keep a stack of days that have not yet seen a warmer day; their temperatures decrease from bottom to top. A warmer day resolves every colder day on top of the stack.',
        steps: [
          'For each day `i`: while the stack is not empty and `temperatures[i] > temperatures[top]`, pop `top` and set `answer[top] = i − top`.',
          'Push `i`.',
          'Days still on the stack at the end keep the answer 0.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Each day is pushed and popped at most once, so all inner loops together are O(n). The stack can hold n days for a falling sequence.',
        code: {
          java: r`class Solution {
    public int[] dailyTemperatures(int[] temperatures) {
        int n = temperatures.length, top = -1;
        int[] answer = new int[n], st = new int[n];
        for (int i = 0; i < n; i++) {
            while (top >= 0 && temperatures[i] > temperatures[st[top]]) {
                int j = st[top--];
                answer[j] = i - j;
            }
            st[++top] = i;
        }
        return answer;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> dailyTemperatures(vector<int>& temperatures) {
        int n = temperatures.size();
        vector<int> answer(n, 0), st;
        for (int i = 0; i < n; i++) {
            while (!st.empty() && temperatures[i] > temperatures[st.back()]) {
                answer[st.back()] = i - st.back();
                st.pop_back();
            }
            st.push_back(i);
        }
        return answer;
    }
};`,
          python: r`class Solution:
    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:
        answer, st = [0] * len(temperatures), []
        for i, t in enumerate(temperatures):
            while st and t > temperatures[st[-1]]:
                j = st.pop()
                answer[j] = i - j
            st.append(i)
        return answer`,
          javascript: r`var dailyTemperatures = function(temperatures) {
    const n = temperatures.length, answer = new Array(n).fill(0), st = [];
    for (let i = 0; i < n; i++) {
        while (st.length && temperatures[i] > temperatures[st[st.length - 1]]) {
            const j = st.pop();
            answer[j] = i - j;
        }
        st.push(i);
    }
    return answer;
};`,
        },
      },
    ],
  },

  'next-greater-element-ii': {
    pattern: 'Monotonic stack over the array walked twice (circular)',
    approaches: [
      {
        level: 'Brute force', name: 'Walk forward around the circle from each element',
        idea: 'For each index, look at the next n − 1 positions, wrapping with `% n`, and stop at the first greater value.',
        steps: [
          'For each `i`, set `ans[i] = −1`.',
          'For `step` from 1 to n − 1, look at `nums[(i + step) % n]`; at the first value greater than `nums[i]`, record it and stop.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'Each element may look at all n − 1 others (output aside).',
        code: {
          java: r`class Solution {
    public int[] nextGreaterElements(int[] nums) {
        int n = nums.length;
        int[] ans = new int[n];
        for (int i = 0; i < n; i++) {
            ans[i] = -1;
            for (int step = 1; step < n; step++)
                if (nums[(i + step) % n] > nums[i]) { ans[i] = nums[(i + step) % n]; break; }
        }
        return ans;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> nextGreaterElements(vector<int>& nums) {
        int n = nums.size();
        vector<int> ans(n, -1);
        for (int i = 0; i < n; i++)
            for (int step = 1; step < n; step++)
                if (nums[(i + step) % n] > nums[i]) { ans[i] = nums[(i + step) % n]; break; }
        return ans;
    }
};`,
          python: r`class Solution:
    def nextGreaterElements(self, nums: List[int]) -> List[int]:
        n = len(nums)
        ans = [-1] * n
        for i in range(n):
            for step in range(1, n):
                if nums[(i + step) % n] > nums[i]:
                    ans[i] = nums[(i + step) % n]
                    break
        return ans`,
          javascript: r`var nextGreaterElements = function(nums) {
    const n = nums.length, ans = new Array(n).fill(-1);
    for (let i = 0; i < n; i++)
        for (let step = 1; step < n; step++)
            if (nums[(i + step) % n] > nums[i]) { ans[i] = nums[(i + step) % n]; break; }
    return ans;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Monotonic stack over two laps',
        idea: 'Walking the array twice (indices 0 to 2n − 1, reading `nums[i % n]`) lets every element see all the elements after it around the circle. Use the usual stack of indices waiting for a greater value, pushing only during the first lap.',
        steps: [
          'Fill `ans` with −1.',
          'For `i` from 0 to 2n − 1, let `x = nums[i % n]`; while the stack top\'s value is smaller than `x`, pop it and set its answer to `x`.',
          'If `i < n`, push `i`.',
          'Return `ans`.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Two laps of n steps; each index is pushed once and popped at most once.',
        code: {
          java: r`class Solution {
    public int[] nextGreaterElements(int[] nums) {
        int n = nums.length, top = -1;
        int[] ans = new int[n], st = new int[n];
        Arrays.fill(ans, -1);
        for (int i = 0; i < 2 * n; i++) {
            int x = nums[i % n];
            while (top >= 0 && nums[st[top]] < x) ans[st[top--]] = x;
            if (i < n) st[++top] = i;
        }
        return ans;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> nextGreaterElements(vector<int>& nums) {
        int n = nums.size();
        vector<int> ans(n, -1), st;
        for (int i = 0; i < 2 * n; i++) {
            int x = nums[i % n];
            while (!st.empty() && nums[st.back()] < x) { ans[st.back()] = x; st.pop_back(); }
            if (i < n) st.push_back(i);
        }
        return ans;
    }
};`,
          python: r`class Solution:
    def nextGreaterElements(self, nums: List[int]) -> List[int]:
        n = len(nums)
        ans, st = [-1] * n, []
        for i in range(2 * n):
            x = nums[i % n]
            while st and nums[st[-1]] < x:
                ans[st.pop()] = x
            if i < n:
                st.append(i)
        return ans`,
          javascript: r`var nextGreaterElements = function(nums) {
    const n = nums.length, ans = new Array(n).fill(-1), st = [];
    for (let i = 0; i < 2 * n; i++) {
        const x = nums[i % n];
        while (st.length && nums[st[st.length - 1]] < x) ans[st.pop()] = x;
        if (i < n) st.push(i);
    }
    return ans;
};`,
        },
      },
    ],
  },

  'online-stock-span': {
    pattern: 'Monotonic stack of (price, span) pairs that absorbs smaller previous days',
    approaches: [
      {
        level: 'Brute force', name: 'Keep every price and count backwards',
        idea: 'Store all prices. For a new price, walk back over previous days while they are not higher.',
        steps: [
          'Append `price` to a list.',
          'Starting from today, count days going backwards while the price is `<=` today\'s.',
          'Return the count.',
        ],
        time: 'O(n) per call', space: 'O(n)',
        why: 'For a rising sequence each call walks back over every earlier day: O(n²) over n calls.',
        code: {
          java: r`class StockSpanner {
    private final List<Integer> prices = new ArrayList<>();

    public StockSpanner() {
    }

    public int next(int price) {
        prices.add(price);
        int i = prices.size() - 1;
        while (i >= 0 && prices.get(i) <= price) i--;
        return prices.size() - 1 - i;
    }
}`,
          cpp: r`class StockSpanner {
    vector<int> prices;
public:
    StockSpanner() {}

    int next(int price) {
        prices.push_back(price);
        int i = (int) prices.size() - 1;
        while (i >= 0 && prices[i] <= price) i--;
        return (int) prices.size() - 1 - i;
    }
};`,
          python: r`class StockSpanner:

    def __init__(self):
        self.prices = []

    def next(self, price: int) -> int:
        self.prices.append(price)
        i = len(self.prices) - 1
        while i >= 0 and self.prices[i] <= price:
            i -= 1
        return len(self.prices) - 1 - i`,
          javascript: r`var StockSpanner = function() {
    this.prices = [];
};

StockSpanner.prototype.next = function(price) {
    this.prices.push(price);
    let i = this.prices.length - 1;
    while (i >= 0 && this.prices[i] <= price) i--;
    return this.prices.length - 1 - i;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Stack of (price, span), merging smaller days',
        idea: 'Once a day is beaten by a later price that is at least as high, no future day can stop at it — the later day blocks first. So fold its span into the later day and forget it. The stack keeps strictly decreasing prices.',
        steps: [
          'Set `span = 1`.',
          'While the stack top\'s price is `<=` today\'s price, pop it and add its span to `span`.',
          'Push `(price, span)` and return `span`.',
        ],
        time: 'O(1) amortised per call', space: 'O(n)',
        why: 'Each day is pushed once and popped at most once, so n calls cost O(n) in total. The stack holds up to n days for a falling sequence.',
        code: {
          java: r`class StockSpanner {
    private final Deque<int[]> st = new ArrayDeque<>();

    public StockSpanner() {
    }

    public int next(int price) {
        int span = 1;
        while (!st.isEmpty() && st.peek()[0] <= price) span += st.pop()[1];
        st.push(new int[] { price, span });
        return span;
    }
}`,
          cpp: r`class StockSpanner {
    vector<pair<int, int>> st;
public:
    StockSpanner() {}

    int next(int price) {
        int span = 1;
        while (!st.empty() && st.back().first <= price) { span += st.back().second; st.pop_back(); }
        st.push_back({price, span});
        return span;
    }
};`,
          python: r`class StockSpanner:

    def __init__(self):
        self.st = []

    def next(self, price: int) -> int:
        span = 1
        while self.st and self.st[-1][0] <= price:
            span += self.st.pop()[1]
        self.st.append((price, span))
        return span`,
          javascript: r`var StockSpanner = function() {
    this.st = [];
};

StockSpanner.prototype.next = function(price) {
    let span = 1;
    while (this.st.length && this.st[this.st.length - 1][0] <= price) span += this.st.pop()[1];
    this.st.push([price, span]);
    return span;
};`,
        },
      },
    ],
  },

  'remove-k-digits': {
    pattern: 'Greedy monotonic increasing stack (drop a digit when a smaller one follows)',
    approaches: [
      {
        level: 'Brute force', name: 'Remove one digit at a time, k times',
        idea: 'Greedy rule: to make the number smallest with one removal, delete the first digit that is larger than the digit after it (a "peak"); if the digits never go down, delete the last digit. Apply this k times.',
        steps: [
          'Repeat k times: find the first `i` with `num[i] > num[i + 1]`; if none, use the last index. Delete that digit.',
          'Strip leading zeros.',
          'Return the result, or `"0"` if it is empty.',
        ],
        time: 'O(k·n)', space: 'O(n)',
        why: 'Each of the k removals scans and rebuilds the string in O(n). With k and n up to 10⁵ that is too slow.',
        code: {
          java: r`class Solution {
    public String removeKdigits(String num, int k) {
        StringBuilder sb = new StringBuilder(num);
        for (int round = 0; round < k; round++) {
            int i = 0;
            while (i + 1 < sb.length() && sb.charAt(i) <= sb.charAt(i + 1)) i++;
            sb.deleteCharAt(i);
        }
        int z = 0;
        while (z < sb.length() && sb.charAt(z) == '0') z++;
        String out = sb.substring(z);
        return out.isEmpty() ? "0" : out;
    }
}`,
          cpp: r`class Solution {
public:
    string removeKdigits(string num, int k) {
        for (int round = 0; round < k; round++) {
            size_t i = 0;
            while (i + 1 < num.size() && num[i] <= num[i + 1]) i++;
            num.erase(i, 1);
        }
        size_t z = 0;
        while (z < num.size() && num[z] == '0') z++;
        string out = num.substr(z);
        return out.empty() ? "0" : out;
    }
};`,
          python: r`class Solution:
    def removeKdigits(self, num: str, k: int) -> str:
        for _ in range(k):
            i = 0
            while i + 1 < len(num) and num[i] <= num[i + 1]:
                i += 1
            num = num[:i] + num[i + 1:]
        return num.lstrip("0") or "0"`,
          javascript: r`var removeKdigits = function(num, k) {
    for (let round = 0; round < k; round++) {
        let i = 0;
        while (i + 1 < num.length && num[i] <= num[i + 1]) i++;
        num = num.slice(0, i) + num.slice(i + 1);
    }
    num = num.replace(/^0+/, '');
    return num === '' ? '0' : num;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Monotonic increasing stack',
        idea: 'The same greedy rule in one pass. Keep the kept digits on a stack. When a new digit is smaller than the top and removals are left, the top is a peak: pop it. Leftover removals come off the end, where the largest digits now are.',
        steps: [
          'For each digit `d`: while `k > 0`, the stack is non-empty and its top is greater than `d`, pop and decrease `k`. Push `d`.',
          'If `k > 0` remains, pop `k` more digits from the end.',
          'Skip leading zeros; return the rest, or `"0"` if nothing is left.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Each digit is pushed once and popped at most once. The stack holds up to n digits.',
        code: {
          java: r`class Solution {
    public String removeKdigits(String num, int k) {
        StringBuilder st = new StringBuilder();
        for (char d : num.toCharArray()) {
            while (k > 0 && st.length() > 0 && st.charAt(st.length() - 1) > d) {
                st.deleteCharAt(st.length() - 1);
                k--;
            }
            st.append(d);
        }
        st.setLength(st.length() - k);
        int z = 0;
        while (z < st.length() && st.charAt(z) == '0') z++;
        return z == st.length() ? "0" : st.substring(z);
    }
}`,
          cpp: r`class Solution {
public:
    string removeKdigits(string num, int k) {
        string st;
        for (char d : num) {
            while (k > 0 && !st.empty() && st.back() > d) { st.pop_back(); k--; }
            st.push_back(d);
        }
        st.resize(st.size() - k);
        size_t z = 0;
        while (z < st.size() && st[z] == '0') z++;
        return z == st.size() ? "0" : st.substr(z);
    }
};`,
          python: r`class Solution:
    def removeKdigits(self, num: str, k: int) -> str:
        st = []
        for d in num:
            while k and st and st[-1] > d:
                st.pop()
                k -= 1
            st.append(d)
        if k:
            st = st[:-k]
        return "".join(st).lstrip("0") or "0"`,
          javascript: r`var removeKdigits = function(num, k) {
    const st = [];
    for (const d of num) {
        while (k > 0 && st.length && st[st.length - 1] > d) { st.pop(); k--; }
        st.push(d);
    }
    st.length -= k;
    const out = st.join('').replace(/^0+/, '');
    return out === '' ? '0' : out;
};`,
        },
      },
    ],
  },

  'sum-of-subarray-minimums': {
    pattern: 'Contribution technique: previous/next smaller element via monotonic stacks',
    approaches: [
      {
        level: 'Brute force', name: 'Running minimum from every start',
        idea: 'Enumerate every subarray by its start and extend it to the right, keeping the running minimum, and add it each time.',
        steps: [
          'For each start `i`, set `min = arr[i]`.',
          'For each `j >= i`, update `min = min(min, arr[j])` and add it to the total (mod 10⁹ + 7).',
          'Return the total.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'n(n + 1)/2 subarrays, O(1) each thanks to the running minimum.',
        code: {
          java: r`class Solution {
    public int sumSubarrayMins(int[] arr) {
        final int MOD = 1_000_000_007;
        long total = 0;
        for (int i = 0; i < arr.length; i++) {
            int min = arr[i];
            for (int j = i; j < arr.length; j++) {
                min = Math.min(min, arr[j]);
                total = (total + min) % MOD;
            }
        }
        return (int) total;
    }
}`,
          cpp: r`class Solution {
public:
    int sumSubarrayMins(vector<int>& arr) {
        const long long MOD = 1000000007;
        long long total = 0;
        for (size_t i = 0; i < arr.size(); i++) {
            int mn = arr[i];
            for (size_t j = i; j < arr.size(); j++) {
                mn = min(mn, arr[j]);
                total = (total + mn) % MOD;
            }
        }
        return (int) total;
    }
};`,
          python: r`class Solution:
    def sumSubarrayMins(self, arr: List[int]) -> int:
        total = 0
        for i in range(len(arr)):
            m = arr[i]
            for j in range(i, len(arr)):
                m = min(m, arr[j])
                total += m
        return total % (10**9 + 7)`,
          javascript: r`var sumSubarrayMins = function(arr) {
    const MOD = 1000000007;
    let total = 0;
    for (let i = 0; i < arr.length; i++) {
        let min = arr[i];
        for (let j = i; j < arr.length; j++) {
            min = Math.min(min, arr[j]);
            total = (total + min) % MOD;
        }
    }
    return total;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Count how many subarrays each value is the minimum of',
        idea: '`arr[i]` is the minimum of every subarray that starts after the previous smaller value and ends before the next smaller value. With `left` choices of start and `right` choices of end it contributes `arr[i] × left × right`. To count ties once, use "strictly smaller" on the left and "smaller or equal" on the right.',
        steps: [
          '`left[i]` = distance to the previous index with a strictly smaller value (or `i + 1` if none), found with an increasing stack scanning left to right.',
          '`right[i]` = distance to the next index with a value `<=` `arr[i]` (or `n − i` if none), found with a stack scanning right to left.',
          'Add `arr[i] × left[i] × right[i]` for all `i`, modulo 10⁹ + 7.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Two stack passes where each index is pushed and popped once, then one summing pass. The products reach about 3·10⁴ × 3·10⁴ × 3·10⁴ ≈ 2.7·10¹³, so use 64-bit arithmetic before taking the modulus.',
        code: {
          java: r`class Solution {
    public int sumSubarrayMins(int[] arr) {
        final long MOD = 1_000_000_007;
        int n = arr.length, top = -1;
        int[] left = new int[n], right = new int[n], st = new int[n];
        for (int i = 0; i < n; i++) {
            while (top >= 0 && arr[st[top]] >= arr[i]) top--;
            left[i] = top < 0 ? i + 1 : i - st[top];
            st[++top] = i;
        }
        top = -1;
        for (int i = n - 1; i >= 0; i--) {
            while (top >= 0 && arr[st[top]] > arr[i]) top--;
            right[i] = top < 0 ? n - i : st[top] - i;
            st[++top] = i;
        }
        long total = 0;
        for (int i = 0; i < n; i++) total = (total + (long) arr[i] * left[i] * right[i]) % MOD;
        return (int) total;
    }
}`,
          cpp: r`class Solution {
public:
    int sumSubarrayMins(vector<int>& arr) {
        const long long MOD = 1000000007;
        int n = arr.size();
        vector<int> left(n), right(n), st;
        for (int i = 0; i < n; i++) {
            while (!st.empty() && arr[st.back()] >= arr[i]) st.pop_back();
            left[i] = st.empty() ? i + 1 : i - st.back();
            st.push_back(i);
        }
        st.clear();
        for (int i = n - 1; i >= 0; i--) {
            while (!st.empty() && arr[st.back()] > arr[i]) st.pop_back();
            right[i] = st.empty() ? n - i : st.back() - i;
            st.push_back(i);
        }
        long long total = 0;
        for (int i = 0; i < n; i++) total = (total + (long long) arr[i] * left[i] * right[i]) % MOD;
        return (int) total;
    }
};`,
          python: r`class Solution:
    def sumSubarrayMins(self, arr: List[int]) -> int:
        n = len(arr)
        left, right, st = [0] * n, [0] * n, []
        for i in range(n):
            while st and arr[st[-1]] >= arr[i]:
                st.pop()
            left[i] = i - st[-1] if st else i + 1
            st.append(i)
        st = []
        for i in range(n - 1, -1, -1):
            while st and arr[st[-1]] > arr[i]:
                st.pop()
            right[i] = st[-1] - i if st else n - i
            st.append(i)
        return sum(a * l * r for a, l, r in zip(arr, left, right)) % (10**9 + 7)`,
          javascript: r`var sumSubarrayMins = function(arr) {
    const MOD = 1000000007, n = arr.length, left = new Array(n), right = new Array(n);
    let st = [];
    for (let i = 0; i < n; i++) {
        while (st.length && arr[st[st.length - 1]] >= arr[i]) st.pop();
        left[i] = st.length ? i - st[st.length - 1] : i + 1;
        st.push(i);
    }
    st = [];
    for (let i = n - 1; i >= 0; i--) {
        while (st.length && arr[st[st.length - 1]] > arr[i]) st.pop();
        right[i] = st.length ? st[st.length - 1] - i : n - i;
        st.push(i);
    }
    let total = 0;
    // each product is below 2.7 × 10^13, well inside the 2^53 range where numbers are exact
    for (let i = 0; i < n; i++) total = (total + arr[i] * left[i] * right[i]) % MOD;
    return total;
};`,
        },
      },
    ],
  },

  'sliding-window-maximum': {
    pattern: 'Monotonic deque of indices (front = current maximum)',
    approaches: [
      {
        level: 'Brute force', name: 'Scan every window',
        idea: 'For each of the n − k + 1 windows, scan its k values for the maximum.',
        steps: [
          'For each start `i` from 0 to n − k, find the maximum of `nums[i..i + k − 1]`.',
          'Append it to the result.',
        ],
        time: 'O(n·k)', space: 'O(1)',
        why: 'n − k + 1 windows of k values each (output aside); about 2.5 × 10⁹ steps when k = n/2 = 5 × 10⁴.',
        code: {
          java: r`class Solution {
    public int[] maxSlidingWindow(int[] nums, int k) {
        int[] out = new int[nums.length - k + 1];
        for (int i = 0; i + k <= nums.length; i++) {
            int max = nums[i];
            for (int j = i + 1; j < i + k; j++) max = Math.max(max, nums[j]);
            out[i] = max;
        }
        return out;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> maxSlidingWindow(vector<int>& nums, int k) {
        vector<int> out;
        for (int i = 0; i + k <= (int) nums.size(); i++)
            out.push_back(*max_element(nums.begin() + i, nums.begin() + i + k));
        return out;
    }
};`,
          python: r`class Solution:
    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:
        return [max(nums[i:i + k]) for i in range(len(nums) - k + 1)]`,
          javascript: r`var maxSlidingWindow = function(nums, k) {
    const out = [];
    for (let i = 0; i + k <= nums.length; i++) {
        let max = nums[i];
        for (let j = i + 1; j < i + k; j++) max = Math.max(max, nums[j]);
        out.push(max);
    }
    return out;
};`,
        },
      },
      {
        level: 'Better', name: 'Max-heap with lazy deletion',
        idea: 'Keep (value, index) pairs in a max-heap. The top is the maximum, unless its index has already left the window — then discard it and look again.',
        steps: [
          'For each `i`, push `(nums[i], i)`.',
          'Once `i >= k − 1`: pop from the top while its index is `<= i − k` (outside the window).',
          'The top value is the window maximum; append it.',
        ],
        time: 'O(n log n)', space: 'O(n)',
        why: 'n pushes and at most n pops, each O(log n). Old entries are removed only when they reach the top, so the heap can hold up to n entries.',
        code: {
          java: r`class Solution {
    public int[] maxSlidingWindow(int[] nums, int k) {
        PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> b[0] - a[0]);
        int[] out = new int[nums.length - k + 1];
        for (int i = 0; i < nums.length; i++) {
            heap.add(new int[] { nums[i], i });
            if (i >= k - 1) {
                while (heap.peek()[1] <= i - k) heap.poll();
                out[i - k + 1] = heap.peek()[0];
            }
        }
        return out;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> maxSlidingWindow(vector<int>& nums, int k) {
        priority_queue<pair<int, int>> heap;
        vector<int> out;
        for (int i = 0; i < (int) nums.size(); i++) {
            heap.push({nums[i], i});
            if (i >= k - 1) {
                while (heap.top().second <= i - k) heap.pop();
                out.push_back(heap.top().first);
            }
        }
        return out;
    }
};`,
          python: r`class Solution:
    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:
        heap, out = [], []
        for i, x in enumerate(nums):
            heappush(heap, (-x, i))
            if i >= k - 1:
                while heap[0][1] <= i - k:
                    heappop(heap)
                out.append(-heap[0][0])
        return out`,
          javascript: r`var maxSlidingWindow = function(nums, k) {
    const heap = new PriorityQueue((a, b) => b[0] - a[0]), out = [];
    for (let i = 0; i < nums.length; i++) {
        heap.enqueue([nums[i], i]);
        if (i >= k - 1) {
            while (heap.front()[1] <= i - k) heap.dequeue();
            out.push(heap.front()[0]);
        }
    }
    return out;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Monotonic deque',
        idea: 'Keep indices in a deque with decreasing values. A new value removes every smaller value from the back — they can never be a maximum again while it is in the window. The front is the maximum; drop it once it leaves the window.',
        steps: [
          'For each `i`: if the front index is `<= i − k`, remove it from the front.',
          'While the back index holds a value `<= nums[i]`, remove it from the back. Push `i` at the back.',
          'Once `i >= k − 1`, append `nums[front]` to the result.',
        ],
        time: 'O(n)', space: 'O(k)',
        why: 'Each index enters and leaves the deque at most once. Only indices inside the current window are kept, so at most k.',
        code: {
          java: r`class Solution {
    public int[] maxSlidingWindow(int[] nums, int k) {
        int n = nums.length, head = 0, tail = 0;
        int[] dq = new int[n], out = new int[n - k + 1];
        for (int i = 0; i < n; i++) {
            if (head < tail && dq[head] <= i - k) head++;
            while (head < tail && nums[dq[tail - 1]] <= nums[i]) tail--;
            dq[tail++] = i;
            if (i >= k - 1) out[i - k + 1] = nums[dq[head]];
        }
        return out;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> maxSlidingWindow(vector<int>& nums, int k) {
        deque<int> dq;
        vector<int> out;
        for (int i = 0; i < (int) nums.size(); i++) {
            if (!dq.empty() && dq.front() <= i - k) dq.pop_front();
            while (!dq.empty() && nums[dq.back()] <= nums[i]) dq.pop_back();
            dq.push_back(i);
            if (i >= k - 1) out.push_back(nums[dq.front()]);
        }
        return out;
    }
};`,
          python: r`class Solution:
    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:
        dq, out = deque(), []
        for i, x in enumerate(nums):
            if dq and dq[0] <= i - k:
                dq.popleft()
            while dq and nums[dq[-1]] <= x:
                dq.pop()
            dq.append(i)
            if i >= k - 1:
                out.append(nums[dq[0]])
        return out`,
          javascript: r`var maxSlidingWindow = function(nums, k) {
    const dq = new Array(nums.length), out = [];
    let head = 0, tail = 0;
    for (let i = 0; i < nums.length; i++) {
        if (head < tail && dq[head] <= i - k) head++;
        while (head < tail && nums[dq[tail - 1]] <= nums[i]) tail--;
        dq[tail++] = i;
        if (i >= k - 1) out.push(nums[dq[head]]);
    }
    return out;
};`,
        },
      },
    ],
  },

  'largest-rectangle-in-histogram': {
    pattern: 'Monotonic increasing stack (each bar extends until a shorter bar on either side)',
    approaches: [
      {
        level: 'Brute force', name: 'Every pair of ends with a running minimum',
        idea: 'A rectangle covering bars `i..j` has height `min(heights[i..j])`. Fix the left end, extend the right end, and keep the running minimum.',
        steps: [
          'For each `i`, set `min = heights[i]`.',
          'For each `j >= i`, update `min` and the best with `min × (j − i + 1)`.',
          'Return the best.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'n(n + 1)/2 ranges, each O(1).',
        code: {
          java: r`class Solution {
    public int largestRectangleArea(int[] heights) {
        int n = heights.length, best = 0;
        for (int i = 0; i < n; i++) {
            int min = heights[i];
            for (int j = i; j < n; j++) {
                min = Math.min(min, heights[j]);
                best = Math.max(best, min * (j - i + 1));
            }
        }
        return best;
    }
}`,
          cpp: r`class Solution {
public:
    int largestRectangleArea(vector<int>& heights) {
        int n = heights.size(), best = 0;
        for (int i = 0; i < n; i++) {
            int mn = heights[i];
            for (int j = i; j < n; j++) {
                mn = min(mn, heights[j]);
                best = max(best, mn * (j - i + 1));
            }
        }
        return best;
    }
};`,
          python: r`class Solution:
    def largestRectangleArea(self, heights: List[int]) -> int:
        n, best = len(heights), 0
        for i in range(n):
            m = heights[i]
            for j in range(i, n):
                m = min(m, heights[j])
                best = max(best, m * (j - i + 1))
        return best`,
          javascript: r`var largestRectangleArea = function(heights) {
    const n = heights.length;
    let best = 0;
    for (let i = 0; i < n; i++) {
        let min = heights[i];
        for (let j = i; j < n; j++) {
            min = Math.min(min, heights[j]);
            best = Math.max(best, min * (j - i + 1));
        }
    }
    return best;
};`,
        },
      },
      {
        level: 'Better', name: 'Nearest shorter bar on each side (two stack passes)',
        idea: 'The best rectangle using bar `i` as its height stretches left and right until a strictly shorter bar. Find those boundaries for every bar with two monotonic-stack passes.',
        steps: [
          '`left[i]` = index of the nearest shorter bar to the left (−1 if none), from a left-to-right increasing stack.',
          '`right[i]` = index of the nearest shorter bar to the right (n if none), from a right-to-left pass.',
          'The answer is the maximum of `heights[i] × (right[i] − left[i] − 1)`.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Each pass pushes and pops every index once; two boundary arrays and a stack take O(n).',
        code: {
          java: r`class Solution {
    public int largestRectangleArea(int[] heights) {
        int n = heights.length, top = -1, best = 0;
        int[] left = new int[n], right = new int[n], st = new int[n];
        for (int i = 0; i < n; i++) {
            while (top >= 0 && heights[st[top]] >= heights[i]) top--;
            left[i] = top < 0 ? -1 : st[top];
            st[++top] = i;
        }
        top = -1;
        for (int i = n - 1; i >= 0; i--) {
            while (top >= 0 && heights[st[top]] >= heights[i]) top--;
            right[i] = top < 0 ? n : st[top];
            st[++top] = i;
        }
        for (int i = 0; i < n; i++) best = Math.max(best, heights[i] * (right[i] - left[i] - 1));
        return best;
    }
}`,
          cpp: r`class Solution {
public:
    int largestRectangleArea(vector<int>& heights) {
        int n = heights.size(), best = 0;
        vector<int> left(n), right(n), st;
        for (int i = 0; i < n; i++) {
            while (!st.empty() && heights[st.back()] >= heights[i]) st.pop_back();
            left[i] = st.empty() ? -1 : st.back();
            st.push_back(i);
        }
        st.clear();
        for (int i = n - 1; i >= 0; i--) {
            while (!st.empty() && heights[st.back()] >= heights[i]) st.pop_back();
            right[i] = st.empty() ? n : st.back();
            st.push_back(i);
        }
        for (int i = 0; i < n; i++) best = max(best, heights[i] * (right[i] - left[i] - 1));
        return best;
    }
};`,
          python: r`class Solution:
    def largestRectangleArea(self, heights: List[int]) -> int:
        n = len(heights)
        left, right, st = [-1] * n, [n] * n, []
        for i in range(n):
            while st and heights[st[-1]] >= heights[i]:
                st.pop()
            left[i] = st[-1] if st else -1
            st.append(i)
        st = []
        for i in range(n - 1, -1, -1):
            while st and heights[st[-1]] >= heights[i]:
                st.pop()
            right[i] = st[-1] if st else n
            st.append(i)
        return max(heights[i] * (right[i] - left[i] - 1) for i in range(n))`,
          javascript: r`var largestRectangleArea = function(heights) {
    const n = heights.length, left = new Array(n), right = new Array(n);
    let st = [];
    for (let i = 0; i < n; i++) {
        while (st.length && heights[st[st.length - 1]] >= heights[i]) st.pop();
        left[i] = st.length ? st[st.length - 1] : -1;
        st.push(i);
    }
    st = [];
    for (let i = n - 1; i >= 0; i--) {
        while (st.length && heights[st[st.length - 1]] >= heights[i]) st.pop();
        right[i] = st.length ? st[st.length - 1] : n;
        st.push(i);
    }
    let best = 0;
    for (let i = 0; i < n; i++) best = Math.max(best, heights[i] * (right[i] - left[i] - 1));
    return best;
};`,
        },
      },
      {
        level: 'Optimal', name: 'One pass with an increasing stack',
        idea: 'Keep bar indices with increasing heights. When a shorter bar arrives at `i`, each taller bar popped has found its right boundary (`i`), and its left boundary is the new top of the stack — so its rectangle can be measured right there. A height-0 sentinel at the end flushes the stack.',
        steps: [
          'For `i` from 0 to n (treat `heights[n]` as 0):',
          'While the stack is not empty and `heights[top] >= h`, pop `top`; the width is `i` if the stack is now empty, else `i − newTop − 1`; update the best with `heights[top] × width`.',
          'Push `i`. Return the best.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Each index is pushed and popped once in a single pass. With equal heights, popping on `>=` measures a slightly short rectangle for the earlier bar, but the last bar of the run gets the full width, so the maximum is still found.',
        code: {
          java: r`class Solution {
    public int largestRectangleArea(int[] heights) {
        int n = heights.length, top = -1, best = 0;
        int[] st = new int[n + 1];
        for (int i = 0; i <= n; i++) {
            int h = i == n ? 0 : heights[i];
            while (top >= 0 && heights[st[top]] >= h) {
                int height = heights[st[top--]];
                int width = top < 0 ? i : i - st[top] - 1;
                best = Math.max(best, height * width);
            }
            st[++top] = i;
        }
        return best;
    }
}`,
          cpp: r`class Solution {
public:
    int largestRectangleArea(vector<int>& heights) {
        int n = heights.size(), best = 0;
        vector<int> st;
        for (int i = 0; i <= n; i++) {
            int h = i == n ? 0 : heights[i];
            while (!st.empty() && heights[st.back()] >= h) {
                int height = heights[st.back()];
                st.pop_back();
                int width = st.empty() ? i : i - st.back() - 1;
                best = max(best, height * width);
            }
            st.push_back(i);
        }
        return best;
    }
};`,
          python: r`class Solution:
    def largestRectangleArea(self, heights: List[int]) -> int:
        n, best, st = len(heights), 0, []
        for i in range(n + 1):
            h = 0 if i == n else heights[i]
            while st and heights[st[-1]] >= h:
                height = heights[st.pop()]
                width = i - st[-1] - 1 if st else i
                best = max(best, height * width)
            st.append(i)
        return best`,
          javascript: r`var largestRectangleArea = function(heights) {
    const n = heights.length, st = [];
    let best = 0;
    for (let i = 0; i <= n; i++) {
        const h = i === n ? 0 : heights[i];
        while (st.length && heights[st[st.length - 1]] >= h) {
            const height = heights[st.pop()];
            const width = st.length ? i - st[st.length - 1] - 1 : i;
            best = Math.max(best, height * width);
        }
        st.push(i);
    }
    return best;
};`,
        },
      },
    ],
  },

  'maximal-rectangle': {
    pattern: 'Row-by-row histograms + largest rectangle in histogram (monotonic stack)',
    approaches: [
      {
        level: 'Brute force', name: 'For each cell as the bottom-right corner, look upwards',
        idea: '`width[r][c]` = number of consecutive `1`s ending at `(r, c)` in its row. A rectangle with bottom-right corner `(r, c)` spanning rows `k..r` can be as wide as the smallest width in that column over those rows.',
        steps: [
          'Compute `width[r][c]` for every cell (0 for a `0`, else 1 + the cell to the left).',
          'For each cell, walk upward `k = r, r − 1, …` keeping `minW = min(width[k][c])`; stop when it hits 0.',
          'Update the best with `minW × (r − k + 1)`.',
        ],
        time: 'O(m²·n)', space: 'O(m·n)',
        why: 'Each of the m·n cells may walk up through all m rows. The width table is m × n.',
        code: {
          java: r`class Solution {
    public int maximalRectangle(char[][] matrix) {
        int m = matrix.length, n = matrix[0].length, best = 0;
        int[][] width = new int[m][n];
        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++)
                if (matrix[r][c] == '1') width[r][c] = (c > 0 ? width[r][c - 1] : 0) + 1;
        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++) {
                int minW = Integer.MAX_VALUE;
                for (int k = r; k >= 0 && width[k][c] > 0; k--) {
                    minW = Math.min(minW, width[k][c]);
                    best = Math.max(best, minW * (r - k + 1));
                }
            }
        return best;
    }
}`,
          cpp: r`class Solution {
public:
    int maximalRectangle(vector<vector<char>>& matrix) {
        int m = matrix.size(), n = matrix[0].size(), best = 0;
        vector<vector<int>> width(m, vector<int>(n, 0));
        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++)
                if (matrix[r][c] == '1') width[r][c] = (c > 0 ? width[r][c - 1] : 0) + 1;
        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++) {
                int minW = INT_MAX;
                for (int k = r; k >= 0 && width[k][c] > 0; k--) {
                    minW = min(minW, width[k][c]);
                    best = max(best, minW * (r - k + 1));
                }
            }
        return best;
    }
};`,
          python: r`class Solution:
    def maximalRectangle(self, matrix: List[List[str]]) -> int:
        m, n = len(matrix), len(matrix[0])
        width = [[0] * n for _ in range(m)]
        for r in range(m):
            for c in range(n):
                if matrix[r][c] == "1":
                    width[r][c] = (width[r][c - 1] if c else 0) + 1
        best = 0
        for r in range(m):
            for c in range(n):
                min_w, k = inf, r
                while k >= 0 and width[k][c]:
                    min_w = min(min_w, width[k][c])
                    best = max(best, min_w * (r - k + 1))
                    k -= 1
        return best`,
          javascript: r`var maximalRectangle = function(matrix) {
    const m = matrix.length, n = matrix[0].length;
    const width = Array.from({ length: m }, () => new Array(n).fill(0));
    for (let r = 0; r < m; r++)
        for (let c = 0; c < n; c++)
            if (matrix[r][c] === '1') width[r][c] = (c > 0 ? width[r][c - 1] : 0) + 1;
    let best = 0;
    for (let r = 0; r < m; r++)
        for (let c = 0; c < n; c++) {
            let minW = Infinity;
            for (let k = r; k >= 0 && width[k][c] > 0; k--) {
                minW = Math.min(minW, width[k][c]);
                best = Math.max(best, minW * (r - k + 1));
            }
        }
    return best;
};`,
        },
      },
      {
        level: 'Optimal', name: 'A histogram per row, solved with a monotonic stack',
        idea: 'For each row, let `h[c]` count the consecutive `1`s ending at that row in column `c`. Every all-ones rectangle has a bottom row, and within that row it is a rectangle under the histogram `h`. So run Largest Rectangle in Histogram on each row\'s `h`.',
        steps: [
          'Keep `h` of length n, all 0.',
          'For each row: `h[c] = matrix[r][c] == "1" ? h[c] + 1 : 0`.',
          'Compute the largest rectangle in histogram `h` with the one-pass increasing stack (with a 0 sentinel at the end).',
          'Return the best over all rows.',
        ],
        time: 'O(m·n)', space: 'O(n)',
        why: 'Each row updates `h` in O(n) and runs an O(n) stack pass. Only `h` and the stack are kept.',
        code: {
          java: r`class Solution {
    public int maximalRectangle(char[][] matrix) {
        int n = matrix[0].length, best = 0;
        int[] h = new int[n + 1], st = new int[n + 1];
        for (char[] row : matrix) {
            for (int c = 0; c < n; c++) h[c] = row[c] == '1' ? h[c] + 1 : 0;
            int top = -1;
            for (int i = 0; i <= n; i++) { // h[n] stays 0: the sentinel
                while (top >= 0 && h[st[top]] >= h[i]) {
                    int height = h[st[top--]];
                    int width = top < 0 ? i : i - st[top] - 1;
                    best = Math.max(best, height * width);
                }
                st[++top] = i;
            }
        }
        return best;
    }
}`,
          cpp: r`class Solution {
public:
    int maximalRectangle(vector<vector<char>>& matrix) {
        int n = matrix[0].size(), best = 0;
        vector<int> h(n + 1, 0), st;
        for (auto& row : matrix) {
            for (int c = 0; c < n; c++) h[c] = row[c] == '1' ? h[c] + 1 : 0;
            st.clear();
            for (int i = 0; i <= n; i++) { // h[n] stays 0: the sentinel
                while (!st.empty() && h[st.back()] >= h[i]) {
                    int height = h[st.back()];
                    st.pop_back();
                    int width = st.empty() ? i : i - st.back() - 1;
                    best = max(best, height * width);
                }
                st.push_back(i);
            }
        }
        return best;
    }
};`,
          python: r`class Solution:
    def maximalRectangle(self, matrix: List[List[str]]) -> int:
        n = len(matrix[0])
        h = [0] * (n + 1)  # h[n] stays 0: the sentinel
        best = 0
        for row in matrix:
            for c in range(n):
                h[c] = h[c] + 1 if row[c] == "1" else 0
            st = []
            for i in range(n + 1):
                while st and h[st[-1]] >= h[i]:
                    height = h[st.pop()]
                    width = i - st[-1] - 1 if st else i
                    best = max(best, height * width)
                st.append(i)
        return best`,
          javascript: r`var maximalRectangle = function(matrix) {
    const n = matrix[0].length, h = new Array(n + 1).fill(0); // h[n] stays 0: the sentinel
    let best = 0;
    for (const row of matrix) {
        for (let c = 0; c < n; c++) h[c] = row[c] === '1' ? h[c] + 1 : 0;
        const st = [];
        for (let i = 0; i <= n; i++) {
            while (st.length && h[st[st.length - 1]] >= h[i]) {
                const height = h[st.pop()];
                const width = st.length ? i - st[st.length - 1] - 1 : i;
                best = Math.max(best, height * width);
            }
            st.push(i);
        }
    }
    return best;
};`,
        },
      },
    ],
  },
};
