import { useState } from 'react';
import { Link } from 'react-router';
import { KeyRound, Bot, Code2, Palette, Target, Database, Check, ExternalLink, Sun, Moon, Sparkles, Square } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { useApiKey, setApiKey, clearApiKey } from '../lib/claude';
import { useAuth, signIn } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useLook, LOOKS } from '../hooks/useLook';
import { viewAs } from '../lib/viewAs';
import { LANGS, LANG_IDS } from '../lib/judge/langs';
import { preferredLang, setPreferredLang } from '../lib/judge/drafts';
import ui from '../components/common/ui.module.css';
import page from './Page.module.css';
import styles from './SettingsPage.module.css';

const mask = (k) => (k.length > 12 ? `${k.slice(0, 7)}…${k.slice(-4)}` : '••••');

/** /settings — preferences: the Claude API key for the AI interviewer, default code language, theme. */
export function SettingsPage() {
  return (
    <PageLayout contentWidth="760px">
      <header className={page.header}>
        <p className={page.eyebrow}>Account</p>
        <h1 className={page.title}>Settings</h1>
        <p className={page.lead}>Your preferences for practice and the AI interviewer.</p>
      </header>
      <ClaudeKey />
      <CodeLanguage />
      <Appearance />
      <section className={ui.panel}>
        <h2 className={ui.panelTitle}><Target size={16} aria-hidden="true" /> Elsewhere</h2>
        <ul className={styles.links}>
          <li><Link to="/dashboard">Daily goals and your profile</Link> <span className={styles.muted}>on the Dashboard</span></li>
          <li><Link to="/dashboard"><Database size={13} aria-hidden="true" /> Download or delete your data</Link> <span className={styles.muted}>on the Dashboard</span></li>
        </ul>
      </section>
    </PageLayout>
  );
}

function ClaudeKey() {
  if (viewAs) {
    return (
      <section className={ui.panel} id="claude-key">
        <h2 className={ui.panelTitle}><Bot size={16} aria-hidden="true" /> AI interviewer: Claude API key</h2>
        <p className={styles.lead}>A learner’s Claude API key is private: it isn’t shown or usable in a read-only view, and no one but them can read it.</p>
      </section>
    );
  }
  return <ClaudeKeyEditor />;
}

function ClaudeKeyEditor() {
  const key = useApiKey();
  const { status } = useAuth();
  const signedIn = status === 'signed-in';
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [unsynced, setUnsynced] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    const k = draft.trim();
    if (!k.startsWith('sk-')) { setError('That doesn’t look like a Claude API key. It starts with “sk-ant-”.'); return; }
    setBusy(true);
    setError(null);
    try {
      await setApiKey(k);
      setUnsynced(false);
      setSaved(true);
    } catch {
      setUnsynced(true);           // the key works in this browser; the account copy failed
    } finally {
      setDraft('');
      setEditing(false);
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(signedIn ? 'Remove your Claude API key from your account and every device?' : 'Remove your Claude API key from this browser?')) return;
    setBusy(true);
    setError(null);
    try { await clearApiKey(); setSaved(false); setUnsynced(false); } catch (err) { setError(`It’s removed from this browser, but your account couldn’t be updated (${err.code ?? err.message}), so other devices still have it. Try again.`); } finally { setBusy(false); }
  };

  return (
    <section className={ui.panel} id="claude-key" aria-labelledby="claude-key-title">
      <h2 id="claude-key-title" className={ui.panelTitle}><Bot size={16} aria-hidden="true" /> AI interviewer: Claude API key</h2>
      <p className={styles.lead}>
        In mock interviews, Claude can play the interviewer: it asks follow-ups, pushes on trade-offs and writes feedback at the end.
        It runs on your own key from the <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer">Anthropic console <ExternalLink size={11} aria-hidden="true" /></a>, and usage is billed to that key.
      </p>

      {key && !editing && !busy ? (
        <div className={styles.keyRow}>
          <span className={styles.keyBox}><KeyRound size={14} aria-hidden="true" /> <code>{mask(key)}</code></span>
          {unsynced
            ? <span className={styles.warn}>Saved in this browser only: your account couldn’t be reached. Save it again to keep it on all your devices.</span>
            : <span className={styles.ok}><Check size={14} aria-hidden="true" /> {signedIn ? 'Saved to your account: works on every device you sign in on' : 'Saved in this browser only'}</span>}
          <div className={ui.row}>
            <button type="button" className={`${ui.btn} ${ui.small}`} onClick={() => { setEditing(true); setSaved(false); }} disabled={busy}>Replace</button>
            <button type="button" className={`${ui.btn} ${ui.ghost} ${ui.small} ${ui.danger}`} onClick={remove} disabled={busy}>Remove</button>
          </div>
        </div>
      ) : (
        <form className={styles.keyForm} onSubmit={save}>
          <input type="password" className={ui.input} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="sk-ant-…" autoComplete="off" aria-label="Claude API key" disabled={busy} />
          <button type="submit" className={`${ui.btn} ${ui.primary}`} disabled={busy || !draft.trim()}><KeyRound size={14} /> {busy ? (draft.trim() ? (signedIn ? 'Saving to your account…' : 'Saving…') : 'Removing…') : 'Save key'}</button>
          {editing && <button type="button" className={`${ui.btn} ${ui.ghost}`} onClick={() => { setEditing(false); setDraft(''); setError(null); }} disabled={busy}>Cancel</button>}
        </form>
      )}
      {saved && key && !editing && <p className={styles.muted}>Mock interviews will use it right away.</p>}
      {error && <p className={ui.error} role="alert">{error}</p>}

      <ul className={styles.notes}>
        <li>{signedIn
          ? 'Your key is stored in your ByteCodeBrew account so it works on all your devices. Only your account can read it, it never appears in “Download my data”, and it’s sent only to Anthropic.'
          : <>You’re not signed in, so the key stays in this browser. <button type="button" className={styles.linkBtn} onClick={signIn}>Sign in</button> to keep it on all your devices.</>}</li>
        <li>Set a monthly spend limit on the key in the Anthropic console. Like anything stored online, the site’s database administrators could technically access it, so a limited key is the safe choice.</li>
        <li>Signing out removes the key from this browser; it stays in your account for next time.</li>
      </ul>
    </section>
  );
}

function CodeLanguage() {
  const [lang, setLang] = useState(preferredLang);
  return (
    <section className={ui.panel} aria-labelledby="lang-title">
      <h2 id="lang-title" className={ui.panelTitle}><Code2 size={16} aria-hidden="true" /> Default code language</h2>
      <p className={styles.lead}>Problems open in this language. You can still switch per problem; your drafts are kept per language.</p>
      <div className={styles.choices} role="radiogroup" aria-label="Default code language">
        {LANG_IDS.map((id) => (
          <button key={id} type="button" role="radio" aria-checked={lang === id} className={`${styles.choice} ${lang === id ? styles.chosen : ''}`} onClick={() => { setPreferredLang(id); setLang(id); }}>
            {LANGS[id].label} <span className={styles.muted}>{LANGS[id].version}</span>
          </button>
        ))}
      </div>
      <p className={styles.muted}>Saved in this browser.</p>
    </section>
  );
}

function Appearance() {
  const { theme, setTheme } = useTheme();
  const [look, setLook] = useLook();
  return (
    <section className={ui.panel} aria-labelledby="theme-title">
      <h2 id="theme-title" className={ui.panelTitle}><Palette size={16} aria-hidden="true" /> Appearance</h2>
      <div className={styles.choices} role="radiogroup" aria-label="Theme">
        {[['light', 'Light', Sun], ['dark', 'Dark', Moon]].map(([id, label, Icon]) => (
          <button key={id} type="button" role="radio" aria-checked={theme === id} className={`${styles.choice} ${theme === id ? styles.chosen : ''}`} onClick={() => setTheme(id)}>
            <Icon size={14} aria-hidden="true" /> {label}
          </button>
        ))}
      </div>
      <p className={styles.muted}>Saved in this browser. The moon and sun button in the top bar switches it too.</p>
      <h3 className={styles.subhead}>Style</h3>
      <div className={styles.choices} role="radiogroup" aria-label="Style">
        {LOOKS.map(({ id, label }) => (
          <button key={id} type="button" role="radio" aria-checked={look === id} className={`${styles.choice} ${look === id ? styles.chosen : ''}`} onClick={() => setLook(id)}>
            {id === 'glass' ? <Sparkles size={14} aria-hidden="true" /> : <Square size={14} aria-hidden="true" />} {label}{id === 'glass' ? <span className={styles.previewTag}>Preview</span> : null}
          </button>
        ))}
      </div>
      <p className={styles.muted}>
        Liquid glass turns surfaces into frosted panes over a soft moving colour field, in light and dark.
        It’s new and still in preview, so some screens may look a little off; you can switch back to Classic anytime.
        {look === 'glass' && ' If your device has “Reduce transparency” turned on, panes stay mostly solid.'}
      </p>
    </section>
  );
}
