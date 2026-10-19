class Solution:
    def leastInterval(self, tasks: List[str], n: int) -> int:
        f = Counter(tasks)
        mx = max(f.values())
        cnt = sum(1 for v in f.values() if v == mx)
        return max(len(tasks), (mx - 1) * (n + 1) + cnt)
