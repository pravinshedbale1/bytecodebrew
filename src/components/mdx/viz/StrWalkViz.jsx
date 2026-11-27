import { StepViz, Key } from './StepViz';
import { CmpCard } from './sideKit';
import kit from './sideKit.module.css';
import { Parts } from './DesignWalkViz';
import {
  STR_WALK, strWalk, strWalkCode, strWalkDescribe, strWalkFields, strWalkRule, strWalkValues, parseStrWalk, randomStrWalk,
} from './models/strWalk';

/**
 * <StrWalkViz /> — String Matching problems beyond the plain KMP table and search: shortest palindrome
 * (a KMP table on s + "#" + reverse(s)), repeated string match, repeated windows, longest duplicate substring.
 */

const CARD = { success: 'yes', warn: 'no', accent: 'info', danger: 'bad' };

function StrWalkStage({ step: f, width, jump, seq }) {
  return (
    <div>
      {f.call && <div className={kit.sideRow}><CmpCard q={f.call.q} a={f.call.a} tone={CARD[f.call.tone] ?? 'info'} style={{ minWidth: 170 }} /></div>}
      <Parts parts={f.parts} width={width} jump={jump} seq={seq} />
    </div>
  );
}

const spec = {
  title: 'String matching, step by step',
  examples: STR_WALK,
  simulate: strWalk,
  code: (input) => strWalkCode(input.mode),
  kinds: { start: ['Start', 'neutral'], grow: ['Grow', 'accent'], fall: ['Fall back', 'warn'], add: ['New', 'accent'], skip: ['No', 'neutral'], found: ['Found', 'success'], fail: ['Stop', 'danger'], done: ['Answer', 'success'] },
  describe: strWalkDescribe,
  rule: (input) => strWalkRule[input.mode],
  stats: () => [],
  legend: () => [[<Key shape="box" tone="accent">a</Key>, 'the current window / letter'], [<Key shape="box" tone="success">a</Key>, 'a match / a border']],
  fields: strWalkFields,
  values: strWalkValues,
  parse: parseStrWalk,
  random: (input) => randomStrWalk(input),
  hint: () => 'Small inputs keep every step readable.',
  delay: () => 2300,
  Stage: StrWalkStage,
};

export function StrWalkViz(props) {
  return <StepViz spec={spec} {...props} />;
}
