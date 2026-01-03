import Venue from "../models/Venue.js";
import Zone from "../models/Zone.js";
import logger from "../config/logger.js";
import { calculateGridDensity } from "../services/gridDensityService.js";
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
  const { camera_id, detections, timestamp, detection_count } = metadata;

  logger.info(`Received metadata from ${camera_id}: ${detection_count} detections`);

  const venue = await Venue.findOne({ camera_id });
  if (!venue) {
    logger.error(`Venue not found for camera: ${camera_id}`);
    return;
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

  emitToRoom(`venue_${camera_id}`, WEBSOCKET_EVENTS.GRID_DENSITY_UPDATE, {
    venue_id: venue._id,
    camera_id,
    matrix,
    timestamp,
  });

  emitToRoom(`venue_${camera_id}`, WEBSOCKET_EVENTS.ZONE_DENSITY_UPDATE, {
    venue_id: venue._id,
    camera_id,
    zones: Object.values(zoneDensities),
    timestamp,
  });

  const venueThreshold = await getVenueThreshold(venue._id);
  const totalDensity = matrix.reduce((sum, row) => sum + row.reduce((a, b) => a + b, 0), 0);
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
