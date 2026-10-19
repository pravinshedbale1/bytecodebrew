class Solution {
public:
    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
        vector<int> c;
        std::merge(nums1.begin(), nums1.end(), nums2.begin(), nums2.end(), back_inserter(c));
        int n = c.size();
        return n % 2 ? c[n / 2] : (c[n / 2 - 1] + (double) c[n / 2]) / 2;
    }
};
