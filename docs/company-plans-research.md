# Company-specific Runway plans: research (October 2026)

Research for adding company plans to Runway. Covers how the main companies' loops look in 2025–2026,
the new AI-assisted and practical rounds, how to build a company question bank without breaking anyone's
terms, and what to build.

**Source quality.** Very little of this is published by the companies themselves. Official or
press-confirmed facts are marked **[confirmed]**; everything else comes from candidate reports and
prep sites and is marked **[reported]**. Loops vary by team, level and country, so every company page
on the site should carry a "last checked" date and tell learners to confirm the format with their
recruiter.

---

## 1. The big change: interviews now test working with AI and real code

Since mid-2025 the industry has split three ways.

| Approach | Who | What the round looks like |
|---|---|---|
| **AI expected** | Canva **[confirmed]** | Since June 2025 backend, ML and frontend candidates are *expected* to use Copilot, Cursor or Claude in the technical interview. Problems are open-ended (example given: a system for aircraft take-offs and landings at a busy airport), and interviewers judge how well you direct, check and fix the AI's work. |
| **AI-enabled round alongside classic rounds** | Meta **[confirmed pilot, details reported]** | Announced to staff in July 2025. One of the two onsite coding rounds can be "AI-enabled": about 60 minutes in CoderPad with an AI chat built in. Reports describe one multi-stage problem in a multi-file codebase (fix a bug, add a feature, then optimise), scored on problem-solving, code quality, verification and communication, not on prompting. The other coding round stays AI-free. |
| | Google **[confirmed pilot]** | Pilot from H2 2026, junior to mid-level, selected US teams: a "code comprehension" round where you *read, debug and optimise* an existing codebase with Gemini. Googleyness & Leadership also gains a technical design conversation about your past work. Standard coding rounds stay AI-free, and since 2025 many loops include at least one in-person round to counter cheating. |
| | Amazon **[mixed]** | Live loop rounds prohibit generative AI unless explicitly allowed, and breaking that can disqualify you **[confirmed, 2025 guidance]**. The online assessment is reported to include a task done with an AI assistant **[reported]**. Some 2026 loops reportedly include a Leadership Principles question about when you did or didn't use AI tools, and AWS AI, Alexa and Ads teams a "GenAI fluency" discussion **[reported]**. |
| | Microsoft **[reported]** | Several 2026 candidate reports (Bellevue, Bengaluru AI Foundry) mention an "AI-assisted coding" or "AI coding agent" round next to the DSA and design rounds. It depends on the team. |
| | Razorpay **[reported, single source]** | A May 2026 report lists an "agentic coding round" after machine coding and HLD. |
| **AI forbidden** | Goldman Sachs; Anthropic by default; Cursor's first round **[reported]** | Classic rounds; covert AI use is treated as cheating. |

What this means for learners: **classic DSA is still in almost every loop**, but candidates for Meta,
Google (pilot), Canva, Microsoft and some Indian product companies now also need to practise:

1. **Reading and debugging an unfamiliar codebase** (Google code comprehension, Stripe bug squash, Meta's AI round).
2. **Directing an AI assistant and checking its output**: splitting the task, prompting, spotting wrong or insecure code, writing tests, explaining trade-offs out loud.
3. **Building something that runs in 90 minutes** (machine coding: Flipkart, Swiggy, Razorpay, Uber LLD).

## 2. Company loops at a glance

Data as reported in 2025–2026 (mostly SDE-1 to SDE-3 / L3–L5). "Plan emphasis" is what a Runway plan for that company should weight.

| Company | Typical loop | Distinctive | Plan emphasis |
|---|---|---|---|
| **Google** | Phone screen → 3–4 coding (≥1 often in person) → Googleyness & Leadership; system design from L5 | No IDE/autocomplete in classic rounds; deep follow-ups; hiring committee. AI code-comprehension pilot (H2 2026). | DSA 60% (graphs, trees, DP, intervals, heaps), HLD 15% (L5+), behavioral 15%, code reading/debugging 10% |
| **Meta** | Screen (2 problems in ~45 min) → 2 coding (1 may be AI-enabled) → product/system design (E5+) → behavioral | Speed: two mediums per 45 min. AI-enabled round. | DSA 55% at speed, AI-assisted multi-file practice 15%, design 15%, behavioral 15% |
| **Amazon** | OA (coding + work simulation + work style) → 4–5 round loop with a Bar Raiser | Leadership Principles in **every** round; OOD/LLD common for SDE-1/2; AI forbidden in live rounds. | DSA 40%, LLD 20%, behavioral/LPs 30% (2 stories per principle), HLD 10% (SDE-2+) |
| **Microsoft** | Screen → 4–5 rounds: coding, design, behavioral, sometimes "AA" (as appropriate) final | Team-dependent; AI-assisted round reported in 2026. | DSA 50%, LLD/HLD 25%, behavioral 15%, AI-assisted 10% |
| **Atlassian** | Karat screen (redo allowed) → coding → code design → system design → values → manager | "Code design" is a practical build (e.g. popularity tracker, router class); values interview is explicit. | DSA 35%, LLD/code design 25%, HLD 20%, values/behavioral 20% |
| **Uber** | CodeSignal OA (4 problems, 70–90 min) → DSA → LLD → system design → collaboration | Recruiter shapes the loop towards backend/frontend/systems; scale metrics valued. | DSA 45% (fast OA practice), LLD 20%, HLD 20%, behavioral 15% |
| **Stripe** | Screen → coding, **bug squash**, **integration** (HTTP + JSON against an API), system design, manager | Practical, real-code rounds; less LeetCode. | Practical coding 35%, debugging unfamiliar code 20%, API integration 15%, HLD 15%, behavioral 15% |
| **Canva** | AI-assisted coding (mandatory), system design, behavioral | AI expected; open-ended problems. | AI-assisted build 35%, DSA fundamentals 20%, HLD 25%, behavioral 20% |
| **Flipkart** | OA (2 DSA, 90–120 min) → **machine coding** (90 min + review) → LLD/HLD (HLD SDE-2+) → hiring manager | Runnable, extensible in-memory system (e.g. BNPL, food ordering) with a driver program; then extend it live. | Machine coding/LLD 35%, DSA 35%, HLD 15%, behavioral 15% |
| **Swiggy** | Machine coding/LLD (90–120 min, signature round) → DSA → HLD → HM | Runnable code (parking lot, expense sharing style). | Machine coding/LLD 35%, DSA 30%, HLD 20%, behavioral 15% |
| **Razorpay** | HackerRank → machine coding (60–90 min) → HLD → agentic coding (reported) → behavioral | Working code over polish; payments domain. | Machine coding 30%, DSA 25%, HLD 25%, AI-assisted 10%, behavioral 10% |
| **Walmart Global Tech (India)** | DSA (2 mediums) → system design → hiring manager | US-level bar; resume deep-dive. | DSA 50%, HLD 25%, behavioral/resume 25% |
| **Goldman Sachs** | Aptitude/HackerRank → 2 technical → HR | Classic DSA and CS fundamentals; AI forbidden. | DSA 60%, CS fundamentals 20%, behavioral 20% |

Behavioral content already on the site maps onto these: the `companies` course has Amazon, Google, Meta,
Microsoft, Netflix/Atlassian/Stripe/Uber/Apple, Indian product companies and global companies in India.
A company plan should schedule that lesson early and its stories in the final stretch.

## 3. The question bank: where the data can come from

### Why not LeetCode Premium's company tags

LeetCode's terms of service prohibit crawling and scraping and say users must not compete with
LeetCode. The company-tagged lists and their frequency data are LeetCode's paid content.
Copying them, even manually and from a paid account, into a product that sells interview preparation
breaks those terms. The account could be banned, and it is a legal risk for the business. Lists on
GitHub that copy the same tags carry the same problem.

What is fine: use your Premium **personally** as a sanity check while we curate (e.g. "does our
Amazon list look broadly right?"), without copying lists, frequencies or rankings across.

### Sources we can use

| Source | Use | Notes |
|---|---|---|
| Public interview experiences (LeetCode Discuss posts, GeeksforGeeks, Glassdoor, Naukri Code360, Blind, Reddit) | Which problems and *patterns* candidates report, per company and year | Record company, role, year and link for every entry; only factual "asked X" claims, no copying of write-ups. |
| Company engineering blogs and careers pages | Round formats, values, AI policy | Canva, Meta and Google statements; Amazon Leadership Principles. |
| Our own 314 problems | The practice set | Map reported problems onto ours; when we don't have it, link to the public LeetCode problem page (as we do today). |
| Learners (later) | "I was asked…" reports after their interview | Moderated; builds a proprietary, fresh dataset over time. |

### What we publish

- **Pattern weights per company** (e.g. Meta: arrays/strings, trees, graphs, intervals heavy; DP light). These are the most stable and useful signal and are clearly ours.
- **A curated list of 40–80 problems per company**, each tagged with how many public reports mention it and the latest year, shown as "seen in recent public reports". No "frequency" claims.
- **Round-format pages** with the "last checked" date and sources.
- Refresh **every quarter**; anything older than 18 months drops out.

## 4. What to build

### Content and data

```js
// src/data/companies/<id>.js
{
  id: 'meta', name: 'Meta', checked: '2026-10-18',
  sources: [{ title, url, date }],
  levels: ['E3', 'E4', 'E5', 'E6'],
  rounds: [{ type: 'coding' | 'ai-coding' | 'machine-coding' | 'bug-squash' | 'integration' | 'hld' | 'lld' | 'behavioral',
             minutes: 45, aiPolicy: 'forbidden' | 'allowed' | 'expected', notes }],
  mix: { dsa: 55, hld: 15, lld: 0, behavioral: 15, ai: 15 },   // Runway weights
  patterns: { 'graph-traversal': 3, 'two-pointers': 2, ... },   // 1–3 emphasis
  problems: [{ slug, reports: 4, lastSeen: 2026 }],
  behavioral: '/behavioral/companies/meta',
}
```

### Runway

- Setup step 3 gains **"Company"** (replacing the "coming soon" note): picking one sets the mix, the level options and the problem order; the learner can still adjust everything.
- Problems are ordered by the company's pattern weights and its curated list first, then our ladders.
- The final stretch uses that company's round types for mocks (e.g. Flipkart → a machine coding mock; Meta → one AI-assisted mock and one speed round).
- The company's behavioral lesson is scheduled in week 1 and its stories in the last days.

### New practice formats (needed by several companies)

1. **AI-assisted coding mock**: a small multi-file starter project with a bug, a feature to add and a performance issue; the learner works with their own AI (or the built-in Claude interviewer) and is scored on the Meta/Google criteria (understanding, verification, code quality, communication). Reuses the mock timer, rubric and the "Review with ChatGPT / Claude / Gemini" buttons.
2. **Machine coding mock**: a 90-minute build (we already have the LLD case studies as problems) with a requirements brief, an extension request at the 60-minute mark, and a rubric (runs, extensible, patterns, tests).
3. **Code reading / bug squash**: an unfamiliar codebase with failing tests to fix, scored on time to root cause.
4. **API integration** (Stripe-style): call a mock HTTP API, parse JSON, handle errors and pagination. Lower priority.

### Suggested order

1. Data files and pages for **Amazon, Google, Meta, Microsoft, Flipkart** (largest audience), with the Runway company picker. *(about a week of research and curation)*
2. **Machine coding mock** and **AI-assisted coding mock**.
3. Atlassian, Uber, Stripe, Swiggy, Razorpay, Walmart, Goldman Sachs.
4. Learner-submitted interview reports.

---

## Sources

Official or press-confirmed:
- Canva: [Yes, you can use AI in our interviews. In fact, we insist](https://canva.dev/blog/engineering/yes-you-can-use-ai-in-our-interviews); [The Register](https://www.theregister.com/2025/06/11/canva_coding_assistant_job_interviews/)
- Meta: [404 Media: Meta is going to let job candidates use AI during coding tests](https://www.404media.co/meta-is-going-to-let-job-candidates-use-ai-during-coding-tests/); [Business Today](https://www.businesstoday.in/amp/technology/news/story/meta-to-test-job-applicants-with-ai-assisted-coding-interviews-amid-ai-expansion-plans-487200-2025-07-31)
- Google: [Gemini in coding rounds pilot (summary of Business Insider)](https://www.shopifreaks.com/google-pilots-new-software-engineering-interview-process-that-lets-candidates-use-ai-assistant-gemini-during-coding-rounds/); [Exponent: Google AI coding interview](https://www.tryexponent.com/blog/google-ai-coding-interview)
- LeetCode: [Terms of Service](https://leetcode.com/terms)

Reported (prep sites and candidate reports):
- Meta AI round: [PracHub](https://prachub.com/resources/meta-ai-coding-interview), [Copilot Interview](https://copilotinterview.com/blog/meta-ai-enabled-coding-interview), [TechScreen](https://techscreen.app/articles/ai-enabled-coding-interview-guide-2026), [Medium](https://medium.com/@fahimulhaq/meta-just-transformed-their-coding-interviews-with-ai-heres-what-developers-must-know-363b50dceda4)
- Google 2026: [Levelop](https://levelop.dev/blog/google-coding-interviews-in-2026-what-changed-and-what-didnt), [Miami career blog](https://customcareer.miami.edu/blog/2026/05/14/googles-ai-assisted-coding-interview-2026-guide/)
- Amazon: [TechScreen](https://techscreen.app/articles/amazon-technical-interview-process-2026), [Copilot Interview list](https://copilotinterview.com/blog/companies-that-allow-ai-in-interviews), [Final Round AI: GenAI fluency](https://www.finalroundai.com/blog/amazon-genai-fluency-round), [Exponent](https://www.tryexponent.com/guides/amazon-software-development-engineer-interview)
- Microsoft: [PracHub](https://prachub.com/resources/microsoft-software-engineer-interview-guide), [1point3acres](https://www.1point3acres.com/interview/company/Microsoft)
- Atlassian: [TechPrep](https://www.techprep.app/blog/atlassian-interview-process), [Interview Query](https://www.interviewquery.com/interview-guides/atlassian)
- Uber: [TechPrep](https://www.techprep.app/blog/uber-interview-process)
- Stripe: [PracHub](https://prachub.com/interview-experiences/stripe-software-engineer-interview-with-coding-bug-squash-api-integration-and-bq-rounds-cf992a00e3), [NodeFlair](https://webflow.nodeflair.com/blog/stripe-software-engineer-interview-questions-and-process)
- Flipkart: [LeetCode Discuss, Jan 2026](https://leetcode.com/discuss/post/8455829/flipkart-sde-2-interview-experience-jan-o8ngx/), [TechPrep](https://www.techprep.app/blog/flipkart-interview-process)
- Razorpay / Swiggy: [TechPrep Razorpay](https://www.techprep.app/blog/razorpay-interview-process), [Glassdoor Razorpay](https://www.glassdoor.com/Interview/Razorpay-Interview-E1146550-RVW104471826.htm), [TechPrep Swiggy](https://www.techprep.app/companies/swiggy)
- Walmart Global Tech: [ClavePrep](https://claveprep.com/blog/walmart-global-tech-india-interview-preparation-2026)
- AI policies overview: [PracHub guide](https://prachub.com/resources/ai-coding-interview-guide), [DevsUnite](https://devsunite.com/blog/can-you-use-ai-in-a-coding-interview-the-2026-rules)
