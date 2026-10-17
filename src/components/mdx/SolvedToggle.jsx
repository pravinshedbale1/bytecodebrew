import { Check } from 'lucide-react';
import { useSolved, SOURCE_LABEL } from '../../hooks/useSolved';
import styles from './SolvedToggle.module.css';

/**
 * A small checkbox in front of a practice problem; the state is shared across the site.
 * Filled green = verified (passed the tests here, or accepted on LeetCode); outlined = ticked by hand.
 */
export function SolvedToggle({ slug, title }) {
  const { isSolved, solvedBy, toggleSolved } = useSolved();
  const on = isSolved(slug);
  const by = solvedBy(slug);
  const label = `${on ? 'Unmark' : 'Mark'} ${title ?? slug} as solved`;
  return (
    <button
      type="button"
      className={`${styles.box} ${on ? (by === 'self' ? styles.self : styles.on) : ''}`}
      onClick={() => toggleSolved(slug)}
      aria-pressed={on}
      aria-label={label}
      title={on ? `${SOURCE_LABEL[by]} — click to unmark` : 'Mark as solved'}
    >
      {on && <Check size={12} strokeWidth={3} aria-hidden="true" />}
    </button>
  );
}
