const r = String.raw;

export default {
  'merge-intervals': {
    pattern: 'Sort by start, then sweep and extend the last merged interval',
    approaches: [
      {
        level: 'Brute force', name: 'Absorb every overlapping interval found so far',
        idea: 'Build the result one interval at a time. A new interval swallows every result interval it overlaps (it may bridge several), and the merged interval replaces them. Sort at the end.',
        steps: [
          'Start with an empty result list.',
          'For each interval `[s, e]`: remove every result interval `[a, b]` with `a <= e` and `s <= b`, widening `s = min(s, a)`, `e = max(e, b)`.',
          'Add `[s, e]` to the result.',
          'Sort the result by start and return it.',
        ],
        time: 'O(n²)', space: 'O(n)',
        why: 'Each new interval is compared with up to n result intervals.',
        code: {
          java: r`class Solution {
    public int[][] merge(int[][] intervals) {
        List<int[]> out = new ArrayList<>();
        for (int[] iv : intervals) {
            int s = iv[0], e = iv[1];
            Iterator<int[]> it = out.iterator();
            while (it.hasNext()) {
                int[] o = it.next();
                if (o[0] <= e && s <= o[1]) { s = Math.min(s, o[0]); e = Math.max(e, o[1]); it.remove(); }
            }
            out.add(new int[] { s, e });
        }
        out.sort((a, b) -> Integer.compare(a[0], b[0]));
        return out.toArray(new int[0][]);
    }
}`,
          cpp: r`class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        vector<vector<int>> out;
        for (auto& iv : intervals) {
            int s = iv[0], e = iv[1];
            vector<vector<int>> keep;
            for (auto& o : out) {
                if (o[0] <= e && s <= o[1]) { s = min(s, o[0]); e = max(e, o[1]); }
                else keep.push_back(o);
            }
            keep.push_back({s, e});
            out = keep;
        }
        sort(out.begin(), out.end());
        return out;
    }
};`,
          python: r`class Solution:
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:
        out = []
        for s, e in intervals:
            keep = []
            for a, b in out:
                if a <= e and s <= b:
                    s, e = min(s, a), max(e, b)
                else:
                    keep.append([a, b])
            keep.append([s, e])
            out = keep
        return sorted(out)`,
          javascript: r`var merge = function(intervals) {
    let out = [];
    for (let [s, e] of intervals) {
        const keep = [];
        for (const [a, b] of out) {
            if (a <= e && s <= b) { s = Math.min(s, a); e = Math.max(e, b); }
            else keep.push([a, b]);
        }
        keep.push([s, e]);
        out = keep;
    }
    return out.sort((x, y) => x[0] - y[0]);
};`,
        },
      },
      {
        level: 'Optimal', name: 'Sort by start and sweep',
        idea: 'After sorting by start, intervals that overlap are next to each other. Walk them in order: if the next one starts before (or at) the end of the last merged interval, extend that end; otherwise start a new merged interval.',
        steps: [
          'Sort the intervals by start.',
          'For each interval: if the result is empty or its start is greater than the last result\'s end, append a copy.',
          'Otherwise set the last result\'s end to `max(lastEnd, end)`.',
          'Return the result.',
        ],
        time: 'O(n log n)', space: 'O(n)',
        why: 'The sort dominates; the sweep is O(n). The output (and the sort) use O(n) memory. `<=` makes touching intervals merge.',
        code: {
          java: r`class Solution {
    public int[][] merge(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
        List<int[]> out = new ArrayList<>();
        for (int[] iv : intervals) {
            if (out.isEmpty() || iv[0] > out.get(out.size() - 1)[1]) out.add(new int[] { iv[0], iv[1] });
            else out.get(out.size() - 1)[1] = Math.max(out.get(out.size() - 1)[1], iv[1]);
        }
        return out.toArray(new int[0][]);
    }
}`,
          cpp: r`class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        sort(intervals.begin(), intervals.end());
        vector<vector<int>> out;
        for (auto& iv : intervals) {
            if (out.empty() || iv[0] > out.back()[1]) out.push_back(iv);
            else out.back()[1] = max(out.back()[1], iv[1]);
        }
        return out;
    }
};`,
          python: r`class Solution:
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:
        intervals.sort(key=lambda iv: iv[0])
        out = []
        for s, e in intervals:
            if not out or s > out[-1][1]:
                out.append([s, e])
            else:
                out[-1][1] = max(out[-1][1], e)
        return out`,
          javascript: r`var merge = function(intervals) {
    intervals.sort((a, b) => a[0] - b[0]);
    const out = [];
    for (const [s, e] of intervals) {
        if (out.length === 0 || s > out[out.length - 1][1]) out.push([s, e]);
        else out[out.length - 1][1] = Math.max(out[out.length - 1][1], e);
    }
    return out;
};`,
        },
      },
    ],
  },

  'insert-interval': {
    pattern: 'Linear sweep in three phases: before, overlapping (merge), after',
    approaches: [
      {
        level: 'Brute force', name: 'Append, sort and merge everything',
        idea: 'Add the new interval to the list and run the general Merge Intervals algorithm, ignoring that the list was already sorted and disjoint.',
        steps: [
          'Append `newInterval` to the list.',
          'Sort by start.',
          'Sweep, merging overlapping or touching intervals.',
        ],
        time: 'O(n log n)', space: 'O(n)',
        why: 'The sort costs O(n log n) even though only one interval is out of place.',
        code: {
          java: r`class Solution {
    public int[][] insert(int[][] intervals, int[] newInterval) {
        List<int[]> all = new ArrayList<>(Arrays.asList(intervals));
        all.add(newInterval);
        all.sort((a, b) -> Integer.compare(a[0], b[0]));
        List<int[]> out = new ArrayList<>();
        for (int[] iv : all) {
            if (out.isEmpty() || iv[0] > out.get(out.size() - 1)[1]) out.add(new int[] { iv[0], iv[1] });
            else out.get(out.size() - 1)[1] = Math.max(out.get(out.size() - 1)[1], iv[1]);
        }
        return out.toArray(new int[0][]);
    }
}`,
          cpp: r`class Solution {
public:
    vector<vector<int>> insert(vector<vector<int>>& intervals, vector<int>& newInterval) {
        vector<vector<int>> all = intervals, out;
        all.push_back(newInterval);
        sort(all.begin(), all.end());
        for (auto& iv : all) {
            if (out.empty() || iv[0] > out.back()[1]) out.push_back(iv);
            else out.back()[1] = max(out.back()[1], iv[1]);
        }
        return out;
    }
};`,
          python: r`class Solution:
    def insert(self, intervals: List[List[int]], newInterval: List[int]) -> List[List[int]]:
        out = []
        for s, e in sorted(intervals + [newInterval]):
            if not out or s > out[-1][1]:
                out.append([s, e])
            else:
                out[-1][1] = max(out[-1][1], e)
        return out`,
          javascript: r`var insert = function(intervals, newInterval) {
    const all = [...intervals, newInterval].sort((a, b) => a[0] - b[0]), out = [];
    for (const [s, e] of all) {
        if (out.length === 0 || s > out[out.length - 1][1]) out.push([s, e]);
        else out[out.length - 1][1] = Math.max(out[out.length - 1][1], e);
    }
    return out;
};`,
        },
      },
      {
        level: 'Optimal', name: 'One pass in three phases',
        idea: 'Because the list is sorted and disjoint, it splits into three groups: intervals entirely before the new one, intervals overlapping it, and intervals entirely after it. Copy the first group, merge the middle group into the new interval, copy the rest.',
        steps: [
          'Copy every interval whose end is less than `newInterval`\'s start.',
          'While the next interval\'s start is at most the new interval\'s end, widen the new interval to cover it.',
          'Append the (widened) new interval.',
          'Copy the remaining intervals.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Each interval is looked at once; the output holds up to n + 1 intervals.',
        code: {
          java: r`class Solution {
    public int[][] insert(int[][] intervals, int[] newInterval) {
        List<int[]> out = new ArrayList<>();
        int i = 0, n = intervals.length, s = newInterval[0], e = newInterval[1];
        while (i < n && intervals[i][1] < s) out.add(intervals[i++]);
        while (i < n && intervals[i][0] <= e) {
            s = Math.min(s, intervals[i][0]);
            e = Math.max(e, intervals[i][1]);
            i++;
        }
        out.add(new int[] { s, e });
        while (i < n) out.add(intervals[i++]);
        return out.toArray(new int[0][]);
    }
}`,
          cpp: r`class Solution {
public:
    vector<vector<int>> insert(vector<vector<int>>& intervals, vector<int>& newInterval) {
        vector<vector<int>> out;
        int i = 0, n = intervals.size(), s = newInterval[0], e = newInterval[1];
        while (i < n && intervals[i][1] < s) out.push_back(intervals[i++]);
        while (i < n && intervals[i][0] <= e) {
            s = min(s, intervals[i][0]);
            e = max(e, intervals[i][1]);
            i++;
        }
        out.push_back({s, e});
        while (i < n) out.push_back(intervals[i++]);
        return out;
    }
};`,
          python: r`class Solution:
    def insert(self, intervals: List[List[int]], newInterval: List[int]) -> List[List[int]]:
        out, i, n = [], 0, len(intervals)
        s, e = newInterval
        while i < n and intervals[i][1] < s:
            out.append(intervals[i])
            i += 1
        while i < n and intervals[i][0] <= e:
            s = min(s, intervals[i][0])
            e = max(e, intervals[i][1])
            i += 1
        out.append([s, e])
        out.extend(intervals[i:])
        return out`,
          javascript: r`var insert = function(intervals, newInterval) {
    const out = [], n = intervals.length;
    let i = 0, [s, e] = newInterval;
    while (i < n && intervals[i][1] < s) out.push(intervals[i++]);
    while (i < n && intervals[i][0] <= e) {
        s = Math.min(s, intervals[i][0]);
        e = Math.max(e, intervals[i][1]);
        i++;
    }
    out.push([s, e]);
    while (i < n) out.push(intervals[i++]);
    return out;
};`,
        },
      },
    ],
  },

  'non-overlapping-intervals': {
    pattern: 'Greedy interval scheduling: keep the interval that ends first',
    approaches: [
      {
        level: 'Better', name: 'DP: longest chain of non-overlapping intervals',
        idea: 'Removing the fewest intervals means keeping the most. Sort by start; `keep[i]` = the most intervals that can be kept ending with interval `i`, built from every earlier interval that ends by `i`\'s start.',
        steps: [
          'Sort by start.',
          '`keep[i] = 1 + max(keep[j])` over `j < i` with `end[j] <= start[i]` (or 1 if none).',
          'Return `n − max(keep)`.',
        ],
        time: 'O(n²)', space: 'O(n)',
        why: 'Each interval looks back at every earlier one. Correct, but n = 10⁵ makes it far too slow.',
        code: {
          java: r`class Solution {
    public int eraseOverlapIntervals(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
        int n = intervals.length, best = 0;
        int[] keep = new int[n];
        for (int i = 0; i < n; i++) {
            keep[i] = 1;
            for (int j = 0; j < i; j++)
                if (intervals[j][1] <= intervals[i][0]) keep[i] = Math.max(keep[i], keep[j] + 1);
            best = Math.max(best, keep[i]);
        }
        return n - best;
    }
}`,
          cpp: r`class Solution {
public:
    int eraseOverlapIntervals(vector<vector<int>>& intervals) {
        sort(intervals.begin(), intervals.end());
        int n = intervals.size(), best = 0;
        vector<int> keep(n, 1);
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < i; j++)
                if (intervals[j][1] <= intervals[i][0]) keep[i] = max(keep[i], keep[j] + 1);
            best = max(best, keep[i]);
        }
        return n - best;
    }
};`,
          python: r`class Solution:
    def eraseOverlapIntervals(self, intervals: List[List[int]]) -> int:
        intervals.sort()
        n = len(intervals)
        keep = [1] * n
        for i in range(n):
            for j in range(i):
                if intervals[j][1] <= intervals[i][0]:
                    keep[i] = max(keep[i], keep[j] + 1)
        return n - max(keep)`,
          javascript: r`var eraseOverlapIntervals = function(intervals) {
    intervals.sort((a, b) => a[0] - b[0]);
    const n = intervals.length, keep = new Array(n).fill(1);
    let best = 0;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < i; j++)
            if (intervals[j][1] <= intervals[i][0]) keep[i] = Math.max(keep[i], keep[j] + 1);
        best = Math.max(best, keep[i]);
    }
    return n - best;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Greedy: sort by end, keep what ends earliest',
        idea: 'Among intervals that could come next, keeping the one that ends earliest leaves the most room for the rest (the classic activity-selection argument). Count the intervals kept; everything else is removed.',
        steps: [
          'Sort by end.',
          'Keep the first interval; `lastEnd` = its end.',
          'For each next interval: if its start is `>= lastEnd` (touching is fine), keep it and set `lastEnd` to its end; otherwise it must be removed — count it.',
          'Return the count of removals.',
        ],
        time: 'O(n log n)', space: 'O(1)',
        why: 'The sort dominates; the sweep is O(n) with two variables (aside from the sort\'s own memory). Exchange argument: any optimal choice can swap its first interval for the earliest-ending one without losing anything.',
        code: {
          java: r`class Solution {
    public int eraseOverlapIntervals(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[1], b[1]));
        int removed = 0, lastEnd = intervals[0][1];
        for (int i = 1; i < intervals.length; i++) {
            if (intervals[i][0] >= lastEnd) lastEnd = intervals[i][1];
            else removed++;
        }
        return removed;
    }
}`,
          cpp: r`class Solution {
public:
    int eraseOverlapIntervals(vector<vector<int>>& intervals) {
        sort(intervals.begin(), intervals.end(), [](auto& a, auto& b) { return a[1] < b[1]; });
        int removed = 0, lastEnd = intervals[0][1];
        for (size_t i = 1; i < intervals.size(); i++) {
            if (intervals[i][0] >= lastEnd) lastEnd = intervals[i][1];
            else removed++;
        }
        return removed;
    }
};`,
          python: r`class Solution:
    def eraseOverlapIntervals(self, intervals: List[List[int]]) -> int:
        intervals.sort(key=lambda iv: iv[1])
        removed, last_end = 0, intervals[0][1]
        for s, e in intervals[1:]:
            if s >= last_end:
                last_end = e
            else:
                removed += 1
        return removed`,
          javascript: r`var eraseOverlapIntervals = function(intervals) {
    intervals.sort((a, b) => a[1] - b[1]);
    let removed = 0, lastEnd = intervals[0][1];
    for (let i = 1; i < intervals.length; i++) {
        if (intervals[i][0] >= lastEnd) lastEnd = intervals[i][1];
        else removed++;
    }
    return removed;
};`,
        },
      },
    ],
  },

  'minimum-number-of-arrows-to-burst-balloons': {
    pattern: 'Greedy: sort by end, shoot at the earliest end',
    approaches: [
      {
        level: 'Brute force', name: 'Repeatedly shoot at the smallest end among the remaining balloons',
        idea: 'The balloon that ends first must be hit by some arrow at or before its end; shooting exactly at its end hits as many others as possible. Without sorting, find that balloon by scanning each time.',
        steps: [
          'While balloons remain: find the smallest `end` among them.',
          'Shoot an arrow at `x = end`: remove every balloon with `start <= x <= end`.',
          'Count the arrows.',
        ],
        time: 'O(n²)', space: 'O(n)',
        why: 'Up to n arrows, each needing an O(n) scan. A "remaining" flag per balloon takes O(n).',
        code: {
          java: r`class Solution {
    public int findMinArrowShots(int[][] points) {
        int n = points.length, left = n, arrows = 0;
        boolean[] gone = new boolean[n];
        while (left > 0) {
            long x = Long.MAX_VALUE;
            for (int i = 0; i < n; i++) if (!gone[i]) x = Math.min(x, points[i][1]);
            for (int i = 0; i < n; i++)
                if (!gone[i] && points[i][0] <= x && x <= points[i][1]) { gone[i] = true; left--; }
            arrows++;
        }
        return arrows;
    }
}`,
          cpp: r`class Solution {
public:
    int findMinArrowShots(vector<vector<int>>& points) {
        int n = points.size(), left = n, arrows = 0;
        vector<bool> gone(n, false);
        while (left > 0) {
            long long x = LLONG_MAX;
            for (int i = 0; i < n; i++) if (!gone[i]) x = min(x, (long long) points[i][1]);
            for (int i = 0; i < n; i++)
                if (!gone[i] && points[i][0] <= x && x <= points[i][1]) { gone[i] = true; left--; }
            arrows++;
        }
        return arrows;
    }
};`,
          python: r`class Solution:
    def findMinArrowShots(self, points: List[List[int]]) -> int:
        left, arrows = list(points), 0
        while left:
            x = min(e for _, e in left)
            left = [[s, e] for s, e in left if not (s <= x <= e)]
            arrows += 1
        return arrows`,
          javascript: r`var findMinArrowShots = function(points) {
    let left = points, arrows = 0;
    while (left.length) {
        let x = Infinity;
        for (const [, e] of left) x = Math.min(x, e);
        left = left.filter(([s, e]) => !(s <= x && x <= e));
        arrows++;
    }
    return arrows;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Sort by end and sweep',
        idea: 'The same greedy choice, but sorting by end once lets a single sweep make every decision: an arrow at the current end bursts every following balloon that starts at or before it.',
        steps: [
          'Sort balloons by end.',
          'Shoot the first arrow at the first balloon\'s end: `arrows = 1`, `x = end`.',
          'For each next balloon, if its start is greater than `x`, the arrow misses it: shoot a new arrow at its end (`arrows++`, `x = end`).',
          'Return `arrows`.',
        ],
        time: 'O(n log n)', space: 'O(1)',
        why: 'Sorting dominates; the sweep is linear. Coordinates reach ±2³¹, so compare with `Integer.compare` (or `<`) rather than subtracting, which overflows.',
        code: {
          java: r`class Solution {
    public int findMinArrowShots(int[][] points) {
        Arrays.sort(points, (a, b) -> Integer.compare(a[1], b[1]));
        int arrows = 1;
        long x = points[0][1];
        for (int[] p : points) {
            if (p[0] > x) { arrows++; x = p[1]; }
        }
        return arrows;
    }
}`,
          cpp: r`class Solution {
public:
    int findMinArrowShots(vector<vector<int>>& points) {
        sort(points.begin(), points.end(), [](auto& a, auto& b) { return a[1] < b[1]; });
        int arrows = 1;
        long long x = points[0][1];
        for (auto& p : points) {
            if (p[0] > x) { arrows++; x = p[1]; }
        }
        return arrows;
    }
};`,
          python: r`class Solution:
    def findMinArrowShots(self, points: List[List[int]]) -> int:
        points.sort(key=lambda p: p[1])
        arrows, x = 1, points[0][1]
        for s, e in points:
            if s > x:
                arrows += 1
                x = e
        return arrows`,
          javascript: r`var findMinArrowShots = function(points) {
    points.sort((a, b) => a[1] - b[1]);
    let arrows = 1, x = points[0][1];
    for (const [s, e] of points) {
        if (s > x) { arrows++; x = e; }
    }
    return arrows;
};`,
        },
      },
    ],
  },

  'interval-list-intersections': {
    pattern: 'Two pointers over two sorted interval lists (advance the one that ends first)',
    approaches: [
      {
        level: 'Brute force', name: 'Intersect every pair',
        idea: 'Two intervals intersect in `[max(starts), min(ends)]` when that range is non-empty. Check every pair and collect the intersections in order.',
        steps: [
          'For each interval `a` in `firstList` and `b` in `secondList`:',
          'Let `lo = max(a.start, b.start)`, `hi = min(a.end, b.end)`; if `lo <= hi`, record `[lo, hi]`.',
          'Sort the recorded intersections by start and return them.',
        ],
        time: 'O(m·n + k log k)', space: 'O(k)',
        why: 'All m·n pairs are checked; k intersections are then sorted.',
        code: {
          java: r`class Solution {
    public int[][] intervalIntersection(int[][] firstList, int[][] secondList) {
        List<int[]> out = new ArrayList<>();
        for (int[] a : firstList)
            for (int[] b : secondList) {
                int lo = Math.max(a[0], b[0]), hi = Math.min(a[1], b[1]);
                if (lo <= hi) out.add(new int[] { lo, hi });
            }
        out.sort((x, y) -> Integer.compare(x[0], y[0]));
        return out.toArray(new int[0][]);
    }
}`,
          cpp: r`class Solution {
public:
    vector<vector<int>> intervalIntersection(vector<vector<int>>& firstList, vector<vector<int>>& secondList) {
        vector<vector<int>> out;
        for (auto& a : firstList)
            for (auto& b : secondList) {
                int lo = max(a[0], b[0]), hi = min(a[1], b[1]);
                if (lo <= hi) out.push_back({lo, hi});
            }
        sort(out.begin(), out.end());
        return out;
    }
};`,
          python: r`class Solution:
    def intervalIntersection(self, firstList: List[List[int]], secondList: List[List[int]]) -> List[List[int]]:
        out = []
        for a in firstList:
            for b in secondList:
                lo, hi = max(a[0], b[0]), min(a[1], b[1])
                if lo <= hi:
                    out.append([lo, hi])
        return sorted(out)`,
          javascript: r`var intervalIntersection = function(firstList, secondList) {
    const out = [];
    for (const a of firstList)
        for (const b of secondList) {
            const lo = Math.max(a[0], b[0]), hi = Math.min(a[1], b[1]);
            if (lo <= hi) out.push([lo, hi]);
        }
    return out.sort((x, y) => x[0] - y[0]);
};`,
        },
      },
      {
        level: 'Optimal', name: 'Two pointers',
        idea: 'Compare the current interval of each list. Record their intersection if it exists. The interval that ends first cannot meet anything further in the other list, so advance that pointer.',
        steps: [
          'Set `i = j = 0`.',
          'While both lists have intervals left: `lo = max(A[i].start, B[j].start)`, `hi = min(A[i].end, B[j].end)`; if `lo <= hi`, append `[lo, hi]`.',
          'If `A[i]` ends first, move `i`; otherwise move `j`.',
          'Return the collected intersections (already in order).',
        ],
        time: 'O(m + n)', space: 'O(1)',
        why: 'Each step advances one pointer, so at most m + n steps; aside from the output only two indices are used.',
        code: {
          java: r`class Solution {
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
          cpp: r`class Solution {
public:
    vector<vector<int>> intervalIntersection(vector<vector<int>>& firstList, vector<vector<int>>& secondList) {
        vector<vector<int>> out;
        size_t i = 0, j = 0;
        while (i < firstList.size() && j < secondList.size()) {
            int lo = max(firstList[i][0], secondList[j][0]), hi = min(firstList[i][1], secondList[j][1]);
            if (lo <= hi) out.push_back({lo, hi});
            if (firstList[i][1] < secondList[j][1]) i++; else j++;
        }
        return out;
    }
};`,
          python: r`class Solution:
    def intervalIntersection(self, firstList: List[List[int]], secondList: List[List[int]]) -> List[List[int]]:
        out, i, j = [], 0, 0
        while i < len(firstList) and j < len(secondList):
            lo = max(firstList[i][0], secondList[j][0])
            hi = min(firstList[i][1], secondList[j][1])
            if lo <= hi:
                out.append([lo, hi])
            if firstList[i][1] < secondList[j][1]:
                i += 1
            else:
                j += 1
        return out`,
          javascript: r`var intervalIntersection = function(firstList, secondList) {
    const out = [];
    let i = 0, j = 0;
    while (i < firstList.length && j < secondList.length) {
        const lo = Math.max(firstList[i][0], secondList[j][0]), hi = Math.min(firstList[i][1], secondList[j][1]);
        if (lo <= hi) out.push([lo, hi]);
        if (firstList[i][1] < secondList[j][1]) i++; else j++;
    }
    return out;
};`,
        },
      },
    ],
  },

  'remove-covered-intervals': {
    pattern: 'Sort by start ascending, end descending; track the largest end so far',
    approaches: [
      {
        level: 'Brute force', name: 'Check every interval against every other',
        idea: 'An interval is removed if some other interval covers it. Test each interval against all others.',
        steps: [
          'For each interval `i`, look for a `j != i` with `start[j] <= start[i]` and `end[i] <= end[j]`.',
          'Count the intervals for which no such `j` exists, and return that count.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'n·(n − 1) comparisons. Intervals are distinct, so two intervals never cover each other.',
        code: {
          java: r`class Solution {
    public int removeCoveredIntervals(int[][] intervals) {
        int remaining = 0;
        for (int i = 0; i < intervals.length; i++) {
            boolean covered = false;
            for (int j = 0; j < intervals.length && !covered; j++)
                if (j != i && intervals[j][0] <= intervals[i][0] && intervals[i][1] <= intervals[j][1]) covered = true;
            if (!covered) remaining++;
        }
        return remaining;
    }
}`,
          cpp: r`class Solution {
public:
    int removeCoveredIntervals(vector<vector<int>>& intervals) {
        int n = intervals.size(), remaining = 0;
        for (int i = 0; i < n; i++) {
            bool covered = false;
            for (int j = 0; j < n && !covered; j++)
                if (j != i && intervals[j][0] <= intervals[i][0] && intervals[i][1] <= intervals[j][1]) covered = true;
            if (!covered) remaining++;
        }
        return remaining;
    }
};`,
          python: r`class Solution:
    def removeCoveredIntervals(self, intervals: List[List[int]]) -> int:
        n = len(intervals)
        return sum(
            1 for i in range(n)
            if not any(j != i and intervals[j][0] <= intervals[i][0] and intervals[i][1] <= intervals[j][1] for j in range(n))
        )`,
          javascript: r`var removeCoveredIntervals = function(intervals) {
    let remaining = 0;
    for (let i = 0; i < intervals.length; i++) {
        const covered = intervals.some((o, j) => j !== i && o[0] <= intervals[i][0] && intervals[i][1] <= o[1]);
        if (!covered) remaining++;
    }
    return remaining;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Sort, then one pass with the furthest end seen',
        idea: 'Sort by start ascending and, for equal starts, by end descending. Then any interval that could cover the current one has already been seen, and it covers the current one exactly when the largest end so far reaches the current end.',
        steps: [
          'Sort by `(start ascending, end descending)`.',
          'Keep `maxEnd = −∞` and a count.',
          'For each interval: if its end is `<= maxEnd`, it is covered; otherwise count it and set `maxEnd` to its end.',
          'Return the count.',
        ],
        time: 'O(n log n)', space: 'O(1)',
        why: 'The sort dominates; the sweep is O(n). Sorting equal starts by end descending makes the longer one come first, so `[1,4]` correctly covers `[1,3]`.',
        code: {
          java: r`class Solution {
    public int removeCoveredIntervals(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> a[0] != b[0] ? Integer.compare(a[0], b[0]) : Integer.compare(b[1], a[1]));
        int count = 0, maxEnd = Integer.MIN_VALUE;
        for (int[] iv : intervals) {
            if (iv[1] > maxEnd) { count++; maxEnd = iv[1]; }
        }
        return count;
    }
}`,
          cpp: r`class Solution {
public:
    int removeCoveredIntervals(vector<vector<int>>& intervals) {
        sort(intervals.begin(), intervals.end(), [](auto& a, auto& b) { return a[0] != b[0] ? a[0] < b[0] : a[1] > b[1]; });
        int count = 0, maxEnd = INT_MIN;
        for (auto& iv : intervals) {
            if (iv[1] > maxEnd) { count++; maxEnd = iv[1]; }
        }
        return count;
    }
};`,
          python: r`class Solution:
    def removeCoveredIntervals(self, intervals: List[List[int]]) -> int:
        intervals.sort(key=lambda iv: (iv[0], -iv[1]))
        count, max_end = 0, -inf
        for _, e in intervals:
            if e > max_end:
                count += 1
                max_end = e
        return count`,
          javascript: r`var removeCoveredIntervals = function(intervals) {
    intervals.sort((a, b) => a[0] !== b[0] ? a[0] - b[0] : b[1] - a[1]);
    let count = 0, maxEnd = -Infinity;
    for (const [, e] of intervals) {
        if (e > maxEnd) { count++; maxEnd = e; }
    }
    return count;
};`,
        },
      },
    ],
  },

  'minimum-interval-to-include-each-query': {
    pattern: 'Offline queries: sort intervals and queries, min-heap of candidate intervals by size',
    approaches: [
      {
        level: 'Brute force', name: 'Scan all intervals for each query',
        idea: 'For each query, look at every interval that contains it and keep the smallest size.',
        steps: [
          'For each query `q`, set `best = −1`.',
          'For each interval `[l, r]` with `l <= q <= r`, update `best` with `r − l + 1` if smaller.',
          'Record `best`.',
        ],
        time: 'O(q·n)', space: 'O(1)',
        why: 'Every query checks every interval: up to 10¹⁰ steps at the limits (output aside).',
        code: {
          java: r`class Solution {
    public int[] minInterval(int[][] intervals, int[] queries) {
        int[] ans = new int[queries.length];
        for (int k = 0; k < queries.length; k++) {
            int q = queries[k], best = -1;
            for (int[] iv : intervals)
                if (iv[0] <= q && q <= iv[1] && (best == -1 || iv[1] - iv[0] + 1 < best)) best = iv[1] - iv[0] + 1;
            ans[k] = best;
        }
        return ans;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> minInterval(vector<vector<int>>& intervals, vector<int>& queries) {
        vector<int> ans;
        for (int q : queries) {
            int best = -1;
            for (auto& iv : intervals)
                if (iv[0] <= q && q <= iv[1] && (best == -1 || iv[1] - iv[0] + 1 < best)) best = iv[1] - iv[0] + 1;
            ans.push_back(best);
        }
        return ans;
    }
};`,
          python: r`class Solution:
    def minInterval(self, intervals: List[List[int]], queries: List[int]) -> List[int]:
        ans = []
        for q in queries:
            sizes = [r - l + 1 for l, r in intervals if l <= q <= r]
            ans.append(min(sizes) if sizes else -1)
        return ans`,
          javascript: r`var minInterval = function(intervals, queries) {
    return queries.map((q) => {
        let best = -1;
        for (const [l, r] of intervals)
            if (l <= q && q <= r && (best === -1 || r - l + 1 < best)) best = r - l + 1;
        return best;
    });
};`,
        },
      },
      {
        level: 'Optimal', name: 'Sort both, sweep queries, min-heap by size',
        idea: 'Answer the queries in increasing order (remembering their original positions). Before answering `q`, push every interval that starts at or before `q` into a min-heap keyed by size. Intervals at the top that end before `q` can never help this or any later query, so pop them. The top is then the smallest interval containing `q`.',
        steps: [
          'Sort intervals by left end; sort query indices by query value.',
          'For each query `q` in increasing order: push `(size, right)` for every not-yet-added interval with `left <= q`.',
          'Pop from the heap while the top\'s `right < q`.',
          'The answer is the top\'s size, or −1 if the heap is empty; store it at the query\'s original index.',
        ],
        time: 'O(n log n + q log q)', space: 'O(n + q)',
        why: 'Two sorts; each interval is pushed and popped at most once (O(log n) each). The heap and the sorted query order take O(n + q).',
        code: {
          java: r`class Solution {
    public int[] minInterval(int[][] intervals, int[] queries) {
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
        Integer[] order = new Integer[queries.length];
        for (int k = 0; k < order.length; k++) order[k] = k;
        Arrays.sort(order, (a, b) -> Integer.compare(queries[a], queries[b]));
        PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));
        int[] ans = new int[queries.length];
        int i = 0;
        for (int k : order) {
            int q = queries[k];
            while (i < intervals.length && intervals[i][0] <= q) {
                heap.add(new int[] { intervals[i][1] - intervals[i][0] + 1, intervals[i][1] });
                i++;
            }
            while (!heap.isEmpty() && heap.peek()[1] < q) heap.poll();
            ans[k] = heap.isEmpty() ? -1 : heap.peek()[0];
        }
        return ans;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> minInterval(vector<vector<int>>& intervals, vector<int>& queries) {
        sort(intervals.begin(), intervals.end());
        vector<int> order(queries.size());
        iota(order.begin(), order.end(), 0);
        sort(order.begin(), order.end(), [&](int a, int b) { return queries[a] < queries[b]; });
        priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> heap;
        vector<int> ans(queries.size());
        size_t i = 0;
        for (int k : order) {
            int q = queries[k];
            while (i < intervals.size() && intervals[i][0] <= q) {
                heap.push({intervals[i][1] - intervals[i][0] + 1, intervals[i][1]});
                i++;
            }
            while (!heap.empty() && heap.top().second < q) heap.pop();
            ans[k] = heap.empty() ? -1 : heap.top().first;
        }
        return ans;
    }
};`,
          python: r`class Solution:
    def minInterval(self, intervals: List[List[int]], queries: List[int]) -> List[int]:
        intervals.sort()
        ans = [-1] * len(queries)
        heap, i = [], 0
        for k in sorted(range(len(queries)), key=lambda k: queries[k]):
            q = queries[k]
            while i < len(intervals) and intervals[i][0] <= q:
                l, r = intervals[i]
                heappush(heap, (r - l + 1, r))
                i += 1
            while heap and heap[0][1] < q:
                heappop(heap)
            if heap:
                ans[k] = heap[0][0]
        return ans`,
          javascript: r`var minInterval = function(intervals, queries) {
    intervals.sort((a, b) => a[0] - b[0]);
    const order = queries.map((_, k) => k).sort((a, b) => queries[a] - queries[b]);
    const heap = new PriorityQueue((a, b) => a[0] - b[0]);
    const ans = new Array(queries.length);
    let i = 0;
    for (const k of order) {
        const q = queries[k];
        while (i < intervals.length && intervals[i][0] <= q) {
            heap.enqueue([intervals[i][1] - intervals[i][0] + 1, intervals[i][1]]);
            i++;
        }
        while (heap.size() && heap.front()[1] < q) heap.dequeue();
        ans[k] = heap.size() ? heap.front()[0] : -1;
    }
    return ans;
};`,
        },
      },
    ],
  },
};
