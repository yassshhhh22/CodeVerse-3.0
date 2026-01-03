import express from "express";
import {
  getAlerts,
  getAlertById,
  acknowledgeAlert,
} from "../controllers/alertController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getAlerts);
router.get("/:id", protect, getAlertById);
router.put("/:id/acknowledge", protect, acknowledgeAlert);

export default router;
