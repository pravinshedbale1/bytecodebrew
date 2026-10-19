class Solution {
public:
    vector<bool> checkIfPrerequisite(int numCourses, vector<vector<int>>& prerequisites, vector<vector<int>>& queries) {
        int n = numCourses;
        vector<vector<bool>> reach(n, vector<bool>(n));
        for (auto& p : prerequisites) reach[p[0]][p[1]] = true;
        for (int k = 0; k < n; k++) for (int i = 0; i < n; i++) if (reach[i][k]) for (int j = 0; j < n; j++) if (reach[k][j]) reach[i][j] = true;
        vector<bool> out;
        for (auto& q : queries) out.push_back(reach[q[0]][q[1]]);
        return out;
    }
};
