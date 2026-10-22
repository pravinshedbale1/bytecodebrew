import { useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { Play } from 'lucide-react';
import { Callout } from './Callout';
import { Takeaways } from './Takeaways';
import { QA } from './QA';
import { Mermaid } from './Mermaid';
import { FlowSteps } from './FlowSteps';
import { lazySim } from '../sim/lazySim.jsx';

// Each simulator appears in one lesson, so it is loaded only when that lesson is opened
const HashRingSim = lazySim(() => import('../sim/HashRingSim'), 'HashRingSim', 'Consistent hashing ring', 'Add and remove servers, change the number of virtual nodes, and watch how many keys move compared with modulo hashing.');
const RateLimiterSim = lazySim(() => import('../sim/RateLimiterSim'), 'RateLimiterSim', 'Rate limiters side by side', 'Send traffic to a fixed window, a sliding window and a token bucket at once, and see the burst at a window boundary get through only one of them.');
const CacheSim = lazySim(() => import('../sim/CacheSim'), 'CacheSim', 'Cache eviction policies', 'Step through a request sequence and compare what LRU, LFU and FIFO keep and evict, with live hit ratios.');
const QuorumSim = lazySim(() => import('../sim/QuorumSim'), 'QuorumSim', 'Quorum reads and writes', 'Choose N, R and W, take replicas down, then write and read, and find the settings that return stale data.');
const LoadBalancerSim = lazySim(() => import('../sim/LoadBalancerSim'), 'LoadBalancerSim', 'Load-balancing algorithms under load', 'Run round robin, random, least outstanding and power of two choices on the same traffic and compare their tail latency.');
const BloomSim = lazySim(() => import('../sim/BloomSim'), 'BloomSim', 'A Bloom filter, bit by bit', 'Add and check words, see exactly which bits they use, and catch a false positive.');
const PartitionSim = lazySim(() => import('../sim/PartitionSim'), 'PartitionSim', 'Partitions and a consumer group', 'Add consumers and partitions, see idle consumers, and compare eager and cooperative rebalancing.');
const GrowthSim = lazySim(() => import('../sim/GrowthSim'), 'GrowthSim', 'How big is n? Which complexity fits?', 'Pick an input size and see how long each complexity class would take, and which one the problem expects.');
const HeapSim = lazySim(() => import('../sim/HeapSim'), 'HeapSim', 'Min-heap: offer and poll', 'Add and remove values and follow every sift-up and sift-down swap in the tree and the array.');
import { HashRing } from './HashRing';
import { Related } from './Related';
import { Practice } from './Practice';
import { ArrayViz } from './ArrayViz';
import { TreeViz } from './TreeViz';
import { GraphViz } from './GraphViz';
import { StoryBank } from './StoryBank';
import { BehavioralDrill } from './BehavioralDrill';
import { QuestionList } from './QuestionList';
import { StackedBar } from './StackedBar';
import { SolvedToggle } from './SolvedToggle';
import { ProblemTracker } from './ProblemTracker';
import { Quiz } from './Quiz';
import { FullCode } from './FullCode';
import { InterviewScope } from './InterviewScope';
import { ConstraintDecoder, ComplexityRuler, MagnitudeBars, ModClock } from './ConstraintVisuals';
import { problemSlug } from '../../hooks/useSolved';
import { useLessonKey } from '../lesson/LessonContext';
import { openInPlayground } from '../../lib/playground';
import { SolveLink } from '../solve/SolveLink';
import { PremiumGate } from '../access/PremiumGate';
import { usePremium } from '../../hooks/useAccess';

/** Plain text of rendered (highlighted) code. */
function nodeText(node) {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join('');
  return nodeText(node.props?.children);
}

/** Only blocks that declare a method or a type can compile; loop templates and fragments can't. */
const DECLARES = /^\s*(?:(?:public|private|protected|static|final|abstract)\s+)*(?:class|interface|record|enum)\s+\w+|^\s*(?:(?:public|private|protected|static|final|synchronized)\s+)*(?!(?:else|return|new|throw)\b)[\w<>\[\],.? ]+\s+\w+\s*\([^;{}]*\)\s*(?:throws\s+[\w., ]+)?\{/m;

/**
 * ```mermaid fences become diagrams; every other <pre> renders normally.
 * Java blocks in DSA lessons get a small "Run" button that opens them in the Code Playground.
 */
function Pre({ children, ...rest }) {
  const code = children?.props;
  const lessonKey = useLessonKey();
  const navigate = useNavigate();
  const ref = useRef(null);
  const premium = usePremium();
  if (code?.className === 'language-mermaid') {
    return <Mermaid chart={String(code.children)} />;
  }
  const runnable = premium && lessonKey?.startsWith('dsa/') && /\blanguage-java\b/.test(code?.className ?? '') && DECLARES.test(nodeText(code?.children));
  if (!runnable) return <pre {...rest}>{children}</pre>;
  const run = () => {
    openInPlayground(ref.current?.textContent ?? '', lessonKey);
    navigate('/playground');
  };
  return (
    <div className="code-runnable">
      <pre {...rest} ref={ref}>{children}</pre>
      <button type="button" className="code-run" onClick={run} title="Experiment with this snippet in the Code Playground (not judged)">
        <Play size={12} aria-hidden="true" /> Open in playground
      </button>
    </div>
  );
}

function Table(props) {
  return (
    <div className="table-wrap">
      <table {...props} />
    </div>
  );
}

/** Internal links use the router; external links open in a new tab. */
function Anchor({ href = '', children, ...rest }) {
  if (href.startsWith('/')) {
    return (
      <Link to={href} {...rest}>
        {children}
      </Link>
    );
  }
  if (href.startsWith('#')) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  }
  const link = (
    <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
    </a>
  );
  const slug = problemSlug(href);
  if (!slug) return link;
  // a practice problem: the checkbox records it as solved (see the Problem Tracker lesson)
  return (
    <>
      <SolvedToggle slug={slug} title={typeof children === 'string' ? children : undefined} />
      {link}
      <SolveLink slug={slug} />
    </>
  );
}

/** Everything a lesson can use without importing it. */
export const mdxComponents = {
  pre: Pre,
  table: Table,
  a: Anchor,
  Callout,
  Takeaways,
  QA,
  Mermaid,
  FlowSteps,
  HashRingSim,
  RateLimiterSim,
  CacheSim,
  QuorumSim,
  LoadBalancerSim,
  BloomSim,
  PartitionSim,
  GrowthSim,
  HeapSim,
  HashRing,
  Related,
  Practice,
  ArrayViz,
  TreeViz,
  GraphViz,
  StoryBank: (props) => <PremiumGate feature="The story bank" compact><StoryBank {...props} /></PremiumGate>,
  BehavioralDrill: (props) => <PremiumGate feature="The behavioral drill" compact><BehavioralDrill {...props} /></PremiumGate>,
  QuestionList,
  StackedBar,
  ProblemTracker,
  Quiz,
  FullCode,
  InterviewScope,
  ConstraintDecoder,
  ComplexityRuler,
  MagnitudeBars,
  ModClock,
};
