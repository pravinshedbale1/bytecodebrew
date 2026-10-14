import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { AppSidebar } from './AppSidebar';
import { TopBar } from './TopBar';
import styles from './AppShell.module.css';

export function AppShell() {
  const { pathname, hash } = useLocation();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    setNavOpen(false);
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);

  return (
    <div className={styles.shell}>
      <a href="#main" className={styles.skip}>
        Skip to content
      </a>

      <AppSidebar open={navOpen} onClose={() => setNavOpen(false)} />
      {navOpen && <div className={styles.scrim} onClick={() => setNavOpen(false)} aria-hidden="true" />}

      <div className={styles.content}>
        <TopBar onOpenNav={() => setNavOpen(true)} />
        <main id="main" className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
