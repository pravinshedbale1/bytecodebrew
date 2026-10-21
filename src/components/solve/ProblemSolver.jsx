import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import {
  Play, Send, RotateCcw, ExternalLink, CheckCircle2, XCircle, AlertTriangle, BookOpen, Timer,
  FileText, History, Code2, SquareCheckBig, Terminal, Plus, X, Loader2, CircleDot, Lightbulb, Repeat, Mountain, Sunrise, BookOpenCheck,
} from 'lucide-react';
import { getLessonContext } from '../../curriculum';
import { CodeEditor } from './CodeEditor';
import { Inline } from './Inline';
import { SolutionTab } from './SolutionTab';
import { useSplit } from './useSplit';
import { loadProblem, exampleCount } from '../../lib/judge/problems';
import { runTests } from '../../lib/judge/runner';
import { LANGS, LANG_IDS, langOf } from '../../lib/judge/langs';
import { preferredLang, setPreferredLang, readDraft, writeDraft } from '../../lib/judge/drafts';
import { useSubmissions, readLocalSubs } from '../../lib/submissions';
import { markSolved, useSolved } from '../../hooks/useSolved';
import { recordSubmission, recordResolve, resolveStatus, noteHint } from '../../lib/coach/store';
import { RESOLVE_MINUTES } from '../../lib/coach/model';
import { isViewingAs } from '../../lib/viewAs';
import ui from '../common/ui.module.css';
import styles from './ProblemSolver.module.css';

/** What the editor opens with: the draft, else the latest submission in that language, else the starter. */
function initialCode(spec, slug, lang) {
  return readDraft(slug, lang) ?? readLocalSubs(slug).find((s) => s.lang === lang)?.code ?? langOf(lang).starter(spec);
}

/** Names for each test input, for display. */
function inputNames(spec) {
  if (spec.params) return spec.params.map(([, n]) => n);
  return ['operations', 'arguments'];
}

const STATUS = {
  accepted: { label: 'Accepted', icon: CheckCircle2, cls: 'ok' },
  wrong: { label: 'Wrong Answer', icon: XCircle, cls: 'bad' },
  error: { label: 'Runtime Error', icon: AlertTriangle, cls: 'bad' },
  slow: { label: 'Correct, but too slow', icon: Timer, cls: 'bad' },
  compile: { label: 'Compile Error', icon: AlertTriangle, cls: 'bad' },
  ran: { label: 'Finished', icon: CheckCircle2, cls: 'neutral' },
};

const validJson = (s) => {
  try {
    JSON.parse(s);
    return true;
  } catch {
    return false;
  }
};

/**
 * A LeetCode-style workspace for one practice problem: the description and your submissions on the
 * left, with the worked solution beside them (not in a mock); the editor, editable test cases and
 * results on the right, with draggable dividers.
 * "Run" runs the cases in the Testcase tab (your own included); "Submit" runs every test, and
 * passing them all marks the problem solved. Code is written in Java, C++, Python or JavaScript;
 * drafts are kept in this browser, submissions also in the account (src/lib/submissions.js).
 */
export function ProblemSolver({ slug, compact = false }) {
  const [spec, setSpec] = useState(undefined);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [cases, setCases] = useState([]);
  const [caseIdx, setCaseIdx] = useState(0);
  const [resultIdx, setResultIdx] = useState(0);
  const [leftTab, setLeftTab] = useState('description');
  const [bottomTab, setBottomTab] = useState('testcase');
  const [lang, setLang] = useState(preferredLang);
  const langRef = useRef(lang);
  langRef.current = lang;
  const [subs, addSub] = useSubmissions(slug);
  const { isSolved } = useSolved();
  // Daily Coach: ?coach=resolve is a timed re-solve from memory, ?coach=stretch today's stretch problem
  const [params] = useSearchParams();
  const coachMode = compact ? null : params.get('coach');
  const resolve = useResolve(slug, coachMode === 'resolve');
  const resolving = resolve.active;
  const resolvingRef = useRef(resolving);
  resolvingRef.current = resolving;

  // the mock round has less room, so it keeps its own divider positions
  const where = compact ? 'mock' : 'solve';
  const [colPct, colHandle, rowRef] = useSplit(`bcb:split:${where}-x`, compact ? 36 : 42, { axis: 'x', min: 22, max: 70 });
  const [rowPct, rowHandle, colRef] = useSplit(`bcb:split:${where}-y`, compact ? 64 : 62, { axis: 'y', min: 25, max: 85 });

  const examples = useMemo(() => (spec ? spec.tests.slice(0, exampleCount(spec)) : []), [spec]);

  useEffect(() => {
    let alive = true;
    setSpec(undefined);
    setResult(null);
    setError(null);
    setBottomTab('testcase');
    setLeftTab('description');
    loadProblem(slug).then((p) => {
      if (!alive) return;
      setSpec(p);
      if (!p) return;
      setCode(resolvingRef.current ? langOf(langRef.current).starter(p) : initialCode(p, slug, langRef.current));
      setCases(p.tests.slice(0, exampleCount(p)).map((t) => ({ in: [...t.in], out: t.out, original: [...t.in] })));
      setCaseIdx(0);
    });
    return () => { alive = false; };
  }, [slug]);

  useEffect(() => {
    if (!spec || resolving) return undefined;     // a re-solve never overwrites the saved draft
    const t = setTimeout(() => writeDraft(slug, lang, code), 400);
    return () => clearTimeout(t);
  }, [code, slug, spec, lang, resolving]);

  // On a new device the account's submissions arrive after the problem opens: if the editor still
  // holds untouched starter code, pick up the latest submission in this language.
  useEffect(() => {
    if (!spec || resolvingRef.current || code !== langOf(lang).starter(spec)) return;
    // admin "view as": open the learner's latest submission in its own language (the admin's
    // language preference is left alone)
    if (isViewingAs() && subs[0] && subs[0].lang !== lang) {
      setLang(subs[0].lang);
      setCode(subs[0].code);
      return;
    }
    const latest = subs.find((s) => s.lang === lang)?.code;
    if (latest && latest !== code) setCode(latest);
    // only when the submissions change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subs]);

  if (spec === undefined) return <p className={styles.loading}>Loading the problem…</p>;
  if (spec === null) return <p className={styles.loading}>This problem has no built-in tests yet.</p>;

  const names = inputNames(spec);

  const switchLang = (next, nextCode) => {
    if (next === lang && nextCode === undefined) return;
    if (!resolving) writeDraft(slug, lang, code);
    setPreferredLang(next);
    setLang(next);
    setCode(nextCode ?? (resolving ? langOf(next).starter(spec) : initialCode(spec, slug, next)));
    setResult(null);
    setError(null);
  };

  const run = async (mode) => {
    if (busy) return;
    if (isViewingAs()) { setError('This is a read-only view of another learner: running and submitting are off. Their latest submission is in the editor and the Submissions tab.'); return; }
    let tests;
    if (mode === 'submit') tests = spec.tests;
    else {
      const bad = cases.findIndex((c) => c.in.some((v) => !validJson(v)));
      if (bad >= 0) {
        setBottomTab('testcase');
        setCaseIdx(bad);
        setError(`Case ${bad + 1}: each input must be valid JSON, like [1,2,3], 5 or "abc".`);
        return;
      }
      tests = cases.map((c) => (c.out !== undefined && c.in.every((v, k) => v === c.original?.[k]) ? { in: c.in, out: c.out } : { in: c.in }));
    }
    const runLang = lang;
    setBusy(mode);
    setError(null);
    setBottomTab('result');
    try {
      const r = await runTests(spec, code, tests, runLang);
      setResult({ ...r, mode });
      const firstFail = r.tests.findIndex((t) => t.pass === false);
      setResultIdx(firstFail >= 0 ? firstFail : 0);
      if (mode === 'submit') {
        const accepted = r.status === 'accepted';
        if (resolving) {
          if (accepted) resolve.finish(true);
        } else {
          recordSubmission(slug, { accepted, firstTry: !subs.some((x) => x.status !== 'accepted') });
        }
        if (accepted) markSolved(slug);
        addSub({
          at: Date.now(),
          lang: runLang,
          status: r.status,
          passed: r.tests.filter((t) => t.pass).length,
          total: r.tests.length,
          time: r.time ?? null,
          code,
        });
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  };

  const reset = () => {
    if (window.confirm('Replace your code with the starter code?')) {
      setCode(langOf(lang).starter(spec));
      setResult(null);
    }
  };

  const editCase = (k, v) => setCases((cs) => cs.map((c, i) => (i === caseIdx ? { ...c, in: c.in.map((x, j) => (j === k ? v : x)) } : c)));
  const addCase = () => {
    setCases((cs) => [...cs, { in: [...(cs[caseIdx] ?? cs[0]).in] }]);
    setCaseIdx(cases.length);
  };
  const removeCase = (i) => {
    setCases((cs) => cs.filter((_, j) => j !== i));
    setCaseIdx((c) => Math.max(0, c >= i ? c - 1 : c));
  };
  const resetCases = () => {
    setCases(examples.map((t) => ({ in: [...t.in], out: t.out, original: [...t.in] })));
    setCaseIdx(0);
  };
  const casesEdited = cases.length !== examples.length || cases.some((c) => c.in.some((v, k) => v !== c.original?.[k]));

  const workStyle = { '--col': `${colPct}%`, '--row': `${rowPct}%` };

  return (
    <div className={`${styles.workspace} ${compact ? styles.compact : ''}`} ref={rowRef} style={workStyle}>
      {/* ---- left: description and submissions */}
      <section className={`${styles.panel} ${styles.left}`}>
        <div className={styles.panelHead} role="tablist" aria-label="Problem">
          <TabButton active={leftTab === 'description'} onClick={() => setLeftTab('description')} icon={FileText}>Description</TabButton>
          <TabButton active={leftTab === 'submissions'} onClick={() => setLeftTab('submissions')} icon={History}>
            Submissions{subs.length ? <span className={styles.count}>{subs.length}</span> : null}
          </TabButton>
          {/* a mock interview is a test: no worked solution there */}
          {!compact && <TabButton active={leftTab === 'solution'} onClick={() => setLeftTab('solution')} icon={BookOpenCheck}>Solution</TabButton>}
        </div>
        <div className={styles.panelBody}>
          {leftTab === 'description' ? (
            <>
              {coachMode && <CoachBanner mode={coachMode} resolve={resolve} />}
              <Description spec={spec} slug={slug} examples={examples} names={names} solved={isSolved(slug)} compact={compact} lang={lang} hideHints={resolving} />
            </>
          ) : leftTab === 'solution' ? (
            resolving
              ? <p className={styles.empty}>The solution is hidden until this re-solve ends.</p>
              : <SolutionTab key={slug} spec={spec} slug={slug} solved={isSolved(slug)} lang={lang} />
          ) : resolving ? (
            <p className={styles.empty}>Your earlier submissions are hidden until this re-solve ends.</p>
          ) : (
            <Submissions subs={subs} onLoad={(s) => { switchLang(s.lang, s.code); setLeftTab('description'); }} />
          )}
        </div>
      </section>

      <div className={`${styles.divider} ${styles.dividerX}`} {...colHandle} aria-label="Resize problem and editor" />

      {/* ---- right: editor and console */}
      <div className={styles.right} ref={colRef}>
        <section className={`${styles.panel} ${styles.editorPanel}`}>
          <div className={styles.panelHead}>
            <span className={styles.headLabel}><Code2 size={14} aria-hidden="true" /> Code</span>
            <select
              className={`${styles.lang} ${styles.langSelect}`}
              value={lang}
              onChange={(e) => switchLang(e.target.value)}
              disabled={Boolean(busy)}
              aria-label="Language"
              title={LANGS[lang].version}
            >
              {LANG_IDS.map((id) => <option key={id} value={id}>{LANGS[id].label}</option>)}
            </select>
            <div className={styles.actions}>
              <button type="button" className={styles.iconBtn} onClick={reset} title="Reset to starter code" aria-label="Reset to starter code">
                <RotateCcw size={14} />
              </button>
              <button type="button" className={`${ui.btn} ${ui.small}`} onClick={() => run('run')} disabled={Boolean(busy)} title="Run the test cases (Ctrl/⌘ Enter)">
                {busy === 'run' ? <Loader2 size={13} className={styles.spin} /> : <Play size={13} />} Run
              </button>
              <button type="button" className={`${ui.btn} ${ui.primary} ${ui.small}`} onClick={() => run('submit')} disabled={Boolean(busy)} title="Run every test">
                {busy === 'submit' ? <Loader2 size={13} className={styles.spin} /> : <Send size={13} />} Submit
              </button>
            </div>
          </div>
          <div className={styles.editorBody}>
            <CodeEditor value={code} onChange={setCode} onRun={() => run('run')} height="100%" language={lang} />
          </div>
        </section>

        <div className={`${styles.divider} ${styles.dividerY}`} {...rowHandle} aria-label="Resize editor and console" />

        <section className={`${styles.panel} ${styles.console}`}>
          <div className={styles.panelHead} role="tablist" aria-label="Console">
            <TabButton active={bottomTab === 'testcase'} onClick={() => setBottomTab('testcase')} icon={SquareCheckBig}>Testcase</TabButton>
            <TabButton active={bottomTab === 'result'} onClick={() => setBottomTab('result')} icon={Terminal}>Test Result</TabButton>
          </div>
          <div className={styles.panelBody} aria-live="polite">
            {error && <p className={`${ui.error} ${styles.consoleError}`}>{error}</p>}
            {bottomTab === 'testcase' ? (
              <>
                <div className={styles.caseTabs}>
                  {cases.map((c, i) => (
                    <span key={i} className={`${styles.caseChip} ${i === caseIdx ? styles.caseChipOn : ''}`}>
                      <button type="button" onClick={() => setCaseIdx(i)}>Case {i + 1}</button>
                      {cases.length > 1 && i >= examples.length && (
                        <button type="button" className={styles.caseX} onClick={() => removeCase(i)} aria-label={`Remove case ${i + 1}`}><X size={11} /></button>
                      )}
                    </span>
                  ))}
                  {cases.length < 8 && (
                    <button type="button" className={styles.caseAdd} onClick={addCase} aria-label="Add a test case" title="Add a test case (a copy of this one, to edit)"><Plus size={14} /></button>
                  )}
                  {casesEdited && <button type="button" className={styles.linkBtn} onClick={resetCases}>Reset cases</button>}
                </div>
                {cases[caseIdx] && (
                  <div className={styles.fields}>
                    {cases[caseIdx].in.map((v, k) => (
                      <label key={k} className={styles.field}>
                        <span className={styles.fieldName}>{names[k] ?? `input ${k + 1}`} =</span>
                        <textarea
                          className={`${styles.input} ${validJson(v) ? '' : styles.inputBad}`}
                          value={v}
                          onChange={(e) => editCase(k, e.target.value)}
                          rows={Math.min(6, Math.max(1, Math.ceil(v.length / 70)))}
                          spellCheck={false}
                        />
                      </label>
                    ))}
                    <p className={styles.caseNote}>
                      {cases[caseIdx].out !== undefined && cases[caseIdx].in.every((v, k) => v === cases[caseIdx].original?.[k])
                        ? <>Expected output: <code>{cases[caseIdx].out}</code></>
                        : 'Your own case: Run shows your output; there is no expected answer to compare with.'}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <TestResult busy={busy} result={result} names={names} idx={resultIdx} setIdx={setResultIdx} spec={spec} />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, children }) {
  return (
    <button type="button" role="tab" aria-selected={active} className={`${styles.tab} ${active ? styles.tabOn : ''}`} onClick={onClick}>
      <Icon size={14} aria-hidden="true" /> {children}
    </button>
  );
}

/** What each language provides beyond the language itself, as on LeetCode. */
const LANG_NOTES = {
  cpp: 'C++: every standard header is included, with using namespace std.',
  python: 'Python: typing, collections, heapq, bisect, functools, itertools and math are imported.',
  javascript: 'JavaScript: PriorityQueue, MinPriorityQueue, MaxPriorityQueue and Queue (datastructures-js) are available.',
};

function Description({ spec, slug, examples, names, solved, compact, lang, hideHints = false }) {
  const l = langOf(lang);
  const hasPerf = spec.tests.some((t) => t.perf);
  const testCount = l.perf ? spec.tests.length : spec.tests.filter((t) => !t.perf).length;
  return (
    <div className={styles.description}>
      <h1 className={styles.title}>{spec.title}</h1>
      <div className={styles.chips}>
        <span className={`${styles.level} ${styles[spec.level.toLowerCase()]}`}>{spec.level}</span>
        {solved && <span className={styles.solved}><CheckCircle2 size={13} /> Solved</span>}
        {!compact && <Link className={styles.chip} to={`/dsa/patterns/${spec.lesson}`}><BookOpen size={12} aria-hidden="true" /> Pattern lesson</Link>}
        <a className={styles.chip} href={`https://leetcode.com/problems/${slug}/`} target="_blank" rel="noopener noreferrer">
          LeetCode <ExternalLink size={11} aria-hidden="true" />
        </a>
      </div>
      {spec.statement ? <Statement text={spec.statement} /> : <p className={styles.summary}>{spec.summary}</p>}

      {examples.map((t, i) => (
        <div key={i} className={styles.example}>
          <p className={styles.exampleTitle}>Example {i + 1}:</p>
          <pre className={styles.exampleBody}>
            <strong>Input:</strong> {t.in.map((v, k) => `${names[k] ?? `input${k + 1}`} = ${v}`).join(', ')}{'\n'}
            <strong>Output:</strong> {t.out}
          </pre>
          {i === 0 && spec.explain && (
            <p className={styles.exampleExplain}><strong>Explanation:</strong> <Inline text={spec.explain} /></p>
          )}
        </div>
      ))}

      {spec.constraints?.length > 0 && (
        <div className={styles.block}>
          <p className={styles.exampleTitle}>Constraints:</p>
          <ul className={styles.constraints}>
            {spec.constraints.map((c) => <li key={c}><Inline text={prettyConstraint(c)} /></li>)}
          </ul>
        </div>
      )}

      {spec.hints?.length > 0 && (hideHints
        ? <p className={styles.hint}><Lightbulb size={14} aria-hidden="true" /> Hints are hidden during a re-solve from memory.</p>
        : <Hints key={slug} hints={spec.hints} onReveal={() => noteHint(slug)} />)}

      <div className={styles.judging}>
        <p className={styles.exampleTitle}>Judging</p>
        <ul>
          <li>Submit runs {testCount} tests, including edge cases{hasPerf && l.perf ? ' and a large input that needs an efficient solution' : ''}.</li>
          {hasPerf && !l.perf && <li>The large-input timing test runs in Java only for now; in {l.label}, Submit checks every correctness test.</li>}
          {LANG_NOTES[lang] && <li>{LANG_NOTES[lang]}</li>}
          {(spec.check === 'any-order' || spec.check === 'any-order-deep') && <li>The answer may be in any order.</li>}
          {spec.check?.startsWith('custom:') && <li>Any valid answer is accepted.</li>}
          <li>The statement and hints here are our own; LeetCode has the original wording.</li>
        </ul>
      </div>
      <p className={styles.mobileNote}>
        Coding is easier on a larger screen. Your code is saved in this browser, and your submissions in your account when you are signed in.
      </p>
    </div>
  );
}

const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '-': '⁻' };
const sup = (s) => [...s].map((c) => SUP[c] ?? c).join('');

/** '1 <= nums.length <= 1e5' → '1 ≤ nums.length ≤ 10⁵'; quantities become code. */
export function prettyConstraint(c) {
  const parsed = /<=|<|==/.test(c);
  let t = c
    .replace(/(\d+)e(\d+)/g, (_, a, b) => (a === '1' ? `10${sup(b)}` : `${a} × 10${sup(b)}`))
    .replace(/(\d+)\^(-?\d+)/g, (_, a, b) => `${a}${sup(b)}`)
    .replace(/<=/g, '≤')
    .replace(/\s\*\s/g, ' × ');
  if (parsed) t = t.replace(/(?<![\w`])([A-Za-z_]\w*(?:\[[ij0]\])*(?:\.\w+)?(?:\[[ij0]\])*)/g, '`$1`');
  return t.replace(/`(\w+)\.nodes`/g, 'the number of nodes in `$1`');
}

/** Paragraphs separated by blank lines; lines starting with "- " form a list. */
export function Statement({ text }) {
  return (
    <div className={styles.statement}>
      {text.split(/\n\s*\n/).map((para, i) => {
        const lines = para.split('\n');
        if (lines.every((l) => l.startsWith('- '))) {
          return <ul key={i}>{lines.map((l, k) => <li key={k}><Inline text={l.slice(2)} /></li>)}</ul>;
        }
        return <p key={i}><Inline text={lines.join(' ')} /></p>;
      })}
    </div>
  );
}

/** Hints revealed one at a time, so you take only as much help as you need. */
function Hints({ hints, onReveal }) {
  const [shown, setShown] = useState(0);
  return (
    <div className={styles.block}>
      <p className={styles.exampleTitle}>Hints</p>
      <ol className={styles.hints}>
        {hints.slice(0, shown).map((h, i) => (
          <li key={i}><span className={styles.hintNo}>Hint {i + 1}</span><Inline text={h} /></li>
        ))}
      </ol>
      {shown < hints.length && (
        <button type="button" className={`${ui.btn} ${ui.ghost} ${ui.small}`} onClick={() => { setShown((n) => n + 1); onReveal?.(); }}>
          <Lightbulb size={13} aria-hidden="true" /> {shown === 0 ? 'Show a hint' : `Show hint ${shown + 1} of ${hints.length}`}
        </button>
      )}
    </div>
  );
}

function Submissions({ subs, onLoad }) {
  const [open, setOpen] = useState(null);
  if (!subs.length) return <p className={styles.empty}>No submissions yet. Submit runs every test and records the result here.</p>;
  return (
    <ul className={styles.subs}>
      {subs.map((s, i) => {
        const st = STATUS[s.status] ?? STATUS.error;
        return (
          <li key={s.at}>
            <button type="button" className={styles.subRow} onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
              <span className={`${styles.subStatus} ${styles[st.cls]}`}>{st.label}</span>
              <span className={styles.subMeta}>{langOf(s.lang).label}</span>
              <span className={styles.subMeta}>{s.status === 'compile' ? '—' : `${s.passed}/${s.total} tests`}</span>
              <span className={styles.subMeta}>{s.time ? `${s.time}s` : ''}</span>
              <span className={styles.subMeta}>{new Date(s.at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
            </button>
            {open === i && (
              <div className={styles.subCode}>
                <pre>{s.code}</pre>
                <button type="button" className={`${ui.btn} ${ui.small}`} onClick={() => { if (window.confirm('Replace the code in the editor with this submission?')) onLoad(s); }}>
                  Load into editor
                </button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function TestResult({ busy, result, names, idx, setIdx, spec }) {
  if (busy) {
    return (
      <p className={styles.pending}>
        <Loader2 size={15} className={styles.spin} /> {busy === 'submit' ? 'Judging every test…' : 'Running your code…'}
      </p>
    );
  }
  if (!result) return <p className={styles.empty}>You must run your code first.</p>;
  const status = STATUS[result.status];
  const shown = result.tests;
  const graded = shown.filter((t) => t.pass !== null);
  const passed = graded.filter((t) => t.pass).length;
  return (
    <div>
      <p className={`${styles.verdict} ${styles[status.cls]}`}>
        {status.label}
        {result.time && <span className={styles.runtime}>Runtime: {result.time}s</span>}
      </p>
      {result.status !== 'compile' && graded.length > 0 && (
        <p className={styles.passed}>
          {passed} / {graded.length} {result.mode === 'submit' ? 'test cases passed' : 'cases passed'}
          {result.mode === 'submit' && result.status === 'accepted' && ' · marked solved'}
        </p>
      )}
      {result.compile && <pre className={`${styles.out} ${styles.outBad}`}>{result.compile}</pre>}
      {shown.length > 0 && (
        <>
          <div className={styles.caseTabs}>
            {shown.map((t, i) => (
              <span key={i} className={`${styles.caseChip} ${i === idx ? styles.caseChipOn : ''}`}>
                <button type="button" onClick={() => setIdx(i)}>
                  {t.pass === true && <CheckCircle2 size={12} className={styles.ok} />}
                  {t.pass === false && <XCircle size={12} className={styles.bad} />}
                  {t.pass === null && <CircleDot size={12} className={styles.neutral} />}
                  {t.perf ? 'Performance' : `Case ${i + 1}`}
                </button>
              </span>
            ))}
          </div>
          <CaseView test={shown[idx]} names={names} />
        </>
      )}
      {result.stdout && (
        <div className={styles.field}>
          <span className={styles.fieldName}>Stdout</span>
          <pre className={styles.out}>{result.stdout}</pre>
        </div>
      )}
      {result.status !== 'accepted' && result.status !== 'ran' && <PatternHint spec={spec} />}
    </div>
  );
}

/** After a failed run: point back to the pattern lesson (the section that works through this problem, when there is one). */
function PatternHint({ spec }) {
  const lesson = getLessonContext('dsa', 'patterns', spec.lesson)?.lesson;
  if (!lesson) return null;
  return (
    <p className={styles.hint}>
      <BookOpen size={14} aria-hidden="true" />
      Stuck?{' '}
      <Link to={`${lesson.path}${spec.anchor ? `#${spec.anchor}` : ''}`}>
        {spec.anchor ? `See how ${lesson.title} works through this problem` : `Revisit the pattern: ${lesson.title}`}
      </Link>
    </p>
  );
}

function Field({ name, children, tone }) {
  return (
    <div className={styles.field}>
      <span className={styles.fieldName}>{name}</span>
      <pre className={`${styles.out} ${tone ? styles[tone] : ''}`}>{children}</pre>
    </div>
  );
}

function CaseView({ test, names }) {
  if (!test) return null;
  if (test.perf) {
    return (
      <>
        <Field name="Input">Large generated input: {test.perf.label}</Field>
        {test.pass && <Field name="Result" tone="outOk">Correct, in {test.ms} ms (limit {test.limitMs} ms)</Field>}
        {!test.pass && test.got !== undefined && !test.slow && <Field name="Result" tone="outBad">Finished, but the answer differs from the reference</Field>}
        {test.slow && <Field name="Result" tone="outBad">Correct answer, but an efficient solution is needed — look for the pattern that avoids repeated work</Field>}
        {test.error && !test.slow && <Field name="Error" tone="outBad">{test.error}</Field>}
      </>
    );
  }
  return (
    <>
      <div className={styles.field}>
        <span className={styles.fieldName}>Input</span>
        {test.input.map((v, k) => (
          <pre key={k} className={styles.out}><span className={styles.inName}>{names[k] ?? `input ${k + 1}`} =</span>{'\n'}{v}</pre>
        ))}
      </div>
      {test.error && <Field name="Error" tone="outBad">{test.error}</Field>}
      {test.got !== undefined && <Field name="Output" tone={test.pass === false ? 'outBad' : undefined}>{test.got}</Field>}
      {test.expected !== undefined && <Field name="Expected">{test.expected}</Field>}
    </>
  );
}

/**
 * A re-solve from memory (Daily Coach): a RESOLVE_MINUTES timer that survives a reload of the tab;
 * an accepted submission in time passes, running out of time or giving up fails. A problem already
 * re-solved today opens finished.
 */
function useResolve(slug, enabled) {
  const key = `bcb:resolve:${slug}`;
  const [startedAt] = useState(() => {
    if (!enabled) return null;
    try {
      const saved = Number(sessionStorage.getItem(key));
      if (saved) return saved;
      sessionStorage.setItem(key, String(Date.now()));
    } catch { /* storage unavailable: the timer starts now */ }
    return Date.now();
  });
  const [done, setDone] = useState(() => (enabled ? resolveStatus(slug).result : null));
  const [now, setNow] = useState(() => Date.now());
  const active = enabled && !done;

  useEffect(() => {
    if (!active) return undefined;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [active]);

  const finish = useCallback((pass) => {
    if (!enabled || done) return;
    recordResolve(slug, pass);
    setDone({ pass });
    try { sessionStorage.removeItem(key); } catch { /* ignore */ }
  }, [enabled, done, slug, key]);

  const left = startedAt ? startedAt + RESOLVE_MINUTES * 60000 - now : 0;
  useEffect(() => { if (active && left <= 0) finish(false); }, [active, left, finish]);
  return { enabled, active, left, done, finish };
}

const mmss = (ms) => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

function CoachBanner({ mode, resolve }) {
  const back = <Link to="/today" className={styles.coachBack}><Sunrise size={13} aria-hidden="true" /> Back to Today</Link>;
  if (mode === 'resolve' && resolve.enabled) {
    if (resolve.active) {
      return (
        <div className={`${styles.coachBanner} ${resolve.left < 120000 ? styles.coachLow : ''}`} role="status">
          <Repeat size={16} aria-hidden="true" />
          <span><strong>Re-solve from memory · {mmss(resolve.left)} left.</strong> Submit a passing solution before time runs out. Hints and your earlier submissions are hidden until you finish.</span>
          <button type="button" className={`${ui.btn} ${ui.ghost} ${ui.small}`} onClick={() => { if (window.confirm('End this re-solve as not recalled? It will come back in 2 days.')) resolve.finish(false); }}>I can’t recall it</button>
        </div>
      );
    }
    return (
      <div className={`${styles.coachBanner} ${resolve.done?.pass ? styles.coachOk : ''}`} role="status">
        <Repeat size={16} aria-hidden="true" />
        <span>{resolve.done?.pass
          ? <><strong>Passed from memory.</strong> It comes back later, further apart each time.</>
          : <><strong>Not this time.</strong> It comes back in 2 days. Your earlier solution is in the Submissions tab.</>}</span>
        {back}
      </div>
    );
  }
  if (mode === 'stretch') {
    return (
      <div className={styles.coachBanner} role="note">
        <Mountain size={16} aria-hidden="true" />
        <span><strong>Today’s stretch problem:</strong> one step harder, in your weakest pattern. Take your time; it counts whenever you solve it today.</span>
        {back}
      </div>
    );
  }
  return null;
}
