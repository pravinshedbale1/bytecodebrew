import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { BookOpen, Eye, Gauge, Lock, Search, Shapes, Swords } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { PremiumNotice } from '../components/access/PremiumGate';
import { usePremium } from '../hooks/useAccess';
import { loadProblem } from '../lib/judge/problems';
import { PATTERN_ORDER, THINK_INDEX } from '../data/thinkIndex';
import { loadThink } from '../data/think';
import { Walkthrough } from '../components/think/Walkthrough';
import page from './Page.module.css';
import styles from '../components/think/Think.module.css';

const HOW = [
  [BookOpen, 'Read for clues', 'Words like "contiguous", "at most k", "sorted" or "minimum" point at a pattern.'],
  [Gauge, 'Set the time budget', 'The input size says how fast the solution must be, before you write a line.'],
  [Search, 'Observe the example', 'Work it by hand and notice what a solution could exploit.'],
  [Swords, 'Brute force, and its waste', 'Start from the simple correct answer, and find the work it repeats.'],
  [Shapes, 'Pick the pattern', 'The pattern that removes the waste, and why not its look-alikes.'],
  [Eye, 'Watch it work', 'See it run on the example; list the edge cases to test.'],
];

/** /think: how a problem solver thinks, and the problems with a walkthrough. */
export function ThinkIndexPage() {
  const premium = usePremium();
  return (
    <PageLayout contentWidth="900px">
      <header className={page.header}>
        <p className={page.eyebrow}>Practice · Thinking</p>
        <h1 className={page.title}>Practice thinking</h1>
        <p className={page.lead}>
          Knowing the patterns is half of it. The other half is getting from a statement you have never seen to the right
          pattern. Each walkthrough takes one problem through the same six steps a strong solver goes through, one step at a
          time, so you can stop and try before you look.
        </p>
      </header>
      <section className={page.section}>
        <h2 className={page.sectionTitle}>The six steps</h2>
        <ol className={styles.howList}>
          {HOW.map(([Icon, title, text]) => <li key={title}><Icon size={16} aria-hidden="true" /><div><b>{title}</b><span>{text}</span></div></li>)}
        </ol>
      </section>
      <section className={page.section}>
        <h2 className={page.sectionTitle}>By pattern · {Object.keys(THINK_INDEX).length} of {PATTERN_ORDER.reduce((s, r) => s + r[3], 0)} problems so far</h2>
        {PATTERN_ORDER.filter(([, , done]) => done > 0).map(([lesson, name, done, total]) => (
          <div key={lesson} className={styles.patternGroup}>
            <h3 className={styles.patternHead}>
              <Link to={`/dsa/patterns/${lesson}`}>{name}</Link>
              <span className={done === total ? styles.countDone : styles.count}>{done === total ? `all ${total}` : `${done} of ${total}`}</span>
            </h3>
            <ul className={styles.problems}>
              {Object.entries(THINK_INDEX).filter(([, p]) => p.lesson === lesson).map(([slug, p]) => (
                <li key={slug}>
                  <Link to={`/think/${slug}`}>
                    <span className={styles.grow}>{p.title}</span>
                    <span className={`${styles.lvl} ${styles[`lvl_${p.level}`]}`}>{p.level}</span>
                    {p.free ? <span className={styles.tagFree}>Free</span> : !premium && <span className={styles.tagLock}><Lock size={11} aria-hidden="true" /> Premium</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {PATTERN_ORDER.some(([, , done]) => done === 0) && (
          <p className={styles.coming}>Coming next: {PATTERN_ORDER.filter(([, , done]) => done === 0).map(([, name]) => name).join(' · ')}</p>
        )}
      </section>
    </PageLayout>
  );
}

/** /think/:slug: one problem, thought through stage by stage. */
export function ThinkProblemPage() {
  const { slug } = useParams();
  const premium = usePremium();
  const meta = THINK_INDEX[slug];
  const [problem, setProblem] = useState(null);
  const [think, setThink] = useState(null);
  useEffect(() => {
    if (!meta) return undefined;
    let live = true;
    Promise.all([loadProblem(slug), loadThink(meta.lesson, slug)]).then(([p, t]) => { if (live) { setProblem(p); setThink(t); } });
    return () => { live = false; };
  }, [slug, meta]);

  if (!meta) {
    return (
      <PageLayout contentWidth="900px">
        <header className={page.header}><h1 className={page.title}>No walkthrough yet</h1><p className={page.lead}>This problem doesn't have a thinking walkthrough yet. <Link to="/think">See the ones that do</Link>.</p></header>
      </PageLayout>
    );
  }
  const locked = !meta.free && !premium;
  return (
    <PageLayout contentWidth="900px">
      <header className={page.header}>
        <p className={page.eyebrow}><Link to="/think">Practice thinking</Link> · {meta.level}</p>
        <h1 className={page.title}>{meta.title}</h1>
        <div className={styles.topLinks}>
          <Link to={`/solve/${slug}`}>Solve it with tests</Link>
          <a href={`https://leetcode.com/problems/${slug}/`} target="_blank" rel="noopener noreferrer">LeetCode</a>
        </div>
      </header>
      {locked && <PremiumNotice feature="Practice thinking walkthroughs" blurb="Every problem taken from the statement to the pattern, one step at a time: clues, time budget, observations with sketches, brute force, the pattern and why not its look-alikes, then the idea running on the example. One walkthrough per pattern is free." />}
      {!locked && (problem && think ? <Walkthrough problem={problem} think={think} lesson={{ anchor: problem.anchor }} /> : <p aria-busy="true">Loading…</p>)}
    </PageLayout>
  );
}
