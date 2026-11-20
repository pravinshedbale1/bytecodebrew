import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { BookOpen, Eye, Gauge, Lightbulb, Play, RotateCcw, Search, Shapes, Swords } from 'lucide-react';
import { Inline } from '../solve/Inline';
import { mdxComponents } from '../mdx/components';
import { PATTERNS } from '../../lib/coach/patterns';
import { Sketch } from './Sketch';
import styles from './Think.module.css';

/**
 * One problem, thought through like an ideal problem solver: six stages, revealed one at a time.
 * `problem` is the solver's problem data (statement, constraints, tests); `think` is its entry in
 * src/data/think.js.
 */
const STAGES = [
  { id: 'read', icon: BookOpen, title: 'Read for clues', ask: 'Read the statement and the example. Which words hint at how to solve it?' },
  { id: 'budget', icon: Gauge, title: 'Set the time budget', ask: 'Look at the constraints. How fast does the solution need to be?' },
  { id: 'observe', icon: Search, title: 'Observe the example', ask: 'Work the example by hand. What do you notice that a solution could use?' },
  { id: 'brute', icon: Swords, title: 'Brute force, and what it wastes', ask: 'What is the simplest correct solution? What work does it keep repeating?' },
  { id: 'pattern', icon: Shapes, title: 'Pick the pattern', ask: 'Which pattern removes that waste? Why not the ones it is often confused with?' },
  { id: 'watch', icon: Eye, title: 'Watch it work', ask: 'See the idea run on the example, then list the edge cases to test.' },
];

const storeKey = (slug) => `bcb.think.${slug}`;
const readShown = (slug) => { try { return Number(localStorage.getItem(storeKey(slug))) || 0; } catch { return 0; } };
const writeShown = (slug, n) => { try { localStorage.setItem(storeKey(slug), String(n)); } catch { /* private mode: fine */ } };

export function Walkthrough({ problem, think, lesson }) {
  const slug = problem.slug;
  const [shown, setShown] = useState(() => readShown(slug));   // how many stages are revealed
  useEffect(() => { writeShown(slug, shown); }, [slug, shown]);
  const reveal = () => setShown((n) => Math.min(STAGES.length, n + 1));

  return (
    <div className={styles.stages}>
      {STAGES.map((st, k) => {
        const open = k < shown;
        const next = k === shown;
        const Icon = st.icon;
        return (
          <section key={st.id} className={`${styles.stage} ${open ? styles.open : next ? styles.next : styles.later}`} aria-label={st.title}>
            <header className={styles.stageHead}>
              <span className={styles.num}>{k + 1}</span>
              <Icon size={16} aria-hidden="true" />
              <h2>{st.title}</h2>
            </header>
            {(open || next) && k === 0 && <Statement problem={problem} clues={open ? think.read : []} />}
            {next && (
              <div className={styles.ask}>
                <p><Lightbulb size={14} aria-hidden="true" /> {st.ask}</p>
                <button type="button" className={styles.reveal} onClick={reveal}>Think, then reveal</button>
              </div>
            )}
            {open && <StageBody id={st.id} think={think} problem={problem} lesson={lesson} />}
          </section>
        );
      })}
      <div className={styles.controls}>
        {shown < STAGES.length && <button type="button" className={styles.linkBtn} onClick={() => setShown(STAGES.length)}>Show everything</button>}
        {shown > 0 && <button type="button" className={styles.linkBtn} onClick={() => setShown(0)}><RotateCcw size={13} aria-hidden="true" /> Start over</button>}
        {shown === STAGES.length && <Link to={`/solve/${slug}`} className={styles.solveBtn}><Play size={14} aria-hidden="true" /> Now solve it</Link>}
      </div>
    </div>
  );
}

function StageBody({ id, think, problem, lesson }) {
  if (id === 'read') return <Clues clues={think.read} />;
  if (id === 'budget') return <Budget budget={think.budget} problem={problem} />;
  if (id === 'observe') {
    return (
      <ol className={styles.observations}>
        {think.observe.map((o, k) => (
          <li key={k}>
            <h3>{o.title}</h3>
            <p><Inline text={o.text} /></p>
            {o.sketch && <Sketch sketch={o.sketch} />}
          </li>
        ))}
      </ol>
    );
  }
  if (id === 'brute') {
    return (
      <div className={styles.brute}>
        <p><b>Idea.</b> <Inline text={think.brute.idea} /></p>
        <p><b>Cost.</b> <code>{think.brute.cost}</code></p>
        <p className={styles.waste}><b>What it wastes.</b> <Inline text={think.brute.waste} /></p>
      </div>
    );
  }
  if (id === 'pattern') {
    const pick = think.pattern.pick;
    return (
      <div>
        <div className={styles.pick}>
          <p className={styles.pickName}>{PATTERNS[pick]?.name ?? pick}</p>
          <p><Inline text={think.pattern.why} /></p>
          <Link to={`/dsa/patterns/${pick}${lesson?.anchor ? `#${lesson.anchor}` : ''}`}>Open the lesson section →</Link>
        </div>
        <p className={styles.notTitle}>Why not…</p>
        <ul className={styles.nots}>
          {think.pattern.not.map((n) => <li key={n.id}><b>{PATTERNS[n.id]?.name ?? n.id}</b> <Inline text={n.why} /></li>)}
        </ul>
      </div>
    );
  }
  return <Watch think={think} />;
}

/** The statement with each clue phrase highlighted and numbered. */
function Statement({ problem, clues }) {
  const example = problem.tests[0];
  return (
    <div className={styles.statement}>
      {problem.statement.split(/\n\s*\n/).map((para, i) => {
        const lines = para.split('\n');
        if (lines.every((l) => l.startsWith('- '))) return <ul key={i}>{lines.map((l, k) => <li key={k}><Marked text={l.slice(2)} clues={clues} /></li>)}</ul>;
        return <p key={i}><Marked text={lines.join(' ')} clues={clues} /></p>;
      })}
      <p className={styles.example}>
        <b>Example:</b> <code>{example.in.join(', ')}</code> → <code>{example.out ?? '…'}</code>
      </p>
    </div>
  );
}

function Marked({ text, clues }) {
  const parts = [];
  let rest = text;
  while (rest) {
    let best = null;
    clues.forEach((c, k) => {
      const at = rest.indexOf(c.phrase);
      if (at >= 0 && (!best || at < best.at)) best = { at, k, len: c.phrase.length };
    });
    if (!best) { parts.push(<Inline key={parts.length} text={rest} />); break; }
    if (best.at > 0) parts.push(<Inline key={parts.length} text={rest.slice(0, best.at)} />);
    parts.push(<mark key={parts.length} className={styles.clue}><Inline text={rest.slice(best.at, best.at + best.len)} /><sup>{best.k + 1}</sup></mark>);
    rest = rest.slice(best.at + best.len);
  }
  return parts;
}

function Clues({ clues }) {
  return (
    <ol className={styles.clues}>
      {clues.map((c, k) => (
        <li key={k}><span className={styles.clueNo}>{k + 1}</span><span><q><Inline text={c.phrase} /></q> <Inline text={c.says} /></span></li>
      ))}
    </ol>
  );
}

const sup = (e) => String(e).split('').map((d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]).join('');
const pow10 = (x) => {
  let e = Math.floor(Math.log10(x));
  let m = x / 10 ** e;
  if (m >= 9.95) { e += 1; m = 1; }                    // 9.97 × 10³ reads better as 10⁴
  return m < 1.05 ? `10${sup(e)}` : `${m.toFixed(1)} × 10${sup(e)}`;
};
const verdict = (ops) => (ops <= 1e7 ? ['easily fits', 'ok'] : ops <= 1e8 ? ['fits', 'ok'] : ops <= 1e9 ? ['risky', 'warn'] : ['too slow', 'bad']);

function Budget({ budget }) {
  const rows = budget.rows ?? [
    ['O(n²)', budget.n * budget.n],
    ['O(n log n)', budget.n * Math.max(1, Math.log2(budget.n))],
    ['O(n)', budget.n],
  ].map(([c, ops]) => { const [v, tone] = verdict(ops); return [c, `≈ ${pow10(ops)}`, tone, v]; });
  return (
    <div>
      <p><b>The limit that matters:</b> <code>{budget.from}</code>. A judge runs about 10⁸ simple steps per second.</p>
      <table className={styles.budget}>
        <thead><tr><th>approach</th><th>steps</th><th /></tr></thead>
        <tbody>
          {rows.map(([c, ops, tone, v]) => (
            <tr key={c}><td><code>{c}</code></td><td>{ops}</td><td className={styles[`v_${tone}`]}>{v ?? (tone === 'ok' ? 'fits' : 'too slow')}</td></tr>
          ))}
        </tbody>
      </table>
      <p><b>Aim for</b> <code>{budget.aim}</code>. <Inline text={budget.note} /></p>
    </div>
  );
}

function Watch({ think }) {
  const w = think.watch;
  const Viz = w.viz ? mdxComponents[w.viz] : null;
  return (
    <div>
      {Viz && <Viz inputs={w.inputs} />}
      {w.frames && <Frames frames={w.frames} />}
      <p className={styles.notTitle}>Edge cases to test before you code</p>
      <ul className={styles.edges}>{think.edges.map((e, k) => <li key={k}><Inline text={e} /></li>)}</ul>
    </div>
  );
}

function Frames({ frames }) {
  const [i, setI] = useState(0);
  const f = frames[i];
  return (
    <div className={styles.frames}>
      <p className={styles.frameTitle}>{f.title}</p>
      <p><Inline text={f.text} /></p>
      <Sketch sketch={f.sketch} />
      <div className={styles.frameNav}>
        <button type="button" onClick={() => setI((x) => Math.max(0, x - 1))} disabled={i === 0} aria-label="Previous step">‹</button>
        <span>Step {i + 1} / {frames.length}</span>
        <button type="button" onClick={() => setI((x) => Math.min(frames.length - 1, x + 1))} disabled={i === frames.length - 1} aria-label="Next step">›</button>
      </div>
    </div>
  );
}
