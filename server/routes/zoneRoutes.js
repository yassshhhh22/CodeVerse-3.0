import express from "express";
import {
  createZone,
  getZonesByVenue,
  getZoneById,
  updateZone,
  deleteZone,
} from "../controllers/zoneController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router({ mergeParams: true });

router.post("/", protect, requireAdmin, createZone);
router.get("/", protect, getZonesByVenue);
router.get("/:zoneId", protect, getZoneById);
router.put("/:zoneId", protect, requireAdmin, updateZone);
router.delete("/:zoneId", protect, requireAdmin, deleteZone);

export default router;
