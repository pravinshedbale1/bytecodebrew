import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import ladderData from 'virtual:dsa-ladders';
import {
  PlaneTakeoff, Check, ChevronDown, ChevronUp, ArrowUp, ArrowDown, CalendarDays, Trash2, Plus, MoreHorizontal,
  ExternalLink, Settings2, AlertTriangle, Coffee, Building2, Sparkles, Pin, PinOff, Clock3, Shuffle, Undo2,
  Gauge, History, ListChecks, Archive, CornerDownRight,
} from 'lucide-react';
import { PremiumPage } from '../components/access/PremiumPage';
import { PageLayout } from '../components/layout/PageLayout';
import { tracks, getCourseLessons } from '../curriculum';
import { hasProblem } from '../lib/judge/problems';
import { useSolved } from '../hooks/useSolved';
import { useProfile, updateProfile } from '../hooks/useProfile';
import { useRunway, setRunway, undoRunway, useRunwayUndo } from '../hooks/useRunway';
import { useReplan, useProgressFns } from '../hooks/useReplan';
import { COMPANIES, GROUPS, AI_LABEL, companyPlan } from '../data/companies';
import { ratings } from '../lib/climb/store';
import {
  TRACKS, PRESETS, LEVELS, PACES, PRIORITIES, MISSED, missedOf, generatePlan, planStats, isTaskDone, toggleDone, moveTask, removeTask, addCustomTask,
  reorderTask, keepOnRebuild, addDays, daysBetween, capacityFor, hoursFor, budgetFor, pinTask, snoozeTask, swapTask, setCapacity,
  setPace, addDailyMinutes, forecast, diffPlans, syllabusGroups,
} from '../lib/runwayPlan';
import { today as todayKey, parseDay } from '../lib/dates';
import ui from '../components/common/ui.module.css';
import page from './Page.module.css';
import styles from './RunwayPage.module.css';

// kept for pages that imported it from here
export { useProgressFns };

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const fmtDay = (k, opts = { weekday: 'short', day: 'numeric', month: 'short' }) => parseDay(k).toLocaleDateString(undefined, opts);
const hm = (min) => (min >= 60 ? `${Math.floor(min / 60)}h${min % 60 ? ` ${min % 60}m` : ''}` : `${min}m`);
const PHASE = { learn: 'Learn & practise', final: 'Final stretch', rest: 'Rest day', interview: 'Interview day' };
const relDay = (k, today) => (k === today ? 'today' : k === addDays(today, -1) ? 'yesterday' : fmtDay(k));

/** Every readable lesson plus the DSA ladders: what a plan is built from. */
function useCatalogue() {
  return useMemo(() => ({
    lessons: tracks.flatMap((t) => t.courses.flatMap((c) => getCourseLessons(t.id, c.id)
      .filter((l) => l.available)
      .map((l) => ({ ...l, trackId: t.id, courseId: c.id, courseTitle: c.shortTitle ?? c.title })))),
    ladders: ladderData,
    solvable: hasProblem,
  }), []);
}

/**
 * Swap a problem for another from the same ladder: the unsolved, unplanned problem nearest in rating
 * (same level first), so a learner who wants "something like this, but different" gets exactly that.
 */
function useSwapChooser() {
  const { isSolved } = useSolved();
  return useMemo(() => {
    const ladderOf = (slug) => Object.entries(ladderData).find(([, l]) => l.some((p) => p.slug === slug));
    return (task, planned) => {
      const found = ladderOf(task.ref);
      if (!found) return null;
      const [pattern, ladder] = found;
      const me = ladder.find((p) => p.slug === task.ref);
      const r = (s) => ratings[s] ?? 0;
      const options = ladder
        .filter((p) => p.slug !== task.ref && !planned.has(p.slug) && !isSolved(p.slug))
        .sort((a, b) => (a.level !== me.level) - (b.level !== me.level) || Math.abs(r(a.slug) - r(me.slug)) - Math.abs(r(b.slug) - r(me.slug)));
      const p = options[0];
      if (!p) return null;
      const lessonTitle = task.sub?.split(' · ')[1] ?? pattern;
      return {
        id: `problem:${p.slug}`, kind: 'problem', track: 'dsa', ref: p.slug, title: p.title, sub: `${p.level} · ${lessonTitle}`,
        minutes: { Easy: 20, Medium: 35, Hard: 50 }[p.level] ?? 35,
        ...(hasProblem(p.slug) ? { path: `/solve/${p.slug}`, slot: true } : { href: `https://leetcode.com/problems/${p.slug}/`, slot: false }),
        why: `Swapped in for ${task.title}`,
      };
    };
  }, [isSolved]);
}

export function RunwayPage() {
  return (
    <PremiumPage
      eyebrow="Runway"
      title="Your interview runway"
      lead="Tell us how many days you have and how many hours a day. Runway builds a day-by-day plan, re-plans it every day around what you actually did, and lets you shape every day."
      feature="Runway"
    >
      <RunwayInner />
    </PremiumPage>
  );
}

function RunwayInner() {
  const plan = useRunway();
  // /runway?company=google (from a company page) opens the setup with that company chosen
  const [params] = useSearchParams();
  const wanted = companyPlan(params.get('company')) ? params.get('company') : null;
  const [editing, setEditing] = useState(false);
  // the plan can arrive from the account after the first render, so the company link is tracked separately
  const [wantedHandled, setWantedHandled] = useState(false);
  const close = () => { setEditing(false); setWantedHandled(true); };
  if (!plan || editing || (wanted && !wantedHandled)) {
    return (
      <PageLayout>
        <header className={styles.setupHeader}>
          <p className={page.eyebrow}>Runway</p>
          <h1 className={page.title}>{plan ? 'Edit your plan' : 'Plan your runway to interview day'}</h1>
          <p className={page.lead}>
            {plan
              ? 'Change the dates, hours or focus. The plan is rebuilt from today, keeping everything you have completed, the tasks you added and the tasks you pinned.'
              : 'Answer four questions and get a personal day-by-day plan of lessons, problems, mock interviews and revision that fits the time you have. It re-plans itself every day around what you actually did.'}
          </p>
        </header>
        <Setup key={wanted ?? 'plan'} plan={plan} wanted={wanted && !wantedHandled ? wanted : null} onDone={close} onCancel={plan ? close : null} />
      </PageLayout>
    );
  }
  return <PlanView plan={plan} onEdit={() => setEditing(true)} />;
}

/** Delete the plan after confirming. Lesson progress and solved problems are not touched. */
function deletePlan() {
  if (window.confirm('Delete your Runway plan? Your completed lessons and solved problems stay as they are.')) setRunway(null);
}

const MOCK_NAMES = { dsa: 'DSA', hld: 'system design', lld: 'LLD', behavioral: 'behavioral', machine: 'machine coding' };

const DURATIONS = [[7, '1 week'], [14, '2 weeks'], [30, '1 month'], [60, '2 months'], [90, '3 months']];

// ---------------------------------------------------------------- setup

function Field({ step, title, help, children }) {
  return (
    <section className={styles.field}>
      <div className={styles.fieldHead}>
        <p className={styles.fieldStep}>Step {step}</p>
        <h2 className={styles.fieldTitle}>{title}</h2>
        {help && <p className={styles.fieldHelp}>{help}</p>}
      </div>
      <div className={styles.fieldBody}>{children}</div>
    </section>
  );
}

function Option({ on, onClick, title, hint }) {
  return (
    <button type="button" className={`${styles.option} ${on ? styles.optionOn : ''}`} onClick={onClick} aria-pressed={on}>
      <span className={styles.radio} aria-hidden="true" />
      <span className={styles.optionText}>
        <strong>{title}</strong>
        <span>{hint}</span>
      </span>
    </button>
  );
}

/** What a rebuild changes from today: shown before the learner commits to it. */
function DiffNote({ diff }) {
  if (!diff) return null;
  if (!diff.changed) return <p className={styles.summaryNote}>No change to the tasks from today on.</p>;
  const parts = [
    diff.added.length && `${diff.added.length} task${diff.added.length === 1 ? '' : 's'} added`,
    diff.removed.length && `${diff.removed.length} taken off (lessons and problems wait in Spare time)`,
    diff.moved.length && `${diff.moved.length} moved to another day`,
  ].filter(Boolean);
  return <p className={styles.diff}><CornerDownRight size={13} aria-hidden="true" /> From today: {parts.join(', ')}.</p>;
}

function Setup({ plan, wanted, onDone, onCancel }) {
  const catalogue = useCatalogue();
  const progress = useProgressFns();
  const profile = useProfile();
  const today = todayKey();
  const prev = plan?.settings;
  const initialEnd = prev?.end && prev.end > today ? prev.end : profile.interviewDate && profile.interviewDate > today ? profile.interviewDate : addDays(today, 30);
  const [end, setEnd] = useState(initialEnd);
  const [hours, setHours] = useState(prev?.hours ?? { weekday: 2, weekend: 4 });
  const [restDays, setRestDays] = useState(prev?.restDays ?? []);
  const [pace, setPaceChoice] = useState(prev?.pace ?? 'steady');
  const [missed, setMissed] = useState(prev ? missedOf(prev) : 'pile');
  const [company, setCompany] = useState(wanted ?? prev?.company ?? null);
  const [mix, setMix] = useState(() => (wanted ? companyPlan(wanted).mix : prev?.mix ?? PRESETS[1].mix));
  const cp = company ? companyPlan(company) : null;
  const pickCompany = (id) => {
    setCompany(id || null);
    if (id) setMix(companyPlan(id).mix);
  };
  const [level, setLevel] = useState(prev?.level ?? 'some');
  const days = daysBetween(today, end);
  const preset = PRESETS.find((p) => TRACKS.every((t) => p.mix[t.id] === mix[t.id]))?.id ?? 'custom';
  const mixTotal = TRACKS.reduce((s, t) => s + mix[t.id], 0) || 1;
  const pct = (id) => Math.round((mix[id] / mixTotal) * 100);
  // the learner's own day-by-day hours and syllabus choices carry over to a rebuild
  const settings = {
    start: today, end, hours, restDays, mix, level, company, pace, missed,
    capacity: Object.fromEntries(Object.entries(prev?.capacity ?? {}).filter(([d]) => d >= today && d < end)),
    syllabus: prev?.syllabus ?? {}, patternOrder: prev?.patternOrder ?? [],
  };
  const valid = days >= 1 && days <= 365 && TRACKS.some((t) => mix[t.id] > 0) && (hours.weekday > 0 || hours.weekend > 0) && restDays.length < 7;
  const preview = useMemo(() => (valid ? generatePlan(settings, catalogue, progress, keepOnRebuild(plan)) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [valid, end, hours, restDays, mix, level, company, pace, missed, catalogue, progress]);
  const stats = preview && planStats(preview, progress, today);
  const diff = plan && preview ? diffPlans(plan, preview, today) : null;
  const weekly = [1, 2, 3, 4, 5, 6, 0].reduce((s, d) => s + (restDays.includes(d) ? 0 : d === 0 || d === 6 ? hours.weekend : hours.weekday), 0);

  const setDays = (n) => setEnd(addDays(today, Math.max(1, Math.min(365, Math.round(n) || 1))));
  const setHour = (k, v) => setHours((h) => ({ ...h, [k]: Math.max(0, Math.min(14, Number(v))) }));
  const toggleRest = (d) => setRestDays((r) => (r.includes(d) ? r.filter((x) => x !== d) : [...r, d]));
  const create = () => {
    setRunway(preview);
    // the old dashboard countdown paced lessons differently; Runway owns the interview date now
    if (profile.interviewDate) updateProfile({ interviewDate: null });
    onDone();
  };

  return (
    <div className={styles.setup}>
      <div className={styles.form}>
        <Field step={1} title="Interview date" help="Count the days you have, or pick the date. The interview day itself is kept light.">
          <div className={styles.dateRow}>
            <div className={styles.daysBox}>
              <input type="number" className={styles.daysInput} min={1} max={365} value={days} onChange={(e) => setDays(e.target.value)} aria-label="Days until the interview" />
              <span>days</span>
            </div>
            <span className={styles.or}>or</span>
            <input type="date" className={`${ui.input} ${styles.dateInput}`} min={addDays(today, 1)} value={end} onChange={(e) => e.target.value && setEnd(e.target.value)} aria-label="Interview date" />
          </div>
          <div className={styles.segmented} role="group" aria-label="Quick durations">
            {DURATIONS.map(([n, label]) => (
              <button key={n} type="button" aria-pressed={days === n} onClick={() => setDays(n)}>{label}</button>
            ))}
          </div>
        </Field>

        <Field step={2} title="Time you can give" help="Be realistic: a plan you can keep beats an ambitious one you abandon. You can change any single day later.">
          <div className={styles.hours}>
            {[['weekday', 'Weekdays'], ['weekend', 'Weekends']].map(([k, label]) => (
              <label key={k} className={styles.hourField}>
                <span className={styles.hourHead}><span>{label}</span><strong>{hours[k]} h a day</strong></span>
                <input type="range" className={styles.range} style={{ '--pct': `${hours[k] * 10}%`, '--tc': 'var(--color-accent)' }} min={0} max={10} step={0.5} value={hours[k]} onChange={(e) => setHour(k, e.target.value)} />
              </label>
            ))}
          </div>
          <div className={styles.restRow}>
            <span className={styles.subLabel}>Days off <span className={styles.subHint}>(tap to skip)</span></span>
            <div className={styles.weekdays} role="group" aria-label="Days off">
              {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                <button key={d} type="button" aria-pressed={restDays.includes(d)} onClick={() => toggleRest(d)} title={restDays.includes(d) ? `${WEEKDAYS[d]}: day off` : `${WEEKDAYS[d]}: study day`}>{WEEKDAYS[d].slice(0, 2)}</button>
              ))}
            </div>
            <span className={styles.weekly}>{hm(Math.round(weekly * 60))} a week</span>
          </div>
          <div className={styles.restRow}>
            <span className={styles.subLabel}>Pace</span>
            <PacePicker value={pace} onChange={setPaceChoice} />
          </div>
          <div className={styles.restRow}>
            <span className={styles.subLabel}>Missed a day?</span>
            <MissedPicker value={missed} onChange={setMissed} />
            <span className={styles.weekly}>{MISSED.find((m) => m.id === missed).hint}</span>
          </div>
        </Field>

        <Field step={3} title="Focus" help="Pick your target company for a plan shaped like its interview, or a general mix. Every weight stays adjustable, and you can prioritise single topics from the plan page.">
          <label className={styles.companyField}>
            <span className={styles.subLabel}>Target company</span>
            <select className={ui.select} value={company ?? ''} onChange={(e) => pickCompany(e.target.value)}>
              <option value="">No specific company</option>
              {GROUPS.map((g) => (
                <optgroup key={g} label={g}>
                  {COMPANIES.filter((c) => c.group === g).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </optgroup>
              ))}
            </select>
          </label>
          {cp ? (
            <div className={styles.companyCard}>
              <p className={styles.companyHead}><Building2 size={15} aria-hidden="true" /> <strong>{cp.name}</strong> · {cp.styleLabel} · {AI_LABEL[cp.ai]}</p>
              <p className={styles.companyText}>{cp.rounds ? cp.rounds.slice(0, 3).join(' · ') : cp.summary}</p>
              <p className={styles.companyText}>
                The plan puts {cp.name}'s focus patterns first and schedules {[...new Set(cp.mocks)].map((m) => MOCK_NAMES[m]).join(', ')} mocks.{' '}
                <Link to={`/companies/${cp.id}`} target="_blank">How {cp.name} interviews</Link>
              </p>
            </div>
          ) : (
            <div className={styles.options}>
              {PRESETS.map((p) => (
                <Option key={p.id} on={preset === p.id} onClick={() => setMix(p.mix)} title={p.label} hint={p.hint} />
              ))}
            </div>
          )}
          <div className={styles.mixBar} aria-hidden="true">
            {TRACKS.filter((t) => mix[t.id] > 0).map((t) => <span key={t.id} className={styles[`t_${t.id}`]} style={{ flex: mix[t.id] }} />)}
          </div>
          <div className={styles.mix}>
            {TRACKS.map((t) => (
              <label key={t.id} className={`${styles.mixRow} ${styles[`t_${t.id}`]}`}>
                <span className={styles.mixName}><span className={styles.dot} aria-hidden="true" /> {t.label}</span>
                <input type="range" className={styles.range} style={{ '--pct': `${mix[t.id]}%` }} min={0} max={100} step={5} value={mix[t.id]} onChange={(e) => setMix((m) => ({ ...m, [t.id]: Number(e.target.value) }))} aria-label={`${t.label} weight`} />
                <span className={styles.mixPct}>{pct(t.id)}%</span>
              </label>
            ))}
          </div>
        </Field>

        <Field step={4} title="Starting point" help="Lessons and problems you have already completed are always left out.">
          <div className={styles.options}>
            {LEVELS.map((l) => (
              <Option key={l.id} on={level === l.id} onClick={() => setLevel(l.id)} title={l.label} hint={l.hint} />
            ))}
          </div>
        </Field>
      </div>

      <aside className={styles.summary} aria-live="polite">
        <p className={styles.summaryKicker}>Plan summary</p>
        {stats ? (
          <>
            <div className={styles.summaryTop}>
              <p className={styles.summaryBig}>{days}<span> day{days === 1 ? '' : 's'}</span></p>
              <p className={styles.summaryDate}>{fmtDay(end, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
            <div className={styles.mixBar} aria-hidden="true">
              {TRACKS.filter((t) => mix[t.id] > 0).map((t) => <span key={t.id} className={styles[`t_${t.id}`]} style={{ flex: mix[t.id] }} />)}
            </div>
            <dl className={styles.summaryStats}>
              <div><dt>Study days</dt><dd>{stats.studyDays}</dd></div>
              <div><dt>Planned time</dt><dd>{hm(stats.minutesTotal)}</dd></div>
              <div><dt>Lessons</dt><dd>{stats.lessons}</dd></div>
              <div><dt>Problems</dt><dd>{stats.problems}</dd></div>
              <div><dt>Mock interviews</dt><dd>{stats.mocks}</dd></div>
              <div><dt>Daily review</dt><dd>Included</dd></div>
            </dl>
            {preview.extras.length > 0 && (
              <p className={styles.summaryNote}>The most important material is planned first. What doesn't fit is kept under <em>Spare time</em> for days you get ahead.</p>
            )}
            <DiffNote diff={diff} />
          </>
        ) : (
          <p className={styles.summaryNote}>Choose at least one day, some study time and one track to see your plan.</p>
        )}
        <button type="button" className={`${ui.btn} ${ui.primary} ${styles.create}`} onClick={create} disabled={!valid}>
          {plan ? 'Rebuild my plan' : 'Create my plan'}
        </button>
        {onCancel && <button type="button" className={`${ui.btn} ${styles.create}`} onClick={onCancel}>Cancel</button>}
        {plan && <button type="button" className={styles.deleteLink} onClick={deletePlan}><Trash2 size={13} /> Delete plan</button>}
      </aside>
    </div>
  );
}

function MissedPicker({ value, onChange }) {
  return (
    <div className={styles.segmented} role="group" aria-label="When you miss a day">
      {MISSED.map((m) => (
        <button key={m.id} type="button" aria-pressed={value === m.id} onClick={() => onChange(m.id)} title={m.hint}>{m.label}</button>
      ))}
    </div>
  );
}

function PacePicker({ value, onChange }) {
  return (
    <div className={styles.segmented} role="group" aria-label="Pace">
      {PACES.map((p) => (
        <button key={p.id} type="button" aria-pressed={value === p.id} onClick={() => onChange(p.id)} title={p.hint}>{p.label}</button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- plan

function PlanView({ plan, onEdit }) {
  const { progress, replan, ctx } = useReplan();
  const catalogue = useCatalogue();
  const undoCount = useRunwayUndo();
  const today = todayKey();
  const stats = planStats(plan, progress, today);
  const todayDay = plan.days.find((d) => d.date === today);
  const before = today < plan.settings.start;
  const over = today > plan.settings.end;
  const pct = stats.total ? Math.round((stats.done / stats.total) * 100) : 0;
  const update = (fn) => setRunway((p) => (p ? fn(p) : p));
  // changes to the time available re-plan from today straight away
  const retime = (fn) => setRunway((p) => (p ? replan(fn(p)) : p));
  const spreadOnce = () => setRunway((p) => (p ? replan(p, { missed: 'spread' }) : p));
  const rebuild = (patch) => {
    const settings = { ...plan.settings, ...patch, start: today };
    setRunway(generatePlan(settings, catalogue, progress, keepOnRebuild(plan)));
  };

  return (
    <PageLayout>
      <section className={styles.hero}>
        <div className={styles.heroMain}>
          <p className={styles.heroKicker}><PlaneTakeoff size={14} aria-hidden="true" /> Runway</p>
          <p className={styles.heroBig}>
            {over ? 'Done' : stats.daysLeft === 0 ? 'Today' : <>{stats.daysLeft}<span> day{stats.daysLeft === 1 ? '' : 's'} to go</span></>}
          </p>
          {plan.settings.company && companyPlan(plan.settings.company) && (
            <Link to={`/companies/${plan.settings.company}`} className={styles.heroCompany}><Building2 size={14} aria-hidden="true" /> {companyPlan(plan.settings.company).name} plan</Link>
          )}
          <p className={styles.heroDate}>
            {over ? 'Your interview date has passed. Good luck, and set up a new runway for the next one.' : `Interview on ${fmtDay(plan.settings.end, { weekday: 'long', day: 'numeric', month: 'long' })}`}
          </p>
        </div>
        <div className={styles.heroSide}>
          <div className={styles.meter} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Plan completed">
            <span style={{ width: `${pct}%` }} />
          </div>
          <p className={styles.meterText}><strong>{pct}%</strong> of the plan done · {stats.done}/{stats.total} tasks · {hm(stats.minutesDone)} of {hm(stats.minutesTotal)}</p>
          <div className={styles.heroChips}>
            {!before && !over && <span className={styles.chipInfo}>Day {Math.max(1, stats.dayIndex)} of {stats.studyDays}</span>}
            {stats.behind > 0 ? <span className={styles.chipWarn}>{stats.behind} task{stats.behind === 1 ? '' : 's'} behind</span> : !before && <span className={styles.chipOk}>On track</span>}
            <span className={styles.chipInfo}>{PACES.find((p) => p.id === (plan.settings.pace ?? 'steady')).label} pace</span>
          </div>
          <div className={styles.heroActions}>
            <button type="button" className={`${ui.btn} ${ui.small}`} onClick={onEdit}><Settings2 size={13} /> Edit plan</button>
            {undoCount > 0 && <button type="button" className={`${ui.btn} ${ui.small}`} onClick={undoRunway} title="Undo your last change to the plan"><Undo2 size={13} /> Undo</button>}
            <button type="button" className={`${ui.btn} ${ui.ghost} ${ui.small} ${ui.danger}`} onClick={deletePlan}><Trash2 size={13} /> Delete plan</button>
          </div>
        </div>
      </section>

      {stats.overdue.length > 0 && !over && (
        <div className={styles.overdue}>
          <AlertTriangle size={18} aria-hidden="true" />
          <span><strong>{stats.overdue.length} unfinished task{stats.overdue.length === 1 ? '' : 's'}</strong> from earlier days. Runway {missedOf(plan.settings) === 'pile' ? 'adds them to your next study day' : 'spreads them over the coming days'} each morning; do it now, or pull them all into today.</span>
          <div className={styles.overdueActions}>
            <button type="button" className={`${ui.btn} ${ui.primary} ${ui.small}`} onClick={() => update(replan)}>Re-plan now</button>
            <button type="button" className={`${ui.btn} ${ui.small}`} onClick={() => update((p) => stats.overdue.reduce((acc, t) => moveTask(acc, t.id, today), p))} disabled={!todayDay}>Move to today</button>
          </div>
        </div>
      )}

      {!over && <TimeStrip plan={plan} today={today} retime={retime} />}

      <p className={ui.help}>Each day’s tasks also appear on <Link to="/today">Today</Link>, together with your Daily Coach session.</p>

      <div className={styles.columns}>
        <div className={styles.todayCol}>
          {before ? (
            <DayCard plan={plan} day={plan.days[0]} title={`Starts ${fmtDay(plan.days[0].date)}`} progress={progress} update={update} open />
          ) : todayDay ? (
            <DayCard plan={plan} day={todayDay} title="Today" progress={progress} update={update} onSpread={spreadOnce} open highlight />
          ) : (
            !over && <p className={ui.help}>No tasks for today.</p>
          )}
          {todayDay && plan.days.find((d) => d.date === addDays(today, 1)) && (
            <DayCard plan={plan} day={plan.days.find((d) => d.date === addDays(today, 1))} title="Tomorrow" progress={progress} update={update} />
          )}
        </div>
        <aside className={styles.sideCol}>
          {!over && <Forecast plan={plan} progress={progress} today={today} speed={ctx.speed} retime={retime} rebuild={rebuild} />}
          <Changes plan={plan} today={today} />
          <Breakdown plan={plan} progress={progress} />
          <Extras plan={plan} update={update} today={today} canAdd={Boolean(todayDay)} />
        </aside>
      </div>

      {!over && <Syllabus plan={plan} catalogue={catalogue} progress={progress} today={today} />}

      <FullPlan plan={plan} progress={progress} update={update} today={today} />
    </PageLayout>
  );
}

// ---- the next two weeks of study time, each day adjustable

const HOUR_CHOICES = [[0, 'Off'], [30, '30m'], [60, '1h'], [90, '1½h'], [120, '2h'], [180, '3h'], [240, '4h'], [360, '6h']];

function TimeStrip({ plan, today, retime }) {
  const [picked, setPicked] = useState([]);
  const days = plan.days.filter((d) => d.date >= today && d.phase !== 'interview').slice(0, 14);
  if (!days.length) return null;
  const s = plan.settings;
  const max = Math.max(240, ...days.map((d) => Math.max(capacityFor(s, d.date), d.tasks.reduce((n, t) => n + t.minutes, 0))));
  const toggle = (date) => setPicked((p) => (p.includes(date) ? p.filter((x) => x !== date) : [...p, date].sort()));
  const apply = (minutes) => { retime((p) => setCapacity(p, picked, minutes)); setPicked([]); };
  const changed = picked.some((d) => s.capacity?.[d] != null);
  const label = picked.length === 1 ? fmtDay(picked[0], { weekday: 'long', day: 'numeric', month: 'short' }) : `${picked.length} days`;
  return (
    <section className={`${styles.card} ${styles.timeCard}`}>
      <div className={styles.stripHead}>
        <h2 className={styles.cardTitle}><Clock3 size={14} aria-hidden="true" /> Your time, next two weeks</h2>
        <div className={styles.stripControls}>
          <div className={styles.stripPace}>
            <span className={styles.subLabel}>Pace</span>
            <PacePicker value={s.pace ?? 'steady'} onChange={(pace) => retime((p) => setPace(p, pace))} />
          </div>
          <div className={styles.stripPace}>
            <span className={styles.subLabel}>Missed a day?</span>
            <MissedPicker value={missedOf(s)} onChange={(missed) => retime((p) => ({ ...p, settings: { ...p.settings, missed } }))} />
          </div>
        </div>
      </div>
      <p className={styles.cardLead}>Busy day, trip or a free weekend? Tap the days (several if you like), then set the hours. The plan re-packs itself around them.</p>
      <div className={styles.strip} role="group" aria-label="Study time per day">
        {days.map((d) => {
          const cap = capacityFor(s, d.date);
          const planned = d.tasks.reduce((n, t) => n + t.minutes, 0);
          const own = s.capacity?.[d.date] != null;
          const on = picked.includes(d.date);
          return (
            <button
              key={d.date}
              type="button"
              className={`${styles.stripDay} ${on ? styles.stripOn : ''} ${d.date === today ? styles.stripToday : ''}`}
              aria-pressed={on}
              onClick={() => toggle(d.date)}
              title={`${fmtDay(d.date)}: ${cap ? `${hm(hoursFor(s, d.date))} available, ${hm(planned)} planned` : 'day off'}${own ? ' (your setting)' : ''}`}
            >
              <span className={styles.stripBar} aria-hidden="true">
                <span className={styles.stripCap} style={{ height: `${(cap / max) * 100}%` }} />
                <span className={styles.stripPlanned} style={{ height: `${(Math.min(planned, max) / max) * 100}%` }} />
              </span>
              <span className={styles.stripHours}>{cap ? hm(hoursFor(s, d.date)) : 'Off'}{own && <span className={styles.stripOwn} aria-label="your setting">•</span>}</span>
              <span className={styles.stripDate}>{d.date === today ? 'Today' : `${WEEKDAYS[parseDay(d.date).getDay()].slice(0, 2)} ${parseDay(d.date).getDate()}`}</span>
            </button>
          );
        })}
      </div>
      {picked.length > 0 && (
        <div className={styles.stripEdit}>
          <span><strong>{label}</strong>: hours to study</span>
          <div className={styles.segmented} role="group" aria-label="Hours">
            {HOUR_CHOICES.map(([m, l]) => <button key={m} type="button" onClick={() => apply(m)}>{l}</button>)}
          </div>
          {changed && <button type="button" className={`${ui.btn} ${ui.ghost} ${ui.small}`} onClick={() => apply(null)}>Back to usual</button>}
          <button type="button" className={`${ui.btn} ${ui.ghost} ${ui.small}`} onClick={() => setPicked([])}>Cancel</button>
        </div>
      )}
    </section>
  );
}

// ---- will the important material fit?

function Forecast({ plan, progress, today, speed, retime, rebuild }) {
  const f = forecast(plan, progress, today);
  if (!f.known && speed === 1) return null;
  const pct = f.coverage == null ? null : Math.round(f.coverage * 100);
  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}><Gauge size={14} aria-hidden="true" /> Forecast</h2>
      {pct != null && (
        <>
          <div className={styles.meter} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Core material planned before the interview">
            <span style={{ width: `${pct}%`, background: pct >= 100 ? 'var(--color-success)' : undefined }} />
          </div>
          <p className={styles.meterText}><strong>{pct}%</strong> of the core material fits before your interview.</p>
        </>
      )}
      {f.coreLeft > 0 ? (
        <>
          <p className={styles.cardLead}>{f.coreLeft} core lesson{f.coreLeft === 1 ? '' : 's'} and problem{f.coreLeft === 1 ? '' : 's'} ({hm(f.coreMinutes)}) don't fit yet. Any one of these closes most of the gap:</p>
          <div className={styles.fixes}>
            {f.suggestions.map((sg) => (
              sg.id === 'minutes' ? (
                <button key={sg.id} type="button" className={`${ui.btn} ${ui.small}`} onClick={() => retime((p) => addDailyMinutes(p, sg.minutes))}>Add {hm(sg.minutes)} a day</button>
              ) : sg.id === 'pace' ? (
                <button key={sg.id} type="button" className={`${ui.btn} ${ui.small}`} onClick={() => retime((p) => setPace(p, 'push'))}>Switch to Push pace</button>
              ) : (
                <button key={sg.id} type="button" className={`${ui.btn} ${ui.small}`} onClick={() => { if (window.confirm(`Move your interview date ${sg.days} day${sg.days === 1 ? '' : 's'} later and rebuild the plan from today? Finished, added and pinned tasks are kept.`)) rebuild({ end: addDays(plan.settings.end, sg.days) }); }}>Plan {sg.days} more day{sg.days === 1 ? '' : 's'}</button>
              )
            ))}
          </div>
        </>
      ) : f.known ? (
        <p className={styles.cardLead}>All core material is planned. {f.spare ? `${f.spare} more items wait in Spare time for days you get ahead.` : ''}</p>
      ) : null}
      {speed !== 1 && (
        <p className={styles.cardLead}>From your Climb attempts, problems take you about {speed}× our estimate, so planned problem times follow your pace.</p>
      )}
    </section>
  );
}

// ---- what re-planning changed

function Changes({ plan, today }) {
  const notes = [...(plan.notes ?? [])].reverse().slice(0, 5);
  if (!notes.length) return null;
  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}><History size={14} aria-hidden="true" /> What changed</h2>
      <ul className={styles.notes}>
        {notes.map((n, i) => <li key={`${n.date}-${i}`}><span className={styles.noteDay}>{relDay(n.date, today)}</span> {n.text}</li>)}
      </ul>
    </section>
  );
}

// ---- syllabus: Must / Normal / If time / Skip per pattern or module, and the order of DSA patterns

function Syllabus({ plan, catalogue, progress, today }) {
  const groups = useMemo(() => syllabusGroups(catalogue), [catalogue]);
  const s = plan.settings;
  const [open, setOpen] = useState(false);
  const [choices, setChoices] = useState(s.syllabus ?? {});
  const [order, setOrder] = useState(s.patternOrder ?? []);
  const company = s.company ? companyPlan(s.company) : null;
  const focus = company?.focus ?? [];
  const active = TRACKS.filter((t) => (s.mix[t.id] ?? 0) > 0);
  const dirty = JSON.stringify(choices) !== JSON.stringify(s.syllabus ?? {}) || JSON.stringify(order) !== JSON.stringify(s.patternOrder ?? []);
  const next = useMemo(
    () => (dirty ? generatePlan({ ...s, start: today, syllabus: choices, patternOrder: order }, catalogue, progress, keepOnRebuild(plan)) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dirty, choices, order, plan, catalogue, progress, today],
  );
  const diff = next ? diffPlans(plan, next, today) : null;
  // DSA patterns in the order the plan uses: the learner's own order, then the company's focus, then the course
  const patterns = groups.filter((g) => g.id.startsWith('p:'));
  const rank = (g) => {
    const p = g.id.slice(2);
    return order.includes(p) ? order.indexOf(p) : order.length + (focus.includes(p) ? focus.indexOf(p) : focus.length + patterns.indexOf(g) / 1000);
  };
  const shown = (track) => (track === 'dsa' ? [...groups.filter((g) => g.track === 'dsa' && !g.id.startsWith('p:')), ...[...patterns].sort((a, b) => rank(a) - rank(b))] : groups.filter((g) => g.track === track));
  const move = (g, delta) => {
    const list = [...patterns].sort((a, b) => rank(a) - rank(b)).map((x) => x.id.slice(2));
    const i = list.indexOf(g.id.slice(2));
    const j = i + delta;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    setOrder(list);
  };
  const choose = (id, c) => setChoices((x) => {
    const out = { ...x };
    if (c === 'normal') delete out[id]; else out[id] = c;
    return out;
  });
  const marked = Object.keys(s.syllabus ?? {}).length;

  return (
    <section className={styles.syllabus}>
      <button type="button" className={styles.syllabusHead} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <ListChecks size={18} aria-hidden="true" />
        <span>
          <strong>Syllabus</strong>
          <span className={styles.syllabusSub}>Mark topics Must, If time or Skip, and put DSA patterns in your own order. {marked ? `${marked} marked.` : ''}</span>
        </span>
        {open ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
      </button>
      {open && (
        <div className={styles.syllabusBody}>
          {active.map((t) => (
            <div key={t.id} className={styles.sylTrack}>
              <h3 className={styles.sylTrackTitle}><span className={`${styles.dot} ${styles[`t_${t.id}`]}`} aria-hidden="true" /> {t.label}</h3>
              <ul className={styles.sylList}>
                {shown(t.id).map((g) => {
                  const c = choices[g.id] ?? 'normal';
                  const isPattern = g.id.startsWith('p:');
                  return (
                    <li key={g.id} className={`${styles.sylRow} ${c === 'skip' ? styles.sylSkip : ''}`}>
                      <span className={styles.sylName}>
                        {g.title}
                        <span className={styles.sylMeta}>{isPattern ? (focus.includes(g.id.slice(2)) ? `${company.name} focus` : 'Pattern') : `${g.course} · ${g.lessons} lesson${g.lessons === 1 ? '' : 's'}`}</span>
                      </span>
                      {isPattern && (
                        <span className={styles.sylMove}>
                          <button type="button" onClick={() => move(g, -1)} aria-label={`Move ${g.title} earlier`}><ArrowUp size={13} /></button>
                          <button type="button" onClick={() => move(g, 1)} aria-label={`Move ${g.title} later`}><ArrowDown size={13} /></button>
                        </span>
                      )}
                      <span className={`${styles.segmented} ${styles.sylChoice}`} role="group" aria-label={`Priority for ${g.title}`}>
                        {PRIORITIES.map((p) => <button key={p.id} type="button" aria-pressed={c === p.id} onClick={() => choose(g.id, p.id)}>{p.label}</button>)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          {dirty && (
            <div className={styles.sylApply}>
              <DiffNote diff={diff} />
              <button type="button" className={`${ui.btn} ${ui.primary} ${ui.small}`} onClick={() => { setRunway(next); }}>Apply to my plan</button>
              <button type="button" className={`${ui.btn} ${ui.ghost} ${ui.small}`} onClick={() => { setChoices(s.syllabus ?? {}); setOrder(s.patternOrder ?? []); }}>Discard</button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export function DayCard({ plan, day, title, progress, update, onSpread, open: startOpen = false, highlight = false }) {
  const [open, setOpen] = useState(startOpen);
  const [adding, setAdding] = useState(false);
  const budget = day.phase === 'interview' ? 30 : capacityFor(plan.settings, day.date);
  const minutes = day.tasks.reduce((s, t) => s + t.minutes, 0);
  // work carried from earlier days on top of this day's own: how much time the whole list needs
  const isToday = day.date === todayKey();
  const left = day.tasks.filter((t) => !isTaskDone(plan, t, progress));
  const carried = left.filter((t) => t.carried && t.carried < day.date);
  const needed = left.reduce((s, t) => s + t.minutes, 0);
  const spent = day.tasks.filter((t) => isTaskDone(plan, t, progress)).reduce((s, t) => s + t.minutes, 0);
  const short = needed - Math.max(0, budget - spent);
  // shown where the page offers spreading (the main Today card), not again in the week view
  const backlog = Boolean(onSpread) && isToday && day.phase !== 'interview' && carried.length > 0 && short > 10;
  // the hours the learner would give, in quarter hours: the pace plans only a share of them (Light 80%)
  const factor = PACES.find((p) => p.id === (plan.settings.pace ?? 'steady'))?.factor ?? 1;
  const give = Math.ceil((spent + needed) / factor / 15) * 15;
  const done = day.tasks.filter((t) => isTaskDone(plan, t, progress)).length;
  const all = day.tasks.length > 0 && done === day.tasks.length;
  const own = plan.settings.capacity?.[day.date] != null;
  return (
    <section className={`${styles.day} ${highlight ? styles.dayToday : ''} ${all ? styles.dayDone : ''}`}>
      <button type="button" className={styles.dayHead} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className={styles.dayTitle}>
          {title ?? fmtDay(day.date)}
          {title && <span className={styles.dayDate}>{fmtDay(day.date)}</span>}
        </span>
        <span className={`${styles.phase} ${styles[`ph_${day.phase}`]}`}>{own && day.phase === 'rest' && budgetFor(plan.settings, day.date) > 0 ? 'Day off' : PHASE[day.phase]}</span>
        <span className={styles.dayMeta}>
          {day.tasks.length > 0 && <>{done}/{day.tasks.length} · {hm(minutes)}{budget > 0 && day.phase !== 'interview' ? ` of ${hm(budget)}` : ''}</>}
        </span>
        {all && <Check size={16} className={styles.dayCheck} aria-label="All done" />}
        {open ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
      </button>
      {open && backlog && (
        <div className={styles.backlog} role="status">
          <AlertTriangle size={16} aria-hidden="true" />
          <span>
            <strong>Today needs about {hm(needed)}</strong> to finish: {hm(needed - carried.reduce((s, t) => s + t.minutes, 0))} of today's plan
            {' '}plus {hm(carried.reduce((s, t) => s + t.minutes, 0))} carried from earlier days ({carried.length} task{carried.length === 1 ? '' : 's'}).
            {' '}That's <strong>{hm(short)} more</strong> than the time you have left today.
          </span>
          <div className={styles.backlogActions}>
            <button type="button" className={`${ui.btn} ${ui.primary} ${ui.small}`} onClick={() => update((p) => setCapacity(p, [day.date], give))}>
              I'll give today {hm(give)}
            </button>
            {onSpread && <button type="button" className={`${ui.btn} ${ui.small}`} onClick={onSpread} title="Re-plan once: unfinished work first, every day kept to its hours">Spread it over the coming days</button>}
          </div>
        </div>
      )}
      {open && (
        <div className={styles.dayBody}>
          {day.phase === 'rest' && !day.tasks.length && <p className={styles.rest}><Coffee size={15} aria-hidden="true" /> {own ? 'Day off, as you set it.' : 'Rest day. Recharging is part of the plan.'}</p>}
          <ol className={styles.tasks}>
            {day.tasks.map((t, i) => (
              <TaskRow key={t.id} plan={plan} day={day} task={t} first={i === 0} last={i === day.tasks.length - 1} progress={progress} update={update} />
            ))}
          </ol>
          {adding ? (
            <AddTask onAdd={(title, min) => { update((p) => addCustomTask(p, day.date, title, min)); setAdding(false); }} onCancel={() => setAdding(false)} />
          ) : (
            day.phase !== 'interview' && <button type="button" className={styles.addBtn} onClick={() => setAdding(true)}><Plus size={13} /> Add a task</button>
          )}
        </div>
      )}
    </section>
  );
}

function TaskRow({ plan, day, task, first, last, progress, update }) {
  const [menu, setMenu] = useState(false);
  const choose = useSwapChooser();
  const done = isTaskDone(plan, task, progress);
  const auto = (task.kind === 'lesson' && progress.isComplete(task.ref)) || (task.kind === 'problem' && progress.isSolved(task.ref));
  const pinned = plan.pins?.[task.id] === day.date;
  const today = todayKey();
  const targets = plan.days.filter((d) => d.date !== day.date && d.date >= today && d.phase !== 'interview');
  const toSpare = task.kind === 'lesson' || task.kind === 'problem';
  const act = (fn) => { update(fn); setMenu(false); };
  const label = task.path ? (
    <Link to={task.path} className={styles.taskTitle}>{task.title}</Link>
  ) : task.href ? (
    <a href={task.href} target="_blank" rel="noopener noreferrer" className={styles.taskTitle}>{task.title} <ExternalLink size={11} /></a>
  ) : <span className={styles.taskTitle}>{task.title}</span>;
  const notes = [
    task.why,
    task.carried && task.carried < day.date && !done ? `from ${fmtDay(task.carried)}` : null,
  ].filter(Boolean);
  return (
    <li className={`${styles.task} ${done ? styles.taskDone : ''}`}>
      <input
        type="checkbox"
        className={styles.check}
        checked={done}
        disabled={auto}
        title={auto ? 'Completed on the site' : 'Mark done'}
        onChange={(e) => update((p) => toggleDone(p, task.id, e.target.checked))}
        aria-label={`Done: ${task.title}`}
      />
      <span className={`${styles.dot} ${styles[`t_${task.track}`] ?? ''}`} aria-hidden="true" />
      <span className={styles.taskBody}>
        <span className={styles.taskLine}>{label}{pinned && <Pin size={12} className={styles.pinIcon} aria-label="Pinned to this day" />}</span>
        <span className={styles.taskSub}>
          {kindLabel(task)}{task.sub ? ` · ${task.sub}` : ''}
          {notes.length > 0 && <span className={styles.why}> · {notes.join(' · ')}</span>}
        </span>
      </span>
      <span className={styles.taskMin}>{hm(task.minutes)}</span>
      <button type="button" className={styles.more} onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-label="Task options"><MoreHorizontal size={16} /></button>
      {menu && (
        <div className={styles.menu}>
          <button type="button" disabled={first} onClick={() => update((p) => reorderTask(p, day.date, task.id, -1))}><ArrowUp size={13} /> Up</button>
          <button type="button" disabled={last} onClick={() => update((p) => reorderTask(p, day.date, task.id, 1))}><ArrowDown size={13} /> Down</button>
          {!done && day.phase !== 'interview' && (
            <button type="button" onClick={() => act((p) => pinTask(p, task.id, !pinned))} title={pinned ? 'Let re-planning move it again' : 'Keep it on this day when the plan re-plans'}>
              {pinned ? <><PinOff size={13} /> Unpin</> : <><Pin size={13} /> Pin to this day</>}
            </button>
          )}
          {!done && day.date >= today && day.phase !== 'interview' && <button type="button" onClick={() => act((p) => snoozeTask(p, task.id))}><Clock3 size={13} /> Next study day</button>}
          {!done && task.kind === 'problem' && <button type="button" onClick={() => act((p) => swapTask(p, task.id, choose))} title="Another problem from the same ladder"><Shuffle size={13} /> Swap problem</button>}
          <label className={styles.moveTo}>
            <CalendarDays size={13} aria-hidden="true" />
            <select value="" onChange={(e) => { if (e.target.value) act((p) => moveTask(p, task.id, e.target.value)); }} aria-label="Move to another day">
              <option value="">Move to…</option>
              {targets.map((d) => <option key={d.date} value={d.date}>{d.date === today ? 'Today' : d.date === addDays(today, 1) ? 'Tomorrow' : fmtDay(d.date)}{d.phase === 'rest' ? ' (rest day)' : ''}</option>)}
            </select>
          </label>
          <button type="button" onClick={() => act((p) => removeTask(p, task.id))}>{toSpare ? <><Archive size={13} /> To spare time</> : <><Trash2 size={13} /> Remove</>}</button>
        </div>
      )}
    </li>
  );
}

const kindLabel = (t) => ({ lesson: 'Lesson', problem: 'Problem', mock: 'Mock interview', review: 'Review', revise: 'Revise', warmup: 'Warm-up', guide: 'Company guide', custom: 'Your task' }[t.kind] ?? t.kind);

function AddTask({ onAdd, onCancel }) {
  const [title, setTitle] = useState('');
  const [min, setMin] = useState(30);
  return (
    <form className={styles.addForm} onSubmit={(e) => { e.preventDefault(); if (title.trim()) onAdd(title, min); }}>
      <input className={ui.input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Revise my resume projects, LeetCode contest…" autoFocus maxLength={140} aria-label="Task" />
      <select className={ui.select} value={min} onChange={(e) => setMin(Number(e.target.value))} aria-label="Minutes">
        {[15, 30, 45, 60, 90, 120].map((m) => <option key={m} value={m}>{hm(m)}</option>)}
      </select>
      <button type="submit" className={`${ui.btn} ${ui.primary} ${ui.small}`} disabled={!title.trim()}>Add</button>
      <button type="button" className={`${ui.btn} ${ui.ghost} ${ui.small}`} onClick={onCancel}>Cancel</button>
    </form>
  );
}

function Breakdown({ plan, progress }) {
  const rows = TRACKS.map((t) => {
    const tasks = plan.days.flatMap((d) => d.tasks).filter((x) => x.track === t.id);
    const done = tasks.filter((x) => isTaskDone(plan, x, progress));
    return { ...t, total: tasks.length, done: done.length, minutes: tasks.reduce((s, x) => s + x.minutes, 0) };
  }).filter((r) => r.total);
  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>By track</h2>
      <ul className={styles.tracks}>
        {rows.map((r) => (
          <li key={r.id}>
            <span className={styles.trackName}><span className={`${styles.dot} ${styles[`t_${r.id}`]}`} aria-hidden="true" /> {r.label}</span>
            <span className={styles.trackNum}>{r.done}/{r.total} · {hm(r.minutes)}</span>
            <span className={styles.trackBar}><span className={styles[`t_${r.id}`]} style={{ width: `${r.total ? (r.done / r.total) * 100 : 0}%` }} /></span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Extras({ plan, update, today, canAdd }) {
  const [open, setOpen] = useState(false);
  if (!plan.extras.length) return null;
  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}><Sparkles size={14} aria-hidden="true" /> Spare time?</h2>
      <p className={styles.cardLead}>{plan.extras.length} more lessons and problems that didn't fit, most useful first. Ahead of plan? Pull one into today.</p>
      <ul className={styles.extras}>
        {plan.extras.slice(0, open ? 40 : 5).map((t) => (
          <li key={t.id}>
            <span className={`${styles.dot} ${styles[`t_${t.track}`] ?? ''}`} aria-hidden="true" />
            <span className={styles.extraTitle} title={t.why}>{t.path ? <Link to={t.path}>{t.title}</Link> : t.href ? <a href={t.href} target="_blank" rel="noopener noreferrer">{t.title}</a> : t.title}</span>
            <span className={styles.taskMin}>{hm(t.minutes)}</span>
            {canAdd && <button type="button" className={styles.pull} onClick={() => update((p) => moveTask(p, t.id, today))} title="Add to today" aria-label={`Add ${t.title} to today`}><Plus size={13} /></button>}
          </li>
        ))}
      </ul>
      {plan.extras.length > 5 && <button type="button" className={styles.addBtn} onClick={() => setOpen((o) => !o)}>{open ? 'Show fewer' : `Show ${Math.min(40, plan.extras.length) - 5} more`}</button>}
    </section>
  );
}

function FullPlan({ plan, progress, update, today }) {
  // weeks of the plan; the current week opens by default
  const weeks = [];
  plan.days.forEach((d, i) => {
    const w = Math.floor(i / 7);
    (weeks[w] ??= []).push(d);
  });
  const currentWeek = Math.max(0, weeks.findIndex((w) => w.some((d) => d.date === today)));
  const [openWeek, setOpenWeek] = useState(currentWeek);
  return (
    <section className={styles.full}>
      <h2 className={styles.fullTitle}>The whole plan</h2>
      <div className={styles.weekTabs} role="tablist">
        {weeks.map((w, i) => {
          const tasks = w.flatMap((d) => d.tasks);
          const done = tasks.filter((t) => isTaskDone(plan, t, progress)).length;
          return (
            <button key={w[0].date} type="button" role="tab" aria-selected={openWeek === i} className={`${styles.weekTab} ${openWeek === i ? styles.weekTabOn : ''}`} onClick={() => setOpenWeek(i)}>
              <span>Week {i + 1}</span>
              <span className={styles.weekSub}>{fmtDay(w[0].date, { day: 'numeric', month: 'short' })} · {done}/{tasks.length}</span>
            </button>
          );
        })}
      </div>
      <div className={styles.weekDays}>
        {(weeks[openWeek] ?? []).map((d) => (
          <DayCard key={d.date} plan={plan} day={d} progress={progress} update={update} highlight={d.date === today} open={d.date === today} />
        ))}
      </div>
    </section>
  );
}
