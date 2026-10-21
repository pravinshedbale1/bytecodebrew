import styles from './ProblemSolver.module.css';

/** Text with `code` spans. */
export function Inline({ text }) {
  return text.split(/(`[^`]+`)/).map((part, i) => (part.startsWith('`') && part.endsWith('`') && part.length > 1
    ? <code key={i} className={styles.code}>{part.slice(1, -1)}</code>
    : part));
}
