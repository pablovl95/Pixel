import { useState } from 'react';
import { TOTAL } from '../data/pixels';
import { liveStats } from '../data/marketStats';

const ZOOM_PRESETS = [100, 200, 400, 800, 1600];

export default function InfoBar({ zoomPct, onZoomIn, onZoomOut, onZoomSelect, mode, onToggleSelect, onSearch }) {
  const [searchVal, setSearchVal] = useState('');

  function handleSearchKey(e) {
    if (e.key !== 'Enter') return;
    const parts = searchVal.split(',').map(s => parseInt(s.trim(), 10));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      onSearch(parts[0], parts[1]);
    }
  }

  return (
    <div className="flex items-center shrink-0 h-9 px-3 sm:px-4 gap-3
                    bg-black/60 border-b border-white/[0.07] backdrop-blur-sm z-10
                    overflow-x-auto scrollbar-none">

      {/* Live stats — oculto en móvil */}
      <div className="hidden sm:flex items-center gap-0 text-[10px] font-mono whitespace-nowrap shrink-0">
        <span className="flex items-center gap-1 text-green-400 font-semibold mr-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          LIVE CANVAS
        </span>
        <span className="text-white/30 mr-2">|</span>
        <span className="text-white/50">{TOTAL.toLocaleString()} Pixels</span>
        <span className="text-white/20 mx-2">|</span>
        <span className="text-white/50">
          <span className="text-white">{parseInt(liveStats.sold).toLocaleString()}</span> sold
        </span>
        <span className="text-white/20 mx-2">|</span>
        <span className="text-white/50">
          <span className="text-white">{parseInt(liveStats.free).toLocaleString()}</span> available
        </span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Select zone button */}
      <button
        onClick={onToggleSelect}
        className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono
                    border transition-all select-none shrink-0
                    ${mode === 'select'
                      ? 'bg-white text-black border-white'
                      : 'text-white/40 border-white/[0.10] hover:text-white/70 hover:border-white/25'}`}
      >
        <svg width="10" height="10" viewBox="0 0 14 14" fill="none"
             stroke="currentColor" strokeWidth="1.6">
          <rect x="1" y="1" width="12" height="12" rx="1" strokeDasharray="3 2"/>
        </svg>
        <span className="hidden sm:inline">
          {mode === 'select' ? 'Cancel' : 'Select'}
        </span>
      </button>

      {/* Zoom controls */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          onClick={onZoomOut}
          className="w-6 h-6 flex items-center justify-center rounded text-white/50
                     hover:text-white hover:bg-white/10 transition-colors text-sm font-mono"
        >−</button>

        <select
          value={ZOOM_PRESETS.reduce((best, p) => Math.abs(p - zoomPct) < Math.abs(best - zoomPct) ? p : best, ZOOM_PRESETS[0])}
          onChange={e => onZoomSelect(parseInt(e.target.value))}
          className="bg-white/[0.06] border border-white/[0.10] rounded px-1.5 h-6
                     text-white/70 text-[10px] font-mono focus:outline-none
                     hover:border-white/25 transition-colors cursor-pointer"
        >
          {ZOOM_PRESETS.map(p => (
            <option key={p} value={p} className="bg-[#111]">{p}%</option>
          ))}
        </select>

        <button
          onClick={onZoomIn}
          className="w-6 h-6 flex items-center justify-center rounded text-white/50
                     hover:text-white hover:bg-white/10 transition-colors text-sm font-mono"
        >+</button>
      </div>

      {/* Coord search */}
      <div className="flex items-center gap-1 shrink-0">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2" strokeLinecap="round"
             className="text-white/30">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          placeholder="x, y"
          value={searchVal}
          onChange={e => setSearchVal(e.target.value)}
          onKeyDown={handleSearchKey}
          className="w-20 sm:w-28 h-6 px-2 rounded bg-white/[0.05] border border-white/[0.10]
                     text-white text-[10px] font-mono placeholder:text-white/20
                     focus:outline-none focus:border-white/30 transition-colors"
        />
      </div>
    </div>
  );
}
