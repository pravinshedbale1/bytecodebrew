import { StepViz, Key } from './StepViz';
import { ArrayStrip, RowLabel, Stage, pitchFor } from './prims';
import { CmpCard, Lane, Pile } from './sideKit';
import { GridCells } from './GraphsViz';
import { TreeGraph } from './TreesViz';
import styles from './sideKit.module.css';
import {
  BFS_QUEUE, CALL_STACK, DEQUE_SIDE, STACK_QUEUE, WINDOW_COUNTS,
  bfsQueue, bfsQueueCode, callStack, callStackCode, callTreeOf, dequeSide, dequeSideCode, gridText, stackQueue, stackQueueCode,
  stackQueueText, windowCounts, windowCountsCode,
  parseBfsQueue, parseCallStack, parseDequeSide, parseStackQueue, parseWindowCounts,
  randomBfsQueue, randomCallStack, randomDequeSide, randomStackQueue, randomWindowCounts,
} from './models/sides';

/**
 * Step-throughs that draw the helper structure beside the input, one decision per step:
 *   <DequeSideViz />     sliding-window max / min: the deque as a lane, every back comparison shown   (Monotonic Stack)
 *   <WindowCountsViz />  a window and its count table: no repeats, anagrams                          (Sliding Window)
 *   <BfsQueueViz />      grid BFS one neighbour at a time, the queue as a lane                          (Graph Traversal)
 *   <CallStackViz />     recursion: the call tree beside the call stack                                (Recursion)
 *   <StackQueueViz />    a stack on an array, a queue on a circular array                               (Stacks & Queues)
 */

const list = (a) => `[${a.join(', ')}]`;

// ---------------------------------------------------------------- deque

function DequeStage({ step: f, input, width, seq, jump }) {
  const { a, k } = input;
  const n = a.length;
  const pitch = pitchFor(width - 8, n, 34, 56);
  const W = n * pitch;
  const y1 = 30, y2 = y1 + 46 + 56;
  const height = y2 + 46 + 14;
  const tags = {};
  if (f.i !== null) tags[f.i] = [{ label: 'i', tone: 'accent' }];
  if (f.cmp) tags[f.cmp.j] = [...(tags[f.cmp.j] ?? []), { label: 'back', tone: 'warn' }];
  if (f.dq.length && f.kind !== 'done' && f.dq[0] !== f.i) tags[f.dq[0]] = [...(tags[f.dq[0]] ?? []), { label: 'front', tone: 'success' }];   // when i is the front, the lane says so
  const lo = f.i === null ? null : Math.max(0, f.i - k + 1);
  const answers = Array.from({ length: n - k + 1 }, (_, j) => ({ v: f.ans[j] ?? '·', id: j }));
  const sym = input.mode === 'max' ? '<=' : '>=';
  let card = null;
  if (f.kind === 'popback' || f.kind === 'keep') card = { q: `${a[f.cmp.j]} ${sym} ${a[f.i]}?`, a: f.cmp.ok ? 'yes → pop back' : 'no → stop', tone: f.cmp.ok ? 'yes' : 'no' };
  else if (f.kind === 'push') card = { q: `push ${f.pushed}`, a: `at the back (a[${f.pushed}] = ${a[f.pushed]})`, tone: 'info' };
  else if (f.kind === 'dropfront') card = { q: `${f.left.j} <= ${f.i} − ${k}?`, a: 'yes → pop front', tone: 'bad' };
  else if (f.kind === 'record') card = { q: `${input.mode} = a[${f.dq[0]}]`, a: `= ${a[f.dq[0]]}`, tone: 'yes' };
  return (
    <div>
      <Stage width={W} height={height} jump={jump} label={`a = ${list(a)}`}>
        <ArrayStrip
          items={a} y={y1} pitch={pitch} tags={tags}
          bands={lo !== null ? [{ from: lo, to: f.i, tone: 'accent', label: f.i >= k - 1 ? 'window' : 'filling' }] : []}
          cls={(j) => [j === f.i && 'cur', f.cmp && j === f.cmp.j && 'target', f.i !== null && j > f.i && 'dim'].filter(Boolean).join(' ')}
        />
        <RowLabel x={0} y={y2 - 24}>{`${input.mode} of each window`}</RowLabel>
        <ArrayStrip items={answers} y={y2} pitch={pitch} index={false} cls={(j) => (f.kind === 'record' && j === f.ans.length - 1 ? 'hit' : f.ans[j] === undefined ? 'dim' : '')} />
      </Stage>
      <div className={styles.sideRow}>
        <Lane
          label={`deque of indexes (${input.mode === 'max' ? 'values decreasing' : 'values increasing'} front → back)`}
          seq={seq}
          leaving={f.left ? { id: f.left.j, main: String(f.left.j), sub: `a=${a[f.left.j]}`, tone: f.left.why === 'front' ? 'danger' : 'muted' } : null}
          items={f.dq.map((j, x) => ({ id: j, main: String(j), sub: `a=${a[j]}`, isNew: f.pushed === j, tone: f.cmp && f.cmp.j === j ? 'warn' : x === 0 ? 'success' : undefined }))}
        />
        {card && <CmpCard {...card} style={{ minWidth: 150 }} />}
      </div>
    </div>
  );
}

const dequeSpec = {
  title: 'Sliding-window max with a deque, one comparison at a time',
  examples: DEQUE_SIDE,
  simulate: dequeSide,
  code: (input) => dequeSideCode(input.mode),
  kinds: { start: ['Start', 'neutral'], arrive: ['Arrive', 'neutral'], popback: ['Pop back', 'success'], keep: ['Stop', 'warn'], push: ['Push back', 'accent'], dropfront: ['Pop front', 'danger'], record: ['Answer', 'success'], done: ['Answers', 'success'] },
  describe: (input) => `a = ${list(input.a)}, k = ${input.k}`,
  rule: (input) => `pop the back while it is ${input.mode === 'max' ? '≤' : '≥'} a[i]; pop the front when it leaves the window`,
  stats: (f) => [['deque size', f.dq.length]],
  legend: () => [[<Key shape="box" tone="accent">i</Key>, 'the new element'], [<Key shape="box" tone="warn">·</Key>, 'the back being compared'], [<Key tone="success">front</Key>, 'the front: the answer']],
  fields: () => [{ name: 'a', label: 'a (−20 to 20)', placeholder: '1, 3, -1, -3, 5, 3, 6, 7' }, { name: 'k', label: 'k', placeholder: '3', short: true }],
  values: (input) => ({ a: input.a.join(', '), k: String(input.k) }),
  parse: parseDequeSide,
  random: (input) => randomDequeSide(input),
  hint: () => 'Up to 9 numbers and a window size k.',
  delay: (f) => (f.kind === 'arrive' ? 1400 : 2000),
  Stage: DequeStage,
};

export function DequeSideViz(props) {
  return <StepViz spec={dequeSpec} {...props} />;
}

// ---------------------------------------------------------------- window + count table

function CountTable({ f, input }) {
  const letters = Object.keys(f.count);
  return (
    <table className={styles.counts}>
      <thead><tr><th>letter</th>{letters.map((c) => <th key={c} className={c === f.focus ? styles.focusCol : undefined}>{c}</th>)}</tr></thead>
      <tbody>
        <tr>
          <th>{input.mode === 'anagram' ? 'have' : 'count'}</th>
          {letters.map((c) => {
            const bad = input.mode === 'unique' ? f.count[c] > 1 : f.need && f.count[c] !== f.need[c];
            return <td key={c} className={[c === f.focus && styles.focusCol, c === f.focus && f.tone && styles[`c_${f.tone}`], input.mode === 'unique' && bad && styles.c_danger].filter(Boolean).join(' ')}>{f.count[c]}</td>;
          })}
        </tr>
        {f.need && (
          <tr>
            <th>need</th>
            {letters.map((c) => <td key={c} className={[c === f.focus && styles.focusCol, f.count[c] === f.need[c] ? styles.c_match : styles.c_miss].join(' ')}>{f.need[c]}</td>)}
          </tr>
        )}
      </tbody>
    </table>
  );
}

function WindowCountsStage({ step: f, input, width, jump }) {
  const s = input.s.split('');
  const n = s.length;
  const pitch = pitchFor(width - 8, n, 26, 52);   // single letters: cells can be narrow
  const W = n * pitch;
  const y = 30;
  const height = y + 46 + 30;
  const r = f.r ?? -1;
  const lo = f.kind === 'start' ? null : f.l;
  const bands = [];
  if (lo !== null && r >= lo) bands.push({ from: lo, to: r, tone: f.tone === 'danger' ? 'danger' : f.kind === 'match' || f.kind === 'record' ? 'success' : 'accent' });
  if (f.kind === 'done' && f.bestAt) bands.push({ from: f.bestAt[0], to: f.bestAt[1], tone: 'success', label: 'best' });
  const tags = {};
  if (lo !== null && r >= 0 && f.kind !== 'done') { tags[lo] = [{ label: 'l', tone: 'interview' }]; tags[r] = [...(tags[r] ?? []), { label: 'r', tone: 'accent' }]; }
  let card = null;
  if (input.mode === 'unique' && f.kind === 'add') card = { q: `count['${f.focus}'] = ${f.count[f.focus]}`, a: f.count[f.focus] > 1 ? '> 1 → shrink' : '≤ 1 → fine', tone: f.count[f.focus] > 1 ? 'bad' : 'yes' };
  if (input.mode === 'unique' && f.kind === 'shrink') card = { q: `remove '${f.focus}'`, a: `count['${f.focus}'] = ${f.count[f.focus]}`, tone: 'no' };
  if (input.mode === 'unique' && f.kind === 'record') card = { q: `best = ${f.best}`, a: 'new best', tone: 'yes' };
  if (input.mode === 'anagram' && (f.kind === 'slide' || f.kind === 'match')) card = { q: 'have == need?', a: f.kind === 'match' ? `yes → anagram at ${f.found.at(-1)}` : r >= input.p.length - 1 ? 'no' : 'window not full', tone: f.kind === 'match' ? 'yes' : 'no' };
  return (
    <div>
      <Stage width={W} height={height} jump={jump} label={`s = "${input.s}"`}>
        <ArrayStrip items={s} y={y} pitch={pitch} tags={tags} bands={bands} cls={(k) => (k === r && f.kind !== 'done' ? 'cur' : lo !== null && (k < lo || k > r) ? 'dim' : '')} />
      </Stage>
      <div className={styles.sideRow}>
        <div>
          <div className={styles.label}>{input.mode === 'anagram' ? `the window vs "${input.p}"` : 'letters in the window'}</div>
          <CountTable f={f} input={input} />
        </div>
        {card && <CmpCard {...card} style={{ minWidth: 150 }} />}
      </div>
      {input.mode === 'anagram' && <p className={styles.note}>anagrams found at: {f.found.length ? list(f.found) : 'none yet'}</p>}
    </div>
  );
}

const windowCountsSpec = {
  title: 'A sliding window and its count table',
  examples: WINDOW_COUNTS,
  simulate: windowCounts,
  code: (input) => windowCountsCode(input.mode),
  kinds: { start: ['Start', 'neutral'], add: ['Add', 'accent'], shrink: ['Shrink', 'warn'], record: ['Best', 'success'], slide: ['Slide', 'accent'], match: ['Match', 'success'], done: ['Answer', 'success'] },
  describe: (input) => (input.mode === 'anagram' ? `s = "${input.s}", p = "${input.p}"` : `s = "${input.s}"`),
  rule: (input) => (input.mode === 'anagram' ? 'one letter in, one letter out; compare the two rows' : 'valid while every count ≤ 1'),
  stats: (f) => [['window', f.r === null ? 0 : f.r - f.l + 1]],
  legend: (f, input) => (input.mode === 'anagram'
    ? [[<Key shape="box" tone="accent">r</Key>, 'the letter that just entered'], [<Key shape="box" tone="success">1</Key>, 'row matches'], [<Key shape="box" tone="danger">0</Key>, 'row differs']]
    : [[<Key shape="box" tone="accent">r</Key>, 'the letter that just entered'], [<Key shape="box" tone="danger">2</Key>, 'a repeat: shrink']]),
  fields: (input) => (input.mode === 'anagram'
    ? [{ name: 's', label: 's (letters a–e)', placeholder: 'cbaebabacd' }, { name: 'p', label: 'p', placeholder: 'abc', short: true }]
    : [{ name: 's', label: 's (letters a–e)', placeholder: 'abcabcbb' }]),
  values: (input) => (input.mode === 'anagram' ? { s: input.s, p: input.p } : { s: input.s }),
  parse: parseWindowCounts,
  random: (input) => randomWindowCounts(input),
  hint: () => 'Up to 12 letters from a to e.',
  Stage: WindowCountsStage,
};

export function WindowCountsViz(props) {
  return <StepViz spec={windowCountsSpec} {...props} />;
}

// ---------------------------------------------------------------- BFS queue

function BfsStage({ step: f, input, width, seq }) {
  const { grid } = input;
  const R = grid.length, C = grid[0].length;
  const eq = (p, r, c) => p && p[0] === r && p[1] === c;
  const inQ = new Set(f.q.map(([r, c]) => `${r},${c}`));
  const name = (p) => `(${p[0]},${p[1]})`;
  let card = null;
  if (f.kind === 'skip') card = { q: name(f.v), a: grid[f.v[0]][f.v[1]] === 1 ? 'wall → skip' : 'seen → skip', tone: 'no' };
  if (f.kind === 'push' || f.kind === 'found') card = { q: `${name(f.v)}: new`, a: `dist ${f.dist[f.v[0]][f.v[1]]} → push`, tone: 'yes' };
  if (f.kind === 'pop') card = { q: `take ${name(f.u)}`, a: `dist ${f.dist[f.u[0]][f.u[1]]}`, tone: 'info' };
  return (
    <div>
      <div className={styles.sideRow}>
        <GridCells
          grid={grid} width={Math.min(width, 320)}
          cell={(r, c) => {
            const d = f.dist[r][c];
            return {
              cls: [grid[r][c] === 1 ? 'wall' : 'open', d >= 0 && `ring_${d % 2 ? 'a' : 'b'}`, eq(f.u, r, c) && 'cellCur', eq(f.v, r, c) && (f.kind === 'skip' ? 'cellDone' : 'cellNew'), r === R - 1 && c === C - 1 && 'cellEnd'],
              label: d >= 0 ? d : '',
              badge: inQ.has(`${r},${c}`) ? 'q' : undefined,
            };
          }}
        />
        {card && <CmpCard {...card} style={{ minWidth: 150 }} />}
      </div>
      <Lane
        label="queue (first in, first out)"
        seq={seq}
        leaving={f.kind === 'pop' ? { id: name(f.u), main: name(f.u), sub: `d=${f.dist[f.u[0]][f.u[1]]}`, tone: 'muted' } : null}
        items={f.q.map(([r, c]) => ({ id: `${r},${c}`, main: `(${r},${c})`, sub: `d=${f.dist[r][c]}`, isNew: eq(f.pushed, r, c) }))}
      />
    </div>
  );
}

const bfsSpec = {
  title: 'BFS one neighbour at a time, with the queue beside the grid',
  examples: BFS_QUEUE,
  simulate: bfsQueue,
  code: () => bfsQueueCode,
  kinds: { start: ['Start', 'neutral'], pop: ['Take front', 'accent'], skip: ['Skip', 'warn'], push: ['Push', 'success'], found: ['Reached', 'success'], done: ['Answer', 'success'] },
  describe: (input) => `${input.grid.length} × ${input.grid[0].length} grid, from (0,0) to the bottom-right`,
  rule: () => 'take from the front; mark each new neighbour and add it to the back',
  stats: (f) => [['queue', f.q.length]],
  legend: () => [[<Key shape="box" tone="warn">u</Key>, 'cell being explored'], [<Key shape="box" tone="accent">v</Key>, 'neighbour being checked'], [<Key shape="box">■</Key>, 'wall'], [<Key>q</Key>, 'waiting in the queue']],
  fields: () => [{ name: 'grid', label: 'grid rows (0 open, 1 wall), separated by ;', placeholder: '0010; 1000; 0010' }],
  values: (input) => ({ grid: gridText(input.grid) }),
  parse: parseBfsQueue,
  random: (input) => randomBfsQueue(input),
  hint: () => 'Up to 4 rows of up to 5 cells. The start is the top-left, the target the bottom-right.',
  delay: (f) => (f.kind === 'skip' ? 1200 : 1800),
  Stage: BfsStage,
};

export function BfsQueueViz(props) {
  return <StepViz spec={bfsSpec} {...props} />;
}

// ---------------------------------------------------------------- recursion

function CallStage({ step: f, input, width, seq }) {
  const t = callTreeOf(input);
  const name = input.fn === 'fact' ? 'fact' : 'fib';
  const waiting = new Set(f.stack.map((fr) => fr.id));
  const pileW = 160;
  const narrow = width < 280 + pileW + 48;   // tree (at least 280) + gap + pile, or stack them
  return (
    <div className={styles.sideRow}>
      <div>
        <div className={styles.label}>call tree (node = n)</div>
        <TreeGraph
          t={t} width={narrow ? width - 24 : Math.min(width - pileW - 64, 420)}   // room for the return badges label={`${name}(${input.n}) call tree`}
          cls={(id) => [id === f.active && 'cur', waiting.has(id) && id !== f.active && 'active', f.ret[id] !== undefined && 'done', f.ret[id] === undefined && !waiting.has(id) && 'skip'].filter(Boolean)}
          badge={(id) => (f.ret[id] !== undefined ? { text: `=${f.ret[id]}`, tone: 'success' } : null)}
        />
      </div>
      <Pile
        label="call stack (top = running)"
        width={pileW}
        depth={input.n}
        seq={seq}
        leaving={f.popped ? { id: f.popped.id, main: `${name}(${f.popped.m})`, sub: `returns ${f.popped.val}`, tone: 'success' } : null}
        items={f.stack.map((fr, k) => ({ id: fr.id, main: `${name}(${fr.m})`, sub: fr.note, isNew: f.pushed === fr.id, tone: k === f.stack.length - 1 ? 'warn' : undefined }))}
      />
    </div>
  );
}

const callSpec = {
  title: 'Recursion: the call tree and the call stack',
  examples: CALL_STACK,
  simulate: callStack,
  code: (input) => callStackCode(input.fn),
  kinds: { start: ['Start', 'neutral'], call: ['Call: push', 'accent'], wait: ['Wait', 'neutral'], base: ['Base case', 'success'], return: ['Return: pop', 'success'], done: ['Result', 'success'] },
  describe: (input) => `${input.fn === 'fact' ? 'fact' : 'fib'}(${input.n})`,
  rule: () => 'a call pushes a frame; a return pops it and hands the value to the frame below',
  stats: (f) => [['stack depth', f.stack.length]],
  legend: () => [[<Key shape="box" tone="warn">n</Key>, 'running now (top frame)'], [<Key shape="box" tone="accent">n</Key>, 'paused, waiting on the stack'], [<Key shape="box" tone="success">n</Key>, 'returned']],
  fields: (input) => [{ name: 'n', label: `n (1 to ${input.fn === 'fib' ? 5 : 6})`, placeholder: '4', short: true }],
  values: (input) => ({ n: String(input.n) }),
  parse: parseCallStack,
  random: (input) => randomCallStack(input),
  hint: (input) => `fib grows fast: up to n = ${input.fn === 'fib' ? 5 : 6} keeps the tree readable.`,
  delay: () => 1800,
  Stage: CallStage,
};

export function CallStackViz(props) {
  return <StepViz spec={callSpec} {...props} />;
}

// ---------------------------------------------------------------- stack and queue on arrays

function StackQueueStage({ step: f, input, width, seq, jump }) {
  const { mode, cap } = input;
  const pitch = pitchFor(Math.min(width, 420) - 8, cap, 40, 60);
  const W = cap * pitch;
  const y = 30;
  const height = y + 46 + 30;
  const tags = {};
  const tag = (k, label, tone) => { tags[k] = [...(tags[k] ?? []), { label, tone }]; };
  if (mode === 'stack') { if (f.size) tag(f.size - 1, 'top', 'accent'); }
  else if (f.size) { tag(f.head, 'head', 'success'); tag((f.head + f.size - 1) % cap, 'tail', 'accent'); }
  const it = (x) => ({ id: x.id, main: String(x.v), sub: `a[${x.slot}]`, isNew: f.pushed === x.id });
  const leaving = f.popped ? { id: f.popped.id, main: String(f.popped.v), sub: `a[${f.popped.slot}]`, tone: 'success' } : null;
  let card = null;
  if (f.kind === 'add') card = { q: `${mode === 'stack' ? 'push' : 'offer'} → a[${f.slot}]`, a: mode === 'stack' ? `size = ${f.size}` : `(head + size) % ${cap}`, tone: 'info' };
  if (f.kind === 'remove') card = { q: `${mode === 'stack' ? 'pop' : 'poll'} → ${f.popped.v}`, a: mode === 'stack' ? 'last in, first out' : 'first in, first out', tone: 'yes' };
  if (f.kind === 'peek') card = { q: `peek → ${f.out.at(-1)}`, a: 'nothing removed', tone: 'no' };
  return (
    <div>
      <div className={styles.sideRow}>
        {mode === 'stack'
          ? <Pile label="the stack (top ↑)" width={130} depth={cap} seq={seq} leaving={leaving} items={f.items.map(it)} />
          : <Lane label="the queue" seq={seq} leaving={leaving} items={f.items.map(it)} />}
        {card && <CmpCard {...card} style={{ minWidth: 150 }} />}
      </div>
      <div className={styles.label}>{mode === 'stack' ? 'how it is stored: an array and a size' : `how it is stored: a ring of ${cap} slots`}</div>
      <Stage width={W} height={height} jump={jump} label="backing array">
        <ArrayStrip items={f.arr.map((v, k) => ({ v: v ?? '·', id: k }))} y={y} pitch={pitch} tags={tags} cls={(k) => (k === f.slot ? 'cur' : f.arr[k] === null ? 'dim' : '')} />
      </Stage>
    </div>
  );
}

const stackQueueSpec = {
  title: 'A stack and a queue, and the arrays underneath',
  examples: STACK_QUEUE,
  simulate: stackQueue,
  code: (input) => stackQueueCode(input.mode),
  kinds: { start: ['Start', 'neutral'], add: ['Add', 'accent'], remove: ['Remove', 'success'], peek: ['Peek', 'neutral'], done: ['Done', 'success'] },
  describe: (input) => stackQueueText(input.ops),
  rule: (input) => (input.mode === 'stack' ? 'everything happens at the top: a[size − 1]' : 'add at the back, remove at the front; indexes wrap around'),
  stats: (f) => [['size', f.size]],
  legend: (f, input) => (input.mode === 'stack' ? [[<Key tone="accent">top</Key>, 'the top of the stack']] : [[<Key tone="success">head</Key>, 'the front'], [<Key tone="accent">tail</Key>, 'the back']]),
  fields: (input) => [{ name: 'ops', label: 'operations', placeholder: input.mode === 'stack' ? 'push 3, push 8, pop, peek' : 'offer 3, offer 8, poll, peek' }],
  values: (input) => ({ ops: stackQueueText(input.ops) }),
  parse: parseStackQueue,
  random: (input) => randomStackQueue(input),
  hint: (input) => `Up to 12 operations; the array holds ${input.cap}.`,
  delay: () => 1800,
  Stage: StackQueueStage,
};

export function StackQueueViz(props) {
  return <StepViz spec={stackQueueSpec} {...props} />;
}
