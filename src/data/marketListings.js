// ─── Precomputed market listings ───────────────────────────────────────────
// Built once at module load from the pixel data arrays.

import { pixelStatus, pixelPrice, pixelBuffer, GRID_SIZE, STATUS } from './pixels.js';

function seededRand(seed) {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const r = seededRand(123);

// ─── Build raw listings ────────────────────────────────────────────────────
const NOW = Date.now();

export const listings = [];
for (let i = 0; i < pixelStatus.length; i++) {
  if (pixelStatus[i] !== STATUS.FOR_SALE) continue;
  const base = i * 4;
  listings.push({
    i,
    x:        i % GRID_SIZE,
    y:        Math.floor(i / GRID_SIZE),
    price:    pixelPrice[i],
    r:        pixelBuffer[base],
    g:        pixelBuffer[base + 1],
    b:        pixelBuffer[base + 2],
    listedAt: NOW - r() * 30 * 86_400_000,   // random within last 30 days
  });
}

// ─── Pre-sorted views (computed once) ────────────────────────────────────
export const byPriceAsc  = [...listings].sort((a, b) => a.price    - b.price);
export const byPriceDesc = [...listings].sort((a, b) => b.price    - a.price);
export const byNewest    = [...listings].sort((a, b) => b.listedAt - a.listedAt);
export const byOldest    = [...listings].sort((a, b) => a.listedAt - b.listedAt);

export const SORT_OPTIONS = [
  { key: 'byPriceAsc',  label: 'Cheapest'  },
  { key: 'byPriceDesc', label: 'Most exp.' },
  { key: 'byNewest',    label: 'Newest'    },
  { key: 'byOldest',    label: 'Oldest'    },
];

export const SORTED = { byPriceAsc, byPriceDesc, byNewest, byOldest };
