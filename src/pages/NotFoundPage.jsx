import { PageLayout } from '../components/layout/PageLayout';
import { ComingSoon } from '../components/common/ComingSoon';

export function NotFoundPage() {
  return (
    <PageLayout contentWidth="720px">
      <ComingSoon title="Page not found" backTo="/" backLabel="Go to home">
        This page doesn’t exist. It may have moved, or the link may be mistyped.
      </ComingSoon>
    </PageLayout>
  );
}
