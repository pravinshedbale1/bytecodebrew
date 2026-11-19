import { StepViz, Key } from './StepViz';
import { ArrayStrip, Chips, RowLabel, Stage, pitchFor } from './prims';
import {
  LAZY_HEAP, LIMIT_WINDOW, MAX_QUEUE, PARTITION_K,
  lazyHeap, lazyHeapCode, lazyHeapText, limitWindow, limitWindowCode, maxQueue, maxQueueCode, maxQueueText, partitionK, partitionKCode,
  parseLazyHeap, parseLimitWindow, parseMaxQueue, parsePartitionK, randomLazyHeap, randomLimitWindow, randomMaxQueue, randomPartitionK,
} from './models/queues';

/**
 * Step-throughs for queue and heap design:
 *   <MaxQueueViz />     a queue with O(1) max (or min): a monotonic deque beside it   (Monotonic Stack lesson)
 *   <LimitWindowViz />  1438: a sliding window guarded by a max-deque and a min-deque  (Monotonic Stack lesson)
 *   <LazyHeapViz />     Stock Price Fluctuation: heaps with lazy deletion              (Designing Data Structures)
 *   <PartitionKViz />   2294: sort, then open a new group when the gap exceeds k       (Greedy)
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
          bands={[...(f.bestAt ? [{ from: f.bestAt[0], to: f.bestAt[1], tone: 'ghost' }] : []), ...(f.r !== null ? [{ from: f.l, to: f.r, tone: f.kind === 'grow' && a[f.maxQ[0]] - a[f.minQ[0]] > input.limit ? 'danger' : 'accent' }] : [])]}
          cls={(k) => (f.kind === 'shrink' && k >= f.from && k < f.l ? 'bad' : f.r !== null && k > f.r ? 'muted' : inWin(k) ? '' : f.r !== null ? 'dim' : '')}
        />
      </Stage>
      <Chips label="maxQ (front → back)" chips={f.maxQ.map((i, k) => ({ key: i, text: `${a[i]}`, note: `i${i}`, tone: k === 0 ? 'warn' : undefined }))} empty="empty" />
      <Chips label="minQ (front → back)" chips={f.minQ.map((i, k) => ({ key: i, text: `${a[i]}`, note: `i${i}`, tone: k === 0 ? 'note' : undefined }))} empty="empty" />
    </div>
  );
}

const limitSpec = {
  title: '1438: a window with a max queue and a min queue',
  examples: LIMIT_WINDOW,
  simulate: limitWindow,
  code: () => limitWindowCode,
  kinds: { start: ['Start', 'neutral'], grow: ['Add', 'accent'], shrink: ['Shrink', 'warn'], best: ['Best', 'success'], done: ['Answer', 'success'] },
  describe: (input) => `nums = ${list(input.nums)}, limit = ${input.limit}`,
  rule: () => 'window is fine while max − min ≤ limit; max and min come from the deque fronts',
  stats: (f) => [['best', String(f.best)]],
  legend: () => [[<Key shape="box" tone="accent">·</Key>, 'the window [l, r]'], [<Key shape="box" tone="warn">max</Key>, 'front of maxQ'], [<Key shape="box" tone="note">min</Key>, 'front of minQ'], [<Key shape="box" tone="success">·</Key>, 'best window so far (dashed)']],
  fields: () => [{ name: 'nums', label: 'nums', placeholder: '10, 1, 2, 4, 7, 2' }, { name: 'limit', label: 'limit', placeholder: '5', short: true }],
  values: (input) => ({ nums: input.nums.join(', '), limit: String(input.limit) }),
  parse: parseLimitWindow,
  random: (input) => randomLimitWindow(input),
  hint: () => 'Up to 10 numbers between 1 and 30, and a limit from 0 to 30.',
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
