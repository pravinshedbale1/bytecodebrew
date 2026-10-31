/**
 * Behavioral track — stories, structure and company focus areas.
 *
 * Ordering matters: lessons are listed in the order a learner should study them.
 * A lesson becomes readable as soon as src/content/behavioral/<courseId>/<lessonId>.mdx exists.
 */

const L = (id, title, summary, minutes, level) => ({ id, title, summary, minutes, level });

const foundations = {
  id: 'foundations',
  title: 'Behavioral Interviews Decoded',
  shortTitle: 'Foundations',
  description:
    'What behavioral interviewers actually score, how to structure an answer, and how to prepare a small set of stories that covers almost every question.',
  outcomes: [
    'Explain what a behavioral interviewer writes down and why it decides offers',
    'Answer any "tell me about a time" question in a clear STAR structure, in about two minutes',
    'Build a story bank of 8–10 stories mapped to the themes companies test',
    'Give a strong pitch for "tell me about yourself" and a deep dive on your best project',
    'Ask questions at the end that leave a good impression',
  ],
  modules: [
    {
      id: 'how-it-works',
      title: 'How Behavioral Interviews Work',
      description: 'The scoring, the structure and the preparation method.',
      lessons: [
        L('behavioral-decides-offers', 'Why Behavioral Rounds Decide Offers', 'What interviewers score, how a story becomes a hire or no-hire, and the myths that make people under-prepare.', 12, 'Beginner'),
        L('star-method', 'The STAR Method, Done Right', 'Situation, Task, Action, Result — with the timing, the "I" focus and the numbers that make it work.', 14, 'Beginner'),
        L('story-bank', 'Build Your Story Bank', 'Eight to ten stories that answer almost every question, mapped to themes and company values.', 16, 'Beginner'),
      ],
    },
    {
      id: 'essentials',
      title: 'The Questions Everyone Gets',
      description: 'Openers, deep dives and closers that appear in nearly every loop.',
      lessons: [
        L('tell-me-about-yourself', 'Tell Me About Yourself', 'A 90-second pitch with a clear arc, sprinkled with evidence, that ends on why you are here.', 10, 'Beginner'),
        L('project-deep-dive', 'The Project Deep Dive', 'Pick the right project and survive twenty minutes of "why" questions about it.', 14, 'Intermediate'),
        L('motivation-questions', 'Why This Company, Why Leave', 'Motivation questions answered honestly and specifically, without badmouthing anyone.', 10, 'Beginner'),
        L('questions-to-ask', 'Questions to Ask Them', 'Genuine, insightful and passion questions — and the ones to avoid.', 8, 'Beginner'),
      ],
    },
  ],
};

const questionBank = {
  id: 'question-bank',
  title: 'Question Bank by Theme',
  shortTitle: 'Question Bank',
  description:
    'The eight themes behind almost every behavioral question. For each: what they are really asking, a weak and a strong answer, the follow-ups to expect and the variants you will hear.',
  outcomes: [
    'Recognise which theme a question belongs to, whatever its wording',
    'Know the signal each theme is testing and what a strong answer shows',
    'Prepare for the follow-up questions that expose rehearsed answers',
  ],
  modules: [
    {
      id: 'people',
      title: 'Working With People',
      description: 'Conflict, influence, collaboration and feedback.',
      lessons: [
        L('conflict-and-disagreement', 'Conflict & Disagreement', 'Disagreeing with a peer or manager, and resolving it with data and respect.', 14, 'Intermediate'),
        L('leadership-and-influence', 'Leadership & Influence', 'Leading without authority: aligning people, driving a decision, raising the bar.', 14, 'Intermediate'),
        L('collaboration-and-mentoring', 'Collaboration & Mentoring', 'Difficult teammates, cross-team work and helping others grow.', 12, 'Intermediate'),
        L('feedback-and-growth', 'Feedback & Growth', 'Receiving hard feedback, giving it, and learning something new fast.', 12, 'Intermediate'),
      ],
    },
    {
      id: 'execution',
      title: 'Getting Things Done',
      description: 'Ownership, failure, pressure and results.',
      lessons: [
        L('ownership-and-ambiguity', 'Ownership & Ambiguity', 'Going beyond your role, and making progress when nobody tells you what to do.', 12, 'Intermediate'),
        L('failure-and-mistakes', 'Failure, Mistakes & Weaknesses', 'Owning a real failure, what changed afterwards, and an honest weakness.', 14, 'Intermediate'),
        L('deadlines-and-tradeoffs', 'Deadlines & Trade-offs', 'Tight deadlines, cutting scope, prioritising, and pushing back when needed.', 12, 'Intermediate'),
        L('impact-and-customers', 'Impact, Data & Customers', 'Your proudest work, data-driven decisions and putting the customer first.', 12, 'Intermediate'),
      ],
    },
    {
      id: 'practice',
      title: 'Practise',
      description: 'The full question list, a timed drill and sample answers from other roles.',
      lessons: [
        L('all-questions', '150+ Questions by Theme', 'Every question in the bank, grouped by theme, plus integrity, technical, hypothetical and manager questions.', 15, 'Beginner'),
        L('behavioral-drill', 'Answer Drill', 'A random question, a two-minute timer and a self-check — practise out loud and track your scores.', 10, 'Beginner'),
        L('answers-across-roles', 'Sample Answers for Other Roles', 'Strong answers from frontend, mobile, data and SRE engineers, so you can see the pattern in your own field.', 16, 'Intermediate'),
      ],
    },
  ],
};

const companies = {
  id: 'companies',
  title: 'Company Guides',
  shortTitle: 'Companies',
  description:
    'What each company says it looks for, how its behavioral rounds tend to run, and how to aim your stories at it. Sourced from the companies\' own pages, with the date checked.',
  outcomes: [
    'Map your stories to Amazon\'s Leadership Principles and survive the follow-ups',
    'Show Google\'s leadership and collaboration signals in behavioral and hypothetical questions',
    'Adapt the same story bank to Meta, Microsoft, Netflix, Atlassian, Stripe, Uber and Apple',
    'Prepare for Indian product companies and global firms hiring in India',
  ],
  modules: [
    {
      id: 'big-tech',
      title: 'Big Tech',
      description: 'The companies with the most structured behavioral loops.',
      lessons: [
        L('amazon', 'Amazon: Leadership Principles', 'All 16 principles, the questions behind them, the Bar Raiser and how deep the follow-ups go.', 22, 'Intermediate'),
        L('google', 'Google: Leadership & Googleyness', 'What Google says it hires for, behavioral and hypothetical questions, and emergent leadership.', 14, 'Intermediate'),
        L('meta', 'Meta: The Behavioral Round', 'Meta\'s own advice, its six values, and the scope interviewers use to judge your level.', 14, 'Intermediate'),
        L('microsoft', 'Microsoft: Growth Mindset', 'Growth mindset, customer obsession, inclusion and One Microsoft — and how teams differ.', 12, 'Intermediate'),
      ],
    },
    {
      id: 'more',
      title: 'More Companies',
      description: 'Values-driven companies with distinctive cultures.',
      lessons: [
        L('more-companies', 'Netflix, Atlassian, Stripe, Uber & Apple', 'Each company\'s stated values, what they mean in an interview, and which stories to lead with.', 18, 'Intermediate'),
      ],
    },
    {
      id: 'india',
      title: 'India',
      description: 'Indian product companies, and the global firms with large engineering centres in India.',
      lessons: [
        L('indian-product-companies', 'Flipkart, Swiggy, Razorpay, PhonePe & Zomato', 'Published values, what their interviews probe, and the stories to lead with.', 18, 'Intermediate'),
        L('global-companies-in-india', 'Goldman Sachs, JPMorgan, Adobe & Salesforce', 'Values-driven banks and product MNCs: integrity, clients and the stories they look for.', 14, 'Intermediate'),
      ],
    },
  ],
};

const playbook = {
  id: 'playbook',
  title: 'Behavioral Playbook',
  shortTitle: 'Playbook',
  description: 'Calibrate to your level, avoid the red flags, handle the offer, and prepare in a week.',
  outcomes: [
    'Pitch your stories at the scope expected for your level',
    'Avoid the habits that sink otherwise good answers',
    'Evaluate and negotiate an offer',
    'Follow a one-week preparation plan',
  ],
  modules: [
    {
      id: 'playbook',
      title: 'Behavioral Playbook',
      description: 'From preparation to the offer.',
      lessons: [
        L('resume-and-applications', 'Resume & Getting the Interview', 'A resume that survives a seven-second skim, bullets that show impact, and the channels that get recruiters to call.', 14, 'Beginner'),
        L('hiring-process-and-levels', 'Interview Loops, Levels & Hiring Decisions', 'How loops are structured, how decisions and levels are made, and what to do when you\'re down-levelled.', 14, 'Beginner'),
        L('signals-by-level', 'Signals by Level', 'What changes from junior to senior to staff to manager — scope, ambiguity and influence.', 12, 'Intermediate'),
        L('mock-behavioral-interviews', 'Mock Interviews, Annotated', 'Two full behavioral rounds — mid-level and senior — with the interviewer\'s follow-ups, notes and scores.', 22, 'Intermediate'),
        L('manager-interviews', 'Engineering Manager Interviews', 'Hiring, performance, team health and delivery — with sample answers for each.', 18, 'Advanced'),
        L('red-flags', 'Red Flags & How to Avoid Them', 'Blame, "we", rambling, fake weaknesses and the other habits that turn a hire into a no-hire.', 10, 'Beginner'),
        L('video-and-phone-interviews', 'Video & Phone Interviews', 'Set-up, presence and notes for remote rounds, and what changes on a phone screen.', 8, 'Beginner'),
        L('offers-and-negotiation', 'Offers & Negotiation', 'Comparing offers beyond salary, and negotiating without fear.', 12, 'Beginner'),
        L('notice-periods-and-counteroffers', 'Notice Periods, Counter-offers & Resigning', 'Long notice periods, buy-outs, counter-offers and leaving well — common in India.', 10, 'Beginner'),
        L('behavioral-cheat-sheet', 'Cheat Sheet & One-Week Plan', 'A day-by-day plan, a question-to-story map and a checklist for the day.', 10, 'Beginner'),
      ],
    },
  ],
};

export const behavioral = {
  id: 'behavioral',
  title: 'Behavioral',
  icon: 'messages',
  description:
    'Stories, structure and company focus areas: turn your experience into answers that interviewers can score.',
  courses: [foundations, questionBank, companies, playbook],
};
