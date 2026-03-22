import PixelCanvas from './PixelCanvas';
import Minimap     from './Minimap';

export default function CanvasArea({ mode, onPixelHover, onSelection, onViewChange, camState, canvasControl }) {
  return (
    <div className="relative flex-1 overflow-hidden flex items-center justify-center bg-[#0d0d0d]">
      <PixelCanvas
        mode={mode}
        onPixelHover={onPixelHover}
        onSelection={onSelection}
        onViewChange={onViewChange}
        controlRef={canvasControl}
      />
      <Minimap
        cam={camState}
        onClick={(gx, gy) => canvasControl.current?.jumpTo(gx, gy)}
      />
    </div>
  );
}
