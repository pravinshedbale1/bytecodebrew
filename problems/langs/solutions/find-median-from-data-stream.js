var MedianFinder = function() {
    this.lo = new MaxPriorityQueue();
    this.hi = new MinPriorityQueue();
};

MedianFinder.prototype.addNum = function(num) {
    this.lo.enqueue(num);
    this.hi.enqueue(this.lo.dequeue());
    if (this.hi.size() > this.lo.size()) this.lo.enqueue(this.hi.dequeue());
};

MedianFinder.prototype.findMedian = function() {
    return this.lo.size() > this.hi.size() ? this.lo.front() : (this.lo.front() + this.hi.front()) / 2;
};
