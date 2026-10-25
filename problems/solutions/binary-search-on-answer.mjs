const r = String.raw;

export default {
  'koko-eating-bananas': {
    pattern: 'Binary search on the answer (smallest speed for which a monotone check passes)',
    approaches: [
      {
        level: 'Brute force', name: 'Try every speed from 1 upwards',
        idea: 'At speed `k`, pile `p` takes `ceil(p / k)` hours. Try k = 1, 2, 3, … and return the first speed whose total hours fit in `h`.',
        steps: [
          'For `k = 1, 2, …` up to the largest pile:',
          'Add up `ceil(p / k)` over all piles (as a 64-bit number).',
          'Return the first `k` whose total is at most `h` (the largest pile always works, since then every pile takes 1 hour and `h >= piles.length`).',
        ],
        time: 'O(n·M)', space: 'O(1)',
        why: 'M is the largest pile (up to 10⁹); each speed costs a pass over the n piles.',
        timesOut: [3, 'generated'],
        code: {
          java: r`class Solution {
    public int minEatingSpeed(int[] piles, int h) {
        for (int k = 1; ; k++) {
            long hours = 0;
            for (int p : piles) hours += (p + k - 1) / k;
            if (hours <= h) return k;
        }
    }
}`,
          cpp: r`class Solution {
public:
    int minEatingSpeed(vector<int>& piles, int h) {
        for (long long k = 1; ; k++) {
            long long hours = 0;
            for (int p : piles) hours += (p + k - 1) / k;
            if (hours <= h) return (int) k;
        }
    }
};`,
          python: r`class Solution:
    def minEatingSpeed(self, piles: List[int], h: int) -> int:
        k = 1
        while sum((p + k - 1) // k for p in piles) > h:
            k += 1
        return k`,
          javascript: r`var minEatingSpeed = function(piles, h) {
    for (let k = 1; ; k++) {
        let hours = 0;
        for (const p of piles) hours += Math.ceil(p / k);
        if (hours <= h) return k;
    }
};`,
        },
      },
      {
        level: 'Optimal', name: 'Binary search the speed',
        idea: 'A faster speed never needs more hours, so "can finish within h" is false for small speeds and true from some speed on. Binary search for the first speed where it is true.',
        steps: [
          'Search `k` in `[1, max(piles)]`.',
          '`mid` is feasible if `sum(ceil(p / mid)) <= h`.',
          'If feasible, the answer is `mid` or smaller: `hi = mid`; otherwise `lo = mid + 1`.',
          'Return `lo`.',
        ],
        time: 'O(n log M)', space: 'O(1)',
        why: 'About log₂(10⁹) ≈ 30 checks, each a pass over n piles. `ceil(p / k)` is computed as `(p + k − 1) / k` in integers; the hour total needs 64 bits.',
        code: {
          java: r`class Solution {
    public int minEatingSpeed(int[] piles, int h) {
        int lo = 1, hi = 0;
        for (int p : piles) hi = Math.max(hi, p);
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            long hours = 0;
            for (int p : piles) hours += (p + (long) mid - 1) / mid;
            if (hours <= h) hi = mid; else lo = mid + 1;
        }
        return lo;
    }
}`,
          cpp: r`class Solution {
public:
    int minEatingSpeed(vector<int>& piles, int h) {
        int lo = 1, hi = *max_element(piles.begin(), piles.end());
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            long long hours = 0;
            for (int p : piles) hours += (p + (long long) mid - 1) / mid;
            if (hours <= h) hi = mid; else lo = mid + 1;
        }
        return lo;
    }
};`,
          python: r`class Solution:
    def minEatingSpeed(self, piles: List[int], h: int) -> int:
        lo, hi = 1, max(piles)
        while lo < hi:
            mid = (lo + hi) // 2
            if sum((p + mid - 1) // mid for p in piles) <= h:
                hi = mid
            else:
                lo = mid + 1
        return lo`,
          javascript: r`var minEatingSpeed = function(piles, h) {
    let lo = 1, hi = Math.max(...piles);
    while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        let hours = 0;
        for (const p of piles) hours += Math.ceil(p / mid);
        if (hours <= h) hi = mid; else lo = mid + 1;
    }
    return lo;
};`,
        },
      },
    ],
  },

  'find-the-smallest-divisor-given-a-threshold': {
    pattern: 'Binary search on the answer (the rounded-up sum only shrinks as the divisor grows)',
    approaches: [
      {
        level: 'Brute force', name: 'Try every divisor from 1 upwards',
        idea: 'Compute the rounded-up sum for d = 1, 2, 3, … and return the first d whose sum is within the threshold.',
        steps: [
          'For `d = 1, 2, …`: compute `sum(ceil(x / d))`.',
          'Return the first `d` with sum `<= threshold`.',
          'It stops by `d = max(nums)` at the latest, where every term is 1 and the sum is `n <= threshold`.',
        ],
        time: 'O(n·M)', space: 'O(1)',
        why: 'M = max(nums) candidates (up to 10⁶), each costing a pass over n values.',
        code: {
          java: r`class Solution {
    public int smallestDivisor(int[] nums, int threshold) {
        for (int d = 1; ; d++) {
            long sum = 0;
            for (int x : nums) sum += (x + d - 1) / d;
            if (sum <= threshold) return d;
        }
    }
}`,
          cpp: r`class Solution {
public:
    int smallestDivisor(vector<int>& nums, int threshold) {
        for (int d = 1; ; d++) {
            long long sum = 0;
            for (int x : nums) sum += (x + d - 1) / d;
            if (sum <= threshold) return d;
        }
    }
};`,
          python: r`class Solution:
    def smallestDivisor(self, nums: List[int], threshold: int) -> int:
        d = 1
        while sum((x + d - 1) // d for x in nums) > threshold:
            d += 1
        return d`,
          javascript: r`var smallestDivisor = function(nums, threshold) {
    for (let d = 1; ; d++) {
        let sum = 0;
        for (const x of nums) sum += Math.ceil(x / d);
        if (sum <= threshold) return d;
    }
};`,
        },
      },
      {
        level: 'Optimal', name: 'Binary search the divisor',
        idea: 'A larger divisor never increases the rounded-up sum, so "sum ≤ threshold" flips from false to true exactly once. Binary search for that point.',
        steps: [
          'Search `d` in `[1, max(nums)]`.',
          'If `sum(ceil(x / mid)) <= threshold`, set `hi = mid`; else `lo = mid + 1`.',
          'Return `lo`.',
        ],
        time: 'O(n log M)', space: 'O(1)',
        why: 'About 20 checks for M = 10⁶, each O(n).',
        code: {
          java: r`class Solution {
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
          cpp: r`class Solution {
public:
    int smallestDivisor(vector<int>& nums, int threshold) {
        int lo = 1, hi = *max_element(nums.begin(), nums.end());
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            long long sum = 0;
            for (int x : nums) sum += (x + mid - 1) / mid;
            if (sum <= threshold) hi = mid; else lo = mid + 1;
        }
        return lo;
    }
};`,
          python: r`class Solution:
    def smallestDivisor(self, nums: List[int], threshold: int) -> int:
        lo, hi = 1, max(nums)
        while lo < hi:
            mid = (lo + hi) // 2
            if sum((x + mid - 1) // mid for x in nums) <= threshold:
                hi = mid
            else:
                lo = mid + 1
        return lo`,
          javascript: r`var smallestDivisor = function(nums, threshold) {
    let lo = 1, hi = Math.max(...nums);
    while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        let sum = 0;
        for (const x of nums) sum += Math.ceil(x / mid);
        if (sum <= threshold) hi = mid; else lo = mid + 1;
    }
    return lo;
};`,
        },
      },
    ],
  },

  'capacity-to-ship-packages-within-d-days': {
    pattern: 'Binary search on the answer with a greedy feasibility check',
    approaches: [
      {
        level: 'Brute force', name: 'Try every capacity from the heaviest package up',
        idea: 'The capacity must be at least the heaviest package. Try each capacity from there and simulate loading greedily; the first that ships in time is the answer.',
        steps: [
          'For `cap` from `max(weights)` up to `sum(weights)`:',
          'Simulate: fill the current day until the next package would exceed `cap`, then start a new day; count the days.',
          'Return the first `cap` needing at most `days` days.',
        ],
        time: 'O(n·S)', space: 'O(1)',
        why: 'Up to S = sum(weights) capacities (about 2.5 × 10⁷ here), each simulated in O(n).',
        code: {
          java: r`class Solution {
    public int shipWithinDays(int[] weights, int days) {
        int max = 0;
        for (int w : weights) max = Math.max(max, w);
        for (int cap = max; ; cap++) if (daysNeeded(weights, cap) <= days) return cap;
    }

    private int daysNeeded(int[] weights, int cap) {
        int d = 1, load = 0;
        for (int w : weights) {
            if (load + w > cap) { d++; load = 0; }
            load += w;
        }
        return d;
    }
}`,
          cpp: r`class Solution {
    int daysNeeded(vector<int>& weights, int cap) {
        int d = 1, load = 0;
        for (int w : weights) {
            if (load + w > cap) { d++; load = 0; }
            load += w;
        }
        return d;
    }
public:
    int shipWithinDays(vector<int>& weights, int days) {
        for (int cap = *max_element(weights.begin(), weights.end()); ; cap++)
            if (daysNeeded(weights, cap) <= days) return cap;
    }
};`,
          python: r`class Solution:
    def shipWithinDays(self, weights: List[int], days: int) -> int:
        def days_needed(cap):
            d, load = 1, 0
            for w in weights:
                if load + w > cap:
                    d += 1
                    load = 0
                load += w
            return d
        cap = max(weights)
        while days_needed(cap) > days:
            cap += 1
        return cap`,
          javascript: r`var shipWithinDays = function(weights, days) {
    const daysNeeded = (cap) => {
        let d = 1, load = 0;
        for (const w of weights) {
            if (load + w > cap) { d++; load = 0; }
            load += w;
        }
        return d;
    };
    let cap = Math.max(...weights);
    while (daysNeeded(cap) > days) cap++;
    return cap;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Binary search the capacity',
        idea: 'More capacity never needs more days, so the check flips once. Search between the heaviest package (smallest possible) and the total weight (ships everything in one day).',
        steps: [
          'Set `lo = max(weights)`, `hi = sum(weights)`.',
          'For `mid`, count the days the greedy loading needs.',
          'If that is `<= days`, set `hi = mid`; otherwise `lo = mid + 1`.',
          'Return `lo`.',
        ],
        time: 'O(n log S)', space: 'O(1)',
        why: 'About log₂(S) ≈ 25 simulations of O(n) each. Greedy loading is optimal for a fixed capacity: sailing later can never help, since order is fixed.',
        code: {
          java: r`class Solution {
    public int shipWithinDays(int[] weights, int days) {
        int lo = 0, hi = 0;
        for (int w : weights) { lo = Math.max(lo, w); hi += w; }
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2, d = 1, load = 0;
            for (int w : weights) {
                if (load + w > mid) { d++; load = 0; }
                load += w;
            }
            if (d <= days) hi = mid; else lo = mid + 1;
        }
        return lo;
    }
}`,
          cpp: r`class Solution {
public:
    int shipWithinDays(vector<int>& weights, int days) {
        int lo = 0, hi = 0;
        for (int w : weights) { lo = max(lo, w); hi += w; }
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2, d = 1, load = 0;
            for (int w : weights) {
                if (load + w > mid) { d++; load = 0; }
                load += w;
            }
            if (d <= days) hi = mid; else lo = mid + 1;
        }
        return lo;
    }
};`,
          python: r`class Solution:
    def shipWithinDays(self, weights: List[int], days: int) -> int:
        lo, hi = max(weights), sum(weights)
        while lo < hi:
            mid = (lo + hi) // 2
            d, load = 1, 0
            for w in weights:
                if load + w > mid:
                    d += 1
                    load = 0
                load += w
            if d <= days:
                hi = mid
            else:
                lo = mid + 1
        return lo`,
          javascript: r`var shipWithinDays = function(weights, days) {
    let lo = 0, hi = 0;
    for (const w of weights) { lo = Math.max(lo, w); hi += w; }
    while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        let d = 1, load = 0;
        for (const w of weights) {
            if (load + w > mid) { d++; load = 0; }
            load += w;
        }
        if (d <= days) hi = mid; else lo = mid + 1;
    }
    return lo;
};`,
        },
      },
    ],
  },

  'minimum-number-of-days-to-make-m-bouquets': {
    pattern: 'Binary search on the day with a greedy count of adjacent bloomed runs',
    approaches: [
      {
        level: 'Brute force', name: 'Try each bloom day as the answer, earliest first',
        idea: 'The answer is always one of the bloom days (nothing new blooms between them). Sort the distinct bloom days and test each in turn by counting bouquets.',
        steps: [
          'If `m × k > n`, return −1: there are not enough flowers (compute in 64 bits).',
          'Sort the distinct values of `bloomDay`.',
          'For each day `d` in increasing order, walk the flowers counting runs of bloomed (`<= d`) flowers; every `k` in a row make a bouquet.',
          'Return the first `d` that gives at least `m` bouquets.',
        ],
        time: 'O(n²)', space: 'O(n)',
        why: 'Up to n distinct days, each checked in O(n), after an O(n log n) sort. The sorted list of days takes O(n).',
        code: {
          java: r`class Solution {
    public int minDays(int[] bloomDay, int m, int k) {
        if ((long) m * k > bloomDay.length) return -1;
        int[] days = Arrays.stream(bloomDay).distinct().sorted().toArray();
        for (int d : days) if (bouquets(bloomDay, d, k) >= m) return d;
        return -1;
    }

    private int bouquets(int[] bloomDay, int day, int k) {
        int made = 0, run = 0;
        for (int b : bloomDay) {
            run = b <= day ? run + 1 : 0;
            if (run == k) { made++; run = 0; }
        }
        return made;
    }
}`,
          cpp: r`class Solution {
    int bouquets(vector<int>& bloomDay, int day, int k) {
        int made = 0, run = 0;
        for (int b : bloomDay) {
            run = b <= day ? run + 1 : 0;
            if (run == k) { made++; run = 0; }
        }
        return made;
    }
public:
    int minDays(vector<int>& bloomDay, int m, int k) {
        if ((long long) m * k > (long long) bloomDay.size()) return -1;
        vector<int> days(bloomDay);
        sort(days.begin(), days.end());
        days.erase(unique(days.begin(), days.end()), days.end());
        for (int d : days) if (bouquets(bloomDay, d, k) >= m) return d;
        return -1;
    }
};`,
          python: r`class Solution:
    def minDays(self, bloomDay: List[int], m: int, k: int) -> int:
        if m * k > len(bloomDay):
            return -1
        def bouquets(day):
            made = run = 0
            for b in bloomDay:
                run = run + 1 if b <= day else 0
                if run == k:
                    made += 1
                    run = 0
            return made
        for d in sorted(set(bloomDay)):
            if bouquets(d) >= m:
                return d
        return -1`,
          javascript: r`var minDays = function(bloomDay, m, k) {
    if (m * k > bloomDay.length) return -1;
    const bouquets = (day) => {
        let made = 0, run = 0;
        for (const b of bloomDay) {
            run = b <= day ? run + 1 : 0;
            if (run === k) { made++; run = 0; }
        }
        return made;
    };
    for (const d of [...new Set(bloomDay)].sort((a, b) => a - b)) if (bouquets(d) >= m) return d;
    return -1;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Binary search the day',
        idea: 'Waiting longer never gives fewer bouquets, so "at least m bouquets by day d" flips from false to true once. Binary search the day between the earliest and latest bloom.',
        steps: [
          'If `m × k > n`, return −1 (64-bit multiply).',
          'Search `d` in `[min(bloomDay), max(bloomDay)]`.',
          'Count bouquets on day `mid` greedily (runs of `k` bloomed neighbours). If at least `m`, set `hi = mid`; else `lo = mid + 1`.',
          'Return `lo`.',
        ],
        time: 'O(n log D)', space: 'O(1)',
        why: 'D is the range of bloom days (up to 10⁹), so about 30 passes of O(n). Taking a bouquet as soon as a run reaches k is optimal: using the leftmost flowers never blocks a later bouquet.',
        code: {
          java: r`class Solution {
    public int minDays(int[] bloomDay, int m, int k) {
        if ((long) m * k > bloomDay.length) return -1;
        int lo = Integer.MAX_VALUE, hi = 0;
        for (int b : bloomDay) { lo = Math.min(lo, b); hi = Math.max(hi, b); }
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2, made = 0, run = 0;
            for (int b : bloomDay) {
                run = b <= mid ? run + 1 : 0;
                if (run == k) { made++; run = 0; }
            }
            if (made >= m) hi = mid; else lo = mid + 1;
        }
        return lo;
    }
}`,
          cpp: r`class Solution {
public:
    int minDays(vector<int>& bloomDay, int m, int k) {
        if ((long long) m * k > (long long) bloomDay.size()) return -1;
        int lo = *min_element(bloomDay.begin(), bloomDay.end()), hi = *max_element(bloomDay.begin(), bloomDay.end());
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2, made = 0, run = 0;
            for (int b : bloomDay) {
                run = b <= mid ? run + 1 : 0;
                if (run == k) { made++; run = 0; }
            }
            if (made >= m) hi = mid; else lo = mid + 1;
        }
        return lo;
    }
};`,
          python: r`class Solution:
    def minDays(self, bloomDay: List[int], m: int, k: int) -> int:
        if m * k > len(bloomDay):
            return -1
        lo, hi = min(bloomDay), max(bloomDay)
        while lo < hi:
            mid = (lo + hi) // 2
            made = run = 0
            for b in bloomDay:
                run = run + 1 if b <= mid else 0
                if run == k:
                    made += 1
                    run = 0
            if made >= m:
                hi = mid
            else:
                lo = mid + 1
        return lo`,
          javascript: r`var minDays = function(bloomDay, m, k) {
    if (m * k > bloomDay.length) return -1;
    let lo = Infinity, hi = 0;
    for (const b of bloomDay) { lo = Math.min(lo, b); hi = Math.max(hi, b); }
    while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        let made = 0, run = 0;
        for (const b of bloomDay) {
            run = b <= mid ? run + 1 : 0;
            if (run === k) { made++; run = 0; }
        }
        if (made >= m) hi = mid; else lo = mid + 1;
    }
    return lo;
};`,
        },
      },
    ],
  },

  'minimum-time-to-complete-trips': {
    pattern: 'Binary search on time (trips completed by time t = Σ ⌊t / time[i]⌋ only grows)',
    approaches: [
      {
        level: 'Brute force', name: 'Advance the clock one unit at a time',
        idea: 'By time `t`, bus `i` has finished `t / time[i]` trips (rounded down). Increase `t` from 1 until the total reaches `totalTrips`.',
        steps: [
          'For `t = 1, 2, 3, …`:',
          'Add up `t / time[i]` over all buses, stopping early once it reaches `totalTrips`.',
          'Return the first `t` whose total is at least `totalTrips`.',
        ],
        time: 'O(n·T)', space: 'O(1)',
        why: 'T is the answer itself, which can reach 10¹⁴ (one slow bus making 10⁷ trips).',
        timesOut: [3, 'generated'],
        code: {
          java: r`class Solution {
    public long minimumTime(int[] time, int totalTrips) {
        for (long t = 1; ; t++) {
            long trips = 0;
            for (int x : time) {
                trips += t / x;
                if (trips >= totalTrips) return t;
            }
        }
    }
}`,
          cpp: r`class Solution {
public:
    long long minimumTime(vector<int>& time, int totalTrips) {
        for (long long t = 1; ; t++) {
            long long trips = 0;
            for (int x : time) {
                trips += t / x;
                if (trips >= totalTrips) return t;
            }
        }
    }
};`,
          python: r`class Solution:
    def minimumTime(self, time: List[int], totalTrips: int) -> int:
        t = 1
        while sum(t // x for x in time) < totalTrips:
            t += 1
        return t`,
          javascript: r`var minimumTime = function(time, totalTrips) {
    for (let t = 1; ; t++) {
        let trips = 0;
        for (const x of time) {
            trips += Math.floor(t / x);
            if (trips >= totalTrips) return t;
        }
    }
};`,
        },
      },
      {
        level: 'Optimal', name: 'Binary search the time',
        idea: 'More time never means fewer trips, so binary search the first `t` with enough trips. The fastest bus alone finishes `totalTrips` trips by `min(time) × totalTrips`, which bounds the search.',
        steps: [
          'Set `lo = 1`, `hi = min(time) × totalTrips` (64-bit).',
          'For `mid`, add up `mid / time[i]`, stopping once it reaches `totalTrips` (this also prevents overflow).',
          'If enough, `hi = mid`; else `lo = mid + 1`.',
          'Return `lo`.',
        ],
        time: 'O(n log T)', space: 'O(1)',
        why: 'T ≤ 10¹⁴, so about 47 checks, each O(n). Stopping the sum early keeps it below 2·10⁷ + 10¹⁴, far from overflow.',
        code: {
          java: r`class Solution {
    public long minimumTime(int[] time, int totalTrips) {
        int fastest = Integer.MAX_VALUE;
        for (int x : time) fastest = Math.min(fastest, x);
        long lo = 1, hi = (long) fastest * totalTrips;
        while (lo < hi) {
            long mid = lo + (hi - lo) / 2, trips = 0;
            for (int x : time) {
                trips += mid / x;
                if (trips >= totalTrips) break;
            }
            if (trips >= totalTrips) hi = mid; else lo = mid + 1;
        }
        return lo;
    }
}`,
          cpp: r`class Solution {
public:
    long long minimumTime(vector<int>& time, int totalTrips) {
        long long lo = 1, hi = (long long) *min_element(time.begin(), time.end()) * totalTrips;
        while (lo < hi) {
            long long mid = lo + (hi - lo) / 2, trips = 0;
            for (int x : time) {
                trips += mid / x;
                if (trips >= totalTrips) break;
            }
            if (trips >= totalTrips) hi = mid; else lo = mid + 1;
        }
        return lo;
    }
};`,
          python: r`class Solution:
    def minimumTime(self, time: List[int], totalTrips: int) -> int:
        lo, hi = 1, min(time) * totalTrips
        while lo < hi:
            mid = (lo + hi) // 2
            if sum(mid // x for x in time) >= totalTrips:
                hi = mid
            else:
                lo = mid + 1
        return lo`,
          javascript: r`var minimumTime = function(time, totalTrips) {
    let lo = 1, hi = Math.min(...time) * totalTrips;
    while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        let trips = 0;
        for (const x of time) {
            trips += Math.floor(mid / x);
            if (trips >= totalTrips) break;
        }
        if (trips >= totalTrips) hi = mid; else lo = mid + 1;
    }
    return lo;
};`,
        },
      },
    ],
  },

  'magnetic-force-between-two-balls': {
    pattern: 'Binary search on the answer (largest gap for which greedy placement fits m balls)',
    approaches: [
      {
        level: 'Brute force', name: 'Try every distance from the largest possible down',
        idea: 'After sorting, a minimum gap `d` is possible if placing balls greedily (first basket, then the next basket at least `d` further) fits `m` balls. The gap can be at most `(last − first) / (m − 1)`; try every value from there downwards.',
        steps: [
          'Sort the positions.',
          'For `d` from `(pos[n − 1] − pos[0]) / (m − 1)` down to 1:',
          'Place greedily and count the balls; return the first `d` that fits `m` balls.',
        ],
        time: 'O(n·R)', space: 'O(1)',
        why: 'R = (largest − smallest) / (m − 1) candidates, each checked in O(n), plus the sort. When the answer is far below R this is far too slow.',
        code: {
          java: r`class Solution {
    public int maxDistance(int[] position, int m) {
        Arrays.sort(position);
        int n = position.length;
        for (int d = (position[n - 1] - position[0]) / (m - 1); d > 1; d--)
            if (fits(position, d, m)) return d;
        return 1;
    }

    private boolean fits(int[] pos, int d, int m) {
        int placed = 1, last = pos[0];
        for (int p : pos) if (p - last >= d) { placed++; last = p; }
        return placed >= m;
    }
}`,
          cpp: r`class Solution {
    bool fits(vector<int>& pos, int d, int m) {
        int placed = 1, last = pos[0];
        for (int p : pos) if (p - last >= d) { placed++; last = p; }
        return placed >= m;
    }
public:
    int maxDistance(vector<int>& position, int m) {
        sort(position.begin(), position.end());
        for (int d = (position.back() - position[0]) / (m - 1); d > 1; d--)
            if (fits(position, d, m)) return d;
        return 1;
    }
};`,
          python: r`class Solution:
    def maxDistance(self, position: List[int], m: int) -> int:
        position.sort()
        def fits(d):
            placed, last = 1, position[0]
            for p in position:
                if p - last >= d:
                    placed += 1
                    last = p
            return placed >= m
        d = (position[-1] - position[0]) // (m - 1)
        while d > 1 and not fits(d):
            d -= 1
        return d`,
          javascript: r`var maxDistance = function(position, m) {
    position.sort((a, b) => a - b);
    const fits = (d) => {
        let placed = 1, last = position[0];
        for (const p of position) if (p - last >= d) { placed++; last = p; }
        return placed >= m;
    };
    let d = Math.floor((position[position.length - 1] - position[0]) / (m - 1));
    while (d > 1 && !fits(d)) d--;
    return d;
};`,
        },
        timesOut: ['generated'],
      },
      {
        level: 'Optimal', name: 'Binary search the largest feasible gap',
        idea: 'If gap `d` is achievable, every smaller gap is too. So "fits m balls" is true up to some `d` and false after: binary search the last true value.',
        steps: [
          'Sort the positions. Search `d` in `[1, (pos[n − 1] − pos[0]) / (m − 1)]`.',
          'Use the upper middle `mid = lo + (hi − lo + 1) / 2`; check by greedy placement.',
          'If it fits, `lo = mid`; else `hi = mid − 1`.',
          'Return `lo`.',
        ],
        time: 'O(n log n + n log R)', space: 'O(1)',
        why: 'Sorting costs O(n log n) (plus its own stack); then about 30 greedy checks of O(n). Greedy placement is optimal for a fixed gap: putting each ball as far left as allowed leaves the most room for the rest.',
        code: {
          java: r`class Solution {
    public int maxDistance(int[] position, int m) {
        Arrays.sort(position);
        int n = position.length, lo = 1, hi = (position[n - 1] - position[0]) / (m - 1);
        while (lo < hi) {
            int mid = lo + (hi - lo + 1) / 2, placed = 1, last = position[0];
            for (int p : position) if (p - last >= mid) { placed++; last = p; }
            if (placed >= m) lo = mid; else hi = mid - 1;
        }
        return lo;
    }
}`,
          cpp: r`class Solution {
public:
    int maxDistance(vector<int>& position, int m) {
        sort(position.begin(), position.end());
        int lo = 1, hi = (position.back() - position[0]) / (m - 1);
        while (lo < hi) {
            int mid = lo + (hi - lo + 1) / 2, placed = 1, last = position[0];
            for (int p : position) if (p - last >= mid) { placed++; last = p; }
            if (placed >= m) lo = mid; else hi = mid - 1;
        }
        return lo;
    }
};`,
          python: r`class Solution:
    def maxDistance(self, position: List[int], m: int) -> int:
        position.sort()
        lo, hi = 1, (position[-1] - position[0]) // (m - 1)
        while lo < hi:
            mid = (lo + hi + 1) // 2
            placed, last = 1, position[0]
            for p in position:
                if p - last >= mid:
                    placed += 1
                    last = p
            if placed >= m:
                lo = mid
            else:
                hi = mid - 1
        return lo`,
          javascript: r`var maxDistance = function(position, m) {
    position.sort((a, b) => a - b);
    let lo = 1, hi = Math.floor((position[position.length - 1] - position[0]) / (m - 1));
    while (lo < hi) {
        const mid = lo + Math.floor((hi - lo + 1) / 2);
        let placed = 1, last = position[0];
        for (const p of position) if (p - last >= mid) { placed++; last = p; }
        if (placed >= m) lo = mid; else hi = mid - 1;
    }
    return lo;
};`,
        },
      },
    ],
  },

  'split-array-largest-sum': {
    pattern: 'Binary search on the answer with a greedy "how many parts?" check (or DP over split points)',
    approaches: [
      {
        level: 'Brute force', name: 'Try every way to place the k − 1 cuts',
        idea: 'Recursively choose where the first part ends, and solve the rest with one part fewer. The cost of a split is its largest part; keep the smallest cost.',
        steps: [
          '`best(i, parts)` = the smallest possible largest sum for `nums[i..]` cut into `parts` pieces.',
          'If `parts == 1`, it is the sum of `nums[i..]`.',
          'Otherwise try every end `j` for the first piece (leaving at least `parts − 1` elements), cost `max(sum(i..j), best(j + 1, parts − 1))`; take the minimum.',
        ],
        time: 'O(C(n − 1, k − 1)·n)', space: 'O(k)',
        why: 'There are C(n − 1, k − 1) ways to place the cuts and each is explored separately. Recursion depth is k.',
        code: {
          java: r`class Solution {
    public int splitArray(int[] nums, int k) {
        return best(nums, 0, k);
    }

    private int best(int[] nums, int i, int parts) {
        if (parts == 1) {
            int s = 0;
            for (int j = i; j < nums.length; j++) s += nums[j];
            return s;
        }
        int result = Integer.MAX_VALUE, first = 0;
        for (int j = i; j <= nums.length - parts; j++) {
            first += nums[j];
            result = Math.min(result, Math.max(first, best(nums, j + 1, parts - 1)));
        }
        return result;
    }
}`,
          cpp: r`class Solution {
    int best(vector<int>& nums, int i, int parts) {
        if (parts == 1) {
            int s = 0;
            for (int j = i; j < (int) nums.size(); j++) s += nums[j];
            return s;
        }
        int result = INT_MAX, first = 0;
        for (int j = i; j <= (int) nums.size() - parts; j++) {
            first += nums[j];
            result = min(result, max(first, best(nums, j + 1, parts - 1)));
        }
        return result;
    }
public:
    int splitArray(vector<int>& nums, int k) {
        return best(nums, 0, k);
    }
};`,
          python: r`class Solution:
    def splitArray(self, nums: List[int], k: int) -> int:
        n = len(nums)
        def best(i, parts):
            if parts == 1:
                return sum(nums[i:])
            result, first = inf, 0
            for j in range(i, n - parts + 1):
                first += nums[j]
                result = min(result, max(first, best(j + 1, parts - 1)))
            return result
        return best(0, k)`,
          javascript: r`var splitArray = function(nums, k) {
    const n = nums.length;
    const best = (i, parts) => {
        if (parts === 1) {
            let s = 0;
            for (let j = i; j < n; j++) s += nums[j];
            return s;
        }
        let result = Infinity, first = 0;
        for (let j = i; j <= n - parts; j++) {
            first += nums[j];
            result = Math.min(result, Math.max(first, best(j + 1, parts - 1)));
        }
        return result;
    };
    return best(0, k);
};`,
        },
      },
      {
        level: 'Better', name: 'Dynamic programming over (prefix, parts)',
        idea: 'The brute force solves the same subproblems many times. Let `dp[p][i]` = the best largest sum for the first `i` elements in `p` parts; the last part is `nums[j..i − 1]` for some `j`.',
        steps: [
          'Build prefix sums so any part sum is O(1).',
          '`dp[1][i] = prefix[i]`.',
          'For `p` from 2 to k and `i` from p to n: `dp[p][i] = min over j in [p − 1, i − 1] of max(dp[p − 1][j], prefix[i] − prefix[j])`.',
          'Return `dp[k][n]`.',
        ],
        time: 'O(k·n²)', space: 'O(k·n)',
        why: 'k·n states, each trying up to n split points: 50 × 10⁶ = 5 × 10⁷ steps at most here. Part sums reach 10⁹, so they fit in a 32-bit int, but prefix sums are kept in 64 bits for safety.',
        code: {
          java: r`class Solution {
    public int splitArray(int[] nums, int k) {
        int n = nums.length;
        long[] prefix = new long[n + 1];
        for (int i = 0; i < n; i++) prefix[i + 1] = prefix[i] + nums[i];
        long[][] dp = new long[k + 1][n + 1];
        for (int i = 1; i <= n; i++) dp[1][i] = prefix[i];
        for (int p = 2; p <= k; p++)
            for (int i = p; i <= n; i++) {
                dp[p][i] = Long.MAX_VALUE;
                for (int j = p - 1; j < i; j++)
                    dp[p][i] = Math.min(dp[p][i], Math.max(dp[p - 1][j], prefix[i] - prefix[j]));
            }
        return (int) dp[k][n];
    }
}`,
          cpp: r`class Solution {
public:
    int splitArray(vector<int>& nums, int k) {
        int n = nums.size();
        vector<long long> prefix(n + 1, 0);
        for (int i = 0; i < n; i++) prefix[i + 1] = prefix[i] + nums[i];
        vector<vector<long long>> dp(k + 1, vector<long long>(n + 1, LLONG_MAX));
        for (int i = 1; i <= n; i++) dp[1][i] = prefix[i];
        for (int p = 2; p <= k; p++)
            for (int i = p; i <= n; i++)
                for (int j = p - 1; j < i; j++)
                    dp[p][i] = min(dp[p][i], max(dp[p - 1][j], prefix[i] - prefix[j]));
        return (int) dp[k][n];
    }
};`,
          python: r`class Solution:
    def splitArray(self, nums: List[int], k: int) -> int:
        n = len(nums)
        prefix = [0]
        for x in nums:
            prefix.append(prefix[-1] + x)
        prev = prefix[:]  # one part: the whole prefix
        for p in range(2, k + 1):
            cur = [inf] * (n + 1)
            for i in range(p, n + 1):
                cur[i] = min(max(prev[j], prefix[i] - prefix[j]) for j in range(p - 1, i))
            prev = cur
        return prev[n]`,
          javascript: r`var splitArray = function(nums, k) {
    const n = nums.length, prefix = [0];
    for (const x of nums) prefix.push(prefix[prefix.length - 1] + x);
    let prev = prefix.slice();
    for (let p = 2; p <= k; p++) {
        const cur = new Array(n + 1).fill(Infinity);
        for (let i = p; i <= n; i++)
            for (let j = p - 1; j < i; j++)
                cur[i] = Math.min(cur[i], Math.max(prev[j], prefix[i] - prefix[j]));
        prev = cur;
    }
    return prev[n];
};`,
        },
      },
      {
        level: 'Optimal', name: 'Binary search the largest sum',
        idea: 'Turn it around: for a limit `L`, the fewest parts needed (cutting greedily whenever the next value would push the part over `L`) only goes down as `L` grows. Find the smallest `L` that needs at most `k` parts.',
        steps: [
          'Search `L` in `[max(nums), sum(nums)]`.',
          'Count parts greedily for `mid`: start a new part whenever the running sum would exceed `mid`.',
          'If at most `k` parts, `hi = mid`; else `lo = mid + 1`.',
          'Return `lo`. (Needing fewer than `k` parts is fine: a part can always be split further without raising the largest sum.)',
        ],
        time: 'O(n log S)', space: 'O(1)',
        why: 'S = sum(nums) ≤ 10⁹, so about 30 greedy passes of O(n).',
        code: {
          java: r`class Solution {
    public int splitArray(int[] nums, int k) {
        long lo = 0, hi = 0;
        for (int x : nums) { lo = Math.max(lo, x); hi += x; }
        while (lo < hi) {
            long mid = lo + (hi - lo) / 2, sum = 0;
            int parts = 1;
            for (int x : nums) {
                if (sum + x > mid) { parts++; sum = 0; }
                sum += x;
            }
            if (parts <= k) hi = mid; else lo = mid + 1;
        }
        return (int) lo;
    }
}`,
          cpp: r`class Solution {
public:
    int splitArray(vector<int>& nums, int k) {
        long long lo = 0, hi = 0;
        for (int x : nums) { lo = max(lo, (long long) x); hi += x; }
        while (lo < hi) {
            long long mid = lo + (hi - lo) / 2, sum = 0;
            int parts = 1;
            for (int x : nums) {
                if (sum + x > mid) { parts++; sum = 0; }
                sum += x;
            }
            if (parts <= k) hi = mid; else lo = mid + 1;
        }
        return (int) lo;
    }
};`,
          python: r`class Solution:
    def splitArray(self, nums: List[int], k: int) -> int:
        lo, hi = max(nums), sum(nums)
        while lo < hi:
            mid = (lo + hi) // 2
            parts, s = 1, 0
            for x in nums:
                if s + x > mid:
                    parts += 1
                    s = 0
                s += x
            if parts <= k:
                hi = mid
            else:
                lo = mid + 1
        return lo`,
          javascript: r`var splitArray = function(nums, k) {
    let lo = 0, hi = 0;
    for (const x of nums) { lo = Math.max(lo, x); hi += x; }
    while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        let parts = 1, sum = 0;
        for (const x of nums) {
            if (sum + x > mid) { parts++; sum = 0; }
            sum += x;
        }
        if (parts <= k) hi = mid; else lo = mid + 1;
    }
    return lo;
};`,
        },
      },
    ],
  },
};
