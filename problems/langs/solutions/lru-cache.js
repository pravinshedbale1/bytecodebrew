/**
 * @param {number} capacity
 */
var LRUCache = function(capacity) {
    this.cap = capacity;
    this.map = new Map();
};

LRUCache.prototype.get = function(key) {
    if (!this.map.has(key)) return -1;
    const v = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, v);
    return v;
};

LRUCache.prototype.put = function(key, value) {
    this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.cap) this.map.delete(this.map.keys().next().value);
};
