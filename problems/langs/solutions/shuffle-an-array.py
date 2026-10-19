class Solution:

    def __init__(self, nums: List[int]):
        self.orig = nums[:]

    def reset(self) -> List[int]:
        return self.orig[:]

    def shuffle(self) -> List[int]:
        a = self.orig[:]
        random.shuffle(a)
        return a
