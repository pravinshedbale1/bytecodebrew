var PeekingIterator = function(iterator) {
    this.it = iterator;
    this.has = iterator.hasNext();
    this.nxt = this.has ? iterator.next() : null;
};

PeekingIterator.prototype.peek = function() {
    return this.nxt;
};

PeekingIterator.prototype.next = function() {
    const r = this.nxt;
    this.has = this.it.hasNext();
    this.nxt = this.has ? this.it.next() : null;
    return r;
};

PeekingIterator.prototype.hasNext = function() {
    return this.has;
};
