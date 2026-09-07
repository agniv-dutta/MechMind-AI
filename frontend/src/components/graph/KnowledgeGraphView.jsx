import React, { useEffect, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Download } from 'lucide-react';
import { ENTITY_COLORS } from '../../types/index.js';

export function KnowledgeGraphView({ nodes = [], edges = [], onNodeClick, onExport }) {
  const canvasRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    ctx.fillStyle = '#0b1226';
    ctx.fillRect(0, 0, W, H);
    // grid dots
    ctx.fillStyle = 'rgba(56,189,248,0.18)';
    for (let x = 12; x < W; x += 24) for (let y = 12; y < H; y += 24) ctx.fillRect(x, y, 1.5, 1.5);

    const placed = nodes.map((n, i) => {
      const angle = (2 * Math.PI * i) / Math.max(nodes.length, 1);
      const r = Math.min(W, H) * 0.32 * scale;
      return { ...n, x: W / 2 + r * Math.cos(angle), y: H / 2 + r * Math.sin(angle) };
    });
    const byId = Object.fromEntries(placed.map((n) => [n.id, n]));

    ctx.lineWidth = 1.5;
    edges.forEach((e) => {
      const s = byId[e.source];
      const t = byId[e.target];
      if (!s || !t) return;
      ctx.strokeStyle = 'rgba(148,163,184,0.55)';
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(t.x, t.y);
      ctx.stroke();
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(e.label || e.type || '', (s.x + t.x) / 2, (s.y + t.y) / 2 - 4);
    });

    placed.forEach((n) => {
      ctx.fillStyle = n.color || ENTITY_COLORS[n.type] || '#38bdf8';
      ctx.beginPath();
      ctx.arc(n.x, n.y, (n.size || 10) * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(n.label || n.id, n.x, n.y + (n.size || 10) * scale + 14);
    });

    const onClick = (ev) => {
      const rect = canvas.getBoundingClientRect();
      const px = ((ev.clientX - rect.left) / rect.width) * W;
      const py = ((ev.clientY - rect.top) / rect.height) * H;
      let best = null;
      let bestD = 30;
      placed.forEach((n) => {
        const d = Math.hypot(n.x - px, n.y - py);
        if (d < bestD) {
          bestD = d;
          best = n;
        }
      });
      if (best) onNodeClick?.(best);
    };
    canvas.addEventListener('click', onClick);
    return () => canvas.removeEventListener('click', onClick);
  }, [nodes, edges, scale, onNodeClick]);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button onClick={() => setScale((s) => Math.min(s + 0.15, 2.5))} className="p-2 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-teal-500/20 rounded-xl" aria-label="Zoom in">
          <ZoomIn className="w-4 h-4" />
        </button>
        <button onClick={() => setScale((s) => Math.max(s - 0.15, 0.5))} className="p-2 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-teal-500/20 rounded-xl" aria-label="Zoom out">
          <ZoomOut className="w-4 h-4" />
        </button>
        <button onClick={() => onExport?.()} className="ml-auto px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 flex items-center gap-1.5">
          <Download className="w-3.5 h-3.5" /> Export
        </button>
      </div>
      <canvas ref={canvasRef} width={1100} height={560} className="w-full rounded-2xl border border-slate-800 cursor-pointer" />
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-teal-500/10 rounded-2xl p-4">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Legend</p>
        <div className="flex flex-wrap gap-3 text-xs">
          {Object.entries(ENTITY_COLORS).map(([t, c]) => (
            <span key={t} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ background: c }} /> {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default KnowledgeGraphView;
