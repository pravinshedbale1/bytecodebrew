import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { dsa } from '../../curriculum/tracks/dsa';
import { useSolved } from '../../hooks/useSolved';
import { SolvedToggle } from './SolvedToggle';
import styles from './ProblemTracker.module.css';
// { lessonId: [{ num, title, slug, level }] }, parsed from the lessons' practice ladders at build time.
import ladderData from 'virtual:dsa-ladders';

function ladders() {
  const course = dsa.courses.find((c) => c.id === 'patterns');
  return course.modules.map((m) => ({
    id: m.id,
    title: m.title,
    lessons: m.lessons
      .map((l) => ({ id: l.id, title: l.title, problems: ladderData[l.id] ?? [] }))
      .filter((l) => l.problems.length > 0),
  })).filter((m) => m.lessons.length > 0);
}

export function ProblemTracker() {
  const data = useMemo(ladders, []);
  const { isSolved } = useSolved();
  const [unsolvedOnly, setUnsolvedOnly] = useState(false);

  const all = new Map();
  data.forEach((m) => m.lessons.forEach((l) => l.problems.forEach((p) => all.set(p.slug, p))));
  const byLevel = ['Easy', 'Medium', 'Hard'].map((level) => {
    const list = [...all.values()].filter((p) => p.level === level);
    return { level, total: list.length, done: list.filter((p) => isSolved(p.slug)).length };
  });
  const total = all.size;
  const done = [...all.keys()].filter(isSolved).length;

  return (
    <div className={styles.tracker}>
      <div className={styles.summary}>
        <div className={styles.big}>
          <span className={styles.bigNum}>{done}</span> / {total} solved
        </div>
        <div className={styles.levels}>
          {byLevel.map((b) => (
            <span key={b.level} className={styles[b.level.toLowerCase()]}>{b.level} {b.done}/{b.total}</span>
          ))}
        </div>
        <Bar done={done} total={total} />
        <label className={styles.filter}>
          <input type="checkbox" checked={unsolvedOnly} onChange={(e) => setUnsolvedOnly(e.target.checked)} />
          Show unsolved only
        </label>
      </div>

      {data.map((m) => (
        <section key={m.id} className={styles.module}>
          <h3 className={styles.moduleTitle}>{m.title}</h3>
          {m.lessons.map((l) => {
            const solvedHere = l.problems.filter((p) => isSolved(p.slug)).length;
            const shown = unsolvedOnly ? l.problems.filter((p) => !isSolved(p.slug)) : l.problems;
            return (
              <details key={l.id} className={styles.lesson}>
                <summary className={styles.lessonHead}>
                  <span className={styles.lessonTitle}>{l.title}</span>
                  <span className={styles.count}>{solvedHere}/{l.problems.length}</span>
                  <Bar done={solvedHere} total={l.problems.length} small />
                </summary>
                <ul className={styles.list}>
                  {shown.map((p) => (
                    <li key={p.slug} className={styles.item}>
                      <SolvedToggle slug={p.slug} title={p.title} />
                      <a href={`https://leetcode.com/problems/${p.slug}/`} target="_blank" rel="noopener noreferrer">
                        {p.num}. {p.title}
                      </a>
                      <span className={`${styles.level} ${styles[p.level.toLowerCase()]}`}>{p.level}</span>
                    </li>
                  ))}
                  {shown.length === 0 && <li className={styles.empty}>All solved here.</li>}
                </ul>
                <Link className={styles.lessonLink} to={`/dsa/patterns/${l.id}`}>Open the lesson →</Link>
              </details>
            );
          })}
        </section>
      ))}
    </div>
  );
}

function Bar({ done, total, small }) {
  const pct = total ? Math.round((100 * done) / total) : 0;
  return (
    <span className={`${styles.bar} ${small ? styles.barSmall : ''}`} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <span className={styles.fill} style={{ width: `${pct}%` }} />
    </span>
  );
}
