import Threshold from "../models/Threshold.js";

const checkVenueThresholds = (venueDensity, thresholds) => {
  if (!thresholds) {
    return null;
  }
  
  if (venueDensity >= thresholds.critical_level) {
    return {
      severity: "critical",
      threshold_type: "venue",
      density: venueDensity,
      threshold_value: thresholds.critical_level,
    };
  }
  
  if (venueDensity >= thresholds.warning_level) {
    return {
      severity: "warning",
      threshold_type: "venue",
      density: venueDensity,
      threshold_value: thresholds.warning_level,
    };
  }
  
  return null;
};

const checkZoneThresholds = (zoneDensities, zoneThresholds) => {
  const violations = [];
  
  Object.keys(zoneDensities).forEach(zoneId => {
    const zoneDensity = zoneDensities[zoneId];
    const threshold = zoneThresholds.find(
      t => t.zone_id && t.zone_id.toString() === zoneId
    );
    
    if (!threshold) {
      return;
    }
    
    if (zoneDensity.count >= threshold.critical_level) {
      violations.push({
        zone_id: zoneId,
        zone_name: zoneDensity.zone_name,
        severity: "critical",
        threshold_type: "zone",
        density: zoneDensity.count,
        threshold_value: threshold.critical_level,
      });
    } else if (zoneDensity.count >= threshold.warning_level) {
      violations.push({
        zone_id: zoneId,
        zone_name: zoneDensity.zone_name,
        severity: "warning",
        threshold_type: "zone",
        density: zoneDensity.count,
        threshold_value: threshold.warning_level,
      });
    }
  });
  
  return violations;
};

const getVenueThreshold = async (venueId) => {
  return await Threshold.findOne({ venue_id: venueId, zone_id: null }).lean();
};

const getZoneThresholds = async (venueId) => {
  return await Threshold.find({ venue_id: venueId, zone_id: { $ne: null } }).lean();
};

export { checkVenueThresholds, checkZoneThresholds, getVenueThreshold, getZoneThresholds };
