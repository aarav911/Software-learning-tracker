/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Project } from '../types';
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
} from 'lucide-react';

interface ProjectsViewProps {
  projects: Project[];
  onAddProject: (project: Omit<Project, 'id'>) => void;
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

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Reconstruction' | 'Original / Novel' | 'General'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | Project['status']>('All');

  // Deletion state
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // New Project Fields
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [githubRepo, setGithubRepo] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [status, setStatus] = useState<Project['status']>('Idea');
  const [techStackInput, setTechStackInput] = useState('');
  const [retrospectiveLog, setRetrospectiveLog] = useState('');
  const [projectType, setProjectType] = useState<Project['projectType']>('Reconstruction');
  const [isNotGenericCrud, setIsNotGenericCrud] = useState(false);
  const [architectureNovelty, setArchitectureNovelty] = useState('');
  const [qualityGuarantees, setQualityGuarantees] = useState('');
  const [validationError, setValidationError] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTagline, setEditTagline] = useState('');
  const [editGithubRepo, setEditGithubRepo] = useState('');
  const [editDocUrl, setEditDocUrl] = useState('');
  const [editStatus, setEditStatus] = useState<Project['status']>('Idea');
  const [editTechStack, setEditTechStack] = useState('');
  const [editProjectType, setEditProjectType] = useState<Project['projectType']>('Reconstruction');
  const [editIsNotGenericCrud, setEditIsNotGenericCrud] = useState(false);
  const [editArchitectureNovelty, setEditArchitectureNovelty] = useState('');
  const [editQualityGuarantees, setEditQualityGuarantees] = useState('');
  const [editValidationError, setEditValidationError] = useState('');

  const filteredProjects = projects.filter((proj) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!title.trim() || !tagline.trim()) {
      setValidationError('Title and tagline are required.');
      return;
    }

    if (projectType === 'Original / Novel') {
      if (!isNotGenericCrud) {
        setValidationError('You must verify and confirm that this is not a generic CRUD app. Original systems demand novelty.');
        return;
      }
      if (!architectureNovelty.trim() || architectureNovelty.trim().length < 10) {
        setValidationError('Please specify the architectural novelty or specialized logic (at least 10 characters).');
        return;
      }
      if (!qualityGuarantees.trim() || qualityGuarantees.trim().length < 10) {
        setValidationError('Please specify the system quality guarantees or scaling targets (at least 10 characters).');
        return;
      }
    }

    // Split tech stack input by comma
    const techStack = techStackInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onAddProject({
      title: title.trim(),
      tagline: tagline.trim(),
      githubRepo: githubRepo.trim(),
      docUrl: docUrl.trim(),
      status,
      techStack,
      projectType,
      noveltySpecs: projectType === 'Original / Novel' ? {
        isNotGenericCrud,
        architectureNovelty: architectureNovelty.trim(),
        qualityGuarantees: qualityGuarantees.trim(),
      } : undefined,
      retrospectiveLog: retrospectiveLog.trim() || `# Retrospective: ${title}\n\n## Core Decisions\n- \n\n## Systemic Hurdles Overcome\n- \n\n## Low-level Lessons Learned\n- `,
    });

    // Reset Form
    setTitle('');
    setTagline('');
    setGithubRepo('');
    setDocUrl('');
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

    if (editProjectType === 'Original / Novel') {
      if (!editIsNotGenericCrud) {
        setEditValidationError('You must verify and confirm that this is not a generic CRUD app.');
        return;
      }
      if (!editArchitectureNovelty.trim() || editArchitectureNovelty.trim().length < 10) {
        setEditValidationError('Please specify the architectural novelty (at least 10 characters).');
        return;
      }
      if (!editQualityGuarantees.trim() || editQualityGuarantees.trim().length < 10) {
        setEditValidationError('Please specify system quality guarantees (at least 10 characters).');
        return;
      }
    }

    const techStack = editTechStack
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onUpdateProject(editingId, {
      title: editTitle.trim(),
      tagline: editTagline.trim(),
      githubRepo: editGithubRepo.trim(),
      docUrl: editDocUrl.trim(),
      status: editStatus,
      techStack,
      projectType: editProjectType,
      noveltySpecs: editProjectType === 'Original / Novel' ? {
        isNotGenericCrud: editIsNotGenericCrud,
        architectureNovelty: editArchitectureNovelty.trim(),
        qualityGuarantees: editQualityGuarantees.trim(),
      } : undefined,
    });

    setEditingId(null);
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

  return (
    <div className="space-y-6" id="projects-view-container">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272a] pb-5">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#fafafa] flex items-center gap-2">
            <Code className="h-5 w-5 text-blue-500" />
            Projects & Reconstructions
          </h1>
          <p className="text-[#a1a1aa] text-xs mt-1 max-w-2xl">
            Engineer highly novel, performance-critical systems with uncompromising quality constraints, or deconstruct complex abstractions from scratch.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded text-xs transition shadow-sm cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5 stroke-[3px]" />
          New System Project
        </button>
      </div>

      {/* Quick Statistics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#18181b] border border-[#27272a] p-4 rounded">
          <span className="text-[9px] font-mono text-[#71717a] uppercase font-bold tracking-widest">Total Projects</span>
          <span className="text-xl font-bold text-[#fafafa] block mt-1 font-mono">{projects.length}</span>
        </div>
        <div className="bg-[#18181b] border border-[#27272a] p-4 rounded">
          <span className="text-[9px] font-mono text-[#71717a] uppercase font-bold tracking-widest">Completed Systems</span>
          <span className="text-xl font-bold text-emerald-500 block mt-1 font-mono">
            {projects.filter((p) => p.status === 'Completed').length}
          </span>
        </div>
        <div className="bg-[#18181b] border border-[#27272a] p-4 rounded">
          <span className="text-[9px] font-mono text-[#71717a] uppercase font-bold tracking-widest">In Active Dev</span>
          <span className="text-xl font-bold text-blue-400 block mt-1 font-mono">
            {projects.filter((p) => p.status === 'Halfway Done' || p.status === 'Just Started').length}
          </span>
        </div>
        <div className="bg-[#18181b] border border-[#27272a] p-4 rounded">
          <span className="text-[9px] font-mono text-[#71717a] uppercase font-bold tracking-widest">Idea Backlog</span>
          <span className="text-xl font-bold text-[#71717a] block mt-1 font-mono">
            {projects.filter((p) => p.status === 'Idea').length}
          </span>
        </div>
      </div>

      {/* Main Split Layout: Projects List (Left/Main) & Retro Drawer (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Section: Cards */}
        <div className={`${selectedProject ? 'xl:col-span-6' : 'xl:col-span-12'} space-y-4 transition-all duration-300`}>
          {projects.length > 0 && (
            <div className="bg-[#18181b] border border-[#27272a] rounded p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              {/* Search Box */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="h-3.5 w-3.5 text-[#71717a] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects, PRDs, tech stack..."
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

              {/* Type Filter */}
              <div className="flex items-center gap-1.5">
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
                There are no active projects. Log an original/novel system project with high-quality guarantees, or deconstruct a system to strip away unneeded complexity.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-6 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded text-xs transition animate-none cursor-pointer"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProjects.map((proj) => {
                const isSelected = proj.id === selectedProjectId;
                const isEditing = proj.id === editingId;

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
                        <label className="block text-[9px] text-[#71717a] font-bold uppercase mb-0.5">Tagline (Abstraction Removed or Core Goal)</label>
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
                          <label className="block text-[9px] text-[#71717a] font-bold uppercase mb-0.5">GitHub Link</label>
                          <input
                            type="text"
                            value={editGithubRepo}
                            onChange={(e) => setEditGithubRepo(e.target.value)}
                            className="w-full bg-[#09090b] border border-[#27272a] rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                            placeholder="https://github.com/..."
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-[#71717a] font-bold uppercase mb-0.5">PRD / Google Doc Link</label>
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

                      {editProjectType === 'Original / Novel' && (
                        <div className="space-y-2.5 p-3 bg-blue-950/15 border border-blue-900/20 rounded">
                          <span className="font-mono text-[9px] text-blue-400 font-bold uppercase tracking-wider block">
                            System Quality & Novelty Verification
                          </span>
                          <label className="flex items-start gap-2 cursor-pointer mt-1">
                            <input
                              type="checkbox"
                              checked={editIsNotGenericCrud}
                              onChange={(e) => setEditIsNotGenericCrud(e.target.checked)}
                              className="mt-0.5 rounded bg-black border-[#27272a] text-blue-600 focus:ring-0 focus:ring-offset-0"
                            />
                            <span className="text-[10px] text-[#a1a1aa] leading-tight select-none">
                              This is NOT a generic CRUD app. It uses custom low-level structures or sophisticated system layouts.
                            </span>
                          </label>

                          <div>
                            <label className="block text-[9px] text-[#71717a] font-bold uppercase mb-0.5">Architectural Novelty</label>
                            <textarea
                              value={editArchitectureNovelty}
                              onChange={(e) => setEditArchitectureNovelty(e.target.value)}
                              placeholder="Describe the specialized design/protocol layer..."
                              className="w-full bg-[#09090b] border border-[#27272a] rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500 h-14 resize-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[9px] text-[#71717a] font-bold uppercase mb-0.5">Quality / SLA Guarantees</label>
                            <textarea
                              value={editQualityGuarantees}
                              onChange={(e) => setEditQualityGuarantees(e.target.value)}
                              placeholder="e.g., zero-allocation parsing, sub-millisecond tail latency..."
                              className="w-full bg-[#09090b] border border-[#27272a] rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500 h-14 resize-none"
                            />
                          </div>
                        </div>
                      )}

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
                          Save
                        </button>
                      </div>
                    </form>
                  );
                }

                return (
                  <div
                    key={proj.id}
                    className={`bg-[#18181b] border rounded p-5 flex flex-col justify-between hover:border-[#3f3f46] transition-all ${
                      isSelected ? 'ring-1 ring-blue-500 border-blue-500/50' : 'border-[#27272a]'
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
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => startEditProject(proj)}
                            className="p-1 hover:bg-[#27272a] rounded text-[#71717a] hover:text-[#fafafa] transition"
                            title="Edit project details"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setProjectToDelete(proj);
                            }}
                            className="p-1 hover:bg-red-950/20 rounded text-[#71717a] hover:text-red-400 transition cursor-pointer"
                            title="Delete reconstruction project"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-[#fafafa] mt-3 leading-tight">
                        {proj.title}
                      </h3>

                      <div className="mt-2.5 bg-[#09090b]/40 p-3 rounded border border-[#27272a]/50">
                        <span className="font-mono text-[9px] text-blue-400 font-bold tracking-widest block uppercase">
                          {proj.projectType === 'Original / Novel' ? 'Core System Goal' : 'Abstraction Deconstructed'}
                        </span>
                        <p className="text-[#e4e4e7] text-xs mt-1 leading-normal italic font-serif">
                          "{proj.tagline}"
                        </p>
                      </div>

                      {proj.projectType === 'Original / Novel' && proj.noveltySpecs && (
                        <div className="mt-2.5 p-2.5 rounded border border-cyan-500/10 bg-cyan-950/5 space-y-1.5 text-[11px]">
                          <div className="flex items-center gap-1 text-cyan-400 font-mono text-[9px] font-bold uppercase tracking-wider">
                            <Sparkles className="h-3 w-3 text-cyan-400" />
                            <span>Verified Quality & Novelty</span>
                          </div>
                          <div className="text-[#a1a1aa] leading-normal font-sans space-y-1 text-xs">
                            <div className="flex items-start gap-1">
                              <span className="text-cyan-500 shrink-0">•</span>
                              <span><strong>Novelty:</strong> {proj.noveltySpecs.architectureNovelty}</span>
                            </div>
                            <div className="flex items-start gap-1">
                              <span className="text-cyan-500 shrink-0">•</span>
                              <span><strong>Guarantees:</strong> {proj.noveltySpecs.qualityGuarantees}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Tech Stack pills */}
                      {proj.techStack.length > 0 && (
                        <div className="mt-3.5 flex flex-wrap gap-1">
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
                    </div>

                    <div className="mt-5 pt-3.5 border-t border-[#27272a] flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        {proj.githubRepo ? (
                          <a
                            href={proj.githubRepo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-[#71717a] hover:text-[#fafafa] flex items-center gap-1 font-mono transition"
                          >
                            <Github className="h-3.5 w-3.5" />
                            Repo <ExternalLink className="h-2 w-2" />
                          </a>
                        ) : (
                          <span className="text-[10px] text-[#52525b] font-mono italic">No repo</span>
                        )}

                        {proj.docUrl && (
                          <a
                            href={proj.docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 px-2 py-1 rounded border border-blue-500/20 flex items-center gap-1 font-mono transition"
                            title={proj.docUrl}
                          >
                            <FileText className="h-3 w-3 text-blue-400 shrink-0" />
                            PRD / Spec <ExternalLink className="h-2 w-2" />
                          </a>
                        )}
                      </div>

                      <button
                        onClick={() => setSelectedProjectId(isSelected ? null : proj.id)}
                        className={`px-3 py-1 text-xs font-semibold rounded transition flex items-center gap-1 cursor-pointer ${
                          isSelected
                            ? 'bg-[#27272a] text-[#a1a1aa]'
                            : 'bg-blue-600 hover:bg-blue-500 text-white'
                        }`}
                      >
                        <Bookmark className="h-3 w-3" />
                        {isSelected ? 'Close Journal' : 'Write Journal'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Section: Expanded Retrospective Journal (6 cols) */}
        <AnimatePresence>
          {selectedProject && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="xl:col-span-6 bg-[#18181b] border border-[#27272a] rounded p-5 space-y-4 h-fit sticky top-4"
              id="retrospective-journal-drawer"
            >
              <div className="flex justify-between items-center border-b border-[#27272a] pb-3">
                <div>
                  <h2 className="text-sm font-bold text-[#fafafa] flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                    Architectural Journal
                  </h2>
                  <span className="font-mono text-[9px] text-[#71717a]">
                    PROJECT: {selectedProject.title.toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedProjectId(null)}
                  className="px-2 py-1 bg-[#09090b] hover:bg-[#27272a] text-[#71717a] text-[10px] rounded border border-[#27272a] transition"
                >
                  Close
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-mono text-[9px] text-[#71717a] uppercase font-bold tracking-widest">
                    Retrospective Log & System Design Decisions
                  </label>
                  <span className="font-mono text-[9px] text-blue-400">Markdown enabled</span>
                </div>
                <textarea
                  value={selectedProject.retrospectiveLog}
                  onChange={(e) => onUpdateProject(selectedProject.id, { retrospectiveLog: e.target.value })}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded p-4 text-xs font-mono text-[#e4e4e7] focus:outline-none focus:border-blue-500 min-h-[450px] leading-relaxed"
                  placeholder={`# Retrospective: ${selectedProject.title}

## Architectural Decisions
- Write down your decisions (e.g., opting for single-threaded event loop to bypass lock contention)

## Systems Barriers Encountered
- Note down bottlenecks (e.g., memory exhaustion due to slow garbage collection bounds)

## Deep Insights & Synthesis
- What fundamental abstraction was dissolved?`}
                />
              </div>

              <div className="bg-[#09090b]/40 p-3.5 border border-[#27272a]/50 rounded text-xs text-[#a1a1aa] flex items-start gap-2 italic font-serif">
                <AlertCircle className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                <span>
                  This journal represents the true artifacts of a craftsman. Storing detailed writeups of your struggles lower down the stack builds immense crystallised knowledge.
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Project Overlay Modal */}
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
              Deconstruct complex dependencies via a reconstruction project, or build high-concurrency, novel system layers of your own design.
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
                    placeholder="e.g., Custom Redis Clone, LSM Database Engine"
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
                  {projectType === 'Original / Novel' ? 'Tagline / Core Vision *' : 'Tagline (What abstraction is being removed?) *'}
                </label>
                <textarea
                  required
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 h-16"
                  placeholder={
                    projectType === 'Original / Novel'
                      ? "e.g., A cluster-native, transactional storage system achieving serializable isolation over multi-regional nodes."
                      : "e.g., Removing the black-box key-value database abstraction by implementing an LSM tree from raw file-systems descriptors in Go."
                  }
                />
              </div>

              {projectType === 'Original / Novel' && (
                <div className="space-y-3 p-3 bg-blue-950/15 border border-blue-900/30 rounded">
                  <div className="flex items-center gap-1.5 text-blue-400 font-mono text-[9px] font-bold uppercase tracking-wider">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Rigorous Novelty & Quality Invariants</span>
                  </div>
                  <p className="text-[10px] text-[#a1a1aa] leading-normal">
                    Original/Novel systems require exceptional technical depth and unique architectural solutions. Simple CRUD applications will not be accepted.
                  </p>

                  <label className="flex items-start gap-2 cursor-pointer mt-1">
                    <input
                      type="checkbox"
                      checked={isNotGenericCrud}
                      onChange={(e) => setIsNotGenericCrud(e.target.checked)}
                      className="mt-0.5 rounded bg-black border-[#27272a] text-blue-600 focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="text-[10px] text-[#e4e4e7] leading-tight select-none font-medium">
                      I verify that this is NOT a boilerplate CRUD application. It incorporates complex low-level engineering.
                    </span>
                  </label>

                  <div>
                    <label className="block text-[9px] text-[#71717a] font-bold uppercase mb-1">
                      Architectural Novelty / Design Aspect *
                    </label>
                    <textarea
                      required={projectType === 'Original / Novel'}
                      value={architectureNovelty}
                      onChange={(e) => setArchitectureNovelty(e.target.value)}
                      placeholder="e.g., Custom consensus backplane, zero-copy lock-free ring-buffer pipeline..."
                      className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 h-14"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] text-[#71717a] font-bold uppercase mb-1">
                      Quality / SLA / Performance Guarantees *
                    </label>
                    <textarea
                      required={projectType === 'Original / Novel'}
                      value={qualityGuarantees}
                      onChange={(e) => setQualityGuarantees(e.target.value)}
                      placeholder="e.g., sub-millisecond p99 latency under 50k write operations/sec..."
                      className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 h-14"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#71717a] uppercase mb-1">
                    GitHub Link (Repo URL)
                  </label>
                  <input
                    type="url"
                    value={githubRepo}
                    onChange={(e) => setGithubRepo(e.target.value)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    placeholder="https://github.com/..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#71717a] uppercase mb-1">
                    PRD / Google Doc Link
                  </label>
                  <input
                    type="url"
                    value={docUrl}
                    onChange={(e) => setDocUrl(e.target.value)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono text-[11px]"
                    placeholder="https://docs.google.com/document/d/..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#71717a] uppercase mb-1">
                  Initial Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Project['status'])}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Idea">Idea</option>
                  <option value="Just Started">Just Started</option>
                  <option value="Halfway Done">Halfway Done</option>
                  <option value="Completed">Completed</option>
                </select>
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
                  placeholder="Rust, POSIX, C++, Linux syscalls"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setTitle('');
                    setTagline('');
                    setGithubRepo('');
                    setStatus('Idea');
                    setTechStackInput('');
                    setProjectType('Reconstruction');
                    setIsNotGenericCrud(false);
                    setArchitectureNovelty('');
                    setQualityGuarantees('');
                    setValidationError('');
                    setShowAddModal(false);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white bg-[#09090b] hover:bg-zinc-900 border border-[#27272a] rounded transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded transition"
                >
                  Log Project
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Custom Deletion Confirmation */}
      <ConfirmModal
        isOpen={projectToDelete !== null}
        title="Purge Project?"
        message={`Are you sure you want to permanently purge the project "${projectToDelete?.title}" and delete all its retrospective architectural journals?`}
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
