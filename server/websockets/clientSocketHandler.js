import logger from "../config/logger.js";
import { WEBSOCKET_EVENTS } from "../config/constants.js";
import { joinVenueRoom, leaveVenueRoom } from "./roomManager.js";

export const setupClientSocketHandler = (io) => {
  io.on("connection", (socket) => {
    logger.info(`Frontend client connected: ${socket.id}`);

    socket.on(WEBSOCKET_EVENTS.SUBSCRIBE_VENUE, (data) => {
      const { camera_id, user } = data;
      joinVenueRoom(socket, camera_id, user);
      logger.info(`Client ${socket.id} subscribed to venue ${camera_id}`);
    });

    socket.on(WEBSOCKET_EVENTS.UNSUBSCRIBE_VENUE, (data) => {
      const { camera_id } = data;
      leaveVenueRoom(socket, camera_id);
      logger.info(`Client ${socket.id} unsubscribed from venue ${camera_id}`);
    });

    socket.on("disconnect", (reason) => {
      logger.info(`Frontend client disconnected: ${socket.id}, reason: ${reason}`);
    });

    socket.on("error", (error) => {
      logger.error(`Socket error for client ${socket.id}:`, error);
    });
  });
};
