import { StepViz, Key } from './StepViz';
import { ArrayStrip, Chips, RowLabel, Stage, pitchFor } from './prims';
import {
  LAZY_HEAP, LIMIT_WINDOW, MAX_QUEUE, PARTITION_K,
  lazyHeap, lazyHeapCode, lazyHeapText, limitWindow, limitWindowCode, maxQueue, maxQueueCode, maxQueueText, partitionK, partitionKCode,
  isPrime, limitWindowCodeFor, parseLazyHeap, parseLimitWindow, parseMaxQueue, parsePartitionK, randomLazyHeap, randomLimitWindow, randomMaxQueue, randomPartitionK,
} from './models/queues';
import {
  FIXED_BOUNDS, FLIP_WINDOW, VISIBLE_PEOPLE,
  fixedBounds, fixedBoundsCode, flipWindow, flipWindowCode, visiblePeople, visiblePeopleCode,
  parseFixedBounds, parseFlipWindow, parseVisiblePeople, randomFixedBounds, randomFlipWindow, randomVisiblePeople,
} from './models/queues';

/**
 * Step-throughs for queue and heap design:
 *   <MaxQueueViz />     a queue with O(1) max (or min): a monotonic deque beside it   (Monotonic Stack lesson)
 *   <LimitWindowViz />  1438: a sliding window guarded by a max-deque and a min-deque  (Monotonic Stack lesson)
 *   <LazyHeapViz />     Stock Price Fluctuation: heaps with lazy deletion              (Designing Data Structures)
 *   <PartitionKViz />   2294: sort, then open a new group when the gap exceeds k       (Greedy)
 *   <VisiblePeopleViz /> 1944: a decreasing stack from the right; count the pops       (Monotonic Stack)
 *   <FixedBoundsViz />  2444: last bad, last minK, last maxK                           (Monotonic Stack)
 *   <FlipWindowViz />   995: forced greedy with a running count of covering flips      (Sliding Window)
 */

const list = (a) => `[${a.join(', ')}]`;

// ---------------------------------------------------------------- max / min queue

function MaxQueueStage({ step: f, input, width, jump }) {
  const cap = Math.max(4, ...maxQueue(input).map((s) => s.q.length));
  const pitch = pitchFor(width - 90, cap, 38, 56);
  const W = cap * pitch + 70;
  const x0 = 70;
  const h = 42;
  const qy = 26, by = qy + h + 52;
  const height = by + h + 30;
  return (
    <div>
      <Stage width={W} height={height} jump={jump} label={`queue ${list(f.q.map((x) => x.v))}`}>
        <RowLabel x={0} y={qy + 12}>queue</RowLabel>
        <ArrayStrip items={f.q} x0={x0} y={qy} pitch={pitch} h={h} index={false} cls={(k, it) => [it.id === f.focus && 'cur', k === 0 && f.q.length && 'target'].filter(Boolean).join(' ')} />
        <RowLabel x={0} y={by + 12}>best</RowLabel>
        <ArrayStrip items={f.best} x0={x0} y={by} pitch={pitch} h={h} index={false} cls={(k, it) => [k === 0 && 'hit', it.id === f.focus && 'cur'].filter(Boolean).join(' ')} />
      </Stage>
      {f.dropped?.length > 0 && <Chips label="dropped from best" chips={f.dropped.map((v, k) => ({ key: k, text: String(v), tone: 'danger', isNew: true }))} />}
      <Chips label={`${input.mode}() answers`} chips={f.out.map((v, k) => ({ key: k, text: String(v), tone: f.kind === 'done' ? 'success' : 'accent', isNew: k === f.out.length - 1 && f.kind === 'read' }))} empty="none yet" />
    </div>
  );
}

const maxQueueSpec = {
  title: 'Min / max queue: a monotonic deque beside the queue',
  examples: MAX_QUEUE,
  simulate: maxQueue,
  code: (input) => maxQueueCode(input.mode),
  kinds: { start: ['Start', 'neutral'], push: ['Push', 'accent'], pop: ['Pop', 'warn'], read: ['Read', 'success'], done: ['Done', 'success'] },
  describe: (input) => maxQueueText(input.ops),
  rule: (input) => `best keeps the values that can still be the ${input.mode === 'max' ? 'maximum' : 'minimum'}; its front is the answer`,
  stats: (f) => [['size', String(f.q.length)]],
  legend: () => [[<Key shape="box" tone="warn">q</Key>, 'front of the queue (next to leave)'], [<Key shape="box" tone="success">b</Key>, 'front of best: the answer'], [<Key shape="box" tone="accent">x</Key>, 'just pushed']],
  fields: (input) => [{ name: 'ops', label: 'operations', placeholder: `push 3, push 1, ${input.mode}, pop, ${input.mode}` }],
  values: (input) => ({ ops: maxQueueText(input.ops) }),
  parse: parseMaxQueue,
  random: (input) => randomMaxQueue(input),
  hint: (input) => `Up to 14 operations: push x, pop, ${input.mode}.`,
  Stage: MaxQueueStage,
};

export function MaxQueueViz(props) {
  return <StepViz spec={maxQueueSpec} {...props} />;
}

// ---------------------------------------------------------------- 1438

function LimitStage({ step: f, input, width, jump }) {
  const a = input.nums;
  const n = a.length;
  const pitch = pitchFor(width - 20, n, 40, 60);
  const W = n * pitch;
  const h = 44;
  const top = 20;
  const height = top + h + 44;
  const inWin = (k) => f.r !== null && k >= f.l && k <= f.r;
  const tags = {};
  if (f.r !== null) { tags[f.l] = [{ label: 'l', tone: 'warn' }]; tags[f.r] = [...(f.l === f.r ? tags[f.l] : []), { label: 'r', tone: 'accent' }]; }
  return (
    <div>
      <Stage width={W} height={height} jump={jump} label={`nums = ${list(a)}`}>
        <ArrayStrip
          items={a} y={top} pitch={pitch} h={h} tags={tags}
          bands={[...(f.bestAt ? [{ from: f.bestAt[0], to: f.bestAt[1], tone: 'ghost' }] : []), ...(f.r !== null ? [{ from: f.l, to: f.r, tone: f.kind === 'grow' && f.tooMuch ? 'danger' : 'accent' }] : [])]}
          cls={(k) => [
            f.kind === 'shrink' && k >= f.from && k < f.l ? 'bad' : f.r !== null && k > f.r ? 'muted' : inWin(k) ? '' : f.r !== null ? 'dim' : '',
            f.kind === 'count' && f.countTo !== null && k >= f.l && k <= f.countTo ? 'hit' : '',
            input.goal === 'prime' && isPrime(a[k]) ? 'warm' : '',
          ].filter(Boolean).join(' ')}
        />
      </Stage>
      <Chips label="maxQ (front → back)" chips={f.maxQ.map((i, k) => ({ key: i, text: `${a[i]}`, note: `i${i}`, tone: k === 0 ? 'warn' : undefined }))} empty="empty" />
      <Chips label="minQ (front → back)" chips={f.minQ.map((i, k) => ({ key: i, text: `${a[i]}`, note: `i${i}`, tone: k === 0 ? 'note' : undefined }))} empty="empty" />
    </div>
  );
}

const LIMIT_RULE = {
  longest: 'window is fine while max − min ≤ limit; max and min come from the deque fronts',
  count: 'fine while max − min ≤ limit; each r adds r − l + 1 windows',
  cost: 'fine while (max − min) × length ≤ k; each r adds r − l + 1 windows',
  prime: 'deques hold primes only; fine while their spread ≤ k; starts run from l to the second-to-last prime',
};

const limitSpec = {
  title: 'A window with a max queue and a min queue',
  examples: LIMIT_WINDOW,
  simulate: limitWindow,
  code: (input) => limitWindowCodeFor(input.goal),
  kinds: { start: ['Start', 'neutral'], grow: ['Add', 'accent'], shrink: ['Shrink', 'warn'], best: ['Best', 'success'], count: ['Count', 'success'], done: ['Answer', 'success'] },
  describe: (input) => `nums = ${list(input.nums)}, ${input.goal && input.goal !== 'longest' ? 'k' : 'limit'} = ${input.limit}`,
  rule: (input) => LIMIT_RULE[input.goal ?? 'longest'],
  stats: (f, input) => [[input.goal && input.goal !== 'longest' ? 'total' : 'best', String(f.best)]],
  legend: () => [[<Key shape="box" tone="accent">·</Key>, 'the window [l, r]'], [<Key shape="box" tone="warn">max</Key>, 'front of maxQ'], [<Key shape="box" tone="note">min</Key>, 'front of minQ'], [<Key shape="box" tone="success">·</Key>, 'best window so far (dashed)']],
  fields: (input) => [{ name: 'nums', label: 'nums', placeholder: '10, 1, 2, 4, 7, 2' }, { name: 'limit', label: input.goal && input.goal !== 'longest' ? 'k' : 'limit', placeholder: '5', short: true }],
  values: (input) => ({ nums: input.nums.join(', '), limit: String(input.limit) }),
  parse: parseLimitWindow,
  random: (input) => randomLimitWindow(input),
  hint: (input) => (input.goal === 'prime' ? 'Up to 10 numbers from 1 to 50 (primes are shaded), and k from 0 to 50.' : input.goal === 'cost' ? 'Up to 10 numbers from 1 to 30, and k from 0 to 300.' : 'Up to 10 numbers between 1 and 30, and a limit from 0 to 50.'),
  Stage: LimitStage,
};

export function LimitWindowViz(props) {
  return <StepViz spec={limitSpec} {...props} />;
}

// ---------------------------------------------------------------- lazy deletion

function LazyStage({ step: f }) {
  const heapChips = (h, which) => h.map((e, k) => ({
    key: e.id, text: `${e.p} · t${e.t}`,
    tone: e.stale ? 'muted' : k === 0 ? (f.which === which ? 'success' : 'accent') : undefined,
    note: e.stale ? 'stale' : k === 0 ? 'top' : undefined,
  }));
  return (
    <div>
      <Chips label="price map" chips={f.price.map(([t, p]) => ({ key: t, text: `t${t} → ${p}`, tone: t === f.latest ? 'warn' : undefined, note: t === f.latest ? 'latest' : undefined }))} empty="empty" />
      <Chips label="max-heap (top first)" chips={heapChips(f.maxH, 'max')} empty="empty" />
      <Chips label="min-heap (top first)" chips={heapChips(f.minH, 'min')} empty="empty" />
      {f.dropped && <Chips label="popped as stale" chips={f.dropped.map((d, k) => ({ key: k, text: d, tone: 'danger', isNew: true }))} />}
      <Chips label="answers" chips={f.out.map((v, k) => ({ key: k, text: String(v), tone: f.kind === 'done' ? 'success' : 'accent', isNew: k === f.out.length - 1 && f.kind === 'read' }))} empty="none yet" />
    </div>
  );
}

const lazySpec = {
  title: 'Heaps with lazy deletion (Stock Price Fluctuation)',
  examples: LAZY_HEAP,
  simulate: lazyHeap,
  code: () => lazyHeapCode,
  kinds: { start: ['Start', 'neutral'], update: ['Update', 'accent'], clean: ['Skip stale', 'warn'], read: ['Read', 'success'], done: ['Done', 'success'] },
  describe: (input) => lazyHeapText(input.ops),
  rule: () => 'never delete from the heap: skip entries the map disagrees with when they reach the top',
  stats: (f) => [['heap size', String(f.maxH.length)]],
  legend: () => [[<Key shape="pill" tone="accent">top</Key>, 'top of a heap'], [<Key shape="pill" tone="muted">stale</Key>, 'out of date, still in the heap'], [<Key shape="pill" tone="warn">latest</Key>, 'latest timestamp']],
  fields: () => [{ name: 'ops', label: 'operations', placeholder: 'update 1 10, update 2 5, maximum, update 1 3, maximum' }],
  values: (input) => ({ ops: lazyHeapText(input.ops) }),
  parse: parseLazyHeap,
  random: (input) => randomLazyHeap(input),
  hint: () => 'Up to 12 operations: update t p, current, maximum, minimum. Reuse a timestamp to make a correction.',
  Stage: LazyStage,
};

export function LazyHeapViz(props) {
  return <StepViz spec={lazySpec} {...props} />;
}

// ---------------------------------------------------------------- 2294

const GROUP_TONES = ['accent', 'warn', 'note', 'success', 'interview'];

function PartitionStage({ step: f, width, jump }) {
  const a = f.a;
  const n = a.length;
  const pitch = pitchFor(width - 20, n, 40, 60);
  const W = n * pitch;
  const h = 44;
  const top = 34;
  const height = top + h + 34;
  return (
    <div>
      <Stage width={W} height={height} jump={jump} label={`sorted ${list(a)}`}>
        <ArrayStrip
          items={a} y={top} pitch={pitch} h={h}
          bands={f.groups.map(([from, to], k) => ({ from, to: f.i === null ? to : Math.min(to, f.i), tone: GROUP_TONES[k % GROUP_TONES.length], label: `group ${k + 1}` })).filter((b) => f.kind !== 'start' && b.to >= b.from)}
          cls={(k) => (f.i === null ? '' : k === f.i ? 'cur' : k > f.i ? 'muted' : '')}
        />
      </Stage>
    </div>
  );
}

const partitionSpec = {
  title: '2294: sort, then group greedily',
  examples: PARTITION_K,
  simulate: partitionK,
  code: () => partitionKCode,
  kinds: { start: ['Start', 'neutral'], join: ['Join', 'accent'], cut: ['New group', 'warn'], done: ['Answer', 'success'] },
  describe: (input) => `nums = ${list(input.nums)}, k = ${input.k}`,
  rule: (input) => `a group may span at most ${input.k} from its smallest value`,
  stats: (f) => [['groups', String(f.groups.length)]],
  legend: () => [[<Key shape="box" tone="accent">x</Key>, 'current value'], [<Key shape="box" tone="warn">·</Key>, 'one group per colour']],
  fields: () => [{ name: 'nums', label: 'nums', placeholder: '3, 6, 1, 2, 5' }, { name: 'k', label: 'k', placeholder: '2', short: true }],
  values: (input) => ({ nums: input.nums.join(', '), k: String(input.k) }),
  parse: parsePartitionK,
  random: (input) => randomPartitionK(input),
  hint: () => 'Up to 10 numbers between 0 and 50.',
  Stage: PartitionStage,
};

export function PartitionKViz(props) {
  return <StepViz spec={partitionSpec} {...props} />;
}

// ---------------------------------------------------------------- 1944

function VisibleStage({ step: f, input, width, jump }) {
  const h = input.heights;
  const n = h.length;
  const pitch = pitchFor(width - 20, n, 40, 60);
  const W = n * pitch;
  const top = 20, cell = 44;
  const height = top + cell + 44;
  const seen = new Set(f.seen);
  const tags = f.i !== null ? { [f.i]: [{ label: 'i', tone: 'accent' }] } : {};
  return (
    <div>
      <Stage width={W} height={height} jump={jump} label={`heights = ${list(h)}`}>
        <ArrayStrip
          items={h} y={top} pitch={pitch} h={cell} tags={tags}
          cls={(k) => (k === f.i ? 'cur' : seen.has(k) ? 'hit' : k === f.taller ? 'target' : f.i !== null && k < f.i ? 'muted' : '')}
          badge={(k) => (f.ans[k] !== null ? { text: String(f.ans[k]), tone: 'success' } : null)}
        />
      </Stage>
      <Chips label="stack (bottom → top)" chips={f.st.map((j, k) => ({ key: j, text: String(h[j]), note: `i${j}`, tone: k === f.st.length - 1 ? 'accent' : undefined }))} empty="empty" />
    </div>
  );
}

const visibleSpec = {
  title: '1944: who can each person see?',
  examples: VISIBLE_PEOPLE,
  simulate: visiblePeople,
  code: () => visiblePeopleCode,
  kinds: { start: ['Start', 'neutral'], person: ['Look right', 'accent'], done: ['Answer', 'success'] },
  describe: (input) => `heights = ${list(input.heights)}`,
  rule: () => 'everyone popped is visible; then the first taller person on the stack',
  stats: (f) => [['stack', String(f.st.length)]],
  legend: () => [[<Key shape="box" tone="accent">i</Key>, 'the person looking right'], [<Key shape="box" tone="success">·</Key>, 'popped: seen by i'], [<Key shape="box" tone="warn">·</Key>, 'first taller person'], [<Key tone="success">n</Key>, 'answer for that person']],
  fields: () => [{ name: 'heights', label: 'heights (distinct)', placeholder: '10, 6, 8, 5, 11, 9' }],
  values: (input) => ({ heights: input.heights.join(', ') }),
  parse: parseVisiblePeople,
  random: (input) => randomVisiblePeople(input),
  hint: () => 'Up to 9 distinct heights between 1 and 30.',
  Stage: VisibleStage,
};

export function VisiblePeopleViz(props) {
  return <StepViz spec={visibleSpec} {...props} />;
}

// ---------------------------------------------------------------- 2444

function FixedStage({ step: f, input, width, jump }) {
  const a = input.nums;
  const n = a.length;
  const pitch = pitchFor(width - 20, n, 40, 60);
  const W = n * pitch;
  const top = 20, cell = 44;
  const height = top + cell + 44;
  const tags = {};
  const tag = (k, label, tone) => { if (k >= 0) tags[k] = [...(tags[k] ?? []), { label, tone }]; };
  if (f.i !== null) { tag(f.bad, 'bad', 'danger'); tag(f.lastMin, 'min', 'note'); tag(f.lastMax, 'max', 'warn'); }
  const hi = Math.min(f.lastMin, f.lastMax);
  return (
    <div>
      <Stage width={W} height={height} jump={jump} label={`nums = ${list(a)}`}>
        <ArrayStrip
          items={a} y={top} pitch={pitch} h={cell} tags={tags}
          bands={f.i !== null && f.add > 0 ? [{ from: f.bad + 1, to: hi, tone: 'success', label: 'starts' }] : []}
          cls={(k) => (k === f.i ? 'cur' : a[k] < input.minK || a[k] > input.maxK ? 'bad' : f.i !== null && k > f.i ? 'muted' : '')}
        />
      </Stage>
    </div>
  );
}

const fixedSpec = {
  title: '2444: count subarrays with min = minK and max = maxK',
  examples: FIXED_BOUNDS,
  simulate: fixedBounds,
  code: () => fixedBoundsCode,
  kinds: { start: ['Start', 'neutral'], count: ['Count', 'success'], none: ['None', 'warn'], done: ['Answer', 'success'] },
  describe: (input) => `nums = ${list(input.nums)}, minK = ${input.minK}, maxK = ${input.maxK}`,
  rule: () => 'valid starts for end i: bad + 1 … min(lastMin, lastMax)',
  stats: (f) => [['count', String(f.count)]],
  legend: () => [[<Key shape="box" tone="accent">i</Key>, 'the end'], [<Key shape="box" tone="danger">·</Key>, 'outside [minK, maxK]'], [<Key shape="box" tone="success">·</Key>, 'valid starts for this end']],
  fields: () => [{ name: 'nums', label: 'nums', placeholder: '1, 3, 5, 2, 7, 5' }, { name: 'minK', label: 'minK', placeholder: '1', short: true }, { name: 'maxK', label: 'maxK', placeholder: '5', short: true }],
  values: (input) => ({ nums: input.nums.join(', '), minK: String(input.minK), maxK: String(input.maxK) }),
  parse: parseFixedBounds,
  random: (input) => randomFixedBounds(input),
  hint: () => 'Up to 10 numbers between 1 and 9.',
  Stage: FixedStage,
};

export function FixedBoundsViz(props) {
  return <StepViz spec={fixedSpec} {...props} />;
}

// ---------------------------------------------------------------- 995

function FlipStage({ step: f, input, width, jump }) {
  const a = input.nums;
  const n = a.length;
  const pitch = pitchFor(width - 70, n, 36, 56);
  const x0 = 70;
  const W = x0 + n * pitch;
  const cell = 40;
  const y1 = 26, y2 = y1 + cell + 40;
  const height = y2 + cell + 30;
  const live = f.starts.filter((s) => f.i === null || s + input.k > f.i);
  return (
    <div>
      <Stage width={W} height={height} jump={jump} label={`nums = ${list(a)}`}>
        <RowLabel x={0} y={y1 + 10}>given</RowLabel>
        <ArrayStrip items={a} x0={x0} y={y1} pitch={pitch} h={cell} index={false} cls={(k) => (k === f.i ? 'cur' : '')} />
        <RowLabel x={0} y={y2 + 10}>now</RowLabel>
        <ArrayStrip
          items={f.now} x0={x0} y={y2} pitch={pitch} h={cell}
          bands={live.map((s) => ({ from: s, to: Math.min(n - 1, s + input.k - 1), tone: s === f.i && f.kind === 'flip' ? 'accent' : 'ghost' }))}
          cls={(k) => (k === f.i ? (f.kind === 'fail' ? 'bad' : 'cur') : f.i !== null && k < f.i ? 'kept' : f.now[k] === 0 ? 'dim' : '')}
        />
      </Stage>
      <Chips label="flips started at" chips={f.starts.map((s) => ({ key: s, text: `${s}…${s + input.k - 1}`, tone: live.includes(s) ? 'accent' : 'muted', note: live.includes(s) ? 'active' : undefined }))} empty="none yet" />
    </div>
  );
}

const flipSpec = {
  title: '995: fewest k-bit flips to remove every 0',
  examples: FLIP_WINDOW,
  simulate: flipWindow,
  code: () => flipWindowCode,
  kinds: { start: ['Start', 'neutral'], ok: ['Already 1', 'neutral'], flip: ['Flip', 'accent'], fail: ['Impossible', 'danger'], done: ['Answer', 'success'] },
  describe: (input) => `nums = ${list(input.nums)}, k = ${input.k}`,
  rule: () => 'a 0 at i forces a flip starting at i; the bit is a[i] flipped once per active flip',
  stats: (f) => [['active', String(f.active)], ['flips', String(f.flips)]],
  legend: () => [[<Key shape="box" tone="accent">i</Key>, 'the current index'], [<Key shape="box" tone="accent">·</Key>, 'a flip window (shaded while it still covers i)']],
  fields: () => [{ name: 'nums', label: 'nums (0s and 1s)', placeholder: '0, 0, 0, 1, 0, 1, 1, 0' }, { name: 'k', label: 'k', placeholder: '3', short: true }],
  values: (input) => ({ nums: input.nums.join(', '), k: String(input.k) }),
  parse: parseFlipWindow,
  random: (input) => randomFlipWindow(input),
  hint: () => 'Up to 12 bits and a k between 1 and their length.',
  Stage: FlipStage,
};

export function FlipWindowViz(props) {
  return <StepViz spec={flipSpec} {...props} />;
}
