var Solution = function(head) {
    this.vals = [];
    for (; head; head = head.next) this.vals.push(head.val);
};

Solution.prototype.getRandom = function() {
    return this.vals[Math.floor(Math.random() * this.vals.length)];
};
