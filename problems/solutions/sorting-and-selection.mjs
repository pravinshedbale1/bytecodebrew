const r = String.raw;

export default {
  'sort-array-by-increasing-frequency': {
    pattern: 'Count with a hash map, then sort with a custom comparator (frequency ↑, value ↓)',
    approaches: [
      {
        level: 'Brute force', name: 'Count each value by scanning, then sort',
        idea: 'For every element, count its frequency by scanning the whole array; then sort by (frequency ascending, value descending).',
        steps: [
          'For each element, count how many times its value appears by scanning `nums`.',
          'Sort the elements by that frequency ascending, breaking ties by value descending.',
          'Return the sorted array.',
        ],
        time: 'O(n²)', space: 'O(n)',
        why: 'Counting by scanning costs O(n) per element; the sort adds O(n log n).',
        code: {
          java: r`class Solution {
    public int[] frequencySort(int[] nums) {
        int n = nums.length;
        Integer[] a = new Integer[n];
        int[] freq = new int[201];
        for (int i = 0; i < n; i++) {
            a[i] = nums[i];
            int c = 0;
            for (int x : nums) if (x == nums[i]) c++;
            freq[nums[i] + 100] = c;
        }
        Arrays.sort(a, (x, y) -> freq[x + 100] != freq[y + 100] ? freq[x + 100] - freq[y + 100] : y - x);
        for (int i = 0; i < n; i++) nums[i] = a[i];
        return nums;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> frequencySort(vector<int>& nums) {
        vector<int> freq(201, 0);
        for (int v : nums) freq[v + 100] = count(nums.begin(), nums.end(), v);
        sort(nums.begin(), nums.end(), [&](int x, int y) {
            return freq[x + 100] != freq[y + 100] ? freq[x + 100] < freq[y + 100] : x > y;
        });
        return nums;
    }
};`,
          python: r`class Solution:
    def frequencySort(self, nums: List[int]) -> List[int]:
        return sorted(nums, key=lambda x: (nums.count(x), -x))`,
          javascript: r`var frequencySort = function(nums) {
    const freq = (v) => nums.filter((x) => x === v).length;
    const f = new Map(nums.map((v) => [v, freq(v)]));
    return [...nums].sort((x, y) => f.get(x) !== f.get(y) ? f.get(x) - f.get(y) : y - x);
};`,
        },
      },
      {
        level: 'Optimal', name: 'Hash map counts and one sort',
        idea: 'Count every value once in a map, then sort with the two-part key.',
        steps: [
          'Count occurrences with a hash map (or an array offset by 100).',
          'Sort by `count` ascending and, for equal counts, by value descending.',
          'Return the sorted array.',
        ],
        time: 'O(n log n)', space: 'O(n)',
        why: 'Counting is O(n); the sort dominates.',
        code: {
          java: r`class Solution {
    public int[] frequencySort(int[] nums) {
        Map<Integer, Integer> count = new HashMap<>();
        for (int x : nums) count.merge(x, 1, Integer::sum);
        return Arrays.stream(nums).boxed()
            .sorted((x, y) -> !count.get(x).equals(count.get(y)) ? count.get(x) - count.get(y) : y - x)
            .mapToInt(Integer::intValue).toArray();
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> frequencySort(vector<int>& nums) {
        unordered_map<int, int> count;
        for (int x : nums) count[x]++;
        sort(nums.begin(), nums.end(), [&](int x, int y) {
            return count[x] != count[y] ? count[x] < count[y] : x > y;
        });
        return nums;
    }
};`,
          python: r`class Solution:
    def frequencySort(self, nums: List[int]) -> List[int]:
        count = Counter(nums)
        return sorted(nums, key=lambda x: (count[x], -x))`,
          javascript: r`var frequencySort = function(nums) {
    const count = new Map();
    for (const x of nums) count.set(x, (count.get(x) ?? 0) + 1);
    return nums.sort((x, y) => count.get(x) !== count.get(y) ? count.get(x) - count.get(y) : y - x);
};`,
        },
      },
    ],
  },

  'sort-an-array': {
    pattern: 'Comparison sorts in O(n log n) (merge sort, heap sort), or counting sort for a small value range',
    approaches: [
      {
        level: 'Brute force', name: 'Insertion sort',
        idea: 'Grow a sorted prefix: take the next element and shift larger elements right until its place is found.',
        steps: [
          'For `i` from 1 to n − 1, hold `x = nums[i]`.',
          'Shift every element of the sorted prefix that is greater than `x` one place right.',
          'Put `x` in the gap.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'A reversed array needs about n²/2 shifts. Fast on nearly-sorted data, but too slow for the large test.',
        code: {
          java: r`class Solution {
    public int[] sortArray(int[] nums) {
        for (int i = 1; i < nums.length; i++) {
            int x = nums[i], j = i - 1;
            while (j >= 0 && nums[j] > x) nums[j + 1] = nums[j--];
            nums[j + 1] = x;
        }
        return nums;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> sortArray(vector<int>& nums) {
        for (int i = 1; i < (int) nums.size(); i++) {
            int x = nums[i], j = i - 1;
            while (j >= 0 && nums[j] > x) { nums[j + 1] = nums[j]; j--; }
            nums[j + 1] = x;
        }
        return nums;
    }
};`,
          python: r`class Solution:
    def sortArray(self, nums: List[int]) -> List[int]:
        for i in range(1, len(nums)):
            x, j = nums[i], i - 1
            while j >= 0 and nums[j] > x:
                nums[j + 1] = nums[j]
                j -= 1
            nums[j + 1] = x
        return nums`,
          javascript: r`var sortArray = function(nums) {
    for (let i = 1; i < nums.length; i++) {
        const x = nums[i];
        let j = i - 1;
        while (j >= 0 && nums[j] > x) { nums[j + 1] = nums[j]; j--; }
        nums[j + 1] = x;
    }
    return nums;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Merge sort',
        idea: 'Split the array in half, sort each half recursively, and merge the two sorted halves by repeatedly taking the smaller front element.',
        steps: [
          '`sort(lo, hi)`: if the range has one element, it is sorted.',
          'Sort `[lo, mid]` and `[mid + 1, hi]`.',
          'Merge them into a buffer with two pointers, then copy back.',
        ],
        time: 'O(n log n)', space: 'O(n)',
        why: 'log n levels of splitting, each merging n elements in total. The merge buffer takes O(n). It is stable and never degrades.',
        code: {
          java: r`class Solution {
    public int[] sortArray(int[] nums) {
        mergeSort(nums, new int[nums.length], 0, nums.length - 1);
        return nums;
    }

    private void mergeSort(int[] a, int[] buf, int lo, int hi) {
        if (lo >= hi) return;
        int mid = (lo + hi) >>> 1;
        mergeSort(a, buf, lo, mid);
        mergeSort(a, buf, mid + 1, hi);
        int i = lo, j = mid + 1, k = lo;
        while (i <= mid && j <= hi) buf[k++] = a[i] <= a[j] ? a[i++] : a[j++];
        while (i <= mid) buf[k++] = a[i++];
        while (j <= hi) buf[k++] = a[j++];
        System.arraycopy(buf, lo, a, lo, hi - lo + 1);
    }
}`,
          cpp: r`class Solution {
    void mergeSort(vector<int>& a, vector<int>& buf, int lo, int hi) {
        if (lo >= hi) return;
        int mid = (lo + hi) / 2;
        mergeSort(a, buf, lo, mid);
        mergeSort(a, buf, mid + 1, hi);
        int i = lo, j = mid + 1, k = lo;
        while (i <= mid && j <= hi) buf[k++] = a[i] <= a[j] ? a[i++] : a[j++];
        while (i <= mid) buf[k++] = a[i++];
        while (j <= hi) buf[k++] = a[j++];
        copy(buf.begin() + lo, buf.begin() + hi + 1, a.begin() + lo);
    }
public:
    vector<int> sortArray(vector<int>& nums) {
        vector<int> buf(nums.size());
        mergeSort(nums, buf, 0, (int) nums.size() - 1);
        return nums;
    }
};`,
          python: r`class Solution:
    def sortArray(self, nums: List[int]) -> List[int]:
        if len(nums) <= 1:
            return nums
        mid = len(nums) // 2
        left, right = self.sortArray(nums[:mid]), self.sortArray(nums[mid:])
        out, i, j = [], 0, 0
        while i < len(left) and j < len(right):
            if left[i] <= right[j]:
                out.append(left[i])
                i += 1
            else:
                out.append(right[j])
                j += 1
        out.extend(left[i:])
        out.extend(right[j:])
        return out`,
          javascript: r`var sortArray = function(nums) {
    const buf = new Array(nums.length);
    const mergeSort = (lo, hi) => {
        if (lo >= hi) return;
        const mid = (lo + hi) >> 1;
        mergeSort(lo, mid);
        mergeSort(mid + 1, hi);
        let i = lo, j = mid + 1, k = lo;
        while (i <= mid && j <= hi) buf[k++] = nums[i] <= nums[j] ? nums[i++] : nums[j++];
        while (i <= mid) buf[k++] = nums[i++];
        while (j <= hi) buf[k++] = nums[j++];
        for (let t = lo; t <= hi; t++) nums[t] = buf[t];
    };
    mergeSort(0, nums.length - 1);
    return nums;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Heap sort',
        idea: 'Arrange the array into a max-heap in place, then repeatedly swap the maximum (the root) to the end and restore the heap on the shrinking prefix.',
        steps: [
          'Build a max-heap: sift down every node from `n / 2 − 1` down to 0.',
          'For `end` from n − 1 down to 1: swap `nums[0]` with `nums[end]`, then sift down from 0 within `[0, end)`.',
          'The array is now ascending.',
        ],
        time: 'O(n log n)', space: 'O(1)',
        why: 'Building the heap is O(n); each of the n extractions sifts down O(log n). It sorts in place with no extra array, but is not stable.',
        code: {
          java: r`class Solution {
    public int[] sortArray(int[] nums) {
        int n = nums.length;
        for (int i = n / 2 - 1; i >= 0; i--) sift(nums, i, n);
        for (int end = n - 1; end > 0; end--) {
            int t = nums[0]; nums[0] = nums[end]; nums[end] = t;
            sift(nums, 0, end);
        }
        return nums;
    }

    private void sift(int[] a, int i, int size) {
        while (true) {
            int big = i, l = 2 * i + 1, r = l + 1;
            if (l < size && a[l] > a[big]) big = l;
            if (r < size && a[r] > a[big]) big = r;
            if (big == i) return;
            int t = a[i]; a[i] = a[big]; a[big] = t;
            i = big;
        }
    }
}`,
          cpp: r`class Solution {
    void sift(vector<int>& a, int i, int size) {
        while (true) {
            int big = i, l = 2 * i + 1, r = l + 1;
            if (l < size && a[l] > a[big]) big = l;
            if (r < size && a[r] > a[big]) big = r;
            if (big == i) return;
            swap(a[i], a[big]);
            i = big;
        }
    }
public:
    vector<int> sortArray(vector<int>& nums) {
        int n = nums.size();
        for (int i = n / 2 - 1; i >= 0; i--) sift(nums, i, n);
        for (int end = n - 1; end > 0; end--) {
            swap(nums[0], nums[end]);
            sift(nums, 0, end);
        }
        return nums;
    }
};`,
          python: r`class Solution:
    def sortArray(self, nums: List[int]) -> List[int]:
        def sift(i, size):
            while True:
                big, l, r = i, 2 * i + 1, 2 * i + 2
                if l < size and nums[l] > nums[big]:
                    big = l
                if r < size and nums[r] > nums[big]:
                    big = r
                if big == i:
                    return
                nums[i], nums[big] = nums[big], nums[i]
                i = big
        n = len(nums)
        for i in range(n // 2 - 1, -1, -1):
            sift(i, n)
        for end in range(n - 1, 0, -1):
            nums[0], nums[end] = nums[end], nums[0]
            sift(0, end)
        return nums`,
          javascript: r`var sortArray = function(nums) {
    const sift = (i, size) => {
        while (true) {
            let big = i;
            const l = 2 * i + 1, r = l + 1;
            if (l < size && nums[l] > nums[big]) big = l;
            if (r < size && nums[r] > nums[big]) big = r;
            if (big === i) return;
            [nums[i], nums[big]] = [nums[big], nums[i]];
            i = big;
        }
    };
    const n = nums.length;
    for (let i = (n >> 1) - 1; i >= 0; i--) sift(i, n);
    for (let end = n - 1; end > 0; end--) {
        [nums[0], nums[end]] = [nums[end], nums[0]];
        sift(0, end);
    }
    return nums;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Counting sort (the value range is small)',
        idea: 'Values lie in `[−5·10⁴, 5·10⁴]`, only 10⁵ + 1 possibilities. Count how often each value occurs, then write the values back in order.',
        steps: [
          'Count each value in an array of size `max − min + 1`, indexed by `value − min`.',
          'Walk the counts from smallest value to largest, writing each value as many times as it occurred.',
        ],
        time: 'O(n + R)', space: 'O(R)',
        why: 'R is the value range (10⁵ + 1 here). Linear when R is small compared to n log n; with a huge range a comparison sort is better.',
        code: {
          java: r`class Solution {
    public int[] sortArray(int[] nums) {
        int min = Integer.MAX_VALUE, max = Integer.MIN_VALUE;
        for (int x : nums) { min = Math.min(min, x); max = Math.max(max, x); }
        int[] count = new int[max - min + 1];
        for (int x : nums) count[x - min]++;
        int w = 0;
        for (int v = 0; v < count.length; v++)
            while (count[v]-- > 0) nums[w++] = v + min;
        return nums;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> sortArray(vector<int>& nums) {
        auto [lo, hi] = minmax_element(nums.begin(), nums.end());
        int mn = *lo, mx = *hi;
        vector<int> count(mx - mn + 1, 0);
        for (int x : nums) count[x - mn]++;
        int w = 0;
        for (int v = 0; v < (int) count.size(); v++)
            while (count[v]-- > 0) nums[w++] = v + mn;
        return nums;
    }
};`,
          python: r`class Solution:
    def sortArray(self, nums: List[int]) -> List[int]:
        lo, hi = min(nums), max(nums)
        count = [0] * (hi - lo + 1)
        for x in nums:
            count[x - lo] += 1
        out = []
        for v, c in enumerate(count):
            out.extend([v + lo] * c)
        return out`,
          javascript: r`var sortArray = function(nums) {
    let min = Infinity, max = -Infinity;
    for (const x of nums) { min = Math.min(min, x); max = Math.max(max, x); }
    const count = new Array(max - min + 1).fill(0);
    for (const x of nums) count[x - min]++;
    let w = 0;
    for (let v = 0; v < count.length; v++)
        while (count[v]-- > 0) nums[w++] = v + min;
    return nums;
};`,
        },
      },
    ],
  },

  'largest-number': {
    pattern: 'Custom comparator: put a before b when a + b > b + a (as strings)',
    approaches: [
      {
        level: 'Brute force', name: 'Try every ordering',
        idea: 'Generate every permutation of the numbers, join each into a string, and keep the largest (comparing equal-length strings works like comparing numbers).',
        steps: [
          'Turn the numbers into strings.',
          'For every permutation, join the strings; keep the lexicographically largest result (all results have the same length).',
          'If the best result starts with `0`, the answer is `"0"`.',
        ],
        time: 'O(n!·L)', space: 'O(n·L)',
        why: 'n! orderings, each joined in O(L) where L is the total number of digits. Only feasible for a handful of numbers.',
        code: {
          java: r`class Solution {
    private String best = "";

    public String largestNumber(int[] nums) {
        String[] s = new String[nums.length];
        for (int i = 0; i < nums.length; i++) s[i] = String.valueOf(nums[i]);
        permute(s, 0);
        return best.charAt(0) == '0' ? "0" : best;
    }

    private void permute(String[] s, int k) {
        if (k == s.length) {
            String joined = String.join("", s);
            if (joined.compareTo(best) > 0) best = joined;
            return;
        }
        for (int i = k; i < s.length; i++) {
            String t = s[k]; s[k] = s[i]; s[i] = t;
            permute(s, k + 1);
            t = s[k]; s[k] = s[i]; s[i] = t;
        }
    }
}`,
          cpp: r`class Solution {
public:
    string largestNumber(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        string best;
        do {
            string joined;
            for (int x : nums) joined += to_string(x);
            best = max(best, joined);
        } while (next_permutation(nums.begin(), nums.end()));
        return best[0] == '0' ? "0" : best;
    }
};`,
          python: r`class Solution:
    def largestNumber(self, nums: List[int]) -> str:
        best = max("".join(p) for p in permutations(map(str, nums)))
        return "0" if best[0] == "0" else best`,
          javascript: r`var largestNumber = function(nums) {
    const s = nums.map(String);
    let best = '';
    const permute = (k) => {
        if (k === s.length) {
            const joined = s.join('');
            if (joined > best) best = joined;
            return;
        }
        for (let i = k; i < s.length; i++) {
            [s[k], s[i]] = [s[i], s[k]];
            permute(k + 1);
            [s[k], s[i]] = [s[i], s[k]];
        }
    };
    permute(0);
    return best[0] === '0' ? '0' : best;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Sort with the concatenation comparator',
        idea: 'For two numbers, whichever order gives the bigger concatenation should come first: `a` before `b` if `a + b > b + a` as strings. This rule is consistent (transitive), so sorting with it gives the best overall order.',
        steps: [
          'Turn the numbers into strings.',
          'Sort with the comparator: `a` before `b` when `a + b > b + a`.',
          'Join the strings. If the first character is `0`, every number was 0: return `"0"`.',
        ],
        time: 'O(n log n · L)', space: 'O(n·L)',
        why: 'O(n log n) comparisons, each building two strings of length up to 2L where L ≤ 10 digits per number.',
        code: {
          java: r`class Solution {
    public String largestNumber(int[] nums) {
        String[] s = new String[nums.length];
        for (int i = 0; i < nums.length; i++) s[i] = String.valueOf(nums[i]);
        Arrays.sort(s, (a, b) -> (b + a).compareTo(a + b));
        if (s[0].equals("0")) return "0";
        return String.join("", s);
    }
}`,
          cpp: r`class Solution {
public:
    string largestNumber(vector<int>& nums) {
        vector<string> s;
        for (int x : nums) s.push_back(to_string(x));
        sort(s.begin(), s.end(), [](const string& a, const string& b) { return a + b > b + a; });
        if (s[0] == "0") return "0";
        string out;
        for (auto& t : s) out += t;
        return out;
    }
};`,
          python: r`class Solution:
    def largestNumber(self, nums: List[int]) -> str:
        s = sorted(map(str, nums), key=cmp_to_key(lambda a, b: (b + a > a + b) - (b + a < a + b)))
        return "0" if s[0] == "0" else "".join(s)`,
          javascript: r`var largestNumber = function(nums) {
    const s = nums.map(String).sort((a, b) => (b + a > a + b ? 1 : b + a < a + b ? -1 : 0));
    return s[0] === '0' ? '0' : s.join('');
};`,
        },
      },
    ],
  },

  'h-index': {
    pattern: 'Counting sort into buckets capped at n (or sort descending)',
    approaches: [
      {
        level: 'Brute force', name: 'Try every h from n down',
        idea: 'For each candidate `h` from n down to 0, count the papers with at least `h` citations; the first `h` that works is the largest.',
        steps: [
          'For `h` from n down to 1: count papers with `citations >= h`.',
          'If that count is at least `h`, return `h`.',
          'Return 0.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'Up to n candidates, each counted over n papers.',
        code: {
          java: r`class Solution {
    public int hIndex(int[] citations) {
        for (int h = citations.length; h >= 1; h--) {
            int count = 0;
            for (int c : citations) if (c >= h) count++;
            if (count >= h) return h;
        }
        return 0;
    }
}`,
          cpp: r`class Solution {
public:
    int hIndex(vector<int>& citations) {
        for (int h = citations.size(); h >= 1; h--) {
            int count = 0;
            for (int c : citations) if (c >= h) count++;
            if (count >= h) return h;
        }
        return 0;
    }
};`,
          python: r`class Solution:
    def hIndex(self, citations: List[int]) -> int:
        for h in range(len(citations), 0, -1):
            if sum(1 for c in citations if c >= h) >= h:
                return h
        return 0`,
          javascript: r`var hIndex = function(citations) {
    for (let h = citations.length; h >= 1; h--)
        if (citations.filter((c) => c >= h).length >= h) return h;
    return 0;
};`,
        },
      },
      {
        level: 'Better', name: 'Sort descending',
        idea: 'Sorted from most to least cited, the paper at position `i` (0-based) is the (i + 1)-th most cited. h is the number of positions where `citations[i] >= i + 1`.',
        steps: [
          'Sort citations in descending order.',
          'Count leading positions `i` with `citations[i] >= i + 1`; stop at the first that fails.',
          'Return that count.',
        ],
        time: 'O(n log n)', space: 'O(1)',
        why: 'The sort dominates (aside from its own memory); the scan is O(n).',
        code: {
          java: r`class Solution {
    public int hIndex(int[] citations) {
        Arrays.sort(citations);
        int n = citations.length, h = 0;
        while (h < n && citations[n - 1 - h] >= h + 1) h++;
        return h;
    }
}`,
          cpp: r`class Solution {
public:
    int hIndex(vector<int>& citations) {
        sort(citations.rbegin(), citations.rend());
        int h = 0;
        while (h < (int) citations.size() && citations[h] >= h + 1) h++;
        return h;
    }
};`,
          python: r`class Solution:
    def hIndex(self, citations: List[int]) -> int:
        citations.sort(reverse=True)
        h = 0
        while h < len(citations) and citations[h] >= h + 1:
            h += 1
        return h`,
          javascript: r`var hIndex = function(citations) {
    citations.sort((a, b) => b - a);
    let h = 0;
    while (h < citations.length && citations[h] >= h + 1) h++;
    return h;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Bucket counts capped at n',
        idea: 'The h-index is at most n, so any citation count above n can be treated as n. Count papers per citation value `0..n`, then walk from n down, accumulating how many papers have at least that many citations.',
        steps: [
          'Make `bucket[0..n]`; for each paper, increase `bucket[min(c, n)]`.',
          'Walk `h` from n down to 0, adding `bucket[h]` to `papers` (papers with at least h citations).',
          'Return the first `h` with `papers >= h`.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Two linear passes and n + 1 buckets; no comparison sort.',
        code: {
          java: r`class Solution {
    public int hIndex(int[] citations) {
        int n = citations.length;
        int[] bucket = new int[n + 1];
        for (int c : citations) bucket[Math.min(c, n)]++;
        int papers = 0;
        for (int h = n; h >= 0; h--) {
            papers += bucket[h];
            if (papers >= h) return h;
        }
        return 0;
    }
}`,
          cpp: r`class Solution {
public:
    int hIndex(vector<int>& citations) {
        int n = citations.size();
        vector<int> bucket(n + 1, 0);
        for (int c : citations) bucket[min(c, n)]++;
        int papers = 0;
        for (int h = n; h >= 0; h--) {
            papers += bucket[h];
            if (papers >= h) return h;
        }
        return 0;
    }
};`,
          python: r`class Solution:
    def hIndex(self, citations: List[int]) -> int:
        n = len(citations)
        bucket = [0] * (n + 1)
        for c in citations:
            bucket[min(c, n)] += 1
        papers = 0
        for h in range(n, -1, -1):
            papers += bucket[h]
            if papers >= h:
                return h
        return 0`,
          javascript: r`var hIndex = function(citations) {
    const n = citations.length, bucket = new Array(n + 1).fill(0);
    for (const c of citations) bucket[Math.min(c, n)]++;
    let papers = 0;
    for (let h = n; h >= 0; h--) {
        papers += bucket[h];
        if (papers >= h) return h;
    }
    return 0;
};`,
        },
      },
    ],
  },

  'sort-characters-by-frequency': {
    pattern: 'Count characters, then bucket sort by frequency',
    approaches: [
      {
        level: 'Better', name: 'Count, then sort the characters by count',
        idea: 'Count each character, sort the distinct characters by count (highest first), and write each one out as many times as it occurs.',
        steps: [
          'Count each character.',
          'Sort the distinct characters by count, descending.',
          'Append each character `count` times and return the string.',
        ],
        time: 'O(n + k log k)', space: 'O(n)',
        why: 'Counting is O(n); only the k distinct characters (at most 62 here) are sorted. The output string is O(n).',
        code: {
          java: r`class Solution {
    public String frequencySort(String s) {
        Map<Character, Integer> count = new HashMap<>();
        for (char c : s.toCharArray()) count.merge(c, 1, Integer::sum);
        List<Character> chars = new ArrayList<>(count.keySet());
        chars.sort((a, b) -> count.get(b) - count.get(a));
        StringBuilder out = new StringBuilder();
        for (char c : chars) out.append(String.valueOf(c).repeat(count.get(c)));
        return out.toString();
    }
}`,
          cpp: r`class Solution {
public:
    string frequencySort(string s) {
        unordered_map<char, int> count;
        for (char c : s) count[c]++;
        vector<pair<int, char>> chars;
        for (auto& [c, k] : count) chars.push_back({k, c});
        sort(chars.rbegin(), chars.rend());
        string out;
        for (auto& [k, c] : chars) out.append(k, c);
        return out;
    }
};`,
          python: r`class Solution:
    def frequencySort(self, s: str) -> str:
        return "".join(c * k for c, k in Counter(s).most_common())`,
          javascript: r`var frequencySort = function(s) {
    const count = new Map();
    for (const c of s) count.set(c, (count.get(c) ?? 0) + 1);
    return [...count.entries()].sort((a, b) => b[1] - a[1]).map(([c, k]) => c.repeat(k)).join('');
};`,
        },
      },
      {
        level: 'Optimal', name: 'Bucket sort by count',
        idea: 'A count is between 1 and n, so place each character in the bucket for its count and read the buckets from n down — no comparison sort at all.',
        steps: [
          'Count each character.',
          'Put each distinct character into `bucket[count]`.',
          'For `k` from n down to 1, append every character in `bucket[k]`, `k` times each.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Counting, bucketing and output are all linear in n.',
        code: {
          java: r`class Solution {
    public String frequencySort(String s) {
        int[] count = new int[128];
        for (char c : s.toCharArray()) count[c]++;
        List<List<Character>> bucket = new ArrayList<>();
        for (int i = 0; i <= s.length(); i++) bucket.add(new ArrayList<>());
        for (char c = 0; c < 128; c++) if (count[c] > 0) bucket.get(count[c]).add(c);
        StringBuilder out = new StringBuilder();
        for (int k = s.length(); k >= 1; k--)
            for (char c : bucket.get(k)) out.append(String.valueOf(c).repeat(k));
        return out.toString();
    }
}`,
          cpp: r`class Solution {
public:
    string frequencySort(string s) {
        vector<int> count(128, 0);
        for (char c : s) count[c]++;
        vector<vector<char>> bucket(s.size() + 1);
        for (int c = 0; c < 128; c++) if (count[c] > 0) bucket[count[c]].push_back((char) c);
        string out;
        for (int k = s.size(); k >= 1; k--)
            for (char c : bucket[k]) out.append(k, c);
        return out;
    }
};`,
          python: r`class Solution:
    def frequencySort(self, s: str) -> str:
        bucket = [[] for _ in range(len(s) + 1)]
        for c, k in Counter(s).items():
            bucket[k].append(c)
        return "".join(c * k for k in range(len(s), 0, -1) for c in bucket[k])`,
          javascript: r`var frequencySort = function(s) {
    const count = new Map();
    for (const c of s) count.set(c, (count.get(c) ?? 0) + 1);
    const bucket = Array.from({ length: s.length + 1 }, () => []);
    for (const [c, k] of count) bucket[k].push(c);
    const out = [];
    for (let k = s.length; k >= 1; k--) for (const c of bucket[k]) out.push(c.repeat(k));
    return out.join('');
};`,
        },
      },
    ],
  },

  'maximum-gap': {
    pattern: 'Pigeonhole buckets (the max gap is never inside a bucket) or radix sort',
    approaches: [
      {
        level: 'Brute force', name: 'Sort and compare neighbours',
        idea: 'Sort the array and take the largest difference between adjacent elements.',
        steps: [
          'If there are fewer than 2 elements, return 0.',
          'Sort the array.',
          'Return the maximum of `nums[i] − nums[i − 1]`.',
        ],
        time: 'O(n log n)', space: 'O(log n)',
        why: 'A comparison sort cannot beat O(n log n), which the problem rules out.',
        code: {
          java: r`class Solution {
    public int maximumGap(int[] nums) {
        Arrays.sort(nums);
        int best = 0;
        for (int i = 1; i < nums.length; i++) best = Math.max(best, nums[i] - nums[i - 1]);
        return best;
    }
}`,
          cpp: r`class Solution {
public:
    int maximumGap(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        int best = 0;
        for (size_t i = 1; i < nums.size(); i++) best = max(best, nums[i] - nums[i - 1]);
        return best;
    }
};`,
          python: r`class Solution:
    def maximumGap(self, nums: List[int]) -> int:
        nums.sort()
        return max((b - a for a, b in zip(nums, nums[1:])), default=0)`,
          javascript: r`var maximumGap = function(nums) {
    nums.sort((a, b) => a - b);
    let best = 0;
    for (let i = 1; i < nums.length; i++) best = Math.max(best, nums[i] - nums[i - 1]);
    return best;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Pigeonhole buckets of width ⌊(max − min) / (n − 1)⌋',
        idea: 'n values spread over `[min, max]` have an average gap of `(max − min) / (n − 1)`, and the largest gap is at least that. With buckets narrower than that, the largest gap can never be inside one bucket — so only each bucket\'s min and max matter, and the answer is the biggest jump from one non-empty bucket\'s max to the next one\'s min.',
        steps: [
          'If fewer than 2 values or `min == max`, return 0.',
          'Bucket width `w = max(1, (max − min) / (n − 1))`; bucket count `(max − min) / w + 1`.',
          'Put each value in bucket `(x − min) / w`, keeping only that bucket\'s min and max.',
          'Walk the non-empty buckets in order; the answer is the largest `bucketMin − previousBucketMax`.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'One pass to bucket and one over at most n buckets. The largest gap is at least ⌈(max − min) / (n − 1)⌉ ≥ w, while two values in the same bucket differ by at most w − 1, so the largest gap always crosses buckets.',
        code: {
          java: r`class Solution {
    public int maximumGap(int[] nums) {
        int n = nums.length;
        if (n < 2) return 0;
        int min = Integer.MAX_VALUE, max = Integer.MIN_VALUE;
        for (int x : nums) { min = Math.min(min, x); max = Math.max(max, x); }
        if (min == max) return 0;
        int w = Math.max(1, (max - min) / (n - 1)), count = (max - min) / w + 1;
        int[] bMin = new int[count], bMax = new int[count];
        Arrays.fill(bMin, Integer.MAX_VALUE);
        Arrays.fill(bMax, Integer.MIN_VALUE);
        for (int x : nums) {
            int b = (x - min) / w;
            bMin[b] = Math.min(bMin[b], x);
            bMax[b] = Math.max(bMax[b], x);
        }
        int best = 0, prev = min;
        for (int b = 0; b < count; b++) {
            if (bMin[b] == Integer.MAX_VALUE) continue;
            best = Math.max(best, bMin[b] - prev);
            prev = bMax[b];
        }
        return best;
    }
}`,
          cpp: r`class Solution {
public:
    int maximumGap(vector<int>& nums) {
        int n = nums.size();
        if (n < 2) return 0;
        int mn = *min_element(nums.begin(), nums.end()), mx = *max_element(nums.begin(), nums.end());
        if (mn == mx) return 0;
        int w = max(1, (mx - mn) / (n - 1)), count = (mx - mn) / w + 1;
        vector<int> bMin(count, INT_MAX), bMax(count, INT_MIN);
        for (int x : nums) {
            int b = (x - mn) / w;
            bMin[b] = min(bMin[b], x);
            bMax[b] = max(bMax[b], x);
        }
        int best = 0, prev = mn;
        for (int b = 0; b < count; b++) {
            if (bMin[b] == INT_MAX) continue;
            best = max(best, bMin[b] - prev);
            prev = bMax[b];
        }
        return best;
    }
};`,
          python: r`class Solution:
    def maximumGap(self, nums: List[int]) -> int:
        n = len(nums)
        if n < 2:
            return 0
        lo, hi = min(nums), max(nums)
        if lo == hi:
            return 0
        w = max(1, (hi - lo) // (n - 1))
        count = (hi - lo) // w + 1
        b_min, b_max = [inf] * count, [-inf] * count
        for x in nums:
            b = (x - lo) // w
            b_min[b] = min(b_min[b], x)
            b_max[b] = max(b_max[b], x)
        best, prev = 0, lo
        for b in range(count):
            if b_min[b] == inf:
                continue
            best = max(best, b_min[b] - prev)
            prev = b_max[b]
        return best`,
          javascript: r`var maximumGap = function(nums) {
    const n = nums.length;
    if (n < 2) return 0;
    let min = Infinity, max = -Infinity;
    for (const x of nums) { min = Math.min(min, x); max = Math.max(max, x); }
    if (min === max) return 0;
    const w = Math.max(1, Math.floor((max - min) / (n - 1))), count = Math.floor((max - min) / w) + 1;
    const bMin = new Array(count).fill(Infinity), bMax = new Array(count).fill(-Infinity);
    for (const x of nums) {
        const b = Math.floor((x - min) / w);
        bMin[b] = Math.min(bMin[b], x);
        bMax[b] = Math.max(bMax[b], x);
    }
    let best = 0, prev = min;
    for (let b = 0; b < count; b++) {
        if (bMin[b] === Infinity) continue;
        best = Math.max(best, bMin[b] - prev);
        prev = bMax[b];
    }
    return best;
};`,
        },
      },
    ],
  },
};
