/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { useAppState } from './hooks/useAppState';
import { Sidebar, SidebarTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { TopicsView } from './components/TopicsView';
import { ProjectsView } from './components/ProjectsView';
import { SpecializationsView } from './components/SpecializationsView';
import { JobPrepView } from './components/JobPrepView';
import { YouTubeView } from './components/YouTubeView';
import { PassiveLearningView } from './components/PassiveLearningView';
import { ConfirmModal } from './components/ConfirmModal';
import { AccountModal } from './components/AccountModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Hammer, Menu, X, Cloud } from 'lucide-react';

function AppInner() {
  const {
    state,
    replaceState,
    setSelectedTopicId,
    setSelectedSpecializationId,
    // Topics
    addTopic,
    updateTopic,
    deleteTopic,
    // Resources
    addResourceToTopic,
    updateResourceInTopic,
    deleteResourceFromTopic,
    setResourceAsFocus,
    // Logs
    addStudyLogAndProgress,
    deleteStudyLog,
    // Projects
    addProject,
    updateProject,
    deleteProject,
    // Specializations
    addSpecialization,
    updateSpecialization,
    deleteSpecialization,
    addResourceToSpecialization,
    updateResourceInSpecialization,
    deleteResourceFromSpecialization,
    // Job Prep
    addJobIntroduction,
    updateJobIntroduction,
    deleteJobIntroduction,
    addInterviewJournal,
    updateInterviewJournal,
    deleteInterviewJournal,
    addResumeSavvy,
    updateResumeSavvy,
    deleteResumeSavvy,
    addDsaResource,
    updateDsaResource,
    deleteDsaResource,
    setDsaResourceAsFocus,
    addSystemDesignNote,
    updateSystemDesignNote,
    deleteSystemDesignNote,
    addScopeKnowledge,
    updateScopeKnowledge,
    deleteScopeKnowledge,
    // YouTube
    addYouTubePlaylist,
    updateYouTubePlaylist,
    deleteYouTubePlaylist,
    deactivateYouTubePlaylist,
    addVideoToYouTubePlaylist,
    updateVideoInYouTubePlaylist,
    deleteVideoFromYouTubePlaylist,
    addResourceToYouTubePlaylist,
    updateResourceInYouTubePlaylist,
    deleteResourceFromYouTubePlaylist,
    // Passive Learning
    addPassiveLearningItem,
    updatePassiveLearningItem,
    deletePassiveLearningItem,
    togglePassiveLearningRotation,
    incrementPassiveLearningProgress,
    advancePassiveRotation,
    clearSampleData,
    resetAllData,
  } = useAppState();

  const { currentUser, cloudState, syncStateToCloud, syncStatus } = useAuth();
  const [activeTab, setActiveTab] = useState<SidebarTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);

  const syncedUserUidRef = useRef<string | null>(null);
  const lastSyncedCloudStateRef = useRef<string>('');

  // Sync cloud data to local state on initial login or when cloudState changes
  useEffect(() => {
    if (currentUser) {
      if (cloudState) {
        const cloudStr = JSON.stringify(cloudState);
        if (syncedUserUidRef.current !== currentUser.uid) {
          syncedUserUidRef.current = currentUser.uid;
          lastSyncedCloudStateRef.current = cloudStr;
          replaceState(cloudState);
        } else if (lastSyncedCloudStateRef.current !== cloudStr) {
          lastSyncedCloudStateRef.current = cloudStr;
          if (JSON.stringify(state) !== cloudStr) {
            replaceState(cloudState);
          }
        }
      }
    } else {
      syncedUserUidRef.current = null;
      lastSyncedCloudStateRef.current = '';
    }
  }, [cloudState, currentUser, replaceState, state]);

  // Debounced sync of local state edits to cloud
  useEffect(() => {
    if (!currentUser) return;
    const timer = setTimeout(() => {
      const currentStr = JSON.stringify(state);
      if (currentStr !== lastSyncedCloudStateRef.current) {
        lastSyncedCloudStateRef.current = currentStr;
        syncStateToCloud(state);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [state, currentUser, syncStateToCloud]);

  const handleResetAllData = () => {
    setShowResetConfirm(true);
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            topics={state.topics}
            specializations={state.specializations}
            studyLogs={state.studyLogs}
            onAddStudyLog={addStudyLogAndProgress}
            onDeleteLog={deleteStudyLog}
            passiveLearningItems={state.passiveLearningItems || []}
            passiveRotationIndex={state.passiveRotationIndex || 0}
            onIncrementPassiveProgress={incrementPassiveLearningProgress}
            onAdvancePassiveRotation={advancePassiveRotation}
          />
        );
      case 'passiveLearning':
        return (
          <PassiveLearningView
            items={state.passiveLearningItems || []}
            rotationIndex={state.passiveRotationIndex || 0}
            onAddItem={addPassiveLearningItem}
            onUpdateItem={updatePassiveLearningItem}
            onDeleteItem={deletePassiveLearningItem}
            onToggleRotation={togglePassiveLearningRotation}
            onIncrementProgress={incrementPassiveLearningProgress}
            onAdvanceRotation={advancePassiveRotation}
          />
        );
      case 'topics':
        return (
          <TopicsView
            topics={state.topics}
            selectedTopicId={state.selectedTopicId}
            onSelectTopic={setSelectedTopicId}
            onAddTopic={addTopic}
            onUpdateTopic={updateTopic}
            onDeleteTopic={deleteTopic}
            onAddResource={addResourceToTopic}
            onUpdateResource={updateResourceInTopic}
            onDeleteResource={deleteResourceFromTopic}
          />
        );
      case 'projects':
        return (
          <ProjectsView
            projects={state.projects}
            onAddProject={addProject}
            onUpdateProject={updateProject}
            onDeleteProject={deleteProject}
          />
        );
      case 'specializations':
        return (
          <SpecializationsView
            specializations={state.specializations}
            selectedSpecializationId={state.selectedSpecializationId}
            onSelectSpecialization={setSelectedSpecializationId}
            onAddSpecialization={addSpecialization}
            onUpdateSpecialization={updateSpecialization}
            onDeleteSpecialization={deleteSpecialization}
            onAddResource={addResourceToSpecialization}
            onUpdateResource={updateResourceInSpecialization}
            onDeleteResource={deleteResourceFromSpecialization}
          />
        );
      case 'jobPrep':
        return (
          <JobPrepView
            jobIntroductions={state.jobIntroductions}
            interviewJournal={state.interviewJournal}
            resumeSavvy={state.resumeSavvy}
            dsaResources={state.dsaResources}
            systemDesignNotes={state.systemDesignNotes}
            scopeKnowledge={state.scopeKnowledge}

            onAddJobIntroduction={addJobIntroduction}
            onUpdateJobIntroduction={updateJobIntroduction}
            onDeleteJobIntroduction={deleteJobIntroduction}

            onAddInterviewJournal={addInterviewJournal}
            onUpdateInterviewJournal={updateInterviewJournal}
            onDeleteInterviewJournal={deleteInterviewJournal}

            onAddResumeSavvy={addResumeSavvy}
            onUpdateResumeSavvy={updateResumeSavvy}
            onDeleteResumeSavvy={deleteResumeSavvy}

            onAddDsaResource={addDsaResource}
            onUpdateDsaResource={updateDsaResource}
            onDeleteDsaResource={deleteDsaResource}
            onSetDsaResourceAsFocus={setDsaResourceAsFocus}

            onAddSystemDesignNote={addSystemDesignNote}
            onUpdateSystemDesignNote={updateSystemDesignNote}
            onDeleteSystemDesignNote={deleteSystemDesignNote}

            onAddScopeKnowledge={addScopeKnowledge}
            onUpdateScopeKnowledge={updateScopeKnowledge}
            onDeleteScopeKnowledge={deleteScopeKnowledge}
          />
        );
      case 'youtube':
        return (
          <YouTubeView
            playlists={state.youtubePlaylists}
            onAddPlaylist={addYouTubePlaylist}
            onUpdatePlaylist={updateYouTubePlaylist}
            onDeletePlaylist={deleteYouTubePlaylist}
            onDeactivatePlaylist={deactivateYouTubePlaylist}
            onAddVideo={addVideoToYouTubePlaylist}
            onUpdateVideo={updateVideoInYouTubePlaylist}
            onDeleteVideo={deleteVideoFromYouTubePlaylist}
            onAddResource={addResourceToYouTubePlaylist}
            onUpdateResource={updateResourceInYouTubePlaylist}
            onDeleteResource={deleteResourceFromYouTubePlaylist}
          />
        );
      default:
        return (
          <div className="text-center py-20 text-zinc-500 font-mono text-xs">
            Select a learning module in the navigation menu.
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#09090b] font-sans text-zinc-100 animate-fadeIn" id="master-app-root">
      
      {/* Responsive Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-[#18181b] border-b border-[#27272a] shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-500/10 border border-blue-500/20 rounded">
            <Hammer className="h-4.5 w-4.5 text-blue-500" />
          </div>
          <span className="font-display font-black text-xs uppercase tracking-widest text-[#fafafa]">
            Craftsman Hub
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAccountModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#09090b] border border-[#27272a] hover:border-blue-500 rounded text-xs font-mono transition cursor-pointer"
          >
            <Cloud className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-[10px] hidden sm:inline">
              {currentUser ? 'Account' : 'Cloud Sync'}
            </span>
            <span className={`w-1.5 h-1.5 rounded-full ${currentUser ? 'bg-green-400' : 'bg-amber-400'}`} />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] rounded text-[#a1a1aa] cursor-pointer"
            id="btn-mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden flex"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-72 bg-[#18181b] border-r border-[#27272a] flex flex-col justify-between h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar
              activeTab={activeTab}
              onTabChange={(tab) => {
                setActiveTab(tab);
                setMobileMenuOpen(false);
              }}
              onResetAllData={handleResetAllData}
              onClearSampleData={clearSampleData}
              onOpenAccountModal={() => {
                setMobileMenuOpen(false);
                setAccountModalOpen(true);
              }}
            />
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onResetAllData={handleResetAllData}
          onClearSampleData={clearSampleData}
          onOpenAccountModal={() => setAccountModalOpen(true)}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full flex flex-col" id="main-content-scroll">
        {/* Desktop Header Top Bar for Sync & Account */}
        <div className="hidden lg:flex items-center justify-between pb-4 mb-4 border-b border-[#27272a]">
          <div className="flex items-center gap-2 font-mono text-xs text-[#a1a1aa]">
            <span className="text-blue-500 font-bold uppercase tracking-wider">Workspace:</span>
            <span>Software Engineer Craftsman Hub</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setAccountModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] hover:border-blue-500/60 rounded text-xs text-white transition cursor-pointer font-mono"
            >
              <Cloud className="h-3.5 w-3.5 text-blue-400" />
              <span>
                {currentUser ? (currentUser.displayName || (currentUser.isAnonymous ? 'Guest Craftsman' : 'User Account')) : 'Sign In / Multi-Device Sync'}
              </span>
              <span
                className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                  currentUser
                    ? syncStatus === 'synced'
                      ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/30 animate-pulse'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}
              >
                {currentUser ? (syncStatus === 'synced' ? 'Synced' : 'Syncing...') : 'Offline Local'}
              </span>
            </button>
          </div>
        </div>

        <div className="flex-1">
          {renderActiveView()}
        </div>
      </main>

      <AccountModal
        isOpen={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
        currentState={state}
      />

      <ConfirmModal
        isOpen={showResetConfirm}
        title="Wipe All Databases?"
        message="This will permanently delete all your tracked subjects, custom resource spreadsheets, reconstruct projects, core specializations, and study logs. This action is irreversible."
        confirmText="Yes, Wipe All Data"
        cancelText="Cancel"
        onConfirm={() => {
          setShowResetConfirm(false);
          resetAllData();
        }}
        onCancel={() => setShowResetConfirm(false)}
        variant="danger"
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
