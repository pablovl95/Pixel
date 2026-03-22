import { useState, useCallback, useRef } from 'react';
import { useAuth }       from './hooks/useAuth';
import TopBar            from './components/TopBar';
import CanvasArea        from './components/CanvasArea';
import StatsPanel        from './components/StatsPanel';
import SelectionModal    from './components/SelectionModal';
import Login             from './components/Login';

export default function App() {
  const session = useAuth();

  const [hoveredPixel, setHoveredPixel] = useState(null);
  const [camState,     setCamState]     = useState(null);
  const [mode,         setMode]         = useState('view');
  const [selection,    setSelection]    = useState(null);
  const [statsOpen,    setStatsOpen]    = useState(false);
  const canvasControl = useRef(null);

  const handleSelection = useCallback((rect) => { setSelection(rect); setMode('view'); }, []);
  const closeModal      = useCallback(() => setSelection(null), []);
  const toggleSelect    = useCallback(() => { setMode(m => m === 'select' ? 'view' : 'select'); setSelection(null); }, []);
  const toggleStats     = useCallback(() => setStatsOpen(v => !v), []);

  if (session === undefined) return null;
  if (!session) return <Login />;

  return (
    <div className="w-screen h-screen bg-[#111] flex flex-col overflow-hidden">
      <TopBar
        mode={mode}
        onToggleSelect={toggleSelect}
        onToggleStats={toggleStats}
        statsOpen={statsOpen}
      />

      <div className="flex flex-1 overflow-hidden">
        <CanvasArea
          mode={mode}
          hoveredPixel={hoveredPixel}
          onPixelHover={setHoveredPixel}
          onSelection={handleSelection}
          onViewChange={setCamState}
          camState={camState}
          canvasControl={canvasControl}
        />
        <StatsPanel open={statsOpen} onClose={() => setStatsOpen(false)} />
      </div>

      {selection && <SelectionModal selection={selection} onClose={closeModal} />}
    </div>
  );
}
