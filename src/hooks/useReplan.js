import { useCallback, useEffect, useMemo } from 'react';
import { useProgress } from './useProgress';
import { useSolved } from './useSolved';
import { useRunway, setRunway, useRunwaySettled } from './useRunway';
import { useCoachModel } from '../lib/coach/store';
import { catalog, patternOf } from '../lib/coach/catalog';
import { labelOf } from '../lib/coach/model';
import { climbForRunway, useClimbState } from '../lib/climb/store';
import { reflow } from '../lib/runwayPlan';
import { today as todayKey } from '../lib/dates';
import { isViewingAs } from '../lib/viewAs';

/** Lesson and problem progress, as the planner asks for it. */
export function useProgressFns() {
  const { isComplete } = useProgress();
  const { isSolved } = useSolved();
  return useMemo(() => ({ isComplete, isSolved }), [isComplete, isSolved]);
}

/**
 * Runway's re-planning, with everything it follows: the Daily Coach's pattern labels, Climb's measured
 * speed and ratings. Returns `replan(plan)` for edits (new hours, pace, a day off) and re-plans the
 * plan once a day on its own, the first time any page that shows it opens that day.
 */
export function useReplan() {
  const plan = useRunway();
  const progress = useProgressFns();
  const { solved } = useSolved();
  const model = useCoachModel();
  const climb = useClimbState();
  const settled = useRunwaySettled();
  const day = todayKey();

  const ctx = useMemo(() => {
    const now = Date.now();
    const { speed, pick } = climbForRunway(climb, solved);
    return {
      speed,
      pick,
      patternOf,
      titleOf: (p) => catalog.titles[p] ?? p,
      labelOf: (p) => labelOf(model.patterns[p], now),
      // a weak label only means something once the learner has had a real go at the pattern
      attempted: (p) => (model.patterns[p]?.n ?? 0) >= 3,
    };
  }, [model, climb, solved]);

  const replan = useCallback((p) => (p ? reflow(p, progress, todayKey(), ctx) : p), [progress, ctx]);

  useEffect(() => {
    if (!settled || !plan || plan.reflowedOn === day || day < plan.settings.start || day > plan.settings.end || isViewingAs()) return;
    setRunway((p) => (p && p.reflowedOn !== day ? reflow(p, progress, day, ctx) : p), { undo: false });
  }, [settled, plan, day, progress, ctx]);

  return { plan, progress, replan, ctx };
}
