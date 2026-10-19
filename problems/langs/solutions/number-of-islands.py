class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        m, n = len(grid), len(grid[0])
        def sink(i, j):
            if 0 <= i < m and 0 <= j < n and grid[i][j] == '1':
                grid[i][j] = '0'
                sink(i + 1, j); sink(i - 1, j); sink(i, j + 1); sink(i, j - 1)
        count = 0
        for i in range(m):
            for j in range(n):
                if grid[i][j] == '1':
                    count += 1
                    sink(i, j)
        return count
