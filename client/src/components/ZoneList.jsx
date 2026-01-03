import { MapPin, Trash2, Grid3x3 } from "lucide-react";

function ZoneList({ zones, onDeleteZone, loading }) {
  if (zones.length === 0) {
    return (
      <div className="text-center py-8">
        <Grid3x3 className="mx-auto text-secondary mb-3" size={48} />
        <p className="text-secondary">No zones defined yet</p>
        <p className="text-secondary/60 text-sm mt-1">Click "New Zone" to create one</p>
      </div>
    );
  }

  const getZoneSize = (zone) => {
    const width = zone.grid_cells.end.x - zone.grid_cells.start.x + 1;
    const height = zone.grid_cells.end.y - zone.grid_cells.start.y + 1;
    return width * height;
  };

  const getZoneColor = (index) => {
    const colors = [
      "border-blue-500 bg-blue-500/10",
      "border-green-500 bg-green-500/10",
      "border-purple-500 bg-purple-500/10",
      "border-orange-500 bg-orange-500/10",
      "border-pink-500 bg-pink-500/10",
      "border-cyan-500 bg-cyan-500/10",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-3 max-h-[600px] overflow-y-auto">
      {zones.map((zone, index) => (
        <div
          key={zone._id}
          className={`p-4 rounded-lg border-2 ${getZoneColor(index)}`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-accent" />
              <span className="font-semibold">{zone.name}</span>
            </div>
            <button
              onClick={() => onDeleteZone(zone._id)}
              disabled={loading}
              className="text-red-500 hover:text-red-600 transition-colors disabled:opacity-50"
              title="Delete zone"
            >
              <Trash2 size={18} />
            </button>
          </div>

          <div className="text-sm text-secondary space-y-1">
            <div className="flex items-center gap-2">
              <Grid3x3 size={14} />
              <span>
                Start: ({zone.grid_cells.start.x}, {zone.grid_cells.start.y})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Grid3x3 size={14} />
              <span>
                End: ({zone.grid_cells.end.x}, {zone.grid_cells.end.y})
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-primary/20">
              <span className="text-accent font-medium">
                {getZoneSize(zone)} cells
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ZoneList;
