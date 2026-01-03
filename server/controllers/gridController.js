import Venue from "../models/Venue.js";
import Zone from "../models/Zone.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/helpers.js";
import { HTTP_STATUS } from "../constants/index.js";
import { getLatestGridDensity } from "../services/densityAggregationService.js";
import { getZoneDensityFromMatrix } from "../services/zoneGridService.js";

export const getGridDensity = asyncHandler(async (req, res, next) => {
  const venueId = req.params.id;

  const venue = await Venue.findById(venueId);
  if (!venue) {
    throw ApiError.notFound("Venue not found");
  }

  const latestDensity = await getLatestGridDensity(venueId);

  if (!latestDensity) {
    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, {
        venue_id: venueId,
        matrix: Array(venue.grid_rows).fill(0).map(() => Array(venue.grid_cols).fill(0)),
        timestamp: null,
      }, "No density data available")
    );
  }

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, {
      venue_id: venueId,
      matrix: latestDensity.matrix,
      timestamp: latestDensity.timestamp,
      aggregation_window: latestDensity.aggregation_window,
    }, "Grid density fetched successfully")
  );
});

export const getZoneDensities = asyncHandler(async (req, res, next) => {
  const venueId = req.params.id;

  const venue = await Venue.findById(venueId);
  if (!venue) {
    throw ApiError.notFound("Venue not found");
  }

  const zones = await Zone.find({ venue_id: venueId });
  const latestDensity = await getLatestGridDensity(venueId);

  if (!latestDensity) {
    const emptyZoneDensities = zones.map(zone => ({
      zone_id: zone._id,
      zone_name: zone.name,
      density: 0,
    }));

    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, {
        venue_id: venueId,
        zones: emptyZoneDensities,
        timestamp: null,
      }, "No density data available")
    );
  }

  const zoneDensities = zones.map(zone => ({
    zone_id: zone._id,
    zone_name: zone.name,
    density: getZoneDensityFromMatrix(latestDensity.matrix, zone),
  }));

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, {
      venue_id: venueId,
      zones: zoneDensities,
      timestamp: latestDensity.timestamp,
    }, "Zone densities fetched successfully")
  );
});
