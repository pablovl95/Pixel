import { useState } from 'react';
import { getPixelInfo, STATUS_LABEL, STATUS_COLOR, STATUS } from '../data/pixels';
import { byNewest, byPriceAsc } from '../data/marketListings';

const MINI_COUNT = 6;

// Deterministic fake owner from pixel index
function fakeOwner(x, y, gridSize = 1000) {
  const i = y * gridSize + x;
  return `User${((i * 6271 + 1337) % 9999) + 1}`;
}

function hexColor(r, g, b) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

// ─── Pixel detail section ──────────────────────────────────────────────────
function PixelDetails({ hoveredPixel }) {
  if (!hoveredPixel) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-white/20 text-xs font-mono">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="1.2" className="mb-2 opacity-40">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <path d="M3 9h18M9 21V9"/>
        </svg>
        Hover a pixel
      </div>
    );
  }

  const { x, y, r, g, b, status, price, color } = getPixelInfo(hoveredPixel.x, hoveredPixel.y);
  const hex    = hexColor(r, g, b);
  const label  = STATUS_LABEL[status];
  const accent = STATUS_COLOR[status];
  const owner  = status !== STATUS.FREE ? fakeOwner(x, y) : null;

  return (
    <div className="flex flex-col gap-3">
      {/* header */}
      <div className="flex items-center justify-between">
        <span className="text-white/40 text-[10px] font-mono uppercase tracking-widest">
          Pixel Details
        </span>
        <span className="text-white/60 text-[10px] font-mono">({x}, {y})</span>
      </div>

      {/* color swatch */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded border border-white/15 shrink-0"
             style={{ backgroundColor: color }} />
        <div>
          <p className="text-white font-mono text-sm">{hex.toUpperCase()}</p>
          <p className="text-white/30 text-[10px] font-mono">rgb({r},{g},{b})</p>
        </div>
      </div>

      {/* fields */}
      <div className="flex flex-col gap-1.5 text-xs font-mono">
        {owner && (
          <div className="flex items-center justify-between">
            <span className="text-white/40">Owner</span>
            <span className="text-white/80">{owner}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-white/40">Status</span>
          <span className="flex items-center gap-1.5" style={{ color: accent }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
            {label}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white/40">Price</span>
          <span className="text-white">
            {status === STATUS.FOR_SALE
              ? `€${price.toFixed(2)}`
              : status === STATUS.FREE
              ? '€0.99 (base)'
              : '—'}
          </span>
        </div>
      </div>

      {/* actions */}
      {status !== STATUS.OWNED && (
        <div className="flex gap-2 pt-1">
          {status === STATUS.FREE && (
            <button className="flex-1 py-1.5 rounded text-[11px] font-mono font-semibold
                               bg-blue-600 hover:bg-blue-500 text-white transition-colors">
              BUY €0.99
            </button>
          )}
          {status === STATUS.FOR_SALE && (
            <>
              <button className="flex-1 py-1.5 rounded text-[11px] font-mono font-semibold
                                 bg-green-600 hover:bg-green-500 text-white transition-colors">
                BUY €{price.toFixed(2)}
              </button>
              <button className="flex-1 py-1.5 rounded text-[11px] font-mono font-semibold
                                 bg-white/[0.06] hover:bg-white/[0.12] border border-white/15
                                 text-white/70 hover:text-white transition-colors">
                OFFER
              </button>
            </>
          )}
        </div>
      )}
      {status === STATUS.OWNED && (
        <div className="flex gap-2 pt-1">
          <button className="flex-1 py-1.5 rounded text-[11px] font-mono font-semibold
                             bg-white/[0.06] hover:bg-white/[0.12] border border-white/15
                             text-white/70 hover:text-white transition-colors">
            MODIFY COLOR
          </button>
          <button className="flex-1 py-1.5 rounded text-[11px] font-mono font-semibold
                             bg-white/[0.06] hover:bg-white/[0.12] border border-white/15
                             text-white/70 hover:text-white transition-colors">
            LIST FOR SALE
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Mini market row ───────────────────────────────────────────────────────
function MiniRow({ item, onJump }) {
  const color = `rgb(${item.r},${item.g},${item.b})`;
  return (
    <button
      onClick={() => onJump(item.x, item.y)}
      className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-white/[0.05]
                 transition-colors w-full text-left group"
    >
      <div className="w-4 h-4 rounded-sm shrink-0 border border-white/10"
           style={{ backgroundColor: color }} />
      <span className="text-white/50 text-[10px] font-mono flex-1">
        {fakeOwner(item.x, item.y)} ({item.x},{item.y})
      </span>
      <span className="text-white text-[10px] font-mono font-semibold shrink-0">
        €{item.price.toFixed(2)}
      </span>
      <svg width="9" height="9" viewBox="0 0 16 16" fill="none"
           stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
           className="text-white/20 group-hover:text-white/60 transition-colors shrink-0">
        <path d="M8 3H3v10h10V8"/><path d="M11 2h3v3M14 2l-6 6"/>
      </svg>
    </button>
  );
}

// ─── Panel content (shared between desktop sidebar and mobile sheet) ────────
function PanelContent({ hoveredPixel, onJump }) {
  const [miniSort, setMiniSort] = useState('newest');
  const listings = miniSort === 'newest' ? byNewest : byPriceAsc;

  return (
    <>
      {/* Pixel details */}
      <div className="px-3 pt-3 pb-3 border-b border-white/[0.07]">
        <PixelDetails hoveredPixel={hoveredPixel} />
      </div>

      {/* Mini market list */}
      <div className="flex flex-col flex-1 px-2 pt-2 pb-3">
        <div className="flex items-center justify-between px-1 mb-2">
          <span className="text-white/40 text-[10px] font-mono uppercase tracking-widest">
            Marketplace
          </span>
          <div className="flex gap-0.5">
            {['newest', 'cheapest'].map(s => (
              <button
                key={s}
                onClick={() => setMiniSort(s)}
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono border transition-all
                  ${miniSort === s
                    ? 'bg-white/10 text-white border-white/25'
                    : 'text-white/30 border-white/[0.07] hover:text-white/60'}`}
              >
                {s === 'newest' ? 'New' : '€ Low'}
              </button>
            ))}
          </div>
        </div>

        <p className="text-white/25 text-[9px] font-mono px-1 mb-1 uppercase tracking-widest">
          {miniSort === 'newest' ? 'Newly listed' : 'Lowest price'}
        </p>

        {listings.slice(0, MINI_COUNT).map(item => (
          <MiniRow key={item.i} item={item} onJump={onJump} />
        ))}

        <button className="mt-2 text-[10px] font-mono text-white/30 hover:text-white/60
                           transition-colors text-center py-1">
          View all listings →
        </button>
      </div>
    </>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────
export default function RightPanel({ hoveredPixel, onJump, mobileOpen, onMobileClose }) {
  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-[280px] shrink-0 h-full flex-col
                        border-l border-white/[0.08] bg-black/80 backdrop-blur-sm overflow-y-auto">
        <PanelContent hoveredPixel={hoveredPixel} onJump={onJump} />
      </aside>

      {/* ── Mobile bottom sheet ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onMobileClose}
        />
      )}
      <aside className={[
        'md:hidden fixed bottom-0 left-0 right-0 z-50 flex flex-col',
        'bg-black/90 backdrop-blur-md rounded-t-2xl border-t border-x border-white/[0.12]',
        'max-h-[80vh] overflow-y-auto',
        'transition-transform duration-300 ease-in-out',
        mobileOpen ? 'translate-y-0' : 'translate-y-full',
      ].join(' ')}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>

        {/* drag handle */}
        <div className="flex justify-center pt-2.5 pb-1 shrink-0">
          <div className="w-8 h-1 rounded-full bg-white/20" />
        </div>

        <PanelContent hoveredPixel={hoveredPixel} onJump={onJump} />
      </aside>
    </>
  );
}
