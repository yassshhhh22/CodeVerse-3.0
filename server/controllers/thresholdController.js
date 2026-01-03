import Threshold from "../models/Threshold.js";
import Venue from "../models/Venue.js";
import Zone from "../models/Zone.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/helpers.js";
import { HTTP_STATUS } from "../constants/index.js";

export const setVenueThreshold = asyncHandler(async (req, res, next) => {
  const { warning_level, critical_level } = req.body;
  const venueId = req.params.id;

  const venue = await Venue.findById(venueId);
  if (!venue) {
    throw ApiError.notFound("Venue not found");
  }

  if (warning_level >= critical_level) {
    throw ApiError.badRequest("Warning level must be less than critical level");
  }

  let threshold = await Threshold.findOne({ venue_id: venueId, zone_id: null });

  if (threshold) {
    threshold.warning_level = warning_level;
    threshold.critical_level = critical_level;
    await threshold.save();
  } else {
    threshold = await Threshold.create({
      venue_id: venueId,
      zone_id: null,
      warning_level,
      critical_level,
    });
  }

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, threshold, "Venue threshold set successfully")
  );
});

export const setZoneThreshold = asyncHandler(async (req, res, next) => {
  const { warning_level, critical_level } = req.body;
  const { id: venueId, zoneId } = req.params;

  const zone = await Zone.findOne({ _id: zoneId, venue_id: venueId });
  if (!zone) {
    throw ApiError.notFound("Zone not found");
  }

  if (warning_level >= critical_level) {
    throw ApiError.badRequest("Warning level must be less than critical level");
  }

  let threshold = await Threshold.findOne({ venue_id: venueId, zone_id: zoneId });

  if (threshold) {
    threshold.warning_level = warning_level;
    threshold.critical_level = critical_level;
    await threshold.save();
  } else {
    threshold = await Threshold.create({
      venue_id: venueId,
      zone_id: zoneId,
      warning_level,
      critical_level,
    });
  }

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, threshold, "Zone threshold set successfully")
  );
});

export const getVenueThresholds = asyncHandler(async (req, res, next) => {
  const venueId = req.params.id;

  const venue = await Venue.findById(venueId);
  if (!venue) {
    throw ApiError.notFound("Venue not found");
  }

  const venueThreshold = await Threshold.findOne({ venue_id: venueId, zone_id: null });
  const zoneThresholds = await Threshold.find({ venue_id: venueId, zone_id: { $ne: null } })
    .populate("zone_id", "name");

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, {
      venue_threshold: venueThreshold,
      zone_thresholds: zoneThresholds,
    }, "Thresholds fetched successfully")
  );
});

export const getZoneThreshold = asyncHandler(async (req, res, next) => {
  const { id: venueId, zoneId } = req.params;

  const threshold = await Threshold.findOne({ venue_id: venueId, zone_id: zoneId })
    .populate("zone_id", "name");

  if (!threshold) {
    throw ApiError.notFound("Zone threshold not found");
  }

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, threshold, "Zone threshold fetched successfully")
  );
});
