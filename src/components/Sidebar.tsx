/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Compass,
  Code,
  Cpu,
  RotateCcw,
  Hammer,
  LayoutDashboard,
  Briefcase,
  Youtube,
  Cloud,
  User,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type SidebarTab =
  | 'dashboard'
  | 'topics'
  | 'projects'
  | 'specializations'
  | 'jobPrep'
  | 'youtube'
  | 'passiveLearning';

interface SidebarProps {
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  onResetAllData: () => void;
  onClearSampleData: () => void;
  onOpenAccountModal?: () => void;
}

export function Sidebar({
  activeTab,
  onTabChange,
  onResetAllData,
  onClearSampleData,
  onOpenAccountModal,
}: SidebarProps) {
  const { currentUser, syncStatus } = useAuth();

  const menuItems = [
    {
      id: 'dashboard' as SidebarTab,
      label: 'Intelligent Dashboard',
      icon: LayoutDashboard,
      description: 'Master study logs & active focus feed',
    },
    {
      id: 'passiveLearning' as SidebarTab,
      label: 'Passive Learning',
      icon: BookOpen,
      description: 'Leisure rotation & smart recommendation',
    },
    {
      id: 'topics' as SidebarTab,
      label: 'Subjects & Topics',
      icon: Compass,
      description: 'Excel sheets & learning dynamic lists',
    },
    {
      id: 'projects' as SidebarTab,
      label: 'Reconstruction Projects',
      icon: Code,
      description: 'Systemic deep-lowerings',
    },
    {
      id: 'specializations' as SidebarTab,
      label: 'Core Specializations',
      icon: Cpu,
      description: 'Domain-expertise trackers',
    },
    {
      id: 'jobPrep' as SidebarTab,
      label: 'Job Prep Workspace',
      icon: Briefcase,
      description: 'Systemic interview readiness',
    },
    {
      id: 'youtube' as SidebarTab,
      label: 'Feynman YouTube',
      icon: Youtube,
      description: 'Deep-learning video pipelines',
    },
  ];

  return (
    <aside
      className="w-full lg:w-64 bg-[#18181b] border-b lg:border-b-0 lg:border-r border-[#27272a] flex flex-col justify-between"
      id="app-sidebar"
    >
      <div className="p-5 space-y-6">
        {/* Logo Header */}
        <div className="flex items-center gap-2.5 pb-4 border-b border-[#27272a]">
          <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded">
            <Hammer className="h-4 w-4 text-blue-500 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xs font-bold tracking-[0.2em] text-[#a1a1aa] uppercase italic">
              CRAFTSMAN HUB
            </h1>
            <span className="text-[9px] text-[#71717a] font-mono tracking-wider block mt-0.5">
              v2.0.0 // INTELLIGENT
            </span>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="space-y-4" id="sidebar-nav">
          {/* Core Navigation Group */}
          <div>
            <p className="px-3 text-[9px] font-bold text-[#52525b] uppercase tracking-widest mb-2">
              Navigation
            </p>
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`w-full text-left px-3 py-2 rounded flex items-center gap-3 transition-colors text-xs border ${
                      isActive
                        ? 'bg-[#27272a] border-[#3f3f46] text-[#fafafa] font-bold'
                        : 'bg-transparent border-transparent hover:bg-[#1f1f23] text-[#a1a1aa] hover:text-[#fafafa]'
                    }`}
                    id={`sidebar-tab-${item.id}`}
                  >
                    <Icon
                      className={`h-3.5 w-3.5 shrink-0 ${
                        isActive ? 'text-blue-500' : 'text-[#71717a]'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="block truncate">
                        {item.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      </div>

      {/* Sidebar Footer Operations */}
      <div className="p-4 border-t border-[#27272a] bg-[#09090b]/50 space-y-3">
        {/* Account & Multi-Device Sync Card */}
        <button
          onClick={onOpenAccountModal}
          className="w-full text-left p-2.5 rounded border border-[#27272a] hover:border-blue-500/50 bg-[#09090b]/80 hover:bg-[#18181b] transition flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded ${currentUser ? 'bg-blue-500/10 text-blue-400' : 'bg-zinc-800 text-zinc-400'}`}>
              <Cloud className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="block text-[11px] font-bold text-white group-hover:text-blue-300 transition">
                {currentUser ? (currentUser.displayName || (currentUser.isAnonymous ? 'Guest Craftsman' : 'Cloud Account')) : 'Sync & Cloud Account'}
              </span>
              <span className="block text-[9px] font-mono text-[#71717a]">
                {currentUser ? (syncStatus === 'synced' ? '● Multi-device synced' : '● Syncing...') : 'Click to enable cloud sync'}
              </span>
            </div>
          </div>
          <span className={`w-2 h-2 rounded-full ${currentUser ? (syncStatus === 'synced' ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-blue-400 animate-ping') : 'bg-amber-400'}`} />
        </button>

        {/* Micro-Telemetry */}
        <div className="p-2.5 rounded border border-[#27272a] bg-[#09090b]/40 font-mono text-[9px] text-[#71717a] space-y-1">
          <div className="flex justify-between">
            <span>STORAGE TYPE:</span>
            <span className="text-blue-500">{currentUser ? 'FIRESTORE CLOUD' : 'LOCAL CACHE'}</span>
          </div>
          <div className="flex justify-between">
            <span>SYNC ENGINE:</span>
            <span className="text-[#a1a1aa]">{currentUser ? 'REALTIME DB' : 'OFFLINE MODE'}</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 pt-1">
          <button
            onClick={onClearSampleData}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#09090b] hover:bg-amber-950/20 hover:border-amber-900/30 text-amber-400 font-mono text-[9px] font-bold uppercase rounded border border-[#27272a] transition cursor-pointer"
            id="btn-clear-sample-data"
            title="Remove initial starter templates while keeping your custom items"
          >
            <RotateCcw className="h-2.5 w-2.5" />
            Clear Sample / Dummy Data
          </button>

          <button
            onClick={onResetAllData}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#09090b] hover:bg-red-950/20 hover:border-red-900/30 text-[#71717a] hover:text-red-400 font-mono text-[9px] font-bold uppercase rounded border border-[#27272a] transition cursor-pointer"
            id="btn-clear-cache"
          >
            <RotateCcw className="h-2.5 w-2.5" />
            Reset All Data (Wipe Clean)
          </button>
        </div>
      </div>
    </aside>
  );
}
