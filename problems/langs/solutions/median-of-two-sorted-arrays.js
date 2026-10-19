var findMedianSortedArrays = function(nums1, nums2) {
    const c = [...nums1, ...nums2].sort((a, b) => a - b);
    const n = c.length;
    return n % 2 ? c[n >> 1] : (c[n / 2 - 1] + c[n / 2]) / 2;
};
