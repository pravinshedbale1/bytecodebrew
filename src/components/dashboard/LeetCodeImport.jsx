import { useEffect, useRef, useState } from 'react';
import { Bookmark, Copy, Check, Download } from 'lucide-react';
import { bookmarkletHref, consoleScript, takeImportFromHash, applyImport, importMismatch } from '../../lib/leetcodeImport';
import { useProfile } from '../../hooks/useProfile';
import ui from '../common/ui.module.css';
import styles from './Dashboard.module.css';

/**
 * "Import everything I've solved": a bookmark the learner clicks on leetcode.com. It comes back here
 * with the solved list in the URL hash, which this component applies once.
 */
export function LeetCodeImport() {
  const profile = useProfile();
  const link = useRef(null);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showScript, setShowScript] = useState(false);
  const origin = window.location.origin;

  useEffect(() => {
    // React won't render javascript: URLs, so set the bookmarklet's href directly.
    link.current?.setAttribute('href', bookmarkletHref(origin));
  }, [origin]);

  useEffect(() => {
    const data = takeImportFromHash();
    if (!data) return;
    if (importMismatch(data.username) && !window.confirm(`This import is from the LeetCode account "${data.username}", not the one connected here. Import it anyway?`)) return;
    setResult(applyImport(data));
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(consoleScript(origin));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setShowScript(true);
    }
  };

  const last = result ?? profile.leetcodeImport;

  return (
    <div className={styles.lcImport}>
      <p className={styles.lcImportHead}><Download size={15} aria-hidden="true" /> Import everything you've solved</p>
      {result && (
        <p className={styles.lcImportDone} role="status">
          Imported from <strong>{result.username}</strong>: {result.total} accepted problems, {result.matched} of them on ByteCodeBrew's
          ladders{result.added ? ` (${result.added} newly marked solved)` : ' (already up to date)'}.
        </p>
      )}
      <ol className={styles.lcSteps}>
        <li>
          Drag this button to your bookmarks bar:{' '}
          <a ref={link} className={`${ui.btn} ${ui.small} ${styles.bookmarklet}`} onClick={(e) => e.preventDefault()} title="Drag me to your bookmarks bar">
            <Bookmark size={13} aria-hidden="true" /> Import to ByteCodeBrew
          </a>
        </li>
        <li>Open <a href="https://leetcode.com/problemset/" target="_blank" rel="noopener noreferrer">leetcode.com</a>, signed in, and click the bookmark.</li>
        <li>You'll land back here with every solved problem that's on our ladders ticked as solved on LeetCode.</li>
      </ol>
      <p className={ui.help}>
        The bookmark runs on leetcode.com in your own session: it reads which problems you've solved and sends only that list back here,
        in the page address. It never reads or sends your password or cookies. Re-import any time to catch up.
        {' '}Can't use bookmarks?{' '}
        <button type="button" className={styles.linkButton} onClick={copy}>
          {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> copy a script</>}
        </button>{' '}
        and paste it into the browser console on leetcode.com.
      </p>
      {showScript && <pre className={styles.scriptBox}>{consoleScript(origin)}</pre>}
      {!result && last && (
        <p className={ui.help}>Last import: {new Date(last.at).toLocaleString()} from {last.username} · {last.matched} on our ladders.</p>
      )}
    </div>
  );
}
