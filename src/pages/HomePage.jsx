import { Lightbulb } from 'lucide-react';
import { tracks, trackIsActive, getCourseLessons, courseStats, getCourse } from '../curriculum';
import { useProgress } from '../hooks/useProgress';
import { getNextUp } from '../lib/nextLesson';
import { overallProgress } from '../lib/progressStats';
import { PageLayout } from '../components/layout/PageLayout';
import { TrackCard } from '../components/navigation/TrackCard';
import { NextUpCard } from '../components/navigation/NextUpCard';
import { ProgressCard, NoteCard } from '../components/rail/RailWidgets';
import { site } from '../config/site';
import styles from './Page.module.css';

function trackMeta(track) {
  const total = track.courses.reduce((n, c) => n + courseStats(track.id, c.id).available, 0);
  return `${track.courses.length} courses · ${total} lessons ready`;
}

export function HomePage() {
  const { isComplete, lastVisited } = useProgress();

  // Resume from the course the learner was last reading; default to HLD.
  const [trackId, courseId] = (lastVisited ?? 'system-design/hld').split('/');
  const course = getCourse(trackId, courseId);
  const { next, mode } = getNextUp(getCourseLessons(trackId, courseId), isComplete);
  const overall = overallProgress(isComplete);

  const rail = (
    <>
      <ProgressCard
        title="Overall progress"
        completed={overall.completed}
        total={overall.total}
        caption="Across every published lesson. Progress is saved in this browser."
      />
      <NoteCard
        title="How to study here"
        icon={<Lightbulb size={14} aria-hidden="true" />}
        items={[
          'Follow the numbered order — each lesson assumes the vocabulary of the ones before it.',
          'Read for trade-offs: interviews reward the why and when, not the what.',
          'Answer each interview question out loud before revealing it, then mark the lesson complete.',
        ]}
      />
    </>
  );

  return (
    <PageLayout rail={rail}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>{site.name}</p>
        <h1 className={styles.title}>Interview preparation, in depth.</h1>
        <p className={styles.lead}>
          Structured tracks that take you from fundamentals to full case studies. Every lesson
          explains the why, shows the trade-offs, and ends with the questions interviewers
          actually ask.
        </p>
      </header>

      {course && (
        <section className={styles.section}>
          <NextUpCard lesson={next} mode={mode} courseTitle={course.title} />
        </section>
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Tracks</h2>
        <div className={styles.grid}>
          {tracks.map((t) => (
            <TrackCard key={t.id} track={t} active={trackIsActive(t)} meta={trackMeta(t)} />
          ))}
        </div>
      </section>
    </PageLayout>
  );
}
