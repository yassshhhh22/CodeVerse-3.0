import logger from "../config/logger.js";

const activeRooms = new Map();

export const joinVenueRoom = (socket, cameraId, user) => {
  const roomName = `venue_${cameraId}`;
  
  socket.join(roomName);
  
  if (!activeRooms.has(roomName)) {
    activeRooms.set(roomName, new Set());
  }
  activeRooms.get(roomName).add(socket.id);
  
  logger.info(`Socket ${socket.id} joined room ${roomName}`);
  
  return roomName;
};

export const leaveVenueRoom = (socket, cameraId) => {
  const roomName = `venue_${cameraId}`;
  
  socket.leave(roomName);
  
  if (activeRooms.has(roomName)) {
    activeRooms.get(roomName).delete(socket.id);
    if (activeRooms.get(roomName).size === 0) {
      activeRooms.delete(roomName);
    }
  }
  
  logger.info(`Socket ${socket.id} left room ${roomName}`);
};

export const leaveAllRooms = (socket) => {
  const rooms = Array.from(socket.rooms);
  rooms.forEach(room => {
    if (room !== socket.id) {
      socket.leave(room);
      if (activeRooms.has(room)) {
        activeRooms.get(room).delete(socket.id);
        if (activeRooms.get(room).size === 0) {
          activeRooms.delete(room);
        }
      }
    }
  });
};

export const getRoomClients = (roomName) => {
  return activeRooms.get(roomName) || new Set();
};

export const getActiveRooms = () => {
  return Array.from(activeRooms.keys());
};
