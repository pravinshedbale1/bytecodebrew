const r = String.raw;

export default {
  'maximum-average-subarray-i': {
    pattern: 'Fixed-size sliding window (add the element that enters, subtract the one that leaves)',
    approaches: [
      {
        level: 'Brute force', name: 'Sum every window from scratch',
        idea: 'There are n − k + 1 windows of size k. Add up each one separately and keep the largest sum; the best average is that sum divided by k.',
        steps: [
          'For each start `i` from 0 to n − k, add `nums[i] … nums[i + k − 1]`.',
          'Keep the largest sum seen.',
          'Return the largest sum divided by `k` (as a decimal).',
        ],
        time: 'O(n·k)', space: 'O(1)',
        why: 'n − k + 1 windows, each summed in O(k). When k is about n/2 that is about n²/4 additions.',
        code: {
          java: r`class Solution {
    public double findMaxAverage(int[] nums, int k) {
        long best = Long.MIN_VALUE;
        for (int i = 0; i + k <= nums.length; i++) {
            long sum = 0;
            for (int j = i; j < i + k; j++) sum += nums[j];
            best = Math.max(best, sum);
        }
        return (double) best / k;
    }
}`,
          cpp: r`class Solution {
public:
    double findMaxAverage(vector<int>& nums, int k) {
        long long best = LLONG_MIN;
        for (int i = 0; i + k <= (int) nums.size(); i++) {
            long long sum = 0;
            for (int j = i; j < i + k; j++) sum += nums[j];
            best = max(best, sum);
        }
        return (double) best / k;
    }
};`,
          python: r`class Solution:
    def findMaxAverage(self, nums: List[int], k: int) -> float:
        best = max(sum(nums[i:i + k]) for i in range(len(nums) - k + 1))
        return best / k`,
          javascript: r`var findMaxAverage = function(nums, k) {
    let best = -Infinity;
    for (let i = 0; i + k <= nums.length; i++) {
        let sum = 0;
        for (let j = i; j < i + k; j++) sum += nums[j];
        best = Math.max(best, sum);
    }
    return best / k;
};`,
        },
      },
      {
        level: 'Better', name: 'Prefix sums',
        idea: 'With `prefix[i]` = sum of the first `i` values, any window sum is a difference of two prefix sums: `prefix[i + k] − prefix[i]`.',
        steps: [
          'Build `prefix` of length n + 1 with `prefix[0] = 0` and `prefix[i + 1] = prefix[i] + nums[i]`.',
          'For each start `i`, the window sum is `prefix[i + k] − prefix[i]`; keep the largest.',
          'Return the largest sum divided by `k`.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'One pass builds the prefix array and one pass reads n − k + 1 differences. The prefix array costs O(n) memory, which the sliding window avoids.',
        code: {
          java: r`class Solution {
    public double findMaxAverage(int[] nums, int k) {
        int n = nums.length;
        long[] prefix = new long[n + 1];
        for (int i = 0; i < n; i++) prefix[i + 1] = prefix[i] + nums[i];
        long best = Long.MIN_VALUE;
        for (int i = 0; i + k <= n; i++) best = Math.max(best, prefix[i + k] - prefix[i]);
        return (double) best / k;
    }
}`,
          cpp: r`class Solution {
public:
    double findMaxAverage(vector<int>& nums, int k) {
        int n = nums.size();
        vector<long long> prefix(n + 1, 0);
        for (int i = 0; i < n; i++) prefix[i + 1] = prefix[i] + nums[i];
        long long best = LLONG_MIN;
        for (int i = 0; i + k <= n; i++) best = max(best, prefix[i + k] - prefix[i]);
        return (double) best / k;
    }
};`,
          python: r`class Solution:
    def findMaxAverage(self, nums: List[int], k: int) -> float:
        prefix = [0]
        for x in nums:
            prefix.append(prefix[-1] + x)
        best = max(prefix[i + k] - prefix[i] for i in range(len(nums) - k + 1))
        return best / k`,
          javascript: r`var findMaxAverage = function(nums, k) {
    const n = nums.length, prefix = [0];
    for (let i = 0; i < n; i++) prefix.push(prefix[i] + nums[i]);
    let best = -Infinity;
    for (let i = 0; i + k <= n; i++) best = Math.max(best, prefix[i + k] - prefix[i]);
    return best / k;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Slide a window of size k',
        idea: 'Neighbouring windows share k − 1 elements. Moving the window one step adds the new element on the right and removes the one that falls off the left.',
        steps: [
          'Sum the first `k` elements; this is the current and best sum.',
          'For `i` from `k` to n − 1: `sum += nums[i] − nums[i − k]`, then update the best.',
          'Return the best sum divided by `k`.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'Each element enters the window once and leaves once, and only the running sum and the best are stored. Dividing only at the end avoids rounding on every step.',
        code: {
          java: r`class Solution {
    public double findMaxAverage(int[] nums, int k) {
        long sum = 0;
        for (int i = 0; i < k; i++) sum += nums[i];
        long best = sum;
        for (int i = k; i < nums.length; i++) {
            sum += nums[i] - nums[i - k];
            best = Math.max(best, sum);
        }
        return (double) best / k;
    }
}`,
          cpp: r`class Solution {
public:
    double findMaxAverage(vector<int>& nums, int k) {
        long long sum = 0;
        for (int i = 0; i < k; i++) sum += nums[i];
        long long best = sum;
        for (int i = k; i < (int) nums.size(); i++) {
            sum += nums[i] - nums[i - k];
            best = max(best, sum);
        }
        return (double) best / k;
    }
};`,
          python: r`class Solution:
    def findMaxAverage(self, nums: List[int], k: int) -> float:
        s = sum(nums[:k])
        best = s
        for i in range(k, len(nums)):
            s += nums[i] - nums[i - k]
            best = max(best, s)
        return best / k`,
          javascript: r`var findMaxAverage = function(nums, k) {
    let sum = 0;
    for (let i = 0; i < k; i++) sum += nums[i];
    let best = sum;
    for (let i = k; i < nums.length; i++) {
        sum += nums[i] - nums[i - k];
        best = Math.max(best, sum);
    }
    return best / k;
};`,
        },
      },
    ],
  },

  'longest-substring-without-repeating-characters': {
    pattern: 'Variable-size sliding window (grow on the right, shrink on the left while the window is invalid)',
    approaches: [
      {
        level: 'Brute force', name: 'From every start, extend until a character repeats',
        idea: 'For each starting index, keep adding characters to a set; the first repeated character ends the longest valid substring from that start.',
        steps: [
          'For each start `i`, create an empty set.',
          'Move `j` from `i` to the right; if `s[j]` is already in the set, stop; otherwise add it.',
          'The substring `s[i..j)` has no repeats; update the best length with `j − i`.',
          'Return the best length.',
        ],
        time: 'O(n²)', space: 'O(σ)',
        why: 'Each start can scan to the end of the string, giving O(n²) in the worst case. (A scan never runs longer than the alphabet size σ before repeating, so it is really O(n·σ).) The set holds at most σ characters.',
        code: {
          java: r`class Solution {
    public int lengthOfLongestSubstring(String s) {
        int best = 0;
        for (int i = 0; i < s.length(); i++) {
            Set<Character> seen = new HashSet<>();
            int j = i;
            while (j < s.length() && seen.add(s.charAt(j))) j++;
            best = Math.max(best, j - i);
        }
        return best;
    }
}`,
          cpp: r`class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        int best = 0, n = s.size();
        for (int i = 0; i < n; i++) {
            unordered_set<char> seen;
            int j = i;
            while (j < n && !seen.count(s[j])) seen.insert(s[j++]);
            best = max(best, j - i);
        }
        return best;
    }
};`,
          python: r`class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        best = 0
        for i in range(len(s)):
            seen = set()
            j = i
            while j < len(s) and s[j] not in seen:
                seen.add(s[j])
                j += 1
            best = max(best, j - i)
        return best`,
          javascript: r`var lengthOfLongestSubstring = function(s) {
    let best = 0;
    for (let i = 0; i < s.length; i++) {
        const seen = new Set();
        let j = i;
        while (j < s.length && !seen.has(s[j])) seen.add(s[j++]);
        best = Math.max(best, j - i);
    }
    return best;
};`,
        },
      },
      {
        level: 'Better', name: 'Sliding window with a set, shrinking one step at a time',
        idea: 'Keep a window `s[l..r]` with no repeats. When `s[r]` is already inside, remove characters from the left until it is not.',
        steps: [
          'Set `l = 0` and an empty set.',
          'For each `r`: while `s[r]` is in the set, remove `s[l]` and move `l` right.',
          'Add `s[r]`; the window `s[l..r]` has no repeats, so update the best with `r − l + 1`.',
          'Return the best length.',
        ],
        time: 'O(n)', space: 'O(σ)',
        why: 'Each character is added once (when `r` reaches it) and removed at most once (when `l` passes it): at most 2n set operations. The set holds at most σ characters.',
        code: {
          java: r`class Solution {
    public int lengthOfLongestSubstring(String s) {
        Set<Character> window = new HashSet<>();
        int best = 0;
        for (int l = 0, r = 0; r < s.length(); r++) {
            while (window.contains(s.charAt(r))) window.remove(s.charAt(l++));
            window.add(s.charAt(r));
            best = Math.max(best, r - l + 1);
        }
        return best;
    }
}`,
          cpp: r`class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        unordered_set<char> window;
        int best = 0;
        for (int l = 0, r = 0; r < (int) s.size(); r++) {
            while (window.count(s[r])) window.erase(s[l++]);
            window.insert(s[r]);
            best = max(best, r - l + 1);
        }
        return best;
    }
};`,
          python: r`class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        window = set()
        best = l = 0
        for r, c in enumerate(s):
            while c in window:
                window.remove(s[l])
                l += 1
            window.add(c)
            best = max(best, r - l + 1)
        return best`,
          javascript: r`var lengthOfLongestSubstring = function(s) {
    const window = new Set();
    let best = 0;
    for (let l = 0, r = 0; r < s.length; r++) {
        while (window.has(s[r])) window.delete(s[l++]);
        window.add(s[r]);
        best = Math.max(best, r - l + 1);
    }
    return best;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Sliding window that jumps using the last position of each character',
        idea: 'Remember where each character was last seen. When `s[r]` repeats inside the window, the left edge can jump straight past its previous position instead of stepping there.',
        steps: [
          'Keep `last[c]` = the last index where character `c` appeared (−1 if never), and `l = 0`.',
          'For each `r`: if `last[s[r]] >= l`, the repeat is inside the window, so set `l = last[s[r]] + 1`.',
          'Set `last[s[r]] = r` and update the best with `r − l + 1`.',
          'Return the best length.',
        ],
        time: 'O(n)', space: 'O(σ)',
        why: 'One pass with O(1) work per character; `l` only moves forward. The table has one entry per possible character (128 for ASCII).',
        code: {
          java: r`class Solution {
    public int lengthOfLongestSubstring(String s) {
        int[] last = new int[128];
        Arrays.fill(last, -1);
        int best = 0;
        for (int l = 0, r = 0; r < s.length(); r++) {
            char c = s.charAt(r);
            if (last[c] >= l) l = last[c] + 1;
            last[c] = r;
            best = Math.max(best, r - l + 1);
        }
        return best;
    }
}`,
          cpp: r`class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        vector<int> last(128, -1);
        int best = 0;
        for (int l = 0, r = 0; r < (int) s.size(); r++) {
            unsigned char c = s[r];
            if (last[c] >= l) l = last[c] + 1;
            last[c] = r;
            best = max(best, r - l + 1);
        }
        return best;
    }
};`,
          python: r`class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        last = {}
        best = l = 0
        for r, c in enumerate(s):
            if last.get(c, -1) >= l:
                l = last[c] + 1
            last[c] = r
            best = max(best, r - l + 1)
        return best`,
          javascript: r`var lengthOfLongestSubstring = function(s) {
    const last = new Map();
    let best = 0;
    for (let l = 0, r = 0; r < s.length; r++) {
        const c = s[r];
        if (last.has(c) && last.get(c) >= l) l = last.get(c) + 1;
        last.set(c, r);
        best = Math.max(best, r - l + 1);
    }
    return best;
};`,
        },
      },
    ],
  },

  'minimum-size-subarray-sum': {
    pattern: 'Variable-size sliding window on positive numbers (shrink while the window is still valid)',
    approaches: [
      {
        level: 'Brute force', name: 'From every start, extend until the sum reaches target',
        idea: 'For each start, add elements until the sum reaches `target`; the first such end gives the shortest subarray from that start.',
        steps: [
          'For each start `i`, set `sum = 0`.',
          'Move `j` right from `i`, adding `nums[j]`; as soon as `sum >= target`, record `j − i + 1` and stop.',
          'Return the smallest length recorded, or 0 if none.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'Each start may scan to the end: about n²/2 additions in the worst case.',
        code: {
          java: r`class Solution {
    public int minSubArrayLen(int target, int[] nums) {
        int n = nums.length, best = Integer.MAX_VALUE;
        for (int i = 0; i < n; i++) {
            long sum = 0;
            for (int j = i; j < n; j++) {
                sum += nums[j];
                if (sum >= target) { best = Math.min(best, j - i + 1); break; }
            }
        }
        return best == Integer.MAX_VALUE ? 0 : best;
    }
}`,
          cpp: r`class Solution {
public:
    int minSubArrayLen(int target, vector<int>& nums) {
        int n = nums.size(), best = INT_MAX;
        for (int i = 0; i < n; i++) {
            long long sum = 0;
            for (int j = i; j < n; j++) {
                sum += nums[j];
                if (sum >= target) { best = min(best, j - i + 1); break; }
            }
        }
        return best == INT_MAX ? 0 : best;
    }
};`,
          python: r`class Solution:
    def minSubArrayLen(self, target: int, nums: List[int]) -> int:
        n, best = len(nums), inf
        for i in range(n):
            s = 0
            for j in range(i, n):
                s += nums[j]
                if s >= target:
                    best = min(best, j - i + 1)
                    break
        return 0 if best == inf else best`,
          javascript: r`var minSubArrayLen = function(target, nums) {
    const n = nums.length;
    let best = Infinity;
    for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = i; j < n; j++) {
            sum += nums[j];
            if (sum >= target) { best = Math.min(best, j - i + 1); break; }
        }
    }
    return best === Infinity ? 0 : best;
};`,
        },
      },
      {
        level: 'Better', name: 'Prefix sums and binary search',
        idea: 'All values are positive, so prefix sums are strictly increasing. For each start `i`, binary search the first end where `prefix[end] − prefix[i] >= target`.',
        steps: [
          'Build `prefix` with `prefix[0] = 0`, `prefix[k + 1] = prefix[k] + nums[k]`.',
          'For each start `i`, binary search the smallest `e` with `prefix[e] >= prefix[i] + target`.',
          'If such an `e` exists, the subarray `nums[i..e − 1]` has length `e − i`; keep the smallest.',
          'Return the smallest length, or 0.',
        ],
        time: 'O(n log n)', space: 'O(n)',
        why: 'n binary searches over an array of n + 1 prefix sums. Binary search works only because positive values make the prefix sums sorted.',
        code: {
          java: r`class Solution {
    public int minSubArrayLen(int target, int[] nums) {
        int n = nums.length, best = Integer.MAX_VALUE;
        long[] prefix = new long[n + 1];
        for (int i = 0; i < n; i++) prefix[i + 1] = prefix[i] + nums[i];
        for (int i = 0; i < n; i++) {
            long want = prefix[i] + target;
            int lo = i + 1, hi = n;
            while (lo < hi) {
                int mid = (lo + hi) >>> 1;
                if (prefix[mid] >= want) hi = mid; else lo = mid + 1;
            }
            if (prefix[lo] >= want) best = Math.min(best, lo - i);
        }
        return best == Integer.MAX_VALUE ? 0 : best;
    }
}`,
          cpp: r`class Solution {
public:
    int minSubArrayLen(int target, vector<int>& nums) {
        int n = nums.size(), best = INT_MAX;
        vector<long long> prefix(n + 1, 0);
        for (int i = 0; i < n; i++) prefix[i + 1] = prefix[i] + nums[i];
        for (int i = 0; i < n; i++) {
            auto it = lower_bound(prefix.begin() + i + 1, prefix.end(), prefix[i] + target);
            if (it != prefix.end()) best = min(best, (int) (it - prefix.begin()) - i);
        }
        return best == INT_MAX ? 0 : best;
    }
};`,
          python: r`class Solution:
    def minSubArrayLen(self, target: int, nums: List[int]) -> int:
        n = len(nums)
        prefix = [0]
        for x in nums:
            prefix.append(prefix[-1] + x)
        best = inf
        for i in range(n):
            e = bisect_left(prefix, prefix[i] + target, i + 1)
            if e <= n:
                best = min(best, e - i)
        return 0 if best == inf else best`,
          javascript: r`var minSubArrayLen = function(target, nums) {
    const n = nums.length, prefix = [0];
    for (let i = 0; i < n; i++) prefix.push(prefix[i] + nums[i]);
    let best = Infinity;
    for (let i = 0; i < n; i++) {
        const want = prefix[i] + target;
        let lo = i + 1, hi = n;
        while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (prefix[mid] >= want) hi = mid; else lo = mid + 1;
        }
        if (prefix[lo] >= want) best = Math.min(best, lo - i);
    }
    return best === Infinity ? 0 : best;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Sliding window: grow right, shrink left while the sum is enough',
        idea: 'Extend the window to the right; whenever its sum reaches `target`, record the length and shrink from the left as long as the sum stays at or above `target`.',
        steps: [
          'Set `l = 0`, `sum = 0`.',
          'For each `r`, add `nums[r]` to `sum`.',
          'While `sum >= target`: record `r − l + 1`, subtract `nums[l]`, and move `l` right.',
          'Return the smallest length recorded, or 0.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'Each index enters the window once and leaves at most once, so the total work is O(n). Positivity is what makes this valid: shrinking can only lower the sum, so once it drops below `target` no shorter window ending at `r` exists.',
        code: {
          java: r`class Solution {
    public int minSubArrayLen(int target, int[] nums) {
        int best = Integer.MAX_VALUE, sum = 0;
        for (int l = 0, r = 0; r < nums.length; r++) {
            sum += nums[r];
            while (sum >= target) {
                best = Math.min(best, r - l + 1);
                sum -= nums[l++];
            }
        }
        return best == Integer.MAX_VALUE ? 0 : best;
    }
}`,
          cpp: r`class Solution {
public:
    int minSubArrayLen(int target, vector<int>& nums) {
        int best = INT_MAX, sum = 0;
        for (int l = 0, r = 0; r < (int) nums.size(); r++) {
            sum += nums[r];
            while (sum >= target) {
                best = min(best, r - l + 1);
                sum -= nums[l++];
            }
        }
        return best == INT_MAX ? 0 : best;
    }
};`,
          python: r`class Solution:
    def minSubArrayLen(self, target: int, nums: List[int]) -> int:
        best, s, l = inf, 0, 0
        for r, x in enumerate(nums):
            s += x
            while s >= target:
                best = min(best, r - l + 1)
                s -= nums[l]
                l += 1
        return 0 if best == inf else best`,
          javascript: r`var minSubArrayLen = function(target, nums) {
    let best = Infinity, sum = 0;
    for (let l = 0, r = 0; r < nums.length; r++) {
        sum += nums[r];
        while (sum >= target) {
            best = Math.min(best, r - l + 1);
            sum -= nums[l++];
        }
    }
    return best === Infinity ? 0 : best;
};`,
        },
      },
    ],
  },

  'max-consecutive-ones-iii': {
    pattern: 'Variable-size sliding window with a budget (at most k zeros inside)',
    approaches: [
      {
        level: 'Brute force', name: 'From every start, extend while at most k zeros',
        idea: 'Flipping at most k zeros means finding the longest subarray with at most k zeros. Try every start and extend until a (k + 1)-th zero appears.',
        steps: [
          'For each start `i`, set `zeros = 0`.',
          'Move `j` right; count zeros; stop when `zeros` would exceed `k`.',
          'The run `nums[i..j)` is valid; update the best with `j − i`.',
          'Return the best.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'Each start may scan to the end of the array.',
        code: {
          java: r`class Solution {
    public int longestOnes(int[] nums, int k) {
        int n = nums.length, best = 0;
        for (int i = 0; i < n; i++) {
            int zeros = 0, j = i;
            while (j < n && zeros + (nums[j] == 0 ? 1 : 0) <= k) {
                if (nums[j] == 0) zeros++;
                j++;
            }
            best = Math.max(best, j - i);
        }
        return best;
    }
}`,
          cpp: r`class Solution {
public:
    int longestOnes(vector<int>& nums, int k) {
        int n = nums.size(), best = 0;
        for (int i = 0; i < n; i++) {
            int zeros = 0, j = i;
            while (j < n && zeros + (nums[j] == 0) <= k) {
                zeros += nums[j] == 0;
                j++;
            }
            best = max(best, j - i);
        }
        return best;
    }
};`,
          python: r`class Solution:
    def longestOnes(self, nums: List[int], k: int) -> int:
        n, best = len(nums), 0
        for i in range(n):
            zeros, j = 0, i
            while j < n and zeros + (nums[j] == 0) <= k:
                zeros += nums[j] == 0
                j += 1
            best = max(best, j - i)
        return best`,
          javascript: r`var longestOnes = function(nums, k) {
    const n = nums.length;
    let best = 0;
    for (let i = 0; i < n; i++) {
        let zeros = 0, j = i;
        while (j < n && zeros + (nums[j] === 0 ? 1 : 0) <= k) {
            if (nums[j] === 0) zeros++;
            j++;
        }
        best = Math.max(best, j - i);
    }
    return best;
};`,
        },
      },
      {
        level: 'Better', name: 'Prefix count of zeros and binary search',
        idea: '`zeros[i]` = number of zeros among the first `i` values never decreases. For each right end `r`, binary search the leftmost start whose window has at most k zeros.',
        steps: [
          'Build `zeros` with `zeros[0] = 0` and `zeros[i + 1] = zeros[i] + (nums[i] == 0 ? 1 : 0)`.',
          'For each `r`, find the smallest `l` with `zeros[r + 1] − zeros[l] <= k`, i.e. `zeros[l] >= zeros[r + 1] − k`.',
          'Update the best with `r − l + 1`.',
          'Return the best.',
        ],
        time: 'O(n log n)', space: 'O(n)',
        why: 'n binary searches over the n + 1 prefix counts, which are sorted because counts never go down.',
        code: {
          java: r`class Solution {
    public int longestOnes(int[] nums, int k) {
        int n = nums.length, best = 0;
        int[] zeros = new int[n + 1];
        for (int i = 0; i < n; i++) zeros[i + 1] = zeros[i] + (nums[i] == 0 ? 1 : 0);
        for (int r = 0; r < n; r++) {
            int want = zeros[r + 1] - k, lo = 0, hi = r + 1;
            while (lo < hi) {
                int mid = (lo + hi) >>> 1;
                if (zeros[mid] >= want) hi = mid; else lo = mid + 1;
            }
            best = Math.max(best, r - lo + 1);
        }
        return best;
    }
}`,
          cpp: r`class Solution {
public:
    int longestOnes(vector<int>& nums, int k) {
        int n = nums.size(), best = 0;
        vector<int> zeros(n + 1, 0);
        for (int i = 0; i < n; i++) zeros[i + 1] = zeros[i] + (nums[i] == 0);
        for (int r = 0; r < n; r++) {
            int l = lower_bound(zeros.begin(), zeros.begin() + r + 1, zeros[r + 1] - k) - zeros.begin();
            best = max(best, r - l + 1);
        }
        return best;
    }
};`,
          python: r`class Solution:
    def longestOnes(self, nums: List[int], k: int) -> int:
        zeros = [0]
        for x in nums:
            zeros.append(zeros[-1] + (x == 0))
        best = 0
        for r in range(len(nums)):
            l = bisect_left(zeros, zeros[r + 1] - k, 0, r + 1)
            best = max(best, r - l + 1)
        return best`,
          javascript: r`var longestOnes = function(nums, k) {
    const n = nums.length, zeros = [0];
    for (let i = 0; i < n; i++) zeros.push(zeros[i] + (nums[i] === 0 ? 1 : 0));
    let best = 0;
    for (let r = 0; r < n; r++) {
        const want = zeros[r + 1] - k;
        let lo = 0, hi = r + 1;
        while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (zeros[mid] >= want) hi = mid; else lo = mid + 1;
        }
        best = Math.max(best, r - lo + 1);
    }
    return best;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Sliding window that keeps at most k zeros',
        idea: 'Grow the window to the right, counting zeros. When there are more than k zeros, move the left edge until one zero leaves.',
        steps: [
          'Set `l = 0`, `zeros = 0`.',
          'For each `r`: if `nums[r] == 0`, increase `zeros`.',
          'While `zeros > k`: if `nums[l] == 0`, decrease `zeros`; move `l` right.',
          'Update the best with `r − l + 1`; return it at the end.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'Both edges only move forward, so each index is visited at most twice. Only two indices and a counter are stored.',
        code: {
          java: r`class Solution {
    public int longestOnes(int[] nums, int k) {
        int best = 0, zeros = 0;
        for (int l = 0, r = 0; r < nums.length; r++) {
            if (nums[r] == 0) zeros++;
            while (zeros > k) if (nums[l++] == 0) zeros--;
            best = Math.max(best, r - l + 1);
        }
        return best;
    }
}`,
          cpp: r`class Solution {
public:
    int longestOnes(vector<int>& nums, int k) {
        int best = 0, zeros = 0;
        for (int l = 0, r = 0; r < (int) nums.size(); r++) {
            if (nums[r] == 0) zeros++;
            while (zeros > k) if (nums[l++] == 0) zeros--;
            best = max(best, r - l + 1);
        }
        return best;
    }
};`,
          python: r`class Solution:
    def longestOnes(self, nums: List[int], k: int) -> int:
        best = zeros = l = 0
        for r, x in enumerate(nums):
            if x == 0:
                zeros += 1
            while zeros > k:
                if nums[l] == 0:
                    zeros -= 1
                l += 1
            best = max(best, r - l + 1)
        return best`,
          javascript: r`var longestOnes = function(nums, k) {
    let best = 0, zeros = 0;
    for (let l = 0, r = 0; r < nums.length; r++) {
        if (nums[r] === 0) zeros++;
        while (zeros > k) if (nums[l++] === 0) zeros--;
        best = Math.max(best, r - l + 1);
    }
    return best;
};`,
        },
      },
    ],
  },

  'longest-repeating-character-replacement': {
    pattern: 'Variable-size sliding window: a window is valid when length − (count of its most common letter) ≤ k',
    approaches: [
      {
        level: 'Brute force', name: 'From every start, extend while the window can be fixed',
        idea: 'A substring can become one repeated letter if the letters that are not its most common letter number at most `k`. Try every start and extend, keeping letter counts.',
        steps: [
          'For each start `i`, reset 26 counts and `maxCount = 0`.',
          'Move `j` right: count `s[j]` and update `maxCount`.',
          'If `(j − i + 1) − maxCount <= k`, the window works: update the best length; otherwise stop (longer windows from `i` only need more changes).',
          'Return the best.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'Up to n starts, each scanning up to n letters with O(1) work. The 26 counters are constant space.',
        code: {
          java: r`class Solution {
    public int characterReplacement(String s, int k) {
        int n = s.length(), best = 0;
        for (int i = 0; i < n; i++) {
            int[] count = new int[26];
            int maxCount = 0;
            for (int j = i; j < n; j++) {
                maxCount = Math.max(maxCount, ++count[s.charAt(j) - 'A']);
                if (j - i + 1 - maxCount > k) break;
                best = Math.max(best, j - i + 1);
            }
        }
        return best;
    }
}`,
          cpp: r`class Solution {
public:
    int characterReplacement(string s, int k) {
        int n = s.size(), best = 0;
        for (int i = 0; i < n; i++) {
            int count[26] = {0}, maxCount = 0;
            for (int j = i; j < n; j++) {
                maxCount = max(maxCount, ++count[s[j] - 'A']);
                if (j - i + 1 - maxCount > k) break;
                best = max(best, j - i + 1);
            }
        }
        return best;
    }
};`,
          python: r`class Solution:
    def characterReplacement(self, s: str, k: int) -> int:
        n, best = len(s), 0
        for i in range(n):
            count = [0] * 26
            max_count = 0
            for j in range(i, n):
                c = ord(s[j]) - 65
                count[c] += 1
                max_count = max(max_count, count[c])
                if j - i + 1 - max_count > k:
                    break
                best = max(best, j - i + 1)
        return best`,
          javascript: r`var characterReplacement = function(s, k) {
    const n = s.length;
    let best = 0;
    for (let i = 0; i < n; i++) {
        const count = new Array(26).fill(0);
        let maxCount = 0;
        for (let j = i; j < n; j++) {
            maxCount = Math.max(maxCount, ++count[s.charCodeAt(j) - 65]);
            if (j - i + 1 - maxCount > k) break;
            best = Math.max(best, j - i + 1);
        }
    }
    return best;
};`,
        },
      },
      {
        level: 'Better', name: 'Sliding window, recomputing the most common letter',
        idea: 'Keep a window and its letter counts. While the window needs more than `k` changes, shrink it from the left; the needed changes are the length minus the largest of the 26 counts.',
        steps: [
          'Set `l = 0` and 26 counts at 0.',
          'For each `r`, count `s[r]`.',
          'While `(r − l + 1) − max(count) > k`, uncount `s[l]` and move `l` right.',
          'Update the best with `r − l + 1`; return it at the end.',
        ],
        time: 'O(26·n)', space: 'O(1)',
        why: 'Each edge moves at most n times, and each check scans 26 counts.',
        code: {
          java: r`class Solution {
    public int characterReplacement(String s, int k) {
        int[] count = new int[26];
        int best = 0;
        for (int l = 0, r = 0; r < s.length(); r++) {
            count[s.charAt(r) - 'A']++;
            while (r - l + 1 - Arrays.stream(count).max().getAsInt() > k) count[s.charAt(l++) - 'A']--;
            best = Math.max(best, r - l + 1);
        }
        return best;
    }
}`,
          cpp: r`class Solution {
public:
    int characterReplacement(string s, int k) {
        int count[26] = {0}, best = 0;
        for (int l = 0, r = 0; r < (int) s.size(); r++) {
            count[s[r] - 'A']++;
            while (r - l + 1 - *max_element(count, count + 26) > k) count[s[l++] - 'A']--;
            best = max(best, r - l + 1);
        }
        return best;
    }
};`,
          python: r`class Solution:
    def characterReplacement(self, s: str, k: int) -> int:
        count = [0] * 26
        best = l = 0
        for r in range(len(s)):
            count[ord(s[r]) - 65] += 1
            while r - l + 1 - max(count) > k:
                count[ord(s[l]) - 65] -= 1
                l += 1
            best = max(best, r - l + 1)
        return best`,
          javascript: r`var characterReplacement = function(s, k) {
    const count = new Array(26).fill(0);
    let best = 0;
    for (let l = 0, r = 0; r < s.length; r++) {
        count[s.charCodeAt(r) - 65]++;
        while (r - l + 1 - Math.max(...count) > k) count[s.charCodeAt(l++) - 65]--;
        best = Math.max(best, r - l + 1);
    }
    return best;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Sliding window that never lowers the best count',
        idea: 'The answer only grows when some window has a larger most-common count, so `maxCount` never needs to go down. With a stale `maxCount` the window just slides at its best length instead of shrinking.',
        steps: [
          'Set `l = 0`, `maxCount = 0` and 26 counts.',
          'For each `r`: count `s[r]` and set `maxCount = max(maxCount, count[s[r]])`.',
          'If `(r − l + 1) − maxCount > k`, uncount `s[l]` and move `l` right once (the window keeps its length).',
          'Return `n − l` at the end (the final window length, which is the best length seen).',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'O(1) work per character. The window never shrinks, it only grows or slides; it grows only when a real window with a higher count is found, so its final length is the answer.',
        code: {
          java: r`class Solution {
    public int characterReplacement(String s, int k) {
        int[] count = new int[26];
        int l = 0, maxCount = 0;
        for (int r = 0; r < s.length(); r++) {
            maxCount = Math.max(maxCount, ++count[s.charAt(r) - 'A']);
            if (r - l + 1 - maxCount > k) count[s.charAt(l++) - 'A']--;
        }
        return s.length() - l;
    }
}`,
          cpp: r`class Solution {
public:
    int characterReplacement(string s, int k) {
        int count[26] = {0}, l = 0, maxCount = 0, n = s.size();
        for (int r = 0; r < n; r++) {
            maxCount = max(maxCount, ++count[s[r] - 'A']);
            if (r - l + 1 - maxCount > k) count[s[l++] - 'A']--;
        }
        return n - l;
    }
};`,
          python: r`class Solution:
    def characterReplacement(self, s: str, k: int) -> int:
        count = [0] * 26
        l = max_count = 0
        for r in range(len(s)):
            c = ord(s[r]) - 65
            count[c] += 1
            max_count = max(max_count, count[c])
            if r - l + 1 - max_count > k:
                count[ord(s[l]) - 65] -= 1
                l += 1
        return len(s) - l`,
          javascript: r`var characterReplacement = function(s, k) {
    const count = new Array(26).fill(0);
    let l = 0, maxCount = 0;
    for (let r = 0; r < s.length; r++) {
        maxCount = Math.max(maxCount, ++count[s.charCodeAt(r) - 65]);
        if (r - l + 1 - maxCount > k) count[s.charCodeAt(l++) - 65]--;
    }
    return s.length - l;
};`,
        },
      },
    ],
  },

  'permutation-in-string': {
    pattern: 'Fixed-size sliding window with letter counts (anagram check)',
    approaches: [
      {
        level: 'Brute force', name: 'Sort each window and compare',
        idea: 'Two strings are permutations of each other exactly when their sorted letters are equal. Sort `s1` once and compare it with every sorted window of `s2` of the same length.',
        steps: [
          'Let `n = s1.length`; if `n > s2.length`, return false.',
          'Sort the letters of `s1`.',
          'For each start `i` in `s2`, sort `s2[i..i + n)` and compare it with sorted `s1`; return true on a match.',
          'Return false if no window matches.',
        ],
        time: 'O(m·n log n)', space: 'O(n)',
        why: 'About m windows (m = `s2.length`), each sorted in O(n log n). Each sorted copy takes O(n) memory.',
        code: {
          java: r`class Solution {
    public boolean checkInclusion(String s1, String s2) {
        int n = s1.length();
        char[] want = s1.toCharArray();
        Arrays.sort(want);
        for (int i = 0; i + n <= s2.length(); i++) {
            char[] window = s2.substring(i, i + n).toCharArray();
            Arrays.sort(window);
            if (Arrays.equals(want, window)) return true;
        }
        return false;
    }
}`,
          cpp: r`class Solution {
public:
    bool checkInclusion(string s1, string s2) {
        int n = s1.size();
        sort(s1.begin(), s1.end());
        for (int i = 0; i + n <= (int) s2.size(); i++) {
            string window = s2.substr(i, n);
            sort(window.begin(), window.end());
            if (window == s1) return true;
        }
        return false;
    }
};`,
          python: r`class Solution:
    def checkInclusion(self, s1: str, s2: str) -> bool:
        n, want = len(s1), sorted(s1)
        return any(sorted(s2[i:i + n]) == want for i in range(len(s2) - n + 1))`,
          javascript: r`var checkInclusion = function(s1, s2) {
    const n = s1.length, want = s1.split('').sort().join('');
    for (let i = 0; i + n <= s2.length; i++)
        if (s2.slice(i, i + n).split('').sort().join('') === want) return true;
    return false;
};`,
        },
      },
      {
        level: 'Better', name: 'Slide a window of counts and compare all 26',
        idea: 'Instead of sorting, compare letter counts. Keep counts for the current window of `s2` and update them as it slides: one letter enters and one leaves.',
        steps: [
          'Count the letters of `s1` in `need[26]`.',
          'Slide a window of length n over `s2`, adding the entering letter to `have` and removing the letter that leaves.',
          'Whenever the window has length n, compare `need` and `have`; return true if they are equal.',
          'Return false at the end.',
        ],
        time: 'O(26·m)', space: 'O(1)',
        why: 'O(1) updates per step, plus a 26-entry comparison per window.',
        code: {
          java: r`class Solution {
    public boolean checkInclusion(String s1, String s2) {
        int n = s1.length();
        if (n > s2.length()) return false;
        int[] need = new int[26], have = new int[26];
        for (char c : s1.toCharArray()) need[c - 'a']++;
        for (int i = 0; i < s2.length(); i++) {
            have[s2.charAt(i) - 'a']++;
            if (i >= n) have[s2.charAt(i - n) - 'a']--;
            if (i >= n - 1 && Arrays.equals(need, have)) return true;
        }
        return false;
    }
}`,
          cpp: r`class Solution {
public:
    bool checkInclusion(string s1, string s2) {
        int n = s1.size();
        if (n > (int) s2.size()) return false;
        array<int, 26> need{}, have{};
        for (char c : s1) need[c - 'a']++;
        for (int i = 0; i < (int) s2.size(); i++) {
            have[s2[i] - 'a']++;
            if (i >= n) have[s2[i - n] - 'a']--;
            if (i >= n - 1 && need == have) return true;
        }
        return false;
    }
};`,
          python: r`class Solution:
    def checkInclusion(self, s1: str, s2: str) -> bool:
        n = len(s1)
        if n > len(s2):
            return False
        need, have = [0] * 26, [0] * 26
        for c in s1:
            need[ord(c) - 97] += 1
        for i, c in enumerate(s2):
            have[ord(c) - 97] += 1
            if i >= n:
                have[ord(s2[i - n]) - 97] -= 1
            if i >= n - 1 and need == have:
                return True
        return False`,
          javascript: r`var checkInclusion = function(s1, s2) {
    const n = s1.length;
    if (n > s2.length) return false;
    const need = new Array(26).fill(0), have = new Array(26).fill(0);
    for (const c of s1) need[c.charCodeAt(0) - 97]++;
    for (let i = 0; i < s2.length; i++) {
        have[s2.charCodeAt(i) - 97]++;
        if (i >= n) have[s2.charCodeAt(i - n) - 97]--;
        if (i >= n - 1 && need.every((v, k) => v === have[k])) return true;
    }
    return false;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Slide the window and track how many letters match',
        idea: 'Keep `diff[c] = need[c] − have[c]` and a counter of letters whose difference is 0. Only the letter entering and the one leaving change, so the counter updates in O(1); all 26 match exactly when the counter is 26.',
        steps: [
          'Set `diff[c] = count of c in s1` and `matches` = number of letters with `diff[c] == 0`.',
          'For each index `i` of `s2`, the entering letter decreases its `diff`; adjust `matches` if that letter just became or just stopped being 0.',
          'If `i >= n`, the leaving letter `s2[i − n]` increases its `diff`; adjust `matches` the same way.',
          'Once the window has length n, return true if `matches == 26`. Return false at the end.',
        ],
        time: 'O(n + m)', space: 'O(1)',
        why: 'Each letter of each string is handled with O(1) work; the tables have a fixed 26 entries.',
        code: {
          java: r`class Solution {
    public boolean checkInclusion(String s1, String s2) {
        int n = s1.length();
        if (n > s2.length()) return false;
        int[] diff = new int[26];
        for (char c : s1.toCharArray()) diff[c - 'a']++;
        int matches = 0;
        for (int d : diff) if (d == 0) matches++;
        for (int i = 0; i < s2.length(); i++) {
            int in = s2.charAt(i) - 'a';
            if (diff[in] == 0) matches--;
            if (--diff[in] == 0) matches++;
            if (i >= n) {
                int out = s2.charAt(i - n) - 'a';
                if (diff[out] == 0) matches--;
                if (++diff[out] == 0) matches++;
            }
            if (i >= n - 1 && matches == 26) return true;
        }
        return false;
    }
}`,
          cpp: r`class Solution {
public:
    bool checkInclusion(string s1, string s2) {
        int n = s1.size();
        if (n > (int) s2.size()) return false;
        int diff[26] = {0}, matches = 0;
        for (char c : s1) diff[c - 'a']++;
        for (int d : diff) matches += d == 0;
        for (int i = 0; i < (int) s2.size(); i++) {
            int in = s2[i] - 'a';
            if (diff[in] == 0) matches--;
            if (--diff[in] == 0) matches++;
            if (i >= n) {
                int out = s2[i - n] - 'a';
                if (diff[out] == 0) matches--;
                if (++diff[out] == 0) matches++;
            }
            if (i >= n - 1 && matches == 26) return true;
        }
        return false;
    }
};`,
          python: r`class Solution:
    def checkInclusion(self, s1: str, s2: str) -> bool:
        n = len(s1)
        if n > len(s2):
            return False
        diff = [0] * 26
        for c in s1:
            diff[ord(c) - 97] += 1
        matches = diff.count(0)
        for i, c in enumerate(s2):
            k = ord(c) - 97
            if diff[k] == 0:
                matches -= 1
            diff[k] -= 1
            if diff[k] == 0:
                matches += 1
            if i >= n:
                k = ord(s2[i - n]) - 97
                if diff[k] == 0:
                    matches -= 1
                diff[k] += 1
                if diff[k] == 0:
                    matches += 1
            if i >= n - 1 and matches == 26:
                return True
        return False`,
          javascript: r`var checkInclusion = function(s1, s2) {
    const n = s1.length;
    if (n > s2.length) return false;
    const diff = new Array(26).fill(0);
    for (const c of s1) diff[c.charCodeAt(0) - 97]++;
    let matches = diff.filter((d) => d === 0).length;
    for (let i = 0; i < s2.length; i++) {
        const a = s2.charCodeAt(i) - 97;
        if (diff[a] === 0) matches--;
        if (--diff[a] === 0) matches++;
        if (i >= n) {
            const b = s2.charCodeAt(i - n) - 97;
            if (diff[b] === 0) matches--;
            if (++diff[b] === 0) matches++;
        }
        if (i >= n - 1 && matches === 26) return true;
    }
    return false;
};`,
        },
      },
    ],
  },

  'find-all-anagrams-in-a-string': {
    pattern: 'Fixed-size sliding window with letter counts (anagram check)',
    approaches: [
      {
        level: 'Brute force', name: 'Sort each window and compare',
        idea: 'A window is an anagram of `p` exactly when its sorted letters equal `p` sorted. Check every window of length `p.length`.',
        steps: [
          'Let `n = p.length`; sort the letters of `p`.',
          'For each start `i` with `i + n <= s.length`, sort `s[i..i + n)` and compare with sorted `p`.',
          'Collect every `i` that matches, in increasing order.',
        ],
        time: 'O(m·n log n)', space: 'O(n)',
        why: 'About m windows (m = `s.length`), each sorted in O(n log n); each sorted copy takes O(n) memory.',
        code: {
          java: r`class Solution {
    public List<Integer> findAnagrams(String s, String p) {
        int n = p.length();
        char[] want = p.toCharArray();
        Arrays.sort(want);
        List<Integer> out = new ArrayList<>();
        for (int i = 0; i + n <= s.length(); i++) {
            char[] window = s.substring(i, i + n).toCharArray();
            Arrays.sort(window);
            if (Arrays.equals(want, window)) out.add(i);
        }
        return out;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> findAnagrams(string s, string p) {
        int n = p.size();
        sort(p.begin(), p.end());
        vector<int> out;
        for (int i = 0; i + n <= (int) s.size(); i++) {
            string window = s.substr(i, n);
            sort(window.begin(), window.end());
            if (window == p) out.push_back(i);
        }
        return out;
    }
};`,
          python: r`class Solution:
    def findAnagrams(self, s: str, p: str) -> List[int]:
        n, want = len(p), sorted(p)
        return [i for i in range(len(s) - n + 1) if sorted(s[i:i + n]) == want]`,
          javascript: r`var findAnagrams = function(s, p) {
    const n = p.length, want = p.split('').sort().join(''), out = [];
    for (let i = 0; i + n <= s.length; i++)
        if (s.slice(i, i + n).split('').sort().join('') === want) out.push(i);
    return out;
};`,
        },
      },
      {
        level: 'Better', name: 'Slide a window of counts and compare all 26',
        idea: 'Keep letter counts of the current window and update them as it slides; compare them with the counts of `p` at each position.',
        steps: [
          'Count `p` into `need[26]`.',
          'For each index `i` of `s`, add `s[i]` to `have`; if `i >= n`, remove `s[i − n]`.',
          'When `i >= n − 1` and `have` equals `need`, record the start `i − n + 1`.',
          'Return the recorded starts.',
        ],
        time: 'O(26·m)', space: 'O(1)',
        why: 'O(1) updates per step plus a 26-entry comparison per window (the output list aside).',
        code: {
          java: r`class Solution {
    public List<Integer> findAnagrams(String s, String p) {
        int n = p.length();
        int[] need = new int[26], have = new int[26];
        for (char c : p.toCharArray()) need[c - 'a']++;
        List<Integer> out = new ArrayList<>();
        for (int i = 0; i < s.length(); i++) {
            have[s.charAt(i) - 'a']++;
            if (i >= n) have[s.charAt(i - n) - 'a']--;
            if (i >= n - 1 && Arrays.equals(need, have)) out.add(i - n + 1);
        }
        return out;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> findAnagrams(string s, string p) {
        int n = p.size();
        array<int, 26> need{}, have{};
        for (char c : p) need[c - 'a']++;
        vector<int> out;
        for (int i = 0; i < (int) s.size(); i++) {
            have[s[i] - 'a']++;
            if (i >= n) have[s[i - n] - 'a']--;
            if (i >= n - 1 && need == have) out.push_back(i - n + 1);
        }
        return out;
    }
};`,
          python: r`class Solution:
    def findAnagrams(self, s: str, p: str) -> List[int]:
        n = len(p)
        need, have = [0] * 26, [0] * 26
        for c in p:
            need[ord(c) - 97] += 1
        out = []
        for i, c in enumerate(s):
            have[ord(c) - 97] += 1
            if i >= n:
                have[ord(s[i - n]) - 97] -= 1
            if i >= n - 1 and have == need:
                out.append(i - n + 1)
        return out`,
          javascript: r`var findAnagrams = function(s, p) {
    const n = p.length, need = new Array(26).fill(0), have = new Array(26).fill(0), out = [];
    for (const c of p) need[c.charCodeAt(0) - 97]++;
    for (let i = 0; i < s.length; i++) {
        have[s.charCodeAt(i) - 97]++;
        if (i >= n) have[s.charCodeAt(i - n) - 97]--;
        if (i >= n - 1 && need.every((v, k) => v === have[k])) out.push(i - n + 1);
    }
    return out;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Slide the window and count the letters still missing',
        idea: 'Keep `need[c]` = how many more of letter `c` the window still needs, and `missing` = the total still needed. A window is an anagram exactly when `missing == 0`, and each slide changes `missing` in O(1).',
        steps: [
          'Count `p` into `need`, and set `missing = p.length`.',
          'For each index `i`: if `need[s[i]] > 0`, it fills a gap, so decrease `missing`; then decrease `need[s[i]]` (it may go negative: a surplus).',
          'If `i >= n`, let the letter `s[i − n]` leave: increase its `need`; if it is now positive, a gap opened, so increase `missing`.',
          'When `i >= n − 1` and `missing == 0`, record `i − n + 1`.',
        ],
        time: 'O(n + m)', space: 'O(1)',
        why: 'Each letter of `p` and `s` costs O(1); the count table has 26 entries (the output list aside).',
        code: {
          java: r`class Solution {
    public List<Integer> findAnagrams(String s, String p) {
        int n = p.length(), missing = n;
        int[] need = new int[26];
        for (char c : p.toCharArray()) need[c - 'a']++;
        List<Integer> out = new ArrayList<>();
        for (int i = 0; i < s.length(); i++) {
            if (need[s.charAt(i) - 'a']-- > 0) missing--;
            if (i >= n && ++need[s.charAt(i - n) - 'a'] > 0) missing++;
            if (i >= n - 1 && missing == 0) out.add(i - n + 1);
        }
        return out;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> findAnagrams(string s, string p) {
        int n = p.size(), missing = n, need[26] = {0};
        for (char c : p) need[c - 'a']++;
        vector<int> out;
        for (int i = 0; i < (int) s.size(); i++) {
            if (need[s[i] - 'a']-- > 0) missing--;
            if (i >= n && ++need[s[i - n] - 'a'] > 0) missing++;
            if (i >= n - 1 && missing == 0) out.push_back(i - n + 1);
        }
        return out;
    }
};`,
          python: r`class Solution:
    def findAnagrams(self, s: str, p: str) -> List[int]:
        n, missing = len(p), len(p)
        need = [0] * 26
        for c in p:
            need[ord(c) - 97] += 1
        out = []
        for i, c in enumerate(s):
            k = ord(c) - 97
            if need[k] > 0:
                missing -= 1
            need[k] -= 1
            if i >= n:
                k = ord(s[i - n]) - 97
                need[k] += 1
                if need[k] > 0:
                    missing += 1
            if i >= n - 1 and missing == 0:
                out.append(i - n + 1)
        return out`,
          javascript: r`var findAnagrams = function(s, p) {
    const n = p.length, need = new Array(26).fill(0), out = [];
    let missing = n;
    for (const c of p) need[c.charCodeAt(0) - 97]++;
    for (let i = 0; i < s.length; i++) {
        if (need[s.charCodeAt(i) - 97]-- > 0) missing--;
        if (i >= n && ++need[s.charCodeAt(i - n) - 97] > 0) missing++;
        if (i >= n - 1 && missing === 0) out.push(i - n + 1);
    }
    return out;
};`,
        },
      },
    ],
  },

  'minimum-window-substring': {
    pattern: 'Variable-size sliding window: expand until valid, then shrink while still valid',
    approaches: [
      {
        level: 'Brute force', name: 'From every start, extend until every needed letter is covered',
        idea: 'For each start, add letters until the window contains all of `t` (with repeats); that end gives the shortest valid window from this start.',
        steps: [
          'Count the letters of `t` and let `total = t.length`.',
          'For each start `i`, copy the counts and set `missing = total`.',
          'Move `j` right: if `s[j]` is still needed, decrease `missing`; decrease its count. When `missing == 0`, the window `s[i..j]` is valid: keep it if it is the shortest so far, and stop.',
          'Return the shortest window, or `""`.',
        ],
        time: 'O(m²)', space: 'O(σ)',
        why: 'Each of the m starts may scan to the end of `s` (copying σ counts per start is O(σ) each, dominated by the scan). σ is the alphabet size, 52 letters here.',
        code: {
          java: r`class Solution {
    public String minWindow(String s, String t) {
        int[] need = new int[128];
        for (char c : t.toCharArray()) need[c]++;
        int m = s.length(), bestStart = 0, bestLen = Integer.MAX_VALUE;
        for (int i = 0; i < m; i++) {
            int[] left = need.clone();
            int missing = t.length();
            for (int j = i; j < m && j - i + 1 < bestLen; j++) {
                if (left[s.charAt(j)]-- > 0) missing--;
                if (missing == 0) { bestStart = i; bestLen = j - i + 1; break; }
            }
        }
        return bestLen == Integer.MAX_VALUE ? "" : s.substring(bestStart, bestStart + bestLen);
    }
}`,
          cpp: r`class Solution {
public:
    string minWindow(string s, string t) {
        vector<int> need(128, 0);
        for (char c : t) need[c]++;
        int m = s.size(), bestStart = 0, bestLen = INT_MAX;
        for (int i = 0; i < m; i++) {
            vector<int> left = need;
            int missing = t.size();
            for (int j = i; j < m && j - i + 1 < bestLen; j++) {
                if (left[s[j]]-- > 0) missing--;
                if (missing == 0) { bestStart = i; bestLen = j - i + 1; break; }
            }
        }
        return bestLen == INT_MAX ? "" : s.substr(bestStart, bestLen);
    }
};`,
          python: r`class Solution:
    def minWindow(self, s: str, t: str) -> str:
        need = Counter(t)
        best = ""
        for i in range(len(s)):
            left = dict(need)
            missing = len(t)
            for j in range(i, len(s)):
                if best and j - i + 1 >= len(best):
                    break
                c = s[j]
                if left.get(c, 0) > 0:
                    missing -= 1
                left[c] = left.get(c, 0) - 1
                if missing == 0:
                    best = s[i:j + 1]
                    break
        return best`,
          javascript: r`var minWindow = function(s, t) {
    const need = new Array(128).fill(0);
    for (const c of t) need[c.charCodeAt(0)]++;
    const m = s.length;
    let bestStart = 0, bestLen = Infinity;
    for (let i = 0; i < m; i++) {
        const left = need.slice();
        let missing = t.length;
        for (let j = i; j < m && j - i + 1 < bestLen; j++) {
            if (left[s.charCodeAt(j)]-- > 0) missing--;
            if (missing === 0) { bestStart = i; bestLen = j - i + 1; break; }
        }
    }
    return bestLen === Infinity ? '' : s.slice(bestStart, bestStart + bestLen);
};`,
        },
      },
      {
        level: 'Optimal', name: 'Sliding window with a count of missing letters',
        idea: 'Grow the window on the right until it covers `t` (`missing == 0`), then shrink it from the left for as long as it still covers `t`, recording the shortest valid window along the way.',
        steps: [
          '`need[c]` = how many more of `c` the window needs (starts as the counts of `t`); `missing = t.length`.',
          'For each `r`: if `need[s[r]] > 0`, decrease `missing`; then decrease `need[s[r]]` (negative means a surplus).',
          'While `missing == 0`: record the window `[l, r]` if it is the shortest; then remove `s[l]`: increase `need[s[l]]`, and if it becomes positive the window is short of that letter, so increase `missing`. Move `l` right.',
          'Return the shortest recorded window, or `""`.',
        ],
        time: 'O(m + n)', space: 'O(σ)',
        why: 'Counting `t` is O(n); each index of `s` enters and leaves the window once, O(m). The count table has one entry per possible character.',
        code: {
          java: r`class Solution {
    public String minWindow(String s, String t) {
        int[] need = new int[128];
        for (char c : t.toCharArray()) need[c]++;
        int missing = t.length(), bestStart = 0, bestLen = Integer.MAX_VALUE;
        for (int l = 0, r = 0; r < s.length(); r++) {
            if (need[s.charAt(r)]-- > 0) missing--;
            while (missing == 0) {
                if (r - l + 1 < bestLen) { bestStart = l; bestLen = r - l + 1; }
                if (++need[s.charAt(l++)] > 0) missing++;
            }
        }
        return bestLen == Integer.MAX_VALUE ? "" : s.substring(bestStart, bestStart + bestLen);
    }
}`,
          cpp: r`class Solution {
public:
    string minWindow(string s, string t) {
        vector<int> need(128, 0);
        for (char c : t) need[c]++;
        int missing = t.size(), bestStart = 0, bestLen = INT_MAX;
        for (int l = 0, r = 0; r < (int) s.size(); r++) {
            if (need[s[r]]-- > 0) missing--;
            while (missing == 0) {
                if (r - l + 1 < bestLen) { bestStart = l; bestLen = r - l + 1; }
                if (++need[s[l++]] > 0) missing++;
            }
        }
        return bestLen == INT_MAX ? "" : s.substr(bestStart, bestLen);
    }
};`,
          python: r`class Solution:
    def minWindow(self, s: str, t: str) -> str:
        need = Counter(t)
        missing = len(t)
        best_start, best_len = 0, inf
        l = 0
        for r, c in enumerate(s):
            if need[c] > 0:
                missing -= 1
            need[c] -= 1
            while missing == 0:
                if r - l + 1 < best_len:
                    best_start, best_len = l, r - l + 1
                need[s[l]] += 1
                if need[s[l]] > 0:
                    missing += 1
                l += 1
        return "" if best_len == inf else s[best_start:best_start + best_len]`,
          javascript: r`var minWindow = function(s, t) {
    const need = new Array(128).fill(0);
    for (const c of t) need[c.charCodeAt(0)]++;
    let missing = t.length, bestStart = 0, bestLen = Infinity;
    for (let l = 0, r = 0; r < s.length; r++) {
        if (need[s.charCodeAt(r)]-- > 0) missing--;
        while (missing === 0) {
            if (r - l + 1 < bestLen) { bestStart = l; bestLen = r - l + 1; }
            if (++need[s.charCodeAt(l++)] > 0) missing++;
        }
    }
    return bestLen === Infinity ? '' : s.slice(bestStart, bestStart + bestLen);
};`,
        },
      },
    ],
  },

  'subarrays-with-k-different-integers': {
    pattern: 'Sliding window counting trick: exactly(k) = atMost(k) − atMost(k − 1)',
    approaches: [
      {
        level: 'Brute force', name: 'From every start, extend while counting distinct values',
        idea: 'For each start, extend the subarray to the right, tracking how many distinct values it holds; count the ends where that number is exactly `k`, and stop once it exceeds `k`.',
        steps: [
          'For each start `i`, reset the counts and `distinct = 0`.',
          'Move `j` right: if `nums[j]` is new, increase `distinct`.',
          'If `distinct > k`, stop (longer subarrays only add values); if `distinct == k`, add 1 to the answer.',
          'Return the answer.',
        ],
        time: 'O(n²)', space: 'O(n)',
        why: 'Each start may scan to the end. The count table has one entry per possible value (values are at most n).',
        code: {
          java: r`class Solution {
    public int subarraysWithKDistinct(int[] nums, int k) {
        int n = nums.length, total = 0;
        for (int i = 0; i < n; i++) {
            int[] count = new int[n + 1];
            int distinct = 0;
            for (int j = i; j < n; j++) {
                if (count[nums[j]]++ == 0) distinct++;
                if (distinct > k) break;
                if (distinct == k) total++;
            }
        }
        return total;
    }
}`,
          cpp: r`class Solution {
public:
    int subarraysWithKDistinct(vector<int>& nums, int k) {
        int n = nums.size(), total = 0;
        for (int i = 0; i < n; i++) {
            vector<int> count(n + 1, 0);
            int distinct = 0;
            for (int j = i; j < n; j++) {
                if (count[nums[j]]++ == 0) distinct++;
                if (distinct > k) break;
                if (distinct == k) total++;
            }
        }
        return total;
    }
};`,
          python: r`class Solution:
    def subarraysWithKDistinct(self, nums: List[int], k: int) -> int:
        n, total = len(nums), 0
        for i in range(n):
            seen = set()
            for j in range(i, n):
                seen.add(nums[j])
                if len(seen) > k:
                    break
                if len(seen) == k:
                    total += 1
        return total`,
          javascript: r`var subarraysWithKDistinct = function(nums, k) {
    const n = nums.length;
    let total = 0;
    for (let i = 0; i < n; i++) {
        const seen = new Set();
        for (let j = i; j < n; j++) {
            seen.add(nums[j]);
            if (seen.size > k) break;
            if (seen.size === k) total++;
        }
    }
    return total;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Count "at most k" twice and subtract',
        idea: '"Exactly k distinct" is hard to slide, but "at most k distinct" is easy: for each right end `r`, every start from `l` to `r` works, adding `r − l + 1` subarrays. Then exactly(k) = atMost(k) − atMost(k − 1).',
        steps: [
          'Write `atMost(k)`: a window `[l, r]` with value counts and a `distinct` counter.',
          'For each `r`, add `nums[r]` (a new value increases `distinct`); while `distinct > k`, remove `nums[l]` and move `l` right.',
          'Every subarray ending at `r` and starting in `[l, r]` has at most k distinct values: add `r − l + 1`.',
          'Return `atMost(k) − atMost(k − 1)`.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Each `atMost` call moves both edges forward at most n times; it runs twice. The count table has n + 1 entries.',
        code: {
          java: r`class Solution {
    public int subarraysWithKDistinct(int[] nums, int k) {
        return atMost(nums, k) - atMost(nums, k - 1);
    }

    private int atMost(int[] nums, int k) {
        int[] count = new int[nums.length + 1];
        int distinct = 0, total = 0;
        for (int l = 0, r = 0; r < nums.length; r++) {
            if (count[nums[r]]++ == 0) distinct++;
            while (distinct > k) if (--count[nums[l++]] == 0) distinct--;
            total += r - l + 1;
        }
        return total;
    }
}`,
          cpp: r`class Solution {
    int atMost(vector<int>& nums, int k) {
        vector<int> count(nums.size() + 1, 0);
        int distinct = 0, total = 0;
        for (int l = 0, r = 0; r < (int) nums.size(); r++) {
            if (count[nums[r]]++ == 0) distinct++;
            while (distinct > k) if (--count[nums[l++]] == 0) distinct--;
            total += r - l + 1;
        }
        return total;
    }
public:
    int subarraysWithKDistinct(vector<int>& nums, int k) {
        return atMost(nums, k) - atMost(nums, k - 1);
    }
};`,
          python: r`class Solution:
    def subarraysWithKDistinct(self, nums: List[int], k: int) -> int:
        def at_most(k):
            count = [0] * (len(nums) + 1)
            distinct = total = l = 0
            for r, x in enumerate(nums):
                if count[x] == 0:
                    distinct += 1
                count[x] += 1
                while distinct > k:
                    count[nums[l]] -= 1
                    if count[nums[l]] == 0:
                        distinct -= 1
                    l += 1
                total += r - l + 1
            return total
        return at_most(k) - at_most(k - 1)`,
          javascript: r`var subarraysWithKDistinct = function(nums, k) {
    const atMost = (k) => {
        const count = new Array(nums.length + 1).fill(0);
        let distinct = 0, total = 0;
        for (let l = 0, r = 0; r < nums.length; r++) {
            if (count[nums[r]]++ === 0) distinct++;
            while (distinct > k) if (--count[nums[l++]] === 0) distinct--;
            total += r - l + 1;
        }
        return total;
    };
    return atMost(k) - atMost(k - 1);
};`,
        },
      },
    ],
  },
  'contains-duplicate-ii': {
    pattern: 'Fixed-size sliding window held in a hash set',
    approaches: [
      {
        level: 'Brute force', name: 'Check the next k values',
        idea: 'For each index, compare its value with the values at the next `k` positions.',
        steps: [
          'For each `i`, loop `j` from `i + 1` to `min(n − 1, i + k)`.',
          'If `nums[i] == nums[j]`, return `true`.',
          'Return `false` after all pairs.',
        ],
        time: 'O(n · min(n, k))', space: 'O(1)',
        why: 'With n and k both 10⁵ and no duplicates, that is about 10¹⁰ comparisons, so it times out on the large test.',
        code: {
          java: r`class Solution {
    public boolean containsNearbyDuplicate(int[] nums, int k) {
        for (int i = 0; i < nums.length; i++)
            for (int j = i + 1; j < nums.length && j <= i + k; j++)
                if (nums[i] == nums[j]) return true;
        return false;
    }
}`,
          cpp: r`class Solution {
public:
    bool containsNearbyDuplicate(vector<int>& nums, int k) {
        int n = nums.size();
        for (int i = 0; i < n; i++)
            for (int j = i + 1; j < n && j <= i + k; j++)
                if (nums[i] == nums[j]) return true;
        return false;
    }
};`,
          python: r`class Solution:
    def containsNearbyDuplicate(self, nums: List[int], k: int) -> bool:
        n = len(nums)
        for i in range(n):
            for j in range(i + 1, min(n, i + k + 1)):
                if nums[i] == nums[j]:
                    return True
        return False`,
          javascript: r`var containsNearbyDuplicate = function(nums, k) {
    for (let i = 0; i < nums.length; i++)
        for (let j = i + 1; j < nums.length && j <= i + k; j++)
            if (nums[i] === nums[j]) return true;
    return false;
};`,
        },
      },
      {
        level: 'Better', name: 'Last index of each value',
        idea: 'Remember where each value was last seen. A repeat is a hit when it is within `k` of that last position.',
        steps: [
          'Keep a map `last` from value to its most recent index.',
          'For each `i`: if `nums[i]` is in `last` and `i − last[nums[i]] <= k`, return `true`.',
          'Set `last[nums[i]] = i` and continue.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Only the most recent copy matters, since it is the closest one to any later index. The map can hold all n values, while the window set below never holds more than k.',
        code: {
          java: r`class Solution {
    public boolean containsNearbyDuplicate(int[] nums, int k) {
        Map<Integer, Integer> last = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            Integer j = last.put(nums[i], i);
            if (j != null && i - j <= k) return true;
        }
        return false;
    }
}`,
          cpp: r`class Solution {
public:
    bool containsNearbyDuplicate(vector<int>& nums, int k) {
        unordered_map<int, int> last;
        for (int i = 0; i < (int) nums.size(); i++) {
            auto it = last.find(nums[i]);
            if (it != last.end() && i - it->second <= k) return true;
            last[nums[i]] = i;
        }
        return false;
    }
};`,
          python: r`class Solution:
    def containsNearbyDuplicate(self, nums: List[int], k: int) -> bool:
        last = {}
        for i, x in enumerate(nums):
            if x in last and i - last[x] <= k:
                return True
            last[x] = i
        return False`,
          javascript: r`var containsNearbyDuplicate = function(nums, k) {
    const last = new Map();
    for (let i = 0; i < nums.length; i++) {
        if (last.has(nums[i]) && i - last.get(nums[i]) <= k) return true;
        last.set(nums[i], i);
    }
    return false;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Sliding window set',
        idea: 'Keep exactly the last `k` values in a set. A value already in the set has a copy at most `k` positions back.',
        steps: [
          'For each `i`: try to add `nums[i]` to the set; if it was already there, return `true`.',
          'If the set now holds more than `k` values, remove `nums[i − k]`, the value leaving the window.',
          'Return `false` at the end.',
        ],
        time: 'O(n)', space: 'O(min(n, k))',
        why: 'Each value enters and leaves the set once. The set never holds duplicates (we would have returned), so its size equals the window length and removing `nums[i − k]` removes exactly the oldest value. With k = 0 the set is emptied straight away, so no pair is ever found, which is correct.',
        code: {
          java: r`class Solution {
    public boolean containsNearbyDuplicate(int[] nums, int k) {
        Set<Integer> window = new HashSet<>();
        for (int i = 0; i < nums.length; i++) {
            if (!window.add(nums[i])) return true;
            if (window.size() > k) window.remove(nums[i - k]);
        }
        return false;
    }
}`,
          cpp: r`class Solution {
public:
    bool containsNearbyDuplicate(vector<int>& nums, int k) {
        unordered_set<int> window;
        for (int i = 0; i < (int) nums.size(); i++) {
            if (!window.insert(nums[i]).second) return true;
            if ((int) window.size() > k) window.erase(nums[i - k]);
        }
        return false;
    }
};`,
          python: r`class Solution:
    def containsNearbyDuplicate(self, nums: List[int], k: int) -> bool:
        window = set()
        for i, x in enumerate(nums):
            if x in window:
                return True
            window.add(x)
            if len(window) > k:
                window.remove(nums[i - k])
        return False`,
          javascript: r`var containsNearbyDuplicate = function(nums, k) {
    const window = new Set();
    for (let i = 0; i < nums.length; i++) {
        if (window.has(nums[i])) return true;
        window.add(nums[i]);
        if (window.size > k) window.delete(nums[i - k]);
    }
    return false;
};`,
        },
      },
    ],
  },
  'find-k-closest-elements': {
    pattern: 'Binary search for the start of a fixed-size window',
    approaches: [
      {
        level: 'Brute force', name: 'Sort by distance',
        idea: 'Sort all values by (distance to `x`, value), take the first `k`, and sort those back into ascending order.',
        steps: [
          'Copy `arr` and sort it by `|a − x|`, breaking ties by the smaller value.',
          'Take the first `k` values.',
          'Sort them ascending and return them.',
        ],
        time: 'O(n log n)', space: 'O(n)',
        why: 'It ignores that `arr` is already sorted. Fine for 10⁴ values, but the interviewer wants you to use the order.',
        code: {
          java: r`class Solution {
    public List<Integer> findClosestElements(int[] arr, int k, int x) {
        List<Integer> all = new ArrayList<>();
        for (int a : arr) all.add(a);
        all.sort((a, b) -> Math.abs(a - x) != Math.abs(b - x) ? Math.abs(a - x) - Math.abs(b - x) : a - b);
        List<Integer> out = new ArrayList<>(all.subList(0, k));
        Collections.sort(out);
        return out;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> findClosestElements(vector<int>& arr, int k, int x) {
        vector<int> all(arr);
        stable_sort(all.begin(), all.end(), [x](int a, int b) {
            return abs(a - x) != abs(b - x) ? abs(a - x) < abs(b - x) : a < b;
        });
        vector<int> out(all.begin(), all.begin() + k);
        sort(out.begin(), out.end());
        return out;
    }
};`,
          python: r`class Solution:
    def findClosestElements(self, arr: List[int], k: int, x: int) -> List[int]:
        return sorted(sorted(arr, key=lambda a: (abs(a - x), a))[:k])`,
          javascript: r`var findClosestElements = function(arr, k, x) {
    const all = [...arr].sort((a, b) => Math.abs(a - x) - Math.abs(b - x) || a - b);
    return all.slice(0, k).sort((a, b) => a - b);
};`,
        },
      },
      {
        level: 'Better', name: 'Shrink from both ends',
        idea: 'The answer is a contiguous block. Start with the whole array and drop the end that is farther from `x` until `k` values remain.',
        steps: [
          'Set `lo = 0`, `hi = n − 1`.',
          'While `hi − lo + 1 > k`: if `x − arr[lo] <= arr[hi] − x`, drop the right end (`hi--`), otherwise drop the left (`lo++`).',
          'Return `arr[lo..hi]`.',
        ],
        time: 'O(n − k)', space: 'O(1)',
        why: 'Every step removes one value that cannot be in the answer: the farther end is never closer than anything inside. On a tie the right end goes, because the smaller value wins ties. Output space is not counted.',
        code: {
          java: r`class Solution {
    public List<Integer> findClosestElements(int[] arr, int k, int x) {
        int lo = 0, hi = arr.length - 1;
        while (hi - lo + 1 > k) {
            if (x - arr[lo] <= arr[hi] - x) hi--; else lo++;
        }
        List<Integer> out = new ArrayList<>();
        for (int i = lo; i <= hi; i++) out.add(arr[i]);
        return out;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> findClosestElements(vector<int>& arr, int k, int x) {
        int lo = 0, hi = (int) arr.size() - 1;
        while (hi - lo + 1 > k) {
            if (x - arr[lo] <= arr[hi] - x) hi--; else lo++;
        }
        return vector<int>(arr.begin() + lo, arr.begin() + hi + 1);
    }
};`,
          python: r`class Solution:
    def findClosestElements(self, arr: List[int], k: int, x: int) -> List[int]:
        lo, hi = 0, len(arr) - 1
        while hi - lo + 1 > k:
            if x - arr[lo] <= arr[hi] - x:
                hi -= 1
            else:
                lo += 1
        return arr[lo:hi + 1]`,
          javascript: r`var findClosestElements = function(arr, k, x) {
    let lo = 0, hi = arr.length - 1;
    while (hi - lo + 1 > k) {
        if (x - arr[lo] <= arr[hi] - x) hi--; else lo++;
    }
    return arr.slice(lo, hi + 1);
};`,
        },
      },
      {
        level: 'Optimal', name: 'Binary search the window start',
        idea: 'Search for the best start `s` in `[0, n − k]`. Comparing the value just inside the window (`arr[mid]`) with the one just outside (`arr[mid + k]`) tells you whether the window should move right.',
        steps: [
          'Set `lo = 0`, `hi = n − k`.',
          'While `lo < hi`: `mid = (lo + hi) / 2`. If `x − arr[mid] > arr[mid + k] − x`, the left value is farther, so set `lo = mid + 1`; otherwise `hi = mid`.',
          'Return `arr[lo .. lo + k − 1]`.',
        ],
        time: 'O(log(n − k) + k)', space: 'O(1)',
        why: 'The windows `[s, s + k − 1]` and `[s + 1, s + k]` differ only in `arr[s]` and `arr[s + k]`, so that one comparison decides which is better, and the decision is monotonic in `s`. Comparing signed differences (not absolute values) handles duplicates and `x` outside the array correctly; using `abs` here is a known bug when values repeat.',
        code: {
          java: r`class Solution {
    public List<Integer> findClosestElements(int[] arr, int k, int x) {
        int lo = 0, hi = arr.length - k;
        while (lo < hi) {
            int mid = (lo + hi) >>> 1;
            if (x - arr[mid] > arr[mid + k] - x) lo = mid + 1; else hi = mid;
        }
        List<Integer> out = new ArrayList<>();
        for (int i = lo; i < lo + k; i++) out.add(arr[i]);
        return out;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> findClosestElements(vector<int>& arr, int k, int x) {
        int lo = 0, hi = (int) arr.size() - k;
        while (lo < hi) {
            int mid = (lo + hi) / 2;
            if (x - arr[mid] > arr[mid + k] - x) lo = mid + 1; else hi = mid;
        }
        return vector<int>(arr.begin() + lo, arr.begin() + lo + k);
    }
};`,
          python: r`class Solution:
    def findClosestElements(self, arr: List[int], k: int, x: int) -> List[int]:
        lo, hi = 0, len(arr) - k
        while lo < hi:
            mid = (lo + hi) // 2
            if x - arr[mid] > arr[mid + k] - x:
                lo = mid + 1
            else:
                hi = mid
        return arr[lo:lo + k]`,
          javascript: r`var findClosestElements = function(arr, k, x) {
    let lo = 0, hi = arr.length - k;
    while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (x - arr[mid] > arr[mid + k] - x) lo = mid + 1; else hi = mid;
    }
    return arr.slice(lo, lo + k);
};`,
        },
      },
    ],
  },
};
