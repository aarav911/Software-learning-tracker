/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Topic, StudyResource } from '../types';
import { ConfirmModal } from './ConfirmModal';
import {
  Compass,
  Plus,
  Trash2,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Save,
  Star,
  Settings,
  ExternalLink,
  Search,
  X,
  Filter,
  Grid,
  List,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface TopicsViewProps {
  topics: Topic[];
  selectedTopicId: string | null;
  onSelectTopic: (id: string | null) => void;
  onAddTopic: (title: string, category: Topic['category'], description: string, notes?: string) => void;
  onUpdateTopic: (id: string, fields: Partial<Omit<Topic, 'id' | 'resources'>>) => void;
  onDeleteTopic: (id: string) => void;
  onAddResource: (topicId: string, resource: Omit<StudyResource, 'id'>) => void;
  onUpdateResource: (topicId: string, resourceId: string, fields: Partial<StudyResource>) => void;
  onDeleteResource: (topicId: string, resourceId: string) => void;
}

export function TopicsView({
  topics,
  selectedTopicId,
  onSelectTopic,
  onAddTopic,
  onUpdateTopic,
  onDeleteTopic,
  onAddResource,
  onUpdateResource,
  onDeleteResource,
}: TopicsViewProps) {
  // Topic creation state
  const [showAddTopicModal, setShowAddTopicModal] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicCategory, setNewTopicCategory] = useState<Topic['category']>('Subject');
  const [newTopicDescription, setNewTopicDescription] = useState('');
  const [newTopicNotes, setNewTopicNotes] = useState('');

  // Search & Filter states for subjects navigation
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isGridExpanded, setIsGridExpanded] = useState(false);

  // Deletion confirm states
  const [subjectToDelete, setSubjectToDelete] = useState<Topic | null>(null);
  const [resourceToDelete, setResourceToDelete] = useState<{ topicId: string; resource: StudyResource } | null>(null);

  // Local editing states for selected topic general notes
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');

  const categories = React.useMemo(() => {
    const cats = ['All', 'Subject', 'Language', 'Topic', 'Framework', 'Other'];
    topics.forEach((t) => {
      if (t.category && !cats.includes(t.category)) {
        cats.push(t.category);
      }
    });
    return cats;
  }, [topics]);

  const filteredTopics = React.useMemo(() => {
    return topics.filter((t) => {
      const matchesSearch =
        !searchQuery.trim() ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === 'All' || t.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [topics, searchQuery, selectedCategory]);

  const selectedTopic = topics.find((t) => t.id === selectedTopicId) || topics[0] || null;

  React.useEffect(() => {
    if (selectedTopic && !selectedTopicId) {
      onSelectTopic(selectedTopic.id);
    }
  }, [selectedTopic, selectedTopicId]);

  // Set local state when selected topic changes
  React.useEffect(() => {
    if (selectedTopic) {
      setEditedNotes(selectedTopic.notes || '');
    }
  }, [selectedTopic?.id]);

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim()) return;
    onAddTopic(
      newTopicTitle.trim(),
      newTopicCategory,
      newTopicDescription.trim(),
      newTopicNotes.trim()
    );
    // Reset filters and form
    setSearchQuery('');
    setSelectedCategory('All');
    setNewTopicTitle('');
    setNewTopicCategory('Subject');
    setNewTopicDescription('');
    setNewTopicNotes('');
    setShowAddTopicModal(false);
  };

  const handleAddDefaultRow = () => {
    if (!selectedTopic) return;
    onAddResource(selectedTopic.id, {
      title: 'New Study Resource',
      type: 'Book',
      creator: 'Author Name',
      completedUnits: 0,
      totalUnits: 10,
      unitLabel: 'chapters',
      isCurrentFocus: selectedTopic.resources.length === 0, // Focus if it is the first one
      status: 'Not Started',
      priority: 'Medium',
      notes: 'Initial focus notes',
    });
  };

  // Get active focus and work recommendation
  const currentFocusResource = selectedTopic?.resources.find((r) => r.isCurrentFocus);
  const nextTargetUnit = currentFocusResource
    ? currentFocusResource.completedUnits < currentFocusResource.totalUnits
      ? currentFocusResource.completedUnits + 1
      : currentFocusResource.totalUnits
    : 0;

  const singularLabel = currentFocusResource
    ? currentFocusResource.unitLabel.endsWith('s')
      ? currentFocusResource.unitLabel.substring(0, currentFocusResource.unitLabel.length - 1)
      : currentFocusResource.unitLabel
    : '';

  return (
    <div className="space-y-6" id="topics-explorer-root">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272a] pb-5">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#fafafa] flex items-center gap-2">
            <Compass className="h-5 w-5 text-blue-500 animate-[spin_8s_linear_infinite]" />
            Subjects, Topics & Languages
          </h1>
          <p className="text-[#a1a1aa] text-xs mt-1">
            Populate specific dynamic lists for what you are learning, log progress, and configure inline spreadsheets.
          </p>
        </div>
        <button
          onClick={() => setShowAddTopicModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded text-xs transition cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          Record New Topic
        </button>
      </div>

      {/* Scalable Subject Navigation & Filter Bar (Handles 50+ Subjects) */}
      <div className="bg-[#18181b] border border-[#27272a] rounded p-4 space-y-3" id="topic-tabs-bar">
        {/* Top Control Strip: Search Input, Quick Jump Select, Category Pills, View Mode Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Quick Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="h-3.5 w-3.5 text-[#71717a] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Filter ${topics.length} subjects...`}
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

          {/* Direct Jump Selector (Combobox fallback for 50+ subjects) */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#71717a] font-mono uppercase shrink-0 font-bold hidden sm:inline">Jump To:</span>
            <select
              value={selectedTopic?.id || ''}
              onChange={(e) => onSelectTopic(e.target.value)}
              className="bg-[#09090b] border border-[#27272a] focus:border-blue-500 text-xs text-[#fafafa] rounded px-3 py-1.5 font-mono max-w-[200px] sm:max-w-[260px] truncate focus:outline-none cursor-pointer"
            >
              {topics.map((t, idx) => (
                <option key={t.id} value={t.id}>
                  {idx + 1}. {t.title} [{t.category}]
                </option>
              ))}
            </select>
          </div>

          {/* Toggle View Mode */}
          <button
            onClick={() => setIsGridExpanded(!isGridExpanded)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#09090b] hover:bg-[#27272a] text-[#a1a1aa] hover:text-white border border-[#27272a] rounded text-xs font-mono transition cursor-pointer"
          >
            {isGridExpanded ? <List className="h-3.5 w-3.5" /> : <Grid className="h-3.5 w-3.5" />}
            <span>{isGridExpanded ? 'Compact Pills' : `View Grid (${filteredTopics.length})`}</span>
          </button>
        </div>

        {/* Category Pills Filter */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#27272a]/60">
          <span className="text-[10px] text-[#71717a] font-mono uppercase font-bold mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Category:
          </span>
          {categories.map((cat) => {
            const count = cat === 'All' ? topics.length : topics.filter((t) => t.category === cat).length;
            const isCatActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase transition flex items-center gap-1 cursor-pointer ${
                  isCatActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-[#09090b] text-[#a1a1aa] hover:text-white border border-[#27272a]'
                }`}
              >
                {cat}
                <span className={`text-[8px] px-1 rounded ${isCatActive ? 'bg-blue-700 text-white' : 'bg-[#18181b] text-[#71717a]'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Subject Chips (Scrollable Pill Strip or Full Grid View) */}
        {filteredTopics.length === 0 ? (
          <div className="text-center py-4 text-xs text-[#71717a] font-mono">
            No subjects match filter "{searchQuery}". <button onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }} className="text-blue-400 underline hover:text-blue-300">Reset filters</button>
          </div>
        ) : isGridExpanded ? (
          /* Grid View Mode */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-2 max-h-[300px] overflow-y-auto pr-1">
            {filteredTopics.map((topic) => {
              const isSelected = selectedTopic?.id === topic.id;
              return (
                <button
                  key={topic.id}
                  onClick={() => onSelectTopic(topic.id)}
                  className={`p-2.5 text-left rounded border transition flex flex-col justify-between gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600/15 border-blue-500 text-blue-300 font-bold'
                      : 'bg-[#09090b] border-[#27272a] text-[#a1a1aa] hover:border-zinc-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 w-full">
                    <span className="text-[9px] font-mono uppercase bg-blue-950/40 text-blue-400 px-1.5 py-0.5 rounded border border-blue-900/30">
                      {topic.category}
                    </span>
                    <span className="text-[9px] font-mono text-[#71717a]">
                      {topic.resources.length} items
                    </span>
                  </div>
                  <span className="text-xs font-semibold truncate block w-full">{topic.title}</span>
                </button>
              );
            })}
          </div>
        ) : (
          /* Horizontal Pill Strip View Mode */
          <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto pr-1 pt-1">
            {filteredTopics.map((topic) => {
              const isSelected = selectedTopic?.id === topic.id;
              return (
                <button
                  key={topic.id}
                  onClick={() => onSelectTopic(topic.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded border transition flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600/15 border-blue-500 text-blue-400 font-bold shadow-sm'
                      : 'bg-[#09090b] border-[#27272a] text-[#a1a1aa] hover:border-zinc-700 hover:text-white'
                  }`}
                >
                  <Compass className={`h-3 w-3 ${isSelected ? 'animate-[spin_4s_linear_infinite] text-blue-500' : 'text-zinc-600'}`} />
                  <span>{topic.title}</span>
                  <span className="text-[9px] font-mono opacity-60 bg-[#18181b] px-1 py-0.2 rounded uppercase">
                    {topic.category}
                  </span>
                  <span className="text-[9px] font-mono text-[#71717a] bg-[#18181b] px-1 rounded">
                    {topic.resources.length}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedTopic ? (
        <div className="space-y-6">
          
          {/* Selected Topic Description Banner */}
          <div className="bg-[#18181b]/50 border border-[#27272a] rounded p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1 max-w-2xl">
              <span className="font-mono text-[9px] text-blue-500 font-bold uppercase tracking-wider block">
                {selectedTopic.category} • INITIATED {selectedTopic.dateInitiated}
              </span>
              <h2 className="text-base font-bold text-white">{selectedTopic.title}</h2>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">{selectedTopic.description}</p>
            </div>
            
            <button
              onClick={() => {
                setSubjectToDelete(selectedTopic);
              }}
              className="text-[10px] font-bold text-red-400 hover:text-red-300 border border-red-950/45 hover:border-red-900 bg-red-950/10 px-3 py-1.5 rounded transition cursor-pointer shrink-0 self-end md:self-auto"
            >
              Delete Subject
            </button>
          </div>

          {/* DYNAMIC NEXT STEP ENGINE TARGET CALLOUT */}
          <div className="bg-[#18181b]/40 border border-[#27272a] rounded p-4 relative overflow-hidden" id="topic-target-engine">
            {/* Ambient visual pointer backing */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500/5 rotate-12 transition">
              <Compass className="h-24 w-24 animate-[spin_20s_linear_infinite]" />
            </div>

            <div className="flex items-start gap-3 relative z-10">
              <div className="p-2 bg-blue-600/10 border border-blue-500/20 rounded-full text-blue-400 animate-pulse mt-0.5">
                <Compass className="h-5 w-5 animate-[spin_6s_linear_infinite]" />
              </div>
              <div className="space-y-1">
                <span className="font-mono text-[9px] text-blue-400 font-bold uppercase tracking-wider block">
                  INTELLIGENT STUDY POINTER
                </span>
                <h3 className="text-sm font-bold text-white">
                  {currentFocusResource ? (
                    currentFocusResource.completedUnits >= currentFocusResource.totalUnits ? (
                      <span className="text-emerald-400">Current Focus Completed! Set another focus resource in the grid.</span>
                    ) : (
                      <span>
                        Study <strong className="text-blue-400 underline decoration-blue-500/50 underline-offset-4">{singularLabel.toUpperCase()} {nextTargetUnit}</strong> of <strong className="text-white">"{currentFocusResource.title}"</strong> next.
                      </span>
                    )
                  ) : (
                    <span className="text-amber-500">No active focus item selected. Pick a resource below as the Current Focus!</span>
                  )}
                </h3>
                <p className="text-xs text-[#a1a1aa]">
                  Updating progress anywhere in the Excel grid below immediately recalculates your study priorities and advances your focus stream.
                </p>
              </div>
            </div>
          </div>

          {/* SPREADSHEET CARD PANEL */}
          <div className="bg-[#18181b] border border-[#27272a] rounded overflow-hidden shadow-xl" id="excel-grid-panel">
            <div className="p-4 bg-[#1e1e22]/50 border-b border-[#27272a] flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <h3 className="text-xs font-bold font-mono text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  DYNAMIC LEARNING RESOURCE SPREADSHEET
                </h3>
                <p className="text-[10px] text-[#71717a] mt-0.5">Cells auto-save on change. Toggle "Focus" column to align pointer.</p>
              </div>
              <button
                onClick={handleAddDefaultRow}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-[#fafafa] font-bold rounded text-[11px] transition cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 text-blue-500 stroke-[2.5]" />
                Append Resource Row
              </button>
            </div>

            {selectedTopic.resources.length === 0 ? (
              <div className="p-12 text-center space-y-4">
                <BookOpen className="h-10 w-10 text-zinc-700 mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-zinc-300">Spreadsheet Empty</h4>
                  <p className="text-[11px] text-[#71717a] max-w-xs mx-auto">Create columns of books, courses, code streams, or papers to organize this subject.</p>
                </div>
                <button
                  onClick={handleAddDefaultRow}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded transition cursor-pointer"
                >
                  Create First Row
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead>
                    <tr className="bg-[#09090b] border-b border-[#27272a] text-[#71717a]">
                      <th className="p-2 text-center w-12 font-bold text-[9px] uppercase tracking-wider">FOCUS</th>
                      <th className="p-2 min-w-[200px] font-bold text-[9px] uppercase tracking-wider border-l border-[#27272a]">TITLE</th>
                      <th className="p-2 w-36 font-bold text-[9px] uppercase tracking-wider border-l border-[#27272a]">TYPE</th>
                      <th className="p-2 w-44 font-bold text-[9px] uppercase tracking-wider border-l border-[#27272a]">CREATOR / SOURCE</th>
                      <th className="p-2 w-48 font-bold text-[9px] uppercase tracking-wider border-l border-[#27272a]">LINK / URL</th>
                      <th className="p-2 w-32 text-center font-bold text-[9px] uppercase tracking-wider border-l border-[#27272a]">PROGRESS</th>
                      <th className="p-2 w-24 font-bold text-[9px] uppercase tracking-wider border-l border-[#27272a]">UNIT</th>
                      <th className="p-2 w-28 font-bold text-[9px] uppercase tracking-wider border-l border-[#27272a]">PRIORITY</th>
                      <th className="p-2 w-28 text-center font-bold text-[9px] uppercase tracking-wider border-l border-[#27272a]">STATUS</th>
                      <th className="p-2 text-center w-12 font-bold text-[9px] uppercase tracking-wider border-l border-[#27272a]">DEL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#27272a]">
                    {selectedTopic.resources.map((res) => (
                      <tr
                        key={res.id}
                        className={`hover:bg-[#1f1f23]/40 transition-colors ${
                          res.isCurrentFocus ? 'bg-blue-500/[0.02]' : ''
                        }`}
                      >
                        {/* 1. FOCUS POINTER / SELECTION */}
                        <td className="p-1.5 text-center">
                          <button
                            onClick={() => onUpdateResource(selectedTopic.id, res.id, { isCurrentFocus: true })}
                            className="p-1 rounded hover:bg-[#27272a] transition relative group/btn inline-flex items-center justify-center cursor-pointer"
                            title="Set as active focus pointer"
                          >
                            {res.isCurrentFocus ? (
                              <Compass className="h-4.5 w-4.5 text-blue-500 animate-[spin_4s_linear_infinite]" />
                            ) : (
                              <Star className="h-3.5 w-3.5 text-zinc-600 hover:text-amber-500 transition" />
                            )}
                          </button>
                        </td>

                        {/* 2. TITLE FIELD */}
                        <td className="p-1 border-l border-[#27272a]">
                          <input
                            type="text"
                            value={res.title}
                            onChange={(e) => onUpdateResource(selectedTopic.id, res.id, { title: e.target.value })}
                            className="w-full bg-transparent border-none text-white px-1 py-1 focus:bg-[#09090b] focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans rounded"
                            placeholder="Resource title"
                          />
                        </td>

                        {/* 3. TYPE DROPDOWN */}
                        <td className="p-1 border-l border-[#27272a]">
                          <select
                            value={res.type}
                            onChange={(e) => onUpdateResource(selectedTopic.id, res.id, { type: e.target.value as any })}
                            className="w-full bg-transparent border-none text-[#a1a1aa] px-1 py-1 focus:bg-[#09090b] focus:outline-none cursor-pointer font-sans"
                          >
                            <option value="Book">📖 Book</option>
                            <option value="Course/Playlist">📺 Course/Playlist</option>
                            <option value="Documentation">📄 Documentation</option>
                            <option value="Article/Paper">🔬 Article/Paper</option>
                            <option value="Other">🛠️ Other</option>
                          </select>
                        </td>

                        {/* 4. CREATOR FIELD */}
                        <td className="p-1 border-l border-[#27272a]">
                          <input
                            type="text"
                            value={res.creator}
                            onChange={(e) => onUpdateResource(selectedTopic.id, res.id, { creator: e.target.value })}
                            className="w-full bg-transparent border-none text-[#a1a1aa] px-1 py-1 focus:bg-[#09090b] focus:outline-none font-sans rounded"
                            placeholder="Creator / Author"
                          />
                        </td>

                        {/* 4.5 LINK / URL FIELD */}
                        <td className="p-1 border-l border-[#27272a]">
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={res.url || ''}
                              onChange={(e) => onUpdateResource(selectedTopic.id, res.id, { url: e.target.value })}
                              className="w-full bg-transparent border-none text-blue-400 focus:text-white px-1 py-1 focus:bg-[#09090b] focus:outline-none font-mono text-[10px] rounded"
                              placeholder="https://... or file://"
                            />
                            {res.url && (
                              <a
                                href={res.url.startsWith('http') ? res.url : `https://${res.url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 hover:bg-[#27272a] rounded text-blue-400 hover:text-blue-300 transition shrink-0 cursor-pointer"
                                title="Open resource link"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </td>

                        {/* 5. PROGRESS (Numerical Cells) */}
                        <td className="p-1 border-l border-[#27272a]">
                          <div className="flex items-center justify-center gap-1 text-center">
                            {/* Increment/Decrement controls */}
                            <button
                              onClick={() => onUpdateResource(selectedTopic.id, res.id, { completedUnits: res.completedUnits - 1 })}
                              disabled={res.completedUnits <= 0}
                              className="px-1 text-zinc-500 hover:text-white disabled:opacity-30 cursor-pointer font-bold font-sans text-xs"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="0"
                              max={res.totalUnits}
                              value={res.completedUnits}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                onUpdateResource(selectedTopic.id, res.id, { completedUnits: isNaN(val) ? 0 : val });
                              }}
                              className="w-10 bg-[#09090b]/80 border border-[#27272a] text-center text-white py-0.5 rounded font-mono text-xs focus:ring-1 focus:ring-blue-500"
                            />
                            <span className="text-zinc-600">/</span>
                            <input
                              type="number"
                              min="1"
                              value={res.totalUnits}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                onUpdateResource(selectedTopic.id, res.id, { totalUnits: isNaN(val) ? 1 : val });
                              }}
                              className="w-10 bg-[#09090b]/80 border border-[#27272a] text-center text-white py-0.5 rounded font-mono text-xs focus:ring-1 focus:ring-blue-500"
                            />
                            <button
                              onClick={() => onUpdateResource(selectedTopic.id, res.id, { completedUnits: res.completedUnits + 1 })}
                              disabled={res.completedUnits >= res.totalUnits}
                              className="px-1 text-zinc-500 hover:text-white disabled:opacity-30 cursor-pointer font-bold font-sans text-xs"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        {/* 6. UNIT LABEL CELL */}
                        <td className="p-1 border-l border-[#27272a]">
                          <input
                            type="text"
                            value={res.unitLabel}
                            onChange={(e) => onUpdateResource(selectedTopic.id, res.id, { unitLabel: e.target.value })}
                            className="w-full bg-transparent border-none text-zinc-400 px-1 py-1 focus:bg-[#09090b] focus:outline-none font-mono text-[11px] rounded"
                            placeholder="e.g. chapters"
                          />
                        </td>

                        {/* 7. PRIORITY DROPDOWN */}
                        <td className="p-1 border-l border-[#27272a]">
                          <select
                            value={res.priority}
                            onChange={(e) => onUpdateResource(selectedTopic.id, res.id, { priority: e.target.value as any })}
                            className="w-full bg-transparent border-none text-[#a1a1aa] px-1 py-1 focus:bg-[#09090b] focus:outline-none cursor-pointer font-sans"
                          >
                            <option value="Low">🟢 Low</option>
                            <option value="Medium">🟡 Medium</option>
                            <option value="High">🔴 High</option>
                          </select>
                        </td>

                        {/* 8. STATUS BADGE */}
                        <td className="p-1.5 border-l border-[#27272a] text-center">
                          {res.status === 'Completed' && (
                            <span className="inline-block bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 px-1.5 py-0.5 rounded text-[9px] font-bold font-sans uppercase">
                              COMPLETED
                            </span>
                          )}
                          {res.status === 'In Progress' && (
                            <span className="inline-block bg-blue-950/40 text-blue-400 border border-blue-900/40 px-1.5 py-0.5 rounded text-[9px] font-bold font-sans uppercase">
                              IN PROGRESS
                            </span>
                          )}
                          {res.status === 'Not Started' && (
                            <span className="inline-block bg-zinc-900 text-[#71717a] border border-[#27272a] px-1.5 py-0.5 rounded text-[9px] font-bold font-sans uppercase">
                              UNSTARTED
                            </span>
                          )}
                        </td>

                        {/* 9. DELETE ROW */}
                        <td className="p-1.5 border-l border-[#27272a] text-center">
                          <button
                            onClick={() => {
                              setResourceToDelete({ topicId: selectedTopic.id, resource: res });
                            }}
                            className="p-1 text-zinc-600 hover:text-red-400 hover:bg-zinc-900 rounded transition cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Topic Systemic Notes Card */}
          <div className="bg-[#18181b] border border-[#27272a] rounded p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-[#27272a] pb-2.5">
              <h3 className="text-xs font-bold text-[#fafafa] uppercase font-mono">
                Systemic Study Strategy & Notes (Syllabus)
              </h3>
              {!isEditingNotes ? (
                <button
                  onClick={() => setIsEditingNotes(true)}
                  className="text-[10px] text-blue-400 hover:text-blue-300 font-bold transition cursor-pointer"
                >
                  Edit Syllabus
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onUpdateTopic(selectedTopic.id, { notes: editedNotes });
                      setIsEditingNotes(false);
                    }}
                    className="text-[10px] bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded transition cursor-pointer font-bold"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditedNotes(selectedTopic.notes || '');
                      setIsEditingNotes(false);
                    }}
                    className="text-[10px] text-zinc-400 hover:text-white transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {!isEditingNotes ? (
              selectedTopic.notes ? (
                <p className="text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed font-mono">
                  {selectedTopic.notes}
                </p>
              ) : (
                <p className="text-xs text-zinc-500 italic">
                  No notes saved yet. Formulate study scopes, reference URLs, book chapter layouts, or custom syllabi details here.
                </p>
              )
            ) : (
              <textarea
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                className="w-full bg-[#09090b] border border-[#27272a] focus:border-blue-500 focus:outline-none rounded p-3 text-xs text-white min-h-[120px] font-mono leading-relaxed"
                placeholder="List key references, documentation domains, study hours scheduled, or custom checklist paths..."
              />
            )}
          </div>

        </div>
      ) : (
        <div className="bg-[#18181b]/50 border border-dashed border-[#27272a] rounded p-12 text-center">
          <BookOpen className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
          <h3 className="font-display font-medium text-sm text-white">No Subjects Tracked</h3>
          <p className="text-[#a1a1aa] text-xs max-w-sm mx-auto mt-2">
            You haven't set up any learning subjects or languages yet. Record a new topic like "Rust Systems Concurrency" to unlock study spreadsheet templates.
          </p>
          <button
            onClick={() => setShowAddTopicModal(true)}
            className="mt-6 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded text-xs transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            Log First Subject
          </button>
        </div>
      )}

      {/* CREATE SUBJECT MODAL */}
      <AnimatePresence>
        {showAddTopicModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#18181b] border border-[#27272a] rounded p-6 max-w-md w-full space-y-4 shadow-xl"
            >
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Compass className="h-4 w-4 text-blue-500 animate-[spin_4s_linear_infinite]" />
                Record New Learning Subject / Topic
              </h3>
              <p className="text-[#a1a1aa] text-xs leading-relaxed">
                Add a new subject of study (e.g., Rust, Distributed Algorithms, or Mandarin). This creates a dynamic, customizable ledger where you can record learning resources.
              </p>

              <form onSubmit={handleCreateTopic} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#71717a] uppercase mb-1">
                    Subject Name / Topic *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTopicTitle}
                    onChange={(e) => setNewTopicTitle(e.target.value)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g., Rust Systems Concurrency, Postgres Internals"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#71717a] uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={newTopicCategory}
                    onChange={(e) => setNewTopicCategory(e.target.value as any)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Language">Language</option>
                    <option value="Subject">Subject</option>
                    <option value="Topic">Topic</option>
                    <option value="Framework">Framework</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#71717a] uppercase mb-1">
                    Description / Goal Statement
                  </label>
                  <textarea
                    value={newTopicDescription}
                    onChange={(e) => setNewTopicDescription(e.target.value)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 h-16"
                    placeholder="Briefly declare what you aim to achieve or study..."
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#71717a] uppercase mb-1">
                    Initial Study Notes / Syllabus
                  </label>
                  <textarea
                    value={newTopicNotes}
                    onChange={(e) => setNewTopicNotes(e.target.value)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 h-20"
                    placeholder="Optional: Outline main study books, schedule benchmarks, or general details."
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddTopicModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-[#a1a1aa] hover:text-white bg-[#09090b] hover:bg-zinc-900 border border-[#27272a] rounded transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded transition cursor-pointer"
                  >
                    Record Topic
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Sleek Deletion Confirmations */}
      <ConfirmModal
        isOpen={subjectToDelete !== null}
        title="Delete Subject?"
        message={`Permanently purge the entire subject "${subjectToDelete?.title}" and all its logged resource sheets? This cannot be undone.`}
        confirmText="Delete Subject"
        cancelText="Cancel"
        onConfirm={() => {
          if (subjectToDelete) {
            onDeleteTopic(subjectToDelete.id);
            setSubjectToDelete(null);
          }
        }}
        onCancel={() => setSubjectToDelete(null)}
        variant="danger"
      />

      <ConfirmModal
        isOpen={resourceToDelete !== null}
        title="Remove Resource?"
        message={`Remove the study resource "${resourceToDelete?.resource.title}" from this subject spreadsheet?`}
        confirmText="Remove Row"
        cancelText="Cancel"
        onConfirm={() => {
          if (resourceToDelete) {
            onDeleteResource(resourceToDelete.topicId, resourceToDelete.resource.id);
            setResourceToDelete(null);
          }
        }}
        onCancel={() => setResourceToDelete(null)}
        variant="danger"
      />

    </div>
  );
}
