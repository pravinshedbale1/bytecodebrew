const r = String.raw;

export default {
  'car-pooling': {
    pattern: 'Difference array (sweep line): +p at pickup, −p at drop-off, then a running sum',
    approaches: [
      {
        level: 'Brute force', name: 'Check the load at every kilometre',
        idea: 'For each kilometre point, add up the passengers of every trip that is in the car there (`from ≤ x < to`).',
        steps: [
          'Let `K` be the largest drop-off point.',
          'For each `x` in `[0, K)`: sum `passengers` over trips with `from ≤ x < to`.',
          'If any sum exceeds `capacity`, return false.',
        ],
        time: 'O(n·K)', space: 'O(1)',
        why: 'K ≤ 1000 points × n trips. The half-open `to` means people leave before others board at the same point.',
        code: {
          java: r`class Solution {
    public boolean carPooling(int[][] trips, int capacity) {
        int end = 0;
        for (int[] t : trips) end = Math.max(end, t[2]);
        for (int x = 0; x < end; x++) {
            int load = 0;
            for (int[] t : trips) if (t[1] <= x && x < t[2]) load += t[0];
            if (load > capacity) return false;
        }
        return true;
    }
}`,
          cpp: r`class Solution {
public:
    bool carPooling(vector<vector<int>>& trips, int capacity) {
        int end = 0;
        for (auto& t : trips) end = max(end, t[2]);
        for (int x = 0; x < end; x++) {
            int load = 0;
            for (auto& t : trips) if (t[1] <= x && x < t[2]) load += t[0];
            if (load > capacity) return false;
        }
        return true;
    }
};`,
          python: r`class Solution:
    def carPooling(self, trips: List[List[int]], capacity: int) -> bool:
        end = max(t[2] for t in trips)
        return all(sum(p for p, a, b in trips if a <= x < b) <= capacity for x in range(end))`,
          javascript: r`var carPooling = function(trips, capacity) {
    const end = Math.max(...trips.map((t) => t[2]));
    for (let x = 0; x < end; x++) {
        let load = 0;
        for (const [p, a, b] of trips) if (a <= x && x < b) load += p;
        if (load > capacity) return false;
    }
    return true;
};`,
        },
      },
      {
        level: 'Better', name: 'Sort pickup and drop-off events',
        idea: 'Turn each trip into two events, `(from, +p)` and `(to, −p)`. Sort by position, with drop-offs before pickups at the same point, and keep a running load.',
        steps: [
          'Create 2n events and sort by position, then by delta (negative first).',
          'Walk the events adding the delta; if the load ever exceeds `capacity`, return false.',
        ],
        time: 'O(n log n)', space: 'O(n)',
        why: 'Dominated by sorting; works for any coordinate range.',
        code: {
          java: r`class Solution {
    public boolean carPooling(int[][] trips, int capacity) {
        int[][] events = new int[trips.length * 2][];
        int k = 0;
        for (int[] t : trips) {
            events[k++] = new int[] { t[1], t[0] };
            events[k++] = new int[] { t[2], -t[0] };
        }
        Arrays.sort(events, (a, b) -> a[0] != b[0] ? Integer.compare(a[0], b[0]) : Integer.compare(a[1], b[1]));
        int load = 0;
        for (int[] e : events)
            if ((load += e[1]) > capacity) return false;
        return true;
    }
}`,
          cpp: r`class Solution {
public:
    bool carPooling(vector<vector<int>>& trips, int capacity) {
        vector<pair<int, int>> events;
        for (auto& t : trips) {
            events.push_back({t[1], t[0]});
            events.push_back({t[2], -t[0]});
        }
        sort(events.begin(), events.end());
        int load = 0;
        for (auto& [x, d] : events)
            if ((load += d) > capacity) return false;
        return true;
    }
};`,
          python: r`class Solution:
    def carPooling(self, trips: List[List[int]], capacity: int) -> bool:
        events = sorted([(a, p) for p, a, b in trips] + [(b, -p) for p, a, b in trips])
        load = 0
        for _, d in events:
            load += d
            if load > capacity:
                return False
        return True`,
          javascript: r`var carPooling = function(trips, capacity) {
    const events = [];
    for (const [p, a, b] of trips) events.push([a, p], [b, -p]);
    events.sort((x, y) => x[0] - y[0] || x[1] - y[1]);
    let load = 0;
    for (const [, d] of events) if ((load += d) > capacity) return false;
    return true;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Difference array over the kilometres',
        idea: 'Since positions are at most 1000, record `+p` at `from` and `−p` at `to` in an array; the prefix sum at each point is the load there.',
        steps: [
          '`diff[from] += p`, `diff[to] −= p` for every trip.',
          'Walk `diff` with a running sum; if it exceeds `capacity`, return false.',
        ],
        time: 'O(n + K)', space: 'O(K)',
        why: 'K = 1001 positions; no sorting. At a shared point the drop-off and pickup cancel within the same cell, matching the rules.',
        code: {
          java: r`class Solution {
    public boolean carPooling(int[][] trips, int capacity) {
        int[] diff = new int[1001];
        for (int[] t : trips) {
            diff[t[1]] += t[0];
            diff[t[2]] -= t[0];
        }
        int load = 0;
        for (int d : diff)
            if ((load += d) > capacity) return false;
        return true;
    }
}`,
          cpp: r`class Solution {
public:
    bool carPooling(vector<vector<int>>& trips, int capacity) {
        int diff[1001] = {};
        for (auto& t : trips) {
            diff[t[1]] += t[0];
            diff[t[2]] -= t[0];
        }
        int load = 0;
        for (int d : diff)
            if ((load += d) > capacity) return false;
        return true;
    }
};`,
          python: r`class Solution:
    def carPooling(self, trips: List[List[int]], capacity: int) -> bool:
        diff = [0] * 1001
        for p, a, b in trips:
            diff[a] += p
            diff[b] -= p
        load = 0
        for d in diff:
            load += d
            if load > capacity:
                return False
        return True`,
          javascript: r`var carPooling = function(trips, capacity) {
    const diff = new Array(1001).fill(0);
    for (const [p, a, b] of trips) {
        diff[a] += p;
        diff[b] -= p;
    }
    let load = 0;
    for (const d of diff) if ((load += d) > capacity) return false;
    return true;
};`,
        },
      },
    ],
  },

  'range-sum-query-mutable': {
    pattern: 'Fenwick tree (binary indexed tree): point update + prefix sum in O(log n)',
    approaches: [
      {
        level: 'Brute force', name: 'Plain array',
        idea: 'Store the array; update writes one cell, and a range sum loops over the range.',
        steps: [
          '`update(i, v)`: `nums[i] = v`.',
          '`sumRange(l, r)`: add `nums[l..r]`.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'O(1) updates but O(n) per query, so 10⁵ queries on 10⁵ elements is 10¹⁰ steps.',
        code: {
          java: r`class NumArray {
    private final int[] nums;

    public NumArray(int[] nums) {
        this.nums = nums.clone();
    }

    public void update(int index, int val) {
        nums[index] = val;
    }

    public int sumRange(int left, int right) {
        int sum = 0;
        for (int i = left; i <= right; i++) sum += nums[i];
        return sum;
    }
}`,
          cpp: r`class NumArray {
    vector<int> nums;
public:
    NumArray(vector<int>& nums) : nums(nums) {}

    void update(int index, int val) {
        nums[index] = val;
    }

    int sumRange(int left, int right) {
        int sum = 0;
        for (int i = left; i <= right; i++) sum += nums[i];
        return sum;
    }
};`,
          python: r`class NumArray:
    def __init__(self, nums: List[int]):
        self.nums = list(nums)

    def update(self, index: int, val: int) -> None:
        self.nums[index] = val

    def sumRange(self, left: int, right: int) -> int:
        return sum(self.nums[left:right + 1])`,
          javascript: r`var NumArray = function(nums) {
    this.nums = [...nums];
};

NumArray.prototype.update = function(index, val) {
    this.nums[index] = val;
};

NumArray.prototype.sumRange = function(left, right) {
    let sum = 0;
    for (let i = left; i <= right; i++) sum += this.nums[i];
    return sum;
};`,
        },
      },
      {
        level: 'Better', name: 'Square-root decomposition',
        idea: 'Split the array into blocks of about √n elements and keep each block\'s sum. A query adds whole blocks in the middle and single elements at the two ragged ends.',
        steps: [
          'Block size `b = ⌈√n⌉`; `blocks[k]` = sum of block k.',
          '`update(i, v)`: adjust `blocks[i / b]` by `v − nums[i]`, then set `nums[i]`.',
          '`sumRange(l, r)`: while `l ≤ r`, add a whole block when `l` starts one that fits, otherwise add `nums[l]` and step by one.',
        ],
        time: 'O(√n)', space: 'O(n)',
        why: 'O(1) updates and O(√n) queries: at most 2√n single elements plus √n blocks.',
        code: {
          java: r`class NumArray {
    private final int[] nums, blocks;
    private final int b;

    public NumArray(int[] nums) {
        this.nums = nums.clone();
        b = (int) Math.ceil(Math.sqrt(nums.length));
        blocks = new int[(nums.length + b - 1) / b];
        for (int i = 0; i < nums.length; i++) blocks[i / b] += nums[i];
    }

    public void update(int index, int val) {
        blocks[index / b] += val - nums[index];
        nums[index] = val;
    }

    public int sumRange(int left, int right) {
        int sum = 0;
        while (left <= right) {
            if (left % b == 0 && left + b - 1 <= right) {
                sum += blocks[left / b];
                left += b;
            } else {
                sum += nums[left++];
            }
        }
        return sum;
    }
}`,
          cpp: r`class NumArray {
    vector<int> nums, blocks;
    int b;
public:
    NumArray(vector<int>& nums) : nums(nums) {
        b = ceil(sqrt((double) nums.size()));
        blocks.assign((nums.size() + b - 1) / b, 0);
        for (size_t i = 0; i < nums.size(); i++) blocks[i / b] += nums[i];
    }

    void update(int index, int val) {
        blocks[index / b] += val - nums[index];
        nums[index] = val;
    }

    int sumRange(int left, int right) {
        int sum = 0;
        while (left <= right) {
            if (left % b == 0 && left + b - 1 <= right) {
                sum += blocks[left / b];
                left += b;
            } else {
                sum += nums[left++];
            }
        }
        return sum;
    }
};`,
          python: r`class NumArray:
    def __init__(self, nums: List[int]):
        self.nums = list(nums)
        self.b = max(1, isqrt(len(nums) - 1) + 1)
        self.blocks = [0] * ((len(nums) + self.b - 1) // self.b)
        for i, x in enumerate(nums):
            self.blocks[i // self.b] += x

    def update(self, index: int, val: int) -> None:
        self.blocks[index // self.b] += val - self.nums[index]
        self.nums[index] = val

    def sumRange(self, left: int, right: int) -> int:
        total, b = 0, self.b
        while left <= right:
            if left % b == 0 and left + b - 1 <= right:
                total += self.blocks[left // b]
                left += b
            else:
                total += self.nums[left]
                left += 1
        return total`,
          javascript: r`var NumArray = function(nums) {
    this.nums = [...nums];
    this.b = Math.ceil(Math.sqrt(nums.length));
    this.blocks = new Array(Math.ceil(nums.length / this.b)).fill(0);
    nums.forEach((x, i) => (this.blocks[Math.floor(i / this.b)] += x));
};

NumArray.prototype.update = function(index, val) {
    this.blocks[Math.floor(index / this.b)] += val - this.nums[index];
    this.nums[index] = val;
};

NumArray.prototype.sumRange = function(left, right) {
    const b = this.b;
    let sum = 0;
    while (left <= right) {
        if (left % b === 0 && left + b - 1 <= right) {
            sum += this.blocks[left / b];
            left += b;
        } else {
            sum += this.nums[left++];
        }
    }
    return sum;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Fenwick tree',
        idea: 'A Fenwick tree stores partial sums so that both "add to one position" and "sum of a prefix" touch only O(log n) cells, by jumping along the lowest set bit (`i & −i`). A range sum is the difference of two prefix sums.',
        steps: [
          'Build: for each `i` (1-based), add `tree[i]` into `tree[i + (i & −i)]` — O(n).',
          '`update(i, v)`: `delta = v − nums[i]`; for `j = i + 1` while `j ≤ n`: `tree[j] += delta`, `j += j & −j`.',
          '`prefix(k)`: for `j = k` while `j > 0`: add `tree[j]`, `j −= j & −j`.',
          '`sumRange(l, r) = prefix(r + 1) − prefix(l)`.',
        ],
        time: 'O(log n)', space: 'O(n)',
        why: 'Both operations walk at most log₂ n levels. A segment tree achieves the same bounds with more code.',
        code: {
          java: r`class NumArray {
    private final int[] nums, tree;

    public NumArray(int[] nums) {
        int n = nums.length;
        this.nums = nums.clone();
        tree = new int[n + 1];
        for (int i = 1; i <= n; i++) {
            tree[i] += nums[i - 1];
            int parent = i + (i & -i);
            if (parent <= n) tree[parent] += tree[i];
        }
    }

    public void update(int index, int val) {
        int delta = val - nums[index];
        nums[index] = val;
        for (int j = index + 1; j < tree.length; j += j & -j) tree[j] += delta;
    }

    public int sumRange(int left, int right) {
        return prefix(right + 1) - prefix(left);
    }

    private int prefix(int k) {
        int sum = 0;
        for (int j = k; j > 0; j -= j & -j) sum += tree[j];
        return sum;
    }
}`,
          cpp: r`class NumArray {
    vector<int> nums, tree;
    int prefix(int k) {
        int sum = 0;
        for (int j = k; j > 0; j -= j & -j) sum += tree[j];
        return sum;
    }
public:
    NumArray(vector<int>& nums) : nums(nums), tree(nums.size() + 1, 0) {
        int n = nums.size();
        for (int i = 1; i <= n; i++) {
            tree[i] += nums[i - 1];
            int parent = i + (i & -i);
            if (parent <= n) tree[parent] += tree[i];
        }
    }

    void update(int index, int val) {
        int delta = val - nums[index];
        nums[index] = val;
        for (int j = index + 1; j < (int) tree.size(); j += j & -j) tree[j] += delta;
    }

    int sumRange(int left, int right) {
        return prefix(right + 1) - prefix(left);
    }
};`,
          python: r`class NumArray:
    def __init__(self, nums: List[int]):
        n = len(nums)
        self.nums = list(nums)
        self.tree = [0] * (n + 1)
        for i in range(1, n + 1):
            self.tree[i] += nums[i - 1]
            parent = i + (i & -i)
            if parent <= n:
                self.tree[parent] += self.tree[i]

    def update(self, index: int, val: int) -> None:
        delta = val - self.nums[index]
        self.nums[index] = val
        j = index + 1
        while j < len(self.tree):
            self.tree[j] += delta
            j += j & -j

    def _prefix(self, k: int) -> int:
        total = 0
        while k > 0:
            total += self.tree[k]
            k -= k & -k
        return total

    def sumRange(self, left: int, right: int) -> int:
        return self._prefix(right + 1) - self._prefix(left)`,
          javascript: r`var NumArray = function(nums) {
    const n = nums.length;
    this.nums = [...nums];
    this.tree = new Array(n + 1).fill(0);
    for (let i = 1; i <= n; i++) {
        this.tree[i] += nums[i - 1];
        const parent = i + (i & -i);
        if (parent <= n) this.tree[parent] += this.tree[i];
    }
};

NumArray.prototype.update = function(index, val) {
    const delta = val - this.nums[index];
    this.nums[index] = val;
    for (let j = index + 1; j < this.tree.length; j += j & -j) this.tree[j] += delta;
};

NumArray.prototype.prefix = function(k) {
    let sum = 0;
    for (let j = k; j > 0; j -= j & -j) sum += this.tree[j];
    return sum;
};

NumArray.prototype.sumRange = function(left, right) {
    return this.prefix(right + 1) - this.prefix(left);
};`,
        },
      },
    ],
  },

  'count-of-smaller-numbers-after-self': {
    pattern: 'Scan from the right with a Fenwick tree over values (or merge-sort counting)',
    approaches: [
      {
        level: 'Brute force', name: 'Count to the right of each element',
        idea: 'For each element, scan everything after it and count the smaller values.',
        steps: [
          'For each `i`, count `j > i` with `nums[j] < nums[i]`.',
          'Store the count in `result[i]`.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'About n²/2 comparisons — 5·10⁹ for n = 10⁵.',
        code: {
          java: r`class Solution {
    public List<Integer> countSmaller(int[] nums) {
        List<Integer> result = new ArrayList<>();
        for (int i = 0; i < nums.length; i++) {
            int count = 0;
            for (int j = i + 1; j < nums.length; j++) if (nums[j] < nums[i]) count++;
            result.add(count);
        }
        return result;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> countSmaller(vector<int>& nums) {
        int n = nums.size();
        vector<int> result(n, 0);
        for (int i = 0; i < n; i++)
            for (int j = i + 1; j < n; j++) if (nums[j] < nums[i]) result[i]++;
        return result;
    }
};`,
          python: r`class Solution:
    def countSmaller(self, nums: List[int]) -> List[int]:
        return [sum(nums[j] < x for j in range(i + 1, len(nums))) for i, x in enumerate(nums)]`,
          javascript: r`var countSmaller = function(nums) {
    const n = nums.length, result = new Array(n).fill(0);
    for (let i = 0; i < n; i++)
        for (let j = i + 1; j < n; j++) if (nums[j] < nums[i]) result[i]++;
    return result;
};`,
        },
      },
      {
        level: 'Better', name: 'Sorted list built from the right',
        idea: 'Walk from right to left keeping the values seen so far in sorted order. The number of smaller values to the right is the insertion position of the current value, found by binary search.',
        steps: [
          'For `i` from n − 1 down to 0: `pos` = first index in `sorted` with value ≥ `nums[i]`.',
          '`result[i] = pos`; insert `nums[i]` at `pos`.',
        ],
        time: 'O(n²)', space: 'O(n)',
        why: 'The binary search is O(log n) but inserting into an array shifts up to n elements. It is fast in practice (a memory move), yet the worst case stays quadratic.',
        code: {
          java: r`class Solution {
    public List<Integer> countSmaller(int[] nums) {
        int n = nums.length;
        Integer[] result = new Integer[n];
        List<Integer> sorted = new ArrayList<>();
        for (int i = n - 1; i >= 0; i--) {
            int lo = 0, hi = sorted.size();
            while (lo < hi) {
                int mid = (lo + hi) >>> 1;
                if (sorted.get(mid) < nums[i]) lo = mid + 1;
                else hi = mid;
            }
            result[i] = lo;
            sorted.add(lo, nums[i]);
        }
        return Arrays.asList(result);
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> countSmaller(vector<int>& nums) {
        int n = nums.size();
        vector<int> result(n), sorted;
        for (int i = n - 1; i >= 0; i--) {
            auto it = lower_bound(sorted.begin(), sorted.end(), nums[i]);
            result[i] = it - sorted.begin();
            sorted.insert(it, nums[i]);
        }
        return result;
    }
};`,
          python: r`class Solution:
    def countSmaller(self, nums: List[int]) -> List[int]:
        result, seen = [0] * len(nums), []
        for i in range(len(nums) - 1, -1, -1):
            pos = bisect_left(seen, nums[i])
            result[i] = pos
            seen.insert(pos, nums[i])
        return result`,
          javascript: r`var countSmaller = function(nums) {
    const n = nums.length, result = new Array(n), sorted = [];
    for (let i = n - 1; i >= 0; i--) {
        let lo = 0, hi = sorted.length;
        while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (sorted[mid] < nums[i]) lo = mid + 1;
            else hi = mid;
        }
        result[i] = lo;
        sorted.splice(lo, 0, nums[i]);
    }
    return result;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Fenwick tree over values, scanning from the right',
        idea: 'Shift values into 1..20001 (they lie in −10⁴..10⁴). Walking right to left, the Fenwick tree holds counts of values already seen; the answer for `nums[i]` is the prefix count of strictly smaller values.',
        steps: [
          '`OFFSET = 10001`, so `v = nums[i] + OFFSET` is in `[1, 20001]`.',
          'For `i` from n − 1 down to 0: `result[i] = prefix(v − 1)`; then `add(v, 1)`.',
        ],
        time: 'O(n log V)', space: 'O(V)',
        why: 'V = 20001 possible values, so each step is about 15 tree hops. For unbounded values, compress coordinates first; merge sort that counts right-half elements overtaking each left element also gives O(n log n).',
        code: {
          java: r`class Solution {
    public List<Integer> countSmaller(int[] nums) {
        final int OFFSET = 10001, SIZE = 20002;
        int[] tree = new int[SIZE + 1];
        Integer[] result = new Integer[nums.length];
        for (int i = nums.length - 1; i >= 0; i--) {
            int v = nums[i] + OFFSET, count = 0;
            for (int j = v - 1; j > 0; j -= j & -j) count += tree[j];
            result[i] = count;
            for (int j = v; j <= SIZE; j += j & -j) tree[j]++;
        }
        return Arrays.asList(result);
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> countSmaller(vector<int>& nums) {
        const int OFFSET = 10001, SIZE = 20002;
        vector<int> tree(SIZE + 1, 0), result(nums.size());
        for (int i = nums.size() - 1; i >= 0; i--) {
            int v = nums[i] + OFFSET, count = 0;
            for (int j = v - 1; j > 0; j -= j & -j) count += tree[j];
            result[i] = count;
            for (int j = v; j <= SIZE; j += j & -j) tree[j]++;
        }
        return result;
    }
};`,
          python: r`class Solution:
    def countSmaller(self, nums: List[int]) -> List[int]:
        OFFSET, SIZE = 10001, 20002
        tree, result = [0] * (SIZE + 1), [0] * len(nums)
        for i in range(len(nums) - 1, -1, -1):
            v = nums[i] + OFFSET
            j, count = v - 1, 0
            while j > 0:
                count += tree[j]
                j -= j & -j
            result[i] = count
            j = v
            while j <= SIZE:
                tree[j] += 1
                j += j & -j
        return result`,
          javascript: r`var countSmaller = function(nums) {
    const OFFSET = 10001, SIZE = 20002, tree = new Int32Array(SIZE + 1), result = new Array(nums.length);
    for (let i = nums.length - 1; i >= 0; i--) {
        const v = nums[i] + OFFSET;
        let count = 0;
        for (let j = v - 1; j > 0; j -= j & -j) count += tree[j];
        result[i] = count;
        for (let j = v; j <= SIZE; j += j & -j) tree[j]++;
    }
    return result;
};`,
        },
      },
    ],
  },

  'reverse-pairs': {
    pattern: 'Merge-sort counting: count cross pairs between two sorted halves with a moving pointer',
    approaches: [
      {
        level: 'Brute force', name: 'Check every pair',
        idea: 'Test `nums[i] > 2·nums[j]` for every `i < j`, in 64-bit arithmetic.',
        steps: [
          'For every `i < j`: if `nums[i] > 2·nums[j]` (as a 64-bit value), count it.',
          'Return the count.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'About 1.25·10⁹ pairs for n = 5·10⁴.',
        code: {
          java: r`class Solution {
    public int reversePairs(int[] nums) {
        int count = 0;
        for (int i = 0; i < nums.length; i++)
            for (int j = i + 1; j < nums.length; j++)
                if (nums[i] > 2L * nums[j]) count++;
        return count;
    }
}`,
          cpp: r`class Solution {
public:
    int reversePairs(vector<int>& nums) {
        int count = 0, n = nums.size();
        for (int i = 0; i < n; i++)
            for (int j = i + 1; j < n; j++)
                if (nums[i] > 2LL * nums[j]) count++;
        return count;
    }
};`,
          python: r`class Solution:
    def reversePairs(self, nums: List[int]) -> int:
        n = len(nums)
        return sum(nums[i] > 2 * nums[j] for i in range(n) for j in range(i + 1, n))`,
          javascript: r`var reversePairs = function(nums) {
    let count = 0;
    for (let i = 0; i < nums.length; i++)
        for (let j = i + 1; j < nums.length; j++)
            if (nums[i] > 2 * nums[j]) count++;
    return count;
};`,
        },
      },
      {
        level: 'Better', name: 'Sorted list of earlier values + binary search',
        idea: 'Walk left to right keeping earlier values sorted. For `nums[j]`, the earlier values greater than `2·nums[j]` are everything after its upper bound.',
        steps: [
          'For each `j`: `count += size − upperBound(sorted, 2·nums[j])`.',
          'Insert `nums[j]` at its sorted position.',
        ],
        time: 'O(n²)', space: 'O(n)',
        why: 'Searches are O(log n), but each array insertion can shift O(n) elements.',
        code: {
          java: r`class Solution {
    public int reversePairs(int[] nums) {
        List<Integer> sorted = new ArrayList<>();
        int count = 0;
        for (int x : nums) {
            long limit = 2L * x;
            int lo = 0, hi = sorted.size();
            while (lo < hi) {
                int mid = (lo + hi) >>> 1;
                if (sorted.get(mid) <= limit) lo = mid + 1;
                else hi = mid;
            }
            count += sorted.size() - lo;
            lo = 0;
            hi = sorted.size();
            while (lo < hi) {
                int mid = (lo + hi) >>> 1;
                if (sorted.get(mid) < x) lo = mid + 1;
                else hi = mid;
            }
            sorted.add(lo, x);
        }
        return count;
    }
}`,
          cpp: r`class Solution {
public:
    int reversePairs(vector<int>& nums) {
        vector<long long> sorted;
        int count = 0;
        for (int x : nums) {
            count += sorted.end() - upper_bound(sorted.begin(), sorted.end(), 2LL * x);
            sorted.insert(lower_bound(sorted.begin(), sorted.end(), (long long) x), x);
        }
        return count;
    }
};`,
          python: r`class Solution:
    def reversePairs(self, nums: List[int]) -> int:
        seen, count = [], 0
        for x in nums:
            count += len(seen) - bisect_right(seen, 2 * x)
            insort(seen, x)
        return count`,
          javascript: r`var reversePairs = function(nums) {
    const sorted = [];
    const firstAbove = (limit, strict) => {
        let lo = 0, hi = sorted.length;
        while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (strict ? sorted[mid] <= limit : sorted[mid] < limit) lo = mid + 1;
            else hi = mid;
        }
        return lo;
    };
    let count = 0;
    for (const x of nums) {
        count += sorted.length - firstAbove(2 * x, true);
        sorted.splice(firstAbove(x, false), 0, x);
    }
    return count;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Merge sort with a counting pass',
        idea: 'Sort recursively. Before merging two sorted halves, count pairs with `i` in the left half and `j` in the right: as `nums[i]` grows, the set of `j` with `nums[i] > 2·nums[j]` only grows, so one forward pointer counts them all.',
        steps: [
          'Recursively sort and count each half.',
          'For each `i` in the left half, advance `j` in the right half while `nums[i] > 2·nums[j]`; add `j − (mid + 1)`.',
          'Merge the two halves as usual.',
        ],
        time: 'O(n log n)', space: 'O(n)',
        why: 'Each level does a linear count plus a linear merge, over log n levels. `2L·nums[j]` (64-bit) avoids overflow at the int extremes.',
        code: {
          java: r`class Solution {
    public int reversePairs(int[] nums) {
        int[] a = nums.clone();
        return (int) sort(a, 0, a.length - 1, new int[a.length]);
    }

    private long sort(int[] a, int lo, int hi, int[] tmp) {
        if (lo >= hi) return 0;
        int mid = (lo + hi) >>> 1;
        long count = sort(a, lo, mid, tmp) + sort(a, mid + 1, hi, tmp);
        for (int i = lo, j = mid + 1; i <= mid; i++) {
            while (j <= hi && a[i] > 2L * a[j]) j++;
            count += j - (mid + 1);
        }
        int i = lo, j = mid + 1, k = lo;
        while (i <= mid && j <= hi) tmp[k++] = a[i] <= a[j] ? a[i++] : a[j++];
        while (i <= mid) tmp[k++] = a[i++];
        while (j <= hi) tmp[k++] = a[j++];
        System.arraycopy(tmp, lo, a, lo, hi - lo + 1);
        return count;
    }
}`,
          cpp: r`class Solution {
    long long sort(vector<int>& a, int lo, int hi, vector<int>& tmp) {
        if (lo >= hi) return 0;
        int mid = (lo + hi) / 2;
        long long count = sort(a, lo, mid, tmp) + sort(a, mid + 1, hi, tmp);
        for (int i = lo, j = mid + 1; i <= mid; i++) {
            while (j <= hi && a[i] > 2LL * a[j]) j++;
            count += j - (mid + 1);
        }
        merge(a.begin() + lo, a.begin() + mid + 1, a.begin() + mid + 1, a.begin() + hi + 1, tmp.begin() + lo);
        copy(tmp.begin() + lo, tmp.begin() + hi + 1, a.begin() + lo);
        return count;
    }
public:
    int reversePairs(vector<int>& nums) {
        vector<int> a = nums, tmp(nums.size());
        return sort(a, 0, (int) a.size() - 1, tmp);
    }
};`,
          python: r`class Solution:
    def reversePairs(self, nums: List[int]) -> int:
        def sort(a):
            if len(a) <= 1:
                return a, 0
            mid = len(a) // 2
            left, c1 = sort(a[:mid])
            right, c2 = sort(a[mid:])
            count, j = c1 + c2, 0
            for x in left:
                while j < len(right) and x > 2 * right[j]:
                    j += 1
                count += j
            merged, i, j = [], 0, 0
            while i < len(left) and j < len(right):
                if left[i] <= right[j]:
                    merged.append(left[i])
                    i += 1
                else:
                    merged.append(right[j])
                    j += 1
            merged.extend(left[i:])
            merged.extend(right[j:])
            return merged, count
        return sort(nums)[1]`,
          javascript: r`var reversePairs = function(nums) {
    const a = [...nums], tmp = new Array(a.length);
    const sort = (lo, hi) => {
        if (lo >= hi) return 0;
        const mid = (lo + hi) >> 1;
        let count = sort(lo, mid) + sort(mid + 1, hi);
        for (let i = lo, j = mid + 1; i <= mid; i++) {
            while (j <= hi && a[i] > 2 * a[j]) j++;
            count += j - (mid + 1);
        }
        let i = lo, j = mid + 1, k = lo;
        while (i <= mid && j <= hi) tmp[k++] = a[i] <= a[j] ? a[i++] : a[j++];
        while (i <= mid) tmp[k++] = a[i++];
        while (j <= hi) tmp[k++] = a[j++];
        for (let t = lo; t <= hi; t++) a[t] = tmp[t];
        return count;
    };
    return sort(0, a.length - 1);
};`,
        },
      },
    ],
  },

  'count-of-range-sum': {
    pattern: 'Prefix sums + merge-sort counting of pairs whose difference lies in [lower, upper]',
    approaches: [
      {
        level: 'Brute force', name: 'Sum every subarray',
        idea: 'Fix the start, extend the end one element at a time keeping a running 64-bit sum, and count sums inside the range.',
        steps: [
          'For each `i`: `sum = 0`; for each `j ≥ i`: `sum += nums[j]`; count it if `lower ≤ sum ≤ upper`.',
          'Return the count.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'n(n + 1)/2 subarrays, O(1) each.',
        code: {
          java: r`class Solution {
    public int countRangeSum(int[] nums, int lower, int upper) {
        long count = 0;
        for (int i = 0; i < nums.length; i++) {
            long sum = 0;
            for (int j = i; j < nums.length; j++) {
                sum += nums[j];
                if (sum >= lower && sum <= upper) count++;
            }
        }
        return (int) count;
    }
}`,
          cpp: r`class Solution {
public:
    int countRangeSum(vector<int>& nums, int lower, int upper) {
        long long count = 0;
        for (size_t i = 0; i < nums.size(); i++) {
            long long sum = 0;
            for (size_t j = i; j < nums.size(); j++) {
                sum += nums[j];
                if (sum >= lower && sum <= upper) count++;
            }
        }
        return count;
    }
};`,
          python: r`class Solution:
    def countRangeSum(self, nums: List[int], lower: int, upper: int) -> int:
        count = 0
        for i in range(len(nums)):
            total = 0
            for j in range(i, len(nums)):
                total += nums[j]
                if lower <= total <= upper:
                    count += 1
        return count`,
          javascript: r`var countRangeSum = function(nums, lower, upper) {
    let count = 0;
    for (let i = 0; i < nums.length; i++) {
        let sum = 0;
        for (let j = i; j < nums.length; j++) {
            sum += nums[j];
            if (sum >= lower && sum <= upper) count++;
        }
    }
    return count;
};`,
        },
      },
      {
        level: 'Better', name: 'Sorted prefix sums + binary search',
        idea: 'With prefix sums `P`, a subarray `(i, j]` qualifies when `P[j] − upper ≤ P[i] ≤ P[j] − lower`. Keep earlier prefix sums sorted and count that window with two binary searches.',
        steps: [
          'Start with `sorted = [0]` (the empty prefix).',
          'For each new prefix sum `p`: count values in `[p − upper, p − lower]` via lower/upper bounds.',
          'Insert `p` at its sorted position.',
        ],
        time: 'O(n²)', space: 'O(n)',
        why: 'Counting is O(log n), but array insertion shifts up to n elements; a balanced tree with subtree sizes would make this O(n log n).',
        code: {
          java: r`class Solution {
    public int countRangeSum(int[] nums, int lower, int upper) {
        List<Long> sorted = new ArrayList<>();
        sorted.add(0L);
        long p = 0, count = 0;
        for (int x : nums) {
            p += x;
            count += firstAtLeast(sorted, p - lower + 1) - firstAtLeast(sorted, p - upper);
            sorted.add(firstAtLeast(sorted, p), p);
        }
        return (int) count;
    }

    private int firstAtLeast(List<Long> a, long v) {
        int lo = 0, hi = a.size();
        while (lo < hi) {
            int mid = (lo + hi) >>> 1;
            if (a.get(mid) < v) lo = mid + 1;
            else hi = mid;
        }
        return lo;
    }
}`,
          cpp: r`class Solution {
public:
    int countRangeSum(vector<int>& nums, int lower, int upper) {
        vector<long long> sorted{0};
        long long p = 0, count = 0;
        for (int x : nums) {
            p += x;
            count += upper_bound(sorted.begin(), sorted.end(), p - lower) - lower_bound(sorted.begin(), sorted.end(), p - upper);
            sorted.insert(lower_bound(sorted.begin(), sorted.end(), p), p);
        }
        return count;
    }
};`,
          python: r`class Solution:
    def countRangeSum(self, nums: List[int], lower: int, upper: int) -> int:
        seen, p, count = [0], 0, 0
        for x in nums:
            p += x
            count += bisect_right(seen, p - lower) - bisect_left(seen, p - upper)
            insort(seen, p)
        return count`,
          javascript: r`var countRangeSum = function(nums, lower, upper) {
    const sorted = [0];
    const firstAtLeast = (v) => {
        let lo = 0, hi = sorted.length;
        while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (sorted[mid] < v) lo = mid + 1;
            else hi = mid;
        }
        return lo;
    };
    let p = 0, count = 0;
    for (const x of nums) {
        p += x;
        count += firstAtLeast(p - lower + 1) - firstAtLeast(p - upper);
        sorted.splice(firstAtLeast(p), 0, p);
    }
    return count;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Merge sort over prefix sums',
        idea: 'Merge sort the prefix-sum array. Before merging two sorted halves, for each left value `P[i]` find the window of right values with `lower ≤ P[j] − P[i] ≤ upper`. Both window edges only move forward as `P[i]` grows.',
        steps: [
          'Build `P[0..n]` with `P[0] = 0` (64-bit).',
          'In each merge step, for each `i` in the left half: advance `lo` while `P[lo] − P[i] < lower`, advance `hi` while `P[hi] − P[i] ≤ upper`; add `hi − lo`.',
          'Merge the halves and return the total.',
        ],
        time: 'O(n log n)', space: 'O(n)',
        why: 'Linear work per level over log n levels. Prefix sums reach ±2·10¹⁴, so they need 64-bit integers (JavaScript doubles are exact up to 2⁵³).',
        code: {
          java: r`class Solution {
    private int lower, upper;

    public int countRangeSum(int[] nums, int lower, int upper) {
        this.lower = lower;
        this.upper = upper;
        int n = nums.length;
        long[] p = new long[n + 1];
        for (int i = 0; i < n; i++) p[i + 1] = p[i] + nums[i];
        return (int) sort(p, 0, n, new long[n + 1]);
    }

    private long sort(long[] p, int lo, int hi, long[] tmp) {
        if (lo >= hi) return 0;
        int mid = (lo + hi) >>> 1;
        long count = sort(p, lo, mid, tmp) + sort(p, mid + 1, hi, tmp);
        for (int i = lo, a = mid + 1, b = mid + 1; i <= mid; i++) {
            while (a <= hi && p[a] - p[i] < lower) a++;
            while (b <= hi && p[b] - p[i] <= upper) b++;
            count += b - a;
        }
        int i = lo, j = mid + 1, k = lo;
        while (i <= mid && j <= hi) tmp[k++] = p[i] <= p[j] ? p[i++] : p[j++];
        while (i <= mid) tmp[k++] = p[i++];
        while (j <= hi) tmp[k++] = p[j++];
        System.arraycopy(tmp, lo, p, lo, hi - lo + 1);
        return count;
    }
}`,
          cpp: r`class Solution {
    long long sort(vector<long long>& p, int lo, int hi, vector<long long>& tmp, int lower, int upper) {
        if (lo >= hi) return 0;
        int mid = (lo + hi) / 2;
        long long count = sort(p, lo, mid, tmp, lower, upper) + sort(p, mid + 1, hi, tmp, lower, upper);
        for (int i = lo, a = mid + 1, b = mid + 1; i <= mid; i++) {
            while (a <= hi && p[a] - p[i] < lower) a++;
            while (b <= hi && p[b] - p[i] <= upper) b++;
            count += b - a;
        }
        merge(p.begin() + lo, p.begin() + mid + 1, p.begin() + mid + 1, p.begin() + hi + 1, tmp.begin() + lo);
        copy(tmp.begin() + lo, tmp.begin() + hi + 1, p.begin() + lo);
        return count;
    }
public:
    int countRangeSum(vector<int>& nums, int lower, int upper) {
        int n = nums.size();
        vector<long long> p(n + 1, 0), tmp(n + 1);
        for (int i = 0; i < n; i++) p[i + 1] = p[i] + nums[i];
        return sort(p, 0, n, tmp, lower, upper);
    }
};`,
          python: r`class Solution:
    def countRangeSum(self, nums: List[int], lower: int, upper: int) -> int:
        prefix = [0]
        for x in nums:
            prefix.append(prefix[-1] + x)
        def sort(a):
            if len(a) <= 1:
                return a, 0
            mid = len(a) // 2
            left, c1 = sort(a[:mid])
            right, c2 = sort(a[mid:])
            count, lo, hi = c1 + c2, 0, 0
            for v in left:
                while lo < len(right) and right[lo] - v < lower:
                    lo += 1
                while hi < len(right) and right[hi] - v <= upper:
                    hi += 1
                count += hi - lo
            merged, i, j = [], 0, 0
            while i < len(left) and j < len(right):
                if left[i] <= right[j]:
                    merged.append(left[i])
                    i += 1
                else:
                    merged.append(right[j])
                    j += 1
            merged.extend(left[i:])
            merged.extend(right[j:])
            return merged, count
        return sort(prefix)[1]`,
          javascript: r`var countRangeSum = function(nums, lower, upper) {
    const n = nums.length, p = new Array(n + 1).fill(0), tmp = new Array(n + 1);
    for (let i = 0; i < n; i++) p[i + 1] = p[i] + nums[i];
    const sort = (lo, hi) => {
        if (lo >= hi) return 0;
        const mid = (lo + hi) >> 1;
        let count = sort(lo, mid) + sort(mid + 1, hi);
        for (let i = lo, a = mid + 1, b = mid + 1; i <= mid; i++) {
            while (a <= hi && p[a] - p[i] < lower) a++;
            while (b <= hi && p[b] - p[i] <= upper) b++;
            count += b - a;
        }
        let i = lo, j = mid + 1, k = lo;
        while (i <= mid && j <= hi) tmp[k++] = p[i] <= p[j] ? p[i++] : p[j++];
        while (i <= mid) tmp[k++] = p[i++];
        while (j <= hi) tmp[k++] = p[j++];
        for (let t = lo; t <= hi; t++) p[t] = tmp[t];
        return count;
    };
    return sort(0, n);
};`,
        },
      },
    ],
  },

  'create-sorted-array-through-instructions': {
    pattern: 'Fenwick tree over values: count strictly less and strictly greater in O(log V)',
    approaches: [
      {
        level: 'Brute force', name: 'Count by scanning every earlier value',
        idea: 'For each insertion, scan all values inserted so far and count those strictly less and strictly greater.',
        steps: [
          'For each `i`, count `j < i` with `instructions[j] < x` and with `instructions[j] > x`.',
          'Add the smaller count to the total (mod 10⁹ + 7).',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'About n²/2 comparisons — 5·10⁹ for n = 10⁵.',
        code: {
          java: r`class Solution {
    public int createSortedArray(int[] instructions) {
        long cost = 0;
        for (int i = 0; i < instructions.length; i++) {
            int less = 0, greater = 0;
            for (int j = 0; j < i; j++) {
                if (instructions[j] < instructions[i]) less++;
                else if (instructions[j] > instructions[i]) greater++;
            }
            cost += Math.min(less, greater);
        }
        return (int) (cost % 1_000_000_007);
    }
}`,
          cpp: r`class Solution {
public:
    int createSortedArray(vector<int>& instructions) {
        long long cost = 0;
        for (size_t i = 0; i < instructions.size(); i++) {
            int less = 0, greater = 0;
            for (size_t j = 0; j < i; j++) {
                if (instructions[j] < instructions[i]) less++;
                else if (instructions[j] > instructions[i]) greater++;
            }
            cost += min(less, greater);
        }
        return cost % 1'000'000'007;
    }
};`,
          python: r`class Solution:
    def createSortedArray(self, instructions: List[int]) -> int:
        cost = 0
        for i, x in enumerate(instructions):
            less = sum(y < x for y in instructions[:i])
            greater = sum(y > x for y in instructions[:i])
            cost += min(less, greater)
        return cost % (10**9 + 7)`,
          javascript: r`var createSortedArray = function(instructions) {
    let cost = 0;
    for (let i = 0; i < instructions.length; i++) {
        let less = 0, greater = 0;
        for (let j = 0; j < i; j++) {
            if (instructions[j] < instructions[i]) less++;
            else if (instructions[j] > instructions[i]) greater++;
        }
        cost += Math.min(less, greater);
    }
    return cost % 1000000007;
};`,
        },
      },
      {
        level: 'Better', name: 'Keep the container sorted, binary search',
        idea: 'Actually maintain the sorted container. Lower bound gives the count of strictly smaller values; size minus upper bound gives the strictly greater ones.',
        steps: [
          'For each `x`: `less = lowerBound(x)`, `greater = size − upperBound(x)`.',
          'Add `min(less, greater)`; insert `x` at `lowerBound(x)`.',
        ],
        time: 'O(n²)', space: 'O(n)',
        why: 'Searches are O(log n) but array insertion can shift O(n) elements each time.',
        code: {
          java: r`class Solution {
    public int createSortedArray(int[] instructions) {
        List<Integer> sorted = new ArrayList<>();
        long cost = 0;
        for (int x : instructions) {
            int less = firstAtLeast(sorted, x), greater = sorted.size() - firstAtLeast(sorted, x + 1);
            cost += Math.min(less, greater);
            sorted.add(less, x);
        }
        return (int) (cost % 1_000_000_007);
    }

    private int firstAtLeast(List<Integer> a, int v) {
        int lo = 0, hi = a.size();
        while (lo < hi) {
            int mid = (lo + hi) >>> 1;
            if (a.get(mid) < v) lo = mid + 1;
            else hi = mid;
        }
        return lo;
    }
}`,
          cpp: r`class Solution {
public:
    int createSortedArray(vector<int>& instructions) {
        vector<int> sorted;
        long long cost = 0;
        for (int x : instructions) {
            auto lo = lower_bound(sorted.begin(), sorted.end(), x);
            long long less = lo - sorted.begin();
            long long greater = sorted.end() - upper_bound(sorted.begin(), sorted.end(), x);
            cost += min(less, greater);
            sorted.insert(lo, x);
        }
        return cost % 1'000'000'007;
    }
};`,
          python: r`class Solution:
    def createSortedArray(self, instructions: List[int]) -> int:
        seen, cost = [], 0
        for x in instructions:
            less = bisect_left(seen, x)
            greater = len(seen) - bisect_right(seen, x)
            cost += min(less, greater)
            seen.insert(less, x)
        return cost % (10**9 + 7)`,
          javascript: r`var createSortedArray = function(instructions) {
    const sorted = [];
    const firstAtLeast = (v) => {
        let lo = 0, hi = sorted.length;
        while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (sorted[mid] < v) lo = mid + 1;
            else hi = mid;
        }
        return lo;
    };
    let cost = 0;
    for (const x of instructions) {
        const less = firstAtLeast(x), greater = sorted.length - firstAtLeast(x + 1);
        cost += Math.min(less, greater);
        sorted.splice(less, 0, x);
    }
    return cost % 1000000007;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Fenwick tree of value counts',
        idea: 'Values are at most 10⁵, so keep a Fenwick tree of how many times each value has been inserted. Before inserting the i-th value `x`: `less = prefix(x − 1)` and `greater = i − prefix(x)`.',
        steps: [
          'Tree over values 1..max.',
          'For the i-th value `x` (0-based count `i` already inserted): `less = prefix(x − 1)`, `greater = i − prefix(x)`.',
          'Add `min(less, greater)` to the total mod 10⁹ + 7; then `add(x, 1)`.',
        ],
        time: 'O(n log V)', space: 'O(V)',
        why: 'Two prefix queries and one update per value, each about 17 hops for V = 10⁵.',
        code: {
          java: r`class Solution {
    public int createSortedArray(int[] instructions) {
        int max = 0;
        for (int x : instructions) max = Math.max(max, x);
        int[] tree = new int[max + 1];
        long cost = 0;
        for (int i = 0; i < instructions.length; i++) {
            int x = instructions[i];
            int less = prefix(tree, x - 1), greater = i - prefix(tree, x);
            cost = (cost + Math.min(less, greater)) % 1_000_000_007;
            for (int j = x; j <= max; j += j & -j) tree[j]++;
        }
        return (int) cost;
    }

    private int prefix(int[] tree, int k) {
        int sum = 0;
        for (int j = k; j > 0; j -= j & -j) sum += tree[j];
        return sum;
    }
}`,
          cpp: r`class Solution {
    vector<int> tree;
    int prefix(int k) {
        int sum = 0;
        for (int j = k; j > 0; j -= j & -j) sum += tree[j];
        return sum;
    }
public:
    int createSortedArray(vector<int>& instructions) {
        int mx = *max_element(instructions.begin(), instructions.end());
        tree.assign(mx + 1, 0);
        long long cost = 0;
        for (int i = 0; i < (int) instructions.size(); i++) {
            int x = instructions[i];
            int less = prefix(x - 1), greater = i - prefix(x);
            cost = (cost + min(less, greater)) % 1'000'000'007;
            for (int j = x; j <= mx; j += j & -j) tree[j]++;
        }
        return cost;
    }
};`,
          python: r`class Solution:
    def createSortedArray(self, instructions: List[int]) -> int:
        mx = max(instructions)
        tree = [0] * (mx + 1)
        def prefix(k):
            total = 0
            while k > 0:
                total += tree[k]
                k -= k & -k
            return total
        cost = 0
        for i, x in enumerate(instructions):
            cost += min(prefix(x - 1), i - prefix(x))
            j = x
            while j <= mx:
                tree[j] += 1
                j += j & -j
        return cost % (10**9 + 7)`,
          javascript: r`var createSortedArray = function(instructions) {
    const mx = Math.max(...instructions), tree = new Int32Array(mx + 1);
    const prefix = (k) => {
        let sum = 0;
        for (let j = k; j > 0; j -= j & -j) sum += tree[j];
        return sum;
    };
    let cost = 0;
    for (let i = 0; i < instructions.length; i++) {
        const x = instructions[i];
        cost = (cost + Math.min(prefix(x - 1), i - prefix(x))) % 1000000007;
        for (let j = x; j <= mx; j += j & -j) tree[j]++;
    }
    return cost;
};`,
        },
      },
    ],
  },

  'falling-squares': {
    pattern: 'Interval max + assign: brute-force overlap checks, or a segment tree over compressed coordinates',
    approaches: [
      {
        level: 'Brute force', name: 'Compare with every landed square',
        idea: 'A new square `[left, left + side)` rests on the tallest earlier square it overlaps (touching edges do not count). Its top is that height plus `side`.',
        steps: [
          'Keep each landed square as `(left, right, top)`.',
          'For a new square, `base` = the max `top` over earlier squares with `l < right` and `left < r`.',
          'Its top is `base + side`; append it and record the running maximum.',
        ],
        time: 'O(n²)', space: 'O(n)',
        why: 'Each square checks all earlier ones; with n ≤ 1000 that is only 5·10⁵ checks, so this is the common interview answer.',
        code: {
          java: r`class Solution {
    public List<Integer> fallingSquares(int[][] positions) {
        List<int[]> landed = new ArrayList<>();
        List<Integer> result = new ArrayList<>();
        int best = 0;
        for (int[] p : positions) {
            int left = p[0], right = p[0] + p[1], base = 0;
            for (int[] s : landed)
                if (s[0] < right && left < s[1]) base = Math.max(base, s[2]);
            int top = base + p[1];
            landed.add(new int[] { left, right, top });
            best = Math.max(best, top);
            result.add(best);
        }
        return result;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> fallingSquares(vector<vector<int>>& positions) {
        vector<array<int, 3>> landed; // left, right, top
        vector<int> result;
        int best = 0;
        for (auto& p : positions) {
            int left = p[0], right = p[0] + p[1], base = 0;
            for (auto& s : landed)
                if (s[0] < right && left < s[1]) base = max(base, s[2]);
            int top = base + p[1];
            landed.push_back({left, right, top});
            best = max(best, top);
            result.push_back(best);
        }
        return result;
    }
};`,
          python: r`class Solution:
    def fallingSquares(self, positions: List[List[int]]) -> List[int]:
        landed, result, best = [], [], 0
        for left, side in positions:
            right = left + side
            base = max((top for l, r, top in landed if l < right and left < r), default=0)
            landed.append((left, right, base + side))
            best = max(best, base + side)
            result.append(best)
        return result`,
          javascript: r`var fallingSquares = function(positions) {
    const landed = [], result = [];
    let best = 0;
    for (const [left, side] of positions) {
        const right = left + side;
        let base = 0;
        for (const [l, r, top] of landed) if (l < right && left < r) base = Math.max(base, top);
        landed.push([left, right, base + side]);
        best = Math.max(best, base + side);
        result.push(best);
    }
    return result;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Segment tree over compressed coordinates',
        idea: 'Compress all square edges to indices; cell `k` stands for `[xs[k], xs[k + 1])`. Each drop is a range-max query over its cells followed by raising those cells to `max + side`. Because the new height exceeds everything in the range, "assign" is the same as "raise to at least", which a lazy max-tag handles.',
        steps: [
          'Collect every `left` and `left + side`, sort and deduplicate into `xs`; there are `xs.length − 1` cells.',
          'For a square, its cells are `[index(left), index(left + side) − 1]`.',
          '`h = queryMax(cells) + side`; `chmax(cells, h)` with lazy propagation.',
          'Record the running maximum of `h`.',
        ],
        time: 'O(n log n)', space: 'O(n)',
        why: 'Each query and update touches O(log n) nodes of a tree over at most 2n coordinates. Using half-open cells makes squares that only touch at an edge share no cell.',
        code: {
          java: r`class Solution {
    private int[] mx, lazy;

    public List<Integer> fallingSquares(int[][] positions) {
        TreeSet<Integer> set = new TreeSet<>();
        for (int[] p : positions) { set.add(p[0]); set.add(p[0] + p[1]); }
        int[] xs = set.stream().mapToInt(Integer::intValue).toArray();
        int cells = xs.length - 1;
        mx = new int[4 * cells];
        lazy = new int[4 * cells];
        List<Integer> result = new ArrayList<>();
        int best = 0;
        for (int[] p : positions) {
            int a = Arrays.binarySearch(xs, p[0]), b = Arrays.binarySearch(xs, p[0] + p[1]) - 1;
            int h = query(1, 0, cells - 1, a, b) + p[1];
            raise(1, 0, cells - 1, a, b, h);
            best = Math.max(best, h);
            result.add(best);
        }
        return result;
    }

    private void push(int node) {
        for (int c = 2 * node; c <= 2 * node + 1; c++) {
            mx[c] = Math.max(mx[c], lazy[node]);
            lazy[c] = Math.max(lazy[c], lazy[node]);
        }
        lazy[node] = 0;
    }

    private int query(int node, int lo, int hi, int a, int b) {
        if (b < lo || hi < a) return 0;
        if (a <= lo && hi <= b) return mx[node];
        push(node);
        int mid = (lo + hi) / 2;
        return Math.max(query(2 * node, lo, mid, a, b), query(2 * node + 1, mid + 1, hi, a, b));
    }

    private void raise(int node, int lo, int hi, int a, int b, int v) {
        if (b < lo || hi < a) return;
        if (a <= lo && hi <= b) {
            mx[node] = Math.max(mx[node], v);
            lazy[node] = Math.max(lazy[node], v);
            return;
        }
        push(node);
        int mid = (lo + hi) / 2;
        raise(2 * node, lo, mid, a, b, v);
        raise(2 * node + 1, mid + 1, hi, a, b, v);
        mx[node] = Math.max(mx[2 * node], mx[2 * node + 1]);
    }
}`,
          cpp: r`class Solution {
    vector<int> mx, lazy;
    void push(int node) {
        for (int c = 2 * node; c <= 2 * node + 1; c++) {
            mx[c] = max(mx[c], lazy[node]);
            lazy[c] = max(lazy[c], lazy[node]);
        }
        lazy[node] = 0;
    }
    int query(int node, int lo, int hi, int a, int b) {
        if (b < lo || hi < a) return 0;
        if (a <= lo && hi <= b) return mx[node];
        push(node);
        int mid = (lo + hi) / 2;
        return max(query(2 * node, lo, mid, a, b), query(2 * node + 1, mid + 1, hi, a, b));
    }
    void raise(int node, int lo, int hi, int a, int b, int v) {
        if (b < lo || hi < a) return;
        if (a <= lo && hi <= b) {
            mx[node] = max(mx[node], v);
            lazy[node] = max(lazy[node], v);
            return;
        }
        push(node);
        int mid = (lo + hi) / 2;
        raise(2 * node, lo, mid, a, b, v);
        raise(2 * node + 1, mid + 1, hi, a, b, v);
        mx[node] = max(mx[2 * node], mx[2 * node + 1]);
    }
public:
    vector<int> fallingSquares(vector<vector<int>>& positions) {
        vector<int> xs;
        for (auto& p : positions) { xs.push_back(p[0]); xs.push_back(p[0] + p[1]); }
        sort(xs.begin(), xs.end());
        xs.erase(unique(xs.begin(), xs.end()), xs.end());
        int cells = xs.size() - 1;
        mx.assign(4 * cells, 0);
        lazy.assign(4 * cells, 0);
        vector<int> result;
        int best = 0;
        for (auto& p : positions) {
            int a = lower_bound(xs.begin(), xs.end(), p[0]) - xs.begin();
            int b = lower_bound(xs.begin(), xs.end(), p[0] + p[1]) - xs.begin() - 1;
            int h = query(1, 0, cells - 1, a, b) + p[1];
            raise(1, 0, cells - 1, a, b, h);
            best = max(best, h);
            result.push_back(best);
        }
        return result;
    }
};`,
          python: r`class Solution:
    def fallingSquares(self, positions: List[List[int]]) -> List[int]:
        xs = sorted({x for left, side in positions for x in (left, left + side)})
        index = {x: i for i, x in enumerate(xs)}
        cells = len(xs) - 1
        mx, lazy = [0] * (4 * cells), [0] * (4 * cells)

        def push(node):
            for c in (2 * node, 2 * node + 1):
                mx[c] = max(mx[c], lazy[node])
                lazy[c] = max(lazy[c], lazy[node])
            lazy[node] = 0

        def query(node, lo, hi, a, b):
            if b < lo or hi < a:
                return 0
            if a <= lo and hi <= b:
                return mx[node]
            push(node)
            mid = (lo + hi) // 2
            return max(query(2 * node, lo, mid, a, b), query(2 * node + 1, mid + 1, hi, a, b))

        def raise_to(node, lo, hi, a, b, v):
            if b < lo or hi < a:
                return
            if a <= lo and hi <= b:
                mx[node] = max(mx[node], v)
                lazy[node] = max(lazy[node], v)
                return
            push(node)
            mid = (lo + hi) // 2
            raise_to(2 * node, lo, mid, a, b, v)
            raise_to(2 * node + 1, mid + 1, hi, a, b, v)
            mx[node] = max(mx[2 * node], mx[2 * node + 1])

        result, best = [], 0
        for left, side in positions:
            a, b = index[left], index[left + side] - 1
            h = query(1, 0, cells - 1, a, b) + side
            raise_to(1, 0, cells - 1, a, b, h)
            best = max(best, h)
            result.append(best)
        return result`,
          javascript: r`var fallingSquares = function(positions) {
    const xs = [...new Set(positions.flatMap(([l, s]) => [l, l + s]))].sort((a, b) => a - b);
    const index = new Map(xs.map((x, i) => [x, i]));
    const cells = xs.length - 1, mx = new Array(4 * cells).fill(0), lazy = new Array(4 * cells).fill(0);
    const push = (node) => {
        for (const c of [2 * node, 2 * node + 1]) {
            mx[c] = Math.max(mx[c], lazy[node]);
            lazy[c] = Math.max(lazy[c], lazy[node]);
        }
        lazy[node] = 0;
    };
    const query = (node, lo, hi, a, b) => {
        if (b < lo || hi < a) return 0;
        if (a <= lo && hi <= b) return mx[node];
        push(node);
        const mid = (lo + hi) >> 1;
        return Math.max(query(2 * node, lo, mid, a, b), query(2 * node + 1, mid + 1, hi, a, b));
    };
    const raise = (node, lo, hi, a, b, v) => {
        if (b < lo || hi < a) return;
        if (a <= lo && hi <= b) {
            mx[node] = Math.max(mx[node], v);
            lazy[node] = Math.max(lazy[node], v);
            return;
        }
        push(node);
        const mid = (lo + hi) >> 1;
        raise(2 * node, lo, mid, a, b, v);
        raise(2 * node + 1, mid + 1, hi, a, b, v);
        mx[node] = Math.max(mx[2 * node], mx[2 * node + 1]);
    };
    const result = [];
    let best = 0;
    for (const [left, side] of positions) {
        const a = index.get(left), b = index.get(left + side) - 1;
        const h = query(1, 0, cells - 1, a, b) + side;
        raise(1, 0, cells - 1, a, b, h);
        best = Math.max(best, h);
        result.push(best);
    }
    return result;
};`,
        },
      },
    ],
  },
};
