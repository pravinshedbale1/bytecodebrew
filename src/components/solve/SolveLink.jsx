import { Link } from 'react-router';
import { Code2 } from 'lucide-react';
import { hasProblem, solvablePath } from '../../lib/judge/problems';
import styles from './SolveLink.module.css';

/** "Solve" next to a LeetCode problem that has built-in tests on this site. */
export function SolveLink({ slug }) {
  if (!hasProblem(slug)) return null;
  return (
    <Link to={solvablePath(slug)} className={styles.solve} title="Solve here with tests">
      <Code2 size={12} aria-hidden="true" />
      Solve
    </Link>
  );
}
