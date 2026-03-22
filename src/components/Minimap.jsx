import { useRef, useEffect } from 'react';
import { pixelBuffer, GRID_SIZE } from '../data/pixels';

const MAP_SIZE = 160;

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
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !cam) return;
    const ctx = canvas.getContext('2d');

    // Draw full grid thumbnail
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(getOffscreen(), 0, 0, MAP_SIZE, MAP_SIZE);

    const { scale, offsetX, offsetY, canvasW = 800, canvasH = 600 } = cam;
    const ratio = MAP_SIZE / GRID_SIZE;

    // Visible area in grid units
    const visW = canvasW / scale;
    const visH = canvasH / scale;

    // Viewport rect on the minimap (clamp to minimap bounds)
    const rx = offsetX * ratio;
    const ry = offsetY * ratio;
    const rw = visW    * ratio;
    const rh = visH    * ratio;

    // Dim overlay outside the viewport
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(0,     0,      MAP_SIZE, ry);
    ctx.fillRect(0,     ry + rh, MAP_SIZE, MAP_SIZE - ry - rh);
    ctx.fillRect(0,     ry,      rx,      rh);
    ctx.fillRect(rx + rw, ry,   MAP_SIZE - rx - rw, rh);

    // Viewport border (clamped so the stroke never bleeds outside the canvas)
    ctx.strokeStyle = '#fff';
    ctx.lineWidth   = 1.5;
    const half = 0.75;
    const sx = Math.max(rx, half);
    const sy = Math.max(ry, half);
    const ex = Math.min(rx + rw, MAP_SIZE - half);
    const ey = Math.min(ry + rh, MAP_SIZE - half);
    const MIN = 3; // mínimo visible aunque el zoom sea máximo
    ctx.strokeRect(sx, sy, Math.max(ex - sx, MIN), Math.max(ey - sy, MIN));
  }, [cam]);

  const handleClick = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const gx = ((e.clientX - rect.left)  / MAP_SIZE) * GRID_SIZE;
    const gy = ((e.clientY - rect.top) / MAP_SIZE) * GRID_SIZE;
    onClick?.(gx, gy);
  };

  return (
    <div
      className="absolute bottom-4 right-4 rounded-lg overflow-hidden border border-white/20 shadow-2xl cursor-pointer"
      style={{ width: MAP_SIZE, height: MAP_SIZE }}
    >
      <canvas ref={ref} width={MAP_SIZE} height={MAP_SIZE} onClick={handleClick} />
      <span className="absolute top-1 left-1 text-white/40 text-[9px] font-mono select-none">
        MINIMAP
      </span>
    </div>
  );
}
