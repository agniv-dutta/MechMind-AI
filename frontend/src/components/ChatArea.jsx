import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Bot, 
  Paperclip, 
  Link as LinkIcon, 
  Send, 
  SlidersHorizontal, 
  MoreVertical, 
  RotateCcw, 
  ChevronRight,
  Mic,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { chatStream, getAIConfig } from '../lib/api';

const SUGGESTIONS = [
  'Check vibration history',
  'View P&ID diagram',
];

export default function ChatArea({ 
  initialQuery = '',
  activeCitation, 
  onCitationClick,
  onSourcesChange,
  onStreamingChange,
  darkMode
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [streamError, setStreamError] = useState('');
  const [offlineMode, setOfflineMode] = useState(false);
  const abortRef = useRef(null);
  const scrollRef = useRef(null);
  const didPrefill = useRef(false);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    getAIConfig().then((cfg) => setOfflineMode(cfg.mode !== 'groq')).catch(() => {});
  }, []);

  useEffect(() => {
    if (initialQuery && !didPrefill.current) {
      didPrefill.current = true;
      setInput(initialQuery);
    }
  }, [initialQuery]);

  const resetSession = useCallback(() => {
    abortRef.current?.abort();
    setSessionId('');
    setMessages([]);
    setStreamError('');
    setOfflineMode(false);
    if (onSourcesChange) onSourcesChange([]);
    if (onStreamingChange) onStreamingChange(false);
  }, [onSourcesChange, onStreamingChange]);

  const sendMessage = useCallback(async (raw) => {
    const text = (raw ?? input).trim();
    if (!text || isStreaming) return;
    setInput('');
    setStreamError('');
    setIsStreaming(true);
    if (onStreamingChange) onStreamingChange(true);

    const userMsg = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
    };
    const assistantMsg = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: '',
      citations: [],
      offline: false,
    };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);

    const history = messages
      .filter((m) => m.role === 'user' || (m.role === 'assistant' && m.content))
      .map((m) => ({ role: m.role, content: m.content }))
      .slice(-8);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await chatStream(
        { query: text, conversationHistory: history, sessionId: sessionId || undefined },
        {
          signal: controller.signal,
          onMetadata: (evt) => {
            const sources = evt.sources || [];
            if (sources.length) {
              const normalized = sources.map((s, i) => ({ ...s, id: i }));
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantMsg.id ? { ...m, citations: normalized } : m))
              );
              if (onSourcesChange) onSourcesChange(normalized);
            }
          },
          onToken: (content) => {
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantMsg.id ? { ...m, content: m.content + content } : m))
            );
          },
          onDone: () => {
            if (abortRef.current === controller) {
              setIsStreaming(false);
              if (onStreamingChange) onStreamingChange(false);
            }
          },
          onError: (msg) => {
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantMsg.id && !m.content ? { ...m, content: '' } : m))
            );
            setStreamError(msg);
            setIsStreaming(false);
            if (onStreamingChange) onStreamingChange(false);
          },
        }
      );
    } catch (err) {
      if (err.name !== 'AbortError') {
        setStreamError(err.message || 'Stream failed');
        setIsStreaming(false);
        if (onStreamingChange) onStreamingChange(false);
      }
    } finally {
      if (abortRef.current === controller) {
        setIsStreaming(false);
        if (onStreamingChange) onStreamingChange(false);
        abortRef.current = null;
      }
    }
  }, [input, isStreaming, messages, sessionId, onSourcesChange, onStreamingChange]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestionClick = (s) => sendMessage(s);

  return (
    <main
      className="flex-1 flex flex-col h-full bg-slate-100/60 dark:bg-[#0a0e27] min-w-0 transition-colors duration-200"
      style={{
        background: darkMode ? 'linear-gradient(#0a0e27, #1a2456)' : '#f8f9fa',
        padding: '24px',
      }}
    >
      {/* Chat Header */}
      <div className="h-16 px-6 bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-teal-500/10 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-300 flex items-center justify-center border border-teal-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-slate-900 dark:text-slate-100">
                MechMind Assistant
              </h1>
              {isStreaming ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-500/15 text-teal-600 dark:text-teal-300 border border-teal-500/30 animate-pulse tracking-wide">
                  <Loader2 className="w-3 h-3 mr-1 animate-spin text-teal-500" />
                  STREAMING
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 tracking-wide">
                  READY
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 mt-0.5">
              <span className="inline-flex items-center text-[10px] font-bold text-slate-500 dark:text-slate-400">
                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isStreaming ? 'bg-teal-400 animate-ping' : 'bg-emerald-500'}`}></span>
                {offlineMode ? 'OFFLINE MODE • NO LLM KEY' : isStreaming ? 'ANALYZING' : 'READY FOR QUERIES'}
              </span>
            </div>
          </div>
        </div>

        {/* Top-Right Action Icons */}
        <div className="flex items-center space-x-1">
          <button 
            title="Session Options" 
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
          <button 
            title="Reset Session" 
            onClick={resetSession}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button 
            title="More Options" 
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.length === 0 && (
          <div className="flex justify-center">
            <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shadow-xs border border-slate-300/50 dark:border-teal-500/20">
              {offlineMode ? 'Offline mode active' : 'New conversation'}
            </span>
          </div>
        )}

        {messages.map((msg) => 
          msg.role === 'user' ? (
            <div key={msg.id} className="flex flex-col items-end max-w-2xl ml-auto">
              <div className="bg-[#0D6857] text-white px-5 py-4 rounded-2xl rounded-br-none shadow-md space-y-1">
                <p className="text-sm font-normal leading-relaxed tracking-wide whitespace-pre-wrap">{msg.content}</p>
              </div>
              <span className="mt-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 pr-1">
                You
              </span>
            </div>
          ) : (
            <div key={msg.id} className="flex items-start space-x-3.5 max-w-3xl">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-teal-300 dark:bg-slate-800 dark:text-teal-300 flex items-center justify-center shrink-0 border border-teal-500/30 shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-3">
                <div className="bg-[#F1F5F9] dark:bg-[#0f172a] text-slate-800 dark:text-slate-200 p-5 rounded-2xl rounded-tl-none border border-slate-200/90 dark:border-teal-500/10 shadow-sm space-y-4">
                  {msg.content ? (
                    <p className="text-sm leading-relaxed font-normal text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <div className="space-y-2.5">
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full w-full animate-pulse"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full w-4/5 animate-pulse"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full w-3/5 animate-pulse"></div>
                    </div>
                  )}
                  {isStreaming && msg.id === messages[messages.length - 1]?.id && (
                    <span className="inline-block w-2 h-4 bg-teal-400 animate-pulse align-middle"></span>
                  )}
                </div>

                {msg.citations && msg.citations.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {msg.citations.map((c) => (
                      <button
                        key={c.id ?? `${c.source_doc}-${c.page}`}
                        onClick={() => onCitationClick && onCitationClick(c)}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all flex items-center space-x-1.5 ${
                          activeCitation?.id === c.id
                            ? 'bg-teal-50 dark:bg-teal-950 border-teal-500 text-teal-700 dark:text-teal-300'
                            : 'bg-white dark:bg-[#0f172a] border-slate-200 dark:border-teal-500/10 text-slate-600 dark:text-slate-400 hover:border-teal-500/50'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                        <span className="max-w-[180px] truncate">{c.source_doc}</span>
                        <span className="font-mono">p.{c.page}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        )}

        {messages.length === 0 && !isStreaming && (
          <div className="flex flex-wrap gap-2 pt-1 pl-12">
            {SUGGESTIONS.map((sugg, idx) => (
              <button
                key={idx}
                onClick={() => suggestionClick(sugg)}
                className="px-3.5 py-1.5 rounded-full bg-white dark:bg-[#0f172a] text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-teal-500/10 hover:border-teal-500/50 hover:text-teal-600 dark:hover:text-teal-300 transition-all shadow-2xs flex items-center space-x-1 group"
              >
                <span>{sugg}</span>
                <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-teal-500 transition-transform group-hover:translate-x-0.5" />
              </button>
            ))}
          </div>
        )}

        {streamError && (
          <div className="flex items-center justify-center">
            <span className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-semibold bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-500/30 space-x-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{streamError}</span>
            </span>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-[#0f172a] border-t border-slate-200 dark:border-teal-500/10 shrink-0">
        <div className="rounded-2xl bg-slate-100/80 dark:bg-slate-800/40 border border-slate-200 dark:border-teal-500/20 p-3 transition-all focus-within:ring-2 focus-within:ring-teal-500/40 focus-within:border-teal-500">
          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isStreaming ? 'MechMind is typing...' : 'Describe the problem or ask a question...'}
            disabled={isStreaming}
            className="w-full bg-transparent text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none resize-none"
          />

          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-teal-500/20">
            {/* Bottom left actions */}
            <div className="flex items-center space-x-2">
              <button type="button" className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" title="Attach file (coming soon)">
                <Paperclip className="w-4 h-4" />
              </button>
              <button type="button" className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" title="Source link (coming soon)">
                <LinkIcon className="w-4 h-4" />
              </button>
              <button type="button" className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" title="Voice input (coming soon)">
                <Mic className="w-4 h-4" />
              </button>
            </div>

            {/* Send button */}
            <button
              onClick={() => sendMessage()}
              disabled={isStreaming || !input.trim()}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0D6857] hover:bg-teal-900 transition-all flex items-center space-x-1.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}