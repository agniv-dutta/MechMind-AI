import { useState, useCallback } from 'react';
import { chatService } from '../services/api.js';

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useChat({ sessionId } = {}) {
  const [messages, setMessages] = useState([]);
  const [citations, setCitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = useCallback(
    async (text) => {
      const userMsg = { id: uid(), role: 'user', content: text, timestamp: new Date().toISOString() };
      setMessages((m) => [...m, userMsg]);
      setLoading(true);
      setError(null);
      try {
        const res = await chatService.sendMessage(text, { sessionId });
        const aiMsg = {
          id: uid(),
          role: 'assistant',
          content: res?.answer || res?.content || 'No response from assistant.',
          timestamp: new Date().toISOString(),
          citations: res?.citations || [],
          sourceDocuments: res?.sourceDocuments || (res?.citations || []).map((c) => c.sourceDoc),
        };
        setMessages((m) => [...m, aiMsg]);
        if (aiMsg.citations.length) setCitations((c) => [...aiMsg.citations, ...c].slice(0, 50));
        return aiMsg;
      } catch (err) {
        setError(err);
        const fallback = {
          id: uid(),
          role: 'assistant',
          content: `Connection error: ${err.message}. Check backend at /api/chat and retry.`,
          timestamp: new Date().toISOString(),
        };
        setMessages((m) => [...m, fallback]);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [sessionId]
  );

  const clear = useCallback(() => {
    setMessages([]);
    setCitations([]);
    setError(null);
  }, []);

  return { messages, citations, loading, error, sendMessage, clear, setMessages };
}
