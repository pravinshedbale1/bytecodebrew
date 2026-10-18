# Company-specific Runway plans: research (October 2026)

> **Correction, 18 October 2026:** the first version said Amazon does not allow AI. Amazon's own newsroom
> confirms an AI-assisted SDE assessment; Stripe, Coinbase and Atlassian AI-assisted rounds were also added.

Sections 1–4 cover the 13 companies researched first; section 5 extends this to the 50 best-paying
companies in India.

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
| | Amazon **[confirmed, details reported]** | Amazon has rebuilt its SDE technical assessment so candidates "work with an interactive AI assistant on a real coding platform", to reflect how its engineers use Amazon Q, Cline and Kiro **[confirmed, Amazon newsroom]**. Candidates describe one algorithm problem (about 40 minutes) then about 60 minutes fixing bugs in an existing repository with a built-in assistant that finds files and explains code but won't write the fix; hidden tests decide the score, and passing the visible ones isn't enough. Rolled out unevenly in 2026: some SDE-1, new-grad, intern and SDE-2 candidates still get the classic two-problem test **[reported]**. Live loop rounds: AI only if explicitly allowed (2025 guidance). Some loops ask a Leadership Principles question about your AI use, and AWS AI, Alexa and Ads teams a "GenAI fluency" discussion **[reported]**. |
| | Stripe **[reported]** | Since spring 2026 one coding round runs on HackerRank with an AI assistant (Gemini and Claude models reported); interviewers probe how much and why you used it. |
| | Coinbase **[reported, few reports]** | Onsite on an existing service with an AI assistant in the IDE: bug fix, design question, timeout diagnosis from logs, code review; screen sharing required. |
| | Atlassian **[reported]** | A 2026 live interview with AI-enabled work on a code repository (not the online screen). |
| | Microsoft **[reported]** | Default: no AI unless the round allows it. Several 2026 candidate reports (Bellevue, Bengaluru AI Foundry, CoreAI and Copilot-related orgs) mention an AI-assisted coding round next to the DSA and design rounds, with Copilot, Claude or ChatGPT; candidates were told not to paste the whole question into the assistant. |
| | DoorDash, Instacart, Shopify, Figma **[reported]** | Outside our top 50 but part of the same shift: DoorDash "AI Code Craft" onsite in your own IDE, Instacart's CodeSignal assessment with Claude in the editor, Shopify AI pair programming, Figma reported pilot. |
| | Razorpay **[reported, single source]** | A May 2026 report lists an "agentic coding round" after machine coding and HLD. |
| **AI forbidden** | Goldman Sachs; Anthropic by default; Cursor's first round **[reported]** | Classic rounds; covert AI use is treated as cheating. |

What this means for learners: **classic DSA is still in almost every loop**, but candidates for Amazon,
Meta, Google (pilot), Microsoft, Stripe, Coinbase, Atlassian and some Indian product companies now also need to practise:

1. **Reading and debugging an unfamiliar codebase** (Google code comprehension, Stripe bug squash, Meta's AI round).
2. **Directing an AI assistant and checking its output**: splitting the task, prompting, spotting wrong or insecure code, writing tests, explaining trade-offs out loud.
3. **Building something that runs in 90 minutes** (machine coding: Flipkart, Swiggy, Razorpay, Uber LLD).

## 2. Company loops at a glance

Data as reported in 2025–2026 (mostly SDE-1 to SDE-3 / L3–L5). "Plan emphasis" is what a Runway plan for that company should weight.

| Company | Typical loop | Distinctive | Plan emphasis |
|---|---|---|---|
| **Google** | Phone screen → 3–4 coding (≥1 often in person) → Googleyness & Leadership; system design from L5 | No IDE/autocomplete in classic rounds; deep follow-ups; hiring committee. AI code-comprehension pilot (H2 2026). | DSA 60% (graphs, trees, DP, intervals, heaps), HLD 15% (L5+), behavioral 15%, code reading/debugging 10% |
| **Meta** | Screen (2 problems in ~45 min) → 2 coding (1 may be AI-enabled) → product/system design (E5+) → behavioral | Speed: two mediums per 45 min. AI-enabled round. | DSA 55% at speed, AI-assisted multi-file practice 15%, design 15%, behavioral 15% |
| **Amazon** | OA (algorithm problem + AI-assisted repository bug-fixing, or the classic two problems; work simulation; work style) → 4–5 round loop with a Bar Raiser | Leadership Principles in **every** round; OOD/LLD common for SDE-1/2; AI in live rounds only if allowed. | DSA 40%, LLD 20%, behavioral/LPs 30% (2 stories per principle), HLD 10% (SDE-2+) |
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

## 5. The top 50 best-paying companies in India

### How the list was built

- **Pay data:** Levels.fyi's India software-engineer leaderboards (median total yearly compensation:
  base + stock + bonus, submissions from the last two years, checked 18 October 2026), at entry,
  senior and staff level and across all levels. Figures are in USD as Levels.fyi shows them.
- **Kept:** companies with real engineering hiring in India (Bengaluru, Hyderabad, Pune, Gurugram,
  Noida, Mumbai, Chennai). Remote-only or tiny employers that appear on the all-levels board (p0,
  Kredivo, Mrsool, Toptal and similar) are left out because learners can't target them.
- **Added:** high payers the boards under-sample: quant/HFT firms and the top Indian product companies
  (few Levels.fyi submissions, but known top-of-market pay).
- Crowdsourced pay is directional, not exact, and differs a lot by level.

### Six interview styles

The 50 companies map onto six styles. A company plan starts from its style's template, and company
specifics are layered on top.

| Style | What the loop tests | Runway mix (DSA / HLD / LLD / behavioral) | Mocks to schedule |
|---|---|---|---|
| **A. Big Tech classic** | 2–4 DSA rounds (mediums to hards), system design from mid-level, a behavioral/values round | 55 / 20 / 5 / 20 | DSA timed, HLD, behavioral |
| **B. Practical code** | Build or extend a small class or service, debug unfamiliar code, call APIs; LLD-flavoured; less LeetCode | 30 / 20 / 35 / 15 | Machine coding, bug squash, AI-assisted |
| **C. Systems & infra** | DSA plus OS and concurrency (mutex, semaphore, threads), language internals, distributed storage and data systems | 45 / 25 / 15 / 15 (+ CS fundamentals) | DSA, HLD focused on storage and streaming |
| **D. Indian product (machine coding)** | 90–120 min machine coding of a runnable, extensible system, then review → DSA → HLD (SDE-2+) → hiring manager | 35 / 15 / 35 / 15 | Machine coding ×2, DSA, HLD |
| **E. Quant / HFT** | Hard online test (DSA + probability + CS MCQs), then C++/OS/networking depth, low-latency design, puzzles | 60 / 10 / 10 / 5 (+ CS fundamentals and probability 15) | Hard DSA timed |
| **F. Banks and enterprise fintech** | HackerRank test, 2–3 technical rounds (DSA mediums, SQL, OS, OOP, projects), HR; AI forbidden | 50 / 15 / 15 / 20 | DSA, project deep-dive |

**AI-assisted rounds** are a modifier on top of any style. Confirmed for Amazon (online assessment),
Meta and Google (pilot); reported for Microsoft (some orgs), Stripe, Coinbase, Atlassian, Rippling (AI help
allowed in the practical round) and Razorpay (agentic round). Plans for these add one AI-assisted mock and the "working with AI"
practice.

### The list

Pay columns are Levels.fyi India medians where the company appears on that board (— = not on it).
"Research" says how much of the interview format is backed by sources: **sourced** = 2025–26 reports
found; **style** = assigned from the company type, to verify while curating.

| # | Company | Style | Senior | Staff | Entry | Interview notes | Research |
|---|---|---|---|---|---|---|---|
| 1 | Broadcom (incl. VMware) | C | $216k | $213k | $74k | Systems-heavy; C/C++, OS, virtualisation and storage | style |
| 2 | LinkedIn | A | $197k | $268k | $67k | Microsoft-family loop: DSA, system design, "host manager"/behavioral | style |
| 3 | Databricks | C + B | $183k | — | $75k | Coding, design of data lakes/query engines/streaming, debugging; 45–90 min rounds | sourced |
| 4 | Stripe | B | $167k | — | $63k | Coding (one round AI-assisted on HackerRank since spring 2026), bug squash, API integration, system design, manager | sourced |
| 5 | Rubrik | C | $167k | — | $69k | DSA plus concurrency (mutex/semaphore) | sourced |
| 6 | Rippling | B | $129k | $231k | $48k | Practical coding that keeps getting extended (AI help allowed); LLD on grouping/aggregation; graphs | sourced |
| 7 | Uber | A | $135k | $230k | — | CodeSignal OA (4 problems, 70–90 min), DSA, LLD, HLD, collaboration | sourced |
| 8 | Atlassian | B | $115k | $210k | $44k | Karat screen, coding, code design, system design, values, manager; an AI-enabled repository interview reported in 2026 | sourced |
| 9 | Coinbase | B | $118k | $196k | $45k | Onsite on an existing service with an AI assistant (bug fix, design, log diagnosis, code review), system design | sourced (thin) |
| 10 | Google | A | $141k | $157k | — | No-IDE coding, ≥1 in-person round, G&L with design discussion; Gemini code-comprehension pilot | sourced |
| 11 | Amazon | A | $135k | — | — | OA with an AI-assisted repository task (or classic two problems) + work simulation; LPs in every round; Bar Raiser; LLD for SDE-1/2 | sourced |
| 12 | Meta | A | $128k | — | — | Speed (2 mediums/45 min); one AI-enabled coding round; product/system design | sourced |
| 13 | Apple | A | $115k | $179k | — | Team-run loops; domain depth; coding plus team-specific design | style |
| 14 | Airbnb | A + B | $135k | — | — | Clean, working code; core-values round | style |
| 15 | DocuSign | A | $158k | — | $54k | DSA, system design, behavioral | style |
| 16 | MongoDB | C | $126k | — | — | Distributed databases, storage engines, DSA | style |
| 17 | Confluent | C | $116k | — | $49k | Kafka/streaming internals, distributed systems | style |
| 18 | Salesforce | A | — | $172k | — | DSA, system design, values (Trust) | style |
| 19 | Microsoft | A | — | $150k | — | 4–5 rounds, coding + design + behavioral; AI-assisted round on some teams | sourced |
| 20 | Nutanix | C | — | $157k | — | Systems and storage depth | style |
| 21 | Expedia Group | A | — | $152k | — | DSA, system design, behavioral | style |
| 22 | JPMorgan Chase | F | — | $149k | — | HackerRank, DSA mediums, SQL, OOP, behavioral | style |
| 23 | Nvidia | C | — | $136k | — | C/C++, systems, GPU/driver or platform depth by team | style |
| 24 | Qualcomm | C | — | $128k | — | C/C++, OS, embedded and systems depth | style |
| 25 | Intuit | A | — | $126k | — | Sometimes a take-home/craft demo; DSA, design | style |
| 26 | Walmart Global Tech | A | — | $125k | — | 2 mediums, system design, hiring manager; US-level bar | sourced |
| 27 | Cohesity | C | — | — | $44k | Storage and distributed systems | style |
| 28 | Booking.com | A | — | — | — | Practical coding, system design, behavioral | style |
| 29 | Adobe | A | — | — | — | DSA, CS fundamentals, design | style |
| 30 | Oracle (OCI) | A + C | — | — | — | OA, DSA, project deep-dive, behavioral; OS/SQL/networking for freshers | sourced |
| 31 | CrowdStrike | C | — | — | — | Security and systems depth | style |
| 32 | Postman | B | — | — | — | Product engineering; practical coding | style |
| 33 | Roku | C | — | — | $82k | Embedded/streaming systems | style |
| 34 | Visa | F | — | — | — | DSA, system design, behavioral | style |
| 35 | Goldman Sachs | F | — | — | — | Aptitude/HackerRank, 2 technical, HR; AI forbidden | sourced |
| 36 | Tower Research Capital | E | — | — | — | HackerRank 90–135 min (DSA + OS/networks/DBMS MCQs), phone screens, 4–6 round "super day" | sourced |
| 37 | Graviton Research Capital | E | — | — | — | Coding test, quant/software interviews (campus-heavy) | style |
| 38 | Quadeye | E | — | — | — | Coding test, shortlist, 3 interviews | sourced |
| 39 | D. E. Shaw | E | — | — | — | Online test (3 mediums + maths/probability + CS MCQs), technical rounds (SQL, DBMS, OS, design), HR | sourced |
| 40 | Millennium | E | — | — | $73k | Hard DSA, C++/Python depth | style |
| 41 | Flipkart | D | — | — | — | OA (2 DSA), machine coding + review, LLD/HLD, hiring manager | sourced |
| 42 | PhonePe | D | — | — | — | Machine coding/LLD first (90 min or 24 h take-home + review), DSA, HLD, hiring manager | sourced |
| 43 | Razorpay | D | — | — | — | HackerRank, machine coding, HLD, agentic coding (reported), behavioral | sourced |
| 44 | Swiggy | D | — | — | — | Machine coding/LLD 90–120 min, DSA, HLD, HM | sourced |
| 45 | Zomato (Eternal) | D | — | — | — | Machine coding/LLD, DSA, HLD | style |
| 46 | Meesho | D | — | — | — | SDE-2: DSA + 120-min machine coding; SDE-3: design-first, little DSA | sourced |
| 47 | CRED | D | — | — | — | Machine coding, design, culture | style |
| 48 | Groww | D | — | — | — | Machine coding (90 min), LLD, DSA | style (2021 data) |
| 49 | Zepto | D | — | — | — | DSA, LLD with schema design, hiring manager | sourced |
| 50 | JioHotstar | D + C | $113k | — | — | Scale and streaming design; DSA; LLD | style |

Next in line if any drop out: Bloomberg, Squarepoint Capital, Glean, Sprinklr, Media.net, ServiceNow,
Zerodha, Cisco, Morgan Stanley, Twilio.

### What this changes in the build

1. **Style templates first.** Build the six templates (mix, mock types, problem-pattern weights,
   behavioral content). With them, all 50 companies have a sensible plan on day one.
2. **Company overrides** for the well-sourced ones: round list, AI policy, specific mocks, curated
   problems, behavioral lesson. Start with the 21 marked **sourced**.
3. **New content needed by style:** machine coding mocks (style D, 10 companies), practical/bug-squash
   (B, 6), CS fundamentals and concurrency (C, E, F: 20 companies; the site has no OS, networking,
   DBMS or concurrency track yet), probability/puzzles (E, 5).
4. **Company picker** in Runway shows the style and the "last checked" date; companies marked style-only
   say "based on companies like this one" until curated.

---

## Sources

Official or press-confirmed:
- Amazon: [How 3 AI innovations are creating a better experience for candidates in Amazon's hiring process](https://www.aboutamazon.com/news/workplace/artificial-intelligence-resume-jobs-hiring-amazon)
- Canva: [Yes, you can use AI in our interviews. In fact, we insist](https://canva.dev/blog/engineering/yes-you-can-use-ai-in-our-interviews); [The Register](https://www.theregister.com/2025/06/11/canva_coding_assistant_job_interviews/)
- Meta: [404 Media: Meta is going to let job candidates use AI during coding tests](https://www.404media.co/meta-is-going-to-let-job-candidates-use-ai-during-coding-tests/); [Business Today](https://www.businesstoday.in/amp/technology/news/story/meta-to-test-job-applicants-with-ai-assisted-coding-interviews-amid-ai-expansion-plans-487200-2025-07-31)
- Google: [Gemini in coding rounds pilot (summary of Business Insider)](https://www.shopifreaks.com/google-pilots-new-software-engineering-interview-process-that-lets-candidates-use-ai-assistant-gemini-during-coding-rounds/); [Exponent: Google AI coding interview](https://www.tryexponent.com/blog/google-ai-coding-interview)
- LeetCode: [Terms of Service](https://leetcode.com/terms)

Pay data (Levels.fyi, India, checked 18 October 2026):
- [Leaderboard: senior](https://www.levels.fyi/leaderboard/Software-Engineer/Senior-Engineer/country/India/), [staff](https://www.levels.fyi/leaderboard/Software-Engineer/Staff-Engineer/country/India/), [entry](https://www.levels.fyi/leaderboard/Software-Engineer/Entry-Level-Engineer/country/India/), [all levels](https://www.levels.fyi/leaderboard/Software-Engineer/All-Levels/country/India/); [India software engineer pay](https://www.levels.fyi/t/software-engineer/locations/india)

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
- Quant: [TechPrep: Tower Research](https://www.techprep.app/blog/tower-research-interview-process), [IIT Kanpur placement notes](https://spo.iitk.ac.in/insights/2024-intern-talin-gupta-tower-research-capital), [LeetCode Discuss: D. E. Shaw MTS Jan 2025](https://leetcode.com/discuss/post/6754544/de-shaw-interview-experience-member-tech-0oa7/)
- Infra: [Codemia: Databricks](https://codemia.io/guides/databricks-software-engineer), [Taro: Rubrik Bangalore 2025](https://www.jointaro.com/interviews/companies/rubrik/work-experiences/software-development-engineer-sde-bangalore-rural-january-16-2025-5-3c642bae/), [LeetCode Discuss: Oracle OCI 2025](https://leetcode.com/discuss/interview-experience/6651621)
- Rippling: [Glassdoor](https://static.glassdoor.co.in/Interview/Rippling-Interview-E2521509-RVW103921306.htm), [Roundz](https://roundz.substack.com/p/interview-experience-154-rippling-sde)
- Indian product: [LeetCode Discuss: PhonePe SDE-2](https://leetcode.com/discuss/post/8547106/phonepe-sde-2-backend-interview-experien-vcqt/), [TechPrep: PhonePe](https://www.techprep.app/blog/phonepe-interview-process), [Glassdoor: Meesho SDE-3](https://static.glassdoor.co.in/Interview/Meesho-Software-Development-Engineer-SDE-3-Interview-Questions-EI_IE1503776.0,6_KO7,42.htm), [GeeksforGeeks: Zepto SDE-2](https://geeksforgeeks.org/zepto-interview-experience-for-sde-2-fte)
- AI-assisted rounds across companies (2026): [PracHub: AI-assisted coding assessments, Aug 2026](https://prachub.com/resources/ai-assisted-coding-assessments-in-2027-companies-platforms-rules-and-scoring), [PracHub: Amazon AI-assisted OA, Aug 2026](https://prachub.com/resources/amazon-ai-assisted-coding-oa-guide-2026-repository-bugs-ai-prompts-and-hidden-tests), [DEV: Eight companies, eight different AI coding interviews](https://dev.to/max_nyriev/eight-companies-eight-different-ai-coding-interviews-k60), [Hello Interview: Amazon L4](https://www.hellointerview.com/guides/amazon/l4), [Coditioning: Amazon](https://www.coditioning.com/blog/207/amazon-swe-ai-assisted-coding), [PracHub: Microsoft AI-assisted](https://prachub.com/resources/microsoft-ai-assisted-coding-interview-guide-2026-tools-rules-and-scoring), [1point3acres: Stripe AI-assisted round](https://www.1point3acres.com/interview/problems/company/stripe/ai-assisted-coding-round)
- AI policies overview: [PracHub guide](https://prachub.com/resources/ai-coding-interview-guide), [DevsUnite](https://devsunite.com/blog/can-you-use-ai-in-a-coding-interview-the-2026-rules)
