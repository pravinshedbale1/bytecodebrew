class LRUCache {
    int cap;
    list<pair<int, int>> order;
    unordered_map<int, list<pair<int, int>>::iterator> where;
public:
    LRUCache(int capacity) : cap(capacity) {}

    int get(int key) {
        auto it = where.find(key);
        if (it == where.end()) return -1;
        order.splice(order.begin(), order, it->second);
        return it->second->second;
    }

    void put(int key, int value) {
        auto it = where.find(key);
        if (it != where.end()) { it->second->second = value; order.splice(order.begin(), order, it->second); return; }
        if ((int) order.size() == cap) { where.erase(order.back().first); order.pop_back(); }
        order.emplace_front(key, value);
        where[key] = order.begin();
    }
};
