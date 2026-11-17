import { StepViz, Key } from './StepViz';
import { ArrayStrip, Brackets, Chips, Stage, pitchFor } from './prims';
import styles from './ContributionViz.module.css';
import {
  BIT_CONTRIB, EDGES, LAST_SEEN, MIN_SPAN, SORTED, SPAN, WINDOW,
  bitContrib, bitContribCode, bitWidthOf, edgesCode, edgesModel, edgesText, lastSeen, lastSeenCode, minSpan, minSpanCode,
  parseBitContrib, parseEdges, parseLastSeen, parseMinSpan, parseSorted, parseSpan, parseWindow,
  randomBitContrib, randomEdges, randomLastSeen, randomMinSpan, randomSorted, randomSpan, randomWindow,
  sorted, sortedCode, span, spanCode, windowCode, windowCount,
} from './models/contribution';

/**
 * Step-throughs for the Contribution Technique lesson. Each one turns "add up something over every
 * subarray / pair / subset / substring / path" around into "how much does this one element add?":
 *   <SpanViz />         (i + 1) · (n − i): the subarrays containing i are a rectangle of starts × ends
 *   <BitContribViz />   one bit column at a time: ones × zeros pairs differ there
 *   <SortedContribViz /> sort, then a[i] × (how many) − (their sum) with prefix sums
 *   <LastSeenViz />     a letter counts from just after its previous copy (and up to its next one)
 *   <MinSpanViz />      a[i] is the minimum between its nearest smaller neighbours (monotonic stack)
 *   <WindowCountViz />  every valid subarray is credited to its right end: r − l + 1
 *   <EdgeContribViz />  a tree edge is crossed by size × (n − size) paths (or ⌈size / seats⌉ cars)
 */

const list = (a) => `[${a.join(', ')}]`;
const cellX = (x0, pitch) => ({ left: (k) => x0 + k * pitch + 4, right: (k) => x0 + (k + 1) * pitch - 4 });

function Parts({ label, parts, kind, empty = 'none yet' }) {
  return <Chips label={label} chips={parts.map((c, k) => ({ key: k, text: String(c), tone: kind === 'done' ? 'success' : 'accent', isNew: k === parts.length - 1 && kind !== 'done' && kind !== 'start' }))} empty={empty} />;
}

// ---------------------------------------------------------------- span

function SpanStage({ step: f, input, width, jump }) {
  const a = input.nums;
  const n = a.length;
  const pitch = pitchFor(width - 20, n, 40, 60);
  const W = n * pitch;
  const top = 74;
  const h = 44;
  const height = top + h + 34;
  const { left, right } = cellX(0, pitch);
  const brackets = f.i === null ? [] : [
    { x1: left(0), x2: right(f.i), y: 22, up: true, tone: 'warn', label: `start: ${f.L} choice${f.L === 1 ? '' : 's'}` },
    { x1: left(f.i), x2: right(n - 1), y: 52, up: true, tone: 'accent', label: `end: ${f.R} choice${f.R === 1 ? '' : 's'}` },
  ];
  const cell = Math.max(18, Math.min(30, Math.floor((Math.min(width, 420) - 60) / n)));
  return (
    <div className={styles.col}>
      <Stage width={W} height={height} jump={jump} label={`nums = ${list(a)}`}>
        <Brackets width={W} height={height} brackets={brackets} />
        <ArrayStrip items={a} y={top} pitch={pitch} h={h} cls={(k) => (f.i === null ? '' : k === f.i ? 'cur' : k < f.i ? 'warm' : '')} />
      </Stage>
      <div className={styles.gridWrap}>
        <span className={styles.axisY}>start →</span>
        <div className={styles.grid} style={{ gridTemplateColumns: `22px repeat(${n}, ${cell}px)` }} role="img" aria-label="every subarray as a start × end cell">
          <span className={styles.axisX}>end</span>
          {a.map((_, r) => <span key={`h${r}`} className={styles.head}>{r}</span>)}
          {a.map((_, l) => [
            <span key={`r${l}`} className={styles.head}>{l}</span>,
            ...a.map((__, r) => {
              if (l > r) return <span key={`${l}-${r}`} />;
              const inside = f.i !== null && l <= f.i && f.i <= r;
              const even = f.mode === 'odd' && (r - l) % 2 === 1;
              return <span key={`${l}-${r}`} className={[styles.sq, inside && (even ? styles.sqEven : styles.sqIn), !inside && even && styles.sqOff].filter(Boolean).join(' ')} style={{ height: cell }} title={`[${l}..${r}]`} />;
            }),
          ])}
        </div>
      </div>
      <Parts label="contributions" parts={f.contribs} kind={f.kind} />
    </div>
  );
}

const spanSpec = {
  title: 'Contribution: how many subarrays contain a[i]?',
  examples: SPAN,
  simulate: span,
  code: (input) => spanCode(input.mode),
  kinds: { start: ['Start', 'neutral'], count: ['Count', 'accent'], done: ['Answer', 'success'] },
  describe: (input) => `nums = ${list(input.nums)}`,
  rule: (input) => (input.mode === 'odd' ? 'a[i] adds a[i] × ⌈(i + 1)(n − i) / 2⌉' : 'a[i] adds a[i] × (i + 1) × (n − i)'),
  stats: (f) => [['total', String(f.total)]],
  legend: (f, input) => [
    [<Key shape="box" tone="warn">·</Key>, 'possible starts'],
    [<Key shape="box" tone="accent">i</Key>, 'the element counted'],
    [<Key shape="box" tone="success">■</Key>, input.mode === 'odd' ? 'odd-length subarrays containing i' : 'subarrays containing i'],
    ...(input.mode === 'odd' ? [[<Key shape="box" tone="danger">■</Key>, 'even length: not counted']] : []),
  ],
  fields: () => [{ name: 'nums', label: 'nums', placeholder: '3, 1, 2, 4' }],
  values: (input) => ({ nums: input.nums.join(', ') }),
  parse: parseSpan,
  random: (input) => randomSpan(input),
  hint: () => 'Up to 8 numbers between −20 and 50.',
  Stage: SpanStage,
};

export function SpanViz(props) {
  return <StepViz spec={spanSpec} {...props} />;
}

// ---------------------------------------------------------------- bits

function BitStage({ step: f, input, width }) {
  const a = input.nums;
  const w = f.w;
  const cell = Math.max(26, Math.min(38, Math.floor((Math.min(width, 480) - 110) / w)));
  const done = new Set(f.parts.map((_, k) => k));
  return (
    <div className={styles.col}>
      <div className={styles.bits} style={{ gridTemplateColumns: `64px repeat(${w}, ${cell}px)` }}>
        <span className={styles.place}>bit</span>
        {Array.from({ length: w }, (_, k) => {
          const b = w - 1 - k;
          return <span key={k} className={`${styles.place} ${b === f.b ? styles.placeOn : ''}`}>{b} <small>({2 ** b})</small></span>;
        })}
        {a.map((v, r) => [
          <span key={`l${r}`} className={styles.rowLabel}>{v}</span>,
          ...Array.from({ length: w }, (_, k) => {
            const b = w - 1 - k;
            const bit = (v >> b) & 1;
            return <span key={`${r}-${k}`} className={[styles.bit, bit ? styles.one : styles.zero, b === f.b && styles.colOn, f.b !== null && b !== f.b && styles.colOff].filter(Boolean).join(' ')} style={{ height: cell - 4 }}>{bit}</span>;
          }),
        ])}
        <span className={styles.rowLabel}>adds</span>
        {Array.from({ length: w }, (_, k) => {
          const b = w - 1 - k;
          return <span key={`c${k}`} className={`${styles.colSum} ${b === f.b ? styles.colSumOn : ''}`}>{done.has(b) ? f.parts[b] : ''}</span>;
        })}
      </div>
      {f.b !== null && <p className={styles.note}>column {f.b}: <b>{f.ones}</b> one{f.ones === 1 ? '' : 's'}, <b>{f.zeros}</b> zero{f.zeros === 1 ? '' : 's'}</p>}
    </div>
  );
}

const bitSpec = {
  title: 'Contribution, one bit column at a time',
  examples: BIT_CONTRIB,
  simulate: bitContrib,
  code: (input) => bitContribCode(input.mode),
  kinds: { start: ['Start', 'neutral'], column: ['Column', 'accent'], skip: ['Adds 0', 'neutral'], done: ['Answer', 'success'] },
  describe: (input) => `nums = ${list(input.nums)}`,
  rule: (input) => ({ hamming: 'bit b adds ones × zeros', pairxor: 'bit b adds ones × zeros × 2^b', subsetxor: 'bit b adds 2^(n−1) × 2^b if any number has it' })[input.mode],
  stats: (f) => [['total', String(f.total)]],
  legend: () => [[<Key shape="box" tone="accent">1</Key>, 'a 1-bit'], [<Key shape="box" tone="warn">b</Key>, 'the column being counted']],
  fields: (input) => [{ name: 'nums', label: `nums (0 to 63${input.mode === 'subsetxor' ? ', up to 6' : ''})`, placeholder: '4, 14, 2' }],
  values: (input) => ({ nums: input.nums.join(', ') }),
  parse: parseBitContrib,
  random: (input) => randomBitContrib(input),
  hint: () => 'Small values keep the columns readable; the real problems loop over 32 bits the same way.',
  Stage: BitStage,
};

export function BitContribViz(props) {
  return <StepViz spec={bitSpec} {...props} />;
}

// ---------------------------------------------------------------- sorted + prefix sums

function SortedStage({ step: f, input, width, jump }) {
  const a = f.a;
  const n = a.length;
  const pitch = pitchFor(width - 20, n, 42, 62);
  const W = n * pitch;
  const top = 58;
  const h = 44;
  const height = top + h + (input.mode === 'pairs' ? 30 : 64);
  const { left, right } = cellX(0, pitch);
  const brackets = [];
  if (f.i !== null) {
    if (f.i > 0) brackets.push({ x1: left(0), x2: right(f.i - 1), y: 30, up: true, tone: 'warn', label: input.mode === 'widths' ? `2^${f.i} = ${2 ** f.i} subsets → max` : `${f.i} smaller, sum p[${f.i}] = ${f.p[f.i]}` });
    if ((input.mode === 'each' || input.mode === 'widths') && f.i < n - 1) brackets.push({ x1: left(f.i + 1), x2: right(n - 1), y: top + h + 34, tone: 'note', label: input.mode === 'widths' ? `2^${n - 1 - f.i} = ${2 ** (n - 1 - f.i)} → min` : `${n - 1 - f.i} larger, sum ${f.p[n] - f.p[f.i + 1]}` });
  }
  return (
    <div className={styles.col}>
      <Stage width={W} height={height} jump={jump} label={`sorted a = ${list(a)}`}>
        <Brackets width={W} height={height} brackets={brackets} />
        <ArrayStrip items={a} y={top} pitch={pitch} h={h} cls={(k) => (f.i === null ? '' : k === f.i ? 'cur' : k < f.i ? 'warm' : input.mode === 'pairs' ? 'dim' : 'note')} />
      </Stage>
      {input.mode === 'each'
        ? <Chips label="res" chips={f.res.map((v, k) => ({ key: k, text: String(v), tone: f.kind === 'done' ? 'success' : 'accent', isNew: k === f.res.length - 1 && f.kind === 'element' }))} empty="none yet" />
        : <Parts label="contributions" parts={f.parts} kind={f.kind} />}
    </div>
  );
}

const sortedSpec = {
  title: 'Contribution after sorting, with prefix sums',
  examples: SORTED,
  simulate: sorted,
  code: (input) => sortedCode(input.mode),
  kinds: { start: ['Start', 'neutral'], element: ['Element', 'accent'], done: ['Answer', 'success'] },
  describe: (input) => `nums = ${list(input.nums)}`,
  rule: (input) => ({ pairs: 'sorted: a[i] adds a[i] × i − (a[0] + … + a[i−1])', each: 'left = a[i]·i − p[i], right = (p[n] − p[i+1]) − a[i]·(n−1−i)', widths: 'a[i] adds a[i] × (2^i − 2^(n−1−i))' })[input.mode],
  stats: (f) => (f.total === undefined ? [] : [['total', String(f.total)]]),
  legend: (f, input) => [
    [<Key shape="box" tone="accent">i</Key>, 'current element'],
    [<Key shape="box" tone="warn">·</Key>, 'the smaller values (left)'],
    ...(input.mode === 'pairs' ? [] : [[<Key shape="box" tone="note">·</Key>, 'the larger values (right)']]),
  ],
  fields: (input) => [{ name: 'nums', label: input.mode === 'each' ? 'nums (sorted)' : 'nums', placeholder: input.mode === 'each' ? '1, 4, 6, 8, 10' : '4, 1, 7, 3' }],
  values: (input) => ({ nums: input.nums.join(', ') }),
  parse: parseSorted,
  random: (input) => randomSorted(input),
  hint: (input) => (input.mode === 'widths' ? 'Up to 6 numbers (2ⁿ subsequences for the check).' : 'Up to 8 numbers between 0 and 40.'),
  Stage: SortedStage,
};

export function SortedContribViz(props) {
  return <StepViz spec={sortedSpec} {...props} />;
}

// ---------------------------------------------------------------- last seen (strings)

function LastSeenStage({ step: f, input, width, jump }) {
  const s = input.s;
  const n = s.length;
  const pitch = pitchFor(width - 20, n, 38, 58);
  const W = n * pitch;
  const top = 74;
  const h = 44;
  const height = top + h + 40;
  const { left, right } = cellX(0, pitch);
  const brackets = f.i === null ? [] : [
    { x1: left(f.p + 1), x2: right(f.i), y: 22, up: true, tone: 'warn', label: `start: ${f.L}` },
    { x1: left(f.i), x2: right(f.q - 1), y: 52, up: true, tone: 'accent', label: `end: ${f.R}` },
  ];
  const tags = {};
  if (f.i !== null && f.p >= 0) tags[f.p] = [{ label: 'prev', tone: 'danger' }];
  if (f.i !== null && f.q < n) tags[f.q] = [{ label: 'next', tone: 'danger' }];
  return (
    <div className={styles.col}>
      <Stage width={W} height={height} jump={jump} label={`s = ${s}`}>
        <Brackets width={W} height={height} brackets={brackets} />
        <ArrayStrip
          items={[...s]} y={top} pitch={pitch} h={h} tags={tags}
          cls={(k) => (f.i === null ? '' : k === f.i ? 'cur' : (k === f.p || k === f.q) ? 'bad' : s[k] === s[f.i] ? 'target' : '')}
        />
      </Stage>
      {input.mode === 'appeal' && <Chips label="last seen" chips={Object.entries(f.last).sort().map(([c, k]) => ({ key: c, text: `${c}: ${k}`, tone: f.i !== null && c === s[f.i] ? 'warn' : undefined }))} empty="nothing yet (−1)" />}
      <Parts label="contributions" parts={f.parts} kind={f.kind} />
    </div>
  );
}

const lastSeenSpec = {
  title: 'Contribution in strings: from the previous copy to the next',
  examples: LAST_SEEN,
  simulate: lastSeen,
  code: (input) => lastSeenCode(input.mode),
  kinds: { start: ['Start', 'neutral'], char: ['Letter', 'accent'], done: ['Answer', 'success'] },
  describe: (input) => `s = "${input.s}"`,
  rule: (input) => (input.mode === 'appeal' ? 's[i] adds (i − last[s[i]]) × (n − i)' : 's[i] adds (i − prev[i]) × (next[i] − i)'),
  stats: (f) => [['total', String(f.total)]],
  legend: () => [[<Key shape="box" tone="accent">i</Key>, 'current letter'], [<Key shape="box" tone="danger">c</Key>, 'the copy that blocks'], [<Key shape="box" tone="warn">·</Key>, 'possible starts']],
  fields: () => [{ name: 's', label: 's', placeholder: 'abbca' }],
  values: (input) => ({ s: input.s }),
  parse: parseLastSeen,
  random: (input) => randomLastSeen(input),
  hint: () => '1 to 10 lowercase letters. Repeat a letter to see the start range shrink.',
  Stage: LastSeenStage,
};

export function LastSeenViz(props) {
  return <StepViz spec={lastSeenSpec} {...props} />;
}

// ---------------------------------------------------------------- monotonic-stack spans

function MinSpanStage({ step: f, input, width, jump }) {
  const a = input.nums;
  const n = a.length;
  const pitch = pitchFor(width - 20, n, 40, 60);
  const W = n * pitch;
  const top = 74;
  const h = 44;
  const height = top + h + 40;
  const { left, right } = cellX(0, pitch);
  const i = f.i;
  const brackets = i === null ? [] : [
    { x1: left(f.prev[i] + 1), x2: right(i), y: 22, up: true, tone: 'warn', label: `start: ${f.L}` },
    { x1: left(i), x2: right(f.next[i] - 1), y: 52, up: true, tone: 'accent', label: `end: ${f.R}` },
  ];
  const tags = {};
  if (i !== null && f.prev[i] >= 0) tags[f.prev[i]] = [{ label: 'prev', tone: 'danger' }];
  if (i !== null && f.next[i] < n) tags[f.next[i]] = [{ label: a[f.next[i]] === a[i] ? 'next (tie)' : 'next', tone: 'danger' }];
  return (
    <div className={styles.col}>
      <Stage width={W} height={height} jump={jump} label={`nums = ${list(a)}`}>
        <Brackets width={W} height={height} brackets={brackets} />
        <ArrayStrip
          items={a} y={top} pitch={pitch} h={h} tags={tags}
          bands={i === null ? [] : [{ from: f.prev[i] + 1, to: f.next[i] - 1, tone: 'success' }]}
          cls={(k) => (i === null ? '' : k === i ? 'cur' : k === f.prev[i] || k === f.next[i] ? 'bad' : k < f.prev[i] || k > f.next[i] ? 'dim' : '')}
        />
      </Stage>
      <Parts label="contributions" parts={f.parts} kind={f.kind} />
    </div>
  );
}

const minSpanSpec = {
  title: 'Contribution with a monotonic stack: where is a[i] the minimum?',
  examples: MIN_SPAN,
  simulate: minSpan,
  code: (input) => minSpanCode(input.mode),
  kinds: { start: ['Start', 'neutral'], span: ['Span', 'accent'], done: ['Answer', 'success'] },
  describe: (input) => `nums = ${list(input.nums)}`,
  rule: () => 'a[i] adds a[i] × (i − prev[i]) × (next[i] − i)',
  stats: (f) => [['total', String(f.total)]],
  legend: (f, input) => [
    [<Key shape="box" tone="accent">i</Key>, 'current element'],
    [<Key shape="box" tone="success">·</Key>, `where it is the ${input.mode === 'max' ? 'maximum' : 'minimum'}`],
    [<Key shape="box" tone="danger">·</Key>, 'the nearest value that stops it'],
  ],
  fields: () => [{ name: 'nums', label: 'nums', placeholder: '3, 1, 2, 4' }],
  values: (input) => ({ nums: input.nums.join(', ') }),
  parse: parseMinSpan,
  random: (input) => randomMinSpan(input),
  hint: () => 'Up to 8 numbers between 1 and 30. Repeat a value to see how ties are split.',
  Stage: MinSpanStage,
};

export function MinSpanViz(props) {
  return <StepViz spec={minSpanSpec} {...props} />;
}

// ---------------------------------------------------------------- sliding window counts

function WindowStage({ step: f, input, width, jump }) {
  const a = input.nums;
  const n = a.length;
  const pitch = pitchFor(width - 20, n, 40, 60);
  const W = n * pitch;
  const top = 20;
  const h = 44;
  const rows = f.kind === 'count' ? f.add : 0;
  const height = top + h + 36 + Math.max(1, n) * 16;
  const { left, right } = cellX(0, pitch);
  const brackets = [];
  if (f.kind === 'count') for (let s = f.l; s <= f.r; s++) brackets.push({ x1: left(s), x2: right(f.r), y: top + h + 34 + (s - f.l) * 16, tone: 'success' });
  const inWin = (k) => f.r !== null && k >= f.l && k <= f.r;
  return (
    <div className={styles.col}>
      <Stage width={W} height={height} jump={jump} label={`nums = ${list(a)}`}>
        <Brackets width={W} height={height} brackets={brackets} />
        <ArrayStrip
          items={a} y={top} pitch={pitch} h={h}
          bands={f.r !== null && f.l <= f.r ? [{ from: f.l, to: f.r, tone: 'accent' }] : []}
          tags={f.r === null ? {} : { ...(f.l <= f.r ? { [f.l]: [{ label: 'l', tone: 'warn' }] } : {}), [f.r]: [...(f.l === f.r ? [{ label: 'l', tone: 'warn' }] : []), { label: 'r', tone: 'accent' }] }}
          cls={(k) => (f.kind === 'shrink' && k >= f.dropped[0] && k <= f.dropped[1] ? 'bad' : f.r !== null && k > f.r ? 'muted' : inWin(k) ? '' : f.r !== null ? 'dim' : '')}
        />
      </Stage>
      {rows > 0 && <p className={styles.note}>{rows} subarray{rows === 1 ? '' : 's'} end at r = {f.r}: [{f.l}..{f.r}]{rows > 1 ? ` … [${f.r}..${f.r}]` : ''}</p>}
      <Parts label="added per r" parts={f.parts} kind={f.kind} />
    </div>
  );
}

const windowSpec = {
  title: 'Contribution of each right end: r − l + 1',
  examples: WINDOW,
  simulate: windowCount,
  code: (input) => windowCode(input.mode),
  kinds: { start: ['Start', 'neutral'], shrink: ['Shrink', 'warn'], count: ['Count', 'accent'], done: ['Answer', 'success'] },
  describe: (input) => `nums = ${list(input.nums)}, k = ${input.k}`,
  rule: (input) => (input.mode === 'product' ? 'product < k' : 'sum × length < k'),
  stats: (f) => [['count', String(f.count)]],
  legend: () => [[<Key shape="box" tone="accent">·</Key>, 'the window [l, r]'], [<Key shape="box" tone="danger">·</Key>, 'dropped from the left'], [<Key shape="pill" tone="success">⎵</Key>, 'subarrays ending at r']],
  fields: () => [{ name: 'nums', label: 'nums (positive)', placeholder: '10, 5, 2, 6' }, { name: 'k', label: 'k', placeholder: '100', short: true }],
  values: (input) => ({ nums: input.nums.join(', '), k: String(input.k) }),
  parse: parseWindow,
  random: (input) => randomWindow(input),
  hint: () => 'Up to 9 numbers between 1 and 30. Positive values are what make the window valid.',
  Stage: WindowStage,
};

export function WindowCountViz(props) {
  return <StepViz spec={windowSpec} {...props} />;
}

// ---------------------------------------------------------------- tree edges

function treeLayout(n, kids) {
  const x = Array(n).fill(0);
  let slot = 0;
  const place = (v) => {
    if (!kids[v].length) { x[v] = slot++; return; }
    kids[v].forEach(place);
    x[v] = (x[kids[v][0]] + x[kids[v].at(-1)]) / 2;
  };
  place(0);
  return { x, slots: Math.max(1, slot) };
}

function EdgeStage({ step: f, input, width }) {
  const { n } = input;
  const { x, slots } = treeLayout(n, f.kids);
  const levels = Math.max(...f.depth) + 1;
  const gap = Math.max(46, Math.min(84, Math.floor((Math.min(width, 560) - 40) / slots)));
  const W = slots * gap + 20;
  const H = levels * 74 + 20;
  const px = (v) => 10 + x[v] * gap + gap / 2;
  const py = (v) => 30 + f.depth[v] * 74;
  const inSub = new Set();
  if (f.v !== null) { const walk = (v) => { inSub.add(v); f.kids[v].forEach(walk); }; walk(f.v); }
  return (
    <div className={styles.col}>
      <svg width={W} height={H} className={styles.tree} role="img" aria-label={`tree with edges ${edgesText(input.edges)}`}>
        {Array.from({ length: n }, (_, v) => v).filter((v) => v !== 0).map((v) => {
          const on = f.v === v;
          const p = f.parent[v];
          return (
            <g key={`e${v}`} className={on ? styles.edgeOn : inSub.has(v) ? styles.edgeSub : styles.edge}>
              <line x1={px(p)} y1={py(p)} x2={px(v)} y2={py(v)} />
              {on && <text x={(px(p) + px(v)) / 2 + 8} y={(py(p) + py(v)) / 2} className={styles.edgeLabel}>{f.c}</text>}
            </g>
          );
        })}
        {Array.from({ length: n }, (_, v) => (
          <g key={`n${v}`} className={f.v === null ? styles.node : inSub.has(v) ? styles.nodeSub : styles.nodeRest}>
            <circle cx={px(v)} cy={py(v)} r={16} />
            <text x={px(v)} y={py(v) + 4} textAnchor="middle">{v}</text>
            {f.size[v] > 0 && <text x={px(v) + 20} y={py(v) - 12} className={styles.sizeLabel}>{f.size[v]}</text>}
          </g>
        ))}
      </svg>
      <p className={styles.note}>small numbers = subtree sizes found so far{input.mode === 'fuel' ? ` · ${input.seats} seat${input.seats === 1 ? '' : 's'} per car` : ''}</p>
      <Parts label="per edge" parts={f.parts} kind={f.kind} />
    </div>
  );
}

const edgeSpec = {
  title: 'Contribution of each tree edge',
  examples: EDGES,
  simulate: edgesModel,
  code: (input) => edgesCode(input.mode),
  kinds: { start: ['Start', 'neutral'], edge: ['Edge', 'accent'], done: ['Answer', 'success'] },
  describe: (input) => `edges = ${edgesText(input.edges)}${input.mode === 'fuel' ? `, seats = ${input.seats}` : ''}`,
  rule: (input) => (input.mode === 'fuel' ? 'road above v costs ⌈size(v) / seats⌉' : 'edge above v adds size(v) × (n − size(v))'),
  stats: (f) => [['total', String(f.total)]],
  legend: () => [[<Key shape="box" tone="success">v</Key>, 'the subtree below the edge'], [<Key shape="box" tone="warn">—</Key>, 'the edge counted'], [<Key shape="box" tone="accent">v</Key>, 'the rest of the tree']],
  fields: (input) => [{ name: 'edges', label: 'edges', placeholder: '0-1, 0-2, 2-3' }, ...(input.mode === 'fuel' ? [{ name: 'seats', label: 'seats', placeholder: '2', short: true }] : [])],
  values: (input) => ({ edges: edgesText(input.edges), seats: String(input.seats ?? '') }),
  parse: parseEdges,
  random: (input) => randomEdges(input),
  hint: () => 'Up to 9 edges between nodes 0, 1, 2, … that form one tree (rooted at 0).',
  Stage: EdgeStage,
};

export function EdgeContribViz(props) {
  return <StepViz spec={edgeSpec} {...props} />;
}
