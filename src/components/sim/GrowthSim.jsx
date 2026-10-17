import { useState } from 'react';
import { SimFrame, Choice } from './SimFrame';
import styles from './Sim.module.css';

const BUDGET = 1e8;   // simple operations per second, the rule of thumb used in the lesson
const SIZES = [[10, '10'], [20, '20'], [100, '100'], [1000, '10³'], [1e4, '10⁴'], [1e5, '10⁵'], [1e6, '10⁶'], [1e9, '10⁹']];

const logFact = (n) => { let s = 0; for (let i = 2; i <= n; i++) s += Math.log10(i); return s; };
const CLASSES = [
  ['O(1)', () => 0],
  ['O(log n)', (n) => Math.log10(Math.max(1, Math.log2(n)))],
  ['O(√n)', (n) => Math.log10(Math.sqrt(n))],
  ['O(n)', (n) => Math.log10(n)],
  ['O(n log n)', (n) => Math.log10(n * Math.log2(n))],
  ['O(n²)', (n) => 2 * Math.log10(n)],
  ['O(n³)', (n) => 3 * Math.log10(n)],
  ['O(2ⁿ)', (n) => n * Math.log10(2)],
  ['O(n!)', (n) => (n > 1e4 ? Infinity : logFact(n))],
];

/** Human-readable duration for 10^lg operations at the budget rate. */
function duration(lg) {
  if (!Number.isFinite(lg) || lg > 300) return 'effectively forever';
  const s = 10 ** (lg - Math.log10(BUDGET));
  if (s < 1e-3) return 'under a millisecond';
  if (s < 1) return `${Math.round(s * 1000)} ms`;
  if (s < 60) return `${s.toFixed(s < 10 ? 1 : 0)} s`;
  if (s < 3600) return `${Math.round(s / 60)} minutes`;
  if (s < 86400) return `${Math.round(s / 3600)} hours`;
  if (s < 3.15e7) return `${Math.round(s / 86400)} days`;
  if (s < 4.4e17) return `${(s / 3.15e7).toExponential(0).replace('e+', ' × 10^')} years`;
  return 'effectively forever';
}

const ops = (lg) => (lg < 6 ? Math.round(10 ** lg).toLocaleString() : `10^${lg.toFixed(1)}`);

/** Pick an input size and see which complexity classes still finish within about a second. */
export function GrowthSim() {
  const [n, setN] = useState(1e5);
  const rows = CLASSES.map(([name, f]) => {
    const lg = f(n);
    const seconds = Number.isFinite(lg) ? 10 ** (lg - 8) : Infinity;
    return { name, lg, seconds, tone: seconds <= 1 ? 'ok' : seconds <= 10 ? 'warn' : 'bad' };
  });
  const fitting = rows.filter((r) => r.tone === 'ok');
  const best = fitting.at(-1);
  const maxLg = 18;
  const colour = { ok: 'var(--color-success)', warn: 'var(--color-warn)', bad: '#d4554a' };

  return (
    <SimFrame
      title="How big is n? Which complexity fits?"
      hint="Pick the largest input size from the problem's constraints. With a budget of about 10⁸ simple operations per second, the bars show how long each complexity class would take. The fastest-growing class that still fits is usually what the problem is asking for."
      footer={<p className={styles.note}>For n = {SIZES.find(([v]) => v === n)[1]}, the most expensive complexity that still runs in about a second is <strong>{best.name}</strong>. Classes that grow faster will time out; slower-growing ones are a bonus.</p>}
    >
      <Choice label="n" value={n} options={SIZES} onChange={setN} />
      <div className={styles.bars}>
        {rows.map((r) => (
          <div key={r.name} className={styles.barRow} style={{ gridTemplateColumns: '84px minmax(0, 1fr) 170px' }}>
            <span className={styles.mono} style={{ fontWeight: 700 }}>{r.name}</span>
            <span className={styles.barTrack} title={`about ${ops(r.lg)} operations`}>
              <span className={styles.barFill} style={{ width: `${Math.max(2, Math.min(100, ((Number.isFinite(r.lg) ? r.lg : maxLg) / maxLg) * 100))}%`, background: colour[r.tone] }} />
              <span className={styles.ideal} style={{ left: `${(8 / maxLg) * 100}%` }} title="10⁸ operations ≈ 1 second" />
            </span>
            <span style={{ color: colour[r.tone], fontWeight: 600 }}>{duration(r.lg)}</span>
          </div>
        ))}
      </div>
      <div className={styles.legend}>
        <span>Bars are on a log scale (each step is 10× more work).</span>
        <span>The thin line marks 10⁸ operations ≈ 1 second.</span>
      </div>
    </SimFrame>
  );
}
