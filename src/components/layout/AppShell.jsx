import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { AppSidebar } from './AppSidebar';
import { TopBar, crumbsFor } from './TopBar';
import { site } from '../../config/site';
import { SearchDialog } from '../search/SearchDialog';
import { SignInNudge } from './SignInNudge';
import { SiteFooter } from './SiteFooter';
import { ViewAsBanner } from './ViewAsBanner';
import styles from './AppShell.module.css';

export function AppShell() {
  const { pathname, hash } = useLocation();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    setNavOpen(false);
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);

  // Each page gets its own tab title (better bookmarks, history and sharing).
  useEffect(() => {
    const crumbs = crumbsFor(pathname);
    document.title = crumbs.length > 1 ? `${crumbs[crumbs.length - 1].label} · ${site.name}` : `${site.name} — Interview preparation, in depth`;
  }, [pathname]);

  return (
    <div className={styles.shell}>
      <a href="#main" className={styles.skip}>
        Skip to content
      </a>

      <AppSidebar open={navOpen} onClose={() => setNavOpen(false)} />
      {navOpen && <div className={styles.scrim} onClick={() => setNavOpen(false)} aria-hidden="true" />}

      <div className={styles.content}>
        <ViewAsBanner />
        <TopBar onOpenNav={() => setNavOpen(true)} />
        <main id="main" className={styles.main}>
          <Outlet />
        </main>
        <SiteFooter />
      </div>
      <SearchDialog />
      <SignInNudge />
    </div>
  );
}
