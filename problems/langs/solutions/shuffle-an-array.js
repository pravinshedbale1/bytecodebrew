var Solution = function(nums) {
    this.orig = [...nums];
};

Solution.prototype.reset = function() {
    return [...this.orig];
};

Solution.prototype.shuffle = function() {
    const a = [...this.orig];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
};
