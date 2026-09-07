import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bot,
  Paperclip,
  Link as LinkIcon,
  Send,
  SlidersHorizontal,
  RotateCcw,
  MoreVertical,
  ChevronRight,
  Loader2,
  AlertTriangle,
  Mic,
} from 'lucide-react';
import { chatStream, getAIConfig } from '../lib/api';

const SUGGESTIONS = [
  'How to reset Turbine B-42...',
  'Check lubrication specs',
  'Summarize latest error logs',
];

function formatTime(date) {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

/** Render a plain-text AI response with basic markdown (bold, bullets, numbered) */
function AiMessageContent({ text }) {
  if (!text) return null;

  // Split into lines and process
  const lines = text.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      elements.push(<div key={i} style={{ height: '6px' }} />);
      i++;
      continue;
    }

    // Heading lines (e.g. "Initial Diagnostic Steps:")
    if (/^[A-Z].+:$/.test(line.trim()) && line.trim().length < 60) {
      elements.push(
        <p key={i} style={{ fontWeight: '700', color: '#111827', marginBottom: '6px', marginTop: i > 0 ? '10px' : '0' }}>
          {line.trim()}
        </p>
      );
      i++;
      continue;
    }

    // Numbered list
    const numMatch = line.match(/^(\d+)\.\s+(.+)/);
    if (numMatch) {
      const items = [];
      while (i < lines.length) {
        const m = lines[i].match(/^(\d+)\.\s+(.+)/);
        if (!m) break;
        items.push({ num: m[1], text: m[2] });
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} style={{ paddingLeft: '4px', margin: '6px 0' }}>
          {items.map((item, idx) => (
            <li key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-start' }}>
              <span style={{ minWidth: '18px', fontWeight: '700', color: '#00897b', fontSize: '13px' }}>{item.num}.</span>
              <span style={{ fontSize: '13.5px', lineHeight: '1.6', color: '#374151' }}>
                <InlineText text={item.text} />
              </span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Bullet list
    if (line.match(/^[•\-\*]\s+/)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^[•\-\*]\s+/)) {
        items.push(lines[i].replace(/^[•\-\*]\s+/, ''));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} style={{ paddingLeft: '4px', margin: '6px 0' }}>
          {items.map((item, idx) => (
            <li key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-start' }}>
              <span style={{ minWidth: '6px', marginTop: '7px', width: '6px', height: '6px', borderRadius: '50%', background: '#00897b', flexShrink: 0 }} />
              <span style={{ fontSize: '13.5px', lineHeight: '1.6', color: '#374151' }}>
                <InlineText text={item} />
              </span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Normal paragraph
    elements.push(
      <p key={i} style={{ fontSize: '13.5px', lineHeight: '1.65', color: '#374151', marginBottom: '4px' }}>
        <InlineText text={line} />
      </p>
    );
    i++;
  }

  return <>{elements}</>;
}

/** Render inline bold (**text**) and citation refs ([1]) */
function InlineText({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[\d+\])/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} style={{ fontWeight: '700', color: '#111827' }}>{part.slice(2, -2)}</strong>;
        }
        if (/^\[\d+\]$/.test(part)) {
          return (
            <span
              key={i}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '18px',
                height: '18px',
                borderRadius: '4px',
                background: '#e0f2fe',
                color: '#0369a1',
                fontSize: '10px',
                fontWeight: '700',
                margin: '0 2px',
                verticalAlign: 'middle',
              }}
            >
              {part.slice(1, -1)}
            </span>
          );
        }
        return part;
      })}
    </>
  );
}

export default function ChatArea({
  initialQuery = '',
  activeCitation,
  onCitationClick,
  onSourcesChange,
  onStreamingChange,
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState('');
  const [offlineMode, setOfflineMode] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const abortRef = useRef(null);
  const scrollRef = useRef(null);
  const didPrefill = useRef(false);
  const textareaRef = useRef(null);

  // Initialize Session
  useEffect(() => {
    setSessionId(`session-${Date.now().toString(36)}`);
  }, []);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming, scrollToBottom]);

  // Execute Preload Query if passed
  useEffect(() => {
    if (initialQuery && !didPrefill.current) {
      didPrefill.current = true;
      sendMessage(initialQuery);
    }
  }, [initialQuery]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const bg = '#f8fafc';
  const cardBg = '#ffffff';
  const borderCol = '#e2e8f0';

  const resetSession = useCallback(() => {
    abortRef.current?.abort();
    setSessionId('');
    setMessages([]);
    setStreamError('');
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

    const userMsg = { id: `u-${Date.now()}`, role: 'user', content: text, time: new Date() };
    const assistantMsg = { id: `a-${Date.now()}`, role: 'assistant', content: '', citations: [], time: new Date() };
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

  const lastAssistantId = messages.filter((m) => m.role === 'assistant').at(-1)?.id;

  return (
    <main
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: bg,
        minWidth: 0,
      }}
    >
      {/* ── Chat Header ──────────────────────────────────────────────────── */}
      <div
        style={{
          height: '64px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          background: cardBg,
          borderBottom: `1px solid ${borderCol}`,
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Bot avatar */}
          <div
            style={{
              width: '40px', height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #1e2a5e, #00897b)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,137,123,0.3)',
              position: 'relative',
            }}
          >
            <Bot style={{ width: '20px', height: '20px', color: '#ffffff' }} />
            <span
              style={{
                position: 'absolute', bottom: '1px', right: '1px',
                width: '9px', height: '9px',
                borderRadius: '50%',
                background: '#22c55e',
                border: `2px solid ${cardBg}`,
              }}
            />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1
                style={{
                  fontSize: '15px',
                  fontWeight: '700',
                  color: '#111827',
                  margin: 0,
                }}
              >
                MechMind Assistant
              </h1>
              {isStreaming ? (
                <span
                  className="animate-pulse"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    padding: '2px 8px',
                    borderRadius: '20px',
                    fontSize: '10px', fontWeight: '700',
                    background: 'rgba(0,137,123,0.12)',
                    color: '#00897b',
                    border: '1px solid rgba(0,137,123,0.25)',
                    letterSpacing: '0.05em',
                  }}
                >
                  <Loader2 style={{ width: '10px', height: '10px', animation: 'spin 1s linear infinite' }} />
                  GENERATING
                </span>
              ) : (
                <span
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    padding: '2px 8px',
                    borderRadius: '20px',
                    fontSize: '10px', fontWeight: '700',
                    background: 'rgba(34,197,94,0.1)',
                    color: '#16a34a',
                    border: '1px solid rgba(34,197,94,0.25)',
                    letterSpacing: '0.05em',
                  }}
                >
                  AI ONLINE
                </span>
              )}
            </div>
            <p
              style={{
                fontSize: '11px',
                color: '#64748b',
                margin: '1px 0 0',
                letterSpacing: '0.06em',
                fontWeight: '500',
              }}
            >
              {offlineMode
                ? '⚠ OFFLINE MODE • NO LLM KEY'
                : isStreaming
                  ? '⏳ ANALYZING • DIAGNOSTIC MODE'
                  : '● AI ONLINE • DIAGNOSTIC MODE'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            title="Session Options"
            style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <SlidersHorizontal style={{ width: '15px', height: '15px' }} />
          </button>
          <button
            title="Reset Session"
            onClick={resetSession}
            style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <RotateCcw style={{ width: '15px', height: '15px' }} />
          </button>
          <button
            title="More Options"
            style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <MoreVertical style={{ width: '15px', height: '15px' }} />
          </button>
        </div>
      </div>

      {/* ── Messages ─────────────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 24px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* Date pill */}
        {messages.length === 0 && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <span
              style={{
                padding: '4px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                background: 'rgba(0,0,0,0.06)',
                color: '#6b7280',
              }}
            >
              {offlineMode ? 'Offline mode active' : `Today, ${formatTime(new Date())}`}
            </span>
          </div>
        )}

        {messages.map((msg, idx) => {
          const isFirst = idx === 0 || messages[idx - 1]?.role !== msg.role;

          if (msg.role === 'user') {
            return (
              <div
                key={msg.id}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', maxWidth: '72%', marginLeft: 'auto' }}
              >
                <div
                  style={{
                    background: '#1a3a52',
                    color: '#ffffff',
                    padding: '14px 18px',
                    borderRadius: '18px 18px 4px 18px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {msg.content}
                </div>
                <span
                  style={{
                    marginTop: '4px',
                    fontSize: '11px',
                    color: '#94a3b8',
                    paddingRight: '4px',
                  }}
                >
                  Technician J. Doe{msg.time ? ` · ${formatTime(msg.time)}` : ''}
                </span>
              </div>
            );
          }

          // Assistant message
          return (
            <div
              key={msg.id}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', maxWidth: '82%' }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: '34px', height: '34px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #1e2a5e, #00897b)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px',
                  boxShadow: '0 2px 6px rgba(0,137,123,0.25)',
                }}
              >
                <Bot style={{ width: '16px', height: '16px', color: '#ffffff' }} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Name + streaming badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>
                    MechMind Assistant
                  </span>
                  {isStreaming && msg.id === lastAssistantId && (
                    <span
                      className="animate-pulse"
                      style={{
                        fontSize: '10px', fontWeight: '700',
                        padding: '1px 7px',
                        borderRadius: '20px',
                        background: 'rgba(0,137,123,0.12)',
                        color: '#00897b',
                        border: '1px solid rgba(0,137,123,0.2)',
                        letterSpacing: '0.04em',
                      }}
                    >
                      ⚡ GENERATING
                    </span>
                  )}
                </div>

                {/* Message card */}
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px 18px 18px 18px',
                    padding: '16px 18px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  }}
                >
                  {msg.content ? (
                    <AiMessageContent text={msg.content} />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {[100, 80, 60].map((w, i) => (
                        <div key={i} className="skeleton" style={{ height: '12px', borderRadius: '6px', width: `${w}%` }} />
                      ))}
                    </div>
                  )}
                  {/* Blinking cursor while streaming */}
                  {isStreaming && msg.id === lastAssistantId && msg.content && (
                    <span
                      className="animate-typing-cursor"
                      style={{ display: 'inline-block', width: '2px', height: '15px', background: '#00897b', marginLeft: '2px', verticalAlign: 'text-bottom', borderRadius: '1px' }}
                    />
                  )}
                </div>

                {/* Citation chips */}
                {msg.citations && msg.citations.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                    {msg.citations.map((c) => (
                      <button
                        key={c.id ?? `${c.source_doc}-${c.page}`}
                        onClick={() => onCitationClick && onCitationClick(c)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: '600',
                          border: activeCitation?.id === c.id
                            ? '1px solid #00897b'
                            : '1px solid #e5e7eb',
                          background: activeCitation?.id === c.id
                            ? '#f0fdf9'
                            : '#f9fafb',
                          color: activeCitation?.id === c.id
                            ? '#00897b'
                            : '#6b7280',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00897b', flexShrink: 0 }} />
                        <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.source_doc}
                        </span>
                        <span style={{ fontFamily: 'monospace', opacity: 0.7 }}>p.{c.page}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Empty state suggestions */}
        {messages.length === 0 && !isStreaming && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingLeft: '46px', marginTop: '4px' }}>
            {SUGGESTIONS.map((sugg, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(sugg)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '8px 14px',
                  borderRadius: '20px',
                  fontSize: '12.5px',
                  fontWeight: '500',
                  border: '1px solid #e5e7eb',
                  background: '#ffffff',
                  color: '#374151',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#00897b';
                  e.currentTarget.style.color = '#00897b';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.color = '#374151';
                }}
              >
                <span>{sugg}</span>
                <ChevronRight style={{ width: '12px', height: '12px', opacity: 0.5 }} />
              </button>
            ))}
          </div>
        )}

        {/* Stream error */}
        {streamError && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <span
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px',
                borderRadius: '10px',
                fontSize: '12px', fontWeight: '600',
                background: 'rgba(239,68,68,0.08)',
                color: '#dc2626',
                border: '1px solid rgba(239,68,68,0.2)',
              }}
            >
              <AlertTriangle style={{ width: '13px', height: '13px' }} />
              {streamError}
            </span>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* ── Input Area ───────────────────────────────────────────────────── */}
      <div
        style={{
          padding: '12px 20px 16px',
          background: cardBg,
          borderTop: `1px solid ${borderCol}`,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '14px',
            padding: '10px 14px',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
          onFocusCapture={(e) => {
            e.currentTarget.style.borderColor = '#00897b';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,137,123,0.12)';
          }}
          onBlurCapture={(e) => {
            e.currentTarget.style.borderColor = '#e5e7eb';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <textarea
            ref={textareaRef}
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isStreaming ? 'MechMind is typing…' : 'Ask about equipment, procedures, or manuals...'}
            disabled={isStreaming}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              fontSize: '13.5px',
              lineHeight: '1.6',
              color: '#111827',
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '8px',
              borderTop: '1px solid #f0f0f0',
            }}
          >
            {/* Left icons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              {[
                { Icon: Paperclip, title: 'Attach file' },
                { Icon: LinkIcon, title: 'Add link' },
                { Icon: Mic, title: 'Voice input' },
              ].map(({ Icon, title }) => (
                <button
                  key={title}
                  type="button"
                  title={title}
                  style={{
                    width: '30px', height: '30px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '7px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: '#9ca3af',
                    transition: 'color 0.15s, background 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#00897b';
                    e.currentTarget.style.background = 'rgba(0,137,123,0.07)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#9ca3af';
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <Icon style={{ width: '14px', height: '14px' }} />
                </button>
              ))}
            </div>

            {/* Send button */}
            <button
              onClick={() => sendMessage()}
              disabled={isStreaming || !input.trim()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '700',
                border: 'none',
                cursor: isStreaming || !input.trim() ? 'not-allowed' : 'pointer',
                background: isStreaming || !input.trim() ? '#e5e7eb' : '#1e2a5e',
                color: isStreaming || !input.trim() ? '#9ca3af' : '#ffffff',
                transition: 'all 0.15s',
                boxShadow: isStreaming || !input.trim() ? 'none' : '0 2px 6px rgba(30,42,94,0.35)',
              }}
            >
              <span>Send</span>
              <Send style={{ width: '13px', height: '13px' }} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}