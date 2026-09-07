import React from 'react';
import { Zap, Brain, Database, Check, MessageSquare, Search, GitBranch, ArrowRight, Shield } from 'lucide-react';

/* ── Features ─────────────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: Zap,
    iconBg: '#e0f7fa',
    iconColor: '#00acc1',
    title: 'Instant Diagnostics',
    description: 'AI-powered analysis of complex equipment failures in seconds. Get ranked probable causes with confidence scores backed by technical documentation.',
  },
  {
    icon: Brain,
    iconBg: '#e0f2fe',
    iconColor: '#0284c7',
    title: 'Knowledge Integration',
    description: 'Leverages technical manuals, maintenance logs, and sensor data. Every answer is cited and traceable directly to its source document.',
  },
  {
    icon: Database,
    iconBg: '#f0fdf4',
    iconColor: '#16a34a',
    title: 'Real-time Context',
    description: 'Dynamic retrieval from your entire document library. Hybrid semantic + keyword search ensures no relevant operational detail is missed.',
  },
  {
    icon: Search,
    iconBg: '#fef3c7',
    iconColor: '#d97706',
    title: 'Advanced Search',
    description: 'Deep-dive search across documentation and historical diagnostics. Filter by equipment class, document type, and confidence threshold.',
  },
  {
    icon: GitBranch,
    iconBg: '#fae8ff',
    iconColor: '#c026d3',
    title: 'Knowledge Graph',
    description: 'Visualize equipment relationships and system dependencies. Understand component interactions and trace failure pathways instantly.',
  },
  {
    icon: Shield,
    iconBg: '#fee2e2',
    iconColor: '#dc2626',
    title: 'Audit & Compliance',
    description: 'Every diagnostic session is logged with full citation trails. Meet ISO, OSHA, and enterprise compliance requirements out of the box.',
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      style={{
        padding: '90px 28px',
        background: '#ffffff',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '20px',
              background: '#e0f7fa',
              border: '1px solid rgba(0,172,193,0.3)',
              marginBottom: '16px',
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#006064', letterSpacing: '0.06em' }}>PLATFORM CAPABILITIES</span>
          </div>
          <h2
            style={{
              fontSize: 'clamp(28px, 4vw, 44px)',
              fontWeight: '800',
              color: '#0f172a',
              letterSpacing: '-0.025em',
              margin: '0 0 16px',
            }}
          >
            Powerful Features for Modern Heavy Industry
          </h2>
          <p style={{ fontSize: '17px', color: '#475569', maxWidth: '560px', margin: '0 auto', lineHeight: 1.6 }}>
            Everything you need to diagnose, document, and resolve complex industrial equipment issues faster than ever.
          </p>
        </div>

        {/* Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '24px',
          }}
        >
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '32px',
                  transition: 'transform 0.25s, border-color 0.25s, box-shadow 0.25s',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#00acc1';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,172,193,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
                }}
              >
                <div
                  style={{
                    width: '50px', height: '50px',
                    borderRadius: '12px',
                    background: f.iconBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '20px',
                  }}
                >
                  <Icon style={{ width: '24px', height: '24px', color: f.iconColor }} />
                </div>
                <h3 style={{ fontSize: '19px', fontWeight: '700', color: '#0f172a', margin: '0 0 10px', letterSpacing: '-0.01em' }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: '14.5px', lineHeight: 1.65, color: '#475569', margin: 0 }}>
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── Testimonial ──────────────────────────────────────────────────────────── */
export function Testimonial() {
  return (
    <section
      style={{
        padding: '80px 28px',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        borderTop: '1px solid #e2e8f0',
        borderBottom: '1px solid #e2e8f0',
      }}
    >
      <div style={{ maxWidth: '880px', margin: '0 auto' }}>
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderLeft: '6px solid #00acc1',
            borderRadius: '16px',
            padding: '40px 44px',
            position: 'relative',
            boxShadow: '0 12px 32px rgba(15,23,42,0.06)',
          }}
        >
          {/* Quote mark */}
          <span style={{ fontSize: '72px', color: 'rgba(0,172,193,0.25)', lineHeight: 1, position: 'absolute', top: '12px', left: '28px', fontFamily: 'Georgia, serif' }}>"</span>

          <p
            style={{
              fontSize: '20px',
              lineHeight: 1.75,
              color: '#0f172a',
              fontStyle: 'italic',
              margin: '16px 0 28px',
              fontWeight: '400',
            }}
          >
            MechMind AI reduced our troubleshooting cycle from 6 hours down to 12 minutes. The citation-backed answers give our maintenance engineers complete confidence in every diagnostic recommendation.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '52px', height: '52px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #00acc1, #00897b)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px', fontWeight: '800', color: '#ffffff',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(0,172,193,0.3)',
              }}
            >
              JC
            </div>
            <div>
              <p style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 2px' }}>Dr. James Chen</p>
              <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0 }}>Chief Maintenance Engineer, FlowServe Corp</p>
            </div>
            {/* Stars */}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '3px' }}>
              {[...Array(5)].map((_, i) => (
                <span key={i} style={{ color: '#f59e0b', fontSize: '18px' }}>★</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Pricing ──────────────────────────────────────────────────────────────── */
const PLANS = [
  {
    name: 'Starter',
    price: '$99',
    period: '/month',
    description: 'For small maintenance teams',
    features: ['Up to 500 technical documents', 'Standard chat interface', '5 concurrent operator sessions', 'Email support', '30-day log retention'],
    highlighted: false,
    cta: 'Start Free Trial',
  },
  {
    name: 'Professional',
    price: '$299',
    period: '/month',
    description: 'For growing industrial operations',
    features: ['Unlimited technical manuals', 'Advanced semantic search', '50 concurrent operator sessions', 'Knowledge graph access', 'Priority support', 'SCADA & sensor integration'],
    highlighted: true,
    cta: 'Start Free Trial',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large manufacturing plants',
    features: ['Unlimited everything', 'Dedicated SRE support', 'Custom AI model fine-tuning', 'On-premise deployment', '99.9% SLA guarantees', 'ISO & SOC2 compliance'],
    highlighted: false,
    cta: 'Contact Sales',
  },
];

export function PricingSection({ onTrial }) {
  return (
    <section
      id="pricing"
      style={{
        padding: '90px 28px',
        background: '#ffffff',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '20px',
              background: '#e0f7fa',
              border: '1px solid rgba(0,172,193,0.3)',
              marginBottom: '16px',
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#006064', letterSpacing: '0.06em' }}>PRICING</span>
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.025em', margin: '0 0 12px' }}>
            Transparent Plans for Every Operational Scale
          </h2>
          <p style={{ fontSize: '16px', color: '#475569', margin: 0 }}>
            From single plants to global enterprise fleets. 14-day free trial, no credit card required.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            alignItems: 'stretch',
          }}
        >
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              style={{
                background: plan.highlighted ? '#e0f7fa' : '#f8fafc',
                border: plan.highlighted ? '2.5px solid #00acc1' : '1px solid #e2e8f0',
                borderRadius: '18px',
                padding: '36px 32px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: plan.highlighted ? '0 12px 32px rgba(0,172,193,0.2)' : '0 2px 8px rgba(0,0,0,0.03)',
                transition: 'border-color 0.2s, transform 0.2s',
              }}
            >
              {plan.highlighted && (
                <span
                  style={{
                    display: 'inline-block',
                    marginBottom: '12px',
                    padding: '4px 14px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: '800',
                    letterSpacing: '0.07em',
                    background: 'linear-gradient(135deg, #00acc1, #00897b)',
                    color: '#ffffff',
                    width: 'fit-content',
                  }}
                >
                  MOST POPULAR
                </span>
              )}
              <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.01em' }}>{plan.name}</h3>
              <p style={{ fontSize: '14px', color: '#475569', margin: '0 0 20px' }}>{plan.description}</p>
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '42px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.03em' }}>{plan.price}</span>
                {plan.period && <span style={{ fontSize: '15px', color: '#64748b', marginLeft: '4px' }}>{plan.period}</span>}
              </div>
              <button
                onClick={onTrial}
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '10px',
                  border: plan.highlighted ? 'none' : '1.5px solid #cbd5e1',
                  background: plan.highlighted ? 'linear-gradient(135deg, #00acc1, #00897b)' : '#ffffff',
                  color: plan.highlighted ? '#ffffff' : '#0f172a',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  marginBottom: '28px',
                  boxShadow: plan.highlighted ? '0 4px 14px rgba(0,172,193,0.3)' : '0 2px 4px rgba(0,0,0,0.04)',
                }}
              >
                {plan.cta}
              </button>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 'auto' }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        width: '20px', height: '20px',
                        borderRadius: '50%',
                        background: plan.highlighted ? 'rgba(0,172,193,0.2)' : '#e2e8f0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Check style={{ width: '12px', height: '12px', color: plan.highlighted ? '#006064' : '#475569' }} />
                    </span>
                    <span style={{ fontSize: '14px', color: '#334155' }}>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CTA + Footer ─────────────────────────────────────────────────────────── */
export function CTAFooter({ onTrial }) {
  return (
    <>
      {/* CTA Banner */}
      <section
        style={{
          padding: '80px 28px',
          background: 'linear-gradient(135deg, #1a237e 0%, #1e293b 60%, #00acc1 100%)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: '800', color: '#ffffff', margin: '0 0 14px', letterSpacing: '-0.02em' }}>
            Ready to Transform Your Maintenance Operations?
          </h2>
          <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.88)', margin: '0 0 36px' }}>
            Join hundreds of plant teams eliminating unplanned downtime with MechMind AI.
          </p>
          <button
            onClick={onTrial}
            style={{
              height: '52px',
              padding: '0 36px',
              borderRadius: '12px',
              background: '#ffffff',
              border: 'none',
              color: '#1a237e',
              fontSize: '16px',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)'; }}
          >
            Start Your Free Trial Today <ArrowRight style={{ width: '18px', height: '18px' }} />
          </button>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginTop: '14px' }}>
            14-day free trial · No credit card required · Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          background: '#0f172a',
          borderTop: '1px solid #1e293b',
          padding: '60px 28px 32px',
          color: '#ffffff',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr repeat(3, auto)', gap: '48px', marginBottom: '48px' }}>
            <div>
              <p style={{ fontWeight: '800', color: '#ffffff', fontSize: '20px', margin: '0 0 10px', letterSpacing: '-0.01em' }}>MechMind AI</p>
              <p style={{ fontSize: '13.5px', color: '#94a3b8', lineHeight: 1.6, maxWidth: '240px', margin: 0 }}>
                Transforming heavy industry maintenance with AI intelligence and technical document retrieval.
              </p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Documentation', 'Changelog', 'Status'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'GDPR', 'Security'] },
            ].map((g) => (
              <div key={g.title}>
                <p style={{ fontWeight: '700', color: '#ffffff', fontSize: '14px', margin: '0 0 14px', letterSpacing: '0.03em' }}>{g.title}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  {g.links.map((l) => (
                    <li key={l}>
                      <a
                        href="#"
                        style={{ fontSize: '13.5px', color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#00acc1')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                      >
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid #1e293b', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>© 2026 MechMind AI. All rights reserved.</p>
            <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>Designed for industrial excellence</p>
          </div>
        </div>
      </footer>
    </>
  );
}

export default FeaturesSection;
