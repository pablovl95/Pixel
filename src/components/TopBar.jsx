import { supabase } from '../lib/supabaseClient';
import { GRID_SIZE, TOTAL } from '../data/pixels';

export default function TopBar({ mode, onToggleSelect }) {
  return (
    <header className="flex items-center justify-between px-5 py-2.5 border-b border-white/10
                       bg-black/70 backdrop-blur-sm shrink-0 z-10">
      <div className="flex items-center gap-2.5">
        <span className="text-white font-bold tracking-tight text-lg">SpecularBox</span>
        <span className="text-white/25 text-xs font-mono">
          {GRID_SIZE.toLocaleString()}×{GRID_SIZE.toLocaleString()} · {(TOTAL / 1_000_000).toFixed(1)}M pixels
        </span>
      </div>

      <button
        onClick={onToggleSelect}
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

      <div className="flex items-center gap-3">
        <span className="text-white/25 text-[11px] font-mono hidden sm:block">
          {mode === 'select' ? 'drag to select a zone' : 'scroll to zoom · drag to pan'}
        </span>
        <button
          onClick={() => supabase.auth.signOut()}
          className="text-white/40 hover:text-white/80 text-xs font-mono transition-colors"
          title="Cerrar sesión"
        >
          sign out
        </button>
      </div>
    </header>
  );
}
