import { useState, useEffect } from "react";
import { AlertTriangle, Save, RefreshCw, Settings, AlertCircle } from "lucide-react";
import { useThresholdStore } from "../store/ThresholdStore";

function ThresholdManager({ venue, zones }) {
  const [venueWarning, setVenueWarning] = useState(25);
  const [venueCritical, setVenueCritical] = useState(40);
  const [zoneThresholds, setZoneThresholds] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const {
    fetchVenueThresholds,
    fetchZoneThreshold,
    setVenueThreshold,
    setZoneThreshold: updateZoneThreshold,
    isLoading,
  } = useThresholdStore();

  // Load existing thresholds when venue changes
  useEffect(() => {
    if (venue?._id) {
      loadThresholds();
    }
  }, [venue?._id]);

  // Initialize zone thresholds when zones change
  useEffect(() => {
    if (zones && zones.length > 0) {
      const initialZoneThresholds = {};
      zones.forEach((zone) => {
        if (!zoneThresholds[zone._id]) {
          initialZoneThresholds[zone._id] = {
            warning_level: 8,
            critical_level: 12,
          };
        }
      });
      setZoneThresholds((prev) => ({ ...prev, ...initialZoneThresholds }));
    }
  }, [zones]);

  const loadThresholds = async () => {
    try {
      setError(null);
      
      // Load venue threshold
      const venueResult = await fetchVenueThresholds(venue._id);
      if (venueResult.success && venueResult.data) {
        setVenueWarning(venueResult.data.warning_level);
        setVenueCritical(venueResult.data.critical_level);
      }

      // Load zone thresholds
      if (zones && zones.length > 0) {
        const zoneThresholdsData = {};
        for (const zone of zones) {
          const zoneResult = await fetchZoneThreshold(venue._id, zone._id);
          if (zoneResult.success && zoneResult.data) {
            zoneThresholdsData[zone._id] = {
              warning_level: zoneResult.data.warning_level,
              critical_level: zoneResult.data.critical_level,
            };
          } else {
            // Default values if not set
            zoneThresholdsData[zone._id] = {
              warning_level: 8,
              critical_level: 12,
            };
          }
        }
        setZoneThresholds(zoneThresholdsData);
      }
    } catch (err) {
      console.error("Error loading thresholds:", err);
      setError("Failed to load current thresholds");
    }
  };

  const handleSaveVenueThreshold = async () => {
    if (!venue?._id) return;

    if (venueWarning >= venueCritical) {
      setError("Warning level must be less than critical level");
      return;
    }

    if (venueWarning < 0 || venueCritical < 0) {
      setError("Threshold values must be positive");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await setVenueThreshold(venue._id, {
        warning_level: venueWarning,
        critical_level: venueCritical,
      });

      if (result.success) {
        setSuccess("Venue threshold updated successfully!");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.message || "Failed to update venue threshold");
      }
    } catch (err) {
      setError(err.message || "Failed to update venue threshold");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveZoneThreshold = async (zoneId) => {
    if (!venue?._id || !zoneId) return;

    const threshold = zoneThresholds[zoneId];
    if (!threshold) return;

    if (threshold.warning_level >= threshold.critical_level) {
      setError("Warning level must be less than critical level");
      return;
    }

    if (threshold.warning_level < 0 || threshold.critical_level < 0) {
      setError("Threshold values must be positive");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await updateZoneThreshold(venue._id, zoneId, {
        warning_level: threshold.warning_level,
        critical_level: threshold.critical_level,
      });

      if (result.success) {
        setSuccess(`Zone threshold updated successfully!`);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.message || "Failed to update zone threshold");
      }
    } catch (err) {
      setError(err.message || "Failed to update zone threshold");
    } finally {
      setSaving(false);
    }
  };

  const updateZoneThresholdValue = (zoneId, field, value) => {
    setZoneThresholds((prev) => ({
      ...prev,
      [zoneId]: {
        ...prev[zoneId],
        [field]: parseInt(value) || 0,
      },
    }));
  };

  if (!venue) {
    return (
      <div className="bg-background/80 backdrop-blur-xl border border-border rounded-xl p-6">
        <div className="text-center text-secondary">
          <Settings size={48} className="mx-auto mb-3 opacity-50" />
          <p>Select a venue to manage thresholds</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="text-red-500" size={20} />
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="text-green-500" size={20} />
          <p className="text-green-500 text-sm">{success}</p>
        </div>
      )}

      {/* Venue Threshold */}
      <div className="bg-background/80 backdrop-blur-xl border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Settings size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Venue Threshold</h3>
            <p className="text-sm text-secondary">
              Overall crowd density limits for {venue.name}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm text-secondary mb-2 block">
              Warning Level (people)
            </label>
            <div className="relative">
              <AlertTriangle
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500"
              />
              <input
                type="number"
                value={venueWarning}
                onChange={(e) => setVenueWarning(parseInt(e.target.value) || 0)}
                className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2 text-sm focus:border-primary focus:outline-none"
                placeholder="e.g., 25"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-secondary mb-2 block">
              Critical Level (people)
            </label>
            <div className="relative">
              <AlertCircle
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500"
              />
              <input
                type="number"
                value={venueCritical}
                onChange={(e) => setVenueCritical(parseInt(e.target.value) || 0)}
                className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2 text-sm focus:border-primary focus:outline-none"
                placeholder="e.g., 40"
                min="0"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveVenueThreshold}
            disabled={saving || isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-background rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            <span className="text-sm font-semibold">Save Venue Threshold</span>
          </button>

          <button
            onClick={loadThresholds}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-background/50 border border-border rounded-lg hover:bg-background transition-all disabled:opacity-50"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            <span className="text-sm">Refresh</span>
          </button>
        </div>
      </div>

      {/* Zone Thresholds */}
      {zones && zones.length > 0 && (
        <div className="bg-background/80 backdrop-blur-xl border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
              <Settings size={20} className="text-accent" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Zone Thresholds</h3>
              <p className="text-sm text-secondary">
                Individual limits for each zone ({zones.length} zones)
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {zones.map((zone) => (
              <div
                key={zone._id}
                className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-accent"></div>
                    <span className="font-semibold">{zone.name}</span>
                  </div>
                  <span className="text-xs text-secondary">
                    Grid: ({zone.grid_cells.start.x},{zone.grid_cells.start.y}) →
                    ({zone.grid_cells.end.x},{zone.grid_cells.end.y})
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs text-secondary mb-1 block">
                      Warning Level
                    </label>
                    <input
                      type="number"
                      value={zoneThresholds[zone._id]?.warning_level || 8}
                      onChange={(e) =>
                        updateZoneThresholdValue(
                          zone._id,
                          "warning_level",
                          e.target.value
                        )
                      }
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"
                      placeholder="8"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-secondary mb-1 block">
                      Critical Level
                    </label>
                    <input
                      type="number"
                      value={zoneThresholds[zone._id]?.critical_level || 12}
                      onChange={(e) =>
                        updateZoneThresholdValue(
                          zone._id,
                          "critical_level",
                          e.target.value
                        )
                      }
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"
                      placeholder="12"
                      min="0"
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleSaveZoneThreshold(zone._id)}
                  disabled={saving || isLoading}
                  className="flex items-center gap-2 px-3 py-1.5 bg-accent/20 border border-accent/30 text-accent rounded-lg hover:bg-accent/30 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  <span>Save Zone</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
        <div className="flex gap-3">
          <AlertCircle size={18} className="text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm text-secondary">
            <p className="mb-2">
              <strong className="text-text">Threshold Guidelines:</strong>
            </p>
            <ul className="space-y-1 text-xs">
              <li>• Warning level must be less than critical level</li>
              <li>• Alerts trigger when density reaches threshold values</li>
              <li>• Zone thresholds are based on people count per zone</li>
              <li>• Venue threshold is total people across all zones</li>
              <li>• Changes take effect immediately for new detections</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThresholdManager;
