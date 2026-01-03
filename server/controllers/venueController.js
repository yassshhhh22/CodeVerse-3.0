import Venue from "../models/Venue.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/helpers.js";
import { HTTP_STATUS, USER_MESSAGES } from "../constants/index.js";

export const createVenue = asyncHandler(async (req, res, next) => {
  const { camera_id, name, frame_width, frame_height, grid_rows, grid_cols } = req.body;

  const existingVenue = await Venue.findOne({ camera_id });
  if (existingVenue) {
    throw ApiError.conflict("Venue with this camera ID already exists");
  }

  const venue = await Venue.create({
    camera_id,
    name,
    frame_width,
    frame_height,
    grid_rows,
    grid_cols,
    created_by: req.user._id,
  });

  res.status(HTTP_STATUS.CREATED).json(
    new ApiResponse(HTTP_STATUS.CREATED, venue, "Venue created successfully")
  );
});

export const getVenues = asyncHandler(async (req, res, next) => {
  const venues = await Venue.find()
    .populate("created_by", "username email")
    .sort({ createdAt: -1 });

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, venues, "Venues fetched successfully")
  );
});

export const getVenueById = asyncHandler(async (req, res, next) => {
  const venue = await Venue.findById(req.params.id)
    .populate("created_by", "username email");

  if (!venue) {
    throw ApiError.notFound("Venue not found");
  }

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, venue, "Venue fetched successfully")
  );
});

export const updateVenue = asyncHandler(async (req, res, next) => {
  const { name, frame_width, frame_height, grid_rows, grid_cols, status } = req.body;

  const venue = await Venue.findById(req.params.id);
  if (!venue) {
    throw ApiError.notFound("Venue not found");
  }

  if (name !== undefined) venue.name = name;
  if (frame_width !== undefined) venue.frame_width = frame_width;
  if (frame_height !== undefined) venue.frame_height = frame_height;
  if (grid_rows !== undefined) venue.grid_rows = grid_rows;
  if (grid_cols !== undefined) venue.grid_cols = grid_cols;
  if (status !== undefined) venue.status = status;

  await venue.save();

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, venue, "Venue updated successfully")
  );
});

export const deleteVenue = asyncHandler(async (req, res, next) => {
  const venue = await Venue.findById(req.params.id);
  if (!venue) {
    throw ApiError.notFound("Venue not found");
  }

  await venue.deleteOne();

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, null, "Venue deleted successfully")
  );
});

// Auto-register venue from CV system
export const autoRegisterVenue = asyncHandler(async (req, res, next) => {
  const { camera_id, name, frame_width, frame_height, grid_rows, grid_cols, status } = req.body;

  // Check if venue already exists
  let venue = await Venue.findOne({ camera_id });

  if (venue) {
    // Update existing venue
    venue.frame_width = frame_width || venue.frame_width;
    venue.frame_height = frame_height || venue.frame_height;
    venue.grid_rows = grid_rows || venue.grid_rows;
    venue.grid_cols = grid_cols || venue.grid_cols;
    venue.status = status || "active";
    venue.last_metadata_time = new Date();
    
    await venue.save();
    
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, venue, "Venue updated successfully")
    );
  } else {
    // Create system user for auto-created venues (or use first admin)
    const User = (await import("../models/User.js")).default;
    const systemUser = await User.findOne({ role: "admin" }).sort({ createdAt: 1 });
    
    if (!systemUser) {
      throw ApiError.badRequest("No admin user found. Please create an admin user first.");
    }

    // Create new venue
    venue = await Venue.create({
      camera_id,
      name: name || `Camera ${camera_id}`,
      frame_width: frame_width || 1280,
      frame_height: frame_height || 720,
      grid_rows: grid_rows || 50,
      grid_cols: grid_cols || 50,
      status: status || "active",
      created_by: systemUser._id,
      last_metadata_time: new Date(),
    });

    res.status(HTTP_STATUS.CREATED).json(
      new ApiResponse(HTTP_STATUS.CREATED, venue, "Venue auto-registered successfully")
    );
  }
});
