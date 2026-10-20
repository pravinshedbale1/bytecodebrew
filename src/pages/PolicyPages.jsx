import { Link } from 'react-router';
import { Mail, Clock, Globe } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { CONTACT_EMAIL } from '../config/access';
import page from './Page.module.css';
import styles from './PolicyPages.module.css';

/**
 * Contact and policy pages (also what the payment gateway's website review looks for). Keep the business details in
 * BUSINESS so every page says the same thing.
 */
export const BUSINESS = {
  name: 'ByteCodeBrew Solutions',
  kind: 'a sole proprietorship based in India',
  site: 'https://bytecodebrew.com',
  email: CONTACT_EMAIL,
  updated: '18 October 2026',
  refundDays: 7,
};

const Mailto = () => <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>;

function Policy({ eyebrow = 'Policies', title, lead, children }) {
  return (
    <PageLayout contentWidth="780px">
      <header className={page.header}>
        <p className={page.eyebrow}>{eyebrow}</p>
        <h1 className={page.title}>{title}</h1>
        {lead && <p className={page.lead}>{lead}</p>}
        <p className={styles.updated}>Last updated: {BUSINESS.updated}</p>
      </header>
      <article className={styles.body}>{children}</article>
    </PageLayout>
  );
}

export function ContactPage() {
  return (
    <Policy eyebrow="Support" title="Contact us" lead={`${BUSINESS.name} runs ByteCodeBrew. Questions about the content, your account, Premium or a payment: write to us and we'll help.`}>
      <div className={styles.cards}>
        <div className={styles.card}>
          <Mail size={18} aria-hidden="true" />
          <p className={styles.cardTitle}>Email</p>
          <p><Mailto /></p>
        </div>
        <div className={styles.card}>
          <Clock size={18} aria-hidden="true" />
          <p className={styles.cardTitle}>Response time</p>
          <p>Within 2 working days (Monday to Saturday)</p>
        </div>
        <div className={styles.card}>
          <Globe size={18} aria-hidden="true" />
          <p className={styles.cardTitle}>Website</p>
          <p><a href={BUSINESS.site}>bytecodebrew.com</a></p>
        </div>
      </div>
      <h2>Business details</h2>
      <ul>
        <li><strong>Business name:</strong> {BUSINESS.name}</li>
        <li><strong>Type:</strong> Sole proprietorship, India</li>
        <li><strong>What we offer:</strong> online interview-preparation courses and practice tools, with an optional paid Premium plan (see <Link to="/premium">plans and prices</Link>)</li>
        <li><strong>Email:</strong> <Mailto /></li>
      </ul>
      <h2>For a payment question</h2>
      <p>
        Please include the email address of your Google account and the order number (it starts with <code>bcb_</code> and is
        shown on the confirmation screen), or the payment ID from Razorpay's email receipt (it starts with <code>pay_</code>). That lets us find the payment quickly.
      </p>
    </Policy>
  );
}

export function TermsPage() {
  return (
    <Policy title="Terms & Conditions" lead={`These terms apply to your use of ${BUSINESS.site.replace('https://', '')} ("ByteCodeBrew", "the site"), run by ${BUSINESS.name}, ${BUSINESS.kind} ("we", "us"). By using the site you agree to them.`}>
      <h2>1. The service</h2>
      <p>
        ByteCodeBrew is an online study centre for software engineering interviews: lessons on system design, data structures and
        algorithms and behavioral interviews, practice problems with an in-browser code runner, quizzes, mock interviews and progress
        tracking. Most of it is free. Some content and features are part of the paid Premium plan, as listed on the <Link to="/premium">Premium page</Link>.
      </p>
      <h2>2. Accounts</h2>
      <p>
        You sign in with a Google account. You are responsible for activity on your account. Premium is tied to the email address of
        the account you used to buy it and is for your personal use only; please don't share your account or resell access.
      </p>
      <h2>3. Premium plans and payments</h2>
      <ul>
        <li>Prices are shown in Indian rupees (INR) and include applicable taxes.</li>
        <li>Each plan is a <strong>one-time payment</strong> for the period shown (for example 3 months or 1 year). Plans do not renew automatically and you are never charged again unless you choose to buy again.</li>
        <li>Payments are processed by Razorpay Software Pvt. Ltd. We do not see or store your card, UPI or bank details.</li>
        <li>Premium is activated automatically once the payment succeeds. Buying again while Premium is active extends it from the current end date.</li>
        <li>We may change prices or the plans on sale; changes never affect a period you have already paid for.</li>
        <li>Refunds are covered by our <Link to="/refund-policy">Refund & Cancellation Policy</Link>.</li>
      </ul>
      <h2>4. Acceptable use</h2>
      <p>
        Don't copy, scrape, republish or sell the site's content; attempt to bypass Premium restrictions or access other people's data;
        disrupt the site or its services; or use the code runner for anything other than solving the practice problems.
        We may suspend accounts that break these rules. If we suspend a paid account for this reason, no refund is due.
      </p>
      <h2>5. Content and intellectual property</h2>
      <p>
        The lessons, diagrams, simulations, problem write-ups and the site's code belong to {BUSINESS.name} and are protected by copyright.
        Your notes, solutions and progress belong to you. Third-party names (for example LeetCode or company names in case studies) belong to their owners and are used only for reference.
      </p>
      <h2>6. Third-party services</h2>
      <p>
        Some features use services we don't control: Google (sign-in and data storage), Razorpay (payments), a code-execution service for
        running your solutions, LeetCode (if you choose to sync your public profile) and AI assistants such as ChatGPT, Claude or Gemini if you choose to send them your mock interview. Their own terms apply when you use them.
      </p>
      <h2>7. No guarantee of outcome</h2>
      <p>
        We work hard to keep the content accurate and up to date, but it is study material, provided "as is". We don't guarantee that it is
        error-free or that using it will get you a job or an offer. The site may occasionally be unavailable for maintenance.
      </p>
      <h2>8. Limitation of liability</h2>
      <p>
        To the extent allowed by law, our total liability for any claim about the site is limited to the amount you paid us in the 12 months before the claim.
      </p>
      <h2>9. Changes and contact</h2>
      <p>
        We may update these terms; the date at the top shows the latest version, and continuing to use the site means you accept it.
        These terms are governed by the laws of India. Questions: <Mailto />.
      </p>
    </Policy>
  );
}

export function PrivacyPage() {
  return (
    <Policy title="Privacy Policy" lead={`What ${BUSINESS.name} collects when you use ByteCodeBrew, why, and how to delete it. In short: only what the site needs to work, never sold, and you can erase it yourself.`}>
      <h2>What we collect</h2>
      <ul>
        <li><strong>Your Google account basics</strong> when you sign in: name, email address and profile picture. Used to show who is signed in, sync your progress and attach Premium to your account.</li>
        <li><strong>Your study data</strong>: lessons completed, quiz answers, solved problems and saved code, highlights and notes, review cards, mock interviews and similar. Stored in your browser and, when you are signed in, in your account (Google Firebase) so it syncs across devices.</li>
        <li><strong>Payment records</strong> when you buy Premium: your email, the plan, amount, order number, status and dates. We use them to activate Premium and handle support.</li>
        <li><strong>Phone number</strong> entered in the payment window. It goes to Razorpay, which uses it to process the payment and send your receipt; we don't receive or keep it.</li>
      </ul>
      <p>We do not use advertising or analytics trackers, and we never sell or rent your data.</p>
      <h2>Who at ByteCodeBrew can see your data</h2>
      <p>
        The site administrator can view your study data read-only, to help when you ask for support and to see, in aggregate,
        which lessons and features are used so we can improve them. The administrator can't change your data, and never sees
        your Claude API key or any payment card or bank details.
      </p>
      <h2>What stays only in your browser</h2>
      <p>
        Settings such as the theme, and a Claude API key if you add one for the AI interviewer, are kept only in your browser's local storage and are never sent to our servers.
      </p>
      <h2>Who else processes it</h2>
      <ul>
        <li><strong>Google Firebase</strong>: sign-in and storage of your account data.</li>
        <li><strong>Razorpay</strong>: payment processing. Card, UPI and bank details go directly to Razorpay; we never see them.</li>
        <li><strong>Cloudflare</strong>: hosts the small servers that create payment orders and sync LeetCode profiles.</li>
        <li><strong>A code-execution service</strong>: the code you choose to run is sent to it to compile and run, without your name or email.</li>
        <li><strong>LeetCode</strong>: only if you enter a LeetCode username to sync your public profile.</li>
        <li><strong>Anthropic, OpenAI or Google AI</strong>: only if you use the AI interviewer with your own key, or choose to send a mock interview to ChatGPT, Claude or Gemini for review. That happens in your own account with them.</li>
      </ul>
      <h2>Your choices</h2>
      <ul>
        <li><strong>Delete your data</strong>: the "Delete" button under "Your data" on the <Link to="/dashboard">Dashboard</Link> removes your study data from this browser and from your account. Payment records are kept as required for accounting and tax purposes.</li>
        <li><strong>Access or correction</strong>: email <Mailto /> and we'll help.</li>
        <li><strong>Sign out</strong> at any time; the site still works without an account, with progress kept only in your browser.</li>
      </ul>
      <h2>Security and retention</h2>
      <p>
        Data is sent over HTTPS, and database rules let each account read only its own data. Study data is kept until you delete it;
        payment records are kept for as long as the law requires.
      </p>
      <h2>Contact</h2>
      <p>Privacy questions or requests: <Mailto />.</p>
    </Policy>
  );
}

export function RefundPage() {
  return (
    <Policy title="Refund & Cancellation Policy" lead="Premium is a one-time payment for a fixed period. Here is when you can get your money back and how.">
      <h2>No subscriptions, nothing to cancel</h2>
      <p>
        Plans do not renew automatically, so there is no subscription to cancel and you will never be charged again unless you buy again.
        When the period ends, Premium content simply locks; your progress, notes and solved problems are kept.
      </p>
      <h2>Refunds</h2>
      <ul>
        <li><strong>Within {BUSINESS.refundDays} days of purchase</strong>: if Premium isn't right for you, email us within {BUSINESS.refundDays} days of the payment and we will refund the full amount. Premium is removed from the account when the refund is issued.</li>
        <li><strong>Charged but Premium not activated</strong>: if the payment succeeded but Premium didn't appear on your account, email us. We'll either activate it right away or refund you in full, whichever you prefer.</li>
        <li><strong>Charged twice</strong> for the same order, or a payment that failed but was debited: the extra or failed amount is refunded in full. Failed payments are usually reversed automatically by your bank within 5–7 working days.</li>
        <li>After {BUSINESS.refundDays} days, payments are not refundable, except where required by law. No refund is due for accounts suspended for breaking the <Link to="/terms">Terms & Conditions</Link>.</li>
      </ul>
      <h2>How to ask for a refund</h2>
      <p>
        Email <Mailto /> from (or mentioning) the Google account you used to buy, with the order number (it starts with <code>bcb_</code>) or Razorpay's payment ID (it starts with <code>pay_</code>).
        We reply within 2 working days. Approved refunds are sent to the original payment method through Razorpay and usually reach you
        within <strong>5–7 working days</strong>, depending on your bank.
      </p>
    </Policy>
  );
}

export function DeliveryPage() {
  return (
    <Policy title="Delivery Policy" lead="ByteCodeBrew Premium is a digital service. Nothing is shipped.">
      <h2>How Premium is delivered</h2>
      <ul>
        <li>Premium is delivered <strong>online, instantly</strong>: it is activated on your ByteCodeBrew account as soon as the payment succeeds, normally within a minute.</li>
        <li>It is tied to the Google account you were signed in with when you paid, and works on every device where you sign in with that account.</li>
        <li>Access lasts for the period of the plan you bought, starting from the payment date (or from the end of your current Premium, if you extend early).</li>
        <li>No physical goods are shipped, so there are no shipping charges or delivery addresses.</li>
      </ul>
      <h2>If Premium doesn't appear</h2>
      <p>
        Reload the page and make sure you are signed in with the same Google account you paid with. If it still isn't active a few minutes after
        a successful payment, email <Mailto /> with your order number and we'll activate it or refund you, as described in the <Link to="/refund-policy">Refund & Cancellation Policy</Link>.
      </p>
    </Policy>
  );
}
