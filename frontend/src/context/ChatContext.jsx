import React, { createContext, useContext, useState } from 'react';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const [equipmentContext, setEquipmentContext] = useState(null);

  return (
    <ChatContext.Provider value={{ sessionId, equipmentContext, setEquipmentContext }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChatContext must be used within ChatProvider');
  return ctx;
}
