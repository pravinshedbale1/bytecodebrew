export default [
  {
    slug: 'last-stone-weight', title: 'Last Stone Weight', level: 'Easy',
    summary: 'Repeatedly smash the two heaviest stones: equal ones both vanish, otherwise the lighter vanishes and the heavier loses that weight. Return the last stone\'s weight, or 0.',
    method: 'lastStoneWeight', params: [['int[]', 'stones']], returns: 'int',
    tests: [
      { in: [[2, 7, 4, 1, 8, 1]], out: 1 },
      { in: [[1]], out: 1 },
      { in: [[3, 3]] },
      { in: [[10, 4, 2, 10]] },
      { in: [[9, 3, 2, 10]] },
    ],
    ref: `class Solution {
    public int lastStoneWeight(int[] stones) {
        PriorityQueue<Integer> pq = new PriorityQueue<>(Comparator.reverseOrder());
        for (int s : stones) pq.add(s);
        while (pq.size() > 1) { int a = pq.poll(), b = pq.poll(); if (a != b) pq.add(a - b); }
        return pq.isEmpty() ? 0 : pq.peek();
    }
}`,
  },
  {
    slug: 'kth-largest-element-in-a-stream', title: 'Kth Largest Element in a Stream', level: 'Easy',
    summary: 'KthLargest(k, nums) starts with some values; each add(val) adds a value to the stream and returns the k-th largest so far.',
    design: { cls: 'KthLargest', ctor: [['int', 'k'], ['int[]', 'nums']], methods: [['int', 'add', [['int', 'val']]]] },
    tests: [
      { in: [['KthLargest', 'add', 'add', 'add', 'add', 'add'], [[3, [4, 5, 8, 2]], [3], [5], [10], [9], [4]]], out: [null, 4, 5, 5, 8, 8] },
      { in: [['KthLargest', 'add', 'add', 'add'], [[1, []], [-3], [-2], [-4]]] },
      { in: [['KthLargest', 'add', 'add'], [[2, [0]], [-1], [1]]] },
    ],
    ref: `class KthLargest {
    private final PriorityQueue<Integer> pq = new PriorityQueue<>();
    private final int k;
    public KthLargest(int k, int[] nums) { this.k = k; for (int x : nums) add(x); }
    public int add(int val) { pq.add(val); if (pq.size() > k) pq.poll(); return pq.peek(); }
}`,
  },
  {
    slug: 'kth-largest-element-in-an-array', title: 'Kth Largest Element in an Array', level: 'Medium',
    summary: 'Return the k-th largest element (in sorted order, so duplicates count) — try to beat a full sort.',
    method: 'findKthLargest', params: [['int[]', 'nums'], ['int', 'k']], returns: 'int',
    tests: [
      { in: [[3, 2, 1, 5, 6, 4], 2], out: 5 },
      { in: [[3, 2, 3, 1, 2, 4, 5, 5, 6], 4], out: 4 },
      { in: [[1], 1] },
      { in: [[2, 2, 2], 3] },
      { in: [[-1, -5, 7, 0], 4] },
    ],
    ref: `class Solution {
    public int findKthLargest(int[] nums, int k) {
        PriorityQueue<Integer> pq = new PriorityQueue<>();
        for (int x : nums) { pq.add(x); if (pq.size() > k) pq.poll(); }
        return pq.peek();
    }
}`,
  },
  {
    slug: 'top-k-frequent-elements', title: 'Top K Frequent Elements', level: 'Medium',
    summary: 'Return the k most frequent values (the answer is unique), in any order — better than O(n log n) if you can.',
    method: 'topKFrequent', params: [['int[]', 'nums'], ['int', 'k']], returns: 'int[]', check: 'any-order',
    tests: [
      { in: [[1, 1, 1, 2, 2, 3], 2], out: [1, 2] },
      { in: [[1], 1], out: [1] },
      { in: [[4, 4, -1, -1, -1, 2], 2] },
      { in: [[5, 5, 6, 6, 6, 7, 7, 7, 7], 3] },
    ],
    ref: `class Solution {
    public int[] topKFrequent(int[] nums, int k) {
        Map<Integer, Integer> f = new HashMap<>();
        for (int x : nums) f.merge(x, 1, Integer::sum);
        List<Integer>[] buckets = new List[nums.length + 1];
        for (var e : f.entrySet()) { if (buckets[e.getValue()] == null) buckets[e.getValue()] = new ArrayList<>(); buckets[e.getValue()].add(e.getKey()); }
        int[] out = new int[k];
        int w = 0;
        for (int c = nums.length; c > 0 && w < k; c--) if (buckets[c] != null) for (int x : buckets[c]) if (w < k) out[w++] = x;
        return out;
    }
}`,
  },
  {
    slug: 'k-closest-points-to-origin', title: 'K Closest Points to Origin', level: 'Medium',
    summary: 'Return the k points closest to (0, 0) by Euclidean distance, in any order.',
    method: 'kClosest', params: [['int[][]', 'points'], ['int', 'k']], returns: 'int[][]', check: 'any-order',
    tests: [
      { in: [[[1, 3], [-2, 2]], 1], out: [[-2, 2]] },
      { in: [[[3, 3], [5, -1], [-2, 4]], 2], out: [[3, 3], [-2, 4]] },
      { in: [[[0, 1], [1, 0]], 2] },
      { in: [[[1, 1], [2, 2], [3, 3], [-1, -1]], 2] }, // two points tie at distance √2; k = 2 keeps the answer unique
    ],
    ref: `class Solution {
    public int[][] kClosest(int[][] points, int k) {
        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> Integer.compare(b[0] * b[0] + b[1] * b[1], a[0] * a[0] + a[1] * a[1]));
        for (int[] p : points) { pq.add(p); if (pq.size() > k) pq.poll(); }
        return pq.toArray(new int[0][]);
    }
}`,
  },
  {
    slug: 'task-scheduler', title: 'Task Scheduler', level: 'Medium',
    summary: 'Each task (a letter) takes one interval, and two runs of the same task must be at least n intervals apart (idle is allowed). Return the fewest intervals to finish all tasks.',
    method: 'leastInterval', params: [['char[]', 'tasks'], ['int', 'n']], returns: 'int',
    tests: [
      { in: [['A', 'A', 'A', 'B', 'B', 'B'], 2], out: 8 },
      { in: [['A', 'C', 'A', 'B', 'D', 'B'], 1], out: 6 },
      { in: [['A', 'A', 'A', 'B', 'B', 'B'], 3], out: 10 },
      { in: [['A'], 5] },
      { in: [['A', 'A', 'A', 'A', 'A', 'A', 'B', 'C', 'D', 'E', 'F', 'G'], 2] },
    ],
    ref: `class Solution {
    public int leastInterval(char[] tasks, int n) {
        int[] f = new int[26];
        for (char t : tasks) f[t - 'A']++;
        int max = 0, countMax = 0;
        for (int x : f) { if (x > max) { max = x; countMax = 1; } else if (x == max) countMax++; }
        return Math.max(tasks.length, (max - 1) * (n + 1) + countMax);
    }
}`,
  },
  {
    slug: 'kth-smallest-element-in-a-sorted-matrix', title: 'Kth Smallest Element in a Sorted Matrix', level: 'Medium',
    summary: 'Rows and columns of an n×n matrix are sorted ascending. Return the k-th smallest value overall (duplicates count).',
    method: 'kthSmallest', params: [['int[][]', 'matrix'], ['int', 'k']], returns: 'int',
    tests: [
      { in: [[[1, 5, 9], [10, 11, 13], [12, 13, 15]], 8], out: 13 },
      { in: [[[-5]], 1], out: -5 },
      { in: [[[1, 2], [1, 3]], 2] },
      { in: [[[1, 3, 5], [6, 7, 12], [11, 14, 14]], 6] },
    ],
    ref: `class Solution {
    public int kthSmallest(int[][] matrix, int k) {
        int n = matrix.length, lo = matrix[0][0], hi = matrix[n - 1][n - 1];
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2, count = 0, j = n - 1;
            for (int i = 0; i < n; i++) { while (j >= 0 && matrix[i][j] > mid) j--; count += j + 1; }
            if (count >= k) hi = mid; else lo = mid + 1;
        }
        return lo;
    }
}`,
  },
  {
    slug: 'merge-k-sorted-lists', title: 'Merge k Sorted Lists', level: 'Hard',
    summary: 'Merge k sorted linked lists into one sorted list and return it.',
    method: 'mergeKLists', params: [['ListNode[]', 'lists']], returns: 'ListNode',
    tests: [
      { in: [[[1, 4, 5], [1, 3, 4], [2, 6]]], out: [1, 1, 2, 3, 4, 4, 5, 6] },
      { in: [[]], out: [] },
      { in: [[[]]], out: [] },
      { in: [[[], [1], []]] },
      { in: [[[-2, 0, 9], [-3, 8], [5]]] },
    ],
    ref: `class Solution {
    public ListNode mergeKLists(ListNode[] lists) {
        PriorityQueue<ListNode> pq = new PriorityQueue<>((a, b) -> Integer.compare(a.val, b.val));
        for (ListNode l : lists) if (l != null) pq.add(l);
        ListNode dummy = new ListNode(), t = dummy;
        while (!pq.isEmpty()) { ListNode n = pq.poll(); t.next = n; t = n; if (n.next != null) pq.add(n.next); }
        return dummy.next;
    }
}`,
  },
  {
    slug: 'find-median-from-data-stream', title: 'Find Median from Data Stream', level: 'Hard',
    summary: 'MedianFinder supports addNum(num) and findMedian(), the median of all numbers added so far (the mean of the two middle values when the count is even).',
    design: { cls: 'MedianFinder', ctor: [], methods: [['void', 'addNum', [['int', 'num']]], ['double', 'findMedian', []]] },
    tests: [
      { in: [['MedianFinder', 'addNum', 'addNum', 'findMedian', 'addNum', 'findMedian'], [[], [1], [2], [], [3], []]], out: [null, null, null, 1.5, null, 2.0] },
      { in: [['MedianFinder', 'addNum', 'findMedian', 'addNum', 'findMedian', 'addNum', 'findMedian'], [[], [-1], [], [-2], [], [-3], []]] },
      { in: [['MedianFinder', 'addNum', 'addNum', 'addNum', 'addNum', 'findMedian'], [[], [5], [15], [1], [3], []]] },
    ],
    ref: `class MedianFinder {
    private final PriorityQueue<Integer> low = new PriorityQueue<>(Comparator.reverseOrder()), high = new PriorityQueue<>();
    public MedianFinder() {}
    public void addNum(int num) {
        low.add(num); high.add(low.poll());
        if (high.size() > low.size()) low.add(high.poll());
    }
    public double findMedian() { return low.size() > high.size() ? low.peek() : (low.peek() + (double) high.peek()) / 2; }
}`,
  },
  {
    slug: 'ipo', title: 'IPO', level: 'Hard',
    summary: 'You start with capital w and may finish at most k projects; project i needs capital[i] to start and adds profits[i]. Return the largest final capital.',
    method: 'findMaximizedCapital', params: [['int', 'k'], ['int', 'w'], ['int[]', 'profits'], ['int[]', 'capital']], returns: 'int',
    tests: [
      { in: [2, 0, [1, 2, 3], [0, 1, 1]], out: 4 },
      { in: [3, 0, [1, 2, 3], [0, 1, 2]], out: 6 },
      { in: [1, 0, [1, 2, 3], [1, 1, 2]] },
      { in: [10, 5, [1, 2], [0, 0]] },
    ],
    ref: `class Solution {
    public int findMaximizedCapital(int k, int w, int[] profits, int[] capital) {
        int n = profits.length;
        Integer[] order = new Integer[n];
        for (int i = 0; i < n; i++) order[i] = i;
        Arrays.sort(order, (a, b) -> Integer.compare(capital[a], capital[b]));
        PriorityQueue<Integer> best = new PriorityQueue<>(Comparator.reverseOrder());
        int i = 0;
        while (k-- > 0) {
            while (i < n && capital[order[i]] <= w) best.add(profits[order[i++]]);
            if (best.isEmpty()) break;
            w += best.poll();
        }
        return w;
    }
}`,
  },
  {
    slug: 'single-threaded-cpu', title: 'Single-Threaded CPU', level: 'Medium',
    summary: 'tasks[i] = [enqueueTime, processingTime]. A single CPU, whenever idle, starts the available task with the shortest processing time (smallest index on ties) and runs it to completion. Return the order in which tasks are processed.',
    method: 'getOrder', params: [['int[][]', 'tasks']], returns: 'int[]',
    tests: [
      { in: [[[1, 2], [2, 4], [3, 2], [4, 1]]], out: [0, 2, 3, 1] },
      { in: [[[7, 10], [7, 12], [7, 5], [7, 4], [7, 2]]], out: [4, 3, 2, 0, 1] },
      { in: [[[5, 3]]] },
      { in: [[[1, 1], [100, 1], [50, 1]]] },
      { in: [[[1, 5], [1, 5], [1, 5]]] },
      { in: [[[19, 13], [16, 9], [21, 10], [32, 25], [37, 4], [49, 24], [2, 15], [38, 41], [37, 34], [33, 6], [45, 4], [18, 18], [46, 39], [12, 24]]] },
      { in: [[[1000000000, 1000000000], [1000000000, 999999999], [1, 1000000000]]] },
    ],
    ref: `class Solution {
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
  },
  {
    slug: 'reorganize-string', title: 'Reorganize String', level: 'Medium',
    summary: 'Rearrange the letters of s so that no two adjacent letters are equal, and return any such arrangement, or "" if none exists.',
    method: 'reorganizeString', params: [['String', 's']], returns: 'String', check: 'custom:reorganize',
    tests: [
      { in: ['aab'], out: 'aba' },
      { in: ['aaab'], out: '' },
      { in: ['a'] },
      { in: ['aa'] },
      { in: ['vvvlo'] },
      { in: ['abbabbaaab'] },
      { in: ['zhmyo'] },
      { in: ['aaabbbccc'] },
      { in: ['zzzaa'] },
    ],
    ref: `class Solution {
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
  },
  {
    slug: 'longest-happy-string', title: 'Longest Happy String', level: 'Medium',
    summary: 'Build the longest string using at most a letters "a", b letters "b" and c letters "c" that never contains "aaa", "bbb" or "ccc". Return any longest one ("" if none).',
    method: 'longestDiverseString', params: [['int', 'a'], ['int', 'b'], ['int', 'c']], returns: 'String', check: 'custom:happyString',
    tests: [
      { in: [1, 1, 7], out: 'ccaccbcc' },
      { in: [7, 1, 0], out: 'aabaa' },
      { in: [0, 0, 1] },
      { in: [2, 2, 1] },
      { in: [0, 8, 11] },
      { in: [100, 100, 100] },
      { in: [1, 0, 0] },
      { in: [4, 42, 7] },
    ],
    ref: `class Solution {
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
  },
];
