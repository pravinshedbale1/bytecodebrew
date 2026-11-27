import { StepViz, Key } from './StepViz';
import { ArrayStrip, Chips, RowLabel, Stage, pitchFor, stripBelow } from './prims';
import { CmpCard, Lane } from './sideKit';
import kit from './sideKit.module.css';
import {
  GREEDY_WALK, greedyWalk, greedyWalkCode, greedyWalkDescribe, greedyWalkFields, greedyWalkRule, greedyWalkValues, parseGreedyWalk, randomGreedyWalk,
} from './models/greedyWalk';

/**
 * <GreedyWalkViz /> — the Greedy lesson's problems, one engine: labelled rows of cells with pointer tags,
 * bands and small notes underneath, plus queues, counters and the comparison each step makes.
 */

const CARD = { success: 'yes', danger: 'bad', warn: 'no', accent: 'info' };
const H = 42;

/** Labelled rows of cells (see models/greedyWalk.js for the strip shape); also used by <TrieWalkViz>. */
export function Strips({ strips, width, jump }) {
  const n = Math.max(1, ...strips.map((s) => s.items.length));
  const pitch = pitchFor(width - 8, n, 22, 60);   // cells shrink to 22px before a long row overflows a phone
  const W = Math.max(n * pitch, 180);
  let y = 0;
  const placed = strips.map((s) => {
    const hasSub = Object.keys(s.sub).length > 0;
    const start = y;
    const top = y + 18 + (s.bands.some((b) => b.label) ? 18 : s.bands.length ? 8 : 2);   // band labels sit above the band
    y = top + stripBelow({ h: H, index: s.index !== false, sub: hasSub }) + 8;
    return { s, top, start, hasSub };
  });
  return (
    <Stage width={W} height={y} jump={jump} label={strips.map((s) => `${s.label}: ${s.items.join(' ')}`).join('; ')}>
        {placed.map(({ s, top, start }, r) => (
          <div key={`${r}-${s.label}`}>
            <RowLabel x={0} y={start}>{s.label}</RowLabel>
            <ArrayStrip
              items={s.items} y={top} pitch={pitch} h={H}
              cls={(k) => s.cls[k] ?? ''}
              tags={s.tags}
              bands={s.bands}
              index={s.index !== false}
              indexLabel={Array.isArray(s.index) ? (k) => s.index[k] : undefined}
              sub={(k) => s.sub[k]}
            />
          </div>
        ))}
    </Stage>
  );
}

function GreedyWalkStage({ step: f, width, jump }) {
  return (
    <div>
      <Strips strips={f.strips} width={width} jump={jump} />
      {(f.lanes || f.card) && (
        <div className={kit.sideRow}>
          {(f.lanes ?? []).map((l) => <Lane key={l.label} label={l.label} front="next" back="" items={l.items} empty="empty" />)}
          {f.card && <CmpCard q={f.card.q} a={f.card.a} tone={CARD[f.card.tone] ?? 'info'} style={{ minWidth: 150 }} />}
        </div>
      )}
      {(f.chips ?? []).map((c) => <Chips key={c.label} label={c.label} chips={c.chips} empty={c.empty ?? 'none'} />)}
    </div>
  );
}

const LEGEND = {
  cookies: [['box', 'success', '2', 'matched'], ['box', 'muted', '1', 'too small, thrown away']],
  stock: [['pill', 'accent', 'min', 'lowest price so far'], ['box', 'success', '+4', 'profit if sold that day']],
  boats: [['pill', 'accent', 'light', 'lightest left'], ['pill', 'warn', 'heavy', 'heaviest left']],
  twocity: [['box', 'success', '10', 'the city each person flies to'], ['box', 'accent', 'A', 'the n most A-saving']],
  candy: [['box', 'accent', '2', 'this child'], ['box', 'warn', '1', 'the neighbour compared']],
  lemonade: [['box', 'accent', '$10', 'this customer'], ['pill', 'success', '$5 × 2', 'bills in the till']],
  triplets: [['box', 'success', '7', 'matches the target'], ['box', 'danger', '8', 'overshoots: triplet skipped']],
  wildcard: [['box', 'neutral', '0–2', 'fewest–most "(" open after this letter']],
  straights: [['box', 'accent', '1..3', 'the group taken'], ['box', 'neutral', '× 2', 'cards left of that value']],
  senate: [['pill', 'accent', 'acts', 'acts first'], ['pill', 'danger', 'banned', 'loses all rights']],
  jump7: [['box', 'success', '0', 'reachable'], ['box', 'accent', '·', 'window that can jump here']],
  orderly: [['pill', 'warn', 'move', 'the letter moved to the end'], ['pill', 'muted', 'may move', 'one of the first k']],
};

const spec = {
  title: 'Greedy, step by step',
  examples: GREEDY_WALK,
  simulate: greedyWalk,
  code: (input) => greedyWalkCode(input.mode),
  kinds: {
    start: ['Start', 'neutral'], sort: ['Sort', 'note'], match: ['Match', 'success'], skip: ['Skip', 'warn'], better: ['New best', 'success'], low: ['New low', 'accent'], scan: ['Check', 'accent'],
    pair: ['Pair', 'success'], alone: ['Alone', 'warn'], take: ['Take', 'success'], raise: ['Raise', 'accent'], keep: ['Keep', 'neutral'], fail: ['Fail', 'danger'], use: ['Use', 'success'],
    open: ['Open', 'accent'], close: ['Close', 'accent'], star: ['Star', 'note'], duel: ['Ban', 'accent'], move: ['Move', 'accent'], done: ['Answer', 'success'],
  },
  describe: greedyWalkDescribe,
  rule: (input) => greedyWalkRule[input.mode],
  stats: () => [],
  legend: (f, input) => (input.mode === 'orderly' && input.k === 1 ? [['box', 'muted', 'cb', 'letters moved to the end so far']] : LEGEND[input.mode]).map(([shape, tone, v, text]) => [<Key shape={shape} tone={tone}>{v}</Key>, text]),
  fields: greedyWalkFields,
  values: greedyWalkValues,
  parse: parseGreedyWalk,
  random: (input) => randomGreedyWalk(input),
  hint: () => 'Small inputs keep every cell readable.',
  delay: () => 2200,
  Stage: GreedyWalkStage,
};

export function GreedyWalkViz(props) {
  return <StepViz spec={spec} {...props} />;
}
