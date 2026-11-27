import { StepViz, Key } from './StepViz';
import { Chips } from './prims';
import { GridCells } from './GraphsViz';
import { TrieTree } from './SpecialViz';
import { Strips } from './GreedyWalkViz';
import {
  TRIE_WALK, parseTrieWalk, randomTrieWalk, trieWalk, trieWalkCode, trieWalkDescribe, trieWalkFields, trieWalkRule, trieWalkValues,
} from './models/trieWalk';

/**
 * <TrieWalkViz /> — the Tries lesson's problems, one engine: the trie (same drawing as <TrieViz>), and when
 * a problem needs them a letter grid, rows of cells and chips.
 */

function TrieWalkStage({ step: f, width, jump, seq }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
      {f.grid && <GridCells grid={f.grid} width={Math.min(width, 280)} cell={(r, c) => ({ cls: f.grid[r][c].c.filter(Boolean), label: f.grid[r][c].l, badge: f.grid[r][c].b, pop: f.grid[r][c].c.includes('cellCur'), key: f.grid[r][c].c.includes('cellCur') ? `c${seq}` : 'v' })} />}
      {f.strips && <Strips strips={f.strips} width={width} jump={jump} />}
      {f.trie && <TrieTree step={f.trie} width={width} />}
      <div style={{ alignSelf: 'stretch' }}>
        {(f.chips ?? []).map((c) => <Chips key={c.label} label={c.label} chips={c.chips} empty={c.empty ?? 'none'} />)}
      </div>
    </div>
  );
}

const LEGEND = {
  lcp: [['box', 'accent', 'f', 'on the shared path'], ['box', 'success', 'l', 'where it stops']],
  replace: [['box', 'success', 't', 'end of the first root met'], ['box', 'danger', 'x', 'the path breaks']],
  suggest: [['box', 'accent', 'o', 'the typed prefix'], ['box', 'success', 'e', 'a suggested word']],
  maxxor: [['box', 'accent', '1', 'the partner\'s bits'], ['box', 'success', '0', 'the partner reached']],
  boggle: [['box', 'accent', 'a', 'trie nodes reached from this cell'], ['box', 'success', 'h', 'a word found']],
  extra: [['box', 'success', 'leet', 'a word starting here'], ['box', 'accent', '2', 'best[i] being filled']],
};

const spec = {
  title: 'Tries, step by step',
  examples: TRIE_WALK,
  simulate: trieWalk,
  code: (input) => trieWalkCode(input.mode),
  kinds: { build: ['Build', 'note'], walk: ['Walk', 'accent'], stop: ['Stop', 'warn'], found: ['Found', 'success'], missing: ['No match', 'danger'], done: ['Answer', 'success'] },
  describe: trieWalkDescribe,
  rule: (input) => trieWalkRule[input.mode],
  stats: () => [],
  legend: (f, input) => LEGEND[input.mode].map(([shape, tone, v, text]) => [<Key shape={shape} tone={tone}>{v}</Key>, text]),
  fields: trieWalkFields,
  values: trieWalkValues,
  parse: parseTrieWalk,
  random: (input) => randomTrieWalk(input),
  hint: () => 'Keep words short so the trie fits.',
  delay: () => 2400,
  Stage: TrieWalkStage,
};

export function TrieWalkViz(props) {
  return <StepViz spec={spec} {...props} />;
}
