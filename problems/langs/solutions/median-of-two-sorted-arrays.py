class Solution:
    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:
        c = sorted(nums1 + nums2)
        n = len(c)
        return c[n // 2] if n % 2 else (c[n // 2 - 1] + c[n // 2]) / 2
