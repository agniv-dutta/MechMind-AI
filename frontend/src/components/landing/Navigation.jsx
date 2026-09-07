import React, { useEffect, useState } from 'react';
import { Menu, X, Cpu } from 'lucide-react';

const LINKS = ['Features', 'Use Cases', 'Pricing', 'Documentation'];

export function Navigation({ onLogin, onTrial }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: '64px',
        background: scrolled
          ? 'rgba(30,42,94,0.97)'
          : '#1e2a5e',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : 'none',
        boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.25)' : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 28px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <button
          style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none', cursor: 'pointer' }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div
            style={{
              width: '38px', height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #00897b, #4DD0C4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 12px rgba(77,208,196,0.35)',
            }}
          >
            <Cpu style={{ width: '18px', height: '18px', color: '#ffffff' }} className="animate-pulse-subtle" />
          </div>
          <span style={{ fontSize: '20px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.02em' }}>
            MechMind AI
          </span>
        </button>

        {/* Desktop nav links */}
        <div className="hidden md:flex" style={{ alignItems: 'center', gap: '32px' }}>
          {LINKS.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(' ', '-')}`}
              style={{
                color: 'rgba(255,255,255,0.78)',
                fontSize: '14px',
                fontWeight: '500',
                textDecoration: 'none',
                transition: 'color 0.2s',
                position: 'relative',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#4DD0C4')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.78)')}
            >
              {item}
            </a>
          ))}
        </div>

        {/* Desktop CTA buttons */}
        <div className="hidden md:flex" style={{ alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onTrial}
            style={{
              height: '36px',
              padding: '0 20px',
              borderRadius: '8px',
              border: '1.5px solid rgba(77,208,196,0.6)',
              background: 'transparent',
              color: '#4DD0C4',
              fontSize: '13.5px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(77,208,196,0.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            Start Free Trial
          </button>
          <button
            onClick={onLogin}
            style={{
              height: '36px',
              padding: '0 20px',
              borderRadius: '8px',
              background: '#00897b',
              border: 'none',
              color: '#ffffff',
              fontSize: '13.5px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(0,137,123,0.4)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#00796b'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,137,123,0.55)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#00897b'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,137,123,0.4)'; }}
          >
            Login
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ffffff', padding: '6px' }}
        >
          {open ? <X style={{ width: '22px', height: '22px' }} /> : <Menu style={{ width: '22px', height: '22px' }} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          style={{
            background: 'rgba(10,14,39,0.98)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            padding: '12px 24px 20px',
          }}
        >
          {LINKS.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(' ', '-')}`}
              onClick={() => setOpen(false)}
              style={{ display: 'block', padding: '10px 0', color: 'rgba(255,255,255,0.78)', fontSize: '14px', textDecoration: 'none' }}
            >
              {item}
            </a>
          ))}
          <button
            onClick={onTrial}
            style={{ marginTop: '12px', width: '100%', height: '40px', borderRadius: '8px', border: '1.5px solid rgba(77,208,196,0.6)', background: 'transparent', color: '#4DD0C4', fontWeight: '700', cursor: 'pointer' }}
          >
            Start Free Trial
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navigation;
