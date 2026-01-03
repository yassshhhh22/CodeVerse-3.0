import DensityLog from "../models/DensityLog.js";
import Venue from "../models/Venue.js";
import Zone from "../models/Zone.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/helpers.js";
import { HTTP_STATUS } from "../constants/index.js";

export const getVenueAnalytics = asyncHandler(async (req, res, next) => {
  const venueId = req.params.id;
  const { start_date, end_date } = req.query;

  const venue = await Venue.findById(venueId);
  if (!venue) {
    throw ApiError.notFound("Venue not found");
  }

  const filter = { venue_id: venueId, zone_id: null };
  if (start_date && end_date) {
    filter.createdAt = {
      $gte: new Date(start_date),
      $lte: new Date(end_date),
    };
  }

  const logs = await DensityLog.find(filter).sort({ createdAt: -1 });

  const totalLogs = logs.length;
  const avgDensity = totalLogs > 0
    ? logs.reduce((sum, log) => sum + log.avg_density, 0) / totalLogs
    : 0;
  const peakDensity = totalLogs > 0
    ? Math.max(...logs.map(log => log.peak_density))
    : 0;

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, {
      venue_id: venueId,
      venue_name: venue.name,
      logs,
      summary: {
        total_records: totalLogs,
        overall_avg_density: parseFloat(avgDensity.toFixed(2)),
        overall_peak_density: peakDensity,
      },
    }, "Venue analytics fetched successfully")
  );
});

export const getZoneAnalytics = asyncHandler(async (req, res, next) => {
  const { id: venueId, zoneId } = req.params;
  const { start_date, end_date } = req.query;

  const zone = await Zone.findOne({ _id: zoneId, venue_id: venueId });
  if (!zone) {
    throw ApiError.notFound("Zone not found");
  }

  const filter = { venue_id: venueId, zone_id: zoneId };
  if (start_date && end_date) {
    filter.createdAt = {
      $gte: new Date(start_date),
      $lte: new Date(end_date),
    };
  }

  const logs = await DensityLog.find(filter).sort({ createdAt: -1 });

  const totalLogs = logs.length;
  const avgDensity = totalLogs > 0
    ? logs.reduce((sum, log) => sum + log.avg_density, 0) / totalLogs
    : 0;
  const peakDensity = totalLogs > 0
    ? Math.max(...logs.map(log => log.peak_density))
    : 0;

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, {
      zone_id: zoneId,
      zone_name: zone.name,
      logs,
      summary: {
        total_records: totalLogs,
        overall_avg_density: parseFloat(avgDensity.toFixed(2)),
        overall_peak_density: peakDensity,
      },
    }, "Zone analytics fetched successfully")
  );
});

export const getVenueReport = asyncHandler(async (req, res, next) => {
  const venueId = req.params.id;
  const { period } = req.query;

  const venue = await Venue.findById(venueId);
  if (!venue) {
    throw ApiError.notFound("Venue not found");
  }

  let startDate = new Date();
  if (period === "day") {
    startDate.setDate(startDate.getDate() - 1);
  } else if (period === "week") {
    startDate.setDate(startDate.getDate() - 7);
  } else if (period === "month") {
    startDate.setMonth(startDate.getMonth() - 1);
  } else {
    startDate.setDate(startDate.getDate() - 7);
  }

  const venueLogs = await DensityLog.find({
    venue_id: venueId,
    zone_id: null,
    createdAt: { $gte: startDate },
  }).sort({ createdAt: -1 });

  const zoneLogs = await DensityLog.find({
    venue_id: venueId,
    zone_id: { $ne: null },
    createdAt: { $gte: startDate },
  }).populate("zone_id", "name");

  const zoneStats = {};
  zoneLogs.forEach(log => {
    const zoneId = log.zone_id._id.toString();
    const zoneName = log.zone_id.name;
    if (!zoneStats[zoneId]) {
      zoneStats[zoneId] = {
        zone_id: zoneId,
        zone_name: zoneName,
        avg_density: 0,
        peak_density: 0,
        count: 0,
      };
    }
    zoneStats[zoneId].avg_density += log.avg_density;
    zoneStats[zoneId].peak_density = Math.max(zoneStats[zoneId].peak_density, log.peak_density);
    zoneStats[zoneId].count++;
  });

  Object.keys(zoneStats).forEach(zoneId => {
    zoneStats[zoneId].avg_density = parseFloat(
      (zoneStats[zoneId].avg_density / zoneStats[zoneId].count).toFixed(2)
    );
  });

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, {
      venue_id: venueId,
      venue_name: venue.name,
      period,
      venue_summary: {
        total_records: venueLogs.length,
        avg_density: venueLogs.length > 0
          ? parseFloat((venueLogs.reduce((sum, log) => sum + log.avg_density, 0) / venueLogs.length).toFixed(2))
          : 0,
        peak_density: venueLogs.length > 0
          ? Math.max(...venueLogs.map(log => log.peak_density))
          : 0,
      },
      zone_summary: Object.values(zoneStats),
    }, "Venue report generated successfully")
  );
});
