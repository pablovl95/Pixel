export default function MyPixelsPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-[#0d0d0d] flex flex-col items-center justify-center gap-4">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"
           className="text-white/15">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M3 9h18M9 21V9"/>
      </svg>
      <div className="text-center">
        <p className="text-white/40 font-mono text-sm">My Pixels</p>
        <p className="text-white/20 font-mono text-xs mt-1">Coming soon</p>
      </div>
    </div>
  );
}
