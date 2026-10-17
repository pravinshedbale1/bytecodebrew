import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Play, Send, RotateCcw, ExternalLink, CheckCircle2, XCircle, AlertTriangle, BookOpen, Timer } from 'lucide-react';
import { getLessonContext } from '../../curriculum';
import { CodeEditor } from './CodeEditor';
import { loadProblem, exampleCount } from '../../lib/judge/problems';
import { starterCode } from '../../lib/judge/harness';
import { runTests } from '../../lib/judge/runner';
import { markSolved, useSolved } from '../../hooks/useSolved';
import { readJSON, writeJSON } from '../../lib/storage';
import ui from '../common/ui.module.css';
import styles from './ProblemSolver.module.css';

const codeKey = (slug) => `bcb:code:${slug}`;

/** Names for each test input, for display. */
function inputNames(spec) {
  if (spec.params) return spec.params.map(([, n]) => n);
  return ['operations', 'arguments'];
}

const STATUS = {
  accepted: { label: 'Accepted', icon: CheckCircle2, cls: 'ok' },
  wrong: { label: 'Wrong answer', icon: XCircle, cls: 'bad' },
  error: { label: 'Runtime error', icon: AlertTriangle, cls: 'bad' },
  slow: { label: 'Correct, but too slow', icon: Timer, cls: 'bad' },
  compile: { label: 'Compilation error', icon: AlertTriangle, cls: 'bad' },
};

/**
 * Solve a practice problem in the browser: LeetCode-style starter code, "Run" on the examples,
 * "Submit" on every test. Passing all tests marks the problem solved. Code is kept per problem in
 * this browser.
 */
export function ProblemSolver({ slug, compact = false }) {
  const [spec, setSpec] = useState(undefined);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [active, setActive] = useState(0);
  const { isSolved } = useSolved();

  useEffect(() => {
    let alive = true;
    setSpec(undefined);
    setResult(null);
    setError(null);
    loadProblem(slug).then((p) => {
      if (!alive) return;
      setSpec(p);
      if (p) setCode(readJSON(codeKey(slug), null) ?? starterCode(p));
    });
    return () => { alive = false; };
  }, [slug]);

  useEffect(() => {
    if (!spec) return undefined;
    const t = setTimeout(() => writeJSON(codeKey(slug), code), 400);
    return () => clearTimeout(t);
  }, [code, slug, spec]);

  const examples = useMemo(() => (spec ? spec.tests.slice(0, exampleCount(spec)) : []), [spec]);

  if (spec === undefined) return <p className={styles.loading}>Loading the problem…</p>;
  if (spec === null) return <p className={styles.loading}>This problem has no built-in tests yet.</p>;

  const run = async (mode) => {
    if (busy) return;
    setBusy(mode);
    setError(null);
    try {
      const tests = mode === 'submit' ? spec.tests : examples;
      const r = await runTests(spec, code, tests);
      setResult({ ...r, mode });
      const firstFail = r.tests.findIndex((t) => !t.pass);
      setActive(firstFail >= 0 ? firstFail : 0);
      if (mode === 'submit' && r.status === 'accepted') markSolved(slug);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  };

  const reset = () => {
    if (window.confirm('Replace your code with the starter code?')) {
      setCode(starterCode(spec));
      setResult(null);
    }
  };

  const names = inputNames(spec);
  const shown = result?.tests ?? [];
  const status = result && STATUS[result.status];
  const passed = shown.filter((t) => t.pass).length;

  return (
    <div className={`${styles.solver} ${compact ? styles.compact : ''}`}>
      <section className={styles.problem}>
        <div className={styles.titleRow}>
          <h2 className={styles.title}>{spec.title}</h2>
          <span className={`${styles.level} ${styles[spec.level.toLowerCase()]}`}>{spec.level}</span>
          {isSolved(slug) && <span className={styles.solved}><CheckCircle2 size={14} /> Solved</span>}
        </div>
        <p className={styles.summary}>{spec.summary}</p>
        <p className={styles.links}>
          <a href={`https://leetcode.com/problems/${slug}/`} target="_blank" rel="noopener noreferrer">
            Full statement on LeetCode <ExternalLink size={12} aria-hidden="true" />
          </a>
          {!compact && <Link to={`/dsa/patterns/${spec.lesson}`}>The pattern lesson</Link>}
        </p>

        <h3 className={styles.sub}>Examples</h3>
        {examples.map((t, i) => (
          <div key={i} className={styles.example}>
            {t.in.map((v, k) => (
              <p key={k}><span className={styles.name}>{names[k] ?? `input ${k + 1}`} =</span> <code>{v}</code></p>
            ))}
            <p><span className={styles.name}>expected</span> <code>{t.out}</code></p>
          </div>
        ))}
        <p className={styles.mobileNote}>
          Coding is easier on a larger screen. Your code is saved in this browser, so you can pick up where you left off.
        </p>
        <p className={styles.note}>
          Submit runs {spec.tests.length} tests, including edge cases{spec.tests.some((t) => t.perf) ? ' and a large input that needs an efficient solution' : ''}.
          {spec.check === 'any-order' || spec.check === 'any-order-deep' ? ' The answer may be in any order.' : ''}
          {spec.check?.startsWith('custom:') ? ' Any valid answer is accepted.' : ''}
        </p>
      </section>

      <section className={styles.work}>
        <div className={styles.editorWrap}>
          <div className={styles.toolbar}>
            <span className={styles.file}>Java 17</span>
            <div className={ui.row}>
              <button type="button" className={`${ui.btn} ${ui.ghost} ${ui.small}`} onClick={reset} title="Reset to starter code">
                <RotateCcw size={13} /> Reset
              </button>
              <button type="button" className={`${ui.btn} ${ui.small}`} onClick={() => run('run')} disabled={Boolean(busy)}>
                <Play size={13} /> {busy === 'run' ? 'Running…' : 'Run'}
              </button>
              <button type="button" className={`${ui.btn} ${ui.primary} ${ui.small}`} onClick={() => run('submit')} disabled={Boolean(busy)}>
                <Send size={13} /> {busy === 'submit' ? 'Submitting…' : 'Submit'}
              </button>
            </div>
          </div>
          <CodeEditor value={code} onChange={setCode} onRun={() => run('run')} height={compact ? '420px' : 'min(62vh, 600px)'} />
        </div>

        <div className={styles.results} aria-live="polite">
          {error && <p className={ui.error}>{error}</p>}
          {!result && !error && (
            <p className={styles.hint}>
              {busy ? 'Compiling and running your code…' : 'Run tries the examples; Submit runs every test. Ctrl/⌘ Enter runs.'}
            </p>
          )}
          {result && (
            <>
              <p className={`${styles.verdict} ${styles[status.cls]}`}>
                <status.icon size={16} aria-hidden="true" />
                {status.label}
                {result.status !== 'compile' && <span> · {passed}/{shown.length} {result.mode === 'submit' ? 'tests' : 'examples'} passed</span>}
                {result.time && <span className={styles.meta}> · {result.time}s</span>}
                {result.mode === 'submit' && result.status === 'accepted' && <span className={styles.meta}> · marked solved</span>}
              </p>
              {result.compile && <pre className={styles.out}>{result.compile}</pre>}
              {shown.length > 0 && (
                <>
                  <div className={styles.tabs} role="tablist">
                    {shown.map((t, i) => (
                      <button
                        key={i}
                        type="button"
                        role="tab"
                        aria-selected={i === active}
                        className={`${styles.tab} ${t.pass ? styles.tabOk : styles.tabBad} ${i === active ? styles.tabActive : ''}`}
                        onClick={() => setActive(i)}
                      >
                        {t.pass ? <CheckCircle2 size={12} /> : <XCircle size={12} />} {t.perf ? 'Performance' : `Case ${i + 1}`}
                      </button>
                    ))}
                  </div>
                  <CaseView test={shown[active]} names={names} />
                </>
              )}
              {result.status !== 'accepted' && <PatternHint spec={spec} />}
              {result.stdout && (
                <>
                  <p className={styles.sub}>Your prints</p>
                  <pre className={styles.out}>{result.stdout}</pre>
                </>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

/** After a failed run: point back to the pattern lesson (the section that works through this problem, when there is one). */
function PatternHint({ spec }) {
  const lesson = getLessonContext('dsa', 'patterns', spec.lesson)?.lesson;
  if (!lesson) return null;
  return (
    <p className={styles.hint2}>
      <BookOpen size={14} aria-hidden="true" />
      Stuck?{' '}
      <Link to={`${lesson.path}${spec.anchor ? `#${spec.anchor}` : ''}`}>
        {spec.anchor ? `See how ${lesson.title} works through this problem` : `Revisit the pattern: ${lesson.title}`}
      </Link>
    </p>
  );
}

function CaseView({ test, names }) {
  if (!test) return null;
  if (test.perf) {
    return (
      <div className={styles.case}>
        <p><span className={styles.name}>input</span><span>Large generated input: {test.perf.label}</span></p>
        {test.pass && <p><span className={styles.name}>result</span><code className={styles.gotOk}>Correct, in {test.ms} ms (limit {test.limitMs} ms)</code></p>}
        {!test.pass && test.got !== undefined && !test.slow && <p><span className={styles.name}>result</span><code className={styles.gotBad}>Finished, but the answer differs from the reference</code></p>}
        {test.slow && <p><span className={styles.name}>result</span><code className={styles.gotBad}>Correct answer, but an efficient solution is needed — look for the pattern that avoids repeated work</code></p>}
        {test.error && <p><span className={styles.name}>error</span><code className={styles.gotBad}>{test.error}</code></p>}
      </div>
    );
  }
  return (
    <div className={styles.case}>
      {test.input.map((v, k) => (
        <p key={k}><span className={styles.name}>{names[k] ?? `input ${k + 1}`}</span><code>{v}</code></p>
      ))}
      <p><span className={styles.name}>expected</span><code>{test.expected}</code></p>
      {test.got !== undefined && <p><span className={styles.name}>your output</span><code className={test.pass ? styles.gotOk : styles.gotBad}>{test.got}</code></p>}
      {test.error && <p><span className={styles.name}>error</span><code className={styles.gotBad}>{test.error}</code></p>}
    </div>
  );
}
