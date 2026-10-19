class Solution {
    void sink(vector<vector<char>>& g, int i, int j) {
        if (i < 0 || j < 0 || i >= (int) g.size() || j >= (int) g[0].size() || g[i][j] != '1') return;
        g[i][j] = '0';
        sink(g, i + 1, j); sink(g, i - 1, j); sink(g, i, j + 1); sink(g, i, j - 1);
    }
public:
    int numIslands(vector<vector<char>>& grid) {
        int n = 0;
        for (int i = 0; i < (int) grid.size(); i++)
            for (int j = 0; j < (int) grid[i].size(); j++)
                if (grid[i][j] == '1') { n++; sink(grid, i, j); }
        return n;
    }
};
