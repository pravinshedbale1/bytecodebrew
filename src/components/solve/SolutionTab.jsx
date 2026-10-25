import { useEffect, useRef, useState } from 'react';
import { Copy, Check, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { loadSolution } from '../../lib/judge/solutions';
import { Inline } from './Inline';
import { CodeView } from './CodeView';
import ui from '../common/ui.module.css';
import styles from './SolutionTab.module.css';

const LANG_TABS = [['java', 'Java'], ['cpp', 'C++'], ['python', 'Python'], ['javascript', 'JavaScript']];
const LEVEL_CLASS = { 'Brute force': 'brute', Better: 'better', Optimal: 'optimal' };

/**
 * The Solution tab: the pattern, a comparison table, then one sub-tab per approach (brute force to
 * optimal) with its idea, steps, time and space complexity (and why), and tested code in each judge
 * language. Until the problem is solved it asks once before showing anything.
 */
export function SolutionTab({ spec, slug, solved, lang, climbing = false, onReveal }) {
  const [sol, setSol] = useState(undefined);
  const [revealed, setRevealed] = useState(solved);
  const [codeLang, setCodeLang] = useState(lang);
  const [active, setActive] = useState(0);
  const tabsRef = useRef(null);

  useEffect(() => {
    let alive = true;
    setSol(undefined);
    loadSolution(spec.lesson, slug).then((s) => { if (alive) setSol(s); }, () => { if (alive) setSol(null); });
    return () => { alive = false; };
  }, [spec.lesson, slug]);

  if ((!revealed && !solved) || (climbing && !revealed)) {
    return (
      <div className={styles.gate}>
        <p className={styles.gateTitle}>{climbing ? 'This is a rated attempt' : 'Have a go first?'}</p>
        <p className={styles.gateText}>
          {climbing
            ? 'Opening the solution now ends your Climb attempt as not solved, and your rating drops as if you gave up. Hints cost much less.'
            : 'The Solution tab walks through every approach, from brute force to optimal, with code in each language. You learn more if you try the problem (and the hints) before reading it.'}
        </p>
        <button type="button" className={`${ui.btn} ${ui.small}`} onClick={() => { onReveal?.(); setRevealed(true); }}>
          <Eye size={13} aria-hidden="true" /> {climbing ? 'End the attempt and show the solution' : 'Show the solution'}
        </button>
      </div>
    );
  }
  if (sol === undefined) return <p className={styles.muted}>Loading the solution…</p>;
  if (sol === null) return <p className={styles.muted}>The worked solution for this problem is not written yet.</p>;

  const approaches = sol.approaches;
  const a = approaches[active] ?? approaches[0];
  const tabId = (i) => `${slug}-approach-tab-${i}`;
  const select = (i) => {
    setActive(i);
    document.getElementById(tabId(i))?.focus({ preventScroll: true });
  };
  // from the pager at the bottom: switch, then bring the tab bar back into view (panel only, not the page)
  const page = (i) => {
    setActive(i);
    const el = tabsRef.current;
    let box = el?.parentElement;
    while (box && !/(auto|scroll)/.test(getComputedStyle(box).overflowY)) box = box.parentElement;
    const offset = el && box ? el.getBoundingClientRect().top - box.getBoundingClientRect().top : 0;
    if (offset < 0) box.scrollTo({ top: box.scrollTop + offset - 12 });
  };
  const onTabKey = (e) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (step) {
      e.preventDefault();
      select((active + step + approaches.length) % approaches.length);
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      select(e.key === 'Home' ? 0 : approaches.length - 1);
    }
  };

  return (
    <div className={styles.solution}>
      <p className={styles.kicker}>Pattern</p>
      <p className={styles.pattern}><Inline text={sol.pattern} /></p>

      <table className={styles.overview}>
        <thead>
          <tr><th scope="col">Approach</th><th scope="col">Time</th><th scope="col">Space</th></tr>
        </thead>
        <tbody>
          {approaches.map((x, i) => (
            <tr key={i} className={i === active ? styles.rowOn : undefined}>
              <td>
                <button type="button" className={styles.jump} onClick={() => setActive(i)} aria-current={i === active ? 'true' : undefined}>
                  <Level level={x.level} /> <span>{x.name}</span>
                </button>
              </td>
              <td className={styles.mono}>{x.time}</td>
              <td className={styles.mono}>{x.space}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div ref={tabsRef} className={styles.tabs} role="tablist" aria-label="Approaches" onKeyDown={onTabKey}>
        {approaches.map((x, i) => (
          <button
            key={i}
            id={tabId(i)}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-controls={`${slug}-approach-panel`}
            tabIndex={i === active ? 0 : -1}
            className={`${styles.tab} ${i === active ? styles.tabOn : ''}`}
            onClick={() => setActive(i)}
          >
            <span className={`${styles.dot} ${styles[LEVEL_CLASS[x.level]]}`} aria-hidden="true" />
            {tabLabel(approaches, i)}
          </button>
        ))}
      </div>

      <section id={`${slug}-approach-panel`} role="tabpanel" aria-labelledby={tabId(active)} className={styles.approach}>
        <header className={styles.head}>
          <Level level={a.level} />
          <h2 className={styles.name}>{a.name}</h2>
        </header>
        <p className={styles.idea}><Inline text={a.idea} /></p>

        <p className={styles.sub}>Steps</p>
        <ol className={styles.steps}>
          {a.steps.map((s, k) => <li key={k}><Inline text={s} /></li>)}
        </ol>

        <p className={styles.sub}>Complexity</p>
        <p className={styles.complexity}>
          <span><span className={styles.label}>Time</span> <span className={styles.mono}>{a.time}</span></span>
          <span><span className={styles.label}>Space</span> <span className={styles.mono}>{a.space}</span></span>
        </p>
        <p className={styles.why}><Inline text={a.why} /></p>
        {a.timesOut && (
          <p className={styles.slow}>Correct, but too slow for the largest test{a.timesOut.length > 1 || a.timesOut.includes('generated') ? 's' : ''}: Submit would time out with this approach.</p>
        )}

        <CodeBlock code={a.code} lang={codeLang} setLang={setCodeLang} />

        {approaches.length > 1 && (
          <div className={styles.pager}>
            {active > 0 ? (
              <button type="button" className={styles.pageBtn} onClick={() => page(active - 1)}>
                <ChevronLeft size={14} aria-hidden="true" /> {tabLabel(approaches, active - 1)}
              </button>
            ) : <span />}
            {active < approaches.length - 1 && (
              <button type="button" className={`${styles.pageBtn} ${styles.pageNext}`} onClick={() => page(active + 1)}>
                Next: {tabLabel(approaches, active + 1)} <ChevronRight size={14} aria-hidden="true" />
              </button>
            )}
          </div>
        )}
      </section>
      <p className={styles.footnote}>Every approach here is tested on this problem&apos;s tests in each language (a slow one on all the tests it can finish in time); the optimal one also passes the large-input test in Java.</p>
    </div>
  );
}

// "Brute force", "Better", "Optimal"; a level used twice is numbered ("Better 1", "Better 2")
function tabLabel(approaches, i) {
  const level = approaches[i].level;
  const same = approaches.filter((x) => x.level === level);
  return same.length > 1 ? `${level} ${same.indexOf(approaches[i]) + 1}` : level;
}

function Level({ level }) {
  return <span className={`${styles.level} ${styles[LEVEL_CLASS[level]]}`}>{level}</span>;
}

function CodeBlock({ code, lang, setLang }) {
  const [copied, setCopied] = useState(false);
  const text = code[lang] ?? code.java;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard blocked: nothing to do */ }
  };
  return (
    <div className={styles.code}>
      <div className={styles.codeHead} role="tablist" aria-label="Language">
        {LANG_TABS.map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={lang === id} className={`${styles.langTab} ${lang === id ? styles.langOn : ''}`} onClick={() => setLang(id)}>
            {label}
          </button>
        ))}
        <button type="button" className={styles.copy} onClick={copy} aria-label="Copy code">
          {copied ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />} {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <CodeView code={text} language={lang} />
    </div>
  );
}
