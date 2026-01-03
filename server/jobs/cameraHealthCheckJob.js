import cron from "node-cron";
import logger from "../config/logger.js";
import { checkAllCamerasHealth } from "../services/cameraHealthService.js";
import { emitToAll } from "../config/websocket.js";
import { WEBSOCKET_EVENTS } from "../config/constants.js";

export const startCameraHealthCheckJob = () => {
  cron.schedule("*/30 * * * * *", async () => {
    try {
      const results = await checkAllCamerasHealth();
      
      results.forEach(venue => {
        if (venue) {
          emitToAll(WEBSOCKET_EVENTS.VENUE_STATUS_UPDATE, {
            camera_id: venue.camera_id,
            venue_id: venue._id,
            status: venue.status,
            last_metadata_time: venue.last_metadata_time,
          });
        }
      });
    } catch (error) {
      logger.error("Error in camera health check job:", error);
    }
  });
  
  logger.info("Camera health check job scheduled (runs every 30 seconds)");
};
