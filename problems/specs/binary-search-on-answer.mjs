export default [
  {
    slug: 'koko-eating-bananas', title: 'Koko Eating Bananas', level: 'Medium',
    summary: 'Each hour Koko eats up to k bananas from one pile. Return the smallest k that lets her finish every pile within h hours.',
    method: 'minEatingSpeed', params: [['int[]', 'piles'], ['int', 'h']], returns: 'int',
    tests: [
      { in: [[3, 6, 7, 11], 8], out: 4 },
      { in: [[30, 11, 23, 4, 20], 5], out: 30 },
      { in: [[30, 11, 23, 4, 20], 6], out: 23 },
      { in: [[1000000000], 2] },
      { in: [[312884470], 312884469] },
    ],
    ref: `class Solution {
    public int minEatingSpeed(int[] piles, int h) {
        int lo = 1, hi = 0;
        for (int p : piles) hi = Math.max(hi, p);
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            long hours = 0;
            for (int p : piles) hours += (p + mid - 1) / mid;
            if (hours <= h) hi = mid; else lo = mid + 1;
        }
        return lo;
    }
}`,
  },
  {
    slug: 'find-the-smallest-divisor-given-a-threshold', title: 'Find the Smallest Divisor Given a Threshold', level: 'Medium',
    summary: 'Divide every value by d, rounding up, and add the results. Return the smallest positive d that keeps the sum at most threshold.',
    method: 'smallestDivisor', params: [['int[]', 'nums'], ['int', 'threshold']], returns: 'int',
    tests: [
      { in: [[1, 2, 5, 9], 6], out: 5 },
      { in: [[44, 22, 33, 11, 1], 5], out: 44 },
      { in: [[19], 19] },
      { in: [[2, 3, 5, 7, 11], 11] },
      { in: [[1000000, 1000000], 2] },
    ],
    ref: `class Solution {
    public int smallestDivisor(int[] nums, int threshold) {
        int lo = 1, hi = 0;
        for (int x : nums) hi = Math.max(hi, x);
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            long sum = 0;
            for (int x : nums) sum += (x + mid - 1) / mid;
            if (sum <= threshold) hi = mid; else lo = mid + 1;
        }
        return lo;
    }
}`,
  },
  {
    slug: 'capacity-to-ship-packages-within-d-days', title: 'Capacity To Ship Packages Within D Days', level: 'Medium',
    summary: 'Packages must ship in the given order, filling the ship each day without exceeding its capacity. Return the smallest capacity that ships everything within days days.',
    method: 'shipWithinDays', params: [['int[]', 'weights'], ['int', 'days']], returns: 'int',
    tests: [
      { in: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5], out: 15 },
      { in: [[3, 2, 2, 4, 1, 4], 3], out: 6 },
      { in: [[1, 2, 3, 1, 1], 4], out: 3 },
      { in: [[10], 1] },
      { in: [[5, 5, 5, 5], 4] },
    ],
    ref: `class Solution {
    public int shipWithinDays(int[] weights, int days) {
        int lo = 0, hi = 0;
        for (int w : weights) { lo = Math.max(lo, w); hi += w; }
        while (lo < hi) {
            int mid = (lo + hi) >>> 1, need = 1, load = 0;
            for (int w : weights) { if (load + w > mid) { need++; load = 0; } load += w; }
            if (need <= days) hi = mid; else lo = mid + 1;
        }
        return lo;
    }
}`,
  },
  {
    slug: 'minimum-number-of-days-to-make-m-bouquets', title: 'Minimum Number of Days to Make m Bouquets', level: 'Medium',
    summary: 'Flower i blooms on bloomDay[i]. A bouquet needs k adjacent bloomed flowers. Return the fewest days to make m bouquets, or -1 if impossible.',
    method: 'minDays', params: [['int[]', 'bloomDay'], ['int', 'm'], ['int', 'k']], returns: 'int',
    tests: [
      { in: [[1, 10, 3, 10, 2], 3, 1], out: 3 },
      { in: [[1, 10, 3, 10, 2], 3, 2], out: -1 },
      { in: [[7, 7, 7, 7, 12, 7, 7], 2, 3], out: 12 },
      { in: [[1000000000, 1000000000], 1, 1] },
      { in: [[1, 10, 2, 9, 3, 8, 4, 7, 5, 6], 4, 2] },
    ],
    ref: `class Solution {
    public int minDays(int[] bloomDay, int m, int k) {
        if ((long) m * k > bloomDay.length) return -1;
        int lo = Integer.MAX_VALUE, hi = 0;
        for (int d : bloomDay) { lo = Math.min(lo, d); hi = Math.max(hi, d); }
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2, run = 0, made = 0;
            for (int d : bloomDay) { if (d <= mid) { if (++run == k) { made++; run = 0; } } else run = 0; }
            if (made >= m) hi = mid; else lo = mid + 1;
        }
        return lo;
    }
}`,
  },
  {
    slug: 'minimum-time-to-complete-trips', title: 'Minimum Time to Complete Trips', level: 'Medium',
    summary: 'Bus i takes time[i] for one trip and can repeat trips back to back; buses run in parallel. Return the least time for all buses together to finish at least totalTrips trips.',
    method: 'minimumTime', params: [['int[]', 'time'], ['int', 'totalTrips']], returns: 'long',
    tests: [
      { in: [[1, 2, 3], 5], out: 3 },
      { in: [[2], 1], out: 2 },
      { in: [[5, 10, 10], 9] },
      { in: [[10000000], 10000000] },
      { in: [[3, 3, 8], 6] },
    ],
    ref: `class Solution {
    public long minimumTime(int[] time, int totalTrips) {
        long lo = 1, hi = Long.MAX_VALUE / 2;
        int fastest = Integer.MAX_VALUE;
        for (int t : time) fastest = Math.min(fastest, t);
        hi = (long) fastest * totalTrips;
        while (lo < hi) {
            long mid = lo + (hi - lo) / 2, trips = 0;
            for (int t : time) { trips += mid / t; if (trips >= totalTrips) break; }
            if (trips >= totalTrips) hi = mid; else lo = mid + 1;
        }
        return lo;
    }
}`,
  },
  {
    slug: 'magnetic-force-between-two-balls', title: 'Magnetic Force Between Two Balls', level: 'Medium',
    summary: 'Place m balls into baskets at the given positions to maximise the smallest distance between any two balls. Return that distance.',
    method: 'maxDistance', params: [['int[]', 'position'], ['int', 'm']], returns: 'int',
    tests: [
      { in: [[1, 2, 3, 4, 7], 3], out: 3 },
      { in: [[5, 4, 3, 2, 1, 1000000000], 2], out: 999999999 },
      { in: [[1, 2], 2] },
      { in: [[1, 3, 6, 10, 15, 21], 4] },
      { in: [[79, 74, 57, 22], 4] },
    ],
    ref: `class Solution {
    public int maxDistance(int[] position, int m) {
        Arrays.sort(position);
        int lo = 1, hi = position[position.length - 1] - position[0];
        while (lo < hi) {
            int mid = lo + (hi - lo + 1) / 2, placed = 1, last = position[0];
            for (int p : position) if (p - last >= mid) { placed++; last = p; }
            if (placed >= m) lo = mid; else hi = mid - 1;
        }
        return lo;
    }
}`,
  },
  {
    slug: 'split-array-largest-sum', title: 'Split Array Largest Sum', level: 'Hard',
    summary: 'Split the array into k non-empty contiguous parts so the largest part sum is as small as possible. Return that sum.',
    method: 'splitArray', params: [['int[]', 'nums'], ['int', 'k']], returns: 'int',
    tests: [
      { in: [[7, 2, 5, 10, 8], 2], out: 18 },
      { in: [[1, 2, 3, 4, 5], 2], out: 9 },
      { in: [[1, 4, 4], 3], out: 4 },
      { in: [[10], 1] },
      { in: [[2, 3, 1, 2, 4, 3], 5] },
    ],
    ref: `class Solution {
    public int splitArray(int[] nums, int k) {
        int lo = 0, hi = 0;
        for (int x : nums) { lo = Math.max(lo, x); hi += x; }
        while (lo < hi) {
            int mid = (lo + hi) >>> 1, parts = 1, sum = 0;
            for (int x : nums) { if (sum + x > mid) { parts++; sum = 0; } sum += x; }
            if (parts <= k) hi = mid; else lo = mid + 1;
        }
        return lo;
    }
}`,
  },
];
