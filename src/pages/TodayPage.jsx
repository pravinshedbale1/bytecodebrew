import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  Brain, CalendarClock, CheckCircle2, ChevronRight, Clock, Lightbulb, Repeat, Shuffle, Sparkles, Target, TrendingDown, TrendingUp, XCircle, Layers, Mountain,
} from 'lucide-react';
import { PremiumPage } from '../components/access/PremiumPage';
import { PageLayout, RailCard } from '../components/layout/PageLayout';
import { Statement } from '../components/solve/ProblemSolver';
import { loadProblem } from '../lib/judge/problems';
import { useCoach, answerDrill, markReviewDone } from '../lib/coach/store';
import { catalog, lessonPath } from '../lib/coach/catalog';
import { PATTERNS, cxLabel } from '../lib/coach/patterns';
import { retention, labelOf, changesSince, DAY, DRILL_SECONDS, RESOLVE_MINUTES, RESOLVE_GAPS, FAIL_GAP } from '../lib/coach/model';
import { useDeck } from '../lib/reviewDeck';
import { readJSON, writeJSON } from '../lib/storage';
import { isViewingAs } from '../lib/viewAs';
import ui from '../components/common/ui.module.css';
import page from './Page.module.css';
import styles from './TodayPage.module.css';

const HOWTO_KEY = 'bcb:coach-howto';
const LABEL_CLS = { Strong: 'strong', Shaky: 'shaky', Weak: 'weak', 'Not started': 'none' };
const ago = (t, now) => {
  if (!t) return 'never';
  const d = Math.floor((now - t) / DAY);
  return d <= 0 ? 'today' : d === 1 ? 'yesterday' : `${d} days ago`;
};
const inDays = (t, now) => {
  const d = Math.ceil((t - now) / DAY);
  return d <= 0 ? 'today' : d === 1 ? 'tomorrow' : `in ${d} days`;
};
const problemTitle = (slug) => catalog.problems[slug]?.title ?? slug;

/** /today — the Daily Coach: one short session a day, built from what the learner knows and is forgetting. */
export function TodayPage() {
  return (
    <PremiumPage eyebrow="Daily Coach" title="Today" lead="A 20-minute session every day, built from what you know and what you're about to forget." feature="The Daily Coach">
      <TodayInner />
    </PremiumPage>
  );
}

function TodayInner() {
  const { state, model, session, day } = useCoach();
  const deck = useDeck();
  const now = Date.now();

  const counts = useMemo(() => {
    const c = { Strong: 0, Shaky: 0, Weak: 0, 'Not started': 0 };
    for (const p of catalog.order) c[labelOf(model.patterns[p], now)] += 1;
    return c;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model]);

  if (!session) {
    return (
      <PageLayout>
        <p className={styles.muted}>{isViewingAs() ? 'This learner hasn’t opened today’s session yet. Their skill map is below once they have evidence.' : 'Building today’s session…'}</p>
        {isViewingAs() && <SkillMap model={model} now={Date.now()} />}
      </PageLayout>
    );
  }

  const answered = Object.keys(session.answers ?? {}).length;
  const drillsDone = answered >= session.drills.length;
  const resolveDone = !session.resolve || Boolean(session.resolveResult);
  const stretchDone = !session.stretch || (model.lastAccept[session.stretch.slug] ?? 0) >= session.createdAt;
  const reviewDue = deck ? deck.due.length : null;
  const reviewDone = Boolean(session.reviewDone) || reviewDue === 0;
  const allDone = drillsDone && resolveDone && reviewDone;
  const finishedBefore = Object.keys(state.sessions).length > 1;

  const upcoming = Object.entries(model.schedule)
    .filter(([, s]) => s.due > now)
    .sort((a, b) => a[1].due - b[1].due)
    .slice(0, 4);

  const rail = (
    <>
      <RailCard title="Your patterns" icon={<Brain size={14} aria-hidden="true" />}>
        <ul className={styles.railCounts}>
          {Object.entries(counts).map(([label, n]) => (
            <li key={label}><span className={`${styles.chip} ${styles[LABEL_CLS[label]]}`}>{label}</span><strong>{n}</strong></li>
          ))}
        </ul>
        <p className={ui.help}>Out of {catalog.order.length} DSA patterns. The full map is at the bottom of this page.</p>
      </RailCard>
      <RailCard title="Coming back for a re-solve" icon={<CalendarClock size={14} aria-hidden="true" />}>
        {upcoming.length ? (
          <ul className={styles.railList}>
            {upcoming.map(([slug, s]) => <li key={slug}><span>{problemTitle(slug)}</span><span className={styles.muted}>{inDays(s.due, now)}</span></li>)}
          </ul>
        ) : <p className={ui.help}>Problems you solve come back here for a re-solve from memory, 3 days later and then further apart.</p>}
      </RailCard>
    </>
  );

  return (
    <PageLayout rail={rail} contentWidth="860px">
      <header className={page.header}>
        <p className={page.eyebrow}>Daily Coach</p>
        <h1 className={page.title}>Today</h1>
        <p className={page.lead}>
          About 20 minutes, built from what you know and what you're about to forget. {allDone ? 'Today’s session is done — see you tomorrow.' : 'Work through the parts in order; each one can be skipped.'}
        </p>
      </header>

      <HowItHelps defaultOpen={!finishedBefore} />

      <ol className={styles.steps} aria-label="Today's session">
        <Step n={1} icon={Shuffle} title={session.placement ? 'Placement drills' : 'Recognition drills'} done={drillsDone} status={drillsDone ? 'done' : `${answered}/${session.drills.length}`} />
        <Step n={2} icon={Repeat} title="Re-solve" done={resolveDone} status={!session.resolve ? 'nothing due' : resolveDone ? 'done' : `${RESOLVE_MINUTES} min`} />
        <Step n={3} icon={Mountain} title="Stretch problem" done={stretchDone} status={!session.stretch ? 'none today' : stretchDone ? 'done' : 'optional'} />
        <Step n={4} icon={Layers} title="Review cards" done={reviewDone} status={session.reviewDone ? 'done' : reviewDue === 0 ? 'nothing due' : reviewDue == null ? '…' : `${reviewDue} due`} />
      </ol>

      <section className={ui.panel} aria-labelledby="part-drills">
        <PartHead id="part-drills" n={1} title={session.placement ? 'Placement: 10 quick drills' : 'Recognition drills'}>
          {session.placement
            ? 'Your first session finds your starting point: one problem from each of 10 core patterns. Guessing is fine; it only tells the coach where to begin.'
            : `Three problems you haven’t solved, from the patterns you’re weakest at, mixed together. You have ${DRILL_SECONDS} seconds for each: name the pattern and how fast the solution can be. No code.`}
        </PartHead>
        <DrillRunner session={session} day={day} />
      </section>

      <section className={ui.panel} aria-labelledby="part-resolve">
        <PartHead id="part-resolve" n={2} title="Re-solve from memory">
          A problem you solved before, from a blank editor, judged by the tests, in {RESOLVE_MINUTES} minutes. Pass and it comes back later each time
          ({RESOLVE_GAPS.slice(0, 4).join(', ')} days); miss it and it returns in {FAIL_GAP} days.
        </PartHead>
        <ResolvePart session={session} model={model} now={now} />
      </section>

      <section className={ui.panel} aria-labelledby="part-stretch">
        <PartHead id="part-stretch" n={3} title="Stretch problem (optional)">
          One unsolved problem, one level above your best, in your weakest pattern. Take it on when you have time; it counts whenever you solve it today.
        </PartHead>
        <StretchPart session={session} model={model} done={stretchDone} />
      </section>

      <section className={ui.panel} aria-labelledby="part-review">
        <PartHead id="part-review" n={4} title="Review cards">
          The system-design and lesson cards your review deck has due today: a couple of minutes of recall.
        </PartHead>
        <div className={styles.partBody}>
          {reviewDone ? (
            <p className={styles.ok}><CheckCircle2 size={16} aria-hidden="true" /> {reviewDue === 0 && !session.reviewDone ? 'Nothing due today.' : 'Done for today.'}</p>
          ) : (
            <div className={ui.row}>
              <Link to="/review" className={`${ui.btn} ${ui.primary}`}>Open review ({reviewDue ?? '…'} due)</Link>
              <button type="button" className={ui.btn} onClick={() => markReviewDone(day)}>Mark as done</button>
            </div>
          )}
        </div>
      </section>

      <Changes session={session} model={model} now={now} allDone={allDone} />
      <SkillMap model={model} now={now} />
    </PageLayout>
  );
}

function HowItHelps({ defaultOpen }) {
  const [open, setOpen] = useState(() => readJSON(HOWTO_KEY, defaultOpen));
  const toggle = (e) => { setOpen(e.currentTarget.open); writeJSON(HOWTO_KEY, e.currentTarget.open); };
  return (
    <details className={`${ui.panel} ${styles.howto}`} open={open} onToggle={toggle}>
      <summary><Lightbulb size={16} aria-hidden="true" /> How the Daily Coach helps you</summary>
      <p className={styles.howLead}>
        Interviews test whether you can spot the right pattern in a problem you’ve never seen, and recall how to solve it under pressure.
        Reading more lessons doesn’t train that. Three habits do, and the coach builds all three into 20 minutes a day.
      </p>
      <div className={styles.methods}>
        <div>
          <h3><Brain size={16} aria-hidden="true" /> Recall, don’t reread</h3>
          <p>Pulling an answer out of memory strengthens it far more than reading it again. Every part of today asks you to recall first, then shows the answer.</p>
        </div>
        <div>
          <h3><CalendarClock size={16} aria-hidden="true" /> Come back just before you forget</h3>
          <p>Each pattern’s score fades over time, the way memory does. The coach brings it back as it fades, and spaces your re-solves further apart every time you pass.</p>
        </div>
        <div>
          <h3><Shuffle size={16} aria-hidden="true" /> Mix the patterns</h3>
          <p>Practising one pattern at a time teaches you to apply it, not to recognise it. Drills mix patterns, so you learn to tell them apart — exactly what an interview asks.</p>
        </div>
      </div>
      <h3 className={styles.howH}>What each part does</h3>
      <ul className={styles.howList}>
        <li><strong>Recognition drills (3 × {DRILL_SECONDS} s):</strong> read an unseen problem, name its pattern and target complexity. Trains spotting the pattern.</li>
        <li><strong>Re-solve from memory ({RESOLVE_MINUTES} min):</strong> solve a problem you passed before, from a blank editor. Turns “I solved it once” into “I can solve it”.</li>
        <li><strong>Stretch problem (optional):</strong> one step harder in your weakest pattern. Grows you where it matters most.</li>
        <li><strong>Review cards (2–3 min):</strong> your due system-design and lesson cards.</li>
      </ul>
      <h3 className={styles.howH}>To get the most out of it</h3>
      <ul className={styles.howList}>
        <li>Answer before the timer runs out, without looking anything up. A wrong answer here costs nothing and shows the coach what to bring back.</li>
        <li>Re-solve honestly: hints and your old submissions are hidden until you finish.</li>
        <li>Come back daily. Twenty minutes every day beats two hours once a week.</li>
        <li>The coach learns from everything you do here: problems you solve (first try or not, hints used), quick checks in DSA lessons, drills and re-solves. Your skill map at the bottom shows that evidence.</li>
      </ul>
    </details>
  );
}

function Step({ n, icon: Icon, title, status, done }) {
  return (
    <li className={`${styles.step} ${done ? styles.stepDone : ''}`}>
      <span className={styles.stepN}>{done ? <CheckCircle2 size={16} aria-hidden="true" /> : n}</span>
      <span className={styles.stepText}><Icon size={14} aria-hidden="true" /> {title}</span>
      <span className={styles.stepStatus}>{status}</span>
    </li>
  );
}

function PartHead({ id, n, title, children }) {
  return (
    <div className={styles.partHead}>
      <h2 id={id} className={ui.panelTitle}><span className={styles.partN}>{n}</span> {title}</h2>
      <p className={styles.partLead}>{children}</p>
    </div>
  );
}

// ---- part 1: recognition drills

function DrillRunner({ session, day }) {
  const answers = session.answers ?? {};
  const firstOpen = session.drills.findIndex((_, i) => !answers[i]);
  const [view, setView] = useState(firstOpen < 0 ? null : firstOpen);

  if (!session.drills.length) return <p className={styles.muted}>No drills today: you’ve drilled every problem in your patterns recently.</p>;
  if (view == null) {
    return (
      <div className={styles.partBody}>
        <ul className={styles.drillResults}>
          {session.drills.map((d, i) => {
            const a = answers[i];
            const pattern = catalog.problems[d.slug].pattern;
            const patOk = a?.pat === pattern;
            const cxOk = d.cxOptions ? a?.cx === catalog.cx[d.slug][0] : null;
            return (
              <li key={d.slug}>
                {patOk ? <CheckCircle2 size={16} className={styles.okIcon} aria-label="Pattern right" /> : <XCircle size={16} className={styles.badIcon} aria-label="Pattern wrong" />}
                <button type="button" className={styles.linkBtn} onClick={() => setView(i)}>{problemTitle(d.slug)}</button>
                <span className={styles.muted}>{PATTERNS[pattern].name}{cxOk === false ? ' · complexity missed' : ''}</span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
  const next = () => {
    const after = session.drills.findIndex((_, i) => i > view && !(session.answers ?? {})[i]);
    const before = session.drills.findIndex((_, i) => !(session.answers ?? {})[i]);
    setView(after >= 0 ? after : before >= 0 && before !== view ? before : null);
  };
  return (
    <Drill
      key={`${day}:${view}`}
      drill={session.drills[view]}
      index={view}
      total={session.drills.length}
      answer={answers[view]}
      onAnswer={(a) => answerDrill(day, view, a)}
      onNext={next}
    />
  );
}

function Drill({ drill, index, total, answer, onAnswer, onNext }) {
  const [spec, setSpec] = useState(null);
  const [pat, setPat] = useState(null);
  const [cx, setCx] = useState(null);
  const [left, setLeft] = useState(DRILL_SECONDS);
  const [started] = useState(() => Date.now());
  const pattern = catalog.problems[drill.slug].pattern;
  const [rightCx, exactCx] = catalog.cx[drill.slug] ?? [null, ''];
  const shown = Boolean(answer);

  useEffect(() => {
    let alive = true;
    loadProblem(drill.slug).then((p) => alive && setSpec(p));
    return () => { alive = false; };
  }, [drill.slug]);

  const submit = (p = pat, c = cx) => onAnswer({ pat: p, cx: c, ms: Date.now() - started });

  useEffect(() => {
    if (shown || !spec) return undefined;
    if (left <= 0) { submit(); return undefined; }
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, shown, spec]);

  const ready = pat && (!drill.cxOptions || cx);
  const a = answer ?? {};
  const patOk = a.pat === pattern;
  const cxOk = a.cx === rightCx;

  return (
    <div className={styles.drill}>
      <div className={styles.drillTop}>
        <span className={styles.muted}>Drill {index + 1} of {total} · {catalog.problems[drill.slug].level}</span>
        {!shown && spec && <span className={`${styles.timer} ${left <= 10 ? styles.timerLow : ''}`} aria-live="off"><Clock size={14} aria-hidden="true" /> {left}s</span>}
      </div>
      {shown && <h3 className={styles.drillTitle}>{problemTitle(drill.slug)}</h3>}
      {!spec ? <p className={styles.muted}>Loading the problem…</p> : (
        <div className={styles.statement}>
          {spec.statement ? <Statement text={spec.statement} /> : <p>{spec.summary}</p>}
          {spec.constraints?.length > 0 && <p className={styles.constraints}>Constraints: {spec.constraints.join(' · ')}</p>}
        </div>
      )}

      <fieldset className={styles.choices} disabled={shown}>
        <legend>Which pattern solves it?</legend>
        {drill.options.map((o) => (
          <button
            key={o}
            type="button"
            className={`${styles.choice} ${(shown ? a.pat : pat) === o ? styles.chosen : ''} ${shown && o === pattern ? styles.right : ''} ${shown && a.pat === o && o !== pattern ? styles.wrong : ''}`}
            aria-pressed={(shown ? a.pat : pat) === o}
            onClick={() => setPat(o)}
          >
            {PATTERNS[o].name}
          </button>
        ))}
      </fieldset>

      {drill.cxOptions && (
        <fieldset className={styles.choices} disabled={shown}>
          <legend>How fast can it be? <span className={styles.muted}>Worst case of the standard solution, every input size counted as n.</span></legend>
          {drill.cxOptions.map((o) => (
            <button
              key={o}
              type="button"
              className={`${styles.choice} ${styles.cx} ${(shown ? a.cx : cx) === o ? styles.chosen : ''} ${shown && o === rightCx ? styles.right : ''} ${shown && a.cx === o && o !== rightCx ? styles.wrong : ''}`}
              aria-pressed={(shown ? a.cx : cx) === o}
              onClick={() => setCx(o)}
            >
              {cxLabel(o)}
            </button>
          ))}
        </fieldset>
      )}

      {!shown ? (
        <div className={ui.row}>
          <button type="button" className={`${ui.btn} ${ui.primary}`} disabled={!ready} onClick={() => submit()}>Check</button>
          <button type="button" className={`${ui.btn} ${ui.ghost}`} onClick={() => submit(pat, cx)}>I don’t know</button>
        </div>
      ) : (
        <div className={styles.reveal}>
          <p className={patOk ? styles.ok : styles.bad}>
            {patOk ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
            {' '}{patOk ? 'Right pattern: ' : a.pat ? 'It’s ' : 'Time’s up. It’s '}<Link to={lessonPath(pattern)}>{PATTERNS[pattern].name}</Link>.
          </p>
          {exactCx && (
            <p className={!drill.cxOptions || cxOk ? styles.ok : styles.bad}>
              {drill.cxOptions && (cxOk ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />)}
              {' '}Target complexity: <strong>{rightCx ? cxLabel(rightCx) : exactCx}</strong>{rightCx ? ` — exactly ${exactCx}` : ''}.
            </p>
          )}
          {spec?.hints?.length > 0 && (
            <details className={styles.keyIdea}>
              <summary>The key idea, step by step</summary>
              <ol>{spec.hints.map((h, i) => <li key={i}>{h}</li>)}</ol>
            </details>
          )}
          <div className={ui.row}>
            <button type="button" className={`${ui.btn} ${ui.primary}`} onClick={onNext}>{index + 1 < total ? 'Next drill' : 'See results'} <ChevronRight size={14} /></button>
            <Link to={`/solve/${drill.slug}`} className={ui.btn}>Solve it now</Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- part 2: re-solve

function ResolvePart({ session, model, now }) {
  const r = session.resolve;
  if (!r) {
    const next = Object.values(model.schedule).filter((s) => s.due > now).sort((a, b) => a.due - b.due)[0];
    return <p className={styles.partBody}>{next ? `Nothing is due today. The next re-solve comes ${inDays(next.due, now)}.` : 'Nothing to re-solve yet: problems you solve come back here 3 days later.'}</p>;
  }
  const p = catalog.problems[r.slug];
  const res = session.resolveResult;
  const due = model.schedule[r.slug]?.due;
  return (
    <div className={`${styles.partBody} ${styles.problemRow}`}>
      <div>
        <p className={styles.problemTitle}>{p.title} <span className={styles.muted}>· {p.level} · {PATTERNS[p.pattern].name}</span></p>
        <p className={styles.muted}>Last solved {ago(model.lastAccept[r.slug], now)}{model.lastAccept[r.slug] ? '' : ' (before the coach, or elsewhere)'}.</p>
        {res && (
          <p className={res.pass ? styles.ok : styles.bad}>
            {res.pass ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
            {' '}{res.pass ? `Passed from memory. It comes back ${due ? inDays(due, now) : 'later'}.` : `Not this time — it comes back in ${FAIL_GAP} days. Your earlier solution is in its Submissions tab.`}
          </p>
        )}
      </div>
      {!res && <Link to={`/solve/${r.slug}?coach=resolve`} className={`${ui.btn} ${ui.primary}`}>Start re-solve</Link>}
    </div>
  );
}

// ---- part 3: stretch

function StretchPart({ session, model, done }) {
  const s = session.stretch;
  if (!s) return <p className={styles.partBody}>No stretch problem today: you’ve solved everything the coach would pick.</p>;
  const p = catalog.problems[s.slug];
  const st = model.patterns[s.pattern];
  const why = s.reason === 'new' ? 'a pattern you haven’t started yet' : `your weakest pattern (${labelOf(st, Date.now()).toLowerCase()})`;
  return (
    <div className={`${styles.partBody} ${styles.problemRow}`}>
      <div>
        <p className={styles.problemTitle}>{p.title} <span className={styles.muted}>· {p.level} · {PATTERNS[s.pattern].name}</span></p>
        <p className={styles.muted}>Picked from {why}.</p>
        {done && <p className={styles.ok}><CheckCircle2 size={16} aria-hidden="true" /> Solved today.</p>}
      </div>
      {!done && <Link to={`/solve/${s.slug}?coach=stretch`} className={ui.btn}>Open problem</Link>}
    </div>
  );
}

// ---- summary and skill map

function Changes({ session, model, now, allDone }) {
  const changes = changesSince(session, model, now).slice(0, 8);
  if (!changes.length && !allDone) return null;
  return (
    <section className={ui.panel} aria-labelledby="today-changes">
      <h2 id="today-changes" className={ui.panelTitle}><Sparkles size={16} aria-hidden="true" /> {allDone ? 'Session done — what changed today' : 'What changed today'}</h2>
      {changes.length ? (
        <ul className={styles.changes}>
          {changes.map((c) => (
            <li key={c.pattern}>
              {c.to > c.from ? <TrendingUp size={16} className={styles.okIcon} aria-label="Up" /> : <TrendingDown size={16} className={styles.badIcon} aria-label="Down" />}
              <Link to={lessonPath(c.pattern)}>{PATTERNS[c.pattern].name}</Link>
              <span className={styles.muted}>{Math.round(c.from * 100)} → {Math.round(c.to * 100)}</span>
            </li>
          ))}
        </ul>
      ) : <p className={styles.muted}>No change in your patterns yet today.</p>}
    </section>
  );
}

function SkillMap({ model, now }) {
  const groups = [];
  for (const p of catalog.order) {
    const m = catalog.modules[p];
    if (!groups.length || groups[groups.length - 1].module !== m) groups.push({ module: m, patterns: [] });
    groups[groups.length - 1].patterns.push(p);
  }
  return (
    <section className={ui.panel} aria-labelledby="skill-map">
      <h2 id="skill-map" className={ui.panelTitle}><Target size={16} aria-hidden="true" /> Your skill map</h2>
      <p className={styles.partLead}>Each pattern’s score comes from your evidence and fades over time unless you practise it. Strong ≥ 70, Shaky ≥ 45.</p>
      <div className={styles.map}>
        {groups.map((g) => (
          <div key={g.module} className={styles.mapGroup}>
            <h3>{g.module}</h3>
            <ul>
              {g.patterns.map((p) => {
                const st = model.patterns[p];
                const label = labelOf(st, now);
                const v = retention(st, now);
                return (
                  <li key={p}>
                    <Link to={lessonPath(p)} className={styles.mapName} title={catalog.titles[p]}>{PATTERNS[p].name}</Link>
                    <span className={styles.bar} aria-hidden="true"><span className={styles[LABEL_CLS[label]]} style={{ width: `${Math.round(v * 100)}%` }} /></span>
                    <span className={`${styles.chip} ${styles[LABEL_CLS[label]]}`} title={st.n ? `Last practised ${ago(st.t, now)}` : 'No evidence yet'}>{label}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
