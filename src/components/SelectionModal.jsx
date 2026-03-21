import { useState, useMemo } from 'react';
import { pixelStatus, pixelPrice, GRID_SIZE, STATUS } from '../data/pixels';

const BASE_PRICE = 0.99;

// ─── Analyze pixels inside the selection rect ────────────────────────────
function analyzeRect({ x0, y0, x1, y1 }) {
  const free    = [];
  const forSale = [];
  const owned   = [];

  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const i = y * GRID_SIZE + x;
      const s = pixelStatus[i];
      if      (s === STATUS.FREE)     free.push(i);
      else if (s === STATUS.FOR_SALE) forSale.push({ i, price: pixelPrice[i] });
      else                            owned.push(i);
    }
  }
  return { free, forSale, owned };
}

// ─── Row component ────────────────────────────────────────────────────────
function Row({ label, count, total, accent, children }) {
  if (count === 0) return null;
  return (
    <div className="flex flex-col gap-2 py-3 border-b border-white/[0.07]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: accent }} />
          <span className="text-white font-medium">{label}</span>
          <span className="text-white/40 text-sm font-mono">{count.toLocaleString()} px</span>
        </div>
        <span className="text-white font-mono font-semibold">€{total.toFixed(2)}</span>
      </div>
      {children}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────
export default function SelectionModal({ selection, onClose }) {
  const [offerPrice, setOfferPrice] = useState('');

  const { free, forSale, owned } = useMemo(
    () => analyzeRect(selection),
    [selection]
  );

  const totalPixels   = (selection.x1 - selection.x0 + 1) * (selection.y1 - selection.y0 + 1);
  const freeTotal     = free.length    * BASE_PRICE;
  const forSaleTotal  = forSale.reduce((acc, p) => acc + p.price, 0);
  const offerPerPixel = parseFloat(offerPrice) || 0;
  const offerTotal    = owned.length * offerPerPixel;
  const grandTotal    = freeTotal + forSaleTotal + offerTotal;

  const avgForSale = forSale.length > 0
    ? (forSaleTotal / forSale.length).toFixed(2)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
         onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>

      <div className="bg-[#161616] border border-white/[0.10] rounded-2xl shadow-2xl w-full max-w-md mx-4
                      flex flex-col max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-white/[0.07]">
          <div>
            <h2 className="text-white font-bold text-lg">Zone Selection</h2>
            <p className="text-white/40 text-sm font-mono mt-0.5">
              {selection.x1 - selection.x0 + 1}×{selection.y1 - selection.y0 + 1}
              {' '}·{' '}
              <span className="text-white/60">{totalPixels.toLocaleString()} pixels</span>
              {' '}·{' '}
              ({selection.x0}, {selection.y0}) → ({selection.x1}, {selection.y1})
            </p>
          </div>
          <button onClick={onClose}
                  className="text-white/30 hover:text-white transition-colors text-xl leading-none mt-0.5">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-5 flex-1">

          {/* Free pixels */}
          <Row label="Buy directly (free)" count={free.length} total={freeTotal} accent="#6b7280">
            <p className="text-white/40 text-xs ml-4">
              Base price €{BASE_PRICE} per pixel
            </p>
          </Row>

          {/* For-sale pixels */}
          <Row label="Buy directly (listed)" count={forSale.length} total={forSaleTotal} accent="#22c55e">
            <p className="text-white/40 text-xs ml-4">
              Avg listed price: €{avgForSale} per pixel
            </p>
          </Row>

          {/* Owned pixels — need offer */}
          <Row label="Send offer (owned)" count={owned.length} total={offerTotal} accent="#f59e0b">
            <div className="ml-4 flex flex-col gap-2">
              <p className="text-white/40 text-xs">
                Set your offer price — applied to all {owned.length.toLocaleString()} owned pixels
              </p>
              <div className="flex items-center gap-2">
                <span className="text-white/40 text-sm">€</span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  className="bg-white/[0.06] border border-white/[0.12] rounded-lg px-3 py-1.5
                             text-white text-sm font-mono w-28 focus:outline-none
                             focus:border-yellow-400/50 transition-colors"
                />
                <span className="text-white/30 text-xs">per pixel</span>
                {offerPerPixel > 0 && (
                  <span className="text-yellow-400 text-xs font-mono ml-auto">
                    = €{offerTotal.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </Row>

          {/* Empty selection */}
          {free.length === 0 && forSale.length === 0 && owned.length === 0 && (
            <p className="text-white/30 text-sm text-center py-6">No pixels in selection</p>
          )}
        </div>

        {/* Footer — totals + actions */}
        <div className="px-5 py-4 border-t border-white/[0.07] flex flex-col gap-3">

          {/* Total summary */}
          <div className="flex flex-col gap-1 text-sm font-mono">
            {free.length > 0 && (
              <div className="flex justify-between text-white/50">
                <span>{free.length.toLocaleString()} free</span>
                <span>€{freeTotal.toFixed(2)}</span>
              </div>
            )}
            {forSale.length > 0 && (
              <div className="flex justify-between text-white/50">
                <span>{forSale.length.toLocaleString()} for sale</span>
                <span>€{forSaleTotal.toFixed(2)}</span>
              </div>
            )}
            {owned.length > 0 && offerPerPixel > 0 && (
              <div className="flex justify-between text-yellow-400/70">
                <span>{owned.length.toLocaleString()} offers @ €{offerPerPixel.toFixed(2)}</span>
                <span>€{offerTotal.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-white font-bold pt-1 border-t border-white/[0.07]">
              <span>Total</span>
              <span className="text-white">€{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            {(free.length > 0 || forSale.length > 0) && (
              <button
                className="flex-1 bg-blue-600 hover:bg-blue-500 active:bg-blue-700
                           text-white text-sm font-semibold rounded-lg py-2 transition-colors"
                onClick={() => console.log('Buy', { free: free.length, forSale: forSale.length })}
              >
                Buy {(free.length + forSale.length).toLocaleString()} pixels
              </button>
            )}
            {owned.length > 0 && offerPerPixel > 0 && (
              <button
                className="flex-1 bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600
                           text-black text-sm font-semibold rounded-lg py-2 transition-colors"
                onClick={() => console.log('Offer', { owned: owned.length, offerPerPixel })}
              >
                Send {owned.length.toLocaleString()} offers
              </button>
            )}
            {owned.length > 0 && !offerPerPixel && (
              <div className="flex-1 text-center text-white/30 text-xs py-2">
                Set an offer price to send offers
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
