import { PageLayout } from '../layout/PageLayout';
import { useAccess } from '../../hooks/useAccess';
import { PremiumNotice } from './PremiumGate';
import page from '../../pages/Page.module.css';

/** A whole premium page: the page itself for approved accounts, otherwise its title and the access notice. */
export function PremiumPage({ eyebrow = 'Premium', title, lead, feature, rail, children }) {
  const { status } = useAccess();
  if (status === 'premium') return children;
  return (
    <PageLayout rail={rail}>
      <header className={page.header}>
        <p className={page.eyebrow}>{eyebrow}</p>
        <h1 className={page.title}>{title}</h1>
        {lead && <p className={page.lead}>{lead}</p>}
      </header>
      <PremiumNotice feature={feature} />
    </PageLayout>
  );
}
