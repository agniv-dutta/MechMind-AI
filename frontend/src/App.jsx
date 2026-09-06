import React, { useState, useEffect } from 'react';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import InspectorPanel from './components/InspectorPanel';
import UploadModal from './components/UploadModal';
import WizardModal from './components/WizardModal';
import SearchResults from './components/SearchResults';
import DocumentLibrary from './components/DocumentLibrary';
import DocumentDetails from './components/DocumentDetails';
import KnowledgeGraph from './components/KnowledgeGraph';
import AdvancedSearch from './components/AdvancedSearch';
import GeneralSettings from './components/GeneralSettings';
import AIConfiguration from './components/AIConfiguration';
import SearchSettings from './components/SearchSettings';
import DataPrivacy from './components/DataPrivacy';
import HelpDocumentation from './components/HelpDocumentation';

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [activeNav, setActiveNav] = useState('search_settings'); // Default active view set to Search Settings
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isWizardModalOpen, setIsWizardModalOpen] = useState(false);

  // Handle Dark mode toggle class on document.documentElement
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleNavigateSettings = (settingsId) => {
    setActiveNav(settingsId);
  };

  return (
    <div className="min-h-screen h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-200">
      {/* Top Header Bar */}
      <TopBar 
        darkMode={darkMode} 
        setDarkMode={setDarkMode}
        searchQuery={searchQuery}
        setSearchQuery={(q) => {
          setSearchQuery(q);
          if (q.trim()) setActiveNav('adv_search');
        }}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onOpenWizard={() => setIsWizardModalOpen(true)}
      />

      {/* Main Workspace Container */}
      <div className="flex-1 flex flex-row overflow-hidden w-full relative">
        {/* Left Navigation Sidebar (~220px) */}
        <Sidebar 
          activeNav={activeNav === 'doc_details' ? 'documents' : activeNav === 'adv_search' ? 'search' : activeNav === 'ai' || activeNav === 'search_settings' || activeNav === 'data' || activeNav === 'settings' ? 'settings' : activeNav} 
          setActiveNav={(id) => {
            if (id === 'search') setActiveNav('adv_search');
            else setActiveNav(id);
            if (id === 'field') setIsWizardModalOpen(true);
          }} 
        />

        {/* Dynamic Page Views */}
        {activeNav === 'help' ? (
          <HelpDocumentation
            onBackToDashboard={() => setActiveNav('chat')}
          />
        ) : activeNav === 'data' ? (
          <DataPrivacy
            onBackToDashboard={() => setActiveNav('chat')}
            onNavigateSettings={handleNavigateSettings}
          />
        ) : activeNav === 'search_settings' ? (
          <SearchSettings 
            onBackToDashboard={() => setActiveNav('chat')}
            onNavigateSettings={handleNavigateSettings}
          />
        ) : activeNav === 'ai' ? (
          <AIConfiguration 
            onBackToDashboard={() => setActiveNav('chat')}
            onNavigateSettings={handleNavigateSettings}
          />
        ) : activeNav === 'settings' ? (
          <GeneralSettings 
            onBackToDashboard={() => setActiveNav('chat')}
            onNavigateSettings={handleNavigateSettings}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />
        ) : activeNav === 'adv_search' ? (
          <AdvancedSearch 
            onUseInChat={() => setActiveNav('chat')}
            onViewDoc={() => setActiveNav('doc_details')}
          />
        ) : activeNav === 'knowledge' ? (
          <KnowledgeGraph />
        ) : activeNav === 'doc_details' ? (
          <DocumentDetails 
            onBack={() => setActiveNav('documents')}
          />
        ) : activeNav === 'documents' ? (
          <DocumentLibrary 
            onOpenUpload={() => setIsUploadModalOpen(true)}
            onSelectDocument={() => setActiveNav('doc_details')}
          />
        ) : activeNav === 'search' ? (
          <SearchResults 
            onUseInChat={() => setActiveNav('chat')}
          />
        ) : (
          <>
            {/* Central Chat Area (Flex-1) */}
            <ChatArea />

            {/* Right Context/Sources Inspector (~340px) */}
            <InspectorPanel />
          </>
        )}
      </div>

      {/* Upload Technical Documentation Modal Overlay */}
      <UploadModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />

      {/* Quick Troubleshooting Wizard Modal Overlay */}
      <WizardModal
        isOpen={isWizardModalOpen}
        onClose={() => setIsWizardModalOpen(false)}
      />
    </div>
  );
}
