/**
 * <DesignWalkViz>: the Designing Data Structures lesson's problems, one engine. Most modes replay a list
 * of operations; each step is one call (a card: the call and what it returns) and the structure's inside,
 * drawn in its real shape as "parts":
 *   { type: 'pile', label, items }      a stack, top at the top       items: [{ id, main, sub?, tone? }]
 *   { type: 'lane', label, items }      a queue / deque / ordered list, front on the left
 *   { type: 'chips', label, chips }     a map, a set, a few counters  chips: [{ key, text, tone? }]
 *   { type: 'strip', ... }              a row of cells (the GreedyWalkViz strip shape)
 *   { type: 'grid', label, cells }      a small grid: rows of { l, c: [classes], b }
 * A few modes (tickets, sandwiches, secret) are one-off simulations instead.
 * Every mode has a separate naive implementation, so scripts/viz-check.mjs can compare the outputs.
 */
import { list, rng } from './util.js';

// ---------------------------------------------------------------- small helpers

const P = {
  pile: (label, items, empty = 'empty') => ({ type: 'pile', label, items, empty }),
  lane: (label, items, front = 'front', back = 'back', empty = 'empty') => ({ type: 'lane', label, items, front, back, empty }),
  chips: (label, chips, empty = 'none') => ({ type: 'chips', label, chips, empty }),
  strip: (label, items, o = {}) => ({ type: 'strip', label, items: [...items], cls: {}, tags: {}, sub: {}, bands: [], index: true, ...o }),
  grid: (label, cells) => ({ type: 'grid', label, cells }),
};
const opText = (op) => op.map(String).join(' ');
const callText = ([name, ...args]) => `${name}(${args.map((a) => (typeof a === 'string' ? `"${a}"` : a)).join(', ')})`;
const show = (v) => (v === undefined ? '' : Array.isArray(v) ? list(v) : typeof v === 'string' ? `"${v}"` : String(v));
const sortNum = (a) => [...a].sort((x, y) => x - y);

// ---------------------------------------------------------------- the modes

const DEF = {};

// ---- 232: a queue from two stacks
DEF.queue2 = {
  label: 'Queue from two stacks', example: { ops: [['push', 1], ['push', 2], ['peek'], ['pop'], ['push', 3], ['pop'], ['pop'], ['empty']] },
  sig: { push: ['int'], pop: [], peek: [], empty: [] },
  code: [['push', 'push(x): in.push(x);'], ['move', 'if (out.isEmpty()) while (!in.isEmpty()) out.push(in.pop());   // reverse once'], ['pop', 'pop() / peek(): from the top of out'], ['empty', 'empty(): in and out both empty']],
  intro: 'One stack ("in") takes every push. The other ("out") serves pops and peeks from its top. When out runs dry, pour all of in into it: that reverses the order, so the oldest element ends up on top. Each element is moved at most once, so every operation is O(1) on average.',
  init: () => ({ inS: [], outS: [], uid: 0 }),
  apply(st, [op, x]) {
    if (op === 'push') { st.inS.push({ id: st.uid++, v: x }); return { kind: 'push', lines: ['push'], title: `push(${x}) onto "in"`, text: `New elements always go on top of "in". The order of "out" isn't touched.`, hl: { in: true } }; }
    if (op === 'empty') { const e = !st.inS.length && !st.outS.length; return { ret: e, kind: 'read', lines: ['empty'], title: `empty() → ${e}`, text: e ? 'Both stacks are empty.' : `${st.inS.length + st.outS.length} element${st.inS.length + st.outS.length === 1 ? '' : 's'} still waiting.` }; }
    let moved = 0;
    if (!st.outS.length) { while (st.inS.length) { st.outS.push(st.inS.pop()); moved++; } }
    const top = st.outS.at(-1);
    if (op === 'pop') st.outS.pop();
    return { ret: top.v, kind: moved ? 'move' : op === 'pop' ? 'pop' : 'read', lines: moved ? ['move', 'pop'] : ['pop'], title: `${op}() → ${top.v}${moved ? ` (poured ${moved} over first)` : ''}`, text: `${moved ? `"out" was empty, so all ${moved} element${moved === 1 ? '' : 's'} of "in" were popped and pushed onto "out": the oldest is now on top. ` : '"out" already has elements, and its top is the oldest one still waiting. '}${op === 'pop' ? `Pop ${top.v}.` : `Peek at ${top.v} without removing it.`}`, hl: { out: true } };
  },
  view: (st) => [P.pile('in (push here)', st.inS.map((n) => ({ id: n.id, main: n.v }))), P.pile('out (pop here)', st.outS.map((n) => ({ id: n.id, main: n.v, tone: 'accent' })))],
  naive(input) { const q = [], out = []; for (const [op, x] of input.ops) { if (op === 'push') q.push(x); else if (op === 'pop') out.push(q.shift()); else if (op === 'peek') out.push(q[0]); else out.push(q.length === 0); } return out; },
  valid(ops) { let n = 0; for (const [op] of ops) { if (op === 'push') n++; else if (op === 'pop') { if (!n) return false; n--; } else if (op === 'peek' && !n) return false; } return true; },
  random(g) { const ops = []; let n = 0; for (let k = 0; k < g.int(3, 8); k++) { const r = g.int(0, 3); if (!n || r === 0) { ops.push(['push', g.int(1, 9)]); n++; } else if (r === 1) { ops.push(['pop']); n--; } else ops.push([r === 2 ? 'peek' : 'empty']); } return { ops }; },
};

// ---- 225: a stack from one queue
DEF.stack1 = {
  label: 'Stack from a queue', example: { ops: [['push', 1], ['push', 2], ['push', 3], ['top'], ['pop'], ['pop'], ['empty']] },
  sig: { push: ['int'], pop: [], top: [], empty: [] },
  code: [['push', 'push(x): q.add(x);'], ['rotate', 'for (i < q.size() − 1) q.add(q.remove());   // the new element comes to the front'], ['pop', 'pop() / top(): the front of q'], ['empty', 'empty(): q.isEmpty()']],
  intro: 'A queue removes from the front, a stack from the top. Keep the queue in stack order: after adding x at the back, move every older element from the front to the back. Now x is at the front, where pop and top look. push is O(n), pop and top O(1).',
  init: () => ({ q: [], uid: 0 }),
  apply(st, [op, x]) {
    if (op === 'push') { st.q.push({ id: st.uid++, v: x }); const r = st.q.length - 1; for (let k = 0; k < r; k++) st.q.push(st.q.shift()); return { kind: 'push', lines: ['push', 'rotate'], title: `push(${x}), then rotate ${r} time${r === 1 ? '' : 's'}`, text: r ? `${x} joined at the back; moving the ${r} older element${r === 1 ? '' : 's'} from the front to the back brings ${x} to the front, the stack's top.` : `${x} is the only element, so it is already at the front.` }; }
    if (op === 'empty') { const e = !st.q.length; return { ret: e, kind: 'read', lines: ['empty'], title: `empty() → ${e}`, text: e ? 'The queue holds nothing at all.' : `${st.q.length} element${st.q.length === 1 ? '' : 's'} still in the queue.` }; }
    const f = st.q[0];
    if (op === 'pop') st.q.shift();
    return { ret: f.v, kind: op === 'pop' ? 'pop' : 'read', lines: ['pop'], title: `${op}() → ${f.v}`, text: `The front of the queue is the most recent push, ${f.v}: ${op === 'pop' ? 'remove it' : 'read it'}.` };
  },
  view: (st) => [P.lane('queue (front = top of the stack)', st.q.map((n) => ({ id: n.id, main: n.v })), 'top', '')],
  naive(input) { const s = [], out = []; for (const [op, x] of input.ops) { if (op === 'push') s.push(x); else if (op === 'pop') out.push(s.pop()); else if (op === 'top') out.push(s.at(-1)); else out.push(!s.length); } return out; },
  valid(ops) { let n = 0; for (const [op] of ops) { if (op === 'push') n++; else if (op === 'pop') { if (!n) return false; n--; } else if (op === 'top' && !n) return false; } return true; },
  random(g) { const ops = []; let n = 0; for (let k = 0; k < g.int(3, 8); k++) { const r = g.int(0, 3); if (!n || r === 0) { ops.push(['push', g.int(1, 9)]); n++; } else if (r === 1) { ops.push(['pop']); n--; } else ops.push([r === 2 ? 'top' : 'empty']); } return { ops }; },
};

// ---- 155: min stack
DEF.minstack = {
  label: 'Min stack', example: { ops: [['push', -2], ['push', 0], ['push', -3], ['getMin'], ['pop'], ['top'], ['getMin']] },
  sig: { push: ['int'], pop: [], top: [], getMin: [] },
  code: [['push', 'push(x): stack.push(new int[] { x, min(x, current min) });'], ['pop', 'pop(): stack.pop();          // the min below is still stored'], ['top', 'top(): stack.peek()[0];'], ['min', 'getMin(): stack.peek()[1];   // O(1)']],
  intro: 'A minimum can\'t be updated cheaply when it is popped, unless you remember what the minimum was before it arrived. So store, with every element, the minimum of the stack from that element down. The top\'s stored minimum is always the answer, and popping uncovers the previous one.',
  init: () => ({ s: [], uid: 0 }),
  apply(st, [op, x]) {
    if (op === 'push') { const m = st.s.length ? Math.min(x, st.s.at(-1).m) : x; st.s.push({ id: st.uid++, v: x, m }); return { kind: 'push', lines: ['push'], title: `push(${x}): min below it is ${m}`, text: st.s.length > 1 ? `Store ${x} with min(${x}, ${st.s.at(-2).m}) = ${m}.` : `The first element is its own minimum.` }; }
    const t = st.s.at(-1);
    if (op === 'pop') { st.s.pop(); return { kind: 'pop', lines: ['pop'], title: `pop() removes ${t.v}`, text: st.s.length ? `The new top carries its own stored minimum, ${st.s.at(-1).m}: no searching needed.` : 'The stack is empty again.' }; }
    if (op === 'top') return { ret: t.v, kind: 'read', lines: ['top'], title: `top() → ${t.v}`, text: 'The value part of the top pair.' };
    return { ret: t.m, kind: 'read', lines: ['min'], title: `getMin() → ${t.m}`, text: 'The minimum part of the top pair: the smallest of everything in the stack.' };
  },
  view: (st) => [P.pile('stack (value, min so far)', st.s.map((n) => ({ id: n.id, main: n.v, sub: `min ${n.m}` })))],
  naive(input) { const s = [], out = []; for (const [op, x] of input.ops) { if (op === 'push') s.push(x); else if (op === 'pop') s.pop(); else if (op === 'top') out.push(s.at(-1)); else out.push(Math.min(...s)); } return out; },
  valid(ops) { let n = 0; for (const [op] of ops) { if (op === 'push') n++; else { if (!n) return false; if (op === 'pop') n--; } } return true; },
  random(g) { const ops = []; let n = 0; for (let k = 0; k < g.int(3, 8); k++) { const r = g.int(0, 3); if (!n || r === 0) { ops.push(['push', g.int(-5, 9)]); n++; } else if (r === 1) { ops.push(['pop']); n--; } else ops.push([r === 2 ? 'top' : 'getMin']); } return { ops }; },
};

// ---- 706 / 705: hash map and hash set with chaining
const BUCKETS = 5;
const hashDef = (isMap) => ({
  label: isMap ? 'Hash map with chaining' : 'Hash set with chaining',
  example: { ops: isMap ? [['put', 1, 1], ['put', 2, 2], ['get', 1], ['get', 3], ['put', 6, 4], ['put', 2, 1], ['get', 2], ['remove', 2], ['get', 2]] : [['add', 1], ['add', 2], ['contains', 1], ['contains', 3], ['add', 6], ['add', 2], ['remove', 2], ['contains', 2]] },
  sig: isMap ? { put: ['int', 'int'], get: ['int'], remove: ['int'] } : { add: ['int'], remove: ['int'], contains: ['int'] },
  code: [['hash', `bucket = key % ${BUCKETS};                 // (the real one uses ~10⁴ buckets)`], ['scan', 'walk that bucket\'s chain looking for key'], ['write', isMap ? 'put: update the node, or append a new one · remove: unlink it' : 'add: append if missing · remove: unlink it'], ['read', isMap ? 'get: the node\'s value, or −1' : 'contains: whether the key was found']],
  intro: `Keep an array of buckets. A key goes to bucket key % ${BUCKETS} (a real table uses thousands), and each bucket holds a short chain of the keys that landed there. Every operation only looks inside one bucket, so with enough buckets each chain stays tiny: O(1) on average.`,
  init: () => ({ b: Array.from({ length: BUCKETS }, () => []) }),
  apply(st, [op, k, v]) {
    const h = ((k % BUCKETS) + BUCKETS) % BUCKETS, chain = st.b[h], at = chain.findIndex((e) => e.k === k);
    const where = `${k} % ${BUCKETS} = ${h}: bucket ${h}`;
    if (op === 'put' || op === 'add') {
      if (at >= 0) { if (isMap) chain[at].v = v; return { kind: 'write', lines: ['hash', 'scan', 'write'], title: isMap ? `put(${k}, ${v}): update` : `add(${k}): already there`, text: `${where}. The chain already holds ${k}${isMap ? `, so overwrite its value with ${v}` : ', so nothing changes'}.`, hl: { b: h, k } }; }
      chain.push({ k, v }); return { kind: 'write', lines: ['hash', 'scan', 'write'], title: `${op}(${k}${isMap ? `, ${v}` : ''}): new in bucket ${h}`, text: `${where}. ${k} isn't in its chain yet, so append it${chain.length > 1 ? `; it shares the bucket with ${chain.slice(0, -1).map((e) => e.k).join(', ')} (a collision)` : ''}.`, hl: { b: h, k } };
    }
    if (op === 'remove') { if (at >= 0) chain.splice(at, 1); return { kind: at >= 0 ? 'pop' : 'read', lines: ['hash', 'scan', 'write'], title: `remove(${k})${at >= 0 ? '' : ': not there'}`, text: `${where}. ${at >= 0 ? `Unlink ${k} from the chain.` : `${k} isn't in the chain: nothing to do.`}`, hl: { b: h } }; }
    const ret = isMap ? (at >= 0 ? chain[at].v : -1) : at >= 0;
    return { ret, kind: 'read', lines: ['hash', 'scan', 'read'], title: `${op}(${k}) → ${ret}`, text: `${where}. ${at >= 0 ? `Found ${k} in the chain.` : `${k} isn't in the chain.`} Only this bucket was searched.`, hl: { b: h, k } };
  },
  view: (st, hl = {}) => st.b.map((chain, i) => P.chips(`bucket ${i}`, chain.map((e) => ({ key: e.k, text: isMap ? `${e.k} → ${e.v}` : String(e.k), tone: hl.b === i ? (e.k === hl.k ? 'success' : 'accent') : undefined })), '—')),
  naive(input) { const m = new Map(), out = []; for (const [op, k, v] of input.ops) { if (op === 'put') m.set(k, v); else if (op === 'add') m.set(k, true); else if (op === 'remove') m.delete(k); else if (op === 'get') out.push(m.has(k) ? m.get(k) : -1); else out.push(m.has(k)); } return out; },
  valid: () => true,
  random(g) { const keys = [1, 2, 3, 6, 7, 11]; return { ops: Array.from({ length: g.int(3, 9) }, () => { const r = g.int(0, 2), k = g.pick(keys); return isMap ? (r === 0 ? ['put', k, g.int(0, 9)] : r === 1 ? ['get', k] : ['remove', k]) : (r === 0 ? ['add', k] : r === 1 ? ['contains', k] : ['remove', k]); }) }; },
});
DEF.hashmap = hashDef(true);
DEF.hashset = hashDef(false);

// ---- 380 / 381: O(1) insert, remove, getRandom
const pickIndex = (calls, size) => (calls * 2 + 1) % size;   // a stand-in for Random.nextInt(size), so the replay is repeatable
const randDef = (dups) => ({
  label: dups ? 'Randomized collection (duplicates)' : 'Randomized set',
  example: { ops: dups ? [['insert', 1], ['insert', 1], ['insert', 2], ['getRandom'], ['remove', 1], ['getRandom']] : [['insert', 1], ['remove', 2], ['insert', 2], ['getRandom'], ['remove', 1], ['insert', 2], ['getRandom']] },
  sig: { insert: ['int'], remove: ['int'], getRandom: [] },
  code: [['insert', dups ? 'insert(v): a.add(v); idx[v].add(a.size() − 1);' : 'insert(v): if present → false; idx[v] = a.size(); a.add(v);'], ['remove', dups ? 'remove(v): i = any index of v; last = a.last; move last into slot i; fix idx[last]; drop the end' : 'remove(v): i = idx[v]; move the last element into slot i; fix its index; drop the end'], ['random', 'getRandom(): a[random index]          // every slot equally likely']],
  intro: dups ? 'A list makes getRandom O(1): pick a random slot. A map from each value to the SET of slots holding it makes finding a copy O(1). Removing from the middle of a list is slow, so instead copy the last element into the hole, update that element\'s slot set, and drop the end.' : 'A list makes getRandom O(1): pick a random slot. A map from value to its slot makes lookup O(1). Removing from the middle of a list would shift everything, so instead move the last element into the hole, fix its slot in the map, and drop the end.',
  init: () => ({ a: [], idx: new Map(), calls: 0, uid: 0 }),
  apply(st, [op, v]) {
    const sl = (x) => st.idx.get(x) ?? (dups ? new Set() : undefined);
    if (op === 'insert') {
      const had = dups ? sl(v).size > 0 : st.idx.has(v);
      if (!dups && had) return { ret: false, kind: 'read', lines: ['insert'], title: `insert(${v}) → false`, text: `${v} is already in the map: a set holds it once.`, hl: { v } };
      st.a.push({ id: st.uid++, v });
      if (dups) { const s = sl(v); s.add(st.a.length - 1); st.idx.set(v, s); } else st.idx.set(v, st.a.length - 1);
      return { ret: !had, kind: 'push', lines: ['insert'], title: `insert(${v}) → ${!had}`, text: `Append ${v} at slot ${st.a.length - 1} and record the slot in the map.${dups && had ? ' It was already present, so the answer is false, but the copy is still added.' : ''}`, hl: { slot: st.a.length - 1, v } };
    }
    if (op === 'remove') {
      const has = dups ? sl(v).size > 0 : st.idx.has(v);
      if (!has) return { ret: false, kind: 'read', lines: ['remove'], title: `remove(${v}) → false`, text: `${v} isn't in the map, so there is nothing to remove.`, hl: {} };
      const i = dups ? Math.max(...sl(v)) : st.idx.get(v), lastI = st.a.length - 1, last = st.a[lastI];
      if (dups) { sl(v).delete(i); if (!sl(v).size) st.idx.delete(v); } else st.idx.delete(v);
      if (i !== lastI) { st.a[i] = last; if (dups) { const s = sl(last.v); s.delete(lastI); s.add(i); } else st.idx.set(last.v, i); }
      st.a.pop();
      return { ret: true, kind: 'pop', lines: ['remove'], title: `remove(${v}) → true`, text: i === lastI ? `${v} sits in the last slot: just drop it.` : `${v} is at slot ${i}. Copy the last element (${last.v}) into slot ${i}, update its recorded slot, and drop the end. Nothing else moves.`, hl: { slot: i < st.a.length ? i : null } };
    }
    const k = pickIndex(st.calls++, st.a.length);
    return { ret: st.a[k].v, kind: 'read', lines: ['random'], title: `getRandom() → ${st.a[k].v} (slot ${k})`, text: `Pick a random slot from 0 to ${st.a.length - 1} (here ${k}). Each slot is equally likely${dups ? ', so a value with more copies is proportionally more likely' : ''}.`, hl: { slot: k }, any: st.a.map((n) => n.v) };
  },
  view(st, hl = {}) {
    const s = P.strip('list', st.a.map((n) => n.v));
    if (hl.slot !== undefined && hl.slot !== null) s.cls[hl.slot] = 'cur';
    const map = [...st.idx.entries()].sort((x, y) => x[0] - y[0]).map(([k, i]) => ({ key: k, text: `${k} → ${dups ? `{${sortNum([...i]).join(',')}}` : i}`, tone: k === hl.v ? 'accent' : undefined }));
    return [st.a.length ? s : P.chips('list', [], 'empty'), P.chips(dups ? 'value → slots' : 'value → slot', map, 'empty')];
  },
  naive(input) { const a = [], out = []; for (const [op, v] of input.ops) { if (op === 'insert') { const had = a.includes(v); if (dups || !had) a.push(v); out.push(!had); } else if (op === 'remove') { const i = a.indexOf(v); if (i >= 0) a.splice(i, 1); out.push(i >= 0); } else out.push({ any: [...a] }); } return out; },
  valid(ops) { const a = []; for (const [op, v] of ops) { if (op === 'insert') { if (dups || !a.includes(v)) a.push(v); } else if (op === 'remove') { const i = a.indexOf(v); if (i >= 0) a.splice(i, 1); } else if (!a.length) return false; } return true; },
  random(g) { const ops = [], a = []; for (let k = 0; k < g.int(3, 8); k++) { const r = g.int(0, 2), v = g.int(1, 4); if (r === 0 || !a.length) { ops.push(['insert', v]); if (dups || !a.includes(v)) a.push(v); } else if (r === 1) { ops.push(['remove', v]); const i = a.indexOf(v); if (i >= 0) a.splice(i, 1); } else ops.push(['getRandom']); } return { ops }; },
});
DEF.randset = randDef(false);
DEF.randcoll = randDef(true);

// ---- 981: time-based key-value store
DEF.timemap = {
  label: 'Time-based key-value store', example: { ops: [['set', 'foo', 'bar', 1], ['get', 'foo', 1], ['get', 'foo', 3], ['set', 'foo', 'bar2', 4], ['get', 'foo', 4], ['get', 'foo', 5], ['get', 'foo', 0]] },
  sig: { set: ['word', 'word', 'int'], get: ['word', 'int'] },
  code: [['set', 'set(k, v, t): map[k].add((t, v));          // timestamps arrive increasing: the list stays sorted'], ['search', 'get(k, t): binary search map[k] for the last timestamp ≤ t'], ['read', 'return its value, or "" if every timestamp is > t']],
  intro: 'Keep, per key, a list of (timestamp, value) versions. Timestamps for a key arrive in increasing order, so the list is already sorted, and get is a binary search for the last version at or before the asked time.',
  init: () => ({ m: new Map() }),
  apply(st, [op, k, a, b]) {
    if (op === 'set') { if (!st.m.has(k)) st.m.set(k, []); st.m.get(k).push({ t: b, v: a }); return { kind: 'write', lines: ['set'], title: `set("${k}", "${a}", ${b})`, text: `Append version (${b}, "${a}") to "${k}". It is the newest, so the list stays sorted with no extra work.`, hl: { k, i: st.m.get(k).length - 1 } }; }
    const vs = st.m.get(k) ?? [];
    let lo = 0, hi = vs.length - 1, at = -1;
    while (lo <= hi) { const mid = (lo + hi) >> 1; if (vs[mid].t <= a) { at = mid; lo = mid + 1; } else hi = mid - 1; }
    const ret = at >= 0 ? vs[at].v : '';
    return { ret, kind: at >= 0 ? 'read' : 'skip', lines: ['search', 'read'], title: `get("${k}", ${a}) → "${ret}"`, text: !vs.length ? `"${k}" was never set, so there is no version at all: "".` : at >= 0 ? `The last version at or before ${a} is (${vs[at].t}, "${vs[at].v}"), found by binary search over ${vs.length} version${vs.length === 1 ? '' : 's'}.` : `Every version of "${k}" is newer than ${a}: return "".`, hl: { k, i: at } };
  },
  view: (st, hl = {}) => (st.m.size ? [...st.m.entries()].map(([k, vs]) => { const s = P.strip(`"${k}"`, vs.map((e) => `${e.t}:${e.v}`), { index: false }); if (hl.k === k && hl.i >= 0) s.cls[hl.i] = 'hit'; return s; }) : [P.chips('versions', [], 'none yet')]),
  naive(input) { const all = [], out = []; for (const [op, k, a, b] of input.ops) { if (op === 'set') all.push([k, a, b]); else { const c = all.filter(([kk, , t]) => kk === k && t <= a).sort((x, y) => x[2] - y[2]); out.push(c.length ? c.at(-1)[1] : ''); } } return out; },
  valid(ops) { const last = {}; for (const [op, k, , t] of ops) if (op === 'set') { if (last[k] !== undefined && t <= last[k]) return false; last[k] = t; } return true; },
  random(g) { const ops = [], t = { a: 0, b: 0 }; for (let k = 0; k < g.int(2, 7); k++) { const key = g.pick(['a', 'b']); if (g.bool(0.5)) { t[key] += g.int(1, 3); ops.push(['set', key, g.pick(['x', 'y', 'z']), t[key]]); } else ops.push(['get', key, g.int(0, 8)]); } return { ops }; },
};

// ---- 284: peeking iterator
DEF.peeking = {
  label: 'Peeking iterator', example: { list: [1, 2, 3], ops: [['next'], ['peek'], ['next'], ['next'], ['hasNext']] }, extra: 'list',
  sig: { next: [], peek: [], hasNext: [] },
  code: [['peek', 'peek(): if (!hasPeeked) { peeked = it.next(); hasPeeked = true; } return peeked;'], ['next', 'next(): if (hasPeeked) { hasPeeked = false; return peeked; } return it.next();'], ['has', 'hasNext(): hasPeeked || it.hasNext()']],
  intro: 'The wrapped iterator can only move forward. To look ahead without "moving", take the next element early and keep it in a one-element cache; next() hands out the cached element first. That cache is the whole trick.',
  init: (input) => ({ list: input.list, pos: 0, cache: null }),
  apply(st, [op]) {
    if (op === 'peek') { const had = st.cache !== null; if (!had) st.cache = st.list[st.pos++]; return { ret: st.cache, kind: had ? 'read' : 'move', lines: ['peek'], title: `peek() → ${st.cache}`, text: had ? 'The element is already cached: return it again.' : `Pull ${st.cache} from the iterator into the cache. The underlying iterator has moved, but our next() will still return it.` }; }
    if (op === 'next') { if (st.cache !== null) { const v = st.cache; st.cache = null; return { ret: v, kind: 'pop', lines: ['next'], title: `next() → ${v} (from the cache)`, text: 'A peeked element is waiting: hand it out and clear the cache.' }; } const v = st.list[st.pos++]; return { ret: v, kind: 'pop', lines: ['next'], title: `next() → ${v}`, text: 'Nothing cached: pass the call straight to the iterator.' }; }
    const r = st.cache !== null || st.pos < st.list.length;
    return { ret: r, kind: 'read', lines: ['has'], title: `hasNext() → ${r}`, text: r ? (st.cache !== null ? 'A cached element counts.' : 'The iterator has more.') : 'No cache and the iterator is used up.' };
  },
  view(st) { const s = P.strip('underlying list', st.list); st.list.forEach((_, k) => { if (k < st.pos) s.cls[k] = 'dim'; }); if (st.pos < st.list.length) s.tags[st.pos] = [{ label: 'iterator', tone: 'accent' }]; return [s, P.chips('cache', st.cache === null ? [] : [{ key: 'c', text: String(st.cache), tone: 'warn' }], 'empty')]; },
  naive(input) { let i = 0; const out = []; for (const [op] of input.ops) { if (op === 'next') out.push(input.list[i++]); else if (op === 'peek') out.push(input.list[i]); else out.push(i < input.list.length); } return out; },
  valid(ops, input) { let i = 0; for (const [op] of ops) { if (op === 'next') { if (i >= input.list.length) return false; i++; } else if (op === 'peek' && i >= input.list.length) return false; } return true; },
  random(g) { const list2 = Array.from({ length: g.int(1, 5) }, () => g.int(1, 9)); const ops = []; let i = 0; for (let k = 0; k < g.int(2, 7); k++) { const r = g.int(0, 2); if (r === 2 || i >= list2.length) ops.push(['hasNext']); else if (r === 1) ops.push(['peek']); else { ops.push(['next']); i++; } } return { list: list2, ops }; },
};

// ---- 1146: snapshot array
DEF.snapshot = {
  label: 'Snapshot array', example: { n: 3, ops: [['set', 0, 5], ['snap'], ['set', 0, 6], ['get', 0, 0], ['snap'], ['get', 0, 1], ['get', 1, 0]] }, extra: 'n',
  sig: { set: ['int', 'int'], snap: [], get: ['int', 'int'] },
  code: [['set', 'set(i, v): record (snapId, v) for index i (overwrite if the last record has the same snapId)'], ['snap', 'snap(): return snapId++;            // O(1): nothing is copied'], ['get', 'get(i, s): binary search index i\'s records for the last snapId ≤ s (none → 0)']],
  intro: 'Copying the array at every snap is O(n) per snap. Instead, each index keeps only its changes, tagged with the snap id that was current when they were made. snap() just increments a counter, and get() binary searches one index\'s short history.',
  init: (input) => ({ n: input.n, h: Array.from({ length: input.n }, () => []), id: 0 }),
  apply(st, [op, i, v]) {
    if (op === 'snap') { const r = st.id++; return { ret: r, kind: 'write', lines: ['snap'], title: `snap() → ${r}`, text: `Nothing is copied: later sets will be tagged ${st.id}, so snapshot ${r} still sees the earlier records.` }; }
    if (op === 'set') { const hs = st.h[i]; if (hs.length && hs.at(-1).s === st.id) hs.at(-1).v = v; else hs.push({ s: st.id, v }); return { kind: 'write', lines: ['set'], title: `set(${i}, ${v}) during snap ${st.id}`, text: `Record (${st.id}, ${v}) for index ${i}${hs.length > 1 && hs.at(-2).s !== st.id ? '' : ''}. Only this index's list changes.`, hl: { i, j: hs.length - 1 } }; }
    const hs = st.h[i]; let lo = 0, hi = hs.length - 1, at = -1;
    while (lo <= hi) { const mid = (lo + hi) >> 1; if (hs[mid].s <= v) { at = mid; lo = mid + 1; } else hi = mid - 1; }
    const ret = at >= 0 ? hs[at].v : 0;
    return { ret, kind: 'read', lines: ['get'], title: `get(${i}, ${v}) → ${ret}`, text: at >= 0 ? `Index ${i}'s last record made at or before snapshot ${v} is (${hs[at].s}, ${hs[at].v}).` : `Index ${i} wasn't set before snapshot ${v} was taken: still 0.`, hl: { i, j: at } };
  },
  view(st, hl = {}) { return [P.chips('next snap id', [{ key: 's', text: String(st.id), tone: 'accent' }]), ...st.h.map((hs, i) => P.chips(`index ${i}`, hs.map((e, j) => ({ key: j, text: `snap ${e.s}: ${e.v}`, tone: hl.i === i && hl.j === j ? 'success' : undefined })), 'never set (0)'))]; },
  naive(input) { let cur = Array(input.n).fill(0); const snaps = [], out = []; for (const [op, i, v] of input.ops) { if (op === 'set') cur[i] = v; else if (op === 'snap') { snaps.push([...cur]); out.push(snaps.length - 1); } else out.push(snaps[v][i]); } return out; },
  valid(ops, input) { let s = 0; for (const [op, i, v] of ops) { if (op === 'snap') s++; else { if (i < 0 || i >= input.n) return false; if (op === 'get' && (v < 0 || v >= s)) return false; } } return true; },
  random(g) { const n = g.int(1, 3), ops = []; let s = 0; for (let k = 0; k < g.int(2, 8); k++) { const r = g.int(0, 2); if (r === 0) ops.push(['set', g.int(0, n - 1), g.int(1, 9)]); else if (r === 1 || !s) { ops.push(['snap']); s++; } else ops.push(['get', g.int(0, n - 1), g.int(0, s - 1)]); } return { n, ops }; },
};

// ---- 355: design twitter
DEF.twitter = {
  label: 'Design Twitter', example: { ops: [['post', 1, 5], ['feed', 1], ['follow', 1, 2], ['post', 2, 6], ['feed', 1], ['unfollow', 1, 2], ['feed', 1]] },
  sig: { post: ['int', 'int'], feed: ['int'], follow: ['int', 'int'], unfollow: ['int', 'int'] },
  code: [['post', 'post(u, id): tweets[u].add((time++, id));'], ['follow', 'follow / unfollow: followees[u].add / remove(v)'], ['feed', 'feed(u): merge the newest tweets of u and its followees with a heap'], ['take', '  pop the newest, push the next-older tweet of that user; stop at 10']],
  intro: 'Each user keeps a list of their own tweets (with a global time), and a set of followees. A feed only needs the 10 newest tweets among a few users\' lists, each already in time order: that is a k-way merge with a max-heap, taking at most 10 tweets.',
  init: () => ({ t: new Map(), f: new Map(), time: 0 }),
  apply(st, [op, a, b]) {
    const tw = (u) => st.t.get(u) ?? [], fo = (u) => st.f.get(u) ?? new Set();
    if (op === 'post') { st.t.set(a, [...tw(a), { time: st.time++, id: b }]); return { kind: 'write', lines: ['post'], title: `user ${a} posts tweet ${b}`, text: `Append (time ${st.time - 1}, tweet ${b}) to user ${a}'s list. Lists stay in time order for free.`, hl: { u: a } }; }
    if (op === 'follow' || op === 'unfollow') { const s = new Set(fo(a)); if (op === 'follow') s.add(b); else s.delete(b); st.f.set(a, s); return { kind: 'write', lines: ['follow'], title: `${a} ${op}s ${b}`, text: op === 'follow' ? `Add ${b} to user ${a}'s followees.` : `Remove ${b} from user ${a}'s followees (if present).`, hl: { u: a } }; }
    const users = [a, ...[...fo(a)].filter((u) => u !== a)];
    const all = users.flatMap((u) => tw(u).map((x) => ({ ...x, u }))).sort((x, y) => y.time - x.time).slice(0, 10);
    const ret = all.map((x) => x.id);
    return { ret, kind: 'read', lines: ['feed', 'take'], title: `feed(${a}) → ${list(ret)}`, text: `Merge the tweet lists of user${users.length > 1 ? 's' : ''} ${users.join(', ')}, newest first, keeping at most 10. ${ret.length ? `Newest: tweet ${ret[0]}.` : 'Nobody has tweeted.'}`, hl: { feed: all.map((x) => x.id) } };
  },
  view(st, hl = {}) {
    const users = [...new Set([...st.t.keys(), ...st.f.keys()])].sort((x, y) => x - y);
    return users.length ? users.map((u) => P.chips(`user ${u}`, [...(st.t.get(u) ?? []).slice().reverse().map((x) => ({ key: `t${x.id}`, text: `tweet ${x.id} @${x.time}`, tone: hl.feed?.includes(x.id) ? 'success' : undefined })), ...[...(st.f.get(u) ?? [])].map((v) => ({ key: `f${v}`, text: `follows ${v}`, tone: 'note' }))], '—')) : [P.chips('users', [], 'none yet')];
  },
  naive(input) { const log = [], f = new Map(), out = []; for (const [op, a, b] of input.ops) { if (op === 'post') log.push([a, b]); else if (op === 'follow') { if (!f.has(a)) f.set(a, new Set()); f.get(a).add(b); } else if (op === 'unfollow') f.get(a)?.delete(b); else { const res = []; for (let k = log.length - 1; k >= 0 && res.length < 10; k--) if (log[k][0] === a || f.get(a)?.has(log[k][0])) res.push(log[k][1]); out.push(res); } } return out; },
  valid: (ops) => ops.every(([op, a, b]) => !(op === 'follow' && a === b)),
  random(g) { let id = 1; return { ops: Array.from({ length: g.int(3, 9) }, () => { const r = g.int(0, 3), a = g.int(1, 3); let b = g.int(1, 3); if (b === a) b = (a % 3) + 1; return r === 0 ? ['post', a, id++] : r === 1 ? ['follow', a, b] : r === 2 ? ['unfollow', a, b] : ['feed', a]; }) }; },
};

// ---- 460: LFU cache
DEF.lfu = {
  label: 'LFU cache', example: { cap: 2, ops: [['put', 1, 1], ['put', 2, 2], ['get', 1], ['put', 3, 3], ['get', 2], ['get', 3], ['put', 4, 4], ['get', 1], ['get', 3], ['get', 4]] }, extra: 'cap',
  sig: { put: ['int', 'int'], get: ['int'] },
  code: [['map', 'key → (value, count); count → keys in order of last use (LinkedHashSet); minCount'], ['touch', 'use(k): move k from list[count] to the end of list[count + 1]; if list[minCount] emptied, minCount++'], ['evict', 'full: evict the FIRST key of list[minCount]      // least used, then least recent'], ['add', 'new key: count 1, minCount = 1']],
  intro: 'Group keys by how often they have been used. Inside a group keep them in order of last use, like an LRU. Track the smallest count in use. Eviction takes the oldest key of the smallest-count group; every get or put moves its key up one group. All of it is O(1) with hash maps of linked sets.',
  init: (input) => ({ cap: input.cap, m: new Map(), g: new Map(), min: 0 }),
  apply(st, [op, k, v]) {
    const touch = (key) => { const e = st.m.get(key); const L = st.g.get(e.c); L.splice(L.indexOf(key), 1); if (!L.length) { st.g.delete(e.c); if (st.min === e.c) st.min++; } e.c++; if (!st.g.has(e.c)) st.g.set(e.c, []); st.g.get(e.c).push(key); };
    if (op === 'get') {
      if (!st.m.has(k)) return { ret: -1, kind: 'skip', lines: ['map'], title: `get(${k}) → −1`, text: `${k} isn't in the key map, so return −1. Nothing moves.`, hl: {} };
      const before = st.m.get(k).c; touch(k);
      return { ret: st.m.get(k).v, kind: 'read', lines: ['map', 'touch'], title: `get(${k}) → ${st.m.get(k).v}, count ${before} → ${before + 1}`, text: `Found it. Using it moves ${k} from the count-${before} group to the end of the count-${before + 1} group.`, hl: { k } };
    }
    if (st.m.has(k)) { st.m.get(k).v = v; const before = st.m.get(k).c; touch(k); return { kind: 'write', lines: ['map', 'touch'], title: `put(${k}, ${v}): update, count ${before} → ${before + 1}`, text: `${k} is cached: change the value and count the use.`, hl: { k } }; }
    let evicted = null; const minBefore = st.min;
    if (st.m.size === st.cap && st.cap > 0) { const L = st.g.get(st.min); evicted = L.shift(); if (!L.length) st.g.delete(st.min); st.m.delete(evicted); }
    if (st.cap > 0) { st.m.set(k, { v, c: 1 }); if (!st.g.has(1)) st.g.set(1, []); st.g.get(1).push(k); st.min = 1; }
    return { kind: evicted !== null ? 'evict' : 'push', lines: evicted !== null ? ['evict', 'add'] : ['add'], title: evicted !== null ? `put(${k}, ${v}): full, evict ${evicted}` : `put(${k}, ${v}): new key`, text: `${evicted !== null ? `The cache is full. The smallest count in use is ${minBefore}; the least recently used key with that count, ${evicted}, goes. ` : ''}${k} enters with count 1, so the minimum count is 1 again.`, hl: { k } };
  },
  view(st, hl = {}) { const cs = [...st.g.keys()].sort((x, y) => x - y); return [P.chips('key → value (count)', [...st.m.entries()].map(([k, e]) => ({ key: k, text: `${k} → ${e.v} (${e.c})`, tone: k === hl.k ? 'accent' : undefined })), 'empty'), ...cs.map((c) => P.lane(`count ${c}${c === st.min ? ' (min)' : ''}`, st.g.get(c).map((k) => ({ id: `k${k}`, main: k, tone: k === hl.k ? 'accent' : undefined })), 'oldest', 'newest'))]; },
  naive(input) { const m = new Map(); let clock = 0; const out = []; for (const [op, k, v] of input.ops) { if (op === 'get') { if (m.has(k)) { const e = m.get(k); e.c++; e.t = clock++; out.push(e.v); } else out.push(-1); continue; } if (input.cap === 0) continue; if (m.has(k)) { const e = m.get(k); e.v = v; e.c++; e.t = clock++; continue; } if (m.size === input.cap) { let worst = null; for (const [kk, e] of m) if (!worst || e.c < worst[1].c || (e.c === worst[1].c && e.t < worst[1].t)) worst = [kk, e]; m.delete(worst[0]); } m.set(k, { v, c: 1, t: clock++ }); } return out; },
  valid: () => true,
  random(g) { return { cap: g.int(1, 3), ops: Array.from({ length: g.int(3, 10) }, () => (g.bool(0.5) ? ['put', g.int(1, 4), g.int(1, 9)] : ['get', g.int(1, 4)])) }; },
};

// ---- 2013: detect squares
DEF.squares = {
  label: 'Detect squares', example: { ops: [['add', 1, 3], ['add', 3, 1], ['add', 1, 1], ['count', 3, 3], ['count', 2, 2], ['add', 1, 1], ['count', 3, 3]] },
  sig: { add: ['int', 'int'], count: ['int', 'int'] },
  code: [['add', 'add(x, y): cnt[(x, y)]++;'], ['diag', 'count(qx, qy): for each stored point (x, y) with |x − qx| == |y − qy| > 0     // the opposite corner'], ['mul', '    ways += cnt[(x, y)] · cnt[(x, qy)] · cnt[(qx, y)]'], ['ret', 'return ways;']],
  intro: 'Count copies of each point in a map. For a query point, the opposite corner of any square is a stored point on a diagonal from it (same distance across and up). The other two corners are then fixed, so multiply the three corners\' counts. Only distinct stored points are tried, not all triples.',
  init: () => ({ c: new Map(), q: null, sq: [] }),
  apply(st, [op, x, y]) {
    const K = (a, b) => `${a},${b}`, get = (a, b) => st.c.get(K(a, b)) ?? 0;
    if (op === 'add') { st.c.set(K(x, y), get(x, y) + 1); st.q = null; st.sq = []; return { kind: 'push', lines: ['add'], title: `add(${x}, ${y})`, text: get(x, y) > 1 ? `(${x}, ${y}) is now stored ${get(x, y)} times: each copy makes a different square.` : `Store (${x}, ${y}): its count in the map becomes 1.`, hl: { p: [x, y] } }; }
    let ways = 0; const parts = []; st.sq = [];
    for (const [key, n] of st.c) { const [a, b] = key.split(',').map(Number); if (a === x || Math.abs(a - x) !== Math.abs(b - y)) continue; const w = n * get(a, y) * get(x, b); if (w) { ways += w; parts.push(`corner (${a}, ${b}): ${n} · ${get(a, y)} · ${get(x, b)} = ${w}`); st.sq.push([[a, b], [a, y], [x, b]]); } }
    st.q = [x, y];
    return { ret: ways, kind: ways ? 'take' : 'skip', lines: ['diag', 'mul', 'ret'], title: `count(${x}, ${y}) → ${ways}`, text: parts.length ? `Diagonal corners that complete a square: ${parts.join('; ')}.` : 'No stored point on a diagonal has both other corners stored.', hl: {} };
  },
  view(st, hl = {}) {
    const pts = [...st.c.keys()].map((k) => k.split(',').map(Number));
    const all = [...pts, ...(st.q ? [st.q] : [])];
    const W = Math.max(4, ...all.map((p) => p[0] + 1)), H = Math.max(4, ...all.map((p) => p[1] + 1));
    const corner = new Set(st.sq.flat().map((p) => `${p[0]},${p[1]}`));
    const cells = Array.from({ length: H }, (_, r) => { const y = H - 1 - r; return Array.from({ length: W }, (__, x) => { const n = st.c.get(`${x},${y}`) ?? 0; const isQ = st.q && st.q[0] === x && st.q[1] === y; const isNew = hl.p && hl.p[0] === x && hl.p[1] === y; return { l: n ? String(n) : isQ ? '?' : '', c: [isQ ? 'ring_b' : corner.has(`${x},${y}`) ? 'ring_a' : n ? 'land' : 'open', (isQ || isNew) && 'cellCur'] }; }); });
    return [P.grid(`points (x across, y up; number = copies)`, cells)];
  },
  naive(input) { const pts = [], out = []; for (const [op, x, y] of input.ops) { if (op === 'add') { pts.push([x, y]); continue; } let w = 0; for (let i = 0; i < pts.length; i++) for (let j = 0; j < pts.length; j++) for (let k = 0; k < pts.length; k++) { if (i === j || j === k || i === k) continue; const [a, b] = pts[i], [c, d] = pts[j], [e, f] = pts[k]; if (a !== x && Math.abs(a - x) === Math.abs(b - y) && c === a && d === y && e === x && f === b) w++; } out.push(w); } return out; },
  valid: () => true,
  random(g) { return { ops: Array.from({ length: g.int(3, 9) }, () => [g.bool(0.65) ? 'add' : 'count', g.int(0, 4), g.int(0, 4)]) }; },
};

// ---- 895: maximum frequency stack
DEF.freqstack = {
  label: 'Maximum frequency stack', example: { ops: [['push', 5], ['push', 7], ['push', 5], ['push', 7], ['push', 4], ['push', 5], ['pop'], ['pop'], ['pop'], ['pop']] },
  sig: { push: ['int'], pop: [] },
  code: [['push', 'push(x): f = ++freq[x]; group[f].push(x); maxFreq = max(maxFreq, f);'], ['pop', 'pop(): x = group[maxFreq].pop(); freq[x]--; if (group[maxFreq] is empty) maxFreq--;']],
  intro: 'Keep one stack per frequency level: the k-th copy of a value is pushed onto stack k. The most frequent value is on the highest non-empty stack, and within that stack the most recent is on top, exactly the tie rule. Each copy lives on its own level, so a pop just uncovers the level below.',
  init: () => ({ f: new Map(), g: new Map(), max: 0, uid: 0 }),
  apply(st, [op, x]) {
    if (op === 'push') { const f = (st.f.get(x) ?? 0) + 1; st.f.set(x, f); if (!st.g.has(f)) st.g.set(f, []); st.g.get(f).push({ id: st.uid++, v: x }); st.max = Math.max(st.max, f); return { kind: 'push', lines: ['push'], title: `push(${x}): copy #${f} → stack ${f}`, text: `${x} now appears ${f} time${f === 1 ? '' : 's'}, so this copy goes on stack ${f}.`, hl: { lvl: f } }; }
    const L = st.g.get(st.max), top = L.pop(), lvl = st.max; st.f.set(top.v, st.f.get(top.v) - 1);
    if (!L.length) { st.g.delete(st.max); st.max--; }
    return { ret: top.v, kind: 'pop', lines: ['pop'], title: `pop() → ${top.v} (from stack ${lvl})`, text: `Stack ${lvl} is the highest frequency; its top is the most recently pushed of the tied values. ${top.v}'s count drops to ${st.f.get(top.v)}.${!L.length ? ` Stack ${lvl} is now empty, so the max frequency falls to ${st.max}.` : ''}`, hl: { lvl } };
  },
  view(st, hl = {}) { const lv = [...st.g.keys()].sort((x, y) => x - y); return [P.chips('freq', [...st.f.entries()].filter(([, c]) => c).sort((a, b) => a[0] - b[0]).map(([v, c]) => ({ key: v, text: `${v}: ${c}` })), 'empty'), ...(lv.length ? lv.map((l) => P.pile(`stack ${l}${l === st.max ? ' (max)' : ''}`, st.g.get(l).map((n) => ({ id: n.id, main: n.v, tone: l === hl.lvl ? 'accent' : undefined })))) : [P.pile('stacks', [])])]; },
  naive(input) { const s = [], out = []; for (const [op, x] of input.ops) { if (op === 'push') { s.push(x); continue; } const c = new Map(); s.forEach((v) => c.set(v, (c.get(v) ?? 0) + 1)); const m = Math.max(...c.values()); let k = s.length - 1; while (c.get(s[k]) !== m) k--; out.push(s.splice(k, 1)[0]); } return out; },
  valid(ops) { let n = 0; for (const [op] of ops) { if (op === 'push') n++; else { if (!n) return false; n--; } } return true; },
  random(g) { const ops = []; let n = 0; for (let k = 0; k < g.int(3, 10); k++) { if (!n || g.bool(0.6)) { ops.push(['push', g.int(1, 4)]); n++; } else { ops.push(['pop']); n--; } } return { ops }; },
};

// ---- 2336 / 1845: smallest number in an infinite set, seat reservation
const lowDef = (seats) => ({
  label: seats ? 'Seat reservation manager' : 'Smallest number in an infinite set',
  example: seats ? { n: 5, ops: [['reserve'], ['reserve'], ['unreserve', 2], ['reserve'], ['reserve'], ['reserve'], ['reserve'], ['unreserve', 5]] } : { ops: [['addBack', 2], ['popSmallest'], ['popSmallest'], ['popSmallest'], ['addBack', 1], ['popSmallest'], ['popSmallest'], ['popSmallest']] },
  extra: seats ? 'n' : undefined,
  sig: seats ? { reserve: [], unreserve: ['int'] } : { popSmallest: [], addBack: ['int'] },
  code: [['next', `next = 1;  heap = {}        // every number ≥ next is still ${seats ? 'free' : 'in the set'}`], ['take', `${seats ? 'reserve' : 'popSmallest'}(): if (heap non-empty) return heap.poll(); return next++;`], ['back', `${seats ? 'unreserve(x)' : 'addBack(x)'}: if (x < next${seats ? '' : ' && x not in heap'}) heap.add(x);`]],
  intro: seats ? 'Every seat from some number on has never been reserved: track that boundary as "next". Seats given back below it go into a min-heap. The lowest free seat is the heap\'s smallest, or "next" if the heap is empty.' : 'The set is infinite, but it only ever differs from "all numbers ≥ next" by a few numbers that were added back below next. Keep those in a min-heap (with a set to avoid duplicates). The smallest is the heap\'s top, or next.',
  init: () => ({ next: 1, h: [] }),
  apply(st, [op, x]) {
    if (op === 'reserve' || op === 'popSmallest') {
      if (st.h.length) { const v = st.h.shift(); return { ret: v, kind: 'pop', lines: ['take'], title: `${op}() → ${v} (from the heap)`, text: `${v} was given back and is smaller than next (${st.next}): the heap's top wins.`, hl: { v } }; }
      const v = st.next++; return { ret: v, kind: 'take', lines: ['take'], title: `${op}() → ${v}`, text: `The heap is empty, so the smallest is next = ${v}; next moves to ${st.next}.`, hl: { v } };
    }
    if (x >= st.next || st.h.includes(x)) return { kind: 'skip', lines: ['back'], title: `${op}(${x}): nothing to do`, text: x >= st.next ? `${x} ≥ next (${st.next}), so it is already ${seats ? 'free' : 'in the set'}.` : `${x} is already in the heap.`, hl: {} };
    st.h.push(x); st.h.sort((a, b) => a - b);
    return { kind: 'push', lines: ['back'], title: `${op}(${x}): into the heap`, text: `${x} is below next (${st.next}), so record it in the min-heap.`, hl: { v: x } };
  },
  view(st, hl = {}) { const N = seats ? st.n : Math.max(6, st.next + 1); const s = P.strip(seats ? 'seats' : 'numbers', Array.from({ length: N }, (_, k) => k + 1)); for (let k = 1; k <= N; k++) { const free = k >= st.next || st.h.includes(k); s.cls[k - 1] = free ? '' : 'dim'; if (k === hl.v) s.cls[k - 1] = `${s.cls[k - 1]} cur`; } if (st.next <= N) s.tags[st.next - 1] = [{ label: 'next', tone: 'accent' }]; return [s, P.lane('min-heap (given back)', st.h.map((v) => ({ id: `h${v}`, main: v })), 'smallest', '')]; },
  init2: (input) => ({ n: input.n }),
  naive(input) { const N = seats ? input.n : 60, used = Array(N + 2).fill(false), out = []; for (const [op, x] of input.ops) { if (op === 'reserve' || op === 'popSmallest') { let k = 1; while (used[k]) k++; used[k] = true; out.push(k); } else used[x] = false; } return out; },
  valid(ops, input) { const used = new Set(); for (const [op, x] of ops) { if (op === 'reserve' || op === 'popSmallest') { let k = 1; while (used.has(k)) k++; if (seats && k > input.n) return false; used.add(k); } else if (seats && !used.has(x)) return false; else used.delete(x); } return true; },
  random(g) { const n = g.int(3, 6), used = new Set(), ops = []; for (let k = 0; k < g.int(3, 9); k++) { if (g.bool(0.6) || !used.size) { let m = 1; while (used.has(m)) m++; if (seats && m > n) continue; used.add(m); ops.push([seats ? 'reserve' : 'popSmallest']); } else { const x = seats ? g.pick([...used]) : g.int(1, 6); used.delete(x); ops.push([seats ? 'unreserve' : 'addBack', x]); } } return seats ? { n, ops } : { ops }; },
});
DEF.infinite = lowDef(false);
DEF.seats = lowDef(true);
DEF.seats.init = (input) => ({ next: 1, h: [], n: input.n });

// ---- 2349: number containers
DEF.containers = {
  label: 'Number container system', example: { ops: [['find', 10], ['change', 2, 10], ['change', 1, 10], ['change', 3, 10], ['change', 5, 10], ['find', 10], ['change', 1, 20], ['find', 10]] },
  sig: { change: ['int', 'int'], find: ['int'] },
  code: [['map', 'at: index → number;  where: number → sorted set of indexes'], ['change', 'change(i, x): remove i from where[at[i]] (if any); at[i] = x; where[x].add(i);'], ['find', 'find(x): where[x] empty ? −1 : where[x].first()']],
  intro: 'Two maps that mirror each other: what number each index holds, and for each number the sorted set of indexes holding it. A change moves one index between two sets; find reads the smallest index of one set. With a TreeSet both are O(log n).',
  init: () => ({ at: new Map(), w: new Map() }),
  apply(st, [op, a, b]) {
    if (op === 'change') { const old = st.at.get(a); if (old !== undefined) { const s = st.w.get(old); s.splice(s.indexOf(a), 1); if (!s.length) st.w.delete(old); } st.at.set(a, b); if (!st.w.has(b)) st.w.set(b, []); st.w.get(b).push(a); st.w.get(b).sort((x, y) => x - y); return { kind: 'write', lines: ['change'], title: `change(${a}, ${b})`, text: `${old !== undefined ? `Index ${a} held ${old}: remove it from ${old}'s set. ` : ''}Put ${b} at index ${a} and add ${a} to ${b}'s set.`, hl: { n: b, i: a } }; }
    const s = st.w.get(a) ?? [], ret = s.length ? s[0] : -1;
    return { ret, kind: s.length ? 'read' : 'skip', lines: ['find'], title: `find(${a}) → ${ret}`, text: s.length ? `${a}'s sorted set is ${list(s)}: the first index is ${ret}.` : `No container holds ${a}.`, hl: { n: a, i: ret } };
  },
  view: (st, hl = {}) => [P.chips('index → number', [...st.at.entries()].sort((x, y) => x[0] - y[0]).map(([i, x]) => ({ key: i, text: `${i} → ${x}`, tone: i === hl.i && x === hl.n ? 'accent' : undefined })), 'empty'), ...[...st.w.entries()].sort((x, y) => x[0] - y[0]).map(([x, s]) => P.lane(`indexes holding ${x}`, s.map((i) => ({ id: `i${i}`, main: i, tone: x === hl.n && i === hl.i ? 'success' : undefined })), 'smallest', ''))],
  naive(input) { const at = new Map(), out = []; for (const [op, a, b] of input.ops) { if (op === 'change') at.set(a, b); else { const is = [...at.entries()].filter(([, x]) => x === a).map(([i]) => i); out.push(is.length ? Math.min(...is) : -1); } } return out; },
  valid: () => true,
  random(g) { return { ops: Array.from({ length: g.int(3, 9) }, () => (g.bool(0.6) ? ['change', g.int(1, 5), g.pick([10, 20])] : ['find', g.pick([10, 20])])) }; },
};

// ---- 2353: food ratings
DEF.food = {
  label: 'Food rating system', example: { foods: ['kimchi', 'miso', 'sushi', 'moussaka', 'ramen', 'bulgogi'], cuisines: ['korean', 'japanese', 'japanese', 'greek', 'japanese', 'korean'], ratings: [9, 12, 8, 15, 14, 7], ops: [['highest', 'korean'], ['highest', 'japanese'], ['change', 'sushi', 16], ['highest', 'japanese'], ['change', 'ramen', 16], ['highest', 'japanese']] }, extra: 'foods',
  sig: { change: ['word', 'int'], highest: ['word'] },
  code: [['map', 'food → (cuisine, rating);  cuisine → sorted set ordered by (−rating, name)'], ['change', 'change(f, r): remove f from its cuisine\'s set, update the rating, add it back'], ['high', 'highest(c): the first entry of c\'s set']],
  intro: 'For each cuisine keep its foods in a sorted set ordered by rating (high first), then name (A to Z), which is exactly the tie rule. A rating change is remove, update, re-add: O(log n). The highest-rated is the first entry. (A heap with lazy deletion works too.)',
  init: (input) => { const f = new Map(); input.foods.forEach((n, i) => f.set(n, { c: input.cuisines[i], r: input.ratings[i] })); return { f }; },
  apply(st, [op, a, b]) {
    if (op === 'change') { const e = st.f.get(a), old = e.r; e.r = b; return { kind: 'write', lines: ['change'], title: `change("${a}", ${b})`, text: `Take ${a} out of ${e.c}'s set (it was filed under ${old}), set its rating to ${b}, and put it back in its new place.`, hl: { c: e.c, f: a } }; }
    const sorted = [...st.f.entries()].filter(([, e]) => e.c === a).sort((x, y) => y[1].r - x[1].r || (x[0] < y[0] ? -1 : 1));
    const ret = sorted[0][0];
    return { ret, kind: 'read', lines: ['high'], title: `highest("${a}") → "${ret}"`, text: `The first entry of ${a}'s set: ${ret} (${sorted[0][1].r})${sorted[1] && sorted[1][1].r === sorted[0][1].r ? `, ahead of ${sorted[1][0]} on the name tie` : ''}.`, hl: { c: a, f: ret } };
  },
  view(st, hl = {}) { const cs = [...new Set([...st.f.values()].map((e) => e.c))].sort(); return cs.map((c) => P.lane(c, [...st.f.entries()].filter(([, e]) => e.c === c).sort((x, y) => y[1].r - x[1].r || (x[0] < y[0] ? -1 : 1)).map(([n, e]) => ({ id: n, main: n, sub: String(e.r), tone: n === hl.f ? 'accent' : undefined })), 'best', '')); },
  naive(input) { const r = new Map(input.foods.map((n, i) => [n, input.ratings[i]])), out = []; for (const [op, a, b] of input.ops) { if (op === 'change') r.set(a, b); else { let best = null; input.foods.forEach((n, i) => { if (input.cuisines[i] !== a) return; if (!best || r.get(n) > r.get(best) || (r.get(n) === r.get(best) && n < best)) best = n; }); out.push(best); } } return out; },
  valid: (ops, input) => ops.every(([op, a]) => (op === 'change' ? input.foods.includes(a) : input.cuisines.includes(a))),
  random(g) { const foods = ['ant', 'bee', 'cat', 'dog', 'elk'].slice(0, g.int(2, 5)); const cuisines = foods.map(() => g.pick(['x', 'y'])); const ratings = foods.map(() => g.int(1, 9)); return { foods, cuisines, ratings, ops: Array.from({ length: g.int(2, 7) }, () => (g.bool(0.5) ? ['change', g.pick(foods), g.int(1, 9)] : ['highest', g.pick(cuisines)])) }; },
};

// ---- 855: exam room
function examPick(t, n) { let best = -1, bd = -1; for (let k = 0; k < n; k++) { if (t.has(k)) continue; const d = t.size ? Math.min(...[...t].map((x) => Math.abs(x - k))) : Infinity; if (d > bd) { bd = d; best = k; } } return best; }
DEF.exam = {
  label: 'Exam room', example: { n: 10, ops: [['seat'], ['seat'], ['seat'], ['seat'], ['leave', 4], ['seat']] }, extra: 'n',
  sig: { seat: [], leave: ['int'] },
  code: [['set', 'keep the taken seats in a sorted set'], ['gap', 'seat(): candidates: seat 0 (distance = first taken), the middle of each gap between neighbours ((b − a) / 2), seat n − 1 (distance = n − 1 − last)'], ['pick', '  take the largest distance, the lowest seat on a tie'], ['leave', 'leave(p): remove p from the set']],
  intro: 'Only the gaps between neighbouring students matter. The best seat in a gap between a and b is its middle, at distance (b − a) / 2; the two ends of the row are special (distance to the first or last student). Check every gap and take the biggest, lowest seat on ties. With a sorted set that is O(n) per seat (O(log n) with a heap of gaps).',
  init: (input) => ({ n: input.n, s: [] }),
  apply(st, [op, p]) {
    if (op === 'leave') { st.s.splice(st.s.indexOf(p), 1); return { kind: 'pop', lines: ['leave'], title: `leave(${p})`, text: `Seat ${p} is free again; the two gaps around it merge into one.`, hl: { p } }; }
    const n = st.n, s = st.s;
    if (!s.length) { s.push(0); return { ret: 0, kind: 'take', lines: ['gap', 'pick'], title: 'seat() → 0 (the room is empty)', text: 'Nobody is in the room: by the rule, sit at seat 0.', hl: { p: 0 } }; }
    const cands = [{ p: 0, d: s[0], why: `seat 0, ${s[0]} from seat ${s[0]}` }];
    for (let k = 0; k + 1 < s.length; k++) { const a = s[k], b = s[k + 1], m = a + ((b - a) >> 1); cands.push({ p: m, d: m - a, why: `middle of ${a}..${b}: seat ${m}, distance ${m - a}`, gap: [a, b] }); }
    cands.push({ p: n - 1, d: n - 1 - s.at(-1), why: `seat ${n - 1}, ${n - 1 - s.at(-1)} from seat ${s.at(-1)}` });
    const ok = cands.filter((c) => !s.includes(c.p));
    const best = ok.reduce((x, y) => (y.d > x.d || (y.d === x.d && y.p < x.p) ? y : x));
    s.push(best.p); s.sort((x, y) => x - y);
    return { ret: best.p, kind: 'take', lines: ['gap', 'pick'], title: `seat() → ${best.p}`, text: `Candidates: ${ok.map((c) => c.why).join('; ')}. The largest distance is ${best.d}; seat ${best.p}.`, hl: { p: best.p, gap: best.gap } };
  },
  view(st, hl = {}) { const s = P.strip('seats', Array.from({ length: st.n }, (_, k) => (st.s.includes(k) ? '●' : '·'))); st.s.forEach((p) => { s.cls[p] = 'hit'; }); if (hl.p !== undefined) s.cls[hl.p] = `${s.cls[hl.p] ?? ''} cur`; if (hl.gap) s.bands = [{ from: hl.gap[0], to: hl.gap[1], tone: 'accent', label: 'widest gap' }]; return [s]; },
  naive(input) { const taken = new Set(), out = []; for (const [op, p] of input.ops) { if (op === 'leave') { taken.delete(p); continue; } const best = examPick(taken, input.n); taken.add(best); out.push(best); } return out; },
  valid(ops, input) { const t = new Set(); for (const [op, p] of ops) { if (op === 'leave') { if (!t.has(p)) return false; t.delete(p); } else { if (t.size >= input.n) return false; t.add(examPick(t, input.n)); } } return true; },
  random(g) { const n = g.int(3, 10), ops = [], t = new Set(); for (let k = 0; k < g.int(2, 8); k++) { if (t.size && (g.bool(0.3) || t.size === n)) { const p = g.pick([...t]); t.delete(p); ops.push(['leave', p]); } else { t.add(examPick(t, n)); ops.push(['seat']); } } return { n, ops }; },
};

// ---- 933: number of recent calls
DEF.recent = {
  label: 'Number of recent calls', example: { ops: [['ping', 1], ['ping', 100], ['ping', 3001], ['ping', 3002]] },
  sig: { ping: ['int'] },
  code: [['add', 'ping(t): q.add(t);'], ['drop', 'while (q.peek() < t − 3000) q.poll();     // too old for this and every later ping'], ['ret', 'return q.size();']],
  intro: 'Times only increase, so a request that is too old for this ping is too old for every later one. Keep the recent times in a queue: add at the back, drop expired ones from the front. Each time is added and removed once.',
  init: () => ({ q: [] }),
  apply(st, [, t]) { st.q.push(t); const gone = []; while (st.q[0] < t - 3000) gone.push(st.q.shift()); return { ret: st.q.length, kind: gone.length ? 'pop' : 'push', lines: ['add', 'drop', 'ret'], title: `ping(${t}) → ${st.q.length}`, text: `The window is [${t - 3000}, ${t}]. ${gone.length ? `${list(gone)} ${gone.length === 1 ? 'is' : 'are'} older than ${t - 3000}: drop from the front.` : 'Nothing has expired.'} ${st.q.length} request${st.q.length === 1 ? '' : 's'} remain.` }; },
  view: (st) => [P.lane('recent pings', st.q.map((t) => ({ id: `t${t}`, main: t })), 'oldest', 'newest')],
  naive(input) { const all = [], out = []; for (const [, t] of input.ops) { all.push(t); out.push(all.filter((x) => x >= t - 3000).length); } return out; },
  valid(ops) { let last = 0; for (const [, t] of ops) { if (t <= last) return false; last = t; } return true; },
  random(g) { let t = 0; return { ops: Array.from({ length: g.int(2, 7) }, () => { t += g.int(1, 2500); return ['ping', t]; }) }; },
};

// ---- 1670: front middle back queue
DEF.fmb = {
  label: 'Front middle back queue', example: { ops: [['pushFront', 1], ['pushBack', 2], ['pushMiddle', 3], ['pushMiddle', 4], ['popFront'], ['popMiddle'], ['popMiddle'], ['popBack'], ['popFront']] },
  sig: { pushFront: ['int'], pushMiddle: ['int'], pushBack: ['int'], popFront: [], popMiddle: [], popBack: [] },
  code: [['halves', 'two deques: front half L, back half R, with |R| == |L| or |L| + 1'], ['op', 'push / pop at the outer ends of L and R, or at the seam for the middle'], ['fix', 'rebalance: move one element across the seam if the sizes drift']],
  intro: 'Split the queue into a front half and a back half, each a deque, and keep the back half equal in size or one longer. Then the front and back are the outer ends, and the middle is always at the seam: pushMiddle goes to the front of the back half, popMiddle takes the end of the front half (even size) or the front of the back half (odd). One move across the seam keeps the balance.',
  init: () => ({ L: [], R: [], uid: 0 }),
  apply(st, [op, x]) {
    const fix = () => { if (st.L.length > st.R.length) st.R.unshift(st.L.pop()); else if (st.R.length > st.L.length + 1) st.L.push(st.R.shift()); };
    const n = st.L.length + st.R.length;
    if (op.startsWith('push')) {
      const it = { id: st.uid++, v: x };
      if (op === 'pushFront') st.L.unshift(it); else if (op === 'pushBack') st.R.push(it); else { if (st.L.length === st.R.length) st.R.unshift(it); else st.L.push(it); }
      fix();
      return { kind: 'push', lines: ['op', 'fix'], title: `${op}(${x})`, text: op === 'pushMiddle' ? `The middle is at the seam: ${x} goes ${st.L.at(-1)?.id === it.id ? 'at the end of the front half' : 'at the start of the back half'}, then the halves are rebalanced.` : `${op === 'pushFront' ? 'Add to the front of the front half' : 'Add to the back of the back half'}, then rebalance so the back half is equal or one longer.`, hl: { id: it.id } };
    }
    if (!n) return { ret: -1, kind: 'skip', lines: ['op'], title: `${op}() → −1`, text: 'The queue is empty, so return −1.' };
    let it;
    if (op === 'popFront') it = st.L.length ? st.L.shift() : st.R.shift();
    else if (op === 'popBack') it = st.R.pop();
    else it = st.L.length === st.R.length ? st.L.pop() : st.R.shift();
    fix();
    return { ret: it.v, kind: 'pop', lines: ['op', 'fix'], title: `${op}() → ${it.v}`, text: op === 'popMiddle' ? `With ${n} elements the middle (closer to the front) is ${n % 2 ? 'the first of the back half' : 'the last of the front half'}: ${it.v}.` : `Take ${it.v} from the ${op === 'popFront' ? 'front' : 'back'}, then rebalance.` };
  },
  view: (st, hl = {}) => [P.lane('front half', st.L.map((n) => ({ id: n.id, main: n.v, tone: n.id === hl.id ? 'accent' : undefined })), 'front', 'seam'), P.lane('back half', st.R.map((n) => ({ id: n.id, main: n.v, tone: n.id === hl.id ? 'accent' : undefined })), 'seam', 'back')],
  naive(input) { const a = [], out = []; for (const [op, x] of input.ops) { if (op === 'pushFront') a.unshift(x); else if (op === 'pushBack') a.push(x); else if (op === 'pushMiddle') a.splice(a.length >> 1, 0, x); else if (!a.length) out.push(-1); else if (op === 'popFront') out.push(a.shift()); else if (op === 'popBack') out.push(a.pop()); else out.push(a.splice((a.length - 1) >> 1, 1)[0]); } return out; },
  valid: () => true,
  random(g) { return { ops: Array.from({ length: g.int(3, 10) }, () => { const op = g.pick(['pushFront', 'pushMiddle', 'pushBack', 'popFront', 'popMiddle', 'popBack']); return op.startsWith('push') ? [op, g.int(1, 9)] : [op]; }) }; },
};

// ---- 1756: MRU queue
DEF.mru = {
  label: 'Most recently used queue', example: { n: 8, ops: [['fetch', 3], ['fetch', 5], ['fetch', 2], ['fetch', 8]] }, extra: 'n',
  sig: { fetch: ['int'] },
  code: [['find', 'fetch(k): x = the k-th element'], ['move', 'remove it and append it at the end;  return x'], ['fast', 'O(n) with a plain list; √n blocks or a Fenwick tree over slots make it faster']],
  intro: 'The simple version is a list: find the k-th element, remove it, append it. That is O(n) per fetch, which is fine for small n. Faster versions split the list into √n blocks, or give every fetch a fresh slot at the end and use a Fenwick tree to find the k-th live slot.',
  init: (input) => ({ q: Array.from({ length: input.n }, (_, k) => ({ id: k + 1, v: k + 1 })) }),
  apply(st, [, k]) { const [it] = st.q.splice(k - 1, 1); st.q.push(it); return { ret: it.v, kind: 'move', lines: ['find', 'move'], title: `fetch(${k}) → ${it.v}`, text: `The ${k}${k === 1 ? 'st' : k === 2 ? 'nd' : k === 3 ? 'rd' : 'th'} element is ${it.v}. It moves to the end, so everything after it shifts one place left.`, hl: { id: it.id } }; },
  view(st, hl = {}) { const s = P.strip('queue', st.q.map((n) => ({ v: n.v, id: n.id })), { index: st.q.map((_, k) => String(k + 1)) }); const at = st.q.findIndex((n) => n.id === hl.id); if (at >= 0) s.cls[at] = 'cur'; return [s]; },
  naive(input) { const q = Array.from({ length: input.n }, (_, k) => k + 1); return input.ops.map(([, k]) => { const [x] = q.splice(k - 1, 1); q.push(x); return x; }); },
  valid: (ops, input) => ops.every(([, k]) => k >= 1 && k <= input.n),
  random(g) { const n = g.int(2, 8); return { n, ops: Array.from({ length: g.int(1, 5) }, () => ['fetch', g.int(1, n)]) }; },
};

// ---- ride sharing
DEF.rides = {
  label: 'Ride sharing system', example: { ops: [['addRider', 3], ['addDriver', 2], ['addRider', 1], ['match'], ['addDriver', 5], ['cancel', 3], ['match'], ['match']] },
  sig: { addRider: ['int'], addDriver: ['int'], match: [], cancel: ['int'] },
  code: [['queues', 'riders and drivers: insertion-ordered sets (LinkedHashSet) — arrival order + O(1) removal'], ['match', 'match(): if both non-empty, take the first of each'], ['cancel', 'cancel(r): riders.remove(r)     // nothing if already matched']],
  intro: 'Two waiting lines, matched front to front. Riders can also cancel from the middle of their line, so a plain queue isn\'t enough: an insertion-ordered set (LinkedHashSet) keeps arrival order and removes any id in O(1). (Or: a queue plus a "cancelled" set, skipping cancelled riders when they reach the front.)',
  init: () => ({ r: [], d: [] }),
  apply(st, [op, x]) {
    if (op === 'addRider') { st.r.push(x); return { kind: 'push', lines: ['queues'], title: `rider ${x} waits`, text: `Rider ${x} joins the back of the riders' line.` }; }
    if (op === 'addDriver') { st.d.push(x); return { kind: 'push', lines: ['queues'], title: `driver ${x} waits`, text: `Driver ${x} joins the back of the drivers' line.` }; }
    if (op === 'cancel') { const i = st.r.indexOf(x); if (i >= 0) st.r.splice(i, 1); return { kind: i >= 0 ? 'pop' : 'skip', lines: ['cancel'], title: `cancel rider ${x}${i >= 0 ? '' : ': not waiting'}`, text: i >= 0 ? `Remove rider ${x} from the middle of the line in O(1) with the linked set.` : `Rider ${x} isn't waiting (already matched or never added): nothing happens.` }; }
    if (!st.r.length || !st.d.length) return { ret: [-1, -1], kind: 'skip', lines: ['match'], title: 'match() → [−1, −1]', text: `No ${!st.d.length ? 'driver' : 'rider'} is waiting, so there is no match: [−1, −1].` };
    const d = st.d.shift(), r = st.r.shift();
    return { ret: [d, r], kind: 'take', lines: ['match'], title: `match() → [${d}, ${r}]`, text: `The longest-waiting driver (${d}) takes the longest-waiting rider (${r}).` };
  },
  view: (st) => [P.lane('riders', st.r.map((x) => ({ id: `r${x}`, main: x, tone: 'accent' })), 'first', 'last'), P.lane('drivers', st.d.map((x) => ({ id: `d${x}`, main: x, tone: 'note' })), 'first', 'last')],
  naive(input) { const r = [], d = [], out = []; for (const [op, x] of input.ops) { if (op === 'addRider') r.push(x); else if (op === 'addDriver') d.push(x); else if (op === 'cancel') { const i = r.indexOf(x); if (i >= 0) r.splice(i, 1); } else out.push(r.length && d.length ? [d.shift(), r.shift()] : [-1, -1]); } return out; },
  valid(ops) { const seen = new Set(); for (const [op, x] of ops) if (op === 'addRider' || op === 'addDriver') { const k = `${op}${x}`; if (seen.has(k)) return false; seen.add(k); } return true; },
  random(g) { let rid = 1, did = 1; return { ops: Array.from({ length: g.int(3, 9) }, () => { const r = g.int(0, 3); return r === 0 ? ['addRider', rid++] : r === 1 ? ['addDriver', did++] : r === 2 ? ['match'] : ['cancel', g.int(1, Math.max(1, rid - 1))]; }) }; },
};

// ---- 1188: bounded blocking queue (one thread)
DEF.blocking = {
  label: 'Bounded blocking queue', example: { cap: 2, ops: [['enqueue', 1], ['dequeue'], ['enqueue', 0], ['enqueue', 2], ['size'], ['dequeue'], ['enqueue', 3], ['size']] }, extra: 'cap',
  sig: { enqueue: ['int'], dequeue: [], size: [] },
  code: [['lock', 'one lock, two conditions: notFull, notEmpty'], ['enq', 'enqueue(x): lock; while (size == cap) notFull.await(); add x; notEmpty.signal(); unlock'], ['deq', 'dequeue(): lock; while (size == 0) notEmpty.await(); x = remove front; notFull.signal(); unlock'], ['size', 'size(): lock; read; unlock']],
  intro: 'A queue guarded by one lock. A producer that finds it full waits on "notFull"; a consumer that finds it empty waits on "notEmpty". Each successful operation signals the other side. Always re-check the condition in a while loop after waking: another thread may have got there first. (Here the calls run one at a time, so nobody actually waits.)',
  init: (input) => ({ cap: input.cap, q: [], uid: 0 }),
  apply(st, [op, x]) {
    if (op === 'enqueue') { st.q.push({ id: st.uid++, v: x }); return { kind: 'push', lines: ['lock', 'enq'], title: `enqueue(${x}): ${st.q.length} / ${st.cap}`, text: `Room available, so add ${x} and signal notEmpty, waking a waiting consumer if there is one.${st.q.length === st.cap ? ' The queue is now full: the next producer would wait.' : ''}` }; }
    if (op === 'size') return { ret: st.q.length, kind: 'read', lines: ['size'], title: `size() → ${st.q.length}`, text: 'Read under the lock so the value is consistent.' };
    const it = st.q.shift();
    return { ret: it.v, kind: 'pop', lines: ['lock', 'deq'], title: `dequeue() → ${it.v}`, text: `Take ${it.v} from the front and signal notFull, waking a waiting producer if there is one.${!st.q.length ? ' The queue is now empty: the next consumer would wait.' : ''}` };
  },
  view: (st) => [P.lane(`buffer (capacity ${st.cap})`, [...st.q.map((n) => ({ id: n.id, main: n.v })), ...Array.from({ length: st.cap - st.q.length }, (_, k) => ({ id: `e${k}`, main: '·', tone: 'muted' }))], 'front', 'back')],
  naive(input) { const q = [], out = []; for (const [op, x] of input.ops) { if (op === 'enqueue') q.push(x); else if (op === 'size') out.push(q.length); else out.push(q.shift()); } return out; },
  valid(ops, input) { let n = 0; for (const [op] of ops) { if (op === 'enqueue') { if (n === input.cap) return false; n++; } else if (op === 'dequeue') { if (!n) return false; n--; } } return true; },
  random(g) { const cap = g.int(1, 3), ops = []; let n = 0; for (let k = 0; k < g.int(2, 8); k++) { const r = g.int(0, 2); if (r === 0 && n < cap) { ops.push(['enqueue', g.int(0, 9)]); n++; } else if (r === 1 && n) { ops.push(['dequeue']); n--; } else ops.push(['size']); } return { cap, ops }; },
};

// ---------------------------------------------------------------- one-off simulations

const SIM = {};

// ---- 341: flatten nested list iterator
const parseNested = (t) => { try { const v = JSON.parse(String(t ?? '')); const ok = (x, d) => (Number.isInteger(x) ? Math.abs(x) <= 99 : Array.isArray(x) && d < 4 && x.every((y) => ok(y, d + 1))); return Array.isArray(v) && ok(v, 0) ? v : null; } catch { return null; } };
const flat = (x) => (Array.isArray(x) ? x.flatMap(flat) : [x]);
SIM.flatten = {
  label: 'Flatten nested list iterator', example: { nested: '[[1,1],2,[1,[4,[6]]]]' },
  code: [['init', 'stack = the top-level elements, first one on top'], ['expand', 'hasNext(): while the top is a list: pop it, push its elements (first one on top)'], ['has', '  return !stack.isEmpty();          // the top is now an integer'], ['next', 'next(): hasNext(); return stack.pop().getInteger();']],
  run(input, snap) {
    const L = JSON.parse(input.nested);
    let uid = 0;
    const stack = [...L].reverse().map((x) => ({ id: uid++, x }));
    const out = [];
    const txt = (x) => (Array.isArray(x) ? JSON.stringify(x) : String(x));
    const view = (hot = null) => [P.pile('stack (top = next)', stack.map((n) => ({ id: n.id, main: txt(n.x), tone: n.id === hot ? 'accent' : Array.isArray(n.x) ? 'warn' : undefined }))), P.chips('returned', out.map((v, k) => ({ key: k, text: String(v), tone: 'success' })), 'nothing yet')];
    snap({ kind: 'start', lines: ['init'], parts: view(), title: `Iterate ${input.nested}`, text: 'Flattening everything up front works, but an iterator should do little work per call. Keep a stack of elements still to visit, the next one on top. hasNext() opens lists on top until an integer is on top; next() pops it. Every list is opened exactly once.', calc: [`${L.length} top-level elements`] });
    for (;;) {
      while (stack.length && Array.isArray(stack.at(-1).x)) {
        const top = stack.pop();
        const kids = [...top.x].reverse().map((x) => ({ id: uid++, x }));
        stack.push(...kids);
        snap({ kind: 'move', lines: ['expand'], parts: view(kids.at(-1)?.id), call: { q: 'hasNext()', a: '(opening a list)', tone: 'warn' }, title: `Open ${txt(top.x)}`, text: top.x.length ? `The top is a list, not an integer: pop it and push its ${top.x.length} element${top.x.length === 1 ? '' : 's'} so the first is on top.` : 'An empty list: pop it, it holds nothing.', calc: [`stack size ${stack.length}`] });
      }
      if (!stack.length) break;
      const v = stack.pop().x; out.push(v);
      snap({ kind: 'pop', lines: ['has', 'next'], parts: view(), call: { q: 'next()', a: `→ ${v}`, tone: 'success' }, title: `next() → ${v}`, text: 'The top is an integer, so hasNext() is true and next() pops it.', calc: [`returned ${out.length}`] });
    }
    snap({ kind: 'done', lines: ['has'], parts: view(), call: { q: 'hasNext()', a: '→ false', tone: 'danger' }, out, answer: list(out), title: `Done: ${list(out)}`, text: 'The stack is empty, so hasNext() is false. Each element was pushed and popped once: O(1) per call on average.', calc: [list(out)] });
  },
  naive: (input) => flat(JSON.parse(input.nested)),
  random(g) { const mk = (d) => Array.from({ length: g.int(0, 3) }, () => (d < 2 && g.bool(0.35) ? mk(d + 1) : g.int(1, 9))); for (;;) { const v = mk(0); if (flat(v).length <= 8) return { nested: JSON.stringify(v) }; } },
};

// ---- 2073: time needed to buy tickets
SIM.tickets = {
  label: 'Time needed to buy tickets', example: { tickets: [2, 3, 2], k: 2 },
  code: [['each', 'for each person i:'], ['before', '    i ≤ k: buys min(tickets[i], tickets[k]) times before k is done'], ['after', '    i > k: buys min(tickets[i], tickets[k] − 1) times     // k finishes before their last turn'], ['ans', 'return the sum;']],
  run(input, snap) {
    const t = input.tickets, k = input.k, n = t.length;
    let total = 0; const c = {};
    const view = (i = null) => { const s = P.strip('tickets', t); s.tags[k] = [{ label: 'k', tone: 'accent' }]; Object.entries(c).forEach(([j, v]) => { s.sub[j] = { text: `${v}s`, tone: 'success' }; }); if (i !== null) s.cls[i] = 'cur'; return [s, P.chips('total', [{ key: 't', text: `${total} s`, tone: 'success' }])]; };
    snap({ kind: 'start', lines: [], parts: view(), title: `Person ${k} wants ${t[k]} ticket${t[k] === 1 ? '' : 's'}`, text: `Simulating the line is O(n · max tickets). Instead count, for each person, how many tickets they buy before person ${k} finishes. Everyone gets one ticket per round. Person ${k} needs ${t[k]} rounds; in the last round, only the people in front of ${k} (and ${k}) get to buy.`, calc: [`n = ${n}`] });
    for (let i = 0; i < n; i++) {
      const v = i <= k ? Math.min(t[i], t[k]) : Math.min(t[i], t[k] - 1);
      c[i] = v; total += v;
      snap({ kind: 'add', lines: ['each', i <= k ? 'before' : 'after'], parts: view(i), title: `Person ${i}: ${v} second${v === 1 ? '' : 's'}`, text: i <= k ? `Person ${i} is ${i === k ? 'person k' : `ahead of person ${k}`}, so they buy in each of ${k}'s ${t[k]} rounds, until their own ${t[i]} run out: min(${t[i]}, ${t[k]}) = ${v}.` : `Person ${i} stands behind ${k}, so in ${k}'s last round ${k} finishes first: at most ${t[k] - 1} rounds, capped by their own ${t[i]}: ${v}.`, calc: [`total = ${total}`] });
    }
    snap({ kind: 'done', lines: ['ans'], parts: view(), out: total, answer: `${total}`, title: `${total} seconds`, text: 'One pass over the line with a formula per person: O(n), no simulation.', calc: [`= ${total}`] });
  },
  naive(input) { const q = input.tickets.map((v, i) => [v, i]); let s = 0; for (;;) { const [v, i] = q.shift(); s++; if (v - 1 === 0) { if (i === input.k) return s; } else q.push([v - 1, i]); } },
  random(g) { const t = Array.from({ length: g.int(1, 7) }, () => g.int(1, 5)); return { tickets: t, k: g.int(0, t.length - 1) }; },
};

// ---- 1700: students unable to eat lunch
SIM.lunch = {
  label: 'Students unable to eat lunch', example: { students: [1, 1, 1, 0, 0, 1], sandwiches: [1, 0, 0, 0, 1, 1] },
  code: [['count', 'count how many students want 0 and how many want 1'], ['top', 'for each sandwich from the top: if someone wants it, count[it]--'], ['stop', '  else stop: nobody will ever take it'], ['ans', 'return the students left']],
  run(input, snap) {
    const sw = input.sandwiches, cnt = [0, 0];
    input.students.forEach((x) => cnt[x]++);
    let i = 0;
    const view = (cur = null, bad = false) => { const s = P.strip('sandwiches (top first)', sw.map((x) => (x ? '■' : '●'))); sw.forEach((_, k) => { if (k < i) s.cls[k] = 'dim'; }); if (cur !== null) s.cls[cur] = bad ? 'bad' : 'cur'; return [s, P.chips('students waiting', [{ key: 0, text: `want ● : ${cnt[0]}`, tone: 'accent' }, { key: 1, text: `want ■ : ${cnt[1]}`, tone: 'note' }])]; };
    snap({ kind: 'start', lines: ['count'], parts: view(), title: `${input.students.length} students, ${sw.length} sandwiches`, text: 'The queue keeps rotating, so a student who wants the top sandwich will reach the front eventually. The order of the students doesn\'t matter, only how many want each kind. The process stops only when nobody left wants the top sandwich.', calc: [`want ●: ${cnt[0]}, want ■: ${cnt[1]}`] });
    for (; i < sw.length; i++) {
      const x = sw[i];
      if (!cnt[x]) { snap({ kind: 'fail', lines: ['top', 'stop'], parts: view(i, true), title: `Nobody wants ${x ? '■' : '●'}: stop`, text: `All ${cnt[0] + cnt[1]} remaining students want ${x ? '●' : '■'}. The queue will rotate forever without anyone taking this sandwich, and the ones below it can't be reached.`, calc: [`left: ${cnt[0] + cnt[1]}`] }); break; }
      cnt[x]--;
      snap({ kind: 'take', lines: ['top'], parts: view(i), title: `${x ? '■' : '●'} is taken`, text: `Someone still wants ${x ? 'a square' : 'a circular'} sandwich; after enough rotations they reach the front and take it.`, calc: [`want ${x ? '■' : '●'}: ${cnt[x]}`] });
    }
    const left = cnt[0] + cnt[1];
    snap({ kind: 'done', lines: ['ans'], parts: view(), out: left, answer: `${left}`, title: `${left} student${left === 1 ? '' : 's'} can't eat`, text: 'O(n) with two counters, instead of simulating the rotations.', calc: [`= ${left}`] });
  },
  naive(input) { const q = [...input.students], s = [...input.sandwiches]; let spins = 0; while (q.length && spins < q.length) { if (q[0] === s[0]) { q.shift(); s.shift(); spins = 0; } else { q.push(q.shift()); spins++; } } return q.length; },
  random(g) { const n = g.int(1, 7); return { students: Array.from({ length: n }, () => g.int(0, 1)), sandwiches: Array.from({ length: n }, () => g.int(0, 1)) }; },
};

// ---- 2327: people aware of a secret
SIM.secret = {
  label: 'People aware of a secret', example: { n: 6, delay: 2, forget: 4 },
  code: [['base', 'learn[1] = 1;'], ['day', 'learn[d] = Σ learn[j] for d − forget < j ≤ d − delay     // everyone who shares today'], ['ans', 'answer = Σ learn[j] for j > n − forget     // still remember at the end of day n']],
  run(input, snap) {
    const { n, delay, forget } = input;
    const learn = Array(n + 1).fill(null);
    learn[1] = 1;
    const view = (d = null, band = null) => { const s = P.strip('new people', learn.slice(1).map((v) => (v === null ? '' : v)), { index: Array.from({ length: n }, (_, k) => `day ${k + 1}`) }); learn.slice(1).forEach((v, k) => { if (v === null) s.cls[k] = 'muted'; }); if (d !== null) s.cls[d - 1] = 'cur'; if (band) s.bands = [band]; return [s]; };
    snap({ kind: 'start', lines: ['base'], parts: view(), title: `n = ${n}, delay ${delay}, forget ${forget}`, text: 'Track people by the day they learned the secret, not one by one. Someone who learned on day j shares on days j + delay … j + forget − 1. So the number who learn on day d is the total of learn[j] for j in that window looking back from d. One person learns on day 1.', calc: ['learn[1] = 1'] });
    for (let d = 2; d <= n; d++) {
      const lo = Math.max(1, d - forget + 1), hi = d - delay;
      let s = 0; for (let j = lo; j <= hi; j++) s += learn[j];
      learn[d] = s;
      snap({ kind: s ? 'add' : 'skip', lines: ['day'], parts: view(d, hi >= lo ? { from: lo - 1, to: hi - 1, tone: 'accent', label: 'sharing' } : null), title: `Day ${d}: ${s} new`, text: hi >= lo ? `People who learned on days ${lo}..${hi} share today (they learned at least ${delay} days ago and haven't forgotten yet): ${s} new people.` : `Nobody has known the secret for ${delay} days yet.`, calc: [`learn[${d}] = ${s}`] });
    }
    let ans = 0; const lo = Math.max(1, n - forget + 1);
    for (let j = lo; j <= n; j++) ans += learn[j];
    snap({ kind: 'done', lines: ['ans'], parts: view(null, { from: lo - 1, to: n - 1, tone: 'success', label: 'still remember' }), out: ans, answer: `${ans}`, title: `${ans} people know it at the end of day ${n}`, text: `Those who learned on days ${lo}..${n} haven't forgotten. O(n · forget), or O(n) with a running window sum; take everything modulo 10⁹ + 7.`, calc: [`= ${ans}`] });
  },
  naive(input) { let people = [1]; for (let d = 2; d <= input.n; d++) { const share = people.filter((j) => d - j >= input.delay && d - j < input.forget).length; people = people.filter((j) => d - j < input.forget); for (let k = 0; k < share; k++) people.push(d); } return people.length; },
  random(g) { const forget = g.int(2, 5); return { n: g.int(1, 10), delay: g.int(1, forget - 1), forget }; },
};

// ---------------------------------------------------------------- the engine

export const DESIGN_WALK = Object.fromEntries([...Object.entries(DEF), ...Object.entries(SIM)].map(([mode, d]) => [mode, { label: d.label, input: { mode, ...d.example } }]));
Object.assign(DESIGN_WALK, {
  hashmapCollide: { label: 'Keys that share a bucket', input: { mode: 'hashmap', ops: [['put', 3, 30], ['put', 8, 80], ['put', 13, 1], ['get', 8], ['remove', 3], ['get', 13], ['get', 3]] } },
  lfuTie: { label: 'LFU: a tie broken by recency', input: { mode: 'lfu', cap: 2, ops: [['put', 1, 1], ['put', 2, 2], ['put', 3, 3], ['get', 2], ['get', 3]] } },
  lunchAll: { label: 'Lunch: everyone eats', input: { mode: 'lunch', students: [1, 1, 0, 0], sandwiches: [0, 1, 0, 1] } },
});

export const designWalkCode = (mode) => (DEF[mode] ?? SIM[mode]).code;

export function designWalkAnswer(input) { return (DEF[input.mode] ?? SIM[input.mode]).naive(input); }

/** Does a run's output match the naive one? (getRandom only has to return a member.) */
export function designWalkCheck(input, out) {
  const want = designWalkAnswer(input);
  if (!Array.isArray(want)) return JSON.stringify(out) === JSON.stringify(want);
  if (SIM[input.mode]) return JSON.stringify(out) === JSON.stringify(want);
  return out.length === want.length && want.every((w, k) => (w && w.any ? w.any.includes(out[k]) : JSON.stringify(w) === JSON.stringify(out[k])));
}

export function designWalk(input) {
  const { mode } = input;
  const steps = [];
  const snap = (x) => steps.push({ mode, parts: [], call: null, ...x });
  if (SIM[mode]) { SIM[mode].run(input, snap); return steps; }
  const d = DEF[mode];
  const st = d.init(input);
  const outs = [];
  snap({ kind: 'start', lines: [], parts: d.view(st, {}), title: d.label, text: d.intro, calc: [`${input.ops.length} call${input.ops.length === 1 ? '' : 's'}`] });
  for (const op of input.ops) {
    const r = d.apply(st, op);
    if (r.ret !== undefined) outs.push(r.ret);
    snap({ kind: r.kind, lines: r.lines, parts: d.view(st, r.hl ?? {}), call: { q: callText(op), a: r.ret === undefined ? 'no return value' : `→ ${show(r.ret)}`, tone: r.kind === 'skip' || r.kind === 'fail' ? 'warn' : r.ret === undefined ? 'accent' : 'success' }, title: r.title, text: r.text, calc: [r.ret === undefined ? 'no return value' : `returns ${show(r.ret)}`] });
  }
  snap({ kind: 'done', lines: [], parts: d.view(st, {}), out: outs, answer: outs.length ? list(outs.map(show)) : 'done', title: outs.length ? `Returned ${list(outs.map(show))}` : 'All calls done', text: 'Every call touched only the part of the structure it needed, which is what keeps each one cheap.', calc: [`${outs.length} returned value${outs.length === 1 ? '' : 's'}`] });
  return steps;
}

// ---------------------------------------------------------------- inputs

const isInt = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi;
const intsOf = (t) => String(t ?? '').replace(/[[\]]/g, ' ').split(/[\s,]+/).filter(Boolean).map(Number);
const wordsOf = (t) => String(t ?? '').split(/[\s,]+/).filter(Boolean);

export function parseOps(text, sig) {
  const ops = [];
  for (const part of String(text ?? '').split(/[,;]/).map((x) => x.trim()).filter(Boolean)) {
    const [name, ...args] = part.split(/\s+/);
    const want = sig[name];
    if (!want) return { error: `Unknown call "${name}". Use: ${Object.keys(sig).join(', ')}.` };
    if (args.length !== want.length) return { error: `${name} takes ${want.length} argument${want.length === 1 ? '' : 's'}.` };
    const vals = [];
    for (let k = 0; k < want.length; k++) {
      if (want[k] === 'int') { const v = Number(args[k]); if (!isInt(v, -9999, 99999)) return { error: `${name}: "${args[k]}" should be a whole number.` }; vals.push(v); } else { if (!/^[a-z][a-z0-9]{0,7}$/.test(args[k])) return { error: `${name}: "${args[k]}" should be a short lower-case word.` }; vals.push(args[k]); }
    }
    ops.push([name, ...vals]);
  }
  if (!ops.length || ops.length > 10) return { error: 'Give 1 to 10 calls, separated by commas.' };
  return { ops };
}

export function parseDesignWalk(values, input) {
  const { mode } = input;
  if (mode === 'flatten') { const v = parseNested(values.nested); return v && flat(v).length >= 0 && flat(v).length <= 8 ? { input: { mode, nested: JSON.stringify(v) } } : { error: 'A nested list like [[1,1],2,[1,[4,[6]]]] with at most 8 integers.' }; }
  if (mode === 'tickets') { const t = intsOf(values.tickets), k = Number(values.k); return t.length && t.length <= 8 && t.every((x) => isInt(x, 1, 6)) && isInt(k, 0, t.length - 1) ? { input: { mode, tickets: t, k } } : { error: '1 to 8 ticket counts from 1 to 6, and k a valid position (from 0).' }; }
  if (mode === 'lunch') { const a = intsOf(values.students), b = intsOf(values.sandwiches); return a.length && a.length <= 8 && a.length === b.length && [...a, ...b].every((x) => x === 0 || x === 1) ? { input: { mode, students: a, sandwiches: b } } : { error: 'Two lists of 0s and 1s of the same length (up to 8).' }; }
  if (mode === 'secret') { const n = Number(values.n), a = Number(values.delay), f = Number(values.forget); return isInt(n, 1, 12) && isInt(f, 2, 8) && isInt(a, 1, f - 1) ? { input: { mode, n, delay: a, forget: f } } : { error: 'n from 1 to 12, 1 ≤ delay < forget ≤ 8.' }; }
  const d = DEF[mode];
  const r = parseOps(values.ops, d.sig);
  if (r.error) return r;
  const inp = { mode };
  if (d.extra === 'cap') { const c = Number(values.cap); if (!isInt(c, 1, 4)) return { error: 'Capacity from 1 to 4.' }; inp.cap = c; }
  if (d.extra === 'n') { const n = Number(values.n); if (!isInt(n, 1, 10)) return { error: 'n from 1 to 10.' }; inp.n = n; }
  if (d.extra === 'list') { const l = intsOf(values.list); if (!l.length || l.length > 6 || !l.every((x) => isInt(x, -99, 99))) return { error: '1 to 6 numbers in the list.' }; inp.list = l; }
  if (d.extra === 'foods') {
    const f = wordsOf(values.foods), c = wordsOf(values.cuisines), rt = intsOf(values.ratings);
    if (!f.length || f.length > 6 || c.length !== f.length || rt.length !== f.length || new Set(f).size !== f.length || ![...f, ...c].every((w) => /^[a-z]{1,8}$/.test(w)) || !rt.every((x) => isInt(x, 1, 99))) return { error: 'Up to 6 distinct foods, one cuisine and one rating (1 to 99) for each.' };
    Object.assign(inp, { foods: f, cuisines: c, ratings: rt });
  }
  inp.ops = r.ops;
  if (!d.valid(r.ops, inp)) return { error: 'Some call isn\'t allowed at that point (for example a pop on an empty structure, or an index out of range).' };
  return { input: inp };
}

export function designWalkValues(input) {
  const { mode } = input;
  if (mode === 'flatten') return { nested: input.nested };
  if (mode === 'tickets') return { tickets: input.tickets.join(', '), k: String(input.k) };
  if (mode === 'lunch') return { students: input.students.join(', '), sandwiches: input.sandwiches.join(', ') };
  if (mode === 'secret') return { n: String(input.n), delay: String(input.delay), forget: String(input.forget) };
  const v = { ops: input.ops.map(opText).join(', ') };
  if (input.cap !== undefined) v.cap = String(input.cap);
  if (input.n !== undefined) v.n = String(input.n);
  if (input.list) v.list = input.list.join(', ');
  if (input.foods) Object.assign(v, { foods: input.foods.join(', '), cuisines: input.cuisines.join(', '), ratings: input.ratings.join(', ') });
  return v;
}

export function randomDesignWalk(input, rand = Math.random) {
  const g = rng(rand);
  const d = DEF[input.mode] ?? SIM[input.mode];
  for (;;) { const x = { mode: input.mode, ...d.random(g) }; if (!x.ops || (x.ops.length && d.valid(x.ops, x))) return x; }
}

export function designWalkFields(input) {
  const { mode } = input;
  if (mode === 'flatten') return [{ name: 'nested', label: 'nested list', placeholder: '[[1,1],2,[1,[4,[6]]]]' }];
  if (mode === 'tickets') return [{ name: 'tickets', label: 'tickets', placeholder: '2, 3, 2' }, { name: 'k', label: 'k', placeholder: '2', short: true }];
  if (mode === 'lunch') return [{ name: 'students', label: 'students (0/1)', placeholder: '1, 1, 0, 0' }, { name: 'sandwiches', label: 'sandwiches (top first)', placeholder: '0, 1, 0, 1' }];
  if (mode === 'secret') return [{ name: 'n', label: 'n', placeholder: '6', short: true }, { name: 'delay', label: 'delay', placeholder: '2', short: true }, { name: 'forget', label: 'forget', placeholder: '4', short: true }];
  const d = DEF[mode];
  const f = [];
  if (d.extra === 'cap') f.push({ name: 'cap', label: 'capacity', placeholder: '2', short: true });
  if (d.extra === 'n') f.push({ name: 'n', label: 'n', placeholder: String(d.example.n), short: true });
  if (d.extra === 'list') f.push({ name: 'list', label: 'list', placeholder: '1, 2, 3' });
  if (d.extra === 'foods') f.push({ name: 'foods', label: 'foods', placeholder: 'kimchi, miso' }, { name: 'cuisines', label: 'cuisines', placeholder: 'korean, japanese' }, { name: 'ratings', label: 'ratings', placeholder: '9, 12' });
  f.push({ name: 'ops', label: `calls (${Object.keys(d.sig).join(', ')})`, placeholder: d.example.ops.slice(0, 3).map(opText).join(', ') });
  return f;
}

export function designWalkDescribe(input) {
  const { mode } = input;
  if (mode === 'flatten') return input.nested;
  if (mode === 'tickets') return `tickets ${list(input.tickets)}, k = ${input.k}`;
  if (mode === 'lunch') return `students ${list(input.students)}, sandwiches ${list(input.sandwiches)}`;
  if (mode === 'secret') return `n = ${input.n}, delay ${input.delay}, forget ${input.forget}`;
  return `${input.ops.length} calls${input.cap !== undefined ? `, capacity ${input.cap}` : ''}${input.n !== undefined ? `, n = ${input.n}` : ''}`;
}
