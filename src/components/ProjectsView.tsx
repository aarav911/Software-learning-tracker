/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Project, StudyResource, ProjectQuestion, ProjectMilestone } from '../types';
import { ConfirmModal } from './ConfirmModal';
import {
  Code,
  Github,
  Plus,
  Trash2,
  Edit2,
  Bookmark,
  ExternalLink,
  Save,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Sparkles,
  FileText,
  Search,
  X,
  Filter,
  HelpCircle,
  BookOpen,
  Table,
  ListCheck,
  Copy,
  Check,
  ArrowUpRight,
  FileSpreadsheet,
  Layers,
  MessageSquare,
  ChevronRight,
  FolderGit2,
  Link2,
  Archive,
  ArchiveRestore,
  CheckSquare,
  Square,
} from 'lucide-react';

interface ProjectsViewProps {
  projects: Project[];
  onAddProject: (project: Omit<Project, 'id'>) => Project | void;
  onUpdateProject: (id: string, project: Partial<Project>) => void;
  onDeleteProject: (id: string) => void;
}

export function ProjectsView({
  projects,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
}: ProjectsViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Active Workspace Tab for selected project
  const [workspaceTab, setWorkspaceTab] = useState<'questions' | 'resources' | 'milestones' | 'journal'>('questions');

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Reconstruction' | 'Original / Novel' | 'General'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | Project['status']>('All');
  const [archiveFilter, setArchiveFilter] = useState<'Active' | 'Archived' | 'All'>('Active');

  // Deletion state
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // New Project Form Fields
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [githubRepo, setGithubRepo] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [architectureDiagramUrl, setArchitectureDiagramUrl] = useState('');
  const [status, setStatus] = useState<Project['status']>('Idea');
  const [techStackInput, setTechStackInput] = useState('');
  const [retrospectiveLog, setRetrospectiveLog] = useState('');
  const [projectType, setProjectType] = useState<Project['projectType']>('Reconstruction');
  const [isNotGenericCrud, setIsNotGenericCrud] = useState(false);
  const [architectureNovelty, setArchitectureNovelty] = useState('');
  const [qualityGuarantees, setQualityGuarantees] = useState('');
  const [validationError, setValidationError] = useState('');

  // Editing Project details modal/inline state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTagline, setEditTagline] = useState('');
  const [editGithubRepo, setEditGithubRepo] = useState('');
  const [editDocUrl, setEditDocUrl] = useState('');
  const [editArchitectureDiagramUrl, setEditArchitectureDiagramUrl] = useState('');
  const [editStatus, setEditStatus] = useState<Project['status']>('Idea');
  const [editTechStack, setEditTechStack] = useState('');
  const [editProjectType, setEditProjectType] = useState<Project['projectType']>('Reconstruction');
  const [editIsNotGenericCrud, setEditIsNotGenericCrud] = useState(false);
  const [editArchitectureNovelty, setEditArchitectureNovelty] = useState('');
  const [editQualityGuarantees, setEditQualityGuarantees] = useState('');
  const [editValidationError, setEditValidationError] = useState('');

  // Quick link editor overlay state inside workspace drawer
  const [showQuickLinksEdit, setShowQuickLinksEdit] = useState(false);
  const [quickRepoInput, setQuickRepoInput] = useState('');
  const [quickDocInput, setQuickDocInput] = useState('');
  const [quickDiagramInput, setQuickDiagramInput] = useState('');

  // --- RESEARCH QUESTIONS STATE ---
  const [questionFilter, setQuestionFilter] = useState<'All' | 'Open' | 'Researching' | 'Answered' | 'Blocked'>('All');
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionCategory, setNewQuestionCategory] = useState<ProjectQuestion['category']>('Architecture');
  const [newQuestionPriority, setNewQuestionPriority] = useState<ProjectQuestion['priority']>('High');
  const [newQuestionAnswer, setNewQuestionAnswer] = useState('');
  const [newQuestionUrl, setNewQuestionUrl] = useState('');

  // Expanded question for editing answer
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  // --- RESOURCES & EXCEL IMPORTER STATE ---
  const [showAddResourceModal, setShowAddResourceModal] = useState(false);
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);
  const [resourceTypeFilter, setResourceTypeFilter] = useState<'All' | StudyResource['type']>('All');
  const [resourceSearchQuery, setResourceSearchQuery] = useState('');
  const [copiedResId, setCopiedResId] = useState<string | null>(null);

  const [newResTitle, setNewResTitle] = useState('');
  const [newResType, setNewResType] = useState<StudyResource['type']>('Documentation');
  const [newResCreator, setNewResCreator] = useState('');
  const [newResPriority, setNewResPriority] = useState<StudyResource['priority']>('High');
  const [newResUrl, setNewResUrl] = useState('');
  const [newResNotes, setNewResNotes] = useState('');

  // Excel Batch Importer Modal State
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [rawExcelInput, setRawExcelInput] = useState('');
  const [parsedPreview, setParsedPreview] = useState<StudyResource[]>([]);
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  // --- MILESTONE STATE ---
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneNotes, setNewMilestoneNotes] = useState('');
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [editMilestoneTitle, setEditMilestoneTitle] = useState('');
  const [editMilestoneNotes, setEditMilestoneNotes] = useState('');

  const activeProjectsCount = projects.filter((p) => !p.isArchived).length;
  const archivedProjectsCount = projects.filter((p) => !!p.isArchived).length;

  const filteredProjects = projects.filter((proj) => {
    const isArchived = !!proj.isArchived;
    if (archiveFilter === 'Active' && isArchived) return false;
    if (archiveFilter === 'Archived' && !isArchived) return false;

    const matchesSearch =
      !searchQuery.trim() ||
      proj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (proj.docUrl && proj.docUrl.toLowerCase().includes(searchQuery.toLowerCase())) ||
      proj.techStack.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = typeFilter === 'All' || (proj.projectType || 'Reconstruction') === typeFilter;
    const matchesStatus = statusFilter === 'All' || proj.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || null;

  // Handle new project submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!title.trim() || !tagline.trim()) {
      setValidationError('Title and tagline are required.');
      return;
    }

    const techStack = techStackInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const isNovel = projectType === 'Original / Novel';
    const finalNovelty = isNovel
      ? architectureNovelty.trim() || `Custom system architecture for ${title.trim()}: ${tagline.trim()}`
      : '';
    const finalGuarantees = isNovel
      ? qualityGuarantees.trim() || 'Sub-millisecond latency, high concurrent throughput, and deterministic durability targets.'
      : '';

    const created = onAddProject({
      title: title.trim(),
      tagline: tagline.trim(),
      githubRepo: githubRepo.trim(),
      docUrl: docUrl.trim(),
      architectureDiagramUrl: architectureDiagramUrl.trim(),
      status,
      techStack,
      projectType,
      noveltySpecs: isNovel
        ? {
            isNotGenericCrud: true,
            architectureNovelty: finalNovelty,
            qualityGuarantees: finalGuarantees,
          }
        : undefined,
      retrospectiveLog:
        retrospectiveLog.trim() ||
        `# Retrospective: ${title}\n\n## Core Decisions\n- \n\n## Systemic Hurdles Overcome\n- \n\n## Low-level Lessons Learned\n- `,
      resources: [],
      questions: [],
      milestones: [],
    });

    if (created && created.id) {
      setSelectedProjectId(created.id);
      setWorkspaceTab('questions');
    }

    setSearchQuery('');
    setTypeFilter('All');
    setStatusFilter('All');
    setArchiveFilter('Active');

    setTitle('');
    setTagline('');
    setGithubRepo('');
    setDocUrl('');
    setArchitectureDiagramUrl('');
    setStatus('Idea');
    setTechStackInput('');
    setRetrospectiveLog('');
    setProjectType('Reconstruction');
    setIsNotGenericCrud(false);
    setArchitectureNovelty('');
    setQualityGuarantees('');
    setValidationError('');
    setShowAddModal(false);
  };

  const startEditProject = (p: Project) => {
    setEditingId(p.id);
    setEditTitle(p.title);
    setEditTagline(p.tagline);
    setEditGithubRepo(p.githubRepo);
    setEditDocUrl(p.docUrl || '');
    setEditArchitectureDiagramUrl(p.architectureDiagramUrl || '');
    setEditStatus(p.status);
    setEditTechStack(p.techStack.join(', '));
    setEditProjectType(p.projectType || 'Reconstruction');
    setEditIsNotGenericCrud(p.noveltySpecs?.isNotGenericCrud || false);
    setEditArchitectureNovelty(p.noveltySpecs?.architectureNovelty || '');
    setEditQualityGuarantees(p.noveltySpecs?.qualityGuarantees || '');
    setEditValidationError('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setEditValidationError('');

    if (!editingId || !editTitle.trim() || !editTagline.trim()) {
      setEditValidationError('Title and tagline are required.');
      return;
    }

    const techStack = editTechStack
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const isNovel = editProjectType === 'Original / Novel';
    const finalNovelty = isNovel
      ? editArchitectureNovelty.trim() || `Custom system architecture for ${editTitle.trim()}: ${editTagline.trim()}`
      : '';
    const finalGuarantees = isNovel
      ? editQualityGuarantees.trim() || 'Sub-millisecond latency, high concurrent throughput, and deterministic durability targets.'
      : '';

    onUpdateProject(editingId, {
      title: editTitle.trim(),
      tagline: editTagline.trim(),
      githubRepo: editGithubRepo.trim(),
      docUrl: editDocUrl.trim(),
      architectureDiagramUrl: editArchitectureDiagramUrl.trim(),
      status: editStatus,
      techStack,
      projectType: editProjectType,
      noveltySpecs: isNovel
        ? {
            isNotGenericCrud: true,
            architectureNovelty: finalNovelty,
            qualityGuarantees: finalGuarantees,
          }
        : undefined,
    });

    setEditingId(null);
  };

  // --- RESEARCH QUESTIONS HANDLERS ---
  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !newQuestionText.trim()) return;

    const newQ: ProjectQuestion = {
      id: crypto.randomUUID(),
      question: newQuestionText.trim(),
      category: newQuestionCategory,
      priority: newQuestionPriority,
      status: 'Open',
      answer: newQuestionAnswer.trim(),
      url: newQuestionUrl.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    const currentQuestions = selectedProject.questions || [];
    onUpdateProject(selectedProject.id, {
      questions: [newQ, ...currentQuestions],
    });

    setNewQuestionText('');
    setNewQuestionAnswer('');
    setNewQuestionUrl('');
    setShowAddQuestionModal(false);
  };

  const handleUpdateQuestionStatus = (qId: string, nextStatus: ProjectQuestion['status']) => {
    if (!selectedProject) return;
    const updated = (selectedProject.questions || []).map((q) =>
      q.id === qId ? { ...q, status: nextStatus, updatedAt: new Date().toISOString() } : q
    );
    onUpdateProject(selectedProject.id, { questions: updated });
  };

  const handleUpdateQuestionAnswer = (qId: string, newAnswer: string) => {
    if (!selectedProject) return;
    const updated = (selectedProject.questions || []).map((q) =>
      q.id === qId ? { ...q, answer: newAnswer, updatedAt: new Date().toISOString() } : q
    );
    onUpdateProject(selectedProject.id, { questions: updated });
  };

  const handleDeleteQuestion = (qId: string) => {
    if (!selectedProject) return;
    const updated = (selectedProject.questions || []).filter((q) => q.id !== qId);
    onUpdateProject(selectedProject.id, { questions: updated });
  };

  // --- RESOURCES HANDLERS ---
  const handleSaveResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !newResTitle.trim()) return;

    const currentResources = selectedProject.resources || [];

    if (editingResourceId) {
      // Update existing resource
      const updated = currentResources.map((r) =>
        r.id === editingResourceId
          ? {
              ...r,
              title: newResTitle.trim(),
              type: newResType,
              creator: newResCreator.trim() || 'Reference Material',
              priority: newResPriority,
              url: newResUrl.trim() || undefined,
              notes: newResNotes.trim(),
            }
          : r
      );
      onUpdateProject(selectedProject.id, { resources: updated });
    } else {
      // Add new resource
      const newRes: StudyResource = {
        id: crypto.randomUUID(),
        title: newResTitle.trim(),
        type: newResType,
        creator: newResCreator.trim() || 'Reference Material',
        priority: newResPriority,
        notes: newResNotes.trim(),
        url: newResUrl.trim() || undefined,
      };
      onUpdateProject(selectedProject.id, {
        resources: [newRes, ...currentResources],
      });
    }

    resetResourceModalState();
  };

  const startEditResource = (res: StudyResource) => {
    setEditingResourceId(res.id);
    setNewResTitle(res.title);
    setNewResType(res.type);
    setNewResCreator(res.creator || '');
    setNewResPriority(res.priority || 'High');
    setNewResUrl(res.url || '');
    setNewResNotes(res.notes || '');
    setShowAddResourceModal(true);
  };

  const resetResourceModalState = () => {
    setEditingResourceId(null);
    setNewResTitle('');
    setNewResType('Documentation');
    setNewResCreator('');
    setNewResPriority('High');
    setNewResUrl('');
    setNewResNotes('');
    setShowAddResourceModal(false);
  };

  const handleDeleteResource = (resId: string) => {
    if (!selectedProject) return;
    const updated = (selectedProject.resources || []).filter((r) => r.id !== resId);
    onUpdateProject(selectedProject.id, { resources: updated });
  };

  const handleCopyResourceLink = (res: StudyResource) => {
    if (!res.url) return;
    const fullUrl = res.url.startsWith('http') ? res.url : `https://${res.url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedResId(res.id);
    setTimeout(() => setCopiedResId(null), 2000);
  };

  // --- EXCEL / TSV / CSV PARSER FOR IMPORTANT RESOURCES ---
  const parseRawExcel = (text: string): StudyResource[] => {
    const lines = text.trim().split('\n').filter((l) => l.trim().length > 0);
    const results: StudyResource[] = [];

    for (const line of lines) {
      // Ignore header row if detected
      if (
        line.toLowerCase().startsWith('title') ||
        line.toLowerCase().startsWith('resource') ||
        line.toLowerCase().startsWith('name')
      ) {
        continue;
      }

      let delimiter = '\t';
      if (line.includes('\t')) delimiter = '\t';
      else if (line.includes('|')) delimiter = '|';
      else if (line.includes(',')) delimiter = ',';

      const parts = line.split(delimiter).map((p) => p.trim());
      if (parts.length === 0 || !parts[0]) continue;

      const rawTitle = parts[0].replace(/^\||\|$/g, '').trim();
      if (!rawTitle) continue;

      const rawType = parts[1] || 'Documentation';
      let type: StudyResource['type'] = 'Documentation';
      if (/spec|rfc|standard/i.test(rawType)) type = 'Specification';
      else if (/repo|github|tool|code/i.test(rawType)) type = 'Repo/Tool';
      else if (/course|playlist|video/i.test(rawType)) type = 'Course/Playlist';
      else if (/article|paper|pdf/i.test(rawType)) type = 'Article/Paper';
      else if (/doc|wiki|guide/i.test(rawType)) type = 'Documentation';
      else if (/book/i.test(rawType)) type = 'Book';
      else type = 'Other';

      const creator = parts[2] || 'Official Specs / Author';

      const rawPriority = parts[3] || '';
      let priority: StudyResource['priority'] = 'High';
      if (/low|reference|optional/i.test(rawPriority)) priority = 'Low';
      else if (/med|recommended|important/i.test(rawPriority)) priority = 'Medium';
      else priority = 'High';

      let rawUrl = parts[4] || '';
      let notes = parts[5] || '';

      // Fallback if priority field was skipped (URL in col 4)
      if (rawPriority.includes('http') || rawPriority.includes('www.')) {
        rawUrl = rawPriority;
        notes = parts[4] || '';
        priority = 'High';
      }

      const formattedUrl = rawUrl.startsWith('http') ? rawUrl : rawUrl ? `https://${rawUrl}` : undefined;

      results.push({
        id: crypto.randomUUID(),
        title: rawTitle,
        type,
        creator,
        priority,
        notes,
        url: formattedUrl,
      });
    }

    return results;
  };

  const handleParseExcelChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setRawExcelInput(text);
    const parsed = parseRawExcel(text);
    setParsedPreview(parsed);
  };

  const handleConfirmExcelImport = () => {
    if (!selectedProject || parsedPreview.length === 0) return;
    const current = selectedProject.resources || [];
    onUpdateProject(selectedProject.id, {
      resources: [...parsedPreview, ...current],
    });
    setRawExcelInput('');
    setParsedPreview([]);
    setShowExcelModal(false);
  };

  const copyExcelTemplate = () => {
    const template = `Title\tType\tCreator\tPriority\tURL\tNotes
Designing Data-Intensive Applications\tBook\tMartin Kleppmann\tEssential\thttps://dataintensive.net\tRead Chapter 3 on Storage Engines & LSM Trees
RocksDB Leveled Compaction Wiki\tDocumentation\tMeta Engineering\tEssential\thttps://github.com/facebook/rocksdb/wiki\tCompaction benchmarks and block cache tuning
POSIX File System I/O Manual\tSpecification\tIEEE / Open Group\tRecommended\thttps://pubs.opengroup.org\tO_DIRECT, fsync, and pwrite64 semantics
Raft Consensus Paper\tArticle/Paper\tDiego Ongaro\tRecommended\thttps://raft.github.io\tSection 5 on Log Replication and Leader Election`;

    navigator.clipboard.writeText(template);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  // --- MILESTONES HANDLERS ---
  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !newMilestoneTitle.trim()) return;

    const newM: ProjectMilestone = {
      id: crypto.randomUUID(),
      title: newMilestoneTitle.trim(),
      notes: newMilestoneNotes.trim() || undefined,
      isCompleted: false,
    };

    const current = selectedProject.milestones || [];
    onUpdateProject(selectedProject.id, {
      milestones: [...current, newM],
    });

    setNewMilestoneTitle('');
    setNewMilestoneNotes('');
  };

  const handleToggleMilestone = (mId: string) => {
    if (!selectedProject) return;
    const current = selectedProject.milestones || [];
    const updated = current.map((m) =>
      m.id === mId ? { ...m, isCompleted: !m.isCompleted } : m
    );
    onUpdateProject(selectedProject.id, { milestones: updated });
  };

  const handleDeleteMilestone = (mId: string) => {
    if (!selectedProject) return;
    const current = selectedProject.milestones || [];
    const updated = current.filter((m) => m.id !== mId);
    onUpdateProject(selectedProject.id, { milestones: updated });
  };

  const startEditMilestone = (m: ProjectMilestone) => {
    setEditingMilestoneId(m.id);
    setEditMilestoneTitle(m.title);
    setEditMilestoneNotes(m.notes || '');
  };

  const handleSaveMilestoneEdit = (mId: string) => {
    if (!selectedProject || !editMilestoneTitle.trim()) return;
    const current = selectedProject.milestones || [];
    const updated = current.map((m) =>
      m.id === mId
        ? { ...m, title: editMilestoneTitle.trim(), notes: editMilestoneNotes.trim() || undefined }
        : m
    );
    onUpdateProject(selectedProject.id, { milestones: updated });
    setEditingMilestoneId(null);
  };

  const handleAddPresetMilestones = () => {
    if (!selectedProject) return;
    const presets: ProjectMilestone[] = [
      { id: crypto.randomUUID(), title: 'Architecture Specification & System Diagram', isCompleted: false, notes: 'Document system topology, data flow, and protocol boundaries' },
      { id: crypto.randomUUID(), title: 'Data Model & Schema Definition', isCompleted: false, notes: 'Define storage structures, entities, indexes, or serialization spec' },
      { id: crypto.randomUUID(), title: 'Core Processing Engine / Protocol API', isCompleted: false, notes: 'Build key algorithmic components, state machine, and service handlers' },
      { id: crypto.randomUUID(), title: 'Unit & Benchmark Test Suite', isCompleted: false, notes: 'Implement stress tests, performance benchmarks, and edge-case verification' },
      { id: crypto.randomUUID(), title: 'PRD Documentation & Retrospective Log', isCompleted: false, notes: 'Document lessons learned, trade-offs, and design hurdles' },
    ];
    const current = selectedProject.milestones || [];
    onUpdateProject(selectedProject.id, {
      milestones: [...current, ...presets],
    });
  };

  const handleMarkAllMilestonesComplete = (completed: boolean) => {
    if (!selectedProject) return;
    const current = selectedProject.milestones || [];
    const updated = current.map((m) => ({ ...m, isCompleted: completed }));
    onUpdateProject(selectedProject.id, { milestones: updated });
  };

  const handleClearCompletedMilestones = () => {
    if (!selectedProject) return;
    const current = selectedProject.milestones || [];
    const updated = current.filter((m) => !m.isCompleted);
    onUpdateProject(selectedProject.id, { milestones: updated });
  };

  const handleToggleArchiveProject = (projId: string, currentIsArchived?: boolean) => {
    onUpdateProject(projId, { isArchived: !currentIsArchived });
  };

  const getStatusBadgeClass = (s: Project['status']) => {
    switch (s) {
      case 'Idea':
        return 'border-[#27272a] text-[#71717a] bg-[#09090b]';
      case 'Just Started':
        return 'border-blue-500/20 text-blue-400 bg-blue-950/10';
      case 'Halfway Done':
        return 'border-amber-500/20 text-amber-400 bg-amber-950/10';
      case 'Completed':
        return 'border-emerald-500/20 text-emerald-400 bg-emerald-950/10';
    }
  };

  // Helper stats for overview
  const totalQuestionsCount = projects.reduce((acc, p) => acc + (p.questions?.length || 0), 0);
  const totalOpenQuestions = projects.reduce(
    (acc, p) => acc + (p.questions?.filter((q) => q.status === 'Open' || q.status === 'Researching').length || 0),
    0
  );
  const totalResourcesCount = projects.reduce((acc, p) => acc + (p.resources?.length || 0), 0);

  return (
    <div className="space-y-6" id="projects-view-container">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272a] pb-5">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#fafafa] flex items-center gap-2">
            <Code className="h-5 w-5 text-blue-500" />
            Projects, Systems & PRD Workspaces
          </h1>
          <p className="text-[#a1a1aa] text-xs mt-1 max-w-2xl">
            Engineer complex systems from first principles. Link repositories, PRDs, research problems, and batch-import study resources from Excel/Sheets.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded text-xs transition shadow-sm cursor-pointer shrink-0"
        >
          <Plus className="h-3.5 w-3.5 stroke-[3px]" />
          New System Project
        </button>
      </div>

      {/* Statistics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#18181b] border border-[#27272a] p-4 rounded">
          <span className="text-[9px] font-mono text-[#71717a] uppercase font-bold tracking-widest">Total Projects</span>
          <span className="text-xl font-bold text-[#fafafa] block mt-1 font-mono">{projects.length}</span>
        </div>
        <div className="bg-[#18181b] border border-[#27272a] p-4 rounded">
          <span className="text-[9px] font-mono text-[#71717a] uppercase font-bold tracking-widest">Open Research Problems</span>
          <span className="text-xl font-bold text-amber-400 block mt-1 font-mono">
            {totalOpenQuestions} <span className="text-xs text-[#71717a] font-normal">/ {totalQuestionsCount}</span>
          </span>
        </div>
        <div className="bg-[#18181b] border border-[#27272a] p-4 rounded">
          <span className="text-[9px] font-mono text-[#71717a] uppercase font-bold tracking-widest">Project Resources</span>
          <span className="text-xl font-bold text-blue-400 block mt-1 font-mono">{totalResourcesCount}</span>
        </div>
        <div className="bg-[#18181b] border border-[#27272a] p-4 rounded">
          <span className="text-[9px] font-mono text-[#71717a] uppercase font-bold tracking-widest">Completed Systems</span>
          <span className="text-xl font-bold text-emerald-500 block mt-1 font-mono">
            {projects.filter((p) => p.status === 'Completed').length}
          </span>
        </div>
      </div>

      {/* Main Grid: Projects List (Left) & Project Overpowered Workspace Drawer (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Projects Cards List */}
        <div className={`${selectedProject ? 'xl:col-span-5' : 'xl:col-span-12'} space-y-4 transition-all duration-300`}>
          {projects.length > 0 && (
            <div className="bg-[#18181b] border border-[#27272a] rounded p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="h-3.5 w-3.5 text-[#71717a] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects, PRDs, stack..."
                  className="w-full bg-[#09090b] border border-[#27272a] focus:border-blue-500 rounded pl-8 pr-8 py-1.5 text-xs text-white placeholder-[#71717a] focus:outline-none font-mono"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {/* Active / Archived / All Toggle */}
                <div className="flex items-center bg-[#09090b] p-0.5 rounded border border-[#27272a] mr-1">
                  <button
                    type="button"
                    onClick={() => setArchiveFilter('Active')}
                    className={`px-2 py-0.5 text-[10px] font-mono rounded transition cursor-pointer ${
                      archiveFilter === 'Active'
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-[#a1a1aa] hover:text-white'
                    }`}
                  >
                    Active ({activeProjectsCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setArchiveFilter('Archived')}
                    className={`px-2 py-0.5 text-[10px] font-mono rounded transition cursor-pointer ${
                      archiveFilter === 'Archived'
                        ? 'bg-amber-600 text-white font-bold'
                        : 'text-[#a1a1aa] hover:text-white'
                    }`}
                  >
                    Archived ({archivedProjectsCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setArchiveFilter('All')}
                    className={`px-2 py-0.5 text-[10px] font-mono rounded transition cursor-pointer ${
                      archiveFilter === 'All'
                        ? 'bg-[#27272a] text-white font-bold'
                        : 'text-[#a1a1aa] hover:text-white'
                    }`}
                  >
                    All ({projects.length})
                  </button>
                </div>

                <Filter className="h-3 w-3 text-[#71717a]" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="bg-[#09090b] border border-[#27272a] rounded px-2 py-1 text-xs text-[#a1a1aa] focus:outline-none focus:border-blue-500 cursor-pointer font-mono"
                >
                  <option value="All">All Types</option>
                  <option value="Reconstruction">Reconstruction</option>
                  <option value="Original / Novel">Original / Novel</option>
                  <option value="General">General</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-[#09090b] border border-[#27272a] rounded px-2 py-1 text-xs text-[#a1a1aa] focus:outline-none focus:border-blue-500 cursor-pointer font-mono"
                >
                  <option value="All">All Statuses</option>
                  <option value="Idea">Idea</option>
                  <option value="Just Started">Just Started</option>
                  <option value="Halfway Done">Halfway Done</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          )}

          {projects.length === 0 ? (
            <div className="bg-[#18181b]/50 border border-dashed border-[#27272a] rounded p-12 text-center">
              <FileCode className="h-10 w-10 text-[#52525b] mx-auto mb-4" />
              <h3 className="font-display font-medium text-sm text-[#fafafa]">No Projects Logged</h3>
              <p className="text-[#a1a1aa] text-xs max-w-sm mx-auto mt-2">
                Log a new project to connect your GitHub repo, Google Doc PRD, research questions, and required study materials.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-6 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded text-xs transition cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 stroke-[3px]" />
                Log Your First Project
              </button>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="bg-[#18181b]/40 border border-[#27272a] rounded p-8 text-center text-[#a1a1aa] text-xs space-y-2">
              <p>No projects match your current filters.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setTypeFilter('All');
                  setStatusFilter('All');
                }}
                className="text-blue-400 underline hover:text-blue-300 font-mono text-[11px]"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className={`grid grid-cols-1 ${selectedProject ? 'md:grid-cols-1' : 'md:grid-cols-2'} gap-4`}>
              {filteredProjects.map((proj) => {
                const isSelected = proj.id === selectedProjectId;
                const isEditing = proj.id === editingId;

                const openQuestionsCount = proj.questions?.filter((q) => q.status === 'Open' || q.status === 'Researching').length || 0;
                const totalQuestions = proj.questions?.length || 0;
                const resourcesCount = proj.resources?.length || 0;
                const completedMilestones = proj.milestones?.filter((m) => m.isCompleted).length || 0;
                const totalMilestones = proj.milestones?.length || 0;

                if (isEditing) {
                  return (
                    <form
                      key={proj.id}
                      onSubmit={handleSaveEdit}
                      className="bg-[#18181b] border border-blue-500/50 rounded p-5 space-y-3 col-span-1 md:col-span-2"
                    >
                      <span className="font-mono text-[9px] text-blue-400 font-bold uppercase tracking-widest block">
                        EDITING {editProjectType?.toUpperCase() || 'PROJECT'}
                      </span>

                      {editValidationError && (
                        <div className="text-red-500 text-[10px] font-mono font-bold uppercase bg-red-950/25 p-2.5 border border-red-900/30 rounded">
                          ERROR: {editValidationError}
                        </div>
                      )}

                      <div>
                        <label className="block text-[9px] text-[#71717a] font-bold uppercase mb-0.5">Project Title</label>
                        <input
                          type="text"
                          required
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full bg-[#09090b] border border-[#27272a] rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-[#71717a] font-bold uppercase mb-0.5">Tagline / Vision</label>
                        <input
                          type="text"
                          required
                          value={editTagline}
                          onChange={(e) => setEditTagline(e.target.value)}
                          className="w-full bg-[#09090b] border border-[#27272a] rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] text-[#71717a] font-bold uppercase mb-0.5">GitHub Repo Link</label>
                          <input
                            type="text"
                            value={editGithubRepo}
                            onChange={(e) => setEditGithubRepo(e.target.value)}
                            className="w-full bg-[#09090b] border border-[#27272a] rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500 font-mono text-[11px]"
                            placeholder="https://github.com/user/repo"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-[#71717a] font-bold uppercase mb-0.5">Google Doc / PRD Link</label>
                          <input
                            type="text"
                            value={editDocUrl}
                            onChange={(e) => setEditDocUrl(e.target.value)}
                            className="w-full bg-[#09090b] border border-[#27272a] rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500 font-mono text-[11px]"
                            placeholder="https://docs.google.com/document/d/..."
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] text-[#71717a] font-bold uppercase mb-0.5">Project Type</label>
                          <select
                            value={editProjectType}
                            onChange={(e) => setEditProjectType(e.target.value as Project['projectType'])}
                            className="w-full bg-[#09090b] border border-[#27272a] rounded px-2.5 py-1 text-xs text-[#fafafa] focus:outline-none focus:border-blue-500"
                          >
                            <option value="Reconstruction">Reconstruction</option>
                            <option value="Original / Novel">Original / Novel</option>
                            <option value="General">General</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9px] text-[#71717a] font-bold uppercase mb-0.5">Status</label>
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value as Project['status'])}
                            className="w-full bg-[#09090b] border border-[#27272a] rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                          >
                            <option value="Idea">Idea</option>
                            <option value="Just Started">Just Started</option>
                            <option value="Halfway Done">Halfway Done</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] text-[#71717a] font-bold uppercase mb-0.5">Tech Stack (comma separated)</label>
                        <input
                          type="text"
                          value={editTechStack}
                          onChange={(e) => setEditTechStack(e.target.value)}
                          className="w-full bg-[#09090b] border border-[#27272a] rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-2.5 py-1 bg-[#09090b] hover:bg-[#27272a] text-[#71717a] rounded text-xs border border-[#27272a]"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded text-xs"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  );
                }

                return (
                  <div
                    key={proj.id}
                    className={`bg-[#18181b] border rounded p-5 flex flex-col justify-between hover:border-[#3f3f46] transition-all ${
                      isSelected ? 'ring-2 ring-blue-500 border-blue-500/80' : 'border-[#27272a]'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span className={`text-[9px] px-2 py-0.5 border rounded-full font-mono font-bold ${getStatusBadgeClass(proj.status)}`}>
                            {proj.status.toUpperCase()}
                          </span>
                          <span className={`text-[9px] px-2 py-0.5 border rounded-full font-mono font-bold ${
                            proj.projectType === 'Original / Novel'
                              ? 'border-cyan-500/20 text-cyan-400 bg-cyan-950/10'
                              : proj.projectType === 'General'
                              ? 'border-purple-500/20 text-purple-400 bg-purple-950/10'
                              : 'border-blue-500/20 text-blue-400 bg-blue-950/10'
                          }`}>
                            {proj.projectType || 'Reconstruction'}
                          </span>
                          {proj.isArchived && (
                            <span className="text-[9px] px-2 py-0.5 border rounded-full font-mono font-bold border-amber-500/30 text-amber-400 bg-amber-950/20 flex items-center gap-1">
                              <Archive className="h-2.5 w-2.5" /> ARCHIVED
                            </span>
                          )}
                        </div>

                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleArchiveProject(proj.id, proj.isArchived);
                            }}
                            className={`p-1 rounded transition cursor-pointer ${
                              proj.isArchived
                                ? 'hover:bg-amber-950/30 text-amber-400 hover:text-amber-300'
                                : 'hover:bg-[#27272a] text-[#71717a] hover:text-[#fafafa]'
                            }`}
                            title={proj.isArchived ? 'Unarchive project (restore to active view)' : 'Archive project (hide from active view)'}
                          >
                            {proj.isArchived ? (
                              <ArchiveRestore className="h-3.5 w-3.5" />
                            ) : (
                              <Archive className="h-3.5 w-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => startEditProject(proj)}
                            className="p-1 hover:bg-[#27272a] rounded text-[#71717a] hover:text-[#fafafa] transition"
                            title="Edit project metadata"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setProjectToDelete(proj)}
                            className="p-1 hover:bg-red-950/20 rounded text-[#71717a] hover:text-red-400 transition cursor-pointer"
                            title="Delete project"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-[#fafafa] mt-3 leading-tight flex items-center gap-2">
                        {proj.title}
                      </h3>

                      <p className="text-[#a1a1aa] text-xs mt-1.5 italic font-serif leading-relaxed">
                        "{proj.tagline}"
                      </p>

                      {/* Prominent Repo & Google Doc Links */}
                      <div className="mt-3 flex flex-wrap gap-2 items-center">
                        {proj.githubRepo ? (
                          <a
                            href={proj.githubRepo.startsWith('http') ? proj.githubRepo : `https://${proj.githubRepo}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#09090b] hover:bg-[#27272a] text-zinc-200 text-[11px] font-mono border border-[#27272a] rounded transition group"
                          >
                            <Github className="h-3.5 w-3.5 text-zinc-400 group-hover:text-white" />
                            <span>Repository</span>
                            <ExternalLink className="h-2.5 w-2.5 text-zinc-500" />
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#09090b] text-[#52525b] text-[10px] font-mono border border-[#27272a]/50 rounded italic">
                            No Repo Link
                          </span>
                        )}

                        {proj.docUrl ? (
                          <a
                            href={proj.docUrl.startsWith('http') ? proj.docUrl : `https://${proj.docUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-950/30 hover:bg-blue-900/40 text-blue-300 text-[11px] font-mono border border-blue-800/40 rounded transition group"
                          >
                            <FileText className="h-3.5 w-3.5 text-blue-400 group-hover:text-blue-200" />
                            <span>Google Doc / PRD</span>
                            <ExternalLink className="h-2.5 w-2.5 text-blue-400/70" />
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#09090b] text-[#52525b] text-[10px] font-mono border border-[#27272a]/50 rounded italic">
                            No Google Doc
                          </span>
                        )}
                      </div>

                      {/* Tech Stack pills */}
                      {proj.techStack.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {proj.techStack.map((tech, i) => (
                            <span
                              key={i}
                              className="font-mono text-[9px] bg-[#09090b] px-2 py-0.5 rounded text-[#a1a1aa] border border-[#27272a]"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Workspace Counters Badges */}
                      <div className="mt-4 pt-3 border-t border-[#27272a]/60 grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                        <div className="bg-[#09090b] p-1.5 rounded border border-[#27272a]/50">
                          <span className="text-[#71717a] block text-[8px] uppercase">Questions</span>
                          <span className="font-bold text-amber-400 mt-0.5 block">
                            {openQuestionsCount > 0 ? `${openQuestionsCount} Open` : `${totalQuestions} Total`}
                          </span>
                        </div>
                        <div className="bg-[#09090b] p-1.5 rounded border border-[#27272a]/50">
                          <span className="text-[#71717a] block text-[8px] uppercase">Resources</span>
                          <span className="font-bold text-blue-400 mt-0.5 block">{resourcesCount} Items</span>
                        </div>
                        <div className="bg-[#09090b] p-1.5 rounded border border-[#27272a]/50">
                          <span className="text-[#71717a] block text-[8px] uppercase">Roadmap</span>
                          <span className="font-bold text-emerald-400 mt-0.5 block">
                            {totalMilestones > 0 ? `${completedMilestones}/${totalMilestones}` : '0 Items'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#27272a] flex items-center justify-between gap-2">
                      <span className="text-[10px] text-[#71717a] font-mono">
                        {isSelected ? '🟢 Workspace Active' : 'Select to open workspace'}
                      </span>
                      <button
                        onClick={() => {
                          if (isSelected) {
                            setSelectedProjectId(null);
                          } else {
                            setSelectedProjectId(proj.id);
                            setWorkspaceTab('questions');
                          }
                        }}
                        className={`px-3 py-1.5 text-xs font-semibold rounded transition flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40'
                            : 'bg-blue-600 hover:bg-blue-500 text-white'
                        }`}
                      >
                        <Layers className="h-3.5 w-3.5" />
                        {isSelected ? 'Close Workspace' : 'Open Workspace'}
                        <ChevronRight className={`h-3 w-3 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Section: Overpowered Project Workspace Drawer */}
        <AnimatePresence>
          {selectedProject && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="xl:col-span-7 bg-[#18181b] border border-blue-500/40 rounded p-5 space-y-4 h-fit sticky top-4 shadow-2xl"
              id="project-workspace-drawer"
            >
              {/* Workspace Header */}
              <div className="border-b border-[#27272a] pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-mono text-[9px] text-blue-400 font-bold uppercase tracking-widest block">
                      PROJECT WORKSPACE
                    </span>
                    <h2 className="text-lg font-bold text-[#fafafa] mt-0.5 flex items-center gap-2">
                      <Code className="h-5 w-5 text-blue-400" />
                      {selectedProject.title}
                      {selectedProject.isArchived && (
                        <span className="text-[9px] px-2 py-0.5 border rounded-full font-mono font-bold border-amber-500/30 text-amber-400 bg-amber-950/20 flex items-center gap-1">
                          <Archive className="h-2.5 w-2.5" /> ARCHIVED
                        </span>
                      )}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleArchiveProject(selectedProject.id, selectedProject.isArchived)}
                      className={`px-2.5 py-1 text-xs rounded border transition flex items-center gap-1 cursor-pointer ${
                        selectedProject.isArchived
                          ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-500'
                          : 'bg-[#09090b] hover:bg-[#27272a] text-[#a1a1aa] border-[#27272a]'
                      }`}
                      title={selectedProject.isArchived ? 'Restore to active projects' : 'Archive project'}
                    >
                      {selectedProject.isArchived ? (
                        <>
                          <ArchiveRestore className="h-3 w-3" />
                          Unarchive
                        </>
                      ) : (
                        <>
                          <Archive className="h-3 w-3" />
                          Archive
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setQuickRepoInput(selectedProject.githubRepo || '');
                        setQuickDocInput(selectedProject.docUrl || '');
                        setQuickDiagramInput(selectedProject.architectureDiagramUrl || '');
                        setShowQuickLinksEdit(!showQuickLinksEdit);
                      }}
                      className="px-2.5 py-1 bg-[#09090b] hover:bg-[#27272a] text-[#a1a1aa] text-xs rounded border border-[#27272a] transition flex items-center gap-1"
                      title="Edit project URLs"
                    >
                      <Link2 className="h-3 w-3 text-blue-400" />
                      Quick Links
                    </button>
                    <button
                      onClick={() => setSelectedProjectId(null)}
                      className="px-2 py-1 bg-[#09090b] hover:bg-[#27272a] text-[#71717a] hover:text-white text-xs rounded border border-[#27272a] transition"
                    >
                      Close
                    </button>
                  </div>
                </div>

                {/* Primary Repository & Doc Link Bar */}
                <div className="mt-3 flex flex-wrap gap-2 items-center bg-[#09090b] p-2.5 rounded border border-[#27272a]">
                  {selectedProject.githubRepo ? (
                    <a
                      href={selectedProject.githubRepo.startsWith('http') ? selectedProject.githubRepo : `https://${selectedProject.githubRepo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-mono rounded border border-zinc-700 transition"
                    >
                      <Github className="h-3.5 w-3.5 text-white" />
                      <span>Repo</span>
                      <ExternalLink className="h-3 w-3 text-zinc-400" />
                    </a>
                  ) : (
                    <span className="text-[11px] text-[#52525b] font-mono italic">No Repo linked</span>
                  )}

                  {selectedProject.docUrl ? (
                    <a
                      href={selectedProject.docUrl.startsWith('http') ? selectedProject.docUrl : `https://${selectedProject.docUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-950/60 hover:bg-blue-900/80 text-blue-200 text-xs font-mono rounded border border-blue-700/60 transition"
                    >
                      <FileText className="h-3.5 w-3.5 text-blue-400" />
                      <span>Google Doc / PRD</span>
                      <ExternalLink className="h-3 w-3 text-blue-300" />
                    </a>
                  ) : (
                    <span className="text-[11px] text-[#52525b] font-mono italic">No Google Doc linked</span>
                  )}

                  {selectedProject.architectureDiagramUrl && (
                    <a
                      href={selectedProject.architectureDiagramUrl.startsWith('http') ? selectedProject.architectureDiagramUrl : `https://${selectedProject.architectureDiagramUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 text-xs font-mono rounded border border-purple-700/60 transition"
                    >
                      <Layers className="h-3.5 w-3.5 text-purple-400" />
                      <span>Architecture Diagram</span>
                      <ExternalLink className="h-3 w-3 text-purple-300" />
                    </a>
                  )}
                </div>

                {/* Inline Link Editor Form */}
                {showQuickLinksEdit && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      onUpdateProject(selectedProject.id, {
                        githubRepo: quickRepoInput.trim(),
                        docUrl: quickDocInput.trim(),
                        architectureDiagramUrl: quickDiagramInput.trim(),
                      });
                      setShowQuickLinksEdit(false);
                    }}
                    className="mt-3 bg-[#09090b] p-3 border border-blue-500/30 rounded space-y-2.5 text-xs"
                  >
                    <span className="font-mono text-[9px] text-blue-400 font-bold uppercase tracking-wider block">
                      Update Project Links
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[9px] text-[#71717a] font-bold uppercase mb-1">GitHub Repo</label>
                        <input
                          type="text"
                          value={quickRepoInput}
                          onChange={(e) => setQuickRepoInput(e.target.value)}
                          placeholder="https://github.com/..."
                          className="w-full bg-[#18181b] border border-[#27272a] rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500 font-mono text-[11px]"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-[#71717a] font-bold uppercase mb-1">Google Doc / PRD</label>
                        <input
                          type="text"
                          value={quickDocInput}
                          onChange={(e) => setQuickDocInput(e.target.value)}
                          placeholder="https://docs.google.com/..."
                          className="w-full bg-[#18181b] border border-[#27272a] rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500 font-mono text-[11px]"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-[#71717a] font-bold uppercase mb-1">Architecture Diagram</label>
                        <input
                          type="text"
                          value={quickDiagramInput}
                          onChange={(e) => setQuickDiagramInput(e.target.value)}
                          placeholder="https://figma.com/..."
                          className="w-full bg-[#18181b] border border-[#27272a] rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500 font-mono text-[11px]"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowQuickLinksEdit(false)}
                        className="px-2.5 py-1 bg-[#18181b] text-[#71717a] text-xs rounded border border-[#27272a]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded"
                      >
                        Save Links
                      </button>
                    </div>
                  </form>
                )}

                {/* Workspace Navigation Tabs */}
                <div className="mt-4 flex flex-wrap gap-1 border-b border-[#27272a]/80 pb-1">
                  <button
                    onClick={() => setWorkspaceTab('questions')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium font-mono transition cursor-pointer ${
                      workspaceTab === 'questions'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-[#09090b] text-[#a1a1aa] hover:text-white border border-[#27272a]'
                    }`}
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                    <span>Research Questions ({selectedProject.questions?.length || 0})</span>
                  </button>

                  <button
                    onClick={() => setWorkspaceTab('resources')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium font-mono transition cursor-pointer ${
                      workspaceTab === 'resources'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-[#09090b] text-[#a1a1aa] hover:text-white border border-[#27272a]'
                    }`}
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>Study Resources ({selectedProject.resources?.length || 0})</span>
                  </button>

                  <button
                    onClick={() => setWorkspaceTab('milestones')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium font-mono transition cursor-pointer ${
                      workspaceTab === 'milestones'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-[#09090b] text-[#a1a1aa] hover:text-white border border-[#27272a]'
                    }`}
                  >
                    <ListCheck className="h-3.5 w-3.5" />
                    <span>Milestones ({selectedProject.milestones?.length || 0})</span>
                  </button>

                  <button
                    onClick={() => setWorkspaceTab('journal')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium font-mono transition cursor-pointer ${
                      workspaceTab === 'journal'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-[#09090b] text-[#a1a1aa] hover:text-white border border-[#27272a]'
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Journal & Retro</span>
                  </button>
                </div>
              </div>

              {/* TAB 1: RESEARCH QUESTIONS & PROBLEM SOLVER */}
              {workspaceTab === 'questions' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#09090b] p-3 rounded border border-[#27272a]">
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase font-mono flex items-center gap-1.5">
                        <HelpCircle className="h-4 w-4 text-amber-400" />
                        Research Questions & Problem Solver
                      </h3>
                      <p className="text-[11px] text-[#a1a1aa] mt-0.5">
                        Log engineering questions, bottlenecks, research findings, and solution math while building this system.
                      </p>
                    </div>

                    <button
                      onClick={() => setShowAddQuestionModal(true)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs rounded flex items-center gap-1 transition shrink-0 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Question
                    </button>
                  </div>

                  {/* Question Filter Pills */}
                  <div className="flex flex-wrap gap-1.5 items-center text-[10px] font-mono">
                    <span className="text-[#71717a] font-bold uppercase mr-1">Status:</span>
                    {(['All', 'Open', 'Researching', 'Answered', 'Blocked'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => setQuestionFilter(st)}
                        className={`px-2 py-0.5 rounded border transition cursor-pointer ${
                          questionFilter === st
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                            : 'bg-[#09090b] text-[#71717a] border-[#27272a] hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  {/* Questions List */}
                  {(!selectedProject.questions || selectedProject.questions.length === 0) ? (
                    <div className="bg-[#09090b]/50 border border-dashed border-[#27272a] p-8 rounded text-center text-xs text-[#71717a]">
                      <HelpCircle className="h-8 w-8 text-[#3f3f46] mx-auto mb-2" />
                      <p>No research questions logged yet.</p>
                      <p className="text-[10px] text-[#52525b] mt-1">
                        When building systems, list the unsolved questions (e.g. "How to achieve zero-allocation parsing?") and record your findings here.
                      </p>
                      <button
                        onClick={() => setShowAddQuestionModal(true)}
                        className="mt-3 px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium rounded inline-flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" /> Add First Question
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedProject.questions
                        .filter((q) => questionFilter === 'All' || q.status === questionFilter)
                        .map((q) => {
                          const isExpanded = expandedQuestionId === q.id;

                          return (
                            <div
                              key={q.id}
                              className="bg-[#09090b] border border-[#27272a] rounded p-3.5 space-y-2 hover:border-[#3f3f46] transition"
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div className="space-y-1">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    {/* Status Switcher Button */}
                                    <select
                                      value={q.status}
                                      onChange={(e) => handleUpdateQuestionStatus(q.id, e.target.value as any)}
                                      className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold border focus:outline-none cursor-pointer ${
                                        q.status === 'Open'
                                          ? 'bg-red-950/30 text-red-400 border-red-800/40'
                                          : q.status === 'Researching'
                                          ? 'bg-amber-950/30 text-amber-400 border-amber-800/40'
                                          : q.status === 'Answered'
                                          ? 'bg-emerald-950/30 text-emerald-400 border-emerald-800/40'
                                          : 'bg-purple-950/30 text-purple-400 border-purple-800/40'
                                      }`}
                                    >
                                      <option value="Open">🔴 OPEN</option>
                                      <option value="Researching">🟡 RESEARCHING</option>
                                      <option value="Answered">🟢 ANSWERED</option>
                                      <option value="Blocked">🟣 BLOCKED</option>
                                    </select>

                                    {q.category && (
                                      <span className="text-[9px] font-mono bg-[#18181b] text-[#a1a1aa] border border-[#27272a] px-2 py-0.5 rounded">
                                        {q.category}
                                      </span>
                                    )}

                                    <span
                                      className={`text-[9px] font-mono font-bold ${
                                        q.priority === 'High'
                                          ? 'text-red-400'
                                          : q.priority === 'Medium'
                                          ? 'text-amber-400'
                                          : 'text-zinc-400'
                                      }`}
                                    >
                                      {q.priority} Priority
                                    </span>
                                  </div>

                                  <h4 className="text-xs font-bold text-white mt-1 leading-snug">
                                    {q.question}
                                  </h4>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    onClick={() => handleDeleteQuestion(q.id)}
                                    className="p-1 hover:bg-red-950/20 text-[#71717a] hover:text-red-400 rounded transition"
                                    title="Delete Question"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>

                              {/* Findings / Answer Section */}
                              <div className="mt-2 bg-[#18181b] p-3 rounded border border-[#27272a] space-y-2">
                                <div className="flex justify-between items-center text-[10px] font-mono text-[#71717a]">
                                  <span className="font-bold uppercase text-amber-400/90 flex items-center gap-1">
                                    <Sparkles className="h-3 w-3" /> Research Findings & Solution
                                  </span>
                                  <button
                                    onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                                    className="text-blue-400 hover:underline"
                                  >
                                    {isExpanded ? 'Done Editing' : 'Edit Answer'}
                                  </button>
                                </div>

                                {isExpanded ? (
                                  <textarea
                                    value={q.answer}
                                    onChange={(e) => handleUpdateQuestionAnswer(q.id, e.target.value)}
                                    className="w-full bg-[#09090b] border border-[#27272a] rounded p-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500 h-28"
                                    placeholder="Write your research findings, formulas, or code snippets..."
                                  />
                                ) : (
                                  <p className="text-xs text-[#e4e4e7] font-mono leading-relaxed whitespace-pre-wrap">
                                    {q.answer || <span className="text-[#52525b] italic">No research findings recorded yet. Click 'Edit Answer' to document your solution.</span>}
                                  </p>
                                )}

                                {q.url && (
                                  <a
                                    href={q.url.startsWith('http') ? q.url : `https://${q.url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[10px] font-mono text-blue-400 hover:underline pt-1"
                                  >
                                    <span>Reference Link</span>
                                    <ExternalLink className="h-2.5 w-2.5" />
                                  </a>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: REQUIRED STUDY RESOURCES & REFERENCE LIBRARY */}
              {workspaceTab === 'resources' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#09090b] p-3.5 rounded border border-[#27272a]">
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase font-mono flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4 text-blue-400" />
                        Important Project Resources & Reference Library
                      </h3>
                      <p className="text-[11px] text-[#a1a1aa] mt-0.5">
                        Curated collection of essential specifications, documentation, books, research papers, and tools for this project.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowExcelModal(true)}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-medium text-xs rounded flex items-center gap-1.5 transition cursor-pointer font-mono"
                        title="Paste tabular data directly from Excel, CSV, or Google Sheets"
                      >
                        <FileSpreadsheet className="h-3.5 w-3.5" />
                        Paste Excel / CSV
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          resetResourceModalState();
                          setShowAddResourceModal(true);
                        }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded flex items-center gap-1 transition cursor-pointer font-mono"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Resource
                      </button>
                    </div>
                  </div>

                  {/* Filter & Search Bar */}
                  {selectedProject.resources && selectedProject.resources.length > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-2.5 bg-[#09090b]/80 p-2.5 rounded border border-[#27272a]">
                      <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                        <Search className="h-3.5 w-3.5 text-[#71717a] shrink-0" />
                        <input
                          type="text"
                          value={resourceSearchQuery}
                          onChange={(e) => setResourceSearchQuery(e.target.value)}
                          placeholder="Search resources by title, author, or notes..."
                          className="bg-transparent text-xs text-white placeholder-[#71717a] focus:outline-none w-full font-mono"
                        />
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono text-[#71717a] uppercase">Filter:</span>
                        <select
                          value={resourceTypeFilter}
                          onChange={(e) => setResourceTypeFilter(e.target.value as any)}
                          className="bg-[#18181b] border border-[#27272a] text-[#fafafa] text-xs font-mono rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                        >
                          <option value="All">All Types ({selectedProject.resources.length})</option>
                          <option value="Documentation">Documentation</option>
                          <option value="Specification">Specification</option>
                          <option value="Article/Paper">Article / Paper</option>
                          <option value="Book">Book</option>
                          <option value="Repo/Tool">Repo / Tool</option>
                          <option value="Course/Playlist">Course / Playlist</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Resources List */}
                  {(!selectedProject.resources || selectedProject.resources.length === 0) ? (
                    <div className="bg-[#09090b]/50 border border-dashed border-[#27272a] p-8 rounded text-center text-xs text-[#71717a]">
                      <BookOpen className="h-8 w-8 text-[#3f3f46] mx-auto mb-2" />
                      <p className="font-bold text-[#fafafa] text-sm">No reference resources attached to this project.</p>
                      <p className="text-[11px] text-[#71717a] mt-1 max-w-md mx-auto">
                        Keep track of important documentation, RFCs, research papers, and specifications needed during development.
                      </p>
                      <div className="flex justify-center gap-2 mt-4">
                        <button
                          type="button"
                          onClick={() => {
                            resetResourceModalState();
                            setShowAddResourceModal(true);
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded inline-flex items-center gap-1.5 transition cursor-pointer font-mono"
                        >
                          <Plus className="h-3.5 w-3.5" /> Add First Resource
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowExcelModal(true)}
                          className="px-3 py-1.5 bg-[#18181b] hover:bg-[#27272a] text-emerald-400 border border-emerald-900/40 text-xs rounded inline-flex items-center gap-1.5 transition cursor-pointer font-mono"
                        >
                          <FileSpreadsheet className="h-3.5 w-3.5" /> Paste Batch Spreadsheet
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedProject.resources
                        .filter((res) => {
                          if (resourceTypeFilter !== 'All' && res.type !== resourceTypeFilter) return false;
                          if (!resourceSearchQuery.trim()) return true;
                          const q = resourceSearchQuery.toLowerCase();
                          return (
                            res.title.toLowerCase().includes(q) ||
                            (res.creator && res.creator.toLowerCase().includes(q)) ||
                            (res.notes && res.notes.toLowerCase().includes(q))
                          );
                        })
                        .map((res) => {
                          const isCopied = copiedResId === res.id;

                          return (
                            <div
                              key={res.id}
                              className="bg-[#09090b] border border-[#27272a] rounded p-4 space-y-2.5 hover:border-[#3f3f46] transition group"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                <div className="space-y-1">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    {/* Resource Type Tag */}
                                    <span
                                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                                        res.type === 'Specification'
                                          ? 'bg-purple-950/40 text-purple-300 border-purple-800/40'
                                          : res.type === 'Repo/Tool'
                                          ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
                                          : res.type === 'Article/Paper'
                                          ? 'bg-amber-950/40 text-amber-300 border-amber-800/40'
                                          : res.type === 'Book'
                                          ? 'bg-cyan-950/40 text-cyan-300 border-cyan-800/40'
                                          : res.type === 'Course/Playlist'
                                          ? 'bg-rose-950/40 text-rose-300 border-rose-800/40'
                                          : 'bg-blue-950/40 text-blue-300 border-blue-800/40'
                                      }`}
                                    >
                                      {res.type || 'Documentation'}
                                    </span>

                                    {/* Priority / Importance Tag */}
                                    {res.priority && (
                                      <span
                                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
                                          res.priority === 'High'
                                            ? 'text-red-400 border-red-900/40 bg-red-950/20'
                                            : res.priority === 'Medium'
                                            ? 'text-amber-400 border-amber-900/40 bg-amber-950/20'
                                            : 'text-zinc-400 border-zinc-800 bg-zinc-900'
                                        }`}
                                      >
                                        {res.priority === 'High' ? 'Essential' : res.priority === 'Medium' ? 'Recommended' : 'Reference'}
                                      </span>
                                    )}

                                    {res.creator && (
                                      <span className="text-[11px] text-[#a1a1aa] font-mono">
                                        • {res.creator}
                                      </span>
                                    )}
                                  </div>

                                  {/* Title */}
                                  <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition flex items-center gap-1.5 pt-0.5">
                                    {res.title}
                                  </h4>
                                </div>

                                {/* Quick Action Buttons */}
                                <div className="flex items-center gap-1.5 shrink-0 self-start">
                                  {res.url && (
                                    <>
                                      <a
                                        href={res.url.startsWith('http') ? res.url : `https://${res.url}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-2 py-1 bg-blue-950/40 hover:bg-blue-900/60 text-blue-300 border border-blue-800/40 rounded text-[11px] font-mono inline-flex items-center gap-1 transition cursor-pointer"
                                        title="Open resource in new tab"
                                      >
                                        <ExternalLink className="h-3 w-3" />
                                        <span>Open Link</span>
                                      </a>

                                      <button
                                        type="button"
                                        onClick={() => handleCopyResourceLink(res)}
                                        className="p-1 hover:bg-[#27272a] text-[#71717a] hover:text-white rounded transition cursor-pointer"
                                        title="Copy resource URL"
                                      >
                                        {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                                      </button>
                                    </>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => startEditResource(res)}
                                    className="p-1 hover:bg-[#27272a] text-[#71717a] hover:text-white rounded transition cursor-pointer"
                                    title="Edit resource details"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteResource(res.id)}
                                    className="p-1 hover:bg-red-950/20 text-[#71717a] hover:text-red-400 rounded transition cursor-pointer"
                                    title="Remove resource"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Notes / Context Box */}
                              {res.notes && (
                                <div className="bg-[#18181b] p-3 rounded border border-[#27272a]/80 text-xs text-[#e4e4e7] font-mono leading-relaxed">
                                  <p className="whitespace-pre-wrap">{res.notes}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: MILESTONES & ROADMAP */}
              {workspaceTab === 'milestones' && (
                <div className="space-y-4">
                  <div className="bg-[#09090b] p-3.5 rounded border border-[#27272a] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase font-mono flex items-center gap-1.5">
                        <ListCheck className="h-4 w-4 text-emerald-400" />
                        System Milestones & Architecture Roadmap
                      </h3>
                      <p className="text-[11px] text-[#a1a1aa] mt-0.5">
                        Track architecture milestones, sub-components, test suites, and protocol deliverables.
                      </p>
                    </div>

                    {/* Progress Bar & Counter */}
                    {selectedProject.milestones && selectedProject.milestones.length > 0 && (
                      <div className="flex items-center gap-3 bg-[#18181b] p-2 rounded border border-[#27272a] shrink-0">
                        <div className="text-right">
                          <span className="text-[10px] font-mono text-[#a1a1aa] block">Completed</span>
                          <span className="text-xs font-mono font-bold text-emerald-400">
                            {selectedProject.milestones.filter((m) => m.isCompleted).length} / {selectedProject.milestones.length} (
                            {Math.round(
                              (selectedProject.milestones.filter((m) => m.isCompleted).length / selectedProject.milestones.length) * 100
                            )}
                            %)
                          </span>
                        </div>
                        <div className="w-16 bg-[#09090b] h-2 rounded-full overflow-hidden border border-[#27272a]">
                          <div
                            className="bg-emerald-500 h-full transition-all duration-300"
                            style={{
                              width: `${Math.round(
                                (selectedProject.milestones.filter((m) => m.isCompleted).length / selectedProject.milestones.length) * 100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Toolbar for Quick Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                    <div className="flex flex-wrap gap-1.5">
                      {(!selectedProject.milestones || selectedProject.milestones.length === 0) && (
                        <button
                          type="button"
                          onClick={handleAddPresetMilestones}
                          className="px-2.5 py-1 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/50 rounded flex items-center gap-1 text-[11px] transition cursor-pointer"
                        >
                          <Sparkles className="h-3 w-3 text-emerald-400" />
                          + Load 5 Core Engineering Milestones
                        </button>
                      )}
                      {selectedProject.milestones && selectedProject.milestones.length > 0 && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleMarkAllMilestonesComplete(true)}
                            className="px-2 py-1 bg-[#09090b] hover:bg-[#18181b] text-emerald-400 border border-[#27272a] rounded text-[10px] transition cursor-pointer"
                          >
                            Mark All Complete
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMarkAllMilestonesComplete(false)}
                            className="px-2 py-1 bg-[#09090b] hover:bg-[#18181b] text-[#a1a1aa] border border-[#27272a] rounded text-[10px] transition cursor-pointer"
                          >
                            Uncheck All
                          </button>
                          {selectedProject.milestones.some((m) => m.isCompleted) && (
                            <button
                              type="button"
                              onClick={handleClearCompletedMilestones}
                              className="px-2 py-1 bg-[#09090b] hover:bg-red-950/20 text-red-400 border border-red-900/30 rounded text-[10px] transition cursor-pointer"
                            >
                              Clear Completed
                            </button>
                          )}
                        </>
                      )}
                    </div>

                    {selectedProject.milestones && selectedProject.milestones.length > 0 && (
                      <button
                        type="button"
                        onClick={handleAddPresetMilestones}
                        className="px-2 py-1 bg-[#09090b] hover:bg-[#18181b] text-[#a1a1aa] hover:text-white border border-[#27272a] rounded text-[10px] transition cursor-pointer"
                      >
                        + Add Preset Engineering Milestones
                      </button>
                    )}
                  </div>

                  {/* Form to add custom milestone */}
                  <form onSubmit={handleAddMilestone} className="bg-[#09090b] p-3 rounded border border-[#27272a] space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMilestoneTitle}
                        onChange={(e) => setNewMilestoneTitle(e.target.value)}
                        placeholder="Add milestone title (e.g. Write-Ahead Log binary encoder)..."
                        className="flex-1 bg-[#18181b] border border-[#27272a] focus:border-blue-500 rounded px-3 py-1.5 text-xs text-white placeholder-[#71717a] focus:outline-none font-mono"
                      />
                      <button
                        type="submit"
                        disabled={!newMilestoneTitle.trim()}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white font-medium text-xs rounded transition flex items-center gap-1 shrink-0 cursor-pointer font-mono"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Milestone
                      </button>
                    </div>
                    <input
                      type="text"
                      value={newMilestoneNotes}
                      onChange={(e) => setNewMilestoneNotes(e.target.value)}
                      placeholder="Optional notes or acceptance criteria (e.g. CRC32 checksum verification on read)..."
                      className="w-full bg-[#18181b] border border-[#27272a]/60 focus:border-blue-500 rounded px-3 py-1 text-[11px] text-[#a1a1aa] placeholder-[#52525b] focus:outline-none font-mono"
                    />
                  </form>

                  {/* Milestones List */}
                  {(!selectedProject.milestones || selectedProject.milestones.length === 0) ? (
                    <div className="bg-[#09090b]/50 border border-dashed border-[#27272a] p-8 rounded text-center text-xs text-[#71717a]">
                      <ListCheck className="h-8 w-8 text-[#3f3f46] mx-auto mb-2" />
                      <p>No roadmap milestones added yet.</p>
                      <p className="text-[10px] text-[#52525b] mt-1">
                        Add specific milestones or click below to populate standard system engineering deliverables.
                      </p>
                      <button
                        type="button"
                        onClick={handleAddPresetMilestones}
                        className="mt-3 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded inline-flex items-center gap-1.5 transition cursor-pointer font-mono"
                      >
                        <Sparkles className="h-3.5 w-3.5" /> Load Preset Engineering Milestones
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedProject.milestones.map((m) => {
                        const isEditingThis = editingMilestoneId === m.id;

                        if (isEditingThis) {
                          return (
                            <div key={m.id} className="bg-[#18181b] border border-blue-500/50 rounded p-3 space-y-2">
                              <input
                                type="text"
                                value={editMilestoneTitle}
                                onChange={(e) => setEditMilestoneTitle(e.target.value)}
                                className="w-full bg-[#09090b] border border-[#27272a] rounded px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                              />
                              <input
                                type="text"
                                value={editMilestoneNotes}
                                onChange={(e) => setEditMilestoneNotes(e.target.value)}
                                placeholder="Notes / acceptance criteria..."
                                className="w-full bg-[#09090b] border border-[#27272a] rounded px-2.5 py-1 text-[11px] text-[#a1a1aa] font-mono focus:outline-none focus:border-blue-500"
                              />
                              <div className="flex justify-end gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => setEditingMilestoneId(null)}
                                  className="px-2.5 py-1 bg-[#09090b] text-[#71717a] hover:text-white text-xs rounded border border-[#27272a] cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveMilestoneEdit(m.id)}
                                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded font-medium cursor-pointer"
                                >
                                  Save Changes
                                </button>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={m.id}
                            className={`flex items-start justify-between p-3 rounded border transition gap-3 ${
                              m.isCompleted
                                ? 'bg-emerald-950/10 border-emerald-900/30 text-emerald-300'
                                : 'bg-[#09090b] border-[#27272a] text-white hover:border-[#3f3f46]'
                            }`}
                          >
                            <div className="flex items-start gap-2.5 flex-1 min-w-0">
                              <button
                                type="button"
                                onClick={() => handleToggleMilestone(m.id)}
                                className="mt-0.5 text-emerald-400 hover:text-emerald-300 transition shrink-0 cursor-pointer"
                                title={m.isCompleted ? 'Mark incomplete' : 'Mark complete'}
                              >
                                {m.isCompleted ? (
                                  <CheckSquare className="h-4 w-4 text-emerald-400" />
                                ) : (
                                  <Square className="h-4 w-4 text-[#52525b] hover:text-[#71717a]" />
                                )}
                              </button>
                              <div className="min-w-0 flex-1">
                                <span
                                  onClick={() => handleToggleMilestone(m.id)}
                                  className={`text-xs font-mono block cursor-pointer select-none ${
                                    m.isCompleted ? 'line-through text-emerald-400/70' : 'text-white'
                                  }`}
                                >
                                  {m.title}
                                </span>
                                {m.notes && (
                                  <p className="text-[11px] text-[#a1a1aa] font-sans mt-0.5 leading-relaxed">
                                    {m.notes}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => startEditMilestone(m)}
                                className="p-1 hover:bg-[#27272a] text-[#71717a] hover:text-white rounded transition cursor-pointer"
                                title="Edit milestone"
                              >
                                <Edit2 className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteMilestone(m.id)}
                                className="p-1 hover:bg-red-950/20 text-[#71717a] hover:text-red-400 rounded transition cursor-pointer"
                                title="Delete milestone"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: ARCHITECTURAL RETROSPECTIVE JOURNAL */}
              {workspaceTab === 'journal' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-[#27272a] pb-2">
                    <label className="font-mono text-[9px] text-[#71717a] uppercase font-bold tracking-widest">
                      Retrospective Log & System Design Decisions
                    </label>
                    <span className="font-mono text-[9px] text-blue-400">Markdown enabled</span>
                  </div>

                  {/* Quick Append Buttons */}
                  <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                    <button
                      onClick={() =>
                        onUpdateProject(selectedProject.id, {
                          retrospectiveLog: selectedProject.retrospectiveLog + '\n\n## Core Decisions\n- ',
                        })
                      }
                      className="px-2 py-1 bg-[#09090b] hover:bg-[#27272a] text-blue-300 rounded border border-[#27272a]"
                    >
                      + Core Decisions
                    </button>
                    <button
                      onClick={() =>
                        onUpdateProject(selectedProject.id, {
                          retrospectiveLog: selectedProject.retrospectiveLog + '\n\n## Systemic Hurdles Overcome\n- ',
                        })
                      }
                      className="px-2 py-1 bg-[#09090b] hover:bg-[#27272a] text-amber-300 rounded border border-[#27272a]"
                    >
                      + Hurdles & Bottlenecks
                    </button>
                    <button
                      onClick={() =>
                        onUpdateProject(selectedProject.id, {
                          retrospectiveLog: selectedProject.retrospectiveLog + '\n\n## Low-level Lessons Learned\n- ',
                        })
                      }
                      className="px-2 py-1 bg-[#09090b] hover:bg-[#27272a] text-emerald-300 rounded border border-[#27272a]"
                    >
                      + Lessons Learned
                    </button>
                  </div>

                  <textarea
                    value={selectedProject.retrospectiveLog}
                    onChange={(e) => onUpdateProject(selectedProject.id, { retrospectiveLog: e.target.value })}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded p-4 text-xs font-mono text-[#e4e4e7] focus:outline-none focus:border-blue-500 min-h-[380px] leading-relaxed"
                    placeholder={`# Retrospective: ${selectedProject.title}\n\n## Architectural Decisions\n- Write down your decisions...\n\n## Systems Barriers Encountered\n- Note down bottlenecks...`}
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* MODAL 1: ADD NEW PROJECT */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#18181b] border border-[#27272a] rounded p-6 max-w-lg w-full space-y-4 shadow-xl my-8"
          >
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Code className="h-4 w-4 text-blue-500" />
              Log System Project
            </h3>
            <p className="text-[#a1a1aa] text-xs">
              Deconstruct complex abstractions or engineer a new novel system layer from scratch.
            </p>

            {validationError && (
              <div className="text-red-500 text-[10px] font-mono font-bold uppercase bg-red-950/25 p-2.5 border border-red-900/30 rounded">
                ERROR: {validationError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#71717a] uppercase mb-1">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g., Custom LSM-Tree Database, Vector Search Engine"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#71717a] uppercase mb-1">
                    Project Type *
                  </label>
                  <select
                    value={projectType}
                    onChange={(e) => {
                      setProjectType(e.target.value as Project['projectType']);
                      setValidationError('');
                    }}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-xs text-[#fafafa] focus:outline-none focus:border-blue-500"
                  >
                    <option value="Reconstruction">Reconstruction</option>
                    <option value="Original / Novel">Original / Novel</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#71717a] uppercase mb-1">
                  Tagline / Core Vision *
                </label>
                <textarea
                  required
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 h-16"
                  placeholder="e.g., Removing black-box database abstractions by building a WAL and SkipList MemTable in Rust."
                />
              </div>

              {projectType === 'Original / Novel' && (
                <div className="bg-[#09090b] p-3 rounded border border-purple-900/40 space-y-3 font-mono text-xs">
                  <div className="flex items-center gap-2 text-purple-300 font-bold text-[11px] uppercase">
                    <Sparkles className="h-3.5 w-3.5" />
                    Original System Specifications
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#71717a] uppercase mb-1">
                      Architectural Novelty / Specialized Abstractions
                    </label>
                    <input
                      type="text"
                      value={architectureNovelty}
                      onChange={(e) => setArchitectureNovelty(e.target.value)}
                      placeholder="e.g. Lock-free SkipList MemTable with custom binary WAL serializer"
                      className="w-full bg-[#18181b] border border-[#27272a] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#71717a] uppercase mb-1">
                      Quality Guarantees & SLA Targets
                    </label>
                    <input
                      type="text"
                      value={qualityGuarantees}
                      onChange={(e) => setQualityGuarantees(e.target.value)}
                      placeholder="e.g. Sub-millisecond p99 latency under 100k writes/sec with fsync durability"
                      className="w-full bg-[#18181b] border border-[#27272a] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 font-sans"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#71717a] uppercase mb-1">
                    GitHub Repo Link
                  </label>
                  <input
                    type="text"
                    value={githubRepo}
                    onChange={(e) => setGithubRepo(e.target.value)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono text-[11px]"
                    placeholder="https://github.com/..."
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#71717a] uppercase mb-1">
                    Google Doc / PRD Link
                  </label>
                  <input
                    type="text"
                    value={docUrl}
                    onChange={(e) => setDocUrl(e.target.value)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono text-[11px]"
                    placeholder="https://docs.google.com/..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#71717a] uppercase mb-1">
                  Technologies / Stack (Comma-separated)
                </label>
                <input
                  type="text"
                  value={techStackInput}
                  onChange={(e) => setTechStackInput(e.target.value)}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  placeholder="Rust, POSIX, C++, Go, Linux syscalls"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white bg-[#09090b] hover:bg-zinc-900 border border-[#27272a] rounded transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded transition"
                >
                  Log System Project
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL 2: ADD RESEARCH QUESTION */}
      {showAddQuestionModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#18181b] border border-[#27272a] rounded p-6 max-w-lg w-full space-y-4 shadow-xl"
          >
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-amber-400" />
              Add Research Question / Problem
            </h3>

            <form onSubmit={handleAddQuestion} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-[#71717a] uppercase mb-1">
                  Question / Challenge Statement *
                </label>
                <textarea
                  required
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  placeholder="e.g., How do we avoid lock contention during high-throughput concurrent B-Tree page splits?"
                  className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#71717a] uppercase mb-1">Category</label>
                  <select
                    value={newQuestionCategory}
                    onChange={(e) => setNewQuestionCategory(e.target.value as any)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="Architecture">Architecture</option>
                    <option value="Performance">Performance</option>
                    <option value="API / Protocol">API / Protocol</option>
                    <option value="Database">Database</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#71717a] uppercase mb-1">Priority</label>
                  <select
                    value={newQuestionPriority}
                    onChange={(e) => setNewQuestionPriority(e.target.value as any)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#71717a] uppercase mb-1">
                  Initial Findings / Answer (Optional)
                </label>
                <textarea
                  value={newQuestionAnswer}
                  onChange={(e) => setNewQuestionAnswer(e.target.value)}
                  placeholder="Write initial notes, math formulas, or code snippets..."
                  className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500 h-20"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#71717a] uppercase mb-1">
                  Reference Link (Optional)
                </label>
                <input
                  type="text"
                  value={newQuestionUrl}
                  onChange={(e) => setNewQuestionUrl(e.target.value)}
                  placeholder="https://paper-or-docs-link.com"
                  className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-1.5 text-xs font-mono text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddQuestionModal(false)}
                  className="px-3 py-1.5 bg-[#09090b] text-[#71717a] text-xs rounded border border-[#27272a]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs rounded transition"
                >
                  Save Question
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL 3: EXCEL / SPREADSHEET BATCH IMPORTER */}
      {showExcelModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#18181b] border border-[#27272a] rounded p-6 max-w-2xl w-full space-y-4 shadow-2xl my-8"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
                  Excel / Google Sheets Batch Importer
                </h3>
                <p className="text-[#a1a1aa] text-xs mt-0.5">
                  Paste rows directly from your spreadsheet. Columns: <code className="text-emerald-300 font-mono">Title | Type | Creator | Priority | URL | Notes</code>
                </p>
              </div>

              <button
                type="button"
                onClick={copyExcelTemplate}
                className="px-2.5 py-1 bg-[#09090b] hover:bg-[#27272a] text-emerald-400 text-[11px] font-mono border border-emerald-900/40 rounded flex items-center gap-1 transition cursor-pointer"
              >
                {copiedTemplate ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copiedTemplate ? 'Copied Template!' : 'Copy Excel Template'}
              </button>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#71717a] uppercase mb-1">
                Paste Spreadsheet Data (Tab, Pipe, or Comma Separated)
              </label>
              <textarea
                value={rawExcelInput}
                onChange={handleParseExcelChange}
                placeholder={`Designing Data-Intensive Applications\tBook\tMartin Kleppmann\tEssential\thttps://dataintensive.net\tRead Chapter 3 on Storage Engines & LSM Trees\nRocksDB Compaction Wiki\tDocumentation\tMeta\tEssential\thttps://github.com/facebook/rocksdb/wiki\tCompaction benchmarks`}
                className="w-full bg-[#09090b] border border-[#27272a] rounded p-3 text-xs font-mono text-white focus:outline-none focus:border-emerald-500 h-36 leading-relaxed"
              />
            </div>

            {/* Parsed Live Preview Grid */}
            {parsedPreview.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-emerald-400 font-bold">
                    ✓ Detected {parsedPreview.length} resource(s) ready to import
                  </span>
                </div>

                <div className="max-h-44 overflow-y-auto border border-[#27272a] rounded bg-[#09090b]/60">
                  <table className="w-full text-left text-[11px] font-mono">
                    <thead className="bg-[#18181b] text-[#71717a] uppercase text-[9px] sticky top-0 border-b border-[#27272a]">
                      <tr>
                        <th className="p-2">Title</th>
                        <th className="p-2">Type</th>
                        <th className="p-2">Author</th>
                        <th className="p-2">Importance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#27272a] text-[#e4e4e7]">
                      {parsedPreview.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2 font-bold text-white truncate max-w-[200px]">{item.title}</td>
                          <td className="p-2 text-blue-300">{item.type}</td>
                          <td className="p-2 text-[#a1a1aa]">{item.creator}</td>
                          <td className="p-2 text-amber-400">
                            {item.priority === 'High' ? 'Essential' : item.priority === 'Medium' ? 'Recommended' : 'Reference'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-[#27272a]">
              <button
                type="button"
                onClick={() => {
                  setRawExcelInput('');
                  setParsedPreview([]);
                  setShowExcelModal(false);
                }}
                className="px-3 py-1.5 bg-[#09090b] text-[#71717a] text-xs rounded border border-[#27272a] hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={parsedPreview.length === 0}
                onClick={handleConfirmExcelImport}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold text-xs rounded transition flex items-center gap-1.5 cursor-pointer font-mono"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                Import {parsedPreview.length} Resource(s)
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* MODAL 4: ADD / EDIT RESOURCE */}
      {showAddResourceModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#18181b] border border-[#27272a] rounded p-6 max-w-lg w-full space-y-4 shadow-2xl my-8"
          >
            <div className="flex justify-between items-center border-b border-[#27272a] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-400" />
                {editingResourceId ? 'Edit Project Resource' : 'Add Project Resource / Reference'}
              </h3>
              <button
                type="button"
                onClick={resetResourceModalState}
                className="text-[#71717a] hover:text-white transition text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveResource} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-[#71717a] uppercase mb-1">
                  Resource Title *
                </label>
                <input
                  type="text"
                  required
                  value={newResTitle}
                  onChange={(e) => setNewResTitle(e.target.value)}
                  placeholder="e.g., Designing Data-Intensive Applications or RocksDB Compaction Wiki"
                  className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#71717a] uppercase mb-1">Type</label>
                  <select
                    value={newResType}
                    onChange={(e) => setNewResType(e.target.value as any)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  >
                    <option value="Documentation">Documentation</option>
                    <option value="Specification">Specification / RFC</option>
                    <option value="Article/Paper">Article / Research Paper</option>
                    <option value="Book">Book</option>
                    <option value="Repo/Tool">GitHub Repo / Tool</option>
                    <option value="Course/Playlist">Course / Playlist</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#71717a] uppercase mb-1">
                    Importance / Priority
                  </label>
                  <select
                    value={newResPriority}
                    onChange={(e) => setNewResPriority(e.target.value as any)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  >
                    <option value="High">Essential (High)</option>
                    <option value="Medium">Recommended (Medium)</option>
                    <option value="Low">Reference (Low)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#71717a] uppercase mb-1">
                  Author / Organization / Source
                </label>
                <input
                  type="text"
                  value={newResCreator}
                  onChange={(e) => setNewResCreator(e.target.value)}
                  placeholder="e.g., Martin Kleppmann, Meta Engineering, IEEE"
                  className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#71717a] uppercase mb-1">
                  Reference URL / Link (Optional)
                </label>
                <input
                  type="text"
                  value={newResUrl}
                  onChange={(e) => setNewResUrl(e.target.value)}
                  placeholder="https://github.com/facebook/rocksdb/wiki..."
                  className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#71717a] uppercase mb-1">
                  Key Notes & Focus Areas (Optional)
                </label>
                <textarea
                  value={newResNotes}
                  onChange={(e) => setNewResNotes(e.target.value)}
                  placeholder="Write why this resource is important, key chapters to read, or implementation notes..."
                  className="w-full bg-[#09090b] border border-[#27272a] rounded p-2.5 text-xs font-mono text-white focus:outline-none focus:border-blue-500 h-24 leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#27272a]">
                <button
                  type="button"
                  onClick={resetResourceModalState}
                  className="px-3 py-1.5 bg-[#09090b] text-[#71717a] hover:text-white text-xs rounded border border-[#27272a] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded transition font-mono"
                >
                  {editingResourceId ? 'Save Changes' : 'Add Resource'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL 5: PURGE CONFIRMATION */}
      <ConfirmModal
        isOpen={projectToDelete !== null}
        title="Purge Project?"
        message={`Are you sure you want to permanently purge the project "${projectToDelete?.title}" along with its research questions, study materials, and retrospective journals?`}
        confirmText="Purge Project"
        cancelText="Cancel"
        onConfirm={() => {
          if (projectToDelete) {
            onDeleteProject(projectToDelete.id);
            if (selectedProjectId === projectToDelete.id) {
              setSelectedProjectId(null);
            }
            setProjectToDelete(null);
          }
        }}
        onCancel={() => setProjectToDelete(null)}
        variant="danger"
      />
    </div>
  );
}
