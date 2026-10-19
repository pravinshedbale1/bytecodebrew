class Solution:
    def connect(self, root: 'Optional[Node]') -> 'Optional[Node]':
        level = root
        while level and level.left:
            n = level
            while n:
                n.left.next = n.right
                if n.next:
                    n.right.next = n.next.left
                n = n.next
            level = level.left
        return root
