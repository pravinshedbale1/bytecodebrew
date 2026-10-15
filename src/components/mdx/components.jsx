import { Link } from 'react-router';
import { Callout } from './Callout';
import { Takeaways } from './Takeaways';
import { QA } from './QA';
import { Mermaid } from './Mermaid';
import { HashRing } from './HashRing';
import { Related } from './Related';
import { Practice } from './Practice';
import { ArrayViz } from './ArrayViz';
import { TreeViz } from './TreeViz';
import { GraphViz } from './GraphViz';
import { SolvedToggle } from './SolvedToggle';
import { ProblemTracker } from './ProblemTracker';
import { problemSlug } from '../../hooks/useSolved';

/** ```mermaid fences become diagrams; every other <pre> renders normally. */
function Pre({ children, ...rest }) {
  const code = children?.props;
  if (code?.className === 'language-mermaid') {
    return <Mermaid chart={String(code.children)} />;
  }
  return <pre {...rest}>{children}</pre>;
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
  HashRing,
  Related,
  Practice,
  ArrayViz,
  TreeViz,
  GraphViz,
  ProblemTracker,
};
