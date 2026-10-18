import { useState } from 'react';
import { Copy, ExternalLink, Check } from 'lucide-react';
import { ASSISTANTS, openInAssistant, copyText } from '../../lib/aiReview';
import ui from '../common/ui.module.css';
import styles from './SendToAi.module.css';

/**
 * Buttons that open ChatGPT, Claude or Gemini with `prompt` (pre-filled where the assistant supports it,
 * otherwise copied for pasting), plus "Copy the prompt" and an optional preview of what gets sent.
 * `verb` labels the buttons: "Review with ChatGPT", "Summarise with Claude"…
 */
export function SendToAi({ prompt, verb = 'Open in', compact = false, preview = true }) {
  const [status, setStatus] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  const open = async (a) => {
    const how = await openInAssistant(a, prompt);
    setStatus(how === 'prefilled'
      ? `Opened ${a.name} with everything filled in. (It's also copied, in case you need to paste it.)`
      : `Copied. In the ${a.name} tab, paste it (Ctrl/⌘ V) and send.`);
  };

  return (
    <div className={styles.wrap}>
      <div className={`${styles.assistants} ${compact ? styles.compact : ''}`}>
        {ASSISTANTS.map((a) => (
          <button key={a.id} type="button" className={`${ui.btn} ${compact ? ui.small : ''} ${styles.assistant} ${styles[`as_${a.id}`]}`} onClick={() => open(a)} title={`Open in ${a.name}`}>
            {compact ? a.name : <>{verb} {a.name} <ExternalLink size={13} aria-hidden="true" /></>}
          </button>
        ))}
      </div>
      <div className={ui.row}>
        <button type="button" className={`${ui.btn} ${ui.ghost} ${ui.small}`} onClick={async () => { await copyText(prompt); setStatus('Copied. Paste it into any AI chat.'); }}>
          <Copy size={13} /> Copy the prompt
        </button>
        {preview && (
          <button type="button" className={`${ui.btn} ${ui.ghost} ${ui.small}`} onClick={() => setShowPrompt((v) => !v)} aria-expanded={showPrompt}>
            {showPrompt ? 'Hide' : 'Show'} what gets sent
          </button>
        )}
      </div>
      {status && <p className={styles.status} role="status"><Check size={14} aria-hidden="true" /> {status}</p>}
      {showPrompt && <pre className={styles.preview}>{prompt}</pre>}
    </div>
  );
}
