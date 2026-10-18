// GitHub Pages serves unknown paths through 404.html with an HTTP 404 status. People never notice, but
// crawlers and checks (search engines, Cashfree's website review) see "not found". Give the fixed pages a
// real file (dist/terms.html is served at /terms with a 200) so they return 200 too.
import { copyFileSync } from 'node:fs';

const PAGES = ['runway', 'premium', 'contact', 'terms', 'privacy', 'refund-policy', 'delivery-policy', 'problems', 'mock', 'dashboard', 'review', 'playground', 'highlights'];
for (const p of PAGES) copyFileSync('dist/index.html', `dist/${p}.html`);
copyFileSync('dist/index.html', 'dist/404.html');
console.log(`✓ ${PAGES.length} static pages + 404.html`);
