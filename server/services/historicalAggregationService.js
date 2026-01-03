import DensityLog from "../models/DensityLog.js";
import GridDensity from "../models/GridDensity.js";
import Zone from "../models/Zone.js";
import { getZoneDensityFromMatrix } from "./zoneGridService.js";
import { getTotalDensity, getMaxDensity } from "./gridDensityService.js";

const aggregateHourlyVenueData = async (venueId, timeWindow) => {
  const startTime = new Date(Date.now() - 60 * 60 * 1000);
  
  const gridDensities = await GridDensity.find({
    venue_id: venueId,
    timestamp: { $gte: startTime },
  }).lean();
  
  if (gridDensities.length === 0) {
    return null;
  }
  
  let totalDensity = 0;
  let peakDensity = 0;
  let totalDetections = 0;
  
  gridDensities.forEach(gd => {
    const density = getTotalDensity(gd.matrix);
    const maxCell = getMaxDensity(gd.matrix);
    
    totalDensity += density;
    totalDetections += density;
    peakDensity = Math.max(peakDensity, maxCell);
  });
  
  const avgDensity = totalDensity / gridDensities.length;
  
  const densityLog = new DensityLog({
    venue_id: venueId,
    zone_id: null,
    time_window: timeWindow,
    avg_density: parseFloat(avgDensity.toFixed(2)),
    peak_density: peakDensity,
    total_detections: totalDetections,
  });
  
  await densityLog.save();
  
  await GridDensity.deleteMany({
    venue_id: venueId,
    timestamp: { $lt: startTime },
  });
  
  return densityLog;
};

const aggregateHourlyZoneData = async (venueId, zoneId, timeWindow) => {
  const startTime = new Date(Date.now() - 60 * 60 * 1000);
  
  const zone = await Zone.findById(zoneId).lean();
  if (!zone) {
    return null;
  }
  
  const gridDensities = await GridDensity.find({
    venue_id: venueId,
    timestamp: { $gte: startTime },
  }).lean();
  
  if (gridDensities.length === 0) {
    return null;
  }
  
  let totalDensity = 0;
  let peakDensity = 0;
  let totalDetections = 0;
  
  gridDensities.forEach(gd => {
    const zoneDensity = getZoneDensityFromMatrix(gd.matrix, zone);
    
    totalDensity += zoneDensity;
    totalDetections += zoneDensity;
    peakDensity = Math.max(peakDensity, zoneDensity);
  });
  
  const avgDensity = totalDensity / gridDensities.length;
  
  const densityLog = new DensityLog({
    venue_id: venueId,
    zone_id: zoneId,
    time_window: timeWindow,
    avg_density: parseFloat(avgDensity.toFixed(2)),
    peak_density: peakDensity,
    total_detections: totalDetections,
  });
  
  await densityLog.save();
  return densityLog;
};

const aggregateAllZones = async (venueId, timeWindow) => {
  const zones = await Zone.find({ venue_id: venueId }).lean();
  
  const results = [];
  for (const zone of zones) {
    const log = await aggregateHourlyZoneData(venueId, zone._id, timeWindow);
    if (log) {
      results.push(log);
    }
  }
  
  return results;
};

export { aggregateHourlyVenueData, aggregateHourlyZoneData, aggregateAllZones };
