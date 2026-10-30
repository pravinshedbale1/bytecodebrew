import { useEffect, useRef } from 'react';
import styles from './ReadingProgress.module.css';

/** A thin line under the top bar showing how far through the article the reader is. */
export function ReadingProgress({ targetRef }) {
  const bar = useRef(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = targetRef.current;
      if (!el || !bar.current) return;
      const { top, height } = el.getBoundingClientRect();
      const span = height - window.innerHeight * 0.6;
      const done = span > 0 ? Math.min(1, Math.max(0, -top / span)) : 0;
      bar.current.style.transform = `scaleX(${done})`;
    };
    const onScroll = () => { frame ||= requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [targetRef]);
  return <div className={styles.track} aria-hidden="true" data-print="hide"><div ref={bar} className={styles.bar} /></div>;
}
