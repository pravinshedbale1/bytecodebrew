class Solution:
    def myPow(self, x: float, n: int) -> float:
        if n < 0:
            x, n = 1 / x, -n
        r = 1.0
        while n:
            if n & 1:
                r *= x
            x *= x
            n >>= 1
        return r
