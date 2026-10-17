import { useMemo, useState } from 'react';
import { Copy, ExternalLink, MessageSquareText, Check } from 'lucide-react';
import { buildReviewPrompt, ASSISTANTS, openInAssistant, copyText } from '../../lib/aiReview';
import ui from '../common/ui.module.css';
import styles from './Mock.module.css';

/**
 * "Get feedback from an AI": opens ChatGPT, Claude or Gemini with a structured review prompt built from
 * the mock. Free for the learner (it uses their own assistant account) and needs no API key.
 */
export function AiReview({ type, typeId, mock }) {
  const prompt = useMemo(() => buildReviewPrompt(type, typeId, mock), [type, typeId, mock]);
  const [status, setStatus] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const empty = !mock.notes?.trim() && !mock.code?.trim() && !(mock.chat ?? []).some((m) => !m.hidden);

  const open = async (a) => {
    const how = await openInAssistant(a, prompt);
    setStatus(how === 'prefilled'
      ? `Opened ${a.name} with your mock filled in. (It's also copied, in case you need to paste it.)`
      : `Your mock is copied. In the ${a.name} tab, paste it (Ctrl/⌘ V) and send.`);
  };

  return (
    <div className={styles.review}>
      <p className={styles.reviewHead}><MessageSquareText size={16} aria-hidden="true" /> Get feedback from an AI</p>
      <p className={styles.reviewText}>
        Sends the question, your time per phase, notes{mock.code ? ', code' : ''}{(mock.chat ?? []).length ? ', the interview transcript' : ''} and
        your self-assessment as one structured review request. It opens in your own account, so there's no API key and nothing extra to pay.
      </p>
      {empty && <p className={styles.reviewWarn}>Your notes are empty, so the review will be thin. Jot down your approach first for useful feedback.</p>}
      <div className={styles.assistants}>
        {ASSISTANTS.map((a) => (
          <button key={a.id} type="button" className={`${ui.btn} ${styles.assistant} ${styles[`as_${a.id}`]}`} onClick={() => open(a)}>
            Review with {a.name} <ExternalLink size={13} aria-hidden="true" />
          </button>
        ))}
      </div>
      <div className={ui.row}>
        <button type="button" className={`${ui.btn} ${ui.ghost} ${ui.small}`} onClick={async () => { await copyText(prompt); setStatus('Copied. Paste it into any AI chat.'); }}>
          <Copy size={13} /> Copy the prompt
        </button>
        <button type="button" className={`${ui.btn} ${ui.ghost} ${ui.small}`} onClick={() => setShowPrompt((v) => !v)} aria-expanded={showPrompt}>
          {showPrompt ? 'Hide' : 'Show'} what gets sent
        </button>
      </div>
      {status && <p className={styles.reviewStatus} role="status"><Check size={14} aria-hidden="true" /> {status}</p>}
      {showPrompt && <pre className={styles.promptPreview}>{prompt}</pre>}
    </div>
  );
}
