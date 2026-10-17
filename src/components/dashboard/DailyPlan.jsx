import { Link } from 'react-router';
import { Check, BookOpen, Layers, Code2, MessageSquare } from 'lucide-react';
import { useProgress } from '../../hooks/useProgress';
import { useSolved } from '../../hooks/useSolved';
import { useActivity } from '../../hooks/useActivity';
import { useMocks } from '../../hooks/useLearning';
import { useProfile, goalsOf } from '../../hooks/useProfile';
import { useDeck } from '../../lib/reviewDeck';
import { countdownPlan, nextLessonToRead, nextProblems, questionOfTheDay } from '../../lib/studyPlan';
import { today, dayKey } from '../../lib/dates';
import styles from './Dashboard.module.css';

/** Today's study plan: one lesson, the due reviews, a couple of problems and a behavioral question. */
export function DailyPlan({ compact = false }) {
  const { isComplete, completedAt, lastVisited } = useProgress();
  const { isSolved } = useSolved();
  const activity = useActivity();
  const profile = useProfile();
  const deck = useDeck();
  const { mocks } = useMocks();
  const done = activity[today()] ?? {};

  const plan = countdownPlan(profile, isComplete, completedAt);
  const goals = goalsOf(profile, plan);
  const answeredToday = (done.drill ?? 0) > 0 || mocks.some((m) => m.type === 'behavioral' && dayKey(new Date(m.at)) === today());
  const lesson = nextLessonToRead({ lastVisited, isComplete, plan });
  const problems = nextProblems(isSolved, goals.problems);
  const question = questionOfTheDay();
  const reviewsDone = done.review ?? 0;
  const due = deck?.due.length ?? 0;

  const items = [
    {
      icon: BookOpen,
      label: `Read ${goals.lessons === 1 ? 'a lesson' : `${goals.lessons} lessons`}`,
      progress: [Math.min(done.lesson ?? 0, goals.lessons), goals.lessons],
      detail: (
        <>
          {lesson ? <Link to={lesson.path}>{lesson.title}</Link> : 'Every lesson is complete'}
          {goals.lessonsFromPlan && <span className={styles.planNote}> · pace for your interview date</span>}
        </>
      ),
    },
    // Reviews only appear once the deck has cards (after completing a lesson or missing a quiz question).
    deck && deck.cards.length > 0 && {
      icon: Layers,
      label: 'Review cards',
      progress: [Math.min(reviewsDone, goals.reviews), goals.reviews],
      detail: due > 0 ? <Link to="/review">{due} due now</Link> : 'All caught up for today',
      complete: due === 0,
    },
    {
      icon: Code2,
      label: `Solve ${goals.problems === 1 ? 'a problem' : `${goals.problems} problems`}`,
      progress: [Math.min(done.problem ?? 0, goals.problems), goals.problems],
      detail: problems.length ? (
        <span className={styles.problemList}>
          {problems.map((p) => (
            <Link key={p.slug} to={`/solve/${p.slug}`}>{p.title}</Link>
          ))}
        </span>
      ) : (
        'Every ladder problem is solved'
      ),
    },
    {
      icon: MessageSquare,
      label: 'Answer out loud',
      progress: [answeredToday ? 1 : 0, 1],
      detail: <Link to={`/behavioral/question-bank/behavioral-drill?q=${question.index}#drill`}>“{question.text}”</Link>,
    },
  ].filter(Boolean);

  return (
    <ol className={`${styles.plan} ${compact ? styles.planCompact : ''}`}>
      {items.map((it) => {
        const [n, of] = it.progress;
        const complete = it.complete ?? n >= of;
        const Icon = it.icon;
        return (
          <li key={it.label} className={`${styles.planItem} ${complete ? styles.planDone : ''}`}>
            <span className={styles.planIcon} aria-hidden="true">
              {complete ? <Check size={15} strokeWidth={2.5} /> : <Icon size={15} />}
            </span>
            <span className={styles.planBody}>
              <span className={styles.planLabel}>
                {it.label}
                <span className={styles.planCount}>{n}/{of}</span>
              </span>
              <span className={styles.planDetail}>{it.detail}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
