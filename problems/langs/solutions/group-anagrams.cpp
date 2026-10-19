class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        unordered_map<string, vector<string>> groups;
        for (auto& s : strs) { string k = s; sort(k.begin(), k.end()); groups[k].push_back(s); }
        vector<vector<string>> out;
        for (auto& [k, v] : groups) out.push_back(v);
        return out;
    }
};
