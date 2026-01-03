import { body, param, query, validationResult } from "express-validator";
import ApiError from "../utils/ApiError.js";

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw ApiError.badRequest("Validation failed", errors.array());
  }
  next();
};

export const venueValidation = [
  body("camera_id").trim().notEmpty().withMessage("Camera ID is required"),
  body("name").trim().notEmpty().withMessage("Venue name is required"),
  body("frame_width").isInt({ min: 100, max: 7680 }).withMessage("Invalid frame width"),
  body("frame_height").isInt({ min: 100, max: 4320 }).withMessage("Invalid frame height"),
  body("grid_rows").isInt({ min: 5, max: 20 }).withMessage("Grid rows must be between 5 and 20"),
  body("grid_cols").isInt({ min: 5, max: 20 }).withMessage("Grid columns must be between 5 and 20"),
];

export const zoneValidation = [
  body("name").trim().notEmpty().withMessage("Zone name is required"),
  body("grid_cells.start.x").isInt({ min: 0 }).withMessage("Invalid start X coordinate"),
  body("grid_cells.start.y").isInt({ min: 0 }).withMessage("Invalid start Y coordinate"),
  body("grid_cells.end.x").isInt({ min: 0 }).withMessage("Invalid end X coordinate"),
  body("grid_cells.end.y").isInt({ min: 0 }).withMessage("Invalid end Y coordinate"),
];

export const thresholdValidation = [
  body("warning_level").isFloat({ min: 0 }).withMessage("Warning level must be a positive number"),
  body("critical_level").isFloat({ min: 0 }).withMessage("Critical level must be a positive number"),
];

export const idValidation = [
  param("id").isMongoId().withMessage("Invalid ID format"),
];
