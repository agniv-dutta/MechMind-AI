import React, { useCallback, useEffect, useState } from 'react';
import {
  Activity, FileText, Network, MessageSquare, AlertCircle,
  CheckCircle, Clock, Loader2, RefreshCw, Wrench, Cpu, Download,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { getDashboardMetrics, getAnalyticsTimeline, getEquipmentTypes, getEquipmentStatus, getReportUrl } from '../lib/api';
import { useNotifications } from '../context/NotificationContext.jsx';
import TelemetryPanel from '../components/TelemetryPanel.jsx';

export function DashboardPage() {
  const { notify } = useNotifications();
  const [data, setData] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [predictive, setPredictive] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAll = useCallback(async () => {
    try {
      const [metrics, tl, eq, pe] = await Promise.all([
        getDashboardMetrics(),
        getAnalyticsTimeline(30),
        getEquipmentTypes(),
        getEquipmentStatus(),
      ]);
      setData(metrics);
      setTimeline(tl || []);
      setEquipment(eq || []);
      setPredictive(pe || []);
    } catch (err) {
      notify(`Failed to load dashboard analytics: ${err.message}`, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [notify]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadAll();
  };

  const kb = (data?.knowledge_graph || {});
  const chats = (data?.chats || {});
  const perf = (data?.performance || {});

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6" style={{ background: '#f8fafc' }}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">System overview and key operational metrics</p>
          </div>
          {data?.is_sample && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-semibold text-amber-800">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Sample data
            </span>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {loading && !data ? (
        <div className="flex items-center justify-center h-64 text-slate-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading analytics…
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              icon={FileText}
              label="Total Documents"
              value={data?.documents?.total || 0}
              subtitle={`${data?.documents?.this_month || 0} this month`}
              accent="#0ea5e9"
            />
            <MetricCard
              icon={Network}
              label="Knowledge Graph"
              value={kb.entities || 0}
              subtitle={`${kb.relationships || 0} relationships`}
              accent="#8b5cf6"
            />
            <MetricCard
              icon={MessageSquare}
              label="Chat Sessions"
              value={chats.total_sessions || 0}
              subtitle={`${chats.active || 0} active`}
              accent="#10b981"
            />
            <MetricCard
              icon={Clock}
              label="Avg Processing"
              value={perf.avg_processing_time_minutes ? `${perf.avg_processing_time_minutes}m` : '—'}
              subtitle="per document"
              accent="#f59e0b"
            />
          </div>

          {/* Document Processing Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
              <h3 className="font-bold text-slate-900 text-base mb-4">Document Processing</h3>
              <div className="space-y-3">
                <StatusRow label="Completed" value={data?.documents?.completed || 0} icon={CheckCircle} color="#10b981" />
                <StatusRow label="Processing" value={data?.documents?.processing || 0} icon={Activity} color="#0ea5e9" />
                <StatusRow label="Pending" value={data?.documents?.pending || 0} icon={Clock} color="#f59e0b" />
                <StatusRow label="Errors" value={data?.documents?.errors || 0} icon={AlertCircle} color="#ef4444" />
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
                <span className="text-slate-500">Total ingested</span>
                <span className="font-mono font-bold text-slate-900">{data?.documents?.total || 0}</span>
              </div>
            </div>

            {/* Timeline Chart */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
              <h3 className="font-bold text-slate-900 text-base mb-4">Documents Uploaded (30 days)</h3>
              {timeline.length === 0 ? (
                <p className="text-sm text-slate-400 py-10 text-center">No upload activity in the last 30 days.</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={timeline} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                    <Line type="monotone" dataKey="count" stroke="#00897b" strokeWidth={2.5} dot={{ r: 4, fill: '#00897b' }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Live Telemetry */}
          <TelemetryPanel
            initialEquipmentId={predictive[0]?.equipment_id || 'COMPRESSOR-C-102'}
          />

          {/* Predictive Maintenance */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-[#00897b]" />
                <h3 className="font-bold text-slate-900 text-base">Predictive Maintenance</h3>
              </div>
              <div className="flex items-center gap-2">
                <a
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  href={getReportUrl('/api/reports/equipment-status?format=xlsx')}
                >
                  <Download className="w-3.5 h-3.5" />
                  Export XLSX
                </a>
                <a
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  href={getReportUrl('/api/reports/equipment-status?format=csv')}
                >
                  <Download className="w-3.5 h-3.5" />
                  CSV
                </a>
                <span className="text-xs font-medium text-slate-400">
                  RandomForest RUL + anomaly detection
                </span>
              </div>
            </div>
            {predictive.length === 0 ? (
              <p className="text-sm text-slate-400 py-8 text-center">
                No tracked equipment with sensor history yet. Seed sensor data or ingest readings to see predictions.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                      <th className="pb-2 pr-3">Equipment</th>
                      <th className="pb-2 pr-3">Risk</th>
                      <th className="pb-2 pr-3">RUL</th>
                      <th className="pb-2 pr-3">Confidence</th>
                      <th className="pb-2 pr-3">Anomalies</th>
                      <th className="pb-2">Suggested Action</th>
                      <th className="pb-2 pl-3 text-right">Report</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictive.map((row) =>
                      row.status !== 'prediction_available' ? null : (
                        <tr key={row.equipment_id} className="border-b border-slate-50">
                          <td className="py-2.5 pr-3">
                            <div className="flex items-center gap-2">
                              <Cpu className="w-4 h-4 text-slate-400" />
                              <div>
                                <div className="font-semibold text-slate-800">{row.equipment_id}</div>
                                <div className="text-xs text-slate-400">{row.equipment_name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 pr-3">
                            <RiskBadge level={row.risk_level} />
                          </td>
                          <td className="py-2.5 pr-3 font-mono font-semibold text-slate-900">
                            {row.predicted_failure_days}d
                          </td>
                          <td className="py-2.5 pr-3 text-slate-600">
                            {Math.round((row.confidence || 0) * 100)}%
                          </td>
                          <td className="py-2.5 pr-3 text-slate-600">{row.anomalies_detected || 0}</td>
                          <td className="py-2.5 pr-3 text-slate-600">{row.recommended_action}</td>
                          <td className="py-2.5 text-right">
                            <a
                              aria-label={`Download maintenance report for ${row.equipment_id}`}
                              className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-[#00897b] transition-colors"
                              href={getReportUrl(`/api/reports/maintenance/${encodeURIComponent(row.equipment_id)}?format=pdf`)}
                              title={`Download PDF report for ${row.equipment_id}`}
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Equipment Distribution */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
            <h3 className="font-bold text-slate-900 text-base mb-4">Equipment Type Distribution</h3>
            {equipment.length === 0 ? (
              <p className="text-sm text-slate-400 py-8 text-center">
                No equipment classifications recorded yet. Upload documents with equipment metadata to populate this chart.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={equipment} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="type" tick={{ fontSize: 12, fill: '#334155' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} cursor={{ fill: 'rgba(0,137,123,0.06)' }} />
                  <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, subtitle, accent }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
          <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
        </div>
        <div className="rounded-xl p-2.5" style={{ background: `${accent}18`, color: accent }}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

function StatusRow({ label, value, icon: Icon, color }) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4" style={{ color }} />
        <span className="text-sm font-medium text-slate-800">{label}</span>
      </div>
      <span className="text-xl font-bold text-slate-900">{value}</span>
    </div>
  );
}

const RISK_STYLES = {
  CRITICAL: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  HIGH: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  MEDIUM: { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  LOW: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
};

function RiskBadge({ level }) {
  const style = RISK_STYLES[level] || RISK_STYLES.LOW;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${style.bg} ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {level}
    </span>
  );
}

export default DashboardPage;