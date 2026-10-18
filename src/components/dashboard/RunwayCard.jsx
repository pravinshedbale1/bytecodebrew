import { Link } from 'react-router';
import { PlaneTakeoff, Check, ArrowRight } from 'lucide-react';
import { useRunway } from '../../hooks/useRunway';
import { useProgress } from '../../hooks/useProgress';
import { useSolved } from '../../hooks/useSolved';
import { isTaskDone, planStats } from '../../lib/runwayPlan';
import { today as todayKey } from '../../lib/dates';
import ui from '../common/ui.module.css';
import styles from './Dashboard.module.css';

/** Dashboard banner: days to the interview and today's Runway progress, or an invitation to plan one. */
export function RunwayCard() {
  const plan = useRunway();
  const { isComplete } = useProgress();
  const { isSolved } = useSolved();
  if (!plan) {
    return (
      <Link to="/runway" className={styles.runway}>
        <PlaneTakeoff size={22} aria-hidden="true" className={styles.runwayIcon} />
        <span className={styles.runwayBody}>
          <strong>Have an interview coming up?</strong>
          <span>Tell Runway how many days you have and your hours a day, and get a day-by-day plan to interview day.</span>
        </span>
        <span className={`${ui.btn} ${ui.primary} ${ui.small}`}>Plan my runway <ArrowRight size={13} /></span>
      </Link>
    );
  }
  const progress = { isComplete, isSolved };
  const today = todayKey();
  const stats = planStats(plan, progress, today);
  const day = plan.days.find((d) => d.date === today);
  const done = day ? day.tasks.filter((t) => isTaskDone(plan, t, progress)).length : 0;
  return (
    <Link to="/runway" className={styles.runway}>
      <span className={styles.runwayDays}>
        <strong>{Math.max(0, stats.daysLeft)}</strong>
        <span>day{stats.daysLeft === 1 ? '' : 's'} to go</span>
      </span>
      <span className={styles.runwayBody}>
        <strong>
          {!day ? 'Your runway' : day.phase === 'rest' ? 'Rest day today' : `Today: ${done} of ${day.tasks.length} tasks done`}
          {day && day.tasks.length > 0 && done === day.tasks.length && <Check size={15} className={styles.runwayDone} aria-hidden="true" />}
        </strong>
        <span>
          {stats.done}/{stats.total} tasks in the plan
          {stats.behind > 0 ? ` · ${stats.behind} behind` : ' · on track'}
        </span>
      </span>
      <span className={`${ui.btn} ${ui.small}`}>Open Runway <ArrowRight size={13} /></span>
    </Link>
  );
}
