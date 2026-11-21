import { StepViz, Key } from './StepViz';
import { ArrayStrip, Stage, pitchFor } from './prims';
import { CmpCard } from './sideKit';
import { DIVIDE, LIMITS, divide, divideCode, parseDivide, randomDivide, tokenize } from './models/divide';
import styles from './DivideViz.module.css';

/**
 * Divide and conquer, one call at a time:
 *   <DivideViz examples={['list']} />  merge sort on a linked list      (Sort List)
 *   <DivideViz examples={['bad2']} />  cut a string at letters too rare  (LC 395)
 *   <DivideViz examples={['ops']} />   choose the last operator          (LC 241)
 * Every call is a row of an outline, indented under the call that made it: it appears when its parent
 * splits, is highlighted while it runs, and shows what it returned. The comparison card says what this
 * step decided; for strings and expressions the input strip shows the range being solved.
 */

const SYM = { '+': '+', '-': '−', '*': '×' };

function Outline({ nodes, cur }) {
  return (
    <ol className={styles.outline} aria-label="Calls">
      {nodes.map((n) => (
        <li
          key={n.id}
          className={[styles.row, styles[`s_${n.state}`], n.id === cur && styles.cur].filter(Boolean).join(' ')}
          style={{ marginLeft: n.depth * 18 }}
        >
          {n.via && <span className={styles.via}>{n.via}</span>}
          <code className={styles.label}>{n.label}</code>
          {n.res !== null
            ? <span className={styles.res}>{n.state === 'memo' ? 'memo ' : ''}→ <b>{n.res}</b></span>
            : <span className={styles.wait}>{n.state === 'run' ? 'working…' : 'waiting'}</span>}
        </li>
      ))}
    </ol>
  );
}

function DivideStage({ step: f, input, width, jump }) {
  const strip = input.mode === 'bad' ? input.s.split('') : input.mode === 'ops' ? tokenize(input.expr).map((t) => SYM[t] ?? t) : null;
  let stage = null;
  if (strip) {
    const n = strip.length;
    const pitch = pitchFor(width - 8, n, 22, 48);
    const [lo, hi] = f.range ?? [0, n];
    stage = (
      <Stage width={n * pitch} height={input.mode === 'bad' ? 46 + 30 : 46 + 10} jump={jump} label={input.mode === 'bad' ? `s = "${input.s}"` : `expression ${input.expr}`}>
        <ArrayStrip
          items={strip} y={4} pitch={pitch} h={40} index={input.mode === 'bad'}
          bands={f.range && (lo > 0 || hi < n) ? [{ from: lo, to: hi - 1, tone: 'accent' }] : []}
          cls={(k) => [f.marks?.[k], (k < lo || k >= hi) && 'dim'].filter(Boolean).join(' ')}
        />
      </Stage>
    );
  }
  return (
    <div>
      {stage}
      {f.card && <div className={styles.cardRow}><CmpCard {...f.card} /></div>}
      <Outline nodes={f.nodes} cur={f.cur} />
    </div>
  );
}

const KINDS = {
  start: ['Start', 'neutral'],
  split: ['Divide', 'accent'],
  base: ['Base case', 'success'],
  merge: ['Combine', 'success'],
  short: ['Too short', 'warn'],
  valid: ['Valid', 'success'],
  best: ['Combine', 'success'],
  number: ['Base case', 'success'],
  memo: ['Memo', 'warn'],
  combine: ['Combine', 'success'],
  store: ['Return', 'neutral'],
  done: ['Answer', 'success'],
};

const describe = (input) => (input.mode === 'merge' ? `head = ${input.vals.join(' → ')}` : input.mode === 'bad' ? `s = "${input.s}", k = ${input.k}` : `expression = "${input.expr}"`);
const RULE = {
  merge: 'Divide at the middle, sort both halves, combine by merging.',
  bad: 'Letters rarer than k cut the range; the best piece wins.',
  ops: 'Each operator takes a turn as the last one; left results × right results.',
};

const spec = {
  title: 'Divide and conquer, one call at a time',
  examples: DIVIDE,
  simulate: divide,
  code: (input) => divideCode(input.mode),
  kinds: KINDS,
  describe,
  rule: (input) => RULE[input.mode],
  stats: (f) => [
    ['calls', f.nodes.length],
    ['finished', f.nodes.filter((n) => n.state === 'done' || n.state === 'memo').length],
    ['depth', Math.max(...f.nodes.map((n) => n.depth))],
  ],
  legend: (f) => [
    [<Key tone="accent">row</Key>, 'the call running now'],
    [<Key shape="dashed">waiting</Key>, 'made by a split, not run yet'],
    [<Key shape="text" tone="success">→ x</Key>, 'what the call returned'],
    ...(f.nodes.some((n) => n.state === 'memo') ? [[<Key tone="warn">memo</Key>, 'answer reused, not recomputed']] : []),
  ],
  fields: (input) => (input.mode === 'merge'
    ? [{ name: 'vals', label: 'list', placeholder: 'e.g. 4, 2, 1, 3' }]
    : input.mode === 'bad'
      ? [{ name: 's', label: 's', placeholder: 'e.g. ababbc' }, { name: 'k', label: 'k', placeholder: '2', short: true }]
      : [{ name: 'expr', label: 'expression', placeholder: 'e.g. 2*3-4*5' }]),
  values: (input) => (input.mode === 'merge' ? { vals: input.vals.join(', ') } : input.mode === 'bad' ? { s: input.s, k: String(input.k) } : { expr: input.expr }),
  parse: parseDivide,
  random: (input) => randomDivide(input),
  hint: (input) => (input.mode === 'merge'
    ? `Up to ${LIMITS.merge} whole numbers.`
    : input.mode === 'bad'
      ? `Up to ${LIMITS.bad} lowercase letters, k from 1 to 9.`
      : `Numbers 0–99 with +, − or ×, up to ${LIMITS.ops} operators.`),
  delay: (f) => (f.kind === 'combine' || f.kind === 'merge' ? 3200 : 2400),
  Stage: DivideStage,
};

export function DivideViz(props) {
  return <StepViz spec={spec} {...props} />;
}
