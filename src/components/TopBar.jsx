import { supabase } from '../lib/supabaseClient';

const TABS = [
  { key: 'canvas',      label: 'CANVAS'      },
  { key: 'marketplace', label: 'MARKETPLACE' },
  { key: 'my-pixels',   label: 'MY PIXELS'   },
  { key: 'community',   label: 'COMMUNITY'   },
];

// Pixel-grid logo icon
function PixelIcon() {
  const colors = ['#f87171','#60a5fa','#34d399','#fbbf24','#a78bfa','#f472b6','#38bdf8','#4ade80','#fb923c'];
  return (
    <svg width="28" height="28" viewBox="0 0 3 3" shapeRendering="crispEdges">
      {colors.map((c, i) => (
        <rect key={i} x={i % 3} y={Math.floor(i / 3)} width="1" height="1" fill={c} />
      ))}
    </svg>
  );
}

export default function TopBar({ activeTab, onTabChange }) {
  return (
    <header className="flex items-center shrink-0 border-b border-white/10
                       bg-black/80 backdrop-blur-sm z-20 h-12 px-4 gap-6">

      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <PixelIcon />
        <span className="text-white font-bold tracking-tight text-sm leading-none hidden sm:block">
          MILLION PIXEL<br/>
          <span className="text-white/50 font-normal">CANVAS</span>
        </span>
      </div>

      {/* Nav tabs — ocultos en móvil (están en el MobileTabBar) */}
      <nav className="hidden md:flex items-stretch h-full gap-0 overflow-x-auto scrollbar-none">
        {TABS.map((tab, i) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`
              flex items-center px-3 sm:px-4 text-[11px] sm:text-xs font-semibold tracking-widest
              border-b-2 transition-colors whitespace-nowrap
              ${activeTab === tab.key
                ? 'text-white border-white'
                : 'text-white/40 border-transparent hover:text-white/70'}
              ${i > 0 ? 'border-l border-l-white/[0.06]' : ''}
            `}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Right: icons */}
      <div className="ml-auto flex items-center gap-1 shrink-0">
        {/* Bell */}
        <button className="w-8 h-8 flex items-center justify-center rounded-lg
                           text-white/40 hover:text-white/80 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </button>

        {/* Search */}
        <button className="w-8 h-8 flex items-center justify-center rounded-lg
                           text-white/40 hover:text-white/80 transition-colors">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
        </button>

        {/* Avatar / sign out */}
        <button
          onClick={() => supabase.auth.signOut()}
          title="Sign out"
          className="w-8 h-8 flex items-center justify-center rounded-full
                     bg-white/10 hover:bg-white/20 transition-colors
                     text-white/70 hover:text-white text-xs font-mono font-bold"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </button>
      </div>
    </header>
  );
}
