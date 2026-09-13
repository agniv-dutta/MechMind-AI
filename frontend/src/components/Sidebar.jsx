import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Network,
  Wrench,
  Settings,
  ChevronRight,
  Activity,
  HelpCircle,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard',  labelKey: 'nav.dashboard',       icon: LayoutDashboard },
  { id: 'chat',       labelKey: 'nav.chat',             icon: MessageSquare,   badge: 'Live' },
  { id: 'documents',  labelKey: 'nav.documents',        icon: FileText },
  { id: 'knowledge',  labelKey: 'nav.knowledge',        icon: Network },
  { id: 'field_page', labelKey: 'nav.field', icon: Wrench },
];

export default function Sidebar({ activeNav, setActiveNav }) {
  const { t } = useTranslation();
  const isActive = (id) => activeNav === id;

  const itemBase = {
    display: 'flex',
    alignItems: 'center',
    gap: '11px',
    width: '100%',
    height: '44px',
    padding: '0 16px',
    fontSize: '14px',
    fontWeight: '500',
    borderRadius: '0',
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.15s, color 0.15s',
    textAlign: 'left',
    background: 'transparent',
  };

  const activeStyle = {
    borderLeft: '4px solid #00acc1',
    paddingLeft: '12px',
    background: '#e0f7fa',
    color: '#006064',
    fontWeight: '600',
  };

  const inactiveStyle = {
    color: '#475569',
    borderLeft: '4px solid transparent',
    paddingLeft: '12px',
  };

  return (
    <aside
      className="bg-white border-r border-slate-200"
      style={{
        width: '220px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        overflowY: 'auto',
        userSelect: 'none',
      }}
    >
      {/* ── Top Navigation Links ───────────────────────────────────── */}
      <div style={{ paddingTop: '12px' }}>
        {NAV_ITEMS.map(({ id, labelKey, icon: Icon, badge }) => {
          const label = t(labelKey);
          return (
          <button
            key={id}
            onClick={() => setActiveNav(id)}
            aria-current={isActive(id) ? 'page' : undefined}
            aria-label={label}
            style={{
              ...itemBase,
              ...(isActive(id) ? activeStyle : inactiveStyle),
            }}
            onMouseEnter={(e) => {
              if (!isActive(id)) {
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.color = '#0f172a';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive(id)) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#475569';
              }
            }}
          >
            <Icon
              style={{
                width: '18px',
                height: '18px',
                flexShrink: 0,
                color: isActive(id) ? '#00acc1' : '#64748b',
              }}
            />
            <span style={{ flex: 1 }}>{label}</span>
            {badge && (
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: '700',
                  padding: '2px 6px',
                  borderRadius: '20px',
                  letterSpacing: '0.05em',
                  background: isActive(id) ? 'rgba(0,172,193,0.2)' : 'rgba(0,172,193,0.1)',
                  color: '#00838f',
                  border: '1px solid rgba(0,172,193,0.25)',
                }}
              >
                {badge}
              </span>
            )}
          </button>
          );
        })}
      </div>

      {/* ── Bottom Section ────────────────────────────────────── */}
      <div>
        {/* Equipment Quick Status Widget */}
        <div
          style={{
            margin: '0 12px 12px',
            padding: '12px',
            borderRadius: '10px',
            background: '#fff8f6',
            border: '1px solid #ffedd5',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px',
            }}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: '700',
                color: '#0f172a',
              }}
            >
              <Activity style={{ width: '13px', height: '13px', color: '#00acc1' }} />
              Turbine B-42
            </span>
            <span
              style={{
                fontSize: '9px',
                fontWeight: '700',
                padding: '2px 6px',
                borderRadius: '4px',
                background: '#fef3c7',
                color: '#d97706',
                border: '1px solid #fde68a',
                letterSpacing: '0.04em',
              }}
            >
              ALERT
            </span>
          </div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>RPM:</span>
              <span style={{ fontFamily: 'monospace', color: '#1e293b', fontWeight: '600' }}>3,600</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Vibration:</span>
              <span style={{ fontFamily: 'monospace', color: '#d97706', fontWeight: '600' }}>4.8 mm/s</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid #e2e8f0', margin: '0 0 4px' }} />

        {/* Help Link */}
        <button
          onClick={() => setActiveNav('help')}
          aria-current={isActive('help') ? 'page' : undefined}
          aria-label="Help and support"
          style={{
            ...itemBase,
            ...(isActive('help') ? activeStyle : inactiveStyle),
          }}
          onMouseEnter={(e) => {
            if (!isActive('help')) {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.color = '#0f172a';
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive('help')) {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#475569';
            }
          }}
        >
          <HelpCircle style={{ width: '18px', height: '18px', flexShrink: 0, color: isActive('help') ? '#00acc1' : '#64748b' }} />
          <span style={{ flex: 1 }}>{t('nav.help')}</span>
        </button>

        {/* Settings Link */}
        <button
          onClick={() => setActiveNav('settings')}
          aria-current={isActive('settings') ? 'page' : undefined}
          aria-label="Settings"
          style={{
            ...itemBase,
            ...(isActive('settings') ? activeStyle : inactiveStyle),
            marginBottom: '8px',
          }}
          onMouseEnter={(e) => {
            if (!isActive('settings')) {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.color = '#0f172a';
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive('settings')) {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#475569';
            }
          }}
        >
          <Settings style={{ width: '18px', height: '18px', flexShrink: 0, color: isActive('settings') ? '#00acc1' : '#64748b' }} />
          <span style={{ flex: 1 }}>{t('nav.settings')}</span>
          <ChevronRight style={{ width: '14px', height: '14px', color: '#94a3b8' }} />
        </button>
      </div>
    </aside>
  );
}
