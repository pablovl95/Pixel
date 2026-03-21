// ─── Static market statistics ──────────────────────────────────────────────
// Simulates realistic market data for the pixel marketplace.

import { TOTAL, pixelStatus, pixelPrice, STATUS } from './pixels.js';

// ─── Seeded random (different seed from pixels) ───────────────────────────
function rand32(seed) {
  return function () {
    seed |= 0; seed = seed + 0x9e3779b9 | 0;
    let t = seed ^ seed >>> 16;
    t = Math.imul(t, 0x85ebca6b);
    t ^= t >>> 13;
    t = Math.imul(t, 0xc2b2ae35);
    t ^= t >>> 16;
    return (t >>> 0) / 4294967296;
  };
}
const r = rand32(7);

// ─── Live stats from pixel data ───────────────────────────────────────────
export const liveStats = (() => {
  let free = 0, owned = 0, forSale = 0, totalValue = 0, maxPrice = 0, txCount = 0;
  for (let i = 0; i < TOTAL; i++) {
    const s = pixelStatus[i];
    if      (s === STATUS.FREE)     free++;
    else if (s === STATUS.OWNED)    { owned++;   txCount++; }
    else if (s === STATUS.FOR_SALE) { forSale++;  txCount++; totalValue += pixelPrice[i]; if (pixelPrice[i] > maxPrice) maxPrice = pixelPrice[i]; }
  }
  const sold = owned + forSale;
  return {
    free,
    owned,
    forSale,
    sold,
    total: TOTAL,
    pctSold:   ((sold / TOTAL) * 100).toFixed(2),
    avgPrice:  sold > 0 ? (totalValue / forSale).toFixed(2) : '0.00',
    maxPrice:  maxPrice.toFixed(2),
    totalVolume: (sold * 0.99 + totalValue).toFixed(0),
  };
})();

// ─── Historical daily data (last 60 days) ────────────────────────────────
const DAYS = 60;

export const dailyData = Array.from({ length: DAYS }, (_, i) => {
  const date = new Date('2026-03-21');
  date.setDate(date.getDate() - (DAYS - 1 - i));

  // Simulate organic growth with some spikes
  const base      = 800 + i * 18;
  const spike     = r() > 0.88 ? r() * 3000 : 0;
  const sales     = Math.round(base + r() * 400 + spike);
  const avgPx     = 0.99 + r() * 8 + (i / DAYS) * 12;  // price trending up
  const volume    = (sales * avgPx).toFixed(2);

  return {
    date: date.toISOString().slice(0, 10),
    label: date.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    sales,
    avgPrice: parseFloat(avgPx.toFixed(2)),
    volume:   parseFloat(volume),
  };
});

// ─── Last 12 months summary ───────────────────────────────────────────────
export const monthlyData = Array.from({ length: 12 }, (_, i) => {
  const date = new Date('2026-03-01');
  date.setMonth(date.getMonth() - (11 - i));
  const sales   = Math.round(12000 + i * 3500 + r() * 5000);
  const avgPrice = 0.99 + i * 1.4 + r() * 3;
  return {
    label: date.toLocaleDateString('en', { month: 'short' }),
    sales,
    avgPrice: parseFloat(avgPrice.toFixed(2)),
    volume:   parseFloat((sales * avgPrice).toFixed(2)),
  };
});

// Today + yesterday for delta indicators
export const today     = dailyData[DAYS - 1];
export const yesterday = dailyData[DAYS - 2];
