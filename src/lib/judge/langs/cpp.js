import { lit, fill, extrasOf, linesIn, mapLines } from './common.js';

/**
 * C++ harness: the learner's LeetCode-style class between a prelude (headers, TreeNode, ListNode,
 * JSON parsing and formatting in namespace bcb) and a main that runs every test.
 */

const TYPES = {
  int: 'int', long: 'long long', double: 'double', boolean: 'bool', char: 'char', String: 'string', Integer: 'int', void: 'void',
  'int[]': 'vector<int>', 'long[]': 'vector<long long>', 'double[]': 'vector<double>', 'char[]': 'vector<char>', 'String[]': 'vector<string>',
  'int[][]': 'vector<vector<int>>', 'char[][]': 'vector<vector<char>>', 'String[][]': 'vector<vector<string>>',
  'List<Integer>': 'vector<int>', 'List<String>': 'vector<string>', 'List<List<Integer>>': 'vector<vector<int>>',
  'List<List<String>>': 'vector<vector<string>>', 'List<Boolean>': 'vector<bool>', 'List<Double>': 'vector<double>',
  TreeNode: 'TreeNode*', ListNode: 'ListNode*', 'ListNode[]': 'vector<ListNode*>', Node: 'Node*',
  'Iterator<Integer>': 'vector<int>', 'List<NestedInteger>': 'vector<NestedInteger>', MountainArray: 'MountainArray&',
};

function type(t) {
  const c = TYPES[t];
  if (!c) throw new Error(`Unsupported type for C++: ${t}`);
  return c;
}

const param = ([t, n]) => {
  if (t === 'Iterator<Integer>') return 'const vector<int>& nums';
  const c = type(t);
  return c.startsWith('vector') ? `${c}& ${n}` : `${c} ${n}`;
};
const sig = (ps) => ps.map(param).join(', ');

const PRELUDE = String.raw`#include <bits/stdc++.h>
#include <cxxabi.h>
using namespace std;

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};
struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};
`;

const CORE = String.raw`
namespace bcb {
struct J { int t = 0; bool b = false; long long i = 0; double d = 0; string s; vector<J> a; };   // t: 0 null, 1 bool, 2 number, 3 string, 4 array
inline void ws(const string& s, size_t& p) { while (p < s.size() && isspace((unsigned char) s[p])) p++; }
inline void utf8(string& o, unsigned c) {
    if (c < 0x80) o += (char) c;
    else if (c < 0x800) { o += (char) (0xC0 | (c >> 6)); o += (char) (0x80 | (c & 63)); }
    else if (c < 0x10000) { o += (char) (0xE0 | (c >> 12)); o += (char) (0x80 | ((c >> 6) & 63)); o += (char) (0x80 | (c & 63)); }
    else { o += (char) (0xF0 | (c >> 18)); o += (char) (0x80 | ((c >> 12) & 63)); o += (char) (0x80 | ((c >> 6) & 63)); o += (char) (0x80 | (c & 63)); }
}
inline J val(const string& s, size_t& p) {
    ws(s, p);
    J j;
    if (p >= s.size()) return j;
    char c = s[p];
    if (c == '[') {
        p++; j.t = 4; ws(s, p);
        if (p < s.size() && s[p] == ']') { p++; return j; }
        while (p < s.size()) { j.a.push_back(val(s, p)); ws(s, p); if (s[p++] == ']') break; }
        return j;
    }
    if (c == '"') {
        p++; j.t = 3;
        while (p < s.size()) {
            char d = s[p++];
            if (d == '"') break;
            if (d != '\\') { j.s += d; continue; }
            char e = s[p++];
            if (e == 'n') j.s += '\n'; else if (e == 't') j.s += '\t'; else if (e == 'r') j.s += '\r';
            else if (e == 'b') j.s += '\b'; else if (e == 'f') j.s += '\f';
            else if (e == 'u') {
                unsigned u = (unsigned) stoul(s.substr(p, 4), nullptr, 16); p += 4;
                if (u >= 0xD800 && u < 0xDC00 && s.compare(p, 2, "\\u") == 0) { unsigned lo = (unsigned) stoul(s.substr(p + 2, 4), nullptr, 16); p += 6; u = 0x10000 + ((u - 0xD800) << 10) + (lo - 0xDC00); }
                utf8(j.s, u);
            } else j.s += e;
        }
        return j;
    }
    if (s.compare(p, 4, "null") == 0) { p += 4; return j; }
    if (s.compare(p, 4, "true") == 0) { p += 4; j.t = 1; j.b = true; return j; }
    if (s.compare(p, 5, "false") == 0) { p += 5; j.t = 1; return j; }
    size_t st = p;
    while (p < s.size() && s[p] && strchr("+-0123456789.eE", s[p])) p++;
    string n = s.substr(st, p - st);
    j.t = 2;
    if (n.find_first_of(".eE") != string::npos) { j.d = stod(n); j.i = (long long) j.d; } else { j.i = stoll(n); j.d = (double) j.i; }
    return j;
}
inline J parse(const string& s) { size_t p = 0; return val(s, p); }

// ---- JSON to C++ values (plain overloads first, so the vector template finds them)
inline void cv(const J& j, int& o) { o = (int) j.i; }
inline void cv(const J& j, long long& o) { o = j.i; }
inline void cv(const J& j, double& o) { o = j.d; }
inline void cv(const J& j, bool& o) { o = j.b; }
inline void cv(const J& j, char& o) { o = j.s.empty() ? '\0' : j.s[0]; }
inline void cv(const J& j, string& o) { o = j.s; }
inline void cv(const J& j, TreeNode*& o) {
    o = nullptr;
    if (j.a.empty() || j.a[0].t == 0) return;
    o = new TreeNode((int) j.a[0].i);
    deque<TreeNode*> q{o};
    size_t i = 1;
    while (!q.empty() && i < j.a.size()) {
        TreeNode* n = q.front(); q.pop_front();
        if (i < j.a.size() && j.a[i].t != 0) { n->left = new TreeNode((int) j.a[i].i); q.push_back(n->left); } i++;
        if (i < j.a.size() && j.a[i].t != 0) { n->right = new TreeNode((int) j.a[i].i); q.push_back(n->right); } i++;
    }
}
inline void cv(const J& j, ListNode*& o) {
    ListNode d; ListNode* t = &d;
    for (const J& x : j.a) { t->next = new ListNode((int) x.i); t = t->next; }
    o = d.next;
}
template <class T> void cv(const J& j, vector<T>& o) { o.clear(); for (const J& x : j.a) { T v{}; cv(x, v); o.push_back(v); } }
template <class T> T as(const J& j) { T v{}; cv(j, v); return v; }
inline int I(const string& s) { return as<int>(parse(s)); }
inline TreeNode* tree(const string& s) { return as<TreeNode*>(parse(s)); }

// ---- C++ values to canonical JSON
struct Raw { string s; };
inline void str(string& o, const string& s) {
    o += '"';
    for (unsigned char c : s) {
        if (c == '"' || c == '\\') { o += '\\'; o += (char) c; }
        else if (c == '\n') o += "\\n";
        else if (c < 32) { char b[8]; snprintf(b, sizeof b, "\\u%04x", c); o += b; }
        else o += (char) c;
    }
    o += '"';
}
inline void f(string& o, const Raw& r) { o += r.s; }
inline void f(string& o, bool v) { o += v ? "true" : "false"; }
inline void f(string& o, char v) { str(o, string(1, v)); }
inline void f(string& o, const string& v) { str(o, v); }
inline void f(string& o, const char* v) { if (v) str(o, v); else o += "null"; }
inline void f(string& o, nullptr_t) { o += "null"; }
template <class T> enable_if_t<is_integral_v<T> && !is_same_v<T, bool> && !is_same_v<T, char>> f(string& o, T v) { o += to_string(v); }
template <class T> enable_if_t<is_floating_point_v<T>> f(string& o, T v) {
    double d = (double) v;
    if (std::isnan(d) || std::isinf(d)) { str(o, std::isnan(d) ? "NaN" : d > 0 ? "Infinity" : "-Infinity"); return; }
    char b[40];
    for (int p = 1; p <= 17; p++) { snprintf(b, sizeof b, "%.*g", p, d); if (strtod(b, nullptr) == d) break; }
    string s = b;
    if (s.find_first_of(".e") == string::npos) s += ".0";
    o += s;
}
inline void f(string& o, TreeNode* root) {
    vector<TreeNode*> level{root};
    vector<string> out;
    while (!level.empty() && out.size() < 2000000) {
        vector<TreeNode*> next; bool any = false;
        for (TreeNode* n : level) {
            if (!n) { out.push_back("null"); continue; }
            out.push_back(to_string(n->val)); next.push_back(n->left); next.push_back(n->right);
            if (n->left || n->right) any = true;
        }
        if (any) level = next; else level.clear();
    }
    while (!out.empty() && out.back() == "null") out.pop_back();
    o += '[';
    for (size_t k = 0; k < out.size(); k++) { if (k) o += ','; o += out[k]; }
    o += ']';
}
inline void f(string& o, ListNode* h) {
    o += '[';
    size_t k = 0; ListNode* n = h;
    for (; n && k < 2000000; n = n->next, k++) { if (k) o += ','; o += to_string(n->val); }
    if (n) o += ",\"…cycle\"";
    o += ']';
}
inline void f(string& o, const vector<bool>& v) { o += '['; for (size_t k = 0; k < v.size(); k++) { if (k) o += ','; f(o, (bool) v[k]); } o += ']'; }
template <class T> void f(string& o, const vector<T>& v) { o += '['; bool first = true; for (const auto& x : v) { if (!first) o += ','; first = false; f(o, x); } o += ']'; }
template <class A, class B> void f(string& o, const pair<A, B>& p) { o += '['; f(o, p.first); o += ','; f(o, p.second); o += ']'; }
template <class T> string F(const T& v) { string o; f(o, v); return o; }

inline void out(int i, const string& s) { cout << "\n\x01" "BCB|" << i << '|' << s << endl; }
inline void err(int i, string m) { replace(m.begin(), m.end(), '\n', ' '); cout << "\n\x01" "BCB|" << i << "|!" << m << "@L-1" << endl; }
inline string name(const std::type_info& t) {
    int st = 0; char* d = abi::__cxa_demangle(t.name(), nullptr, nullptr, &st);
    string n = st == 0 && d ? d : t.name(); free(d); return n;
}

// ---- helpers for custom drivers
inline TreeNode* find(TreeNode* n, int v) { if (!n) return nullptr; if (n->val == v) return n; TreeNode* l = find(n->left, v); return l ? l : find(n->right, v); }
inline ListNode* cycle(const string& s, int pos) {
    ListNode* h = as<ListNode*>(parse(s));
    if (pos < 0 || !h) return h;
    ListNode* t = h; ListNode* at = nullptr; int i = 0;
    while (true) { if (i == pos) at = t; if (!t->next) break; t = t->next; i++; }
    t->next = at; return h;
}
inline int indexOf(ListNode* h, ListNode* n) { int i = 0; for (ListNode* t = h; t && i < 100000; t = t->next, i++) if (t == n) return i; return -1; }
}
`;

/** Provided classes: `pre` goes before the learner's code, `comment` into the starter code. */
const EXTRAS = {
  TreeNode: {
    comment: `/**
 * Definition for a binary tree node.
 * struct TreeNode {
 *     int val;
 *     TreeNode *left;
 *     TreeNode *right;
 *     TreeNode() : val(0), left(nullptr), right(nullptr) {}
 *     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
 *     TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
 * };
 */`,
  },
  ListNode: {
    comment: `/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode() : val(0), next(nullptr) {}
 *     ListNode(int x) : val(x), next(nullptr) {}
 *     ListNode(int x, ListNode *next) : val(x), next(next) {}
 * };
 */`,
  },
  GraphNode: {
    pre: String.raw`
class Node {
public:
    int val;
    vector<Node*> neighbors;
    Node() { val = 0; neighbors = vector<Node*>(); }
    Node(int _val) { val = _val; neighbors = vector<Node*>(); }
    Node(int _val, vector<Node*> _neighbors) { val = _val; neighbors = _neighbors; }
};
namespace bcb {
inline Node* graph(const string& s) {
    J adj = parse(s);
    if (adj.a.empty()) return nullptr;
    vector<Node*> n(adj.a.size() + 1);
    for (size_t i = 1; i <= adj.a.size(); i++) n[i] = new Node((int) i);
    for (size_t i = 1; i <= adj.a.size(); i++) for (const J& x : adj.a[i - 1].a) n[i]->neighbors.push_back(n[x.i]);
    return n[1];
}
/** Adjacency list of the copy, or an error string if it shares nodes with the original. */
inline Raw graphDump(Node* copy, Node* original) {
    if (!copy) return {"[]"};
    set<Node*> orig; deque<Node*> q;
    if (original) { q.push_back(original); orig.insert(original); }
    while (!q.empty()) { Node* c = q.front(); q.pop_front(); for (Node* x : c->neighbors) if (orig.insert(x).second) q.push_back(x); }
    map<int, Node*> seen; q.push_back(copy); seen[copy->val] = copy;
    while (!q.empty()) {
        Node* c = q.front(); q.pop_front();
        if (orig.count(c)) return {F(string("copy shares nodes with the original"))};
        for (Node* x : c->neighbors) if (!seen.count(x->val)) { seen[x->val] = x; q.push_back(x); }
    }
    vector<vector<int>> out;
    for (auto& [v, c] : seen) { vector<int> row; for (Node* x : c->neighbors) row.push_back(x->val); out.push_back(row); }
    return {F(out)};
}
}
`,
    comment: `/*
// Definition for a Node.
class Node {
public:
    int val;
    vector<Node*> neighbors;
    Node() / Node(int _val) / Node(int _val, vector<Node*> _neighbors)
};
*/`,
  },
  NextNode: {
    pre: String.raw`
class Node {
public:
    int val;
    Node* left;
    Node* right;
    Node* next;
    Node() : val(0), left(NULL), right(NULL), next(NULL) {}
    Node(int _val) : val(_val), left(NULL), right(NULL), next(NULL) {}
    Node(int _val, Node* _left, Node* _right, Node* _next) : val(_val), left(_left), right(_right), next(_next) {}
};
namespace bcb {
inline Node* nextTree(const string& s) {
    J v = parse(s);
    if (v.a.empty() || v.a[0].t == 0) return nullptr;
    Node* root = new Node((int) v.a[0].i); deque<Node*> q{root}; size_t i = 1;
    while (!q.empty() && i < v.a.size()) {
        Node* n = q.front(); q.pop_front();
        if (i < v.a.size() && v.a[i].t != 0) { n->left = new Node((int) v.a[i].i); q.push_back(n->left); } i++;
        if (i < v.a.size() && v.a[i].t != 0) { n->right = new Node((int) v.a[i].i); q.push_back(n->right); } i++;
    }
    return root;
}
/** LeetCode's output: each level left to right via next pointers, then "#". */
inline vector<string> nextDump(Node* root) {
    vector<string> out; Node* start = root;
    while (start && out.size() < 2000000) {
        for (Node* n = start; n && out.size() < 2000000; n = n->next) out.push_back(to_string(n->val));
        out.push_back("#");
        Node* nxt = nullptr;
        for (Node* n = start; n && !nxt; n = n->next) nxt = n->left ? n->left : n->right;
        start = nxt;
    }
    return out;
}
}
`,
    comment: `/*
// Definition for a Node.
class Node {
public:
    int val;
    Node* left;
    Node* right;
    Node* next;
};
*/`,
  },
  NestedInteger: {
    pre: String.raw`
class NestedInteger {
public:
    bool bcbInt = false; int bcbVal = 0; vector<NestedInteger> bcbList;
    bool isInteger() const { return bcbInt; }
    int getInteger() const { return bcbVal; }
    const vector<NestedInteger>& getList() const { return bcbList; }
};
namespace bcb {
inline vector<NestedInteger> nested(const J& src) {
    vector<NestedInteger> out;
    for (const J& x : src.a) { NestedInteger n; if (x.t == 4) n.bcbList = nested(x); else { n.bcbInt = true; n.bcbVal = (int) x.i; } out.push_back(n); }
    return out;
}
inline vector<NestedInteger> nested(const string& s) { return nested(parse(s)); }
}
`,
    comment: `/**
 * This is the interface that allows for creating nested lists (provided).
 * class NestedInteger {
 *   public:
 *     bool isInteger() const;                          // true if this holds a single integer
 *     int getInteger() const;                          // the integer, if it holds one
 *     const vector<NestedInteger> &getList() const;    // the nested list, if it holds one
 * };
 */`,
  },
  Iterator: {
    pre: String.raw`
class Iterator {
    vector<int> bcbData; size_t bcbAt = 0;
public:
    Iterator(const vector<int>& nums) : bcbData(nums) {}
    Iterator(const Iterator& iter) = default;
    int next() { return bcbData.at(bcbAt++); }
    bool hasNext() const { return bcbAt < bcbData.size(); }
};
`,
    comment: `/*
 * Below is the interface for Iterator, which is already defined for you.
 * class Iterator {
 *   public:
 *     Iterator(const vector<int>& nums);
 *     Iterator(const Iterator& iter);
 *     int next();            // returns the next element
 *     bool hasNext() const;  // true if there are more elements
 * };
 */`,
  },
  VersionControl: {
    pre: 'int bcbBad = 0;\nbool isBadVersion(int version) { return version >= bcbBad; }\n',
    comment: '// The API isBadVersion is defined for you.\n// bool isBadVersion(int version);',
  },
  SolBase: {
    pre: 'int rand7() { static mt19937 g(7); return uniform_int_distribution<int>(1, 7)(g); }\n',
    comment: '// The rand7() API is already defined for you.\n// int rand7();\n// @return a random integer in the range 1 to 7',
  },
  GuessGame: {
    pre: 'int bcbPick = 0;\nint guess(int num) { return num > bcbPick ? -1 : num < bcbPick ? 1 : 0; }\n',
    comment: `/**
 * Forward declaration of guess API.
 * @param  num   your guess
 * @return       -1 if num is higher than the picked number
 *               1 if num is lower than the picked number
 *               otherwise return 0
 * int guess(int num);
 */`,
  },
  MountainArray: {
    pre: String.raw`
class MountainArray {
    vector<int> bcbA; int bcbCalls = 0;
public:
    MountainArray(vector<int> a) : bcbA(std::move(a)) {}
    int get(int index) {
        if (++bcbCalls > 100) throw runtime_error("more than 100 calls to MountainArray.get");
        return bcbA.at(index);
    }
    int length() { return (int) bcbA.size(); }
};
`,
    comment: `/**
 * // This is the MountainArray's API interface (provided).
 * // You should not implement it, or speculate about its implementation
 * class MountainArray {
 *   public:
 *     int get(int index);   // at most 100 calls in total
 *     int length();
 * };
 */`,
  },
  RandomNode: {
    pre: String.raw`
class Node {
public:
    int val;
    Node* next;
    Node* random;
    Node(int _val) { val = _val; next = NULL; random = NULL; }
};
namespace bcb {
inline Node* randomList(const string& s) {
    J v = parse(s);
    vector<Node*> n;
    for (const J& x : v.a) n.push_back(new Node((int) x.a.at(0).i));
    for (size_t i = 0; i < n.size(); i++) {
        if (i + 1 < n.size()) n[i]->next = n[i + 1];
        if (v.a[i].a.at(1).t != 0) n[i]->random = n.at(v.a[i].a[1].i);
    }
    return n.empty() ? nullptr : n[0];
}
/** The copy as [[val, randomIndex or null], …], or an error string if it shares nodes with the original. */
inline Raw randomDump(Node* copy, Node* original) {
    set<Node*> orig;
    for (Node* t = original; t; t = t->next) orig.insert(t);
    map<Node*, int> at; vector<Node*> order;
    for (Node* t = copy; t && order.size() < 100000; t = t->next) {
        if (orig.count(t)) return {F(string("copy shares nodes with the original"))};
        at[t] = (int) order.size(); order.push_back(t);
    }
    string o = "[";
    for (size_t k = 0; k < order.size(); k++) {
        Node* t = order[k];
        if (t->random && orig.count(t->random)) return {F(string("copy points into the original list"))};
        if (k) o += ',';
        o += "[" + to_string(t->val) + "," + (t->random ? to_string(at[t->random]) : string("null")) + "]";
    }
    return {o + "]"};
}
}
`,
    comment: `/*
// Definition for a Node.
class Node {
public:
    int val;
    Node* next;
    Node* random;

    Node(int _val) {
        val = _val;
        next = NULL;
        random = NULL;
    }
};
*/`,
  },
  QuadNode: {
    pre: String.raw`
class Node {
public:
    bool val;
    bool isLeaf;
    Node* topLeft;
    Node* topRight;
    Node* bottomLeft;
    Node* bottomRight;
    Node() : val(false), isLeaf(false), topLeft(NULL), topRight(NULL), bottomLeft(NULL), bottomRight(NULL) {}
    Node(bool _val, bool _isLeaf) : val(_val), isLeaf(_isLeaf), topLeft(NULL), topRight(NULL), bottomLeft(NULL), bottomRight(NULL) {}
    Node(bool _val, bool _isLeaf, Node* _topLeft, Node* _topRight, Node* _bottomLeft, Node* _bottomRight)
        : val(_val), isLeaf(_isLeaf), topLeft(_topLeft), topRight(_topRight), bottomLeft(_bottomLeft), bottomRight(_bottomRight) {}
};
namespace bcb {
/** LeetCode's level-order output: [isLeaf, val] per node (val shown as 1 on inner nodes, where it doesn't matter). */
inline Raw quadDump(Node* root) {
    vector<Node*> level{root}; vector<string> out;
    for (size_t i = 0; i < level.size() && i < 2000000; i++) {
        Node* n = level[i];
        if (!n) { out.push_back("null"); continue; }
        out.push_back(string("[") + (n->isLeaf ? "1" : "0") + "," + (n->isLeaf ? (n->val ? "1" : "0") : "1") + "]");
        if (n->isLeaf) for (int k = 0; k < 4; k++) level.push_back(nullptr);
        else { level.push_back(n->topLeft); level.push_back(n->topRight); level.push_back(n->bottomLeft); level.push_back(n->bottomRight); }
    }
    while (!out.empty() && out.back() == "null") out.pop_back();
    string o = "[";
    for (size_t k = 0; k < out.size(); k++) { if (k) o += ','; o += out[k]; }
    return {o + "]"};
}
}
`,
    comment: `/*
// Definition for a QuadTree node.
class Node {
public:
    bool val;
    bool isLeaf;
    Node* topLeft;
    Node* topRight;
    Node* bottomLeft;
    Node* bottomRight;

    Node() / Node(bool _val, bool _isLeaf)
    Node(bool _val, bool _isLeaf, Node* _topLeft, Node* _topRight, Node* _bottomLeft, Node* _bottomRight)
};
*/`,
  },
};

/** Drivers for odd signatures (the Java ones are `call` in the spec): set `r`, using `s` (a new Solution) and $0, $1… */
const CALLS = {
  'first-bad-version': 'bcbBad = bcb::I($1); auto r = s.firstBadVersion(bcb::I($0));',
  'lowest-common-ancestor-of-a-binary-search-tree': 'TreeNode* t = bcb::tree($0); TreeNode* c = s.lowestCommonAncestor(t, bcb::find(t, bcb::I($1)), bcb::find(t, bcb::I($2))); bcb::Raw r{c ? to_string(c->val) : "null"};',
  'lowest-common-ancestor-of-a-binary-tree': 'TreeNode* t = bcb::tree($0); TreeNode* c = s.lowestCommonAncestor(t, bcb::find(t, bcb::I($1)), bcb::find(t, bcb::I($2))); bcb::Raw r{c ? to_string(c->val) : "null"};',
  'flatten-nested-list-iterator': 'vector<NestedInteger> nl = bcb::nested($0); NestedIterator it(nl); vector<int> r; int guard = 0; while (it.hasNext() && guard++ < 100000) r.push_back(it.next());',
  'linked-list-cycle': 'auto r = s.hasCycle(bcb::cycle($0, bcb::I($1)));',
  'linked-list-cycle-ii': 'ListNode* h = bcb::cycle($0, bcb::I($1)); ListNode* c = s.detectCycle(h); int r = c ? bcb::indexOf(h, c) : -1;',
  'clone-graph': 'Node* orig = bcb::graph($0); bcb::Raw r = bcb::graphDump(s.cloneGraph(orig), orig);',
  'implement-rand10-using-rand7': 'vector<int> r; int n = bcb::I($0); for (int k = 0; k < n; k++) r.push_back(s.rand10());',
  'populating-next-right-pointers-in-each-node': 'vector<string> r = bcb::nextDump(s.connect(bcb::nextTree($0)));',
  'serialize-and-deserialize-binary-tree': 'Codec ser, deser; TreeNode* r = deser.deserialize(ser.serialize(bcb::tree($0)));',
  'guess-number-higher-or-lower': 'bcbPick = bcb::I($1); auto r = s.guessNumber(bcb::I($0));',
  'find-in-mountain-array': 'MountainArray m(bcb::as<vector<int>>(bcb::parse($0))); auto r = s.findInMountainArray(bcb::I($1), m);',
  'copy-list-with-random-pointer': 'Node* orig = bcb::randomList($0); bcb::Raw r = bcb::randomDump(s.copyRandomList(orig), orig);',
  'construct-quad-tree': 'vector<vector<int>> g = bcb::as<vector<vector<int>>>(bcb::parse($0)); bcb::Raw r = bcb::quadDump(s.construct(g));',
  'encode-and-decode-strings': 'vector<string> in = bcb::as<vector<string>>(bcb::parse($0)); Codec enc, dec; string wire = enc.encode(in); vector<string> r = dec.decode(wire);',
  'remove-element': 'vector<int> a = bcb::as<vector<int>>(bcb::parse($0)); int k = s.removeElement(a, bcb::I($1)); vector<int> f(a.begin(), a.begin() + max(0, min(k, (int) a.size()))); sort(f.begin(), f.end()); bcb::Raw r{"[" + to_string(k) + "," + bcb::F(f) + "]"};',
  'remove-duplicates-from-sorted-array': 'vector<int> a = bcb::as<vector<int>>(bcb::parse($0)); int k = s.removeDuplicates(a); bcb::Raw r{"[" + to_string(k) + "," + bcb::F(vector<int>(a.begin(), a.begin() + max(0, min(k, (int) a.size())))) + "]"};',
};

export function starter(spec) {
  const extras = extrasOf(spec);
  const comments = [...extras].map((n) => EXTRAS[n]?.comment).filter(Boolean);
  const head = comments.length ? `${comments.join('\n')}\n` : '';
  if (spec.design) {
    const { cls, ctor, methods } = spec.design;
    const peeking = spec.design.implements === 'Iterator<Integer>' && ctor.some(([t]) => t === 'Iterator<Integer>');
    const parts = [`    ${cls}(${sig(ctor)})${peeking ? ' : Iterator(nums)' : ''} {\n        \n    }`];
    for (const [ret, name, ps] of methods) parts.push(`    ${type(ret)} ${name}(${sig(ps)}) {\n        \n    }`);
    return `${head}class ${cls}${peeking ? ' : public Iterator' : ''} {\npublic:\n${parts.join('\n    \n')}\n};\n`;
  }
  const ps = spec.starterParams ?? spec.params;
  return `${head}class Solution {\npublic:\n    ${type(spec.returns)} ${spec.method}(${sig(ps)}) {\n        \n    }\n};\n`;
}

/** Declares and fills `a<k>` for each argument; returns the statements. */
const declare = (ps, src) => ps.map(([t], k) => `${type(t === 'Iterator<Integer>' ? 'List<Integer>' : t)} a${k}; bcb::cv(${src(k)}, a${k});`);

function functionBody(spec, test) {
  const lines = spec.design ? [] : ['auto* bcbS = new Solution(); Solution& s = *bcbS;'];
  const custom = CALLS[spec.slug];
  if (custom) return [...lines, fill(custom, test.in), 'bcb::out(I, bcb::F(r));'];
  if (spec.call) throw new Error(`No C++ driver for ${spec.slug}`);
  lines.push(...declare(spec.params, (k) => `bcb::parse(${lit(test.in[k])})`));
  const call = `s.${spec.method}(${spec.params.map((_, k) => `a${k}`).join(', ')})`;
  if (spec.returns === 'void') lines.push(`${call};`, `bcb::out(I, bcb::F(a${spec.output ?? 0}));`);
  else lines.push(`auto r = ${call};`, 'bcb::out(I, bcb::F(r));');
  return lines;
}

function designBody(spec, test) {
  const { cls, ctor, methods } = spec.design;
  const args = (ps) => declare(ps, (k) => `a.a.at(${k})`).join(' ');
  const names = (ps) => ps.map((_, k) => `a${k}`).join(', ');
  const cases = [`if (op == "${cls}") { ${args(ctor)} obj = new ${cls}(${names(ctor)}); res.push_back("null"); }`];
  for (const [ret, name, ps] of methods) {
    cases.push(ret === 'void'
      ? `else if (op == "${name}") { ${args(ps)} obj->${name}(${names(ps)}); res.push_back("null"); }`
      : `else if (op == "${name}") { ${args(ps)} res.push_back(bcb::F(obj->${name}(${names(ps)}))); }`);
  }
  return [
    `bcb::J ops = bcb::parse(${lit(test.in[0])}), args = bcb::parse(${lit(test.in[1])});`,
    `vector<string> res; ${cls}* obj = nullptr;`,
    'for (size_t k = 0; k < ops.a.size(); k++) {',
    '    const string& op = ops.a[k].s; const bcb::J& a = args.a.at(k);',
    ...cases.map((c) => `    ${c}`),
    '    else throw runtime_error("unknown operation " + op);',
    '}',
    'string r = "["; for (size_t k = 0; k < res.size(); k++) { if (k) r += ","; r += res[k]; } r += "]";',
    'bcb::out(I, r);',
  ];
}

export function build(spec, code, tests) {
  const extras = extrasOf(spec);
  const pre = [...extras].map((n) => EXTRAS[n]?.pre).filter(Boolean).join('');
  const prelude = `${PRELUDE}${CORE}${pre}\n`;
  const blocks = tests.map((test, i) => {
    const body = spec.design && !CALLS[spec.slug] ? designBody(spec, test) : functionBody(spec, test);
    return [
      '    {',
      `        const int I = ${i};`,
      '        try {',
      ...body.map((l) => `            ${l}`),
      '        } catch (const exception& e) { bcb::err(I, bcb::name(typeid(e)) + ": " + e.what()); }',
      '        catch (...) { bcb::err(I, "Exception"); }',
      '    }',
    ].join('\n');
  });
  const main = `\nstatic void bcbRun() {\n${blocks.join('\n')}\n}\n\nint main() {\n    bcbRun();\n    return 0;\n}\n`;
  return { source: `${prelude}${code}\n${main}`, lineOffset: linesIn(prelude), userLines: linesIn(`${code}\n`) };
}

/** GCC's messages point into main.cpp; show the learner's own line numbers. */
export function compileError(r, { lineOffset, userLines }) {
  if (!r.compile || r.ok || !/Compilation Error/i.test(r.status)) return null;
  return mapLines(r.compile.replace(/^[\w./-]*\.cpp: /gm, ''), /[\w./-]*\.cpp:(\d+):(\d+):/g, lineOffset, userLines, (n, m) => (n ? `Line ${n}:${m[2]}:` : 'judge code:'))
    .split('\n')
    .map((l) => l.replace(/^(\s*)(\d+)( \|)/, (_, sp, num, bar) => {
      const n = Number(num) - lineOffset;
      return n >= 1 && n <= userLines ? `${sp}${String(n).padStart(num.length)}${bar}` : `${sp}${' '.repeat(num.length)}${bar}`;
    }))
    .join('\n');
}

export const cleanStderr = (text) => text;

export default {
  id: 'cpp',
  label: 'C++',
  version: 'C++20 (GCC 14)',
  judge0: 105,
  compilerOptions: '-O2 -std=gnu++20',
  starter,
  build,
  compileError,
  cleanStderr,
  supports: (spec) => !spec.call || Boolean(CALLS[spec.slug]),
};
