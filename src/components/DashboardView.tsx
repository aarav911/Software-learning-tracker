/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Topic,
  Specialization,
  StudyResource,
  StudyLog,
  PassiveLearningItem,
} from '../types';
import { ConfirmModal } from './ConfirmModal';
import {
  Compass,
  Play,
  Plus,
  BookOpen,
  CheckCircle2,
  Clock,
  History,
  TrendingUp,
  Bookmark,
  Calendar,
  AlertCircle,
  FileText,
  ChevronRight,
  Trash2,
  ExternalLink,
  RotateCw,
  Sparkles,
  Tv,
} from 'lucide-react';

interface DashboardViewProps {
  topics: Topic[];
  specializations: Specialization[];
  studyLogs: StudyLog[];
  onAddStudyLog: (
    topicId: string,
    resourceId: string,
    newProgress: number,
    notes: string,
    durationMinutes: number
  ) => void;
  onDeleteLog: (id: string) => void;
  passiveLearningItems?: PassiveLearningItem[];
  passiveRotationIndex?: number;
  onIncrementPassiveProgress?: (id: string, delta: number) => void;
  onAdvancePassiveRotation?: () => void;
}

export function DashboardView({
  topics,
  specializations = [],
  studyLogs,
  onAddStudyLog,
  onDeleteLog,
  passiveLearningItems = [],
  passiveRotationIndex = 0,
  onIncrementPassiveProgress,
  onAdvancePassiveRotation,
}: DashboardViewProps) {
  // Combine topics and specializations for unified ingestion dropdown
  const unifiedDropdownOptions = React.useMemo(() => [
    ...topics.map((t) => ({ id: t.id, title: t.title, type: 'Subject' as const, resources: t.resources })),
    ...specializations.map((s) => ({ id: s.id, title: s.title, type: 'Specialization' as const, resources: s.resources })),
  ], [topics, specializations]);

  // Ingestion form state
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [selectedResourceId, setSelectedResourceId] = useState<string>('');
  const [progressUnits, setProgressUnits] = useState<number>(0);
  const [studyNotes, setStudyNotes] = useState<string>('');
  const [duration, setDuration] = useState<number>(45);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Deletion confirm state
  const [logToDelete, setLogToDelete] = useState<StudyLog | null>(null);

  // Initialize selected topic ID when options are loaded
  React.useEffect(() => {
    if (!selectedTopicId && unifiedDropdownOptions.length > 0) {
      setSelectedTopicId(unifiedDropdownOptions[0].id);
    }
  }, [unifiedDropdownOptions, selectedTopicId]);

  // Filter resources based on selected topic/specialization in the ingestion form
  const selectedParent = unifiedDropdownOptions.find((o) => o.id === selectedTopicId);
  const activeResources = selectedParent?.resources || [];

  // Update selected resource when topic changes
  React.useEffect(() => {
    if (activeResources.length > 0) {
      // Prefer current focus, else first resource
      const focusRes = activeResources.find((r) => r.isCurrentFocus) || activeResources[0];
      setSelectedResourceId(focusRes.id);
      setProgressUnits(focusRes.completedUnits);
    } else {
      setSelectedResourceId('');
      setProgressUnits(0);
    }
  }, [selectedTopicId, topics, specializations]);

  // Update progress units when resource selection changes
  React.useEffect(() => {
    const resource = activeResources.find((r) => r.id === selectedResourceId);
    if (resource) {
      setProgressUnits(resource.completedUnits);
    }
  }, [selectedResourceId]);

  const handleIngestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTopicId || !selectedResourceId) return;

    const resource = activeResources.find((r) => r.id === selectedResourceId);
    if (!resource) return;

    onAddStudyLog(
      selectedTopicId,
      selectedResourceId,
      progressUnits,
      studyNotes.trim() || `Updated progress on ${resource.title}`,
      duration
    );

    // Show temporary success feedback
    setSuccessMessage(`Logged progress for ${resource.title}!`);
    setTimeout(() => setSuccessMessage(null), 3000);

    // Reset ingestion states
    setStudyNotes('');
  };

  const handleQuickIncrement = (topicId: string, resource: StudyResource) => {
    const targetVal = Math.min(resource.totalUnits, resource.completedUnits + 1);
    onAddStudyLog(
      topicId,
      resource.id,
      targetVal,
      `Completed ${resource.unitLabel.substring(0, resource.unitLabel.length - 1)} ${targetVal} of ${resource.title} via Quick-Action.`,
      30
    );
  };

  // Stats calculation (Unifying topics and core specializations)
  const totalTopics = topics.length;
  const totalSpecs = specializations.length;
  const totalResources = topics.reduce((acc, t) => acc + t.resources.length, 0) +
                         specializations.reduce((acc, s) => acc + s.resources.length, 0);
  const totalStudyTime = studyLogs.reduce((acc, l) => acc + (l.durationMinutes || 0), 0);
  const completedResources = topics.reduce((acc, t) => acc + t.resources.filter((r) => r.status === 'Completed').length, 0) +
                             specializations.reduce((acc, s) => acc + s.resources.filter((r) => r.status === 'Completed').length, 0);

  // Heuristic-based Smart Study Recommendation Engine (NOT AI)
  const recommendations = React.useMemo(() => {
    const allResourcesWithContext = [
      ...topics.flatMap((t) =>
        t.resources.map((r) => ({
          parent: t,
          type: 'Topic' as const,
          resource: r,
        }))
      ),
      ...specializations.flatMap((s) =>
        s.resources.map((r) => ({
          parent: s,
          type: 'Specialization' as const,
          resource: r,
        }))
      ),
    ];

    return allResourcesWithContext
      .filter((item) => item.resource.status !== 'Completed')
      .map((item) => {
        const { resource } = item;
        let score = 0;

        // 1. Current focus bonus (Highly critical manual intent)
        if (resource.isCurrentFocus) {
          score += 100;
        }

        // 2. Priority weighting
        if (resource.priority === 'High') {
          score += 30;
        } else if (resource.priority === 'Medium') {
          score += 15;
        }

        // 3. Momentum (In Progress) bonus
        if (resource.status === 'In Progress') {
          score += 25;
        }

        // 4. Proximity to completion bonus
        const pct = (resource.completedUnits / resource.totalUnits) || 0;
        if (pct >= 0.75) {
          score += 20;
        } else if (pct >= 0.5) {
          score += 10;
        }

        // 5. Recent study activity boost (last 3 days)
        const hasRecentLog = studyLogs.some(
          (log) => log.resourceId === resource.id && (Date.now() - new Date(log.timestamp).getTime() < 3 * 24 * 3600 * 1000)
        );
        if (hasRecentLog) {
          score += 15;
        }

        return {
          ...item,
          score,
          pct: Math.round(pct * 100),
        };
      })
      .sort((a, b) => b.score - a.score); // Highest priority first
  }, [topics, specializations, studyLogs]);

  // Determine elegant recommendation reason
  const getRecommendationReason = (item: typeof recommendations[number]) => {
    const { resource } = item;
    if (resource.isCurrentFocus && resource.priority === 'High') {
      return '⭐ Designated high-priority active focus target';
    }
    if (resource.isCurrentFocus) {
      return '⭐ Designated active focus target';
    }
    const pct = (resource.completedUnits / resource.totalUnits) || 0;
    if (pct >= 0.75) {
      return `🔥 Strong momentum (${Math.round(pct * 100)}% complete) — finish it up!`;
    }
    if (resource.status === 'In Progress' && resource.priority === 'High') {
      return '🚀 High priority ongoing study tract';
    }
    if (resource.status === 'In Progress') {
      return '📈 Ongoing study module with active progress';
    }
    if (resource.priority === 'High') {
      return '⚡ High priority target to initiate';
    }
    return '📚 Recommended resource to expand domain coverage';
  };

  // Passive Learning Rotation Recommendation
  const passiveRotationList = React.useMemo(() => {
    return (passiveLearningItems || []).filter(
      (i) => i.inRotation && i.completedUnits < i.totalUnits
    );
  }, [passiveLearningItems]);

  const passiveRecommendation = React.useMemo(() => {
    if (passiveRotationList.length === 0) {
      const inProgress = (passiveLearningItems || []).filter(
        (i) => i.completedUnits > 0 && i.completedUnits < i.totalUnits
      );
      if (inProgress.length > 0) return inProgress[0];
      const notStarted = (passiveLearningItems || []).filter(
        (i) => i.completedUnits < i.totalUnits
      );
      return notStarted[0] || null;
    }
    const idx = Math.abs(passiveRotationIndex) % passiveRotationList.length;
    return passiveRotationList[idx];
  }, [passiveRotationList, passiveLearningItems, passiveRotationIndex]);

  return (
    <div className="space-y-6" id="dashboard-container">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272a] pb-5">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#fafafa] flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Intelligent Study Hub
          </h1>
          <p className="text-[#a1a1aa] text-xs mt-1">
            Analyze learning velocity, orchestrate active focus streams, and dynamically ingest course milestones.
          </p>
        </div>
      </div>

      {/* Analytics Matrix */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="stats-grid">
        <div className="bg-[#18181b] border border-[#27272a] p-4 rounded flex items-center justify-between">
          <div>
            <span className="text-[9px] font-mono text-[#71717a] uppercase font-bold tracking-wider">Tracked Domains</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-bold text-white font-mono">{totalTopics + totalSpecs}</span>
              <span className="text-[10px] text-zinc-500 font-mono">({totalTopics} subj / {totalSpecs} spec)</span>
            </div>
          </div>
          <Bookmark className="h-8 w-8 text-zinc-800 stroke-[1.5]" />
        </div>
        <div className="bg-[#18181b] border border-[#27272a] p-4 rounded flex items-center justify-between">
          <div>
            <span className="text-[9px] font-mono text-[#71717a] uppercase font-bold tracking-wider">Dynamic Resources</span>
            <span className="text-2xl font-bold text-white block mt-1 font-mono">{totalResources}</span>
          </div>
          <BookOpen className="h-8 w-8 text-zinc-800 stroke-[1.5]" />
        </div>
        <div className="bg-[#18181b] border border-[#27272a] p-4 rounded flex items-center justify-between">
          <div>
            <span className="text-[9px] font-mono text-[#71717a] uppercase font-bold tracking-wider">Materials Finished</span>
            <span className="text-2xl font-bold text-emerald-400 block mt-1 font-mono">{completedResources}</span>
          </div>
          <CheckCircle2 className="h-8 w-8 text-emerald-950/40 stroke-[1.5]" />
        </div>
        <div className="bg-[#18181b] border border-[#27272a] p-4 rounded flex items-center justify-between">
          <div>
            <span className="text-[9px] font-mono text-[#71717a] uppercase font-bold tracking-wider">Total Investment</span>
            <span className="text-2xl font-bold text-blue-400 block mt-1 font-mono">
              {Math.round((totalStudyTime / 60) * 10) / 10} hrs
            </span>
          </div>
          <Clock className="h-8 w-8 text-blue-950/40 stroke-[1.5]" />
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: MASTER INGESTION SYSTEM (Excel Log Ingestion) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#18181b] border border-[#27272a] rounded p-5 space-y-4" id="master-ingestion-card">
            <div className="border-b border-[#27272a] pb-3 flex justify-between items-center">
              <div>
                <h2 className="text-sm font-bold text-white">Master Ingestion System</h2>
                <p className="text-[10px] text-[#71717a]">Quick-log study sessions and update progress across any topic resource</p>
              </div>
              <Compass className="h-4 w-4 text-blue-500 animate-[spin_6s_linear_infinite]" />
            </div>

            <AnimatePresence>
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 text-[10px] p-2.5 rounded font-mono flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  {successMessage}
                </motion.div>
              )}
            </AnimatePresence>

            {unifiedDropdownOptions.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#71717a] border border-dashed border-[#27272a] rounded">
                Please create a Subject/Topic or Specialization first to enable master ingestion.
              </div>
            ) : (
              <form onSubmit={handleIngestionSubmit} className="space-y-4">
                {/* 1. Select Subject/Topic */}
                <div>
                  <label className="block text-[9px] font-mono font-bold text-[#71717a] uppercase mb-1.5 tracking-wider">
                    Select Domain / Course Focus
                  </label>
                  <select
                    value={selectedTopicId}
                    onChange={(e) => setSelectedTopicId(e.target.value)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer font-bold"
                  >
                    {topics.length > 0 && (
                      <optgroup label="📖 SUBJECTS & TOPICS">
                        {topics.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.title} ({t.category})
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {specializations.length > 0 && (
                      <optgroup label="🧬 CORE SPECIALIZATIONS">
                        {specializations.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.title} ({s.category})
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>

                {/* 2. Select Resource */}
                <div>
                  <label className="block text-[9px] font-mono font-bold text-[#71717a] uppercase mb-1.5 tracking-wider">
                    Select Study Resource
                  </label>
                  {activeResources.length === 0 ? (
                    <div className="text-xs text-amber-500 bg-[#09090b] border border-[#27272a] p-2.5 rounded">
                      No active resources logged for this domain. Add resources under the respective spreadsheet grids.
                    </div>
                  ) : (
                    <select
                      value={selectedResourceId}
                      onChange={(e) => setSelectedResourceId(e.target.value)}
                      className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      {activeResources.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.isCurrentFocus ? '★ ' : ''}{r.title} ({r.type})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Ingestion Parameters (only active if resource selected) */}
                {selectedResourceId && (
                  <>
                    {/* Progress Slider/Direct edit */}
                    {(() => {
                      const res = activeResources.find((r) => r.id === selectedResourceId);
                      if (!res) return null;

                      const nextUnit = res.completedUnits < res.totalUnits ? res.completedUnits + 1 : res.totalUnits;

                      return (
                        <div className="bg-[#09090b] border border-[#27272a] p-3 rounded space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-mono text-[#71717a] font-bold uppercase tracking-wider">
                              PROGRESS LOGGING ({res.unitLabel.toUpperCase()})
                            </span>
                            <span className="text-[10px] font-mono text-[#fafafa] font-bold bg-[#18181b] border border-[#27272a] px-2 py-0.5 rounded">
                              Current: {res.completedUnits} / {res.totalUnits}
                            </span>
                          </div>

                          <div className="space-y-2">
                            {/* Input Range & Direct input */}
                            <div className="flex items-center gap-4">
                              <input
                                type="range"
                                min="0"
                                max={res.totalUnits}
                                value={progressUnits}
                                onChange={(e) => setProgressUnits(parseInt(e.target.value) || 0)}
                                className="flex-1 h-1.5 bg-[#18181b] rounded-lg appearance-none cursor-pointer accent-blue-500"
                              />
                              <div className="flex items-center gap-1 shrink-0">
                                <input
                                  type="number"
                                  min="0"
                                  max={res.totalUnits}
                                  value={progressUnits}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    setProgressUnits(isNaN(val) ? 0 : Math.min(res.totalUnits, Math.max(0, val)));
                                  }}
                                  className="w-14 bg-[#18181b] border border-[#27272a] p-1 text-center font-mono text-xs text-white rounded"
                                />
                                <span className="text-[9px] font-mono text-[#71717a] uppercase font-bold">{res.unitLabel}</span>
                              </div>
                            </div>

                            {/* Increment recommendations */}
                            <div className="flex justify-between items-center pt-1 border-t border-[#27272a]/40 text-[10px]">
                              <span className="text-[#a1a1aa] font-medium flex items-center gap-1">
                                <AlertCircle className="h-3 w-3 text-blue-400" />
                                {res.completedUnits >= res.totalUnits ? (
                                  <span className="text-emerald-400 font-bold">Material 100% Complete!</span>
                                ) : (
                                  <span>Next up: <strong className="text-blue-400 font-bold">{res.unitLabel.substring(0, res.unitLabel.length - 1)} {nextUnit}</strong></span>
                                )}
                              </span>
                              
                              <button
                                type="button"
                                onClick={() => setProgressUnits(Math.min(res.totalUnits, res.completedUnits + 1))}
                                disabled={res.completedUnits >= res.totalUnits}
                                className="px-1.5 py-0.5 bg-[#18181b] border border-[#27272a] hover:bg-[#27272a] hover:text-white rounded font-mono text-[9px] text-[#a1a1aa] transition disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
                              >
                                Set to {nextUnit}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Time Duration & Session notes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[8px] font-mono font-bold text-[#71717a] uppercase mb-1 tracking-wider">
                          Duration (Minutes)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="480"
                          value={duration}
                          onChange={(e) => setDuration(parseInt(e.target.value) || 45)}
                          className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] font-mono font-bold text-[#71717a] uppercase mb-1 tracking-wider">
                          Quick Progress Action
                        </label>
                        <div className="flex gap-1.5 h-[34px]">
                          <button
                            type="button"
                            onClick={() => {
                              const res = activeResources.find((r) => r.id === selectedResourceId);
                              if (res) setProgressUnits(res.totalUnits);
                            }}
                            className="flex-1 bg-emerald-950/15 border border-emerald-900/40 text-emerald-400 hover:bg-emerald-900/20 text-[9px] uppercase tracking-wider font-mono font-bold rounded transition cursor-pointer"
                          >
                            Mark 100%
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const res = activeResources.find((r) => r.id === selectedResourceId);
                              if (res) setProgressUnits(0);
                            }}
                            className="flex-1 bg-[#18181b] border border-[#27272a] hover:bg-[#27272a] text-[#71717a] hover:text-white text-[9px] uppercase tracking-wider font-mono font-bold rounded transition cursor-pointer"
                          >
                            Reset Progress
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[8px] font-mono font-bold text-[#71717a] uppercase mb-1 tracking-wider">
                        Study Session Notes / Takeaways
                      </label>
                      <textarea
                        value={studyNotes}
                        onChange={(e) => setStudyNotes(e.target.value)}
                        placeholder="e.g., Covered B-tree split protocols. Understood buffer page concurrency locks."
                        className="w-full bg-[#09090b] border border-[#27272a] rounded p-2.5 text-xs text-white h-16 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded transition cursor-pointer flex items-center justify-center gap-1.5 uppercase"
                    >
                      <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                      Ingest Progress & Save Log
                    </button>
                  </>
                )}
              </form>
            )}
          </div>

          {/* PASSIVE LEARNING RECOMMENDATION CARD */}
          <div className="bg-[#18181b] border border-[#27272a] rounded p-5 space-y-4" id="passive-learning-recommendation-card">
            <div className="border-b border-[#27272a] pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  Passive Learning Recommendation
                </h2>
                <p className="text-[10px] text-[#71717a]">
                  Leisure CS video playlists & books in active rotation
                </p>
              </div>
              {onAdvancePassiveRotation && (
                <button
                  type="button"
                  onClick={onAdvancePassiveRotation}
                  className="bg-[#09090b] hover:bg-[#27272a] border border-[#27272a] hover:border-zinc-700 text-[#a1a1aa] hover:text-white px-2.5 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1 transition cursor-pointer"
                  title="Next Rotation Item"
                >
                  <RotateCw className="h-3 w-3 text-purple-400" />
                  <span>Next</span>
                </button>
              )}
            </div>

            {passiveRecommendation ? (
              <div className="bg-[#09090b]/80 border border-purple-500/20 p-4 rounded space-y-3 relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-purple-500/10 border-b border-l border-purple-500/20 text-purple-300 font-mono text-[8px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-bl">
                  Leisure Rotation
                </div>

                <div className="space-y-1 pr-12">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[8px] font-mono bg-purple-950/40 border border-purple-800/40 text-purple-300 font-bold px-1.5 py-0.5 rounded uppercase flex items-center gap-1">
                      {passiveRecommendation.type === 'Book' ? (
                        <BookOpen className="h-2.5 w-2.5" />
                      ) : (
                        <Tv className="h-2.5 w-2.5" />
                      )}
                      {passiveRecommendation.type}
                    </span>
                    <span className="text-[8px] font-mono bg-[#18181b] border border-[#27272a] text-zinc-400 font-bold px-1.5 py-0.5 rounded">
                      {passiveRecommendation.category}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-white leading-snug mt-1">
                    {passiveRecommendation.title}
                  </h3>

                  {passiveRecommendation.creator && (
                    <p className="text-[10px] text-zinc-400 font-mono">
                      By {passiveRecommendation.creator}
                    </p>
                  )}
                </div>

                {passiveRecommendation.notes && (
                  <p className="text-[10px] text-zinc-400 italic bg-[#18181b]/60 border border-[#27272a] p-2 rounded leading-relaxed">
                    "{passiveRecommendation.notes}"
                  </p>
                )}

                {/* Progress bar and controls */}
                <div className="space-y-2 pt-1 border-t border-[#27272a]">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-zinc-400">
                      Progress:{' '}
                      <strong className="text-white">
                        {passiveRecommendation.completedUnits} / {passiveRecommendation.totalUnits}{' '}
                        {passiveRecommendation.unitLabel}
                      </strong>
                    </span>
                    <span className="text-purple-400 font-bold">
                      {Math.round(
                        (passiveRecommendation.completedUnits /
                          passiveRecommendation.totalUnits) *
                          100
                      )}
                      %
                    </span>
                  </div>

                  <div className="w-full bg-[#18181b] h-1.5 rounded-full overflow-hidden border border-[#27272a]">
                    <div
                      className="bg-purple-500 h-full transition-all duration-300"
                      style={{
                        width: `${Math.round(
                          (passiveRecommendation.completedUnits /
                            passiveRecommendation.totalUnits) *
                            100
                        )}%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    {passiveRecommendation.url ? (
                      <a
                        href={
                          passiveRecommendation.url.startsWith('http')
                            ? passiveRecommendation.url
                            : `https://${passiveRecommendation.url}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 font-mono text-[9.5px] hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" /> Open Material
                      </a>
                    ) : (
                      <span className="text-[9px] font-mono text-zinc-600">
                        {passiveRecommendation.inRotation ? 'In Active Rotation' : 'In Library'}
                      </span>
                    )}

                    {onIncrementPassiveProgress && (
                      <button
                        type="button"
                        onClick={() =>
                          onIncrementPassiveProgress(passiveRecommendation.id, 1)
                        }
                        className="bg-purple-600 hover:bg-purple-500 border border-purple-500/30 text-white px-3 py-1.5 rounded text-[9.5px] font-mono font-bold uppercase transition cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3 stroke-[2.5]" />
                        +1 {passiveRecommendation.unitLabel.endsWith('s')
                          ? passiveRecommendation.unitLabel.slice(0, -1)
                          : passiveRecommendation.unitLabel}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-[#71717a] border border-dashed border-[#27272a] rounded">
                No passive learning items in rotation. Add or toggle items in Passive Learning view.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: INTELLIGENT AGGREGATE NEXT FOCUS FEED & RECENT ACTIVITY */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Heuristic Smart Recommendation Feed */}
          <div className="bg-[#18181b] border border-[#27272a] rounded p-5 space-y-4" id="heuristic-recommendations-feed">
            <div className="border-b border-[#27272a] pb-3 flex justify-between items-center">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Compass className="h-4 w-4 text-blue-500 animate-[spin_5s_linear_infinite]" />
                  Smart Study Target Recommendations
                </h2>
                <p className="text-[10px] text-[#71717a]">Dynamically prioritized study roadmap using momentum and priority heuristics (Non-AI)</p>
              </div>
              <span className="text-[9px] font-mono bg-[#09090b] text-[#a1a1aa] border border-[#27272a] px-2 py-0.5 rounded font-bold uppercase">
                {recommendations.length} Queue Items
              </span>
            </div>

            {recommendations.length === 0 ? (
              <div className="text-center py-12 text-xs text-[#71717a] border border-dashed border-[#27272a] rounded space-y-2">
                <Compass className="h-8 w-8 text-zinc-800 mx-auto animate-pulse" />
                <p>No study resources queued. Create resources in "Subjects" or "Specializations" to populate roadmap.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 1. MASTER NEXT TASK HIGHLIGHT */}
                {(() => {
                  const master = recommendations[0];
                  const { resource, parent, pct } = master;
                  const nextUnit = resource.completedUnits < resource.totalUnits ? resource.completedUnits + 1 : resource.totalUnits;
                  const labelSingular = resource.unitLabel.endsWith('s') 
                    ? resource.unitLabel.substring(0, resource.unitLabel.length - 1)
                    : resource.unitLabel;
                  const reason = getRecommendationReason(master);

                  return (
                    <div className="bg-gradient-to-r from-blue-950/20 to-zinc-900 border border-blue-500/30 p-5 rounded relative overflow-hidden group">
                      <div className="absolute right-0 top-0 bg-blue-500/10 text-blue-400 font-mono text-[8px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl border-l border-b border-blue-500/20">
                        ⭐ Absolute Next Priority
                      </div>
                      <div className="space-y-3 relative z-10">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[8px] font-mono bg-[#09090b] border border-blue-500/30 text-blue-400 font-bold px-2 py-0.5 rounded uppercase">
                              {parent.title}
                            </span>
                            <span className="text-[8px] font-mono text-zinc-500 uppercase">
                              PRIORITY: {resource.priority}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-white leading-tight flex items-center gap-1.5 mt-1.5">
                            <Compass className="h-3.5 w-3.5 text-blue-400 animate-[spin_3s_linear_infinite]" />
                            {resource.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-[#a1a1aa] mt-0.5">
                            <span>Creator: {resource.creator} • Type: {resource.type}</span>
                            {resource.url && (
                              <a
                                href={resource.url.startsWith('http') ? resource.url : `https://${resource.url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 text-blue-400 hover:text-blue-300 font-mono text-[9px] hover:underline"
                              >
                                <ExternalLink className="h-2.5 w-2.5" /> Link
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Smart heuristic reason banner */}
                        <div className="text-[10px] font-medium bg-[#09090b]/50 text-blue-300 border border-blue-500/10 p-2 rounded flex items-center gap-1.5">
                          <span>{reason}</span>
                        </div>

                        {/* Statement & Action */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                          <div className="font-mono text-xs text-[#a1a1aa]">
                            <span>Progress: <strong className="text-white">{resource.completedUnits} / {resource.totalUnits} {resource.unitLabel}</strong> ({pct}%)</span>
                          </div>

                          <button
                            onClick={() => handleQuickIncrement(parent.id, resource)}
                            className="bg-blue-600 hover:bg-blue-500 border border-blue-500/20 text-white px-4 py-2 rounded text-[10px] font-bold uppercase transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-lg shadow-blue-900/10"
                          >
                            <Play className="h-3 w-3 fill-current shrink-0" />
                            Log Progress ({labelSingular.toUpperCase()} {nextUnit})
                          </button>
                        </div>

                        {/* Visual progress bar */}
                        <div className="w-full bg-[#09090b] h-2 rounded-full overflow-hidden border border-[#27272a]">
                          <div
                            className="bg-blue-500 h-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 2. SUBSEQUENT SMART SUGGESTIONS (TOP 2-3 ITEMS) */}
                {recommendations.length > 1 && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest pl-1 mt-4 mb-2">
                      Other Roadmap Alternatives
                    </h4>
                    {recommendations.slice(1, 4).map((rec) => {
                      const { resource, parent, pct } = rec;
                      const nextUnit = resource.completedUnits < resource.totalUnits ? resource.completedUnits + 1 : resource.totalUnits;
                      const labelSingular = resource.unitLabel.endsWith('s') 
                        ? resource.unitLabel.substring(0, resource.unitLabel.length - 1)
                        : resource.unitLabel;
                      const reason = getRecommendationReason(rec);

                      return (
                        <div
                          key={resource.id}
                          className="bg-[#09090b]/40 border border-[#27272a] p-3.5 rounded hover:border-[#3f3f46] transition space-y-2.5 relative overflow-hidden group"
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[7.5px] font-mono bg-[#18181b] border border-[#27272a] text-[#a1a1aa] font-bold px-1.5 py-0.2 rounded uppercase">
                                  {parent.title}
                                </span>
                                <span className="text-[8px] font-mono text-zinc-600 uppercase">
                                  {resource.priority} Priority
                                </span>
                                {resource.url && (
                                  <a
                                    href={resource.url.startsWith('http') ? resource.url : `https://${resource.url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-0.5 text-blue-400 hover:text-blue-300 font-mono text-[8px] hover:underline"
                                    title="Open link"
                                  >
                                    <ExternalLink className="h-2.5 w-2.5" />
                                  </a>
                                )}
                              </div>
                              <h3 className="text-xs font-bold text-white leading-tight">
                                {resource.title}
                              </h3>
                              <p className="text-[9px] text-[#71717a] italic">
                                {reason}
                              </p>
                            </div>

                            <button
                              onClick={() => handleQuickIncrement(parent.id, resource)}
                              className="bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-zinc-300 hover:text-white px-2.5 py-1.5 rounded text-[9px] font-bold uppercase transition flex items-center gap-1 shrink-0 cursor-pointer"
                            >
                              <Play className="h-2 w-2 fill-current shrink-0" />
                              Log {labelSingular.toUpperCase()} {nextUnit}
                            </button>
                          </div>

                          {/* Visual progress bar */}
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 bg-[#18181b] h-1 rounded-full overflow-hidden">
                              <div
                                className="bg-zinc-500 group-hover:bg-blue-400 h-full transition-all duration-300"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-[9px] font-mono text-zinc-500 shrink-0">
                              {resource.completedUnits}/{resource.totalUnits} {resource.unitLabel} ({pct}%)
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recent Activity Log */}
          <div className="bg-[#18181b] border border-[#27272a] rounded p-5 space-y-4" id="recent-study-activity">
            <div className="border-b border-[#27272a] pb-3 flex justify-between items-center">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <History className="h-4 w-4 text-[#a1a1aa]" />
                  Recent Study Sessions Log
                </h2>
                <p className="text-[10px] text-[#71717a]">Chronological journal of progress adjustments and study milestones</p>
              </div>
              <span className="text-[9px] font-mono bg-[#09090b] border border-[#27272a] text-[#71717a] px-2 py-0.5 rounded uppercase font-bold">
                {studyLogs.length} Saved entries
              </span>
            </div>

            {studyLogs.length === 0 ? (
              <div className="text-center py-10 text-xs text-[#71717a] border border-dashed border-[#27272a] rounded">
                No learning logs recorded yet. Ingest a session to populate this ledger.
              </div>
            ) : (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {studyLogs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-[#09090b]/40 border border-[#27272a] p-3 rounded flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[9px] font-mono text-[#71717a] font-bold">
                          {new Date(log.timestamp).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="text-[9px] font-mono bg-[#18181b] border border-[#27272a] text-[#a1a1aa] px-1.5 py-0.2 rounded uppercase">
                          {log.topicTitle}
                        </span>
                        {log.durationMinutes && (
                          <span className="text-[9px] font-mono bg-[#27272a]/40 text-blue-400 px-1 rounded flex items-center gap-0.5">
                            <Clock className="h-2 w-2" /> {log.durationMinutes}m
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-white leading-tight">
                        {log.resourceTitle}
                      </h4>
                      <p className="text-zinc-400 italic text-[11px] leading-relaxed">
                        "{log.notes}"
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                      <div className="text-right">
                        <span className="text-[9px] font-mono text-[#71717a] uppercase block">Delta Change</span>
                        <span className="text-xs font-mono font-bold text-blue-400">
                          {log.prevProgress} ➔ {log.newProgress} <span className="text-[9px] text-zinc-500 font-bold">{log.unitLabel}</span>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setLogToDelete(log);
                        }}
                        className="p-1.5 hover:bg-red-950/20 text-zinc-600 hover:text-red-400 rounded transition border border-transparent hover:border-red-900/30 cursor-pointer"
                        title="Delete entry"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Custom Deletion Confirmation */}
      <ConfirmModal
        isOpen={logToDelete !== null}
        title="Delete Study Log Entry?"
        message="Are you sure you want to delete this study log entry? (Note: This is a history deletion and does not roll back the resource progress counters)"
        confirmText="Delete Entry"
        cancelText="Cancel"
        onConfirm={() => {
          if (logToDelete) {
            onDeleteLog(logToDelete.id);
            setLogToDelete(null);
          }
        }}
        onCancel={() => setLogToDelete(null)}
        variant="danger"
      />

    </div>
  );
}
