/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Specialization, StudyResource } from '../types';
import { ConfirmModal } from './ConfirmModal';
import {
  Cpu,
  Plus,
  Trash2,
  BookOpen,
  Compass,
  Star,
  ExternalLink,
  Search,
  X,
  Filter,
  Grid,
  List,
} from 'lucide-react';

interface SpecializationsViewProps {
  specializations: Specialization[];
  selectedSpecializationId: string | null;
  onSelectSpecialization: (id: string | null) => void;
  onAddSpecialization: (title: string, category: Specialization['category'], description: string, notes?: string) => void;
  onUpdateSpecialization: (id: string, fields: Partial<Omit<Specialization, 'id' | 'resources'>>) => void;
  onDeleteSpecialization: (id: string) => void;
  onAddResource: (specializationId: string, resource: Omit<StudyResource, 'id'>) => void;
  onUpdateResource: (specializationId: string, resourceId: string, fields: Partial<StudyResource>) => void;
  onDeleteResource: (specializationId: string, resourceId: string) => void;
}

export function SpecializationsView({
  specializations,
  selectedSpecializationId,
  onSelectSpecialization,
  onAddSpecialization,
  onUpdateSpecialization,
  onDeleteSpecialization,
  onAddResource,
  onUpdateResource,
  onDeleteResource,
}: SpecializationsViewProps) {
  // Specialization creation state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<Specialization['category']>('System');
  const [newDescription, setNewDescription] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Search & Filter states for specializations navigation
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isGridExpanded, setIsGridExpanded] = useState(false);

  // Deletion confirm states
  const [specToDelete, setSpecToDelete] = useState<Specialization | null>(null);
  const [resourceToDelete, setResourceToDelete] = useState<{ specializationId: string; resource: StudyResource } | null>(null);

  // Local editing states for general notes
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');

  const categories = React.useMemo(() => {
    const cats = ['All', 'System', 'Theory', 'Application', 'Specialty', 'Other'];
    specializations.forEach((s) => {
      if (s.category && !cats.includes(s.category)) {
        cats.push(s.category);
      }
    });
    return cats;
  }, [specializations]);

  const filteredSpecializations = React.useMemo(() => {
    return specializations.filter((s) => {
      const matchesSearch =
        !searchQuery.trim() ||
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [specializations, searchQuery, selectedCategory]);

  const selectedSpec = specializations.find((s) => s.id === selectedSpecializationId) || specializations[0] || null;

  React.useEffect(() => {
    if (selectedSpec && !selectedSpecializationId) {
      onSelectSpecialization(selectedSpec.id);
    }
  }, [selectedSpec, selectedSpecializationId]);

  // Set local notes state when selected specialization changes
  React.useEffect(() => {
    if (selectedSpec) {
      setEditedNotes(selectedSpec.notes || '');
    }
  }, [selectedSpec?.id]);

  const handleCreateSpecialization = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddSpecialization(
      newTitle.trim(),
      newCategory,
      newDescription.trim(),
      newNotes.trim()
    );
    // Reset filters and form
    setSearchQuery('');
    setSelectedCategory('All');
    setNewTitle('');
    setNewCategory('System');
    setNewDescription('');
    setNewNotes('');
    setShowAddModal(false);
  };

  const handleAddDefaultRow = () => {
    if (!selectedSpec) return;
    onAddResource(selectedSpec.id, {
      title: 'New Study Resource',
      type: 'Book',
      creator: 'Author Name',
      completedUnits: 0,
      totalUnits: 10,
      unitLabel: 'chapters',
      isCurrentFocus: selectedSpec.resources.length === 0, // Focus if first
      status: 'Not Started',
      priority: 'Medium',
      notes: 'Initial focus notes',
    });
  };

  // Get active focus and work recommendation
  const currentFocusResource = selectedSpec?.resources.find((r) => r.isCurrentFocus);
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
    <div className="space-y-6" id="specializations-explorer-root">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272a] pb-5">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#fafafa] flex items-center gap-2">
            <Cpu className="h-5 w-5 text-blue-500 animate-[pulse_2s_infinite]" />
            Core Specializations
          </h1>
          <p className="text-[#a1a1aa] text-xs mt-1">
            Build and track deep domain expertise. Define target study tracks, configure inline spreadsheets, and advance your focus.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded text-xs transition cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          Record New Specialization
        </button>
      </div>

      {/* Scalable Specializations Navigation & Filter Bar (Handles 50+ Specializations) */}
      <div className="bg-[#18181b] border border-[#27272a] rounded p-4 space-y-3" id="specialization-tabs-bar">
        {/* Top Control Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Quick Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="h-3.5 w-3.5 text-[#71717a] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Filter ${specializations.length} specializations...`}
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

          {/* Direct Jump Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#71717a] font-mono uppercase shrink-0 font-bold hidden sm:inline">Jump To:</span>
            <select
              value={selectedSpec?.id || ''}
              onChange={(e) => onSelectSpecialization(e.target.value)}
              className="bg-[#09090b] border border-[#27272a] focus:border-blue-500 text-xs text-[#fafafa] rounded px-3 py-1.5 font-mono max-w-[200px] sm:max-w-[260px] truncate focus:outline-none cursor-pointer"
            >
              {specializations.map((s, idx) => (
                <option key={s.id} value={s.id}>
                  {idx + 1}. {s.title} [{s.category}]
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
            <span>{isGridExpanded ? 'Compact Pills' : `View Grid (${filteredSpecializations.length})`}</span>
          </button>
        </div>

        {/* Category Pills Filter */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#27272a]/60">
          <span className="text-[10px] text-[#71717a] font-mono uppercase font-bold mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Category:
          </span>
          {categories.map((cat) => {
            const count = cat === 'All' ? specializations.length : specializations.filter((s) => s.category === cat).length;
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

        {/* Specialization Chips (Scrollable Pill Strip or Full Grid View) */}
        {filteredSpecializations.length === 0 ? (
          <div className="text-center py-4 text-xs text-[#71717a] font-mono">
            No specializations match filter "{searchQuery}". <button onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }} className="text-blue-400 underline hover:text-blue-300">Reset filters</button>
          </div>
        ) : isGridExpanded ? (
          /* Grid View Mode */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-2 max-h-[300px] overflow-y-auto pr-1">
            {filteredSpecializations.map((spec) => {
              const isSelected = selectedSpec?.id === spec.id;
              return (
                <div
                  key={spec.id}
                  onClick={() => onSelectSpecialization(spec.id)}
                  className={`p-2.5 text-left rounded border transition flex flex-col justify-between gap-1.5 cursor-pointer group/card ${
                    isSelected
                      ? 'bg-blue-600/15 border-blue-500 text-blue-300 font-bold'
                      : 'bg-[#09090b] border-[#27272a] text-[#a1a1aa] hover:border-zinc-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 w-full">
                    <span className="text-[9px] font-mono uppercase bg-blue-950/40 text-blue-400 px-1.5 py-0.5 rounded border border-blue-900/30">
                      {spec.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] font-mono text-[#71717a]">
                        {spec.resources.length} items
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSpecToDelete(spec);
                        }}
                        className="p-1 text-zinc-500 hover:text-red-400 hover:bg-red-950/40 rounded transition cursor-pointer"
                        title="Delete specialization"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <span className="text-xs font-semibold truncate block w-full">{spec.title}</span>
                </div>
              );
            })}
          </div>
        ) : (
          /* Horizontal Pill Strip View Mode */
          <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto pr-1 pt-1">
            {filteredSpecializations.map((spec) => {
              const isSelected = selectedSpec?.id === spec.id;
              return (
                <div
                  key={spec.id}
                  onClick={() => onSelectSpecialization(spec.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded border transition flex items-center gap-1.5 cursor-pointer group/pill ${
                    isSelected
                      ? 'bg-blue-600/15 border-blue-500 text-blue-400 font-bold shadow-sm'
                      : 'bg-[#09090b] border-[#27272a] text-[#a1a1aa] hover:border-zinc-700 hover:text-white'
                  }`}
                >
                  <Cpu className={`h-3 w-3 ${isSelected ? 'text-blue-500' : 'text-zinc-600'}`} />
                  <span>{spec.title}</span>
                  <span className="text-[9px] font-mono opacity-60 bg-[#18181b] px-1 py-0.2 rounded uppercase">
                    {spec.category}
                  </span>
                  <span className="text-[9px] font-mono text-[#71717a] bg-[#18181b] px-1 rounded">
                    {spec.resources.length}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSpecToDelete(spec);
                    }}
                    className="p-0.5 text-zinc-500 hover:text-red-400 hover:bg-red-950/40 rounded transition cursor-pointer"
                    title="Delete specialization"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedSpec ? (
        <div className="space-y-6">
          
          {/* Selected Specialization Description Banner */}
          <div className="bg-[#18181b]/50 border border-[#27272a] rounded p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1 max-w-2xl">
              <span className="font-mono text-[9px] text-blue-500 font-bold uppercase tracking-wider block">
                {selectedSpec.category} SPECIALITY • INITIATED {selectedSpec.dateInitiated}
              </span>
              <h2 className="text-base font-bold text-white">{selectedSpec.title}</h2>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">{selectedSpec.description}</p>
            </div>
            
            <button
              onClick={() => {
                setSpecToDelete(selectedSpec);
              }}
              className="text-[10px] font-bold text-red-400 hover:text-red-300 border border-red-950/45 hover:border-red-900 bg-red-950/10 px-3 py-1.5 rounded transition cursor-pointer shrink-0 self-end md:self-auto"
            >
              Delete Specialization
            </button>
          </div>

          {/* DYNAMIC NEXT STEP ENGINE TARGET CALLOUT */}
          <div className="bg-[#18181b]/40 border border-[#27272a] rounded p-4 relative overflow-hidden" id="spec-target-engine">
            {/* Ambient visual pointer backing */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500/5 rotate-12 transition">
              <Cpu className="h-24 w-24" />
            </div>

            <div className="flex items-start gap-3 relative z-10">
              <div className="p-2 bg-blue-600/10 border border-blue-500/20 rounded-full text-blue-400 animate-pulse mt-0.5">
                <Compass className="h-5 w-5 animate-[spin_6s_linear_infinite]" />
              </div>
              <div className="space-y-1">
                <span className="font-mono text-[9px] text-blue-400 font-bold uppercase tracking-wider block">
                  INTELLIGENT FOCUS POINTER
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
                  Updating progress anywhere in the Excel grid below immediately recalculates your specialization priorities.
                </p>
              </div>
            </div>
          </div>

          {/* SPREADSHEET CARD PANEL */}
          <div className="bg-[#18181b] border border-[#27272a] rounded overflow-hidden shadow-xl" id="spec-excel-grid-panel">
            <div className="p-4 bg-[#1e1e22]/50 border-b border-[#27272a] flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <h3 className="text-xs font-bold font-mono text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  SPECIALIZATION RESOURCE SPREADSHEET
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

            {selectedSpec.resources.length === 0 ? (
              <div className="p-12 text-center space-y-4">
                <BookOpen className="h-10 w-10 text-zinc-700 mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-zinc-300">Spreadsheet Empty</h4>
                  <p className="text-[11px] text-[#71717a] max-w-xs mx-auto">Create columns of books, courses, code streams, or papers to organize this specialization.</p>
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
                    {selectedSpec.resources.map((res) => (
                      <tr
                        key={res.id}
                        className={`hover:bg-[#1f1f23]/40 transition-colors ${
                          res.isCurrentFocus ? 'bg-blue-500/[0.02]' : ''
                        }`}
                      >
                        {/* 1. FOCUS POINTER / SELECTION */}
                        <td className="p-1.5 text-center">
                          <button
                            onClick={() => onUpdateResource(selectedSpec.id, res.id, { isCurrentFocus: true })}
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
                            onChange={(e) => onUpdateResource(selectedSpec.id, res.id, { title: e.target.value })}
                            className="w-full bg-transparent border-none text-white px-1 py-1 focus:bg-[#09090b] focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans rounded"
                            placeholder="Resource title"
                          />
                        </td>

                        {/* 3. TYPE DROPDOWN */}
                        <td className="p-1 border-l border-[#27272a]">
                          <select
                            value={res.type}
                            onChange={(e) => onUpdateResource(selectedSpec.id, res.id, { type: e.target.value as any })}
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
                            onChange={(e) => onUpdateResource(selectedSpec.id, res.id, { creator: e.target.value })}
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
                              onChange={(e) => onUpdateResource(selectedSpec.id, res.id, { url: e.target.value })}
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
                              onClick={() => onUpdateResource(selectedSpec.id, res.id, { completedUnits: res.completedUnits - 1 })}
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
                                onUpdateResource(selectedSpec.id, res.id, { completedUnits: isNaN(val) ? 0 : val });
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
                                onUpdateResource(selectedSpec.id, res.id, { totalUnits: isNaN(val) ? 1 : val });
                              }}
                              className="w-10 bg-[#09090b]/80 border border-[#27272a] text-center text-white py-0.5 rounded font-mono text-xs focus:ring-1 focus:ring-blue-500"
                            />
                            <button
                              onClick={() => onUpdateResource(selectedSpec.id, res.id, { completedUnits: res.completedUnits + 1 })}
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
                            onChange={(e) => onUpdateResource(selectedSpec.id, res.id, { unitLabel: e.target.value })}
                            className="w-full bg-transparent border-none text-zinc-400 px-1 py-1 focus:bg-[#09090b] focus:outline-none font-mono text-[11px] rounded"
                            placeholder="e.g. chapters"
                          />
                        </td>

                        {/* 7. PRIORITY DROPDOWN */}
                        <td className="p-1 border-l border-[#27272a]">
                          <select
                            value={res.priority}
                            onChange={(e) => onUpdateResource(selectedSpec.id, res.id, { priority: e.target.value as any })}
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
                              setResourceToDelete({ specializationId: selectedSpec.id, resource: res });
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

          {/* Specialization Notes Card */}
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
                      onUpdateSpecialization(selectedSpec.id, { notes: editedNotes });
                      setIsEditingNotes(false);
                    }}
                    className="text-[10px] bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded transition cursor-pointer font-bold"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditedNotes(selectedSpec.notes || '');
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
              selectedSpec.notes ? (
                <p className="text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed font-mono">
                  {selectedSpec.notes}
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
          <h3 className="font-display font-medium text-sm text-white">No Specializations Tracked</h3>
          <p className="text-[#a1a1aa] text-xs max-w-sm mx-auto mt-2">
            You haven't set up any specializations yet. Record a new specialization like "Compiler Construction" or "Distributed Systems" to unlock specialty spreadsheet trackers.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-6 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded text-xs transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            Log First Specialization
          </button>
        </div>
      )}

      {/* CREATE SPECIALIZATION MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#18181b] border border-[#27272a] rounded p-6 max-w-md w-full space-y-4 shadow-xl"
            >
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Cpu className="h-4 w-4 text-blue-500 animate-[pulse_2s_infinite]" />
                Record New Core Specialization
              </h3>
              <p className="text-[#a1a1aa] text-xs leading-relaxed">
                Add a new core specialty track of study. This creates a dedicated dashboard with interactive columns of books, papers, or video playlists.
              </p>

              <form onSubmit={handleCreateSpecialization} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#71717a] uppercase mb-1">
                    Speciality Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g., Compiler Construction, Distributed Consensus"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#71717a] uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="System">System</option>
                    <option value="Theory">Theory</option>
                    <option value="Application">Application</option>
                    <option value="Specialty">Specialty</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#71717a] uppercase mb-1">
                    Description / Goal Statement
                  </label>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 h-16"
                    placeholder="Declare what complex domains you intend to specialize in..."
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#71717a] uppercase mb-1">
                    Initial Study Notes / Syllabus
                  </label>
                  <textarea
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 h-20"
                    placeholder="Optional: Outline main study books, schedule benchmarks, or general details."
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-[#a1a1aa] hover:text-white bg-[#09090b] hover:bg-zinc-900 border border-[#27272a] rounded transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded transition cursor-pointer"
                  >
                    Record Specialization
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Sleek Deletion Confirmations */}
      <ConfirmModal
        isOpen={specToDelete !== null}
        title="Delete Specialization?"
        message={`Permanently purge the core specialization "${specToDelete?.title}" and all its listed spreadsheets? This cannot be undone.`}
        confirmText="Delete Specialization"
        cancelText="Cancel"
        onConfirm={() => {
          if (specToDelete) {
            onDeleteSpecialization(specToDelete.id);
            const remaining = specializations.filter((s) => s.id !== specToDelete.id);
            onSelectSpecialization(remaining[0]?.id || null);
            setSpecToDelete(null);
          }
        }}
        onCancel={() => setSpecToDelete(null)}
        variant="danger"
      />

      <ConfirmModal
        isOpen={resourceToDelete !== null}
        title="Remove Resource?"
        message={`Remove the study resource "${resourceToDelete?.resource.title}" from this specialization spreadsheet?`}
        confirmText="Remove Row"
        cancelText="Cancel"
        onConfirm={() => {
          if (resourceToDelete) {
            onDeleteResource(resourceToDelete.specializationId, resourceToDelete.resource.id);
            setResourceToDelete(null);
          }
        }}
        onCancel={() => setResourceToDelete(null)}
        variant="danger"
      />

    </div>
  );
}
