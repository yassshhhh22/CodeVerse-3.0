import express from "express";
import {
  getGridDensity,
  getZoneDensities,
} from "../controllers/gridController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router({ mergeParams: true });

router.get("/density", protect, getGridDensity);
router.get("/zone-densities", protect, getZoneDensities);

export default router;
