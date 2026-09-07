import React, { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';

function useReveal() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);
  return visible;
}

export function HeroSection({ onTrial, onDemo }) {
  const visible = useReveal();
  const stats = [
    { stat: '47,000+', label: 'Equipment Diagnostics' },
    { stat: '94.8%', label: 'Diagnostic Accuracy' },
    { stat: '2.3s', label: 'Average Response Time' },
  ];

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#2a1a5e] to-[#0a0e27] pt-20 pb-16 px-6 relative overflow-hidden flex items-center">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        {/* Gradient orbs */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-delayed" />
        
        {/* Particle animation */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-teal-400 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
        
        {/* Diagonal light rays */}
        <div 
          className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-teal-500/10 to-transparent opacity-30"
          style={{
            transform: 'rotate(-45deg) translateX(50%)',
            animation: 'gradient-shift 8s ease infinite',
          }}
        />
        
        {/* Dot grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:26px_26px] opacity-10" />
      </div>

      <div className="max-w-7xl mx-auto z-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left column - Content */}
        <div className={`space-y-8 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          {/* Main headline */}
          <h1 
            className="text-[64px] font-extrabold text-white leading-tight"
            style={{ 
              textShadow: '0 10px 40px rgba(0,0,0,0.5)',
              animationDelay: '0ms',
            }}
          >
            Transform Industrial Diagnostics with{' '}
            <span className="bg-gradient-to-r from-teal-300 to-cyan-300 bg-clip-text text-transparent">
              AI Intelligence
            </span>
          </h1>

          {/* Subheading */}
          <p 
            className="text-[20px] font-normal leading-relaxed max-w-[700px]"
            style={{ 
              color: '#b0b8d4',
              marginTop: '24px',
              animationDelay: '200ms',
            }}
          >
            MechMind AI combines advanced language models with industrial expertise to diagnose equipment failures in seconds, not hours.
          </p>

          {/* Stats Row */}
          <div 
            className="grid grid-cols-3 gap-8 pt-4"
            style={{ 
              columnGap: '80px',
              animationDelay: '400ms',
            }}
          >
            {stats.map((s, i) => (
              <div 
                key={s.label} 
                style={{ 
                  transitionDelay: `${400 + i * 100}ms`,
                }} 
                className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              >
                <div className="text-[24px] font-bold text-white">{s.stat}</div>
                <div className="text-[14px] text-gray-400 mt-2">{s.label}</div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div 
            className="flex flex-wrap gap-4"
            style={{ 
              marginTop: '40px',
              animationDelay: '600ms',
            }}
          >
            <button 
              onClick={onTrial} 
              className="px-6 py-3 bg-[#00897b] text-white font-bold rounded-lg hover:scale-105 hover:shadow-lg hover:shadow-teal-500/40 transition-all duration-300"
              style={{ 
                height: '48px',
                paddingLeft: '24px',
                paddingRight: '24px',
                borderRadius: '8px',
              }}
            >
              Start Free Trial
            </button>
            <button 
              onClick={onDemo} 
              className="px-6 py-3 border-2 border-teal-400 text-white font-bold rounded-lg hover:bg-teal-400/10 flex items-center gap-2 transition-all duration-300"
              style={{ 
                height: '48px',
                borderRadius: '8px',
              }}
            >
              Watch Demo <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right column - Dashboard mockup */}
        <div 
          className={`transition-all duration-700 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
          style={{ animationDelay: '200ms' }}
        >
          <div 
            className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl p-6 border border-teal-500/20 shadow-2xl shadow-teal-500/20 animate-float"
            style={{ 
              opacity: 0.95,
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold text-teal-300">⚙️ MechMind AI</span>
              <span className="text-[11px] font-mono text-emerald-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> READY
              </span>
            </div>
            <div className="bg-slate-700/50 rounded-xl p-4 space-y-2">
              <p className="text-sm text-white">Analyzing pump cavitation issue…</p>
              <div className="bg-slate-600 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-teal-400 to-cyan-400 h-full w-full animate-[loading_2s_ease-in-out_infinite]" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {['NPSH Analysis', 'Flow Rate', 'Pressure Drop', 'Temperature'].map((label) => (
                <div key={label} className="bg-slate-700/30 rounded-xl p-3">
                  <p className="text-[11px] text-slate-400 mb-1">{label}</p>
                  <p className="text-lg font-bold text-teal-300">78%</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
