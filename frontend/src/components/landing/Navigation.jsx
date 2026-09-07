import React, { useEffect, useState } from 'react';
import { Menu, X, Cog } from 'lucide-react';

const LINKS = ['Features', 'Use Cases', 'Pricing', 'Documentation', 'Contact'];

export function Navigation({ onLogin, onTrial }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#0a0e27]/95 backdrop-blur-md shadow-lg shadow-teal-500/10' : 'bg-gradient-to-r from-[#0a0e27] to-[#1a2456]'
      }`}
      style={{ height: '80px' }}
    >
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <button className="flex items-center gap-3 group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white animate-pulse-subtle group-hover:shadow-lg group-hover:shadow-teal-500/50 transition-all duration-300">
            <Cog className="w-6 h-6 animate-rotate-gear" />
          </span>
          <span className="text-[28px] font-bold text-white font-['Inter']">MechMind AI</span>
        </button>
        <div className="hidden md:flex items-center gap-8">
          {LINKS.map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase().replace(' ', '-')}`} 
              className="text-white hover:text-teal-400 text-sm font-medium transition-colors duration-300 relative group"
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-teal-400 group-hover:w-full transition-all duration-300 group-hover:shadow-lg group-hover:shadow-teal-500/30" />
            </a>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3">
          <button 
            onClick={onTrial} 
            className="px-6 py-2 border-2 border-teal-400 text-teal-400 rounded-lg hover:bg-teal-400/10 text-sm font-bold transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20"
            style={{ height: '36px' }}
          >
            Start Free Trial
          </button>
          <button 
            onClick={onLogin} 
            className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 text-sm font-bold shadow-lg transition-all duration-300 hover:shadow-teal-500/40"
            style={{ height: '36px' }}
          >
            Login
          </button>
        </div>
        <button onClick={() => setOpen(!open)} className="md:hidden text-white p-2" aria-label="Toggle menu">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-[#0a0e27] border-t border-teal-500/20 p-4 space-y-1">
          {LINKS.map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase().replace(' ', '-')}`} 
              onClick={() => setOpen(false)} 
              className="block text-white hover:text-teal-400 py-2 text-sm transition-colors duration-300"
            >
              {item}
            </a>
          ))}
          <button 
            onClick={onTrial} 
            className="w-full mt-2 px-6 py-2.5 border-2 border-teal-400 text-teal-400 rounded-lg text-sm font-bold transition-all duration-300"
          >
            Start Free Trial
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navigation;
