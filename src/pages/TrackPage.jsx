import { useParams } from 'react-router';
import { getTrack, courseStats, getCourseLessons } from '../curriculum';
import { useProgress } from '../hooks/useProgress';
import { PageLayout } from '../components/layout/PageLayout';
import { CourseCard } from '../components/navigation/CourseCard';
import { ProgressCard } from '../components/rail/RailWidgets';
import { ComingSoon } from '../components/common/ComingSoon';
import { NotFoundPage } from './NotFoundPage';
import styles from './Page.module.css';

export function TrackPage() {
  const { trackId } = useParams();
  const track = getTrack(trackId);
  const { isComplete } = useProgress();

  if (!track) return <NotFoundPage />;

  const courses = track.courses.map((course) => {
    const stats = courseStats(track.id, course.id);
    const completed = getCourseLessons(track.id, course.id).filter(
      (l) => l.available && isComplete(l.key),
    ).length;
    return { course, stats, completed };
  });

  const active = courses.filter((c) => c.stats.available > 0);
  const rail = active.length
    ? active.map(({ course, stats, completed }) => (
        <ProgressCard
          key={course.id}
          title={course.title}
          completed={completed}
          total={stats.available}
        />
      ))
    : null;

  return (
    <PageLayout rail={rail}>
      <header className={styles.header}>
        <h1 className={styles.title}>{track.title}</h1>
        <p className={styles.lead}>{track.description}</p>
      </header>

      {courses.length === 0 ? (
        <ComingSoon title={`${track.title} is being written`} backTo="/" backLabel="Back to all tracks">
          This track is on the roadmap. System Design is available now.
        </ComingSoon>
      ) : (
        <div className={styles.grid}>
          {courses.map(({ course, stats, completed }) => (
            <CourseCard
              key={course.id}
              to={`/${track.id}/${course.id}`}
              course={course}
              stats={stats}
              completed={completed}
            />
          ))}
        </div>
      )}
    </PageLayout>
  );
}
