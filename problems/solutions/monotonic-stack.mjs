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

  'longest-continuous-subarray-with-absolute-diff-less-than-or-equal-to-limit': {
    pattern: 'Sliding window with a max queue and a min queue (monotonic deques)',
    approaches: [
      {
        level: 'Brute force', name: 'Every start, running min and max',
        idea: 'Fix the start, extend the end while tracking the running minimum and maximum, and stop when they differ by more than limit.',
        steps: [
          'For each start `l`, set `mn = mx = nums[l]`.',
          'Extend `r`, updating `mn` and `mx`; stop when `mx − mn > limit`, otherwise update the best length.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'With a large limit every start walks to the end: 5 × 10⁹ steps for n = 10⁵.',
        code: {
          java: r`class Solution {
    public int longestSubarray(int[] nums, int limit) {
        int best = 0;
        for (int l = 0; l < nums.length; l++) {
            int mn = nums[l], mx = nums[l];
            for (int r = l; r < nums.length; r++) {
                mn = Math.min(mn, nums[r]);
                mx = Math.max(mx, nums[r]);
                if (mx - mn > limit) break;
                best = Math.max(best, r - l + 1);
            }
        }
        return best;
    }
}`,
          cpp: r`class Solution {
public:
    int longestSubarray(vector<int>& nums, int limit) {
        int best = 0, n = nums.size();
        for (int l = 0; l < n; l++) {
            int mn = nums[l], mx = nums[l];
            for (int r = l; r < n; r++) {
                mn = min(mn, nums[r]);
                mx = max(mx, nums[r]);
                if (mx - mn > limit) break;
                best = max(best, r - l + 1);
            }
        }
        return best;
    }
};`,
          python: r`class Solution:
    def longestSubarray(self, nums: List[int], limit: int) -> int:
        best = 0
        for l in range(len(nums)):
            mn = mx = nums[l]
            for r in range(l, len(nums)):
                mn, mx = min(mn, nums[r]), max(mx, nums[r])
                if mx - mn > limit:
                    break
                best = max(best, r - l + 1)
        return best`,
          javascript: r`var longestSubarray = function(nums, limit) {
    let best = 0;
    for (let l = 0; l < nums.length; l++) {
        let mn = nums[l], mx = nums[l];
        for (let r = l; r < nums.length; r++) {
            mn = Math.min(mn, nums[r]);
            mx = Math.max(mx, nums[r]);
            if (mx - mn > limit) break;
            best = Math.max(best, r - l + 1);
        }
    }
    return best;
};`,
        },
      },
      {
        level: 'Better', name: 'Sliding window with two heaps',
        idea: 'Slide a window; a max-heap and a min-heap of (value, index) give its max and min. Entries whose index has left the window are discarded when they reach the top (lazy deletion).',
        steps: [
          'Push `(nums[r], r)` onto both heaps.',
          'While `max − min > limit`: move `l` forward, then pop heap tops whose index is `< l`.',
          'Update the best with `r − l + 1`.',
        ],
        time: 'O(n log n)', space: 'O(n)',
        why: 'Correct and fast enough, but every push and pop costs O(log n); the deques do the same job in O(1).',
        code: {
          java: r`class Solution {
    public int longestSubarray(int[] nums, int limit) {
        PriorityQueue<int[]> maxH = new PriorityQueue<>((a, b) -> Integer.compare(b[0], a[0]));
        PriorityQueue<int[]> minH = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));
        int l = 0, best = 0;
        for (int r = 0; r < nums.length; r++) {
            maxH.add(new int[] { nums[r], r });
            minH.add(new int[] { nums[r], r });
            while (maxH.peek()[0] - minH.peek()[0] > limit) {
                l++;
                while (maxH.peek()[1] < l) maxH.poll();   // left the window
                while (minH.peek()[1] < l) minH.poll();
            }
            best = Math.max(best, r - l + 1);
        }
        return best;
    }
}`,
          cpp: r`class Solution {
public:
    int longestSubarray(vector<int>& nums, int limit) {
        priority_queue<pair<int, int>> maxH;
        priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> minH;
        int l = 0, best = 0;
        for (int r = 0; r < (int) nums.size(); r++) {
            maxH.push({nums[r], r});
            minH.push({nums[r], r});
            while (maxH.top().first - minH.top().first > limit) {
                l++;
                while (maxH.top().second < l) maxH.pop();
                while (minH.top().second < l) minH.pop();
            }
            best = max(best, r - l + 1);
        }
        return best;
    }
};`,
          python: r`class Solution:
    def longestSubarray(self, nums: List[int], limit: int) -> int:
        max_h, min_h = [], []
        l = best = 0
        for r, x in enumerate(nums):
            heappush(max_h, (-x, r))
            heappush(min_h, (x, r))
            while -max_h[0][0] - min_h[0][0] > limit:
                l += 1
                while max_h[0][1] < l:
                    heappop(max_h)
                while min_h[0][1] < l:
                    heappop(min_h)
            best = max(best, r - l + 1)
        return best`,
          javascript: r`var longestSubarray = function(nums, limit) {
    const maxH = new PriorityQueue((a, b) => b[0] - a[0]);
    const minH = new PriorityQueue((a, b) => a[0] - b[0]);
    let l = 0, best = 0;
    for (let r = 0; r < nums.length; r++) {
        maxH.enqueue([nums[r], r]);
        minH.enqueue([nums[r], r]);
        while (maxH.front()[0] - minH.front()[0] > limit) {
            l++;
            while (maxH.front()[1] < l) maxH.dequeue();
            while (minH.front()[1] < l) minH.dequeue();
        }
        best = Math.max(best, r - l + 1);
    }
    return best;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Max queue + min queue (two monotonic deques)',
        idea: 'Keep a deque of decreasing values (front = window max) and one of increasing values (front = window min). A value leaving on the left also leaves any deque whose front it is.',
        steps: [
          'For each `r`, pop smaller values from the back of `maxQ` and larger values from the back of `minQ`, then push `nums[r]` onto both.',
          'While `maxQ.front − minQ.front > limit`: if `nums[l]` is a front, pop it; `l++`.',
          'Update the best with `r − l + 1`.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Every value enters and leaves each deque at most once, and the window only moves forward.',
        code: {
          java: r`class Solution {
    public int longestSubarray(int[] nums, int limit) {
        Deque<Integer> maxQ = new ArrayDeque<>(), minQ = new ArrayDeque<>();   // values: decreasing / increasing
        int l = 0, best = 0;
        for (int r = 0; r < nums.length; r++) {
            while (!maxQ.isEmpty() && maxQ.peekLast() < nums[r]) maxQ.pollLast();
            maxQ.offerLast(nums[r]);
            while (!minQ.isEmpty() && minQ.peekLast() > nums[r]) minQ.pollLast();
            minQ.offerLast(nums[r]);
            while (maxQ.peekFirst() - minQ.peekFirst() > limit) {               // too wide: drop nums[l]
                if (maxQ.peekFirst() == nums[l]) maxQ.pollFirst();
                if (minQ.peekFirst() == nums[l]) minQ.pollFirst();
                l++;
            }
            best = Math.max(best, r - l + 1);
        }
        return best;
    }
}`,
          cpp: r`class Solution {
public:
    int longestSubarray(vector<int>& nums, int limit) {
        deque<int> maxQ, minQ;
        int l = 0, best = 0;
        for (int r = 0; r < (int) nums.size(); r++) {
            while (!maxQ.empty() && maxQ.back() < nums[r]) maxQ.pop_back();
            maxQ.push_back(nums[r]);
            while (!minQ.empty() && minQ.back() > nums[r]) minQ.pop_back();
            minQ.push_back(nums[r]);
            while (maxQ.front() - minQ.front() > limit) {
                if (maxQ.front() == nums[l]) maxQ.pop_front();
                if (minQ.front() == nums[l]) minQ.pop_front();
                l++;
            }
            best = max(best, r - l + 1);
        }
        return best;
    }
};`,
          python: r`class Solution:
    def longestSubarray(self, nums: List[int], limit: int) -> int:
        max_q, min_q = deque(), deque()
        l = best = 0
        for r, x in enumerate(nums):
            while max_q and max_q[-1] < x:
                max_q.pop()
            max_q.append(x)
            while min_q and min_q[-1] > x:
                min_q.pop()
            min_q.append(x)
            while max_q[0] - min_q[0] > limit:
                if max_q[0] == nums[l]:
                    max_q.popleft()
                if min_q[0] == nums[l]:
                    min_q.popleft()
                l += 1
            best = max(best, r - l + 1)
        return best`,
          javascript: r`var longestSubarray = function(nums, limit) {
    // arrays with a head pointer act as deques
    const maxQ = [], minQ = [];
    let mh = 0, nh = 0, l = 0, best = 0;
    for (let r = 0; r < nums.length; r++) {
        while (maxQ.length > mh && maxQ[maxQ.length - 1] < nums[r]) maxQ.pop();
        maxQ.push(nums[r]);
        while (minQ.length > nh && minQ[minQ.length - 1] > nums[r]) minQ.pop();
        minQ.push(nums[r]);
        while (maxQ[mh] - minQ[nh] > limit) {
            if (maxQ[mh] === nums[l]) mh++;
            if (minQ[nh] === nums[l]) nh++;
            l++;
        }
        best = Math.max(best, r - l + 1);
    }
    return best;
};`,
        },
      },
    ],
  },

  'jump-game-vi': {
    pattern: 'DP over the last k states with a max queue (monotonic deque)',
    approaches: [
      {
        level: 'Brute force', name: 'DP, scanning the last k',
        idea: 'dp[i] = nums[i] + max(dp[i − k … i − 1]); compute each max with a loop.',
        steps: [
          '`dp[0] = nums[0]`.',
          'For each `i`, scan `dp[max(0, i − k) … i − 1]` for the maximum and add `nums[i]`.',
        ],
        time: 'O(n · k)', space: 'O(n)',
        why: 'n = k = 10⁵ gives about 5 × 10⁹ steps.',
        code: {
          java: r`class Solution {
    public int maxResult(int[] nums, int k) {
        int n = nums.length;
        int[] dp = new int[n];
        dp[0] = nums[0];
        for (int i = 1; i < n; i++) {
            int best = Integer.MIN_VALUE;
            for (int j = Math.max(0, i - k); j < i; j++) best = Math.max(best, dp[j]);
            dp[i] = nums[i] + best;
        }
        return dp[n - 1];
    }
}`,
          cpp: r`class Solution {
public:
    int maxResult(vector<int>& nums, int k) {
        int n = nums.size();
        vector<int> dp(n);
        dp[0] = nums[0];
        for (int i = 1; i < n; i++) {
            int best = INT_MIN;
            for (int j = max(0, i - k); j < i; j++) best = max(best, dp[j]);
            dp[i] = nums[i] + best;
        }
        return dp[n - 1];
    }
};`,
          python: r`class Solution:
    def maxResult(self, nums: List[int], k: int) -> int:
        dp = [0] * len(nums)
        dp[0] = nums[0]
        for i in range(1, len(nums)):
            dp[i] = nums[i] + max(dp[max(0, i - k):i])
        return dp[-1]`,
          javascript: r`var maxResult = function(nums, k) {
    const n = nums.length, dp = new Array(n);
    dp[0] = nums[0];
    for (let i = 1; i < n; i++) {
        let best = -Infinity;
        for (let j = Math.max(0, i - k); j < i; j++) best = Math.max(best, dp[j]);
        dp[i] = nums[i] + best;
    }
    return dp[n - 1];
};`,
        },
      },
      {
        level: 'Optimal', name: 'DP + max deque over the window',
        idea: 'The last k dp values are a sliding window, so a deque of indexes with decreasing dp gives their maximum in O(1).',
        steps: [
          'Start the deque with index 0.',
          'For each `i`: drop the front if it is more than `k` behind; `dp[i] = nums[i] + dp[front]`.',
          'Pop indexes with `dp ≤ dp[i]` from the back, then push `i`.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Each index is pushed and popped at most once.',
        code: {
          java: r`class Solution {
    public int maxResult(int[] nums, int k) {
        int n = nums.length;
        int[] dp = new int[n];
        dp[0] = nums[0];
        Deque<Integer> dq = new ArrayDeque<>(List.of(0));          // indexes, dp decreasing
        for (int i = 1; i < n; i++) {
            if (dq.peekFirst() < i - k) dq.pollFirst();             // too far back to jump from
            dp[i] = nums[i] + dp[dq.peekFirst()];
            while (!dq.isEmpty() && dp[dq.peekLast()] <= dp[i]) dq.pollLast();
            dq.offerLast(i);
        }
        return dp[n - 1];
    }
}`,
          cpp: r`class Solution {
public:
    int maxResult(vector<int>& nums, int k) {
        int n = nums.size();
        vector<int> dp(n);
        dp[0] = nums[0];
        deque<int> dq{0};
        for (int i = 1; i < n; i++) {
            if (dq.front() < i - k) dq.pop_front();
            dp[i] = nums[i] + dp[dq.front()];
            while (!dq.empty() && dp[dq.back()] <= dp[i]) dq.pop_back();
            dq.push_back(i);
        }
        return dp[n - 1];
    }
};`,
          python: r`class Solution:
    def maxResult(self, nums: List[int], k: int) -> int:
        dp = [0] * len(nums)
        dp[0] = nums[0]
        dq = deque([0])
        for i in range(1, len(nums)):
            if dq[0] < i - k:
                dq.popleft()
            dp[i] = nums[i] + dp[dq[0]]
            while dq and dp[dq[-1]] <= dp[i]:
                dq.pop()
            dq.append(i)
        return dp[-1]`,
          javascript: r`var maxResult = function(nums, k) {
    const n = nums.length, dp = new Array(n), dq = [0];
    dp[0] = nums[0];
    let head = 0;
    for (let i = 1; i < n; i++) {
        if (dq[head] < i - k) head++;
        dp[i] = nums[i] + dp[dq[head]];
        while (dq.length > head && dp[dq[dq.length - 1]] <= dp[i]) dq.pop();
        dq.push(i);
    }
    return dp[n - 1];
};`,
        },
      },
    ],
  },

  'constrained-subsequence-sum': {
    pattern: 'DP over the last k states with a max queue (monotonic deque)',
    approaches: [
      {
        level: 'Brute force', name: 'DP, scanning the last k',
        idea: 'dp[i] = nums[i] + max(0, max(dp[i − k … i − 1])): extend the best subsequence ending in range, or start at i.',
        steps: [
          'For each `i`, scan `dp[max(0, i − k) … i − 1]` for the maximum.',
          '`dp[i] = nums[i] + max(0, that max)`; the answer is the largest `dp`.',
        ],
        time: 'O(n · k)', space: 'O(n)',
        why: 'n = k = 10⁵ gives about 5 × 10⁹ steps.',
        code: {
          java: r`class Solution {
    public int constrainedSubsetSum(int[] nums, int k) {
        int n = nums.length, best = Integer.MIN_VALUE;
        int[] dp = new int[n];
        for (int i = 0; i < n; i++) {
            int prev = 0;
            for (int j = Math.max(0, i - k); j < i; j++) prev = Math.max(prev, dp[j]);
            dp[i] = nums[i] + prev;
            best = Math.max(best, dp[i]);
        }
        return best;
    }
}`,
          cpp: r`class Solution {
public:
    int constrainedSubsetSum(vector<int>& nums, int k) {
        int n = nums.size(), best = INT_MIN;
        vector<int> dp(n);
        for (int i = 0; i < n; i++) {
            int prev = 0;
            for (int j = max(0, i - k); j < i; j++) prev = max(prev, dp[j]);
            dp[i] = nums[i] + prev;
            best = max(best, dp[i]);
        }
        return best;
    }
};`,
          python: r`class Solution:
    def constrainedSubsetSum(self, nums: List[int], k: int) -> int:
        dp = []
        for i, x in enumerate(nums):
            dp.append(x + max([0] + dp[max(0, i - k):i]))
        return max(dp)`,
          javascript: r`var constrainedSubsetSum = function(nums, k) {
    const n = nums.length, dp = new Array(n);
    let best = -Infinity;
    for (let i = 0; i < n; i++) {
        let prev = 0;
        for (let j = Math.max(0, i - k); j < i; j++) prev = Math.max(prev, dp[j]);
        dp[i] = nums[i] + prev;
        best = Math.max(best, dp[i]);
    }
    return best;
};`,
        },
      },
      {
        level: 'Optimal', name: 'DP + max deque over the window',
        idea: 'The max of the last k dp values comes from a deque of indexes with decreasing dp, so each step is O(1).',
        steps: [
          'For each `i`: drop the front if it is more than `k` behind.',
          '`dp[i] = nums[i] + max(0, dp[front])` (0 if the deque is empty).',
          'Pop indexes with `dp ≤ dp[i]` from the back, push `i`, and track the best.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Each index is pushed and popped at most once.',
        code: {
          java: r`class Solution {
    public int constrainedSubsetSum(int[] nums, int k) {
        int n = nums.length, best = Integer.MIN_VALUE;
        int[] dp = new int[n];                                   // best sum of a subsequence ending at i
        Deque<Integer> dq = new ArrayDeque<>();                  // indexes, dp decreasing
        for (int i = 0; i < n; i++) {
            if (!dq.isEmpty() && dq.peekFirst() < i - k) dq.pollFirst();
            dp[i] = nums[i] + Math.max(0, dq.isEmpty() ? 0 : dp[dq.peekFirst()]);   // extend the best, or start here
            while (!dq.isEmpty() && dp[dq.peekLast()] <= dp[i]) dq.pollLast();
            dq.offerLast(i);
            best = Math.max(best, dp[i]);
        }
        return best;
    }
}`,
          cpp: r`class Solution {
public:
    int constrainedSubsetSum(vector<int>& nums, int k) {
        int n = nums.size(), best = INT_MIN;
        vector<int> dp(n);
        deque<int> dq;
        for (int i = 0; i < n; i++) {
            if (!dq.empty() && dq.front() < i - k) dq.pop_front();
            dp[i] = nums[i] + max(0, dq.empty() ? 0 : dp[dq.front()]);
            while (!dq.empty() && dp[dq.back()] <= dp[i]) dq.pop_back();
            dq.push_back(i);
            best = max(best, dp[i]);
        }
        return best;
    }
};`,
          python: r`class Solution:
    def constrainedSubsetSum(self, nums: List[int], k: int) -> int:
        dp, dq, best = [0] * len(nums), deque(), -inf
        for i, x in enumerate(nums):
            if dq and dq[0] < i - k:
                dq.popleft()
            dp[i] = x + max(0, dp[dq[0]] if dq else 0)
            while dq and dp[dq[-1]] <= dp[i]:
                dq.pop()
            dq.append(i)
            best = max(best, dp[i])
        return best`,
          javascript: r`var constrainedSubsetSum = function(nums, k) {
    const n = nums.length, dp = new Array(n), dq = [];
    let head = 0, best = -Infinity;
    for (let i = 0; i < n; i++) {
        if (dq.length > head && dq[head] < i - k) head++;
        dp[i] = nums[i] + Math.max(0, dq.length > head ? dp[dq[head]] : 0);
        while (dq.length > head && dp[dq[dq.length - 1]] <= dp[i]) dq.pop();
        dq.push(i);
        best = Math.max(best, dp[i]);
    }
    return best;
};`,
        },
      },
    ],
  },

  'shortest-subarray-with-sum-at-least-k': {
    pattern: 'Monotonic deque over prefix sums (a min queue of candidate starts)',
    approaches: [
      {
        level: 'Brute force', name: 'Every start, running sum',
        idea: 'For every start, extend the end with a running sum and record the first end that reaches k.',
        steps: [
          'For each start `l`, keep a running sum while extending `r`.',
          'The first `r` with sum `≥ k` gives a candidate length `r − l + 1`; stop there.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: '5 × 10⁹ steps for n = 10⁵. A plain sliding window is no fix: with negatives, extending can lower the sum.',
        code: {
          java: r`class Solution {
    public int shortestSubarray(int[] nums, int k) {
        int best = Integer.MAX_VALUE;
        for (int l = 0; l < nums.length; l++) {
            long sum = 0;
            for (int r = l; r < nums.length; r++) {
                sum += nums[r];
                if (sum >= k) { best = Math.min(best, r - l + 1); break; }
            }
        }
        return best == Integer.MAX_VALUE ? -1 : best;
    }
}`,
          cpp: r`class Solution {
public:
    int shortestSubarray(vector<int>& nums, int k) {
        int best = INT_MAX, n = nums.size();
        for (int l = 0; l < n; l++) {
            long long sum = 0;
            for (int r = l; r < n; r++) {
                sum += nums[r];
                if (sum >= k) { best = min(best, r - l + 1); break; }
            }
        }
        return best == INT_MAX ? -1 : best;
    }
};`,
          python: r`class Solution:
    def shortestSubarray(self, nums: List[int], k: int) -> int:
        best = inf
        for l in range(len(nums)):
            s = 0
            for r in range(l, len(nums)):
                s += nums[r]
                if s >= k:
                    best = min(best, r - l + 1)
                    break
        return -1 if best == inf else best`,
          javascript: r`var shortestSubarray = function(nums, k) {
    let best = Infinity;
    for (let l = 0; l < nums.length; l++) {
        let sum = 0;
        for (let r = l; r < nums.length; r++) {
            sum += nums[r];
            if (sum >= k) { best = Math.min(best, r - l + 1); break; }
        }
    }
    return best === Infinity ? -1 : best;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Increasing deque of prefix sums',
        idea: 'Subarray [i, j) sums to p[j] − p[i]. Keep candidate starts with increasing p: pop the front once it pairs with j (its shortest partner), and pop the back when p[j] is no larger (j is a later, better start).',
        steps: [
          'Build 64-bit prefix sums `p` (length n + 1).',
          'For each `j`: while `p[j] − p[front] ≥ k`, record `j − front` and pop the front.',
          'While `p[back] ≥ p[j]`, pop the back; push `j`.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Each prefix index enters and leaves the deque at most once, and each pop is justified: a start can never do better later.',
        code: {
          java: r`class Solution {
    public int shortestSubarray(int[] nums, int k) {
        int n = nums.length, best = n + 1;
        long[] p = new long[n + 1];
        for (int i = 0; i < n; i++) p[i + 1] = p[i] + nums[i];
        Deque<Integer> dq = new ArrayDeque<>();                  // prefix indexes, p increasing
        for (int j = 0; j <= n; j++) {
            while (!dq.isEmpty() && p[j] - p[dq.peekFirst()] >= k) best = Math.min(best, j - dq.pollFirst());
            while (!dq.isEmpty() && p[dq.peekLast()] >= p[j]) dq.pollLast();
            dq.offerLast(j);
        }
        return best <= n ? best : -1;
    }
}`,
          cpp: r`class Solution {
public:
    int shortestSubarray(vector<int>& nums, int k) {
        int n = nums.size(), best = n + 1;
        vector<long long> p(n + 1, 0);
        for (int i = 0; i < n; i++) p[i + 1] = p[i] + nums[i];
        deque<int> dq;
        for (int j = 0; j <= n; j++) {
            while (!dq.empty() && p[j] - p[dq.front()] >= k) { best = min(best, j - dq.front()); dq.pop_front(); }
            while (!dq.empty() && p[dq.back()] >= p[j]) dq.pop_back();
            dq.push_back(j);
        }
        return best <= n ? best : -1;
    }
};`,
          python: r`class Solution:
    def shortestSubarray(self, nums: List[int], k: int) -> int:
        n = len(nums)
        p = [0] * (n + 1)
        for i, x in enumerate(nums):
            p[i + 1] = p[i] + x
        best, dq = n + 1, deque()
        for j in range(n + 1):
            while dq and p[j] - p[dq[0]] >= k:
                best = min(best, j - dq.popleft())
            while dq and p[dq[-1]] >= p[j]:
                dq.pop()
            dq.append(j)
        return best if best <= n else -1`,
          javascript: r`var shortestSubarray = function(nums, k) {
    const n = nums.length, p = new Array(n + 1).fill(0), dq = [];
    for (let i = 0; i < n; i++) p[i + 1] = p[i] + nums[i];
    let head = 0, best = n + 1;
    for (let j = 0; j <= n; j++) {
        while (dq.length > head && p[j] - p[dq[head]] >= k) best = Math.min(best, j - dq[head++]);
        while (dq.length > head && p[dq[dq.length - 1]] >= p[j]) dq.pop();
        dq.push(j);
    }
    return best <= n ? best : -1;
};`,
        },
      },
    ],
  },
  // ---- visible people, counting windows with a min and max queue
  'number-of-visible-people-in-a-queue': {
    pattern: 'Monotonic stack from the right: each pop is one person you can see',
    approaches: [
      {
        level: 'Brute force', name: 'Look right from every person',
        idea: 'From person i, walk right keeping the tallest height seen so far. Person j is visible if they are taller than everyone in between; stop at the first person taller than i.',
        steps: [
          'For each `i`, set `tallest = 0` (the tallest between i and j).',
          'For `j = i + 1 …`: if `heights[j] > tallest`, person j is visible (they are also shorter than i, or the first taller one). Update `tallest`.',
          'Stop as soon as `heights[j] > heights[i]`: that person blocks everyone after.',
        ],
        time: 'O(n²)', space: 'O(1) extra',
        why: 'An increasing line makes every person scan to the end of the array.',
        code: {
          java: r`class Solution {
    public int[] canSeePersonsCount(int[] heights) {
        int n = heights.length;
        int[] ans = new int[n];
        for (int i = 0; i < n; i++) {
            int tallest = 0;
            for (int j = i + 1; j < n; j++) {
                if (heights[j] > tallest) { ans[i]++; tallest = heights[j]; }
                if (heights[j] > heights[i]) break;
            }
        }
        return ans;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> canSeePersonsCount(vector<int>& heights) {
        int n = heights.size();
        vector<int> ans(n, 0);
        for (int i = 0; i < n; i++) {
            int tallest = 0;
            for (int j = i + 1; j < n; j++) {
                if (heights[j] > tallest) { ans[i]++; tallest = heights[j]; }
                if (heights[j] > heights[i]) break;
            }
        }
        return ans;
    }
};`,
          python: r`class Solution:
    def canSeePersonsCount(self, heights: List[int]) -> List[int]:
        n = len(heights)
        ans = [0] * n
        for i in range(n):
            tallest = 0
            for j in range(i + 1, n):
                if heights[j] > tallest:
                    ans[i] += 1
                    tallest = heights[j]
                if heights[j] > heights[i]:
                    break
        return ans`,
          javascript: r`var canSeePersonsCount = function(heights) {
    const n = heights.length, ans = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
        let tallest = 0;
        for (let j = i + 1; j < n; j++) {
            if (heights[j] > tallest) { ans[i]++; tallest = heights[j]; }
            if (heights[j] > heights[i]) break;
        }
    }
    return ans;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Decreasing stack, scanned from the right',
        idea: 'Scan from the right with a stack of people who could still be seen from further left (decreasing from bottom to top). Everyone person i pops is visible to i, and hidden from everyone left of i.',
        steps: [
          'For `i` from `n − 1` down to 0:',
          'Pop every height smaller than `heights[i]`, adding 1 per pop.',
          'If the stack is not empty, its top is the first taller person: add 1.',
          'Push `heights[i]`.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Each height is pushed and popped at most once. Popped people are hidden behind i from the left, so they can be forgotten.',
        code: {
          java: r`class Solution {
    public int[] canSeePersonsCount(int[] heights) {
        int n = heights.length;
        int[] ans = new int[n];
        Deque<Integer> st = new ArrayDeque<>();
        for (int i = n - 1; i >= 0; i--) {
            while (!st.isEmpty() && st.peek() < heights[i]) { st.pop(); ans[i]++; }
            if (!st.isEmpty()) ans[i]++;
            st.push(heights[i]);
        }
        return ans;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> canSeePersonsCount(vector<int>& heights) {
        int n = heights.size();
        vector<int> ans(n, 0), st;
        for (int i = n - 1; i >= 0; i--) {
            while (!st.empty() && st.back() < heights[i]) { st.pop_back(); ans[i]++; }
            if (!st.empty()) ans[i]++;
            st.push_back(heights[i]);
        }
        return ans;
    }
};`,
          python: r`class Solution:
    def canSeePersonsCount(self, heights: List[int]) -> List[int]:
        ans = [0] * len(heights)
        st = []
        for i in range(len(heights) - 1, -1, -1):
            while st and st[-1] < heights[i]:
                st.pop()
                ans[i] += 1
            if st:
                ans[i] += 1
            st.append(heights[i])
        return ans`,
          javascript: r`var canSeePersonsCount = function(heights) {
    const n = heights.length, ans = new Array(n).fill(0), st = [];
    for (let i = n - 1; i >= 0; i--) {
        while (st.length && st[st.length - 1] < heights[i]) { st.pop(); ans[i]++; }
        if (st.length) ans[i]++;
        st.push(heights[i]);
    }
    return ans;
};`,
        },
      },
    ],
  },
  'continuous-subarrays': {
    pattern: 'Sliding window counting subarrays, with a max queue and a min queue',
    approaches: [
      {
        level: 'Brute force', name: 'Extend from every start',
        idea: 'Fix the start, extend the end while tracking the running min and max, and stop when they differ by more than 2.',
        steps: [
          'For each `l`, set `mn = mx = nums[l]`.',
          'For `r = l …`: update `mn` and `mx`; if `mx − mn > 2`, stop; otherwise count one subarray.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'An array of equal values makes every start walk to the end: 5 × 10⁹ steps for n = 10⁵.',
        code: {
          java: r`class Solution {
    public long continuousSubarrays(int[] nums) {
        long count = 0;
        for (int l = 0; l < nums.length; l++) {
            int mn = nums[l], mx = nums[l];
            for (int r = l; r < nums.length; r++) {
                mn = Math.min(mn, nums[r]);
                mx = Math.max(mx, nums[r]);
                if (mx - mn > 2) break;
                count++;
            }
        }
        return count;
    }
}`,
          cpp: r`class Solution {
public:
    long long continuousSubarrays(vector<int>& nums) {
        long long count = 0;
        int n = nums.size();
        for (int l = 0; l < n; l++) {
            int mn = nums[l], mx = nums[l];
            for (int r = l; r < n; r++) {
                mn = min(mn, nums[r]);
                mx = max(mx, nums[r]);
                if (mx - mn > 2) break;
                count++;
            }
        }
        return count;
    }
};`,
          python: r`class Solution:
    def continuousSubarrays(self, nums: List[int]) -> int:
        count = 0
        for l in range(len(nums)):
            mn = mx = nums[l]
            for r in range(l, len(nums)):
                mn, mx = min(mn, nums[r]), max(mx, nums[r])
                if mx - mn > 2:
                    break
                count += 1
        return count`,
          javascript: r`var continuousSubarrays = function(nums) {
    let count = 0;
    for (let l = 0; l < nums.length; l++) {
        let mn = nums[l], mx = nums[l];
        for (let r = l; r < nums.length; r++) {
            mn = Math.min(mn, nums[r]);
            mx = Math.max(mx, nums[r]);
            if (mx - mn > 2) break;
            count++;
        }
    }
    return count;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Sliding window with two monotonic deques',
        idea: 'A sub-window of a continuous window is continuous, so for each end r the valid starts are a range [l, r]. Keep the window\'s max and min with a max queue and a min queue.',
        steps: [
          'Push `r` onto both deques, popping from the back values that can never be the max (≤ nums[r]) or the min (≥ nums[r]).',
          'While `max − min > 2`, advance `l` and drop deque fronts that are now left of `l`.',
          'Add `r − l + 1`: every subarray ending at r that starts in [l, r].',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Each index enters and leaves each deque at most once, and l only moves right. The count can reach n(n + 1)/2 ≈ 5 × 10⁹: use 64 bits.',
        code: {
          java: r`class Solution {
    public long continuousSubarrays(int[] nums) {
        Deque<Integer> maxQ = new ArrayDeque<>(), minQ = new ArrayDeque<>();
        long count = 0;
        for (int l = 0, r = 0; r < nums.length; r++) {
            while (!maxQ.isEmpty() && nums[maxQ.peekLast()] <= nums[r]) maxQ.pollLast();
            maxQ.offerLast(r);
            while (!minQ.isEmpty() && nums[minQ.peekLast()] >= nums[r]) minQ.pollLast();
            minQ.offerLast(r);
            while (nums[maxQ.peekFirst()] - nums[minQ.peekFirst()] > 2) {
                l++;
                if (maxQ.peekFirst() < l) maxQ.pollFirst();
                if (minQ.peekFirst() < l) minQ.pollFirst();
            }
            count += r - l + 1;
        }
        return count;
    }
}`,
          cpp: r`class Solution {
public:
    long long continuousSubarrays(vector<int>& nums) {
        deque<int> maxQ, minQ;
        long long count = 0;
        for (int l = 0, r = 0; r < (int) nums.size(); r++) {
            while (!maxQ.empty() && nums[maxQ.back()] <= nums[r]) maxQ.pop_back();
            maxQ.push_back(r);
            while (!minQ.empty() && nums[minQ.back()] >= nums[r]) minQ.pop_back();
            minQ.push_back(r);
            while (nums[maxQ.front()] - nums[minQ.front()] > 2) {
                l++;
                if (maxQ.front() < l) maxQ.pop_front();
                if (minQ.front() < l) minQ.pop_front();
            }
            count += r - l + 1;
        }
        return count;
    }
};`,
          python: r`class Solution:
    def continuousSubarrays(self, nums: List[int]) -> int:
        max_q, min_q = deque(), deque()
        count = l = 0
        for r, x in enumerate(nums):
            while max_q and nums[max_q[-1]] <= x:
                max_q.pop()
            max_q.append(r)
            while min_q and nums[min_q[-1]] >= x:
                min_q.pop()
            min_q.append(r)
            while nums[max_q[0]] - nums[min_q[0]] > 2:
                l += 1
                if max_q[0] < l:
                    max_q.popleft()
                if min_q[0] < l:
                    min_q.popleft()
            count += r - l + 1
        return count`,
          javascript: r`var continuousSubarrays = function(nums) {
    // deques as arrays with head indexes (indexes are only ever added at the back)
    const maxQ = [], minQ = [];
    let mh = 0, nh = 0, l = 0, count = 0;
    for (let r = 0; r < nums.length; r++) {
        while (maxQ.length > mh && nums[maxQ[maxQ.length - 1]] <= nums[r]) maxQ.pop();
        maxQ.push(r);
        while (minQ.length > nh && nums[minQ[minQ.length - 1]] >= nums[r]) minQ.pop();
        minQ.push(r);
        while (nums[maxQ[mh]] - nums[minQ[nh]] > 2) {
            l++;
            if (maxQ[mh] < l) mh++;
            if (minQ[nh] < l) nh++;
        }
        count += r - l + 1;
    }
    return count;
};`,
        },
      },
    ],
  },
  'count-subarrays-with-fixed-bounds': {
    pattern: 'One pass remembering the last bad index, the last minK and the last maxK',
    approaches: [
      {
        level: 'Brute force', name: 'Extend from every start',
        idea: 'Fix the start and extend the end, tracking the min and max. A value outside [minK, maxK] ends the extension.',
        steps: [
          'For each `l`, extend `r` while `minK ≤ nums[r] ≤ maxK`, tracking whether minK and maxK have appeared.',
          'Count `[l, r]` whenever both have appeared.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'Long runs of in-range values make each start walk far.',
        code: {
          java: r`class Solution {
    public long countSubarrays(int[] nums, int minK, int maxK) {
        long count = 0;
        for (int l = 0; l < nums.length; l++) {
            boolean seenMin = false, seenMax = false;
            for (int r = l; r < nums.length && nums[r] >= minK && nums[r] <= maxK; r++) {
                if (nums[r] == minK) seenMin = true;
                if (nums[r] == maxK) seenMax = true;
                if (seenMin && seenMax) count++;
            }
        }
        return count;
    }
}`,
          cpp: r`class Solution {
public:
    long long countSubarrays(vector<int>& nums, int minK, int maxK) {
        long long count = 0;
        int n = nums.size();
        for (int l = 0; l < n; l++) {
            bool seenMin = false, seenMax = false;
            for (int r = l; r < n && nums[r] >= minK && nums[r] <= maxK; r++) {
                if (nums[r] == minK) seenMin = true;
                if (nums[r] == maxK) seenMax = true;
                if (seenMin && seenMax) count++;
            }
        }
        return count;
    }
};`,
          python: r`class Solution:
    def countSubarrays(self, nums: List[int], minK: int, maxK: int) -> int:
        count = 0
        for l in range(len(nums)):
            seen_min = seen_max = False
            for r in range(l, len(nums)):
                if not minK <= nums[r] <= maxK:
                    break
                seen_min |= nums[r] == minK
                seen_max |= nums[r] == maxK
                if seen_min and seen_max:
                    count += 1
        return count`,
          javascript: r`var countSubarrays = function(nums, minK, maxK) {
    let count = 0;
    for (let l = 0; l < nums.length; l++) {
        let seenMin = false, seenMax = false;
        for (let r = l; r < nums.length && nums[r] >= minK && nums[r] <= maxK; r++) {
            if (nums[r] === minK) seenMin = true;
            if (nums[r] === maxK) seenMax = true;
            if (seenMin && seenMax) count++;
        }
    }
    return count;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Last positions: bad, minK, maxK',
        idea: 'For a fixed end r, a start works if there is no bad value in between and both a minK and a maxK appear. That is every start from `bad + 1` up to `min(lastMin, lastMax)`.',
        steps: [
          'Keep `bad`, `lastMin` and `lastMax`, all starting at −1.',
          'At each r, update whichever applies: a value outside [minK, maxK] sets `bad`; minK sets `lastMin`; maxK sets `lastMax`.',
          'Add `max(0, min(lastMin, lastMax) − bad)`.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'No window needs to move: the three positions say exactly which starts are valid. If minK > maxK, every value is bad (or one of them can never appear), so nothing is counted.',
        code: {
          java: r`class Solution {
    public long countSubarrays(int[] nums, int minK, int maxK) {
        long count = 0;
        int bad = -1, lastMin = -1, lastMax = -1;
        for (int i = 0; i < nums.length; i++) {
            if (nums[i] < minK || nums[i] > maxK) bad = i;
            if (nums[i] == minK) lastMin = i;
            if (nums[i] == maxK) lastMax = i;
            count += Math.max(0, Math.min(lastMin, lastMax) - bad);
        }
        return count;
    }
}`,
          cpp: r`class Solution {
public:
    long long countSubarrays(vector<int>& nums, int minK, int maxK) {
        long long count = 0;
        int bad = -1, lastMin = -1, lastMax = -1;
        for (int i = 0; i < (int) nums.size(); i++) {
            if (nums[i] < minK || nums[i] > maxK) bad = i;
            if (nums[i] == minK) lastMin = i;
            if (nums[i] == maxK) lastMax = i;
            count += max(0, min(lastMin, lastMax) - bad);
        }
        return count;
    }
};`,
          python: r`class Solution:
    def countSubarrays(self, nums: List[int], minK: int, maxK: int) -> int:
        count = 0
        bad = last_min = last_max = -1
        for i, x in enumerate(nums):
            if x < minK or x > maxK:
                bad = i
            if x == minK:
                last_min = i
            if x == maxK:
                last_max = i
            count += max(0, min(last_min, last_max) - bad)
        return count`,
          javascript: r`var countSubarrays = function(nums, minK, maxK) {
    let count = 0, bad = -1, lastMin = -1, lastMax = -1;
    for (let i = 0; i < nums.length; i++) {
        if (nums[i] < minK || nums[i] > maxK) bad = i;
        if (nums[i] === minK) lastMin = i;
        if (nums[i] === maxK) lastMax = i;
        count += Math.max(0, Math.min(lastMin, lastMax) - bad);
    }
    return count;
};`,
        },
      },
    ],
  },
  'count-subarrays-with-cost-less-than-or-equal-to-k': {
    pattern: 'Monotone cost → sliding window counting, with a max queue and a min queue',
    approaches: [
      {
        level: 'Brute force', name: 'Extend from every start',
        idea: 'Fix the start and extend the end, tracking the running min and max. The cost only grows as the subarray grows, so stop at the first one over k.',
        steps: [
          'For each `l`, track `mn` and `mx` while extending `r`.',
          'If `(mx − mn) × (r − l + 1) > k`, stop; otherwise count one subarray.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'With a large k every start walks to the end. Compute the cost in 64 bits: it can reach 10¹⁴.',
        code: {
          java: r`class Solution {
    public long countSubarrays(int[] nums, long k) {
        long count = 0;
        for (int l = 0; l < nums.length; l++) {
            int mn = nums[l], mx = nums[l];
            for (int r = l; r < nums.length; r++) {
                mn = Math.min(mn, nums[r]);
                mx = Math.max(mx, nums[r]);
                if ((long) (mx - mn) * (r - l + 1) > k) break;
                count++;
            }
        }
        return count;
    }
}`,
          cpp: r`class Solution {
public:
    long long countSubarrays(vector<int>& nums, long long k) {
        long long count = 0;
        int n = nums.size();
        for (int l = 0; l < n; l++) {
            int mn = nums[l], mx = nums[l];
            for (int r = l; r < n; r++) {
                mn = min(mn, nums[r]);
                mx = max(mx, nums[r]);
                if ((long long) (mx - mn) * (r - l + 1) > k) break;
                count++;
            }
        }
        return count;
    }
};`,
          python: r`class Solution:
    def countSubarrays(self, nums: List[int], k: int) -> int:
        count = 0
        for l in range(len(nums)):
            mn = mx = nums[l]
            for r in range(l, len(nums)):
                mn, mx = min(mn, nums[r]), max(mx, nums[r])
                if (mx - mn) * (r - l + 1) > k:
                    break
                count += 1
        return count`,
          javascript: r`var countSubarrays = function(nums, k) {
    let count = 0;
    for (let l = 0; l < nums.length; l++) {
        let mn = nums[l], mx = nums[l];
        for (let r = l; r < nums.length; r++) {
            mn = Math.min(mn, nums[r]);
            mx = Math.max(mx, nums[r]);
            if ((mx - mn) * (r - l + 1) > k) break;
            count++;
        }
    }
    return count;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Sliding window with two monotonic deques',
        idea: 'Shrinking a subarray never raises its cost: the spread can only stay or drop, and so does the length. So the valid starts for each end r form a range [l, r], and l only moves right.',
        steps: [
          'Push `r` onto the max queue and the min queue (popping dominated indexes from the back).',
          'While `(max − min) × (r − l + 1) > k`, advance `l` and drop deque fronts left of `l`.',
          'Add `r − l + 1`.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'The same window as Continuous Subarrays, with a different validity test. The key is to check that the condition is monotone before reaching for a sliding window.',
        code: {
          java: r`class Solution {
    public long countSubarrays(int[] nums, long k) {
        Deque<Integer> maxQ = new ArrayDeque<>(), minQ = new ArrayDeque<>();
        long count = 0;
        for (int l = 0, r = 0; r < nums.length; r++) {
            while (!maxQ.isEmpty() && nums[maxQ.peekLast()] <= nums[r]) maxQ.pollLast();
            maxQ.offerLast(r);
            while (!minQ.isEmpty() && nums[minQ.peekLast()] >= nums[r]) minQ.pollLast();
            minQ.offerLast(r);
            while ((long) (nums[maxQ.peekFirst()] - nums[minQ.peekFirst()]) * (r - l + 1) > k) {
                l++;
                if (maxQ.peekFirst() < l) maxQ.pollFirst();
                if (minQ.peekFirst() < l) minQ.pollFirst();
            }
            count += r - l + 1;
        }
        return count;
    }
}`,
          cpp: r`class Solution {
public:
    long long countSubarrays(vector<int>& nums, long long k) {
        deque<int> maxQ, minQ;
        long long count = 0;
        for (int l = 0, r = 0; r < (int) nums.size(); r++) {
            while (!maxQ.empty() && nums[maxQ.back()] <= nums[r]) maxQ.pop_back();
            maxQ.push_back(r);
            while (!minQ.empty() && nums[minQ.back()] >= nums[r]) minQ.pop_back();
            minQ.push_back(r);
            while ((long long) (nums[maxQ.front()] - nums[minQ.front()]) * (r - l + 1) > k) {
                l++;
                if (maxQ.front() < l) maxQ.pop_front();
                if (minQ.front() < l) minQ.pop_front();
            }
            count += r - l + 1;
        }
        return count;
    }
};`,
          python: r`class Solution:
    def countSubarrays(self, nums: List[int], k: int) -> int:
        max_q, min_q = deque(), deque()
        count = l = 0
        for r, x in enumerate(nums):
            while max_q and nums[max_q[-1]] <= x:
                max_q.pop()
            max_q.append(r)
            while min_q and nums[min_q[-1]] >= x:
                min_q.pop()
            min_q.append(r)
            while (nums[max_q[0]] - nums[min_q[0]]) * (r - l + 1) > k:
                l += 1
                if max_q[0] < l:
                    max_q.popleft()
                if min_q[0] < l:
                    min_q.popleft()
            count += r - l + 1
        return count`,
          javascript: r`var countSubarrays = function(nums, k) {
    const maxQ = [], minQ = [];
    let mh = 0, nh = 0, l = 0, count = 0;
    for (let r = 0; r < nums.length; r++) {
        while (maxQ.length > mh && nums[maxQ[maxQ.length - 1]] <= nums[r]) maxQ.pop();
        maxQ.push(r);
        while (minQ.length > nh && nums[minQ[minQ.length - 1]] >= nums[r]) minQ.pop();
        minQ.push(r);
        while ((nums[maxQ[mh]] - nums[minQ[nh]]) * (r - l + 1) > k) {
            l++;
            if (maxQ[mh] < l) mh++;
            if (minQ[nh] < l) nh++;
        }
        count += r - l + 1;
    }
    return count;
};`,
        },
      },
    ],
  },
  'count-prime-gap-balanced-subarrays': {
    pattern: 'Sieve, then a sliding window over the primes with a max queue and a min queue',
    approaches: [
      {
        level: 'Brute force', name: 'Extend from every start',
        idea: 'Sieve the primes. For each start, extend the end while tracking the number of primes and the smallest and largest prime; stop once the prime spread exceeds k.',
        steps: [
          'Mark primes up to `max(nums)` with a sieve.',
          'For each `l`, extend `r`; for a prime, update `count`, `lo` and `hi`. If `hi − lo > k`, stop.',
          'Count `[l, r]` whenever it holds at least two primes.',
        ],
        time: 'O(n² + M log log M)', space: 'O(M), M = max(nums)',
        why: 'Each start may extend to the end of the array.',
        code: {
          java: r`class Solution {
    public int primeSubarray(int[] nums, int k) {
        int max = 0;
        for (int x : nums) max = Math.max(max, x);
        boolean[] composite = new boolean[max + 1];
        for (int i = 2; (long) i * i <= max; i++)
            if (!composite[i]) for (int j = i * i; j <= max; j += i) composite[j] = true;
        int count = 0;
        for (int l = 0; l < nums.length; l++) {
            int primes = 0, lo = Integer.MAX_VALUE, hi = 0;
            for (int r = l; r < nums.length; r++) {
                if (nums[r] >= 2 && !composite[nums[r]]) {
                    primes++;
                    lo = Math.min(lo, nums[r]);
                    hi = Math.max(hi, nums[r]);
                    if (hi - lo > k) break;
                }
                if (primes >= 2) count++;
            }
        }
        return count;
    }
}`,
          cpp: r`class Solution {
public:
    int primeSubarray(vector<int>& nums, int k) {
        int mx = *max_element(nums.begin(), nums.end());
        vector<bool> composite(mx + 1, false);
        for (long long i = 2; i * i <= mx; i++)
            if (!composite[i]) for (long long j = i * i; j <= mx; j += i) composite[j] = true;
        int count = 0, n = nums.size();
        for (int l = 0; l < n; l++) {
            int primes = 0, lo = INT_MAX, hi = 0;
            for (int r = l; r < n; r++) {
                if (nums[r] >= 2 && !composite[nums[r]]) {
                    primes++;
                    lo = min(lo, nums[r]);
                    hi = max(hi, nums[r]);
                    if (hi - lo > k) break;
                }
                if (primes >= 2) count++;
            }
        }
        return count;
    }
};`,
          python: r`class Solution:
    def primeSubarray(self, nums: List[int], k: int) -> int:
        m = max(nums)
        is_prime = [False, False] + [True] * (m - 1)
        for i in range(2, isqrt(m) + 1):
            if is_prime[i]:
                for j in range(i * i, m + 1, i):
                    is_prime[j] = False
        count = 0
        for l in range(len(nums)):
            primes, lo, hi = 0, inf, 0
            for r in range(l, len(nums)):
                if is_prime[nums[r]]:
                    primes += 1
                    lo, hi = min(lo, nums[r]), max(hi, nums[r])
                    if hi - lo > k:
                        break
                if primes >= 2:
                    count += 1
        return count`,
          javascript: r`var primeSubarray = function(nums, k) {
    const m = Math.max(...nums);
    const composite = new Uint8Array(m + 1);
    for (let i = 2; i * i <= m; i++)
        if (!composite[i]) for (let j = i * i; j <= m; j += i) composite[j] = 1;
    const isPrime = (x) => x >= 2 && !composite[x];
    let count = 0;
    for (let l = 0; l < nums.length; l++) {
        let primes = 0, lo = Infinity, hi = 0;
        for (let r = l; r < nums.length; r++) {
            if (isPrime(nums[r])) {
                primes++;
                lo = Math.min(lo, nums[r]);
                hi = Math.max(hi, nums[r]);
                if (hi - lo > k) break;
            }
            if (primes >= 2) count++;
        }
    }
    return count;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Sliding window over the primes',
        idea: 'For a fixed end r, extending the start to the left only adds primes, so the prime spread only grows. The starts that keep it ≤ k form a range [l, r]; l is moved by a max queue and a min queue that hold only prime indexes. The start must also keep the two latest primes.',
        steps: [
          'Sieve the primes up to `max(nums)`.',
          'At a prime `r`: shift `last` to `prev` and set `last = r`; push r onto both deques; while the deques\' max − min > k, advance `l` and drop fronts left of `l`.',
          'For every r (prime or not), the valid starts are `l … prev` (the second-latest prime): add `prev − l + 1` when `prev ≥ l`.',
        ],
        time: 'O(n + M log log M)', space: 'O(n + M)',
        why: 'Non-primes never change the spread, so the window only moves at primes. The count of starts needs two conditions at once: spread ≤ k (gives the lower end l) and two primes (gives the upper end prev).',
        code: {
          java: r`class Solution {
    public int primeSubarray(int[] nums, int k) {
        int max = 0;
        for (int x : nums) max = Math.max(max, x);
        boolean[] composite = new boolean[max + 1];
        for (int i = 2; (long) i * i <= max; i++)
            if (!composite[i]) for (int j = i * i; j <= max; j += i) composite[j] = true;
        Deque<Integer> maxQ = new ArrayDeque<>(), minQ = new ArrayDeque<>();
        int count = 0, last = -1, prev = -1;
        for (int l = 0, r = 0; r < nums.length; r++) {
            int x = nums[r];
            if (x >= 2 && !composite[x]) {
                prev = last; last = r;
                while (!maxQ.isEmpty() && nums[maxQ.peekLast()] <= x) maxQ.pollLast();
                maxQ.offerLast(r);
                while (!minQ.isEmpty() && nums[minQ.peekLast()] >= x) minQ.pollLast();
                minQ.offerLast(r);
                while (nums[maxQ.peekFirst()] - nums[minQ.peekFirst()] > k) {
                    l++;
                    if (maxQ.peekFirst() < l) maxQ.pollFirst();
                    if (minQ.peekFirst() < l) minQ.pollFirst();
                }
            }
            if (prev >= l) count += prev - l + 1;
        }
        return count;
    }
}`,
          cpp: r`class Solution {
public:
    int primeSubarray(vector<int>& nums, int k) {
        int mx = *max_element(nums.begin(), nums.end());
        vector<bool> composite(mx + 1, false);
        for (long long i = 2; i * i <= mx; i++)
            if (!composite[i]) for (long long j = i * i; j <= mx; j += i) composite[j] = true;
        deque<int> maxQ, minQ;
        int count = 0, last = -1, prev = -1;
        for (int l = 0, r = 0; r < (int) nums.size(); r++) {
            int x = nums[r];
            if (x >= 2 && !composite[x]) {
                prev = last; last = r;
                while (!maxQ.empty() && nums[maxQ.back()] <= x) maxQ.pop_back();
                maxQ.push_back(r);
                while (!minQ.empty() && nums[minQ.back()] >= x) minQ.pop_back();
                minQ.push_back(r);
                while (nums[maxQ.front()] - nums[minQ.front()] > k) {
                    l++;
                    if (maxQ.front() < l) maxQ.pop_front();
                    if (minQ.front() < l) minQ.pop_front();
                }
            }
            if (prev >= l) count += prev - l + 1;
        }
        return count;
    }
};`,
          python: r`class Solution:
    def primeSubarray(self, nums: List[int], k: int) -> int:
        m = max(nums)
        is_prime = [False, False] + [True] * (m - 1)
        for i in range(2, isqrt(m) + 1):
            if is_prime[i]:
                for j in range(i * i, m + 1, i):
                    is_prime[j] = False
        max_q, min_q = deque(), deque()
        count = l = 0
        last = prev = -1
        for r, x in enumerate(nums):
            if is_prime[x]:
                prev, last = last, r
                while max_q and nums[max_q[-1]] <= x:
                    max_q.pop()
                max_q.append(r)
                while min_q and nums[min_q[-1]] >= x:
                    min_q.pop()
                min_q.append(r)
                while nums[max_q[0]] - nums[min_q[0]] > k:
                    l += 1
                    if max_q[0] < l:
                        max_q.popleft()
                    if min_q[0] < l:
                        min_q.popleft()
            if prev >= l:
                count += prev - l + 1
        return count`,
          javascript: r`var primeSubarray = function(nums, k) {
    const m = Math.max(...nums);
    const composite = new Uint8Array(m + 1);
    for (let i = 2; i * i <= m; i++)
        if (!composite[i]) for (let j = i * i; j <= m; j += i) composite[j] = 1;
    const maxQ = [], minQ = [];
    let mh = 0, nh = 0, l = 0, count = 0, last = -1, prev = -1;
    for (let r = 0; r < nums.length; r++) {
        const x = nums[r];
        if (x >= 2 && !composite[x]) {
            prev = last; last = r;
            while (maxQ.length > mh && nums[maxQ[maxQ.length - 1]] <= x) maxQ.pop();
            maxQ.push(r);
            while (minQ.length > nh && nums[minQ[minQ.length - 1]] >= x) minQ.pop();
            minQ.push(r);
            while (nums[maxQ[mh]] - nums[minQ[nh]] > k) {
                l++;
                if (maxQ[mh] < l) mh++;
                if (minQ[nh] < l) nh++;
            }
        }
        if (prev >= l) count += prev - l + 1;
    }
    return count;
};`,
        },
      },
    ],
  },
};
