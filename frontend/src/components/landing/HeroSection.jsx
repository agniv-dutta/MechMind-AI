import React, { useEffect, useState } from 'react';
import { ChevronRight, Bot, Sparkles, Activity, ShieldCheck, Zap } from 'lucide-react';

function useReveal() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);
  return visible;
}

const STATS = [
  { stat: '47,000+', label: 'Equipment Diagnostics' },
  { stat: '94.8%',  label: 'Diagnostic Accuracy' },
  { stat: '2.3s',   label: 'Avg. Response Time' },
];

export function HeroSection({ onTrial, onDemo }) {
  const visible = useReveal();

  return (
    <section
      style={{
        minHeight: '92vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 45%, #e0f2fe 100%)',
        padding: '100px 28px 60px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Light Background Decorations */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {/* Radial glow top right */}
        <div
          style={{
            position: 'absolute',
            top: '-80px', right: '-80px',
            width: '520px', height: '520px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,188,212,0.15) 0%, transparent 70%)',
          }}
        />
        {/* Radial glow bottom left */}
        <div
          style={{
            position: 'absolute',
            bottom: '-60px', left: '-60px',
            width: '420px', height: '420px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,137,123,0.12) 0%, transparent 70%)',
          }}
        />
        {/* Grid pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(rgba(0,172,193,0.15) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '64px',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* ── Left: Content ───────────────────────────────────────── */}
        <div
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(28px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}
        >
          {/* Eyebrow */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '20px',
              background: '#e0f7fa',
              border: '1px solid rgba(0,172,193,0.3)',
              marginBottom: '24px',
              boxShadow: '0 2px 8px rgba(0,172,193,0.1)',
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00acc1' }} className="animate-pulse" />
            <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#006064', letterSpacing: '0.04em' }}>
              AI-POWERED INDUSTRIAL DIAGNOSTICS
            </span>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontSize: 'clamp(36px, 4.5vw, 60px)',
              fontWeight: '800',
              color: '#0f172a',
              lineHeight: 1.12,
              letterSpacing: '-0.03em',
              margin: '0 0 20px',
            }}
          >
            Transform Industrial{' '}
            <br />
            Diagnostics with{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, #00acc1, #00897b)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              AI Intelligence
            </span>
          </h1>

          {/* Subheading */}
          <p
            style={{
              fontSize: '17px',
              lineHeight: 1.65,
              color: '#475569',
              margin: '0 0 32px',
              maxWidth: '520px',
              fontWeight: '450',
            }}
          >
            MechMind AI combines advanced language models with deep industrial technical documentation to diagnose complex equipment failures in seconds.
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '36px', marginBottom: '40px' }}>
            {STATS.map((s, i) => (
              <div
                key={s.label}
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(16px)',
                  transition: `opacity 0.6s ease ${0.3 + i * 0.1}s, transform 0.6s ease ${0.3 + i * 0.1}s`,
                }}
              >
                <div
                  style={{
                    fontSize: '26px',
                    fontWeight: '800',
                    color: '#0f172a',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {s.stat}
                </div>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '3px', fontWeight: '500' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={onTrial}
              style={{
                height: '48px',
                padding: '0 28px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #00acc1, #00897b)',
                border: 'none',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 4px 18px rgba(0,172,193,0.35)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,172,193,0.45)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(0,172,193,0.35)'; }}
            >
              Start Free Trial
            </button>
            <button
              onClick={onDemo}
              style={{
                height: '48px',
                padding: '0 28px',
                borderRadius: '10px',
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                color: '#0f172a',
                fontSize: '15px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#00acc1'; e.currentTarget.style.background = '#f8fafc'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#ffffff'; }}
            >
              Watch Demo <ChevronRight style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        </div>

        {/* ── Right: Live Interactive Interface Preview Card ─────────── */}
        <div
          className="animate-float hidden lg:block"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'scale(1)' : 'scale(0.94)',
            transition: 'opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 20px 48px rgba(15,23,42,0.1), 0 0 30px rgba(0,172,193,0.08)',
              overflow: 'hidden',
            }}
          >
            {/* Mock Topbar Header */}
            <div
              style={{
                background: 'linear-gradient(90deg, #1a237e 0%, #1e293b 100%)',
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: '14px', fontWeight: '800', color: '#ffffff' }}>MechMind AI Workspace</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e' }} className="animate-pulse" />
                <span style={{ fontSize: '10px', fontWeight: '700', color: '#86efac', letterSpacing: '0.05em' }}>SYSTEM READY</span>
              </div>
            </div>

            {/* Chat Preview Body */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', background: '#f8fafc' }}>
              {/* User Bubble */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div
                  style={{
                    background: '#1e293b',
                    color: '#ffffff',
                    padding: '10px 14px',
                    borderRadius: '14px 14px 4px 14px',
                    fontSize: '12.5px',
                    lineHeight: 1.5,
                    maxWidth: '88%',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                  }}
                >
                  High vibration on Turbine B-42 — hits threshold at 1,500 RPM then settles. What should we check first?
                </div>
              </div>

              {/* AI Response Card */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: '32px', height: '32px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #00acc1, #00897b)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(0,172,193,0.3)',
                  }}
                >
                  <Bot style={{ width: '16px', height: '16px', color: '#fff' }} />
                </div>
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px 14px 14px 14px',
                    padding: '12px 14px',
                    flex: 1,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>MechMind Diagnostic Engine</span>
                    <span
                      style={{
                        fontSize: '9px', fontWeight: '700',
                        padding: '1px 6px',
                        borderRadius: '10px',
                        background: '#e0f7fa',
                        color: '#00838f',
                        border: '1px solid rgba(0,172,193,0.3)',
                        letterSpacing: '0.05em',
                      }}
                    >
                      HIGH CONFIDENCE
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {[
                      { bold: 'Critical Speed Resonance:', text: '1,500 RPM is the primary critical speed band. Check acceleration rate.' },
                      { bold: 'Rotor Thermal Bowing:', text: 'Inspect turning gear logs prior to startup sequence.' },
                      { bold: 'Lube Oil Temperature:', text: 'Verify supply temperature is maintained between 38°C – 52°C.' },
                    ].map((item, i) => (
                      <p key={i} style={{ margin: 0, fontSize: '12px', lineHeight: 1.55, color: '#334155' }}>
                        <strong style={{ color: '#0f172a' }}>{item.bold}</strong> {item.text}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Chips */}
              <div style={{ display: 'flex', gap: '7px', paddingLeft: '42px' }}>
                {['View P&ID Schematics', 'Run Vibration FFT', 'Download Maintenance Guide'].map((chip) => (
                  <span
                    key={chip}
                    style={{
                      fontSize: '11px',
                      fontWeight: '600',
                      padding: '4px 10px',
                      borderRadius: '16px',
                      border: '1px solid #cbd5e1',
                      color: '#0f172a',
                      background: '#ffffff',
                    }}
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
