import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import compression from "compression";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import { Server } from "socket.io";

import logger from "./config/logger.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import { RATE_LIMIT } from "./constants/index.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import venueRoutes from "./routes/venueRoutes.js";
import zoneRoutes from "./routes/zoneRoutes.js";
import thresholdRoutes from "./routes/thresholdRoutes.js";
import gridRoutes from "./routes/gridRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";

const app = express();
const httpServer = createServer(app);

app.set("trust proxy", 1);

app.use(helmet());
app.use(mongoSanitize());
app.use(hpp());

const limiter = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: RATE_LIMIT.MAX_REQUESTS,
  message: RATE_LIMIT.MESSAGE,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

app.use(compression());

app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.logRequest(req, res, duration);
  });

  next();
});
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/venues", venueRoutes);
app.use("/api/venues/:id/zones", zoneRoutes);
app.use("/api/venues/:id/thresholds", thresholdRoutes);
app.use("/api/venues/:id/grid", gridRoutes);
app.use("/api/venues/:id/analytics", analyticsRoutes);
app.use("/api/alerts", alertRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Crowd Monitoring System API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      auth: "/api/auth",
      users: "/api/users",
      venues: "/api/venues",
      zones: "/api/venues/:id/zones",
      thresholds: "/api/venues/:id/thresholds",
      grid: "/api/venues/:id/grid",
      analytics: "/api/venues/:id/analytics",
      alerts: "/api/alerts",
    },
  });
});

app.use(notFound);
app.use(errorHandler);

export { httpServer };
export default app;
