import { supabase } from '../lib/supabaseClient';
import { GRID_SIZE, TOTAL } from '../data/pixels';

export default function TopBar({ mode, onToggleSelect, onToggleStats, statsOpen }) {
  return (
    <header className="flex items-center justify-between px-3 sm:px-5 py-2 sm:py-2.5
                       border-b border-white/10 bg-black/70 backdrop-blur-sm shrink-0 z-10 gap-2">

      {/* Logo */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-white font-bold tracking-tight text-base sm:text-lg whitespace-nowrap">
          SpecularBox
        </span>
        <span className="text-white/25 text-[10px] sm:text-xs font-mono hidden sm:block">
          {GRID_SIZE.toLocaleString()}×{GRID_SIZE.toLocaleString()} · {(TOTAL / 1_000_000).toFixed(1)}M px
        </span>
      </div>

      {/* Center: hint (solo desktop) */}
      <span className="text-white/25 text-[11px] font-mono hidden md:block">
        {mode === 'select' ? 'drag to select a zone' : 'scroll to zoom · drag to pan'}
      </span>

      {/* Right actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

        {/* Select zone */}
        <button
          onClick={onToggleSelect}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium
                      border transition-all select-none
                      ${mode === 'select'
                        ? 'bg-white text-black border-white'
                        : 'bg-white/[0.06] text-white/60 border-white/[0.12] hover:text-white hover:border-white/30'}`}
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="1" y="1" width="12" height="12" rx="1" strokeDasharray="3 2"/>
          </svg>
          <span className="hidden sm:inline">
            {mode === 'select' ? 'Cancel' : 'Select zone'}
          </span>
        </button>

        {/* Stats toggle (solo mobile) */}
        <button
          onClick={onToggleStats}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium
                      border transition-all select-none md:hidden
                      ${statsOpen
                        ? 'bg-white/10 text-white border-white/30'
                        : 'bg-white/[0.06] text-white/60 border-white/[0.12]'}`}
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
            <rect x="1" y="8" width="3" height="7" rx="0.5"/>
            <rect x="6" y="5" width="3" height="10" rx="0.5"/>
            <rect x="11" y="2" width="3" height="13" rx="0.5"/>
          </svg>
        </button>

        {/* Sign out */}
        <button
          onClick={() => supabase.auth.signOut()}
          className="text-white/40 hover:text-white/80 text-xs font-mono transition-colors px-1"
          title="Cerrar sesión"
        >
          <span className="hidden sm:inline">sign out</span>
          <svg className="sm:hidden" width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </header>
  );
}
