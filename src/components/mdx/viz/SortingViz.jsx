import { StepViz, Key } from './StepViz';
import { ArrayStrip, Arcs, Brackets, Chips, RowLabel, Stage, pitchFor } from './prims';
import { BUCKETS, QUICKSELECT, bucketCode, buckets, parseBuckets, parseQuickselect, quickselect, quickselectCode, randomBuckets, randomQuickselect } from './models/selection';

/**
 * Step-throughs for the Sorting as a Tool lesson:
 *   <QuickselectViz />                              the k-th largest by partitioning and keeping one side
 *   <BucketViz examples={['counting', 'topk']} />   counting sort and top-k by frequency buckets
 */

const list = (a) => `[${a.join(', ')}]`;
const ord = (k) => `${k}${['st', 'nd', 'rd'][k - 1] ?? 'th'}`;

// ---------------------------------------------------------------- quickselect

const QS_TOP = 52;
const QS_H = 46;
const QS_BRACKET = QS_TOP + QS_H + 62;   // under the index and target rows
const QS_BACK = QS_BRACKET + 22;          // the return arrows of a swap

function QuickselectStage({ step: f, input, width, link, seq, jump }) {
  const n = f.cells.length;
  const pitch = pitchFor(width, n, 38, 62);
  const W = n * pitch;
  const height = QS_BACK + 46;
  const cx = (k) => k * pitch + pitch / 2;
  const scanning = f.i !== null && f.i !== undefined;
  const bands = [];
  if (scanning || f.kind === 'park') {
    if (f.store > f.lo) bands.push({ from: f.lo, to: f.store - 1, tone: 'note', label: '< pivot' });
    const end = scanning ? f.i - 1 : f.lo - 1;
    if (end >= f.store) bands.push({ from: f.store, to: end, tone: 'warn', label: '≥ pivot' });
  }
  const arcs = [];
  if (f.swap && f.from !== undefined) {
    const to = f.kind === 'park' ? f.pivotAt : f.to;
    if (to !== undefined && to !== f.from) {
      arcs.push({ x1: cx(f.from), x2: cx(to), y: QS_TOP - 3, depth: -36, tone: 'accent', faded: true, label: `${f.cells[to].v} → ${to}` });
      arcs.push({ x1: cx(to), x2: cx(f.from), y: QS_BACK, depth: 28, tone: 'warn', faded: true, label: `${f.cells[f.from].v} → ${f.from}` });
    }
  }
  const tags = {};
  const add = (k, label, tone) => { if (k >= 0 && k < n) tags[k] = [...(tags[k] ?? []), { label, tone }]; };
  if (scanning) { add(f.i, 'i', 'accent'); add(f.store, 'store', 'interview'); }
  if (f.kind === 'park') add(f.store, 'store', 'interview');
  const finalSet = new Set(f.final);
  const active = (k) => k >= f.lo && k <= f.hi;
  const pivotCell = f.kind === 'place' || f.kind === 'side' || f.kind === 'done' ? f.p : f.pivotAt;
  const brackets = [];
  if (f.kind === 'side') brackets.push({ x1: f.keep[0] * pitch + 4, x2: (f.keep[1] + 1) * pitch - 4, y: QS_BRACKET, tone: 'success', label: 'keep this side' });
  else if (f.kind !== 'done') brackets.push({ x1: f.lo * pitch + 4, x2: (f.hi + 1) * pitch - 4, y: QS_BRACKET, tone: 'accent', label: `partitioning a[${f.lo}..${f.hi}]` });
  return (
    <Stage width={W} height={height} jump={jump} label={`a = ${list(f.cells.map((c) => c.v))}`}>
      <Arcs id="qs" width={W} height={height} arcs={arcs} />
      <Brackets width={W} height={height} brackets={brackets} />
      <ArrayStrip
        items={f.cells} y={QS_TOP} pitch={pitch} h={QS_H} seq={seq} flight={link?.swap ?? null} bands={bands} tags={tags}
        cls={(k) => [
          f.kind === 'done' && k === f.p && 'hit',
          f.kind !== 'done' && k === pivotCell && 'target',
          scanning && k === f.i && 'cur',
          f.kind === 'side' && k >= f.drop[0] && k <= f.drop[1] && k !== f.p && 'bad',
          f.kind !== 'side' && !active(k) && !(f.kind === 'done' && k === f.p) && 'dim',
          f.kind === 'done' && k !== f.p && 'dim',
        ].filter(Boolean).join(' ')}
        check={(k) => finalSet.has(k)}
        badge={(k) => (k === pivotCell && f.kind !== 'done' ? { text: 'pivot', tone: 'warn' } : null)}
        sub={(k) => (k === f.target ? { text: `target (n − ${input.k})`, tone: f.kind === 'done' ? 'success' : 'accent' } : null)}
      />
    </Stage>
  );
}

const quickselectSpec = {
  title: 'Quickselect: the k-th largest without sorting',
  examples: QUICKSELECT,
  simulate: quickselect,
  code: () => quickselectCode,
  kinds: {
    start: ['Start', 'neutral'],
    park: ['Pick a pivot', 'warn'],
    grow: ['Smaller: in place', 'note'],
    swap: ['Smaller: swap', 'note'],
    skip: ['Not smaller', 'muted'],
    place: ['Pivot placed', 'success'],
    side: ['Keep one side', 'accent'],
    done: ['Answer', 'success'],
  },
  describe: (input) => `nums = ${list(input.nums)}, k = ${input.k}`,
  rule: (input) => `The ${ord(input.k)} largest is the value at index n − k once sorted.`,
  stats: (f) => [['lo', f.lo], ['hi', f.hi], ['partitions', f.partitions], ['comparisons', f.comparisons]],
  legend: () => [
    [<Key shape="box" tone="warn">pivot</Key>, 'the pivot'],
    [<Key shape="box" tone="note">&lt;</Key>, 'smaller than the pivot'],
    [<Key shape="box" tone="warn">≥</Key>, 'not smaller'],
    [<Key shape="text" tone="success">✓</Key>, 'in its final sorted place'],
  ],
  fields: () => [{ name: 'nums', label: 'nums', placeholder: 'e.g. 3, 2, 1, 5, 6, 4' }, { name: 'k', label: 'k', placeholder: '2', short: true }],
  values: (input) => ({ nums: input.nums.join(', '), k: String(input.k) }),
  parse: (values) => parseQuickselect(values),
  random: () => randomQuickselect(),
  hint: () => 'Up to 10 numbers and k from 1 (the largest) to n (the smallest). Repeats are fine.',
  delay: (f) => (f.kind === 'skip' || f.kind === 'grow' ? 1500 : 2400),
  Stage: QuickselectStage,
};

export function QuickselectViz(props) {
  return <StepViz spec={quickselectSpec} {...props} />;
}

// ---------------------------------------------------------------- counting sort and buckets

function BucketStage({ step: f, input, width, seq, jump }) {
  const a = input.nums;
  const n = a.length;
  if (input.mode === 'counting') {
    const max = Math.max(...a);
    const cols = Math.max(n, max + 1);
    const pitch = pitchFor(width, cols, 34, 56);
    const W = cols * pitch;
    const rows = [20, 20 + 92, 20 + 184];
    const height = rows[2] + 64;
    const outItems = Array.from({ length: n }, (_, k) => (k < f.out.length ? f.out[k] : '·'));
    const written = f.kind === 'write' ? new Set(Array.from({ length: f.written }, (_, t) => f.out.length - 1 - t)) : new Set();
    return (
      <Stage width={W} height={height} jump={jump} label={`nums = ${list(a)}`}>
        <RowLabel y={rows[0] - 18}>input</RowLabel>
        <ArrayStrip items={a} y={rows[0]} pitch={pitch} h={40} cls={(k) => [f.kind === 'count' && k === f.i && 'cur', f.kind !== 'count' && f.kind !== 'start' && 'dim'].filter(Boolean).join(' ')} />
        <RowLabel y={rows[1] - 18}>count[v] (index = the value)</RowLabel>
        <ArrayStrip
          items={f.count} y={rows[1]} pitch={pitch} h={40} seq={seq} indexLabel={(k) => `v=${k}`}
          cls={(k) => [(f.kind === 'count' || f.kind === 'write' || f.kind === 'empty') && k === f.v && (f.kind === 'empty' ? 'muted' : 'hit'), f.count[k] === 0 && 'muted'].filter(Boolean).join(' ')}
        />
        <RowLabel y={rows[2] - 18}>output, in order</RowLabel>
        <ArrayStrip items={outItems} y={rows[2]} pitch={pitch} h={40} seq={seq} cls={(k) => [k >= f.out.length && 'muted', written.has(k) && 'hit'].filter(Boolean).join(' ')} />
      </Stage>
    );
  }
  const cols = n + 1;
  const pitch = pitchFor(width, Math.max(n, cols), 36, 60);
  const W = Math.max(n, cols) * pitch;
  const rows = [20, 20 + 92];
  const height = rows[1] + 66;
  const bucket = f.bucket ?? Array.from({ length: cols }, () => []);
  return (
    <>
      <Stage width={W} height={height} jump={jump} label={`nums = ${list(a)}`}>
        <RowLabel y={rows[0] - 18}>input</RowLabel>
        <ArrayStrip items={a} y={rows[0]} pitch={pitch} h={40} cls={(k) => [f.kind === 'count' && k === f.i && 'cur', f.kind === 'count' && a[k] === f.v && k < f.i && 'kept'].filter(Boolean).join(' ')} />
        <RowLabel y={rows[1] - 18}>bucket[f]: values seen exactly f times</RowLabel>
        <ArrayStrip
          items={bucket.map((b) => (b.length ? b.join(',') : '·'))} y={rows[1]} pitch={pitch} h={40} seq={seq} mono indexLabel={(k) => `f=${k}`}
          cls={(k) => [
            !bucket[k].length && 'muted',
            f.kind === 'bucket' && k === f.f && 'hit',
            f.kind === 'take' && k === f.f && 'cur',
            f.kind === 'take' && k > f.f && bucket[k].length > 0 && 'dim',
          ].filter(Boolean).join(' ')}
        />
      </Stage>
      <Chips label="freq:" seq={seq} empty="{ }" chips={f.freq.map(({ value, f: c }) => ({ key: `f${value}`, text: `${value} × ${c}`, tone: f.kind === 'count' && value === f.v ? 'accent' : f.kind === 'bucket' && value === f.v ? 'accent' : undefined }))} />
      <Chips label={`top ${input.k}:`} seq={seq} empty="—" chips={(f.out ?? []).map((v) => ({ key: `o${v}`, text: String(v), tone: f.kind === 'take' && f.took.includes(v) ? 'hit' : 'accent', isNew: f.kind === 'take' && f.took.includes(v) }))} />
    </>
  );
}

const bucketSpec = {
  title: 'Counting and buckets: no comparisons',
  examples: BUCKETS,
  simulate: buckets,
  code: (input) => bucketCode[input.mode],
  kinds: {
    start: ['Start', 'neutral'],
    count: ['Count', 'accent'],
    empty: ['Empty slot', 'muted'],
    write: ['Write', 'success'],
    bucket: ['Into a bucket', 'interview'],
    take: ['Take', 'success'],
    done: ['Answer', 'success'],
  },
  describe: (input) => (input.mode === 'counting' ? `nums = ${list(input.nums)}` : `nums = ${list(input.nums)}, k = ${input.k}`),
  rule: (input) => (input.mode === 'counting' ? 'Small whole numbers: use each value as an index.' : 'A count is at most n: use it as an index too.'),
  stats: (f, input) => (input.mode === 'counting' ? [['written', `${f.out.length} / ${input.nums.length}`]] : [['distinct', f.freq.length]]),
  legend: (f, input) => (input.mode === 'counting'
    ? [[<Key shape="box" tone="accent">x</Key>, 'value being counted'], [<Key shape="box" tone="success">v</Key>, 'slot being used'], [<Key shape="dashed">0</Key>, 'empty']]
    : [[<Key shape="box" tone="success">f</Key>, 'bucket being filled'], [<Key shape="box" tone="accent">f</Key>, 'bucket being read'], [<Key shape="dashed">·</Key>, 'empty bucket']]),
  fields: (input) => (input.mode === 'counting'
    ? [{ name: 'nums', label: 'nums (0 to 9)', placeholder: 'e.g. 2, 0, 2, 1, 1, 0' }]
    : [{ name: 'nums', label: 'nums', placeholder: 'e.g. 4, 1, -1, 2, -1, 2, 3' }, { name: 'k', label: 'k', placeholder: '2', short: true }]),
  values: (input) => (input.mode === 'counting' ? { nums: input.nums.join(', ') } : { nums: input.nums.join(', '), k: String(input.k) }),
  parse: parseBuckets,
  random: (input) => randomBuckets(input),
  hint: (input) => (input.mode === 'counting' ? 'Up to 12 whole numbers from 0 to 9.' : 'Up to 12 numbers and k up to the number of distinct values.'),
  delay: (f) => (f.kind === 'count' || f.kind === 'empty' ? 1400 : 2400),
  Stage: BucketStage,
};

export function BucketViz(props) {
  return <StepViz spec={bucketSpec} {...props} />;
}
