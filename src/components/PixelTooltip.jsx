import { getPixelInfo, STATUS_LABEL, STATUS_COLOR } from '../data/pixels';

export default function PixelTooltip({ gridPos }) {
  if (!gridPos) return null;

  const { x, y, color, status, price } = getPixelInfo(gridPos.x, gridPos.y);
  const label      = STATUS_LABEL[status];
  const labelColor = STATUS_COLOR[status];

  return (
    <div className="absolute top-4 left-4 bg-black/80 border border-white/15 rounded-lg px-3 py-2.5
                    text-xs font-mono text-white shadow-xl pointer-events-none select-none
                    backdrop-blur-sm min-w-[160px]">

      {/* Color swatch + coords */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-5 h-5 rounded-sm border border-white/20 flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <span className="text-white/60">
          ({x}, {y})
        </span>
      </div>

      {/* Status badge */}
      <div className="flex items-center gap-1.5 mb-1">
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: labelColor }} />
        <span style={{ color: labelColor }}>{label}</span>
      </div>

      {/* Price */}
      {status === 2 && (
        <div className="text-white/50 mt-1">
          Price: <span className="text-white font-semibold">{price.toFixed(2)} €</span>
        </div>
      )}
      {status === 0 && (
        <div className="text-white/50 mt-1">
          Base price: <span className="text-white">0.99 €</span>
        </div>
      )}
    </div>
  );
}
