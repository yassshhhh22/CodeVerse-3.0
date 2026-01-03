import "dotenv/config";
import app, { httpServer } from "./app.js";
import { connectDB } from "./config/database.js";
import { getLogTimestamp } from "./utils/time.js";
import logger from "./config/logger.js";
import { initializeWebSocket } from "./config/websocket.js";
import { setupCVMetadataHandler } from "./websockets/cvMetadataHandler.js";
import { setupClientSocketHandler } from "./websockets/clientSocketHandler.js";
import { startDensityAggregatorJob } from "./jobs/densityAggregatorJob.js";
import { startCameraHealthCheckJob } from "./jobs/cameraHealthCheckJob.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB(process.env.MONGODB_URI);

    const io = initializeWebSocket(httpServer);

    setupCVMetadataHandler(io);
    setupClientSocketHandler(io);

    startDensityAggregatorJob();
    startCameraHealthCheckJob();

    const server = httpServer.listen(PORT, () => {
      logger.info(`\n${getLogTimestamp()} Server Status:`);
      logger.info(`  - Port: ${PORT}`);
      logger.info(`  - Environment: ${process.env.NODE_ENV || "development"}`);
      logger.info(`  - API Base: http://localhost:${PORT}/api`);
      logger.info(`  - Health Check: http://localhost:${PORT}/health`);
      logger.info(`  - WebSocket: Initialized`);
      logger.info(`  - Background Jobs: Running`);
      logger.info("Server is ready");
    });

    process.on("unhandledRejection", (err) => {
      logger.error(
        `\n${getLogTimestamp()} UNHANDLED REJECTION - Shutting down...`
      );
      logger.error(`Error: ${err.name} - ${err.message}`);
      server.close(() => {
        process.exit(1);
      });
    });

    process.on("SIGTERM", () => {
      logger.info(
        `\n${getLogTimestamp()} SIGTERM received - Shutting down gracefully`
      );
      server.close(() => {
        logger.info(`${getLogTimestamp()} Process terminated`);
      });
    });

    process.on("SIGINT", () => {
      logger.info(`\n${getLogTimestamp()} SIGINT received - Shutting down gracefully`);
      server.close(() => {
        logger.info(`${getLogTimestamp()} Process terminated`);
        process.exit(0);
      });
    });

    return server;
  } catch (error) {
    logger.error(`\n${getLogTimestamp()} Failed to start server:`);
    logger.error(error);
    process.exit(1);
  }
};

startServer();
