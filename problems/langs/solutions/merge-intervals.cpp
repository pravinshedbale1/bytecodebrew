class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        sort(intervals.begin(), intervals.end());
        vector<vector<int>> out;
        for (auto& x : intervals) {
            if (!out.empty() && out.back()[1] >= x[0]) out.back()[1] = max(out.back()[1], x[1]);
            else out.push_back(x);
        }
        return out;
    }
};
