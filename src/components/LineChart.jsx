// Generic SVG polyline chart with hover tooltip

import { useState } from 'react';

export default function LineChart({ data, valueKey, color = '#3b82f6', label = '', formatY }) {
  const [hovered, setHovered] = useState(null);

  const values = data.map(d => d[valueKey]);
  const min    = Math.min(...values);
  const max    = Math.max(...values);
  const range  = max - min || 1;

  const W = 260;
  const H = 70;
  const PAD = { top: 8, right: 8, bottom: 4, left: 4 };

  const iW = W - PAD.left - PAD.right;
  const iH = H - PAD.top  - PAD.bottom;

  const toX = i  => PAD.left + (i / (data.length - 1)) * iW;
  const toY = v  => PAD.top  + iH - ((v - min) / range) * iH;

  const points = values.map((v, i) => `${toX(i)},${toY(v)}`).join(' ');

  // Filled area path
  const firstX = toX(0);
  const lastX  = toX(data.length - 1);
  const areaPath = `M${firstX},${H} L${points.split(' ').map((p, i) => i === 0 ? p : p).join(' L')} L${lastX},${H} Z`;

  const fmt = formatY ?? (v => v.toLocaleString());

  return (
    <div className="relative">
      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        className="overflow-visible"
        onMouseLeave={() => setHovered(null)}
      >
        <defs>
          <linearGradient id={`grad-${valueKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <path d={areaPath} fill={`url(#grad-${valueKey})`} />

        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Hover targets */}
        {data.map((d, i) => (
          <rect
            key={i}
            x={toX(i) - iW / data.length / 2}
            y={0}
            width={iW / data.length}
            height={H}
            fill="transparent"
            onMouseEnter={() => setHovered({ i, d, x: toX(i), y: toY(values[i]) })}
          />
        ))}

        {/* Hovered dot */}
        {hovered && (
          <>
            <line
              x1={hovered.x} y1={PAD.top}
              x2={hovered.x} y2={H - PAD.bottom}
              stroke={color} strokeWidth="0.5" strokeDasharray="2,2"
            />
            <circle cx={hovered.x} cy={hovered.y} r="3" fill={color} />
          </>
        )}
      </svg>

      {/* Tooltip */}
      {hovered && (
        <div className="absolute -top-8 pointer-events-none z-20 text-[10px] font-mono
                        bg-black/90 border border-white/15 rounded px-2 py-1 text-white
                        whitespace-nowrap"
             style={{ left: hovered.x, transform: 'translateX(-50%)' }}>
          <span className="text-white/50 mr-1">{hovered.d.label ?? hovered.d.date}</span>
          {fmt(values[hovered.i])}
        </div>
      )}
    </div>
  );
}
