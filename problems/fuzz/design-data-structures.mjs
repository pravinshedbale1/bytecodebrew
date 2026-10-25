import { I32 } from './lib.mjs';

/**
 * A design test: `ctor` arguments, then `count` steps; each step(state) returns [op, args] or null to try again.
 */
function seq(g, cls, ctor, count, step) {
  const ops = [cls], args = [ctor];
  for (let i = 0, guard = 0; i < count && guard < count * 20; guard++) {
    const s = step();
    if (!s) continue;
    ops.push(s[0]); args.push(s[1]);
    i++;
  }
  return [ops, args];
}

/** keys drawn mostly from a small pool so operations collide */
const keyPool = (g, lo, hi) => { const pool = g.ints(g.int(1, 6), lo, hi); return () => (g.bool(0.8) ? g.pick(pool) : g.val(lo, hi)); };

export default {
  'implement-queue-using-stacks': (g) => {
    let size = 0;
    return seq(g, 'MyQueue', [], g.len(1, 99, 40), () => {
      const op = g.pick(['push', 'push', 'pop', 'peek', 'empty']);
      if ((op === 'pop' || op === 'peek') && !size) return null;
      if (op === 'push') size++;
      if (op === 'pop') size--;
      return [op, op === 'push' ? [g.int(1, 9)] : []];
    });
  },
  'design-hashmap': (g) => { const key = keyPool(g, 0, 1e6); return seq(g, 'MyHashMap', [], g.len(1, 200, 40), () => { const op = g.pick(['put', 'put', 'get', 'remove']); return [op, op === 'put' ? [key(), g.val(0, 1e6)] : [key()]]; }); },
  'min-stack': (g) => {
    let size = 0;
    const p = g.palette(...I32);
    return seq(g, 'MinStack', [], g.len(1, 200, 40), () => {
      const op = g.pick(['push', 'push', 'pop', 'top', 'getMin']);
      if (op !== 'push' && !size) return null;
      if (op === 'push') size++;
      if (op === 'pop') size--;
      return [op, op === 'push' ? [p()] : []];
    });
  },
  'lru-cache': (g) => { const key = keyPool(g, 0, 1e5); return seq(g, 'LRUCache', [g.pick([1, 2, 3, g.int(1, 10), 1e4])], g.len(1, 200, 50), () => (g.bool(0.55) ? ['put', [key(), g.val(0, 1e5)]] : ['get', [key()]])); },
  'insert-delete-getrandom-o1': (g) => {
    const live = new Set();
    const key = keyPool(g, ...I32);
    return seq(g, 'RandomizedSet', [], g.len(1, 200, 40), () => {
      const op = g.pick(['insert', 'insert', 'remove', 'getRandom']);
      if (op === 'getRandom') return live.size ? ['getRandom', []] : null;
      const v = key();
      if (op === 'insert') live.add(v); else live.delete(v);
      return [op, [v]];
    });
  },
  'time-based-key-value-store': (g) => {
    const keys = g.shuffle(['foo', 'bar', 'k', 'love', 'a'.repeat(100)]).slice(0, g.int(1, 3));
    let t = g.int(1, 5);
    return seq(g, 'TimeMap', [], g.len(1, 200, 40), () => {
      if (g.bool(0.5)) { t += g.pick([1, 1, 2, 1000]); if (t > 1e7) return null; return ['set', [g.pick(keys), g.str(g.len(1, 100, 4)), t]]; }
      return ['get', [g.bool(0.9) ? g.pick(keys) : 'zzz', g.pick([1, t, t + 1, 1e7, g.int(1, t + 2)])]];
    });
  },
  'peeking-iterator': (g) => {
    const nums = g.ints(g.len(1, 1000, 15), 1, 1000);
    let left = nums.length;
    return seq(g, 'PeekingIterator', [nums], g.len(1, 999, 40), () => {
      const op = g.pick(['next', 'peek', 'hasNext']);
      if (op !== 'hasNext' && !left) return null;
      if (op === 'next') left--;
      return [op, []];
    });
  },
  'flatten-nested-list-iterator': (g) => {
    const p = g.palette(-1e6, 1e6);
    const make = (depth) => Array.from({ length: g.len(0, 5, 4) }, () => (depth < 4 && g.bool(0.35) ? make(depth + 1) : p()));
    return [make(0)];
  },
  'snapshot-array': (g) => {
    const len = g.pick([1, 2, 5, g.int(1, 50), 5e4]);
    let snaps = 0;
    const idx = () => g.pick([0, len - 1, g.int(0, len - 1)]);
    return seq(g, 'SnapshotArray', [len], g.len(1, 200, 40), () => {
      const op = g.pick(['set', 'set', 'snap', 'get']);
      if (op === 'set') return ['set', [idx(), g.val(0, 1e9)]];
      if (op === 'snap') { snaps++; return ['snap', []]; }
      return snaps ? ['get', [idx(), g.int(0, snaps - 1)]] : null;
    });
  },
  'design-twitter': (g) => {
    const users = g.ints(g.int(1, 4), 1, 500, { distinct: true });
    const ids = g.shuffle(Array.from({ length: 10001 }, (_, i) => i)).slice(0, 300);
    let next = 0;
    return seq(g, 'Twitter', [], g.len(1, 200, 40), () => {
      const op = g.pick(['postTweet', 'postTweet', 'getNewsFeed', 'follow', 'unfollow']);
      const a = g.pick(users), b = g.pick(users);
      if (op === 'postTweet') return next < ids.length ? ['postTweet', [a, ids[next++]]] : null;
      if (op === 'getNewsFeed') return ['getNewsFeed', [a]];
      return a === b ? null : [op, [a, b]];
    });
  },
  'lfu-cache': (g) => { const key = keyPool(g, 0, 1e5); return seq(g, 'LFUCache', [g.pick([1, 2, 3, g.int(1, 10), 1e4])], g.len(1, 200, 50), () => (g.bool(0.5) ? ['put', [key(), g.val(0, 1e9)]] : ['get', [key()]])); },
  'insert-delete-getrandom-o1-duplicates-allowed': (g) => {
    let size = 0;
    const counts = new Map();
    const key = keyPool(g, ...I32);
    return seq(g, 'RandomizedCollection', [], g.len(1, 200, 40), () => {
      const op = g.pick(['insert', 'insert', 'remove', 'getRandom']);
      if (op === 'getRandom') return size ? ['getRandom', []] : null;
      const v = key();
      if (op === 'insert') { counts.set(v, (counts.get(v) || 0) + 1); size++; } else if (counts.get(v)) { counts.set(v, counts.get(v) - 1); size--; }
      return [op, [v]];
    });
  },
  'design-hashset': (g) => { const key = keyPool(g, 0, 1e6); return seq(g, 'MyHashSet', [], g.len(1, 200, 40), () => [g.pick(['add', 'add', 'remove', 'contains']), [key()]]); },
  'implement-stack-using-queues': (g) => {
    let size = 0;
    return seq(g, 'MyStack', [], g.len(1, 99, 40), () => {
      const op = g.pick(['push', 'push', 'pop', 'top', 'empty']);
      if ((op === 'pop' || op === 'top') && !size) return null;
      if (op === 'push') size++;
      if (op === 'pop') size--;
      return [op, op === 'push' ? [g.int(1, 9)] : []];
    });
  },
  'design-circular-queue': (g) => seq(g, 'MyCircularQueue', [g.pick([1, 2, 3, g.int(1, 8), 1000])], g.len(1, 200, 40), () => {
    const op = g.pick(['enQueue', 'enQueue', 'deQueue', 'Front', 'Rear', 'isEmpty', 'isFull']);
    return [op, op === 'enQueue' ? [g.val(0, 1000)] : []];
  }),
  'detect-squares': (g) => {
    const coord = g.palette(0, g.pick([1000, 4, 10]));
    return seq(g, 'DetectSquares', [], g.len(1, 300, 60), () => [g.bool(0.65) ? 'add' : 'count', [[coord(), coord()]]]);
  },
  'maximum-frequency-stack': (g) => {
    let size = 0;
    const key = keyPool(g, 0, 1e9);
    return seq(g, 'FreqStack', [], g.len(1, 300, 50), () => {
      if (g.bool(0.6)) { size++; return ['push', [key()]]; }
      if (!size) return null;
      size--;
      return ['pop', []];
    });
  },
};
