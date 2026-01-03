import { Server } from "socket.io";
import logger from "./logger.js";

let io = null;

export const initializeWebSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on("connection", (socket) => {
    logger.info(`WebSocket client connected: ${socket.id}`);

    socket.on("disconnect", (reason) => {
      logger.info(`WebSocket client disconnected: ${socket.id}, reason: ${reason}`);
    });

    socket.on("error", (error) => {
      logger.error(`WebSocket error for client ${socket.id}:`, error);
    });
  });

  logger.info("WebSocket server initialized");
  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("WebSocket not initialized. Call initializeWebSocket first.");
  }
  return io;
};

export const emitToRoom = (room, event, data) => {
  if (!io) {
    logger.error("Cannot emit: WebSocket not initialized");
    return;
  }
  io.to(room).emit(event, data);
};

export const emitToAll = (event, data) => {
  if (!io) {
    logger.error("Cannot emit: WebSocket not initialized");
    return;
  }
  io.emit(event, data);
};
