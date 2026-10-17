/**
 * Fetches a public LeetCode profile through LeetCode's GraphQL endpoint.
 * Shared by the Cloudflare Worker (production) and the Vite dev server (local testing).
 *
 * LeetCode exposes only the 20 most recent accepted submissions publicly, so the site
 * accumulates them across refreshes; counts and the yearly calendar are complete.
 */
export const USERNAME = /^[A-Za-z0-9_-]{1,40}$/;
export const CACHE_SECONDS = 3600;

const QUERY = `
query profile($username: String!) {
  allQuestionsCount { difficulty count }
  matchedUser(username: $username) {
    username
    profile { realName userAvatar ranking }
    submitStatsGlobal { acSubmissionNum { difficulty count } }
    userCalendar { streak totalActiveDays submissionCalendar }
  }
  recentAcSubmissionList(username: $username, limit: 20) { title titleSlug timestamp }
}`;

export class ProfileError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export async function fetchLeetCodeProfile(username, fetchImpl = fetch) {
  if (!USERNAME.test(username ?? '')) throw new ProfileError(400, 'That does not look like a LeetCode username.');

  const res = await fetchImpl('https://leetcode.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Referer: 'https://leetcode.com',
      'User-Agent': 'ByteCodeBrew profile sync (+https://bytecodebrew.com)',
    },
    body: JSON.stringify({ query: QUERY, variables: { username } }),
  });
  if (res.status === 429) throw new ProfileError(429, 'LeetCode is rate-limiting requests. Try again later.');
  if (!res.ok) throw new ProfileError(502, `LeetCode answered with ${res.status}.`);

  const { data } = await res.json();
  const user = data?.matchedUser;
  if (!user) throw new ProfileError(404, `No public LeetCode profile called "${username}".`);

  const count = (list, d) => list?.find((x) => x.difficulty === d)?.count ?? 0;
  const solved = user.submitStatsGlobal?.acSubmissionNum;
  const totals = data.allQuestionsCount;
  let calendar = {};
  try {
    // keys are unix seconds at UTC midnight → 'YYYY-MM-DD'
    for (const [ts, n] of Object.entries(JSON.parse(user.userCalendar?.submissionCalendar || '{}'))) {
      calendar[new Date(Number(ts) * 1000).toISOString().slice(0, 10)] = n;
    }
  } catch {
    calendar = {};
  }

  return {
    username: user.username,
    realName: user.profile?.realName || null,
    avatar: user.profile?.userAvatar || null,
    ranking: user.profile?.ranking ?? null,
    solved: { all: count(solved, 'All'), easy: count(solved, 'Easy'), medium: count(solved, 'Medium'), hard: count(solved, 'Hard') },
    totals: { all: count(totals, 'All'), easy: count(totals, 'Easy'), medium: count(totals, 'Medium'), hard: count(totals, 'Hard') },
    streak: user.userCalendar?.streak ?? 0,
    activeDays: user.userCalendar?.totalActiveDays ?? 0,
    calendar,
    recent: (data.recentAcSubmissionList ?? []).map((s) => ({
      slug: s.titleSlug,
      title: s.title,
      at: new Date(Number(s.timestamp) * 1000).toISOString(),
    })),
    fetchedAt: Date.now(),
  };
}
