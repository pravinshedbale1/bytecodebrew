var solve = function(board) {
    const m = board.length, n = board[0].length;
    const mark = (i, j) => {
        if (i < 0 || j < 0 || i >= m || j >= n || board[i][j] !== 'O') return;
        board[i][j] = '#';
        mark(i + 1, j); mark(i - 1, j); mark(i, j + 1); mark(i, j - 1);
    };
    for (let i = 0; i < m; i++) { mark(i, 0); mark(i, n - 1); }
    for (let j = 0; j < n; j++) { mark(0, j); mark(m - 1, j); }
    for (const row of board) for (let j = 0; j < n; j++) row[j] = row[j] === '#' ? 'O' : 'X';
};
