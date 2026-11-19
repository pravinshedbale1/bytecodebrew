import { Lock, MousePointerClick } from 'lucide-react';
import { VizControls } from './VizStepper';
import styles from './VizFrame.module.css';

/**
 * The pieces every visual on the site shares, so they all read the same:
 *   VizHead      the title bar: one icon, the title, and on the right one short line saying how to use it
 *   StepDock     the step controls, docked at the bottom of the screen while the visual is in view
 *   stepKeys(s)  ← / → step through any visual that has step controls
 *
 * Step-throughs, diagram walkthroughs, the older players and simulators that step all use the same
 * hint (STEP_HINT). Simulators that are driven by their own settings use SIM_HINT. Locked visuals
 * show PremiumHint.
 */
export const STEP_HINT = 'Step with ‹ › or the arrow keys';
/** The class for a hint written by hand next to other header controls. */
export const vizHint = styles.hint;
export const SIM_HINT = 'Change the settings to see it update';

export function VizHead({ title, hint, as: Tag = 'div', children }) {
  return (
    <Tag className={styles.head}>
      <span className={styles.title}><MousePointerClick size={14} aria-hidden="true" /> {title}</span>
      {children ?? (hint && <span className={styles.hint}>{hint}</span>)}
    </Tag>
  );
}

export function PremiumHint() {
  return <span className={styles.hint}><Lock size={11} aria-hidden="true" /> Premium</span>;
}

/** The step controls, stuck to the bottom of the screen while any part of the visual is in view. */
export function StepDock({ s, count }) {
  return (
    <div className={styles.dock} data-sticky-dock>
      <VizControls s={s} count={count} />
    </div>
  );
}

/** onKeyDown for a focusable visual: the arrow keys step it. Ignores keys typed into its inputs. */
export function stepKeys(s, { onEscape } = {}) {
  return (e) => {
    if (e.target !== e.currentTarget && e.target.closest('input, textarea, select, [contenteditable]')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); s.next(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); s.prev(); }
    else if (e.key === 'Escape' && onEscape) { e.preventDefault(); onEscape(); }
  };
}

/**
 * The frame for the simpler players (ArrayViz, TreeViz, GraphViz): the shared header, the body, and
 * the docked controls. Click it (or tab to it) and the arrow keys step it.
 */
export function PlayerFrame({ title, s, count, children }) {
  return (
    <figure className={styles.frame} tabIndex={0} onKeyDown={stepKeys(s)} aria-label={`${title}. Use the left and right arrow keys to step.`}>
      <VizHead as="figcaption" title={title} hint={STEP_HINT} />
      <div className={styles.body}>{children}</div>
      <StepDock s={s} count={count} />
    </figure>
  );
}
