/**
 * System Design track.
 *
 * Ordering matters: modules and lessons are listed in the sequence a learner
 * should study them. Each lesson builds on vocabulary introduced earlier.
 *
 * A lesson becomes readable as soon as a matching MDX file exists at
 *   src/content/<trackId>/<courseId>/<lessonId>.mdx
 * Lessons without a file are shown as "Planned" automatically.
 */

const L = (id, title, summary, minutes, level) => ({ id, title, summary, minutes, level });

const hld = {
  id: 'hld',
  title: 'High-Level Design',
  shortTitle: 'HLD',
  description:
    'Design large-scale distributed systems: how to break a product into services, store and move data, and keep it fast and reliable as traffic grows.',
  outcomes: [
    'Drive a 45-minute design interview with a repeatable framework',
    'Estimate traffic, storage and bandwidth to justify design choices',
    'Reason about trade-offs between consistency, availability and latency',
    'Pick the right building block — cache, queue, database, CDN — and defend it',
    'Present complete, defensible designs for the most-asked interview problems',
  ],
  modules: [
    {
      id: 'foundations',
      title: 'Foundations',
      description: 'The method and the vocabulary. Read these first — every later lesson assumes them.',
      lessons: [
        L('hld-interview-framework', 'The HLD Interview Framework', 'A step-by-step method for running a design interview, from requirements to deep dives.', 14, 'Beginner'),
        L('back-of-the-envelope-estimation', 'Back-of-the-Envelope Estimation', 'Numbers every engineer should know and how to turn them into QPS, storage and bandwidth.', 16, 'Beginner'),
        L('networking-essentials', 'Networking Essentials', 'DNS, TCP vs UDP, HTTP versions and TLS — what actually happens between client and server.', 18, 'Beginner'),
      ],
    },
    {
      id: 'scaling-compute',
      title: 'Scaling the Application Tier',
      description: 'How a single server becomes a fleet, and how traffic is spread across it.',
      lessons: [
        L('scalability', 'Scalability: Vertical vs Horizontal', 'Scaling up vs out, stateless services, and where state should live.', 13, 'Beginner'),
        L('load-balancing', 'Load Balancing', 'L4 vs L7, balancing algorithms, health checks, and avoiding a single point of failure.', 17, 'Intermediate'),
      ],
    },
    {
      id: 'data-storage',
      title: 'Storing Data',
      description: 'The database is usually the hardest part to scale. Choosing, indexing, protecting, copying and splitting data.',
      lessons: [
        L('sql-vs-nosql', 'Choosing a Database: SQL vs NoSQL', 'Relational, key-value, document, wide-column and graph stores — and how to choose.', 18, 'Intermediate'),
        L('database-indexing', 'Indexing & Storage Engines', 'B-Trees vs LSM-Trees, secondary indexes, and why writes and reads pull in opposite directions.', 17, 'Intermediate'),
        L('transactions-and-isolation', 'Transactions, Isolation & MVCC', 'ACID in practice, isolation anomalies, MVCC, locking and optimistic concurrency.', 20, 'Intermediate'),
        L('replication', 'Replication', 'Leader-follower, multi-leader and leaderless replication, replication lag and failover.', 19, 'Intermediate'),
        L('sharding', 'Partitioning & Sharding', 'Splitting data across machines: range vs hash partitioning, hot spots and rebalancing.', 17, 'Intermediate'),
        L('consistent-hashing', 'Consistent Hashing', 'The hash ring, virtual nodes, and why adding a server should not reshuffle everything.', 13, 'Intermediate'),
        L('blob-storage', 'Object Storage & File Uploads', 'How S3-style storage works, presigned URLs, multipart and resumable uploads.', 15, 'Intermediate'),
      ],
    },
    {
      id: 'distributed-theory',
      title: 'Distributed Systems Theory',
      description: 'The rules of the game once data and work live on more than one machine.',
      lessons: [
        L('cap-and-pacelc', 'CAP Theorem & PACELC', 'What CAP really says, what it does not, and the latency trade-off PACELC adds.', 14, 'Intermediate'),
        L('consistency-models', 'Consistency Models', 'Linearizability, sequential, causal, read-your-writes and eventual consistency — and quorums.', 16, 'Advanced'),
        L('time-and-ordering', 'Time, Clocks & Ordering', 'Clock skew, Lamport clocks, vector clocks and hybrid logical clocks.', 15, 'Advanced'),
        L('consensus', 'Consensus, Leader Election & Locks', 'Raft, ZooKeeper/etcd, leases, fencing tokens, gossip and failure detection.', 22, 'Advanced'),
        L('distributed-transactions', 'Distributed Transactions', 'Two-phase commit, Sagas, the outbox pattern and idempotent workflows.', 19, 'Advanced'),
        L('unique-id-generation', 'Unique ID Generation', 'UUIDs, ticket servers, Snowflake IDs and ULID/UUIDv7.', 13, 'Intermediate'),
      ],
    },
    {
      id: 'performance',
      title: 'Caching & Content Delivery',
      description: 'Serving data faster by keeping copies closer to where they are needed.',
      lessons: [
        L('caching', 'Caching', 'Cache layers, read/write strategies, eviction, invalidation, and stampedes.', 20, 'Intermediate'),
        L('cdn', 'Content Delivery Networks', 'Edge caching, push vs pull CDNs, cache keys and invalidation for static and dynamic content.', 12, 'Beginner'),
      ],
    },
    {
      id: 'communication',
      title: 'Services & Communication',
      description: 'How clients talk to servers, how services talk to each other, and how to split a system into services.',
      lessons: [
        L('api-design', 'API Design: REST, gRPC, GraphQL', 'Resource modelling, pagination, versioning, idempotency and choosing a protocol.', 20, 'Intermediate'),
        L('real-time-communication', 'Real-Time Communication', 'Short polling, long polling, Server-Sent Events and WebSockets — and scaling persistent connections.', 14, 'Intermediate'),
        L('message-queues', 'Message Queues & Event Streaming', 'Queues vs logs, delivery guarantees, ordering, consumer groups and back-pressure.', 20, 'Intermediate'),
        L('microservices-architecture', 'Monoliths, Microservices & Service Discovery', 'When to split, service boundaries, discovery, API gateways and service meshes.', 18, 'Intermediate'),
        L('event-driven-architecture', 'Event-Driven Architecture, CQRS & Event Sourcing', 'Events vs commands, choreography vs orchestration, CQRS and event sourcing.', 17, 'Advanced'),
      ],
    },
    {
      id: 'data-systems',
      title: 'Data Processing & Specialised Systems',
      description: 'Analytics pipelines, search, location, and the clever data structures behind them.',
      lessons: [
        L('batch-and-stream-processing', 'Batch & Stream Processing', 'OLTP vs OLAP, MapReduce/Spark, Flink, windows, watermarks, Lambda and Kappa.', 20, 'Advanced'),
        L('search-systems', 'Search & Inverted Indexes', 'Tokenisation, inverted indexes, relevance ranking, and running Elasticsearch at scale.', 17, 'Intermediate'),
        L('geospatial-indexing', 'Geospatial Indexing', 'Geohashes, quadtrees, S2 and H3 — finding what is nearby, fast.', 17, 'Intermediate'),
        L('probabilistic-data-structures', 'Probabilistic Data Structures', 'Bloom filters, HyperLogLog, Count-Min Sketch and top-K heavy hitters.', 15, 'Advanced'),
      ],
    },
    {
      id: 'reliability',
      title: 'Reliability, Security & Operations',
      description: 'Keeping the system up, secure and observable — in one region or many.',
      lessons: [
        L('rate-limiting', 'Rate Limiting', 'Token bucket, leaky bucket, fixed and sliding windows, and distributed rate limiting.', 16, 'Intermediate'),
        L('availability-and-fault-tolerance', 'Availability & Fault Tolerance', 'SLAs and nines, redundancy, timeouts, retries with backoff, circuit breakers and idempotency.', 19, 'Intermediate'),
        L('observability', 'Observability', 'Metrics, logs, traces, SLO-based alerting and debugging distributed systems.', 15, 'Intermediate'),
        L('multi-region-architecture', 'Multi-Region Architecture', 'Active-passive vs active-active, data placement, global routing and disaster recovery.', 17, 'Advanced'),
        L('security-fundamentals', 'Security Fundamentals', 'Authentication, authorization, OAuth 2.0/OIDC, JWTs, encryption and secrets.', 18, 'Intermediate'),
      ],
    },
    {
      id: 'case-studies-core',
      title: 'Case Studies: Core',
      description: 'The most frequently asked designs, written the way you would present them in an interview.',
      lessons: [
        L('design-url-shortener', 'Design a URL Shortener', 'Key generation, redirects at scale, caching and analytics.', 25, 'Beginner'),
        L('design-rate-limiter', 'Design a Distributed Rate Limiter', 'A rate-limiting service shared by many API servers.', 22, 'Intermediate'),
        L('design-notification-system', 'Design a Notification System', 'Multi-channel delivery, preferences, retries and deduplication.', 24, 'Intermediate'),
        L('design-typeahead', 'Design Search Autocomplete', 'Tries, top-k precomputation, freshness and personalisation.', 24, 'Intermediate'),
        L('design-web-crawler', 'Design a Web Crawler', 'URL frontier, politeness, deduplication and recrawl scheduling.', 25, 'Intermediate'),
        L('design-news-feed', 'Design a News Feed', 'Fan-out on write vs read, ranking and celebrity users.', 30, 'Intermediate'),
        L('design-chat-system', 'Design a Chat System', 'WebSockets, message ordering, presence, groups and offline delivery.', 30, 'Intermediate'),
        L('design-file-storage', 'Design Cloud File Storage (Dropbox)', 'Chunking, deduplication, sync, conflicts and metadata.', 28, 'Advanced'),
      ],
    },
    {
      id: 'case-studies-advanced',
      title: 'Case Studies: Advanced',
      description: 'Senior-level designs with hard consistency, scale or real-time requirements.',
      lessons: [
        L('design-ride-hailing', 'Design a Ride-Hailing Service', 'Location updates, geo-indexing, matching and trip state.', 30, 'Advanced'),
        L('design-video-streaming', 'Design a Video Streaming Platform', 'Upload pipeline, transcoding, adaptive bitrate and CDN delivery.', 30, 'Advanced'),
        L('design-ticket-booking', 'Design a Ticket Booking System', 'Seat holds, contention, virtual waiting rooms and payments.', 28, 'Advanced'),
        L('design-payment-system', 'Design a Payment System', 'Ledgers, idempotency, PSP integration and reconciliation.', 30, 'Advanced'),
        L('design-ad-click-aggregator', 'Design an Ad Click Aggregator', 'Stream aggregation, exactly-once counting and reconciliation.', 27, 'Advanced'),
        L('design-job-scheduler', 'Design a Distributed Job Scheduler', 'Scheduling at scale, leases, retries and exactly-once execution.', 26, 'Advanced'),
        L('design-collaborative-editor', 'Design a Collaborative Editor (Google Docs)', 'OT vs CRDTs, sessions, presence and persistence.', 27, 'Advanced'),
        L('design-key-value-store', 'Design a Distributed Key-Value Store', 'Partitioning, replication, quorums, repair and storage engine.', 30, 'Advanced'),
      ],
    },
    {
      id: 'revision',
      title: 'Revision',
      description: 'Consolidate everything before an interview.',
      lessons: [
        L('hld-design-patterns', 'Recurring Design Patterns', 'The ten problem shapes behind almost every design question, and the standard answers.', 22, 'Advanced'),
        L('hld-cheat-sheet', 'HLD Cheat Sheet', 'Numbers, trade-offs and decision tables on one page for last-minute revision.', 15, 'Intermediate'),
      ],
    },
  ],
};

const lld = {
  id: 'lld',
  title: 'Low-Level Design',
  shortTitle: 'LLD',
  description:
    'Object-oriented design for interviews: principles, all 23 classic design patterns in Java, concurrency, schema design, and 22 machine-coding case studies with runnable, tested Java solutions.',
  outcomes: [
    'Turn a vague problem into entities, relationships and clean interfaces',
    'Apply SOLID and the core design principles with judgment, not dogma',
    'Recognise when each design pattern fits — and when it is over-engineering',
    'Write thread-safe, extensible, testable Java under interview time pressure',
    'Solve the most-asked machine-coding problems end to end',
  ],
  modules: [
    {
      id: 'lld-foundations',
      title: 'Foundations',
      description: 'How LLD rounds work, and the object-oriented building blocks every design rests on.',
      lessons: [
        L('lld-interview-framework', 'The LLD Interview Framework', 'How design and machine-coding rounds are run and scored, and a repeatable approach.', 14, 'Beginner'),
        L('oop-fundamentals', 'OOP Fundamentals in Java', 'Encapsulation, abstraction, inheritance, polymorphism — and interfaces, equality and immutability.', 20, 'Beginner'),
        L('class-relationships-uml', 'Class Relationships & UML', 'Association, aggregation, composition, dependency and inheritance — and drawing them.', 15, 'Beginner'),
      ],
    },
    {
      id: 'lld-principles',
      title: 'Design Principles',
      description: 'The principles that patterns are built on. Interviewers probe these directly.',
      lessons: [
        L('solid-principles', 'SOLID Principles', 'Five principles with violations, fixes and the trade-offs of over-applying them.', 24, 'Intermediate'),
        L('core-design-principles', 'Core Design Principles', 'Encapsulate what varies, program to interfaces, composition over inheritance, DRY, KISS, YAGNI and more.', 18, 'Intermediate'),
      ],
    },
    {
      id: 'creational-patterns',
      title: 'Creational Patterns',
      description: 'Controlling how objects are created so that code does not depend on concrete classes.',
      lessons: [
        L('singleton-pattern', 'Singleton', 'One instance, thread-safe initialisation, and why it is often an anti-pattern.', 15, 'Beginner'),
        L('factory-patterns', 'Factory Method & Abstract Factory', 'Decoupling creation from use: simple factory, factory method and families of products.', 20, 'Intermediate'),
        L('builder-pattern', 'Builder', 'Constructing complex, valid, immutable objects step by step.', 15, 'Beginner'),
        L('prototype-pattern', 'Prototype', 'Creating objects by cloning, deep vs shallow copies and prototype registries.', 12, 'Intermediate'),
      ],
    },
    {
      id: 'structural-patterns',
      title: 'Structural Patterns',
      description: 'Assembling objects into larger structures while keeping them flexible.',
      lessons: [
        L('adapter-pattern', 'Adapter', 'Making incompatible interfaces work together — object vs class adapters.', 13, 'Beginner'),
        L('decorator-pattern', 'Decorator', 'Adding behaviour by wrapping, without subclass explosions.', 16, 'Intermediate'),
        L('facade-pattern', 'Facade', 'A simple front door to a complex subsystem.', 11, 'Beginner'),
        L('proxy-pattern', 'Proxy', 'Controlling access: lazy, protection, remote, caching and logging proxies.', 15, 'Intermediate'),
        L('composite-pattern', 'Composite', 'Treating trees of objects and single objects uniformly.', 14, 'Intermediate'),
        L('bridge-pattern', 'Bridge', 'Splitting two dimensions of variation into independent hierarchies.', 14, 'Advanced'),
        L('flyweight-pattern', 'Flyweight', 'Sharing intrinsic state to support huge numbers of small objects.', 12, 'Advanced'),
      ],
    },
    {
      id: 'behavioral-patterns',
      title: 'Behavioral Patterns',
      description: 'How objects collaborate and divide responsibilities. The most-used group in LLD interviews.',
      lessons: [
        L('strategy-pattern', 'Strategy', 'Interchangeable algorithms behind one interface.', 15, 'Beginner'),
        L('observer-pattern', 'Observer', 'Publish–subscribe inside a process, and its pitfalls.', 16, 'Intermediate'),
        L('state-pattern', 'State', 'Behaviour that changes with internal state — the backbone of many machine-coding problems.', 18, 'Intermediate'),
        L('command-pattern', 'Command', 'Requests as objects: queues, undo/redo, macros and audit logs.', 16, 'Intermediate'),
        L('chain-of-responsibility-pattern', 'Chain of Responsibility', 'Passing a request along a chain of handlers.', 15, 'Intermediate'),
        L('template-method-pattern', 'Template Method', 'A fixed algorithm skeleton with overridable steps.', 12, 'Beginner'),
        L('iterator-pattern', 'Iterator', 'Traversing collections without exposing their internals.', 12, 'Beginner'),
        L('mediator-pattern', 'Mediator', 'Replacing a web of object-to-object calls with a hub.', 13, 'Intermediate'),
        L('memento-pattern', 'Memento', 'Snapshots for undo without breaking encapsulation.', 12, 'Intermediate'),
        L('visitor-pattern', 'Visitor', 'Adding operations to a stable class hierarchy via double dispatch.', 15, 'Advanced'),
      ],
    },
    {
      id: 'lld-craft',
      title: 'Concurrency & Code Craft',
      description: 'What separates working code from interview-grade code: thread safety, errors, testability.',
      lessons: [
        L('concurrency-for-lld', 'Concurrency for LLD', 'Race conditions, locks, atomics, concurrent collections and producer–consumer in Java.', 24, 'Advanced'),
        L('interview-grade-code', 'Writing Interview-Grade Code', 'Modelling, validation, exceptions, immutability, testability and common anti-patterns.', 16, 'Intermediate'),
        L('code-smells-refactoring', 'Code Smells & Refactoring', 'Recognising smells and removing them with small, safe, named refactorings — with a verified worked example.', 16, 'Intermediate'),
        L('lld-schema-design', 'Schema Design for LLD', 'Mapping classes to tables, invariants as constraints, indexes from queries, and concurrency in SQL.', 22, 'Intermediate'),
      ],
    },
    {
      id: 'lld-case-studies-core',
      title: 'Case Studies: Core',
      description: 'The most frequently asked machine-coding problems, designed and implemented step by step.',
      lessons: [
        L('lld-snake-and-ladder', 'Machine-Coding Walkthrough: Snake & Ladder', 'A minute-by-minute 90-minute round: scoping, design, code by minute 40, tests and extensions.', 22, 'Beginner'),
        L('lld-parking-lot', 'Design a Parking Lot', 'Spots, vehicles, tickets, pricing strategies and concurrent allocation.', 28, 'Intermediate'),
        L('lld-vending-machine', 'Design a Vending Machine', 'The State pattern end to end: coins, selection, dispensing and refunds.', 22, 'Intermediate'),
        L('lld-elevator-system', 'Design an Elevator System', 'Requests, scheduling strategies, and a controller for multiple cars.', 26, 'Advanced'),
        L('lld-tic-tac-toe', 'Design Tic-Tac-Toe', 'Board, players, O(1) win detection and an extensible game loop.', 18, 'Beginner'),
        L('lld-lru-cache', 'Design an LRU Cache', 'HashMap + doubly linked list, generic and thread-safe.', 20, 'Intermediate'),
        L('lld-logging-framework', 'Design a Logging Framework', 'Levels, appenders, formatters and async logging.', 20, 'Intermediate'),
        L('lld-library-management', 'Design a Library Management System', 'Catalog, members, loans, reservations and fines.', 22, 'Beginner'),
        L('lld-file-system', 'Design an In-Memory File System', 'Composite tree, path resolution, cycle-safe moves, visitors and locking.', 20, 'Intermediate'),
        L('lld-kv-store', 'Design a Key-Value Store with Transactions', 'Nested transactions, optimistic concurrency, versions, tombstones and TTL.', 24, 'Advanced'),
      ],
    },
    {
      id: 'lld-case-studies-advanced',
      title: 'Case Studies: Advanced',
      description: 'Harder problems that combine several patterns with real concurrency and business rules.',
      lessons: [
        L('lld-splitwise', 'Design Splitwise', 'Expenses, split strategies, balances and debt simplification.', 26, 'Intermediate'),
        L('lld-movie-ticket-booking', 'Design a Movie Ticket Booking System', 'Shows, seat locking with expiry, and payments.', 28, 'Advanced'),
        L('lld-chess', 'Design Chess', 'Pieces, move validation, special moves and game state.', 28, 'Advanced'),
        L('lld-rate-limiter', 'Design a Rate Limiter (LLD)', 'Pluggable algorithms, per-key buckets and thread safety.', 20, 'Intermediate'),
        L('lld-atm', 'Design an ATM', 'State machine, cash dispensing chain and bank integration.', 22, 'Intermediate'),
        L('lld-pub-sub', 'Design a Pub-Sub Message Broker', 'Topics, subscribers, offsets, and concurrent delivery.', 24, 'Advanced'),
        L('lld-job-scheduler', 'Design a Job Scheduler', 'Time-ordered queue, a dispatcher that sleeps until due, fixed rate vs delay, retries and cancellation.', 24, 'Advanced'),
        L('lld-notification-service', 'Design a Notification Service', 'Channels, templates, preferences, quiet hours, priority, dedup, failover and dead letters.', 22, 'Intermediate'),
      ],
    },
    {
      id: 'lld-case-studies-business',
      title: 'Case Studies: Business Systems',
      description: 'Product-company favourites where business rules, money and concurrency meet.',
      lessons: [
        L('lld-cab-booking', 'Design a Cab Booking System', 'Spatial index, atomic driver claims, ride lifecycle and surge pricing.', 24, 'Advanced'),
        L('lld-food-delivery', 'Design a Food Delivery System', 'Single-restaurant cart, coupons, order state machine, limited stock and partners.', 24, 'Intermediate'),
        L('lld-hotel-booking', 'Design a Hotel Booking System', 'Half-open date ranges, O(log n) availability, per-room locks and per-night pricing.', 22, 'Intermediate'),
        L('lld-digital-wallet', 'Design a Digital Wallet', 'Double-entry ledger, idempotent transfers, ordered locking, limits and refunds.', 24, 'Advanced'),
      ],
    },
    {
      id: 'lld-revision',
      title: 'Revision',
      description: 'Consolidate patterns and principles before an interview.',
      lessons: [
        L('pattern-selection-guide', 'Choosing & Comparing Patterns', 'Problem-to-pattern mapping and the comparisons interviewers ask about.', 18, 'Advanced'),
        L('lld-cheat-sheet', 'LLD Cheat Sheet', 'Principles, patterns, concurrency tools and case-study one-liners on one page.', 12, 'Intermediate'),
      ],
    },
  ],
};

export const systemDesign = {
  id: 'system-design',
  title: 'System Design',
  icon: 'network',
  description:
    'High-level architecture and low-level object design — the two halves of every system design round.',
  courses: [hld, lld],
};
