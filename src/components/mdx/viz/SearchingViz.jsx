import { StepViz, Key } from './StepViz';
import { ArrayStrip, Brackets, Float, RowLabel, Stage, pitchFor } from './prims';
import styles from './SearchingViz.module.css';
import {
  FIRST_TRUE, ROTATED, SQRT_RANGE, firstTrue, firstTrueCode, parseFirstTrue, parseRotated, randomFirstTrue, randomRotated,
  rotatedCode, rotatedSearch, searchSpace,
} from './models/binarySearch';
import { ANSWER, answerCode, answerSearch, parseAnswer, randomAnswer } from './models/answerSearch';

/**
 * Binary-search step-throughs for the Binary Search and Binary Search on the Answer lessons:
 *   <FirstTrueViz examples={['lower', 'insert', 'upper']} />   the one template, on a hidden false…true row
 *   <RotatedSearchViz />                                       which half is sorted, and is the target in it?
 *   <AnswerSearchViz examples={['koko']} />                    search the answers, run the check at each probe
 */

const list = (a) => `[${a.join(', ')}]`;

// ---------------------------------------------------------------- the first-true template

const FT_TOP = 48;
const FT_H = 46;

function FirstTrueStage({ step: f, input, width, jump }) {
  const sp = searchSpace(input);
  const phantom = sp.hi === sp.vals.length;           // hi starts one past the last cell: "none"
  const items = phantom ? [...sp.vals, '—'] : sp.vals;
  const n = items.length;
  const pitch = pitchFor(width, n, 36, 60);
  const height = FT_TOP + FT_H + 70;
  const leaving = f.leaving && f.leaving[0] <= f.leaving[1] ? f.leaving : null;
  const inLeaving = (k) => leaving && k >= leaving[0] && k <= leaving[1];
  const candidate = (k) => k >= f.lo && k < f.hi;
  const tags = {};
  const add = (k, label, tone) => { tags[k] = [...(tags[k] ?? []), { label, tone }]; };
  if (f.kind === 'done') add(f.at, 'lo = hi', 'success');
  else {
    add(f.lo, 'lo', 'interview');
    add(f.hi, 'hi', 'warn');
    if (f.mid !== null) add(f.mid, 'mid', 'accent');
  }
  const status = (k) => {
    if (k >= sp.hi) return null;
    if (f.reveal) return sp.ok(k);
    return k in f.known ? f.known[k] : undefined;
  };
  return (
    <Stage width={n * pitch} height={height} jump={jump} label={`search range ${list(sp.vals)}`}>
      {f.mid !== null && f.kind !== 'done' && (
        <Float x={f.mid * pitch + pitch / 2} y={0} tone={f.ok ? 'success' : 'danger'}>{`${sp.show(f.mid)} ${f.ok ? '✓' : '✗'}`}</Float>
      )}
      <ArrayStrip
        items={items} y={FT_TOP} pitch={pitch} h={FT_H}
        bands={f.kind !== 'done' && f.lo < f.hi ? [{ from: f.lo, to: f.hi - 1, tone: 'accent', label: `candidates: ${f.hi - f.lo}` }] : []}
        cls={(k) => [
          phantom && k === n - 1 && 'muted',
          f.kind === 'done' && k === f.at && 'hit',
          f.mid === k && f.kind !== 'done' && 'cur',
          inLeaving(k) && k !== f.mid && 'bad',
          f.kind !== 'done' && !candidate(k) && !inLeaving(k) && !(phantom && k === n - 1) && 'dim',
          f.kind === 'done' && k !== f.at && 'dim',
        ].filter(Boolean).join(' ')}
        badge={(k) => (input.mode === 'sqrt' && k < sp.hi ? { text: `²${k * k}`, tone: 'note' } : null)}
        indexLabel={(k) => (phantom && k === n - 1 ? 'n' : input.mode === 'sqrt' ? `r=${k}` : k)}
        tags={tags}
        sub={(k) => {
          const st = status(k);
          if (st === null) return null;
          return st === undefined ? { text: '?' } : { text: st ? 'T' : 'F', tone: st ? 'success' : 'danger' };
        }}
      />
      <RowLabel y={FT_TOP + FT_H + 54}>{`under each cell: ${sp.cond}? T / F where probed, ? where never computed`}</RowLabel>
    </Stage>
  );
}

const firstTrueSpec = {
  title: 'Binary search: find the first true',
  examples: FIRST_TRUE,
  simulate: firstTrue,
  code: firstTrueCode,
  kinds: {
    start: ['Start', 'neutral'],
    true: ['True: hi = mid', 'success'],
    false: ['False: lo = mid + 1', 'danger'],
    done: ['Answer', 'success'],
  },
  describe: (input) => (input.mode === 'sqrt' ? `x = ${input.x}` : input.mode === 'lower' || input.mode === 'upper' ? `a = ${list(input.nums)}, x = ${input.x}` : `a = ${list(input.nums)}`),
  rule: (input) => `Condition: ${searchSpace(input).cond}. True → hi = mid. False → lo = mid + 1.`,
  stats: (f) => [['lo', f.kind === 'done' ? f.at : f.lo], ['hi', f.kind === 'done' ? f.at : f.hi], ['probes', f.probes], ['candidates', f.kind === 'done' ? 1 : f.hi - f.lo]],
  legend: () => [
    [<Key tone="interview">lo</Key>, 'first candidate'],
    [<Key tone="warn">hi</Key>, 'one past the last candidate'],
    [<Key tone="accent">mid</Key>, 'the probe'],
    [<Key shape="box" tone="danger">x</Key>, 'dropped by this probe'],
    [<Key shape="dashed">?</Key>, 'condition never computed'],
  ],
  fields: (input) => (input.mode === 'sqrt'
    ? [{ name: 'x', label: 'x (0 to 120)', placeholder: '50', short: true }]
    : input.mode === 'lower' || input.mode === 'upper'
      ? [{ name: 'nums', label: 'a (sorted for you)', placeholder: 'e.g. 2, 4, 4, 4, 7, 9' }, { name: 'x', label: 'x', placeholder: '4', short: true }]
      : [{ name: 'nums', label: input.mode === 'rotmin' ? 'a (sorted, then rotated)' : 'a (neighbours differ)', placeholder: input.mode === 'rotmin' ? 'e.g. 5, 7, 9, 1, 3' : 'e.g. 1, 3, 2, 4, 1' }]),
  values: (input) => (input.mode === 'sqrt' ? { x: String(input.x) } : input.mode === 'lower' || input.mode === 'upper' ? { nums: input.nums.join(', '), x: String(input.x) } : { nums: input.nums.join(', ') }),
  parse: parseFirstTrue,
  random: (input) => randomFirstTrue(input),
  hint: (input) => ({
    lower: 'Up to 12 numbers (sorted for you) and the x to look for. Try an x smaller than everything, or bigger.',
    upper: 'Up to 12 numbers (sorted for you) and x. The last x is the first value > x, minus one.',
    sqrt: `Any x from 0 to 120; the range searched is r = 0 … ${SQRT_RANGE - 1}.`,
    rotmin: 'Distinct values, sorted and then rotated, such as 5, 7, 9, 1, 3.',
    peak: 'Up to 12 numbers where neighbours always differ.',
  })[input.mode],
  delay: () => 2800,
  Stage: FirstTrueStage,
};

export function FirstTrueViz(props) {
  return <StepViz spec={firstTrueSpec} {...props} />;
}

// ---------------------------------------------------------------- search in a rotated sorted array

const RS_SPARK = 56;
const RS_TOP = RS_SPARK + 26;
const RS_H = 44;

function RotatedStage({ step: f, input, width, jump }) {
  const a = input.nums;
  const n = a.length;
  const pitch = pitchFor(width, n, 38, 60);
  const W = n * pitch;
  const height = RS_TOP + RS_H + 60;
  const min = Math.min(...a), max = Math.max(...a);
  const py = (v) => 8 + (RS_SPARK - 16) * (1 - (v - min) / Math.max(1, max - min));
  const cx = (k) => k * pitch + pitch / 2;
  const active = f.kind !== 'none' && f.kind !== 'found';
  const inRange = (k) => k >= f.lo && k <= f.hi;
  const leaving = (k) => f.leaving && k >= f.leaving[0] && k <= f.leaving[1];
  const tags = {};
  const add = (k, label, tone) => { if (k >= 0 && k < n) tags[k] = [...(tags[k] ?? []), { label, tone }]; };
  if (f.kind !== 'none') { add(f.lo, 'lo', 'interview'); add(f.hi, 'hi', 'warn'); }
  if (f.mid !== null) add(f.mid, 'mid', 'accent');
  const brackets = f.sorted ? [{ x1: f.sorted[0] * pitch + 4, x2: (f.sorted[1] + 1) * pitch - 4, y: RS_TOP + RS_H + 30, tone: 'success', label: `sorted: ${a[f.sorted[0]]} … ${a[f.sorted[1]]} ${f.inside ? `∋ ${input.target}` : `∌ ${input.target}`}` }] : [];
  return (
    <Stage width={W} height={height} jump={jump} label={`a = ${list(a)}`}>
      <svg className={styles.spark} width={W} height={RS_SPARK} aria-hidden="true">
        {a.slice(1).map((v, k) => (a[k] < v ? <line key={k} x1={cx(k)} y1={py(a[k])} x2={cx(k + 1)} y2={py(v)} className={styles.sparkLine} /> : null))}
        {a.map((v, k) => <circle key={k} cx={cx(k)} cy={py(v)} r={4} className={`${styles.sparkDot} ${f.mid === k ? styles.sparkMid : ''} ${active && !inRange(k) ? styles.sparkOut : ''}`} />)}
      </svg>
      <RowLabel y={RS_SPARK + 4}>{`two ascending runs · target ${input.target}`}</RowLabel>
      <Brackets width={W} height={height} brackets={brackets} />
      <ArrayStrip
        items={a} y={RS_TOP} pitch={pitch} h={RS_H}
        bands={active && f.lo <= f.hi ? [{ from: f.lo, to: f.hi, tone: 'accent' }] : []}
        cls={(k) => [
          f.kind === 'found' && k === f.mid && 'hit',
          f.kind !== 'found' && k === f.mid && 'cur',
          leaving(k) && k !== f.mid && 'bad',
          (f.kind === 'none' || (active && !inRange(k))) && 'dim',
          f.kind === 'found' && k !== f.mid && 'dim',
        ].filter(Boolean).join(' ')}
        tags={tags}
      />
    </Stage>
  );
}

const rotatedSpec = {
  title: 'Search in a rotated sorted array',
  examples: ROTATED,
  simulate: rotatedSearch,
  code: () => rotatedCode,
  kinds: {
    start: ['Start', 'neutral'],
    left: ['Go left', 'accent'],
    right: ['Go right', 'accent'],
    found: ['Found', 'success'],
    none: ['Not found', 'muted'],
  },
  describe: (input) => `a = ${list(input.nums)}, target = ${input.target}`,
  rule: () => 'One half is always sorted: is the target inside it?',
  stats: (f) => [['lo', f.lo], ['hi', f.hi], ['mid', f.mid ?? '–'], ['probes', f.probes]],
  legend: () => [
    [<Key tone="accent">mid</Key>, 'the probe'],
    [<Key shape="box" tone="success">⎵</Key>, 'the sorted half'],
    [<Key shape="box" tone="danger">x</Key>, 'dropped by this probe'],
  ],
  fields: () => [{ name: 'nums', label: 'a (sorted, then rotated)', placeholder: 'e.g. 6, 8, 9, 1, 3, 4' }, { name: 'target', label: 'target', placeholder: '3', short: true }],
  values: (input) => ({ nums: input.nums.join(', '), target: String(input.target) }),
  parse: (values) => parseRotated(values),
  random: () => randomRotated(),
  hint: () => 'Distinct values, sorted and then rotated (or not rotated at all), and a target that may be missing.',
  delay: () => 3000,
  Stage: RotatedStage,
};

export function RotatedSearchViz(props) {
  return <StepViz spec={rotatedSpec} {...props} />;
}

// ---------------------------------------------------------------- binary search on the answer

const AX_TOP = 44;
const AX_H = 64;
const DAY_TONES = ['accent', 'note', 'interview', 'warn', 'success', 'danger'];

function AnswerAxis({ f, W }) {
  const pad = 18;
  const span = Math.max(1, f.hi0 - f.lo0);
  const x = (v) => pad + ((v - f.lo0) / span) * (W - 2 * pad);
  const stepTick = span <= 12 ? 1 : span <= 30 ? 2 : span <= 60 ? 5 : 10;
  const ticks = [];
  for (let v = Math.ceil(f.lo0 / stepTick) * stepTick; v <= f.hi0; v += stepTick) ticks.push(v);
  if (!ticks.includes(f.lo0)) ticks.unshift(f.lo0);
  if (!ticks.includes(f.hi0)) ticks.push(f.hi0);
  const base = AX_TOP + 26;
  return (
    <>
      <div className={styles.axisLine} style={{ left: pad, width: W - 2 * pad, top: base }} />
      {ticks.map((v) => <span key={`t${v}`} className={styles.tick} style={{ left: x(v), top: base + 6 }}>{v}</span>)}
      {f.kind !== 'done' && (
        <div className={styles.range} style={{ left: x(f.lo) - 6, width: x(f.hi) - x(f.lo) + 12, top: base - 9 }}>
          <span className={styles.rangeLabel}>{`lo ${f.lo} … hi ${f.hi}`}</span>
        </div>
      )}
      {f.probed.map((p) => (
        <span key={`p${p.x}`} className={`${styles.probe} ${p.works ? styles.probeYes : styles.probeNo}`} style={{ left: x(p.x), top: base - 6 }} title={`${p.x} ${p.works ? 'works' : 'fails'}`}>
          {p.works ? '✓' : '✗'}
        </span>
      ))}
      {f.mid !== null && (
        <span className={`${styles.midMark} ${f.kind === 'done' ? styles.midDone : ''}`} style={{ left: x(f.mid), top: base - 50 }}>
          {f.kind === 'done' ? `answer ${f.mid}` : `mid ${f.mid}`}
        </span>
      )}
    </>
  );
}

function AnswerStage({ step: f, input, width, jump }) {
  const W = Math.max(300, Math.min(width, 640));
  const c = f.check;
  let body = null;
  let bodyH = 0;
  const top = AX_TOP + AX_H + 48;
  if (input.mode === 'koko' || input.mode === 'ship') {
    const items = input.mode === 'koko' ? input.piles : input.weights;
    const n = items.length;
    const pitch = pitchFor(W, n, 34, 62);
    const x0 = (W - n * pitch) / 2;
    bodyH = 46 + 54;
    const bands = input.mode === 'ship' && c
      ? c.loads.map((ld, d) => {
        const ks = c.day.map((dd, k) => (dd === d ? k : -1)).filter((k) => k >= 0);
        return { from: ks[0], to: ks.at(-1), tone: DAY_TONES[d % DAY_TONES.length], label: `d${d + 1}: ${ld}` };
      })
      : [];
    body = (
      <>
        <RowLabel y={top - 44}>{input.mode === 'koko' ? `piles · hours at speed ${f.mid ?? 'k'}` : `packages in order · capacity ${f.mid ?? 'c'}`}</RowLabel>
        <ArrayStrip
          items={items} x0={x0} y={top} pitch={pitch} h={40} bands={bands}
          index={input.mode === 'ship'}
          sub={input.mode === 'koko' && c ? (k) => ({ text: `${c.per[k]}h`, tone: 'solid' }) : undefined}
        />
      </>
    );
  } else {
    const pos = [...input.positions].sort((a, b) => a - b);
    const lo = pos[0], hi = pos.at(-1);
    const pad = 22;
    const x = (v) => pad + ((v - lo) / Math.max(1, hi - lo)) * (W - 2 * pad);
    const chosen = new Set(c?.placed ?? []);
    bodyH = 74;
    body = (
      <>
        <RowLabel y={top - 44}>{`basket positions · balls placed with gap ≥ ${f.mid ?? 'd'}`}</RowLabel>
        <div className={styles.axisLine} style={{ left: pad, width: W - 2 * pad, top: top + 24 }} />
        {pos.map((p) => (
          <span key={p} className={`${styles.basket} ${chosen.has(p) ? styles.ball : ''}`} style={{ left: x(p), top: top + 14 }}>
            <span className={styles.basketLabel}>{p}</span>
          </span>
        ))}
        {c && c.placed.slice(1).map((p, k) => (
          <span key={`g${k}`} className={styles.gap} style={{ left: (x(c.placed[k]) + x(p)) / 2, top: top - 2 }}>{p - c.placed[k]}</span>
        ))}
      </>
    );
  }
  const height = top + bodyH;
  return (
    <Stage width={W} height={height} jump={jump} label="answer range and the check">
      <RowLabel y={4}>{`possible answers ${f.lo0} … ${f.hi0}`}</RowLabel>
      <AnswerAxis f={f} W={W} />
      {body}
      {c && f.mid !== null && (
        <Float anchor="right" y={top - 48} tone={c.works ? 'success' : 'danger'}>{`${c.summary} ${c.works ? '✓' : '✗'}`}</Float>
      )}
    </Stage>
  );
}

const answerSpec = {
  title: 'Binary search on the answer',
  examples: ANSWER,
  simulate: answerSearch,
  code: (input) => answerCode[input.mode],
  kinds: {
    start: ['Start', 'neutral'],
    works: ['Check passes', 'success'],
    fails: ['Check fails', 'danger'],
    done: ['Answer', 'success'],
  },
  describe: (input) => (input.mode === 'koko' ? `piles = ${list(input.piles)}, h = ${input.h}` : input.mode === 'ship' ? `weights = ${list(input.weights)}, days = ${input.days}` : `positions = ${list(input.positions)}, m = ${input.m}`),
  rule: (input) => ({
    koko: 'Smallest speed whose hours fit in h.',
    ship: 'Smallest capacity that ships everything in time.',
    cows: 'Largest minimum gap that still fits m balls.',
  })[input.mode],
  stats: (f) => [['lo', f.lo], ['hi', f.hi], ['checks', f.probes], ['candidates', f.kind === 'done' ? 1 : f.hi - f.lo + 1]],
  legend: (f, input) => [
    [<Key tone="accent">mid</Key>, 'candidate being checked'],
    [<Key shape="text" tone="success">✓</Key>, 'check passed'],
    [<Key shape="text" tone="danger">✗</Key>, 'check failed'],
    ...(input.mode === 'ship' ? [[<Key shape="box" tone="note">day</Key>, 'packages loaded on one day']] : []),
    ...(input.mode === 'cows' ? [[<Key shape="pill" tone="accent">●</Key>, 'a ball (greedy: earliest spot)']] : []),
  ],
  fields: (input) => ({
    koko: [{ name: 'piles', label: 'piles (1 to 30)', placeholder: 'e.g. 30, 11, 23, 4, 20' }, { name: 'h', label: 'h', placeholder: '6', short: true }],
    ship: [{ name: 'weights', label: 'weights (1 to 20)', placeholder: 'e.g. 3, 2, 2, 4, 1, 4' }, { name: 'days', label: 'days', placeholder: '3', short: true }],
    cows: [{ name: 'positions', label: 'positions (0 to 60)', placeholder: 'e.g. 1, 2, 3, 4, 7' }, { name: 'm', label: 'm', placeholder: '3', short: true }],
  })[input.mode],
  values: (input) => (input.mode === 'koko' ? { piles: input.piles.join(', '), h: String(input.h) } : input.mode === 'ship' ? { weights: input.weights.join(', '), days: String(input.days) } : { positions: input.positions.join(', '), m: String(input.m) }),
  parse: parseAnswer,
  random: (input) => randomAnswer(input),
  hint: (input) => ({
    koko: 'Up to 8 piles and h ≥ the number of piles (Koko eats from one pile per hour).',
    ship: 'Up to 10 package weights, shipped in order, and the number of days.',
    cows: 'Up to 8 distinct basket positions and m balls (2 or more).',
  })[input.mode],
  delay: () => 3200,
  Stage: AnswerStage,
};

export function AnswerSearchViz(props) {
  return <StepViz spec={answerSpec} {...props} />;
}
