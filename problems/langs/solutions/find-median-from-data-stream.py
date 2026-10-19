class MedianFinder:

    def __init__(self):
        self.lo, self.hi = [], []

    def addNum(self, num: int) -> None:
        heappush(self.hi, -heappushpop(self.lo, -num))
        if len(self.hi) > len(self.lo):
            heappush(self.lo, -heappop(self.hi))

    def findMedian(self) -> float:
        return -self.lo[0] if len(self.lo) > len(self.hi) else (self.hi[0] - self.lo[0]) / 2
