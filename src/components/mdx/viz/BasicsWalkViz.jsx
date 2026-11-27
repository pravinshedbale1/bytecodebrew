import { StepViz, Key } from './StepViz';
import { CmpCard } from './sideKit';
import kit from './sideKit.module.css';
import { Parts } from './DesignWalkViz';
import { KINDS } from './models/walkKit';
import { hashWalk } from './models/hashWalk';
import { pairWalk } from './models/pairWalk';
import { windowWalk } from './models/windowWalk';
import { prefixWalk } from './models/prefixWalk';
import { intervalWalk } from './models/intervalWalk';
import { searchWalk } from './models/searchWalk';
import { sortWalk } from './models/sortWalk';
import { cycleWalk } from './models/cycleWalk';
import { quadWalk } from './models/quadWalk';

/**
 * Step-throughs for the Practice thinking walkthroughs of the core patterns (hashing, two pointers,
 * sliding window, prefix sums, intervals, binary search, sorting, cyclic sort, quad trees).
 * Every model is a table of modes built with models/walkKit.js; this file only wires them to <StepViz>.
 */

const CARD = { success: 'yes', warn: 'no', accent: 'info', danger: 'bad' };

function WalkStage({ step: f, width, jump, seq }) {
  return (
    <div>
      {f.call && <div className={kit.sideRow}><CmpCard q={f.call.q} a={f.call.a} tone={CARD[f.call.tone] ?? 'info'} style={{ minWidth: 170 }} /></div>}
      <Parts parts={f.parts} width={width} jump={jump} seq={seq} />
    </div>
  );
}

function makeViz(title, model) {
  const spec = {
    title,
    examples: model.EXAMPLES,
    simulate: model.walk,
    code: (input) => model.code(input.mode),
    kinds: KINDS,
    describe: model.describe,
    rule: model.rule,
    stats: () => [],
    legend: () => [
      [<Key shape="box" tone="accent">a</Key>, 'being looked at now'],
      [<Key shape="box" tone="success">a</Key>, 'kept / a match / the answer'],
    ],
    fields: model.fields,
    values: model.values,
    parse: model.parse,
    random: (input) => model.random(input),
    hint: model.hint,
    delay: () => 2400,
    Stage: WalkStage,
  };
  return function WalkViz(props) { return <StepViz spec={spec} {...props} />; };
}

export const HashWalkViz = makeViz('Hashing, step by step', hashWalk);
export const PairWalkViz = makeViz('Two pointers, step by step', pairWalk);
export const WindowWalkViz = makeViz('The window, step by step', windowWalk);
export const PrefixWalkViz = makeViz('Prefix sums, step by step', prefixWalk);
export const IntervalWalkViz = makeViz('Intervals, step by step', intervalWalk);
export const SearchWalkViz = makeViz('Binary search, step by step', searchWalk);
export const SortWalkViz = makeViz('Sorting as a tool, step by step', sortWalk);
export const CycleWalkViz = makeViz('Cycles, step by step', cycleWalk);
export const QuadWalkViz = makeViz('Quad tree, step by step', quadWalk);
