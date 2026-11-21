import { StepViz, Key } from './StepViz';
import { ArrayStrip, Float, RowLabel, Stage, pitchFor } from './prims';
import styles from './HeapsViz.module.css';
import { CmpCard, Lane } from './sideKit';
import kit from './sideKit.module.css';
import { HEAP_SIM, heapSim, heapSimCode, parseHeapSim, randomHeapSim } from './models/heapSim';
import {
  KWAY, LIST_NAMES, MEDIAN, TOPK, kway, kwayCode, median, medianCode, ordinal, parseKway, parseMedian, parseTopK, randomKway, randomMedian,
  randomTopK, topK, topKCode,
} from './models/heaps';

/**
 * Step-throughs for the Heaps lesson:
 *   <TopKViz />        a size-k min-heap drawn as a tree (and the array behind it): bubble up, evict, sift down
 *   <KWayMergeViz />   one candidate per list in a heap; take the smallest, its list sends the next
 *   <MedianViz />      two piles facing each other; the median sits between their tops
 */

const list = (a) => `[${a.join(', ')}]`;
const LEVEL_H = 56;

/** Where heap index i sits: level by level, each level spread evenly across the width. */
function heapXY(i, W, top) {
  const level = Math.floor(Math.log2(i + 1));
  const first = 2 ** level - 1;
  return { x: ((i - first + 0.5) / 2 ** level) * W, y: top + level * LEVEL_H };
}

/** A binary heap as a tree. Nodes keep their ids, so a swap is seen as two nodes trading places. */
function HeapTree({ heap, W, top, swap = [], fresh = [], tone, badge, ghost }) {
  return (
    <>
      <svg className={styles.edges} width={W} height={top + 4 * LEVEL_H} aria-hidden="true">
        {heap.map((_, i) => {
          if (i === 0) return null;
          const a = heapXY((i - 1) >> 1, W, top), b = heapXY(i, W, top);
          return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
        })}
      </svg>
      {heap.map((node, i) => {
        const { x, y } = heapXY(i, W, top);
        const b = badge?.(node);
        return (
          <div
            key={node.id}
            className={[styles.node, styles[`tone_${tone?.(node) ?? 'plain'}`], swap.includes(node.id) && styles.swapping, fresh.includes(node.id) && styles.fresh, i === 0 && styles.root].filter(Boolean).join(' ')}
            style={{ left: x, top: y }}
          >
            {node.v}
            {b && <span className={styles.nodeBadge}>{b}</span>}
          </div>
        );
      })}
      {ghost && (() => {
        const { x, y } = heapXY(0, W, top);
        return <div key={ghost.key} className={`${styles.node} ${styles.ghost}`} style={{ left: x, top: y }}>{ghost.v}</div>;
      })()}
    </>
  );
}

const levelsFor = (n) => Math.max(1, Math.ceil(Math.log2(n + 1)));

// ---------------------------------------------------------------- top-k

function TopKStage({ step: f, input, width, seq, jump }) {
  const n = f.a.length;
  const pitch = pitchFor(width, n, 36, 56);
  const W = Math.max(n * pitch, 280);
  const x0 = (W - n * pitch) / 2;
  const treeTop = 46 + 46 + 66;
  const levels = levelsFor(input.k + 1);
  const arrTop = treeTop + (levels - 1) * LEVEL_H + 52;
  const hp = pitchFor(width, input.k + 1, 40, 52);
  const ax0 = (W - (input.k + 1) * hp) / 2;
  const evicted = f.evicted !== undefined ? f.a[f.evicted] : null;
  return (
    <Stage width={W} height={arrTop + 46 + 30} jump={jump} label="top-k heap">
      <RowLabel x={x0} y={0}>the stream</RowLabel>
      <ArrayStrip
        items={f.a} x0={x0} y={20} pitch={pitch} index={false}
        cls={(k) => ({ cur: 'cur', kept: 'kept', evicted: 'bad', todo: 'dim' })[f.status[k]]}
        tags={f.cur !== null ? { [f.cur]: [{ label: 'x', tone: 'accent' }] } : {}}
      />
      <RowLabel x={4} y={treeTop - 48}>{W >= 440 ? `min-heap, size ≤ ${input.k + 1} (top = smallest)` : 'min-heap (top = smallest)'}</RowLabel>
      <HeapTree
        heap={f.heap} W={W} top={treeTop} swap={f.swap ?? []} fresh={f.kind === 'offer' ? [f.focus?.[0]] : []}
        tone={(node) => (node.id === f.cur && f.kind !== 'done' ? 'new' : 'plain')}
        ghost={evicted !== null && f.kind === 'evict' ? { key: `g${seq}`, v: evicted } : null}
      />
      {f.heap.length > 0 && <Float x={heapXY(0, W, treeTop).x + 52} y={treeTop - 10} tone="warn">{f.kind === 'done' ? `${ordinal(input.k)} largest` : 'doorkeeper'}</Float>}
      <RowLabel x={Math.min(ax0, 4)} y={arrTop - 18}>{W >= 440 ? 'the same heap as an array (children of i: 2i+1, 2i+2)' : 'the same heap as an array'}</RowLabel>
      <ArrayStrip
        items={f.heap.map((x) => ({ v: x.v, id: x.id }))} x0={ax0} y={arrTop} pitch={hp}
        cls={(k, it) => [f.swap?.includes(it.id) && 'target', k === 0 && 'kept'].filter(Boolean).join(' ')}
      />
    </Stage>
  );
}

const topKSpec = {
  title: 'Top k with a min-heap',
  examples: TOPK,
  simulate: topK,
  code: () => topKCode,
  kinds: { start: ['Start', 'neutral'], offer: ['Offer', 'accent'], up: ['Bubble up', 'note'], evict: ['Evict', 'danger'], down: ['Sift down', 'note'], done: ['Answer', 'success'] },
  describe: (input) => `a = ${list(input.a)}, k = ${input.k}`,
  rule: (input) => `Keep the ${input.k} largest; the heap's top is the one to throw out next.`,
  stats: (f) => [['heap size', f.heap.length]],
  legend: () => [
    [<Key shape="box" tone="accent">5</Key>, 'in the top k so far'],
    [<Key shape="box" tone="danger">1</Key>, 'evicted'],
    [<Key shape="box" tone="warn">4</Key>, 'swapping'],
  ],
  fields: () => [{ name: 'a', label: 'a', placeholder: 'e.g. 3, 2, 1, 5, 6, 4' }, { name: 'k', label: 'k (1 to 4)', placeholder: '2', short: true }],
  values: (input) => ({ a: input.a.join(', '), k: String(input.k) }),
  parse: parseTopK,
  random: () => randomTopK(),
  hint: () => 'Up to 9 numbers and k from 1 to 4.',
  delay: () => 2400,
  Stage: TopKStage,
};

export function TopKViz(props) {
  return <StepViz spec={topKSpec} {...props} />;
}

// ---------------------------------------------------------------- k-way merge

const LIST_TONE = ['accent', 'note', 'interview', 'warn'];

function KwayStage({ step: f, width, jump }) {
  const longest = Math.max(...f.lists.map((l) => l.length));
  const total = f.lists.flat().length;
  const pitch = pitchFor(width - 30, Math.max(longest, total), 30, 46);
  const W = Math.max(30 + total * pitch, 300);
  const inHeap = new Set(f.heap.map((x) => x.id));
  const outIds = new Set(f.out.map((o) => o.id));
  const rowH = 52;
  const treeTop = 20 + f.lists.length * rowH + 62;
  const levels = levelsFor(f.lists.length);
  const outTop = treeTop + (levels - 1) * LEVEL_H + 56;
  return (
    <Stage width={W} height={outTop + 46 + 16} jump={jump} label="k-way merge">
      {f.lists.map((l, r) => (
        <div key={r}>
          <span className={`${styles.listName} ${styles[`ln_${LIST_TONE[r]}`]}`} style={{ top: 20 + r * rowH + 10 }}>{LIST_NAMES[r]}</span>
          <ArrayStrip
            items={l.map((v, k) => ({ v, id: `${r}-${k}` }))} x0={30} y={20 + r * rowH} pitch={pitch} h={36} index={false}
            cls={(k, it) => [
              f.taken === it.id && 'hit',
              f.fresh?.includes(it.id) && 'cur',
              inHeap.has(it.id) && !f.fresh?.includes(it.id) && 'kept',
              outIds.has(it.id) && f.taken !== it.id && 'dim',
            ].filter(Boolean).join(' ')}
            check={(k, it) => outIds.has(it.id)}
          />
        </div>
      ))}
      <RowLabel x={4} y={treeTop - 48}>{`min-heap: one candidate per list (≤ ${f.lists.length})`}</RowLabel>
      <HeapTree heap={f.heap} W={W} top={treeTop} fresh={f.fresh ?? []} tone={(x) => LIST_TONE[x.list]} badge={(x) => LIST_NAMES[x.list]} />
      <RowLabel x={4} y={outTop - 18}>merged output</RowLabel>
      <ArrayStrip
        items={f.out.map((o) => ({ v: o.v, id: o.id }))} x0={4} y={outTop} pitch={pitch} h={36} index={false}
        cls={(k, it) => (it.id === f.taken ? 'hit' : '')}
      />
    </Stage>
  );
}

const kwaySpec = {
  title: 'K-way merge with a heap',
  examples: KWAY,
  simulate: kway,
  code: () => kwayCode,
  kinds: { start: ['Start', 'neutral'], init: ['Heads in', 'accent'], take: ['Take', 'success'], done: ['Merged', 'success'] },
  describe: (input) => input.lists.map((l, k) => `${LIST_NAMES[k]} = ${list(l)}`).join(', '),
  rule: () => 'The heap holds each list\'s current head; the smallest head is next in the output.',
  stats: (f) => [['in heap', f.heap.length], ['merged', f.out.length]],
  legend: () => [
    [<Key shape="box" tone="accent">4</Key>, 'a list\'s candidate in the heap'],
    [<Key shape="box" tone="success">1</Key>, 'taken now'],
  ],
  fields: () => [{ name: 'lists', label: 'lists, separated by ;', placeholder: 'e.g. 1, 4, 5; 1, 3, 4; 2, 6' }],
  values: (input) => ({ lists: input.lists.map((l) => l.join(', ')).join('; ') }),
  parse: parseKway,
  random: () => randomKway(),
  hint: () => '2 to 4 lists (each sorted for you), at most 12 values in total.',
  delay: () => 2600,
  Stage: KwayStage,
};

export function KWayMergeViz(props) {
  return <StepViz spec={kwaySpec} {...props} />;
}

// ---------------------------------------------------------------- running median

function MedianStage({ step: f, width, seq, jump }) {
  const n = f.a.length;
  const pitch = pitchFor(width, n, 34, 52);
  const W = Math.max(n * pitch, 300);
  const x0 = (W - n * pitch) / 2;
  const cur = f.cur;
  const med = f.median ?? (f.kind === 'done' ? f.meds.at(-1) : null);
  return (
    <>
      <Stage width={W} height={86} jump={jump} label="stream">
        <RowLabel x={x0} y={0}>the stream</RowLabel>
        <ArrayStrip
          items={f.a} x0={x0} y={20} pitch={pitch} index={false}
          cls={(k) => (k === cur ? 'cur' : cur !== null && k < cur ? 'kept' : f.kind === 'done' ? 'kept' : 'dim')}
          sub={(k) => (k < f.meds.length ? { text: String(f.meds[k]), tone: 'success' } : null)}
        />
      </Stage>
      <div className={styles.halves}>
        <div className={styles.half}>
          <span className={styles.halfLabel}>smaller half · max-heap</span>
          <div className={`${styles.pile} ${styles.pileLow}`}>
            {f.low.map((x, k) => (
              <span key={x.id} className={[styles.coin, k === f.low.length - 1 && styles.coinTop, x.id === f.moved && styles.coinMoved].filter(Boolean).join(' ')}>{x.v}</span>
            ))}
            {f.low.length === 0 && <span className={styles.none}>empty</span>}
          </div>
        </div>
        <div key={med === null ? 'nomed' : `m${seq}`} className={`${styles.median} ${med !== null ? styles.medianOn : ''}`}>
          <small>median</small>
          <b>{med === null ? '…' : med}</b>
        </div>
        <div className={styles.half}>
          <span className={styles.halfLabel}>larger half · min-heap</span>
          <div className={`${styles.pile} ${styles.pileHigh}`}>
            {f.high.map((x, k) => (
              <span key={x.id} className={[styles.coin, styles.coinHigh, k === 0 && styles.coinTop, x.id === f.moved && styles.coinMoved].filter(Boolean).join(' ')}>{x.v}</span>
            ))}
            {f.high.length === 0 && <span className={styles.none}>empty</span>}
          </div>
        </div>
      </div>
    </>
  );
}

const medianSpec = {
  title: 'Running median with two heaps',
  examples: MEDIAN,
  simulate: median,
  code: () => medianCode,
  kinds: { start: ['Start', 'neutral'], low: ['Add', 'accent'], up: ['Move up', 'note'], back: ['Rebalance', 'warn'], done: ['Medians', 'success'] },
  describe: (input) => `stream = ${list(input.a)}`,
  rule: () => 'Every low ≤ every high; low holds the extra one. The median sits at the tops.',
  stats: (f) => [['low', f.low.length], ['high', f.high.length]],
  legend: () => [[<Key shape="box" tone="accent">5</Key>, 'top of a half (next to the middle)'], [<Key shape="box" tone="warn">8</Key>, 'just moved']],
  fields: () => [{ name: 'a', label: 'stream', placeholder: 'e.g. 5, 15, 1, 3, 8' }],
  values: (input) => ({ a: input.a.join(', ') }),
  parse: parseMedian,
  random: () => randomMedian(),
  hint: () => 'Up to 9 numbers between −99 and 99.',
  delay: () => 2400,
  Stage: MedianStage,
};

export function MedianViz(props) {
  return <StepViz spec={medianSpec} {...props} />;
}

// ---------------------------------------------------------------- repeatedly take the best

function HeapSimStage({ step: f, width, seq, jump }) {
  const toks = f.tokens;
  const outItems = f.out.items;
  const pitchT = toks ? pitchFor(width - 8, toks.length, 56, 72) : 0;
  const pitchO = pitchFor(width - 8, Math.max(1, outItems.length), outItems.some((x) => String(x).length > 3) ? 48 : 30, 52);
  return (
    <div>
      {toks && (
        <Stage width={toks.length * pitchT} height={6 + 40 + 6 + 22} jump={jump} label={`input ${toks.join(' ')}`}>
          <ArrayStrip
            items={toks} y={6} pitch={pitchT} h={40} index={false}
            tags={f.i !== null && f.i !== undefined ? { [f.i]: [{ label: 'now', tone: 'accent' }] } : {}}
            cls={(k) => [k === f.i && 'cur', f.i !== null && f.i !== undefined && k > f.i && 'dim'].filter(Boolean).join(' ')}
          />
        </Stage>
      )}
      <div className={kit.sideRow}>
        <Lane label={f.heap.label} front="top" back="" seq={seq} items={f.heap.items} empty="empty" />
        {f.side && <Lane label={f.side.label} front="" back="" seq={seq} items={f.side.items} empty="none" />}
        {f.card && <CmpCard {...f.card} style={{ minWidth: 150 }} />}
      </div>
      <Stage width={Math.max(1, outItems.length) * pitchO} height={22 + 40 + 8} jump={jump} label={`${f.out.label}: ${outItems.join(' ')}`}>
        <RowLabel x={0} y={0}>{f.out.label}</RowLabel>
        <ArrayStrip items={outItems.length ? outItems : ['·']} y={22} pitch={pitchO} h={40} index={false} cls={(k) => (!outItems.length ? 'dim' : k === outItems.length - 1 && f.kind !== 'done' ? 'hit' : '')} />
      </Stage>
    </div>
  );
}

const HS_DESCRIBE = {
  stones: (i) => `stones = [${i.stones.join(', ')}]`,
  closest: (i) => `points = ${i.points.map(([x, y]) => `[${x},${y}]`).join(' ')}, k = ${i.k}`,
  tasks: (i) => `tasks = "${i.tasks}", n = ${i.n}`,
  cpu: (i) => `tasks = ${i.tasks.map(([e, p]) => `[${e},${p}]`).join(' ')}`,
  reorg: (i) => `s = "${i.s}"`,
  happy: (i) => `a = ${i.a}, b = ${i.b}, c = ${i.c}`,
  ipo: (i) => `k = ${i.k}, w = ${i.w}, profits = [${i.profits.join(', ')}], capital = [${i.capital.join(', ')}]`,
};
const HS_RULE = {
  stones: 'Pop the two heaviest; push back the difference if it is not 0.',
  closest: 'Push each point; once the heap holds k + 1, pop the farthest.',
  tasks: 'Each interval run the available task with the most copies left; it then cools down n intervals.',
  cpu: 'Move arrived tasks into the heap; when free, run the shortest (ties: smaller index).',
  reorg: 'Write the letter with the most copies left; it sits out the next turn.',
  happy: 'Use the most plentiful letter unless it would make three in a row; then the next one.',
  ipo: 'Unlock every affordable project; take the most profitable; repeat k times.',
};
const HS_FIELDS = {
  stones: [{ name: 'stones', label: 'stones', placeholder: 'e.g. 2, 7, 4, 1, 8, 1' }],
  closest: [{ name: 'points', label: 'points as x, y pairs', placeholder: 'e.g. 3, 3, 5, -1, -2, 4' }, { name: 'k', label: 'k', placeholder: '2', short: true }],
  tasks: [{ name: 'tasks', label: 'tasks', placeholder: 'e.g. AAABBB' }, { name: 'n', label: 'n', placeholder: '2', short: true }],
  cpu: [{ name: 'tasks', label: 'tasks as enqueue, processing pairs', placeholder: 'e.g. 1, 2, 2, 4, 3, 2, 4, 1' }],
  reorg: [{ name: 's', label: 's', placeholder: 'e.g. aaabc' }],
  happy: [{ name: 'a', label: 'a', placeholder: '1', short: true }, { name: 'b', label: 'b', placeholder: '1', short: true }, { name: 'c', label: 'c', placeholder: '7', short: true }],
  ipo: [{ name: 'k', label: 'k', placeholder: '2', short: true }, { name: 'w', label: 'w', placeholder: '0', short: true }, { name: 'profits', label: 'profits', placeholder: 'e.g. 1, 2, 3' }, { name: 'capital', label: 'capital', placeholder: 'e.g. 0, 1, 1' }],
};
const hsValues = (i) => ({
  stones: () => ({ stones: i.stones.join(', ') }),
  closest: () => ({ points: i.points.flat().join(', '), k: String(i.k) }),
  tasks: () => ({ tasks: i.tasks, n: String(i.n) }),
  cpu: () => ({ tasks: i.tasks.flat().join(', ') }),
  reorg: () => ({ s: i.s }),
  happy: () => ({ a: String(i.a), b: String(i.b), c: String(i.c) }),
  ipo: () => ({ k: String(i.k), w: String(i.w), profits: i.profits.join(', '), capital: i.capital.join(', ') }),
})[i.mode]();

const heapSimSpec = {
  title: 'Repeatedly take the best, with a heap',
  examples: HEAP_SIM,
  simulate: heapSim,
  code: (input) => heapSimCode[input.mode],
  kinds: {
    start: ['Start', 'neutral'], smash: ['Smash', 'accent'], both: ['Both gone', 'danger'], push: ['Push', 'accent'], replace: ['Pop the farthest', 'warn'],
    reject: ['Drop it', 'muted'], run: ['Run', 'success'], idle: ['Idle', 'muted'], arrive: ['Arrive', 'neutral'], take: ['Take', 'success'],
    fail: ['Impossible', 'danger'], use: ['Use', 'accent'], second: ['Blocked', 'warn'], stop: ['Stop', 'muted'], unlock: ['Unlock', 'neutral'], done: ['Answer', 'success'],
  },
  describe: (input) => HS_DESCRIBE[input.mode](input),
  rule: (input) => HS_RULE[input.mode],
  stats: (f) => f.stats ?? [],
  legend: () => [[<Key tone="warn">top</Key>, 'the heap\'s best: what gets taken next']],
  fields: (input) => HS_FIELDS[input.mode],
  values: hsValues,
  parse: parseHeapSim,
  random: (input) => randomHeapSim(input),
  hint: (input) => HS_RULE[input.mode],
  delay: (f) => (f.kind === 'start' ? 2600 : 2000),
  Stage: HeapSimStage,
};

export function HeapSimViz(props) {
  return <StepViz spec={heapSimSpec} {...props} />;
}
