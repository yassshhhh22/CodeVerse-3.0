import express from "express";
import {
  getVenueAnalytics,
  getZoneAnalytics,
  getVenueReport,
} from "../controllers/analyticsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router({ mergeParams: true });

router.get("/", protect, getVenueAnalytics);
router.get("/zone/:zoneId", protect, getZoneAnalytics);
router.get("/report", protect, getVenueReport);

export default router;
