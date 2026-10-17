import { useParams, Link } from 'react-router';
import { PremiumPage } from '../components/access/PremiumPage';
import { PageLayout } from '../components/layout/PageLayout';
import { ProblemSolver } from '../components/solve/ProblemSolver';
import { hasProblem } from '../lib/judge/problems';
import { NotFoundPage } from './NotFoundPage';
import page from './Page.module.css';

/** /solve/:slug — a practice problem with starter code and tests, full width. */
function SolvePageInner() {
  const { slug } = useParams();
  if (!hasProblem(slug)) return <NotFoundPage />;
  return (
    <PageLayout>
      <p className={page.eyebrow}>
        <Link to="/problems">← All problems</Link>
      </p>
      <div style={{ marginTop: 'var(--space-3)' }}>
        <ProblemSolver slug={slug} />
      </div>
    </PageLayout>
  );
}

export function SolvePage() {
  return (
    <PremiumPage eyebrow="Practise" title="Solve with tests" lead="Starter code, example tests and full submissions, like LeetCode." feature="Solving problems with tests">
      <SolvePageInner />
    </PremiumPage>
  );
}
