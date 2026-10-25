const r = String.raw;

export default {
  'last-stone-weight': {
    pattern: 'Max-heap simulation (always take the two largest)',
    approaches: [
      {
        level: 'Brute force', name: 'Sort before every smash',
        idea: 'Simulate directly: sort the stones, smash the two heaviest, put the remainder back, and repeat.',
        steps: [
          'While at least two stones remain: sort them.',
          'Remove the two heaviest `y >= x`; if `y > x`, add a stone of weight `y − x`.',
          'Return the last stone\'s weight, or 0.',
        ],
        time: 'O(n² log n)', space: 'O(n)',
        why: 'Up to n − 1 rounds, each sorting up to n stones.',
        code: {
          java: r`class Solution {
    public int lastStoneWeight(int[] stones) {
        List<Integer> s = new ArrayList<>();
        for (int x : stones) s.add(x);
        while (s.size() > 1) {
            Collections.sort(s);
            int y = s.remove(s.size() - 1), x = s.remove(s.size() - 1);
            if (y > x) s.add(y - x);
        }
        return s.isEmpty() ? 0 : s.get(0);
    }
}`,
          cpp: r`class Solution {
public:
    int lastStoneWeight(vector<int>& stones) {
        vector<int> s = stones;
        while (s.size() > 1) {
            sort(s.begin(), s.end());
            int y = s.back(); s.pop_back();
            int x = s.back(); s.pop_back();
            if (y > x) s.push_back(y - x);
        }
        return s.empty() ? 0 : s[0];
    }
};`,
          python: r`class Solution:
    def lastStoneWeight(self, stones: List[int]) -> int:
        s = list(stones)
        while len(s) > 1:
            s.sort()
            y, x = s.pop(), s.pop()
            if y > x:
                s.append(y - x)
        return s[0] if s else 0`,
          javascript: r`var lastStoneWeight = function(stones) {
    const s = [...stones];
    while (s.length > 1) {
        s.sort((a, b) => a - b);
        const y = s.pop(), x = s.pop();
        if (y > x) s.push(y - x);
    }
    return s.length ? s[0] : 0;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Max-heap',
        idea: 'A max-heap gives the heaviest stone in O(log n) without re-sorting everything each round.',
        steps: [
          'Put all stones in a max-heap.',
          'While the heap has at least two stones: pop `y`, pop `x`; if `y > x`, push `y − x`.',
          'Return the remaining stone, or 0.',
        ],
        time: 'O(n log n)', space: 'O(n)',
        why: 'At most n − 1 rounds, each with O(log n) heap operations.',
        code: {
          java: r`class Solution {
    public int lastStoneWeight(int[] stones) {
        PriorityQueue<Integer> heap = new PriorityQueue<>(Collections.reverseOrder());
        for (int x : stones) heap.add(x);
        while (heap.size() > 1) {
            int y = heap.poll(), x = heap.poll();
            if (y > x) heap.add(y - x);
        }
        return heap.isEmpty() ? 0 : heap.peek();
    }
}`,
          cpp: r`class Solution {
public:
    int lastStoneWeight(vector<int>& stones) {
        priority_queue<int> heap(stones.begin(), stones.end());
        while (heap.size() > 1) {
            int y = heap.top(); heap.pop();
            int x = heap.top(); heap.pop();
            if (y > x) heap.push(y - x);
        }
        return heap.empty() ? 0 : heap.top();
    }
};`,
          python: r`class Solution:
    def lastStoneWeight(self, stones: List[int]) -> int:
        heap = [-x for x in stones]  # heapq is a min-heap: store negatives
        heapify(heap)
        while len(heap) > 1:
            y, x = -heappop(heap), -heappop(heap)
            if y > x:
                heappush(heap, x - y)
        return -heap[0] if heap else 0`,
          javascript: r`var lastStoneWeight = function(stones) {
    const heap = new MaxPriorityQueue();
    for (const x of stones) heap.enqueue(x);
    while (heap.size() > 1) {
        const y = heap.dequeue(), x = heap.dequeue();
        if (y > x) heap.enqueue(y - x);
    }
    return heap.size() ? heap.front() : 0;
};`,
        },
      },
    ],
  },

  'kth-largest-element-in-a-stream': {
    pattern: 'Min-heap of size k (its top is the k-th largest)',
    approaches: [
      {
        level: 'Brute force', name: 'Keep every value in a sorted list',
        idea: 'Keep all values sorted. Insert each new value at its place, and read the k-th largest from the end.',
        steps: [
          'In the constructor, sort `nums` into a list.',
          '`add(val)`: binary search the insert position and insert `val` there.',
          'Return the element at index `size − k`.',
        ],
        time: 'O(n) per add', space: 'O(n)',
        why: 'Finding the position is O(log n), but inserting into the middle of an array shifts up to n elements. Every value is stored.',
        code: {
          java: r`class KthLargest {
    private final List<Integer> sorted = new ArrayList<>();
    private final int k;

    public KthLargest(int k, int[] nums) {
        this.k = k;
        for (int x : nums) sorted.add(x);
        Collections.sort(sorted);
    }

    public int add(int val) {
        int pos = Collections.binarySearch(sorted, val);
        sorted.add(pos >= 0 ? pos : -pos - 1, val);
        return sorted.get(sorted.size() - k);
    }
}`,
          cpp: r`class KthLargest {
    vector<int> sorted;
    int k;
public:
    KthLargest(int k, vector<int>& nums) : sorted(nums), k(k) {
        sort(sorted.begin(), sorted.end());
    }

    int add(int val) {
        sorted.insert(lower_bound(sorted.begin(), sorted.end(), val), val);
        return sorted[sorted.size() - k];
    }
};`,
          python: r`class KthLargest:

    def __init__(self, k: int, nums: List[int]):
        self.k = k
        self.sorted = sorted(nums)

    def add(self, val: int) -> int:
        insort(self.sorted, val)
        return self.sorted[-self.k]`,
          javascript: r`var KthLargest = function(k, nums) {
    this.k = k;
    this.sorted = [...nums].sort((a, b) => a - b);
};

KthLargest.prototype.add = function(val) {
    const a = this.sorted;
    let lo = 0, hi = a.length;
    while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (a[mid] < val) lo = mid + 1; else hi = mid;
    }
    a.splice(lo, 0, val);
    return a[a.length - this.k];
};`,
        },
      },
      {
        level: 'Optimal', name: 'Min-heap holding the k largest values',
        idea: 'Only the k largest values matter. Keep them in a min-heap: its smallest element is exactly the k-th largest. A new value either beats that smallest one (replace it) or is irrelevant.',
        steps: [
          'Push every initial value, popping whenever the heap grows past `k`.',
          '`add(val)`: push `val`; if the size exceeds `k`, pop the smallest.',
          'Return the heap\'s top.',
        ],
        time: 'O(log k) per add', space: 'O(k)',
        why: 'The heap never holds more than k + 1 values. Building it costs O(n log k) once.',
        code: {
          java: r`class KthLargest {
    private final PriorityQueue<Integer> heap = new PriorityQueue<>();
    private final int k;

    public KthLargest(int k, int[] nums) {
        this.k = k;
        for (int x : nums) add(x);
    }

    public int add(int val) {
        heap.add(val);
        if (heap.size() > k) heap.poll();
        return heap.peek();
    }
}`,
          cpp: r`class KthLargest {
    priority_queue<int, vector<int>, greater<int>> heap;
    int k;
public:
    KthLargest(int k, vector<int>& nums) : k(k) {
        for (int x : nums) add(x);
    }

    int add(int val) {
        heap.push(val);
        if ((int) heap.size() > k) heap.pop();
        return heap.top();
    }
};`,
          python: r`class KthLargest:

    def __init__(self, k: int, nums: List[int]):
        self.k = k
        self.heap = []
        for x in nums:
            self.add(x)

    def add(self, val: int) -> int:
        heappush(self.heap, val)
        if len(self.heap) > self.k:
            heappop(self.heap)
        return self.heap[0]`,
          javascript: r`var KthLargest = function(k, nums) {
    this.k = k;
    this.heap = new MinPriorityQueue();
    for (const x of nums) this.add(x);
};

KthLargest.prototype.add = function(val) {
    this.heap.enqueue(val);
    if (this.heap.size() > this.k) this.heap.dequeue();
    return this.heap.front();
};`,
        },
      },
    ],
  },

  'kth-largest-element-in-an-array': {
    pattern: 'Selection: min-heap of size k, or quickselect (partition around a pivot)',
    approaches: [
      {
        level: 'Brute force', name: 'Sort and index',
        idea: 'Sort the array; the k-th largest is at index `n − k`.',
        steps: [
          'Sort `nums` ascending.',
          'Return `nums[n − k]`.',
        ],
        time: 'O(n log n)', space: 'O(log n)',
        why: 'A full sort when only one position is needed.',
        code: {
          java: r`class Solution {
    public int findKthLargest(int[] nums, int k) {
        Arrays.sort(nums);
        return nums[nums.length - k];
    }
}`,
          cpp: r`class Solution {
public:
    int findKthLargest(vector<int>& nums, int k) {
        sort(nums.begin(), nums.end());
        return nums[nums.size() - k];
    }
};`,
          python: r`class Solution:
    def findKthLargest(self, nums: List[int], k: int) -> int:
        return sorted(nums)[-k]`,
          javascript: r`var findKthLargest = function(nums, k) {
    nums.sort((a, b) => a - b);
    return nums[nums.length - k];
};`,
        },
      },
      {
        level: 'Better', name: 'Min-heap of the k largest',
        idea: 'Scan the array keeping the k largest values seen so far in a min-heap; at the end its top is the k-th largest.',
        steps: [
          'For each value, push it into a min-heap.',
          'If the heap holds more than `k` values, pop the smallest.',
          'Return the heap\'s top.',
        ],
        time: 'O(n log k)', space: 'O(k)',
        why: 'n pushes (and pops) on a heap of size at most k + 1.',
        code: {
          java: r`class Solution {
    public int findKthLargest(int[] nums, int k) {
        PriorityQueue<Integer> heap = new PriorityQueue<>();
        for (int x : nums) {
            heap.add(x);
            if (heap.size() > k) heap.poll();
        }
        return heap.peek();
    }
}`,
          cpp: r`class Solution {
public:
    int findKthLargest(vector<int>& nums, int k) {
        priority_queue<int, vector<int>, greater<int>> heap;
        for (int x : nums) {
            heap.push(x);
            if ((int) heap.size() > k) heap.pop();
        }
        return heap.top();
    }
};`,
          python: r`class Solution:
    def findKthLargest(self, nums: List[int], k: int) -> int:
        heap = []
        for x in nums:
            heappush(heap, x)
            if len(heap) > k:
                heappop(heap)
        return heap[0]`,
          javascript: r`var findKthLargest = function(nums, k) {
    const heap = new MinPriorityQueue();
    for (const x of nums) {
        heap.enqueue(x);
        if (heap.size() > k) heap.dequeue();
    }
    return heap.front();
};`,
        },
      },
      {
        level: 'Optimal', name: 'Quickselect with a three-way partition',
        idea: 'Partition around a random pivot into values less than, equal to, and greater than it (like quicksort). Then the answer\'s position `n − k` falls into exactly one of the three parts; continue only in that part.',
        steps: [
          'The target index in sorted order is `t = n − k`. Search the range `[lo, hi] = [0, n − 1]`.',
          'Pick a random pivot and partition the range into `< pivot`, `== pivot` and `> pivot` (Dutch national flag), giving the boundaries `lt` and `gt` of the equal block.',
          'If `t < lt`, continue on the left part; if `t > gt`, on the right part; otherwise return the pivot.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'Expected O(n): a random pivot discards a constant fraction on average, so the work is n + n/2 + n/4 + … (the worst case is O(n²) but very unlikely). The three-way split keeps it fast with many duplicates, which a two-way partition would not.',
        code: {
          java: r`class Solution {
    public int findKthLargest(int[] nums, int k) {
        Random rnd = new Random(7);
        int t = nums.length - k, lo = 0, hi = nums.length - 1;
        while (true) {
            int pivot = nums[lo + rnd.nextInt(hi - lo + 1)], lt = lo, i = lo, gt = hi;
            while (i <= gt) {
                if (nums[i] < pivot) swap(nums, lt++, i++);
                else if (nums[i] > pivot) swap(nums, i, gt--);
                else i++;
            }
            if (t < lt) hi = lt - 1;
            else if (t > gt) lo = gt + 1;
            else return pivot;
        }
    }

    private void swap(int[] a, int i, int j) {
        int x = a[i]; a[i] = a[j]; a[j] = x;
    }
}`,
          cpp: r`class Solution {
public:
    int findKthLargest(vector<int>& nums, int k) {
        mt19937 rnd(7);
        int t = nums.size() - k, lo = 0, hi = (int) nums.size() - 1;
        while (true) {
            int pivot = nums[lo + rnd() % (hi - lo + 1)], lt = lo, i = lo, gt = hi;
            while (i <= gt) {
                if (nums[i] < pivot) swap(nums[lt++], nums[i++]);
                else if (nums[i] > pivot) swap(nums[i], nums[gt--]);
                else i++;
            }
            if (t < lt) hi = lt - 1;
            else if (t > gt) lo = gt + 1;
            else return pivot;
        }
    }
};`,
          python: r`class Solution:
    def findKthLargest(self, nums: List[int], k: int) -> int:
        t, lo, hi = len(nums) - k, 0, len(nums) - 1
        while True:
            pivot = nums[random.randint(lo, hi)]
            lt, i, gt = lo, lo, hi
            while i <= gt:
                if nums[i] < pivot:
                    nums[lt], nums[i] = nums[i], nums[lt]
                    lt += 1
                    i += 1
                elif nums[i] > pivot:
                    nums[i], nums[gt] = nums[gt], nums[i]
                    gt -= 1
                else:
                    i += 1
            if t < lt:
                hi = lt - 1
            elif t > gt:
                lo = gt + 1
            else:
                return pivot`,
          javascript: r`var findKthLargest = function(nums, k) {
    const t = nums.length - k;
    let lo = 0, hi = nums.length - 1;
    while (true) {
        const pivot = nums[lo + Math.floor(Math.random() * (hi - lo + 1))];
        let lt = lo, i = lo, gt = hi;
        while (i <= gt) {
            if (nums[i] < pivot) { [nums[lt], nums[i]] = [nums[i], nums[lt]]; lt++; i++; }
            else if (nums[i] > pivot) { [nums[i], nums[gt]] = [nums[gt], nums[i]]; gt--; }
            else i++;
        }
        if (t < lt) hi = lt - 1;
        else if (t > gt) lo = gt + 1;
        else return pivot;
    }
};`,
        },
      },
    ],
  },

  'top-k-frequent-elements': {
    pattern: 'Count with a hash map, then bucket sort by frequency (or a size-k heap)',
    approaches: [
      {
        level: 'Brute force', name: 'Count, then sort values by count',
        idea: 'Count each value, sort the distinct values by count (highest first), and take the first k.',
        steps: [
          'Count occurrences in a hash map.',
          'Sort the distinct values by count, descending.',
          'Return the first `k`.',
        ],
        time: 'O(n log n)', space: 'O(n)',
        why: 'Counting is O(n); sorting up to n distinct values is O(n log n).',
        code: {
          java: r`class Solution {
    public int[] topKFrequent(int[] nums, int k) {
        Map<Integer, Integer> count = new HashMap<>();
        for (int x : nums) count.merge(x, 1, Integer::sum);
        List<Integer> vals = new ArrayList<>(count.keySet());
        vals.sort((a, b) -> count.get(b) - count.get(a));
        int[] out = new int[k];
        for (int i = 0; i < k; i++) out[i] = vals.get(i);
        return out;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> topKFrequent(vector<int>& nums, int k) {
        unordered_map<int, int> count;
        for (int x : nums) count[x]++;
        vector<pair<int, int>> vals;
        for (auto& [v, c] : count) vals.push_back({c, v});
        sort(vals.rbegin(), vals.rend());
        vector<int> out;
        for (int i = 0; i < k; i++) out.push_back(vals[i].second);
        return out;
    }
};`,
          python: r`class Solution:
    def topKFrequent(self, nums: List[int], k: int) -> List[int]:
        count = Counter(nums)
        return sorted(count, key=lambda v: -count[v])[:k]`,
          javascript: r`var topKFrequent = function(nums, k) {
    const count = new Map();
    for (const x of nums) count.set(x, (count.get(x) ?? 0) + 1);
    return [...count.keys()].sort((a, b) => count.get(b) - count.get(a)).slice(0, k);
};`,
        },
      },
      {
        level: 'Better', name: 'Count, then a min-heap of size k',
        idea: 'Keep the k most frequent values in a min-heap keyed by count; a value with a higher count pushes out the least frequent of them.',
        steps: [
          'Count occurrences.',
          'For each distinct value, push `(count, value)`; if the heap exceeds `k`, pop the smallest count.',
          'Return the values left in the heap.',
        ],
        time: 'O(n log k)', space: 'O(n)',
        why: 'Up to n distinct values pass through a heap of size k. The count map holds up to n entries.',
        code: {
          java: r`class Solution {
    public int[] topKFrequent(int[] nums, int k) {
        Map<Integer, Integer> count = new HashMap<>();
        for (int x : nums) count.merge(x, 1, Integer::sum);
        PriorityQueue<Integer> heap = new PriorityQueue<>((a, b) -> count.get(a) - count.get(b));
        for (int v : count.keySet()) {
            heap.add(v);
            if (heap.size() > k) heap.poll();
        }
        int[] out = new int[k];
        for (int i = 0; i < k; i++) out[i] = heap.poll();
        return out;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> topKFrequent(vector<int>& nums, int k) {
        unordered_map<int, int> count;
        for (int x : nums) count[x]++;
        priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> heap;
        for (auto& [v, c] : count) {
            heap.push({c, v});
            if ((int) heap.size() > k) heap.pop();
        }
        vector<int> out;
        while (!heap.empty()) { out.push_back(heap.top().second); heap.pop(); }
        return out;
    }
};`,
          python: r`class Solution:
    def topKFrequent(self, nums: List[int], k: int) -> List[int]:
        heap = []
        for v, c in Counter(nums).items():
            heappush(heap, (c, v))
            if len(heap) > k:
                heappop(heap)
        return [v for _, v in heap]`,
          javascript: r`var topKFrequent = function(nums, k) {
    const count = new Map();
    for (const x of nums) count.set(x, (count.get(x) ?? 0) + 1);
    const heap = new PriorityQueue((a, b) => a[0] - b[0]);
    for (const [v, c] of count) {
        heap.enqueue([c, v]);
        if (heap.size() > k) heap.dequeue();
    }
    return heap.toArray().map(([, v]) => v);
};`,
        },
      },
      {
        level: 'Optimal', name: 'Bucket sort by frequency',
        idea: 'A count is between 1 and n, so put each value into bucket `count`. Reading buckets from n down to 1 lists values from most to least frequent, with no comparison sort.',
        steps: [
          'Count occurrences.',
          'Create n + 1 buckets; add each value to `bucket[count]`.',
          'Walk the buckets from n down to 1, collecting values until you have `k`.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Counting, filling buckets and the final walk are all linear. The answer is unique, so stopping at exactly k values is safe.',
        code: {
          java: r`class Solution {
    public int[] topKFrequent(int[] nums, int k) {
        Map<Integer, Integer> count = new HashMap<>();
        for (int x : nums) count.merge(x, 1, Integer::sum);
        List<List<Integer>> bucket = new ArrayList<>();
        for (int i = 0; i <= nums.length; i++) bucket.add(new ArrayList<>());
        for (Map.Entry<Integer, Integer> e : count.entrySet()) bucket.get(e.getValue()).add(e.getKey());
        int[] out = new int[k];
        int w = 0;
        for (int c = nums.length; c >= 1 && w < k; c--)
            for (int v : bucket.get(c)) if (w < k) out[w++] = v;
        return out;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> topKFrequent(vector<int>& nums, int k) {
        unordered_map<int, int> count;
        for (int x : nums) count[x]++;
        vector<vector<int>> bucket(nums.size() + 1);
        for (auto& [v, c] : count) bucket[c].push_back(v);
        vector<int> out;
        for (int c = nums.size(); c >= 1 && (int) out.size() < k; c--)
            for (int v : bucket[c]) if ((int) out.size() < k) out.push_back(v);
        return out;
    }
};`,
          python: r`class Solution:
    def topKFrequent(self, nums: List[int], k: int) -> List[int]:
        bucket = [[] for _ in range(len(nums) + 1)]
        for v, c in Counter(nums).items():
            bucket[c].append(v)
        out = []
        for c in range(len(nums), 0, -1):
            for v in bucket[c]:
                if len(out) < k:
                    out.append(v)
        return out`,
          javascript: r`var topKFrequent = function(nums, k) {
    const count = new Map();
    for (const x of nums) count.set(x, (count.get(x) ?? 0) + 1);
    const bucket = Array.from({ length: nums.length + 1 }, () => []);
    for (const [v, c] of count) bucket[c].push(v);
    const out = [];
    for (let c = nums.length; c >= 1 && out.length < k; c--)
        for (const v of bucket[c]) if (out.length < k) out.push(v);
    return out;
};`,
        },
      },
    ],
  },

  'k-closest-points-to-origin': {
    pattern: 'Top-k selection by squared distance: max-heap of size k, or quickselect',
    approaches: [
      {
        level: 'Brute force', name: 'Sort by distance',
        idea: 'Sort all points by `x² + y²` and return the first k.',
        steps: [
          'Sort points by squared distance (no square root needed: it keeps the order).',
          'Return the first `k`.',
        ],
        time: 'O(n log n)', space: 'O(n)',
        why: 'A full sort when only the k smallest are needed.',
        code: {
          java: r`class Solution {
    public int[][] kClosest(int[][] points, int k) {
        Arrays.sort(points, (a, b) -> Integer.compare(a[0] * a[0] + a[1] * a[1], b[0] * b[0] + b[1] * b[1]));
        return Arrays.copyOf(points, k);
    }
}`,
          cpp: r`class Solution {
public:
    vector<vector<int>> kClosest(vector<vector<int>>& points, int k) {
        sort(points.begin(), points.end(), [](auto& a, auto& b) {
            return a[0] * a[0] + a[1] * a[1] < b[0] * b[0] + b[1] * b[1];
        });
        return vector<vector<int>>(points.begin(), points.begin() + k);
    }
};`,
          python: r`class Solution:
    def kClosest(self, points: List[List[int]], k: int) -> List[List[int]]:
        return sorted(points, key=lambda p: p[0] * p[0] + p[1] * p[1])[:k]`,
          javascript: r`var kClosest = function(points, k) {
    const d = (p) => p[0] * p[0] + p[1] * p[1];
    return points.sort((a, b) => d(a) - d(b)).slice(0, k);
};`,
        },
      },
      {
        level: 'Better', name: 'Max-heap of the k closest so far',
        idea: 'Keep the k closest points in a max-heap by distance; when a new point is closer than the farthest of them, it replaces it.',
        steps: [
          'For each point, push it with its squared distance.',
          'If the heap holds more than `k` points, pop the farthest.',
          'Return the points left in the heap.',
        ],
        time: 'O(n log k)', space: 'O(k)',
        why: 'n operations on a heap of size at most k + 1.',
        code: {
          java: r`class Solution {
    public int[][] kClosest(int[][] points, int k) {
        PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> Integer.compare(b[0] * b[0] + b[1] * b[1], a[0] * a[0] + a[1] * a[1]));
        for (int[] p : points) {
            heap.add(p);
            if (heap.size() > k) heap.poll();
        }
        return heap.toArray(new int[0][]);
    }
}`,
          cpp: r`class Solution {
public:
    vector<vector<int>> kClosest(vector<vector<int>>& points, int k) {
        priority_queue<pair<int, int>> heap; // (distance, index), largest distance on top
        for (int i = 0; i < (int) points.size(); i++) {
            heap.push({points[i][0] * points[i][0] + points[i][1] * points[i][1], i});
            if ((int) heap.size() > k) heap.pop();
        }
        vector<vector<int>> out;
        while (!heap.empty()) { out.push_back(points[heap.top().second]); heap.pop(); }
        return out;
    }
};`,
          python: r`class Solution:
    def kClosest(self, points: List[List[int]], k: int) -> List[List[int]]:
        heap = []
        for i, (x, y) in enumerate(points):
            heappush(heap, (-(x * x + y * y), i))  # negate for a max-heap
            if len(heap) > k:
                heappop(heap)
        return [points[i] for _, i in heap]`,
          javascript: r`var kClosest = function(points, k) {
    const d = (p) => p[0] * p[0] + p[1] * p[1];
    const heap = new PriorityQueue((a, b) => d(b) - d(a));
    for (const p of points) {
        heap.enqueue(p);
        if (heap.size() > k) heap.dequeue();
    }
    return heap.toArray();
};`,
        },
      },
      {
        level: 'Optimal', name: 'Quickselect on distance',
        idea: 'Partition the points around a random pivot distance so the k closest end up in the first k slots (in any order), recursing only into the side that contains position k.',
        steps: [
          'Search the range `[lo, hi]` for the boundary at index `k`.',
          'Pick a random pivot point, partition the range into distances `<` pivot, `==` pivot and `>` pivot.',
          'If `k` falls inside the left part, continue there; if after the equal block, continue on the right; otherwise the first k slots are the k closest.',
          'Return the first `k` points.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'Expected linear time with a random pivot (worst case O(n²), very unlikely); partitioning is done in place (the returned copy of k points aside).',
        code: {
          java: r`class Solution {
    public int[][] kClosest(int[][] points, int k) {
        Random rnd = new Random(7);
        int lo = 0, hi = points.length - 1;
        while (lo < hi) {
            int pivot = dist(points[lo + rnd.nextInt(hi - lo + 1)]), lt = lo, i = lo, gt = hi;
            while (i <= gt) {
                int d = dist(points[i]);
                if (d < pivot) swap(points, lt++, i++);
                else if (d > pivot) swap(points, i, gt--);
                else i++;
            }
            if (k < lt) hi = lt - 1;
            else if (k > gt + 1) lo = gt + 1;
            else break;
        }
        return Arrays.copyOf(points, k);
    }

    private int dist(int[] p) { return p[0] * p[0] + p[1] * p[1]; }

    private void swap(int[][] a, int i, int j) { int[] t = a[i]; a[i] = a[j]; a[j] = t; }
}`,
          cpp: r`class Solution {
    static int dist(const vector<int>& p) { return p[0] * p[0] + p[1] * p[1]; }
public:
    vector<vector<int>> kClosest(vector<vector<int>>& points, int k) {
        mt19937 rnd(7);
        int lo = 0, hi = (int) points.size() - 1;
        while (lo < hi) {
            int pivot = dist(points[lo + rnd() % (hi - lo + 1)]), lt = lo, i = lo, gt = hi;
            while (i <= gt) {
                int d = dist(points[i]);
                if (d < pivot) swap(points[lt++], points[i++]);
                else if (d > pivot) swap(points[i], points[gt--]);
                else i++;
            }
            if (k < lt) hi = lt - 1;
            else if (k > gt + 1) lo = gt + 1;
            else break;
        }
        return vector<vector<int>>(points.begin(), points.begin() + k);
    }
};`,
          python: r`class Solution:
    def kClosest(self, points: List[List[int]], k: int) -> List[List[int]]:
        dist = lambda p: p[0] * p[0] + p[1] * p[1]
        lo, hi = 0, len(points) - 1
        while lo < hi:
            pivot = dist(points[random.randint(lo, hi)])
            lt, i, gt = lo, lo, hi
            while i <= gt:
                d = dist(points[i])
                if d < pivot:
                    points[lt], points[i] = points[i], points[lt]
                    lt += 1
                    i += 1
                elif d > pivot:
                    points[i], points[gt] = points[gt], points[i]
                    gt -= 1
                else:
                    i += 1
            if k < lt:
                hi = lt - 1
            elif k > gt + 1:
                lo = gt + 1
            else:
                break
        return points[:k]`,
          javascript: r`var kClosest = function(points, k) {
    const dist = (p) => p[0] * p[0] + p[1] * p[1];
    let lo = 0, hi = points.length - 1;
    while (lo < hi) {
        const pivot = dist(points[lo + Math.floor(Math.random() * (hi - lo + 1))]);
        let lt = lo, i = lo, gt = hi;
        while (i <= gt) {
            const d = dist(points[i]);
            if (d < pivot) { [points[lt], points[i]] = [points[i], points[lt]]; lt++; i++; }
            else if (d > pivot) { [points[i], points[gt]] = [points[gt], points[i]]; gt--; }
            else i++;
        }
        if (k < lt) hi = lt - 1;
        else if (k > gt + 1) lo = gt + 1;
        else break;
    }
    return points.slice(0, k);
};`,
        },
      },
    ],
  },

  'task-scheduler': {
    pattern: 'Greedy: schedule around the most frequent task (heap simulation or a counting formula)',
    approaches: [
      {
        level: 'Better', name: 'Simulate with a max-heap and a cooldown queue',
        idea: 'At each time step, run the available task with the most remaining copies (it is the hardest to fit). A task that just ran waits in a queue until its cooldown ends.',
        steps: [
          'Push the count of each task into a max-heap; keep a queue of `(remaining, readyTime)`.',
          'Each step `t`: if the queue front is ready (`readyTime == t`), move it back into the heap.',
          'If the heap is non-empty, pop the largest count, decrease it, and if copies remain, queue it with `readyTime = t + n + 1`. Otherwise the CPU idles.',
          'Stop when both are empty; the answer is the number of steps.',
        ],
        time: 'O(T·log 26)', space: 'O(26)',
        why: 'T is the answer (tasks plus idles, at most about (n + 1)·tasks); each step does O(log 26) heap work. Only 26 task types exist.',
        code: {
          java: r`class Solution {
    public int leastInterval(char[] tasks, int n) {
        int[] count = new int[26];
        for (char c : tasks) count[c - 'A']++;
        PriorityQueue<Integer> heap = new PriorityQueue<>(Collections.reverseOrder());
        for (int c : count) if (c > 0) heap.add(c);
        Deque<int[]> cooling = new ArrayDeque<>();
        int t = 0;
        while (!heap.isEmpty() || !cooling.isEmpty()) {
            if (!cooling.isEmpty() && cooling.peek()[1] == t) heap.add(cooling.poll()[0]);
            if (!heap.isEmpty()) {
                int left = heap.poll() - 1;
                if (left > 0) cooling.add(new int[] { left, t + n + 1 });
            }
            t++;
        }
        return t;
    }
}`,
          cpp: r`class Solution {
public:
    int leastInterval(vector<char>& tasks, int n) {
        int count[26] = {0};
        for (char c : tasks) count[c - 'A']++;
        priority_queue<int> heap;
        for (int c : count) if (c > 0) heap.push(c);
        queue<pair<int, int>> cooling;
        int t = 0;
        while (!heap.empty() || !cooling.empty()) {
            if (!cooling.empty() && cooling.front().second == t) { heap.push(cooling.front().first); cooling.pop(); }
            if (!heap.empty()) {
                int left = heap.top() - 1;
                heap.pop();
                if (left > 0) cooling.push({left, t + n + 1});
            }
            t++;
        }
        return t;
    }
};`,
          python: r`class Solution:
    def leastInterval(self, tasks: List[str], n: int) -> int:
        heap = [-c for c in Counter(tasks).values()]
        heapify(heap)
        cooling = deque()
        t = 0
        while heap or cooling:
            if cooling and cooling[0][1] == t:
                heappush(heap, cooling.popleft()[0])
            if heap:
                left = heappop(heap) + 1  # counts are stored negated
                if left < 0:
                    cooling.append((left, t + n + 1))
            t += 1
        return t`,
          javascript: r`var leastInterval = function(tasks, n) {
    const count = new Map();
    for (const c of tasks) count.set(c, (count.get(c) ?? 0) + 1);
    const heap = new MaxPriorityQueue();
    for (const c of count.values()) heap.enqueue(c);
    const cooling = new Queue();
    let t = 0;
    while (heap.size() || cooling.size()) {
        if (cooling.size() && cooling.front()[1] === t) heap.enqueue(cooling.dequeue()[0]);
        if (heap.size()) {
            const left = heap.dequeue() - 1;
            if (left > 0) cooling.enqueue([left, t + n + 1]);
        }
        t++;
    }
    return t;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Count the frames of the most frequent task',
        idea: 'Let the most frequent task appear `maxCount` times. Its runs split the timeline into `maxCount − 1` frames of length `n + 1`, plus a final frame holding every task that also appears `maxCount` times. Other tasks fill the gaps; if there are more tasks than gaps, no idling is needed and the answer is just the number of tasks.',
        steps: [
          'Count each task; find `maxCount` and `tied`, the number of tasks with that count.',
          'The frame layout needs `(maxCount − 1) × (n + 1) + tied` intervals.',
          'Return the larger of that and `tasks.length`.',
        ],
        time: 'O(T)', space: 'O(1)',
        why: 'One counting pass over T tasks plus 26 counts. The layout is a lower bound (copies of the top task must be n apart) and it is always achievable; when gaps overflow, every interval runs a task.',
        code: {
          java: r`class Solution {
    public int leastInterval(char[] tasks, int n) {
        int[] count = new int[26];
        for (char c : tasks) count[c - 'A']++;
        int maxCount = 0, tied = 0;
        for (int c : count) maxCount = Math.max(maxCount, c);
        for (int c : count) if (c == maxCount) tied++;
        return Math.max(tasks.length, (maxCount - 1) * (n + 1) + tied);
    }
}`,
          cpp: r`class Solution {
public:
    int leastInterval(vector<char>& tasks, int n) {
        int count[26] = {0};
        for (char c : tasks) count[c - 'A']++;
        int maxCount = *max_element(count, count + 26), tied = 0;
        for (int c : count) if (c == maxCount) tied++;
        return max((int) tasks.size(), (maxCount - 1) * (n + 1) + tied);
    }
};`,
          python: r`class Solution:
    def leastInterval(self, tasks: List[str], n: int) -> int:
        counts = Counter(tasks).values()
        max_count = max(counts)
        tied = sum(1 for c in counts if c == max_count)
        return max(len(tasks), (max_count - 1) * (n + 1) + tied)`,
          javascript: r`var leastInterval = function(tasks, n) {
    const count = new Map();
    for (const c of tasks) count.set(c, (count.get(c) ?? 0) + 1);
    const counts = [...count.values()], maxCount = Math.max(...counts);
    const tied = counts.filter((c) => c === maxCount).length;
    return Math.max(tasks.length, (maxCount - 1) * (n + 1) + tied);
};`,
        },
      },
    ],
  },

  'kth-smallest-element-in-a-sorted-matrix': {
    pattern: 'K-way merge with a min-heap, or binary search on the value with a staircase count',
    approaches: [
      {
        level: 'Brute force', name: 'Flatten and sort',
        idea: 'Copy every value into one array, sort it, and take index `k − 1`.',
        steps: [
          'Copy all n² values into an array.',
          'Sort it and return the element at `k − 1`.',
        ],
        time: 'O(n² log n)', space: 'O(n²)',
        why: 'Sorting n² values costs O(n² log n²) = O(n² log n), and the copy uses O(n²) memory, which the problem asks to avoid.',
        code: {
          java: r`class Solution {
    public int kthSmallest(int[][] matrix, int k) {
        int n = matrix.length, w = 0;
        int[] all = new int[n * n];
        for (int[] row : matrix) for (int v : row) all[w++] = v;
        Arrays.sort(all);
        return all[k - 1];
    }
}`,
          cpp: r`class Solution {
public:
    int kthSmallest(vector<vector<int>>& matrix, int k) {
        vector<int> all;
        for (auto& row : matrix) all.insert(all.end(), row.begin(), row.end());
        sort(all.begin(), all.end());
        return all[k - 1];
    }
};`,
          python: r`class Solution:
    def kthSmallest(self, matrix: List[List[int]], k: int) -> int:
        return sorted(v for row in matrix for v in row)[k - 1]`,
          javascript: r`var kthSmallest = function(matrix, k) {
    return matrix.flat().sort((a, b) => a - b)[k - 1];
};`,
        },
      },
      {
        level: 'Better', name: 'Min-heap merge of the rows',
        idea: 'Each row is a sorted list. Put the first element of each row in a min-heap; popping the smallest and pushing the next element of its row produces values in sorted order. The k-th pop is the answer.',
        steps: [
          'Push `(matrix[r][0], r, 0)` for each row (only the first `min(n, k)` rows can matter).',
          'Pop k − 1 times; after popping `(v, r, c)`, push `(matrix[r][c + 1], r, c + 1)` if it exists.',
          'The top of the heap is the k-th smallest.',
        ],
        time: 'O(k log n)', space: 'O(n)',
        why: 'k heap operations on a heap of at most n entries.',
        code: {
          java: r`class Solution {
    public int kthSmallest(int[][] matrix, int k) {
        int n = matrix.length;
        PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> Integer.compare(matrix[a[0]][a[1]], matrix[b[0]][b[1]]));
        for (int r = 0; r < Math.min(n, k); r++) heap.add(new int[] { r, 0 });
        for (int i = 0; i < k - 1; i++) {
            int[] cell = heap.poll();
            if (cell[1] + 1 < n) heap.add(new int[] { cell[0], cell[1] + 1 });
        }
        int[] top = heap.peek();
        return matrix[top[0]][top[1]];
    }
}`,
          cpp: r`class Solution {
public:
    int kthSmallest(vector<vector<int>>& matrix, int k) {
        int n = matrix.size();
        priority_queue<tuple<int, int, int>, vector<tuple<int, int, int>>, greater<>> heap;
        for (int r = 0; r < min(n, k); r++) heap.push({matrix[r][0], r, 0});
        for (int i = 0; i < k - 1; i++) {
            auto [v, r, c] = heap.top();
            heap.pop();
            if (c + 1 < n) heap.push({matrix[r][c + 1], r, c + 1});
        }
        return get<0>(heap.top());
    }
};`,
          python: r`class Solution:
    def kthSmallest(self, matrix: List[List[int]], k: int) -> int:
        n = len(matrix)
        heap = [(matrix[r][0], r, 0) for r in range(min(n, k))]
        heapify(heap)
        for _ in range(k - 1):
            _, r, c = heappop(heap)
            if c + 1 < n:
                heappush(heap, (matrix[r][c + 1], r, c + 1))
        return heap[0][0]`,
          javascript: r`var kthSmallest = function(matrix, k) {
    const n = matrix.length, heap = new PriorityQueue((a, b) => a[0] - b[0]);
    for (let r = 0; r < Math.min(n, k); r++) heap.enqueue([matrix[r][0], r, 0]);
    for (let i = 0; i < k - 1; i++) {
        const [, r, c] = heap.dequeue();
        if (c + 1 < n) heap.enqueue([matrix[r][c + 1], r, c + 1]);
    }
    return heap.front()[0];
};`,
        },
      },
      {
        level: 'Optimal', name: 'Binary search on the value, counting with a staircase',
        idea: 'For a value `x`, count how many cells are `<= x` by walking from the bottom-left corner (O(n), thanks to sorted rows and columns). The answer is the smallest `x` with count `>= k`.',
        steps: [
          'Search `x` in `[matrix[0][0], matrix[n − 1][n − 1]]` (use 64-bit arithmetic for the middle).',
          'Count cells `<= mid`: start at row n − 1, column 0; if the cell is `<= mid`, add `row + 1` and move right; otherwise move up.',
          'If the count is `>= k`, set `hi = mid`; else `lo = mid + 1`.',
          'Return `lo` — it is always a value in the matrix.',
        ],
        time: 'O(n log R)', space: 'O(1)',
        why: 'R = max − min ≤ 2·10⁹, so about 31 counting passes of O(n) each. The smallest x with count ≥ k must be present in the matrix, since the count only changes at matrix values.',
        code: {
          java: r`class Solution {
    public int kthSmallest(int[][] matrix, int k) {
        int n = matrix.length;
        long lo = matrix[0][0], hi = matrix[n - 1][n - 1];
        while (lo < hi) {
            long mid = lo + (hi - lo) / 2;
            int count = 0;
            for (int r = n - 1, c = 0; r >= 0 && c < n; ) {
                if (matrix[r][c] <= mid) { count += r + 1; c++; }
                else r--;
            }
            if (count >= k) hi = mid; else lo = mid + 1;
        }
        return (int) lo;
    }
}`,
          cpp: r`class Solution {
public:
    int kthSmallest(vector<vector<int>>& matrix, int k) {
        int n = matrix.size();
        long long lo = matrix[0][0], hi = matrix[n - 1][n - 1];
        while (lo < hi) {
            long long mid = lo + (hi - lo) / 2;
            int count = 0;
            for (int r = n - 1, c = 0; r >= 0 && c < n; ) {
                if (matrix[r][c] <= mid) { count += r + 1; c++; }
                else r--;
            }
            if (count >= k) hi = mid; else lo = mid + 1;
        }
        return (int) lo;
    }
};`,
          python: r`class Solution:
    def kthSmallest(self, matrix: List[List[int]], k: int) -> int:
        n = len(matrix)
        lo, hi = matrix[0][0], matrix[-1][-1]
        while lo < hi:
            mid = (lo + hi) // 2
            count, r, c = 0, n - 1, 0
            while r >= 0 and c < n:
                if matrix[r][c] <= mid:
                    count += r + 1
                    c += 1
                else:
                    r -= 1
            if count >= k:
                hi = mid
            else:
                lo = mid + 1
        return lo`,
          javascript: r`var kthSmallest = function(matrix, k) {
    const n = matrix.length;
    let lo = matrix[0][0], hi = matrix[n - 1][n - 1];
    while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        let count = 0;
        for (let r = n - 1, c = 0; r >= 0 && c < n; ) {
            if (matrix[r][c] <= mid) { count += r + 1; c++; }
            else r--;
        }
        if (count >= k) hi = mid; else lo = mid + 1;
    }
    return lo;
};`,
        },
      },
    ],
  },

  'merge-k-sorted-lists': {
    pattern: 'K-way merge with a min-heap of list heads (or divide and conquer pairwise merges)',
    approaches: [
      {
        level: 'Brute force', name: 'Collect all values, sort, rebuild',
        idea: 'Ignore the existing order: gather every value, sort, and build a new list.',
        steps: [
          'Walk every list and collect all N values.',
          'Sort them.',
          'Build a new linked list from the sorted values.',
        ],
        time: 'O(N log N)', space: 'O(N)',
        why: 'N is the total number of nodes. Sorting throws away the fact that each list is already sorted, and new nodes are created.',
        code: {
          java: r`class Solution {
    public ListNode mergeKLists(ListNode[] lists) {
        List<Integer> vals = new ArrayList<>();
        for (ListNode l : lists) for (ListNode p = l; p != null; p = p.next) vals.add(p.val);
        Collections.sort(vals);
        ListNode dummy = new ListNode(), tail = dummy;
        for (int v : vals) tail = tail.next = new ListNode(v);
        return dummy.next;
    }
}`,
          cpp: r`class Solution {
public:
    ListNode* mergeKLists(vector<ListNode*>& lists) {
        vector<int> vals;
        for (ListNode* l : lists) for (ListNode* p = l; p; p = p->next) vals.push_back(p->val);
        sort(vals.begin(), vals.end());
        ListNode dummy;
        ListNode* tail = &dummy;
        for (int v : vals) tail = tail->next = new ListNode(v);
        return dummy.next;
    }
};`,
          python: r`class Solution:
    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:
        vals = []
        for p in lists:
            while p:
                vals.append(p.val)
                p = p.next
        dummy = tail = ListNode()
        for v in sorted(vals):
            tail.next = ListNode(v)
            tail = tail.next
        return dummy.next`,
          javascript: r`var mergeKLists = function(lists) {
    const vals = [];
    for (const l of lists) for (let p = l; p; p = p.next) vals.push(p.val);
    vals.sort((a, b) => a - b);
    const dummy = new ListNode();
    let tail = dummy;
    for (const v of vals) tail = tail.next = new ListNode(v);
    return dummy.next;
};`,
        },
      },
      {
        level: 'Better', name: 'Merge the lists into the result one at a time',
        idea: 'Merge list 1 with list 2, then the result with list 3, and so on, using the two-list merge.',
        steps: [
          'Set `result = null`.',
          'For each list, `result = mergeTwo(result, list)` (the iterative dummy-node merge).',
          'Return `result`.',
        ],
        time: 'O(k·N)', space: 'O(1)',
        why: 'The growing result is walked again for every one of the k lists, so early nodes are touched up to k times.',
        code: {
          java: r`class Solution {
    public ListNode mergeKLists(ListNode[] lists) {
        ListNode result = null;
        for (ListNode l : lists) result = mergeTwo(result, l);
        return result;
    }

    private ListNode mergeTwo(ListNode a, ListNode b) {
        ListNode dummy = new ListNode(), tail = dummy;
        while (a != null && b != null) {
            if (a.val <= b.val) { tail.next = a; a = a.next; }
            else { tail.next = b; b = b.next; }
            tail = tail.next;
        }
        tail.next = a != null ? a : b;
        return dummy.next;
    }
}`,
          cpp: r`class Solution {
    ListNode* mergeTwo(ListNode* a, ListNode* b) {
        ListNode dummy;
        ListNode* tail = &dummy;
        while (a && b) {
            if (a->val <= b->val) { tail->next = a; a = a->next; }
            else { tail->next = b; b = b->next; }
            tail = tail->next;
        }
        tail->next = a ? a : b;
        return dummy.next;
    }
public:
    ListNode* mergeKLists(vector<ListNode*>& lists) {
        ListNode* result = nullptr;
        for (ListNode* l : lists) result = mergeTwo(result, l);
        return result;
    }
};`,
          python: r`class Solution:
    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:
        def merge_two(a, b):
            dummy = tail = ListNode()
            while a and b:
                if a.val <= b.val:
                    tail.next, a = a, a.next
                else:
                    tail.next, b = b, b.next
                tail = tail.next
            tail.next = a or b
            return dummy.next
        result = None
        for l in lists:
            result = merge_two(result, l)
        return result`,
          javascript: r`var mergeKLists = function(lists) {
    const mergeTwo = (a, b) => {
        const dummy = new ListNode();
        let tail = dummy;
        while (a && b) {
            if (a.val <= b.val) { tail.next = a; a = a.next; }
            else { tail.next = b; b = b.next; }
            tail = tail.next;
        }
        tail.next = a ?? b;
        return dummy.next;
    };
    let result = null;
    for (const l of lists) result = mergeTwo(result, l);
    return result;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Min-heap of the current heads',
        idea: 'The next node of the merged list is the smallest among the k current heads. A min-heap of the heads finds it in O(log k); after taking a node, push its successor.',
        steps: [
          'Push every non-empty head into a min-heap keyed by value.',
          'Pop the smallest node, append it to the result, and push its `next` if any.',
          'Repeat until the heap is empty; return `dummy.next`.',
        ],
        time: 'O(N log k)', space: 'O(k)',
        why: 'Each of the N nodes is pushed and popped once on a heap of at most k entries. Nodes are relinked, not copied.',
        code: {
          java: r`class Solution {
    public ListNode mergeKLists(ListNode[] lists) {
        PriorityQueue<ListNode> heap = new PriorityQueue<>((a, b) -> Integer.compare(a.val, b.val));
        for (ListNode l : lists) if (l != null) heap.add(l);
        ListNode dummy = new ListNode(), tail = dummy;
        while (!heap.isEmpty()) {
            ListNode node = heap.poll();
            tail = tail.next = node;
            if (node.next != null) heap.add(node.next);
        }
        return dummy.next;
    }
}`,
          cpp: r`class Solution {
public:
    ListNode* mergeKLists(vector<ListNode*>& lists) {
        auto cmp = [](ListNode* a, ListNode* b) { return a->val > b->val; };
        priority_queue<ListNode*, vector<ListNode*>, decltype(cmp)> heap(cmp);
        for (ListNode* l : lists) if (l) heap.push(l);
        ListNode dummy;
        ListNode* tail = &dummy;
        while (!heap.empty()) {
            ListNode* node = heap.top();
            heap.pop();
            tail = tail->next = node;
            if (node->next) heap.push(node->next);
        }
        return dummy.next;
    }
};`,
          python: r`class Solution:
    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:
        # the index breaks ties, so nodes themselves are never compared
        heap = [(l.val, i, l) for i, l in enumerate(lists) if l]
        heapify(heap)
        dummy = tail = ListNode()
        while heap:
            _, i, node = heappop(heap)
            tail.next = node
            tail = node
            if node.next:
                heappush(heap, (node.next.val, i, node.next))
        return dummy.next`,
          javascript: r`var mergeKLists = function(lists) {
    const heap = new PriorityQueue((a, b) => a.val - b.val);
    for (const l of lists) if (l) heap.enqueue(l);
    const dummy = new ListNode();
    let tail = dummy;
    while (heap.size()) {
        const node = heap.dequeue();
        tail = tail.next = node;
        if (node.next) heap.enqueue(node.next);
    }
    return dummy.next;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Divide and conquer: merge in pairs',
        idea: 'Merge the lists pairwise like merge sort: k lists become k/2, then k/4, … until one remains. Each round touches every node once, and there are log k rounds.',
        steps: [
          'While more than one list remains: merge lists `i` and `i + step` for every `i` in steps of `2·step`.',
          'Double `step` each round.',
          'Return `lists[0]` (or null if there were no lists).',
        ],
        time: 'O(N log k)', space: 'O(1)',
        why: 'log k rounds of merging that each pass over all N nodes; done iteratively, it needs no heap and no recursion.',
        code: {
          java: r`class Solution {
    public ListNode mergeKLists(ListNode[] lists) {
        if (lists.length == 0) return null;
        for (int step = 1; step < lists.length; step *= 2)
            for (int i = 0; i + step < lists.length; i += 2 * step)
                lists[i] = mergeTwo(lists[i], lists[i + step]);
        return lists[0];
    }

    private ListNode mergeTwo(ListNode a, ListNode b) {
        ListNode dummy = new ListNode(), tail = dummy;
        while (a != null && b != null) {
            if (a.val <= b.val) { tail.next = a; a = a.next; }
            else { tail.next = b; b = b.next; }
            tail = tail.next;
        }
        tail.next = a != null ? a : b;
        return dummy.next;
    }
}`,
          cpp: r`class Solution {
    ListNode* mergeTwo(ListNode* a, ListNode* b) {
        ListNode dummy;
        ListNode* tail = &dummy;
        while (a && b) {
            if (a->val <= b->val) { tail->next = a; a = a->next; }
            else { tail->next = b; b = b->next; }
            tail = tail->next;
        }
        tail->next = a ? a : b;
        return dummy.next;
    }
public:
    ListNode* mergeKLists(vector<ListNode*>& lists) {
        if (lists.empty()) return nullptr;
        for (size_t step = 1; step < lists.size(); step *= 2)
            for (size_t i = 0; i + step < lists.size(); i += 2 * step)
                lists[i] = mergeTwo(lists[i], lists[i + step]);
        return lists[0];
    }
};`,
          python: r`class Solution:
    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:
        def merge_two(a, b):
            dummy = tail = ListNode()
            while a and b:
                if a.val <= b.val:
                    tail.next, a = a, a.next
                else:
                    tail.next, b = b, b.next
                tail = tail.next
            tail.next = a or b
            return dummy.next
        if not lists:
            return None
        step = 1
        while step < len(lists):
            for i in range(0, len(lists) - step, 2 * step):
                lists[i] = merge_two(lists[i], lists[i + step])
            step *= 2
        return lists[0]`,
          javascript: r`var mergeKLists = function(lists) {
    const mergeTwo = (a, b) => {
        const dummy = new ListNode();
        let tail = dummy;
        while (a && b) {
            if (a.val <= b.val) { tail.next = a; a = a.next; }
            else { tail.next = b; b = b.next; }
            tail = tail.next;
        }
        tail.next = a ?? b;
        return dummy.next;
    };
    if (lists.length === 0) return null;
    for (let step = 1; step < lists.length; step *= 2)
        for (let i = 0; i + step < lists.length; i += 2 * step)
            lists[i] = mergeTwo(lists[i], lists[i + step]);
    return lists[0];
};`,
        },
      },
    ],
  },

  'find-median-from-data-stream': {
    pattern: 'Two heaps: a max-heap for the lower half and a min-heap for the upper half',
    approaches: [
      {
        level: 'Brute force', name: 'Keep a sorted list',
        idea: 'Insert each number into its sorted position; the median is read from the middle.',
        steps: [
          '`addNum`: binary search the position and insert there.',
          '`findMedian`: with `n` values, return the middle one, or the mean of the two middle ones if `n` is even.',
        ],
        time: 'O(n) per add', space: 'O(n)',
        why: 'Inserting into an array shifts up to n elements; `findMedian` is O(1). Over 10⁵ calls this is up to about 5 × 10⁹ moves.',
        code: {
          java: r`class MedianFinder {
    private final List<Integer> sorted = new ArrayList<>();

    public MedianFinder() {
    }

    public void addNum(int num) {
        int pos = Collections.binarySearch(sorted, num);
        sorted.add(pos >= 0 ? pos : -pos - 1, num);
    }

    public double findMedian() {
        int n = sorted.size();
        return n % 2 == 1 ? sorted.get(n / 2) : (sorted.get(n / 2 - 1) + sorted.get(n / 2)) / 2.0;
    }
}`,
          cpp: r`class MedianFinder {
    vector<int> sorted;
public:
    MedianFinder() {}

    void addNum(int num) {
        sorted.insert(lower_bound(sorted.begin(), sorted.end(), num), num);
    }

    double findMedian() {
        int n = sorted.size();
        return n % 2 ? sorted[n / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2.0;
    }
};`,
          python: r`class MedianFinder:

    def __init__(self):
        self.sorted = []

    def addNum(self, num: int) -> None:
        insort(self.sorted, num)

    def findMedian(self) -> float:
        a, n = self.sorted, len(self.sorted)
        return float(a[n // 2]) if n % 2 else (a[n // 2 - 1] + a[n // 2]) / 2`,
          javascript: r`var MedianFinder = function() {
    this.sorted = [];
};

MedianFinder.prototype.addNum = function(num) {
    const a = this.sorted;
    let lo = 0, hi = a.length;
    while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (a[mid] < num) lo = mid + 1; else hi = mid;
    }
    a.splice(lo, 0, num);
};

MedianFinder.prototype.findMedian = function() {
    const a = this.sorted, n = a.length;
    return n % 2 ? a[n >> 1] : (a[n / 2 - 1] + a[n / 2]) / 2;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Two balanced heaps',
        idea: 'Split the numbers into a lower half (max-heap `lo`) and an upper half (min-heap `hi`), with `lo` holding the same number of values or one more. The median is then at the heap tops.',
        steps: [
          '`addNum`: push into `lo`, then move `lo`\'s largest into `hi` (so every value in `lo` is ≤ every value in `hi`).',
          'If `hi` now has more values than `lo`, move `hi`\'s smallest back into `lo`.',
          '`findMedian`: if `lo` is larger, return its top; otherwise return the mean of both tops.',
        ],
        time: 'O(log n) per add', space: 'O(n)',
        why: 'Each add does a constant number of heap operations; `findMedian` is O(1). All values are stored once across the two heaps.',
        code: {
          java: r`class MedianFinder {
    private final PriorityQueue<Integer> lo = new PriorityQueue<>(Collections.reverseOrder());
    private final PriorityQueue<Integer> hi = new PriorityQueue<>();

    public MedianFinder() {
    }

    public void addNum(int num) {
        lo.add(num);
        hi.add(lo.poll());
        if (hi.size() > lo.size()) lo.add(hi.poll());
    }

    public double findMedian() {
        return lo.size() > hi.size() ? lo.peek() : (lo.peek() + hi.peek()) / 2.0;
    }
}`,
          cpp: r`class MedianFinder {
    priority_queue<int> lo;
    priority_queue<int, vector<int>, greater<int>> hi;
public:
    MedianFinder() {}

    void addNum(int num) {
        lo.push(num);
        hi.push(lo.top());
        lo.pop();
        if (hi.size() > lo.size()) { lo.push(hi.top()); hi.pop(); }
    }

    double findMedian() {
        return lo.size() > hi.size() ? lo.top() : (lo.top() + hi.top()) / 2.0;
    }
};`,
          python: r`class MedianFinder:

    def __init__(self):
        self.lo, self.hi = [], []  # lo stores negatives (a max-heap)

    def addNum(self, num: int) -> None:
        heappush(self.hi, -heappushpop(self.lo, -num))
        if len(self.hi) > len(self.lo):
            heappush(self.lo, -heappop(self.hi))

    def findMedian(self) -> float:
        if len(self.lo) > len(self.hi):
            return float(-self.lo[0])
        return (self.hi[0] - self.lo[0]) / 2`,
          javascript: r`var MedianFinder = function() {
    this.lo = new MaxPriorityQueue();
    this.hi = new MinPriorityQueue();
};

MedianFinder.prototype.addNum = function(num) {
    this.lo.enqueue(num);
    this.hi.enqueue(this.lo.dequeue());
    if (this.hi.size() > this.lo.size()) this.lo.enqueue(this.hi.dequeue());
};

MedianFinder.prototype.findMedian = function() {
    return this.lo.size() > this.hi.size() ? this.lo.front() : (this.lo.front() + this.hi.front()) / 2;
};`,
        },
      },
    ],
  },

  'ipo': {
    pattern: 'Two-stage greedy: sort by capital, max-heap of affordable profits',
    approaches: [
      {
        level: 'Brute force', name: 'Each round, scan for the best affordable project',
        idea: 'Greedy choice: with the current capital, the best next project is the most profitable one you can afford (profits are never negative, so capital only grows). Find it by scanning.',
        steps: [
          'Repeat up to `k` times: scan every unused project with `capital[i] <= w` and pick the one with the largest profit.',
          'If none is affordable, stop.',
          'Mark it used and add its profit to `w`. Return `w`.',
        ],
        time: 'O(k·n)', space: 'O(n)',
        why: 'k rounds, each scanning n projects; a "used" flag per project.',
        code: {
          java: r`class Solution {
    public int findMaximizedCapital(int k, int w, int[] profits, int[] capital) {
        int n = profits.length;
        boolean[] used = new boolean[n];
        long cap = w;
        for (int round = 0; round < k; round++) {
            int best = -1;
            for (int i = 0; i < n; i++)
                if (!used[i] && capital[i] <= cap && (best == -1 || profits[i] > profits[best])) best = i;
            if (best == -1) break;
            used[best] = true;
            cap += profits[best];
        }
        return (int) cap;
    }
}`,
          cpp: r`class Solution {
public:
    int findMaximizedCapital(int k, int w, vector<int>& profits, vector<int>& capital) {
        int n = profits.size();
        vector<bool> used(n, false);
        long long cap = w;
        for (int round = 0; round < k; round++) {
            int best = -1;
            for (int i = 0; i < n; i++)
                if (!used[i] && capital[i] <= cap && (best == -1 || profits[i] > profits[best])) best = i;
            if (best == -1) break;
            used[best] = true;
            cap += profits[best];
        }
        return (int) cap;
    }
};`,
          python: r`class Solution:
    def findMaximizedCapital(self, k: int, w: int, profits: List[int], capital: List[int]) -> int:
        used = [False] * len(profits)
        for _ in range(k):
            best = -1
            for i in range(len(profits)):
                if not used[i] and capital[i] <= w and (best == -1 or profits[i] > profits[best]):
                    best = i
            if best == -1:
                break
            used[best] = True
            w += profits[best]
        return w`,
          javascript: r`var findMaximizedCapital = function(k, w, profits, capital) {
    const n = profits.length, used = new Array(n).fill(false);
    for (let round = 0; round < k; round++) {
        let best = -1;
        for (let i = 0; i < n; i++)
            if (!used[i] && capital[i] <= w && (best === -1 || profits[i] > profits[best])) best = i;
        if (best === -1) break;
        used[best] = true;
        w += profits[best];
    }
    return w;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Sort by capital, push affordable profits into a max-heap',
        idea: 'Sort projects by required capital. As capital grows, unlock projects in that order and push their profits into a max-heap; each round take the heap\'s best. A project once affordable stays affordable, so nothing is pushed twice.',
        steps: [
          'Sort project indices by `capital`.',
          'Repeat up to `k` times: push the profit of every not-yet-unlocked project with `capital <= w`.',
          'If the heap is empty, stop; otherwise pop the largest profit and add it to `w`.',
          'Return `w`.',
        ],
        time: 'O((n + k) log n)', space: 'O(n)',
        why: 'Sorting is O(n log n); each project is pushed once and each of the k rounds pops once.',
        code: {
          java: r`class Solution {
    public int findMaximizedCapital(int k, int w, int[] profits, int[] capital) {
        int n = profits.length;
        Integer[] order = new Integer[n];
        for (int i = 0; i < n; i++) order[i] = i;
        Arrays.sort(order, (a, b) -> Integer.compare(capital[a], capital[b]));
        PriorityQueue<Integer> heap = new PriorityQueue<>(Collections.reverseOrder());
        long cap = w;
        int next = 0;
        for (int round = 0; round < k; round++) {
            while (next < n && capital[order[next]] <= cap) heap.add(profits[order[next++]]);
            if (heap.isEmpty()) break;
            cap += heap.poll();
        }
        return (int) cap;
    }
}`,
          cpp: r`class Solution {
public:
    int findMaximizedCapital(int k, int w, vector<int>& profits, vector<int>& capital) {
        int n = profits.size();
        vector<int> order(n);
        iota(order.begin(), order.end(), 0);
        sort(order.begin(), order.end(), [&](int a, int b) { return capital[a] < capital[b]; });
        priority_queue<int> heap;
        long long cap = w;
        int next = 0;
        for (int round = 0; round < k; round++) {
            while (next < n && capital[order[next]] <= cap) heap.push(profits[order[next++]]);
            if (heap.empty()) break;
            cap += heap.top();
            heap.pop();
        }
        return (int) cap;
    }
};`,
          python: r`class Solution:
    def findMaximizedCapital(self, k: int, w: int, profits: List[int], capital: List[int]) -> int:
        projects = sorted(zip(capital, profits))
        heap, nxt = [], 0
        for _ in range(k):
            while nxt < len(projects) and projects[nxt][0] <= w:
                heappush(heap, -projects[nxt][1])
                nxt += 1
            if not heap:
                break
            w -= heappop(heap)
        return w`,
          javascript: r`var findMaximizedCapital = function(k, w, profits, capital) {
    const n = profits.length;
    const order = profits.map((_, i) => i).sort((a, b) => capital[a] - capital[b]);
    const heap = new MaxPriorityQueue();
    let next = 0;
    for (let round = 0; round < k; round++) {
        while (next < n && capital[order[next]] <= w) heap.enqueue(profits[order[next++]]);
        if (heap.size() === 0) break;
        w += heap.dequeue();
    }
    return w;
};`,
        },
      },
    ],
  },
  'single-threaded-cpu': {
    pattern: 'Event simulation: sort by arrival, min-heap of available tasks',
    approaches: [
      {
        level: 'Brute force', name: 'Scan for the next task every time',
        idea: 'Simulate the CPU. Each time it becomes free, scan all unprocessed tasks for the available one with the shortest time (smallest index on ties); if none is available, jump to the earliest arrival.',
        steps: [
          'Keep `done[i]` flags and a 64-bit clock `time = 0`.',
          'Repeat n times: scan every unprocessed task; among those with `enqueue <= time` pick the best by (processing time, index). If there is none, set `time` to the smallest unprocessed enqueue time and scan again.',
          'Record the chosen task, mark it done and add its processing time to `time`.',
        ],
        time: 'O(n²)', space: 'O(n)',
        why: 'n picks, each scanning n tasks: 10¹⁰ steps for 10⁵ tasks, so it times out on the large test. It is a good way to make sure you understand the rules before optimising.',
        code: {
          java: r`class Solution {
    public int[] getOrder(int[][] tasks) {
        int n = tasks.length;
        boolean[] done = new boolean[n];
        int[] order = new int[n];
        long time = 0;
        for (int w = 0; w < n; w++) {
            int best = -1;
            long earliest = Long.MAX_VALUE;
            for (int i = 0; i < n; i++) {
                if (done[i]) continue;
                earliest = Math.min(earliest, tasks[i][0]);
                if (tasks[i][0] <= time && (best < 0 || tasks[i][1] < tasks[best][1])) best = i;
            }
            if (best < 0) {
                time = earliest;
                for (int i = 0; i < n; i++)
                    if (!done[i] && tasks[i][0] <= time && (best < 0 || tasks[i][1] < tasks[best][1])) best = i;
            }
            done[best] = true;
            order[w] = best;
            time += tasks[best][1];
        }
        return order;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> getOrder(vector<vector<int>>& tasks) {
        int n = tasks.size();
        vector<bool> done(n, false);
        vector<int> order;
        long long time = 0;
        for (int w = 0; w < n; w++) {
            int best = -1;
            long long earliest = LLONG_MAX;
            for (int i = 0; i < n; i++) {
                if (done[i]) continue;
                earliest = min(earliest, (long long) tasks[i][0]);
                if (tasks[i][0] <= time && (best < 0 || tasks[i][1] < tasks[best][1])) best = i;
            }
            if (best < 0) {
                time = earliest;
                for (int i = 0; i < n; i++)
                    if (!done[i] && tasks[i][0] <= time && (best < 0 || tasks[i][1] < tasks[best][1])) best = i;
            }
            done[best] = true;
            order.push_back(best);
            time += tasks[best][1];
        }
        return order;
    }
};`,
          python: r`class Solution:
    def getOrder(self, tasks: List[List[int]]) -> List[int]:
        n = len(tasks)
        done = [False] * n
        order, time = [], 0
        for _ in range(n):
            avail = [i for i in range(n) if not done[i] and tasks[i][0] <= time]
            if not avail:
                time = min(tasks[i][0] for i in range(n) if not done[i])
                avail = [i for i in range(n) if not done[i] and tasks[i][0] <= time]
            best = min(avail, key=lambda i: (tasks[i][1], i))
            done[best] = True
            order.append(best)
            time += tasks[best][1]
        return order`,
          javascript: r`var getOrder = function(tasks) {
    const n = tasks.length, done = new Array(n).fill(false), order = [];
    let time = 0;
    const pick = () => {
        let best = -1;
        for (let i = 0; i < n; i++)
            if (!done[i] && tasks[i][0] <= time && (best < 0 || tasks[i][1] < tasks[best][1])) best = i;
        return best;
    };
    for (let w = 0; w < n; w++) {
        let best = pick();
        if (best < 0) {
            time = Infinity;
            for (let i = 0; i < n; i++) if (!done[i]) time = Math.min(time, tasks[i][0]);
            best = pick();
        }
        done[best] = true;
        order.push(best);
        time += tasks[best][1];
    }
    return order;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Sorted arrivals + min-heap',
        idea: 'Sort task indices by enqueue time. Move every task that has arrived into a min-heap keyed by (processing time, index), and let the CPU always take the heap\'s top.',
        steps: [
          'Sort indices by enqueue time; keep a pointer `k` into that order and a 64-bit clock.',
          'Loop until all tasks are scheduled: if the heap is empty and the next task has not arrived, jump the clock to its enqueue time. Push every task with `enqueue <= time`.',
          'Pop the top task, append its index and add its processing time to the clock.',
        ],
        time: 'O(n log n)', space: 'O(n)',
        why: 'Sorting is O(n log n), and each task is pushed and popped once at O(log n). Jumping the clock over idle gaps avoids stepping through up to 10⁹ empty time units, and the 64-bit clock avoids overflow after many long tasks.',
        code: {
          java: r`class Solution {
    public int[] getOrder(int[][] tasks) {
        int n = tasks.length;
        Integer[] idx = new Integer[n];
        for (int i = 0; i < n; i++) idx[i] = i;
        Arrays.sort(idx, (a, b) -> Integer.compare(tasks[a][0], tasks[b][0]));
        PriorityQueue<Integer> ready = new PriorityQueue<>((a, b) -> tasks[a][1] != tasks[b][1] ? Integer.compare(tasks[a][1], tasks[b][1]) : Integer.compare(a, b));
        int[] order = new int[n];
        long time = 0;
        int k = 0, w = 0;
        while (w < n) {
            if (ready.isEmpty() && time < tasks[idx[k]][0]) time = tasks[idx[k]][0];
            while (k < n && tasks[idx[k]][0] <= time) ready.add(idx[k++]);
            int t = ready.poll();
            order[w++] = t;
            time += tasks[t][1];
        }
        return order;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> getOrder(vector<vector<int>>& tasks) {
        int n = tasks.size();
        vector<int> idx(n);
        iota(idx.begin(), idx.end(), 0);
        sort(idx.begin(), idx.end(), [&](int a, int b) { return tasks[a][0] < tasks[b][0]; });
        priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> ready;
        vector<int> order;
        long long time = 0;
        int k = 0;
        while ((int) order.size() < n) {
            if (ready.empty() && time < tasks[idx[k]][0]) time = tasks[idx[k]][0];
            while (k < n && tasks[idx[k]][0] <= time) { ready.push({tasks[idx[k]][1], idx[k]}); k++; }
            auto [p, t] = ready.top();
            ready.pop();
            order.push_back(t);
            time += p;
        }
        return order;
    }
};`,
          python: r`class Solution:
    def getOrder(self, tasks: List[List[int]]) -> List[int]:
        n = len(tasks)
        idx = sorted(range(n), key=lambda i: tasks[i][0])
        ready, order = [], []
        time, k = 0, 0
        while len(order) < n:
            if not ready and time < tasks[idx[k]][0]:
                time = tasks[idx[k]][0]
            while k < n and tasks[idx[k]][0] <= time:
                heappush(ready, (tasks[idx[k]][1], idx[k]))
                k += 1
            p, t = heappop(ready)
            order.append(t)
            time += p
        return order`,
          javascript: r`var getOrder = function(tasks) {
    const n = tasks.length;
    const idx = [...tasks.keys()].sort((a, b) => tasks[a][0] - tasks[b][0]);
    const ready = new PriorityQueue((a, b) => (tasks[a][1] - tasks[b][1]) || (a - b));
    const order = [];
    let time = 0, k = 0;
    while (order.length < n) {
        if (ready.isEmpty() && time < tasks[idx[k]][0]) time = tasks[idx[k]][0];
        while (k < n && tasks[idx[k]][0] <= time) ready.enqueue(idx[k++]);
        const t = ready.dequeue();
        order.push(t);
        time += tasks[t][1];
    }
    return order;
};`,
        },
      },
    ],
  },
  'reorganize-string': {
    pattern: 'Greedy by frequency (heap, or fill even positions first)',
    approaches: [
      {
        level: 'Better', name: 'Max-heap, holding back the last letter',
        idea: 'Always write the most frequent remaining letter, but keep the letter you just wrote out of the heap for one step so it cannot be chosen twice in a row.',
        steps: [
          'Count letters. If the top count exceeds `(n + 1) / 2`, return "".',
          'Put (count, letter) pairs in a max-heap and keep `held = none`.',
          'Repeat while the heap is not empty: pop the top, append its letter and decrement it; push `held` back if it still has copies; then hold the letter just written.',
        ],
        time: 'O(n log k)', space: 'O(k)',
        why: 'k ≤ 26 is the number of distinct letters, so heap operations are effectively constant. The held-back letter is never the next one written, so no two neighbours match, and the feasibility check guarantees the heap never runs dry while letters are still held.',
        code: {
          java: r`class Solution {
    public String reorganizeString(String s) {
        int[] cnt = new int[26];
        for (char c : s.toCharArray()) cnt[c - 'a']++;
        PriorityQueue<int[]> heap = new PriorityQueue<>((x, y) -> y[0] != x[0] ? y[0] - x[0] : x[1] - y[1]);
        for (int i = 0; i < 26; i++) {
            if (cnt[i] > (s.length() + 1) / 2) return "";
            if (cnt[i] > 0) heap.add(new int[] { cnt[i], i });
        }
        StringBuilder sb = new StringBuilder();
        int[] held = null;
        while (!heap.isEmpty()) {
            int[] cur = heap.poll();
            sb.append((char) ('a' + cur[1]));
            cur[0]--;
            if (held != null && held[0] > 0) heap.add(held);
            held = cur;
        }
        return sb.toString();
    }
}`,
          cpp: r`class Solution {
public:
    string reorganizeString(string s) {
        int cnt[26] = {0};
        for (char c : s) cnt[c - 'a']++;
        priority_queue<pair<int, int>> heap;
        for (int i = 0; i < 26; i++) {
            if (cnt[i] > ((int) s.size() + 1) / 2) return "";
            if (cnt[i] > 0) heap.push({cnt[i], -i});
        }
        string out;
        pair<int, int> held = {0, 0};
        while (!heap.empty()) {
            auto cur = heap.top(); heap.pop();
            out += (char) ('a' - cur.second);
            cur.first--;
            if (held.first > 0) heap.push(held);
            held = cur;
        }
        return out;
    }
};`,
          python: r`class Solution:
    def reorganizeString(self, s: str) -> str:
        cnt = Counter(s)
        if max(cnt.values()) > (len(s) + 1) // 2:
            return ""
        heap = [(-c, ch) for ch, c in cnt.items()]
        heapify(heap)
        out, held = [], None
        while heap:
            c, ch = heappop(heap)
            out.append(ch)
            if held and held[0] < 0:
                heappush(heap, held)
            held = (c + 1, ch)
        return "".join(out)`,
          javascript: r`var reorganizeString = function(s) {
    const cnt = new Array(26).fill(0);
    for (const c of s) cnt[c.charCodeAt(0) - 97]++;
    const heap = new PriorityQueue((x, y) => (y[0] - x[0]) || (x[1] - y[1]));
    for (let i = 0; i < 26; i++) {
        if (cnt[i] > Math.floor((s.length + 1) / 2)) return "";
        if (cnt[i] > 0) heap.enqueue([cnt[i], i]);
    }
    let out = "", held = null;
    while (!heap.isEmpty()) {
        const cur = heap.dequeue();
        out += String.fromCharCode(97 + cur[1]);
        cur[0]--;
        if (held && held[0] > 0) heap.enqueue(held);
        held = cur;
    }
    return out;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Most frequent letter on even indices',
        idea: 'Write the most frequent letter at positions 0, 2, 4, … first, then keep filling even positions and wrap around to odd ones with all the other letters.',
        steps: [
          'Count letters and find the most frequent one. If its count exceeds `(n + 1) / 2`, return "".',
          'Place it at indices 0, 2, 4, … .',
          'For every other letter, keep writing at the next even index; once past the end, continue from index 1 and step by 2.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'Equal letters are always written two positions apart. Only the wrap from the last even slot to index 1 could put a letter next to itself, and that cannot happen because no other letter has more than ⌈n / 2⌉ copies and the most frequent one already took the start. The 26 counts are constant space besides the output.',
        code: {
          java: r`class Solution {
    public String reorganizeString(String s) {
        int n = s.length();
        int[] cnt = new int[26];
        for (char c : s.toCharArray()) cnt[c - 'a']++;
        int top = 0;
        for (int i = 1; i < 26; i++) if (cnt[i] > cnt[top]) top = i;
        if (cnt[top] > (n + 1) / 2) return "";
        char[] out = new char[n];
        int pos = 0;
        while (cnt[top]-- > 0) { out[pos] = (char) ('a' + top); pos += 2; }
        for (int i = 0; i < 26; i++) {
            while (cnt[i] > 0) {
                if (pos >= n) pos = 1;
                out[pos] = (char) ('a' + i);
                pos += 2;
                cnt[i]--;
            }
        }
        return new String(out);
    }
}`,
          cpp: r`class Solution {
public:
    string reorganizeString(string s) {
        int n = s.size(), cnt[26] = {0};
        for (char c : s) cnt[c - 'a']++;
        int top = max_element(cnt, cnt + 26) - cnt;
        if (cnt[top] > (n + 1) / 2) return "";
        string out(n, ' ');
        int pos = 0;
        while (cnt[top]-- > 0) { out[pos] = 'a' + top; pos += 2; }
        for (int i = 0; i < 26; i++) {
            while (cnt[i] > 0) {
                if (pos >= n) pos = 1;
                out[pos] = 'a' + i;
                pos += 2;
                cnt[i]--;
            }
        }
        return out;
    }
};`,
          python: r`class Solution:
    def reorganizeString(self, s: str) -> str:
        n = len(s)
        cnt = Counter(s)
        top, c = cnt.most_common(1)[0]
        if c > (n + 1) // 2:
            return ""
        out = [''] * n
        pos = 0
        for _ in range(c):
            out[pos] = top
            pos += 2
        del cnt[top]
        for ch, k in cnt.items():
            for _ in range(k):
                if pos >= n:
                    pos = 1
                out[pos] = ch
                pos += 2
        return "".join(out)`,
          javascript: r`var reorganizeString = function(s) {
    const n = s.length, cnt = new Array(26).fill(0);
    for (const c of s) cnt[c.charCodeAt(0) - 97]++;
    let top = 0;
    for (let i = 1; i < 26; i++) if (cnt[i] > cnt[top]) top = i;
    if (cnt[top] > Math.floor((n + 1) / 2)) return "";
    const out = new Array(n);
    let pos = 0;
    while (cnt[top]-- > 0) { out[pos] = String.fromCharCode(97 + top); pos += 2; }
    for (let i = 0; i < 26; i++) {
        while (cnt[i] > 0) {
            if (pos >= n) pos = 1;
            out[pos] = String.fromCharCode(97 + i);
            pos += 2;
            cnt[i]--;
        }
    }
    return out.join("");
};`,
        },
      },
    ],
  },
  'longest-happy-string': {
    pattern: 'Greedy: always use the most plentiful letter you are allowed to',
    approaches: [
      {
        level: 'Better', name: 'Max-heap of counts',
        idea: 'Keep (count, letter) in a max-heap. Take the top letter unless the string already ends with two of it; then take the second one instead and put the first back.',
        steps: [
          'Push each letter with a positive count.',
          'Pop the top. If the last two characters are that letter, pop the next one (stop if there is none), use it, and push both back as needed.',
          'Otherwise use the top letter and push it back if it still has copies. Repeat until the heap is empty or stuck.',
        ],
        time: 'O(a + b + c)', space: 'O(1)',
        why: 'Each step writes one letter and does constant heap work on at most three entries. Always spending the largest pile first keeps the counts balanced, so letters run out together instead of one pile being stranded.',
        code: {
          java: r`class Solution {
    public String longestDiverseString(int a, int b, int c) {
        PriorityQueue<int[]> heap = new PriorityQueue<>((x, y) -> y[0] != x[0] ? y[0] - x[0] : x[1] - y[1]);
        if (a > 0) heap.add(new int[] { a, 0 });
        if (b > 0) heap.add(new int[] { b, 1 });
        if (c > 0) heap.add(new int[] { c, 2 });
        StringBuilder sb = new StringBuilder();
        while (!heap.isEmpty()) {
            int[] first = heap.poll();
            int len = sb.length();
            char ch = (char) ('a' + first[1]);
            if (len >= 2 && sb.charAt(len - 1) == ch && sb.charAt(len - 2) == ch) {
                if (heap.isEmpty()) break;
                int[] second = heap.poll();
                sb.append((char) ('a' + second[1]));
                if (--second[0] > 0) heap.add(second);
                heap.add(first);
            } else {
                sb.append(ch);
                if (--first[0] > 0) heap.add(first);
            }
        }
        return sb.toString();
    }
}`,
          cpp: r`class Solution {
public:
    string longestDiverseString(int a, int b, int c) {
        priority_queue<pair<int, int>> heap;
        if (a > 0) heap.push({a, 0});
        if (b > 0) heap.push({b, -1});
        if (c > 0) heap.push({c, -2});
        string s;
        while (!heap.empty()) {
            auto first = heap.top(); heap.pop();
            char ch = 'a' - first.second;
            int len = s.size();
            if (len >= 2 && s[len - 1] == ch && s[len - 2] == ch) {
                if (heap.empty()) break;
                auto second = heap.top(); heap.pop();
                s += (char) ('a' - second.second);
                if (--second.first > 0) heap.push(second);
                heap.push(first);
            } else {
                s += ch;
                if (--first.first > 0) heap.push(first);
            }
        }
        return s;
    }
};`,
          python: r`class Solution:
    def longestDiverseString(self, a: int, b: int, c: int) -> str:
        heap = [(-cnt, ch) for cnt, ch in ((a, 'a'), (b, 'b'), (c, 'c')) if cnt > 0]
        heapify(heap)
        out = []
        while heap:
            c1, ch1 = heappop(heap)
            if len(out) >= 2 and out[-1] == out[-2] == ch1:
                if not heap:
                    break
                c2, ch2 = heappop(heap)
                out.append(ch2)
                if c2 + 1 < 0:
                    heappush(heap, (c2 + 1, ch2))
                heappush(heap, (c1, ch1))
            else:
                out.append(ch1)
                if c1 + 1 < 0:
                    heappush(heap, (c1 + 1, ch1))
        return "".join(out)`,
          javascript: r`var longestDiverseString = function(a, b, c) {
    const heap = new PriorityQueue((x, y) => (y[0] - x[0]) || x[1].localeCompare(y[1]));
    if (a > 0) heap.enqueue([a, "a"]);
    if (b > 0) heap.enqueue([b, "b"]);
    if (c > 0) heap.enqueue([c, "c"]);
    let s = "";
    while (!heap.isEmpty()) {
        const first = heap.dequeue();
        const n = s.length;
        if (n >= 2 && s[n - 1] === first[1] && s[n - 2] === first[1]) {
            if (heap.isEmpty()) break;
            const second = heap.dequeue();
            s += second[1];
            if (--second[0] > 0) heap.enqueue(second);
            heap.enqueue(first);
        } else {
            s += first[1];
            if (--first[0] > 0) heap.enqueue(first);
        }
    }
    return s;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Sort three counts each step',
        idea: 'With only three letters, a heap is overkill: each step, order the letters by remaining count and take the first one that would not make three in a row.',
        steps: [
          'Repeat: order letters by count, largest first (ties by letter).',
          'Take the first letter with a positive count that is not already the last two characters; append it and decrement its count.',
          'If no letter qualifies, stop and return the string.',
        ],
        time: 'O(a + b + c)', space: 'O(1)',
        why: 'Sorting three numbers is constant work, so the total is linear in the output length. The greedy is optimal because writing the most plentiful letter whenever possible delays the moment a single pile is left over, which is the only thing that can stop the string early.',
        code: {
          java: r`class Solution {
    public String longestDiverseString(int a, int b, int c) {
        int[] cnt = { a, b, c };
        StringBuilder sb = new StringBuilder();
        while (true) {
            Integer[] order = { 0, 1, 2 };
            Arrays.sort(order, (x, y) -> cnt[x] != cnt[y] ? cnt[y] - cnt[x] : x - y);
            boolean placed = false;
            for (int k : order) {
                if (cnt[k] == 0) break;
                int len = sb.length();
                char ch = (char) ('a' + k);
                if (len >= 2 && sb.charAt(len - 1) == ch && sb.charAt(len - 2) == ch) continue;
                sb.append(ch);
                cnt[k]--;
                placed = true;
                break;
            }
            if (!placed) return sb.toString();
        }
    }
}`,
          cpp: r`class Solution {
public:
    string longestDiverseString(int a, int b, int c) {
        int cnt[3] = {a, b, c};
        string s;
        while (true) {
            int order[3] = {0, 1, 2};
            sort(order, order + 3, [&](int x, int y) { return cnt[x] != cnt[y] ? cnt[x] > cnt[y] : x < y; });
            bool placed = false;
            for (int k : order) {
                if (cnt[k] == 0) break;
                char ch = 'a' + k;
                int n = s.size();
                if (n >= 2 && s[n - 1] == ch && s[n - 2] == ch) continue;
                s += ch;
                cnt[k]--;
                placed = true;
                break;
            }
            if (!placed) return s;
        }
    }
};`,
          python: r`class Solution:
    def longestDiverseString(self, a: int, b: int, c: int) -> str:
        cnt = {'a': a, 'b': b, 'c': c}
        out = []
        while True:
            for ch in sorted(cnt, key=lambda x: (-cnt[x], x)):
                if cnt[ch] == 0:
                    return "".join(out)
                if len(out) >= 2 and out[-1] == out[-2] == ch:
                    continue
                out.append(ch)
                cnt[ch] -= 1
                break
            else:
                return "".join(out)`,
          javascript: r`var longestDiverseString = function(a, b, c) {
    const cnt = [a, b, c];
    let s = "";
    while (true) {
        const order = [0, 1, 2].sort((x, y) => (cnt[y] - cnt[x]) || (x - y));
        let placed = false;
        for (const k of order) {
            if (cnt[k] === 0) break;
            const ch = String.fromCharCode(97 + k), n = s.length;
            if (n >= 2 && s[n - 1] === ch && s[n - 2] === ch) continue;
            s += ch;
            cnt[k]--;
            placed = true;
            break;
        }
        if (!placed) return s;
    }
};`,
        },
      },
    ],
  },
};
