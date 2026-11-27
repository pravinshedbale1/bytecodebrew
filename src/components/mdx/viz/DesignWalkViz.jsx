import { StepViz, Key } from './StepViz';
import { Chips } from './prims';
import { CmpCard, Lane, Pile } from './sideKit';
import kit from './sideKit.module.css';
import { GridCells } from './GraphsViz';
import { Strips } from './GreedyWalkViz';
import {
  DESIGN_WALK, designWalk, designWalkCode, designWalkDescribe, designWalkFields, designWalkValues, parseDesignWalk, randomDesignWalk,
} from './models/designWalk';

/**
 * <DesignWalkViz /> — the Designing Data Structures problems, one engine. Each step is one call: a card
 * with the call and its return value, and the structure's inside drawn as it really is (stacks as piles,
 * queues as lanes, maps as chips, arrays as cells, points on a grid).
 */

const CARD = { success: 'yes', warn: 'no', accent: 'info', danger: 'bad' };

/** The parts renderer (piles, lanes, chips, strips, grids); also used by <MathWalkViz>. */
export function Parts({ parts, width, jump, seq }) {
  const out = [];
  let row = [];
  const flush = () => { if (row.length) { out.push(<div key={`r${out.length}`} className={kit.sideRow}>{row}</div>); row = []; } };
  parts.forEach((p, k) => {
    if (p.type === 'pile') row.push(<Pile key={k} label={p.label} items={p.items} empty={p.empty} seq={seq} />);
    else if (p.type === 'lane') row.push(<Lane key={k} label={p.label} items={p.items} front={p.front} back={p.back} empty={p.empty} seq={seq} />);
    else {
      flush();
      if (p.type === 'chips') out.push(<Chips key={k} label={p.label} chips={p.chips} empty={p.empty} seq={seq} />);
      else if (p.type === 'strip') out.push(<Strips key={k} strips={[p]} width={width} jump={jump} />);
      else if (p.type === 'grid') out.push(<div key={k} style={{ display: 'grid', justifyItems: 'center', gap: 4 }}><small style={{ color: 'var(--color-text-muted)' }}>{p.label}</small><GridCells grid={p.cells} width={Math.min(width, 300)} min={26} cell={(r, c) => ({ cls: p.cells[r][c].c.filter(Boolean), label: p.cells[r][c].l })} /></div>);
    }
  });
  flush();
  return out;
}

function DesignWalkStage({ step: f, width, jump, seq }) {
  return (
    <div>
      {f.call && <div className={kit.sideRow}><CmpCard q={f.call.q} a={f.call.a} tone={CARD[f.call.tone] ?? 'info'} style={{ minWidth: 170 }} /></div>}
      <Parts parts={f.parts} width={width} jump={jump} seq={seq} />
    </div>
  );
}

const spec = {
  title: 'A design, one call at a time',
  examples: DESIGN_WALK,
  simulate: designWalk,
  code: (input) => designWalkCode(input.mode),
  kinds: {
    start: ['Start', 'neutral'], push: ['Add', 'accent'], pop: ['Remove', 'warn'], read: ['Read', 'success'], write: ['Write', 'accent'], move: ['Move', 'note'],
    evict: ['Evict', 'danger'], take: ['Take', 'success'], skip: ['Nothing', 'neutral'], fail: ['Stop', 'danger'], add: ['Add', 'accent'], done: ['Done', 'success'],
  },
  describe: designWalkDescribe,
  rule: () => 'each call touches only what it needs',
  stats: () => [],
  legend: () => [[<Key shape="pill" tone="accent">x</Key>, 'touched by this call'], [<Key shape="pill" tone="success">x</Key>, 'the answer / a match']],
  fields: designWalkFields,
  values: designWalkValues,
  parse: parseDesignWalk,
  random: (input) => randomDesignWalk(input),
  hint: () => 'Up to 10 calls, separated by commas, like: push 1, push 2, pop',
  delay: () => 2600,
  Stage: DesignWalkStage,
};

export function DesignWalkViz(props) {
  return <StepViz spec={spec} {...props} />;
}
