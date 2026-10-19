class Solution {
public:
    long long minimumTime(vector<int>& time, int totalTrips) {
        long long lo = 1, hi = (long long) *min_element(time.begin(), time.end()) * totalTrips;
        while (lo < hi) {
            long long m = (lo + hi) / 2, trips = 0;
            for (int x : time) { trips += m / x; if (trips >= totalTrips) break; }
            if (trips >= totalTrips) hi = m; else lo = m + 1;
        }
        return lo;
    }
};
