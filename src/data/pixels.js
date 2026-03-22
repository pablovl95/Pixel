// ─── Static pixel data ─────────────────────────────────────────────────────
// Generates a 1000x1000 grid (1,000,000 pixels) with realistic-looking data.
// Each pixel has: RGBA color + status (free / owned / for_sale) + price.

export const GRID_SIZE  = 1000;
export const TOTAL      = GRID_SIZE * GRID_SIZE;

export const STATUS = { FREE: 0, OWNED: 1, FOR_SALE: 2 };

// RGBA buffer — used directly with ImageData for fast canvas rendering
export const pixelBuffer = new Uint8ClampedArray(TOTAL * 4);
export const pixelStatus = new Uint8Array(TOTAL);
export const pixelPrice  = new Float32Array(TOTAL); // 0 = not for sale

// ─── Simple pseudo-random (seeded) ────────────────────────────────────────
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42);

// ─── "Art zones" — rectangular blobs of similar hue ──────────────────────
const ZONES = [
  { x: 50,  y: 50,  w: 200, h: 150, hue: 210, sat: 80 },  // blue cluster
  { x: 300, y: 100, w: 120, h: 120, hue: 340, sat: 70 },  // pink cluster
  { x: 600, y: 200, w: 180, h: 250, hue: 140, sat: 65 },  // green cluster
  { x: 150, y: 400, w: 250, h: 100, hue: 30,  sat: 75 },  // orange cluster
  { x: 700, y: 500, w: 200, h: 200, hue: 270, sat: 70 },  // purple cluster
  { x: 400, y: 600, w: 300, h: 150, hue: 0,   sat: 75 },  // red cluster
  { x: 100, y: 700, w: 150, h: 200, hue: 60,  sat: 80 },  // yellow cluster
  { x: 600, y: 750, w: 250, h: 200, hue: 185, sat: 70 },  // cyan cluster
  { x: 800, y: 50,  w: 150, h: 300, hue: 15,  sat: 65 },  // amber cluster
  { x: 450, y: 350, w: 100, h: 100, hue: 300, sat: 85 },  // magenta cluster
];

// Check if a pixel falls inside a zone
function getZone(px, py) {
  for (const z of ZONES) {
    if (px >= z.x && px < z.x + z.w && py >= z.y && py < z.y + z.h) return z;
  }
  return null;
}

// Convert HSL to RGB
function hslToRgb(h, s, l) {
  s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

// ─── Generate pixel data ───────────────────────────────────────────────────
for (let i = 0; i < TOTAL; i++) {
  const px = i % GRID_SIZE;
  const py = Math.floor(i / GRID_SIZE);
  const zone = getZone(px, py);

  const r4 = rand();   // for status
  const r5 = rand();   // for lightness variation
  const r6 = rand();   // for price

  let red, green, blue, status;

  if (zone) {
    // Inside a zone — high chance of owned/for_sale, themed color
    const lightness = 35 + r5 * 30;
    const hueJitter = zone.hue + (rand() - 0.5) * 30;
    [red, green, blue] = hslToRgb(hueJitter, zone.sat, lightness);

    if (r4 < 0.10) {
      status = STATUS.FREE;
    } else if (r4 < 0.70) {
      status = STATUS.OWNED;
    } else {
      status = STATUS.FOR_SALE;
      pixelPrice[i] = parseFloat((0.99 + r6 * 49).toFixed(2));
    }
  } else {
    // Outside zones — mostly free, dark grey
    if (r4 < 0.65) {
      status = STATUS.FREE;
      red = green = blue = 22 + Math.floor(r5 * 12);
    } else if (r4 < 0.88) {
      status = STATUS.OWNED;
      const hue = rand() * 360;
      [red, green, blue] = hslToRgb(hue, 50 + rand() * 30, 30 + rand() * 25);
    } else {
      status = STATUS.FOR_SALE;
      const hue = rand() * 360;
      [red, green, blue] = hslToRgb(hue, 50 + rand() * 30, 30 + rand() * 25);
      pixelPrice[i] = parseFloat((0.99 + r6 * 19).toFixed(2));
    }
  }

  pixelStatus[i] = status;

  const base = i * 4;
  pixelBuffer[base]     = red;
  pixelBuffer[base + 1] = green;
  pixelBuffer[base + 2] = blue;
  pixelBuffer[base + 3] = 255;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

export function getPixelIndex(x, y) {
  return y * GRID_SIZE + x;
}

export function getPixelInfo(x, y) {
  const i = getPixelIndex(x, y);
  const base = i * 4;
  return {
    x, y,
    r: pixelBuffer[base],
    g: pixelBuffer[base + 1],
    b: pixelBuffer[base + 2],
    status: pixelStatus[i],
    price: pixelPrice[i],
    color: `rgb(${pixelBuffer[base]},${pixelBuffer[base + 1]},${pixelBuffer[base + 2]})`,
  };
}

export const STATUS_LABEL = ['Free', 'Owned', 'For Sale'];
export const STATUS_COLOR = ['#6b7280', '#3b82f6', '#22c55e'];
