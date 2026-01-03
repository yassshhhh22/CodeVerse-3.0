import Venue from "../models/Venue.js";
import logger from "../config/logger.js";

const HEALTH_CHECK_THRESHOLD_SECONDS = 10;
const OFFLINE_THRESHOLD_SECONDS = 60;

const checkCameraHealth = async (venueId) => {
  const venue = await Venue.findById(venueId);
  
  if (!venue) {
    return null;
  }
  
  if (!venue.last_metadata_time) {
    if (venue.status !== "inactive") {
      venue.status = "inactive";
      await venue.save();
      logger.warn(`Venue ${venue.camera_id} marked as inactive: No metadata received yet`);
    }
    return venue;
  }
  
  const now = new Date();
  const timeSinceLastMetadata = (now - venue.last_metadata_time) / 1000;
  
  let newStatus = venue.status;
  
  if (timeSinceLastMetadata > OFFLINE_THRESHOLD_SECONDS) {
    newStatus = "inactive";
  } else if (timeSinceLastMetadata > HEALTH_CHECK_THRESHOLD_SECONDS) {
    newStatus = "data_delayed";
  } else {
    newStatus = "active";
  }
  
  if (newStatus !== venue.status) {
    venue.status = newStatus;
    await venue.save();
    logger.info(`Venue ${venue.camera_id} status changed to: ${newStatus}`);
  }
  
  return venue;
};

const checkAllCamerasHealth = async () => {
  const venues = await Venue.find();
  
  const results = [];
  for (const venue of venues) {
    const result = await checkCameraHealth(venue._id);
    results.push(result);
  }
  
  return results;
};

const updateLastMetadataTime = async (venueId) => {
  const venue = await Venue.findById(venueId);
  
  if (!venue) {
    return null;
  }
  
  venue.last_metadata_time = new Date();
  
  if (venue.status !== "active") {
    venue.status = "active";
  }
  
  await venue.save();
  return venue;
};

export { checkCameraHealth, checkAllCamerasHealth, updateLastMetadataTime };
