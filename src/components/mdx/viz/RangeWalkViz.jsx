import { StepViz, Key } from './StepViz';
import { CmpCard } from './sideKit';
import kit from './sideKit.module.css';
import { Parts } from './DesignWalkViz';
import {
  RANGE_WALK, rangeWalk, rangeWalkCode, rangeWalkDescribe, rangeWalkFields, rangeWalkRule, rangeWalkValues, parseRangeWalk, randomRangeWalk,
} from './models/rangeWalk';

/**
 * <RangeWalkViz /> — Range Queries problems beyond the Fenwick / segment tree basics: a difference
 * array with a capacity check, counts by value (Fenwick in practice), merge-sort pair counting, a skyline.
 */

const CARD = { success: 'yes', warn: 'no', accent: 'info', danger: 'bad' };

function RangeWalkStage({ step: f, width, jump, seq }) {
  return (
    <div>
      {f.call && <div className={kit.sideRow}><CmpCard q={f.call.q} a={f.call.a} tone={CARD[f.call.tone] ?? 'info'} style={{ minWidth: 170 }} /></div>}
      <Parts parts={f.parts} width={width} jump={jump} seq={seq} />
    </div>
  );
}

const spec = {
  title: 'Range queries, step by step',
  examples: RANGE_WALK,
  simulate: rangeWalk,
  code: (input) => rangeWalkCode(input.mode),
  kinds: { start: ['Start', 'neutral'], move: ['Move', 'accent'], add: ['Add', 'accent'], take: ['Take', 'success'], skip: ['Skip', 'warn'], found: ['Result', 'success'], fail: ['Stop', 'danger'], done: ['Answer', 'success'] },
  describe: rangeWalkDescribe,
  rule: (input) => rangeWalkRule[input.mode],
  stats: () => [],
  legend: () => [[<Key shape="box" tone="accent">3</Key>, 'the range asked about / this element'], [<Key shape="box" tone="success">1</Key>, 'answers so far']],
  fields: rangeWalkFields,
  values: rangeWalkValues,
  parse: parseRangeWalk,
  random: (input) => randomRangeWalk(input),
  hint: () => 'Small inputs keep every step readable.',
  delay: () => 2300,
  Stage: RangeWalkStage,
};

export function RangeWalkViz(props) {
  return <StepViz spec={spec} {...props} />;
}
