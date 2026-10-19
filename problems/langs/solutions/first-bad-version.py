class Solution:
    def firstBadVersion(self, n: int) -> int:
        lo, hi = 1, n
        while lo < hi:
            m = (lo + hi) // 2
            if isBadVersion(m):
                hi = m
            else:
                lo = m + 1
        return lo
