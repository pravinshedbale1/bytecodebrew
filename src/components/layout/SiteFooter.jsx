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

/** Contact and policy links at the bottom of every page. */
export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <nav className={styles.links} aria-label="Contact and policies">
        {POLICY_LINKS.map(([to, label]) => <Link key={to} to={to}>{label}</Link>)}
      </nav>
      <p className={styles.legal}>© {new Date().getFullYear()} {site.name} Solutions · Made in India</p>
    </footer>
  );
}
