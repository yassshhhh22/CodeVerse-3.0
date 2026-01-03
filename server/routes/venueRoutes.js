import express from "express";
import {
  createVenue,
  getVenues,
  getVenueById,
  updateVenue,
  deleteVenue,
  autoRegisterVenue,
} from "../controllers/venueController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Auto-register route (no auth required - for CV system)
router.post("/auto-register", autoRegisterVenue);

router.post("/", protect, requireAdmin, createVenue);
router.get("/", protect, getVenues);
router.get("/:id", protect, getVenueById);
router.put("/:id", protect, requireAdmin, updateVenue);
router.delete("/:id", protect, requireAdmin, deleteVenue);

export default router;
