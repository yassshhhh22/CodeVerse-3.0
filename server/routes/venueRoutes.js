import express from "express";
import {
  createVenue,
  getVenues,
  getVenueById,
  updateVenue,
  deleteVenue,
} from "../controllers/venueController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", protect, requireAdmin, createVenue);
router.get("/", protect, getVenues);
router.get("/:id", protect, getVenueById);
router.put("/:id", protect, requireAdmin, updateVenue);
router.delete("/:id", protect, requireAdmin, deleteVenue);

export default router;
