import { useRef, useEffect, useCallback } from 'react';
import { pixelBuffer, GRID_SIZE } from '../data/pixels';

const MAP_DESKTOP = 160;

let minimapOffscreen = null;
function getOffscreen() {
  if (minimapOffscreen) return minimapOffscreen;
  minimapOffscreen = document.createElement('canvas');
  minimapOffscreen.width  = GRID_SIZE;
  minimapOffscreen.height = GRID_SIZE;
  minimapOffscreen.getContext('2d')
    .putImageData(new ImageData(pixelBuffer, GRID_SIZE, GRID_SIZE), 0, 0);
  return minimapOffscreen;
}

export default function Minimap({ cam, onClick }) {
  const ref    = useRef(null);
  const camRef = useRef(cam);
  const dragRef = useRef(null); // { grabOffX, grabOffY, pointerId }

  useEffect(() => { camRef.current = cam; }, [cam]);

  // ── dibujo ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !cam) return;
    const ctx = canvas.getContext('2d');

    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(getOffscreen(), 0, 0, MAP_DESKTOP, MAP_DESKTOP);

    const { scale, offsetX, offsetY, canvasW = 800, canvasH = 600 } = cam;
    const ratio = MAP_DESKTOP / GRID_SIZE;

    const rx = offsetX * ratio;
    const ry = offsetY * ratio;
    const rw = (canvasW / scale) * ratio;
    const rh = (canvasH / scale) * ratio;

    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(0,       0,       MAP_DESKTOP, ry);
    ctx.fillRect(0,       ry + rh, MAP_DESKTOP, MAP_DESKTOP - ry - rh);
    ctx.fillRect(0,       ry,      rx,          rh);
    ctx.fillRect(rx + rw, ry,      MAP_DESKTOP - rx - rw, rh);

    ctx.strokeStyle = '#fff';
    ctx.lineWidth   = 1.5;
    const half = 0.75;
    const sx = Math.max(rx, half);
    const sy = Math.max(ry, half);
    const ex = Math.min(rx + rw, MAP_DESKTOP - half);
    const ey = Math.min(ry + rh, MAP_DESKTOP - half);
    ctx.strokeRect(sx, sy, Math.max(ex - sx, 3), Math.max(ey - sy, 3));
  }, [cam]);

  // ── helpers ───────────────────────────────────────────────────────────────
  // Convierte coordenada del canvas DOM (que puede estar escalado) → coord interna MAP_DESKTOP
  function domToInternal(domX, domY) {
    const canvas = ref.current;
    const rect   = canvas.getBoundingClientRect();
    return {
      mx: (domX - rect.left)  * (MAP_DESKTOP / rect.width),
      my: (domY - rect.top)   * (MAP_DESKTOP / rect.height),
    };
  }

  function getViewportRect(c) {
    const { scale, offsetX, offsetY, canvasW = 800, canvasH = 600 } = c;
    const ratio = MAP_DESKTOP / GRID_SIZE;
    return {
      rx: offsetX * ratio,
      ry: offsetY * ratio,
      rw: (canvasW / scale) * ratio,
      rh: (canvasH / scale) * ratio,
    };
  }

  function internalToGrid(mx, my) {
    return {
      gx: (mx / MAP_DESKTOP) * GRID_SIZE,
      gy: (my / MAP_DESKTOP) * GRID_SIZE,
    };
  }

  // ── pointer events (mouse + touch + stylus) ───────────────────────────────
  const handlePointerDown = useCallback((e) => {
    const canvas = ref.current;
    if (!canvas || !camRef.current) return;

    e.preventDefault();
    canvas.setPointerCapture(e.pointerId); // mantiene el drag aunque salga del elemento

    const { mx, my } = domToInternal(e.clientX, e.clientY);
    const { rx, ry, rw, rh } = getViewportRect(camRef.current);
    const insideRect = mx >= rx && mx <= rx + rw && my >= ry && my <= ry + rh;

    if (insideRect) {
      const cx = rx + rw / 2;
      const cy = ry + rh / 2;
      dragRef.current = { grabOffX: mx - cx, grabOffY: my - cy };
    } else {
      const { gx, gy } = internalToGrid(mx, my);
      onClick?.(gx, gy);
      dragRef.current = { grabOffX: 0, grabOffY: 0 };
    }
  }, [onClick]);

  const handlePointerMove = useCallback((e) => {
    if (!dragRef.current) return;
    e.preventDefault();

    const { mx, my } = domToInternal(e.clientX, e.clientY);
    const newCx = mx - dragRef.current.grabOffX;
    const newCy = my - dragRef.current.grabOffY;
    const { gx, gy } = internalToGrid(newCx, newCy);
    onClick?.(gx, gy);
  }, [onClick]);

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  return (
    <div
      className="absolute bottom-4 right-4 rounded-lg overflow-hidden border border-white/20 shadow-2xl
                 touch-none select-none"
      // móvil: 120px · escritorio: 160px
      style={{ width: MAP_DESKTOP, height: MAP_DESKTOP }}
    >
      <canvas
        ref={ref}
        width={MAP_DESKTOP}
        height={MAP_DESKTOP}
        className="w-full h-full"
        style={{ cursor: dragRef.current ? 'grabbing' : 'crosshair' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
      <span className="absolute top-1 left-1 text-white/40 text-[9px] font-mono pointer-events-none">
        MINIMAP
      </span>
    </div>
  );
}
