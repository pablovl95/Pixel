// Simple SVG bar chart with hover

import { useState } from 'react';

export default function BarChart({ data, valueKey, color = '#3b82f6', formatY }) {
  const [hovered, setHovered] = useState(null);

  const values = data.map(d => d[valueKey]);
  const max    = Math.max(...values) || 1;

  const W    = 260;
  const H    = 70;
  const GAP  = 2;
  const barW = (W - GAP * (data.length - 1)) / data.length;

  const toH = v => (v / max) * (H - 8);
  const fmt = formatY ?? (v => v.toLocaleString());

  return (
    <div className="relative">
      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        className="overflow-visible"
        onMouseLeave={() => setHovered(null)}
      >
        {data.map((d, i) => {
          const bh = toH(values[i]);
          const bx = i * (barW + GAP);
          const by = H - bh;
          const isH = hovered?.i === i;

          return (
            <g key={i}>
              <rect
                x={bx} y={by}
                width={barW} height={bh}
                rx="1"
                fill={isH ? color : `${color}99`}
                onMouseEnter={() => setHovered({ i, d, x: bx + barW / 2, y: by })}
              />
            </g>
          );
        })}

        {/* Hover vertical line */}
        {hovered && (
          <line
            x1={hovered.x} y1={0}
            x2={hovered.x} y2={H}
            stroke={color} strokeWidth="0.5" strokeDasharray="2,2" opacity="0.5"
          />
        )}
      </svg>

      {/* Tooltip */}
      {hovered && (
        <div className="absolute pointer-events-none z-20 text-[10px] font-mono
                        bg-black/90 border border-white/15 rounded px-2 py-1 text-white
                        whitespace-nowrap"
             style={{ left: hovered.x, top: -32, transform: 'translateX(-50%)' }}>
          <span className="text-white/50 mr-1">{hovered.d.label ?? hovered.d.date}</span>
          {fmt(values[hovered.i])}
        </div>
      )}
    </div>
  );
}
