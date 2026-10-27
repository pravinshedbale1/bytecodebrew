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
const LoadBalancerSim = lazySim(() => import('../sim/LoadBalancerSim'), 'LoadBalancerSim', 'Four ways to pick a server, racing', 'Watch take turns, random, least busy and best of two handle the same traffic side by side: see the lines build up at each server and compare how long the unlucky requests wait.');
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
import { lazyViz } from './viz/lazyViz';
import { problemSlug } from '../../hooks/useSolved';
import { useLessonKey } from '../lesson/LessonContext';
import { openInPlayground } from '../../lib/playground';
import { SolveLink } from '../solve/SolveLink';
import { PremiumGate } from '../access/PremiumGate';
import { usePremium } from '../../hooks/useAccess';

// DSA step-throughs, loaded with the lesson that uses them (free, like the other DSA visualisers)
const CyclicSortViz = lazyViz(() => import('./viz/CyclicSortViz'), 'CyclicSortViz');
const TwoSumMapViz = lazyViz(() => import('./viz/HashingViz'), 'TwoSumMapViz');
const ConsecutiveSetViz = lazyViz(() => import('./viz/HashingViz'), 'ConsecutiveSetViz');
const PairSumViz = lazyViz(() => import('./viz/TwoPointersViz'), 'PairSumViz');
const ContainerViz = lazyViz(() => import('./viz/TwoPointersViz'), 'ContainerViz');
const ReadWriteViz = lazyViz(() => import('./viz/TwoPointersViz'), 'ReadWriteViz');
const DutchFlagViz = lazyViz(() => import('./viz/TwoPointersViz'), 'DutchFlagViz');
const SlidingWindowViz = lazyViz(() => import('./viz/SlidingWindowViz'), 'SlidingWindowViz');
const PrefixQueryViz = lazyViz(() => import('./viz/PrefixSumsViz'), 'PrefixQueryViz');
const SubarraySumViz = lazyViz(() => import('./viz/PrefixSumsViz'), 'SubarraySumViz');
const DifferenceArrayViz = lazyViz(() => import('./viz/PrefixSumsViz'), 'DifferenceArrayViz');
const IntervalsViz = lazyViz(() => import('./viz/IntervalsViz'), 'IntervalsViz');
const MeetingRoomsViz = lazyViz(() => import('./viz/IntervalsViz'), 'MeetingRoomsViz');
const FirstTrueViz = lazyViz(() => import('./viz/SearchingViz'), 'FirstTrueViz');
const RotatedSearchViz = lazyViz(() => import('./viz/SearchingViz'), 'RotatedSearchViz');
const AnswerSearchViz = lazyViz(() => import('./viz/SearchingViz'), 'AnswerSearchViz');
const QuickselectViz = lazyViz(() => import('./viz/SortingViz'), 'QuickselectViz');
const BucketViz = lazyViz(() => import('./viz/SortingViz'), 'BucketViz');
const BracketsViz = lazyViz(() => import('./viz/StacksViz'), 'BracketsViz');
const AsteroidViz = lazyViz(() => import('./viz/StacksViz'), 'AsteroidViz');
const NextGreaterViz = lazyViz(() => import('./viz/StacksViz'), 'NextGreaterViz');
const HistogramViz = lazyViz(() => import('./viz/StacksViz'), 'HistogramViz');
const SlidingMaxViz = lazyViz(() => import('./viz/StacksViz'), 'SlidingMaxViz');
const TopKViz = lazyViz(() => import('./viz/HeapsViz'), 'TopKViz');
const KWayMergeViz = lazyViz(() => import('./viz/HeapsViz'), 'KWayMergeViz');
const MedianViz = lazyViz(() => import('./viz/HeapsViz'), 'MedianViz');
const TreeDfsViz = lazyViz(() => import('./viz/TreesViz'), 'TreeDfsViz');
const TreeBfsViz = lazyViz(() => import('./viz/TreesViz'), 'TreeBfsViz');
const BstViz = lazyViz(() => import('./viz/TreesViz'), 'BstViz');
const IslandsViz = lazyViz(() => import('./viz/GraphsViz'), 'IslandsViz');
const GridBfsViz = lazyViz(() => import('./viz/GraphsViz'), 'GridBfsViz');
const TopoViz = lazyViz(() => import('./viz/GraphsViz'), 'TopoViz');
const UnionFindViz = lazyViz(() => import('./viz/GraphsViz'), 'UnionFindViz');
const DijkstraViz = lazyViz(() => import('./viz/GraphsViz'), 'DijkstraViz');
const BacktrackViz = lazyViz(() => import('./viz/BacktrackViz'), 'BacktrackViz');
const QueensViz = lazyViz(() => import('./viz/BacktrackViz'), 'QueensViz');
const FibTreeViz = lazyViz(() => import('./viz/DpViz'), 'FibTreeViz');
const Dp1dViz = lazyViz(() => import('./viz/DpViz'), 'Dp1dViz');
const DpGridViz = lazyViz(() => import('./viz/DpViz'), 'DpGridViz');
const RobberTreeViz = lazyViz(() => import('./viz/DpViz'), 'RobberTreeViz');
const GreedyViz = lazyViz(() => import('./viz/SpecialViz'), 'GreedyViz');
const TrieViz = lazyViz(() => import('./viz/SpecialViz'), 'TrieViz');
const BitsViz = lazyViz(() => import('./viz/SpecialViz'), 'BitsViz');
const LruViz = lazyViz(() => import('./viz/AdvancedViz'), 'LruViz');
const MatrixViz = lazyViz(() => import('./viz/AdvancedViz'), 'MatrixViz');
const MathViz = lazyViz(() => import('./viz/AdvancedViz'), 'MathViz');
const KmpViz = lazyViz(() => import('./viz/AdvancedViz'), 'KmpViz');
const FenwickViz = lazyViz(() => import('./viz/AdvancedViz'), 'FenwickViz');
const SegTreeViz = lazyViz(() => import('./viz/AdvancedViz'), 'SegTreeViz');
const FastSlowViz = lazyViz(() => import('./viz/LinkedListViz'), 'FastSlowViz');
const ReverseListViz = lazyViz(() => import('./viz/LinkedListViz'), 'ReverseListViz');
const DummyNodeViz = lazyViz(() => import('./viz/LinkedListViz'), 'DummyNodeViz');

// HLD step-throughs: premium while PREMIUM_CONTENT.hldVisuals is on (free users see what the visual does)
const hld = (load, name, title, blurb) => lazyViz(load, name, { premium: 'hldVisuals', title, blurb });
const foundations = () => import('./viz/HldFoundationsViz');
const scaling = () => import('./viz/ScalingViz');
const storage = () => import('./viz/StorageViz');
const distributed = () => import('./viz/DistributedViz');
const InterviewViz = hld(foundations, 'InterviewViz', 'A 45-minute design interview, step by step', 'Watch a URL shortener interview fill the whiteboard minute by minute: requirements, numbers, API, data model, architecture, deep dives and wrap-up, with what the interviewer scores at each step.');
const EstimationViz = hld(foundations, 'EstimationViz', 'Back-of-the-envelope estimation, step by step', 'Turn daily users into QPS, peak, storage, bandwidth, cache and servers one card at a time, with the exact and the rounded arithmetic, and run it on your own numbers.');
const RequestJourneyViz = hld(foundations, 'RequestJourneyViz', 'What happens when you type a URL', 'Watch DNS, TCP, TLS and HTTP messages fly between browser, resolver and server while a stopwatch adds up the round trips; compare TLS 1.3, connection reuse, HTTP/3 and a CDN edge.');
const SessionsViz = hld(scaling, 'SessionsViz', 'Where does session state live?', 'Follow Alice and Bob through logins, sticky routing, a server crash and scaling out, once with sessions in server memory and once in a shared store, and see who gets logged out.');
const BalancerViz = hld(scaling, 'BalancerViz', 'Load balancing, one request at a time', 'Asha, Ben, Chen and Dev send quick and slow requests; watch the load balancer pick a server for each and the servers fill up, with round robin, least connections, weights, IP hash and a crashing server.');
const DataModelsViz = hld(storage, 'DataModelsViz', 'One dataset, four data models', 'Run four questions against the same shop data stored as relational tables, documents, key-value pairs and wide-column partitions, and see which records each one touches and what it costs.');
const BTreeViz = hld(storage, 'BTreeViz', 'Inside a B+tree index', 'Descend from root to leaf page by page, walk the linked leaves for a range query, and watch inserts split pages and grow a new root, with your own keys if you like.');
const LsmViz = hld(storage, 'LsmViz', 'Inside an LSM tree', 'Follow writes into the commit log and memtable, flushes to SSTables, tombstones, Bloom-filter checks bit by bit and a compaction that merges it all.');
const UploadViz = hld(storage, 'UploadViz', 'Uploading a big file to object storage', 'Compare a 400 MB upload through your API, with a presigned URL and as a parallel multipart upload with a failed part, on a sequence diagram with a stopwatch.');
const IsolationViz = hld(distributed, 'IsolationViz', 'Two transactions at once', 'Watch two transactions interleave statement by statement, with every row\'s versions, locks and the snapshot each one reads: read skew, lost updates and write skew, each followed by its fix.');
const ReplicationViz = hld(distributed, 'ReplicationViz', 'Replication, message by message', 'Follow log entries from leader to followers: a semi-synchronous write, a stale read caused by lag, a failover that loses acknowledged writes, and a leaderless quorum read.');
const ShardingViz = hld(distributed, 'ShardingViz', 'Partitioning data across shards', 'Send new orders to range and hash partitions to see hot spots and scattered range queries, then add a shard with hash mod N and with fixed partitions and count the keys that move.');
const RingViz = hld(distributed, 'RingViz', 'Consistent hashing on a ring', 'Walk keys clockwise to their servers, add and remove a server and see which keys move, then add virtual nodes and watch the shares even out.');

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
  CyclicSortViz,
  TwoSumMapViz,
  ConsecutiveSetViz,
  PairSumViz,
  ContainerViz,
  ReadWriteViz,
  DutchFlagViz,
  SlidingWindowViz,
  PrefixQueryViz,
  SubarraySumViz,
  DifferenceArrayViz,
  IntervalsViz,
  MeetingRoomsViz,
  FirstTrueViz,
  RotatedSearchViz,
  AnswerSearchViz,
  QuickselectViz,
  BucketViz,
  FastSlowViz,
  ReverseListViz,
  DummyNodeViz,
  BracketsViz,
  AsteroidViz,
  NextGreaterViz,
  HistogramViz,
  SlidingMaxViz,
  TopKViz,
  KWayMergeViz,
  MedianViz,
  TreeDfsViz,
  TreeBfsViz,
  BstViz,
  IslandsViz,
  GridBfsViz,
  TopoViz,
  UnionFindViz,
  DijkstraViz,
  BacktrackViz,
  QueensViz,
  FibTreeViz,
  Dp1dViz,
  DpGridViz,
  RobberTreeViz,
  GreedyViz,
  TrieViz,
  BitsViz,
  LruViz,
  MatrixViz,
  MathViz,
  KmpViz,
  FenwickViz,
  SegTreeViz,
  InterviewViz,
  EstimationViz,
  RequestJourneyViz,
  SessionsViz,
  BalancerViz,
  DataModelsViz,
  BTreeViz,
  LsmViz,
  UploadViz,
  IsolationViz,
  ReplicationViz,
  ShardingViz,
  RingViz,
};
