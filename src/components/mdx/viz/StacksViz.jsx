import { StepViz, Key } from './StepViz';
import { Arcs, ArrayStrip, Chips, Float, RowLabel, Stage, pitchFor } from './prims';
import styles from './StacksViz.module.css';
import {
  ASTEROIDS, BRACKETS, HISTOGRAM, MONO, SLIDE, asteroidCode, asteroids, brackets, bracketsCode, histogram, histogramCode, mono, monoCode,
  parseAsteroids, parseBrackets, parseHistogram, parseMono, parseSlide, randomAsteroids, randomBrackets, randomHistogram, randomMono,
  randomSlide, slide, slideCode,
} from './models/stacks';

/**
 * Step-throughs for the Stack Patterns and Monotonic Stack lessons:
 *   <BracketsViz />      openers push the closer they expect onto a pile of plates; closers must match the top
 *   <AsteroidViz />      rocks fly, collide and explode; the stack holds the survivors
 *   <NextGreaterViz />   bars wait on a stack until a bigger (or smaller, or warmer) one answers them
 *   <HistogramViz />     an increasing stack; each pop draws the rectangle that bar can make
 *   <SlidingMaxViz />    a decreasing deque whose front is the window's maximum
 */

const list = (a) => `[${a.join(', ')}]`;

// ---------------------------------------------------------------- brackets

const PLATE_H = 30;
const SHOW_PLATES = 6;

function BracketsStage({ step: f, input, width, seq, jump }) {
  const n = f.chars.length;
  const pitch = pitchFor(width, n, 34, 54);
  const W = Math.max(n * pitch, 220);
  const x0 = (W - n * pitch) / 2;
  const deepest = Math.min(SHOW_PLATES, Math.max(1, ...brackets(input).map((s) => s.stack.length)));
  const top = 44;
  const towerTop = top + 46 + 66;
  const height = towerTop + (deepest + 1) * (PLATE_H + 4) + 30;
  const cx = (k) => x0 + k * pitch + pitch / 2;
  const arcs = f.pairs.map(([open, k]) => ({ x1: cx(open), x2: cx(k), y: top - 4, depth: -Math.min(34, 10 + (k - open) * 5), tone: 'success', head: false, faded: !(f.pair && f.pair[1] === k) }));
  if (f.kind === 'fail' && f.pair) arcs.push({ x1: cx(f.pair[0]), x2: cx(f.pair[1]), y: top - 4, depth: -24, tone: 'danger', head: false, dashed: true });
  const shown = f.stack.slice(-SHOW_PLATES);
  const hidden = f.stack.length - shown.length;
  const plateW = 92;
  const px = W / 2 - plateW / 2;
  const leaving = f.popped !== undefined && f.popped !== null;
  return (
    <Stage width={W} height={height} jump={jump} label={`brackets ${input.s}`}>
      <Arcs id="br" width={W} height={height} arcs={arcs} />
      <ArrayStrip
        items={f.chars} x0={x0} y={top} pitch={pitch}
        cls={(k) => [
          f.i === k && 'cur',
          f.state[k] === 'matched' && 'home',
          f.state[k] === 'open' && 'kept',
          f.state[k] === 'bad' && 'bad',
          f.state[k] === 'todo' && f.i !== k && 'dim',
        ].filter(Boolean).join(' ')}
        tags={f.i !== null ? { [f.i]: [{ label: 'c', tone: 'accent' }] } : {}}
      />
      <RowLabel x={px - 4} y={towerTop - 22}>stack of expected closers (top ↑)</RowLabel>
      <div className={styles.tower} style={{ left: px, top: towerTop, width: plateW, height: (deepest + 1) * (PLATE_H + 4) }}>
        {leaving && (
          <span key={`leave${seq}`} className={`${styles.plate} ${styles.plateLeave} ${f.kind === 'fail' ? styles.plateBad : styles.plateGood}`} style={{ bottom: shown.length * (PLATE_H + 4) }}>
            <b>{CLOSER_OF(f.chars[f.popped])}</b>
            <small>{f.kind === 'fail' ? '✗ no match' : '✓ matched'}</small>
          </span>
        )}
        {shown.map((p, k) => (
          <span
            key={p.id}
            className={`${styles.plate} ${f.pushed === p.id ? styles.plateNew : ''} ${k === shown.length - 1 ? styles.plateTop : ''} ${f.kind === 'fail' && f.i === null ? styles.plateBad : ''}`}
            style={{ bottom: k * (PLATE_H + 4) }}
          >
            <b>{p.close}</b>
            <small>for {p.open} at {p.id}</small>
          </span>
        ))}
        {f.stack.length === 0 && !leaving && <span className={styles.emptyPile}>empty</span>}
        {hidden > 0 && <span className={styles.morePlates}>+{hidden} below</span>}
      </div>
    </Stage>
  );
}

const CLOSER_OF = (c) => ({ '(': ')', '[': ']', '{': '}' })[c] ?? c;

const bracketsSpec = {
  title: 'Valid brackets with a stack',
  examples: BRACKETS,
  simulate: brackets,
  code: () => bracketsCode,
  kinds: { start: ['Start', 'neutral'], push: ['Push', 'accent'], match: ['Match: pop', 'success'], fail: ['Not valid', 'danger'], valid: ['Valid', 'success'] },
  describe: (input) => `s = "${input.s}"`,
  rule: () => 'Opener: push the closer it needs. Closer: it must equal the top.',
  stats: (f) => [['stack size', f.stack.length]],
  legend: () => [
    [<Key shape="box" tone="accent">(</Key>, 'opened, waiting'],
    [<Key shape="box" tone="success">)</Key>, 'matched pair'],
    [<Key shape="box" tone="danger">]</Key>, 'the problem'],
  ],
  fields: () => [{ name: 's', label: 'brackets', placeholder: 'e.g. {[()]}' }],
  values: (input) => ({ s: input.s }),
  parse: parseBrackets,
  random: () => randomBrackets(),
  hint: () => 'Up to 14 of ( ) [ ] { }. Try crossing two pairs, or leaving one open.',
  delay: () => 2400,
  Stage: BracketsStage,
};

export function BracketsViz(props) {
  return <StepViz spec={bracketsSpec} {...props} />;
}

// ---------------------------------------------------------------- asteroids

const rockSize = (v) => Math.min(48, 22 + Math.abs(v) * 2.2);

function AsteroidStage({ step: f, width, seq, jump }) {
  const n = f.rocks.length;
  const pitch = Math.max(44, Math.min(62, Math.floor((width - 20) / (n + 1.5))));
  const W = Math.max(300, Math.round(pitch * (n + 1.5) + 20));
  const H = 150;
  const mid = 70;
  const slot = {};
  f.stack.forEach((id, k) => { slot[id] = k; });
  let next = f.stack.length;
  const lost = new Set(f.hit?.lost ?? []);
  if (f.hit) {
    if (lost.has(f.hit.left)) slot[f.hit.left] = next++;
    if (slot[f.hit.right] === undefined) slot[f.hit.right] = next;
    next++;
  } else if (f.cur !== null && slot[f.cur] === undefined) slot[f.cur] = next++;
  const upcoming = f.rocks.filter((r) => f.cur === null ? f.kind === 'start' : r.id > f.cur);
  upcoming.forEach((r, k) => { slot[r.id] = next + 0.5 + k; });
  const xOf = (id) => 14 + slot[id] * pitch + pitch / 2;
  const stackEnd = f.stack.length ? xOf(f.stack.at(-1)) + pitch / 2 : 14;
  return (
    <Stage width={W} height={H} jump={jump} label="asteroids">
      <div className={styles.space} style={{ top: mid - 42, height: 84 }} />
      {f.stack.length > 0 && <div className={styles.survivors} style={{ left: 8, width: stackEnd - 4, top: mid + 34 }}>survivors (the stack)</div>}
      {f.rocks.map((r) => {
        if (slot[r.id] === undefined) return null;
        const size = rockSize(r.v);
        const exploding = lost.has(r.id);
        const isUp = upcoming.includes(r);
        return (
          <div
            key={r.id}
            className={[styles.rock, r.v > 0 ? styles.right : styles.left, isUp && styles.rockUp, f.cur === r.id && !exploding && styles.rockCur].filter(Boolean).join(' ')}
            style={{ left: xOf(r.id), top: mid, width: size, height: size }}
          >
            <span key={exploding ? `x${seq}` : 'r'} className={`${styles.rockBody} ${exploding ? styles.explode : ''}`}>{r.v}</span>
            <i className={styles.trail} aria-hidden="true">{r.v > 0 ? '→' : '←'}</i>
            {exploding && <span key={`b${seq}`} className={styles.burst} aria-hidden="true" />}
          </div>
        );
      })}
      {f.hit && <Float x={(xOf(f.hit.left) + xOf(f.hit.right)) / 2} y={4} tone={lost.size === 2 ? 'warn' : 'danger'}>{`${f.rocks[f.hit.left].v} vs ${f.rocks[f.hit.right].v}`}</Float>}
    </Stage>
  );
}

const asteroidSpec = {
  title: 'Asteroid collision',
  examples: ASTEROIDS,
  simulate: asteroids,
  code: () => asteroidCode,
  kinds: { start: ['Start', 'neutral'], push: ['Survives', 'accent'], boom: ['Collision', 'danger'], done: ['Answer', 'success'] },
  describe: (input) => `asteroids = ${list(input.a)}`,
  rule: () => 'Only a left-mover arriving after a right-mover can collide; it hits the newest one first.',
  stats: (f) => [['survivors', f.stack.length]],
  legend: () => [[<Key tone="accent">5 →</Key>, 'flies right'], [<Key tone="interview">−5 ←</Key>, 'flies left'], [<Key shape="dashed">7</Key>, 'still to come']],
  fields: () => [{ name: 'a', label: 'asteroids (non-zero)', placeholder: 'e.g. 5, 10, -5' }],
  values: (input) => ({ a: input.a.join(', ') }),
  parse: parseAsteroids,
  random: () => randomAsteroids(),
  hint: () => 'Up to 8 non-zero sizes between −20 and 20; the sign is the direction.',
  delay: () => 2400,
  Stage: AsteroidStage,
};

export function AsteroidViz(props) {
  return <StepViz spec={asteroidSpec} {...props} />;
}

// ---------------------------------------------------------------- next greater element

function Bars({ values, x0, pitch, base, maxH, scale, cls, label, under }) {
  return values.map((v, k) => {
    const h = scale(v);
    return (
      <div key={k} className={`${styles.bar} ${cls(k)}`} style={{ left: x0 + k * pitch + 3, width: pitch - 6, top: base - h, height: h }}>
        <span className={styles.barVal}>{label ? label(k, v) : v}</span>
        {under && <span className={styles.barUnder} style={{ top: h + 6 }}>{under(k)}</span>}
      </div>
    );
  });
}

function MonoStage({ step: f, input, width, jump }) {
  const n = f.a.length;
  const pitch = pitchFor(width, n, 36, 62);
  const W = n * pitch;
  const lo = Math.min(...f.a), hi = Math.max(...f.a);
  const maxH = 110;
  const scale = (v) => 18 + (hi === lo ? maxH / 2 : ((v - lo) / (hi - lo)) * (maxH - 18));
  const base = 48 + maxH;
  const waiting = new Set(f.stack);
  const answered = (k) => f.ans[k] !== null;
  const cx = (k) => k * pitch + pitch / 2;
  const arcs = f.arrows.map((r) => ({ x1: cx(r.from), x2: cx(r.to), y: base - scale(f.a[r.from]) - 18, depth: -24, tone: r.old ? 'muted' : 'success', label: r.old ? undefined : r.label, faded: r.old }));
  const height = base + 64;
  return (
    <>
      <Stage width={W} height={height} jump={jump} label="bars">
        <Arcs id="mono" width={W} height={height} arcs={arcs} />
        <Bars
          values={f.a} x0={0} pitch={pitch} base={base} maxH={maxH} scale={scale}
          label={(k, v) => (input.mode === 'temps' ? `${v}°` : v)}
          cls={(k) => [
            f.i === k && styles.barCur,
            waiting.has(k) && styles.barWait,
            f.popped === k && styles.barAnswered,
            answered(k) && f.popped !== k && styles.barDone,
            f.leftover?.includes(k) && styles.barNone,
            f.i !== null && k > f.i && styles.barLater,
          ].filter(Boolean).join(' ')}
          under={(k) => (f.ans[k] === null ? (waiting.has(k) ? '…' : '') : String(f.ans[k]))}
        />
        <RowLabel y={base + 40}>{input.mode === 'temps' ? 'under each day: days until warmer' : `under each bar: its next ${input.mode === 'nse' ? 'smaller' : 'greater'} (−1 = none)`}</RowLabel>
      </Stage>
      <Chips label="waiting stack (top →)" chips={f.stack.map((k, j) => ({ key: k, text: input.mode === 'temps' ? `${f.a[k]}° (day ${k})` : `${f.a[k]} (i=${k})`, tone: j === f.stack.length - 1 ? 'accent' : undefined, isNew: f.pushed === k }))} />
    </>
  );
}

const monoSpec = {
  title: 'Monotonic stack: waiting for the next one',
  examples: MONO,
  simulate: mono,
  code: (input) => monoCode(input.mode),
  kinds: { start: ['Start', 'neutral'], pop: ['Answer: pop', 'success'], push: ['Push: wait', 'accent'], done: ['Answers', 'success'] },
  describe: (input) => `${input.mode === 'temps' ? 'temperatures' : 'a'} = ${list(input.a)}`,
  rule: (input) => (input.mode === 'nse' ? 'Pop while the new value is smaller than the top: it is their answer.' : `Pop while the new value is ${input.mode === 'temps' ? 'warmer' : 'greater'} than the top: it is their answer.`),
  stats: (f) => [['waiting', f.stack.length], ['answered', f.ans.filter((x) => x !== null).length]],
  legend: () => [
    [<Key shape="box" tone="accent">4</Key>, 'waiting on the stack'],
    [<Key shape="box" tone="warn">4</Key>, 'the new arrival'],
    [<Key shape="box" tone="success">2</Key>, 'answered now'],
  ],
  fields: (input) => [{ name: 'a', label: input.mode === 'temps' ? 'temperatures (30 to 99)' : 'a (0 to 99)', placeholder: input.mode === 'temps' ? 'e.g. 73, 74, 75, 71' : 'e.g. 2, 1, 2, 4, 3' }],
  values: (input) => ({ a: input.a.join(', ') }),
  parse: parseMono,
  random: (input) => randomMono(input),
  hint: () => 'Between 2 and 10 numbers.',
  delay: () => 2600,
  Stage: MonoStage,
};

export function NextGreaterViz(props) {
  return <StepViz spec={monoSpec} {...props} />;
}

// ---------------------------------------------------------------- largest rectangle in a histogram

function HistogramStage({ step: f, width, jump }) {
  const n = f.h.length;
  const pitch = pitchFor(width, n + 1, 34, 60);
  const W = (n + 1) * pitch;
  const unit = Math.min(12, 132 / Math.max(1, ...f.h));
  const base = 36 + Math.max(1, ...f.h) * unit;
  const onStack = new Set(f.stack);
  const rectBox = (r, cls) => r && (
    <div className={`${styles.rect} ${cls}`} style={{ left: r.from * pitch + 1, width: (r.to - r.from + 1) * pitch - 2, top: base - r.height * unit, height: r.height * unit }}>
      <span>{r.height} × {r.to - r.from + 1} = {r.area}</span>
    </div>
  );
  return (
    <>
      <Stage width={W} height={base + 52} jump={jump} label="histogram">
        {[...f.h, 0].map((v, k) => (
          <div
            key={k}
            className={[styles.bar, styles.hbar, k === n && styles.barSentinel, onStack.has(k) && styles.barWait, f.popped === k && styles.barAnswered, f.i === k && styles.barCur].filter(Boolean).join(' ')}
            style={{ left: k * pitch + 3, width: pitch - 6, top: base - Math.max(v * unit, 2), height: Math.max(v * unit, 2) }}
          >
            <span className={styles.barVal}>{v}</span>
            <span className={styles.barUnder} style={{ top: Math.max(v * unit, 2) + 6 }}>{k === n ? 'end' : k}</span>
          </div>
        ))}
        {f.bestRect && (!f.rect || f.rect.area !== f.bestRect.area || f.rect.from !== f.bestRect.from) && rectBox(f.bestRect, styles.rectBest)}
        {f.rect && rectBox(f.rect, f.better ? styles.rectNew : styles.rectTry)}
      </Stage>
      <Chips label="stack heights (top →)" chips={f.stack.map((k, j) => ({ key: k, text: `${f.h[k]} (i=${k})`, tone: j === f.stack.length - 1 ? 'accent' : undefined, isNew: f.pushed === k }))} />
    </>
  );
}

const histogramSpec = {
  title: 'Largest rectangle in a histogram',
  examples: HISTOGRAM,
  simulate: histogram,
  code: () => histogramCode,
  kinds: { start: ['Start', 'neutral'], push: ['Push', 'accent'], pop: ['Pop: measure', 'warn'], done: ['Answer', 'success'] },
  describe: (input) => `heights = ${list(input.h)}`,
  rule: () => 'Keep heights increasing. A shorter bar finishes every taller bar on the stack.',
  stats: (f) => [['best', f.best], ['stack', f.stack.length]],
  legend: () => [
    [<Key shape="box" tone="accent">5</Key>, 'on the stack'],
    [<Key shape="box" tone="warn">2</Key>, 'the new bar'],
    [<Key shape="dashed">0</Key>, 'sentinel'],
    [<Key shape="box" tone="success">10</Key>, 'best rectangle'],
  ],
  fields: () => [{ name: 'h', label: 'heights (0 to 12)', placeholder: 'e.g. 2, 1, 5, 6, 2, 3' }],
  values: (input) => ({ h: input.h.join(', ') }),
  parse: parseHistogram,
  random: () => randomHistogram(),
  hint: () => 'Up to 9 bars, each 0 to 12 tall.',
  delay: () => 2800,
  Stage: HistogramStage,
};

export function HistogramViz(props) {
  return <StepViz spec={histogramSpec} {...props} />;
}

// ---------------------------------------------------------------- sliding window maximum

function SlideStage({ step: f, width, jump }) {
  const n = f.a.length;
  const pitch = pitchFor(width, n, 36, 58);
  const W = n * pitch;
  const top = 34;
  const inDq = new Set(f.dq);
  const dropped = new Set(f.dropped ?? []);
  const tags = {};
  if (f.i !== null) tags[f.i] = [{ label: 'i', tone: 'accent' }];
  if (f.dq.length) tags[f.dq[0]] = [...(tags[f.dq[0]] ?? []), { label: 'max', tone: 'success' }];
  return (
    <>
      <Stage width={W} height={top + 46 + 44} jump={jump} label="window">
        {f.window && f.kind !== 'done' && <Float x={((f.window[0] + f.window[1] + 1) / 2) * pitch} y={0} tone={f.window[1] - f.window[0] + 1 === f.k ? 'accent' : 'warn'}>{`window ${f.window[0]}–${f.window[1]}`}</Float>}
        <ArrayStrip
          items={f.a} y={top} pitch={pitch}
          bands={f.window && f.kind !== 'done' ? [{ from: f.window[0], to: f.window[1], tone: 'accent' }] : []}
          cls={(k) => [
            dropped.has(k) && 'bad',
            inDq.has(k) && k === f.dq[0] && 'hit',
            inDq.has(k) && k !== f.dq[0] && 'kept',
            f.window && (k < f.window[0] || k > f.window[1]) && !dropped.has(k) && 'dim',
          ].filter(Boolean).join(' ')}
          tags={tags}
        />
      </Stage>
      <Chips label="deque (front → back)" chips={[
        ...f.dq.map((k, j) => ({ key: `d${k}`, text: `${f.a[k]}`, note: `i=${k}`, tone: j === 0 ? 'success' : 'accent', isNew: f.pushed === k })),
        ...(f.dropped ?? []).map((k) => ({ key: `x${k}`, text: `${f.a[k]} ✗`, tone: 'danger', isNew: true })),
      ]} />
      <Chips label="window maxima" chips={f.out.map((v, k) => ({ key: k, text: String(v), isNew: k === f.out.length - 1 && f.kind === 'out' }))} empty="none yet" />
    </>
  );
}

const slideSpec = {
  title: 'Sliding-window maximum with a deque',
  examples: SLIDE,
  simulate: slide,
  code: () => slideCode,
  kinds: { start: ['Start', 'neutral'], front: ['Front leaves', 'warn'], back: ['Back pops', 'danger'], push: ['Push', 'accent'], out: ['Max', 'success'], done: ['Answer', 'success'] },
  describe: (input) => `a = ${list(input.a)}, k = ${input.k}`,
  rule: () => 'Deque values decrease front to back; the front is the maximum.',
  stats: (f) => [['deque', f.dq.length]],
  legend: () => [
    [<Key shape="box" tone="success">5</Key>, 'front: the window max'],
    [<Key shape="box" tone="accent">3</Key>, 'in the deque'],
    [<Key shape="box" tone="danger">1</Key>, 'thrown out now'],
  ],
  fields: () => [{ name: 'a', label: 'a', placeholder: 'e.g. 1, 3, -1, -3, 5, 3, 6, 7' }, { name: 'k', label: 'k', placeholder: '3', short: true }],
  values: (input) => ({ a: input.a.join(', '), k: String(input.k) }),
  parse: parseSlide,
  random: () => randomSlide(),
  hint: () => 'Up to 10 numbers between −20 and 20, and a window size k.',
  delay: () => 2600,
  Stage: SlideStage,
};

export function SlidingMaxViz(props) {
  return <StepViz spec={slideSpec} {...props} />;
}
