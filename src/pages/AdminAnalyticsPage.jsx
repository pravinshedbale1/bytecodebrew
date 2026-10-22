import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { BarChart3, RefreshCw, Eye, ArrowLeft, Users, Activity, Sparkles, BookOpen, Code2, Brain, Mountain, Download } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { useAccess } from '../hooks/useAccess';
import { loadFirebase } from '../lib/firebase';
import { listRegisteredUsers } from '../lib/payments';
import { aggregate, loadUsage, FEATURES } from '../lib/analytics';
import { viewAsHref } from '../lib/viewAs';
import { getLessonContext, getCourse } from '../curriculum';
import { catalog, patternOf } from '../lib/coach/catalog';
import { PATTERNS } from '../lib/coach/patterns';
import { calibrate, replay } from '../lib/climb/model';
import { seeds, ratings } from '../lib/climb/store';
import { NotFoundPage } from './NotFoundPage';
import ui from '../components/common/ui.module.css';
import page from './Page.module.css';
import styles from './AdminAnalyticsPage.module.css';

const pct = (n, d) => (d ? Math.round((n / d) * 100) : 0);
const lessonTitle = (key) => {
  const [t, c, l] = key.split('/');
  return getLessonContext(t, c, l)?.lesson?.title ?? key;
};
const topicTitle = (topic) => {
  const [t, c] = topic.split('/');
  return getCourse(t, c)?.title ?? topic;
};
const short = (day) => { const [, m, d] = day.split('-'); return `${Number(d)}/${Number(m)}`; };

/** A cell shaded by how big its value is against the largest in its table. */
function Heat({ value, max, title }) {
  const a = max ? Math.max(0.06, value / max) : 0;
  return (
    <td className={styles.heat} title={title} style={{ '--a': value ? a : 0 }}>
      {value || <span className={styles.zero}>·</span>}
    </td>
  );
}

/** /admin/analytics — who uses what: features, lessons, topics, problems, most active learners. */
export function AdminAnalyticsPage() {
  const { status, isAdmin } = useAccess();
  const [raw, setRaw] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [limit, setLimit] = useState(25);

  const load = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const fb = await loadFirebase();
      setRaw(await loadUsage({ fb, listUsers: listRegisteredUsers }));
    } catch (e) {
      setError(`Could not load usage: ${e.code ?? e.message}. Are the latest Firestore rules published?`);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => { if (isAdmin) load(); }, [isAdmin, load]);
  const r = useMemo(() => (raw ? aggregate({ ...raw, patternOf, now: new Date() }) : null), [raw]);

  if (status === 'loading') return <PageLayout><p className={styles.muted}>Checking access…</p></PageLayout>;
  if (!isAdmin) return <NotFoundPage />;

  const maxDaily = r ? Math.max(1, ...r.daily.map((d) => d.users)) : 1;
  const top = r ? r.people.filter((p) => p.actions30 > 0).slice(0, limit) : [];
  const maxCell = Math.max(1, ...top.flatMap((p) => FEATURES.map((f) => p.counts[f.id])));
  const maxWeek = r ? Math.max(1, ...r.weeks.flatMap((w) => FEATURES.map((f) => w[f.id]))) : 1;

  return (
    <PageLayout contentWidth="1180px">
      <header className={page.header}>
        <p className={page.eyebrow}><Link to="/admin" className={styles.back}><ArrowLeft size={13} aria-hidden="true" /> Admin</Link></p>
        <h1 className={page.title}>Usage analytics</h1>
        <p className={page.lead}>
          Who uses what, from learners’ own study data (no trackers).{' '}
          {r && <span className={styles.muted}>Computed {new Date(r.computedAt).toLocaleString()} · {raw.reads} documents read.</span>}
        </p>
        <button type="button" className={`${ui.btn} ${ui.small}`} onClick={load} disabled={busy}><RefreshCw size={13} /> {busy ? 'Loading…' : 'Refresh'}</button>
      </header>
      {error && <p className={ui.error} role="alert">{error}</p>}
      {!r && !error && <p className={styles.muted}>Loading usage…</p>}

      {r && (
        <>
          <section className={styles.tiles} aria-label="Totals">
            {[
              ['Registered', r.totals.registered, Users],
              ['Active today', r.totals.active1, Activity],
              ['Active this week', r.totals.active7, Activity],
              ['Active in 30 days', r.totals.active30, Activity],
              ['Premium', r.totals.premium, Sparkles],
            ].map(([label, n, Icon]) => (
              <div key={label} className={styles.tile}>
                <span className={styles.tileLabel}><Icon size={13} aria-hidden="true" /> {label}</span>
                <strong>{n}</strong>
              </div>
            ))}
          </section>

          <section className={ui.panel}>
            <h2 className={ui.panelTitle}>Daily active learners, last 30 days</h2>
            <div className={styles.bars} role="img" aria-label={`Daily active learners; today ${r.daily.at(-1).users}`}>
              {r.daily.map((d) => (
                <div key={d.day} className={styles.barCol} title={`${d.day}: ${d.users} active`}>
                  <span className={styles.barVal}>{d.users || ''}</span>
                  <span className={styles.bar} style={{ height: `${(d.users / maxDaily) * 100}%` }} />
                  <span className={styles.barDay}>{short(d.day)}</span>
                </div>
              ))}
            </div>
          </section>

          <section className={ui.panel}>
            <h2 className={ui.panelTitle}>Features: who uses what</h2>
            <p className={styles.muted}>From the daily activity each learner records. Share = learners who used it out of everyone active in the last 30 days ({r.totals.active30}).</p>
            <table className={styles.table}>
              <thead><tr><th>Feature</th><th>Learners, 30 days</th><th>Learners, 7 days</th><th>Actions, 30 days</th><th>Share of active</th></tr></thead>
              <tbody>
                {[...r.features].sort((a, b) => b.users30 - a.users30).map((f) => (
                  <tr key={f.id}>
                    <td>{f.label}</td><td>{f.users30}</td><td>{f.users7}</td><td>{f.actions30}</td>
                    <td><span className={styles.meter}><span style={{ width: `${pct(f.users30, r.totals.active30)}%` }} /></span> {pct(f.users30, r.totals.active30)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h3 className={styles.h3}>Set up at least once</h3>
            <ul className={styles.chips}>
              {r.setups.map((s) => <li key={s.label}>{s.label} <strong>{s.users}</strong></li>)}
            </ul>
          </section>

          <section className={ui.panel}>
            <div className={styles.head}>
              <h2 className={ui.panelTitle}>Most active learners × features, last 30 days</h2>
              <label className={styles.muted}>Show <select className={ui.select} value={limit} onChange={(e) => setLimit(Number(e.target.value))}>{[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}</select></label>
            </div>
            {top.length === 0 ? <p className={styles.muted}>No activity in the last 30 days.</p> : (
              <div className={styles.scroll}>
                <table className={`${styles.table} ${styles.matrix}`}>
                  <thead>
                    <tr><th>Learner</th>{FEATURES.map((f) => <th key={f.id} className={styles.rot}><span>{f.label}</span></th>)}<th>Total</th><th>Active days</th><th>Last active</th><th aria-label="View as" /></tr>
                  </thead>
                  <tbody>
                    {top.map((p) => (
                      <tr key={p.uid}>
                        <td className={styles.who}><strong>{p.name || p.email || p.uid.slice(0, 8)}</strong>{p.premium && <span className={styles.pro}>Premium</span>}<span className={styles.muted}>{p.name ? p.email : ''}</span></td>
                        {FEATURES.map((f) => <Heat key={f.id} value={p.counts[f.id]} max={maxCell} title={`${f.label}: ${p.counts[f.id]}`} />)}
                        <td><strong>{p.actions30}</strong></td>
                        <td>{p.days30}</td>
                        <td className={styles.nowrap}>{p.lastDay ?? '—'}</td>
                        <td><a href={viewAsHref(p)} target="_blank" rel="noopener noreferrer" className={`${ui.btn} ${ui.ghost} ${ui.small}`} title="View as this learner (read-only, new tab)" aria-label={`View as ${p.name || p.email}`}><Eye size={14} /></a></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className={ui.panel}>
            <h2 className={ui.panelTitle}>Features × weeks (actions)</h2>
            <div className={styles.scroll}>
              <table className={`${styles.table} ${styles.matrix}`}>
                <thead><tr><th>Feature</th>{r.weeks.map((w) => <th key={w.week} className={styles.nowrap}>wk {short(w.week)}</th>)}</tr></thead>
                <tbody>
                  {FEATURES.map((f) => (
                    <tr key={f.id}><td>{f.label}</td>{r.weeks.map((w) => <Heat key={w.week} value={w[f.id]} max={maxWeek} title={`${f.label}, week of ${w.week}: ${w[f.id]}`} />)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className={styles.grid2}>
            <section className={ui.panel}>
              <h2 className={ui.panelTitle}><BookOpen size={15} aria-hidden="true" /> Topics by learners</h2>
              <table className={styles.table}>
                <thead><tr><th>Topic</th><th>Learners</th><th>Completions</th><th>Lessons touched</th></tr></thead>
                <tbody>{r.topics.map((t) => <tr key={t.topic}><td>{topicTitle(t.topic)}</td><td>{t.learners}</td><td>{t.completions}</td><td>{t.lessons}</td></tr>)}</tbody>
              </table>
              <h3 className={styles.h3}>Most completed lessons</h3>
              <ol className={styles.rank}>{r.lessons.slice(0, 12).map((l) => <li key={l.key}><span>{lessonTitle(l.key)}</span><strong>{l.users}</strong></li>)}</ol>
            </section>
            <section className={ui.panel}>
              <h2 className={ui.panelTitle}><BookOpen size={15} aria-hidden="true" /> Hardest quick checks</h2>
              <p className={styles.muted}>Lessons whose quick checks are answered right first time least often (5+ answers).</p>
              {r.hardest.length === 0 ? <p className={styles.muted}>Not enough answers yet.</p> : (
                <table className={styles.table}>
                  <thead><tr><th>Lesson</th><th>Right first try</th><th>Answers</th></tr></thead>
                  <tbody>{r.hardest.slice(0, 12).map((q) => <tr key={q.key}><td>{lessonTitle(q.key)}</td><td>{Math.round(q.accuracy * 100)}%</td><td>{q.answers}</td></tr>)}</tbody>
                </table>
              )}
            </section>
            <section className={ui.panel}>
              <h2 className={ui.panelTitle}><Code2 size={15} aria-hidden="true" /> Most solved problems</h2>
              <p className={styles.muted}>Solved by passing the tests here {r.sources.tests}, on LeetCode {r.sources.leetcode}, ticked by hand {r.sources.self}.</p>
              <ol className={styles.rank}>{r.problems.slice(0, 12).map((p) => <li key={p.slug}><span>{catalog.problems[p.slug]?.title ?? p.slug}</span><strong>{p.users}</strong></li>)}</ol>
              <h3 className={styles.h3}>Solves by pattern</h3>
              <ol className={styles.rank}>{r.patterns.slice(0, 10).map((p) => <li key={p.pattern}><span>{PATTERNS[p.pattern]?.name ?? p.pattern}</span><strong>{p.solves}</strong></li>)}</ol>
            </section>
            <section className={ui.panel}>
              <h2 className={ui.panelTitle}><Brain size={15} aria-hidden="true" /> Patterns learners confuse</h2>
              <p className={styles.muted}>Daily Coach recognition drills, lowest accuracy first (5+ drills).</p>
              {r.confused.length === 0 ? <p className={styles.muted}>Not enough drills yet.</p> : (
                <table className={styles.table}>
                  <thead><tr><th>Pattern</th><th>Recognised</th><th>Drills</th></tr></thead>
                  <tbody>{r.confused.slice(0, 12).map((c) => <tr key={c.pattern}><td>{PATTERNS[c.pattern]?.name ?? c.pattern}</td><td>{Math.round(c.accuracy * 100)}%</td><td>{c.total}</td></tr>)}</tbody>
                </table>
              )}
            </section>
            <ClimbRatings docs={raw.docs} />
          </div>
        </>
      )}
      <p className={styles.note}><BarChart3 size={13} aria-hidden="true" /> Each refresh reads every learner’s study documents once. At a few thousand learners this belongs in a nightly summary instead.</p>
    </PageLayout>
  );
}

/**
 * Climb's problem ratings, recalibrated from every learner's rated attempts. Download the file and
 * commit it as src/data/climbRatings.json; ratings are then the same for everyone after the next deploy.
 */
function ClimbRatings({ docs }) {
  const users = Object.values(docs).map((d) => d.climb?.events ?? []).filter((e) => e.length);
  const result = useMemo(() => calibrate({ users, seeds }), [docs]); // eslint-disable-line react-hooks/exhaustive-deps
  const attempts = users.reduce((n, e) => n + e.length, 0);
  const rated = users.map((e) => replay(e)).filter((m) => m.n >= 10);
  const changes = Object.entries(result).map(([slug, r]) => ({ slug, r, was: ratings[slug] ?? seeds[slug] })).filter((c) => c.r !== c.was).sort((a, b) => Math.abs(b.r - b.was) - Math.abs(a.r - a.was));
  const download = () => {
    const sorted = Object.fromEntries(Object.entries(result).sort(([a], [b]) => a.localeCompare(b)));
    const url = URL.createObjectURL(new Blob([`${JSON.stringify(sorted, null, 2)}\n`], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'climbRatings.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <section className={ui.panel}>
      <h2 className={ui.panelTitle}><Mountain size={15} aria-hidden="true" /> Climb ratings</h2>
      <p className={styles.muted}>
        {users.length} learner{users.length === 1 ? '' : 's'} · {attempts} rated attempts · {rated.length} with 10+ (median rating {rated.length ? rated.map((m) => m.rating).sort((a, b) => a - b)[Math.floor(rated.length / 2)] : '–'}).
        {' '}Problems with 8+ attempts get a rating fitted to how learners really did, pulled towards the current one while evidence is thin.
      </p>
      {changes.length === 0 ? <p className={styles.muted}>No problem has enough attempts to change yet.</p> : (
        <>
          <table className={styles.table}>
            <thead><tr><th>Problem</th><th>Now</th><th>Fitted</th></tr></thead>
            <tbody>{changes.slice(0, 12).map((c) => <tr key={c.slug}><td>{catalog.problems[c.slug]?.title ?? c.slug}</td><td>{c.was}</td><td>{c.r}</td></tr>)}</tbody>
          </table>
          <p className={styles.muted}>Download the file, replace src/data/climbRatings.json with it and deploy. npm run check validates it.</p>
          <button type="button" className={`${ui.btn} ${ui.small}`} onClick={download}><Download size={13} aria-hidden="true" /> Download climbRatings.json ({Object.keys(result).length} problems)</button>
        </>
      )}
    </section>
  );
}
