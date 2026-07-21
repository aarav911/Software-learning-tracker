/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import {
  AppState,
  Topic,
  StudyResource,
  StudyLog,
  Project,
  Specialization,
  JobIntroduction,
  InterviewJournal,
  ResumeSavvy,
  SystemDesignNote,
  ScopeKnowledge,
  YouTubePlaylist,
  YouTubeVideo,
  PassiveLearningItem,
} from '../types';

const STORAGE_KEY = 'craftsman_hub_app_state_v3';

const sampleTopics: Topic[] = [
  {
    id: 'rust-sys',
    title: 'Rust System Programming',
    category: 'Language',
    dateInitiated: '2026-06-15',
    description: 'Deep exploration of memory safety, async runtimes, and low-level concurrency abstractions in Rust.',
    notes: 'Focus on zero-cost abstractions, Pin/Unpin mechanics, and custom memory allocators.',
    resources: [
      {
        id: 'rust-book-1',
        title: 'The Rust Programming Language',
        type: 'Book',
        creator: 'Steve Klabnik & Carol Nichols',
        completedUnits: 14,
        totalUnits: 20,
        unitLabel: 'chapters',
        isCurrentFocus: true,
        status: 'In Progress',
        priority: 'High',
        notes: 'Covers core compiler rules, borrow checker, and smart pointers.',
      },
      {
        id: 'tokio-course',
        title: 'Async Rust with Tokio',
        type: 'Course/Playlist',
        creator: 'Tokio Contributors / Tutorial',
        completedUnits: 5,
        totalUnits: 12,
        unitLabel: 'videos',
        isCurrentFocus: false,
        status: 'In Progress',
        priority: 'Medium',
        notes: 'Understanding mini-tokio executor, task spawning, and thread pooling.',
      },
      {
        id: 'rust-nomicon',
        title: 'The Rustonomicon: Dark Arts of Unsafe',
        type: 'Documentation',
        creator: 'Rust Team',
        completedUnits: 1,
        totalUnits: 8,
        unitLabel: 'modules',
        isCurrentFocus: false,
        status: 'In Progress',
        priority: 'High',
        notes: 'Advanced raw pointers, undefined behavior, and layout requirements.',
      }
    ]
  },
  {
    id: 'postgres-internals',
    title: 'PostgreSQL Database Internals',
    category: 'Subject',
    dateInitiated: '2026-07-01',
    description: 'Deep-dive into storage engines, B-Tree indexing, MVCC lock mechanisms, and query planners.',
    notes: 'Aiming to write a toy storage engine based on standard page/buffer designs.',
    resources: [
      {
        id: 'pg-book-1',
        title: 'Designing Data-Intensive Applications',
        type: 'Book',
        creator: 'Martin Kleppmann',
        completedUnits: 8,
        totalUnits: 12,
        unitLabel: 'chapters',
        isCurrentFocus: true,
        status: 'In Progress',
        priority: 'High',
        notes: 'Essential reference for storage engines, transactions, and replication.',
      },
      {
        id: 'pg-tour-guide',
        title: 'Architecture of Open Source DBMS (Postgres Chapter)',
        type: 'Article/Paper',
        creator: 'Bruce Momjian',
        completedUnits: 1,
        totalUnits: 1,
        unitLabel: 'pages',
        isCurrentFocus: false,
        status: 'Completed',
        priority: 'Medium',
        notes: 'Covers process model, buffer pool, and shared memory buffers.',
      }
    ]
  }
];

const sampleLogs: StudyLog[] = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    topicId: 'rust-sys',
    topicTitle: 'Rust System Programming',
    resourceId: 'rust-book-1',
    resourceTitle: 'The Rust Programming Language',
    prevProgress: 12,
    newProgress: 14,
    unitLabel: 'chapters',
    notes: 'Studied lifetimes, nested trait bounds, and generic implementations.',
    durationMinutes: 90,
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    topicId: 'postgres-internals',
    topicTitle: 'PostgreSQL Database Internals',
    resourceId: 'pg-book-1',
    resourceTitle: 'Designing Data-Intensive Applications',
    prevProgress: 7,
    newProgress: 8,
    unitLabel: 'chapters',
    notes: 'Reviewed LSM-Trees, SSTables, and how SSTables are merged via compaction.',
    durationMinutes: 120,
  }
];

const sampleProjects: Project[] = [
  {
    id: 'proj-1',
    title: 'Toy LSM-Tree Storage Engine',
    tagline: 'Write-ahead log, MemTable with SkipList, and sparse index SSTable segments in Rust.',
    githubRepo: 'github.com/craftsman/toy-lsm',
    status: 'In Progress' as any,
    techStack: ['Rust', 'POSIX API', 'Cargo'],
    retrospectiveLog: 'Completed the SkipList MemTable. Working on compaction thread pool.',
    projectType: 'Reconstruction'
  }
];

const sampleSpecializations: Specialization[] = [
  {
    id: 'compiler-construction',
    title: 'Compiler Construction',
    category: 'Theory',
    dateInitiated: '2026-05-10',
    description: 'Constructing recursive-descent parsers, AST trees, intermediate representations (IR), register allocation, and lowering to x86 or LLVM.',
    notes: 'Reference books: Crafting Interpreters, Engineering a Compiler. Aiming to build a simple compiler that targets x86-64 assembly.',
    resources: [
      {
        id: 'interpreters-book',
        title: 'Crafting Interpreters',
        type: 'Book',
        creator: 'Robert Nystrom',
        completedUnits: 12,
        totalUnits: 30,
        unitLabel: 'chapters',
        isCurrentFocus: true,
        status: 'In Progress',
        priority: 'High',
        notes: 'Currently building the clox bytecode virtual machine.',
      },
      {
        id: 'llvm-docs',
        title: 'LLVM Language Reference Manual',
        type: 'Documentation',
        creator: 'LLVM Project',
        completedUnits: 2,
        totalUnits: 10,
        unitLabel: 'sections',
        isCurrentFocus: false,
        status: 'In Progress',
        priority: 'Medium',
        notes: 'Learning LLVM IR structure, SSA form, and instruction attributes.',
      }
    ]
  },
  {
    id: 'dist-databases',
    title: 'Distributed Databases & Consensus',
    category: 'System',
    dateInitiated: '2026-06-20',
    description: 'Understanding Paxos, Raft, vector clocks, multi-version concurrency control (MVCC), linearizability, and partitions.',
    notes: 'Primary focus: Writing a clean Raft replica state machine implementation.',
    resources: [
      {
        id: 'raft-paper',
        title: 'In Search of an Understandable Consensus Algorithm (Raft Paper)',
        type: 'Article/Paper',
        creator: 'Diego Ongaro & John Ousterhout',
        completedUnits: 1,
        totalUnits: 1,
        unitLabel: 'readings',
        isCurrentFocus: true,
        status: 'Completed',
        priority: 'High',
        notes: 'Understood leader election and log replication logic.',
      }
    ]
  }
];

const sampleIntroductions: JobIntroduction[] = [
  {
    id: 'intro-1',
    title: 'Senior Systems & Full-Stack Engineer',
    roleType: 'Full-Stack / Systems',
    content: "Hi, I'm a software engineer specializing in low-level systems architecture and high-throughput web applications. Over the last few years, I've focused on building resilient data-intensive platforms using Rust, Go, and TypeScript. I thrive at the intersection of systems programming—like custom database engines and virtual machines—and developer-focused toolings. I'm passionate about performance profiling, memory safety, and writing clean, highly deterministic systems.",
  },
  {
    id: 'intro-2',
    title: 'Distributed Systems Tech Lead',
    roleType: 'Staff / Tech Lead',
    content: "I am a Distributed Systems Engineer with 6+ years of experience designing scalable data storage systems and consensus protocols. I specialize in database storage engines (particularly LSM-Trees), WAL performance optimization, and consensus mechanisms like Raft and Paxos. In my previous role, I led a team of 4 engineers to rebuild an ingestion pipeline, reducing write latency by 40% and saving $150k in yearly cloud spend. I'm looking for a role where I can continue tackling hard consensus and concurrency problems.",
  }
];

const sampleInterviewJournal: InterviewJournal[] = [
  {
    id: 'journal-1',
    type: 'Q&A',
    question: 'How does PostgreSQL implement Multi-Version Concurrency Control (MVCC)?',
    answer: "PostgreSQL implements MVCC by retaining old versions of modified rows inside the table heap rather than using an external Undo Log (unlike MySQL/InnoDB). Every table row (tuple) contains header fields: 'xmin' (the ID of the inserting transaction) and 'xmax' (the ID of the deleting/updating transaction). When an UPDATE occurs, Postgres writes a completely new tuple into the page and sets the 'xmax' of the old tuple and 'xmin' of the new tuple to the current transaction ID. This avoids locking read transactions, but causes 'write amplification' and table bloat, which requires background VACUUM cycles to reclaim dead tuples.",
  },
  {
    id: 'journal-2',
    type: 'STAR/Situation',
    question: 'Tell me about a time you solved a complex concurrency bug under pressure.',
    answer: "SITUATION: During a stress-test of our custom toy storage engine, we hit a rare but catastrophic deadlock during B-Tree page splits when multiple background compaction threads merged concurrently.\n\nTASK: I needed to diagnose and resolve the deadlock in production before the system's beta release.\n\nACTION: I analyzed the lock acquisition order. I found that Thread A locked parent pages from top-to-bottom, while compaction Thread B tried to lock child pages and propagate updates upward (bottom-to-top), violating strict lock ordering. I refactored the page-locking protocol to implement a pessimistic 'try_lock' with backoff when cascading splits upward, release lower locks on failure, and retry.\n\nRESULT: The deadlock frequency dropped to absolute zero, CPU usage stabilized, and compaction throughput increased by 15%.",
  }
];

const sampleResumeSavvy: ResumeSavvy[] = [
  {
    id: 'savvy-1',
    title: 'Toy LSM-Tree Storage Engine Implementation',
    context: 'Independent Systems Project / Rust',
    details: '• Designed and implemented a self-contained Log-Structured Merge (LSM) Tree storage engine in Rust with 0 external dependencies except standard POSIX APIs.\n• Built a thread-safe lock-free MemTable using a custom SkipList, achieving 15,000 writes/sec.\n• Developed an asynchronous compaction worker pool executing Size-Tiered Compaction Strategy (STCS) to reclaim disk space.\n• Wrote a binary sparse-index reader for SSTables to load index entries directly into memory, reducing point lookup page-reads to exactly 1 IOPS in the best case.',
  },
  {
    id: 'savvy-2',
    title: 'Sub-millisecond Ingestion Gateway',
    context: 'Infrastructure Lead / Go & Redis',
    details: '• Built a streaming API gateway in Go that handled 60,000 telemetry packets/sec with p99 latency under 2ms.\n• Utilized Redis Streams for horizontal decoupling and consumer groups for distributed processing.\n• Implemented adaptive ring-buffers for batching writes to the underlying clickhouse analytical database, reducing total DB transactions by 95%.'
  }
];

const sampleDsaResources: StudyResource[] = [
  {
    id: 'dsa-res-1',
    title: 'Blind 75 Curated LeetCode Patterns',
    type: 'Other',
    creator: 'Yangshun Tay / Tech Interview Handbook',
    completedUnits: 45,
    totalUnits: 75,
    unitLabel: 'problems',
    isCurrentFocus: true,
    status: 'In Progress',
    priority: 'High',
    notes: 'Focusing on Sliding Window, Two Pointers, and Binary Tree DFS/BFS patterns.',
    url: 'https://www.techinterviewhandbook.org/best-practice-questions/'
  },
  {
    id: 'dsa-res-2',
    title: 'The Algorithm Design Manual',
    type: 'Book',
    creator: 'Steven S. Skiena',
    completedUnits: 6,
    totalUnits: 15,
    unitLabel: 'chapters',
    isCurrentFocus: false,
    status: 'In Progress',
    priority: 'Medium',
    notes: 'Excellent analysis of backtracking, dynamic programming heuristics, and graph coloring algorithms.',
  }
];

const sampleSystemDesignNotes: SystemDesignNote[] = [
  {
    id: 'sys-note-1',
    title: 'How to design a Distributed Rate Limiter?',
    body: '## 1. Requirements\n- **Functional**: Throttle requests per user/API token (e.g. 100 req/min).\n- **Non-Functional**: Sub-millisecond latency (must not slow down API gateway), highly available, distributed consistency across multiple regional data centers.\n\n## 2. Core Architecture\n- Use **API Gateway** as the interceptor.\n- Store client token buckets inside a **Redis Cluster** (In-Memory K-V store) to ensure speed.\n- Execute rate-limiting logic inside Redis using **Lua scripts** to ensure atomic check-and-increment operations (prevents split-brain race conditions).\n\n## 3. Algorithm Selection\n- **Token Bucket**: Standard, handles burst traffic nicely. Redis stores `{tokens: 10, last_updated: timestamp}`.\n- **Sliding Window Log**: Highly precise, but memory-intensive (stores timestamps of every request in a sorted set).\n- **Sliding Window Counter**: Hybrid, low memory, highly scalable. We use this for low-overhead distributed scaling.\n\n## 4. Performance & Availability Tradeoffs\n- **Local Cache + Sync**: To completely avoid hitting Redis on every single API request, let the API Gateway maintain a local in-memory token bucket and batch-synchronize token usage to the central Redis database every 500ms. If Redis is down, gracefully fallback to local memory rate limiting.',
  },
  {
    id: 'sys-note-2',
    title: 'How to design a Scalable URL Shortener (TinyURL)?',
    body: '## 1. Requirements\n- **Volume**: 100M short links generated per day. 10B reads per month (100:1 read-to-write ratio).\n- **High Availability**: Fast redirects (p99 < 50ms).\n\n## 2. Key Generation & Encoding\n- Convert unique numeric ID (64-bit integer) to **Base62** string (`[A-Za-z0-9]`). A 7-character string gives 62^7 = 3.5 Trillion combinations.\n- Avoid hash collisions by using a distributed unique ID generator rather than MD5/SHA256 hashes of the URL.\n- **ID Generator (ZooKeeper Counter Ranges)**: Run multiple server instances. Use Apache ZooKeeper to distribute ranges of integers (e.g., Server A gets 1M - 2M, Server B gets 2M - 3M). Servers generate unique short codes sequentially within their assigned range without network coordination.',
  }
];

const sampleScopeKnowledge: ScopeKnowledge[] = [
  {
    id: 'scope-1',
    domain: 'Systems Programming',
    topic: 'Rust Memory Safety, Borrowing & Lifetimes',
    level: 'Mastered',
    notes: 'Deep understanding of stack vs heap, ownership transfer, lifetime bounds, variance (covariance/contravariance), Pinning, and unsafe raw pointers.',
  },
  {
    id: 'scope-2',
    domain: 'Distributed Systems',
    topic: 'Consensus Protocols (Raft)',
    level: 'Deep Expertise',
    notes: 'Understand Leader Election, Log Replication, Safety invariants, Membership Changes, Joint Consensus, and Log Compaction/Snapshotting.',
  },
  {
    id: 'scope-3',
    domain: 'Databases & Storage',
    topic: 'LSM-Trees & Compaction Strategies',
    level: 'Deep Expertise',
    notes: 'Well-versed in Write-Ahead Log (WAL), MemTables (SkipLists/B-Trees), SSTables with bloom filters, Size-Tiered vs Leveled compaction tradeoffs, and read/write amplification.',
  },
  {
    id: 'scope-4',
    domain: 'Web Architecture',
    topic: 'HTTP/2 & WebSockets Concurrency',
    level: 'Core Knowledge',
    notes: 'Understanding multiplexing, TCP head-of-line blocking mitigation, keep-alive connections, connection pooling, and bi-directional websocket backplanes.',
  }
];

const sampleYouTubePlaylists: YouTubePlaylist[] = [
  {
    id: 'yt-playlist-1',
    title: 'Feynman Lectures on Distributed Systems',
    description: 'Deconstructing core concepts like consensus protocols, replication lag, and atomic commit algorithms by teaching them to an imaginary beginner to master them deeply.',
    topic: 'Distributed Systems',
    isActive: true,
    createdAt: '2026-07-10T12:00:00.000Z',
    resources: [
      {
        id: 'yt-res-1',
        title: 'Designing Data-Intensive Applications',
        type: 'Book',
        creator: 'Martin Kleppmann',
        completedUnits: 4,
        totalUnits: 12,
        unitLabel: 'chapters',
        isCurrentFocus: true,
        status: 'In Progress',
        priority: 'High',
        notes: 'Targeting Chapters 5, 6, 7, and 9 for the first batch of videos.',
        url: 'https://dataintensive.net/'
      }
    ],
    videos: [
      {
        id: 'yt-vid-1',
        title: 'Explain Single-Leader Replication in 5 Minutes',
        scope: 'Explain why we write to a single leader, how secondary nodes replicate the WAL, and what happens when the leader goes down (failover/split-brain).',
        notes: 'Keep it conversational. Try to avoid high-level jargon and draw a water pipeline analogy.',
        createdAt: '2026-07-10T14:30:00.000Z'
      },
      {
        id: 'yt-vid-2',
        title: 'The Truth About Consensus and Raft',
        scope: 'Deconstruct Raft leader election. Explain randomized timers, candidate states, term increments, and split-vote mitigation.',
        notes: 'Highlight how a majority vote enforces the overlapping set principle (Quorums).',
        createdAt: '2026-07-11T09:15:00.000Z'
      }
    ]
  }
];

export const samplePassiveLearningItems: PassiveLearningItem[] = [
  // Video Playlists & Courses
  {
    id: 'pl-cpp-cherno',
    title: 'C++ by cherno (extremely important)',
    type: 'Video Playlist',
    creator: 'The Cherno',
    url: 'https://www.youtube.com/playlist?list=PLlrATfBNZ98dudnM48yfGUldqGD0S4FFb',
    category: 'C++',
    totalUnits: 115,
    completedUnits: 7,
    unitLabel: 'videos',
    inRotation: true,
    notes: 'Extremely important core C++ concept playlist.',
  },
  {
    id: 'pl-py-networking',
    title: 'Python networking programming',
    type: 'Video Playlist',
    creator: 'YouTube Tutorial',
    url: 'https://www.youtube.com/watch?v=qsZ8Qcm6_8k&list=PLhTjy8cBISErYuLZUvVOYsR1giva2payF&index=3',
    category: 'Python Networking',
    totalUnits: 23,
    completedUnits: 23,
    unitLabel: 'videos',
    inRotation: false,
  },
  {
    id: 'pl-abdul-bari-algo',
    title: 'Abdul bari algorithms',
    type: 'Video Playlist',
    creator: 'Abdul Bari',
    url: 'https://www.youtube.com/playlist?list=PLDN4rrl48XKpZkf03iYFl-O29szjTrs_O',
    category: 'Algorithms',
    totalUnits: 84,
    completedUnits: 16,
    unitLabel: 'videos',
    inRotation: true,
  },
  {
    id: 'pl-berkeley-cs61a',
    title: 'Brian Harvey’s Berkeley CS 61A',
    type: 'Video Course',
    creator: 'Brian Harvey (Berkeley)',
    url: 'https://www.youtube.com/playlist?list=PLhMnuBfGeCDNgVzLPxF9o5UNKG1b-LFY9',
    category: 'Programming',
    totalUnits: 44,
    completedUnits: 7,
    unitLabel: 'videos',
    inRotation: true,
  },
  {
    id: 'pl-berkeley-cs61b',
    title: 'CS 61B',
    type: 'Video Course',
    creator: 'UC Berkeley',
    url: 'https://www.youtube.com/playlist?list=PLu0nzW8Es1x3TmpwQRLMQwCtulEd43ZY8',
    category: 'DS & Advanced Programming',
    totalUnits: 39,
    completedUnits: 3,
    unitLabel: 'videos',
    inRotation: true,
  },
  {
    id: 'pl-berkeley-cs61c',
    title: 'CS 61C',
    type: 'Video Course',
    creator: 'UC Berkeley',
    url: 'https://www.youtube.com/playlist?list=PL0j-r-omG7i0-mnsxN5T4UcVS1Di0isqf',
    category: 'Computer Architecture',
    totalUnits: 40,
    completedUnits: 4,
    unitLabel: 'videos',
    inRotation: false,
  },
  {
    id: 'pl-math-for-cs',
    title: 'Math for CS',
    type: 'Video Course',
    creator: 'MIT OCW (6.042J)',
    url: 'https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/video_galleries/video-lectures/',
    category: 'Math for CS',
    totalUnits: 25,
    completedUnits: 3,
    unitLabel: 'videos',
    inRotation: false,
  },
  {
    id: 'pl-berkeley-cs162',
    title: 'Berkeley CS 162',
    type: 'Video Course',
    creator: 'UC Berkeley',
    url: 'https://www.youtube.com/playlist?list=PLF2K2xZjNEf97A_uBCwEl61sdxWVP7VWC',
    category: 'Operating Systems',
    totalUnits: 27,
    completedUnits: 1,
    unitLabel: 'videos',
    inRotation: false,
  },
  {
    id: 'pl-stanford-cs144',
    title: 'Stanford CS 144',
    type: 'Video Course',
    creator: 'Stanford',
    url: 'https://www.youtube.com/playlist?list=PL6RdenZrxrw9inR-IJv-erlOKRHjymxMN',
    category: 'Networking',
    totalUnits: 145,
    completedUnits: 3,
    unitLabel: 'videos',
    inRotation: false,
  },
  {
    id: 'pl-berkeley-cs186',
    title: 'Berkeley CS 186',
    type: 'Video Course',
    creator: 'UC Berkeley',
    url: 'https://www.youtube.com/playlist?list=PLYp4IGUhNFmw8USiYMJvCUjZe79fvyYge',
    category: 'Databases',
    totalUnits: 217,
    completedUnits: 11,
    unitLabel: 'videos',
    inRotation: false,
  },
  {
    id: 'pl-alex-aiken-compilers',
    title: 'Compilers by Alex Aiken',
    type: 'Video Course',
    creator: 'Alex Aiken (Stanford)',
    url: 'https://www.youtube.com/playlist?list=PLxoiCo5tGquBZzK0E_-JVLSV3b3o_2OnX',
    category: 'Compilers',
    totalUnits: 126,
    completedUnits: 3,
    unitLabel: 'videos',
    inRotation: false,
  },
  {
    id: 'pl-mit-6824',
    title: 'MIT 6.824',
    type: 'Video Course',
    creator: 'Robert Morris (MIT)',
    url: 'https://www.youtube.com/playlist?list=PLrw6a1wE39_tb2fErI4-WkMbsvGQk9_UB',
    category: 'Distributed Systems',
    totalUnits: 20,
    completedUnits: 1,
    unitLabel: 'videos',
    inRotation: true,
  },
  {
    id: 'pl-stanford-cs144-ml',
    title: 'Stanford CS 144 ML',
    type: 'Video Course',
    creator: 'Stanford',
    url: 'https://www.youtube.com/playlist?list=PLoROMvodv4rMiGQp3WXShtMGgzqpfVfbU',
    category: 'Machine Learning',
    totalUnits: 21,
    completedUnits: 0,
    unitLabel: 'videos',
    inRotation: false,
  },
  {
    id: 'pl-mit-6s191',
    title: 'MIT 6.S191: Introduction to Deep Learning',
    type: 'Video Course',
    creator: 'MIT',
    url: 'https://www.youtube.com/playlist?list=PLtBw6njQRU-rwp5__7C0oIVt26ZgjG9NI',
    category: 'Deep Learning',
    totalUnits: 90,
    completedUnits: 0,
    unitLabel: 'videos',
    inRotation: false,
  },
  {
    id: 'pl-cs230-stanford',
    title: 'CS230 Stanford',
    type: 'Video Course',
    creator: 'Andrew Ng (Stanford)',
    url: 'https://www.youtube.com/playlist?list=PLoROMvodv4rNRRGdS0rBbXOUGA0wjdh1X',
    category: 'Deep Learning',
    totalUnits: 9,
    completedUnits: 0,
    unitLabel: 'videos',
    inRotation: false,
  },
  {
    id: 'pl-stanford-cs231n',
    title: 'Stanford CS231n',
    type: 'Video Course',
    creator: 'Fei-Fei Li (Stanford)',
    url: 'https://www.youtube.com/playlist?list=PLoROMvodv4rOmsNzYBMe0gJY2XS8AQg16',
    category: 'Computer Vision',
    totalUnits: 18,
    completedUnits: 0,
    unitLabel: 'videos',
    inRotation: false,
  },
  {
    id: 'pl-stanford-cs224n',
    title: 'Stanford CS224n',
    type: 'Video Course',
    creator: 'Christopher Manning (Stanford)',
    url: 'https://www.youtube.com/playlist?list=PLoROMvodv4rOaMFbaqxPDoLWjDaRAdP9D',
    category: 'NLP',
    totalUnits: 23,
    completedUnits: 0,
    unitLabel: 'videos',
    inRotation: false,
  },
  {
    id: 'pl-mit-67960',
    title: 'MIT 6.7960',
    type: 'Video Course',
    creator: 'MIT',
    url: 'https://www.youtube.com/playlist?list=PLUl4u3cNGP63URZnh5iqBzDTDYPUTQT-8',
    category: 'Deep Learning',
    totalUnits: 24,
    completedUnits: 0,
    unitLabel: 'videos',
    inRotation: false,
  },
  {
    id: 'pl-cs224r-stanford',
    title: 'CS224R Stanford',
    type: 'Video Course',
    creator: 'Stanford',
    url: 'https://www.youtube.com/playlist?list=PLoROMvodv4rPwxE0ONYRa_itZFdaKCylL',
    category: 'Deep Learning',
    totalUnits: 19,
    completedUnits: 0,
    unitLabel: 'videos',
    inRotation: false,
  },
  {
    id: 'pl-mit-6046j',
    title: 'MIT 6.046J',
    type: 'Video Course',
    creator: 'MIT OCW',
    url: 'https://www.youtube.com/playlist?list=PLUl4u3cNGP6317WaSNfmCvGym2ucw3oGp',
    category: 'Algorithms',
    totalUnits: 34,
    completedUnits: 0,
    unitLabel: 'videos',
    inRotation: false,
  },
  {
    id: 'pl-mit-6006',
    title: 'MIT 6.006',
    type: 'Video Course',
    creator: 'Erik Demaine (MIT)',
    url: 'https://www.youtube.com/playlist?list=PLUl4u3cNGP63EdVPNLG3ToM6LaEUuStEY',
    category: 'Algorithms',
    totalUnits: 32,
    completedUnits: 0,
    unitLabel: 'videos',
    inRotation: false,
  },
  {
    id: 'pl-mit-18404j',
    title: 'MIT 18.404J',
    type: 'Video Course',
    creator: 'Michael Sipser (MIT)',
    url: 'https://www.youtube.com/playlist?list=PLUl4u3cNGP60_JNv2MmK3wkOt9syvfQWY',
    category: 'Theory of Computation',
    totalUnits: 25,
    completedUnits: 0,
    unitLabel: 'videos',
    inRotation: false,
  },
  {
    id: 'pl-cmu-15445',
    title: 'CMU 15-445/645',
    type: 'Video Course',
    creator: 'Andy Pavlo (CMU)',
    url: 'https://www.youtube.com/playlist?list=PLSE8ODhjZXjYMAgsGH-GtY5rJYZ6zjsd5',
    category: 'Databases',
    totalUnits: 25,
    completedUnits: 0,
    unitLabel: 'videos',
    inRotation: false,
  },
  {
    id: 'pl-mit-6858',
    title: 'MIT 6.858 Comp Security Systems',
    type: 'Video Course',
    creator: 'MIT',
    url: 'https://www.youtube.com/playlist?list=PLUl4u3cNGP62K2DjQLRxDNRi0z2IRWnNh',
    category: 'Security',
    totalUnits: 22,
    completedUnits: 0,
    unitLabel: 'videos',
    inRotation: false,
  },
  {
    id: 'pl-cmu-15462',
    title: 'CMU 15-462/662',
    type: 'Video Course',
    creator: 'Keenan Crane (CMU)',
    url: 'https://www.youtube.com/playlist?list=PL9_jI1bdZmz2emSh0UQ5iOdT2xRHFHL7E',
    category: 'Computer Graphics',
    totalUnits: 25,
    completedUnits: 0,
    unitLabel: 'videos',
    inRotation: false,
  },
  {
    id: 'pl-mit-6837',
    title: 'MIT 6.837',
    type: 'Video Course',
    creator: 'MIT',
    url: 'https://www.youtube.com/playlist?list=PLQ3UicqQtfNtqt2yL3KgKV-yn0NEPbRVi',
    category: 'Computer Graphics',
    totalUnits: 22,
    completedUnits: 0,
    unitLabel: 'videos',
    inRotation: false,
  },
  {
    id: 'pl-mit-67350',
    title: 'MIT 6.7350',
    type: 'Video Course',
    creator: 'MIT',
    url: 'https://www.youtube.com/playlist?list=PLQ3UicqQtfNsivZX5TmUAoUkkBqFT8aOL',
    category: 'Numerical Algorithms',
    totalUnits: 25,
    completedUnits: 0,
    unitLabel: 'videos',
    inRotation: false,
  },
  {
    id: 'pl-mit-6172',
    title: 'MIT 6.172',
    type: 'Video Course',
    creator: 'Charles Leiserson (MIT)',
    url: 'https://www.youtube.com/playlist?list=PLUl4u3cNGP63VIBQVWguXxZZi0566y7Wf',
    category: 'Performance Engineering',
    totalUnits: 23,
    completedUnits: 0,
    unitLabel: 'videos',
    inRotation: false,
  },
  {
    id: 'pl-cmu-15418',
    title: 'CMU 15-418',
    type: 'Video Course',
    creator: 'Kayvon Fatahalian (CMU)',
    url: 'https://www.youtube.com/playlist?list=PLpIxOj-HnDsO4Atvrp86c-4La9Mq3kMQZ',
    category: 'Parallel Computing',
    totalUnits: 29,
    completedUnits: 0,
    unitLabel: 'videos',
    inRotation: false,
  },
  {
    id: 'pl-eecs-317',
    title: 'EECS-317',
    type: 'Video Course',
    creator: 'Lecture Series',
    url: 'https://www.youtube.com/playlist?list=PLWl7jvxH18r0dflwRg3F51qQ8DV5ScQ1n',
    category: 'Data Management',
    totalUnits: 18,
    completedUnits: 0,
    unitLabel: 'videos',
    inRotation: false,
  },
  {
    id: 'pl-cs-310',
    title: 'CS-310',
    type: 'Video Course',
    creator: 'Lecture Series',
    url: 'https://www.youtube.com/playlist?list=PLWl7jvxH18r0u5VRZsOjhghNXc_Ec4dZz',
    category: 'Software Architecture',
    totalUnits: 19,
    completedUnits: 0,
    unitLabel: 'videos',
    inRotation: false,
  },
  {
    id: 'pl-mit-6826',
    title: 'MIT 6.826',
    type: 'Video Course',
    creator: 'MIT',
    url: 'https://www.youtube.com/playlist?list=PLA6Ht2dJt3SITo6PYTyzr9832epkyFD48',
    category: 'Computer Systems',
    totalUnits: 25,
    completedUnits: 0,
    unitLabel: 'videos',
    inRotation: false,
  },
  {
    id: 'pl-cs106a',
    title: 'CS106A',
    type: 'Video Course',
    creator: 'Mehran Sahami (Stanford)',
    url: 'https://www.youtube.com/playlist?list=PL84A56BC7F4A1F852',
    category: 'Programming Methodologies',
    totalUnits: 28,
    completedUnits: 0,
    unitLabel: 'videos',
    inRotation: false,
  },
  {
    id: 'pl-cs106b',
    title: 'CS106B',
    type: 'Video Course',
    creator: 'Stanford',
    url: 'https://www.youtube.com/playlist?list=PLFE6E58F856038C69',
    category: 'Programming Abstractions',
    totalUnits: 27,
    completedUnits: 0,
    unitLabel: 'videos',
    inRotation: false,
  },
  {
    id: 'pl-cs107',
    title: 'CS107',
    type: 'Video Course',
    creator: 'Jerry Cain (Stanford)',
    url: 'https://www.youtube.com/playlist?list=PL9D558D49CA734A02',
    category: 'Programming Paradigms',
    totalUnits: 27,
    completedUnits: 0,
    unitLabel: 'videos',
    inRotation: false,
  },
  {
    id: 'pl-parallel-py',
    title: 'Parallel programming in python',
    type: 'Video Playlist',
    creator: 'YouTube Tutorial',
    url: 'https://www.youtube.com/playlist?list=PLyb_C2HpOQSBsEsIVAfYOZT5083L70l_b',
    category: 'Python Parallelization',
    totalUnits: 18,
    completedUnits: 1,
    unitLabel: 'videos',
    inRotation: false,
  },
  {
    id: 'pl-ai-eng-76m',
    title: 'AI engineering in 76 minutes',
    type: 'Video Playlist',
    creator: 'YouTube Video',
    url: 'https://www.youtube.com/watch?v=JV3pL1_mn2M',
    category: 'AI Engineering',
    totalUnits: 1,
    completedUnits: 0,
    unitLabel: 'videos',
    inRotation: false,
  },
  {
    id: 'pl-chrome-ext',
    title: 'Chrome extension playlist',
    type: 'Video Playlist',
    creator: 'Codevolution',
    url: 'https://www.youtube.com/playlist?list=PLC3y8-rFHvwg2-q6Kvw3Tl_4xhxtIaNlY',
    category: 'Chrome Extensions',
    totalUnits: 45,
    completedUnits: 15,
    unitLabel: 'videos',
    inRotation: false,
  },
  {
    id: 'pl-rag-scratch',
    title: 'RAG from scratch',
    type: 'Video Playlist',
    creator: 'LangChain',
    url: 'https://www.youtube.com/playlist?list=PLfaIDFEXuae2LXbO1_PKyVJiQ23ZztA0x',
    category: 'RAG Fundamentals',
    totalUnits: 14,
    completedUnits: 14,
    unitLabel: 'videos',
    inRotation: false,
  },
  {
    id: 'pl-web-crawler',
    title: 'web crawler from scratch',
    type: 'Video Playlist',
    creator: 'thenewboston',
    url: 'https://www.youtube.com/playlist?list=PL6gx4Cwl9DGA8Vys-f48mAH9OKSUyav0q',
    category: 'Web Crawlers',
    totalUnits: 17,
    completedUnits: 17,
    unitLabel: 'videos',
    inRotation: false,
  },
  {
    id: 'pl-google-appscript',
    title: 'Google apps scripts',
    type: 'Video Playlist',
    creator: 'YouTube Playlist',
    url: 'https://www.youtube.com/playlist?list=PLNvPFA43mDu5Khqc111jf89tfai_y6UsJ',
    category: 'App Scripts',
    totalUnits: 19,
    completedUnits: 0,
    unitLabel: 'videos',
    inRotation: false,
  },
  {
    id: 'pl-backend-principles',
    title: 'Backend from first principles',
    type: 'Video Playlist',
    creator: 'Hussein Nasser',
    url: 'https://www.youtube.com/watch?v=0Rwb4Xmlcwc&list=PLui3EUkuMTPgZcV0QhQrOcwMPcBCcd_Q1',
    category: 'Backend Engineering',
    totalUnits: 23,
    completedUnits: 6,
    unitLabel: 'videos',
    inRotation: false,
  },
  {
    id: 'pl-beauty-joy-comp',
    title: 'Beauty and joy of computing',
    type: 'Video Playlist',
    creator: 'UC Berkeley / BJC',
    url: 'https://www.youtube.com/playlist?list=PLECBD29A17AAF6EF9',
    category: 'Computer Science',
    totalUnits: 28,
    completedUnits: 0,
    unitLabel: 'videos',
    inRotation: false,
  },
  {
    id: 'pl-embedded-c',
    title: 'Embedded programming in C',
    type: 'Video Playlist',
    creator: 'FastBit Academy',
    url: 'https://www.youtube.com/playlist?list=PLUQpHm_JtukII_8U9pucV61MX2YE2CSUt',
    category: 'Embedded Systems',
    totalUnits: 49,
    completedUnits: 4,
    unitLabel: 'videos',
    inRotation: false,
  },
  {
    id: 'pl-mobile-computing',
    title: 'Mobile computing',
    type: 'Video Playlist',
    creator: 'NPTEL',
    url: 'https://youtube.com/playlist?list=PLsK7K7rfGYke2ZfFugu2cppvNHNrdjD-u&si=CO-nmkcpI2H8aN8b',
    category: 'Android',
    totalUnits: 53,
    completedUnits: 0,
    unitLabel: 'videos',
    inRotation: false,
  },

  // Books
  {
    id: 'bk-pragmatic-programmer',
    title: 'The Pragmatic Programmer',
    type: 'Book',
    creator: 'Hunt & Thomas',
    category: 'Software Engineering',
    totalUnits: 10,
    completedUnits: 1,
    unitLabel: 'chapters',
    inRotation: true,
  },
  {
    id: 'bk-ultralearning',
    title: 'Ultralearning',
    type: 'Book',
    creator: 'Scott Young',
    category: 'Metalearning',
    totalUnits: 13,
    completedUnits: 13,
    unitLabel: 'chapters',
    inRotation: false,
  },
  {
    id: 'bk-pgup',
    title: 'Programming from the ground up',
    type: 'Book',
    creator: 'Jonathan Bartlett',
    category: 'Assembly & Low Level',
    totalUnits: 13,
    completedUnits: 0,
    unitLabel: 'chapters',
    inRotation: false,
  },
  {
    id: 'bk-intro-java',
    title: 'Introduction to programming in java, an interdisciplinary approach',
    type: 'Book',
    creator: 'Robert Sedgewick and Kevin Wayne',
    category: 'Java',
    totalUnits: 4,
    completedUnits: 1,
    unitLabel: 'chapters',
    inRotation: false,
  },
  {
    id: 'bk-how-to-prove-it',
    title: 'How to prove it',
    type: 'Book',
    creator: 'Daniel J. Velleman',
    category: 'Formal Math',
    totalUnits: 3,
    completedUnits: 0,
    unitLabel: 'chapters',
    inRotation: false,
  },
  {
    id: 'bk-gnu-linux-admin',
    title: 'The GNU linux advanced administration',
    type: 'Book',
    creator: 'GNU Project',
    category: 'Linux Admin',
    totalUnits: 11,
    completedUnits: 0,
    unitLabel: 'chapters',
    inRotation: false,
  },
  {
    id: 'bk-windows-internals',
    title: 'Windows internals',
    type: 'Book',
    creator: 'Mark Russinovich',
    category: 'Operating Systems',
    totalUnits: 14,
    completedUnits: 0,
    unitLabel: 'chapters',
    inRotation: false,
  },
  {
    id: 'bk-windows-cpp',
    title: 'Windows via C/C++',
    type: 'Book',
    creator: 'Jeffrey Richter',
    category: 'Win32 Programming',
    totalUnits: 26,
    completedUnits: 0,
    unitLabel: 'chapters',
    inRotation: false,
  },
  {
    id: 'bk-philosophy-sd',
    title: 'A philosophy of software design',
    type: 'Book',
    creator: 'John Ousterhout',
    category: 'Philosophy & Architecture',
    totalUnits: 21,
    completedUnits: 2,
    unitLabel: 'chapters',
    inRotation: true,
  },
  {
    id: 'bk-dl-nlp',
    title: 'Deep learning for NLP',
    type: 'Book',
    creator: 'Stephan Raaijmakers',
    category: 'Machine Learning',
    totalUnits: 10,
    completedUnits: 0,
    unitLabel: 'chapters',
    inRotation: false,
  },
  {
    id: 'bk-serious-crypto',
    title: 'Serious Cryptography',
    type: 'Book',
    creator: 'Jean Philippe Aumasson',
    category: 'Cryptography',
    totalUnits: 14,
    completedUnits: 0,
    unitLabel: 'chapters',
    inRotation: false,
  },
  {
    id: 'bk-dsa-cpp',
    title: 'Data Structures using c and c++',
    type: 'Book',
    creator: 'Yedidyah, Moshe, Aaron',
    category: 'DSA',
    totalUnits: 9,
    completedUnits: 0.25,
    unitLabel: 'chapters',
    inRotation: false,
  },
  {
    id: 'bk-c-lang',
    title: 'The C programming language',
    type: 'Book',
    creator: 'Kernighan, Ritchie',
    category: 'C Language',
    totalUnits: 9,
    completedUnits: 0,
    unitLabel: 'chapters',
    inRotation: false,
  },
  {
    id: 'bk-cpp-lang',
    title: 'The c++ programming language',
    type: 'Book',
    creator: 'Bjarne Stroustrup',
    category: 'C++',
    totalUnits: 44,
    completedUnits: 0,
    unitLabel: 'chapters',
    inRotation: false,
  },
  {
    id: 'bk-clrs',
    title: 'Introduction to algorithms CLRS',
    type: 'Book',
    creator: 'Cormen, Leiserson, Rivest, Stein',
    category: 'DSA',
    totalUnits: 35,
    completedUnits: 0,
    unitLabel: 'chapters',
    inRotation: false,
  },
  {
    id: 'bk-3d-game-engine',
    title: '3d game engine architecture',
    type: 'Book',
    creator: 'Dave Eberly',
    category: 'Game Engines',
    totalUnits: 8,
    completedUnits: 0,
    unitLabel: 'chapters',
    inRotation: false,
  },
  {
    id: 'bk-game-engine-arch',
    title: 'Game engine architecture',
    type: 'Book',
    creator: 'Jason Gregory',
    category: 'Game Engines',
    totalUnits: 15,
    completedUnits: 0,
    unitLabel: 'chapters',
    inRotation: false,
  },
  {
    id: 'bk-embedded-cpp',
    title: 'embedded c++',
    type: 'Book',
    creator: 'EW Skills',
    url: 'https://www.ewskills.com/cpp/embedded-cpp',
    category: 'Embedded C++',
    totalUnits: 33,
    completedUnits: 0,
    unitLabel: 'chapters',
    inRotation: false,
  },
  {
    id: 'bk-android-dev',
    title: 'android development',
    type: 'Book',
    creator: 'UW Notes',
    url: 'https://info448-s17.github.io/lecture-notes/',
    category: 'Android',
    totalUnits: 25,
    completedUnits: 0,
    unitLabel: 'chapters',
    inRotation: false,
  },
];

const initialEmptyState: AppState = {
  topics: [],
  selectedTopicId: null,
  studyLogs: [],
  projects: [],
  specializations: [],
  selectedSpecializationId: null,
  jobIntroductions: [],
  interviewJournal: [],
  resumeSavvy: [],
  dsaResources: [],
  systemDesignNotes: [],
  scopeKnowledge: [],
  youtubePlaylists: [],
  passiveLearningItems: [],
  passiveRotationIndex: 0,
};

export function useAppState() {
  const [state, setState] = useState<AppState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AppState;
        return {
          topics: Array.isArray(parsed.topics) ? parsed.topics : sampleTopics,
          selectedTopicId:
            parsed.selectedTopicId !== undefined
              ? parsed.selectedTopicId
              : sampleTopics[0]?.id || null,
          studyLogs: Array.isArray(parsed.studyLogs)
            ? parsed.studyLogs
            : sampleLogs,
          projects: Array.isArray(parsed.projects)
            ? parsed.projects
            : sampleProjects,
          specializations: Array.isArray(parsed.specializations)
            ? parsed.specializations
            : sampleSpecializations,
          selectedSpecializationId:
            parsed.selectedSpecializationId !== undefined
              ? parsed.selectedSpecializationId
              : sampleSpecializations[0]?.id || null,
          jobIntroductions: Array.isArray(parsed.jobIntroductions)
            ? parsed.jobIntroductions
            : sampleIntroductions,
          interviewJournal: Array.isArray(parsed.interviewJournal)
            ? parsed.interviewJournal
            : sampleInterviewJournal,
          resumeSavvy: Array.isArray(parsed.resumeSavvy)
            ? parsed.resumeSavvy
            : sampleResumeSavvy,
          dsaResources: Array.isArray(parsed.dsaResources)
            ? parsed.dsaResources
            : sampleDsaResources,
          systemDesignNotes: Array.isArray(parsed.systemDesignNotes)
            ? parsed.systemDesignNotes
            : sampleSystemDesignNotes,
          scopeKnowledge: Array.isArray(parsed.scopeKnowledge)
            ? parsed.scopeKnowledge
            : sampleScopeKnowledge,
          youtubePlaylists: Array.isArray(parsed.youtubePlaylists)
            ? parsed.youtubePlaylists
            : sampleYouTubePlaylists,
          passiveLearningItems: Array.isArray(parsed.passiveLearningItems)
            ? parsed.passiveLearningItems
            : samplePassiveLearningItems,
          passiveRotationIndex:
            typeof parsed.passiveRotationIndex === 'number'
              ? parsed.passiveRotationIndex
              : 0,
        };
      }
    } catch (e) {
      console.error('Failed to parse app state', e);
    }
    return {
      topics: sampleTopics,
      selectedTopicId: sampleTopics[0]?.id || null,
      studyLogs: sampleLogs,
      projects: sampleProjects,
      specializations: sampleSpecializations,
      selectedSpecializationId: sampleSpecializations[0]?.id || null,
      jobIntroductions: sampleIntroductions,
      interviewJournal: sampleInterviewJournal,
      resumeSavvy: sampleResumeSavvy,
      dsaResources: sampleDsaResources,
      systemDesignNotes: sampleSystemDesignNotes,
      scopeKnowledge: sampleScopeKnowledge,
      youtubePlaylists: sampleYouTubePlaylists,
      passiveLearningItems: samplePassiveLearningItems,
      passiveRotationIndex: 0,
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save app state v2', e);
    }
  }, [state]);

  const setSelectedTopicId = (id: string | null) => {
    setState((prev) => ({ ...prev, selectedTopicId: id }));
  };

  const setSelectedSpecializationId = (id: string | null) => {
    setState((prev) => ({ ...prev, selectedSpecializationId: id }));
  };

  // --- TOPIC OPERATIONS ---
  const addTopic = (
    title: string,
    category: Topic['category'],
    description: string,
    notes: string = ''
  ) => {
    const newTopic: Topic = {
      id: crypto.randomUUID(),
      title,
      category,
      dateInitiated: new Date().toISOString().split('T')[0],
      description,
resource: [],
      notes,
    } as any;
    // ensure resources array is initialized
    newTopic.resources = [];
    setState((prev) => {
      const updated = [...prev.topics, newTopic];
      return {
        ...prev,
        topics: updated,
        selectedTopicId: newTopic.id,
      };
    });
  };

  const updateTopic = (id: string, fields: Partial<Omit<Topic, 'id' | 'resources'>>) => {
    setState((prev) => ({
      ...prev,
      topics: prev.topics.map((t) => (t.id === id ? { ...t, ...fields } : t)),
    }));
  };

  const deleteTopic = (id: string) => {
    setState((prev) => {
      const filtered = prev.topics.filter((t) => t.id !== id);
      return {
        ...prev,
        topics: filtered,
        selectedTopicId:
          prev.selectedTopicId === id ? filtered[0]?.id || null : prev.selectedTopicId,
      };
    });
  };

  // --- STUDY RESOURCE OPERATIONS ---
  const addResourceToTopic = (topicId: string, resourceData: Omit<StudyResource, 'id'>) => {
    const newResource: StudyResource = {
      ...resourceData,
      id: crypto.randomUUID(),
    };

    setState((prev) => ({
      ...prev,
      topics: prev.topics.map((topic) => {
        if (topic.id === topicId) {
          // If this is the first resource, or explicitly set to focus, ensure uniqueness
          let updatedResources = [...topic.resources, newResource];
          if (newResource.isCurrentFocus) {
            updatedResources = updatedResources.map((r) =>
              r.id === newResource.id ? { ...r, isCurrentFocus: true } : { ...r, isCurrentFocus: false }
            );
          } else if (topic.resources.length === 0) {
            // Auto focus on the single resource
            updatedResources[0].isCurrentFocus = true;
          }
          return { ...topic, resources: updatedResources };
        }
        return topic;
      }),
    }));
  };

  const updateResourceInTopic = (
    topicId: string,
    resourceId: string,
    updatedFields: Partial<StudyResource>
  ) => {
    setState((prev) => ({
      ...prev,
      topics: prev.topics.map((topic) => {
        if (topic.id === topicId) {
          let hasAutoShifted = false;
          let activeFocusId = '';

          let updatedResources = topic.resources.map((res) => {
            if (res.id === resourceId) {
              const updated = { ...res, ...updatedFields };
              
              // Validate progress boundaries
              updated.completedUnits = Math.max(0, Math.min(updated.totalUnits, updated.completedUnits));
              
              // Auto status calculation
              if (updated.completedUnits >= updated.totalUnits) {
                updated.status = 'Completed';
              } else if (updated.completedUnits > 0) {
                updated.status = 'In Progress';
              } else {
                updated.status = 'Not Started';
              }

              // Check if completed and was current focus
              if (updated.status === 'Completed' && res.isCurrentFocus && !res.completedUnits && updated.completedUnits >= updated.totalUnits) {
                // If it just completed and was the focus, we trigger auto-shifting flag
                hasAutoShifted = true;
              }
              
              if (updated.isCurrentFocus) {
                activeFocusId = updated.id;
              }
              
              return updated;
            }
            return res;
          });

          // Focus management
          if (updatedFields.isCurrentFocus) {
            updatedResources = updatedResources.map((r) =>
              r.id === resourceId ? { ...r, isCurrentFocus: true } : { ...r, isCurrentFocus: false }
            );
          }

          // Auto-shifting focus logic: If the current focus is completed, find the next incomplete resource and focus it!
          const activeFocus = updatedResources.find((r) => r.isCurrentFocus);
          if (activeFocus && activeFocus.status === 'Completed') {
            const nextIncomplete = updatedResources.find((r) => r.status !== 'Completed');
            if (nextIncomplete) {
              updatedResources = updatedResources.map((r) =>
                r.id === nextIncomplete.id
                  ? { ...r, isCurrentFocus: true }
                  : { ...r, isCurrentFocus: false }
              );
            }
          }

          return { ...topic, resources: updatedResources };
        }
        return topic;
      }),
    }));
  };

  const deleteResourceFromTopic = (topicId: string, resourceId: string) => {
    setState((prev) => ({
      ...prev,
      topics: prev.topics.map((topic) => {
        if (topic.id === topicId) {
          const wasFocus = topic.resources.find((r) => r.id === resourceId)?.isCurrentFocus;
          let filtered = topic.resources.filter((r) => r.id !== resourceId);
          if (wasFocus && filtered.length > 0) {
            filtered[0].isCurrentFocus = true;
          }
          return { ...topic, resources: filtered };
        }
        return topic;
      }),
    }));
  };

  const setResourceAsFocus = (topicId: string, resourceId: string) => {
    setState((prev) => ({
      ...prev,
      topics: prev.topics.map((topic) => {
        if (topic.id === topicId) {
          return {
            ...topic,
            resources: topic.resources.map((r) =>
              r.id === resourceId ? { ...r, isCurrentFocus: true } : { ...r, isCurrentFocus: false }
            ),
          };
        }
        return topic;
      }),
    }));
  };

  // --- MASTER INGESTION SYSTEM & STUDY LOG OPERATIONS ---
  const addStudyLogAndProgress = (
    topicId: string,
    resourceId: string,
    newProgress: number,
    notes: string,
    durationMinutes: number = 45
  ) => {
    let topicTitle = '';
    let resourceTitle = '';
    let unitLabel = '';
    let prevProgress = 0;

    const topic = state.topics.find((t) => t.id === topicId);
    const spec = state.specializations.find((s) => s.id === topicId);

    if (topic) {
      const resource = topic.resources.find((r) => r.id === resourceId);
      if (resource) {
        topicTitle = topic.title;
        resourceTitle = resource.title;
        unitLabel = resource.unitLabel;
        prevProgress = resource.completedUnits;
      }
    } else if (spec) {
      const resource = spec.resources.find((r) => r.id === resourceId);
      if (resource) {
        topicTitle = spec.title;
        resourceTitle = resource.title;
        unitLabel = resource.unitLabel;
        prevProgress = resource.completedUnits;
      }
    }

    if (!topicTitle || !resourceTitle) {
      console.error('Topic or Resource not found for logging');
      return;
    }

    const newLog: StudyLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      topicId,
      topicTitle,
      resourceId,
      resourceTitle,
      prevProgress,
      newProgress,
      unitLabel,
      notes,
      durationMinutes,
    };

    setState((prev) => {
      // 1. Add log entry
      const updatedLogs = [newLog, ...prev.studyLogs];

      // 2. Update resource completed units and status in topics
      const updatedTopics = prev.topics.map((t) => {
        if (t.id === topicId) {
          let updatedResources = t.resources.map((res) => {
            if (res.id === resourceId) {
              const updated = {
                ...res,
                completedUnits: Math.max(0, Math.min(res.totalUnits, newProgress)),
              };

              // Re-calculate status
              if (updated.completedUnits >= updated.totalUnits) {
                updated.status = 'Completed';
              } else if (updated.completedUnits > 0) {
                updated.status = 'In Progress';
              } else {
                updated.status = 'Not Started';
              }

              return updated;
            }
            return res;
          });

          // Auto-shifting focus logic: If the current focus is completed, shift focus to next incomplete
          const currentFocusItem = updatedResources.find((r) => r.isCurrentFocus);
          if (currentFocusItem && currentFocusItem.status === 'Completed') {
            const nextIncomplete = updatedResources.find((r) => r.status !== 'Completed');
            if (nextIncomplete) {
              updatedResources = updatedResources.map((r) =>
                r.id === nextIncomplete.id
                  ? { ...r, isCurrentFocus: true }
                  : { ...r, isCurrentFocus: false }
              );
            }
          }

          return { ...t, resources: updatedResources };
        }
        return t;
      });

      // 3. Update resource completed units and status in specializations
      const updatedSpecs = prev.specializations.map((s) => {
        if (s.id === topicId) {
          let updatedResources = s.resources.map((res) => {
            if (res.id === resourceId) {
              const updated = {
                ...res,
                completedUnits: Math.max(0, Math.min(res.totalUnits, newProgress)),
              };

              // Re-calculate status
              if (updated.completedUnits >= updated.totalUnits) {
                updated.status = 'Completed';
              } else if (updated.completedUnits > 0) {
                updated.status = 'In Progress';
              } else {
                updated.status = 'Not Started';
              }

              return updated;
            }
            return res;
          });

          // Auto-shifting focus logic: If current focus is completed, shift focus to next incomplete
          const currentFocusItem = updatedResources.find((r) => r.isCurrentFocus);
          if (currentFocusItem && currentFocusItem.status === 'Completed') {
            const nextIncomplete = updatedResources.find((r) => r.status !== 'Completed');
            if (nextIncomplete) {
              updatedResources = updatedResources.map((r) =>
                r.id === nextIncomplete.id
                  ? { ...r, isCurrentFocus: true }
                  : { ...r, isCurrentFocus: false }
              );
            }
          }

          return { ...s, resources: updatedResources };
        }
        return s;
      });

      return {
        ...prev,
        studyLogs: updatedLogs,
        topics: updatedTopics,
        specializations: updatedSpecs,
      };
    });
  };

  const deleteStudyLog = (logId: string) => {
    setState((prev) => ({
      ...prev,
      studyLogs: prev.studyLogs.filter((l) => l.id !== logId),
    }));
  };

  // --- PROJECTS ---
  const addProject = (projectData: Omit<Project, 'id'>) => {
    const newProj: Project = { ...projectData, id: crypto.randomUUID() };
    setState((prev) => ({
      ...prev,
      projects: [...prev.projects, newProj],
    }));
  };

  const updateProject = (id: string, updatedFields: Partial<Project>) => {
    setState((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === id ? { ...p, ...updatedFields } : p)),
    }));
  };

  const deleteProject = (id: string) => {
    setState((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
    }));
  };

  // --- SPECIALIZATIONS ---
  const addSpecialization = (
    title: string,
    category: Specialization['category'],
    description: string,
    notes: string = ''
  ) => {
    const newSpecialization: Specialization = {
      id: crypto.randomUUID(),
      title,
      category,
      dateInitiated: new Date().toISOString().split('T')[0],
      description,
      resources: [],
      notes,
    };
    setState((prev) => {
      const updated = [...prev.specializations, newSpecialization];
      return {
        ...prev,
        specializations: updated,
        selectedSpecializationId: newSpecialization.id,
      };
    });
  };

  const updateSpecialization = (id: string, fields: Partial<Omit<Specialization, 'id' | 'resources'>>) => {
    setState((prev) => ({
      ...prev,
      specializations: prev.specializations.map((s) => (s.id === id ? { ...s, ...fields } : s)),
    }));
  };

  const deleteSpecialization = (id: string) => {
    setState((prev) => {
      const filtered = prev.specializations.filter((s) => s.id !== id);
      return {
        ...prev,
        specializations: filtered,
        selectedSpecializationId:
          prev.selectedSpecializationId === id ? filtered[0]?.id || null : prev.selectedSpecializationId,
      };
    });
  };

  const addResourceToSpecialization = (specializationId: string, resourceData: Omit<StudyResource, 'id'>) => {
    const newResource: StudyResource = {
      ...resourceData,
      id: crypto.randomUUID(),
    };

    setState((prev) => ({
      ...prev,
      specializations: prev.specializations.map((spec) => {
        if (spec.id === specializationId) {
          let updatedResources = [...spec.resources, newResource];
          if (newResource.isCurrentFocus) {
            updatedResources = updatedResources.map((r) =>
              r.id === newResource.id ? { ...r, isCurrentFocus: true } : { ...r, isCurrentFocus: false }
            );
          } else if (spec.resources.length === 0) {
            updatedResources[0].isCurrentFocus = true;
          }
          return { ...spec, resources: updatedResources };
        }
        return spec;
      }),
    }));
  };

  const updateResourceInSpecialization = (
    specializationId: string,
    resourceId: string,
    updatedFields: Partial<StudyResource>
  ) => {
    setState((prev) => ({
      ...prev,
      specializations: prev.specializations.map((spec) => {
        if (spec.id === specializationId) {
          let updatedResources = spec.resources.map((res) => {
            if (res.id === resourceId) {
              const updated = { ...res, ...updatedFields };
              updated.completedUnits = Math.max(0, Math.min(updated.totalUnits, updated.completedUnits));
              if (updated.completedUnits >= updated.totalUnits) {
                updated.status = 'Completed';
              } else if (updated.completedUnits > 0) {
                updated.status = 'In Progress';
              } else {
                updated.status = 'Not Started';
              }
              return updated;
            }
            return res;
          });

          if (updatedFields.isCurrentFocus) {
            updatedResources = updatedResources.map((r) =>
              r.id === resourceId ? { ...r, isCurrentFocus: true } : { ...r, isCurrentFocus: false }
            );
          }

          const activeFocus = updatedResources.find((r) => r.isCurrentFocus);
          if (activeFocus && activeFocus.status === 'Completed') {
            const nextIncomplete = updatedResources.find((r) => r.status !== 'Completed');
            if (nextIncomplete) {
              updatedResources = updatedResources.map((r) =>
                r.id === nextIncomplete.id
                  ? { ...r, isCurrentFocus: true }
                  : { ...r, isCurrentFocus: false }
              );
            }
          }

          return { ...spec, resources: updatedResources };
        }
        return spec;
      }),
    }));
  };

  const deleteResourceFromSpecialization = (specializationId: string, resourceId: string) => {
    setState((prev) => ({
      ...prev,
      specializations: prev.specializations.map((spec) => {
        if (spec.id === specializationId) {
          const wasFocus = spec.resources.find((r) => r.id === resourceId)?.isCurrentFocus;
          let filtered = spec.resources.filter((r) => r.id !== resourceId);
          if (wasFocus && filtered.length > 0) {
            filtered[0].isCurrentFocus = true;
          }
          return { ...spec, resources: filtered };
        }
        return spec;
      }),
    }));
  };

  // --- JOB PREP OPERATIONS ---
  const addJobIntroduction = (title: string, roleType: string, content: string) => {
    const newItem: JobIntroduction = { id: crypto.randomUUID(), title, roleType, content };
    setState((prev) => ({ ...prev, jobIntroductions: [...prev.jobIntroductions, newItem] }));
  };
  const updateJobIntroduction = (id: string, fields: Partial<JobIntroduction>) => {
    setState((prev) => ({
      ...prev,
      jobIntroductions: prev.jobIntroductions.map((item) => (item.id === id ? { ...item, ...fields } : item)),
    }));
  };
  const deleteJobIntroduction = (id: string) => {
    setState((prev) => ({
      ...prev,
      jobIntroductions: prev.jobIntroductions.filter((item) => item.id !== id),
    }));
  };

  const addInterviewJournal = (type: InterviewJournal['type'], question: string, answer: string) => {
    const newItem: InterviewJournal = { id: crypto.randomUUID(), type, question, answer };
    setState((prev) => ({ ...prev, interviewJournal: [...prev.interviewJournal, newItem] }));
  };
  const updateInterviewJournal = (id: string, fields: Partial<InterviewJournal>) => {
    setState((prev) => ({
      ...prev,
      interviewJournal: prev.interviewJournal.map((item) => (item.id === id ? { ...item, ...fields } : item)),
    }));
  };
  const deleteInterviewJournal = (id: string) => {
    setState((prev) => ({
      ...prev,
      interviewJournal: prev.interviewJournal.filter((item) => item.id !== id),
    }));
  };

  const addResumeSavvy = (title: string, context: string, details: string) => {
    const newItem: ResumeSavvy = { id: crypto.randomUUID(), title, context, details };
    setState((prev) => ({ ...prev, resumeSavvy: [...prev.resumeSavvy, newItem] }));
  };
  const updateResumeSavvy = (id: string, fields: Partial<ResumeSavvy>) => {
    setState((prev) => ({
      ...prev,
      resumeSavvy: prev.resumeSavvy.map((item) => (item.id === id ? { ...item, ...fields } : item)),
    }));
  };
  const deleteResumeSavvy = (id: string) => {
    setState((prev) => ({
      ...prev,
      resumeSavvy: prev.resumeSavvy.filter((item) => item.id !== id),
    }));
  };

  const addDsaResource = (resourceData: Omit<StudyResource, 'id'>) => {
    const newResource: StudyResource = { ...resourceData, id: crypto.randomUUID() };
    setState((prev) => {
      let updated = [...prev.dsaResources, newResource];
      if (newResource.isCurrentFocus) {
        updated = updated.map((r) => r.id === newResource.id ? { ...r, isCurrentFocus: true } : { ...r, isCurrentFocus: false });
      } else if (prev.dsaResources.length === 0) {
        updated[0].isCurrentFocus = true;
      }
      return { ...prev, dsaResources: updated };
    });
  };
  const updateDsaResource = (id: string, fields: Partial<StudyResource>) => {
    setState((prev) => {
      let updated = prev.dsaResources.map((res) => {
        if (res.id === id) {
          const updatedRes = { ...res, ...fields };
          updatedRes.completedUnits = Math.max(0, Math.min(updatedRes.totalUnits, updatedRes.completedUnits));
          if (updatedRes.completedUnits >= updatedRes.totalUnits) {
            updatedRes.status = 'Completed';
          } else if (updatedRes.completedUnits > 0) {
            updatedRes.status = 'In Progress';
          } else {
            updatedRes.status = 'Not Started';
          }
          return updatedRes;
        }
        return res;
      });

      if (fields.isCurrentFocus) {
        updated = updated.map((r) => r.id === id ? { ...r, isCurrentFocus: true } : { ...r, isCurrentFocus: false });
      }

      const activeFocus = updated.find((r) => r.isCurrentFocus);
      if (activeFocus && activeFocus.status === 'Completed') {
        const nextIncomplete = updated.find((r) => r.status !== 'Completed');
        if (nextIncomplete) {
          updated = updated.map((r) => r.id === nextIncomplete.id ? { ...r, isCurrentFocus: true } : { ...r, isCurrentFocus: false });
        }
      }

      return { ...prev, dsaResources: updated };
    });
  };
  const deleteDsaResource = (id: string) => {
    setState((prev) => {
      const wasFocus = prev.dsaResources.find((r) => r.id === id)?.isCurrentFocus;
      let filtered = prev.dsaResources.filter((r) => r.id !== id);
      if (wasFocus && filtered.length > 0) {
        filtered[0].isCurrentFocus = true;
      }
      return { ...prev, dsaResources: filtered };
    });
  };
  const setDsaResourceAsFocus = (id: string) => {
    setState((prev) => ({
      ...prev,
      dsaResources: prev.dsaResources.map((r) => r.id === id ? { ...r, isCurrentFocus: true } : { ...r, isCurrentFocus: false }),
    }));
  };

  const addSystemDesignNote = (title: string, body: string) => {
    const newItem: SystemDesignNote = { id: crypto.randomUUID(), title, body };
    setState((prev) => ({ ...prev, systemDesignNotes: [...prev.systemDesignNotes, newItem] }));
  };
  const updateSystemDesignNote = (id: string, fields: Partial<SystemDesignNote>) => {
    setState((prev) => ({
      ...prev,
      systemDesignNotes: prev.systemDesignNotes.map((item) => (item.id === id ? { ...item, ...fields } : item)),
    }));
  };
  const deleteSystemDesignNote = (id: string) => {
    setState((prev) => ({
      ...prev,
      systemDesignNotes: prev.systemDesignNotes.filter((item) => item.id !== id),
    }));
  };

  const addScopeKnowledge = (domain: string, topic: string, level: ScopeKnowledge['level'], notes: string) => {
    const newItem: ScopeKnowledge = { id: crypto.randomUUID(), domain, topic, level, notes };
    setState((prev) => ({ ...prev, scopeKnowledge: [...prev.scopeKnowledge, newItem] }));
  };
  const updateScopeKnowledge = (id: string, fields: Partial<ScopeKnowledge>) => {
    setState((prev) => ({
      ...prev,
      scopeKnowledge: prev.scopeKnowledge.map((item) => (item.id === id ? { ...item, ...fields } : item)),
    }));
  };
  const deleteScopeKnowledge = (id: string) => {
    setState((prev) => ({
      ...prev,
      scopeKnowledge: prev.scopeKnowledge.filter((item) => item.id !== id),
    }));
  };

  // --- YOUTUBE PLAYLIST OPERATIONS ---
  const addYouTubePlaylist = (title: string, description: string, topic: string) => {
    const hasActive = state.youtubePlaylists.some(p => p.isActive);
    if (hasActive) {
      throw new Error("Cannot start a new playlist while another playlist is currently active.");
    }
    const newPlaylist: YouTubePlaylist = {
      id: crypto.randomUUID(),
      title,
      description,
      topic,
      isActive: true,
      resources: [],
      videos: [],
      createdAt: new Date().toISOString()
    };
    setState((prev) => ({
      ...prev,
      youtubePlaylists: [...prev.youtubePlaylists, newPlaylist]
    }));
  };

  const updateYouTubePlaylist = (id: string, fields: Partial<YouTubePlaylist>) => {
    setState((prev) => ({
      ...prev,
      youtubePlaylists: prev.youtubePlaylists.map((p) => (p.id === id ? { ...p, ...fields } : p)),
    }));
  };

  const deleteYouTubePlaylist = (id: string) => {
    setState((prev) => ({
      ...prev,
      youtubePlaylists: prev.youtubePlaylists.filter((p) => p.id !== id),
    }));
  };

  const deactivateYouTubePlaylist = (id: string) => {
    const playlist = state.youtubePlaylists.find((p) => p.id === id);
    if (!playlist) return;
    if (playlist.videos.length < 10) {
      throw new Error("Cannot deactivate a playlist with less than 10 videos.");
    }
    setState((prev) => ({
      ...prev,
      youtubePlaylists: prev.youtubePlaylists.map((p) => (p.id === id ? { ...p, isActive: false } : p)),
    }));
  };

  const addVideoToYouTubePlaylist = (playlistId: string, title: string, scope: string, notes?: string) => {
    const newVideo: YouTubeVideo = {
      id: crypto.randomUUID(),
      title,
      scope,
      notes,
      createdAt: new Date().toISOString()
    };
    setState((prev) => ({
      ...prev,
      youtubePlaylists: prev.youtubePlaylists.map((p) =>
        p.id === playlistId ? { ...p, videos: [...p.videos, newVideo] } : p
      ),
    }));
  };

  const updateVideoInYouTubePlaylist = (playlistId: string, videoId: string, fields: Partial<YouTubeVideo>) => {
    setState((prev) => ({
      ...prev,
      youtubePlaylists: prev.youtubePlaylists.map((p) => {
        if (p.id !== playlistId) return p;
        return {
          ...p,
          videos: p.videos.map((v) => (v.id === videoId ? { ...v, ...fields } : v)),
        };
      }),
    }));
  };

  const deleteVideoFromYouTubePlaylist = (playlistId: string, videoId: string) => {
    setState((prev) => ({
      ...prev,
      youtubePlaylists: prev.youtubePlaylists.map((p) => {
        if (p.id !== playlistId) return p;
        return {
          ...p,
          videos: p.videos.filter((v) => v.id !== videoId),
        };
      }),
    }));
  };

  const addResourceToYouTubePlaylist = (playlistId: string, resourceData: Omit<StudyResource, 'id'>) => {
    const newResource: StudyResource = { ...resourceData, id: crypto.randomUUID() };
    setState((prev) => ({
      ...prev,
      youtubePlaylists: prev.youtubePlaylists.map((p) => {
        if (p.id !== playlistId) return p;
        return {
          ...p,
          resources: [...p.resources, newResource],
        };
      }),
    }));
  };

  const updateResourceInYouTubePlaylist = (playlistId: string, resourceId: string, fields: Partial<StudyResource>) => {
    setState((prev) => ({
      ...prev,
      youtubePlaylists: prev.youtubePlaylists.map((p) => {
        if (p.id !== playlistId) return p;
        return {
          ...p,
          resources: p.resources.map((res) => {
            if (res.id === resourceId) {
              const updatedRes = { ...res, ...fields };
              updatedRes.completedUnits = Math.max(0, Math.min(updatedRes.totalUnits, updatedRes.completedUnits));
              if (updatedRes.completedUnits >= updatedRes.totalUnits) {
                updatedRes.status = 'Completed';
              } else if (updatedRes.completedUnits > 0) {
                updatedRes.status = 'In Progress';
              } else {
                updatedRes.status = 'Not Started';
              }
              return updatedRes;
            }
            return res;
          }),
        };
      }),
    }));
  };

  const deleteResourceFromYouTubePlaylist = (playlistId: string, resourceId: string) => {
    setState((prev) => ({
      ...prev,
      youtubePlaylists: prev.youtubePlaylists.map((p) => {
        if (p.id !== playlistId) return p;
        return {
          ...p,
          resources: p.resources.filter((res) => res.id !== resourceId),
        };
      }),
    }));
  };

  // Passive Learning operations
  const addPassiveLearningItem = (item: Omit<PassiveLearningItem, 'id'>) => {
    const newItem: PassiveLearningItem = {
      ...item,
      id: `pl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      lastStudiedAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      passiveLearningItems: [newItem, ...(prev.passiveLearningItems || [])],
    }));
  };

  const updatePassiveLearningItem = (
    id: string,
    updates: Partial<PassiveLearningItem>
  ) => {
    setState((prev) => ({
      ...prev,
      passiveLearningItems: (prev.passiveLearningItems || []).map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, ...updates };
        updated.completedUnits = Math.max(
          0,
          Math.min(updated.totalUnits, updated.completedUnits)
        );
        return updated;
      }),
    }));
  };

  const deletePassiveLearningItem = (id: string) => {
    setState((prev) => ({
      ...prev,
      passiveLearningItems: (prev.passiveLearningItems || []).filter(
        (i) => i.id !== id
      ),
    }));
  };

  const togglePassiveLearningRotation = (id: string) => {
    setState((prev) => ({
      ...prev,
      passiveLearningItems: (prev.passiveLearningItems || []).map((item) => {
        if (item.id !== id) return item;
        return { ...item, inRotation: !item.inRotation };
      }),
    }));
  };

  const incrementPassiveLearningProgress = (id: string, delta: number) => {
    setState((prev) => {
      let updatedItemTitle = '';
      let prevUnits = 0;
      let newUnits = 0;
      let unitLabel = 'units';

      const nextItems = (prev.passiveLearningItems || []).map((item) => {
        if (item.id !== id) return item;
        updatedItemTitle = item.title;
        prevUnits = item.completedUnits;
        newUnits = Math.max(
          0,
          Math.min(item.totalUnits, item.completedUnits + delta)
        );
        unitLabel = item.unitLabel;
        return {
          ...item,
          completedUnits: newUnits,
          lastStudiedAt: new Date().toISOString(),
        };
      });

      const logs = [...(prev.studyLogs || [])];
      if (delta > 0 && updatedItemTitle) {
        logs.unshift({
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          topicId: 'passive-learning',
          topicTitle: 'Passive CS Learning',
          resourceId: id,
          resourceTitle: updatedItemTitle,
          prevProgress: prevUnits,
          newProgress: newUnits,
          unitLabel,
          notes: `Completed ${delta} ${unitLabel} in ${updatedItemTitle} (Leisure Study)`,
        });
      }

      return {
        ...prev,
        passiveLearningItems: nextItems,
        studyLogs: logs,
      };
    });
  };

  const advancePassiveRotation = () => {
    setState((prev) => ({
      ...prev,
      passiveRotationIndex: (prev.passiveRotationIndex || 0) + 1,
    }));
  };

  const clearSampleData = () => {
    const sampleTopicIds = new Set(sampleTopics.map((s) => s.id));
    const sampleLogIds = new Set(sampleLogs.map((s) => s.id));
    const sampleProjectIds = new Set(sampleProjects.map((s) => s.id));
    const sampleSpecIds = new Set(sampleSpecializations.map((s) => s.id));
    const sampleJobIds = new Set(sampleIntroductions.map((s) => s.id));
    const sampleJournalIds = new Set(sampleInterviewJournal.map((s) => s.id));
    const sampleResumeIds = new Set(sampleResumeSavvy.map((s) => s.id));
    const sampleDsaIds = new Set(sampleDsaResources.map((s) => s.id));
    const sampleSystemIds = new Set(sampleSystemDesignNotes.map((s) => s.id));
    const sampleScopeIds = new Set(sampleScopeKnowledge.map((s) => s.id));
    const sampleYtIds = new Set(sampleYouTubePlaylists.map((s) => s.id));

    setState((prev) => {
      const nextState: AppState = {
        topics: prev.topics.filter((t) => !sampleTopicIds.has(t.id)),
        selectedTopicId: null,
        studyLogs: prev.studyLogs.filter((l) => !sampleLogIds.has(l.id)),
        projects: prev.projects.filter((p) => !sampleProjectIds.has(p.id)),
        specializations: prev.specializations.filter((s) => !sampleSpecIds.has(s.id)),
        selectedSpecializationId: null,
        jobIntroductions: prev.jobIntroductions.filter((j) => !sampleJobIds.has(j.id)),
        interviewJournal: prev.interviewJournal.filter((ij) => !sampleJournalIds.has(ij.id)),
        resumeSavvy: prev.resumeSavvy.filter((r) => !sampleResumeIds.has(r.id)),
        dsaResources: prev.dsaResources.filter((d) => !sampleDsaIds.has(d.id)),
        systemDesignNotes: prev.systemDesignNotes.filter((sn) => !sampleSystemIds.has(sn.id)),
        scopeKnowledge: prev.scopeKnowledge.filter((sk) => !sampleScopeIds.has(sk.id)),
        youtubePlaylists: prev.youtubePlaylists.filter((y) => !sampleYtIds.has(y.id)),
        passiveLearningItems: prev.passiveLearningItems || [],
        passiveRotationIndex: prev.passiveRotationIndex || 0,
      };
      return nextState;
    });
  };

  const resetAllData = () => {
    const emptyState: AppState = {
      topics: [],
      selectedTopicId: null,
      studyLogs: [],
      projects: [],
      specializations: [],
      selectedSpecializationId: null,
      jobIntroductions: [],
      interviewJournal: [],
      resumeSavvy: [],
      dsaResources: [],
      systemDesignNotes: [],
      scopeKnowledge: [],
      youtubePlaylists: [],
      passiveLearningItems: [],
      passiveRotationIndex: 0,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(emptyState));
    } catch (e) {
      console.error('Failed to clear localStorage', e);
    }
    setState(emptyState);
  };

  const replaceState = (newState: AppState) => {
    if (!newState) return;
    setState({
      topics: Array.isArray(newState.topics) ? newState.topics : [],
      selectedTopicId: newState.selectedTopicId ?? null,
      studyLogs: Array.isArray(newState.studyLogs) ? newState.studyLogs : [],
      projects: Array.isArray(newState.projects) ? newState.projects : [],
      specializations: Array.isArray(newState.specializations) ? newState.specializations : [],
      selectedSpecializationId: newState.selectedSpecializationId ?? null,
      jobIntroductions: Array.isArray(newState.jobIntroductions) ? newState.jobIntroductions : [],
      interviewJournal: Array.isArray(newState.interviewJournal) ? newState.interviewJournal : [],
      resumeSavvy: Array.isArray(newState.resumeSavvy) ? newState.resumeSavvy : [],
      dsaResources: Array.isArray(newState.dsaResources) ? newState.dsaResources : [],
      systemDesignNotes: Array.isArray(newState.systemDesignNotes) ? newState.systemDesignNotes : [],
      scopeKnowledge: Array.isArray(newState.scopeKnowledge) ? newState.scopeKnowledge : [],
      youtubePlaylists: Array.isArray(newState.youtubePlaylists) ? newState.youtubePlaylists : [],
      passiveLearningItems: Array.isArray(newState.passiveLearningItems) ? newState.passiveLearningItems : [],
      passiveRotationIndex: typeof newState.passiveRotationIndex === 'number' ? newState.passiveRotationIndex : 0,
    });
  };

  return {
    state,
    replaceState,
    clearSampleData,
    setSelectedTopicId,
    setSelectedSpecializationId,
    // Topic operations
    addTopic,
    updateTopic,
    deleteTopic,
    // Resource operations
    addResourceToTopic,
    updateResourceInTopic,
    deleteResourceFromTopic,
    setResourceAsFocus,
    // Log operations
    addStudyLogAndProgress,
    deleteStudyLog,
    // Project operations
    addProject,
    updateProject,
    deleteProject,
    // Specialization operations
    addSpecialization,
    updateSpecialization,
    deleteSpecialization,
    addResourceToSpecialization,
    updateResourceInSpecialization,
    deleteResourceFromSpecialization,
    // Job Prep operations
    addJobIntroduction,
    updateJobIntroduction,
    deleteJobIntroduction,
    addInterviewJournal,
    updateInterviewJournal,
    deleteInterviewJournal,
    addResumeSavvy,
    updateResumeSavvy,
    deleteResumeSavvy,
    addDsaResource,
    updateDsaResource,
    deleteDsaResource,
    setDsaResourceAsFocus,
    addSystemDesignNote,
    updateSystemDesignNote,
    deleteSystemDesignNote,
    addScopeKnowledge,
    updateScopeKnowledge,
    deleteScopeKnowledge,
    // YouTube operations
    addYouTubePlaylist,
    updateYouTubePlaylist,
    deleteYouTubePlaylist,
    deactivateYouTubePlaylist,
    addVideoToYouTubePlaylist,
    updateVideoInYouTubePlaylist,
    deleteVideoFromYouTubePlaylist,
    addResourceToYouTubePlaylist,
    updateResourceInYouTubePlaylist,
    deleteResourceFromYouTubePlaylist,
    // Passive Learning operations
    addPassiveLearningItem,
    updatePassiveLearningItem,
    deletePassiveLearningItem,
    togglePassiveLearningRotation,
    incrementPassiveLearningProgress,
    advancePassiveRotation,
    resetAllData,
  };
}
