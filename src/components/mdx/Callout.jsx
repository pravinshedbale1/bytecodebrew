import { Info, Lightbulb, TriangleAlert, MessageSquareQuote, Building2 } from 'lucide-react';
import styles from './Callout.module.css';

const variants = {
  note: { icon: Info, label: 'Note' },
  tip: { icon: Lightbulb, label: 'Tip' },
  warning: { icon: TriangleAlert, label: 'Common mistake' },
  interview: { icon: MessageSquareQuote, label: 'In the interview' },
  example: { icon: Building2, label: 'Real world' },
};

/**
 * <Callout type="tip" title="Optional title">…</Callout>
 * Types: note | tip | warning | interview | example
 */
export function Callout({ type = 'note', title, children }) {
  const v = variants[type] ?? variants.note;
  const IconComponent = v.icon;
  return (
    <aside className={`${styles.callout} ${styles[type]}`}>
      <p className={styles.label}>
        <IconComponent size={15} strokeWidth={2} aria-hidden="true" />
        {title ?? v.label}
      </p>
      <div className={styles.body}>{children}</div>
    </aside>
  );
}
