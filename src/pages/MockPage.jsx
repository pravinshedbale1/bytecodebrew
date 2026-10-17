import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Play, Pause, Square, Shuffle, ExternalLink, History, Trash2, Sparkles, Code2 } from 'lucide-react';
import { PageLayout, RailCard } from '../components/layout/PageLayout';
import { AiInterviewer, requestFeedback } from '../components/mock/AiInterviewer';
import { ProblemSolver } from '../components/solve/ProblemSolver';
import { MOCK_TYPES, SIGNALS, phaseAt } from '../data/mockInterviews';
import { useMocks } from '../hooks/useLearning';
import { useSolved } from '../hooks/useSolved';
import { getApiKey } from '../lib/claude';
import { MiniMarkdown } from '../lib/miniMarkdown';
import { readJSON, writeJSON } from '../lib/storage';
import ui from '../components/common/ui.module.css';
import page from './Page.module.css';
import styles from '../components/mock/Mock.module.css';

const LIVE = 'bcb:mock-live';
const mmss = (s) => `${s < 0 ? '-' : ''}${String(Math.floor(Math.abs(s) / 60)).padStart(2, '0')}:${String(Math.abs(s) % 60).padStart(2, '0')}`;

/** Timed mock interviews with phases, a scratchpad, an optional AI interviewer and a self-scoring rubric. */
export function MockPage() {
  const [params] = useSearchParams();
  const { isSolved } = useSolved();
  const { mocks, addMock, updateMock, removeMock } = useMocks();
  const [session, setSession] = useState(() => readJSON(LIVE, null));
  const [typeId, setTypeId] = useState(() => (MOCK_TYPES[params.get('type')] ? params.get('type') : 'dsa'));
  const [viewing, setViewing] = useState(null);
  const [level, setLevel] = useState('Medium');

  useEffect(() => writeJSON(LIVE, session), [session]);

  const start = () => {
    const type = MOCK_TYPES[typeId];
    setSession({ typeId, level, prompt: type.pick(isSolved, level), seconds: 0, running: true, notes: '', chat: [], stage: 'live', rubric: {}, signal: null });
    setViewing(null);
  };

  const rail = (
    <RailCard title="Past mocks" icon={<History size={14} aria-hidden="true" />}>
      {mocks.length === 0 ? (
        <p className={ui.help} style={{ marginTop: 0 }}>Your scored mocks will be listed here.</p>
      ) : (
        <ul className={styles.history}>
          {mocks.slice(0, 12).map((m) => {
            const t = MOCK_TYPES[m.type];
            const met = Object.values(m.rubric ?? {}).filter(Boolean).length;
            return (
              <li key={m.at}>
                <button type="button" className={styles.historyItem} onClick={() => { setViewing(m); }}>
                  <span className={styles.historyTitle}>{m.prompt.title}</span>
                  <span className={styles.historyMeta}>
                    {t?.title} · {new Date(m.at).toLocaleDateString()} · {met}/{t?.rubric.length ?? 0}
                    {m.signal && ` · ${SIGNALS.find((s) => s.id === m.signal)?.label}`}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <RubricGaps mocks={mocks} />
    </RailCard>
  );

  return (
    <PageLayout rail={rail}>
      <header className={page.header}>
        <p className={page.eyebrow}>Practise</p>
        <h1 className={page.title}>Mock interview</h1>
        <p className={page.lead}>
          A timed round with the same phases a real interviewer expects. Think out loud, keep notes, then score yourself
          honestly. Add Claude as the interviewer if you want follow-up questions and written feedback.
        </p>
      </header>

      {viewing ? (
        <PastMock mock={viewing} onClose={() => setViewing(null)} onDelete={() => { removeMock(viewing.at); setViewing(null); }} onFeedback={(fb) => { updateMock(viewing.at, { aiFeedback: fb }); setViewing({ ...viewing, aiFeedback: fb }); }} />
      ) : !session ? (
        <section className={ui.panel}>
          <h2 className={ui.panelTitle}>Pick a round</h2>
          <div className={styles.types}>
            {Object.entries(MOCK_TYPES).map(([id, t]) => (
              <button key={id} type="button" className={`${styles.type} ${typeId === id ? styles.typeActive : ''}`} onClick={() => setTypeId(id)} aria-pressed={typeId === id}>
                <span className={styles.typeMeta}>{t.minutes} min · {t.phases.length} phases</span>
                <span className={styles.typeTitle}>{t.title}</span>
                <span className={styles.typeBlurb}>{t.blurb}</span>
              </button>
            ))}
          </div>
          {MOCK_TYPES[typeId].levels && (
            <div className={`${ui.chips} ${styles.levels}`} role="group" aria-label="Difficulty">
              <span className={styles.levelsLabel}>Difficulty</span>
              {MOCK_TYPES[typeId].levels.map((lv) => (
                <button key={lv} type="button" className={ui.chip} aria-pressed={level === lv} onClick={() => setLevel(lv)}>
                  {lv === 'Any' ? 'Medium or hard' : lv}
                </button>
              ))}
            </div>
          )}
          <div className={styles.phasePreview}>
            {MOCK_TYPES[typeId].phases.map((p) => (
              <span key={p.name} style={{ flex: p.min }}>{p.name}<em>{p.min}m</em></span>
            ))}
          </div>
          <button type="button" className={`${ui.btn} ${ui.primary}`} onClick={start}>
            <Play size={15} /> Start the {MOCK_TYPES[typeId].title} round
          </button>
        </section>
      ) : (
        <LiveMock
          session={session}
          setSession={setSession}
          onSave={(m) => { addMock(m); setSession(null); setViewing(m); }}
          onDiscard={() => setSession(null)}
          isSolved={isSolved}
        />
      )}
    </PageLayout>
  );
}

function LiveMock({ session, setSession, onSave, onDiscard, isSolved }) {
  const type = MOCK_TYPES[session.typeId];
  const total = type.minutes * 60;
  const { index, phase, phaseLeft, overtime } = phaseAt(type.phases, session.seconds);
  const patch = (p) => setSession((s) => ({ ...s, ...(typeof p === 'function' ? p(s) : p) }));
  const sessionRef = useRef(session);
  sessionRef.current = session;

  useEffect(() => {
    if (!session.running || session.stage !== 'live') return undefined;
    const t = setInterval(() => setSession((s) => ({ ...s, seconds: s.seconds + 1 })), 1000);
    return () => clearInterval(t);
  }, [session.running, session.stage, setSession]);

  const finish = () => patch({ running: false, stage: 'score' });
  // a different prompt is allowed in the first minute, before the AI interviewer has started
  const canShuffle = session.stage === 'live' && session.seconds < 60 && !session.chat.length;
  const shuffle = () => patch({ prompt: type.pick(isSolved, session.level), seconds: 0 });
  const save = () =>
    onSave({
      at: new Date().toISOString(),
      type: session.typeId,
      prompt: session.prompt,
      seconds: session.seconds,
      notes: session.notes,
      chat: session.chat.filter((m) => !m.hidden).slice(-40),
      code: session.prompt.slug ? readJSON(`bcb:code:${session.prompt.slug}`, null) : null,
      rubric: session.rubric,
      signal: session.signal,
    });

  return (
    <>
      {!session.prompt.slug && (
      <section className={`${ui.panel} ${styles.promptBox}`}>
        <p className={styles.promptKind}>{type.title} · {session.prompt.detail}</p>
        {!session.prompt.slug && (
          <h2 className={styles.promptTitle}>
            {session.prompt.href ? (
              <a href={session.prompt.href} target="_blank" rel="noopener noreferrer">{session.prompt.title} <ExternalLink size={14} /></a>
            ) : session.prompt.title}
          </h2>
        )}
        {session.prompt.questions && (
          <ol className={styles.questions}>
            {session.prompt.questions.map((q, i) => <li key={q} className={i === index ? styles.currentQ : ''}>{q}</li>)}
          </ol>
        )}
        {canShuffle && (
          <button type="button" className={`${ui.btn} ${ui.ghost} ${ui.small}`} onClick={shuffle}>
            <Shuffle size={13} /> Different prompt
          </button>
        )}
      </section>
      )}

      <section className={`${ui.panel} ${styles.timerBox}`}>
        <div className={styles.timerRow}>
          <div>
            <p className={styles.clock}>{mmss(session.seconds)} <span>/ {mmss(total)}</span></p>
            <p className={styles.phaseNow}>
              {overtime ? <span className={styles.over}>Over time by {mmss(overtime)}</span> : <>Now: <strong>{phase.name}</strong> · {mmss(phaseLeft)} left in this phase</>}
            </p>
          </div>
          {session.stage === 'live' && (
            <div className={ui.row}>
              {session.prompt.slug && canShuffle && (
                <button type="button" className={`${ui.btn} ${ui.ghost}`} onClick={shuffle}><Shuffle size={14} /> Different problem</button>
              )}
              <button type="button" className={ui.btn} onClick={() => patch((s) => ({ running: !s.running }))}>
                {session.running ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Resume</>}
              </button>
              <button type="button" className={`${ui.btn} ${ui.primary}`} onClick={finish}><Square size={14} /> End & score</button>
            </div>
          )}
        </div>
        <div className={styles.phases}>
          {type.phases.map((p, i) => (
            <span key={p.name} style={{ flex: p.min }} className={i < index || overtime ? styles.phaseDone : i === index ? styles.phaseCurrent : ''}>
              {p.name}
            </span>
          ))}
        </div>
      </section>

      {session.stage === 'live' && session.prompt.slug && (
        <section className={`${ui.panel} ${styles.solverBox}`}>
          <ProblemSolver slug={session.prompt.slug} compact />
        </section>
      )}

      {session.stage === 'live' ? (
        <div className={styles.liveGrid}>
          <section className={ui.panel}>
            <label className={ui.panelTitle} htmlFor="mock-notes">Scratchpad</label>
            <p className={ui.panelLead}>Requirements, examples, the approach, complexity… whatever you would say out loud.</p>
            <textarea id="mock-notes" className={`${ui.textarea} ${styles.notes} ${session.prompt.slug ? styles.notesShort : ''}`} value={session.notes} onChange={(e) => patch({ notes: e.target.value })} />
            {session.typeId === 'dsa' && !session.prompt.slug && (
              <Link to="/playground" className={`${ui.btn} ${ui.small}`} style={{ marginTop: 'var(--space-3)' }} target="_blank"><Code2 size={13} /> Open the playground in a new tab</Link>
            )}
          </section>
          <section className={ui.panel}>
            <AiInterviewer
              type={type}
              prompt={session.prompt}
              chat={session.chat}
              setChat={(chat) => patch({ chat })}
              getContext={() => ({ seconds: sessionRef.current.seconds, phase: phaseAt(type.phases, sessionRef.current.seconds).phase.name })}
            />
          </section>
        </div>
      ) : (
        <section className={ui.panel}>
          <h2 className={ui.panelTitle}>Score yourself</h2>
          <p className={ui.panelLead}>Tick only what you actually did. Unticked items show up as gaps across your mocks.</p>
          <ul className={styles.rubric}>
            {type.rubric.map((r) => (
              <li key={r}>
                <label>
                  <input type="checkbox" checked={Boolean(session.rubric[r])} onChange={(e) => patch((s) => ({ rubric: { ...s.rubric, [r]: e.target.checked } }))} />
                  {r}
                </label>
              </li>
            ))}
          </ul>
          <p className={ui.label}>If you were the interviewer, what would you say?</p>
          <div className={ui.chips}>
            {SIGNALS.map((s) => (
              <button key={s.id} type="button" className={ui.chip} aria-pressed={session.signal === s.id} onClick={() => patch({ signal: s.id })}>{s.label}</button>
            ))}
          </div>
          <div className={`${ui.row} ${styles.scoreActions}`}>
            <button type="button" className={`${ui.btn} ${ui.primary}`} onClick={save}>Save this mock</button>
            <button type="button" className={ui.btn} onClick={() => patch({ stage: 'live', running: true })}>Back to the interview</button>
            <button type="button" className={`${ui.btn} ${ui.ghost}`} onClick={() => { if (window.confirm('Discard this mock?')) onDiscard(); }}>Discard</button>
          </div>
        </section>
      )}
    </>
  );
}

function PastMock({ mock, onClose, onDelete, onFeedback }) {
  const type = MOCK_TYPES[mock.type];
  const [fb, setFb] = useState(mock.aiFeedback ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const canAsk = Boolean(getApiKey()) && (mock.notes?.trim() || mock.chat?.length || mock.code);

  const ask = async () => {
    setBusy(true);
    setError(null);
    let acc = '';
    try {
      const text = await requestFeedback({ type, prompt: mock.prompt, chat: mock.chat ?? [], notes: mock.notes ?? '', code: mock.code ?? '', rubric: mock.rubric ?? {}, signal: mock.signal, seconds: mock.seconds, onText: (t) => { acc += t; setFb(acc); } });
      if (text) onFeedback(text);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const met = type.rubric.filter((r) => mock.rubric?.[r]);
  return (
    <section className={ui.panel}>
      <p className={styles.promptKind}>{type.title} · {new Date(mock.at).toLocaleString()} · {mmss(mock.seconds)}</p>
      <h2 className={styles.promptTitle}>{mock.prompt.title}</h2>
      {mock.prompt.afterLink && <p><Link to={mock.prompt.afterLink.path}>{mock.prompt.afterLink.label} →</Link></p>}

      <h3 className={styles.subhead}>Rubric · {met.length}/{type.rubric.length}{mock.signal && ` · ${SIGNALS.find((s) => s.id === mock.signal)?.label}`}</h3>
      <ul className={styles.rubricResult}>
        {type.rubric.map((r) => <li key={r} className={mock.rubric?.[r] ? styles.met : styles.gap}>{r}</li>)}
      </ul>

      {mock.code && (
        <>
          <h3 className={styles.subhead}>Your code</h3>
          <pre className={styles.notesView}>{mock.code}</pre>
        </>
      )}

      {mock.notes?.trim() && (
        <>
          <h3 className={styles.subhead}>Notes</h3>
          <pre className={styles.notesView}>{mock.notes}</pre>
        </>
      )}

      <h3 className={styles.subhead}><Sparkles size={14} /> AI feedback</h3>
      {fb ? (
        <div className={styles.feedback}><MiniMarkdown text={fb} /></div>
      ) : canAsk ? (
        <button type="button" className={`${ui.btn} ${ui.small}`} onClick={ask} disabled={busy}>{busy ? 'Writing feedback…' : 'Get feedback from Claude'}</button>
      ) : (
        <p className={ui.help}>Add a Claude API key in the AI interviewer panel during a mock (and keep some notes) to get written feedback.</p>
      )}
      {error && <p className={ui.error}>{error}</p>}

      <div className={`${ui.row} ${styles.scoreActions}`}>
        <button type="button" className={`${ui.btn} ${ui.primary}`} onClick={onClose}>Start another mock</button>
        <button type="button" className={`${ui.btn} ${ui.ghost}`} onClick={() => { if (window.confirm('Delete this mock?')) onDelete(); }}><Trash2 size={14} /> Delete</button>
      </div>
    </section>
  );
}

/** The rubric items most often left unticked across recent mocks. */
function RubricGaps({ mocks }) {
  const counts = new Map();
  for (const m of mocks.slice(0, 20)) {
    const t = MOCK_TYPES[m.type];
    for (const r of t?.rubric ?? []) if (!m.rubric?.[r]) counts.set(r, (counts.get(r) ?? 0) + 1);
  }
  const top = [...counts.entries()].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]).slice(0, 4);
  if (!top.length) return null;
  return (
    <div className={styles.gaps}>
      <p className={styles.gapsHead}>Most frequent gaps</p>
      <ul>
        {top.map(([r, n]) => <li key={r}>{r} <span>×{n}</span></li>)}
      </ul>
    </div>
  );
}
