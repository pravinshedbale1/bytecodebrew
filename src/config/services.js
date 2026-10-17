/**
 * External services used by optional features. Each feature hides itself when its service is unset.
 *
 * LEETCODE_API  The LeetCode profile proxy (workers/leetcode), deployed on Cloudflare as
 *               bytecodebrew-leetcode. In development the Vite dev server serves it at /api/leetcode.
 * JUDGE0_URL    Runs Java in the Code Playground. ce.judge0.com is Judge0's free public instance.
 */
export const LEETCODE_API = import.meta.env.VITE_LEETCODE_API ?? (import.meta.env.DEV ? '/api/leetcode' : 'https://bytecodebrew-leetcode.bytecodebrew.workers.dev/leetcode');

/**
 * Premium purchases: the payments Worker (workers/payments). In development the Vite dev server serves
 * it at /api/pay with a mock Cashfree checkout (no real payment) unless VITE_PAYMENTS_API is set.
 */
export const PAYMENTS_API = import.meta.env.VITE_PAYMENTS_API ?? (import.meta.env.DEV ? '/api/pay' : 'https://bytecodebrew-payments.bytecodebrew.workers.dev/pay');

export const JUDGE0_URL = import.meta.env.VITE_JUDGE0_URL ?? 'https://ce.judge0.com';
export const JUDGE0_JAVA = 91;        // Java (JDK 17.0.6)

/** The AI interviewer calls the Claude API from the browser with the learner's own key. */
export const CLAUDE_MODEL = 'claude-opus-5-5';
