import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { MDXProvider } from '@mdx-js/react';
import { Clock, AlignLeft, Lock } from 'lucide-react';
import { useAccess } from '../hooks/useAccess';
import { PREMIUM_CONTENT } from '../config/access';
import { PremiumNotice } from '../components/access/PremiumGate';
import { getTrack, getCourse, getCourseLessons, getLessonContext } from '../curriculum';
import { getLessonComponent } from '../content/registry';
import { useProgress } from '../hooks/useProgress';
import { mdxComponents } from '../components/mdx/components';
import { PageLayout, RailCard } from '../components/layout/PageLayout';
import { TableOfContents } from '../components/lesson/TableOfContents';
import { LessonFooter } from '../components/lesson/LessonFooter';
import { ReadingProgress } from '../components/lesson/ReadingProgress';
import { ProgressCard, UpNextCard } from '../components/rail/RailWidgets';
import { LevelBadge } from '../components/common/Badge';
import { ComingSoon } from '../components/common/ComingSoon';
import { HighlightLayer } from '../components/highlights/HighlightLayer';
import { LessonHighlightsCard } from '../components/highlights/LessonHighlightsCard';
import { LessonKeyContext } from '../components/lesson/LessonContext';
import { LessonQuiz } from '../components/mdx/Quiz';
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
    // Deep links (from search) arrive before the lazy lesson renders, so scroll once it has.
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id) document.getElementById(id)?.scrollIntoView();
  }, [containerRef, onCollect]);
  return null;
}

/** Whether a lesson is locked for this visitor (advanced lessons, unless premium). 'loading' while access is unknown. */
export function useLessonLock(lesson) {
  const { status } = useAccess();
  if (!PREMIUM_CONTENT.advancedLessons || lesson?.level !== 'Advanced') return false;
  if (status === 'loading') return 'loading';
  return status !== 'premium';
}

/** What a free visitor sees for an advanced lesson: its outline and the premium card. The lesson itself is not loaded. */
function LockedLesson({ lessonKey }) {
  const [outline, setOutline] = useState(null);
  useEffect(() => {
    let alive = true;
    import('virtual:search-index').then((m) => alive && setOutline((m.default ?? m)[lessonKey]?.headings ?? []));
    return () => { alive = false; };
  }, [lessonKey]);
  return (
    <div className={styles.locked}>
      {outline?.length > 0 && (
        <section className={styles.outline} aria-label="What this lesson covers">
          <p className={styles.outlineHead}><Lock size={14} aria-hidden="true" /> What this advanced lesson covers</p>
          <ul>
            {outline.filter((h) => !/^(Further reading|Interview questions|Practice)$/.test(h.text)).slice(0, 18).map((h) => <li key={h.id}>{h.text}</li>)}
          </ul>
        </section>
      )}
      <PremiumNotice feature="This advanced lesson" blurb="Advanced lessons are the senior-level material: in-depth case studies and patterns with diagrams you can step through, interactive simulations, interview Q&A and practice exercises." />
    </div>
  );
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
  const lock = useLessonLock(ctx?.lesson);
  const Content = key && !lock ? getLessonComponent(key) : null;

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
      {Content && <LessonHighlightsCard rootRef={articleRef} lessonKey={key} />}
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

        {Content && !lock && headings.length > 2 && (
          <details className={styles.contents}>
            <summary>On this page <span>{headings.filter((h) => h.level === 2).length} sections</span></summary>
            <TableOfContents headings={headings.filter((h) => h.level === 2)} />
          </details>
        )}

        {lock === 'loading' ? (
          <div className={styles.loading}>Checking your access…</div>
        ) : lock ? (
          <LockedLesson lessonKey={key} />
        ) : Content ? (
          <LessonKeyContext.Provider value={key}>
            <ReadingProgress targetRef={articleRef} />
            <div className="prose" ref={articleRef}>
              <MDXProvider components={mdxComponents}>
                <Suspense fallback={<div className={styles.loading}>Loading lesson…</div>}>
                  <Content key={key} />
                  <HeadingCollector key={`h-${key}`} containerRef={articleRef} onCollect={collect} />
                </Suspense>
              </MDXProvider>
            </div>
            <HighlightLayer rootRef={articleRef} lessonKey={key} />
            <LessonQuiz lessonKey={key} />
            <LessonFooter
              complete={isComplete(key)}
              onToggleComplete={() => setComplete(key, !isComplete(key))}
              prev={prev}
              next={next}
              coursePath={coursePath}
            />
          </LessonKeyContext.Provider>
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
