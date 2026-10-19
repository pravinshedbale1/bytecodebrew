class Solution:
    def solve(self, board: List[List[str]]) -> None:
        m, n = len(board), len(board[0])
        def mark(i, j):
            if 0 <= i < m and 0 <= j < n and board[i][j] == 'O':
                board[i][j] = '#'
                mark(i + 1, j); mark(i - 1, j); mark(i, j + 1); mark(i, j - 1)
        for i in range(m):
            mark(i, 0); mark(i, n - 1)
        for j in range(n):
            mark(0, j); mark(m - 1, j)
        for row in board:
            for j, c in enumerate(row):
                row[j] = 'O' if c == '#' else 'X'
