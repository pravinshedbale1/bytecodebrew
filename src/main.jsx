// first: an admin "view as" tab must be known before any store reads this browser's data
import './lib/viewAs';
import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import './styles/tokens.css';
import './styles/global.css';
import './styles/glass.css';
import { App } from './App';
// the Claude API key follows the account from the moment of sign-in (moving an old browser-only key, clearing it on sign-out)
import './lib/claude';

/** Fades out the loading screen from index.html once the app has drawn its first frame. */
function BootDone() {
  useEffect(() => {
    let t;
    let cancelled = false;
    // the stylesheets load without blocking (vite.config.js): wait for them so the app is never seen unstyled
    const pending = [...document.querySelectorAll('link[rel="stylesheet"][media="print"]')]
      .map((l) => new Promise((done) => { l.addEventListener('load', done, { once: true }); l.addEventListener('error', done, { once: true }); }));
    Promise.all(pending).then(() => {
      if (cancelled) return;
      const boot = document.getElementById('boot');
      document.documentElement.classList.remove('booting');
      if (!boot) return;
      boot.classList.add('done');
      t = setTimeout(() => boot.remove(), 250);
    });
    return () => { cancelled = true; clearTimeout(t); };
  }, []);
  return null;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <BootDone />
    </BrowserRouter>
  </StrictMode>,
);

// Keep the app's hashed files for repeat visits (public/sw.js). Production only, after the page has loaded.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => {}); });
}
