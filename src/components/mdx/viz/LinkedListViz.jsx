import { Anchor, Bookmark, Compass, Crown, Eye, Flag, Footprints, Hand, History, Link2, Move, Pin, Pointer, Rabbit, Target, Turtle } from 'lucide-react';
import { StepViz, Key } from './StepViz';
import { ListGraph, sizeOf } from './ListGraph';
import { RowLabel } from './prims';
import {
  DUMMY, FAST_SLOW, REVERSE, dummy, dummyCode, fastSlow, fastSlowCode, parseDummy, parseFastSlow, parseReverse,
  randomDummy, randomFastSlow, randomReverse, reverse, reverseCode,
} from './models/linkedList';
import { LIST_OPS, listOps, listOpsCode, parseListOps, randomListOps } from './models/listOps';

/**
 * Linked-list step-throughs, drawn as real nodes and next-arrows:
 *   <FastSlowViz examples={['cycle', 'nocycle']} />   Floyd on a ρ-shaped list, middle, n-th from the end
 *   <ReverseListViz examples={['whole']} />           save, flip, advance; reverse a sub-list
 *   <DummyNodeViz examples={['remove', 'merge']} />   a dummy node in front of the head
 */

const list = (a) => `[${a.join(', ')}]`;
/** Each pointer is a little character: Floyd's tortoise and hare, a bookmark for the saved next… */
const PTR = {
  slow: { icon: Turtle, tone: 'accent' },
  fast: { icon: Rabbit, tone: 'warn', big: true },
  p: { icon: Footprints, tone: 'interview' },
  lag: { icon: Footprints, tone: 'accent' },
  lead: { icon: Compass, tone: 'warn' },
  prev: { icon: History, tone: 'interview' },
  cur: { icon: Hand, tone: 'accent' },
  next: { icon: Bookmark, tone: 'warn' },
  before: { icon: Anchor, tone: 'interview' },
  move: { icon: Move, tone: 'warn' },
  tail: { icon: Link2, tone: 'accent' },
  a: { icon: Pointer, tone: 'interview' },
  b: { icon: Pointer, tone: 'warn' },
  l1: { icon: Pointer, tone: 'interview' },
  l2: { icon: Pointer, tone: 'warn' },
  head: { icon: Hand, tone: 'accent' },
  less: { icon: Link2, tone: 'interview' },
  ge: { icon: Link2, tone: 'warn' },
  newTail: { icon: Pin, tone: 'warn' },
  gp: { icon: Anchor, tone: 'interview' },
  kth: { icon: Flag, tone: 'warn' },
  o: { icon: Pointer, tone: 'interview' },
  c: { icon: Pointer, tone: 'warn' },
};

function pointersOf(ptrs, override = {}) {
  return Object.entries(ptrs ?? {}).filter(([, at]) => at).map(([name, at]) => ({ name, at, ...PTR[name], ...override[name] }));
}

/** The highlight a node gets from the first pointer standing on it. */
function nodeCls(id, ptrs, override = {}) {
  const name = Object.entries(ptrs ?? {}).find(([, v]) => v === id)?.[0];
  if (!name) return [];
  const t = override[name]?.tone ?? PTR[name]?.tone ?? 'accent';
  return [t === 'warn' ? 'second' : t === 'interview' ? 'third' : 'cur'];
}

const icon = (Icon) => <Icon size={11} strokeWidth={2.4} aria-hidden="true" />;

const gapFor = (width, slots, min = 62, max = 84) => Math.max(min, Math.min(max, Math.floor((Math.min(width, 640) - 24) / Math.max(1, slots))));

/** x positions along a row: about `g` apart, but never so close that the arrow between two cards disappears. */
function rowX(nodes, g, m) {
  const xs = [];
  nodes.forEach((n, k) => {
    if (k === 0) { xs.push(m + sizeOf(n).w / 2 - 20); return; }
    const need = (sizeOf(nodes[k - 1]).w + sizeOf(n).w) / 2 + 20;
    xs.push(xs[k - 1] + Math.max(g, need));
  });
  return xs;
}
const TOP = 96;                                          // room for pointer characters stacked above the nodes

// ---------------------------------------------------------------- fast and slow

function FastSlowStage({ step: f, input, width, seq, jump }) {
  const ids = f.order ?? f.nodes.map((n) => n.id);
  const pos = f.pos ?? -1;
  const label = `list ${list(f.nodes.map((n) => n.val))}`;
  let place = {};
  let W, H;
  if (pos >= 0) {
    const C = ids.length - pos;
    const g = gapFor(width, pos + Math.max(2, C / 2) + 1, 52, 78);
    const R = C === 1 ? 0 : Math.max(46, (g * C * 1.08) / (2 * Math.PI));
    const m = 30;
    const cy = TOP + R;
    const cx = m + pos * g + R;
    ids.forEach((id, k) => {
      if (k < pos) place[id] = { x: m + k * g, y: cy };
      else {
        const th = Math.PI + ((k - pos) * 2 * Math.PI) / C;
        place[id] = { x: cx + R * Math.cos(th), y: cy + R * Math.sin(th) };
      }
    });
    W = cx + R + m + 10;
    H = cy + R + 44;
  } else {
    const g = gapFor(width, ids.length + 0.5);
    const m = 30;
    const byId = new Map(f.nodes.map((n) => [n.id, n]));
    const xs = rowX(ids.map((id) => byId.get(id)), g, m);
    ids.forEach((id, k) => { place[id] = { x: xs[k], y: TOP }; });
    for (const id of f.removed ?? []) place[id] = { ...place[id], y: TOP + 58 };
    W = xs.at(-1) + m + 10;
    H = TOP + (f.removed?.length || input.mode === 'nth' ? 92 : 44);
  }
  const trail = new Map((f.trails ?? []).filter(([a, b]) => a && b).map(([a, b, t]) => [`${a}>${b}`, t]));
  const fresh = new Set((f.fresh ?? []).map(([a, b]) => `${a}>${b}`));
  const C = pos >= 0 ? ids.length - pos : 0;
  const edges = ids.filter((id) => f.next[id] !== null && f.next[id] !== undefined && !(f.removed ?? []).includes(id)).map((id) => {
    const key = `${id}>${f.next[id]}`;
    const skip = Math.abs(ids.indexOf(f.next[id]) - ids.indexOf(id)) > 1 && pos < 0;
    return { from: id, to: f.next[id], tone: trail.get(key) ?? (fresh.has(key) ? 'accent' : 'muted'), fresh: trail.has(key) || fresh.has(key), bend: C === 2 && ids.indexOf(id) >= pos && pos >= 0 ? (ids.indexOf(f.next[id]) > ids.indexOf(id) ? -10 : 10) : skip ? -22 : 0 };
  });
  const removed = f.removed ?? [];
  const nodes = f.nodes.map((n) => ({
    id: n.id, label: n.val, kind: n.kind, x: place[n.id].x, y: place[n.id].y,
    cls: [...(f.flag === n.id || f.target === n.id || f.matched?.includes(n.id) ? ['hit'] : nodeCls(n.id, f.ptrs)), ...(removed.includes(n.id) || f.bad?.includes(n.id) ? ['out'] : []), ...(removed.includes(n.id) ? ['fallen'] : [])],
  }));
  const marks = [
    ...(f.flag ? [{ at: f.flag, icon: Flag, label: 'entrance', tone: 'success' }] : []),
    ...(f.target ? [{ at: f.target, icon: Target, label: 'middle', tone: 'success' }] : []),
  ];
  const snip = f.snipped ? { x: (place[f.snipped[0]].x + place[f.snipped[1]].x) / 2, y: TOP } : null;
  return (
    <ListGraph width={W} height={H} nodes={nodes} edges={edges} pointers={pointersOf(f.ptrs)} marks={marks} pulse={f.pulse} snip={snip} seq={seq} jump={jump} label={label} />
  );
}

const fastSlowSpec = {
  title: 'Fast and slow pointers',
  examples: FAST_SLOW,
  simulate: fastSlow,
  code: (input) => fastSlowCode[input.mode],
  kinds: {
    start: ['Start', 'neutral'],
    move: ['Move', 'accent'],
    meet: ['They meet', 'success'],
    phase2: ['Phase 2', 'interview'],
    walk: ['Walk', 'interview'],
    found: ['Entrance', 'success'],
    none: ['No cycle', 'muted'],
    done: ['Answer', 'success'],
    gap: ['Open the gap', 'warn'],
    both: ['Move together', 'accent'],
    unlink: ['Unlink', 'success'],
    cut: ['Cut', 'warn'],
    flip: ['Reverse', 'interview'],
    compare: ['Match', 'success'],
    differ: ['Mismatch', 'danger'],
    weave: ['Weave', 'accent'],
  },
  describe: (input) => (input.mode === 'cycle' || input.mode === 'detect' ? `list = ${list(input.vals)}, pos = ${input.pos}` : input.mode === 'nth' ? `list = ${list(input.vals)}, n = ${input.n}` : input.mode === 'happy' ? `n = ${input.n}` : input.mode === 'dup' ? `nums = ${list(input.nums)}` : `list = ${list(input.vals)}`),
  rule: (input) => ({
    cycle: input.pos >= 0 ? `The last node links back to index ${input.pos}. slow moves 1, fast moves 2.` : 'No cycle: the last node points to null.',
    detect: input.pos >= 0 ? `The last node links back to index ${input.pos}. slow moves 1, fast moves 2.` : 'No cycle: the last node points to null.',
    happy: 'Each number points to the sum of the squares of its digits.',
    dup: 'Index i points to index nums[i]; start at index 0.',
    palin: 'Find the middle, reverse the second half, compare the halves.',
    reorder: 'Find the middle, reverse the second half, weave the halves.',
    middle: 'slow moves 1, fast moves 2: when fast stops, slow is halfway.',
    nth: 'lead goes n + 1 ahead of lag, then both move until lead falls off.',
  })[input.mode],
  stats: (f, input) => (f.phase && input.mode !== 'detect' && input.mode !== 'happy' ? [['phase', f.phase === 1 ? '1: detect' : '2: find the entrance']] : []),
  legend: (f, input) => (input.mode === 'nth'
    ? [[<Key tone="accent">{icon(Footprints)} lag</Key>, 'stops before the target'], [<Key tone="warn">{icon(Compass)} lead</Key>, 'n + 1 ahead'], [<Key shape="box" tone="danger">x</Key>, 'unlinked']]
    : [[<Key tone="accent">{icon(Turtle)} slow</Key>, 'the tortoise: 1 step'], [<Key tone="warn">{icon(Rabbit)} fast</Key>, 'the hare: 2 steps (orange arrows)'], ...(input.mode === 'cycle' || input.mode === 'dup' ? [[<Key tone="interview">{icon(Footprints)} p</Key>, 'phase 2, from the head']] : []), ...(input.mode === 'palin' || input.mode === 'reorder' ? [[<Key tone="interview">{icon(History)} prev</Key>, 'reversing the second half'], [<Key tone="interview">{icon(Pointer)} a</Key>, 'first half'], [<Key tone="warn">{icon(Pointer)} b</Key>, 'reversed second half']] : [])]),
  fields: (input) => (input.mode === 'happy' ? [{ name: 'n', label: 'n', placeholder: '19', short: true }] : input.mode === 'dup' ? [{ name: 'nums', label: 'nums (up to 9)', placeholder: 'e.g. 1, 3, 4, 2, 2' }] : [
    { name: 'vals', label: 'list (up to 9 values)', placeholder: 'e.g. 3, 2, 0, -4' },
    ...(input.mode === 'cycle' || input.mode === 'detect' ? [{ name: 'pos', label: 'pos (−1 = none)', placeholder: '1', short: true }] : []),
    ...(input.mode === 'nth' ? [{ name: 'n', label: 'n', placeholder: '2', short: true }] : []),
  ]),
  values: (input) => (input.mode === 'happy' ? { n: String(input.n) } : input.mode === 'dup' ? { nums: input.nums.join(', ') } : { vals: input.vals.join(', '), ...(input.mode === 'cycle' || input.mode === 'detect' ? { pos: String(input.pos) } : {}), ...(input.mode === 'nth' ? { n: String(input.n) } : {}) }),
  parse: parseFastSlow,
  random: (input) => randomFastSlow(input),
  hint: (input) => ({
    cycle: 'pos is the index the last node links back to, or −1 for no cycle. Try pos = 0 (the whole list is a loop).',
    middle: 'Try an odd and an even length.',
    detect: 'pos is the index the last node links back to, or −1 for no cycle.',
    happy: 'Try 7 (happy) or 4 (not). Numbers whose sequence repeats within 10 steps fit the picture.',
    dup: 'n + 1 numbers between 1 and n, exactly one value repeated (maybe more than twice).',
    palin: 'Try an odd length, or change one value.',
    reorder: 'Try an even and an odd length.',
    nth: 'n counts from the end: n = 1 removes the last node, n = length removes the head.',
  })[input.mode],
  delay: () => 2200,
  Stage: FastSlowStage,
};

export function FastSlowViz(props) {
  return <StepViz spec={fastSlowSpec} {...props} />;
}

// ---------------------------------------------------------------- reversal

function ReverseStage({ step: f, input, width, seq, jump }) {
  const ids = input.mode === 'whole' ? f.nodes.map((n) => n.id) : f.order;
  const g = gapFor(width, ids.length, 62, 84);
  const m = 40;
  const byId = new Map(f.nodes.map((n) => [n.id, n]));
  const xs = rowX(ids.map((id) => byId.get(id)), g, m);
  const place = Object.fromEntries(ids.map((id, k) => [id, { x: xs[k], y: TOP }]));
  const xOf = (id) => place[id]?.x ?? 0;
  const fresh = new Set((f.fresh ?? []).map(([a, b]) => `${a}>${b}`));
  const hot = new Set((f.hot ?? []).map(([a, b]) => `${a}>${b}`));
  const edges = Object.entries(f.next)
    .filter(([from, to]) => to !== null && to !== undefined && place[from] && place[to])
    .map(([from, to]) => {
      const key = `${from}>${to}`;
      const back = xOf(to) < xOf(from);
      return { from, to, tone: hot.has(key) ? 'warn' : fresh.has(key) ? 'accent' : back ? 'accent' : 'muted', fresh: fresh.has(key), dashed: hot.has(key) };
    });
  const over = input.mode === 'between' ? { cur: { icon: Pin } } : {};
  const nodes = f.nodes.filter((n) => place[n.id]).map((n) => ({
    id: n.id, label: n.val, kind: n.kind, x: place[n.id].x, y: place[n.id].y,
    cls: [...(f.crown === n.id ? ['hit'] : nodeCls(n.id, f.ptrs, over)), ...(f.moved === n.id ? ['moved'] : [])],
  }));
  const W = xs.at(-1) + m + 10;
  const marks = f.crown ? [{ at: f.crown, icon: Crown, label: 'new head', tone: 'warn' }] : [];
  return (
    <ListGraph width={W} height={TOP + 70} nodes={nodes} edges={edges} pointers={pointersOf(f.ptrs, over)} marks={marks} seq={seq} jump={jump} label={`list ${list(input.vals)}`} />
  );
}

const reverseSpec = {
  title: 'In-place reversal',
  examples: REVERSE,
  simulate: reverse,
  code: (input) => reverseCode[input.mode],
  kinds: {
    start: ['Start', 'neutral'],
    save: ['1. Save', 'warn'],
    flip: ['2. Flip', 'accent'],
    adv: ['3. Advance', 'interview'],
    walk: ['Walk', 'neutral'],
    cur: ['cur', 'neutral'],
    take: ['Take', 'warn'],
    relink: ['Relink', 'accent'],
    done: ['Answer', 'success'],
  },
  describe: (input) => (input.mode === 'whole' ? `list = ${list(input.vals)}` : `list = ${list(input.vals)}, left = ${input.left}, right = ${input.right}`),
  rule: (input) => (input.mode === 'whole' ? 'For each node: save next, flip the arrow, advance.' : 'Move the node after cur to the front of the segment, right - left times.'),
  stats: () => [],
  legend: (f, input) => (input.mode === 'whole'
    ? [[<Key tone="interview">{icon(History)} prev</Key>, 'reversed part'], [<Key tone="accent">{icon(Hand)} cur</Key>, 'being flipped'], [<Key tone="warn">{icon(Bookmark)} next</Key>, 'the saved rest of the list'], [<Key shape="dashed">null</Key>, 'null']]
    : [[<Key tone="interview">{icon(Anchor)} before</Key>, 'node before the segment'], [<Key tone="accent">{icon(Pin)} cur</Key>, 'ends as the tail'], [<Key tone="warn">{icon(Move)} move</Key>, 'goes to the front']]),
  fields: (input) => [
    { name: 'vals', label: `list (up to ${input.mode === 'whole' ? 7 : 8} values)`, placeholder: 'e.g. 1, 2, 3, 4' },
    ...(input.mode === 'between' ? [{ name: 'left', label: 'left', placeholder: '2', short: true }, { name: 'right', label: 'right', placeholder: '4', short: true }] : []),
  ],
  values: (input) => ({ vals: input.vals.join(', '), ...(input.mode === 'between' ? { left: String(input.left), right: String(input.right) } : {}) }),
  parse: parseReverse,
  random: (input) => randomReverse(input),
  hint: (input) => (input.mode === 'whole' ? 'Try a single node, or two.' : 'left and right are 1-based positions. Try left = 1, which reverses from the head.'),
  delay: (f) => (f.kind === 'save' || f.kind === 'adv' ? 1700 : 2400),
  Stage: ReverseStage,
};

export function ReverseListViz(props) {
  return <StepViz spec={reverseSpec} {...props} />;
}

// ---------------------------------------------------------------- dummy nodes

function DummyStage({ step: f, input, width, seq, jump }) {
  const fresh = new Set((f.fresh ?? []).map(([a, b]) => `${a}>${b}`));
  if (input.mode === 'remove') {
    const ids = f.nodes.map((n) => n.id);
    const g = gapFor(width, ids.length + 0.5, 62, 80);
    const m = 46;
    const byId = new Map(f.nodes.map((n) => [n.id, n]));
    const xs = rowX(ids.map((id) => byId.get(id)), g, m);
    const place = Object.fromEntries(ids.map((id, k) => [id, { x: xs[k], y: TOP + 6 }]));
    for (const id of f.removed) place[id] = { ...place[id], y: TOP + 70 };
    const edges = ids.filter((id) => !f.removed.includes(id) && f.next[id] !== null).map((id) => {
      const key = `${id}>${f.next[id]}`;
      const skip = ids.indexOf(f.next[id]) - ids.indexOf(id) > 1;
      return { from: id, to: f.next[id], tone: fresh.has(key) ? 'accent' : 'muted', fresh: fresh.has(key), bend: skip ? -18 - 4 * (ids.indexOf(f.next[id]) - ids.indexOf(id)) : 0 };
    });
    const over = { cur: { icon: Eye } };
    const nodes = f.nodes.map((n) => ({ id: n.id, label: n.val, kind: n.kind, x: place[n.id].x, y: place[n.id].y, cls: [...nodeCls(n.id, f.ptrs, over), ...(f.removed.includes(n.id) ? ['out', 'fallen'] : [])] }));
    const snip = f.snipped ? { x: (place[f.snipped[0]].x + place[f.snipped[1]].x) / 2, y: TOP + 6 } : null;
    return <ListGraph width={xs.at(-1) + m + 10} height={TOP + 96} nodes={nodes} edges={edges} pointers={pointersOf(f.ptrs, over)} snip={snip} seq={seq} jump={jump} label={`list ${list(input.vals)}`} />;
  }
  const inResult = new Map(f.result.map((id, k) => [id, k]));
  const A = f.nodes.filter((n) => n.row === 'a'), B = f.nodes.filter((n) => n.row === 'b');
  const slots = Math.max(A.length + 1, B.length + 1, f.result.length + (f.nodes.length - f.result.length));
  const g = gapFor(width, Math.max(slots, A.length + B.length + 1), 62, 72);
  const m = 86;                                        // room for the row names on the left
  const rows = { a: TOP - 10, b: TOP + 86, r: TOP + 190 };
  const D = f.nodes.find((n) => n.kind === 'dummy');
  const byId = new Map(f.nodes.map((n) => [n.id, n]));
  const rx = rowX(f.result.map((id) => byId.get(id)), g, m);
  const ax = rowX([D, ...A], g, m), bx = rowX([D, ...B], g, m);
  const place = {};
  f.nodes.forEach((n) => {
    if (inResult.has(n.id)) place[n.id] = { x: rx[inResult.get(n.id)], y: rows.r };
    else {
      const k = (n.row === 'a' ? A : B).findIndex((x) => x.id === n.id);
      place[n.id] = { x: (n.row === 'a' ? ax : bx)[k + 1], y: rows[n.row] };
    }
  });
  const edges = Object.entries(f.next).filter(([, to]) => to !== null && to !== undefined).map(([from, to]) => {
    const key = `${from}>${to}`;
    const both = inResult.has(from) && inResult.has(to);
    const stale = inResult.has(from) && !inResult.has(to);
    return { from, to, tone: fresh.has(key) ? 'accent' : both ? 'success' : 'muted', fresh: fresh.has(key), dashed: stale && !fresh.has(key) };
  });
  const head = f.kind === 'rest' ? f.result[1] : null;
  const nodes = f.nodes.map((n) => ({ id: n.id, label: n.val, kind: n.kind, x: place[n.id].x, y: place[n.id].y, cls: [...(n.id === head ? ['hit'] : nodeCls(n.id, f.ptrs)), ...(f.moved === n.id ? ['moved'] : [])] }));
  const marks = head ? [{ at: head, icon: Crown, label: 'head', tone: 'warn' }] : [];
  const W = Math.max(...Object.values(place).map((p) => p.x)) + m + 20;
  return (
    <div style={{ position: 'relative', width: W, margin: '0 auto' }}>
      <RowLabel y={rows.a - 7}>list a</RowLabel>
      <RowLabel y={rows.b - 7}>list b</RowLabel>
      <RowLabel y={rows.r - 7}>answer</RowLabel>
      <ListGraph width={W} height={rows.r + 40} nodes={nodes} edges={edges} pointers={pointersOf(f.ptrs)} marks={marks} seq={seq} jump={jump} label={`a = ${list(input.a)}, b = ${list(input.b)}`} />
    </div>
  );
}

const dummySpec = {
  title: 'A dummy node in front of the head',
  examples: DUMMY,
  simulate: dummy,
  code: (input) => dummyCode[input.mode],
  kinds: {
    start: ['Start', 'neutral'],
    unlink: ['Unlink', 'danger'],
    adv: ['Keep, advance', 'accent'],
    takeA: ['Take from a', 'interview'],
    takeB: ['Take from b', 'warn'],
    rest: ['Attach the rest', 'success'],
    done: ['Answer', 'success'],
  },
  describe: (input) => (input.mode === 'remove' ? `list = ${list(input.vals)}, val = ${input.val}` : `a = ${list(input.a)}, b = ${list(input.b)}`),
  rule: (input) => (input.mode === 'remove' ? 'Look at cur.next: unlink it if it matches, otherwise advance.' : 'Link the smaller front after tail; then move tail.'),
  stats: (f, input) => (input.mode === 'remove' ? [['removed', f.removed.length]] : [['result', `${f.result.length - 1} nodes`]]),
  legend: (f, input) => (input.mode === 'remove'
    ? [[<Key tone="accent">{icon(Eye)} cur</Key>, 'looks at cur.next'], [<Key shape="box" tone="danger">x</Key>, 'unlinked'], [<Key shape="dashed">dummy</Key>, 'fake node before the head']]
    : [[<Key tone="accent">{icon(Link2)} tail</Key>, 'end of the answer'], [<Key tone="interview">{icon(Pointer)} a</Key>, 'front of a'], [<Key tone="warn">{icon(Pointer)} b</Key>, 'front of b'], [<Key shape="box" tone="success">→</Key>, 'links in the answer']]),
  fields: (input) => (input.mode === 'remove'
    ? [{ name: 'vals', label: 'list (−9 to 9)', placeholder: 'e.g. 7, 7, 1, 7' }, { name: 'val', label: 'val', placeholder: '7', short: true }]
    : [{ name: 'a', label: 'a (sorted for you)', placeholder: 'e.g. 1, 3, 5' }, { name: 'b', label: 'b (sorted for you)', placeholder: 'e.g. 2, 4' }]),
  values: (input) => (input.mode === 'remove' ? { vals: input.vals.join(', '), val: String(input.val) } : { a: input.a.join(', '), b: input.b.join(', ') }),
  parse: parseDummy,
  random: (input) => randomDummy(input),
  hint: (input) => (input.mode === 'remove' ? 'Up to 8 values. Try a list that starts (or is full of) the value: the dummy handles it.' : 'Up to 5 values per list; either may be empty.'),
  delay: () => 2400,
  Stage: DummyStage,
};

export function DummyNodeViz(props) {
  return <StepViz spec={dummySpec} {...props} />;
}


// ---------------------------------------------------------------- list rewiring on a grid

const MARK_ICON = { crown: Crown, flag: Flag, target: Target };
const ROW_H = 118;

function ListOpsStage({ step: f, input, width, seq, jump }) {
  const ids = f.nodes.map((n) => n.id).filter((id) => f.place[id]);
  const cols = Math.max(...ids.map((id) => f.place[id][0]));
  const nRows = Math.max(...ids.map((id) => f.place[id][1])) + 1;
  const side = width >= 560 && f.rows ? 78 : 0;                 // row names on the left when there is room
  const m = side + (width < 480 ? 10 : 30);
  const g = Math.max(58, Math.min(80, Math.floor((Math.min(width, 760) - m - 23 - 54) / Math.max(1, cols))));
  const arcs = (f.extra ?? []).length > 0;                       // random pointers arc above and below the rows
  const top = TOP - (side || !f.rows ? 0 : -14) + (arcs ? 60 : 0);
  const pos = (id) => ({ x: m + 23 + f.place[id][0] * g, y: top + f.place[id][1] * ROW_H });
  const between = (a, b) => {
    const [ca, ra] = f.place[a], [cb, rb] = f.place[b];
    return ra === rb && ids.some((id) => f.place[id][1] === ra && f.place[id][0] > Math.min(ca, cb) && f.place[id][0] < Math.max(ca, cb));
  };
  const fresh = new Set((f.fresh ?? []).map(([a, b]) => `${a}>${b}`));
  const edges = ids.filter((id) => f.next[id] && f.place[f.next[id]]).map((id) => {
    const to = f.next[id];
    const key = `${id}>${to}`;
    return { from: id, to, tone: fresh.has(key) ? 'accent' : 'muted', fresh: fresh.has(key), bend: between(id, to) ? -22 : 0 };
  });
  for (const e of f.extra ?? []) if (f.place[e.from] && f.place[e.to]) edges.push(e);
  const nodes = f.nodes.filter((n) => f.place[n.id]).map((n) => ({ id: n.id, label: n.val, kind: n.kind, ...pos(n.id), cls: [...(f.cls?.[n.id] ?? nodeCls(n.id, f.ptrs))] }));
  const marks = (f.marks ?? []).map((mk) => ({ ...mk, icon: MARK_ICON[mk.icon] ?? Flag }));
  const snip = f.snipped && f.place[f.snipped[1]] ? { x: (pos(f.snipped[0]).x + pos(f.snipped[1]).x) / 2, y: pos(f.snipped[0]).y } : null;
  const W = m + 23 + cols * g + 46 + (width < 480 ? 8 : 20);
  const H = top + (nRows - 1) * ROW_H + (arcs ? 130 : 64);
  return (
    <div style={{ position: 'relative', width: W, margin: '0 auto' }}>
      {Object.entries(f.rows ?? {}).filter(([r]) => Number(r) < nRows && ids.some((id) => f.place[id][1] === Number(r))).map(([r, text]) => (
        <RowLabel key={r} x={side ? 0 : m - 10} y={top + Number(r) * ROW_H - (side ? 7 : 64)}>{text}</RowLabel>
      ))}
      <ListGraph width={W} height={H} nodes={nodes} edges={edges} pointers={pointersOf(f.ptrs)} marks={marks} snip={snip} seq={seq} jump={jump} label={describeOps(input)} />
    </div>
  );
}

function describeOps(input) {
  switch (input.mode) {
    case 'add': return `l1 = ${list(input.a)}, l2 = ${list(input.b)}`;
    case 'partition': return `list = ${list(input.vals)}, x = ${input.x}`;
    case 'rotate': return `list = ${list(input.vals)}, k = ${input.k}`;
    case 'kgroup': return `list = ${list(input.vals)}, k = ${input.k}`;
    case 'copy': return `list = [${input.list.map(([v, r]) => `[${v}, ${r === null ? 'null' : r}]`).join(', ')}]`;
    default: return `list = ${list(input.vals)}`;
  }
}

const OPS_RULE = {
  add: 'Add digit + digit + carry; write s mod 10, carry s / 10.',
  swap: 'prev.next = b, a.next = b.next, b.next = a; then prev = a.',
  partition: 'Append each node to the < x list or the ≥ x list, then join them.',
  rotate: 'Close the ring, then cut after node n − (k mod n) − 1.',
  gcd: 'Insert gcd(cur, cur.next) after cur, then jump over it.',
  copy: 'Copy after each node; copy.random = random.next; unzip.',
  kgroup: 'For each full group, move every node after the first to the group\'s front.',
};

const listOpsSpec = {
  title: 'Rewiring a linked list',
  examples: LIST_OPS,
  simulate: listOps,
  code: (input) => listOpsCode[input.mode],
  kinds: {
    start: ['Start', 'neutral'], digit: ['Add a column', 'accent'], done: ['Answer', 'success'],
    pair: ['Next pair', 'neutral'], swap: ['Rewire', 'accent'],
    less: ['To "less"', 'interview'], ge: ['To "≥ x"', 'warn'], join: ['Join', 'success'],
    len: ['Measure', 'neutral'], mod: ['k mod n', 'interview'], ring: ['Ring', 'accent'], walk: ['Walk', 'neutral'], cut: ['Cut', 'success'],
    insert: ['Insert', 'accent'], skip: ['Skip', 'neutral'],
    clone: ['Copy', 'accent'], random: ['Random', 'interview'], split: ['Unzip', 'warn'],
    check: ['Next group', 'neutral'], move: ['Move to front', 'accent'], next: ['Group done', 'success'], stop: ['Leftover', 'muted'],
  },
  describe: describeOps,
  rule: (input) => OPS_RULE[input.mode],
  stats: () => [],
  legend: (f, input) => [
    [<Key shape="box" tone="accent">→</Key>, 'a link that just changed'],
    ...(input.mode === 'copy' ? [[<Key shape="dashed">⇢</Key>, 'random pointers (dashed)']] : []),
    ...(f.nodes.some((n) => n.kind === 'dummy') ? [[<Key shape="dashed">dummy</Key>, 'a placeholder in front of a head']] : []),
  ],
  fields: (input) => (input.mode === 'add'
    ? [{ name: 'a', label: 'l1 (ones first)', placeholder: 'e.g. 2, 4, 3' }, { name: 'b', label: 'l2 (ones first)', placeholder: 'e.g. 5, 6, 4' }]
    : input.mode === 'copy'
      ? [{ name: 'vals', label: 'values (up to 5)', placeholder: 'e.g. 7, 13, 11' }, { name: 'random', label: 'random index per node', placeholder: 'e.g. null, 0, 1' }]
      : [
        { name: 'vals', label: 'list', placeholder: 'e.g. 1, 2, 3, 4, 5' },
        ...(input.mode === 'partition' ? [{ name: 'x', label: 'x', placeholder: '3', short: true }] : []),
        ...(input.mode === 'rotate' || input.mode === 'kgroup' ? [{ name: 'k', label: 'k', placeholder: '2', short: true }] : []),
      ]),
  values: (input) => (input.mode === 'add'
    ? { a: input.a.join(', '), b: input.b.join(', ') }
    : input.mode === 'copy'
      ? { vals: input.list.map(([v]) => v).join(', '), random: input.list.map(([, r]) => (r === null ? 'null' : r)).join(', ') }
      : { vals: input.vals.join(', '), ...(input.mode === 'partition' ? { x: String(input.x) } : {}), ...(input.mode === 'rotate' || input.mode === 'kgroup' ? { k: String(input.k) } : {}) }),
  parse: parseListOps,
  random: (input) => randomListOps(input),
  hint: (input) => ({
    add: 'Digits ones first: 9, 9 is 99. Try 99 + 1 for a carry at the end.',
    swap: 'Try an odd length: the last node stays.',
    partition: 'Try x smaller or larger than every value.',
    rotate: 'k can be huge: try k = 1000000007.',
    gcd: 'Values from 1 to 99, two to five of them.',
    copy: 'One random index per node, or null. A node may point to itself.',
    kgroup: 'Try k = 1 (nothing changes) or k = the length.',
  })[input.mode],
  delay: (f) => (f.kind === 'start' ? 2600 : 2200),
  Stage: ListOpsStage,
};

export function ListOpsViz(props) {
  return <StepViz spec={listOpsSpec} {...props} />;
}
