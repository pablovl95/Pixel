import { useState, useMemo, useCallback } from 'react';
import { SORTED, SORT_OPTIONS, listings } from '../data/marketListings';

const PAGE_SIZE = 40;

function relativeTime(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60)    return `${s}s ago`;
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function ListingCard({ item, onJump }) {
  const color = `rgb(${item.r},${item.g},${item.b})`;
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl
                    bg-white/[0.03] border border-white/[0.07]
                    hover:border-white/20 hover:bg-white/[0.06] transition-all group">
      <div className="w-10 h-10 rounded-lg shrink-0 border border-white/10"
           style={{ backgroundColor: color }} />
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-mono">({item.x}, {item.y})</p>
        <p className="text-white/30 text-xs font-mono">{relativeTime(item.listedAt)}</p>
      </div>
      <span className="text-white font-mono font-bold text-base shrink-0">
        €{item.price.toFixed(2)}
      </span>
      <div className="flex gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onJump(item.x, item.y)}
          className="px-3 py-1.5 rounded-lg text-xs font-mono
                     bg-white/[0.08] hover:bg-white/[0.15] border border-white/15
                     text-white/60 hover:text-white transition-all"
        >
          Go to
        </button>
        <button
          className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold
                     bg-white hover:bg-white/90 text-black transition-colors"
        >
          Buy
        </button>
      </div>
    </div>
  );
}

export default function MarketPage({ onJump }) {
  const [sort,     setSort]     = useState('byPriceAsc');
  const [maxPrice, setMaxPrice] = useState('');
  const [search,   setSearch]   = useState('');
  const [page,     setPage]     = useState(0);

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
        list = list.filter(l => Math.abs(l.x - fx) <= 30 && Math.abs(l.y - fy) <= 30);
      }
    }
    return list;
  }, [sort, maxPrice, search]);

  const handleSort     = useCallback((k) => { setSort(k); setPage(0); }, []);
  const handleMaxPrice = useCallback((v) => { setMaxPrice(v); setPage(0); }, []);
  const handleSearch   = useCallback((v) => { setSearch(v); setPage(0); }, []);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems  = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-[#0d0d0d]">

      {/* Page header */}
      <div className="shrink-0 px-6 py-5 border-b border-white/[0.07]">
        <h1 className="text-white font-bold text-xl tracking-tight">Marketplace</h1>
        <p className="text-white/30 text-sm font-mono mt-0.5">
          {listings.length.toLocaleString()} pixels for sale
        </p>
      </div>

      {/* Filters bar */}
      <div className="shrink-0 flex flex-wrap items-center gap-2 px-6 py-3
                      border-b border-white/[0.07] bg-black/30">
        {/* Sort pills */}
        <div className="flex gap-1.5 flex-wrap">
          {SORT_OPTIONS.map(o => (
            <button
              key={o.key}
              onClick={() => handleSort(o.key)}
              className={`px-3 py-1 rounded-lg text-xs font-mono border transition-all
                ${sort === o.key
                  ? 'bg-white/10 text-white border-white/30'
                  : 'text-white/40 border-white/[0.08] hover:text-white/70 hover:border-white/20'}`}
            >
              {o.label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Filters */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Max €"
            value={maxPrice}
            onChange={e => handleMaxPrice(e.target.value)}
            className="w-24 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.10]
                       text-white text-xs font-mono placeholder:text-white/20
                       focus:outline-none focus:border-white/30 transition-colors"
          />
          <input
            type="text"
            placeholder="x, y  ±30px"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            className="w-36 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.10]
                       text-white text-xs font-mono placeholder:text-white/20
                       focus:outline-none focus:border-white/30 transition-colors"
          />
        </div>

        <span className="text-white/30 text-xs font-mono">
          {filtered.length.toLocaleString()} results
        </span>
      </div>

      {/* Listing grid */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {pageItems.length === 0 ? (
          <div className="flex items-center justify-center h-full text-white/20 text-sm font-mono">
            No listings match the filters
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {pageItems.map(item => (
              <ListingCard key={item.i} item={item} onJump={onJump} />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="shrink-0 flex items-center justify-center gap-3 py-4
                        border-t border-white/[0.07] text-sm font-mono text-white/40">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.10]
                       disabled:opacity-30 transition-colors"
          >
            ← Prev
          </button>
          <span className="text-white/50">{page + 1} / {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="px-4 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.10]
                       disabled:opacity-30 transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
