import { StepViz, Key } from './StepViz';
import { Chips } from './prims';
import styles from './SpecialViz.module.css';
import {
  BIT_WALK, bitWalk, bitWalkCode, bitWalkDescribe, bitWalkFields, bitWalkRule, bitWalkValues, parseBitWalk, randomBitWalk,
} from './models/bitWalk';

/**
 * <BitWalkViz /> — the Bit Manipulation lesson's problems, one engine: rows of cells lined up by place
 * value (the same look as <BitsViz>), where a cell can also hold a count or be blank.
 */

const cellClass = (v) => (v === '1' ? styles.one : v === '0' ? styles.zero : v === '' ? styles.blank : styles.num);

function BitWalkStage({ step: f, width }) {
  const w = Math.max(1, ...f.rows.map((r) => r.cells.length), f.heads?.length ?? 0);
  const cell = Math.max(24, Math.min(40, Math.floor((Math.min(width, 540) - 160) / w)));
  return (
    <div className={styles.wrap}>
      {f.rows.length > 0 && (
        <div className={styles.bits} style={{ gridTemplateColumns: `26px 84px repeat(${w}, ${cell}px) 40px` }}>
          {f.heads && [<span key="h0" />, <span key="h1" />, ...f.heads.map((h, k) => <span key={`h${k + 2}`} className={styles.place}>{h}</span>), <span key="hz" />]}
          {f.rows.map((row, r) => [
            row.result && r > 0 && <span key={`rule${r}`} className={styles.bitsRule} />,
            <span key={`o${r}`} className={styles.op}>{row.op ?? (row.result && r > 0 ? '=' : '')}</span>,
            <span key={`l${r}`} className={`${styles.rowLabel} ${row.result ? styles.resultLabel : ''}`}>{row.label}</span>,
            ...row.cells.map((v, k) => (
              <span key={`${r}-${k}`} className={[styles.bit, cellClass(v), row.result && styles.result, row.tags?.[k] && styles[`t_${row.tags[k]}`]].filter(Boolean).join(' ')} style={{ height: cell }}>{v}</span>
            )),
            <span key={`v${r}`} className={`${styles.dec} ${row.result ? styles.resultLabel : ''}`}>{row.dec}</span>,
          ])}
        </div>
      )}
      {(f.chips ?? []).map((c) => <Chips key={c.label} label={c.label} chips={c.chips} empty="none" />)}
    </div>
  );
}

const LEGEND = {
  pow2: [['accent', '1', 'a 1-bit'], ['warn', '·', 'flipped by − 1'], ['success', '0', 'the AND']],
  countbits: [['accent', '1', 'a 1-bit'], ['success', '2', 'ans so far']],
  reverse: [['accent', '1', 'the bit taken'], ['success', '1', 'where it lands']],
  single2: [['warn', '2', 'counts just raised'], ['success', '1', 'count % 3']],
  sum: [['danger', '1', 'both 1: makes a carry'], ['warn', '1', 'the carry, moved left']],
  single3: [['warn', '1', 'the bit that splits them'], ['success', '1', 'one single value']],
  addbinary: [['accent', '1', 'this column'], ['success', '0', 'the sum so far']],
  rangeand: [['neutral', '1', 'faded: columns shifted out'], ['success', '1', 'the common prefix']],
  arrayend: [['accent', '0', 'circled: a free slot in x'], ['success', '1', 'the result']],
};

const spec = {
  title: 'Bits, step by step',
  examples: BIT_WALK,
  simulate: bitWalk,
  code: (input) => bitWalkCode(input.mode),
  kinds: { start: ['Start', 'neutral'], sub: ['n − 1', 'warn'], fail: ['No', 'danger'], match: ['Result', 'success'], fill: ['Fill', 'accent'], move: ['Shift', 'accent'], add: ['Add', 'accent'], xor: ['XOR', 'accent'], carry: ['Carry', 'warn'], place: ['Place', 'accent'], done: ['Answer', 'success'] },
  describe: bitWalkDescribe,
  rule: (input) => bitWalkRule[input.mode],
  stats: () => [],
  legend: (f, input) => LEGEND[input.mode].map(([tone, v, text]) => [<Key shape="box" tone={tone}>{v}</Key>, text]),
  fields: bitWalkFields,
  values: bitWalkValues,
  parse: parseBitWalk,
  random: (input) => randomBitWalk(input),
  hint: () => 'Small values keep the rows short.',
  delay: () => 2400,
  Stage: BitWalkStage,
};

export function BitWalkViz(props) {
  return <StepViz spec={spec} {...props} />;
}
