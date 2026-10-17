import { useParams, Link } from 'react-router';
import { ListChecks } from 'lucide-react';
import { PremiumPage } from '../components/access/PremiumPage';
import { ProblemSolver } from '../components/solve/ProblemSolver';
import { hasProblem } from '../lib/judge/problems';
import { NotFoundPage } from './NotFoundPage';
import styles from './SolvePage.module.css';

/** /solve/:slug — a practice problem in a full-height, LeetCode-style workspace. */
function SolvePageInner() {
  const { slug } = useParams();
  if (!hasProblem(slug)) return <NotFoundPage />;
  return (
    <div className={styles.page}>
      <nav className={styles.bar} aria-label="Problem navigation">
        <Link to="/problems"><ListChecks size={15} aria-hidden="true" /> Problem list</Link>
      </nav>
      <div className={styles.work}>
        <ProblemSolver slug={slug} />
      </div>
    </div>
  );
}

export function SolvePage() {
  return (
    <PremiumPage eyebrow="Practise" title="Solve with tests" lead="Starter code, example tests and full submissions, like LeetCode." feature="Solving problems with tests">
      <SolvePageInner />
    </PremiumPage>
  );
}
