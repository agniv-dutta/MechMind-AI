import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  FileText,
  Loader2,
  Cpu,
  Clock,
} from 'lucide-react';
import VibrationSpectrum from './VibrationSpectrum';

const TABS = ['Sources', 'Equipment', 'History'];

export default function InspectorPanel({
  sources = [],
  isStreaming = false,
  activeCitation,
  onCitationClick,
}) {
  const [activeTab, setActiveTab] = useState('Sources');

  const avgConfidence = sources.length
    ? Math.round((sources.reduce((sum, s) => sum + (s.confidence || 0), 0) / sources.length) * 100)
    : null;

  const citationActive = (idx) => activeCitation && activeCitation.id === idx;

  const bg = '#f8fafc';
  const cardBg = '#ffffff';
  const borderCol = '#e2e8f0';
  const textPrimary = '#0f172a';
  const textMuted = '#94a3b8';
  const textSecondary = '#475569';

  return (
    <aside
      style={{
        width: '340px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: bg,
        borderLeft: `1px solid ${borderCol}`,
        overflowY: 'auto',
        userSelect: 'none',
      }}
    >
      {/* ── Tab Header ────────────────────────────────────────────────── */}
      <div
        style={{
          background: cardBg,
          borderBottom: `1px solid ${borderCol}`,
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', padding: '0 6px' }}>
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: activeTab === tab ? '700' : '500',
                color: activeTab === tab ? '#00897b' : textMuted,
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid #00897b' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s',
                letterSpacing: '0.01em',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ───────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>

        {activeTab === 'Sources' && (
          <>
            {/* ── Context Retrieval Status Card ─────────────────────── */}
            <div
              style={{
                background: cardBg,
                border: `1px solid ${borderCol}`,
                borderRadius: '12px',
                padding: '14px 16px',
                marginBottom: '16px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 style={{ width: '15px', height: '15px', color: '#00897b' }} />
                  <span style={{ fontSize: '13px', fontWeight: '700', color: textPrimary }}>Response Confidence</span>
                </div>
                {avgConfidence !== null && (
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: '800',
                      color: avgConfidence >= 80 ? '#16a34a' : avgConfidence >= 60 ? '#d97706' : '#dc2626',
                      fontFamily: 'monospace',
                    }}
                  >
                    {avgConfidence}%
                  </span>
                )}
              </div>

              {/* Progress bar */}
              <div
                style={{
                  height: '8px',
                  background: '#f0f0f0',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  marginBottom: '10px',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: isStreaming ? '73%' : `${avgConfidence ?? 0}%`,
                    background: isStreaming
                      ? 'linear-gradient(90deg, #00897b, #4DD0C4)'
                      : avgConfidence !== null
                        ? (avgConfidence >= 80 ? '#10b981' : avgConfidence >= 60 ? '#f59e0b' : '#ef4444')
                        : '#e5e7eb',
                    borderRadius: '4px',
                    transition: 'width 0.5s ease',
                    animation: isStreaming ? 'gradient-shift 2s ease infinite' : 'none',
                    backgroundSize: '200% 200%',
                  }}
                />
              </div>

              <p style={{ fontSize: '11.5px', color: textSecondary, margin: 0 }}>
                {sources.length
                  ? `Based on ${sources.length} verified technical document${sources.length > 1 ? 's' : ''} and active sensor telemetry.`
                  : isStreaming
                    ? 'Calibrating parameters...'
                    : 'Ask a question to retrieve context sources.'}
              </p>
            </div>

            {/* ── Knowledge Sources ─────────────────────────────────── */}
            <div style={{ marginBottom: '16px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                }}
              >
                <span
                  style={{
                    fontSize: '10.5px',
                    fontWeight: '700',
                    letterSpacing: '0.09em',
                    color: textMuted,
                    textTransform: 'uppercase',
                  }}
                >
                  {sources.length > 0 ? 'Cited Documents' : 'Knowledge Sources'}
                </span>
                {sources.length > 0 && (
                  <span
                    style={{
                      fontSize: '10px', fontWeight: '700',
                      color: '#00897b',
                      fontFamily: 'monospace',
                    }}
                  >
                    Retrieved
                  </span>
                )}
                {isStreaming && sources.length === 0 && (
                  <span
                    className="animate-pulse"
                    style={{ fontSize: '10px', fontWeight: '700', color: '#00897b', fontFamily: 'monospace' }}
                  >
                    Scanning
                  </span>
                )}
              </div>

              {/* Empty state */}
              {sources.length === 0 && !isStreaming && (
                <div
                  style={{
                    background: cardBg,
                    border: `1px solid ${borderCol}`,
                    borderRadius: '10px',
                    padding: '20px',
                    textAlign: 'center',
                  }}
                >
                  <FileText style={{ width: '22px', height: '22px', color: textMuted, margin: '0 auto 8px' }} />
                  <p style={{ fontSize: '12px', color: textMuted, margin: 0 }}>No sources retrieved yet.</p>
                </div>
              )}

              {/* Scanning skeleton */}
              {isStreaming && sources.length === 0 && (
                <div
                  style={{
                    background: cardBg,
                    border: `1px solid ${borderCol}`,
                    borderRadius: '10px',
                    padding: '14px',
                    marginBottom: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <Loader2 style={{ width: '14px', height: '14px', color: '#00897b', animation: 'spin 1s linear infinite' }} />
                    <span style={{ fontSize: '12px', fontWeight: '600', color: textSecondary }}>Scanning SCADA logs...</span>
                  </div>
                  <div className="skeleton" style={{ height: '10px', borderRadius: '5px', width: '100%', marginBottom: '6px' }} />
                  <div className="skeleton" style={{ height: '10px', borderRadius: '5px', width: '75%' }} />
                </div>
              )}

              {/* Source cards */}
              {sources.map((src, idx) => (
                <div
                  key={src.id ?? idx}
                  onClick={() => onCitationClick && onCitationClick(src)}
                  style={{
                    background: cardBg,
                    border: `1px solid ${citationActive(idx) ? '#00897b' : borderCol}`,
                    borderRadius: '10px',
                    padding: '12px 14px',
                    marginBottom: '8px',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                    boxShadow: citationActive(idx) ? '0 0 0 2px rgba(0,137,123,0.15)' : '0 1px 3px rgba(0,0,0,0.04)',
                  }}
                  onMouseEnter={(e) => {
                    if (!citationActive(idx)) e.currentTarget.style.borderColor = 'rgba(0,137,123,0.4)';
                  }}
                  onMouseLeave={(e) => {
                    if (!citationActive(idx)) e.currentTarget.style.borderColor = borderCol;
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    {/* Numbered badge */}
                    <div
                      style={{
                        width: '26px', height: '26px',
                        borderRadius: '6px',
                        background: idx === 0 ? 'rgba(30,42,94,0.1)' : 'rgba(205,97,49,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: '800',
                          color: idx === 0 ? '#1e2a5e' : '#cd6131',
                          fontFamily: 'monospace',
                        }}
                      >
                        [{idx + 1}]
                      </span>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <h4
                          style={{
                            fontSize: '12.5px',
                            fontWeight: '700',
                            color: textPrimary,
                            margin: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '170px',
                          }}
                        >
                          {src.source_doc}
                        </h4>
                        <span style={{ fontSize: '11px', color: textMuted, fontFamily: 'monospace', flexShrink: 0 }}>
                          Pg {src.page}
                        </span>
                      </div>

                      <p
                        style={{
                          fontSize: '11.5px',
                          color: textSecondary,
                          margin: 0,
                          lineHeight: '1.5',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {String(src.excerpt || '').slice(0, 150)}
                      </p>
                    </div>

                    <CheckCircle2
                      style={{
                        width: '15px', height: '15px',
                        color: '#22c55e',
                        flexShrink: 0,
                        marginLeft: '4px',
                        marginTop: '2px',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* ── Vibration Spectrum ────────────────────────────────── */}
            <VibrationSpectrum />
          </>
        )}

        {activeTab === 'Equipment' && (
          <div
            style={{
              background: cardBg,
              border: `1px solid ${borderCol}`,
              borderRadius: '12px',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Cpu style={{ width: '16px', height: '16px', color: '#00897b' }} />
              <span style={{ fontSize: '13px', fontWeight: '700', color: textPrimary }}>Equipment Registry</span>
            </div>
            {[
              { id: 'B-42', name: 'Turbine B-42', status: 'alert', rpm: '3,600', vibration: '4.8 mm/s' },
              { id: 'CP-4092', name: 'Centrifugal Pump', status: 'ok', rpm: '1,450', vibration: '1.2 mm/s' },
              { id: 'CM-200', name: 'Compressor Unit', status: 'ok', rpm: '3,000', vibration: '0.8 mm/s' },
            ].map((eq) => (
              <div
                key={eq.id}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  background: '#f9fafb',
                  border: `1px solid ${borderCol}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '12.5px', fontWeight: '700', color: textPrimary, margin: '0 0 2px' }}>{eq.name}</p>
                    <p style={{ fontSize: '11px', color: textMuted, margin: 0, fontFamily: 'monospace' }}>ID: {eq.id}</p>
                  </div>
                  <span
                    style={{
                      fontSize: '9px',
                      fontWeight: '700',
                      padding: '2px 7px',
                      borderRadius: '4px',
                      letterSpacing: '0.06em',
                      background: eq.status === 'alert' ? 'rgba(245,158,11,0.12)' : 'rgba(34,197,94,0.1)',
                      color: eq.status === 'alert' ? '#d97706' : '#16a34a',
                      border: `1px solid ${eq.status === 'alert' ? 'rgba(245,158,11,0.25)' : 'rgba(34,197,94,0.2)'}`,
                    }}
                  >
                    {eq.status === 'alert' ? 'ALERT' : 'ACTIVE'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                  <div>
                    <p style={{ fontSize: '10px', color: textMuted, margin: '0 0 1px' }}>RPM</p>
                    <p style={{ fontSize: '12px', fontWeight: '700', color: textPrimary, fontFamily: 'monospace', margin: 0 }}>{eq.rpm}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '10px', color: textMuted, margin: '0 0 1px' }}>Vibration</p>
                    <p style={{ fontSize: '12px', fontWeight: '700', color: eq.status === 'alert' ? '#d97706' : textPrimary, fontFamily: 'monospace', margin: 0 }}>{eq.vibration}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'History' && (
          <div>
            {[
              { q: 'Turbine B-42 vibration analysis', time: '14:32', date: 'Today' },
              { q: 'Centrifugal pump cavitation causes', time: '10:15', date: 'Today' },
              { q: 'B-Series rotor bow symptoms', time: '09:41', date: 'Today' },
              { q: 'Lube oil instability threshold', time: '16:22', date: 'Yesterday' },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: cardBg,
                  border: `1px solid ${borderCol}`,
                  borderRadius: '10px',
                  padding: '12px 14px',
                  marginBottom: '8px',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(0,137,123,0.4)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = borderCol}
              >
                <p style={{ fontSize: '12.5px', fontWeight: '600', color: textPrimary, margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.q}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock style={{ width: '10px', height: '10px', color: textMuted }} />
                  <span style={{ fontSize: '11px', color: textMuted }}>{item.date} · {item.time}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}