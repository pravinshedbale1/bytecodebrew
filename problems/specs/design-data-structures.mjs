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
    private final Random rnd = new Random();
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
    private final Random rnd = new Random();
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
];
