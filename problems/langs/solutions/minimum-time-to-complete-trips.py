class Solution:
    def minimumTime(self, time: List[int], totalTrips: int) -> int:
        lo, hi = 1, min(time) * totalTrips
        while lo < hi:
            m = (lo + hi) // 2
            if sum(m // t for t in time) >= totalTrips:
                hi = m
            else:
                lo = m + 1
        return lo
