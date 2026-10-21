const r = String.raw;

export default {
  'implement-queue-using-stacks': {
    pattern: 'Two stacks: an input stack and an output stack, transferring lazily (amortised O(1))',
    approaches: [
      {
        level: 'Brute force', name: 'Keep the front on top by re-stacking on every push',
        idea: 'Keep one stack whose top is always the queue\'s front. To push, move everything to a helper stack, push the new value, and move everything back.',
        steps: [
          '`push(x)`: pop all of `s` onto `tmp`, push `x` onto `s`, then pop all of `tmp` back onto `s`.',
          '`pop` / `peek`: the top of `s`. `empty`: whether `s` is empty.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'push is O(n) every time (pop, peek and empty are O(1)).',
        code: {
          java: r`class MyQueue {
    private final Deque<Integer> s = new ArrayDeque<>(), tmp = new ArrayDeque<>();

    public void push(int x) {
        while (!s.isEmpty()) tmp.push(s.pop());
        s.push(x);
        while (!tmp.isEmpty()) s.push(tmp.pop());
    }

    public int pop() {
        return s.pop();
    }

    public int peek() {
        return s.peek();
    }

    public boolean empty() {
        return s.isEmpty();
    }
}`,
          cpp: r`class MyQueue {
    stack<int> s, tmp;
public:
    MyQueue() {}

    void push(int x) {
        while (!s.empty()) { tmp.push(s.top()); s.pop(); }
        s.push(x);
        while (!tmp.empty()) { s.push(tmp.top()); tmp.pop(); }
    }

    int pop() {
        int x = s.top();
        s.pop();
        return x;
    }

    int peek() {
        return s.top();
    }

    bool empty() {
        return s.empty();
    }
};`,
          python: r`class MyQueue:
    def __init__(self):
        self.s = []

    def push(self, x: int) -> None:
        tmp = []
        while self.s:
            tmp.append(self.s.pop())
        self.s.append(x)
        while tmp:
            self.s.append(tmp.pop())

    def pop(self) -> int:
        return self.s.pop()

    def peek(self) -> int:
        return self.s[-1]

    def empty(self) -> bool:
        return not self.s`,
          javascript: r`var MyQueue = function() {
    this.s = [];
};

MyQueue.prototype.push = function(x) {
    const tmp = [];
    while (this.s.length) tmp.push(this.s.pop());
    this.s.push(x);
    while (tmp.length) this.s.push(tmp.pop());
};

MyQueue.prototype.pop = function() {
    return this.s.pop();
};

MyQueue.prototype.peek = function() {
    return this.s[this.s.length - 1];
};

MyQueue.prototype.empty = function() {
    return this.s.length === 0;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Input and output stacks with lazy transfer',
        idea: 'Push onto `in`. Pop and peek from `out`; only when `out` is empty, pour all of `in` into it, which reverses the order so the oldest element ends up on top.',
        steps: [
          '`push(x)`: push onto `in`.',
          '`pop` / `peek`: if `out` is empty, move everything from `in` to `out`; then pop / read the top of `out`.',
          '`empty`: both stacks are empty.',
        ],
        time: 'O(1)', space: 'O(n)',
        why: 'Amortised O(1) per operation: each element is pushed and popped at most twice in total. A single pop can cost O(n) when a transfer happens.',
        code: {
          java: r`class MyQueue {
    private final Deque<Integer> in = new ArrayDeque<>(), out = new ArrayDeque<>();

    public void push(int x) {
        in.push(x);
    }

    public int pop() {
        peek();
        return out.pop();
    }

    public int peek() {
        if (out.isEmpty())
            while (!in.isEmpty()) out.push(in.pop());
        return out.peek();
    }

    public boolean empty() {
        return in.isEmpty() && out.isEmpty();
    }
}`,
          cpp: r`class MyQueue {
    stack<int> in, out;
public:
    MyQueue() {}

    void push(int x) {
        in.push(x);
    }

    int pop() {
        int x = peek();
        out.pop();
        return x;
    }

    int peek() {
        if (out.empty())
            while (!in.empty()) { out.push(in.top()); in.pop(); }
        return out.top();
    }

    bool empty() {
        return in.empty() && out.empty();
    }
};`,
          python: r`class MyQueue:
    def __init__(self):
        self.inbox, self.outbox = [], []

    def push(self, x: int) -> None:
        self.inbox.append(x)

    def pop(self) -> int:
        self.peek()
        return self.outbox.pop()

    def peek(self) -> int:
        if not self.outbox:
            while self.inbox:
                self.outbox.append(self.inbox.pop())
        return self.outbox[-1]

    def empty(self) -> bool:
        return not self.inbox and not self.outbox`,
          javascript: r`var MyQueue = function() {
    this.in = [];
    this.out = [];
};

MyQueue.prototype.push = function(x) {
    this.in.push(x);
};

MyQueue.prototype.pop = function() {
    this.peek();
    return this.out.pop();
};

MyQueue.prototype.peek = function() {
    if (this.out.length === 0) while (this.in.length) this.out.push(this.in.pop());
    return this.out[this.out.length - 1];
};

MyQueue.prototype.empty = function() {
    return this.in.length === 0 && this.out.length === 0;
};`,
        },
      },
    ],
  },

  'design-hashmap': {
    pattern: 'Hashing with separate chaining (an array of buckets)',
    approaches: [
      {
        level: 'Brute force', name: 'List of key–value pairs',
        idea: 'Keep all pairs in one list and search it linearly for every operation.',
        steps: [
          '`put`: find the key and update it, or append a new pair.',
          '`get` / `remove`: scan for the key.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'Every operation may scan all n stored pairs.',
        code: {
          java: r`class MyHashMap {
    private final List<int[]> pairs = new ArrayList<>();

    public void put(int key, int value) {
        for (int[] p : pairs) if (p[0] == key) { p[1] = value; return; }
        pairs.add(new int[] { key, value });
    }

    public int get(int key) {
        for (int[] p : pairs) if (p[0] == key) return p[1];
        return -1;
    }

    public void remove(int key) {
        pairs.removeIf(p -> p[0] == key);
    }
}`,
          cpp: r`class MyHashMap {
    vector<pair<int, int>> pairs;
public:
    MyHashMap() {}

    void put(int key, int value) {
        for (auto& p : pairs) if (p.first == key) { p.second = value; return; }
        pairs.push_back({key, value});
    }

    int get(int key) {
        for (auto& p : pairs) if (p.first == key) return p.second;
        return -1;
    }

    void remove(int key) {
        for (size_t i = 0; i < pairs.size(); i++)
            if (pairs[i].first == key) { pairs.erase(pairs.begin() + i); return; }
    }
};`,
          python: r`class MyHashMap:
    def __init__(self):
        self.pairs = []

    def put(self, key: int, value: int) -> None:
        for p in self.pairs:
            if p[0] == key:
                p[1] = value
                return
        self.pairs.append([key, value])

    def get(self, key: int) -> int:
        for k, v in self.pairs:
            if k == key:
                return v
        return -1

    def remove(self, key: int) -> None:
        self.pairs = [p for p in self.pairs if p[0] != key]`,
          javascript: r`var MyHashMap = function() {
    this.pairs = [];
};

MyHashMap.prototype.put = function(key, value) {
    for (const p of this.pairs) if (p[0] === key) { p[1] = value; return; }
    this.pairs.push([key, value]);
};

MyHashMap.prototype.get = function(key) {
    for (const [k, v] of this.pairs) if (k === key) return v;
    return -1;
};

MyHashMap.prototype.remove = function(key) {
    this.pairs = this.pairs.filter((p) => p[0] !== key);
};`,
        },
      },
      {
        level: 'Better', name: 'Direct addressing',
        idea: 'Keys are at most 10⁶, so use an array indexed by the key itself, with −1 meaning "absent".',
        steps: [
          'Allocate `table[0..10⁶]` filled with −1.',
          '`put`: `table[key] = value`; `get`: `table[key]`; `remove`: `table[key] = −1`.',
        ],
        time: 'O(1)', space: 'O(U)',
        why: 'Every operation is one array access, but memory is proportional to the key universe U = 10⁶ even if only a handful of keys are stored — and impossible for large key spaces.',
        code: {
          java: r`class MyHashMap {
    private final int[] table = new int[1_000_001];

    public MyHashMap() {
        Arrays.fill(table, -1);
    }

    public void put(int key, int value) {
        table[key] = value;
    }

    public int get(int key) {
        return table[key];
    }

    public void remove(int key) {
        table[key] = -1;
    }
}`,
          cpp: r`class MyHashMap {
    vector<int> table;
public:
    MyHashMap() : table(1000001, -1) {}

    void put(int key, int value) {
        table[key] = value;
    }

    int get(int key) {
        return table[key];
    }

    void remove(int key) {
        table[key] = -1;
    }
};`,
          python: r`class MyHashMap:
    def __init__(self):
        self.table = [-1] * 1000001

    def put(self, key: int, value: int) -> None:
        self.table[key] = value

    def get(self, key: int) -> int:
        return self.table[key]

    def remove(self, key: int) -> None:
        self.table[key] = -1`,
          javascript: r`var MyHashMap = function() {
    this.table = new Int32Array(1000001).fill(-1);
};

MyHashMap.prototype.put = function(key, value) {
    this.table[key] = value;
};

MyHashMap.prototype.get = function(key) {
    return this.table[key];
};

MyHashMap.prototype.remove = function(key) {
    this.table[key] = -1;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Buckets with separate chaining',
        idea: 'Hash each key to one of B buckets (`key % B`, B a prime) and keep a short list of pairs in each bucket. Keys that collide simply share a bucket.',
        steps: [
          'B = 10007 buckets, each a list of `(key, value)` pairs (created lazily).',
          '`put`: in bucket `key % B`, update the key if found, else append.',
          '`get` / `remove`: search only that bucket.',
        ],
        time: 'O(1)', space: 'O(n + B)',
        why: 'Average O(1 + n/B) per operation — about 10 entries per bucket at the maximum 10⁵ keys. Real hash tables also grow B as n grows to keep this constant.',
        code: {
          java: r`class MyHashMap {
    private static final int B = 10007;
    private final List<int[]>[] buckets;

    @SuppressWarnings("unchecked")
    public MyHashMap() {
        buckets = new List[B];
    }

    public void put(int key, int value) {
        int h = key % B;
        if (buckets[h] == null) buckets[h] = new ArrayList<>();
        for (int[] p : buckets[h]) if (p[0] == key) { p[1] = value; return; }
        buckets[h].add(new int[] { key, value });
    }

    public int get(int key) {
        List<int[]> bucket = buckets[key % B];
        if (bucket != null)
            for (int[] p : bucket) if (p[0] == key) return p[1];
        return -1;
    }

    public void remove(int key) {
        List<int[]> bucket = buckets[key % B];
        if (bucket != null) bucket.removeIf(p -> p[0] == key);
    }
}`,
          cpp: r`class MyHashMap {
    static const int B = 10007;
    vector<vector<pair<int, int>>> buckets;
public:
    MyHashMap() : buckets(B) {}

    void put(int key, int value) {
        auto& bucket = buckets[key % B];
        for (auto& p : bucket) if (p.first == key) { p.second = value; return; }
        bucket.push_back({key, value});
    }

    int get(int key) {
        for (auto& p : buckets[key % B]) if (p.first == key) return p.second;
        return -1;
    }

    void remove(int key) {
        auto& bucket = buckets[key % B];
        for (size_t i = 0; i < bucket.size(); i++)
            if (bucket[i].first == key) {
                bucket[i] = bucket.back();
                bucket.pop_back();
                return;
            }
    }
};`,
          python: r`class MyHashMap:
    B = 10007

    def __init__(self):
        self.buckets = [[] for _ in range(self.B)]

    def put(self, key: int, value: int) -> None:
        bucket = self.buckets[key % self.B]
        for p in bucket:
            if p[0] == key:
                p[1] = value
                return
        bucket.append([key, value])

    def get(self, key: int) -> int:
        for k, v in self.buckets[key % self.B]:
            if k == key:
                return v
        return -1

    def remove(self, key: int) -> None:
        bucket = self.buckets[key % self.B]
        for i, p in enumerate(bucket):
            if p[0] == key:
                bucket[i] = bucket[-1]
                bucket.pop()
                return`,
          javascript: r`var MyHashMap = function() {
    this.B = 10007;
    this.buckets = Array.from({ length: this.B }, () => []);
};

MyHashMap.prototype.put = function(key, value) {
    const bucket = this.buckets[key % this.B];
    for (const p of bucket) if (p[0] === key) { p[1] = value; return; }
    bucket.push([key, value]);
};

MyHashMap.prototype.get = function(key) {
    for (const [k, v] of this.buckets[key % this.B]) if (k === key) return v;
    return -1;
};

MyHashMap.prototype.remove = function(key) {
    const bucket = this.buckets[key % this.B];
    const i = bucket.findIndex((p) => p[0] === key);
    if (i >= 0) {
        bucket[i] = bucket[bucket.length - 1];
        bucket.pop();
    }
};`,
        },
      },
    ],
  },

  'min-stack': {
    pattern: 'Store the running minimum alongside each element',
    approaches: [
      {
        level: 'Brute force', name: 'Scan for the minimum',
        idea: 'Use an ordinary stack; `getMin` looks through every element.',
        steps: [
          '`push`, `pop`, `top` work on a plain array-backed stack.',
          '`getMin` scans all elements and returns the smallest.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'getMin is O(n), breaking the O(1) requirement (the other operations are O(1)).',
        code: {
          java: r`class MinStack {
    private final List<Integer> s = new ArrayList<>();

    public void push(int val) {
        s.add(val);
    }

    public void pop() {
        s.remove(s.size() - 1);
    }

    public int top() {
        return s.get(s.size() - 1);
    }

    public int getMin() {
        int min = Integer.MAX_VALUE;
        for (int x : s) min = Math.min(min, x);
        return min;
    }
}`,
          cpp: r`class MinStack {
    vector<int> s;
public:
    MinStack() {}

    void push(int val) {
        s.push_back(val);
    }

    void pop() {
        s.pop_back();
    }

    int top() {
        return s.back();
    }

    int getMin() {
        return *min_element(s.begin(), s.end());
    }
};`,
          python: r`class MinStack:
    def __init__(self):
        self.s = []

    def push(self, val: int) -> None:
        self.s.append(val)

    def pop(self) -> None:
        self.s.pop()

    def top(self) -> int:
        return self.s[-1]

    def getMin(self) -> int:
        return min(self.s)`,
          javascript: r`var MinStack = function() {
    this.s = [];
};

MinStack.prototype.push = function(val) {
    this.s.push(val);
};

MinStack.prototype.pop = function() {
    this.s.pop();
};

MinStack.prototype.top = function() {
    return this.s[this.s.length - 1];
};

MinStack.prototype.getMin = function() {
    let min = Infinity;
    for (const x of this.s) min = Math.min(min, x);
    return min;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Stack of (value, minimum so far) pairs',
        idea: 'When pushing, also record the minimum of the stack including this element. Popping then automatically restores the previous minimum, which is stored in the element below.',
        steps: [
          '`push(val)`: push `(val, min(val, current min))` (just `val` if the stack is empty).',
          '`pop`: pop the pair. `top`: first field of the top pair.',
          '`getMin`: second field of the top pair.',
        ],
        time: 'O(1)', space: 'O(n)',
        why: 'Every operation touches only the top. (A second stack that only stores new minimums saves memory when the minimum rarely changes.)',
        code: {
          java: r`class MinStack {
    private final Deque<int[]> s = new ArrayDeque<>();

    public void push(int val) {
        s.push(new int[] { val, s.isEmpty() ? val : Math.min(val, s.peek()[1]) });
    }

    public void pop() {
        s.pop();
    }

    public int top() {
        return s.peek()[0];
    }

    public int getMin() {
        return s.peek()[1];
    }
}`,
          cpp: r`class MinStack {
    vector<pair<int, int>> s; // (value, minimum so far)
public:
    MinStack() {}

    void push(int val) {
        s.push_back({val, s.empty() ? val : min(val, s.back().second)});
    }

    void pop() {
        s.pop_back();
    }

    int top() {
        return s.back().first;
    }

    int getMin() {
        return s.back().second;
    }
};`,
          python: r`class MinStack:
    def __init__(self):
        self.s = []  # (value, minimum so far)

    def push(self, val: int) -> None:
        self.s.append((val, min(val, self.s[-1][1]) if self.s else val))

    def pop(self) -> None:
        self.s.pop()

    def top(self) -> int:
        return self.s[-1][0]

    def getMin(self) -> int:
        return self.s[-1][1]`,
          javascript: r`var MinStack = function() {
    this.s = []; // [value, minimum so far]
};

MinStack.prototype.push = function(val) {
    const min = this.s.length ? Math.min(val, this.s[this.s.length - 1][1]) : val;
    this.s.push([val, min]);
};

MinStack.prototype.pop = function() {
    this.s.pop();
};

MinStack.prototype.top = function() {
    return this.s[this.s.length - 1][0];
};

MinStack.prototype.getMin = function() {
    return this.s[this.s.length - 1][1];
};`,
        },
      },
    ],
  },

  'lru-cache': {
    pattern: 'Hash map + doubly linked list (recency order)',
    approaches: [
      {
        level: 'Brute force', name: 'List ordered by recency',
        idea: 'Keep `(key, value)` pairs in a list from least to most recently used. Every access finds the key by scanning and moves it to the end; eviction removes the first element.',
        steps: [
          '`get`: scan for the key; if found, move it to the end and return its value.',
          '`put`: if the key exists, update and move it to the end; otherwise, if full, remove the first pair, then append.',
        ],
        time: 'O(capacity)', space: 'O(capacity)',
        why: 'Each operation scans and shifts up to `capacity` elements.',
        code: {
          java: r`class LRUCache {
    private final int capacity;
    private final List<int[]> items = new ArrayList<>(); // least recent first

    public LRUCache(int capacity) {
        this.capacity = capacity;
    }

    public int get(int key) {
        for (int i = 0; i < items.size(); i++)
            if (items.get(i)[0] == key) {
                int[] item = items.remove(i);
                items.add(item);
                return item[1];
            }
        return -1;
    }

    public void put(int key, int value) {
        if (get(key) != -1) {
            items.get(items.size() - 1)[1] = value;
            return;
        }
        if (items.size() == capacity) items.remove(0);
        items.add(new int[] { key, value });
    }
}`,
          cpp: r`class LRUCache {
    int capacity;
    vector<pair<int, int>> items; // least recent first
public:
    LRUCache(int capacity) : capacity(capacity) {}

    int get(int key) {
        for (size_t i = 0; i < items.size(); i++)
            if (items[i].first == key) {
                auto item = items[i];
                items.erase(items.begin() + i);
                items.push_back(item);
                return item.second;
            }
        return -1;
    }

    void put(int key, int value) {
        if (get(key) != -1) {
            items.back().second = value;
            return;
        }
        if ((int) items.size() == capacity) items.erase(items.begin());
        items.push_back({key, value});
    }
};`,
          python: r`class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.items = []  # [key, value], least recent first

    def get(self, key: int) -> int:
        for i, item in enumerate(self.items):
            if item[0] == key:
                self.items.append(self.items.pop(i))
                return item[1]
        return -1

    def put(self, key: int, value: int) -> None:
        if self.get(key) != -1:
            self.items[-1][1] = value
            return
        if len(self.items) == self.capacity:
            self.items.pop(0)
        self.items.append([key, value])`,
          javascript: r`var LRUCache = function(capacity) {
    this.capacity = capacity;
    this.items = []; // [key, value], least recent first
};

LRUCache.prototype.get = function(key) {
    const i = this.items.findIndex((item) => item[0] === key);
    if (i < 0) return -1;
    const [item] = this.items.splice(i, 1);
    this.items.push(item);
    return item[1];
};

LRUCache.prototype.put = function(key, value) {
    if (this.get(key) !== -1) {
        this.items[this.items.length - 1][1] = value;
        return;
    }
    if (this.items.length === this.capacity) this.items.shift();
    this.items.push([key, value]);
};`,
        },
      },
      {
        level: 'Optimal', name: 'Hash map + doubly linked list',
        idea: 'A doubly linked list keeps the recency order (most recent next to the head) and can unlink any node in O(1); a hash map from key to node finds that node in O(1). Sentinel head and tail nodes remove edge cases.',
        steps: [
          '`get`: look up the node; if present, unlink it, re-insert it after `head`, and return its value.',
          '`put`: if the key exists, update its value and move it to the front.',
          'Otherwise create a node at the front and map it; if the size now exceeds `capacity`, unlink the node before `tail` and delete its key from the map.',
        ],
        time: 'O(1)', space: 'O(capacity)',
        why: 'Every step is a constant number of map and pointer operations. Built-ins package exactly this structure: Java\'s `LinkedHashMap` (access order), Python\'s `OrderedDict`, and a JavaScript `Map` (delete + re-set to move a key to the end).',
        code: {
          java: r`class LRUCache {
    private static class Node {
        int key, value;
        Node prev, next;
        Node(int key, int value) { this.key = key; this.value = value; }
    }

    private final int capacity;
    private final Map<Integer, Node> map = new HashMap<>();
    private final Node head = new Node(0, 0), tail = new Node(0, 0);

    public LRUCache(int capacity) {
        this.capacity = capacity;
        head.next = tail;
        tail.prev = head;
    }

    public int get(int key) {
        Node node = map.get(key);
        if (node == null) return -1;
        unlink(node);
        addFront(node);
        return node.value;
    }

    public void put(int key, int value) {
        Node node = map.get(key);
        if (node != null) {
            node.value = value;
            unlink(node);
            addFront(node);
            return;
        }
        node = new Node(key, value);
        map.put(key, node);
        addFront(node);
        if (map.size() > capacity) {
            Node lru = tail.prev;
            unlink(lru);
            map.remove(lru.key);
        }
    }

    private void unlink(Node node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }

    private void addFront(Node node) {
        node.next = head.next;
        node.prev = head;
        head.next.prev = node;
        head.next = node;
    }
}`,
          cpp: r`class LRUCache {
    int capacity;
    list<pair<int, int>> order; // most recent at the front
    unordered_map<int, list<pair<int, int>>::iterator> where;
public:
    LRUCache(int capacity) : capacity(capacity) {}

    int get(int key) {
        auto it = where.find(key);
        if (it == where.end()) return -1;
        order.splice(order.begin(), order, it->second); // move to the front in O(1)
        return it->second->second;
    }

    void put(int key, int value) {
        auto it = where.find(key);
        if (it != where.end()) {
            it->second->second = value;
            order.splice(order.begin(), order, it->second);
            return;
        }
        order.push_front({key, value});
        where[key] = order.begin();
        if ((int) where.size() > capacity) {
            where.erase(order.back().first);
            order.pop_back();
        }
    }
};`,
          python: r`class LRUCache:
    class Node:
        __slots__ = ('key', 'value', 'prev', 'next')

        def __init__(self, key=0, value=0):
            self.key, self.value = key, value
            self.prev = self.next = None

    def __init__(self, capacity: int):
        self.capacity = capacity
        self.map = {}
        self.head, self.tail = self.Node(), self.Node()
        self.head.next, self.tail.prev = self.tail, self.head

    def _unlink(self, node):
        node.prev.next, node.next.prev = node.next, node.prev

    def _add_front(self, node):
        node.prev, node.next = self.head, self.head.next
        self.head.next.prev = node
        self.head.next = node

    def get(self, key: int) -> int:
        node = self.map.get(key)
        if not node:
            return -1
        self._unlink(node)
        self._add_front(node)
        return node.value

    def put(self, key: int, value: int) -> None:
        node = self.map.get(key)
        if node:
            node.value = value
            self._unlink(node)
            self._add_front(node)
            return
        node = self.Node(key, value)
        self.map[key] = node
        self._add_front(node)
        if len(self.map) > self.capacity:
            lru = self.tail.prev
            self._unlink(lru)
            del self.map[lru.key]`,
          javascript: r`var LRUCache = function(capacity) {
    this.capacity = capacity;
    this.map = new Map();
    this.head = { key: 0, value: 0, prev: null, next: null };
    this.tail = { key: 0, value: 0, prev: this.head, next: null };
    this.head.next = this.tail;
};

LRUCache.prototype.unlink = function(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
};

LRUCache.prototype.addFront = function(node) {
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next.prev = node;
    this.head.next = node;
};

LRUCache.prototype.get = function(key) {
    const node = this.map.get(key);
    if (!node) return -1;
    this.unlink(node);
    this.addFront(node);
    return node.value;
};

LRUCache.prototype.put = function(key, value) {
    let node = this.map.get(key);
    if (node) {
        node.value = value;
        this.unlink(node);
        this.addFront(node);
        return;
    }
    node = { key, value, prev: null, next: null };
    this.map.set(key, node);
    this.addFront(node);
    if (this.map.size > this.capacity) {
        const lru = this.tail.prev;
        this.unlink(lru);
        this.map.delete(lru.key);
    }
};`,
        },
      },
    ],
  },

  'insert-delete-getrandom-o1': {
    pattern: 'Array for O(1) random access + hash map of value → index; delete by swapping with the last element',
    approaches: [
      {
        level: 'Brute force', name: 'Array only',
        idea: 'Store the values in a dynamic array. Membership checks and removals search the array; random picks a uniform index.',
        steps: [
          '`insert`: if the value is not already in the array (linear search), append it.',
          '`remove`: find it, delete it from the array.',
          '`getRandom`: return the element at a uniformly random index.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'insert and remove are O(n) because of the search (and the shift when deleting from the middle); getRandom is O(1).',
        code: {
          java: r`class RandomizedSet {
    private final List<Integer> values = new ArrayList<>();
    private final Random rng = new Random();

    public boolean insert(int val) {
        if (values.contains(val)) return false;
        values.add(val);
        return true;
    }

    public boolean remove(int val) {
        return values.remove(Integer.valueOf(val));
    }

    public int getRandom() {
        return values.get(rng.nextInt(values.size()));
    }
}`,
          cpp: r`class RandomizedSet {
    vector<int> values;
    mt19937 rng{random_device{}()};
public:
    RandomizedSet() {}

    bool insert(int val) {
        if (find(values.begin(), values.end(), val) != values.end()) return false;
        values.push_back(val);
        return true;
    }

    bool remove(int val) {
        auto it = find(values.begin(), values.end(), val);
        if (it == values.end()) return false;
        values.erase(it);
        return true;
    }

    int getRandom() {
        return values[uniform_int_distribution<int>(0, values.size() - 1)(rng)];
    }
};`,
          python: r`class RandomizedSet:
    def __init__(self):
        self.values = []

    def insert(self, val: int) -> bool:
        if val in self.values:
            return False
        self.values.append(val)
        return True

    def remove(self, val: int) -> bool:
        if val not in self.values:
            return False
        self.values.remove(val)
        return True

    def getRandom(self) -> int:
        return random.choice(self.values)`,
          javascript: r`var RandomizedSet = function() {
    this.values = [];
};

RandomizedSet.prototype.insert = function(val) {
    if (this.values.includes(val)) return false;
    this.values.push(val);
    return true;
};

RandomizedSet.prototype.remove = function(val) {
    const i = this.values.indexOf(val);
    if (i < 0) return false;
    this.values.splice(i, 1);
    return true;
};

RandomizedSet.prototype.getRandom = function() {
    return this.values[Math.floor(Math.random() * this.values.length)];
};`,
        },
      },
      {
        level: 'Optimal', name: 'Array + index map, swap-with-last removal',
        idea: 'The array gives O(1) uniform random picks; a hash map from value to its array index gives O(1) lookups. To delete from the middle in O(1), move the last element into the hole and pop the end.',
        steps: [
          '`insert`: if absent, record `index[val] = size` and append.',
          '`remove`: if present, let `i = index[val]` and `last` be the final element; put `last` at `i`, set `index[last] = i`, pop the end, delete `val` from the map.',
          '`getRandom`: element at a uniformly random index.',
        ],
        time: 'O(1)', space: 'O(n)',
        why: 'Average O(1) for all three: hash operations plus work at the array\'s end only. The array order changes on removal, which is fine for a set.',
        code: {
          java: r`class RandomizedSet {
    private final List<Integer> values = new ArrayList<>();
    private final Map<Integer, Integer> index = new HashMap<>();
    private final Random rng = new Random();

    public boolean insert(int val) {
        if (index.containsKey(val)) return false;
        index.put(val, values.size());
        values.add(val);
        return true;
    }

    public boolean remove(int val) {
        Integer i = index.remove(val);
        if (i == null) return false;
        int last = values.remove(values.size() - 1);
        if (i < values.size()) {
            values.set(i, last);
            index.put(last, i);
        }
        return true;
    }

    public int getRandom() {
        return values.get(rng.nextInt(values.size()));
    }
}`,
          cpp: r`class RandomizedSet {
    vector<int> values;
    unordered_map<int, int> index;
    mt19937 rng{random_device{}()};
public:
    RandomizedSet() {}

    bool insert(int val) {
        if (index.count(val)) return false;
        index[val] = values.size();
        values.push_back(val);
        return true;
    }

    bool remove(int val) {
        auto it = index.find(val);
        if (it == index.end()) return false;
        int i = it->second, last = values.back();
        values[i] = last;
        index[last] = i;
        values.pop_back();
        index.erase(val);
        return true;
    }

    int getRandom() {
        return values[uniform_int_distribution<int>(0, values.size() - 1)(rng)];
    }
};`,
          python: r`class RandomizedSet:
    def __init__(self):
        self.values, self.index = [], {}

    def insert(self, val: int) -> bool:
        if val in self.index:
            return False
        self.index[val] = len(self.values)
        self.values.append(val)
        return True

    def remove(self, val: int) -> bool:
        if val not in self.index:
            return False
        i, last = self.index[val], self.values[-1]
        self.values[i] = last
        self.index[last] = i
        self.values.pop()
        del self.index[val]
        return True

    def getRandom(self) -> int:
        return random.choice(self.values)`,
          javascript: r`var RandomizedSet = function() {
    this.values = [];
    this.index = new Map();
};

RandomizedSet.prototype.insert = function(val) {
    if (this.index.has(val)) return false;
    this.index.set(val, this.values.length);
    this.values.push(val);
    return true;
};

RandomizedSet.prototype.remove = function(val) {
    if (!this.index.has(val)) return false;
    const i = this.index.get(val), last = this.values[this.values.length - 1];
    this.values[i] = last;
    this.index.set(last, i);
    this.values.pop();
    this.index.delete(val);
    return true;
};

RandomizedSet.prototype.getRandom = function() {
    return this.values[Math.floor(Math.random() * this.values.length)];
};`,
        },
      },
    ],
  },

  'time-based-key-value-store': {
    pattern: 'Hash map of key → timestamps in increasing order, binary search for the floor',
    approaches: [
      {
        level: 'Brute force', name: 'Scan versions backwards',
        idea: 'For each key keep its versions in the order they were set (timestamps increase). `get` walks backwards from the newest version until it finds a timestamp ≤ the query.',
        steps: [
          '`set`: append `(timestamp, value)` to the key\'s list.',
          '`get`: walk the list from the end; return the first value whose timestamp ≤ `timestamp`, else "".',
        ],
        time: 'O(n)', space: 'O(n)',
        why: '`set` is O(1), but `get` can scan all n versions of a key.',
        code: {
          java: r`class TimeMap {
    private final Map<String, List<Object[]>> versions = new HashMap<>();

    public void set(String key, String value, int timestamp) {
        versions.computeIfAbsent(key, k -> new ArrayList<>()).add(new Object[] { timestamp, value });
    }

    public String get(String key, int timestamp) {
        List<Object[]> list = versions.getOrDefault(key, List.of());
        for (int i = list.size() - 1; i >= 0; i--)
            if ((int) list.get(i)[0] <= timestamp) return (String) list.get(i)[1];
        return "";
    }
}`,
          cpp: r`class TimeMap {
    unordered_map<string, vector<pair<int, string>>> versions;
public:
    TimeMap() {}

    void set(string key, string value, int timestamp) {
        versions[key].push_back({timestamp, value});
    }

    string get(string key, int timestamp) {
        auto it = versions.find(key);
        if (it == versions.end()) return "";
        auto& list = it->second;
        for (int i = (int) list.size() - 1; i >= 0; i--)
            if (list[i].first <= timestamp) return list[i].second;
        return "";
    }
};`,
          python: r`class TimeMap:
    def __init__(self):
        self.versions = defaultdict(list)

    def set(self, key: str, value: str, timestamp: int) -> None:
        self.versions[key].append((timestamp, value))

    def get(self, key: str, timestamp: int) -> str:
        for t, v in reversed(self.versions.get(key, [])):
            if t <= timestamp:
                return v
        return ''`,
          javascript: r`var TimeMap = function() {
    this.versions = new Map();
};

TimeMap.prototype.set = function(key, value, timestamp) {
    if (!this.versions.has(key)) this.versions.set(key, []);
    this.versions.get(key).push([timestamp, value]);
};

TimeMap.prototype.get = function(key, timestamp) {
    const list = this.versions.get(key) || [];
    for (let i = list.length - 1; i >= 0; i--) if (list[i][0] <= timestamp) return list[i][1];
    return '';
};`,
        },
      },
      {
        level: 'Optimal', name: 'Binary search for the last timestamp ≤ t',
        idea: 'Because each key\'s timestamps arrive in increasing order, its list is already sorted. Binary-search for the last timestamp that is ≤ the query.',
        steps: [
          '`set`: append the timestamp and the value to the key\'s parallel lists.',
          '`get`: binary-search the first timestamp > `timestamp`; the answer is the element just before it, or "" if there is none.',
        ],
        time: 'O(log n)', space: 'O(n)',
        why: '`set` is O(1) (amortised) and `get` is O(log n) per key. A `TreeMap.floorEntry` per key would also work, at O(log n) for both.',
        code: {
          java: r`class TimeMap {
    private final Map<String, List<Integer>> times = new HashMap<>();
    private final Map<String, List<String>> values = new HashMap<>();

    public void set(String key, String value, int timestamp) {
        times.computeIfAbsent(key, k -> new ArrayList<>()).add(timestamp);
        values.computeIfAbsent(key, k -> new ArrayList<>()).add(value);
    }

    public String get(String key, int timestamp) {
        List<Integer> t = times.get(key);
        if (t == null) return "";
        int lo = 0, hi = t.size(); // first index with time > timestamp
        while (lo < hi) {
            int mid = (lo + hi) >>> 1;
            if (t.get(mid) <= timestamp) lo = mid + 1;
            else hi = mid;
        }
        return lo == 0 ? "" : values.get(key).get(lo - 1);
    }
}`,
          cpp: r`class TimeMap {
    unordered_map<string, vector<pair<int, string>>> versions;
public:
    TimeMap() {}

    void set(string key, string value, int timestamp) {
        versions[key].push_back({timestamp, value});
    }

    string get(string key, int timestamp) {
        auto it = versions.find(key);
        if (it == versions.end()) return "";
        auto& list = it->second;
        auto pos = upper_bound(list.begin(), list.end(), timestamp,
                               [](int t, const pair<int, string>& p) { return t < p.first; });
        return pos == list.begin() ? "" : prev(pos)->second;
    }
};`,
          python: r`class TimeMap:
    def __init__(self):
        self.times = defaultdict(list)
        self.values = defaultdict(list)

    def set(self, key: str, value: str, timestamp: int) -> None:
        self.times[key].append(timestamp)
        self.values[key].append(value)

    def get(self, key: str, timestamp: int) -> str:
        i = bisect_right(self.times.get(key, []), timestamp)
        return self.values[key][i - 1] if i else ''`,
          javascript: r`var TimeMap = function() {
    this.versions = new Map();
};

TimeMap.prototype.set = function(key, value, timestamp) {
    if (!this.versions.has(key)) this.versions.set(key, []);
    this.versions.get(key).push([timestamp, value]);
};

TimeMap.prototype.get = function(key, timestamp) {
    const list = this.versions.get(key) || [];
    let lo = 0, hi = list.length; // first index with time > timestamp
    while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (list[mid][0] <= timestamp) lo = mid + 1;
        else hi = mid;
    }
    return lo === 0 ? '' : list[lo - 1][1];
};`,
        },
      },
    ],
  },

  'peeking-iterator': {
    pattern: 'Iterator wrapper with a one-element lookahead cache',
    approaches: [
      {
        level: 'Brute force', name: 'Copy everything up front',
        idea: 'Drain the underlying iterator into a list in the constructor, then serve `peek`, `next` and `hasNext` from the list with an index.',
        steps: [
          'Constructor: read every element into `items`; `pos = 0`.',
          '`peek`: `items[pos]`; `next`: `items[pos++]`; `hasNext`: `pos < items.length`.',
        ],
        time: 'O(1)', space: 'O(n)',
        why: 'O(n) up front and O(n) memory — it defeats the purpose of an iterator, which may be huge or infinite.',
        code: {
          java: r`class PeekingIterator implements Iterator<Integer> {
    private final List<Integer> items = new ArrayList<>();
    private int pos = 0;

    public PeekingIterator(Iterator<Integer> iterator) {
        while (iterator.hasNext()) items.add(iterator.next());
    }

    public Integer peek() {
        return items.get(pos);
    }

    @Override
    public Integer next() {
        return items.get(pos++);
    }

    @Override
    public boolean hasNext() {
        return pos < items.size();
    }
}`,
          cpp: r`class PeekingIterator : public Iterator {
    vector<int> items;
    size_t pos = 0;
public:
    PeekingIterator(const vector<int>& nums) : Iterator(nums) {
        while (Iterator::hasNext()) items.push_back(Iterator::next());
    }

    int peek() {
        return items[pos];
    }

    int next() {
        return items[pos++];
    }

    bool hasNext() {
        return pos < items.size();
    }
};`,
          python: r`class PeekingIterator:
    def __init__(self, iterator):
        self.items, self.pos = [], 0
        while iterator.hasNext():
            self.items.append(iterator.next())

    def peek(self) -> int:
        return self.items[self.pos]

    def next(self) -> int:
        self.pos += 1
        return self.items[self.pos - 1]

    def hasNext(self) -> bool:
        return self.pos < len(self.items)`,
          javascript: r`var PeekingIterator = function(iterator) {
    this.items = [];
    this.pos = 0;
    while (iterator.hasNext()) this.items.push(iterator.next());
};

PeekingIterator.prototype.peek = function() {
    return this.items[this.pos];
};

PeekingIterator.prototype.next = function() {
    return this.items[this.pos++];
};

PeekingIterator.prototype.hasNext = function() {
    return this.pos < this.items.length;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Cache exactly one element ahead',
        idea: 'Always hold the next element (if any) in a field. `peek` returns it; `next` returns it and refills the cache from the underlying iterator.',
        steps: [
          'Constructor: `has = it.hasNext()`; if so, `cached = it.next()`.',
          '`peek`: return `cached`. `hasNext`: return `has`.',
          '`next`: remember `cached`, refill (`has = it.hasNext()`, `cached = it.next()` if so), return the remembered value.',
        ],
        time: 'O(1)', space: 'O(1)',
        why: 'Each call does at most one call on the underlying iterator and keeps one extra element.',
        code: {
          java: r`class PeekingIterator implements Iterator<Integer> {
    private final Iterator<Integer> it;
    private boolean has;
    private Integer cached;

    public PeekingIterator(Iterator<Integer> iterator) {
        it = iterator;
        advance();
    }

    private void advance() {
        has = it.hasNext();
        cached = has ? it.next() : null;
    }

    public Integer peek() {
        return cached;
    }

    @Override
    public Integer next() {
        Integer value = cached;
        advance();
        return value;
    }

    @Override
    public boolean hasNext() {
        return has;
    }
}`,
          cpp: r`class PeekingIterator : public Iterator {
    bool has;
    int cached = 0;
    void advance() {
        has = Iterator::hasNext();
        if (has) cached = Iterator::next();
    }
public:
    PeekingIterator(const vector<int>& nums) : Iterator(nums) {
        advance();
    }

    int peek() {
        return cached;
    }

    int next() {
        int value = cached;
        advance();
        return value;
    }

    bool hasNext() {
        return has;
    }
};`,
          python: r`class PeekingIterator:
    def __init__(self, iterator):
        self.it = iterator
        self._advance()

    def _advance(self):
        self.has = self.it.hasNext()
        self.cached = self.it.next() if self.has else None

    def peek(self) -> int:
        return self.cached

    def next(self) -> int:
        value = self.cached
        self._advance()
        return value

    def hasNext(self) -> bool:
        return self.has`,
          javascript: r`var PeekingIterator = function(iterator) {
    this.it = iterator;
    this.advance();
};

PeekingIterator.prototype.advance = function() {
    this.has = this.it.hasNext();
    this.cached = this.has ? this.it.next() : undefined;
};

PeekingIterator.prototype.peek = function() {
    return this.cached;
};

PeekingIterator.prototype.next = function() {
    const value = this.cached;
    this.advance();
    return value;
};

PeekingIterator.prototype.hasNext = function() {
    return this.has;
};`,
        },
      },
    ],
  },

  'flatten-nested-list-iterator': {
    pattern: 'Lazy DFS with an explicit stack of (list, position) frames',
    approaches: [
      {
        level: 'Brute force', name: 'Flatten everything in the constructor',
        idea: 'Recursively walk the whole nested structure once, collecting integers into a flat list; then iterate over that list.',
        steps: [
          'Constructor: DFS over `nestedList`, appending each integer in order.',
          '`next`: return `flat[pos++]`; `hasNext`: `pos < flat.length`.',
        ],
        time: 'O(N + L)', space: 'O(N + D)',
        why: 'N integers and L lists are all visited up front, and the whole flat copy is kept (D = nesting depth for the recursion). Fine here, but it does all the work even if the caller stops early.',
        code: {
          java: r`class NestedIterator implements Iterator<Integer> {
    private final List<Integer> flat = new ArrayList<>();
    private int pos = 0;

    public NestedIterator(List<NestedInteger> nestedList) {
        flatten(nestedList);
    }

    private void flatten(List<NestedInteger> list) {
        for (NestedInteger x : list) {
            if (x.isInteger()) flat.add(x.getInteger());
            else flatten(x.getList());
        }
    }

    @Override
    public Integer next() {
        return flat.get(pos++);
    }

    @Override
    public boolean hasNext() {
        return pos < flat.size();
    }
}`,
          cpp: r`class NestedIterator {
    vector<int> flat;
    size_t pos = 0;
    void flatten(const vector<NestedInteger>& list) {
        for (const auto& x : list) {
            if (x.isInteger()) flat.push_back(x.getInteger());
            else flatten(x.getList());
        }
    }
public:
    NestedIterator(vector<NestedInteger>& nestedList) {
        flatten(nestedList);
    }

    int next() {
        return flat[pos++];
    }

    bool hasNext() {
        return pos < flat.size();
    }
};`,
          python: r`class NestedIterator:
    def __init__(self, nestedList: [NestedInteger]):
        self.flat, self.pos = [], 0
        def flatten(items):
            for x in items:
                if x.isInteger():
                    self.flat.append(x.getInteger())
                else:
                    flatten(x.getList())
        flatten(nestedList)

    def next(self) -> int:
        self.pos += 1
        return self.flat[self.pos - 1]

    def hasNext(self) -> bool:
        return self.pos < len(self.flat)`,
          javascript: r`var NestedIterator = function(nestedList) {
    this.flat = [];
    this.pos = 0;
    const flatten = (list) => {
        for (const x of list) {
            if (x.isInteger()) this.flat.push(x.getInteger());
            else flatten(x.getList());
        }
    };
    flatten(nestedList);
};

NestedIterator.prototype.next = function() {
    return this.flat[this.pos++];
};

NestedIterator.prototype.hasNext = function() {
    return this.pos < this.flat.length;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Lazy stack of positions',
        idea: 'Keep a stack of frames `(list, index)` — the DFS call stack, made explicit. `hasNext` advances until the top frame points at an integer, descending into sub-lists and popping finished ones. `next` then just returns that integer.',
        steps: [
          'Start with one frame for `nestedList` at index 0.',
          '`hasNext`: while the stack is not empty — if the top frame is finished, pop it; if it points at an integer, return true; if it points at a list, step past it and push a frame for that list.',
          'Return false when the stack empties (this also skips empty lists like `[[]]`).',
          '`next`: call `hasNext`, then return the integer at the top frame and advance it.',
        ],
        time: 'O(1)', space: 'O(D)',
        why: 'Amortised O(1) per call: each list and integer is stepped over once across the whole iteration. Only the current path (depth D) is stored, and nothing is copied.',
        code: {
          java: r`class NestedIterator implements Iterator<Integer> {
    private final Deque<Iterator<NestedInteger>> stack = new ArrayDeque<>();
    private Integer ready; // the next integer, once hasNext() has found it

    public NestedIterator(List<NestedInteger> nestedList) {
        stack.push(nestedList.iterator());
    }

    @Override
    public boolean hasNext() {
        while (ready == null && !stack.isEmpty()) {
            Iterator<NestedInteger> top = stack.peek();
            if (!top.hasNext()) {
                stack.pop();
                continue;
            }
            NestedInteger x = top.next();
            if (x.isInteger()) ready = x.getInteger();
            else stack.push(x.getList().iterator());
        }
        return ready != null;
    }

    @Override
    public Integer next() {
        hasNext();
        Integer value = ready;
        ready = null;
        return value;
    }
}`,
          cpp: r`class NestedIterator {
    vector<NestedInteger> root;
    stack<pair<const vector<NestedInteger>*, size_t>> frames; // (list, next index)
public:
    NestedIterator(vector<NestedInteger>& nestedList) : root(nestedList) {
        frames.push({&root, 0});
    }

    bool hasNext() {
        while (!frames.empty()) {
            auto& [list, i] = frames.top();
            if (i == list->size()) {
                frames.pop();
                continue;
            }
            const NestedInteger& x = (*list)[i];
            if (x.isInteger()) return true;
            i++;
            frames.push({&x.getList(), 0});
        }
        return false;
    }

    int next() {
        hasNext();
        auto& [list, i] = frames.top();
        return (*list)[i++].getInteger();
    }
};`,
          python: r`class NestedIterator:
    def __init__(self, nestedList: [NestedInteger]):
        self.stack = [[nestedList, 0]]  # (list, next index)

    def hasNext(self) -> bool:
        while self.stack:
            frame = self.stack[-1]
            items, i = frame
            if i == len(items):
                self.stack.pop()
                continue
            if items[i].isInteger():
                return True
            frame[1] += 1
            self.stack.append([items[i].getList(), 0])
        return False

    def next(self) -> int:
        self.hasNext()
        frame = self.stack[-1]
        frame[1] += 1
        return frame[0][frame[1] - 1].getInteger()`,
          javascript: r`var NestedIterator = function(nestedList) {
    this.stack = [[nestedList, 0]]; // [list, next index]
};

NestedIterator.prototype.hasNext = function() {
    while (this.stack.length) {
        const frame = this.stack[this.stack.length - 1], [list, i] = frame;
        if (i === list.length) {
            this.stack.pop();
            continue;
        }
        if (list[i].isInteger()) return true;
        frame[1]++;
        this.stack.push([list[i].getList(), 0]);
    }
    return false;
};

NestedIterator.prototype.next = function() {
    this.hasNext();
    const frame = this.stack[this.stack.length - 1];
    return frame[0][frame[1]++].getInteger();
};`,
        },
      },
    ],
  },

  'snapshot-array': {
    pattern: 'Per-index version history + binary search (store only changes, not copies)',
    approaches: [
      {
        level: 'Brute force', name: 'Copy the whole array on every snap',
        idea: 'Keep the current array; `snap` saves a full copy. `get` reads from the saved copy.',
        steps: [
          '`set`: write into the current array.',
          '`snap`: append a copy of the current array; return its index.',
          '`get(i, id)`: `snapshots[id][i]`.',
        ],
        time: 'O(length)', space: 'O(length·snaps)',
        why: '`set` and `get` are O(1), but each snap copies `length` values — up to 5·10⁴ × 10⁵ operations and memory in the worst case.',
        code: {
          java: r`class SnapshotArray {
    private final int[] current;
    private final List<int[]> snapshots = new ArrayList<>();

    public SnapshotArray(int length) {
        current = new int[length];
    }

    public void set(int index, int val) {
        current[index] = val;
    }

    public int snap() {
        snapshots.add(current.clone());
        return snapshots.size() - 1;
    }

    public int get(int index, int snap_id) {
        return snapshots.get(snap_id)[index];
    }
}`,
          cpp: r`class SnapshotArray {
    vector<int> current;
    vector<vector<int>> snapshots;
public:
    SnapshotArray(int length) : current(length, 0) {}

    void set(int index, int val) {
        current[index] = val;
    }

    int snap() {
        snapshots.push_back(current);
        return snapshots.size() - 1;
    }

    int get(int index, int snap_id) {
        return snapshots[snap_id][index];
    }
};`,
          python: r`class SnapshotArray:
    def __init__(self, length: int):
        self.current = [0] * length
        self.snapshots = []

    def set(self, index: int, val: int) -> None:
        self.current[index] = val

    def snap(self) -> int:
        self.snapshots.append(self.current[:])
        return len(self.snapshots) - 1

    def get(self, index: int, snap_id: int) -> int:
        return self.snapshots[snap_id][index]`,
          javascript: r`var SnapshotArray = function(length) {
    this.current = new Array(length).fill(0);
    this.snapshots = [];
};

SnapshotArray.prototype.set = function(index, val) {
    this.current[index] = val;
};

SnapshotArray.prototype.snap = function() {
    this.snapshots.push([...this.current]);
    return this.snapshots.length - 1;
};

SnapshotArray.prototype.get = function(index, snap_id) {
    return this.snapshots[snap_id][index];
};`,
        },
      },
      {
        level: 'Optimal', name: 'Per-index change log + binary search',
        idea: 'For each index, record only the changes as `(snapId, value)` pairs, where `snapId` is the snapshot the change will belong to. A `get` finds the last change with `snapId ≤ id` by binary search.',
        steps: [
          '`set(i, v)`: if the last entry of `history[i]` has the current snap id, overwrite its value; otherwise append `(snapCount, v)`.',
          '`snap()`: return `snapCount++` — nothing is copied.',
          '`get(i, id)`: binary-search `history[i]` for the last entry with `snapId ≤ id`; return its value, or 0 if there is none.',
        ],
        time: 'O(log s)', space: 'O(length + sets)',
        why: '`set` and `snap` are O(1), `get` is O(log s) for s recorded changes at that index; memory grows only with the number of `set` calls.',
        code: {
          java: r`class SnapshotArray {
    private final List<List<int[]>> history = new ArrayList<>();
    private int snapCount = 0;

    public SnapshotArray(int length) {
        for (int i = 0; i < length; i++) history.add(new ArrayList<>());
    }

    public void set(int index, int val) {
        List<int[]> h = history.get(index);
        if (!h.isEmpty() && h.get(h.size() - 1)[0] == snapCount) h.get(h.size() - 1)[1] = val;
        else h.add(new int[] { snapCount, val });
    }

    public int snap() {
        return snapCount++;
    }

    public int get(int index, int snap_id) {
        List<int[]> h = history.get(index);
        int lo = 0, hi = h.size(); // first entry with snapId > snap_id
        while (lo < hi) {
            int mid = (lo + hi) >>> 1;
            if (h.get(mid)[0] <= snap_id) lo = mid + 1;
            else hi = mid;
        }
        return lo == 0 ? 0 : h.get(lo - 1)[1];
    }
}`,
          cpp: r`class SnapshotArray {
    vector<vector<pair<int, int>>> history; // (snapId, value) per index
    int snapCount = 0;
public:
    SnapshotArray(int length) : history(length) {}

    void set(int index, int val) {
        auto& h = history[index];
        if (!h.empty() && h.back().first == snapCount) h.back().second = val;
        else h.push_back({snapCount, val});
    }

    int snap() {
        return snapCount++;
    }

    int get(int index, int snap_id) {
        auto& h = history[index];
        auto it = upper_bound(h.begin(), h.end(), make_pair(snap_id, INT_MAX));
        return it == h.begin() ? 0 : prev(it)->second;
    }
};`,
          python: r`class SnapshotArray:
    def __init__(self, length: int):
        self.snap_ids = [[] for _ in range(length)]
        self.values = [[] for _ in range(length)]
        self.snap_count = 0

    def set(self, index: int, val: int) -> None:
        ids, vals = self.snap_ids[index], self.values[index]
        if ids and ids[-1] == self.snap_count:
            vals[-1] = val
        else:
            ids.append(self.snap_count)
            vals.append(val)

    def snap(self) -> int:
        self.snap_count += 1
        return self.snap_count - 1

    def get(self, index: int, snap_id: int) -> int:
        i = bisect_right(self.snap_ids[index], snap_id)
        return self.values[index][i - 1] if i else 0`,
          javascript: r`var SnapshotArray = function(length) {
    this.history = Array.from({ length }, () => []); // [snapId, value] per index
    this.snapCount = 0;
};

SnapshotArray.prototype.set = function(index, val) {
    const h = this.history[index];
    if (h.length && h[h.length - 1][0] === this.snapCount) h[h.length - 1][1] = val;
    else h.push([this.snapCount, val]);
};

SnapshotArray.prototype.snap = function() {
    return this.snapCount++;
};

SnapshotArray.prototype.get = function(index, snap_id) {
    const h = this.history[index];
    let lo = 0, hi = h.length; // first entry with snapId > snap_id
    while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (h[mid][0] <= snap_id) lo = mid + 1;
        else hi = mid;
    }
    return lo === 0 ? 0 : h[lo - 1][1];
};`,
        },
      },
    ],
  },

  'design-twitter': {
    pattern: 'Per-user tweet lists + k-way merge with a max-heap (merge k sorted lists)',
    approaches: [
      {
        level: 'Brute force', name: 'Scan the global timeline',
        idea: 'Keep every tweet in one list in posting order. For a feed, walk it from the newest end and keep tweets by the user or anyone they follow, stopping at 10.',
        steps: [
          '`postTweet`: append `(userId, tweetId)` to the global list.',
          '`follow` / `unfollow`: add to / remove from the user\'s followee set.',
          '`getNewsFeed`: scan backwards, collecting tweets whose author is the user or a followee, until 10 are found.',
        ],
        time: 'O(T)', space: 'O(T + F)',
        why: 'A feed may scan all T tweets ever posted if the user\'s network is quiet; the other operations are O(1).',
        code: {
          java: r`class Twitter {
    private final List<int[]> tweets = new ArrayList<>(); // (userId, tweetId) in posting order
    private final Map<Integer, Set<Integer>> follows = new HashMap<>();

    public void postTweet(int userId, int tweetId) {
        tweets.add(new int[] { userId, tweetId });
    }

    public List<Integer> getNewsFeed(int userId) {
        Set<Integer> followees = follows.getOrDefault(userId, Set.of());
        List<Integer> feed = new ArrayList<>();
        for (int i = tweets.size() - 1; i >= 0 && feed.size() < 10; i--) {
            int author = tweets.get(i)[0];
            if (author == userId || followees.contains(author)) feed.add(tweets.get(i)[1]);
        }
        return feed;
    }

    public void follow(int followerId, int followeeId) {
        follows.computeIfAbsent(followerId, k -> new HashSet<>()).add(followeeId);
    }

    public void unfollow(int followerId, int followeeId) {
        Set<Integer> s = follows.get(followerId);
        if (s != null) s.remove(followeeId);
    }
}`,
          cpp: r`class Twitter {
    vector<pair<int, int>> tweets; // (userId, tweetId) in posting order
    unordered_map<int, unordered_set<int>> follows;
public:
    Twitter() {}

    void postTweet(int userId, int tweetId) {
        tweets.push_back({userId, tweetId});
    }

    vector<int> getNewsFeed(int userId) {
        auto& followees = follows[userId];
        vector<int> feed;
        for (int i = (int) tweets.size() - 1; i >= 0 && feed.size() < 10; i--) {
            int author = tweets[i].first;
            if (author == userId || followees.count(author)) feed.push_back(tweets[i].second);
        }
        return feed;
    }

    void follow(int followerId, int followeeId) {
        follows[followerId].insert(followeeId);
    }

    void unfollow(int followerId, int followeeId) {
        follows[followerId].erase(followeeId);
    }
};`,
          python: r`class Twitter:
    def __init__(self):
        self.tweets = []  # (userId, tweetId) in posting order
        self.follows = defaultdict(set)

    def postTweet(self, userId: int, tweetId: int) -> None:
        self.tweets.append((userId, tweetId))

    def getNewsFeed(self, userId: int) -> List[int]:
        feed, followees = [], self.follows[userId]
        for author, tweet in reversed(self.tweets):
            if author == userId or author in followees:
                feed.append(tweet)
                if len(feed) == 10:
                    break
        return feed

    def follow(self, followerId: int, followeeId: int) -> None:
        self.follows[followerId].add(followeeId)

    def unfollow(self, followerId: int, followeeId: int) -> None:
        self.follows[followerId].discard(followeeId)`,
          javascript: r`var Twitter = function() {
    this.tweets = []; // [userId, tweetId] in posting order
    this.follows = new Map();
};

Twitter.prototype.postTweet = function(userId, tweetId) {
    this.tweets.push([userId, tweetId]);
};

Twitter.prototype.getNewsFeed = function(userId) {
    const followees = this.follows.get(userId) || new Set(), feed = [];
    for (let i = this.tweets.length - 1; i >= 0 && feed.length < 10; i--) {
        const [author, tweet] = this.tweets[i];
        if (author === userId || followees.has(author)) feed.push(tweet);
    }
    return feed;
};

Twitter.prototype.follow = function(followerId, followeeId) {
    if (!this.follows.has(followerId)) this.follows.set(followerId, new Set());
    this.follows.get(followerId).add(followeeId);
};

Twitter.prototype.unfollow = function(followerId, followeeId) {
    const s = this.follows.get(followerId);
    if (s) s.delete(followeeId);
};`,
        },
      },
      {
        level: 'Optimal', name: 'Per-user lists merged with a max-heap',
        idea: 'Each user\'s tweets form a list already sorted by time. A feed is the top 10 of a k-way merge of the user\'s list and their followees\' lists: put each list\'s newest tweet in a max-heap by time, pop the newest, and push the next-older tweet from the same list.',
        steps: [
          '`postTweet`: append `(time++, tweetId)` to the user\'s own list.',
          '`getNewsFeed`: for the user and each followee with tweets, push their newest `(time, tweetId, user, index)`.',
          'Pop up to 10 times; after each pop, push that user\'s previous tweet if there is one.',
        ],
        time: 'O(F + 10·log F)', space: 'O(T + F)',
        why: 'Building the heap costs O(F) for F followees, and only 10 pops follow — independent of how many tweets exist overall.',
        code: {
          java: r`class Twitter {
    private int time = 0;
    private final Map<Integer, List<int[]>> tweets = new HashMap<>(); // userId -> (time, tweetId)
    private final Map<Integer, Set<Integer>> follows = new HashMap<>();

    public void postTweet(int userId, int tweetId) {
        tweets.computeIfAbsent(userId, k -> new ArrayList<>()).add(new int[] { time++, tweetId });
    }

    public List<Integer> getNewsFeed(int userId) {
        // heap entries: (time, tweetId, userId, index in that user's list), newest first
        PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> b[0] - a[0]);
        Set<Integer> users = new HashSet<>(follows.getOrDefault(userId, Set.of()));
        users.add(userId);
        for (int u : users) {
            List<int[]> list = tweets.get(u);
            if (list != null && !list.isEmpty()) {
                int i = list.size() - 1;
                heap.add(new int[] { list.get(i)[0], list.get(i)[1], u, i });
            }
        }
        List<Integer> feed = new ArrayList<>();
        while (!heap.isEmpty() && feed.size() < 10) {
            int[] top = heap.poll();
            feed.add(top[1]);
            if (top[3] > 0) {
                int[] older = tweets.get(top[2]).get(top[3] - 1);
                heap.add(new int[] { older[0], older[1], top[2], top[3] - 1 });
            }
        }
        return feed;
    }

    public void follow(int followerId, int followeeId) {
        follows.computeIfAbsent(followerId, k -> new HashSet<>()).add(followeeId);
    }

    public void unfollow(int followerId, int followeeId) {
        Set<Integer> s = follows.get(followerId);
        if (s != null) s.remove(followeeId);
    }
}`,
          cpp: r`class Twitter {
    int time = 0;
    unordered_map<int, vector<pair<int, int>>> tweets; // userId -> (time, tweetId)
    unordered_map<int, unordered_set<int>> follows;
public:
    Twitter() {}

    void postTweet(int userId, int tweetId) {
        tweets[userId].push_back({time++, tweetId});
    }

    vector<int> getNewsFeed(int userId) {
        priority_queue<array<int, 4>> heap; // (time, tweetId, userId, index), newest on top
        unordered_set<int> users = follows[userId];
        users.insert(userId);
        for (int u : users) {
            auto it = tweets.find(u);
            if (it != tweets.end() && !it->second.empty()) {
                int i = it->second.size() - 1;
                heap.push({it->second[i].first, it->second[i].second, u, i});
            }
        }
        vector<int> feed;
        while (!heap.empty() && feed.size() < 10) {
            auto [t, id, u, i] = heap.top();
            heap.pop();
            feed.push_back(id);
            if (i > 0) heap.push({tweets[u][i - 1].first, tweets[u][i - 1].second, u, i - 1});
        }
        return feed;
    }

    void follow(int followerId, int followeeId) {
        follows[followerId].insert(followeeId);
    }

    void unfollow(int followerId, int followeeId) {
        follows[followerId].erase(followeeId);
    }
};`,
          python: r`class Twitter:
    def __init__(self):
        self.time = 0
        self.tweets = defaultdict(list)  # userId -> [(time, tweetId)]
        self.follows = defaultdict(set)

    def postTweet(self, userId: int, tweetId: int) -> None:
        self.tweets[userId].append((self.time, tweetId))
        self.time += 1

    def getNewsFeed(self, userId: int) -> List[int]:
        heap = []  # (-time, tweetId, userId, index): newest first
        for u in self.follows[userId] | {userId}:
            if self.tweets[u]:
                i = len(self.tweets[u]) - 1
                t, tweet = self.tweets[u][i]
                heap.append((-t, tweet, u, i))
        heapify(heap)
        feed = []
        while heap and len(feed) < 10:
            _, tweet, u, i = heappop(heap)
            feed.append(tweet)
            if i > 0:
                t, older = self.tweets[u][i - 1]
                heappush(heap, (-t, older, u, i - 1))
        return feed

    def follow(self, followerId: int, followeeId: int) -> None:
        self.follows[followerId].add(followeeId)

    def unfollow(self, followerId: int, followeeId: int) -> None:
        self.follows[followerId].discard(followeeId)`,
          javascript: r`var Twitter = function() {
    this.time = 0;
    this.tweets = new Map(); // userId -> [time, tweetId][]
    this.follows = new Map();
};

Twitter.prototype.postTweet = function(userId, tweetId) {
    if (!this.tweets.has(userId)) this.tweets.set(userId, []);
    this.tweets.get(userId).push([this.time++, tweetId]);
};

Twitter.prototype.getNewsFeed = function(userId) {
    const heap = new PriorityQueue((a, b) => b[0] - a[0]); // [time, tweetId, userId, index]
    const users = new Set(this.follows.get(userId) || []);
    users.add(userId);
    for (const u of users) {
        const list = this.tweets.get(u);
        if (list && list.length) {
            const i = list.length - 1;
            heap.enqueue([list[i][0], list[i][1], u, i]);
        }
    }
    const feed = [];
    while (heap.size() > 0 && feed.length < 10) {
        const [, tweet, u, i] = heap.dequeue();
        feed.push(tweet);
        if (i > 0) {
            const [t, older] = this.tweets.get(u)[i - 1];
            heap.enqueue([t, older, u, i - 1]);
        }
    }
    return feed;
};

Twitter.prototype.follow = function(followerId, followeeId) {
    if (!this.follows.has(followerId)) this.follows.set(followerId, new Set());
    this.follows.get(followerId).add(followeeId);
};

Twitter.prototype.unfollow = function(followerId, followeeId) {
    const s = this.follows.get(followerId);
    if (s) s.delete(followeeId);
};`,
        },
      },
    ],
  },

  'lfu-cache': {
    pattern: 'Hash map + frequency buckets (each an LRU-ordered list) + a min-frequency pointer',
    approaches: [
      {
        level: 'Brute force', name: 'Scan for the victim',
        idea: 'Store each key with its value, use count and the time it was last used. On eviction, scan all keys for the smallest `(count, lastUsed)`.',
        steps: [
          '`get`: if present, increment its count, stamp the current time, return the value.',
          '`put` on an existing key: update the value and touch it the same way.',
          '`put` of a new key when full: remove the key with the smallest count, breaking ties by the oldest time; then insert with count 1.',
        ],
        time: 'O(capacity)', space: 'O(capacity)',
        why: '`get` is O(1), but every eviction scans all stored keys.',
        code: {
          java: r`class LFUCache {
    private final int capacity;
    private int clock = 0;
    private final Map<Integer, int[]> entries = new HashMap<>(); // key -> {value, count, lastUsed}

    public LFUCache(int capacity) {
        this.capacity = capacity;
    }

    public int get(int key) {
        int[] e = entries.get(key);
        if (e == null) return -1;
        e[1]++;
        e[2] = clock++;
        return e[0];
    }

    public void put(int key, int value) {
        int[] e = entries.get(key);
        if (e != null) {
            e[0] = value;
            e[1]++;
            e[2] = clock++;
            return;
        }
        if (entries.size() == capacity) {
            int victim = -1;
            int[] worst = null;
            for (Map.Entry<Integer, int[]> x : entries.entrySet()) {
                int[] v = x.getValue();
                if (worst == null || v[1] < worst[1] || (v[1] == worst[1] && v[2] < worst[2])) {
                    worst = v;
                    victim = x.getKey();
                }
            }
            entries.remove(victim);
        }
        entries.put(key, new int[] { value, 1, clock++ });
    }
}`,
          cpp: r`class LFUCache {
    int capacity, clock = 0;
    unordered_map<int, array<int, 3>> entries; // key -> {value, count, lastUsed}
public:
    LFUCache(int capacity) : capacity(capacity) {}

    int get(int key) {
        auto it = entries.find(key);
        if (it == entries.end()) return -1;
        it->second[1]++;
        it->second[2] = clock++;
        return it->second[0];
    }

    void put(int key, int value) {
        auto it = entries.find(key);
        if (it != entries.end()) {
            it->second = {value, it->second[1] + 1, clock++};
            return;
        }
        if ((int) entries.size() == capacity) {
            auto victim = entries.begin();
            for (auto x = entries.begin(); x != entries.end(); ++x)
                if (make_pair(x->second[1], x->second[2]) < make_pair(victim->second[1], victim->second[2])) victim = x;
            entries.erase(victim);
        }
        entries[key] = {value, 1, clock++};
    }
};`,
          python: r`class LFUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.clock = 0
        self.entries = {}  # key -> [value, count, lastUsed]

    def get(self, key: int) -> int:
        e = self.entries.get(key)
        if e is None:
            return -1
        e[1] += 1
        e[2] = self.clock
        self.clock += 1
        return e[0]

    def put(self, key: int, value: int) -> None:
        if key in self.entries:
            e = self.entries[key]
            e[0] = value
            e[1] += 1
            e[2] = self.clock
        else:
            if len(self.entries) == self.capacity:
                victim = min(self.entries, key=lambda k: (self.entries[k][1], self.entries[k][2]))
                del self.entries[victim]
            self.entries[key] = [value, 1, self.clock]
        self.clock += 1`,
          javascript: r`var LFUCache = function(capacity) {
    this.capacity = capacity;
    this.clock = 0;
    this.entries = new Map(); // key -> [value, count, lastUsed]
};

LFUCache.prototype.get = function(key) {
    const e = this.entries.get(key);
    if (!e) return -1;
    e[1]++;
    e[2] = this.clock++;
    return e[0];
};

LFUCache.prototype.put = function(key, value) {
    const e = this.entries.get(key);
    if (e) {
        e[0] = value;
        e[1]++;
        e[2] = this.clock++;
        return;
    }
    if (this.entries.size === this.capacity) {
        let victim = null, worst = null;
        for (const [k, v] of this.entries)
            if (!worst || v[1] < worst[1] || (v[1] === worst[1] && v[2] < worst[2])) { worst = v; victim = k; }
        this.entries.delete(victim);
    }
    this.entries.set(key, [value, 1, this.clock++]);
};`,
        },
      },
      {
        level: 'Optimal', name: 'Frequency buckets with LRU order and minFreq',
        idea: 'Group keys by use count. Each bucket keeps its keys in recency order (an insertion-ordered set or linked list), so the eviction victim is the oldest key in the lowest non-empty bucket. Track that lowest count in `minFreq`.',
        steps: [
          '`touch(key)`: move the key from bucket `f` to the back of bucket `f + 1`; if bucket `f` became empty and `f == minFreq`, increment `minFreq`.',
          '`get`: if present, `touch` it and return the value.',
          '`put` on an existing key: update the value and `touch` it.',
          '`put` of a new key: if full, remove the first key of bucket `minFreq`; insert the new key into bucket 1 and set `minFreq = 1`.',
        ],
        time: 'O(1)', space: 'O(capacity)',
        why: 'Every step is a constant number of hash-map and linked-list operations. `minFreq` only ever increases by one during a touch, or resets to 1 on insertion, so it never needs a search.',
        code: {
          java: r`class LFUCache {
    private final int capacity;
    private int minFreq = 0;
    private final Map<Integer, int[]> entries = new HashMap<>(); // key -> {value, count}
    private final Map<Integer, LinkedHashSet<Integer>> buckets = new HashMap<>(); // count -> keys, oldest first

    public LFUCache(int capacity) {
        this.capacity = capacity;
    }

    public int get(int key) {
        int[] e = entries.get(key);
        if (e == null) return -1;
        touch(key, e);
        return e[0];
    }

    public void put(int key, int value) {
        int[] e = entries.get(key);
        if (e != null) {
            e[0] = value;
            touch(key, e);
            return;
        }
        if (entries.size() == capacity) {
            Iterator<Integer> oldest = buckets.get(minFreq).iterator();
            int victim = oldest.next();
            oldest.remove();
            entries.remove(victim);
        }
        entries.put(key, new int[] { value, 1 });
        buckets.computeIfAbsent(1, f -> new LinkedHashSet<>()).add(key);
        minFreq = 1;
    }

    private void touch(int key, int[] e) {
        LinkedHashSet<Integer> bucket = buckets.get(e[1]);
        bucket.remove(key);
        if (bucket.isEmpty() && minFreq == e[1]) minFreq++;
        e[1]++;
        buckets.computeIfAbsent(e[1], f -> new LinkedHashSet<>()).add(key);
    }
}`,
          cpp: r`class LFUCache {
    struct Entry { int value, count; list<int>::iterator pos; };
    int capacity, minFreq = 0;
    unordered_map<int, Entry> entries;
    unordered_map<int, list<int>> buckets; // count -> keys, oldest at the front

    void touch(int key, Entry& e) {
        auto& bucket = buckets[e.count];
        bucket.erase(e.pos);
        if (bucket.empty() && minFreq == e.count) minFreq++;
        e.count++;
        auto& next = buckets[e.count];
        e.pos = next.insert(next.end(), key);
    }
public:
    LFUCache(int capacity) : capacity(capacity) {}

    int get(int key) {
        auto it = entries.find(key);
        if (it == entries.end()) return -1;
        touch(key, it->second);
        return it->second.value;
    }

    void put(int key, int value) {
        auto it = entries.find(key);
        if (it != entries.end()) {
            it->second.value = value;
            touch(key, it->second);
            return;
        }
        if ((int) entries.size() == capacity) {
            auto& bucket = buckets[minFreq];
            entries.erase(bucket.front());
            bucket.pop_front();
        }
        auto& ones = buckets[1];
        entries[key] = {value, 1, ones.insert(ones.end(), key)};
        minFreq = 1;
    }
};`,
          python: r`class LFUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.min_freq = 0
        self.entries = {}  # key -> [value, count]
        self.buckets = defaultdict(OrderedDict)  # count -> keys, oldest first

    def _touch(self, key, e):
        bucket = self.buckets[e[1]]
        del bucket[key]
        if not bucket and self.min_freq == e[1]:
            self.min_freq += 1
        e[1] += 1
        self.buckets[e[1]][key] = None

    def get(self, key: int) -> int:
        e = self.entries.get(key)
        if e is None:
            return -1
        self._touch(key, e)
        return e[0]

    def put(self, key: int, value: int) -> None:
        if key in self.entries:
            e = self.entries[key]
            e[0] = value
            self._touch(key, e)
            return
        if len(self.entries) == self.capacity:
            victim, _ = self.buckets[self.min_freq].popitem(last=False)
            del self.entries[victim]
        self.entries[key] = [value, 1]
        self.buckets[1][key] = None
        self.min_freq = 1`,
          javascript: r`var LFUCache = function(capacity) {
    this.capacity = capacity;
    this.minFreq = 0;
    this.entries = new Map(); // key -> [value, count]
    this.buckets = new Map(); // count -> Set of keys, oldest first (insertion order)
};

LFUCache.prototype.bucket = function(count) {
    if (!this.buckets.has(count)) this.buckets.set(count, new Set());
    return this.buckets.get(count);
};

LFUCache.prototype.touch = function(key, e) {
    const bucket = this.bucket(e[1]);
    bucket.delete(key);
    if (bucket.size === 0 && this.minFreq === e[1]) this.minFreq++;
    e[1]++;
    this.bucket(e[1]).add(key);
};

LFUCache.prototype.get = function(key) {
    const e = this.entries.get(key);
    if (!e) return -1;
    this.touch(key, e);
    return e[0];
};

LFUCache.prototype.put = function(key, value) {
    const e = this.entries.get(key);
    if (e) {
        e[0] = value;
        this.touch(key, e);
        return;
    }
    if (this.entries.size === this.capacity) {
        const bucket = this.bucket(this.minFreq), victim = bucket.values().next().value;
        bucket.delete(victim);
        this.entries.delete(victim);
    }
    this.entries.set(key, [value, 1]);
    this.bucket(1).add(key);
    this.minFreq = 1;
};`,
        },
      },
    ],
  },

  'insert-delete-getrandom-o1-duplicates-allowed': {
    pattern: 'Array + hash map of value → set of indices; delete by swapping with the last element',
    approaches: [
      {
        level: 'Brute force', name: 'Array only',
        idea: 'Keep every copy in a dynamic array. A uniformly random index automatically weights each value by its number of copies.',
        steps: [
          '`insert`: note whether the value is already present (linear search), then append.',
          '`remove`: find one copy and delete it.',
          '`getRandom`: element at a uniformly random index.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'insert and remove search (and shift) the array; getRandom is O(1).',
        code: {
          java: r`class RandomizedCollection {
    private final List<Integer> values = new ArrayList<>();
    private final Random rng = new Random();

    public boolean insert(int val) {
        boolean absent = !values.contains(val);
        values.add(val);
        return absent;
    }

    public boolean remove(int val) {
        return values.remove(Integer.valueOf(val));
    }

    public int getRandom() {
        return values.get(rng.nextInt(values.size()));
    }
}`,
          cpp: r`class RandomizedCollection {
    vector<int> values;
    mt19937 rng{random_device{}()};
public:
    RandomizedCollection() {}

    bool insert(int val) {
        bool absent = find(values.begin(), values.end(), val) == values.end();
        values.push_back(val);
        return absent;
    }

    bool remove(int val) {
        auto it = find(values.begin(), values.end(), val);
        if (it == values.end()) return false;
        values.erase(it);
        return true;
    }

    int getRandom() {
        return values[uniform_int_distribution<int>(0, values.size() - 1)(rng)];
    }
};`,
          python: r`class RandomizedCollection:
    def __init__(self):
        self.values = []

    def insert(self, val: int) -> bool:
        absent = val not in self.values
        self.values.append(val)
        return absent

    def remove(self, val: int) -> bool:
        if val not in self.values:
            return False
        self.values.remove(val)
        return True

    def getRandom(self) -> int:
        return random.choice(self.values)`,
          javascript: r`var RandomizedCollection = function() {
    this.values = [];
};

RandomizedCollection.prototype.insert = function(val) {
    const absent = !this.values.includes(val);
    this.values.push(val);
    return absent;
};

RandomizedCollection.prototype.remove = function(val) {
    const i = this.values.indexOf(val);
    if (i < 0) return false;
    this.values.splice(i, 1);
    return true;
};

RandomizedCollection.prototype.getRandom = function() {
    return this.values[Math.floor(Math.random() * this.values.length)];
};`,
        },
      },
      {
        level: 'Optimal', name: 'Array + map of value → set of positions',
        idea: 'Like the no-duplicates version, but each value maps to the set of all positions holding a copy. To remove one copy, take any of its positions, move the last element into it, and fix both values\' position sets.',
        steps: [
          '`insert`: add `size` to `pos[val]`, append `val`; return whether the set was empty before.',
          '`remove`: if `pos[val]` is empty, return false. Take any `i` from it; let `last = values[n − 1]`.',
          'Set `values[i] = last`; add `i` to `pos[last]` and remove `n − 1` from it (in that order, which also works when `last == val` or `i == n − 1`); pop the end.',
          '`getRandom`: element at a uniformly random index.',
        ],
        time: 'O(1)', space: 'O(n)',
        why: 'Average O(1): a constant number of hash-set operations plus work at the array end. The array holds each copy once, so random indices are weighted by copy count.',
        code: {
          java: r`class RandomizedCollection {
    private final List<Integer> values = new ArrayList<>();
    private final Map<Integer, Set<Integer>> pos = new HashMap<>();
    private final Random rng = new Random();

    public boolean insert(int val) {
        Set<Integer> s = pos.computeIfAbsent(val, k -> new HashSet<>());
        s.add(values.size());
        values.add(val);
        return s.size() == 1;
    }

    public boolean remove(int val) {
        Set<Integer> s = pos.get(val);
        if (s == null || s.isEmpty()) return false;
        int i = s.iterator().next(), lastIndex = values.size() - 1, last = values.get(lastIndex);
        s.remove(i);
        values.set(i, last);
        Set<Integer> lastSet = pos.get(last);
        lastSet.add(i);
        lastSet.remove(lastIndex);
        values.remove(lastIndex);
        return true;
    }

    public int getRandom() {
        return values.get(rng.nextInt(values.size()));
    }
}`,
          cpp: r`class RandomizedCollection {
    vector<int> values;
    unordered_map<int, unordered_set<int>> pos;
    mt19937 rng{random_device{}()};
public:
    RandomizedCollection() {}

    bool insert(int val) {
        auto& s = pos[val];
        s.insert(values.size());
        values.push_back(val);
        return s.size() == 1;
    }

    bool remove(int val) {
        auto it = pos.find(val);
        if (it == pos.end() || it->second.empty()) return false;
        int i = *it->second.begin(), lastIndex = values.size() - 1, last = values[lastIndex];
        it->second.erase(i);
        values[i] = last;
        pos[last].insert(i);
        pos[last].erase(lastIndex);
        values.pop_back();
        return true;
    }

    int getRandom() {
        return values[uniform_int_distribution<int>(0, values.size() - 1)(rng)];
    }
};`,
          python: r`class RandomizedCollection:
    def __init__(self):
        self.values = []
        self.pos = defaultdict(set)

    def insert(self, val: int) -> bool:
        self.pos[val].add(len(self.values))
        self.values.append(val)
        return len(self.pos[val]) == 1

    def remove(self, val: int) -> bool:
        if not self.pos[val]:
            return False
        i = self.pos[val].pop()
        last_index, last = len(self.values) - 1, self.values[-1]
        self.values[i] = last
        self.pos[last].add(i)
        self.pos[last].discard(last_index)
        self.values.pop()
        return True

    def getRandom(self) -> int:
        return random.choice(self.values)`,
          javascript: r`var RandomizedCollection = function() {
    this.values = [];
    this.pos = new Map(); // value -> Set of indices
};

RandomizedCollection.prototype.insert = function(val) {
    if (!this.pos.has(val)) this.pos.set(val, new Set());
    const s = this.pos.get(val);
    s.add(this.values.length);
    this.values.push(val);
    return s.size === 1;
};

RandomizedCollection.prototype.remove = function(val) {
    const s = this.pos.get(val);
    if (!s || s.size === 0) return false;
    const i = s.values().next().value, lastIndex = this.values.length - 1, last = this.values[lastIndex];
    s.delete(i);
    this.values[i] = last;
    const lastSet = this.pos.get(last);
    lastSet.add(i);
    lastSet.delete(lastIndex);
    this.values.pop();
    return true;
};

RandomizedCollection.prototype.getRandom = function() {
    return this.values[Math.floor(Math.random() * this.values.length)];
};`,
        },
      },
    ],
  },
};
