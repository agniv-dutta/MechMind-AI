import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(null);

let toastId = 0;

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (message, type = 'info', { timeout = 3500 } = {}) => {
      const id = ++toastId;
      setToasts((t) => [...t, { id, message, type }]);
      if (timeout > 0) setTimeout(() => dismiss(id), timeout);
      return id;
    },
    [dismiss]
  );

  return (
    <NotificationContext.Provider value={{ toasts, notify, dismiss }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
