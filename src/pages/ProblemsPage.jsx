import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ExternalLink, Info, Download } from 'lucide-react';
import ladderData from 'virtual:dsa-ladders';
import { PageLayout, RailCard } from '../components/layout/PageLayout';
import { SolvedToggle } from '../components/mdx/SolvedToggle';
import { dsa } from '../curriculum/tracks/dsa';
import { useSolved } from '../hooks/useSolved';
import { hasProblem } from '../lib/judge/problems';
import ui from '../components/common/ui.module.css';
import page from './Page.module.css';
import styles from './ProblemsPage.module.css';

const LEVELS = ['Easy', 'Medium', 'Hard'];
const SOURCE_SHORT = { tests: 'tests passed', leetcode: 'on LeetCode', self: 'ticked' };

/** Every ladder problem, in pattern order, once each (a problem can appear in several ladders). */
function allProblems() {
  const course = dsa.courses.find((c) => c.id === 'patterns');
  const seen = new Set();
  const groups = [];
  for (const m of course.modules) {
    for (const l of m.lessons) {
      const problems = (ladderData[l.id] ?? []).filter((p) => !seen.has(p.slug) && seen.add(p.slug));
      if (problems.length) groups.push({ id: l.id, title: l.title, module: m.title, problems });
    }
  }
  return groups;
}

/** /problems — the place to pick a problem and solve it with tests. */
export function ProblemsPage() {
  const groups = useMemo(allProblems, []);
  const { isSolved, solvedBy } = useSolved();
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('all');
  const [status, setStatus] = useState('all');
  const [pattern, setPattern] = useState('all');

  const all = groups.flatMap((g) => g.problems);
  const done = all.filter((p) => isSolved(p.slug));
  const verified = done.filter((p) => solvedBy(p.slug) !== 'self').length;

  const q = query.trim().toLowerCase();
  const shown = groups
    .filter((g) => pattern === 'all' || g.id === pattern)
    .map((g) => ({
      ...g,
      problems: g.problems.filter((p) =>
        (level === 'all' || p.level === level) &&
        (status === 'all' || (status === 'solved') === isSolved(p.slug)) &&
        (!q || p.title.toLowerCase().includes(q))),
    }))
    .filter((g) => g.problems.length);
  const count = shown.reduce((n, g) => n + g.problems.length, 0);

  const rail = (
    <>
      <RailCard title="Your progress">
        <p className={styles.big}>{done.length}<span> / {all.length}</span></p>
        <ul className={styles.levels}>
          {LEVELS.map((lv) => {
            const list = all.filter((p) => p.level === lv);
            return <li key={lv}><span className={styles[lv.toLowerCase()]}>{lv}</span> {list.filter((p) => isSolved(p.slug)).length}/{list.length}</li>;
          })}
        </ul>
        <p className={ui.help}>{verified} verified by tests or LeetCode.</p>
      </RailCard>
      <RailCard title="The checkmarks" icon={<Info size={14} aria-hidden="true" />}>
        <ul className={styles.legend}>
          <li><span className={`${styles.mark} ${styles.markOn}`} /> Verified: passed all tests here, or accepted on LeetCode</li>
          <li><span className={`${styles.mark} ${styles.markSelf}`} /> Ticked by you</li>
        </ul>
      </RailCard>
      <RailCard title="Solved on LeetCode already?" icon={<Download size={14} aria-hidden="true" />}>
        <p className={ui.help} style={{ marginTop: 0 }}>Import every problem you've solved there in one click.</p>
        <Link to="/dashboard" className={`${ui.btn} ${ui.small}`} style={{ marginTop: 'var(--space-3)' }}>Import from LeetCode</Link>
      </RailCard>
    </>
  );

  return (
    <PageLayout rail={rail}>
      <header className={page.header}>
        <p className={page.eyebrow}>Practise</p>
        <h1 className={page.title}>Problems</h1>
        <p className={page.lead}>
          Every problem from the DSA pattern ladders, in learning order. Open one to solve it here with starter code and tests;
          passing them all marks it solved.
        </p>
      </header>

      <div className={styles.filters}>
        <input className={`${ui.input} ${styles.search}`} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter by name…" aria-label="Filter problems by name" />
        <div className={ui.chips} role="group" aria-label="Difficulty">
          {['all', ...LEVELS].map((lv) => (
            <button key={lv} type="button" className={ui.chip} aria-pressed={level === lv} onClick={() => setLevel(lv)}>{lv === 'all' ? 'Any level' : lv}</button>
          ))}
        </div>
        <div className={ui.chips} role="group" aria-label="Status">
          {[['all', 'All'], ['unsolved', 'Unsolved'], ['solved', 'Solved']].map(([id, label]) => (
            <button key={id} type="button" className={ui.chip} aria-pressed={status === id} onClick={() => setStatus(id)}>{label}</button>
          ))}
        </div>
        <select className={`${ui.select} ${styles.pattern}`} value={pattern} onChange={(e) => setPattern(e.target.value)} aria-label="Pattern">
          <option value="all">Every pattern</option>
          {groups.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
        </select>
      </div>
      <p className={styles.count}>{count} problem{count === 1 ? '' : 's'}</p>

      {shown.map((g) => (
        <section key={g.id} className={styles.group}>
          <h2 className={styles.groupTitle}>
            <Link to={`/dsa/patterns/${g.id}`}>{g.title}</Link>
            <span>{g.problems.filter((p) => isSolved(p.slug)).length}/{g.problems.length}</span>
          </h2>
          <ul className={styles.list}>
            {g.problems.map((p) => {
              const by = solvedBy(p.slug);
              return (
                <li key={p.slug} className={styles.row}>
                  <SolvedToggle slug={p.slug} title={p.title} />
                  {hasProblem(p.slug) ? <Link to={`/solve/${p.slug}`} className={styles.title}>{p.title}</Link> : <span className={styles.title}>{p.title}</span>}
                  {by && <span className={styles.source}>{SOURCE_SHORT[by]}</span>}
                  <span className={`${styles.level} ${styles[p.level.toLowerCase()]}`}>{p.level}</span>
                  <a className={styles.lc} href={`https://leetcode.com/problems/${p.slug}/`} target="_blank" rel="noopener noreferrer" title="Open on LeetCode">
                    LeetCode <ExternalLink size={11} aria-hidden="true" />
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      {count === 0 && <p className={styles.count}>Nothing matches these filters.</p>}
    </PageLayout>
  );
}
