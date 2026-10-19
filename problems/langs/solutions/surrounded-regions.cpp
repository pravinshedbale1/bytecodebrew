class Solution {
    void mark(vector<vector<char>>& b, int i, int j) {
        if (i < 0 || j < 0 || i >= (int) b.size() || j >= (int) b[0].size() || b[i][j] != 'O') return;
        b[i][j] = '#';
        mark(b, i + 1, j); mark(b, i - 1, j); mark(b, i, j + 1); mark(b, i, j - 1);
    }
public:
    void solve(vector<vector<char>>& board) {
        int m = board.size(), n = m ? board[0].size() : 0;
        for (int i = 0; i < m; i++) { mark(board, i, 0); mark(board, i, n - 1); }
        for (int j = 0; j < n; j++) { mark(board, 0, j); mark(board, m - 1, j); }
        for (auto& row : board) for (auto& c : row) c = c == '#' ? 'O' : 'X';
    }
};
