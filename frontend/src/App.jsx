import React, { useState, useEffect, useRef } from 'react';
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
  const [activeNav, setActiveNav] = useState('chat');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isWizardModalOpen, setIsWizardModalOpen] = useState(false);
  const [chatSources, setChatSources] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeCitation, setActiveCitation] = useState(null);
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [libraryRefreshKey, setLibraryRefreshKey] = useState(0);
  const [chatPreload, setChatPreload] = useState(null);
  const chatSeqRef = useRef(0);

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

  const useQueryInChat = (query) => {
    if (!query || !query.trim()) return;
    setChatPreload({ query: query.trim(), seq: ++chatSeqRef.current });
    setActiveNav('chat');
  };

  const viewDocument = (docId) => {
    if (docId) setSelectedDocId(docId);
    setActiveNav('doc_details');
  };

  const handleUploadDone = () => {
    setLibraryRefreshKey((k) => k + 1);
  };

  const handleCitationClick = (citation) => {
    setActiveCitation(citation);
  };

  const navToPage = (id) => {
    if (id === 'search') setActiveNav('adv_search');
    else if (id === 'field') setIsWizardModalOpen(true);
    else if (id === 'settings') setActiveNav('ai');
    else setActiveNav(id);
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
        {/* Left Navigation Sidebar */}
        <Sidebar 
          activeNav={activeNav === 'doc_details' ? 'documents' : activeNav === 'adv_search' ? 'search' : activeNav === 'ai' || activeNav === 'search_settings' || activeNav === 'data' || activeNav === 'settings' ? 'settings' : activeNav} 
          setActiveNav={navToPage}
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
            initialQuery={searchQuery}
            onUseInChat={useQueryInChat}
            onViewDoc={viewDocument}
          />
        ) : activeNav === 'knowledge' ? (
          <KnowledgeGraph />
        ) : activeNav === 'doc_details' ? (
          <DocumentDetails 
            documentId={selectedDocId}
            onBack={() => setActiveNav('documents')}
            onDelete={() => {
              setLibraryRefreshKey((k) => k + 1);
              setSelectedDocId(null);
              setActiveNav('documents');
            }}
          />
        ) : activeNav === 'documents' ? (
          <DocumentLibrary 
            key={libraryRefreshKey}
            onOpenUpload={() => setIsUploadModalOpen(true)}
            onSelectDocument={(docId) => {
              if (docId) setSelectedDocId(docId);
              setActiveNav('doc_details');
            }}
          />
        ) : activeNav === 'search' ? (
          <SearchResults 
            query={searchQuery}
            onUseInChat={useQueryInChat}
            onViewDoc={viewDocument}
          />
        ) : (
          <>
            {/* Central Chat Area */}
            <ChatArea 
              key={`chat-${chatPreload?.seq ?? 0}`}
              initialQuery={chatPreload?.query ?? ''}
              activeCitation={activeCitation}
              onCitationClick={handleCitationClick}
              onSourcesChange={setChatSources}
              onStreamingChange={setIsStreaming}
            />

            {/* Right Context/Sources Inspector */}
            <InspectorPanel 
              sources={chatSources}
              isStreaming={isStreaming}
              activeCitation={activeCitation}
              onCitationClick={handleCitationClick}
            />
          </>
        )}
      </div>

      {/* Upload Technical Documentation Modal Overlay */}
      <UploadModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploaded={handleUploadDone}
      />

      {/* Quick Troubleshooting Wizard Modal Overlay */}
      <WizardModal
        isOpen={isWizardModalOpen}
        onClose={() => setIsWizardModalOpen(false)}
      />
    </div>
  );
}