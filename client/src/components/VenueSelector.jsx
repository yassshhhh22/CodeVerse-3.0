import { Building2, Camera, CheckCircle, AlertCircle } from "lucide-react";

function VenueSelector({ venues, selectedVenue, onSelectVenue, loading }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "text-green-500";
      case "inactive":
        return "text-red-500";
      case "data_delayed":
        return "text-yellow-500";
      default:
        return "text-secondary";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <CheckCircle size={16} className="text-green-500" />;
      case "inactive":
        return <AlertCircle size={16} className="text-red-500" />;
      case "data_delayed":
        return <AlertCircle size={16} className="text-yellow-500" />;
      default:
        return null;
    }
  };

  if (loading && venues.length === 0) {
    return (
      <div className="bg-surface rounded-lg p-6 border border-primary/20">
        <div className="animate-pulse flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-lg"></div>
          <div className="flex-1">
            <div className="h-4 bg-primary/20 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-primary/20 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (venues.length === 0) {
    return (
      <div className="bg-surface rounded-lg p-6 border border-primary/20 text-center">
        <Building2 className="mx-auto text-secondary mb-3" size={48} />
        <p className="text-secondary">No venues available. Create a venue first.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg p-6 border border-primary/20">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Building2 className="text-accent" size={24} />
        Select Venue
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {venues.map((venue) => (
          <button
            key={venue._id}
            onClick={() => onSelectVenue(venue)}
            className={`
              p-4 rounded-lg border-2 transition-all text-left
              ${
                selectedVenue?._id === venue._id
                  ? "border-accent bg-accent/10"
                  : "border-primary/20 hover:border-accent/50"
              }
            `}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Camera size={20} className="text-accent" />
                <span className="font-semibold">{venue.name}</span>
              </div>
              {getStatusIcon(venue.status)}
            </div>
            
            <div className="text-sm text-secondary space-y-1">
              <div>Camera: {venue.camera_id}</div>
              <div>
                Grid: {venue.grid_cols} × {venue.grid_rows}
              </div>
              <div>
                Resolution: {venue.frame_width} × {venue.frame_height}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className={getStatusColor(venue.status)}>
                  {venue.status.replace("_", " ").toUpperCase()}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default VenueSelector;
