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
  'smallest-number-in-infinite-set': {
    explain: 'addBack(2) does nothing (2 is already in the set). The pops return 1, 2 and 3. addBack(1) puts 1 back, so the next pop returns 1, then 4 and 5: `[null, null, 1, 2, 3, null, 1, 4, 5]`.',
  },
  'seat-reservation-manager': {
    explain: 'Seats 1 and 2 are reserved, then 2 is freed. The next reserve takes the lowest free seat, 2 again, then 3, 4 and 5. Finally 5 is freed: `[null, 1, 2, null, 2, 3, 4, 5, null]`.',
  },
  'stock-price-fluctuation': {
    explain: 'After prices 10 (t1) and 5 (t2), current is 5 (t2 is latest) and maximum is 10. Correcting t1 to 3 makes the maximum 5. Adding 2 at t4 makes the minimum 2: `[null, null, null, 5, 10, null, 5, null, 2]`.',
  },
  'design-a-number-container-system': {
    explain: '10 isn\'t anywhere at first, so find(10) is −1. After 10 is placed at indexes 2, 1, 3 and 5, the smallest is 1. Index 1 then changes to 20, so the smallest index holding 10 becomes 2: `[null, -1, null, null, null, null, 1, null, 2]`.',
  },
  'design-a-food-rating-system': {
    explain: 'Korean: kimchi (9) beats bulgogi (7). Japanese: ramen (14) is highest. Sushi goes to 16 and wins. Ramen then also goes to 16: on a tie, "ramen" comes before "sushi" alphabetically, so ramen wins: `[null, "kimchi", "ramen", null, "sushi", null, "ramen"]`.',
  },
  'exam-room': {
    explain: 'The first student sits at 0 and the second at 9 (as far from 0 as possible). The third takes 4, the middle of 0 … 9 (distance 4, lowest on the tie with 5). The fourth takes 2. After 4 leaves, the widest gap is 2 … 9 and its middle is 5: `[null, 0, 9, 4, 2, null, 5]`.',
  },
  // ---- queue design and queue simulations
  'number-of-recent-calls': {
    explain: 'Ping 1: the window [−2999, 1] holds just 1. Ping 100: [−2900, 100] holds 1 and 100. Ping 3001: [1, 3001] still includes 1, so three. Ping 3002: [2, 3002] drops 1, leaving 100, 3001 and 3002. Output: `[null,1,2,3,3]`.',
  },
  'time-needed-to-buy-tickets': {
    explain: 'Person 2 needs 2 tickets, so two rounds: in each round persons 0, 1 and 2 each buy one. Persons 0 and 2 need only 2 and person 1 gets 2 of their 3 before person 2 is done: 2 + 2 + 2 = `6` seconds.',
  },
  'number-of-students-unable-to-eat-lunch': {
    explain: 'Two students want 0 and two want 1, and the sandwiches are 0, 1, 0, 1. Each sandwich, when it reaches the top, is wanted by someone still in the queue, so every student eats and the answer is `0`.',
  },
  'number-of-people-aware-of-a-secret': {
    explain: 'A learns on day 1, shares on days 3 and 4 (B learns on day 3, C on day 4) and forgets on day 5. B shares on days 5 and 6 (D and E learn); C starts sharing on day 6 (F learns). At the end of day 6, A has forgotten, and B, C, D, E and F know it: `5` people.',
  },
  'design-front-middle-back-queue': {
    explain: 'pushFront 1 → [1], pushBack 2 → [1, 2], pushMiddle 3 → [1, 3, 2], pushMiddle 4 → [1, 4, 3, 2]. popFront returns 1 → [4, 3, 2]; popMiddle returns 3 → [4, 2]; popMiddle (two middles, take the front one) returns 4 → [2]; popBack returns 2; popFront on the empty queue returns -1. Output: `[null,null,null,null,null,1,3,4,2,-1]`.',
  },
  'design-most-recently-used-queue': {
    explain: 'Start with [1..8]. fetch(3) moves 3 to the end: [1,2,4,5,6,7,8,3]. fetch(5) moves 6: [1,2,4,5,7,8,3,6]. fetch(2) moves 2: [1,4,5,7,8,3,6,2]. fetch(8) returns the last element, 2, and the queue is unchanged. Output: `[null,3,6,2,2]`.',
  },
  'design-ride-sharing-system': {
    explain: 'Riders 3 and 1 wait (in that order) and driver 2 waits. The first match pairs driver 2 with rider 3: [2, 3]. Driver 5 arrives; cancelling rider 3 does nothing because 3 is no longer waiting. The next match pairs driver 5 with rider 1: [5, 1], and then nobody is left: [-1, -1]. Output: `[null,null,null,null,[2,3],null,null,[5,1],[-1,-1]]`.',
  },
  'design-bounded-blocking-queue': {
    explain: 'Capacity 3. Enqueue 1 and dequeue it (returns 1). Enqueue 0, 2 and 3: the queue is [0, 2, 3], full, so size is 3. Dequeue returns the front, 0, and size drops to 2. Output: `[null,null,1,null,null,null,3,0,2]`.',
  },
};
