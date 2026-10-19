class NestedIterator:
    def __init__(self, nestedList: [NestedInteger]):
        self.vals = []
        def go(items):
            for x in items:
                if x.isInteger():
                    self.vals.append(x.getInteger())
                else:
                    go(x.getList())
        go(nestedList)
        self.i = 0

    def next(self) -> int:
        self.i += 1
        return self.vals[self.i - 1]

    def hasNext(self) -> bool:
        return self.i < len(self.vals)
