const TABS = [
  {
    key: 'canvas',
    label: 'Canvas',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M3 9h18M9 21V9"/>
      </svg>
    ),
  },
  {
    key: 'marketplace',
    label: 'Market',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
    ),
  },
  {
    key: 'community',
    label: 'Stats',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6"  y1="20" x2="6"  y2="14"/>
      </svg>
    ),
  },
  {
    key: 'details',
    label: 'Details',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  },
];

export default function MobileTabBar({ activeTab, onTabChange }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50
                    flex items-stretch bg-black/90 backdrop-blur-md
                    border-t border-white/[0.10]"
         style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {TABS.map(tab => {
        const active = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key === activeTab ? 'canvas' : tab.key)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5
                        py-2.5 transition-colors
                        ${active ? 'text-white' : 'text-white/35 hover:text-white/60'}`}
          >
            {tab.icon}
            <span className={`text-[9px] font-mono tracking-wider
                              ${active ? 'text-white' : 'text-white/35'}`}>
              {tab.label.toUpperCase()}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
