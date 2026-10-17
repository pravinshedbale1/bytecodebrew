import { Link, useParams } from 'react-router';
import { Target, FileText } from 'lucide-react';
import { getTrack, getCourse, getCourseLessons, courseStats } from '../curriculum';
import { useProgress } from '../hooks/useProgress';
import { getNextUp } from '../lib/nextLesson';
import { PageLayout, RailCard } from '../components/layout/PageLayout';
import { Roadmap } from '../components/navigation/Roadmap';
import { NextUpCard } from '../components/navigation/NextUpCard';
import { ProgressCard, ModuleProgressCard } from '../components/rail/RailWidgets';
import { ComingSoon } from '../components/common/ComingSoon';
import { NotFoundPage } from './NotFoundPage';
import styles from './Page.module.css';

export function CoursePage() {
  const { trackId, courseId } = useParams();
  const track = getTrack(trackId);
  const course = getCourse(trackId, courseId);
  const { isComplete } = useProgress();

  if (!track || !course) return <NotFoundPage />;

  const lessons = getCourseLessons(trackId, courseId);
  const stats = courseStats(trackId, courseId);
  const { next, mode, completed } = getNextUp(lessons, isComplete);

  const rail = (
    <>
      {stats.available > 0 && (
        <ProgressCard
          title="Course progress"
          completed={completed}
          total={stats.available}
          caption={`${stats.available} lessons ready · ~${Math.round(stats.minutes / 60)}h of reading`}
        />
      )}
      {course.outcomes?.length > 0 && (
        <RailCard title="You will be able to" icon={<Target size={14} aria-hidden="true" />}>
          <ul className={styles.outcomeList}>
            {course.outcomes.map((o) => (
              <li key={o}>
                <Target size={13} aria-hidden="true" />
                {o}
              </li>
            ))}
          </ul>
        </RailCard>
      )}
      {course.modules.length > 0 && (
        <ModuleProgressCard course={course} lessons={lessons} isComplete={isComplete} />
      )}
      {stats.available > 0 && (
        <RailCard title="Revise fast" icon={<FileText size={14} aria-hidden="true" />}>
          <p className={styles.railText}>Every lesson’s key takeaways on one printable page.</p>
          <Link to={`/cheatsheet/${trackId}/${courseId}`} className={styles.railLink}>Open the cheat sheet →</Link>
        </RailCard>
      )}
    </>
  );

  return (
    <PageLayout rail={rail}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>{course.shortTitle}</p>
        <h1 className={styles.title}>{course.title}</h1>
        <p className={styles.lead}>{course.description}</p>
      </header>

      {stats.available === 0 ? (
        <ComingSoon
          title={`${course.title} is being written`}
          backTo={`/${track.id}`}
          backLabel={`Back to ${track.title}`}
        >
          The outline is ready below; lessons will unlock as they are published.
        </ComingSoon>
      ) : (
        <section className={styles.section}>
          <NextUpCard lesson={next} mode={mode} courseTitle={course.shortTitle} />
        </section>
      )}

      {course.modules.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Roadmap</h2>
          <Roadmap course={course} lessons={lessons} isComplete={isComplete} nextKey={next?.key} />
        </section>
      )}
    </PageLayout>
  );
}
