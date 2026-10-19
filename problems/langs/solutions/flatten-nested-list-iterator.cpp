class NestedIterator {
    vector<int> vals;
    size_t i = 0;
    void flatten(const vector<NestedInteger>& l) {
        for (auto& x : l) if (x.isInteger()) vals.push_back(x.getInteger()); else flatten(x.getList());
    }
public:
    NestedIterator(vector<NestedInteger> &nestedList) { flatten(nestedList); }
    int next() { return vals[i++]; }
    bool hasNext() { return i < vals.size(); }
};
