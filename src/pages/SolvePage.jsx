import { useParams, useSearchParams, Link } from 'react-router';
import { ListChecks, Bookmark, ChevronLeft, ChevronRight } from 'lucide-react';
import { PremiumPage } from '../components/access/PremiumPage';
import { ProblemSolver } from '../components/solve/ProblemSolver';
import { hasProblem } from '../lib/judge/problems';
import { useProblemLists } from '../hooks/useProblemLists';
import { NotFoundPage } from './NotFoundPage';
import styles from './SolvePage.module.css';

/** Opened from one of the learner's lists (?list=id): back to it, and previous / next within it. */
function ListNav({ listId, slug }) {
  const { byId } = useProblemLists();
  const list = byId(listId);
  if (!list) return null;
  const slugs = list.slugs.filter(hasProblem);
  const i = slugs.indexOf(slug);
  const to = (s) => `/solve/${s}?list=${list.id}`;
  return (
    <>
      <Link to={`/problems?list=${list.id}`} className={styles.listLink}><Bookmark size={14} aria-hidden="true" /> {list.name}</Link>
      {i >= 0 && (
        <span className={styles.step}>
          {i > 0 ? <Link to={to(slugs[i - 1])} aria-label="Previous problem in this list" title="Previous in list"><ChevronLeft size={16} aria-hidden="true" /></Link> : <span className={styles.off}><ChevronLeft size={16} aria-hidden="true" /></span>}
          <span className={styles.pos}>{i + 1} / {slugs.length}</span>
          {i < slugs.length - 1 ? <Link to={to(slugs[i + 1])} aria-label="Next problem in this list" title="Next in list"><ChevronRight size={16} aria-hidden="true" /></Link> : <span className={styles.off}><ChevronRight size={16} aria-hidden="true" /></span>}
        </span>
      )}
    </>
  );
}

/** /solve/:slug — a practice problem in a full-height, LeetCode-style workspace. */
function SolvePageInner() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const listId = params.get('list');
  if (!hasProblem(slug)) return <NotFoundPage />;
  return (
    <div className={styles.page}>
      <nav className={styles.bar} aria-label="Problem navigation">
        <Link to="/problems"><ListChecks size={15} aria-hidden="true" /> Problem list</Link>
        {listId && <ListNav listId={listId} slug={slug} />}
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
