import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || "http://localhost:5000";

class WebSocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.reconnecting = false;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket?.connected) {
      console.log("✓ WebSocket already connected");
      return this.socket;
    }

    console.log(`🔌 Connecting to WebSocket: ${SOCKET_URL}`);

    this.socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      timeout: 20000,
    });

    // Connection event handlers
    this.socket.on("connect", () => {
      this.connected = true;
      this.reconnecting = false;
      console.log("✓ WebSocket connected:", this.socket.id);
      this.notifyListeners("connection", { status: "connected", id: this.socket.id });
    });

    this.socket.on("disconnect", (reason) => {
      this.connected = false;
      console.log("✗ WebSocket disconnected:", reason);
      this.notifyListeners("connection", { status: "disconnected", reason });
    });

    this.socket.on("connect_error", (error) => {
      console.error("✗ WebSocket connection error:", error.message);
      this.notifyListeners("connection", { status: "error", error: error.message });
    });

    this.socket.on("reconnect_attempt", (attemptNumber) => {
      this.reconnecting = true;
      console.log(`🔄 Reconnection attempt #${attemptNumber}`);
      this.notifyListeners("connection", { status: "reconnecting", attempt: attemptNumber });
    });

    this.socket.on("reconnect", (attemptNumber) => {
      this.reconnecting = false;
      console.log(`✓ Reconnected after ${attemptNumber} attempts`);
      this.notifyListeners("connection", { status: "reconnected", attempts: attemptNumber });
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      console.log("✓ WebSocket disconnected manually");
    }
  }

  subscribeToVenue(cameraId, user = null) {
    if (!this.socket?.connected) {
      console.warn("⚠ Cannot subscribe: WebSocket not connected");
      return false;
    }

    console.log(`📡 Subscribing to venue: ${cameraId}`);
    this.socket.emit("subscribe_venue", {
      camera_id: cameraId,
      user: user || { id: "anonymous" },
    });
    return true;
  }

  unsubscribeFromVenue(cameraId) {
    if (!this.socket?.connected) {
      console.warn("⚠ Cannot unsubscribe: WebSocket not connected");
      return false;
    }

    console.log(`📡 Unsubscribing from venue: ${cameraId}`);
    this.socket.emit("unsubscribe_venue", {
      camera_id: cameraId,
    });
    return true;
  }

  on(event, callback) {
    if (!this.socket) {
      console.warn(`⚠ Cannot listen to ${event}: WebSocket not initialized`);
      return;
    }

    // Store listener reference
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    // Register with socket.io
    this.socket.on(event, callback);
  }

  off(event, callback) {
    if (!this.socket) return;

    // Remove from listeners map
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }

    // Unregister from socket.io
    this.socket.off(event, callback);
  }

  removeAllListeners(event) {
    if (!this.socket) return;

    if (event) {
      this.listeners.delete(event);
      this.socket.off(event);
    } else {
      this.listeners.clear();
      this.socket.removeAllListeners();
    }
  }

  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  isConnected() {
    return this.connected && this.socket?.connected;
  }

  isReconnecting() {
    return this.reconnecting;
  }

  getSocketId() {
    return this.socket?.id || null;
  }
}

// Singleton instance
const websocketService = new WebSocketService();

export default websocketService;
