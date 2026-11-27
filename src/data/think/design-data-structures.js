/** Practice thinking walkthroughs: design-data-structures (format: src/data/think/index.js). */

const notHash = (why) => ({ id: 'hashing', why });
const notHeap = (why) => ({ id: 'heap-patterns', why });
const notStack = (why) => ({ id: 'stack-patterns', why });
const ops = (...xs) => xs;

export default {
  'implement-queue-using-stacks': {
    free: true,
    aha: 'One stack ("in") takes every push; the other ("out") serves pop and peek from its top. When "out" is empty, pour all of "in" into it: that reverses the order, so the oldest element lands on top. Each element is moved at most once, so every operation is O(1) on average.',
    asks: {
      read: 'Which stack operations are you allowed? What order must pop follow?',
      budget: 'How many times can one element be moved between the stacks?',
      observe: 'After push 1, push 2, what does pouring "in" into "out" do to the order?',
      brute: 'Pouring everything back and forth on every pop: what does that cost?',
      pattern: 'Reversing a stack once turns LIFO into what?',
      watch: 'Watch "out" refill only when it runs dry.',
    },
    read: [
      { phrase: 'using only two stacks', says: 'Two LIFOs must make a FIFO: reverse once.' },
      { phrase: '`int pop()` removes and returns the front element', says: 'The oldest element must come out first.' },
    ],
    budget: { from: 'up to 100 calls', rows: [['pour both ways every pop', 'O(n) per pop', 'bad', 'wasteful'], ['pour only when "out" is empty', 'O(1) on average', 'ok', 'each element moves once']], aim: 'O(1) amortized per call', note: 'One expensive pour pays for many cheap pops.' },
    observe: [
      {
        title: 'Pouring reverses',
        text: 'Push 1, 2, 3 onto "in" (3 on top). Popping them all onto "out" puts 1 on top: the oldest, exactly what a queue pops first.',
        sketch: { kind: 'array', rows: [{ label: 'in (top right)', items: [1, 2, 3] }, { label: 'out (top right)', items: [3, 2, 1], marks: { 2: 'hit' } }] },
      },
      {
        title: 'Don\'t pour while "out" has elements',
        text: 'If "out" still holds 2 and 3 and you push 4, pouring now would bury 2 under 4. Wait until "out" is empty.',
        sketch: { kind: 'array', rows: [{ label: 'out', items: [3, 2], marks: { 1: 'hit' } }, { label: 'in', items: [4] }], caption: 'next pop: 2' },
      },
    ],
    brute: { idea: 'Keep everything in one stack; for each pop, move all elements to the other stack, pop the bottom one, and move them all back.', cost: 'O(n) per pop', waste: 'Every pop moves every element twice, though one reversal is enough for all of them.' },
    pattern: {
      pick: 'design-data-structures',
      why: 'push → in.push; pop/peek → if out is empty, move everything from in to out; then use out\'s top. O(1) amortized.',
      not: [notStack('Each part is a plain stack; the design is how the two cooperate.'), { id: 'linked-list-manipulation', why: 'A linked list makes a queue directly, but the problem limits you to stack operations.' }],
    },
    watch: { viz: 'DesignWalkViz', inputs: [{ label: 'LeetCode example', input: { mode: 'queue2', ops: ops(['push', 1], ['push', 2], ['peek'], ['pop'], ['empty']) } }, { label: 'a refill later', input: { mode: 'queue2', ops: ops(['push', 1], ['push', 2], ['peek'], ['pop'], ['push', 3], ['pop'], ['pop'], ['empty']) } }] },
    edges: ['push 1, push 2, peek, pop, empty → 1, 1, false.', 'pop after a later push: push 1, pop, push 2, pop → 1, 2.', 'empty() on a new queue → true.'],
  },

  'design-hashmap': {
    aha: 'Keep an array of buckets. A key goes to bucket hash(key) % size, and each bucket holds a short chain of (key, value) pairs that landed there. put, get and remove only look inside one bucket, so with enough buckets every operation is O(1) on average.',
    asks: {
      read: 'What must get return for a missing key? What can you not use?',
      budget: 'Keys up to 10⁶. Could a plain array indexed by key work? What does it cost?',
      observe: 'With 5 buckets, where do keys 3, 8 and 13 go?',
      brute: 'A list of pairs scanned on every call: how slow?',
      pattern: 'How do you find a key without scanning everything?',
      watch: 'Watch each call touch only one bucket.',
    },
    read: [
      { phrase: 'without using any built-in hash table', says: 'Build the buckets and chains yourself.' },
      { phrase: 'returns the value for `key`, or `-1` if there is none', says: 'A missing key is a normal answer, not an error.' },
      { phrase: 'updates the value if the key exists', says: 'put must check the chain before appending.' },
    ],
    budget: { from: 'keys ≤ 10⁶, ≤ 10⁴ calls', rows: [['array of 10⁶ slots', '10⁶ memory', 'ok', 'works, wasteful'], ['list scanned per call', '10⁴ × 10⁴', 'bad', 'slow'], ['buckets with chains', 'O(1) average', 'ok', 'the design']], aim: 'O(1) average per call', note: 'Pick a bucket count that keeps chains short (~10⁴, often prime).' },
    observe: [
      {
        title: 'Collisions share a bucket',
        text: '3, 8 and 13 all give remainder 3 with 5 buckets: they sit in one chain. Looking up 8 scans just that chain.',
        sketch: { kind: 'array', rows: [{ label: 'bucket 3', items: ['3 → 30', '8 → 80', '13 → 1'], marks: { 1: 'hit' } }] },
      },
      {
        title: 'put overwrites',
        text: 'put(2, 1) after put(2, 2) finds 2 in its chain and changes the value, instead of adding a second pair.',
        sketch: { kind: 'array', rows: [{ label: 'bucket 2', items: ['2 → 1'], marks: { 0: 'hit' } }] },
      },
    ],
    brute: { idea: 'Keep a list of (key, value) pairs and scan it for every call.', cost: 'O(n) per call', waste: 'Each call compares against every key, though only keys with the same hash could match.' },
    pattern: {
      pick: 'design-data-structures',
      why: 'buckets[k % M] = chain of nodes. put: find in chain → update, else append. get: find or −1. remove: unlink. O(1) average with M ≈ 10⁴.',
      not: [notHash('Using HashMap is exactly what is forbidden; this is building one.'), { id: 'linked-list-manipulation', why: 'The chains are linked lists, but the speed comes from the bucket array.' }],
    },
    watch: { viz: 'DesignWalkViz', inputs: [{ label: 'LeetCode example', input: { mode: 'hashmap', ops: ops(['put', 1, 1], ['put', 2, 2], ['get', 1], ['get', 3], ['put', 2, 1], ['get', 2], ['remove', 2], ['get', 2]) } }, { label: 'a collision', input: { mode: 'hashmap', ops: ops(['put', 3, 30], ['put', 8, 80], ['put', 13, 1], ['get', 8], ['remove', 3], ['get', 13], ['get', 3]) } }] },
    edges: ['get on an empty map → −1.', 'put(2, 2), put(2, 1), get(2) → 1.', 'remove a missing key → nothing changes.'],
  },

  'min-stack': {
    aha: 'A minimum can\'t be recomputed cheaply after it is popped, unless you remember what it was before that element arrived. So push each value together with the minimum of the stack from that point down. getMin reads the top pair; popping uncovers the previous minimum automatically.',
    asks: {
      read: 'Which operations must be O(1)?',
      budget: 'How much extra memory is acceptable per element?',
      observe: 'Push −2, 0, −3. After popping −3, what should getMin return, and where is that stored?',
      brute: 'Scanning the stack for getMin: what does it cost?',
      pattern: 'What can each element remember about the elements below it?',
      watch: 'Watch every element carry the minimum beneath it.',
    },
    read: [
      { phrase: 'returns its minimum element in constant time', says: 'No scanning: the minimum must already be stored.' },
      { phrase: 'Every operation must run in O(1) time', says: 'pop must not trigger a search either.' },
    ],
    budget: { from: '≤ 3 × 10⁴ calls', rows: [['scan for the min', 'O(n) per getMin', 'bad', 'not O(1)'], ['store (value, min so far)', 'O(1) each', 'ok', 'twice the memory']], aim: 'O(1) per call', note: 'A second stack that only stores new minimums saves memory.' },
    observe: [
      {
        title: 'Each pair remembers the min below',
        text: 'Push −2 (min −2), 0 (min −2), −3 (min −3). getMin reads the top pair: −3.',
        sketch: { kind: 'array', rows: [{ label: 'value', items: [-2, 0, -3] }, { label: 'min so far', items: [-2, -2, -3], marks: { 2: 'hit' } }] },
      },
      {
        title: 'Popping restores the old minimum',
        text: 'Pop −3: the new top is (0, −2), so getMin is −2 without any search.',
        sketch: { kind: 'array', rows: [{ label: 'min so far', items: [-2, -2], marks: { 1: 'hit' } }] },
      },
    ],
    brute: { idea: 'Use a normal stack and scan it for the minimum when asked.', cost: 'O(n) per getMin', waste: 'The minimum of the lower part never changes while it is buried, yet it is recomputed every time.' },
    pattern: {
      pick: 'design-data-structures',
      why: 'push(x): stack.push((x, min(x, top.min))). pop: pop. top: top.value. getMin: top.min. All O(1).',
      not: [notStack('A plain stack can\'t answer getMin quickly; the stored minimum is the design.'), notHeap('A heap gives the min but can\'t follow the stack\'s pop order.')],
    },
    watch: { viz: 'DesignWalkViz', inputs: [{ label: 'LeetCode example', input: { mode: 'minstack', ops: ops(['push', -2], ['push', 0], ['push', -3], ['getMin'], ['pop'], ['top'], ['getMin']) } }, { label: 'equal minimums', input: { mode: 'minstack', ops: ops(['push', 1], ['push', 1], ['getMin'], ['pop'], ['getMin']) } }] },
    edges: ['LeetCode example → getMin −3, top 0, getMin −2.', 'Duplicate minimums: push 1, push 1, pop, getMin → 1.', 'One element: push 5, getMin → 5.'],
  },

  'lru-cache': {
    aha: 'Two structures work together. A hash map finds a key\'s node in O(1). A doubly linked list keeps the nodes in order of use, most recent at the front. A use moves a node to the front (a few pointer changes); eviction drops the node at the back.',
    asks: {
      read: 'What counts as using a key? What gets evicted?',
      budget: 'get and put must be O(1). Can you search a list?',
      observe: 'With capacity 2: put 1, put 2, get 1, put 3. Which key is evicted?',
      brute: 'A list in use order, searched on every call: what does it cost?',
      pattern: 'What finds a key fast, and what keeps the use order cheap to change?',
      watch: 'Watch each use move a node to the front, and evictions leave from the back.',
    },
    read: [
      { phrase: 'evict the least recently used key', says: 'Keep keys ordered by last use; evict from the old end.' },
      { phrase: 'Both reading and writing a key count as using it', says: 'get also moves the key to the front.' },
      { phrase: '`get` and `put` must each run in O(1) average time', says: 'A hash map for lookup plus a linked list for order.' },
    ],
    budget: { from: '≤ 2 × 10⁵ calls', rows: [['list searched per call', 'O(capacity) each', 'bad', 'too slow'], ['map + doubly linked list', 'O(1) each', 'ok', 'the design']], aim: 'O(1) per call', note: 'Java\'s LinkedHashMap with access order does this in a few lines.' },
    observe: [
      {
        title: 'get refreshes a key',
        text: 'put 1, put 2, get 1: now 1 is the most recent, so 2 is the least recently used.',
        sketch: { kind: 'array', rows: [{ label: 'recent → old', items: [1, 2], marks: { 1: 'bad' } }] },
      },
      {
        title: 'Evict from the back',
        text: 'put 3 with capacity 2: the cache is full, so 2 (at the back) is evicted, and 3 goes to the front.',
        sketch: { kind: 'array', rows: [{ label: 'recent → old', items: [3, 1], marks: { 0: 'hit' } }] },
      },
    ],
    brute: { idea: 'Keep keys in a list ordered by use; find, move and evict by scanning.', cost: 'O(capacity) per call', waste: 'Each call searches the list for a key a hash map could point to directly.' },
    pattern: {
      pick: 'design-data-structures',
      why: 'map: key → node; list with dummy head and tail. get: move node to front. put: update and move, or add at front and evict tail.prev if over capacity. O(1).',
      not: [{ id: 'linked-list-manipulation', why: 'The doubly linked list alone can\'t find a key quickly; the map is half the design.' }, notHash('A map alone has no order of use.')],
    },
    watch: { viz: 'LruViz', inputs: [{ label: 'capacity 2, LeetCode-style', input: { cap: 2, ops: [['put', 1, 'A'], ['put', 2, 'B'], ['get', 1], ['put', 3, 'C'], ['get', 2], ['put', 4, 'D'], ['get', 1], ['get', 3], ['get', 4]] } }, { label: 'capacity 3', input: { cap: 3, ops: [['put', 1, 'A'], ['put', 2, 'B'], ['put', 3, 'C'], ['get', 1], ['put', 4, 'D'], ['get', 2], ['put', 3, 'Z']] } }] },
    edges: ['LeetCode example → 1, −1, −1, 3, 4.', 'Capacity 1: put 1, put 2, get 1 → −1.', 'put an existing key → value updated, and it becomes most recent.'],
  },

  'insert-delete-getrandom-o1': {
    aha: 'A list makes getRandom O(1): pick a random slot. A map from value to slot makes lookup O(1). Removing from the middle of a list would shift everything, so instead copy the last element into the hole, update its slot in the map, and drop the end.',
    asks: {
      read: 'Which operations must be O(1), and what does getRandom need?',
      budget: 'A hash set alone: can it pick a random element in O(1)?',
      observe: 'List [1, 2, 3]: how do you remove 1 without shifting 2 and 3?',
      brute: 'A list only: what does remove cost?',
      pattern: 'Which structure gives random access, and which gives lookup?',
      watch: 'Watch remove swap the last element into the hole.',
    },
    read: [
      { phrase: 'returns a random element, each with the same probability', says: 'Random access by index: keep the elements in a list.' },
      { phrase: 'All three must run in average O(1) time', says: 'Lookup by value: a map from value to its index.' },
    ],
    budget: { from: '≤ 2 × 10⁵ calls', rows: [['list only', 'O(n) remove', 'bad', 'slow'], ['set only', 'O(n) getRandom', 'bad', 'slow'], ['list + map, swap-remove', 'O(1) each', 'ok', 'the design']], aim: 'O(1) per call', note: 'Order inside the list doesn\'t matter, which is what makes the swap legal.' },
    observe: [
      {
        title: 'Swap with the last, then drop it',
        text: 'Remove 1 from [1, 2, 3]: copy 3 into slot 0, record 3 → 0 in the map, drop the end: [3, 2].',
        sketch: { kind: 'array', rows: [{ items: [3, 2, '×'], marks: { 0: 'hit', 2: 'dim' } }], caption: 'map: 3 → 0, 2 → 1' },
      },
      {
        title: 'Random is a random slot',
        text: 'With every element in slots 0..n − 1, picking a random index gives each element the same chance.',
        sketch: { kind: 'array', rows: [{ items: [3, 2], marks: { 1: 'cur' } }], caption: 'random index 1 → 2' },
      },
    ],
    brute: { idea: 'Keep a list; remove by searching and shifting.', cost: 'O(n) per remove', waste: 'Shifting keeps an order nobody needs; one swap with the last element is enough.' },
    pattern: {
      pick: 'design-data-structures',
      why: 'list + map value → index. insert: append, record. remove: move the last element into the removed slot, fix its index, pop. getRandom: list[random]. O(1).',
      not: [notHash('A hash set alone has no O(1) random pick.'), { id: 'two-pointers', why: 'The swap uses the last position, but nothing else about two pointers applies.' }],
    },
    watch: { viz: 'DesignWalkViz', inputs: [{ label: 'LeetCode example', input: { mode: 'randset', ops: ops(['insert', 1], ['remove', 2], ['insert', 2], ['getRandom'], ['remove', 1], ['insert', 2], ['getRandom']) } }, { label: 'remove from the middle', input: { mode: 'randset', ops: ops(['insert', 1], ['insert', 2], ['insert', 3], ['remove', 1], ['getRandom']) } }] },
    edges: ['insert an existing value → false.', 'remove a missing value → false.', 'getRandom with one element → that element.'],
  },

  'time-based-key-value-store': {
    aha: 'Keep, for each key, its versions as a list of (timestamp, value). Timestamps for a key arrive increasing, so the list is already sorted, and get(key, t) is a binary search for the last version at or before t.',
    asks: {
      read: 'Which version does get return? Are timestamps sorted?',
      budget: '2 × 10⁵ calls. Can get scan all versions?',
      observe: 'After set(foo, bar, 1) and set(foo, bar2, 4), what does get(foo, 3) return?',
      brute: 'Scanning a key\'s versions on each get: what does it cost?',
      pattern: 'The versions are sorted by time. What search fits "last one ≤ t"?',
      watch: 'Watch get binary search a key\'s versions.',
    },
    read: [
      { phrase: 'the largest timestamp `≤ timestamp`', says: 'The last version at or before t: binary search for an upper bound.' },
      { phrase: '`set` is called with strictly increasing timestamps', says: 'Appending keeps each key\'s list sorted for free.' },
      { phrase: 'or `""` if there is none', says: 'A query before the first version returns an empty string.' },
    ],
    budget: { from: '≤ 2 × 10⁵ calls', rows: [['scan versions per get', 'O(versions)', 'bad', 'slow on hot keys'], ['binary search', 'O(log versions)', 'ok', 'fast']], aim: 'O(1) set, O(log n) get', note: 'A TreeMap per key (floorKey) works too.' },
    observe: [
      {
        title: 'The last version not after t',
        text: 'foo has versions 1: bar and 4: bar2. get(foo, 3): the last one ≤ 3 is 1: bar.',
        sketch: { kind: 'array', rows: [{ label: 'foo', items: ['1:bar', '4:bar2'], marks: { 0: 'hit' } }], caption: 't = 3 → "bar"' },
      },
      {
        title: 'Before the first version',
        text: 'get(foo, 0): every version is newer, so return "".',
        sketch: { kind: 'array', rows: [{ label: 'foo', items: ['1:bar', '4:bar2'], marks: { 0: 'dim', 1: 'dim' } }], caption: '""' },
      },
    ],
    brute: { idea: 'For each get, scan all of the key\'s versions and keep the latest one at or before t.', cost: 'O(versions) per get', waste: 'The versions are already sorted; binary search skips almost all of them.' },
    pattern: {
      pick: 'design-data-structures',
      why: 'map: key → list of (t, value). set: append. get: binary search for the rightmost t ≤ query; "" if none. O(1) and O(log n).',
      not: [{ id: 'binary-search', why: 'Binary search answers get, but the design is choosing per-key sorted lists to search.' }, notHash('A plain map keeps only the newest value.')],
    },
    watch: { viz: 'DesignWalkViz', inputs: [{ label: 'LeetCode example', input: { mode: 'timemap', ops: ops(['set', 'foo', 'bar', 1], ['get', 'foo', 1], ['get', 'foo', 3], ['set', 'foo', 'bar2', 4], ['get', 'foo', 4], ['get', 'foo', 5]) } }, { label: 'two keys', input: { mode: 'timemap', ops: ops(['set', 'a', 'x', 2], ['set', 'b', 'y', 1], ['get', 'a', 1], ['get', 'b', 9], ['set', 'a', 'z', 5], ['get', 'a', 4]) } }] },
    edges: ['get before the first set → "".', 'Exact timestamp: get(foo, 4) → "bar2".', 'Missing key → "".'],
  },

  'peeking-iterator': {
    aha: 'The wrapped iterator can only move forward. To look ahead without "moving", take the next element early and keep it in a one-element cache. next() hands out the cached element first; hasNext() is true if something is cached or the iterator has more.',
    asks: {
      read: 'What must peek leave unchanged?',
      budget: 'How much extra memory does peeking need?',
      observe: 'For [1, 2, 3]: next, peek, next. What does each return?',
      brute: 'Copying the whole iterator into a list: what does it cost?',
      pattern: 'What do you need to remember after reading one element ahead?',
      watch: 'Watch peek fill the cache and next empty it.',
    },
    read: [
      { phrase: 'returns the next element without moving forward', says: 'Read ahead once and cache it.' },
      { phrase: 'Wrap an existing `Iterator<Integer>`', says: 'Only next() and hasNext() of the inner iterator are available.' },
    ],
    budget: { from: 'any length', rows: [['copy everything into a list', 'O(n) memory', 'bad', 'defeats an iterator'], ['one cached element', 'O(1) memory', 'ok', 'the design']], aim: 'O(1) per call', note: 'Works for infinite iterators too.' },
    observe: [
      {
        title: 'peek reads ahead',
        text: 'After next() → 1, peek() takes 2 from the iterator into the cache and returns it.',
        sketch: { kind: 'array', rows: [{ items: [1, 2, 3], marks: { 0: 'dim', 1: 'hit' } }], caption: 'cache: 2' },
      },
      {
        title: 'next serves the cache first',
        text: 'next() after the peek returns the cached 2 and clears the cache.',
        sketch: { kind: 'array', rows: [{ items: [1, 2, 3], marks: { 0: 'dim', 1: 'dim', 2: 'cur' } }], caption: 'cache: empty' },
      },
    ],
    brute: { idea: 'Drain the iterator into a list at the start and use an index.', cost: 'O(n) memory', waste: 'It stores everything to look one element ahead.' },
    pattern: {
      pick: 'design-data-structures',
      why: 'Fields: peeked, hasPeeked. peek: fill if empty, return. next: return the cache if present, else it.next(). hasNext: hasPeeked || it.hasNext(). O(1).',
      not: [notStack('No stack is needed: at most one element is looked ahead.'), { id: 'two-pointers', why: 'There is only one position to track.' }],
    },
    watch: { viz: 'DesignWalkViz', inputs: [{ label: '[1, 2, 3]', input: { mode: 'peeking', list: [1, 2, 3], ops: ops(['next'], ['peek'], ['next'], ['next'], ['hasNext']) } }, { label: 'peek twice', input: { mode: 'peeking', list: [5, 6], ops: ops(['peek'], ['peek'], ['next'], ['hasNext'], ['next'], ['hasNext']) } }] },
    edges: ['[1, 2, 3]: next, peek, next, next, hasNext → 1, 2, 2, 3, false.', 'peek twice → the same element.', 'hasNext with a cached element and an empty iterator → true.'],
  },

  'flatten-nested-list-iterator': {
    aha: 'Keep a stack of elements still to visit, the next one on top. hasNext() opens lists on top (pop, push their elements so the first is on top) until an integer is on top; next() pops it. Every list is opened once, so each call is O(1) on average.',
    asks: {
      read: 'What can an element be?',
      budget: 'Flattening everything first works. What does it cost if the caller stops early?',
      observe: 'For [[1,1],2,[1,[4,[6]]]], what is on the stack after opening the first list?',
      brute: 'Flattening the whole thing in the constructor: is that wrong?',
      pattern: 'Which structure lets you resume a depth-first walk later?',
      watch: 'Watch lists open on top of the stack and integers come out.',
    },
    read: [
      { phrase: 'either an integer or a list whose elements are again integers or lists', says: 'Nested to any depth: a depth-first walk.' },
      { phrase: 'The judge calls `hasNext` and `next` until `hasNext` returns `false`', says: 'Do the work lazily in hasNext.' },
    ],
    budget: { from: 'up to 500 integers', rows: [['flatten up front', 'O(total)', 'ok', 'simple'], ['lazy stack', 'O(1) average', 'ok', 'a real iterator']], aim: 'O(1) amortized per call', note: 'The lazy version also works for huge or streamed inputs.' },
    observe: [
      {
        title: 'Open the list on top',
        text: 'Start: stack [[1,1], 2, [1,[4,[6]]]] with [1,1] on top. It is a list: pop it, push 1 and 1. Now an integer is on top.',
        sketch: { kind: 'array', rows: [{ label: 'top first', items: [1, 1, 2, '[1,[4,[6]]]'], marks: { 0: 'hit' } }] },
      },
      {
        title: 'Deep lists open one level at a time',
        text: '[1,[4,[6]]] opens to 1 and [4,[6]]; later [4,[6]] opens to 4 and [6], and so on.',
        sketch: { kind: 'array', rows: [{ items: ['[1,[4,[6]]]', '→ 1, [4,[6]]', '→ 4, [6]', '→ 6'] }] },
      },
    ],
    brute: { idea: 'Recursively flatten everything into a list in the constructor, then iterate it.', cost: 'O(total) up front', waste: 'Fine for this problem, but it does all the work even if only a few elements are read.' },
    pattern: {
      pick: 'design-data-structures',
      why: 'Stack of NestedInteger (first on top). hasNext: while top is a list, pop it and push its elements in reverse; return !empty. next: hasNext(); pop the integer. O(1) amortized.',
      not: [notStack('The stack is the tool; the design is doing the work lazily, inside hasNext.'), { id: 'tree-dfs', why: 'It is a DFS over a tree of lists, paused between calls, which is why an explicit stack is needed.' }],
    },
    watch: { viz: 'DesignWalkViz', inputs: [{ label: '[[1,1],2,[1,[4,[6]]]]', input: { mode: 'flatten', nested: '[[1,1],2,[1,[4,[6]]]]' } }, { label: 'with an empty list', input: { mode: 'flatten', nested: '[[],[3],[[]]]' } }] },
    edges: ['[[1,1],2,[1,1]] → [1, 1, 2, 1, 1].', 'Empty lists inside: [[],[3]] → [3].', 'Only empty lists: [[],[[]]] → [] (hasNext is false at once).'],
  },

  'snapshot-array': {
    aha: 'Copying the array on every snap is O(n) per snap. Instead each index keeps only its changes, tagged with the snap id current when they were made. snap() just increments the id; get(i, s) binary searches index i\'s short history for the last change made at or before snapshot s.',
    asks: {
      read: 'What does snap return, and what does get(index, snapId) mean?',
      budget: 'length and calls up to 5 × 10⁴. Can you copy the array per snap?',
      observe: 'set(0, 5), snap, set(0, 6): what is get(0, 0)?',
      brute: 'A full copy per snap: what does that cost?',
      pattern: 'What actually changes between two snapshots?',
      watch: 'Watch each index keep its own history.',
    },
    read: [
      { phrase: 'returns its id, which is the number of earlier `snap` calls', says: 'snap is a counter; it should not copy anything.' },
      { phrase: 'the value the element at `index` had when snapshot `snapId` was taken', says: 'The last change at or before that snapshot: a binary search over that index\'s history.' },
    ],
    budget: { from: '≤ 5 × 10⁴ length and calls', rows: [['copy per snap', '5 × 10⁴ × 5 × 10⁴', 'bad', '2.5 × 10⁹'], ['history per index', 'O(1) set, O(log) get', 'ok', 'fast']], aim: 'O(1) set and snap, O(log n) get', note: 'Only changed indexes cost memory.' },
    observe: [
      {
        title: 'Changes are tagged with the snap id',
        text: 'set(0, 5) during snap 0, snap → 0, set(0, 6) during snap 1. Index 0\'s history: (0, 5), (1, 6).',
        sketch: { kind: 'array', rows: [{ label: 'index 0', items: ['snap 0: 5', 'snap 1: 6'], marks: { 0: 'hit' } }], caption: 'get(0, 0) → 5' },
      },
      {
        title: 'Never set means 0',
        text: 'Index 1 has no history: get(1, 0) is 0, the starting value.',
        sketch: { kind: 'array', rows: [{ label: 'index 1', items: ['(empty)'], marks: { 0: 'dim' } }], caption: '0' },
      },
    ],
    brute: { idea: 'Copy the whole array at every snap and index into the copy.', cost: 'O(n) per snap', waste: 'Most indexes don\'t change between snaps, but every copy stores them again.' },
    pattern: {
      pick: 'design-data-structures',
      why: 'Per index a list of (snapId, value) (overwrite if the last entry has the current id). snap: return id++. get: binary search for the last entry with snapId ≤ s; default 0.',
      not: [{ id: 'binary-search', why: 'Binary search answers get; the design is storing only changes.' }, notHash('A map per snapshot is the full copy in disguise.')],
    },
    watch: { viz: 'DesignWalkViz', inputs: [{ label: 'LeetCode example', input: { mode: 'snapshot', n: 3, ops: ops(['set', 0, 5], ['snap'], ['set', 0, 6], ['get', 0, 0]) } }, { label: 'several snaps', input: { mode: 'snapshot', n: 2, ops: ops(['set', 0, 1], ['snap'], ['snap'], ['set', 0, 2], ['snap'], ['get', 0, 1], ['get', 0, 2], ['get', 1, 0]) } }] },
    edges: ['LeetCode example → snap 0, get(0, 0) = 5.', 'An index never set → 0.', 'Two sets in the same snap → the later one wins.'],
  },

  'design-twitter': {
    aha: 'Each user keeps their own tweets in time order (with a global counter) and a set of followees. A feed needs only the 10 newest tweets among a handful of already-sorted lists: a k-way merge with a heap, stopping after 10.',
    asks: {
      read: 'Whose tweets appear in a feed, and how many?',
      budget: 'Could a feed scan every tweet ever posted?',
      observe: 'User 1 posts 5, follows 2; user 2 posts 6. What is user 1\'s feed?',
      brute: 'Scanning all tweets per feed: what does it cost?',
      pattern: 'Several sorted lists, and you want the top 10 overall: which pattern?',
      watch: 'Watch feeds merge the newest tweets of a user and their followees.',
    },
    read: [
      { phrase: 'the 10 most recent tweets posted by the user or by anyone they follow', says: 'Merge a few per-user lists, newest first, and stop at 10.' },
      { phrase: 'always sees their own tweets', says: 'Include the user even though they don\'t follow themselves.' },
    ],
    budget: { from: '≤ 3 × 10⁴ calls', rows: [['scan every tweet', 'O(all tweets) per feed', 'bad', 'grows forever'], ['k-way merge of followees', 'O(f + 10 log f)', 'ok', 'fast']], aim: 'O(f log f) per feed for f followees', note: 'Only the last 10 tweets of each user can ever matter.' },
    observe: [
      {
        title: 'A feed merges a few lists',
        text: 'User 1 follows 2. Lists: user 1 [5 @0], user 2 [6 @1]. Newest first: 6, then 5.',
        sketch: { kind: 'array', rows: [{ label: 'merged', items: ['6 @1', '5 @0'], marks: { 0: 'hit' } }] },
      },
      {
        title: 'Unfollow removes a list',
        text: 'After unfollowing 2, user 1\'s feed is just [5].',
        sketch: { kind: 'array', rows: [{ label: 'feed', items: [5] }] },
      },
    ],
    brute: { idea: 'Keep one global list of all tweets and scan it from the newest for each feed.', cost: 'O(total tweets) per feed', waste: 'It walks past tweets of users nobody here follows.' },
    pattern: {
      pick: 'design-data-structures',
      why: 'tweets: user → list of (time, id); follows: user → set. feed: max-heap seeded with each relevant user\'s newest tweet; pop up to 10, pushing that user\'s next-older tweet. ',
      not: [notHeap('The heap does the merge; the design is what is stored per user.'), { id: 'sorting-and-selection', why: 'Sorting all candidate tweets works but sorts far more than 10.' }],
    },
    watch: { viz: 'DesignWalkViz', inputs: [{ label: 'LeetCode example', input: { mode: 'twitter', ops: ops(['post', 1, 5], ['feed', 1], ['follow', 1, 2], ['post', 2, 6], ['feed', 1], ['unfollow', 1, 2], ['feed', 1]) } }, { label: 'three users', input: { mode: 'twitter', ops: ops(['post', 1, 1], ['post', 2, 2], ['post', 3, 3], ['follow', 1, 3], ['feed', 1], ['feed', 2]) } }] },
    edges: ['LeetCode example → [5], [6, 5], [5].', 'A user with no tweets and no follows → [].', 'Unfollowing someone not followed → nothing changes.'],
  },

  'lfu-cache': {
    aha: 'Group keys by how many times they have been used, and inside each group keep them in order of last use (like an LRU). Track the smallest count in use. Evict the oldest key of the smallest-count group; every get or put moves a key up one group. Hash maps of linked sets make all of it O(1).',
    asks: {
      read: 'How are ties between equally frequent keys broken?',
      budget: 'O(1) per call: can you search for the least frequent key?',
      observe: 'Capacity 2: put 1, put 2, get 1, put 3. Which key goes?',
      brute: 'Scanning all keys for the smallest (count, last use): what does it cost?',
      pattern: 'LRU handles recency with one list. How many lists does frequency need?',
      watch: 'Watch keys climb count groups, and evictions take the oldest of the lowest group.',
    },
    read: [
      { phrase: 'first evict the least frequently used key', says: 'Group keys by use count; track the minimum count.' },
      { phrase: 'if several keys tie, evict the least recently used among them', says: 'Within a count group, keep LRU order.' },
      { phrase: 'Both operations must run in O(1) average time', says: 'No searching: maps from key and from count.' },
    ],
    budget: { from: '≤ 2 × 10⁵ calls', rows: [['scan for the victim', 'O(capacity) per put', 'bad', 'too slow'], ['count → LinkedHashSet, minCount', 'O(1)', 'ok', 'the design']], aim: 'O(1) per call', note: 'minCount resets to 1 on every new key.' },
    observe: [
      {
        title: 'Frequency first',
        text: 'put 1, put 2, get 1: key 1 has count 2, key 2 count 1. put 3 evicts 2, the least used.',
        sketch: { kind: 'array', rows: [{ label: 'count 1', items: [2], marks: { 0: 'bad' } }, { label: 'count 2', items: [1] }] },
      },
      {
        title: 'Then recency',
        text: 'put 1, put 2, put 3 (capacity 2): 1 and 2 both have count 1, and 1 is older, so 1 goes.',
        sketch: { kind: 'array', rows: [{ label: 'count 1 (old → new)', items: [1, 2], marks: { 0: 'bad' } }] },
      },
    ],
    brute: { idea: 'Store (value, count, last use) per key and scan all keys to pick the victim.', cost: 'O(capacity) per eviction', waste: 'The victim is always the oldest key of the lowest count, which grouped lists keep at hand.' },
    pattern: {
      pick: 'design-data-structures',
      why: 'key → (value, count); count → LinkedHashSet of keys; minCount. Touch: move key to count + 1 (bump minCount if its old group emptied). Evict: first key of group minCount. New key: count 1, minCount = 1.',
      not: [notHeap('A heap by (count, time) is O(log n) and needs updates on every use.'), { id: 'linked-list-manipulation', why: 'One list (LRU) can\'t order by frequency; this needs a list per count.' }],
    },
    watch: { viz: 'DesignWalkViz', inputs: [{ label: 'LeetCode example', input: { mode: 'lfu', cap: 2, ops: ops(['put', 1, 1], ['put', 2, 2], ['get', 1], ['put', 3, 3], ['get', 2], ['get', 3], ['put', 4, 4], ['get', 1], ['get', 3], ['get', 4]) } }, { label: 'a tie broken by recency', input: { mode: 'lfu', cap: 2, ops: ops(['put', 1, 1], ['put', 2, 2], ['put', 3, 3], ['get', 2], ['get', 3]) } }] },
    edges: ['LeetCode example → 1, −1, 3, −1, 3, 4.', 'Tie: capacity 2, put 1, 2, 3 → 1 is evicted.', 'Capacity 0 (on LeetCode) → every get is −1.'],
  },

  'insert-delete-getrandom-o1-duplicates-allowed': {
    aha: 'Same as the set version, but a value can sit in several slots, so map each value to the SET of its slots. Remove takes any one of them, copies the last element into that slot, moves that element\'s recorded slot, and drops the end.',
    asks: {
      read: 'How does insert\'s return value differ from the set version?',
      budget: 'All operations O(1): what replaces "value → slot"?',
      observe: 'List [1, 1, 2]: remove 1. Which slot do you free, and what moves?',
      brute: 'A list with search and shift: what does remove cost?',
      pattern: 'What should the map store when values repeat?',
      watch: 'Watch the slot sets update when the last element moves.',
    },
    read: [
      { phrase: 'a multiset that may hold duplicates', says: 'A value can be in several slots: map value → set of slots.' },
      { phrase: 'with each value\'s chance proportional to how many copies it has', says: 'Pick a random slot of the list: copies count automatically.' },
      { phrase: 'returns `true` if `val` was not present before', says: 'Check before adding; still add the copy.' },
    ],
    budget: { from: '≤ 2 × 10⁵ calls', rows: [['list with search', 'O(n) remove', 'bad', 'slow'], ['list + value → slot set', 'O(1) average', 'ok', 'the design']], aim: 'O(1) average per call', note: 'Use a HashSet of indexes per value.' },
    observe: [
      {
        title: 'Remove one copy',
        text: '[1, 1, 2], 1 → {0, 1}, 2 → {2}. Remove 1 from slot 1: copy 2 there, 2 → {1}, drop the end: [1, 2].',
        sketch: { kind: 'array', rows: [{ items: [1, 2, '×'], marks: { 1: 'hit', 2: 'dim' } }], caption: '1 → {0}, 2 → {1}' },
      },
      {
        title: 'Copies weigh the random pick',
        text: 'In [1, 1, 2], a random slot is 1 two times out of three.',
        sketch: { kind: 'array', rows: [{ items: [1, 1, 2], marks: { 0: 'hit', 1: 'hit' } }], caption: 'P(1) = 2/3' },
      },
    ],
    brute: { idea: 'Keep a list; remove by searching for a copy and shifting.', cost: 'O(n) per remove', waste: 'The shift preserves an order nobody needs.' },
    pattern: {
      pick: 'design-data-structures',
      why: 'list + map value → set of indexes. insert: append, add index. remove: take any index i of val; move the last element into i, update its index set; pop. getRandom: list[random]. O(1) average.',
      not: [notHash('A count map alone can\'t pick a random element in O(1).'), { id: 'sorting-and-selection', why: 'Order doesn\'t matter at all, which is what allows the swap.' }],
    },
    watch: { viz: 'DesignWalkViz', inputs: [{ label: 'LeetCode example', input: { mode: 'randcoll', ops: ops(['insert', 1], ['insert', 1], ['insert', 2], ['getRandom'], ['remove', 1], ['getRandom']) } }, { label: 'remove the last copy', input: { mode: 'randcoll', ops: ops(['insert', 4], ['insert', 3], ['insert', 4], ['remove', 4], ['remove', 4], ['remove', 4]) } }] },
    edges: ['insert 1 twice → true, then false.', 'Remove the last copy → the value disappears from the map.', 'Remove a missing value → false.'],
  },

  'design-hashset': {
    aha: 'The hash map design without values: an array of buckets, each a short chain of keys. add appends if missing, remove unlinks, contains scans one bucket. With enough buckets every chain stays tiny.',
    asks: {
      read: 'What happens when add is called twice with the same key?',
      budget: 'Keys up to 10⁶. Is a boolean array of 10⁶ fine? What about bigger keys?',
      observe: 'With 5 buckets, add 1 and 6. Where do they go?',
      brute: 'A list scanned per call: how slow?',
      pattern: 'How do you narrow a lookup to a few candidates?',
      watch: 'Watch each call look in just one bucket.',
    },
    read: [
      { phrase: 'without using any built-in hash table', says: 'Build buckets and chains yourself.' },
      { phrase: 'removes `key` if it is present (otherwise does nothing)', says: 'remove must tolerate missing keys.' },
    ],
    budget: { from: 'keys ≤ 10⁶, ≤ 10⁴ calls', rows: [['boolean[10⁶ + 1]', '10⁶ memory', 'ok', 'works here'], ['buckets with chains', 'O(1) average', 'ok', 'scales to any key range']], aim: 'O(1) average per call', note: 'The boolean array is a fine interview answer if keys are small; say so.' },
    observe: [
      {
        title: 'Same bucket, different keys',
        text: '1 and 6 both give remainder 1: one chain [1, 6]. contains(6) scans just those two.',
        sketch: { kind: 'array', rows: [{ label: 'bucket 1', items: [1, 6], marks: { 1: 'hit' } }] },
      },
      {
        title: 'add is idempotent',
        text: 'add(2) twice: the second call finds 2 in its chain and does nothing.',
        sketch: { kind: 'array', rows: [{ label: 'bucket 2', items: [2] }] },
      },
    ],
    brute: { idea: 'Keep keys in a list and scan it for every call.', cost: 'O(n) per call', waste: 'Each call compares against every key, though only keys in the same bucket can match.' },
    pattern: {
      pick: 'design-data-structures',
      why: 'buckets[k % M] = chain. add: append if absent. remove: unlink if present. contains: scan the chain. O(1) average.',
      not: [notHash('Using HashSet is what is forbidden.'), { id: 'bit-manipulation', why: 'A bitset of 10⁶ bits works for this key range, but not for arbitrary keys.' }],
    },
    watch: { viz: 'DesignWalkViz', inputs: [{ label: 'LeetCode example', input: { mode: 'hashset', ops: ops(['add', 1], ['add', 2], ['contains', 1], ['contains', 3], ['add', 2], ['contains', 2], ['remove', 2], ['contains', 2]) } }, { label: 'a collision', input: { mode: 'hashset', ops: ops(['add', 1], ['add', 6], ['add', 11], ['contains', 6], ['remove', 1], ['contains', 11]) } }] },
    edges: ['LeetCode example → true, false, true, false.', 'remove a missing key → nothing happens.', 'add the same key twice → one copy.'],
  },

  'implement-stack-using-queues': {
    aha: 'Keep the queue in stack order: after adding x at the back, move every older element from the front to the back. Now x is at the front, where pop and top look. push is O(n); pop and top are O(1).',
    asks: {
      read: 'Which queue operations are allowed?',
      budget: 'Which operation should pay the O(n) cost?',
      observe: 'Queue [1, 2], push 3: how do you bring 3 to the front?',
      brute: 'Two queues, moving all but the last on every pop: what does it cost?',
      pattern: 'What does rotating a queue size − 1 times do to the newest element?',
      watch: 'Watch push rotate the new element to the front.',
    },
    read: [
      { phrase: 'Use only standard queue operations', says: 'Add to the back, remove from the front: rotation is the only way to reorder.' },
      { phrase: '`int pop()` removes the top element and returns it', says: 'The newest element must be at the queue\'s front.' },
    ],
    budget: { from: '≤ 100 calls', rows: [['rotate on push', 'O(n) push, O(1) pop', 'ok', 'one queue'], ['rotate on pop', 'O(1) push, O(n) pop', 'ok', 'two queues']], aim: 'O(n) for one of push / pop', note: 'Either side can pay; one queue is enough.' },
    observe: [
      {
        title: 'Rotate after push',
        text: 'Queue [2, 1] (front = 2, the top). Push 3: [2, 1, 3], then move 2 and 1 to the back: [3, 2, 1].',
        sketch: { kind: 'array', rows: [{ label: 'queue', items: [3, 2, 1], marks: { 0: 'hit' } }], caption: 'front = top' },
      },
      {
        title: 'pop is just poll',
        text: 'The front is the most recent push, so pop and top work at the front with no extra work.',
        sketch: { kind: 'array', rows: [{ items: [3, 2, 1], marks: { 0: 'cur' } }] },
      },
    ],
    brute: { idea: 'Keep elements in arrival order; on pop, move all but the last to a second queue, take the last, and swap the queues.', cost: 'O(n) per pop', waste: 'Not wasteful, just the other choice of which call pays; both are O(n) for one operation.' },
    pattern: {
      pick: 'design-data-structures',
      why: 'push(x): q.add(x); repeat size − 1 times: q.add(q.remove()). pop: q.remove(). top: q.peek(). empty: q.isEmpty().',
      not: [{ id: 'stack-patterns', why: 'A real stack is what is being built; only queue operations are allowed.' }, { id: 'linked-list-manipulation', why: 'A linked list would be a stack directly, which the problem rules out.' }],
    },
    watch: { viz: 'DesignWalkViz', inputs: [{ label: 'LeetCode-style', input: { mode: 'stack1', ops: ops(['push', 1], ['push', 2], ['top'], ['pop'], ['empty']) } }, { label: 'three pushes', input: { mode: 'stack1', ops: ops(['push', 1], ['push', 2], ['push', 3], ['top'], ['pop'], ['pop'], ['empty']) } }] },
    edges: ['push 1, push 2, top, pop, empty → 2, 2, false.', 'One element: push 5, pop → 5, then empty → true.', 'Interleaved: push 1, pop, push 2, top → 1, 2.'],
  },

  'design-circular-queue': {
    aha: 'A fixed array plus a head index and a count. The rear is at (head + count − 1) % k; enQueue writes at (head + count) % k, deQueue moves head forward by one, wrapping around. No element ever moves, and every operation is O(1).',
    asks: {
      read: 'What should enQueue return on a full queue?',
      budget: 'Capacity up to 1000. Shifting elements on every deQueue: acceptable?',
      observe: 'Capacity 3: enQueue 1, 2, 3, deQueue, enQueue 4. Where does 4 go?',
      brute: 'An array that shifts left on every deQueue: what does it cost?',
      pattern: 'How can the queue reuse space at the start of the array?',
      watch: 'Watch head and tail wrap around the fixed array.',
    },
    read: [
      { phrase: 'whose storage wraps around (a ring buffer)', says: 'Indexes taken modulo the capacity.' },
      { phrase: 'returns `false` if the queue is full', says: 'Track the count to tell full from empty.' },
      { phrase: 'Do not use a built-in queue', says: 'Build it on a plain array.' },
    ],
    budget: { from: 'k ≤ 1000, ≤ 3000 calls', rows: [['shift on deQueue', 'O(k) each', 'bad', 'wasteful'], ['ring buffer', 'O(1) each', 'ok', 'the design']], aim: 'O(1) per call', note: 'Head + count avoids the classic full-vs-empty confusion of head == tail.' },
    observe: [
      {
        title: 'Wrap around',
        text: 'After enQueue 1, 2, 3 and one deQueue, slot 0 is free. enQueue 4 writes at (head + count) % 3 = 0.',
        sketch: { kind: 'array', rows: [{ items: [4, 2, 3], marks: { 0: 'hit' }, tags: { 1: [['front', 'accent']], 0: [['rear', 'success']] } }] },
      },
      {
        title: 'Full vs empty',
        text: 'head == tail happens both when full and when empty; keeping a count makes isFull() count == k and isEmpty() count == 0.',
        sketch: { kind: 'array', rows: [{ items: ['count == 0', 'count == k'] }] },
      },
    ],
    brute: { idea: 'Use an array as a queue and shift everything left after each deQueue.', cost: 'O(k) per deQueue', waste: 'Every element moves on every deQueue, though only the front index needs to change.' },
    pattern: {
      pick: 'design-data-structures',
      why: 'int[] a = new int[k]; head, count. enQueue: if full false; a[(head + count) % k] = v; count++. deQueue: if empty false; head = (head + 1) % k; count--. Front: a[head]. Rear: a[(head + count − 1) % k].',
      not: [{ id: 'two-pointers', why: 'head and tail look like two pointers, but they never meet in the middle: they chase each other around a ring.' }, { id: 'linked-list-manipulation', why: 'A linked list makes a queue too, but the problem asks for a fixed-capacity ring.' }],
    },
    watch: { viz: 'StackQueueViz', inputs: [{ label: 'capacity 4', input: { mode: 'queue', cap: 4, ops: [['offer', 3], ['offer', 8], ['offer', 5], ['poll'], ['offer', 1], ['offer', 7], ['poll'], ['offer', 9], ['peek']] } }, { label: 'capacity 3', input: { mode: 'queue', cap: 3, ops: [['offer', 1], ['offer', 2], ['offer', 3], ['poll'], ['offer', 4], ['peek']] } }] },
    edges: ['LeetCode (k = 3): enQueue 1, 2, 3, 4 → true, true, true, false.', 'Rear after wrapping → the value at (head + count − 1) % k.', 'Front on an empty queue → −1.'],
  },

  'detect-squares': {
    aha: 'Store a count for each point. For a query point, the corner of a square opposite it is a stored point on a diagonal (same distance across as up or down). Once that corner is chosen, the other two corners are fixed, so multiply the three corners\' counts. Only the distinct stored points are tried, not all triples.',
    asks: {
      read: 'Do duplicate points count separately? What square shapes count?',
      budget: '5000 calls. Can count try every triple of stored points?',
      observe: 'Stored (1, 3), (3, 1), (1, 1). How many squares does (3, 3) complete?',
      brute: 'Trying every triple of stored points: what does it cost?',
      pattern: 'If you fix the opposite corner, how many choices are left for the other two?',
      watch: 'Watch count try each diagonal corner and multiply.',
    },
    read: [
      { phrase: 'The same point may be added several times; each copy counts separately', says: 'Store counts, and multiply them.' },
      { phrase: 'axis-aligned square with positive area', says: 'The opposite corner is on a diagonal and not the query point itself.' },
    ],
    budget: { from: '≤ 5000 calls, coordinates ≤ 1000', rows: [['every triple of points', 'n³', 'bad', 'too slow'], ['every distinct diagonal corner', 'O(distinct points)', 'ok', 'fast']], aim: 'O(distinct points) per count', note: 'Group points by x to try only one column instead.' },
    observe: [
      {
        title: 'Pick the opposite corner',
        text: 'For (3, 3), the stored (1, 1) is on a diagonal (2 across, 2 down). The other corners must be (1, 3) and (3, 1): both stored, so 1 square.',
        sketch: { kind: 'grid', grid: [['(1,3)', '·', '?'], ['·', '·', '·'], ['(1,1)', '·', '(3,1)']], marks: { '0,0': 'hit', '2,0': 'hit', '2,2': 'hit', '0,2': 'cur' } },
      },
      {
        title: 'Copies multiply',
        text: 'Add (1, 1) a second time: now the same square can use either copy, so count gives 1 · 2 · 1 = 2.',
        sketch: { kind: 'array', rows: [{ items: ['(1,3) × 1', '(1,1) × 2', '(3,1) × 1', '= 2'], marks: { 3: 'hit' } }] },
      },
    ],
    brute: { idea: 'For each count query, try every ordered triple of stored points and check whether they square up with the query.', cost: 'O(n³) per count', waste: 'Once the diagonal corner is picked, the other two corners are forced; only their counts are needed.' },
    pattern: {
      pick: 'design-data-structures',
      why: 'cnt: map point → copies. count(qx, qy): for each stored (x, y) with |x − qx| == |y − qy| > 0, add cnt[(x, y)] · cnt[(x, qy)] · cnt[(qx, y)].',
      not: [{ id: 'hashing', why: 'The counting map is hashing; the design is fixing the diagonal corner first.' }, { id: 'math-for-interviews', why: 'The geometry is simple; the work is avoiding triples.' }],
    },
    watch: { viz: 'DesignWalkViz', inputs: [{ label: 'a small grid', input: { mode: 'squares', ops: ops(['add', 1, 3], ['add', 3, 1], ['add', 1, 1], ['count', 3, 3], ['count', 2, 2], ['add', 1, 1], ['count', 3, 3]) } }, { label: 'two squares at once', input: { mode: 'squares', ops: ops(['add', 0, 0], ['add', 0, 2], ['add', 4, 0], ['add', 4, 2], ['add', 2, 0], ['count', 2, 2]) } }] },
    edges: ['No stored points → 0.', 'A duplicate corner → count doubles.', 'A zero-size "square" (the query point itself) → not counted.'],
  },

  'maximum-frequency-stack': {
    aha: 'Keep one stack per frequency level: the k-th copy of a value goes onto stack k. The most frequent value is on the highest non-empty stack, and within it the most recent is on top, which is exactly the tie rule. Popping just uncovers the level below.',
    asks: {
      read: 'Which value does pop remove when several are tied?',
      budget: 'Can pop search the whole stack?',
      observe: 'Push 5, 7, 5, 7, 4, 5. Which stack is each 5 on?',
      brute: 'Count frequencies and scan from the top on each pop: what does it cost?',
      pattern: 'What if each copy of a value lived on its own level?',
      watch: 'Watch copies land on stacks by their count, and pops come from the highest stack.',
    },
    read: [
      { phrase: 'removes and returns the most frequent value in the stack', says: 'Group by frequency; pop from the highest group.' },
      { phrase: 'the one closest to the top (pushed most recently)', says: 'Within a frequency, stack order breaks ties.' },
    ],
    budget: { from: '≤ 2 × 10⁴ calls', rows: [['scan per pop', 'O(n)', 'bad', 'slow'], ['heap of (freq, time)', 'O(log n)', 'ok', 'works'], ['a stack per frequency', 'O(1)', 'ok', 'simplest']], aim: 'O(1) per call', note: 'Each value appears on stacks 1..freq, once per level.' },
    observe: [
      {
        title: 'Copies stack up by level',
        text: 'Push 5, 7, 5, 7, 4, 5. Stack 1: 5, 7, 4. Stack 2: 5, 7. Stack 3: 5.',
        sketch: { kind: 'array', rows: [{ label: 'stack 3', items: [5], marks: { 0: 'hit' } }, { label: 'stack 2', items: [5, 7] }, { label: 'stack 1', items: [5, 7, 4] }] },
      },
      {
        title: 'Ties go to the most recent',
        text: 'After popping 5 from stack 3, stack 2 holds 5 then 7: 7 is on top, the most recently pushed of the tied values.',
        sketch: { kind: 'array', rows: [{ label: 'stack 2', items: [5, 7], marks: { 1: 'hit' } }] },
      },
    ],
    brute: { idea: 'Keep one stack and a count map; on pop, find the highest count and scan down from the top for the first value with it.', cost: 'O(n) per pop', waste: 'The scan rediscovers the frequency order that per-level stacks keep for free.' },
    pattern: {
      pick: 'design-data-structures',
      why: 'freq: value → count; group: count → stack; maxFreq. push: f = ++freq[x]; group[f].push(x). pop: x = group[maxFreq].pop(); freq[x]--; if empty, maxFreq--. O(1).',
      not: [notHeap('A heap of (frequency, push time) works in O(log n), but the level stacks are O(1).'), notStack('One stack can\'t answer "most frequent"; one per level can.')],
    },
    watch: { viz: 'DesignWalkViz', inputs: [{ label: 'LeetCode example', input: { mode: 'freqstack', ops: ops(['push', 5], ['push', 7], ['push', 5], ['push', 7], ['push', 4], ['push', 5], ['pop'], ['pop'], ['pop'], ['pop']) } }, { label: 'all different', input: { mode: 'freqstack', ops: ops(['push', 1], ['push', 2], ['push', 3], ['pop'], ['pop']) } }] },
    edges: ['LeetCode example → 5, 7, 5, 4.', 'All values different → behaves like a normal stack.', 'One value pushed three times → pops it three times.'],
  },

  'smallest-number-in-infinite-set': {
    aha: 'The set only ever differs from "every number ≥ next" by a few numbers added back below next. Keep next as a counter and the added-back numbers in a min-heap (with a set to avoid duplicates). The smallest is the heap\'s top if any, else next.',
    asks: {
      read: 'What does addBack do for a number that is already in the set?',
      budget: 'The set is infinite. What finite state describes it?',
      observe: 'Pop 1, 2, 3, then addBack 1. What do the next two pops return?',
      brute: 'A boolean array over 1..1000 scanned on every pop: what does it cost?',
      pattern: 'Which numbers below next can be in the set, and how do you get the smallest fast?',
      watch: 'Watch next move up and the heap hold numbers given back.',
    },
    read: [
      { phrase: 'starts out containing every positive integer', says: 'Everything from next upwards is present: a counter describes it.' },
      { phrase: 'adds `num` back into the set, if it isn\'t in the set already', says: 'Only numbers below next can be missing; keep those in a heap + set.' },
    ],
    budget: { from: '≤ 1000 calls, values ≤ 1000', rows: [['boolean array + scan', 'O(1000) per pop', 'ok', 'works here'], ['counter + min-heap', 'O(log n)', 'ok', 'works for any range']], aim: 'O(log n) per call', note: 'A TreeSet of added-back numbers works too.' },
    observe: [
      {
        title: 'A counter covers the infinite part',
        text: 'After popping 1, 2, 3, next = 4: every number from 4 on is still present.',
        sketch: { kind: 'array', rows: [{ items: [1, 2, 3, 4, 5], marks: { 0: 'dim', 1: 'dim', 2: 'dim', 3: 'cur' }, tags: { 3: [['next', 'accent']] } }] },
      },
      {
        title: 'Given-back numbers go first',
        text: 'addBack 1 puts 1 in the heap. The next pop returns 1 (smaller than next = 4), then 4.',
        sketch: { kind: 'array', rows: [{ label: 'heap', items: [1], marks: { 0: 'hit' } }] },
      },
    ],
    brute: { idea: 'Keep a boolean "present" array for 1..1000 and scan from 1 for the first present number.', cost: 'O(range) per pop', waste: 'Every pop rescans the numbers already removed.' },
    pattern: {
      pick: 'design-data-structures',
      why: 'next = 1; heap + set of added-back numbers < next. popSmallest: heap non-empty ? poll (and remove from set) : next++. addBack(x): if x < next and not in set, add.',
      not: [notHeap('A heap holding all numbers is impossible (the set is infinite); the counter is the trick.'), { id: 'bst-patterns', why: 'A TreeSet is a fine alternative to the heap + set pair.' }],
    },
    watch: { viz: 'DesignWalkViz', inputs: [{ label: 'LeetCode example', input: { mode: 'infinite', ops: ops(['addBack', 2], ['popSmallest'], ['popSmallest'], ['popSmallest'], ['addBack', 1], ['popSmallest'], ['popSmallest'], ['popSmallest']) } }, { label: 'add back twice', input: { mode: 'infinite', ops: ops(['popSmallest'], ['popSmallest'], ['addBack', 1], ['addBack', 1], ['popSmallest'], ['popSmallest']) } }] },
    edges: ['LeetCode example → 1, 2, 3, 1, 4, 5.', 'addBack of a number ≥ next → nothing changes.', 'addBack twice → the number comes back once.'],
  },

  'seat-reservation-manager': {
    aha: 'Seats from some number on have never been reserved: track that boundary as next. Seats given back below it go into a min-heap. reserve() takes the heap\'s smallest if there is one, else next++; unreserve(s) pushes s onto the heap.',
    asks: {
      read: 'Which seat does reserve pick?',
      budget: '10⁵ seats and calls. Can reserve scan for the lowest free seat?',
      observe: 'Reserve, reserve, unreserve 2, reserve. Which seat is the last reserve?',
      brute: 'Scanning a boolean array for the first free seat: what does it cost?',
      pattern: 'What structure gives the smallest of a changing set fast?',
      watch: 'Watch next move up and given-back seats wait in the heap.',
    },
    read: [
      { phrase: 'reserves the lowest-numbered unreserved seat', says: 'The minimum of the free seats: a min-heap.' },
      { phrase: 'makes a reserved seat unreserved again', says: 'Freed seats go back into the heap.' },
    ],
    budget: { from: 'n, calls ≤ 10⁵', rows: [['scan per reserve', 'O(n)', 'bad', '10¹⁰ total'], ['heap of all seats', 'O(log n)', 'ok', 'fine'], ['next + heap of freed seats', 'O(log k)', 'ok', 'lighter']], aim: 'O(log n) per call', note: 'Filling a heap with all n seats up front also works.' },
    observe: [
      {
        title: 'Fresh seats come from a counter',
        text: 'reserve → 1, reserve → 2: next is now 3.',
        sketch: { kind: 'array', rows: [{ items: [1, 2, 3, 4, 5], marks: { 0: 'dim', 1: 'dim', 2: 'cur' }, tags: { 2: [['next', 'accent']] } }] },
      },
      {
        title: 'A freed seat beats next',
        text: 'unreserve 2 puts 2 in the heap; the next reserve returns 2, not 3.',
        sketch: { kind: 'array', rows: [{ label: 'heap', items: [2], marks: { 0: 'hit' } }] },
      },
    ],
    brute: { idea: 'Keep a boolean array of reserved seats and scan from seat 1 for each reserve.', cost: 'O(n) per reserve', waste: 'Every reserve rescans the block of taken seats at the start.' },
    pattern: {
      pick: 'design-data-structures',
      why: 'next = 1; min-heap of freed seats. reserve: heap non-empty ? poll : next++. unreserve(s): heap.add(s). O(log n).',
      not: [notHeap('A heap is the tool; the design adds the counter so only freed seats are stored.'), { id: 'greedy', why: 'The "lowest seat" rule is given; there is no choice to make.' }],
    },
    watch: { viz: 'DesignWalkViz', inputs: [{ label: 'LeetCode example', input: { mode: 'seats', n: 5, ops: ops(['reserve'], ['reserve'], ['unreserve', 2], ['reserve'], ['reserve'], ['reserve'], ['reserve'], ['unreserve', 5]) } }, { label: 'free two seats', input: { mode: 'seats', n: 4, ops: ops(['reserve'], ['reserve'], ['reserve'], ['unreserve', 3], ['unreserve', 1], ['reserve'], ['reserve']) } }] },
    edges: ['LeetCode example → 1, 2, 2, 3, 4, 5.', 'Two freed seats → reserved smallest first.', 'n = 1: reserve → 1.'],
  },

  'stock-price-fluctuation': {
    aha: 'A map holds the true price per timestamp (corrections overwrite). Max and min come from two heaps of (price, timestamp), but a correction leaves old entries behind. Don\'t delete them: when one reaches a heap\'s top, check it against the map and throw it away if it is stale.',
    asks: {
      read: 'What happens to an earlier price when its timestamp is updated again?',
      budget: '10⁵ calls. Can maximum scan every timestamp?',
      observe: 'update(1, 10), update(2, 5), update(1, 3). What is the maximum now, and what is wrong in a naive max-heap?',
      brute: 'Scanning the map for max and min: what does it cost?',
      pattern: 'How can a heap handle values that become wrong later?',
      watch: 'Watch stale entries get skipped when they reach the top.',
    },
    read: [
      { phrase: 'a record for a timestamp seen before **corrects** the earlier price', says: 'The map is the truth; heap entries can go stale.' },
      { phrase: '`int current()` returns the price at the latest timestamp seen so far', says: 'Track the largest timestamp.' },
      { phrase: 'using the corrected prices', says: 'max / min must ignore overwritten prices: lazy deletion.' },
    ],
    budget: { from: '≤ 10⁵ calls', rows: [['scan the map', 'O(n) per query', 'bad', 'slow'], ['heaps with lazy deletion', 'O(log n) amortized', 'ok', 'the design']], aim: 'O(log n) amortized', note: 'A TreeMap of price → count works too.' },
    observe: [
      {
        title: 'A correction leaves a stale entry',
        text: 'The max-heap holds (10, t1) and (5, t2). update(1, 3) adds (3, t1), but (10, t1) is still on top.',
        sketch: { kind: 'array', rows: [{ label: 'max-heap', items: ['10 @1', '5 @2', '3 @1'], marks: { 0: 'bad' } }] },
      },
      {
        title: 'Check against the map',
        text: 'map[1] is 3, not 10: pop (10, t1) and look again. (5, t2) matches: maximum = 5.',
        sketch: { kind: 'array', rows: [{ label: 'max-heap', items: ['5 @2', '3 @1'], marks: { 0: 'hit' } }] },
      },
    ],
    brute: { idea: 'Keep the map and scan all its prices for maximum and minimum.', cost: 'O(n) per query', waste: 'The extremes change rarely, yet every query rescans everything.' },
    pattern: {
      pick: 'design-data-structures',
      why: 'map t → price; latest t; max-heap and min-heap of (price, t). update: map[t] = p; push to both heaps. max/min: while top\'s price ≠ map[top.t], pop; return top. O(log n) amortized.',
      not: [notHeap('A plain heap can\'t remove an arbitrary old entry; lazy deletion is the design.'), { id: 'bst-patterns', why: 'A TreeMap price → count handles corrections directly, in O(log n).' }],
    },
    watch: { viz: 'LazyHeapViz', inputs: [{ label: 'corrections', input: { ops: [['update', 1, 10], ['update', 2, 5], ['current'], ['maximum'], ['update', 1, 3], ['maximum'], ['update', 4, 2], ['minimum']] } }, { label: 'several stale tops', input: { ops: [['update', 1, 9], ['update', 2, 8], ['update', 3, 7], ['update', 1, 1], ['update', 2, 2], ['maximum'], ['minimum']] } }] },
    edges: ['LeetCode example → current 5, maximum 10, then 5 after the correction, minimum 2.', 'Out-of-order timestamps → current() is the largest timestamp\'s price.', 'Correcting to the same price → nothing goes stale.'],
  },

  'design-a-number-container-system': {
    aha: 'Two maps that mirror each other: index → number, and number → sorted set of indexes holding it. change(i, x) moves i out of its old number\'s set and into x\'s set; find(x) reads the smallest index of x\'s set. With a TreeSet, both are O(log n).',
    asks: {
      read: 'What does change do to the number previously in that container?',
      budget: '10⁵ calls. Can find scan every container?',
      observe: 'Containers 1, 2, 3, 5 hold 10; then container 1 changes to 20. What is find(10)?',
      brute: 'Scanning all containers for the number: what does it cost?',
      pattern: 'Which structure keeps a changing set of indexes sorted?',
      watch: 'Watch each change move an index between two sorted sets.',
    },
    read: [
      { phrase: 'replacing whatever number was there', says: 'Remove the index from the old number\'s set first.' },
      { phrase: 'return the smallest index whose container holds `number`', says: 'Per number, a sorted set of indexes: take the first.' },
    ],
    budget: { from: '≤ 10⁵ calls', rows: [['scan per find', 'O(n)', 'bad', 'slow'], ['number → TreeSet', 'O(log n)', 'ok', 'the design']], aim: 'O(log n) per call', note: 'A min-heap per number with lazy deletion also works.' },
    observe: [
      {
        title: 'A sorted set per number',
        text: 'After change(2, 10), change(1, 10), change(3, 10), change(5, 10): 10\'s set is {1, 2, 3, 5}, so find(10) = 1.',
        sketch: { kind: 'array', rows: [{ label: '10 →', items: [1, 2, 3, 5], marks: { 0: 'hit' } }] },
      },
      {
        title: 'A change moves the index',
        text: 'change(1, 20) removes 1 from 10\'s set and adds it to 20\'s: find(10) = 2.',
        sketch: { kind: 'array', rows: [{ label: '10 →', items: [2, 3, 5], marks: { 0: 'hit' } }, { label: '20 →', items: [1] }] },
      },
    ],
    brute: { idea: 'Keep index → number only, and scan every index for find.', cost: 'O(n) per find', waste: 'Every find rescans containers holding other numbers.' },
    pattern: {
      pick: 'design-data-structures',
      why: 'at: index → number; where: number → TreeSet of indexes. change: remove i from where[at[i]], set at[i] = x, add i to where[x]. find: where[x].first() or −1. O(log n).',
      not: [notHash('A single map answers "what is at i", not "smallest i holding x".'), notHeap('A heap per number needs lazy deletion of moved indexes; the TreeSet removes directly.')],
    },
    watch: { viz: 'DesignWalkViz', inputs: [{ label: 'LeetCode example', input: { mode: 'containers', ops: ops(['find', 10], ['change', 2, 10], ['change', 1, 10], ['change', 3, 10], ['change', 5, 10], ['find', 10], ['change', 1, 20], ['find', 10]) } }, { label: 'overwrite to the same number', input: { mode: 'containers', ops: ops(['change', 4, 7], ['change', 4, 7], ['find', 7], ['change', 4, 8], ['find', 7]) } }] },
    edges: ['find before any change → −1.', 'LeetCode example → −1, 1, 2.', 'The last container of a number changes → find returns −1.'],
  },

  'design-a-food-rating-system': {
    aha: 'For each cuisine keep its foods in a sorted set ordered by rating (high first), then name (A to Z), which is exactly the tie rule. A rating change is remove, update, re-insert: O(log n). The highest-rated is the first entry. (A heap with lazy deletion also works.)',
    asks: {
      read: 'How are ties between equal ratings broken?',
      budget: '2 × 10⁴ foods and calls. Can highestRated scan the cuisine?',
      observe: 'Japanese foods: miso 12, sushi 8, ramen 14. Change sushi to 16, then ramen to 16. What does highestRated return each time?',
      brute: 'Scanning all foods of the cuisine: what does it cost?',
      pattern: 'Which structure stays sorted while elements change?',
      watch: 'Watch each change reposition a food inside its cuisine\'s sorted set.',
    },
    read: [
      { phrase: 'On a tie, return the lexicographically smaller name', says: 'Order by (−rating, name).' },
      { phrase: 'changes the rating of `food`', says: 'Remove with the old key, re-insert with the new one.' },
    ],
    budget: { from: '≤ 2 × 10⁴ foods and calls', rows: [['scan the cuisine', 'O(n) per query', 'bad', 'slow'], ['TreeSet per cuisine', 'O(log n)', 'ok', 'the design']], aim: 'O(log n) per call', note: 'The comparator must include the name, or equal ratings collide in the set.' },
    observe: [
      {
        title: 'Sorted by rating, then name',
        text: 'Japanese: ramen 14, miso 12, sushi 8. highestRated → ramen.',
        sketch: { kind: 'array', rows: [{ label: 'japanese', items: ['ramen 14', 'miso 12', 'sushi 8'], marks: { 0: 'hit' } }] },
      },
      {
        title: 'Ties go to the smaller name',
        text: 'Change sushi and ramen to 16: both lead, and "ramen" < "sushi".',
        sketch: { kind: 'array', rows: [{ label: 'japanese', items: ['ramen 16', 'sushi 16', 'miso 12'], marks: { 0: 'hit' } }] },
      },
    ],
    brute: { idea: 'For highestRated, scan every food of the cuisine and keep the best by (rating, name).', cost: 'O(n) per query', waste: 'The order barely changes between calls, yet it is rebuilt each time.' },
    pattern: {
      pick: 'design-data-structures',
      why: 'food → (cuisine, rating); cuisine → TreeSet ordered by (−rating, name). changeRating: remove, update, add. highestRated: first(). O(log n).',
      not: [notHeap('A max-heap per cuisine needs lazy deletion of old ratings.'), notHash('Maps alone can\'t order foods by rating.')],
    },
    watch: { viz: 'DesignWalkViz', inputs: [{ label: 'LeetCode example', input: { mode: 'food', foods: ['kimchi', 'miso', 'sushi', 'moussaka', 'ramen', 'bulgogi'], cuisines: ['korean', 'japanese', 'japanese', 'greek', 'japanese', 'korean'], ratings: [9, 12, 8, 15, 14, 7], ops: ops(['highest', 'korean'], ['highest', 'japanese'], ['change', 'sushi', 16], ['highest', 'japanese'], ['change', 'ramen', 16], ['highest', 'japanese']) } }, { label: 'a drop in rating', input: { mode: 'food', foods: ['pho', 'banhmi'], cuisines: ['viet', 'viet'], ratings: [9, 7], ops: ops(['highest', 'viet'], ['change', 'pho', 5], ['highest', 'viet']) } }] },
    edges: ['LeetCode example → kimchi, ramen, sushi, ramen.', 'Equal ratings → the lexicographically smaller name.', 'A cuisine with one food → that food.'],
  },

  'exam-room': {
    aha: 'Only the gaps between neighbouring students matter. In a gap between a and b the best seat is the middle, at distance (b − a) / 2; the two ends of the row are special (distance to the first or last student). Check each gap and take the largest, the lowest seat on ties.',
    asks: {
      read: 'Where does the first student sit? How are ties broken?',
      budget: 'n up to 10⁹: can you scan every seat?',
      observe: 'n = 10, students at 0 and 9. Where does the next one sit, and the one after?',
      brute: 'Trying every empty seat: why is it impossible here?',
      pattern: 'What is the best seat inside one gap?',
      watch: 'Watch each seat() compare the gaps.',
    },
    read: [
      { phrase: 'maximises the distance to the closest other student', says: 'Only neighbouring students matter: look at gaps.' },
      { phrase: 'If several seats tie, they take the lowest-numbered one', says: 'Compare gaps from left to right and keep the first best.' },
      { phrase: 'If the room is empty, they sit at seat `0`', says: 'The edges of the row are special gaps.' },
    ],
    budget: { from: 'n ≤ 10⁹, ≤ 10⁴ calls', rows: [['every seat', '10⁹ per seat()', 'bad', 'impossible'], ['every gap (sorted set)', 'O(students)', 'ok', 'fine'], ['heap of gaps', 'O(log n)', 'ok', 'fastest']], aim: 'O(students) per seat with a sorted set', note: 'The heap of gaps needs lazy deletion when a student leaves.' },
    observe: [
      {
        title: 'The edges first',
        text: 'Empty room → 0. Then the farthest seat from 0 is the end, 9.',
        sketch: { kind: 'array', rows: [{ items: ['●', '·', '·', '·', '·', '·', '·', '·', '·', '●'], marks: { 0: 'hit', 9: 'hit' } }] },
      },
      {
        title: 'Then middles of gaps',
        text: 'Gap 0..9: middle 4 (distance 4). Next, gaps 0..4 and 4..9 both give distance 2; the lower seat, 2, wins.',
        sketch: { kind: 'array', rows: [{ items: ['●', '·', '●', '·', '●', '·', '·', '·', '·', '●'], marks: { 2: 'cur', 4: 'hit' } }] },
      },
    ],
    brute: { idea: 'For every empty seat compute its distance to the nearest student, and take the best.', cost: 'O(n · students) per seat', waste: 'Seats inside a gap are dominated by its middle; only one candidate per gap matters.' },
    pattern: {
      pick: 'design-data-structures',
      why: 'TreeSet of taken seats. seat(): candidate 0 (distance first), each gap\'s middle a + (b − a) / 2 (distance (b − a) / 2), and n − 1 (distance n − 1 − last); take the best, lowest on ties. leave: remove.',
      not: [notHeap('A heap of gaps is faster but must handle merged gaps after leave().'), { id: 'intervals', why: 'Gaps are intervals, but they only need comparing, not merging or sorting.' }],
    },
    watch: { viz: 'DesignWalkViz', inputs: [{ label: 'LeetCode example', input: { mode: 'exam', n: 10, ops: ops(['seat'], ['seat'], ['seat'], ['seat'], ['leave', 4], ['seat']) } }, { label: 'n = 5', input: { mode: 'exam', n: 5, ops: ops(['seat'], ['seat'], ['seat'], ['leave', 0], ['seat']) } }] },
    edges: ['LeetCode example → 0, 9, 4, 2, then 5 after 4 leaves.', 'n = 1 → 0.', 'A student at 0 leaves → seat 0 becomes a candidate again.'],
  },

  'number-of-recent-calls': {
    aha: 'Ping times only increase, so a request that is too old for this ping is too old for every later one. Keep the recent times in a queue: add at the back, drop expired times from the front, and return the size.',
    asks: {
      read: 'Which range counts, and are times sorted?',
      budget: '10⁴ pings. Can each ping recount every earlier request?',
      observe: 'Pings 1, 100, 3001, 3002: which requests count for 3002?',
      brute: 'Counting all earlier pings in the window each time: what does it cost?',
      pattern: 'Once a request falls out of the window, can it come back?',
      watch: 'Watch old pings fall off the front of the queue.',
    },
    read: [
      { phrase: 'in the inclusive range `[t − 3000, t]`', says: 'A sliding time window.' },
      { phrase: 'Every call to `ping` uses a strictly larger `t` than the call before it', says: 'Expired requests never come back: drop them from the front.' },
    ],
    budget: { from: '≤ 10⁴ pings', rows: [['recount every ping', 'n² = 10⁸', 'bad', 'slow'], ['queue', 'O(1) amortized', 'ok', 'each time in and out once']], aim: 'O(1) amortized per ping', note: 'At most 3001 times can be in the window.' },
    observe: [
      {
        title: 'The window slides',
        text: 'ping(3002): the window is [2, 3002]. 1 is too old; 100, 3001 and 3002 count: 3.',
        sketch: { kind: 'array', rows: [{ items: [1, 100, 3001, 3002], marks: { 0: 'bad', 1: 'hit', 2: 'hit', 3: 'hit' } }] },
      },
      {
        title: 'Once out, out for good',
        text: 'Every later ping has a later window start, so 1 never counts again: removing it is safe.',
        sketch: { kind: 'array', rows: [{ items: ['1 out', 'window →'], marks: { 0: 'dim' } }] },
      },
    ],
    brute: { idea: 'Keep every ping and count those in the window on each call.', cost: 'O(n) per ping', waste: 'Old pings are rechecked forever after they expire.' },
    pattern: {
      pick: 'design-data-structures',
      why: 'q.add(t); while (q.peek() < t − 3000) q.poll(); return q.size(). O(1) amortized.',
      not: [{ id: 'sliding-window', why: 'It is a sliding window over time; the queue is how the window is stored between calls.' }, { id: 'binary-search', why: 'Binary search over a list of times works too, but the list keeps growing.' }],
    },
    watch: { viz: 'DesignWalkViz', inputs: [{ label: 'LeetCode example', input: { mode: 'recent', ops: ops(['ping', 1], ['ping', 100], ['ping', 3001], ['ping', 3002]) } }, { label: 'a long gap', input: { mode: 'recent', ops: ops(['ping', 1], ['ping', 2], ['ping', 9000], ['ping', 9001]) } }] },
    edges: ['LeetCode example → 1, 2, 3, 3.', 'A long gap → everything earlier expires: 1.', 'Exactly 3000 apart → still counts (inclusive).'],
  },

  'time-needed-to-buy-tickets': {
    aha: 'Simulating the line is O(n · max tickets). Count instead: everyone buys one ticket per round, and person k needs tickets[k] rounds. People in front of k (and k) buy min(tickets[i], tickets[k]); people behind k buy min(tickets[i], tickets[k] − 1), because k finishes before their turn in the last round.',
    asks: {
      read: 'What happens when someone still needs tickets after buying one?',
      budget: 'n ≤ 100, tickets ≤ 100. Simulation is fine here. What does a formula give?',
      observe: 'For [2, 3, 2] and k = 2, how many tickets does each person buy before k is done?',
      brute: 'Simulating the queue second by second: what does it cost?',
      pattern: 'Who buys in k\'s last round, and who doesn\'t?',
      watch: 'Watch each person\'s share of the waiting time.',
    },
    read: [
      { phrase: 'they go to the back of the line (instantly) if they still need more tickets', says: 'Rounds: everyone still waiting buys one ticket per round.' },
      { phrase: 'until the person at position `k` has bought all their tickets', says: 'Count only up to the moment k finishes.' },
    ],
    budget: { from: 'n, tickets ≤ 100', rows: [['simulate the queue', 'n × max = 10⁴', 'ok', 'fine'], ['one formula per person', 'n', 'ok', 'cleaner']], aim: 'O(n)', note: 'The formula is the interview answer; the simulation is the check.' },
    observe: [
      {
        title: 'In front of k',
        text: '[2, 3, 2], k = 2: persons 0 and 1 stand ahead, so they buy in each of k\'s 2 rounds, capped by their own needs: 2 and 2.',
        sketch: { kind: 'array', rows: [{ items: [2, 3, 2], tags: { 0: [['2', 'success']], 1: [['2', 'success']], 2: [['k: 2', 'accent']] } }], caption: '2 + 2 + 2 = 6' },
      },
      {
        title: 'Behind k',
        text: 'With [5, 1, 1, 1] and k = 0, people behind k buy only in the first round: min(1, 4) each. 5 + 1 + 1 + 1 = 8.',
        sketch: { kind: 'array', rows: [{ items: [5, 1, 1, 1], tags: { 0: [['5', 'accent']], 1: [['1', 'success']], 2: [['1', 'success']], 3: [['1', 'success']] } }], caption: '8' },
      },
    ],
    brute: { idea: 'Simulate the queue one second at a time until person k has all their tickets.', cost: 'O(n · tickets[k])', waste: 'Each person\'s total number of turns can be counted directly.' },
    pattern: {
      pick: 'design-data-structures',
      why: 'time = Σ over i ≤ k of min(t[i], t[k]) + Σ over i > k of min(t[i], t[k] − 1). O(n).',
      not: [{ id: 'math-for-interviews', why: 'The formula is simple arithmetic; the insight is about rounds of the queue.' }, { id: 'sliding-window', why: 'Nothing slides: each person is counted once.' }],
    },
    watch: { viz: 'DesignWalkViz', inputs: [{ label: '[2, 3, 2], k = 2', input: { mode: 'tickets', tickets: [2, 3, 2], k: 2 } }, { label: '[5, 1, 1, 1], k = 0', input: { mode: 'tickets', tickets: [5, 1, 1, 1], k: 0 } }] },
    edges: ['[2, 3, 2], k = 2 → 6.', '[5, 1, 1, 1], k = 0 → 8.', 'One person: [4], k = 0 → 4.'],
  },

  'number-of-students-unable-to-eat-lunch': {
    aha: 'The queue keeps rotating, so a student who wants the top sandwich reaches the front eventually: the order of the students doesn\'t matter, only how many want each kind. Walk down the sandwich stack decrementing the matching count; stop at the first sandwich nobody left wants.',
    asks: {
      read: 'When does the process stop?',
      budget: '100 students. Simulating rotations is fine. What does counting give?',
      observe: 'If the top sandwich is square and every remaining student wants circular, what happens?',
      brute: 'Simulating the queue until it gets stuck: how do you detect "stuck"?',
      pattern: 'Does the order of the students ever matter?',
      watch: 'Watch the two counters and the sandwich stack.',
    },
    read: [
      { phrase: 'otherwise they go to the end of the queue', says: 'Rotation: whoever wants the top sandwich gets it eventually.' },
      { phrase: 'This stops when no student in the queue wants the top sandwich', says: 'Only counts per type matter.' },
    ],
    budget: { from: 'n ≤ 100', rows: [['simulate rotations', 'O(n²)', 'ok', 'fine'], ['two counters', 'O(n)', 'ok', 'cleaner']], aim: 'O(n)', note: 'No queue needed at all.' },
    observe: [
      {
        title: 'Counts are enough',
        text: 'Students [1, 1, 1, 0, 0, 1]: 2 want ● (0), 4 want ■ (1). Sandwiches 1, 0, 0, 0: ■ taken (3 left), ● taken (1 left), ● taken (0 left), then ● again: nobody wants it.',
        sketch: { kind: 'array', rows: [{ label: 'sandwiches', items: ['■', '●', '●', '●', '■', '■'], marks: { 3: 'bad', 4: 'dim', 5: 'dim' } }], caption: '3 students can\'t eat' },
      },
      {
        title: 'Stuck means stuck forever',
        text: 'If nobody wants the top sandwich, rotating changes nothing, and the sandwiches below can never be reached.',
        sketch: { kind: 'array', rows: [{ items: ['top: ●', 'want ●: 0'], marks: { 1: 'bad' } }] },
      },
    ],
    brute: { idea: 'Simulate the queue; stop after a full rotation with no sandwich taken.', cost: 'O(n²)', waste: 'Rotations only reorder students, and order is irrelevant.' },
    pattern: {
      pick: 'design-data-structures',
      why: 'count[0], count[1] from students. For each sandwich s from the top: if count[s] == 0 return count[0] + count[1]; else count[s]--. Return 0. O(n).',
      not: [{ id: 'greedy', why: 'No choice is made; the counts follow from the rules.' }, notStack('The sandwich stack is just walked from the top; no stack operations are needed.')],
    },
    watch: { viz: 'DesignWalkViz', inputs: [{ label: 'LeetCode example 2', input: { mode: 'lunch', students: [1, 1, 1, 0, 0, 1], sandwiches: [1, 0, 0, 0, 1, 1] } }, { label: 'everyone eats', input: { mode: 'lunch', students: [1, 1, 0, 0], sandwiches: [0, 1, 0, 1] } }] },
    edges: ['[1, 1, 0, 0], [0, 1, 0, 1] → 0.', '[1, 1, 1, 0, 0, 1], [1, 0, 0, 0, 1, 1] → 3.', 'Everyone wants ■ but the top is ● → all of them.'],
  },

  'number-of-people-aware-of-a-secret': {
    aha: 'Track people by the day they learned the secret, not one by one. Someone who learned on day j shares on days j + delay … j + forget − 1. So the number of new people on day d is the total of learn[j] for j in (d − forget, d − delay]. At the end, the people who still remember learned in the last forget days.',
    asks: {
      read: 'When does a person start and stop sharing?',
      budget: 'n ≤ 1000, but the number of people explodes. Can you track people individually?',
      observe: 'n = 6, delay 2, forget 4: who shares on day 4?',
      brute: 'Simulating every person: what goes wrong?',
      pattern: 'What do all the people who learned on the same day have in common?',
      watch: 'Watch each day\'s new people come from a window of earlier days.',
    },
    read: [
      { phrase: 'starting `delay` days after the day they discovered it', says: 'Sharing starts at j + delay.' },
      { phrase: 'forgets the secret `forget` days after discovering it, and cannot share it on that day or any later day', says: 'Sharing stops before j + forget: a window.' },
      { phrase: 'return it modulo `10⁹ + 7`', says: 'Counts grow exponentially: work with counts per day, mod p.' },
    ],
    budget: { from: 'n ≤ 1000', rows: [['simulate people', 'exponential', 'bad', 'impossible'], ['count per day', 'n × forget', 'ok', '10⁶'], ['running window sum', 'n', 'ok', 'O(n)']], aim: 'O(n · forget) or O(n)', note: 'A queue of (day, count) keeps the window sum.' },
    observe: [
      {
        title: 'People who learned the same day act together',
        text: 'learn[1] = 1. They share on days 3 and 4 (delay 2, forget 4).',
        sketch: { kind: 'array', rows: [{ label: 'new', items: [1, 0, 1, 1, 1, 2], marks: { 0: 'hit' } }], caption: 'days 1..6' },
      },
      {
        title: 'A window of sharers',
        text: 'Day 5: people from days 2..3 share (learned at least 2 days ago, less than 4): 0 + 1 = 1 new.',
        sketch: { kind: 'array', rows: [{ items: [1, 0, 1, 1, '?'], marks: { 1: 'cur', 2: 'cur', 4: 'hit' } }] },
      },
    ],
    brute: { idea: 'Keep a list of every person with the day they learned, and simulate each day.', cost: 'O(2ⁿ) people', waste: 'People who learned on the same day behave identically; one count per day is enough.' },
    pattern: {
      pick: 'design-data-structures',
      why: 'learn[1] = 1; learn[d] = Σ learn[j] for d − forget < j ≤ d − delay; answer Σ learn[j] for j > n − forget, all mod 10⁹ + 7.',
      not: [{ id: 'dp-linear', why: 'It is a 1-D recurrence over days; the "design" is choosing counts per day as the state.' }, { id: 'sliding-window', why: 'A running window sum makes it O(n); that is an optimisation on top.' }],
    },
    watch: { viz: 'DesignWalkViz', inputs: [{ label: 'n = 6, delay 2, forget 4', input: { mode: 'secret', n: 6, delay: 2, forget: 4 } }, { label: 'n = 4, delay 1, forget 3', input: { mode: 'secret', n: 4, delay: 1, forget: 3 } }] },
    edges: ['n = 6, delay 2, forget 4 → 5.', 'n = 4, delay 1, forget 3 → 6.', 'n = 1 → 1.'],
  },

  'design-front-middle-back-queue': {
    aha: 'Split the queue into a front half and a back half (two deques), keeping the back half equal in size or one longer. The front and back are the outer ends; the middle is always at the seam. After each push or pop, move at most one element across the seam to rebalance.',
    asks: {
      read: 'Which middle is used when there are two?',
      budget: '1000 calls. Is inserting into the middle of an array acceptable? Is there an O(1) way?',
      observe: 'Push 1, 2, 3, 4, 5, then pushMiddle 6. Where does it go?',
      brute: 'An array with insert / remove at index n / 2: what does it cost?',
      pattern: 'If the queue is split in two halves, where is the middle?',
      watch: 'Watch the two halves rebalance at the seam.',
    },
    read: [
      { phrase: 'When there are two middle positions, use the one closer to the front', says: 'Decide which half the middle belongs to, and keep the sizes accordingly.' },
      { phrase: 'pushing `6` into the middle of `[1, 2, 3, 4, 5]` gives `[1, 2, 6, 3, 4, 5]`', says: 'pushMiddle inserts at index n / 2.' },
      { phrase: 'popping the middle of `[1, 2, 3, 4, 5, 6]` returns `3`', says: 'popMiddle removes index (n − 1) / 2.' },
    ],
    budget: { from: '≤ 1000 calls', rows: [['array insert / remove', 'O(n) per middle op', 'ok', 'fine here'], ['two deques', 'O(1) per op', 'ok', 'the design']], aim: 'O(1) per call', note: 'Pick one balance rule and stick to it.' },
    observe: [
      {
        title: 'The middle is at the seam',
        text: '[1, 2 | 3, 4, 5]: the back half is one longer. pushMiddle 6 goes to the front of the back half: [1, 2 | 6, 3, 4, 5], then rebalance: [1, 2, 6 | 3, 4, 5].',
        sketch: { kind: 'array', rows: [{ items: [1, 2, 6, '|', 3, 4, 5], marks: { 2: 'hit', 3: 'dim' } }] },
      },
      {
        title: 'popMiddle on an even size',
        text: '[1, 2, 3 | 4, 5, 6]: the front-side middle is the end of the front half: 3.',
        sketch: { kind: 'array', rows: [{ items: [1, 2, 3, '|', 4, 5, 6], marks: { 2: 'hit', 3: 'dim' } }] },
      },
    ],
    brute: { idea: 'Use one array and insert or remove at index n / 2 for the middle operations.', cost: 'O(n) per middle operation', waste: 'Shifting half the elements, when splitting into halves puts the middle at an end.' },
    pattern: {
      pick: 'design-data-structures',
      why: 'Deques L and R with |R| − |L| ∈ {0, 1}. pushMiddle: |L| == |R| ? R.addFirst : L.addLast; popMiddle: |L| == |R| ? L.pollLast : R.pollFirst; rebalance after every op. O(1).',
      not: [{ id: 'linked-list-manipulation', why: 'A doubly linked list with a middle pointer also works, but moving the pointer is fiddly.' }, { id: 'two-pointers', why: 'The halves are not pointers into one array; they are two separate deques.' }],
    },
    watch: { viz: 'DesignWalkViz', inputs: [{ label: 'LeetCode example', input: { mode: 'fmb', ops: ops(['pushFront', 1], ['pushBack', 2], ['pushMiddle', 3], ['pushMiddle', 4], ['popFront'], ['popMiddle'], ['popMiddle'], ['popBack'], ['popFront']) } }, { label: 'the statement\'s example', input: { mode: 'fmb', ops: ops(['pushBack', 1], ['pushBack', 2], ['pushBack', 3], ['pushBack', 4], ['pushBack', 5], ['pushMiddle', 6], ['popMiddle'], ['popMiddle']) } }] },
    edges: ['LeetCode example → 1, 3, 4, 2, −1.', 'pop on an empty queue → −1.', 'pushMiddle on an empty queue → it becomes the only element.'],
  },

  'design-most-recently-used-queue': {
    aha: 'The simple design is a list: find the k-th element, remove it, append it at the end. That is O(n) per fetch, fine for n ≤ 2000. Faster designs split the list into √n blocks, or give every fetched element a fresh slot at the end and use a Fenwick tree to find the k-th live slot in O(log n).',
    asks: {
      read: 'What does fetch(k) move, and where to?',
      budget: 'n ≤ 2000 and 2000 calls. Is O(n) per fetch acceptable? What is the follow-up?',
      observe: 'Queue [1..8], fetch(3), then fetch(5). What is returned?',
      brute: 'Removing from the middle of an array: what does it cost?',
      pattern: 'How could you find the k-th remaining element without shifting?',
      watch: 'Watch the fetched element move to the end.',
    },
    read: [
      { phrase: 'moves the `k`-th element (1-indexed) to the end of the queue and returns it', says: 'Find by rank, then remove and append.' },
      { phrase: 'creates the queue `[1, 2, 3, …, n]`', says: 'Initial order is known; only fetches change it.' },
    ],
    budget: { from: 'n, calls ≤ 2000', rows: [['list remove + append', 'O(n) per fetch', 'ok', '4 × 10⁶, fine'], ['√n blocks', 'O(√n)', 'ok', 'follow-up'], ['Fenwick tree over slots', 'O(log n)', 'ok', 'follow-up']], aim: 'O(n) simple, O(log n) with a Fenwick tree', note: 'Say the simple version first, then offer the faster one.' },
    observe: [
      {
        title: 'Move the k-th to the end',
        text: '[1, 2, 3, 4, 5, 6, 7, 8], fetch(3) → 3: [1, 2, 4, 5, 6, 7, 8, 3].',
        sketch: { kind: 'array', rows: [{ items: [1, 2, 4, 5, 6, 7, 8, 3], marks: { 7: 'hit' } }] },
      },
      {
        title: 'Positions shift',
        text: 'Now fetch(5) is 6, not 5: everything after the moved element shifted left by one.',
        sketch: { kind: 'array', rows: [{ items: [1, 2, 4, 5, 6, 7, 8, 3], marks: { 4: 'cur' } }], caption: '5th element: 6' },
      },
    ],
    brute: { idea: 'Keep the queue in an array; remove the k-th element and append it.', cost: 'O(n) per fetch', waste: 'Shifting the tail on every fetch; fine at this size, but the follow-up asks for better.' },
    pattern: {
      pick: 'design-data-structures',
      why: 'Simple: ArrayList remove(k − 1) + add. Follow-up: slots 1..n + calls; Fenwick tree marks live slots; fetch finds the k-th live slot by binary lifting, clears it, writes the value at the next fresh slot.',
      not: [{ id: 'range-queries', why: 'The Fenwick tree version is a range-count structure; the simple list is the expected first answer.' }, { id: 'linked-list-manipulation', why: 'A linked list moves in O(1) but still needs O(n) to find the k-th node.' }],
    },
    watch: { viz: 'DesignWalkViz', inputs: [{ label: 'LeetCode example', input: { mode: 'mru', n: 8, ops: ops(['fetch', 3], ['fetch', 5], ['fetch', 2], ['fetch', 8]) } }, { label: 'fetch the last', input: { mode: 'mru', n: 4, ops: ops(['fetch', 4], ['fetch', 1], ['fetch', 4]) } }] },
    edges: ['LeetCode example → 3, 6, 2, 2.', 'fetch(n) → the last element stays last.', 'n = 1 → fetch(1) always returns 1.'],
  },

  'design-ride-sharing-system': {
    aha: 'Two waiting lines, matched front to front. Riders can cancel from the middle of their line, so a plain queue isn\'t enough: an insertion-ordered set (LinkedHashSet) keeps arrival order and removes any id in O(1). (Or a queue plus a "cancelled" set, skipping cancelled riders when they reach the front.)',
    asks: {
      read: 'Who gets matched, and what does cancelling a matched rider do?',
      budget: 'Can cancelRider search the whole line?',
      observe: 'Riders 3 then 1, driver 2: who is matched? Then rider 3 cancels: what happens?',
      brute: 'Two lists with search on cancel: what does it cost?',
      pattern: 'Which structure keeps arrival order and deletes from the middle cheaply?',
      watch: 'Watch the two lines match at the front and cancels leave from the middle.',
    },
    read: [
      { phrase: 'matches the driver who has waited longest with the rider who has waited longest', says: 'Two FIFO lines, matched at the front.' },
      { phrase: 'removes the rider if they are still waiting; otherwise it does nothing', says: 'Cancel from anywhere, or ignore it: an ordered set (or a lazy cancelled set).' },
    ],
    budget: { from: '≤ 10⁵ calls', rows: [['lists with search', 'O(n) per cancel', 'bad', 'slow'], ['LinkedHashSet', 'O(1) per call', 'ok', 'the design']], aim: 'O(1) per call', note: 'The lazy version: a queue and a set of cancelled ids, skipped at match time.' },
    observe: [
      {
        title: 'Front to front',
        text: 'Riders [3, 1], drivers [2]: match pairs driver 2 with rider 3, the longest waiting.',
        sketch: { kind: 'array', rows: [{ label: 'riders', items: [3, 1], marks: { 0: 'hit' } }, { label: 'drivers', items: [2], marks: { 0: 'hit' } }], caption: '[2, 3]' },
      },
      {
        title: 'Cancelling a matched rider does nothing',
        text: 'After the match, cancel(3) finds no waiting rider 3: nothing changes.',
        sketch: { kind: 'array', rows: [{ label: 'riders', items: [1] }] },
      },
    ],
    brute: { idea: 'Keep riders and drivers in arrays; cancel searches and splices.', cost: 'O(n) per cancel', waste: 'Each cancel scans the line for one id a hash could find directly.' },
    pattern: {
      pick: 'design-data-structures',
      why: 'riders, drivers: LinkedHashSet. addX: add. match: if both non-empty, remove the first of each. cancel(r): riders.remove(r). O(1).',
      not: [{ id: 'hashing', why: 'A hash set alone forgets arrival order; the linked version keeps it.' }, { id: 'heap-patterns', why: 'Arrival order is already sorted; no priority is needed.' }],
    },
    watch: { viz: 'DesignWalkViz', inputs: [{ label: 'match and cancel', input: { mode: 'rides', ops: ops(['addRider', 3], ['addDriver', 2], ['addRider', 1], ['match'], ['addDriver', 5], ['cancel', 3], ['match'], ['match']) } }, { label: 'cancel while waiting', input: { mode: 'rides', ops: ops(['addRider', 1], ['addRider', 2], ['cancel', 1], ['addDriver', 9], ['match']) } }] },
    edges: ['No driver waiting → [−1, −1].', 'Cancel a waiting rider → they are never matched.', 'Cancel an already-matched rider → nothing happens.'],
  },

  'design-bounded-blocking-queue': {
    aha: 'A queue guarded by one lock. A producer that finds it full waits on a "notFull" condition; a consumer that finds it empty waits on "notEmpty". Each successful operation signals the other side. Always re-check the condition in a while loop after waking, because another thread may have taken the slot first.',
    asks: {
      read: 'What should enqueue do when the queue is full?',
      budget: 'Why is busy-waiting (spinning in a loop) a bad way to wait?',
      observe: 'Capacity 2: enqueue 1, 2, then a third enqueue. What happens to that thread?',
      brute: 'Spinning until there is room: what does it cost?',
      pattern: 'Which tools let a thread sleep until a condition may have changed?',
      watch: 'Watch the buffer fill and empty, with the signal each call sends.',
    },
    read: [
      { phrase: 'if the queue is full, the calling thread waits until there is room', says: 'A condition variable for "not full".' },
      { phrase: 'if the queue is empty, the calling thread waits until there is an element', says: 'A second condition for "not empty".' },
      { phrase: 'Don\'t use a built-in blocking queue', says: 'Build it from a lock, two conditions and a plain queue.' },
    ],
    budget: { from: 'many threads', rows: [['spin while full / empty', 'burns CPU', 'bad', 'wasteful'], ['lock + two conditions', 'sleeps until signalled', 'ok', 'the design']], aim: 'O(1) per operation, no busy waiting', note: 'Semaphores (empty slots, filled slots) are the classic alternative.' },
    observe: [
      {
        title: 'Full means wait',
        text: 'With capacity 2 holding [1, 2], a third enqueue waits on notFull until a dequeue signals it.',
        sketch: { kind: 'array', rows: [{ label: 'buffer', items: [1, 2], marks: { 0: 'hit', 1: 'hit' } }], caption: 'full: producers wait' },
      },
      {
        title: 'Re-check after waking',
        text: 'Two producers can be woken; only one gets the free slot. A while loop sends the other back to waiting instead of overfilling the queue.',
        sketch: { kind: 'array', rows: [{ items: ['while (size == cap)', 'await()'], marks: { 0: 'cur' } }] },
      },
    ],
    brute: { idea: 'Loop until the queue has room (or an element), checking repeatedly.', cost: 'O(waiting time) of busy CPU', waste: 'Spinning threads do no work; condition variables let them sleep until signalled.' },
    pattern: {
      pick: 'design-data-structures',
      why: 'ReentrantLock with conditions notFull and notEmpty. enqueue: lock; while full await notFull; add; signal notEmpty. dequeue: lock; while empty await notEmpty; remove; signal notFull. size under the lock.',
      not: [{ id: 'stack-patterns', why: 'The storage is a plain queue; the design is the waiting.' }, { id: 'heap-patterns', why: 'Order is first-in first-out; no priority.' }],
    },
    watch: { viz: 'DesignWalkViz', inputs: [{ label: 'capacity 2', input: { mode: 'blocking', cap: 2, ops: ops(['enqueue', 1], ['dequeue'], ['enqueue', 0], ['enqueue', 2], ['size'], ['dequeue'], ['enqueue', 3], ['size']) } }, { label: 'capacity 1', input: { mode: 'blocking', cap: 1, ops: ops(['enqueue', 5], ['size'], ['dequeue'], ['size']) } }] },
    edges: ['Capacity 2 example → 1, then size 2, 0, then size 2.', 'dequeue on an empty queue → the thread waits (never called in these tests).', 'enqueue on a full queue → the thread waits until a dequeue.'],
  },
};
