import React, { useState, useEffect } from 'react';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import InspectorPanel from './components/InspectorPanel';
import UploadModal from './components/UploadModal';
import WizardModal from './components/WizardModal';
import SearchResults from './components/SearchResults';
import DocumentLibrary from './components/DocumentLibrary';

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [activeNav, setActiveNav] = useState('documents'); // Active navigation default set to Documents
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

  return (
    <div className="min-h-screen h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-200">
      {/* Top Header Bar */}
      <TopBar 
        darkMode={darkMode} 
        setDarkMode={setDarkMode}
        searchQuery={searchQuery}
        setSearchQuery={(q) => {
          setSearchQuery(q);
          if (q.trim()) setActiveNav('search');
        }}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onOpenWizard={() => setIsWizardModalOpen(true)}
      />

      {/* Main Workspace Container */}
      <div className="flex-1 flex flex-row overflow-hidden w-full relative">
        {/* Left Navigation Sidebar (~220px) */}
        <Sidebar 
          activeNav={activeNav} 
          setActiveNav={(id) => {
            setActiveNav(id);
            if (id === 'field') setIsWizardModalOpen(true);
          }} 
        />

        {/* Dynamic Page Views */}
        {activeNav === 'documents' ? (
          <DocumentLibrary 
            onOpenUpload={() => setIsUploadModalOpen(true)}
          />
        ) : activeNav === 'search' || activeNav === 'knowledge' ? (
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
