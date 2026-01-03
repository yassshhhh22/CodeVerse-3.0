import Venue from "../models/Venue.js";
import User from "../models/User.js";
import Zone from "../models/Zone.js";
import DensityLog from "../models/DensityLog.js";
import logger from "../config/logger.js";
import { calculateGridDensity, getTotalDensity, getMaxDensity } from "../services/gridDensityService.js";
import { mapDetectionsToZones } from "../services/zoneGridService.js";
import { saveGridDensity } from "../services/densityAggregationService.js";
import { checkVenueThresholds, checkZoneThresholds, getVenueThreshold, getZoneThresholds } from "../services/thresholdService.js";
import { generateVenueAlert, generateZoneAlert } from "../services/alertService.js";
import { updateLastMetadataTime } from "../services/cameraHealthService.js";
import { emitToRoom } from "../config/websocket.js";
import { WEBSOCKET_EVENTS } from "../config/constants.js";
import { getCurrentAggregationWindow } from "../utils/timeHelpers.js";

export const setupCVMetadataHandler = (io) => {
  io.on("connection", (socket) => {
    logger.info(`CV client attempting connection: ${socket.id}`);

    socket.on(WEBSOCKET_EVENTS.CV_METADATA, async (metadata) => {
      try {
        await handleCVMetadata(metadata);
      } catch (error) {
        logger.error("Error processing CV metadata:", error);
        socket.emit("error", { message: "Failed to process metadata" });
      }
    });
  });
};

const handleCVMetadata = async (metadata) => {
  const { camera_id, detections, timestamp, detection_count, frame_width, frame_height } = metadata;

  logger.info(`Received metadata from ${camera_id}: ${detection_count} detections`);

  // Auto-register venue if it doesn't exist
  let venue = await Venue.findOne({ camera_id });
  
  if (!venue) {
    logger.info(`Auto-registering new venue for camera: ${camera_id}`);
    
    // Get first admin user as creator
    const adminUser = await User.findOne({ role: "admin" }).sort({ createdAt: 1 });
    
    if (!adminUser) {
      logger.error("No admin user found. Cannot auto-register venue.");
      return;
    }

    venue = await Venue.create({
      camera_id,
      name: `Camera ${camera_id}`,
      frame_width: frame_width || 1280,
      frame_height: frame_height || 720,
      grid_rows: 50,
      grid_cols: 50,
      status: "active",
      created_by: adminUser._id,
      last_metadata_time: new Date(),
    });

    logger.info(`✓ Venue auto-registered: ${venue.name} (${venue._id})`);
  }

  await updateLastMetadataTime(venue._id);

  const matrix = calculateGridDensity(
    detections,
    venue.frame_width,
    venue.frame_height,
    venue.grid_rows,
    venue.grid_cols
  );

  const zones = await Zone.find({ venue_id: venue._id });
  const zoneDensities = mapDetectionsToZones(
    detections,
    zones,
    venue.frame_width,
    venue.frame_height,
    venue.grid_rows,
    venue.grid_cols
  );

  const aggregationWindow = getCurrentAggregationWindow();
  await saveGridDensity(venue._id, matrix, aggregationWindow);

  // Store immediate venue analytics
  const totalDensity = getTotalDensity(matrix);
  const peakDensity = getMaxDensity(matrix);
  
  try {
    await DensityLog.findOneAndUpdate(
      { venue_id: venue._id, zone_id: null, time_window: aggregationWindow },
      {
        venue_id: venue._id,
        zone_id: null,
        time_window: aggregationWindow,
        avg_density: totalDensity,
        peak_density: peakDensity,
        total_detections: totalDensity,
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    logger.error(`Error saving venue analytics: ${error.message}`);
  }

  // Store immediate zone analytics
  for (const zoneId in zoneDensities) {
    const zoneDensity = zoneDensities[zoneId];
    try {
      await DensityLog.findOneAndUpdate(
        { venue_id: venue._id, zone_id: zoneDensity.zone_id, time_window: aggregationWindow },
        {
          venue_id: venue._id,
          zone_id: zoneDensity.zone_id,
          time_window: aggregationWindow,
          avg_density: zoneDensity.count,
          peak_density: zoneDensity.count,
          total_detections: zoneDensity.count,
        },
        { upsert: true, new: true }
      );
    } catch (error) {
      logger.error(`Error saving zone analytics for ${zoneDensity.zone_name}: ${error.message}`);
    }
  }

  emitToRoom(`venue_${camera_id}`, WEBSOCKET_EVENTS.GRID_DENSITY_UPDATE, {
    venue_id: venue._id,
    camera_id,
    matrix,
    detections,
    detection_count,
    timestamp,
  });

  emitToRoom(`venue_${camera_id}`, WEBSOCKET_EVENTS.ZONE_DENSITY_UPDATE, {
    venue_id: venue._id,
    camera_id,
    zones: Object.values(zoneDensities),
    timestamp,
  });

  const venueThreshold = await getVenueThreshold(venue._id);
  const venueViolation = checkVenueThresholds(totalDensity, venueThreshold);

  if (venueViolation) {
    const alert = await generateVenueAlert(venue._id, venueViolation, venue.name);
    if (alert) {
      emitToRoom(`venue_${camera_id}`, WEBSOCKET_EVENTS.ALERT_TRIGGERED, alert);
      logger.warn(`Alert generated for venue ${camera_id}: ${venueViolation.severity}`);
    }
  }

  const zoneThresholds = await getZoneThresholds(venue._id);
  const zoneViolations = checkZoneThresholds(zoneDensities, zoneThresholds);

  for (const violation of zoneViolations) {
    const alert = await generateZoneAlert(venue._id, violation);
    if (alert) {
      emitToRoom(`venue_${camera_id}`, WEBSOCKET_EVENTS.ALERT_TRIGGERED, alert);
      logger.warn(`Alert generated for zone ${violation.zone_name}: ${violation.severity}`);
    }
  }
};
