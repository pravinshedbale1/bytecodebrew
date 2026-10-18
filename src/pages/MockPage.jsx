import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Play, Pause, Square, Shuffle, ExternalLink, History, Trash2, Sparkles, SkipForward, Undo2, Check, Bot, NotebookPen, Compass, ListTree, Code2, Network, Boxes, MessagesSquare, Hammer, Timer } from 'lucide-react';
import { AiReview } from '../components/mock/AiReview';
import { PremiumPage } from '../components/access/PremiumPage';
import { PageLayout, RailCard } from '../components/layout/PageLayout';
import { AiInterviewer, requestFeedback } from '../components/mock/AiInterviewer';
import { ProblemSolver } from '../components/solve/ProblemSolver';
import { MOCK_TYPES, SIGNALS, withPhases, nextPhase, previousPhase, tick, phaseTimes } from '../data/mockInterviews';
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
function MockPageInner() {
  const [params] = useSearchParams();
  const { isSolved } = useSolved();
  const { mocks: allMocks, addMock, updateMock, removeMock } = useMocks();
  // rounds of a type that no longer exists (the old AI-assisted mock) are skipped rather than crashing the page
  const mocks = allMocks.filter((m) => MOCK_TYPES[m.type]);
  const [session, setSession] = useState(() => {
    const saved = readJSON(LIVE, null);
    return saved && MOCK_TYPES[saved.typeId] ? saved : null;
  });
  const [typeId, setTypeId] = useState(() => (MOCK_TYPES[params.get('type')] ? params.get('type') : 'dsa'));
  const [viewing, setViewing] = useState(null);
  const [level, setLevel] = useState('Medium');

  useEffect(() => writeJSON(LIVE, session), [session]);

  const start = () => {
    const type = MOCK_TYPES[typeId];
    setSession({ typeId, level, prompt: type.pick(isSolved, level), seconds: 0, phaseIndex: 0, phaseStart: 0, phaseLog: [], running: true, notes: '', chat: [], stage: 'live', rubric: {}, signal: null });
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

  if (session && !viewing) {
    return (
      <PageLayout>
        <LiveMock
          session={session}
          setSession={setSession}
          onSave={(m) => { addMock(m); setSession(null); setViewing(m); }}
          onDiscard={() => setSession(null)}
          isSolved={isSolved}
        />
      </PageLayout>
    );
  }

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
      ) : (
        <section className={ui.panel}>
          <h2 className={ui.panelTitle}>Pick a round</h2>
          <div className={styles.types}>
            {Object.entries(MOCK_TYPES).map(([id, t]) => (
              <button key={id} type="button" className={`${styles.type} ${typeId === id ? styles.typeActive : ''}`} onClick={() => setTypeId(id)} aria-pressed={typeId === id}>
                {(() => { const I = TYPE_ICONS[id] ?? Timer; return <span className={styles.typeIcon} aria-hidden="true"><I size={17} /></span>; })()}
                {id === 'machine' && <span className={styles.typeNew}>New</span>}
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
      )}
    </PageLayout>
  );
}

/** Tabs on the side of the interview room. */
function SidePanel({ tabs, active, setActive }) {
  const current = tabs.find((t) => t.id === active) ?? tabs[0];
  return (
    <aside className={styles.side} aria-label="Interview tools">
      <div className={styles.sideTabs} role="tablist">
        {tabs.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={t.id === current.id} className={`${styles.sideTab} ${t.id === current.id ? styles.sideTabOn : ''}`} onClick={() => setActive(t.id)}>
            <t.icon size={14} aria-hidden="true" /> {t.label}
          </button>
        ))}
      </div>
      <div className={styles.sideBody}>{current.body}</div>
    </aside>
  );
}

/** What interviewers look for in the current phase, and what comes next. */
function PhaseGuide({ type, index, used }) {
  const phase = type.phases[index];
  const next = type.phases[index + 1];
  return (
    <div className={styles.guide}>
      <p className={styles.guideNow}>Now · {phase.name} <span>{phase.min} min</span></p>
      <ul className={styles.guideList}>
        {(phase.guide ?? []).map((g) => <li key={g}><Check size={13} aria-hidden="true" /> {g}</li>)}
      </ul>
      {next && (
        <>
          <p className={styles.guideNext}>Next · {next.name} <span>{next.min} min</span></p>
          <ul className={`${styles.guideList} ${styles.guideListMuted}`}>
            {(next.guide ?? []).slice(0, 2).map((g) => <li key={g}>{g}</li>)}
          </ul>
        </>
      )}
      <p className={styles.guideAll}>Round plan</p>
      <ol className={styles.guidePlan}>
        {type.phases.map((p, i) => (
          <li key={p.name} className={i < index ? styles.planDone : i === index ? styles.planNow : ''}>
            <span>{p.name}</span>
            <span>{i < index ? mmss(used[p.name] ?? 0) : `${p.min}m`}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

const TYPE_ICONS = { dsa: Code2, hld: Network, lld: Boxes, behavioral: MessagesSquare, machine: Hammer };

const PLACEHOLDERS = {
  dsa: 'Clarifications, examples, brute force, the optimal idea, complexity… write what you would say out loud.',
  behavioral: 'Bullet your STAR points for each answer: situation, task, what you did, the result.',
  hld: 'Requirements, estimates, APIs, data model, components, trade-offs… this is your whiteboard.',
  lld: 'Requirements, entities, classes and their responsibilities, the patterns you chose… then the core code.',
  machine: 'Requirements, classes and key decisions. Build in your IDE, then paste the main classes here so the AI review can see them.',
};

/** A large scratchpad, with an outline of the round's phases on request. */
function Scratchpad({ type, value, onChange, tall = false }) {
  const outline = () => {
    const heads = type.phases.filter((p) => !/^Question \d|Your questions/.test(p.name)).map((p) => `## ${p.name}\n\n`).join('');
    onChange(value.trim() ? `${value.trimEnd()}\n\n${heads}` : heads);
  };
  return (
    <div className={`${styles.pad} ${tall ? styles.padTall : ''}`}>
      <div className={styles.padHead}>
        <label htmlFor="mock-notes" className={styles.padTitle}><NotebookPen size={15} aria-hidden="true" /> Scratchpad</label>
        {type !== MOCK_TYPES.behavioral && (
          <button type="button" className={`${ui.btn} ${ui.ghost} ${ui.small}`} onClick={outline} title="Add a heading for each phase of the round"><ListTree size={13} /> Insert outline</button>
        )}
      </div>
      <textarea
        id="mock-notes"
        className={styles.padText}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={PLACEHOLDERS[Object.keys(MOCK_TYPES).find((k) => MOCK_TYPES[k] === type)] ?? PLACEHOLDERS.hld}
        spellCheck
      />
    </div>
  );
}

function LiveMock({ session: raw, setSession, onSave, onDiscard, isSolved }) {
  const type = MOCK_TYPES[raw.typeId];
  const session = withPhases(type.phases, raw);
  const total = type.minutes * 60;
  const index = session.phaseIndex;
  const phase = type.phases[index];
  const isLast = index === type.phases.length - 1;
  const phaseLeft = phase.min * 60 - (session.seconds - session.phaseStart);
  const overtime = Math.max(0, session.seconds - total);
  const patch = (p) => setSession((s) => ({ ...withPhases(type.phases, s), ...(typeof p === 'function' ? p(withPhases(type.phases, s)) : p) }));
  const sessionRef = useRef(session);
  sessionRef.current = session;
  const used = Object.fromEntries(session.phaseLog.map((p) => [p.name, p.end - p.start]));
  const judged = Boolean(session.prompt.slug);
  const [tab, setTab] = useState(() => (getApiKey() ? 'interviewer' : 'guide'));

  useEffect(() => {
    if (!raw.running || raw.stage !== 'live') return undefined;
    const t = setInterval(() => setSession((s) => tick(type.phases, withPhases(type.phases, s))), 1000);
    return () => clearInterval(t);
  }, [raw.running, raw.stage, setSession, type.phases]);

  const finish = () => patch({ running: false, stage: 'score' });
  // Mouse clicks shouldn't leave a focus ring on the timer controls (keyboard presses keep it)
  const tap = (fn) => (e) => {
    if (e.detail > 0) e.currentTarget.blur();
    fn();
  };
  // a different prompt is allowed in the first minute, before the AI interviewer has started
  const canShuffle = session.stage === 'live' && session.seconds < 60 && !session.chat.length;
  const shuffle = () => patch({ prompt: type.pick(isSolved, session.level), seconds: 0, phaseIndex: 0, phaseStart: 0, phaseLog: [] });
  const snapshot = () => ({
    at: new Date().toISOString(),
    type: session.typeId,
    prompt: session.prompt,
    seconds: session.seconds,
    phases: phaseTimes(type.phases, session),
    notes: session.notes,
    chat: session.chat.filter((m) => !m.hidden).slice(-40),
    code: judged ? readJSON(`bcb:code:${session.prompt.slug}`, null) : null,
    rubric: session.rubric,
    signal: session.signal,
  });

  const interviewer = (
    <AiInterviewer
      type={type}
      prompt={session.prompt}
      chat={session.chat}
      setChat={(chat) => patch({ chat })}
      getContext={() => ({ seconds: sessionRef.current.seconds, phase: type.phases[sessionRef.current.phaseIndex].name })}
    />
  );
  const tabs = [
    { id: 'interviewer', label: 'Interviewer', icon: Bot, body: interviewer },
    ...(judged ? [{ id: 'notes', label: 'Notes', icon: NotebookPen, body: <Scratchpad type={type} value={session.notes} onChange={(notes) => patch({ notes })} tall /> }] : []),
    { id: 'guide', label: 'Guide', icon: Compass, body: <PhaseGuide type={type} index={index} used={used} /> },
  ];

  return (
    <div className={styles.room}>
      <section className={styles.sessionBar} aria-label="Round">
        <div className={styles.sessionTop}>
          <div className={styles.sessionWhat}>
            <p className={styles.promptKind}>{type.title} · {session.prompt.detail}</p>
            <h2 className={styles.sessionTitle}>
              {session.prompt.href ? (
                <a href={session.prompt.href} target="_blank" rel="noopener noreferrer">{session.prompt.title} <ExternalLink size={13} /></a>
              ) : session.prompt.title}
            </h2>
          </div>
          {session.stage === 'live' && (
            <div className={styles.sessionActions}>
              {canShuffle && (
                <button type="button" className={`${ui.btn} ${ui.ghost} ${ui.small}`} onClick={shuffle}><Shuffle size={13} /> {judged ? 'Different problem' : 'Different prompt'}</button>
              )}
              {session.phaseLog.length > 0 && (
                <button type="button" className={`${ui.btn} ${ui.ghost} ${ui.small}`} onClick={tap(() => patch((s) => previousPhase(s)))} title="Back to the previous phase"><Undo2 size={13} /> Back</button>
              )}
              {!isLast && (
                <button type="button" className={`${ui.btn} ${ui.small}`} onClick={tap(() => patch((s) => nextPhase(type.phases, s)))} title="Done with this phase? Move on now"><SkipForward size={13} /> Next phase</button>
              )}
              <button type="button" className={`${ui.btn} ${ui.small}`} onClick={tap(() => patch((s) => ({ running: !s.running })))}>
                {session.running ? <><Pause size={13} /> Pause</> : <><Play size={13} /> Resume</>}
              </button>
              <button type="button" className={`${ui.btn} ${ui.primary} ${ui.small}`} onClick={finish}><Square size={13} /> End & review</button>
            </div>
          )}
        </div>
        <div className={styles.sessionClock}>
            <div className={styles.clockBox}>
              <p className={styles.clock}>{mmss(session.seconds)} <span>/ {mmss(total)}</span></p>
              <p className={styles.phaseNow}>
                {phaseLeft >= 0 ? <>{mmss(phaseLeft)} left in <strong>{phase.name}</strong></> : <span className={styles.over}>{mmss(-phaseLeft)} over in {phase.name}</span>}
                {overtime > 0 && <span className={styles.over}> · {mmss(overtime)} over the round</span>}
              </p>
            </div>
          <div className={styles.phases}>
          {type.phases.map((p, i) => (
            <span
              key={p.name}
              style={{ flex: `${p.min} 1 auto` }}
              className={i < index ? styles.phaseDone : i === index ? styles.phaseCurrent : ''}
              title={i < index ? `${p.name}: ${mmss(used[p.name] ?? 0)} of ${p.min} min` : `${p.name}: ${p.min} min`}
            >
              {i < index && <Check size={11} aria-hidden="true" />} {p.name}
              {i < index && <em className={styles.phaseUsed}> {mmss(used[p.name] ?? 0)}</em>}
            </span>
          ))}
          </div>
        </div>
      </section>

      {session.stage === 'live' ? (
        <div className={styles.roomGrid}>
          <div className={styles.roomMain}>
            {judged ? (
              <ProblemSolver slug={session.prompt.slug} compact />
            ) : (
              <div className={styles.board}>
                {session.prompt.questions ? (
                  <ol className={styles.questionCards}>
                    {session.prompt.questions.map((q, i) => (
                      <li key={q} className={i === index ? styles.qNow : i < index ? styles.qDone : ''}>
                        <span className={styles.qNo}>{i < index ? <Check size={13} /> : i + 1}</span>{q}
                      </li>
                    ))}
                  </ol>
                ) : session.prompt.summary ? (
                  <div className={styles.taskBrief}>
                    <p className={styles.taskSummary}>{session.prompt.summary}</p>
                    {session.prompt.stages && (
                      <ol className={styles.questionCards}>
                        {session.prompt.stages.map((q, i) => (
                          <li key={q}><span className={styles.qNo}>{i + 1}</span>{q}</li>
                        ))}
                      </ol>
                    )}
                    {session.prompt.extension && (
                      type.phases.findIndex((p) => p.name === 'New requirement') <= index ? (
                        <p className={styles.extension}><strong>New requirement:</strong> {session.prompt.extension}</p>
                      ) : (
                        <p className={styles.extensionLater}>A new requirement arrives in the “New requirement” phase.</p>
                      )
                    )}
                    {session.prompt.afterLink && <p className={styles.boardBrief}>When you're done, compare with <Link to={session.prompt.afterLink.path} target="_blank">{session.prompt.afterLink.label.replace(/^Compare with: /, '')}</Link>.</p>}
                  </div>
                ) : (
                  <p className={styles.boardBrief}>
                    Drive the round like a real interview: agree the requirements, size it, then design and go deep where it matters.
                    {session.prompt.afterLink && <> When you're done, compare with <Link to={session.prompt.afterLink.path} target="_blank">{session.prompt.afterLink.label.replace(/^Compare with: /, '')}</Link>.</>}
                  </p>
                )}
                <Scratchpad type={type} value={session.notes} onChange={(notes) => patch({ notes })} tall />
              </div>
            )}
          </div>
          <SidePanel tabs={tabs} active={tab} setActive={setTab} />
        </div>
      ) : (
        <div className={styles.reviewGrid}>
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
              <button type="button" className={`${ui.btn} ${ui.primary}`} onClick={() => onSave(snapshot())}>Save this mock</button>
              <button type="button" className={ui.btn} onClick={() => patch({ stage: 'live', running: true })}>Back to the interview</button>
              <button type="button" className={`${ui.btn} ${ui.ghost}`} onClick={() => { if (window.confirm('Discard this mock?')) onDiscard(); }}>Discard</button>
            </div>
          </section>
          <section className={ui.panel}>
            <AiReview type={type} typeId={session.typeId} mock={snapshot()} />
          </section>
        </div>
      )}
    </div>
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

      {mock.phases && (
        <>
          <h3 className={styles.subhead}>Time per phase</h3>
          <ul className={styles.phaseResult}>
            {mock.phases.map((p) => (
              <li key={p.name}>
                <span>{p.name}</span>
                <span className={p.used > p.planned ? styles.over : ''}>{mmss(p.used)} <em>/ {mmss(p.planned)}</em></span>
              </li>
            ))}
          </ul>
        </>
      )}

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

      <div className={styles.pastReview}>
        <AiReview type={type} typeId={mock.type} mock={mock} />
      </div>

      <h3 className={styles.subhead}><Sparkles size={14} /> Feedback with your Claude API key</h3>
      {fb ? (
        <div className={styles.feedback}><MiniMarkdown text={fb} /></div>
      ) : canAsk ? (
        <button type="button" className={`${ui.btn} ${ui.small}`} onClick={ask} disabled={busy}>{busy ? 'Writing feedback…' : 'Get feedback from Claude'}</button>
      ) : (
        <p className={ui.help}>Optional: with a Claude API key added in the interviewer panel, feedback can be written right here. The buttons above need no key.</p>
      )}
      {error && <p className={ui.error}>{error}</p>}

      <div className={`${ui.row} ${styles.scoreActions}`}>
        <button type="button" className={`${ui.btn} ${ui.primary}`} onClick={onClose}>Start another mock</button>
        <button type="button" className={`${ui.btn} ${ui.ghost} ${ui.danger}`} onClick={() => { if (window.confirm('Delete this mock?')) onDelete(); }}><Trash2 size={14} /> Delete</button>
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

export function MockPage() {
  return (
    <PremiumPage eyebrow="Practise" title="Mock interview" lead="Timed rounds with the phases a real interviewer expects, a self-scoring rubric and an optional AI interviewer." feature="Mock interviews">
      <MockPageInner />
    </PremiumPage>
  );
}
