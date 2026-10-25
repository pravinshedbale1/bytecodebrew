export default {
  'implement-queue-using-stacks': {
    explain: 'After pushing 1 and then 2, the front of the queue is 1: `peek` returns 1 and `pop` removes and returns 1. One element (2) is left, so `empty` is `false`. Output: `[null,null,null,1,1,false]`.',
  },
  'design-hashmap': {
    explain: 'After `put(1,1)` and `put(2,2)`, `get(1)` is 1 and `get(3)` is -1 (missing). `put(2,1)` overwrites key 2, so `get(2)` is 1; after `remove(2)` it is -1 again. Output: `[null,null,null,1,-1,null,1,null,-1]`.',
  },
  'min-stack': {
    explain: 'After pushing -2, 0 and -3 the minimum is -3. `pop` removes -3, so the top is 0 and the minimum goes back to -2. Output: `[null,null,null,null,-3,null,0,-2]`.',
  },
  'lru-cache': {
    explain: 'Capacity 2. `get(1)` makes key 1 recently used, so `put(3,3)` evicts key 2 and `get(2)` is -1. `put(4,4)` then evicts key 1, the least recently used, so `get(1)` is -1 while 3 and 4 are found. Output: `[null,null,null,1,null,-1,null,-1,3,4]`.',
  },
  'insert-delete-getrandom-o1': {
    explain: '`insert(1)` adds 1 (`true`), `remove(2)` fails because 2 is absent (`false`), `insert(2)` adds it (`true`). `getRandom` returns 1 or 2 with equal chance (2 here). After `remove(1)` and a failed `insert(2)` (already present), only 2 is left, so `getRandom` must return 2. Output: `[null,true,false,true,2,true,false,2]`.',
  },
  'time-based-key-value-store': {
    explain: '"bar" is stored at time 1, so `get("foo", 1)` and `get("foo", 3)` both return "bar" (the latest value at or before the asked time). After "bar2" is stored at time 4, `get` at 4 and 5 return "bar2". Output: `[null,null,"bar","bar",null,"bar2","bar2"]`.',
  },
  'peeking-iterator': {
    explain: 'Over `[1,2,3]`: `next` returns 1, `peek` shows 2 without consuming it, so the next `next` still returns 2, then 3. Nothing is left, so `hasNext` is `false`. Output: `[null,1,2,2,3,false]`.',
  },
  'flatten-nested-list-iterator': {
    explain: 'Reading the nested list from left to right and stepping into each inner list gives 1, 1, then 2, then 1, 1. Calling `next` until `hasNext` is false therefore returns `[1,1,2,1,1]`.',
  },
  'snapshot-array': {
    explain: 'Index 0 is set to 5, then `snap` takes snapshot 0 (returns 0). Setting index 0 to 6 afterwards doesn\'t change the snapshot, so `get(0, 0)` returns 5. Output: `[null,null,0,null,5]`.',
  },
  'design-twitter': {
    explain: 'User 1 posts tweet 5, so their feed is `[5]`. After following user 2, who posts tweet 6, the feed shows both, newest first: `[6,5]`. After unfollowing, it is `[5]` again. Output: `[null,null,[5],null,null,[6,5],null,[5]]`.',
  },
  'lfu-cache': {
    explain: 'Capacity 2. `get(1)` raises key 1 to 2 uses, so `put(3,3)` evicts key 2 (used least) and `get(2)` is -1. `get(3)` raises key 3 to 2 uses too; `put(4,4)` breaks the tie by evicting the least recently used of them, key 1. Output: `[null,null,null,1,null,-1,3,null,-1,3,4]`.',
  },
  'insert-delete-getrandom-o1-duplicates-allowed': {
    explain: 'Inserting 1 returns `true` (new), inserting it again returns `false` (already present, but now held twice), inserting 2 returns `true`. `getRandom` returns 1 with chance 2/3 (1 here). After removing one copy of 1, the values are 1 and 2 with equal chance (2 here). Output: `[null,true,false,true,1,true,2]`.',
  },
  'design-hashset': {
    explain: 'After adding 1 and 2, `contains(1)` is true and `contains(3)` is false. Adding 2 again changes nothing, so `contains(2)` is true; after `remove(2)` it is false. Output: `[null,null,null,true,false,null,true,null,false]`.',
  },
  'implement-stack-using-queues': {
    explain: 'After pushing 1 and 2, the top is 2. `pop` removes and returns 2, and 1 is still there, so `empty` is false. Output: `[null,null,null,2,2,false]`.',
  },
  'design-circular-queue': {
    explain: 'Capacity 3: enqueuing 1, 2 and 3 succeeds and 4 fails because the queue is full. The rear is 3 and `isFull` is true. `deQueue` removes 1, which frees a slot, so enqueuing 4 succeeds and becomes the new rear. Output: `[null,true,true,true,false,3,true,true,true,4]`.',
  },
  'detect-squares': {
    explain: 'With (3,10), (11,2) and (3,2) stored, the query (11,10) completes one square of side 8. (14,8) completes none. After a second copy of (11,2) is added, the same square can use either copy, so the last count is 2. Output: `[null,null,null,null,1,0,null,2]`.',
  },
  'maximum-frequency-stack': {
    explain: 'After the pushes, 5 appears three times and 7 twice. The first pop returns 5. Now 5 and 7 tie at two copies, and 7 was pushed more recently, so 7 comes next, then 5. Finally 5, 7 and 4 all appear once and 4 is nearest the top. Output: `[null,null,null,null,null,null,null,5,7,5,4]`.',
  },
};
