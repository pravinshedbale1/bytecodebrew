var NestedIterator = function(nestedList) {
    this.vals = [];
    const go = (items) => { for (const x of items) if (x.isInteger()) this.vals.push(x.getInteger()); else go(x.getList()); };
    go(nestedList);
    this.i = 0;
};

NestedIterator.prototype.hasNext = function() {
    return this.i < this.vals.length;
};

NestedIterator.prototype.next = function() {
    return this.vals[this.i++];
};
