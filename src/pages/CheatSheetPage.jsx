import { useEffect, useState } from 'react';
import { useLessonLocked } from '../hooks/useAccess';
import { Link, useParams } from 'react-router';
import { Printer, ArrowLeft, Lock } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { getTrack, getCourse, getCourseLessons } from '../curriculum';
import { NotFoundPage } from './NotFoundPage';
import ui from '../components/common/ui.module.css';
import page from './Page.module.css';
import styles from './CheatSheetPage.module.css';

/** Every lesson's key takeaways for one course on one page, ready to print or save as PDF. */
export function CheatSheetPage() {
  const locked = useLessonLocked();
  const { trackId, courseId } = useParams();
  const track = getTrack(trackId);
  const course = getCourse(trackId, courseId);
  const [extracts, setExtracts] = useState(null);

  useEffect(() => {
    import('virtual:lesson-extracts').then((m) => setExtracts(m.default));
  }, []);

  if (!track || !course) return <NotFoundPage />;
  const lessons = getCourseLessons(trackId, courseId).filter((l) => l.available);
  const modules = course.modules
    .map((m) => ({ ...m, lessons: lessons.filter((l) => l.moduleId === m.id) }))
    .filter((m) => m.lessons.length);

  return (
    <PageLayout contentWidth="900px">
      <header className={page.header}>
        <p className={page.eyebrow}>{track.title} · cheat sheet</p>
        <h1 className={page.title}>{course.title}</h1>
        <p className={page.lead}>The key takeaways of all {lessons.length} lessons on one page. Skim it the night before, or print it.</p>
        <div className={`${ui.row} ${styles.actions}`} data-print="hide">
          <button type="button" className={`${ui.btn} ${ui.primary}`} onClick={() => window.print()}>
            <Printer size={15} /> Print or save as PDF
          </button>
          <Link to={`/${trackId}/${courseId}`} className={ui.btn}>
            <ArrowLeft size={15} /> Back to course
          </Link>
        </div>
      </header>

      {!extracts ? (
        <p className={styles.loading}>Loading…</p>
      ) : (
        modules.map((m, mi) => (
          <section key={m.id} className={styles.module}>
            <h2 className={styles.moduleTitle}>
              <span>{String(mi + 1).padStart(2, '0')}</span> {m.title}
            </h2>
            <div className={styles.lessons}>
              {m.lessons.map((l) => {
                const html = locked(l) ? null : extracts[l.key]?.takeaways;
                return (
                  <article key={l.key} className={styles.lesson}>
                    <h3 className={styles.lessonTitle}>
                      <Link to={l.path}>{l.title}</Link>
                    </h3>
                    {locked(l) ? (
                      <p className={styles.none}><Lock size={12} aria-hidden="true" /> Advanced lesson — its takeaways are part of <Link to="/premium">Premium</Link>.</p>
                    ) : html ? (
                      <div className={`${ui.answerHtml} ${styles.body}`} dangerouslySetInnerHTML={{ __html: html }} />
                    ) : (
                      <p className={styles.none}>{l.summary}</p>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        ))
      )}
    </PageLayout>
  );
}
