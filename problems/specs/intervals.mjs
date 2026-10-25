export default [
  {
    slug: 'merge-intervals', title: 'Merge Intervals', level: 'Medium',
    summary: 'Merge all overlapping intervals (touching ones count as overlapping) and return the merged list sorted by start.',
    method: 'merge', params: [['int[][]', 'intervals']], returns: 'int[][]', check: 'any-order',
    tests: [
      { in: [[[1, 3], [2, 6], [8, 10], [15, 18]]], out: [[1, 6], [8, 10], [15, 18]] },
      { in: [[[1, 4], [4, 5]]], out: [[1, 5]] },
      { in: [[[4, 7], [1, 4]]], out: [[1, 7]] },
      { in: [[[1, 4], [2, 3]]] },
      { in: [[[5, 5]]] },
      { in: [[[2, 3], [4, 5], [6, 7], [8, 9], [1, 10]]] },
    ],
    ref: `class Solution {
    public int[][] merge(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
        List<int[]> out = new ArrayList<>();
        for (int[] iv : intervals) {
            if (!out.isEmpty() && out.get(out.size() - 1)[1] >= iv[0]) out.get(out.size() - 1)[1] = Math.max(out.get(out.size() - 1)[1], iv[1]);
            else out.add(iv.clone());
        }
        return out.toArray(new int[0][]);
    }
}`,
  },
  {
    slug: 'insert-interval', title: 'Insert Interval', level: 'Medium',
    summary: 'Insert newInterval into a sorted list of non-overlapping intervals, merging where needed, and return the result still sorted and non-overlapping.',
    method: 'insert', params: [['int[][]', 'intervals'], ['int[]', 'newInterval']], returns: 'int[][]',
    tests: [
      { in: [[[1, 3], [6, 9]], [2, 5]], out: [[1, 5], [6, 9]] },
      { in: [[[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]], [4, 8]], out: [[1, 2], [3, 10], [12, 16]] },
      { in: [[], [5, 7]], out: [[5, 7]] },
      { in: [[[1, 5]], [6, 8]] },
      { in: [[[3, 5]], [1, 2]] },
      { in: [[[1, 5]], [0, 9]] },
    ],
    ref: `class Solution {
    public int[][] insert(int[][] intervals, int[] newInterval) {
        List<int[]> out = new ArrayList<>();
        int i = 0, n = intervals.length;
        int[] cur = newInterval.clone();
        while (i < n && intervals[i][1] < cur[0]) out.add(intervals[i++]);
        while (i < n && intervals[i][0] <= cur[1]) { cur[0] = Math.min(cur[0], intervals[i][0]); cur[1] = Math.max(cur[1], intervals[i][1]); i++; }
        out.add(cur);
        while (i < n) out.add(intervals[i++]);
        return out.toArray(new int[0][]);
    }
}`,
  },
  {
    slug: 'non-overlapping-intervals', title: 'Non-overlapping Intervals', level: 'Medium',
    summary: 'Return the fewest intervals to remove so the rest do not overlap. Intervals that only touch at an end do not overlap.',
    method: 'eraseOverlapIntervals', params: [['int[][]', 'intervals']], returns: 'int',
    tests: [
      { in: [[[1, 2], [2, 3], [3, 4], [1, 3]]], out: 1 },
      { in: [[[1, 2], [1, 2], [1, 2]]], out: 2 },
      { in: [[[1, 2], [2, 3]]], out: 0 },
      { in: [[[1, 100], [11, 22], [1, 11], [2, 12]]] },
      { in: [[[0, 2], [1, 3], [2, 4], [3, 5], [4, 6]]] },
    ],
    ref: `class Solution {
    public int eraseOverlapIntervals(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[1], b[1]));
        int kept = 0, end = Integer.MIN_VALUE;
        for (int[] iv : intervals) if (iv[0] >= end) { kept++; end = iv[1]; }
        return intervals.length - kept;
    }
}`,
  },
  {
    slug: 'minimum-number-of-arrows-to-burst-balloons', title: 'Minimum Number of Arrows to Burst Balloons', level: 'Medium',
    summary: 'Each balloon spans [start, end] on the x-axis. A vertical arrow at x bursts every balloon with start ≤ x ≤ end. Return the fewest arrows to burst them all. Values can be as large as ±2^31.',
    method: 'findMinArrowShots', params: [['int[][]', 'points']], returns: 'int',
    tests: [
      { in: [[[10, 16], [2, 8], [1, 6], [7, 12]]], out: 2 },
      { in: [[[1, 2], [3, 4], [5, 6], [7, 8]]], out: 4 },
      { in: [[[1, 2], [2, 3], [3, 4], [4, 5]]], out: 2 },
      { in: [[[-2147483648, 2147483647]]] },
      { in: [[[-2147483646, -2147483645], [2147483646, 2147483647]]] },
    ],
    ref: `class Solution {
    public int findMinArrowShots(int[][] points) {
        Arrays.sort(points, (a, b) -> Integer.compare(a[1], b[1]));
        int arrows = 0;
        long at = Long.MIN_VALUE;
        for (int[] p : points) if (p[0] > at) { arrows++; at = p[1]; }
        return arrows;
    }
}`,
  },
  {
    slug: 'interval-list-intersections', title: 'Interval List Intersections', level: 'Medium',
    summary: 'Two lists of closed intervals are each sorted and pairwise disjoint. Return every intersection between them, in order.',
    method: 'intervalIntersection', params: [['int[][]', 'firstList'], ['int[][]', 'secondList']], returns: 'int[][]',
    tests: [
      { in: [[[0, 2], [5, 10], [13, 23], [24, 25]], [[1, 5], [8, 12], [15, 24], [25, 26]]], out: [[1, 2], [5, 5], [8, 10], [15, 23], [24, 24], [25, 25]] },
      { in: [[[1, 3], [5, 9]], []], out: [] },
      { in: [[[1, 7]], [[3, 10]]] },
      { in: [[[3, 5], [9, 20]], [[4, 5], [7, 10], [11, 12], [14, 15], [16, 20]]] },
    ],
    ref: `class Solution {
    public int[][] intervalIntersection(int[][] firstList, int[][] secondList) {
        List<int[]> out = new ArrayList<>();
        int i = 0, j = 0;
        while (i < firstList.length && j < secondList.length) {
            int lo = Math.max(firstList[i][0], secondList[j][0]), hi = Math.min(firstList[i][1], secondList[j][1]);
            if (lo <= hi) out.add(new int[] { lo, hi });
            if (firstList[i][1] < secondList[j][1]) i++; else j++;
        }
        return out.toArray(new int[0][]);
    }
}`,
  },
  {
    slug: 'remove-covered-intervals', title: 'Remove Covered Intervals', level: 'Medium',
    summary: 'Remove every interval [a, b) covered by another [c, d) (c ≤ a and b ≤ d). Return how many remain.',
    method: 'removeCoveredIntervals', params: [['int[][]', 'intervals']], returns: 'int',
    tests: [
      { in: [[[1, 4], [3, 6], [2, 8]]], out: 2 },
      { in: [[[1, 4], [2, 3]]], out: 1 },
      { in: [[[1, 2]]] },
      { in: [[[1, 2], [1, 4], [3, 4]]] },
      { in: [[[3, 10], [4, 10], [5, 11]]] },
    ],
    ref: `class Solution {
    public int removeCoveredIntervals(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> a[0] != b[0] ? Integer.compare(a[0], b[0]) : Integer.compare(b[1], a[1]));
        int count = 0, end = 0;
        for (int[] iv : intervals) if (iv[1] > end) { count++; end = iv[1]; }
        return count;
    }
}`,
  },
  {
    slug: 'minimum-interval-to-include-each-query', title: 'Minimum Interval to Include Each Query', level: 'Hard',
    summary: 'For each query q, return the size (right − left + 1) of the smallest interval with left ≤ q ≤ right, or -1 if none contains it.',
    method: 'minInterval', params: [['int[][]', 'intervals'], ['int[]', 'queries']], returns: 'int[]',
    tests: [
      { in: [[[1, 4], [2, 4], [3, 6], [4, 4]], [2, 3, 4, 5]], out: [3, 3, 1, 4] },
      { in: [[[2, 3], [2, 5], [1, 8], [20, 25]], [2, 19, 5, 22]], out: [2, -1, 4, 6] },
      { in: [[[5, 5]], [4, 5, 6]] },
      { in: [[[1, 10], [3, 3]], [3, 10, 1]] },
    ],
    ref: `class Solution {
    public int[] minInterval(int[][] intervals, int[] queries) {
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
        Integer[] order = new Integer[queries.length];
        for (int i = 0; i < order.length; i++) order[i] = i;
        Arrays.sort(order, (a, b) -> Integer.compare(queries[a], queries[b]));
        PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));
        int[] out = new int[queries.length];
        int i = 0;
        for (int qi : order) {
            int q = queries[qi];
            while (i < intervals.length && intervals[i][0] <= q) { heap.add(new int[] { intervals[i][1] - intervals[i][0] + 1, intervals[i][1] }); i++; }
            while (!heap.isEmpty() && heap.peek()[1] < q) heap.poll();
            out[qi] = heap.isEmpty() ? -1 : heap.peek()[0];
        }
        return out;
    }
}`,
  },
  {
    slug: 'meeting-rooms', title: 'Meeting Rooms', level: 'Easy',
    summary: 'intervals[i] = [start, end]. Return true if one person could attend every meeting: no two meetings overlap (one ending exactly when another starts is fine).',
    method: 'canAttendMeetings', params: [['int[][]', 'intervals']], returns: 'boolean',
    tests: [
      { in: [[[0, 30], [5, 10], [15, 20]]], out: false },
      { in: [[[7, 10], [2, 4]]], out: true },
      { in: [[]] },
      { in: [[[1, 5]]] },
      { in: [[[5, 10], [10, 15], [0, 5]]] },
      { in: [[[1, 3], [6, 9], [2, 7]]] },
    ],
    ref: `class Solution {
    public boolean canAttendMeetings(int[][] intervals) {
        int[][] a = intervals.clone();
        Arrays.sort(a, (x, y) -> Integer.compare(x[0], y[0]));
        for (int i = 1; i < a.length; i++) if (a[i][0] < a[i - 1][1]) return false;
        return true;
    }
}`,
  },
  {
    slug: 'meeting-rooms-ii', title: 'Meeting Rooms II', level: 'Medium',
    summary: 'intervals[i] = [start, end]. Return the minimum number of rooms needed so every meeting has a room. A room freed at time t can host a meeting starting at t.',
    method: 'minMeetingRooms', params: [['int[][]', 'intervals']], returns: 'int',
    tests: [
      { in: [[[0, 30], [5, 10], [15, 20]]], out: 2 },
      { in: [[[7, 10], [2, 4]]], out: 1 },
      { in: [[[1, 5]]] },
      { in: [[[1, 10], [2, 9], [3, 8], [4, 7]]] },
      { in: [[[5, 10], [10, 15], [0, 5]]] },
      { in: [[[9, 10], [4, 9], [4, 17]]] },
      { in: [[[1, 5], [8, 9], [8, 9]]] },
    ],
    ref: `class Solution {
    public int minMeetingRooms(int[][] intervals) {
        int n = intervals.length;
        int[] starts = new int[n], ends = new int[n];
        for (int i = 0; i < n; i++) { starts[i] = intervals[i][0]; ends[i] = intervals[i][1]; }
        Arrays.sort(starts); Arrays.sort(ends);
        int rooms = 0, best = 0, e = 0;
        for (int s = 0; s < n; s++) {
            while (ends[e] <= starts[s]) { e++; rooms--; }
            rooms++;
            best = Math.max(best, rooms);
        }
        return best;
    }
}`,
  },
  {
    slug: 'meeting-rooms-iii', title: 'Meeting Rooms III', level: 'Hard',
    summary: 'n rooms are numbered 0..n − 1. Meetings (unique start times) are handled in start order: each takes the free room with the lowest number; if none is free, it waits for the earliest room to free up (lowest number on ties) and keeps its length. Return the room that hosted the most meetings (lowest number on ties).',
    method: 'mostBooked', params: [['int', 'n'], ['int[][]', 'meetings']], returns: 'int',
    tests: [
      { in: [2, [[0, 10], [1, 5], [2, 7], [3, 4]]], out: 0 },
      { in: [3, [[1, 20], [2, 10], [3, 5], [4, 9], [6, 8]]], out: 1 },
      { in: [1, [[0, 1]]] },
      { in: [4, [[18, 19], [3, 12], [17, 19], [2, 13], [7, 10]]] },
      { in: [2, [[0, 10], [1, 2], [12, 14], [13, 15]]] },
      { in: [3, [[0, 500000], [1, 500000], [2, 500000], [3, 500000], [4, 500000], [5, 500000], [6, 500000], [7, 500000], [8, 500000], [9, 500000], [10, 500000], [11, 500000], [12, 500000], [13, 500000], [14, 500000], [15, 500000], [16, 500000]]] },
    ],
    ref: `class Solution {
    public int mostBooked(int n, int[][] meetings) {
        int[][] m = meetings.clone();
        Arrays.sort(m, (x, y) -> Integer.compare(x[0], y[0]));
        PriorityQueue<Integer> free = new PriorityQueue<>();
        for (int i = 0; i < n; i++) free.add(i);
        PriorityQueue<long[]> busy = new PriorityQueue<>((x, y) -> x[0] != y[0] ? Long.compare(x[0], y[0]) : Long.compare(x[1], y[1]));
        int[] count = new int[n];
        for (int[] mt : m) {
            long start = mt[0], len = mt[1] - mt[0];
            while (!busy.isEmpty() && busy.peek()[0] <= start) free.add((int) busy.poll()[1]);
            if (free.isEmpty()) {
                long[] b = busy.poll();
                start = b[0];
                free.add((int) b[1]);
            }
            int room = free.poll();
            count[room]++;
            busy.add(new long[] { start + len, room });
        }
        int best = 0;
        for (int i = 1; i < n; i++) if (count[i] > count[best]) best = i;
        return best;
    }
}`,
  },
];
