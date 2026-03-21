import { useRef, useEffect, useCallback } from 'react';
import { pixelBuffer, pixelStatus, GRID_SIZE, STATUS } from '../data/pixels';

const MAX_SCALE   = 50;
const GRIDLINE_AT = 8;

function fitScale(canvasW, canvasH) {
  return Math.min(canvasW / GRID_SIZE, canvasH / GRID_SIZE);
}

// ─── Offscreen canvas ─────────────────────────────────────────────────────
let offscreenCanvas = null;
function getOffscreen() {
  if (offscreenCanvas) return offscreenCanvas;
  offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.width  = GRID_SIZE;
  offscreenCanvas.height = GRID_SIZE;
  offscreenCanvas.getContext('2d')
    .putImageData(new ImageData(pixelBuffer, GRID_SIZE, GRID_SIZE), 0, 0);
  return offscreenCanvas;
}

// ─── Component ─────────────────────────────────────────────────────────────
export default function PixelCanvas({
  onPixelHover, onPixelClick, onViewChange, onSelection, controlRef,
  mode = 'view', // 'view' | 'select'
}) {
  const canvasRef   = useRef(null);
  const rafRef      = useRef(null);
  const dragging    = useRef(false);
  const lastMouse   = useRef({ x: 0, y: 0 });
  const cam         = useRef({ scale: 1, offsetX: 0, offsetY: 0 });
  const modeRef     = useRef(mode);

  // Selection state (in grid coords)
  const selStart    = useRef(null);  // { x, y }
  const selEnd      = useRef(null);  // { x, y }
  const isSelecting = useRef(false);

  // Keep modeRef in sync without recreating callbacks
  useEffect(() => { modeRef.current = mode; }, [mode]);

  // ─── Clamp ──────────────────────────────────────────────────────────────
  const clamp = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const fs = fitScale(canvas.width, canvas.height);
    if (cam.current.scale < fs) cam.current.scale = fs;
    const { scale } = cam.current;
    const visW = canvas.width  / scale;
    const visH = canvas.height / scale;
    cam.current.offsetX = visW >= GRID_SIZE
      ? (GRID_SIZE - visW) / 2
      : Math.max(0, Math.min(cam.current.offsetX, GRID_SIZE - visW));
    cam.current.offsetY = visH >= GRID_SIZE
      ? (GRID_SIZE - visH) / 2
      : Math.max(0, Math.min(cam.current.offsetY, GRID_SIZE - visH));
  }, []);

  // ─── Render loop ─────────────────────────────────────────────────────────
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { scale, offsetX, offsetY } = cam.current;
    const W = canvas.width;
    const H = canvas.height;

    ctx.fillStyle = '#0d0d0d';
    ctx.fillRect(0, 0, W, H);

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(getOffscreen(), offsetX, offsetY, W / scale, H / scale, 0, 0, W, H);

    // Grid lines
    if (scale >= GRIDLINE_AT) {
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth   = 0.5;
      const x0 = Math.floor(offsetX), x1 = Math.ceil(offsetX + W / scale);
      const y0 = Math.floor(offsetY), y1 = Math.ceil(offsetY + H / scale);
      ctx.beginPath();
      for (let gx = x0; gx <= x1; gx++) { const sx = (gx - offsetX) * scale; ctx.moveTo(sx, 0); ctx.lineTo(sx, H); }
      for (let gy = y0; gy <= y1; gy++) { const sy = (gy - offsetY) * scale; ctx.moveTo(0, sy); ctx.lineTo(W, sy); }
      ctx.stroke();
    }

    // For-sale highlight
    if (scale >= 16) {
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth   = 1;
      const x0 = Math.max(0, Math.floor(offsetX)), x1 = Math.min(GRID_SIZE - 1, Math.ceil(offsetX + W / scale));
      const y0 = Math.max(0, Math.floor(offsetY)), y1 = Math.min(GRID_SIZE - 1, Math.ceil(offsetY + H / scale));
      for (let gy = y0; gy <= y1; gy++)
        for (let gx = x0; gx <= x1; gx++)
          if (pixelStatus[gy * GRID_SIZE + gx] === STATUS.FOR_SALE) {
            const sx = (gx - offsetX) * scale, sy = (gy - offsetY) * scale;
            ctx.strokeRect(sx + 0.5, sy + 0.5, scale - 1, scale - 1);
          }
    }

    // ─── Selection overlay ───────────────────────────────────────────────
    if (selStart.current && selEnd.current) {
      const gx0 = Math.min(selStart.current.x, selEnd.current.x);
      const gy0 = Math.min(selStart.current.y, selEnd.current.y);
      const gx1 = Math.max(selStart.current.x, selEnd.current.x);
      const gy1 = Math.max(selStart.current.y, selEnd.current.y);

      const sx0 = (gx0 - offsetX) * scale;
      const sy0 = (gy0 - offsetY) * scale;
      const sw  = (gx1 - gx0 + 1) * scale;
      const sh  = (gy1 - gy0 + 1) * scale;

      ctx.fillStyle   = 'rgba(255,255,255,0.08)';
      ctx.fillRect(sx0, sy0, sw, sh);

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth   = 1.5;
      ctx.setLineDash([5, 3]);
      ctx.strokeRect(sx0, sy0, sw, sh);
      ctx.setLineDash([]);

      // Corner label
      const total = (gx1 - gx0 + 1) * (gy1 - gy0 + 1);
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(sx0 + 4, sy0 + 4, 110, 18);
      ctx.fillStyle = '#fff';
      ctx.font      = '11px monospace';
      ctx.fillText(`${gx1 - gx0 + 1}×${gy1 - gy0 + 1}  (${total.toLocaleString()}px)`, sx0 + 8, sy0 + 16);
    }

    rafRef.current = requestAnimationFrame(render);
  }, []);

  // ─── Init & resize ────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    const init = () => {
      canvas.width  = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      cam.current.scale = fitScale(canvas.width, canvas.height);
      clamp();
      onViewChange?.({ ...cam.current, canvasW: canvas.width, canvasH: canvas.height });
    };
    init();
    window.addEventListener('resize', init);
    rafRef.current = requestAnimationFrame(render);
    return () => { window.removeEventListener('resize', init); cancelAnimationFrame(rafRef.current); };
  }, [render, clamp, onViewChange]);

  // ─── Wheel zoom ───────────────────────────────────────────────────────────
  const onWheel = useCallback((e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const rect   = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    const { scale, offsetX, offsetY } = cam.current;
    const newScale = Math.min(MAX_SCALE, scale * factor);
    const gx = mx / scale + offsetX, gy = my / scale + offsetY;
    cam.current.scale   = newScale;
    cam.current.offsetX = gx - mx / newScale;
    cam.current.offsetY = gy - my / newScale;
    clamp();
    onViewChange?.({ ...cam.current, canvasW: canvas.width, canvasH: canvas.height });
  }, [clamp, onViewChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
  }, [onWheel]);

  // ─── Screen → grid ────────────────────────────────────────────────────────
  const toGrid = useCallback((clientX, clientY) => {
    const canvas = canvasRef.current;
    const rect   = canvas.getBoundingClientRect();
    const { scale, offsetX, offsetY } = cam.current;
    return {
      x: Math.max(0, Math.min(GRID_SIZE - 1, Math.floor((clientX - rect.left)  / scale + offsetX))),
      y: Math.max(0, Math.min(GRID_SIZE - 1, Math.floor((clientY - rect.top) / scale + offsetY))),
    };
  }, []);

  // ─── Mouse handlers ───────────────────────────────────────────────────────
  const onMouseDown = useCallback((e) => {
    if (modeRef.current === 'select') {
      isSelecting.current = true;
      const g = toGrid(e.clientX, e.clientY);
      selStart.current = g;
      selEnd.current   = g;
    } else {
      dragging.current  = true;
      lastMouse.current = { x: e.clientX, y: e.clientY };
    }
  }, [toGrid]);

  const onMouseMove = useCallback((e) => {
    const g = toGrid(e.clientX, e.clientY);
    if (g.x >= 0 && g.x < GRID_SIZE && g.y >= 0 && g.y < GRID_SIZE) onPixelHover?.(g);

    if (modeRef.current === 'select') {
      if (isSelecting.current) selEnd.current = g;
      return;
    }

    if (!dragging.current) return;
    cam.current.offsetX -= (e.clientX - lastMouse.current.x) / cam.current.scale;
    cam.current.offsetY -= (e.clientY - lastMouse.current.y) / cam.current.scale;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    clamp();
    const c = canvasRef.current;
    onViewChange?.({ ...cam.current, canvasW: c.width, canvasH: c.height });
  }, [toGrid, clamp, onPixelHover, onViewChange]);

  const onMouseUp = useCallback(() => {
    if (modeRef.current === 'select' && isSelecting.current && selStart.current && selEnd.current) {
      isSelecting.current = false;
      const gx0 = Math.min(selStart.current.x, selEnd.current.x);
      const gy0 = Math.min(selStart.current.y, selEnd.current.y);
      const gx1 = Math.max(selStart.current.x, selEnd.current.x);
      const gy1 = Math.max(selStart.current.y, selEnd.current.y);
      onSelection?.({ x0: gx0, y0: gy0, x1: gx1, y1: gy1 });
    }
    dragging.current = false;
  }, [onSelection]);

  // Clear selection when switching modes
  useEffect(() => {
    if (mode === 'view') {
      selStart.current = null;
      selEnd.current   = null;
    }
  }, [mode]);

  // ─── controlRef ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!controlRef) return;
    controlRef.current = {
      jumpTo(gx, gy) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const { scale } = cam.current;
        cam.current.offsetX = gx - (canvas.width  / scale) / 2;
        cam.current.offsetY = gy - (canvas.height / scale) / 2;
        clamp();
        onViewChange?.({ ...cam.current, canvasW: canvas.width, canvasH: canvas.height });
      },
    };
  }, [controlRef, clamp, onViewChange]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full select-none ${mode === 'select' ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'}`}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    />
  );
}
