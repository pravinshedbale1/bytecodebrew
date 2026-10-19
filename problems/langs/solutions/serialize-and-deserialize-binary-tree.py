class Codec:

    def serialize(self, root):
        out = []
        def go(n):
            if not n:
                out.append('#')
                return
            out.append(str(n.val))
            go(n.left)
            go(n.right)
        go(root)
        return ','.join(out)

    def deserialize(self, data):
        vals = iter(data.split(','))
        def go():
            v = next(vals)
            if v == '#':
                return None
            n = TreeNode(int(v))
            n.left = go()
            n.right = go()
            return n
        return go()
