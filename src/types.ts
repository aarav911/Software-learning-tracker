/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface StudyResource {
  id: string;
  title: string;
  type: 'Book' | 'Course/Playlist' | 'Documentation' | 'Article/Paper' | 'Specification' | 'Repo/Tool' | 'Other';
  creator: string;
  completedUnits?: number;
  totalUnits?: number;
  unitLabel?: string; // e.g. "chapters", "videos", "modules", "pages", "units"
  isCurrentFocus?: boolean;
  status?: 'Not Started' | 'In Progress' | 'Completed';
  priority?: 'Low' | 'Medium' | 'High';
  notes: string;
  url?: string;
}

export interface StudyLog {
  id: string;
  timestamp: string; // ISO String
  topicId: string;
  topicTitle: string;
  resourceId: string;
  resourceTitle: string;
  prevProgress: number;
  newProgress: number;
  unitLabel: string;
  notes: string; // e.g., "Completed chapters 3 to 4"
  durationMinutes?: number; // Optional study duration
}

export interface Topic {
  id: string;
  title: string; // e.g. "Rust Programming Language", "Distributed Systems", "PostgreSQL Internals"
  category: 'Language' | 'Subject' | 'Topic' | 'Framework' | 'Other';
  dateInitiated: string;
  description: string;
  resources: StudyResource[];
  notes: string;
}

export interface ProjectQuestion {
  id: string;
  question: string;
  status: 'Open' | 'Researching' | 'Answered' | 'Blocked';
  priority: 'High' | 'Medium' | 'Low';
  category?: 'Architecture' | 'Performance' | 'API / Protocol' | 'Database' | 'General';
  answer: string;
  url?: string; // Optional reference link
  updatedAt?: string;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  isCompleted: boolean;
  notes?: string;
}

export interface Project {
  id: string;
  title: string;
  tagline: string;
  githubRepo: string;
  docUrl?: string; // Link to Google Doc, PRD, or living research doc
  architectureDiagramUrl?: string; // Link to Figma, Miro, or diagram
  status: 'Idea' | 'Just Started' | 'Halfway Done' | 'Completed';
  techStack: string[];
  retrospectiveLog: string;
  projectType?: 'Reconstruction' | 'Original / Novel' | 'General';
  noveltySpecs?: {
    isNotGenericCrud: boolean;
    architectureNovelty: string;
    qualityGuarantees: string;
  };
  resources?: StudyResource[];
  questions?: ProjectQuestion[];
  milestones?: ProjectMilestone[];
  isArchived?: boolean;
}

export interface Specialization {
  id: string;
  title: string;
  category: 'System' | 'Theory' | 'Application' | 'Specialty' | 'Other';
  dateInitiated: string;
  description: string;
  resources: StudyResource[];
  notes: string;
}

export interface JobIntroduction {
  id: string;
  title: string;
  roleType: string;
  content: string;
}

export interface InterviewJournal {
  id: string;
  type: 'Q&A' | 'STAR/Situation';
  question: string;
  answer: string;
}

export interface ResumeSavvy {
  id: string;
  title: string;
  context: string;
  details: string;
}

export interface SystemDesignNote {
  id: string;
  title: string;
  body: string;
}

export interface ScopeKnowledge {
  id: string;
  domain: string;
  topic: string;
  level: 'Core Knowledge' | 'Deep Expertise' | 'Mastered' | 'Familiar';
  notes: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  scope: string;
  notes?: string;
  createdAt: string;
}

export interface YouTubePlaylist {
  id: string;
  title: string;
  description: string;
  topic: string;
  isActive: boolean;
  resources: StudyResource[];
  videos: YouTubeVideo[];
  createdAt: string;
}

export interface PassiveLearningItem {
  id: string;
  title: string;
  type: 'Video Playlist' | 'Video Course' | 'Book' | 'Article/Paper';
  creator?: string;
  url?: string;
  category: string;
  totalUnits: number;
  completedUnits: number;
  unitLabel: 'videos' | 'chapters' | 'units';
  inRotation: boolean;
  notes?: string;
  lastStudiedAt?: string;
}

export interface AppState {
  topics: Topic[];
  selectedTopicId: string | null;
  studyLogs: StudyLog[];
  projects: Project[];
  specializations: Specialization[];
  selectedSpecializationId: string | null;
  jobIntroductions: JobIntroduction[];
  interviewJournal: InterviewJournal[];
  resumeSavvy: ResumeSavvy[];
  dsaResources: StudyResource[];
  systemDesignNotes: SystemDesignNote[];
  scopeKnowledge: ScopeKnowledge[];
  youtubePlaylists: YouTubePlaylist[];
  passiveLearningItems: PassiveLearningItem[];
  passiveRotationIndex?: number;
  lastModifiedAt?: string;
}

