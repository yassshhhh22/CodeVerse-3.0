import { useState, useRef, useEffect } from "react";
import { Save, X, Hand, MousePointer } from "lucide-react";

function ZoneDefinition({ venue, zones, isDefiningZone, onSaveZone, onCancelDefine, loading }) {
  const [gridSelection, setGridSelection] = useState({ start: null, end: null });
  const [isSelecting, setIsSelecting] = useState(false);
  const [hoveredCell, setHoveredCell] = useState(null);
  const canvasRef = useRef(null);

  // Fixed grid dimensions like DashboardPage
  const VENUE_WIDTH = 1280;
  const VENUE_HEIGHT = 720;
  const GRID_SIZE = 50;
  const gridRows = GRID_SIZE;
  const gridCols = GRID_SIZE;
  const cellWidth = VENUE_WIDTH / GRID_SIZE;  // 25.6px
  const cellHeight = VENUE_HEIGHT / GRID_SIZE; // 14.4px

  useEffect(() => {
    if (!isDefiningZone) {
      setGridSelection({ start: null, end: null });
    }
  }, [isDefiningZone]);

  const handleMouseDown = (row, col) => {
    if (!isDefiningZone) return;
    setIsSelecting(true);
    setGridSelection({ start: { x: col, y: row }, end: { x: col, y: row } });
  };

  const handleMouseMove = (row, col) => {
    setHoveredCell({ x: col, y: row });
    if (!isDefiningZone || !isSelecting || !gridSelection.start) return;
    setGridSelection({ ...gridSelection, end: { x: col, y: row } });
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
  };

  const getNormalizedSelection = () => {
    if (!gridSelection.start || !gridSelection.end) return null;
    return {
      start: {
        x: Math.min(gridSelection.start.x, gridSelection.end.x),
        y: Math.min(gridSelection.start.y, gridSelection.end.y),
      },
      end: {
        x: Math.max(gridSelection.start.x, gridSelection.end.x),
        y: Math.max(gridSelection.start.y, gridSelection.end.y),
      },
    };
  };

  const isCellInSelection = (row, col) => {
    const normalized = getNormalizedSelection();
    if (!normalized) return false;
    return (
      col >= normalized.start.x &&
      col <= normalized.end.x &&
      row >= normalized.start.y &&
      row <= normalized.end.y
    );
  };

  const isCellInZone = (row, col) => {
    return zones.some((zone) => {
      const { start, end } = zone.grid_cells;
      return col >= start.x && col <= end.x && row >= start.y && row <= end.y;
    });
  };

  const getZoneAtCell = (row, col) => {
    return zones.find((zone) => {
      const { start, end } = zone.grid_cells;
      return col >= start.x && col <= end.x && row >= start.y && row <= end.y;
    });
  };

  const handleSave = () => {
    const normalized = getNormalizedSelection();
    if (normalized) {
      onSaveZone(normalized);
    }
  };

  const handleCancel = () => {
    setGridSelection({ start: null, end: null });
    onCancelDefine();
  };

  const getSelectionSize = () => {
    const normalized = getNormalizedSelection();
    if (!normalized) return null;
    const width = normalized.end.x - normalized.start.x + 1;
    const height = normalized.end.y - normalized.start.y + 1;
    return { width, height, cells: width * height };
  };

  const selectionSize = getSelectionSize();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-secondary">
          <div className="flex items-center gap-2">
            {isDefiningZone ? (
              <>
                <MousePointer size={16} />
                <span>Click and drag to select zone area</span>
              </>
            ) : (
              <>
                <Hand size={16} />
                <span>Viewing mode - Click "New Zone" to define</span>
              </>
            )}
          </div>
          {selectionSize && (
            <div className="px-3 py-1 bg-accent/20 rounded-lg">
              {selectionSize.width} × {selectionSize.height} ({selectionSize.cells} cells)
            </div>
          )}
        </div>
        {isDefiningZone && gridSelection.start && (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              <Save size={18} />
              Save Zone
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <X size={18} />
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Grid Visualization - Fixed like DashboardPage */}
      <div className="relative bg-black/50 rounded-lg p-4 border border-primary/20">
        <div
          className="relative mx-auto"
          style={{ maxWidth: "100%", aspectRatio: "16/9" }}
          onMouseLeave={() => setHoveredCell(null)}
          onMouseUp={handleMouseUp}
        >
          {/* SVG Canvas for Fixed 1280x720 venue */}
          <svg
            viewBox={`0 0 ${VENUE_WIDTH} ${VENUE_HEIGHT}`}
            className="w-full h-full bg-gradient-to-br from-gray-900 to-black rounded-lg"
            style={{ border: "2px solid rgba(79, 140, 255, 0.3)", userSelect: "none" }}
          >
            {/* Grid Cells */}
            {Array.from({ length: gridRows }, (_, row) =>
              Array.from({ length: gridCols }, (_, col) => {
                const inSelection = isCellInSelection(row, col);
                const inZone = isCellInZone(row, col);
                const zone = getZoneAtCell(row, col);
                const isHovered = hoveredCell?.x === col && hoveredCell?.y === row;

                let fillColor = "rgba(0, 0, 0, 0)";
                let strokeColor = "rgba(79, 140, 255, 0.2)";
                let strokeWidth = "0.5";

                if (inSelection) {
                  fillColor = "rgba(255, 193, 7, 0.5)";
                  strokeColor = "rgba(255, 193, 7, 1)";
                  strokeWidth = "1";
                } else if (inZone) {
                  fillColor = "rgba(59, 130, 246, 0.3)";
                  strokeColor = "rgba(59, 130, 246, 1)";
                  strokeWidth = "1";
                } else if (isHovered && isDefiningZone) {
                  fillColor = "rgba(255, 193, 7, 0.2)";
                }

                return (
                  <rect
                    key={`${row}-${col}`}
                    x={col * cellWidth}
                    y={row * cellHeight}
                    width={cellWidth}
                    height={cellHeight}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    onMouseDown={() => handleMouseDown(row, col)}
                    onMouseMove={() => handleMouseMove(row, col)}
                    style={{ cursor: isDefiningZone ? "crosshair" : "default" }}
                  >
                    <title>{zone ? zone.name : `Cell (${col}, ${row})`}</title>
                  </rect>
                );
              })
            )}

            {/* Zone labels */}
            {zones.map((zone) => {
              const centerX = ((zone.grid_cells.start.x + zone.grid_cells.end.x) / 2) * cellWidth + cellWidth / 2;
              const centerY = ((zone.grid_cells.start.y + zone.grid_cells.end.y) / 2) * cellHeight + cellHeight / 2;
              
              return (
                <text
                  key={zone._id}
                  x={centerX}
                  y={centerY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="12"
                  fontWeight="bold"
                  style={{ pointerEvents: "none" }}
                >
                  {zone.name}
                </text>
              );
            })}
          </svg>

          {/* Coordinate Labels */}
          <div className="flex mt-2 text-xs text-secondary justify-center gap-4">
            <div>Grid: {gridCols} × {gridRows} cells</div>
            <div>|</div>
            <div>Venue: {VENUE_WIDTH} × {VENUE_HEIGHT}px</div>
            <div>|</div>
            <div>Cell: {cellWidth.toFixed(1)} × {cellHeight.toFixed(1)}px</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-500/30 border border-blue-500 rounded"></div>
          <span className="text-secondary">Existing Zones</span>
        </div>
        {isDefiningZone && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-accent/50 border border-accent rounded"></div>
            <span className="text-secondary">New Zone Selection</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ZoneDefinition;
