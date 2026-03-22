import { useState, useCallback, useRef } from 'react';
import { useAuth }        from './hooks/useAuth';
import TopBar             from './components/TopBar';
import InfoBar            from './components/InfoBar';
import CanvasArea         from './components/CanvasArea';
import RightPanel         from './components/RightPanel';
import MobileTabBar       from './components/MobileTabBar';
import SelectionModal     from './components/SelectionModal';
import Login              from './components/Login';
import MarketPage         from './pages/MarketPage';
import StatsPage          from './pages/StatsPage';
import MyPixelsPage       from './pages/MyPixelsPage';

export default function App() {
  const session = useAuth();

  const [hoveredPixel, setHoveredPixel] = useState(null);
  const [camState,     setCamState]     = useState(null);
  const [zoomPct,      setZoomPct]      = useState(100);
  const [mode,         setMode]         = useState('view');
  const [selection,    setSelection]    = useState(null);
  const [activeTab,    setActiveTab]    = useState('canvas');
  const canvasControl = useRef(null);

  const handleViewChange = useCallback((state) => {
    setCamState(state);
    if (state.zoomPct !== undefined) setZoomPct(state.zoomPct);
  }, []);

  const handleSelection = useCallback((rect) => { setSelection(rect); setMode('view'); }, []);
  const closeModal      = useCallback(() => setSelection(null), []);
  const toggleSelect    = useCallback(() => {
    setMode(m => m === 'select' ? 'view' : 'select');
    setSelection(null);
  }, []);

  const handleTabChange = useCallback((tab) => setActiveTab(tab), []);

  const jumpTo = useCallback((gx, gy) => {
    canvasControl.current?.jumpTo(gx, gy);
    setActiveTab('canvas');
  }, []);

  // goTo: zoom alto + highlight del pixel, luego vuelve al canvas
  const goTo = useCallback((gx, gy) => {
    setActiveTab('canvas');
    // pequeño delay para que el canvas esté visible antes de hacer goTo
    setTimeout(() => canvasControl.current?.goTo(gx, gy), 50);
  }, []);

  if (session === undefined) return null;
  if (!session) return <Login />;

  const onCanvas = activeTab === 'canvas' || activeTab === 'details';

  return (
    <div className="w-screen h-screen bg-[#111] flex flex-col overflow-hidden">
      <TopBar activeTab={activeTab} onTabChange={handleTabChange} />

      {/* InfoBar solo en el canvas */}
      {onCanvas && (
        <InfoBar
          zoomPct={zoomPct}
          onZoomIn={() => canvasControl.current?.zoomIn()}
          onZoomOut={() => canvasControl.current?.zoomOut()}
          onZoomSelect={(pct) => canvasControl.current?.setZoomPct(pct)}
          mode={mode}
          onToggleSelect={toggleSelect}
          onSearch={jumpTo}
        />
      )}

      {/* Contenido principal */}
      <div className="flex flex-1 overflow-hidden pb-14 md:pb-0">

        {onCanvas ? (
          /* ── Vista canvas ── */
          <>
            <CanvasArea
              mode={mode}
              onPixelHover={setHoveredPixel}
              onSelection={handleSelection}
              onViewChange={handleViewChange}
              camState={camState}
              canvasControl={canvasControl}
            />
            <RightPanel
              hoveredPixel={hoveredPixel}
              onJump={goTo}
              mobileOpen={activeTab === 'details'}
              onMobileClose={() => setActiveTab('canvas')}
            />
          </>
        ) : activeTab === 'marketplace' ? (
          <MarketPage onJump={goTo} />
        ) : activeTab === 'community' ? (
          <StatsPage />
        ) : (
          <MyPixelsPage />
        )}
      </div>

      <MobileTabBar activeTab={activeTab} onTabChange={handleTabChange} />

      {selection && <SelectionModal selection={selection} onClose={closeModal} />}
    </div>
  );
}
