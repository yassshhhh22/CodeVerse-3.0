import Alert from "../models/Alert.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/helpers.js";
import { HTTP_STATUS } from "../constants/index.js";
import { acknowledgeAlert as acknowledgeAlertService } from "../services/alertService.js";
import mongoose from "mongoose";

export const getAlerts = asyncHandler(async (req, res, next) => {
  const { venue_id, zone_id, severity, acknowledged } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter = {};
  if (venue_id) filter.venue_id = venue_id;
  if (zone_id) filter.zone_id = zone_id;
  if (severity) filter.severity = severity;
  if (acknowledged === "true") {
    filter.acknowledged_by = { $ne: null };
  } else if (acknowledged === "false") {
    filter.acknowledged_by = null;
  }

  const alerts = await Alert.find(filter)
    .populate("venue_id", "name camera_id")
    .populate("zone_id", "name")
    .populate("acknowledged_by", "username email")
    .sort({ triggered_at: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Alert.countDocuments(filter);

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, {
      alerts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }, "Alerts fetched successfully")
  );
});

export const getAlertById = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw ApiError.badRequest("Invalid alert ID");
  }

  const alert = await Alert.findById(req.params.id)
    .populate("venue_id", "name camera_id")
    .populate("zone_id", "name")
    .populate("acknowledged_by", "username email");

  if (!alert) {
    throw ApiError.notFound("Alert not found");
  }

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, alert, "Alert fetched successfully")
  );
});

export const acknowledgeAlert = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw ApiError.badRequest("Invalid alert ID");
  }

  const alertId = req.params.id;
  const userId = req.user._id;

  const alert = await acknowledgeAlertService(alertId, userId);

  if (!alert) {
    throw ApiError.notFound("Alert not found");
  }

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, alert, "Alert acknowledged successfully")
  );
});
