/**
 * Free and premium. FREE_FEATURES / PREMIUM_FEATURES are what the site tells people (the /premium page
 * and every lock notice); PREMIUM_CONTENT switches which lesson content is locked.
 *
 * Premium access is an entitlements/{email} document in Firestore, written by the admin on /admin or
 * by the payments Worker after a Cashfree payment (with an optional expiresAt). firestore.rules and
 * workers/shared/auth.js enforce the same rules: keep them in sync.
 */
export const ADMIN_EMAILS = ['bytecodebrew@gmail.com'];
export const CONTACT_EMAIL = 'bytecodebrew@gmail.com';

/** Synced stores that only premium accounts may write to (see firestore.rules → premiumNames). */
export const PREMIUM_STORES = ['reviews', 'mocks', 'profile', 'drills', 'stories', 'runway'];

export const isAdminEmail = (email) => Boolean(email) && ADMIN_EMAILS.includes(email.toLowerCase());

/** Lesson content locked for free users. */
export const PREMIUM_CONTENT = {
  simulators: true,          // the hands-on simulators (hash ring, rate limiters, quorums, …)
  diagramSteps: true,        // "Step through it" on architecture and sequence diagrams
  advancedLessons: true,     // lessons whose level is Advanced: free users see the outline only
  dsaVisualisers: false,     // the array/tree/graph step-throughs in DSA lessons stay free
};

export const FREE_FEATURES = [
  'Every Beginner and Intermediate lesson in System Design, DSA and Behavioral',
  'Diagrams, code examples and the DSA step-by-step visualisations',
  'Lesson quizzes, practice exercises and progress tracking',
  'Highlights and notes, synced across your devices',
  'Search and printable cheat sheets',
  'Interview guides for the 50 best-paying companies in India',
];

export const PREMIUM_FEATURES = [
  ['All advanced lessons', 'the senior-level case studies (payments, stock exchange, Kafka, key-value store, video streaming…) and advanced patterns'],
  ['Interactive simulations', 'hash rings, rate limiters, quorums, cache eviction, load balancing, Bloom filters, consumer groups and more — change the inputs and watch what happens'],
  ['Step-through diagrams', 'walk every architecture and sequence diagram one step at a time, with each step explained'],
  ['314 problems with tests', 'a LeetCode-style editor with full statements, constraints, hints, hidden tests and performance checks'],
  ['Mock interviews', 'timed DSA, system design, LLD, behavioral and machine-coding rounds, with a rubric and one-click AI review'],
  ['Review deck', 'spaced repetition of everything you studied, so it is still there on interview day'],
  ['Runway: your day-by-day interview plan', 'tell it your days, hours a day and target company; it plans lessons, problems, mocks and revision in that company\'s interview style, shows what to do today and keeps you on pace'],
  ['Dashboard and LeetCode sync', 'streaks, weak areas, activity and your LeetCode history imported'],
  ['Code playground, behavioral drill and story bank', ''],
];
