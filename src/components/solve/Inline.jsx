import styles from './ProblemSolver.module.css';

/** **bold** inside plain text. */
function Bold({ text }) {
  return text.split(/(\*\*[^*]+\*\*)/).map((part, i) => (part.length > 4 && part.startsWith('**') && part.endsWith('**')
    ? <strong key={i}>{part.slice(2, -2)}</strong>
    : part));
}

/** Text with `code` spans and **bold**. */
export function Inline({ text }) {
  return text.split(/(`[^`]+`)/).map((part, i) => (part.startsWith('`') && part.endsWith('`') && part.length > 1
    ? <code key={i} className={styles.code}>{part.slice(1, -1)}</code>
    : <Bold key={i} text={part} />));
}
