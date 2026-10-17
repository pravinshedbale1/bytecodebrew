/**
 * Who can use the premium features (LeetCode sync and import, solving problems with tests, the code
 * playground, mock interviews, the review deck, study plans, the behavioral drill and story bank).
 *
 * Everyone, signed in or not, can read lessons, highlight, mark lessons complete, take the lesson
 * quizzes and practice tasks, search and print cheat sheets.
 *
 * Premium access is granted per Google account email by the admin on /admin, which writes
 * entitlements/{email} in Firestore. firestore.rules enforces the same lists: keep them in sync.
 */
export const ADMIN_EMAILS = ['bytecodebrew@gmail.com'];
export const CONTACT_EMAIL = 'bytecodebrew@gmail.com';

/** Synced stores that only premium accounts may write to (see firestore.rules → premiumNames). */
export const PREMIUM_STORES = ['reviews', 'mocks', 'profile', 'drills', 'stories'];

export const isAdminEmail = (email) => Boolean(email) && ADMIN_EMAILS.includes(email.toLowerCase());
