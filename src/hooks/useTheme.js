import { useEffect, useState } from 'react';

const KEY = 'bcb:theme';

function systemTheme() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function getActiveTheme() {
  return document.documentElement.dataset.theme || systemTheme();
}

export function useTheme() {
  const [theme, setTheme] = useState(getActiveTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new CustomEvent('bcb:themechange', { detail: theme }));
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  return { theme, toggle };
}
