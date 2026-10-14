import { useEffect, useState } from 'react';

/** Tracks which heading is currently at the top of the viewport (scroll-spy). */
export function useActiveHeading(ids) {
  const [active, setActive] = useState(null);

  useEffect(() => {
    if (!ids.length) return;
    const elements = ids.map((id) => document.getElementById(id)).filter(Boolean);

    const onScroll = () => {
      const offset = 120;
      let current = elements[0]?.id ?? null;
      for (const el of elements) {
        if (el.getBoundingClientRect().top - offset <= 0) current = el.id;
        else break;
      }
      setActive(current);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [ids]);

  return active;
}
