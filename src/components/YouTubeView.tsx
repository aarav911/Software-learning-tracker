/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { YouTubePlaylist, YouTubeVideo, StudyResource } from '../types';
import {
  PlayCircle,
  Plus,
  Trash2,
  Lock,
  Unlock,
  BookOpen,
  Video,
  Award,
  AlertTriangle,
  ExternalLink,
  Check,
  Folder,
  Tag,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers,
  FileText,
  Clock,
  CheckSquare
} from 'lucide-react';

interface YouTubeViewProps {
  playlists: YouTubePlaylist[];
  onAddPlaylist: (title: string, description: string, topic: string) => void;
  onUpdatePlaylist: (id: string, fields: Partial<YouTubePlaylist>) => void;
  onDeletePlaylist: (id: string) => void;
  onDeactivatePlaylist: (id: string) => void;
  onAddVideo: (playlistId: string, title: string, scope: string, notes?: string) => void;
  onUpdateVideo: (playlistId: string, videoId: string, fields: Partial<YouTubeVideo>) => void;
  onDeleteVideo: (playlistId: string, videoId: string) => void;
  onAddResource: (playlistId: string, resource: Omit<StudyResource, 'id'>) => void;
  onUpdateResource: (playlistId: string, resourceId: string, fields: Partial<StudyResource>) => void;
  onDeleteResource: (playlistId: string, resourceId: string) => void;
}

export function YouTubeView({
  playlists,
  onAddPlaylist,
  onUpdatePlaylist,
  onDeletePlaylist,
  onDeactivatePlaylist,
  onAddVideo,
  onUpdateVideo,
  onDeleteVideo,
  onAddResource,
  onUpdateResource,
  onDeleteResource
}: YouTubeViewProps) {
  const activePlaylist = playlists.find((p) => p.isActive);
  const inactivePlaylists = playlists.filter((p) => !p.isActive);

  // Stats calculation
  const totalPlaylistsCount = playlists.length;
  const totalVideosCount = playlists.reduce((acc, p) => acc + p.videos.length, 0);
  const activePlaylistVideoCount = activePlaylist ? activePlaylist.videos.length : 0;
  const targetVideosForDeactivation = 10;
  const canDeactivateActive = activePlaylistVideoCount >= targetVideosForDeactivation;

  // New Playlist form states
  const [newTitle, setNewTitle] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [playlistFormError, setPlaylistFormError] = useState('');

  // New Video form states
  const [newVidTitle, setNewVidTitle] = useState('');
  const [newVidScope, setNewVidScope] = useState('');
  const [newVidNotes, setNewVidNotes] = useState('');
  const [vidFormError, setVidFormError] = useState('');

  // New Resource form states
  const [newResTitle, setNewResTitle] = useState('');
  const [newResType, setNewResType] = useState<StudyResource['type']>('Book');
  const [newResCreator, setNewResCreator] = useState('');
  const [newResTotalUnits, setNewResTotalUnits] = useState(1);
  const [newResUnitLabel, setNewResUnitLabel] = useState('chapters');
  const [newResUrl, setNewResUrl] = useState('');
  const [newResPriority, setNewResPriority] = useState<StudyResource['priority']>('Medium');
  const [newResNotes, setNewResNotes] = useState('');
  const [showAddResourceForm, setShowAddResourceForm] = useState(false);

  // Active playlist tab selection
  const [activeSubTab, setActiveSubTab] = useState<'videos' | 'resources'>('videos');

  // Accordion state for archived playlists
  const [expandedArchiveIds, setExpandedArchiveIds] = useState<Record<string, boolean>>({});

  const handleCreatePlaylist = (e: FormEvent) => {
    e.preventDefault();
    setPlaylistFormError('');
    if (!newTitle.trim() || !newTopic.trim() || !newDescription.trim()) {
      setPlaylistFormError('Please fill out all playlist fields.');
      return;
    }
    if (activePlaylist) {
      setPlaylistFormError('An active playlist already exists. You must deactivate it first.');
      return;
    }
    try {
      onAddPlaylist(newTitle.trim(), newDescription.trim(), newTopic.trim());
      setNewTitle('');
      setNewTopic('');
      setNewDescription('');
    } catch (err: any) {
      setPlaylistFormError(err.message || 'Failed to start playlist.');
    }
  };

  const handleCreateVideo = (e: FormEvent) => {
    e.preventDefault();
    setVidFormError('');
    if (!activePlaylist) {
      setVidFormError('No active playlist to add a video to.');
      return;
    }
    if (!newVidTitle.trim() || !newVidScope.trim()) {
      setVidFormError('Video title and scope are required.');
      return;
    }
    onAddVideo(activePlaylist.id, newVidTitle.trim(), newVidScope.trim(), newVidNotes.trim() || undefined);
    setNewVidTitle('');
    setNewVidScope('');
    setNewVidNotes('');
  };

  const handleCreateResource = (e: FormEvent) => {
    e.preventDefault();
    if (!activePlaylist) return;
    if (!newResTitle.trim() || !newResCreator.trim()) {
      alert('Resource title and creator are required.');
      return;
    }

    onAddResource(activePlaylist.id, {
      title: newResTitle.trim(),
      type: newResType,
      creator: newResCreator.trim(),
      completedUnits: 0,
      totalUnits: Math.max(1, newResTotalUnits),
      unitLabel: newResUnitLabel.trim() || 'units',
      isCurrentFocus: false,
      status: 'Not Started',
      priority: newResPriority,
      notes: newResNotes.trim(),
      url: newResUrl.trim() || undefined
    });

    // Reset fields
    setNewResTitle('');
    setNewResCreator('');
    setNewResTotalUnits(1);
    setNewResUnitLabel('chapters');
    setNewResUrl('');
    setNewResPriority('Medium');
    setNewResNotes('');
    setShowAddResourceForm(false);
  };

  const handleDeactivatePlaylist = (id: string) => {
    if (!canDeactivateActive) {
      alert(`Commitment Block: You must record at least ${targetVideosForDeactivation} videos in this playlist before you can finalize and start another one! (Current: ${activePlaylistVideoCount}/${targetVideosForDeactivation})`);
      return;
    }
    if (confirm('Are you sure you want to deactivate and finalize this playlist? You will not be able to add more videos or change it once deactivated.')) {
      try {
        onDeactivatePlaylist(id);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const toggleArchiveExpanded = (id: string) => {
    setExpandedArchiveIds((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="space-y-8 animate-fadeIn" id="feynman-youtube-view">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272a] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2 text-blue-500 font-mono text-xs uppercase tracking-widest">
            <Video className="h-4 w-4 animate-pulse" />
            <span>Feynman Deep-Learning Video Pipeline</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#fafafa] font-display">
            FEYNMAN VIDEO PLAYLISTS
          </h1>
          <p className="text-xs text-[#a1a1aa] max-w-2xl mt-1.5 leading-relaxed">
            Use the ultimate Feynman Technique to master hard topics deeply. 
            By designing and recording clear, well-structured videos, you force yourself to simplify complex architectures and prove your genuine understanding.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-[#18181b] border border-[#27272a] rounded p-3 font-mono text-[11px] text-[#a1a1aa]">
          <div className="text-center pr-4 border-r border-[#27272a]">
            <span className="block text-xs font-bold text-[#fafafa]">{totalPlaylistsCount}</span>
            <span className="text-[9px] uppercase tracking-wider text-[#71717a]">Playlists</span>
          </div>
          <div className="text-center">
            <span className="block text-xs font-bold text-[#fafafa]">{totalVideosCount}</span>
            <span className="text-[9px] uppercase tracking-wider text-[#71717a]">Videos Made</span>
          </div>
        </div>
      </div>

      {/* Feynman Commitment Rules callout */}
      <div className="p-4 rounded border border-blue-500/10 bg-blue-950/5 flex items-start gap-3.5 text-xs">
        <AlertTriangle className="h-4.5 w-4.5 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-[#fafafa] font-mono uppercase tracking-wide text-[10px]">
            The Feynman Execution Rule Invariant
          </h4>
          <p className="text-[#a1a1aa] leading-relaxed">
            To prevent starting half-baked learning pipelines and abandoning them, you can start <strong className="text-blue-400">at most 1 active playlist</strong> at a time.
            You <strong className="text-blue-400">cannot start another playlist</strong> until you deactivate the active one, and you <strong className="text-blue-400">cannot deactivate the active playlist until you have successfully created at least 10 videos</strong> for it. Commit, focus, and follow through.
          </p>
        </div>
      </div>

      {/* Active Playlist Section */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-[#52525b] uppercase tracking-widest font-mono">
          Active Feynman Pipeline
        </h2>

        {activePlaylist ? (
          <div className="bg-[#18181b] border border-[#27272a] rounded overflow-hidden">
            {/* Active Header Card */}
            <div className="p-4 sm:p-6 border-b border-[#27272a] bg-[#1c1c21] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-400 font-mono text-[9px] rounded font-bold uppercase tracking-wider">
                    ● Active Learning Pipeline
                  </span>
                  <span className="px-2 py-0.5 bg-zinc-800 border border-[#3f3f46] text-[#a1a1aa] font-mono text-[9px] rounded tracking-wider">
                    Topic: {activePlaylist.topic}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#fafafa]">{activePlaylist.title}</h3>
                <p className="text-xs text-[#a1a1aa] leading-relaxed">{activePlaylist.description}</p>
                <div className="text-[10px] text-[#71717a] font-mono">
                  Started on {new Date(activePlaylist.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* Deactivation & Progress Column */}
              <div className="w-full md:w-auto md:shrink-0 bg-[#09090b]/40 border border-[#27272a] rounded p-4 space-y-3 min-w-[240px]">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-[#71717a]">COMPLETION COMMITMENT:</span>
                  <span className={canDeactivateActive ? "text-green-400 font-bold" : "text-yellow-500 font-bold"}>
                    {activePlaylistVideoCount} / {targetVideosForDeactivation} Videos
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      canDeactivateActive ? 'bg-green-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${Math.min(100, (activePlaylistVideoCount / targetVideosForDeactivation) * 100)}%` }}
                  />
                </div>

                <button
                  disabled={!canDeactivateActive}
                  onClick={() => handleDeactivatePlaylist(activePlaylist.id)}
                  className={`w-full py-1.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border flex items-center justify-center gap-1.5 transition ${
                    canDeactivateActive
                      ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20 text-green-400 cursor-pointer'
                      : 'bg-[#18181b] border-zinc-800 text-zinc-500 cursor-not-allowed'
                  }`}
                  id="btn-deactivate-active-playlist"
                >
                  {canDeactivateActive ? (
                    <>
                      <Unlock className="h-3 w-3" />
                      Deactivate & Finalize Playlist
                    </>
                  ) : (
                    <>
                      <Lock className="h-3 w-3" />
                      Locked (Need {targetVideosForDeactivation - activePlaylistVideoCount} More Videos)
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Active Content Sub-tabs */}
            <div className="border-b border-[#27272a] bg-[#1c1c21]/40 px-4 sm:px-6 flex flex-wrap gap-2 sm:gap-4">
              <button
                onClick={() => setActiveSubTab('videos')}
                className={`py-3 text-xs font-mono tracking-wider border-b-2 transition ${
                  activeSubTab === 'videos'
                    ? 'border-blue-500 text-[#fafafa] font-bold'
                    : 'border-transparent text-[#71717a] hover:text-[#a1a1aa]'
                }`}
              >
                Videos Created ({activePlaylistVideoCount})
              </button>
              <button
                onClick={() => setActiveSubTab('resources')}
                className={`py-3 text-xs font-mono tracking-wider border-b-2 transition ${
                  activeSubTab === 'resources'
                    ? 'border-blue-500 text-[#fafafa] font-bold'
                    : 'border-transparent text-[#71717a] hover:text-[#a1a1aa]'
                }`}
              >
                Source Study Resources ({activePlaylist.resources.length})
              </button>
            </div>

            {/* Sub-tab content */}
            <div className="p-4 sm:p-6">
              {activeSubTab === 'videos' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* List of Videos */}
                  <div className="lg:col-span-2 space-y-4">
                    <h4 className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider font-mono">
                      Recorded Videos Checklist
                    </h4>

                    {activePlaylist.videos.length === 0 ? (
                      <div className="text-center py-12 border border-dashed border-[#27272a] rounded text-zinc-500 font-mono text-xs">
                        No videos recorded in this playlist yet. Create your first Feynman explanation below!
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {activePlaylist.videos.map((vid, idx) => (
                          <div
                            key={vid.id}
                            className="p-4 rounded border border-[#27272a] bg-[#18181b] hover:border-[#3f3f46] transition flex items-start gap-3"
                          >
                            <div className="mt-0.5 p-1.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-[9px] font-bold shrink-0 min-w-[24px] text-center">
                              #{idx + 1}
                            </div>
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <h5 className="text-xs font-bold text-[#fafafa] tracking-tight">{vid.title}</h5>
                              <div className="text-[11px] text-[#a1a1aa] bg-[#09090b]/40 border border-[#27272a] p-2 rounded leading-relaxed font-sans">
                                <span className="text-[9px] font-mono text-[#71717a] block uppercase tracking-wider mb-1">
                                  Scope / Concept Explained:
                                </span>
                                {vid.scope}
                              </div>
                              {vid.notes && (
                                <div className="text-[10px] text-[#71717a] italic">
                                  Notes: {vid.notes}
                                </div>
                              )}
                              <div className="text-[9px] text-[#71717a] font-mono text-right">
                                Created on {new Date(vid.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            <button
                              onClick={() => onDeleteVideo(activePlaylist.id, vid.id)}
                              className="text-[#71717a] hover:text-red-400 p-1 rounded hover:bg-red-500/5 transition cursor-pointer"
                              title="Delete Video"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add Video Form */}
                  <div className="bg-[#1c1c21] border border-[#27272a] rounded p-5 space-y-4 h-fit">
                    <div className="flex items-center gap-2 border-b border-[#27272a] pb-3">
                      <Plus className="h-4 w-4 text-blue-500" />
                      <h4 className="text-xs font-bold text-[#fafafa] uppercase tracking-wider font-mono">
                        Add Video Explanation
                      </h4>
                    </div>

                    <form onSubmit={handleCreateVideo} className="space-y-4">
                      {vidFormError && (
                        <div className="p-2.5 rounded bg-red-950/20 border border-red-900/30 text-red-400 font-mono text-[10px]">
                          {vidFormError}
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-[#71717a] uppercase tracking-wider font-mono">
                          Video Title
                        </label>
                        <input
                          type="text"
                          value={newVidTitle}
                          onChange={(e) => setNewVidTitle(e.target.value)}
                          placeholder="e.g. Single-Leader Failover & Consensus Invariants"
                          className="w-full bg-[#09090b] border border-[#27272a] focus:border-blue-500 focus:outline-none rounded px-3 py-1.5 text-xs text-[#fafafa] placeholder-zinc-600 transition"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-[#71717a] uppercase tracking-wider font-mono">
                          Feynman Scope (What are you teaching?)
                        </label>
                        <textarea
                          rows={4}
                          value={newVidScope}
                          onChange={(e) => setNewVidScope(e.target.value)}
                          placeholder="Explain how secondary nodes replicate, read-after-write consistency, split-brain scenarios, and how rafting prevents it."
                          className="w-full bg-[#09090b] border border-[#27272a] focus:border-blue-500 focus:outline-none rounded px-3 py-1.5 text-xs text-[#fafafa] placeholder-zinc-600 transition resize-none font-sans"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-[#71717a] uppercase tracking-wider font-mono">
                          Private Notes / Code Snippets (Optional)
                        </label>
                        <input
                          type="text"
                          value={newVidNotes}
                          onChange={(e) => setNewVidNotes(e.target.value)}
                          placeholder="Include diagram links or key analogies to use..."
                          className="w-full bg-[#09090b] border border-[#27272a] focus:border-blue-500 focus:outline-none rounded px-3 py-1.5 text-xs text-[#fafafa] placeholder-zinc-600 transition"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold uppercase tracking-wider py-2 rounded transition cursor-pointer"
                      >
                        Publish Video Entry
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Study Resources Section */}
                  <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
                    <h4 className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider font-mono">
                      Sourced Research Materials
                    </h4>
                    <button
                      onClick={() => setShowAddResourceForm(!showAddResourceForm)}
                      className="px-3 py-1 bg-zinc-900 border border-[#27272a] text-xs font-mono text-[#a1a1aa] hover:text-[#fafafa] rounded flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                      {showAddResourceForm ? 'Cancel' : 'Link Material'}
                    </button>
                  </div>

                  {/* Add Resource Inline Form */}
                  {showAddResourceForm && (
                    <form
                      onSubmit={handleCreateResource}
                      className="p-5 rounded border border-[#27272a] bg-[#1c1c21] grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                      <div className="space-y-1">
                        <label className="block text-[9px] font-mono font-bold text-[#71717a] uppercase tracking-wider">
                          Resource Title
                        </label>
                        <input
                          type="text"
                          required
                          value={newResTitle}
                          onChange={(e) => setNewResTitle(e.target.value)}
                          placeholder="Designing Data-Intensive Applications"
                          className="w-full bg-[#09090b] border border-[#27272a] focus:border-blue-500 focus:outline-none rounded px-3 py-1.5 text-xs text-[#fafafa] placeholder-zinc-600 transition"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-mono font-bold text-[#71717a] uppercase tracking-wider">
                          Creator / Author
                        </label>
                        <input
                          type="text"
                          required
                          value={newResCreator}
                          onChange={(e) => setNewResCreator(e.target.value)}
                          placeholder="Martin Kleppmann"
                          className="w-full bg-[#09090b] border border-[#27272a] focus:border-blue-500 focus:outline-none rounded px-3 py-1.5 text-xs text-[#fafafa] placeholder-zinc-600 transition"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-mono font-bold text-[#71717a] uppercase tracking-wider">
                          Resource Type
                        </label>
                        <select
                          value={newResType}
                          onChange={(e) => setNewResType(e.target.value as any)}
                          className="w-full bg-[#09090b] border border-[#27272a] focus:border-blue-500 focus:outline-none rounded px-3 py-1.5 text-xs text-[#fafafa] transition"
                        >
                          <option value="Book">Book</option>
                          <option value="Course/Playlist">Course/Playlist</option>
                          <option value="Documentation">Documentation</option>
                          <option value="Article/Paper">Article/Paper</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-mono font-bold text-[#71717a] uppercase tracking-wider">
                          Total Units (Count)
                        </label>
                        <input
                          type="number"
                          min={1}
                          required
                          value={newResTotalUnits}
                          onChange={(e) => setNewResTotalUnits(parseInt(e.target.value) || 1)}
                          className="w-full bg-[#09090b] border border-[#27272a] focus:border-blue-500 focus:outline-none rounded px-3 py-1.5 text-xs text-[#fafafa] transition"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-mono font-bold text-[#71717a] uppercase tracking-wider">
                          Unit Label (e.g., chapters)
                        </label>
                        <input
                          type="text"
                          value={newResUnitLabel}
                          onChange={(e) => setNewResUnitLabel(e.target.value)}
                          placeholder="chapters"
                          className="w-full bg-[#09090b] border border-[#27272a] focus:border-blue-500 focus:outline-none rounded px-3 py-1.5 text-xs text-[#fafafa] transition"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-mono font-bold text-[#71717a] uppercase tracking-wider">
                          Reference URL (Optional)
                        </label>
                        <input
                          type="url"
                          value={newResUrl}
                          onChange={(e) => setNewResUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full bg-[#09090b] border border-[#27272a] focus:border-blue-500 focus:outline-none rounded px-3 py-1.5 text-xs text-[#fafafa] transition"
                        />
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <label className="block text-[9px] font-mono font-bold text-[#71717a] uppercase tracking-wider">
                          Concept Goals / Study Target Notes
                        </label>
                        <input
                          type="text"
                          value={newResNotes}
                          onChange={(e) => setNewResNotes(e.target.value)}
                          placeholder="Study chapters on replication and partition strategy..."
                          className="w-full bg-[#09090b] border border-[#27272a] focus:border-blue-500 focus:outline-none rounded px-3 py-1.5 text-xs text-[#fafafa] transition"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-mono font-bold text-[#71717a] uppercase tracking-wider">
                          Priority
                        </label>
                        <select
                          value={newResPriority}
                          onChange={(e) => setNewResPriority(e.target.value as any)}
                          className="w-full bg-[#09090b] border border-[#27272a] focus:border-blue-500 focus:outline-none rounded px-3 py-1.5 text-xs text-[#fafafa] transition"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>
                      </div>

                      <div className="md:col-span-3 flex justify-end gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => setShowAddResourceForm(false)}
                          className="px-4 py-1.5 border border-zinc-700 hover:bg-zinc-800 rounded font-mono text-[10px] uppercase text-[#a1a1aa] transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-mono text-[10px] uppercase font-bold transition cursor-pointer"
                        >
                          Add Material Source
                        </button>
                      </div>
                    </form>
                  )}

                  {/* List of active playlist resources */}
                  {activePlaylist.resources.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-[#27272a] rounded text-zinc-500 font-mono text-xs">
                      No materials linked to this Feynman pipeline. Add study references above to build videos from.
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-[#27272a] rounded">
                      <table className="w-full text-left font-mono text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#18181b] border-b border-[#27272a] text-[#71717a] uppercase text-[9px] tracking-wider">
                            <th className="p-3">Title / Creator</th>
                            <th className="p-3">Type</th>
                            <th className="p-3">Progress</th>
                            <th className="p-3">Priority</th>
                            <th className="p-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#27272a] bg-[#09090b]/40">
                          {activePlaylist.resources.map((res) => {
                            const percent = Math.round((res.completedUnits / res.totalUnits) * 100);
                            return (
                              <tr key={res.id} className="hover:bg-[#18181b]/30 transition">
                                <td className="p-3">
                                  <div className="font-bold text-[#fafafa] font-sans text-xs">
                                    {res.title}
                                  </div>
                                  <div className="text-[#71717a] text-[10px] mt-0.5">
                                    by {res.creator}
                                  </div>
                                  {res.notes && (
                                    <div className="text-[#a1a1aa] text-[10px] font-sans mt-1">
                                      {res.notes}
                                    </div>
                                  )}
                                </td>
                                <td className="p-3">
                                  <span className="px-1.5 py-0.5 rounded border border-[#27272a] bg-[#18181b] text-[10px] text-[#a1a1aa]">
                                    {res.type}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <div className="space-y-1.5 w-32">
                                    <div className="flex justify-between text-[10px]">
                                      <span className="text-[#fafafa]">
                                        {res.completedUnits}/{res.totalUnits} {res.unitLabel}
                                      </span>
                                      <span className="text-[#71717a]">{percent}%</span>
                                    </div>
                                    <div className="h-1 bg-zinc-800 rounded-full overflow-hidden flex">
                                      <div
                                        className="h-full bg-blue-500"
                                        style={{ width: `${percent}%` }}
                                      />
                                    </div>
                                    <div className="flex gap-1">
                                      <button
                                        disabled={res.completedUnits === 0}
                                        onClick={() =>
                                          onUpdateResource(activePlaylist.id, res.id, {
                                            completedUnits: res.completedUnits - 1
                                          })
                                        }
                                        className="text-[9px] bg-zinc-900 border border-[#27272a] px-1 rounded text-[#71717a] hover:text-[#fafafa] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                                      >
                                        -
                                      </button>
                                      <button
                                        disabled={res.completedUnits >= res.totalUnits}
                                        onClick={() =>
                                          onUpdateResource(activePlaylist.id, res.id, {
                                            completedUnits: res.completedUnits + 1
                                          })
                                        }
                                        className="text-[9px] bg-zinc-900 border border-[#27272a] px-1 rounded text-[#71717a] hover:text-[#fafafa] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3">
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold ${
                                      res.priority === 'High'
                                        ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                                        : res.priority === 'Medium'
                                        ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'
                                        : 'bg-zinc-800 border border-zinc-700 text-zinc-400'
                                    }`}
                                  >
                                    {res.priority}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <div className="flex gap-2">
                                    {res.url && (
                                      <a
                                        href={res.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1 border border-[#27272a] bg-[#18181b] rounded text-[#71717a] hover:text-[#fafafa] transition"
                                        title="Open Link"
                                      >
                                        <ExternalLink className="h-3 w-3" />
                                      </a>
                                    )}
                                    <button
                                      onClick={() => onDeleteResource(activePlaylist.id, res.id)}
                                      className="p-1 border border-[#27272a] hover:bg-red-500/5 hover:border-red-900/30 rounded text-[#71717a] hover:text-red-400 transition cursor-pointer"
                                      title="Remove"
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
            </div>
          </div>
        ) : (
          /* No Active Playlist: Create form */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Explanatory Slate */}
            <div className="lg:col-span-2 bg-[#18181b] border border-[#27272a] rounded p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="p-3 bg-blue-500/10 border border-blue-500/25 rounded w-fit">
                  <PlayCircle className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-base font-bold text-[#fafafa] font-display">No Active Feynman Playlist</h3>
                <p className="text-xs text-[#a1a1aa] leading-relaxed">
                  You are currently not tracking any active video preparation course. The best way to lock in complex tech stack architectures is to commit to a 10-part series explaining those mechanics to beginners.
                </p>
                <div className="space-y-2.5">
                  <h4 className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider font-mono">
                    Why the 10-video commitment?
                  </h4>
                  <ul className="space-y-1.5 text-xs text-[#a1a1aa] list-disc list-inside">
                    <li><strong className="text-blue-400">Zero-abstraction explanations:</strong> Explaining locks, transaction isolations, or consensus states without hand-waving.</li>
                    <li><strong className="text-blue-400">Eliminate false mastery:</strong> You think you know it until you try to speak about it logically for 10 minutes straight.</li>
                    <li><strong className="text-blue-400">Structural Grit:</strong> Forcing yourself to finish the 10 videos cures tech-hopping ADHD.</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-[#09090b]/40 border border-[#27272a] rounded font-mono text-[10px] text-zinc-500">
                STATUS: PIPELINE_IDLE // Awaiting developer input.
              </div>
            </div>

            {/* Create Playlist Form */}
            <div className="bg-[#18181b] border border-[#27272a] rounded p-6 space-y-4 h-fit">
              <div className="border-b border-[#27272a] pb-3">
                <h3 className="text-xs font-bold text-[#fafafa] uppercase tracking-wider font-mono">
                  Start New Feynman Playlist
                </h3>
              </div>

              <form onSubmit={handleCreatePlaylist} className="space-y-4">
                {playlistFormError && (
                  <div className="p-2.5 rounded bg-red-950/20 border border-red-900/30 text-red-400 font-mono text-[10px]">
                    {playlistFormError}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-[#71717a] uppercase tracking-wider font-mono">
                    Playlist Title
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. System Design consensus crashcourse"
                    className="w-full bg-[#09090b] border border-[#27272a] focus:border-blue-500 focus:outline-none rounded px-3 py-1.5 text-xs text-[#fafafa] placeholder-zinc-600 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-[#71717a] uppercase tracking-wider font-mono">
                    Subject / Topic Area
                  </label>
                  <input
                    type="text"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    placeholder="e.g. Distributed Databases"
                    className="w-full bg-[#09090b] border border-[#27272a] focus:border-blue-500 focus:outline-none rounded px-3 py-1.5 text-xs text-[#fafafa] placeholder-zinc-600 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-[#71717a] uppercase tracking-wider font-mono">
                    Playlist Goal & Description
                  </label>
                  <textarea
                    rows={4}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Provide a clear description of who you are explaining this to and what topics will be dismantled..."
                    className="w-full bg-[#09090b] border border-[#27272a] focus:border-blue-500 focus:outline-none rounded px-3 py-1.5 text-xs text-[#fafafa] placeholder-zinc-600 transition resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold uppercase tracking-wider py-2 rounded transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <PlayCircle className="h-3.5 w-3.5" />
                  Initiate Feynman Playlist
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Historical / Inactive Playlists */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-[#52525b] uppercase tracking-widest font-mono">
          Completed & Archived Pipelines
        </h2>

        {inactivePlaylists.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-[#27272a] rounded text-zinc-500 font-mono text-xs">
            No historical playlists archived yet. Complete 10 videos in your active playlist to archive it here.
          </div>
        ) : (
          <div className="space-y-3">
            {inactivePlaylists.map((playlist) => {
              const isExpanded = !!expandedArchiveIds[playlist.id];
              return (
                <div
                  key={playlist.id}
                  className="bg-[#18181b] border border-[#27272a] rounded overflow-hidden"
                >
                  <button
                    onClick={() => toggleArchiveExpanded(playlist.id)}
                    className="w-full p-4 text-left hover:bg-[#1c1c21]/60 transition flex justify-between items-center gap-4 cursor-pointer"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 text-zinc-400 font-mono text-[9px] rounded uppercase font-bold tracking-wider">
                          Archived
                        </span>
                        <span className="text-xs text-[#a1a1aa] font-mono">
                          Topic: {playlist.topic}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[#fafafa]">{playlist.title}</h4>
                    </div>

                    <div className="flex items-center gap-4 font-mono text-[10px] text-[#71717a]">
                      <span>{playlist.videos.length} Videos Made</span>
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-4 border-t border-[#27272a] bg-[#09090b]/40 space-y-4">
                      <div className="text-xs text-[#a1a1aa] leading-relaxed">
                        <p className="font-semibold text-zinc-400 font-mono text-[10px] uppercase tracking-wider mb-1">Description:</p>
                        {playlist.description}
                      </div>

                      {playlist.resources.length > 0 && (
                        <div className="space-y-1">
                          <p className="font-semibold text-zinc-400 font-mono text-[10px] uppercase tracking-wider">Resources Studied:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {playlist.resources.map((res) => (
                              <span
                                key={res.id}
                                className="px-2 py-0.5 rounded bg-zinc-900 border border-[#27272a] text-[10px] text-[#a1a1aa]"
                              >
                                {res.title} (by {res.creator})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <p className="font-semibold text-zinc-400 font-mono text-[10px] uppercase tracking-wider">Videos Published:</p>
                        <div className="space-y-2">
                          {playlist.videos.map((vid, idx) => (
                            <div
                              key={vid.id}
                              className="p-3 bg-[#18181b] border border-[#27272a] rounded flex gap-2 text-xs"
                            >
                              <span className="text-[#71717a] font-mono">#{idx+1}</span>
                              <div className="space-y-0.5">
                                <h5 className="font-bold text-[#fafafa]">{vid.title}</h5>
                                <p className="text-[#a1a1aa]">{vid.scope}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => {
                            if (confirm('Are you absolutely sure you want to delete this archived playlist permanently?')) {
                              onDeletePlaylist(playlist.id);
                            }
                          }}
                          className="flex items-center gap-1 text-[10px] text-[#71717a] hover:text-red-400 font-mono transition cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete History Entry
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
