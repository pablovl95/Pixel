import { useState, useMemo, useCallback } from 'react';
import { SORTED, SORT_OPTIONS, listings } from '../data/marketListings';

const PAGE_SIZE = 30;

// ─── Relative time helper ──────────────────────────────────────────────────
function relativeTime(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60)    return `${s}s ago`;
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

// ─── Single listing row ────────────────────────────────────────────────────
function ListingRow({ item, onJump }) {
  const color = `rgb(${item.r},${item.g},${item.b})`;
  return (
    <div className="flex items-center gap-2.5 py-2 px-3 rounded-lg bg-white/[0.03]
                    border border-white/[0.06] hover:border-white/[0.14] transition-colors group">
      {/* color swatch */}
      <div
        className="w-6 h-6 rounded-sm shrink-0 border border-white/10"
        style={{ backgroundColor: color }}
      />

      {/* coords */}
      <div className="flex-1 min-w-0">
        <p className="text-white/70 text-xs font-mono leading-none">
          ({item.x}, {item.y})
        </p>
        <p className="text-white/25 text-[10px] font-mono mt-0.5">
          {relativeTime(item.listedAt)}
        </p>
      </div>

      {/* price */}
      <span className="text-white font-mono text-sm font-semibold shrink-0">
        €{item.price.toFixed(2)}
      </span>

      {/* actions */}
      <div className="flex gap-1 shrink-0">
        <button
          onClick={() => onJump(item.x, item.y)}
          title="Go to pixel"
          className="w-6 h-6 flex items-center justify-center rounded
                     text-white/30 hover:text-white/80 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none"
               stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M8 3H3v10h10V8"/>
            <path d="M11 2h3v3M14 2l-6 6"/>
          </svg>
        </button>
        <button
          onClick={() => console.log('buy', item.i)}
          className="px-2 py-0.5 rounded text-[10px] font-mono font-medium
                     bg-white/[0.06] hover:bg-white/[0.14] text-white/60 hover:text-white
                     border border-white/[0.10] hover:border-white/30 transition-all"
        >
          Buy
        </button>
      </div>
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────
export default function MarketPanel({ open, onClose, onJump }) {
  const [sort,    setSort]    = useState('byPriceAsc');
  const [search,  setSearch]  = useState('');    // "x,y" filter
  const [page,    setPage]    = useState(0);
  const [maxPrice, setMaxPrice] = useState('');

  const filtered = useMemo(() => {
    let list = SORTED[sort];

    if (maxPrice !== '') {
      const cap = parseFloat(maxPrice);
      if (!isNaN(cap)) list = list.filter(l => l.price <= cap);
    }

    if (search.trim()) {
      const parts = search.split(',').map(s => parseInt(s.trim(), 10));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        const [fx, fy] = parts;
        const radius = 20;
        list = list.filter(l => Math.abs(l.x - fx) <= radius && Math.abs(l.y - fy) <= radius);
      }
    }

    return list;
  }, [sort, search, maxPrice]);

  // reset page when filters change
  const handleSort = useCallback((k) => { setSort(k); setPage(0); }, []);
  const handleSearch = useCallback((v) => { setSearch(v); setPage(0); }, []);
  const handleMaxPrice = useCallback((v) => { setMaxPrice(v); setPage(0); }, []);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems  = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <>
      {/* mobile backdrop */}
      {open && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={onClose} />
      )}

      <aside className={[
        'bg-black/80 backdrop-blur-sm flex flex-col text-white',
        'md:relative md:w-72 md:shrink-0 md:h-full md:border-l md:border-white/[0.08] md:translate-y-0 md:z-auto md:rounded-none',
        'fixed bottom-0 left-0 right-0 z-40 max-h-[80vh]',
        'rounded-t-2xl border-t border-x border-white/[0.12]',
        'transition-transform duration-300 ease-in-out',
        open ? 'translate-y-0' : 'translate-y-full md:translate-y-0',
      ].join(' ')}>

        {/* drag handle */}
        <div className="md:hidden flex justify-center pt-2 pb-1 shrink-0">
          <div className="w-8 h-1 rounded-full bg-white/20" />
        </div>

        {/* header */}
        <div className="px-3 pt-2 pb-2 border-b border-white/[0.07] shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-white font-mono text-sm font-semibold">Market</span>
              <span className="text-white/30 text-[10px] font-mono ml-2">
                {filtered.length.toLocaleString()} listings
              </span>
            </div>
          </div>

          {/* Sort pills */}
          <div className="flex gap-1 flex-wrap">
            {SORT_OPTIONS.map(o => (
              <button
                key={o.key}
                onClick={() => handleSort(o.key)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all
                  ${sort === o.key
                    ? 'bg-white/10 text-white border-white/30'
                    : 'text-white/40 border-white/[0.08] hover:text-white/70 hover:border-white/20'}`}
              >
                {o.label}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="flex gap-1.5 mt-2">
            <input
              type="number"
              placeholder="Max €"
              value={maxPrice}
              onChange={e => handleMaxPrice(e.target.value)}
              className="w-20 px-2 py-1 rounded bg-white/[0.05] border border-white/[0.10]
                         text-white text-xs font-mono placeholder:text-white/20
                         focus:outline-none focus:border-white/30 transition-colors"
            />
            <input
              type="text"
              placeholder="x, y  ±20px"
              value={search}
              onChange={e => handleSearch(e.target.value)}
              className="flex-1 px-2 py-1 rounded bg-white/[0.05] border border-white/[0.10]
                         text-white text-xs font-mono placeholder:text-white/20
                         focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>
        </div>

        {/* listing list */}
        <div className="flex-1 overflow-y-auto px-2 py-2 flex flex-col gap-1">
          {pageItems.length === 0 ? (
            <p className="text-white/25 text-xs font-mono text-center py-8">
              No listings match the filters
            </p>
          ) : (
            pageItems.map(item => (
              <ListingRow key={item.i} item={item} onJump={onJump} />
            ))
          )}
        </div>

        {/* pagination */}
        {totalPages > 1 && (
          <div className="shrink-0 flex items-center justify-between px-3 py-2
                          border-t border-white/[0.07] text-xs font-mono text-white/40">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="hover:text-white disabled:opacity-30 transition-colors px-1"
            >
              ← prev
            </button>
            <span>{page + 1} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="hover:text-white disabled:opacity-30 transition-colors px-1"
            >
              next →
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
