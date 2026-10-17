import { useEffect, useRef, useState } from 'react';
import { Send, Square, KeyRound, Bot } from 'lucide-react';
import { streamClaude, getApiKey, setApiKey, clearApiKey } from '../../lib/claude';
import { MiniMarkdown } from '../../lib/miniMarkdown';
import ui from '../common/ui.module.css';
import styles from './Mock.module.css';

const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export function interviewerSystemPrompt(type, prompt) {
  const phases = type.phases.map((p) => `${p.name} (${p.min} min)`).join(' → ');
  const subject = prompt.questions
    ? `Ask these questions in order, with one or two follow-ups each:\n${prompt.questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`
    : `The problem: ${prompt.title}${prompt.href ? ` (${prompt.href})` : ''}.${prompt.summary ? ` In short: ${prompt.summary}` : ''}`;
  return `You are a senior software engineer running a ${type.minutes}-minute ${type.title} mock interview on ByteCodeBrew, an interview-prep site. The candidate is preparing for a job switch and wants realistic practice.

${subject}

Round plan: ${phases}.

How to run it:
- Open with one friendly sentence, then state the problem the way a real interviewer would${prompt.questions ? '' : ', including one small example where it helps'}.
- Ask one thing at a time and keep each reply under 120 words. This is a conversation, not a lecture.
- Never hand over the solution. If the candidate is stuck for two turns, give a small hint and escalate gradually.
- Probe like a real interviewer: requirements, trade-offs, complexity, edge cases, failure modes, "why not X?".
- Each candidate message starts with [elapsed mm:ss · current phase]. If a phase is running long, nudge them to move on.
- When the candidate says they are done or time is up, thank them in one line and stop. Don't grade unless asked.`;
}

/** Live chat with Claude playing the interviewer. `chat` is lifted so feedback can read the transcript. */
export function AiInterviewer({ type, prompt, chat, setChat, getContext }) {
  const [hasKey, setHasKey] = useState(Boolean(getApiKey()));
  const [setupOpen, setSetupOpen] = useState(false);
  const [keyDraft, setKeyDraft] = useState('');
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const abort = useRef(null);
  const end = useRef(null);

  useEffect(() => {
    end.current?.scrollIntoView({ block: 'nearest' });
  }, [chat]);

  useEffect(() => () => abort.current?.abort(), []);

  const send = async (text, { hidden = false } = {}) => {
    const { seconds, phase } = getContext();
    const userMsg = { role: 'user', content: `[${mmss(seconds)} · ${phase}] ${text}`, hidden };
    const history = [...chat, userMsg];
    setChat([...history, { role: 'assistant', content: '' }]);
    setInput('');
    setBusy(true);
    setError(null);
    abort.current = new AbortController();
    try {
      let acc = '';
      const full = await streamClaude({
        system: interviewerSystemPrompt(type, prompt),
        messages: history.map(({ role, content }) => ({ role, content })),
        effort: 'low',
        signal: abort.current.signal,
        onText: (t) => {
          acc += t;
          setChat([...history, { role: 'assistant', content: acc }]);
        },
      });
      setChat([...history, { role: 'assistant', content: full ?? acc }]);
    } catch (e) {
      setError(e.message);
      setChat(chat);                       // drop the failed turn
      if (!hidden) setInput(text);
    } finally {
      setBusy(false);
    }
  };

  if (!hasKey && !setupOpen) {
    return (
      <div className={styles.aiCollapsed}>
        <p className={styles.aiHead}><Bot size={16} /> AI interviewer <span className={styles.optional}>optional</span></p>
        <p className={ui.help} style={{ marginTop: 0 }}>Claude asks follow-ups and writes feedback. Needs your own Claude API key.</p>
        <button type="button" className={`${ui.btn} ${ui.small}`} onClick={() => setSetupOpen(true)}>Set it up</button>
      </div>
    );
  }

  if (!hasKey) {
    return (
      <form
        className={styles.keyForm}
        onSubmit={(e) => {
          e.preventDefault();
          if (!keyDraft.trim().startsWith('sk-')) return setError('That doesn’t look like a Claude API key (it starts with “sk-”).');
          setApiKey(keyDraft);
          setKeyDraft('');
          setHasKey(true);
          setError(null);
        }}
      >
        <p className={styles.aiHead}><Bot size={16} /> AI interviewer <span className={styles.optional}>optional</span></p>
        <p className={ui.help}>
          Claude can play the interviewer: it asks follow-ups, pushes on trade-offs and gives written feedback at the end.
          It uses your own Claude API key (from console.anthropic.com), which is kept only in this browser, sent only to
          Anthropic, and never synced to your account. Usage is billed to your key.
        </p>
        <div className={styles.keyRow}>
          <input type="password" className={ui.input} value={keyDraft} onChange={(e) => setKeyDraft(e.target.value)} placeholder="sk-ant-…" autoComplete="off" aria-label="Claude API key" />
          <button type="submit" className={`${ui.btn} ${ui.small}`}><KeyRound size={13} /> Save key</button>
          <button type="button" className={`${ui.btn} ${ui.ghost} ${ui.small}`} onClick={() => setSetupOpen(false)}>Cancel</button>
        </div>
        {error && <p className={ui.error}>{error}</p>}
      </form>
    );
  }

  const visible = chat.filter((m) => !m.hidden);

  return (
    <div className={styles.ai}>
      <div className={styles.aiTop}>
        <p className={styles.aiHead}><Bot size={16} /> AI interviewer</p>
        <button type="button" className={`${ui.btn} ${ui.ghost} ${ui.small}`} onClick={() => { clearApiKey(); setHasKey(false); }}>Remove key</button>
      </div>

      {chat.length === 0 ? (
        <button type="button" className={`${ui.btn} ${ui.primary}`} onClick={() => send('Hi, I’m ready to start.', { hidden: true })} disabled={busy}>
          Start with the AI interviewer
        </button>
      ) : (
        <>
          <ol className={styles.chat} aria-live="polite">
            {visible.map((m, i) => (
              <li key={i} className={m.role === 'assistant' ? styles.them : styles.me}>
                {m.role === 'assistant' ? (m.content ? <MiniMarkdown text={m.content} /> : <span className={styles.typing}>Thinking…</span>) : m.content.replace(/^\[[^\]]*\]\s*/, '')}
              </li>
            ))}
            <li ref={end} aria-hidden="true" />
          </ol>
          <form className={styles.chatInput} onSubmit={(e) => { e.preventDefault(); if (input.trim()) send(input.trim()); }}>
            <textarea
              className={ui.textarea}
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (input.trim() && !busy) send(input.trim()); } }}
              placeholder="Answer as you would out loud… (Enter to send, Shift+Enter for a new line)"
              aria-label="Your reply"
            />
            {busy ? (
              <button type="button" className={`${ui.btn} ${ui.small}`} onClick={() => abort.current?.abort()}><Square size={13} /> Stop</button>
            ) : (
              <button type="submit" className={`${ui.btn} ${ui.primary} ${ui.small}`} disabled={!input.trim()}><Send size={13} /> Send</button>
            )}
          </form>
        </>
      )}
      {error && <p className={ui.error} role="alert">{error}</p>}
    </div>
  );
}

/** Written feedback on the whole session (transcript, notes and the self-assessment). */
export async function requestFeedback({ type, prompt, chat, notes, code = '', rubric, signal: hireSignal, seconds, onText }) {
  const transcript = chat
    .filter((m) => !m.hidden)
    .map((m) => `${m.role === 'assistant' ? 'Interviewer' : 'Candidate'}: ${m.content}`)
    .join('\n\n');
  const self = type.rubric.map((r) => `- ${r}: ${rubric[r] ? 'yes' : 'no'}`).join('\n');
  const user = `Mock interview: ${type.title}
Prompt: ${prompt.title}${prompt.questions ? `\nQuestions:\n${prompt.questions.map((q) => `- ${q}`).join('\n')}` : ''}
Time used: ${mmss(seconds)} of ${type.minutes}:00

Candidate's notes / scratchpad:
${notes.trim() || '(none)'}
${code.trim() ? `\nCandidate's final code (Java):\n${code.trim()}\n` : ''}
Transcript:
${transcript || '(no AI interviewer was used; judge from the notes)'}

Candidate's self-assessment:
${self}
Self-assessed signal: ${hireSignal ?? 'not given'}

Write feedback in this shape, under 350 words:
**Overall signal:** Strong no / Lean no / Lean hire / Strong hire, with one sentence why.
**Strengths:** 2-3 bullets.
**Gaps:** 2-4 bullets, each specific and actionable.
**Rubric check:** one line per rubric item where you disagree with the self-assessment (skip agreements).
**Practise next:** 3 concrete bullets.`;

  return streamClaude({
    system: 'You are an experienced interviewer at a top tech company writing candid, specific, kind feedback on a mock interview. Base every point on evidence from the notes or transcript; say so when there is too little evidence.',
    messages: [{ role: 'user', content: user }],
    effort: 'medium',
    onText,
  });
}
