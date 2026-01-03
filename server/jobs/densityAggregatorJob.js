import cron from "node-cron";
import Venue from "../models/Venue.js";
import logger from "../config/logger.js";
import { aggregateHourlyVenueData, aggregateAllZones } from "../services/historicalAggregationService.js";
import { getCurrentHourWindow } from "../utils/timeHelpers.js";

export const startDensityAggregatorJob = () => {
  cron.schedule("0 * * * *", async () => {
    logger.info("Starting hourly density aggregation job");
    
    try {
      const venues = await Venue.find({ status: "active" });
      const timeWindow = getCurrentHourWindow();
      
      for (const venue of venues) {
        try {
          await aggregateHourlyVenueData(venue._id, timeWindow);
          logger.info(`Aggregated venue data for ${venue.camera_id}`);
          
          await aggregateAllZones(venue._id, timeWindow);
          logger.info(`Aggregated zone data for ${venue.camera_id}`);
        } catch (error) {
          logger.error(`Error aggregating data for venue ${venue.camera_id}:`, error);
        }
      }
      
      logger.info("Hourly density aggregation job completed");
    } catch (error) {
      logger.error("Error in density aggregator job:", error);
    }
  });
  
  logger.info("Density aggregator job scheduled (runs every hour)");
};
