"use client";

import { useState } from "react";

export type RevenuePoint = { label: string; full: string; value: number };

function fmtEUR(n: number) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}

export function RevenueChart({ data, color = "#4f46e5", labels }: { data: RevenuePoint[]; color?: string; labels?: { last30: string; total: string } }) {
  const L = labels ?? { last30: "Son 30 gün", total: "Toplam" };
  const [hover, setHover] = useState<number | null>(null);

  const W = 720, H = 260;
  const padL = 52, padR = 12, padT = 16, padB = 28;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const baseY = padT + plotH;

  const rawMax = Math.max(1, ...data.map((d) => d.value));
  // Ölçeği okunur bir üst değere yuvarla
  const step = Math.pow(10, Math.floor(Math.log10(rawMax)));
  const max = Math.ceil(rawMax / step) * step || 1;

  const slot = plotW / Math.max(1, data.length);
  const barW = Math.max(3, slot - 3);

  const gridVals = [0, 0.25, 0.5, 0.75, 1].map((f) => max * f);
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: "auto" }} role="img" aria-label="Son 30 günlük ciro dağılımı">
        {/* Grid + y etiketleri */}
        {gridVals.map((v, i) => {
          const y = baseY - (v / max) * plotH;
          return (
            <g key={i}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#eef0f3" strokeWidth={1} />
              <text x={padL - 8} y={y + 3} textAnchor="end" className="fill-slate-400" style={{ fontSize: 10 }}>
                {v >= 1000 ? `${Math.round(v / 1000)}k` : Math.round(v)}
              </text>
            </g>
          );
        })}

        {/* Çubuklar */}
        {data.map((d, i) => {
          const h = (d.value / max) * plotH;
          const x = padL + i * slot + (slot - barW) / 2;
          const y = baseY - h;
          const active = hover === i;
          return (
            <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              {/* geniş hedef alanı */}
              <rect x={padL + i * slot} y={padT} width={slot} height={plotH} fill="transparent" />
              <rect x={x} y={y} width={barW} height={Math.max(0, h)} rx={2} fill={color} opacity={active ? 1 : 0.82} />
            </g>
          );
        })}

        {/* x etiketleri (her 5 günde) */}
        {data.map((d, i) =>
          i % 5 === 0 ? (
            <text key={i} x={padL + i * slot + slot / 2} y={H - 8} textAnchor="middle" className="fill-slate-400" style={{ fontSize: 10 }}>
              {d.label}
            </text>
          ) : null
        )}

        {/* Hover tooltip */}
        {hover !== null && (() => {
          const d = data[hover];
          const cx = padL + hover * slot + slot / 2;
          const boxW = 108, boxH = 40;
          const bx = Math.min(Math.max(cx - boxW / 2, padL), W - padR - boxW);
          return (
            <g>
              <line x1={cx} y1={padT} x2={cx} y2={baseY} stroke={color} strokeWidth={1} opacity={0.3} />
              <rect x={bx} y={padT} width={boxW} height={boxH} rx={8} fill="#0f172a" />
              <text x={bx + boxW / 2} y={padT + 16} textAnchor="middle" className="fill-white" style={{ fontSize: 11, fontWeight: 600 }}>{fmtEUR(d.value)}</text>
              <text x={bx + boxW / 2} y={padT + 31} textAnchor="middle" className="fill-slate-300" style={{ fontSize: 10 }}>{d.full}</text>
            </g>
          );
        })()}
      </svg>

      <div className="mt-1 flex items-center justify-between px-1 text-xs text-slate-400">
        <span>{L.last30}</span>
        <span>{L.total}: <span className="font-semibold text-slate-600">{fmtEUR(total)}</span></span>
      </div>
    </div>
  );
}
