import React, { createContext, useContext, useState } from 'react';
import { NotificationProvider } from './NotificationContext.jsx';
import { ThemeProvider } from './ThemeContext.jsx';
import { ChatProvider } from './ChatContext.jsx';

const AppContext = createContext(null);

function AppState({ children }) {
  const [activeNav, setActiveNav] = useState('chat');
  const [searchQuery, setSearchQuery] = useState('');
  return (
    <AppContext.Provider value={{ activeNav, setActiveNav, searchQuery, setSearchQuery }}>
      {children}
    </AppContext.Provider>
  );
}

export function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <ChatProvider>
          <AppState>{children}</AppState>
        </ChatProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProviders');
  return ctx;
}
