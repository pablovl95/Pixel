import { useState, useCallback, useRef } from 'react';
import PixelCanvas    from './components/PixelCanvas';
import Minimap        from './components/Minimap';
import PixelTooltip   from './components/PixelTooltip';
import StatsPanel     from './components/StatsPanel';
import SelectionModal from './components/SelectionModal';
import { GRID_SIZE, TOTAL } from './data/pixels';

export default function App() {
  const [hoveredPixel, setHoveredPixel] = useState(null);
  const [camState,     setCamState]     = useState(null);
  const [mode,         setMode]         = useState('view');   // 'view' | 'select'
  const [selection,    setSelection]    = useState(null);     // { x0,y0,x1,y1 }
  const canvasControl = useRef(null);

  const handleSelection = useCallback((rect) => {
    setSelection(rect);
    setMode('view');
  }, []);

  const closeModal = useCallback(() => setSelection(null), []);

  const toggleSelect = useCallback(() => {
    setMode(m => m === 'select' ? 'view' : 'select');
    setSelection(null);
  }, []);

  return (
    <div className="w-screen h-screen bg-[#111] flex flex-col overflow-hidden">

      {/* ── Top bar ── */}
      <header className="flex items-center justify-between px-5 py-2.5 border-b border-white/10
                         bg-black/70 backdrop-blur-sm shrink-0 z-10">
        <div className="flex items-center gap-2.5">
          <span className="text-white font-bold tracking-tight text-lg">SpecularBox</span>
          <span className="text-white/25 text-xs font-mono">
            {GRID_SIZE.toLocaleString()}×{GRID_SIZE.toLocaleString()} · {(TOTAL / 1_000_000).toFixed(1)}M pixels
          </span>
        </div>

        {/* Mode toggle */}
        <button
          onClick={toggleSelect}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                      border transition-all select-none
                      ${mode === 'select'
                        ? 'bg-white text-black border-white'
                        : 'bg-white/[0.06] text-white/60 border-white/[0.12] hover:text-white hover:border-white/30'}`}
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="1" y="1" width="12" height="12" rx="1" strokeDasharray="3 2"/>
          </svg>
          {mode === 'select' ? 'Cancel selection' : 'Select zone'}
        </button>

        <span className="text-white/25 text-[11px] font-mono hidden sm:block">
          {mode === 'select' ? 'drag to select a zone' : 'scroll to zoom · drag to pan'}
        </span>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        <div className="relative flex-1 overflow-hidden flex items-center justify-center bg-[#0d0d0d]">
          <PixelCanvas
            mode={mode}
            onPixelHover={setHoveredPixel}
            onSelection={handleSelection}
            onViewChange={setCamState}
            controlRef={canvasControl}
          />
          {mode === 'view' && <PixelTooltip gridPos={hoveredPixel} />}
          <Minimap
            cam={camState}
            onClick={(gx, gy) => canvasControl.current?.jumpTo(gx, gy)}
          />
        </div>

        <StatsPanel />
      </div>

      {/* ── Selection modal ── */}
      {selection && <SelectionModal selection={selection} onClose={closeModal} />}
    </div>
  );
}
