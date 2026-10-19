class Solution:
    def averageOfLevels(self, root: Optional[TreeNode]) -> List[float]:
        out, level = [], [root] if root else []
        while level:
            out.append(sum(n.val for n in level) / len(level))
            level = [c for n in level for c in (n.left, n.right) if c]
        return out
