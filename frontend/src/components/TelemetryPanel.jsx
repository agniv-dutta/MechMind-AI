import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Activity, AlertTriangle, Bell, Wifi, WifiOff,
  Gauge, Thermometer, Wind, Zap, AudioWaveform, TrendingUp, TrendingDown,
} from 'lucide-react';
import { getTelemetryEquipment } from '../lib/api';

const METRIC_META = {
  vibration: { label: 'Vibration', unit: 'mm/s', icon: Activity, color: '#0ea5e9' },
  temperature: { label: 'Temperature', unit: '°C', icon: Thermometer, color: '#f97316' },
  pressure: { label: 'Pressure', unit: 'PSI', icon: Gauge, color: '#8b5cf6' },
  current: { label: 'Current', unit: 'A', icon: Zap, color: '#f59e0b' },
  noise_level: { label: 'Noise', unit: 'dB', icon: AudioWaveform, color: '#10b981' },
};

function wsUrlFor(equipmentId) {
  const base = (import.meta.env.VITE_API_URL || window.location.origin).replace(/\/$/, '');
  return `${base.replace(/^http/, 'ws')}/api/telemetry/ws/${encodeURIComponent(equipmentId)}`;
}

export default function TelemetryPanel({ initialEquipmentId }) {
  const [equipment, setEquipment] = useState([]);
  const [selected, setSelected] = useState(initialEquipmentId || '');
  const [connState, setConnState] = useState('disconnected'); // disconnected | connecting | connected
  const [readings, setReadings] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [trend, setTrend] = useState('stable');
  const [lastUpdate, setLastUpdate] = useState(null);
  const socketRef = useRef(null);
  const reconnectRef = useRef(null);

  useEffect(() => {
    getTelemetryEquipment()
      .then((list) => {
        setEquipment(list || []);
        if (!selected && list && list.length) {
          setSelected(list[0].equipment_id);
        }
      })
      .catch(() => setEquipment([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connect = useCallback((id) => {
    if (!id) return;
    socketRef.current?.close();
    setConnState('connecting');
    setReadings(null);
    setAlerts([]);

    const ws = new WebSocket(wsUrlFor(id));
    socketRef.current = ws;

    ws.onopen = () => setConnState('connected');
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setReadings(data.readings || {});
        setAlerts(data.alerts || []);
        setTrend(data.analysis?.vibration_trend || 'stable');
        setLastUpdate(data.timestamp);
      } catch { /* ignore malformed frame */ }
    };
    ws.onclose = () => {
      setConnState('disconnected');
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      reconnectRef.current = setTimeout(() => {
        if (socketRef.current === ws) connect(id);
      }, 3000);
    };
    ws.onerror = () => ws.close();
  }, []);

  useEffect(() => {
    connect(selected);
    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      socketRef.current?.close();
    };
  }, [selected, connect]);

  const connColor = { connected: '#10b981', connecting: '#f59e0b', disconnected: '#ef4444' }[connState];
  const connLabel = { connected: 'Live', connecting: 'Connecting…', disconnected: 'Offline' }[connState];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#00897b]" />
          <h3 className="font-bold text-slate-900 text-base">Live Telemetry</h3>
        </div>

        <div className="flex items-center gap-3">
          <label htmlFor="telemetry-equipment" className="sr-only">Equipment</label>
          <select
            id="telemetry-equipment"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            disabled={equipment.length === 0}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00897b]/50 disabled:opacity-50"
          >
            {equipment.length === 0 && <option value="">No stream available</option>}
            {equipment.map((eq) => (
              <option key={eq.equipment_id} value={eq.equipment_id}>
                {eq.equipment_name || eq.equipment_id}
              </option>
            ))}
          </select>

          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
            style={{ background: `${connColor}18`, color: connColor }}
            role="status"
            aria-live="polite"
          >
            {connState === 'connected' ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            {connLabel}
          </span>
        </div>
      </div>

      {connState === 'disconnected' && equipment.length === 0 ? (
        <p className="text-sm text-slate-400 py-8 text-center">
          No equipment with sensor history available for live streaming.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {Object.entries(METRIC_META).map(([key, meta]) => {
              const value = readings?.[key];
              const Icon = meta.icon;
              return (
                <div key={key} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <Icon className="w-3.5 h-3.5" style={{ color: meta.color }} />
                    {meta.label}
                  </div>
                  <div className="mt-1.5 font-mono font-bold text-lg text-slate-900">
                    {value !== undefined && value !== null ? value.toLocaleString() : '—'}
                    <span className="text-xs font-medium text-slate-400"> {meta.unit}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              Vibration trend:
              {trend === 'rising' ? (
                <span className="inline-flex items-center gap-1 font-semibold text-red-600">
                  <TrendingUp className="w-3.5 h-3.5" /> rising
                </span>
              ) : trend === 'falling' ? (
                <span className="inline-flex items-center gap-1 font-semibold text-teal-600">
                  <TrendingDown className="w-3.5 h-3.5" /> falling
                </span>
              ) : (
                <span className="font-semibold text-slate-600">stable</span>
              )}
            </span>
            {lastUpdate && <span>Updated {new Date(lastUpdate).toLocaleTimeString()}</span>}
          </div>

          {alerts.length > 0 && (
            <div
              className="mt-4 rounded-xl border-l-4 border-amber-400 bg-amber-50 p-4"
              role="alert"
              aria-label="Active telemetry alerts"
            >
              <h4 className="flex items-center gap-2 font-bold text-amber-800 text-sm mb-2">
                <Bell className="w-4 h-4" /> Alerts ({alerts.length})
              </h4>
              <ul className="space-y-1">
                {alerts.map((alert, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-amber-800">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span className="capitalize">{alert.sensor.replace('_', ' ')}</span>
                    <span className="font-mono">{alert.value}</span>
                    <span className="text-amber-600">(threshold {alert.threshold})</span>
                    <span className={`ml-auto text-xs font-bold ${alert.severity === 'CRITICAL' ? 'text-red-700' : 'text-amber-700'}`}>
                      {alert.severity}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}