import { useEffect, useState } from 'react';
import { Copy, Check, Eye } from 'lucide-react';
import { loadSolution } from '../../lib/judge/solutions';
import { Inline } from './Inline';
import { CodeView } from './CodeView';
import ui from '../common/ui.module.css';
import styles from './SolutionTab.module.css';

const LANG_TABS = [['java', 'Java'], ['cpp', 'C++'], ['python', 'Python'], ['javascript', 'JavaScript']];
const LEVEL_CLASS = { 'Brute force': 'brute', Better: 'better', Optimal: 'optimal' };

/**
 * The Solution tab: the pattern, then every approach from brute force to optimal with its idea,
 * steps, time and space complexity (and why), and tested code in each judge language. Until the
 * problem is solved it asks once before showing anything.
 */
export function SolutionTab({ spec, slug, solved, lang }) {
  const [sol, setSol] = useState(undefined);
  const [revealed, setRevealed] = useState(solved);
  const [codeLang, setCodeLang] = useState(lang);

  useEffect(() => {
    let alive = true;
    setSol(undefined);
    loadSolution(spec.lesson, slug).then((s) => { if (alive) setSol(s); }, () => { if (alive) setSol(null); });
    return () => { alive = false; };
  }, [spec.lesson, slug]);

  if (!revealed && !solved) {
    return (
      <div className={styles.gate}>
        <p className={styles.gateTitle}>Have a go first?</p>
        <p className={styles.gateText}>
          The Solution tab walks through every approach, from brute force to optimal, with code in each language.
          You learn more if you try the problem (and the hints) before reading it.
        </p>
        <button type="button" className={`${ui.btn} ${ui.small}`} onClick={() => setRevealed(true)}>
          <Eye size={13} aria-hidden="true" /> Show the solution
        </button>
      </div>
    );
  }
  if (sol === undefined) return <p className={styles.muted}>Loading the solution…</p>;
  if (sol === null) return <p className={styles.muted}>The worked solution for this problem is not written yet.</p>;

  // scroll only the panel (scrollIntoView would also move the page under the workspace)
  const jump = (i) => {
    const el = document.getElementById(`approach-${i}`);
    let box = el?.parentElement;
    while (box && !/(auto|scroll)/.test(getComputedStyle(box).overflowY)) box = box.parentElement;
    box?.scrollTo({ top: box.scrollTop + el.getBoundingClientRect().top - box.getBoundingClientRect().top - 12, behavior: 'smooth' });
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
          {sol.approaches.map((a, i) => (
            <tr key={i}>
              <td>
                <button type="button" className={styles.jump} onClick={() => jump(i)}>
                  <Level level={a.level} /> <span>{a.name}</span>
                </button>
              </td>
              <td className={styles.mono}>{a.time}</td>
              <td className={styles.mono}>{a.space}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {sol.approaches.map((a, i) => (
        <section key={i} id={`approach-${i}`} className={styles.approach}>
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
            <p className={styles.slow}>Correct, but too slow for the largest test{a.timesOut.length > 1 ? 's' : ''}: Submit would time out with this approach.</p>
          )}

          <CodeBlock code={a.code} lang={codeLang} setLang={setCodeLang} />
        </section>
      ))}
      <p className={styles.footnote}>Every approach here is tested on this problem&apos;s tests in each language (a slow one on all the tests it can finish in time); the optimal one also passes the large-input test in Java.</p>
    </div>
  );
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
