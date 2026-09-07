import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ReferenceDot, 
  CartesianGrid 
} from 'recharts';
import { Activity, AlertTriangle, RefreshCw } from 'lucide-react';

// Simulated FFT spectrum data with 3 distinct peaks
const spectrumData = [
  { freq: 0, amp: 0.1 },
  { freq: 10, amp: 0.3 },
  { freq: 20, amp: 0.5 },
  { freq: 30, amp: 1.2 }, // Peak 1 (Lower flank)
  { freq: 40, amp: 0.6 },
  { freq: 50, amp: 0.9 },
  { freq: 60, amp: 4.8 }, // Peak 2 (Tall Main Peak - 1X RPM)
  { freq: 70, amp: 1.1 },
  { freq: 80, amp: 0.4 },
  { freq: 90, amp: 0.7 },
  { freq: 100, amp: 1.8 }, // Peak 3 (Right flank - 2X Harmonics)
  { freq: 110, amp: 0.8 },
  { freq: 120, amp: 0.3 },
  { freq: 130, amp: 0.2 },
  { freq: 140, amp: 0.1 },
];

export default function VibrationSpectrum() {
  const [selectedPeak, setSelectedPeak] = useState(null);
  const [data, setData] = useState(spectrumData);

  const handleSimulateNoise = () => {
    setData((prev) =>
      prev.map((item) => ({
        ...item,
        amp: item.freq === 60 
          ? Number((4.5 + Math.random() * 0.8).toFixed(2)) 
          : item.freq === 30 
          ? Number((1.0 + Math.random() * 0.4).toFixed(2))
          : item.freq === 100 
          ? Number((1.6 + Math.random() * 0.5).toFixed(2))
          : Number((item.amp + (Math.random() * 0.2 - 0.1)).toFixed(2))
      }))
    );
  };

  return (
    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold text-slate-600 tracking-wide uppercase">
            Vibration Spectrum (Simulated)
          </h3>
          <span className="text-[11px] text-slate-600">
            FFT Channel B-42 • 1X / 2X Harmonics
          </span>
        </div>
        <button
          onClick={handleSimulateNoise}
          title="Refresh FFT Sweep"
          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Chart container */}
      <div className="h-44 w-full bg-slate-950 rounded-lg p-2 relative overflow-hidden border border-slate-800">
        {/* Subtle grid background lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:12px_12px] opacity-40"></div>

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="vibeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.7} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis 
              dataKey="freq" 
              stroke="#64748b" 
              fontSize={10} 
              tickFormatter={(val) => `${val}Hz`} 
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={10} 
              domain={[0, 6]}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-slate-900 border border-slate-700 p-2 rounded shadow-lg text-[11px] text-slate-200 font-mono">
                      <p className="text-teal-400 font-bold">{item.freq} Hz</p>
                      <p>Amp: <span className="text-emerald-400 font-bold">{item.amp} mm/s</span></p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="amp"
              stroke="#10B981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#vibeGrad)"
            />

            {/* Peak 1 */}
            <ReferenceDot x={30} y={data.find(d => d.freq === 30)?.amp || 1.2} r={3} fill="#5EEAD4" stroke="#0F172A" />

            {/* Peak 2 (Tall Main Peak) */}
            <ReferenceDot x={60} y={data.find(d => d.freq === 60)?.amp || 4.8} r={5} fill="#EF4444" stroke="#0F172A" />

            {/* Peak 3 */}
            <ReferenceDot x={100} y={data.find(d => d.freq === 100)?.amp || 1.8} r={3.5} fill="#F59E0B" stroke="#0F172A" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Peak Legend Badges */}
      <div className="grid grid-cols-3 gap-1.5 text-[10px]">
        <div className="p-1.5 rounded bg-slate-100 border border-slate-200 text-center">
          <span className="text-slate-600 block font-medium">Sub-sync</span>
          <span className="font-mono font-bold text-teal-600">30Hz (1.2mm/s)</span>
        </div>
        <div className="p-1.5 rounded bg-amber-500/10 border border-amber-500/20 text-center">
          <span className="text-amber-700 block font-medium">1X Peak (Rotor)</span>
          <span className="font-mono font-bold text-amber-600">60Hz (4.8mm/s)</span>
        </div>
        <div className="p-1.5 rounded bg-slate-100 border border-slate-200 text-center">
          <span className="text-slate-600 block font-medium">2X Harmonic</span>
          <span className="font-mono font-bold text-amber-600">100Hz (1.8mm/s)</span>
        </div>
      </div>
    </div>
  );
}
