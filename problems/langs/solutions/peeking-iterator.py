class PeekingIterator:
    def __init__(self, iterator):
        self.it = iterator
        self.nxt = iterator.next() if iterator.hasNext() else None
        self.has = self.nxt is not None

    def peek(self):
        return self.nxt

    def next(self):
        r = self.nxt
        self.has = self.it.hasNext()
        self.nxt = self.it.next() if self.has else None
        return r

    def hasNext(self):
        return self.has
