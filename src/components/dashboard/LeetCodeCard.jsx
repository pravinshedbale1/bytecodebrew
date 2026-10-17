import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, ExternalLink, Unlink } from 'lucide-react';
import { useProfile } from '../../hooks/useProfile';
import { syncLeetCode, refreshWait, disconnectLeetCode, leetcodeEnabled } from '../../lib/leetcode';
import { allLadderProblems } from '../../lib/studyPlan';
import { relativeTime } from '../../lib/dates';
import ui from '../common/ui.module.css';
import styles from './Dashboard.module.css';

function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

/** Connect a LeetCode username; refresh at most once an hour. */
export function LeetCodeCard() {
  const profile = useProfile();
  const lc = profile.leetcode?.username ? profile.leetcode : null;
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const now = useNow();
  const wait = refreshWait(profile, now);
  const ladder = useMemo(() => new Map(allLadderProblems().map((p) => [p.slug, p])), []);

  const run = async (username) => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const { added } = await syncLeetCode(username);
      setNotice(added ? `${added} problem${added === 1 ? '' : 's'} from LeetCode marked solved on ByteCodeBrew.` : 'Up to date.');
      setName('');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (!leetcodeEnabled) {
    return (
      <p className={ui.help}>LeetCode sync isn’t switched on for this site yet.</p>
    );
  }

  if (!lc) {
    return (
      <form className={styles.lcForm} onSubmit={(e) => { e.preventDefault(); if (name.trim()) run(name); }}>
        <label className={ui.label} htmlFor="lc-user">LeetCode username</label>
        <div className={styles.lcRow}>
          <input id="lc-user" className={ui.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. lee215" autoComplete="off" spellCheck={false} />
          <button type="submit" className={`${ui.btn} ${ui.primary}`} disabled={busy || !name.trim() || wait > 0}>
            {busy ? 'Connecting…' : 'Connect'}
          </button>
        </div>
        <p className={ui.help}>
          Connecting reads your public profile: solved counts, the submission calendar and your 20 most recent accepted problems.
          To bring in <strong>everything</strong> you've solved, use the import below.
          {wait > 0 && ` You can connect again in ${relativeTime(wait)}.`}
        </p>
        {error && <p className={ui.error} role="alert">{error}</p>}
      </form>
    );
  }

  const d = lc.data;
  const seen = Object.entries(lc.seen ?? {}).sort((a, b) => b[1].at.localeCompare(a[1].at));
  const onLadder = seen.filter(([slug]) => ladder.has(slug)).length;
  const levels = [
    { id: 'easy', label: 'Easy' },
    { id: 'medium', label: 'Medium' },
    { id: 'hard', label: 'Hard' },
  ];

  return (
    <div className={styles.lc}>
      <div className={styles.lcHead}>
        {d.avatar && <img src={d.avatar} alt="" className={styles.lcAvatar} referrerPolicy="no-referrer" />}
        <div className={styles.lcWho}>
          <a href={`https://leetcode.com/u/${lc.username}/`} target="_blank" rel="noopener noreferrer" className={styles.lcName}>
            {lc.username} <ExternalLink size={12} aria-hidden="true" />
          </a>
          <span className={styles.lcMeta}>
            {d.ranking ? `Rank ${d.ranking.toLocaleString()} · ` : ''}
            {d.streak ? `${d.streak}-day streak · ` : ''}
            synced {relativeTime(now - lc.syncedAt)} ago
          </span>
        </div>
        <div className={ui.row}>
          <button type="button" className={`${ui.btn} ${ui.small}`} onClick={() => run(lc.username)} disabled={busy || wait > 0} title={wait > 0 ? `Refresh allowed once an hour` : 'Refresh from LeetCode'}>
            <RefreshCw size={13} className={busy ? styles.spin : ''} />
            {wait > 0 ? `Refresh in ${relativeTime(wait)}` : busy ? 'Refreshing…' : 'Refresh'}
          </button>
          <button type="button" className={`${ui.btn} ${ui.ghost} ${ui.small}`} onClick={disconnectLeetCode} title="Disconnect">
            <Unlink size={13} /> <span className="visually-hidden">Disconnect</span>
          </button>
        </div>
      </div>

      <div className={styles.lcStats}>
        <div className={styles.lcTotal}>
          <span className={styles.lcBig}>{d.solved.all}</span>
          <span className={styles.lcOf}>/ {d.totals.all} solved</span>
        </div>
        {levels.map((l) => (
          <div key={l.id} className={styles.lcLevel}>
            <span className={`${styles.lcLevelName} ${styles[l.id]}`}>{l.label}</span>
            <span className={styles.lcLevelNum}>{d.solved[l.id]}<span> / {d.totals[l.id]}</span></span>
            <span className={styles.lcBar}><span className={styles[`${l.id}Fill`]} style={{ width: `${d.totals[l.id] ? (d.solved[l.id] / d.totals[l.id]) * 100 : 0}%` }} /></span>
          </div>
        ))}
      </div>

      {seen.length > 0 && (
        <div className={styles.lcRecent}>
          <p className={styles.lcRecentHead}>
            Your recent solves · {onLadder} of {seen.length} are on ByteCodeBrew’s ladders
          </p>
          <p className={ui.help} style={{ marginTop: 0, marginBottom: 'var(--space-2)' }}>
            LeetCode only shares your 20 most recent accepted problems publicly, so each hourly refresh adds those.
            Use the import below once to bring in everything else.
          </p>
          <ul>
            {seen.slice(0, 8).map(([slug, s]) => (
              <li key={slug}>
                <a href={`https://leetcode.com/problems/${slug}/`} target="_blank" rel="noopener noreferrer">{s.title}</a>
                {ladder.has(slug) && <span className={styles.lcTag}>on ladder</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
      {notice && <p className={ui.help} role="status">{notice}</p>}
      {error && <p className={ui.error} role="alert">{error}</p>}
    </div>
  );
}
