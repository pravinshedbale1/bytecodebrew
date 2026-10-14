import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { MDXProvider } from '@mdx-js/react';
import { Clock, AlignLeft } from 'lucide-react';
import { getTrack, getCourse, getCourseLessons, getLessonContext } from '../curriculum';
import { getLessonComponent } from '../content/registry';
import { useProgress } from '../hooks/useProgress';
import { mdxComponents } from '../components/mdx/components';
import { PageLayout, RailCard } from '../components/layout/PageLayout';
import { TableOfContents } from '../components/lesson/TableOfContents';
import { LessonFooter } from '../components/lesson/LessonFooter';
import { ProgressCard, UpNextCard } from '../components/rail/RailWidgets';
import { LevelBadge } from '../components/common/Badge';
import { ComingSoon } from '../components/common/ComingSoon';
import { NotFoundPage } from './NotFoundPage';
import styles from './LessonPage.module.css';
import '../styles/prose.css';

/** Rendered after the lazy MDX resolves; reads the headings for the outline. */
function HeadingCollector({ containerRef, onCollect }) {
  useEffect(() => {
    const nodes = containerRef.current?.querySelectorAll('h2[id], h3[id]') ?? [];
    onCollect(
      Array.from(nodes).map((n) => ({
        id: n.id,
        text: n.textContent,
        level: Number(n.tagName[1]),
      })),
    );
  }, [containerRef, onCollect]);
  return null;
}

export function LessonPage() {
  const { trackId, courseId, lessonId } = useParams();
  const track = getTrack(trackId);
  const course = getCourse(trackId, courseId);
  const ctx = getLessonContext(trackId, courseId, lessonId);
  const { isComplete, setComplete, markVisited } = useProgress();
  const articleRef = useRef(null);
  const [headings, setHeadings] = useState([]);
  const collect = useCallback((h) => setHeadings(h), []);

  const key = ctx?.lesson.key;
  const Content = key ? getLessonComponent(key) : null;

  useEffect(() => {
    setHeadings([]);
    if (key && Content) markVisited(key);
  }, [key, Content, markVisited]);

  if (!track || !course || !ctx) return <NotFoundPage />;

  const { lesson, prev, next, position, total } = ctx;
  const coursePath = `/${trackId}/${courseId}`;
  const ready = getCourseLessons(trackId, courseId).filter((l) => l.available);
  const done = ready.filter((l) => isComplete(l.key)).length;

  const rail = (
    <>
      {headings.length > 1 && (
        <RailCard title="On this page" icon={<AlignLeft size={14} aria-hidden="true" />}>
          <TableOfContents headings={headings} />
        </RailCard>
      )}
      <UpNextCard lesson={next} label="Next lesson" />
      <ProgressCard title={`${course.shortTitle} progress`} completed={done} total={ready.length} />
    </>
  );

  return (
    <PageLayout rail={rail} contentWidth="820px">
      <article>
        <header className={styles.header}>
          <p className={styles.module}>{lesson.moduleTitle}</p>
          <h1 className={styles.title}>{lesson.title}</h1>
          <p className={styles.summary}>{lesson.summary}</p>
          <div className={styles.meta}>
            <LevelBadge level={lesson.level} />
            <span className={styles.metaItem}>
              <Clock size={14} aria-hidden="true" /> {lesson.minutes} min read
            </span>
            <span className={styles.metaItem}>
              Lesson {position} of {total}
            </span>
          </div>
        </header>

        {Content ? (
          <>
            <div className="prose" ref={articleRef}>
              <MDXProvider components={mdxComponents}>
                <Suspense fallback={<div className={styles.loading}>Loading lesson…</div>}>
                  <Content key={key} />
                  <HeadingCollector key={`h-${key}`} containerRef={articleRef} onCollect={collect} />
                </Suspense>
              </MDXProvider>
            </div>
            <LessonFooter
              complete={isComplete(key)}
              onToggleComplete={() => setComplete(key, !isComplete(key))}
              prev={prev}
              next={next}
              coursePath={coursePath}
            />
          </>
        ) : (
          <ComingSoon title="This lesson is planned" backTo={coursePath} backLabel="Back to roadmap">
            It’s part of the roadmap and will be published soon. Meanwhile, continue with the
            available lessons in order.
          </ComingSoon>
        )}
      </article>
    </PageLayout>
  );
}
