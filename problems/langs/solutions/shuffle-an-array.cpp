class Solution {
    vector<int> orig;
public:
    Solution(vector<int>& nums) : orig(nums) {}
    vector<int> reset() { return orig; }
    vector<int> shuffle() {
        vector<int> a = orig;
        for (int i = (int) a.size() - 1; i > 0; i--) swap(a[i], a[rand() % (i + 1)]);
        return a;
    }
};
