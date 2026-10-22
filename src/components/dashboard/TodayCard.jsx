import { Link } from 'react-router';
import { Sunrise, ChevronRight, PlaneTakeoff, Check } from 'lucide-react';
import { useCoach } from '../../lib/coach/store';
import { useProgress } from '../../hooks/useProgress';
import { useSolved } from '../../hooks/useSolved';
import { isTaskDone } from '../../lib/runwayPlan';
import { useReplan } from '../../hooks/useReplan';
import { useClimbState } from '../../lib/climb/store';
import { DEFAULT_GOAL } from '../../lib/climb/model';
import { dayKey } from '../../lib/dates';
import ui from '../common/ui.module.css';
import styles from './Dashboard.module.css';

/**
 * Where to go today, everywhere it is asked (Dashboard, Home): one summary of the day — the Runway
 * countdown and tasks when there is a plan, the Daily Coach session — and one way in, the Today page.
 */
export function TodayCard({ compact = false }) {
  const { session, plan, context, day } = useCoach();
  useReplan();
  const climb = useClimbState();
  const climbToday = climb.events.filter((e) => dayKey(new Date(e.t)) === day).length;
  const climbGoal = climb.goal ?? DEFAULT_GOAL;
  const { isComplete } = useProgress();
  const { isSolved } = useSolved();
  const progress = { isComplete, isSolved };

  const runwayDay = plan?.days.find((d) => d.date === day);
  const tasksDone = runwayDay ? runwayDay.tasks.filter((t) => isTaskDone(plan, t, progress)).length : 0;
  const drills = session?.drills.length ?? 0;
  const answered = Object.keys(session?.answers ?? {}).length;
  const resolveOpen = Boolean(session?.resolve && !session.resolveResult);
  const coachDone = Boolean(session) && answered >= drills && !resolveOpen;
  const planDone = !runwayDay || tasksDone >= runwayDay.tasks.length;
  const allDone = coachDone && planDone;
  const started = answered > 0 || tasksDone > 0 || Boolean(session?.resolveResult);

  const lines = [
    runwayDay && runwayDay.tasks.length > 0 && { done: planDone, text: `Runway: ${tasksDone} of ${runwayDay.tasks.length} task${runwayDay.tasks.length === 1 ? '' : 's'}` },
    !plan && { done: false, text: 'A lesson, a couple of problems, one answer out loud' },
    session && { done: answered >= drills, text: `${session.placement ? 'Placement' : 'Recognition'} drills: ${answered}/${drills}` },
    session?.resolve && { done: !resolveOpen, text: resolveOpen ? 'One re-solve from memory' : 'Re-solve done' },
    climb.events.length > 0 && { done: climbToday >= climbGoal, text: `Climb: ${climbToday} of ${climbGoal} rated problems` },
  ].filter(Boolean);

  if (compact) {
    return (
      <div className={styles.todayCompact}>
        {context.daysLeft != null && <p className={styles.todayCount}><PlaneTakeoff size={14} aria-hidden="true" /> <strong>{context.daysLeft}</strong> day{context.daysLeft === 1 ? '' : 's'} to {context.company ? `your ${context.company.name} interview` : 'your interview'}</p>}
        <ul className={styles.todayLines}>
          {lines.map((l) => <li key={l.text} className={l.done ? styles.todayLineDone : ''}>{l.done ? <Check size={13} aria-hidden="true" /> : <span className={styles.todayDot} aria-hidden="true" />} {l.text}</li>)}
        </ul>
        <Link to="/today" className={`${ui.btn} ${allDone ? '' : ui.primary} ${ui.small}`}>{allDone ? 'See today' : started ? 'Continue today' : 'Start today'} <ChevronRight size={13} /></Link>
      </div>
    );
  }

  return (
    <section className={`${ui.panel} ${styles.todayCard}`}>
      {context.daysLeft != null ? (
        <span className={styles.runwayDays}>
          <strong>{context.daysLeft}</strong>
          <span>day{context.daysLeft === 1 ? '' : 's'} to go</span>
        </span>
      ) : <Sunrise size={22} aria-hidden="true" className={styles.coachIcon} />}
      <div className={styles.todayBody}>
        <h2 className={ui.panelTitle}>
          Today{context.company ? ` · ${context.company.name} plan` : ''}
          {allDone && <Check size={16} className={styles.runwayDone} aria-label="All done" />}
        </h2>
        <ul className={styles.todayLines}>
          {lines.map((l) => <li key={l.text} className={l.done ? styles.todayLineDone : ''}>{l.done ? <Check size={13} aria-hidden="true" /> : <span className={styles.todayDot} aria-hidden="true" />} {l.text}</li>)}
        </ul>
        {!plan && <p className={ui.help} style={{ margin: '6px 0 0' }}>Interview coming up? <Link to="/runway">Plan your runway</Link> and Today follows it.</p>}
      </div>
      <Link to="/today" className={`${ui.btn} ${allDone ? '' : ui.primary}`}>{allDone ? 'See today' : started ? 'Continue today' : 'Start today'} <ChevronRight size={14} /></Link>
    </section>
  );
}
