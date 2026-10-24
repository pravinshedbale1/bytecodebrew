import { Link } from 'react-router';
import { site } from '../../config/site';
import styles from './SiteFooter.module.css';

export const POLICY_LINKS = [
  ['/premium', 'Premium'],
  ['/contact', 'Contact us'],
  ['/terms', 'Terms & Conditions'],
  ['/privacy', 'Privacy Policy'],
  ['/refund-policy', 'Refund & Cancellation'],
  ['/delivery-policy', 'Delivery Policy'],
];

/** Instagram's glyph, drawn like the lucide icons around it (lucide no longer ships brand logos). */
function InstagramIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

const ICONS = { Instagram: InstagramIcon };

/** Contact and policy links at the bottom of every page, and our social pages. */
export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <nav className={styles.links} aria-label="Contact and policies">
        {POLICY_LINKS.map(([to, label]) => <Link key={to} to={to}>{label}</Link>)}
      </nav>
      <div className={styles.end}>
        <nav className={styles.social} aria-label="Follow us">
          {site.social.map((s) => {
            const Icon = ICONS[s.name];
            return (
              <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" title={`${site.name} on ${s.name}`}>
                {Icon && <Icon />}<span>@{s.handle}</span>
              </a>
            );
          })}
        </nav>
        <p className={styles.legal}>© {new Date().getFullYear()} {site.name} Solutions · Made in India</p>
      </div>
    </footer>
  );
}
