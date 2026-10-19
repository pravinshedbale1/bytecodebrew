var KthLargest = function(k, nums) {
    this.k = k;
    this.pq = new MinPriorityQueue();
    for (const x of nums) this.add(x);
};

KthLargest.prototype.add = function(val) {
    this.pq.enqueue(val);
    if (this.pq.size() > this.k) this.pq.dequeue();
    return this.pq.front();
};
