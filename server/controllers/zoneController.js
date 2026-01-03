import Zone from "../models/Zone.js";
import Venue from "../models/Venue.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/helpers.js";
import { HTTP_STATUS } from "../constants/index.js";

export const createZone = asyncHandler(async (req, res, next) => {
  const { name, grid_cells } = req.body;
  const venueId = req.params.id;

  const venue = await Venue.findById(venueId);
  if (!venue) {
    throw ApiError.notFound("Venue not found");
  }

  if (grid_cells.start.x > grid_cells.end.x || grid_cells.start.y > grid_cells.end.y) {
    throw ApiError.badRequest("Invalid grid cell coordinates");
  }

  if (grid_cells.end.x >= venue.grid_cols || grid_cells.end.y >= venue.grid_rows) {
    throw ApiError.badRequest("Grid cells exceed venue grid dimensions");
  }

  const zone = await Zone.create({
    venue_id: venueId,
    name,
    grid_cells,
    created_by: req.user._id,
  });

  res.status(HTTP_STATUS.CREATED).json(
    new ApiResponse(HTTP_STATUS.CREATED, zone, "Zone created successfully")
  );
});

export const getZonesByVenue = asyncHandler(async (req, res, next) => {
  const venueId = req.params.id;

  const venue = await Venue.findById(venueId);
  if (!venue) {
    throw ApiError.notFound("Venue not found");
  }

  const zones = await Zone.find({ venue_id: venueId })
    .populate("created_by", "name email")
    .sort({ createdAt: -1 });

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, zones, "Zones fetched successfully")
  );
});

export const getZoneById = asyncHandler(async (req, res, next) => {
  const zone = await Zone.findById(req.params.zoneId)
    .populate("venue_id")
    .populate("created_by", "name email");

  if (!zone) {
    throw ApiError.notFound("Zone not found");
  }

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, zone, "Zone fetched successfully")
  );
});

export const updateZone = asyncHandler(async (req, res, next) => {
  const { name, grid_cells } = req.body;

  const zone = await Zone.findById(req.params.zoneId);
  if (!zone) {
    throw ApiError.notFound("Zone not found");
  }

  if (name) zone.name = name;
  if (grid_cells) {
    const venue = await Venue.findById(zone.venue_id);
    if (grid_cells.end.x >= venue.grid_cols || grid_cells.end.y >= venue.grid_rows) {
      throw ApiError.badRequest("Grid cells exceed venue grid dimensions");
    }
    zone.grid_cells = grid_cells;
  }

  await zone.save();

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, zone, "Zone updated successfully")
  );
});

export const deleteZone = asyncHandler(async (req, res, next) => {
  const zone = await Zone.findById(req.params.zoneId);
  if (!zone) {
    throw ApiError.notFound("Zone not found");
  }

  await zone.deleteOne();

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, null, "Zone deleted successfully")
  );
});
