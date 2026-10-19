// The API isBadVersion is defined for you.
// bool isBadVersion(int version);

class Solution {
public:
    int firstBadVersion(int n) {
        int lo = 1, hi = n;
        while (lo < hi) { int m = lo + (hi - lo) / 2; if (isBadVersion(m)) hi = m; else lo = m + 1; }
        return lo;
    }
};
