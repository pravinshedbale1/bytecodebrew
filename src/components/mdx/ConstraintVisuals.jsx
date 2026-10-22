import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import styles from './ConstraintVisuals.module.css';

/**
 * Visuals for the "Reading Constraints" lesson. All four are free (like the DSA step-throughs).
 *
 *   <ConstraintDecoder title="…" problem="…" example="…" verdict="…"
 *     lines={[{ code: '1 <= n <= 10^5', tag: 'speed', plain: 'n is at most 100,000.', so: '…', derived: false }]} />
 *   <ComplexityRuler />
 *   <MagnitudeBars title="…" max={19} limits={[{ at: 2147483647, label: 'int max', short: 'int', tone: 'warn' }]}
 *                  items={[{ label: 'sum of 10^5 values', value: 1e14, note: '…' }]} />
 *   <ModClock m={7} />
 */

const TAGS = {
  speed: 'How fast',
  type: 'int or long?',
  trick: 'Technique',
  edge: 'Tricky input',
  memory: 'Memory',
};

const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const sup = (n) => String(n).split('').map((c) => SUP[c] ?? c).join('');

/** 12 → "12", 46340 → "46,340", 4.47e6 → "4.5 × 10⁶", 1e18 → "10¹⁸". */
export function fmt(n) {
  if (!Number.isFinite(n)) return 'any n';
  if (n < 1e5) return Math.floor(n).toLocaleString('en-US');
  const e = Math.floor(Math.log10(n));
  const m = n / 10 ** e;
  const mm = m.toFixed(1).replace(/\.0$/, '');
  return mm === '1' ? `10${sup(e)}` : mm === '10' ? `10${sup(e + 1)}` : `${mm} × 10${sup(e)}`;
}

function Frame({ title, badge, hint, children, footer }) {
  return (
    <section className={styles.frame} aria-label={title}>
      <header className={styles.head}>
        <span className={styles.title}><SlidersHorizontal size={14} aria-hidden="true" /> {title}</span>
        {badge && <span className={styles.badge}>{badge}</span>}
      </header>
      {hint && <p className={styles.hint}>{hint}</p>}
      <div className={styles.body}>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </section>
  );
}

function Choice({ label, value, options, onChange }) {
  return (
    <div className={styles.choice} role="radiogroup" aria-label={label}>
      <span className={styles.choiceLabel}>{label}</span>
      {options.map(([v, text]) => (
        <button key={String(v)} type="button" role="radio" aria-checked={value === v} className={styles.opt} onClick={() => onChange(v)}>
          {text}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- 1. a constraint block, line by line

/**
 * A constraint block where each line opens to say what it means in plain words and what it tells you
 * to do. The first line starts open as a worked example; the verdict appears once every line is open.
 */
export function ConstraintDecoder({ title = 'Decode the constraints', problem, example, lines, verdict }) {
  const [open, setOpen] = useState(() => new Set([0]));
  const all = open.size === lines.length;
  const toggle = (i) => setOpen((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; });
  return (
    <Frame
      title={title}
      badge="Tap each line"
      footer={verdict && (all
        ? <p className={styles.verdict}><strong>Putting it together:</strong> {verdict}</p>
        : <p className={styles.muted}>Open every line ({open.size} of {lines.length} so far) and the plan for the whole problem appears here.</p>)}
    >
      {problem && (
        <div className={styles.problem}>
          <p><strong>The problem.</strong> {problem}</p>
          {example && <p className={styles.example}><strong>Example.</strong> {example}</p>}
        </div>
      )}
      <div className={styles.decoderTop}>
        <p className={styles.how}>These lines are the problem's constraints. Tap one to see what it means and what it tells you. The first is opened for you. Try to guess each one before you tap it.</p>
        <button type="button" className={styles.btn} onClick={() => setOpen(all ? new Set([0]) : new Set(lines.map((_, i) => i)))}>
          {all ? 'Close all' : 'Show all'}
        </button>
      </div>
      <ol className={styles.lines}>
        {lines.map((l, i) => (
          <li key={i} className={`${open.has(i) ? styles.lineOpen : ''} ${l.derived ? styles.lineDerived : ''}`}>
            <button type="button" className={styles.lineBtn} aria-expanded={open.has(i)} onClick={() => toggle(i)}>
              <span className={styles.lineMain}>
                {l.derived && <span className={styles.derivedNote}>Not written in the problem: we work it out</span>}
                <code className={styles.lineCode}>{l.code}</code>
              </span>
              <span className={styles.lineSide}>
                <span className={`${styles.tag} ${styles[`tag_${l.tag}`] ?? ''}`}>{TAGS[l.tag] ?? l.tag}</span>
                <span className={styles.chev} aria-hidden="true">{open.has(i) ? '▴' : '▾'}</span>
              </span>
            </button>
            {open.has(i) && (
              <dl className={styles.answer}>
                <dt>In plain words</dt>
                <dd>{l.plain}</dd>
                <dt>So…</dt>
                <dd>{l.so}</dd>
              </dl>
            )}
          </li>
        ))}
      </ol>
    </Frame>
  );
}

// ---------------------------------------------------------------- 2. which complexities fit this n?

const logFact = (n) => { if (n > 1000) return Infinity; let s = 0; for (let i = 2; i <= n; i++) s += Math.log10(i); return s; };
const lg2 = (n) => Math.max(1, Math.log2(n));

/** log10 of the work for each class, the largest n that fits is found by search. Ordered slowest first. */
const CLASSES = [
  { name: 'O(n!)', f: (n) => logFact(Math.round(n)), int: true, uses: 'every ordering: permutations, backtracking' },
  { name: 'O(2ⁿ · n)', f: (n) => n * Math.log10(2) + Math.log10(n), int: true, uses: 'bitmask DP over subsets (travelling salesman, assignment)' },
  { name: 'O(2ⁿ)', f: (n) => n * Math.log10(2), int: true, uses: 'every subset: pick / skip recursion, bitmask loop' },
  { name: 'O(n⁴)', f: (n) => 4 * Math.log10(n), uses: 'four nested loops' },
  { name: 'O(n³)', f: (n) => 3 * Math.log10(n), uses: 'interval DP, Floyd–Warshall, three nested loops' },
  { name: 'O(n²)', f: (n) => 2 * Math.log10(n), uses: 'every pair, 2D DP over two strings' },
  { name: 'O(n log n)', f: (n) => Math.log10(n) + Math.log10(lg2(n)), uses: 'sorting, heaps, TreeMap, binary search per element' },
  { name: 'O(n)', f: (n) => Math.log10(n), uses: 'one pass: hash map, two pointers, sliding window, prefix sums' },
  { name: 'O(√n)', f: (n) => 0.5 * Math.log10(n), uses: 'trial division up to √n, divisor pairs' },
  { name: 'O(log n)', f: () => -Infinity, uses: 'binary search on the answer, fast power, maths' },
  { name: 'O(1)', f: () => -Infinity, uses: 'a formula' },
];

const AXIS = 18;   // the n axis runs from 10⁰ to 10¹⁸

function maxN(c, budgetLg) {
  if (c.f(1e18) <= budgetLg) return Infinity;
  if (c.int) { let n = 1; while (c.f(n + 1) <= budgetLg) n++; return n; }
  let lo = 0, hi = 18;                                   // search on log10 n
  for (let k = 0; k < 60; k++) { const mid = (lo + hi) / 2; if (c.f(10 ** mid) <= budgetLg) lo = mid; else hi = mid; }
  return 10 ** lo;
}

const SIZES = [[10, '10'], [20, '20'], [100, '100'], [400, '400'], [5000, '5,000'], [1e5, '10⁵'], [1e6, '10⁶'], [1e7, '10⁷'], [1e9, '10⁹'], [1e18, '10¹⁸']];
const BUDGETS = [[8, '10⁸ (Java, C++)'], [7, '10⁷ (Python, or heavy steps)']];

/** Pick the largest n from the problem: the bars show how far each complexity reaches within the budget. */
export function ComplexityRuler() {
  const [n, setN] = useState(1e5);
  const [budget, setBudget] = useState(8);
  const rows = CLASSES.map((c) => ({ ...c, max: maxN(c, budget) }));
  const fits = (r) => n <= r.max;
  const best = rows.find(fits);
  const x = (v) => `${(Math.min(AXIS, Math.max(0, Math.log10(v))) / AXIS) * 100}%`;
  const sizeLabel = SIZES.find(([v]) => v === n)[1];
  return (
    <Frame
      title="How far does each complexity reach?"
      badge="Interactive"
      hint="Each bar shows the range of n a complexity can handle in about a second. Pick the largest n from the problem's constraints: the line shows which bars still reach it. The slowest one that reaches it is usually what the problem setter intended."
      footer={<p>For n = <strong>{sizeLabel}</strong>, the slowest complexity that still fits is <strong className={styles.mono}>{best.name}</strong>, which points to {best.uses}. Anything slower times out; anything faster also passes.</p>}
    >
      <div className={styles.controls}>
        <Choice label="Largest n" value={n} options={SIZES} onChange={setN} />
        <Choice label="Budget per second" value={budget} options={BUDGETS} onChange={setBudget} />
      </div>
      <div className={styles.ruler} role="table" aria-label="Largest n each complexity handles">
        {rows.map((r) => (
          <div key={r.name} role="row" className={`${styles.rulerRow} ${fits(r) ? styles.fit : styles.miss} ${r === best ? styles.best : ''}`}>
            <span role="cell" className={styles.cls}>{r.name}</span>
            <span role="cell" className={styles.track}>
              <span className={styles.reach} style={{ width: x(r.max) }} />
              <span className={styles.cursor} style={{ left: x(n) }} aria-hidden="true" />
            </span>
            <span role="cell" className={styles.reachLabel}>{Number.isFinite(r.max) ? `n ≤ ${fmt(r.max)}` : 'any n'}</span>
          </div>
        ))}
        <div className={styles.axis} aria-hidden="true">
          <span />
          <span className={styles.ticks}>
            {[0, 3, 6, 9, 12, 15, 18].map((e) => <span key={e} style={{ left: `${(e / AXIS) * 100}%` }}>10{sup(e)}</span>)}
          </span>
          <span />
        </div>
      </div>
      <p className={styles.legendLine}>
        The n axis is logarithmic: each tick is 1,000 times bigger than the last. Problem setters usually pick n just under a bar's end, so the intended solution fits and the next slower one does not.
      </p>
    </Frame>
  );
}

// ---------------------------------------------------------------- 3. magnitudes against limits

/**
 * Horizontal log-scale bars, one per quantity, with vertical limit lines (int max, 256 MB…).
 * An item takes the tone of the highest limit it passes ('success' when it passes none).
 */
export function MagnitudeBars({ title, hint, max = 19, min = 0, limits = [], items, footer }) {
  const x = (v) => `${((Math.min(max, Math.max(min, Math.log10(v))) - min) / (max - min)) * 100}%`;
  const toneOf = (v) => limits.filter((l) => v > l.at).map((l) => l.tone).at(-1) ?? 'success';
  return (
    <Frame title={title} hint={hint} footer={footer}>
      <div className={styles.mag}>
        <div className={styles.limitHead} aria-hidden="true">
          {limits.map((l) => <span key={l.label} style={{ left: x(l.at) }}>{l.short ?? l.label}</span>)}
        </div>
        {items.map((it) => {
          const tone = toneOf(it.value);
          return (
            <div key={it.label} className={styles.magRow}>
              <div className={styles.magHead}>
                <span className={styles.magLabel}>{it.label}</span>
                <span className={`${styles.magValue} ${styles[`t_${tone}`]}`}>{it.display ?? fmt(it.value)}</span>
              </div>
              <div className={styles.magTrack}>
                <span className={`${styles.magFill} ${styles[`f_${tone}`]}`} style={{ width: x(it.value) }} />
                {limits.map((l) => <span key={l.label} className={styles.limit} style={{ left: x(l.at) }} />)}
              </div>
              {it.note && <p className={styles.magNote}>{it.note}</p>}
            </div>
          );
        })}
      </div>
      <ul className={styles.limitKey}>
        {limits.map((l) => <li key={l.label}><span className={styles.limitSwatch} aria-hidden="true" />{l.label}</li>)}
        <li className={styles.muted}>Log scale: each step to the right is 10 times bigger.</li>
      </ul>
    </Frame>
  );
}

// ---------------------------------------------------------------- 4. modulo as a clock

const PRESETS = [-10, -3, -1, 0, 3, 7, 10, 25];

/** Walk a steps around a clock with m positions. Shows Java's % next to Math.floorMod for negatives. */
export function ModClock({ m = 7 }) {
  const [a, setA] = useState(10);
  const pos = ((a % m) + m) % m;
  const javaRem = a % m;
  const laps = Math.floor(a / m);
  const R = 78, C = 100;
  const pt = (i, r = R) => [C + r * Math.sin((2 * Math.PI * i) / m), C - r * Math.cos((2 * Math.PI * i) / m)];
  const [hx, hy] = pt(pos, R - 22);
  return (
    <Frame
      title={`Modulo is a clock with ${m} positions`}
      badge="Interactive"
      hint={`Start at 0 and walk a steps (backwards when a is negative). Where you stop is a mod ${m}. Every value, however big, lands on one of only ${m} positions, which is why taking a modulo keeps numbers small.`}
      footer={
        <p>
          <span className={styles.mono}>{a} = {laps} × {m} + {pos}</span>: {laps === 0 ? 'no full laps' : `${Math.abs(laps)} full ${Math.abs(laps) === 1 ? 'lap' : 'laps'}${laps < 0 ? ' backwards' : ''}`}, then {pos} more, so {a} lands on <strong>{pos}</strong>.{' '}
          <span className={styles.mono}>Math.floorMod({a}, {m}) = {pos}</span>, but Java's <span className={styles.mono}>{a} % {m} = {javaRem}</span>
          {javaRem !== pos ? <> — <strong className={styles.t_danger}>negative, so it is not a position on the clock</strong>. Add {m} and take % {m} again, or use floorMod.</> : <>, the same.</>}
        </p>
      }
    >
      <div className={styles.clockWrap}>
        <svg viewBox="0 0 200 200" className={styles.clock} role="img" aria-label={`${a} mod ${m} is ${pos}`}>
          <circle cx={C} cy={C} r={R} className={styles.clockRing} />
          <line x1={C} y1={C} x2={hx} y2={hy} className={styles.clockHand} />
          <circle cx={C} cy={C} r={4} className={styles.clockHub} />
          {Array.from({ length: m }, (_, i) => {
            const [px, py] = pt(i);
            return (
              <g key={i}>
                <circle cx={px} cy={py} r={13} className={i === pos ? styles.clockOn : styles.clockOff} />
                <text x={px} y={py} dy="0.35em" textAnchor="middle" className={i === pos ? styles.clockOnText : styles.clockText}>{i}</text>
              </g>
            );
          })}
        </svg>
        <div className={styles.clockControls}>
          <div className={styles.stepper}>
            <button type="button" className={styles.btn} onClick={() => setA(a - 1)} aria-label="a minus 1">−1</button>
            <span className={styles.aValue}>a = {a}</span>
            <button type="button" className={styles.btn} onClick={() => setA(a + 1)} aria-label="a plus 1">+1</button>
          </div>
          <Choice label="Try" value={a} options={PRESETS.map((p) => [p, String(p)])} onChange={setA} />
          <p className={styles.muted}>The int type works the same way with 2³² positions: one step past 2,147,483,647 lands on −2,147,483,648. That is overflow.</p>
        </div>
      </div>
    </Frame>
  );
}
