import React from 'react';
import { Zap, Brain, Database } from 'lucide-react';

const FEATURES = [
  { icon: Zap, title: 'Instant Diagnostics', description: 'AI-powered analysis of complex equipment failures in seconds' },
  { icon: Brain, title: 'Knowledge Integration', description: 'Leverages decades of technical manuals and maintenance logs' },
  { icon: Database, title: 'Real-time Context', description: 'Dynamic retrieval and citation from your entire document library' },
];

export function FeaturesSection() {
  return (
    <section 
      id="features" 
      className="py-20 px-6 bg-gradient-to-b from-[#0a0e27] to-[#121f3c]"
      style={{ 
        padding: '100px 120px',
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div 
          className="text-center mb-16"
          style={{ marginBottom: '60px' }}
        >
          <h2 
            className="text-[48px] font-bold text-white"
            style={{ marginBottom: '60px' }}
          >
            Powerful Features for Modern Industry
          </h2>
        </div>
        
        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f, index) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="group p-10 rounded-2xl bg-white/[0.03] border border-teal-500/20 hover:border-teal-500/60 hover:bg-teal-500/5 hover:-translate-y-2 hover:shadow-xl hover:shadow-teal-500/15 transition-all duration-400 ease-out"
                style={{ 
                  width: '350px',
                  borderRadius: '16px',
                  padding: '40px',
                }}
              >
                {/* Icon */}
                <div 
                  className="mb-6 inline-flex p-4 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-full group-hover:from-teal-500/40 group-hover:to-cyan-500/40 transition-all"
                  style={{ 
                    width: '64px',
                    height: '64px',
                    marginTop: '24px',
                  }}
                >
                  <Icon className="w-8 h-8 text-teal-300" style={{ width: '32px', height: '32px' }} />
                </div>
                
                {/* Title */}
                <h3 
                  className="text-[24px] font-bold text-white"
                  style={{ 
                    marginTop: '24px',
                    fontWeight: '700',
                  }}
                >
                  {f.title}
                </h3>
                
                {/* Description */}
                <p 
                  className="text-slate-400 mt-2 leading-relaxed"
                  style={{ 
                    marginTop: '12px',
                    fontSize: '16px',
                    fontWeight: '400',
                    color: '#9aa5c4',
                    lineHeight: '1.6',
                  }}
                >
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

export function Testimonial() {
  return (
    <section 
      className="py-20 px-6 bg-gradient-to-b from-[#121f3c] to-[#0a0e27]"
      style={{ 
        padding: '100px',
        maxWidth: '1000px',
        margin: '0 auto',
      }}
    >
      <div 
        className="p-8 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border-l-4 border-teal-500 shadow-xl"
        style={{ 
          borderLeft: '8px solid #00897b',
          paddingLeft: '32px',
        }}
      >
        <p 
          className="text-slate-200 font-light leading-relaxed italic"
          style={{ 
            fontSize: '24px',
            lineHeight: '1.8',
            marginBottom: '30px',
            color: '#b0b8d4',
          }}
        >
          "MechMind AI reduced our troubleshooting time from 6 hours to 12 minutes. The citation-backed answers give us confidence in every diagnostic decision."
        </p>
        <div className="flex items-center gap-4 mt-6">
          <div 
            className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center text-white font-bold"
            style={{ width: '64px', height: '64px' }}
          >
            JC
          </div>
          <div>
            <p 
              className="font-bold text-white"
              style={{ fontSize: '18px' }}
            >
              Dr. James Chen
            </p>
            <p 
              className="text-sm text-slate-400"
              style={{ fontSize: '14px' }}
            >
              Chief Maintenance Engineer, FlowServe Corp
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

const PLANS = [
  { name: 'Starter', price: '$99/month', description: 'For small teams', features: ['Up to 500 documents', 'Basic chat interface', '5 concurrent sessions', 'Email support'], highlighted: false },
  { name: 'Professional', price: '$299/month', description: 'For growing operations', features: ['Unlimited documents', 'Advanced search', '50 concurrent sessions', 'Knowledge graph', 'Priority support'], highlighted: true },
  { name: 'Enterprise', price: 'Custom', description: 'For large deployments', features: ['Unlimited everything', 'Dedicated support', 'Custom integrations', 'SLA guarantees', 'On-premise option'], highlighted: false },
];

export function PricingSection({ onTrial }) {
  return (
    <section 
      id="pricing" 
      className="py-24 px-6 bg-gradient-to-b from-[#0a0e27] to-[#121f3c]"
      style={{ padding: '100px' }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div 
          className="text-center mb-16"
          style={{ marginBottom: '60px' }}
        >
          <h2 className="text-4xl font-bold text-white">Flexible Plans for Every Scale</h2>
          <p className="text-slate-400 mt-3">From startups to enterprise operations</p>
        </div>
        
        {/* Pricing grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`p-10 rounded-2xl transition-all duration-300 ${
                plan.highlighted
                  ? 'bg-teal-500/10 border-2 border-teal-500 shadow-xl shadow-teal-500/20 scale-105'
                  : 'bg-white/[0.02] border border-white/10 hover:border-teal-500/50'
              }`}
              style={{ 
                width: '320px',
                padding: '40px',
                borderRadius: '12px',
              }}
            >
              {plan.highlighted && (
                <span className="inline-block mb-4 px-3 py-1 bg-teal-500 text-white text-[11px] font-bold rounded-full">POPULAR</span>
              )}
              <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              <p className="text-slate-400 text-sm">{plan.description}</p>
              <p className="my-5">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
              </p>
              <button
                onClick={onTrial}
                className={`w-full py-3 rounded-xl font-bold text-sm mb-6 transition-colors ${
                  plan.highlighted 
                    ? 'bg-teal-500 text-white hover:bg-teal-400' 
                    : 'border border-teal-500 text-teal-300 hover:bg-teal-500/10'
                }`}
              >
                {plan.price === 'Custom' ? 'Contact Sales' : 'Start Free Trial'}
              </button>
              <ul className="space-y-2.5 text-sm text-slate-300">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-teal-300">✓</span> {f}
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

export function CTAFooter({ onTrial }) {
  return (
    <>
      {/* CTA Section */}
      <section 
        className="py-20 px-6 text-center"
        style={{ 
          background: 'linear-gradient(to right, #00897b, #005f52)',
          padding: '80px',
        }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-white">
          Ready to Transform Your Maintenance Operations?
        </h2>
        <p className="text-white/90 mt-3">
          Join hundreds of companies reducing downtime with MechMind AI
        </p>
        <button 
          onClick={onTrial} 
          className="mt-6 px-10 py-4 bg-white text-teal-700 font-bold rounded-xl hover:shadow-xl hover:scale-105 transition-all"
          style={{ 
            height: '48px',
            fontSize: '16px',
          }}
        >
          Start Your Free Trial Today
        </button>
        <p className="text-white/80 text-xs mt-3">14-day free trial. No credit card required.</p>
      </section>
      
      {/* Footer */}
      <footer 
        className="border-t py-12 px-6"
        style={{ 
          background: '#0a0e27',
          borderTop: '1px solid rgba(0, 137, 123, 0.2)',
          padding: '60px',
        }}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div>
            <p className="font-bold text-white text-base">MechMind AI</p>
            <p className="text-slate-400 mt-2">Transforming industrial maintenance with AI intelligence</p>
          </div>
          {[
            { title: 'Product', links: ['Features', 'Docs', 'Support', 'Blog'] },
            { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
            { title: 'Legal', links: ['Privacy', 'Terms', 'Compliance', 'Cookies'] },
          ].map((g) => (
            <div key={g.title}>
              <p className="font-bold text-white mb-3">{g.title}</p>
              <ul className="space-y-2">
                {g.links.map((l) => (
                  <li key={l}>
                    <a 
                      href="#" 
                      className="text-slate-400 hover:text-teal-300 transition-colors"
                      style={{ color: '#b0b8d4' }}
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-slate-500 mt-10">© 2026 MechMind AI. All rights reserved.</p>
      </footer>
    </>
  );
}

export default FeaturesSection;
