/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  JobIntroduction,
  InterviewJournal,
  ResumeSavvy,
  StudyResource,
  SystemDesignNote,
  ScopeKnowledge,
} from '../types';
import { ConfirmModal } from './ConfirmModal';
import {
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Save,
  Sparkles,
  BookOpen,
  User,
  Award,
  Code,
  Cpu,
  Target,
  ChevronDown,
  ChevronUp,
  X,
  Play,
  Star,
  Check,
  Briefcase,
  Layers,
  FileText,
  Bookmark,
  CheckCircle2,
} from 'lucide-react';

interface JobPrepViewProps {
  jobIntroductions: JobIntroduction[];
  interviewJournal: InterviewJournal[];
  resumeSavvy: ResumeSavvy[];
  dsaResources: StudyResource[];
  systemDesignNotes: SystemDesignNote[];
  scopeKnowledge: ScopeKnowledge[];

  onAddJobIntroduction: (title: string, roleType: string, content: string) => void;
  onUpdateJobIntroduction: (id: string, fields: Partial<JobIntroduction>) => void;
  onDeleteJobIntroduction: (id: string) => void;

  onAddInterviewJournal: (type: InterviewJournal['type'], question: string, answer: string) => void;
  onUpdateInterviewJournal: (id: string, fields: Partial<InterviewJournal>) => void;
  onDeleteInterviewJournal: (id: string) => void;

  onAddResumeSavvy: (title: string, context: string, details: string) => void;
  onUpdateResumeSavvy: (id: string, fields: Partial<ResumeSavvy>) => void;
  onDeleteResumeSavvy: (id: string) => void;

  onAddDsaResource: (resource: Omit<StudyResource, 'id'>) => void;
  onUpdateDsaResource: (id: string, fields: Partial<StudyResource>) => void;
  onDeleteDsaResource: (id: string) => void;
  onSetDsaResourceAsFocus: (id: string) => void;

  onAddSystemDesignNote: (title: string, body: string) => void;
  onUpdateSystemDesignNote: (id: string, fields: Partial<SystemDesignNote>) => void;
  onDeleteSystemDesignNote: (id: string) => void;

  onAddScopeKnowledge: (domain: string, topic: string, level: ScopeKnowledge['level'], notes: string) => void;
  onUpdateScopeKnowledge: (id: string, fields: Partial<ScopeKnowledge>) => void;
  onDeleteScopeKnowledge: (id: string) => void;
}

type SubTab = 'introductions' | 'interview' | 'resume' | 'dsa' | 'sysdesign' | 'scope';

export function JobPrepView({
  jobIntroductions = [],
  interviewJournal = [],
  resumeSavvy = [],
  dsaResources = [],
  systemDesignNotes = [],
  scopeKnowledge = [],

  onAddJobIntroduction,
  onUpdateJobIntroduction,
  onDeleteJobIntroduction,

  onAddInterviewJournal,
  onUpdateInterviewJournal,
  onDeleteInterviewJournal,

  onAddResumeSavvy,
  onUpdateResumeSavvy,
  onDeleteResumeSavvy,

  onAddDsaResource,
  onUpdateDsaResource,
  onDeleteDsaResource,
  onSetDsaResourceAsFocus,

  onAddSystemDesignNote,
  onUpdateSystemDesignNote,
  onDeleteSystemDesignNote,

  onAddScopeKnowledge,
  onUpdateScopeKnowledge,
  onDeleteScopeKnowledge,
}: JobPrepViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('introductions');

  // Deletion confirms
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<SubTab | null>(null);

  // Forms Visibility & Edit Mode State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // --- FORM FIELD STATES ---
  // 1. Introductions Fields
  const [introTitle, setIntroTitle] = useState('');
  const [introRoleType, setIntroRoleType] = useState('');
  const [introContent, setIntroContent] = useState('');

  // 2. Interview Journal Fields
  const [journalType, setJournalType] = useState<InterviewJournal['type']>('Q&A');
  const [journalQuestion, setJournalQuestion] = useState('');
  const [journalAnswer, setJournalAnswer] = useState('');

  // 3. Resume Savvyness Fields
  const [resumeTitle, setResumeTitle] = useState('');
  const [resumeContext, setResumeContext] = useState('');
  const [resumeDetails, setResumeDetails] = useState('');

  // 4. DSA Resource Fields
  const [dsaTitle, setDsaTitle] = useState('');
  const [dsaType, setDsaType] = useState<StudyResource['type']>('Book');
  const [dsaCreator, setDsaCreator] = useState('');
  const [dsaTotalUnits, setDsaTotalUnits] = useState(10);
  const [dsaUnitLabel, setDsaUnitLabel] = useState('chapters');
  const [dsaPriority, setDsaPriority] = useState<StudyResource['priority']>('Medium');
  const [dsaUrl, setDsaUrl] = useState('');
  const [dsaNotes, setDsaNotes] = useState('');

  // 5. System Design Fields
  const [sysTitle, setSysTitle] = useState('');
  const [sysBody, setSysBody] = useState('');

  // 6. Scope Knowledge Fields
  const [scopeDomain, setScopeDomain] = useState('');
  const [scopeTopic, setScopeTopic] = useState('');
  const [scopeLevel, setScopeLevel] = useState<ScopeKnowledge['level']>('Core Knowledge');
  const [scopeNotes, setScopeNotes] = useState('');

  // Reset fields function
  const resetFormFields = () => {
    setIntroTitle('');
    setIntroRoleType('');
    setIntroContent('');

    setJournalType('Q&A');
    setJournalQuestion('');
    setJournalAnswer('');

    setResumeTitle('');
    setResumeContext('');
    setResumeDetails('');

    setDsaTitle('');
    setDsaType('Book');
    setDsaCreator('');
    setDsaTotalUnits(10);
    setDsaUnitLabel('chapters');
    setDsaPriority('Medium');
    setDsaUrl('');
    setDsaNotes('');

    setSysTitle('');
    setSysBody('');

    setScopeDomain('');
    setScopeTopic('');
    setScopeLevel('Core Knowledge');
    setScopeNotes('');

    setShowForm(false);
    setEditingId(null);
  };

  // Trigger Edit Form
  const startEdit = (item: any, tab: SubTab) => {
    setEditingId(item.id);
    setShowForm(true);
    if (tab === 'introductions') {
      const i = item as JobIntroduction;
      setIntroTitle(i.title);
      setIntroRoleType(i.roleType);
      setIntroContent(i.content);
    } else if (tab === 'interview') {
      const j = item as InterviewJournal;
      setJournalType(j.type);
      setJournalQuestion(j.question);
      setJournalAnswer(j.answer);
    } else if (tab === 'resume') {
      const r = item as ResumeSavvy;
      setResumeTitle(r.title);
      setResumeContext(r.context);
      setResumeDetails(r.details);
    } else if (tab === 'dsa') {
      const d = item as StudyResource;
      setDsaTitle(d.title);
      setDsaType(d.type);
      setDsaCreator(d.creator);
      setDsaTotalUnits(d.totalUnits);
      setDsaUnitLabel(d.unitLabel);
      setDsaPriority(d.priority);
      setDsaUrl(d.url || '');
      setDsaNotes(d.notes || '');
    } else if (tab === 'sysdesign') {
      const s = item as SystemDesignNote;
      setSysTitle(s.title);
      setSysBody(s.body);
    } else if (tab === 'scope') {
      const k = item as ScopeKnowledge;
      setScopeDomain(k.domain);
      setScopeTopic(k.topic);
      setScopeLevel(k.level);
      setScopeNotes(k.notes);
    }
  };

  // Handle Form Submissions
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeSubTab === 'introductions') {
      if (!introTitle.trim() || !introContent.trim()) return;
      if (editingId) {
        onUpdateJobIntroduction(editingId, { title: introTitle, roleType: introRoleType, content: introContent });
      } else {
        onAddJobIntroduction(introTitle, introRoleType, introContent);
      }
    } else if (activeSubTab === 'interview') {
      if (!journalQuestion.trim() || !journalAnswer.trim()) return;
      if (editingId) {
        onUpdateInterviewJournal(editingId, { type: journalType, question: journalQuestion, answer: journalAnswer });
      } else {
        onAddInterviewJournal(journalType, journalQuestion, journalAnswer);
      }
    } else if (activeSubTab === 'resume') {
      if (!resumeTitle.trim() || !resumeDetails.trim()) return;
      if (editingId) {
        onUpdateResumeSavvy(editingId, { title: resumeTitle, context: resumeContext, details: resumeDetails });
      } else {
        onAddResumeSavvy(resumeTitle, resumeContext, resumeDetails);
      }
    } else if (activeSubTab === 'dsa') {
      if (!dsaTitle.trim()) return;
      if (editingId) {
        onUpdateDsaResource(editingId, {
          title: dsaTitle,
          type: dsaType,
          creator: dsaCreator,
          totalUnits: dsaTotalUnits,
          unitLabel: dsaUnitLabel,
          priority: dsaPriority,
          url: dsaUrl,
          notes: dsaNotes,
        });
      } else {
        onAddDsaResource({
          title: dsaTitle,
          type: dsaType,
          creator: dsaCreator,
          completedUnits: 0,
          totalUnits: dsaTotalUnits,
          unitLabel: dsaUnitLabel,
          priority: dsaPriority,
          isCurrentFocus: false,
          status: 'Not Started',
          notes: dsaNotes,
          url: dsaUrl,
        });
      }
    } else if (activeSubTab === 'sysdesign') {
      if (!sysTitle.trim() || !sysBody.trim()) return;
      if (editingId) {
        onUpdateSystemDesignNote(editingId, { title: sysTitle, body: sysBody });
      } else {
        onAddSystemDesignNote(sysTitle, sysBody);
      }
    } else if (activeSubTab === 'scope') {
      if (!scopeDomain.trim() || !scopeTopic.trim()) return;
      if (editingId) {
        onUpdateScopeKnowledge(editingId, { domain: scopeDomain, topic: scopeTopic, level: scopeLevel, notes: scopeNotes });
      } else {
        onAddScopeKnowledge(scopeDomain, scopeTopic, scopeLevel, scopeNotes);
      }
    }

    resetFormFields();
  };

  // Confirm delete handler
  const confirmDelete = () => {
    if (!deleteId || !deleteType) return;
    if (deleteType === 'introductions') {
      onDeleteJobIntroduction(deleteId);
    } else if (deleteType === 'interview') {
      onDeleteInterviewJournal(deleteId);
    } else if (deleteType === 'resume') {
      onDeleteResumeSavvy(deleteId);
    } else if (deleteType === 'dsa') {
      onDeleteDsaResource(deleteId);
    } else if (deleteType === 'sysdesign') {
      onDeleteSystemDesignNote(deleteId);
    } else if (deleteType === 'scope') {
      onDeleteScopeKnowledge(deleteId);
    }
    setDeleteId(null);
    setDeleteType(null);
  };

  // Helper for quick unit logging in DSA resources
  const handleQuickDsaIncrement = (resource: StudyResource) => {
    const nextVal = resource.completedUnits + 1;
    onUpdateDsaResource(resource.id, { completedUnits: nextVal });
  };

  const handleQuickDsaDecrement = (resource: StudyResource) => {
    const nextVal = Math.max(0, resource.completedUnits - 1);
    onUpdateDsaResource(resource.id, { completedUnits: nextVal });
  };

  // Mini Markdown Renderer
  const renderMiniMarkdown = (text: string) => {
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('## ')) {
        return <h3 key={idx} className="text-xs font-bold text-blue-400 mt-4 mb-2 tracking-wide font-sans">{line.replace('## ', '')}</h3>;
      }
      if (line.startsWith('# ')) {
        return <h2 key={idx} className="text-sm font-bold text-white mt-5 mb-3 border-b border-[#27272a] pb-1 font-sans">{line.replace('# ', '')}</h2>;
      }
      if (line.startsWith('- ') || line.startsWith('• ')) {
        const cleanLine = line.replace(/^[-•]\s*/, '');
        return (
          <li key={idx} className="text-xs text-[#a1a1aa] list-disc list-inside ml-2 my-1 leading-relaxed">
            {renderBoldTextTokens(cleanLine)}
          </li>
        );
      }
      return <p key={idx} className="text-xs text-[#a1a1aa] leading-relaxed my-2">{renderBoldTextTokens(line)}</p>;
    });
  };

  const renderBoldTextTokens = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="text-white font-bold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  // Grouped scope knowledge
  const scopeByDomain = React.useMemo(() => {
    const groups: { [key: string]: ScopeKnowledge[] } = {};
    scopeKnowledge.forEach((item) => {
      if (!groups[item.domain]) {
        groups[item.domain] = [];
      }
      groups[item.domain].push(item);
    });
    return groups;
  }, [scopeKnowledge]);

  return (
    <div className="space-y-6" id="job-prep-workspace">
      {/* 1. TOP HEADER */}
      <div className="bg-gradient-to-r from-zinc-900 to-[#18181b] border border-[#27272a] p-6 rounded relative overflow-hidden" id="jobprep-header">
        <div className="absolute -right-16 -bottom-16 w-56 h-56 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono bg-blue-950/40 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
              Career Acceleration
            </span>
          </div>
          <h1 className="text-xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-blue-500" />
            Job Prep Workspace
          </h1>
          <p className="text-xs text-[#71717a] max-w-2xl leading-relaxed">
            Track introductions, record complex interview stories, refine project resumes, manage algorithmic studies, compile system designs, and index domain knowledge.
          </p>
        </div>
      </div>

      {/* 2. SUB NAVIGATION TABS */}
      <div className="flex flex-wrap gap-1 bg-[#18181b] border border-[#27272a] p-1 rounded" id="jobprep-subtabs">
        {(
          [
            { id: 'introductions', label: 'Introductions', icon: User },
            { id: 'interview', label: 'Interview Journal', icon: BookOpen },
            { id: 'resume', label: 'Resume Savvyness', icon: Layers },
            { id: 'dsa', label: 'DSA Tracker', icon: Code },
            { id: 'sysdesign', label: 'System Design', icon: Cpu },
            { id: 'scope', label: 'Knowledge Scope', icon: Target },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id);
                resetFormFields();
              }}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded transition ${
                isActive
                  ? 'bg-blue-600/15 border border-blue-500/20 text-blue-400 font-bold'
                  : 'bg-transparent border border-transparent text-[#a1a1aa] hover:text-white hover:bg-[#1f1f23]'
              }`}
              id={`jobprep-tab-${tab.id}`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-blue-400' : 'text-zinc-500'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 3. CORE SUBTAB BODY LAYOUT */}
      <div className="grid grid-cols-1 gap-6">
        {/* RIGHT COLUMN DETAILS OR GRID CARDS DEPENDING ON ACTIVE TAB */}
        <div className="space-y-6">
          {/* HEADER ACTION ROW */}
          <div className="flex justify-between items-center bg-[#18181b] border border-[#27272a] px-4 py-3 rounded">
            <span className="text-[10px] font-mono text-[#71717a] uppercase font-bold tracking-wider">
              {activeSubTab === 'introductions' && `Tracked Profiles: ${jobIntroductions.length}`}
              {activeSubTab === 'interview' && `Logged QA/Situations: ${interviewJournal.length}`}
              {activeSubTab === 'resume' && `Project Repositories: ${resumeSavvy.length}`}
              {activeSubTab === 'dsa' && `DSA Trackers: ${dsaResources.length}`}
              {activeSubTab === 'sysdesign' && `Design Notebooks: ${systemDesignNotes.length}`}
              {activeSubTab === 'scope' && `Defined Capabilities: ${scopeKnowledge.length}`}
            </span>

            <button
              onClick={() => {
                if (showForm) {
                  resetFormFields();
                } else {
                  setShowForm(true);
                  setEditingId(null);
                }
              }}
              className="bg-blue-600 hover:bg-blue-500 border border-blue-500/20 text-white px-3 py-1.5 rounded text-[10px] font-bold uppercase transition flex items-center gap-1 cursor-pointer"
            >
              {showForm ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
              {showForm ? 'Cancel Form' : `Add ${activeSubTab === 'introductions' ? 'Intro' : activeSubTab === 'interview' ? 'Q&A' : activeSubTab === 'resume' ? 'Project' : activeSubTab === 'dsa' ? 'Resource' : activeSubTab === 'sysdesign' ? 'Note' : 'Capability'}`}
            </button>
          </div>

          {/* 4. DYNAMIC ADD/EDIT FORM ACCORDION */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-[#18181b] border border-blue-500/20 rounded p-5 overflow-hidden"
              >
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-blue-400 border-b border-[#27272a] pb-2 mb-3">
                    {editingId ? '✏️ Edit Existing Node' : '➕ Instantiate New Record'}
                  </h3>

                  {/* TAB 1: INTRODUCTIONS FORM */}
                  {activeSubTab === 'introductions' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-1">
                        <label className="block text-[9px] font-mono font-bold text-[#71717a] uppercase mb-1 tracking-wider">Introduction Title / Label</label>
                        <input
                          type="text"
                          placeholder="e.g. Senior Systems Developer Profile"
                          value={introTitle}
                          onChange={(e) => setIntroTitle(e.target.value)}
                          className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-bold"
                          required
                        />
                      </div>
                      <div className="md:col-span-1">
                        <label className="block text-[9px] font-mono font-bold text-[#71717a] uppercase mb-1 tracking-wider">Role Suitability</label>
                        <input
                          type="text"
                          placeholder="e.g. Backend, Full-Stack, Staff"
                          value={introRoleType}
                          onChange={(e) => setIntroRoleType(e.target.value)}
                          className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-bold"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[9px] font-mono font-bold text-[#71717a] uppercase mb-1 tracking-wider">Introduction Narrative (Paragraphs)</label>
                        <textarea
                          placeholder="Write a highly customized pitch about yourself..."
                          value={introContent}
                          onChange={(e) => setIntroContent(e.target.value)}
                          rows={5}
                          className="w-full bg-[#09090b] border border-[#27272a] rounded p-3 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 2: INTERVIEW JOURNAL FORM */}
                  {activeSubTab === 'interview' && (
                    <div className="grid grid-cols-1 gap-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-1">
                          <label className="block text-[9px] font-mono font-bold text-[#71717a] uppercase mb-1 tracking-wider">Format Type</label>
                          <select
                            value={journalType}
                            onChange={(e) => setJournalType(e.target.value as any)}
                            className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-bold cursor-pointer"
                          >
                            <option value="Q&A">Standard Q&A</option>
                            <option value="STAR/Situation">STAR / Situation notes</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[9px] font-mono font-bold text-[#71717a] uppercase mb-1 tracking-wider">Question or Prompt Title</label>
                          <input
                            type="text"
                            placeholder="e.g. Tell me about a time you handled conflict?"
                            value={journalQuestion}
                            onChange={(e) => setJournalQuestion(e.target.value)}
                            className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-bold"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono font-bold text-[#71717a] uppercase mb-1 tracking-wider">Response Details (Supports Markdown #, ##, -)</label>
                        <textarea
                          placeholder="Provide the structured answers. Use STAR format (Situation, Task, Action, Result) if behavioral..."
                          value={journalAnswer}
                          onChange={(e) => setJournalAnswer(e.target.value)}
                          rows={6}
                          className="w-full bg-[#09090b] border border-[#27272a] rounded p-3 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 3: RESUME SAVVYNESS FORM */}
                  {activeSubTab === 'resume' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-mono font-bold text-[#71717a] uppercase mb-1 tracking-wider">Project or Work Name</label>
                        <input
                          type="text"
                          placeholder="e.g. LSM-Tree Storage Engine Implementation"
                          value={resumeTitle}
                          onChange={(e) => setResumeTitle(e.target.value)}
                          className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-bold"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono font-bold text-[#71717a] uppercase mb-1 tracking-wider">Context & Technical Role</label>
                        <input
                          type="text"
                          placeholder="e.g. Solo Developer / Go, Redis"
                          value={resumeContext}
                          onChange={(e) => setResumeContext(e.target.value)}
                          className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-bold"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[9px] font-mono font-bold text-[#71717a] uppercase mb-1 tracking-wider">Specific Accomplishments & Details (Bullet points, e.g. using • or -)</label>
                        <textarea
                          placeholder="• Achieved 15k writes/sec using non-blocking skiplist MemTable...&#10;• Designed async compaction background workers..."
                          value={resumeDetails}
                          onChange={(e) => setResumeDetails(e.target.value)}
                          rows={5}
                          className="w-full bg-[#09090b] border border-[#27272a] rounded p-3 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 4: DSA RESOURCE FORM */}
                  {activeSubTab === 'dsa' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-[9px] font-mono font-bold text-[#71717a] uppercase mb-1 tracking-wider">Resource Title / Course name</label>
                        <input
                          type="text"
                          placeholder="e.g. Blind 75 LeetCode Playlist"
                          value={dsaTitle}
                          onChange={(e) => setDsaTitle(e.target.value)}
                          className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-bold"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono font-bold text-[#71717a] uppercase mb-1 tracking-wider">Author / Creator</label>
                        <input
                          type="text"
                          placeholder="e.g. Yangshun Tay"
                          value={dsaCreator}
                          onChange={(e) => setDsaCreator(e.target.value)}
                          className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono font-bold text-[#71717a] uppercase mb-1 tracking-wider">Type</label>
                        <select
                          value={dsaType}
                          onChange={(e) => setDsaType(e.target.value as any)}
                          className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-bold cursor-pointer"
                        >
                          <option value="Book">Book</option>
                          <option value="Course/Playlist">Course / Playlist</option>
                          <option value="Documentation">Documentation</option>
                          <option value="Article/Paper">Article / Paper</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono font-bold text-[#71717a] uppercase mb-1 tracking-wider">Total Units</label>
                        <input
                          type="number"
                          value={dsaTotalUnits}
                          onChange={(e) => setDsaTotalUnits(Number(e.target.value))}
                          className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono font-bold text-[#71717a] uppercase mb-1 tracking-wider">Unit label</label>
                        <input
                          type="text"
                          placeholder="e.g. problems, chapters, videos"
                          value={dsaUnitLabel}
                          onChange={(e) => setDsaUnitLabel(e.target.value)}
                          className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono font-bold text-[#71717a] uppercase mb-1 tracking-wider">Priority</label>
                        <select
                          value={dsaPriority}
                          onChange={(e) => setDsaPriority(e.target.value as any)}
                          className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-bold cursor-pointer"
                        >
                          <option value="Low">Low Priority</option>
                          <option value="Medium">Medium Priority</option>
                          <option value="High">High Priority</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[9px] font-mono font-bold text-[#71717a] uppercase mb-1 tracking-wider">Reference Link / URL</label>
                        <input
                          type="text"
                          placeholder="e.g. https://leetcode.com"
                          value={dsaUrl}
                          onChange={(e) => setDsaUrl(e.target.value)}
                          className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-[9px] font-mono font-bold text-[#71717a] uppercase mb-1 tracking-wider">Notes</label>
                        <input
                          type="text"
                          placeholder="Quick summary notes..."
                          value={dsaNotes}
                          onChange={(e) => setDsaNotes(e.target.value)}
                          className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-xs text-[#fafafa] focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 5: SYSTEM DESIGN FORM */}
                  {activeSubTab === 'sysdesign' && (
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-[9px] font-mono font-bold text-[#71717a] uppercase mb-1 tracking-wider">Question Title / Target System</label>
                        <input
                          type="text"
                          placeholder="e.g. How to design a Distributed Rate Limiter?"
                          value={sysTitle}
                          onChange={(e) => setSysTitle(e.target.value)}
                          className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-bold"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono font-bold text-[#71717a] uppercase mb-1 tracking-wider">Analysis, Tradeoffs & Answers (Supports Markdown #, ##, -)</label>
                        <textarea
                          placeholder="## 1. Requirements...&#10;## 2. Core Architecture...&#10;- Token Bucket vs Leaky Bucket..."
                          value={sysBody}
                          onChange={(e) => setSysBody(e.target.value)}
                          rows={10}
                          className="w-full bg-[#09090b] border border-[#27272a] rounded p-3 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 6: SCOPE KNOWLEDGE FORM */}
                  {activeSubTab === 'scope' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-mono font-bold text-[#71717a] uppercase mb-1 tracking-wider">Domain Category</label>
                        <input
                          type="text"
                          placeholder="e.g. Distributed Systems, Databases, Front-End"
                          value={scopeDomain}
                          onChange={(e) => setScopeDomain(e.target.value)}
                          className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-bold"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono font-bold text-[#71717a] uppercase mb-1 tracking-wider">Specific Topic / Tool / Concept</label>
                        <input
                          type="text"
                          placeholder="e.g. Raft Consensus Algorithm"
                          value={scopeTopic}
                          onChange={(e) => setScopeTopic(e.target.value)}
                          className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-bold"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono font-bold text-[#71717a] uppercase mb-1 tracking-wider">Depth / Level of Mastery</label>
                        <select
                          value={scopeLevel}
                          onChange={(e) => setScopeLevel(e.target.value as any)}
                          className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-bold cursor-pointer"
                        >
                          <option value="Familiar">Familiar (Elementary grasp)</option>
                          <option value="Core Knowledge">Core Knowledge (Competent, can use in production)</option>
                          <option value="Deep Expertise">Deep Expertise (Strong architectural command)</option>
                          <option value="Mastered">Mastered (Absolute source of truth capability)</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[9px] font-mono font-bold text-[#71717a] uppercase mb-1 tracking-wider">Scope Proof & Notes (What exactly do you know here?)</label>
                        <textarea
                          placeholder="e.g. Understand joint consensus, logs recovery, leader elections, log compaction..."
                          value={scopeNotes}
                          onChange={(e) => setScopeNotes(e.target.value)}
                          rows={3}
                          className="w-full bg-[#09090b] border border-[#27272a] rounded p-3 text-xs text-[#fafafa] focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* FORM ACTIONS */}
                  <div className="flex justify-end gap-2 pt-2 border-t border-[#27272a]">
                    <button
                      type="button"
                      onClick={resetFormFields}
                      className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white bg-[#09090b] hover:bg-zinc-900 border border-[#27272a] rounded transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded transition cursor-pointer"
                    >
                      {editingId ? 'Save Changes' : 'Instantiate'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 5. DATA RENDER SECTION */}
          {/* TAB 1: INTRODUCTIONS LIST */}
          {activeSubTab === 'introductions' && (
            <div className="space-y-4" id="introductions-list">
              {jobIntroductions.length === 0 ? (
                <div className="text-center py-12 text-xs text-[#71717a] border border-dashed border-[#27272a] rounded">
                  No custom job introductions written. Tap 'Add Intro' to create one.
                </div>
              ) : (
                jobIntroductions.map((intro) => (
                  <div
                    key={intro.id}
                    className="bg-[#18181b] border border-[#27272a] p-5 rounded space-y-3 relative group"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] font-mono bg-[#09090b] border border-blue-500/20 text-blue-400 font-bold px-2 py-0.5 rounded uppercase">
                            {intro.roleType || 'General'}
                          </span>
                        </div>
                        <h3 className="text-xs font-bold text-white mt-1.5">{intro.title}</h3>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition">
                        <button
                          onClick={() => startEdit(intro, 'introductions')}
                          className="p-1.5 bg-[#09090b] hover:bg-[#27272a] text-[#71717a] hover:text-white border border-[#27272a] rounded transition cursor-pointer"
                          title="Edit Profile"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteId(intro.id);
                            setDeleteType('introductions');
                          }}
                          className="p-1.5 bg-[#09090b] hover:bg-red-950/20 text-[#71717a] hover:text-red-400 border border-[#27272a] rounded transition cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-[#09090b]/50 border border-[#27272a]/50 rounded font-mono text-xs text-[#a1a1aa] leading-relaxed whitespace-pre-wrap">
                      {intro.content}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: INTERVIEW JOURNAL LIST */}
          {activeSubTab === 'interview' && (
            <div className="space-y-4" id="interview-journal-list">
              {interviewJournal.length === 0 ? (
                <div className="text-center py-12 text-xs text-[#71717a] border border-dashed border-[#27272a] rounded">
                  No interview Q&A or STAR situations logged yet.
                </div>
              ) : (
                interviewJournal.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#18181b] border border-[#27272a] p-5 rounded space-y-3 relative group"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <span className={`text-[8px] font-mono border px-2 py-0.5 rounded font-bold uppercase ${
                          item.type === 'STAR/Situation'
                            ? 'bg-purple-950/20 border-purple-500/20 text-purple-400'
                            : 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400'
                        }`}>
                          {item.type}
                        </span>
                        <h3 className="text-xs font-bold text-white mt-2 leading-snug">{item.question}</h3>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition">
                        <button
                          onClick={() => startEdit(item, 'interview')}
                          className="p-1.5 bg-[#09090b] hover:bg-[#27272a] text-[#71717a] hover:text-white border border-[#27272a] rounded transition cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteId(item.id);
                            setDeleteType('interview');
                          }}
                          className="p-1.5 bg-[#09090b] hover:bg-red-950/20 text-[#71717a] hover:text-red-400 border border-[#27272a] rounded transition cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-[#09090b]/50 border border-[#27272a]/50 rounded font-sans text-xs">
                      {renderMiniMarkdown(item.answer)}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: RESUME SAVVYNESS LIST */}
          {activeSubTab === 'resume' && (
            <div className="space-y-4" id="resume-savvy-list">
              {resumeSavvy.length === 0 ? (
                <div className="text-center py-12 text-xs text-[#71717a] border border-dashed border-[#27272a] rounded">
                  No project accomplishments recorded for interview recall yet.
                </div>
              ) : (
                resumeSavvy.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#18181b] border border-[#27272a] p-5 rounded space-y-3 relative group"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <span className="text-[8px] font-mono bg-[#09090b] border border-blue-500/20 text-blue-400 font-bold px-2 py-0.5 rounded uppercase">
                          {item.context || 'Project Context'}
                        </span>
                        <h3 className="text-xs font-bold text-white mt-1.5">{item.title}</h3>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition">
                        <button
                          onClick={() => startEdit(item, 'resume')}
                          className="p-1.5 bg-[#09090b] hover:bg-[#27272a] text-[#71717a] hover:text-white border border-[#27272a] rounded transition cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteId(item.id);
                            setDeleteType('resume');
                          }}
                          className="p-1.5 bg-[#09090b] hover:bg-red-950/20 text-[#71717a] hover:text-red-400 border border-[#27272a] rounded transition cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-[#09090b]/50 border border-[#27272a]/50 rounded font-mono text-xs text-[#a1a1aa] leading-relaxed whitespace-pre-wrap">
                      {item.details}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: DSA SPREADSHEETS */}
          {activeSubTab === 'dsa' && (
            <div className="space-y-4" id="dsa-resources-table">
              {dsaResources.length === 0 ? (
                <div className="text-center py-12 text-xs text-[#71717a] border border-dashed border-[#27272a] rounded">
                  No DSA resources logged. Get started by clicking 'Add Resource'.
                </div>
              ) : (
                <div className="bg-[#18181b] border border-[#27272a] rounded overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="border-b border-[#27272a] bg-[#09090b]/80 font-mono text-[9px] text-zinc-500 uppercase tracking-wider font-bold">
                        <th className="p-3">Focus</th>
                        <th className="p-3">DSA Topic / Material</th>
                        <th className="p-3">Type / Creator</th>
                        <th className="p-3">Priority</th>
                        <th className="p-3">Units Progress</th>
                        <th className="p-3 text-center">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#27272a] text-xs">
                      {dsaResources.map((res) => {
                        const percent = Math.round((res.completedUnits / res.totalUnits) * 100) || 0;
                        const labelSingular = res.unitLabel.endsWith('s')
                          ? res.unitLabel.substring(0, res.unitLabel.length - 1)
                          : res.unitLabel;

                        return (
                          <tr key={res.id} className="hover:bg-[#1c1c1f]/50 transition group">
                            {/* Toggle Current Focus */}
                            <td className="p-3">
                              <button
                                onClick={() => onSetDsaResourceAsFocus(res.id)}
                                className={`p-1 rounded border transition cursor-pointer ${
                                  res.isCurrentFocus
                                    ? 'bg-blue-600/10 border-blue-500 text-blue-400'
                                    : 'bg-transparent border-[#27272a] text-zinc-600 hover:text-zinc-400'
                                }`}
                                title={res.isCurrentFocus ? 'Active Focus Item' : 'Mark as Current Focus'}
                              >
                                <Star className={`h-3 w-3 ${res.isCurrentFocus ? 'fill-current' : ''}`} />
                              </button>
                            </td>

                            <td className="p-3 font-semibold text-white max-w-xs">
                              <div className="truncate" title={res.title}>
                                {res.title}
                              </div>
                              {res.notes && (
                                <p className="text-[10px] text-[#71717a] font-normal truncate mt-0.5" title={res.notes}>
                                  {res.notes}
                                </p>
                              )}
                            </td>

                            <td className="p-3">
                              <div className="font-mono text-[9px] text-[#a1a1aa] uppercase">{res.type}</div>
                              <div className="text-[10px] text-[#71717a]">{res.creator || 'Self-Guided'}</div>
                            </td>

                            {/* Priority Badge */}
                            <td className="p-3">
                              <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                                res.priority === 'High'
                                  ? 'bg-red-950/20 text-red-400 border border-red-900/30'
                                  : res.priority === 'Medium'
                                  ? 'bg-amber-950/20 text-amber-400 border border-amber-900/30'
                                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                              }`}>
                                {res.priority}
                              </span>
                            </td>

                            {/* Unit Progress Counter & Adjuster */}
                            <td className="p-3 font-mono">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleQuickDsaDecrement(res)}
                                  className="w-5 h-5 bg-[#09090b] hover:bg-[#27272a] text-[#71717a] hover:text-white border border-[#27272a] rounded flex items-center justify-center font-bold select-none cursor-pointer text-xs"
                                >
                                  -
                                </button>
                                <span className="text-[11px] font-bold text-white min-w-14 text-center">
                                  {res.completedUnits} / {res.totalUnits}
                                </span>
                                <button
                                  onClick={() => handleQuickDsaIncrement(res)}
                                  className="w-5 h-5 bg-[#09090b] hover:bg-[#27272a] text-[#71717a] hover:text-white border border-[#27272a] rounded flex items-center justify-center font-bold select-none cursor-pointer text-xs"
                                >
                                  +
                                </button>
                              </div>
                              {/* Small Progress Bar */}
                              <div className="w-28 bg-[#09090b] h-1 rounded-full overflow-hidden mt-1.5 border border-[#27272a]">
                                <div
                                  className="bg-blue-500 h-full transition-all duration-300"
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </td>

                            {/* Status Badge */}
                            <td className="p-3 text-center">
                              <span className={`inline-block text-[8px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                                res.status === 'Completed'
                                  ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-900/40'
                                  : res.status === 'In Progress'
                                  ? 'bg-blue-950/20 text-blue-400 border border-blue-900/40'
                                  : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                              }`}>
                                {res.status}
                              </span>
                            </td>

                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {res.url && (
                                  <a
                                    href={res.url.startsWith('http') ? res.url : `https://${res.url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 bg-[#09090b] hover:bg-[#27272a] text-[#71717a] hover:text-white border border-[#27272a] rounded transition"
                                    title="Open Resource Link"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                )}
                                <button
                                  onClick={() => startEdit(res, 'dsa')}
                                  className="p-1 bg-[#09090b] hover:bg-[#27272a] text-[#71717a] hover:text-white border border-[#27272a] rounded transition cursor-pointer"
                                  title="Edit Resource"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => {
                                    setDeleteId(res.id);
                                    setDeleteType('dsa');
                                  }}
                                  className="p-1 bg-[#09090b] hover:bg-red-950/20 text-[#71717a] hover:text-red-400 border border-[#27272a] rounded transition cursor-pointer"
                                  title="Delete Resource"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SYSTEM DESIGN */}
          {activeSubTab === 'sysdesign' && (
            <div className="space-y-4" id="sys-design-notes-list">
              {systemDesignNotes.length === 0 ? (
                <div className="text-center py-12 text-xs text-[#71717a] border border-dashed border-[#27272a] rounded">
                  No system design notebooks initialized yet. Let's create one!
                </div>
              ) : (
                systemDesignNotes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-[#18181b] border border-[#27272a] p-5 rounded space-y-3 relative group"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Cpu className="h-4 w-4 text-blue-400" />
                        {note.title}
                      </h3>

                      <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition">
                        <button
                          onClick={() => startEdit(note, 'sysdesign')}
                          className="p-1.5 bg-[#09090b] hover:bg-[#27272a] text-[#71717a] hover:text-white border border-[#27272a] rounded transition cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteId(note.id);
                            setDeleteType('sysdesign');
                          }}
                          className="p-1.5 bg-[#09090b] hover:bg-red-950/20 text-[#71717a] hover:text-red-400 border border-[#27272a] rounded transition cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-[#09090b]/50 border border-[#27272a]/50 rounded font-sans text-xs">
                      {renderMiniMarkdown(note.body)}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 6: KNOWLEDGE SCOPE */}
          {activeSubTab === 'scope' && (
            <div className="space-y-6" id="knowledge-scope-dashboard">
              {scopeKnowledge.length === 0 ? (
                <div className="text-center py-12 text-xs text-[#71717a] border border-dashed border-[#27272a] rounded">
                  No core capabilities registered in your Knowledge Scope.
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.keys(scopeByDomain).map((domainName) => (
                    <div key={domainName} className="space-y-3">
                      <h4 className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest border-b border-[#27272a] pb-1 pl-1">
                        📦 {domainName}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {scopeByDomain[domainName].map((item) => (
                          <div
                            key={item.id}
                            className="bg-[#18181b] border border-[#27272a] p-4 rounded relative overflow-hidden group space-y-2"
                          >
                            <div className="flex justify-between items-start gap-4">
                              <h5 className="text-xs font-bold text-[#fafafa]">{item.topic}</h5>

                              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition">
                                <button
                                  onClick={() => startEdit(item, 'scope')}
                                  className="p-1 bg-[#09090b] hover:bg-[#27272a] text-[#71717a] hover:text-white border border-[#27272a] rounded transition cursor-pointer"
                                  title="Edit"
                                >
                                  <Edit2 className="h-2.5 w-2.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    setDeleteId(item.id);
                                    setDeleteType('scope');
                                  }}
                                  className="p-1 bg-[#09090b] hover:bg-red-950/20 text-[#71717a] hover:text-red-400 border border-[#27272a] rounded transition cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 className="h-2.5 w-2.5" />
                                </button>
                              </div>
                            </div>

                            {/* Confidence Level Tag */}
                            <div>
                              <span className={`text-[8px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                                item.level === 'Mastered'
                                  ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-500/20'
                                  : item.level === 'Deep Expertise'
                                  ? 'bg-blue-950/20 text-blue-400 border border-blue-500/20'
                                  : item.level === 'Core Knowledge'
                                  ? 'bg-purple-950/20 text-purple-400 border border-purple-500/20'
                                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                              }`}>
                                🎖️ {item.level}
                              </span>
                            </div>

                            {item.notes && (
                              <p className="text-xs text-[#a1a1aa] bg-[#09090b]/50 border border-[#27272a]/30 p-2 rounded leading-relaxed text-[11px]">
                                {item.notes}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={deleteId !== null}
        title={`Delete ${activeSubTab === 'introductions' ? 'Intro Profile' : activeSubTab === 'interview' ? 'Interview Log' : activeSubTab === 'resume' ? 'Project Details' : activeSubTab === 'dsa' ? 'Resource Tracker' : activeSubTab === 'sysdesign' ? 'Design Notebook' : 'Capability node'}?`}
        message="This action is irreversible and will permanently purge this record."
        confirmText="Yes, Purge Record"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteId(null);
          setDeleteType(null);
        }}
        variant="danger"
      />
    </div>
  );
}
