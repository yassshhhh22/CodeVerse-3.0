import express from "express";
import {
  setVenueThreshold,
  setZoneThreshold,
  getVenueThresholds,
  getZoneThreshold,
} from "../controllers/thresholdController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router({ mergeParams: true });

router.put("/venue", protect, requireAdmin, setVenueThreshold);
router.put("/zone/:zoneId", protect, requireAdmin, setZoneThreshold);
router.get("/venue", protect, getVenueThresholds);
router.get("/zone/:zoneId", protect, getZoneThreshold);

export default router;
