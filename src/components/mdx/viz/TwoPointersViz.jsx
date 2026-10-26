import { StepViz, Key } from './StepViz';
import { ArrayStrip, Arcs, Float, Stage, pitchFor } from './prims';
import styles from './TwoPointersViz.module.css';
import {
  CONTAINER, DUTCH, PAIR_SUM, READ_WRITE, container, containerCode, dutchCode, dutchFlag, pairSum, pairSumCode,
  parseContainer, parseDutch, parsePairSum, parseReadWrite, randomContainer, randomDutch, randomPairSum, randomReadWrite,
  readWrite, readWriteCode,
} from './models/twoPointers';

/**
 * Two-pointer step-throughs for the Two Pointers lesson:
 *   <PairSumViz />     opposite ends on sorted input, with the grid of every pair each move rules out
 *   <ContainerViz />   Container With Most Water: measure, then drop the shorter wall
 *   <ReadWriteViz examples={['dedupe', 'zeroes']} />   same direction: read scans, write builds the result
 *   <DutchFlagViz />   Sort Colors with low / mid / high
 */

const list = (a) => `[${a.join(', ')}]`;

// ---------------------------------------------------------------- pair sum + pair grid

const PS_TOP = 46;
const PS_H = 44;

function PairSumStage({ step: f, input, width, jump }) {
  const a = input.nums;
  const n = a.length;
  const pitch = pitchFor(width, n, 40, 62);
  const head = 34;
  const cs = Math.max(26, Math.min(42, Math.floor((Math.min(width, 520) - head) / Math.max(1, n - 1))));
  const gridW = head + (n - 1) * cs;
  const W = Math.max(n * pitch, gridW);
  const x0 = (W - n * pitch) / 2;
  const gx = (W - gridW) / 2;
  const gy = PS_TOP + PS_H + 48;
  const height = gy + 22 + (n - 1) * cs + 6;
  const live = (k) => k >= f.L && k <= f.R;
  const leaving = new Set(f.leaving ?? []);
  const sumTone = { small: 'note', big: 'warn', found: 'success' }[f.verdict] ?? 'muted';
  const tags = {};
  if (f.kind !== 'none') {
    tags[f.L] = [{ label: 'L', tone: 'accent' }];
    tags[f.R] = [...(tags[f.R] ?? []), { label: 'R', tone: 'warn' }];
  }
  return (
    <Stage width={W} height={height} jump={jump} label={`nums = ${list(a)}`}>
      {f.sum !== undefined && (
        <Float x={x0 + ((f.L + f.R) / 2) * pitch + pitch / 2} y={2} tone={sumTone}>
          {`${a[f.L]} + ${a[f.R]} = ${f.sum}${f.verdict === 'small' ? ' < ' : f.verdict === 'big' ? ' > ' : ' = '}${input.target}`}
        </Float>
      )}
      <ArrayStrip
        items={a} x0={x0} y={PS_TOP} pitch={pitch} h={PS_H}
        bands={f.kind !== 'none' ? [{ from: f.L, to: f.R, tone: 'accent', label: 'still in play' }] : []}
        cls={(k) => [
          f.kind === 'found' && (k === f.L || k === f.R) && 'hit',
          f.verdict === 'small' && k === f.L && 'note',
          f.verdict === 'big' && k === f.R && 'warm',
          (!live(k) || f.kind === 'none') && 'dim',
        ].filter(Boolean).join(' ')}
        tags={tags}
      />
      <span className={styles.gridCaption} style={{ left: gx, top: gy - 20 }}>every pair: row = left value, column = right value</span>
      {a.slice(1).map((v, c) => (
        <span key={`ch${c}`} className={styles.head} style={{ left: gx + head + c * cs, top: gy, width: cs, height: 20 }}>{v}</span>
      ))}
      {a.slice(0, -1).map((v, r) => (
        <span key={`rh${r}`} className={styles.head} style={{ left: gx, top: gy + 22 + r * cs, width: head - 4, height: cs }}>{v}</span>
      ))}
      {a.slice(0, -1).flatMap((_, i) => a.slice(1).map((__, c) => {
        const j = c + 1;
        if (j <= i) return null;
        const key = `${i},${j}`;
        const cur = f.kind !== 'start' && f.kind !== 'none' && i === f.L && j === f.R;
        const cls = [
          styles.pair,
          f.out.has(key) && styles.out,
          leaving.has(key) && (f.verdict === 'small' ? styles.leavingRow : styles.leavingCol),
          cur && (f.kind === 'found' ? styles.hit : styles.curPair),
        ].filter(Boolean).join(' ');
        return (
          <span key={key} className={cls} style={{ left: gx + head + c * cs + 1, top: gy + 22 + i * cs + 1, width: cs - 2, height: cs - 2 }}>
            {a[i] + a[j]}
          </span>
        );
      }))}
    </Stage>
  );
}

const pairSumSpec = {
  title: 'Two pointers from both ends',
  examples: PAIR_SUM,
  simulate: pairSum,
  code: () => pairSumCode,
  kinds: {
    start: ['Start', 'neutral'],
    small: ['Too small', 'note'],
    big: ['Too big', 'warn'],
    found: ['Found', 'success'],
    none: ['No pair', 'muted'],
  },
  describe: (input) => `nums = ${list(input.nums)}, target = ${input.target}`,
  rule: () => 'Sorted: too small → L++, too big → R--.',
  stats: (f) => [['L', f.L], ['R', f.R], ['sums checked', `${f.checked} / ${f.total}`], ['ruled out', f.ruled]],
  legend: (f) => [
    [<Key tone="accent">L</Key>, 'left pointer'],
    [<Key tone="warn">R</Key>, 'right pointer'],
    [<Key shape="box" tone="accent">sum</Key>, 'pair being checked'],
    [<Key shape="box" tone={f.verdict === 'small' ? 'note' : 'warn'}>row</Key>, 'pairs ruled out by this step'],
    [<Key shape="dashed">7</Key>, 'already ruled out'],
  ],
  fields: () => [{ name: 'nums', label: 'nums (sorted for you)', placeholder: 'e.g. 2, 7, 11, 15' }, { name: 'target', label: 'target', placeholder: '9', short: true }],
  values: (input) => ({ nums: input.nums.join(', '), target: String(input.target) }),
  parse: (values) => parsePairSum(values),
  random: () => randomPairSum(),
  hint: () => 'Up to 10 numbers between −99 and 99; they are sorted before the run. Try a target that no pair reaches.',
  Stage: PairSumStage,
};

export function PairSumViz(props) {
  return <StepViz spec={pairSumSpec} {...props} />;
}

// ---------------------------------------------------------------- container with most water

function ContainerStage({ step: f, input, width }) {
  const h = input.heights;
  const n = h.length;
  const pitch = pitchFor(width, n, 30, 56);
  const W = n * pitch;
  const max = Math.max(1, ...h);
  const unit = Math.max(9, Math.min(15, Math.floor(170 / max)));
  const top = 30;
  const base = top + max * unit;
  const height = base + 64;
  const cx = (k) => k * pitch + pitch / 2;
  const active = f.kind !== 'done';
  const water = f.kind === 'measure';
  const best = f.bestPair;
  const mover = f.kind === 'measure' ? (f.move === 'L' ? f.L : f.R) : null;
  const showBest = best && !(water && best[0] === f.L && best[1] === f.R);
  const bestLevel = best ? Math.min(h[best[0]], h[best[1]]) : 0;
  return (
    <div className={styles.barsWrap} style={{ width: W }}>
      <svg width={W} height={height} className={styles.bars} role="img" aria-label={`heights = ${list(h)}`}>
        <defs>
          <marker id="ctr-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" className={styles.arrowHead} />
          </marker>
        </defs>
        {showBest && <rect x={cx(best[0])} y={base - bestLevel * unit} width={cx(best[1]) - cx(best[0])} height={bestLevel * unit} className={styles.bestBox} />}
        {water && <rect x={cx(f.L)} y={base - f.level * unit} width={cx(f.R) - cx(f.L)} height={f.level * unit} className={styles.water} />}
        {h.map((v, k) => {
          const inPlay = active && k >= f.L && k <= f.R;
          const cls = [
            styles.bar,
            !inPlay && f.kind !== 'start' && styles.barOut,
            k === mover && styles.barShort,
            (k === f.L || k === f.R) && k !== mover && active && styles.barWall,
          ].filter(Boolean).join(' ');
          return (
            <g key={k}>
              <rect x={k * pitch + pitch * 0.3} y={base - v * unit} width={pitch * 0.4} height={Math.max(1, v * unit)} rx="2" className={cls} />
              <text x={cx(k)} y={base + 14} textAnchor="middle" className={styles.barValue}>{v}</text>
              <text x={cx(k)} y={base + 27} textAnchor="middle" className={styles.barIndex}>{k}</text>
            </g>
          );
        })}
        <line x1="0" x2={W} y1={base} y2={base} className={styles.floor} />
        {/* labels last, so no bar covers them */}
        {showBest && <text x={cx(best[1]) - pitch * 0.25} y={base - bestLevel * unit - 5} textAnchor="end" className={styles.bestLabel}>best {f.best}</text>}
        {water && (
          <text x={(cx(f.L) + cx(f.R)) / 2} y={base - Math.max(f.level * unit, 22) / 2 + 4} textAnchor="middle" className={styles.waterLabel}>
            {f.level} × {f.w} = {f.area}
          </text>
        )}
        {active && (
          <>
            <text x={cx(f.L)} y={base + 44} textAnchor="middle" className={`${styles.ptr} ${styles.ptrL}`}>L</text>
            <text x={cx(f.R)} y={base + 44} textAnchor="middle" className={`${styles.ptr} ${styles.ptrR}`}>R</text>
          </>
        )}
        {mover !== null && (
          <line
            x1={cx(mover) + (f.move === 'L' ? 8 : -8)} x2={cx(mover) + (f.move === 'L' ? pitch * 0.85 : -pitch * 0.85)}
            y1={base + 40} y2={base + 40} className={styles.moveArrow} markerEnd="url(#ctr-arrow)"
          />
        )}
      </svg>
    </div>
  );
}

const containerSpec = {
  title: 'Container With Most Water',
  examples: CONTAINER,
  simulate: container,
  code: () => containerCode,
  kinds: {
    start: ['Start', 'neutral'],
    measure: ['Measure, then move', 'accent'],
    done: ['Answer', 'success'],
  },
  describe: (input) => `height = ${list(input.heights)}`,
  rule: () => 'Area = shorter wall × width. Always drop the shorter wall.',
  stats: (f) => [['L', f.kind === 'done' ? '–' : f.L], ['R', f.kind === 'done' ? '–' : f.R], ['area', f.area ?? '–'], ['best', f.best]],
  legend: () => [
    [<Key shape="box" tone="note">water</Key>, 'the current container'],
    [<Key shape="box" tone="danger">wall</Key>, 'the shorter wall, dropped next'],
    [<Key shape="dashed">best</Key>, 'best container so far'],
  ],
  fields: () => [{ name: 'heights', label: 'heights (0 to 12)', placeholder: 'e.g. 4, 3, 2, 1, 4' }],
  values: (input) => ({ heights: input.heights.join(', ') }),
  parse: (values) => parseContainer(values),
  random: () => randomContainer(),
  hint: () => 'Up to 12 heights between 0 and 12. Try two tall walls far apart with short ones between them.',
  delay: () => 3000,
  Stage: ContainerStage,
};

export function ContainerViz(props) {
  return <StepViz spec={containerSpec} {...props} />;
}

// ---------------------------------------------------------------- read and write

const RW_TOP = 48;
const RW_H = 46;
const RW_BACK = RW_TOP + RW_H + 30;

function ReadWriteStage({ step: f, input, width, link, seq, jump }) {
  const n = f.cells.length;
  const pitch = pitchFor(width, n, 40, 64);
  const cx = (k) => k * pitch + pitch / 2;
  const height = RW_BACK + (input.mode === 'zeroes' ? 46 : 8);
  const arcs = [];
  if ((f.kind === 'plan' || f.kind === 'copied' || f.kind === 'swapped') && f.from !== f.to) {
    const faded = f.kind !== 'plan';
    const v = f.cells[f.kind === 'plan' ? f.from : f.to].v;
    arcs.push({ x1: cx(f.from), x2: cx(f.to), y: RW_TOP - 3, depth: -40, tone: 'accent', label: input.mode === 'dedupe' ? `copy ${v}` : `${v} → index ${f.to}`, faded });
    if (input.mode === 'zeroes') arcs.push({ x1: cx(f.to), x2: cx(f.from), y: RW_BACK, depth: 40, tone: 'warn', label: `0 → index ${f.from}`, faded });
  }
  const tags = {};
  if (f.read !== null) tags[f.read] = [{ label: 'read', tone: 'accent' }];
  if (f.write < n) tags[f.write] = [...(tags[f.write] ?? []), { label: 'write', tone: 'interview' }];
  const compare = input.mode === 'dedupe' && (f.kind === 'skip' || f.kind === 'plan') ? f.write - 1 : null;
  return (
    <Stage width={n * pitch} height={height} jump={jump} label={`a = ${list(f.cells.map((c) => c.v))}`}>
      <Arcs id="rw" width={n * pitch} height={height} arcs={arcs} />
      <ArrayStrip
        items={f.cells} y={RW_TOP} pitch={pitch} h={RW_H} seq={seq} flight={link?.swap ?? null}
        bands={f.write > 0 ? [{ from: 0, to: f.write - 1, tone: 'success', label: input.mode === 'dedupe' ? 'result so far' : 'non-zeros, packed' }] : []}
        cls={(k, c) => [
          f.read === k && 'cur',
          compare === k && 'second',
          f.kind === 'copied' && k === f.to && 'hit',
          f.kind === 'done' && input.mode === 'dedupe' && k >= f.write && 'dim',
          f.kind === 'skip' && f.read === k && input.mode === 'dedupe' && 'bad',
          input.mode === 'zeroes' && c.v === 0 && 'muted',
        ].filter(Boolean).join(' ')}
        tags={tags}
      />
    </Stage>
  );
}

const readWriteSpec = {
  title: 'Read and write pointers',
  examples: READ_WRITE,
  simulate: readWrite,
  code: (input) => readWriteCode[input.mode],
  kinds: {
    start: ['Start', 'neutral'],
    skip: ['Skip', 'muted'],
    plan: ['Keep', 'accent'],
    self: ['Keep in place', 'accent'],
    copied: ['Written', 'success'],
    swapped: ['Swapped', 'success'],
    done: ['Answer', 'success'],
  },
  describe: (input) => `nums = ${list(input.nums)}`,
  rule: (input) => (input.mode === 'dedupe' ? 'Keep a value when it differs from the last kept one.' : 'Swap every non-zero into a[write].'),
  stats: (f) => [['read', f.read ?? '–'], ['write', f.write]],
  legend: (f, input) => [
    [<Key tone="accent">read</Key>, 'scans every element'],
    [<Key tone="interview">write</Key>, 'next slot of the result'],
    ...(input.mode === 'dedupe' ? [[<Key shape="box" tone="interview">2</Key>, 'last kept value (compared)']] : [[<Key shape="dashed">0</Key>, 'a zero']]),
    [<Key shape="box" tone="success">kept</Key>, 'finished part'],
  ],
  fields: (input) => [{ name: 'nums', label: input.mode === 'dedupe' ? 'nums (sorted for you)' : 'nums', placeholder: input.mode === 'dedupe' ? 'e.g. 0, 0, 1, 1, 1, 2' : 'e.g. 0, 5, 0, 0, 3' }],
  values: (input) => ({ nums: input.nums.join(', ') }),
  parse: parseReadWrite,
  random: (input) => randomReadWrite(input),
  hint: (input) => (input.mode === 'dedupe' ? 'Up to 10 numbers; they are sorted first, as the problem promises.' : 'Up to 10 numbers between −9 and 99, with some zeros.'),
  delay: (f) => (f.kind === 'plan' ? 1900 : 2400),
  Stage: ReadWriteStage,
};

export function ReadWriteViz(props) {
  return <StepViz spec={readWriteSpec} {...props} />;
}

// ---------------------------------------------------------------- Sort Colors

const DF_TOP = 66;
const DF_H = 46;
const DF_BACK = DF_TOP + DF_H + 30;

function DutchStage({ step: f, width, link, seq, jump }) {
  const n = f.cells.length;
  const pitch = pitchFor(width, n, 40, 64);
  const cx = (k) => k * pitch + pitch / 2;
  const height = DF_BACK + 46;
  const arcs = [];
  if (f.kind === 'planZero' || f.kind === 'planTwo' || f.kind === 'swapped') {
    const faded = f.kind === 'swapped';
    const moving = f.kind === 'swapped' ? f.cells[f.to].v : f.cells[f.from].v;
    const back = f.kind === 'swapped' ? f.cells[f.from].v : f.cells[f.to].v;
    arcs.push({ x1: cx(f.from), x2: cx(f.to), y: DF_TOP - 3, depth: -40, tone: 'accent', label: `${moving} → index ${f.to}`, faded });
    arcs.push({ x1: cx(f.to), x2: cx(f.from), y: DF_BACK, depth: 40, tone: 'warn', label: `${back} → index ${f.from}`, faded });
  }
  const bands = [];
  if (f.low > 0) bands.push({ from: 0, to: f.low - 1, tone: 'danger', label: '0s' });
  if (f.mid > f.low) bands.push({ from: f.low, to: f.mid - 1, tone: 'muted', label: '1s' });
  if (f.high >= f.mid) bands.push({ from: f.mid, to: f.high, tone: 'warn', label: 'unknown' });
  if (f.high < n - 1) bands.push({ from: f.high + 1, to: n - 1, tone: 'note', label: '2s' });
  const tags = {};
  const add = (k, label, tone) => { if (k >= 0 && k < n) tags[k] = [...(tags[k] ?? []), { label, tone }]; };
  if (f.kind !== 'done') { add(f.low, 'low', 'interview'); add(f.mid, 'mid', 'accent'); add(f.high, 'high', 'warn'); }
  return (
    <Stage width={n * pitch} height={height} jump={jump} label={`a = ${list(f.cells.map((c) => c.v))}`}>
      <Arcs id="df" width={n * pitch} height={height} arcs={arcs} />
      <ArrayStrip
        items={f.cells} y={DF_TOP} pitch={pitch} h={DF_H} seq={seq} flight={link?.swap ?? null}
        bands={bands}
        cls={(k, c) => [`fill${c.v}`, f.kind !== 'done' && k === f.mid && f.mid <= f.high && 'cur'].filter(Boolean).join(' ')}
        tags={tags}
      />
    </Stage>
  );
}

const dutchSpec = {
  title: 'Sort Colors: low, mid and high',
  examples: DUTCH,
  simulate: dutchFlag,
  code: () => dutchCode,
  kinds: {
    start: ['Start', 'neutral'],
    one: ['A 1', 'muted'],
    zeroSelf: ['A 0', 'danger'],
    planZero: ['A 0: swap left', 'danger'],
    twoSelf: ['A 2', 'note'],
    planTwo: ['A 2: swap right', 'note'],
    swapped: ['Swapped', 'accent'],
    done: ['Answer', 'success'],
  },
  describe: (input) => `nums = ${list(input.nums)}`,
  rule: () => '0 → swap with low (both move). 1 → mid++. 2 → swap with high (mid stays).',
  stats: (f) => [['low', f.low], ['mid', f.mid], ['high', f.high], ['swaps', f.swaps]],
  legend: () => [
    [<Key tone="interview">low</Key>, 'end of the 0s'],
    [<Key tone="accent">mid</Key>, 'next unknown value'],
    [<Key tone="warn">high</Key>, 'last unknown value'],
    [<Key shape="box" tone="warn">unknown</Key>, 'not looked at yet'],
  ],
  fields: () => [{ name: 'nums', label: 'nums (0, 1 or 2)', placeholder: 'e.g. 2, 0, 1, 2, 0' }],
  values: (input) => ({ nums: input.nums.join(', ') }),
  parse: (values) => parseDutch(values),
  random: () => randomDutch(),
  hint: () => 'Up to 10 values, each 0, 1 or 2. Try one that ends in 0s: watch mid stay put after a swap with high.',
  delay: (f) => (f.kind.startsWith('plan') ? 1900 : 2400),
  Stage: DutchStage,
};

export function DutchFlagViz(props) {
  return <StepViz spec={dutchSpec} {...props} />;
}
