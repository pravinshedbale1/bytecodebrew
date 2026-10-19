class BSTIterator:

    def __init__(self, root: Optional[TreeNode]):
        self.st = []
        self._push(root)

    def _push(self, n):
        while n:
            self.st.append(n)
            n = n.left

    def next(self) -> int:
        n = self.st.pop()
        self._push(n.right)
        return n.val

    def hasNext(self) -> bool:
        return bool(self.st)
