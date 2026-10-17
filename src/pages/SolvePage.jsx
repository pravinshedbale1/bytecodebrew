import { useParams, Link } from 'react-router';
import { PageLayout } from '../components/layout/PageLayout';
import { ProblemSolver } from '../components/solve/ProblemSolver';
import { hasProblem } from '../lib/judge/problems';
import { NotFoundPage } from './NotFoundPage';
import page from './Page.module.css';

/** /solve/:slug — a practice problem with starter code and tests, full width. */
export function SolvePage() {
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
