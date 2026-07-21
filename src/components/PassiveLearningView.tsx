/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { PassiveLearningItem } from '../types';
import {
  BookOpen,
  Tv,
  Star,
  CheckCircle2,
  ExternalLink,
  Plus,
  Search,
  RotateCw,
  Sparkles,
  Edit2,
  Trash2,
  TrendingUp,
  X,
  Play,
  Check,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface PassiveLearningViewProps {
  items: PassiveLearningItem[];
  rotationIndex?: number;
  onAddItem: (item: Omit<PassiveLearningItem, 'id'>) => void;
  onUpdateItem: (id: string, updates: Partial<PassiveLearningItem>) => void;
  onDeleteItem: (id: string) => void;
  onToggleRotation: (id: string) => void;
  onIncrementProgress: (id: string, delta: number) => void;
  onAdvanceRotation: () => void;
}

export function PassiveLearningView({
  items = [],
  rotationIndex = 0,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onToggleRotation,
  onIncrementProgress,
  onAdvanceRotation,
}: PassiveLearningViewProps) {
  const [filterType, setFilterType] = useState<
    'all' | 'rotation' | 'videos' | 'books' | 'completed'
  >('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<PassiveLearningItem | null>(
    null
  );

  // Form Fields for Add / Edit
  const [formTitle, setFormTitle] = useState('');
  const [formCreator, setFormCreator] = useState('');
  const [formType, setFormType] = useState<
    'Video Playlist' | 'Video Course' | 'Book' | 'Article/Paper'
  >('Video Playlist');
  const [formCategory, setFormCategory] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formTotalUnits, setFormTotalUnits] = useState(10);
  const [formCompletedUnits, setFormCompletedUnits] = useState(0);
  const [formUnitLabel, setFormUnitLabel] = useState<
    'videos' | 'chapters' | 'units'
  >('videos');
  const [formInRotation, setFormInRotation] = useState(false);
  const [formNotes, setFormNotes] = useState('');

  // Open Edit Modal
  const handleOpenEdit = (item: PassiveLearningItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormCreator(item.creator || '');
    setFormType(item.type);
    setFormCategory(item.category);
    setFormUrl(item.url || '');
    setFormTotalUnits(item.totalUnits);
    setFormCompletedUnits(item.completedUnits);
    setFormUnitLabel(item.unitLabel);
    setFormInRotation(item.inRotation);
    setFormNotes(item.notes || '');
    setShowAddModal(true);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormCreator('');
    setFormType('Video Playlist');
    setFormCategory('C++');
    setFormUrl('');
    setFormTotalUnits(10);
    setFormCompletedUnits(0);
    setFormUnitLabel('videos');
    setFormInRotation(true);
    setFormNotes('');
    setShowAddModal(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingItem) {
      onUpdateItem(editingItem.id, {
        title: formTitle.trim(),
        creator: formCreator.trim(),
        type: formType,
        category: formCategory.trim() || 'General',
        url: formUrl.trim(),
        totalUnits: Math.max(1, formTotalUnits),
        completedUnits: Math.max(
          0,
          Math.min(formTotalUnits, formCompletedUnits)
        ),
        unitLabel: formUnitLabel,
        inRotation: formInRotation,
        notes: formNotes.trim(),
      });
    } else {
      onAddItem({
        title: formTitle.trim(),
        creator: formCreator.trim(),
        type: formType,
        category: formCategory.trim() || 'General',
        url: formUrl.trim(),
        totalUnits: Math.max(1, formTotalUnits),
        completedUnits: Math.max(
          0,
          Math.min(formTotalUnits, formCompletedUnits)
        ),
        unitLabel: formUnitLabel,
        inRotation: formInRotation,
        notes: formNotes.trim(),
      });
    }

    setShowAddModal(false);
  };

  // Derive Categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return ['All', ...Array.from(set).sort()];
  }, [items]);

  // Overall Statistics
  const stats = useMemo(() => {
    const totalItems = items.length;
    const videoItems = items.filter(
      (i) => i.type === 'Video Playlist' || i.type === 'Video Course'
    ).length;
    const bookItems = items.filter((i) => i.type === 'Book').length;
    const rotationPool = items.filter((i) => i.inRotation);

    let totalUnitsAll = 0;
    let completedUnitsAll = 0;
    let completedItemsCount = 0;

    items.forEach((item) => {
      totalUnitsAll += item.totalUnits;
      completedUnitsAll += Math.min(item.completedUnits, item.totalUnits);
      if (item.completedUnits >= item.totalUnits) {
        completedItemsCount++;
      }
    });

    const overallPercentage =
      totalUnitsAll > 0
        ? Math.round((completedUnitsAll / totalUnitsAll) * 100)
        : 0;

    return {
      totalItems,
      videoItems,
      bookItems,
      rotationCount: rotationPool.length,
      totalUnitsAll,
      completedUnitsAll,
      completedItemsCount,
      overallPercentage,
    };
  }, [items]);

  // Active Rotation Queue & Current Recommendation
  const activeRotationList = useMemo(() => {
    return items.filter((i) => i.inRotation && i.completedUnits < i.totalUnits);
  }, [items]);

  const recommendedItem = useMemo(() => {
    if (activeRotationList.length === 0) {
      // Fallback if no focus items in rotation
      const inProgress = items.filter(
        (i) => i.completedUnits > 0 && i.completedUnits < i.totalUnits
      );
      if (inProgress.length > 0) return inProgress[0];
      const notStarted = items.filter((i) => i.completedUnits < i.totalUnits);
      return notStarted[0] || null;
    }
    const idx = Math.abs(rotationIndex) % activeRotationList.length;
    return activeRotationList[idx];
  }, [activeRotationList, items, rotationIndex]);

  // Filtered List for Main Display
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Type / Tab filter
      if (filterType === 'rotation' && !item.inRotation) return false;
      if (
        filterType === 'videos' &&
        item.type !== 'Video Playlist' &&
        item.type !== 'Video Course'
      )
        return false;
      if (filterType === 'books' && item.type !== 'Book') return false;
      if (filterType === 'completed' && item.completedUnits < item.totalUnits)
        return false;

      // Category filter
      if (selectedCategory !== 'All' && item.category !== selectedCategory)
        return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchCreator = item.creator?.toLowerCase().includes(q) || false;
        const matchCat = item.category.toLowerCase().includes(q);
        const matchNotes = item.notes?.toLowerCase().includes(q) || false;
        if (!matchTitle && !matchCreator && !matchCat && !matchNotes)
          return false;
      }

      return true;
    });
  }, [items, filterType, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6 pb-12" id="passive-learning-view">
      {/* Header Banner */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-5 sm:p-6 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-20 -bottom-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 font-mono text-[10px] uppercase font-bold rounded">
                LEISURE & PASSIVE STUDY ENGINE
              </span>
              <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[10px] uppercase font-bold rounded flex items-center gap-1">
                <Star className="h-3 w-3 fill-amber-400" />
                {stats.rotationCount} In Active Rotation
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Passive Learning & Course Rotation
            </h1>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              Curated YouTube playlists, open university lectures, and reference
              books for your free time. Keep active items in rotation, follow the
              recommendation engine blindly, and make effortless daily CS progress.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold transition shadow-lg shadow-blue-500/20 cursor-pointer self-start lg:self-center shrink-0"
            id="btn-add-passive-resource"
          >
            <Plus className="h-4 w-4" />
            <span>Add Course or Book</span>
          </button>
        </div>

        {/* Global Statistics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#27272a]">
          <div className="bg-[#09090b]/60 border border-[#27272a] p-3 rounded">
            <span className="text-[10px] font-mono uppercase text-[#71717a] block">
              Total Playlists / Courses
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-lg font-bold text-white font-mono">
                {stats.videoItems}
              </span>
              <Tv className="h-4 w-4 text-blue-400" />
            </div>
          </div>

          <div className="bg-[#09090b]/60 border border-[#27272a] p-3 rounded">
            <span className="text-[10px] font-mono uppercase text-[#71717a] block">
              Total Reference Books
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-lg font-bold text-white font-mono">
                {stats.bookItems}
              </span>
              <BookOpen className="h-4 w-4 text-emerald-400" />
            </div>
          </div>

          <div className="bg-[#09090b]/60 border border-[#27272a] p-3 rounded">
            <span className="text-[10px] font-mono uppercase text-[#71717a] block">
              Finished Masteries
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-lg font-bold text-emerald-400 font-mono">
                {stats.completedItemsCount} / {stats.totalItems}
              </span>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
          </div>

          <div className="bg-[#09090b]/60 border border-[#27272a] p-3 rounded">
            <span className="text-[10px] font-mono uppercase text-[#71717a] block">
              Units Completed
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-lg font-bold text-amber-400 font-mono">
                {stats.completedUnitsAll} / {stats.totalUnitsAll}
              </span>
              <TrendingUp className="h-4 w-4 text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Next Item Spotlight Card */}
      {recommendedItem ? (
        <div className="bg-gradient-to-r from-[#1e1b4b]/60 via-[#18181b] to-[#09090b] border-2 border-indigo-500/40 rounded-lg p-5 sm:p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-mono text-[10px] uppercase font-bold rounded flex items-center gap-1.5 animate-pulse">
                  <Sparkles className="h-3 w-3 text-indigo-300" />
                  CURRENT RECOMMENDATION
                </span>

                <span className="px-2.5 py-0.5 bg-[#27272a] text-[#a1a1aa] font-mono text-[10px] rounded">
                  {recommendedItem.type}
                </span>

                <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono text-[10px] font-bold rounded">
                  {recommendedItem.category}
                </span>
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <span>{recommendedItem.title}</span>
                  {recommendedItem.url && (
                    <a
                      href={recommendedItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 transition"
                      title="Open Resource Link"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </h2>
                {recommendedItem.creator && (
                  <p className="text-xs text-[#a1a1aa] font-mono mt-0.5">
                    By {recommendedItem.creator}
                  </p>
                )}
              </div>

              {/* Progress Detail */}
              <div className="space-y-1.5 max-w-xl">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-indigo-300 font-bold flex items-center gap-1">
                    <ArrowRight className="h-3.5 w-3.5" />
                    Next Up: Watch/Read {recommendedItem.unitLabel.slice(0, -1)} #{recommendedItem.completedUnits + 1}
                  </span>
                  <span className="text-[#a1a1aa]">
                    {recommendedItem.completedUnits} / {recommendedItem.totalUnits}{' '}
                    {recommendedItem.unitLabel} (
                    {Math.round(
                      (recommendedItem.completedUnits /
                        recommendedItem.totalUnits) *
                        100
                    )}
                    %)
                  </span>
                </div>
                <div className="w-full bg-[#27272a] h-2.5 rounded-full overflow-hidden border border-[#3f3f46]">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-blue-400 h-full transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        100,
                        (recommendedItem.completedUnits /
                          recommendedItem.totalUnits) *
                          100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {recommendedItem.notes && (
                <p className="text-xs text-[#71717a] italic line-clamp-2">
                  "{recommendedItem.notes}"
                </p>
              )}
            </div>

            {/* Recommendation Quick Controls */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 self-start lg:self-center">
              <button
                onClick={() => {
                  onIncrementProgress(recommendedItem.id, 1);
                  onAdvanceRotation();
                }}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/20 cursor-pointer"
                id="btn-complete-next-recommendation"
              >
                <Check className="h-4 w-4" />
                <span>Mark 1 Completed & Rotate Next</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={onAdvanceRotation}
                  className="flex-1 px-3 py-2 bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa] rounded text-xs font-mono flex items-center justify-center gap-1.5 transition cursor-pointer border border-[#3f3f46]"
                  title="Cycle to next course in rotation"
                >
                  <RotateCw className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Skip / Cycle</span>
                </button>

                {recommendedItem.url && (
                  <a
                    href={recommendedItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-500/40 text-indigo-300 rounded text-xs font-mono flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Play className="h-3.5 w-3.5 text-indigo-300 fill-indigo-300" />
                    <span>Watch / Open</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-6 text-center space-y-2">
          <Star className="h-8 w-8 text-amber-500/40 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Focus Items in Rotation</h3>
          <p className="text-xs text-[#71717a] max-w-md mx-auto">
            Click the star icon <Star className="h-3 w-3 inline text-amber-400" /> on any course or book below to add it to your active leisure rotation!
          </p>
        </div>
      )}

      {/* Navigation, Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded text-xs font-mono transition whitespace-nowrap cursor-pointer ${
              filterType === 'all'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] border border-[#27272a]'
            }`}
          >
            All Items ({items.length})
          </button>

          <button
            onClick={() => setFilterType('rotation')}
            className={`px-3 py-1.5 rounded text-xs font-mono transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              filterType === 'rotation'
                ? 'bg-amber-600 text-white font-bold'
                : 'bg-[#18181b] hover:bg-[#27272a] text-amber-400 border border-[#27272a]'
            }`}
          >
            <Star className="h-3 w-3 fill-amber-400" />
            <span>Active Rotation ({stats.rotationCount})</span>
          </button>

          <button
            onClick={() => setFilterType('videos')}
            className={`px-3 py-1.5 rounded text-xs font-mono transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              filterType === 'videos'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] border border-[#27272a]'
            }`}
          >
            <Tv className="h-3 w-3 text-blue-400" />
            <span>Playlists / Courses ({stats.videoItems})</span>
          </button>

          <button
            onClick={() => setFilterType('books')}
            className={`px-3 py-1.5 rounded text-xs font-mono transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              filterType === 'books'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] border border-[#27272a]'
            }`}
          >
            <BookOpen className="h-3 w-3 text-emerald-400" />
            <span>Books ({stats.bookItems})</span>
          </button>

          <button
            onClick={() => setFilterType('completed')}
            className={`px-3 py-1.5 rounded text-xs font-mono transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              filterType === 'completed'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] border border-[#27272a]'
            }`}
          >
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            <span>Completed ({stats.completedItemsCount})</span>
          </button>
        </div>

        {/* Category & Search Filter */}
        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 bg-[#18181b] border border-[#27272a] rounded text-xs text-[#a1a1aa] font-mono focus:border-blue-500 outline-none cursor-pointer"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                Category: {cat}
              </option>
            ))}
          </select>

          <div className="relative flex-1 sm:w-48">
            <Search className="h-3.5 w-3.5 text-[#71717a] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#18181b] border border-[#27272a] rounded text-xs text-white placeholder-[#52525b] focus:border-blue-500 outline-none font-mono"
            />
          </div>
        </div>
      </div>

      {/* Grid of Passive Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const isFinished = item.completedUnits >= item.totalUnits;
          const percentage =
            item.totalUnits > 0
              ? Math.min(
                  100,
                  Math.round((item.completedUnits / item.totalUnits) * 100)
                )
              : 0;

          return (
            <div
              key={item.id}
              className={`bg-[#18181b] border rounded-lg p-4 flex flex-col justify-between transition group relative ${
                item.inRotation
                  ? 'border-amber-500/40 shadow-md shadow-amber-500/5 bg-gradient-to-b from-[#18181b] to-[#1e1b4b]/20'
                  : isFinished
                  ? 'border-emerald-500/30 bg-[#121c18]/30'
                  : 'border-[#27272a] hover:border-[#3f3f46]'
              }`}
            >
              <div className="space-y-3">
                {/* Header badges */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 ${
                        item.type === 'Book'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}
                    >
                      {item.type === 'Book' ? (
                        <BookOpen className="h-3 w-3" />
                      ) : (
                        <Tv className="h-3 w-3" />
                      )}
                      {item.type}
                    </span>

                    <span className="px-2 py-0.5 bg-[#27272a] text-[#a1a1aa] font-mono text-[10px] rounded">
                      {item.category}
                    </span>
                  </div>

                  {/* Focus Rotation Toggle Star */}
                  <button
                    onClick={() => onToggleRotation(item.id)}
                    className={`p-1.5 rounded transition cursor-pointer ${
                      item.inRotation
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-[#27272a] text-[#71717a] hover:text-amber-400'
                    }`}
                    title={
                      item.inRotation
                        ? 'Remove from Active Rotation'
                        : 'Add to Active Rotation'
                    }
                  >
                    <Star
                      className={`h-3.5 w-3.5 ${
                        item.inRotation ? 'fill-amber-400' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Title & Creator */}
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition leading-snug flex items-center justify-between gap-2">
                    <span>{item.title}</span>
                  </h3>
                  {item.creator && (
                    <p className="text-[11px] text-[#71717a] font-mono mt-0.5 truncate">
                      By {item.creator}
                    </p>
                  )}
                </div>

                {/* Progress Bar & Counter */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#a1a1aa]">
                      {item.completedUnits} / {item.totalUnits} {item.unitLabel}
                    </span>
                    <span
                      className={`font-bold ${
                        isFinished ? 'text-emerald-400' : 'text-blue-400'
                      }`}
                    >
                      {percentage}%
                    </span>
                  </div>

                  <div className="w-full bg-[#27272a] h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isFinished
                          ? 'bg-emerald-400'
                          : item.inRotation
                          ? 'bg-amber-400'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                {item.notes && (
                  <p className="text-[11px] text-[#71717a] italic line-clamp-2 pt-1 border-t border-[#27272a]/50">
                    "{item.notes}"
                  </p>
                )}
              </div>

              {/* Action Controls Footer */}
              <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-[#27272a]">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onIncrementProgress(item.id, -1)}
                    disabled={item.completedUnits <= 0}
                    className="px-2 py-1 bg-[#27272a] hover:bg-[#3f3f46] text-[#a1a1aa] disabled:opacity-30 rounded text-[10px] font-mono cursor-pointer disabled:cursor-not-allowed"
                    title="Decrement progress"
                  >
                    -1
                  </button>

                  <button
                    onClick={() => onIncrementProgress(item.id, 1)}
                    disabled={item.completedUnits >= item.totalUnits}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-30 rounded text-[10px] font-mono font-bold cursor-pointer disabled:cursor-not-allowed flex items-center gap-1"
                    title="Increment progress"
                  >
                    +1 {item.unitLabel.slice(0, -1)}
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-[#27272a] hover:bg-blue-500/20 hover:text-blue-400 text-[#a1a1aa] rounded transition cursor-pointer"
                      title="Open URL"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}

                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 bg-[#27272a] hover:bg-[#3f3f46] text-[#a1a1aa] hover:text-white rounded transition cursor-pointer"
                    title="Edit Item"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      if (
                        confirm(
                          `Delete "${item.title}" from your passive learning list?`
                        )
                      ) {
                        onDeleteItem(item.id);
                      }
                    }}
                    className="p-1.5 bg-[#27272a] hover:bg-red-500/20 hover:text-red-400 text-[#71717a] rounded transition cursor-pointer"
                    title="Delete Item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-12 text-center space-y-3">
          <Search className="h-8 w-8 text-[#52525b] mx-auto" />
          <h3 className="text-base font-bold text-white">
            No Passive Resources Found
          </h3>
          <p className="text-xs text-[#71717a] max-w-sm mx-auto">
            Try resetting search filters or add a new course/book to your
            passive learning tracker.
          </p>
        </div>
      )}

      {/* Add / Edit Resource Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#18181b] border border-[#27272a] rounded-lg max-w-lg w-full p-6 space-y-5 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272a]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-500" />
                <span>
                  {editingItem ? 'Edit Leisure Resource' : 'Add New Leisure Resource'}
                </span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-[#71717a] hover:text-white rounded cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#a1a1aa] mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. C++ Cherno / Pragmatic Programmer"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded text-xs text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-[#a1a1aa] mb-1">
                    Resource Type
                  </label>
                  <select
                    value={formType}
                    onChange={(e) =>
                      setFormType(
                        e.target.value as
                          | 'Video Playlist'
                          | 'Video Course'
                          | 'Book'
                          | 'Article/Paper'
                      )
                    }
                    className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded text-xs text-white focus:border-blue-500 outline-none cursor-pointer"
                  >
                    <option value="Video Playlist">Video Playlist</option>
                    <option value="Video Course">Video Course</option>
                    <option value="Book">Book</option>
                    <option value="Article/Paper">Article/Paper</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#a1a1aa] mb-1">
                    Category Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. C++, Algorithms, OS"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded text-xs text-white focus:border-blue-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-[#a1a1aa] mb-1">
                    Author / Creator
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. The Cherno / MIT OCW"
                    value={formCreator}
                    onChange={(e) => setFormCreator(e.target.value)}
                    className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded text-xs text-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#a1a1aa] mb-1">
                    Unit Label
                  </label>
                  <select
                    value={formUnitLabel}
                    onChange={(e) =>
                      setFormUnitLabel(
                        e.target.value as 'videos' | 'chapters' | 'units'
                      )
                    }
                    className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded text-xs text-white focus:border-blue-500 outline-none cursor-pointer"
                  >
                    <option value="videos">videos</option>
                    <option value="chapters">chapters</option>
                    <option value="units">units</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-[#a1a1aa] mb-1">
                    Completed Units
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formCompletedUnits}
                    onChange={(e) =>
                      setFormCompletedUnits(Number(e.target.value))
                    }
                    className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded text-xs text-white focus:border-blue-500 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#a1a1aa] mb-1">
                    Total Units
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formTotalUnits}
                    onChange={(e) => setFormTotalUnits(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded text-xs text-white focus:border-blue-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#a1a1aa] mb-1">
                  URL / Playlist Link
                </label>
                <input
                  type="url"
                  placeholder="https://youtube.com/playlist?list=..."
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded text-xs text-white focus:border-blue-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#a1a1aa] mb-1">
                  Personal Notes / Focus
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Focus on pointers, RAII, and smart pointers first..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded text-xs text-white focus:border-blue-500 outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="chk-rotation"
                  checked={formInRotation}
                  onChange={(e) => setFormInRotation(e.target.checked)}
                  className="rounded border-[#27272a] bg-[#09090b] text-blue-600 focus:ring-0 cursor-pointer"
                />
                <label
                  htmlFor="chk-rotation"
                  className="text-xs text-white font-mono cursor-pointer flex items-center gap-1"
                >
                  <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                  Include in Active Leisure Rotation
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#27272a]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-[#27272a] hover:bg-[#3f3f46] text-white rounded text-xs font-mono transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold transition shadow-lg shadow-blue-600/20 cursor-pointer"
                >
                  {editingItem ? 'Save Changes' : 'Add Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
