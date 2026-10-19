class Solution:
    def cloneGraph(self, node: Optional['Node']) -> Optional['Node']:
        copies = {}
        def clone(n):
            if n in copies:
                return copies[n]
            c = copies[n] = Node(n.val)
            c.neighbors = [clone(x) for x in n.neighbors]
            return c
        return clone(node) if node else None
