#!/usr/bin/env node
/**
 * Browser smoke test: opens the main pages of a running build and fails on any page error, console
 * error or missing content. Doesn't call external services (Judge0, LeetCode, Firebase writes).
 *
 *   npx vite preview --port 4173 &
 *   node scripts/smoke.mjs http://localhost:4173
 *
 * Needs playwright-core and a Chromium: CI installs both; locally set CHROME_PATH to your Chrome.
 */
import { chromium } from 'playwright-core';

const base = process.argv[2] ?? 'http://localhost:4173';
const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const problems = [];
page.on('pageerror', (e) => problems.push(`page error: ${e.message}`));
page.on('console', (m) => {
  // Firebase may log when it can't reach the network in CI; everything else is a real error
  if (m.type() === 'error' && !/firestore|firebase|googleapis/i.test(m.text())) problems.push(`console error: ${m.text()}`);
});

const checks = [
  ['/', 'Interview preparation, in depth'],
  ['/system-design/hld', 'High-Level Design'],
  ['/system-design/hld/caching', 'Check your understanding'],
  ['/dsa/patterns/two-pointers', 'Solve'],
  // Signed out, premium pages show the access notice instead (see src/components/access)
  ['/problems', 'is a premium feature'],
  ['/solve/two-sum', 'is a premium feature'],
  ['/review', 'is a premium feature'],
  ['/dashboard', 'is a premium feature'],
  ['/mock', 'is a premium feature'],
  ['/playground', 'is a premium feature'],
  ['/admin', 'Page not found'],
  ['/cheatsheet/system-design/lld', 'Low-Level Design'],
  ['/behavioral/question-bank/behavioral-drill', 'Behavioral'],
];

for (const [path, text] of checks) {
  const before = problems.length;
  await page.goto(base + path, { waitUntil: 'networkidle' });
  try {
    await page.getByText(text, { exact: false }).first().waitFor({ timeout: 10000 });
  } catch {
    problems.push(`${path}: expected to see "${text}"`);
  }
  console.log(`${problems.length === before ? '✓' : '✗'} ${path}`);
}

// search opens and finds a lesson
await page.goto(base + '/', { waitUntil: 'networkidle' });
await page.keyboard.press('Control+k');
await page.locator('input[role=combobox]').waitFor({ timeout: 5000 });
await page.keyboard.type('consistant hashing');
try {
  await page.getByRole('option', { name: /Consistent Hashing/ }).first().waitFor({ timeout: 5000 });
  console.log('✓ search (with a typo)');
} catch {
  problems.push('search: no result for "consistant hashing"');
}

await browser.close();
if (problems.length) {
  console.error(`\n✗ ${problems.length} problem(s):\n${problems.map((p) => `  - ${p}`).join('\n')}`);
  process.exit(1);
}
console.log('\nSmoke test passed');
