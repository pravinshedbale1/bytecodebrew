import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { Mountain, Flame, Target, Play, Flag, ArrowRight, Minus, Plus, Lightbulb, Trophy, Building2 } from 'lucide-react';
import { PremiumPage } from '../components/access/PremiumPage';
import { PageLayout, RailCard } from '../components/layout/PageLayout';
import { useClimb, startAttempt, finishAttempt, setGoal } from '../lib/climb/store';
import { readMode, writeMode, useStartNext } from '../components/climb/ClimbBanner';
import { catalog, lessonPath } from '../lib/coach/catalog';
import { PATTERNS } from '../lib/coach/patterns';
import { tierOf, TIERS, STYLE_TARGET, GENERAL_TARGET, TIME_LIMIT, ABANDON_HOURS, START_RATING } from '../lib/climb/model';
import ui from '../components/common/ui.module.css';
import page from './Page.module.css';
import styles from './ClimbPage.module.css';

const nameOf = (p) => catalog.titles[p] ?? PATTERNS[p]?.name ?? p;
const titleOf = (slug) => catalog.problems[slug]?.title ?? slug;
const mmss = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const signed = (n) => `${n >= 0 ? '+' : '−'}${Math.abs(n)}`;
const outcome = (h, e) => (e?.peek ? 'Opened the solution' : e?.gave ? 'Gave up' : !h.ok ? 'Not solved' : h.score >= 0.9 ? 'Clean solve' : 'Solved');

/** /climb — rated problem solving: a problem at your level, the clock, and how your rating moves. */
export function ClimbPage() {
  return (
    <PremiumPage
      eyebrow="Climb"
      title="Climb"
      lead="Rated problem solving: every problem is picked just above your level, timed, and moves your rating. The fastest way to know you're ready."
      feature="Climb"
    >
      <ClimbInner />
    </PremiumPage>
  );
}

function ClimbInner() {
  const climb = useClimb();
  const { model, active, goal, todayCount, studied, company } = climb;
  const [mode, setModeState] = useState(() => readMode());
  const setMode = (m) => { setModeState(m); writeMode(m); };
  const startNext = useStartNext();
  const preview = useMemo(() => (active ? null : climb.next(mode)), [climb, mode, active]);
  const last = model.history.at(-1);
  const target = company ? STYLE_TARGET[company.style] ?? GENERAL_TARGET : GENERAL_TARGET;
  const tier = tierOf(model.rating);
  const toward = Math.round(Math.min(100, Math.max(4, ((model.rating - START_RATING) / (target - START_RATING)) * 100)));
  const nextTier = TIERS.find((t) => t.min > model.rating);
  const eventsBySlug = useMemo(() => Object.fromEntries(climb.state.events.map((e) => [e.s, e])), [climb.state.events]);
  // the patterns the rating averages over (rated or not), then any others the learner has rated
  const row = (p) => ({ p, r: model.patterns[p]?.r ?? START_RATING, n: model.patterns[p]?.n ?? 0, peak: model.patterns[p]?.peak ?? null });
  const counted = useMemo(() => model.set.map(row).sort((a, b) => a.r - b.r || b.n - a.n), [model]); // eslint-disable-line react-hooks/exhaustive-deps
  const others = useMemo(() => catalog.order.filter((p) => model.patterns[p] && !model.set.includes(p)).map(row).sort((a, b) => a.r - b.r), [model]); // eslint-disable-line react-hooks/exhaustive-deps
  const setLabel = company ? `the core patterns and ${company.name}'s focus` : 'the core interview patterns';

  const rail = (
    <>
      <RailCard title="Today" icon={<Target size={14} aria-hidden="true" />}>
        <p className={styles.goalLine}><strong>{todayCount}</strong> of {goal} rated problem{goal === 1 ? '' : 's'}</p>
        <div className={styles.goalDots} aria-hidden="true">
          {Array.from({ length: Math.max(goal, todayCount) }, (_, i) => <span key={i} className={i < todayCount ? styles.goalOn : ''} />)}
        </div>
        <div className={styles.goalSet}>
          <span className={styles.goalLabel}>Daily goal</span>
          <button type="button" className={styles.step} onClick={() => setGoal(goal - 1)} disabled={goal <= 1} aria-label="Lower the daily goal"><Minus size={12} /></button>
          <span className={styles.goalNum}>{goal}</span>
          <button type="button" className={styles.step} onClick={() => setGoal(goal + 1)} disabled={goal >= 10} aria-label="Raise the daily goal"><Plus size={12} /></button>
        </div>
      </RailCard>
      <RailCard title="Runs" icon={<Flame size={14} aria-hidden="true" />}>
        <p className={styles.goalLine}><strong>{model.run}</strong> clean solve{model.run === 1 ? '' : 's'} in a row</p>
        <p className={ui.help}>Best run {model.bestRun} · peak rating {model.peak}</p>
      </RailCard>
      <RailCard title="How it works" icon={<Lightbulb size={14} aria-hidden="true" />}>
        <ul className={styles.how}>
          <li>Each problem has a rating, and so do you in each pattern: the rating that best explains all your attempts there. It starts at {START_RATING}, moves slowly while you have few attempts, and stays close to the hardest problem you've solved in it.</li>
          <li>Your overall rating is the average over {model.set.length} patterns ({setLabel}); a pattern you haven't rated counts as {START_RATING}. One strong pattern can't carry it: it takes breadth.</li>
          <li>The next problem is picked a little above your rating in its pattern, so you solve most but not all.</li>
          <li>Accepted first try, without hints and inside the time ({TIME_LIMIT.Easy}/{TIME_LIMIT.Medium}/{TIME_LIMIT.Hard} min) counts fully. Failed submissions, hints and running over count a little less.</li>
          <li>Giving up or opening the Solution tab counts as not solved. Only your first go at a problem is rated; problems you solved recently aren't offered.</li>
          <li>An attempt left open for {ABANDON_HOURS} hours ends as given up.</li>
          <li>Rated problems also feed the Daily Coach, and Runway uses your rating to pick each day's problems.</li>
        </ul>
      </RailCard>
    </>
  );

  return (
    <PageLayout rail={rail} contentWidth="900px">
      <header className={page.header}>
        <p className={page.eyebrow}><Mountain size={13} aria-hidden="true" /> Climb</p>
        <h1 className={page.title}>Rated problem solving</h1>
        <p className={page.lead}>One problem at your level, against the clock. Your rating shows how ready you are, and every problem moves it.</p>
      </header>

      <section className={styles.hero}>
        <div>
          <p className={styles.kicker}>Your rating</p>
          <p className={styles.rating}>
            {model.rating}
            {last && last.d !== 0 && <span className={last.d >= 0 ? styles.up : styles.down}>{signed(last.d)}</span>}
          </p>
          <p className={styles.tier}>{tier.label}{nextTier ? ` · ${nextTier.min - model.rating} to “${nextTier.label}”` : ''}</p>
          <p className={styles.coverage}>Average of {model.set.length} patterns, {setLabel}: <strong>{model.rated}</strong> rated so far. Unrated ones count as {START_RATING}.</p>
        </div>
        <div className={styles.target}>
          <p className={styles.kicker}>{company ? <><Building2 size={12} aria-hidden="true" /> {company.name} target</> : <><Trophy size={12} aria-hidden="true" /> Product-company target</>}</p>
          <div className={styles.meter} role="progressbar" aria-valuenow={toward} aria-valuemin={0} aria-valuemax={100} aria-label="Rating towards your target">
            <span style={{ width: `${toward}%` }} />
          </div>
          <p className={styles.targetText}>
            {model.rating >= target ? <>At or above about <strong>{target}</strong>. Keep it there.</> : <>About <strong>{target}</strong> is comfortable for {company ? `${company.name}'s` : 'most product-company'} coding rounds: {target - model.rating} to go.</>}
            {' '}<span className={ui.help}>Our guide, not a promise.</span>
          </p>
        </div>
      </section>

      <section className={ui.panel} aria-labelledby="climb-next">
        <h2 id="climb-next" className={ui.panelTitle}>{active ? 'In progress' : 'Next problem'}</h2>
        {active ? (
          <Active active={active} />
        ) : (
          <>
            <div className={styles.modeRow}>
              <div className={styles.segmented} role="group" aria-label="What to practise">
                <button type="button" aria-pressed={!mode} onClick={() => setMode(null)}>Mix</button>
                <button type="button" aria-pressed={Boolean(mode)} onClick={() => setMode(mode ?? catalog.order.find((p) => studied.has(p)) ?? catalog.order[0])}>One pattern</button>
              </div>
              {mode && (
                <select className={ui.select} value={mode} onChange={(e) => setMode(e.target.value)} aria-label="Pattern">
                  {catalog.order.map((p) => <option key={p} value={p}>{nameOf(p)}{model.patterns[p] ? ` · ${model.patterns[p].r}` : ''}</option>)}
                </select>
              )}
            </div>
            <p className={ui.help}>
              {mode ? 'Every problem from this pattern, nearest your pattern rating first.' : `A mix from the ${studied.size} pattern${studied.size === 1 ? '' : 's'} you've met${company ? `, leaning towards ${company.name}'s focus patterns` : ''} and your weakest ones. The pattern stays hidden: spotting it is part of the test.`}
            </p>
            {preview?.empty === 'study' ? (
              <p className={styles.empty}>A mix draws from patterns you have met: a finished pattern lesson or a solved problem. Read one (try <Link to={lessonPath('hashing')}>Hash map / set</Link>), or choose <strong>One pattern</strong> to start anywhere.</p>
            ) : preview?.empty === 'pattern' ? (
              <p className={styles.empty}>Nothing left to rate in {nameOf(preview.pattern)}: you've solved or rated every problem there. Pick another pattern.</p>
            ) : preview ? (
              <div className={styles.pick}>
                <div>
                  <p className={styles.pickTitle}>{mode ? preview.title : 'A problem from your mix'}</p>
                  <p className={styles.pickMeta}>{preview.level} · rated {preview.pr}{preview.seen ? ' (solved long ago, rated a little easier)' : ''} · {preview.lim} min{mode ? ` · ${nameOf(preview.pattern)}` : ''}</p>
                </div>
                <button type="button" className={`${ui.btn} ${ui.primary}`} onClick={() => startNext(mode)}>
                  <Play size={14} aria-hidden="true" /> Start · {preview.lim} min
                </button>
              </div>
            ) : null}
          </>
        )}
      </section>

      {model.n > 0 ? (
        <>
          <section className={ui.panel} aria-labelledby="climb-chart">
            <h2 id="climb-chart" className={ui.panelTitle}>Rating over your last {Math.min(model.n, 60)} problem{model.n === 1 ? '' : 's'}</h2>
            <RatingChart history={model.history.slice(-60)} target={target} />
          </section>

          <section className={ui.panel} aria-labelledby="climb-patterns">
            <h2 id="climb-patterns" className={ui.panelTitle}>By pattern, weakest first</h2>
            <p className={ui.help}>These {model.set.length} make up your rating. Raise the weakest ones first: each is worth a {model.set.length}th of it.</p>
            <PatternList rows={counted} onFocus={setMode} busy={Boolean(active)} />
            {others.length > 0 && (
              <>
                <h3 className={styles.subhead}>Other patterns you've rated</h3>
                <p className={ui.help}>Good practice, but not part of {company ? `${company.name}'s` : 'the core'} set, so they don't move your rating.</p>
                <PatternList rows={others} onFocus={setMode} busy={Boolean(active)} />
              </>
            )}
          </section>

          <section className={ui.panel} aria-labelledby="climb-recent">
            <h2 id="climb-recent" className={ui.panelTitle}>Recent problems</h2>
            <table className={styles.recent}>
              <thead><tr><th>Problem</th><th>Result</th><th>Time</th><th>Pattern</th><th>Overall</th></tr></thead>
              <tbody>
                {[...model.history].reverse().slice(0, 12).map((h) => {
                  const e = eventsBySlug[h.s];
                  return (
                    <tr key={h.s}>
                      <td><Link to={`/solve/${h.s}`}>{titleOf(h.s)}</Link><span className={styles.patMeta}>{nameOf(h.p)}</span></td>
                      <td>{outcome(h, e)}</td>
                      <td>{e ? `${Math.round(e.ms / 60000)} / ${e.lim} min` : '—'}</td>
                      <td><span className={h.pd >= 0 ? styles.up : styles.down}>{signed(h.pd)}</span><span className={styles.patMeta}>now {h.pr}</span></td>
                      <td className={h.d > 0 ? styles.up : h.d < 0 ? styles.down : styles.flat}>{h.d ? signed(h.d) : '±0'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        </>
      ) : (
        <section className={ui.panel}>
          <p className={ui.help}>Your rating starts at 1200 and settles within your first 10–15 problems. Start one above.</p>
        </section>
      )}
    </PageLayout>
  );
}

function PatternList({ rows, onFocus, busy }) {
  return (
    <ul className={styles.patterns}>
      {rows.map((r) => (
        <li key={r.p}>
          <span className={styles.patName}>{nameOf(r.p)}<span className={styles.patMeta}>{r.n ? `${r.n} rated · best ${r.peak}` : 'not rated yet'}</span></span>
          <span className={styles.patBar} aria-hidden="true"><span style={{ width: `${Math.max(3, Math.min(100, ((r.r - 800) / 1400) * 100))}%`, opacity: r.n ? 1 : 0.35 }} /></span>
          <span className={styles.patNum}>{r.r}</span>
          <button type="button" className={`${ui.btn} ${ui.ghost} ${ui.small}`} onClick={() => onFocus(r.p)} disabled={busy}>Focus</button>
        </li>
      ))}
    </ul>
  );
}

function Active({ active }) {
  const info = catalog.problems[active.s];
  const elapsed = Date.now() - active.t;
  return (
    <div className={styles.pick}>
      <div>
        <p className={styles.pickTitle}>{info?.title ?? active.s}</p>
        <p className={styles.pickMeta}>{info?.level} · rated {active.pr} · started {mmss(elapsed)} ago of {active.lim} min{active.fails ? ` · ${active.fails} failed` : ''}{active.hints ? ` · ${active.hints} hint${active.hints === 1 ? '' : 's'}` : ''}</p>
      </div>
      <div className={ui.row}>
        <Link to={`/solve/${active.s}?climb=1`} className={`${ui.btn} ${ui.primary}`}>Continue <ArrowRight size={14} aria-hidden="true" /></Link>
        <button type="button" className={`${ui.btn} ${ui.ghost}`} onClick={() => { if (window.confirm('Give up this rated attempt? It counts as not solved.')) finishAttempt(active.s, { gave: true }); }}>
          <Flag size={13} aria-hidden="true" /> Give up
        </button>
      </div>
    </div>
  );
}

/** One series, so no legend: a 2px line over a light wash, the latest value labelled, a crosshair and tooltip on hover. */
function RatingChart({ history, target }) {
  const ref = useRef(null);
  const [hover, setHover] = useState(null);
  const W = 640;
  const H = 200;
  const pad = { l: 40, r: 48, t: 12, b: 22 };
  const points = [{ r: history[0].r - history[0].d, s: null }, ...history];
  const values = [...points.map((p) => p.r), target];
  const lo = Math.floor((Math.min(...values) - 40) / 100) * 100;
  const hi = Math.ceil((Math.max(...values) + 40) / 100) * 100;
  const x = (i) => pad.l + (i / Math.max(1, points.length - 1)) * (W - pad.l - pad.r);
  const y = (v) => pad.t + (1 - (v - lo) / (hi - lo)) * (H - pad.t - pad.b);
  const ticks = [];
  const step = hi - lo > 600 ? 200 : 100;
  for (let v = lo; v <= hi; v += step) ticks.push(v);
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.r).toFixed(1)}`).join('');
  const area = `${line}L${x(points.length - 1)},${y(lo)}L${x(0)},${y(lo)}Z`;
  const end = points.at(-1);
  const onMove = (e) => {
    const box = ref.current.getBoundingClientRect();
    const px = ((e.clientX - box.left) / box.width) * W;
    const i = Math.round(((px - pad.l) / (W - pad.l - pad.r)) * (points.length - 1));
    setHover(Math.max(0, Math.min(points.length - 1, i)));
  };
  const h = hover != null ? points[hover] : null;
  return (
    <div className={styles.chart}>
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Rating went from ${points[0].r} to ${end.r} over ${history.length} problems`} onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
        {ticks.map((v) => (
          <g key={v}>
            <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} className={styles.grid} />
            <text x={pad.l - 6} y={y(v)} className={styles.axis} textAnchor="end" dominantBaseline="middle">{v}</text>
          </g>
        ))}
        {target >= lo && target <= hi && (
          <g>
            <line x1={pad.l} x2={W - pad.r} y1={y(target)} y2={y(target)} className={styles.targetLine} />
            <text x={W - pad.r + 4} y={y(target)} className={styles.axis} dominantBaseline="middle">target</text>
          </g>
        )}
        <path d={area} className={styles.area} />
        <path d={line} className={styles.line} />
        {h && <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={H - pad.b} className={styles.cross} />}
        {h && <circle cx={x(hover)} cy={y(h.r)} r={4} className={styles.dot} />}
        <circle cx={x(points.length - 1)} cy={y(end.r)} r={4} className={styles.dot} />
        <text x={x(points.length - 1) + 8} y={y(end.r)} className={styles.endLabel} dominantBaseline="middle">{end.r}</text>
      </svg>
      {h && (
        <div className={styles.tip} style={{ left: `${(x(hover) / W) * 100}%` }}>
          {h.s ? <><strong>{h.r}</strong> ({signed(h.d)}) · {titleOf(h.s)}</> : <><strong>{h.r}</strong> · start</>}
        </div>
      )}
    </div>
  );
}
