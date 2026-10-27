import { Suspense, lazy } from 'react';
import { MousePointerClick } from 'lucide-react';
import { usePremium } from '../../../hooks/useAccess';
import { PREMIUM_CONTENT } from '../../../config/access';
import { PremiumNotice } from '../../access/PremiumGate';
import styles from '../../sim/Sim.module.css';

/**
 * A step-through loaded on first render, with a placeholder of about the same size so the page
 * doesn't jump. DSA step-throughs are free. Others can name a PREMIUM_CONTENT switch (`premium`):
 * while it is on, free users see a locked card describing the visual and its code is never loaded.
 */
export function lazyViz(load, name, { premium, title, blurb } = {}) {
  const Comp = lazy(() => load().then((m) => ({ default: m[name] })));
  function LazyViz(props) {
    const isPremium = usePremium();
    if (premium && PREMIUM_CONTENT[premium] && !isPremium) {
      return (
        <section className={styles.frame} aria-label={`${props.title ?? title} (premium)`}>
          <header className={styles.head}>
            <span className={styles.title}><MousePointerClick size={14} aria-hidden="true" /> {props.title ?? title}</span>
            <span className={styles.badge}>Step-through · Premium</span>
          </header>
          <div className={styles.body} style={{ paddingTop: 0 }}>
            <PremiumNotice compact feature="Interactive step-through" blurb={blurb} />
          </div>
        </section>
      );
    }
    return (
      <Suspense fallback={<div style={{ minHeight: 620, margin: '1.8em 0', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }} aria-busy="true" />}>
        <Comp {...props} />
      </Suspense>
    );
  }
  LazyViz.displayName = `Lazy(${name})`;
  return LazyViz;
}
