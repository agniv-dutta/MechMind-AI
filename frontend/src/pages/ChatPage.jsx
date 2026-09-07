import React from 'react';
import ChatArea from '../components/ChatArea.jsx';
import InspectorPanel from '../components/InspectorPanel.jsx';
import { ErrorBoundary } from '../components/common/ErrorBoundary.jsx';

export function ChatPage() {
  return (
    <div className="flex-1 flex flex-row overflow-hidden min-h-0">
      <ErrorBoundary>
        <ChatArea />
      </ErrorBoundary>
      <ErrorBoundary>
        <InspectorPanel />
      </ErrorBoundary>
    </div>
  );
}

export default ChatPage;
