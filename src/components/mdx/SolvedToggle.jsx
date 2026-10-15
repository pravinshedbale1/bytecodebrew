import { Check } from 'lucide-react';
import { useSolved } from '../../hooks/useSolved';
import styles from './SolvedToggle.module.css';

/** A small checkbox in front of a practice problem; the state is shared across lessons. */
export function SolvedToggle({ slug, title }) {
  const { isSolved, toggleSolved } = useSolved();
  const on = isSolved(slug);
  return (
    <button
      type="button"
      className={`${styles.box} ${on ? styles.on : ''}`}
      onClick={() => toggleSolved(slug)}
      aria-pressed={on}
      aria-label={`${on ? 'Unmark' : 'Mark'} ${title ?? slug} as solved`}
      title={on ? 'Solved — click to unmark' : 'Mark as solved'}
    >
      {on && <Check size={12} strokeWidth={3} aria-hidden="true" />}
    </button>
  );
}
