import { StepViz, Key } from './StepViz';
import { CmpCard } from './sideKit';
import kit from './sideKit.module.css';
import { Parts } from './DesignWalkViz';
import {
  MATH_WALK, mathWalk, mathWalkCode, mathWalkDescribe, mathWalkFields, mathWalkRule, mathWalkValues, parseMathWalk, randomMathWalk,
} from './models/mathWalk';

/**
 * <MathWalkViz /> — the Math for Interviews problems beyond gcd, the sieve and fast power: digits moved
 * one at a time, factors counted, random choices made fair, big numbers handled digit by digit.
 */

const CARD = { success: 'yes', warn: 'no', accent: 'info', danger: 'bad' };

function MathWalkStage({ step: f, width, jump, seq }) {
  return (
    <div>
      {f.call && <div className={kit.sideRow}><CmpCard q={f.call.q} a={f.call.a} tone={CARD[f.call.tone] ?? 'info'} style={{ minWidth: 170 }} /></div>}
      <Parts parts={f.parts} width={width} jump={jump} seq={seq} />
    </div>
  );
}

const spec = {
  title: 'Math, step by step',
  examples: MATH_WALK,
  simulate: mathWalk,
  code: (input) => mathWalkCode(input.mode),
  kinds: { start: ['Start', 'neutral'], move: ['Move', 'accent'], add: ['Add', 'accent'], take: ['Take', 'success'], skip: ['Skip', 'warn'], found: ['Result', 'success'], fail: ['Stop', 'danger'], done: ['Answer', 'success'] },
  describe: mathWalkDescribe,
  rule: (input) => mathWalkRule[input.mode],
  stats: () => [],
  legend: () => [[<Key shape="box" tone="accent">3</Key>, 'this step'], [<Key shape="box" tone="success">1</Key>, 'settled / the result']],
  fields: mathWalkFields,
  values: mathWalkValues,
  parse: parseMathWalk,
  random: (input) => randomMathWalk(input),
  hint: () => 'Small inputs keep every step readable.',
  delay: () => 2300,
  Stage: MathWalkStage,
};

export function MathWalkViz(props) {
  return <StepViz spec={spec} {...props} />;
}
