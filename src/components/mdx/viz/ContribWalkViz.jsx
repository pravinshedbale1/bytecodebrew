import { StepViz, Key } from './StepViz';
import { Chips } from './prims';
import { Strips } from './GreedyWalkViz';
import {
  CONTRIB_WALK, contribWalk, contribWalkCode, contribWalkDescribe, contribWalkFields, contribWalkRule, contribWalkValues, parseContribWalk, randomContribWalk,
} from './models/contribWalk';

/**
 * <ContribWalkViz /> — contribution-counting problems the other Contribution step-throughs don't cover:
 * rows of cells (the same strips as <GreedyWalkViz>) and a running total.
 */

function ContribWalkStage({ step: f, width, jump }) {
  return (
    <div>
      <Strips strips={f.strips} width={width} jump={jump} />
      {(f.chips ?? []).map((c) => <Chips key={c.label} label={c.label} chips={c.chips} empty="none" />)}
    </div>
  );
}

const LEGEND = {
  zeros: [['box', 'accent', '0', 'the run of zeros ending here'], ['box', 'success', '+2', 'subarrays that end here']],
  vowels: [['box', 'accent', 'a', 'the possible starts'], ['box', 'success', '+3', 'substrings containing this vowel']],
  pairings: [['box', 'success', '3', 'survives (odd count)'], ['box', 'muted', '1', 'cancels (even count)']],
  groups: [['box', 'accent', '1', 'the same value'], ['box', 'success', '5', 'arr[i] found']],
  maxk: [['box', 'accent', '3', 'a maximum'], ['box', 'success', '·', 'valid starts']],
  wizards: [['box', 'accent', '1', 'the span where it is weakest'], ['box', 'neutral', '×4', 'groups containing that wizard']],
};

const spec = {
  title: 'Count each element\'s share',
  examples: CONTRIB_WALK,
  simulate: contribWalk,
  code: (input) => contribWalkCode(input.mode),
  kinds: { start: ['Start', 'neutral'], add: ['Add', 'accent'], skip: ['Nothing', 'neutral'], take: ['Keep', 'success'], done: ['Answer', 'success'] },
  describe: contribWalkDescribe,
  rule: (input) => contribWalkRule[input.mode],
  stats: () => [],
  legend: (f, input) => LEGEND[input.mode].map(([shape, tone, v, text]) => [<Key shape={shape} tone={tone}>{v}</Key>, text]),
  fields: contribWalkFields,
  values: contribWalkValues,
  parse: parseContribWalk,
  random: (input) => randomContribWalk(input),
  hint: () => 'Short arrays keep every cell readable.',
  delay: () => 2400,
  Stage: ContribWalkStage,
};

export function ContribWalkViz(props) {
  return <StepViz spec={spec} {...props} />;
}
