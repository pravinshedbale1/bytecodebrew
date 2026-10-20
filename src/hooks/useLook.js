import { useEffect, useState } from 'react';

/**
 * The visual style (experiment): 'classic' or 'glass' (src/styles/glass.css), on top of the light or
 * dark theme. Saved in this browser and applied before first paint by index.html; ?look=glass or
 * ?look=classic in any URL switches it too.
 */
const KEY = 'bcb:look';
export const LOOKS = [
  { id: 'classic', label: 'Classic' },
  { id: 'glass', label: 'Liquid glass' },
];

export const currentLook = () => (document.documentElement.dataset.look === 'glass' ? 'glass' : 'classic');

export function setLook(look) {
  if (look === 'glass') document.documentElement.dataset.look = 'glass';
  else delete document.documentElement.dataset.look;
  try { localStorage.setItem(KEY, look); } catch { /* ignore */ }
  window.dispatchEvent(new CustomEvent('bcb:lookchange', { detail: look }));
}

export function useLook() {
  const [look, set] = useState(currentLook);
  useEffect(() => {
    const on = () => set(currentLook());
    window.addEventListener('bcb:lookchange', on);
    return () => window.removeEventListener('bcb:lookchange', on);
  }, []);
  return [look, setLook];
}
