export default [
  {
    slug: 'implement-queue-using-stacks', title: 'Implement Queue using Stacks', level: 'Easy',
    summary: 'Build a FIFO queue (push, pop, peek, empty) using only two stacks; aim for amortised O(1) per operation.',
    design: { cls: 'MyQueue', ctor: [], methods: [['void', 'push', [['int', 'x']]], ['int', 'pop', []], ['int', 'peek', []], ['boolean', 'empty', []]] },
    tests: [
      { in: [['MyQueue', 'push', 'push', 'peek', 'pop', 'empty'], [[], [1], [2], [], [], []]], out: [null, null, null, 1, 1, false] },
      { in: [['MyQueue', 'push', 'pop', 'empty', 'push', 'push', 'pop', 'peek'], [[], [5], [], [], [6], [7], [], []]] },
      { in: [['MyQueue', 'push', 'push', 'push', 'pop', 'push', 'pop', 'pop', 'pop', 'empty'], [[], [1], [2], [3], [], [4], [], [], [], []]] },
    ],
    ref: `class MyQueue {
    private final Deque<Integer> in = new ArrayDeque<>(), out = new ArrayDeque<>();
    public MyQueue() {}
    public void push(int x) { in.push(x); }
    public int pop() { peek(); return out.pop(); }
    public int peek() { if (out.isEmpty()) while (!in.isEmpty()) out.push(in.pop()); return out.peek(); }
    public boolean empty() { return in.isEmpty() && out.isEmpty(); }
}`,
  },
  {
    slug: 'design-hashmap', title: 'Design HashMap', level: 'Easy',
    summary: 'Build MyHashMap without built-in hash tables: put(key, value) inserts or updates, get(key) returns the value or -1, remove(key) deletes it.',
    design: { cls: 'MyHashMap', ctor: [], methods: [['void', 'put', [['int', 'key'], ['int', 'value']]], ['int', 'get', [['int', 'key']]], ['void', 'remove', [['int', 'key']]]] },
    tests: [
      { in: [['MyHashMap', 'put', 'put', 'get', 'get', 'put', 'get', 'remove', 'get'], [[], [1, 1], [2, 2], [1], [3], [2, 1], [2], [2], [2]]], out: [null, null, null, 1, -1, null, 1, null, -1] },
      { in: [['MyHashMap', 'put', 'put', 'put', 'get', 'remove', 'get', 'get'], [[], [0, 5], [1000000, 7], [10007, 3], [1000000], [0], [0], [10007]]] },
      { in: [['MyHashMap', 'remove', 'get', 'put', 'put', 'get'], [[], [4], [4], [4, 1], [4, 9], [4]]] },
    ],
    ref: `class MyHashMap {
    private static final int SIZE = 1009;
    private final List<int[]>[] buckets = new List[SIZE];
    public MyHashMap() {}
    private List<int[]> bucket(int key) { int b = key % SIZE; if (buckets[b] == null) buckets[b] = new ArrayList<>(); return buckets[b]; }
    public void put(int key, int value) { for (int[] e : bucket(key)) if (e[0] == key) { e[1] = value; return; } bucket(key).add(new int[] { key, value }); }
    public int get(int key) { for (int[] e : bucket(key)) if (e[0] == key) return e[1]; return -1; }
    public void remove(int key) { bucket(key).removeIf(e -> e[0] == key); }
}`,
  },
  {
    slug: 'min-stack', title: 'Min Stack', level: 'Medium',
    summary: 'Build a stack with push, pop, top and getMin, each in O(1).',
    design: { cls: 'MinStack', ctor: [], methods: [['void', 'push', [['int', 'val']]], ['void', 'pop', []], ['int', 'top', []], ['int', 'getMin', []]] },
    tests: [
      { in: [['MinStack', 'push', 'push', 'push', 'getMin', 'pop', 'top', 'getMin'], [[], [-2], [0], [-3], [], [], [], []]], out: [null, null, null, null, -3, null, 0, -2] },
      { in: [['MinStack', 'push', 'push', 'push', 'getMin', 'pop', 'getMin', 'pop', 'getMin'], [[], [5], [5], [6], [], [], [], [], []]] },
      { in: [['MinStack', 'push', 'getMin', 'top', 'push', 'getMin'], [[], [2147483647], [], [], [-2147483648], []]] },
    ],
    ref: `class MinStack {
    private final Deque<int[]> st = new ArrayDeque<>();
    public MinStack() {}
    public void push(int val) { st.push(new int[] { val, st.isEmpty() ? val : Math.min(val, st.peek()[1]) }); }
    public void pop() { st.pop(); }
    public int top() { return st.peek()[0]; }
    public int getMin() { return st.peek()[1]; }
}`,
  },
  {
    slug: 'lru-cache', title: 'LRU Cache', level: 'Medium',
    summary: 'LRUCache(capacity) supports get(key) (-1 if missing) and put(key, value); when full, put evicts the least recently used key. Both in O(1).',
    design: { cls: 'LRUCache', ctor: [['int', 'capacity']], methods: [['int', 'get', [['int', 'key']]], ['void', 'put', [['int', 'key'], ['int', 'value']]]] },
    tests: [
      { in: [['LRUCache', 'put', 'put', 'get', 'put', 'get', 'put', 'get', 'get', 'get'], [[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]], out: [null, null, null, 1, null, -1, null, -1, 3, 4] },
      { in: [['LRUCache', 'put', 'get', 'put', 'get', 'get'], [[1], [2, 1], [2], [3, 2], [2], [3]]] },
      { in: [['LRUCache', 'put', 'put', 'put', 'get', 'put', 'get', 'get'], [[2], [1, 1], [2, 2], [1, 10], [1], [3, 3], [2], [1]]] },
    ],
    ref: `class LRUCache {
    private final int capacity;
    private final LinkedHashMap<Integer, Integer> map = new LinkedHashMap<>(16, 0.75f, true);
    public LRUCache(int capacity) { this.capacity = capacity; }
    public int get(int key) { return map.getOrDefault(key, -1); }
    public void put(int key, int value) {
        map.put(key, value);
        if (map.size() > capacity) map.remove(map.keySet().iterator().next());
    }
}`,
  },
  {
    slug: 'insert-delete-getrandom-o1', title: 'Insert Delete GetRandom O(1)', level: 'Medium',
    summary: 'RandomizedSet supports insert(val) and remove(val) (each returns whether the set changed) and getRandom() (a uniformly random member), all in average O(1).',
    design: { cls: 'RandomizedSet', ctor: [], methods: [['boolean', 'insert', [['int', 'val']]], ['boolean', 'remove', [['int', 'val']]], ['int', 'getRandom', []]] },
    check: 'custom:randomizedSet',
    tests: [
      { in: [['RandomizedSet', 'insert', 'remove', 'insert', 'getRandom', 'remove', 'insert', 'getRandom'], [[], [1], [2], [2], [], [1], [2], []]] },
      { in: [['RandomizedSet', 'insert', 'insert', 'remove', 'insert', 'remove', 'getRandom'], [[], [0], [1], [0], [2], [1], []]] },
      { in: [['RandomizedSet', 'remove', 'insert', 'insert', 'getRandom', 'remove', 'insert', 'getRandom'], [[], [0], [-1], [-1], [], [-1], [3], []]] },
    ],
    ref: `class RandomizedSet {
    private final Map<Integer, Integer> at = new HashMap<>();
    private final List<Integer> vals = new ArrayList<>();
    private final Random rnd = new Random(1);
    public RandomizedSet() {}
    public boolean insert(int val) { if (at.containsKey(val)) return false; at.put(val, vals.size()); vals.add(val); return true; }
    public boolean remove(int val) {
        Integer i = at.remove(val);
        if (i == null) return false;
        int last = vals.remove(vals.size() - 1);
        if (i < vals.size()) { vals.set(i, last); at.put(last, i); }
        return true;
    }
    public int getRandom() { return vals.get(rnd.nextInt(vals.size())); }
}`,
  },
  {
    slug: 'time-based-key-value-store', title: 'Time Based Key-Value Store', level: 'Medium',
    summary: 'TimeMap.set(key, value, timestamp) stores a version (timestamps increase per key). get(key, timestamp) returns the value with the largest timestamp ≤ timestamp, or "".',
    design: { cls: 'TimeMap', ctor: [], methods: [['void', 'set', [['String', 'key'], ['String', 'value'], ['int', 'timestamp']]], ['String', 'get', [['String', 'key'], ['int', 'timestamp']]]] },
    tests: [
      { in: [['TimeMap', 'set', 'get', 'get', 'set', 'get', 'get'], [[], ['foo', 'bar', 1], ['foo', 1], ['foo', 3], ['foo', 'bar2', 4], ['foo', 4], ['foo', 5]]], out: [null, null, 'bar', 'bar', null, 'bar2', 'bar2'] },
      { in: [['TimeMap', 'get', 'set', 'get', 'get'], [[], ['a', 1], ['a', 'x', 5], ['a', 4], ['b', 9]]] },
      { in: [['TimeMap', 'set', 'set', 'set', 'get', 'get', 'get'], [[], ['k', 'v1', 10], ['k', 'v2', 20], ['k', 'v3', 30], ['k', 25], ['k', 30], ['k', 9]]] },
    ],
    ref: `class TimeMap {
    private final Map<String, TreeMap<Integer, String>> map = new HashMap<>();
    public TimeMap() {}
    public void set(String key, String value, int timestamp) { map.computeIfAbsent(key, k -> new TreeMap<>()).put(timestamp, value); }
    public String get(String key, int timestamp) {
        TreeMap<Integer, String> t = map.get(key);
        if (t == null) return "";
        Map.Entry<Integer, String> e = t.floorEntry(timestamp);
        return e == null ? "" : e.getValue();
    }
}`,
  },
  {
    slug: 'peeking-iterator', title: 'Peeking Iterator', level: 'Medium',
    summary: 'Wrap an Iterator<Integer> to add peek(), which returns the next element without advancing, alongside next() and hasNext().',
    design: { cls: 'PeekingIterator', implements: 'Iterator<Integer>', ctor: [['Iterator<Integer>', 'iterator']], methods: [['Integer', 'peek', []], ['Integer', 'next', []], ['boolean', 'hasNext', []]] },
    tests: [
      { in: [['PeekingIterator', 'next', 'peek', 'next', 'next', 'hasNext'], [[[1, 2, 3]], [], [], [], [], []]], out: [null, 1, 2, 2, 3, false] },
      { in: [['PeekingIterator', 'peek', 'peek', 'next', 'hasNext'], [[[7]], [], [], [], []]] },
      { in: [['PeekingIterator', 'hasNext', 'next', 'peek', 'hasNext', 'next', 'hasNext'], [[[4, 5]], [], [], [], [], [], []]] },
    ],
    ref: `class PeekingIterator implements Iterator<Integer> {
    private final Iterator<Integer> it;
    private Integer next;
    public PeekingIterator(Iterator<Integer> iterator) { it = iterator; next = it.hasNext() ? it.next() : null; }
    public Integer peek() { return next; }
    public Integer next() { Integer r = next; next = it.hasNext() ? it.next() : null; return r; }
    public boolean hasNext() { return next != null; }
}`,
  },
  {
    slug: 'flatten-nested-list-iterator', title: 'Flatten Nested List Iterator', level: 'Medium',
    summary: 'NestedIterator walks a nested list of integers (using the provided NestedInteger interface) and returns the integers in order through next() and hasNext(). The judge calls hasNext/next until done and prints what you return.',
    design: { cls: 'NestedIterator', implements: 'Iterator<Integer>', ctor: [['List<NestedInteger>', 'nestedList']], methods: [['Integer', 'next', []], ['boolean', 'hasNext', []]] },
    uses: ['NestedInteger'],
    params: [['List<NestedInteger>', 'nestedList']],
    call: 'NestedIterator it = new NestedIterator(BCBNI.build($0)); List<Integer> out = new ArrayList<>(); int guard = 0; while (it.hasNext() && guard++ < 100000) out.add(it.next()); Object r = out;',
    tests: [
      { in: [[[1, 1], 2, [1, 1]]], out: [1, 1, 2, 1, 1] },
      { in: [[1, [4, [6]]]], out: [1, 4, 6] },
      { in: [[[]]], out: [] },
      { in: [[[[[]]], 3, [[4]]]] },
      { in: [[]] },
    ],
    ref: `class NestedIterator implements Iterator<Integer> {
    private final Deque<Iterator<NestedInteger>> stack = new ArrayDeque<>();
    private Integer next;
    public NestedIterator(List<NestedInteger> nestedList) { stack.push(nestedList.iterator()); advance(); }
    private void advance() {
        next = null;
        while (!stack.isEmpty()) {
            if (!stack.peek().hasNext()) { stack.pop(); continue; }
            NestedInteger n = stack.peek().next();
            if (n.isInteger()) { next = n.getInteger(); return; }
            stack.push(n.getList().iterator());
        }
    }
    public Integer next() { Integer r = next; advance(); return r; }
    public boolean hasNext() { return next != null; }
}`,
  },
  {
    slug: 'snapshot-array', title: 'Snapshot Array', level: 'Medium',
    summary: 'SnapshotArray(length) starts all zeros. set(index, val) writes, snap() takes a snapshot and returns its id (0, 1, …), get(index, snapId) reads the value at that snapshot.',
    design: { cls: 'SnapshotArray', ctor: [['int', 'length']], methods: [['void', 'set', [['int', 'index'], ['int', 'val']]], ['int', 'snap', []], ['int', 'get', [['int', 'index'], ['int', 'snap_id']]]] },
    tests: [
      { in: [['SnapshotArray', 'set', 'snap', 'set', 'get'], [[3], [0, 5], [], [0, 6], [0, 0]]], out: [null, null, 0, null, 5] },
      { in: [['SnapshotArray', 'snap', 'snap', 'get', 'set', 'snap', 'get', 'get'], [[2], [], [], [1, 1], [1, 4], [], [1, 2], [1, 1]]] },
      { in: [['SnapshotArray', 'set', 'set', 'snap', 'set', 'snap', 'get', 'get', 'get'], [[1], [0, 1], [0, 2], [], [0, 3], [], [0, 0], [0, 1], [0, 0]]] },
    ],
    ref: `class SnapshotArray {
    private final TreeMap<Integer, Integer>[] hist;
    private int snaps = 0;
    public SnapshotArray(int length) { hist = new TreeMap[length]; for (int i = 0; i < length; i++) { hist[i] = new TreeMap<>(); hist[i].put(0, 0); } }
    public void set(int index, int val) { hist[index].put(snaps, val); }
    public int snap() { return snaps++; }
    public int get(int index, int snap_id) { return hist[index].floorEntry(snap_id).getValue(); }
}`,
  },
  {
    slug: 'design-twitter', title: 'Design Twitter', level: 'Medium',
    summary: 'Twitter supports postTweet(userId, tweetId), follow, unfollow, and getNewsFeed(userId): the 10 most recent tweet ids from the user and the people they follow, newest first.',
    design: { cls: 'Twitter', ctor: [], methods: [['void', 'postTweet', [['int', 'userId'], ['int', 'tweetId']]], ['List<Integer>', 'getNewsFeed', [['int', 'userId']]], ['void', 'follow', [['int', 'followerId'], ['int', 'followeeId']]], ['void', 'unfollow', [['int', 'followerId'], ['int', 'followeeId']]]] },
    tests: [
      { in: [['Twitter', 'postTweet', 'getNewsFeed', 'follow', 'postTweet', 'getNewsFeed', 'unfollow', 'getNewsFeed'], [[], [1, 5], [1], [1, 2], [2, 6], [1], [1, 2], [1]]], out: [null, null, [5], null, null, [6, 5], null, [5]] },
      { in: [['Twitter', 'postTweet', 'postTweet', 'postTweet', 'postTweet', 'postTweet', 'postTweet', 'postTweet', 'postTweet', 'postTweet', 'postTweet', 'postTweet', 'getNewsFeed'], [[], [1, 5], [1, 3], [1, 101], [1, 13], [1, 10], [1, 2], [1, 94], [1, 505], [1, 333], [1, 22], [1, 11], [1]]] },
      { in: [['Twitter', 'follow', 'follow', 'postTweet', 'getNewsFeed', 'unfollow', 'getNewsFeed', 'follow', 'getNewsFeed'], [[], [1, 1], [2, 1], [1, 7], [2], [2, 1], [2], [3, 3], [3]]] },
    ],
    ref: `class Twitter {
    private int clock = 0;
    private final Map<Integer, List<int[]>> tweets = new HashMap<>();
    private final Map<Integer, Set<Integer>> follows = new HashMap<>();
    public Twitter() {}
    public void postTweet(int userId, int tweetId) { tweets.computeIfAbsent(userId, k -> new ArrayList<>()).add(new int[] { clock++, tweetId }); }
    public List<Integer> getNewsFeed(int userId) {
        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));
        Set<Integer> people = new HashSet<>(follows.getOrDefault(userId, Set.of()));
        people.add(userId);
        for (int p : people) for (int[] t : tweets.getOrDefault(p, List.of())) { pq.add(t); if (pq.size() > 10) pq.poll(); }
        LinkedList<Integer> out = new LinkedList<>();
        while (!pq.isEmpty()) out.addFirst(pq.poll()[1]);
        return out;
    }
    public void follow(int followerId, int followeeId) { follows.computeIfAbsent(followerId, k -> new HashSet<>()).add(followeeId); }
    public void unfollow(int followerId, int followeeId) { follows.getOrDefault(followerId, new HashSet<>()).remove(followeeId); }
}`,
  },
  {
    slug: 'lfu-cache', title: 'LFU Cache', level: 'Hard',
    summary: 'LFUCache(capacity) supports get and put in O(1). When full, put evicts the least frequently used key, breaking ties by least recently used.',
    design: { cls: 'LFUCache', ctor: [['int', 'capacity']], methods: [['int', 'get', [['int', 'key']]], ['void', 'put', [['int', 'key'], ['int', 'value']]]] },
    tests: [
      { in: [['LFUCache', 'put', 'put', 'get', 'put', 'get', 'get', 'put', 'get', 'get', 'get'], [[2], [1, 1], [2, 2], [1], [3, 3], [2], [3], [4, 4], [1], [3], [4]]], out: [null, null, null, 1, null, -1, 3, null, -1, 3, 4] },
      { in: [['LFUCache', 'put', 'get', 'put', 'get', 'get'], [[1], [2, 1], [2], [3, 2], [2], [3]]] },
      { in: [['LFUCache', 'put', 'put', 'get', 'get', 'put', 'get', 'get', 'get'], [[2], [1, 1], [2, 2], [2], [2], [3, 3], [1], [2], [3]]] },
    ],
    ref: `class LFUCache {
    private final int capacity;
    private final Map<Integer, int[]> vals = new HashMap<>();
    private final Map<Integer, LinkedHashSet<Integer>> byFreq = new HashMap<>();
    private int minFreq = 0;
    public LFUCache(int capacity) { this.capacity = capacity; }
    private void touch(int key) {
        int[] v = vals.get(key);
        byFreq.get(v[1]).remove(key);
        if (byFreq.get(v[1]).isEmpty() && minFreq == v[1]) minFreq++;
        v[1]++;
        byFreq.computeIfAbsent(v[1], k -> new LinkedHashSet<>()).add(key);
    }
    public int get(int key) { if (!vals.containsKey(key)) return -1; touch(key); return vals.get(key)[0]; }
    public void put(int key, int value) {
        if (capacity == 0) return;
        if (vals.containsKey(key)) { vals.get(key)[0] = value; touch(key); return; }
        if (vals.size() == capacity) { int evict = byFreq.get(minFreq).iterator().next(); byFreq.get(minFreq).remove(evict); vals.remove(evict); }
        vals.put(key, new int[] { value, 1 });
        byFreq.computeIfAbsent(1, k -> new LinkedHashSet<>()).add(key);
        minFreq = 1;
    }
}`,
  },
  {
    slug: 'insert-delete-getrandom-o1-duplicates-allowed', title: 'Insert Delete GetRandom O(1) - Duplicates allowed', level: 'Hard',
    summary: 'RandomizedCollection is a multiset: insert(val) returns true if val was absent, remove(val) removes one copy and returns whether one existed, getRandom() picks with probability proportional to count. All in average O(1).',
    design: { cls: 'RandomizedCollection', ctor: [], methods: [['boolean', 'insert', [['int', 'val']]], ['boolean', 'remove', [['int', 'val']]], ['int', 'getRandom', []]] },
    check: 'custom:randomizedSet',
    tests: [
      { in: [['RandomizedCollection', 'insert', 'insert', 'insert', 'getRandom', 'remove', 'getRandom'], [[], [1], [1], [2], [], [1], []]] },
      { in: [['RandomizedCollection', 'insert', 'remove', 'remove', 'insert', 'getRandom'], [[], [4], [4], [4], [5], []]] },
      { in: [['RandomizedCollection', 'insert', 'insert', 'remove', 'remove', 'insert', 'getRandom'], [[], [9], [9], [9], [9], [3], []]] },
    ],
    ref: `class RandomizedCollection {
    private final List<Integer> vals = new ArrayList<>();
    private final Map<Integer, Set<Integer>> at = new HashMap<>();
    private final Random rnd = new Random(1);
    public RandomizedCollection() {}
    public boolean insert(int val) {
        Set<Integer> s = at.computeIfAbsent(val, k -> new LinkedHashSet<>());
        s.add(vals.size()); vals.add(val);
        return s.size() == 1;
    }
    public boolean remove(int val) {
        Set<Integer> s = at.get(val);
        if (s == null || s.isEmpty()) return false;
        int i = s.iterator().next(); s.remove(i);
        int lastIdx = vals.size() - 1, last = vals.get(lastIdx);
        if (i != lastIdx) { vals.set(i, last); at.get(last).remove(lastIdx); at.get(last).add(i); }
        vals.remove(lastIdx);
        return true;
    }
    public int getRandom() { return vals.get(rnd.nextInt(vals.size())); }
}`,
  },
  {
    slug: 'design-hashset', title: 'Design HashSet', level: 'Easy',
    summary: 'Build MyHashSet without built-in hash tables: add(key), remove(key) and contains(key).',
    design: { cls: 'MyHashSet', ctor: [], methods: [['void', 'add', [['int', 'key']]], ['void', 'remove', [['int', 'key']]], ['boolean', 'contains', [['int', 'key']]]] },
    tests: [
      { in: [['MyHashSet', 'add', 'add', 'contains', 'contains', 'add', 'contains', 'remove', 'contains'], [[], [1], [2], [1], [3], [2], [2], [2], [2]]], out: [null, null, null, true, false, null, true, null, false] },
      { in: [['MyHashSet', 'remove', 'contains', 'add', 'add', 'contains', 'remove', 'contains'], [[], [5], [5], [0], [1000000], [1000000], [0], [0]]] },
      { in: [['MyHashSet', 'add', 'add', 'add', 'remove', 'contains', 'contains'], [[], [1009], [2018], [0], [1009], [2018], [1009]]] },
    ],
    ref: `class MyHashSet {
    private static final int SIZE = 1009;
    private final List<Integer>[] buckets = new List[SIZE];
    public MyHashSet() {}
    private List<Integer> bucket(int key) { int b = key % SIZE; if (buckets[b] == null) buckets[b] = new ArrayList<>(); return buckets[b]; }
    public void add(int key) { if (!bucket(key).contains(key)) bucket(key).add(key); }
    public void remove(int key) { bucket(key).remove(Integer.valueOf(key)); }
    public boolean contains(int key) { return bucket(key).contains(key); }
}`,
  },
  {
    slug: 'implement-stack-using-queues', title: 'Implement Stack using Queues', level: 'Easy',
    summary: 'Build a last-in-first-out stack MyStack (push, pop, top, empty) using only queue operations: add to the back, remove from the front, peek the front, size and isEmpty.',
    design: { cls: 'MyStack', ctor: [], methods: [['void', 'push', [['int', 'x']]], ['int', 'pop', []], ['int', 'top', []], ['boolean', 'empty', []]] },
    tests: [
      { in: [['MyStack', 'push', 'push', 'top', 'pop', 'empty'], [[], [1], [2], [], [], []]], out: [null, null, null, 2, 2, false] },
      { in: [['MyStack', 'empty', 'push', 'empty', 'pop', 'empty'], [[], [], [9], [], [], []]] },
      { in: [['MyStack', 'push', 'push', 'push', 'pop', 'push', 'top', 'pop', 'pop', 'top'], [[], [1], [2], [3], [], [4], [], [], [], []]] },
    ],
    ref: `class MyStack {
    private final Queue<Integer> q = new ArrayDeque<>();
    public MyStack() {}
    public void push(int x) { q.add(x); for (int i = 1; i < q.size(); i++) q.add(q.poll()); }
    public int pop() { return q.poll(); }
    public int top() { return q.peek(); }
    public boolean empty() { return q.isEmpty(); }
}`,
  },
  {
    slug: 'design-circular-queue', title: 'Design Circular Queue', level: 'Medium',
    summary: 'Build MyCircularQueue(k), a fixed-capacity FIFO queue on a ring buffer: enQueue and deQueue return whether they succeeded, Front and Rear return -1 when empty, plus isEmpty and isFull.',
    design: {
      cls: 'MyCircularQueue', ctor: [['int', 'k']],
      methods: [['boolean', 'enQueue', [['int', 'value']]], ['boolean', 'deQueue', []], ['int', 'Front', []], ['int', 'Rear', []], ['boolean', 'isEmpty', []], ['boolean', 'isFull', []]],
    },
    tests: [
      { in: [['MyCircularQueue', 'enQueue', 'enQueue', 'enQueue', 'enQueue', 'Rear', 'isFull', 'deQueue', 'enQueue', 'Rear'], [[3], [1], [2], [3], [4], [], [], [], [4], []]], out: [null, true, true, true, false, 3, true, true, true, 4] },
      { in: [['MyCircularQueue', 'Front', 'Rear', 'deQueue', 'isEmpty', 'enQueue', 'Front', 'Rear', 'isFull'], [[1], [], [], [], [], [7], [], [], []]] },
      { in: [['MyCircularQueue', 'enQueue', 'enQueue', 'deQueue', 'enQueue', 'enQueue', 'deQueue', 'Front', 'Rear', 'deQueue', 'deQueue', 'isEmpty'], [[2], [1], [2], [], [3], [4], [], [], [], [], [], []]] },
    ],
    ref: `class MyCircularQueue {
    private final int[] a; private int head = 0, size = 0;
    public MyCircularQueue(int k) { a = new int[k]; }
    public boolean enQueue(int value) { if (isFull()) return false; a[(head + size) % a.length] = value; size++; return true; }
    public boolean deQueue() { if (isEmpty()) return false; head = (head + 1) % a.length; size--; return true; }
    public int Front() { return isEmpty() ? -1 : a[head]; }
    public int Rear() { return isEmpty() ? -1 : a[(head + size - 1) % a.length]; }
    public boolean isEmpty() { return size == 0; }
    public boolean isFull() { return size == a.length; }
}`,
  },
  {
    slug: 'detect-squares', title: 'Detect Squares', level: 'Medium',
    summary: 'DetectSquares stores points (duplicates count separately). count(point) returns how many ways you can pick three stored points that, with the query point, form an axis-aligned square of positive area.',
    design: { cls: 'DetectSquares', ctor: [], methods: [['void', 'add', [['int[]', 'point']]], ['int', 'count', [['int[]', 'point']]]] },
    tests: [
      { in: [['DetectSquares', 'add', 'add', 'add', 'count', 'count', 'add', 'count'], [[], [[3, 10]], [[11, 2]], [[3, 2]], [[11, 10]], [[14, 8]], [[11, 2]], [[11, 10]]]], out: [null, null, null, null, 1, 0, null, 2] },
      { in: [['DetectSquares', 'count', 'add', 'add', 'add', 'count', 'count'], [[], [[0, 0]], [[0, 1]], [[1, 0]], [[1, 1]], [[0, 0]], [[1, 1]]]] },
      { in: [['DetectSquares', 'add', 'add', 'add', 'add', 'add', 'count', 'count'], [[], [[5, 5]], [[5, 7]], [[7, 5]], [[3, 5]], [[3, 7]], [[5, 5]], [[7, 7]]]] },
      { in: [['DetectSquares', 'add', 'add', 'count'], [[], [[2, 2]], [[2, 2]], [[2, 2]]]] },
    ],
    ref: `class DetectSquares {
    private final int[][] cnt = new int[1001][1001];
    private final List<int[]> pts = new ArrayList<>();
    public DetectSquares() {}
    public void add(int[] point) { if (cnt[point[0]][point[1]]++ == 0) pts.add(point); }
    public int count(int[] point) {
        int x = point[0], y = point[1], total = 0;
        for (int[] p : pts) {
            int px = p[0], py = p[1];
            if (Math.abs(px - x) != Math.abs(py - y) || px == x) continue;
            total += cnt[px][py] * cnt[x][py] * cnt[px][y];
        }
        return total;
    }
}`,
  },
  {
    slug: 'maximum-frequency-stack', title: 'Maximum Frequency Stack', level: 'Hard',
    summary: 'FreqStack: push(val) adds a value; pop() removes and returns the most frequent value in the stack, and among equally frequent values the one pushed most recently.',
    design: { cls: 'FreqStack', ctor: [], methods: [['void', 'push', [['int', 'val']]], ['int', 'pop', []]] },
    tests: [
      { in: [['FreqStack', 'push', 'push', 'push', 'push', 'push', 'push', 'pop', 'pop', 'pop', 'pop'], [[], [5], [7], [5], [7], [4], [5], [], [], [], []]], out: [null, null, null, null, null, null, null, 5, 7, 5, 4] },
      { in: [['FreqStack', 'push', 'pop', 'push', 'push', 'pop', 'pop'], [[], [1], [], [2], [3], [], []]] },
      { in: [['FreqStack', 'push', 'push', 'push', 'push', 'pop', 'push', 'pop', 'pop', 'pop', 'pop'], [[], [1000000000], [0], [1000000000], [0], [], [0], [], [], [], []]] },
    ],
    ref: `class FreqStack {
    private final Map<Integer, Integer> freq = new HashMap<>();
    private final List<Deque<Integer>> groups = new ArrayList<>();
    public FreqStack() {}
    public void push(int val) {
        int f = freq.merge(val, 1, Integer::sum);
        if (f > groups.size()) groups.add(new ArrayDeque<>());
        groups.get(f - 1).push(val);
    }
    public int pop() {
        Deque<Integer> top = groups.get(groups.size() - 1);
        int val = top.pop();
        if (top.isEmpty()) groups.remove(groups.size() - 1);
        freq.merge(val, -1, Integer::sum);
        return val;
    }
}`,
  },
  {
    slug: 'smallest-number-in-infinite-set', title: 'Smallest Number in Infinite Set', level: 'Medium',
    summary: 'The set starts with every positive integer. popSmallest removes and returns the smallest; addBack(num) puts num back if it isn\'t already in the set.',
    design: { cls: 'SmallestInfiniteSet', ctor: [], methods: [['int', 'popSmallest', []], ['void', 'addBack', [['int', 'num']]]] },
    tests: [
      { in: [['SmallestInfiniteSet', 'addBack', 'popSmallest', 'popSmallest', 'popSmallest', 'addBack', 'popSmallest', 'popSmallest', 'popSmallest'], [[], [2], [], [], [], [1], [], [], []]], out: [null, null, 1, 2, 3, null, 1, 4, 5] },
      { in: [['SmallestInfiniteSet', 'popSmallest', 'addBack', 'addBack', 'popSmallest', 'popSmallest'], [[], [], [1], [1], [], []]] },
      { in: [['SmallestInfiniteSet', 'popSmallest', 'popSmallest', 'popSmallest', 'addBack', 'addBack', 'popSmallest', 'popSmallest', 'popSmallest'], [[], [], [], [], [3], [1], [], [], []]] },
    ],
    ref: `class SmallestInfiniteSet {
    private int next = 1;
    private final TreeSet<Integer> added = new TreeSet<>();
    public SmallestInfiniteSet() {}
    public int popSmallest() { return added.isEmpty() ? next++ : added.pollFirst(); }
    public void addBack(int num) { if (num < next) added.add(num); }
}`,
  },
  {
    slug: 'seat-reservation-manager', title: 'Seat Reservation Manager', level: 'Medium',
    summary: 'Seats 1 … n start unreserved. reserve() takes and returns the lowest-numbered unreserved seat; unreserve(seatNumber) frees a reserved seat.',
    design: { cls: 'SeatManager', ctor: [['int', 'n']], methods: [['int', 'reserve', []], ['void', 'unreserve', [['int', 'seatNumber']]]] },
    tests: [
      { in: [['SeatManager', 'reserve', 'reserve', 'unreserve', 'reserve', 'reserve', 'reserve', 'reserve', 'unreserve'], [[5], [], [], [2], [], [], [], [], [5]]], out: [null, 1, 2, null, 2, 3, 4, 5, null] },
      { in: [['SeatManager', 'reserve', 'unreserve', 'reserve'], [[1], [], [1], []]] },
      { in: [['SeatManager', 'reserve', 'reserve', 'reserve', 'unreserve', 'unreserve', 'reserve', 'reserve', 'reserve'], [[4], [], [], [], [3], [1], [], [], []]] },
    ],
    ref: `class SeatManager {
    private final PriorityQueue<Integer> returned = new PriorityQueue<>();
    private int next = 1;
    public SeatManager(int n) {}
    public int reserve() { return returned.isEmpty() ? next++ : returned.poll(); }
    public void unreserve(int seatNumber) { returned.add(seatNumber); }
}`,
  },
  {
    slug: 'stock-price-fluctuation', title: 'Stock Price Fluctuation', level: 'Medium',
    summary: 'Records (timestamp, price) arrive out of order, and a later record for the same timestamp corrects the earlier one. Support update, current (price at the latest timestamp), maximum and minimum (over the corrected prices).',
    design: { cls: 'StockPrice', ctor: [], methods: [['void', 'update', [['int', 'timestamp'], ['int', 'price']]], ['int', 'current', []], ['int', 'maximum', []], ['int', 'minimum', []]] },
    tests: [
      { in: [['StockPrice', 'update', 'update', 'current', 'maximum', 'update', 'maximum', 'update', 'minimum'], [[], [1, 10], [2, 5], [], [], [1, 3], [], [4, 2], []]], out: [null, null, null, 5, 10, null, 5, null, 2] },
      { in: [['StockPrice', 'update', 'maximum', 'minimum', 'current', 'update', 'current', 'maximum', 'minimum'], [[], [5, 1000000000], [], [], [], [5, 1], [], [], []]] },
      { in: [['StockPrice', 'update', 'update', 'update', 'update', 'update', 'maximum', 'minimum', 'current'], [[], [3, 9], [1, 8], [2, 7], [3, 1], [1, 2], [], [], []]] },
    ],
    ref: `class StockPrice {
    private final Map<Integer, Integer> price = new HashMap<>();
    private final PriorityQueue<int[]> maxH = new PriorityQueue<>((a, b) -> b[0] - a[0]);
    private final PriorityQueue<int[]> minH = new PriorityQueue<>((a, b) -> a[0] - b[0]);
    private int latest = 0;
    public StockPrice() {}
    public void update(int timestamp, int p) {
        price.put(timestamp, p);
        latest = Math.max(latest, timestamp);
        maxH.add(new int[] { p, timestamp });
        minH.add(new int[] { p, timestamp });
    }
    public int current() { return price.get(latest); }
    public int maximum() { return top(maxH); }
    public int minimum() { return top(minH); }
    private int top(PriorityQueue<int[]> h) {
        while (price.get(h.peek()[1]) != h.peek()[0]) h.poll();
        return h.peek()[0];
    }
}`,
  },
  {
    slug: 'design-a-number-container-system', title: 'Design a Number Container System', level: 'Medium',
    summary: 'change(index, number) stores number at index, replacing any number there. find(number) returns the smallest index currently holding number, or −1.',
    design: { cls: 'NumberContainers', ctor: [], methods: [['void', 'change', [['int', 'index'], ['int', 'number']]], ['int', 'find', [['int', 'number']]]] },
    tests: [
      { in: [['NumberContainers', 'find', 'change', 'change', 'change', 'change', 'find', 'change', 'find'], [[], [10], [2, 10], [1, 10], [3, 10], [5, 10], [10], [1, 20], [10]]], out: [null, -1, null, null, null, null, 1, null, 2] },
      { in: [['NumberContainers', 'change', 'change', 'find', 'change', 'find', 'find'], [[], [1, 5], [1, 5], [5], [1, 6], [5], [6]]] },
      { in: [['NumberContainers', 'change', 'change', 'change', 'find', 'change', 'change', 'find'], [[], [1000000000, 7], [3, 7], [3, 8], [7], [1000000000, 8], [5, 7], [7]]] },
    ],
    ref: `class NumberContainers {
    private final Map<Integer, Integer> at = new HashMap<>();
    private final Map<Integer, PriorityQueue<Integer>> where = new HashMap<>();
    public NumberContainers() {}
    public void change(int index, int number) {
        at.put(index, number);
        where.computeIfAbsent(number, x -> new PriorityQueue<>()).add(index);
    }
    public int find(int number) {
        PriorityQueue<Integer> h = where.get(number);
        if (h == null) return -1;
        while (!h.isEmpty() && at.get(h.peek()) != number) h.poll();
        return h.isEmpty() ? -1 : h.peek();
    }
}`,
  },
  {
    slug: 'design-a-food-rating-system', title: 'Design a Food Rating System', level: 'Medium',
    summary: 'Given foods with their cuisines and ratings, support changeRating(food, newRating) and highestRated(cuisine): the highest-rated food of that cuisine, the lexicographically smaller name on a tie.',
    design: { cls: 'FoodRatings', ctor: [['String[]', 'foods'], ['String[]', 'cuisines'], ['int[]', 'ratings']], methods: [['void', 'changeRating', [['String', 'food'], ['int', 'newRating']]], ['String', 'highestRated', [['String', 'cuisine']]]] },
    tests: [
      { in: [['FoodRatings', 'highestRated', 'highestRated', 'changeRating', 'highestRated', 'changeRating', 'highestRated'], [[['kimchi', 'miso', 'sushi', 'moussaka', 'ramen', 'bulgogi'], ['korean', 'japanese', 'japanese', 'greek', 'japanese', 'korean'], [9, 12, 8, 15, 14, 7]], ['korean'], ['japanese'], ['sushi', 16], ['japanese'], ['ramen', 16], ['japanese']]], out: [null, 'kimchi', 'ramen', null, 'sushi', null, 'ramen'] },
      { in: [['FoodRatings', 'highestRated', 'changeRating', 'highestRated', 'changeRating', 'highestRated'], [[['a'], ['x'], [5]], ['x'], ['a', 1], ['x'], ['a', 100000000], ['x']]] },
      { in: [['FoodRatings', 'highestRated', 'changeRating', 'highestRated', 'changeRating', 'highestRated'], [[['b', 'a', 'c'], ['x', 'x', 'y'], [3, 3, 9]], ['x'], ['a', 2], ['x'], ['b', 1], ['x']]] },
    ],
    ref: `class FoodRatings {
    private record Entry(int rating, String food) {}
    private final Map<String, Integer> rating = new HashMap<>();
    private final Map<String, String> cuisineOf = new HashMap<>();
    private final Map<String, PriorityQueue<Entry>> best = new HashMap<>();
    public FoodRatings(String[] foods, String[] cuisines, int[] ratings) {
        for (int i = 0; i < foods.length; i++) {
            cuisineOf.put(foods[i], cuisines[i]);
            best.computeIfAbsent(cuisines[i], c -> new PriorityQueue<>(
                (a, b) -> a.rating() != b.rating() ? Integer.compare(b.rating(), a.rating()) : a.food().compareTo(b.food())));
            changeRating(foods[i], ratings[i]);
        }
    }
    public void changeRating(String food, int newRating) {
        rating.put(food, newRating);
        best.get(cuisineOf.get(food)).add(new Entry(newRating, food));
    }
    public String highestRated(String cuisine) {
        PriorityQueue<Entry> h = best.get(cuisine);
        while (h.peek().rating() != rating.get(h.peek().food())) h.poll();
        return h.peek().food();
    }
}`,
  },
  {
    slug: 'exam-room', title: 'Exam Room', level: 'Medium',
    summary: 'An exam room has seats 0 … n − 1 in a row. seat() puts a student in the seat that maximises the distance to the closest student (lowest seat on a tie; seat 0 if the room is empty) and returns it. leave(p) frees seat p.',
    design: { cls: 'ExamRoom', ctor: [['int', 'n']], methods: [['int', 'seat', []], ['void', 'leave', [['int', 'p']]]] },
    tests: [
      { in: [['ExamRoom', 'seat', 'seat', 'seat', 'seat', 'leave', 'seat'], [[10], [], [], [], [], [4], []]], out: [null, 0, 9, 4, 2, null, 5] },
      { in: [['ExamRoom', 'seat', 'leave', 'seat'], [[1], [], [0], []]] },
      { in: [['ExamRoom', 'seat', 'seat', 'seat', 'leave', 'leave', 'seat', 'seat'], [[1000000000], [], [], [], [0], [999999999], [], []]] },
      { in: [['ExamRoom', 'seat', 'seat', 'seat', 'seat', 'leave', 'leave', 'seat'], [[4], [], [], [], [], [1], [3], []]] },
    ],
    ref: `class ExamRoom {
    private final int n;
    private final TreeSet<Integer> seated = new TreeSet<>();
    public ExamRoom(int n) { this.n = n; }
    public int seat() {
        if (seated.isEmpty()) { seated.add(0); return 0; }
        int bestSeat = 0, bestDist = seated.first();
        Integer prev = null;
        for (int s : seated) {
            if (prev != null && (s - prev) / 2 > bestDist) { bestDist = (s - prev) / 2; bestSeat = prev + bestDist; }
            prev = s;
        }
        if (n - 1 - seated.last() > bestDist) bestSeat = n - 1;
        seated.add(bestSeat);
        return bestSeat;
    }
    public void leave(int p) { seated.remove(p); }
}`,
  },
  // ---- queue design and queue simulations
  {
    slug: 'number-of-recent-calls', title: 'Number of Recent Calls', level: 'Easy',
    summary: 'RecentCounter.ping(t) records a request at time t (strictly increasing) and returns how many requests fall in the last 3000 ms, [t − 3000, t].',
    design: { cls: 'RecentCounter', ctor: [], methods: [['int', 'ping', [['int', 't']]]] },
    tests: [
      { in: [['RecentCounter', 'ping', 'ping', 'ping', 'ping'], [[], [1], [100], [3001], [3002]]], out: [null, 1, 2, 3, 3] },
      { in: [['RecentCounter', 'ping'], [[], [1000000000]]] },
      { in: [['RecentCounter', 'ping', 'ping', 'ping', 'ping', 'ping'], [[], [1], [3001], [3002], [6002], [6003]]] },
    ],
    ref: `class RecentCounter {
    private final ArrayDeque<Integer> q = new ArrayDeque<>();
    public RecentCounter() {}
    public int ping(int t) {
        q.offerLast(t);
        while (q.peekFirst() < t - 3000) q.pollFirst();
        return q.size();
    }
}`,
  },
  {
    slug: 'time-needed-to-buy-tickets', title: 'Time Needed to Buy Tickets', level: 'Easy',
    summary: 'People stand in a line; person i wants tickets[i] tickets. Each second the person at the front buys one ticket and, if they still need more, goes to the back. Return how many seconds pass until person k has all their tickets.',
    method: 'timeRequiredToBuy', params: [['int[]', 'tickets'], ['int', 'k']], returns: 'int',
    tests: [
      { in: [[2, 3, 2], 2], out: 6 },
      { in: [[5, 1, 1, 1], 0], out: 8 },
      { in: [[1], 0] },
      { in: [[100, 100, 100], 1] },
      { in: [[3, 1, 4, 1, 5], 4] },
    ],
    ref: `class Solution {
    public int timeRequiredToBuy(int[] tickets, int k) {
        int t = 0;
        for (int i = 0; i < tickets.length; i++)
            t += Math.min(tickets[i], i <= k ? tickets[k] : tickets[k] - 1);
        return t;
    }
}`,
  },
  {
    slug: 'number-of-students-unable-to-eat-lunch', title: 'Number of Students Unable to Eat Lunch', level: 'Easy',
    summary: 'Students in a queue each prefer sandwich 0 or 1; sandwiches sit in a stack. The front student takes the top sandwich if it matches, otherwise goes to the back. Return how many students are left when nobody in the queue wants the top sandwich.',
    method: 'countStudents', params: [['int[]', 'students'], ['int[]', 'sandwiches']], returns: 'int',
    tests: [
      { in: [[1, 1, 0, 0], [0, 1, 0, 1]], out: 0 },
      { in: [[1, 1, 1, 0, 0, 1], [1, 0, 0, 0, 1, 1]], out: 3 },
      { in: [[0], [1]] },
      { in: [[1], [1]] },
      { in: [[0, 0, 0, 1], [1, 1, 0, 0]] },
    ],
    ref: `class Solution {
    public int countStudents(int[] students, int[] sandwiches) {
        int[] want = new int[2];
        for (int s : students) want[s]++;
        for (int i = 0; i < sandwiches.length; i++) {
            if (want[sandwiches[i]] == 0) return sandwiches.length - i;
            want[sandwiches[i]]--;
        }
        return 0;
    }
}`,
  },
  {
    slug: 'number-of-people-aware-of-a-secret', title: 'Number of People Aware of a Secret', level: 'Medium',
    summary: 'On day 1 one person learns a secret. Each person starts sharing it with one new person per day from `delay` days after learning it, and forgets it `forget` days after learning it (and stops sharing). Return how many people know the secret at the end of day n, modulo 10⁹ + 7.',
    method: 'peopleAwareOfSecret', params: [['int', 'n'], ['int', 'delay'], ['int', 'forget']], returns: 'int',
    tests: [
      { in: [6, 2, 4], out: 5 },
      { in: [4, 1, 3], out: 6 },
      { in: [2, 1, 2] },
      { in: [1000, 1, 1000] },
      { in: [1000, 999, 1000] },
      { in: [10, 3, 5] },
    ],
    ref: `class Solution {
    public int peopleAwareOfSecret(int n, int delay, int forget) {
        final long MOD = 1_000_000_007L;
        long[] learned = new long[n + 1];       // learned[d]: people who learn on day d
        learned[1] = 1;
        long sharing = 0;                       // people able to share today
        for (int d = 2; d <= n; d++) {
            if (d - delay >= 1) sharing = (sharing + learned[d - delay]) % MOD;
            if (d - forget >= 1) sharing = (sharing - learned[d - forget] + MOD) % MOD;
            learned[d] = sharing;
        }
        long known = 0;
        for (int d = n - forget + 1; d <= n; d++) if (d >= 1) known = (known + learned[d]) % MOD;
        return (int) known;
    }
}`,
  },
  {
    slug: 'design-front-middle-back-queue', title: 'Design Front Middle Back Queue', level: 'Medium',
    summary: 'A queue that can push and pop at the front, the middle and the back. With two middle positions, the frontmost one is used. Pops return -1 when the queue is empty.',
    design: {
      cls: 'FrontMiddleBackQueue', ctor: [],
      methods: [
        ['void', 'pushFront', [['int', 'val']]], ['void', 'pushMiddle', [['int', 'val']]], ['void', 'pushBack', [['int', 'val']]],
        ['int', 'popFront', []], ['int', 'popMiddle', []], ['int', 'popBack', []],
      ],
    },
    tests: [
      { in: [['FrontMiddleBackQueue', 'pushFront', 'pushBack', 'pushMiddle', 'pushMiddle', 'popFront', 'popMiddle', 'popMiddle', 'popBack', 'popFront'], [[], [1], [2], [3], [4], [], [], [], [], []]], out: [null, null, null, null, null, 1, 3, 4, 2, -1] },
      { in: [['FrontMiddleBackQueue', 'popMiddle', 'pushMiddle', 'popMiddle', 'popFront', 'popBack'], [[], [], [7], [], [], []]] },
      { in: [['FrontMiddleBackQueue', 'pushBack', 'pushBack', 'pushBack', 'pushBack', 'pushBack', 'pushMiddle', 'popMiddle', 'popMiddle', 'popMiddle'], [[], [1], [2], [3], [4], [5], [6], [], [], []]] },
    ],
    ref: `class FrontMiddleBackQueue {
    // left holds the first half, right the second; right.size() is left.size() or left.size() + 1
    private final ArrayDeque<Integer> left = new ArrayDeque<>(), right = new ArrayDeque<>();
    public FrontMiddleBackQueue() {}
    private void fix() {
        if (left.size() > right.size()) right.offerFirst(left.pollLast());
        else if (right.size() > left.size() + 1) left.offerLast(right.pollFirst());
    }
    public void pushFront(int val) { left.offerFirst(val); fix(); }
    public void pushMiddle(int val) {
        if (left.size() == right.size()) right.offerFirst(val); else left.offerLast(val);
    }
    public void pushBack(int val) { right.offerLast(val); fix(); }
    public int popFront() {
        if (right.isEmpty()) return -1;
        int v = left.isEmpty() ? right.pollFirst() : left.pollFirst();
        fix();
        return v;
    }
    public int popMiddle() {
        if (right.isEmpty()) return -1;
        return left.size() == right.size() ? left.pollLast() : right.pollFirst();
    }
    public int popBack() {
        if (right.isEmpty()) return -1;
        int v = right.pollLast();
        fix();
        return v;
    }
}`,
  },
  {
    slug: 'design-most-recently-used-queue', title: 'Design Most Recently Used Queue', level: 'Medium',
    summary: 'MRUQueue(n) starts as [1, 2, …, n]. fetch(k) removes the k-th element (1-indexed), appends it to the end and returns it.',
    design: { cls: 'MRUQueue', ctor: [['int', 'n']], methods: [['int', 'fetch', [['int', 'k']]]] },
    tests: [
      { in: [['MRUQueue', 'fetch', 'fetch', 'fetch', 'fetch'], [[8], [3], [5], [2], [8]]], out: [null, 3, 6, 2, 2] },
      { in: [['MRUQueue', 'fetch', 'fetch', 'fetch'], [[1], [1], [1], [1]]] },
      { in: [['MRUQueue', 'fetch', 'fetch', 'fetch', 'fetch', 'fetch'], [[5], [1], [1], [1], [1], [1]]] },
    ],
    ref: `class MRUQueue {
    // Positions 1 … n + calls; bit marks which positions hold an element. fetch finds the k-th set
    // position by binary lifting, clears it and writes the element at the next free position at the end.
    private final int cap; private final int[] bit, val; private int end;
    public MRUQueue(int n) {
        cap = n + 2001; bit = new int[cap + 1]; val = new int[cap + 1];
        for (int i = 1; i <= n; i++) { val[i] = i; add(i, 1); }
        end = n;
    }
    private void add(int i, int d) { for (; i <= cap; i += i & -i) bit[i] += d; }
    public int fetch(int k) {
        int pos = 0;
        for (int step = Integer.highestOneBit(cap); step > 0; step >>= 1)
            if (pos + step <= cap && bit[pos + step] < k) { pos += step; k -= bit[pos]; }
        pos++;
        int v = val[pos];
        add(pos, -1);
        val[++end] = v;
        add(end, 1);
        return v;
    }
}`,
  },
  {
    slug: 'design-ride-sharing-system', title: 'Design Ride Sharing System', level: 'Medium',
    summary: 'Riders and drivers wait in arrival order. matchDriverWithRider pairs the longest-waiting driver with the longest-waiting rider and returns [driverId, riderId], or [-1, -1] if either side is empty. cancelRider removes a rider who is still waiting.',
    design: {
      cls: 'RideSharingSystem', ctor: [],
      methods: [['void', 'addRider', [['int', 'riderId']]], ['void', 'addDriver', [['int', 'driverId']]], ['int[]', 'matchDriverWithRider', []], ['void', 'cancelRider', [['int', 'riderId']]]],
    },
    tests: [
      { in: [['RideSharingSystem', 'addRider', 'addDriver', 'addRider', 'matchDriverWithRider', 'addDriver', 'cancelRider', 'matchDriverWithRider', 'matchDriverWithRider'], [[], [3], [2], [1], [], [5], [3], [], []]] },
      { in: [['RideSharingSystem', 'matchDriverWithRider', 'addDriver', 'matchDriverWithRider', 'addRider', 'matchDriverWithRider'], [[], [], [4], [], [9], []]] },
      { in: [['RideSharingSystem', 'addRider', 'addRider', 'cancelRider', 'cancelRider', 'addDriver', 'addDriver', 'matchDriverWithRider', 'matchDriverWithRider'], [[], [1], [2], [1], [7], [10], [11], [], []]] },
    ],
    ref: `class RideSharingSystem {
    private final ArrayDeque<Integer> riders = new ArrayDeque<>(), drivers = new ArrayDeque<>();
    private final Set<Integer> waiting = new HashSet<>();     // riders still waiting (cancelled ones are skipped lazily)
    public RideSharingSystem() {}
    public void addRider(int riderId) { riders.offerLast(riderId); waiting.add(riderId); }
    public void addDriver(int driverId) { drivers.offerLast(driverId); }
    public int[] matchDriverWithRider() {
        while (!riders.isEmpty() && !waiting.contains(riders.peekFirst())) riders.pollFirst();
        if (riders.isEmpty() || drivers.isEmpty()) return new int[] { -1, -1 };
        int r = riders.pollFirst();
        waiting.remove(r);
        return new int[] { drivers.pollFirst(), r };
    }
    public void cancelRider(int riderId) { waiting.remove(riderId); }
}`,
  },
  {
    slug: 'design-bounded-blocking-queue', title: 'Design Bounded Blocking Queue', level: 'Medium',
    summary: 'A thread-safe FIFO queue with a capacity: enqueue blocks while the queue is full, dequeue blocks while it is empty, size returns the number of elements. Judged here on one thread, so tests never call enqueue on a full queue or dequeue on an empty one.',
    design: {
      cls: 'BoundedBlockingQueue', ctor: [['int', 'capacity']],
      methods: [['void', 'enqueue', [['int', 'element']]], ['int', 'dequeue', []], ['int', 'size', []]],
    },
    tests: [
      { in: [['BoundedBlockingQueue', 'enqueue', 'dequeue', 'enqueue', 'enqueue', 'enqueue', 'size', 'dequeue', 'size'], [[3], [1], [], [0], [2], [3], [], [], []]] },
      { in: [['BoundedBlockingQueue', 'size', 'enqueue', 'size', 'dequeue', 'size'], [[1], [], [5], [], [], []]] },
      { in: [['BoundedBlockingQueue', 'enqueue', 'enqueue', 'enqueue', 'dequeue', 'enqueue', 'dequeue', 'dequeue', 'dequeue'], [[3], [1], [2], [3], [], [4], [], [], []]] },
    ],
    ref: `class BoundedBlockingQueue {
    private final int capacity;
    private final ArrayDeque<Integer> q = new ArrayDeque<>();
    private final ReentrantLock lock = new ReentrantLock();
    private final Condition notFull = lock.newCondition(), notEmpty = lock.newCondition();
    public BoundedBlockingQueue(int capacity) { this.capacity = capacity; }
    public void enqueue(int element) throws InterruptedException {
        lock.lock();
        try {
            while (q.size() == capacity) notFull.await();
            q.offerLast(element);
            notEmpty.signal();
        } finally { lock.unlock(); }
    }
    public int dequeue() throws InterruptedException {
        lock.lock();
        try {
            while (q.isEmpty()) notEmpty.await();
            int v = q.pollFirst();
            notFull.signal();
            return v;
        } finally { lock.unlock(); }
    }
    public int size() {
        lock.lock();
        try { return q.size(); } finally { lock.unlock(); }
    }
}`,
  },
];
