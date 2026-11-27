import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { BookOpen, Check, ChevronLeft, ChevronRight, Eye, Gauge, Lightbulb, ListOrdered, Play, RotateCcw, Rows3, Search, Shapes, Swords } from 'lucide-react';
import { Inline } from '../solve/Inline';
import { mdxComponents } from '../mdx/components';
import { PATTERNS } from '../../lib/coach/patterns';
import { Sketch } from './Sketch';
import styles from './Think.module.css';

/**
 * One problem, thought through like an ideal problem solver, one stage at a time (see Walkthrough below).
 * `problem` is the solver's problem data (statement, constraints, tests); `think` is its entry in
 * src/data/think/<lesson>.js.
 */
const STAGES = [
  { id: 'read', icon: BookOpen, short: 'Clues', title: 'Read for clues', ask: 'Read the statement and the example. Which words hint at how to solve it?' },
  { id: 'budget', icon: Gauge, short: 'Complexity', title: 'Find the target complexity', ask: 'Look at the constraints. How fast does the solution need to be?' },
  { id: 'observe', icon: Search, short: 'Observe', title: 'Observe the example', ask: 'Work the example by hand. What do you notice that a solution could use?' },
  { id: 'brute', icon: Swords, short: 'Brute force', title: 'Brute force, and what it wastes', ask: 'What is the simplest correct solution? What work does it keep repeating?' },
  { id: 'pattern', icon: Shapes, short: 'Pattern', title: 'Pick the pattern', ask: 'Which pattern removes that waste? Why not the ones it is often confused with?' },
  { id: 'watch', icon: Eye, short: 'Watch it', title: 'Watch it work', ask: 'See the idea run on the example, then list the edge cases to test.' },
];

const storeKey = (slug) => `bcb.think.${slug}`;
/**
 * Where the reader is in this problem: the current stage, the stages already revealed, and whether they
 * chose the single-page view. Remembered per problem as a convenience (it may come back empty). An older
 * value (a plain list of open stages) is read as "revealed".
 */
const readState = (slug) => {
  const blank = { cur: 0, shown: [], all: false };
  try {
    const v = JSON.parse(localStorage.getItem(storeKey(slug)) ?? 'null');
    if (Array.isArray(v)) return { ...blank, shown: v };
    if (v && typeof v === 'object') return { cur: Number.isInteger(v.cur) && v.cur >= 0 && v.cur < STAGES.length ? v.cur : 0, shown: Array.isArray(v.shown) ? v.shown : [], all: Boolean(v.all) };
  } catch { /* private mode or bad data: start fresh */ }
  return blank;
};
const writeState = (slug, st) => { try { localStorage.setItem(storeKey(slug), JSON.stringify(st)); } catch { /* fine */ } };

/**
 * One stage at a time: a progress rail across the top, the problem pinned beside (or above) the stage,
 * and each stage asking its question first. "Reveal" shows the answer; "Next" moves on. Trying to answer
 * before looking is the point of the page, so the answer never shows up uninvited.
 * "Show all steps" switches to one long page with everything revealed, for review.
 */
export function Walkthrough({ problem, think, lesson }) {
  const slug = problem.slug;
  const [state, setState] = useState(() => readState(slug));
  useEffect(() => { writeState(slug, state); }, [slug, state]);
  const shown = new Set(state.shown);
  const panelRef = useRef(null);
  const reveal = (id) => setState((s) => (s.shown.includes(id) ? s : { ...s, shown: [...s.shown, id] }));
  const go = (k) => {
    setState((s) => ({ ...s, cur: k }));
    requestAnimationFrame(() => {
      const el = panelRef.current;
      if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };
  const setAll = (all) => setState((s) => ({ ...s, all, shown: all ? STAGES.map((x) => x.id) : s.shown }));
  const clues = shown.has('read') ? think.read : [];

  if (state.all) {
    return (
      <div className={styles.stages}>
        <section className={styles.problemCard} aria-label="The problem"><Statement problem={problem} clues={clues} /></section>
        <div className={styles.controls}>
          <span className={styles.controlsHint}>Every step on one page.</span>
          <button type="button" className={styles.linkBtn} onClick={() => setAll(false)}><ListOrdered size={13} aria-hidden="true" /> Step by step</button>
        </div>
        {STAGES.map((st, k) => (
          <section key={st.id} className={`${styles.stage} ${styles.open}`} aria-label={st.title}>
            <h2 className={styles.flatHead}><span className={styles.num}>{k + 1}</span><st.icon size={16} aria-hidden="true" /> {st.title}</h2>
            <div className={styles.body}><StageBody id={st.id} think={think} problem={problem} lesson={lesson} /></div>
          </section>
        ))}
        <div className={styles.controls}><Link to={`/solve/${slug}`} className={styles.solveBtn}><Play size={14} aria-hidden="true" /> Now solve it</Link></div>
      </div>
    );
  }

  const k = state.cur, st = STAGES[k], Icon = st.icon, open = shown.has(st.id), last = k === STAGES.length - 1;
  return (
    <div className={styles.shellOuter}>
    <div className={styles.shell}>
      <aside className={styles.side} aria-label="The problem">
        <details className={styles.problemCard} open>
          <summary className={styles.problemSummary}>The problem</summary>
          <Statement problem={problem} clues={clues} />
        </details>
      </aside>

      <div className={styles.mainCol}>
        <nav className={styles.rail} aria-label="Steps">
          <ol>
            {STAGES.map((s, i) => {
              const done = shown.has(s.id);
              return (
                <li key={s.id}>
                  <button type="button" onClick={() => go(i)} aria-current={i === k ? 'step' : undefined} className={[styles.railStep, i === k && styles.railCur, done && styles.railDone].filter(Boolean).join(' ')} title={s.title}>
                    <span className={styles.railDot}>{done ? <Check size={12} aria-hidden="true" /> : i + 1}</span>
                    <span className={styles.railLabel}>{s.short}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <section ref={panelRef} className={styles.panel} aria-label={st.title}>
          <p className={styles.panelEyebrow}>Step {k + 1} of {STAGES.length}</p>
          <h2 className={styles.panelTitle}><Icon size={18} aria-hidden="true" /> {st.title}</h2>
          <div className={styles.prompt}>
            <span className={styles.promptTag}>Think first</span>
            <p><Inline text={think.asks?.[st.id] ?? st.ask} /></p>
          </div>
          {open
            ? <div className={styles.answer}><StageBody id={st.id} think={think} problem={problem} lesson={lesson} /></div>
            : (
              <div className={styles.revealBox}>
                <button type="button" className={styles.revealBtn} onClick={() => reveal(st.id)}><Eye size={15} aria-hidden="true" /> {st.id === 'watch' ? 'Show it running' : 'Reveal the answer'}</button>
                <span className={styles.revealHint}>Give it a minute on your own first.</span>
              </div>
            )}
          <div className={`${styles.stepNav} ${open && st.id === 'watch' ? styles.stepNavFlat : ''}`}>   {/* the step-through docks its own controls at the bottom */}
            <button type="button" className={styles.backBtn} onClick={() => go(k - 1)} disabled={k === 0}><ChevronLeft size={15} aria-hidden="true" /> Back</button>
            {last
              ? <Link to={`/solve/${slug}`} className={styles.solveBtn}><Play size={14} aria-hidden="true" /> Now solve it</Link>
              : <button type="button" className={styles.nextBtn} onClick={() => go(k + 1)}>Next: {STAGES[k + 1].short} <ChevronRight size={15} aria-hidden="true" /></button>}
          </div>
        </section>

        <div className={styles.controls}>
          <button type="button" className={styles.linkBtn} onClick={() => setAll(true)}><Rows3 size={13} aria-hidden="true" /> Show all steps on one page</button>
          {shown.size > 0 && <button type="button" className={styles.linkBtn} onClick={() => setState({ cur: 0, shown: [], all: false })}><RotateCcw size={13} aria-hidden="true" /> Start over</button>}
        </div>
      </div>
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
        {think.aha && <p className={styles.aha}><Lightbulb size={15} aria-hidden="true" /><span><b>The key idea.</b> <Inline text={think.aha} /></span></p>}
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
      {f.sketch && <Sketch sketch={f.sketch} />}
      <div className={styles.frameNav}>
        <button type="button" onClick={() => setI((x) => Math.max(0, x - 1))} disabled={i === 0} aria-label="Previous step">‹</button>
        <span>Step {i + 1} / {frames.length}</span>
        <button type="button" onClick={() => setI((x) => Math.min(frames.length - 1, x + 1))} disabled={i === frames.length - 1} aria-label="Next step">›</button>
      </div>
    </div>
  );
}
