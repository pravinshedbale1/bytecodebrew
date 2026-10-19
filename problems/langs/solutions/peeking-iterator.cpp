class PeekingIterator : public Iterator {
    bool has;
    int nxt;
public:
    PeekingIterator(const vector<int>& nums) : Iterator(nums) {
        has = Iterator::hasNext();
        if (has) nxt = Iterator::next();
    }

    int peek() { return nxt; }

    int next() {
        int r = nxt;
        has = Iterator::hasNext();
        if (has) nxt = Iterator::next();
        return r;
    }

    bool hasNext() const { return has; }
};
