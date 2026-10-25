export default {
  'implement-queue-using-stacks': {
    statement: `Implement a first-in-first-out queue, \`MyQueue\`, using only two stacks (push to top, pop from top, peek at top, size, isEmpty):

- \`void push(int x)\` adds \`x\` to the back,
- \`int pop()\` removes and returns the front element,
- \`int peek()\` returns the front element,
- \`boolean empty()\` returns whether the queue is empty.

\`pop\` and \`peek\` are only called on a non-empty queue. The tests call the class with a list of operations and their arguments.`,
    constraints: ['1 ≤ x ≤ 9', 'At most 100 calls in total', 'pop and peek are only called on a non-empty queue'],
    hints: [
      'A stack reverses order. Reversing twice restores it.',
      'Push onto an "in" stack. To pop or peek, take from an "out" stack.',
      'Only when the out stack is empty, move everything from in to out. Each element moves once, so operations are amortised O(1).',
    ],
  },
  'design-hashmap': {
    statement: `Implement \`MyHashMap\` without using any built-in hash table:

- \`void put(int key, int value)\` inserts the pair, or updates the value if the key exists,
- \`int get(int key)\` returns the value for \`key\`, or \`-1\` if there is none,
- \`void remove(int key)\` removes the key if it is present.

The tests call the class with a list of operations and their arguments.`,
    constraints: ['0 ≤ key, value ≤ 10⁶', 'At most 10^5 calls in total'],
    hints: [
      'Keys go up to 10⁶, so a plain array of that size works, but the interview answer is a real hash table.',
      'Use an array of buckets and choose a bucket with key % size. Keys that land in the same bucket go into a small list (separate chaining).',
      'put updates an existing node in the bucket or adds a new one; remove unlinks it. With a reasonable size (like a prime around 10⁴) buckets stay short.',
    ],
  },
  'min-stack': {
    statement: `Design \`MinStack\`, a stack that also returns its minimum element in constant time:

- \`void push(int val)\`, \`void pop()\` and \`int top()\` work as on a normal stack,
- \`int getMin()\` returns the smallest element currently in the stack.

Every operation must run in O(1) time. \`pop\`, \`top\` and \`getMin\` are only called on a non-empty stack. The tests call the class with a list of operations and their arguments.`,
    constraints: ['-2^31 ≤ val ≤ 2^31 − 1', 'At most 1.5 × 10^5 calls in total'],
    hints: [
      'Scanning for the minimum is O(n). What would let you remember the minimum at every height of the stack?',
      'Store with each element the minimum of the stack at the time it was pushed: push (val, min(val, current min)).',
      'Then getMin is the min stored on top, and popping automatically restores the previous minimum. A second stack of minimums works as well.',
    ],
  },
  'lru-cache': {
    statement: `Design an \`LRUCache\` with a fixed \`capacity\`:

- \`int get(int key)\` returns the value of \`key\`, or \`-1\` if it is not present,
- \`void put(int key, int value)\` inserts or updates the key. If that makes the cache exceed its capacity, evict the least recently used key.

Both reading and writing a key count as using it. \`get\` and \`put\` must each run in O(1) average time. The tests call the class with a list of operations and their arguments.`,
    constraints: ['1 ≤ capacity ≤ 10⁴', '0 ≤ key ≤ 10⁵', '0 ≤ value ≤ 10⁵', 'At most 2 × 10^5 calls in total'],
    hints: [
      'You need fast lookup by key and fast "move to most recent" and "remove least recent". No single built-in structure does all three.',
      'Combine a HashMap from key to node with a doubly linked list ordered by recency.',
      'On get or put, move the node to the front; on overflow, remove the node at the back and its key from the map. Sentinel head and tail nodes remove edge cases. (LinkedHashMap with access order is the shortcut.)',
    ],
  },
  'insert-delete-getrandom-o1': {
    statement: `Implement \`RandomizedSet\`:

- \`boolean insert(int val)\` adds \`val\` if it is not present and returns whether it was added,
- \`boolean remove(int val)\` removes \`val\` if it is present and returns whether it was removed,
- \`int getRandom()\` returns a random element, each with the same probability.

All three must run in average O(1) time. \`getRandom\` is only called when the set is not empty. The judge checks every return value and that \`getRandom\` returns a member of the set.`,
    constraints: ['-2^31 ≤ val ≤ 2^31 − 1', 'At most 2 × 10^5 calls in total', 'getRandom is only called on a non-empty set'],
    hints: [
      'A HashSet gives O(1) insert and remove, but no way to pick a random element in O(1).',
      'Keep the values in an ArrayList (random index → random element) plus a HashMap from value to its index in the list.',
      'To remove from the middle in O(1), move the last element into the removed slot, update its index in the map, and remove the last position.',
    ],
  },
  'time-based-key-value-store': {
    statement: `Design \`TimeMap\`, a key-value store that keeps every version of a value:

- \`void set(String key, String value, int timestamp)\` stores \`value\` for \`key\` at \`timestamp\`,
- \`String get(String key, int timestamp)\` returns the value set for \`key\` at the largest timestamp \`≤ timestamp\`, or \`""\` if there is none.

For each key, \`set\` is called with strictly increasing timestamps. The tests call the class with a list of operations and their arguments.`,
    constraints: ['1 ≤ key.length, value.length ≤ 100', '1 ≤ timestamp ≤ 10⁷', 'Timestamps for a key strictly increase', 'At most 2 × 10^5 calls in total'],
    hints: [
      'Because timestamps arrive in increasing order, each key\'s versions are already sorted.',
      'Store a HashMap from key to a list of (timestamp, value) pairs, appending on set.',
      'For get, binary-search that list for the last timestamp ≤ the query. A TreeMap per key with floorEntry is the shortcut.',
    ],
  },
  'peeking-iterator': {
    statement: `Wrap an existing \`Iterator<Integer>\` in a \`PeekingIterator\` that supports:

- \`int next()\` returns the next element and moves forward,
- \`boolean hasNext()\` returns whether there are more elements,
- \`int peek()\` returns the next element without moving forward.

\`next\` and \`peek\` are only called when an element remains. The tests give the underlying list and then the operations.`,
    constraints: ['1 ≤ number of elements ≤ 1000', '1 ≤ each element ≤ 1000', 'At most 1000 calls in total'],
    hints: [
      'An iterator cannot go back, so once you look at the next element you must remember it.',
      'Keep one element of look-ahead: a "peeked" value and a flag saying whether you hold one.',
      'peek fills the cache if it is empty; next returns and clears the cache if it is full, otherwise asks the underlying iterator; hasNext is "cache is full or iterator has more".',
    ],
  },
  'flatten-nested-list-iterator': {
    statement: `Each element of \`nestedList\` is either an integer or a list whose elements are again integers or lists. Implement \`NestedIterator\`, which returns all the integers in order:

- \`NestedIterator(List<NestedInteger> nestedList)\` creates the iterator,
- \`int next()\` returns the next integer,
- \`boolean hasNext()\` returns whether any integers remain.

Use the provided \`NestedInteger\` interface (\`isInteger()\`, \`getInteger()\`, \`getList()\`). The judge calls \`hasNext\` and \`next\` until \`hasNext\` returns \`false\`, and prints the integers you return.`,
    constraints: ['0 <= nestedList.length <= 500', 'Every integer is in [-10⁶, 10⁶]'],
    hints: [
      'Flattening everything into a list in the constructor works and is simple. The lazy version is the interesting one.',
      'Keep a stack of iterators (or of list positions) so you can descend into a nested list and come back afterwards.',
      'Put the work in hasNext: keep unpacking until the top of the stack is an integer, popping finished lists. Empty lists like [[]] must be skipped.',
    ],
  },
  'snapshot-array': {
    statement: `Implement \`SnapshotArray\`:

- \`SnapshotArray(int length)\` creates an array of the given length where every element is 0,
- \`void set(int index, int val)\` sets the element at \`index\`,
- \`int snap()\` takes a snapshot and returns its id, which is the number of earlier \`snap\` calls (so the first snapshot has id 0),
- \`int get(int index, int snapId)\` returns the value the element at \`index\` had when snapshot \`snapId\` was taken.

The tests call the class with a list of operations and their arguments.`,
    constraints: ['1 ≤ length ≤ 5 × 10⁴', '0 ≤ index < length', '0 ≤ val ≤ 10⁹', '0 ≤ snapId < number of snap calls so far', 'At most 1.25 × 10^5 calls in total'],
    hints: [
      'Copying the whole array on every snap is O(length) per snap and far too much memory.',
      'Store only changes: for each index, a list of (snapId, value) pairs, recorded at the current snap id.',
      'For get, binary-search the index\'s list for the last entry with snapId ≤ the requested one (or use a TreeMap and floorEntry). Overwrite the last entry if it has the current snap id.',
    ],
  },
  'design-twitter': {
    statement: `Design a simplified Twitter:

- \`void postTweet(int userId, int tweetId)\` posts a new tweet (each tweet id is unique),
- \`List<Integer> getNewsFeed(int userId)\` returns the ids of the 10 most recent tweets posted by the user or by anyone they follow, newest first,
- \`void follow(int followerId, int followeeId)\` and \`void unfollow(int followerId, int followeeId)\` change who a user follows.

A user never follows themselves through \`follow\`, but always sees their own tweets. The tests call the class with a list of operations and their arguments.`,
    constraints: ['1 ≤ userId, followerId, followeeId ≤ 500', '0 ≤ tweetId ≤ 10⁴', 'At most 3 × 10^4 calls in total'],
    hints: [
      'Give every tweet a global, increasing timestamp so tweets from different users can be ordered.',
      'Store each user\'s tweets as a list (newest at the end) and their followees as a set.',
      'For the feed, merge the tweet lists of the user and their followees with a max-heap on timestamp, stopping after 10. That is the classic k-way merge.',
    ],
  },
  'lfu-cache': {
    statement: `Design an \`LFUCache\` with a fixed \`capacity\`:

- \`int get(int key)\` returns the value of \`key\`, or \`-1\` if it is missing,
- \`void put(int key, int value)\` inserts or updates the key. If inserting a new key would exceed the capacity, first evict the least frequently used key; if several keys tie, evict the least recently used among them.

Every \`get\` or \`put\` of a key increases its use count by one (a new key starts at 1). Both operations must run in O(1) average time. The tests call the class with a list of operations and their arguments.`,
    constraints: ['1 ≤ capacity ≤ 10⁴', '0 ≤ key ≤ 10⁵', '0 ≤ value ≤ 10⁹', 'At most 2 × 10^5 calls in total'],
    hints: [
      'You need, in O(1): find a key, bump its frequency, and find the least frequent and oldest key.',
      'Keep key → (value, frequency), and frequency → a LinkedHashSet of keys in recency order. Track the current minimum frequency.',
      'Bumping a key moves it from set f to set f + 1 (and raises minFreq if set f becomes empty and f was the minimum). On eviction, remove the first key of the minFreq set. A new key resets minFreq to 1.',
    ],
  },
  'insert-delete-getrandom-o1-duplicates-allowed': {
    statement: `Implement \`RandomizedCollection\`, a multiset that may hold duplicates:

- \`boolean insert(int val)\` adds one copy of \`val\` and returns \`true\` if \`val\` was not present before,
- \`boolean remove(int val)\` removes one copy of \`val\` if any and returns whether it did,
- \`int getRandom()\` returns a random element, with each value's chance proportional to how many copies it has.

All operations must run in average O(1) time. The judge checks return values and that \`getRandom\` returns an element of the collection.`,
    constraints: ['-2^31 ≤ val ≤ 2^31 − 1', 'At most 2 × 10^5 calls in total', 'getRandom is only called on a non-empty collection'],
    hints: [
      'Start from the RandomizedSet design: an ArrayList of values plus a map for O(1) removal.',
      'A value can now sit at several positions, so map each value to a set of its indices.',
      'To remove, take any index of val, move the last element into it, and fix both entries in the index sets (careful when the moved element is val itself).',
    ],
  },
  'design-hashset': {
    statement: `Implement \`MyHashSet\` without using any built-in hash table:

- \`void add(int key)\` inserts \`key\` into the set,
- \`void remove(int key)\` removes \`key\` if it is present (otherwise does nothing),
- \`boolean contains(int key)\` returns whether \`key\` is in the set.

The tests call the class with a list of operations and their arguments.`,
    constraints: ['0 ≤ key ≤ 10⁶', 'At most 10⁴ calls to add, remove and contains'],
    hints: [
      'Keys go up to 10⁶, so a boolean array of that size works. The interview answer, though, is a real hash table.',
      'Use an array of buckets and pick a bucket with key % size. Keys that share a bucket go into a small list (separate chaining).',
      'add must not insert a key twice; remove deletes it from its bucket. A prime number of buckets (like 1009) spreads keys evenly.',
    ],
  },
  'implement-stack-using-queues': {
    statement: `Implement a last-in-first-out stack \`MyStack\` using only queues:

- \`void push(int x)\` pushes \`x\` on top,
- \`int pop()\` removes the top element and returns it,
- \`int top()\` returns the top element,
- \`boolean empty()\` returns whether the stack is empty.

Use only standard queue operations: add to the back, remove from the front, peek at the front, size and isEmpty. Every \`pop\` and \`top\` call is made on a non-empty stack.`,
    constraints: ['1 ≤ x ≤ 9', 'At most 100 calls to push, pop, top and empty'],
    hints: [
      'A queue gives you the oldest element first, but a stack needs the newest. Something has to be reordered, either on push or on pop.',
      'Make push expensive: after adding x to the back, rotate the queue by removing from the front and re-adding at the back, size − 1 times.',
      'Now x is at the front, so pop and top are just a remove or peek from the front. One queue is enough.',
    ],
  },
  'design-circular-queue': {
    statement: `Implement \`MyCircularQueue\`, a first-in-first-out queue with a fixed capacity whose storage wraps around (a ring buffer):

- \`MyCircularQueue(int k)\` creates a queue that holds up to \`k\` values,
- \`boolean enQueue(int value)\` adds \`value\` at the rear; returns \`false\` if the queue is full,
- \`boolean deQueue()\` removes the front value; returns \`false\` if the queue is empty,
- \`int Front()\` and \`int Rear()\` return the front and rear values, or \`-1\` if the queue is empty,
- \`boolean isEmpty()\` and \`boolean isFull()\` report the queue\'s state.

Do not use a built-in queue.`,
    constraints: ['1 ≤ k ≤ 1000', '0 ≤ value ≤ 1000', 'At most 3000 calls in total'],
    hints: [
      'Use an array of size k. Moving every element on deQueue would be O(k); instead let the front move.',
      'Keep the index of the front and the number of stored values. The rear sits at (head + size − 1) % k.',
      'enQueue writes at (head + size) % k; deQueue advances head with head = (head + 1) % k. Tracking size separately avoids the "full or empty?" ambiguity when head and tail meet.',
    ],
  },
  'detect-squares': {
    statement: `Implement \`DetectSquares\`, which stores points on a grid and counts squares:

- \`void add(int[] point)\` stores \`point = [x, y]\`. The same point may be added several times; each copy counts separately.
- \`int count(int[] point)\` returns the number of ways to choose three **stored** points that, together with the query point, form an axis-aligned square with positive area.

An axis-aligned square has all four sides the same length and parallel to the x and y axes.`,
    constraints: ['point.length == 2', '0 ≤ x, y ≤ 1000', 'At most 3000 calls to add and count in total'],
    hints: [
      'With the query point fixed, a square is decided by the opposite (diagonal) corner. The other two corners follow from it.',
      'Count copies of each point, for example with a map or a 1001 × 1001 array, and keep a list of distinct points.',
      'For each stored point (px, py) with |px − x| == |py − y| and px ≠ x, add count(px, py) × count(x, py) × count(px, y). That is O(distinct points) per query.',
    ],
  },
  'maximum-frequency-stack': {
    statement: `Implement \`FreqStack\`, a stack-like structure that pops the most frequent value:

- \`void push(int val)\` pushes \`val\` onto the stack,
- \`int pop()\` removes and returns the most frequent value in the stack. If several values are tied for most frequent, it removes and returns the one closest to the top (pushed most recently).

Every \`pop\` call is made on a non-empty stack.`,
    constraints: ['0 ≤ val ≤ 10⁹', 'At most 2 · 10⁴ calls to push and pop'],
    hints: [
      'Keep a map from value to its current frequency. The hard part is finding the most recent value among the most frequent ones.',
      'Think of each push of a value as creating its k-th copy. Group values by that copy number: a stack for frequency 1, another for frequency 2, and so on.',
      'pop takes from the stack of the highest frequency, decreases that value\'s count, and drops the stack when it becomes empty. Both operations are O(1).',
    ],
  },
};
